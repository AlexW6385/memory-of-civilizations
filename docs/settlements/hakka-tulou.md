# Hakka tulou, Fujian, c. 1710 — dossier

Settlement id: `hakka-tulou` · Style: `tulou` (own) · Region: south-west Fujian, Yongding / Nanjing hills (24.67 N, 117.05 E) · Code: `src/settlements/hakka-tulou/`
Status: L1–L3 in one pass (the landmark round tulou walkable on four floors with its inner ring, ancestral hall and wells; four neighbouring tulou; the stream, paddy and terraces, tea; people, animals, smoke, music).

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** Chengqi Lou (承启楼), Gaobei village, Yongding, begun 1709. Outer ring about 62.6 m across, four storeys, 288 rooms (72 a storey); a second ring of 80 rooms on two storeys; a third ring, one storey of 32 rooms; the ancestral hall at the centre; two main and two side gates [stated: Wikipedia "Fujian tulou"; travelchinaguide "Earthen Buildings of Hakkas": "four stories, four circles, 72 rooms per story, and a central rectangular ancestral hall"].
- **Moment shown:** about 1710, the first years of a completed clan house; the Hakka clan living entire in it.
- **Region and cluster:** the Fujian tulou stand in valleys among the hills; round and square forms side by side; the Tianluokeng group of five in a "four dishes and a soup" pattern — a square tulou (Buyun Lou, 1796) in the middle, round ones around it [stated: Wikipedia]. Most tulou "sit on valley floors, with a mountain at the back and water in front, sited by feng shui" [stated: National Geographic 2015]. The Nanxi tulou stand in terraced fields on the banks of the Nanxi stream [stated: nomadicbackpacker].
- **Why we choose this:** the settlement must show the clan fortress as a place one enters, so the landmark is one round tulou of Chengqi's pattern, simplified to two rings of rooms and the hall (§4.1); the neighbours are drawn from the same literature.

## 2. Layout (radius 190 m; x east, z south, origin the landmark's centre)

| Part | Where | Notes |
|---|---|---|
| Landmark round tulou | origin, outer radius 31.3 m | gate on the south toward the stream and the drying ground; a smaller side gate north [stated: two main and two side gates at Chengqi — Wikipedia; we build one of each] [inferred] |
| Drying ground (晒谷坪) | south of the gate, z 33…52 | cobbled, for grain and peppers [inferred: usual forecourt] |
| Stream with stone bridge | winding east–west about z +72 | water in front of the house [stated: NatGeo]; slab bridge [inferred] |
| Square tulou | west, (−88, −8) | three storeys, courtyard, a single gate [stated: square and round forms — travelchinaguide; Buyun Lou 3 storeys] |
| Small round tulou | east, (78, 30), r 14 | three storeys; Cuilin Lou is c. 14 m across, three storeys [stated: Wikipedia] |
| Second round tulou | (−62, 74) beyond the stream, r 19 | four storeys [inferred] |
| Second square tulou | (86, −58) up the slope | [inferred] |
| Terraced paddy | the slopes north, east and west | rice terraces [stated: nomadicbackpacker]; |
| Tea | on the upper terraces, rows along the contours | Hakka hill farming [inferred] |
| Bamboo and fir | on the hill beyond the fields | fir for beams and galleries [stated: NatGeo "large trees for beams"]; bamboo [stated: Wikipedia, bamboo in the wall] |

## 3. Orientation

The mountain at the back (north), water in front (south): the gate faces the stream [stated: NatGeo; feng shui siting].

## 4. The style (`src/styles/tulou/index.js`)

### 4.1 The landmark

