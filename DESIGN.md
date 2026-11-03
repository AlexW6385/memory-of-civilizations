# Memory of Civilizations — Design

> **This document is the brief for the whole project.** It is written so that an implementing agent can work from it, alone, indefinitely, without further direction from the author. Read it in full before touching anything, follow it, and keep §13 (status) and §12 (decisions) current. If something is unclear, decide in the spirit of §3 and record the decision in §12 — do not stop to ask.
>
> This is the third brief. The first built a study tool (Knowledge Universe), the second a flat compact city of districts (Memory Palace, v5–v7). This one replaces the second: the world becomes a **small planet**, a civilization is **a place at a time**, each is present as a **settlement** (a landmark *and* its townscape, in depth), and most of the world code is rebuilt. §10 says exactly what is kept.

## 1. What this is

**A small planet you can walk and fly over, on which the civilizations of Earth — each a place at a time — stand where they stood, as real, detailed settlements.**

A **civilization** here is a place *and* an era: Tang China and Ming Jiangnan are two; so are Justinian's Constantinople and Ottoman Istanbul, which stand on the same shore. Each is present as a **settlement**: a famous **landmark** built after the real building, with its full interior, and round it the **townscape** of its people and time — the streets, houses, courtyards, markets, gardens, walls, water and fields the landmark actually stood among. The Forbidden City with the hutongs; a Ming garden with the canals and whitewashed houses of Suzhou, and a little way off the Southern Song capital on its lake; the Sainte-Chapelle and Notre-Dame on their island among the timber-framed lanes; Angkor among stilt houses and rice; Machu Picchu among its terraces. The townscape matters as much as the landmark: a visitor should feel what it was to live there, not only to visit the monument.

**Detail is the point.** A settlement is finished only when it bears looking at from a metre away: the coursing of the masonry, the wear on the threshold, the goods in the market, the pots by the well, the laundry in the court, the lamp in the niche, the boats at the quay, the moss on the north wall. §5 is the standard.

The settlements sit on a planet whose continents, oceans and latitudes follow Earth's. Walk out of Rome and the Mediterranean is there; fly east over Persia and India to China; the sun stands higher at Sanchi than in Paris; it is evening in Kyoto while it is morning in Athens. Civilizations of one region stand near each other, roughly in order of age, so that walking from Tang Foguang to Song Kaifeng to Ming Suzhou is a walk through Chinese history. Between regions the land is open — coasts, hills, forest, steppe, desert by latitude and continent — sparse but never blank. The planet is small enough to fly across in a few minutes, and the globe map jumps anywhere at once.

The look is realistic: true proportions, physically based materials, baked global illumination indoors, real sun and sky, a real atmosphere seen from height. Each settlement has music in the manner of its civilization and time.

The name: the buildings are the memory of civilizations. Nothing more is meant by it — there are no study features (§2).

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
2. **Realistic and beautiful.** Materials, light, shadow, atmosphere as close to real as the web allows. Picture quality on the author's machine never goes down silently (§14).
3. **Smooth.** Aim at 60 fps on the author's machine; 40 is acceptable in the densest interiors, 30 in high flight; never a stall or a hitch. Smoothness is reached by streaming, LOD, instancing, baking, impostors and culling — by engineering, not by removing detail. Only when all of those are exhausted may detail be thinned, and then the far and the small go first, recorded in §12. Budgets in §8.
4. **Civilizations, not monuments.** Every settlement has a townscape; a bare landmark is unfinished. The set of settlements covers the world's places and eras; nearby civilizations of one region stand together.
5. **Free and quiet.** Walk, fly, look, a map, a clock, a few settings. Nothing else on screen.
6. **Light to start.** The first frame comes fast; the rest streams.

## 4. The planet

### 4.1 Shape, size, movement

