// The city and the plain of Pagan (docs/settlements/bagan.md §2, §5): the walled city with the Tharabar Gate, the Thatbyinnyu in its enclosure, the palace compound, the Irrawaddy
// with its ghat and moored boats, the stilt houses in their strips, the Shwezigon and the Sulamani in their precincts, the temples and stupas of the plain, kyaungs and rest
// houses, the roadside stalls, the brickworks and the tank, and the people and animals about them. Several plans, so that each builds in turn while the visitor already walks.
import '../../styles/burmese/index.js';
import {
  RADIUS, RIVER_Y, bankX, CITY, WALL, GATE, THAT, THAT_ENC, PALACE, PAL_HALL, SHWE, SHWE_PREC, SULA, SULA_PREC, TANK, TANK_Y, KILNS, KYAUNGS, PRECINCT, MAIN_ROAD,
  ANANDA, OKKYAUNG, lots, plainTemples, cityWalls, streets, inLot, inPlainTemple, inRect, inRiver, inTank,
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

/** The moored boats of the river (shared by the city and the people on them). */
let MOORED = null;
function moored() {
  if (MOORED) return MOORED;
  const r = rng(1201);
  MOORED = [-130, -96, -76, -58, -30, -14, 14, 36, 56, 74, 96, 118, 140, 160, 182].map((z) => ({ at: [Math.round((bankX(z) - 7 - r() * 8) * 10) / 10, z], y: RIVER_Y, len: 9 + r() * 7, yaw: (r() - 0.5) * 0.3, seed: Math.floor(z + 300), canopy: r() < 0.7 }));
  return MOORED;
}

/** The city: its walls and the Tharabar Gate, the Thatbyinnyu, the palace, the river and its ghat, the tank and the kilns. */
function city() {
  const E = [];
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
  // the water in reaches of 14 edge points, each its own plan, so that each one's bounds stay inside the disc
  const RIV = [];
  for (let i = 0; i < edge.length - 1; i += 14) {
    const part = edge.slice(i, i + 15), zm = Math.max(...part.map((q) => Math.abs(q[0])));
    RIV.push(base('bagan-river-' + RIV.length, [{ t: 'bgn_river', edge: part, y: RIVER_Y, x0: -Math.min(RADIUS + 4, Math.floor(Math.sqrt(460 * 460 - zm * zm))) }]));
  }
  E.push({ t: 'bgn_ghat', at: [bankX(0) - 1, 0], y: RIVER_Y, w: 7 });
  for (const b of moored()) E.push({ t: 'bgn_boat', ...b });
  E.push({ t: 'bgn_tank', rect: TANK, y: TANK_Y });
  KILNS.forEach(([x, z], i) => E.push({ t: 'bgn_kiln', c: [x, z], seed: i + 4 }));
  return [base('bagan-city', E), ...RIV];
}

/** The stilt houses in their strips. */
function houses() {
  const E = [];
  for (const l of lots()) {
    if (!l.shop) { E.push({ t: 'bgn_house', rect: l.rect, front: l.front, seed: l.seed, open: true, kind: l.kind }); continue; }
    // a shop on the road, the owner's house behind it
    const [x0, z0, x1, z1] = l.rect, S = 9.8;
    E.push({ t: 'bgn_shop', rect: l.rect, front: l.front, seed: l.seed, trade: ['lacquer', 'pottery', 'cloth', 'offerings', 'betel', 'rice', 'tea', 'parasols'][l.seed % 8] });
    E.push({ t: 'bgn_house', rect: l.front === 's' ? [x0, z0, x1, z1 - S] : [x0, z0 + S, x1, z1], front: l.front, seed: l.seed + 1, open: true, kind: 'small' });
  }
  return base('bagan-houses', E);
}

/** Roadside props along the streets (water-pot stands, shrines, benches, festival poles, lamp pillars, firewood, drying mats), placed from the street rectangles, on the verge, facing the road. */
function roadside() {
  const r = rng(1213), items = [], taken = [];
  const free = (x, z, m) => !inRiver(x, z, 4) && !inTank(x, z, 2) && !inLot(x, z, m) && !inPlainTemple(x, z, 1) && !taken.some(([a, b]) => Math.hypot(a - x, b - z) < 5)
    && !streets().some((q) => inRect(q, x, z, 0.4)) && ![PRECINCT, SHWE_PREC, SULA_PREC, THAT_ENC, PALACE].some((q) => inRect(q, x, z, 0.5)) && Math.hypot(x, z) < RADIUS - 24;
  const kinds = [['potstand', 4], ['bench', 2], ['pole', 1.2], ['shrine', 1.0], ['lamp', 1.0], ['firewood', 1.2], ['dry', 1.4], ['spirit', 0.8], ['pounder', 0.5]];
  const tot = kinds.reduce((a, [, w]) => a + w, 0);
  const pick = () => { let q = r() * tot; for (const [k, w] of kinds) { q -= w; if (q <= 0) return k; } return 'potstand'; };
  for (const s of streets()) {
    const horiz = s[2] - s[0] >= s[3] - s[1], L = horiz ? s[2] - s[0] : s[3] - s[1];
    if (L < 24 || Math.min(s[2] - s[0], s[3] - s[1]) > 12) continue;
    for (let a = 8 + r() * 10; a < L - 6; a += 14 + r() * 16) for (const side of [-1, 1]) {
      if (r() < 0.35) continue;
      const off = 1.4 + r() * 0.8, k = pick();
      const x = horiz ? s[0] + a : (side < 0 ? s[0] - off : s[2] + off), z = horiz ? (side < 0 ? s[1] - off : s[3] + off) : s[1] + a;
      if (!free(x, z, 1.2)) continue;
      const rot = horiz ? (side < 0 ? 0 : Math.PI) : (side < 0 ? Math.PI / 2 : -Math.PI / 2);
      items.push({ k, c: [Math.round(x * 10) / 10, Math.round(z * 10) / 10], rot, seed: Math.floor(r() * 1e6) });
      taken.push([x, z]);
    }
  }
  return items;
}

/** The precinct furniture of the Ananda: the chinthe pairs at the four gates, lamp pillars and festival poles along the approaches, rows of votive stupas inside the walls, offerings by the porches. */
function anandaCourt() {
  const [px0, pz0, px1, pz1] = PRECINCT, [ax, az] = ANANDA.c, items = [], r = rng(1105);
  const lions = [[px0 + 2.6, az, -Math.PI / 2, 'z'], [px1 - 2.6, az, Math.PI / 2, 'z'], [ax, pz0 + 2.6, Math.PI, 'x'], [ax, pz1 - 2.6, 0, 'x']];
  for (const [x, z, rot, ax2] of lions) for (const sd of [-1, 1]) items.push({ k: 'chinthe', c: ax2 === 'z' ? [x, z + sd * 5] : [x + sd * 5, z], rot, s: 1.15 });
  for (let x = px0 + 9; x < ax - 52; x += 7) for (const sd of [-1, 1]) items.push({ k: 'lamp', c: [x, az + sd * 6.2], rot: 0, seed: x });
  for (const [dx, dz] of [[-62, -9], [-62, 9], [-70, -9], [-70, 9], [62, -9], [62, 9], [-9, -62], [9, -62], [-9, 62], [9, 62]]) items.push({ k: 'pole', c: [ax + dx, az + dz], rot: 0, seed: Math.round(dx * 7 + dz) });
  const rows = [[60, pz0 + 3.5, 0, 22], [150, pz0 + 3.5, 0, 22], [60, pz1 - 3.5, 0, 22], [150, pz1 - 3.5, 0, 22], [px0 + 4, -48, Math.PI / 2, 26], [px0 + 4, 52, Math.PI / 2, 26], [px1 - 4, 40, Math.PI / 2, 20],
    [60, pz0 + 6.5, 0, 14], [150, pz1 - 6.5, 0, 14]];
  for (const [x, z, rot, n] of rows) items.push({ k: 'votive', c: [x, z], rot, n, h: 2.4, gilt: true, seed: Math.round(x + z) });
  // offerings before the four porches' steps, and the pot stands by them
  for (const [dx, dz, rot] of [[-52.5, 0, 0], [52.5, 0, 0], [0, -52.5, 0], [0, 52.5, 0]]) { items.push({ k: 'offering', c: [ax + dx, az + dz + (dx ? 4 : 0)], rot: dx ? (dx < 0 ? Math.PI / 2 : -Math.PI / 2) : 0, w: 1.6 }); void rot; }
  for (const [x, z] of [[40, -12], [40, 12], [170, -12], [170, 12], [105, -75], [105, 75]]) items.push({ k: 'potstand', c: [x, z], rot: 0, seed: x + z });
  void r; void OKKYAUNG;
  return items;
}

/** The other courts: the Thatbyinnyu's enclosure and the palace (brick libraries, lions at the gates, poles, lamps, votive stupas), the Shwezigon and the Sulamani (lions, votive rows, lamps). */
function courts() {
  const items = [], E = [];
  for (const [x, z] of [[-240, 45], [-240, 120], [-156, 45], [-156, 122]]) E.push({ t: 'bgn_library', c: [x, z], rot: x < -200 ? Math.PI / 2 : -Math.PI / 2, seed: Math.round(x + z) });
  for (const [x, z] of [[-240, -44], [-156, -44]]) E.push({ t: 'bgn_library', c: [x, z], rot: Math.PI, seed: Math.round(x - z) });
  E.push({ t: 'bgn_kyaung', c: [-232, -90], A: 6, B: 4.5, y: 1.8, tiers: 3, palace: true, rot: 0, seed: 11 });
  E.push({ t: 'bgn_kyaung', c: [-164, -90], A: 6, B: 4.5, y: 1.8, tiers: 3, palace: true, rot: 0, seed: 12 });
  E.push({ t: 'bgn_kyaung', c: [-240, 82], A: 5, B: 4, y: 1.6, tiers: 3, rot: Math.PI / 2, seed: 13 });
  E.push({ t: 'bgn_zayat', c: [-156, 82 + 14], A: 4.5, B: 3.2, y: 0.1, seed: 14 });
  const lion = (x, z, rot, s = 1.1) => items.push({ k: 'chinthe', c: [x, z], rot, s });
  lion(-198 - 4.5, 30 + 2.6, Math.PI); lion(-198 + 4.5, 30 + 2.6, Math.PI); lion(-146 - 2.6, 82 - 4.5, Math.PI / 2); lion(-146 - 2.6, 82 + 4.5, Math.PI / 2);
  lion(-198 - 4.5, -30 - 2.6, 0); lion(-198 + 4.5, -30 - 2.6, 0);
  lion(140 - 4.5, -148 - 2.6, 0); lion(140 + 4.5, -148 - 2.6, 0); lion(98 + 2.6, -190 - 4.5, -Math.PI / 2); lion(98 + 2.6, -190 + 4.5, -Math.PI / 2);
  lion(155 - 4.5, 160 + 2.6, Math.PI); lion(155 + 4.5, 160 + 2.6, Math.PI); lion(112 + 2.6, 198 - 4.5, -Math.PI / 2); lion(112 + 2.6, 198 + 4.5, -Math.PI / 2);
  for (const [x, z, rot, n] of [[-198, 133, 0, 12], [-198, 33, 0, 12], [140, -150.5, 0, 8], [155, 234, 0, 8], [-248, 90, Math.PI / 2, 10]]) items.push({ k: 'votive', c: [x, z], rot, n, h: 2.2, gilt: true, seed: Math.round(x + z) });
  for (const [x, z] of [[-190, 36], [-206, 36], [-140, 70], [-140, 94], [-206, -34], [-190, -34], [135, -152], [145, -152], [150, 164], [160, 164]]) items.push({ k: 'lamp', c: [x, z], rot: 0, seed: Math.round(x + z) });
  for (const [x, z] of [[-215, 40], [-181, 40], [-215, 125], [-181, 125], [-232, -40], [-164, -40], [-214, -48], [-182, -48]]) items.push({ k: 'pole', c: [x, z], rot: 0, seed: Math.round(x * 3 + z) });
  for (const [x, z] of [[-236, 100], [-160, 60], [-214, -118], [-182, -118], [-242, -76], [-154, -76]]) items.push({ k: 'potstand', c: [x, z], rot: 0, seed: Math.round(x + z) });
  E.push({ t: 'bgn_props', items });
  return E;
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
  [[26, -8, 0], [26, 8, Math.PI], [105 - 9, 100, Math.PI], [105 + 9, -100, 0], [96, -112, Math.PI / 2], [96, 112, Math.PI / 2]].forEach(([x, z, rot], i) => E.push({ t: 'bgn_stall', c: [x, z], y: 0, rot, seed: i + 40, goods: goods[(i + 1) % 4] }));
  E.push(...courts());
  E.push({ t: 'bgn_props', items: [...anandaCourt(), ...roadside()] });
  // more stalls inside the Ananda's west gate and by the gates of the other two great temples (flowers, candles, gold leaf, water-pots for the pilgrims)
  [[31, -10.5, 0], [31, 10.5, Math.PI], [45, -10.5, 0], [45, 10.5, Math.PI], [120, -100, Math.PI / 2], [150, -144, Math.PI], [130, 153, 0], [112 - 8, 190, Math.PI / 2], [112 - 8, 206, Math.PI / 2]]
    .forEach(([x, z, rot], i) => E.push({ t: 'bgn_stall', c: [x, z], y: 0, rot, seed: i + 60, goods: goods[(i + 2) % 4] }));
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

  // ── the settled figures (the dossier §10): pilgrims kneeling before the Ananda's porches and before its Buddhas, guards at the gates, shopkeepers behind their counters, monks in the rest houses, women
  //    squatting by the drying mats, fishermen on the boats ──
  const face = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z));
  const [ax, az] = ANANDA.c;
  for (const [dx, dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    for (let k = 0; k < 4; k++) {
      const d = 51.2 + k * 1.5, lat = (k % 2 ? 1 : -1) * (1.2 + (k >> 1) * 1.8), x = ax + dx * d + (dz ? lat : 0), z = az + dz * d + (dx ? lat : 0);
      lay([x, z], face(x, z, ax, az), { pose: 'kneel', arms: 'pray' });
    }
    const x = ax + dx * 14.0, z = az + dz * 14.0;
    P.push({ t: 'figure', at: [x, z], y: 1.2, rot: face(x, z, ax, az), seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: 'bun', beard: false, pose: 'kneel', arms: 'pray' });
    const mx = ax + dx * 21.4 + (dz ? 1.7 : 0), mz = az + dz * 21.4 + (dx ? 1.7 : 0);
    P.push({ t: 'figure', at: [mx, mz], y: 1.2, rot: face(mx, mz, ax, az), seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_red', cloth2: 'cloth_red', over: 'shawl', skin: skin(), hat: 'none', feet: 'bare', hair: 'shaven', beard: false, pose: 'cross' });
  }
  for (const [x, z, tx, tz] of [[GATE.x + 2.6, -2.4, GATE.x + 2.6, 5], [GATE.x + 2.6, 2.4, GATE.x + 2.6, -5], [-198 - 3, -30 + 2, -198, -20], [-198 + 3, -30 + 2, -198, -20], [-146 - 2, 82 - 4, -156, 82], [-146 - 2, 82 + 4, -156, 82]]) {
    fig([x, z], face(x, z, tx, tz), { pose: 'staff', cloth: 'cloth_red', cloth2: 'cloth_black', over: 'none', hair: 'short', hat: 'none', skin: skin(), carry: 'staff' });
  }
  // the shopkeepers and a customer or two
  for (const l of lots()) {
    if (!l.shop) continue;
    const [x0, z0, x1, z1] = l.rect, W = x1 - x0, s = l.front === 's' ? 1 : -1, cx = x0 + W / 2, fz = s > 0 ? z1 : z0;
    const keeper = (rand() < 0.75);
    if (keeper) P.push({ t: 'figure', at: [cx + (rand() - 0.5) * 2, fz - s * 1.5], y: 0.55, rot: s > 0 ? Math.PI : 0, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: ['cloth_green', 'cloth_brown', 'cloth_red', 'cloth_white'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: rand() < 0.5 ? 'bun' : 'short', beard: false, ...(rand() < 0.4 ? { pose: 'cross' } : {}) });
    if (rand() < 0.4) { const x = cx + (rand() - 0.5) * 4, z = fz + s * 2.6; if (free(x, z, 1.2)) lay([x, z], s > 0 ? 0 : Math.PI, { pose: 'talk', carry: rand() < 0.5 ? 'basket' : undefined }); }
  }
  // monks and laity in the rest houses
  for (const [x, z] of [[42, -62], [42, 62], [170, 62], [166, -30], [112, -168], [112, -212], [168, -212], [-156, 96]]) {
    P.push({ t: 'figure', at: [x + 1.8, z + 0.4], y: 1.0, rot: Math.PI / 2, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_red', cloth2: 'cloth_red', over: 'shawl', skin: skin(), hat: 'none', feet: 'bare', hair: 'shaven', beard: false, pose: 'cross' });
    P.push({ t: 'figure', at: [x - 1.8, z + 0.4], y: 1.0, rot: -Math.PI / 2, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: 'bun', beard: false, pose: 'cross' });
  }
  // by the roadside stands and mats
  for (const it of roadside()) {
    if (it.k === 'dry' && rand() < 0.7) { const x = it.c[0] + Math.sin(it.rot) * -1.8, z = it.c[1] - Math.cos(it.rot) * 1.8; if (free(x, z, 0.8)) lay([x, z], it.rot + Math.PI, { pose: 'squat' }); }
    if (it.k === 'potstand' && rand() < 0.3) { const x = it.c[0] + Math.sin(it.rot) * 1.4, z = it.c[1] + Math.cos(it.rot) * 1.4; if (free(x, z, 0.8)) lay([x, z], it.rot + Math.PI, { carry: 'pot' }); }
    if (it.k === 'bench' && rand() < 0.6) { const x = it.c[0] + Math.sin(it.rot) * 0.4, z = it.c[1] + Math.cos(it.rot) * 0.4; P.push({ t: 'figure', at: [x, z], y: 0, rot: it.rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: 'short', beard: false, pose: 'sit' }); }
  }
  // the boatmen standing at the sterns, women washing at the ghat
  for (const b of moored()) if (b.len > 10) P.push({ t: 'figure', at: [b.at[0], b.at[1] + b.len / 2 - 1.3], y: b.y + 0.55, rot: 0, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_brown', cloth2: 'cloth_white', over: 'none', skin: skin(), hat: 'straw', feet: 'bare', hair: 'short', beard: false });
  for (let k = 0; k < 4; k++) { const z = 8 + k * 2.2; lay([bankX(z) + 0.6, z], -1.57, { pose: 'squat' }); }
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
  return [...city(), houses(), temples(), people()];
}
void MAIN_ROAD; void PRECINCT;
