// Dravidian architecture of the Nayaka period (16th–17th c.; docs/settlements/madurai.md §4): the
// gopuram — a granite base pierced by the passage, then storeys of brick and painted stucco
// stepping in, crowned by a barrel-vaulted roof with a row of gilded finials; granite enclosure
// walls; flat-roofed pillared halls (mandapa); gilded vimanas over the sanctums; the stepped
// temple tank in its colonnade; the town's single-storey houses with a pillared front verandah
// and a tiled roof.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, rod, disc, place } from '../../core/geom.js';
import { Shape, ExtrudeGeometry, Matrix4, Vector3 } from '../../core/three.js';
import '../qing/index.js';
import '../../objects/index.js';
import { rite } from '../indian/rites.js';
import { tamilHouse } from './houses.js';

const G = 'granite_tamil';
const PAINT = ['stucco_sky', 'stucco_rose', 'stucco_saffron', 'stucco_leaf', 'stucco_cream'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A gilded pot finial (kalasha): the foot ring, the pot, the neck, the lid and the flame-shaped tip. */
const kalasha = (bag, x, y, z, s = 1, mat = 'gilt_bronze') => bag.add(mat, lathe([[0.3 * s, 0], [0.36 * s, 0.06 * s], [0.28 * s, 0.13 * s], [0.42 * s, 0.36 * s], [0.4 * s, 0.6 * s], [0.2 * s, 0.76 * s], [0.13 * s, 0.82 * s], [0.24 * s, 0.9 * s], [0.1 * s, 1.04 * s], [0.07 * s, 1.35 * s], [0.001, 1.6 * s]], s > 0.5 ? 12 : 6, null, x, y, z));
const j3 = (u) => Math.abs(Math.round(u * 7)) % 3;

/** gopuram: { c, dir ('ns' passage along z, 'ew' along x), w (along the wall), d (through), h, tiers, y }. */
function gopuram(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, h = el.h, n = el.tiers ?? 9, alongX = el.dir === 'ew';
  const W = el.w, D = el.d, base = Math.max(8, h * 0.2), pw = Math.min(5, W * 0.18), ph = base * 0.75;
  const R = (u0, v0, u1, v1) => alongX ? [cx + v0, cz + u0, cx + v1, cz + u1] : [cx + u0, cz + v0, cx + u1, cz + v1];
  // a shape extruded along the local direction (du, dv), its back at local (u, v), base at yy
  const place2 = (bg, mat, g, u, v, yy, [du, dv]) => {
    const [px, pz] = alongX ? [v, u] : [u, v], [zx, zz] = alongX ? [dv, du] : [du, dv];
    g.applyMatrix4(new Matrix4().makeBasis(new Vector3(zz, 0, -zx), new Vector3(0, 1, 0), new Vector3(zx, 0, zz)).setPosition(cx + px, yy, cz + pz));
    bg.add(mat, g);
  };
  // the granite base: two piers either side of the passage, the lintel over it, a moulded plinth
  for (const [u0, u1] of [[-W / 2, -pw / 2], [pw / 2, W / 2]]) { const r = R(u0, -D / 2, u1, D / 2); bag.add(G, box(r[0], y, r[1], r[2], y + base, r[3])); col.rect(r, y, y + base); }
  { const r = R(-pw / 2, -D / 2, pw / 2, D / 2); bag.add(G, box(r[0], y + ph, r[1], r[2], y + base, r[3])); }
  // (the plinth stops at the passage's jambs: the way through is open at the pavement's level)
  for (const [u0, u1] of [[-W / 2 - 0.4, -pw / 2], [pw / 2, W / 2 + 0.4]]) { const r = R(u0, -D / 2 - 0.4, u1, D / 2 + 0.4); bag.add(G, box(r[0], y, r[1], r[2], y + 1.2, r[3])); }
  { const r = R(-pw / 2, -D / 2, pw / 2, D / 2); bag.add('granite_tamil', box(r[0], y - 0.05, r[1], r[2], y + 0.02, r[3])); col.floor(r, y); }
  // the granite base's faces: pilasters, niches with their guardians, the moulded bands
  if (!el.simple) for (const s of [-1, 1]) {
    const v = s * D / 2, m = Math.floor(W / 2.2);
    for (let j = 0; j <= m; j++) {
      const u = -W / 2 + j * W / m;
      if (Math.abs(u) < pw / 2 + 0.4) continue;
      const q = R(u - 0.22, v - (s < 0 ? 0.18 : 0), u + 0.22, v + (s > 0 ? 0.18 : 0));
      bag.add(G, box(q[0], y + 1.2, q[1], q[2], y + base - 0.6, q[3]));
      if (j < m && Math.abs(u + W / m / 2) > pw / 2 + 1.2) {
        const c = u + W / m / 2, nq = R(c - 0.5, v - (s < 0 ? 0.04 : -0.02), c + 0.5, v + (s > 0 ? 0.04 : -0.02));
        bag.add('opening', box(nq[0], y + 2.4, nq[1], nq[2], y + Math.min(base * 0.6, 4.6), nq[3])); bag.add(G, box(nq[0] - 0.15, y + Math.min(base * 0.6, 4.6), Math.min(nq[1], nq[3]) - 0.1, nq[2] + 0.15, y + Math.min(base * 0.6, 4.6) + 0.5, Math.max(nq[1], nq[3]) + 0.1));
      }
    }
    for (const hh of [1.2, base * 0.66, base - 0.6]) { const q = R(-W / 2 - 0.1, v - (s < 0 ? 0.3 : 0), W / 2 + 0.1, v + (s > 0 ? 0.3 : 0)); bag.add(G, box(q[0], y + hh, q[1], q[2], y + hh + 0.35, q[3])); }
  }
  // the storeys, each a little smaller, with a cornice and a row of little shrines along the faces
  const topW = W * 0.42, topD = D * 0.45, tierH = (h - base - 6) / n;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, w0 = W + (topW - W) * t0, d0 = D + (topD - D) * t0, w1 = W + (topW - W) * t1, d1 = D + (topD - D) * t1;
    const y0 = y + base + i * tierH, y1 = y0 + tierH, mat = PAINT[i % PAINT.length];
    const r = R(-w0 / 2, -d0 / 2, w0 / 2, d0 / 2);
    bag.add(mat, frustum(r, y0, y1 - 0.35, (w0 - w1) / 2, (w0 - w1) / 2, (d0 - d1) / 2, (d0 - d1) / 2));
    const c = R(-w1 / 2 - 0.35, -d1 / 2 - 0.35, w1 / 2 + 0.35, d1 / 2 + 0.35);
    bag.add('stucco_cream', box(c[0], y1 - 0.35, c[1], c[2], y1, c[3]));
    // the gods and guardians standing in a row on the tier's faces, painted, between pilasters
    if (!el.simple) {
      const fh = Math.min(tierH * 0.62, 2.2), wm = (w0 + w1) / 2, dm = (d0 + d1) / 2;
      for (const [len, depth, long] of [[wm, dm, true], [dm, wm, false]]) {
        const m = Math.max(2, Math.floor(len / 1.25));
        for (let j = 0; j < m; j++) {
          const u = -len / 2 + (j + 0.5) * len / m;
          if (long && Math.abs(u) < Math.min(2.2, w1 * 0.12) / 2 + 0.55) continue;     // the storey's window
          for (const s of [-1, 1]) {
            const v = s * (depth / 2 + 0.05), [px, pz] = long ? (alongX ? [cx + v, cz + u] : [cx + u, cz + v]) : (alongX ? [cx + u, cz + v] : [cx + v, cz + u]);
            const k = fh / 1.15, prof = [[0.22 * k, 0], [0.17 * k, 0.5 * k], [0.13 * k, 0.75 * k], [0.08 * k, 0.8 * k], [0.11 * k, 0.88 * k], [0.09 * k, 1.0 * k], [0.06 * k, 1.08 * k], [0.001, 1.15 * k]];
            const pm = PAINT[(i * 3 + j * 7 + (s > 0 ? 2 : 0)) % PAINT.length];
            bag.add(pm, lathe(prof, 6, null, px, y0 + 0.25, pz));
            const arm = long === !alongX ? box(px - 0.27 * k, y0 + 0.25 + 0.62 * k, pz - 0.05 * k, px + 0.27 * k, y0 + 0.25 + 0.72 * k, pz + 0.05 * k) : box(px - 0.05 * k, y0 + 0.25 + 0.62 * k, pz - 0.27 * k, px + 0.05 * k, y0 + 0.25 + 0.72 * k, pz + 0.27 * k);
            bag.add(pm, arm);
            // every third a god with four arms, the upper pair raised holding his emblems, a pedestal under the feet
            if ((i + j) % 3 === 0) {
              const hk = 0.86 * k, wa = 0.34 * k, ax = long === !alongX;
              for (const sd of [-1, 1]) {
                const ex = ax ? px + sd * wa : px, ez = ax ? pz : pz + sd * wa;
                bag.add(pm, rod([px + (ax ? sd * 0.1 * k : 0), y0 + 0.25 + 0.76 * k, pz + (ax ? 0 : sd * 0.1 * k)], [ex, y0 + 0.25 + hk, ez], 0.035 * k, 4));
                bag.add('gilt_bronze', lathe([[0.001, 0], [0.04 * k, 0.03 * k], [0.001, 0.09 * k]], 5, null, ex, y0 + 0.25 + hk, ez));
              }
            }
            bag.add('stucco_cream', box(px - 0.24 * k, y0 + 0.005, pz - 0.24 * k, px + 0.24 * k, y0 + 0.25, pz + 0.24 * k));
            bag.add('gilt_bronze', lathe([[0.075 * k, 0], [0.06 * k, 0.1 * k], [0.001, 0.2 * k]], 6, null, px, y0 + 0.25 + 1.08 * k, pz));
            if (j % 2 === 0) { const q = long ? R(u - len / m / 2 - 0.08, v - 0.06, u - len / m / 2 + 0.08, v + 0.12) : (alongX ? [cx + u - len / m / 2 - 0.08, cz + v - 0.06, cx + u - len / m / 2 + 0.08, cz + v + 0.12] : [cx + v - 0.06, cz + u - len / m / 2 - 0.08, cx + v + 0.12, cz + u - len / m / 2 + 0.08]); bag.add('stucco_cream', box(Math.min(q[0], q[2]), y0, Math.min(q[1], q[3]), Math.max(q[0], q[2]), y0 + fh + 0.3, Math.max(q[1], q[3]))); }
          }
        }
      }
    }
    if (!el.simple) {
      // the storey's window on the axis of both long faces: a dark opening in a cream frame, leaning with the wall
      const ow = Math.min(2.2, w1 * 0.12, tierH * 0.45), oh = tierH * 0.6 - (i > 0 ? Math.min(1.5, tierH * 0.42) * 0.3 : 0), ya = y0 + (i > 0 ? Math.min(1.5, tierH * 0.42) * 0.3 + 0.05 : 0.3), sl = (d0 - d1) / 2 / (tierH - 0.35), ex = Math.min(0.3, ow * 0.2);
      for (const sv of [-1, 1]) {
        const vf = d0 / 2 - sl * (ya - y0), dl = sl * oh;
        // the horseshoe surround (nasi) behind the frame
        const ga = ow / 2 + ex * 1.6;
        place2(bag, 'stucco_saffron', nasiGeo(ga, ga * 1.08, Math.min(oh + ex * 2.5, tierH - 0.6), 0.34 + dl * 1.6), 0, sv * (vf - 0.3 - dl * 1.6), ya - 0.05, [0, sv]);
        for (const [m2, o0, o1, e2] of [['stucco_cream', 0.03, 0.08, ex], ['opening', 0.08, 0.11, 0]]) {
          const q = R(-ow / 2 - e2, sv > 0 ? vf + o0 : -vf - o1, ow / 2 + e2, sv > 0 ? vf + o1 : -vf - o0), hh = oh + e2;
          const ins = [0, 0];
          bag.add(m2, alongX ? frustum(q, ya, ya + hh, ins[0], ins[1], 0, 0) : frustum(q, ya, ya + hh, 0, 0, ins[0], ins[1]));
        }
      }
      // the parapet (hara) on the cornice: a little domed shrine (kuta) at each corner, a barrel-roofed one
      // (shala) at the middle of each long side, apsidal ones (panjara) between, a low wall joining them
      const kh = Math.min(1.5, tierH * 0.42), k = Math.min(0.7, kh * 0.5), mk = PAINT[(i + 2) % PAINT.length];
      for (const [len, dep, long] of [[w1, d1, true], [d1, w1, false]]) for (const sv of [-1, 1]) {
        const v = sv * (dep / 2 + 0.05), Q = (u0, v0, u1, v1) => long ? R(u0, v0, u1, v1) : R(v0, u0, v1, u1);
        const wq = Q(-len / 2, v - 0.18, len / 2, v + 0.18); bag.add('stucco_cream', box(wq[0], y1, wq[1], wq[2], y1 + kh * 0.28, wq[3]));
        const np = Math.max(1, Math.floor((len / 2 - k * 2.6) / (k * 3.2)));
        const items = [];
        for (let j = 1; j <= np; j++) for (const sg of [-1, 1]) { const uu = sg * (long ? k * 1.8 + j * (len / 2 - k * 3.2) / (np + 0.5) : j * (len / 2 - k * 1.6) / (np + 1)); items.push([uu, 'panjara']); }
        for (const [uu, kind] of items) {
          const hw = kind === 'shala' ? k * 1.4 : k * 0.6, q = Q(uu - hw, v - k * 0.5, uu + hw, v + k * 0.5), c2 = long ? (alongX ? [cx + v, cz + uu] : [cx + uu, cz + v]) : (alongX ? [cx + uu, cz + v] : [cx + v, cz + uu]);
          const qa = [Math.min(q[0], q[2]), Math.min(q[1], q[3]), Math.max(q[0], q[2]), Math.max(q[1], q[3])];
          bag.add(PAINT[(i + j3(uu)) % PAINT.length], box(qa[0], y1, qa[1], qa[2], y1 + kh * 0.5, qa[3]));
          const ridgeAlongX = (qa[2] - qa[0]) > (qa[3] - qa[1]), sh = (ridgeAlongX ? qa[3] - qa[1] : qa[2] - qa[0]) / 2;
          bag.add('stucco_cream', frustum([qa[0] - 0.05, qa[1] - 0.05, qa[2] + 0.05, qa[3] + 0.05], y1 + kh * 0.5, y1 + kh * 0.85, ridgeAlongX ? (kind === 'shala' ? 0 : sh) : sh + 0.05, ridgeAlongX ? (kind === 'shala' ? 0 : sh) : sh + 0.05, ridgeAlongX ? sh + 0.05 : (kind === 'shala' ? 0 : sh), ridgeAlongX ? sh + 0.05 : (kind === 'shala' ? 0 : sh), { noBottom: true }));
          if (kind === 'shala') for (const t of [-0.6, 0, 0.6]) kalasha(bag, c2[0] + (ridgeAlongX ? t * hw : 0), y1 + kh * 0.85, c2[1] + (ridgeAlongX ? 0 : t * hw), 0.18);
          else kalasha(bag, c2[0], y1 + kh * 0.85, c2[1], 0.15);
        }
      }
      for (const [su, sv] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const q = R(su * w1 / 2 - k * 0.55, sv * d1 / 2 - k * 0.55, su * w1 / 2 + k * 0.55, sv * d1 / 2 + k * 0.55), qa = [Math.min(q[0], q[2]), Math.min(q[1], q[3]), Math.max(q[0], q[2]), Math.max(q[1], q[3])], ccx = (qa[0] + qa[2]) / 2, ccz = (qa[1] + qa[3]) / 2;
        bag.add(mk, box(qa[0], y1, qa[1], qa[2], y1 + kh * 0.5, qa[3]));
        bag.add('stucco_cream', lathe([[k * 0.8, 0], [k * 0.78, kh * 0.08], [k * 0.62, kh * 0.25], [k * 0.3, kh * 0.4], [0.001, kh * 0.44]], 8, null, ccx, y1 + kh * 0.5, ccz).rotateY(0));
        kalasha(bag, ccx, y1 + kh * 0.92, ccz, 0.16);
      }
    }
  }
  // the crowning barrel vault (shala): the wagon roof, a great horseshoe gable (mahānāsī) at either end
  // with a lion face (kīrtimukha) at its crown, a gable dormer on each long side, the ridge of gilded pots
  const yv = y + base + n * tierH, vr = topD / 2, L = topW / 2, vh = vr * 1.3;
  const prof = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; prof.push([Math.cos(a) * vr, Math.sin(a) * vh]); }
  const pos = [];
  for (let k = 0; k < 12; k++) {
    const [a0, b0] = prof[k], [a1, b1] = prof[k + 1];
    const p = (u, v, hh) => (alongX ? [cx + v, yv + hh, cz + u] : [cx + u, yv + hh, cz + v]);
    const A = p(-L, a0, b0), B = p(L, a0, b0), C = p(L, a1, b1), D2 = p(-L, a1, b1);
    pos.push(A, B, C, A, C, D2);
  }
  bag.add('stucco_saffron', vaultTris(pos));
  for (const s2 of [-1, 1]) {
    const gh = vh + vr * 0.5, ga = vr * 0.9, gr = vr * 1.1;
    place2(bag, 'stucco_rose', nasiGeo(ga, gr, gh, 0.7), s2 * (L - 0.35), 0, yv, [s2, 0]);
    if (!el.simple) {
      place2(bag, 'stucco_sky', nasiGeo(ga * 0.62, gr * 0.66, gh * 0.8, 0.08), s2 * (L + 0.35), 0, yv, [s2, 0]);
      place2(bag, 'opening', nasiGeo(ga * 0.3, gr * 0.36, gh * 0.55, 0.06), s2 * (L + 0.43), 0, yv, [s2, 0]);
      // the lion face at the gable's crown: the head, the bulging eyes, the horns
      const P2 = (u, v) => (alongX ? [cx + v, cz + u] : [cx + u, cz + v]), fy = yv + gh - gr * 0.42, f = P2(s2 * (L + 0.45), 0);
      bag.add('stucco_saffron', lathe([[0.001, -0.55], [0.5, -0.4], [0.62, 0], [0.5, 0.4], [0.001, 0.55]], 10, null, f[0], fy, f[1]));
      for (const sd of [-1, 1]) { const e = P2(s2 * (L + 0.95), sd * 0.24); bag.add('stucco_cream', lathe([[0.001, -0.1], [0.12, 0], [0.001, 0.1]], 6, null, e[0], fy + 0.12, e[1])); const h0 = P2(s2 * (L + 0.5), sd * 0.4), h1 = P2(s2 * (L + 0.6), sd * 0.9); bag.add('stucco_saffron', rod([h0[0], fy + 0.35, h0[1]], [h1[0], fy + 0.95, h1[1]], 0.1, 5)); }
    }
    // the dormer on each long side of the vault
    place2(bag, 'stucco_rose', nasiGeo(vr * 0.42, vr * 0.5, vh * 0.95, vr * 0.9), 0, s2 * vr * 0.35, yv, [0, s2]);
    if (!el.simple) place2(bag, 'opening', nasiGeo(vr * 0.22, vr * 0.27, vh * 0.68, 0.06), 0, s2 * (vr * 1.25 + 0.01), yv, [0, s2]);
  }
  // the ridge and its row of gilded pots (an odd number, about 1.35 m apart)
  { const q = R(-L, -0.25, L, 0.25); bag.add('stucco_cream', box(q[0], yv + vh - 0.12, q[1], q[2], yv + vh + 0.2, q[3])); }
  const nk = Math.max(3, 2 * Math.floor((2 * L - 1.6) / 2.7) + 1);
  for (let j = 0; j < nk; j++) { const u = -L + 0.8 + j * (2 * L - 1.6) / (nk - 1), q = alongX ? [cx, cz + u] : [cx + u, cz]; kalasha(bag, q[0], yv + vh + 0.2, q[1], 1.15); }
}
/** A horseshoe-gable outline (nāsī): base half-width a, arch radius r, height h, extruded th (z 0…th). */
function nasiGeo(a, r, h, th) {
  const sh = new Shape(), b = Math.acos(Math.min(0.999, a / r)), yc = h - r, N = 16;
  sh.moveTo(-a, 0); sh.lineTo(-a, Math.max(0, yc - r * Math.sin(b)));
  for (let k = 0; k <= N; k++) { const ph = Math.PI + b - (Math.PI + 2 * b) * k / N; sh.lineTo(r * Math.cos(ph), yc + r * Math.sin(ph)); }
  sh.lineTo(a, 0); sh.lineTo(-a, 0);
  return new ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 4 });
}
function vaultTris(pos) { const t = []; for (let i = 0; i < pos.length; i += 3) { t.push(...pos[i], ...pos[i + 1], ...pos[i + 2], ...pos[i], ...pos[i + 2], ...pos[i + 1]); } return fromTriangles(t); }

