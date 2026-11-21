// Dravidian architecture of the Nayaka period (16th–17th c.; docs/settlements/madurai.md §4): the
// gopuram — a granite base pierced by the passage, then storeys of brick and painted stucco
// stepping in, crowned by a barrel-vaulted roof with a row of gilded finials; granite enclosure
// walls; flat-roofed pillared halls (mandapa); gilded vimanas over the sanctums; the stepped
// temple tank in its colonnade; the town's single-storey houses with a pillared front verandah
// and a tiled roof.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, rod, disc, place } from '../../core/geom.js';
import { Shape, ExtrudeGeometry, Matrix4, Vector3, Quaternion, Color } from '../../core/three.js';
import '../qing/index.js';
import '../../objects/index.js';
import { merge } from '../../objects/kit.js';
import { rite } from '../indian/rites.js';
import { tamilHouse } from './houses.js';
import { courtHouse } from './courthouse.js';
import { figureParts, heroGuardian, hash3 } from './sculpture.js';
import { beastParts } from './beasts.js';
import { wearElements } from './wear.js';

const G = 'granite_tamil';
const PAINT = ['stucco_sky', 'stucco_rose', 'stucco_saffron', 'stucco_leaf', 'stucco_cream'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A gilded pot finial (kalasha): the foot ring, the pot, the neck, the lid and the flame-shaped tip. */
const kalasha = (bag, x, y, z, s = 1, mat = 'gilt_bronze', seg = 12) => bag.add(mat, s < 0.5
  ? lathe([[0.3 * s, 0], [0.42 * s, 0.36 * s], [0.4 * s, 0.6 * s], [0.13 * s, 0.82 * s], [0.001, 1.35 * s]], 5, null, x, y, z)        // a small pot on a parapet, seen from far: 40 triangles
  : lathe([[0.3 * s, 0], [0.36 * s, 0.06 * s], [0.28 * s, 0.13 * s], [0.42 * s, 0.36 * s], [0.4 * s, 0.6 * s], [0.2 * s, 0.76 * s], [0.13 * s, 0.82 * s], [0.24 * s, 0.9 * s], [0.1 * s, 1.04 * s], [0.07 * s, 1.35 * s], [0.001, 1.6 * s]], seg, null, x, y, z));
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
      const guarded = el.dvara && s === (el.out ?? 1);
      const q = R(u - 0.22, v - (s < 0 ? 0.18 : 0), u + 0.22, v + (s > 0 ? 0.18 : 0));
      bag.add(G, box(q[0], y + 1.2, q[1], q[2], y + base - 0.6, q[3]));
      if (j < m && Math.abs(u + W / m / 2) > pw / 2 + (guarded ? 2.6 : 1.2)) {
        const c = u + W / m / 2, nq = R(c - 0.5, v - (s < 0 ? 0.04 : -0.02), c + 0.5, v + (s > 0 ? 0.04 : -0.02));
        bag.add('opening', box(nq[0], y + 2.4, nq[1], nq[2], y + Math.min(base * 0.6, 4.6), nq[3])); bag.add(G, box(nq[0] - 0.15, y + Math.min(base * 0.6, 4.6), Math.min(nq[1], nq[3]) - 0.1, nq[2] + 0.15, y + Math.min(base * 0.6, 4.6) + 0.5, Math.max(nq[1], nq[3]) + 0.1));
        // the guardian in the niche, carved in the granite: a god with four arms, a guardian with his club by turns
        { const pc = alongX ? [cx + v + s * 0.13, cz + c] : [cx + c, cz + v + s * 0.13], top = Math.min(base * 0.6, 4.6);
          bag.add(G, box(Math.min(nq[0], nq[2]) - 0.2, y + 2.3, Math.min(nq[1], nq[3]) - 0.2, Math.max(nq[0], nq[2]) + 0.2, y + 2.42, Math.max(nq[1], nq[3]) + 0.2));
          figure(bag, { lod: el.fig === 'near' ? 1 : 2, kind: j % 2 ? 5 : 0, gran: true, mat: 'stucco_cream', x: pc[0], y: y + 2.42, z: pc[1], nx: alongX ? s : 0, nz: alongX ? 0 : s, lean: 0, Hf: (top - 2.42) * 0.92, }); }
        { const yb = base * 0.66 + 0.75, yt = base - 1.1;       // the upper row of niches, between the bands
          if (yt - yb > 1.2) {
            const pc = alongX ? [cx + v + s * 0.13, cz + c] : [cx + c, cz + v + s * 0.13];
            bag.add('opening', box(nq[0], y + yb, nq[1], nq[2], y + yt, nq[3]));
            bag.add(G, box(Math.min(nq[0], nq[2]) - 0.2, y + yb - 0.12, Math.min(nq[1], nq[3]) - 0.2, Math.max(nq[0], nq[2]) + 0.2, y + yb, Math.max(nq[1], nq[3]) + 0.2));
            bag.add(G, box(nq[0] - 0.15, y + yt, Math.min(nq[1], nq[3]) - 0.1, nq[2] + 0.15, y + yt + 0.3, Math.max(nq[1], nq[3]) + 0.1));
            figure(bag, { lod: el.fig === 'near' ? 1 : 2, kind: j % 3 === 0 ? 3 : j % 2 ? 1 : 6, gran: true, mat: 'stucco_cream', x: pc[0], y: y + yb, z: pc[1], nx: alongX ? s : 0, nz: alongX ? 0 : s, lean: 0, Hf: (yt - yb) * 0.9, });
          } }
      }
    }
    for (const hh of [1.2, base * 0.66, base - 0.6]) { const q = R(-W / 2 - 0.1, v - (s < 0 ? 0.3 : 0), W / 2 + 0.1, v + (s > 0 ? 0.3 : 0)); bag.add(G, box(q[0], y + hh, q[1], q[2], y + hh + 0.35, q[3])); }
  }
  // the door guardians (dvarapalas) before the passage's piers on the outer face, each on a plinth, the club on the outer side
  if (el.dvara) {
    const os = el.out ?? 1, f = alongX ? [os, 0] : [0, os], rt = [f[1], -f[0]], yaw = Math.atan2(f[0], f[1]), H = 3.5, sc = H / 1.16;
    for (const side of [-1, 1]) {
      const vv = D / 2 + 0.95, uu = side * (pw / 2 + 1.55), px = cx + f[0] * vv + rt[0] * uu, pz = cz + f[1] * vv + rt[1] * uu;
      const bx = (hw, hd, y0, y1) => { const xs = [px - Math.abs(rt[0]) * hw - Math.abs(f[0]) * hd, px + Math.abs(rt[0]) * hw + Math.abs(f[0]) * hd], zs = [pz - Math.abs(rt[1]) * hw - Math.abs(f[1]) * hd, pz + Math.abs(rt[1]) * hw + Math.abs(f[1]) * hd]; bag.add(G, box(xs[0], y + y0, zs[0], xs[1], y + y1, zs[1])); return [xs[0], zs[0], xs[1], zs[1]]; };
      bx(1.0, 0.8, 0, 0.35); bx(0.88, 0.7, 0.35, 0.62); const cr = bx(0.95, 0.75, 0.62, 0.78);
      col.rect(cr, y, y + 0.8);
      const [gb, gg] = heroGuardian(side > 0 ? false : true);
      _M.compose(_P.set(px, y + 0.78, pz), _Q.setFromAxisAngle(_YA, yaw), _Sc.set(sc, sc, sc));
      bag.add('stucco_sky', gb.clone().applyMatrix4(_M)); bag.add('gilt_bronze', gg.clone().applyMatrix4(_M));
      col.rect([px - 0.7, pz - 0.7, px + 0.7, pz + 0.7], y + 0.78, y + 4.3);
    }
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
      // the tier's faces as the Nayaka stucco-workers made them: pilasters (cream) leaning with the wall divide each
      // face into bays; each bay is a niche, its back painted in a colour against the wall's, a ledge below and a
      // lintel above, and in it a god, goddess, couple, seated deity, lion or guardian in the round, on a halo
      const H = tierH - 0.35, rw = w1 / w0, rd = d1 / d0, bwT = Math.max(0.95, Math.min(1.5, H * 0.42)), Hf = H * 0.8;
      const ow0 = Math.min(2.2, w1 * 0.12, tierH * 0.45), Wz = ow0 / 2 + Math.min(0.3, ow0 * 0.2) * 1.6 + 0.4;   // the window's zone on the long faces
      const lean = Math.atan(((d0 - d1) / 2) / H), leanS = Math.atan(((w0 - w1) / 2) / H);
      const wp = (u, v) => (alongX ? [cx + v, cz + u] : [cx + u, cz + v]);
      const slab = (m, u0, v0, u1, v1, ya, yb) => {      // a pyramid-scaled slab: leans with the wall, converging as it rises
        const q = R(u0, v0, u1, v1), a = [u0 * (rw - 1), u1 * (1 - rw), v0 * (rd - 1), v1 * (1 - rd)];
        bag.add(m, alongX ? frustum(q, ya, yb, a[2], a[3], a[0], a[1], { noBottom: true }) : frustum(q, ya, yb, a[0], a[1], a[2], a[3], { noBottom: true }));
      };
      const back = PAINT[(i * 3 + (i >> 2) * 2) % 4], fr = rng(i * 977 + Math.round(W * 13) + Math.round(h));
      for (const lf of [true, false]) for (const sg of [-1, 1]) {
        const len = lf ? w0 : d0, vb = (lf ? d0 : w0) / 2;       // the face's length and its distance from the axis
        const P0 = 0.12, P1 = 0.32;                              // backing and pilasters stand this far from the wall
        const T = (a, b, p0, p1) => lf ? [a, sg > 0 ? vb + p0 : -vb - p1, b, sg > 0 ? vb + p1 : -vb - p0] : [sg > 0 ? vb + p0 : -vb - p1, a, sg > 0 ? vb + p1 : -vb - p0, b];
        const S = (m, a, b, p0, p1, ya, yb) => { const t = T(a, b, p0, p1); slab(m, t[0], t[1], t[2], t[3], ya, yb); };
        const hl = len / 2, zone = lf ? Wz : 0, bounds = [];
        if (lf) { const m1 = Math.max(1, Math.round((hl - zone) / bwT)); for (let k = 0; k <= m1; k++) { const e = zone + k * (hl - zone) / m1; bounds.push(e); bounds.unshift(-e); } }
        else { const m1 = Math.max(2, Math.round(len / bwT)); for (let k = 0; k <= m1; k++) bounds.push(-hl + k * len / m1); }
        const ys = y0 + 0.02, ye = y1 - 0.35;
        for (let k = 0; k < bounds.length; k++) {
          const e = bounds[k];
          if (!(lf === false && (k === 0 || k === bounds.length - 1))) S('stucco_cream', e - 0.13, e + 0.13, 0, P1, ys, ye);   // the pilaster
          if (k === bounds.length - 1) continue;
          const a = e, b = bounds[k + 1];
          if (lf && a < 0 && b > 0) continue;                    // the window's own bay
          const bw = b - a;
          S(back, a + 0.13, b - 0.13, 0, P0, ys, ye);            // the niche's painted back
          S('stucco_cream', a + 0.13, b - 0.13, 0, P1, ye - 0.2, ye);   // the lintel
          S('stucco_cream', a + 0.13, b - 0.13, 0, P1, ys, ys + 0.28);   // the ledge
          const uc = (a + b) / 2, ni = lf ? [0, sg] : [sg, 0], pv = vb + 0.19 + 0.02;
          const pos = lf ? wp(uc, sg * pv) : wp(sg * pv, uc);
          const hsh = [0, 1, 2, 3, 5, 6, 0][(i * 5 + k * 3 + (sg > 0 ? 1 : 0) + (lf ? 0 : 2)) % 7];
          const body = PAINT[(i * 2 + k * 3 + (sg > 0 ? 2 : 0) + 1) % PAINT.length], bm = body === back ? PAINT[(PAINT.indexOf(body) + 1) % PAINT.length] : body;
          const nrm = alongX ? [ni[1], ni[0]] : ni;
          figure(bag, { lod: el.fig === 'near' && i < 2 ? 0 : 2, kind: hsh, mat: bm, x: pos[0], y: y0 + 0.3, z: pos[1], nx: nrm[0], nz: nrm[1], lean: lf ? lean : leanS, Hf });
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
  if (!el.simple) {      // the vault's ribs: cream arches standing proud of the wagon roof, one at about every 1.7 m
    const nr = Math.max(3, Math.round(2 * L / 1.7)), e = 0.14, rp = [], pq = (u, k, f) => { const [a, b] = prof[k]; return alongX ? [cx + (a * (vr + e * f)) / vr, yv + (b * (vh + e * 1.3 * f)) / vh, cz + u] : [cx + u, yv + (b * (vh + e * 1.3 * f)) / vh, cz + (a * (vr + e * f)) / vr]; };
    for (let r = 0; r < nr; r++) {
      const u = -L + 0.5 + r * (2 * L - 1) / (nr - 1), t = 0.1;
      for (let k = 0; k < 12; k++) {
        rp.push(pq(u - t, k, 1), pq(u + t, k, 1), pq(u + t, k + 1, 1), pq(u - t, k, 1), pq(u + t, k + 1, 1), pq(u - t, k + 1, 1));
        for (const su of [-t, t]) rp.push(pq(u + su, k, 0), pq(u + su, k, 1), pq(u + su, k + 1, 1), pq(u + su, k, 0), pq(u + su, k + 1, 1), pq(u + su, k + 1, 0));
      }
    }
    bag.add('stucco_cream', vaultTris(rp));
  }
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
  for (let j = 0; j < nk; j++) { const u = -L + 0.8 + j * (2 * L - 1.6) / (nk - 1), q = alongX ? [cx, cz + u] : [cx + u, cz]; kalasha(bag, q[0], yv + vh + 0.2, q[1], 1.15, 'gilt_bronze', el.fig === 'near' ? 12 : 7); }
}

/** The sculptures of a gopuram's niches (docs/settlements/madurai.md §16–17): modelled figures (src/styles/dravidian/sculpture.js) put in
 *  place as instances (GeoBag.addInstance), one prototype per kind and level of detail: 0 the full carving (the arrival gopuram's lowest
 *  two tiers), 1 the reduced one (its base's niches), 2 the far form (the upper tiers, the other gopurams). The body is cream, tinted
 *  to the paint it stands for (stucco_*), so one prototype serves every colour; the crown, jewels and emblems are gilt. */
const TINT = { stucco_sky: new Color('#5a8fb8'), stucco_rose: new Color('#c46a64'), stucco_saffron: new Color('#d9a23e'), stucco_leaf: new Color('#5f9a5a'), stucco_cream: new Color('#e2d6b8') };
const GRAN = new Map();
const _M = new Matrix4(), _Q = new Quaternion(), _P = new Vector3(), _Sc = new Vector3(), _X = new Quaternion(), _XA = new Vector3(1, 0, 0), _YA = new Vector3(0, 1, 0);
/** A sculpture p = { kind, lod, mat (paint), x, y, z (foot), nx, nz (outward), lean, Hf (height), gran (carved in the granite) } placed at its niche. */
function figure(bag, p) {
  const s = p.Hf / 1.16, lod = p.lod ?? 2, kind = lod === 2 ? (p.kind === 2 || p.kind === 3 ? 3 : 0) : p.kind;
  _Q.setFromAxisAngle(_YA, Math.atan2(p.nx, p.nz)).multiply(_X.setFromAxisAngle(_XA, -p.lean));
  _M.compose(_P.set(p.x, p.y, p.z), _Q, _Sc.set(s, s, s));
  const parts = figureParts(kind, lod);
  if (p.gran) {
    const k = `${kind}/${lod}`; let g = GRAN.get(k);
    if (!g) GRAN.set(k, (g = merge(parts.map(([, q]) => q.clone()))));
    if (bag.addInstance) bag.addInstance(G, g.clone(), _M.clone(), { real: G, reach: 140 }); else bag.add(G, g.clone().applyMatrix4(_M));
    return;
  }
  for (const [role, g] of parts) {
    const m = role === 'gilt' ? 'gilt_bronze' : 'stucco_cream', real = role === 'gilt' ? m : p.mat;
    const opt = role === 'body' ? { color: [TINT[p.mat].r / TINT.stucco_cream.r, TINT[p.mat].g / TINT.stucco_cream.g, TINT[p.mat].b / TINT.stucco_cream.b], real } : { real };
    if (bag.addInstance) bag.addInstance(m, g.clone(), _M.clone(), { ...opt, reach: 140 }); else bag.add(real, g.clone().applyMatrix4(_M));
  }
}
/** A modelled beast (a yali or a Nandi) put in the world: scale [sx, sy, sw], turned so that its front looks toward (sin yaw, cos yaw); each differs by a hair from its place. */
function putBeast(bag, kind, lod, x, y, z, yaw, sc, bodyMat = G, giltMat = 'gilt_bronze') {
  const h = hash3(x, y, z, 7), j = 1 + (h - 0.5) * 0.04;
  _M.compose(_P.set(x, y, z), _Q.setFromAxisAngle(_YA, yaw + (h - 0.5) * 0.03), _Sc.set(sc[0] * j, sc[1] * j, sc[2] * (2 - j)));
  const [gb, gg] = beastParts(kind, lod);
  bag.add(bodyMat, gb.clone().applyMatrix4(_M)); bag.add(giltMat, gg.clone().applyMatrix4(_M));
}
/** A carved deity in granite on a pillar's face (a figure kind at a level of detail, the face's outward direction (nx, nz), its foot, height Hf). */
function carveDeity(bag, kind, lod, x, y, z, nx, nz, Hf) {
  const k = `${kind}/${lod}`; let g = GRAN.get(k);
  if (!g) GRAN.set(k, (g = merge(figureParts(kind, lod).map(([, q]) => q.clone()))));
  const h = hash3(x, y, z, 3), s = Hf / 1.16 * (1 + (h - 0.5) * 0.04);
  _M.compose(_P.set(x, y, z), _Q.setFromAxisAngle(_YA, Math.atan2(nx, nz) + (h - 0.5) * 0.03), _Sc.set(s, s, s));
  bag.add(G, g.clone().applyMatrix4(_M));
}

/** A horseshoe-gable outline (nāsī): base half-width a, arch radius r, height h, extruded th (z 0…th). */
function nasiGeo(a, r, h, th, N = 16) {
  const sh = new Shape(), b = Math.acos(Math.min(0.999, a / r)), yc = h - r;
  sh.moveTo(-a, 0); sh.lineTo(-a, Math.max(0, yc - r * Math.sin(b)));
  for (let k = 0; k <= N; k++) { const ph = Math.PI + b - (Math.PI + 2 * b) * k / N; sh.lineTo(r * Math.cos(ph), yc + r * Math.sin(ph)); }
  sh.lineTo(a, 0); sh.lineTo(-a, 0);
  return new ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 4 });
}
function vaultTris(pos) { const t = []; for (let i = 0; i < pos.length; i += 3) { t.push(...pos[i], ...pos[i + 1], ...pos[i + 2], ...pos[i], ...pos[i + 2], ...pos[i + 1]); } return fromTriangles(t); }

