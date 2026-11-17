// The East Hall's roof work, on top of the `chinese` style's hip_roof (docs/buildings/foguang-east-hall.md §4, "Roof work"):
// the rows of cover tiles (bantong/tongwa) down every slope with the round tile-ends (washing tiles' faces, waidang) at the eave,
// the layered ridge with its rolled crown, the rolls along the four hips, and the chiwei of the ridge ends built as a body with
// a bulging belly, scaled bands on its outer face and a serrated back. All of it tile_grey (the roof's own material), one
// geometry per element, nothing instanced.

import { STYLES, registerStyle } from '../../core/build.js';
import '../../styles/chinese/index.js';
import { fromTriangles } from '../../core/geom.js';
import { hexa, obox, alongZ } from '../../styles/chinese/index.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** A quad (a b c d) pushed as two triangles facing away from the inner point `ref`. */
function quadO(out, a, b, c, d, ref) {
  const n = cross(sub(b, a), sub(c, a)), m = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4];
  if (dot(n, sub(m, ref)) >= 0) out.push(...a, ...b, ...c, ...a, ...c, ...d); else out.push(...a, ...c, ...b, ...a, ...d, ...c);
}
function triO(out, a, b, c, ref) {
  const n = cross(sub(b, a), sub(c, a)), m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
  if (dot(n, sub(m, ref)) >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}

/** A round bar through the points `pts` [[x,y,z]…] with radii `rad` (number or per point), n sides; caps at both ends when `caps`. */
function tube(out, pts, rad, n = 8, caps = false) {
  const rings = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], T = norm(sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)]));
    let u = cross(T, [0, 1, 0]); if (Math.hypot(...u) < 1e-3) u = cross(T, [1, 0, 0]); u = norm(u);
    const v = norm(cross(u, T)), r = typeof rad === 'number' ? rad : rad[i];
    rings.push({ c: p, pts: Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [p[0] + r * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), p[1] + r * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), p[2] + r * (Math.cos(a) * u[2] + Math.sin(a) * v[2])]; }) });
  }
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < n; k++) {
    const A = rings[i], B = rings[i + 1], k1 = (k + 1) % n;
    quadO(out, A.pts[k], A.pts[k1], B.pts[k1], B.pts[k], [(A.c[0] + B.c[0]) / 2, (A.c[1] + B.c[1]) / 2, (A.c[2] + B.c[2]) / 2]);
  }
  if (caps) for (const [R, o] of [[rings[0], rings[1]], [rings[rings.length - 1], rings[rings.length - 2]]]) for (let k = 0; k < n; k++) triO(out, R.c, R.pts[k], R.pts[(k + 1) % n], o.c);
}

/** A short round disc (a tile's end) at `c`, its face toward the unit vector `dir`, radius r, thickness t, n sides. */
function disc(out, c, dir, r, t, n = 6) {
  let u = cross(dir, [0, 1, 0]); if (Math.hypot(...u) < 1e-3) u = [1, 0, 0]; u = norm(u);
  const v = norm(cross(u, dir)), back = [c[0] - dir[0] * t, c[1] - dir[1] * t, c[2] - dir[2] * t];
  const ring = (o) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2 + 0.3; return [o[0] + r * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), o[1] + r * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), o[2] + r * (Math.cos(a) * u[2] + Math.sin(a) * v[2])]; });
  const f = ring(c), b = ring(back);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; triO(out, c, f[k], f[k1], back); quadO(out, f[k], f[k1], b[k1], b[k], back); }
}