/** prakara: a granite enclosure wall { a, b, h, th } with a coping. */
function prakara(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 1.6, h = el.h ?? 8, y = el.y ?? 0;
  const r = [Math.min(ax, bx) - th / 2, Math.min(az, bz) - th / 2, Math.max(ax, bx) + th / 2, Math.max(az, bz) + th / 2];
  if (r[2] - r[0] < 0.1 || r[3] - r[1] < 0.1) return;
  bag.add(el.mat || G, box(r[0], y - 0.3, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
  bag.add('stucco_cream', box(r[0] - 0.2, y + h, r[1] - 0.2, r[2] + 0.2, y + h + 0.5, r[3] + 0.2));
}

/** mandapa: a pillared hall { rect, y, h, step (pillar spacing), open ('nesw' sides without wall), roof walkable }.
 *  carved: the Nayaka hall (the Thousand-Pillar Hall, docs/settlements/madurai.md §4): every pillar
 *  carved in square blocks and octagonal bands under a lotus-bud bracket capital, a wide central
 *  aisle (along z) lined both sides with rearing yalis, the ceiling beamed and painted with lotus
 *  medallions, standing lamps down the aisle, and the dancing Shiva (Nataraja) at the north end. */
function mandapa(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 6, s = el.step ?? 3.2, p = el.pillar ?? 0.6;
  bag.add(G, box(x0, y - 0.6, z0, x1, y + 0.5, z1)); col.floor([x0, z0, x1, z1], y + 0.5);
  const nz = Math.max(1, Math.round((z1 - z0) / s));
  const zs = []; for (let k = 0; k <= nz; k++) zs.push(z0 + 0.5 + k * (z1 - z0 - 1) / nz);
  let xs = [], aisle = null;
  if (el.carved) {
    const cx = (x0 + x1) / 2, A = el.aisle ?? 5.6, nl = Math.max(1, Math.round((cx - A / 2 - x0 - 0.5) / s));
    for (let i = 0; i <= nl; i++) xs.push(x0 + 0.5 + i * (cx - A / 2 - x0 - 0.5) / nl);
    xs = [...xs, ...xs.map((x) => 2 * cx - x).reverse()];
    aisle = [nl, nl + 1];
  } else { const nx = Math.max(1, Math.round((x1 - x0) / s)); for (let i = 0; i <= nx; i++) xs.push(x0 + 0.5 + i * (x1 - x0 - 1) / nx); }
  const nx = xs.length - 1;
  for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) {
    const edge = i === 0 || k === 0 || i === nx || k === nz;
    if (el.simple && !edge) continue;
    const x = xs[i], z = zs[k];
    if (el.carved && !el.simple) carvedPillar(bag, x, z, y + 0.5, y + h, p);
    else {
      bag.add(G, box(x - p / 2, y + 0.5, z - p / 2, x + p / 2, y + h, z + p / 2));
      bag.add(G, box(x - p * 0.85, y + h - 0.6, z - p * 0.85, x + p * 0.85, y + h, z + p * 0.85));
    }
    col.rect([x - p / 2, z - p / 2, x + p / 2, z + p / 2], y, y + h);
  }
  bag.add(G, box(x0 - 0.6, y + h, z0 - 0.6, x1 + 0.6, y + h + 0.8, z1 + 0.6)); col.floor([x0, z0, x1, z1], y + h + 0.8);
  bag.add('stucco_cream', box(x0 - 0.3, y + h + 0.8, z0 - 0.3, x1 + 0.3, y + h + 1.3, z1 + 0.3));
  if (!el.carved || el.simple) return;
  const cx = (x0 + x1) / 2, yc = y + h;
  // the beams on the pillar lines, the ceiling between them painted: a lotus in every bay, the aisle's richer
  bag.add('stucco_cream', box(x0, yc - 0.03, z0, x1, yc - 0.01, z1));
  for (const x of xs) bag.add(G, box(x - 0.28, yc - 0.45, z0 + 0.2, x + 0.28, yc - 0.03, z1 - 0.2));
  for (const z of zs) bag.add(G, box(x0 + 0.2, yc - 0.32, z - 0.25, x1 - 0.2, yc - 0.03, z + 0.25));
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const bx = (xs[i] + xs[i + 1]) / 2, bz = (zs[k] + zs[k + 1]) / 2, main = i === aisle[0];
    const r = Math.min(xs[i + 1] - xs[i], zs[k + 1] - zs[k]) * (main ? 0.4 : 0.3), c = (i * 3 + k * 5) % PAINT.length;
    bag.add(main ? 'stucco_sky' : PAINT[(c + 1) % PAINT.length], box(xs[i] + 0.3, yc - 0.045, zs[k] + 0.27, xs[i + 1] - 0.3, yc - 0.035, zs[k + 1] - 0.27));
    bag.add(main ? 'stucco_rose' : PAINT[c], disc(r, yc - 0.06, 16, bx, bz, false));
    bag.add(main ? 'stucco_saffron' : 'stucco_cream', disc(r * 0.62, yc - 0.075, 16, bx, bz, false));
    bag.add(main ? 'gilt_bronze' : PAINT[(c + 2) % PAINT.length], disc(r * 0.25, yc - 0.09, 12, bx, bz, false));
    if (main) for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; bag.add('stucco_leaf', disc(r * 0.16, yc - 0.075, 8, bx + Math.cos(a) * r * 0.82, bz + Math.sin(a) * r * 0.82, false)); }
  }
  // the yalis on the aisle's two rows of pillars, facing across it; the lamps down the middle
  for (let k = 1; k < nz; k++) for (const [i, f] of [[aisle[0], 1], [aisle[1], -1]]) {
    const x = xs[i] + f * p / 2, z = zs[k];
    yali(bag, x, y + 0.5, z, f);
    col.rect([Math.min(x, x + f * 0.8), z - 0.35, Math.max(x, x + f * 0.8), z + 0.35], y, y + 3.4);
  }
  for (let k = 2; k < nz - 1; k += 3) {
    const lz = (zs[k] + zs[k + 1]) / 2, ly = y + 0.5;
    bag.add('bronze', lathe([[0.32, 0], [0.3, 0.08], [0.1, 0.16], [0.06, 0.5], [0.09, 0.56], [0.05, 0.62], [0.045, 1.35], [0.08, 1.4], [0.05, 1.45], [0.38, 1.5], [0.4, 1.56], [0.001, 1.56]], 12, null, cx, ly, lz));
    bag.add('bronze', lathe([[0.06, 0], [0.12, 0.12], [0.05, 0.3], [0.08, 0.38], [0.001, 0.5]], 8, null, cx, ly + 1.56, lz));
    for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; bag.add('lamp_glass', lathe([[0.001, 0], [0.03, 0.03], [0.001, 0.1]], 5, null, cx + Math.cos(a) * 0.34, ly + 1.56, lz + Math.sin(a) * 0.34)); }
    col.circle(cx, lz, 0.35, y, y + 2.1);
  }
  nataraja(bag, cx, y + 0.5, z0 + 2.4);
  col.rect([cx - 1.8, z0 + 0.8, cx + 1.8, z0 + 4], y, y + 5);
}

