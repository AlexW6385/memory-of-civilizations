// Ming–Qing Beijing — the plans of the life (docs/settlements/qing-beijing.md §16–§23), for town.js
// to add to its list:   import { lifePlans } from './life.js';   …   return [..., ...(await lifePlans())];
// The shop booths of the avenue, the tea house and the pharmacy (their halls and their furnishing),
// courtyard houses furnished, a few still figures in the palace's courts (guards at the gates and a
// few officials at the foot of the terrace: no crowds), pigeons in the lanes. Positions come from
// layout.js; nothing is hard-coded but the buildings' places on the avenue (shops.js).
import './style.js';
import { betweenGates, RADIUS, AVENUE, HALLS, TIERS, RING, MOAT, LEVEL, TEMPLE, DANBI, SHOP_APRONS, CARRIAGE, WALK_UP, interiorShops, furnishedHouses, shopRows, houses, lanes } from './layout.js';
import { SHOP_SITES } from './shops.js';

const base = (id, style, elements, center = [0, 0]) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 215], facing: 'n' }, center, near: 230 });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_indigo', 'cloth_ochre', 'cloth_grey', 'cloth_brown', 'cloth_maroon'];
const face = ([dx, dz]) => Math.atan2(-dx, -dz);

export async function lifePlans() {
  const rand = rng(1699), out = [];
  // the booths (shops.js: only where no shop front stands)
  out.push(base('qing-beijing-shops', 'life', SHOP_SITES.map((s) => ({ t: 'bj_booth', at: s.at, y: 0.04, rot: s.rot, trade: s.trade, seed: s.seed, w: s.w })), [0, 295]));
  // the tea house and the pharmacy: furnished inside shops of the shop street (shopfront.js qing_shop with `enter`, picked by layout.js interiorShops);
  // the room's frame runs from the shop's back wall to its counter line, the floor at the shop's plinth (0.3)
  const ins = interiorShops().filter((s) => s.side === 'w');
  out.push(base('qing-beijing-interiors-shops', 'life', ins.map((s) => ({ t: s.kind === 'teahouse' ? 'bj_teahouse' : s.kind === 'pharmacy' ? 'bj_pharmacy' : 'bj_shop_' + s.kind, rect: [s.front - s.depth, s.z0, s.front - 0.1, s.z1], y: 0.3, front: 'e', H: 3.4, seed: s.seed })), ins.length ? [ins[0].front - 4, (ins[0].z0 + ins[0].z1) / 2] : [0, 295]));
  // the people in the shops (§30): the shopman at his counter, a customer or two, the storyteller on his platform; `a` across (towards −z), `b` from the back wall
  {
    const P2 = [], Fg = (s, a, b, dx, extra = {}) => P2.push({ t: 'figure', at: [s.front - s.depth + b, (s.z0 + s.z1) / 2 - a], y: 0.34 + (extra.up ?? 0), rot: face([dx, 0]), seed: Math.floor(rand() * 1e9), ...FIG, cloth: CL[Math.floor(rand() * CL.length)], pose: 'stand', ...extra });
    for (const s of ins) {
      const Dp = s.depth - 0.1, hw = (s.z1 - s.z0) / 2 - 0.5;
      if (s.kind === 'teahouse') { Fg(s, -(hw - 0.5), 1.6, 1, { up: 0.25, carry: 'staff', pose: 'staff', len: 0.6, staffMat: 'timber' }); Fg(s, hw - 0.4, 2.8, 1); continue; }
      if (s.kind === 'pharmacy') { Fg(s, 0.6, 1.8, 1, { cloth: 'cloth_white' }); continue; }
      if (s.kind === 'pawn') { Fg(s, 0.2, Math.max(3.4, Dp * 0.46) - 1.0, 1, { hat: 'cap' }); Fg(s, -hw + 0.5, Dp - 1.7, 1); continue; }
      Fg(s, hw - 1.2, Dp - 1.4, 1);
      if (s.kind !== 'lantern') Fg(s, -(hw - 1.0), Dp * 0.45, -1);
    }
    out.push({ ...base('qing-beijing-shop-people', 'life', P2), center: [-16, 280], near: 150 });
  }
  // courtyard houses furnished inside, fitted to the shells (houses.js houseParts): the five lod-0 houses nearest the avenue's mouth
  const near = furnishedHouses(10);
  out.push(base('qing-beijing-interiors-houses', 'life', near.map((h) => ({ t: 'bj_rooms', rect: h.rect, seed: h.seed, courts: h.courts, gate: h.gate, lod: h.lod })), [-40, 235]));
  // pigeons on the paving and the roofs' feet of a few lanes
  const pig = [[-22, 230], [30, 225], [-120, 118], [120, 118], [-60, 60], [60, 62], [-8, 266], [8, 318]].map(([x, z]) => ({ t: 'chickens', kind: 'pigeon', at: [x, z], y: 0.04, n: 6 + Math.floor(rand() * 4), seed: Math.floor(rand() * 1e6) }));
  // the still figures of the palace: guards at the gates, officials at the foot of the terrace
  const man = (at, rot, extra = {}) => ({ t: 'figure', at, y: 0.03, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_ochre', 'cloth_red'][Math.floor(rand() * 3)], cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap', hair: 'shaven', over: 'sash', ...extra });
  const figs = [];
  for (const [x, z, dir] of [[-17, 168, [0, -1]], [17, 168, [0, -1]], [-9, 112, [0, -1]], [9, 112, [0, -1]], [-12, -162, [0, 1]], [12, -162, [0, 1]]]) {
    figs.push(man([x, z], face(dir), { carry: 'staff', pose: 'staff', len: 2.1, staffMat: 'timber', cloth: 'cloth_indigo' }));
  }
  const y0 = TIERS[0].rect[3] + 6;
  for (const [x, z, dir] of [[-16, y0, [1, 0]], [-14, y0 + 1.5, [1, 0]], [18, y0 + 2, [-1, 0]]]) figs.push(man([x, z], face(dir), { pose: 'stand', cloth: 'cloth_indigo', cloth2: 'cloth_red' }));
  // (§32) more of the palace's own people: sentries of the banner guard in pairs at the gates of the courts and before the three halls' stairs,
  // two files of officials waiting in the great courtyard either side of the stone way, attendants with brooms (a staff stands for the broom)
  for (const [x, z, dir] of [[-6, 128, [0, 1]], [6, 128, [0, 1]], [-80, 120, [0, 1]], [-68, 120, [0, 1]], [68, 120, [0, 1]], [80, 120, [0, 1]], [-8, 36, [0, 1]], [8, 36, [0, 1]],
    [-93, -6, [1, 0]], [93, -6, [-1, 0]], [-28, 168.5, [0, -1]], [28, 168.5, [0, -1]], [-40, -168, [0, 1]], [40, -168, [0, 1]]])
    figs.push(man([x, z], face(dir), { carry: 'staff', pose: 'staff', len: 2.2, staffMat: 'timber', cloth: 'cloth_maroon', cloth2: 'cloth_black' }));
  // the great court's life (§32): the rank markers in two files, officials waiting in knots by the markers' far end and in the court's
  // corners (none within 15 m of the arrival at (0, 70), none in the middle: the stone way is the emperor's), the court servants
  // sweeping, officials on the benches under the galleries, the guards in pairs at the stairs
  const court = [];
  for (const sx of [-1, 1]) court.push({ t: 'bj_rankstones', at: [sx * 14, 72], y: 0.03, rot: sx * -Math.PI / 2, n: 18, step: 3.0 });
  const OFF = ['cloth_blue', 'cloth_indigo', 'cloth_green', 'cloth_maroon', 'cloth_grey', 'cloth_brown'];
  const off = (at, rot, extra = {}) => figs.push(man(at, rot, { pose: 'stand', cloth: OFF[Math.floor(rand() * OFF.length)], cloth2: rand() < 0.5 ? 'cloth_black' : 'cloth_blue', ...extra }));
  // the officials in their places behind the markers at the terrace's end, facing the hall (−z)
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) off([sx * (17 + (i % 2) * 1.8), 53 - i * 3.0 + rand() * 0.6], face([0, -1]) + (rand() - 0.5) * 0.25);
  // knots in conversation (2–4 each), turned to one another
  const knots = [[-30, 50], [-47, 62], [-24, 86], [-60, 92], [-72, 52], [-70, 76], [29, 49], [47, 66], [26, 90], [62, 96], [72, 55], [69, 80], [-86, 60], [86, 90], [-40, 100], [42, 101]];
  for (const [kx, kz] of knots) {
    const m = 2 + Math.floor(rand() * 3), a0 = rand() * 6.28;
    for (let j = 0; j < m; j++) { const a = a0 + j / m * 6.28; off([kx + Math.cos(a) * 0.75, kz + Math.sin(a) * 0.75], a + Math.PI, { pose: 'talk' }); }
  }
  // the court servants sweeping with the long brooms, and a pair carrying a covered box on a pole between them
  for (const [x, z, r] of [[-55, 68, 0.6], [-37, 94, 2.2], [53, 61, -0.5], [38, 82, 1.0], [-18, 104, 3.0], [20, 44.5, 1.5]]) figs.push(man([x, z], r, { carry: 'broom', dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_indigo', hat: 'cap', over: 'none' }));
  for (const [x, z, r] of [[-66, 44.5, 1.57], [64, 99, -1.57]]) figs.push(man([x, z], r, { carry: 'pole', dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_black', hat: 'brim', over: 'none' }));
  // the court's near life, fourteen to twenty-three metres from the arrival and within 35° of its axis (the way the visitor first looks along is the emperor's, kept clear):
  // a servant at his broom either side, and two officials turned to one another beside the markers' files
  for (const [x, z, r] of [[-6.8, 58.0, 0.9], [6.8, 57.5, -2.1]]) figs.push(man([x, z], r, { carry: 'broom', dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_indigo', hat: 'cap', over: 'none' }));
  for (const [x, z, a] of [[-12.5, 54.5, 0.4], [11.0, 54.5, 3.5]]) for (let j = 0; j < 2; j++) off([x + Math.cos(a + j * Math.PI) * 0.45, z + Math.sin(a + j * Math.PI) * 0.45], a + j * Math.PI + Math.PI, { pose: 'talk' });
  // officials waiting on the benches under the galleries' eaves
  for (const sx of [-1, 1]) for (const z of [74, 92]) {
    const bx = sx * 92.2;
    court.push({ t: 'bench', at: [bx, z], y: 0.03, rot: Math.PI / 2, len: 2.2, seed: Math.floor(rand() * 1e6) });
    for (const q of [-0.55, 0.55]) if (rand() < 0.8) off([bx, z + q], face([-sx, 0]), { pose: 'sit' });
  }
  // on the terrace: attendants at the gilt vats and the censers (the vats stand at (±44, 2)), the hall's halberdiers at the top of the stairs, a lamp-keeper
  for (const sx of [-1, 1]) {
    figs.push(man([sx * 42.6, 4.2], face([sx, 0]), { y: TIERS[2].y, pose: 'stand', cloth: 'cloth_grey', cloth2: 'cloth_black', carry: 'basket', dress: 'trousers', over: 'none' }));
    figs.push(man([sx * 15.5, 15.5], face([0, 1]), { y: TIERS[2].y, carry: 'staff', pose: 'staff', len: 2.2, staffMat: 'timber', cloth: 'cloth_red', cloth2: 'cloth_black' }));
    figs.push(man([sx * 36, 26.5], face([0, 1]), { y: TIERS[1].y, carry: 'staff', pose: 'staff', len: 2.2, staffMat: 'timber', cloth: 'cloth_maroon', cloth2: 'cloth_black' }));
  }
  // the guard of honour's standards before the hall, in two rows either side of the stair (the tripods stand at x ±19.5…31.5, the cranes at ±13.5)
  for (const [x0, n] of [[-8, 3], [8, 3], [-24, 3], [24, 3]]) court.push({ t: 'bj_lubu', at: [x0 + (x0 < 0 ? -1 : 1) * 0.0, 13.9], y: TIERS[2].y, rot: 0, n, step: 3.2 });
  // the approach (§32): before the Meridian Gate's forecourt the officials' mounts and sedan chairs wait for their masters, the grooms squatting
  // by them; a knot of petitioners and the gate's own guards under the wall
  for (const sx of [-1, 1]) {
    for (const [dx, dz] of [[34, 193], [47, 197]]) { court.push({ t: 'bj_sedan', at: [sx * dx, dz], y: 0.03, rot: sx * 0.12, seed: Math.floor(rand() * 1e6), tone: sx < 0 ? 'cloth_green' : 'cloth_blue' }); }
    for (const [dx, dz] of [[58, 190], [60.5, 197]]) {
      court.push({ t: 'animal', kind: 'horse', at: [sx * dx, dz], y: 0.03, rot: Math.PI / 2 + sx * 0.3, gear: true, graze: false, seed: Math.floor(rand() * 1e6) });
      figs.push(man([sx * (dx - 1.4), dz + 0.8], 0.5, { pose: 'squat', dress: 'trousers', hat: 'brim', cloth: 'cloth_brown', over: 'none' }));
    }
    for (let i = 0; i < 3; i++) off([sx * (22 + i * 1.1), 199 + (i % 2) * 1.1], face([0, -1]) + (i - 1) * 0.5, { pose: i === 1 ? 'talk' : 'stand', dress: 'trousers', hat: 'brim', cloth: 'cloth_brown', cloth2: 'cloth_grey', over: 'none' });
  }
  void HALLS; void AVENUE;
  // the visitors of the Danbi way and its plaza (the Temple of Heaven): small parties walking up and standing, an old man with his bird cage, pigeons
  {
    const [dx0, dz0, dx1, dz1] = DANBI.rect, xm = (dx0 + dx1) / 2, T = [];
    const spots = [[xm - 4, dz1 + 7, [0, -1]], [xm - 3.2, dz1 + 7.6, [0, -1]], [xm + 7, dz1 + 3, [-1, -1]], [xm - 12, dz1 + 9, [1, 0]], [xm - 11, dz1 + 10, [1, 0]], [xm + 2, dz1 - 12, [0, -1]],
      [xm + 3.1, dz1 - 12.4, [0, -1]], [xm - 6.4, dz1 - 30, [0, 1]], [xm - 6.9, dz1 - 29, [0, 1]], [xm + 6.2, dz1 - 41, [0, -1]], [xm + 8.5, dz0 + 12, [-1, 0]], [xm - 8, dz0 + 14, [1, 0]], [xm, dz0 + 6, [0, 1]]];
    for (const [x, z, dir] of spots) T.push(man([x, z], face(dir), { pose: 'stand', y: z < dz1 - 1 ? DANBI.y : 0.03, cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: rand() < 0.5 ? 'cloth_black' : 'cloth_indigo', ...(rand() < 0.3 ? { hair: 'bun', hat: undefined } : {}) }));
    for (const [x, z] of [[xm + 12, dz1 + 6], [xm - 14, dz1 + 4]]) T.push({ t: 'chickens', kind: 'pigeon', at: [x, z], y: 0.04, n: 7, seed: Math.floor(rand() * 1e6) });
    out.push({ ...base('qing-beijing-temple-life', 'life', T), center: [xm, dz1 - 10] });
  }
  // the moat (§32): rowboats tied along the outer bank, and a fisherman's seat on the coping; the carp are in fauna.js
  {
    const [a0, b0, a1, b1] = MOAT.outer, E2 = [];
    for (const [x, z, rot] of [[a0 + 1.6, -120, 0], [a0 + 1.6, 40, 0.1], [a1 - 1.6, -60, 0], [a1 - 1.6, 110, -0.1], [-100, b0 + 1.6, Math.PI / 2], [90, b0 + 1.6, Math.PI / 2], [-100, b1 - 1.6, Math.PI / 2], [-110, b1 - 1.6 + 0.1, Math.PI / 2]])
      E2.push({ t: 'boat', kind: 'rowboat', at: [x, z], y: LEVEL.moat, rot, seed: Math.floor(rand() * 1e9) });
    out.push({ ...base('qing-beijing-moat-life', 'life', E2), center: [0, 0], near: 300 });
  }
  out.push(...streetPlans(rand));
  out.push(base('qing-beijing-people-life', 'life', [...pig, ...figs, ...court], [0, 120]));
  return out;
}

const FIG = { dress: 'robe', cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap', hair: 'shaven', over: 'sash' };
const CL = ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_ochre'];
/** Tile a list of elements into plans of 100 m squares (built when the visitor is within 230 m). */
function tiled(id, list, S = 100) {
  const tiles = new Map();
  for (const e of list) { const k = `${Math.floor(e.at[0] / S)},${Math.floor(e.at[1] / S)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, els]) => { const [i, j] = k.split(',').map(Number); return { ...base(`${id}-${k}`, 'life', els), center: [i * S + S / 2, j * S + S / 2] }; });
}
/**
 * The eye-level life of the shop street, the avenue and the lanes (streetlife.js): goods before every shop by its trade, stands and stalls
 * and carts along the avenue, hawkers with their poles, and what stood at the gates of the hutong. All derived from layout.js.
 */
function streetPlans(rand) {
  const L = [], plans = [], A = AVENUE, aw = A[2];
  const seed = () => Math.floor(rand() * 1e9);
  const fig = (at, rot, extra = {}) => L.push({ t: 'figure', at, y: 0.04, rot, seed: seed(), ...FIG, cloth: CL[Math.floor(rand() * CL.length)], ...extra });
  // before the shops: the goods of each trade, benches, a lantern or two
  for (const row of shopRows()) for (const sh of row.shops) {
    const west = row.side === 'w', out = west ? 1 : -1, rot = west ? Math.PI / 2 : -Math.PI / 2, cz = (sh.z0 + sh.z1) / 2, w = Math.min(sh.z1 - sh.z0 - 2.7, 3.8);
    const apronW = Math.abs(Math.abs(row.front) - CARRIAGE);
    if (sh.interior) { L.push({ t: 'stool', at: [row.front + out * 1.0, sh.z0 + 0.9], y: 0.04 + WALK_UP, rot, seed: seed() }, { t: 'stool', at: [row.front + out * 1.0, sh.z1 - 0.9], y: 0.04 + WALK_UP, rot, seed: seed() }); continue; }
    if (w < 1.6 || apronW < 3.0) continue;
    L.push({ t: 'bj_shopgoods', at: [row.front, cz], y: 0.04 + WALK_UP, rot, w, trade: sh.trade, seed: sh.seed, d0: 1.4 });
    if (rand() < 0.4) fig([row.front + out * 3.0, cz + (rand() - 0.5) * w * 0.6], rot + Math.PI * (rand() < 0.5 ? 0 : 1), { pose: rand() < 0.5 ? 'stand' : 'talk' });
  }
  // the avenue: stands and stalls at its two edges, clear of the booths and the temple's way
  const taken = (x, z, r) => SHOP_SITES.some((b) => Math.hypot(b.at[0] - x, b.at[1] - z) < r + 1) || lanes().some((l) => l[2] - l[0] > 40 && x > l[0] && x < l[2] && z > l[1] - r && z < l[3] + r && Math.abs(z - (l[1] + l[3]) / 2) < r + 3) || Math.abs(z - TEMPLE.c[1]) < 6 + r;
  const spots = [], KS = [0.05, 0.15, 0.25, 0.7, 0.33, 0.45, 0.85, 0.55, 0.95, 0.75, 0.1, 0.2, 0.3, 0.6, 0.72, 0.4, 0.88];
  for (let z = A[1] + 10; z < A[3] - 8; z += 9 + rand() * 7) for (const sd of [-1, 1]) {
    if (sd > 0 && z < 357 && rand() < 0.4) continue;
    spots.push([sd, z + rand() * 4, KS[spots.length % KS.length]]);
  }
  let nB = 0, nT = 0, nW = 0, nS = 0, nC = 0, nD = 0;
  for (const [sd, z, k] of spots) {
    const x = sd * (CARRIAGE - 0.5 - rand() * 0.5), rot = sd < 0 ? Math.PI / 2 : -Math.PI / 2, inward = [-sd, 0], faceIn = face(inward);
    if (taken(x, z, 2.5)) continue;
    if (k < 0.1 && nB < 3) { nB++; L.push({ t: 'bj_barber', at: [x, z], y: 0.04, rot: rot + Math.PI, seed: seed() }); }
    else if (k < 0.2 && nT < 3) { nT++; L.push({ t: 'bj_teastall', at: [x + sd * 0.0, z], y: 0.04, rot, seed: seed() }); }
    else if (k < 0.3 && nW < 3) { nW++; L.push({ t: 'bj_watercart', at: [x, z], y: 0.04, rot: rot + Math.PI / 2, seed: seed() }); }
    else if (k < 0.37 && nS < 3) { nS++; L.push({ t: 'bj_sedan', at: [x, z], y: 0.04, rot: rot + Math.PI / 2, seed: seed() }); }
    else if (k < 0.5 && nC < 5) { nC++; L.push({ t: 'peking_cart', at: [x, z], y: 0.04, rot: Math.PI / 2 * (rand() < 0.5 ? 0 : 2), seed: seed(), beast: rand() < 0.4 ? 'donkey' : 'horse', coat: ['hide_black', 'hide_brown', 'hide_grey'][Math.floor(rand() * 3)] }); fig([x - sd * 1.0, z - 4.2], 0.3, { dress: 'trousers', pose: 'squat', hat: 'brim', cloth: 'cloth_brown' }); }
    else if (k < 0.62 && nD < 6) { nD++; L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0.04, rot: rand() * 6.28, gear: true, graze: false, seed: seed() }); fig([x - sd * 1.0, z + 0.5], faceIn, { dress: 'trousers', pose: 'squat', hat: 'brim', cloth: 'cloth_brown' }); }
    else if (k < 0.8) { // a hawker with his pole, or a knot talking
      if (rand() < 0.6) fig([x, z], rot + (rand() - 0.5), { carry: 'pole', dress: 'trousers', cloth: 'cloth_brown', hat: rand() < 0.5 ? 'brim' : 'cap' });
      else { fig([x, z], faceIn + 0.5, { pose: 'talk' }); fig([x + sd * 0.6, z + 0.7], faceIn - 2.2, { pose: 'talk' }); }
    }
    else if (k < 0.9) { L.push({ t: 'bench', at: [x - sd * 0.4, z], y: 0.04, rot: Math.PI / 2, seed: seed() }); for (const q of [-0.4, 0.4]) if (rand() < 0.7) fig([x - sd * 0.4, z + q], faceIn, { pose: 'sit' }); }
    else { L.push({ t: 'animal', kind: rand() < 0.5 ? 'dog' : 'cat', at: [x, z], y: 0.04, rot: rand() * 6.28, seed: seed() }); fig([x + sd * 1.0, z + 1.2], faceIn + 1, { child: true, pose: 'squat', dress: 'trousers', hat: 'none', cloth: 'cloth_red' }); }
  }
  // a string of camels at rest on the avenue's far end, their drovers squatting by them
  const zc = A[3] - 30;
  if (!taken(-CARRIAGE + 1.2, zc, 8)) { L.push({ t: 'camel_string', at: [-CARRIAGE + 1.2, zc], dir: [0, -1], n: 4, y: 0.04, seed: seed() }); fig([-CARRIAGE + 2.4, zc - 4], 0, { dress: 'trousers', pose: 'squat', hat: 'brim', cloth: 'cloth_brown' }); }
  // hawkers and idlers about the avenue's mouth, where the visitor arrives
  for (let i = 0; i < 6; i++) { const x = (rand() - 0.5) * 5, z = 222 + rand() * 40; if (!taken(x, z, 1)) fig([x, z], rand() * 6.28, i % 2 ? { carry: 'pole', dress: 'trousers', cloth: 'cloth_brown', hat: 'brim' } : { pose: 'talk' }); }
  plans.push(...tiled('qing-beijing-street-life', L));
  // the hutong: what the households put out at their gates, a cat or a dog now and then
  const H = [];
  for (const h of houses()) {
    const [x0, , x1, , ] = h.rect, z1 = h.rect[3], gx = x1 - 1.6;
    if (Math.hypot(gx, z1) > RADIUS - 40) continue;
    H.push({ t: 'bj_lane', at: [gx, z1], seed: h.seed, lod: h.lod });
    if (h.lod < 2 && rand() < 0.3) H.push({ t: 'bj_pet', kind: rand() < 0.45 ? 'cat' : 'dog', at: [gx - 1.2 - rand() * 6, z1 + 1.0 + rand() * 2], y: 0.03, rot: rand() * 6.28, seed: seed() });
    if (h.lod < 2 && rand() < 0.4) H.push({ t: 'bj_drying', at: [gx - 14 - rand() * 3, z1 + 1.5], y: 0.03, rot: 0, seed: seed() });
    if (h.lod === 0 && rand() < 0.22) H.push({ t: 'laundry', at: [gx - 6 - rand() * 6, z1 + 1.1], y: 0.03, rot: 0, len: 3, seed: seed() });
    if (h.lod === 0 && rand() < 0.35) H.push({ t: 'figure', at: [gx - 4 - rand() * 8, z1 + 1.6 + rand() * 2], y: 0.03, rot: rand() * 6.28, seed: seed(), ...FIG, cloth: 'cloth_red', child: true, pose: 'squat', dress: 'trousers', hat: 'none' });
    void x0;
  }
  // between the gates: a street shrine, a tree with a bench and a tea table (a couple of old men at it), the coal seller's cart and his donkey
  for (const b of betweenGates()) {
    const [x, z] = b.at;
    if (b.kind === 'shrine') { H.push({ t: 'bj_shrine', at: [x, z], seed: b.seed }); if (rand() < 0.5) H.push({ t: 'figure', at: [x + 0.2, z + 2.0], y: 0.03, rot: Math.PI, seed: seed(), ...FIG, cloth: 'cloth_grey', pose: 'stand' }); }
    else if (b.kind === 'benchtree') {
      H.push({ t: 'bj_benchtree', at: [x, z], seed: b.seed });
      for (const dx of [0.2, 1.2]) if (rand() < 0.75) H.push({ t: 'figure', at: [x + 1.6 + dx - 0.7, z + 2.0], y: 0.03 + 0.0, rot: Math.PI, seed: seed(), ...FIG, cloth: CL[Math.floor(rand() * CL.length)], pose: 'sit' });
    } else {
      H.push({ t: 'bj_coalcart', at: [x, z], seed: b.seed });
      H.push({ t: 'animal', kind: 'donkey', at: [x + 3.4, z + 1.5], y: 0.03, rot: Math.PI / 2, gear: true, graze: false, seed: seed() });
      H.push({ t: 'figure', at: [x - 1.5, z + 2.9], y: 0.03, rot: 0, seed: seed(), ...FIG, dress: 'trousers', cloth: 'cloth_brown', hat: 'brim', carry: 'pole' });
    }
  }
  plans.push(...tiled('qing-beijing-hutong-life', H, 200));
  void RING; void SHOP_APRONS;
  return plans;
}
