# Parallel work

How work on this repository is run with many agents at once. The coordinating session follows this; each implementing agent gets `docs/agent-brief.md` plus its assignment. Which settlements go in which batch, and how many agents each gets, is in `docs/batches.md`.

## Roles

- **Coordinator** (one session, Opus, medium effort). Splits the work, writes each assignment, creates the worktrees, merges, runs the heavy checks, pushes, waits for CI, updates `CHANGELOG.md` (one or two sentences a version), the status lines of `DESIGN.md` §10 in place, and `docs/decisions.md` when a real decision was made, surveys in a real browser, and tells the owner after each push. Never leaves a red CI behind.
- **Implementers** (Sonnet, medium effort; low for mechanical jobs such as re-baking or arrival checks). Each works in its own worktree on one assignment: research and dossier first, then code, then the light checks, then commits on its own branch. No pushing, no version bumps, no `CHANGELOG.md` / `DESIGN.md` edits.
- **Hard engine work** (Opus, high effort, as an agent or in the coordinating session): the renderer, lighting and baking, the planet and water, merging and LOD, collision and walking — anything whose cause has to be traced across several files.

## Assignments

- **Set the model on every agent call** (`model: "sonnet"` for implementers, `"opus"` only for hard engine work): an agent started without one runs on the coordinator's model. Set the effort the roles above give.

- Assignments follow `docs/batches.md`: a settlement gets the slots its class and density give, split by files of its folder (landmark / townscape / life); agents never share a file. An agent edits only the files its assignment names, its settlements' style directories under `src/styles/`, their dossiers, and new tests of its own.
- Shared styles (`src/styles/vernacular`, `ming`, `chinese`, `roman`, `song`, `greek`, `islamic`, `byzantine`) and `src/objects/*` are edited, in a batch, only by the one agent the assignment names as their owner; it keeps every other user of them working (surface-check those too). `src/engine/*`, `src/planet/*`, `src/core/palette.js`, `src/planet/arrivals.js` stay with the coordinator (unless the assignment names a line). An agent that needs a change it does not own says so in its report.
- New civilizations, when the owner asks for them, go one per agent: dossier first, then the settlement.

## How many at once

- A batch is about **10** agents (the author's number), plus two research-only dossier agents from B3 on. Raise or lower by what the last batch showed: renders killed for memory, merge conflicts, how long merging took.
- The machine is shared (8 GB). Agents run their checks one at a time and never several renders in parallel.

## Checks: light for agents, heavy for the coordinator

| Check | Who | When |
|---|---|---|
| `node tools/surface-check.mjs <id>` ("surfaces ok") | agent | every settlement touched |
| `node tools/geo-one.mjs <id>` (guard: 150 MB, 3000 meshes) | agent | every settlement touched |
| `node tools/plan-check.mjs <id>` (walkable from the arrival) | agent | every settlement touched |
| `node --test tests/worker.test.mjs` | agent | before finishing |
| `tools/showroom.mjs` renders | agent, sparingly (one or two per task); coordinator for doubtful reports | |
| `node --test tests/planet.test.mjs` (~15 min) | coordinator after merging; agent only if it added rooms or music zones | |
| light bakes (`node tools/bake.mjs --status`, `--stale`) | coordinator, or one bake agent, at the end of a wave | |
| CI on every push | coordinator: wait for the result, read the log if it fails, fix at once | every push |
| browser survey in the owner's Chrome | coordinator | after each wave |

## Merging

1. `git worktree add -b agent/<name> /home/claude/wt/<name> HEAD` and a `node_modules` symlink for each agent.
2. When an agent reports: read the report; merge its branch (`git merge --no-edit agent/<name>`); check that no commit carries a co-author or session trailer; re-run surface-check (and plan-check where rooms or walks changed) for its settlements; run the tests it touched.
3. Push straight to `master` with the version, `CHANGELOG.md` line and, where they changed, the `DESIGN.md` status lines and a line in `docs/decisions.md`; wait for CI. Nothing is appended to `DESIGN.md`: it holds the design as it stands (§11).
4. Remove the worktree and branch; start the next agent in the free slot.
5. If an agent is stopped (server restart), resume it from its transcript; if that fails, start a new agent on the same worktree to finish its uncommitted work.

## Rules learned

- Never `git stash` in a worktree (the stash is shared by all worktrees).
- Agents commit as `Alex Wang <alex119122114@gmail.com>`, English messages, no trailers.
- `tools/showroom.mjs --at` takes yaw and pitch in radians. The showroom draws no baked light (interiors look dark there) and shows plants stacked at each settlement's origin that the game does not draw; judge those in the browser.
- A red CI blocks the deploy: the live site stays on the last green version. Check after every push.
