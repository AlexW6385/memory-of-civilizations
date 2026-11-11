// The Minoan town (docs/settlements/knossos.md §5a): houses in rows with party walls, each dressed at eye level (door
// leaf, bench, shade, shutters, hung goods, balcony, painted band, plaster lost from the rubble), some with their ground
// floor open to the visitor and furnished (home, weaver, shop, store), the paved lanes between the rows, the walled
// yards behind the shorter houses, the stone-lined pits (kouloures) of the West Court, and the court's furniture.

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { minoanHorns as horns } from './index.js';

const G = 'gypsum_minoan', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const jarG = (r, h) => lathe([[0.001, 0], [r * 0.55, 0], [r, h * 0.35], [r * 0.95, h * 0.7], [r * 0.5, h * 0.92], [r * 0.55, h], [0.001, h]], 10);
const cupG = lathe([[0.001, 0], [0.03, 0], [0.05, 0.07], [0.045, 0.07], [0.025, 0.01], [0.001, 0.01]], 7);
const SH = 2.9, T = 0.5;
/** A storage jar of the house, light: the narrow foot, the swelling body with two raised bands, the thick rim (s: 1 is about 1.5 m high). */
const bigJars = new Map();
const bigJar = (s) => { const k = Math.round(s * 20); if (!bigJars.has(k)) bigJars.set(k, lathe([[0.001, 0], [0.24 * s, 0], [0.4 * s, 0.4 * s], [0.47 * s, 0.8 * s], [0.5 * s, 0.82 * s], [0.47 * s, 0.86 * s], [0.46 * s, 1.05 * s], [0.34 * s, 1.47 * s], [0.38 * s, 1.52 * s], [0.3 * s, 1.55 * s], [0.001, 1.5 * s]], 10)); return bigJars.get(k).clone(); };

/** The frame of a dwelling's ground floor: P(u, v) the point u along the front and v in from its outer face; L, D the width and depth. */
export function dwellingFrame(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's', alongX = f === 'n' || f === 's';
  const L = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0;
  const P = (u, v) => (alongX ? [x0 + u, f === 'n' ? z0 + v : z1 - v] : [f === 'w' ? x0 + v : x1 - v, z0 + u]);
  const rand = rng((el.seed || 1) + 5), du = L * (0.3 + rand() * 0.4);
  return { P, L, D, du, f, alongX, rot: { n: Math.PI, s: 0, w: -Math.PI / 2, e: Math.PI / 2 }[f] };
}

