# Machu Picchu, c. 1450–1530 — dossier

Settlement id: `machu-picchu` · Style: `inca` · Region: the Andes (Eastern Cordillera) · Code: `src/settlements/machu-picchu/`
Status of this dossier: L1–L2 (the saddle and its peaks, the terraces all round, the Temple of the Sun, the Sacred Plaza with the Main Temple and the Temple of the Three Windows, the Intihuatana on its hill, the Main Plaza, the houses in kanchas; ground, planting, weather, music). Second pass (§4.3): the canal and the sixteen fountains, the Royal Tomb under the Torreón, the Sacred Rock and its wayronas, the great stones, niches, pegs and altar of the Main Temple, the blind windows of the Three Windows. Third pass (§4.4, §5.1, §5.2): the plan turned the right way (it was mirrored north–south), the kanchas walled with their gateways, the town wall and its main gate, the dry ditch, the fields and the five storehouses, the Guardhouse on its knoll and the Funerary Rock, the quarry, the houses furnished, people and llamas. L3 (§4.5, §5.3, §7.1): lichen on the walls, the chaski's post and travellers on the road, tree ferns and bromeliads of the cloud forest. L3 recorded for later: the Temple of the Condor, Inti Punku and the trails, the walls' polygonal masonry in detail.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** Machu Picchu, a 15th-century Inca estate on a mountain ridge at 2,430 m, "on a narrow saddle between two mountain peaks, Machu Picchu and Huayna Picchu" [stated: Wikipedia (IPFS; mirror)]; built around 1450 for the emperor Pachacuti [stated: Wikipedia; World History Encyclopedia].
- **Moment shown:** the estate in use, c. 1450–1530.

## 2. Layout of the settlement (radius 330 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| The saddle's top | an ellipse 190 × 350 m, nearly level | [inferred from the site's plan] |
| Terraces | 15 rings round it, 3 m deep and 2.6 m high, stairs through them on three sides | hundreds of man-made terraces, for slope stabilisation and maize, built to drain the heavy rain [stated: Wikipedia; doc.surf] |
| Huayna Picchu | the peak to the north, 235 m above the town | [stated: the peak behind the town — Wikipedia; height inferred] |
| Machu Picchu mountain | the peak to the south, 290 m above | [inferred heights] |
| The canyon | the flanks falling about 175 m, the far side rising again | the Urubamba bends round Huayna Picchu [stated: michaelstephenwills quoting Wikipedia] |
| Main Plaza | in the middle, sunk a little, grassed | "a central complex of closely packed buildings arranged around a central square" [stated: World History Encyclopedia] |
| Temple of the Sun (Torreón) | west of the plaza | "curved tower built on a rock with a cave underneath" [stated: digital art archive]; adjacent to the royal residence [stated: Pressbooks] |
| Sacred Plaza | north-west of the plaza: the Main Temple (three walls), the Temple of the Three Windows | [stated: World History Encyclopedia; doc.surf] |
| Intihuatana | on the highest point of the sacred complex, west of the plaza, on a terraced hill | [stated: World History Encyclopedia; Pressbooks] |
| Houses | in kanchas on the west and east sides | [inferred] |
| Quarry | between the Sacred Plaza and the Temple of the Sun, west of the Main Plaza | [stated: michaelstephenwills] |
| Town wall, main gate, dry ditch | across the saddle at z 84–89, the gate at x 2 | the dry ditch "the result of a geographic fault line" parts the urban sector from the agricultural [stated: peru-explorer] |
| The neck | south of z 79: a strip 68 m wide, x −54…14 (§4.6) | [inferred] |
| Agricultural sector | south of the ditch: fields, five storehouses, the Guardhouse's knoll under Machu Picchu mountain | [stated: peru-explorer; imachupicchu] |

## 3. Orientation

The ridge runs north–south; the town looks along it to Huayna Picchu. [stated: general]

The first two passes had the plan mirrored north–south: the Intihuatana's hill, the Sacred Plaza and the Temple of the Sun lay south of the Main Plaza. As built now (−z north): Huayna Picchu and the Sacred Rock at the north end; the Intihuatana's hill north-west of the Main Plaza with the Sacred Plaza at its foot (Main Temple on its north side, Three Windows on its east, looking over the Main Plaza), then the quarry, then the Temple of the Sun and the royal residence by the first fountain; the eastern sector's kanchas across the plaza; the town wall, the ditch and the agricultural sector at the south end, the canal coming in from Machu Picchu mountain. [stated: the Sacred Plaza north-west of the Main Plaza — World History Encyclopedia; the agricultural sector to the south, the Guardhouse at its top — imachupicchu; inferred: distances, compressed to the ellipse]

## 4. The style

Dry-stone walls of granite — "smooth, seamless walls for elite buildings; rougher stone for common areas" [stated: digital art archive]; outward faces worked smooth like a mosaic; roofs of wood and thatch; trapezoidal doorways and windows [stated: Pressbooks]; thatch of ichu grass [stated: digital art archive].

### 4.1 Walls, openings, gables (detail, as built in `src/styles/inca/index.js`)

- **Batter.** "Inca exterior walls commonly slope inwards as they rise (typically around 5 degrees)", giving the buildings their trapezoid form [stated: World History Encyclopedia, "Inca Architecture"]. Built: both faces of every wall lean in by tan 5° of the height, capped so the wall-head keeps at least half the foot's thickness; corners mitred, so the leaning faces meet cleanly. [inferred: the cap, the mitres]
- **Trapezoids.** "The trapezoid motif was repeated in doorways, windows and interior wall niches" [stated: same]. Built: every opening narrows to 0.78 of its foot's width at the head [inferred ratio], with real reveals (jambs, head, sill); niches sunk 0.26–0.34 m into the inner face; doorways 1.0 × 1.95 m in houses, windows 0.42 × 0.55 m [inferred sizes].
- **Double jambs.** "Doorways and windows often also have double jambs and the former are usually topped with a large single stone lintel" [stated: same]. Built: a recess 0.13 m wider all round and 0.14 m deep on the outer face of the royal residence's doorways, the Main Temple's niches and the Torreón's north window.
- **Pegs and gables.** Roof poles were "fixed to the stone walls using stone pegs which protruded from them", the pegs "circular or square", some interior pegs perhaps for textile hangings; roofs of grass thatch on poles, steep in rainy regions, "often 60 degrees" [stated: same]. Built: solid stone gables carrying the wall up at about 55° [inferred: a little less than 60° so the thatch covers the rakes], five round pegs standing out of each gable's outer face under the eaves, a row of pegs inside under the wall-head.