/** A Nayaka pillar from y0 to y1, section p: a moulded base, square blocks with relief panels
 *  between octagonal bands, a round neck and cushion, the plank, and the lotus-bud brackets (pushpapotika). */
function carvedPillar(bag, x, z, y0, y1, p) {
  const H = y1 - y0, sq = (a, b, w = p / 2) => bag.add(G, box(x - w, y0 + a, z - w, x + w, y0 + b, z + w));
  sq(0, 0.28, p * 0.68); sq(0.28, 0.4, p * 0.6);
  const blocks = [[0.4, H * 0.27], [H * 0.42, H * 0.56], [H * 0.68, H * 0.76]];
  for (const [a, b] of blocks) sq(a, b);
  for (let j = 0; j < 2; j++) {
    const a = blocks[j][1], b = blocks[j + 1][0], r = p * 0.52;
    bag.add(G, lathe([[r * 0.9, 0], [r, 0.06], [r * 0.86, 0.12], [r * 0.86, b - a - 0.12], [r, b - a - 0.06], [r * 0.9, b - a]], 8, null, x, y0 + a, z));
  }
  // relief panels on the two lower blocks, each face: a sunk field and a raised figure
  for (const [a, b] of blocks.slice(0, 2)) {
    const m = 0.08, t = 0.022, w = p / 2;
    for (const f of [0, 1, 2, 3]) {
      const u0 = -w + m, u1 = w - m, fy0 = y0 + a + m, fy1 = y0 + b - m;
      const R = (u, v, uu, vv) => f === 0 ? [x + u, z + w + v, x + uu, z + w + vv] : f === 1 ? [x + u, z - w - vv, x + uu, z - w - v] : f === 2 ? [x + w + v, z + u, x + w + vv, z + uu] : [x - w - vv, z + u, x - w - v, z + uu];
      // a raised moulded frame round the field (the field itself is the block's face)
      for (const [a0, b0, a1, b1] of [[u0, fy0, u1, fy0 + 0.04], [u0, fy1 - 0.04, u1, fy1], [u0, fy0, u0 + 0.04, fy1], [u1 - 0.04, fy0, u1, fy1]]) { const fq = R(a0, 0, a1, t); bag.add(G, box(Math.min(fq[0], fq[2]), b0, Math.min(fq[1], fq[3]), Math.max(fq[0], fq[2]), b1, Math.max(fq[1], fq[3]))); }
      const fw = (u1 - u0) * 0.22, q = R(-fw, 0, fw, t * 1.6);
      bag.add(G, box(q[0], fy0 + 0.04, q[1], q[2], fy0 + (fy1 - fy0) * 0.7, q[3]));
      const hq = R(-fw * 0.6, 0, fw * 0.6, t * 1.6);
      bag.add(G, box(hq[0], fy0 + (fy1 - fy0) * 0.72, hq[1], hq[2], fy0 + (fy1 - fy0) * 0.88, hq[3]));
      const aq = R(-fw * 2.2, 0, fw * 2.2, t * 1.3);
      bag.add(G, box(aq[0], fy0 + (fy1 - fy0) * 0.52, aq[1], aq[2], fy0 + (fy1 - fy0) * 0.6, aq[3]));
    }
  }
  // the capital
  const yc = y1 - 0.85;
  bag.add(G, lathe([[p * 0.36, 0], [p * 0.36, 0.12], [p * 0.5, 0.2], [p * 0.58, 0.32], [p * 0.5, 0.42], [p * 0.36, 0.46]], 12, null, x, yc, z));
  bag.add(G, box(x - p * 0.62, yc + 0.46, z - p * 0.62, x + p * 0.62, yc + 0.54, z + p * 0.62));
  bag.add(G, box(x - p * 0.42, yc + 0.54, z - p * 0.42, x + p * 0.42, y1 - 0.18, z + p * 0.42));
  bag.add(G, box(x - p * 1.05, y1 - 0.34, z - p * 0.2, x + p * 1.05, y1, z + p * 0.2));
  bag.add(G, box(x - p * 0.2, y1 - 0.34, z - p * 1.05, x + p * 0.2, y1, z + p * 1.05));
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) bag.add(G, lathe([[0.001, -0.3], [0.07, -0.24], [0.09, -0.12], [0.06, -0.02], [0.08, 0]], 8, null, x + dx * p * 0.92, y1 - 0.34, z + dz * p * 0.92));
}

