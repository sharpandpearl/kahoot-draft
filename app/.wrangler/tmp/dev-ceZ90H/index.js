var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
import PAGE from "./b08ef702cef8dc633d348a007ab894b04c6b957d-page.html";

// src/game.js
var PROMPTS = [
  "Shuldman is 19 hours into the Waffle House. Describe his mental state in five words or fewer.",
  "Who takes the Ibanez in 2026, and what is the one-line reason?",
  "Jack has the most playoff appearances and exactly one ring. Explain.",
  "Propose a backronym rule that would absolutely pass at this year's legislative session.",
  "JJ had 1876 points scored against him in 2025. Write his one-sentence eulogy.",
  "Predict the exact moment tonight's draft goes off the rails."
];
var BLANK = {
  phase: "lobby",
  // lobby | write | vote | scores | final
  round: 0,
  players: {},
  // id -> {name, joined}
  answers: {},
  // "r0" -> { playerId: text }
  votes: {}
  // "r0" -> { voterId: [playerId, ...] }
};
var Game = class {
  static {
    __name(this, "Game");
  }
  constructor(state) {
    this.state = state;
    this.s = null;
  }
  async load() {
    if (!this.s) this.s = await this.state.storage.get("s") || structuredClone(BLANK);
    return this.s;
  }
  async save() {
    await this.state.storage.put("s", this.s);
  }
  // votes received, across every completed round
  scores() {
    const out = {};
    for (const id of Object.keys(this.s.players)) out[id] = 0;
    for (const key of Object.keys(this.s.votes)) {
      for (const picks of Object.values(this.s.votes[key])) {
        for (const target of picks) if (out[target] !== void 0) out[target] += 100;
      }
    }
    return out;
  }
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "");
    await this.load();
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const json = /* @__PURE__ */ __name((o, code = 200) => new Response(JSON.stringify(o), { status: code, headers: { "content-type": "application/json" } }), "json");
    if (path === "/join") {
      const name = String(body.name || "").trim().slice(0, 40);
      if (!name) return json({ error: "name required" }, 400);
      let id = Object.keys(this.s.players).find((p) => this.s.players[p].name === name);
      if (!id) {
        id = crypto.randomUUID();
        this.s.players[id] = { name, joined: Date.now() };
        await this.save();
      }
      return json({ id, name });
    }
    if (path === "/answer") {
      const { id, text } = body;
      if (this.s.phase !== "write" || !this.s.players[id]) return json({ error: "not accepting" }, 400);
      const key = "r" + this.s.round;
      (this.s.answers[key] ||= {})[id] = String(text || "").trim().slice(0, 200);
      await this.save();
      return json({ ok: true });
    }
    if (path === "/vote") {
      const { id, picks } = body;
      if (this.s.phase !== "vote" || !this.s.players[id]) return json({ error: "not accepting" }, 400);
      const key = "r" + this.s.round;
      const valid = (picks || []).filter((p) => p !== id && this.s.answers[key]?.[p] !== void 0);
      (this.s.votes[key] ||= {})[id] = valid.slice(0, 2);
      await this.save();
      return json({ ok: true });
    }
    if (path === "/host") {
      if (body.key !== "roofcondom") return json({ error: "nope" }, 403);
      const a = body.action;
      if (a === "start") {
        this.s.phase = "write";
      }
      if (a === "vote") {
        this.s.phase = "vote";
      }
      if (a === "scores") {
        this.s.phase = "scores";
      }
      if (a === "next") {
        if (this.s.round + 1 >= PROMPTS.length) {
          this.s.phase = "final";
        } else {
          this.s.round += 1;
          this.s.phase = "write";
        }
      }
      if (a === "final") {
        this.s.phase = "final";
      }
      if (a === "reset") {
        this.s = structuredClone(BLANK);
      }
      if (a === "kick" && body.target) {
        delete this.s.players[body.target];
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
        you: { answered: answers[id] !== void 0, voted: votes[id] !== void 0, text: answers[id] || "" },
        scores: this.scores()
      };
      if (this.s.phase === "vote") {
        view.cards = Object.entries(answers).map(([pid, text]) => ({ id: pid, text, mine: pid === id }));
      }
      if (this.s.phase === "scores" || this.s.phase === "final") {
        const tally = {};
        for (const picks of Object.values(votes)) for (const t of picks) tally[t] = (tally[t] || 0) + 1;
        view.cards = Object.entries(answers).map(([pid, text]) => ({ id: pid, text, author: this.s.players[pid]?.name || "?", votes: tally[pid] || 0 })).sort((x, y) => y.votes - x.votes);
      }
      return json(view);
    }
    return json({ error: "not found" }, 404);
  }
};

// src/index.js
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const id = env.GAME.idFromName("draft-2026");
      return env.GAME.get(id).fetch(request);
    }
    return new Response(PAGE, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};

// ../../Users/kofiw/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../Users/kofiw/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-K3e3tP/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../Users/kofiw/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-K3e3tP/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  Game,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