### 4.2 The Temple of the Sun, the Intihuatana, the terraces (detail)

- **Torreón.** A curved wall on a natural rock, one of few curved Inca buildings; three windows, the largest to the north with a distinctive form cut at its base and small holes in its base stones; two smaller ones to the east aligned on the June and December solstices; the rock inside carved into long flat sections used as an altar; built over the cave of the Royal Tomb [stated: The Only Peru Guide, "Temple of the Sun"]. Built: the arc of battered ashlar with the two east windows set on the solstice sunrise azimuths (65° and 113° from north, for latitude 13° S — [inferred]), the north window double-jambed; the rock carved flat into a long altar with a step cut in its side. Not built: the drilled holes, the tomb's cave.
- **Intihuatana.** Carved directly into the bedrock, with complex planes and angles, a slightly inclined plane on top and "an upright stone column that tilts 13 degrees northward"; its base "squat and stubby" [stated: Wikipedia "Intihuatana, Urubamba"]. Built: an outcrop of rough granite, a carved platform and two lower cut planes on it, the post (0.48 × 0.34 × ~0.65 m [inferred size]) leaning 13° north, its top cut on a slant.
- **Terrace walls** of "loose rocks fixed with mud mortar or finely cut large blocks" [stated: World History Encyclopedia]; at Moray "each terrace is about 2 m high and has cantilevered steps to connect the levels" [stated: Rollinson, "Moray"]. Built: the retaining walls as continuous battered faces; now and then a flight of long stones set into the wall and standing out of its face, climbing across it on a slant [inferred for Machu Picchu from the Inca practice].

### 4.3 Second pass: the water, the tomb, the Sacred Rock, the temples' stones (as built)