/** A rearing yali against a pillar at (x, z), facing +x (f = 1) or −x: lion's body, elephant's trunk, a small rider below its paws. */
function yali(bag, x, y, z, f) {
  const parts = [];
  parts.push(box(0, 0, -0.34, 0.78, 0.5, 0.34));
  parts.push(box(-0.02, 0.5, -0.3, 0.06, 3.3, 0.3));
  for (const s of [-1, 1]) {
    parts.push(rod([0.28, 0.5, s * 0.17], [0.42, 1.0, s * 0.19], 0.11, 8));
    parts.push(rod([0.42, 1.0, s * 0.19], [0.24, 1.55, s * 0.18], 0.13, 8));
    parts.push(rod([0.3, 2.45, s * 0.2], [0.62, 2.35, s * 0.24], 0.08, 8));
    parts.push(rod([0.62, 2.35, s * 0.24], [0.7, 2.08, s * 0.26], 0.07, 8));
    parts.push(lathe([[0.001, 0], [0.06, 0.04], [0.001, 0.1]], 6, null, 0.53, 3.26, s * 0.12));
    parts.push(box(0.26, 2.95, s * 0.24 - 0.05, 0.36, 3.3, s * 0.24 + 0.05));   // the ears
  }
  parts.push(lathe([[0.001, 0], [0.2, 0.15], [0.29, 0.55], [0.27, 1.0], [0.17, 1.35], [0.001, 1.4]], 10, null, 0.24, 1.35, 0));
  parts.push(lathe([[0.001, 0], [0.2, 0.08], [0.27, 0.28], [0.22, 0.48], [0.001, 0.56]], 10, null, 0.36, 2.86, 0));
  parts.push(rod([0.58, 3.08, 0], [0.74, 2.88, 0], 0.08, 8));
  parts.push(rod([0.74, 2.88, 0], [0.78, 2.6, 0], 0.065, 8));
  parts.push(rod([0.78, 2.6, 0], [0.7, 2.44, 0], 0.05, 8));
  for (const s of [-1, 1]) parts.push(rod([0.56, 2.98, s * 0.1], [0.66, 2.82, s * 0.14], 0.025, 5));
  parts.push(rod([0.08, 1.5, 0], [0.04, 2.3, 0.05], 0.05, 6));
  // the rider: a small warrior standing under the paws
  parts.push(lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.4], [0.12, 0.62], [0.06, 0.72], [0.001, 0.72]], 8, null, 0.58, 0.5, 0));
  parts.push(lathe([[0.001, 0], [0.07, 0.04], [0.06, 0.13], [0.001, 0.15]], 8, null, 0.58, 1.22, 0));
  parts.push(rod([0.58, 1.08, 0.08], [0.66, 1.4, 0.16], 0.025, 5));
  for (const g of parts) bag.add(G, place(g, x, y, z, f > 0 ? 0 : Math.PI));
}

/** The dancing Shiva at (x, z) facing south (+z): a lotus pedestal on a block, the ring of fire,
 *  the figure on the dwarf with one leg raised across, four arms, the flying locks. Bronze. */
function nataraja(bag, x, y, z) {
  const B = 'bronze';
  bag.add(G, box(x - 1.6, y, z - 1.2, x + 1.6, y + 0.9, z + 1.2));
  bag.add(G, box(x - 1.75, y + 0.9, z - 1.3, x + 1.75, y + 1.02, z + 1.3));
  bag.add(B, lathe([[1.1, 0], [1.2, 0.12], [0.9, 0.3], [0.95, 0.38], [0.001, 0.4]], 16, null, x, y + 1.02, z));
  const yb = y + 1.42, cy = yb + 1.75, Rr = 1.55;
  for (const s of [-1, 1]) bag.add(B, rod([x + s * 1.2, yb, z - 0.2], [x + s * 1.2, cy - 0.4, z - 0.2], 0.05, 6));
  const ring = 28;
  for (let k = 0; k < ring; k++) {
    const a0 = -0.35 + k / ring * (Math.PI + 0.7), a1 = -0.35 + (k + 1) / ring * (Math.PI + 0.7);
    const p0 = [x + Math.cos(a0) * Rr, cy + Math.sin(a0) * Rr, z - 0.2], p1 = [x + Math.cos(a1) * Rr, cy + Math.sin(a1) * Rr, z - 0.2];
    if (p0[1] < yb || p1[1] < yb) continue;
    bag.add(B, rod(p0, p1, 0.05, 6));
    if (k % 2 === 0) { const t = [x + Math.cos(a0) * (Rr + 0.28), cy + Math.sin(a0) * (Rr + 0.28), z - 0.2]; bag.add(B, rod(p0, t, 0.035, 5)); }
  }
  bag.add(B, lathe([[0.001, 0], [0.18, 0.05], [0.2, 0.2], [0.001, 0.26]], 8, null, x + 0.1, yb, z + 0.15));
  const hip = [x, yb + 1.35, z];
  bag.add(B, rod([x - 0.12, yb + 0.25, z + 0.1], [x - 0.18, yb + 0.85, z], 0.08, 8));
  bag.add(B, rod([x - 0.18, yb + 0.85, z], [x - 0.08, hip[1], z], 0.09, 8));
  bag.add(B, rod([x + 0.08, hip[1], z], [x + 0.55, hip[1] - 0.15, z + 0.12], 0.09, 8));
  bag.add(B, rod([x + 0.55, hip[1] - 0.15, z + 0.12], [x + 0.95, hip[1] - 0.5, z + 0.12], 0.075, 8));
  bag.add(B, lathe([[0.12, 0], [0.16, 0.25], [0.2, 0.55], [0.13, 0.8], [0.001, 0.82]], 10, null, x, hip[1] - 0.05, z));
  const sh = hip[1] + 0.68, hd = sh + 0.22;
  bag.add(B, lathe([[0.001, 0], [0.14, 0.06], [0.15, 0.2], [0.11, 0.3], [0.1, 0.42], [0.04, 0.6], [0.001, 0.62]], 10, null, x, hd, z));
  for (const [ex, ey] of [[0.62, 0.28], [0.5, -0.05]]) { bag.add(B, rod([x + 0.16, sh, z], [x + 0.36, sh + ey * 0.5, z], 0.05, 6)); bag.add(B, rod([x + 0.36, sh + ey * 0.5, z], [x + ex, sh + ey, z + 0.05], 0.045, 6)); }
  bag.add(B, rod([x - 0.16, sh, z], [x - 0.42, sh + 0.12, z], 0.05, 6)); bag.add(B, rod([x - 0.42, sh + 0.12, z], [x - 0.6, sh + 0.34, z], 0.045, 6));
  bag.add(B, rod([x - 0.16, sh - 0.04, z + 0.05], [x + 0.25, sh - 0.25, z + 0.18], 0.045, 6)); bag.add(B, rod([x + 0.25, sh - 0.25, z + 0.18], [x + 0.6, sh - 0.4, z + 0.2], 0.04, 6));
  bag.add(B, lathe([[0.001, 0], [0.06, 0.03], [0.05, 0.14], [0.001, 0.16]], 6, null, x + 0.64, sh + 0.28, z + 0.05));
  bag.add('lamp_glass', lathe([[0.001, 0], [0.06, 0.04], [0.001, 0.18]], 6, null, x - 0.62, sh + 0.34, z));
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) { const a = (k / 5 - 0.5) * 0.9; bag.add(B, rod([x + s * 0.12, hd + 0.3, z - 0.05], [x + s * (0.25 + 0.75 * Math.cos(a)), hd + 0.3 + 0.75 * Math.sin(a), z - 0.08], 0.022, 4)); }
}

