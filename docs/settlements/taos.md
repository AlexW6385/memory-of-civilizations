# Taos Pueblo, c. 1500 — dossier

Settlement id: `taos` · Style: `pueblo` · Region: the American Southwest (the Taos valley) · Code: `src/settlements/taos/`
Status of this dossier: L2 toward L3 (sixth pass, §4.6: eighteen terraced rooms in the upper storeys with their ladders, the fields); L1–L2 (the North House and the South House, terraced up to five and four storeys; the plaza and Red Willow Creek crossing it, with log bridges; kivas; drying racks; the perimeter wall; the fields, cottonwoods and willows; Taos Mountain's foot to the north-east; ground, planting, weather, music). Second pass (§4.1): the kivas' palisades, the perimeter wall, the footbridges, the mealing bins. Third pass (§4.2, L3): a furnished room, the wear of the plaster, people, dogs and turkeys, the roofs' firewood and jars. L3 recorded for later: more rooms and the room-to-room hatches, the dances, the San Geronimo church (17th and 19th centuries, after our moment), people.

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example

- **Landmark:** Taos Pueblo, its multistory adobe buildings most likely built between 1000 and 1450, looking much as now when the Spanish came in 1540 [stated: taos.org]; two complexes, Hlauuma (North House) and Hlaukwima (South House), either side of Red Willow Creek [stated: ictnews; Wikipedia].
- **Moment shown:** about 1500, before the Spanish.

## 2. Layout of the settlement (radius 320 m)

| Part | Where (m, +x east, +z south) | Notes |
|---|---|---|
| North House | north of the plaza | climbs to five storeys at its highest, its stepped profile against Taos Mountain [stated: SAH Archipedia] |
| South House | south of the plaza | swells to four storeys [stated: SAH Archipedia] |
| Plaza | between them, east–west, crossed by the creek | slightly concave, earthen [stated: SAH Archipedia] |
| Creek | through the middle, from the mountains | [stated: New World Encyclopedia] |
| Racks | wooden racks along the plaza's north side | [stated: SAH Archipedia] |
| Perimeter wall | round the pueblo | "we are in one nest" — within a perimeter wall [stated: SAH Archipedia] |
| Kivas | scattered round the pueblo | [stated: technotink] |

## 3. Orientation

The plaza east–west with Taos Mountain behind (north-east) [stated: SAH Archipedia]; the houses' terraces step down toward the plaza and the sun.

## 4. The style

Sun-dried adobe bricks, walls several feet thick, roofs of packed earth on vigas hauled from the mountains [stated: ictnews; taos.org]; rooms entered by ladders through the roofs before doors [stated: travelpast50]; parapets, small windows. [inferred: details]

### 4.1 Detail (as built in `src/styles/pueblo/index.js`)

- **Vigas.** Roofs carried on Engelmann spruce vigas, layered with branches, grass, mud and plaster; the aspen latillas laid across the vigas came after Coronado [stated: Wikipedia "Taos Pueblo"]. Vigas "typically about 6 to 10 inches (15.24 to 25.4 cm) in diameter", about 3 feet apart, their ends extended outside the wall [stated: Wikipedia "Viga"]. Built: round peeled logs 16–24 cm thick, five to a 5 m room, spanning north–south so that their ends, left long and uneven (0.25–0.9 m), stand out of the north and south faces only [inferred: the span direction, the lengths]; no latillas shown (c. 1500).
- **Entry.** "Access to rooms was through square holes in the roof that the people reached by climbing long, wooden ladders", ladders that "could easily be pulled up"; "the buildings at Taos originally had few windows and no standard doorways" [stated: Wikipedia "Taos Pueblo"]. Built: roof hatches with a raised adobe rim and the ladder standing up out of the hole, poles running 1.3–2 m past the roof; ladders leaning from terrace to terrace; few small windows (0.5 × 0.45 m) under a lintel pole, and only rarely a low doorway on the ground storey [inferred: sizes, frequency].
- **Kivas.** "These circular, subterranean structures are protected by palisades of poles and entered through the roof by tall ladders" [stated: SAH Archipedia]. Built: each kiva sunk, only a low earthen rim and roof (0.78 m) showing, the hatch with its raised rim and a ladder running 3.6 m above it; round it, 1.6 m out, a palisade of pine poles about 2.1 m high set close (0.17 m) in the ground, tied to two rails on the outside, a way 1.1 m wide left through it on the side toward the plaza [inferred: sizes, the way's side]. The interiors stay unbuilt on purpose: they are sacred, and women may not take part in the rituals held there [stated: Wikipedia "Taos Pueblo"].
- **The perimeter wall.** "Held within a perimeter wall … once taller and punctuated by fortified towers" against Comanche and Ute raids [stated: SAH Archipedia]. Built: adobe 0.85–0.95 m thick at the foot, battered, its head rounded by the rain, about 2.2 m high and a little uneven in height and line, worn lower here and there [inferred]; the towers belong to the 18th-century raids and are not shown.
- **Footbridges.** Three peeled logs side by side across the creek, bedded on sill logs along each bank and held by pegs, sagging a little over the water [inferred: the valley's timber, as the vigas; no source describes the bridges of c. 1500].
- **Grinding.** Slab metates were set in stone bins "built specifically to hold the metate at the proper angle for grinding", worked with two-hand manos, three to a row [stated: Crow Canyon Archaeological Center, Pueblo III artifacts]; Taos pottery is of micaceous clay, sturdy and plain [stated: Wikipedia "Taos Pueblo"]. Built: four rows of three slab-lined bins under the racks' shade on the plaza's north side (the racks "built for practical chores" — SAH Archipedia), a basalt metate leaning in each with its mano and the meal at its foot, a jar of water and a basket of shelled ears beside each row [inferred: grinding under the racks rather than in the rooms, which are not built].
- **Racks.** Wooden racks along the plaza's north side [stated: SAH Archipedia]; built with what the valley dried before contact — strings of maize ears, hides over the rails, strips of meat [inferred]. Chile, introduced by the Spanish, is not shown.
- **Not built, on purpose:** the beehive *hornos* now seen at the pueblo — "the Spanish introduced hornos" after 1540, with wheat [stated: National Park Service, "Hornos"]; our moment is c. 1500.

### 4.2 Third pass (L3): a furnished room, the wear of the plaster, the life of the plaza and the roofs

- **The room** (`pueblo_room`, `ROOM` in layout.js: the North House's ground-storey cell on the plaza at x −20…−15, z −58…−53). Rio Grande rooms of the period held "carved and plastered niches, probably for storing pots and household items"; "Sockets in the ceiling, along with anchors set in the floor, held supports for looms that were used for weaving"; rooms served "weaving, grinding corn, and storage", with "a fire pit" under "the smoke hole" [stated: NPS Bandelier, "Carved in Stone" — the cavate rooms of the Pajarito Plateau, c. 1150–1550]. Soot from the hearth stained ceilings and walls black [stated: Crow Canyon, "Pueblo I houses"]. Rooms were entered by hatches in the roof [stated: Wikipedia "Taos Pueblo"; "Originally, homes were entered from holes in the ceilings, but Spanish explorers introduced doors" — ICT News]. Ancestral Puebloans wove blankets of turkey feathers [stated: Archaeology, "In Full Plume"]. Built: walls 0.5 m thick, plastered inside with a lighter mud (`earth_wall`); three niches with jars; a floor of smoothed earth; four vigas across, their ends running out of the free face; a layer of branches over them, black with smoke (`bark_dark`); the earth roof with the hatch (its coaming on the roof) and the ladder from the floor up through it; a slab-lined fire pit under the hatch, with embers, a small fire and its light; a row of three mealing bins against the back wall with a woman kneeling at one; an upright loom with a half-woven cotton blanket against the east wall; a pole hung from the vigas with a turkey-feather blanket, a rabbit-fur blanket and a deerskin, drawn in soft folds; bedding rolled along the wall; a water jar with a gourd dipper, a cooking pot, bowls, a basket [inferred: the arrangement, sizes and the hung pole]. **Concession:** the room has a doorway 0.8 × 1.9 m on the plaza so that it can be walked into; the pueblo of c. 1500 had hardly any [stated, above] [inferred: made for the visitor].
- **The wear of the plaster.** The pueblo is "made entirely of adobe", and its walls are re-mudded by hand every year, old layers knocked off before new ones are packed on [stated: ICT News, "10 things to know about Taos Pueblo"]. Built: the foot of every free ground-storey face in a thicker band of coarse mud (`banco_rough`, 0.34–0.58 m high, 4–5 cm proud, run round the corners) where splash erodes it and it is renewed first; about one face in three with a patch of new, lighter plaster (`kahgel`) on the old, kept below the windows [inferred: the pattern of renewal].
- **People** (`taos-people`, style `life`): women kneeling at the plaza's mealing bins and in the room; people talking, carrying water jars, a child on the hip; figures on about one roof in twelve, some sitting. Women in a manta of cotton or deerskin, men in deerskin shirt and leggings, some with a blanket of rabbit fur, all in moccasins, the hair long [inferred: dress of the region before the Spanish; the black wool manta is later].
- **Roofs:** firewood stacked, jars and baskets at the back corners of the terraces [inferred].
- **Animals:** nine dogs; three flocks of five turkeys (`turkey`, style `pueblo`: a fanned tom and hens) [stated: turkeys kept by Ancestral Puebloans — Archaeology; inferred: dogs, the flocks loose on the plaza].
- **Still not built, on purpose:** hornos (after 1540, §4.1); chile; doors and windows of the Spanish kind.

### 4.3 Fourth pass: the working yards, the storeroom, the creek, the wear of the walls

- **Era kept at c. 1500, so what came after is left out.** *Hornos*: "Sixteenth-century Spanish explorers brought *hornos*"; before contact "there is no archaeological evidence of ovens", and "the enclosures that resembled ovens — pit ovens — were steaming chambers" [stated: Native American Foods, "Oven Baking" (ckbk)]. Adobe *bricks*, the mission church, latillas, the corner fireplace and chile are likewise later [stated: "Pueblo builders first used puddled adobe until they learned to build with adobe bricks", bricks being a Spanish introduction — Terrain.org; NPS "Hornos"; Wikipedia "Taos Pueblo"]. They are not built.
- **Cook yard** (`cook_yard`, two on the plaza, `YARDS.cook`): in place of the horno a steaming pit — a ring of river stones round wet husks under a heap of earth, steam rising — and a hot-stone griddle (a smooth slab on two stone cheeks over a fire) with thin cornmeal sheets stacked beside it, a bowl of batter, a meal basket and split wood; a woman kneels at each [stated: steaming pits, above; inferred: the griddle for thin cornmeal bread, as the Pueblos' piki, and the arrangement].
- **Mud yard** (`mud_yard`, two by the creek): the adobe of c. 1500 was puddled in courses, so a pit of wet mud with a bank of trodden earth, a heap of dry grass for temper, loaves of puddled mud stacked ready, a length of wall raised in courses with the newest paler, digging sticks, baskets of mud, a water jar, a hide to smooth with [stated: puddled adobe — Terrain.org; walls re-mudded by hand each year — ICT News; inferred: tools and layout].
- **Woodpiles and vigas** (`woodpile`, `viga_stack`): split piñon and juniper stacked at the feet of free house faces, held by stakes; new peeled vigas on sleepers on the plaza's edge [stated: vigas hauled from the mountains — ICT News, taos.org; inferred: placing and sizes].
- **Storeroom** (`STORE` in layout.js, `store` in `pueblo_room`): a second walkable ground-storey room beside the first, with no fire: three low adobe bins of shelled maize, beans and dried squash, tall storage jars with stone lids, strings of maize hung from the vigas, folded hides, cotton bags of meal [stated: rooms served "weaving, grinding corn, and storage" — NPS Bandelier; inferred: arrangement].
- **Red Willow Creek** (`creek_stones`): two fords of flat-topped stepping stones standing out of the water, and cobbles strewn along both banks at the bank's true height [inferred: a snowmelt stream in a shallow bed].
- **Weathering**: pale streaks of washed plaster under about half the viga ends; fallen plaster and crumbled mud heaped at the foot of some ground-storey faces, beside the existing coarse re-mudded band [inferred: the erosion of earth walls by rain run-off from the roof ends].

### 4.5 Fifth pass (the Suzhou standard): continuous fronts, fifteen rooms, dressed feet, a lived plaza

- **Continuous fronts.** The blocks no longer carry bare lots: a gap with two built neighbours is built over as a one-storey room, and the plaza face of each house is a continuous ground storey but for the alleys and the ragged ends [stated: the houses are "added to one another" rooms stacked in terraces — SAH Archipedia; inferred: the fill rule]. The South House's alley (x 10…15) is now the visitor's way from the south gap to the plaza (`KEEP_ROUTE`, the walk route).
- **Fifteen furnished rooms** (`ROOMS` in layout.js, `pueblo_room` kinds), all with a doorway on the plaza as the first (§4.2 concession): homes (the mealing bins, loom, fire pit, blanket pole), storerooms (bins of maize, beans and squash, jars, hung ears), **weaving rooms** (an upright loom at each side wall, blankets and skeins on a pole under the vigas, baskets of raw cotton, spindles), **sleeping rooms** (an adobe platform under hides and a folded blanket, a cradleboard hung over it, a pole of garments, rolled bedding), **workrooms** (a hide stretched and laced in a frame, bows, a quiver of arrows and a hide shield on a pegged board, a knapping pad with chips and cores, folded robes), **potters' rooms** (unfired jars drying in rows on mats, a heap of clay, coils, polishing stones, slip and paint in bowls, finished jars on an adobe shelf) [stated: rooms served "weaving, grinding corn, and storage" and looms were held by ceiling sockets and floor anchors — NPS Bandelier; Taos pottery micaceous, sturdy and plain — Wikipedia "Taos Pueblo"; the Pueblos wove turkey-feather and cotton blankets — Archaeology; inferred: hunting and hide work from the valley's game and hide clothing, the arrangements, the platform bed, the cradleboard]. Each room is a `hall` zone (music and reverb change at its door).
- **The houses' feet** (`pueblo_dress`, styles/pueblo/dress.js, items from dress.js): about two hundred pieces on the free ground faces — benches of adobe with a hide folded on them, strings of maize on a peg out of the wall, hides stretched in pole frames, blankets airing on forked rails, jars by the door, squash rings drying on mats — richer on the plaza faces, sparer in the alleys and behind; none in front of a doorway [inferred: from the pueblo's household economy; "walls re-mudded by hand every year" — ICT News]. On the roofs: racks of maize and squash, mats, jars, beside the firewood and figures of §4.2.
- **The plaza** (ramadas, hearth rings, pens): seven brush shades on four forked posts, with a grinding stone or jars under them; nine hearth rings with a tripod and a pot, some lit (smoke from them); three pens of stakes and rails with a roost, each with its turkeys; all placed by rejection against the creek, the yards, the racks, the kivas and the visitor's way, never hard-coded [stated: turkeys kept — Archaeology; inferred: shades, pens, hearths]. Turkeys now 15 loose and 15 in pens.
- **The creek**: clumps of cattails along both banks (stems, blades, brown heads) at the bank's true height, four washing places (flat stone, blanket over a log, jars, basket) [inferred: a snowmelt stream's banks].
- **Outside the wall**: middens (ash, sherds, bones, cobs) behind the houses, six watchers' platforms (four posts, a floor of poles, a brush shade, a ladder) in the maize fields [inferred: the fields watched against birds; the Taos maize fields lie round the pueblo — fields in ground.js].
- **Weathering**: soot above windows, hairline cracks where the earth shrank, a damp band under the parapet, hides hung in about three doorways in five and laced over about one window in five [inferred]; the ground trodden hard along the visitor's way and dusty at the houses' feet, chamisa and dry grass in the wall's corners and behind the North House.
- **Life**: about 48 walkers by day (was 34), weavers, potters, a man at the knapping pad and women in the rooms, 84 sparrow perches (roofs, plaza, pens, the wall), a second egret, more swallows and crows, more trout [inferred].
- **Still below Suzhou, on purpose or for want of means**: the upper storeys stay shut (no hatch-and-ladder rooms above the first), the kivas' interiors are not built (sacred, §4.1), no boats (none in the creek), and the plaza at 140 × 85 m is still wider than the real one — the blocks' positions are fixed by the walks, yards and kivas.

### 4.6 Sixth pass: the terraced rooms of the upper storeys, the ladders, the fields

- **Terraces and upper rooms.** "Upper levels and terraces served as common living space"; the "outer rooms, terraces, and other easily reached rooms" were used for daily life, while lower and harder-to-reach rooms held food stores [stated: Smarthistory, "Pueblo architecture and its relationship to place"]. "Each level was accessible by exterior and interior rooftop ladders" (same); its late 19th-century photographs of Taos show "many ladders raised against multi-level adobe walls and emerging from interior rooms" (same). Built (`UPPER` in layout.js, `pueblo_room` with `y0`): eighteen rooms in the top storey of a cell of two to four storeys (ten in the North House, eight in the South), chosen by rule: the cell in front of it is exactly one storey lower and not a room, so that its roof is the terrace; a column of cells that steps down by at most one storey at a time to the open ground, so that a chain of ladders could carry one to it; about one cell in two, never two side by side. Each room is the ground-storey room raised to its floor (walls 0.5 m, lighter plaster inside, niches with jars, the viga ends out of the free faces, the roof hatch and its ladder, the fire pit where the kind has one) with its doorway 0.8 × 1.95 m on the terrace; kinds in rotation: sleeping, weaving, home, storeroom, workroom, potter's [inferred: the rule, the rotation, the doorway, which a few terrace doorways of the later pueblo support; as in §4.2 a concession to the visitor: the pueblo of c. 1500 had hardly any]. The rooms are reached by the ladders of §4.7.
- **Ladders.** In the house blocks the old ladders stood on a roof 3.9 m from the wall they were meant to lean on; they now stand 0.8 m off the wall of the higher cell, at 1.0 m or 4.0 m along the cell (between the viga ends), poles running 1.2 m over the roof edge. For each terraced room the ladders of its column are built from the open ground up: a ladder on the ground at the plaza face (or the end of the block), then one on each roof that steps one storey up (25 ladders in all) [inferred: the chain; the ladders of the kivas and hatches are as before]. Rooftops of such a column are kept clear of the scatter of jars, wood and figures (`CLEAR`).
- **Terraces.** Before each doorway: a rack of maize and squash strings, a mat of squash rings and ears drying, jars by the door, a woman at the mat (kneeling or seated) and sometimes a man seated at the door; smoke leaves by the hatches of the rooms with a fire [stated: terraces for daily life — Smarthistory; inferred: the arrangement, the people]. The way from the ladder to the door is left free.
- **The fields.** "Beans, squash, and corn, the Three Sisters" were the staple crops, "planted close to each other in the same field", with cotton for clothing; "grid gardens" with low walls to catch rainwater; and acequias built "hundreds of years before the Spanish arrived" [stated: Albuquerque Museum, "Museum Lesson: Pueblo Agriculture" — of the Ancestral Puebloans in general, not of Taos in particular]. Built (`cornplot`, dress.js of the style): 24 plots round the watchers' platforms beyond the wall, each a grid garden 8.2 m square of four beds with low earth borders, nine hills of maize to a bed (three stalks, arching blades, ears and tassels on the later variants), beans climbing the stalks and a squash leaf between the hills; three stages of growth (young, growing, tall and ripening) [inferred: the spacing, the hills, the stage; the layout in four plots to a platform]. **Not built:** the acequia itself (nothing says where Taos drew its water before contact), and chile and wheat, which the Spanish brought.
- **Still not built, on purpose:** the kivas' interiors and anything of ceremony; hornos (after 1540, §4.1).

### 4.7 Seventh pass: the ladders walked, the hand-rounded forms

- **Ladders you can climb.** Each of the 25 ladders of §4.6 now has a walkable ramp under it (`col.ramp` in `pueblo_block`, 1.4 m wide, from the foot to the top of the wall it leans on; its low end 0.5 m under the rung plane, because the engine's roof-shell test refuses a ramp that runs above the poles' tops). A chain from the plaza to a terrace and on through the doorway into the room is walkable for all eighteen upper rooms; `walks` in plan.js holds one route per room (e.g. x -29: the plaza, ladders at the faces of rows 8, 7 and 6 of the North House, the terrace of row 4, the doorway of the room at row 3) and walk-check brings the walker to every waypoint [inferred: the ramp stands for the climb; "each level was accessible by exterior and interior rooftop ladders" — Smarthistory]. Where a ladder tops out the parapet is broken for 1.2 m, and the viga ends within 0.8 m of the ladder are left out, so that the climber passes between them [inferred].
- **Hand-rounded forms.** Exposed vertical corners of each storey are rounded (radius 0.22 m, two facets) where the cells across both edges stand lower; parapets carry a half-round roll on their beam; windows and doorways have a plaster surround standing proud of the face with a sloped sill, so that the dark opening sits in it [stated: Taos walls are plastered by hand and re-mudded every year — ICT News; inferred: the radii, the surround, which stands for a reveal because the cells are solid masses]. The pieces use `mud_plaster`, so the arrival frame gains no draw.
- **Departures from the sources of the brief, kept to the dossier's c. 1500:** no hornos, no chile on the racks, no blue-painted doors (all later, §4.1).

### 4.4 Living systems

- **People** (`movers.js`): the plaza's two banks, the bridges and fords, the alleys between the houses and the road out by the south gap; women in the manta, water-bearers, men in deerskin, elders with rabbit-fur blankets, wood-carriers, boys, about 48 by day [inferred: dress as §4.2].
- **Animals** (`fauna.js`): swallows, ravens high over the terraces, small birds on the plaza and a parapet, an egret on the creek bank, small trout in the creek [inferred].
- **Smoke** (`smoke.js`): hearth smoke from a fifth of the roofs at the meals, from the furnished room and the kivas, steam from the cook yards [inferred: one fire a household, smoke out by the hatch — §4.1].

## 5. The town

The pueblo is the town: rooms stacked in winding ranges crossed by alleys, from one to five storeys [stated: SAH Archipedia].

## 6. Ground and water

The valley floor at about 2,200 m, rising to the north-east toward the mountain; the creek in a shallow bed. (`ground.js`) [inferred]

## 7. Planting

Cottonwoods and willows along the creek; corn, beans and squash in the fields; sagebrush and grass on the dry ground. [inferred]

## 8. Sky and weather

High desert: deep blue skies, afternoon storms in summer, snow in winter. Latitude 36.4° N. [inferred]

## 9. Sound

Drums and voices, rattles, a cedar flute (a drone, a voice and the ney stand in). [inferred]

## Sources

- [Taos Pueblo — taos.org](https://taos.org/?p=210)
- [Taos Pueblo — SAH Archipedia](https://sah-archipedia.org/node/16425)
- [Taos Pueblo — Wikipedia](https://www.wikipedia.org/wiki/Taos_Pueblo)
- [Taos Pueblo — ICT News](https://ictnews.org/?p=99156)
- [Taos Pueblo — New World Encyclopedia](https://www.newworldencyclopedia.org/entry/Taos_Pueblo)
- [Taos Pueblo — travelpast50](https://travelpast50.com/?p=14611)
- [Native American Foods, Oven Baking (ckbk)](https://app.ckbk.com/reference/food34962c14s001e006e003e026/oven-baking)
- [Taos Pueblo — Terrain.org](https://www.terrain.org/articles/2/ham1.htm)
- [Viga (architecture) — Wikipedia](https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Viga_(architecture))
- [Taos Pueblo — Wikipedia (IPFS snapshot)](https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Taos_Pueblo)
- [Hornos — National Park Service, Petrified Forest](https://www.nps.gov/petr/planyourvisit/hornos.htm)
- [Taos Pueblo — technotink](https://technotink.net/science/?p=1765)
- [Carved in Stone (cavate rooms) — NPS Bandelier](https://www.nps.gov/band/learn/historyculture/carved.htm)
- [Pueblo I houses — Crow Canyon](https://www.crowcanyon.org/EducationProducts/pueblo_history_kids/pueblo_I_houses.asp)
- [10 things to know about Taos Pueblo — ICT News](https://ictnews.org/archive/10-things-know-taos-pueblo/)
- [In Full Plume (Ancestral Puebloan turkey blankets) — Archaeology](https://archaeology.org/issues/march-april-2021/digs-discoveries/digs-ancestral-puebloan-turkey-blankets/)
- [Pueblo architecture and its relationship to place — Smarthistory](https://smarthistory.org/pueblo-architecture-place)
- [Museum Lesson: Pueblo Agriculture — Albuquerque Museum](https://www.cabq.gov/artsculture/albuquerque-museum/casa-san-ysidro/documents/museum-lesson-pueblo-agriculture.pdf/@@download/file/Museum%20Lesson%20Pueblo%20Agriculture.pdf)
- [Peoples of the Mesa Verde Region: Pueblo III artifacts — Crow Canyon](https://crowcanyon.org/EducationProducts/peoples_mesa_verde/pueblo_III_artifacts.php)

## 10. Bring-up to the Suzhou standard (items 1–6)

### 10.1 The visitor's walk (§4.8)
- Taos c. 1500 has no shops or stalls: trade was household work, so the "open fronts" are the fifteen furnished plaza rooms (§4.5), the eighteen terraced rooms (§4.6, §4.7), the cook and mud yards and the mealing bins under the racks [inferred from §4.2–§4.5]. The doorways are open by design: the pueblo had no doors of the Spanish kind (§4.1), only hides over the few openings [stated: Wikipedia "Taos Pueblo"; ICT News].
- Walked routes (`walks` in plan.js): the arrival to the log bridge and North House (as before), 15 routes over the sill into each plaza room and along its front room, 4 routes to the edge of the cook and mud yards, and the 18 ladder-and-terrace routes of §4.7; walk-check brings the walker to every waypoint (38 routes). Interiors exist only as plan elements of the two house blocks (the blocks are near/far by the engine's own tiling); no far-form split was needed: draw-count at the arrival is 151 main draws.
- No wells, signs or shrines added: the pueblo drew water from Red Willow Creek (§2), signs and writing are not part of the culture, and shrines/ceremonial places are left unbuilt on purpose (§4.1).
