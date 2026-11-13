# Memory of Civilizations

[中文说明](README.zh-CN.md)

A small planet you can walk and fly over, on which the civilizations of Earth stand where they stood, each as a place at one moment in time. Every **settlement** is a realistic, detailed 3D town: a famous landmark built after the real building, with its interior, and round it the townscape of its people and time — streets, houses, markets, gardens, walls, water, people at work — with real materials, light and shadow, weather, and music in the manner of its civilization.

**Walk it: <https://alexw6385.github.io/memory-of-civilizations/>** — desktop or phone, in a browser with WebGPU (Chrome, Edge, Safari 26). English or Chinese.

The name means only that these buildings are the memory of civilizations. This is a world to walk, not a study tool: no notes, no markers, no route.

> **State of the site (v12.0, 2026-11-12):** all 94 settlements of the plan stand on the planet, each built from a sourced dossier and each visited in the author's Chrome at its arrival. Still to come: depth beyond the arrivals, and the phone. See [DESIGN.md](DESIGN.md) §10.

## The settlements

| Region | Settlements |
|---|---|
| China and Tibet (15) | Shang Yinxu (c. 1200 BC) · Qufu (Qing, c. 1730) · Qin Xianyang (c. 210 BC) · Han Chang'an (c. 100 BC) · Three Kingdoms Ye (c. AD 215) · Tang Chang'an (8th c.) · Tang China (9th c.) · Northern Song Kaifeng (12th c.) · Southern Song Lin'an (13th c.) · Ming Suzhou (16th c.) · Ming–Qing Beijing (17th c.) · Hakka tulou (c. 1710) · Dunhuang (9th c.) · Shaolin and Mount Song (17th c.) · Tibet (17th c.) |
| Japan and Korea (5) | Nara Japan (8th c.) · Heian Japan (11th c.) · Muromachi Kyoto (15th c.) · Edo Japan (17th c.) · Joseon Korea (19th c.) |
| South Asia (8) | Mohenjo-daro (c. 2500 BC) · Early Buddhist India (1st c.) · Ajanta (c. 480) · Nalanda (c. 640) · Medieval Hindu India (11th c.) · Dravidian South India (17th c.) · Mughal India (17th c.) · Bhaktapur (c. 1710) |
| South-East Asia (5) | Java (9th c.) · Khmer Empire (12th c.) · Pagan (Bagan) (c. 1200) · Ayutthaya (17th c.) · Balinese temple village (c. 1900) |
| Central Asia and the steppe (2) | Timurid Samarkand (15th c.) · Mongol Karakorum (13th c.) |
| Western Asia (11) | Çatalhöyük (c. 6500 BC) · Sumer (21st c. BC) · Babylon (6th c. BC) · Achaemenid Persia (5th c. BC) · Nabataea (1st c.) · Umayyad Jerusalem (7th c.) · Justinian's Constantinople (6th c.) · Abbasid Baghdad (c. 800) · Ottoman Istanbul (16th c.) · Safavid Persia (17th c.) · Shibam (from the 16th c.) |
| Egypt and Africa (12) | Old Kingdom Egypt (26th c. BC) · New Kingdom Thebes (c. 1250 BC) · Abu Simbel (13th c. BC) · Ptolemaic Alexandria (3rd c. BC) · Mamluk Cairo (14th c.) · Ethiopia (13th c.) · The Sahel (14th c.) · Marinid Fez (14th c.) · Dogon villages (c. 1930) · The Swahili Coast (15th c.) · Zimbabwe (14th c.) · Benin City (c. 1600) |
| Europe (21) | Neolithic Britain (25th c. BC) · Minoan Crete (16th c. BC) · Mycenae (13th c. BC) · Delphi (c. 400 BC) · Classical Athens (5th c. BC) · Imperial Rome (2nd c.) · Romanesque Rouergue (12th c.) · Norse Norway (12th c.) · Gothic Paris (13th c.) · Al-Andalus (14th c.) · Renaissance Florence (15th c.) · Venice (16th c.) · Manueline Lisbon (c. 1520) · Muscovy (16th c.) · Baroque Rome (17th c.) · Dutch Golden Age (17th c.) · French Classicism (17th c.) · Victorian London (19th c.) · Vienna, 1902 (1902) · Art Nouveau Barcelona (20th c.) · Bauhaus Dessau (c. 1927) |
| The Americas (10) | Teotihuacan (4th c.) · Classic Maya Tikal (c. 750) · The Maya (10th c.) · Mississippian Cahokia (12th c.) · The Inca (15th c.) · The Pueblo (15th c.) · The Aztecs (15th c.) · SG̱ang Gwaay Llnagaay (c. 1850) · Modern New York (20th c.) · Brasília (1960s) |
| Oceania (5) | Kakadu — Ubirr (c. AD 1000) · Nan Madol (c. 1300) · Rapa Nui (15th c.) · Māori Aotearoa (18th c.) · Modern Sydney (20th c.) |

