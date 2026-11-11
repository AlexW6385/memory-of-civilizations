// The street life of Barcelona about 1910 (docs/settlements/barcelona.md §5a): the electric trams of
// the Barcelona Tramways Company on their double track — closed saloon cars of 1899 and the open
// "jardineres" of 1906 (both 8.90 × 2.00 m, 3.59 m high), each with its trolley pole on the wire —
// the rails set in granite setts, the iron poles at the kerbs carrying the span wires and the
// trolley wires, the track sweeping round the cut corners of Cerdà's blocks; the hackney carriages
// with their horse and driver.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { animal } from '../../objects/animals.js';
import { figure } from '../../objects/figures.js';

const IRON = 'iron', RED = 'car_red', CREAM = 'car_cream';
const quad = (T, A, B, C, D) => T.push(...A, ...B, ...C, ...A, ...C, ...D);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Offsets of a polyline [[x, z, y]] to the side (+ to the right of travel), mitred; each with its y. */
function offset(pts, d) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const d0 = i > 0 ? norm([p[0] - a[0], p[1] - a[1]]) : norm([b[0] - p[0], b[1] - p[1]]), d1 = i < n - 1 ? norm([b[0] - p[0], b[1] - p[1]]) : d0;
    const o0 = [-d0[1], d0[0]], o1 = [-d1[1], d1[0]], m = norm([o0[0] + o1[0], o0[1] + o1[1]]), k = 1 / Math.max(0.3, m[0] * o1[0] + m[1] * o1[1]);
    out.push([p[0] + m[0] * d * k, p[1] + m[1] * d * k, p[2]]);
  }
  return out;
}
function norm(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
/** A ribbon (a flat strip with its two sides) w wide between heights y + lo and y + hi along a polyline. */
function ribbon(pts, w, lo, hi) {
  const L = offset(pts, -w / 2), R = offset(pts, w / 2), T = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = L[i], b = L[i + 1], c = R[i + 1], d = R[i];
    quad(T, [a[0], a[2] + hi, a[1]], [d[0], d[2] + hi, d[1]], [c[0], c[2] + hi, c[1]], [b[0], b[2] + hi, b[1]]);
    quad(T, [a[0], a[2] + lo, a[1]], [a[0], a[2] + hi, a[1]], [b[0], b[2] + hi, b[1]], [b[0], b[2] + lo, b[1]]);
    quad(T, [d[0], d[2] + lo, d[1]], [c[0], c[2] + lo, c[1]], [c[0], c[2] + hi, c[1]], [d[0], d[2] + hi, d[1]]);
  }
  // turn every face up or outward
  for (let i = 0; i < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const ny = uz * vx - ux * vz, nx = uy * vz - uz * vy, nzz = ux * vy - uy * vx;
    if (ny < 0 && Math.abs(ny) > Math.hypot(nx, nzz)) swap(T, i);
  }
  return fixSides(T, L, R);
}
function swap(T, i) { for (let k = 0; k < 3; k++) { const t = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = t; } }
/** Sides: away from the strip's centre line (the mean of the two offsets nearest). */
function fixSides(T, L, R) {
  const C = L.map((p, i) => [(p[0] + R[i][0]) / 2, (p[1] + R[i][1]) / 2]);
  for (let i = 0; i < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (Math.abs(ny) > 0.5 * Math.hypot(nx, nz)) continue;
    const gx = (T[i] + T[i + 3] + T[i + 6]) / 3, gz = (T[i + 2] + T[i + 5] + T[i + 8]) / 3;
    let best = 0, bd = Infinity; for (let k = 0; k < C.length; k++) { const dd = (C[k][0] - gx) ** 2 + (C[k][1] - gz) ** 2; if (dd < bd) { bd = dd; best = k; } }
    if (nx * (gx - C[best][0]) + nz * (gz - C[best][1]) < 0) swap(T, i);
  }
  return fromTriangles(T);
}

/**
 * tram_line: { pts: [[x, z, y]] (the line between the two tracks), sep (between the tracks' centres),
 * gauge, span (the poles' distance from the line), every (m between poles), wire (its height) }.
 */
