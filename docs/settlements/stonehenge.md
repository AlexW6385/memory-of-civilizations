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

## 1f. The stones' individual faults (2026-11; `faults()`, `tooledStone`, `standingStone`, `lintel_ring`, `lintel`, `src/styles/neolithic/index.js`)

Every entry is [inferred]: the surveyed shapes of the individual stones are not used here; these are the faults any real sarsen or dolerite pillar has and a box lacks, applied by a hash of each stone's own seed so no two stones agree and every build is the same.

| Feature | What we build | Basis |
|---|---|---|
| Weathering pits | Hollows 10-32 cm radius (a hand to a forearm across) and 1-8 cm deep on the old crust, fewer and shallower on dressed faces (a third of the depth); 9 on a plain upright, 34 on a dressed sarsen, 44 on a natural boulder; none within 20 cm of the foot | Solution hollows and weathering pits are the commonest surface fault of sarsen [inferred from the stones as seen today; the 2012 laser scan records the tooling surviving between them, see 1c] |
| Entasis | The shaft swells 2.5-6.5% at mid-height, narrowing to both ends | Sarsens "widen slightly towards the top" and are "somewhat tapered" (see 1a) [stated]; the mid-height swelling is [inferred] from the irregular sections of unworked boulders |
| Twist | The section turns up to 0.045 rad from foot to top, the sign by the stone's seed | [inferred]: a stone split along its bedding and dressed by hand is never plane |
| Bluestones | Faceted pillars: section a superellipse of exponent 2.8-4 (rounded rectangles with defined arrises), the tops sloped up to 0.35 rad and notched irregularly, rounded or peaked | Dolerite and rhyolite pillars split along cleavage planes, "rising ... pillars" at Waun Mawn (see 1a) [stated]; the facets [inferred] |
| Lintels | Rectangular sections of high exponent (9 ring lintels, 8 trilithon lintels), 28 points round; ends squared (0.97) and a 2 cm open joint between neighbours, the tops and faces slightly uneven | Lintels "around 3.2 m long, 1 m wide and 0.8 m thick", the joint a tongue and groove showing as a fine line (see 1a) [stated: EH]; the open joint [inferred: wide enough to read from a distance] |

## 1g. The earthworks and the entrance stones (2026-11; `earthwork`, `ringGrid`/`avenueGrid` in `layout.js`, `aubrey_holes`, `lyingTenon`)