/** prakara: a granite enclosure wall { a, b, h, th, nicheA, nicheB } (docs/settlements/madurai.md §15): a moulded plinth, pilasters
 *  every 4 m on both faces up to a drip course (kapota), the coping above; where the wall meets a gopuram (nicheA /
 *  nicheB) the first bay carries a niche for an icon on the outer face ("niches for icons, usually beside the
 *  gopurams" [stated: imp-art.org, prakara]). */
function prakara(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 1.6, h = el.h ?? 8, y = el.y ?? 0;
  const r = [Math.min(ax, bx) - th / 2, Math.min(az, bz) - th / 2, Math.max(ax, bx) + th / 2, Math.max(az, bz) + th / 2];
  if (r[2] - r[0] < 0.1 || r[3] - r[1] < 0.1) return;
  const M = el.mat || G;
  bag.add(M, box(r[0], y - 0.3, r[1], r[2], y + h, r[3]));
  { const pd = el.simple ? 0 : 0.15, alongX0 = (r[2] - r[0]) > (r[3] - r[1]); col.rect(alongX0 ? [r[0], r[1] - pd, r[2], r[3] + pd] : [r[0] - pd, r[1], r[2] + pd, r[3]], y, y + h); }   // (the pilasters and plinth stand within it)
  bag.add('stucco_cream', box(r[0] - 0.2, y + h, r[1] - 0.2, r[2] + 0.2, y + h + 0.5, r[3] + 0.2));
  if (el.simple) return;
  const alongX = (r[2] - r[0]) > (r[3] - r[1]), L = alongX ? r[2] - r[0] - th : r[3] - r[1] - th, t0 = alongX ? r[0] + th / 2 : r[1] + th / 2, c = alongX ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2, hh = th / 2;
  // (u along the wall from its start, d outward of a face: sg = −1 / +1 for the two faces)
  const F = (u0, u1, d0, d1, sg, y0, y1, m = M) => {
    const dd = [c + sg * (hh + d0), c + sg * (hh + d1)], dl = Math.min(...dd), dh = Math.max(...dd);
    bag.add(m, alongX ? box(t0 + u0, y0, dl, t0 + u1, y1, dh) : box(dl, y0, t0 + u0, dh, y1, t0 + u1));
  };
  const yp = y + 0.7, yk = y + h - 0.6;
  for (const sg of [-1, 1]) {
    F(-th / 2, L + th / 2, 0, 0.14, sg, y - 0.3, y + 0.35); F(-th / 2, L + th / 2, 0, 0.07, sg, y + 0.35, yp);        // the moulded plinth
    F(-th / 2, L + th / 2, 0, 0.1, sg, yk, yk + 0.25); F(-th / 2, L + th / 2, 0, 0.24, sg, yk + 0.25, y + h);          // the drip course (kapota)
    const n = Math.max(1, Math.round(L / 4)), pitch = L / n;
    for (let i = 0; i <= n; i++) {
      const u = i * pitch; if (i === 0 && !el.nicheA && L < 3) continue;
      F(u - 0.26, u + 0.26, 0, 0.14, sg, yp, yk);                                                              // the pilaster
      F(u - 0.36, u + 0.36, 0, 0.14, sg, yp, yp + 0.18); F(u - 0.34, u + 0.34, 0, 0.14, sg, yk - 0.2, yk);    // its base and its cap
    }
    const niche = (u) => {       // the niche: a cream frame, a dark recess, the icon, on the outer face
      if (sg !== (el.out ?? 1)) return;
      F(u - 0.8, u + 0.8, 0.14, 0.2, sg, y + 1.4, y + 4.2, 'stucco_cream'); F(u - 0.6, u + 0.6, 0.2, 0.24, sg, y + 1.65, y + 3.8, 'wood_dark');
      const pt = alongX ? [t0 + u, c + sg * (hh + 0.3)] : [c + sg * (hh + 0.3), t0 + u];
      bag.add('bronze', lathe([[0.001, 0], [0.22, 0.03], [0.17, 0.3], [0.26, 0.75], [0.15, 1.1], [0.18, 1.5], [0.12, 1.65], [0.001, 1.75]], 8, null, pt[0], y + 1.75, pt[1]));
    };
    if (el.nicheA && n > 1) niche(pitch / 2);
    if (el.nicheB && n > 1) niche(L - pitch / 2);
  }
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
    const aisleRow = aisle && (i === aisle[0] || i === aisle[1]) && k > 0 && k < nz, dd = z1 - z;
    if (el.carved && !el.simple) carvedPillar(bag, x, z, y + 0.5, y + h, p, aisleRow ? (dd < 15 ? 0 : dd < 40 ? 1 : -1) : -1);
    else plainPillar(bag, x, z, y + 0.5, y + h, p);
    col.rect([x - p / 2, z - p / 2, x + p / 2, z + p / 2], y, y + h);
  }
  bag.add(G, box(x0 - 0.6, y + h, z0 - 0.6, x1 + 0.6, y + h + 0.8, z1 + 0.6)); col.floor([x0, z0, x1, z1], y + h + 0.8);
  bag.add('stucco_cream', box(x0 - 0.3, y + h + 0.8, z0 - 0.3, x1 + 0.3, y + h + 1.3, z1 + 0.3));
  if (!el.carved && !el.simple) {          // the beams on the pillar lines, the stone ceiling between
    const yc = y + h;
    for (const x of xs) bag.add(G, box(x - 0.26, yc - 0.42, z0 + 0.2, x + 0.26, yc - 0.01, z1 - 0.2));
    for (const z of zs) bag.add(G, box(x0 + 0.2, yc - 0.3, z - 0.22, x1 - 0.2, yc - 0.01, z + 0.22));
  }
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
    const dd = z1 - z;
    if (dd < 40) {                                                  // the rearing yali, modelled: full within 15 m of the hall's south end, reduced to 40 m
      bag.add(G, box(x + (f > 0 ? 0 : -0.8), y + 0.5, z - 0.5, x + (f > 0 ? 0.8 : 0), y + 0.95, z + 0.5));
      putBeast(bag, 'yali', dd < 15 ? 0 : 1, x + f * 0.02, y + 0.95, z, f > 0 ? Math.PI / 2 : -Math.PI / 2, [1.7, 2.8, 2.8]);
    } else yali(bag, x, y + 0.5, z, f);
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