/** vimana: the gilded tower over a sanctum { c, s (side), h, y }: a square shrine, tiers, an octagonal dome. */
function vimana(el, { bag, col }) {
  const [x, z] = el.c, s = el.s, h = el.h, y = el.y ?? 0, b = h * 0.32;
  bag.add(G, box(x - s / 2, y, z - s / 2, x + s / 2, y + b, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h);
  const n = 3, th = (h - b) * 0.5 / n;
  for (let i = 0; i < n; i++) { const w = s * (0.92 - i * 0.18), yy = y + b + i * th; bag.add('gilt_bronze', frustum([x - w / 2, z - w / 2, x + w / 2, z + w / 2], yy, yy + th, s * 0.05, s * 0.05, s * 0.05, s * 0.05)); }
  const yd = y + b + n * th, r = s * 0.28;
  bag.add('gilt_bronze', lathe([[r * 0.8, 0], [r * 1.1, r * 0.3], [r * 1.15, r * 0.7], [r * 0.9, r * 1.2], [r * 0.3, r * 1.5], [0.001, r * 1.55]], 8, null, x, yd, z));
  kalasha(bag, x, yd + r * 1.5, z, 1.2);
}

/** A painted panel on a wall face: the field at (px, pz) on the face (u along it, n out of it), from y, w × h:
 *  a red ground in a cream frame, an arched shrine-frame in ochre, a couple seated in it under a flowering tree
 *  (the Nayaka murals: "a vivid red background", black line, white, green and ochre). */
function mural(bag, [px, pz], [ux, uz], [nx, nz], y, w, h, seed = 0) {
  const P = (u, v, d) => [px + ux * u + nx * d, y + v, pz + uz * u + nz * d];
  const R = (mat, u0, v0, u1, v1, d0, d1) => { const a = P(u0, v0, d0), b = P(u1, v1, d1); bag.add(mat, box(Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2]))); };
  const hw = w / 2;
  R('stucco_cream', -hw - 0.08, -0.08, hw + 0.08, h + 0.08, 0, 0.02);
  R('stucco_red', -hw, 0, hw, h, 0.02, 0.035);
  R('paint_ochre', -hw * 0.8, h * 0.08, -hw * 0.72, h * 0.78, 0.035, 0.05); R('paint_ochre', hw * 0.72, h * 0.08, hw * 0.8, h * 0.78, 0.035, 0.05);
  R('paint_ochre', -hw * 0.82, h * 0.78, hw * 0.82, h * 0.84, 0.035, 0.05);
  R('stucco_leaf', -hw * 0.25, h * 0.84, hw * 0.25, h * 0.97, 0.035, 0.045);                 // the tree's crown over the shrine
  const robes = ['stucco_saffron', 'stucco_leaf', 'stucco_sky', 'stucco_cream', 'stucco_rose'];
  for (const [k, sg] of [[0, -1], [1, 1]]) {
    const cu = sg * hw * 0.3, fh = h * 0.6, c = robes[(seed + k * 2) % robes.length];
    R(c, cu - fh * 0.22, h * 0.1, cu + fh * 0.22, h * 0.1 + fh * 0.28, 0.035, 0.055);           // the seated legs
    R(c, cu - fh * 0.12, h * 0.1 + fh * 0.28, cu + fh * 0.12, h * 0.1 + fh * 0.72, 0.035, 0.055);  // the body
    R(k ? 'paint_ochre' : 'stucco_sky', cu - fh * 0.08, h * 0.1 + fh * 0.74, cu + fh * 0.08, h * 0.1 + fh * 0.9, 0.035, 0.06);   // the heads (his blue)
    R('gilt_bronze', cu - fh * 0.06, h * 0.1 + fh * 0.9, cu + fh * 0.06, h * 0.1 + fh * 1.02, 0.035, 0.058);                   // the crowns
  }
}

/**
 * tank: a stepped temple tank { rect, y, depth, water } in its cloister: steps of a quarter-metre
 * down all four sides to the water; the corridor round it one bay deep on a granite plinth, a row
 * of carved Nayaka pillars on the tank side, on the outer side a wall painted inside with murals
 * in its bays and an opening in the middle of each side; beams from pillars to wall, painted
 * ceiling panels with lotus medallions, the flat roof with its cream parapet.
 */
function tank(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, dep = el.depth ?? 4, st = 0.25, steps = Math.round(dep / st), tr = 0.35, D = el.cloister ?? 6, h = el.h ?? 5;
  for (let i = 0; i < steps; i++) {
    const m = tr * i, ya = y - i * st, r = [x0 + m, z0 + m, x1 - m, z1 - m], ri = [r[0] + tr, r[1] + tr, r[2] - tr, r[3] - tr];
    for (const q of [[r[0], r[1], r[2], ri[1]], [r[0], ri[3], r[2], r[3]], [r[0], ri[1], ri[0], ri[3]], [ri[2], ri[1], r[2], ri[3]]]) { bag.add(G, box(q[0], ya - st, q[1], q[2], ya, q[3])); col.floor(q, ya); }
  }
  const mi = tr * steps;
  bag.add(G, box(x0 + mi, y - dep - 0.4, z0 + mi, x1 - mi, y - dep, z1 - mi));
  STYLES.qing.elements.water_rect({ rect: [x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], y: y - (el.water ?? 2.2) }, ctx);
  // the cloister: plinth, roof, the inner row of pillars, the outer wall with its four openings
  const O = [x0 - D, z0 - D, x1 + D, z1 + D], yf = y + 0.5, yt = y + h, T = 0.8, gap = 3.2, p = 0.6;
  for (const q of [[O[0], O[1], O[2], z0], [O[0], z1, O[2], O[3]], [O[0], z0, x0, z1], [x1, z0, O[2], z1]]) {
    bag.add(G, box(q[0], y - 0.6, q[1], q[2], yf, q[3])); col.floor(q, yf);
    bag.add(G, box(q[0] - (q[0] === O[0] ? 0.4 : 0), yt, q[1] - (q[1] === O[1] ? 0.4 : 0), q[2] + (q[2] === O[2] ? 0.4 : 0), yt + 0.7, q[3] + (q[3] === O[3] ? 0.4 : 0))); col.floor(q, yt + 0.7);
  }
  // the parapet round the roof's outer and inner edges
  for (const [a, b] of [[[O[0] - 0.4, O[1] - 0.4], [O[2] + 0.4, O[1] - 0.1]], [[O[0] - 0.4, O[3] + 0.1], [O[2] + 0.4, O[3] + 0.4]], [[O[0] - 0.4, O[1] - 0.1], [O[0] - 0.1, O[3] + 0.1]], [[O[2] + 0.1, O[1] - 0.1], [O[2] + 0.4, O[3] + 0.1]],
    [[x0, z0 - 0.3], [x1, z0]], [[x0, z1], [x1, z1 + 0.3]], [[x0 - 0.3, z0], [x0, z1]], [[x1, z0], [x1 + 0.3, z1]]]) bag.add('stucco_cream', box(a[0], yt + 0.7, a[1], b[0], yt + 1.3, b[1]));
  const sides = [
    { a: [x0, z0], b: [x1, z0], n: [0, -1], len: x1 - x0 }, { a: [x1, z1], b: [x0, z1], n: [0, 1], len: x1 - x0 },
    { a: [x0, z1], b: [x0, z0], n: [-1, 0], len: z1 - z0 }, { a: [x1, z0], b: [x1, z1], n: [1, 0], len: z1 - z0 },
  ];
  let seed = 0;
  for (const S of sides) {
    const [ax, az] = S.a, ux = (S.b[0] - ax) / S.len, uz = (S.b[1] - az) / S.len, [nx, nz] = S.n;
    // pillars on the tank side, from corner to corner (the corners' pillars belong to the long sides)
    const long = Math.abs(ux) > 0.5, ext = long ? D : 0, nb = Math.max(2, Math.round((S.len + 2 * ext) / 3.4));
    const at = (u, d) => [ax + ux * u + nx * d, az + uz * u + nz * d];
    for (let k = 0; k <= nb; k++) {
      const u = -ext + 0.5 + (S.len + 2 * ext - 1) * k / nb;
      if (!long && (k === 0 || k === nb)) continue;
      const [px, pz] = at(u, 0.6);
      carvedPillar(bag, px, pz, yf, yt, p); col.rect([px - p / 2, pz - p / 2, px + p / 2, pz + p / 2], y, yt);
    }
    // the beams over the pillars, along the side and across to the wall
    { const a = at(-ext, 0.3), b = at(S.len + ext, 0.9); bag.add(G, box(Math.min(a[0], b[0]), yt - 0.45, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yt, Math.max(a[1], b[1]))); }
    // the outer wall, its opening in the middle; murals in the bays inside
    const wa = long ? -D : T, wb = long ? S.len + D : S.len - T, mid = S.len / 2;
    for (const [u0, u1] of [[wa, mid - gap / 2], [mid + gap / 2, wb]]) {
      const a = at(u0, D - T), b = at(u1, D);
      const r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
      bag.add(G, box(r[0], yf, r[1], r[2], yt, r[3])); col.rect(r, y, yt);
      const nb2 = Math.floor((u1 - u0) / 3.4);
      for (let k = 0; k < nb2; k++) { const u = u0 + (u1 - u0) * (k + 0.5) / nb2, q = at(u, D - T); mural(bag, [q[0], q[1]], [-ux, -uz], [-nx, -nz], yf + 1.0, 2.2, 2.4, seed++); }
    }
    // the ceiling: a painted panel and a lotus in each bay
    for (let k = 0; k < Math.round(S.len / 3.4); k++) {
      const u0 = S.len * k / Math.round(S.len / 3.4), u1 = S.len * (k + 1) / Math.round(S.len / 3.4), a = at(u0 + 0.2, 1.0), b = at(u1 - 0.2, D - T - 0.2), c = at((u0 + u1) / 2, (1 + D - T) / 2);
      bag.add(PAINT[(k + seed) % PAINT.length], box(Math.min(a[0], b[0]), yt - 0.06, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yt - 0.035, Math.max(a[1], b[1])));
      bag.add('stucco_rose', disc(1.0, yt - 0.08, 16, c[0], c[1], false)); bag.add('stucco_cream', disc(0.6, yt - 0.1, 16, c[0], c[1], false)); bag.add('gilt_bronze', disc(0.22, yt - 0.12, 10, c[0], c[1], false));
    }
  }
}

/**
 * ashta_shakti: the hall of the eight goddesses, the entrance from the east to Meenakshi's shrine,
 * built by two consorts of Tirumala Nayaka { rect (its nave runs along x, the entrance at the east),
 * y, h }: the tall entrance in the east, a nave between two rows of pillars against each of which
 * one of the eight Shaktis stands carved and painted, four a side, Ganesha and Murugan at the west
 * end; a barrel-vaulted ceiling painted in panels; aisles whose walls carry painted reliefs of the
 * god's sacred sports (Tiruvilaiyadal); the flat roof outside with a cream parapet.
 */
