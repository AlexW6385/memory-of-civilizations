# The Suzhou method

Ming Suzhou is the reference settlement: full detail, walkable everywhere, 55–60 fps on the author's M2. This is how it was made and what to watch for, so that every other settlement can be brought to the same standard. Read it with DESIGN.md (§5 detail, §8 budgets); where they differ, DESIGN.md wins.

## 1. Order of work

Each step builds on the one before; do not skip ahead to the visible layers.

1. **Dossier first** (`docs/settlements/<id>.md`). One real place and date (Suzhou: the Humble Administrator's Garden and its streets, c. 1530). Sourced sections, each fact marked [stated] or [inferred]: layout, orientation, buildings, style vocabulary with measurements, ground and water, planting, sky and weather, sound; then, as the place deepens, interiors, smoke, sounds by area, seasons, weathering, animals, shops. Nothing is built that the dossier does not ground.
2. **Layout and ground** (`layout.js`, `ground.js`): radius by size class (DESIGN §4.5), water levels (canals, ponds) as named constants, the climate (`damp`, `waterline`), ground cover. The water level feeds the waterline stain on walls.
3. **The landmark** (`plan.js`): true size, the style's real modules (bay widths, column heights, roof pitches). The garden's halls, galleries, bridges, rockeries and pond.
4. **The townscape** (`town.js`): streets, canals, bridges, houses by type, shops. Varied by rule, never one house repeated.
5. **Planting**: real species of the place and period (Suzhou: willow by the water, camphor, tea, plum, bamboo), at true heights; trees that hide the view from the walk are lifted or moved.
6. **Interiors and objects**: furnished halls, boards and couplets, the goods of each kind of shop.
7. **Living systems** (§4): people, boats, birds, fish, smoke, catkins. Each a settlement system with its data in the settlement's folder.
8. **Surfaces and weather** (§5): weathering, waterline, wet and puddles, seasons, cloth in the wind.
9. **Sound**: by area (water, streets, temple), from the dossier.
10. **Walk it** (§3), then **measure it** (§6). Fix both before calling it done.

## 2. Detail rules that mattered

- **Real modules give realism cheaply.** A hall with the right number of bays (odd: the central bay is the door), the right eave overhang and roof curve reads as real before any ornament.
- **No floating, no gaps, no overlaps.** Everything sits on what holds it up. A path, a terrace or a step that crosses uneven ground must follow the ground's height function or the ground must be levelled under it; a flat slab laid over a mound floats.
- **Layers of time and use**: grime at the foot of walls, rising damp, salts, algae, moss on north faces, rain streaks, a waterline where walls stand in water. Generic, by material kind (`src/engine/materials.js`), so every settlement gets it for free; tune per climate (`damp`), not per wall.
- **Motion makes a place alive**, but each moving thing must be cheap and must not clip: boats keep to lanes and keep their distance, walkers keep to streets, cloth sways about its attachment only.
- **Remove what looks posed.** Static boats placed mid-canal looked wrong once boats moved; moored ones at the banks stay.

## 3. Walkability

Everything visible that looks passable must be passable, and nothing must hold the visitor up in the air.

- **Colliders follow the geometry.** A parapet is cut into pieces that follow the bridge deck, so the underpass stays open. A gate's arch soffit is marked as a downward face (`topField` records `dn`) so it is not taken for a floor.
- **Doors that look open are open.** Odd bays so a post never stands in the middle of a door; `doorBays` for halls entered from the sides; back doors kept free of screens and tables; moon gates cut through gallery walls where the route passes.
- **Check a route, not a point.** Walk the main route through the garden and streets with `tools/walk-check.mjs` and `tools/plan-check.mjs <id>`; every blocked step found so far was a real fault (posts, screens, a table in a doorway, a solid wall where a gate was drawn).
- **Floors in the air**: scan the height field for small raised platforms the visitor could stand on beside a building. Rare; ignore single-cell edges.

## 4. Living systems

`src/engine/systems.js` registers systems with `attach / detach / update`; `systems-list.js` imports each. They attach when the settlement is ready and detach when it unloads. Data per city in `src/settlements/<id>/` (`movers.js`, `fauna.js`, `smoke.js`, `shops.js`).

- **A few instanced draws each, moved on the GPU** (movers: one draw per group of shapes, the walk cycle in the vertex shader; the routing in a worker).
- **Counts by time of day** (Suzhou: 34 walkers by day, 6 at night), drawn within a distance (smoke within 220 m).
- **Keep vertex cost low**: a moving figure is a few hundred triangles, not a detailed statue.

## 5. Surfaces: never compute noise per pixel

The biggest single cost found in Suzhou was procedural noise in the materials: about 15 ms of GPU a frame for Perlin, fractal and cellular noise on every wall, ground and rock pixel. All material noise now comes from baked tiling 3D textures (`src/engine/env.js`):

- `noiseT(p)`: smooth noise, features of about one unit, about −1…1, one lookup;
- `fbmT(p)`: two lookups (the second turned and finer), for fractal noise, its repeat hidden;
- `worleyT(p)`: cellular distance, for pits, specks and clumps.

They are sampled at level 0, so they work inside `If` branches and in vertex shaders. Rules for new materials:

- Use these, never `mx_noise_float`, `mx_fractal_noise_float` or `mx_worley_noise_float` in a fragment shader.
- Effects that only show in some weather (puddles, rain rings, the mirrored sky) go inside a branch on a uniform (`ENV.wet > 0.02`), so dry pixels do not pay for them.
- Fade fine patterns with distance (`detailFade`) and before they alias (`fwidth`).

## 6. Speed

Target (DESIGN §8): 60 fps in a settlement, no frame over 50 ms, ≤ 800 draw calls, ≤ 3 M visible triangles. Suzhou's history shows the limit moves between CPU (draw calls) and GPU (pixels); measure before changing anything.

**What brought Suzhou from ~20 to ~60 fps:**

- **Fewer draws.** Parts merged per material (`mergeParts`), fine detail within 160 m merged per material per 128 m cell (`mergeDetail`; smaller cells made more draws), street life instanced only above 30 000 triangles a shape and merged otherwise, one form of each material (no plain-and-instanced duplicates), view culling of fine copies.
- **Shadows cheap.** Static casters cached in the cascades, which are not refitted on every turn; plants cast from their resting shape; small things only in the first cascade.
- **No `DynamicDrawUsage`** on instance or index buffers: three.js re-uploads them at every draw of every pass. Static buffers with `needsUpdate` when changed.
- **Global uniforms in the render group**, not each object's group.
- **Far settlements as impostors**: a built settlement more than 600 m past its edge shows its far view; sea not drawn under land well above it.
- **Baked noise in materials** (§5).
- **Dynamic resolution** down to 0.75–0.85 when the GPU is the limit.

**How to measure** (in the author's Chrome, Claude in Chrome; headless WebGPU is software and tells nothing):

- `?perf` shows fps, draws, triangles, hitches and switches that turn one group off at a time; `?bench=suzhou` runs a fixed route (pond turn, canal walk, hall turn).
- For a pose: `palace.pose(id, x, y, z, yaw, pitch)`, wait for building and merging to finish (draws stop falling), then turn (hold Q) for 12 s and record frame times: mean fps, p95, frames over 34 ms. A fresh load needs a minute or more before numbers mean anything.
- To find what costs the GPU, time isolated frames (render once, `await device.queue.onSubmittedWorkDone()`, median of ~10) at pixel ratio 1, then hide one group (by mesh name: `merged:`, `flora:`, `life:`, `movers`, `smoke`, the garden) or swap all opaque materials for one plain material, and compare. The absolute numbers are inflated; the differences are what count.
- To find what costs the CPU: draw calls (`renderer.info.render.drawCalls`) and the JavaScript time in the perf panel; ~20 µs a draw.

**Measured shares at the Suzhou pond turn** (GPU, after the fixes): foliage ~5 ms, street life ~4 ms, merged buildings ~3 ms, materials' remaining cost small, smoke and street-life instances negligible.

## 7. Checklist before a settlement is called done

- [ ] Dossier sections for everything built, sourced.
- [ ] Landmark and townscape at true size and module; nothing floating, gapped or overlapping (`tools/surface-check.mjs`).
- [ ] Planting from the dossier, at true heights, not blocking the view from the walk.
- [ ] Living systems attached, counts by time of day, nothing clipping.
- [ ] Weathering, waterline and wet surfaces look right for the climate (`damp`, `waterline` set in `ground.js`).
- [ ] Main routes walked; gates, bridges' underpasses, doors and garden routes all pass.
- [ ] Budget (`tools/geo-one.mjs`): ≤ 45 MB, ≤ 1500 meshes.
- [ ] Measured in Chrome at the densest views: ≥ 55 fps turning, p95 ≤ 25 ms, ≤ 800 draws.
- [ ] No per-pixel procedural noise added; no dynamic buffers.

## 8. Where things are

| What | Where |
|---|---|
| Settlement data | `src/settlements/<id>/` (`layout`, `ground`, `plan`, `town`, `movers`, `fauna`, `smoke`, `shops`) |
| Style vocabulary | `src/styles/<style>/` (Suzhou: `ming`) |
| Materials, weathering, cloth sway | `src/engine/materials.js` |
| Baked noise fields, shared uniforms | `src/engine/env.js` |
| Merging, instancing | `src/engine/merge.js`, `src/core/geom.js` (`GeoBag`), `src/engine/life-instances.js` |
| Systems | `src/engine/systems.js`, `systems-list.js`, `movers*.js`, `fauna.js`, `smoke.js`, `catkins.js`, `flora/phenology.js` |
| Collision, height field | `src/core/collide.js` (`topField`, `inShell`) |
| Loading, far views, precompile | `src/engine/world.js`, `src/engine/renderer.js` |
| Measuring | `src/engine/bench.js`, `?perf`, `tools/walk-check.mjs`, `tools/plan-check.mjs`, `tools/geo-one.mjs` |
