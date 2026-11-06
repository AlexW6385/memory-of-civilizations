// Neo-Babylonian architecture (6th c. BC; docs/settlements/babylon.md §4): the Mesopotamian mud-brick
// vocabulary (src/styles/sumerian) with Nebuchadnezzar's baked brick and glazed brick — the
// Ishtar Gate's towers in blue glaze with rows of beasts, crenellated; glazed walls along the
// Processional Way; the city's double walls with towers.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../sumerian/index.js';

const G = 'glaze_lapis', B = 'brick_baked';
function crenels(bag, r, y, mat, step = 1.4) {
  const [x0, z0, x1, z1] = r, along = x1 - x0 > z1 - z0, L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / step);
  for (let i = 0; i < n; i += 2) {
    const u0 = (along ? x0 : z0) + i * L / n, u1 = u0 + L / n;
    for (const s of [0, 1]) { const q = along ? [u0, s ? z1 - 0.6 : z0, u1, s ? z1 : z0 + 0.6] : [s ? x1 - 0.6 : x0, u0, s ? x1 : x0 + 0.6, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.2, q[3])); bag.add(mat, box(q[0] + 0.15, y + 1.2, q[1] + 0.15, q[2] - 0.15, y + 1.7, q[3] - 0.15)); }
  }
}
// The beasts of the glazed walls in outline (walking toward +u, feet at 0, about 1 high): Ishtar's lion,
// Marduk's dragon (mushhushshu) with its horned serpent head, eagle hind feet and scorpion tail, Adad's bull.
const OUTLINES = {
  // the lion striding: tail raised with its tuft, the mane, the open jaws, one fore and one hind leg forward
  lion: [[-1.02, 0.98], [-0.94, 1.02], [-0.9, 0.94], [-0.86, 0.8], [-0.78, 0.7], [-0.6, 0.73], [-0.3, 0.71], [0, 0.72], [0.2, 0.76], [0.32, 0.86], [0.44, 0.95], [0.56, 0.99], [0.64, 0.98], [0.74, 0.96], [0.78, 1.01], [0.83, 0.97], [0.86, 0.9], [0.95, 0.84], [0.98, 0.79], [0.92, 0.76], [0.97, 0.72], [0.94, 0.68], [0.84, 0.7], [0.8, 0.66], [0.74, 0.58], [0.68, 0.5], [0.72, 0.3], [0.78, 0.08], [0.85, 0.02], [0.85, 0], [0.7, 0], [0.7, 0.06], [0.62, 0.3], [0.58, 0.4], [0.52, 0.3], [0.46, 0.06], [0.5, 0.02], [0.5, 0], [0.37, 0], [0.38, 0.06], [0.42, 0.3], [0.4, 0.42], [0.1, 0.4], [-0.3, 0.42], [-0.36, 0.32], [-0.3, 0.08], [-0.25, 0.02], [-0.25, 0], [-0.4, 0], [-0.42, 0.08], [-0.48, 0.3], [-0.54, 0.34], [-0.66, 0.1], [-0.63, 0.02], [-0.63, 0], [-0.78, 0], [-0.78, 0.08], [-0.7, 0.36], [-0.76, 0.5], [-0.8, 0.62], [-0.86, 0.72], [-0.9, 0.86], [-0.96, 0.92]],
  // the mane over head, neck and chest, its edge in tufts
  mane: [[0.18, 0.74], [0.24, 0.84], [0.3, 0.83], [0.36, 0.93], [0.42, 0.91], [0.5, 1.0], [0.58, 0.99], [0.66, 0.95], [0.7, 0.86], [0.72, 0.74], [0.75, 0.64], [0.7, 0.58], [0.67, 0.5], [0.6, 0.53], [0.56, 0.44], [0.5, 0.5], [0.44, 0.44], [0.38, 0.52], [0.3, 0.54], [0.26, 0.64], [0.2, 0.64]],
  eye: [[0.83, 0.88], [0.86, 0.9], [0.88, 0.87], [0.85, 0.85]],
  dragon: [[-0.95, 0.95], [-0.88, 0.98], [-0.85, 0.8], [-0.7, 0.68], [0.1, 0.66], [0.3, 0.72], [0.45, 0.95], [0.5, 1.15], [0.62, 1.25], [0.66, 1.4], [0.72, 1.26], [0.8, 1.22], [0.86, 1.16], [0.72, 1.1], [0.6, 1.0], [0.55, 0.8], [0.5, 0.6], [0.48, 0.36], [0.56, 0], [0.46, 0], [0.38, 0.34], [0.3, 0], [0.2, 0], [0.2, 0.38], [-0.4, 0.38], [-0.45, 0], [-0.58, 0], [-0.55, 0.36], [-0.62, 0], [-0.72, 0], [-0.68, 0.45], [-0.78, 0.62], [-0.92, 0.78]],
  bull: [[-0.85, 0.8], [-0.6, 0.86], [0.3, 0.86], [0.5, 0.92], [0.6, 1.05], [0.66, 1.18], [0.7, 1.05], [0.82, 1.0], [0.9, 0.86], [0.86, 0.72], [0.7, 0.68], [0.6, 0.52], [0.56, 0], [0.46, 0], [0.42, 0.4], [0.34, 0], [0.24, 0], [0.26, 0.42], [-0.45, 0.42], [-0.5, 0], [-0.6, 0], [-0.6, 0.4], [-0.68, 0], [-0.78, 0], [-0.74, 0.5], [-0.86, 0.6], [-0.92, 0.45], [-0.96, 0.5], [-0.9, 0.68]],
};
/** Triangles of a simple polygon (ear clipping). */
function earcut(P) {
  const idx = P.map((_, i) => i), out = [];
  let area = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0, cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inTri = (p, a, b, c) => { const d1 = cross(a, b, p), d2 = cross(b, c, p), d3 = cross(c, a, p); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
  let guard = 0;
  while (idx.length > 3 && guard++ < 2000) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length], a = P[ia], b = P[ib], c = P[ic];
      const cv = cross(a, b, c);
      if (ccw ? cv <= 0 : cv >= 0) continue;
      if (idx.some((j) => j !== ia && j !== ib && j !== ic && inTri(P[j], a, b, c))) continue;
      out.push([ia, ib, ic]); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}
