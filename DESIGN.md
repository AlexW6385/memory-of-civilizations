# Memory of Civilizations — Design

> **This document is the brief for the whole project.** It is written so that an implementing agent can work from it, alone, without further direction from the author. Read it in full before touching anything, follow it, and keep it current and short (§11). If something is unclear, decide in the spirit of §3 and record the decision (§11) — do not stop to ask.

## 1. What this is

**A small planet you can walk and fly over, on which the civilizations of Earth — each a place at a time — stand where they stood, as real, detailed settlements.**

A **civilization** here is a place *and* an era: Tang China and Ming Jiangnan are two; so are Justinian's Constantinople and Ottoman Istanbul, which stand on the same shore. Each is present as a **settlement**: a famous **landmark** built after the real building, with its full interior, and round it the **townscape** of its people and time — the streets, houses, courtyards, markets, gardens, walls, water and fields the landmark actually stood among. The Forbidden City with the hutongs; a Ming garden with the canals and whitewashed houses of Suzhou, and a little way off the Southern Song capital on its lake; the Sainte-Chapelle and Notre-Dame on their island among the timber-framed lanes; Angkor among stilt houses and rice; Machu Picchu among its terraces. The townscape matters as much as the landmark: a visitor should feel what it was to live there, not only to visit the monument.

**Detail is the point.** A settlement is finished only when it bears looking at from a metre away: the coursing of the masonry, the wear on the threshold, the goods in the market, the pots by the well, the laundry in the court, the lamp in the niche, the boats at the quay, the moss on the north wall. §5 is the standard.

The settlements sit on a planet whose continents, oceans and latitudes follow Earth's. Walk out of Rome and the Mediterranean is there; fly east over Persia and India to China; the sun stands higher at Sanchi than in Paris; it is evening in Kyoto while it is morning in Athens. Civilizations of one region stand near each other, roughly in order of age, so that walking from Tang Foguang to Song Kaifeng to Ming Suzhou is a walk through Chinese history. Between regions the land is open — coasts, hills, forest, steppe, desert by latitude and continent — sparse but never blank. The planet is small enough to fly across in a few minutes, and the globe map jumps anywhere at once.

The look is realistic: true proportions, physically based materials, baked global illumination indoors, real sun and sky, a real atmosphere seen from height. Each settlement has music in the manner of its civilization and time.

**Names:** English *Memory of Civilizations*, Chinese 文明的记忆. Repository `AlexW6385/memory-of-civilizations`. **Live site:** https://alexw6385.github.io/memory-of-civilizations/

## 2. What this is NOT

- **Not a note-taking or study app.** No annotations, no loci, no numbered routes, no markers in the world. The map may name a place; nothing in the world carries a label.
- **Not a game.** No objectives, collectibles, puzzles or NPC dialogue.
- **Not a scale model of Earth.** Topology is true (what borders what, which sea lies where, latitude), proportions are not: the planet is some 800 times smaller and crowded regions are magnified and pushed apart (§4.2).
- **Not cartoon, simplified or empty.** Realistic, dense, lived-in.
- **Not invented architecture.** Every landmark follows a specific real building; every townscape follows the documented urban form and house type of its place and period, with sources. Detail is composed in the manner of the sources, never copied from a copyrighted reproduction.
- **Not a product for every device.** Targets the author's own computer (Apple M2, 8 GB) and phone.
- **Not connected** to the author's other projects.

## 3. What to get right, in order

Resolve conflicts in this order, but the first three are near-equals: none is sacrificed wholesale for another.

1. **Detailed and true.** Richness of real detail, in landmark and townscape, to the standard of §5, and all of it traceable to the sources (§6). Thin or generic is the one unacceptable result.
2. **Realistic and beautiful.** Materials, light, shadow, atmosphere as close to real as the web allows. Picture quality on the author's machine never goes down silently (§11).
3. **Smooth.** Aim at 60 fps on the author's machine; 40 is acceptable in the densest interiors, 30 in high flight; never a stall or a hitch. Smoothness is reached by streaming, LOD, instancing, baking, impostors and culling — by engineering, not by removing detail. Only when all of those are exhausted may detail be thinned, and then the far and the small go first, recorded as a decision (§11). Budgets in §8.
4. **Civilizations, not monuments.** Every settlement has a townscape; a bare landmark is unfinished. The set of settlements covers the world's places and eras; nearby civilizations of one region stand together.
5. **Free and quiet.** Walk, fly, look, a map, a clock, a few settings. Nothing else on screen.
6. **Light to start.** The first frame comes fast; the rest streams.

## 4. The planet

### 4.1 Shape, size, movement