function tramLine(el, { bag, col }) {
  const pts = el.pts, sep = el.sep ?? 3.1, g = el.gauge ?? 1.435, span = el.span ?? 9.6, every = el.every ?? 32, wire = el.wire ?? 5.9;
  // el.wires: false — no wires (they are built apart, in a plan that collides with nothing: a thin wire would stand in the height field as a wall); 'only' — only the wires
  const rest = el.wires !== 'only', wires = el.wires !== false;
  for (const t of rest ? [-sep / 2, sep / 2] : []) {
    const tr = offset(pts, t);
    bag.add('granite_block', ribbon(tr, g + 1.1, -0.12, 0.012));
    for (const r of [-g / 2, g / 2]) { const rl = offset(tr, r); bag.add(IRON, ribbon(rl, 0.07, -0.02, 0.032)); bag.add(IRON, ribbon(offset(tr, r - Math.sign(r) * 0.06), 0.03, -0.02, 0.022)); }
  }
  // the poles, at both kerbs, every so many metres along the line, and the wires
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const Ltot = cum[cum.length - 1], n = Math.max(1, Math.round(Ltot / every)), stations = [];
  for (let k = 0; k <= n; k++) {
    const s = Ltot * k / n; let i = 0; while (i < pts.length - 2 && cum[i + 1] < s) i++;
    const f = (s - cum[i]) / ((cum[i + 1] - cum[i]) || 1), p = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, pts[i][2] + (pts[i + 1][2] - pts[i][2]) * f];
    const d = norm([pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]]), o = [-d[1], d[0]];
    stations.push({ p, o });
  }
  const at = (st, t, h) => [st.p[0] + st.o[0] * t, st.p[2] + h, st.p[1] + st.o[1] * t];
  const blocked = (x, z) => (el.avoid ?? []).some((r) => x > r[0] - 0.6 && x < r[2] + 0.6 && z > r[1] - 0.6 && z < r[3] + 0.6);
  stations.forEach((st, k) => {
    if (k === 0 && el.skipFirst) return;
    const sides = [-1, 1].filter((sg) => { const b = at(st, sg * span, 0); return !blocked(b[0], b[2]); });
    if (rest) for (const sg of sides) {
      const b = at(st, sg * span, 0);
      bag.add(IRON, lathe([[0.2, -0.3], [0.2, 0.5], [0.16, 0.7], [0.13, 1.2], [0.11, 2.2], [0.1, 6.9], [0.13, 7.0], [0.13, 7.12], [0.06, 7.3], [0.09, 7.45], [0.001, 7.7]], 10, null, b[0], b[1], b[2]));
      bag.add(IRON, lathe([[0.17, 0], [0.17, 0.12], [0.12, 0.2]], 10, null, b[0], b[1] + 2.2, b[2]));
      col.circle(b[0], b[2], 0.25, b[1], b[1] + 7.5);
    }
    if (!sides.length || !wires) return;
    if (sides.length === 2) bag.add(IRON, rod(at(st, -span, wire + 0.55), at(st, span, wire + 0.55), 0.012, 4));
    else {
      // a bracket arm from the one pole out over both tracks, with its tie rod
      const sg = sides[0], far = -sg * (sep / 2 + 0.8);
      bag.add(IRON, rod(at(st, sg * (span + 0.1), wire + 0.55), at(st, far, wire + 0.55), 0.04, 6));
      bag.add(IRON, rod(at(st, sg * (span + 0.05), wire + 1.6), at(st, (far + sg * span) / 2, wire + 0.58), 0.018, 4));
    }
    for (const t of [-sep / 2, sep / 2]) bag.add(IRON, rod(at(st, t, wire), at(st, t, wire + 0.55), 0.015, 4));
  });
  if (wires) for (const t of [-sep / 2, sep / 2]) for (let k = 0; k + 1 < stations.length; k++) bag.add(IRON, rod(at(stations[k], t, wire), at(stations[k + 1], t, wire), 0.011, 4));
}

