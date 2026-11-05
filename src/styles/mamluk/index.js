// Mamluk architecture (14th c.; docs/settlements/mamluk-cairo.md §4): the great madrasa-mosque as a
// cliff of cut stone — tall recessed window bays, a crown of crenellations over a muqarnas cornice,
// the deep portal; the dome of the founder's tomb on a drum of stepped corners; minarets in tiers
// (square, octagonal, round) with balconies and a bulbous top; the Citadel's walls and towers on its
// spur; the city's houses (src/styles/vernacular's mud-brick house).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';

const S = 'limestone_yellow';
function crest(bag, r, y, mat = S) {
  const [x0, z0, x1, z1] = r;
  bag.add(mat, box(x0 - 0.9, y - 1.6, z0 - 0.9, x1 + 0.9, y, z1 + 0.9));            // the muqarnas cornice (a projecting band)
  for (const [a, b, alongX] of [[x0, x1, true], [z0, z1, false]]) {
    const n = Math.floor((b - a) / 2.2);
    for (let i = 0; i < n; i += 2) {
      const u0 = a + i * (b - a) / n, u1 = u0 + (b - a) / n;
      for (const s of [0, 1]) { const q = alongX ? [u0, s ? z1 : z0 - 0.4, u1, s ? z1 + 0.4 : z0] : [s ? x1 : x0 - 0.4, u0, s ? x1 + 0.4 : x0, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.3, q[3])); bag.add(mat, lathe([[0.5, 0], [0.001, 0.8]], 6, null, (q[0] + q[2]) / 2, y + 1.3, (q[1] + q[3]) / 2)); }
    }
  }
}
/** mamluk_minaret: { c, h, y } — square, octagonal and round tiers, balconies, a bulb. */
function minaret(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 70, r = el.r ?? 3;
  bag.add(S, box(x - r, y - 0.5, z - r, x + r, y + h * 0.35, z + r)); col.rect([x - r, z - r, x + r, z + r], y, y + h * 0.9);
  bag.add(S, lathe([[r * 1.35, 0], [r * 1.35, 1.3], [r * 0.85, 1.3]], 8, null, x, y + h * 0.35, z));
  bag.add(S, lathe([[r * 0.85, 0], [r * 0.8, h * 0.28]], 8, null, x, y + h * 0.35 + 1.3, z));
  bag.add(S, lathe([[r * 1.2, 0], [r * 1.2, 1.2], [r * 0.6, 1.2]], 12, null, x, y + h * 0.64, z));
  bag.add(S, lathe([[r * 0.6, 0], [r * 0.55, h * 0.18]], 12, null, x, y + h * 0.64 + 1.2, z));
  for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) bag.add(S, lathe([[0.25, 0], [0.25, h * 0.06]], 6, null, x + dx * r, y + h * 0.84, z + dz * r));
  bag.add(S, lathe([[r * 0.7, 0], [r * 0.8, r * 0.5], [r * 0.5, r * 1.1], [0.001, r * 1.4]], 12, null, x, y + h * 0.9, z));
}
/** mamluk_dome: { c, r, y, drum } — a stone dome on a drum, its zone of transition as stepped corners. */
function dome(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, y = el.y ?? 0, dr = el.drum ?? r * 0.5;
  bag.add(S, box(x - r * 1.1, y, z - r * 1.1, x + r * 1.1, y + dr * 0.6, z + r * 1.1));
  bag.add(S, lathe([[r * 1.08, 0], [r * 1.02, dr * 0.4]], 8, null, x, y + dr * 0.6, z));
  bag.add(S, lathe([[r, 0], [r, dr * 0.4]], 16, null, x, y + dr, z));
  bag.add('stucco', lathe([[r * 0.98, 0], [r * 0.95, r * 0.35], [r * 0.8, r * 0.7], [r * 0.5, r * 0.95], [0.001, r * 1.08]], 24, null, x, y + dr * 1.4, z));
  bag.add('bronze', lathe([[0.15, 0], [0.4, 0.6], [0.05, 1.6], [0.001, 2]], 6, null, x, y + dr * 1.4 + r * 1.08, z));
  col.circle(x, z, r * 1.1, y, y + dr);
}
/** madrasa_block: { rect, h, y, portal ('n'|'s'|'e'|'w'), court (rect of the open court) } — the sheer stone block with window bays, the crown, the portal recess. */
function block(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 36, f = el.portal ?? 'n', court = el.court;
  const parts = court ? [[x0, z0, x1, court[1]], [x0, court[3], x1, z1], [x0, court[1], court[0], court[3]], [court[2], court[1], x1, court[3]]] : [[x0, z0, x1, z1]];
  // the voids cut into the solid: the iwans round the court (each to the apex of its vault), the mihrab's niche, the way in from the portal
  const voids = [];
  for (const iw of el.iwans || []) { const [a, b, c2, d] = iw.rect; voids.push([a, b, c2, d, y, y + iw.ys + iw.W * 0.59]); if (iw.qibla) { const m2 = iwanFrame(iw); voids.push([...m2.rect(-1.1, 1.1, iw.D, iw.D + 1.1), y, y + 5]); } }
  for (const r of el.entry || []) voids.push([...r, y, y + 5.2]);
  for (const r of parts) { if (r[2] - r[0] < 0.5 || r[3] - r[1] < 0.5) continue; carve(bag, col, S, r, y - 0.5, y + h, voids); }
  if (court) { bag.add('marble', box(court[0], y - 0.3, court[1], court[2], y + 0.06, court[3])); col.floor(court, y + 0.06); }
  for (const r of el.entry || []) { bag.add('marble_floor', box(r[0], y - 0.3, r[1], r[2], y + 0.06, r[3])); col.floor(r, y + 0.06); }
  for (const iw of el.iwans || []) iwan(bag, col, iw, y);
  if (court && el.iwans) courtFittings(bag, col, court, y, h);
  crest(bag, [x0, z0, x1, z1], y + h);
  // a frame on each face: u along it, d outward from it; R(u0, u1, y0, y1, d0, d1) is a box in that frame
  const frame = (face) => {
    const along = face === 'n' || face === 's', o = face === 'n' ? z0 : face === 's' ? z1 : face === 'w' ? x0 : x1, sg = face === 'n' || face === 'w' ? -1 : 1;
    return (u0, u1, y0, y1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? box(u0, y0, Math.min(a, b), u1, y1, Math.max(a, b)) : box(Math.min(a, b), y0, u0, Math.max(a, b), y1, u1); };
  };
  // the bays: pilasters standing out between them; in each, tiers of paired windows — the lower square
  // under grilles, the upper with pointed heads — and a muqarnas cap stepping out at the top of the bay
  const pm = f === 'n' || f === 's' ? (x0 + x1) / 2 - (x1 - x0) * 0.25 : (z0 + z1) / 2;
  const inPortal = (face, u, half) => face === f && Math.abs(u - pm) < 5 + half + 0.6;
  for (const face of 'nsew') {
    const R = frame(face), along = face === 'n' || face === 's', a0 = along ? x0 : z0, L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 7);
    for (let i = 0; i <= n; i++) { const u = a0 + i * L / n; if (!inPortal(face, u, 0.7)) bag.add(S, R(u - 0.7, u + 0.7, y, y + h - 1.6, 0, 0.45)); }
    for (let i = 0; i < n; i++) {
      const u = a0 + (i + 0.5) * L / n, bw = L / n / 2 - 0.9;
      if (inPortal(face, u, bw)) continue;
      for (const [yy, hh, pointed] of [[y + 4, 4.2, false], [y + 13, 5.5, true], [y + 23, 4.8, true]]) for (const s2 of [-0.9, 0.9]) {
        bag.add('opening', R(u + s2 - 0.55, u + s2 + 0.55, yy, yy + hh, -0.02, 0.05));
        bag.add(S, R(u + s2 - 0.75, u + s2 + 0.75, yy - 0.25, yy, 0, 0.12));
        if (pointed) bag.add(S, R(u + s2 - 0.28, u + s2 + 0.28, yy + hh, yy + hh + 0.5, -0.02, 0.06));
        if (!pointed) for (let g = 1; g < 4; g++) bag.add('iron', R(u + s2 - 0.55, u + s2 + 0.55, yy + g * hh / 4 - 0.03, yy + g * hh / 4 + 0.03, 0.05, 0.1));
      }
      for (let k = 0; k < 4; k++) bag.add(S, R(u - bw + k * 0.25, u + bw - k * 0.25, y + h - 5.5 + k * 0.9, y + h - 4.6 + k * 0.9, 0, 0.12 + k * 0.1));
    }
  }
  // the portal: two piers standing out from the face, the hood of muqarnas stepping out across the top
  // of the recess between them, the door at the back under a grilled window, frames of moulding
  const R = frame(f), m = f === 'n' || f === 's' ? (x0 + x1) / 2 - (x1 - x0) * 0.25 : (z0 + z1) / 2, ph = h * 1.05, D = 3, W = 5;
  for (const s2 of [-1, 1]) bag.add(S, R(s2 < 0 ? m - W : m + W - 1.6, s2 < 0 ? m - W + 1.6 : m + W, y - 0.5, y + ph, 0, D));
  bag.add(S, R(m - W, m + W, y + ph * 0.8, y + ph, 0, D));
  bag.add(S, R(m - W - 0.3, m + W + 0.3, y + ph - 1.2, y + ph - 0.6, D - 0.2, D + 0.3));
  for (let k = 0; k < 7; k++) {
    const yy = y + ph * 0.58 + k * (ph * 0.22) / 7, out = D * (k + 1) / 7, n2 = 7 - Math.floor(k / 2);
    for (let i = 0; i < n2; i++) { const u0 = m - W + 1.6 + i * (2 * W - 3.2) / n2, u1 = u0 + (2 * W - 3.2) / n2 - 0.08; bag.add(S, R(u0, u1, yy, yy + ph * 0.22 / 7, 0, out)); }
  }
  if (el.entry) { for (const s2 of [-1, 1]) bag.add('bronze', R(s2 < 0 ? m - 1.5 : m + 1.3, s2 < 0 ? m - 1.3 : m + 1.5, y, y + 5.2, -1.4, 0)); }
  else bag.add('opening', R(m - 1.3, m + 1.3, y, y + 5.2, -0.02, 0.06));
  bag.add(S, R(m - 1.7, m + 1.7, y + 5.2, y + 5.9, 0, 0.2));
  bag.add('opening', R(m - 1.0, m + 1.0, y + 7.5, y + 10.5, -0.02, 0.06));
  for (let g = 1; g < 5; g++) bag.add('iron', R(m - 1.0, m + 1.0, y + 7.5 + g * 0.6 - 0.03, y + 7.5 + g * 0.6 + 0.03, 0.06, 0.1));
  for (const s2 of [-1, 1]) bag.add(S, R(s2 < 0 ? m - W + 1.6 : m + W - 1.9, s2 < 0 ? m - W + 1.9 : m + W - 1.6, y, y + ph * 0.58, 0, 0.3));
}
/** Solid boxes filling rect r from ya to yb less the void boxes [x0, z0, x1, z1, y0, y1], on a grid cut at the voids' edges, runs merged along x. */
function carve(bag, col, mat, r, ya, yb, voids) {
  const vs = voids.filter((v) => v[0] < r[2] && v[2] > r[0] && v[1] < r[3] && v[3] > r[1]);
  const cuts = (a, b, k) => [...new Set([a, b, ...vs.flatMap((v) => [v[k], v[k + 2]]).filter((c) => c > a && c < b)])].sort((p, q) => p - q);
  const xs = cuts(r[0], r[2], 0), zs = cuts(r[1], r[3], 1);
  const solid = (x, z) => {
    const iv = vs.filter((v) => x > v[0] && x < v[2] && z > v[1] && z < v[3]).map((v) => [v[4], v[5]]).sort((p, q) => p[0] - q[0]);
    const out = []; let y0 = ya;
    for (const [a, b] of iv) { if (a > y0) out.push([y0, Math.min(a, yb)]); y0 = Math.max(y0, b); }
    if (y0 < yb) out.push([y0, yb]);
    return out;
  };
  for (let j = 0; j + 1 < zs.length; j++) {
    let run = null;
    const flush = () => { if (!run) return; for (const [a, b] of run.iv) { bag.add(mat, box(run.x0, a, zs[j], run.x1, b, zs[j + 1])); col.rect([run.x0, zs[j], run.x1, zs[j + 1]], a, b); } run = null; };
    for (let i = 0; i + 1 < xs.length; i++) {
      const iv = solid((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2), key = JSON.stringify(iv);
      if (run && run.key === key) run.x1 = xs[i + 1]; else { flush(); run = { key, iv, x0: xs[i], x1: xs[i + 1] }; }
    }
    flush();
  }
}

/** An iwan's frame: u across its mouth, d in from the court face (0) to the back wall (D); `rect` maps frame bounds to a world rect, `P` a point. */
function iwanFrame(iw) {
  const [x0, z0, x1, z1] = iw.rect, o = iw.open;   // o: the side open to the court ('n' = toward −z …)
  const P = (u, d) => o === 'n' ? [(x0 + x1) / 2 + u, z0 + d] : o === 's' ? [(x0 + x1) / 2 - u, z1 - d] : o === 'w' ? [x0 + d, (z0 + z1) / 2 - u] : [x1 - d, (z0 + z1) / 2 + u];
  const rect = (u0, u1, d0, d1) => { const a = P(u0, d0), b = P(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { P, rect, B: (u0, u1, d0, d1, ya, yb) => { const q = rect(u0, u1, d0, d1); return box(q[0], ya, q[1], q[2], yb, q[3]); } };
}
const dbl = (t) => { const f = []; for (let i = 0; i < t.length; i += 9) f.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return fromTriangles(t.concat(f)); };

/**
 * An iwan { rect, open (side to the court), W (width), D (depth), ys (springing above the floor), qibla }:
 * a hall under a pointed barrel vault open to the court through an arch with voussoirs of red and
 * black (ablaq); oil lamps hung on chains, all at one height. The qibla iwan (docs/settlements/mamluk-cairo.md §4):
 * a dado of coloured marble panels, the great stucco band of Kufic at the springing, the marble
 * mihrab with windows in bronze grilles either side and an oculus above, the bronze doors to the
 * tomb, the marble minbar, and the dikka on columns in front of the iwan.
 */
function iwan(bag, col, iw, y) {
  const F = iwanFrame(iw), { P, B } = F, W = iw.W, D = iw.D, ys = y + iw.ys, r = W * 0.6, cL = -W / 2 + r, ta = Math.acos((W / 2 - r) / r), N = 14;
  bag.add('marble_floor', B(-W / 2, W / 2, 0, D, y - 0.3, y + 0.06)); col.floor(F.rect(-W / 2, W / 2, 0, D), y + 0.06);
  // the vault: two arcs meeting at the point, swept from the mouth to the back wall
  const arc = []; for (let k = 0; k <= N; k++) { const t = Math.PI - (Math.PI - ta) * k / N; arc.push([cL + r * Math.cos(t), ys + r * Math.sin(t)]); }
  const prof = arc.concat(arc.slice(0, -1).reverse().map(([u, yy]) => [-u, yy]));
  const apex = ys + W * 0.59, V = [], SP = [], cen = (k) => (k <= N ? cL : -cL);
  const at = (u, d, yy) => { const p = P(u, d); return [p[0], yy, p[1]]; };
  for (let k = 0; k + 1 < prof.length; k++) {
    const [u0, y0] = prof[k], [u1, y1] = prof[k + 1];
    V.push(...at(u0, 0, y0), ...at(u1, 0, y1), ...at(u1, D, y1), ...at(u0, 0, y0), ...at(u1, D, y1), ...at(u0, D, y0));
    SP.push(...at(u0, 0, y0), ...at(u1, 0, y1), ...at(u1, 0, apex), ...at(u0, 0, y0), ...at(u1, 0, apex), ...at(u0, 0, apex));
    // the voussoirs round the arch on the court face, red and black in turn
    const n0 = [u0 - cen(k), y0 - ys], n1 = [u1 - cen(k + 1 === N ? k : k + 1), y1 - ys];
    const l0 = Math.hypot(...n0), l1 = Math.hypot(...n1), e = 1.0;
    const q = [at(u0, -0.06, y0), at(u1, -0.06, y1), at(u1 + n1[0] / l1 * e, -0.06, y1 + n1[1] / l1 * e), at(u0 + n0[0] / l0 * e, -0.06, y0 + n0[1] / l0 * e)];
    bag.add(k % 2 ? 'marble_dark' : 'stucco_red', dbl([...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]]));
  }
  bag.add('stucco', dbl(V)); bag.add(S, dbl(SP));
  // the back wall's tympanum under the vault, plastered like the walls
  const TY = []; for (let k = 0; k + 1 < prof.length; k++) { const [u0, y0] = prof[k], [u1, y1] = prof[k + 1]; TY.push(...at(u0, D - 0.04, ys), ...at(u1, D - 0.04, ys), ...at(u1, D - 0.04, y1), ...at(u0, D - 0.04, ys), ...at(u1, D - 0.04, y1), ...at(u0, D - 0.04, y0)); }
  bag.add('stucco', dbl(TY));
  // the walls inside: plaster above, a moulding at the springing
  for (const s of [-1, 1]) { bag.add('stucco', B(s * W / 2 - (s > 0 ? 0.04 : 0), s * W / 2 + (s < 0 ? 0.04 : 0), 0, D, y + (iw.qibla ? 4.4 : 0), ys)); }
  bag.add('stucco', B(-W / 2, W / 2, D - 0.04, D, y + (iw.qibla ? 4.4 : 0), ys));
  for (const s of [-1, 1]) bag.add(S, B(s * W / 2 - (s > 0 ? 0.25 : 0), s * W / 2 + (s < 0 ? 0.25 : 0), 0, D, ys - 0.3, ys));
  // the lamps: glass, on chains from the vault, all at one height
  const ly = y + 4.6, cols = Math.max(2, Math.round(W / 5)), rows = Math.max(2, Math.round(D / 3.2));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const u = -W / 2 + (i + 0.5) * W / cols, d = (j + 0.6) * D / (rows + 0.2), p = P(u, d);
    const yv = ys + Math.sqrt(Math.max(0, r * r - (-Math.abs(u) - cL) ** 2)) - 0.2;
    bag.add('lamp_glass', lathe([[0.001, 0], [0.09, 0.02], [0.08, 0.08], [0.2, 0.2], [0.2, 0.3], [0.12, 0.38], [0.11, 0.45], [0.2, 0.62], [0.001, 0.62]], 10, null, p[0], ly, p[1]));
    for (const a of [0, 2.1, 4.2]) bag.add('bronze', rod([p[0] + Math.cos(a) * 0.18, ly + 0.55, p[1] + Math.sin(a) * 0.18], [p[0], ly + 1.1, p[1]], 0.008, 3));
    bag.add('iron', rod([p[0], ly + 1.1, p[1]], [p[0], Math.max(ly + 1.2, yv), p[1]], 0.012, 4));
  }
  if (!iw.qibla) return;
  // the dado: panels of white, dark and rose marble with dark frames, round the three walls
  const panel = (u0, u1, d0, d1, ya, yb, k) => bag.add(['marble_smooth', 'marble_pink', 'marble_smooth', 'marble_dark'][k % 4], B(u0, u1, d0, d1, ya, yb));
  for (const s of [-1, 1]) { const n = Math.round(D / 1.5); for (let k = 0; k < n; k++) { const d0 = k * D / n + 0.06, d1 = (k + 1) * D / n - 0.06, uu = s * W / 2; panel(uu - (s > 0 ? 0.06 : 0), uu + (s < 0 ? 0.06 : 0), d0, d1, y + 0.3, y + 3.9, k); bag.add('marble_dark', B(uu - (s > 0 ? 0.04 : 0), uu + (s < 0 ? 0.04 : 0), k * D / n, (k + 1) * D / n, y + 0.06, y + 4.4)); } }
  { const n = Math.round(W / 1.5); for (let k = 0; k < n; k++) { const u0 = -W / 2 + k * W / n, u1 = u0 + W / n; if (Math.abs(u0 + u1) / 2 < 2.6) continue; if (Math.abs(Math.abs((u0 + u1) / 2) - 7) < 1.4) continue; panel(u0 + 0.06, u1 - 0.06, D - 0.1, D, y + 0.3, y + 3.9, k); bag.add('marble_dark', B(u0, u1, D - 0.06, D, y + 0.06, y + 4.4)); } }
  // the Kufic band at the springing: tall stems and heads in relief on a ground, all round the iwan
  const by = ys - 2.2, bh = 1.7;
  const band = (len, place) => { place(0, len, -0.02, 0.12, by, by + bh, 'stucco_warm'); let u = 0.25, k = 0; while (u < len - 0.3) { const tall = (k * 7 + 3) % 5 !== 0, w = tall ? 0.09 : 0.28; place(u, u + w, 0.12, 0.2, by + 0.2, by + (tall ? bh - 0.2 : 0.45), 'stucco_cream'); if (tall && k % 3 === 0) place(u - 0.08, u + w + 0.08, 0.12, 0.2, by + bh - 0.35, by + bh - 0.2, 'stucco_cream'); u += tall ? 0.24 + ((k * 13) % 4) * 0.04 : 0.36; k++; } place(0, len, 0.12, 0.18, by + 0.12, by + 0.22, 'stucco_cream'); };
  for (const s of [-1, 1]) band(D, (a, b, i0, i1, ya, yb, m) => bag.add(m, B(s * W / 2 - s * i1, s * W / 2 - s * i0, a, b, ya, yb)));
  band(W, (a, b, i0, i1, ya, yb, m) => bag.add(m, B(-W / 2 + a, -W / 2 + b, D - i1, D - i0, ya, yb)));
  // the mihrab: its niche (cut into the wall), lined in dark and white marble, colonnettes, a frame and a pointed hood
  bag.add('marble_dark', B(-1.1, 1.1, D + 1.06, D + 1.1, y, y + 5));
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'marble_smooth' : 'marble_dark', B(s > 0 ? 1.06 : -1.1, s > 0 ? 1.1 : -1.06, D, D + 1.1, y + k * 5 / 6, y + (k + 1) * 5 / 6));
  bag.add('marble_pink', B(-1.1, 1.1, D, D + 1.1, y + 4.96, y + 5));
  for (const s of [-1, 1]) { const p = P(s * 1.3, D - 0.15); bag.add('marble_column', lathe([[0.12, 0], [0.12, 4.6], [0.18, 4.75], [0.18, 4.9], [0.001, 4.9]], 10, null, p[0], y, p[1])); }
  bag.add('marble_smooth', B(-2.4, 2.4, D - 0.12, D, y, y + 0.3));
  for (const [u0, u1, ya, yb, m] of [[-2.4, -1.6, y, y + 7.6, 'marble_pink'], [1.6, 2.4, y, y + 7.6, 'marble_pink'], [-2.4, 2.4, y + 7.0, y + 7.6, 'marble_pink'], [-1.6, 1.6, y + 5.0, y + 7.0, 'marble_smooth']]) bag.add(m, B(u0, u1, D - 0.1, D, ya, yb));
  // the pointed hood over the niche: a moulding along two arcs meeting at the point, dark on white
  { const hr = 1.55 * 1.2, hc = -1.55 + hr, hta = Math.acos(-hc / hr), pts = [];
    for (let k = 0; k <= 10; k++) { const t = Math.PI - (Math.PI - hta) * k / 10; pts.push([hc + hr * Math.cos(t), y + 5 + hr * Math.sin(t)]); }
    for (const sg of [1, -1]) for (let k = 0; k < 10; k++) bag.add('marble_dark', rod(at(sg * pts[k][0], D - 0.12, pts[k][1]), at(sg * pts[k + 1][0], D - 0.12, pts[k + 1][1]), 0.09, 6)); }
  // the windows either side in bronze grilles, the oculus above; the bronze doors to the tomb
  for (const s of [-1, 1]) {
    const u = s * 4.6;
    bag.add(S, B(u - 1.3, u + 1.3, D - 0.6, D, y + 6.2, y + 6.4));
    bag.add('daylight', B(u - 1.0, u + 1.0, D - 0.04, D, y + 6.4, y + 9.6));
    for (let g = 0; g <= 6; g++) bag.add('bronze', B(u - 1.0 + g / 3 - 0.03, u - 1.0 + g / 3 + 0.03, D - 0.1, D - 0.04, y + 6.4, y + 9.6));
    for (let g = 1; g < 6; g++) bag.add('bronze', B(u - 1.0, u + 1.0, D - 0.1, D - 0.04, y + 6.4 + g * 0.53 - 0.03, y + 6.4 + g * 0.53 + 0.03));
    const ud = s * 7;
    bag.add('bronze', B(ud - 1.1, ud + 1.1, D - 0.08, D, y + 0.06, y + 4.2));
    for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) bag.add('gilt_bronze', B(ud - 0.85 + a * 0.56, ud - 0.75 + a * 0.56, D - 0.13, D - 0.08, y + 0.5 + b * 0.6, y + 0.6 + b * 0.6));
    bag.add('marble_pink', B(ud - 1.4, ud + 1.4, D - 0.1, D, y + 4.2, y + 4.6));
  }
  {
    const p = P(0, D - 0.03), q = P(0, 0), b0 = P(0, D), b1 = P(1, D), vx = Math.sign(q[0] - b0[0]), vz = Math.sign(q[1] - b0[1]), oy = y + 12.2;
    const g = disc(1.3, 0, 20); if (vz) g.rotateX(vz * Math.PI / 2); else g.rotateZ(-vx * Math.PI / 2);
    bag.add('daylight', g.translate(p[0], oy, p[1]));
    const ux = b1[0] - b0[0], uz = b1[1] - b0[1];
    for (let k = 0; k < 20; k++) { const a0 = k / 20 * Math.PI * 2, a1 = (k + 1) / 20 * Math.PI * 2; bag.add(k % 2 ? 'marble_dark' : 'marble_smooth', rod([p[0] + ux * Math.cos(a0) * 1.42 - vx * 0.05, oy + Math.sin(a0) * 1.42, p[1] + uz * Math.cos(a0) * 1.42 - vz * 0.05], [p[0] + ux * Math.cos(a1) * 1.42 - vx * 0.05, oy + Math.sin(a1) * 1.42, p[1] + uz * Math.cos(a1) * 1.42 - vz * 0.05], 0.13, 5)); }
  }
  // the minbar: steps of marble up to a seat under a little dome, to the right of the mihrab
  const mu = -3.1, steps = 12;
  for (let k = 0; k < steps; k++) { const d1 = D - 0.4 - k * 0.42, yy = y + 4.2 - k * 0.35; bag.add('marble_smooth', B(mu - 0.5, mu + 0.5, d1 - 0.42, d1, y + 0.06, yy)); col.floor(F.rect(mu - 0.5, mu + 0.5, d1 - 0.42, d1), yy); }
  { const t = []; for (const s of [-1, 1]) { const u = mu + s * 0.58, a = at(u, D - 0.4, y + 5.1), b = at(u, D - 0.4 - steps * 0.42, y + 1.3), c = at(u, D - 0.4 - steps * 0.42, y + 0.06), d = at(u, D - 0.4, y + 0.06); t.push(...a, ...b, ...c, ...a, ...c, ...d); } bag.add('marble_pink', dbl(t)); }
  for (const s of [-1, 1]) { bag.add('marble_smooth', B(mu + s * 0.58 - 0.08, mu + s * 0.58 + 0.08, D - 0.6 - steps * 0.42, D - 0.4 - steps * 0.42, y, y + 3.0)); bag.add('marble_smooth', B(mu + s * 0.5 - 0.06, mu + s * 0.5 + 0.06, D - 1.2, D - 1.08, y + 4.2, y + 6.4)); bag.add('marble_smooth', B(mu + s * 0.5 - 0.06, mu + s * 0.5 + 0.06, D - 0.36, D - 0.24, y + 4.2, y + 6.4)); }
  bag.add('marble_smooth', B(mu - 0.66, mu + 0.66, D - 0.6 - steps * 0.42, D - 0.4 - steps * 0.42, y + 3.0, y + 3.4));
  { const p = P(mu, D - 0.7); bag.add('marble_smooth', box(p[0] - 0.62, y + 6.4, p[1] - 0.52, p[0] + 0.62, y + 6.6, p[1] + 0.52)); bag.add('marble_smooth', lathe([[0.5, 0], [0.48, 0.3], [0.32, 0.7], [0.08, 0.95], [0.001, 1.25]], 12, null, p[0], y + 6.6, p[1])); }
  // the dikka: a marble platform on eight columns in front of the iwan, a parapet round it
  const dk = [-2.6, 2.6, -6.2, -1.6], dy = y + 2.6;
  bag.add('marble_smooth', B(dk[0], dk[1], dk[2], dk[3], dy, dy + 0.35));
  for (const [a, b] of [[dk[0], dk[1]]]) { bag.add('marble_pink', B(a, b, dk[2], dk[2] + 0.12, dy + 0.35, dy + 1.2)); bag.add('marble_pink', B(a, b, dk[3] - 0.12, dk[3], dy + 0.35, dy + 1.2)); }
  for (const s of [-1, 1]) bag.add('marble_pink', B(s > 0 ? dk[1] - 0.12 : dk[0], s > 0 ? dk[1] : dk[0] + 0.12, dk[2], dk[3], dy + 0.35, dy + 1.2));
  for (const u of [dk[0] + 0.3, dk[0] + 2.0, dk[1] - 2.0, dk[1] - 0.3]) for (const d of [dk[2] + 0.3, dk[3] - 0.3]) { const p = P(u, d); bag.add('marble_column', lathe([[0.16, 0], [0.14, 0.2], [0.12, 2.3], [0.2, 2.45], [0.2, 2.6], [0.001, 2.6]], 10, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.16, y, dy); }
}