function dwelling(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, far = !!el.simple, rand = rng(el.seed || 1);
  const n = el.storeys ?? (rand() < 0.12 ? 1 : rand() < 0.7 ? 2 : 3), H = n * SH, f = el.front ?? 's', enter = !!el.enter && !far;
  const PL = rand() < 0.55 ? 'plaster_ochre' : rand() < 0.55 ? 'plaster_white' : 'lime_plaster', base = rand() < 0.4 ? G : 'rubble';
  const FR = dwellingFrame(el), du = FR.du, depth = FR.D;
  const stepped = !far && !enter && n >= 2 && depth >= 9.5 && rand() < 0.3, TER = 2.8;
  const rect2 = stepped ? { n: [x0, z0 + TER, x1, z1], s: [x0, z0, x1, z1 - TER], w: [x0 + TER, z0, x1, z1], e: [x0, z0, x1 - TER, z1] }[f] : el.rect;
  // a face: its run along u from a0, its plane fp, its outward sign sg; at(mat, u0, u1, v0, v1, d0, d1) a box on it
  const face = (k) => {
    const alongX = k === 'n' || k === 's', L = alongX ? x1 - x0 : z1 - z0, a0 = alongX ? x0 : z0, fp = k === 'n' ? z0 : k === 's' ? z1 : k === 'w' ? x0 : x1, sg = k === 'n' || k === 'w' ? -1 : 1;
    const at = (mat, u0, u1, v0, v1, d0, d1) => { const p0 = fp + sg * d0, p1 = fp + sg * d1; const q = alongX ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; bag.add(mat, box(q[0], v0, q[1], q[2], v1, q[3])); return q; };
    return { alongX, L, a0, fp, sg, at };
  };
  const F = face(f), back = { n: 's', s: 'n', e: 'w', w: 'e' }[f];
  const ring = (r, ya, yb, e, mat) => { const [a, b, c, d] = r; bag.add(mat, box(a - e, ya, b - e, c + e, yb, b + 0.3)); bag.add(mat, box(a - e, ya, d - 0.3, c + e, yb, d + e)); bag.add(mat, box(a - e, ya, b + 0.3, a + 0.3, yb, d - 0.3)); bag.add(mat, box(c - 0.3, ya, b + 0.3, c + e, yb, d - 0.3)); };
  bag.add(base, box(x0, y - 1.5, z0, x1, y + (enter ? 0.16 : 0.5), z1));
  // ── the body ──
  if (enter) {
    const fl = y + 0.2, ceil = y + 2.75;
    for (const k of 'nesw') {
      const W = face(k), a = k === f ? [[0, du - 0.55], [du + 0.55, W.L]] : (k === 'n' || k === 's') ? [[0, W.L]] : [[T, W.L - T]];
      for (const [u0, u1] of a) {
        W.at(PL, u0, u1, fl, ceil, 0, -(T - 0.08)); W.at('lime_plaster', u0, u1, fl, ceil, -(T - 0.08), -T);
        const q = W.alongX ? [x0 + u0, W.fp - (W.sg > 0 ? T : 0), x0 + u1, W.fp + (W.sg > 0 ? 0 : T)] : [W.fp - (W.sg > 0 ? T : 0), z0 + u0, W.fp + (W.sg > 0 ? 0 : T), z0 + u1];
        col.rect(q, y - 0.3, ceil);
      }
    }
    // above the door: the lintel and the wall over it
    F.at(PL, du - 0.55, du + 0.55, y + 2.25, ceil, 0, -(T - 0.08)); F.at('lime_plaster', du - 0.55, du + 0.55, y + 2.25, ceil, -(T - 0.08), -T);
    F.at('timber', du - 0.7, du + 0.7, y + 2.2, y + 2.5, 0, 0.1); F.at('timber', du - 0.62, du - 0.5, fl, y + 2.2, 0, 0.08); F.at('timber', du + 0.5, du + 0.62, fl, y + 2.2, 0, 0.08);
    { const q = F.alongX ? [x0 + du - 0.55, F.fp - (F.sg > 0 ? T : 0), x0 + du + 0.55, F.fp + (F.sg > 0 ? 0 : T)] : [F.fp - (F.sg > 0 ? T : 0), z0 + du - 0.55, F.fp + (F.sg > 0 ? 0 : T), z0 + du + 0.55]; col.rect(q, y + 2.25, ceil); }
    col.floor([x0 + T, z0 + T, x1 - T, z1 - T], fl);
    bag.add(el.floor ?? 'mud_plaster', box(x0 + T, fl - 0.035, z0 + T, x1 - T, fl, z1 - T));
    // the ceiling: planks on joists under the upper floor
    bag.add('wood_ochre', box(x0 + T, ceil - 0.06, z0 + T, x1 - T, ceil, z1 - T));
    const ax = FR.alongX; for (let u = T + 0.4; u < (ax ? FR.L : FR.D) - T; u += 0.65) bag.add('timber', ax ? box(x0 + u, ceil - 0.2, z0 + T, x0 + u + 0.14, ceil - 0.06, z1 - T) : box(x0 + T, ceil - 0.2, z0 + u, x1 - T, ceil - 0.06, z0 + u + 0.14));
    bag.add(PL, box(x0, ceil, z0, x1, y + (n > 1 ? SH : H), z1)); col.rect(el.rect, ceil, y + H); col.floor(el.rect, y + H);
    if (n > 1) bag.add(PL, box(x0, y + SH, z0, x1, y + H, z1));
    // light: through the door, and a lamp
    const [lx, lz] = FR.P(FR.L / 2, FR.D * 0.55); lights.push({ at: [lx, y + 2.2, lz], color: '#ffb46b', intensity: 3.0, distance: 8 });
    furnish(el, ctx, FR, y + 0.2, rand);
  } else {
    bag.add(PL, box(x0, y + 0.5, z0, x1, stepped ? y + SH : y + H, z1));
    if (stepped) bag.add(PL, box(rect2[0], y + SH, rect2[1], rect2[2], y + H, rect2[3]));
    if (stepped) { col.rect(el.rect, y - 1.5, y + SH); col.floor(el.rect, y + SH); col.rect(rect2, y + SH, y + H); col.floor(rect2, y + H); } else { col.rect(el.rect, y - 1.5, y + H); col.floor(el.rect, y + H); }
  }
  // timber bands at each floor and the plaster edge of the roof
  for (let k = 1; k <= n; k++) {
    if (far && k < n) continue;
    const top = k === n, r = stepped && k >= 2 ? rect2 : el.rect, ya = y + k * SH - (top ? 0.3 : 0.24), yb = y + k * SH;
    if (enter && k === 1 && n > 1) { ring(r, ya, yb, 0.01, 'timber'); continue; }
    ring(r, ya, yb, 0.01, top ? 'plaster' : 'timber');
  }
  // the roof's low parapet, and the terrace's of a stepped house
  const para = (r, yy) => { const [a, b, c, d] = r, t = 0.22, h = 0.38; for (const q of [[a, b, c, b + t], [a, d - t, c, d], [a, b + t, a + t, d - t], [c - t, b + t, c, d - t]]) bag.add('plaster', box(q[0], yy, q[1], q[2], yy + h, q[3])); };
  if (n >= 1) para(rect2, y + H);
  if (stepped) para([...(f === 'n' ? [x0, z0, x1, z0 + TER] : f === 's' ? [x0, z1 - TER, x1, z1] : f === 'w' ? [x0, z0, x0 + TER, z1] : [x1 - TER, z0, x1, z1])], y + SH);
  // the door: lintel and leaf (an open leaf on a house that can be entered)
  if (!enter) {
    F.at('timber', du - 0.62, du + 0.62, y + 0.5, y + 2.45, -0.06, 0.06);
    F.at(rand() < 0.6 && !far ? 'wood_dark' : 'opening', du - 0.48, du + 0.48, y + 0.5, y + 2.25, 0.06, 0.08);
    F.at('timber', du - 0.75, du + 0.75, y + 2.25, y + 2.5, 0.06, 0.1);
    F.at(G, du - 0.7, du + 0.7, y, y + 0.5, -0.05, 0.45);
  } else {
    const q = F.at('wood_dark', du + 0.52, du + 0.6, y + 0.2, y + 2.2, 0.0, 0.95); void q;
    F.at(G, du - 0.7, du + 0.7, y - 0.4, y + 0.2, -0.05, 0.4);
  }
  if (far) return;
  // ── weathering: the damp and splash at the foot, rain streaks, plaster lost from the rubble, fresh patches ──
  const wl = f === 'n' || f === 's' ? { w: el.alW, e: el.alE } : { n: el.alW, s: el.alE };
  for (const k of 'nesw') { if (k !== f && !wl[k]) continue; const W = face(k), dh = (k === f ? 0.55 : 0.3) + rand() * 0.25; W.at('plaster_damp', 0.02, W.L - 0.02, y + 0.53, y + 0.53 + dh, 0.0, 0.012); }
  for (const u of [0.12, F.L - 0.42]) F.at('plaster_streak', u, u + 0.3, Math.max(y + 1.45, y + H - 1.6 - rand() * 0.8), y + H - 0.3, 0.0, 0.02);
  const sp = F.L * (0.15 + rand() * 0.2);
  for (let i = 0, m = 2 + Math.floor(rand() * 3); i < m; i++) { const u = 0.6 + rand() * Math.max(0.1, F.L - 2.2), w = 0.3 + rand() * 0.6, v = y + 1.5 + rand() * Math.max(0.1, Math.min(H - 2.4, 4)); if (u < sp + 0.3 && u + w > sp - 0.3) continue; F.at(rand() < 0.75 ? 'rubble' : 'plaster_white', u, u + w, v, v + 0.2 + rand() * 0.5, 0.0, rand() < 0.5 ? 0.032 : 0.044); }
  // ── timber posts showing in the plaster of the front ──
  const mw = Math.max(1, Math.floor(F.L / 3.2));
  for (let i = 0; i <= mw; i++) { const u = Math.min(F.L - 0.2, Math.max(0.05, i * F.L / mw - 0.07)); if (Math.abs(u - du) < 0.9 && !stepped) { F.at('timber', u, u + 0.14, y + 2.55, y + H - 0.3, 0, 0.05); continue; } F.at('timber', u, u + 0.14, y + 0.5, y + H - 0.3, 0, 0.05); }
  // the round ends of the floor beams on the front
  for (let k = 1; k < n; k++) for (let u = 0.45; u < F.L - 0.3; u += 0.78) {
    if (k === 1 && Math.abs(u - du) < 0.95) continue;
    const yy = y + k * SH - 0.42; F.at('timber', u - 0.07, u + 0.07, yy, yy + 0.14, 0.0, 0.06);
  }
  // slits on the ground floor beside the door; for a house with its ground floor open, one small window with a shutter
  for (const u of [du - 1.9, du + 1.9]) if (u > 0.7 && u < F.L - 0.7 && rand() < 0.75) { F.at(G, u - 0.22, u + 0.22, y + 1.15, y + 2.05, -0.06, 0.05); F.at('opening', u - 0.09, u + 0.09, y + 1.25, y + 1.95, 0.05, 0.07); }
  // ── windows of the upper floors on the front (and on the side faces left free by an alley) in red frames with open shutters ──
  const win = (W, u, fl) => {
    const yy = y + fl * SH + 0.75;
    W.at(RED, u - 0.55, u + 0.55, yy, yy + 1.25, -0.06, 0.07); W.at('opening', u - 0.42, u + 0.42, yy + 0.12, yy + 1.13, 0.07, 0.09);
    W.at(RED, u - 0.045, u + 0.045, yy + 0.12, yy + 1.13, 0.09, 0.11); W.at(RED, u - 0.42, u + 0.42, yy + 0.6, yy + 0.68, 0.09, 0.11);
    if (rand() < 0.6) { W.at('wood_ochre', u - 0.98, u - 0.58, yy + 0.05, yy + 1.2, 0.0, 0.07); W.at('wood_ochre', u + 0.58, u + 0.98, yy + 0.05, yy + 1.2, 0.0, 0.07); }
    W.at(G, u - 0.65, u + 0.65, yy - 0.08, yy, 0.0, 0.2);
  };
  const wm = Math.max(1, Math.floor(F.L / 2.6));
  for (let fl = 1; fl < n; fl++) for (let i = 0; i < wm; i++) { const u = (i + 0.5) * F.L / wm; if (fl === 1 && stepped) { /* below the terrace */ } win(F, u, fl); }
  for (const [k, ok] of [[f === 'n' || f === 's' ? 'w' : 'n', el.alW], [f === 'n' || f === 's' ? 'e' : 's', el.alE]]) if (ok) { const W = face(k), lim = stepped ? W.L - TER : W.L; for (let fl = 1; fl < n; fl++) { const u = lim * 0.5; if (rand() < 0.8 && u > 1) win(W, u, fl); } }
  // a painted band under the parapet (blue, red and ochre in turn) on many fronts, after the spiral friezes
  if (rand() < 0.4) { const m = Math.floor(F.L / 0.6); for (let i = 0; i < m; i++) F.at(i % 3 === 0 ? 'egyptian_blue' : i % 3 === 1 ? RED : 'paint_ochre', i * F.L / m, (i + 1) * F.L / m - 0.04, y + H - 0.85, y + H - 0.35, 0, 0.04); }
  // ── eye level: bench, shade, balcony, hung goods ──
  if (rand() < 0.5) { const u0 = du + 0.95, w = Math.min(1.8, F.L - u0 - 0.4); if (w > 0.8) { const q = F.at(G, u0, u0 + w, y, y + 0.46, 0.0, 0.5); const r = F.alongX ? [q[0], q[1], q[2], q[3]] : q; col.rect(r, y, y + 0.46); } }
  if (rand() < 0.35 && n >= 1) {
    const w = Math.min(F.L - 0.6, 2.6 + rand() * 1.4), u0 = Math.max(0.3, du - w / 2), out = 1.5;
    F.at('cloth_ochre', u0, u0 + w, y + 2.62, y + 2.66, 0.06, out); F.at('timber', u0, u0 + w, y + 2.5, y + 2.62, 0.05, 0.1);
    for (const u of [u0 + 0.1, u0 + w - 0.1]) { const q = F.at('timber', u - 0.05, u + 0.05, y - 0.2, y + 2.62, out - 0.1, out); col.rect(q, y, y + 2.62); }
  }
  if (n >= 2 && rand() < 0.28) {
    const w = Math.min(F.L - 0.8, 2.6 + rand() * 2), u0 = Math.max(0.4, du - w / 2 + (rand() - 0.5)), yb = y + SH, out = 0.95;
    F.at('timber', u0, u0 + w, yb, yb + 0.1, 0, out); F.at('timber', u0, u0 + w, yb + 0.1, yb + 0.16, 0, out);
    for (let u = u0; u <= u0 + w + 0.01; u += w / Math.max(2, Math.round(w / 0.7))) F.at('timber', u - 0.03, u + 0.03, yb + 0.16, yb + 1.0, out - 0.06, out);
    F.at('timber', u0, u0 + w, yb + 1.0, yb + 1.06, out - 0.06, out); F.at('timber', u0, u0 + 0.06, yb + 0.16, yb + 1.06, 0, out); F.at('timber', u0 + w - 0.06, u0 + w, yb + 0.16, yb + 1.06, 0, out);
    // a mat hung over the rail to air
    if (rand() < 0.5) F.at(rand() < 0.5 ? 'cloth_red' : 'cloth_indigo', u0 + 0.3, u0 + 0.3 + Math.min(1.1, w - 0.6), yb + 0.2, yb + 0.9, out - 0.02, out + 0.02);
  }
  if (rand() < 0.3) {   // strings of onions and a hide hung up to dry by the door
    const u = du - 1.35; if (u > 0.4) { F.at('timber', u - 0.03, u + 0.03, y + 1.9, y + 2.0, 0, 0.5); for (let i = 0; i < 3; i++) F.at(i === 1 ? 'hide_tan' : 'cloth_ochre', u - 0.09 + i * 0.06 - 0.02, u - 0.09 + i * 0.06 + 0.07, y + 1.15 - i * 0.05, y + 1.9, 0.25 + i * 0.06, 0.34 + i * 0.06); }
  }
  // ── the roof: reed shade on poles, a rain spout, horns on a few, jars set to dry ──
  if (rand() < 0.3) { const [a, b, c, d] = rect2, ux = a + 0.7 + rand() * Math.max(0.1, c - a - 3.4), uz = b + 0.7 + rand() * Math.max(0.1, d - b - 3.0); for (const [px, pz] of [[ux, uz], [ux + 2.2, uz], [ux, uz + 1.9], [ux + 2.2, uz + 1.9]]) bag.add('timber', box(px - 0.04, y + H, pz - 0.04, px + 0.04, y + H + 1.9, pz + 0.04)); bag.add('reed_mat', box(ux - 0.2, y + H + 1.9, uz - 0.2, ux + 2.4, y + H + 1.96, uz + 2.1)); }
  { const [a, b, c, d] = rect2, jx = a + 0.6 + rand() * (c - a - 1.2), jz = b + 0.6 + rand() * (d - b - 1.2); for (let i = 0; i < 2; i++) bag.add('terracotta', jarG(0.2 + i * 0.05, 0.5 + i * 0.1).translate(jx + i * 0.5, y + H, jz)); }
  if (rand() < 0.14) { const hs = 0.6; for (let x = x0 + 2.5; x < x1 - 1; x += 4.4) horns(bag, x, y + H + 0.38, f === 'n' ? z0 + 0.3 : f === 's' ? z1 - 0.3 : z0 + 0.3, hs, true); }
  { const q = F.at('terracotta', sp, sp + 0.14, y + H - 0.15, y + H - 0.01, 0.0, 0.5); void q; F.at('plaster_streak', sp - 0.02, sp + 0.16, Math.max(y + 1.45, y + H - 2.0), y + H - 0.15, 0.0, 0.02); }
  // the yard behind a shorter house: its gate in the back wall is the yard's own element (yard_garden)
}

