// The built settlements of the planet (the whole set of 100, with levels, is DESIGN.md §7), each with
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
  { id: 'tang-wutai', name: { en: 'Tang China', zh: '唐' }, era: '9th c.', region: 'china', lat: 38.95, lon: 113.38, radius: 250 },
  { id: 'song-kaifeng', name: { en: 'Northern Song Kaifeng', zh: '北宋汴京' }, era: '12th c.', region: 'china', lat: 34.80, lon: 114.31, radius: 520 },
  { id: 'song-hangzhou', name: { en: 'Southern Song Lin\'an', zh: '南宋临安' }, era: '13th c.', region: 'china', lat: 30.20, lon: 120.13, radius: 520 },
  { id: 'ming-suzhou', name: { en: 'Ming Suzhou', zh: '明代苏州' }, era: '16th c.', region: 'china', lat: 31.32, lon: 120.63, radius: 215 },
  { id: 'qing-beijing', name: { en: 'Ming–Qing Beijing', zh: '明清北京' }, era: '17th c.', region: 'china', lat: 39.92, lon: 116.39, radius: 520 },
  { id: 'lhasa', name: { en: 'Tibet', zh: '西藏' }, era: '17th c.', region: 'tibet', lat: 29.3, lon: 91.0, radius: 420 },
  // ── Japan and Korea ──
  { id: 'nara', name: { en: 'Nara Japan', zh: '奈良' }, era: '8th c.', region: 'japan', lat: 34.69, lon: 135.84, water: true, island: true, radius: 340 },
  { id: 'heian-uji', name: { en: 'Heian Japan', zh: '平安日本' }, era: '11th c.', region: 'japan', lat: 34.89, lon: 135.81, radius: 360 },
  { id: 'edo-himeji', name: { en: 'Edo Japan', zh: '江户日本' }, era: '17th c.', region: 'japan', lat: 34.8, lon: 133.6, radius: 400 },
  { id: 'joseon-seoul', name: { en: 'Joseon Korea', zh: '朝鲜王朝' }, era: '19th c.', region: 'korea', lat: 37.58, lon: 126.98, radius: 400 },
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
  { id: 'sydney', name: { en: 'Modern Sydney', zh: '现代悉尼' }, era: '20th c.', region: 'australia', lat: -33.86, lon: 151.21, radius: 460 },
];

for (const s of SITES) s.radius ??= 190;

// ── size classes of the built settlements (DESIGN §4.5) ──
// The disc each will have once rebuilt to the Suzhou standard (docs/batches.md); the layout keeps
// room for the larger of this and today's `radius`, so growing to its class moves no neighbour.
const CLASS_RADIUS = { L: 520, M: 330, S: 190, P: 90 };
const CLASS = {
  L: 'song-kaifeng song-hangzhou qing-beijing constantinople ottoman-istanbul mamluk-cairo rome paris venice london versailles babylon tenochtitlan new-york angkor teotihuacan',
  M: 'ming-suzhou florence isfahan granada lhasa joseon-seoul baroque-rome athens madurai amsterdam jerusalem mughal-agra muscovy barcelona djenne nara edo-himeji chichen-itza ur petra persepolis giza cahokia sydney',
  S: 'heian-uji khajuraho borobudur tang-wutai sanchi knossos conques norse-borgund lalibela kilwa machu-picchu taos great-zimbabwe rapa-nui maori',
  P: 'stonehenge',
};
for (const [c, ids] of Object.entries(CLASS)) for (const id of ids.split(' ')) { const s = SITES.find((x) => x.id === id); if (s) s.size = id === 'ming-suzhou' ? 215 : CLASS_RADIUS[c]; }
/** The room a settlement takes on the planet: its class's disc, or today's if larger. */
export const room = (s) => Math.max(s.radius, s.size ?? s.radius);

/** Metres over which a settlement's ground blends into the open country beyond its disc. */
export const BLEND = 100;
/**
 * The settlements of the set not built yet (DESIGN §7, level L0), with their true places and the disc
 * their size class gives them (§4.5). Not on the planet until built (then moved into SITES); the
 * layout keeps room for them, so that building one does not move the others.
 */