function fgRoofX(el, { bag }) {
  const [cx, cz] = el.c, A = el.A, B = el.B, R = el.rise, U = el.lift ?? 0.6, S = el.eaveSlope ?? 0, PW = el.pow ?? 1.45;
  const h = (x, z) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz);
    const t = Math.max(0, Math.min(1, Math.min((B - az) / B, (A - ax) / B)));
    const corner = Math.max(0, 1 - (A - ax) / 5) * Math.max(0, 1 - (B - az) / 5);
    return el.y + S * B * t + (R - S * B) * Math.pow(t, PW) + U * corner * corner;
  };
  const L = A - B, top = el.y + R, sp = el.tilePitch ?? 0.36;
  const tris = [];

  // ── the cover tiles: a half-round rib every 0.36 m down each slope, from the eave to the ridge's foot or the hip's, each
  // lightly different in length so that none repeats; a tile-end disc at the eave of every one ──
  const rib = (pts, wb, wt, ht, lat) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], ra = [a[0], a[1] - 0.06, a[2]], rb = [b[0], b[1] - 0.06, b[2]];
      const P = (p, s, y) => [p[0] + lat[0] * s, y, p[2] + lat[1] * s];
      const bl = [P(a, -wb, a[1] - 0.01), P(b, -wb, b[1] - 0.01)], br = [P(a, wb, a[1] - 0.01), P(b, wb, b[1] - 0.01)];
      const tl = [P(a, -wt, a[1] + ht), P(b, -wt, b[1] + ht)], tr = [P(a, wt, a[1] + ht), P(b, wt, b[1] + ht)];
      const m = [(ra[0] + rb[0]) / 2, (ra[1] + rb[1]) / 2, (ra[2] + rb[2]) / 2];
      quadO(tris, bl[0], bl[1], tl[1], tl[0], m); quadO(tris, tl[0], tl[1], tr[1], tr[0], m); quadO(tris, tr[0], tr[1], br[1], br[0], m);
    }
  };
  const run = (from, to, lat, slopeDir, i) => {
    // from: the eave point (x, z); to: the upper end; points every ~0.9 m on the surface
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]), n = Math.max(1, Math.round(len / 0.9)), pts = [];
    for (let k = 0; k <= n; k++) { const x = from[0] + (to[0] - from[0]) * k / n, z = from[1] + (to[1] - from[1]) * k / n; pts.push([x, h(x, z), z]); }
    const k = (i % 3) * 0.004;
    rib(pts, 0.075 + k, 0.048 + k * 0.5, 0.07, lat);
    // the tile's end: a disc at the eave, face along the slope outward
    const e = pts[0], nx = pts[1], d = norm(sub(e, nx));
    disc(tris, [e[0] + slopeDir[0] * 0.02, e[1] + 0.035, e[2] + slopeDir[1] * 0.02], d, 0.07 + k, 0.04 + k, 6);
  };
  // the long sides: ribs run along z at fixed x
  for (const sz of [-1, 1]) {
    let i = 0;
    for (let x = cx - A + 0.4; x <= cx + A - 0.4; x += sp, i++) {
      const ax = Math.abs(x - cx);
      const zTo = ax <= L ? 0.7 : Math.max(0.7, B - (A - ax) + 0.5);
      if (zTo >= B - 0.3) continue;
      run([x, cz + sz * (B - 0.02)], [x, cz + sz * zTo], [1, 0], [0, sz], i);
    }
  }
  // the ends: ribs run along x at fixed z
  for (const sx of [-1, 1]) {
    let i = 0;
    for (let z = cz - B + 0.4; z <= cz + B - 0.4; z += sp, i++) {
      const az = Math.abs(z - cz), axTo = L + az + 0.5;
      if (axTo >= A - 0.8) continue;
      run([cx + sx * (A - 0.02), z], [cx + sx * axTo, z], [0, 1], [sx, 0], i + 1);
    }
  }

  // ── the ridge: three stepped courses of tiles, a rolled crown with bands, flared at the ends ──
  const c0 = [cx, cz], ux = [1, 0], un = [0, 1];
  obox(tris, c0, ux, un, L + 0.45, 0.66, top - 0.25, top + 0.1);
  obox(tris, c0, ux, un, L + 0.4, 0.56, top + 0.1, top + 0.22);
  obox(tris, c0, ux, un, L + 0.34, 0.47, top + 0.22, top + 0.34);
  tube(tris, [[cx - L - 0.3, top + 0.6, cz], [cx + L + 0.3, top + 0.6, cz]], 0.4, 10, true);
  for (let x = cx - L; x <= cx + L + 0.01; x += (2 * L) / Math.round(2 * L / 1.1)) tube(tris, [[x - 0.05, top + 0.6, cz], [x + 0.05, top + 0.6, cz]], 0.435, 10, true);
  for (const s of [-1, 1]) tube(tris, [[cx + s * (L + 0.3), top + 0.6, cz], [cx + s * (L + 0.4), top + 0.6, cz]], 0.46, 10, true);

  // ── the hips: a rolled crown along each hip ridge, ending in a flared cap at the eave ──
  for (const s of [-1, 1]) for (const sz of [-1, 1]) {
    const ex = cx + s * (L + 0.1), pts = [];
    for (let k = 1; k <= 24; k++) { const t = k / 24 * 0.985, x = ex + s * B * t, z = cz + sz * B * t; pts.push([x, h(x, z) + 0.37, z]); }
    tube(tris, pts, 0.27, 8, false);
    const e = pts[pts.length - 1], d = norm(sub(e, pts[pts.length - 3]));
    disc(tris, [e[0] + d[0] * 0.1, e[1], e[2] + d[2] * 0.1], d, 0.31, 0.12, 8);
    // a band every 1.5 m
    for (let k = 3; k < pts.length - 2; k += 3) { const a = pts[k - 1], b = pts[k + 1]; tube(tris, [a, b], 0.3, 8, true); }
  }

  // ── the chiwei of the ridge ends ──
  const H = el.chiwen ?? 2.3, base = top + 0.7;
  for (const s of [-1, 1]) {
    const ex = cx + s * (L - 0.05), N = 18, rings = [];
    const sup = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);
    for (let k = 0; k <= N; k++) {
      const t = k / N, y = base + H * t, xo = 0.55 - 1.05 * Math.pow(t, 2.1), xi = -0.4 - 0.32 * Math.pow(t, 3);
      // scales: every second ring bulges on the outer face
      const bulge = k % 2 === 1 && k < N - 1 ? 0.07 * (1 - t * 0.6) : 0;
      const sc = (xo + xi) / 2, d = (xo - xi) / 2 + bulge, w = Math.max(0.08, 0.3 - 0.2 * t + 0.07 * Math.sin(Math.PI * Math.min(1, t * 1.4)));
      const c = [ex + s * sc, y, cz];
      rings.push({ c, pts: Array.from({ length: 10 }, (_, j) => { const a = j / 10 * Math.PI * 2; return [c[0] + s * d * sup(Math.cos(a), 0.7) + (Math.cos(a) > 0 ? s * bulge * 0.5 : 0), y, cz + w * sup(Math.sin(a), 0.8)]; }) });
    }
    for (let k = 0; k < N; k++) for (let j = 0; j < 10; j++) {
      const P = rings[k], Q = rings[k + 1], j1 = (j + 1) % 10;
      quadO(tris, P.pts[j], P.pts[j1], Q.pts[j1], Q.pts[j], [P.c[0], (P.c[1] + Q.c[1]) / 2, P.c[2]]);
    }
    for (let j = 0; j < 10; j++) triO(tris, rings[N].c, rings[N].pts[j], rings[N].pts[(j + 1) % 10], rings[N - 1].c);
    // the serrated back along the outer edge, and a collar where it meets the crown
    for (const t of [0.12, 0.24, 0.36, 0.48, 0.6, 0.72]) {
      const y = base + H * t, xo = 0.55 - 1.05 * Math.pow(t, 2.1), tooth = 0.13 - 0.07 * t;
      obox(tris, [ex + s * (xo + tooth * 0.4), cz], [1, 0], [0, 1], tooth * 0.6, 0.045, y - 0.04, y + 0.17);
    }
    obox(tris, [ex + s * 0.05, cz], [1, 0], [0, 1], 0.58, 0.37, base - 0.02, base + 0.1);
  }
  bag.add(el.mat || 'tile_grey', fromTriangles(tris));
}

registerStyle('foguang-hall', {
  ...STYLES.chinese,
  elements: {
    ...STYLES.chinese.elements,
    // the chinese hip roof with its plain ridge and chiwei left out, then the roof work over it
    fg_roof: (el, ctx) => { STYLES.chinese.elements.hip_roof({ ...el, noChiwei: true, tangChiwei: 0 }, ctx); alongZ(fgRoofX, el, ctx); },
  },
});