/** Set pieces built along a local frame (x across, z along, −z forward) at at/rot/y. */
function placer(el) {
  const M = new Matrix4().makeRotationY(el.rot ?? 0).setPosition(el.at[0], el.y ?? 0, el.at[1]);
  return M;
}
/** A spoked wheel in the plane x = 0: rim, hub, spokes (r its radius). */
function wheel(r, th = 0.07, spokes = 12) {
  const parts = [];
  parts.push(lathe([[r, -th / 2], [r, th / 2], [r - 0.05, th / 2], [r - 0.05, -th / 2], [r, -th / 2]], 20).rotateZ(Math.PI / 2));
  parts.push(lathe([[0.001, -0.12], [0.09, -0.1], [0.1, 0], [0.09, 0.1], [0.001, 0.12]], 10).rotateZ(Math.PI / 2));
  for (let k = 0; k < spokes; k++) { const a = k / spokes * Math.PI * 2; parts.push(rod([0, 0, 0], [0, Math.cos(a) * (r - 0.04), Math.sin(a) * (r - 0.04)], 0.016, 4)); }
  return parts;
}

/**
 * tram: { at, y, rot, kind ('closed' | 'open'), wire, seed } — a tram of the Barcelona Tramways Company,
 * 8.90 m over the platforms, 2.00 m wide, 3.59 m to the roof; facing −z.
 */