function ashtaShakti(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 7.6, yf = y + 0.5, cz = (z0 + z1) / 2, W = z1 - z0, nave = el.nave ?? 7, za = cz - nave / 2, zb = cz + nave / 2, T = 0.9;
  bag.add(G, box(x0, y - 0.6, z0, x1, yf, z1)); col.floor([x0, z0, x1, z1], yf);
  // the walls: north, south, the west end with its doorway on; the east end open between the jambs
  for (const r of [[x0, z0, x1, z0 + T], [x0, z1 - T, x1, z1]]) { bag.add(G, box(r[0], yf, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }
  for (const r of [[x0, z0 + T, x0 + T, cz - 1.6], [x0, cz + 1.6, x0 + T, z1 - T]]) { bag.add(G, box(r[0], yf, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }
  bag.add(G, box(x0, y + 3.6, cz - 1.6, x0 + T, y + h, cz + 1.6));
  for (const r of [[x1 - T, z0 + T, x1, cz - 2.75], [x1 - T, cz + 2.75, x1, z1 - T]]) { bag.add(G, box(r[0], yf, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }
  // the entrance's frame (25 ft high, 18 ft broad), a painted panel of the wedding over it
  bag.add('stucco_cream', box(x1, y + h - 0.6, cz - 3.4, x1 + 0.35, y + h, cz + 3.4));
  for (const s2 of [-1, 1]) bag.add(G, box(x1, yf, cz + s2 * 2.75 - (s2 > 0 ? 0 : 0.5), x1 + 0.3, y + h - 0.6, cz + s2 * 2.75 + (s2 > 0 ? 0.5 : 0)));
  mural(bag, [x1 + 0.35, cz], [0, -1], [1, 0], y + h - 0.5 + 0.1, 5.2, 1.6, 3);
  bag.add(G, box(x1 - T, y + h - 0.01, z0, x1 + 0.4, y + h + 0.8, z1));
  // the roof and its parapet
  bag.add(G, box(x0 - 0.3, y + h, z0 - 0.3, x1, y + h + 0.8, z1 + 0.3)); col.floor([x0, z0, x1, z1], y + h + 0.8);
  for (const r of [[x0 - 0.3, z0 - 0.3, x1 + 0.4, z0], [x0 - 0.3, z1, x1 + 0.4, z1 + 0.3], [x0 - 0.3, z0, x0, z1], [x1 + 0.1, z0, x1 + 0.4, z1]]) bag.add('stucco_cream', box(r[0], y + h + 0.8, r[1], r[2], y + h + 1.4, r[3]));
  // the nave's pillars, the goddesses against them facing across the nave
  const n = 5, xs = []; for (let i = 0; i < n; i++) xs.push(x0 + 3 + (x1 - x0 - 6) * i / (n - 1));
  const yv = y + h - 2.6;                       // the vault's springing
  const robes = ['stucco_rose', 'stucco_leaf', 'stucco_sky', 'stucco_saffron'];
  xs.forEach((x, i) => {
    for (const [z, f] of [[za, 1], [zb, -1]]) {
      carvedPillar(bag, x, z, yf, yv, 0.7); col.rect([x - 0.35, z - 0.35, x + 0.35, z + 0.35], y, yv);
      if (i === 0) continue;                    // the four goddesses a side stand at the inner pillars
      const fz = z + f * 0.6, k = (i * 2 + (f > 0 ? 0 : 1)) % 4;
      bag.add(G, box(x - 0.45, yf, fz - 0.3, x + 0.45, yf + 0.35, fz + 0.3));
      shakti(bag, x, yf + 0.35, fz, f, robes[k]);
      col.rect([x - 0.45, Math.min(z, fz + 0.3 * f), x + 0.45, Math.max(z, fz + 0.3 * f)], y, yf + 2.6);
    }
  });
  // Ganesha and Murugan in niches either side of the west doorway
  for (const [s2, kind] of [[-1, 'g'], [1, 'm']]) {
    const z = cz + s2 * 2.8; bag.add('opening', box(x0 + T, yf + 0.8, z - 0.8, x0 + T + 0.02, yf + 3.4, z + 0.8)); bag.add(G, box(x0 + T, yf, z - 0.9, x0 + T + 0.5, yf + 0.8, z + 0.9));
    if (kind === 'g') { bag.add(G, lathe([[0.001, 0], [0.5, 0.05], [0.55, 0.5], [0.4, 0.95], [0.001, 1.0]], 10, null, x0 + T + 0.3, yf + 0.8, z)); bag.add(G, lathe([[0.001, 0], [0.3, 0.08], [0.32, 0.35], [0.12, 0.55], [0.001, 0.58]], 10, null, x0 + T + 0.3, yf + 1.75, z)); bag.add(G, rod([x0 + T + 0.55, yf + 2.0, z], [x0 + T + 0.7, yf + 1.4, z + 0.15], 0.08, 6)); bag.add('gilt_bronze', lathe([[0.18, 0], [0.12, 0.3], [0.001, 0.45]], 8, null, x0 + T + 0.3, yf + 2.3, z)); }
    else shakti(bag, x0 + T + 0.3, yf + 0.8, z, 0, 'stucco_saffron', true);
  }
  // the vault over the nave: in each bay painted bands between the ribs, a cream band at the crown
  const R = nave / 2, seg = 14, VP = (x, a) => [x, yv + Math.sin(a) * R * 0.75, cz - Math.cos(a) * R];
  const bays = [x0 + T, ...xs.slice(1, -1), x1 - T];
  for (let i = 0; i + 1 < bays.length; i++) for (let k = 0; k < seg; k++) {
    const a0 = Math.PI * k / seg, a1 = Math.PI * (k + 1) / seg, xa = bays[i], xb = bays[i + 1];
    bag.add(k === 6 || k === 7 ? 'stucco_cream' : PAINT[(i * 3 + Math.min(k, seg - 1 - k)) % PAINT.length], vaultTris([VP(xa, a0), VP(xb, a0), VP(xb, a1), VP(xa, a0), VP(xb, a1), VP(xa, a1)]));
  }
  for (const xr of xs.slice(1, -1)) { const rib = []; for (let k = 0; k <= seg; k++) { const a = Math.PI * k / seg; rib.push([xr, yv + Math.sin(a) * R * 0.75 - 0.08, cz - Math.cos(a) * (R - 0.08)]); } for (let k = 0; k < seg; k++) bag.add('stucco_saffron', rod(rib[k], rib[k + 1], 0.09, 5)); }
  // the beams carrying the vault over the pillar rows, the aisles' flat ceilings
  for (const z of [za, zb]) bag.add(G, box(x0 + T, yv - 0.5, z - 0.45, x1 - T, yv, z + 0.45));
  for (const [q0, q1] of [[z0 + T, za - 0.45], [zb + 0.45, z1 - T]]) bag.add('stucco_cream', box(x0 + T, yv - 0.08, q0, x1 - T, yv, q1));
  bag.add(G, box(x0 + T, yv, z0 + T, x1 - T, y + h, za - 0.45 + 0.001 - 0.001)); bag.add(G, box(x0 + T, yv, zb + 0.45, x1 - T, y + h, z1 - T));
  // the painted reliefs of the sacred sports along the aisles' walls
  let sd = 1;
  for (const [zw, nz2] of [[z0 + T, 1], [z1 - T, -1]]) for (let x = x0 + 3.3; x < x1 - 2.6; x += 3.2) mural(bag, [x, zw], [nz2 > 0 ? 1 : -1, 0], [0, nz2], yf + 1.4, 2.4, 2.6, sd++);
}
/** A goddess standing on her pedestal at (x, y, z), facing +z (f = 1) or −z (f = −1) or +x (f = 0): the
 *  pleated garment, the slender body, four arms, the tall crown; carved, the garment painted. */
function shakti(bag, x, y, z, f, robe, small = false) {
  const s = small ? 0.75 : 1, dir = f === 0 ? [1, 0] : [0, f], ux = -dir[1], uz = dir[0];
  const Pp = (u, v, d) => [x + ux * u + dir[0] * d, y + v * s, z + uz * u + dir[1] * d];
  bag.add(robe, lathe([[0.32 * s, 0], [0.3 * s, 0.25 * s], [0.24 * s, 0.75 * s], [0.2 * s, 1.0 * s], [0.001, 1.02 * s]], 10, null, x, y, z));
  bag.add(G, lathe([[0.2 * s, 0], [0.16 * s, 0.25 * s], [0.2 * s, 0.45 * s], [0.13 * s, 0.6 * s], [0.06 * s, 0.66 * s], [0.001, 0.66 * s]], 10, null, x, y + 1.0 * s, z));
  bag.add(G, lathe([[0.001, 0], [0.11 * s, 0.04 * s], [0.12 * s, 0.16 * s], [0.08 * s, 0.24 * s], [0.001, 0.25 * s]], 10, null, x, y + 1.66 * s, z));
  bag.add('gilt_bronze', lathe([[0.11 * s, 0], [0.09 * s, 0.2 * s], [0.04 * s, 0.4 * s], [0.001, 0.48 * s]], 8, null, x, y + 1.86 * s, z));
  bag.add('gilt_bronze', lathe([[0.215 * s, 0], [0.22 * s, 0.05 * s], [0.2 * s, 0.1 * s]], 10, null, x, y + 0.98 * s, z));
  for (const su of [-1, 1]) {
    bag.add(G, rod(Pp(su * 0.18, 1.55, 0), Pp(su * 0.3, 1.25, 0.1), 0.045 * s, 5)); bag.add(G, rod(Pp(su * 0.3, 1.25, 0.1), Pp(su * 0.22, 1.05, 0.25), 0.04 * s, 5));
    bag.add(G, rod(Pp(su * 0.18, 1.55, -0.02), Pp(su * 0.36, 1.7, -0.05), 0.04 * s, 5)); bag.add(G, rod(Pp(su * 0.36, 1.7, -0.05), Pp(su * 0.38, 1.98, -0.05), 0.035 * s, 5));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.04 * s, 0.05 * s], [0.001, 0.14 * s]], 6, null, ...Pp(su * 0.38, 1.98, -0.05)));
  }
}

/**
 * elephant: a temple elephant { at: [x, z], y, rot (it faces −z turned by rot), seed, chain }: the shared
 * Asian elephant (src/objects/animals.js) with short tushes, dressed as a temple's — a red caparison with
 * gilt borders over the back, Shiva's three stripes of holy ash and a red dot of kumkum on the brow (the
 * Meenakshi–Sundareswarar temple is Shaiva) [inferred], a brass bell on a rope round the neck, brass rings at
 * the ankles (docs/settlements/madurai.md §10). Tied by a chain at the left forefoot to a stone.
 */
function elephant(el, ctx) {
  const { bag } = ctx, [ex, ez] = el.at, y = el.y ?? 0, a = el.rot ?? 0;
  STYLES.life.elements.animal({ ...el, t: 'animal', kind: 'elephant', gear: true, cloth: el.cloth ?? 'cloth_red', tusks: el.tusks ?? 'short', marks: el.marks ?? 'tripundra', bell: el.bell ?? true, anklets: el.anklets ?? true }, ctx);
  if (el.chain !== false) {
    // from the left forefoot's ankle (local −0.45, −0.7: the elephant's local frame turned by rot) out sideways to the stone
    const c = Math.cos(a), s = Math.sin(a), L = (x, z) => [ex + c * x + s * z, ez - s * x + c * z];
    const f = L(-0.45 - 0.2, -0.7), t = L(-2.2, -0.9);
    bag.add('iron', rod([f[0], y + 0.2, f[1]], [t[0], y + 0.35, t[1]], 0.03, 5));
    bag.add('granite_tamil', box(t[0] - 0.15, y, t[1] - 0.15, t[0] + 0.15, y + 0.5, t[1] + 0.15));
  }
}

/**
 * ther: the temple car, one of the two great cars Tirumala Nayaka had built and drawn round the
 * Masi streets at the Chithirai festival { at: [x, z], dir ('e' | 'w' | 'n' | 's': the way it is drawn),
 * rope (length) }: a carved wooden body on four solid wheels — tiers of panels, a frieze of small
 * figures, a projecting seat platform with posts for the god — two wooden horses springing from its
 * front with the charioteer between; over it the tall bamboo frame dressed in bands of coloured
 * cloth, tier on tier, under a dome, the gilt pot and a parasol; the thick ropes run out ahead.
 */
function ther(el, { bag, col }) {
  const [cx, cz] = el.at, d = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] }[el.dir || 'w'], ux = -d[1], uz = d[0];
  const P = (a, b) => [cx + d[0] * a + ux * b, cz + d[1] * a + uz * b];   // a forward, b to the left
  const B = (m, a0, a1, b0, b1, y0, y1) => { const p = P(a0, b0), q = P(a1, b1); bag.add(m, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
  const L = 7.2, Wd = 6.4, yb = 1.1;
  // the wheels: solid timber discs with iron tyres and hubs
  for (const a of [-2.3, 2.3]) for (const sb of [-1, 1]) {
    const [wx, wz] = P(a, sb * (Wd / 2 + 0.35)), g = lathe([[0.001, -0.3], [1.35, -0.3], [1.42, -0.22], [1.42, 0.22], [1.35, 0.3], [0.001, 0.3]], 20, null, 0, 0, 0), hub = lathe([[0.001, -0.42], [0.32, -0.42], [0.32, 0.42], [0.001, 0.42]], 10, null, 0, 0, 0);
    for (const [m, gg] of [['wood_dark', g], ['iron', hub]]) { gg.rotateX(Math.PI / 2); if (d[1] !== 0) gg.rotateY(Math.PI / 2); gg.translate(wx, 1.42, wz); bag.add(m, gg); }
    col.circle(wx, wz, 0.5, 0, 2.8);
  }
  // the carved body in tiers, stepping out as it rises, a frieze of little figures on each tier
  const tiers = [[yb, yb + 1.0, 0], [yb + 1.0, yb + 1.9, 0.35], [yb + 1.9, yb + 2.7, 0.7], [yb + 2.7, yb + 3.1, 1.0]];
  for (const [y0, y1, o] of tiers) {
    B('wood_dark', -L / 2 - o, L / 2 + o, -Wd / 2 - o, Wd / 2 + o, y0, y1 - 0.12); B('timber', -L / 2 - o - 0.1, L / 2 + o + 0.1, -Wd / 2 - o - 0.1, Wd / 2 + o + 0.1, y1 - 0.12, y1);
    const fh = (y1 - y0) * 0.6, k = fh / 1.1;
    if (fh > 0.3) for (const [len, side] of [[L + 2 * o, 'ab'], [Wd + 2 * o, 'ba']]) for (let i = 0; i < Math.floor(len / 0.6); i++) for (const sg of [-1, 1]) {
      const t = -len / 2 + (i + 0.5) * len / Math.floor(len / 0.6), [px, pz] = side === 'ab' ? P(t, sg * (Wd / 2 + o + 0.06)) : P(sg * (L / 2 + o + 0.06), t);
      bag.add('wood_painted', lathe([[0.13 * k, 0], [0.1 * k, 0.5 * k], [0.07 * k, 0.75 * k], [0.09 * k, 0.86 * k], [0.001, 1.1 * k]], 5, null, px, y0 + 0.08, pz));
    }
  }
  col.rect([...[P(-L / 2 - 1, -Wd / 2 - 1), P(L / 2 + 1, Wd / 2 + 1)].reduce((r, p) => [Math.min(r[0], p[0]), Math.min(r[1], p[1]), Math.max(r[2], p[0]), Math.max(r[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity])], 0, 9);
  // the god's platform: posts at the corners and the middle of the sides, a cloth ceiling over it
  const yp = yb + 3.1, hp = 2.6, o = 0.9;
  for (const [a, b] of [[-L / 2 - o + 0.3, -Wd / 2 - o + 0.3], [L / 2 + o - 0.3, -Wd / 2 - o + 0.3], [-L / 2 - o + 0.3, Wd / 2 + o - 0.3], [L / 2 + o - 0.3, Wd / 2 + o - 0.3], [0, -Wd / 2 - o + 0.3], [0, Wd / 2 + o - 0.3]]) { const [px, pz] = P(a, b); bag.add('gilt_bronze', lathe([[0.12, 0], [0.09, 0.2], [0.09, hp - 0.2], [0.14, hp]], 8, null, px, yp, pz)); }
  B('cloth_white', -L / 2 - o, L / 2 + o, -Wd / 2 - o, Wd / 2 + o, yp + hp, yp + hp + 0.2);
  // the festival images of the god and goddess on their seat, garlanded, under the canopy
  B('wood_painted', -1.2, 1.2, -1.6, 1.6, yp, yp + 0.6); B('cloth_red', -1.25, 1.25, -1.65, 1.65, yp + 0.45, yp + 0.62);
  for (const sb of [-0.55, 0.55]) { const [gx, gz] = P(0, sb); bag.add('gilt_bronze', lathe([[0.36, 0], [0.32, 0.25], [0.2, 0.4], [0.24, 0.8], [0.12, 1.0], [0.001, 1.02]], 10, null, gx, yp + 0.62, gz)); bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.05], [0.12, 0.2], [0.07, 0.42], [0.001, 0.55]], 8, null, gx, yp + 1.62, gz)); bag.add('stucco_saffron', lathe([[0.3, 0], [0.33, 0.08], [0.28, 0.14]], 10, null, gx, yp + 1.3, gz)); }
  for (let i = 0; i < 24; i++) { const t = -L / 2 - o + (L + 2 * o) * i / 24, c = ['cloth_red', 'cloth_ochre', 'cloth_white'][i % 3]; B(c, t, t + (L + 2 * o) / 24, -Wd / 2 - o - 0.05, -Wd / 2 - o, yp + hp - 0.6, yp + hp + 0.2); B(c, t, t + (L + 2 * o) / 24, Wd / 2 + o, Wd / 2 + o + 0.05, yp + hp - 0.6, yp + hp + 0.2); }
  // the cloth tower: tiers of coloured bands drawing in, a dome, the gilt pot and a parasol
  const cloths = ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_red', 'cloth_black', 'cloth_white', 'cloth_ochre', 'cloth_red'];
  let yy = yp + hp + 0.2, wa = L / 2 + o - 0.2, wb = Wd / 2 + o - 0.2;
  cloths.forEach((m, i) => {
    const hh = 0.85, sh = 0.82 + 0.02 * Math.sin(i), r = [...P(-wa, -wb), ...P(wa, wb)], q = [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])], dx = (q[2] - q[0]) * (1 - sh) / 2, dz = (q[3] - q[1]) * (1 - sh) / 2;
    bag.add(m, frustum(q, yy, yy + hh, dx, dx, dz, dz, { noBottom: i > 0, noTop: i < cloths.length - 1 }));
    bag.add(i % 2 ? 'cloth_ochre' : 'cloth_white', box(q[0] + dx - 0.06, yy + hh - 0.08, q[1] + dz - 0.06, q[2] - dx + 0.06, yy + hh + 0.04, q[3] - dz + 0.06));
    yy += hh; wa *= sh; wb *= sh;
  });
  const [tx, tz] = P(0, 0), rr = Math.min(wa, wb);
  bag.add('cloth_red', lathe([[rr * 1.05, 0], [rr * 1.0, rr * 0.4], [rr * 0.7, rr * 0.9], [rr * 0.3, rr * 1.15], [0.001, rr * 1.2]], 16, null, tx, yy, tz));
  kalasha(bag, tx, yy + rr * 1.15, tz, 0.9);
  bag.add('cloth_white', lathe([[0.001, 0], [0.9, 0.05], [0.85, 0.2], [0.001, 0.55]], 12, null, tx, yy + rr * 1.15 + 1.5, tz));
  bag.add('timber', rod([tx, yy + rr * 1.15 + 1.2, tz], [tx, yy + rr * 1.15 + 1.6, tz], 0.04, 5));
  // the two wooden horses springing from the front, the charioteer between them
  for (const sb of [-1.3, 1.3]) {
    const [hx, hz] = P(L / 2 + 1.2, sb), ax = d[0], az = d[1];
    bag.add('stucco_cream', rod([hx - ax * 0.8, yb + 2.0, hz - az * 0.8], [hx + ax * 0.6, yb + 2.4, hz + az * 0.6], 0.38, 10));
    bag.add('stucco_cream', rod([hx + ax * 0.5, yb + 2.5, hz + az * 0.5], [hx + ax * 0.9, yb + 3.4, hz + az * 0.9], 0.2, 8));
    bag.add('stucco_cream', rod([hx + ax * 0.9, yb + 3.4, hz + az * 0.9], [hx + ax * 1.35, yb + 3.2, hz + az * 1.35], 0.15, 8));
    for (const [fa, ya] of [[0.5, 1.6], [0.7, 1.7]]) for (const sl of [-0.15, 0.15]) bag.add('stucco_cream', rod([hx + ax * fa - az * sl, yb + 2.2, hz + az * fa + ax * sl], [hx + ax * (fa + 0.5) - az * sl, yb + ya + 0.6, hz + az * (fa + 0.5) + ax * sl], 0.07, 6));
    for (const sl of [-0.15, 0.15]) bag.add('stucco_cream', rod([hx - ax * 0.6 - az * sl, yb + 2.0, hz - az * 0.6 + ax * sl], [hx - ax * 0.7 - az * sl, yb + 1.0, hz - az * 0.7 + ax * sl], 0.08, 6));
    bag.add('cloth_red', rod([hx - ax * 0.3, yb + 2.42, hz - az * 0.3], [hx + ax * 0.3, yb + 2.48, hz + az * 0.3], 0.4, 10));
  }
  { const [qx, qz] = P(L / 2 + 0.8, 0); bag.add('stucco_saffron', lathe([[0.3, 0], [0.25, 0.7], [0.18, 1.0], [0.001, 1.05]], 8, null, qx, yb + 2.7, qz)); bag.add('paint_ochre', lathe([[0.001, 0], [0.13, 0.05], [0.14, 0.2], [0.001, 0.28]], 8, null, qx, yb + 3.75, qz)); bag.add('gilt_bronze', lathe([[0.12, 0], [0.06, 0.25], [0.001, 0.32]], 6, null, qx, yb + 4.0, qz)); }
  // the ropes, from the front of the body out along the street, slack on the ground
  for (const sb of [-2.2, 2.2]) { const [r0x, r0z] = P(L / 2, sb), [r1x, r1z] = P(L / 2 + 4, sb), [r2x, r2z] = P(L / 2 + (el.rope ?? 34), sb); bag.add('reed_mat', rod([r0x, yb + 0.6, r0z], [r1x, 0.12, r1z], 0.08, 6)); bag.add('reed_mat', rod([r1x, 0.12, r1z], [r2x, 0.1, r2z], 0.08, 6)); }
}


