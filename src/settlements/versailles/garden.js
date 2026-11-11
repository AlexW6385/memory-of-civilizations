// Orange trees, chairs and gardeners (docs/settlements/versailles.md §1a): the orange trees set out in their boxes
// along both sides of the water parterre; gardeners at work among them; two blue hired chairs and their bearers in
// blue at the Place d'Armes, where visitors without the Honneurs du Louvre left their coaches, the coaches waiting
// there; a courtier's own chair on the terrace. Pure data: the classical_fr style's builders and the shared objects.

import { PARTERRE, PLACE, RISE, height, BRODERIE, LAWNS, HEDGE_Z, TAPIS, APOLLO } from './layout.js';

const plan = (id, style, elements, bounds, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements, ...extra });
const at = (x, z, rot, lx, lz) => [x + lx * Math.cos(rot) + lz * Math.sin(rot), z - lx * Math.sin(rot) + lz * Math.cos(rot)];

export function gardenPlans() {
  const trees = [];
  for (const zs of [PARTERRE[1] - 6, PARTERRE[3] + 6]) for (let x = PARTERRE[0] + 2; x <= PARTERRE[2] - 4; x += 6) trees.push([x, zs]);
  const G = [{ t: 'orange_trees', at: trees, ys: trees.map(([x, z]) => height(x, z)), seed: 1686 }], L = [];
  const fig = (o) => L.push({ t: 'figure', y: 0, dress: 'robe', legs: 'hose', skin: 'skin_light', over: 'none', ...o });
  // gardeners: hoeing, sweeping the walks, one with a barrow
  for (const [x, z, carry, rot] of [[-40, -64, 'hoe', 0.4], [-22, 64, 'broom', -2.6], [-58, 63, 'none', 1.2], [-10, -63, 'broom', 2.0]])
    fig({ at: [x, z], y: height(x, z), rot, seed: Math.floor(x * 7 - z), carry, pose: carry === 'none' ? 'squat' : 'stand', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'brim', hatMat: 'thatch' });
  L.push({ t: 'barrow', at: [-56, 61.5], y: height(-56, 61.5), rot: 0.3, seed: 3 });
  // a courtier's own chair, gilt and with his arms, set down on the terrace; its bearers in his livery
  const cx = -2, cz = -48, cr = Math.PI;
  G.push({ t: 'sedan_chair', at: [cx, cz], rot: cr, y: height(cx, cz), body: 'gilt_bronze', cloth: 'cloth_red' });
  for (const lz of [-1.8, 1.8]) fig({ at: at(cx, cz, cr, 0.95, lz), y: height(cx, cz), rot: cr + (lz < 0 ? 0 : Math.PI), seed: 90 + lz * 10, pose: 'stand', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'brim', over: 'cape' });
  // the hired chairs, painted blue, their bearers in blue, at the Place d'Armes; coaches left waiting there
  for (const [x, z, r] of [[PLACE[0] + 14, -18, Math.PI / 2], [PLACE[0] + 14, -12, Math.PI / 2]]) {
    G.push({ t: 'sedan_chair', at: [x, z], rot: r, y: RISE, body: 'paint_blue', cloth: 'cloth_white' });
    for (const lz of [-1.8, 1.8]) fig({ at: at(x, z, r, 0.95, lz), y: RISE, rot: r + (lz < 0 ? 0 : Math.PI), seed: Math.floor(x + z * 3 + lz * 10), pose: lz < 0 ? 'talk' : 'stand', cloth: 'cloth_indigo', cloth2: 'cloth_indigo', hat: 'brim' });
  }
  for (const [x, z, body, cloth, horse] of [[PLACE[0] + 40, 30, 'lacquer_black', 'cloth_red', 'hide_black'], [PLACE[0] + 52, 38, 'wood_painted', 'cloth_indigo', 'hide_grey']]) {
    const r = Math.PI / 2;
    G.push({ t: 'coach', at: [x, z], rot: r, y: RISE, body, cloth });
    for (const s of [-1, 1]) L.push({ t: 'animal', kind: 'horse', at: at(x, z, r, s * 0.62, -3.55), y: RISE, rot: r, seed: Math.floor(x * 31 + s), mat: horse, graze: false, gear: false });
    fig({ at: at(x, z, r, 0, -1.6), y: RISE + 1.2, rot: r, seed: Math.floor(x * 3), pose: 'sit', cloth, cloth2: 'cloth_black', hat: 'brim', over: 'cape' });
  }
  // the garden's furniture (§1h): embroidered parterres, hornbeam walls with their gates, statues and vases, yews, benches
  const D = [], st = [], yw = [], bn = [];
  BRODERIE.forEach((r, i) => D.push({ t: 'broderie', rect: r, h: height, seed: 70 + i, sand: i ? ['slate', 'sandstone_red'] : ['sandstone_red', 'slate'] }));
  const run = (x0, x1, z, gates) => [x0, z, x1, z, gates];
  const xs0 = APOLLO[0] + 22, xs1 = TAPIS[2];
  D.push({ t: 'palissades', h: height, seed: 11, runs: [run(xs0, xs1, -HEDGE_Z, [40, 110]), run(xs0, xs1, HEDGE_Z, [40, 110]), run(xs1 + 2, -72, -HEDGE_Z, [34]), run(xs1 + 2, -72, HEDGE_Z, [34])].map(([a, b, c, d, g]) => [Math.min(a, c), b, Math.max(a, c), d, g]) });
  void xs1;
  // along the Allée Royale: statue and vase in turn, on both walks; yews between them
  for (let x = xs0 + 8, k = 0; x < TAPIS[2] - 4; x += 12, k++) for (const sz of [-1, 1]) {
    const z = sz * 28, kind = (k + (sz > 0 ? 1 : 0)) % 2 ? 'vase' : (k % 4 < 2 ? 'raised' : 'stand');
    st.push([x, z, sz > 0 ? Math.PI : 0, kind]);
    for (const dx of [6]) yw.push([x + dx, sz * 31, 0.9 + ((k * 7) % 3) * 0.1]);
  }
  // the Latona walk: statues along its sides, yews round the lawns, the terrace's vases before the garden front
  for (let x = -76, k = 0; x > -136; x -= 12, k++) for (const sz of [-1, 1]) { st.push([x, sz * 11.5, sz > 0 ? Math.PI : 0, k % 2 ? 'raised' : 'stand']); yw.push([x - 6, sz * 33, 1]); yw.push([x - 6, sz * 12.5, 0.8]); }
  for (let z = -48; z <= 48; z += 8) if (Math.abs(z) > 9) st.push([-12.5, z, Math.PI / 2, 'vase']);
  for (const r of BRODERIE) for (let x = r[0] + 6; x < r[2] - 4; x += 12) bn.push([x, r[1] - 1.2, 0], [x, r[3] + 1.2, Math.PI]);
  for (const z of [-42, 42]) for (let x = -64; x < -8; x += 14) bn.push([x, z * 1.0 + (z < 0 ? -5 : 5), z < 0 ? 0 : Math.PI]);
  for (let x = -120; x > -130; x -= 8) for (const sz of [-1, 1]) bn.push([x, sz * 14.5, sz > 0 ? Math.PI : 0]);
  D.push({ t: 'statues', at: st, h: height, seed: 9 }, { t: 'yews', at: yw, h: height, seed: 5 }, { t: 'benches', at: bn, h: height });
  void LAWNS;
  return [
    plan('versailles-garden-detail', 'classical_fr', D, [-340, -140, 10, 140], { center: [-160, 0], near: 230 }),
    plan('versailles-garden-objects', 'classical_fr', G, [-80, -80, 220, 80], { center: [60, 0], near: 320 }),
    plan('versailles-garden-life', 'life', L, [-80, -80, 220, 80], { center: [60, 0], near: 320 }),
  ];
}
