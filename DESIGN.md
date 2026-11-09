# Memory of Civilizations — Design

> **This document is the brief for the whole project.** It is written so that an implementing agent can work from it, alone, without further direction from the author. Read it in full before touching anything, follow it, and keep it current and short (§11). If something is unclear, decide in the spirit of §3 and record the decision (§11) — do not stop to ask.

## 1. What this is

**A small planet you can walk and fly over, on which the civilizations of Earth — each a place at a time — stand where they stood, as real, detailed settlements.**

A **civilization** here is a place *and* an era: Tang China and Ming Jiangnan are two; so are Justinian's Constantinople and Ottoman Istanbul, which stand on the same shore. Each is present as a **settlement**: a famous **landmark** built after the real building, with its full interior, and round it the **townscape** of its people and time — the streets, houses, courtyards, markets, gardens, walls, water and fields the landmark actually stood among. The Forbidden City with the hutongs; a Ming garden with the canals and whitewashed houses of Suzhou, and a little way off the Southern Song capital on its lake; the Sainte-Chapelle and Notre-Dame on their island among the timber-framed lanes; Angkor among stilt houses and rice; Machu Picchu among its terraces. The townscape matters as much as the landmark: a visitor should feel what it was to live there, not only to visit the monument.

**Detail is the point.** A settlement is finished only when it bears looking at from a metre away: the coursing of the masonry, the wear on the threshold, the goods in the market, the pots by the well, the laundry in the court, the lamp in the niche, the boats at the quay, the moss on the north wall. §5 is the standard.

The settlements sit on a planet whose continents, oceans and latitudes follow Earth's. Walk out of Rome and the Mediterranean is there; fly east over Persia and India to China; the sun stands higher at Sanchi than in Paris; it is evening in Kyoto while it is morning in Athens. Civilizations of one region stand near each other, roughly in order of age, so that walking from Tang Foguang to Song Kaifeng to Ming Suzhou is a walk through Chinese history. Between regions the land is open — coasts, hills, forest, steppe, desert by latitude and continent — sparse but never blank. The planet is small enough to fly across in a few minutes, and the globe map jumps anywhere at once.

The look is realistic: true proportions, physically based materials, baked global illumination indoors, real sun and sky, a real atmosphere seen from height. Each settlement has music in the manner of its civilization and time.

**Names:** English *Memory of Civilizations*, Chinese 文明的记忆. Repository `AlexW6385/memory-of-civilizations`. **Live site:** https://alexw6385.github.io/memory-of-civilizations/

## 2. What this is NOT

- **Not a note-taking or study app.** No annotations, no loci, no numbered routes, no markers in the world. The map may name a place; nothing in the world carries a label.
- **Not a game.** No objectives, collectibles, puzzles or NPC dialogue.
- **Not a scale model of Earth.** Topology is true (what borders what, which sea lies where, latitude), proportions are not: the planet is some 800 times smaller and crowded regions are magnified and pushed apart (§4.2).
- **Not cartoon, simplified or empty.** Realistic, dense, lived-in.
- **Not invented architecture.** Every landmark follows a specific real building; every townscape follows the documented urban form and house type of its place and period, with sources. Detail is composed in the manner of the sources, never copied from a copyrighted reproduction.
- **Not a product for every device.** Targets the author's own computer (Apple M2, 8 GB) and phone.
- **Not connected** to the author's other projects.

## 3. What to get right, in order

Resolve conflicts in this order, but the first three are near-equals: none is sacrificed wholesale for another.

1. **Detailed and true.** Richness of real detail, in landmark and townscape, to the standard of §5, and all of it traceable to the sources (§6). Thin or generic is the one unacceptable result.
2. **Realistic and beautiful.** Materials, light, shadow, atmosphere as close to real as the web allows. Picture quality on the author's machine never goes down silently (§11).
3. **Smooth.** Aim at 60 fps on the author's machine; 40 is acceptable in the densest interiors, 30 in high flight; never a stall or a hitch. Smoothness is reached by streaming, LOD, instancing, baking, impostors and culling — by engineering, not by removing detail. Only when all of those are exhausted may detail be thinned, and then the far and the small go first, recorded as a decision (§11). Budgets in §8.
4. **Civilizations, not monuments.** Every settlement has a townscape; a bare landmark is unfinished. The set of settlements covers the world's places and eras; nearby civilizations of one region stand together.
5. **Free and quiet.** Walk, fly, look, a map, a clock, a few settings. Nothing else on screen.
6. **Light to start.** The first frame comes fast; the rest streams.

