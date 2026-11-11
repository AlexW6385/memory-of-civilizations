// Petra — the dress of the streets, squares and valley (docs/settlements/petra.md §18). Pure data from layout.js: two lists,
// `fronts()` (elements of style nabataean: the shop awnings, the wall niches, the benches, shrines and basins, the Nymphaeum, the
// yards' walls) and `life()` (elements of style life: the goods before the shops, the north portico's stalls, the beasts and people
// of the forecourt, the Siq, the Outer Siq, the yards and the roofs).
import { STREET, PLAZA, OUTER, SIQ_LINE, GREAT_TEMPLE, GARDEN, QASR, shopUnits, lots, yards, height, pathDist, inRect, THEATRE, TEMENOS, smooth } from './layout.js';
import { tradeOf } from './shops.js';
import { houseLayout } from '../../styles/nabataean/house.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CL = ['cloth_white', 'linen', 'cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_brown'];
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));          // a figure faces −z at rot = 0
const dirRot = (dx, dz) => Math.atan2(dx, dz);                                           // a prop's +z toward (dx, dz)
const Z = STREET.a[1], XA = STREET.b[0], XB = STREET.a[0], SIDE = STREET.w / 2;           // the street's middle line, its ends, half its width
const YP = 0.45, YS = 0.05;                                                                  // the porticoes' floor, the street's

