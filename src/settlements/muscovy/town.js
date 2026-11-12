// The log houses (izby) of the boyars' courts and the posad (docs/settlements/muscovy.md §5).
import { RADIUS, ROWS, SQUARE, LOBNOYE, CATHEDRALS, SPASSKY, NIKOLSKY, MOAT, BASIL, CHURCHES, lots, height, wallX, gateZ, streetSegments, inKremlin, RIVER, riverZ } from './layout.js';
const base = (id, elements, rooms = []) => ({ id, style: 'muscovite', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, 20], facing: 's' } });
// the gable end of each house turned to the nearer street (the streets of layout.js: x = 42 − 420 + 84k, z = 35 − 420 + 70k)
function front([x0, z0, x1, z1]) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (x1 - x0 >= z1 - z0) { const sx = Math.round((cx + 378) / 84) * 84 - 378; return sx < cx ? 'x0' : 'x1'; }
  const sz = Math.round((cz + 385) / 70) * 70 - 385; return sz < cz ? 'z0' : 'z1';
}
/** The izby furnished inside and open (docs §5.1): one in five within reach of Red Square, one in thirty-one beyond. */
export const openIzba = (l) => { const d = Math.hypot((l.rect[0] + l.rect[2]) / 2 - 40, (l.rect[1] + l.rect[3]) / 2 - 20); return d < 90 ? l.seed % 2 === 0 : d < 200 ? l.seed % 3 === 0 : l.seed % 12 === 0; };
/** Which build a lot has: the storehouse (barn), the two-storey house (a boyar's or a rich merchant's court: half the courts inside the Kremlin, one in eight near the square, one in twenty-five beyond), else the plain izba. */
export function variantOf(l) {
  if (l.kind === 'barn') return 'barn';
  if (openIzba(l)) return 'one';
  const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, d = Math.hypot(cx - 40, cz - 20), h = (l.seed >> 3) % 100;
  return h < (inKremlin(cx, cz) ? 45 : d < 260 ? 13 : 4) ? 'two' : 'one';
}
/** The rooms of the furnished izby (kind 'house', for the sound inside): the one room, its floor a little over the ground. */
const roomsOf = (chunk) => chunk.filter((l) => openIzba(l)).map((l) => ({ id: `izba-${l.seed}`, rect: [l.rect[0] + 0.3, l.rect[1] + 0.3, l.rect[2] - 0.3, l.rect[3] - 0.3], y: l.y + 0.32, kind: 'house' }));
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`muscovy-houses-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'izba', ...l, front: front(l.rect), open: openIzba(l), variant: variantOf(l), yard: Math.hypot((l.rect[0] + l.rect[2]) / 2 - 40, (l.rect[1] + l.rect[3]) / 2 - 20) < 240 ? 6.7 : 0, groundY: height })), roomsOf(all.slice(i, i + 200))));
  const yb = yards(all); for (let i = 0; i < yb.length; i += 300) plans.push(base(`muscovy-yards-${i / 300}`, yb.slice(i, i + 300)));
  plans.push(base('muscovy-streets', streets()), base('muscovy-market', market()), base('muscovy-churches', CHURCHES.map(([x, z, yaw]) => ({ t: 'log_church', c: [x, z], y: height(x, z), yaw }))));
  plans.push(base('muscovy-stages', stages()), { ...base('muscovy-river-life', riverLife()), style: 'life' });
  plans.push({ ...base('muscovy-people', people()), style: 'life' });
  return plans;
}

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_grey', 'cloth_ochre', 'cloth_brown'];
/**
 * The people (docs/settlements/muscovy.md §10): the booksellers on the Spassky bridge, merchants at their
 * shop fronts in the rows and buyers in the lanes, a crowd at the Lobnoye Mesto, a priest and the
 * faithful in the Dormition.
 */
export function people() {
  const rand = rng(1600), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: 'skin_light', hat: rand() < 0.6 ? 'cap' : 'none', hatMat: rand() < 0.5 ? 'hide_brown' : 'cloth_red', hair: rand() < 0.6 ? 'short' : 'long', beard: rand() < 0.75 ? 1 : 0, legs: 'hose', feet: 'shod', over: rand() < 0.4 ? 'sash' : 'none', ...o });
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  // the booksellers at the square's end of the Spassky bridge, their books in crates by the railing
  const zb = gateZ(SPASSKY[1]), xe = wallX(zb) + MOAT.d1 + 2.4;
  for (const e of [-1, 1]) { const at = [xe + 1.6, zb + e * 4.2]; L.push({ t: 'crates', at, y: height(...at), rot: 0, seed: Math.floor(rand() * 1e9), n: 3 }); fig([at[0] + 0.9, at[1] - e * 0.6], -Math.PI / 2 + (rand() - 0.5) * 0.5, { pose: 'stand' }); }
  for (let k = 0; k < 4; k++) { const at = [xe + 2 + rand() * 4, zb + (rand() - 0.5) * 6]; fig(at, face(at, [xe, zb]) + (rand() - 0.5) * 1.5, { pose: rand() < 0.5 ? 'talk' : 'stand' }); }
  // the rows: a merchant at a shop front now and then, buyers in the lanes and on the square before them
  const [x0, z0, x1, z1] = ROWS, k = (x1 - x0) / 20;
  for (const lane of [x0 - 1.4, x0 + 5.5 * k, x0 + 15.5 * k]) for (let z = z0 + 4; z < z1 - 4; z += 5 + rand() * 7) {
    const at = [lane + (rand() - 0.5) * 0.8, z];
    fig(at, rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, { pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.2 ? 'basket' : 'none' });
  }
  // the crowd at the Lobnoye Mesto, facing the platform; a crier on it reading a decree
  const ly = height(...LOBNOYE) + 1.0;
  fig([LOBNOYE[0] - 1, LOBNOYE[1]], -Math.PI / 2, { y: ly, pose: 'talk', cloth: 'cloth_red', hat: 'cap', hatMat: 'hide_black' });
  for (let q = 0; q < 22; q++) { const a = Math.PI * 0.55 + rand() * Math.PI * 0.9, d = 8.5 + rand() * 6, at = [LOBNOYE[0] + Math.cos(a) * d, LOBNOYE[1] + Math.sin(a) * d]; fig(at, face(at, LOBNOYE) + (rand() - 0.5) * 0.4, { pose: rand() < 0.25 ? 'talk' : 'stand' }); }
  // in the Dormition: a priest before the royal doors, the faithful standing in the nave
  const D = CATHEDRALS.dormition, F = height((D[0] + D[2]) / 2, (D[1] + D[3]) / 2) + 0.15, xI = D[0] + 1.3 + 3 * (D[2] - D[0] - 2.6) / 4, cz = (D[1] + D[3]) / 2;
  fig([xI - 1.6, cz], -Math.PI / 2, { y: F, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cape', hat: 'none', beard: 1, hair: 'long' });
  for (let q = 0; q < 14; q++) { const at = [xI - 5 - rand() * 9, cz + (rand() - 0.5) * 5.2]; fig(at, -Math.PI / 2 + (rand() - 0.5) * 0.3, { y: F, pose: 'stand', hat: 'none', over: rand() < 0.5 ? 'cape' : 'none' }); }
  // the traffic of the lane before the rows (docs §10): goods sledges — the sledge served in summer too — with their
  // horses and drivers, two-wheeled carts in their shafts, pedlars with their packs, a kvass seller at his cask
  const lx = (ROWS[0] + SQUARE[2]) / 2 - 1.3;
  for (const [k, z] of [-100, -22, 52].entries()) {
    const y = height(lx, z);
    L.push({ t: 'sledge', at: [lx, z], y, rot: 0, seed: 300 + k, load: k === 1 ? 'sacks' : 'bales' });
    L.push({ t: 'animal', kind: 'horse', at: [lx, z - 2.75], y: height(lx, z - 2.75), rot: 0, seed: 310 + k });
    fig([lx - 1.05, z - 1.6], 0, { pose: k === 2 ? 'talk' : 'stand', over: 'sash' });
  }
  for (const [k, z] of [-62, 16, 84].entries()) { const y = height(lx, z); L.push({ t: 'cart', kind: 'two', beast: 'horse', load: ['sacks', 'barrels', 'hay'][k], at: [lx, z], y, rot: Math.PI, seed: 320 + k }); fig([lx + 1.1, z + 1.8], Math.PI, { carry: 'staff', len: 1.6 }); }
  for (let k = 0; k < 7; k++) { const at = [SQUARE[2] - 1 - rand() * 3, -120 + k * 30 + rand() * 10]; fig(at, rand() * 6.28, { carry: k % 3 === 0 ? 'basket' : 'bundle', pose: 'stand' }); }
  { const at = [SQUARE[2] - 2, 30]; L.push({ t: 'barrel', at, y: height(...at), rot: 0, seed: 330, n: 1 }); fig([at[0] + 0.7, at[1] + 0.2], -Math.PI / 2, { over: 'apron', cloth2: 'linen' }); fig([at[0] - 0.9, at[1] - 0.3], Math.PI / 2, { pose: 'talk' }); }
  // in the Palace of Facets: the tsar on his throne, boyars standing along the benches and a few sitting, in their tall coats
  { const F = CATHEDRALS.facets, fy = height((F[0] + F[2]) / 2, (F[1] + F[3]) / 2) + 5.5 + 0.05, tx = F[0] + 1.6 + 0.8, tz = (F[1] + F[3]) / 2;
    fig([tx + 0.4, tz], -Math.PI / 2, { y: fy + 0.6, pose: 'sit', cloth: 'cloth_red', cloth2: 'cloth_ochre', over: 'cape', hat: 'cap', hatMat: 'gilt_bronze', beard: 1, hair: 'long' });
    for (let q = 0; q < 9; q++) { const side = q % 3, at = side === 0 ? [F[0] + 3.4 + rand() * 18, F[1] + 3.1 + rand() * 0.5] : side === 1 ? [F[0] + 3.4 + rand() * 18, F[3] - 3.1 - rand() * 0.5] : [F[0] + 3.2 + rand() * 1.5, F[1] + 4 + rand() * 16]; fig(at, face(at, [(F[0] + F[2]) / 2, tz]) + (rand() - 0.5) * 0.4, { y: fy, pose: q % 4 === 0 ? 'sit' : 'stand', hat: 'cap', hatMat: 'hide_brown', beard: 1, hair: 'long', over: 'sash' }); } }
  // in St Basil's central church: a priest before the royal doors, a few of the faithful standing (docs §10)
  { const [bx, bz] = BASIL, by = height(bx, bz) + 4.02;
    fig([bx + 1.6, bz], -Math.PI / 2, { y: by, cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'cape', hat: 'none', beard: 1, hair: 'long' });
    for (let q = 0; q < 7; q++) { const at = [bx - 0.5 - rand() * 3, bz + (rand() - 0.5) * 4.5]; fig(at, -Math.PI / 2 + (rand() - 0.5) * 0.4, { y: by, pose: 'stand', hat: 'none' }); } }
  stallFolk(L, rand, fig, face);
  squareLife(L, rand, fig, face);
  return L;
}
/**
 * The open square (docs §5.2): guards at the gates, beggars at St Basil's steps, a holy fool, groups talking, firewood and hay carts with their horses,
 * pigs and dogs and geese loose among them, scattered over the open middle of Red Square (not on the arrival, the Lobnoye Mesto, the lane or the church).
 */
function squareLife(L, rand, fig, face) {
  const taken = [[40, 20, 7], [LOBNOYE[0], LOBNOYE[1], 18], [LOBNOYE[0], LOBNOYE[1] + 16, 8], [BASIL[0], BASIL[1], 36]];
  const free = (x, z, r = 1.5) => !taken.some(([a, b, c]) => Math.hypot(x - a, z - b) < c + r) && !(x > -9 && x < 6 && z > -125 && z < 55) && !(x > 33 && x < 47 && z > 8 && z < 102);
  const spot = (r) => { for (let k = 0; k < 40; k++) { const x = -8 + rand() * 52, z = -140 + rand() * 235; if (free(x, z, r)) { taken.push([x, z, r]); return [x, z]; } } return null; };
  const y = (p) => height(p[0], p[1]);
  // the guards at the gates: pairs of streltsy in coats of one colour, staves in hand, before the Spassky and Nikolsky bridges
  for (const t of [SPASSKY[1], NIKOLSKY[1]]) { const zb = gateZ(t), xb = wallX(zb) + MOAT.d1 + 6.5, col = t === SPASSKY[1] ? 'cloth_red' : 'cloth_indigo'; for (const e of [-1, 1]) fig([xb, zb + e * 3.2], -Math.PI / 2, { pose: 'stand', cloth: col, cloth2: 'linen', over: 'sash', hat: 'cap', hatMat: 'hide_black', carry: 'staff', beard: 1 }); }
  // beggars on St Basil's platform steps and a holy fool with his chain and bare feet
  for (let k = 0; k < 3; k++) { const at = [BASIL[0] - 9 + k * 1.3, BASIL[1] - 17 - (k % 2) * 0.4]; fig(at, Math.PI, { pose: 'sit_low', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'none', hair: 'long', beard: 1, y: y(at) }); }
  { const at = [24, 60]; fig(at, 2.2, { pose: 'talk', cloth: 'cloth_white', cloth2: 'linen', hat: 'none', hair: 'long', beard: 1, feet: 'bare', over: 'none', y: y(at) }); }
  // groups of two and three in talk, a wife with her basket, a boy with a dog
  for (let g = 0; g < 14; g++) { const p = spot(2.6); if (!p) continue; const n = 2 + (rand() < 0.4 ? 1 : 0); for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + rand(), at = [p[0] + Math.cos(a) * 0.9, p[1] + Math.sin(a) * 0.9]; fig(at, face(at, p) + (rand() - 0.5) * 0.4, { pose: k ? 'talk' : 'stand', carry: rand() < 0.2 ? 'basket' : 'none', y: y(at) }); } }
  // carts and sledges with their beasts, parked: firewood, hay, barrels
  for (let k = 0; k < 7; k++) { const p = spot(4); if (!p) continue; const rot = rand() < 0.5 ? 0 : Math.PI, load = ['hay', 'barrels', 'sacks', 'hay'][k % 4]; L.push({ t: 'cart', kind: 'two', beast: 'horse', load, at: p, y: y(p), rot, seed: 400 + k }); fig([p[0] + 1.2, p[1] + (rot ? 2.0 : -2.0)], rot, { carry: 'staff', over: 'sash', y: y([p[0] + 1.2, p[1]]) }); }
  for (let k = 0; k < 5; k++) { const p = spot(3); if (!p) continue; L.push({ t: 'firewood', at: p, y: y(p), rot: rand() * 3, seed: 430 + k, len: 2 }); }
  for (let k = 0; k < 4; k++) { const p = spot(3); if (p) L.push({ t: 'haystack', at: p, y: y(p), rot: rand() * 6, seed: 440 + k }); }
  for (let k = 0; k < 6; k++) { const p = spot(1.8); if (p) L.push({ t: 'barrel', at: p, y: y(p), rot: 0, seed: 450 + k, n: 1 + (k % 3) }); }
  for (let k = 0; k < 4; k++) { const p = spot(1.5); if (p) L.push({ t: 'crates', at: p, y: y(p), rot: rand() * 3, seed: 455 + k, n: 3 }); }
  // the animals loose on the square: dogs, pigs rooting, goats, geese, hens
  for (const [kind, n] of [['dog', 7], ['pig', 5], ['goat', 5], ['sheep', 4]]) for (let k = 0; k < n; k++) { const p = spot(1.5); if (p) L.push({ t: 'animal', kind, at: p, y: y(p), rot: rand() * 6.28, seed: 500 + k * 7 }); }
  for (let k = 0; k < 4; k++) { const p = spot(2.2); if (p) L.push({ t: 'chickens', kind: k % 2 ? 'goose' : 'hen', at: p, y: y(p), rot: rand() * 6, n: k % 2 ? 6 : 5, seed: 520 + k }); }
}

/** The street paving: half-round logs down the middle of every street of the grid, wherever it is not the Kremlin's open ground, the square, the river or a reserved site. */
function streets() {
  return streetSegments().map(({ a, b }, i) => ({ t: 'street_log', a, b, w: 5, y: height, seed: 11 + i }));
}
/** The market on Red Square: rows of stalls west of the lane before the trading rows, back to back along the square's east side, a few more on the Nikolsky side. */
const marketRows = () => {
  const R = [], x0 = SQUARE[2] - 20;
  for (const [z, n] of [[-110, 6], [-62, 6], [-12, 5], [100, 5]]) {
    R.push({ c: [x0 + 2.4, z], n, face: -1, seed: 40 + z }, { c: [x0 + 6.0, z], n, face: 1, seed: 90 + z });
  }
  // a second market, west of the open middle of the square: two more double rows of booths, the way between them and the Lobnoye Mesto kept clear
  for (const [z, n] of [[-112, 6], [-64, 6], [-16, 6], [34, 5]]) R.push({ c: [-3.4, z], n, face: -1, seed: 140 + z }, { c: [0.2, z], n, face: 1, seed: 190 + z });
  return R;
};
function market() {
  return marketRows().map((r) => ({ t: 'stalls', c: r.c, n: r.n, along: 'z', face: r.face, y: height, seed: r.seed, gap: 0.4 }));
}
/** Buyers and sellers at the stalls: a woman with a basket, a man haggling, a boy, in front of about two stalls in five (the stalls open on one side, 1.5 m deep). */
function stallFolk(L, rand, fig, face) {
  for (const r of marketRows()) for (let i = 0; i < r.n; i++) {
    if (rand() > 0.42) continue;
    const t = (i - (r.n - 1) / 2) * 2.7, at = [r.c[0] + r.face * (2.3 + rand() * 0.5), r.c[1] + t + (rand() - 0.5) * 0.8];
    if (Math.hypot(at[0] - 40, at[1] - 20) < 6) continue;
    const k = rand();
    fig(at, face(at, [r.c[0], at[1]]) + (rand() - 0.5) * 0.4, k < 0.4 ? { pose: rand() < 0.5 ? 'talk' : 'stand', carry: 'basket', dress: 'robe', hair: 'bun', over: 'shawl', hat: 'none' } : k < 0.8 ? { pose: rand() < 0.5 ? 'talk' : 'stand', beard: 1 } : { pose: 'stand', h: 1.1, hat: 'cap' });
  }
}
/**
 * The yards (docs §5.3): in the free strip beside each house, within its own cell, a small log building (bania, klet, byre) or a well sweep
 * at the back, and a kitchen garden in the strip on the other side or in the same when there is no room for both.
 */
export function yards(all) {
  const E = [], rand = rng(1604);
  for (const l of all) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, d = Math.hypot(cx - 40, cz - 20);
    if (d > 330) continue;
    const f = front(l.rect), ex = f[0] === 'x', sgF = f.endsWith('0') ? -1 : 1;
    const lat0 = ex ? z0 : x0, lat1 = ex ? z1 : x1, dp0 = ex ? x0 : z0, dp1 = ex ? x1 : z1, cl = ex ? cz : cx;
    const gLo = lat0 - (cl - 7) - 0.55, gHi = (cl + 7) - lat1 - 0.55;                    // free width each side, after the margins
    const R = (la, lb, da, db) => (ex ? [da, la, db, lb] : [la, da, lb, db]);
    const yy = (r) => Math.max(height(r[0], r[1]), height(r[2], r[1]), height(r[0], r[3]), height(r[2], r[3]));
    const bigSide = gLo >= gHi ? -1 : 1, gBig = Math.max(gLo, gHi), gSmall = Math.min(gLo, gHi);
    let used = 0;
    const sideRange = (s, w) => (s < 0 ? [lat0 - 0.3 - w, lat0 - 0.3] : [lat1 + 0.3, lat1 + 0.3 + w]);
    if (gBig >= 2.3 && rand() < (d < 200 ? 0.62 : 0.3)) {
      const kind = ['bania', 'klet', 'byre', 'sweep', 'klet', 'bania'][Math.floor(rand() * 6)], w = Math.min(gBig, kind === 'sweep' ? 2.4 : 2.5), [la, lb] = sideRange(bigSide, w);
      const back = sgF > 0 ? dp0 : dp1, len = kind === 'sweep' ? 2.4 : 3.0, da = sgF > 0 ? back + 0.4 : back - 0.4 - len, rect = R(la, lb, da, da + len);
      E.push({ t: 'yardbuild', rect, y: yy(rect) - (kind === 'klet' ? 0 : 0.1), kind, face: f, seed: l.seed + 7 });
      used = bigSide;
    }
    const gs = used === bigSide ? (gSmall >= 1.9 ? -bigSide : 0) : (gBig >= 1.9 ? bigSide : 0);
    if (gs && rand() < (d < 200 ? 0.8 : 0.45)) {
      const w = Math.min(gs < 0 ? gLo : gHi, 3.4), [la, lb] = sideRange(gs, w), rect = R(la, lb, dp0 + 0.3, dp1 - 0.3);
      E.push({ t: 'garden', rect, y: yy(rect), seed: l.seed + 13 });
    }
  }
  return E;
}

// the landing stages along both banks of the Moskva: x of each, on the north bank (the posad's side) and the south (Zamoskvorechye)
const STAGES = [[-250, 1], [-190, 1], [-120, 1], [-45, 1], [30, 1], [100, 1], [170, 1], [240, 1], [-200, -1], [-80, -1], [60, -1], [180, -1]];
const stageAt = ([x, side]) => { const z = riverZ(x) - side * 52; return { x, z, side, y: height(x, z) + 0.15 }; };
/** The stages (mostki) on their piles, and the log rafts moored in the river. */
function stages() {
  const L = [];
  STAGES.forEach((s, i) => { const g = stageAt(s); L.push({ t: 'landing', c: [g.x, g.z], y: g.y, dir: g.side, level: RIVER.level, bed: RIVER.bed, len: 11, seed: i + 1 }); });
  [[-150, 14, 0.05], [110, -6, -0.04], [-20, 20, 0.02]].forEach(([x, dz, yaw], i) => L.push({ t: 'raft', c: [x, riverZ(x) + dz], y: RIVER.level + 0.05, yaw, seed: 20 + i, n: 9 }));
  return L;
}
/** The people and boats at the water: washerwomen on the platforms, a fisher on the deck, boats at the stages, barges on the river, geese on the bank. */
function riverLife() {
  const L = [], rand = rng(1601), face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: o.dress ?? 'robe', cloth: ['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre', 'linen'][Math.floor(rand() * 5)], cloth2: 'linen', skin: 'skin_light', ...o });
  STAGES.forEach((s, i) => {
    const g = stageAt(s), Z = (d) => g.z + g.side * d, wl = RIVER.level + 0.5, water = [g.x, Z(30)];
    // washing: women kneeling on the lower platform, a basket of linen by each
    if (i % 3 !== 2) for (const dx of [-0.6, 0.9]) if (rand() < 0.8) fig([g.x + dx, Z(12.4)], face([g.x, Z(12.4)], water), { y: wl, pose: 'squat', hair: 'bun', over: 'shawl', arms: 'hang', hat: 'none', dress: 'robe' });
    L.push({ t: 'basket', at: [g.x + 1.7, Z(12.4)], y: wl, rot: 0, seed: 50 + i, n: 1 });
    if (i % 2 === 0) fig([g.x, Z(8.5)], face([g.x, Z(8.5)], water), { y: g.y, pose: 'stand', carry: 'staff', hair: 'short', beard: 1, hat: 'cap', hatMat: 'hide_brown', over: 'sash' });          // a fisher on the deck with his rod
    L.push({ t: 'boat', kind: i % 4 === 0 ? 'canoe' : 'rowboat', at: [g.x + 3.1, Z(12.5)], y: RIVER.level - 0.05, rot: (rand() - 0.5) * 0.2, seed: 70 + i });
    if (i % 4 === 1) L.push({ t: 'chickens', kind: 'goose', at: [g.x - 4, Z(-3)], y: height(g.x - 4, Z(-3)), rot: rand() * 6, n: 6, seed: 90 + i });
  });
  [-215, -95, 25, 150].forEach((x, i) => L.push({ t: 'boat', kind: 'barge', at: [x, riverZ(x) - 24 + i * 6], y: RIVER.level - 0.05, rot: Math.PI / 2 + (rand() - 0.5) * 0.08, seed: 120 + i }));
  return L;
}