- A sphere of **radius 8 km** (circumference ≈ 50 km). Ground is the sphere plus relief (≤ 300 m: hills, a few mountains, coasts). The whole planet is walkable except open water and slopes over ~40°.
- Gravity points to the centre; the walker's "up" is the local normal. Settlements are built on their local tangent plane (flat ground) blended into the sphere at their edge — nothing in a settlement needs to know the world is round.
- **Walk, run, fly.** Walking 2.0 m/s, running 5.2. Hold Space to rise, release to glide down; speed grows with height (9 m/s near the ground, +0.22 per metre up to 120 m/s; with Shift 18, +0.45 per metre up to 240; `src/core/walk.js`), so the ground below reads as a landscape, not a blur. Ceiling ~1.5 km above the ground, high enough to see the curve and the atmosphere.
- **The map is a globe.** The corner map shows the land round you (north up); the large map is the planet itself, turnable, with the settlements marked and named by civilization and date; a click on one opens its **card** (below), whose **Go** button flies you there (fade, load, arrive at the settlement's chosen view of its landmark, §4.4).
- **The settlement card.** Name, era, then a short plain text in the site's language: the place's background, time, civilization and style, and the names of its main sights with what marks each. Description only — no guidance, no suggested route, no purpose or call to act. Below it, the Go button. Texts in English and Chinese, one per settlement, in `src/planet/cards.js`, written from its dossier and its row in §7.
- **The clock:** drag to set the hour, let the days run. One global time; what differs by place is the sun (§4.3).

### 4.2 Geography

- **Continents follow Earth's outlines** — Eurasia, Africa, the Americas, Australia, the main islands (Britain, Japan, Java, Sri Lanka, Crete, Sicily, New Zealand) and the main seas (Mediterranean, Red Sea, Persian Gulf, Black Sea, the Sea of Japan, the Caribbean). Simplified to what reads at this scale; nothing smaller than ~200 m across.
- **Regions.** Settlements group by **region** (the Nile valley, Mesopotamia, the Aegean, Latium, the Bosphorus, the Île-de-France, Jiangnan, the Kansai, the Valley of Mexico…). The region is placed at its true latitude and longitude; its settlements stand within ~1–2 km of each other, roughly in order of age along the land, each keeping its real relation to water (Venice on the sea, Istanbul on the strait, Edfu by the Nile, Hangzhou on its lake). Earth is mapped onto the planet through a few mild lenses that magnify the crowded parts of the world (Europe and the Near East, India, East Asia) without bending the continents out of shape; then settlements are pushed apart until every two stand at least `radius_a + radius_b + 2·blend + gap` apart (~640 m), kept on land, holding as close as they can to their mapped true places (`tools/planet-layout.mjs`). Final positions live in `docs/world.md`.
- **Between regions** the land is open country by latitude and continent: tundra, taiga, temperate forest and field, steppe, desert, savanna, rain forest, with the great rivers (Nile, Tigris–Euphrates, Indus, Ganges, Yangtze, Yellow River, Danube, Rhine, Amazon, Mississippi) as water you cannot wade, and coasts with beaches or cliffs. Relief is gentle except for named ranges that frame the geography (Alps, Himalaya, Andes, Zagros, Atlas) as low ridges. This landscape is seen mostly from the air and crossed on foot now and then; it is built for the view — ground material, scattered vegetation, rivers, shoreline, haze, the odd rock or ruin-free hill — not for walking detail. No houses or roads outside settlements, except the roads and fields that join settlements of one region.
- **Oceans** are water with reflection, waves and foam at the shore; not walkable; flyable.

### 4.3 Sun, sky, climate

- **One sun, one date.** The sun's direction at any point follows from that point's latitude, the global hour and a fixed date (the equinox). The day lasts half an hour of real time. Night: moon, stars, the Milky Way, eye adaptation.
- **Atmosphere.** A physically based sky and aerial perspective (Rayleigh + Mie, one model for the whole planet): blue haze over distance, the red limb at dusk, the curve of the horizon and the thin blue rim seen from height.
- **Climate by settlement** drives ground, vegetation, haze and the weather cycle (clear, fair, cloudy, overcast, showers, dust, snow, monsoon), chosen from the real climate of the place; between regions the biome follows latitude and continent. Weather belongs to a region and moves slowly.
- **Baked light** per settlement at its own chosen hour, scaled by the live daylight.

### 4.4 A settlement

A settlement is ~300 × 300 m (larger where the landmark or the urban form needs it — Beijing, Venice, Tenochtitlan, Hangzhou; smaller for a monastery or a village). It holds:

- **The landmark** at true scale, built to its dossier, with its interior.
- **The townscape:** the real urban pattern (grid, organic, canal, walled compound, terraces), the house types of the place and period (plan, storeys, roof, materials), the public spaces (square, market, well, bathhouse, precinct, walls, gates), the gardens, fields or orchards at the edge, the water (quay, canal, pond, river bank), and the plants of the place. Houses are instances of a few sourced types with variation, built from the same style modules as the landmark. Several houses, a shop, a workshop and an inn or the like can be entered and are furnished.
- **Life as objects and sound** (§5): the things of daily use in their places, animals, figures where the dossier describes them, the sounds of the place.
- **Its music**, by zone (inside the landmark, in the streets, at the edge), and ambience.
- **Its own hour for baking,** its climate and its weather set.
- **A boundary** that blends the settlement's ground into the open country over ~30 m, or into the next settlement of its region along a road or a river.
- **Its arrival view:** travelling there from the map sets the visitor down on foot at the place, height and direction from which the landmark is seen best — whole and framed, not cut off, blocked by a wall, stall, tree or column, or seen from too close or too far — at its classic approach where it has one (the Taj Mahal down its water channel, the Opera House across the cove with the Harbour Bridge behind). Each settlement's view is chosen by looking at it and written down in `src/planet/arrivals.js` as [x, y, z, yaw, pitch] in its frame; a new settlement gets its view when it is built, and a view is checked again whenever the settlement changes round it. The automatic choice (`viewpoint`) is only a fallback for a settlement without one.

Two landmarks that stood in one city at one time (Sainte-Chapelle and Notre-Dame; the Forbidden City and the Temple of Heaven) share one settlement.

## 5. The detail standard

What "detailed" means. Every settlement reaches all of this at L3; L1 and L2 are the steps there (levels at the end of this section).

**Surfaces.** Masonry follows the real coursing, block sizes and joints; timber shows its grain, joints and pegs; plaster is uneven and patched; tiles and shingles are laid as they were, with the odd slipped or broken one. Every material responds to light as the real one does (polish, roughness, subsurface in marble and jade, sheen on silk and lacquer, dust on cloth). Weathering and use everywhere they would be: wear on thresholds, steps and handrails; soot over lamps and hearths; damp, moss and lichen on the shady and the wet side; dust in corners; rain streaks under sills; patina on bronze; the darker lower metre of walls along a street.

**Decoration.** The full programme the dossier gives — orders, mouldings, capitals, friezes, reliefs, inscriptions, painted ceilings, mosaics, tiles, screens, lattices, gilding — at the density the real building has, composed in the manner of the sources. Nothing left as a flat colour where the original had pattern.

**Objects of use.** Every room holds the things it was used with: altars and their vessels, thrones, beds, chests, tables and stools, lamps and candles, books and scrolls, looms, pots, tools, weapons, baskets, mats, carpets, hangings, incense, offerings. Streets hold carts, barrels, bales, market stalls with their goods, signs and banners of the period, wells with buckets, troughs, benches, laundry, firewood, nets and boats at water, ladders, ropes, animals (horses, oxen, donkeys, camels, dogs, chickens, pigeons, cats — as figures). Gardens hold the right plants, pots, paths, lanterns, stones, water.

**Light.** Daylight through the real openings; lamps, candles, braziers and hearths where they were, with their warm pools and smoke; coloured light through glass and lattice; dust and incense in beams of sun; reflections on polished floors and water; wet ground after rain.

**Sound.** Music by zone (§4.4) and ambience of the place: wind, water, birds, bells, the market, animals, rain on tiles, the reverberation of each hall measured to its volume and materials.

**Plants.** The species of the place and time, at the right size and spacing, with wind; grass, weeds in cracks, ivy, moss; crops in their fields; trees with real bark and canopy density.

**Figures and life.** Where the dossier describes who was there and what they did, still figures in the right dress may stand in their places (a priest at the altar, a merchant at the stall, a monk in the cloister), kept few and quiet; never animated crowds, never dialogue.

**Scale of care.** Anything within 20 m of a walkable spot must bear a close look; anything within 200 m must read correctly in form, material and colour; beyond that, impostors and simplified shells are allowed as long as the skyline and the colours are right.

**Levels.** Each dossier states the level its settlement has reached.

*Per settlement*
- L0 — not built yet.
- L1 — landmark at correct plan, section, structure, proportions, walkable, main materials, daylight, music; townscape as street network, house shells of the right type and public spaces; the settlement on the planet with its boundary.
- L2 — landmark's full decorative programme and baked light; townscape with house variation, courtyards, walls, gates, gardens, water, planting; several buildings enterable and furnished; the principal objects of use in place; ambience.
- L3 — the full detail standard of §5: weathering and wear, fine decoration, every room's objects, street life, animals and figures, lamps and coloured light, sound of the place.

*Planet*
- L1 — sphere, continents, oceans, sun by latitude, flight, globe map, streaming, impostors.
- L2 — biomes with vegetation, rivers, coasts, atmosphere, weather regions, roads and fields between a region's settlements.
- L3 — named ranges, seasons, set pieces (monsoon over Angkor, snow on Borgund, dust over Djenné, mist on West Lake).

*Visual*
- L1 — PBR, shadows, GTAO, tone mapping, atmosphere.
- L2 — baked GI, reflections, bloom, wet and worn materials.
- L3 — stained glass, incense haze, candlelit halls, moonlit water, dust in sunbeams.

## 6. The dossiers (archive)

Every settlement is built from a sourced dossier under `docs/settlements/<id>.md` (English; our own notes and references only). Nothing is built without its dossier; reading it should be enough to rebuild the settlement from scratch.

A dossier has three parts:

**Landmark** — the real example (name, place, dates, builders); type and typology; plan with dimensions (overall, each room, wall thicknesses, column spacing, storey heights); section and structure; sequence of spaces and use; materials per surface; decorative programme and where each element belongs; furnishings and objects of use per room; lighting; what is **[stated]** by sources versus **[inferred]** by us.

**Townscape** — the city or village at the chosen date: extent and population; street pattern and widths; block and plot sizes; house types (plan, storeys, roof, materials, courtyards) with at least one documented example each, and their furnishings; public buildings and spaces; walls and gates; water; gardens and fields; vegetation; climate and weather; the street life of the place (trades, markets, animals, vehicles, dress) with sources.

**Sound** — the music of the civilization and period (scales, instruments, forms, where music was heard) and the ambience.

Sources: architectural and urban histories, published plans and surveys, archaeology reports, heritage documentation, scholarly articles, museum collections for objects and dress, Wikipedia for orientation. Drawings and photographs are references to study, never assets to copy.

## 7. The civilizations

**The set is 100** (the author, 2026-11-09). It is closed: one is added only by taking another out. Three reasons bring a settlement in, and all three count: it shaped history; its form is like no other; or without it a people or a continent would be missing.

The list below is the plan: every settlement, built or not, with its moment, why it is here, the works and ideas tied to it, and what it holds. **L** is its level (§5); **L0** = not built yet. A built settlement's level is the one its dossier states — set by the agent that built it, not yet checked against §5 in the browser; when a dossier's level changes, change it here. The data the code uses (id, true position, disc radius) is in `src/planet/sites.js`; a settlement's facts and sources are in its dossier. The dossier fixes the exact moment and may substitute a better-documented example; "moment to be fixed" marks a place with several possible periods.

Where little stands today (Baghdad, Ye, Linzi, Chang'an, Karakorum) the dossier says plainly what is reconstructed from texts and excavation. For living Indigenous cultures, use only what the communities and published heritage documentation share publicly; nothing secret or sacred is depicted. Settlements of one place at different times (Qin, Han and Tang at Xi'an; the two Romes; Giza and Cairo) stand side by side.

57 built, 43 at L0.

**China and Tibet (17)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Shang — Yinxu, Anyang (c. 1250 BC) | L0 | Capital under Wu Ding; the first Chinese city known from its own writing | Oracle-bone inscriptions; the Shang hymns of the *Shijing*; Lady Fu Hao | Rammed-earth platforms with thatched halls and temples, the Huan river, bronze foundries, oracle-bone pits, chariot burials, Fu Hao's tomb |
| Warring States — Linzi, capital of Qi (c. 320 BC) | L0 | The largest city of the east in its day; seat of the Jixia Academy | The *Zhanguo ce* on its crowded streets; Mencius and Xunzi at Jixia | Great and small walled cities, drains, markets, the Jixia halls, cuju and cockfighting |
| Qufu — Confucius's Lu (moment to be fixed) | L0 | Home of Confucius | The *Analects*; teaching at the Apricot Altar | Temple of Confucius and its Dacheng Hall, the Kong mansion, the Kong forest, the Apricot Altar |
| Qin — Xianyang and the First Emperor's mausoleum (c. 210 BC) | L0 | The first unified empire | Sima Qian's annals of the First Emperor; Han Feizi and Li Si | Raised palace terraces, imperial roads, the painted terracotta army in its pits, standard weights and measures |
| Han Chang'an (c. 100 BC) | L0 | Capital under Emperor Wu; the eastern end of the Silk Road | Sima Qian's *Shiji*; Ban Gu's rhapsodies on the two capitals; Confucianism made state doctrine | Weiyang Palace's front hall, Changle Palace, the East and West Markets, walled wards, Kunming Lake, the Imperial Academy |
| Three Kingdoms — Ye (c. 215) | L0 | Cao Cao's capital; the first capital laid out on one central axis | Jian'an poetry; Cao Zhi's rhapsody on the terrace; *Romance of the Three Kingdoms* | The Bronze Bird, Golden Tiger and Ice Well terraces, the Wenchang Hall, the axial avenue, the Zhang river |
| Tang Chang'an (c. 750) | L0 | A city of a million under Xuanzong, the metropolis of its world | Li Bai, Du Fu, Wang Wei; *Song of Everlasting Sorrow*; Xuanzang's record of the Western Regions | Daming Palace's Hanyuan Hall, the Great Wild Goose Pagoda, 108 wards, the West Market's foreign merchants, Qujiang Pool, Zhuque Avenue |
| Tang — Foguang Monastery, Mount Wutai (857) | L1–L2 | The most important timber hall surviving from the Tang | Tang Buddhism; found by Liang Sicheng and Lin Huiyin in 1937 | The East Hall with its bracket sets and statues, the hillside monastery, a village |
| Northern Song Kaifeng (c. 1120) | L1–L2 | The city of *Along the River during Qingming*; China's commercial revolution | Zhang Zeduan's scroll; Meng Yuanlao's *Dongjing meng hua lu* | Iron Pagoda, Rainbow Bridge, grain boats on the Bian canal, shops along the streets, markets |
| Southern Tang Jinling (c. 960) | L0 | The most cultured court of the Five Dynasties and Ten Kingdoms | Li Yu's ci poems; Gu Hongzhong's *Night Revels of Han Xizai*; Dong Yuan's landscapes | The palace city, the Qinhuai river, a scholar-official's house at night, the Qixia Temple relic pagoda |
| Southern Song Lin'an, Hangzhou (c. 1200) | L1–L2 | Among the largest and richest cities in the world | Wu Zimu's *Mengliang lu*; West Lake poetry; Marco Polo's Quinsai | Liuhe Pagoda, West Lake, the Qiantang river, tea houses, pleasure boats |
| Ming Suzhou (c. 1530) | L2–L3 | The model of the Jiangnan garden and water town | Wen Zhengming's album of the Humble Administrator's Garden; the Wu school; kunqu | The Humble Administrator's Garden, canal lanes, white walls and black tiles, stone bridges |
| Ming–Qing Beijing (17th c.) | L1–L2 | The late imperial capital, the Forbidden City and the Temple of Heaven together | Ritual and the order of heaven; the age of *Dream of the Red Chamber* | The Forbidden City's Outer Court, the Hall of Prayer for Good Harvests, walls and moat, hutongs and courtyard houses |
| Hakka tulou, Fujian (c. 1710) | L0 | Clan fortresses of rammed earth, a form like no other | Hakka mountain songs | Round many-storeyed houses, the ancestral hall, the shared well, tea terraces |
| Dunhuang — the Mogao caves (9th c.) | L0 | The treasury of Buddhist art on the Silk Road | The Library Cave; the *Diamond Sutra* printed in 868; flying apsaras; bianwen | A cliff of caves under timber eaves, murals, the Singing Sand dunes, Crescent Spring, caravans, the oasis town |
| Shaolin Monastery and Mount Song (moment to be fixed: Tang or Ming) | L0 | The cradle of Chan | Bodhidharma facing the wall; Huike; Shaolin martial arts | The gate, the Pagoda Forest, Bodhidharma's cave, Songyue Temple's Northern Wei brick pagoda, Zhongyue Temple, Songyang Academy |
| Tibet — Lhasa (1694) | L2–L3 | The Potala completed after the Fifth Dalai Lama | Tibetan Buddhism; circumambulation and pilgrimage | The Potala's Red and White Palaces, Shöl town, the circuit and its prayer wheels |

**Japan and Korea (5)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Nara (752) | L1–L2 | The year the Great Buddha was consecrated; state Buddhism in the Tang manner | The *Man'yōshū*; Emperor Shōmu | The Great Buddha Hall of Tōdai-ji, the temple town |
| Heian — Uji (1053) | L1–L2, L3 in part | Byōdō-in's Phoenix Hall; Pure Land faith and court taste | The Uji chapters of *The Tale of Genji*; mappō, the latter age of the Dharma | The Phoenix Hall and its pond, the Uji river, a timber village |
| Muromachi Kyoto (c. 1490) | L0 | Higashiyama culture, where the Zen aesthetic took form | The dry landscape garden; Murata Jukō's tea; wabi; Noh | Ginkaku-ji and its Tōgu-dō, Ryōan-ji's rock garden, machiya, a Zen abbot's quarters |
| Edo — Himeji (c. 1620) | L1–L2 | The most complete Japanese castle | The samurai order; the castle town | The keep, the castle town's machiya, samurai houses |
| Joseon — Hanyang (c. 1888) | L2–L3 | Gyeongbokgung as rebuilt, the last decades of Joseon | Neo-Confucian court ritual; the reign of Gojong | Gyeongbokgung, Gyeonghoeru, Hyangwonjeong, the avenue of the six ministries, Jongno, hanok |

**South Asia (8)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Mohenjo-daro (c. 2500 BC) | L0 | The Indus civilization, the one great ancient river civilization still missing | The undeciphered seal script; the "priest-king"; the bronze "dancing girl" | Grid streets, covered drains, the Great Bath, the granary, fired-brick houses, seal workshops |
| Early Buddhist India — Sanchi (1st c.) | L1–L2 | Ashoka's Great Stupa; early Buddhist art | Ashoka; the Jataka tales on its gateways | The Great Stupa and its four gateways, monasteries, a limewashed village |
| Ajanta (c. 480) | L0 | The summit of Indian Buddhist painting | Jataka murals; the Bodhisattva Padmapani | About thirty caves cut in a horseshoe gorge, chaitya halls and monks' cells, murals, the waterfall |
| Nalanda (c. 640) | L0 | Where Xuanzang studied; one of the world's first universities | Xuanzang's record; Madhyamaka and Yogācāra; Śīlabhadra | Brick monasteries and lecture halls, Sariputta's stupa, libraries, monks in debate |
| Medieval Hindu India — Khajuraho (c. 1050) | L2 | The Chandela temples, the summit of north Indian temple building | The temple as the cosmic mountain; temple sculpture | Kandariya Mahadeva and the Western Group, the temple town |
| Dravidian South India — Madurai (c. 1650) | L2 | A temple city whose streets ring the temple | Tamil Sangam literature; the cult of Meenakshi | The Meenakshi temple and its gopurams, concentric streets, the sacred tank |
| Mughal Agra (1632–1653) | L1–L2 | The Taj Mahal being built | Shah Jahan and Mumtaz Mahal; the garden as paradise | The Taj Mahal, the charbagh, the Yamuna, the bazaar town |
| Bhaktapur, Nepal (c. 1700) | L0 | The Newar city of the Malla kings | Newar woodcarving and pottery | The five-storey pagoda of 1702, Durbar Square, carved windows, Pottery Square |

**South-East Asia (5)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Java — Borobudur (c. 825) | L2 | The largest Buddhist monument, a mandala in stone | Mahayana Buddhism; the Jataka and Gandavyuha reliefs | The terraces, 72 latticed stupas, a monastery, a Javanese village |
| Khmer — Angkor (c. 1150) | L2 | Suryavarman II's Angkor Wat, the largest religious building | Zhou Daguan's account of Cambodia; the *Ramayana* reliefs | Angkor Wat, the moat, stilt houses, rice fields, the market |
| Bagan (c. 1200) | L0 | Over two thousand temples on one plain; Theravada Buddhism | The Bagan inscriptions | The Ananda, Thatbyinnyu and Sulamani temples, the Irrawaddy |
| Ayutthaya (c. 1650) | L0 | Siam's capital, trading with France and the Dutch under King Narai | The *Ramakien*; La Loubère's account of Siam | Wat Phra Si Sanphet's three chedis, the palace, canals, the Dutch and Japanese quarters, a floating market |
| A Balinese temple village (moment to be fixed) | L0 | Hinduism in a form found only on this island | Gamelan; Balinese dance; subak irrigation | Split gates, meru towers, rice terraces, walled house compounds |

**Central Asia and the steppe (2)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Timurid Samarkand (c. 1420) | L0 | The grandest city of the Silk Road, under Ulugh Beg | Ulugh Beg's observatory and star tables; Clavijo's account of 1404 | The Registan and Ulugh Beg's madrasa, the Bibi-Khanym mosque, Gur-e Amir, blue domes, the bazaar |
| Mongol Karakorum (1254) | L0 | The capital of the Mongol Empire | William of Rubruck's account; *The Secret History of the Mongols* | The palace, the silver tree fountain, ger camps, temples of many faiths side by side |

**Western Asia (11)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Çatalhöyük (c. 6500 BC) | L0 | One of the first towns | Neolithic figurines | Mud-brick houses packed without streets, entered by ladders through the roof, bull horns on the walls, murals |
| Sumer — Ur (c. 2050 BC) | L2, L3 in part | The Third Dynasty of Ur, one of the first urban civilizations | *Gilgamesh*; the Code of Ur-Nammu | The Great Ziggurat, the mud-brick city, furnished houses, a market |
| Babylon (c. 570 BC) | L2, L3 in part | Nebuchadnezzar II's capital | The Tower of Babel and the Exile; the Hanging Gardens legend | The Ishtar Gate, the Processional Way, Etemenanki, the Euphrates quay |
| Achaemenid Persia — Persepolis (c. 480 BC) | L2, L3 in part | The ceremonial capital of the first world empire | Cyrus and Darius; Zoroastrianism; Herodotus | The Apadana, the Hall of a Hundred Columns, bull capitals, the Treasury and its archive, the tribute reliefs |
| Nabataea — Petra (c. AD 50) | L2, L3 in part | A rock-cut city on the incense road | Strabo's account | The Khazneh, the Siq, the colonnaded street, the garden and pool, a banqueting hall, caravans |
| Umayyad Jerusalem (c. 700) | L2 | A city holy to three faiths; the Dome of the Rock just completed | The Abrahamic traditions of the holy place | The Dome of the Rock, the esplanade, the stone old city |
| Justinian's Constantinople (c. 562) | L1–L2 | Byzantium at its height; Hagia Sophia's dome rebuilt | Justinian's Code; Procopius | Hagia Sophia, the city quarter |
| Abbasid Baghdad (c. 800) | L0 | Harun al-Rashid's Round City, the centre of the Islamic golden age | *The Thousand and One Nights*; the translation movement and the House of Wisdom; al-Khwarizmi's algebra | The Round City and its four gates, the Green Dome palace, the Tigris quays, markets, baths; nothing stands, so Samarra's spiral minaret is the built evidence |
| Ottoman Istanbul (c. 1560) | L1–L2, L3 in the prayer hall | Süleyman the Magnificent and the architect Sinan | Sufi poetry; Ottoman court culture | The Süleymaniye, timber houses, the bazaar, the Golden Horn |
| Safavid Isfahan (c. 1630) | L2, L3 in part | Shah Abbas I's capital, "half the world" | Persian miniatures; Mulla Sadra and the school of Isfahan | Naqsh-e Jahan Square, the Shah Mosque, the Sheikh Lotfollah Mosque, Ali Qapu, the Grand Bazaar |
| Shibam, Hadhramaut (16th c. on) | L0 | A city of mud-brick towers, like no other | The merchants and emigrants of the Hadhramaut | About 500 tower houses of five to eleven storeys, the wall, the dry valley |

**Egypt and Africa (14)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Old Kingdom Egypt — Giza (c. 2560 BC) | L2 | The Great Pyramid, the emblem of ancient Egypt | Kingship and the afterlife; Herodotus | Three pyramids, the Sphinx, the valley temple, mastaba streets, the workers' town, the Nile harbour |
| New Kingdom Thebes (c. 1250 BC) | L0 | Under Ramesses II, the summit of the Egyptian temple | The *Book of the Dead*; the Kadesh poem; love songs and strike records on the ostraca of Deir el-Medina | The Karnak hypostyle, Luxor temple, Hatshepsut's temple, the Valley of the Kings, Deir el-Medina, the Opet procession |
| Abu Simbel (c. 1250 BC) | L0 | Ramesses II's temple cut into the cliff | The sun reaching the sanctuary twice a year | Four colossi, halls deep in the rock, Nefertari's temple, the Nile |
| Alexandria (c. 250 BC) | L0 | The learned capital of the ancient world | Euclid's *Elements*; Eratosthenes measuring the Earth; the Septuagint | The Pharos, the Library and Museum, two harbours, the Serapeum, the Canopic Way |
| Ptolemaic Egypt — Edfu (1st c. BC) | L2 | The best-preserved Egyptian temple | The myth of Horus; the temple's inscriptions | The Temple of Horus with its pylon and hypostyles, mud-brick tower houses, the Nile |
| Mamluk Cairo (c. 1363) | L1–L2 | The largest city of the medieval Islamic world | Ibn Khaldun, later a judge here; the Cairo tales of the *Nights* | The Sultan Hasan mosque-madrasa, lanes, mashrabiya, the bazaar |
| Ethiopia — Lalibela (c. 1220) | L2 | Eleven churches cut whole from the rock | "A new Jerusalem"; Ethiopian Orthodoxy | Rock-hewn churches, trenches and courts with pools, a round-house village |
| The Sahel — Djenné (14th c.) | L2, L3 in part | The largest mud building in the world | The Mali Empire; the learning of Timbuktu | The Great Mosque, the market, two-storey banco houses, the yearly replastering |
| Fez (c. 1350) | L0 | The Marinid capital, seat of al-Qarawiyyin | Ibn Khaldun served here; Ibn Battuta dictated his travels here | The Bou Inania madrasa, the tanneries, labyrinth lanes, water channels, courtyard houses |
| Dogon villages of the Bandiagara cliff (moment to be fixed) | L0 | Villages under a cliff in Mali, a form like no other | Dogon mask dances; Dogon cosmology (Griaule's account is disputed) | Mud houses and pointed granaries, the toguna shelter, the Tellem caves in the cliff |
| The Swahili coast — Kilwa (15th c.) | L2–L3 | A coral-stone city of the Indian Ocean trade | Ibn Battuta's visit; the Kilwa Chronicle | The Great Mosque, Husuni Kubwa, coral houses, dhows |
| Zimbabwe — Great Zimbabwe (c. 1350) | L1–L2 | The largest ancient stone building south of the Sahara | Shona kingship | The Great Enclosure and its conical tower, the Hill Complex, valley enclosures, daga houses, cattle |
| Benin City (c. 1600) | L0 | The Edo kingdom, its walls and moats of astonishing extent | The Benin bronzes; Dapper's description | The Oba's palace with its bronze-plaqued pillars, broad avenues, walls, the bronze-casters' guild |
| Zulu — uMgungundlovu (1830s) | L0 | Dingane's royal kraal | The Zulu kingdom and its cattle | The great oval cattle enclosure, beehive huts, the royal house, the parade ground |

**Europe (22)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Neolithic Britain — Stonehenge (c. 2500 BC) | L2, L3 in part | The most famous prehistoric circle | Its alignment on the solstice sunrise and sunset | The sarsen circle, trilithons, Durrington-type houses |
| Minoan Crete — Knossos (c. 1600 BC) | L1–L2 | Europe's first palace civilization | The Minotaur and the labyrinth; Linear A | The palace, frescoes, the palace town |
| Mycenae (c. 1250 BC) | L0 | Agamemnon's city in Homer | The *Iliad*; Aeschylus's *Oresteia* | The Lion Gate, Grave Circle A, the Treasury of Atreus, Cyclopean walls, the palace |
| Delphi (c. 400 BC) | L0 | The centre of the Greek world and its oracle | "Know thyself"; the oracle that named Socrates wisest; Pindar | The Temple of Apollo, the cities' treasuries, the theatre, the stadium, the Sacred Way, the Castalian spring |
| Classical Athens (c. 410 BC) | L2 | The city of democracy and philosophy | Socrates, Sophocles, Thucydides | The Parthenon, the Acropolis, the Agora, houses. To add as part of this settlement (c. 300 BC): the schools — the Academy, the Lyceum, the Painted Stoa, Epicurus' Garden |
| Herculaneum (AD 79) | L0 | The Villa of the Papyri, the only library surviving from antiquity | Philodemus' Epicurean scrolls; Vesuvius; Pliny the Younger's letters | The Villa's peristyle and long pool, the seaside baths, timber-framed houses with upper floors, shops |
| Hadrian's Rome (c. 128) | L1–L2 | The empire at its height | Hadrian; Epictetus the Stoic | The Pantheon, atrium houses, insulae, shops |
| Romanesque Conques (c. 1120) | L2, L3 in part | A pilgrimage church on the road to Santiago | The pilgrimage; the *Book of the Miracles of Sainte Foy* | Sainte-Foy and its Last Judgement tympanum, the hill village |
| Norse — Borgund (c. 1250) | L1–L2 | The most complete stave church | The Norse sagas; the conversion | Borgund stave church, a timber wharf of the Bryggen kind |
| Gothic Paris (1248) | L2, L3 in part | The Sainte-Chapelle consecrated | Aquinas at the University of Paris; scholasticism | The Sainte-Chapelle, Notre-Dame, the timber-framed lanes of the Île de la Cité, the Seine |
| Nasrid Granada (c. 1390) | L2–L3 | The last kingdom of al-Andalus | Ibn Zamrak's poems carved on the Alhambra's walls | The Alhambra, the Court of the Lions, white houses and patios |
| Renaissance Florence (c. 1480) | L1–L2 | The Medici city | Ficino's Platonic Academy; Botticelli; Dante | The cathedral dome, the campanile, the Baptistery, Tuscan streets |
| Venice (c. 1500) | L1–L2 | The maritime republic | Bellini, Titian; later *The Merchant of Venice* | St Mark's, canals, palaces, gondolas |
| Manueline Lisbon (c. 1520) | L0 | The starting point of the age of discovery | Camões' *Lusiads*; Vasco da Gama | The Jerónimos Monastery, the Belém Tower, the riverside palace, carracks at the quay |
| Muscovy (c. 1600) | L1–L2 | Early tsardom | Ivan the Terrible; Moscow as the "Third Rome" | St Basil's, the Kremlin, a log-house village |
| Baroque Rome (c. 1670) | L1–L2 | The papal city after the Counter-Reformation | Bernini, Borromini; after Galileo's trial | St Peter's Square, Baroque streets, fountains |
| Dutch Golden Age — Amsterdam (c. 1670) | L2–L3 on the Dam | The merchant republic | Spinoza; Rembrandt | The Town Hall on the Dam, the canal ring, gabled houses |
| French classicism — Versailles (c. 1690) | L1–L2 | The stage of absolute monarchy | Molière, Racine; the Sun King | The palace, the Hall of Mirrors, the formal gardens, the town |
| Victorian London (c. 1870) | L2, L3 in part | The capital of the industrial empire | Dickens; Darwin; Marx writing *Capital* | The Palace of Westminster, St Pancras, terraces |
| Vienna (c. 1900) | L0 | The fin-de-siècle capital of modern thought | Freud, Mahler, Klimt, Wittgenstein | The Secession building, the Ringstrasse, coffee houses, Otto Wagner's Stadtbahn stations |
| Art Nouveau Barcelona (c. 1910) | L2 | Catalan modernisme | Gaudí | The Sagrada Família, the Eixample blocks |
| Bauhaus Dessau (1926) | L0 | The source of modern design | Gropius; the Bauhaus teaching | The glass-walled school building, the masters' houses, the workshops |

**The Americas (10)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Teotihuacan (c. 400) | L2 | The largest city of the ancient Americas | The feathered serpent; to the Aztecs, the place where the gods were born | The Pyramid of the Sun, the Avenue of the Dead, apartment compounds |
| Classic Maya — Tikal (c. 750) | L0 | A great city of the Classic Maya | Hieroglyphic stelae; the Long Count | Temples I and II, the North Acropolis, the ball court, causeways through the rainforest, reservoirs |
| The Maya — Chichén Itzá (c. 1000) | L1–L2 | The Postclassic Maya | The Maya calendar; the serpent of light at the equinox | El Castillo, the Great Ball Court, the Sacred Cenote, the Temple of the Warriors, a village |
| Mississippian Cahokia (c. 1175) | L1–L2 | The largest city north of Mexico before Columbus | Mississippian culture | Monks Mound, the Grand Plaza, the palisade, houses |
| The Inca — Machu Picchu (c. 1450–1530) | L1–L2 | Pachacuti's mountain estate | Inca sun worship; khipu | Ashlar buildings, terraces, the Temple of the Sun |
| The Pueblo — Taos (c. 1500) | L1–L2 | A many-storeyed adobe town, lived in to this day | Pueblo religious tradition | Stacked adobe houses, kivas, the creek |
| The Aztecs — Tenochtitlan (1519) | L1–L2 | The lake capital in the year Cortés came | Bernal Díaz's eyewitness account; Nezahualcoyotl's poems | The Templo Mayor's twin shrines, the Sacred Precinct, canals, chinampas |
| Haida village — SG̱ang Gwaay (c. 1850) | L0 | The carved-pole culture of the Northwest Coast | Haida oral histories | A row of carved poles and cedar houses facing the beach, canoes |
| Modern New York (1931) | L1–L2 | The Empire State Building completed; the Art Deco skyscraper | The age of *The Great Gatsby*; jazz | The Empire State Building, Manhattan blocks |
| Brasília (1960) | L0 | A capital planned whole by modernism | Niemeyer and Costa | The Congress towers and bowls, the cathedral, the superblocks |

**Oceania (6)**

| Settlement · moment | L | Why it is here | Works and ideas | What it holds |
|---|---|---|---|---|
| Budj Bim — Gunditjmara country | L0 | Eel aquaculture over 6,600 years old, among the oldest in the world | Gunditjmara knowledge of land and water | Stone channels and eel traps on the lava flow, stone house bases, woven eel baskets, smoking trees |
| Kakadu — the rock shelters of Ubirr | L0 | A tradition of rock painting tens of thousands of years long | X-ray style painting; only what is shared publicly of the Dreaming | Painted rock faces, wetlands, the dry and the wet season |
| Nan Madol, Pohnpei (c. 1300) | L0 | An island city of stacked basalt columns, seat of the Saudeleur dynasty | Pohnpeian traditions of the Saudeleur | Nearly a hundred artificial islets, walls of crossed basalt columns, canals, royal tombs |
| Rapa Nui (c. 1500) | L2 | The island of the moai | Ancestor veneration; the later Birdman rite | Ahu Tongariki and its fifteen moai, the Rano Raraku quarry, stone houses |
| Māori — a pā by Lake Rotorua (18th c.) | L2 | A Māori fortified village | Oral tradition and whakapapa | The meeting house, terraces and ditch, the palisade, storehouses |
| Modern Sydney (1973) | L1–L2 | The Opera House completed | Utzon's design | The Opera House, the harbour, the Harbour Bridge |

## 8. Performance and budgets

Targets on the author's machine (Apple M2, 8 GB, native resolution, "high"). They are met by engineering (§3); detail is thinned only as the last resort and recorded.

- **Frame:** aim 60 fps in a settlement; ≥ 40 in the densest interior; ≥ 30 in high flight; no frame over 50 ms ever. Visible triangles ≤ 3 M; draw calls ≤ 800; GPU memory ≤ 1.5 GB; three shadow cascades.
- **Start:** first frame ≤ 6 s on a warm cache, ≤ 15 MB transferred; only the start settlement and the planet's base are loaded.
- **Streaming:** settlements load within 700 m of their rim and unload beyond 1300 m (`src/engine/world.js`); a settlement's geometry ≤ 45 MB on the GPU and ≤ 1500 meshes (`tools/geo-budget.mjs`), its data loaded on demand ≤ 25 MB, not counting the shared material library, which is fetched once and cached; loading is time-sliced and never costs a frame more than 4 ms. Far settlements are **impostors** (`tools/impostors.mjs` → `data/impostors/`) so the skyline is there from across the sea.
- **Terrain:** chunked quadtree LOD on the sphere, built in workers; ≤ 400 k triangles on screen in flight.
- **Vegetation and objects:** instanced, LOD, culled on the GPU; ≤ 600 k instances on screen.
- **Files:** any committed file ≤ 50 MB, no LFS; repository ≤ 500 MB; baked data under `data/`, loaded on demand.
- **Phone:** the same world at "medium" (half shadow resolution, no GTAO, shorter streaming radius, fewer small objects), ≥ 30 fps.

`tools/budget.mjs` measures the load. Frame times cannot be measured headless (Chromium's WebGPU there is software), so the frame is measured in two ways: `tools/geo-budget.mjs` builds every settlement in Node and counts what memory and upload depend on — vertex data on the GPU, instances, meshes, build time — and `npm test` fails when a settlement exceeds its limits; `?bench` runs a fixed route on the author's machine (Edfu turning, Florence walking, high flight) and reports fps, the worst 5% of frames, JavaScript time, draw calls, triangles, memory and hitches (`src/engine/bench.js`). `?perf` shows a panel with switches that turn one part of the picture off at a time.

## 9. Technical architecture

- **Pure JavaScript, static.** ES modules from GitHub Pages, no build step; three.js WebGPU (its WebGL 2 backend when WebGPU is missing), vendored in `src/vendor/`; Node only for tests, checks and offline baking.
- **Plan is data, look is code.** A settlement is a module under `src/settlements/<id>/`: `index.js`, `layout.js` (where things stand), `plan.js` (the landmark), `town.js` (the townscape), `ground.js` (ground and planting), `music.js`, and where it has them `life.js` or `people.js`. The plans of the first ten landmarks are still in `src/buildings/` (their dossiers in `docs/buildings/`) and are reused by their settlements. Civilization vocabularies are in `src/styles/<civilization>/`, used by landmark and houses alike; shared objects of use, figures and street life in `src/objects/`. The planet is `src/planet/`; the renderer, world streaming, light, sound and flora are `src/engine/`.
- **Renderer:** procedural PBR materials in TSL; cascaded sun shadows with a cache of static casters; GTAO; baked irradiance volumes for interiors (`tools/bake.mjs` → `data/gi/`); atmosphere; bloom; AgX tone mapping; eye adaptation; dynamic resolution and automatic quality. Shaders are shared through uniforms and instanced attributes and compiled before a part shows.
- **Materials and assets:** CC0/MIT only, listed in `ASSETS.md`; no copyrighted models. No photographic textures or scans are used yet; CC0 sets (Poly Haven, ambientCG) may be layered in where they raise the picture.
- **Compute once what does not change** (the frame is bound by per-pixel shading, measured; decided 2026-11-09, being done on Ming Suzhou first):
  - *Materials:* the costly noise of a material — grain, weathering, moss, stains — is baked offline into tileable texture sets (colour, normal, roughness; KTX2, compressed on the GPU) and read at run time; what follows each wall's dossier — coursing, block sizes, joints — stays procedural and cheap, and wall-by-wall variation (height, facing, climate) stays as parameters mixed over the textures. One shared library for the whole site, each settlement using a dozen or so; low resolution first, full resolution when near.
  - *Distance:* far surfaces use a cheaper version of their material.
  - *Ground:* each terrain tile gets a small map of its cover (grass, sand, rock), made in the worker that builds the tile, instead of working the cover out per pixel.
  - *Weathering and dirt:* worked out when the geometry is built and stored in its vertices.
  - *Built geometry:* kept in the browser's storage after the first build, so a settlement is not rebuilt from code on every visit.
  - *Sky and air:* the scattering precomputed into lookup tables, updated when the sun moves.
  - *Ambient occlusion:* at half resolution, or reusing the last frame's.
  - *Music:* rendered offline to compressed audio if measuring shows the live synthesis costs a noticeable part of the CPU.
- **Music:** synthesised in the browser per settlement and zone; small CC0 samples where synthesis cannot reach the timbre.
- **Tools** (`tools/`): `surface-check`, `plan-check`, `walk-check`, `geo-one` and `geo-budget`, `budget`, `load-check`, `audio-check`, `showroom` and `shot` (pictures), `bake`, `impostors`, `planet-layout`. Who runs which, and when, is in `docs/parallel-work.md`.

## 10. Status and next

Replace these lines, never append to them; keep them few.

- v10.20 (2026-11-07): 57 settlements stand on the planet, 44 interiors under baked light. Every civilization first listed is built.
- **The gap is depth.** By their own dossiers 27 of the 57 are still at L1–L2, 14 at L2, 6 at L2–L3, and 10 reach L3 only in parts; none meets §5 throughout.
- **Next: Ming Suzhou as the showcase** (the author, 2026-11-09): brought to L3 throughout and kept there as the example for every other settlement and as the testbed for the speed work (measured on the M2 first). Then the other built settlements to L3; new ones from the L0 settlements of §7 when the author says to start them.
- **Decided, not yet done:** the settlement cards on the globe map (§4.1), for the 57 built. The planet is enlarged so that 100 settlements stand without crowding (`PLANET_RADIUS` in `src/planet/sites.js`, 8 km now; the layout tool finds the size, about 12 km). Settlements of one place at different times (Qin, Han and Tang at Xi'an; the two Romes) stand side by side; a true position within a few hundred metres is not required.
- Open: frame times and jumps are still to be measured on the author's M2.

## 11. Rules

- **This document stays short.** It holds the design as it stands and nothing else: no dated entries, no per-version or per-settlement notes, no account of work done. When a decision changes the design, edit the section it belongs to; its date and reason go in one line in `docs/decisions.md`, and only if it constrains future work. What a version changed goes in `CHANGELOG.md` (one or two plain sentences), a settlement's facts in its dossier. `CHANGELOG.md`, `docs/decisions.md`, `docs/status-log.md` and `docs/history.md` are records: nobody reads them in full for a task; grep them for one thing.
- Dossier first (§6). Every element traces to its dossier.
- Metres; true scale for buildings and townscapes; the planet and open country are compressed.
- No study features, markers, labels in the world. UI: corner map, clock-and-speed card, globe map with its settlement cards, language button — nothing else without a recorded decision.
- Budgets (§8) are targets; a change that breaks one is fixed by engineering before merge, and only as a last resort by thinning detail, recorded as a decision.
- Picture quality on the author's machine never goes down silently; a change that lowers it is recorded as a decision.
- Checks: per settlement touched, the surface, geometry and plan checks; pictures of what changed; the heavy checks after merging (`docs/parallel-work.md`).
- Repository text in English; the site UI bilingual, English default. Commits authored as the repository owner, with no AI co-author or session trailers (`CLAUDE.md`).
- Every push to the default branch deploys to GitHub Pages; a red CI is fixed at once. Never push a regression in the picture, a broken walk, or a budget breach. Tag a release (`vMAJOR.MINOR`, with a note and screenshots) for a visible jump in quality or a new settlement.