/** A plain hall pillar (the shrines' mandapas): a square foot block, an octagonal shaft with two bands and a
 *  lotus-bud collar, the cushion and the bracket plank (a lighter form of the carved Nayaka pillar). */
function plainPillar(bag, x, z, y0, y1, p) {
  const H = y1 - y0, w = p / 2;
  bag.add(G, box(x - w * 1.2, y0, z - w * 1.2, x + w * 1.2, y0 + 0.22, z + w * 1.2));
  bag.add(G, box(x - w, y0 + 0.22, z - w, x + w, y0 + H * 0.22, z + w));
  bag.add(G, lathe([[w * 0.92, 0], [w * 1.04, 0.05], [w * 0.88, 0.1], [w * 0.88, H * 0.56], [w * 1.0, H * 0.58], [w * 0.86, H * 0.6], [w * 0.8, H * 0.6 + 0.3], [w * 1.0, H * 0.6 + 0.4], [w * 0.62, H * 0.6 + 0.46]].map(([r, h2]) => [r, h2]), 8, null, x, y0 + H * 0.22 - 0.0, z));
  const yc = y1 - 0.6;
  bag.add(G, lathe([[w * 0.75, 0], [w * 0.95, 0.12], [w * 1.2, 0.26], [w * 0.9, 0.4]], 8, null, x, yc, z));
  bag.add(G, box(x - w * 1.5, y1 - 0.2, z - w * 0.5, x + w * 1.5, y1, z + w * 0.5)); bag.add(G, box(x - w * 0.5, y1 - 0.2, z - w * 1.5, x + w * 0.5, y1, z + w * 1.5));
}

