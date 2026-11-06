// Nabataean architecture (1st c. BC – 1st c. AD; docs/settlements/petra.md §4): façades cut into
// the rose sandstone cliffs — the Khazneh's two storeys of columns with a tholos between broken
// pediments; tombs with pilasters, a cornice and crow-step merlons; the theatre's cavea cut in the
// rock; free-standing temples of ashlar on podiums (Qasr al-Bint); the colonnaded street; flat-
// roofed stone houses.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';
import { khazneh } from './khazneh.js';
import { siqWalls } from './siq.js';
import { crowTomb } from './tombs.js';

const R = 'sandstone_rose', A = 'sandstone_rose_ashlar';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A frame for a façade facing `dir` from its foot centre [x, z]: u along the face, v out of it. */
function frame(x, z, dir) {
  const [nx, nz] = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] }[dir], ux = -nz, uz = nx;
  const P = (u, v) => [x + ux * u + nx * v, z + uz * u + nz * v];
  const B = (u0, v0, u1, v1, y0, y1) => { const a = P(u0, v0), b = P(u1, v1); return box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1])); };
  return { P, B };
}
const col = (bag, P, u, v, y, h, r, mat = R) => { const [x, z] = P(u, v); bag.add(mat, lathe([[r * 1.25, 0], [r, 0.4], [r * 0.92, h - 0.8], [r * 1.3, h - 0.3], [r * 1.35, h]], 10, null, x, y, z)); };
/** A triangular pediment in the façade plane between u0 and u1 at height y, protruding to v. */
function pediment(bag, P, u0, u1, y, rise, v, mat = R) {
  const t = [], a = P(u0, v), b = P(u1, v), c = P((u0 + u1) / 2, v), a0 = P(u0, 0), b0 = P(u1, 0), c0 = P((u0 + u1) / 2, 0);
  t.push(a[0], y, a[1], b[0], y, b[1], c[0], y + rise, c[1]);
  t.push(a[0], y, a[1], c[0], y + rise, c[1], a0[0], y, a0[1]); t.push(a0[0], y, a0[1], c[0], y + rise, c[1], c0[0], y + rise, c0[1]);
  t.push(b[0], y, b[1], b0[0], y, b0[1], c[0], y + rise, c[1]); t.push(b0[0], y, b0[1], c0[0], y + rise, c0[1], c[0], y + rise, c[1]);
  bag.add(mat, fromTriangles(t));
}

/** rock_tomb: a tomb façade cut in the cliff { at, dir, w, h, kind ('crowstep' | 'pediment' | 'palace'), back, top }. */
function rockTomb(el, { bag, col: C }) {
  const [x, z] = el.at, { P, B } = frame(x, z, el.dir), W = el.w, H = el.h, back = el.back ?? 20, top = el.top ?? H + 15, k = el.kind ?? 'crowstep';
  bag.add(R, B(-W / 2 - 6, -back, W / 2 + 6, 0, -2, top)); { const a = P(-W / 2 - 6, -back), b = P(W / 2 + 6, 0); C.rect([a[0], a[1], b[0], b[1]], -2, top); }
  const n = k === 'palace' ? 18 : 4, pil = k === 'palace' ? H * 0.35 : H * 0.62;
  bag.add(R, B(-W / 2, 0, W / 2, 0.6, 0, 0.8));
  for (let i = 0; i <= n; i++) { const u = -W / 2 + 0.6 + i * (W - 1.2) / n; bag.add(R, B(u - 0.45, 0, u + 0.45, 0.7, 0.8, pil)); }
  bag.add(R, B(-W / 2 - 0.3, 0, W / 2 + 0.3, 1.1, pil, pil + 1.2));
  bag.add('opening', B(-1.2, 0.01, 1.2, 0.04, 0.8, Math.min(5.5, pil * 0.6)));
  if (k === 'crowstep') {
    bag.add(R, B(-W / 2 + 0.6, 0, W / 2 - 0.6, 0.6, pil + 1.2, H - 2.2));
    for (let i = 0; i < 5; i++) { const u = -W / 2 + 1.2 + i * (W - 2.4) / 4; bag.add(R, B(u - 0.9, 0, u + 0.9, 0.6, H - 2.2, H - 1.2)); bag.add(R, B(u - 0.5, 0, u + 0.5, 0.6, H - 1.2, H)); }
  } else if (k === 'pediment') pediment(bag, P, -W / 2, W / 2, pil + 1.2, H - pil - 1.2, 1.1);
  else {
    // the palace tomb: further storeys of pilasters
    for (let s = 0; s < 2; s++) {
      const y0 = pil + 1.2 + s * (H - pil - 1.2) / 2, y1 = y0 + (H - pil - 1.2) / 2 - 0.8;
      for (let i = 0; i <= n; i++) { const u = -W / 2 + 0.6 + i * (W - 1.2) / n; bag.add(R, B(u - 0.4, 0, u + 0.4, 0.6, y0, y1)); }
      bag.add(R, B(-W / 2, 0, W / 2, 0.9, y1, y1 + 0.8));
    }
  }
}

