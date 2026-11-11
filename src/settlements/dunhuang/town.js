// The oasis town (docs/settlements/dunhuang.md §6, §7): rows of rammed-earth houses on both sides of the main
// street and along back lanes between the cross lanes, a wall round the town with the east gate, the caravanserai
// with camels and loads, the market's awnings and stalls, the painters, monks and pilgrims at the cliff foot.
import { RADIUS, XF, FLOOR, STREET, CROSS, LANE_W, TOWN, SERAI, GATE, CAVES, rng, inRect, riverX } from './layout.js';
import '../../styles/dunhuang/index.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [14, 0], facing: 'w' } });
const clash = (r, o, m = 0.5) => !(r[2] + m <= o[0] || r[0] - m >= o[2] || r[3] + m <= o[1] || r[1] - m >= o[3]);
const SERAI_R = [SERAI.x0, SERAI.z0, SERAI.x1, SERAI.z1];
/** The segments of the town along the street between the cross lanes: [x0, x1]. */
const SEG = (() => { const xs = [TOWN[0], ...CROSS.flatMap((c) => [c - LANE_W / 2, c + LANE_W / 2]), TOWN[2]], out = []; for (let i = 0; i < xs.length; i += 2) out.push([xs[i], xs[i + 1]]); return out; })();
/** Every lot: { rect, front, left }, exported for the movers and the smoke. */
export function lots() {
  const rand = rng(850), out = [];
  const rows = [
    { z0: -20, z1: -6, front: 's' }, { z0: -38.5, z1: -24.1, front: 's' }, { z0: -58.5, z1: -43.1, front: 's', back: true },
    { z0: 6, z1: 20, front: 'n' }, { z0: 24.1, z1: 38.5, front: 'n' }, { z0: 43.1, z1: 58.5, front: 'n', back: true },
  ];
  for (const row of rows) for (const [a, b] of SEG) {
    let x = a, first = true;
    while (b - x > 7) {
      const w = Math.min(b - x, 8 + rand() * 5), rest = b - (x + w);
      const W = rest < 7 ? b - x : w;
      const r = [x, row.z0, x + W, row.z1];
      x += W;
      if (clash(r, SERAI_R, 1.5) || (row.back && rand() < 0.25)) { first = false; continue; }
      out.push({ rect: r, front: row.front, left: first, seed: Math.round(r[0] * 13 + r[1] * 7), rich: Math.abs((r[0] + r[2]) / 2 - 60) < 55 && Math.abs(row.z0) < 30 && rand() < 0.38, two: rand() < 0.16 && Math.abs(row.z0) < 30 });
      first = false;
    }
  }
  return out;
}