/** A Nayaka pillar from y0 to y1, section p: a moulded base, square blocks with relief panels
 *  between octagonal bands, a round neck and cushion, the plank, and the lotus-bud brackets (pushpapotika). */
function carvedPillar(bag, x, z, y0, y1, p, dl = -1) {
  const H = y1 - y0, sq = (a, b, w = p / 2) => bag.add(G, box(x - w, y0 + a, z - w, x + w, y0 + b, z + w));
  sq(0, 0.28, p * 0.68); sq(0.28, 0.4, p * 0.6);
  const blocks = [[0.4, H * 0.27], [H * 0.42, H * 0.56], [H * 0.68, H * 0.76]];
  for (const [a, b] of blocks) sq(a, b);
  for (let j = 0; j < 2; j++) {
    const a = blocks[j][1], b = blocks[j + 1][0], r = p * 0.52;
    bag.add(G, lathe([[r * 0.9, 0], [r, 0.06], [r * 0.86, 0.12], [r * 0.86, b - a - 0.12], [r, b - a - 0.06], [r * 0.9, b - a]], 8, null, x, y0 + a, z));
  }
  // relief panels on the two lower blocks, each face: a sunk field and a raised figure
  for (const [bi, [a, b]] of blocks.slice(0, 2).entries()) {
    const m = 0.08, t = 0.022, w = p / 2;
    for (const f of [0, 1, 2, 3]) {
      if (dl >= 0 && bi === 0 && f < 2) continue;               // (a carved deity stands on this face instead)
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
  if (dl >= 0) for (const [f, sg] of [[0, 1], [1, -1]]) {         // a deity on each of the two faces along the aisle, its foot on the block's moulding
    const hs = hash3(x, y0, z + f, 5), kind = [0, 1, 6, 5, 3][Math.floor(hs * 5) % 5];
    carveDeity(bag, kind, dl === 0 ? 0 : 1, x, y0 + 0.46, z + sg * (p / 2 - 0.03), 0, sg, Math.min(1.0, H * 0.27 - 0.52));
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

/** A seated Nandi at (x, y, z) facing the yaw (0 = +x, π/2 = −z, π = −x, −π/2 = +z), s times the size of a 1.1 m bull. */
function nandi(bag, x, y, z, yaw, s = 1, mat = 'stucco_cream') {
  const P = [box(-0.5, 0, -0.26, 0.4, 0.14, 0.26), box(-0.42, 0.14, -0.22, 0.3, 0.52, 0.22), box(-0.3, 0.52, -0.12, 0.02, 0.66, 0.12)];
  P.push(rod([0.22, 0.46, 0], [0.42, 0.76, 0], 0.13, 7), rod([0.4, 0.74, 0], [0.62, 0.66, 0], 0.1, 7), rod([0.62, 0.66, 0], [0.68, 0.56, 0], 0.07, 6));
  for (const sd of [-1, 1]) {
    P.push(rod([0.44, 0.86, sd * 0.07], [0.5, 0.96, sd * 0.16], 0.025, 5), rod([0.38, 0.8, sd * 0.1], [0.34, 0.8, sd * 0.2], 0.03, 5));
    P.push(rod([0.3, 0.14, sd * 0.2], [0.55, 0.14, sd * 0.2], 0.06, 6));
  }
  P.push(lathe([[0.001, 0], [0.04, 0.02], [0.05, 0.12], [0.001, 0.16]], 6, null, 0.43, 0.46, 0.0));   // the bell at the neck
  for (const g of P) bag.add(mat, place(g, x, y, z, yaw, s));
}

/** A small seated lion (simha), the goddess's mount, facing the yaw. */
function simha(bag, x, y, z, yaw, s = 1, mat = 'stucco_cream') {
  const P = [box(-0.45, 0, -0.24, 0.4, 0.12, 0.24), box(-0.4, 0.12, -0.2, 0.1, 0.6, 0.2)];
  P.push(rod([0.1, 0.18, -0.15], [0.3, 0.18, -0.15], 0.07, 6), rod([0.1, 0.18, 0.15], [0.3, 0.18, 0.15], 0.07, 6));
  P.push(lathe([[0.001, 0], [0.16, 0.05], [0.2, 0.3], [0.12, 0.55], [0.001, 0.6]], 8, null, 0.2, 0.12, 0));
  P.push(lathe([[0.001, -0.3], [0.26, -0.2], [0.3, 0.0], [0.26, 0.2], [0.001, 0.3]], 8, null, 0.3, 0.8, 0));   // the mane
  P.push(rod([0.3, 0.74, 0], [0.55, 0.7, 0], 0.11, 7), rod([-0.4, 0.2, 0], [-0.62, 0.34, 0], 0.04, 5));
  for (const g of P) bag.add(mat, place(g, x, y, z, yaw, s));
}

/** One storey (tala) of a vimana at (cx, cz), side w, from y, height ht, in gilt: a core with a recessed panel on each
 *  face, and the hara of little shrines on its ledge — a domed kuta at each corner, a barrel-roofed sala in the middle
 *  of each face and two small panjara between them (the Dravidian tala, docs/settlements/madurai.md §15). */
function vimanaTala(bag, cx, cz, w, y, ht) {
  const M = 'gilt_bronze', b = w * 0.37, h2 = w / 2;
  bag.add(M, box(cx - h2, y, cz - h2, cx + h2, y + ht * 0.1, cz + h2));
  bag.add(M, box(cx - b, y + ht * 0.1, cz - b, cx + b, y + ht * 0.78, cz + b));
  bag.add(M, box(cx - h2 * 0.9, y + ht * 0.78, cz - h2 * 0.9, cx + h2 * 0.9, y + ht, cz + h2 * 0.9));
  const ya = y + ht * 0.1;
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {      // a recessed bronze panel with a gilt frame on every face of the core
    const q = [nx ? cx + nx * b : cx - b * 0.5, nz ? cz + nz * b : cz - b * 0.5, nx ? cx + nx * (b + 0.05) : cx + b * 0.5, nz ? cz + nz * (b + 0.05) : cz + b * 0.5];
    bag.add('bronze', box(Math.min(q[0], q[2]), y + ht * 0.3, Math.min(q[1], q[3]), Math.max(q[0], q[2]), y + ht * 0.7, Math.max(q[1], q[3])));
  }
  const kw = w * 0.1, kh = ht * 0.3, ks = Math.max(0.12, w * 0.028);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {           // the corner kutas: a box, a dome, a pot
    const ux = cx + sx * (h2 - kw), uz = cz + sz * (h2 - kw);
    bag.add(M, box(ux - kw, ya, uz - kw, ux + kw, ya + kh, uz + kw));
    bag.add(M, lathe([[kw * 1.15, 0], [kw * 1.05, kh * 0.18], [kw * 0.7, kh * 0.5], [kw * 0.3, kh * 0.7], [0.001, kh * 0.78]], 8, null, ux, ya + kh, uz));
    kalasha(bag, ux, ya + kh + kh * 0.7, uz, ks);
  }
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const along = nx ? [0, 1] : [1, 0];
    const item = (u, hl, hd, kind) => {        // a sala (long) or panjara at u along the face, half-length hl, half-depth hd, flush with the edge
      const px = cx + nx * (h2 - hd) + along[0] * u, pz = cz + nz * (h2 - hd) + along[1] * u, ex = nx ? hd : hl, ez = nx ? hl : hd, hh = kh * (kind === 'sala' ? 0.8 : 0.7);
      bag.add(M, box(px - ex, ya, pz - ez, px + ex, ya + hh, pz + ez));
      const sh = hd + 0.04;     // the barrel roof: a ridge along the long side
      bag.add(M, frustum([px - ex - 0.04, pz - ez - 0.04, px + ex + 0.04, pz + ez + 0.04], ya + hh, ya + hh + kh * 0.4, nx ? sh : 0, nx ? sh : 0, nx ? 0 : sh, nx ? 0 : sh, { noBottom: true }));
      const t = 0.03, o0 = nx ? px + nx * hd : pz + nz * hd, o1 = o0 + (nx || nz) * t * (nx ? 1 : 1) * 1;
      const fa = Math.min(o0, o0 + (nx + nz) * t), fb = Math.max(o0, o0 + (nx + nz) * t);
      if (nx) bag.add('bronze', box(fa, ya + hh * 0.2, pz - ez * 0.5, fb, ya + hh * 0.7, pz + ez * 0.5));
      else bag.add('bronze', box(px - ex * 0.5, ya + hh * 0.2, fa, px + ex * 0.5, ya + hh * 0.7, fb));
      void o1;
    };
    item(0, w * 0.15, w * 0.07, 'sala');
    for (const sg of [-1, 1]) item(sg * w * 0.225, w * 0.05, w * 0.05, 'panjara');
  }
}

/** vimana: the gold-plated tower over a sanctum { c, s (side), h, y } (gold-plated [stated: esamskriti, anantamias]; the
 *  form inferred from the Dravidian vimana): a moulded granite base, the wall with pilasters and a niche for a deity on
 *  each face, a cornice, three gilt storeys stepping in with their hara of shrines, the neck with a Nandi at each
 *  corner, the octagonal domed crown and the pot. */
function vimana(el, { bag, col }) {
  const [x, z] = el.c, s = el.s, h = el.h, y = el.y ?? 0, ws = s - 0.9, hs = ws / 2;
  col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h);
  // the base (adhisthana): plinth, recessed band, bulging cap
  for (const [a, b, e] of [[0, 0.5, s / 2], [0.5, 0.8, s / 2 - 0.1], [0.8, 1.1, s / 2 - 0.3], [1.1, 1.4, s / 2 - 0.15]]) bag.add(G, box(x - e, y + a, z - e, x + e, y + b, z + e));
  const y0 = y + 1.4, hw = 0.17 * h, yw = y0 + hw;
  bag.add(G, box(x - hs, y0, z - hs, x + hs, yw, z + hs));
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const A = (u0, u1, d0, d1, ya, yb, m = G) => {       // a box on the face: u along it, d outward from the wall
      const px = nx ? [x + nx * (hs + d0), x + nx * (hs + d1)] : [x + u0, x + u1], pz = nz ? [z + nz * (hs + d0), z + nz * (hs + d1)] : [z + u0, z + u1];
      bag.add(m, box(Math.min(...px), ya, Math.min(...pz), Math.max(...px), yb, Math.max(...pz)));
    };
    for (const u of [-hs + 0.28, hs - 0.28]) A(u - 0.28, u + 0.28, 0, 0.22, y0, yw);                         // the corner pilasters
    for (const u of [-ws * 0.3, ws * 0.3]) A(u - 0.2, u + 0.2, 0, 0.12, y0, yw);                              // the bay pilasters
    A(-ws * 0.13, ws * 0.13, 0, 0.3, y0, yw);                                                                  // the central projection (bhadra)
    A(-ws * 0.1, ws * 0.1, 0.3, 0.34, y0 + 0.5, yw - 0.5, 'stucco_cream');                                    // the niche's frame
    A(-ws * 0.07, ws * 0.07, 0.34, 0.37, y0 + 0.75, yw - 0.75, 'wood_dark');                                  // the dark niche
    const [fx, fz] = [x + nx * (hs + 0.35), z + nz * (hs + 0.35)];
    bag.add('bronze', lathe([[0.001, 0], [0.16, 0.02], [0.12, 0.2], [0.17, 0.55], [0.1, 0.8], [0.11, 0.95], [0.001, 1.05]], 8, null, fx, y0 + 0.78, fz));   // the deity of the niche
  }
  bag.add(G, box(x - hs - 0.35, yw, z - hs - 0.35, x + hs + 0.35, yw + 0.25, z + hs + 0.35));                 // the cornice and its drip (kapota)
  bag.add(G, frustum([x - hs - 0.55, z - hs - 0.55, x + hs + 0.55, z + hs + 0.55], yw + 0.25, yw + 0.5, 0.2, 0.2, 0.2, 0.2));
  // three gilt storeys
  let yy = yw + 0.5;
  const T = 0.4 * h / 3;
  const ws3 = [0.9, 0.74, 0.58];
  for (let i = 0; i < 3; i++) { vimanaTala(bag, x, z, ws * ws3[i], yy, T); yy += T; }
  // the neck (griva) with a Nandi facing out from each corner, the lotus-petalled octagonal crown, the pot
  const gw = ws * 0.15, gh = 0.065 * h;
  bag.add('gilt_bronze', box(x - gw, yy, z - gw, x + gw, yy + gh, z + gw));
  const nw = ws * ws3[2] * 0.45;
  [[1, 1, 0], [-1, 1, -Math.PI / 2], [-1, -1, Math.PI], [1, -1, Math.PI / 2]].forEach(([sx, sz, yaw]) => nandi(bag, x + sx * (nw - 0.55), yy - 0.001, z + sz * (nw - 0.55), yaw, Math.max(0.55, s / 16), 'stucco_cream'));
  yy += gh;
  const R = ws * 0.22;
  bag.add('gilt_bronze', lathe([[R * 0.6, 0], [R * 1.0, 0.12 * R], [R * 1.04, 0.3 * R], [R * 0.9, 0.5 * R], [R * 0.95, 0.8 * R], [R * 0.75, 1.35 * R], [R * 0.4, 1.8 * R], [R * 0.12, 2.05 * R], [0.001, 2.1 * R]], 8, null, x, yy, z));
  kalasha(bag, x, yy + 2.1 * R - 0.05, z, Math.max(0.8, (y + h - yy - 2.1 * R) / 1.6 + 0.2));
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
  col.rect([...[P(-L / 2 - 0.35, -Wd / 2 - 0.7), P(L / 2 + 0.35, Wd / 2 + 0.7)].reduce((r, p) => [Math.min(r[0], p[0]), Math.min(r[1], p[1]), Math.max(r[2], p[0]), Math.max(r[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity])], 0, 9);
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

/** dhvaja: the gilded flagstaff before a shrine { c, h, vo, bo, vahana } (docs/settlements/madurai.md §15): a square granite base
 *  with a deity on each face and a ring of lotus petals, the copper- and gold-sheathed teak shaft in bands with
 *  collars, three perches (mekhala) hung with bells near the top, a Nandi for finial; before it, toward the shrine,
 *  the mount of the deity (vo metres from the staff; a Nandi for Shiva, a lion for the goddess) on a pedestal, and
 *  behind it the balipitha (bo metres), the altar of offerings, a lotus-petalled stone. */
function dhvaja(el, { bag, col }) {
  const [x, z] = el.c, h = el.h ?? 12, vo = el.vo ?? -2.3, bo = el.bo ?? 3.6;
  // the base: three moulded courses, a niche with a deity on each face, a lotus ring
  bag.add(G, box(x - 1, 0, z - 1, x + 1, 0.4, z + 1)); bag.add(G, box(x - 0.88, 0.4, z - 0.88, x + 0.88, 0.95, z + 0.88)); bag.add(G, box(x - 0.96, 0.95, z - 0.96, x + 0.96, 1.2, z + 0.96));
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const q = (a0, a1, d0, d1, y0, y1, m) => { const ex = nx ? [x + nx * (0.88 + d0), x + nx * (0.88 + d1)] : [x + a0, x + a1], ez = nz ? [z + nz * (0.88 + d0), z + nz * (0.88 + d1)] : [z + a0, z + a1]; bag.add(m, box(Math.min(...ex), y0, Math.min(...ez), Math.max(...ex), y1, Math.max(...ez))); };
    q(-0.34, 0.34, 0, 0.04, 0.5, 0.88, 'stucco_cream'); q(-0.26, 0.26, 0.04, 0.06, 0.55, 0.83, 'wood_dark');
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.05, 0.01], [0.04, 0.12], [0.06, 0.22], [0.001, 0.28]], 6, null, x + nx * 0.96, 0.57, z + nz * 0.96));
  }
  bag.add(G, lathe([[0.33, 0], [0.5, 0.03], [0.55, 0.12], [0.45, 0.22], [0.3, 0.26], [0.27, 0.27]], 16, null, x, 1.2, z));
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; bag.add(G, lathe([[0.001, 0], [0.09, 0.04], [0.001, 0.16]], 5, null, x + Math.cos(a) * 0.44, 1.2, z + Math.sin(a) * 0.44)); }
  // the shaft in sheathed bands: gilt shaft, copper-red collars, taper 0.27 to 0.15 m
  const yb = 1.47, r = (y) => 0.27 - 0.12 * (y - yb) / (h - yb);
  bag.add('gilt_bronze', lathe([[r(yb), 0], [r(h - 1.5), h - 1.5 - yb]], 14, null, x, yb, z));
  for (const f of [0.14, 0.32, 0.5, 0.68, 0.84]) { const yc = yb + (h - yb) * f; bag.add('bronze', lathe([[r(yc) * 1.0, 0], [r(yc) * 1.3, 0.04], [r(yc) * 1.3, 0.2], [r(yc) * 1.0, 0.24]], 14, null, x, yc, z)); }
  // the top: three perches with bells, the finial Nandi
  const yt = h - 1.5;
  bag.add('gilt_bronze', lathe([[r(yt) * 1.0, 0], [r(yt) * 1.5, 0.1], [r(yt) * 1.2, 0.3], [0.16, 0.5], [0.16, 1.42], [0.42, 1.46], [0.42, 1.52], [0.001, 1.52]], 12, null, x, yt, z));
  for (const [k, hl] of [[0.1, 0.8], [0.55, 0.62], [1.0, 0.44]]) {
    bag.add('gilt_bronze', box(x - hl, yt + k, z - 0.03, x + hl, yt + k + 0.06, z + 0.03));
    for (const sg of [-1, 1]) bag.add('bronze', lathe([[0.001, 0], [0.07, 0.04], [0.06, 0.12], [0.001, 0.14]], 6, null, x + sg * hl, yt + k - 0.14, z));
  }
  nandi(bag, x, h + 0.02, z, Math.PI, 0.4, 'gilt_bronze');
  col.circle(x, z, 1, 0, h);
  // the mount toward the shrine on a pedestal, and the balipitha beyond the staff
  const mx = x + vo;
  if (el.vahana === 'simha') {
    bag.add(G, box(mx - 0.62, 0, z - 0.42, mx + 0.62, 0.5, z + 0.42)); bag.add(G, box(mx - 0.7, 0.5, z - 0.48, mx + 0.7, 0.62, z + 0.48));
    simha(bag, mx, 0.62, z, el.faceyaw ?? Math.PI, 1.15, 'stucco_cream');
    col.rect([mx - 0.7, z - 0.48, mx + 0.7, z + 0.48], 0, 1.9);
  } else {          // the Nandi, modelled: on a moulded pedestal (three courses, a lotus band), facing the shrine
    const hl = 1.0, hw = 0.55;
    bag.add(G, box(mx - hl, 0, z - hw, mx + hl, 0.4, z + hw)); bag.add(G, box(mx - hl + 0.08, 0.4, z - hw + 0.08, mx + hl - 0.08, 0.7, z + hw - 0.08)); bag.add(G, box(mx - hl - 0.06, 0.7, z - hw - 0.06, mx + hl + 0.06, 0.84, z + hw + 0.06));
    putBeast(bag, 'nandi', 0, mx - 0.05, 0.84, z, Math.PI / 2 - (el.faceyaw ?? Math.PI), [1.6, 1.6, 1.6], 'stucco_cream');
    col.rect([mx - hl - 0.06, z - hw - 0.06, mx + hl + 0.06, z + hw + 0.06], 0, 2.4);
  }
  const bx = x + bo;
  bag.add(G, box(bx - 0.5, 0, z - 0.5, bx + 0.5, 0.3, z + 0.5)); bag.add(G, box(bx - 0.4, 0.3, z - 0.4, bx + 0.4, 0.5, z + 0.4));
  bag.add(G, lathe([[0.2, 0], [0.34, 0.03], [0.36, 0.1], [0.26, 0.2], [0.2, 0.3]], 12, null, bx, 0.5, z));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; bag.add(G, lathe([[0.001, 0], [0.07, 0.03], [0.001, 0.14]], 5, null, bx + Math.cos(a) * 0.3, 0.5, z + Math.sin(a) * 0.3)); }
  bag.add(G, lathe([[0.2, 0], [0.26, 0.04], [0.22, 0.1], [0.001, 0.14]], 12, null, bx, 0.8, z));
  col.rect([bx - 0.5, z - 0.5, bx + 0.5, z + 0.5], 0, 1.0);
}

