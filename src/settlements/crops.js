// The crops in each settlement's fields (DESIGN §5 "Plants": crops in their fields): wheat and
// barley round the Mediterranean, the Near East and Europe (millet and sorghum in Africa stood in
// for by wheat until they have species), rice in East, South and Southeast Asia, maize in the
// Americas. Added where a settlement's ground is mostly fields and nothing taller grows there.

const BY = {
  wheat: ['manueline-lisbon', 'shang-yinxu', 'lu-qufu', 'mohenjo-daro', 'wei-ye', 'tang-changan', 'han-changan', 'qin-xianyang', 'mycenae', 'catalhoyuk', 'mongol-karakorum', 'dunhuang', 'timurid-samarkand', 'shaolin', 'athens', 'rome', 'constantinople', 'knossos', 'jerusalem', 'petra', 'ur', 'babylon', 'persepolis', 'isfahan', 'mamluk-cairo', 'ottoman-istanbul', 'granada', 'giza', 'florence', 'baroque-rome', 'paris', 'conques', 'amsterdam', 'versailles', 'muscovy', 'norse-borgund', 'stonehenge', 'london', 'lalibela', 'djenne', 'great-zimbabwe', 'kilwa', 'lhasa', 'mughal-agra', 'sanchi', 'khajuraho'],
  rice: ['bali-village', 'ayutthaya', 'hakka-tulou', 'nalanda', 'bhaktapur', 'muromachi-kyoto', 'tang-wutai', 'song-kaifeng', 'song-hangzhou', 'ming-suzhou', 'qing-beijing', 'joseon-seoul', 'heian-uji', 'nara', 'edo-himeji', 'madurai', 'angkor', 'borobudur'],
  maize: ['chichen-itza', 'teotihuacan', 'tenochtitlan', 'taos', 'cahokia', 'machu-picchu'],
};
export const CROP_OF = Object.fromEntries(Object.entries(BY).flatMap(([crop, ids]) => ids.map((id) => [id, crop])));
const DENSITY = { wheat: 110, rice: 130, maize: 40 };
const TALL = new Set(['date_palm', 'doum_palm', 'acacia', 'sycamore_fig', 'tamarisk', 'stone_pine', 'cypress', 'holm_oak', 'plane_tree', 'carob', 'oak', 'elm', 'poplar', 'willow', 'apple', 'olive', 'bamboo', 'banyan', 'teak', 'neem', 'reeds', 'papyrus']);

/** Wrap a ground's planting so that its fields carry their crop. */
export function withCrops(id, G) {
  const crop = CROP_OF[id];
  if (!crop || G.withCrops) return G;
  const plant = G.planting;
  G.planting = (x, z, p) => {
    const d = plant(x, z, p);
    if (!d) return d;
    const c = p?.g ?? G.cover(x, z, p?.h ?? G.height(x, z));
    if (!c || !(c.fields > 0.45) || Object.keys(d).some((k) => TALL.has(k) && d[k] > 0.08)) return d;
    return { ...d, [crop]: DENSITY[crop] * Math.min(1, c.fields * 1.2), grass: (d.grass ?? 0) * 0.25 };
  };
  G.maxDensity = { ...(G.maxDensity || {}), [crop]: DENSITY[crop] };
  G.withCrops = true;
  return G;
}