/** The court's fittings: the octagonal basin of the fountain at the centre, the madrasas' doors in its corners, a cornice round its top. */
function courtFittings(bag, col, c, y, h) {
  const cx = (c[0] + c[2]) / 2, cz = (c[1] + c[3]) / 2;
  bag.add('marble_smooth', lathe([[3.4, 0], [3.4, 0.9], [3.6, 0.95], [3.6, 1.05], [3.1, 1.05], [3.1, 0.3], [0.001, 0.3]], 8, null, cx, y, cz));
  bag.add('water', disc(3.1, y + 0.8, 8, cx, cz));
  bag.add('marble_smooth', lathe([[0.3, 0], [0.22, 0.6], [0.5, 0.8], [0.5, 0.9], [0.12, 1.0], [0.08, 1.6], [0.001, 1.7]], 10, null, cx, y + 0.3, cz));
  col.circle(cx, cz, 3.6, y, y + 1.05);
  for (const [x, z, dx, dz] of [[c[0], c[1] + 2.5, 1, 0], [c[2], c[1] + 2.5, -1, 0], [c[0], c[3] - 2.5, 1, 0], [c[2], c[3] - 2.5, -1, 0]]) {
    const o = dx * 0.04;
    bag.add('opening', box(Math.min(x, x + o), y, z - 0.8, Math.max(x, x + o), y + 3.2, z + 0.8));
    for (const [a, b, ya, yb] of [[-1.2, -0.8, y, y + 3.6], [0.8, 1.2, y, y + 3.6], [-1.2, 1.2, y + 3.2, y + 3.6]]) bag.add('marble_dark', box(Math.min(x, x + dx * 0.1), ya, z + a, Math.max(x, x + dx * 0.1), yb, z + b));
    bag.add('stucco_red', box(Math.min(x, x + dx * 0.08), y + 3.6, z - 1.2, Math.max(x, x + dx * 0.08), y + 4.2, z + 1.2));
  }
  for (let k = 0; k < 3; k++) { const e = 0.3 + k * 0.3, yy = y + h - 2.4 + k * 0.5; for (const r of [[c[0], c[1], c[2], c[1] + e], [c[0], c[3] - e, c[2], c[3]], [c[0], c[1], c[0] + e, c[3]], [c[2] - e, c[1], c[2], c[3]]]) bag.add(S, box(r[0], yy, r[1], r[2], yy + 0.5, r[3])); }
}

/** citadel_wall: a→b { h, th, y } with round towers. */
function citadelWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, h = el.h ?? 12, th = el.th ?? 3, y = el.y ?? 0, L = Math.hypot(bx - ax, bz - az);
  const r = [Math.min(ax, bx) - th / 2, Math.min(az, bz) - th / 2, Math.max(ax, bx) + th / 2, Math.max(az, bz) + th / 2];
  bag.add(S, box(r[0], y - 2, r[1], r[2], y + h, r[3])); col.rect(r, y - 2, y + h); col.floor(r, y + h);
  const n = Math.max(1, Math.floor(L / 30));
  for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n; bag.add(S, lathe([[th * 1.6, 0], [th * 1.5, h + 3 + 2]], 16, null, x, y - 2, z)); col.circle(x, z, th * 1.6, y - 2, y + h + 3); }
}
registerStyle('mamluk', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, mamluk_minaret: minaret, mamluk_dome: dome, madrasa_block: block, citadel_wall: citadelWall },
  objects: {},
});
