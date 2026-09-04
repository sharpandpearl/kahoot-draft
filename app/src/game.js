// Durable Object holding one game's entire state.
// Clients poll /api/state; simpler and far more robust on flaky phone
// networks than websockets, and 12 players at 1.5s is ~8 req/s.

export const PROMPTS = [
  "Shuldman is 19 hours into the Waffle House. Describe his mental state in five words or fewer.",
  "Who takes the Ibanez in 2026, and what is the one-line reason?",
  "Jack has the most playoff appearances and exactly one ring. Explain.",
  "Propose a backronym rule that would absolutely pass at this year's legislative session.",
  "JJ had 1876 points scored against him in 2025. Write his one-sentence eulogy.",
  "Predict the exact moment tonight's draft goes off the rails.",
  "The trophy is called the Roof Condom. Pitch a better name and defend it in one line.",
  "Write the backronym for a rule that bans whatever Jack did to the league this year.",
  "Kofi has two titles in four years. Explain his method without using the word luck.",
  "Name the 2026 Ibanez team before we know who it is. Be specific enough to hurt.",
];

export const WRITE_MS = 30000;   // 30s to answer, enforced server-side

const BLANK = {
  phase: "lobby",   // lobby | write | vote | scores | final
  round: 0,
  deadline: 0,      // epoch ms; answers close after this (+ grace)
  kahoot: [],       // player ids in Kahoot finishing order, 1st first
  players: {},      // id -> {name, joined}
  answers: {},      // "r0" -> { playerId: text }
  votes: {},        // "r0" -> { voterId: [playerId, ...] }
};

export class Game {
  constructor(state) {
    this.state = state;
    this.s = null;
  }

  async load() {
    if (!this.s) {
      const stored = await this.state.storage.get("s");
      // Backfill any field added after this game was first written; without
      // this, arithmetic on a missing field yields NaN and serialises to null.
      this.s = stored ? { ...structuredClone(BLANK), ...stored } : structuredClone(BLANK);
    }
    // A game already mid-round when the timer shipped has no deadline yet.
    if (this.s.phase === "write" && !this.s.deadline) this.s.deadline = Date.now() + WRITE_MS;
    return this.s;
  }
  async save() { await this.state.storage.put("s", this.s); }

  // votes received, across every completed round
  scores() {
    const out = {};
    for (const id of Object.keys(this.s.players)) out[id] = 0;
    for (const key of Object.keys(this.s.votes)) {
      for (const picks of Object.values(this.s.votes[key])) {
        for (const target of picks) if (out[target] !== undefined) out[target] += 100;
      }
    }
    return out;
  }

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "");
    await this.load();
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const json = (o, code = 200) =>
      new Response(JSON.stringify(o), { status: code, headers: { "content-type": "application/json" } });

    if (path === "/join") {
      const name = String(body.name || "").trim().slice(0, 40);
      if (!name) return json({ error: "name required" }, 400);
      // reclaim an existing seat by name so a refresh does not orphan a player
      let id = Object.keys(this.s.players).find((p) => this.s.players[p].name === name);
      if (!id) { id = crypto.randomUUID(); this.s.players[id] = { name, joined: Date.now() }; await this.save(); }
      return json({ id, name });
    }

    if (path === "/answer") {
      const { id, text } = body;
      if (this.s.phase !== "write" || !this.s.players[id]) return json({ error: "not accepting" }, 400);
      // 3s grace covers the round trip of a client auto-submitting on zero
      if (this.s.deadline && Date.now() > this.s.deadline + 3000) return json({ error: "too late" }, 400);
      const key = "r" + this.s.round;
      (this.s.answers[key] ||= {})[id] = String(text || "").trim().slice(0, 200);
      await this.save();
      return json({ ok: true });
    }

    if (path === "/vote") {
      const { id, picks } = body;
      if (this.s.phase !== "vote" || !this.s.players[id]) return json({ error: "not accepting" }, 400);
      const key = "r" + this.s.round;
      const valid = (picks || []).filter((p) => p !== id && this.s.answers[key]?.[p] !== undefined);
      (this.s.votes[key] ||= {})[id] = valid.slice(0, 2);
      await this.save();
      return json({ ok: true });
    }

    if (path === "/host") {
      if (body.key !== "roofcondom") return json({ error: "nope" }, 403);
      const a = body.action;
      if (a === "start")  { this.s.phase = "write"; this.s.deadline = Date.now() + WRITE_MS; }
      if (a === "vote")   { this.s.phase = "vote"; }
      if (a === "scores") { this.s.phase = "scores"; }
      if (a === "next")   {
        if (this.s.round + 1 >= PROMPTS.length) { this.s.phase = "final"; }
        else { this.s.round += 1; this.s.phase = "write"; this.s.deadline = Date.now() + WRITE_MS; }
      }
      if (a === "final")  { this.s.phase = "final"; }
      if (a === "reset")  { this.s = structuredClone(BLANK); }
      if (a === "kick" && body.target) { delete this.s.players[body.target]; }
      if (a === "setkahoot") {
        // ids in finishing order; anything unknown is dropped
        this.s.kahoot = (body.order || []).filter((x) => this.s.players[x]);
      }
      await this.save();
      return json({ ok: true });
    }

    if (path === "/state") {
      const id = url.searchParams.get("id");
      const key = "r" + this.s.round;
      const answers = this.s.answers[key] || {};
      const votes = this.s.votes[key] || {};
      const view = {
        phase: this.s.phase,
        round: this.s.round,
        totalRounds: PROMPTS.length,
        prompt: PROMPTS[this.s.round],
        players: Object.entries(this.s.players).map(([pid, p]) => ({ id: pid, name: p.name })),
        submitted: Object.keys(answers),
        voted: Object.keys(votes),
        you: { answered: answers[id] !== undefined, voted: votes[id] !== undefined, text: answers[id] || "" },
        scores: this.scores(),
        kahoot: this.s.kahoot,
        // ms left, resynced on every poll so client clock skew never matters
        remaining: this.s.phase === "write" ? Math.max(0, (this.s.deadline || 0) - Date.now()) : 0,
      };
      // Answers go out anonymous during voting; authors revealed at scores.
      if (this.s.phase === "vote") {
        view.cards = Object.entries(answers).map(([pid, text]) => ({ id: pid, text, mine: pid === id }));
      }
      if (this.s.phase === "scores" || this.s.phase === "final") {
        const tally = {};
        for (const picks of Object.values(votes)) for (const t of picks) tally[t] = (tally[t] || 0) + 1;
        view.cards = Object.entries(answers)
          .map(([pid, text]) => ({ id: pid, text, author: this.s.players[pid]?.name || "?", votes: tally[pid] || 0 }))
          .sort((x, y) => y.votes - x.votes);
      }
      return json(view);
    }

    return json({ error: "not found" }, 404);
  }
}
