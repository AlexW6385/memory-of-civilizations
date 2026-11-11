// The log houses (izby) of the boyars' courts and the posad (docs/settlements/muscovy.md §5).
import { RADIUS, ROWS, SQUARE, LOBNOYE, CATHEDRALS, SPASSKY, MOAT, BASIL, CHURCHES, lots, height, wallX, gateZ, streetSegments, inKremlin } from './layout.js';
const base = (id, elements) => ({ id, style: 'muscovite', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, 20], facing: 's' } });
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
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`muscovy-houses-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'izba', ...l, front: front(l.rect), open: openIzba(l), variant: variantOf(l), yard: Math.hypot((l.rect[0] + l.rect[2]) / 2 - 40, (l.rect[1] + l.rect[3]) / 2 - 20) < 240 ? 6.7 : 0, groundY: height }))));
  const yb = yards(all); for (let i = 0; i < yb.length; i += 300) plans.push(base(`muscovy-yards-${i / 300}`, yb.slice(i, i + 300)));
  plans.push(base('muscovy-streets', streets()), base('muscovy-market', market()), base('muscovy-churches', CHURCHES.map(([x, z, yaw]) => ({ t: 'log_church', c: [x, z], y: height(x, z), yaw }))));
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
  // in St Basil's central church: a priest before the royal doors, a few of the faithful standing (docs §10)
  { const [bx, bz] = BASIL, by = height(bx, bz) + 4.02;
    fig([bx + 1.6, bz], -Math.PI / 2, { y: by, cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'cape', hat: 'none', beard: 1, hair: 'long' });
    for (let q = 0; q < 7; q++) { const at = [bx - 0.5 - rand() * 3, bz + (rand() - 0.5) * 4.5]; fig(at, -Math.PI / 2 + (rand() - 0.5) * 0.4, { y: by, pose: 'stand', hat: 'none' }); } }
  return L;
}

/** The street paving: half-round logs down the middle of every street of the grid, wherever it is not the Kremlin's open ground, the square, the river or a reserved site. */
function streets() {
  return streetSegments().map(({ a, b }, i) => ({ t: 'street_log', a, b, w: 5, y: height, seed: 11 + i }));
}
/** The market on Red Square: rows of stalls west of the lane before the trading rows, back to back along the square's east side, a few more on the Nikolsky side. */
function market() {
  const L = [], x0 = SQUARE[2] - 20;
  for (const [z, n] of [[-110, 6], [-62, 6], [-12, 5], [100, 5]]) {
    L.push({ t: 'stalls', c: [x0 + 2.4, z], n, along: 'z', face: -1, y: height, seed: 40 + z, gap: 0.4 });
    L.push({ t: 'stalls', c: [x0 + 6.0, z], n, along: 'z', face: 1, y: height, seed: 90 + z, gap: 0.4 });
  }
  return L;
}

/**
 * The yards (docs §5.3): in the free strip beside each house, within its own cell, a small log building (bania, klet, byre) or a well sweep
 * at the back, and a kitchen garden in the strip on the other side or in the same when there is no room for both.
 */
function yards(all) {
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
