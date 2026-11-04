// The civilizations of the planet (DESIGN.md §7): every settlement, built or still to come, with
// its true place on Earth. Where each one stands on the planet (`placed`) is worked out by
// tools/planet-layout.mjs from these and written to src/planet/layout.js; the reasoning is in
// docs/world.md.
//
// id         settlement id (also its dossier: docs/settlements/<id>.md)
// name       { en, zh }
// era        short label of the time shown
// region     the group of civilizations it belongs to (DESIGN §4.2)
// lat, lon   true position on Earth (degrees; landmark)
// radius     the settlement's flat disc on the planet (m); its ground blends into the open country
//            over BLEND metres beyond it
// nudge      bearing (degrees) in which a settlement sharing its true place with another is moved
//            off it by the layout
// water      stands in or by the water (an island, a lagoon): the layout does not move it onto land
// island     an island too small for the land map: the settlement's ground makes the land itself
// legacy     for the ten landmarks built under the previous design: the district of the old
//            compact city they still use as their local space (src/world/regions.js) — its
//            region id, the centre of the disc in the old city's coordinates, and the buildings

export const SITES = [
  // ── China ──
  { id: 'tang-wutai', name: { en: 'Tang China', zh: '唐' }, era: '9th c.', region: 'china', lat: 38.95, lon: 113.38, radius: 360 },
  { id: 'song-kaifeng', name: { en: 'Northern Song Kaifeng', zh: '北宋汴京' }, era: '12th c.', region: 'china', lat: 34.80, lon: 114.31, radius: 400 },
  { id: 'song-hangzhou', name: { en: 'Southern Song Lin\'an', zh: '南宋临安' }, era: '13th c.', region: 'china', lat: 30.20, lon: 120.13, radius: 400 },
  { id: 'ming-suzhou', name: { en: 'Ming Suzhou', zh: '明代苏州' }, era: '16th c.', region: 'china', lat: 31.32, lon: 120.63, radius: 215 },
  { id: 'qing-beijing', name: { en: 'Ming–Qing Beijing', zh: '明清北京' }, era: '17th c.', region: 'china', lat: 39.92, lon: 116.39, radius: 380 },
  { id: 'lhasa', name: { en: 'Tibet', zh: '西藏' }, era: '17th c.', region: 'tibet', lat: 29.3, lon: 91.0, radius: 420 },
  // ── Japan and Korea ──
  { id: 'nara', name: { en: 'Nara Japan', zh: '奈良' }, era: '8th c.', region: 'japan', lat: 34.69, lon: 135.84, water: true, island: true, radius: 340 },
  { id: 'heian-uji', name: { en: 'Heian Japan', zh: '平安日本' }, era: '11th c.', region: 'japan', lat: 34.89, lon: 135.81, radius: 360 },
  { id: 'edo-himeji', name: { en: 'Edo Japan', zh: '江户日本' }, era: '17th c.', region: 'japan', lat: 34.8, lon: 133.6, radius: 400 },
  { id: 'joseon-seoul', name: { en: 'Joseon Korea', zh: '朝鲜王朝' }, era: '15th c.', region: 'korea', lat: 37.58, lon: 126.98, radius: 400 },
  // ── India and South-East Asia ──
  { id: 'sanchi', name: { en: 'Early Buddhist India', zh: '早期佛教印度' }, era: '1st c.', region: 'india', lat: 23.48, lon: 77.74, radius: 300 },
  { id: 'khajuraho', name: { en: 'Medieval Hindu India', zh: '中世纪印度教' }, era: '11th c.', region: 'india', lat: 24.85, lon: 79.92, radius: 360 },
  { id: 'madurai', name: { en: 'Dravidian South India', zh: '南印度达罗毗荼' }, era: '17th c.', region: 'india', lat: 9.92, lon: 78.12, radius: 400 },
  { id: 'mughal-agra', name: { en: 'Mughal India', zh: '莫卧儿' }, era: '17th c.', region: 'india', lat: 25.9, lon: 78.6, radius: 360 },
  { id: 'angkor', name: { en: 'Khmer Empire', zh: '高棉' }, era: '12th c.', region: 'indochina', lat: 13.41, lon: 103.87, radius: 400 },
  { id: 'borobudur', name: { en: 'Java', zh: '爪哇' }, era: '9th c.', region: 'java', lat: -7.61, lon: 110.20, radius: 380 },
  // ── Mesopotamia and Persia ──
  { id: 'ur', name: { en: 'Sumer', zh: '苏美尔' }, era: '21st c. BC', region: 'mesopotamia', lat: 30.96, lon: 46.10, radius: 380 },
  { id: 'babylon', name: { en: 'Babylon', zh: '巴比伦' }, era: '6th c. BC', region: 'mesopotamia', lat: 32.54, lon: 44.42, radius: 420 },
  { id: 'persepolis', name: { en: 'Achaemenid Persia', zh: '阿契美尼德波斯' }, era: '5th c. BC', region: 'persia', lat: 29.93, lon: 52.89, radius: 360 },
  { id: 'isfahan', name: { en: 'Safavid Persia', zh: '萨法维波斯' }, era: '17th c.', region: 'persia', lat: 32.66, lon: 51.68, radius: 420 },
  // ── the Levant and Anatolia ──
  { id: 'petra', name: { en: 'Nabataea', zh: '纳巴泰' }, era: '1st c.', region: 'levant', lat: 30.33, lon: 35.44, radius: 330 },
  { id: 'jerusalem', name: { en: 'Umayyad Jerusalem', zh: '倭马亚耶路撒冷' }, era: '7th c.', region: 'levant', lat: 31.78, lon: 35.24, radius: 420 },
  { id: 'constantinople', name: { en: 'Justinian\'s Constantinople', zh: '查士丁尼的君士坦丁堡' }, era: '6th c.', region: 'bosphorus', lat: 41.01, lon: 28.98, radius: 420 },
  { id: 'ottoman-istanbul', name: { en: 'Ottoman Istanbul', zh: '奥斯曼伊斯坦布尔' }, era: '16th c.', region: 'bosphorus', lat: 41.02, lon: 28.96, nudge: 300, radius: 400 },
  // ── Egypt and Africa ──
  { id: 'giza', name: { en: 'Old Kingdom Egypt', zh: '古王国埃及' }, era: '26th c. BC', region: 'egypt', lat: 29.98, lon: 31.13, radius: 420 },
  { id: 'edfu', name: { en: 'Ptolemaic Egypt', zh: '托勒密埃及' }, era: '1st c. BC', region: 'egypt', lat: 24.98, lon: 32.87, radius: 380 },
  { id: 'mamluk-cairo', name: { en: 'Mamluk Cairo', zh: '马穆鲁克开罗' }, era: '14th c.', region: 'egypt', lat: 30.03, lon: 31.26, radius: 400 },
  { id: 'djenne', name: { en: 'The Sahel', zh: '萨赫勒' }, era: '14th c.', region: 'sahel', lat: 13.90, lon: -4.56, radius: 360 },
  { id: 'lalibela', name: { en: 'Ethiopia', zh: '埃塞俄比亚' }, era: '13th c.', region: 'ethiopia', lat: 12.03, lon: 39.04, radius: 380 },
  { id: 'kilwa', name: { en: 'The Swahili Coast', zh: '斯瓦希里海岸' }, era: '15th c.', region: 'swahili', lat: -8.96, lon: 39.51, water: true, island: true, radius: 340 },
  { id: 'great-zimbabwe', name: { en: 'Zimbabwe', zh: '大津巴布韦' }, era: '14th c.', region: 'zimbabwe', lat: -20.27, lon: 30.93, radius: 380 },
  // ── Greece and Rome ──
  { id: 'knossos', name: { en: 'Minoan Crete', zh: '米诺斯克里特' }, era: '16th c. BC', region: 'aegean', lat: 35.30, lon: 25.16, radius: 350 },
  { id: 'athens', name: { en: 'Classical Athens', zh: '古典雅典' }, era: '5th c. BC', region: 'aegean', lat: 37.97, lon: 23.73, radius: 420 },
  { id: 'rome', name: { en: 'Imperial Rome', zh: '罗马帝国' }, era: '2nd c.', region: 'latium', lat: 41.90, lon: 12.48, radius: 420 },
  { id: 'baroque-rome', name: { en: 'Baroque Rome', zh: '巴洛克罗马' }, era: '17th c.', region: 'latium', lat: 41.90, lon: 12.46, nudge: 60, radius: 380 },
  // ── western Europe ──
  { id: 'stonehenge', name: { en: 'Neolithic Britain', zh: '新石器时代不列颠' }, era: '25th c. BC', region: 'britain', lat: 51.18, lon: -1.83, radius: 360 },
  { id: 'conques', name: { en: 'Romanesque Rouergue', zh: '罗曼式鲁埃格' }, era: '12th c.', region: 'france', lat: 44.60, lon: 2.40, radius: 360 },
  { id: 'paris', name: { en: 'Gothic Paris', zh: '哥特式巴黎' }, era: '13th c.', region: 'france', lat: 48.85, lon: 2.35, radius: 420 },
  { id: 'granada', name: { en: 'Al-Andalus', zh: '安达卢斯' }, era: '14th c.', region: 'iberia', lat: 37.18, lon: -3.59, radius: 400 },
  { id: 'florence', name: { en: 'Renaissance Florence', zh: '文艺复兴佛罗伦萨' }, era: '15th c.', region: 'italy', lat: 43.77, lon: 11.26, radius: 400 },
  { id: 'venice', name: { en: 'Venice', zh: '威尼斯' }, era: '16th c.', region: 'italy', lat: 45.43, lon: 12.34, water: true, island: true, radius: 380 },
  { id: 'amsterdam', name: { en: 'Dutch Golden Age', zh: '荷兰黄金时代' }, era: '17th c.', region: 'lowlands', lat: 52.37, lon: 4.89, radius: 400 },
  { id: 'versailles', name: { en: 'French Classicism', zh: '法国古典主义' }, era: '17th c.', region: 'france', lat: 48.80, lon: 2.12, radius: 420 },
  { id: 'london', name: { en: 'Victorian London', zh: '维多利亚伦敦' }, era: '19th c.', region: 'britain', lat: 51.50, lon: -0.12, radius: 420 },
  { id: 'barcelona', name: { en: 'Art Nouveau Barcelona', zh: '新艺术巴塞罗那' }, era: '20th c.', region: 'iberia', lat: 41.40, lon: 2.17, radius: 420 },
  // ── northern and eastern Europe ──
  { id: 'norse-borgund', name: { en: 'Norse Norway', zh: '北欧挪威' }, era: '12th c.', region: 'scandinavia', lat: 61.05, lon: 7.81, radius: 360 },
  { id: 'muscovy', name: { en: 'Muscovy', zh: '莫斯科公国' }, era: '16th c.', region: 'russia', lat: 55.75, lon: 37.62, radius: 420 },
  // ── the Americas ──
  { id: 'teotihuacan', name: { en: 'Teotihuacan', zh: '特奥蒂瓦坎' }, era: '4th c.', region: 'mexico', lat: 19.69, lon: -98.84, radius: 440 },
  { id: 'chichen-itza', name: { en: 'The Maya', zh: '玛雅' }, era: '10th c.', region: 'yucatan', lat: 20.68, lon: -88.57, radius: 340 },
  { id: 'tenochtitlan', name: { en: 'The Aztecs', zh: '阿兹特克' }, era: '15th c.', region: 'mexico', lat: 19.43, lon: -99.13, radius: 400 },
  { id: 'machu-picchu', name: { en: 'The Inca', zh: '印加' }, era: '15th c.', region: 'andes', lat: -13.16, lon: -72.55, radius: 330 },
  { id: 'cahokia', name: { en: 'Mississippian Cahokia', zh: '密西西比卡霍基亚' }, era: '12th c.', region: 'mississippi', lat: 38.66, lon: -90.06, radius: 420 },
  { id: 'taos', name: { en: 'The Pueblo', zh: '普韦布洛' }, era: '15th c.', region: 'southwest', lat: 36.44, lon: -105.55, radius: 320 },
  { id: 'new-york', name: { en: 'Modern New York', zh: '现代纽约' }, era: '20th c.', region: 'northeast', lat: 40.75, lon: -73.99, radius: 460 },
  // ── Oceania ──
  { id: 'rapa-nui', name: { en: 'Rapa Nui', zh: '拉帕努伊' }, era: '15th c.', region: 'polynesia', lat: -27.13, lon: -109.28, water: true, island: true, radius: 320 },
  { id: 'maori', name: { en: 'Māori Aotearoa', zh: '毛利' }, era: '18th c.', region: 'aotearoa', lat: -38.14, lon: 176.25, radius: 330 },
  { id: 'sydney', name: { en: 'Modern Sydney', zh: '现代悉尼' }, era: '20th c.', region: 'australia', lat: -33.86, lon: 151.21 },
];

for (const s of SITES) s.radius ??= 190;

/** Metres over which a settlement's ground blends into the open country beyond its disc. */
export const BLEND = 100;
/** Open country left between two settlements' blended edges, at the least (m). */
export const GAP = 120;
/** The least distance between the centres of two settlements (m). */
export const spacing = (a, b) => a.radius + b.radius + 2 * BLEND + GAP;
/** The planet's radius (m). */
export const PLANET_RADIUS = 8000;

export const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]));
