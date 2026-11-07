# Stonehenge, about 2500 BC — dossier

Settlement id: `stonehenge` · Style: `neolithic` · Region: Britain (Salisbury Plain) · Code: `src/settlements/stonehenge/`
Status of this dossier: L3 in part (tooling, crust and lichen — §1c; the midwinter feast — §10a). Before: L2, toward L3 (the Southern Circle and its avenue with the houses flanking it, long barrows and bowl barrows — §5b, §6a; the stones individually shaped and set in the ground — §1a; the Station Stones, the entrance stones and the Heel Stone's ditch; Durrington-type houses with interiors — §5a; people and animals — §10). Earlier: L1–L2 (the sarsen circle with its lintels, the five trilithons in a horseshoe open to the north-east, the bluestone circle and horseshoe, the altar, slaughter and heel stones; the circular ditch and bank; the Avenue toward the midsummer sunrise; round barrows on the down; the builders' houses brought near; ground, planting, weather, music). L3 recorded for later: each stone's surveyed shape, the Aubrey holes, Durrington Walls and Woodhenge at their true distance, the Cursus, the River Avon, gatherings at the solstices.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** Stonehenge's sarsen phase, about 2500 BC. It had an outer circle of 30 sarsen uprights about 4.1 m high carrying a ring of lintels, about 33 m across. Inside stood a horseshoe of five trilithons rising to about 7.3 m at the centre, open toward the north-east [stated: Wikipedia "Stonehenge"].
- **The bluestones:** from the Preseli Hills, set in a circle and a horseshoe [stated: Wikipedia].
- **The rest of the monument:** the earlier circular ditch and bank, about 110 m across; the Heel Stone outside on the axis; the Avenue running north-east toward the midsummer sunrise [stated: Wikipedia].
- **The builders' settlement:** at Durrington Walls, about 3 km to the north-east, where square houses with chalk floors were found [stated: Wikipedia "Durrington Walls"].
- **Moment shown:** about 2500 BC.

## 1a. The stones in detail (as built)

- **Sarsen circle:** 30 uprights "around 4.11 m high, 2.13 m wide", about 1.1 m thick; they "widen slightly towards the top" [stated: Wikipedia via Wikiwand]. Built 1.95–2.35 m wide at the foot, 2.15–2.3 at the top, set 1.3 m into the ground on a ring of 15.55 m radius (31 m across; EH gives the ring as 30 m) [stated: sizes; inferred: the burial depth]. The entrance gap is on the axis [stated]. Stone 11, in the south-west, is about half as wide [stated: commonly noted; built 1.1 m].
- **The lintel ring:** lintels "around 3.2 m long, 1 m wide and 0.8 m thick", joined end to end by tongue and groove, each locked to its uprights by mortise and tenon, and curved "to continue the circular appearance"; their tops 4.9 m above the ground [stated: Wikipedia; EH "Discover more about the Stones"]. The upright tops were levelled to within a few centimetres across the circle in spite of the slope [stated: EH] — built as one level ring, each upright reaching down to its own ground. The joints show only as fine lines [inferred].
- **Dressing:** pounded faces, the inner faces the smoothest [stated: EH, "gently worked" faces; inferred: inner smoother]; small seeded unevenness on every face.
- **Trilithons:** five in a horseshoe 13.7 m across, the smallest pair about 6 m, the next 6.5 m, the Great Trilithon in the south-west 7.3 m [stated: Wikipedia; 7.3 m from the original dossier]. Uprights 2.25 m wide tapering to 2.0, 1.2 m thick, a narrow slit between the two of each pair; the uprights "somewhat tapered" [stated: MacTutor gazetteer]. A tenon on each upright's top taken by the lintel's mortise (Stone 56 has "an obvious tenon on top") [stated: EH]; lintels 1.0 m deep, 1.1 m thick, overhanging a little [inferred].
- **Bluestones:** about 60 pillars on a circle 23 m across between the sarsens and the horseshoe, and 19 dressed ones in a horseshoe within the trilithons, rising toward the south-west; pillars about 2 m high and 1–1.5 m wide at Waun Mawn [stated: Wikipedia; inferred: our 1.6–2.4 m, 0.55–1 m]. One bluestone is grooved for a tongue (Stone 68) [stated: EH]. Material: a darker rock surface standing for spotted dolerite [inferred].
- **Altar Stone:** "a large slab of greenish Old Red Sandstone", possibly from north-east Scotland; whether it lay flat or stood is not known [stated: EH]. Shown lying across the axis before the Great Trilithon, 4.9 × 1.0 × 0.53 m [inferred: sizes as commonly given].
- **At the entrance:** the Slaughter Stone (4.9 m long) originally stood at the entrance, flanked by stones now missing [stated: EH, Wikipedia]; shown standing with one partner, either side of the axis, inside the causeway.
- **Heel Stone:** an unshaped sarsen boulder, 4.9 m above ground, leaning toward the circle, within its own small circular ditch [stated: Wikipedia, EH]; built tapering, knobbly, leaning about 22°.
- **Station Stones:** four at the corners of a rectangle centred on the monument just inside the bank; two stood on mounds (the North and South "barrows") within ring ditches; the other two undressed sarsens [stated: Wikipedia "Station Stones"]. Rectangle 33 × 79 m with its short sides parallel to the axis [inferred: the usual reading].
- **The earthwork:** the ditch was dug in segments [stated: Wikipedia, the first phase]; shown with an irregular depth, a bank inside and a low counterscarp outside, a wide causeway at the north-east entrance and a narrow one to the south [inferred: proportions].
- **The Avenue:** "a parallel pair of ditches and banks" [stated: Wikipedia]; banks 14 m apart with a ditch outside each [inferred].

