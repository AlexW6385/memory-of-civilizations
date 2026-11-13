import { lodTiles } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The village of Uji (docs/settlements/heian-uji.md §11, §15): houses of the commoners — stone-weighted board roofs, thatch,
// cypress bark — in two levels of detail, with their yards, trades and eye-level dressing; every house within reach of the
// core can be entered (furnished by its trade), a few are inns (the road to Nara and Kyoto crosses at the bridge).
import { RADIUS, lots } from './layout.js';

/** The houses that can be entered: wide and deep enough, within 150 m of the arrival or the village's middle; inns along the roads. */
export function openSet(all) {
  const A = ARRIVALS['heian-uji'], pts = [[A[0], A[2]], [-40, 140], [-40, -150]];
  const ok = all.filter((l) => l.rect[2] - l.rect[0] >= 4.8 && l.rect[3] - l.rect[1] >= 5.2 && pts.some(([x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z) < 150));
  const d = (l) => Math.min(...pts.map(([x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z)));
  ok.sort((a, b) => d(a) - d(b)); ok.length = Math.min(ok.length, 90);
  const m = new Map();
  ok.forEach((l, i) => m.set(l, l.kind === 'road' && l.rect[2] - l.rect[0] > 8 && i % 3 === 0 ? 'inn' : 'home'));
  return m;
}
export async function houses() {
  const all = lots(), open = openSet(all);
  return lodTiles('heian-uji-houses', 'japanese', all.map((l) => ({ t: 'heian_house', ...l, ...(open.has(l) ? { open: open.get(l) } : {}) })), { near: 200, R: RADIUS + 100, entrance: { at: [-60, 72], facing: 'n' } });
}

/** The people at home in the open houses (an interior's frame follows heian_house: front f, v inward from the front, u along it). */
export function homeFolk() {
  const all = lots(), open = openSet(all), out = [];
  let k = 0;
  for (const [l, use] of open) {
    k++;
    if (k % 2 && use !== 'inn') continue;
    const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
    const P = (u, v) => (f === 's' ? [x0 + u, z1 - v] : f === 'n' ? [x1 - u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
    const T = 0.2, earth = Math.min(D - 2.4, 2.6), g0 = T + earth, ry = 0.45 + 0.4, hu = L * 0.5, hv = g0 + (D - T - g0) * 0.45;
    const face = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
    const at = P(hu + 1.35, hv), hearth = P(hu, hv), woman = k % 4 === 0;
    const cloth = ['cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_ochre'][k % 4];
    out.push({ t: 'figure', at, y: ry, rot: face(at, hearth), seed: 7700 + k * 53, dress: woman ? 'robe' : 'trousers', hair: woman ? 'long' : 'topknot', hat: 'none', cloth, cloth2: 'cloth_white', skin: 'skin_medium', carry: 'none', pose: 'cross' });
  }
  return out;
}
export function homeFolkPlans() {
  const tiles = new Map();
  for (const e of homeFolk()) { const key = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(key)) tiles.set(key, []); tiles.get(key).push(e); }
  return [...tiles].map(([key, elements]) => { const [i, j] = key.split(',').map(Number); return { id: `heian-uji-homefolk-${key}`, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'e' }, center: [i * 100 + 50, j * 100 + 50], near: 140 }; });
}