## 4. The planet

### 4.1 Shape, size, movement

- A sphere of **radius 8 km** (circumference ≈ 50 km). Ground is the sphere plus relief (≤ 300 m: hills, a few mountains, coasts). The whole planet is walkable except open water and slopes over ~40°.
- Gravity points to the centre; the walker's "up" is the local normal. Settlements are built on their local tangent plane (flat ground) blended into the sphere at their edge — nothing in a settlement needs to know the world is round.
- **Walk, run, fly.** Walking 2.0 m/s, running 5.2. Hold Space to rise, release to glide down; speed grows with height (9 m/s near the ground, +0.22 per metre up to 120 m/s; with Shift 18, +0.45 per metre up to 240; `src/core/walk.js`), so the ground below reads as a landscape, not a blur. Ceiling ~1.5 km above the ground, high enough to see the curve and the atmosphere.
- **The map is a globe.** The corner map shows the land round you (north up); the large map is the planet itself, turnable, with the settlements marked and named by civilization and date; a click flies you there (fade, load, arrive at the settlement's chosen view of its landmark, §4.4).
- **The clock:** drag to set the hour, let the days run. One global time; what differs by place is the sun (§4.3).

### 4.2 Geography

- **Continents follow Earth's outlines** — Eurasia, Africa, the Americas, Australia, the main islands (Britain, Japan, Java, Sri Lanka, Crete, Sicily, New Zealand) and the main seas (Mediterranean, Red Sea, Persian Gulf, Black Sea, the Sea of Japan, the Caribbean). Simplified to what reads at this scale; nothing smaller than ~200 m across.
- **Regions.** Settlements group by **region** (the Nile valley, Mesopotamia, the Aegean, Latium, the Bosphorus, the Île-de-France, Jiangnan, the Kansai, the Valley of Mexico…). The region is placed at its true latitude and longitude; its settlements stand within ~1–2 km of each other, roughly in order of age along the land, each keeping its real relation to water (Venice on the sea, Istanbul on the strait, Edfu by the Nile, Hangzhou on its lake). Earth is mapped onto the planet through a few mild lenses that magnify the crowded parts of the world (Europe and the Near East, India, East Asia) without bending the continents out of shape; then settlements are pushed apart until every two stand at least `radius_a + radius_b + 2·blend + gap` apart (~640 m), kept on land, holding as close as they can to their mapped true places (`tools/planet-layout.mjs`). Final positions live in `docs/world.md`.
- **Between regions** the land is open country by latitude and continent: tundra, taiga, temperate forest and field, steppe, desert, savanna, rain forest, with the great rivers (Nile, Tigris–Euphrates, Indus, Ganges, Yangtze, Yellow River, Danube, Rhine, Amazon, Mississippi) as water you cannot wade, and coasts with beaches or cliffs. Relief is gentle except for named ranges that frame the geography (Alps, Himalaya, Andes, Zagros, Atlas) as low ridges. This landscape is seen mostly from the air and crossed on foot now and then; it is built for the view — ground material, scattered vegetation, rivers, shoreline, haze, the odd rock or ruin-free hill — not for walking detail. No houses or roads outside settlements, except the roads and fields that join settlements of one region.
- **Oceans** are water with reflection, waves and foam at the shore; not walkable; flyable.

### 4.3 Sun, sky, climate

- **One sun, one date.** The sun's direction at any point follows from that point's latitude, the global hour and a fixed date (the equinox). The day lasts half an hour of real time. Night: moon, stars, the Milky Way, eye adaptation.
- **Atmosphere.** A physically based sky and aerial perspective (Rayleigh + Mie, one model for the whole planet): blue haze over distance, the red limb at dusk, the curve of the horizon and the thin blue rim seen from height.
- **Climate by settlement** drives ground, vegetation, haze and the weather cycle (clear, fair, cloudy, overcast, showers, dust, snow, monsoon), chosen from the real climate of the place; between regions the biome follows latitude and continent. Weather belongs to a region and moves slowly.
- **Baked light** per settlement at its own chosen hour, scaled by the live daylight.

### 4.4 A settlement

A settlement is ~300 × 300 m (larger where the landmark or the urban form needs it — Beijing, Venice, Tenochtitlan, Hangzhou; smaller for a monastery or a village). It holds:

- **The landmark** at true scale, built to its dossier, with its interior.
- **The townscape:** the real urban pattern (grid, organic, canal, walled compound, terraces), the house types of the place and period (plan, storeys, roof, materials), the public spaces (square, market, well, bathhouse, precinct, walls, gates), the gardens, fields or orchards at the edge, the water (quay, canal, pond, river bank), and the plants of the place. Houses are instances of a few sourced types with variation, built from the same style modules as the landmark. Several houses, a shop, a workshop and an inn or the like can be entered and are furnished.
- **Life as objects and sound** (§5): the things of daily use in their places, animals, figures where the dossier describes them, the sounds of the place.
- **Its music**, by zone (inside the landmark, in the streets, at the edge), and ambience.
- **Its own hour for baking,** its climate and its weather set.
- **A boundary** that blends the settlement's ground into the open country over ~30 m, or into the next settlement of its region along a road or a river.
- **Its arrival view:** travelling there from the map sets the visitor down on foot at the place, height and direction from which the landmark is seen best — whole and framed, not cut off, blocked by a wall, stall, tree or column, or seen from too close or too far — at its classic approach where it has one (the Taj Mahal down its water channel, the Opera House across the cove with the Harbour Bridge behind). Each settlement's view is chosen by looking at it and written down in `src/planet/arrivals.js` as [x, y, z, yaw, pitch] in its frame; a new settlement gets its view when it is built, and a view is checked again whenever the settlement changes round it. The automatic choice (`viewpoint`) is only a fallback for a settlement without one.

Two landmarks that stood in one city at one time (Sainte-Chapelle and Notre-Dame; the Forbidden City and the Temple of Heaven) share one settlement.

## 5. The detail standard

What "detailed" means. Every settlement reaches all of this at L3; L1 and L2 are the steps there (levels at the end of this section).

**Surfaces.** Masonry follows the real coursing, block sizes and joints; timber shows its grain, joints and pegs; plaster is uneven and patched; tiles and shingles are laid as they were, with the odd slipped or broken one. Every material responds to light as the real one does (polish, roughness, subsurface in marble and jade, sheen on silk and lacquer, dust on cloth). Weathering and use everywhere they would be: wear on thresholds, steps and handrails; soot over lamps and hearths; damp, moss and lichen on the shady and the wet side; dust in corners; rain streaks under sills; patina on bronze; the darker lower metre of walls along a street.

**Decoration.** The full programme the dossier gives — orders, mouldings, capitals, friezes, reliefs, inscriptions, painted ceilings, mosaics, tiles, screens, lattices, gilding — at the density the real building has, composed in the manner of the sources. Nothing left as a flat colour where the original had pattern.

**Objects of use.** Every room holds the things it was used with: altars and their vessels, thrones, beds, chests, tables and stools, lamps and candles, books and scrolls, looms, pots, tools, weapons, baskets, mats, carpets, hangings, incense, offerings. Streets hold carts, barrels, bales, market stalls with their goods, signs and banners of the period, wells with buckets, troughs, benches, laundry, firewood, nets and boats at water, ladders, ropes, animals (horses, oxen, donkeys, camels, dogs, chickens, pigeons, cats — as figures). Gardens hold the right plants, pots, paths, lanterns, stones, water.

**Light.** Daylight through the real openings; lamps, candles, braziers and hearths where they were, with their warm pools and smoke; coloured light through glass and lattice; dust and incense in beams of sun; reflections on polished floors and water; wet ground after rain.

**Sound.** Music by zone (§4.4) and ambience of the place: wind, water, birds, bells, the market, animals, rain on tiles, the reverberation of each hall measured to its volume and materials.

**Plants.** The species of the place and time, at the right size and spacing, with wind; grass, weeds in cracks, ivy, moss; crops in their fields; trees with real bark and canopy density.

**Figures and life.** Where the dossier describes who was there and what they did, still figures in the right dress may stand in their places (a priest at the altar, a merchant at the stall, a monk in the cloister), kept few and quiet; never animated crowds, never dialogue.

**Scale of care.** Anything within 20 m of a walkable spot must bear a close look; anything within 200 m must read correctly in form, material and colour; beyond that, impostors and simplified shells are allowed as long as the skyline and the colours are right.

**Levels.** Each dossier states the level its settlement has reached.

*Per settlement*
- L1 — landmark at correct plan, section, structure, proportions, walkable, main materials, daylight, music; townscape as street network, house shells of the right type and public spaces; the settlement on the planet with its boundary.
- L2 — landmark's full decorative programme and baked light; townscape with house variation, courtyards, walls, gates, gardens, water, planting; several buildings enterable and furnished; the principal objects of use in place; ambience.
- L3 — the full detail standard of §5: weathering and wear, fine decoration, every room's objects, street life, animals and figures, lamps and coloured light, sound of the place.

*Planet*
- L1 — sphere, continents, oceans, sun by latitude, flight, globe map, streaming, impostors.
- L2 — biomes with vegetation, rivers, coasts, atmosphere, weather regions, roads and fields between a region's settlements.
- L3 — named ranges, seasons, set pieces (monsoon over Angkor, snow on Borgund, dust over Djenné, mist on West Lake).

*Visual*
- L1 — PBR, shadows, GTAO, tone mapping, atmosphere.
- L2 — baked GI, reflections, bloom, wet and worn materials.
- L3 — stained glass, incense haze, candlelit halls, moonlit water, dust in sunbeams.

## 6. The dossiers (archive)

Every settlement is built from a sourced dossier under `docs/settlements/<id>.md` (English; our own notes and references only). Nothing is built without its dossier; reading it should be enough to rebuild the settlement from scratch.

A dossier has three parts:

**Landmark** — the real example (name, place, dates, builders); type and typology; plan with dimensions (overall, each room, wall thicknesses, column spacing, storey heights); section and structure; sequence of spaces and use; materials per surface; decorative programme and where each element belongs; furnishings and objects of use per room; lighting; what is **[stated]** by sources versus **[inferred]** by us.

**Townscape** — the city or village at the chosen date: extent and population; street pattern and widths; block and plot sizes; house types (plan, storeys, roof, materials, courtyards) with at least one documented example each, and their furnishings; public buildings and spaces; walls and gates; water; gardens and fields; vegetation; climate and weather; the street life of the place (trades, markets, animals, vehicles, dress) with sources.

**Sound** — the music of the civilization and period (scales, instruments, forms, where music was heard) and the ambience.

Sources: architectural and urban histories, published plans and surveys, archaeology reports, heritage documentation, scholarly articles, museum collections for objects and dress, Wikipedia for orientation. Drawings and photographs are references to study, never assets to copy.

## 7. The civilizations

**Built:** listed in `src/planet/sites.js` (id, name, era, region, true position), each described in its dossier, `docs/settlements/<id>.md`; where each stands on the planet is in `docs/world.md`. Do not repeat that list here.

A civilization is chosen so that (a) it is a distinct place-and-time, (b) each region has at least one landmark most people know, (c) the planet has no empty continent, (d) the eras of each region stand together, from prehistory to the modern, and (e) sources exist to build it truthfully.

**The set is 100** (the author, 2026-11-09): the 57 built and the 43 below. It is closed: one is added only by taking another out. Three reasons bring a settlement in, and all three count — it shaped history; its form is like no other; or its people and continent would otherwise be missing. The dossier fixes the exact moment and may substitute a better-documented example. When one is built it moves to `sites.js` and is deleted here. Where little stands today (Baghdad, Ye, Linzi, Chang'an, Karakorum) the dossier says plainly what is reconstructed from texts and excavation. For living Indigenous cultures use only what the communities and published heritage documentation share publicly; nothing secret or sacred is depicted.

- **China (11):** Shang — Yinxu, Anyang (c. 1250 BC) · Warring States — Linzi, with the Jixia Academy (c. 320 BC) · Qufu — Confucius's Lu · Qin — Xianyang and the First Emperor's mausoleum (c. 210 BC) · Han Chang'an (c. 100 BC) · Three Kingdoms — Ye, the Bronze Bird Terrace (c. 215) · Tang Chang'an (c. 750) · Dunhuang — the Mogao caves (9th c.) · Shaolin Monastery and Mount Song (Chan) · Southern Tang Jinling (c. 960) · Hakka tulou, Fujian (c. 1710).
- **Japan (1):** Muromachi Kyoto — Ryōan-ji, Ginkaku-ji (Zen, c. 1490).
- **South Asia (4):** Mohenjo-daro (c. 2500 BC) · Ajanta caves (c. 480) · Nalanda (c. 640) · Bhaktapur, Nepal (c. 1700).
- **South-East Asia (3):** Bagan (c. 1200) · Ayutthaya (c. 1650) · a Balinese temple village.
- **Central Asia and the steppe (2):** Timurid Samarkand (c. 1420) · Mongol Karakorum (c. 1254).
- **Western Asia (3):** Çatalhöyük (c. 6500 BC) · Abbasid Baghdad — the Round City of the *Thousand and One Nights*, with Samarra's Great Mosque as the built evidence (c. 800) · Shibam, Hadhramaut (16th c. on).
- **Egypt and Africa (6):** New Kingdom Thebes — Karnak, Luxor, Deir el-Bahari, Deir el-Medina (c. 1250 BC) · Abu Simbel (c. 1250 BC) · Fez (c. 1350) · Dogon villages of the Bandiagara cliff · Benin City (c. 1600) · Zulu uMgungundlovu (1830s).
- **Europe and the Mediterranean (7):** Mycenae (c. 1250 BC) · Delphi (c. 400 BC) · Alexandria — the Museum and Library, the Pharos (c. 250 BC) · Herculaneum — the Villa of the Papyri and the town (AD 79) · Manueline Lisbon (c. 1520) · Vienna (c. 1900) · Bauhaus Dessau (1926). Also, as an extension of the built Athens and not a settlement of its own: the schools — Academy, Lyceum, Painted Stoa, Epicurus' Garden (c. 300 BC).
- **The Americas (3):** Classic Maya Tikal (c. 750) · Haida village, SG̱ang Gwaay (c. 1850) · Brasília (1960).
- **Oceania (3):** Budj Bim — Gunditjmara stone houses and eel traps · Kakadu — the rock shelters of Ubirr · Nan Madol, Pohnpei (c. 1300).

## 8. Performance and budgets

Targets on the author's machine (Apple M2, 8 GB, native resolution, "high"). They are met by engineering (§3); detail is thinned only as the last resort and recorded.

- **Frame:** aim 60 fps in a settlement; ≥ 40 in the densest interior; ≥ 30 in high flight; no frame over 50 ms ever. Visible triangles ≤ 3 M; draw calls ≤ 800; GPU memory ≤ 1.5 GB; three shadow cascades.
- **Start:** first frame ≤ 6 s on a warm cache, ≤ 15 MB transferred; only the start settlement and the planet's base are loaded.
- **Streaming:** settlements load within 700 m of their rim and unload beyond 1300 m (`src/engine/world.js`); a settlement's geometry ≤ 45 MB on the GPU and ≤ 1500 meshes (`tools/geo-budget.mjs`), its data loaded on demand ≤ 25 MB; loading is time-sliced and never costs a frame more than 4 ms. Far settlements are **impostors** (`tools/impostors.mjs` → `data/impostors/`) so the skyline is there from across the sea.
- **Terrain:** chunked quadtree LOD on the sphere, built in workers; ≤ 400 k triangles on screen in flight.
- **Vegetation and objects:** instanced, LOD, culled on the GPU; ≤ 600 k instances on screen.
- **Files:** any committed file ≤ 50 MB, no LFS; repository ≤ 500 MB; baked data under `data/`, loaded on demand.
- **Phone:** the same world at "medium" (half shadow resolution, no GTAO, shorter streaming radius, fewer small objects), ≥ 30 fps.

`tools/budget.mjs` measures the load. Frame times cannot be measured headless (Chromium's WebGPU there is software), so the frame is measured in two ways: `tools/geo-budget.mjs` builds every settlement in Node and counts what memory and upload depend on — vertex data on the GPU, instances, meshes, build time — and `npm test` fails when a settlement exceeds its limits; `?bench` runs a fixed route on the author's machine (Edfu turning, Florence walking, high flight) and reports fps, the worst 5% of frames, JavaScript time, draw calls, triangles, memory and hitches (`src/engine/bench.js`). `?perf` shows a panel with switches that turn one part of the picture off at a time.

## 9. Technical architecture

- **Pure JavaScript, static.** ES modules from GitHub Pages, no build step; three.js WebGPU (its WebGL 2 backend when WebGPU is missing), vendored in `src/vendor/`; Node only for tests, checks and offline baking.
- **Plan is data, look is code.** A settlement is a module under `src/settlements/<id>/`: `index.js`, `layout.js` (where things stand), `plan.js` (the landmark), `town.js` (the townscape), `ground.js` (ground and planting), `music.js`, and where it has them `life.js` or `people.js`. The plans of the first ten landmarks are still in `src/buildings/` (their dossiers in `docs/buildings/`) and are reused by their settlements. Civilization vocabularies are in `src/styles/<civilization>/`, used by landmark and houses alike; shared objects of use, figures and street life in `src/objects/`. The planet is `src/planet/`; the renderer, world streaming, light, sound and flora are `src/engine/`.
- **Renderer:** procedural PBR materials in TSL; cascaded sun shadows with a cache of static casters; GTAO; baked irradiance volumes for interiors (`tools/bake.mjs` → `data/gi/`); atmosphere; bloom; AgX tone mapping; eye adaptation; dynamic resolution and automatic quality. Shaders are shared through uniforms and instanced attributes and compiled before a part shows.
- **Materials and assets:** CC0/MIT only, listed in `ASSETS.md`; no copyrighted models. No photographic textures or scans are used yet; CC0 sets (Poly Haven, ambientCG) may be layered in where they raise the picture.
- **Music:** synthesised in the browser per settlement and zone; small CC0 samples where synthesis cannot reach the timbre.
- **Tools** (`tools/`): `surface-check`, `plan-check`, `walk-check`, `geo-one` and `geo-budget`, `budget`, `load-check`, `audio-check`, `showroom` and `shot` (pictures), `bake`, `impostors`, `planet-layout`. Who runs which, and when, is in `docs/parallel-work.md`.

## 10. Status and next

Replace these lines, never append to them; keep them few.

- v10.20 (2026-11-07): 57 settlements stand on the planet, 44 interiors under baked light. Every civilization first listed is built.
- **The gap is depth.** By their own dossiers 27 of the 57 are still at L1–L2, 14 at L2, 6 at L2–L3, and 10 reach L3 only in parts; none meets §5 throughout.
- **Next:** bring the built settlements to L3 — the lowest and the best known first. New ones come from the 43 of §7 when the author says to start them.
- **Decided, not yet done:** the planet is enlarged so that 100 settlements stand without crowding (`PLANET_RADIUS` in `src/planet/sites.js`, 8 km now; the layout tool finds the size, about 12 km). Settlements of one place at different times (Qin, Han and Tang at Xi'an; the two Romes) stand side by side; a true position within a few hundred metres is not required.
- Open: frame times and jumps are still to be measured on the author's M2.

## 11. Rules

- **This document stays short.** It holds the design as it stands and nothing else: no dated entries, no per-version or per-settlement notes, no account of work done. When a decision changes the design, edit the section it belongs to; its date and reason go in one line in `docs/decisions.md`, and only if it constrains future work. What a version changed goes in `CHANGELOG.md` (one or two plain sentences), a settlement's facts in its dossier. `CHANGELOG.md`, `docs/decisions.md`, `docs/status-log.md` and `docs/history.md` are records: nobody reads them in full for a task; grep them for one thing.
- Dossier first (§6). Every element traces to its dossier.
- Metres; true scale for buildings and townscapes; the planet and open country are compressed.
- No study features, markers, labels in the world. UI: corner map, clock-and-speed card, globe map, language button — nothing else without a recorded decision.
- Budgets (§8) are targets; a change that breaks one is fixed by engineering before merge, and only as a last resort by thinning detail, recorded as a decision.
- Picture quality on the author's machine never goes down silently; a change that lowers it is recorded as a decision.
- Checks: per settlement touched, the surface, geometry and plan checks; pictures of what changed; the heavy checks after merging (`docs/parallel-work.md`).
- Repository text in English; the site UI bilingual, English default. Commits authored as the repository owner, with no AI co-author or session trailers (`CLAUDE.md`).
- Every push to the default branch deploys to GitHub Pages; a red CI is fixed at once. Never push a regression in the picture, a broken walk, or a budget breach. Tag a release (`vMAJOR.MINOR`, with a note and screenshots) for a visible jump in quality or a new settlement.
