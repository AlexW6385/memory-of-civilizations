// The painted clay figures of the Great East Hall of Foguang (docs/settlements/tang-wutai.md §10, "The statues"):
// the standing attendant bodhisattva, the monk disciple, the armoured heavenly king, the kneeling offering
// bodhisattva and the groom, each built once from a few shared parts — a head with painted features, hands with
// fingers, a lotus pedestal, a skirt in folds, scarves, a halo — and varied by seed (the hands' pose, the scarf's
// colour, the head's turn). Built at 2.4 m including the pedestal and scaled to `h`. Smooth skins over rings of
// points (`skin`), so the folds and the faces read at 3–10 m, with few triangles.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, place, fromTriangles } from '../../core/geom.js';

// ── geometry helpers ─────────────────────────────────────────────────────────
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

/** A smooth skin over rings of points (each ring the same length; `closed` joins the last point to the first), capped at both ends. */
export function skin(rings, closed = true, cap = true) {
  const R = rings.length, n = rings[0].length, pos = [], nor = [];
  const cen = rings.map((r) => r.reduce((c, p) => add3(c, p, 1 / r.length), [0, 0, 0]));
  const N = rings.map((r, i) => r.map((p, s) => {
    const i0 = Math.max(0, i - 1), i1 = Math.min(R - 1, i + 1), s0 = closed ? (s + n - 1) % n : Math.max(0, s - 1), s1 = closed ? (s + 1) % n : Math.min(n - 1, s + 1);
    let v = cross(sub(rings[i1][s], rings[i0][s]), sub(r[s1], r[s0]));
    v = norm(v);
    return dot(v, sub(p, cen[i])) < 0 ? [-v[0], -v[1], -v[2]] : v;
  }));
  const push = (p, nn) => { pos.push(...p); nor.push(...nn); };
  const tri = (a, b, c, na, nb, nc) => {
    const f = cross(sub(b, a), sub(c, a));
    if (dot(f, add3(add3(na, nb), nc)) < 0) { push(a, na); push(c, nc); push(b, nb); } else { push(a, na); push(b, nb); push(c, nc); }
  };
  for (let i = 0; i < R - 1; i++) for (let s = 0; s < (closed ? n : n - 1); s++) {
    const t = (s + 1) % n;
    tri(rings[i][s], rings[i][t], rings[i + 1][t], N[i][s], N[i][t], N[i + 1][t]);
    tri(rings[i][s], rings[i + 1][t], rings[i + 1][s], N[i][s], N[i + 1][t], N[i + 1][s]);
  }
  if (cap && closed) for (const [i, d] of [[0, -1], [R - 1, 1]]) {
    const a = i === 0 ? 1 : R - 2, ax = norm(sub(cen[Math.min(R - 1, a)], cen[i === 0 ? 0 : R - 1])), nn = i === 0 ? [-ax[0] * -1, -ax[1] * -1, -ax[2] * -1] : [ax[0] * -1, ax[1] * -1, ax[2] * -1];
    void d;
    for (let s = 0; s < n; s++) { const t = (s + 1) % n; const e = [nn[0], nn[1], nn[2]]; tri(cen[i], rings[i][s], rings[i][t], e, e, e); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/** A tube along path points [x, y, z, r] (r optionally [rx, rz] across and along the bend's normal); `flat` squashes it into a strap. */
export function tube(path, seg = 8, flat = 1) {
  const rings = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
    const T = norm(sub(b, a)), ref = Math.abs(T[1]) > 0.92 ? [1, 0, 0] : [0, 1, 0];
    const Nn = norm(cross(ref, T)), B = norm(cross(T, Nn)), r = p[3];
    const ring = [];
    for (let s = 0; s < seg; s++) { const th = (s / seg) * Math.PI * 2; ring.push(add3(add3([p[0], p[1], p[2]], Nn, Math.cos(th) * r), B, Math.sin(th) * r * flat)); }
    return ring;
  });
  return skin(rings);
}
/** A smooth blob: an ellipsoid of radii (rx, ry, rz) at c, rotated about x by `tilt` (so a ball, a cheek, a knee). */
export function blob(c, rx, ry, rz, seg = 10, rows = 6) {
  const rings = [];
  for (let i = 0; i <= rows; i++) {
    const a = -Math.PI / 2 + (i / rows) * Math.PI, r = Math.max(0.02, Math.cos(a)), ring = [];
    for (let s = 0; s < seg; s++) { const th = (s / seg) * Math.PI * 2; ring.push([c[0] + Math.cos(th) * r * rx, c[1] + Math.sin(a) * ry, c[2] + Math.sin(th) * r * rz]); }
    rings.push(ring);
  }
  return skin(rings, true, false);
}
/** A hanging band (a scarf, a sash end) through points, width w, a slight ripple; flat, double-sided. */
export function strap(path, w, ripple = 0.012, thick = 0.008) {
  const rings = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)];
    const T = norm(sub(b, a)), ref = Math.abs(T[1]) > 0.92 ? [1, 0, 0] : [0, 1, 0];
    const Nn = norm(cross(ref, T)), B = norm(cross(T, Nn)), ww = (p[3] ?? w) / 2, rp = Math.sin(i * 1.7) * ripple;
    return [add3(add3([p[0], p[1], p[2]], Nn, -ww), B, rp - thick), add3(add3([p[0], p[1], p[2]], Nn, ww), B, rp - thick), add3(add3([p[0], p[1], p[2]], Nn, ww), B, rp + thick), add3(add3([p[0], p[1], p[2]], Nn, -ww), B, rp + thick)];
  });
  return skin(rings);
}
/** A lotus pedestal of radius r and height h: a drum on a plinth ring, two rows of pointed petals, gilt in the groove. */
function lotus(parts, r, h) {
  const { F, G, P } = parts;
  F.push(lathe([[0.001, 0], [r * 1.12, 0], [r * 1.12, h * 0.1], [r * 1.0, h * 0.14], [r * 0.82, h * 0.2], [r * 0.82, h * 0.45], [r * 0.94, h * 0.5], [0.001, h * 0.5]], 22));
  for (let i = 0; i < 14; i++) P.push(petalG((i / 14) * Math.PI * 2, r * 0.8, h * 0.18, r * 0.5, r * 0.3, 1.1, 5));
  for (let i = 0; i < 12; i++) P.push(petalG(((i + 0.5) / 12) * Math.PI * 2, r * 0.76, h * 0.42, r * 0.44, r * 0.26, 1.35, 5));
  G.push(lathe([[r * 0.7, h * 0.46], [r * 0.78, h * 0.5], [r * 0.78, h * 0.62], [r * 0.5, h * 0.7], [0.001, h * 0.7]], 18));
  // a stalk of beaded rim
  G.push(lathe([[r * 1.12, h * 0.1], [r * 1.14, h * 0.12], [r * 1.12, h * 0.14]], 22));
}
function petalG(th, r0, y0, len, w, lift, N = 5) {
  const rings = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, half = w * Math.sqrt(Math.sin(Math.PI * Math.min(1, 0.1 + t * 0.9))), out = r0 + len * Math.cos(lift * t), up = y0 + len * Math.sin(lift * t) * 0.95, bulge = 0.025 * Math.sin(Math.PI * t) + 0.012;
    const P = (a, d, yy) => [Math.cos(th) * (out + d) - Math.sin(th) * a, yy, Math.sin(th) * (out + d) + Math.cos(th) * a];
    rings.push([P(-half, 0, up), P(0, bulge, up + 0.004), P(half, 0, up), P(0, -0.012, up - 0.004)]);
  }
  return skin(rings, true, false);
}

