# Timurid Samarkand, c. 1420 — dossier

Settlement id: `timurid-samarkand` · Style: `timurid` (own, built on the safavid/mughal element kit read-only) · Region: Silk Road (Zeravshan valley, Transoxiana) · Code: `src/settlements/timurid-samarkand/`
Class: Medium ●●● (radius 330 m). Status: L2, parts toward L3 (see §14).

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. The real example and the moment

- **Place:** Samarkand, capital of Timur (d. 1405) and then of Ulugh Beg's province (governor from 1409, sultan 1447). The moment shown is about **1420**: Ulugh Beg's Madrasa on the Registan just finished (1417–1420) [stated: Archnet, Madrasah-i Ulugh Beg], the Bibi-Khanym mosque finished a decade and a half before (1399–1405) [stated: Wikipedia, Bibi-Khanym Mosque], Gur-e Amir complete with Timur's tomb (1403–05; Ulugh Beg's gallery was added 1425, so is left out) [stated: Wikipedia, Gur-e-Amir; Leiden Iran-Turan], and the observatory just begun on the Chupan-Ata hill (begun in the early 1420s, finished c. 1428) [stated: Wikipedia, Ulugh Beg Observatory]. The Registan has only the one madrasa: Sher-Dor and Tilya-Kori are 17th century and absent [stated: Wikipedia, Registan; Timurid architecture].
- **Visitor's account:** Clavijo (1404) rode through "a plain covered with gardens, and houses, and markets where they sold many things", saw goods from China — silks, satins, musk, rubies, pearls, rhubarb — and Timur's gardens with fountains; Timur had the gate of the just-completed great mosque pulled down because it lacked grandeur [stated: Origins (OSU), "A Castilian in Samarkand, 1404"].
- **Compression:** the real monuments lie 0.5–2 km apart; here they stand within 330 m of the Registan, each at true size [inferred: DESIGN §11, buildings at true scale, the open country compressed].

## 2. Layout (frame in metres, +x east, +z south; radius 330)

| Part | Where | Notes |
|---|---|---|
| Registan | square x −45…45, z −42…42 | the open crossroads of the trade streets, a place of markets and proclamations; the 1365 Sarbadar rising began here [stated: Wikipedia, Registan] |
| Ulugh Beg Madrasa | west side, block x −121…−45, z −28…28, facing east | two storeys; pishtaq over the middle two thirds of the front, twice the height of the building; four corner minarets; four cruciform domed halls at the corners; a double gallery to fifty student rooms; the west iwan leads to a long mosque in the rear wall [stated: Archnet 2123; Wikipedia, Registan]. Overall plan 56 × 76 m and a pishtaq 30 m high, minarets 33 m [inferred; sources give no measures] |
| Ulugh Beg's khanqah | east side, x 47…77 | a domed Sufi lodge built 1424 across from the madrasa [inferred: it stood where Sher-Dor later rose; here from c. 1424, a few years late, left in as the east side's mass] |
| Chorsu | crossing at (100, 58) | the bazaar's domed crossroads "southeast of the Registan", a 15th-century building [stated: Wikipedia, Registan; the present one is 1785] |
| Bazaar street | z = 58, x 45…215 | vaulted street of shops, 5 m wide, lit through the domes [inferred from Timurid and Persian bazaars; compare isfahan.md §2] |
| Bibi-Khanym Mosque | centre (140, −110), axis NE–SW | enclosure 167 × 109 m, aligned with the qibla; open court 78 × 64 m; portal 35 m; main dome 40 m outside; galleries 7.2 m high on over 400 marble columns; two lesser domes at the middles of the long sides; four corner minarets; a marble Qur'an stand in the court [stated: Wikipedia, Bibi-Khanym Mosque]. Two-layer domes [stated: same]. The qibla bearing from Samarkand is about 237° (computed from the coordinates of Samarkand and Mecca), so the sanctuary stands at the south-west end and the portal at the north-east [inferred] |
| Gur-e Amir | centre (−150, 150) | mausoleum, madrasa (east) and khanqah (west) round one court, the portal on the north; the octagonal mausoleum under a ribbed turquoise dome, ~15 m across and 12.5 m high [stated: Wikipedia, Gur-e-Amir; Leiden Iran-Turan]; walls of blue, light-blue and white tile on brick outside, onyx dado and gilded painted plaster inside [stated: Wikipedia]; Timur's grave under a block of dark green jade [stated: Wikipedia] |
| Observatory | summit (−175, −130) | a cylinder of brick about 46 m across and 30–33 m high of three storeys with many arches on the upper two; on a hill about 21 m above the ground; the sextant of radius about 40 m partly in a trench 2 m wide [stated: Wikipedia, Ulugh Beg Observatory]. Ours: the building and a marble arc inlaid in the plateau marking the sextant's course; the buried trench itself is left out [inferred] |
| Town | courtyard houses on lanes between, aryk (irrigation channels) down the lanes | §6 |
| Orchards | the outer ring beyond r ≈ 270 m | "a plain covered with gardens" [stated: Clavijo above] |