// ── furnished rooms (the ground floor of an open house) ──────────────────────────────────────
function furnish(el, ctx, FR, fl, rand) {
  const { bag, col, lights } = ctx, { P, L, D, du } = FR, kind = el.kind ?? 'home';
  const B = (mat, u0, u1, v0, v1, y0, y1, solid = false) => { const a = P(u0, v0), b = P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; bag.add(mat, box(r[0], fl + y0, r[1], r[2], fl + y1, r[3])); if (solid) col.rect(r, fl + y0, fl + y1); };
  const J = (g, u, v, y0 = 0) => { const [x, z] = P(u, v); bag.add('terracotta', g.clone().translate(x, fl + y0, z)); };
  const C = (u, v, r, h) => { const [x, z] = P(u, v); col.circle(x, z, r, fl, fl + h); };
  const pit = (u, v, s) => { const [x, z] = P(u, v); bag.add('terracotta', bigJar(s).rotateY(rand() * 6).translate(x, fl, z)); col.circle(x, z, 0.47 * s, fl, fl + 1.6 * s); };
  const vIn = T + 0.15, vBack = D - T - 0.15, uL = T + 0.1, uR = L - T - 0.1, other = du < L / 2 ? uR : uL;
  const side = (v0, v1, y0, y1, w, mat, solid = true) => (other === uR ? B(mat, uR - w, uR, v0, v1, y0, y1, solid) : B(mat, uL, uL + w, v0, v1, y0, y1, solid));
  const sideU = (w) => (other === uR ? uR - w / 2 : uL + w / 2);
  const shelf = (u0, u1, v, h0) => { B('timber', u0, u1, v, v + 0.28, h0, h0 + 0.04); for (let u = u0 + 0.12; u < u1 - 0.05; u += 0.2) J(rand() < 0.5 ? jarG(0.07, 0.2) : cupG.clone().scale(1.6, 1.6, 1.6), u, v + 0.14, h0 + 0.04); };
  if (kind === 'home') {
    // the hearth at the back: a ring of stones round the ash, the cooking pot, the stone bench along one side, the bed of mats, the shelf of cups
    const hu = L / 2, hv = vBack - 0.9;
    B('rubble', hu - 0.55, hu + 0.55, hv - 0.55, hv + 0.55, 0, 0.16, false); B('lacquer_black', hu - 0.4, hu + 0.4, hv - 0.4, hv + 0.4, 0.16, 0.175);
    J(lathe([[0.001, 0], [0.12, 0], [0.19, 0.12], [0.15, 0.24], [0.17, 0.26], [0.001, 0.26]], 10).scale(1, 1, 1), hu, hv, 0.18); C(hu, hv, 0.6, 0.2);
    side(vIn + 0.4, vIn + 2.6, 0, 0.45, 0.5, G);
    B('reed_mat', sideU(1.0) - 0.45, sideU(1.0) + 0.45, vBack - 2.2, vBack - 0.1, 0, 0.05); B('cloth_white', sideU(1.0) - 0.4, sideU(1.0) + 0.4, vBack - 1.4, vBack - 0.3, 0.05, 0.12); B('hide_brown', sideU(1.0) - 0.4, sideU(1.0) + 0.4, vBack - 2.1, vBack - 1.4, 0.05, 0.1);
    pit(other === uR ? uL + 0.55 : uR - 0.55, vBack - 0.55, 0.55); pit(other === uR ? uL + 0.55 : uR - 0.55, vBack - 1.6, 0.48);
    shelf(Math.max(uL + 0.1, L / 2 - 1.2), Math.min(uR - 0.1, L / 2 + 1.2), vBack - 0.28, 1.35);
    B('timber', L / 2 - 0.6, L / 2 + 0.6, vIn + 1.4, vIn + 2.1, 0.26, 0.31, false); for (const [a, b] of [[-0.55, 1.45], [0.55, 1.45], [-0.55, 2.05], [0.55, 2.05]]) B('timber', L / 2 + a - 0.025, L / 2 + a + 0.025, vIn + b - 0.025, vIn + b + 0.025, 0, 0.26);
    for (let i = 0; i < 3; i++) J(cupG.clone().scale(1.8, 1.8, 1.8), L / 2 - 0.3 + i * 0.3, vIn + 1.75, 0.31);
  } else if (kind === 'weaver') {
    // the upright loom: two posts and a beam, the warp hung with its row of clay weights; the weaver's stool; baskets of wool
    const lu = L / 2, lv = vBack - 0.5;
    for (const dx of [-0.8, 0.8]) B('wood_dark', lu + dx - 0.05, lu + dx + 0.05, lv - 0.05, lv + 0.05, 0, 1.9);
    B('wood_dark', lu - 0.85, lu + 0.85, lv - 0.05, lv + 0.05, 1.8, 1.9); B('linen', lu - 0.75, lu + 0.75, lv - 0.02, lv + 0.02, 0.5, 1.8); B('cloth_red', lu - 0.74, lu + 0.74, lv - 0.045, lv + 0.045, 0.55, 0.75); B('cloth_indigo', lu - 0.73, lu + 0.73, lv - 0.06, lv + 0.06, 0.8, 0.88);
    for (let i = 0; i < 12; i++) J(lathe([[0.001, 0], [0.045, 0], [0.04, 0.09], [0.001, 0.09]], 6), lu - 0.7 + i * 0.127, lv, 0.4);
    C(lu, lv, 0.9, 1.9); B('wood_dark', lu - 0.2, lu + 0.2, lv - 0.95, lv - 0.55, 0, 0.38);
    for (let i = 0; i < 3; i++) { const [x, z] = P(other === uR ? uL + 0.5 + i * 0.5 : uR - 0.5 - i * 0.5, vBack - 0.5); bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.24, 0.3], [0.001, 0.3]], 8).translate(x, fl, z)); bag.add(i === 1 ? 'cloth_white' : 'cloth_red', lathe([[0.001, 0.28], [0.2, 0.28], [0.001, 0.4]], 8).translate(x, fl, z)); }
    side(vIn + 0.5, vIn + 2.2, 0, 0.45, 0.5, G); shelf(Math.max(uL + 0.1, L / 2 - 1.2), Math.min(uR - 0.1, L / 2 + 1.2), vIn + 0.05, 1.5);
  } else if (kind === 'shop') {
    // the counter of stone and timber across the room, jars and a balance on it; shelves of oil jars behind; stacked amphorae
    const cv = vIn + 1.8;
    B(G, uL, uR - 0.0, cv, cv + 0.5, 0, 0.9, true); B('timber', uL, uR, cv - 0.03, cv + 0.55, 0.9, 0.95);
    // a gap at the end of the counter where the keeper goes through: the end nearest the door is left open
    const bx = L / 2, bz = cv + 0.28; B('wood_dark', bx - 0.03, bx + 0.03, cv + 0.2, cv + 0.3, 0.95, 1.4); B('bronze', bx - 0.35, bx + 0.35, cv + 0.23, cv + 0.27, 1.38, 1.4); for (const s of [-1, 1]) J(lathe([[0.001, 0], [0.12, 0.01], [0.12, 0.03], [0.001, 0.03]], 8), bx + s * 0.33, bz - 0.0, 1.2);
    void bz; for (let i = 0; i < 4; i++) J(i % 2 ? jarG(0.1, 0.24) : jarG(0.08, 0.3), uL + 0.5 + i * 0.5, cv + 0.26, 0.95);
    for (const h of [0.7, 1.3]) shelf(uL + 0.2, uR - 0.2, vBack - 0.3, h);
    for (let i = 0; i < 3; i++) pit(uL + 0.55 + i * 1.0, vBack - 0.6, 0.55);
    B('hide_tan', uR - 1.1, uR - 0.2, cv + 0.7, cv + 1.4, 0, 0.45, true);
  } else {
    // a store: the pithoi in a row with a walkway, a stack of jars, sacks of grain, a lamp
    for (let i = 0; i < 4; i++) { pit(uL + 0.6 + i * 1.05 > uR - 0.5 ? uR - 0.55 : uL + 0.6 + i * 1.05, vBack - 0.6, 0.58 + (i % 2) * 0.06); }
    for (let i = 0; i < 3; i++) pit(i % 2 ? uL + 0.6 : uR - 0.6, vIn + 1.2 + i * 1.5 > vBack - 1.5 ? vBack - 1.7 : vIn + 1.2 + i * 1.5, 0.5);
    for (let i = 0; i < 4; i++) B('sacking', uL + 0.2 + (i % 2) * 0.5, uL + 0.65 + (i % 2) * 0.5, vIn + 0.2 + Math.floor(i / 2) * 0.4, vIn + 0.55 + Math.floor(i / 2) * 0.4, 0, 0.3, i === 0);
  }
  void lights;
}

