# Agent brief

Given to every implementing agent with its assignment (docs/parallel-work.md). The process: you work alone in your own worktree on your own branch; the coordinator merges it.

You are improving the detail of the "Memory of Civilizations" repo (a three.js WebGPU planet of walkable, realistic 3D historical settlements). You work in your own git worktree of the repo; other agents work in parallel on OTHER settlements, so stay strictly inside your assignment.

READ exactly this, and nothing else unless the work needs it: DESIGN.md §2, §3, §5 and §11, docs/suzhou-method.md (how the reference settlement was made), and your settlements' rows in §7 (not the rest of §7); the dossier(s) docs/settlements/<id>.md of your settlement(s); your settlements' folders and the style file(s) you are assigned. Do NOT read CHANGELOG.md, docs/decisions.md, docs/status-log.md, docs/history.md, other settlements' dossiers or folders, or the vendored three.js (src/vendor); grep them only for one specific thing you need.

GOAL: raise your settlements toward DESIGN's L2/L3 detail: find the crudest, most visible features (plain boxes standing for carved/ornamented things, flat untextured surfaces, missing characteristic elements, empty places) and rebuild them with rich, accurate, well-proportioned detail. Every addition must be historically grounded: research with WebSearch/WebFetch and add what you used (with source links) to the dossier, marking [stated]/[inferred] as the dossiers do. Aim for 3–6 substantial improvements. Nothing crude: no floating parts, no gaps, no coplanar overlapping faces.

STRICT FILE RULES (to avoid merge conflicts with the other agents):
- Edit ONLY: your assigned style directory/directories under src/styles/, your settlements' folders under src/settlements/<id>/, their dossiers docs/settlements/<id>.md, and new test files of your own if useful.
- Do NOT edit src/core/palette.js, src/objects/*, src/engine/*, src/planet/*, src/styles/<anything not assigned>, DESIGN.md, CHANGELOG.md, ASSETS.md, index.html, package.json. Use only materials that already exist in src/core/palette.js (grep it). If you truly need a new material, say so in your final report instead.
- Builders import three.js only via src/core/three.js (tests/worker.test.mjs enforces this).
- Use only CC0/MIT assets (better: none; build procedurally).

TOOLS:
- `node tools/surface-check.mjs <id>` must print "surfaces ok" for each of your settlements.
- `node tools/geo-one.mjs <id>` prints the geometry budget. The guard: tests allow 150 MB / 3000 meshes (tools/geo-budget.mjs); the merge target is at most 140 MB / 2900, and the aim at most 130 / 2600 (each distinct material per plan is a mesh; reuse materials); the real test is the frame in the browser.
- `node tools/plan-check.mjs <id>`, `node tools/walk-check.mjs --sites <id>`, `node tools/view-check.mjs <id>` and `node tools/disc-check.mjs <id>` must pass for each settlement you touch.
- `node --test tests/worker.test.mjs` must pass.
- To look at an element: `node tools/showroom.mjs '<json array of elements>' --style <style> --imports <style> --cam x,y,z --look x,y,z --out shots/<name>.png` then Read the png (renders in ~1–3 min). Elements need their params (see the plan files). Full-scene shots (tools/shot.mjs) take 20+ minutes here; avoid them.
- Long commands: run with a timeout (e.g. `timeout 900 ...`).

COMMITS: commit your work in your worktree (several commits are fine), authored as `git -c user.name="Alex Wang" -c user.email="alex119122114@gmail.com" commit -m "..."`, English messages, NO Co-Authored-By or session trailers. Do NOT push. Do not bump versions or touch CHANGELOG/DESIGN.

FINAL REPORT (your last message): the branch name and commit hashes, a short English list of what you built (one line each), any material you wanted but did not have, and anything you found broken but left alone.

EXTRA RULES (learned from earlier rounds; see also docs/parallel-work.md):
- NEVER run `git stash` (the stash list is shared by all worktrees and another process may pop yours). Commit WIP instead.
- Shared styles are OFF-LIMITS even if your settlement uses them (src/styles/vernacular, ming, chinese, roman, song, greek, islamic, byzantine, and anything under src/objects) — unless your assignment names you as that style's owner for this assignment; then you alone edit it, and you run surface-check on every other settlement that imports it.
- Several agents may share one settlement, each owning named files of its folder (landmark: plan.js, index.js and the style; townscape: layout.js, town.js, ground.js; life: movers/fauna/smoke/shops data, interiors, music.js). Touch only yours.
- The bar is docs/suzhou-method.md §7: work through its order (§1) for your part.
- The machine (8 GB) is shared by ~15 agents: run surface-check/showroom one at a time, never several in parallel. If a run is OOM-killed, retry later.
- tools/showroom.mjs: --inplace (keeps positions), --ground <y>|off, --timeout, game lighting by default (--light simple for 3 s renders), 68° FOV, any list size, and --site <id> --arrival | --at x,y,z,yaw,pitch for real in-game views (2–4 min). surface-check is fast now and reports elements that fail to build. tools/plan-check.mjs <id> checks walkability from the arrival point.
- Checks are light for you: per settlement touched, surface-check, plan-check, `node tools/walk-check.mjs --sites <id>`, view-check, disc-check and geo-one, and the worker test; one or two showroom renders at most. The heavy suite (tests/planet.test.mjs and the rest) runs in CI after the coordinator pushes; do not run it yourself.
- The goal of the work is given in your assignment.