## 3. Orientation

The Registan faces east–west (madrasa west, khanqah east). Bibi-Khanym and Gur-e Amir turn to the qibla (south-west, bearing ~237°); the mausoleum's portal faces north [stated: Leiden Iran-Turan]. [inferred: the madrasa's axis from the square.]

## 4. The style (`src/styles/timurid/`)

[stated: Wikipedia, Timurid architecture; Archnet 2123; Wikipedia, Gur-e-Amir]
- **Brick is the main material**; **banna'i** (glazed bricks set to make geometric patterns and Kufic inscriptions on large brick surfaces) is the cheap decoration, **haft-rang** (underglaze) tile and **tile mosaic** (mo'araq, curvilinear floral) the dear one; Archnet describes the madrasa's every exterior surface covered in hazarbaf brickwork, haft-rang tiles and mosaic faience, marble for dados and mouldings.
- **Pishtaq** (the great portal frame) taller than the building behind it; muqarnas of ever smaller cells in the iwan's half-dome.
- **Ribbed (fluted) domes**, mostly turquoise, double-shelled, on tall cylindrical drums; the outer dome rises taller than the inner one.
- **Madrasa plan**: two-storey cells round a court, an iwan at the middle of each side, domed halls at the corners (Archnet).
Ours: banna'i panels as lattices of thin lapis, turquoise and white bricks on buff brick (the frame of every pishtaq, the minarets' spirals, the drums' bands); the ribbed domes by lathe with 24–32 flutes; the pointed-arch recesses with turquoise half-domes and muqarnas cells from the kit; materials only those of the palette: `brick_buff`, `tile_lapis`, `tile_turquoise`, `tile_cream`, `tile_white`, `glaze_lapis`, `kahgel`, `marble`. [inferred: colours and proportions of each part after photographs of the surviving monuments.]

## 5. The Registan's life

A square of packed earth where the roads meet; merchants with camels and donkeys come in on the bazaar street; students and scholars cross to the madrasa; the market sets out cloth, melons and pottery [inferred: Registan as a trading and ceremonial centre, Wikipedia; goods after Clavijo]. Water carriers with a waterskin at the aryk [inferred].

## 6. The town