function tram(el, { bag, col }) {
  const M = placer(el), A = (m, g) => bag.add(m, g.applyMatrix4(M)), rand = rng(el.seed ?? 1), open = el.kind === 'open', wire = el.wire ?? 5.9;
  const L = 4.45, Ls = open ? 3.6 : 2.6, W = 1.0, yf = 0.95, yw = 1.75, yt = 2.75, yr = 3.15;
  // the truck: wheels on the rails, axle boxes, the frame and the motors' cases
  for (const z of [-1.05, 1.05]) for (const s of [-1, 1]) {
    A(IRON, lathe([[0.4, -0.05], [0.4, 0.05], [0.43, 0.06], [0.43, 0.075], [0.12, 0.075], [0.12, -0.05], [0.4, -0.05]], 16).rotateZ(Math.PI / 2).translate(s * 0.72, 0.4, z));
    A(IRON, box(s * 0.84 - 0.06, 0.3, z - 0.15, s * 0.84 + 0.12, 0.55, z + 0.15));
  }
  for (const z of [-1.05, 1.05]) A(IRON, rod([-0.8, 0.4, z], [0.8, 0.4, z], 0.06, 6));
  for (const s of [-1, 1]) A(IRON, box(s * 0.92 - 0.05, 0.45, -1.6, s * 0.92 + 0.05, 0.7, 1.6));
  for (const z of [-0.6, 0.6]) A(IRON, box(-0.35, 0.22, z - 0.25, 0.35, 0.58, z + 0.25));
  // the underframe, the floor, the life guards at both ends
  A('wood_dark', box(-W, 0.72, -L + 0.2, W, yf, L - 0.2));
  for (const e of [-1, 1]) A(IRON, box(-0.8, 0.18, e * (L - 0.25) - 0.05, 0.8, 0.5, e * (L - 0.25) + 0.05));
  // the platforms' dashes, rounded, with the lamp and the number board; the canopy posts; the controller and brake
  for (const e of [-1, 1]) {
    const T = [], N = 8, R0 = 0.95, cz = e * (L - R0 - 0.05);
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI * i / N, a1 = Math.PI * (i + 1) / N, P = (a, yy, r) => [Math.cos(a) * r, yy, cz + e * Math.sin(a) * r];
      quad(T, P(a0, yf, R0), P(a1, yf, R0), P(a1, yf + 1.05, R0), P(a0, yf + 1.05, R0));
      quad(T, P(a1, yf, R0 - 0.04), P(a0, yf, R0 - 0.04), P(a0, yf + 1.05, R0 - 0.04), P(a1, yf + 1.05, R0 - 0.04));
      quad(T, P(a0, yf + 1.05, R0 - 0.04), P(a0, yf + 1.05, R0), P(a1, yf + 1.05, R0), P(a1, yf + 1.05, R0 - 0.04));
    }
    A(RED, fromTriangles(T));
    A('wood_dark', lathe([[R0 + 0.02, 0], [R0 + 0.02, 0.06], [0.001, 0.06]], 16, (th) => (Math.sin(th) * e < -0.01 ? 0.001 : 1)).translate(0, yf + 1.05, cz));
    A('lamp_glass', lathe([[0.001, 0], [0.11, 0.02], [0.12, 0.1], [0.001, 0.14]], 10).rotateX(e * Math.PI / 2).translate(0, yf + 0.65, cz + e * R0));
    A(CREAM, box(-0.35, yf + 1.15, cz + e * (R0 - 0.08) - 0.02, 0.35, yf + 1.45, cz + e * (R0 - 0.08) + 0.02));
    for (const s of [-1, 1]) A('wood_dark', box(s * (W - 0.06) - 0.03, yf, cz + e * 0.55 - 0.03, s * (W - 0.06) + 0.03, yr, cz + e * 0.55 + 0.03));
    A(IRON, box(-0.55, yf, cz + e * 0.55 - 0.12, -0.3, yf + 1.05, cz + e * 0.55 + 0.12));
    A('gilt_bronze', rod([0.35, yf, cz + e * 0.5], [0.35, yf + 1.1, cz + e * 0.5], 0.03, 6));
    // the step boards at the platform's sides
    for (const s of [-1, 1]) A('wood_dark', box(s * W - (s > 0 ? 0 : 0.3), 0.48, cz - 0.5, s * W + (s > 0 ? 0.3 : 0), 0.54, cz + 0.5));
  }
  if (!open) {
    // the saloon: panels, waist rail, windows between the pillars, the letter board
    A(RED, box(-W, yf, -Ls, W, yw, Ls));
    A(CREAM, box(-W - 0.02, yw - 0.06, -Ls, W + 0.02, yw + 0.02, Ls));
    const nw = 6, pw = 2 * Ls / nw;
    for (let i = 0; i < nw; i++) {
      const z0 = -Ls + i * pw + 0.07, z1 = -Ls + (i + 1) * pw - 0.07;
      for (const s of [-1, 1]) A('glass_outer', box(s * (W - 0.05) - 0.01, yw + 0.02, z0, s * (W - 0.05) + 0.01, yt - 0.1, z1));
    }
    for (let i = 0; i <= nw; i++) { const z = -Ls + i * pw; for (const s of [-1, 1]) A(RED, box(s * W - 0.04, yw, z - 0.07, s * W + 0.03, yt, z + 0.07)); }
    for (const e of [-1, 1]) { A(RED, box(-W, yw, e * Ls - 0.06, -0.38, yt, e * Ls + 0.06)); A(RED, box(0.38, yw, e * Ls - 0.06, W, yt, e * Ls + 0.06)); A('glass_outer', box(-0.38, yw + 0.4, e * Ls - 0.02, 0.38, yt - 0.1, e * Ls + 0.02)); A('wood_dark', box(-0.38, yf, e * Ls - 0.03, 0.38, yw + 0.4, e * Ls + 0.03)); }
    A(CREAM, box(-W - 0.02, yt, -Ls, W + 0.02, yt + 0.22, Ls));
    for (const s of [-1, 1]) A(RED, box(s * W - 0.03, yt - 0.06, -Ls + 0.3, s * W + 0.04, yt + 0.0, Ls - 0.3));
    // the clerestory over the saloon with its little lights
    A(CREAM, box(-0.42, yr - 0.05, -Ls + 0.2, 0.42, yr + 0.28, Ls - 0.2));
    for (let i = 0; i < 8; i++) { const z = -Ls + 0.5 + i * (2 * Ls - 1) / 7; for (const s of [-1, 1]) A('glass_outer', box(s * 0.42 - 0.01, yr + 0.05, z - 0.18, s * 0.42 + 0.01, yr + 0.2, z + 0.18)); }
  } else {
    // the open car: cross benches with reversible backs under the roof on its posts, the running boards
    const nb = 8, pb = 2 * Ls / nb;
    for (let i = 0; i < nb; i++) {
      const z = -Ls + (i + 0.5) * pb;
      A('wood_dark', box(-W + 0.05, yf + 0.42, z - 0.22, W - 0.05, yf + 0.47, z + 0.2));
      A('wood_dark', box(-W + 0.05, yf + 0.5, z + 0.17, W - 0.05, yf + 0.95, z + 0.21));
      for (const s of [-1, 1]) A('wood_dark', box(s * (W - 0.12) - 0.03, yf, z - 0.15, s * (W - 0.12) + 0.03, yf + 0.42, z + 0.15));
    }
    for (let i = 0; i <= nb; i++) { const z = -Ls + i * pb; for (const s of [-1, 1]) A(RED, box(s * (W - 0.03) - 0.035, yf, z - 0.035, s * (W - 0.03) + 0.035, yr, z + 0.035)); }
    for (const s of [-1, 1]) { A('wood_dark', box(s * W - (s > 0 ? 0 : 0.32), 0.5, -Ls, s * W + (s > 0 ? 0.32 : 0), 0.56, Ls)); A(RED, box(s * W - 0.04, yf, -Ls, s * W + 0.04, yf + 0.25, Ls)); }
    // the striped curtains rolled up under the eaves
    for (const s of [-1, 1]) A('cloth_white', rod([s * (W - 0.02), yr - 0.15, -Ls], [s * (W - 0.02), yr - 0.15, Ls], 0.07, 6));
  }
  // the roof over saloon and platforms, a low arch, the canvas on boards; its eaves
  const RT = [], NX = 8;
  for (let i = 0; i < NX; i++) {
    const x0 = -W - 0.06 + (2 * W + 0.12) * i / NX, x1 = -W - 0.06 + (2 * W + 0.12) * (i + 1) / NX, h = (x) => yr - 0.22 * (x / (W + 0.06)) ** 2;
    quad(RT, [x0, h(x0), -L + 0.05], [x0, h(x0), L - 0.05], [x1, h(x1), L - 0.05], [x1, h(x1), -L + 0.05]);
    quad(RT, [x0, h(x0) - 0.06, -L + 0.05], [x1, h(x1) - 0.06, -L + 0.05], [x1, h(x1) - 0.06, L - 0.05], [x0, h(x0) - 0.06, L - 0.05]);
  }
  for (const s of [-1, 1]) quad(RT, [s * (W + 0.06), yr - 0.28, -L + 0.05], [s * (W + 0.06), yr - 0.28, L - 0.05], [s * (W + 0.06), yr - 0.22, L - 0.05], [s * (W + 0.06), yr - 0.22, -L + 0.05]);
  A('cloth_grey', fromTriangles(orientBox(RT, [0, yr - 0.5, 0])));
  if (open) A(RED, box(-W - 0.06, yr - 0.28, -L + 0.05, W + 0.06, yr - 0.22, -L + 0.12));
  // the trolley pole: its base and spring on the roof, the pole leaning back to the wire, the wheel on it
  const base = [0, yr + (open ? 0.02 : 0.3), 0.9], top = [0, wire, 0.9 + Math.sqrt(Math.max(0.5, 4.3 ** 2 - (wire - base[1]) ** 2))];
  A(IRON, lathe([[0.18, 0], [0.18, 0.08], [0.08, 0.16], [0.06, 0.25]], 10).translate(...base));
  A(IRON, rod([base[0], base[1] + 0.2, base[2]], top, 0.03, 6));
  A(IRON, lathe([[0.06, -0.025], [0.06, 0.025], [0.001, 0.025]], 10).rotateZ(Math.PI / 2).translate(top[0], top[1] - 0.05, top[2]));
  col.rect(rectOf(M, -W - 0.35, -L, W + 0.35, L), el.y, el.y + yr);
  // the motorman on the front platform, the conductor at the back, passengers
  const put = (o, x, z, yy) => { const p = applyM(M, [x, yy, z]); figure({ t: 'figure', at: [p[0], p[2]], y: p[1], rot: el.rot ?? 0, seed: Math.floor(rand() * 1e9), ...o }, { bag, col: { circle() {}, rect() {}, segment() {}, floor() {} } }); };
  const crew = { dress: 'trousers', cloth: 'cloth_indigo', cloth2: 'cloth_indigo', skin: 'skin_light', hat: 'cap', hatMat: 'cloth_indigo', beard: rand() < 0.5 };
  put(crew, 0.1, -L + 0.75, yf);
  put({ ...crew, pose: 'talk' }, -0.3, L - 0.7, yf);
  const DRESS = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_white'];
  const pass = () => { const woman = rand() < 0.45; return { dress: woman ? 'robe' : 'trousers', cloth: DRESS[Math.floor(rand() * 5)], cloth2: DRESS[Math.floor(rand() * 5)], skin: 'skin_light', hat: woman ? (rand() < 0.5 ? 'cap' : 'none') : 'brim', hatMat: DRESS[Math.floor(rand() * 3)] }; };
  if (open) { const nb = 8, pb = 2 * Ls / nb; for (let i = 0; i < nb; i++) for (const x of [-0.55, 0.05, 0.6]) if (rand() < 0.4) put({ ...pass(), pose: 'sit' }, x, -Ls + (i + 0.5) * pb - 0.05, yf - 0.05); }
  else for (let i = 0; i < 2; i++) if (rand() < 0.7) put(pass(), 0.45 - i * 0.7, L - 1.2 + i * 0.2, yf);
}
function applyM(M, p) { const e = M.elements; return [e[0] * p[0] + e[4] * p[1] + e[8] * p[2] + e[12], e[1] * p[0] + e[5] * p[1] + e[9] * p[2] + e[13], e[2] * p[0] + e[6] * p[1] + e[10] * p[2] + e[14]]; }
function rectOf(M, x0, z0, x1, z1) { const ps = [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]].map((p) => applyM(M, p)); return [Math.min(...ps.map((p) => p[0])), Math.min(...ps.map((p) => p[2])), Math.max(...ps.map((p) => p[0])), Math.max(...ps.map((p) => p[2]))]; }
/** Turn triangles of a closed-ish shell away from a centre. */
function orientBox(T, c) {
  for (let i = 0; i < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const gx = (T[i] + T[i + 3] + T[i + 6]) / 3 - c[0], gy = (T[i + 1] + T[i + 4] + T[i + 7]) / 3 - c[1], gz = (T[i + 2] + T[i + 5] + T[i + 8]) / 3 - c[2];
    if (nx * gx + ny * gy + nz * gz < 0) swap(T, i);
  }
  return T;
}

