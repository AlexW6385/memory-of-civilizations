// Coaches and pilgrims (docs/settlements/baroque-rome.md §5): a cardinal's coach waiting before the steps, an
// ambassador's crossing the oval, a coach in the Borgo Nuovo, a sedan chair set down with its bearers; pilgrims
// with their staffs, broad hats and capes about the obelisk, the fountains and the steps, some kneeling; beggars
// by the colonnade; a seller of rosaries and medals. Pure data: the coaches are the baroque style's, the rest the
// shared objects (life).

import { OVAL, FRONT_X, FLOOR, BORGO, GARDEN, TIBER, rows, frontPt, lots, tiberX, height, CROSSING } from './layout.js';

const plan = (id, style, elements, bounds, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements, ...extra });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A local point (lx, lz) of something at (x, z) turned by rot (as rotateY), in the world. */
const at = (x, z, rot, lx, lz) => [x + lx * Math.cos(rot) + lz * Math.sin(rot), z - lx * Math.sin(rot) + lz * Math.cos(rot)];

export function streetPlans() {
  const C = [], L = [], rand = rng(1670), PLAN_EXTRA = [];
  const livery = (seed, o) => ({ t: 'figure', seed, dress: 'robe', legs: 'hose', skin: 'skin_light', cloth: 'cloth_red', cloth2: 'cloth_black', hat: 'brim', over: 'cape', ...o });
  const coachAt = (x, z, rot, o = {}) => {
    C.push({ t: 'coach', at: [x, z], rot, y: 0, ...o });
    for (const s of [-1, 1]) L.push({ t: 'animal', kind: 'horse', at: at(x, z, rot, s * 0.62, -3.55), rot, seed: Math.floor(x * 31 + z * 7 + s * 101), mat: o.horse ?? 'hide_black', graze: false, gear: false });
    L.push(livery(Math.floor(x * 3 + z), { at: at(x, z, rot, 0, -1.6), rot, y: 1.2, pose: 'sit', cloth: o.livery ?? 'cloth_red' }));
    if (o.footmen) for (const s of [-1, 1]) L.push(livery(Math.floor(x * 5 + z + s), { at: at(x, z, rot, s * 0.25, 1.85), rot, y: 1.12, pose: 'stand', cloth: o.livery ?? 'cloth_red' }));
  };
  // a cardinal's coach before the steps, facing the church, its footmen; an ambassador's in the oval; one in the Borgo Nuovo
  coachAt(FRONT_X + 58, 24, Math.PI / 2, { footmen: true, cloth: 'cloth_red', livery: 'cloth_red' });
  coachAt(OVAL.c[0] + 30, -52, 0.35, { body: 'wood_painted', cloth: 'cloth_indigo', livery: 'cloth_indigo', footmen: true, horse: 'hide_grey' });
  coachAt(150, BORGO[0], -Math.PI / 2, { cloth: 'cloth_green', livery: 'cloth_green', horse: 'hide_brown' });
  // a sedan chair set down near the steps, its two bearers standing at the poles
  const sx = FRONT_X + 50, sz = -20, sr = Math.PI / 2;
  C.push({ t: 'sedan_chair', at: [sx, sz], rot: sr, y: 0, cloth: 'cloth_red' });
  for (const lz of [-1.75, 1.75]) L.push(livery(Math.floor(lz * 10 + 7), { at: at(sx, sz, sr, 0.9, lz), rot: sr + (lz < 0 ? 0 : Math.PI), y: 0, pose: 'talk', hat: 'cap', over: 'none', cloth: 'cloth_brown', cloth2: 'cloth_brown' }));
  // pilgrims: in groups, with the staff, the broad hat and the short cape; some kneeling toward the church
  const pilgrim = (x, z, rot, o = {}) => L.push({ t: 'figure', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', legs: 'hose', skin: rand() < 0.8 ? 'skin_light' : 'skin_medium',
    cloth: ['cloth_brown', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_ochre'][Math.floor(rand() * 5)], cloth2: 'cloth_brown', hat: rand() < 0.75 ? 'brim' : 'veil', over: 'cape', carry: rand() < 0.7 ? 'staff' : 'none', ...o });
  const groups = [[OVAL.c[0] - 12, 8, 5], [OVAL.c[0] + 10, -14, 4], [OVAL.c[0] - 4, 44, 3], [OVAL.c[0] - 2, -48, 4], [-40, -10, 6], [-55, 18, 4], [OVAL.c[0] + 52, 14, 5], [OVAL.c[0] + 85, -6, 4]];
  for (const [gx, gz, n] of groups) {
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + rand(), r = 0.9 + rand() * 0.6, x = gx + Math.cos(a) * r, z = gz + Math.sin(a) * r;
      const kneel = gx < 0 && i === 0;
      pilgrim(x, z, kneel ? Math.PI / 2 : Math.atan2(x - gx, z - gz) + Math.PI, kneel ? { pose: 'kneel', arms: 'pray', carry: 'none' } : { pose: rand() < 0.5 ? 'talk' : 'stand' });
    }
  }
  for (let i = 0; i < 9; i++) pilgrim(OVAL.c[0] + 110 - i * 9 + rand() * 2, (rand() - 0.5) * 6, Math.PI / 2 + (rand() - 0.5) * 0.4, { pose: 'stand' });   // walking in from the Borgo toward the church
  // beggars on the ground by the colonnade's inner columns, a seller of rosaries and medals at a stall
  for (const [x, z] of [[OVAL.c[0] - 30, -78], [OVAL.c[0] + 28, 80], [OVAL.c[0] - 52, 62]]) L.push({ t: 'figure', at: [x, z], y: 0, rot: Math.atan2(OVAL.c[0] - x, OVAL.c[1] - z) + Math.PI, seed: Math.floor(x * 11 + z), pose: 'ground', dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_brown', skin: 'skin_medium', hat: 'none', over: 'cape', feet: 'bare' });
  L.push({ t: 'stall', at: [OVAL.c[0] + 40, 46], rot: -2.3, seed: 77, awning: 'cloth_white', goods: ['basket', 'cloth', 'basket'], w: 2.2, d: 1.2 });
  L.push({ t: 'figure', at: at(OVAL.c[0] + 40, 46, -2.3, 0, -1.2), y: 0, rot: -2.3 + Math.PI, seed: 78, pose: 'stand', dress: 'robe', cloth: 'cloth_black', skin: 'skin_light', hat: 'cap', over: 'none' });
  // the keepers of the botteghe that can be entered, behind their counters, a customer before each; and women at the wall fountains
  const sc = (o) => ({ t: 'figure', y: 0, skin: 'skin_light', ...o });
  const doors = (row, u) => {
    const kp = frontPt(row, u.u0 + (u.flip ? 1.3 : u.w - 1.3), 4.3), cu = frontPt(row, u.u0 + u.w / 2 + 0.5, 1.6);
    L.push(sc({ at: kp.at, y: 0.05, rot: kp.out, seed: u.seed, pose: 'stand', dress: 'tunic', legs: 'hose', cloth: u.trade === 'baker' ? 'cloth_white' : 'cloth_brown', cloth2: 'cloth_white', hat: 'cap', over: 'apron', hair: 'short' }));
    L.push(sc({ at: cu.at, y: 0.05, rot: cu.out + Math.PI, seed: u.seed + 1, pose: 'talk', dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_white', hat: 'veil', over: 'shawl' }));
    if (u.trade === 'osteria') for (const [k, d] of [[0, 1.7], [1, 2.3]]) { const sp = frontPt(row, u.u0 + 0.55, d); L.push(sc({ at: sp.at, y: 0.05, rot: sp.out + Math.PI / 2, seed: u.seed + 20 + k, pose: 'sit', dress: 'tunic', legs: 'hose', cloth: k ? 'cloth_green' : 'cloth_ochre', cloth2: 'cloth_brown', hat: 'brim', over: 'cloak' })); }
  };
  const prop = (kind, a, rot, seed, extra = {}) => L.push({ t: kind, at: a, y: 0, rot, seed, ...extra });
  const KINDS = ['barrel', 'crates', 'firewood', 'sacks', 'basket', 'stool'];
  for (const row of rows()) for (const u of row.units) {
    const rr = rng(u.seed + 99), out = row.face === 'n' ? 0 : Math.PI;
    if (u.open) doors(row, u);
    if (u.kind !== 'casa') {
      // a porter on the palazzo's step, his staff in his hand
      const p = frontPt(row, u.u0 + u.w / 2 + 2.2, -0.9);
      if (rr() < 0.6) L.push(sc({ at: p.at, rot: p.out + 0.3, seed: u.seed + 3, pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_black', hat: 'cap', over: 'cape', carry: 'staff' }));
      continue;
    }
    if (u.fountain) continue;
    // goods and gear by the front, a cat on the step
    prop(KINDS[Math.floor(rr() * KINDS.length)], frontPt(row, u.u0 + 0.5 + rr() * (u.w - 1), -0.7 - rr() * 0.3).at, rr() * 6.28, u.seed + 7);
    if (rr() < 0.5) prop(KINDS[Math.floor(rr() * 4)], frontPt(row, u.u0 + 0.5 + rr() * (u.w - 1), -0.8).at, rr() * 6.28, u.seed + 8);
    if (u.cat) L.push({ t: 'animal', kind: 'cat', at: frontPt(row, u.u0 + u.w * 0.5, -0.5).at, y: 0, rot: out + 1, seed: u.seed + 9 });
    // the trade at the door: the cobbler at his stool, men on the osteria's bench, women talking, the baker's boy
    if (u.trade === 'cobbler' && !u.open) { const c = frontPt(row, u.u0 + u.w * 0.5 + 1.2, -1.1).at; prop('stool', c, 0, u.seed + 11); L.push(sc({ at: c, rot: out, seed: u.seed + 12, pose: 'sit', dress: 'tunic', legs: 'hose', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', over: 'apron' })); }
    else if (u.trade === 'osteria' && !u.open) { const c = frontPt(row, u.u0 + u.w * 0.5, -0.9).at; prop('bench', c, out, u.seed + 13); for (const s of [-0.5, 0.5]) L.push(sc({ at: frontPt(row, u.u0 + u.w * 0.5 + s, -0.9).at, rot: out, seed: u.seed + 14 + s * 4, pose: 'sit', dress: 'tunic', legs: 'hose', cloth: s > 0 ? 'cloth_indigo' : 'cloth_brown', cloth2: 'cloth_black', hat: 'brim', over: 'cloak' })); }
    else if (rr() < 0.3) { for (const [k, cl] of [[0, 'cloth_black'], [1, 'cloth_ochre']]) L.push(sc({ at: frontPt(row, u.u0 + u.w * 0.3 + k * 0.8, -1.6 - k * 0.2).at, rot: out + (k ? -2.6 : 2.6), seed: u.seed + 15 + k, pose: 'talk', dress: 'robe', cloth: cl, cloth2: 'cloth_white', hat: 'veil', over: 'shawl' })); }
    if (u.trade === 'baker' && rr() < 0.7) L.push(sc({ at: frontPt(row, u.u0 + u.w * 0.7, -1.4).at, rot: out + 0.5, seed: u.seed + 17, pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_brown', hat: 'cap', over: 'apron', carry: 'basket', child: true }));
  }
  // the fronted lots about the Borgo: the same goods and gear
  for (const l of lots()) {
    if (!l.fronted) continue;
    const rr = rng(l.seed + 5), n = l.front === 'n', w = l.rect[2] - l.rect[0], out = n ? 0 : Math.PI;
    const P = (u, d) => (n ? [l.rect[2] - u, l.rect[1] + d] : [l.rect[0] + u, l.rect[3] - d]);
    if (rr() < 0.65) prop(KINDS[Math.floor(rr() * 5)], P(0.8 + rr() * (w - 1.6), -0.8), rr() * 6.28, l.seed + 3);
    if (rr() < 0.2) L.push({ t: 'animal', kind: 'cat', at: P(w * 0.5, -0.5), y: 0, rot: out + 1, seed: l.seed + 4 });
    if (rr() < 0.18) L.push(sc({ at: P(w * 0.4, -1.6), rot: out + 2.4, seed: l.seed + 6, pose: 'talk', dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'veil', over: 'shawl' }));
  }
  // Swiss guards in the slashed doublets with their halberds at the colonnade's two mouths and on the sagrato
  const guard = (x, z, rot, y = 0) => L.push(sc({ at: [x, z], y, rot, seed: Math.floor(x * 5 + z), pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_ochre', hat: 'cap', over: 'cape', carry: 'staff', len: 2.3 }));
  for (const s of [-1, 1]) { guard(OVAL.c[0] + 62, s * 38, s > 0 ? Math.PI - 0.4 : 0.4); guard(OVAL.c[0] + 64.5, s * 36, s > 0 ? Math.PI - 0.4 : 0.4); guard(FRONT_X + 3, s * 9, Math.PI / 2, FLOOR + 0.05); guard(FRONT_X + 3, s * 12.5, Math.PI / 2, FLOOR + 0.05); }
  // people on the steps and the sagrato: sitting at the edge of a flight, pilgrims resting
  for (let i = 0; i < 9; i++) { const x = FRONT_X + 10.5 + rand() * 12, z = (rand() - 0.5) * 60, g = Math.max(0, Math.min(FLOOR, (FRONT_X + 23 - x) / 22 * FLOOR)); L.push(sc({ at: [x, z], y: g, rot: Math.PI / 2 + (rand() - 0.5) * 1.2, seed: Math.floor(rand() * 1e9), pose: rand() < 0.4 ? 'sit_low' : 'stand', dress: 'robe', legs: 'hose', cloth: ['cloth_brown', 'cloth_black', 'cloth_grey', 'cloth_ochre'][Math.floor(rand() * 4)], cloth2: 'cloth_brown', hat: rand() < 0.6 ? 'brim' : 'veil', over: 'cape', carry: rand() < 0.3 ? 'staff' : 'none' })); }
  // the market at the Borgo's mouth: stalls of fruit and bread, the sellers behind and a buyer before each, a water-seller with his yoke, a handcart, two carts
  const stalls = [[108, -19, 0, 'heap'], [114, 16, Math.PI, 'bread'], [122, -22, 0, 'greens'], [104, 19, Math.PI, 'melons'], [128, 19.5, Math.PI, 'fish'], [96, -8, Math.PI / 2, 'bolts']];
  for (const [x, z, rot, g] of stalls) {
    L.push({ t: 'stall', at: [x, z], rot, seed: Math.floor(x * 3 + z), awning: g === 'bolts' ? 'cloth_red' : rand() < 0.5 ? 'cloth_white' : 'cloth_ochre', goods: [g, 'basket'], w: 2.6, d: 1.3 });
    L.push(sc({ at: at(x, z, rot, 0, -1.35), rot: rot + Math.PI, seed: Math.floor(x * 7 + z), pose: 'stand', dress: rand() < 0.5 ? 'robe' : 'tunic', legs: 'hose', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: rand() < 0.5 ? 'veil' : 'cap', over: 'apron' }));
    L.push(sc({ at: at(x, z, rot, rand() * 1.5 - 0.75, 1.7), rot, seed: Math.floor(x * 9 + z), pose: 'talk', dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', over: 'cloak' }));
  }
  L.push(sc({ at: [118, -3], rot: 0.6, seed: 301, pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'cap', over: 'none', carry: 'yoke' }));
  L.push({ t: 'handcart', at: [112, 6], y: 0, rot: 0, seed: 303, load: 'baskets' });
  L.push(sc({ at: [112, 4.2], rot: Math.PI, seed: 304, pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_ochre', cloth2: 'cloth_brown', skin: 'skin_medium', hat: 'cap', over: 'apron' }));
  L.push({ t: 'cart', at: [180, -19], y: 0, rot: 0.05, seed: 305, kind: 'two', load: 'barrels', beast: 'donkey' });
  L.push({ t: 'cart', at: [205, 17], y: 0, rot: Math.PI, seed: 306, kind: 'four', load: 'sacks' });
  // the Vatican gardens' gardeners at their clipped box, and two friars at the fountain
  const LG = [], LR = [], gx = (GARDEN[0] + GARDEN[2]) / 2, gz = (GARDEN[1] + GARDEN[3]) / 2;
  for (const [dx, dz, pose] of [[-18, -9, 'squat'], [13, 9, 'stand'], [-5, 10, 'squat'], [22, -8, 'stand']]) LG.push(sc({ at: [gx + dx, gz + dz], rot: rand() * 6, seed: Math.floor(rand() * 1e9), pose, dress: 'tunic', legs: 'hose', cloth: 'cloth_green', cloth2: 'cloth_brown', hat: 'brim', over: 'apron' }));
  LG.push(sc({ at: [gx + 3, gz + 3.4], rot: 3.3, seed: 311, pose: 'talk', dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'none', over: 'sash', hair: 'shaven' }));
  LG.push(sc({ at: [gx + 5, gz + 4.6], rot: 3.3 + Math.PI, seed: 312, pose: 'talk', dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'brim', over: 'sash' }));
  // the river: fishermen in their rowboats, a barge with its load and crew, washerwomen on the bank with their lines
  const W2 = TIBER.w / 2;
  for (const [z, k] of [[-120, 0], [60, 1], [150, 2]]) {
    const x = tiberX(z) - W2 + 3, y = TIBER.level + 0.2;
    LR.push({ t: 'boat', kind: 'rowboat', at: [x, z], y, rot: Math.PI / 2 + k * 0.3, seed: 400 + k });
    LR.push(sc({ at: [x, z], y: y + 0.28, rot: Math.PI / 2 + k * 0.3 + Math.PI, seed: 410 + k, pose: 'sit', dress: 'tunic', legs: 'hose', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'brim', over: 'none' }));
  }
  for (const [z, k] of [[-20, 0], [100, 1]]) {
    const x = tiberX(z) + 6; LR.push({ t: 'boat', kind: 'barge', at: [x, z], y: TIBER.level + 0.35, rot: 0.05 + k, seed: 420 + k });
    for (let q = 0; q < 3; q++) LR.push(sc({ at: [x + (q - 1) * 0.9, z + (q - 1) * 2.2], y: TIBER.level + 0.65, rot: q * 2, seed: 430 + q + k * 5, pose: q === 1 ? 'sit' : 'stand', dress: 'tunic', legs: 'hose', cloth: ['cloth_ochre', 'cloth_indigo', 'cloth_brown'][q], cloth2: 'cloth_brown', hat: 'cap', over: 'none' }));
  }
  for (const z of [-170, -150, 110, 135]) {
    const x = tiberX(z) - W2 - 6 + rand() * 4, y = Math.max(0, height(x, z));
    for (let q = 0; q < 2; q++) LR.push(sc({ at: [x + q * 1.1, z + (rand() - 0.5) * 2], y, rot: Math.PI / 2 + rand(), seed: Math.floor(rand() * 1e9), pose: 'squat', dress: 'robe', cloth: q ? 'cloth_blue' : 'cloth_maroon', cloth2: 'cloth_white', hat: 'veil', over: 'shawl' }));
    LR.push({ t: 'laundry', at: [x - 3, z], y, rot: 0, seed: Math.floor(z * 3), len: 5 });
  }
  // inside the church: pilgrims kneeling at the Confessio's rail and standing about the nave, penitents at the confessionals, a canon and priests, a guard at the baldacchino
  const LN = [], ccx = CROSSING[0], ccz = CROSSING[1];
  const pil = (x, z, rot, o = {}) => LN.push(sc({ at: [x, z], y: FLOOR + 0.05, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', legs: 'hose', skin: rand() < 0.85 ? 'skin_light' : 'skin_medium', cloth: ['cloth_brown', 'cloth_grey', 'cloth_black', 'cloth_ochre', 'cloth_maroon'][Math.floor(rand() * 5)], cloth2: 'cloth_brown', hat: rand() < 0.4 ? 'veil' : 'none', over: 'cape', ...o }));
  for (let i = 0; i < 7; i++) pil(ccx + 14.5 + rand() * 2.5, -3.6 + i * 1.2, Math.PI / 2 + 0, { pose: 'kneel', arms: 'pray', hat: i % 2 ? 'veil' : 'none' });
  for (let i = 0; i < 5; i++) pil(ccx + 6 + i * 1.8, -5.5, Math.PI, { pose: 'kneel', arms: 'pray' });
  for (let i = 0; i < 22; i++) { const x = ccx + 24 + rand() * 80, z = (rand() - 0.5) * 20; pil(x, z, rand() * 6.28, { pose: rand() < 0.3 ? 'talk' : 'stand', carry: rand() < 0.2 ? 'staff' : 'none', hat: rand() < 0.35 ? 'brim' : 'none' }); }
  for (const [z, k] of [[-34, 0], [27, 1], [41, 2]]) { pil(ccx + 13.05 - 1.1 - 0.1, ccz + z + 1.0, Math.PI / 2 * -1, { pose: 'kneel', arms: 'pray' }); pil(ccx - 13.05 + 1.1 + 0.1, ccz + z - 1.0, Math.PI / 2, { pose: 'kneel', arms: 'pray', hat: 'veil' }); void k; }
  LN.push(sc({ at: [ccx + 14.5, 6.5], y: FLOOR + 0.05, rot: Math.PI / 2, seed: 701, pose: 'stand', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', hat: 'cap', over: 'cape', hair: 'short' }));   // a canon in his mozzetta
  for (const [x, z, sd] of [[ccx + 30, -9, 702], [ccx + 52, 8, 703], [ccx + 70, -6, 704]]) LN.push(sc({ at: [x, z], y: FLOOR + 0.05, rot: sd, seed: sd, pose: 'stand', dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'brim', over: 'sash' }));
  for (const sg of [-1, 1]) LN.push(sc({ at: [ccx + 7, sg * 7.2], y: FLOOR + 0.05, rot: sg > 0 ? Math.PI : 0, seed: 710 + sg, pose: 'stand', dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_ochre', hat: 'cap', over: 'cape', carry: 'staff', len: 2.3 }));
  for (const [dx, dz] of [[0, 52], [4, 51], [-4, 51]]) LN.push(sc({ at: [ccx + dx, ccz - dz + 3], y: FLOOR + 0.05, rot: 0, seed: 720 + dx, pose: 'kneel', arms: 'pray', dress: 'robe', cloth: 'cloth_brown', hat: 'veil', over: 'shawl' }));
  PLAN_EXTRA.push(plan('baroque-rome-nave', 'life', LN, [-285, -70, -75, 70], { center: [-170, 0], near: 160 }));
  PLAN_EXTRA.push(plan('baroque-rome-gardens', 'life', LG, [GARDEN[0] - 30, GARDEN[1] - 30, GARDEN[2] + 30, GARDEN[3] + 30], { center: [gx, gz], near: 160 }),
    plan('baroque-rome-tiber-life', 'life', LR, [tiberX(0) - 50, -240, tiberX(0) + 50, 240], { center: [tiberX(0), 0], near: 300 }));
  L.push({ t: 'chickens', kind: 'pigeon', n: 12, at: [OVAL.c[0] + 18, 22], seed: 9 });
  L.push({ t: 'animal', kind: 'dog', at: [OVAL.c[0] + 60, -30], rot: 1.2, seed: 5 });
  return [
    plan('baroque-rome-coaches', 'baroque', C, [-100, -100, 200, 100], { center: [40, 0], near: 300 }),
    ...PLAN_EXTRA,
    plan('baroque-rome-pilgrims', 'life', L, [-100, -170, 250, 170], { center: [80, 0], near: 330 }),
  ];
}
