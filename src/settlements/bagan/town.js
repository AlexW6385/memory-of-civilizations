// The city and the plain of Pagan (docs/settlements/bagan.md §2, §5): the walled city with the Tharabar Gate, the Thatbyinnyu in its enclosure, the palace compound, the Irrawaddy
// with its ghat and moored boats, the stilt houses in their strips, the Shwezigon and the Sulamani in their precincts, the temples and stupas of the plain, kyaungs and rest
// houses, the roadside stalls, the brickworks and the tank, and the people and animals about them. Several plans, so that each builds in turn while the visitor already walks.
import '../../styles/burmese/index.js';
import {
  RADIUS, RIVER_Y, bankX, CITY, WALL, GATE, THAT, THAT_ENC, PALACE, PAL_HALL, SHWE, SHWE_PREC, SULA, SULA_PREC, TANK, TANK_Y, KILNS, KYAUNGS, PRECINCT, MAIN_ROAD,
  lots, plainTemples, cityWalls, inRect, inRiver, inTank,
} from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, style = 'burmese') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [30, 0], facing: 'e' } });
const R = RADIUS - 20;

/** The walls of a rectangle with a gate in the middle of one side (`gate`: 'n' | 's' | 'e' | 'w', at: the gate's coordinate along the side). */
function enclosure(E, rect, gates, o = {}) {
  const [x0, z0, x1, z1] = rect, W = { th: o.th ?? 1.0, h: o.h ?? 2.4, mat: 'brick', merlon: false };
  const g = (side) => gates.filter((q) => q.side === side);
  const gap = (side, a0) => g(side).map((q) => ({ at: q.at - a0, w: 7 }));
  E.push({ t: 'bgn_wall', a: [x0, z0], b: [x1, z0], ...W, gaps: gap('n', x0) });
  E.push({ t: 'bgn_wall', a: [x0, z1], b: [x1, z1], ...W, gaps: gap('s', x0) });
  E.push({ t: 'bgn_wall', a: [x0, z0], b: [x0, z1], ...W, gaps: gap('w', z0) });
  E.push({ t: 'bgn_wall', a: [x1, z0], b: [x1, z1], ...W, gaps: gap('e', z0) });
  for (const q of gates) {
    const c = q.side === 'n' ? [q.at, z0] : q.side === 's' ? [q.at, z1] : q.side === 'w' ? [x0, q.at] : [x1, q.at];
    E.push({ t: 'bgn_gate', c, axis: q.side === 'n' || q.side === 's' ? 'z' : 'x', th: W.th, h: 5.4, pw: 3.6 });
  }
}

