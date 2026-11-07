# The world — the planet

The world is a small planet: a sphere of 8 km radius whose continents, seas and latitudes follow Earth's, with the civilizations of Earth — each a place at a time — standing where they stood, each as a settlement (DESIGN.md §1, §4). This document records how it is laid out and why. Everything here lives in code as data and pure functions under `src/planet/`; the generated parts are made by the tools named below and committed.

Planet coordinates: metres from the centre; +y the north pole, the prime meridian through +z, longitude growing toward +x. A local frame has +x east, +y up, +z south (north is −z).

## Sites

`src/planet/sites.js` lists every settlement, built or to come (DESIGN §7): its id, names, era, region, true latitude and longitude (of its landmark), the radius of its disc, and for the ten settlements of the previous design the district of the old city that is their local space (`legacy`). A settlement marked `water` stands in or by the water (an island, a lagoon) and is not moved onto land.

## Layout

`tools/planet-layout.mjs` → `src/planet/layout.js` (`LENSES`, `PLACED`).

1. **The map of Earth onto the planet** (`src/planet/warp.js`). At the planet's scale (about 1 : 800), Europe and the Near East cannot hold their dozen and a half civilizations: three mild lenses magnify the crowded parts of the world — Europe and the Near East (centre 40° N 18° E, ×1.5 at the centre, radius 26°), India (22° N 79° E, ×1.3, 12°), East Asia (34° N 120° E, ×1.35, 14°). A lens moves each point along the great circle from its centre, θ → θ + (m − 1)·θ·e^(−(θ/r)²): it magnifies by m at the centre, is the identity far away and cannot fold. The oceans give up the room. Stronger lenses were tried and rejected: the Mediterranean became unreadable.
2. **Pushed apart, kept on land.** Each settlement starts at its mapped true place (settlements sharing a place start a little off it, `nudge`), then all push each other apart until every two stand at least `radius_a + radius_b + 2·BLEND + GAP` apart (about 640 m), held weakly to their mapped places and, unless marked `water`, climbing the distance to the coast until their disc is on land. The tool reports how far each ended from its mapped true place (the most crowded — Baroque Rome, Petra, Florence, the second of Istanbul — a few hundred metres, i.e. a few degrees).

## Land

`tools/planet-land.mjs` → `data/planet/land.bin` (about 0.5 MB).

- **Coasts.** Natural Earth land polygons (1:50m, public domain, via the `world-atlas` package) carried through the map, rasterised at 4096 × 2048 and turned into a signed distance to the coast (metres on the planet, ±256 m), kept at 2048 × 1024 (12 m per cell at the equator), sampled bilinearly so that coasts are smooth.
- **Climate**, at 1024 × 512, from Earth's large features at the true place of each cell (`tools/lib/geography.mjs`, generalised by hand from atlases): mountain ranges as lines and plateaus as areas with their height on the planet (the Himalaya and the Andes 150 m, the Alps 85 m, Tibet 85 m…); moisture by latitude belt, lowered over the dry lands (the Sahara, Arabia, the Gobi, the Australian interior…) and raised over the rain forests; warmth from the latitude and the height.

## Ground

`src/planet/relief.js`, shared by the viewer, the workers and the tools.

- **The open country.** From the beach the land rises to a gently rolling country a few metres above the sea, with hills (3–14 m, rougher in places) and, where Earth has them, mountain ridges of the range's height; the sea floor shelves down from the coast to about 25 m.
- **A settlement** stands on a flat disc of its own at its own level (`base`: the open country's height at its centre, at least 2.5 m above the sea), its local ground set into it, blended out into the open country over `BLEND` (100 m) beyond the rim. The ten settlements of the previous design take their local ground from their district of the old city under a focus (`src/world/regions.js`): that district alone — its rocks, hills, building pads and ponds — fading to the settlement's level over the last 30 m inside the rim. Their disc's centre and radius are chosen so that the building and a ring of houses fit (`tests/planet.test.mjs` checks every building inside its disc and that the blend has no step).
- **Ground cover** by climate: beaches, deserts, grass from green to straw, rock where steep or high, snow where cold or very high, a forest canopy where moist and warm enough; on a settlement's disc its own (the old city's), blended out with its ground.
- **Drawn** as a quadtree of tiles on the six faces of a cube blown up to the sphere (`src/planet/terrain.js`, `chunk.js`), built in workers: tiles of 32 × 32 cells, from 12.6 km down to ~56 m (about 1.7 m between vertices) near the visitor; tiles beyond the horizon are not drawn (with the height they can have guessed from the mountains under them); the coarser tile stays until the finer ones replacing it are built. The sea is drawn over each tile that has sea.

## Frames

The scene is always drawn in a local frame round the visitor (`src/engine/world.js`):

- **In a settlement's zone** (its disc and blend) the frame is the settlement's own, whose coordinates are those its plans, collision, baked light and plants are made in (for the ten, the old city's) — so all of it works as it did on flat ground.
- **In the open country** the frame follows the visitor, re-centred under the feet every frame (its axes carried by the least rotation, so that nothing turns about the vertical).
- **Between**, over the blend, the view is turned little by little from the settlement's up to the true up of the place, so that at the zone's edge the two frames agree and the switch cannot be seen (checked: no jump in view or position).

## Sky and time

One sun, over the equator (the equinox) at the longitude where it is noon at the global hour; the full moon opposite. The clock shows and sets the local solar hour where the visitor is; a day lasts half an hour. Each settlement's sky (its region's climate: sky, haze, weather) holds in its zone and blends out over a few hundred metres into the open country's — temperate, dry, tropical or cold by moisture and warmth (`src/planet/climates.js`). Fog and cloud shadows are computed in planet coordinates; the sky's bright horizon follows the horizon's dip seen from a height.