| Feature | What we build | Basis |
|---|---|---|
| Ditch and bank | The ring ditch 1.8 m deep and bank 1.4 m high (were 1.6 / 1.0); over every steep part (the ditch walls and floor, the bank's scarp, the ends of the causeways) a skin of fresh white chalk, 3 cm uneven, its edge ragged by a hash of the cell's position, the gentle shoulders left to the turf; on the gentle Avenue banks the chalk is broken into patches by a hash of position; the causeways (north-east, wide; south, narrow) are the ground left uncut | The henge was dug in segments through chalk, the bank of the spoil "originally white" [stated: Wikipedia "Stonehenge", first phase]; depths, ragged edge and shoulders [inferred] |
| Avenue | Both banks (14 m apart) and the ditch outside each, from the entrance to the settlement's edge, in the same chalk face; the Heel Stone's ring ditch likewise | "A parallel pair of ditches and banks" [stated: Wikipedia]; chalk face [inferred as above] |
| Station mounds | The North and South mounds with their ring ditches in chalk | [stated: Station Stones, Wikipedia]; chalk [inferred] |
| Aubrey Holes | Each a shallow dish of white rubble (6 cm deep) with a lip of spoil, outline uneven by its seed, rubble lumps and about one flint in four, a dark ring of trodden turf round 60% | Refilled with chalk rubble [stated, 1d]; the dish and lip [inferred] |
| Slaughter Stone | Standing at the entrance, 4.9 m, flanked by its partner; solution pits and the shaped faces of the stone shapes; the bluestone circle left open on the axis (two pillars omitted) so the way in stays clear | It "originally stood at the entrance, flanked by stones now missing" [stated: EH, Wikipedia; it fell later]; the shaping [inferred] |
| Tenons | A tenon knob on the end of the sarsen waiting to be dressed at the arrival and of the one on the sledge on the Avenue | Tenons were cut on upright tops [stated: EH]; cut before raising [inferred] |

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

## 1d. The Aubrey Holes (2026-11; `aubrey_holes`, placed in `plan.js`)

- 56 chalk pits on a ring of circumference 271.6 m (about 86 m across), about 5 m inside the bank; on average 1.06 m across and 0.76 m deep; "refilled with freshly excavated chalk rubble soon after digging"; later cremation burials in the upper fills of 25 of the 35 excavated [stated: Wikipedia "Aubrey holes"].
- Built: 56 patches of white rubble 1.0–1.2 m across, a little proud of the turf, with 5–8 lumps of chalk on each, some with a dark ring of trodden soil, on a ring of radius 43.2 m (jittered 0.35 m) [inferred: appearance, since turf had not yet regrown; the ring is drawn through the entrance causeway].

## 10b. The gathering and the living town (2026-11; `camp_shelter`, `hurdle`, `camp()` in `town.js`, `movers.js`, `fauna.js`, `smoke.js`)

- People and animals came from across Britain: isotopes of 131 animals from four Late Neolithic Wessex sites show pigs raised from the coastal west to the highland east, some possibly from Scotland; tens of thousands of pig remains at Durrington Walls [stated: The Science Breaker summary of Madgwick et al. 2019, https://thesciencebreaker.org/en/breaks/evolution-behaviour/ancient-feasts-drew-people-and-animals-from-across-neolithic-britain]. Cattle are the rest of the bones [stated: EH "Monumental feasts"]. The dossier's own date for the feasts is midwinter (§10a); a summer gathering at the solstice sunrise on the axis is [inferred] and drawn as the same camp.
- Camp (inferred; no shelters of visitors are preserved): seven clusters either side of the Avenue 60-200 m out, each a fire with pots, three or four hide-covered pole shelters (10 poles leaning to a point and crossing above it, door toward the fire, turf and chalk banked round the foot), a woven hazel hurdle windbreak on the windward side, 4-7 people sitting, squatting or standing.
- Cattle: a hurdle pen (18 x 11 m, a gate gap) beside the Avenue with nine oxen and two drovers at the gate; eleven oxen loose on the grass beyond, a herder with a staff by some [inferred].
- Houses, interior detail added: eight hazel rafters from the wall-plate to the apex bound by two withy hoops (the frame of woven hazel and thatch, EH visitor-centre reconstruction), a cooking pot in the embers, a saddle quern by the door, wicker baskets by the beds, a woven hurdle door hung against the wall [stated: frame, pots, beds and hearth as §5a; inferred: quern, baskets, door].
- Living systems: walkers (men, women, women with pots and baskets on the head, herders, porters, children, in tunics, wraps and hide cloaks) on ways along the Avenue (kept clear of the Heel Stone, through the gap between the entrance stones), round the sarsen circle, to the camps and the pen, and from each house door to the Durrington avenue; smoke from about 45% of the houses' roofs at the meals and from every fire of the feast and camp, steam from their pots; crows over the camp and Durrington, swallows low over the down, small birds on the trodden chalk [inferred; dress: only flax, wool, leather and fur, and bone pins, are known].
- Houses at Durrington were square (§5a), so they are kept square, not round; round houses belong to later periods.

Sources added:
- [Aubrey holes - Wikipedia](https://en.wikipedia.org/wiki/Aubrey_holes)
- [Ancient feasts drew people and animals from across Neolithic Britain - The Science Breaker](https://thesciencebreaker.org/en/breaks/evolution-behaviour/ancient-feasts-drew-people-and-animals-from-across-neolithic-britain)

## 10c. The village and the work in the open (2026-11 deepening; `yard`, `craft`, `granary`, `litter`, `scrub`, `village()` in `town.js`)

| Feature | What we build | Basis |
|---|---|---|
| Yards | Before each house door: chalk lumps and flints trodden in; by turns a hazel hurdle screen and a log seat, a storage pit lidded with a weighted hurdle disc and a basket, a hide stretched to dry on a pole frame, bundles of thatching straw and a sheaf of hazel rods against the wall, a pot of water | Pits for storage and abundant hazel and flint are found at Durrington; hurdles, straw and hide-working follow from the houses' own materials (the walls and roofs are hazel and straw) [inferred: the arrangement] |
| Houses, weathering and interior | Hairline cracks down the daub, patches of fresh chalk wash where mended; within, hazelnut strings, herb and meat bundles hung from the rafters, a hide by the hearth, two log seats, firewood stacked inside the door; a person at the hearth in about a third of the houses | Hazelnut shells are among the commonest plant remains on Neolithic sites in Britain; hearth, beds and dressers [stated, §5a]; the rest [inferred] |
| Crafts in the open | Flint knapping (anvil stone, nodules, a drift of flakes, axe blanks, an antler hammer), pot making (clay heap, Grooved Ware drying, a firing pit), basket making (rods, a half-woven basket), grain grinding (saddle querns on a hide), hide scraping (a hide pegged out); each with its worker, sometimes a child and a dog | Grooved Ware pots and flint working at Durrington [stated: EH "Monumental feasts"; the-past.com]; saddle querns, hides and baskets [inferred] |
| Four-post granaries | Twelve among the houses: four posts, a plank floor a metre up, wattle walls, hipped thatch, a notched log ladder | Four-post structures are a common find on later Neolithic and Bronze Age sites in Britain [inferred as a store; the type is attested, its use as a granary is a common reading] |
| Traders | A hide spread with Grooved Ware, polished greenstone axes, a basket, rolled hides and a string of beads, a seated trader and one or two buyers, along the Durrington avenue and the Stonehenge Avenue | Goods and animals came from across Britain [stated: Madgwick et al. 2019, §10b]; the greenstone axes (such as Langdale and Cornish axes, traded across Britain from the 4th millennium) [inferred as the goods carried]; the setting out on a hide [inferred] |
| The Southern Circle | A fire at its heart with six sitting and eight standing round it at the midwinter sunrise | The circle was aligned on the midwinter sunrise [stated, §5b]; the fire [inferred] |
| Dressing the stones | By the arrival: a sarsen as hauled, undressed, on oak rollers, men squatting to pound it with mauls, chips and flakes of grey and white sarsen, hammerstones, antler picks, a coil of lime-bast rope, rollers; more such scatter about the circle | Sarsens were dressed by pounding (§1c) [stated: EH, sarsen.org]; that this was done with hammerstones and that antler picks, rope and oak rollers lay about the work is the usual reconstruction [inferred; not verified in a cited source here] |
| Gifts | Eight small deposits at the foot of stones and in the Heel Stone's ditch: a Grooved Ware pot, bones, an antler, a flint axe | Deposits in ditches and pits of pots, bones and antler are the usual finds at henges [inferred from this pattern] |
| The track | The Avenue's centre trodden to bare chalk, chalk lumps and flints along it and over the Durrington avenue; the ground about each door trodden bare | [inferred] |
| Scrub | Gorse clumps (dark spines, yellow flowers) on the chalk, hawthorns alone and by the barrows (the first scrub of unmanaged downland) | Sheep- and cattle-grazed chalk downland with scattered scrub of hawthorn and gorse [inferred from the present downland]; the down was largely open grassland by 2500 BC [stated: Wikipedia "Stonehenge" environmental setting, in general terms] |
| Sheep | Six small flocks of sheep and a few goats on the down, each with a herder and a dog | Sheep and goats were kept but were a small part of the herds beside pigs and cattle [inferred from the bone counts in §10a] |
| Sound | A frame drum's slow beat in the open and low at the hearths, voices over it | [inferred] |

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

## 11. The visitor's walk (2026-11 match to the reference; `OPEN` in `layout.js`, `walkToDurrington`/`houseWalks` in `plan.js`, `open` in the style's `house` and `yard`)

| Feature | What we build | Basis |
|---|---|---|
| Open houses | Fourteen of the houses about the Durrington avenue's near end (indices in `OPEN`) can be entered: doorway 1.6 m wide under a lintel 2.1 m up, walls 2.45 m (the others keep 0.85 m, 1.5 m and 1.75 m); their yards keep the lane before the door clear (hurdle screen, log seat and water pot moved aside); each has its keeper sitting at the hearth, in some a second person on the far log seat and a child on the hide | The houses were about 5 m square with a central hearth, box beds and dressers [stated, §5a]; the doorway's size and place are not known: wider than the reconstructions' so that a visitor can walk in, which is a concession to the walker, not a finding [inferred] |
| The route | From the arrival through the entrance stones, along the Avenue past the Heel Stone and across the down to the houses; plus a route from 3.5 m before each open door to the hearth | The Avenue runs from the stones toward the north-east [stated, §1]; the waypoints were found by a search over the collision raster [inferred] |
| Far houses | The other 47 houses keep the closed form (door 0.85 m) | as §5a |

## 12. Night (`nightlight.js`)

| Feature | What we build | Basis |
|---|---|---|
| Hearths | Each house's hearth as the style draws it: a flame, where one is drawn, throws a ball and a pool of firelight on the chalk floor, the doorway spills a pool on the trodden chalk outside, the smoke glows where it breaks through the thatch; in the open houses and half the others, where no flame is drawn, banked embers (a faint red pool) | Hearths in the middle of every house [stated, §5a]; smoke rising through the thatch [stated, EH "Neolithic Houses"] |
| Open fires | Every feast and camp fire, and the one at the heart of the Southern Circle: a large glow and a wide pool, the light on the pig on the spit | Pigs roasted over open fires [stated, §10a]; the fire in the circle [inferred, §10c] |
| Camp huts | Where the hut's fire is lit: the glow at the smoke hole and the spill at the door | [inferred] |
| No lamp, torch or candle | None is built | None is attested for the Late Neolithic of Wessex [inferred] |

## 13. Sound (`soundmap.js`, `src/engine/voices-stonehenge.js`, voices prefixed `sth`; test `tests/stonehenge-sound.test.mjs`)

All [inferred]: no sound of the Late Neolithic survives; the works are those of §1c, §10a and §10c, the animals those of the bone counts (§10a), the birds those of chalk downland.

| Where | Voice | Hours |
|---|---|---|
| The sarsen dressed at the arrival (and the knapper by it) | `sthMaul`: stone mauls pounding, an uneven rhythm of 2-3 men; `sthKnap` | 7-17.5, dry |
| The sarsen on its sledge on the Avenue | `sthHaul`: a low call and answer, the rope's creak, the rollers' knock | 7-17, dry |
| Crafts among the houses (24 places) | `sthKnap` (knapping), `sthPaddle` (pots), `sthQuern` (grain), `sthScrape` (hides), `sthChop` (basket rods and wood) | 7-17, dry |
| Every open fire (26) | `sthFire`: a bed of hiss, crackles, fat dripping | all day, thinner in rain |
| Houses | `sthFire` at the hearth, `sthQuern` in the morning, `clay`; indoors the thatch's soft rain and the doorway's open hush | |
| Pigs, oxen, sheep | `sthPig`, `sthLow`, `sthBleat` at animals' places | 5-21 |
| Evening | `sthDrum` (frame drum), `sthSong` (wordless voices), `sthPipe` (a bone pipe) at the Southern Circle, a quieter drum at the stones | 17-23.5, not in rain |
| The down | `sthLark` (skylarks), `sthLapwing` by day; `sthCurlew` (stone-curlews) at dusk and by night | |

Measured with `tools/sound-render.mjs`: the maul's energy is under 300 Hz (dull blows, 5 onsets in 8 s), the fire's centroid 2.6 kHz, the drum's 117 Hz, the lark steady at 3.8 kHz. Not heard by anyone.

## 14. Animals (`fauna.js` `critters`; models `pigNeolithic`, `rook` in `src/engine/critter-models.js`)

Dogs lying beside the doors of seven open houses; 21 pigs (small, long-snouted, dark, near the boar: the early domestic pig) beside the walls of every fourth closed house and rooting at the four middens; 29 rooks walking and pecking at the middens, about the feast fires and on the trodden chalk of the Avenue. Pigs are 90% of the bones at Durrington [stated, §10a]; corvids followed feasts and herds [inferred]. No cat, hen, goose, horse or donkey (the domestic fowl came about 800 BC, the cat in the Roman period) [inferred from these dates].

## 15. Wear (`wear.js`) and writing

In each open house: the floor trodden dark in a path from the door to the hearth and across the sill, a ragged ring of ash about the hearth's kerb, and the soot of the smoke up the daub over the doorway [inferred; materials already in the plan]. No writing, sign or inscription anywhere: Britain had no script in 2500 BC [stated: general knowledge].

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

## 1e. How the stones were raised, and the earthwork's leavings (2026-11 L3; `stone_setting`, `litter` kinds `ditchfind` and `rubble`, placed in `plan.js`)

| Feature | What we build | Basis |
|---|---|---|
| Stone settings | At the foot of every sarsen upright and trilithon upright a low collar of rammed chalk rubble, longer across the stone's width, with 9-12 packing stones of broken sarsen and flint wedged in it and chalk lumps tamped round | Uprights were "hauled upright using plant fibre ropes and probably a wooden A-frame"; the hole "lined with wooden stakes and then packed securely with rubble" [stated: EH "Building Stonehenge"]; the collar's form and the stone types in it [inferred] |
| Joints | Lintels end to end with a hairline seam; mortise-and-tenon at the trilithons (tenon on the upright's top). The tongue-and-groove is inside the joint and is not drawn | Mortice holes and tenons cut so uprights take the lintels; the lintels "slotted together using tongue and groove joints", normally a woodworking joint [stated: EH "Building Stonehenge"] |
| Ditch finds | At each end of a ditch segment (the dug segments meet where the ditch is shallowest): 2-3 red deer antler picks dropped on the floor, in half of them a cattle skull and jaw, chalk blocks | The first ditch was dug "with simple antler tools" and the chalk "piled up to make an inner and an outer bank" [stated: EH]; discarded antler picks lower in the fill of a Neolithic henge ditch [stated: TVAS Kendrew Quadrangle report, a different site, used only as a parallel]; the skull deposits at segment ends and the exact places [inferred] |
| Spoil | 46 scatters of chalk lumps, blocks and flints on the bank and the lips of the ditch | [inferred: raw spoil of a fresh dig] |

## 5c. The houses' roofs and fronts (2026-11 L3; `neolithic_house` in `src/styles/neolithic/index.js`)

- Roofs: each thatch face is banded by 8-11 courses (the lip of each course's butt-ends), a hazel spar bound over every other course, the four hips bound with a rope of straw, and one face patched with fresh golden straw; counts and patch by the house's seed. Straw thatch on a woven hazel frame [stated: EH "Neolithic Houses"]; the coursing, spars, hip bindings and patches follow thatching practice [inferred].
- Fronts by rule (house seed div 5, mod 5): a bare doorway; a hide curtain rolled up over the door and tied down the jambs; a panel of daub fallen from the front wall with the woven hazel bared and the broken daub edged with chalk lumps; an ox skull with horns on a peg by the door; a split-log bench with antler picks on pegs above it. All but the first have a worn threshold slab of white sarsen-coloured stone. Cattle bones dominated the feasting deposits with pigs [stated: EH "Monumental feasts"]; everything about the fronts is [inferred]; no door fittings are preserved at Durrington.
- Web research limits: WebFetch was refused partway; the Wikipedia "Stonehenge" page was not read this pass, so the ditch segment-end deposits are marked [inferred].

## 16. Second pass, narrow form (2026-11-21): night, budget, walk gaps, landmark wear

- Night near the visitor: the arrival at night was dark within 15 m (one figure; the dressing site unlit). Added a night fire in the `crafts` plan at the stone-dressing, with three people about it [inferred: a gang working a sarsen would keep a fire; fire is the only light, no lamp or torch]. Figures leave at night except those at any fire and the households of open houses and lit huts (`keepAtFires` in `town.js` sets `nightKeep: 1` on the elements; no seed moves; the new figures come last, from `rng(2613)`). Rendered at night at the arrival (toward the fire) and before open house 60: the fire's glow and pool, the keeper at the hearth and the doorway's spill are visible at the low preset.
- Budget: arrival main 70 draws (0.69 M main triangles); six poses on the walk (three places, two yaws each) 87-159 main draws. Nothing over; nothing changed.
- Walk gaps: the camp huts were announced as enterable but their door was 1.15 m (0.52 R). The doorway now spans two panels (about R = 2.2 m) under a lintel at 2.1 m (wall 2.2 m); routes into the 13 huts near the arrival (`campHutWalks`, `plan.js` walks); a windbreak that would cross a hut's door lane is dropped, and a route starts short of the camp fire when it stands in the way. walk-check: 30 routes ok. The huts' interiors were not rendered by day; one hut seen by night (no fire in that one; the door and lintel read right).
- Landmark wear: the way in along the axis from the entrance to the altar and a fainter track inside the sarsen ring, as kicked chalk lumps and flints (`litter` kind `path`, stream `rng(2615)`) [inferred]. One day render inside the ring: the scatter is sparse but visible.
- Still short: far houses stay closed (only 14 enterable); no hut interiors by day looked at; the new path is pebbles only, no bare trodden patch.
