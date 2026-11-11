// Conques about 1120 — the deepening pass (docs/settlements/conques.md §1i): the washing across the lanes and from the
// upper windows, lanterns at the shops, the pilgrims' square with its stalls, cross, benches, vendors and children, the
// workers in the open shops (baker, smith, weaver, host), the tribune's vigil and the cloister's monks, the washing-place
// and fishing at the Dourdou, the beasts at the doors and in the gardens. Everything placed from layout.js.

import { RADIUS, ABBEY, RIVER, BRIDGE, HOSTEL, FOUNTAINS, STAIRS, lots, gardens, laneZ, level, height, bandZ, BAND } from './layout.js';
import { shopPoint } from '../../styles/romanesque/village.js';

const base = (id, elements, style = 'life') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, 0], facing: 'e' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const OUT = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
/** A lot's frame: P(u, v) → [x, z] (u along the front from the left as one faces it, v inward), L its width, D its depth. */
function frameOf(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n';
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  return { P, L: along ? x1 - x0 : z1 - z0, D: along ? z1 - z0 : x1 - x0, out: OUT[f] };
}
const near = (x, z, r) => Math.hypot(x, z) < r;
const CL = ['cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_green', 'cloth_indigo', 'cloth_maroon'];

// ── the lanes: washing, lanterns ─────────────────────────────────────────────
/** Washing hung across the lanes between the upper floors of facing houses, poles out of windows, lanterns by the shops. */
export function laneLife() {
  const rand = rng(2112), E = [], all = lots();
  const byK = new Map();
  for (const l of all) { if (!byK.has(l.k)) byK.set(l.k, { n: [], s: [] }); if (l.front === 's') byK.get(l.k).n.push(l); else if (l.front === 'n') byK.get(l.k).s.push(l); }
  for (const [k, { n, s }] of byK) {
    const z = laneZ(k);
    for (const a of n) {
      if (a.storeys < 2 || a.gallery || a.perron || a.hostel) continue;
      for (const b of s) {
        if (b.storeys < 2 || b.gallery || b.hostel || Math.abs(b.rect[0] - a.rect[0]) > 12) continue;
        const x0 = Math.max(a.rect[0], b.rect[0]) + 1.0, x1 = Math.min(a.rect[2], b.rect[2]) - 1.0;
        if (x1 - x0 < 0.6 || !near(x0, z, 125) || rand() > 0.42) continue;
        const x = x0 + rand() * (x1 - x0);
        if (STAIRS.some((sx) => Math.abs(sx - x) < 3.5)) continue;
        E.push({ t: 'wash_line', at: [x, z], y: a.y + Math.min(a.G, b.G) + 1.85, rot: Math.PI / 2, len: 3.0, emb: [0.25, 0.25], clear: [0.55, 0.55], drop: 0.9, seed: a.seed + b.seed });
      }
    }
  }
  for (const l of all) {
    if (!near((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2, 110)) continue;
    const { P, L, out } = frameOf(l);
    // a pole out of an upper window with its washing
    if (l.storeys >= 2 && !l.gallery && !l.perron && !l.hostel && !l.shop && L > 4 && rand() < 0.2) {
      const nw = Math.max(1, Math.floor(L / 2.3)), u = (Math.floor(rand() * nw) + 0.5) * L / nw;
      E.push({ t: 'laundry_pole', at: P(u, -0.05), y: l.y + l.G + 0.85, rot: out, len: 1.25, seed: l.seed });
    }
    // a lantern on its bracket by the door of each shop on the pilgrims' way and at the hostel
    if (l.shop) {
      const sp = shopPoint(l), dir = l.seed % 2 ? 1 : -1, u = sp.a0 + dir * 2.45;
      if (u > 0.3 && u < L - 0.3) E.push({ t: 'lantern', kind: 'iron', h: 2.3, at: P(u, -0.12), y: l.y, rot: out, seed: l.seed });
    }
    // the door's front of a house: what a household keeps there (the shops have their goods)
    if (!l.shop && !l.hostel && L > 3.6 && rand() < 0.62) {
      const u = rand() < 0.5 ? 0.45 : L - 0.45, pick = rand();
      if (pick < 0.22) E.push({ t: 'ladder', at: P(u, -0.12), y: l.y, rot: out, len: 3.2 });
      else if (pick < 0.4) E.push({ t: 'barrow', kind: 'front', at: P(L / 2 + 0.6, -0.9), y: l.y, rot: out + Math.PI / 2, seed: l.seed });
      else if (pick < 0.58) E.push({ t: 'sacks', at: P(u, -0.5), y: l.y, rot: out, n: 3, seed: l.seed });
      else if (pick < 0.74) E.push({ t: 'stool', at: P(u, -0.5), y: l.y, rot: out, seed: l.seed }), E.push({ t: 'basket', at: P(u + 0.5, -0.4), y: l.y, rot: out, n: 1, seed: l.seed + 4, goods: 'cloth_white' });
      else if (pick < 0.88) E.push({ t: 'crates', at: P(u, -0.5), y: l.y, rot: out, n: 3, seed: l.seed });
      else E.push({ t: 'pot', kind: 'dark_pot', at: P(u, -0.45), y: l.y, rot: out, n: 2, seed: l.seed });
    }
  }
  return base('conques-lanelife', E);
}

// ── the pilgrims' square ─────────────────────────────────────────────────────
/** The stone cross of the square (style romanesque), the benches along its edge, the stalls, vendors, women at the Plò, children, pigeons. */
export function square() {
  const rand = rng(3113), L = [], S = [], R = [];
  const T = ABBEY.terrace, O = ABBEY.origin;
  const wx = T[0] + 3.2;                                                    // the stalls stand along the west edge, buyers to the east
  const wares = [['bread', 'cloth_white'], ['pottery', 'cloth_red'], ['baskets', 'cloth_ochre'], ['bolts', 'cloth_green'], ['heap', 'cloth_white']];
  wares.forEach(([goods, awning], i) => {
    const z = 20 + i * 5.2;
    L.push({ t: 'stall', at: [wx, z], y: 0, rot: Math.PI / 2, awning, goods: [goods, 'basket'], w: 2.6, d: 1.4, seed: 40 + i });
    L.push({ t: 'figure', at: [wx - 1.3, z], y: 0, rot: face([wx - 1.3, z], [wx + 5, z + 0.3]), h: 1.6 + rand() * 0.1, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CL[i % CL.length], cloth2: 'cloth_white', skin: 'skin_light', hat: i % 2 ? 'veil' : 'cap', hatMat: 'cloth_white', hair: 'bun', over: 'apron', pose: 'stand' });
  });
  // buyers: a pilgrim bargaining at a stall, two women with baskets, a child at her mother's skirt
  const buy = (at, to, o = {}) => L.push({ t: 'figure', at, y: 0, rot: face(at, to), h: 1.58 + rand() * 0.16, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CL[Math.floor(rand() * 3)], cloth2: 'cloth_grey', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_brown', pose: 'talk', ...o });
  buy([wx + 2.0, 20.3], [wx, 20.4]); buy([wx + 2.2, 30.5], [wx, 30.8], { hat: 'veil', hatMat: 'cloth_white', hair: 'bun', carry: 'basket', pose: 'stand', cloth: 'cloth_red' });
  buy([wx + 2.4, 36], [wx, 36], { child: true, hat: 'none', hair: 'short', pose: 'stand', h: 1.1, cloth: 'cloth_ochre' });
  // the cross, on its steps, and the benches along the terrace's edge with pilgrims resting
  R.push({ t: 'croix', at: [-37, 29], y: 0, h: 3.4 });
  for (const z of [-17, -4, 41, 52]) {
    L.push({ t: 'bench', at: [T[0] + 2.0, z], y: 0, rot: Math.PI / 2, len: 2.0, back: true });
    if (z === -4 || z === 41) L.push({ t: 'figure', at: [T[0] + 2.2, z + 0.5], y: 0, rot: face([0, 0], [1, 0]), h: 1.6, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_grey', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_brown', pose: 'sit', carry: 'none' });
  }
  // the Plò: women with jars, a child, a dog drinking
  const fp = FOUNTAINS[0].rect, fx = fp[2] + 1.6, fz = (fp[1] + fp[3]) / 2;
  for (let k = 0; k < 3; k++) {
    const at = [fx + rand() * 1.2, fz - 1.4 + k * 1.4];
    L.push({ t: 'figure', at, y: 0, rot: face(at, [fp[2], fz]), h: 1.56, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CL[(k + 3) % CL.length], cloth2: 'cloth_white', skin: 'skin_light', hat: 'veil', hatMat: 'cloth_white', hair: 'bun', over: 'apron', pose: k === 1 ? 'talk' : 'stand', carry: k === 0 ? 'pot' : 'none' });
  }
  L.push({ t: 'animal', kind: 'dog', at: [fx + 0.6, fz + 2.9], y: 0, rot: face([0, 0], [-1, 0]), seed: 7 });
  L.push({ t: 'chickens', kind: 'pigeon', at: [O[0] - 16, -6], y: 0, n: 6, seed: 3 }); L.push({ t: 'chickens', kind: 'pigeon', at: [-40, 46], y: 0, n: 5, seed: 5 });
  // two children playing with a hoop and a ball of rags before the church; a mule with its panniers waiting by the west wall
  for (const [at, to] of [[[-33, 8], [-31, 9.5]], [[-31, 9.5], [-33, 8]]]) L.push({ t: 'figure', at, y: 0, rot: face(at, to), h: 1.15, child: true, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hair: 'short', pose: 'stand' });
  L.push({ t: 'animal', kind: 'donkey', at: [T[0] + 1.6, 3], y: 0, rot: Math.PI / 2, seed: 11, gear: true });
  L.push({ t: 'sacks', at: [T[0] + 2.8, 3.6], y: 0, rot: 0, n: 3, seed: 8 });
  return [base('conques-square', L), base('conques-square-works', R, 'romanesque')];
}

// ── the vigil, the cloister, the workers ─────────────────────────────────────
export function insides() {
  const rand = rng(4114), L = [], O = ABBEY.origin;
  const robe = (at, y, rot, o) => L.push({ t: 'figure', at, y, rot, h: 1.58 + rand() * 0.14, seed: Math.floor(rand() * 1e9), dress: 'robe', skin: 'skin_light', ...o });
  // the tribune (§1i): pilgrims keeping vigil along its breast, looking down the nave to the Majesty
  for (const [lx, lz, p] of [[8.5, -6.2, 'kneel'], [11.2, -5.7, 'kneel'], [14.0, -6.3, 'kneel'], [6.8, -5.6, 'stand'], [17.5, -5.4, 'stand']]) {
    const at = [O[0] + lx, O[1] + lz];
    robe(at, 10.9, face(at, [at[0] + 4, 0]), { cloth: CL[Math.floor(rand() * 3)], cloth2: 'cloth_grey', hat: p === 'kneel' ? 'cap' : 'brim', hatMat: 'cloth_brown', pose: p, ...(p === 'kneel' ? { arms: 'pray' } : {}) });
  }
  // the cloister: monks walking the galleries, one reading by the basin, one on his knees at the beds of the garth, two in talk
  const cl = [O[0], O[1] + 9.7];                              // the cloister square's west-north corner (nave's outer wall at z = 9.7)
  const mk = (lx, lz, to, o = {}) => { const at = [cl[0] + lx, cl[1] + lz]; robe(at, 0.05, face(at, [cl[0] + to[0], cl[1] + to[1]]), { cloth: 'cloth_black', cloth2: 'cloth_black', hat: 'veil', hatMat: 'cloth_black', hair: 'shaven', over: 'cape', ...o }); };
  mk(9.7, 1.4, [14, 1.4]); mk(1.6, 9.7, [1.6, 15], { pose: 'staff' }); mk(17.8, 8.5, [17.8, 3]);
  mk(7.6, 8.9, [9.7, 9.7], { pose: 'talk' }); mk(8.6, 10.6, [7.6, 8.9], { pose: 'talk' });
  mk(13.2, 12.6, [9.7, 9.7], { pose: 'kneel', arms: 'hang', hat: 'none' });
  mk(12.4, 4.6, [9.7, 6.0]);
  // the workers of the open shops
  for (const l of lots()) {
    if (l.open !== 'shop') continue;
    const { P, L: W, D, out } = frameOf(l), fy = l.y + 0.1, at = (u, v) => P(u, v), to = (u, v) => P(u, v);
    const f = (u, v, tu, tv, o) => { const a = at(u, v); robe(a, fy, face(a, to(tu, tv)), o); };
    const apron = { cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_brown', over: 'apron' };
    if (l.trade === 'bread') f(W / 2 - 0.1, D / 2 + 0.95, W / 2, 0, { ...apron, cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white' });
    else if (l.trade === 'smith') f(W / 2, D / 2 + 0.55, W / 2, D / 2 - 0.4, { ...apron, cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'none', hair: 'short', beard: true, pose: 'talk' });
    else if (l.trade === 'weaver') { const v = D - 1.4 - 0.7, a = at(W / 2, v); robe(a, fy, face(a, at(W / 2, v + 1)), { cloth: 'cloth_ochre', cloth2: 'cloth_white', hat: 'veil', hatMat: 'cloth_white', hair: 'bun', pose: 'sit' }); }
    else if (l.trade === 'tavern') f(3.7, D - 1.5, 3.7, 0.8, { ...apron, cloth: 'cloth_maroon' });
    else f(Math.min(W - 1, Math.max(1, shopPoint(l).a0 + 0.9)), 1.4, W / 2, -2, { ...apron });
    void out;
  }
  return [base('conques-insides', L)];
}

// ── the river: the washing-place, the fishers, the geese ─────────────────────
const rz = (x) => RIVER.z + 14 * Math.sin(x / 90);
export function riverLife() {
  const rand = rng(5115), L = [];
  const bank = (x, d) => { const z = rz(x) - RIVER.w / 2 - d; return [x, z, height(x, z)]; };
  // women at the washing-place by the bridge: kneeling on the stones, linen spread on the bank, baskets
  for (let k = 0; k < 4; k++) {
    const x = BRIDGE.x + 16 + k * 2.6, [bx, bz, by] = bank(x, 2.6);
    L.push({ t: 'figure', at: [bx, bz], y: by, rot: face([bx, bz], [bx, bz + 3]), h: 1.54, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CL[(k + 1) % CL.length], cloth2: 'cloth_white', skin: 'skin_light', hat: 'veil', hatMat: 'cloth_white', hair: 'bun', over: 'apron', pose: 'kneel', arms: 'hang' });
    L.push({ t: 'basket', at: [bx + 0.8, bz - 0.4], y: by, rot: 0, n: 1, seed: 90 + k, goods: 'cloth_white' });
  }
  for (let k = 0; k < 3; k++) { const [bx, bz, by] = bank(BRIDGE.x + 28 + k * 1.8, 4.5); L.push({ t: 'goods_mat', at: [bx, bz], y: by, rot: 0.2 * k, mat: 'linen', goods: ['bolts'], produce: ['cloth_white'], seed: k }); }
  // a fisher sitting on the bank upstream with his line, a boy beside him; geese and ducks at the water
  { const [bx, bz, by] = bank(BRIDGE.x - 34, 2.4); L.push({ t: 'figure', at: [bx, bz], y: by, rot: face([bx, bz], [bx, bz + 3]), h: 1.6, seed: 5, dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_brown', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_brown', pose: 'sit_low' }); L.push({ t: 'basket', at: [bx + 1.0, bz - 0.2], y: by, rot: 0, n: 1, seed: 6, goods: 'hide_tan' }); }
  { const [bx, bz, by] = bank(BRIDGE.x - 31.5, 2.6); L.push({ t: 'figure', at: [bx, bz], y: by, rot: face([bx, bz], [bx, bz + 3]), h: 1.1, child: true, seed: 8, dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hair: 'short', pose: 'sit_low' }); }
  for (const [dx, kind, n] of [[BRIDGE.x + 38, 'goose', 5], [BRIDGE.x - 52, 'duck', 6], [BRIDGE.x + 52, 'duck', 4]]) { const [bx, bz, by] = bank(dx, 3.2); L.push({ t: 'chickens', kind, at: [bx, bz], y: by, n, seed: Math.floor(dx) }); }
  // a mule with its load drinking at the ford below the bridge, a drover resting
  { const [bx, bz, by] = bank(BRIDGE.x - 14, 3.0); L.push({ t: 'animal', kind: 'donkey', at: [bx, bz], y: by, rot: Math.PI / 2 + 0.2, seed: 21, gear: true, graze: true }); L.push({ t: 'figure', at: [bx - 2.2, bz - 0.8], y: height(bx - 2.2, bz - 0.8), rot: face([0, 0], [1, 0.3]), h: 1.66, seed: 22, dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_grey', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_brown', pose: 'sit_low' }); }
  return [base('conques-river-life', L)];
}

// ── the beasts: cats on the copings, dogs at the doors, donkeys, goats and sheep in the pens ─
export function beasts() {
  const rand = rng(6116), L = [], all = lots();
  // cats on the retaining walls' copings along the lanes, dozing in the sun
  for (let k = 0; k + 1 < BAND.n; k++) {
    const zm = bandZ(k) + (BAND.wall[0] + BAND.wall[1]) / 2;
    for (let x = -90; x < 90; x += 17 + rand() * 14) {
      if (!near(x, zm, 105) || STAIRS.some((s) => Math.abs(s - x) < 4) || (zm > -50 && zm < 75 && x > -64 && x < 74)) continue;
      L.push({ t: 'animal', kind: 'cat', at: [x, zm], y: level(k) + 0.13, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), pose: ['sit', 'lie', 'lie'][Math.floor(rand() * 3)] });
    }
  }
  // dogs at some doors; a donkey tied at the hostel; a pig in the lane's corner of the lower rows
  let n = 0;
  for (const l of all) {
    const { P, out } = frameOf(l), cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    if (!near(cx, cz, 95) || l.hostel || rand() > 0.045) continue;
    L.push({ t: 'animal', kind: n++ % 5 === 4 ? 'pig' : 'dog', at: P(1.0 + rand() * 2, -0.8), y: l.y, rot: out + Math.PI * (0.5 + rand()), seed: Math.floor(rand() * 1e9) });
  }
  const [hx0, hz0, hx1, hz1] = HOSTEL.rect;
  L.push({ t: 'animal', kind: 'donkey', at: [hx0 + 11.5, hz1 + 1.1], y: level(6), rot: Math.PI / 2, seed: 33, gear: true });
  L.push({ t: 'animal', kind: 'donkey', at: [hx1 - 0.6, hz1 + 1.1], y: level(6), rot: -Math.PI / 2, seed: 34, gear: false });
  // sheep and goats in the pens (the gardens of the fourth kind)
  for (const g of gardens()) {
    if (((g.seed >>> 3) % 4) !== 3 || !near((g.rect[0] + g.rect[2]) / 2, (g.rect[1] + g.rect[3]) / 2, 175)) continue;
    const cx = (g.rect[0] + g.rect[2]) / 2, cz = (g.rect[1] + g.rect[3]) / 2, w = g.rect[2] - g.rect[0];
    const kind = g.seed % 2 ? 'sheep' : 'goat';
    for (let i = 0; i < (w > 6 ? 3 : 2); i++) L.push({ t: 'animal', kind, at: [cx - 1.2 + i * 1.5, cz + (i % 2) * 0.7], y: g.y, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), graze: i % 2 === 0 });
  }
  return [base('conques-beasts', L)];
}

export function extras() { return [laneLife(), ...square(), ...insides(), ...riverLife(), ...beasts()]; }