## Weather and seasons

`src/planet/setpieces.js`, applied by `src/engine/climate.js`; seen in the browser with `?weather=<state id>` (held) and `?season=winter|spring|summer|autumn`.

- **The cycle.** Each settlement's weather is a slow random walk through the states of its climate (its `ground.js`), each held for minutes and blended over a minute and a quarter. A state's weight now follows the local hour (`hours`: ×3 inside the window, ×0.2 outside, so a morning mist burns off) and the month of the visit (`months`: ×1.5 in season, ×0.6 out of it, never ruled out).
- **Set pieces** — the characteristic weather of a place, added to or strengthened in its cycle so that it is seen often but not always:
  - *Angkor:* `monsoon` — a downpour round midday (rain 1.25, the ground soaking, low grey haze), May–October. The south-west monsoon runs from about mid-May to September/October, with a couple of hours of heavy rain round late morning or early afternoon on most days, clearing after [stated] ([UME Travel, Angkor Wat weather](https://www.umetravel.com/cambodia/guide/thingstodo/angkor-wat-weather.html)).
  - *Borgund:* `snow` — snow falling, the ground and the roofs whitening over a minute and a half, November–April. Lærdal's valley lies under snow in winter [inferred from its latitude and inland climate] ([Lærdal](https://wikiwand.com/en/articles/L%C3%A6rdal_Municipality)).
  - *Djenné:* `harmattan` (ochre haze, the sun dimmed, fine dust drifting on the wind) and `dust` (a dust storm), late November to mid-March: heavy harmattan dust can limit visibility like a thick fog and hide the sun for days [stated] ([Harmattan](https://en.wikipedia.org/wiki/Harmattan)).
  - *Hangzhou:* `lake-mist` — mist lying on West Lake and round the hills at dawn (haze falloff ×7, so it lies low), 4:30–9:30; the ten scenes include "Twin Peaks Piercing the Clouds", best in the morning when mist wreathes the hills, and "Spring Dawn at Su Causeway" [stated] ([China Highlights, Ten Scenes of West Lake](https://www.chinahighlights.com/hangzhou/attraction/ten-scenes-of-west-lake.htm)).
  - *London:* `fog` — the "London particular", a thick greenish-yellow coal-smoke fog lying low along the Thames, October–February [stated: colour and cause; the dated great fogs are in winter] ([Pea soup fog](https://en.wikipedia.org/wiki/Pea_soup_fog)).
  - *Giza:* `hazy` more often, with a little dust; `khamsin` — hot sand-laden wind, the sun a disc, March–May: it blows at intervals over some 50 days, mostly in April, each time for a few hours [stated] ([Khamsin](https://en.wikipedia.org/wiki/Khamsin)).
  - Lower, morning-favoured mists at Borobudur (`morning-mist`), Machu Picchu (`mist`) and Venice (`mist`); snow in the Muscovite winter (`snow`) [inferred].
- **Snow and dust in the air** are one cloud of 6,000 small round flakes round the viewer (`src/engine/rain.js`, one draw, only while it falls): snow drifting down at ~1 m/s and swaying, dust motes running at ~7 m/s along the wind. Fresh snow lies on ground facing the sky (`src/planet/materials.js`) and on tiled and shingled roofs (`src/engine/materials.js`) while `ENV.snowCover` stands: it settles in ~90 s and melts over a few minutes after.
- **Mist** is the haze with a steeper height falloff (`fall`): dense at the ground and the water, thin a few tens of metres up, so from a hill or in flight it lies in the valley.
- **Seasons.** The sun keeps the equinox (§ Sky and time); the open country follows the calendar of the visit (or `?season=`), outside the tropics (fading in from 25° to 53°) and off the settlements' discs (which keep their chosen moment): grass and stubble yellow in autumn, dun in winter, fresh in spring; the broadleaf belt (about 25°–50°, conifers mixed in) turns russet and gold in autumn and stands bare and grey-brown in winter, while the boreal forest stays dark; the snow line comes down in winter from ~165 m to ~78 m at mid-latitudes and ~22 m in the far north, and the northern lowlands beyond ~55° whiten in deep winter (so the Alps, the Caucasus, the Scandinavian mountains and the Rockies whiten, the Himalaya and the Andes keep their snow by height).
- **Named ranges** (Himalaya, Andes, Alps, Zagros, Atlas and some thirty more) were already in the land map as low ridges (`tools/lib/geography.mjs`, § Land).

## Moving about

Walking and running at true speed; flight (hold Space) whose speeds grow with the height above the ground, up to about 110 m/s (200 with Shift) and 1.5 km up. Settlements are built when the visitor comes within 700 m of their rim, farther when high up, and let go beyond. The globe (the large map) takes one to any settlement's landmark or any point of the land.