// ── the head ─────────────────────────────────────────────────────────────────
/**
 * The head at c (the centre of the skull), radius scale k: the face's skin, the painted features (black eyes and
 * brows, red lips), ears with long lobes; returns { F (flesh), K (black paint), R (red paint), H (hair) } into parts.
 * style: 'gentle' (the bodhisattva's full cheeks, half-closed eyes), 'old' (the monk Kāśyapa's brow and cheekbones),
 * 'young' (Ānanda), 'fierce' (the king: wide eyes, brows down, the mouth open), 'barbarian' (the groom: a big nose, a beard).
 */
function head(parts, c, k, style, turn = 0) {
  const { F, K, R, H } = parts;
  const fierce = style === 'fierce', old = style === 'old', bar = style === 'barbarian';
  // the skull and face: rings from the chin up to the crown, wider at the cheeks, narrower at the jaw
  const prof = [[0.001, -0.135], [0.03, -0.128], [0.062, -0.1], [0.088, -0.05], [0.098, 0.0], [0.097, 0.05], [0.09, 0.095], [0.065, 0.125], [0.03, 0.14], [0.001, 0.145]];
  const jaw = fierce ? 1.08 : old ? 0.94 : 1.0;
  const rings = prof.map(([r, y]) => { const ring = []; for (let s = 0; s < 18; s++) { const th = (s / 18) * Math.PI * 2, front = Math.max(0, Math.sin(th)); ring.push([Math.cos(th) * r * 1.0 * (y < -0.04 ? jaw : 1) * k, y * k, Math.sin(th) * r * (1.04 + 0.1 * front) * k]); } return ring; });
  rings[0] = rings[0].map((p) => [p[0], p[1], p[2]]);
  const skull = skin(rings, true, true); if (turn) skull.rotateY(turn); skull.translate(c[0], c[1], c[2]);
  F.push(skull);
  const at = (x, y, z) => { const p = [x * k, y * k, z * k]; if (turn) { const cs = Math.cos(turn), sn = Math.sin(turn); return [c[0] + p[0] * cs + p[2] * sn, c[1] + p[1], c[2] - p[0] * sn + p[2] * cs]; } return [c[0] + p[0], c[1] + p[1], c[2] + p[2]]; };
  const bl = (x, y, z, rx, ry, rz, seg = 8, rows = 4) => { const b = blob([0, 0, 0], rx * k, ry * k, rz * k, seg, rows); if (turn) b.rotateY(turn); const p = at(x, y, z); b.translate(p[0] - c[0] + c[0], p[1], p[2]); return b; };
  // brow ridge and cheeks
  if (fierce || old) F.push(bl(0, 0.045, 0.098, 0.088, 0.02, 0.025));
  F.push(bl(-0.058, -0.04, 0.085, 0.038, 0.04, 0.03), bl(0.058, -0.04, 0.085, 0.038, 0.04, 0.03));
  // the nose: a bridge and a tip with nostril wings
  F.push(bl(0, -0.005, 0.118, 0.014, 0.04, 0.02), bl(0, -0.035, 0.128, bar ? 0.024 : 0.019, 0.018, 0.02, 8, 4));
  for (const s of [-1, 1]) F.push(bl(s * 0.021, -0.04, 0.113, 0.011, 0.012, 0.013, 6, 3));
  // the eyes: almond shapes, lids half closed for the gentle, wide for the fierce; black brows over them
  for (const s of [-1, 1]) {
    const ew = fierce ? 0.024 : 0.027, eh = fierce ? 0.016 : 0.009;
    K.push(bl(s * 0.04, 0.02, 0.1, ew, eh, 0.01, 8, 3));
    const brow = [], by0 = fierce ? 0.058 : 0.05;
    for (let i = 0; i <= 5; i++) { const t = i / 5, bx = s * (0.012 + 0.06 * t), by = by0 + (fierce ? -0.02 * t + 0.01 * Math.sin(Math.PI * t) : 0.013 * Math.sin(Math.PI * t) - 0.008 * t), bz = 0.104 - 0.03 * t * t; const p = at(bx, by, bz); brow.push([p[0], p[1], p[2], fierce ? 0.008 : 0.0045]); }
    K.push(tube(brow, 5, 0.8));
    if (old) F.push(bl(s * 0.04, 0.034, 0.099, 0.03, 0.007, 0.012, 6, 3));      // the heavy lid
  }
  // the lips: upper thinner than the lower, red; the mouth open and dark for the fierce king
  if (fierce) { K.push(bl(0, -0.078, 0.1, 0.03, 0.017, 0.012, 8, 3)); R.push(bl(0, -0.063, 0.106, 0.033, 0.008, 0.012, 8, 3), bl(0, -0.092, 0.1, 0.03, 0.009, 0.012, 8, 3)); }
  else { R.push(bl(0, -0.068, 0.107, 0.025, 0.007, 0.012, 8, 3), bl(0, -0.081, 0.104, 0.021, 0.008, 0.012, 8, 3)); }
  if (style === 'gentle') R.push(bl(0, 0.07, 0.112, 0.006, 0.006, 0.004, 5, 3));    // the urna between the brows
  // ears with long lobes
  for (const s of [-1, 1]) { F.push(bl(s * 0.099, 0.0, -0.002, 0.012, 0.04, 0.028, 6, 4), bl(s * 0.1, -0.055, 0.0, 0.009, 0.036, 0.015, 6, 3)); }
  // a moustache and a beard (the groom and the king), the hair's cap
  if (bar || fierce) {
    for (const s of [-1, 1]) H.push(bl(s * 0.03, -0.054, 0.108, 0.034, 0.011, 0.012, 7, 3));
    if (bar) H.push(bl(0, -0.105, 0.075, 0.07, 0.07, 0.05, 10, 5));
  }
}
function hairCap(parts, c, k, style) {
  const { H } = parts;
  const h = blob([c[0], c[1] + 0.05 * k, c[2] - 0.012 * k], 0.103 * k, 0.1 * k, 0.108 * k, 14, 6);
  H.push(h);
  if (style === 'gentle') {
    // the high chignon, in two coils with a hairpin, hair's side locks falling to the shoulders
    H.push(blob([c[0], c[1] + 0.19 * k, c[2] - 0.02 * k], 0.07 * k, 0.07 * k, 0.065 * k, 10, 5), blob([c[0], c[1] + 0.27 * k, c[2] - 0.02 * k], 0.045 * k, 0.05 * k, 0.04 * k, 8, 4));
    for (const s of [-1, 1]) H.push(tube([[c[0] + s * 0.098 * k, c[1] + 0.0, c[2] - 0.02 * k, 0.014 * k], [c[0] + s * 0.11 * k, c[1] - 0.12 * k, c[2] - 0.03 * k, 0.014 * k], [c[0] + s * 0.14 * k, c[1] - 0.24 * k, c[2] - 0.04 * k, 0.012 * k], [c[0] + s * 0.2 * k, c[1] - 0.34 * k, c[2] - 0.03 * k, 0.01 * k]], 6));
  }
}
/** The crown of a bodhisattva: a gilt band with leaf-shaped points and a jewel in front, flaming ties at the ears. */
function crown(parts, c, k) {
  const { G, R } = parts;
  G.push(lathe([[0.1, 0], [0.108, 0.01], [0.112, 0.045], [0.106, 0.06], [0.102, 0.05]], 20, null, c[0], c[1] + 0.065 * k, c[2] - 0.004).scale(1, 1, 1));
  for (let i = 0; i < 7; i++) { const a = Math.PI * (0.12 + 0.76 * i / 6) + Math.PI * 0 , r = 0.112 * k; G.push(blob([c[0] + Math.cos(a) * r, c[1] + 0.13 * k + (i === 3 ? 0.03 : 0), c[2] + Math.sin(a) * r * 0.95], 0.012 * k, 0.034 * k + (i === 3 ? 0.012 : 0), 0.008 * k, 6, 4)); }
  R.push(blob([c[0], c[1] + 0.1 * k, c[2] + 0.114 * k], 0.013 * k, 0.017 * k, 0.008 * k, 7, 4));
}