// ── lanes, yards, pits, court furniture ──────────────────────────────────────────────────────
/** lane_paving: { pts: [[x, y, z]…] (centre line), w } — packed earth between kerbs with a drain stone down the middle, in segments following the ground. */
function lanePaving(el, { bag, col }) {
  const w = (el.w ?? 3.4) / 2 + 0.08, pts = el.pts;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay, az] = pts[i], [bx, by, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    const slab = (mat, o0, o1, top, bot) => {
      const Q = (t, o, dy) => [ax + ux * L * t + nx * o, ay + (by - ay) * t + dy, az + uz * L * t + nz * o], v = [Q(0, o0, bot), Q(1, o0, bot), Q(1, o1, bot), Q(0, o1, bot), Q(0, o0, top), Q(1, o0, top), Q(1, o1, top), Q(0, o1, top)];
      const t = []; const q = (p, r, s2, u) => t.push(...v[p], ...v[r], ...v[s2], ...v[p], ...v[s2], ...v[u]);
      q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
      bag.add(mat, fromTriangles(orientOutward(t)));
    };
    slab(el.mat ?? 'pebbles', -w, w, 0.07, -0.3); if (!el.simple) slab('flagstone', -0.18, 0.18, 0.085, 0.0);
    const r = [Math.min(ax, bx) - Math.abs(nx) * w, Math.min(az, bz) - Math.abs(nz) * w, Math.max(ax, bx) + Math.abs(nx) * w, Math.max(az, bz) + Math.abs(nz) * w];
    if (Math.abs(by - ay) < 0.02) col.floor(r, ay + 0.07); else col.ramp(r, Math.min(ay, by) + 0.07, Math.max(ay, by) + 0.07, Math.abs(ux) > 0.5 ? ((by > ay) === (ux > 0) ? 'e' : 'w') : ((by > ay) === (uz > 0) ? 's' : 'n'));
  }
}

