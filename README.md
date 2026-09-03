# Draft Order Kahoot

A Kahoot quiz that decides our **draft order selection order** - the order in
which managers choose their draft slot. Not the draft order itself.

Final leaderboard = selection order. No lottery, no appeals.

## Who picks when

- **Steve Shuldman picks first, by rule.** He completed the Waffle House
  challenge, so MAGA MARALAGO awards him the first selection. He can take any slot he wants -
  including a middle one.
- **The Kahoot decides selections 2 through 12** for the other eleven managers.

Worth saying out loud before the quiz: slot 1 is not automatically the prize.
If you are carrying two keepers at first- and second-round cost, pick 1.01 is
nearly worthless and a middle slot with better snake position is the real win.
That is the whole reason this is a selection order.

## How it works

`questions/<year>.yaml` is the source of truth. Claude reads it and builds the
Kahoot through the Kahoot MCP. Edit the YAML, never the Kahoot web editor —
that way next year starts from this year's bank instead of a blank page.

```
questions/2026.yaml    the question bank, tagged by category
scripts/validate.mjs   checks Kahoot's hard limits before we build
history/               final standings from each year's quiz
```

```bash
node scripts/validate.mjs questions/2026.yaml
```

## Question mix

Deliberately balanced so the biggest football nerd can't win it every year:

| category     | count | why it's in here |
|--------------|-------|------------------|
| `league`     | 8     | our own history — un-Googleable, rewards paying attention |
| `nfl`        | 6     | the actual football-knowledge component |
| `estimation` | 4     | numeric ranges; levels the field |
| `lewes`      | 5     | local knowledge, nobody has an edge |
| `popculture` | 3     | curveballs |

## Draft night checklist

Two Kahoot settings are **not** controllable from the MCP. Set them by hand in
the web editor / game lobby before you start:

- [ ] **Answer streak bonus → OFF.** On by default. It compounds an early lead
      and makes the back half of the quiz meaningless. Off keeps the field tight.
- [ ] **Show questions and answers on players' devices → ON.** This is the fix
      for our mixed in-person/remote setup — remote players read the question on
      their own phone instead of fighting screenshare lag. Without it, anyone on
      the video call is systematically a second behind, which is not a fair way
      to hand out the #1 pick.
- [ ] **Shuldman should host, not play.** His slot is locked by MARALAGO, so his
      score is meaningless - and Kahoot's host runs the question screen without
      competing. The one person with nothing at stake is the natural host.
- [ ] Confirm your plan allows **12 concurrent players**. Kahoot's free-tier caps
      have moved around; find out now, not at kickoff.
- [ ] Announce up front that **speed is the tiebreaker**. Two people who both know
      everything get separated by thumbs. Say it before, not after.

## Rules we agreed on

- 25 questions, ~15 minutes.
- Final leaderboard is the selection order for picks 2-12. It is binding.
- Proposed by the reigning champion under MAD DIC DOC. Stands unless a majority
  overrules within 48 hours of the WhatsApp proposal.
- Phones are allowed because the questions are built to be Google-proof —
  league history and local trivia can't be looked up in 15 seconds.
