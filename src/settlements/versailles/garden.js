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

  // ── the court in the garden (§5a): couples and knots of courtiers on the gravel of the central walk and the side walks, kept off the axis
  // (|z| > 3.2 on the walk; the arrival stands at x = −60) and 10 m from the arrival; Cent-Suisses at the garden front's doors, gardeners
  // watering the orange trees, a nursemaid with her charge, spaniels at their masters' heels
  { let sd = 1693; const rnd = () => ((sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296), pk = (a) => a[Math.floor(rnd() * a.length)];
    const COATS = ['cloth_red', 'cloth_indigo', 'cloth_brown', 'cloth_green', 'cloth_grey', 'cloth_black', 'cloth_maroon'], GOWNS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_grey', 'cloth_blue'];
    const far = (x, z) => Math.hypot(x + 60, z) > 10;
    const man = (x, z, rot, pose = 'stand', o = {}) => far(x, z) && fig({ at: [x, z], y: height(x, z), rot, h: 1.66 + rnd() * 0.12, seed: Math.floor(rnd() * 1e9), dress: 'tunic', cloth: pk(COATS), cloth2: pk(['cloth_white', 'cloth_ochre']), hat: 'brim', hatMat: 'cloth_black', hair: 'wig', pose, over: pk(['cape', 'sash', 'none']), ...o });
    const lady = (x, z, rot, pose = 'stand', o = {}) => far(x, z) && fig({ at: [x, z], y: height(x, z), rot, h: 1.55 + rnd() * 0.1, seed: Math.floor(rnd() * 1e9), dress: 'robe', cloth: pk(GOWNS), cloth2: pk(['cloth_white', 'cloth_ochre']), hat: 'none', hair: 'bun', pose, over: pk(['shawl', 'none']), ...o });
    // couples walking and knots in talk down the walk (to Latona, and back toward the château)
    for (let x = -66, k = 0; x < -8; x += 5.5 + rnd() * 3, k++) {
      const side = k % 2 ? 1 : -1, z = side * (4.2 + rnd() * 2.2), rot = k % 3 ? (side > 0 ? Math.PI / 2 : -Math.PI / 2) * 0 + (rnd() < 0.5 ? Math.PI / 2 : -Math.PI / 2) : rnd() * 6.28;
      man(x, z, rot, 'stand'); lady(x + Math.sin(rot - Math.PI / 2) * 0.8, z + Math.cos(rot - Math.PI / 2) * 0.8, rot, rnd() < 0.3 ? 'talk' : 'stand');
      if (rnd() < 0.25) L.push({ t: 'animal', kind: 'dog', at: [x - Math.sin(rot) * 1.4, z - Math.cos(rot) * 1.4], y: height(x, z), rot: rot + 0.3, seed: Math.floor(rnd() * 1e6), mat: pk(['hide_white', 'hide_brown', 'hide_black']) });
    }
    // the side walks along the broderie parterres
    for (const sz of [-1, 1]) for (let x = -66, k = 0; x < -10; x += 7 + rnd() * 4, k++) { const z = sz * (59 + rnd() * 3.5), rot = rnd() < 0.5 ? 0 : Math.PI; man(x, z, rot + Math.PI / 2); if (rnd() < 0.6) lady(x + 0.9, z + 0.2, rot + Math.PI / 2, rnd() < 0.4 ? 'talk' : 'stand'); }
    // before the garden front: groups on the terrace between the vases, the Cent-Suisses of the guard at the doors (halberds, in red, blue and white)
    for (const z of [-30, -13, 13, 30]) for (const dz of [-0.7, 0.7]) fig({ at: [-2.6, z + dz], y: height(-2.6, z), rot: -Math.PI / 2, h: 1.78, seed: 5000 + z + dz * 4, dress: 'tunic', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'brim', hatMat: 'cloth_black', carry: 'staff', legs: 'hose', pose: 'stand' });
    // gardeners: two with watering pails and a boy with a barrow among the orange trees; a nursemaid with her charge, a boy with a hoop
    for (const [x, z, r] of [[-30, -62, 0.6], [-50, 62, -1.0], [-18, 62, 2.2]]) fig({ at: [x, z], y: height(x, z), rot: r, seed: Math.floor(x * 5 - z), carry: 'pails', pose: 'stand', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'brim', hatMat: 'thatch', dress: 'tunic' });
    for (const [x, z] of [[-24, 61.5], [-44, -61.5]]) L.push({ t: 'barrel', at: [x, z], y: height(x, z), n: 1, seed: Math.floor(x), rot: 0.4 });
    fig({ at: [-34, -8.6], y: height(-34, -8.6), rot: 2.0, seed: 61, h: 1.6, dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'veil', carry: 'child', pose: 'stand' });
    fig({ at: [-28, 8.6], y: height(-28, 8.6), rot: 4.0, seed: 62, child: true, dress: 'tunic', cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'brim', pose: 'stand' });
  }
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