export function fronts() {
  const E = [], rand = rng(180);
  const wallS = Z + SIDE + 0.9 + 5;                                                         // the south portico's back: the shops' front wall
  for (const s of shopUnits()) E.push({ t: 'petra_front', at: [+s.m.toFixed(3), +wallS.toFixed(3)], rot: Math.PI, dw: s.dw, trade: tradeOf(s), seed: 300 + s.i, y: YP });
  // the north portico's wall (the back at z = 3.1): niches with baetyls every 13 m, dedication slabs between, benches with their backs to it
  const wallN = Z - SIDE - 0.9 - 5, nx0 = XA + 12, gaps = [];
  for (let x = nx0, i = 0; x < XB - 8; x += 13, i++) {
    E.push({ t: 'petra_prop', kind: 'niche', at: [+x.toFixed(2), +wallN.toFixed(2)], rot: 0, y: YP, h: 2.2 + (i % 3) * 0.2, seed: i });
    E.push({ t: 'petra_prop', kind: 'stele', at: [+(x + 6.5).toFixed(2), +(wallN + 0.35).toFixed(2)], rot: 0, y: YP, seed: i + 40 });
    if (i % 2 === 0) E.push({ t: 'petra_prop', kind: 'bench', at: [+(x + 3.2).toFixed(2), +(wallN + 0.5).toFixed(2)], rot: Math.PI, y: YP, len: 2.6, back: true, seed: i });
  }
  // benches along the south portico's column line, every fourth bay, and basins at the street's edge before the Great Temple and the garden stair
  for (let x = XA + 14; x < XB - 10; x += 14.5) if (!GREAT_TEMPLE || x < GREAT_TEMPLE[0] - 2 || x > GREAT_TEMPLE[2] + 2) E.push({ t: 'petra_prop', kind: 'bench', at: [+x.toFixed(2), +(Z + SIDE + 2.1).toFixed(2)], rot: 0, y: YP, len: 2.2, seed: x | 0 });
  for (const x of [-92, -48, 36]) E.push({ t: 'petra_prop', kind: 'basin', at: [x, +(Z + SIDE - 0.6).toFixed(2)], rot: 0, y: YS, seed: x | 0 });
  // the Nymphaeum ends the street on the east, facing west down it
  E.push({ t: 'petra_nymph', at: [66, Z], rot: Math.PI / 2, w: 15, y: YS });
  // the forecourt before the Khazneh: benches round the edge (their backs to the wall), the baetyl shrine and a basin
  const [px, pz] = PLAZA.c;
  for (const a of [-125, -100, -80, -55, 55, 80, 100, 125]) { const r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); E.push({ t: 'petra_prop', kind: 'bench', at: [+(px + c * 17.6).toFixed(2), +(pz + s * 17.6).toFixed(2)], rot: dirRot(c, s), y: height(px + c * 17.6, pz + s * 17.6), len: 2.6, back: true, seed: a }); }
  E.push({ t: 'petra_prop', kind: 'shrine', at: [px + 5, pz - 12], rot: dirRot(-1, 0.55), y: 0, seed: 3 });
  E.push({ t: 'petra_prop', kind: 'basin', at: [px + 1, pz + 15.2], rot: 0, y: 0, seed: 4 });
  // the Outer Siq: wayside shrines and benches against the walls, basins, slabs
  const P = OUTER.path;
  for (let i = 1; i + 1 < P.length; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L, nx = -tz, nz = tx;
    for (let t = 8; t < L - 6; t += 17) for (const sg of [-1, 1]) {
      const x = ax + tx * t + nx * sg * (OUTER.w / 2 - 1.8), z = az + tz * t + nz * sg * (OUTER.w / 2 - 1.8);
      if (!okOuter(x, z)) continue;
      const r = rand(), kind = r < 0.35 ? 'bench' : r < 0.6 ? 'stele' : r < 0.78 ? 'basin' : 'shrine';
      E.push({ t: 'petra_prop', kind, at: [+x.toFixed(2), +z.toFixed(2)], rot: dirRot(nx * sg, nz * sg), y: height(x, z), len: 2.4, back: true, seed: Math.floor(rand() * 1e5) });
    }
  }
  // the temples: lampstands and braziers in Qasr al-Bint's naos and the Great Temple's, offering tables and braziers round the great altar
  const [qx0, qz0, qx1] = QASR.rect, qc = (qx0 + qx1) / 2, [ax, az] = QASR.altar, gt = GREAT_TEMPLE;
  for (const [x, z] of [[qx0 + 3.0, qz0 + 10], [qx0 + 3.0, qz0 + 15.5], [qx1 - 3.0, qz0 + 10], [qx1 - 3.0, qz0 + 15.5]]) E.push({ t: 'petra_prop', kind: 'lampstand', at: [x, z], y: 3.02, seed: 1 });
  for (const x of [qc - 5.5, qc + 5.5]) { E.push({ t: 'petra_prop', kind: 'brazier', at: [x, qz0 + 11], y: 3.02, seed: 2 }); E.push({ t: 'petra_prop', kind: 'table', at: [x, qz0 + 14.6], rot: 0, y: 3.02, seed: 3 }); }
  for (const [x, z] of [[gt[0] + 8.4, gt[1] + 53.5], [gt[0] + 8.4, gt[1] + 62], [gt[2] - 8.4, gt[1] + 53.5], [gt[2] - 8.4, gt[1] + 62]]) E.push({ t: 'petra_prop', kind: 'lampstand', at: [x, z], y: 5.92, seed: 4 });
  for (const x of [(gt[0] + gt[2]) / 2 - 7, (gt[0] + gt[2]) / 2 + 7]) E.push({ t: 'petra_prop', kind: 'brazier', at: [x, gt[1] + 56], y: 5.92, seed: 5 });
  for (const [x, z, r] of [[ax - 11.5, az - 8, 0], [ax - 11.5, az + 8, Math.PI]]) E.push({ t: 'petra_prop', kind: 'table', at: [x, z], rot: dirRot(1, 0) , y: 0.06, seed: 6 + r });
  for (const [x, z] of [[ax - 14, az - 3.5], [ax - 14, az + 3.5]]) E.push({ t: 'petra_prop', kind: 'brazier', at: [x, z], y: 0.06, seed: 8 });
  // the yards of the empty lots
  for (const y of yards()) E.push({ t: 'petra_yard', rect: y.rect, kind: y.kind, seed: y.seed, y: y.y, gate: y.gate });
  return E;
}
/** Is (x, z) inside the Outer Siq's floor and clear of the theatre and the caravan's way? */
function okOuter(x, z) {
  if (pathDist(x, z, OUTER.path) > OUTER.w / 2 - 0.5) return false;
  if (Math.hypot(x - THEATRE.c[0], z - THEATRE.c[1]) < THEATRE.r1 + 3 && x > THEATRE.c[0] + THEATRE.west - 3) return false;
  return height(x, z) < 3 && Math.abs(height(x, z) - height(x + 1.5, z + 1.5)) < 0.6;
}