- **The canal.** "749 m long", 10–12 cm wide and 10–16 cm deep, of cut stones, about 3% fall, from a spring on the north slope of Machu Picchu mountain through the agricultural sector into the town to the fountains; at the spring a collection wall about 14.6 m long and up to 1.4 m high [stated: waterhistory.org; ancientengrtech.wisc.edu]. Built: a channel 11 cm wide between kerbs of cut stone in blocks of 0.55–1 m, on a stone bed, water in it, from the foot of Machu Picchu mountain (the south peak in our frame) along the saddle's west edge 1.2 m in, to the head of the terrace wall over the first fountain; where it comes out at the mountain's foot a short battered wall holds the slope [inferred, after the collection wall]. Houses that stood on its line are left out.
- **The sixteen fountains.** "16 fountains, known as the stairway of fountains"; fountain 1 at the ruler's residence and reserved for him; a total drop of 26 m; each "a stone channel at the top and a sharp spout edge that creates a water jet for easy filling of an aryballo"; the water collects in a stone basin in the floor and goes on by a small circular drain; most partly enclosed by walls about 1.2 m high [stated: same]. Built: beside the west stair down the terraces (our compression: the town's own fall is not modelled), one fountain on each terrace level, the first beside the stair's head on the north and the other fifteen down its south side (39 m of fall); each a court 2 m wide with walls 1.2 m high open at the front corners, its back wall against the terrace wall, the spout stone with its channel and lip on the back wall's head, the jet curving down into a basin 0.84 × 0.62 m in a stone block, flags on the floor [inferred: sizes, the placing].
- **The Royal Tomb.** Under the Temple of the Sun, carved from the same rock; "a construction in the form of a hemicycle with three steps"; walls of "perfect symmetry" with large niches and smaller ones, "several stone cylinders" near the top of the walls [stated: Terandes, "Royal Tomb"]. Built: the Torreón now stands on its rock 3 m up (a stair of 15 risers up its east face), the rock faced with battered fine ashlar with great stones in the lowest courses; in the east face the trapezoid mouth of the cave; inside, walls of fine masonry with two great double-jambed niches in the back wall and a small niche in each side wall, stone cylinders standing out under the roof, the roof's rock bulging down, and the hemicycle altar of three steps against the back wall [inferred: the sizes, the mouth's side].
- **The Sacred Rock.** A granite monolith "carved in the shape of a mountain", about 3 m high on a base about 7 m wide, its base shaped like an altar, on the north side a few steps from the way to Huayna Picchu, "in the middle of two huayranas (altars) situated opposite each other, separated by a … courtyard" [stated: Tierras Vivas]. Built: a slab 6.8 m wide and 3 m high, thick at its foot and thinning to its outline (a long shoulder, the summit off-centre, a lower peak), on a base of two cut courses; two wayronas (three-walled halls, roofed in ichu thatch on stone gables, a beam over the open side) facing each other across the court before it [inferred: the outline, the halls' sizes].
- **The Main Temple.** "Two lateral walls and one rear wall"; "the base of the temple are large lithic stones supporting more regular sized and precisely carved stones"; "17 trapezoidal shaped niches"; "6 large stone pegs" on the rear wall [stated: theonlyperuguide]. Built: 7 niches in the rear wall and 5 in each side wall, six great pegs high on the rear wall, the lowest 0.9 m of every wall in great polygonal stones (slanting joints, kinked course lines, each face cushioned with its edges bevelled back into the joints), the great altar block 4.2 × 0.9 × 0.95 m against the rear wall [inferred: the altar's size, from photographs], the platform's edge a kerb of long blocks.
- **The Temple of the Three Windows.** "An immense trapezoidal wall, 10 meters long", three large trapezoidal windows, and "on both sides there are two additional closed windows (like niches)" [stated: imachupicchu; michaelstephenwills]. Built: the two blind windows either side of the three, great stones in the lowest courses.
- **The terrace walls** now run on to the very sides of the three stairs, where banks of bare earth 20 m long used to stand beside each flight.

### 4.4 Third pass: the way in, the Guardhouse, the quarry (as built)

- **The town wall and the main gate.** Built: a battered wall of rough stones 3 m high across the saddle from the canal to the east edge, its gateway 1.5 × 2.5 m double-jambed, and on its inner face over the lintel the stone ring and its boss for the bar that closed the door [stated: the main gate's ring — Machu Picchu guides; inferred: the sizes].
- **The dry ditch.** "The agricultural and urban sectors are split by a dry ditch, the result of a geographic fault line" [stated: peru-explorer]. Built: a ditch 2 m deep and 6 m across before the wall, closed at its west end, with a flight down into it and up out of it on the way to the gate, a paved floor between [inferred: the sizes].
- **The fields and storehouses.** "In the agricultural sector there are five rooms that look like Chincheros and Ollantaytambo storerooms" [stated: peru-explorer]. Built: maize in plots with grass between south of the ditch, the path to the gate kept clear; five small thatched stone rooms (5.4 × 4.2 m) in a row, their doors to the path, empty [inferred: sizes, places].
- **The Guardhouse.** "A simple enclosure, made of small stone and adobe", roofed in beams and ichu, with "three squared windows that offer a complete view of Machu Picchu", in the upper part of the agricultural sector [stated: imachupicchu, "The guardian's house"]; three walls and one open long side [stated: The Only Peru Guide]. Built: on a knoll of six terraces (13.2 m) at the saddle's south end, under Machu Picchu mountain; rough granite walls 2.7 m high, open to the north over the town, three small windows in the south wall, a niche in each end wall, thatched; a stair up the knoll's north face [inferred: the knoll's form, the open side]. The arrival view is from beside it.
- **The Funerary Rock.** "A capriciously carved stone monolith in the shape of a square" with a small staircase cut in the same rock, a few steps from the guardian's house [stated: same]. Built: a squared monolith with its cut stair on the knoll's top.
- **The quarry.** The Inca quarried the granite for Machu Picchu on the ridge itself, in the town between its sectors [stated: michaelstephenwills, "Views from the Quarry"]. Built: a field of fractured boulders, blocks squared on their faces lined up along its east side for dressing [inferred: the arrangement].
- **The foot plough.** The chakitaqlla: a shaft about 1.45 m long, a footrest of two pegs lashed on about 45 cm up, a handle near the top, the blade 40 cm long in a socket at the foot [stated: Museum of Old Techniques (MOT), "Chaquitaclla"]; "a hard-wood or bronze point" [stated: ancient-history-sites, "Work and Household Production in the Inca World"]. Built: as stated, the blade in the earth before each ploughman.
- **The backstrap loom.** The near bar tied to the weaver's waist, the far bar to a post [stated: Wikipedia, "Backstrap loom"; "Andean textiles"]. Built: the two bars, the warp between with the cloth woven at the near end, a peeled post [inferred: sizes].

### 4.5 L3: lichen on the stone (as built)

- The granite of the Sacred Rock is colonised by "a wide variety of biocolonizer species" — lichens, algae, mosses, cyanobacteria — most of which have penetrated the porous stone [stated: ScienceDaily, "Biocolonizer species are putting the conservation of the granite at Machu Picchu at risk" (Univ. of the Basque Country, 2019)]. **Built** (`lichen`, src/styles/inca/index.js): on every Inca wall small crusts 0.1–0.45 m across — pale grey-green, whitish, now and then rust-orange — about one to every eleven square metres of face, more toward the wall's head, laid on the battered face at its lean; on the outer face of houses and temples, on both faces of the kancha walls and the town wall; kept off the openings [inferred: the colours, the density]. The rough stone (`granite_rough`, the rocks and the Sacred Rock) already carries lichen in its material.

### 4.6 Sixth pass (the arrival review): the neck, the gorge and the Guardhouse's yard (as built)

The browser review found the arrival on a flat field with Huayna Picchu a lone cone: the saddle was a 190 × 350 m ellipse, so from its south end the edges lay outside the 98° view and the canyon's walls (60–120 m, 260 m out, faded at the rim) stood below the horizon.

- **The neck.** The site is a narrow spine: "on a narrow saddle between two mountain peaks" [stated: Wikipedia]; the way in, the dry ditch and the agricultural sector follow its crest at the south end [stated: peru-explorer]. Built (`NECK` in layout.js): south of z = 79 the saddle is only 68 m wide (centred on x = −20), its edges cut straight across at the shoulders; the terraces (15 of 2.6 m) fall away on both sides of it, the shoulders' walls run across, and the town wall (now across the neck only, the gate at x = 2) stands over the first. The terrace rings of the ground and of the walls follow the same shape (`outside()`: the ellipse's growth, cut to the neck; plan.js draws the ellipse's arcs, the shoulders' lines and the neck's edges, flights of stones on the long ones). The canal follows the neck's west edge, turns the shoulder's corner and runs along the shoulder to the ellipse. The storehouses moved west into the neck [inferred: places].
- **The Guardhouse's knoll** is now 17.6 m (eight terraces) so that the arrival stands 19 m over the neck [inferred: the real Guardhouse overlooks the whole site]; the stair up its north face has porters and a woman with a pot on it; maize on the middle of its treads, llamas and a boy herding them.
- **The gorge.** The far walls of the Urubamba's canyon stand 90–160 m over the town, 210 m out on both flanks, and round Huayna Picchu (two ridges at its shoulders and one behind it), crests rounded, so that the peak stands in a V of mountains from the arrival [inferred: heights compressed to the disc]. Mist emitters in the gorge on both sides of the neck.
- **The neck's life.** A team of three ploughing a plot with the foot plough, a woman with her hoe facing them, women weeding on the other side of the road, two spearmen at the gate [inferred; the work after the MOT and Rowe sources of §4.4]; the flagged road carried on from the ditch to the knoll's foot.
- **The yard.** An apacheta — a cairn of flat stones with offerings (a coca bundle, pots, a pole with a red cloth) — a stone brazier, firewood, jars and a seat for the watch [inferred: after the apachetas of the Inca roads].
- **Roofs and walls.** A third of the houses newly thatched in golden ichu, the rest weathered dark; lichen and damp on the terrace walls' faces as on the houses'.

## 5. The houses

Rectangular rooms of rough granite set in clay, a trapezoid door on the court, niches in a row inside, now and then a small window, stone gables with their pegs carrying steep thatched roofs; grouped in kanchas, "three (or more)" buildings round a walled patio [stated: World History Encyclopedia]. The royal residence's doorways double-jambed. [stated: thatch, trapezoids, pegs; inferred: the counts and sizes]

### 5.1 The kanchas and the houses' things (as built)

- **Kanchas.** "Three (or more)" one-room buildings round a patio, the whole walled, a single gateway into it [stated: World History Encyclopedia, "Inca Architecture"]. Built: 20 × 24 m enclosures in rows with lanes between, their gates to the Main Plaza's side; a long house across the back, a house on each side, the patio open to the gate; the kancha wall (2.4 m, rough stones, battered) runs only where no house stands, a gateway in the middle of the gate side, some double-jambed; single houses where no kancha fits [inferred: the arrangement, after the eastern sector].
- **Furnishings.** "Textiles and mats furnished spaces that would otherwise have been bare floors", blankets, "clay cooking installations, earthenware pots and wooden utensils", jars, grinding stones [stated: ancient-history-sites, "Housing and Living Conditions in the Inca World"]. Built in every house: the clay stove (q'uncha) in a back corner with two pot holes, a pot on it and sticks beside it; the batán and its rocking stone with a bowl of meal; sleeping mats along a side wall with folded blankets; an urpu by the door; pots and bowls in some niches [inferred: the places, after Andean houses today].
- **The urpu.** Pointed base, globular body, tall flaring neck, two strap handles low on the body and a lug on the shoulder for the carrying rope [stated: Met Museum, "Urpu (jar)"].

### 5.2 People and animals (as built, `people.js`)

- Ploughing teams on three terrace strips: men side by side with their foot ploughs, a woman facing them across the furrow with a hoe to break the clods [stated: men side by side — MOT; the wife "faced him with a hoe to break clods" — Rowe, in ancient-history-sites]; the strips' soil turned.
- Llama herders and their animals grazing on the Main Plaza, a string of llamas on the way in through the fields.
- Women weaving on backstrap looms in about half of the kanchas' patios, kneeling.
- Quarrymen dressing blocks; a noble in a red mantle and a priest before the Main Temple; chosen women (aqllakuna) in white at the Three Windows; a guard seated in the Guardhouse.
- Dress: the men's knee-length tunic (unku) and mantle, the women's ankle-length wrap (anaku) under a shawl (lliklla), sandals [stated: encyclopedia.com, "America, South: History of Dress"]. [inferred: the numbers, places and colours]

### 5.3 L3: the chaski's post and the road (as built)

- "Each chasqui carried two items, a quipu and a pututu"; the quipu stored and carried information in knotted strings; the pututu was a conch shell used as a trumpet to signal a runner's approach so that the next could get ready; relay stations (tambos) and huts for rest and shelter (chaskiwasi) [stated: Wikipedia, "Chasqui"]; Guaman Poma names the "hatun chaski" (chief courier) and the "churu mullu chaski" (the courier who carries a trumpet shell) [stated: Guaman Poma, Nueva corónica, drawing 138 (Royal Danish Library)]. **Built:** by the road south of the fields a small thatched hut of rough stone, its door to the road (`inca_house`), a granite bench before it (`chaski_bench`) with a pututu and a quipu laid out on it (the main cord, ten pendant cords in white, brown, red, ochre and black with their knots); a runner seated on the bench, another standing at the road's edge looking south; on the road travellers with their loads in a cloth on the back, a woman carrying her child, another with a load, a man going out, two llamas and their driver [inferred: the post's place, the runners' white tunics with a red belt, the travellers].

## 6. Ground

The saddle level; the plaza sunk 2.4 m; the Intihuatana's hill in five terraces to 11 m; the Guardhouse's knoll in six to 13.2 m; the dry ditch 2 m deep; the terraces stepping down 39 m; the slopes below falling into the canyon; the peaks. No water in the disc (the river is beyond it). (`ground.js`)

## 7. Planting

Grass on the terraces and the plazas; maize in plots in the fields south of the ditch, the ploughed strips bare soil; cloud forest on the slopes and the peaks. [inferred]

### 7.1 L3: the cloud forest's tree ferns and bromeliads (as built)

- In the cloud forest of the Machu Picchu area "the most spectacular are the arboreal ferns", Cyathea "7 to 15 meters" high, living in fresh, humid and shady places [stated: Inkaterra Asociación, "Ferns, Heliconia & Bromeliads"]. **Built** (`src/styles/inca/plants.js`, instanced solids — the flora catalogue has neither): some 700 plants on the slopes below the lowest terrace and round the peaks, within 70 m of the terraces: tree ferns 3–5 m high (smaller than the stated, as young plants among the trees) with a dark trunk and a crown of eleven arching fronds cut into pinnae; terrestrial bromeliads, rosettes of stiff strap leaves round a red heart [inferred: the bromeliads, the sizes and the density].

## 8. Sky and weather

Bright sun between clouds, mist rising from the canyon; latitude 13° S. [inferred]

## 9. Sound

Panpipes and the quena flute, drums, the conch (a flute, a reed and a struck sound stand in). [inferred]

## 10. Fourth pass: the kallanka and the living systems (as built)

- **The kallanka.** "Kallankas were the largest Inca buildings"; the entrance is "normally on one of the long sides, with equally spaced doors", the opposite side "niches or windows but no doors"; gabled thatched roofs, steep (about 45 to 80 degrees), stone "nails" on the gables; a single undivided hall; those on a main square usually opened onto it; at Machu Picchu "the largest building, a kallanka, measured 47.5 by 6.5 m" [stated: Wikipedia, "Kallanka"]. **Built** (`inca_house` with `doors: 7`, `KALLANKA` in layout.js): 47.5 x 6.5 m on the Main Plaza's east side, seven equally spaced doors to the plaza, windows and niches alternating in the back wall, pegged gables and an ichu roof; the kancha grid keeps clear of it [inferred: its place, the wall height 3.3 m]. Inside (`hallInterior`): a row of tall urpu along the back wall with bowls, mats with folded blankets at the doors' lines, a ring of stones for a fire mid-hall, the floor before each door clear [inferred: after feast furnishings].
- **People.** Walkers by kind (men in unku and mantle, women in wrap and shawl, porters with loads on the back, mothers with a child, nobles in red with the cap, priests and aclla in white) on the plaza, the lanes between kanchas and the road through the gate; about 26 by day, 3 at night [inferred: numbers]. Dress as 5.2.
- **Smoke and birds.** The houses' hearths smoke through the thatch at the three meals, the kallanka's too, mist rises from the cloud forest at dawn; swallows over the terraces, condors (the crow form stands in) high over the peaks, sparrows on the plaza and the kallanka's wall-head [inferred].

## 11. Fifth pass: the packed town and its dressing (as built)

- **Density.** The urban sector is "a central complex of closely packed buildings arranged around a central square" [stated: World History Encyclopedia]. Built: after the 20 x 24 m kanchas, a second pass packs smaller kanchas (18.5 x 17 m, the same three-house plan) into every gap, their gates to the nearer lane; 31 kanchas and about 90 houses now stand where 13 and 52 did; the road from the gate to the plaza and the Sacred Rock's lane are kept open. [inferred: sizes, the packing]
- **Patios.** Each patio carries four or five of: a mat with heaps of chuño (dark) or maize drying on it, a stack of firewood, a cell of rough stones with guinea pigs (cuy) under a reed lid, urpu leaning together, a line of washing between two posts, an open hearth of three stones with a pot, a grindstone on its mat, a stone seat; the weavers' looms keep the middle. [stated: mats, pots, jars, grinding stones — ancient-history-sites; inferred: the arrangement after Andean patios today; cuy kept at the house — general]
- **Fronts.** Houses vary in height by seed; on half of them strings of maize cobs hang under the eaves beside the door; on most, a stone bench against the wall beside the door or a notched-pole ladder leaning to the eaves. [inferred]
- **Streets.** The road from the gate to the plaza is flagged with rough granite; every kancha's gate has a flagged strip before it where level. [inferred]
- **Storehouses.** The five qollqa hold round wicker bins of maize, sacks of tubers, jars, fleeces. [inferred: contents after the qollqa's purpose]
- **Offerings.** On the Main Temple's altar: llama figurines of gold and silver, spondylus shells, kero cups, a bowl of maize [stated: such offerings — general, Inca religion; inferred: the arrangement].
- **The Temple of the Condor.** A condor's head carved in a boulder at the front of a flat floor, a ruff of white stone behind, two slabs of rock rising either side like wings, walls behind with cells [stated: Lonely Planet; Tierra de los Andes; imachupicchu (titles of the pages consulted; details inferred)]. Built north-west below the Sacred Plaza (`CONDOR` in layout.js): floor, hooked-beak head, white ruff, two leaning feathered slabs, back and side walls; a priest before it.
- **The plaza.** A feast: six mats in a ring round three tall urpu of maize beer (aqha) and a small fire, four people seated, a woman serving; two men talking before the kallanka. [inferred]
- **Terraces and fountains.** Maize on whole sectors of the terraces, the stairs kept clear; ten llamas grazing in twos on the terraces' grass; women with a jar at every third fountain. [inferred]
- **Life.** Per patio: a man with a load at the gate, a child, a dog asleep in every other; porters and a string of llamas on the road; sparrows in patios and on gate walls.

## 12. Seventh pass: the Intihuatana, the fronts and uses of the houses, the gates (as built)

Status: L3 in the Sacred Sector's stone and the houses; the Inti Punku and the trails, and the walls' polygonal masonry beyond the lowest courses, stay recorded for later.

### 12.1 The Intihuatana and the Sacred Sector's furnishing

- "Carved into the shape of a pyramid" out of the bedrock, on a polygonal base with terraces, two huayrana-type rooms and a natural mound; two long stairs, north and south, the south one cut for most of its length from a single rock; a granite block serving as altar, bench or shelf; small carved channels like stairs; a slightly inclined upper plane and a column leaning 13° north, with a cubic protrusion on its top; 1–2 m high [stated: salkantaytrekking, "The Intihuatana stone at Machu Picchu"; Wikipedia, "Intihuatana, Urubamba"]. **Built** (`intihuatana`, src/styles/inca/detail.js): a ten-sided worn mound of rough granite (0.45 m), a squared carved tier with cut corners (to 0.85 m), the inclined platform (1.2 m north edge, 1.14 m south), each rise within a walking step; a stair of five steps south and four north; the post with its slanted top and a 0.14 m cube; the altar block west of the mound; a carved ledge east of the tier; and on the hill's top the two wayronas (`inca_temple`, thatched, open to the stone) north and south of it [inferred: the sizes, the rooms' places; the stairs' steps]. The old lathe-blob outcrop is gone.
- **Torreón, the north window.** "A unique form cut into the stones at its base"; "several carefully crafted small holes" in the base stones; the interior is the top of the natural rock, "carved with long flat sections for use as an altar" [stated: The Only Peru Guide, "Temple of the Sun (Torreón)"]. **Built:** three stepped courses under the north window's sill, each wider and further out than the next above, dark holes on their tops [inferred: the cut itself is only suggested by the steps].
- **Textiles on the Main Temple's pegs.** Interior pegs "perhaps for textile hangings" [stated: World History Encyclopedia, "Inca Architecture"]. **Built** (`inca_hangings`): from each of the six great pegs of the rear wall a banner of black, red, ochre and white bands falling against the wall above the niches, a fringe at the hem [inferred: the bands, the sizes].
- **The wayronas of the Sacred Rock** now each have a long granite bench along the back wall with the offerings of the Main Temple's altar on it (gold and silver llamas, kero cups, a bowl of maize) [inferred: the three-walled halls held altars; offerings after Wikipedia, "Inca religion"].

### 12.2 The fronts of the houses, by rule (`houseKind` in layout.js, `town.js`, `inca_house`)

Every house has a rank by its distance from the core of the town (the Sacred sector, the plaza, the kallanka, the way in): 0 within 14 m, 1 to 38 m, 2 beyond. The Inca built "smooth, seamless walls for elite buildings; rougher stone for common areas" [stated: digital art archive]. **Built:** rank 0 (the nobles'): fine ashlar, the double-jambed door, a monolithic lintel stone, a threshold stone, two small trapezoid windows either side of the door, now and then tall; rank 1: rough stones, a lintel, a threshold on half, a front window on a third, a third newly thatched in pale ichu, one in seven in fine stone with the double jamb, one in eleven tall; rank 2 (the humble, at the edge): lower walls, a narrower and lower door (0.9 × 1.8 m), no lintel or step, a woodpile against the wall beside it, no bench or ladder. The strings of maize cobs hang on the first two ranks only [inferred: the rule and the sizes].

### 12.3 The uses inside (`src/styles/inca/uses.js`)

Women did most spinning, often while walking, the wool drawn out by hand and twisted on a spindle, a straight stick weighted by a whorl; weaving was on a belt loom; masons dressed blocks with heavy stone hammers; a rocker mill crushed grain [stated: ancient-history-sites, "Work and Household Production in the Inca World"]. Beside the stove, the batán, the mats and the urpu every house has, the free front half of the room now holds by use [inferred: the arrangement, and the uses of store and brewer, after Andean households]: a **spinner's** (a reed mat with wool in bundles of every colour, a basket of fleece, a spindle with its whorl, two low seats); a **storekeeper's** (wicker bins of grain, sacks of tubers, two jars); a **mason's** near the quarry (a granite bench on two stones, a half-dressed block, three hammerstones, a bronze bar, sand, dressed blocks stacked); a **brewer's** (three tall jars of maize beer, a pot on three stones with its fire, a paddle); the **nobles'** (a dais of cut granite with a hide, kero cups, tall jars, and cloths hung from every second inside peg). Rooms narrower than 7 m keep the plain furnishing.

### 12.4 The lane before the gates

"Drainage channels run into stairways, walkways and buildings, carrying runoff to the main drain"; drainage holes are built into city walls and structures [stated: ancientengrtech.wisc.edu, "Machu Picchu Water Management"]. **Built** (`inca_gate_dress`): before every kancha's gate, on the level ground beside its stair, two of: a water jar standing in a ring of three stones, a cut stone seat, a bundle of firewood leaning with its cord, the short gutter of kerb stones that takes the patio's water out [inferred: the jars, seats and wood, after Andean lanes today].

### Sources of §12

- [The Intihuatana stone at Machu Picchu — Salkantay Trekking](https://www.salkantaytrekking.com/blog/the-intihuatana-stone-at-machu-picchu/)
- [Temple of the Sun (Torreón) — The Only Peru Guide](https://theonlyperuguide.com/?p=6034)
- [Work and Household Production in the Inca World — ancient-history-sites](https://www.ancient-history-sites.com/?p=141784)
- [Machu Picchu Water Management — UW–Madison](https://ancientengrtech.wisc.edu/machu-picchu/machu-picchu-water-management)

## Sources

- [Machu Picchu — Wikipedia (IPFS snapshot)](https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Machu_Picchu)
- [Machu Picchu — Wikipedia (mirror)](https://wiki.riteme.site/wiki/Machu_Pichu)
- [Machu Picchu — World History Encyclopedia](https://www.worldhistory.org/audioplayer/en/1-11930/)
- [Machu Picchu — Pressbooks (ARTH 2720)](https://uen.pressbooks.pub/arth2720/chapter/machu-picchu/)
- [Inca Architecture — World History Encyclopedia](https://www.worldhistory.org/Inca_Architecture/.md)
- [Intihuatana, Urubamba — Wikipedia](https://en.wikipedia.org/wiki/Intihuatana,_Urubamba)
- [Temple of the Sun (Intiwasi) — The Only Peru Guide](https://www.theonlyperuguide.com/peru-guide/machu-picchu/highlights/temple-sun-intiwasi%20/)
- [Moray — S. Rollinson (cantilevered terrace steps)](https://srollinson.blogspot.com/2018/09/moray.html)
- [City of Machu Picchu — digital art archive](https://digital-art-archive.vercel.app/art/161)
- [Machu Picchu — doc.surf](https://www.doc.surf/wiki/machu-picchu)
- [Machu Picchu water — WaterHistory.org](https://waterhistory.org/histories/machu)
- [Machu Picchu Water Management — UW–Madison, Ancient Engineering Technology](https://ancientengrtech.wisc.edu/machu-picchu/machu-picchu-water-management)
- [Royal Tomb — Tierra de los Andes](https://terandes.com/en/blog/machu-picchu/royal-tomb)
- [Sacred Rock — Tierras Vivas](https://www.tierrasvivas.com/en/sacred-rock-machu-picchu)
- [Main Temple — The Only Peru Guide](https://theonlyperuguide.com/?p=5989)
- [The Temple of the 3 Windows — imachupicchu](https://imachupicchu.com/?p=209)
- [Temple of the Three Windows — michaelstephenwills](https://michaelstephenwills.com/tag/temple-of-the-three-windows/)
- [Kallanka — Wikipedia](https://en.wikipedia.org/wiki/Kallanka)
- [Machu Picchu — peru-explorer](https://www.peru-explorer.com/machu.htm)
- [The guardian's house — imachupicchu](https://imachupicchu.com/?p=188)
- [Views from the Quarry — michaelstephenwills](https://michaelstephenwills.com/2023/08/28/views-from-the-quarry)
- [Chaquitaclla — Museum of Old Techniques (MOT)](https://www.mot.be/resource/Tool/chaquitaclla?lang=en)
- [Chaquitaclla, the native footplough — MOT (PDF)](https://www.mot.be/webhdfs/v1/website/opzoeken/lectuur/artikels/chaquitaclla.pdf)
- [Housing and Living Conditions in the Inca World — ancient-history-sites](https://www.ancient-history-sites.com/?p=141780)
- [Urpu (jar) — The Met](https://www.metmuseum.org/art/collection/search/310520)
- [America, South: History of Dress — encyclopedia.com](https://encyclopedia.com/fashion/encyclopedias-almanacs-transcripts-and-maps/america-south-history-dress)
- [Andean textiles — Wikipedia](https://en.wikipedia.org/wiki/Andean_textiles)
- [Biocolonizer species are putting the conservation of the granite at Machu Picchu at risk — ScienceDaily](https://www.sciencedaily.com/releases/2019/02/190214100044.htm)
- [Chasqui — Wikipedia (IPFS mirror)](https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Chasqui)
- [Guaman Poma, Nueva corónica y buen gobierno, drawing 138 — Royal Danish Library](https://poma.kb.dk/permalink/2006/poma/352/en/text)
- [Temple of the Condor — Tierra de los Andes](https://terandes.com/en/blog/machu-picchu/temple-of-the-condor)
- [The Temple of the Condor — imachupicchu](https://imachupicchu.com/?p=220)
- [Temple of the Condor — Lonely Planet](https://www.lonelyplanet.com/peru/machu-picchu/attractions/temple-of-the-condor/a/poi-sig/1378638/363402)
- [Ferns, Heliconia & Bromeliads — Inkaterra Asociación](https://inkaterra.com/inkaterra-asociacion-org/en/research/cloud-forest/ferns-heliconia-bromeliads)

## Terraces of the town (fix pass, Nov 2026)
- [inferred] The urban sector stands on levelled platforms stepping down the saddle's flanks, not on one flat field: round the core (Sacred sector, Main Plaza, kallanka, the way in) the lanes fall 1 m a band of 13 m, three bands to the first terrace of the ring; each kancha stands on its own platform raised 0.5 m over the lane, held by its battered wall, with a stair up from the lane at its gate (layout.js: laneLevel, platformAt, STAIRS).
- [stated: general] The Main Plaza is sunk below its surroundings; here 3 m in two walled tiers, with flights down at the road, the west side and the kallanka's middle door. The dry ditch before the town wall is now cut (2 m), its banks matching the stairs.

## 4.7 Round 2: the landmark seen close (as built)

- **Fitted ashlar over the whole face.** The temples' and the Torreón's walls were smooth above the great stones; now courses run to the wall-head on both faces, each course about 4.5% lower than the one under it, staggered head joints, each block's face cushioned with bevelled edges, the courses stopping short of every opening [stated: Wikipedia, "Inca architecture": fine ashlar for temples, "smooth, seamless" fit; inferred: course heights 0.47 m shrinking, block lengths 0.8–1.35 m]. The Torreón also gets great stones in its lowest 0.9 m.
- **Gables of the temples** are laid in courses like the walls (raised bedding and staggered head joints); their thatch is laid in overlapping bundles (a rib per course) with a thick ridge roll of ichu [inferred from Andean ichu roofs].
- **Intihuatana:** a sixteen-sided bedrock mound in two stages with weathered lumps at its foot, the tier in two courses, two cut planes stepping down west and one south, the post chamfered at its corners with a slanted top and a cube with its own slanted face [stated: Wikipedia, "Intihuatana, Urubamba": many planes and angles, post tilted 13°; inferred: sizes].
- **Terrace walls** use the fitted-block material (coursed ashlar texture) instead of rough rock [stated: World History Encyclopedia: "finely cut large blocks" where fine].

## 13. Reference pass: the visitor's walk (as built; `walk.js`, `walkroutes.js`)

Machu Picchu had no shops: the Inca state had no market and no money, goods went by the state's stores and by gift and levy (so there is no stall to open) [stated: general, Inca economy; inferred as to this site]. What the visitor can enter is therefore the state's and the households' own rooms.

- **The walk.** From the arrival on the Guardhouse's knoll down its stair, across the fields to the way in, the dry ditch's stairs, the main gate, the flagged road to the Main Plaza; west along the Sacred Plaza's front; east across the plaza to the kallanka; the Torreon's stair [inferred: the order, after the site's present visitor route in the other direction].
- **Opened places** (a doorway 1.7 m wide, its lintel 2.2 m up, the wall raised to 2.8 m for the stone over it: wider than the 1.0 m of a house's door elsewhere, because the walker is 0.6 m across and the Inca door itself was narrow; [inferred] and a concession to the walker, marked as such): the three houses of each kancha whose gate lies within 25 m of the walk (three kanchas: their gateways widened to 1.75 m); the priest's house on the Sacred Plaza; the two houses of the royal residence's side; the chaski's hut by the road; the five storehouses (qollqa) with their goods; the kallanka's seven doors (all 1.7 m wide, 2.3 m high). Each house keeps what 5.1 and 12.3 give it (the stove, the batan, the mats, the urpu, the use).
- **Moved to keep the way open:** the porter and the two women on the knoll's stair to its edges; the chaski's bench and the seated runner 0.7 m along the wall, off the door's lane.
- **Routes** (`plan.walks`, 24): the arrival to the gate and up the road; into each opened house from the lane through the gateway and across the patio; into each storehouse, the hut, the priest's and the royal houses; the kallanka's first, middle and last door.

## 14. Reference pass: the night (as built; `nightlight.js`, `FIRES` in `walk.js`)

- **What lit the place.** The Inca had no oil lamp: the light was the hearth of each house (the q'uncha, banked under its ash overnight), the torch at the gates of the state's buildings and the brazier of embers at shrines, the runners' post and the watch [inferred: general, Inca; no lamp is attested at the site]. Windows were unglazed and unshuttered, a door had a hanging mat or none: a lit house shows through its doorway and the smoke-hole of its thatch [inferred]. No Chinese-style lantern, no candle.
- **Built.** One element, `mp_glow` (one halo mesh, one draw whatever the number of lights): a glow ball at the hearth and a lit doorway sheet with its spill on the step for every house with its hearth lit (within 140 m of the arrival or 45 m of the walk), the chaski's hut, the kallanka's central hearth with its seven doorways dimly lit, the feast's fire on the plaza, the watch's brazier on the knoll, and the flames of `mp_fire`: twelve fires in `FIRES` (torches behind the main gate's guards, at the road's head by the plaza's stair, before the Main Temple and before the royal residence's door, between the kallanka's doors; braziers at the Main Temple's altar and at the chaski's post). The torch is a pole in a socket of cut stone with a head of tallow-soaked ichu [inferred]; the brazier a pecked stone bowl on three feet [inferred]. The flames themselves are halo (so by day only the dark head shows).
- **Budget.** Main draws at the arrival 187 -> 189 (halo material +1, one patch material in a house plan +1 from changed random draws), triangles 1.02 -> 1.03 M.

## 15. Reference pass: sound (as built; `soundmap.js`, `src/engine/voices-machu-picchu.js`)

- **Sources.** The instruments are those §9 names: quena and panpipes (antara/siku) on the pentatonic scale, the wankar drum, the pututu conch of the chaski, "to signal a runner's approach so that the next could get ready" [stated: Wikipedia, "Chasqui"]; the foot plough and the hoe's clods §5.2; the mason's stone hammers §12.3 [stated: ancient-history-sites]; the sixteen fountains and the canal §4.3 [stated: waterhistory.org]; the Urubamba in its gorge below §2 [stated: michaelstephenwills quoting Wikipedia]. Pitches, patterns, hours and the llama's hum, the guinea pigs' whistle, the loom's batten and the spindle's whirr are [inferred]; nothing here was heard or recorded.
- **Voices (14, all `mp`-prefixed):** mpQuena, mpAntara, mpWankar, mpPututu, mpStoneHammer, mpPlough, mpCall, mpLlama, mpCuy, mpLoomBatten, mpSpindle, mpGrind, mpSpout, mpRiver (the last two louder in the rains, Nov–Mar).
- **Places.** The feast's quena, panpipes and drum on the plaza (14–22 h, not in rain); the conch at the chaski's post by day and at the Intihuatana at sunrise; the quarry's hammers (dry weather, 6.5–17 h); three ploughing strips with calls; llamas on the plaza, the road and the terraces; guinea pigs and looms in the three opened patios; eight fountain spouts; six reaches of river round the rim, day and night; the kallanka's evening drum; owls on the slopes at night. Opened houses and the kallanka are rooms (hearth, spindle, jars, sacks, hammers by use), thatch rain soft.
- **Checks.** tests/machu-picchu-sound.test.mjs (voices made, map agrees with the layout, scheduler by hour and weather); tools/sound-render.mjs measured the conch (centroid 277 Hz, two onsets), the drum (85 Hz, seven onsets), the quena (611 Hz, breathy), the hammer (1.7 kHz, five onsets), the river, the spout, the llama's hum. Not listened to.

## 16. Reference pass: animals as critters (as built; `fauna.js`, models in `src/engine/critter-models.js`)

- **Models added** (on the dog's rig, so they lie down and stand up as the visitor comes): `llama_brown`, `llama_white`, `llama_pied` (back at 1.1 m, a long slender neck, banana ears, woolly body, slim legs; 786 triangles) and `cuy` (the guinea pig, 0.28 m, brown and white patched; 356 triangles). One line in `src/engine/fauna-critters.js` maps them to the dog's kind.
- **Placed** (`critters`, 17): six llamas grazing on the Main Plaza's floor and on the fields by the storehouses, three dogs (the chaski's post, the storehouses, the plaza), two guinea pigs loose along the side wall of each of the three opened patios. Llamas were the Andes' beasts of burden and wool, dogs were kept, guinea pigs were kept at the house and ran about its floor [stated: general, Andean domestic animals; inferred: the places]. The life elements' llamas, dogs and herders stay (§5.2).
- **Left out on purpose:** hens (the domestic fowl came with the Spaniards), cats, goats, donkeys, horses. **Not built (no model):** the mountain viscacha on the terraces' walls (the "rabbit" of the site's walls today [inferred for 1450]), the Andean condor's own form (a crow stands in), hummingbirds and swifts.

## 17. Reference pass: wear and writing (as built; `wear.js`, the road in `plan.js`)

- **Soot.** The stove (q'uncha) burned in a closed room with a smoke-hole in the thatch: the wall above it is blackened [inferred: general]. Built on the houses opened to the visitor: two dark patches on the back wall's face above the stove, 0.95–1.4 and 1.4–1.95 m, 12 mm proud of the leaning face.
- **The threshold.** On houses with a threshold stone and an opened door, a damp-dark hollow worn into its top by the feet [inferred].
- **The road.** Two worn tracks down the flagged road from the gate to the plaza and across the fields, 0.5 m wide, 4.5 mm over the flags, where feet and the llamas' hooves fall [inferred].
- **Lichen and damp** were already done (§4.5; the engine's wall weathering by `damp`).
- **Writing: none.** The Inca had no script; records were kept on quipus [stated: Wikipedia, "Chasqui"]. No inscription, sign or tablet was made, and none should be added. (Later Spanish crosses and graffiti are after 1530.)
- **Budget.** Wear on the walk's houses only: the same on every house cost two more draws at the arrival (thin slabs are detail pieces drawn by tile); main draws at the arrival are now 189 (before 187).

## 18. Second pass, narrow form (as built)

- **Night.** Arrival frame at `--night 1`, low preset: the visitor's own surroundings (the storehouses, the knoll) are dark by design (stores unlit, the watch's brazier behind the camera); the lit houses beyond showed only through their doorways, which face away. Added a smoke-hole glow at the ridge of every lit house (one halo ball and a small floor disc in the existing `mp_glow` mesh, no new draw) so a lit house reads from behind and from above [inferred: hearth light through the thatch's smoke-hole]. Confirmed as small orange points on the ridges at the arrival and at (2, 45) looking north; at the walk pose the glow is faint, so the ball was enlarged afterwards (not re-rendered).
- **Budget (MAIN).** Arrival 189 -> 191 draws, 1.03 -> 1.04 M triangles. Walk poses (2,60), (2,-10), (-30,-28), (-70,0) at two yaws: 161-188 draws, 0.91-1.04 M. Nothing over; most of the budget is unused.
- **Doors.** The opened houses' doors are back to the Inca proportion: visible trapezoid 1.1 m at the foot (0.86 m at the head), 2.2 m high; the collision gap stays 1.6 m (`doorColW`, new in the inca style's openings: the walker is 0.6 m across and the raster needs about 1.6 m; walk-check passed down to 1.5 m). The jambs therefore have a 0.25 m solid stub each side that the body can overlap inside the 0.7 m wall thickness [inferred, a concession to the walker]. The kallanka's seven doors stay 1.7 m wide (`KALLANKA_DOOR`).
- **Walk's gaps.** `WALK_REACH` 25 -> 45 m: kanchas opened on the walk 3 -> 9 (27 houses; 42 routes, all pass). Kancha 27 left closed (`NOT_OPENED` in walkroutes.js): its third house has a rising surface (1.16-1.28 over a floor at 0.5) inside the doorway that door-probe could not trace to a piece. Patio props (mats, jars, firewood, cuy cells, seats) now keep 1.7 m clear of every house's door front (`avoid`, dress.js), and the stone bench beside an opened door is no longer built (it blocked a lane). Storekeepers: one man with a quipu on a low stone slab in each of the five qollqa, built into a near plan (`machu-picchu-keepers`, near 26 m, `inca_keeper` in dress.js) [stated: quipus recorded the state's stores, Wikipedia "Quipu"; inferred: the man, the slab, his place]. Seen from the door in a day render.
- **Landmark and wear.** Worn treads (`treadWear` in wear.js): a damp-dark hollow across the middle of every tread of every `stairs` flight (plaza, ditch, knoll, hill, gaps) and the temples' and the Torreón's steps (16 mm over the tread: surface-check's coplanar tolerance is 12 mm); the Intihuatana has a small carved step channel between mound and tier [stated: salkantaytrekking, "small carved channels like stairs"]. The Temple of the Sun, the Intihuatana and the Three Windows were compared with §4.2/§12 and found built as stated; not done: the Torreón's cut form at the north window's base beyond the three steps, the Intihuatana's two long stairs cut from one rock.
- **Still short.** Kancha 27's door; the other 21 kanchas stay closed; no keepers in the opened patios' houses; hens/viscacha absent; grass tufts grow through the storehouse floors (seen in the render; `inca_plants`/ground, not touched); the walk's wear is uniform from tread to tread (the lowest treads would be worn most).