Courtyard houses of mud brick plastered with straw-mud (kahgel), blank to the lane, rooms round a court with a tree, a summer iwan with wooden columns on the north side, flat roofs, many with a small dome over a room; lanes 3–4 m wide; an **aryk** (open irrigation channel) down every second lane carrying water from the Siyob canal, with poplars and plane trees by it [inferred from Central Asian vernacular; the Zeravshan valley's irrigation is the basis of the oasis; compare isfahan.md §6].

## 7. Interiors (enterable)

- **A madrasa cell (hujra)** off the court's lower gallery: a vaulted room about 3 × 4 m with a niche (taqcha) in each wall, a raised sleeping platform with a felt and quilt, a low desk (rahle) with a Qur'an and manuscripts, a lamp, a water jug and a bundle of books; **the classroom (dars-khana)** under a corner dome: a carpet, bolsters along the wall, a low lectern for the teacher, students' rahles, an astronomical or geometrical diagram on a board [stated: Ulugh Beg taught mathematics and astronomy in the madrasa, per Wikipedia, Ulugh Beg Observatory and the madrasa pages generally; the furnishings inferred].
- **A bazaar shop**: a recess 3 × 4 m behind the platform, shelves, rolled carpets and bolts of silk, a scale, a copper kettle [inferred; goods after Clavijo].
- **A house**: the open courtyard house (the kit's `khaneh_open`), with its pool, talar and furnishings [inferred].

## 8. Ground, water and planting

The Zeravshan valley at about 700 m; flat with the observatory's hill (21 m) in the north-west corner [stated: Wikipedia, observatory]. Aryks in the lanes; orchards beyond. Planting: plane tree (chenar) and poplar along the aryks, elm, mulberry and apple in the courts and orchards; the Registan open earth [inferred].

## 9. Sky and weather

Continental, dry, hot summers, clear blue sky, a little dust; latitude 39.65° N [inferred].

## 10. People

Timurid scholars and students in long robes (chapan) and turbans; merchants of the Silk Road in robes and sashes, some in felt caps; women in long robes with a white or dark veil (paranja came later: here a plain headcloth) [inferred]. Camels, donkeys, horses [stated: Clavijo mentions elephants at court as gifts; not shown].

## 11. Sound

The call to prayer from the madrasa's minarets; water in the aryk; hoofs and bells of the caravan; the bazaar's hum; doves [inferred]. Music: a long-necked lute (dutar) and a reed flute over a drone in a Central Asian mode (shashmaqom-like) [inferred].

## 12. Sources

- Madrasa: https://archnet.org/sites/2123 ; Registan: https://en.wikipedia.org/wiki/Registan
- Bibi-Khanym: https://en.wikipedia.org/wiki/Bibi-Khanym_Mosque
- Gur-e Amir: https://en.wikipedia.org/wiki/Gur-e-Amir ; https://iranturan.leiden.edu/cities/samarqand-2/the-gur-i-amir-mausoleum-late-14th-early-15th-century/
- Observatory: https://en.wikipedia.org/wiki/Ulugh_Beg_Observatory
- Style: https://en.wikipedia.org/wiki/Timurid_architecture
- Clavijo: https://origins.osu.edu/milestones/september-2012-castilian-samarkand-1404

## 13. Not built (and why)

The sextant's trench (needs carved ground); Shah-i Zinda (outside the disc); Sher-Dor and Tilya-Kori (not yet built in 1420); Ulugh Beg's gallery at Gur-e Amir (1425); the citadel and city walls on Afrasiab (outside the disc).

## 15. Deepening pass (toward the Suzhou standard)

Sources: Leiden Iran-Turan, Gur-i Amir (https://iranturan.leiden.edu/cities/samarqand-2/the-gur-i-amir-mausoleum-late-14th-early-15th-century/); Orexca, "Architecture and Artistic Culture of the Traditional Dwelling in Uzbekistan" (https://sanat.orexca.com/2005/2005-1/architecture_and_artistic/); Wikipedia, Bibi-Khanym Mosque and Ulugh Beg Observatory (above).

- **Gur-e Amir inside** [stated: Leiden]: an octagonal mausoleum; a dado of onyx tiles under a muqarnas cornice; papier-mâché ornament in gold and blue on the upper walls; the cenotaphs stand together in the middle, for Timur, his sons Shah Rukh and Miran Shah, his grandsons Muhammad Sultan and Ulugh Beg and his spiritual guide Sayyid Baraka, the real graves in the crypt below. Timur's stone is dark green jade [stated: Wikipedia, Gur-e-Amir]. Ours: a square chamber 12 × 12 m (the sources give no measure) with a marble dado, gilt moulding, a lapis band and Kufic frieze, the ring to a round drum, an inner dome of lapis ribbed with gilt, the jade stone and five marble stones; the carved marble screen round them (Ulugh Beg's, with his 1425 gallery) is left out [inferred]. The entrance is by the portal's iwan and a passage in the thick north wall, not by Ulugh Beg's later east gallery.
- **Bibi-Khanym's prayer hall** [stated: Wikipedia: dome chamber behind the portal at the qibla end]: ours a 22 × 22 m hall, the portal's iwan leading through a passage, the mihrab on the south-west wall with muqarnas cells over a lapis frame, a minbar, rows of rugs, Qur'an stands, lamps [inferred: furnishings after Central Asian mosques]. The sanctuary block is now drawn in the enclosure's own turned frame (it stood square to the world before).
- **The observatory's ground floor** [inferred]: the sources give the drum (46 m, three storeys, arched faces) and the sextant, not its rooms; ours has a round hall of 15 m radius on the ground floor entered from the south, a central armillary sphere (the instruments of medieval observatories), tables with astrolabes and manuscripts, star charts on the walls. The upper floors are shut.
- **The madrasa's mosque and Ulugh Beg's khanqah** [inferred from the dossier §2]: the mosque is a long hall (3.4 × 34.8 m) behind the west iwan with its mihrab on the west wall; the khanqah a domed hall of 12 × 12 m behind its portal, with carpets and a mihrab.
- **The town's houses** [stated: Orexca: blank street walls of cob, an entrance corridor (darvazakhona) to the inner yard, rooms and aivans round the court, aivans with carved wooden columns and cornices, painted ceilings, a sufa by the garden pond, wall niches for utensils, latticed windows in small wooden bars or gypsum; houses described are 18th–early 20th century, so Timurid forms are [inferred] from them]: each house fills its lot between the lanes (unbroken fronts), has a street door with a passage and a privacy screen, a court (pool or tree, tandoor, firewood, washing line), a talar on the north wing, in the furnished houses a room off the court with a kilim, a stack of quilts, a chest and a lamp, and a mud-brick stair to the flat roof where fruit dries on mats [inferred]. Rich houses (near the Registan and the bazaar) have two storeys on the street, a timber balcony and banna'i round the door [inferred]. Walled orchard gardens (a platform (takhta) under reeds, a pool, melons) stand in about one lot in eleven [inferred: "a plain covered with gardens", Clavijo].
- **Street goods and fronts** [inferred]: the trade of each house at its door (potter, baker, smith, weaver, carpenter, grocer); benches, jars, firewood, dung cakes drying on the wall, straw, an arba (two-wheeled cart), a ladder to the roof, a carpet hung to dry; the Registan's stalls under cloth awnings (melons, pots, cloth, bread, copper, carpets, fruit) and goods spread on mats; awnings, hung carpets, cloths, trays and strings of spice at every shop of the rows and the bazaar streets.

## 16. The Registan's middle (2026-11-12 pass)

| Feature | What we build | Basis |
|---|---|---|
| Booths across the square | Two more rows of booths of the trades (carpets, cloth, pots, copper, bread, melons, fruit) under awnings, 13 on each hand, facing a clear aisle 9 m each side of the middle that leads to the pishtaq; a seller at each, buyers at most | the Registan as the open square where the trade streets met, a market place before the three madrasas were set round it [inferred: archnet.org/sites/3069 and the dossier §2] |
| Tea-house platforms | Six raised platforms (tapchan) 3.4 × 2.6 m, 0.65 m up, with a low rail, a carpet, cushions, a tray table with bowls and an ewer, a white cloth awning on four poles, guests sitting cross-legged, steam from the kettle | the tapchan and the tea-house as the Central Asian form of the public seat; the tea-house's date in the 15th century [inferred] |
| Five furnished shops in each row | The entered shop (balance, kettle, lamp, chest) repeated at five places in each shop row | [inferred] |
| Litter and apron | Straw, melon rinds, dung, sherds and scraps of cloth over the square; a paved apron of limestone flags with a kerb before the pishtaq | [inferred] |
| People | Students in a knot at the pishtaq, porters crossing the aisle, a dervish, a water-carrier, children at a game, dogs; nothing within 4 m of the arrival | [inferred] |


## 14. Level reached

L2–L3: every house's court and roof walkable, a room and talar furnished in the houses near the centres, fronts dressed, the market on the Registan, all four great interiors (Gur-e Amir, Bibi-Khanym, the observatory hall, the madrasa's mosque and classroom, the khanqah) enterable. Below Suzhou: the madrasa's upper storeys and three of its four corner halls (and the cells beyond the furnished ones) are shut, the observatory's upper floors, the minarets' stairs, Gur-e Amir's crypt and screen; no water life (there is none); weathering is by the generic material rules (plinth, patches) with no per-climate tuning; the town beyond the furnished ring is courts and roofs without rooms.

## Round 5: people at home in the courtyard houses

Measured before: within 120 m of the arrival (14, 0) in the Registan 26 houses, 24 courtyard houses and 2 garden houses, all entered, furnished and each lit by two oil lamps; someone stood at the street door of about every second, but nobody was inside. Fronts: the madrasa's pishtaq, the khanqah, the two rows of shop recesses, the one- and two-storey courtyard houses, the tea-houses' platforms.
- In the furnished houses within 135 m of the arrival (`life.js` `homes`): the host sitting cross-legged on the carpet of the talar (the raised recess on the court) and a guest across the tray; the housewife kneeling at the tandoor in the court; an old man on the charpoy. [inferred]

## 17. Detail pass (2026-11-16): the madrasa's halls, the houses' rooms and fronts, the aryk

Sources: Archnet, Madrasah-i Ulugh Beg (https://archnet.org/sites/2123: four domed corner rooms, two storeys of cells round the court); Wikipedia, Timurid architecture (https://en.wikipedia.org/wiki/Timurid_architecture: squinch and muqarnas zones under double domes); Wikipedia, Samarkand paper (https://en.wikipedia.org/wiki/Samarkand_paper: the paper of Samarkand, made from mulberry bark and rags, a famed product of the city); Orexca on the traditional dwelling (§15).

| Feature | What we build | Basis |
|---|---|---|
| Inner domes in the classroom and the library | Each hall is one square domed bay between two flat-ceilinged side bays: four corners of three stepped squinch tiers in tile with a gilt edge and a small cell, an octagon of eight lattice-screened windows in a drum, an inner dome of lapis ribbed with gilt, 2.6 m high, apex 11.1 m, under the outer dome (the shells are separate, as in Timurid double domes); walls dressed with a cream-tile dado, a lapis stripe edged with gilt and a Kufic frieze | [stated] square halls under double domes with squinches (Timurid architecture); [inferred] measures and the tier steps |
| Two more corner halls enterable | North-west: a second lecture hall (carpet, the teacher's raised seat with its high back, racks of manuscripts, rahles and cushions in rows, bolsters). South-west: the hall of the sciences (an armillary sphere on a marble drum under the dome, tables with astrolabes, star charts on the walls, rahles). Doors from the court's galleries | [stated] the four corner halls exist and Ulugh Beg taught mathematics and astronomy in the madrasa (Archnet; Wikipedia, Ulugh Beg); [inferred] which hall served what and the furnishings |
| All houses furnished | Every courtyard house (not only those within 135 m of a centre) has its room off the court | [inferred] |
| Trade rooms | A house that is not rich (and, of those, two in three) has the room of its trade instead of a guest room: potter (kick-wheel, shelves of ware, drying board, clay), baker (trough, flour, loaves), smith (hearth with hood and glow, bellows, anvil, trough, tools), weaver (upright loom with a woven web, bench, hanks of wool), joiner (bench with vice, planks, turned column blanks), grocer (counter with scales, jars, trays, strings of dried fruit), papermaker (vat, moulds, press, boards of drying sheets, mortar for bark); a craftsman at work in each, within 200 m of the arrival | [stated] Samarkand paper from mulberry bark (Wikipedia); [inferred] the trades' rooms after Central Asian craft quarters |
| Papermaker's trade | A seventh trade: sheets hung on a line at the door | [stated] as above |
| Fronts by rule | A rich house: portal with banna'i and a timber balcony. The others by seed: plain lintel, a timber porch (aivancha) on two posts, the door's block raised over the roof with a lattice, a pointed arch of stepped brick with a tile lunette; a parapet of merlons on one in three | [inferred] from the forms of Central Asian doors (Orexca) |
| Footbridges on the aryk | A plank deck with battens where each cross lane meets the channel | [inferred] |

Level: L2, the landmark's halls and the town's houses toward L3. Still missing for L3: the upper storey of the cells and the minarets' stairs, Gur-e Amir's crypt and screen, weathering tuned to the climate, house interiors beyond one room and the court, per-trade street noises.

## 18. Landmark pass (2026-11-17): the pishtaq and minarets seen close

Sources: Archnet, Madrasah-i Ulugh Beg (https://archnet.org/sites/2123: the pishtaq, tile mosaic, haft-rang and banna'i covering every face, marble for dados and mouldings); Wikipedia, Registan (https://en.wikipedia.org/wiki/Registan: minarets at the corners, the pishtaq); Wikipedia, Timurid architecture (https://en.wikipedia.org/wiki/Timurid_architecture: muqarnas of ever smaller cells in the iwan's half-dome, banna'i Kufic).

| Feature | What we build | Basis |
|---|---|---|
| Iwan half-dome | Muqarnas proper (rows of faceted cells standing out of the shell, nine rows) in place of a plain ribbed shell | [stated] muqarnas in the iwan's half-dome; [inferred] row count |
| Archivolts | Three stepped mouldings (cream, turquoise, marble; 0.42, 0.30, 0.18 m out) round the iwan's pointed arch, thinner ones round the wing niches | [inferred] stepped framing of Timurid iwans |
| Moulded frame (alfiz) | A marble and a lapis frame standing out round the whole portal field | [inferred] |
| Banna'i in relief | Kufic strokes and bars as real prisms 9 cm proud; the lozenges of the great field as pyramids with a cream cap | [stated] banna'i Kufic and diamond patterns; [inferred] relief depth |
| Cornice | A corbel cornice of two tiers of cells (brick, cream tile) under a marble slab, and a parapet of merlons capped in turquoise, replacing the flat slab top | [inferred] |
| Minarets | Eight lapis-in-turquoise pointed panels round the octagonal foot, three rings of muqarnas cells under the gallery, a lantern with eight ribs and a ribbed cap | [inferred]; the minaret height 33 m is the dossier's measure |

Arrival frame (tools/draw-count.mjs): main draws 758 before and after; main triangles 3.66 M before, 3.75 M after.

## 19. Upstairs (2026-11-18): the houses' upper floors

Found shut: the merchant's (rich) houses had a street wing of solid brick to 7 m (a balcony with a painted-on door, no rooms); every other house had only a bare flat roof. The stair of the court (mud brick, to the roof) already climbed. Built: [inferred from the traditional Central Asian dwelling, Orexca (§15): the upper room on the roof (balakhona), the upper aivan and the lattice-windowed reception room of a well-off house; Samarkand's craft quarters for the trades' stores]. Sources as §15 and §17; the 15th-century forms are [inferred] from later houses.

| Where | What is upstairs | Basis |
|---|---|---|
| Merchant's house (rich: near the Registan and the bazaar) | The street wing's upper floor at the roof's level, entered by a door from the terrace at the stair's head: three rooms with doors between — a bedroom (bedding on a kilim, chest with a stack of quilts), the reception room (mehmonkhona: a carpet, a cloth spread for the meal, bolsters along the wall, a stand with a book, niches) and a store (sacks, bales, rolled carpets, a strong-box); painted ceilings; windows with open reveals toward the lane and the court; the timber balcony over the lane is a deck level with the floor, reached by a door, with rails; a loggia (deck on brackets, rails, two columns) over the court | [inferred] |
| Every other house | A balakhona on the street wing's roof, at the end by the stair, reached from the roof terrace through a door under a porch of two posts (or, at the far end, through its inner wall); inside, bedding, a chest with quilts, niches and a lamp, and the stores of the house's trade: the potter's shelves of ware, the baker's flour, the smith's iron bars and charcoal, the weaver's bolts and hanks, the joiner's boards and column blanks, the grocer's strings of dried fruit and sacks, the papermaker's sheets drying on lines | [inferred]; [stated] Samarkand paper, §17 |

The way up: the door of the street, the passage, round the privacy screen to the foot of the mud-brick stair, up to the roof, along the terrace to the door. `walks` in plan.js: three merchant's houses and one house of each trade nearest the arrival. Upper floors are in the near form of the houses only (the far form gets the mass of the balakhona). Still shut: the ground floor of the street wing (solid), the upper floors beyond the near ring, the balakhona's own roof.

## 20. Match pass (2026-11-19): night, sound, animals, wear

Brought toward the reference (Ming Suzhou) in the order of docs/suzhou-method.md. Houses stay built near and far in tiles (`NEAR` 140 m in town.js): interiors, lamps and lit windows exist in the near form only. Everything below is what this place at this date could have had; each line is [stated] with its source or [inferred]. Sources: Clavijo, "Embassy to Tamerlane 1403–1406" (via https://origins.osu.edu/milestones/september-2012-castilian-samarkand-1404: gardens, markets, feasts under tents in Timur's gardens); Wikipedia, Registan, Samarkand paper and Ulugh Beg Observatory (above); Orexca on the traditional dwelling (§15: wall niches for utensils, latticed windows, the tandoor in the court); no source gives the lamps themselves, so the kinds are taken from the Central Asian and Persian usage of oil lamps (chiragh) of clay and brass.

### 20.1 Night (nightlight.js)

| Light | Where | Basis |
|---|---|---|
| Oil lamps in houses, halls, shops, the mosques | every lamp and brazier the style's rooms already hold gets its glow and its pool of light (halo, the added-light material, which shows at the low preset); the great hanging lamps of Bibi-Khanym, Gur-e Amir, the khanqah and the madrasa's halls throw a wide pool | [inferred] lamp oil (sesame, cotton-seed) in clay and bronze lamps; the hanging mosque lamp of glass is the style's kit |
| Lit windows | a share of the latticed windows (houses' lane fronts, the madrasa's grilles over the cell doors) show a sheet of lamp-light on both faces: a student at his lamp, a family at the evening meal | [inferred]; the madrasa's cells were lived in by students [stated: Archnet 2123, student rooms] |
| Lamp by a house door | a clay lamp on a bracket beside the street door of every rich house and one in three of the others, the pool on the lane | [inferred] |
| Lanterns at shop fronts | a brass hanging lantern at the lintel of about one in three of the Registan's shops (the rest shut with the dusk), and in every second bay of the bazaar streets | [inferred] the bazaar closing at dusk with a few lit stalls and the tea-houses |
| Iron lamp stands | six on the Registan: a pair either side of the way to the pishtaq, four where the aisle meets the shop rows | [inferred] a public square lit by stands of oil dishes |
| Braziers | three: the cameleers' camp on the east side and the khanqah's portal | [inferred] caravans camped on the square (§5) |
| Tray lamps | a lamp on the tray of each tea-house platform | [inferred] |
Not lit: the minarets, the domes, the pishtaq (no light was kept on them); the observatory's upper floors (shut).

### 20.3 Sound (soundmap.js, src/engine/voices-timurid.js, tests/samarkand-sound.test.mjs)

The call to prayer stays the engine's (profile `adhan`: five a day from the madrasa's and the mosques' minarets; no bells, none in a Muslim city). The rest is placed where it is made, by hour, season and weather (rain stops the open-air trades and the tea-house music). All voices are synthesised (`tim…`); levels set by measuring renders (tools/sound-render.mjs). [inferred throughout: no recording of 1420 exists]

| Sound | Where / when | Basis |
|---|---|---|
| Hawkers' cries (wordless): melon, bread, cloth | at every third booth of those trades on the Registan, by day (bread in the morning); at the chorsu a cloth broker | [inferred] the booths of §16; melons, bread (nan) and cloth after Clavijo's markets |
| Tea-house talk and cups; at evening the dutar and the doira | the six platforms of the Registan, 6.5–22.5 h; the music from about 16 h | [inferred] the dutar (two-stringed long-necked lute) and the frame drum as the instruments of the region; the melodies are ours, in a seven-note maqam-type mode on D |
| The nawbat (kettledrums and long trumpets) at dusk | far, from the citadel off the disc to the north-west, 17.9–18.6 h | [inferred] the naqqara-khana of a Timurid court (the state drums and trumpets) |
| Coppersmiths | five places in the bazaar streets and the shop rows, 7.5–17.5 h | [inferred] |
| The trades of the houses: potter's wheel, baker's work at the tandoor, smith's hammer, loom, plane, grocer's drawer and coins, the papermaker's pounding | each trade room (life.js / houses.js), by its own hours | [stated] Samarkand paper from mulberry bark (Wikipedia, Samarkand paper); the rest [inferred] |
| Lecture in the classroom, recitation in the mosques and at the tomb | inside the halls, by day (the mosques from dawn to the evening) | [stated] teaching in the madrasa (Ulugh Beg taught mathematics and astronomy); recitation [inferred] |
| The aryk's trickle | along every lane with a channel, all day and night | [inferred] §6 |
| Doves on the cornices | the madrasa's front and court, Bibi-Khanym, Gur-e Amir, 5.5–19 h | [inferred] |
| A camel's groan with its bell; a donkey; a caravan passing in the bazaar's streets; the water carrier in the lanes; the night watch | the camp on the Registan's east side; the bazaar streets 6–18 h; lanes 6.5–18.5 h; lanes 20.5–4 h | [stated] caravans in Samarkand (Clavijo, §1); the rest [inferred] |
Rooms (inside): the walls hush the street, the flat mud roof dulls rain; the vaulted bazaar passes a murmur and no rain.