export function life() {
  const L = [], rand = rng(181), pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const person = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), over: pick(['sash', 'cape', 'none']), skin: 'skin_medium', hat: rand() < 0.4 ? 'turban' : 'none', hatMat: 'cloth_white', feet: 'shod', ...o });
  const woman = (at, y, rot, o = {}) => person(at, y, rot, { over: 'shawl', hat: 'veil', hatMat: pick(['cloth_white', 'cloth_indigo', 'cloth_ochre']), beard: false, feet: 'bare', ...o });
  const child = (at, y, rot, o = {}) => person(at, y, rot, { dress: 'tunic', child: true, hat: 'none', over: 'none', beard: false, feet: 'bare', ...o });
  const beast = (kind, at, y, rot, o = {}) => L.push({ t: 'animal', kind, at, y, rot, seed: seed(), ...o });
  const on = (x, z) => height(x, z);

  // ── the street: goods before the shops, by trade ────────────────────────────────────────────────────────────────────
  const wallS = Z + SIDE + 0.9 + 5;
  for (const s of shopUnits()) {
    const trade = tradeOf(s), k = s.i * 11, xl = s.m - s.dw / 2 - 0.65, xr = s.m + s.dw / 2 + 0.65, zz = wallS - 0.75;
    L.push({ t: 'shop_sign', at: [+xr.toFixed(2), +wallS.toFixed(2)], y: YP, rot: Math.PI, h: 2.45, len: 1.0, out: 0.95, cloth: { incense: 'cloth_ochre', spice: 'cloth_red', potter: 'cloth_brown', cloth: 'cloth_indigo', oil: 'cloth_green', grain: 'cloth_ochre' }[trade], trim: 'cloth_white', letters: 3, seed: k });
    if (trade === 'incense' || trade === 'spice') { L.push({ t: 'goods_mat', at: [xl, zz - 0.3], y: YP, rot: 0.1, goods: ['spice', 'baskets'], seed: k + 1 }); L.push({ t: 'sacks', n: 3, at: [xr + 0.2, zz], y: YP, rot: 0.2, seed: k + 2 }); }
    else if (trade === 'potter') { L.push({ t: 'pot', kind: 'amphora', n: 3, at: [xl, zz], y: YP, seed: k + 3 }); L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [xr, zz + 0.2], y: YP, seed: k + 4 }); L.push({ t: 'pot', kind: 'pithos', at: [xl - 0.8, zz - 0.2], y: YP, seed: k + 5 }); }
    else if (trade === 'cloth') { L.push({ t: 'goods_mat', at: [xr, zz - 0.2], y: YP, rot: -0.1, goods: ['bolts'], seed: k + 6 }); L.push({ t: 'basket', n: 2, at: [xl, zz], y: YP, seed: k + 7, goods: 'cloth_red' }); }
    else if (trade === 'oil') { L.push({ t: 'pot', kind: 'amphora', n: 4, at: [xl, zz], y: YP, seed: k + 8 }); L.push({ t: 'pot', kind: 'zir', at: [xr, zz], y: YP, seed: k + 9 }); }
    else { L.push({ t: 'sacks', n: 5, at: [xl, zz], y: YP, rot: -0.2, seed: k + 10 }); L.push({ t: 'basket', n: 2, at: [xr, zz + 0.1], y: YP, seed: k + 11 }); L.push({ t: 'pot', kind: 'vat', at: [xr + 0.6, zz - 0.3], y: YP, seed: k + 12 }); }
    // a customer, a passer-by stopped at the door, a woman haggling, a boy at the step
    if (s.i % 4 === 0) { person([s.m + 0.9, wallS - 1.9], YP, face([s.m + 0.9, wallS - 1.9], [s.m, wallS]), { pose: 'talk', beard: true }); }
    if (s.i % 5 === 2) woman([s.m - 1.0, wallS - 2.4], YP, face([s.m - 1.0, wallS - 2.4], [s.m + 0.6, wallS - 2.0]), { pose: 'talk', carry: rand() < 0.5 ? 'basket' : 'none' });
    if (s.i % 6 === 3) child([s.m + 1.2, wallS - 1.2], YP, rand() * 6.28, { pose: 'sit_ground' });
  }
  // the north portico: stalls against the back wall (the awning's front to the street), their keepers, and the goods on mats between
  const wallN = Z - SIDE - 0.9 - 5;
  const GOODS = [['heap', 'melons', 'greens'], ['bolts'], ['pottery', 'baskets'], ['spice', 'baskets'], ['bread', 'baskets'], ['pottery']];
  for (let x = XA + 6, i = 0; x < XB - 8; x += 11.5, i++) {
    const sx = x + (i % 3) * 0.8, zc = wallN + 1.5;
    L.push({ t: 'stall', at: [sx, zc], y: YP, rot: 0, w: 2.6, d: 1.4, goods: GOODS[i % GOODS.length], awning: pick(['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo']), seed: 90 + i });
    L.push({ t: 'stool', at: [sx + 0.4, zc - 0.7], y: YP, rot: 0, seed: i });
    person([sx + 0.4, zc - 0.7], YP, 0, { pose: 'sit_low', beard: rand() < 0.7 });
    if (i % 2 === 0) L.push({ t: 'goods_mat', at: [sx + 4.6, wallN + 2.0], y: YP, rot: rand() * 0.4, goods: GOODS[(i + 2) % GOODS.length], seed: 140 + i });
    if (i % 3 === 1) { woman([sx - 2.0, zc + 0.9], YP, face([sx - 2.0, zc + 0.9], [sx, zc]), { pose: 'stand', carry: 'basket' }); }
  }
  // the street's own life: loaded donkeys at the kerb, porters with sacks and jars, boys, the water-carriers, a man asleep in the shade
  for (let x = XA + 9, i = 0; x < XB - 6; x += 17 + (i % 3) * 3, i++) {
    const south = i % 2, zl = south ? Z + SIDE - 1.1 : Z - SIDE + 1.1, rot = (i % 4 < 2 ? 1 : -1) * Math.PI / 2;
    if (i % 3 === 0) { beast('donkey', [x, zl], YS, rot, { gear: true }); person([x + (rot > 0 ? -1.4 : 1.4), zl + (south ? -0.6 : 0.6)], YS, rot > 0 ? -Math.PI / 2 : Math.PI / 2, { carry: 'staff', pose: 'staff', beard: true, hat: 'turban' }); }
    else if (i % 3 === 1) person([x, zl], YS, rot > 0 ? -Math.PI / 2 : Math.PI / 2, { carry: pick(['sack', 'basket']), beard: true });
    else woman([x, zl], YS, rand() * 6.28, { carry: 'pot' });
  }
  // basins: women filling jars, boys playing
  for (const x of [-92, -48, 36]) { woman([x - 1.5, Z + SIDE - 1.8], YS, face([x - 1.5, Z + SIDE - 1.8], [x, Z + SIDE - 0.6]), { pose: 'stand', carry: 'pot' }); child([x + 1.6, Z + SIDE - 1.9], YS, face([x + 1.6, Z + SIDE - 1.9], [x, Z + SIDE - 0.6]), { pose: 'squat' }); L.push({ t: 'pot', kind: 'water_pot', n: 2, at: [x - 0.9, Z + SIDE - 1.9], y: YS, seed: x + 700 }); }
  // before the Nymphaeum: people at the water, a camel drinking, the drovers
  beast('camel', [60.6, Z - 3.5], YS, Math.PI / 2, { gear: true }); beast('camel', [60.6, Z + 3.3], YS, Math.PI / 2, { gear: true });
  person([59.6, Z - 0.4], YS, Math.PI / 2, { carry: 'staff', pose: 'staff', beard: true, hat: 'turban', cloth: 'cloth_brown' });
  woman([61.2, Z + 0.9], YS, Math.PI / 2, { carry: 'pot' }); child([60.4, Z - 1.6], YS, Math.PI / 2, { pose: 'squat' });
  L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [60.8, Z + 1.9], y: YS, seed: 710 });

  // ── the forecourt before the Khazneh ──────────────────────────────────────────────────────────────────────────────────
  const [px, pz] = PLAZA.c, KZ = [px - 18, pz];
  const gaze = (x, z, o = {}) => person([x, z], on(x, z), face([x, z], KZ), o);
  for (const [dx, dz, o] of [[-9, -5, { pose: 'talk' }], [-8, -4, { pose: 'stand' }], [-5, 6, { pose: 'stand', beard: true }], [-6, 8, { pose: 'talk' }], [-12, 2, { pose: 'stand' }], [-3, -9, { pose: 'stand' }], [-11, -8, { pose: 'sit_ground' }], [-10, 9, { pose: 'sit_ground' }]]) gaze(px + dx, pz + dz, o);
  // a pilgrim kneeling before the shrine, a woman beside him
  person([px + 3.6, pz - 10.8], 0, dirRot(1, -0.55) + Math.PI, { pose: 'kneel', arms: 'pray', beard: true });
  woman([px + 5.4, pz - 9.6], 0, face([px + 5.4, pz - 9.6], [px + 5, pz - 12]), { pose: 'stand' });
  // the resting caravan in the south-east of the square: three camels with their loads on the ground beside them, the drivers, the donkeys and a dog
  for (const [dx, dz, r] of [[8, 9, 1.1], [10.5, 10.4, 1.7], [12.5, 8.2, 0.7]]) beast('camel', [px + dx, pz + dz], on(px + dx, pz + dz), r, { gear: true });
  L.push({ t: 'sacks', n: 4, at: [px + 6.4, pz + 11.3], y: 0, rot: 0.4, seed: 11 }); L.push({ t: 'basket', n: 3, at: [px + 8, pz + 12.6], y: 0, seed: 12 }); L.push({ t: 'pot', kind: 'amphora', n: 3, at: [px + 12.4, pz + 11.8], y: 0, seed: 13 });
  person([px + 9.2, pz + 12.4], 0, 3.5, { pose: 'cross', beard: true, hat: 'turban', cloth: 'cloth_brown' }); person([px + 11, pz + 12.2], 0, 3.0, { pose: 'sit_ground', beard: true, hat: 'turban' });
  beast('donkey', [px + 4.5, pz + 11.5], 0, 2.2, { gear: true }); beast('donkey', [px + 5.9, pz + 12.4], 0, 0.9, { gear: true }); beast('dog', [px + 7.7, pz + 13.8], 0, 0.5);
  // women at the basin, children
  woman([px + 3, pz + 13.3], 0, Math.PI, { pose: 'stand', carry: 'pot' }); woman([px - 0.6, pz + 13.4], 0, Math.PI, { pose: 'squat' }); child([px + 2.1, pz + 13.0], 0, Math.PI, { pose: 'stand' });
  L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [px - 2, pz + 13.2], y: 0, seed: 14 });
  // goats with a boy
  for (let i = 0; i < 4; i++) beast('goat', [px + 13 + i * 0.8, pz - 7 + (i % 2) * 1.2], 0, 1.5 + i * 0.4, { graze: i % 2 === 0 });
  child([px + 14.5, pz - 9], 0, face([px + 14.5, pz - 9], [px + 13.5, pz - 6]), { pose: 'staff', carry: 'staff' });

  // ── the Siq: along its floor, never in the line of sight to the Khazneh (the middle two metres) ──────────────────────────
  {
    const pts = [], step = 9;
    let acc = 0;
    for (let i = 0; i + 1 < SIQ_LINE.length; i++) {
      const a = SIQ_LINE[i], b = SIQ_LINE[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (a[0] < 156 || a[0] > 296) { continue; }
      acc += l; if (acc < step) continue; acc = 0;
      const tl = l || 1, tx = (b[0] - a[0]) / tl, tz = (b[1] - a[1]) / tl; pts.push({ x: a[0], z: a[1], tx, tz, nx: -tz, nz: tx });
    }
    pts.forEach((q, i) => {
      const side = i % 2 ? 1 : -1, o = 3.6 + rand() * 1.1, x = q.x + q.nx * side * o, z = q.z + q.nz * side * o, fx = q.tx, fz = q.tz;
      const y = on(x, z);
      if (i % 4 === 0) { L.push({ t: 'firewood', at: [x, z], y, rot: Math.atan2(q.nx, q.nz) + 1.57, len: 0.9, seed: i }); L.push({ t: 'basket', n: 1, at: [x + fx * 1.4, z + fz * 1.4], y: on(x + fx * 1.4, z + fz * 1.4), seed: i + 3 }); }
      if (i % 5 === 1) { for (let g = 0; g < 3; g++) { const gx = x + fx * (g * 0.9), gz = z + fz * (g * 0.9); beast('goat', [gx, gz], on(gx, gz), rand() * 6.28, { graze: g !== 1 }); } child([x - fx * 1.6, z - fz * 1.6], on(x, z), face([x - fx * 1.6, z - fz * 1.6], [x, z]), { pose: 'staff', carry: 'staff' }); }
      if (i % 5 === 3) { beast('donkey', [x, z], y, Math.atan2(fx, fz) + (i % 2 ? 0 : Math.PI), { gear: true }); person([x - fx * 1.5, z - fz * 1.5], on(x - fx * 1.5, z - fz * 1.5), Math.atan2(-fx, -fz), { pose: 'staff', carry: 'staff', beard: true, hat: 'turban' }); }
      if (i % 6 === 2) { person([x, z], y, face([x, z], [x + q.nx * side * 3, z + q.nz * side * 3]), { pose: 'sit_ground', beard: true, hat: 'turban' }); L.push({ t: 'basket', n: 2, at: [x + fx * 0.9, z + fz * 0.9], y, seed: i + 9 }); L.push({ t: 'pot', kind: 'water_pot', at: [x - fx * 0.9, z - fz * 0.9], y, seed: i + 11 }); }
      if (i % 7 === 4) { woman([x, z], y, Math.atan2(-fx, -fz) * (i % 2 ? 1 : -1), { pose: 'stand', carry: 'pot' }); woman([x + fx * 1.2, z + fz * 1.2], on(x + fx * 1.2, z + fz * 1.2), Math.atan2(-fx, -fz), { pose: 'stand' }); }
      if (i % 3 === 0 && i > 2) person([q.x + q.nx * -side * (o - 0.5), q.z + q.nz * -side * (o - 0.5)], y, Math.atan2(-fx, -fz) + (i % 2 ? 0 : Math.PI), { pose: 'stand', beard: true });
      if (i % 8 === 6) beast('dog', [x + fx * 2, z + fz * 2], on(x + fx * 2, z + fz * 2), rand() * 6.28);
    });
  }

  // ── the Outer Siq: camps, stalls at the valley's mouth, loiterers ─────────────────────────────────────────────────────────
  {
    const P = OUTER.path, caravan = [[118, -110], [110, -96], [102, -84], [94, -74], [86, -64], [78, -55], [74.5, -51.5], [107.5, -93.5], [60, -38], [62.2, -40.6], [70, -46]];
    const ok = (x, z) => okOuter(x, z) && !caravan.some(([a, b]) => Math.hypot(a - x, b - z) < 4.5) && pathDist(x, z, OUTER.path) < OUTER.w / 2 - 3;
    for (let i = 0; i + 1 < P.length; i++) {
      const [ax, az] = P[i], [bx, bz] = P[i + 1], Ln = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / Ln, tz = (bz - az) / Ln, nx = -tz, nz = tx;
      for (let t = 5; t < Ln - 3; t += 8) {
        const sg = rand() < 0.5 ? -1 : 1, o = 3.5 + rand() * 7, x = ax + tx * t + nx * sg * o, z = az + tz * t + nz * sg * o;
        if (!ok(x, z)) continue;
        const y = on(x, z), r = rand();
        if (r < 0.18) { for (let g = 0; g < 5; g++) { const gx = x + (rand() - 0.5) * 3, gz = z + (rand() - 0.5) * 3; beast(rand() < 0.7 ? 'goat' : 'sheep', [gx, gz], on(gx, gz), rand() * 6.28, { graze: rand() < 0.6 }); } child([x + 2.4, z + 1], y, rand() * 6.28, { pose: 'staff', carry: 'staff' }); }
        else if (r < 0.36) { for (let c = 0; c < 2; c++) beast('camel', [x + c * 2.3, z + (rand() - 0.5)], on(x + c * 2.3, z), rand() * 6.28, { gear: true }); L.push({ t: 'sacks', n: 4, at: [x + 1, z + 2.6], y, rot: 0.5, seed: i * 50 + t }); L.push({ t: 'basket', n: 2, at: [x + 2.6, z + 2.8], y, seed: i * 50 + t + 1 }); person([x + 0.2, z + 3.4], y, rand() * 6.28, { pose: 'sit_ground', beard: true, hat: 'turban', cloth: 'cloth_brown' }); }
        else if (r < 0.5) { person([x, z], y, rand() * 6.28, { pose: 'stand', beard: true }); person([x + 1, z + 0.4], y, face([x + 1, z + 0.4], [x, z]), { pose: 'talk', beard: true }); }
        else if (r < 0.62) { beast('donkey', [x, z], y, rand() * 6.28, { gear: true }); woman([x + 1.3, z - 0.4], y, rand() * 6.28, { carry: 'basket' }); }
        else if (r < 0.72) { L.push({ t: 'firewood', at: [x, z], y, rot: 0.8, len: 1.2, seed: i * 31 + t }); L.push({ t: 'pot', kind: 'dark_pot', n: 2, at: [x + 1.1, z + 0.4], y, seed: i * 31 + t + 1 }); woman([x + 0.4, z + 1.4], y, rand() * 6.28, { pose: 'squat' }); }
        else if (r < 0.8) L.push({ t: 'sacks', n: 3, at: [x, z], y, rot: rand() * 3, seed: i * 17 + t });
      }
    }
    // the stalls at the valley's mouth where the Outer Siq meets the way to the street
    for (const [x, z, rot, goods] of [[52, -28, -0.6, ['pottery', 'baskets']], [47, -35, -0.4, ['heap', 'greens']], [56, -20, -1.0, ['bread', 'baskets']]]) {
      if (!okOuter(x, z)) continue;
      L.push({ t: 'stall', at: [x, z], y: on(x, z), rot, w: 2.6, d: 1.4, goods, awning: pick(['cloth_white', 'cloth_ochre', 'cloth_red']), seed: Math.floor(x * 3) });
      person([x - Math.sin(rot) * 1.0, z - Math.cos(rot) * 1.0], on(x, z), rot + Math.PI, { pose: 'sit_low', beard: true }); L.push({ t: 'stool', at: [x - Math.sin(rot) * 1.0, z - Math.cos(rot) * 1.0], y: on(x, z), rot: rot + Math.PI, seed: 5 });
    }
  }

  // ── the temples ───────────────────────────────────────────────────────────────────────────────────────────────────────
  {
    const [qx0, qz0, qx1] = QASR.rect, qc = (qx0 + qx1) / 2, [ax, az] = QASR.altar, gt = GREAT_TEMPLE, gc = (gt[0] + gt[2]) / 2;
    // the priest on the altar's platform at the hearth, worshippers at the foot of its stair, a child holding a dove-basket
    person([ax + 2.6, az + 0.3], 3.0, Math.PI / 2 + 3.14, { pose: 'stand', hat: 'turban', hatMat: 'cloth_white', cloth: 'cloth_white', over: 'cape', beard: true });
    person([ax - 7.5, az - 1.1], 0.06, -Math.PI / 2 + 3.14, { pose: 'kneel', arms: 'pray', beard: true }); person([ax - 8.6, az + 1.2], 0.06, -Math.PI / 2 + 3.14, { pose: 'kneel', arms: 'pray', beard: true });
    woman([ax - 9.6, az - 2.8], 0.06, -Math.PI / 2 + 3.14, { pose: 'stand' }); child([ax - 9.4, az + 3.0], 0.06, 1.57, { pose: 'stand', carry: 'basket' }); person([ax - 12.4, az + 0.2], 0.06, 1.57, { pose: 'talk', beard: true });
    // Qasr al-Bint's naos: a priest by the platform's stair, a woman at prayer, an attendant
    person([qc - 3.2, qz0 + 14], 3.02, 0, { pose: 'stand', hat: 'turban', hatMat: 'cloth_white', cloth: 'cloth_white', beard: true }); woman([qc + 3.4, qz0 + 12.4], 3.02, 0.5, { pose: 'kneel', arms: 'pray' });
    // the Great Temple's naos
    person([gc - 4, gt[1] + 58], 5.92, 0.3, { pose: 'stand', hat: 'turban', hatMat: 'cloth_white', cloth: 'cloth_white', beard: true }); woman([gc + 5, gt[1] + 60], 5.92, 3.0, { pose: 'stand' }); person([gc + 0.5, gt[1] + 54.5], 5.92, 0, { pose: 'kneel', arms: 'pray', beard: true });
  }

  // ── the yards of the empty lots ──────────────────────────────────────────────────────────────────────────────────────────
  for (const yd of yards()) {
    const [x0, z0, x1, z1] = yd.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y = yd.y, r = rng(yd.seed), pk = (a) => a[Math.floor(r() * a.length)], k = yd.seed % 1000, dz = yd.gate === 's' ? 1 : -1;
    if (yd.kind === 'pen') {
      for (let i = 0; i < 6; i++) beast(i < 4 ? 'goat' : 'sheep', [x0 + 1.5 + r() * (x1 - x0 - 3), cz + (r() - 0.5) * 4], y, r() * 6.28, { graze: r() < 0.5 });
      beast('donkey', [x1 - 2.5, cz - dz * 1.6], y, 1.2, { gear: false }); child([cx, cz + dz * 2.2], y, r() * 6.28, { pose: 'staff', carry: 'staff' });
    } else if (yd.kind === 'orchard') {
      woman([cx - 2, cz + 1.2], y, r() * 6.28, { carry: 'basket' }); person([cx + 2.4, cz - 1.3], y, r() * 6.28, { carry: 'hoe', beard: true, dress: 'tunic' });
      L.push({ t: 'basket', n: 2, at: [x0 + 3.5, cz + 1.8], y, seed: k }); L.push({ t: 'pot', kind: 'water_pot', n: 2, at: [x1 - 1.6, cz + 2], y, seed: k + 1 });
    } else if (yd.kind === 'threshing') {
      beast('ox', [cx + 2.2, cz], y, 1.6, { gear: true }); beast('ox', [cx - 2.0, cz + 1.2], y, 4.6, { gear: true }); person([cx, cz + 0.2], y, 1, { carry: 'staff', pose: 'staff', beard: true, dress: 'tunic', hat: 'cap' }); woman([x1 - 2.0, z1 - 2.3], y, 3.5, { pose: 'squat' });
      L.push({ t: 'sacks', n: 5, at: [x0 + 2.0, z1 - 2], y, rot: 0.3, seed: k }); L.push({ t: 'basket', n: 2, at: [x0 + 3.6, z1 - 1.8], y, seed: k + 1 });
    } else if (yd.kind === 'potter') {
      L.push({ t: 'stool', at: [cx - 1.5, cz + 1.4], y, rot: 0, seed: k }); person([cx - 1.5, cz + 1.4], y, 0.4, { pose: 'sit_low', beard: true, dress: 'tunic' });
      for (let i = 0; i < 6; i++) L.push({ t: 'pot', kind: pk(['dark_pot', 'water_pot', 'amphora', 'zir']), n: 2, at: [x0 + 1.4 + i * 0.85, yd.gate === 's' ? z1 - 1.75 : z0 + 0.95], y: y + 0.77, seed: k + i });
      L.push({ t: 'pot', kind: 'pithos', at: [cx + 0.5, cz - dz * 1.8], y, seed: k + 20 }); L.push({ t: 'firewood', at: [x1 - 3.4, cz - dz * 1.0], y, rot: 1.57, len: 1.4, seed: k + 21 });
    } else if (yd.kind === 'cistern') {
      woman([cx - 4.4, cz - 1.6], y, Math.PI / 2, { pose: 'stand', carry: 'pot' }); woman([cx - 4.4, cz + 1.6], y, Math.PI / 2, { pose: 'squat' }); child([cx - 3.4, cz], y, Math.PI / 2, { pose: 'stand' });
      L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [cx - 4.6, cz + 0.2], y, seed: k }); beast('donkey', [cx + 1.5, cz + dz * 3.2], y, 0.2, { gear: true });
    } else if (yd.kind === 'tents') {
      for (let i = 0; i < 4; i++) beast('goat', [x0 + 1.5 + r() * (x1 - x0 - 3), cz + dz * (3.4 + r() * 1.5)], y, r() * 6.28, { graze: r() < 0.5 });
      woman([cx - 1.4, cz + dz * 3.0], y, r() * 6.28, { pose: 'cross' }); child([cx + 1.2, cz + dz * 3.4], y, r() * 6.28, { pose: 'sit_ground' }); beast('dog', [cx + 3, cz + dz * 3.8], y, r() * 6.28); beast('camel', [x1 - 2.2, cz - dz * 2.0], y, 0.6, { gear: false });
    }
  }
  return L;
}