// ── hands ────────────────────────────────────────────────────────────────────
/**
 * A hand at p, the fingers pointing along f, the palm's normal n: a palm, four fingers in two joints curled by `curl`
 * (0 straight … 1 closed), a thumb; `spread` fans the fingers. Into parts.F (flesh).
 */
function hand(parts, p, f, n, curl = 0.3, spread = 0.1, size = 1, thumbIn = 0.4) {
  const { F } = parts;
  f = norm(f); n = norm(sub(n, [f[0] * dot(n, f), f[1] * dot(n, f), f[2] * dot(n, f)]));
  const sd = norm(cross(f, n)), s = size;
  // the palm: a short tube along f, flattened across the palm's normal
  F.push(tube([[...add3(p, f, -0.005 * s), 0.02 * s], [...add3(p, f, 0.03 * s), 0.036 * s], [...add3(p, f, 0.075 * s), 0.03 * s]], 7, 0.5));
  for (let i = 0; i < 4; i++) {
    const off = (i - 1.5) * 0.019 * s, base = add3(add3(p, f, 0.075 * s), sd, off), L = [0.034, 0.028, 0.022].map((v) => v * s * (i === 0 || i === 3 ? 0.88 : 1));
    const dirs = [];
    let d = norm(add3(f, sd, (i - 1.5) * spread));
    let q = base; const path = [[...q, 0.0092 * s]];
    for (let j = 0; j < 3; j++) { const a = curl * (0.4 + j * 0.5) * 0.9; d = norm(add3(d, n, -Math.sin(a) * 0.9)); q = add3(q, d, L[j]); path.push([...q, (0.0092 - 0.0014 * (j + 1)) * s]); dirs.push(d); }
    F.push(tube(path, 5));
  }
  // the thumb: from the palm's side, toward the forefinger
  const tb = add3(add3(p, f, 0.03 * s), sd, -0.03 * s), td = norm(add3(add3(f, sd, -0.4 + thumbIn), n, -0.3 * thumbIn));
  F.push(tube([[...tb, 0.011 * s], [...add3(tb, td, 0.03 * s), 0.0098 * s], [...add3(add3(tb, td, 0.055 * s), n, -0.01 * s), 0.0082 * s]], 5));
}