/** A frame for the street furniture: map(u, v) from the object's own axes (u along its front, v toward the front,
 *  the front facing the way of `rot` quarter turns) to the world, with box and collider helpers. */
function quarterFrame(el, bag, col) {
  const [x, z] = el.at, a = (el.rot ?? 0) * Math.PI / 2, ca = Math.round(Math.cos(a)), sa = Math.round(Math.sin(a));
  const map = (u, v) => [x + u * ca - v * sa, z + u * sa + v * ca];
  const B = (m, u0, y0, v0, u1, y1, v1) => { const [p, q] = map(u0, v0), [r2, t] = map(u1, v1); bag.add(m, box(Math.min(p, r2), y0, Math.min(q, t), Math.max(p, r2), y1, Math.max(q, t))); };
  const C = (u0, v0, u1, v1, y0, y1) => { const [p, q] = map(u0, v0), [r2, t] = map(u1, v1); col.rect([Math.min(p, r2), Math.min(q, t), Math.max(p, r2), Math.max(q, t)], y0, y1); };
  return { map, B, C, L: (m, prof, seg, u, y, v) => { const [p, q] = map(u, v); bag.add(m, lathe(prof, seg, null, p, y, q)); } };
}

/** wayside: a small shrine of Pillaiyar (Ganesha) at a street crossing { at, rot } (docs/settlements/madurai.md §15): a granite platform with steps,
 *  a cell open to the front with the seated god on a pedestal, a cornice, two stepped tiers and a pot above, a lit lamp. */