/** The city: its walls and the Tharabar Gate, the Thatbyinnyu, the palace, the river and its ghat, the tank and the kilns. */
function city() {
  const E = [], r = rng(1200);
  for (const w of cityWalls()) {
    const gaps = w.gaps.map((g) => ({ at: g.at, w: GATE.pw + 7.2 }));
    E.push({ t: 'bgn_wall', a: w.a, b: w.b, th: WALL.th, h: WALL.h, mat: 'brick', merlon: true, gaps });
  }
  E.push({ t: 'bgn_gate', c: [GATE.x, GATE.z], axis: 'x', th: WALL.th, h: WALL.h, pw: GATE.pw, big: true });
  // the Thatbyinnyu in its enclosure, entered from the east; the palace compound to the north with its tiered halls
  E.push({ t: 'bgn_tower', c: THAT.c, facing: THAT.facing, k: THAT.k, f: 1.4, seed: 1150 });
  enclosure(E, THAT_ENC, [{ side: 'n', at: -198 }, { side: 'e', at: THAT.c[1] }]);
  enclosure(E, PALACE, [{ side: 's', at: -198 }], { h: 3.0 });
  E.push({ t: 'bgn_kyaung', c: PAL_HALL.c, A: PAL_HALL.A, B: PAL_HALL.B, y: 2.4, tiers: 5, palace: true, rot: 0, seed: 1 });
  E.push({ t: 'bgn_kyaung', c: [-232, -62], A: 6, B: 4.5, y: 1.8, tiers: 3, palace: true, rot: 0, seed: 2 });
  E.push({ t: 'bgn_kyaung', c: [-164, -62], A: 6, B: 4.5, y: 1.8, tiers: 3, palace: true, rot: 0, seed: 3 });
  E.push({ t: 'bgn_zayat', c: [-232, -112], A: 5, B: 3.5, y: 0.2, seed: 4 });
  E.push({ t: 'bgn_zayat', c: [-164, -112], A: 5, B: 3.5, y: 0.2, seed: 5 });
  // the Irrawaddy, the ghat at the main road's end, boats moored along the bank
  const edge = []; for (let z = -RADIUS; z <= RADIUS; z += 8) edge.push([z, bankX(z) - 3]);
  E.push({ t: 'bgn_river', edge, y: RIVER_Y, x0: -RADIUS - 4 });
  E.push({ t: 'bgn_ghat', at: [bankX(0) - 1, 0], y: RIVER_Y, w: 7 });
  for (const z of [-96, -58, -30, 36, 74, 118, 160]) E.push({ t: 'bgn_boat', at: [bankX(z) - 8 - r() * 6, z], y: RIVER_Y, len: 10 + r() * 6, yaw: (r() - 0.5) * 0.3, seed: Math.floor(z + 300), canopy: r() < 0.7 });
  E.push({ t: 'bgn_tank', rect: TANK, y: TANK_Y });
  KILNS.forEach(([x, z], i) => E.push({ t: 'bgn_kiln', c: [x, z], seed: i + 4 }));
  return base('bagan-city', E);
}

/** The stilt houses in their strips. */
function houses() {
  const E = lots().map((l) => ({ t: 'bgn_house', rect: l.rect, front: l.front, seed: l.seed, open: l.open }));
  return base('bagan-houses', E);
}

/** The Shwezigon and the Sulamani in their precincts, the temples and stupas of the plain, kyaungs, rest houses, stalls. */
function temples() {
  const E = [];
  E.push({ t: 'bgn_shwezigon', c: SHWE.c, h: 48.8, seed: 1102 });
  enclosure(E, SHWE_PREC, [{ side: 's', at: 140 }, { side: 'w', at: SHWE.c[1] }], { h: 2.2 });
  E.push({ t: 'bgn_tower', c: SULA.c, facing: SULA.facing, k: SULA.k, f: 1.2, seed: 1183 });
  enclosure(E, SULA_PREC, [{ side: 'n', at: 155 }, { side: 'w', at: SULA.c[1] }], { h: 2.2 });
  for (const t of plainTemples()) {
    if (t.kind === 'cella') E.push({ t: 'bgn_cella', c: t.c, facing: t.facing, w: t.w + 1.2, seed: t.seed });
    else E.push({ t: 'bgn_stupa', c: t.c, h: t.h, kind: t.kind === 'tall' ? 'tall' : 'bell', body: t.seed % 3 === 0 ? 'limewash_white' : 'brick', gilt: t.seed % 5 === 0, seed: t.seed });
  }
  KYAUNGS.forEach(([x, z], i) => { E.push({ t: 'bgn_kyaung', c: [x, z], A: 7, B: 5.5, y: 2.0, tiers: 3, rot: 0, seed: i + 7 }); E.push({ t: 'bgn_zayat', c: [x + 16, z + 4], A: 4.5, B: 3.2, y: 0.1, seed: i + 20 }); });
  // rest houses in the Ananda's precinct and by the Shwezigon's court
  for (const [x, z] of [[42, -62], [42, 62], [170, 62], [166, -30]]) E.push({ t: 'bgn_zayat', c: [x, z], A: 5, B: 3.5, y: 0.1, seed: Math.round(x + z) });
  for (const [x, z] of [[112, -168], [112, -212], [168, -212]]) E.push({ t: 'bgn_zayat', c: [x, z], A: 4.5, B: 3.2, y: 0.1, seed: Math.round(x * 3 + z) });
  // the stalls: along the main road before the Ananda's west gate, and on the roads to the great temples
  const goods = ['flowers', 'candles', 'pots', 'fruit'];
  [[-70, -7, 0], [-52, 7, Math.PI], [-34, -7, 0], [-16, 7, Math.PI], [0, -7, 0]].forEach(([x, z, rot], i) => E.push({ t: 'bgn_stall', c: [x, z], y: 0, rot, seed: i + 30, goods: goods[i % 4] }));
  [[26, -8, 0], [26, 8, Math.PI], [105 - 9, 100, Math.PI], [105 + 9, -100, 0], [96, -112, Math.PI / 2], [96, 112, Math.PI / 2]].forEach(([x, z, rot], i) => E.push({ t: 'bgn_stall', c: [x, z], y: 0, rot, seed: i + 40, goods: goods[(i + 1) % 4] }));
  return base('bagan-temples', E);
}