/**
 * pudhu_mandapa: Tirumala Nayaka's new hall (1628–1635; "a height of 25 feet, length of 330 feet and breadth
 * of 105 feet … built on a pedestal", "124 pillars", "the pillars on the sides of central passage …
 * decorated with carvings of 14 rulers and their consorts of Nayaka dynasty" — maduraitourism) { rect (long
 * along x), h, plinth }: the moulded pedestal with a flight at either end, four rows of 31 carved pillars,
 * the passage on the long axis wider than the side aisles, the beams and the flat roof with its parapet;
 * against seven pillars on each side of the passage a Nayaka king with joined hands in his tall cap, his
 * queen beside him, carved in the round.
 */
function pudhu(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, ph = el.plinth ?? 1.2, h = el.h ?? 7.6, y = ph, cz = (z0 + z1) / 2, p = 0.75;
  bag.add(G, box(x0, -0.4, z0, x1, ph, z1)); col.rect([x0, z0, x1, z1], 0, ph); col.floor([x0, z0, x1, z1], ph);
  for (const [f, o] of [[0.15, 0.25], [0.5, 0.12], [0.85, 0.2]]) for (const zz of [[z0 - o, z0], [z1, z1 + o]]) bag.add(G, box(x0 - o, ph * f - 0.1, zz[0], x1 + o, ph * f + 0.1, zz[1]));
  for (const [f, o] of [[0.15, 0.25], [0.5, 0.12], [0.85, 0.2]]) for (const xx of [[x0 - o, x0], [x1, x1 + o]]) for (const zz of [[z0, cz - 4], [cz + 4, z1]]) bag.add(G, box(xx[0], ph * f - 0.1, zz[0], xx[1], ph * f + 0.1, zz[1]));
  // a flight up the pedestal at either end of the passage
  const n = Math.round(ph / 0.2);
  for (const sx of [-1, 1]) for (let i = 0; i < n; i++) {
    const xe = sx < 0 ? x0 : x1, run = ph * 1.4, a = xe + sx * run * (1 - i / n), b = xe + sx * run * (1 - (i + 1) / n), yy = ph * (i + 1) / n;
    const q = [Math.min(a, b), cz - 3.6, Math.max(a, b), cz + 3.6];
    bag.add(G, box(q[0], -0.3, q[1], q[2], yy, q[3])); col.floor(q, yy);
  }
  // four rows of 31 pillars: the passage 9 m wide on the axis, an aisle either side
  const rows = [z0 + 1.2, cz - 4.5, cz + 4.5, z1 - 1.2], xs = Array.from({ length: 31 }, (_, i) => x0 + 1.2 + i * (x1 - x0 - 2.4) / 30);
  for (const z of rows) for (const x of xs) { carvedPillar(bag, x, z, y, y + h, p); col.rect([x - p / 2, z - p / 2, x + p / 2, z + p / 2], y, y + h); }
  // the beams on the rows and across, the ceiling slabs, the roof and its parapet
  for (const z of rows) bag.add(G, box(x0 + 0.6, y + h - 0.02, z - 0.35, x1 - 0.6, y + h + 0.5, z + 0.35));
  for (const x of xs) bag.add(G, box(x - 0.3, y + h + 0.02, z0 + 0.8, x + 0.3, y + h + 0.48, z1 - 0.8));
  bag.add(G, box(x0, y + h + 0.5, z0, x1, y + h + 0.9, z1)); col.floor([x0, z0, x1, z1], y + h + 0.9);
  for (const zz of [[z0 - 0.1, z0 + 0.4], [z1 - 0.4, z1 + 0.1]]) bag.add('stucco_cream', box(x0 - 0.1, y + h + 0.9, zz[0], x1 + 0.1, y + h + 1.5, zz[1]));
  for (const xx of [[x0 - 0.1, x0 + 0.4], [x1 - 0.4, x1 + 0.1]]) bag.add('stucco_cream', box(xx[0], y + h + 0.9, z0 + 0.4, xx[1], y + h + 1.5, z1 - 0.4));
  // the fourteen Nayakas and their queens, against the passage's pillars, facing across it
  const mid = Math.floor(xs.length / 2);
  for (let k = 0; k < 7; k++) for (const [z, f] of [[rows[1], 1], [rows[2], -1]]) {
    const x = xs[mid - 9 + k * 3], fz = z + f * (p / 2 + 0.28);
    nayaka(bag, x - 0.15, y, fz, f, 1.85, true); nayaka(bag, x + 0.42, y, fz - f * 0.04, f, 1.55, false);
  }
}
/** A royal figure carved in the round at (x, y, z) facing +z (f = 1) or −z, h tall: the king in his tall
 *  cap with joined hands and the dagger at his waist, the queen with her hair in a side knot. */