function wayside(el, { bag, col }) {
  const { B, C, L, map } = quarterFrame(el, bag, col);
  B(G, -1.7, -0.3, -1.7, 1.7, 0.18, 1.9); B(G, -1.55, 0.18, -1.55, 1.55, 0.4, 1.75);
  B(G, -0.8, 0.0, 1.75, 0.8, 0.2, 2.1);                                                                // the steps
  { const Fl = (u0, v0, u1, v1, y) => { const [p, q] = map(u0, v0), [r2, t] = map(u1, v1); col.floor([Math.min(p, r2), Math.min(q, t), Math.max(p, r2), Math.max(q, t)], y); };
    Fl(-1.7, -1.7, 1.7, 1.9, 0.18); Fl(-1.55, -1.55, 1.55, 1.75, 0.4); Fl(-0.8, 1.75, 0.8, 2.1, 0.2); }
  // the cell: three walls and a roof slab on two front pilasters
  B(G, -1.15, 0.4, -1.15, 1.15, 2.1, -0.85); B(G, -1.15, 0.4, -0.85, -0.85, 2.1, 0.9); B(G, 0.85, 0.4, -0.85, 1.15, 2.1, 0.9);
  B(G, -1.3, 2.1, -1.3, 1.3, 2.38, 1.1); B('stucco_cream', -1.1, 2.38, -1.1, 1.1, 2.58, 0.9);
  B('wood_dark', -0.85, 0.4, -0.85, 0.85, 2.1, -0.8);                                                  // the dark back of the cell
  C(-1.15, -1.15, 1.15, -0.85, 0.4, 2.1); C(-1.15, -0.85, -0.85, 0.9, 0.4, 2.1); C(0.85, -0.85, 1.15, 0.9, 0.4, 2.1); C(-1.1, 0.88, -0.9, 1.08, 0.4, 2.1); C(0.9, 0.88, 1.1, 1.08, 0.4, 2.1); C(-0.4, -0.7, 0.4, 0.2, 0.4, 1.8);
  for (const sg of [-1, 1]) B('stucco_cream', sg * 1.0 - 0.1, 0.4, 0.88, sg * 1.0 + 0.1, 2.1, 1.08);
  B('stucco_cream', -1.1, 2.0, 0.88, 1.1, 2.3, 1.08);
  // the god on his pedestal: a belly, an elephant's head, the raised arms, the mouse before him
  B(G, -0.4, 0.4, -0.7, 0.4, 0.75, 0.2);
  L('stucco_cream', [[0.001, 0], [0.3, 0.02], [0.36, 0.2], [0.3, 0.45], [0.2, 0.62], [0.001, 0.66]], 10, 0, 0.75, -0.25);
  L('stucco_cream', [[0.001, 0], [0.17, 0.04], [0.2, 0.2], [0.001, 0.34]], 8, 0, 1.4, -0.22);
  L('bronze', [[0.001, 0], [0.12, 0.02], [0.1, 0.14], [0.001, 0.2]], 8, 0.0, 0.4, 0.55);
  for (const sg of [-1, 1]) { const [px, pz] = el.at; void px; void pz; L('stucco_cream', [[0.001, 0], [0.07, 0.04], [0.05, 0.22], [0.001, 0.26]], 6, sg * 0.34, 1.05, -0.2); }
  // two tiers and a pot above the cell
  for (const [w, a0, a1] of [[1.0, 2.58, 3.1], [0.74, 3.1, 3.55]]) { const [p, q] = quarterFrame(el, bag, col).map(0, -0.1); bag.add('stucco_saffron', frustum([p - w, q - w, p + w, q + w], a0, a1, 0.18, 0.18, 0.18, 0.18)); }
  { const [p, q] = quarterFrame(el, bag, col).map(0, -0.1); bag.add('stucco_cream', lathe([[0.001, 0], [0.5, 0], [0.45, 0.2], [0.2, 0.42], [0.001, 0.46]], 8, null, p, 3.55, q)); kalasha(bag, p, 4.0, q, 0.45); }
  // the lit lamp before the god, a pair of clay lamps on the platform's edge
  for (const sg of [-1, 1]) L('bronze', [[0.001, 0], [0.1, 0.0], [0.11, 0.04], [0.001, 0.05]], 8, sg * 0.7, 0.4, 1.4);
  L('lamp_glass', [[0.001, 0], [0.03, 0.02], [0.001, 0.09]], 5, -0.7, 0.45, 1.4); L('lamp_glass', [[0.001, 0], [0.03, 0.02], [0.001, 0.09]], 5, 0.7, 0.45, 1.4);
}

