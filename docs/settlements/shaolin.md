# Shaolin Monastery and Mount Song, c. 1600 — dossier

Settlement id: `shaolin` · Style: `shaolin` (own, built on `ming` and the `chinese` statues; `src/styles/shaolin/`) · Region: China (Henan, Dengfeng, Mount Song's Shaoshi peak) · Code: `src/settlements/shaolin/` · Class: Small ●● (radius 190 m).
Level reached: L2 (landmark halls with interiors, Pagoda Forest, steles, planting, village, living systems).

Tags: **[stated]** by a cited source; **[inferred]** our reasoning, written next to it.

## 1. Moment and sources

- **Moment shown: the late Ming, about 1600 (the Wanli reign).** The Thousand Buddha Hall was built in 1588 [stated: Wikipedia "Shaolin Monastery", https://en.wikipedia.org/wiki/Shaolin_Monastery]; the monastery had been rebuilt at large scale after the monks' service against the Japanese pirates in the Jiajing reign (1522–66) [stated: same]; it was sacked by Li Zicheng's rebels in 1641 [stated: same], so 1600 is its fullest Ming state. The Ming monks were famed for their staff fighting [inferred: Ming sources on the "Shaolin staff" (Yu Dayou, Cheng Zongyou, Zhengwu); not fetched].
- **Why not Tang:** the Tang monastery (Li Shimin's 728 stele, Chan beginnings) is lost; Ming is when the halls we can ground stood and the Pagoda Forest was largely made [stated: "most [pagodas] date to the Ming and Qing", https://en.wikipedia.org/wiki/Pagoda_Forest].
- **Setting:** on the south slope of Shaoshi Mountain, western peak of Mount Song, under the main ridge [stated: Wikipedia "Pagoda Forest": the forest lies "at the foot of Shaoshi Mountain, under Mount Song"]; the compound faces south [inferred: Chinese monastery rule; the Shanmen is on the south front in the plan below].
- **Sources read:** Wikipedia "Shaolin Monastery" and "Pagoda Forest" (above); thetempleguy.org, "Interior of Practice Hall, Shaolin Temple" (https://chinesepilgrimage.thetempleguy.org/2019/04/135-interior-of-practice-hall-shaolin.html): "dents in the floor allegedly made by years of Shaolin stomping". A search for further numbers returned only tourist pages; what follows from memory of the standard literature is tagged [inferred].

## 2. The real monastery and what we take from it

- **Size:** the compound is 160 m by 360 m (57 600 m²), buildings in three lengthwise strips, seven main halls on the central axis and seven more round them; ginkgo trees scattered through [stated: Wikipedia]. Ours is compressed to 128 m by 270 m so that the Pagoda Forest and the village fit in the 190 m disc [inferred; the forest really lies ~250–300 m west of the monastery, stated: Wikipedia "Pagoda Forest"; ours 105–170 m].
- **The axis, south to north** [stated: names and builders from Wikipedia; the order and gaps inferred]:
  1. Shanmen (the gate hall), here a five-bay hall with a central passage, stone lions and a tablet [stated: the tablet inscribed by Kangxi in 1704 and the present gate of 1735 are later; the Ming gate is [inferred]].
  2. Tianwang Dian (Hall of the Four Heavenly Kings), first built in the Yuan, repaired in the Ming [stated].
  3. Bell tower (built 1345; bell of 1204) and drum tower (1300), flanking the court beyond the Tianwang hall [stated: dates; flanking [inferred]]. Li Shimin's stele of 728 stood before the bell tower [stated].
  4. Daxiongbao Dian (Mahavira Hall, the main hall), c. 1169 and rebuilt after; holds the Three Buddhas, Guanyin and the Eighteen Arhats [stated]. Hall of the Sixth Patriarch beside it with an iron bell of the Wanli period, about 650 kg [stated].
  5. Fatang (Dharma Hall, also Zangjing Ge, the sutra library) [stated].
  6. Fangzhang (the abbot's quarters) and the Lixue Pavilion (Standing in Snow, where Huike waited for Bodhidharma) [inferred from the standard plan; not in the fetched page].
  7. Qianfo Dian (Hall of a Thousand Buddhas, also Piluzhena Hall), 1588, repaired 1639 and 1776; murals, a bronze Vairocana (Piluzhena) and a white jade Shakyamuni [stated: Wikipedia; the jade is a later gift [inferred]].
- **The training hall:** the floor of the Qianfo / practice hall is dented by the feet of monks drilling [stated: thetempleguy.org, "allegedly"]. Tradition counts 48 pits, a hand's depth, in rows [inferred: widely repeated, not in the fetched page]. We build 48 shallow pits in six rows of eight in the hall, below floor level, rimmed by worn brick.
- **Walls and roofs:** red-plastered walls, grey tile roofs, timber red [inferred: the monastery's present look and the common Ming monastery palette; our palette `wall_red` over a grey plinth, `tile_grey`/`tile_dark`].
- **Halls' size:** the Mahavira Hall is seven bays, about 29 m wide and 12 m deep; the Tianwang and Dharma halls five bays; the gate hall five; the abbot's hall and the Lixue pavilion three [inferred: the standard plan]. Bays 4 m.

## 3. The Pagoda Forest (Talin)

- About 250 memorial pagodas (the on-site sign lists 248 markers; one scholar counts 230), of brick or stone [stated: Wikipedia "Pagoda Forest"]. The earliest dated is Master Faru's of 689 (Tang). Most are Ming and Qing [stated].
- A pagoda's number of tiers matches the dead monk's status [stated]. The yard existed before 791 [stated: Wikipedia "Shaolin Monastery"].
- Each originally bore a name-and-date inscription on stone or plaque; many have been removed [stated]. Foreign monks are recorded, a Japanese one of 1339 and an Indian of 1564 [stated].
- **Forms** [inferred: the standard picture; the forest holds: single-storey stone stupas (bell- or vase-shaped, Yuan/Ming), single-storey brick pagodas, and tall closely tiered brick pagodas of 3, 5, 7 or more eaves on square, hexagonal or octagonal plan, on stone sumeru bases, with a stone tablet in a niche on the front face and a lotus-and-ball finial]. Heights from about 2 m to over 15 m [inferred; our tallest 14 m].
- **Ours:** ~58 stupas on a gentle slope west of the compound, outside its wall, a small number of tall brick pagodas among many low ones, close-set and varied, with 6–7 big tall ones in a clump, cypresses between, a path of beaten earth through. A built element `shaolin_stupa` in the new style. Placement by hash, never overlapping.

## 4. Steles, cypresses, trees

- The Forest of Steles holds a Corridor of 124 tablets from the Northern Qi (550–570) on; the Shaolin Monastery Stele of 728 [stated: Wikipedia]. Ours: steles on turtle bases (bixi) with interlaced-dragon heads in the courts and under little pavilions, plain slabs in rows [inferred: the form is standard Chinese; Wikipedia gives the count and age only].
- **Cypresses:** ancient cypresses (Platycladus / Cupressus) stand in the courts and along the approach [inferred: Chinese monasteries; the Wikipedia page mentions only ginkgoes, stated]. Ours: `cypress` and `arborvitae` of the flora species, old ones in the courts; ginkgo's stand-in `pagoda_tree` (no ginkgo species in the engine).
- **Mount Song:** slopes of brown rock and thin pine and oak forest rising north behind the compound [inferred: Songshan geology: dry limestone and sandstone mountain, Chinese pine, cypress, oak].

## 5. The village and the approach

- A village of farmers and monastery tenants south of the gate along the approach road, grey-brick and earth-walled single-storey houses with grey-tile gable roofs around courtyards, millet and wheat fields beyond [inferred: north Henan plain village of the Ming; the monastery held large estates, stated in general terms by Wikipedia's account of its wealth, not fetched].
- Pilgrims and merchants' stalls (incense, candles, rosaries) along the road to the gate [inferred].

## 6. Interiors we build

- **Tianwang Hall:** Maitreya facing the gate (Weituo behind him is left out so that the hall's back door stays free), the four kings (two a side) on stone-and-timber pedestals, a censer, floor of square bricks [inferred: the standard arrangement of a Chinese monastery gate hall].
- **Mahavira Hall:** the Three Buddhas (Sakyamuni centre, Medicine Buddha and Amitabha beside), Guanyin behind, the Eighteen Arhats nine a side, the long altar with a censer, candlesticks and offerings, hanging banners, prayer cushions, a drum and a wooden fish at the side [stated: the Three Buddhas, Guanyin and the Eighteen Arhats; the rest inferred].
- **Qianfo Hall:** a big gilt Vairocana on a lotus throne, the walls painted (the "Five Hundred Arhats Paying Homage to Vairocana" mural; our wall bands carry painted panels), the floor with 48 pits and monks drilling [stated: murals and bronze Vairocana; the subject of the murals and the pits [inferred]].
- **A monk's cell:** a wooden platform bed with a quilt, a rush cushion, a low table with sutras, a wooden fish and a bowl, a lamp, a water basin, a shelf, a hanging scroll [inferred: common to Chinese Chan monasteries].

## 6b. Deepening pass: the lesser rooms, the village fronts, the gear and the weather

Sources: a web search for training equipment returned only page titles (chinesemartialstudies.com, "traditional training equipment in the chinese martial arts", "attack of the wooden dummies"; shaolin-kungfu.com, "The Warrior's Arsenal"), not readable text; the forms below are therefore **[inferred]** from the standard picture of Shaolin and of north-China monasteries and farmhouses, and written down so that they can be checked.

- **Training court** [inferred]: racks of the "eighteen arms" (staves, spears, sabres, halberds in a row under a little tiled roof), stone locks and stone rollers for strength, plum-blossom piles (posts of different heights in the five-petal pattern), wooden dummies. Placed in the court before the Thousand Buddha Hall, beside the monks drilling with staffs (the pits of the hall itself are [stated], §2).
- **Courts** [inferred]: great iron fire cisterns (taiping gang, water against fire) and stone lamps pairing the courts; brooms and water buckets by the doors; grey robes drying on bamboo lines in the cell yards; dry grass in the joints and at the foot of the walls (hazy dry Zhongyuan, `damp` 0.2).
- **Refectory (guotang)**: rows of long tables with benches, a bowl and chopsticks set at each place, a rice tub and ladle at the serving end [inferred: Chan monastery practice]. **Kitchen**: two brick ranges with a wok each under a flue, water vats, firewood, a chopping block, baskets of greens, steamers, ladles [inferred]. **Guest hall**: armchairs and tea tables in pairs, a painting and a long table at the back [inferred]. **Dormitory**: long platforms (tan) along the walls with a bedroll, a shelf and a robe on a peg at each place, a brazier [inferred: Chan sleeping hall]. **Hall of the Sixth Patriarch**: Huineng's figure on a stone base, the altar table, the iron bell of the Wanli period (about 650 kg) in its frame [stated: Wikipedia, §2; the frame and the figure [inferred]]. **Shanmen**: the two Vajra guardians (Heng and Ha) beside the passage [inferred: common gate-hall arrangement].
- **Bell and drum towers**: reached by a stair of granite up the court side of the brick podium to the open pavilion [inferred].
- **Weather** [inferred]: a foot of mud splash and rain streaks under the coping on the red walls, patches where the plaster has fallen to the brick, on both faces of every wall; the village walls likewise.
- **Village** [inferred: north-Henan plain village of the Ming, §5]: houses in continuous fronts on both sides of the village street and of the approach (party walls, eaves meeting), three bays, grey tile; a farmhouse inside has a **kang** (heated brick platform bed) with its stove at one end, a table with stools, a grain bin, a water vat, a chest and a New Year picture, corn and chillies hung from the beam; a shop inside has a counter across the room and shelves of the trade's goods. Shop fronts use the sign and goods vocabulary of Suzhou (name board, hanging signboard, pole with the trade's banner, goods on the apron) in the trades the road would carry: tea, noodles and buns, rice, cloth, medicine, wine, pottery, iron, books. Behind each house a yard walled in earth with jujube or persimmon, haystack, firewood, hens, washing line, a well in every third. Before the gate, a forecourt with the pilgrims' stalls round its edge, dismounting stones and a great censer.
- **Pagoda Forest**: 160 stupas (was 92), dry grass between them, stone lamps at the entrance.
- **Life**: static sellers, pilgrims, children, shop keepers and sweepers in the village and on the plaza; donkey and ox carts; dogs, cats, hens, goats; sparrows on the house ridges; swallows over the street.

## 7. People, sound, climate

- **People:** shaven-headed monks in grey robes (the working dress) and the ochre kasaya on ceremony; monks drilling with staffs in the practice hall and in the court; pilgrims and tenants in Ming dress (long gown, square cap or net-bound topknot for men; women in long robes) [inferred; dress from `ming-suzhou`'s dossier §6].
- **Sound:** the great bell and drum, chanting, a wooden fish, wind in cypresses, cicadas in summer, steel-and-wood sounds of drills [inferred]. Music: a slow pentatonic voice with a low drone in the halls, a bamboo flute out of doors.
- **Climate:** Zhongyuan, hot dry summer, cold dry winter, thin cloud, hazy [inferred]. Dust, not damp: `damp` low (0.25).

## 8. Layout (ours; +x east, +z south; axis on x = 0)

| Part | Where | Notes |
|---|---|---|
| Approach road, the village | z 140…190, x −110…110 | houses, stalls, fields beyond |
| Shanmen | z 125…132 | in the south wall |
| Court of steles | z 98…125 | steles, cypresses |
| Tianwang Hall | z 88…95 | |
| Bell and drum towers | x ±24, z 70…76 | |
| Mahavira Hall | z 33…45, on a 1.2 m platform | |
| Dharma Hall | z −2…6 | |
| Abbot's hall | z −32…−26 | |
| Lixue Pavilion | z −58…−52 | |
| Qianfo Hall | z −94…−80, 1.4 m platform | |
| Side ranges | x ±34…±52 | monks' cells, guest hall, kitchen, refectory |
| Pagoda Forest | x −172…−108, z 25…115 | |
| Mount Song | z < −120 rising | |

## 9. Not built / not known

- The Bodhidharma cave and Chuzu Temple (1.5 km away), Songyue pagoda, Zhongyue temple: outside the disc [DESIGN §7 names them for later].
- The exact Ming plans of the halls: the present buildings are mostly 20th-century reconstructions [stated: bell tower rebuilt 1994, drum tower 1996, Mahavira 1985, Dharma hall 1993].

## 10. What is built (L2)

- **Style `shaolin`** (`src/styles/shaolin/`): `ming_hall`/`ming_wall`/`ming_pavilion` of the Ming style in the monastery palette (red timber and plaster, grey tile, grey stone plinth); new elements `shaolin_stupa` (brick tiered, stone vase, bell types on 4/6/8-sided plans with tablet niche, corbelled eaves, lotus-and-ball finial), `shaolin_stele` (tortoise base with dragon head, or plain), `practice_floor` (48 real recesses through a brick floor), `shaolin_interior` (Tianwang, Mahavira, Dharma, Qianfo halls, monk's cell), `court_censer`, `stone_lion`, `bell_hung`, `path_earth`. Furnishing of the abbot's hall and the Lixue pavilion reuses Suzhou's `hall_furniture` (imported read-only).
- **Compound** 124 × 240 m on the axis: Shanmen, Tianwang, Mahavira (30 × 11.5 m on a 1.2 m platform with terrace and censers), Dharma, abbot's, Lixue, Qianfo (on 1.4 m); cross walls with side gates; bell and drum towers (brick podium, open pavilion, bell and drum); ten side ranges; steles in rows, Taizong stele pavilions, a corridor of steles along the west wall; bluestone courts and a granite processional way.
- **Pagoda Forest:** 92 stupas (7 tall brick ones of 5–7 eaves, the rest low brick, stone vase and bell stupas) on a gentle slope with a path of beaten earth.
- **Village:** ~50 grey-brick houses in continuous fronts along the street and the approach, each furnished (see §6b).
- **Life:** monks in the pits of the training hall, kneeling in the Mahavira Hall, reading, in a cell, sweeping and carrying; pilgrims and villagers; walkers (monks, staff-bearers, scholars, townsmen, women, farmers, porters); swallows, sparrows, crows; incense and kitchen smoke.
- **Left out:** Weituo behind Maitreya, the two-storey Dharma Hall, the Bodhidharma cave, Chuzu Temple, Songyue and Zhongyue, a ginkgo species (stand-in `pagoda_tree`).