export const PLANNED = [
  { id: 'shang-yinxu', name: { en: 'Shang Yinxu', zh: '商殷墟' }, region: 'china', lat: 36.13, lon: 114.32, radius: 300 },
  { id: 'lu-qufu', name: { en: 'Qufu', zh: '曲阜' }, region: 'china', lat: 35.60, lon: 116.99, radius: 280 },
  { id: 'qin-xianyang', name: { en: 'Qin Xianyang', zh: '秦咸阳' }, region: 'china', lat: 34.38, lon: 109.25, nudge: 90, radius: 300 },
  { id: 'han-changan', name: { en: 'Han Chang\'an', zh: '汉长安' }, region: 'china', lat: 34.30, lon: 108.88, nudge: 300, radius: 500 },
  { id: 'wei-ye', name: { en: 'Three Kingdoms Ye', zh: '三国邺城' }, region: 'china', lat: 36.33, lon: 114.38, nudge: 0, radius: 300 },
  { id: 'tang-changan', name: { en: 'Tang Chang\'an', zh: '唐长安' }, region: 'china', lat: 34.22, lon: 108.96, nudge: 200, radius: 550 },
  { id: 'hakka-tulou', name: { en: 'Hakka tulou', zh: '客家土楼' }, region: 'china', lat: 24.67, lon: 117.05, radius: 180 },
  { id: 'dunhuang', name: { en: 'Dunhuang', zh: '敦煌' }, region: 'silk-road', lat: 40.04, lon: 94.81, radius: 220 },
  { id: 'shaolin', name: { en: 'Shaolin and Mount Song', zh: '少林与嵩山' }, region: 'china', lat: 34.51, lon: 112.94, radius: 200 },
  { id: 'muromachi-kyoto', name: { en: 'Muromachi Kyoto', zh: '室町京都' }, region: 'japan', lat: 35.03, lon: 135.80, radius: 320 },
  { id: 'mohenjo-daro', name: { en: 'Mohenjo-daro', zh: '摩亨佐-达罗' }, region: 'indus', lat: 27.33, lon: 68.14, radius: 300 },
  { id: 'ajanta', name: { en: 'Ajanta', zh: '阿旃陀' }, region: 'india', lat: 20.55, lon: 75.70, radius: 200 },
  { id: 'nalanda', name: { en: 'Nalanda', zh: '那烂陀' }, region: 'india', lat: 25.14, lon: 85.44, radius: 200 },
  { id: 'bhaktapur', name: { en: 'Bhaktapur', zh: '巴克塔普尔' }, region: 'nepal', lat: 27.67, lon: 85.43, radius: 200 },
  { id: 'bagan', name: { en: 'Bagan', zh: '蒲甘' }, region: 'burma', lat: 21.17, lon: 94.86, radius: 320 },
  { id: 'ayutthaya', name: { en: 'Ayutthaya', zh: '大城' }, region: 'siam', lat: 14.36, lon: 100.56, radius: 300 },
  { id: 'bali-village', name: { en: 'Balinese temple village', zh: '巴厘岛神庙村落' }, region: 'java', lat: 8.37, lon: 115.45, radius: 180 },
  { id: 'timurid-samarkand', name: { en: 'Timurid Samarkand', zh: '帖木儿撒马尔罕' }, region: 'silk-road', lat: 39.65, lon: 66.98, radius: 340 },
  { id: 'mongol-karakorum', name: { en: 'Mongol Karakorum', zh: '蒙古哈拉和林' }, region: 'steppe', lat: 47.20, lon: 102.83, radius: 180 },
  { id: 'catalhoyuk', name: { en: 'Çatalhöyük', zh: '加泰土丘' }, region: 'anatolia', lat: 37.67, lon: 32.83, radius: 100 },
  { id: 'abbasid-baghdad', name: { en: 'Abbasid Baghdad', zh: '阿拔斯巴格达' }, region: 'mesopotamia', lat: 33.31, lon: 44.36, radius: 500 },
  { id: 'shibam', name: { en: 'Shibam', zh: '希巴姆' }, region: 'arabia', lat: 15.93, lon: 48.63, radius: 180 },
  { id: 'thebes', name: { en: 'New Kingdom Thebes', zh: '新王国底比斯' }, region: 'egypt', lat: 25.70, lon: 32.64, radius: 380 },
  { id: 'abu-simbel', name: { en: 'Abu Simbel', zh: '阿布辛贝' }, region: 'nubia', lat: 22.34, lon: 31.63, radius: 180 },
  { id: 'alexandria', name: { en: 'Alexandria', zh: '亚历山大港' }, region: 'egypt', lat: 31.20, lon: 29.92, radius: 500 },
  { id: 'fez', name: { en: 'Fez', zh: '非斯' }, region: 'maghreb', lat: 34.06, lon: -4.97, radius: 320 },
  { id: 'dogon', name: { en: 'Dogon villages', zh: '多贡村落' }, region: 'sahel', lat: 14.35, lon: -3.61, radius: 110 },
  { id: 'benin-city', name: { en: 'Benin City', zh: '贝宁城' }, region: 'guinea', lat: 6.34, lon: 5.62, radius: 320 },
  { id: 'mycenae', name: { en: 'Mycenae', zh: '迈锡尼' }, region: 'aegean', lat: 37.73, lon: 22.76, radius: 160 },
  { id: 'delphi', name: { en: 'Delphi', zh: '德尔斐' }, region: 'aegean', lat: 38.48, lon: 22.50, radius: 200 },
  { id: 'manueline-lisbon', name: { en: 'Manueline Lisbon', zh: '曼努埃尔里斯本' }, region: 'iberia', lat: 38.70, lon: -9.21, radius: 300 },
  { id: 'vienna', name: { en: 'Vienna', zh: '维也纳' }, region: 'danube', lat: 48.21, lon: 16.37, radius: 340 },
  { id: 'bauhaus-dessau', name: { en: 'Bauhaus Dessau', zh: '包豪斯德绍' }, region: 'germany', lat: 51.84, lon: 12.23, radius: 170 },
  { id: 'maya-tikal', name: { en: 'Classic Maya Tikal', zh: '古典玛雅蒂卡尔' }, region: 'yucatan', lat: 17.22, lon: -89.62, radius: 320 },
  { id: 'sgang-gwaay', name: { en: 'SG̱ang Gwaay', zh: '斯冈瓜伊' }, region: 'northwest-coast', lat: 52.09, lon: -131.22, water: true, island: true, radius: 160 },
  { id: 'brasilia', name: { en: 'Brasília', zh: '巴西利亚' }, region: 'brazil', lat: -15.80, lon: -47.86, radius: 500 },
  { id: 'kakadu', name: { en: 'Kakadu', zh: '卡卡杜' }, region: 'australia', lat: -12.41, lon: 132.96, radius: 110 },
  { id: 'nan-madol', name: { en: 'Nan Madol', zh: '南马都尔' }, region: 'micronesia', lat: 6.84, lon: 158.33, water: true, island: true, radius: 170 },
];

/** Open country left between two settlements' blended edges, at the least (m). */
export const GAP = 120;
/** The least distance between the centres of two settlements (m). */
export const spacing = (a, b) => room(a) + room(b) + 2 * BLEND + GAP;
/** The planet's radius (m). */
export const PLANET_RADIUS = 12000;

export const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]));