/** well: a public well (kinaru) { at, rot }: a round granite parapet over a dark shaft, two stone posts with a
 *  beam and pulley, a rope with a brass pot, a stone trough and a washing slab. */
function well(el, { bag, col }) {
  const { B, C, L, map } = quarterFrame(el, bag, col), [cx, cz] = map(0, 0);
  bag.add(G, lathe([[1.35, 0], [1.35, 0.1], [1.2, 0.12], [1.2, 0.78], [1.3, 0.8], [1.3, 0.9], [0.9, 0.9], [0.9, 0.78]], 16, null, cx, 0, cz));
  bag.add('opening', disc(0.9, 0.7, 16, cx, cz));
  col.circle(cx, cz, 1.35, 0, 0.95);
  for (const sg of [-1, 1]) { B(G, sg * 1.0 - 0.15, 0.9, -0.15, sg * 1.0 + 0.15, 3.0, 0.15); C(sg * 1.0 - 0.15, -0.15, sg * 1.0 + 0.15, 0.15, 0.9, 3.0); }
  B('timber', -1.3, 2.9, -0.1, 1.3, 3.1, 0.1);
  L('wood_dark', [[0.001, 0], [0.17, 0], [0.17, 0.08], [0.001, 0.08]], 10, 0, 2.55, 0.0);
  B('timber', -0.04, 2.55, -0.04, 0.04, 2.9, 0.04);
  { const a = map(0.17, 0), b = map(0.92, 0), c2 = map(-0.17, 0); bag.add('rope_fibre', rod([a[0], 2.55, a[1]], [b[0], 1.38, b[1]], 0.015, 5)); bag.add('rope_fibre', rod([c2[0], 2.55, c2[1]], [c2[0], 1.3, c2[1]], 0.015, 5)); }
  L('bronze', [[0.001, 0], [0.07, 0], [0.1, 0.05], [0.17, 0.17], [0.18, 0.26], [0.12, 0.38], [0.07, 0.44], [0.1, 0.5], [0.07, 0.5]], 8, 0.92, 0.9, 0.0);
  B(G, -0.95, 0, 1.5, 0.95, 0.4, 2.1); B('wood_dark', -0.85, 0.4, 1.58, 0.85, 0.44, 2.02); B(G, -0.95, 0.4, 1.5, 0.95, 0.5, 1.58); B(G, -0.95, 0.4, 2.02, 0.95, 0.5, 2.1);
  C(-0.95, 1.5, 0.95, 2.1, 0, 0.5);
  B(G, 1.5, 0, 1.2, 2.5, 0.16, 2.2);                                                                   // the washing slab
  L('terracotta', [[0.001, 0], [0.12, 0], [0.2, 0.12], [0.22, 0.3], [0.12, 0.42], [0.1, 0.48]], 9, -1.55, 0, 1.0);
}

