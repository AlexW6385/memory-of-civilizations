# Machu Picchu, c. 1450–1530 — dossier

Settlement id: `machu-picchu` · Style: `inca` · Region: the Andes (Eastern Cordillera) · Code: `src/settlements/machu-picchu/`
Status of this dossier: L1–L2 (the saddle and its peaks, the terraces all round, the Temple of the Sun, the Sacred Plaza with the Main Temple and the Temple of the Three Windows, the Intihuatana on its hill, the Main Plaza, the houses in kanchas; ground, planting, weather, music). Second pass (§4.3): the canal and the sixteen fountains, the Royal Tomb under the Torreón, the Sacred Rock and its wayronas, the great stones, niches, pegs and altar of the Main Temple, the blind windows of the Three Windows. L3 recorded for later: the Temple of the Condor, the Guardhouse, Inti Punku and the trails, the walls' polygonal masonry in detail, llamas, people.

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

## 3. Orientation

The ridge runs north–south; the town looks along it to Huayna Picchu. [stated: general]

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

## 5. The houses

Rectangular rooms of rough granite set in clay, a trapezoid door on the court, niches in a row inside, now and then a small window, stone gables with their pegs carrying steep thatched roofs; grouped in kanchas, "three (or more)" buildings round a walled patio [stated: World History Encyclopedia]. The royal residence's doorways double-jambed. [stated: thatch, trapezoids, pegs; inferred: the counts and sizes]

## 6. Ground

The saddle level; the plaza sunk 2.4 m; the Intihuatana's hill in terraces to 11 m; the terraces stepping down 39 m; the slopes below falling into the canyon; the peaks. No water in the disc (the river is beyond it). (`ground.js`)

## 7. Planting

Grass on the terraces and the plazas; cloud forest on the slopes and the peaks. [inferred]

## 8. Sky and weather

Bright sun between clouds, mist rising from the canyon; latitude 13° S. [inferred]

## 9. Sound

Panpipes and the quena flute, drums, the conch (a flute, a reed and a struck sound stand in). [inferred]

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