const CUT = {};
/** A beast in relief on a face: its outline extruded `d` out of the wall plane, its body `mat`. */
function relief(bag, kind, mat, place, size, dir, d = 0.1) {
  const P = OUTLINES[kind], tri = (CUT[kind] ??= earcut(P)), T = [];
  const V = ([u, v], w) => place(dir * u * size, v * size, w);
  for (const [a, b, c] of tri) T.push(...V(P[a], d), ...V(P[b], d), ...V(P[c], d), ...V(P[a], d), ...V(P[c], d), ...V(P[b], d));
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; const p = [V(a, 0), V(b, 0), V(b, d), V(a, d)]; T.push(...p[0], ...p[1], ...p[2], ...p[0], ...p[2], ...p[3], ...p[0], ...p[2], ...p[1], ...p[0], ...p[3], ...p[2]); }
  bag.add(mat, fromTriangles(T));
}
/** Rows of beasts on a glazed face, walking toward the gate, between bands of rosettes. kind: 'lion' | 'dragon' | 'bull' | 'gate' (dragons and bulls by turn). */
function beasts(bag, r, face, y, step = 3, kind = 'lion') {
  const [x0, z0, x1, z1] = r, along = face === 'n' || face === 's', L = along ? x1 - x0 : z1 - z0, n = Math.max(1, Math.floor(L / step));
  const place = (u0) => (du, dv, w) => face === 'n' ? [u0 + du, y + dv, z0 - 0.02 - w] : face === 's' ? [u0 + du, y + dv, z1 + 0.02 + w] : face === 'w' ? [x0 - 0.02 - w, y + dv, u0 + du] : [x1 + 0.02 + w, y + dv, u0 + du];
  const size = Math.min(1.25, step * 0.42), dir = face === 'n' || face === 'e' ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const u = (along ? x0 : z0) + (i + 0.5) * L / n, k = kind === 'gate' ? (i % 2 ? 'bull' : 'dragon') : kind;
    relief(bag, k, k === 'bull' ? 'glaze_yellow' : 'glaze_white', place(u), size, dir);
    if (k === 'lion') { relief(bag, 'mane', 'glaze_yellow', place(u), size, dir, 0.13); relief(bag, 'eye', 'glaze_blue', place(u), size, dir, 0.115); }
  }
  // the rosette bands above and below
  for (const yy of [y - 0.35, y + size * (kind === 'gate' ? 1.5 : 1.1) + 0.2]) {
    const m = Math.floor(L / 0.7);
    for (let i = 0; i < m; i++) {
      const u = (along ? x0 : z0) + (i + 0.5) * L / m, p = place(u)(0, yy - y, 0.03);
      const g = lathe([[0.2, 0], [0.2, 0.05], [0.001, 0.05]], 8); g.rotateX(Math.PI / 2); if (!along) g.rotateY(Math.PI / 2); g.translate(...p); bag.add('glaze_white', g);
      const c = lathe([[0.08, 0], [0.08, 0.08], [0.001, 0.08]], 6); c.rotateX(Math.PI / 2); if (!along) c.rotateY(Math.PI / 2); c.translate(...p); bag.add('glaze_yellow', c);
    }
  }
}
/** ishtar_gate: { c, dir ('ns': the way runs along z), w (the passage), d (depth), h (outer), h2 (inner) } — the outer and inner gates, their towers, the arched passage. */
function ishtarGate(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 5, D = el.d ?? 40, h = el.h ?? 14, h2 = el.h2 ?? 23, y = el.y ?? 0;
  const parts = [[cz - D / 2, cz - D / 2 + 14, h, 9], [cz - D / 2 + 16, cz + D / 2, h2, 12]];
  for (const [z0, z1, H, tw] of parts) {
    for (const s of [-1, 1]) {
      const r = s < 0 ? [cx - w / 2 - tw, z0, cx - w / 2, z1] : [cx + w / 2, z0, cx + w / 2 + tw, z1];
      bag.add(G, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); col.floor(r, y + H);
      crenels(bag, r, y + H, G);
      for (let k = 0; k < 4; k++) for (const f of ['n', 's', s < 0 ? 'w' : 'e']) beasts(bag, r, f, y + 2 + k * (H - 4) / 4, 3.2, 'gate');
      // the towers projecting at the corners
      for (const tz of [z0 - 1.5, z1 - 4.5]) { const t = [r[0] - 1.5, tz, r[2] + 1.5, tz + 6]; bag.add(G, box(t[0], y - 0.5, t[1], t[2], y + H + 2, t[3])); col.rect(t, y, y + H + 2); crenels(bag, t, y + H + 2, G); }
    }
    bag.add(G, box(cx - w / 2, y + H * 0.62, z0, cx + w / 2, y + H, z1));
  }
  bag.add(B, box(cx - w / 2, y - 0.3, cz - D / 2, cx + w / 2, y + 0.05, cz + D / 2)); col.floor([cx - w / 2, cz - D / 2, cx + w / 2, cz + D / 2], y + 0.05);
}
/** glazed_wall: a wall a→b { h, th } in glazed brick with a row of lions, crenellated. */
function glazedWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 2.5, h = el.h ?? 8, y = el.y ?? 0;
  const r = [Math.min(ax, bx) - (ax === bx ? th / 2 : 0), Math.min(az, bz) - (az === bz ? th / 2 : 0), Math.max(ax, bx) + (ax === bx ? th / 2 : 0), Math.max(az, bz) + (az === bz ? th / 2 : 0)];
  bag.add(el.mat || G, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
  crenels(bag, r, y + h, el.mat || G);
  if (el.lions !== false) for (const f of ax === bx ? ['w', 'e'] : ['n', 's']) beasts(bag, r, f, y + 1.6, 4);
}
/** city_wall: a double wall with towers a→b { h, th, gap (between the two walls), y }. */
function cityWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 6, h = el.h ?? 15, gap = el.gap ?? 12, y = el.y ?? 0, alongX = az === bz;
  for (const [o, hh, t] of [[0, h, th], [gap + th, h * 0.75, th * 0.65]]) {
    const r = alongX ? [Math.min(ax, bx), az - t / 2 + o, Math.max(ax, bx), az + t / 2 + o] : [ax - t / 2 + o, Math.min(az, bz), ax + t / 2 + o, Math.max(az, bz)];
    if (r[2] - r[0] < 0.5 || r[3] - r[1] < 0.5) continue;
    bag.add(B, box(r[0], y - 0.5, r[1], r[2], y + hh, r[3])); col.rect(r, y, y + hh); col.floor(r, y + hh); crenels(bag, r, y + hh, B, 1.6);
    const L = alongX ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / 20);
    for (let i = 0; i <= n; i++) { const u = (alongX ? r[0] : r[1]) + i * L / Math.max(1, n); const q = alongX ? [u - 4, r[1] - 2, u + 4, r[3] + 2] : [r[0] - 2, u - 4, r[2] + 2, u + 4]; bag.add(B, box(q[0], y - 0.5, q[1], q[2], y + hh + 3, q[3])); col.rect(q, y, y + hh + 3); }
  }
}
registerStyle('babylonian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.sumerian.elements, ishtar_gate: ishtarGate, glazed_wall: glazedWall, city_wall: cityWall },
  objects: {},
});
