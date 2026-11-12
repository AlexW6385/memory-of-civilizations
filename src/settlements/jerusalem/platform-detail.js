// The Dome's platform furnished and peopled (docs/settlements/jerusalem.md §1e, §10c): the paving laid in a grid of
// carved joints with processional ways of marble from the four stairs to the Dome's doors and a marble border;
// the Dome of the Chain east of the Dome; a water station and shoe racks at the doors; and the crowd of the
// platform: ranks at prayer, readers at their stands, families and pairs strolling, pigeons. Pure data.

import { HARAM, HGATES } from './layout.js';
import { subtractRects } from '../../core/build.js';
import { PLATFORM } from './haram-detail.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const PY = HARAM.top + 4;
const DOME = [-28, -48, 28, 8];            // the Dome's footprint (octagon of apothem 25 about (0, -20)), joints stop at it
export const CHAIN = [40, -2];

export function platformFurnish() {
  const E = [], [px0, pz0, px1, pz1] = PLATFORM;
  const blk = (r, y1, mat) => { if (r[2] - r[0] > 0.01 && r[3] - r[1] > 0.01) E.push({ t: 'block', rect: r, y0: PY - 0.01, y1: PY + y1, mat, collide: false }); };
  const holes = [DOME, [CHAIN[0] - 7, CHAIN[1] - 7, CHAIN[0] + 7, CHAIN[1] + 7]];
  const cut = (r, y1, mat) => { for (const q of subtractRects(r, holes)) blk(q, y1, mat); };
  // the joints: carved lines every 7 m each way
  for (let x = px0 + 7; x < px1 - 1; x += 7) cut([x - 0.035, pz0 + 1.6, x + 0.035, pz1 - 1.6], 0.014, 'limestone_carved');
  for (let z = pz0 + 7; z < pz1 - 1; z += 7) cut([px0 + 1.6, z - 0.035, px1 - 1.6, z + 0.035], 0.014, 'limestone_carved');
  // the border: a marble band 0.9 m wide inside the edge, a line of carved stone either side
  for (const r of [[px0 + 0.4, pz0 + 0.4, px1 - 0.4, pz0 + 1.3], [px0 + 0.4, pz1 - 1.3, px1 - 0.4, pz1 - 0.4], [px0 + 0.4, pz0 + 1.3, px0 + 1.3, pz1 - 1.3], [px1 - 1.3, pz0 + 1.3, px1 - 0.4, pz1 - 1.3]]) blk(r, 0.02, 'marble_floor');
  // the ways: six metres of marble from each stair to the Dome's door, edged
  const ways = [[px0 + 1.3, -23, DOME[0] - 0.5, -17], [DOME[2] + 0.5, -23, px1 - 1.3, -17], [-3, pz0 + 1.3, 3, DOME[1] - 0.5], [-3, DOME[3] + 0.5, 3, pz1 - 1.3]];
  for (const w of ways) {
    const horiz = w[2] - w[0] > w[3] - w[1];
    for (const q of subtractRects(w, [[CHAIN[0] - 7, CHAIN[1] - 7, CHAIN[0] + 7, CHAIN[1] + 7]])) blk(q, 0.024, 'marble_floor');
    if (horiz) { cut([w[0], w[1] - 0.2, w[2], w[1]], 0.03, 'limestone_carved'); cut([w[0], w[3], w[2], w[3] + 0.2], 0.03, 'limestone_carved'); }
    else { blk([w[0] - 0.2, w[1], w[0], w[3]], 0.03, 'limestone_carved'); blk([w[2], w[1], w[2] + 0.2, w[3]], 0.03, 'limestone_carved'); }
  }
  // the Dome of the Chain; the waqf's water at the west stair's head, one more at the south; shoe racks at the doors
  E.push({ t: 'chain_dome', at: CHAIN, y: PY, r: 5.1 });
  E.push({ t: 'water_station', at: [-60, -29], dir: [0, 1], y: PY });
  E.push({ t: 'water_station', at: [58, -9], dir: [0, -1], y: PY });
  E.push({ t: 'shoe_rack', at: [-30.2, -26.5], dir: [-1, 0], y: PY, len: 2.4 });
  E.push({ t: 'shoe_rack', at: [-30.2, -13.5], dir: [-1, 0], y: PY, len: 2.4 });
  E.push({ t: 'shoe_rack', at: [30.2, -26.5], dir: [1, 0], y: PY, len: 2.4 });
  E.push({ t: 'shoe_rack', at: [-8.5, 12.5], dir: [0, 1], y: PY, len: 2.4 });
  E.push({ t: 'censer', at: [-27.5, -24.5], y: PY });
  // the readers' stands before the Dome's west and south doors
  for (const z of [-34, -6]) E.push({ t: 'quran_stand', at: [-33, z], dir: [-1, 0], y: PY });
  // the esplanade: waqf water and shoe racks at the Aqsa's doors, stone benches along the walks and at the Golden Gate, a bench by each cistern
  const ES = [];
  E.push({ t: 'water_station', at: [-30, 100.6], dir: [0, 1], y: HARAM.top + 0.05 }); E.push({ t: 'water_station', at: [30, 100.6], dir: [0, 1], y: HARAM.top + 0.05 });
  for (const x of [-18, -9, 9, 18]) E.push({ t: 'shoe_rack', at: [x, 99.2], dir: [0, 1], y: HARAM.top + 0.05, len: 2.4 });
  for (const [x, z, d] of [[-100, -23.2, [0, -1]], [-100, -14, [0, 1]], [-60, -86, [0, -1]], [60, -86, [0, -1]], [100, -26, [0, -1]], [100, -14, [0, 1]], [-40, 92, [0, -1]], [40, 92, [0, -1]], [HARAM.rect[2] - 14, HGATES.golden - 14, [0, 1]], [HARAM.rect[2] - 14, HGATES.golden + 14, [0, -1]], [-8, 60, [0, -1]], [8, 60, [0, -1]]]) E.push({ t: 'mastaba', at: [x, z], dir: d, y: HARAM.top + 0.05, len: 2.6 });
  void ES;
  // prayer mats under the ranks (laid below; the worshippers stand on them)
  const MATS = ['reed_mat', 'cloth_red', 'cloth_indigo', 'reed_mat'];
  for (const [cx, cz, nx, nr] of PRAYER) for (let r = 0; r < nr; r++) for (let k = 0; k < nx; k++) {
    const x = cx + (k - (nx - 1) / 2) * 1.05, z = cz + r * 1.7;
    E.push({ t: 'block', rect: [x - 0.38, z - 0.6, x + 0.38, z + 0.6], y0: PY, y1: PY + 0.02, mat: MATS[(k + r) % 4], collide: false });
  }
  return E;
}
/** The ranks at prayer: [centre x, first rank z, men in a rank, ranks]. They face south. */
const PRAYER = [[-48, -40, 7, 3], [-48, -9, 6, 2], [46, -52, 7, 3], [20, 18, 6, 2]];