/** yard_garden: { rect, y, seed }: the low wall of rubble round the yard behind a shorter house, a gate in the back, the beaten earth, a bread oven, a pithos, firewood, a loom frame or a pen of reeds. */
function yardGarden(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 3), alongX = true, t = 0.35;
  const walls = [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]];
  const gate = el.gate ?? -1; void alongX;
  for (const [i, r] of walls.entries()) {
    if (i === gate) { const mid = (r[0] + r[2]) / 2; const parts = [[r[0], r[1], mid - 0.6, r[3]], [mid + 0.6, r[1], r[2], r[3]]]; for (const p of parts) { if (p[2] > p[0]) { bag.add('rubble', box(p[0], y - 0.3, p[1], p[2], y + 1.25, p[3])); col.rect(p, y - 0.3, y + 1.25); } } continue; }
    bag.add('rubble', box(r[0], y - 0.3, r[1], r[2], y + 1.25, r[3])); bag.add('mud_plaster', box(r[0] - 0.02, y + 1.25, r[1] - 0.02, r[2] + 0.02, y + 1.33, r[3] + 0.02)); col.rect(r, y - 0.3, y + 1.33);
  }
  bag.add('earth_wall', box(x0 + t, y - 0.3, z0 + t, x1 - t, y + 0.02, z1 - t)); col.floor([x0 + t, z0 + t, x1 - t, z1 - t], y + 0.02);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, k = Math.floor(rand() * 3);
  if (k === 0) { // the oven: a beehive of clay with its mouth
    bag.add('mud_plaster', lathe([[0.001, 0], [0.7, 0], [0.62, 0.35], [0.4, 0.62], [0.001, 0.75]], 10).translate(cx, y + 0.02, cz)); bag.add('opening', box(cx - 0.18, y + 0.15, cz + 0.55, cx + 0.18, y + 0.45, cz + 0.72)); col.circle(cx, cz, 0.7, y, y + 0.75);
  } else if (k === 1) { for (const [px, pz, ps] of [[cx - 0.6, cz, 0.5], [cx + 0.5, cz + 0.3, 0.42]]) { bag.add('terracotta', bigJar(ps).translate(px, y + 0.02, pz)); col.circle(px, pz, 0.47 * ps, y, y + 1.5 * ps); } }
  else { for (let i = 0; i < 5; i++) { bag.add('timber', box(cx - 1 + i * 0.5, y + 0.02, cz - 0.15, cx - 0.55 + i * 0.5, y + 0.3, cz + 0.15)); } for (let i = 0; i < 3; i++) bag.add('timber', box(cx - 1, y + 0.3 + i * 0.28, cz - 0.15, cx + 1, y + 0.55 + i * 0.28, cz + 0.15)); col.rect([cx - 1, cz - 0.15, cx + 1, cz + 0.15], y, y + 1.2); }
  // a vine arbour on poles over the corner (leaves are the planted trees: this is the frame and the hanging bunches)
  const [ax, az] = [x0 + 1.4, z1 - 1.5];
  for (const [px, pz] of [[ax, az], [ax + 2.0, az]]) bag.add('timber', box(px - 0.05, y, pz - 0.05, px + 0.05, y + 2.0, pz + 0.05));
  bag.add('timber', box(ax - 0.1, y + 2.0, az - 0.04, ax + 2.1, y + 2.06, az + 0.04)); for (let i = 0; i < 6; i++) bag.add('timber', box(ax - 0.05 + i * 0.4, y + 2.06, az - 0.8, ax + 0.0 + i * 0.4, y + 2.1, az + 0.8));
}

