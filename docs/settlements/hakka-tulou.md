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