export async function town() {
  const E = [], L = [], rand = rng(851);
  for (const lot of lots()) E.push({ t: 'dh_house', rect: lot.rect, front: lot.front, seed: lot.seed, tiled: lot.rich, storeys: lot.two ? 2 : 1, left: lot.left });
  // the wall round the town: the east side with the gate, the north and south sides pierced by the lanes
  const [wx0, wz0, wx1, wz1] = TOWN;
  const w = (a, b) => E.push({ t: 'dh_wall', a, b, h: 3.6, th: 0.9 });
  w([wx1, wz0], [wx1, -GATE.z - 3.2]); w([wx1, 3.2], [wx1, wz1]);
  for (const z of [wz0, wz1]) {
    let x = wx0;
    for (const c of CROSS) { w([x, z], [c - LANE_W / 2, z]); x = c + LANE_W / 2; }
    w([x, z], [wx1, z]);
  }
  E.push({ t: 'dh_gate', at: [GATE.x, GATE.z] });
  E.push({ t: 'dh_serai', ...SERAI });
  E.push({ t: 'dh_spring' });
  // the market: awnings on both sides of the street between the first two cross lanes
  const cl = ['cloth_ochre', 'cloth_red', 'cloth_blue', 'cloth_white', 'cloth_green'];
  for (let x = 30, k = 0; x < 66; x += 9, k++) { E.push({ t: 'dh_awning', a: [x, -5.95], b: [x + 7, -5.95], dir: [0, 1], depth: 2.1, cloth: cl[k % 5] }); E.push({ t: 'dh_awning', a: [x + 1, 5.95], b: [x + 8, 5.95], dir: [0, -1], depth: 2.1, cloth: cl[(k + 2) % 5] }); }
  // ── the life
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_brown', 'cloth_grey', 'cloth_blue', 'cloth_ochre'][Math.floor(rand() * 4)], over: 'sash', skin: 'skin_medium', hat: 'none', hair: 'short', feet: 'shod', ...o });
  const sogdian = (at, y, rot, o = {}) => man(at, y, rot, { dress: 'tunic', legs: 'hose', cloth: ['cloth_green', 'cloth_red', 'cloth_blue'][Math.floor(rand() * 3)], cloth2: 'cloth_white', hat: 'cap', over: 'belt', beard: rand() < 0.5, skin: 'skin_light', ...o });
  const monk = (at, y, rot, o = {}) => man(at, y, rot, { dress: 'robe', cloth: ['cloth_ochre', 'cloth_brown', 'cloth_grey'][Math.floor(rand() * 3)], cloth2: 'cloth_brown', over: 'shawl', hair: 'shaven', hat: 'none', feet: 'shod', ...o });
  // the market's stalls under the awnings (the stall's front is +z)
  for (let x = 30, k = 0; x < 66; x += 9, k++) {
    L.push({ t: 'stall', at: [x + 3.5, -6.4], y: 0, rot: 0, awning: cl[k % 5], goods: [['cloth', 'produce', 'basket'][k % 3]], w: 2.2, d: 1.4 });
    L.push({ t: 'stall', at: [x + 4.5, 6.4], y: 0, rot: Math.PI, awning: cl[(k + 2) % 5], goods: [['basket', 'cloth', 'produce'][k % 3]], w: 2.2, d: 1.4 });
    sogdian([x + 3.5, -7.5], 0, Math.PI, { pose: 'stand' }); man([x + 4.5, 7.6], 0, 0);
  }
  // the caravan at the serai's gate: Bactrian camels (the one-humped beast standing in), loaded, with drivers
  const cx = (SERAI.x0 + SERAI.x1) / 2;
  for (let k = 0; k < 5; k++) {
    const x = cx - 14 + k * 4.2, z = 8.9; L.push({ t: 'animal', kind: 'camel', at: [x, z], y: 0, rot: Math.PI / 2 + 0.05 * k, seed: 40 + k, gear: true });
    if (k % 2 === 0) L.push({ t: 'sacks', at: [x + 1.6, z + 0.9], y: 0, rot: 0.4, n: 4, seed: k });
  }
  sogdian([cx - 7.4, 9.8], 0, -Math.PI / 2, { carry: 'staff' }); sogdian([cx + 1, 9.9], 0, 0.2, { pose: 'talk' }); sogdian([cx + 2.0, 10.4], 0, -2.9, { pose: 'talk' });
  // the yard: camels kneeling (standing) in the stalls, bales and sacks, a woman at the well
  for (let k = 0; k < 4; k++) L.push({ t: 'animal', kind: 'camel', at: [SERAI.x1 - 3.4, SERAI.z0 + 5 + k * 4.5], y: 0, rot: Math.PI, seed: 60 + k, gear: false, graze: k % 2 === 0 });
  for (const [x, z] of [[cx - 7, 21], [cx + 4, 33], [cx - 4, 35], [cx + 8, 20]]) L.push({ t: 'sacks', at: [x, z], y: 0, rot: x, n: 5, seed: Math.round(x) });
  for (const [x, z] of [[cx - 9, 36], [cx + 6, 24]]) L.push({ t: 'crates', at: [x, z], y: 0, rot: 0.3, n: 4, seed: Math.round(z) });
  sogdian([cx + 2.2, 30], 0, 3.0, { carry: 'pot' });
  // the cliff-foot: a monk reading at the apron's edge, painters on the scaffold, pilgrims, a sculptor
  const AX = XF + 3.5;
  for (const [z, rot] of [[-60, -Math.PI / 2], [75, -Math.PI / 2], [95, -Math.PI / 2]]) monk([AX + 0.4, z], 0.45, rot, { pose: 'stand', carry: 'staff' });
  monk([AX - 1.0, -64], 0.45, -Math.PI / 2, { pose: 'cross' }); monk([AX - 1.0, 63], 0.45, -Math.PI / 2, { pose: 'pray' });
  for (let j = 1; j <= 3; j++) { man([XF + 1.2, -70 + (j - 2) * 2.4], j * 2.5, -Math.PI / 2, { dress: 'tunic', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_brown', hat: 'cap', over: 'apron', pose: 'stand', carry: 'staff', staffMat: 'timber' }); L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [XF + 0.8, -68.5 + (j - 2) * 2.4], y: j * 2.5, seed: j }); }
  for (const [x, z] of [[XF + 5.0, -44], [XF + 5.5, -34], [XF + 4.5, -48], [XF + 5, 36], [XF + 4.2, 8], [XF + 6, 18], [XF + 3.5, -20]]) man([x, z], 0.45, -Math.PI / 2 + (rand() - 0.5) * 1.2, { pose: rand() < 0.5 ? 'pray' : 'stand', dress: rand() < 0.5 ? 'robe' : 'tunic', hat: rand() < 0.5 ? 'cap' : 'none' });
  // offerings at the foot of the great hall: incense, jars of oil
  for (const z of [-5, 5]) L.push({ t: 'pot', kind: 'water_pot', n: 2, at: [XF + 3.2, z], y: 0.45, seed: 9 + z });
  // the street: a donkey with panniers at a lane's mouth, a dog, a cart of fodder; people along it are the movers'
  L.push({ t: 'animal', kind: 'donkey', at: [22, 7.6], y: 0, rot: 1.2, seed: 11, gear: true });
  for (let k = 0; k < 6; k++) { const x = -20 + rand() * 150, z = (rand() < 0.5 ? -1 : 1) * (6 + rand() * 40); if (L.every((p) => !p.at || Math.hypot(p.at[0] - x, p.at[1] - z) > 3) && !lots().some((l) => inRect(l.rect, x, z, 0.5))) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  void face; void CAVES; void FLOOR; void STREET; void riverX;
  return [base('dunhuang-town', 'dunhuang', E), base('dunhuang-people', 'life', L)];
}