/** ring_pit: { c: [x, z], r, y }: a round stone-lined pit of the court (the kouloures of the West Court), shown as a kerb of dressed blocks about 0.55 m high round dark beaten earth (the paving cannot be cut into the ground here). */
function ringPit(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0.05, r = el.r ?? 2;
  for (const prof of [[[r + 0.35, 0], [r + 0.35, 0.55], [r - 0.05, 0.58], [r - 0.05, 0.1]], [[r - 0.05, 0.1], [r - 0.05, 0.58], [r + 0.35, 0.55], [r + 0.35, 0]]]) void prof;
  bag.add(G, lathe([[r + 0.35, 0], [r + 0.35, 0.52], [r + 0.3, 0.57], [r - 0.05, 0.57], [r - 0.05, 0.0]], 32).translate(cx, y, cz));
  bag.add('limestone', lathe([[r - 0.05, 0.0], [r - 0.05, 0.55]], 32).translate(cx, y, cz));
  bag.add('earth_wall', lathe([[0.001, 0.09], [r - 0.04, 0.09], [r - 0.04, 0.0], [0.001, 0.0]], 28).translate(cx, y, cz));
  col.circle(cx, cz, r + 0.35, y - 0.1, y + 0.57);
}

/** court_dress: { rect, y, seed, kind: 'west' | 'central' }: the benches of gypsum along a façade, jar stands, a cult stand with horns, plant tubs, torch stands. */
function courtDress(el, { bag, col, lights }) {
  const y = el.y ?? 0.05, rand = rng(el.seed || 1);
  for (const b of el.benches ?? []) { bag.add(G, box(b[0], y, b[1], b[2], y + 0.46, b[3])); col.rect(b, y, y + 0.46); }
  for (const [x, z] of el.stands ?? []) { bag.add(G, lathe([[0.001, 0], [0.3, 0], [0.3, 0.1], [0.14, 0.14], [0.1, 0.7], [0.2, 0.74], [0.2, 0.78], [0.001, 0.78]], 10).translate(x, y, z)); bag.add('terracotta', jarG(0.22, 0.5).translate(x, y + 0.78, z)); col.circle(x, z, 0.32, y, y + 1.3); }
  for (const [x, z, rot] of el.horns ?? []) { bag.add(G, box(x - 0.55, y, z - 0.35, x + 0.55, y + 0.5, z + 0.35)); horns(bag, x, y + 0.5, z, 0.7, rot !== 1); col.rect([x - 0.55, z - 0.35, x + 0.55, z + 0.35], y, y + 1.3); }
  for (const [x, z] of el.tubs ?? []) { bag.add('terracotta', lathe([[0.001, 0], [0.3, 0], [0.42, 0.4], [0.4, 0.45], [0.001, 0.45]], 12).translate(x, y, z)); bag.add('earth_wall', lathe([[0.001, 0.4], [0.38, 0.4], [0.001, 0.42]], 10).translate(x, y, z)); for (let i = 0; i < 7; i++) { const a = i * 0.9; bag.add('papyrus', box(x + Math.cos(a) * 0.15 - 0.01, y + 0.42, z + Math.sin(a) * 0.15 - 0.01, x + Math.cos(a) * 0.2 + 0.01, y + 0.9 + (i % 3) * 0.15, z + Math.sin(a) * 0.2 + 0.01)); } col.circle(x, z, 0.42, y, y + 0.9); }
  for (const [x, z] of el.torches ?? []) { bag.add('timber', box(x - 0.04, y, z - 0.04, x + 0.04, y + 1.7, z + 0.04)); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.08], [0.12, 0.14], [0.001, 0.14]], 8).translate(x, y + 1.7, z)); lights.push({ at: [x, y + 1.9, z], color: '#ffb46b', intensity: 2.6, distance: 8 }); col.circle(x, z, 0.1, y, y + 1.8); }
  void rand;
}

Object.assign(STYLES.minoan.elements, { dwelling, lane_paving: lanePaving, yard_garden: yardGarden, ring_pit: ringPit, court_dress: courtDress });