- **Wall.** Rammed earth of clay, sand and lime, with bamboo strips and wood as reinforcement; the wall tapers from about 1.5 m at the base to not less than 0.9 m at the top, and leans inward [stated: travelchinaguide; Wikipedia: "Walls incline toward the centre"; "tapering from about 2 m to 1 m"]. The lower 1–2 m of the wall is cut stone or river cobbles bonded with lime, sand and clay [stated: Wikipedia]. Built: a conical wall of `earth_wall`, 1.5 m thick at the foot and 0.95 at the eave, a plinth of `granite_block` 1.4 m high outside, outer face battered inward 0.35 m over its height; courses of tamping shown as thin darker bands (`plaster_damp`) every 0.6 m [inferred: bands].
- **Height and storeys.** Four storeys, about 16 m [stated: Wikipedia: four storeys; Shunyu Lou's 15 m outer wall]. Built: floors at y 0, 3.7, 7.0, 10.2; the eave at 13.4, ridge 15.4 [inferred].
- **Rooms.** "Ground floor: kitchen and dining room. Second floor: storage. Third and fourth floors: bedrooms" [stated: travelchinaguide; NatGeo]; rooms of one size, "barely big enough for a double bed" at Dongsheng [stated: NatGeo]; "The bottom two storeys have no windows or gun holes"; outer wall carries only small high windows above [stated: Wikipedia; NatGeo "tiny upper-story windows"]. Built: 72 rooms a storey, each a wedge 4.0 m deep, 2.7 m wide at the back, separated by timber partitions; ground and first floor: no openings in the outer wall; second and third floor: one small window 0.5 × 0.65 m per room; the top floor fitted with a few gun ports [stated: Wikipedia, gun ports on the top level].
- **Gallery.** "Circular corridors use wooden boards on beams, with wooden railings" [stated: Wikipedia]; timber galleries round the court on the upper floors [stated: NatGeo]. Built: a gallery 1.7 m wide on each upper floor in front of the rooms, on projecting beams, a railing of turned posts and a rail, the posts bearing the roof; walkable.
- **Stairs.** "Four stairwells are usual, each running from ground floor to the top" [stated: Wikipedia]. Built: two stair bays on the east and west axes (three straight flights each, alternating); the other two are not built [inferred: limit of the plan's axis-aligned stair].
- **Roof.** Baked clay tiles laid radially, the eaves out about 2 m [stated: Wikipedia]; no dougong brackets [stated: Wikipedia]. Built: a single-pitch ring roof of `roof_tile` over the rooms, steeper toward the court, deep eaves on both sides, a ridge ring [inferred: shape].
- **Gate.** One main gate with doors 100–130 mm thick shod with iron, the frame a large granite block, a bar set into the granite; water tank above [stated: Wikipedia]. Built: a granite frame 2.6 m wide, 3.5 m high, two plank doors with iron straps and studs, a tile hood, a passage through the 1.5 m wall; a couplet board on each jamb (`lacquer_red`) [stated: couplets are usual at gates; inferred: wording not rendered].
- **Court.** "The open-air courtyard is paved with cobblestones and usually has one or two wells"; "A small, ornate enclosure in the courtyard is used to worship ancestors" [stated: NatGeo]; "Public wells, usually two or three, sit in the central court" [stated: Wikipedia]. Built: a cobbled court (`pebbles`), the ancestral hall in the middle of the inner ring (a hall 14 × 11 m, open fronted, three bays, a hip-and-gable tile roof on timber posts, an altar table with tablets and an incense burner), two wells (one on the main axis south of the hall, one in the east) with stone curbs, the second ring's rooms (two storeys) between.
- **Rules.** "Rules of conduct were posted inside the entrance" [stated: NatGeo]. Built: a rule board beside the gate [inferred: text not rendered].
- **Inner ring.** "The second ring has 80 rooms over two storeys, and the third ring is a one-storey library of 32 rooms" [stated: Wikipedia]. Built: the second ring (two storeys, 40 rooms a storey, two storeys of 3.4 m and a gallery on the upper), in which the school and the guest rooms may be [stated: "guesthouse", travelchinaguide]; the third ring is not built (one ring plus the hall) [inferred].

### 4.2 Neighbours

- **Square tulou:** rammed-earth walls on a cobble plinth, three storeys, a gabled tile roof, a courtyard with a well; a gate in the middle of one side; no interior stair built (reachable only to the ground floor, the court) [inferred].
- **Small round tulou:** one ring, three storeys, a courtyard, a gate [stated: Cuilin Lou, 14 m, 3 storeys].
- **Farm buildings:** a pigsty and a barn of rammed earth with a tile roof beside the tulou, outside the walls [inferred: livestock kept outside; NatGeo mentions pigs].

### 4.3 Ground and planting

- Wet paddy in terraces, each terrace a stepped level with a bund; the stream cut into the valley floor with cobbled banks and a stone slab bridge [inferred; stated: terraces beside the stream, nomadicbackpacker].
- Tea bushes in rows along the contours of the upper terraces; Chinese fir (`杉`) and bamboo groves on the hills; camphor and a banyan at the tulou's front; mist in the morning [inferred].
- **Climate:** humid subtropical, damp, frequent mist and rain [inferred: Fujian hills]. `damp` high; the earth wall streaked and mossy on its shaded face.

## 5. People and trades

Entire clan branches live in one tulou, "often hundreds of people" — Eryi Lou once had 400; each family owns a bay of rooms from ground to top [stated: NatGeo]. Hakka dress: black or indigo jackets and trousers, the women with the broad bamboo hat with a cloth fringe, the men in straw or bamboo hats working the fields [inferred: traditional Hakka dress]. Trades shown: farmers in the paddy and on the terraces, women picking tea, carrying water and washing at the well, children, elders at the ancestral hall, pigs and hens, a buffalo at the paddy.

## 6. Sound

Hakka mountain songs (客家山歌) [stated: DESIGN §7]; a pentatonic voice, a two-stringed fiddle's stand-in (ney) and a drone. Frogs and cicadas in the paddy, running water, hens, a dog, tile roofs ticking in the sun.

## 7. Sources

- Wikipedia, "Fujian tulou" — https://en.wikipedia.org/wiki/Fujian_tulou
- National Geographic, "China's Massive Earthen Fortresses Once Housed Up to 800 People" (2015) — https://www.nationalgeographic.com/travel/article/150102-hakka-china-tulou-fujian-world-heritage
- Travel China Guide, "Earthen Buildings of Hakkas" — https://www.travelchinaguide.com/intro/architecture/styles/earth-building.htm
- Nomadic Backpacker, "Hakka Tulou, Yongding" — https://www.nomadicbackpacker.com/hakka-tulou-yongding-china.html

## 4.4 The hamlet and the water-works (deepening pass)

- **Ordinary houses** [inferred: the valley's villages held tulou and, round them, lower houses of the same earth and tile]: two storeys of rammed earth on a granite foot, a tiled gable roof with a deep front eave carried on two posts, three bays — a hall in front, the ancestors' altar on the back wall of the middle bay, a kitchen and a second room (bedroom, tool room, loom or sitting room) behind partitions; the loft above is closed. Sixteen are built, in rows facing the yard (west and east) and the road (north and south of the stream). Eave 4.5 m, 7.8 × 8.6 m.
- **Ancestor altar in the hall** [stated: Hakka houses keep the ancestral tablets on the back wall of the main hall; same as the tulou hall of §4.1].
- **Earth-god shrine (伯公 *bakgung* in Hakka)** [stated: a small stone shrine at the village entrance, bridge head or under a tree is the Hakka village's tutelary; offerings of incense and fruit]. Three are built: at the bridge head, at the south-west road, and east of the yard.
- **Bamboo noria (筒车)** [stated: bamboo water-lifting wheels turning in the stream are a feature of Fujian's hill streams, lifting water to terrace channels]. One, 6.4 m across, with an axle across the stream on stone piers and a bamboo trough on trestles to the bank.
- **Washing steps** [inferred: granite steps down to the stream, as at every Fujian village; women washing and beating clothes on them].
- **Kitchen gardens** behind the rows: raised beds, greens, beans on bamboo tripods, a bamboo fence [inferred].
- **Rooms of the great ring** [inferred from §4.1: each family owned a vertical slice]: every one of the 262 rooms outside the stair bays and the gate passages is furnished — kitchen (stove, pots, vat), pigsty or tool room on the ground floor; grain store, loom or tool room on the second; bedroom, loom or sitting room with household altar above; red paper couplets by every door, lanterns and washing poles on the galleries.
- **Weathering of the earth wall**: splash-darkened foot, lichen, pale rain tails under the sills, lime patches where it was mended, bare earth in places [inferred].
- **Neighbouring round tulou** are enterable on every floor (stairs in two bays), furnished like the great ring; the square tulou's courts have well, trays, washing, hens and people but their rooms are shut.

## Round 5: four fronts along the hamlet's lanes

[inferred] The ordinary houses of a Hakka hamlet were not one pattern: beside the plain two-storey house stood the shop-house (a counter in the porch under a cloth awning, jars and baskets, a hanging board), the lime-washed house of a better-off family (painted frieze under the eave, a granite lintel over the door), and the house with a latticed balcony over the porch. `hakka_house` (src/styles/tulou/houses.js) chooses by seed; households (a woman at the tea table, an elder on the hall bench) stand in the halls of the houses nearest the arrival (town.js).

## 4.5 Detail pass: the square tulou, the windows, the hall

- **Square tulou, rooms and floors** (`src/styles/tulou/square.js`). [stated: the square tulou has a layout like the round one; each floor reaches its rooms by a shared public corridor (gallery); wooden stairs/ladders join the floors; the ground floor holds dining rooms, kitchens and spaces for poultry and livestock, with wells; the second floor has no windows and stores food and supplies; the floors above are living rooms with small windows; the central area is the clan's hall — Chinese Culture textbook, https://raider.pressbooks.pub/chineseculture/chapter/5-residential-buildings/; wide tiled eaves — same; "slits for weapons" under the dark-tiled roofs, windows only from the third floor up — China Daily, https://govt.chinadaily.com.cn/s/202107/15/WS60ef98f6498e6a12c120325b/rural-dwellings-stand-as-proud-legacies-in-fujian_3.html] Built: on each side a row of rooms 3.6 m deep with a front on the court, a door 1.24 m wide in it, timber partitions, a gallery 1.5 m wide on every upper floor with rails and balusters and posts at the room boundaries to the roof; rooms 4.0 m wide (the gate room over the passage 2.6 m); the kinds of the round tulou's rooms by floor (kitchen, pen, tools below; grain, loom, tools on the second; bedroom, sitting room, loom above) [inferred: same use as the round]. Two stair bays (west and east sides, two rooms wide): three switchback flights of 18 treads, landings, a rail round the stair hole [inferred: the round plan's stair carried over]. The four corner cells are shut (not entered) [inferred: limit of the plan's geometry].
- **Windows.** From the third floor up only [stated: China Daily]: a dark recess on the outer face with a timber frame and bars, and on the inside a framed recess; the top floor has two narrow gun ports beside each window [stated: slits for weapons]. Applied to the square tulou and to the round ones (landmark and neighbours): three bars across each opening, the gun ports on the top floor, inside and out [inferred: bar and port sizes].
- **Eaves of the ring roofs.** A drip row of darker tile ends along the edge and a fascia board under it [inferred: usual tiled-eave finish; wide tiled eaves stated, Chinese Culture textbook].
- **Ancestral hall.** Upturned ridge ends and a gourd finial; stacked-block brackets under the tie-beams; drum caps on the stone post bases; an offering table with red cloth, fruit and cups, and kneeling cushions before the altar [inferred from Hakka ancestral hall practice: offerings of fruit and incense; the curled ridge is the usual Fujian/Hakka form].

## 4.6 Farm buildings, furnished

[inferred: livestock and tools lived outside the tulou in outbuildings; kitchens, poultry and livestock spaces are stated for the ground floors, Chinese Culture textbook] The four farm buildings are entered by their door and each has its use: 0 pigsty (two straw pens with pigs, troughs, swill barrel, firewood); 1 buffalo shed (a stall with a tethered buffalo and manger, a plough, a harrow of iron teeth, a yoke on a peg, straw); 2 tea shed (racks of bamboo trays with drying leaf, a brick firing stove with its wok and hood, baskets); 3 barn (grain bins of boards, sacks, a foot-lever pestle and stone mortar, a winnowing fan). Their granite foot is now a ring so that the floor is at ground level.

Level reached: L2, the walk-in parts of L3 (all four tulou enterable and furnished; farm buildings furnished). Missing for L3: the third ring of the landmark, the second ring's upper floor, the corner cells of the square tulou, the privies, lamps lit at night, and weathering of the new rooms.

## 4.7 Round 2: the landmark seen first and seen close

Built in `src/styles/tulou/detail.js`, used by `round.js` (the landmark and the second ring; the neighbours keep their simpler wall) and `hall.js`.

- **Cobble footing.** [stated: the lower 1–2 m of the wall is cut stone or river cobbles bonded with lime, sand and clay — Wikipedia, §4.1] Built: an earth-bound core with four courses of river stones in random bond, each stone 0.4–0.7 m, its top face smaller than its foot, the top course a coping that juts a hand past the wall [inferred: sizes and bond].
- **Roof rows and rafters.** [stated: baked clay tiles, eaves out about 2 m — Wikipedia; inferred: pan-and-cover laying, the usual Chinese tile roof] Built: a cover-tile rib over every joint of the pans on both slopes of the ring roofs (7 a sector, tapering with the radius); three rafters a sector under the outer soffit with a flying-rafter tip beyond the eave. The ancestral hall's two slopes get the same rows and rafters.
- **Windows.** [stated: tiny upper-storey windows, deep in a 1–1.5 m wall — NatGeo; Wikipedia] Built: a lime-washed surround, timber jambs in the mouth of the reveal, a small pitched hood of tile on two props, and on about a quarter of the windows a boarded shutter leaf standing open [inferred: hood and shutters are common in vernacular Fujian dwellings; not sourced for tulou specifically].
- **Gate.** [stated: granite frame, doors 100–130 mm thick shod with iron, a bar set in the granite, water tank above — Wikipedia; rules posted inside the entrance — NatGeo] Built: jambs dressed in long and short courses with an outer stone frame, a stepped lintel and cornice, a name board with gilt frame and strokes standing for the characters, a pitched tile hood on corbel arms with rows of cover tiles and upturned corners, plank leaves with boards, iron straps, studs and a bronze boss and pull, red couplets whose characters are drawn as strokes (the wording is not rendered), the rules board with lines of script, a two-step threshold. Not built: the bar and its socket, the water tank (the leaves stand open against the passage walls so the way stays free).
- **Court.** [stated: the court is paved with cobblestones — NatGeo] Built: the way from the south gate to the hall as two columns of bluestone slabs in bond with a granite kerb each side, and a stone gutter (two kerbs) round the court under the inner eave, interrupted at the gate ways [inferred: eave drainage].
- **Hall.** Lattice windows in the plaster side walls (framed, 2 a side) [inferred].

## 4.8 Round 6: upstairs in the second ring

The great ring's four storeys, its galleries, its two stair bays and all 262 of its rooms were already walkable and furnished (§4.1, §4.4); the neighbouring round tulou are enterable on every floor and the square tulou have their stair bays (§4.5). What was shut was the second ring's upper storey, behind a lattice front. It is open now (`src/styles/tulou/round.js`, `ring2`).

- **Stairs.** [stated: Wikipedia "four stairwells are usual"; inferred: the inner ring's stair stood in its court] Two straight flights of 17 steps (rise 0.2 m) stand in the court of the great ring, one north-east of the hall (entered from the north gate), one south-west (from the south gate), each 1.2 m wide, with a handrail and balusters on both sides, a landing on two posts and a rail on its open side. The landing meets the balcony at a gap in the balcony's rail (two posts left out); the first reaches the balcony in front of room 35, the second in front of room 14.
- **Balcony.** [stated: timber galleries round the court on the upper floors — NatGeo; Wikipedia: boards on beams with wooden railings] A gallery 1.5 m wide (it was 0.9 m, too narrow to walk) on posts and a beam, with a rail, running unbroken round the whole ring; the ring roof's inner eave now reaches over it. Floors are colliders.
- **Rooms.** [stated: second floor storage, upper floors bedrooms — travelchinaguide, NatGeo; inferred: the inner ring's school and guest rooms] All 40 upper rooms (over the four passages too) have a door 1.24 m wide in a boarded front with a lattice transom and red couplets, partitions to the soffit, and are furnished by kind (the style's own room fillers): about a third grain rooms (bin, sacks, baskets), half sleeping rooms (plank bed with its net frame, bedding, chest, lamp), the rest looms. The kinds are fixed by a hash of the room number (`T.ring2.kinds`).
- **Walk-check.** Ten routes, five from each gate, climb a stair, walk the balcony and enter a room: rooms 30, 33, 35, 37, 39 and 10, 14, 17, 18, 20. Not routed: the sitting rooms were dropped from the upper kinds because their tea tables stand in the door's line.
- **Not done:** the ground rooms of the second ring are still empty; the third ring; the square tulou's corner cells.