/** theatre: a cavea cut in the rock { c, r0, r1, rows, dir (facing), span (radians) }. */
function theatre(el, { bag, col: C }) {
  const [cx, cz] = el.c, rows = el.rows ?? 33, r0 = el.r0 ?? 12, r1 = el.r1 ?? 48, span = el.span ?? Math.PI * 1.1, a0 = { n: -Math.PI / 2, s: Math.PI / 2, e: 0, w: Math.PI }[el.dir] + Math.PI;
  const segs = 24, rh = 0.42;
  for (let i = 0; i < rows; i++) {
    const r = r0 + (r1 - r0) * i / rows, y = i * rh, w = (r1 - r0) / rows;
    for (let k = 0; k < segs; k++) {
      const t0 = a0 - span / 2 + span * k / segs, t1 = t0 + span / segs;
      const a = [cx + Math.cos(t0) * (r + w / 2), cz + Math.sin(t0) * (r + w / 2)], b = [cx + Math.cos(t1) * (r + w / 2), cz + Math.sin(t1) * (r + w / 2)];
      bag.add(R, orientedBox(a, b, w + 0.05, y - (i === 0 ? 0.5 : rh), y + rh, 0.05));
      if (i % 4 === 0) C.segment(a, b, w, -1, y + rh);
    }
  }
  // the stage building
  const [nx, nz] = [Math.cos(a0 + Math.PI), Math.sin(a0 + Math.PI)], sx = cx + nx * 6, sz = cz + nz * 6, ux = -nz, uz = nx;
  bag.add(A, orientedBox([sx - ux * r0 * 1.6, sz - uz * r0 * 1.6], [sx + ux * r0 * 1.6, sz + uz * r0 * 1.6], 4, -0.3, 12));
  C.segment([sx - ux * r0 * 1.6, sz - uz * r0 * 1.6], [sx + ux * r0 * 1.6, sz + uz * r0 * 1.6], 4, 0, 12);
}

/** podium_temple: Qasr al-Bint { rect, h, podium, dir ('n' — the portico's side) }: an ashlar temple on a podium, a portico of four columns in antis, a stair. */
function podiumTemple(el, { bag, col: C }) {
  const [x0, z0, x1, z1] = el.rect, pd = el.podium ?? 3, h = el.h ?? 23, pz = z0 + (z1 - z0) * 0.22;
  bag.add(A, box(x0 - 1, -0.5, z0 - 1, x1 + 1, pd, z1 + 1)); C.rect([x0 - 1, z0 - 1, x1 + 1, z1 + 1], 0, pd); C.floor([x0 - 1, z0 - 1, x1 + 1, z1 + 1], pd);
  bag.add(A, box(x0, pd, pz, x1, h - 3, z1)); C.rect([x0, pz, x1, z1], pd, h);
  for (const xx of [x0, x1 - 1.6]) bag.add(A, box(xx, pd, z0, xx + 1.6, h - 3, pz));
  for (let i = 1; i <= 4; i++) { const x = x0 + (x1 - x0) * i / 5; bag.add(A, lathe([[1, 0], [0.9, h - 3 - pd - 1], [1.2, h - 3 - pd]], 12, null, x, pd, (z0 + pz) / 2)); C.circle(x, (z0 + pz) / 2, 1, pd, h); }
  bag.add(A, box(x0 - 0.4, h - 3, z0 - 0.4, x1 + 0.4, h - 1.4, z1 + 0.4));
  bag.add('plaster', box(x0 + 0.5, h - 1.4, z0 + 0.5, x1 - 0.5, h, z1 - 0.5));
  for (let i = 0; i < 10; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / 10; bag.add(A, box(x - 0.6, h - 1.4, z0 - 0.3, x + 0.6, h - 0.2, z0 + 0.6)); }
  E_stair(bag, C, [x0 + 4, z0 - 1 - pd * 2.5, x1 - 4, z0 - 1], pd);
}
function E_stair(bag, C, r, h) {
  const n = Math.round(h / 0.2), d = (r[3] - r[1]) / n;
  for (let i = 0; i < n; i++) { const y = (i + 1) * h / n, z = r[3] - (i + 1) * d; bag.add(A, box(r[0], -0.3, z, r[2], y, z + d + 0.01)); C.floor([r[0], z, r[2], z + d], y); }
}

/** colonnade_street: a paved street { a, b, w } between two rows of columns. */
function colonnadeStreet(el, { bag, col: C }) {
  const [ax, az] = el.a, [bx, bz] = el.b, w = el.w ?? 6, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  bag.add('flagstone', orientedBox(el.a, el.b, w, -0.3, 0.05));
  const n = Math.floor(L / 3.5);
  for (const s of [-1, 1]) for (let i = 0; i <= n; i++) {
    const x = ax + ux * L * i / n + nx * s * (w / 2 + 1), z = az + uz * L * i / n + nz * s * (w / 2 + 1);
    bag.add(A, lathe([[0.5, 0], [0.42, 6], [0.6, 6.5]], 10, null, x, 0, z)); C.circle(x, z, 0.45, 0, 6.5);
  }
}

/** nabataean_house: { rect, seed, y }: a flat-roofed house of rose ashlar, a stair to the roof. */
function house(el, { bag, col: C }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = rand() < 0.5 ? 3.4 : 6.4;
  bag.add(A, box(x0, y - 1.5, z0, x1, y + h, z1)); C.rect(el.rect, y - 1.5, y + h); C.floor(el.rect, y + h);
  bag.add('plaster', box(x0 - 0.05, y + h, z0 - 0.05, x1 + 0.05, y + h + 0.5, z1 + 0.05));
}

registerStyle('nabataean', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, khazneh, siq_walls: siqWalls, rock_tomb: (el, ctx) => (['pylon', 'step', 'hegr', 'crowstep'].includes(el.kind ?? 'crowstep') ? crowTomb : rockTomb)(el, ctx), theatre, podium_temple: podiumTemple, colonnade_street: colonnadeStreet, nabataean_house: house },
  objects: {},
});