## 1c. Tooling, crust and lichen (2026-11 L3; `standing_stone` with `tool`, `src/styles/neolithic/index.js`)

| Feature | What we build | Basis |
|---|---|---|
| Pick-dressed faces | The dressed faces in a bright grey-white stone (`sandstone_white`), not the grey of today; worked in lanes of hammer-blows about a hand wide (16–24 cm), oblique, their direction varying from stone to stone, with the fine pitting of the blows over them | Pick-dressing removed the "brown and grey crust", exposing a "fine, bright grey-white surface" [stated: sarsen.org, after the laser scan]; freshly worked sarsens looked "much brighter and whiter than the grey stones you see" now [stated: EH "Discover more about the Stones"]; tool marks survive "everywhere we looked, on every surface"; "differences in patterns of tooling" across the monument [stated: heritagedaily; Historic England report 32-2012]; the lanes' width and direction [inferred] |
| Which faces | Outer circle: the uprights within about 70° of the axis on the north-east dressed all over; the rest only on their inner faces (and the inner half of their sides), the backs left in their crust. Trilithons: the Great Trilithon dressed all over (its "extremely straight, neat outline and smooth surface"), the others on their inner faces. Lintels dressed all over | The stones on the north-east facing the Avenue "laboriously shaped" and pick-dressed; on the opposite side "only ... the inner faces" [stated: heritagedaily]; Great Trilithon [stated: sarsen.org]; lintels' faces "gently worked" [stated: EH]; the 70° limit [inferred] |
| Crust | Where not dressed the old crust stands about 2 cm proud of the dressed face, knobbly | [inferred: dressing removes the crust] |
| Lichen | Rosettes 3–12 cm across in loose colonies of 2–6, grey-green, yellow and pale grey, on the crust only: on the backs of the undressed uprights (about 14 colonies each), the four smaller trilithons' backs (8), the Heel Stone (70) and the Station Stones (30); none on the fresh dressed faces | 79 lichen species were counted on the stones at the last survey [stated: Stone Pages 2003]; the crusted sarsens lay exposed on the downs before they were brought, so their crusts carried lichens and the new faces none [inferred]; the colours of the common crustose and foliose kinds [inferred] |
| Damp | The place's climate set damp 0.6: rain streaks and moss on shaded feet (the renderer's weathering) | [inferred: Salisbury Plain's rain] |

Sources added:
- [Stonehenge up close: digital laser scan reveals secrets of the past — HeritageDaily (2012)](https://www.heritagedaily.com/2012/10/stonehenge-up-close-digital-laser-scan-reveals-secrets-of-the-past/59390)
- [Stonehenge Laser Scan: Archaeological Analysis — Historic England report 32-2012](https://historicengland.org.uk/research/results/reports/32-2012)
- [Sarsen pick-dressing question — sarsen.org (2013)](https://www.sarsen.org/2013/02/sarsen-pick-dressing-question.html)
- [Lichen survey at Stonehenge — Stone Pages (2003)](https://www.stonepages.com/news/archives/000177.html)

## 10a. The midwinter feast (2026-11 L3; `feast_fire`, `midden`; placed in `town.js`)

| Feature | What we build | Basis |
|---|---|---|
| Fires | Seven open fires in the spaces between the houses: a scorched scoop of ash ringed with burnt flint and chalk, logs laid in a star, the flames | "Burnt foot bones suggest that pigs were often roasted over open fires" [stated: EH "Monumental feasts"]; the ring of flint and chalk [inferred] |
| The roast | Over each fire a pig on a hazel spit across two forked stakes, with a crank | Pigs were 90% of the bones and teeth, the rest mostly cattle; slaughtered at midwinter [stated: EH "Monumental feasts"]; pigs killed at about nine months "in time for the midwinter solstice" [stated: the-past.com]; the spit and stakes [inferred from roasting whole over an open fire] |
| Pots | Two or three Grooved Ware pots cooking at the edge of each fire | "Large numbers of the pots were found to have been used for cooking pork and beef" [stated: EH] |
| People | Five to eight round each fire, sitting on the ground, squatting at the pots, one standing to turn the spit | [inferred] |
| Middens | Four heaps of dark refuse at the edge of the houses with the bones of pigs and cattle (long bones, skulls) and broken Grooved Ware | "Over 38,000 discarded animal bones have been found there" [stated: EH]; the heaps [inferred] |

Sources added:
- [Monumental feasts — English Heritage](https://english-heritage.org.uk/visit/inspire-me/cote-feasts-durrington)

## 2. Layout of the settlement (radius 360 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| Stones | centred at the origin | [stated: sizes] |
| Ditch and bank | radius 55 m | [stated] |
| Avenue, Heel Stone | north-east | [stated] |
| Barrows | on the down round about | [stated: round barrows near] |
| Houses, Southern Circle, Durrington avenue | north-east, ≈ 270 m (they are ≈ 3 km away) | [stated: Durrington; compressed — inferred] |

## 3. Orientation

The axis runs to the midsummer sunrise in the north-east. [stated]

## 4. The style

Sarsen sandstone, shaped; dolerite bluestones; earthworks of chalk; houses of timber and wattle with steep thatch. [stated: stones; inferred: houses' superstructure]

## 5. The town

About 70 houses. [inferred]

### 5a. The houses (after Durrington Walls)

- "Each house was about 5 m square, with a central hearth"; slots and post-holes of wooden furniture, "the outlines on the floors of box-beds and wooden dressers or cupboards"; clay/chalk floors survived [stated: Current Archaeology / the-past.com "Before Stonehenge: village of wild parties"].
- The English Heritage reconstructions at the visitor centre: one room 5 m a side, stakes woven with hazel and daubed with "chalk, hay and water", white chalk walls and floors, thatch of wheat straw tied to a woven hazel frame, smoke rising through the thatch; based on the Durrington houses dated about 2500 BC; the methods are hypotheses being tested [stated: EH "Neolithic Houses"].
- As built: inner side 4.8–5.7 m, walls 0.16 m of chalk daub 1.75 m high with a doorway 0.85 × 1.5 m framed in timber, the foot darkened by mud; a timber wall-plate; a steep roof hipped to a point (thatch outside, woven hazel within, eaves 0.75 m out, a bound capping bundle) [inferred: wall height, door, roof form]; chalk floor on a levelled platform; a round hearth with a chalk kerb, ash and sticks, a fire in some; one or two box beds of planks with bedding and a hide; a dresser of posts and two shelves against the back wall with flat-based Grooved Ware pots; firewood outside [stated: hearth, beds, dressers; inferred: their making].

### 5b. The Southern Circle and the Durrington avenue

- The Southern Circle "was 40 metres across and aligned so that the midwinter sun would rise between the entrance posts"; it "consist[ed] of two huge entrance posts and 166 posts of various sizes arranged in five concentric circles" [stated: h2g2]. Oriented south-east toward the midwinter sunrise; a paved avenue led from it to the river, aligned on the midsummer sunset [stated: Wikipedia "Durrington Walls"]; the avenue was stone-surfaced, "some 30 metres wide and 170 metres long" [stated: UNESCO WHC news]; "with its rammed flint surface" [stated: Stone Pages]; with a gully and an external bank [stated: digitaldigging]; seven houses were found flanking it [stated: Internet Archaeology 26]. The village went out of use about 2500–2460 BC and the great henge bank was finished about 2480–2450 BC, after the houses [stated: Current Archaeology, "Rethinking Durrington Walls"] — so the henge's bank is not built.
- **Ours:** brought near (like the houses), north-east of the stones beside the Stonehenge Avenue: the circle centred at (214, −165), 166 posts of oak laid out in five rings of 19.5, 16, 12.5, 9 and 5.5 m radius (52, 42, 33, 24, 15), the ten that would stand in the way in left out, 0.45–0.85 m thick and 3.6–6.2 m high, the middle ring the stoutest and tallest; the rings broken on the axis for the way in; two entrance posts 1.05 m thick and 7 m high just outside, either side of the axis; each post's foot in a collar of rammed chalk, its top cut flat. The avenue runs south-east from the circle, 30 m wide, its surface rammed flint, a gully and a low bank outside each side, 108 m to the settlement's edge (toward the river beyond); the 61 houses stand along both sides of it and round the circle [inferred: ring radii, post sizes and heights, the avenue's length as cut by the edge].

## 10. Life

- The pigs at Durrington were mostly killed at about nine months, "in time for the midwinter solstice", with feasting on an unprecedented scale [stated: the-past.com]. Shown: about 60 people at the stones, round the entrance and coming up the Avenue, others at the houses; 30 pigs, cattle and dogs among the houses [inferred: numbers]. Dress of hide and woven cloth in browns and greys [inferred].

## 6. Ground and water

Chalk down with short grass; white chalk in the ditch, banks and barrows; woodland far off. [inferred]

## 6a. Barrows

Long barrows "acted as funerary monuments during the Early and Middle Neolithic periods (3400–2400 BC)"; the one north-east of Winterbourne Stoke crossroads is 95 m long, 22 m wide and 2.5 m high, with ditches along both sides, oriented south-west–north-east [stated: Historic England list entry 1011841]. Bowl barrows date "from the Late Neolithic period to the Late Bronze Age" and are usually surrounded by a ditch; round barrow cemeteries in general are of the Bronze Age [stated: Historic England list entry 1011047]. Ours (changed from six round barrows): two long barrows, old and grassed by 2500 BC (95 × 22 × 2.5 m and 70 × 18 × 2.2 m, higher at the north-east end, a quarry ditch along each side), and four bowl barrows each with its ring ditch [inferred: the higher end; how many round barrows stood by 2500 BC is uncertain].

## 7. Sky and climate

Changeable, windy, rain. [inferred]

## 8. Paths

Up the Avenue from the north-east into the circle. [stated: the Avenue]

## 9. Sound

Nothing is known; pipes, drums and voices stand in, under the wind. [inferred]

## Sources

- [Stonehenge — Wikipedia](https://en.wikipedia.org/wiki/Stonehenge)
- [Durrington Walls — Wikipedia](https://en.wikipedia.org/wiki/Durrington_Walls)
- [Stonehenge — Wikiwand (Wikipedia)](https://www.wikiwand.com/en/Stonehenge) — sarsen, lintel, trilithon, Heel and Slaughter Stone sizes
- [English Heritage — Discover more about the Stones](https://www.english-heritage.org.uk/visit/places/stonehenge/things-to-do/stone-circle/stones-of-stonehenge/)
- [English Heritage — Neolithic Houses](https://www.english-heritage.org.uk/visit/places/stonehenge/things-to-do/neolithic-houses/)
- [Before Stonehenge: village of wild parties — the-past.com](https://the-past.com/feature/before-stonehenge-village-of-wild-parties)
- [Station Stones — Wikipedia](https://en.wikipedia.org/wiki/Station_Stones)
- [Stonehenge Avenue — Wikipedia](https://en.wikipedia.org/wiki/Stonehenge_Avenue)
- [Stonehenge — MacTutor gazetteer](https://mathshistory.st-andrews.ac.uk/Gaz/Stonehenge)
- [The Woodhenge, Durrington Walls Henge and Stonehenge Complex — h2g2](https://www.h2g2.com/edited_entry/A9568128)
- [Durrington Walls avenue — UNESCO World Heritage Centre news](https://whc.unesco.org/en/news/310)
- [Durrington avenue — Stone Pages news](https://www.stonepages.com/news/archives/001548.html)
- [Timber circles, Durrington Walls Southern Circle — digitaldigging](https://www.digitaldigging.net/timber-circles-durrington-walls-south-circle-digital-model/)
- [Durrington Walls East Entrance — Internet Archaeology 26](https://intarch.ac.uk/journal/issue26/2/2.html)
- [Rethinking Durrington Walls — Current Archaeology](https://archaeology.co.uk/articles/features/rethinking-durrington-walls-a-long-lost-monument-revealed.htm)
- [Long barrow NE of Winterbourne Stoke crossroads — Historic England 1011841](https://historicengland.org.uk/listing/the-list/list-entry/1011841)
- [Round barrow cemetery on Winterbourne Stoke Down — Historic England 1011047](https://historicengland.org.uk/listing/the-list/list-entry/1011047)