/**
 * carriage: { at, y, rot, hood ('up' | 'down'), seed } — a hackney carriage (a victoria): the low
 * body hung on its springs between a small fore carriage and the large back wheels, the folding
 * hood, the driver's box high in front, one horse in the shafts; facing −z.
 */
function carriage(el, { bag, col }) {
  const M = placer(el), A = (m, g) => bag.add(m, g.applyMatrix4(M)), rand = rng(el.seed ?? 7), hood = (el.hood ?? (rand() < 0.5 ? 'up' : 'down')) === 'up';
  const B = 'lacquer_black', rf = 0.48, rb = 0.68;
  for (const [z, r] of [[-1.15, rf], [0.85, rb]]) {
    for (const s of [-1, 1]) for (const g of wheel(r, 0.06, r > 0.6 ? 14 : 12)) A(B, g.translate(s * 0.78, r, z));
    A(B, rod([-0.82, r, z], [0.82, r, z], 0.035, 6));
  }
  // the springs and the perch
  for (const s of [-1, 1]) { A(IRON, lathe([[0.04, -0.3], [0.04, 0.3]], 6).rotateX(Math.PI / 2).translate(s * 0.55, rb + 0.1, 0.85)); A(B, box(s * 0.5 - 0.03, 0.62, -1.15, s * 0.5 + 0.03, 0.7, 0.85)); }
  // the body: a low tub, the seat with its cushion, the curved sides
  A(B, box(-0.62, 0.72, -0.35, 0.62, 0.82, 1.1));
  const T = [], N = 10;
  for (const s of [-1, 1]) for (let i = 0; i < N; i++) {
    const z0 = -0.35 + 1.45 * i / N, z1 = -0.35 + 1.45 * (i + 1) / N, h = (z) => 0.82 + 0.55 * Math.sin(Math.PI * Math.min(1, (z + 0.35) / 1.45) * 0.5) ** 1.5;
    quad(T, [s * 0.62, 0.72, z0], [s * 0.62, 0.72, z1], [s * 0.62, h(z1), z1], [s * 0.62, h(z0), z0]);
  }
  quad(T, [-0.62, 0.72, 1.1], [0.62, 0.72, 1.1], [0.62, 1.37, 1.1], [-0.62, 1.37, 1.1]);
  A(B, fromArr(both(T)));
  A('cloth_red', box(-0.58, 0.82, 0.45, 0.58, 1.02, 1.05)); A('cloth_red', box(-0.58, 1.02, 0.92, 0.58, 1.45, 1.06));
  // the hood, raised in bows of leather or folded behind
  if (hood) {
    const H = [], NA = 10;
    for (let i = 0; i < NA; i++) {
      const a0 = Math.PI * i / NA, a1 = Math.PI * (i + 1) / NA, P = (a, z) => [Math.cos(a) * 0.64, 1.37 + Math.sin(a) * 0.62, z];
      quad(H, P(a0, 0.35), P(a1, 0.35), P(a1, 1.12), P(a0, 1.12));
    }
    for (let i = 0; i < NA; i++) { const a0 = Math.PI * i / NA, a1 = Math.PI * (i + 1) / NA; H.push(0, 1.37, 1.12, Math.cos(a0) * 0.64, 1.37 + Math.sin(a0) * 0.62, 1.12, Math.cos(a1) * 0.64, 1.37 + Math.sin(a1) * 0.62, 1.12); }
    A('hide_black', fromArr(both(H)));
  } else A('hide_black', rod([-0.62, 1.42, 1.15], [0.62, 1.42, 1.15], 0.14, 8));
  // the driver's box on its irons over the fore carriage, the footboard, the dashboard
  for (const s of [-1, 1]) A(IRON, rod([s * 0.4, 0.82, -0.35], [s * 0.35, 1.45, -0.75], 0.025, 4));
  A(B, box(-0.45, 1.45, -1.0, 0.45, 1.6, -0.55)); A('cloth_brown', box(-0.42, 1.6, -0.95, 0.42, 1.68, -0.6));
  A(B, box(-0.5, 1.15, -1.5, 0.5, 1.2, -1.05)); A(B, box(-0.5, 1.2, -1.52, 0.5, 1.6, -1.48)); for (const s of [-1, 1]) A(IRON, rod([s * 0.45, 0.82, -0.6], [s * 0.45, 1.15, -1.3], 0.025, 4));
  for (const s of [-1, 1]) A('lamp_glass', box(s * 0.55 - 0.06, 1.4, -0.98, s * 0.55 + 0.06, 1.62, -0.86));
  // the shafts running forward to the horse's sides
  for (const s of [-1, 1]) A(B, rod([s * 0.42, 0.62, -1.15], [s * 0.38, 1.0, -3.9], 0.035, 5));
  col.rect(rectOf(M, -0.9, -1.6, 0.9, 1.5), el.y, el.y + 2.2);
  const ro = el.rot ?? 0, hp = applyM(M, [0, 0, -3.0]);
  animal({ t: 'animal', kind: 'horse', gear: false, graze: false, seed: (el.seed ?? 7) + 1, y: el.y, rot: ro, at: [hp[0], hp[2]] }, { bag, col });
  const dp = applyM(M, [0, 0, -0.75]);
  figure({ t: 'figure', at: [dp[0], dp[2]], y: (el.y ?? 0) + 1.13, rot: ro, pose: 'sit', seed: (el.seed ?? 7) + 2, dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_black', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_black' }, { bag, col: { circle() {}, rect() {}, segment() {}, floor() {} } });
}
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
const fromArr = (T) => fromTriangles(T);

export const STREET = { tram_line: tramLine, tram, carriage };