- A sphere of **radius 8 km** (circumference ≈ 50 km). Ground is the sphere plus relief (≤ 300 m: hills, a few mountains, coasts). The whole planet is walkable except open water and slopes over ~40°.
- Gravity points to the centre; the walker's "up" is the local normal. Settlements are built on their local tangent plane (flat ground, like now) blended into the sphere at their edge — nothing in a settlement needs to know the world is round.
- **Walk, run, fly.** Flight as now (hold Space to rise, release to glide), but speed grows with height: ~9 m/s near the ground, up to ~80 m/s above 400 m, so a crossing from Athens to Kyoto takes about four minutes and the ground below reads as a landscape, not a blur. Ceiling ~1.5 km above the ground, high enough to see the curve and the atmosphere. (As built: up to ~110 m/s aloft, 200 with Shift; `src/core/walk.js`.)
- **The map is a globe.** The corner map shows the land round you (north up, as now); the large map is the planet itself, turnable, with the settlements marked and named by civilization and date; a click flies you there (fade, load, arrive at the landmark's approach).
- **The clock** as now: drag to set the hour, let the days run. One global time; what differs by place is the sun (§4.3).

### 4.2 Geography

- **Continents follow Earth's outlines** — Eurasia, Africa, the Americas, Australia, the main islands (Britain, Japan, Java, Sri Lanka, Crete, Sicily, New Zealand) and the main seas (Mediterranean, Red Sea, Persian Gulf, Black Sea, the Sea of Japan, the Caribbean). Simplified to what reads at this scale; nothing smaller than ~200 m across.
- **Regions.** Settlements group by **region** (the Nile valley, Mesopotamia, the Aegean, Latium, the Bosphorus, the Île-de-France, Jiangnan, the Kansai, the Valley of Mexico…). The region is placed at its true latitude and longitude; its settlements stand within ~1–2 km of each other, roughly in order of age along the land, each keeping its real relation to water (Venice on the sea, Istanbul on the strait, Edfu by the Nile, Hangzhou on its lake). Earth is mapped onto the planet through a few mild lenses that magnify the crowded parts of the world (Europe and the Near East, India, East Asia) without bending the continents out of shape; then settlements are pushed apart until every two stand at least `radius_a + radius_b + 2·blend + gap` apart (~640 m), kept on land, holding as close as they can to their mapped true places (`tools/planet-layout.mjs`). Final positions live in `docs/world.md`.
- **Between regions** the land is open country by latitude and continent: tundra, taiga, temperate forest and field, steppe, desert, savanna, rain forest, with the great rivers (Nile, Tigris–Euphrates, Indus, Ganges, Yangtze, Yellow River, Danube, Rhine, Amazon, Mississippi) as water you cannot wade, and coasts with beaches or cliffs. Relief is gentle except for named ranges that frame the geography (Alps, Himalaya, Andes, Zagros, Atlas) as low ridges. This landscape is seen mostly from the air and crossed on foot now and then; it is built for the view — ground material, scattered vegetation, rivers, shoreline, haze, the odd rock or ruin-free hill — not for walking detail. No houses or roads outside settlements, except the roads and fields that join settlements of one region.
- **Oceans** are water with reflection, waves and foam at the shore; not walkable; flyable.

### 4.3 Sun, sky, climate

- **One sun, one date.** The sun's direction at any point follows from that point's latitude, the global hour and a fixed date (the equinox). The day lasts half an hour of real time. Night: moon, stars, the Milky Way, eye adaptation — as now.
- **Atmosphere.** A physically based sky and aerial perspective (Rayleigh + Mie, one model for the whole planet): blue haze over distance, the red limb at dusk, the curve of the horizon and the thin blue rim seen from height.
- **Climate by settlement** drives ground, vegetation, haze and the weather cycle (clear, fair, cloudy, overcast, showers, dust, snow, monsoon), chosen from the real climate of the place; between regions the biome follows latitude and continent. Weather belongs to a region and moves slowly.
- **Baked light** per settlement at its own chosen hour (as now), scaled by the live daylight; the bake separates sun, sky and lamps when affordable (Phase D).

### 4.4 A settlement

A settlement is ~300 × 300 m (larger where the landmark or the urban form needs it — Beijing, Venice, Tenochtitlan, Hangzhou; smaller for a monastery or a village). It holds:

- **The landmark** at true scale, built to its dossier, with its interior.
- **The townscape:** the real urban pattern (grid, organic, canal, walled compound, terraces), the house types of the place and period (plan, storeys, roof, materials), the public spaces (square, market, well, bathhouse, precinct, walls, gates), the gardens, fields or orchards at the edge, the water (quay, canal, pond, river bank), and the plants of the place. Houses are instances of a few sourced types with variation, built from the same style modules as the landmark. Several houses, a shop, a workshop and an inn or the like can be entered and are furnished.
- **Life as objects and sound** (§5): the things of daily use in their places, animals, figures where the dossier describes them, the sounds of the place.
- **Its music**, by zone (inside the landmark, in the streets, at the edge), and ambience.
- **Its own hour for baking,** its climate and its weather set.
- **A boundary** that blends the settlement's ground into the open country over ~30 m, or into the next settlement of its region along a road or a river.

Two landmarks that stood in one city at one time (Sainte-Chapelle and Notre-Dame; the Forbidden City and the Temple of Heaven) share one settlement.

## 5. The detail standard

What "detailed" means. Every settlement reaches all of this by L3 (§11); L1 and L2 are the steps there.

**Surfaces.** Masonry follows the real coursing, block sizes and joints; timber shows its grain, joints and pegs; plaster is uneven and patched; tiles and shingles are laid as they were, with the odd slipped or broken one. Every material responds to light as the real one does (polish, roughness, subsurface in marble and jade, sheen on silk and lacquer, dust on cloth). Weathering and use everywhere they would be: wear on thresholds, steps and handrails; soot over lamps and hearths; damp, moss and lichen on the shady and the wet side; dust in corners; rain streaks under sills; patina on bronze; the darker lower metre of walls along a street.

**Decoration.** The full programme the dossier gives — orders, mouldings, capitals, friezes, reliefs, inscriptions, painted ceilings, mosaics, tiles, screens, lattices, gilding — at the density the real building has, composed in the manner of the sources. Nothing left as a flat colour where the original had pattern.

**Objects of use.** Every room holds the things it was used with: altars and their vessels, thrones, beds, chests, tables and stools, lamps and candles, books and scrolls, looms, pots, tools, weapons, baskets, mats, carpets, hangings, incense, offerings. Streets hold carts, barrels, bales, market stalls with their goods, signs and banners of the period, wells with buckets, troughs, benches, laundry, firewood, nets and boats at water, ladders, ropes, animals (horses, oxen, donkeys, camels, dogs, chickens, pigeons, cats — as figures). Gardens hold the right plants, pots, paths, lanterns, stones, water.

**Light.** Daylight through the real openings; lamps, candles, braziers and hearths where they were, with their warm pools and smoke; coloured light through glass and lattice; dust and incense in beams of sun; reflections on polished floors and water; wet ground after rain.

**Sound.** Music by zone (§4.4) and ambience of the place: wind, water, birds, bells, the market, animals, rain on tiles, the reverberation of each hall measured to its volume and materials.

**Plants.** The species of the place and time, at the right size and spacing, with wind; grass, weeds in cracks, ivy, moss; crops in their fields; trees with real bark and canopy density.

**Figures and life.** Where the dossier describes who was there and what they did, still figures in the right dress may stand in their places (a priest at the altar, a merchant at the stall, a monk in the cloister), kept few and quiet; never animated crowds, never dialogue.

**Scale of care.** Anything within 20 m of a walkable spot must bear a close look; anything within 200 m must read correctly in form, material and colour; beyond that, impostors and simplified shells are allowed as long as the skyline and the colours are right.

## 6. The dossiers (archive)

Every settlement is built from a sourced dossier under `docs/settlements/<id>.md` (English; our own notes and references only). Nothing is built without its dossier; reading it should be enough to rebuild the settlement from scratch.

A dossier has three parts:

**Landmark** — the real example (name, place, dates, builders); type and typology; plan with dimensions (overall, each room, wall thicknesses, column spacing, storey heights); section and structure; sequence of spaces and use; materials per surface; decorative programme and where each element belongs; furnishings and objects of use per room; lighting; what is **[stated]** by sources versus **[inferred]** by us.

**Townscape** — the city or village at the chosen date: extent and population; street pattern and widths; block and plot sizes; house types (plan, storeys, roof, materials, courtyards) with at least one documented example each, and their furnishings; public buildings and spaces; walls and gates; water; gardens and fields; vegetation; climate and weather; the street life of the place (trades, markets, animals, vehicles, dress) with sources.

**Sound** — the music of the civilization and period (scales, instruments, forms, where music was heard) and the ambience.

Sources: architectural and urban histories, published plans and surveys, archaeology reports, heritage documentation, scholarly articles, museum collections for objects and dress, Wikipedia for orientation. Drawings and photographs are references to study, never assets to copy.

## 7. The civilizations

The target set, grouped by region; within a region, by era. Chosen so that (a) each is a distinct place-and-time, (b) each region has at least one landmark most people know, (c) the planet has no empty continent, (d) the eras of each region stand together, from prehistory to the modern, and (e) sources exist to build it truthfully. ★ = landmark already built (to be re-sited and given its townscape). Coordinates are true; placed positions are in `docs/world.md`.

**China**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Tang (9th c.) | Foguang East Hall ★ | Chang'an-style walled wards, ward gates | 39 N 113 E |
| Northern Song Kaifeng (12th c.) | Iron Pagoda, Rainbow Bridge | Riverside street market after the *Qingming* scroll | 35 N 114 E |
| Southern Song Jiangnan (13th c.) | Liuhe Pagoda / West Lake, Hangzhou (Lin'an) | Lakeside capital: markets, tea houses, boats | 30 N 120 E |
| Ming Jiangnan (16th c.) | Humble Administrator's Garden, Suzhou | Canal lanes, whitewashed walls, black tiles, stone bridges | 31 N 121 E |
| Ming–Qing Beijing (17th c.) | Forbidden City, Temple of Heaven | Hutongs and courtyard houses | 40 N 116 E |
| Tibet (17th c.) | Potala Palace | Barkhor street of Lhasa | 30 N 91 E |

**Japan and Korea**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Nara (8th c.) | Hōryū-ji | Temple town | 35 N 136 E |
| Heian (11th c.) | Phoenix Hall of Byōdō-in ★ | Timber village of Uji | 35 N 136 E |
| Edo (17th c.) | Himeji Castle | Castle town: machiya, samurai quarter | 35 N 135 E |
| Joseon (15th c.) | Gyeongbokgung | Hanok village | 38 N 127 E |

**India and South-East Asia**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Early Buddhist (1st c.) | Great Stupa at Sanchi ★ | Limewashed village | 23 N 78 E |
| Medieval Hindu (11th c.) | Khajuraho | Temple town | 25 N 80 E |
| Dravidian (17th c.) | Meenakshi Temple, Madurai | Concentric temple streets | 10 N 78 E |
| Mughal (17th c.) | Taj Mahal | Mughal bazaar town, Agra | 27 N 78 E |
| Khmer (12th c.) | Angkor Wat | Stilt houses, rice, reservoirs | 13 N 104 E |
| Java (9th c.) | Borobudur | Javanese village | 8 S 110 E |

**Mesopotamia and Persia**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Sumer (21st c. BC) | Ziggurat of Ur | Mud-brick city | 31 N 46 E |
| Babylon (6th c. BC) | Ishtar Gate, Processional Way | Walled city, Euphrates quay | 32 N 44 E |
| Achaemenid (5th c. BC) | Persepolis | Palace terrace, provincial quarters | 30 N 53 E |
| Safavid (17th c.) | Naqsh-e Jahan Square, Isfahan | Bazaar and courtyard houses | 33 N 52 E |

**The Levant and Anatolia**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Nabataean (1st c.) | Petra (the Treasury, the Siq) | Rock-cut tombs, caravan town | 30 N 35 E |
| Umayyad Jerusalem (7th c.) | Dome of the Rock ★ | Old city of stone houses | 32 N 35 E |
| Justinian's Constantinople (6th c.) | Hagia Sophia ★ | Constantinople quarter | 41 N 29 E |
| Ottoman Istanbul (16th c.) | Süleymaniye Mosque | Wooden houses, bazaar, the Horn | 41 N 29 E |

**Egypt and Africa**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Old Kingdom (26th c. BC) | Giza: pyramids, Sphinx, valley temple | Workers' town, Nile harbour | 30 N 31 E |
| Ptolemaic (1st c. BC) | Temple of Horus at Edfu ★ | Mud-brick tower houses | 25 N 33 E |
| Mamluk Cairo (14th c.) | Sultan Hassan Mosque | Cairo's lanes, mashrabiya, bazaar | 30 N 31 E |
| Sahel (14th c.) | Great Mosque of Djenné | Adobe town | 14 N 5 W |
| Ethiopia (13th c.) | Rock-hewn churches of Lalibela | Highland round-house village | 12 N 39 E |
| Swahili coast (15th c.) | Great Mosque of Kilwa | Coral-stone town, dhows | 9 S 40 E |
| Zimbabwe (14th c.) | Great Zimbabwe | Dry-stone enclosures, huts | 20 S 31 E |

**Greece and Rome**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Minoan (16th c. BC) | Knossos | Palace town, Crete | 35 N 25 E |
| Classical Athens (5th c. BC) | Parthenon ★ | Athenian town, agora | 38 N 24 E |
| Imperial Rome (2nd c.) | Pantheon ★ | Pompeii-type streets: atrium houses, insulae, shops | 42 N 12 E |
| Baroque Rome (17th c.) | St Peter's Square | Baroque streets, fountains | 42 N 12 E |

**Western Europe**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Neolithic Britain (25th c. BC) | Stonehenge | Durrington-type houses | 51 N 2 W |
| Romanesque (12th c.) | Sainte-Foy de Conques ★ | Medieval hill village | 45 N 2 E |
| Gothic Paris (13th c.) | Sainte-Chapelle ★, Notre-Dame | Île de la Cité: timber-framed houses, lanes | 49 N 2 E |
| Al-Andalus (14th c.) | Alhambra | Granada's white houses and patios | 37 N 4 W |
| Renaissance Florence (15th c.) | Florence Cathedral | Tuscan city | 44 N 11 E |
| Venice (16th c.) | St Mark's Basilica | Canal city | 45 N 12 E |
| Dutch Golden Age (17th c.) | Amsterdam canal houses (townscape-led) | Canal ring | 52 N 5 E |
| French classical (17th c.) | Versailles | Formal gardens, the town | 49 N 2 E |
| Victorian London (19th c.) | Palace of Westminster, St Pancras | London terraces | 51 N 0 |
| Art Nouveau Barcelona (20th c.) | Sagrada Família | Eixample blocks | 41 N 2 E |

**Northern and Eastern Europe**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Norse (12th c.) | Borgund stave church | Bryggen wooden wharf, Bergen | 61 N 8 E |
| Muscovy (16th c.) | St Basil's Cathedral | Log-house village | 56 N 38 E |

**The Americas**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Teotihuacan (4th c.) | Pyramid of the Sun, Avenue of the Dead | Apartment compounds | 20 N 99 W |
| Maya (10th c.) | Chichén Itzá | Maya village | 21 N 89 W |
| Aztec (15th c.) | Templo Mayor, Tenochtitlan | Lake city: canals, chinampas | 19 N 99 W |
| Inca (15th c.) | Machu Picchu | Terraces and stone houses | 13 S 73 W |
| Mississippian (12th c.) | Cahokia (Monks Mound) | Plaza, palisade, houses | 39 N 90 W |
| Pueblo (15th c.) | Taos Pueblo (townscape-led) | Multi-storey adobe | 36 N 106 W |
| Modern New York (20th c.) | Empire State Building | Manhattan blocks; Fallingwater as an outlier | 41 N 74 W |

**Oceania**
| Civilization | Landmark | Townscape | Lat, lon |
|---|---|---|---|
| Rapa Nui (15th c.) | Ahu Tongariki moai | Stone houses, quarry | 27 S 109 W |
| Māori (18th c.) | Wharenui | Pā village | 38 S 176 E |
| Modern Sydney (20th c.) | Sydney Opera House | Harbour | 34 S 151 E |

About 55 civilizations. The list is a target, not a cage: the agent may substitute within a civilization for a better-documented example, and adds places and eras that are missing (Thai, Burmese, Ottoman provinces, Hanseatic Germany, colonial Latin America, West African kingdoms, Polynesia, Arctic…) once the list is built.

## 8. Performance and budgets

Targets on the author's machine (Apple M2, 8 GB, native resolution, "high"). They are met by engineering (§3.3); detail is thinned only as the last resort and recorded.

- **Frame:** aim 60 fps in a settlement; ≥ 40 in the densest interior; ≥ 30 in high flight; no frame over 50 ms ever. Visible triangles ≤ 3 M; draw calls ≤ 800; GPU memory ≤ 1.5 GB; three shadow cascades.
- **Start:** first frame ≤ 6 s on a warm cache, ≤ 20 MB transferred; only the start settlement and the planet's base are loaded.
- **Streaming:** settlements load within ~800 m and unload beyond ~1500 m; a settlement's data ≤ 40 MB; loading is time-sliced and never costs a frame more than 4 ms. Far settlements are **impostors** (baked billboards or a low shell) so the skyline is there from across the sea.
- **Terrain:** chunked quadtree LOD on the sphere, built in workers; ≤ 400 k triangles on screen in flight.
- **Vegetation and objects:** instanced, LOD, culled on the GPU; ≤ 600 k instances on screen.
- **Files:** any committed file ≤ 50 MB, no LFS; repository ≤ 1 GB; baked data under `data/`, loaded on demand.
- **Phone:** the same world at "medium" (half shadow resolution, no GTAO, shorter streaming radius, fewer small objects), ≥ 30 fps.

`tools/budget.mjs` measures the load; `tools/perf.mjs` (new) measures frame time at fixed viewpoints headless and fails the test when a budget is broken.

## 9. Technical architecture

- **Pure JavaScript, static.** ES modules from GitHub Pages; three.js WebGPU with the WebGL 2 fallback; Node only for tests, checks and offline baking.
- **Plan is data, look is code.** A settlement is a module under `src/settlements/<id>/` with `plan.js` (the landmark), `town.js` (the townscape: street network, blocks, house placements, public spaces, water, planting), `life.js` (objects, animals, figures, ambience), `music.js` and `index.js`. Civilization vocabularies stay in `src/styles/<civilization>/` and are reused by landmark and houses alike; a shared library of objects of use lives in `src/objects/` (generated geometry, parameterised by period and material). The planet is `src/planet/` (sphere, relief, continents, biomes, rivers, ocean, atmosphere, sun).
- **Renderer:** PBR materials (procedural TSL, as now, with CC0 scanned micro-detail layered in where it helps); cascaded sun shadows; GTAO; baked irradiance volumes for interiors (as now); atmosphere pass; bloom; AgX tone mapping; eye adaptation. Shaders are shared through uniforms and instanced attributes (pipelines stay under ~120).
- **Materials and assets:** CC0/MIT only, listed in `ASSETS.md`; no copyrighted models.
- **Music:** synthesised in the browser per settlement and zone, as now; small CC0 samples where synthesis cannot reach the timbre.
- **Tooling:** `tools/shot.mjs` (fixed viewpoints), `tools/bake.mjs`, `tools/plan-check.mjs`, `tools/walk-check.mjs`, `tools/budget.mjs`, `tools/perf.mjs` (new), `tools/globe-check.mjs` (new: every settlement on land, none overlapping, every landmark approach reachable from its settlement edge). `npm test` runs the checks.

## 10. What is kept from v7, what is rebuilt

Keep only what still fits; do not bend the new world round old code.

**Kept (migrate, do not rewrite)**
- The ten landmarks and their dossiers, plans, style modules and music (`src/buildings/*`, `src/styles/*`, `docs/buildings/*` → `src/settlements/*`, `docs/settlements/*`).
- The renderer core: materials, shadows, GTAO, bloom, tone mapping, eye adaptation, the bake pipeline and the `.gi` volumes (rebake only where a settlement's hour changes).
- Movement: the walker (body, step height, collision), flight (extended with height-scaled speed), the controls layout (corner map + clock top left, settings top right), the phone controls.
- The clock, day/night, moon and stars.
- Bilingual UI and i18n; the loading sequence (open when the near things are ready; time-sliced building; cache of left buildings).
- The vegetation species system.
- Tools: shot, bake, plan-check, walk-check, budget, audio-check.

**Rebuilt**
- The world: `src/world/*` (city layout, Voronoi districts, avenue grid, house-block grid, flat terrain grid, the city edge) is deleted and replaced by `src/planet/*` and per-settlement `town.js`.
- Terrain: flat chunked grid → spherical quadtree with relief, coasts, rivers, ocean.
- Sky: per-district fixed sky and the city sky → one atmosphere model with the sun by latitude.
- Houses: one city-wide block grid with per-district house type → per-settlement townscape designed from its dossier.
- Vegetation placement: flat-terrain rules → biome-by-latitude on the sphere plus per-settlement planting.
- Map: 2D city map → globe. Corner map stays.
- The `*-wip` branches are deleted; `v2` is kept as history.

**Dropped**
- District squares with wells (the dossier decides each settlement's public space).
- The `?time=baked` view.
- Separate "regions" with blended climates (the word *region* now means a group of civilizations, §4.2).

## 11. Depth is layered

**Per settlement**
- L1 — landmark at correct plan, section, structure, proportions, walkable, main materials, daylight, music; townscape as street network, house shells of the right type and public spaces; the settlement on the planet with its boundary.
- L2 — landmark's full decorative programme and baked light; townscape with house variation, courtyards, walls, gates, gardens, water, planting; several buildings enterable and furnished; the principal objects of use in place; ambience.
- L3 — the full detail standard of §5: weathering and wear, fine decoration, every room's objects, street life, animals and figures, lamps and coloured light, sound of the place.

**Planet**
- L1 — sphere, continents, oceans, sun by latitude, flight, globe map, streaming, impostors.
- L2 — biomes with vegetation, rivers, coasts, atmosphere, weather regions, roads and fields between a region's settlements.
- L3 — named ranges, seasons, set pieces (monsoon over Angkor, snow on Borgund, dust over Djenné, mist on West Lake).

**Visual**
- L1 — PBR, shadows, GTAO, tone mapping, atmosphere.
- L2 — baked GI, reflections, bloom, wet and worn materials.
- L3 — stained glass, incense haze, candlelit halls, moonlit water, dust in sunbeams.

## 12. Decisions log

Append-only: date, decision, reason. The log of the Memory Palace era (2026-10) is in `docs/history.md`; its decisions on individual landmarks (which example, which date, what was inferred) still hold.

- 2026-11-03 — **Renamed to Memory of Civilizations / 文明的记忆;** repository `memory-of-civilizations`. Reason: the project is about civilizations, not one palace or a memory technique.
- 2026-11-03 — **The world is a small planet** (r = 4 km, see below for 8 km) with Earth's continents and latitudes; regions at true positions, pushed apart where crowded; open country between them. Supersedes the compact city of 2026-10-28. Reason: author's vision — every civilization where it stood; sun, climate and the globe map come for free; sparsity helps frame times.
- 2026-11-03 — **A civilization is a place at a time;** one region holds several civilizations of different eras, standing near each other in order of age. Reason: author's instruction (Southern Song and Ming Jiangnan are two civilizations).
- 2026-11-03 — **A settlement is a landmark plus its townscape,** both to the dossier; a bare landmark is unfinished. Reason: the author wants the feeling of a civilization, not a collection of monuments.
- 2026-11-03 — **Detail first** (§5 standard), picture quality second, smoothness third and reached by engineering; budgets in §8 are targets met by streaming, LOD and baking, and detail is thinned only as the last resort. Reason: author's instruction — the current level of detail is far too low; the author's machine is an M2 with 8 GB, so engineering must carry the detail.
- 2026-11-03 — The target list of ~55 civilizations (§7), balancing well-known landmarks with the places and eras history needs. Reason: author's instruction.
- 2026-11-03 — v7's world code is rebuilt; landmarks, styles, renderer, movement, clock, UI and tools are kept (§10). Reason: the author asked to keep only the main mechanisms and rebuild the rest.

## 13. Roadmap and status

**Status — 2026-11-03 (v8.0 in progress, branch `planet`).** v7.1 was the last Memory Palace release (ten landmarks in a flat compact city). Built since:
- `src/planet/`: the ~55 sites with true positions (`sites.js`); the layout (`layout.js`, generated by `tools/planet-layout.mjs`: three mild lenses, then a push apart on land); the land map (`data/planet/land.bin`, from `tools/planet-land.mjs`: Natural Earth land carried onto the planet, signed distance to the coast at 2048 × 1024, climate — mountains, moisture, warmth — at 1024 × 512); the ground (`relief.js`: beach, rolling country, hills, mountain ranges, sea floor; each built settlement's disc with its local ground, blended out over 100 m; ground cover by climate, snow, forest canopy); a quadtree of ground tiles on a cube-sphere (`terrain.js`, `chunk.js`, workers; 32 × 32 cells, ~1.7 m at the deepest level; horizon culling with heights guessed from the mountains); ground and sea materials (`materials.js`); open-country skies (`climates.js`).
- The scene is drawn in a frame round the visitor (`src/engine/world.js`): the settlement's own frame in its zone, a frame under the feet in the open country, the view turned toward the true up over the blend; switching is seamless (checked: no jump in view or position). Collision per frame (settlement or open country, with the sea not wadeable).
- One sun by latitude at a global hour (the clock shows the local hour); each settlement's sky in its zone, the open country's beyond; fog and cloud shadows in planet coordinates; the sky's horizon follows the dip seen from a height (`src/engine/sky.js`); the camera's depth range follows the height. Flight speed grows with height. Settlements load within 700 m of their rim, farther when high up.
- The globe as the large map (`src/ui/globe.js`), the small map of the planet round the visitor (`src/ui/minimap.js`).
- The ten keep their district of the old city as their local space under a focus (`src/world/regions.js`); their houses and plants are laid on their discs. Removed: the flat city's terrain, road check, district map, quarter features.
- Checks: `tests/planet.test.mjs` (map round trip, spacing, buildings on their discs, the blend has no step, the houses build); `tools/probe.mjs` (headless start and console).
- Not yet: impostors for far settlements (they load from farther when one flies high instead); plants in the open country and on settlements other than the one the visitor is in; `tools/perf.mjs` and `tools/globe-check.mjs`; rebaking the ten's light for their new surroundings; the docs/settlements move.

**Phase A — The planet, with the ten** *(next)*
- Rename and restructure (§9, §10); `docs/history.md`; README in both languages.
- `src/planet/`: sphere with relief, continents and oceans from a hand-drawn low-resolution mask, sun by latitude, atmosphere, spherical walker and flight with height-scaled speed, globe map, streaming with impostors, `tools/globe-check.mjs`, `tools/perf.mjs`.
- Re-site the ten landmarks at their positions with a provisional townscape each (ported house types), one bake pass; biome L1 ground between them.
- Release v8.0 when the ten are reachable, the perf test passes and the live site works on desktop and phone.

**Phase B — The ten to the standard, and the empty continents**
- Rewrite the ten's dossiers with townscape and sound parts; bring each settlement to L2 with its true townscape and objects of use (Pompeii-type Rome, Île de la Cité with Notre-Dame, Chang'an wards, the agora…). The first of these (Edfu) sets the bar for §5.
- Then, each to L1 then L2 with dossier, townscape, life and music, in this order: Ming Suzhou, Forbidden City, Angkor, Chichén Itzá, Giza, Djenné, Machu Picchu, Taj Mahal, Isfahan, Himeji, Southern Song Hangzhou, Borobudur, Ur, Lalibela, Tenochtitlan, Teotihuacan, Taos, Gyeongbokgung, Kaifeng, Potala, Madurai, Persepolis, Petra, Knossos, Rapa Nui, Māori pā.

**Phase C — Later Europe, the modern world, the rest of the list**
- Florence, Venice, Alhambra, Versailles, Baroque Rome, Ottoman Istanbul, Mamluk Cairo, Borgund/Bryggen, St Basil's, Amsterdam, Westminster/St Pancras, Sagrada Família, Stonehenge, Khajuraho, Hōryū-ji, Babylon, Kilwa, Great Zimbabwe, Cahokia, New York, Sydney.

**Phase D — Depth**
- All settlements to L3 (§5 in full); Planet L3; Visual L3; the bake separates sun, sky and lamps.

**Phase E onward — Keep going**
- More civilizations (places and eras not yet present), deeper townscapes, more enterable houses, more objects. Prefer what adds the most civilization per unit of work. Stop only when the author says so.

## 14. Rules

- Dossier first (§6). Every element traces to its dossier.
- Metres; true scale for buildings and townscapes; the planet and open country are compressed.
- No study features, markers, labels in the world. UI: corner map, clock, globe map, settings — nothing else without a reason in §12.
- Budgets (§8) are targets; a change that breaks one is fixed by engineering before merge, and only as a last resort by thinning detail, recorded in §12.
- Picture quality on the author's machine never goes down silently; a change that lowers it is recorded in §12.
- Checks per change: a screenshot of the thing changed and the plan check; per task end and before release: all viewpoints compared, budget, perf, walk and globe checks.
- Repository text in English; the site UI bilingual, English default, Chinese available. Commits authored as the repository owner (Alex Wang <alex119122114@gmail.com>), no AI co-author or session trailers, messages in English.

## 15. Releases

Every push to the default branch deploys to GitHub Pages. Cut a release (tag `vMAJOR.MINOR`, GitHub release with a note and screenshots, `CHANGELOG.md` entry in plain words) for every phase, new settlement or visible quality jump. Never release with a regression in the picture, a broken walk, or a budget breach.