They stand on a sphere of 12 km radius with Earth's continents and latitudes, each near its true place (crowded regions gently magnified), with open country, roads, rivers and the sea between them. One sun lights the whole planet, so it can be noon in one city and evening in another. Weather and seasons change by region. Fly up and the ground curves away below. Layout: [docs/world.md](docs/world.md).

## Controls

| Desktop | |
|---|---|
| W A S D / arrows | walk |
| Mouse (double-click to capture) | look |
| Q / E | turn |
| Shift | run |
| Hold Space | fly (faster the longer you hold); let go to glide down onto the ground or a roof |
| Space twice | cruise |
| M | the globe map: drag to turn, wheel to zoom, click a city to go there |
| R | a random city |
| T | tour: an aerial loop over each city in turn, about a minute each; R skips ahead, any other input stops it where you are |
| Esc | close panels, release the mouse |

A short controls hint shows on the first visit (dismiss it with its button; it is remembered). Walk in through any doorway: ordinary buildings near each arrival can be entered.

On a phone: left thumb on the stick to walk, drag to look, hold ↑ to fly, tap the corner map for the globe and its Random city and Tour buttons. The corner card's slider sets the hour.

## How it is made

- **Dossier first.** Each settlement is built from a sourced dossier in [`docs/settlements/`](docs/settlements): landmark (plan, dimensions, structure, materials, decoration, light), townscape and sound, with what sources state kept apart from what is inferred.
- **Plan is data, look is code.** A settlement is a plan of walls, openings, floors, roofs, columns and objects in metres (`src/settlements/<id>/`, `src/buildings/`), drawn by the reusable vocabulary of its civilization (`src/styles/<style>/`). Street life, markets and everyday objects come from `src/objects/`.
- **Renderer:** three.js WebGPU with a reversed depth buffer; procedural physically based materials aligned to each wall's coursing; cascaded shadows with a shadow cache; GTAO; bloom; AgX tone mapping and eye adaptation; indoor air with light shafts and coloured glass; lamp light at night.
- **Baked light:** indirect light is ray traced offline into an irradiance volume per interior (`tools/bake.mjs` → `data/gi/`).
- **Speed:** static meshes merged per settlement, cells with coarse levels of detail, dynamic resolution, automatic quality, and the next city of the random order preloaded so jumps are near instant.
- **Planet:** sphere terrain streamed in workers, biomes, ocean, atmosphere, instanced trees and grass with wind and levels of detail (`src/planet/`, `src/engine/flora/`).
- **Sound:** music and ambience synthesised in the browser per settlement; rooms have their own reverberation.

Pure static ES modules: no build step and no server. three.js is vendored in `src/vendor/`.

## Development

```bash
npm install                        # dev tools only
npm run serve                      # http://127.0.0.1:8000
npm run check                      # plan check: walkability, reachable rooms, nothing floating
npm run walk -- --sites            # walk routes of every settlement
node tools/disc-check.mjs          # plans inside their disc, materials known, rooms with music
node tools/view-check.mjs          # a free arrival view of each landmark
node tools/rim-check.mjs           # each rim against the open country
node tools/geo-budget.mjs          # geometry budget of every settlement
npm run bake -- giza               # bake a settlement's indirect light into data/gi/
npm run shot -- --building parthenon    # screenshots at fixed viewpoints → shots/
npm run budget                     # load and size budgets
npm test
```

URL switches: `?perf` (frame-time panel with switches; `window.palace.perf`), `?trace` (counts the pipelines compiled), `?bench` (a fixed route on the author's machine, with fps, draw calls and hitches), `?capture` (fixed 1/30 s steps for recording), `?tour=a,b,c` (fixed tour order), `?quality=high|medium|low|cinema` (picture quality; automatic by default).

Every push to `master` runs the checks and publishes the site to GitHub Pages. How the work is run with parallel agents: [docs/parallel-work.md](docs/parallel-work.md).

## License

MIT. Third-party assets (CC0/MIT only) are listed in [ASSETS.md](ASSETS.md).