// ── the figures ──────────────────────────────────────────────────────────────
function rngOf(seed) { let s = (seed >>> 0) || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/**
 * { type, seed, robe, robe2 } → parts for the materials: R (robe), R2 (second garment), F (flesh), G (gilt), K (black
 * paint), RD (red paint), H (hair), B (blue paint), W (white paint), P (the lotus' petals: gilt over red).
 * Built facing +z, standing on y = 0, 2.4 m with the pedestal; the caller places and scales it.
 */
export function clayFigure(type, seed = 1) {
  const rand = rngOf(seed * 7919 + 13);
  const parts = { R: [], R2: [], F: [], G: [], K: [], RD: [], H: [], B: [], W: [], P: [], S: [] };
  const out = { parts, base: 0 };
  const monk = type === 'disciple', king = type === 'king', kneel = type === 'kneel', groom = type === 'groom', bodhi = type === 'bodhisattva';
  const pr = { F: parts.F, G: parts.G, P: parts.P, K: parts.K, R: parts.RD, H: parts.H };   // the head's names: R is red paint there
  const b = king || groom ? 0.22 : kneel ? 0.5 : 0.42;
  out.base = b;
  const var3 = Math.floor(rand() * 3), mir = rand() < 0.5 ? -1 : 1;
  // the pedestal: a lotus of petals (bodhisattva, kneeling, monk) or a rock (king, groom)
  if (king || groom) {
    parts.S.push(lathe([[0.001, 0], [0.5, 0], [0.54, 0.07], [0.48, 0.16], [0.42, b], [0.001, b]], 9, (th) => 1 + 0.14 * Math.sin(th * 3) + 0.07 * Math.cos(th * 7)));
  } else lotus({ F: parts.R2, G: parts.G, P: parts.P }, kneel ? 0.42 : 0.38, b);
  // ── the body
  const lean = bodhi || kneel ? 0.04 : 0.0, sway = bodhi ? 0.035 * mir : 0;
  if (bodhi || monk) {
    // the long skirt (dhoti): folds deepening toward the hem, a flared lower edge, U-folds across the thighs
    const hemR = bodhi ? 0.3 : 0.28;
    const folds = lathe([[0.001, 0.0], [hemR, 0.0], [hemR * 1.04, 0.05], [hemR * 0.96, 0.18], [hemR * 0.82, 0.5], [0.22, 0.86], [0.185, 1.0], [0.001, 1.02]], 30,
      (th, i, r, y) => 1 + (0.05 * (1 - y) + 0.01) * Math.cos(th * 9 + y * 2.2) + (0.03 * (1 - y)) * Math.cos(th * 5 - y * 1.5));
    folds.scale(1, 1, 0.82); folds.translate(sway * 0.5, b, 0);
    (monk ? parts.R : parts.R).push(folds);
    // the hem's gilt border and the sash
    parts.G.push(lathe([[hemR * 1.045, 0.01], [hemR * 1.075, 0.04], [hemR * 1.05, 0.08], [hemR * 1.03, 0.05]], 30, (th) => 1 + 0.05 * Math.cos(th * 9)).scale(1, 1, 0.82).translate(sway * 0.5, b, 0));
    // U-shaped drapery across the thighs, three loops in the second garment
    for (let j = 0; j < 3; j++) {
      const y0 = 0.74 - j * 0.14, w = 0.2 - j * 0.02, pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8, x = (t - 0.5) * 2 * w; pts.push([x + sway * 0.5, b + y0 - (1 - (2 * t - 1) ** 2) * -0.0 - 0.085 * Math.sin(Math.PI * t), 0.185 - 0.01 * j + 0.008 * Math.sin(Math.PI * t), 0.012]); }
      (bodhi ? parts.R2 : parts.R).push(tube(pts, 5));
    }
  }
  if (bodhi) {
    // the belt at the waist with its knot, the sash's ends hanging
    parts.G.push(lathe([[0.215, 0.95], [0.228, 0.97], [0.228, 1.01], [0.215, 1.03]], 24).scale(1, 1, 0.82).translate(sway * 0.5, b, 0));
    parts.B.push(blob([sway * 0.5, b + 0.98, 0.19], 0.045, 0.035, 0.02, 8, 4));
    for (const s of [-1, 1]) parts.B.push(strap([[sway * 0.5 + s * 0.03, b + 0.96, 0.2], [sway * 0.5 + s * 0.06, b + 0.7, 0.215], [sway * 0.5 + s * 0.09, b + 0.4, 0.215], [sway * 0.5 + s * 0.12, b + 0.12, 0.2, 0.08]], 0.05, 0.01));
    // the feet at the hem
    for (const s of [-1, 1]) parts.F.push(blob([s * 0.1 + sway * 0.4, b + 0.03, 0.22], 0.045, 0.03, 0.09, 7, 4));
    // the body: a swelling belly, a bent waist, the chest bare; shoulders turned against the hips
    const tor = [];
    const rowsT = [[1.0, 0.185, 0.13], [1.12, 0.178, 0.135], [1.26, 0.175, 0.13], [1.4, 0.2, 0.14], [1.5, 0.225, 0.14], [1.58, 0.215, 0.115], [1.64, 0.1, 0.085], [1.68, 0.001, 0.001]];
    for (const [y, rx, rz] of rowsT) { const ring = []; for (let s = 0; s < 16; s++) { const th = (s / 16) * Math.PI * 2, tw = (y - 1.0) / 0.7; ring.push([Math.cos(th) * rx - sway * tw * 1.5 + sway * 0.5, b + y, lean * tw + 0.012 + Math.sin(th) * rz]); } tor.push(ring); }
    parts.F.push(skin(tor, true, true));
    // the breasts, the collarbones, the belly's swell
    for (const s of [-1, 1]) parts.F.push(blob([s * 0.085 - sway, b + 1.42, 0.125 + lean], 0.07, 0.065, 0.05, 9, 5));
    parts.F.push(blob([sway * 0.3, b + 1.12, 0.14 + lean * 0.4], 0.14, 0.1, 0.05, 9, 5));
    // the neck and the necklace: beads in a U, a ruyi pectoral, a pendant
    parts.F.push(tube([[-sway * 1.4, b + 1.6, 0.005 + lean, 0.052], [-sway * 1.4, b + 1.7, 0.01 + lean, 0.048], [-sway * 1.4, b + 1.76, 0.012 + lean, 0.047]], 8));
    for (let i = 0; i <= 12; i++) { const t = i / 12, a = Math.PI * (0.1 + 0.8 * t), px = Math.cos(a) * 0.17 - sway * 1.2; parts.G.push(blob([px, b + 1.54 - 0.15 * Math.sin(Math.PI * t) ** 1.2, 0.125 + Math.sin(a) * 0.04 + lean], 0.016, 0.016, 0.014, 5, 3)); }
    parts.G.push(blob([-sway * 1.2, b + 1.33, 0.165 + lean], 0.05, 0.065, 0.014, 8, 4));
    parts.RD.push(blob([-sway * 1.2, b + 1.33, 0.176 + lean], 0.02, 0.028, 0.006, 6, 3));
    // the scarf (tianyi): over both shoulders, hanging in front, looping across the thighs and down at the sides
    const sc = [parts.B, parts.W, parts.R2][var3];
    for (const s of [-1, 1]) {
      sc.push(strap([[s * 0.22 - sway, b + 1.58, -0.02 + lean, 0.08], [s * 0.3 - sway, b + 1.45, 0.07, 0.085], [s * 0.34 - sway, b + 1.1, 0.12, 0.09], [s * 0.35 - sway, b + 0.7, 0.14, 0.09], [s * 0.33 - sway, b + 0.28, 0.12, 0.085], [s * 0.32 - sway, b + 0.1, 0.1, 0.08]], 0.085, 0.014));
    }
    sc.push(strap([[-0.27 + sway, b + 1.02, 0.15], [-0.15, b + 0.82, 0.21], [0.0, b + 0.76, 0.225], [0.15, b + 0.82, 0.21], [0.27 - sway, b + 1.02, 0.15]], 0.075, 0.01));
    // armlets and bracelets in gilt
    // arms and hands
    const sh = (s) => [s * 0.225 - sway * 1.2, b + 1.54, 0.0 + lean];
    // the left (s=-1 side): the arm raised, the hand holding up an offering in a mudra; the right hangs with the hand holding the scarf or a vase
    const raised = var3 !== 2 ? -mir : mir, low = -raised;
    // raised arm: elbow out and bent, the forearm up, the hand open palm forward
    const E1 = [raised * 0.3 - sway, b + 1.22, 0.1], H1 = [raised * 0.24 - sway, b + 1.42, 0.27];
    parts.F.push(tube([[...sh(raised), 0.052], [...add3(sh(raised), sub(E1, sh(raised)), 0.5), 0.047], [...E1, 0.042], [...add3(E1, sub(H1, E1), 0.5), 0.037], [...H1, 0.03]], 8));
    parts.G.push(tube([[...add3(E1, sub(H1, E1), 0.78), 0.036], [...add3(E1, sub(H1, E1), 0.84), 0.036]], 8));
    hand(parts, H1, [0.0, 0.9, 0.2], [raised * -0.1, -0.2, 1], 0.28, 0.12);
    // the lowered arm: hanging forward, the hand holding a vase (var 0), a lotus bud (var 1) or the cord (var 2)
    const E2 = [low * 0.3 - sway, b + 1.1, 0.06], H2 = [low * 0.27 - sway, b + 0.9, 0.17];
    parts.F.push(tube([[...sh(low), 0.052], [...add3(sh(low), sub(E2, sh(low)), 0.5), 0.047], [...E2, 0.042], [...add3(E2, sub(H2, E2), 0.5), 0.036], [...H2, 0.03]], 8));
    parts.G.push(tube([[...add3(E2, sub(H2, E2), 0.74), 0.036], [...add3(E2, sub(H2, E2), 0.8), 0.036]], 8));
    hand(parts, H2, [low * 0.1, -0.5, 0.8], [0, 0.8, 0.5], 0.7, 0.05, 1, 0.9);
    if (var3 === 0) parts.G.push(lathe([[0.001, 0], [0.035, 0.015], [0.045, 0.07], [0.02, 0.12], [0.016, 0.19], [0.03, 0.22], [0.001, 0.22]], 10, null, low * 0.27 - sway, b + 0.93, 0.2));
    else if (var3 === 1) { parts.RD.push(blob([low * 0.27 - sway, b + 0.92, 0.2], 0.028, 0.05, 0.028, 7, 4)); }
    // the head, its crown, the halo
    const hc = [-sway * 1.5, b + 1.88, 0.016 + lean * 1.3];
    head(pr, hc, 1.0, 'gentle', 0); hairCap(pr, hc, 1.0, 'gentle'); crown({ G: parts.G, R: parts.RD }, hc, 1.0);
    // the halo: a disc of rings behind the head, a lotus-petalled edge
    halo(parts, [hc[0], hc[1] + 0.02, hc[2] - 0.15], 0.25);
  }
  if (monk) {
    // a monk's robe: undergarment to the feet, the kasaya over the left shoulder crossing the chest, a patched field of gilt lines
    const kas = lathe([[0.001, 0.04], [0.27, 0.04], [0.285, 0.1], [0.26, 0.55], [0.23, 1.05], [0.24, 1.4], [0.2, 1.56], [0.1, 1.62], [0.001, 1.64]], 28,
      (th, i, r, y) => 1 + (0.03 + 0.03 * (1 - y / 1.5)) * Math.cos(th * 9 + y * 3));
    kas.scale(1.05, 1, 0.78); kas.translate(0, b, 0); parts.R2.push(kas);
    // the robe's lower edge beyond the kasaya's, and the diagonal band of the kasaya across the chest
    parts.G.push(lathe([[0.275, 0.04], [0.295, 0.07], [0.285, 0.12], [0.272, 0.08]], 28, (th) => 1 + 0.03 * Math.cos(th * 9)).scale(1.05, 1, 0.78).translate(0, b, 0));
    parts.R.push(strap([[0.2, b + 1.58, 0.07, 0.14], [0.02, b + 1.35, 0.17, 0.15], [-0.1, b + 1.08, 0.21, 0.15], [-0.18, b + 0.78, 0.2, 0.13]], 0.14, 0.02, 0.012));
    parts.G.push(strap([[0.2, b + 1.58, 0.083, 0.02], [0.02, b + 1.35, 0.183, 0.02], [-0.1, b + 1.08, 0.223, 0.02], [-0.18, b + 0.78, 0.213, 0.02]], 0.02, 0, 0.003));
    // the patches' gilt lines, rows on the robe's front
    for (let j = 0; j < 5; j++) { const y = 0.25 + j * 0.2; parts.G.push(lathe([[0.269 - j * 0.004, y], [0.272 - j * 0.004, y + 0.012]], 28, (th) => 1 + 0.0 * th).scale(1.05, 1, 0.78).translate(0, b, 0)); }
    // the sleeves: wide, hanging from the clasped hands in front of the chest
    parts.R.push(tube([[-0.24, b + 1.5, 0.0, 0.07], [-0.3, b + 1.2, 0.12, 0.1], [-0.15, b + 1.1, 0.24, 0.1], [0.0, b + 1.2, 0.27, 0.075]], 9), tube([[0.24, b + 1.5, 0.0, 0.07], [0.3, b + 1.2, 0.12, 0.1], [0.15, b + 1.1, 0.24, 0.1], [0.0, b + 1.2, 0.27, 0.075]], 9));
    // the hands joined (anjali) at the chest
    hand(parts, [-0.02, b + 1.17, 0.31], [0.1, 0.55, 0.8], [1, 0, 0], 0.15, 0.02, 0.95);
    parts.F.push(tube([[0.0, b + 1.55, 0.0, 0.06], [0.0, b + 1.66, 0.01, 0.052]], 8));
    const hc = [0, b + 1.82, 0.02];
    head(pr, hc, 1.0, rand() < 0.5 ? 'old' : 'young', 0);
    // the shaven head's skull shows blue-black stubble: a thin cap of paint
    parts.B.push(blob([hc[0], hc[1] + 0.055, hc[2] - 0.012], 0.1, 0.098, 0.106, 12, 5));
    parts.F.push(tube([[0, b + 1.62, 0.01, 0.07], [0, b + 1.72, 0.015, 0.05]], 8));
  }
  if (kneel) {
    // the kneeling offering bodhisattva: one knee on the lotus, one foot flat, a tray of fruit held out
    const y0 = b;
    parts.R.push(blob([0.0, y0 + 0.14, 0.02], 0.3, 0.17, 0.36, 12, 6));
    const skirt = lathe([[0.001, 0.02], [0.28, 0.02], [0.3, 0.12], [0.24, 0.42], [0.18, 0.74], [0.001, 0.76]], 24, (th, i, r, y) => 1 + 0.06 * Math.cos(th * 8 + y * 3));
    skirt.scale(1, 1, 0.9); skirt.translate(0, y0 + 0.2, -0.04); parts.R.push(skirt);
    parts.R2.push(tube([[-0.22, y0 + 0.18, 0.16, 0.1], [-0.12, y0 + 0.12, 0.34, 0.095], [0.05, y0 + 0.1, 0.4, 0.085]], 8));
    parts.F.push(blob([0.1, y0 + 0.05, 0.4], 0.055, 0.03, 0.1, 7, 4));
    const tor = [];
    for (const [y, rx, rz] of [[0.84, 0.19, 0.13], [1.0, 0.18, 0.13], [1.14, 0.2, 0.14], [1.24, 0.215, 0.13], [1.3, 0.2, 0.1], [1.34, 0.001, 0.001]]) { const ring = []; for (let s = 0; s < 14; s++) { const th = (s / 14) * Math.PI * 2; ring.push([Math.cos(th) * rx, y0 + y - 0.2, 0.04 + Math.sin(th) * rz]); } tor.push(ring); }
    parts.F.push(skin(tor, true, true));
    for (const s of [-1, 1]) parts.F.push(blob([s * 0.08, y0 + 1.07, 0.15], 0.062, 0.06, 0.045, 8, 4));
    parts.F.push(tube([[0, y0 + 1.28, 0.04, 0.05], [0, y0 + 1.4, 0.05, 0.046]], 8));
    const sc = [parts.B, parts.W][var3 % 2];
    for (const s of [-1, 1]) sc.push(strap([[s * 0.2, y0 + 1.33, 0.0, 0.075], [s * 0.28, y0 + 1.1, 0.06, 0.08], [s * 0.3, y0 + 0.74, 0.1, 0.08], [s * 0.3, y0 + 0.4, 0.14, 0.08]], 0.08, 0.012));
    for (let i = 0; i <= 10; i++) { const t = i / 10, a = Math.PI * (0.12 + 0.76 * t); parts.G.push(blob([Math.cos(a) * 0.16, y0 + 1.24 - 0.1 * Math.sin(Math.PI * t), 0.14 + Math.sin(a) * 0.03], 0.014, 0.014, 0.012, 5, 3)); }
    // the arms forward holding a tray of fruit
    const sh = (s) => [s * 0.21, y0 + 1.22, 0.04];
    for (const s of [-1, 1]) {
      parts.F.push(tube([[...sh(s), 0.05], [s * 0.26, y0 + 1.0, 0.14, 0.043], [s * 0.2, y0 + 0.95, 0.3, 0.036], [s * 0.15, y0 + 1.0, 0.42, 0.03]], 8));
      hand(parts, [s * 0.14, y0 + 1.0, 0.44], [-s * 0.3, 0.1, 0.8], [0, 1, 0], 0.45, 0.08, 0.92);
    }
    parts.G.push(lathe([[0.001, 0], [0.12, 0.0], [0.15, 0.03], [0.14, 0.04], [0.001, 0.02]], 14, null, 0, y0 + 0.97, 0.52));
    for (const [px, pz, c] of [[0, 0.52, 0], [0.07, 0.56, 1], [-0.06, 0.58, 0], [0.01, 0.48, 1], [-0.02, 0.62, 1]]) (c ? parts.RD : parts.G).push(blob([px, y0 + 1.04, pz], 0.034, 0.034, 0.034, 7, 4));
    const hc = [0, y0 + 1.5, 0.06];
    head(pr, hc, 1.0, 'gentle', 0); hairCap(pr, hc, 1.0, 'gentle'); crown({ G: parts.G, R: parts.RD }, hc, 1.0);
    halo(parts, [0, hc[1] + 0.02, hc[2] - 0.15], 0.24);
  }
  if (king) {
    // the heavenly king: boots and greaves, the armoured skirt of plates, the cuirass with two gilt discs, a belt with a lion mask,
    // lion-headed shoulder guards, sleeves flaring, a horned helm; both hands on the sword before him
    for (const s of [-1, 1]) {
      parts.K.push(blob([s * 0.1, b + 0.07, 0.07], 0.075, 0.07, 0.14, 8, 4));
      parts.B.push(tube([[s * 0.11, b + 0.12, 0.02, 0.07], [s * 0.115, b + 0.4, 0.0, 0.085], [s * 0.12, b + 0.62, 0.0, 0.08]], 9));
      parts.G.push(blob([s * 0.115, b + 0.47, 0.08], 0.05, 0.065, 0.025, 7, 4));
    }
    // the skirt of plates: three rows of overlapping bands, flaring
    for (let j = 0; j < 4; j++) { const y = 0.56 + j * 0.13; parts.R.push(lathe([[0.2 + j * 0.0 + (3 - j) * 0.03, y], [0.215 + (3 - j) * 0.03, y + 0.01], [0.2 + (3 - j) * 0.027, y + 0.13], [0.185 + (3 - j) * 0.026, y + 0.125]], 22, (th) => 1 + 0.04 * Math.abs(Math.cos(th * 7))).scale(1.12, 1, 0.82).translate(0, b, 0)); }
    parts.G.push(lathe([[0.31, 0.57], [0.33, 0.6], [0.315, 0.62]], 22).scale(1.12, 1, 0.82).translate(0, b, 0));
    // the cuirass
    const tor = [];
    for (const [y, rx, rz] of [[1.0, 0.2, 0.15], [1.1, 0.22, 0.16], [1.25, 0.26, 0.17], [1.4, 0.3, 0.17], [1.5, 0.28, 0.14], [1.56, 0.2, 0.1], [1.6, 0.001, 0.001]]) { const ring = []; for (let s = 0; s < 18; s++) { const th = (s / 18) * Math.PI * 2; ring.push([Math.cos(th) * rx, b + y, 0.01 + Math.sin(th) * rz]); } tor.push(ring); }
    parts.R.push(skin(tor, true, true));
    for (const s of [-1, 1]) { parts.G.push(blob([s * 0.115, b + 1.37, 0.155], 0.098, 0.098, 0.03, 12, 5)); parts.K.push(blob([s * 0.115, b + 1.37, 0.18], 0.06, 0.06, 0.012, 10, 4)); }
    parts.G.push(lathe([[0.21, 1.03], [0.235, 1.07], [0.235, 1.13], [0.215, 1.15]], 20).scale(1.08, 1, 0.8).translate(0, b, 0));
    parts.G.push(blob([0, b + 1.1, 0.19], 0.065, 0.06, 0.025, 9, 4));      // the lion mask's boss
    // the shoulder guards: lion heads with manes
    for (const s of [-1, 1]) {
      parts.R2.push(blob([s * 0.36, b + 1.5, 0.0], 0.13, 0.095, 0.15, 10, 5));
      parts.G.push(blob([s * 0.41, b + 1.52, 0.1], 0.085, 0.08, 0.08, 10, 5), blob([s * 0.41, b + 1.47, 0.18], 0.04, 0.028, 0.03, 7, 4));
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; parts.G.push(blob([s * 0.41 + Math.cos(a) * 0.085, b + 1.52 + Math.sin(a) * 0.075, 0.07], 0.028, 0.028, 0.03, 5, 3)); }
      parts.K.push(blob([s * 0.395, b + 1.545, 0.17], 0.015, 0.012, 0.008, 5, 3));
    }
    // arms: sleeves flaring and fluttering, hands on the sword's hilt
    for (const s of [-1, 1]) {
      parts.R2.push(tube([[s * 0.34, b + 1.45, 0.0, 0.08], [s * 0.4, b + 1.2, 0.08, 0.1], [s * 0.3, b + 1.05, 0.2, 0.11], [s * 0.12, b + 1.0, 0.3, 0.08]], 9));
      parts.G.push(tube([[s * 0.31, b + 1.04, 0.2, 0.113], [s * 0.3, b + 1.07, 0.205, 0.113]], 9));
      hand(parts, [s * 0.04, b + 1.02, 0.34], [-s * 0.2, 0, 1], [0, 1, 0], 0.9, 0.0, 1.12);
    }
    parts.F.push(tube([[0, b + 1.58, 0.0, 0.075], [0, b + 1.7, 0.015, 0.07]], 8));
    // the sword: blade down in front, a guard and a pommel
    parts.G.push(blob([0, b + 1.0, 0.34], 0.02, 0.07, 0.02, 7, 4), blob([0, b + 1.14, 0.34], 0.03, 0.03, 0.03, 8, 4));
    parts.G.push(blob([0, b + 0.9, 0.34], 0.1, 0.014, 0.02, 8, 3));
    parts.K.push(skin([[[-0.022, b + 0.89, 0.325], [0.022, b + 0.89, 0.325], [0.022, b + 0.89, 0.355], [-0.022, b + 0.89, 0.355]], [[-0.022, b + 0.02, 0.325], [0.022, b + 0.02, 0.325], [0.022, b + 0.02, 0.355], [-0.022, b + 0.02, 0.355]]]));
    const hc = [0, b + 1.86, 0.03];
    head(pr, hc, 1.05, 'fierce', 0);
    // the helm: a bowl with a ridge and two wings, a plume of red
    parts.G.push(blob([0, hc[1] + 0.06, hc[2] - 0.012], 0.115, 0.1, 0.12, 12, 5));
    for (const s of [-1, 1]) parts.G.push(skin([[[s * 0.1, hc[1] + 0.02, hc[2] - 0.05], [s * 0.1, hc[1] + 0.02, hc[2] + 0.02], [s * 0.115, hc[1] - 0.09, hc[2] + 0.02], [s * 0.115, hc[1] - 0.09, hc[2] - 0.05]], [[s * 0.108, hc[1] + 0.02, hc[2] - 0.05], [s * 0.108, hc[1] + 0.02, hc[2] + 0.02], [s * 0.123, hc[1] - 0.09, hc[2] + 0.02], [s * 0.123, hc[1] - 0.09, hc[2] - 0.05]]], true, false));
    parts.RD.push(tube([[0, hc[1] + 0.14, hc[2] - 0.03, 0.02], [0, hc[1] + 0.26, hc[2] - 0.06, 0.03], [0, hc[1] + 0.3, hc[2] - 0.14, 0.02]], 6));
    parts.G.push(lathe([[0.112, 0], [0.122, 0.02], [0.112, 0.045]], 18, null, 0, hc[1] + 0.04, hc[2]));
  }
  if (groom) {
    // the groom, a foreigner of the south (the Kunlun or Liao): a short coat belted, trousers, boots, a turban, a beard; the arm out holding the rein
    for (const s of [-1, 1]) {
      parts.K.push(blob([s * 0.1, b + 0.06, 0.07], 0.07, 0.06, 0.13, 8, 4));
      parts.W.push(tube([[s * 0.1, b + 0.12, 0.0, 0.065], [s * 0.1, b + 0.5, 0.0, 0.075], [s * 0.1, b + 0.85, 0.0, 0.085]], 8));
    }
    const coat = lathe([[0.001, 0.72], [0.22, 0.72], [0.24, 0.8], [0.22, 1.0], [0.215, 1.3], [0.24, 1.46], [0.2, 1.55], [0.09, 1.6], [0.001, 1.62]], 24, (th, i, r, y) => 1 + 0.035 * Math.cos(th * 10 + y * 4));
    coat.scale(1, 1, 0.75); coat.translate(0, b, 0); parts.R.push(coat);
    parts.G.push(lathe([[0.222, 0.98], [0.235, 1.0], [0.235, 1.06], [0.222, 1.08]], 22).scale(1, 1, 0.75).translate(0, b, 0));
    parts.K.push(strap([[0.0, b + 1.58, 0.1, 0.12], [0.0, b + 1.2, 0.19, 0.12]], 0.1));
    // the right arm out, the hand closed on the rein; the left at the hip
    const sh1 = [-0.22, b + 1.5, 0.0], E1 = [-0.34, b + 1.28, 0.16], H1 = [-0.26, b + 1.34, 0.4];
    parts.R2.push(tube([[...sh1, 0.06], [...E1, 0.052], [...H1, 0.042]], 8));
    hand(parts, add3(H1, [0, -0.01, 0.03]), [0.1, 0, 1], [0, -1, 0], 0.85, 0.0, 1);
    parts.R2.push(tube([[0.22, b + 1.5, 0.0, 0.06], [0.3, b + 1.22, 0.02, 0.052], [0.22, b + 1.0, 0.07, 0.044]], 8));
    hand(parts, [0.22, b + 0.98, 0.09], [-0.2, -0.7, 0.5], [1, 0, 0], 0.6, 0.0, 1);
    parts.F.push(tube([[0, b + 1.58, 0.0, 0.07], [0, b + 1.68, 0.015, 0.06]], 8));
    const hc = [0, b + 1.8, 0.03];
    head(pr, hc, 0.98, 'barbarian', 0);
    // the turban: wound cloth over a skullcap, curls of hair at the nape
    parts.W.push(lathe([[0.112, 0], [0.122, 0.03], [0.116, 0.07], [0.09, 0.115], [0.04, 0.14], [0.001, 0.145]], 16, (th, i) => 1 + 0.03 * Math.cos(th * 6 + i)).translate(0, hc[1] + 0.03, hc[2] - 0.01));
    parts.H.push(blob([0, hc[1] - 0.04, hc[2] - 0.085], 0.09, 0.06, 0.04, 9, 4));
    // the rein: a rope from the hand forward
    parts.K.push(tube([[...H1, 0.012], [H1[0] - 0.1, H1[1] - 0.15, 0.58, 0.012], [H1[0] - 0.2, H1[1] - 0.45, 0.78, 0.012]], 5));
  }
  return out;
}