function nayaka(bag, x, y, z, f, h, king) {
  const k = h / 1.85, M = G;
  bag.add(M, box(x - 0.3 * k, y, z - 0.25 * k, x + 0.3 * k, y + 0.12, z + 0.25 * k));
  bag.add(M, lathe([[0.2 * k, 0], [0.24 * k, 0.4 * k], [0.18 * k, 0.9 * k], [0.15 * k, 1.05 * k], [0.19 * k, 1.3 * k], [0.16 * k, 1.42 * k], [0.06 * k, 1.5 * k], [0.06 * k, 1.53 * k]], 10, null, x, y + 0.12, z));
  bag.add(M, lathe([[0.001, 0], [0.09 * k, 0.03 * k], [0.1 * k, 0.12 * k], [0.08 * k, 0.2 * k], [0.001, 0.22 * k]], 8, null, x, y + 0.12 + 1.53 * k, z));
  if (king) { bag.add(M, lathe([[0.1 * k, 0], [0.11 * k, 0.1 * k], [0.08 * k, 0.32 * k], [0.04 * k, 0.4 * k], [0.001, 0.42 * k]], 8, null, x, y + 0.12 + 1.7 * k, z)); bag.add(M, rod([x + 0.12 * k, y + 0.12 + 0.95 * k, z + f * 0.17 * k], [x + 0.05 * k, y + 0.12 + 0.62 * k, z + f * 0.2 * k], 0.025 * k, 5)); }
  else bag.add(M, lathe([[0.001, -0.07 * k], [0.08 * k, 0], [0.001, 0.07 * k]], 8, null, x + 0.09 * k, y + 0.12 + 1.66 * k, z - f * 0.03 * k));
  // the arms brought forward, the hands joined before the chest
  for (const sx of [-1, 1]) bag.add(M, rod([x + sx * 0.18 * k, y + 0.12 + 1.36 * k, z], [x + sx * 0.04 * k, y + 0.12 + 1.18 * k, z + f * 0.2 * k], 0.045 * k, 6));
  bag.add(M, lathe([[0.001, 0], [0.04 * k, 0.03 * k], [0.03 * k, 0.16 * k], [0.001, 0.2 * k]], 6, null, x, y + 0.12 + 1.15 * k, z + f * 0.21 * k));
}

/** dhvaja: the gilded flagstaff before a shrine { c, h }. */
function dhvaja(el, { bag, col }) { const [x, z] = el.c, h = el.h ?? 12; bag.add(G, box(x - 1, 0, z - 1, x + 1, 1.2, z + 1)); bag.add('gilt_bronze', lathe([[0.3, 0], [0.18, h]], 8, null, x, 1.2, z)); col.circle(x, z, 1, 0, h); }

/** tamil_house: { rect, seed, facing ('n'|'s') }: one storey of plastered brick, a pillared verandah (thinnai) on the street, a hipped roof of terracotta tile. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 3.4 + rand() * 0.6, ver = 2.2, f = el.facing === 'n' ? -1 : 1;
  const zs = f > 0 ? z1 - ver : z0 + ver, core = f > 0 ? [x0, z0, x1, zs] : [x0, zs, x1, z1];
  const plaster = ['stucco_cream', 'plaster_white', 'stucco_saffron', 'stucco_sky'][Math.floor(rand() * 4)];
  bag.add(plaster, box(core[0], -0.3, core[1], core[2], h, core[3])); col.rect(core, 0, h);
  const vr = f > 0 ? [x0, zs, x1, z1] : [x0, z0, x1, zs];
  bag.add(G, box(vr[0], -0.3, vr[1], vr[2], 0.6, vr[3])); col.floor(vr, 0.6);
  const zp = f > 0 ? z1 - 0.3 : z0 + 0.3;
  if (!el.simple) for (let x = x0 + 0.3; x <= x1 - 0.2; x += (x1 - x0 - 0.6) / Math.max(1, Math.round((x1 - x0) / 2.6))) bag.add('timber', box(x - 0.12, 0.6, zp - 0.12, x + 0.12, h - 0.4, zp + 0.12));
  const rise = Math.min(x1 - x0, z1 - z0) * 0.3;
  bag.add('roof_tile', frustum([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], h - 0.4, h - 0.4 + rise, (x1 - x0) * 0.3, (x1 - x0) * 0.3, (z1 - z0) / 2 + 0.45, (z1 - z0) / 2 + 0.45));
}

registerStyle('dravidian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ...STYLES.life.elements, gopuram, prakara, mandapa, vimana, tank, dhvaja, tamil_house: tamilHouse, ashta_shakti: ashtaShakti, elephant, ther, pudhu_mandapa: pudhu, rite },
  objects: {},
});
