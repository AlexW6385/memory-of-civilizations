# Rapa Nui (Ahu Tongariki and Rano Raraku), about 1500 — dossier

Settlement id: `rapa-nui` · Style: `rapanui` · Region: Polynesia (Rapa Nui, the south-east coast) · Code: `src/settlements/rapa-nui/`
Status of this dossier: L2, parts toward L3 (Ahu Tongariki with fifteen moai facing inland, some with pukao, its ramp and plaza; Rano Raraku's cone, crater lake and quarry with moai standing buried to the shoulders and moai half-cut in the rock; a village of hare paenga with paved forecourts, hare moa and manavai; the rocky shore and the sea; ground, planting, weather, music). Since raised: the moai sculpted in full (face, ears, hands, hami, ring-and-girdle), the ahu's fitted slabs, ramp and wings, quarry bays with half-cut statues, hare paenga with curb, porch, poro pavement and umu (§4a). Second pass (§4b): the coral-and-obsidian eyes on the ahu statues, a statue road with a statue being walked down it by three rope teams, small plank canoes on the shore, bananas in the manavai, people on the plaza, at the road and on the shore. Third pass (§4c, L3): the moai weathered, sweet potato gardens under stone mulch, a house being thatched with its inside seen, people at the forecourts and ovens, chickens. L3 recorded for later: Orongo and the birdman cult, rongorongo, tattoo and body paint, the tupa towers.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** Ahu Tongariki, the largest ahu on the island: about 100 m long, with fifteen moai (re-erected in the 1990s), facing inland with the sea behind; the heaviest weighs about 86 t; one pukao has been replaced [stated: Wikipedia "Tongariki"; Britannica "Easter Island"].
- **Rano Raraku:** the volcanic crater about 1 km inland from Tongariki, the quarry of nearly all moai. Its slopes hold hundreds of moai, many buried to the shoulders, and others left unfinished in the rock; there is a reed-filled lake in the crater [stated: Wikipedia "Rano Raraku"].
- **The moai:** monolithic figures of Rano Raraku tuff, with heavy brows, long noses and ears, and hands on the belly. Some wore red scoria topknots (pukao) quarried at Puna Pau [stated: Wikipedia "Moai"].
- **Houses:** the hare paenga, boat-shaped houses on curbs of dressed basalt with a paved forecourt [stated: Wikipedia "Hare paenga"]; the hare moa, stone chicken houses, and the manavai, stone-walled garden enclosures [stated: Britannica].
- **Moment shown:** about 1500, with the statues standing (some with pukao).

## 2. Layout of the settlement (radius 320 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Ahu Tongariki | the coast, 100 m long east–west, facing north (inland) | [stated: length and facing] |
| Plaza | before the ahu | [inferred] |
| Rano Raraku | to the north-west, brought to ≈ 200 m (it is ≈ 1 km) | [stated: 1 km; compressed — inferred] |
| Village | on the plain between | [inferred] |
| Sea | south of the shore and round the disc's edge (the island ends there) | [inferred] |

## 3. Orientation

The ahu faces inland, its back to the sea. [stated]

## 4. The style

Moai of yellow-brown tuff; ahu of fitted basalt with a paved ramp of rounded stones; red scoria pukao; thatched boat-shaped houses on basalt curbs. [stated]

## 4a. Detail of the moai, the ahu, the quarry and the houses

**The moai** (`moaiGeometry`, src/styles/rapanui/index.js):
- Head about three-eighths of the whole statue [stated: Wikipedia "Moai": "overly large heads, which account for three-eighths of the size of the whole statue"]; we put the jaw at 0.6 of the height [inferred].
- Heavy brows, long nose with a fish-hook-shaped curl of the nostrils; lips protruding in a thin pout; long oblong ears; big chin; jaw lines standing out against the truncated neck; deep eye slits [stated: Wikipedia "Moai"].
- Heavy torso, collarbones faintly outlined; arms in low relief; hands with long slender fingers resting along the hips, thumbs sometimes toward the navel, meeting at the hami (loincloth) [stated: Wikipedia "Moai"]. Nipples and the navel are carved [inferred from photographs of standing moai].
- Backs generally plain, some with the ring-and-girdle motif on the lower back [stated: Wikipedia "Moai"]; we give it to the ahu statues [inferred].
- Eye sockets were made to hold coral eyes with obsidian or red scoria pupils [stated: Wikipedia "Moai"]. Statues in the quarry are shown without sockets, as they stand on Rano Raraku today [inferred]. The second pass sets the eyes in the ahu statues (§4b).
- Pukao: cylindrical, with a dent on the underside to fit the head and a boss or knot on top, ring-like grooves along the bottom edge; set so that the pukao protrudes forward; 1.8–3 m across [stated: Wikipedia "Pukao"]. Ours: 0.26 of the statue's height across (≈ 1.9 m on a 7.4 m statue), pushed 0.02 h forward [inferred].
- Average moai about 4 m tall and 1.6 m wide at the base [stated: Wikipedia "Moai"]; Tongariki's are taller and squatter (86 t) [stated]. Ours are 0.37 of their height wide [inferred].

**The ahu** (`ahu`): seaward wall of large dressed basalt slabs (1.4–3 m wide, 1.5–2.3 m tall) with smaller blocks coursed above; inland face of smaller squared blocks; top paved in flags; the ramp sloping from 0.42 of the platform's height to the plaza, paved with water-worn boulders (poro) and kerbed with set stones; low rubble wings at both ends [inferred from photographs of Tongariki and other ahu; the poro as paving material is stated for house forecourts by The Past, below].

**The quarry** (`quarry_bay`, `BAYS` in layout.js): almost all moai were carved at Rano Raraku; about 400 statues remain, half unfinished; carvers cut trenches along the sides to detach a statue, and in the last stage a keel of stone along the back was removed; finished statues were slid down to the soil of the lower slopes, set in pits and now stand buried halfway or more [stated: easterisland.travel "Rano Raraku"]. Ours: eight niches cut into the outer south-east face, each statue on its back, head up the slope, keel under its back, a 0.55 m trench each side, rock standing round it, basalt picks (toki) in the trenches [inferred]; 22 finished statues stand buried to the shoulders lower down, leaning a little [stated: buried; inferred: lean].

**Hare paenga** (`hare_paenga`): shaped black basalt blocks (paenga) set end to end form a boat-shaped foundation; holes in their tops held poles about 2 m long, pulled together and lashed to a ridge pole into a keel-like roof; a semicircle of water-worn stones (poro) before the entrance [stated: The Past]. Typical houses 12–16 m long, low, with an entrance so low people crawled; thatch of totora reeds, sugar-cane leaves or grass; earth ovens (umu pae) beside them [stated: easterisland.travel "Hare Paenga"]. Ours: 10–17 m long, 1.9–2.4 m wide, 2.2–2.7 m high; the door in a short thatched porch on the long side; a ring of stones set on edge for the umu [inferred: sizes, porch].

**Hare moa and manavai:** rubble cairns with small openings at their foot and slab caps; round walls of dry-laid boulders round sunken gardens [inferred from the Britannica description and photographs].

## 4b. Second pass: the eyes, the walking statue, the road, canoes, bananas, people

- **The eyes** (`moaiEyes`): in 1979 Sergio Rapu Haoa's team found that the eye sockets were made to hold coral eyes with black obsidian or red scoria pupils; statues with carved sockets were probably allocated to the ahu and ceremonial sites [stated: Wikipedia "Moai"]. Ours: every Tongariki statue has them, an almond of white coral (`coral`) 0.068 × 0.029 of the statue's height sunk in each socket, standing short of the rim, with a round obsidian pupil (`obsidian`, glossy black) [inferred: shown as on a ceremonial day; sizes from the sockets]. The eye sits on the carved socket floor, read off the mesh. Quarry and walking statues have no sockets and so no eyes [stated: sockets on ahu statues; inferred: none in transport].
- **The road and the walking statue** (`ROAD` in layout.js, `moai_walk`): the statues were "walked" upright with ropes from two sides, tilted from side to side while pulled forward [stated: Wikipedia "Moai"]; in the 2012 experiment 18 people with three ropes tied to the head of a 4.35 t, 3 m replica — two teams pulling forward from either side, one at the rear steadying it — moved it 100 m in under an hour [stated: HeritageDaily 2012]; the moai roads were about 4.5 m wide with a gently concave bed, the road statues had a slight forward tilt and broad D-shaped bases [stated: ScienceDaily 2025, Lipo & Hunt]; statues fallen during transport lie along the roads [stated: HeritageDaily]. Ours: a 4.5 m track (bare earth in the ground cover) from the foot of Rano Raraku to the plaza, houses kept off it; a 5.4 m statue on it, rocked 0.07 rad onto one edge of its base and leaning 0.05 rad forward, a rope round its neck under the jaw and three ropes from its left, right and back; seven haulers on each forward rope and five on the rear one, holding the rope at hand height, the rope's tail lying on the ground [inferred: the counts scaled to a larger statue, the rope of hau-bark fibre drawn in `sacking`]. The fallen statue now lies beside the road, face up, its head toward the coast [inferred].
- **Canoes** (`vaka`): Roggeveen's men (1722) saw a canoe of narrow pieces of wood joined together, light enough for one man to carry, the largest about 3 m; Cook (1774) saw three or four, 3–4 m long, "built of sewn planks of wood only up to 1 m long", "small, patched and unseaworthy" [stated: Hōkūleʻa archive, "Decline in fishing…"]; canoes carried two men [stated: same, Kotzebue 1816]. Ours: three canoes 3.3–4 m long drawn up above the shore east of the ahu, the hull dark, battens along three seams and across it every 0.8–1.05 m where plank meets plank, two thwarts, a paddle; a light outrigger float on two booms [inferred: the Polynesian norm; the outrigger is not in the sources read]. One or two fishermen by each.
- **Bananas** (`banana`): Roggeveen recorded that the islanders cultivated bananas, sugar cane and above all sweet potatoes [stated: Wikipedia "Easter Island"]; the manavai, circular stone walls, protected the plants within from the wind and held moisture [stated: Vernian Era "Features and sites"]. Ours: one to three banana stems (1.9–2.7 m) with broad, drooping, wind-torn leaves and a dead leaf hanging, in each manavai over 2.6 m across; the bamboo that stood in for them is gone [inferred: bananas in the manavai].
- **People** (`rapa-nui-people`, style `life`): men in the loincloth (hami) with a girdle of bark cloth, drawn as a skin-coloured short garment with a belt; women in wraps of bark cloth, white, turmeric-yellow, tan or brown [inferred: from the bark cloth (mahute) the dossier's sources mention; tattoo left out]. About forty on the plaza facing the statues, some seated, the walk up the middle left clear; nineteen haulers at the walking statue; fishermen at the canoes [inferred].

## 4c. Third pass (L3): weathering of the moai, the sweet potato gardens, a house being thatched, life at the houses

- **Weathering of the tuff** (`moaiRelief`): the Rano Raraku tuff "is porous and unusually soft"; salt crystallising inside it makes the statues "flake or spall", leaving "hairline cracks and honeycomb-shaped cavities", and lichens grow on many of them [stated: BBC Future 2025, "Is this the end for Easter Island's moai statues?"]. Ours, for 1500, mild: a broad unevenness of the surface (≈ 1.5 cm on a 7 m statue) and shallow pits where it has begun to flake, a little deeper on the head and shoulders; no lichen yet, no deep honeycombing — those belong to the centuries since [inferred: the statues are at most a few centuries old at our moment]. Every statue, ahu and quarry alike.
- **Sweet potato gardens** (`mulch_garden`, `fields()` in layout.js): the islanders' innovation was "lithic mulching – the practice of covering fields with gravel or rocks to trap moisture and improve soil fertility"; Roggeveen saw them cultivate "bananas, sugar cane, and above all sweet potatoes" [stated: Wikipedia "Easter Island"]. Ours: sixteen plots of 8–14 × 6–11 m on the plain and the lower slopes, strewn with stones (2.6 per m², basalt and scoria, 5–19 cm), a row of bigger stones round the edge, sweet potato vines in low clumps of heart-shaped leaves at 0.8 m between them; the ground's grass thinned there [inferred: plot sizes and spacing].
- **A house being thatched anew** (`hare_paenga` with `strip`): the roof's poles were pulled together and lashed to a ridge pole; the thatch was of totora reeds, sugar-cane leaves or grass [stated: §4a, The Past; easterisland.travel]. Ours: the house nearest the plaza has the old thatch stripped from its west two-fifths down to the frame — the arched poles from the curb to the ridge pole and the battens tied across them, the cut edge a thick roll of thatch — the floor's reed mats and a rolled bark-cloth seen inside; seven bundles of new reed laid beside it; three men at the work [inferred: the renewal, the mats and the work; the hare paenga were for sleeping and shelter from rain — MAA Convergence].
- **Life at the houses:** at every third house someone sitting or squatting on the paved forecourt and, at half of them, a woman squatting at the earth oven (`umu`), whose side is now fixed by the house's seed so the figure finds it; three to five chickens beside most chicken houses — "Fowls are the only animals they keep", and the hare moa were built to house them [stated: Wikipedia "Easter Island"; imaginarapanui.com: chickens valued for feathers and food].

## 4d. Batch pass: tupa, carved rocks, the carvers' camps, the chief's long house

- **Tupa** (`tupa`, `TUPA` in layout.js): stone structures, typically near the coast, closely related to the hare oka; astronomer-priests are said to have lived in them [stated: Wikipedia "Easter Island"]. Islanders told German excavators in 1882 that tupa had two doors, one for bad spirits to enter and one for ancestral spirits to leave; also called burial chambers for ariki, later chicken houses [stated: murrayfoote.com "tupa"]. Ours: three dry-laid basalt towers of 4.8-5.4 m across and about 3 m high, the wall straight to a third of its height then corbelled in course by course to a small opening closed by a slab, two low opposite doors with lintels, near the shore [inferred: the form and size].
- **Carved rocks** (`carved_rock`, `PETRO`): about 1,000 petroglyph sites with over 4,000 carvings; common subjects birdmen (concentrated at Orongo), sea turtles, komari, Makemake [stated: Wikipedia "Easter Island"]. Papa Vaka, on the north coast between Ahu Te Pito Kura and Pu o Hiro, has basalt slabs with a large double canoe (hulls 12 m), tuna and a shark, an octopus or crab, many fish hooks (mangai), turtles and cup holes [stated: imaginarapanui.com "Papa Vaka"]. Orongo lies at the south-west tip of Rano Kau, out of reach of this settlement (Tongariki is in the east), so the birdman carvings are not shown [stated: Wikipedia "Orongo"]. Ours: three tilted basalt slabs near the shore with a canoe, tuna, hooks, a turtle and an octopus as light lines inlaid in the dark stone; their placing near Tongariki is a compression of the island's geography [inferred].
- **The carvers' camps** (`quarry_camp`, carvers in town.js): most moai were carved with basalt toki (hand chisels) lying across the quarry; water splashed on the tuff softened it; one moai took five or six men about a year [stated: Wikipedia "Easter Island"]. Carvers first isolated a block, undercut it onto a keel and detailed the upper surface; workspace in the interior quarry was 30-50 cm wide, so at most about 15 carvers worked at once [stated: eisp.org]. Ours: heaps of tuff chips below each bay, toki lying about, a thatch lean-to on four poles with mats, gourds of water, a coil of rope and a stack of poles, and four carvers resting or sharpening at five of the eight bays [inferred: furnishings and rest].
- **The chief's long house** (`hare_paenga_long`, `CHIEF`): some hare paenga reached about 45 m [stated: Wikipedia "Easter Island"]; construction as §4a. Ours: 26 x 4.4 m, 3.6 m high, door to the plaza, a 1.2 m wide doorway (the real door was a crawl; raised so that it can be entered [inferred]), thatch over arched poles on purlins and a ridge pole with a second skin inside, a reed-mat floor, a ring-of-stones hearth, ten sleeping places with bark-cloth and wooden headrests, gourds, baskets, four obsidian-headed spears, cord festoons and bark-cloth rolls hung from the poles, a moai kavakava (a stooped ribbed wooden figure worn at ceremonies [stated: Wikipedia "Moai kavakava"]) on a stone, and a rongorongo tablet on bark cloth [inferred: furnishing]. A room of kind `hall` covers it.

## 4e. Living systems

- **People** (`movers.js`): men in loincloths, some cloaked in bark cloth, women in wraps, carriers with baskets (sweet potato), boys; walking between forecourts, the plaza, the road, the quarry camps, the garden plots and the canoes [inferred]. 22 by day, 2 at night.
- **Smoke** (`smoke.js`): steam from earth ovens at about half the forecourts at midday and evening, hearth smoke through the thatch of some houses and the long house [inferred].
- **Animals** (`fauna.js`): terns and noddies over the shore (drawn with the swallow's shape), frigatebirds high over the crater (the crow's shape) [inferred; the island's seabird colonies are noted in Wikipedia "Easter Island"].

## 5. The town

About forty hare paenga, chicken houses and garden walls scattered on the plain, kept off the statue road. [inferred]

## 6. Ground and water

Grass over red-brown soil; bare tuff on the cone; reeds in the crater lake; a dark rocky shore. The island was nearly treeless by then [stated: Wikipedia "Easter Island"]. Bananas grow in the manavai (§4b). [inferred]

## 7. Sky and climate

Trade-wind cloud, sunshine, passing squalls. [inferred]

## 8. Paths

From the plain to the plaza, facing the moai with the sea behind them. [inferred]

## 9. Sound

Chant (riu) with hand-clapping and a stamping stone; voices and a drone stand in, under the wind and the surf. [inferred]

## Sources

- [Tongariki — Wikipedia](https://en.wikipedia.org/wiki/Tongariki)
- [Rano Raraku — Wikipedia](https://en.wikipedia.org/wiki/Rano_Raraku)
- [Moai — Wikipedia](https://en.wikipedia.org/wiki/Moai)
- [Hare paenga — Wikipedia](https://en.wikipedia.org/wiki/Hare_paenga)
- [Easter Island — Wikipedia](https://en.wikipedia.org/wiki/Easter_Island)
- [Easter Island — Britannica](https://www.britannica.com/place/Easter-Island)
- [Pukao — Wikipedia](https://en.wikipedia.org/wiki/Pukao)
- [Hare paenga: the canoe-shaped houses and monumental archaeology of Rapa Nui — The Past](https://the-past.com/feature/hare-paenga-the-canoe-shaped-houses-and-monumental-archaeology-of-rapa-nui-easter-island)
- [Hare Paenga in Rapa Nui — easterisland.travel](https://www.easterisland.travel/blog/?p=521)
- [Rano Raraku, the quarry — easterisland.travel](https://www.easterisland.travel/places-to-visit/rano-raraku)
- [Easter Island statues walked into position, say experts — HeritageDaily (2012)](https://www.heritagedaily.com/2012/10/easter-island-statues-walked-into-position-say-experts/61152)
- [How Easter Island's giant statues "walked" — ScienceDaily (2025)](https://sciencedaily.com/releases/2025/10/251008030938.htm)
- [Decline in fishing due to deforestation and the lack of trees to build canoes? — Hōkūleʻa archive](https://archive.hokulea.com/rapanui/rapaforest.html)
- [Is this the end for Easter Island's moai statues? — BBC Future (2025)](https://www.bbc.com/future/article/20250702-the-indigenous-restorers-of-easter-islands-moai-in-the-face-of-climate-change)
- [Easter Island animals — Imagina Rapa Nui](https://imaginarapanui.com/en/easter-island-animals/)
- [Mathematical mysteries of Rapa Nui (hare paenga) — MAA Convergence](https://www.maa.org/book/export/html/2583279)
- [Tupa — murrayfoote.com](https://murrayfoote.com/tag/tupa/)
- [Papa Vaka — Imagina Rapa Nui](https://imaginarapanui.com/en/easter-island-sightseeing/easter-island-archaeology/papa-vaka/)
- [Moai kavakava — Wikipedia](https://en.wikipedia.org/wiki/Moai_kavakava)
- [Orongo — Wikipedia](https://en.wikipedia.org/wiki/Orongo)
- [Moai carving — EISP](https://www.eisp.org/544/)
- [Features and sites (manavai, hare moa, umu pae) — Vernian Era](https://vernianera.com/Archaeology/RapaNui/features.html)