/** The halo: a disc with a gilt rim and a ring of lotus-petal points, red over green, a boss of white at the centre. */
function halo(parts, c, r) {
  const mk = (r0, r1, z, tint) => lathe([[r0, -0.006], [r1, -0.006], [r1, 0.006], [r0, 0.006]], 28).rotateX(Math.PI / 2).translate(c[0], c[1], c[2] + z);
  parts.B.push(mk(0.001, r * 0.78, 0.0));
  parts.RD.push(mk(r * 0.78, r * 0.93, 0.004));
  parts.G.push(mk(r * 0.93, r, 0.006), mk(r * 0.25, r * 0.3, 0.007));
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; parts.G.push(skin([[[c[0] + Math.cos(a - 0.1) * r, c[1] + Math.sin(a - 0.1) * r, c[2] + 0.002], [c[0] + Math.cos(a + 0.1) * r, c[1] + Math.sin(a + 0.1) * r, c[2] + 0.002], [c[0] + Math.cos(a + 0.1) * r, c[1] + Math.sin(a + 0.1) * r, c[2] + 0.012], [c[0] + Math.cos(a - 0.1) * r, c[1] + Math.sin(a - 0.1) * r, c[2] + 0.012]], [[c[0] + Math.cos(a) * r * 1.13, c[1] + Math.sin(a) * r * 1.13, c[2] + 0.004], [c[0] + Math.cos(a) * r * 1.13, c[1] + Math.sin(a) * r * 1.13, c[2] + 0.004], [c[0] + Math.cos(a) * r * 1.13, c[1] + Math.sin(a) * r * 1.13, c[2] + 0.01], [c[0] + Math.cos(a) * r * 1.13, c[1] + Math.sin(a) * r * 1.13, c[2] + 0.01]]], true, false)); }
}

