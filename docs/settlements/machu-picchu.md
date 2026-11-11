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
- [Ferns, Heliconia & Bromeliads — Inkaterra Asociación](https://inkaterra.com/inkaterra-asociacion-org/en/research/cloud-forest/ferns-heliconia-bromeliads)
