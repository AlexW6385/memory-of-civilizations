// The city's buildings (docs/settlements/sydney.md §5).
import { RADIUS, LEVEL, lots } from './layout.js';
import { streetPlans } from './street.js';
const base = (id, elements) => ({ id, style: 'modern', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [100, -96], facing: 'n' } });
export async function buildings() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`sydney-city-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'skyscraper', ...l, t: l.t ?? 'skyscraper' }))));
  plans.push(...streetPlans(base));
  plans.push({ ...base('sydney-ferry-life', ferryLife()), style: 'life' });
  return plans;
}
/** The passengers on the Lady-class ferry at the east wharf (§1e): on its upper deck at the rails and on the benches, on the foredeck by the gangway. */
function ferryLife() {
  const L = [], fx = 28.6, fz = -36, yU = LEVEL + 1.7 + 0.4 + 2.45 + 0.15, yD = LEVEL + 1.7 + 0.5;
  let s = 1973; const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), pick = (a) => a[Math.floor(rand() * a.length)];
  const who = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.45 ? 'robe' : 'trousers', cloth: pick(['cloth_grey', 'cloth_indigo', 'cloth_brown', 'cloth_black', 'cloth_red', 'cloth_ochre', 'cloth_green']), cloth2: pick(['cloth_white', 'linen', 'cloth_grey']), skin: pick(['skin_light', 'skin_light', 'skin_medium']), hat: rand() < 0.15 ? 'brim' : 'none', hatMat: 'cloth_grey', ...o });
  for (const dz of [-6, 0, 6]) L.push({ t: 'bench', at: [fx, fz + dz], y: yU, rot: Math.PI / 2, len: 3.2, back: true, mat: 'timber', seed: dz + 10 });
  for (let k = 0; k < 7; k++) { const sg = k % 2 ? 1 : -1; who([fx + sg * 3.3, fz - 9 + k * 3], yU, sg > 0 ? -Math.PI / 2 : Math.PI / 2, k === 3 ? { pose: 'talk' } : {}); }
  for (let k = 0; k < 3; k++) who([fx + 1.5 - k * 1.2, fz - 16.5], yD, Math.PI, {});
  return L;
}
