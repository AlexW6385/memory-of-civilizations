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

## 14. Level reached

L2 with the madrasa, Bibi-Khanym, Gur-e Amir, the observatory, the chorsu and bazaar, the town, interiors (cell, classroom, shop, house), living systems (walkers, doves and sparrows, smoke). Below Suzhou: no street-level shop goods beyond the enterable shop, no per-house furnishings, and the monuments' interiors other than the madrasa's.
