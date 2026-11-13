# Batches: how the settlements were brought to the Suzhou standard

A record; the plan is done. All 94 settlements stand (v12.0, 2026-11-12). B1–B16 planned the work in batches of about ten implementing agents (Sonnet), each batch with its own coordinator-written assignment.

## How it ran

- **Order.** Phase 0 in the engine first (the 12 km planet with every settlement's class radius; living systems that run on any settlement from its own data; shared styles opened to one owner per batch). B1, the pilot, was the Chinese capitals (Kaifeng, Lin'an, Beijing, Foguang), surveyed in the author's Chrome before going on. B2–B9 deepened the other built settlements by priority (fame and density, closeness to proven work, one style family per batch, one region surveyed together). B10–B16 built the 38 settlements that did not yet exist, from dossiers written beforehand by research-only agents.
- **Slots.** A settlement got agents by class and density (a large dense city three: landmark, townscape, life; a small one, one). Agents on one settlement edited disjoint files of its folder; a shared style (`chinese`, `ming`, `roman`, `vernacular`, `song`, `greek`, `islamic`, `byzantine`, `src/objects/*`) was edited by exactly one named agent per batch.
- **Method.** Each agent worked its part in `docs/suzhou-method.md` order, dossier first, with only the light checks (`surface-check`, `geo-one`, `plan-check`, the worker test) and one or two pictures; the coordinator merged, ran the heavy checks, pushed, and read CI.
- **Release pass.** After the batches every settlement was visited in Chrome on the author's machine, arriving through the map, and fixed where the first view failed; a last pass made ordinary buildings near each arrival enterable and furnished (DESIGN §4.4, §5).

What remains is in DESIGN §10. How agents are run now: `docs/parallel-work.md`.
