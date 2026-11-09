# Memory of Civilizations

[中文说明](README.zh-CN.md)

A small planet you can walk and fly over, on which the civilizations of Earth stand where they stood, each as a place at one moment in time. Every **settlement** is a realistic, detailed 3D town: a famous landmark built after the real building, with its interior, and round it the townscape of its people and time — streets, houses, markets, gardens, walls, water, people at work — with real materials, light and shadow, weather, and music in the manner of its civilization.

**Walk it: <https://alexw6385.github.io/memory-of-civilizations/>** — desktop or phone, in a browser with WebGPU (Chrome, Edge, Safari 26). English or Chinese.

The name means only that these buildings are the memory of civilizations. This is a world to walk, not a study tool: no notes, no markers, no route.

> **State of the site (v10.20, 2026-11-07):** 57 settlements stand on the planet, each built from a sourced dossier, with 44 interiors under baked light. Next: bringing every settlement up to the full detail standard. See [DESIGN.md](DESIGN.md) §10.

## The settlements

| Region | Settlements |
|---|---|
| Africa | Giza (c. 2560 BC) · Edfu (1st c. BC) · Lalibela (c. 1220) · Kilwa Kisiwani (c. 1330) · Great Zimbabwe (c. 1350) · Djenné (14th c.) · Mamluk Cairo (c. 1363) |
| Western Asia | Ur (c. 2050 BC) · Babylon (c. 570 BC) · Persepolis (c. 480 BC) · Petra (c. AD 50) · Umayyad Jerusalem (c. 700) · Ottoman Istanbul (c. 1560) · Safavid Isfahan (c. 1630) |
| Europe | Stonehenge (c. 2500 BC) · Knossos (c. 1600 BC) · Classical Athens (c. 410 BC) · Hadrian's Rome (c. 128) · Justinian's Constantinople (c. 562) · Conques (c. 1120) · Gothic Paris (1248) · Borgund, Norway (c. 1250) · Nasrid Granada (c. 1390) · Renaissance Florence (c. 1480) · Venice (c. 1500) · Muscovy (c. 1600) · Amsterdam (c. 1670) · Baroque Rome (c. 1670) · Versailles (c. 1690) · Victorian London (c. 1870) · Barcelona (c. 1910) |
| South Asia | Sanchi (1st c.) · Khajuraho (c. 1050) · Mughal Agra (1632–1653) · Madurai (c. 1650) · Lhasa (1694) |
| East Asia | Nara (752) · Mount Wutai (857) · Uji (1053) · Northern Song Kaifeng (c. 1120) · Southern Song Hangzhou (c. 1200) · Ming Suzhou (c. 1530) · Edo Himeji (c. 1620) · Ming–Qing Beijing · Joseon Hanyang (c. 1888) |
| Southeast Asia | Borobudur (c. 825) · Angkor (c. 1150) |
| The Americas | Teotihuacan (c. 400) · Chichén Itzá (c. 1000) · Cahokia (c. 1175) · Machu Picchu (c. 1450–1530) · Taos Pueblo (c. 1500) · Tenochtitlan (1519) · New York (1931) |
| Oceania | Rapa Nui (c. 1500) · a Māori pā by Lake Rotorua (18th c.) · Sydney (1973) |

They stand on a sphere of 8 km radius with Earth's continents and latitudes, each near its true place (crowded regions gently magnified), with open country, roads, rivers and the sea between them. One sun lights the whole planet, so it can be noon in one city and evening in another. Weather and seasons change by region. Fly up and the ground curves away below. Layout: [docs/world.md](docs/world.md).

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
npm run bake -- edfu               # bake a settlement's indirect light into data/gi/
npm run shot -- --building edfu    # screenshots at fixed viewpoints → shots/
npm run budget                     # load and size budgets
npm test
```

URL switches: `?perf` (frame-time panel), `?capture` (fixed 1/30 s steps for recording), `?tour=a,b,c` (fixed tour order).

Every push to `master` runs the checks and publishes the site to GitHub Pages. How the work is run with parallel agents: [docs/parallel-work.md](docs/parallel-work.md).

## License

MIT. Third-party assets (CC0/MIT only) are listed in [ASSETS.md](ASSETS.md).
