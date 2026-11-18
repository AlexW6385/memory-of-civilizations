// The upper floor of the houses that can be entered (docs/settlements/ur.md §5.14): Woolley's "the family lived above; on the
// ground floor were the reception room and the domestic offices". Over the roofs of the ranges of the house the shared
// urHouseOpen builds (src/styles/sumerian/house.js: the court's brick stair climbs to the roofs at 3.4 m) stand the rooms of
// the family: the bedchamber and the store over the back range, a room on the street over the front range with its open
// windows, the roof terrace between them, a timber gallery over the court, and a ladder of palm trunks to the roof of the rooms.
// All of it is built from the house's own frame (u along the front, v in from it) and its own seed; the pieces of every
// house differ by a hash of their own place. Only materials the houses of Ur already have.

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { rng } from './util.js';

const BB = 'brick_baked', MP = 'mud_plaster';
const H = 3.4, HC = 2.5, TOP = H + 2.8;          // the first roof (the upper floor), the ceiling's underside above it, the upper roof's top
const JAR = (s) => [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.07 * s, 0.7 * s], [0.001, 0.68 * s]];
const BOWL = (r) => [[0.001, 0], [r * 0.45, 0.005], [r, r * 0.45], [r * 0.93, r * 0.47], [r * 0.4, r * 0.12], [0.001, r * 0.1]];
const hash = (a, b, c = 0) => { let h = (Math.imul(Math.round(a * 100) | 0, 73856093) ^ Math.imul(Math.round(b * 100) | 0, 19349663) ^ Math.imul(c | 0, 83492791)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** The kinds of house and what each keeps upstairs (docs/settlements/ur.md §5.14). */
export const kindOf = (el) => (el.school ? 'school' : el.trade ? el.trade : el.family ? 'family' : 'merchant');

/** The house's frame (as urHouseOpen lays it out): sizes, the court, and the maps from the local (u, v) to the world. */
export function frame(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.door ?? 's';
  const U = f === 'n' || f === 's' ? x1 - x0 : z1 - z0, V = f === 'n' || f === 's' ? z1 - z0 : x1 - x0;
  const W = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = W(u0, v0), b = W(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const cl = (a, lo, hi) => Math.max(lo, Math.min(hi, a)), t = 0.55, ti = 0.4, dF = cl(V * 0.18, 1.9, 2.4), dB = cl(V * 0.26, 2.7, 3.4), dS = 2.6;
  const vC0 = t + dF + ti, vC1 = V - t - dB - ti, uC0 = t, uC1 = U - t - dS - ti;
  const dir = f === 'n' ? 's' : f === 's' ? 'n' : f === 'w' ? 'e' : 'w';
  return { f, U, V, W, R, t, ti, dF, dB, dS, vC0, vC1, uC0, uC1, dir, run: vC1 - vC0 };
}

/** Where the shared roofLife puts the sleeping mats, reeds and jars on the roofs (it has its own stream): the rectangles that those that stand tall take, in the world. */
function roofItems(el, F) {
  const { R, t, dF, dB, U, V, vC0, vC1, uC1, ti } = F;
  const rand = rng((el.seed || 1) * 13 + 5), wings = [R(t, 0, U - t, t + dF), R(t, V - t - dB, U - t, V - t), R(uC1 + ti, vC0, U - t, vC1)].filter((r) => r[2] - r[0] > 2.2 && r[3] - r[1] > 1.6), out = [];
  if (!wings.length) return out;
  const n = 1 + Math.floor(rand() * 2);
  for (let k = 0; k < n; k++) {
    const r = wings[Math.floor(rand() * wings.length)], cx = r[0] + 0.9 + rand() * (r[2] - r[0] - 1.8), cz = r[1] + 0.7 + rand() * (r[3] - r[1] - 1.4), kind = rand();
    if (kind < 0.45) { rand(); continue; }
    out.push(kind < 0.75 ? [cx - 0.95, cz - 0.15, cx + 0.95, cz + 0.55] : [cx - 0.3, cz - 0.3, cx + 0.9, cz + 0.5]);
  }
  return out;
}

/** The plan of the upper floor in the house's frame: rooms, doors, the ladder, the gallery. */
export function layout(el) {
  const F = frame(el), { U, V, t, dF, dB, dS, uC1, ti, vC1, vC0 } = F;
  const vS = V - t - dB, vin = vS + 0.35, vBk = V - 0.3;                 // the back range's edge over the court, its room's inner face, the back wall's inner face
  const T0 = uC1 + ti, T1 = U - t;                                      // the side range's roof: the terrace
  const ua = t + 2.85;                                                  // the back room's west face (the landing's end)
  const rest = U - 0.3 - ua, two = rest >= 7.2;
  const items = roofItems(el, F);
  const solid = (L) => { const w = F.R(...L.all); return w; };
  let best = null;
  const r0 = rng((el.seed || 1) * 41 + 3), jit = r0();
  for (let k = 0; k < 8; k++) {
    const lenA = two ? Math.max(3.4, Math.min(4.4, rest * 0.5 + (jit - 0.5) * 0.8 + (k % 4) * 0.35 * (k < 4 ? 1 : -1))) : rest;
    const uX = ua + lenA;                                                // the cross wall's west face (A's inner east face)
    const lenF = Math.min(U - 0.3 - (t + 0.9), 4.8 + ((el.seed >> 3) % 7) * 0.15 + (k % 2) * 0.5), uf0 = U - 0.3 - lenF;
    const vF1 = t + dF - 0.35;                                           // the front room's court-side wall's face
    const walls = [[ua - 0.35, vS, U, vS + 0.35], [ua - 0.35, vBk, U, V], [ua - 0.35, vS, ua, V], [U - 0.3, vS, U, V], [uf0 - 0.3, 0, U, 0.3], [uf0 - 0.3, vF1, U, t + dF], [uf0 - 0.3, 0, uf0, t + dF]];
    if (two) walls.push([uX, vS, uX + 0.3, V]);
    const rects = walls.map((q) => F.R(...q));
    let bad = 0;
    for (const q of items) for (const w of rects) if (q[0] < w[2] && q[2] > w[0] && q[1] < w[3] && q[3] > w[1]) bad++;
    if (!best || bad < best.bad) best = { bad, lenA, uX, uf0, lenF, vF1 };
    if (!bad) break;
  }
  const { lenA, uX, uf0, lenF, vF1 } = best;
  const doorB = [T0 + 0.25, T0 + 1.2], ul = T1 - 0.75;                    // the south door of the store; the ladder's place
  return { F, vS, vin, vBk, T0, T1, ua, uX, two, uf0, lenF, vF1, doorB, ul, bB: two ? uX + 0.3 : ua, lenA };
}

/** Waypoints of a walk from the lane before the street door to the back room and on to the front room, in the world. */
export function upperRoute(el) {
  const L = layout(el), { F, ua, vin, doorB, T0, uX, two } = L, { W, t, dF, vC0, vC1, uC0, uf0 } = { ...F, uf0: L.uf0 }, lane = -2.2;
  const dc = t + 0.72, pts = [];
  const P = (u, v) => pts.push(W(u, v));
  P(dc, lane); P(dc, 0.3); P(dc, t + 0.9);                               // the lane, the street door, the lobby
  P(t + 1.4, t + dF - 0.3); P(t + 1.4, vC0 + 0.42);                       // the lobby's door, the court
  P(F.uC0 + 0.42, vC0 + 0.42);                                          // the foot of the stair
  P(F.uC0 + 0.42, F.vC1 + 0.9);                                         // the landing on the roof
  P(ua - 0.9, vin + 0.7);                                               // the terrace by the west door
  P(ua + 0.9, vin + 0.7);                                               // the bedchamber
  if (two) { P(uX + 0.15, vin + 0.7); P(uX + 0.9, vin + 0.7); }           // the store
  P((doorB[0] + doorB[1]) / 2, vin + 0.7); P((doorB[0] + doorB[1]) / 2, L.vS - 0.45);   // out by its south door onto the terrace
  P((doorB[0] + doorB[1]) / 2, vC0 + 0.3);
  P((doorB[0] + doorB[1]) / 2, L.vF1 + 0.55);                            // before the front room's door
  P((doorB[0] + doorB[1]) / 2, L.vF1 - 0.6);                             // inside it
  return pts;
}

/** The segments of a wall (local rectangle with a long side along u or along v), holes [{ a, b, y0, y1 }] cut in it, as boxes of mat; colliders for what stands. */
function makeKit({ bag, col }, F) {
  const { W, R } = F;
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const L = (mat, prof, u, v, y, seg = 12) => { const [x, z] = W(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const beam = (mat, a, b, w, h) => { const T = []; beamTris(T, a, b, w, h); bag.add(mat, fromTriangles(T)); };
  const LP = (u, v, y) => { const [x, z] = W(u, v); return [x, y, z]; };
  const C = (u0, v0, u1, v1, y0, y1) => col.rect(R(u0, v0, u1, v1), y0, y1);
  /** a box with no top face (a rail: not a surface to stand on) */
  const rail = (mat, u0, v0, u1, v1, y0, y1) => {
    const r = R(u0, v0, u1, v1), [a, b, c, d] = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], T = [];
    for (let i = 0; i < 4; i++) { const p = [a, b, c, d][i], q = [a, b, c, d][(i + 1) % 4]; T.push(p[0], y0, p[1], q[0], y0, q[1], q[0], y1, q[1], p[0], y0, p[1], q[0], y1, q[1], p[0], y1, p[1]); }
    T.push(a[0], y0, a[1], b[0], y0, b[1], c[0], y0, c[1], a[0], y0, a[1], c[0], y0, c[1], d[0], y0, d[1]);
    bag.add(mat, fromTriangles(orientOutward(T)));
  };
  /** a wall along u (u0..u1, v0..v1) or along v, y0..y1, with holes cut in it; colliders where it stands */
  const wall = (mat, u0, v0, u1, v1, y0, y1, holes = []) => {
    const alongU = u1 - u0 > v1 - v0, A = alongU ? u0 : v0, Z = alongU ? u1 : v1;
    const seg = (a, b, ya, yb) => {
      if (b - a < 1e-3 || yb - ya < 1e-3) return;
      const q = alongU ? [a, v0, b, v1] : [u0, a, u1, b];
      B(mat, ...q, ya, yb);
      col.rect(R(...q), Math.max(ya, H), yb);
    };
    let a = A;
    for (const o of [...holes].sort((p, q) => p.a - q.a)) { seg(a, o.a, y0, y1); seg(o.a, o.b, y0, o.y0); seg(o.a, o.b, o.y1, y1); a = o.b; }
    seg(a, Z, y0, y1);
  };
  return { B, L, beam, LP, C, rail, wall };
}

/** The reed-mat ceiling and joists, the mud roof and its parapet of a room's span [u0, v0, u1, v1], the parapet broken where `gap` ([a, b] along the court-side edge) is left for the ladder. */
function roofOver(kit, rect, y, joistAlongV, up, gap, seed) {
  const { B, beam, LP } = kit, [u0, v0, u1, v1] = rect;
  B(MP, u0, v0, u1, v1, y + HC, y + HC + 0.3); B('reed_mat', u0, v0, u1, v1, y + HC - 0.05, y + HC);
  const jo = 0.3 + hash(seed, u0) * 0.1;
  if (joistAlongV) for (let u = u0 + jo; u < u1 - 0.1; u += 0.6) beam('palm_trunk', LP(u, v0, y + HC - 0.12), LP(u, v1, y + HC - 0.12), 0.07, 0.14);
  else for (let v = v0 + jo; v < v1 - 0.1; v += 0.6) beam('palm_trunk', LP(u0, v, y + HC - 0.12), LP(u1, v, y + HC - 0.12), 0.07, 0.14);
  const T = y + HC + 0.3, pw = 0.28, ph = 0.45;
  B(up, u0, v1 - pw, u1, v1, T, T + ph); B(up, u0, v0, u0 + pw, v1, T, T + ph); B(up, u1 - pw, v0, u1, v1, T, T + ph);
  if (gap) { B(up, u0 + pw, v0, gap[0], v0 + pw, T, T + ph); B(up, gap[1], v0, u1 - pw, v0 + pw, T, T + ph); } else B(up, u0 + pw, v0, u1 - pw, v0 + pw, T, T + ph);
  // the coping of baked brick along the top of the parapet
  const cp = (a, b, c, d) => B(BB, a, b, c, d, T + ph, T + ph + 0.06);
  cp(u0 - 0.03, v1 - pw - 0.03, u1 + 0.03, v1 + 0.03); cp(u0 - 0.03, v0, u0 + pw + 0.03, v1); cp(u1 - pw - 0.03, v0, u1 + 0.03, v1);
  if (gap) { cp(u0 + pw, v0 - 0.03, gap[0], v0 + pw + 0.03); cp(gap[1], v0 - 0.03, u1 - pw, v0 + pw + 0.03); } else cp(u0 + pw, v0 - 0.03, u1 - pw, v0 + pw + 0.03);
}

/** A couch on four legs (timber, a linen mattress, a coverlet, a bolster) with its head at u0, along u. */
function couch(kit, u0, v1, len, seed, y = H) {
  const { B, L, C } = kit, wd = 0.85, v0 = v1 - wd, ch = y + 0.45;
  for (const [u, v] of [[u0, v0], [u0 + len, v0], [u0, v1], [u0 + len, v1]]) B('timber', u - 0.04, v - 0.04, u + 0.04, v + 0.04, y + 0.012, ch);
  for (const q of [[u0 - 0.05, v0 - 0.05, u0 + len + 0.05, v0 + 0.02], [u0 - 0.05, v1 - 0.02, u0 + len + 0.05, v1 + 0.05], [u0 - 0.05, v0 + 0.02, u0 + 0.02, v1 - 0.02], [u0 + len - 0.02, v0 + 0.02, u0 + len + 0.05, v1 - 0.02]]) B('timber', ...q, ch - 0.06, ch);
  B('linen', u0 + 0.02, v0 + 0.02, u0 + len - 0.02, v1 - 0.02, ch - 0.05, ch + 0.07);
  const cc = hash(seed, u0) < 0.5 ? 'cloth_red' : 'cloth_ochre', cs = 0.45 + hash(seed, v1) * 0.25;
  B(cc, u0 + cs, v0 - 0.01, u0 + len - 0.08, v1 - 0.01, ch + 0.07, ch + 0.085); B(cc, u0 + cs, v0 - 0.025, u0 + len - 0.08, v0 - 0.01, ch - 0.25, ch + 0.085);
  L('linen', [[0.001, 0], [0.09, 0.0], [0.1, 0.06], [0.09, 0.12], [0.001, 0.12]], u0 + 0.2, (v0 + v1) / 2, ch + 0.07, 8);
  C(u0 - 0.05, v0 - 0.05, u0 + len + 0.05, v1 + 0.05, H, ch + 0.07);
}

/** A chest of cedar bound with bronze: u0..u1, v0..v1. */
function chest(kit, u0, v0, u1, v1, y = H) {
  const { B, C } = kit, hh = 0.5 + hash(u0, v0) * 0.1;
  B('cedar', u0, v0, u1, v1, y + 0.02, y + hh); B('bronze', u0 - 0.01, v0 - 0.01, u1 + 0.01, v1 + 0.01, y + hh - 0.06, y + hh - 0.03);
  B('bronze', u0 - 0.01, v0 - 0.01, u1 + 0.01, v1 + 0.01, y + 0.08, y + 0.11);
  C(u0, v0, u1, v1, H, y + hh);
}

/** A sleeping mat on the floor: a reed mat, a linen sheet, a bolster. */
function sleepMat(kit, u, v, alongU, seed) {
  const { B, L } = kit, a = alongU ? [0.9, 0.4] : [0.4, 0.9];
  B('reed_mat', u - a[0], v - a[1], u + a[0], v + a[1], H, H + 0.014); B('linen', u - a[0] + 0.05, v - a[1] + 0.05, u + a[0] - 0.05, v + a[1] - 0.05, H + 0.014, H + 0.06);
  L(hash(seed, u) < 0.5 ? 'cloth_ochre' : 'linen', [[0.001, 0], [0.08, 0], [0.1, 0.05], [0.08, 0.1], [0.001, 0.1]], alongU ? u - a[0] + 0.2 : u, alongU ? v : v - a[1] + 0.2, H + 0.06, 8);
}

/** A row of great jars along a wall (v fixed), their size by their own place. */
function jarRow(kit, u0, u1, v, step) {
  const { L, C } = kit;
  for (let u = u0; u <= u1 + 0.01; u += step) {
    const s = 1.15 + hash(u, v) * 0.45, mat = hash(v, u) < 0.15 ? 'pottery_dark' : 'terracotta';
    L(mat, [[0.15, 0], [0.3, 0.2], [0.32, 0.55], [0.24, 0.92], [0.15, 1.02], [0.17, 1.08], [0.001, 1.06]].map(([r, y]) => [r * s / 1.3, y * s / 1.3]), u, v, H + 0.012, 14);
    C(u - 0.26, v - 0.26, u + 0.26, v + 0.26, H, H + 1.0);
  }
}

/** Sacks of grain, wool or charcoal heaped by a wall. */
function sacks(kit, u, v, n, seed) {
  const { L, C } = kit;
  for (let k = 0; k < n; k++) {
    const du = (k % 2) * 0.5 + hash(seed, k) * 0.08, dv = Math.floor(k / 2) * 0.46 * (k % 2 ? -1 : 1), s = 0.95 + hash(u + k, v) * 0.25;
    L('sacking', [[0.001, 0], [0.22 * s, 0.02], [0.26 * s, 0.25 * s], [0.22 * s, 0.5 * s], [0.08 * s, 0.6 * s], [0.001, 0.6 * s]], u + du, v + dv, H + 0.012, 10);
  }
  C(u - 0.3, v - 0.55, u + 0.85, v + 0.4, H, H + 0.55);
}

/** The ladder of palm trunks to the roof of the rooms: its poles and rungs; the ramp is laid by the caller. */
function ladder(kit, u, vFoot, vTop, yTop) {
  const { beam, LP, B } = kit;
  for (const s of [-0.3, 0.3]) beam('palm_trunk', LP(u + s, vFoot, H), LP(u + s, vTop, yTop + 1.0), 0.035, 0.07);
  for (let y = H + 0.4; y < yTop + 0.8; y += 0.34) { const k = (y - H) / (yTop + 1.0 - H), v = vFoot + (vTop - vFoot) * k; B('palm_trunk', u - 0.3, v - 0.045, u + 0.3, v + 0.045, y, y + 0.05); }
}

/** The kinds' store and workroom furniture: what stands in the room over the back range's east part, by the house's use. */
function furnishStore(kit, kind, u0, u1, v1, vin, seed) {
  const { B, L, C, beam, LP } = kit, run = u1 - u0, vb = v1 - 0.45;
  const bowls = (u, v, y, n) => { for (let k = 0; k < n; k++) L('terracotta', BOWL(0.1 + hash(u + k, v) * 0.05), u + k * 0.3, v, y, 10); };
  if (kind === 'weaver') {
    // dyed wool on a pole over two posts, bales of fleece in sacking, baskets of spindles
    const a = u0 + 0.5, b = Math.min(u1 - 0.5, a + 2.4);
    for (const u of [a, b]) { B('timber', u - 0.04, v1 - 0.55, u + 0.04, v1 - 0.47, H, H + 1.95); C(u - 0.06, v1 - 0.57, u + 0.06, v1 - 0.45, H, H + 1.95); }
    beam('timber', LP(a, v1 - 0.51, H + 1.9), LP(b, v1 - 0.51, H + 1.9), 0.02, 0.04);
    for (let u = a + 0.12, k = 0; u < b - 0.1; u += 0.2 + hash(u, v1) * 0.1, k++) B(['cloth_red', 'cloth_ochre', 'linen', 'cloth_red'][(k + (seed % 3)) % 4], u, v1 - 0.54, u + 0.1, v1 - 0.48, H + 0.95 + hash(u, k) * 0.2, H + 1.9);
    sacks(kit, u1 - 0.9, v1 - 0.55, 4, seed);
    L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], u0 + 0.4, vin + 1.55, H + 0.012, 12);
  } else if (kind === 'potter') {
    // a rack of planks with bowls and cups set out to dry, great jars, a bin of clay
    const a = u0 + 0.4, b = Math.min(u1 - 1.5, a + 3.0);
    for (const y of [H + 0.55, H + 1.15]) B('timber', a, v1 - 0.55, b, v1 - 0.12, y, y + 0.05);
    for (const u of [a + 0.03, (a + b) / 2, b - 0.03]) { B('timber', u - 0.03, v1 - 0.55, u + 0.03, v1 - 0.49, H, H + 1.2); }
    C(a, v1 - 0.55, b, v1 - 0.12, H, H + 1.2);
    for (const y of [H + 0.6, H + 1.2]) bowls(a + 0.2, v1 - 0.35, y, Math.floor((b - a - 0.3) / 0.3));
    if (run > 4.6) jarRow(kit, u0 + 0.5, u0 + 0.5 + 2 * 0.65, v1 - 0.95, 0.65);
    B(MP, u1 - 1.2, v1 - 1.3, u1 - 0.4, v1 - 0.6, H, H + 0.5); B('bitumen', u1 - 1.13, v1 - 1.23, u1 - 0.47, v1 - 0.67, H + 0.48, H + 0.51); C(u1 - 1.2, v1 - 1.3, u1 - 0.4, v1 - 0.6, H, H + 0.5);
  } else if (kind === 'brewer') {
    // sacks of barley, beer jars with straws, a mat of malt drying
    sacks(kit, u0 + 0.5, v1 - 0.55, 6, seed); sacks(kit, u0 + 1.9, v1 - 0.55, 4, seed + 1);
    jarRow(kit, u1 - 1.4, u1 - 0.4, v1 - 0.55, 0.65);
    for (let k = 0; k < 2; k++) { const u = u1 - 1.4 + k * 0.65 + 0.05; beam('palm_trunk', LP(u, v1 - 0.55, H + 1.0), LP(u + 0.22 + hash(u, k) * 0.2, v1 - 0.43, H + 1.55), 0.012, 0.024); }
  } else if (kind === 'baker') {
    // flour in sacks, a kneading trough, baskets of loaves
    sacks(kit, u0 + 0.5, v1 - 0.55, 6, seed);
    B('timber', u1 - 1.8, v1 - 0.9, u1 - 0.6, v1 - 0.3, H + 0.3, H + 0.55); for (const u of [u1 - 1.75, u1 - 0.65]) for (const v of [v1 - 0.85, v1 - 0.35]) B('timber', u - 0.04, v - 0.04, u + 0.04, v + 0.04, H, H + 0.3);
    B(MP, u1 - 1.7, v1 - 0.82, u1 - 0.7, v1 - 0.38, H + 0.5, H + 0.52); C(u1 - 1.8, v1 - 0.9, u1 - 0.6, v1 - 0.3, H, H + 0.55);
    for (let k = 0; k < 3; k++) L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], u0 + 0.4 + k * 0.55, vin + 1.55 + (k % 2) * 0.1, H + 0.012, 12);
  } else if (kind === 'smith') {
    // charcoal in sacks, ingots of copper stacked, stone moulds, the bellows' skin hung up
    sacks(kit, u0 + 0.5, v1 - 0.55, 6, seed);
    for (let k = 0; k < 4; k++) for (let j = 0; j <= k % 2; j++) B('bronze', u1 - 1.5 + j * 0.0, v1 - 0.9 + k * 0.0, u1 - 0.9, v1 - 0.7, H + 0.12 * (k + j * 0.0) + 0.02, H + 0.12 * (k + 1) - 0.02);
    B('basalt', u1 - 2.1, v1 - 1.5, u1 - 1.3, v1 - 1.15, H, H + 0.12); B('basalt', u1 - 2.1, v1 - 1.1, u1 - 1.4, v1 - 0.75, H, H + 0.1);
    C(u1 - 2.1, v1 - 1.5, u1 - 1.3, v1 - 0.75, H, H + 0.12);
  } else if (kind === 'school') {
    // shelves of tablets drying, a basket of reeds for the styluses, the master's chest
    const a = u0 + 0.4, b = Math.min(u1 - 0.4, a + 3.2);
    for (const y of [H + 0.5, H + 1.0, H + 1.5]) { B('timber', a, v1 - 0.5, b, v1 - 0.1, y, y + 0.05); for (let u = a + 0.1; u < b - 0.4; u += 0.34 + hash(u, y) * 0.12) B(MP, u, v1 - 0.45, u + 0.2 + hash(u, v1) * 0.06, v1 - 0.2, y + 0.05, y + 0.09 + hash(y, u) * 0.03); }
    for (const u of [a + 0.03, b - 0.03]) B('timber', u - 0.03, v1 - 0.5, u + 0.03, v1 - 0.44, H, H + 1.55);
    C(a, v1 - 0.5, b, v1 - 0.1, H, H + 1.55);
    chest(kit, u1 - 1.2, v1 - 0.65, u1 - 0.4, v1 - 0.15);
  } else {
    // the merchant's and the family's store: great jars of oil and barley, sacks, chests piled, a basket of tablets
    jarRow(kit, u0 + 0.5, Math.min(u1 - 1.6, u0 + 0.5 + 3 * 0.66), v1 - 0.5, 0.66);
    sacks(kit, u1 - 1.1, v1 - 0.55, 4, seed);
    chest(kit, u0 + 0.45, vin + 1.5, u0 + 1.3, vin + 2.0); chest(kit, u0 + 0.5, vin + 1.53, u0 + 1.2, vin + 1.97, H + 0.52);
    L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], u0 + 1.85, vin + 1.6, H + 0.012, 12);
    for (let k = 0; k < 4; k++) B(MP, u0 + 1.78 + (k % 2) * 0.07, vin + 1.55 + (k > 1 ? 0.08 : 0), u0 + 1.9 + (k % 2) * 0.07, vin + 1.67 + (k > 1 ? 0.08 : 0), H + 0.3 + k * 0.02, H + 0.33 + k * 0.02);
  }
}