const CL = ['cloth_white', 'cloth_white', 'linen', 'cloth_brown', 'cloth_indigo', 'cloth_ochre', 'cloth_grey', 'cloth_green', 'cloth_red'];
export function platformLife() {
  const E = [], rand = rng(755), pick = (a) => a[Math.floor(rand() * a.length)], [px0, pz0, px1, pz1] = PLATFORM;
  const onDome = (x, z) => x > DOME[0] - 1.5 && x < DOME[2] + 1.5 && z > DOME[1] - 1.5 && z < DOME[3] + 1.5;
  const near = (x, z) => Math.hypot(x - CHAIN[0], z - CHAIN[1]) < 8;
  const person = (x, z, rot, o = {}) => E.push({ t: 'figure', at: [x, z], y: PY, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), skin: pick(['skin_medium', 'skin_medium', 'skin_light']), hat: 'turban', hatMat: 'cloth_white', hair: 'short', beard: rand() < 0.6, feet: 'bare', ...o });
  const woman = (x, z, rot, o = {}) => person(x, z, rot, { hat: 'veil', hatMat: pick(['cloth_white', 'cloth_indigo', 'cloth_black']), cloth: pick(['cloth_indigo', 'cloth_black', 'cloth_brown', 'cloth_maroon']), beard: false, hair: 'long', ...o });
  const child = (x, z, rot, o = {}) => person(x, z, rot, { child: true, hat: rand() < 0.5 ? 'cap' : 'none', hatMat: 'cloth_white', beard: false, ...o });
  // the ranks at prayer: standing, bowing, some kneeling, the last rank a little ragged
  for (const [cx, cz, nx, nr] of PRAYER) for (let r = 0; r < nr; r++) for (let k = 0; k < nx; k++) {
    if (rand() < 0.12) continue;
    const x = cx + (k - (nx - 1) / 2) * 1.05 + (rand() - 0.5) * 0.12, z = cz + r * 1.7 + (rand() - 0.5) * 0.1;
    person(x, z, Math.PI, { pose: r % 2 ? 'kneel' : 'pray', arms: 'pray', cloth: pick(['cloth_white', 'linen', 'cloth_white', 'cloth_brown']) });
  }
  // an imam before each rank of the large two
  person(-48, -42.4, Math.PI, { pose: 'pray', arms: 'pray', cloth: 'cloth_white', hatMat: 'cloth_white' });
  person(46, -54.4, Math.PI, { pose: 'pray', arms: 'pray', cloth: 'cloth_white', hatMat: 'cloth_white' });
  // readers at the stands, one with a boy beside him; a man at the censer
  for (const z of [-34, -6]) { person(-34.4, z, Math.PI / 2, { pose: 'cross', cloth: 'cloth_white' }); child(-35.2, z + 1.0, Math.PI / 2, { pose: 'cross' }); }
  person(-26.8, -25.6, Math.PI / 2, { pose: 'stand', cloth: 'cloth_white', hatMat: 'cloth_white' });
  // the water stations: the attendant behind the bench, two waiting
  person(-60, -30.1, 0, { pose: 'stand', cloth: 'cloth_white', cloth2: 'cloth_green' });
  person(-61.2, -26.8, Math.PI, { pose: 'talk' }); woman(-58.6, -26.9, Math.PI, { carry: 'pot' });
  person(58, -10.1, Math.PI, { pose: 'stand', cloth: 'cloth_white', cloth2: 'cloth_green' }); person(57, -6.6, 0, { pose: 'talk' });
  // at the Chain: men sitting on the rim, a man at each side
  for (let k = 0; k < 5; k++) { const a = k * 1.25 + 0.4, R = 6.4; person(CHAIN[0] + Math.cos(a) * R, CHAIN[1] + Math.sin(a) * R, a + Math.PI / 2 + Math.PI, { pose: 'sit', y: PY + 0.2 }); }
  for (let k = 0; k < 4; k++) person(CHAIN[0] + (k - 1.5) * 1.6, CHAIN[1] - 2 + (k % 2) * 3.2, rand() * 6.28, { pose: k % 2 ? 'talk' : 'stand' });
  // seated groups on the paving: conversing on the ground in threes and fours, a child among them
  for (const [cx, cz] of [[-56, -52], [-52, -6], [-61, -14], [62, -37], [52, -66], [-40, 24], [35, 28], [10, -70], [-16, 30]]) {
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) { const a = k * 6.28 / n + rand() * 0.5, x = cx + Math.cos(a) * 1.5, z = cz + Math.sin(a) * 1.5; if (onDome(x, z)) continue; const f = Math.atan2(-(cx - x), -(cz - z)); k === n - 1 && rand() < 0.6 ? child(x, z, f, { pose: 'cross' }) : person(x, z, f, { pose: 'cross' }); }
  }
  // families and pairs strolling across it, spread over the ways and the flags, many near the west stair
  for (let k = 0; k < 74; k++) {
    const west = k < 40, x = west ? px0 + 3 + rand() * 50 : px0 + 3 + rand() * (px1 - px0 - 6), z = pz0 + 3 + rand() * (pz1 - pz0 - 6);
    if (onDome(x, z) || near(x, z) || Math.hypot(x + 67.6, z + 40) < 7) continue;
    const rot = rand() * 6.28, g = rand();
    if (g < 0.26) { person(x, z, rot, { pose: 'talk' }); person(x + 0.9, z + 0.3, rot + 2.7, { pose: 'talk' }); }
    else if (g < 0.5) { person(x, z, rot); woman(x + 1.0, z + 0.2, rot + 0.1); child(x + 0.5, z + 0.8, rot - 0.2); }
    else if (g < 0.62) woman(x, z, rot, { carry: pick(['pot', 'basket', 'none']) });
    else if (g < 0.72) person(x, z, rot, { carry: 'staff', pose: 'staff' });
    else person(x, z, rot, { pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  // pilgrims arriving up each stair: three on the steps, one pausing to look up at the Dome
  for (const [sx, sz, dx, dz] of [[-74, -20, 1, 0], [74, -20, -1, 0], [0, -84, 0, 1], [0, 44, 0, -1]]) for (let k = 0; k < 3; k++) {
    const x = sx + dx * k * 1.2 + (rand() - 0.5) * (dz ? 4 : 0.2), z = sz + dz * k * 1.2 + (rand() - 0.5) * (dx ? 4 : 0.2);
    E.push({ t: 'figure', at: [x, z], y: HARAM.top + 4 - 0.35 - (2 - k) * 0.5 + 0.5, rot: Math.atan2(-dx, -dz), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_medium', hat: 'turban', hatMat: 'cloth_white', pose: k === 1 ? 'staff' : 'stand', feet: 'bare' });
  }
  // pigeons on the flags: about the water stations, the Chain, the west door and the arrival's side
  for (const [x, z, n] of [[-52, -33, 9], [-40, -14, 7], [-62, -20, 8], [34, -30, 8], [8, -52, 7], [-14, 24, 8], [CHAIN[0] + 7, CHAIN[1] + 3, 6]]) E.push({ t: 'chickens', kind: 'pigeon', n, at: [x, z], y: PY, seed: Math.floor(x * 7 + z) });
  // the esplanade: men on the benches, a group at each water station, the Aqsa's forecourt thick with pilgrims at the doors
  const eper = (x, z, rot, o = {}) => E.push({ t: 'figure', at: [x, z], y: HARAM.top + 0.05, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_medium', hat: 'turban', hatMat: 'cloth_white', hair: 'short', beard: rand() < 0.6, feet: 'bare', ...o });
  for (const [x, z, d] of [[-100, -23.2, -1], [-100, -14, -1], [-60, -86, 1], [60, -86, 1], [100, -26, 1], [100, -14, -1], [-40, 92, 1], [40, 92, 1], [-8, 60, 1], [8, 60, 1]]) { eper(x - 0.5, z + d * 0.45, d > 0 ? 0 : Math.PI, { pose: 'sit', y: HARAM.top + 0.5 }); if (rand() < 0.6) eper(x + 0.6, z + d * 0.45, d > 0 ? 0 : Math.PI, { pose: 'sit', y: HARAM.top + 0.5 }); }
  for (const x of [-30, 30]) { eper(x, 98.7, Math.PI, { pose: 'stand', cloth: 'cloth_white', cloth2: 'cloth_green' }); eper(x - 1.1, 102.2, 0, { pose: 'talk' }); eper(x + 0.5, 102.6, 3.0, { pose: 'talk' }); }
  for (let k = 0; k < 40; k++) { const x = -42 + rand() * 84, z = 100.5 + rand() * 13; eper(x, z, rand() < 0.6 ? 0 : rand() * 6.28, { pose: rand() < 0.3 ? 'talk' : 'stand', hat: rand() < 0.2 ? 'veil' : 'turban', ...(rand() < 0.15 ? { child: true } : {}) }); }
  for (const [x, z, n] of [[-24, 103, 9], [0, 106, 10], [24, 103, 9], [-70, 8, 7], [HARAM.rect[2] - 20, HGATES.golden, 8], [-110, -4, 7], [60, 94, 6]]) E.push({ t: 'chickens', kind: 'pigeon', n, at: [x, z], y: HARAM.top + 0.05, seed: Math.floor(x * 3 + z) });
  void HGATES;
  return E;
}
