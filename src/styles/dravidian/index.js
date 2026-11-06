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

/** tank: a stepped temple tank { rect, y, depth, water } in a colonnade one bay deep. */
function tank(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, dep = el.depth ?? 4, steps = 10, st = dep / steps;
  for (let i = 0; i < steps; i++) {
    const m = 0.6 * i, ya = y - i * st;
    const r = [x0 + m, z0 + m, x1 - m, z1 - m], ri = [r[0] + 0.6, r[1] + 0.6, r[2] - 0.6, r[3] - 0.6];
    for (const q of [[r[0], r[1], r[2], ri[1]], [r[0], ri[3], r[2], r[3]], [r[0], ri[1], ri[0], ri[3]], [ri[2], ri[1], r[2], ri[3]]]) {
      bag.add(G, box(q[0], ya - st, q[1], q[2], ya, q[3])); col.floor(q, ya);
    }
  }
  const mi = 0.6 * steps;
  bag.add(G, box(x0 + mi, y - dep - 0.4, z0 + mi, x1 - mi, y - dep, z1 - mi));
  STYLES.qing.elements.water_rect({ rect: [x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], y: y - (el.water ?? 2.2) }, ctx);
  // the lamp pillar in the middle
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('gilt_bronze', lathe([[0.3, 0], [0.25, 4], [0.6, 4.3], [0.001, 5]], 8, null, cx, y - dep, cz));
  // the colonnade round it
  for (const r of [[x0 - 6, z0 - 6, x1 + 6, z0], [x0 - 6, z1, x1 + 6, z1 + 6], [x0 - 6, z0, x0, z1], [x1, z0, x1 + 6, z1]]) mandapa({ rect: r, y, h: 5, step: 3.4, simple: el.simple }, ctx);
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
  elements: { ...STYLES.qing.elements, gopuram, prakara, mandapa, vimana, tank, dhvaja, tamil_house: house },
  objects: {},
});