/** The upper floor of an entered house el: the rooms, the roof terrace's furnishing, the gallery, the ladder. */
export function upperStorey(ctx, el) {
  const { bag, col } = ctx, kit = makeKit(ctx, frame(el)), L = layout(el), { F } = L, { B, L: Lat, beam, LP, C, rail, wall } = kit, up = el.white ? 'limewash_white' : MP;
  const { U, V, t, dF, vC0, vC1, uC0, uC1, ti, R } = F, { vS, vin, vBk, ua, uX, two, uf0, vF1, doorB, T0, T1, ul } = L, seed = el.seed || 1, kind = kindOf(el);
  const rs = rng(seed * 53 + 9);
  // ---- the back range: the bedchamber (and the store), their walls on the roof (the parapet is the wall's foot)
  const Y1 = TOP, uE = U;                                                // the east end
  const dW = { a: vin + 0.2, b: vin + 1.2, y0: H, y1: H + 2.0 };         // the doors' place along v
  const win = (a, b, y0 = H + 0.95, y1 = H + 1.85) => ({ a, b, y0, y1, win: true });
  const wins = [];                                                         // windows made: for their frames
  const wn = (o, f) => { wins.push([o, f]); return o; };
  const doorOf = (a, b) => ({ a, b, y0: H, y1: H + 2.0, door: true });
  // the court-side wall of the back room (faces the court and the terrace), with the store's door and a window for each room
  const aMid = (ua + (two ? uX : U - 0.3)) / 2, bMid = (two ? (uX + 0.3 + U - 0.3) / 2 : aMid);
  const holesS = [wn(win(aMid - 0.35, aMid + 0.35), 'S')];
  holesS.push(doorOf(doorB[0], doorB[1]));
  if (two && Math.abs(bMid - (doorB[0] + doorB[1]) / 2) > 1.0) holesS.push(wn(win(bMid - 0.3, bMid + 0.3), 'S'));
  wall(up, ua - 0.35, vS, uE, vS + 0.35, H, TOP, holesS);
  // the back wall (sits on the parapet: from the parapet's top up; the hole's frame the same)
  const holesN = [wn(win(aMid - 0.3, aMid + 0.3), 'N')];
  if (two) holesN.push(wn(win(bMid - 0.3, bMid + 0.3), 'N'));
  wall(up, ua - 0.35, vBk, uE, V, H + 0.5, TOP, holesN);
  C(ua - 0.35, vBk, uE, V, H, H + 0.95);
  // the west wall (the landing's side) with the door, the cross wall with its door, the east end
  wall(up, ua - 0.35, vS + 0.35, ua, vBk, H, TOP, [doorOf(vin + 0.2, vin + 1.2)]);
  if (two) wall(MP, uX, vS + 0.35, uX + 0.3, vBk, H, TOP, [doorOf(vin + 0.2, vin + 1.2)]);
  wall(up, U - 0.3, vS + 0.35, U, vBk, H + 0.5, TOP, []); C(U - 0.3, vS, U, V, H, H + 0.5);
  roofOver(kit, [ua - 0.35, vS, U, V], H, true, up, [ul - 0.8, ul + 0.8], seed);
  // ---- the front range: the room on the street, its windows open to the lane; the door in its court-side wall
  const aF = (uf0 + U - 0.3) / 2;
  const holesF = [wn(win(aF - 0.4, aF + 0.4, H + 0.95, H + 1.85), 'F')];
  if (U - 0.3 - uf0 > 4.5) holesF.push(wn(win(aF - 1.8 - 0.3, aF - 1.8 + 0.3, H + 0.95, H + 1.85), 'F'));
  wall(up, uf0 - 0.3, 0, U, 0.3, H + 0.5, TOP, holesF);                  // the street wall, on the parapet
  C(uf0 - 0.3, 0, U, 0.3, H, H + 0.95);
  wall(up, uf0 - 0.3, vF1, U, t + dF, H, TOP, [doorOf(doorB[0], doorB[1]), wn(win(uf0 + 0.6, uf0 + 1.2), 'C')]);
  wall(up, uf0 - 0.3, 0.3, uf0, vF1, H, TOP, []);
  wall(up, U - 0.3, 0.3, U, vF1, H + 0.5, TOP, []); C(U - 0.3, 0, U, t + dF, H, H + 0.5);
  roofOver(kit, [uf0 - 0.3, 0, U, t + dF], H, false, up, null, seed + 7);
  // ---- window reveals: a sill and a head of timber, one shutter leaf of cedar standing open against a jamb
  for (const [o, side] of wins) {
    if (!o.win) continue;
    const a = o.a, b = o.b, y0 = o.y0, y1 = o.y1, vA = side === 'S' ? vS : side === 'N' ? V - 0.3 : side === 'F' ? 0 : side === 'C' ? vF1 : 0;
    const v0 = side === 'S' ? vS - 0.06 : side === 'N' ? V - 0.3 : side === 'F' ? -0.06 : vF1 - 0.06, v1 = v0 + 0.36;
    B('timber', a - 0.08, v0, b + 0.08, v1, y0 - 0.07, y0); B('timber', a - 0.08, v0, b + 0.08, v1, y1, y1 + 0.08);
    const sd = hash(a, vA) < 0.5 ? -1 : 1, ju = sd < 0 ? a : b - 0.05, w = 0.05;
    B('cedar', ju, v0 - 0.02, ju + w, v0 + 0.3, y0 + 0.02, y1 - 0.02);
  }
  // ---- the door leaves: cedar, standing open against the jamb
  for (const [wl, uu, v0] of [[ua - 0.35, null, vin], [uX, null, vin]]) {
    if (wl === uX && !two) continue;
    const ud = wl === ua - 0.35 ? ua - 0.35 : uX + 0.3;
    B('cedar', ud + (wl === ua - 0.35 ? 0.0 : -0.0) - 0.0, v0 + 0.2, ud + 0.05, v0 + 0.75, H + 0.02, H + 1.95);
  }
  B('cedar', doorB[1] - 0.05, vS - 0.06, doorB[1] + 0.0, vS + 0.55, H + 0.02, H + 1.95);
  // lintels of palm trunk over the doors
  for (const [u, v0, v1] of [[ua - 0.35, vin + 0.2, vin + 1.2], [uX, vin + 0.2, vin + 1.2]]) { if (u === uX && !two) continue; beam('palm_trunk', LP(u - 0.1, v0 - 0.15, H + 2.05), LP(u - 0.1, v1 + 0.15, H + 2.05), 0.1, 0.16); }
  beam('palm_trunk', LP(doorB[0] - 0.15, vS - 0.06, H + 2.05), LP(doorB[1] + 0.15, vS - 0.06, H + 2.05), 0.1, 0.16);
  beam('palm_trunk', LP(doorB[0] - 0.15, vF1 - 0.06, H + 2.05), LP(doorB[1] + 0.15, vF1 - 0.06, H + 2.05), 0.1, 0.16);
  // ---- the floors: reed mats on the roof's mud
  const uAe = two ? uX : U - 0.3;
  B('reed_mat', ua + 0.3, vin + 0.15, uAe - 0.3, vBk - 0.3, H, H + 0.012);
  if (two) B('reed_mat', uX + 0.6, vin + 0.15, U - 0.55, vBk - 0.3, H, H + 0.012);
  B('reed_mat', uf0 + 0.3, 0.45, U - 0.55, vF1 - 0.25, H, H + 0.012);
  // ---- the bedchamber: the couch against the back wall, a chest, a mat for the child, a lamp niche, a jar and a basket
  const cLen = 1.9 + hash(seed, 1) * 0.15, cEnd = ua + 0.35 + cLen;
  couch(kit, ua + 0.35, vBk - 0.08, cLen, seed);
  chest(kit, uAe - 0.85, vBk - 0.6, uAe - 0.05, vBk - 0.12);
  if (uAe - 0.95 - (cEnd + 0.15) >= 1.9) sleepMat(kit, (cEnd + 0.15 + uAe - 0.95) / 2, vBk - 0.5, true, seed);
  Lat('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], ua + 0.4, vin + 1.5, H + 0.012, 12);
  { const nv = vBk - 1.2; B(MP, ua - 0.0, nv - 0.15, ua + 0.2, nv + 0.15, H + 1.12, H + 1.24); Lat('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.045], [0.001, 0.04]], ua + 0.1, nv, H + 1.24, 10); B('flame', ua + 0.09, nv - 0.012, ua + 0.11, nv + 0.012, H + 1.28, H + 1.32); }
  // ---- the store, or the family's second room, by the house's use
  if (two) furnishStore(kit, kind, uX + 0.3, U - 0.3, vBk, vin, seed);
  else furnishStore(kit, kind, ua + 3.4, U - 0.3, vBk, vin, seed);
  // ---- the room on the street: a low table with a lamp and cups, stools, a chest and shelves; a mat
  { const fu0 = uf0 + 0.35, fu1 = U - 0.55, tv = 0.3 + 0.7, tu = fu0 + 1.3;
    B('timber', tu - 0.4, tv - 0.25, tu + 0.4, tv + 0.25, H + 0.42, H + 0.46);
    for (const [du, dv] of [[-0.34, -0.19], [0.34, -0.19], [-0.34, 0.19], [0.34, 0.19]]) B('timber', tu + du - 0.03, tv + dv - 0.03, tu + du + 0.03, tv + dv + 0.03, H + 0.012, H + 0.42);
    C(tu - 0.4, tv - 0.25, tu + 0.4, tv + 0.25, H, H + 0.46);
    Lat('terracotta', [[0.001, 0], [0.06, 0.01], [0.1, 0.1], [0.09, 0.17], [0.04, 0.22], [0.045, 0.26], [0.001, 0.25]], tu - 0.18, tv, H + 0.46, 10);
    for (const du of [0.05, 0.2]) Lat('terracotta', BOWL(0.05), tu + du, tv + (du > 0.1 ? 0.1 : -0.08), H + 0.46, 10);
    for (const du of [-0.75, 0.75]) { const su = tu + du; B('timber', su - 0.18, tv - 0.15, su + 0.18, tv + 0.15, H + 0.36, H + 0.4); for (const [a, b] of [[-0.14, -0.11], [0.14, -0.11], [-0.14, 0.11], [0.14, 0.11]]) B('timber', su + a - 0.02, tv + b - 0.02, su + a + 0.02, tv + b + 0.02, H + 0.012, H + 0.36); }
    chest(kit, fu1 - 1.0, vF1 - 0.6, fu1 - 0.2, vF1 - 0.1);
    // by the trade: its wares on a plank shelf along the west wall
    const wares = { weaver: 'cloth_red', potter: 'terracotta', brewer: 'pottery_dark', baker: 'wicker', smith: 'bronze', school: MP, merchant: 'sacking', family: 'terracotta' }[kind] ?? 'terracotta';
    B('timber', fu0 - 0.0, 0.5, fu0 + 0.3, vF1 - 0.3, H + 0.9, H + 0.94); B('timber', fu0 - 0.0, 0.5, fu0 + 0.05, vF1 - 0.3, H, H + 0.9);
    for (let k = 0; k < 3; k++) B(wares, fu0 + 0.03, 0.62 + k * 0.4 + hash(seed, k) * 0.05, fu0 + 0.22, 0.84 + k * 0.4, H + 0.94, H + 1.1 + hash(k, seed) * 0.12);
    C(fu0 - 0.0, 0.5, fu0 + 0.3, vF1 - 0.3, H, H + 1.0);
  }
  // ---- the terrace over the side range: a sleeping mat in the shade of the wall, a bench of mud brick, a jar; (the shared roofLife puts the rest)
  { const tu = T0 + 1.9 <= T1 - 0.2 ? T0 + 1.9 : T0 + 1.3; void tu; }
  B(MP, T0 + 0.2, vC0 + 0.55, T0 + 0.8, vC0 + 0.95, H, H + 0.35); C(T0 + 0.2, vC0 + 0.55, T0 + 0.8, vC0 + 0.95, H, H + 0.35);
  // ---- the gallery of timber over the court's east side, at the roof's height: boards on joists, the court's posts, a rail; posts to the floor of the court
  { const g0 = uC1 - 0.95, g1 = uC1, v0 = vC0 + 0.05, v1 = vC1 - 0.05, h0 = H - 0.14;
    B('timber', g0, v0, g1, v1, h0, H); col.floor(R(g0, v0, g1, v1), H);
    for (let v = v0 + 0.3; v < v1 - 0.1; v += 0.55) beam('palm_trunk', LP(g0 - 0.12, v, h0 - 0.06), LP(g1 + 0.1, v, h0 - 0.06), 0.06, 0.12);
    const pv = [v0 + 0.15, (v0 + v1) / 2 + (hash(seed, 9) - 0.5) * 0.4, v1 - 0.15];
    for (const v of pv) { B('palm_trunk', g0 + 0.02, v - 0.07, g0 + 0.16, v + 0.07, 0.06, H + 1.0); col.circle(...F.W(g0 + 0.09, v), 0.1, 0, H + 1.0); }
    for (const y of [H + 0.55, H + 0.98]) rail('timber', g0 + 0.04, v0, g0 + 0.12, v1, y, y + 0.06);
    col.rect(R(g0 + 0.03, v0, g0 + 0.13, v1), H, H + 1.0);
    B('timber', g0 - 0.02, v0, g0 + 0.2, v1, h0 - 0.12, h0);
    // the posts' feet: a base of baked brick
    for (const v of pv) B(BB, g0 - 0.01, v - 0.12, g0 + 0.2, v + 0.12, 0.06, 0.22);
  }
  // ---- the rail along the stair's open side and the foot of the ladder
  { const s0 = uC0 + 0.85, v0 = vC0 + 1.1, v1 = vC1 - 1.0, n = 6;
    for (let k = 0; k <= n; k++) { const v = v0 + (v1 - v0) * k / n, y = 0.06 + (H - 0.06) * ((v - (vC0 + 0.2)) / (vC1 - vC0 - 0.2)); B('timber', s0 + 0.01, v - 0.03, s0 + 0.09, v + 0.03, y, y + 0.95); }
    beam('timber', LP(s0 + 0.05, v0, 0.06 + (H - 0.06) * ((v0 - (vC0 + 0.2)) / (vC1 - vC0 - 0.2)) + 0.95), LP(s0 + 0.05, v1, 0.06 + (H - 0.06) * ((v1 - (vC0 + 0.2)) / (vC1 - vC0 - 0.2)) + 0.95), 0.03, 0.06);
    C(s0 + 0.01, v0, s0 + 0.09, v1, 0, H + 0.95);
  }
  // ---- the ladder to the roof of the rooms, leaning on the court-side wall at the terrace's east end, and its ramp
  ladder(kit, ul, vS - 0.8, vS - 0.02, TOP);
  col.ramp(R(ul - 0.65, vS - 0.8, ul + 0.65, vS), H - 0.5, TOP, F.dir);
  // ---- the roof of the rooms: a mat, a bench for sleeping out, a jar in its stand
  { const ru = ua + 1.0 + hash(seed, 5) * 1.5, rv = vS + 1.4; B('reed_mat', ru - 0.9, rv - 0.4, ru + 0.9, rv + 0.4, TOP, TOP + 0.014); B('linen', ru - 0.85, rv - 0.35, ru + 0.85, rv + 0.35, TOP + 0.014, TOP + 0.06);
    Lat('terracotta', JAR(1.1), U - 1.2, vS + 0.7, TOP, 12); Lat('terracotta', [[0.2, 0], [0.2, 0.08], [0.14, 0.08]], U - 1.2, vS + 0.7, TOP, 10); }
  void rs;
}
