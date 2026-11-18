// The houses of Venice with their upper floors open (docs/settlements/venice.md §5e). `ven_house` wraps the shared `house_med` (vernacular), which
// builds the furnished ground storey of an entered house with the upper storeys as a solid block: what it builds above the ground storey is
// taken out and rebuilt hollow — walls with real window reveals (arched, with a stone surround and open shutters), floors that are colliders,
// a timber stair of switchback flights (a ramp collider under each) at the far end with a rail round every opening in the floors, the rooms
// off it furnished by the house's kind (merchant's house, inn, craftsman's, tenement, shop with dwelling: venetian/house-rooms.js), a balcony
// of stone or timber on the front where the calle is wide enough, and on the merchant's house the roof terrace (altana) at the stair's head.
// ven_house { ...house_med params, up: { kind, balcony (m of projection, 0 for none) } }; without `up`, or `simple`, it is house_med alone.
// The frame: u along the front from the door's side, v inward (as in house_med's openGround).
import { box, fromTriangles, lathe, orientOutward } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../vernacular/houses-med.js';
import { faceFrame, Local, ext, archOutline } from '../renaissance/face.js';
import { furnish } from './house-rooms.js';

const T = 0.4, WALLS = ['stucco_venice', 'stucco_rose', 'limewash_red', 'stucco_ochre', 'stucco_cream', 'stucco_siena'], SHUT = ['shutter_green', 'shutter_brown'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A hash of a position, 0…1 (pieces repeated vary by their own place). */
export const hashAt = (a, b, c = 0) => { let h = (Math.imul(Math.round(a * 37) | 0, 374761393) ^ Math.imul(Math.round(b * 37) | 0, 668265263) ^ Math.imul(Math.round(c * 37) | 0, 2246822519)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** What house_med draws for a seed: the tower flag, the storey height, the wall and the shutters (its draws in the same order). */
export function shellOf(seed, rect) {
  const r = rng(seed || 1), tower = r() < 0.01 && rect[2] - rect[0] < 11 && rect[3] - rect[1] < 11, st = 3.3 + r() * 0.5;
  return { tower, st, wall: WALLS[Math.floor(r() * 6)], shut: SHUT[Math.floor(r() * 2)] };
}

/**
 * The stair of a house: switchback flights in two strips at the far end (u from the end wall in), the first strip rising toward +v (the back),
 * the second back toward the front, a landing at each end; the inn's starts at the front (its counter is at the back), the others end 1.95 m
 * from the back wall. Heights are over the house's `y`. Null where the house is too shallow.
 */
export function planStair({ L, D, st, n, kind, use }) {
  const merchant = kind === 'merchant', lev = [0.6];
  for (let s = 1; s < n; s++) lev.push(s * st + 0.4);
  if (merchant) lev.push(n * st);
  const nf = lev.length - 1;
  if (nf < 1) return null;
  const rises = lev.slice(1).map((h, i) => h - lev[i]), N = Math.ceil(Math.max(...rises) / 0.22), front = use === 'inn';
  let vF, vB, tread;
  if (front) { vF = 1.55; tread = Math.min(0.24, (D - 1.55 - vF) / N); vB = vF + N * tread; }
  else { vB = D - 1.95; tread = Math.min(0.24, (vB - 1.95) / N); vF = vB - N * tread; }
  if (tread < 0.2) return null;
  const run = N * tread, uA1 = L - T - 0.04, uA0 = uA1 - 1.08, uB1 = uA0 - 0.06, uB0 = uB1 - 1.08, uP = uB0 - 0.14;
  const flights = rises.map((rise, i) => {
    const dir = i % 2 ? -1 : 1, slope = rise / run, Lh = Math.min(2.35 / slope + 0.15, run - 0.6), strip = i % 2 ? [uB0, uB1] : [uA0, uA1];
    return { i, dir, rise, yb: lev[i], yt: lev[i + 1], strip, hole: { u0: strip[0] - 0.03, u1: i % 2 ? strip[1] + 0.03 : L - T, v0: dir > 0 ? vB - Lh : vF, v1: dir > 0 ? vB : vF + Lh } };
  });
  return { L, D, st, n, kind, lev, nf, N, tread, run, vF, vB, uA0, uA1, uB0, uB1, uP, flights, front, merchant };
}

/** The pieces of rect r (u0, v0, u1, v1) outside the hole h (or r whole). */
function minus(r, h) {
  if (!h || h.u1 <= r[0] || h.u0 >= r[2] || h.v1 <= r[1] || h.v0 >= r[3]) return [r];
  const out = [], hu0 = Math.max(h.u0, r[0]), hu1 = Math.min(h.u1, r[2]);
  if (hu0 > r[0] + 1e-6) out.push([r[0], r[1], hu0, r[3]]);
  if (hu1 < r[2] - 1e-6) out.push([hu1, r[1], r[2], r[3]]);
  if (h.v0 > r[1] + 1e-6) out.push([hu0, r[1], hu1, h.v0]);
  if (h.v1 < r[3] - 1e-6) out.push([hu0, h.v1, hu1, r[3]]);
  return out;
}

/** A hipped roof over R from height ye (as house_med's). */
function hipRoof(bag, mat, R, ye, pitch, o) {
  const ex0 = R[0] - o, ez0 = R[1] - o, ex1 = R[2] + o, ez1 = R[3] + o, wx = ex1 - ex0, wz = ez1 - ez0, rise = Math.min(wx, wz) / 2 * Math.tan(pitch * Math.PI / 180), t = [];
  if (wx >= wz) {
    const r0 = [ex0 + wz / 2, ye + rise, (ez0 + ez1) / 2], r1 = [ex1 - wz / 2, ye + rise, (ez0 + ez1) / 2];
    t.push(ex0, ye, ez0, ...r0, ...r1, ex0, ye, ez0, ...r1, ex1, ye, ez0, ex1, ye, ez1, ...r1, ...r0, ex1, ye, ez1, ...r0, ex0, ye, ez1, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex1, ye, ez0, ...r1, ex1, ye, ez1);
  } else {
    const r0 = [(ex0 + ex1) / 2, ye + rise, ez0 + wx / 2], r1 = [(ex0 + ex1) / 2, ye + rise, ez1 - wx / 2];
    t.push(ex1, ye, ez0, ...r0, ...r1, ex1, ye, ez0, ...r1, ex1, ye, ez1, ex0, ye, ez1, ...r1, ...r0, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex0, ye, ez0, ...r0, ex1, ye, ez0, ex1, ye, ez1, ...r1, ex0, ye, ez1);
  }
  for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; } }
  bag.add(mat, fromTriangles(t));
  return rise;
}

function venHouse(el, ctx) {
  const med = STYLES.vernacular.elements.house_med;
  if (!el.up || el.simple) return med(el, ctx);
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's', n = el.storeys, L = x1 - x0, D = z1 - z0, kind = el.up.kind;
  const { tower, st, wall, shut } = shellOf(el.seed, el.rect);
  const SP = tower ? null : planStair({ L, D, st, n, kind, use: el.use });
  if (!SP || n < 2) return med(el, ctx);
  const { bag, col, lights } = ctx, H = n * st, ye = y + H, fy = y + 0.6;
  // --- house_med's own drawing, caught: the ground storey stays, what it built above it is rebuilt here
  const items = [], cols = [];
  const pb = { add(mat, g) { if (!g) return; if (g.index) g = g.toNonIndexed(); g.computeBoundingBox(); items.push([mat, g, g.boundingBox]); } };
  const pc = { rect: (r, a, b) => cols.push(['rect', r, a, b]), floor: (r, yy) => cols.push(['floor', r, yy]), circle: (...a) => cols.push(['circle', ...a]), segment: (...a) => cols.push(['segment', ...a]), ramp: (...a) => cols.push(['ramp', ...a]) };
  med(el, { ...ctx, bag: pb, col: pc });
  // frame helpers
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : [x0 + u, z0 + v]);
  const uv = (x, z) => (f === 's' ? [x1 - x, z1 - z] : [x - x0, z - z0]);
  const R4 = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, v0, u1, v1, ya, yb, c = false) => { const r = R4(u0, v0, u1, v1); bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const C = (u0, v0, u1, v1, ya, yb) => col.rect(R4(u0, v0, u1, v1), ya, yb);
  const { uP, uA0, uA1, uB0, uB1, vF, vB, flights, lev } = SP, merchant = SP.merchant, front = SP.front;
  const inn = kind === 'inn';
  const Fy = (j) => y + lev[j];                                      // the floor level j (0: the ground, 1…: the upper floors, n: the terrace deck)
  const holeAt = (j) => (j >= 1 ? flights[j - 1].hole : null);
  // the terrace of the merchant's house, at the end of the stair where its last flight comes up
  let terr = null;
  if (merchant) {
    const last = flights[flights.length - 1], hi = last.dir > 0;
    terr = hi ? { v0: Math.max(vB - (last.hole.v1 - last.hole.v0) - 0.9, T + 2.6), v1: D - T, roof: [0, 0, 0, 0] } : { v0: T, v1: Math.min(vF + (last.hole.v1 - last.hole.v0) + 0.9, D - T - 2.6), roof: [0, 0, 0, 0] };
    terr.hi = hi;
  }
  // --- 1. what house_med drew: keep the ground storey, drop the upper block and its decoration, the ceiling, the beams, the cornice (re-ringed), the roof of a terraced house
  const near = (a, b, e = 0.02) => Math.abs(a - b) < e;
  const ucorner = (bb) => { const a = uv(bb.min.x, bb.min.z), b = uv(bb.max.x, bb.max.z); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const cu = L - T - 0.6;
  for (const [mat, g, bb] of items) {
    const w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z;
    let drop = false;
    if (mat === wall && near(bb.min.y, y + st) && near(bb.max.y, ye) && w > L - 0.5 && d > D - 0.5) drop = true;                              // the solid upper block
    else if (bb.min.y >= y + st - 0.125 && bb.max.y <= ye - 0.05) drop = !(mat === 'wood_dark' && w < 0.05 && d < 0.05 && false);               // the upper decoration, the ceiling plaster, the string courses
    else if (mat === 'wood_dark' && near(bb.min.y, y + st - 0.24, 0.005) && near(bb.max.y, y + st - 0.05, 0.005) && (w > 1 || d > 1)) drop = true;  // the ground storey's beams
    else if (mat === 'marble' && near(bb.min.y, ye - 0.3, 0.005) && near(bb.max.y, ye, 0.005) && w > L) drop = true;                          // the cornice block
    else if (merchant && mat === 'roof_tile' && bb.min.y >= ye - 0.01) drop = true;
    else if (merchant && mat === 'timber' && bb.min.y >= ye - 0.01) drop = true;                                                                // house_med's altana
    else if (merchant && ((mat === 'brick' && bb.min.y >= ye - 0.01) || (mat === 'stucco_venice' && bb.min.y > ye && w < 1.4))) drop = true;      // its chimneys (one is set again on the roof)
    else if (inn && (mat === 'wood_dark' || mat === 'timber' || mat === 'terracotta') && bb.max.y < y + 2.3 && bb.min.y > fy - 0.1) {
      const c = ucorner(bb), cuu = (c[0] + c[2]) / 2, cvv = (c[1] + c[3]) / 2;
      if (cuu >= L - 1.75 && cuu <= L - 0.2 && cvv >= vF - 0.3 && cvv <= D - T - 1.0) drop = true;                                               // the counter, its jugs and the barrels where the stair rises
    }
    if (!drop) bag.add(mat, g);
  }
  for (const c of cols) {
    if (c[0] === 'rect') {
      const [r, a, b] = c.slice(1), top = near(a, y + st) && near(b, y + st + 0.4);
      if (top) continue;                                                                                                                         // the ceiling slab: set again with the stair's opening
      if (inn && b < y + st - 0.5) { const m = uv((r[0] + r[2]) / 2, (r[1] + r[3]) / 2); if (m[0] >= L - 1.75 && m[0] <= L - 0.2 && m[1] >= vF - 0.3 && m[1] <= D - T - 1.0) continue; }
      col.rect(r, a, b);
    } else if (c[0] === 'floor') col.floor(c[1], c[2]);
    else col[c[0]](...c.slice(1));
  }
  // the inn's counter and barrels beyond the stair
  if (inn && D - T - 1.2 - (vB + 0.35) >= 1.0) {
    const c0 = vB + 0.35, c1 = D - T - 1.2;
    B('wood_dark', cu - 0.3, c0, cu + 0.3, c1, fy, fy + 1.05, true); B('timber', cu - 0.35, c0 - 0.05, cu + 0.35, c1 + 0.05, fy + 1.05, fy + 1.1);
    for (let v = c0 + 0.3; v < c1 - 0.1; v += 0.55) { const p = P(cu, v); bag.add('terracotta', lathe([[0.05, 0], [0.08, 0.1], [0.05, 0.25], [0.001, 0.28]], 8, null, p[0], fy + 1.1, p[1])); }
    for (let v = c0 + 0.4; v < c1; v += 0.8) { const p = P(L - T - 0.25, v), g = lathe([[0.28, 0], [0.33, 0.35], [0.28, 0.7], [0.001, 0.7]], 12, null, 0, 0, 0); g.rotateX(Math.PI / 2); g.translate(p[0], fy + 0.32, p[1]); bag.add('timber', g); }
  }
  // --- 2. the floors: slab (plaster under, boards or tiles over), beams under, colliders; the hall in tile, the rooms in boards
  const rectsDone = [];
  const slab = (j, area = null) => {
    const F = Fy(j), h = holeAt(j), top = j === n ? ye : F;
    const parts = [[T, T, uP + 0.12, D - T, 'timber'], [uP + 0.12, T, L - T, D - T, 'cotto_floor']];
    for (const [a, b, c, d, m] of parts) for (const r of minus([a, b, c, d], h)) {
      B('plaster_white', r[0], r[1], r[2], r[3], top - 0.4, top - 0.04); B(m, r[0], r[1], r[2], r[3], top - 0.04, top);
      if (!area || (r[2] > area[0] && r[0] < area[2] && r[3] > area[1] && r[1] < area[3])) {
        const q = area ? [Math.max(r[0], area[0]), Math.max(r[1], area[1]), Math.min(r[2], area[2]), Math.min(r[3], area[3])] : r;
        col.floor(R4(q[0], q[1], q[2], q[3]), top); C(q[0], q[1], q[2], q[3], top - 0.4, top);
      }
    }
    // beams under it, across the width, none through the opening
    for (let v = T + 0.55; v < D - T - 0.2; v += 0.9) {
      const seg = minus([T, v - 0.09, L - T, v + 0.09], h);
      for (const r of seg) B('wood_dark', r[0], r[1], r[2], r[3], top - 0.6, top - 0.4);
    }
    rectsDone.push(j);
  };
  for (let j = 1; j <= n - 1; j++) slab(j);
  if (merchant) slab(n, terr.hi ? [T, terr.v0, L - T, D - T] : [T, T, L - T, terr.v1]);
  else {                                                                                                                                       // the top storey's ceiling
    B('plaster_white', T, T, L - T, D - T, ye - 0.06, ye);
    for (let v = T + 0.55; v < D - T - 0.2; v += 0.9) B('wood_dark', T, v - 0.09, L - T, v + 0.09, ye - 0.26, ye - 0.06);
  }
  // --- 3. the walls of the upper storeys: the ends in boxes, the front and back as plates with real window reveals
  B(wall, 0, T, T, D - T, y + st, ye); B(wall, L - T, T, L, D - T, y + st, ye);
  C(0, T, T, D - T, Fy(1) - 0.5, ye); C(L - T, T, L, D - T, Fy(1) - 0.5, ye); C(0, D - T, L, D, Fy(1) - 0.5, ye);
  if (el.up.balcony > 0) { const gu = (L - T + uP + 0.12) / 2; C(0, 0, gu - 0.6, T, Fy(1) - 0.5, ye); C(gu + 0.6, 0, L, T, Fy(1) - 0.5, ye); C(gu - 0.6, 0, gu + 0.6, T, Fy(1) + 2.1, ye); }
  else C(0, 0, L, T, Fy(1) - 0.5, ye);
  const FF = faceFrame(el.rect, f, 0), FB = faceFrame(el.rect, f === 's' ? 'n' : 's', 0), LF = new Local(), LB = new Local();
  LF.L = L; LB.L = L;
  const bays = Math.max(1, Math.round(L / 2.5)), uh = (uP + 0.12 + L - T) / 2, dep = el.up.balcony || 0;
  const wins = [];                                                         // window centres in the house's frame u, the rooms' windows and the hall's
  for (let b = 0; b < bays; b++) { const uc = f === 's' ? L - (b + 0.5) * L / bays : (b + 0.5) * L / bays; if (uc > T + 0.55 && uc < uP - 0.45) wins.push(uc); }
  wins.push(uh);
  const orient = (g, face) => g;                                          // (placed by the face frames)
  void orient;
  for (let s = 1; s < n; s++) {
    const ya = y + s * st, yb = y + (s + 1) * st, F = Fy(s);
    for (const [Lc, fr, back] of [[LF, FF, false], [LB, FB, true]]) {
      const holes = [], extras = [];
      for (const uc of wins) {
        const P0 = P(uc, back ? D : 0), r = hashAt(P0[0], P0[1], s), hall = uc === uh, uf = back ? uc : L - uc;
        const bal = hall && !back && s === 1 && dep > 0;
        const w = bal ? 1.1 : 0.72 + 0.12 * r, y0 = bal ? F : F + 0.85, ys = bal ? F + 1.5 : F + 1.75, kind2 = bal ? 'round' : (r < 0.35 ? 'pointed' : 'round');
        holes.push(archOutline(uf, y0, w, ys, kind2, 5));
        // the surround: a stone ring, the sill, the open shutters
        if (!bal) { Lc.add('marble', ext(archOutline(uf, y0 - 0.1, w + 0.22, ys, kind2, 5), [holes[holes.length - 1]], 0, 0.06)); Lc.box('marble', uf - w / 2 - 0.12, y0 - 0.1, 0, uf + w / 2 + 0.12, y0, 0.15); }
        else { Lc.box('marble', uf - w / 2 - 0.1, y0 - 0.02, 0, uf - w / 2, ys + 0.3, 0.06); Lc.box('marble', uf + w / 2, y0 - 0.02, 0, uf + w / 2 + 0.1, ys + 0.3, 0.06); }
        if (!bal) for (const sd of [-1, 1]) Lc.box(shut, sd < 0 ? uf - w / 2 - 0.54 : uf + w / 2 + 0.14, y0 - 0.05, 0, sd < 0 ? uf - w / 2 - 0.14 : uf + w / 2 + 0.54, ys + 0.08, 0.05);
        void extras;
      }
      Lc.add(wall, ext([[0, ya], [L, ya], [L, yb], [0, yb]], holes, -T, 0));
      Lc.emit(bag, fr.M);
    }
    // the string course at the floor
    bag.add('marble', box(x0 - 0.07, ya - 0.12, z0 - 0.07, x1 + 0.07, ya + 0.04, z1 + 0.07));
  }
  // --- 4. the cornice, as a ring over the walls (the rest of its block was the old ceiling)
  { const ov = 0.35, ring = [[x0 - ov, z0 - ov, x1 + ov, z0 + T], [x0 - ov, z1 - T, x1 + ov, z1 + ov], [x0 - ov, z0 + T, x0 + T, z1 - T], [x1 - T, z0 + T, x1 + ov, z1 - ov]];
    for (const r of ring) bag.add('marble', box(r[0], ye - 0.3, r[1], r[2], ye, r[3])); }
  // --- 5. the stair: blocks for the treads, stringers, a rail on the inner side; the opening's rails and the ramp under each flight
  const dirW = (dir) => ((dir > 0) === (f === 'n') ? 's' : 'n');
  const slant = (ua, ub, va, ha, vb, hb, th, mat) => {
    const p = [];
    for (const u of [ua, ub]) for (const [v, h] of [[va, ha], [vb, hb], [vb, hb - th], [va, ha - th]]) { const q = P(u, v); p.push([q[0], h, q[1]]); }
    const tr = [], q4 = (a, b, c, d) => tr.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
    q4(0, 1, 2, 3); q4(4, 5, 6, 7); q4(0, 1, 5, 4); q4(1, 2, 6, 5); q4(2, 3, 7, 6); q4(3, 0, 4, 7);
    bag.add(mat, fromTriangles(orientOutward(tr)));
  };
  for (const fl of flights) {
    const r = fl.rise / SP.N, [ua, ub] = fl.strip, va = fl.dir > 0 ? vF : vB, vb = fl.dir > 0 ? vB : vF, yb0 = Fy(fl.i), yt = Fy(fl.i + 1);
    for (let k = 0; k < SP.N; k++) {
      const top = yb0 + (k + 1) * r, v0 = va + fl.dir * k * SP.tread, v1 = va + fl.dir * (k + 1) * SP.tread;
      B(k % 2 ? 'timber' : 'wood_dark', ua, Math.min(v0, v1), ub, Math.max(v0, v1), fl.i === 0 ? yb0 - 0.02 : top - 0.28, top);
    }
    if (fl.i > 0) { slant(ua, ua + 0.05, va, yb0 + r, vb, yt, 0.34, 'wood_dark'); slant(ub - 0.05, ub, va, yb0 + r, vb, yt, 0.34, 'wood_dark'); }
    // the rail on the inner side: posts every fourth tread and the handrail along them
    const ui = fl.i % 2 ? ub - 0.04 : ua + 0.04;
    for (let k = 0; k <= SP.N; k += 4) { const v = va + fl.dir * Math.min(k + 0.5, SP.N) * SP.tread, hh = yb0 + Math.min(k + 1, SP.N) * r; B('wood_dark', ui - 0.03, v - 0.03, ui + 0.03, v + 0.03, hh, hh + 0.95); }
    slant(ui - 0.03, ui + 0.03, va, yb0 + r + 0.95, vb, yt + 0.95, 0.07, 'timber');
    // the ramp: half a riser over the tread noses, so that the feet are on the treads
    col.ramp(R4(ua, Math.min(va, vb), ub, Math.max(va, vb)), yb0 + r / 2, yt + r / 2, dirW(fl.dir));
    // the opening in the floor above: a rail along its inner edge and across its lower end, each with a collider
    const h = fl.hole, Fh = yt, rail = (u0, v0, u1, v1) => {
      B('wood_dark', u0, v0, u1, v1, Fh + 0.88, Fh + 0.95);
      const cnt = Math.max(1, Math.round(Math.max(u1 - u0, v1 - v0) / 0.9));
      for (let k = 0; k <= cnt; k++) { const a0 = u0 + (u1 - u0 - 0.06) * k / cnt, b0 = v0 + (v1 - v0 - 0.06) * k / cnt; B('wood_dark', a0, b0, a0 + 0.06, b0 + 0.06, Fh, Fh + 0.88); }
      C(u0, v0, u1, v1, Fh, Fh + 1.0);
    };
    if (fl.i % 2) rail(h.u1 + 0.02, h.v0, h.u1 + 0.08, h.v1); else rail(h.u0 - 0.08, h.v0, h.u0 - 0.02, h.v1);
    if (fl.dir > 0) rail(h.u0 - 0.02, h.v0 - 0.08, h.u1, h.v0 - 0.02); else rail(h.u0, h.v1 + 0.02, h.u1, h.v1 + 0.08);
  }
  // --- 6. the partitions (the stair's hall from the rooms, the two rooms from each other), doorways in the hall's wall at the landings; the rooms furnished
  const vS = D / 2, doors = [[T + 0.15, T + 1.0], [D - T - 1.0, D - T - 0.15]];
  const Qs = (F, kind3) => ({
    B: (mat, u0, v0, u1, v1, a, b, c = false) => B(mat, u0, v0, u1, v1, F + a, F + b, c),
    turn: (mat, u, v, prof, ya, seg = 10) => { const p = P(u, v); bag.add(mat, lathe(prof, seg, null, p[0], F + ya, p[1])); },
    circ: (u, v, r, ht) => { const p = P(u, v); col.circle(p[0], p[1], r, F, F + ht); },
    light: (u, v, yy, k) => { const p = P(u, v); lights.push({ at: [p[0], F + yy, p[1]], color: '#ffb46b', intensity: k, distance: 7 }); },
    rand: (u, v) => { const p = P(u, v); return hashAt(p[0], p[1], F); },
  });
  for (let s = 1; s < n; s++) {
    const F = Fy(s), top = s === n - 1, hTop = y + (s + 1) * st - (top ? (merchant ? 0.4 : 0.06) : 0);
    // the hall's wall with its doorways
    let a = T;
    for (const [d0, d1] of [...doors, [D - T, D - T]]) {
      if (d0 > a) { B('plaster_white', uP, a, uP + 0.12, d0, F, hTop); C(uP, a, uP + 0.12, d0, F, F + 2.4); }
      if (d1 > d0) B('plaster_white', uP, d0, uP + 0.12, d1, F + 2.15, hTop);
      a = d1;
    }
    B('plaster_white', T, vS - 0.06, uP, vS + 0.06, F, hTop); C(T, vS - 0.06, uP, vS + 0.06, F, F + 2.4);
    const lamps = [];
    void lamps;
    const Q = Qs(F, kind);
    const rooms = [{ u0: T, v0: T, u1: uP - 0.02, v1: vS - 0.08, back: false }, { u0: T, v0: vS + 0.08, u1: uP - 0.02, v1: D - T, back: true }];
    for (const Rm of rooms) furnish(Q, Rm, { kind, s, top, back: Rm.back, use: el.use });
    // the hall: a chest in the landing at the end opposite the stair's foot, a lamp
    const p = P(uh, D / 2);
    if (s === 1) lights.push({ at: [p[0], F + 2.2, p[1]], color: '#ffb46b', intensity: 1.4, distance: 8 });
  }
  // --- 7. the balcony of the piano nobile on the front, over the calle
  if (dep > 0) {
    const F = Fy(1), u0 = uh - 0.85, u1 = uh + 0.85, mat = kind === 'merchant' ? 'limestone' : 'timber';
    B(mat, u0, -dep, u1, T - 0.1, F - 0.2, F);
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) B(mat, sd < 0 ? u0 + 0.1 : u1 - 0.24, -dep * (k + 1) / 3, sd < 0 ? u0 + 0.24 : u1 - 0.1, 0.05, F - 0.5 + k * 0.1, F - 0.4 + k * 0.1);
    col.floor(R4(u0, -dep, u1, T), F);
    B('iron', u0, -dep, u1, -dep + 0.04, F + 0.9, F + 0.95); B('iron', u0, -dep, u1, -dep + 0.04, F + 0.04, F + 0.08);
    for (let u = u0 + 0.05; u < u1; u += 0.15) B('iron', u - 0.012, -dep, u + 0.012, -dep + 0.024, F + 0.08, F + 0.9);
    for (const sd of [0, 1]) { const uu = sd ? u1 - 0.04 : u0; B('iron', uu, -dep, uu + 0.04, 0.05, F + 0.9, F + 0.95); B('iron', uu, -dep, uu + 0.04, 0.05, F + 0.04, F + 0.08); for (let v = -dep + 0.12; v < -0.05; v += 0.15) B('iron', uu + 0.008, v - 0.012, uu + 0.032, v + 0.012, F + 0.08, F + 0.9); }
    C(u0, -dep - 0.02, u1, -dep + 0.04, F, F + 1.0); C(u0 - 0.02, -dep, u0 + 0.04, 0, F, F + 1.0); C(u1 - 0.04, -dep, u1 + 0.02, 0, F, F + 1.0);
  }
  // --- 8. the roof: the merchant's house has a roof over the part away from the terrace (a hip as house_med's), the altana on the rest
  if (merchant) {
    const Rr = terr.hi ? R4(0, 0, L, terr.v0) : R4(0, terr.v1, L, D), rr = [Math.min(Rr[0], Rr[2]), Math.min(Rr[1], Rr[3]), Math.max(Rr[0], Rr[2]), Math.max(Rr[1], Rr[3])];
    const rise = hipRoof(bag, 'roof_tile', rr, ye, 17 + 4 * hashAt(x0, z0), 0.35);
    const cx = (rr[0] + rr[2]) / 2 + (hashAt(x1, z0) - 0.5) * 2, cz = (rr[1] + rr[3]) / 2;
    bag.add('brick', box(cx - 0.3, ye, cz - 0.3, cx + 0.3, ye + rise + 1.1, cz + 0.3)); bag.add('stucco_venice', lathe([[0.25, 0], [0.55, 0.8], [0.6, 1.0], [0.001, 1.0]], 8, null, cx, ye + rise + 1.1, cz));
    // the altana: posts, beams, rafters over the terrace; a balustrade along its outer edges
    const tv0 = terr.hi ? terr.v0 : T, tv1 = terr.hi ? D - T : terr.v1, edge = terr.hi ? [tv1 + 0.2, tv1 + 0.2] : [tv0 - 0.2, tv0 - 0.2];
    void edge;
    for (const [pu, pv] of [[T + 0.6, tv0 + 0.7], [uP - 0.5, tv0 + 0.7], [T + 0.6, tv1 - 0.7], [uP - 0.5, tv1 - 0.7]]) { B('timber', pu - 0.06, pv - 0.06, pu + 0.06, pv + 0.06, ye, ye + 2.4); const p = P(pu, pv); col.circle(p[0], p[1], 0.1, ye, ye + 2.4); }
    for (const pv of [tv0 + 0.7, tv1 - 0.7]) B('timber', T + 0.5, pv - 0.08, L - T - 0.5, pv + 0.08, ye + 2.4, ye + 2.55);
    for (let u = T + 0.5; u < L - T; u += 0.55) B('timber', u - 0.03, tv0 + 0.6, u + 0.03, tv1 - 0.6, ye + 2.55, ye + 2.62);
    const bal = (u0, v0, u1, v1) => { u0 -= 0.03; v0 -= 0.03; u1 += 0.03; v1 += 0.03; B('timber', u0, v0, u1, v1, ye + 0.92, ye + 0.98); const len = Math.max(u1 - u0, v1 - v0), c = Math.max(1, Math.round(len / 0.9)); for (let k = 0; k <= c; k++) { const a = u0 + (u1 - u0 - 0.06) * k / c, b = v0 + (v1 - v0 - 0.06) * k / c; B('timber', a, b, a + 0.06, b + 0.06, ye, ye + 0.98); } C(u0, v0, u1, v1, ye, ye + 1.0); };
    const eo = terr.hi ? D - T / 2 : T / 2;
    bal(T / 2, eo, L - T / 2, eo);
    bal(T / 2, tv0, T / 2, tv1); bal(L - T / 2, tv0, L - T / 2, tv1);
  }
  void hashAt;
  return undefined;
}
export { venHouse };