/**
 * A clay figure { at, y, h, dir, type: 'bodhisattva' | 'disciple' | 'king' | 'kneel' | 'groom', robe, robe2, seed, flesh }
 * (the style's `statue`): built once per (type, seed) and placed. flesh: 'skin_light' (painted) or 'clay_gilt' (gilded).
 */
export function statue(el, { bag }) {
  const [x, z] = el.at, H = el.h || 2.4, type = el.type || 'bodhisattva', dir = el.dir || [-1, 0];
  const robe = el.robe || 'clay_robe', robe2 = el.robe2 || 'clay_green';
  const seed = el.seed ?? Math.round((x * 31 + z * 17 + 1000) * 7) + (type.length * 13);
  const { parts } = clayFigure(type, seed);
  const yaw = Math.atan2(dir[0], dir[1]), s = H / 2.4, put = (g) => place(g, x, el.y, z, yaw, s);
  const flesh = el.flesh || (type === 'disciple' || type === 'king' ? 'skin_medium' : 'skin_light');
  const emit = (mat, list) => { for (const g of list) bag.add(mat, put(g)); };
  emit(robe, parts.R); emit(robe2, parts.R2); emit(flesh, parts.F); emit('clay_gilt', parts.G);
  emit('lacquer_black', parts.K); emit('lacquer_red', parts.RD); emit('lacquer_black', parts.H);
  emit('paint_blue', parts.B); emit('paint_white', parts.W);
  emit('clay_gilt', parts.P); emit('granite_grey', parts.S);
}
