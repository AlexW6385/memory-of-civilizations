// The forecourt south of Hagia Sophia about 562 (docs/settlements/constantinople.md §4.8, §10): the paved court between
// the church's south front and the Augustaion proper, where the visitor arrives. The faithful come to the south door
// from the palace and the city; as at every great church of the East the doors drew the poor (beggars sit along the
// wall), sellers of candles, bread, fruit and small pots (stalls and goods spread on mats before the shop fronts), the
// water-carriers at the cistern head, pilgrims waiting, porters with donkeys, clergy, soldiers. Static life in the
// life style, placed from the layout: the doors, the processional line and the arrival are kept clear.

import { FORECOURT, height } from './layout.js';
import { nearProcession } from './procession.js';

const DOOR = [-10, 36];                                  // Hagia Sophia's south door (hagia-sophia/plan.js)
export const WELL = [-20, 66];
const fp = (o, u, s, t) => [o[0] + s * u[0] - t * u[1], o[1] + s * u[1] + t * u[0]];

/**
 * forecourt(person, push, rand, pick) → nothing; adds its elements through `push` (one element) and its people
 * through `person(at, rot, opts)` (life.js: it keeps people off the arrival).
 */
export function forecourt({ person, push, rand, pick }) {
  const S = () => Math.floor(rand() * 1e9), Y = (p) => height(p[0], p[1]);
  const faceTo = (p, q) => Math.atan2(-(q[0] - p[0]), -(q[1] - p[1]));          // a figure's rot toward q
  const stallRot = (dx, dz) => Math.atan2(dx, dz);                              // a stall's front toward (dx, dz)
  const [x0, z0, x1, z1] = FORECOURT;
  // ── the pilgrims' stalls before the church's south front, fronts to the court, the keepers behind ──
  const WARES = [['bread', 'baskets'], ['heap', 'melons'], ['greens', 'baskets'], ['pottery', 'baskets'], ['bolts', 'bolts'], ['fish', 'heap'], ['spice', 'bread']];
  const AW = ['cloth_white', 'cloth_ochre', 'cloth_red', 'linen', 'cloth_indigo', 'cloth_green'];
  const stalls = [[-36, 53.5], [-32.6, 54.3], [-29.2, 53.4], [9, 54], [12.4, 53.2], [15.8, 54.2], [19.2, 53.4], [22.6, 54], [26, 53.3]];
  for (const [x, z] of stalls) {
    push({ t: 'stall', at: [x, z], y: Y([x, z]), rot: 0, seed: S(), w: 2.3, d: 0.95, awning: pick(AW), goods: pick(WARES) });
    person([x + (rand() - 0.5) * 0.8, z - 1.15], 0, { pose: rand() < 0.4 ? 'sit' : 'stand' });                    // the keeper, behind the table
    if (rand() < 0.7) person([x + (rand() - 0.5) * 1.6, z + 1.6 + rand() * 0.6], faceTo([x, z + 1.6], [x, z]));      // a buyer
  }
  // ── goods on mats and in baskets, the sellers sitting by them, on the court's middle ground ──
  const mats = [[-40, 70], [-33, 79], [-27, 88], [-44, 86], [30, 66], [36, 76], [28, 84], [34, 90], [46 - 4, 66], [-38, 62]];
  mats.forEach(([x, z], i) => {
    push({ t: 'goods_mat', at: [x, z], y: Y([x, z]), rot: (i % 3) * 0.5 - 0.5, seed: S(), goods: pick([['heap', 'baskets'], ['bread', 'baskets'], ['greens', 'heap'], ['fish', 'fish'], ['pottery', 'pottery'], ['melons', 'heap']]) });
    person([x + 0.2, z + 1.1], Math.PI, { pose: 'sit' });
    if (rand() < 0.5) person([x + 1.7, z + 1.5], faceTo([x + 1.7, z + 1.5], [x, z]), { pose: 'talk' });
  });
  // sacks, crates and barrels stacked against the shop fronts, an amphora cart
  for (const [x, z] of [[-57, 58], [-56.5, 71], [-57.4, 83], [45.5, 60], [45.2, 72], [45.4, 85]]) {
    const t = pick(['barrel', 'sacks', 'crates']);
    push(t === 'barrel' ? { t, at: [x, z], y: Y([x, z]), n: 2, seed: S() } : { t, at: [x, z], y: Y([x, z]), rot: x < 0 ? Math.PI / 2 : -Math.PI / 2, seed: S() });
  }
  for (const [x, z, k] of [[-56.6, 62, 'amphora'], [-56.8, 63, 'water_pot'], [-57, 78, 'amphora'], [45.6, 66, 'amphora'], [45.5, 79, 'water_pot'], [45.4, 80, 'amphora']]) push({ t: 'pot', kind: k, at: [x, z], y: Y([x, z]), n: 1, seed: S() });
  // ── the cistern head and the water-carriers ──
  push({ t: 'well', at: WELL, y: Y(WELL), kind: 'windlass', mat: 'marble', mould: true, roof: true, seed: S() });
  for (let k = 0; k < 5; k++) {
    const a = k * 1.25 + 0.4, p = [WELL[0] + Math.cos(a) * 2.2, WELL[1] + Math.sin(a) * 2.2];
    person(p, faceTo(p, WELL), { dress: 'robe', hat: 'veil', cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo']), carry: k % 2 ? 'basket' : undefined, pose: k % 2 ? 'stand' : 'talk' });
  }
  for (const [dx, dz, kind] of [[2.6, 1.6, 'amphora'], [-2.5, 1.9, 'water_pot'], [1.2, -2.7, 'water_pot']]) push({ t: 'pot', kind, at: [WELL[0] + dx, WELL[1] + dz], y: 0, n: 1, seed: S() });
  // ── the poor along the church wall, either side of the door; those waiting at the door ──
  for (const x of [-24.5, -18.5, -14.2, -5.4, -2.2, 3.5, 9.6]) person([x, 37.7 + rand() * 0.3], Math.PI, { pose: 'sit', dress: 'tunic', legs: 'bare', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_brown']), hat: rand() < 0.4 ? 'cap' : 'none' });
  for (let k = 0; k < 11; k++) {
    const a = -0.9 + (k / 10) * 1.8, r = 4.5 + rand() * 4, p = [DOOR[0] + Math.sin(a) * r, DOOR[1] + 3 + Math.cos(a) * r * 0.7];
    if (nearProcession(p[0], p[1], 5) || Math.abs(p[0] - DOOR[0]) < 2.6) continue;      // the way to the door stays open
    person(p, faceTo(p, [DOOR[0], DOOR[1] - 2]), { pose: rand() < 0.3 ? 'pray' : 'stand' });
  }
  // two guards of the church at the door
  for (const s of [-1, 1]) person([DOOR[0] + s * 3.3, 39.2], 0, { dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'none', carry: 'staff', len: 2.4, pose: 'stand' });
  // ── groups in conversation, clergy, a mother and her children, people crossing ──
  const groups = [[-8, 62], [-30, 73], [14, 68], [26, 60], [-4, 98], [-36, 96], [20, 98], [-46, 52]];
  for (const g of groups) {
    const n = 2 + Math.floor(rand() * 2), c = g;
    if (nearProcession(c[0], c[1], 7)) continue;
    for (let k = 0; k < n; k++) { const a = (k / n) * 6.28 + rand(), p = [c[0] + Math.cos(a) * 0.95, c[1] + Math.sin(a) * 0.95]; person(p, faceTo(p, c), { pose: 'talk' }); }
  }
  for (const c of [[-16, 56], [18, 80], [-26, 100]]) person(c, rand() * 6.28, { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', over: 'none', hat: 'none' });
  for (const [x, z] of [[-14, 76], [30, 94], [-48, 68]]) {
    person([x, z], rand() * 6.28, { dress: 'robe', hat: 'veil', cloth: pick(['cloth_green', 'cloth_red', 'cloth_ochre']) });
    for (const q of [1, 2]) person([x + 0.7 * q, z + 0.5 * q], rand() * 6.28, { dress: 'tunic', legs: 'bare', h: 0.62 + rand() * 0.12, cloth: pick(['cloth_brown', 'cloth_ochre', 'cloth_white']), hat: 'none' });
  }
  for (let k = 0; k < 14; k++) {
    const x = x0 + 8 + rand() * (x1 - x0 - 16), z = z0 + 14 + rand() * (z1 - z0 - 18), p = [x, z];
    if (nearProcession(x, z, 6) || (Math.abs(x - WELL[0]) < 4 && Math.abs(z - WELL[1]) < 4)) continue;
    person(p, rand() * 6.28);
  }
  // ── porters with their donkeys by the west shops, a dog under the stalls ──
  for (const [x, z, rot] of [[-47, 61, 1.2], [-50, 78, 1.9], [36, 62, -1.3]]) {
    push({ t: 'animal', kind: 'donkey', at: [x, z], y: Y([x, z]), rot, seed: S(), gear: true });
    person(fp([x, z], [Math.sin(rot), Math.cos(rot)], 1.4, 0.9), rot, { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_brown', 'cloth_grey']), hat: 'cap', pose: 'stand' });
  }
  push({ t: 'handcart', at: [-44, 94], y: 0, rot: 0.4, seed: S() });
  for (const [x, z, r] of [[-18, 55, 0.3], [24, 57, 2.4], [6, 92, 4]]) push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: r, seed: S() });
  // ── marble benches against the church's south wall, between the buttresses ──
  for (const x of [-29, -12.5, -6.5, 8]) push({ t: 'bench', at: [x, 37.6], y: 0, rot: 0, len: 2.2, mat: 'marble', seed: 1 });
}
