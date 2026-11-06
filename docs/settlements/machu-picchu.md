# Machu Picchu, c. 1450–1530 — dossier

Settlement id: `machu-picchu` · Style: `inca` · Region: the Andes (Eastern Cordillera) · Code: `src/settlements/machu-picchu/`
Status of this dossier: L1–L2 (the saddle and its peaks, the terraces all round, the Temple of the Sun, the Sacred Plaza with the Main Temple and the Temple of the Three Windows, the Intihuatana on its hill, the Main Plaza, the houses in kanchas; ground, planting, weather, music). L3 recorded for later: the Temple of the Condor, the royal tomb under the Torreón, the fountains and water channels, the Guardhouse, Inti Punku and the trails, the walls' polygonal masonry in detail, llamas, people.

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
