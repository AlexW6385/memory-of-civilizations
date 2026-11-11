# Third-party assets

Only CC0 or MIT assets, loaded from a CDN; nothing large is committed to the repository.

| Asset | Licence | Source | Used for |
|---|---|---|---|
| three.js r186 (`three@0.186.1`), including addons: GTAONode, BloomNode, SMAANode, CSMShadowNode | MIT | npm `three@0.186.1`, served from `src/vendor/three/` (licence there) so the page and the build workers share one copy | renderer, post-processing, shadows |
| mp4-muxer 5.2.2 | MIT | npm `mp4-muxer@5.2.2`, served from `src/vendor/mp4-muxer/` (licence there) | writing recorded films (`?film=`) into MP4 |
| three.js `SkyMesh`, forked as `src/engine/sky.js` (adds the horizon's dip) | MIT | three.js examples | sky |
| Natural Earth land polygons, 1:50m and 1:110m, via the `world-atlas` package (ISC) | public domain | https://www.naturalearthdata.com, https://github.com/topojson/world-atlas | the planet's continents, baked into `data/planet/land.bin` by `tools/planet-land.mjs` |

Development only (not served to visitors): `playwright` (Apache-2.0), `three-mesh-bvh` (MIT, light baking), `pngjs` (MIT), `pixelmatch` (ISC), `world-atlas` (ISC; Natural Earth data, public domain).

The interface uses the visitor's system fonts (no web fonts).

Generated in this repository (no third-party source): all architecture and objects (procedural geometry), all materials (procedural TSL shaders), all baked lighting (`data/gi/`), the planet's relief, mountains and climate (`tools/lib/geography.mjs`, generalised by hand), the terrain and ground cover, the plants and their foliage textures (drawn on a canvas at load time), all music (synthesised in the browser).

No photographic textures or scanned models are used yet. When CC0 sets from Poly Haven or ambientCG are added, list each one here with its URL.