/** pandal: a thanneer pandal { at, rot }: a thatched shed on four posts where water and buttermilk are given
 *  to the thirsty; a back wall of palm mats, a bench, a stand with water pots under cloth, brass cups, a ladle. */
function pandal(el, { bag, col }) {
  const { B, C, L, map } = quarterFrame(el, bag, col);
  for (const [u, v] of [[-1.7, -1.1], [1.7, -1.1], [-1.7, 1.1], [1.7, 1.1]]) { B('timber', u - 0.07, 0, v - 0.07, u + 0.07, 2.35, v + 0.07); C(u - 0.1, v - 0.1, u + 0.1, v + 0.1, 0, 2.4); }
  B('timber', -1.8, 2.3, -1.2, 1.8, 2.42, -1.0); B('timber', -1.8, 2.3, 1.0, 1.8, 2.42, 1.2);
  B('reed_mat', -1.75, 0.0, -1.12, 1.75, 2.3, -1.06);                                                  // the mat wall at the back
  { const [p, q] = map(0, 0); const ru = (el.rot ?? 0) % 2 === 0;
    bag.add('thatch_palm', frustum([p - (ru ? 2.1 : 1.5), q - (ru ? 1.5 : 2.1), p + (ru ? 2.1 : 1.5), q + (ru ? 1.5 : 2.1)], 2.42, 3.3, ru ? 0 : 1.45, ru ? 0 : 1.45, ru ? 1.45 : 0, ru ? 1.45 : 0)); }
  B(G, -1.5, 0, -0.95, 1.5, 0.12, -0.4);                                                               // the stone slab the pots stand on
  for (let k = 0; k < 3; k++) {
    const u = -1.0 + k * 1.0;
    L('terracotta', [[0.001, 0], [0.22, 0], [0.36, 0.14], [0.42, 0.36], [0.34, 0.58], [0.22, 0.7], [0.26, 0.76]], 12, u, 0.12, -0.7);
    L('cloth_white', [[0.001, 0.0], [0.27, 0], [0.29, 0.03], [0.001, 0.06]], 10, u, 0.88, -0.7);
  }
  C(-1.5, -0.95, 1.5, -0.4, 0, 0.9);
  B('timber', 0.4, 0, 0.5, 1.5, 0.08, 0.7); B('timber', 0.4, 0.38, 0.5, 1.5, 0.46, 0.7);               // the bench
  for (const u of [0.5, 1.4]) B('timber', u - 0.04, 0.08, 0.52, u + 0.04, 0.38, 0.68);
  for (let k = 0; k < 3; k++) L('bronze', [[0.001, 0], [0.05, 0], [0.065, 0.1], [0.001, 0.1]], 8, 0.5 + k * 0.2, 0.46, 0.6);
  L('bronze', [[0.001, 0], [0.16, 0], [0.2, 0.2], [0.19, 0.36], [0.001, 0.36]], 10, 1.25, 0.46, 0.6);
}

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

function sculptShow(el, { bag }) {
  const [x, z] = el.at ?? [0, 0], H = el.h ?? 2.5;
  for (const [role, g] of figureParts(el.kind, el.lod ?? 0)) bag.add(role === 'gilt' ? 'gilt_bronze' : (el.mat ?? 'stucco_cream'), g.clone().scale(H / 1.16, H / 1.16, H / 1.16).translate(x, el.y ?? 0, z));
}
registerStyle('dravidian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { sculpt_show: sculptShow, ...STYLES.qing.elements, ...STYLES.life.elements, gopuram, prakara, mandapa, vimana, tank, dhvaja, tamil_house: tamilHouse, court_house: courtHouse, ashta_shakti: ashtaShakti, elephant, ther, pudhu_mandapa: pudhu, rite, wayside, well, pandal, ...wearElements },
  objects: {},
});
