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

## 4f. Deepening pass: hamlets, houses to walk into, yards, wear, the open places

- **Hamlets** (`HAMLETS`, `village()` in layout.js): the village is 56 hare paenga in eight clusters (kainga) — round the chief's house, either side of the road's end, and out on the plain — each house clear of its neighbours by its length along the axis or by the forecourt and oven (9.5 m) across it; the doors face the sea or inland by hamlet [inferred: clustering of dwellings with their forecourts, as in the archaeology of hare paenga; the island's population is put at several thousand, so a village of this size is modest].
- **Common houses to walk into** (`hare_house`): the 21 houses nearest the arrival are widened (3.0–3.45 m) and raised (2.8–3.2 m) so that they can be entered, as the chief's long house is (the real door was a crawl — easterisland.travel "Hare Paenga" [stated]); the one nearest the arrival stays the open house being thatched. Furnished by kind [inferred: furnishing, from the long house and what is known of Polynesian houses]: sleeping (mats, bark-cloth blankets, wooden headrests, gourds, baskets of sweet potato, obsidian-headed spears), cooking (stone-ringed hearth, firewood, baskets of tubers, gourds of water, a flat stone for pounding, banana-leaf bundles, baskets hung), net-making (a net on two posts, festoons, coils of line, gourd floats, bone hooks, an adze), bark cloth (a basalt anvil with beaters, bast strips, sheets drying on a line, rolls, a dye of red earth), carving (a log of toromiro with a figure begun, adzes, obsidian flakes, shavings, a finished kavakava). The mulberry bast beaten into bark cloth is the island's mahute [stated: Wikipedia "Moai kavakava"/bark cloth are mentioned in §4b; the paper mulberry itself — inferred]. Someone at the work in each.
- **Yards** (`house_yard`): every house has three of: firewood and brush stacked at the wall; a rack with split fish and octopus drying; a frame of bark cloth; a net on poles with gourd floats; baskets and gourds; a mortar and grinding stone; reed bundles leaned at the end wall for the next thatching; wicker fish traps and sinker stones; a slab to sit on; always gourds and a basket at the door and stones strewn [inferred].
- **Wear of the thatch** (`thatch_wear`): paler patches of mended reed, hoops of lashing, damp streaks at the eaves, loose straw hanging [inferred: reed thatch in a wet trade-wind climate]. The ground about each house is trodden earth.
- **Planting**: sugar cane and paper mulberry inside the manavai (with the modelled bananas) — the manavai sheltered crops from wind and held moisture [stated: Vernian Era "Features and sites"; which crops — inferred]; toromiro scrub on the cone's north-west side, away from the quarry; stones of the shore.

## 4g. The open places: plaza, shore and lake

- **The plaza** (`plaza_dress`): three feast ovens (umu: a ring of stones round a pit, hot scoria stones, a cover of leaves, wood heaped); four rows of offerings on mats at the foot of the ramp (baskets of sweet potato, gourds, bunches of bananas, fish); eight poles hung with white bark cloth beside the walk; ten slabs to sit on along the edges; stones strewn on the pavement. [inferred: the ceremonies the ahu stood for; the earth oven (umu) is the island's way of cooking — easterisland.travel "Hare Paenga" [stated]].
- **The working shore** (`shore_works`): two fish racks, a net hung to dry on a line of five poles, the canoe builders' shed (thatch on four posts over a keel and ribs with planks laid on, stacked planks, an adze, sewing cord), driftwood, baskets and stones; five small plank canoes now. [stated: canoes of small sewn planks — Hōkūleʻa archive, §4b; the shed and the work — inferred].
- **The lake** (`pora`): two rafts of totora reed bundles on the crater lake [stated: reed-filled lake in the crater — Wikipedia "Rano Raraku"; the raft — inferred].
- **Life**: 36 walkers by day; steam over the plaza ovens; hearth smoke from the houses (always from cooks' houses); terns over the shore, frigatebirds over the sea; chickens in the yards.

## 4i. Detail pass: the ahu's masonry, the pukao, the chicken houses, the manavai, more houses to enter, fronts, postholes

- **The ahu** (`ahu` in src/styles/rapanui/index.js): the Ahu Vinapu wall is "large, carefully fitted slabs of basalt" [stated: Wikipedia "Ahu Vinapu"]; the sources read give no slab sizes or courses. Ours, added to the earlier slab wall [inferred]: wedge stones driven into the joint at each great slab's edge, a footing stone at its foot, a coping of squared stones along the top edge standing a hand above the paving, laid edge stones along the sloping edges of the wings, and every standing statue wedged round its base with small stones.
- **The pukao** (`pukaoGeometry`): cylinders with a dent below to sit on the head and a boss on top [stated: Wikipedia "Pukao"]; of red scoria, a vesicular rock [stated: Wikipedia "Moai"]. Ours: a drum a little oval, its sides faceted and pitted, the base edge ringed with grooves, a flat shoulder, and a separate top-knot with tying grooves set a little back [inferred: the faceting, pits, grooves].
- **Hare moa** (`hare_moa` in src/styles/rapanui/masonry.js): "substantial, carefully built stone structures with a long, narrow internal chamber and one or two small openings … just large enough for a chicken" [stated: vernianera.com "Features and sites"]; normally a single small opening, closed by a rock placed in the gap [stated: southamerica.cl "Hare moa"]. Ours: six courses of laid, battered stones (long side to the wall, each course set half a stone over the one below) round a core, rounded ends, capstones laid across; two small openings at the foot, one open with its rock lying beside it, one stopped with the rock; sizes and courses [inferred].
- **Manavai** (`manavai`): circular, sheltering plants from wind and holding moisture [stated: vernianera.com "Features and sites"]; lithic mulch covering gardens [stated: Wikipedia "Easter Island"]. Ours: a ring wall of five courses of dry-laid stones leaning in, a gap to go in by (open to the walker) with an upright stone at each side and a step stone, inside a bed of dark soil strewn with small stones and clumps of sugar cane (sugar cane grown, stated: Wikipedia "Easter Island"; its place in the manavai [inferred]).
- **Hare paenga curbs:** the paenga have holes in their tops that held the poles of the frame [stated: The Past]. Ours: a dark hole in the top of every second curb stone, in all the houses. The door's gap in the curb now stops at the jambs.
- **Fronts by rule** (`hare_house`, `hare_paenga`): from each house's seed one of four: the sill alone; flat stepping stones laid out from the sill; two upright stones at the jambs; a low windbreak of laid stones beside the pavement; the porch of the solid houses varies in width and length [inferred: the houses were not all alike].
- **More to enter:** 40 houses (from 22) are built to be entered, out to about 140 m; the doorway is three cells wide on an odd grid, a jamb-to-jamb gap; the wear of the thatch (paler patches, streaks, hoops, straw) no longer crosses the door of a house to enter.
- Level: L2, toward L3 (see the earlier passes).

### Sources added
- [Ahu Vinapu — Wikipedia](https://en.wikipedia.org/wiki/Ahu_Vinapu)
- [Hare Moa — Chicken Houses — southamerica.cl](https://southamerica.cl/easter-island/hare-moa.htm)

## 4j. Round 2: the faces and the statues' proportions

- **Faces** (`moaiRelief`, `moaiSection`): heavy brow ridge overhanging deep eye sockets, cheekbones with a hollow of the cheek below, flared nostril wings on the long nose, a deeper mouth line with a shadow under the lip, longer protruding ears from the brow to below the nose, the head broad at the brow and narrowing to the jaw; arms and hands cut bolder [stated: Wikipedia "Moai" for the features, as §4a; the degrees are inferred].
- **Each statue different:** width scaled 0.93-1.08 and depth a little with it, fixed by the statue's position, on top of the height already varied [inferred: statues were not cast to one pattern].
- Departure: none from §4a; the geometry's triangle count is unchanged.

## 4k. Round 3: ahu masonry, poro rows, pukao, quarry bays, hare paenga

- **Ahu walls** (`pillow` in `ahu`): both faces are built of blocks whose faces are drawn in on every edge (3-6 cm) so that each reads as a fitted slab with a fine joint, the face tops a little out of true; great slabs below, courses of smaller blocks above [stated: carefully fitted basalt slabs, Wikipedia "Ahu Vinapu"; sizes inferred].
- **Ramp** (`ahu`): the beach cobbles (poro) laid in wavering rows across the central 60 m, each row's stones alike, the next row set between them; scattered beyond [stated: poro paving, The Past; the rows inferred].
- **Pukao** (`moai`): each one's width, height, turn, tilt and set on the head fixed by the statue's position (0.88-1.14 wide, 0.8-1.3 high) [stated: 1.8-3 m across, Wikipedia "Pukao"; variation inferred].
- **Quarry bays** (`quarry_bay`): the cut face above the head stepped in three ledges, hewn blocks along the walls' tops, chips and spalls in the trench [inferred].
- **Hare paenga** (`hare_paenga`): the crescent pavement's poro laid in four concentric rows; the pole ends crossed and lashed over each end of the ridge [stated: poles lashed to a ridge pole, The Past; crossing inferred].
- Already in place from earlier passes: wings, plaza levelling, buried statues, the curb's pole holes, hare moa and manavai (§4i). Budget at the arrival: main 1.93 -> 2.03 M triangles (+5%), main draws 94 unchanged.

## 5. The town

Fifty-six hare paenga, chicken houses and garden walls in eight hamlets on the plain, kept off the statue road (§4f). [inferred]

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

### 4h. The approach and the first view (2026-11-12)

- **The way from the village to the plaza:** a paved way 5.2 m wide from z 42 to the plaza's edge, of beach cobbles (the plaza's pebbles) edged with dressed basalt kerbs, a stone missing here and there; the arrival stands on it. Hare paenga stood on curbs of dressed basalt with paved forecourts [stated: Wikipedia "Hare paenga"]; the paved way and its kerbs are [inferred] from them.
- **The yards beside it** (`approach_dress`): a woman's bark-cloth yard (a basalt slab to beat the bark on, the beater, a stack of the sheets, a line of them hung to dry between two poles), sweet potato in baskets on a mat with a rack of water gourds, a cooking hearth ringed with stones with wood heaped beside and flat stones to sit on [inferred: bark cloth (mahute) was made from the paper mulberry that the gardens show; the yards' places are ours]. Their people: the woman beating the bark, another by the drying line, a man standing by, at the mat a woman and an old man, two at the hearth, two children at a string game (kai-kai, the island's string-figure tradition [inferred]); chickens about.
- **Terns** (drawn as the small perching bird) resting on the heads of some of the ahu's statues, along the platform's back, on the shore's stones and the canoes' sterns.
- **The turf:** patches of drier, yellower and redder grass with the soil showing and stones in the thin places, in a broad low-frequency pattern, instead of an even cover.
- **A hamlet east of the plaza:** six more boat-shaped houses with their yards, three chicken houses and four garden walls on the plain east of the plaza (x 78–127), so that the plain to the right of the arrival is not bare [inferred: the villages lay along the coast between the ahu].

## 10. Match pass: the visitor's walk, night, sound, animals, wear (Suzhou as the reference)

Rapa Nui had no shops, streets or markets about 1500; "shops and houses" here are the houses, earth ovens, gardens and work places of §4c-§4g. No script is written anywhere: rongorongo is undeciphered and is not imitated (§10.5).

### 10.1 The visitor's walk
- The walk (`walks` in plan.js): from the arrival up the paved way to the plaza and the ramp (the existing route); then in at the door of each of the ten nearest houses to enter, over the sill, along the floor to the hearth's side, and in at the chief's long house's door. Eleven places opened, all walked by `walk-check`. [inferred: the route follows the furnished houses of §4f]
- Fixes found by walking: the long house's wall collider left no gap at its door (its ring was too coarse for 26 m: 88 points now, as the common houses' spacing) and no floor lay over its sill (a floor now covers the sill and the first of the pavement). The doorway stays 1.2 m in the carving [inferred, §4d] and about 2 m clear to the walker.
- Already in place from §4f-§4g and unchanged: houses with their yards, ovens and keepers (a woman at the oven, people on the forecourts, a worker in each furnished house), the yards by the way up (`approach_dress`), the plaza's feast ovens and offerings, the shore. There are no wells (the island has no springs near Tongariki; water was kept in gourds [inferred]) and no signs or shrines other than the ahu and the poles with bark cloth on the plaza (§4g).

### 10.2 Night (`nightlight.js`)
- What lit the island about 1500 was fire and nothing else: no lamp, candle, glass or lantern [inferred; wood was dear on a nearly treeless island (§6), so the fires were small]. Light is the engine's additive `halo` material, night only, shown at the low preset; the day view is unchanged.
- Houses to enter (`hare_house`): the hearth's pool on the mat floor and its glow in the room (cooking hearths brightest, sleeping ones banked), the thatch lit through over it, the glow in the doorway, the door's spill on the forecourt, the umu's embers (always at the cooks' houses, at half of the others). Shut houses (`hare_paenga`): 55% with a faint fire within, 45% with oven embers; the house being thatched stays dark. The chief's long house: the great hearth, the ridge lit, a wide spill at its door, its oven. The plaza's three feast ovens banked with embers; the cooking hearth of the yards by the way up; a driftwood fire in a ring of beach stones by the canoe builders' shed (the only new solid geometry: eight stones and an ash disc). [inferred throughout]
- Looked at: one night render of three houses at 2 m (door side): the thatch glow, the door's spill, the oven's embers and the shore-type fire read clearly. Not seen: the full-town night view (the in-game `--site` renderer fails to start in this environment).

### 10.3 Sound (`soundmap.js`, src/engine/voices-rapa-nui.js)
Placed where made, by hour and weather; all synthesised; none of it heard (measured with `tools/sound-render.mjs`: envelope, spectrum, pitches). No bell, dog, horse, pig or donkey: the island had none [stated: "Fowls are the only animals they keep", Wikipedia "Easter Island", §4c]; the profile keeps the cockerel and the sea birds.
- `rapSurf`: surf on the black rock along the whole shore, eight reaches, day and night, loud in weather [inferred: the sea on an exposed volcanic coast]; the shore's washes (`shoreSpot`) near the water.
- `rapToki`: basalt toki ticking on tuff at the quarry camps (§4d: toki, 30-50 cm workspace [stated: eisp.org]) 7-16 h, and inside carvers' houses.
- `rapTapa`: bark cloth beaten on a basalt anvil with a beater, in the yard by the way up, at the chief's house and in the tapa houses, 7-16 h [stated: mahute made on the island, §4f; the beater's knock inferred].
- `rapHaul`: the statue walked down the road: a leader's call, the teams' answer, rope groan, the stone's thud, 7-16 h [stated: walked with ropes from two sides, Wikipedia "Moai", HeritageDaily 2012, §4b; the call inferred].
- `rapStones`: hot stones laid in the umu, in the plaza's feast ovens in the afternoon and at the cooks' houses [stated: pit-oven, easterisland.travel; sound inferred].
- `rapRiu`: the evening chant with hand-clapping and a stamping stone on the plaza, 17-21.5 h, silent in rain [stated: dossier §9 "chant (riu) with hand-clapping and a stamping stone"; the melody inferred]. `rapPu`: a conch trumpet at dawn and dusk from the ahu [inferred: not in the sources read].
- `rapHen`: hens in the yards by the way up; `rapScurry`: a rat in the thatch at night [inferred: the Polynesian rat came with the settlers; not in the sources read].
- Rooms: each house to enter and the long house (kind-wise tone, thatch's soft rain, much of the outdoors let through). No trees, so no birdsong from trees (§6); little green; no frogs, no ponds, no wells.
- Test: tests/rapa-nui-sound.test.mjs (voices made, map agrees with the village, scheduling by hour and rain).

### 10.4 Animals (`fauna.js` `critters`; models `noddy` and `kiore` added to src/engine/critter-models.js)
- The island had chickens as "the only animals they keep" [stated: Wikipedia "Easter Island"; imaginarapanui.com] and no dog, cat, pig, goat, cow or horse before the Europeans [inferred from that statement]; so the critters are only: fowl, the Polynesian rat, and sea birds.
- Fowl: at each of the seven chicken houses nearest the arrival a cockerel and two hens scratching at the side of the small openings, on the fowl's rig (they walk and peck, keeping 1.4 m from the visitor) - 21 critters; the yards by the way up keep their static chickens.
- Kiore (`kiore`, the Polynesian rat, 0.14 m body and a tail of its own length, grey-brown, paler belly, on the dog's rig so that it stands and lies, out at night): five, at the foot of three chicken houses and at the sweet-potato stores of two cooking houses [inferred: the rat came with the settlers; not in the sources read].
- Noddies (`noddy`, a dark brown sea bird with a pale cap and black bill and legs, the silver gull's build recoloured; walks and pecks): eight on the black stones of the shore, east and west of the ahu [inferred: noddies and terns of the island's sea cliffs; colours the black noddy's]. The flying terns and frigatebirds are the earlier flights (§4e).
- Not done: sea turtles in the shallows, the rats' night behaviour beyond the rig's lying-down, nesting seabirds on the cliffs (the cliffs are off the disc).
- Test: tests/rapa-nui-critters.test.mjs (models known, none of the absent animals, never in a house hull, clear of the walks, at an animal's pace).
- Found broken on master and repaired here: src/engine/critter-models.js had lost the last four lines of `pigNeolithic` in the merge of stonehenge and bali-village (a syntax error that stops every critters test and the in-game renderers); the four lines are restored.