/** The people (monks in their robes, women with loads, farmers, children) and the animals (oxen, goats, dogs) about the streets; goods at the doors come from the life kit. */
function people() {
  const rand = rng(1211), P = [];
  const skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const fig = (at, rot, o) => P.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_ochre', cloth2: 'cloth_red', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: 'bun', beard: false, ...o });
  const free = (x, z, m = 1.6) => !inRiver(x, z, 4) && !inTank(x, z, 2) && !lots().some((l) => inRect(l.rect, x, z, 1)) && !P.some((p) => p.t === 'figure' && Math.hypot(p.at[0] - x, p.at[1] - z) < m);
  const monk = (at, rot, o = {}) => fig(at, rot, { cloth: 'cloth_red', cloth2: 'cloth_red', top: undefined, over: 'shawl', hair: 'shaven', ...o });
  const lay = (at, rot, o = {}) => fig(at, rot, { cloth: ['cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_brown'][Math.floor(rand() * 4)], cloth2: 'cloth_red', hair: rand() < 0.5 ? 'bun' : 'long', ...o });
  // the Ananda's precinct: pilgrims before the porches, monks at the gate, someone sweeping the terrace
  for (let k = 0; k < 22; k++) {
    const x = 20 + rand() * 170, z = -90 + rand() * 180;
    if (Math.hypot(x - 105, z) < 30 || !free(x, z, 2.2)) continue;
    const q = rand(); if (q < 0.35) monk([x, z], rand() * 6.28, rand() < 0.5 ? { pose: 'talk' } : {}); else if (q < 0.7) lay([x, z], rand() * 6.28, { carry: 'basket' }); else lay([x, z], rand() * 6.28, { h: 0.7 });
  }
  // the road and the plain: a line of monks on the alms round, women with water pots, farmers
  for (let k = 0; k < 8; k++) monk([-96 + k * 1.3, 2.4], 1.57 + 0, {});
  for (let k = 0; k < 40; k++) {
    const x = -280 + rand() * 480, z = -170 + rand() * 340;
    if (Math.hypot(x, z) > R || !free(x, z)) continue;
    lay([x, z], rand() * 6.28, rand() < 0.5 ? { carry: 'pot' } : rand() < 0.5 ? { pose: 'talk' } : {});
  }
  // the ghat: women filling pots, boatmen
  for (let k = 0; k < 6; k++) lay([bankX(0) + 1.5 + k * 0.9, -4 + k * 1.4], 1.57, { carry: k % 2 ? 'pot' : undefined });
  const A = [];
  for (let k = 0; k < 26; k++) {
    const x = -250 + rand() * 440, z = -150 + rand() * 300;
    if (Math.hypot(x, z) > R || !free(x, z, 1.2)) continue;
    const q = rand(), kind = q < 0.28 ? 'buffalo' : q < 0.5 ? 'zebu' : q < 0.72 ? 'goat' : 'dog';
    A.push({ t: 'animal', kind, at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 });
  }
  return base('bagan-people', [...P, ...A], 'life');
}

export async function town() {
  return [city(), houses(), temples(), people()];
}
void MAIN_ROAD; void PRECINCT;
