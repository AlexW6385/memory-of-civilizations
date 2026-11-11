// The buildings and the life of the Agora of Athens about 410 BC (docs/settlements/athens.md §4d): the stoas with their
// Doric fronts, Ionic inner colonnades, dining rooms, painted panels and captured shields; the round Tholos of the
// prytaneis with its kitchen and its roof of lozenge tiles; the Altar of the Twelve Gods in its enclosure; the Herms;
// the boundary stone; the booths of the market behind their wicker screens. Registered into the `greek` style.

import { Matrix4 } from '../../core/three.js';
import { STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, rod, frustum } from '../../core/geom.js';
import { human, blob, limb, placed, relief } from './sculpture.js';
import { merge } from './columns.js';
import '../../objects/index.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A local frame on a rectangle whose front faces `front`: u runs along the front (0…L), v from the front back (0…D). */
export function frame(rect, front) {
  const [x0, z0, x1, z1] = rect, alongX = front === 's' || front === 'n';
  const L = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0;
  const P = (u, v) => (front === 's' ? [x0 + u, z1 - v] : front === 'n' ? [x0 + u, z0 + v] : front === 'e' ? [x1 - v, z0 + u] : [x0 + v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const out = front === 's' ? [0, 1] : front === 'n' ? [0, -1] : front === 'e' ? [1, 0] : [-1, 0];
  const along = front === 's' || front === 'n' ? [1, 0] : [0, 1];
  // the yaw that turns a thing built facing +z to face the front
  const yaw = front === 's' ? 0 : front === 'n' ? Math.PI : front === 'e' ? Math.PI / 2 : -Math.PI / 2;
  return { L, D, P, R, out, along, alongX, yaw };
}
export const B = (bag, mat, r, y0, y1) => bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));

/** A short Doric entablature over a straight run of columns: local axis from (ua, va) to (ub, vb) (along u or v), its
 *  outer side toward `side` (±1 on the other coordinate); triglyphs over the columns `cols` and between them. */
function entRun(bag, F, a, b, side, cols, { y, arch, frieze, geison, face, inner, tw, oh, mat, tri }) {
  const alongU = a[1] === b[1], lo = Math.min(alongU ? a[0] : a[1], alongU ? b[0] : b[1]) - face, hi = Math.max(alongU ? a[0] : a[1], alongU ? b[0] : b[1]) + face;
  const c = alongU ? a[1] : a[0];
  const slab = (o0, o1, y0, y1, m = mat, s0 = lo, s1 = hi) => { const p = side > 0 ? [c + o0, c + o1] : [c - o1, c - o0]; B(bag, m, alongU ? F.R(s0, p[0], s1, p[1]) : F.R(p[0], s0, p[1], s1), y0, y1); };
  // a run whose outer side points toward −v is the front: offsets grow outward
  const yA = y + arch, yF = yA + frieze;
  slab(-inner, face, y, yA - arch * 0.08);
  slab(-inner + 0.02, face + 0.04, yA - arch * 0.08, yA);                         // the taenia
  slab(-inner, face - 0.04, yA, yF);                                              // the frieze (metopes)
  slab(-inner, face + oh * 0.35, yF, yF + geison * 0.3);
  slab(-inner, face + oh, yF + geison * 0.3, yF + geison);                        // the geison
  const marks = [];
  cols.forEach((s, i) => { marks.push(s); if (i + 1 < cols.length) marks.push((s + cols[i + 1]) / 2); });
  for (const s of marks) {
    const s0 = Math.max(lo, s - tw / 2), s1 = Math.min(hi, s + tw / 2);
    slab(face - 0.04, face + 0.03, yA, yF - 0.06, tri, s0, s1);                  // the triglyph
    slab(face + 0.0, face + 0.07, yA - arch * 0.08 - 0.07, yA - arch * 0.08, mat, s0, s1);   // its regula
    slab(face + oh * 0.35, face + oh - 0.08, yF + geison * 0.2, yF + geison * 0.3, mat, s0 + 0.02, s1 - 0.02);   // the mutule
  }
}

/**
 * stoa: { rect (the hall, rooms included; wings project before it), front, y (the floor), h (outer columns), d, sp
 * (their spacing), flutes, arch, frieze, geison, tw, inner: { d, every } (an Ionic row down the middle), rooms: { n,
 * depth } (dining rooms behind), wings: { depth, width, sp } (projecting at both ends, their own pediments), paintings
 * (panels on the back wall), shields, nikai (Victories on the wings' pediments), mat, wall, floor }.
 */
function stoa(el, ctx) {
  const { bag, col } = ctx, F = frame(el.rect, el.front ?? 's'), { L, D } = F, y = el.y ?? 0;
  const mat = el.mat ?? 'limestone', wall = el.wall ?? mat, h = el.h ?? 5, d = el.d ?? 0.8, sp = el.sp ?? 2.0;
  const arch = el.arch ?? h * 0.13, frieze = el.frieze ?? h * 0.13, geison = el.geison ?? h * 0.06, tw = el.tw ?? d * 0.5;
  const face = d * 0.5, inner = d * 0.45, oh = el.overhang ?? 0.45, yA = y + h + arch, yF = yA + frieze, yG = yF + geison;
  const W = el.wings?.width ?? 0, P = el.wings?.depth ?? 0, spw = el.wings?.sp ?? sp, rd = el.rooms?.depth ?? 0, Dh = D - rd;
  const ent = { y: y + h, arch, frieze, geison, face, inner, tw, oh, mat, tri: el.triglyphMat ?? mat };
  // the platform and its two steps along the front (round the wings too)
  const plat = (u0, v0, u1, v1) => {
    B(bag, mat, F.R(u0 - 0.7, v0 - 0.7, u1 + 0.7, v1 + 0.2), y - 1.4, y - 0.34);
    B(bag, mat, F.R(u0 - 0.35, v0 - 0.35, u1 + 0.35, v1 + 0.1), y - 0.34, y - 0.17);
    B(bag, el.floor ?? mat, F.R(u0, v0, u1, v1), y - 0.17, y);
    col.floor(F.R(u0 - 0.7, v0 - 0.7, u1 + 0.7, v1 + 0.2), y - 0.34); col.floor(F.R(u0 - 0.35, v0 - 0.35, u1 + 0.35, v1 + 0.1), y - 0.17); col.floor(F.R(u0, v0, u1, v1), y);
  };
  plat(0, 0, L, D);
  if (W) { plat(0, -P, W, 0.01); plat(L - W, -P, L, 0.01); }
  // the outer colonnade, along the front (round the wings, whose outer sides are walls)
  const C = (u, v) => STYLES.greek.column({ at: F.P(u, v), y, h, d, mat, flutes: el.flutes ?? 0, simple: el.simple }, ctx);
  const spaced = (a, b, s) => { const n = Math.max(1, Math.round(Math.abs(b - a) / s)); return Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n); };
  const e = 0.55;
  if (!W) {
    const us = spaced(1.3, L - 1.3, sp);
    for (const u of us) C(u, e);
    entRun(bag, F, [0, e], [L, e], -1, us, ent);
  } else {
    const wf = spaced(1.3, W - e, spw), ws = spaced(-P + e, e, spw), mf = spaced(W - e, L - W + e, sp);
    for (const [k, mir] of [[0, false], [1, true]]) {
      const U = (u) => (mir ? L - u : u);
      wf.forEach((u) => C(U(u), -P + e)); ws.slice(1, -1).forEach((v) => C(U(W - e), v));
      entRun(bag, F, [U(0), -P + e], [U(W - e), -P + e], -1, wf.map(U), ent);
      // the wing's inner side faces the middle of the front (+u for the left wing)
      entRun(bag, F, [U(W - e), -P + e], [U(W - e), e], mir ? -1 : 1, ws, ent);
      void k;
    }
    mf.forEach((u) => C(u, e));
    entRun(bag, F, [W - e, e], [L - W + e, e], -1, mf, ent);
  }
  // the walls: the back, the ends (with the wings' outer sides), the dining rooms' front wall with its doors
  const wt = 0.7;
  const wallR = (r, y1 = yG, m = wall) => { B(bag, m, r, y, y1); col.rect(r, y, y1); };
  wallR(F.R(0, D - wt, L, D));
  wallR(F.R(0, W ? -P + 0.1 : 0.1, wt, D - wt)); wallR(F.R(L - wt, W ? -P + 0.1 : 0.1, L, D - wt));
  // the ceiling of timber coffers over the hall and the rooms; the roofs with their pediments
  const ceil = (r) => STYLES.greek.elements.coffers({ rect: r, y: yF - 0.25, depth: 0.25, cell: 1.4, beam: 0.16, mat: 'cedar' }, ctx);
  ceil(F.R(wt, e + inner, L - wt, D - wt));
  if (W) { ceil(F.R(wt, -P + e + inner, W - e - inner, e + inner)); ceil(F.R(L - W + e + inner, -P + e + inner, L - wt, e + inner)); }
  const roof = (u0, v0, u1, v1, ridgeU) => {
    const r = F.R(u0, v0, u1, v1), rise = (ridgeU ? v1 - v0 : u1 - u0) * 0.14;
    STYLES.greek.elements.pediment_roof({ rect: r, y: yG, rise, tympanumInset: 0.35, rakingGeison: 0.32, mat, tileMat: 'roof_tile', ridge: (ridgeU === F.alongX) ? 'x' : 'z' }, ctx);
    return rise;
  };
  if (!W) roof(-0.15, e - face - oh, L + 0.15, D + 0.15, true);
  else {
    roof(W - 0.1, e - face - oh, L - W + 0.1, D + 0.15, true);
    for (const u0 of [0, L - W]) {
      const rise = roof(u0 - 0.15, -P + e - face - oh, u0 + W + 0.15, D + 0.15, false);
      // the Victories of marble on the wings' pediments
      if (el.nikai) {
        const [x, z] = F.P(u0 + W / 2, -P + e - face - oh + 0.5);
        nike(bag, x, yG + rise + 0.25, z, F.yaw);
      }
    }
  }
  // the inner colonnade of Ionic columns down the middle of the hall, a beam along it under the ceiling
  if (el.inner) {
    const vi = (e + Dh) / 2, us = spaced(1.3 + sp * (el.inner.every ?? 2) / 2, L - 1.3 - sp * (el.inner.every ?? 2) / 2, sp * (el.inner.every ?? 2)), top = yF - 0.25 - 0.45;
    for (const u of us) STYLES.greek.column({ at: F.P(u, vi), y, h: top - y, d: el.inner.d, mat: el.inner.mat ?? mat, order: 'ionic', yaw: F.alongX ? 0 : Math.PI / 2 }, ctx);
    B(bag, 'cedar', F.R(wt, vi - 0.2, L - wt, vi + 0.2), top, yF - 0.25);
  }
  // the dining rooms: a row behind the hall, each with its door off the middle so that the couches go round the walls
  if (el.rooms) {
    const n = el.rooms.n, rw = (L - 2 * wt) / n, vb = Dh, rand = rng(el.seed ?? 17);
    for (let k = 0; k < n; k++) {
      const u0 = wt + k * rw, u1 = u0 + rw, du = u0 + 0.6;
      // the front wall: either side of the door, the lintel over it
      wallR(F.R(u0, vb, du, vb + 0.5), yF - 0.25); wallR(F.R(du + 1.2, vb, u1, vb + 0.5), yF - 0.25);
      B(bag, wall, F.R(du, vb, du + 1.2, vb + 0.5), y + 2.4, yF - 0.25);
      B(bag, 'timber', F.R(du - 0.08, vb - 0.02, du + 1.28, vb + 0.52), y + 2.4, y + 2.52);
      if (k > 0) wallR(F.R(u0 - 0.2, vb + 0.5, u0 + 0.2, D - wt), yF - 0.25);
      // seven couches round the walls, a little table before each
      const ia = u0 + (k > 0 ? 0.2 : 0), ib = u1 - (k < n - 1 ? 0.2 : 0), va = vb + 0.5, vbk = D - wt;
      const couch = (cu, cv, alongU) => {
        const r = alongU ? F.R(cu - 0.9, cv - 0.4, cu + 0.9, cv + 0.4) : F.R(cu - 0.4, cv - 0.9, cu + 0.4, cv + 0.9);
        B(bag, 'timber', r, y, y + 0.42); B(bag, ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][Math.floor(rand() * 4)], [r[0] + 0.04, r[1] + 0.04, r[2] - 0.04, r[3] - 0.04], y + 0.42, y + 0.52);
        col.rect(r, y, y + 0.52);
      };
      couch((ia + ib) / 2 - 0.92, vbk - 0.42, true); couch((ia + ib) / 2 + 0.92, vbk - 0.42, true);
      couch(ia + 0.42, va + 1.5, false); couch(ia + 0.42, va + 3.3, false); couch(ib - 0.42, va + 1.5, false); couch(ib - 0.42, va + 3.3, false);
      couch(ib - 1.3, va + 0.42, true);
      for (const [tu, tv] of [[(ia + ib) / 2, vbk - 1.2], [ia + 1.2, va + 2.4], [ib - 1.2, va + 2.4]]) {
        const [x, z] = F.P(tu, tv);
        bag.add('timber', lathe([[0.3, 0.5], [0.3, 0.54], [0.001, 0.54]], 10, null, x, y, z));
        for (let q = 0; q < 3; q++) { const a = q * 2.09; bag.add('timber', rod([x + Math.cos(a) * 0.22, y, z + Math.sin(a) * 0.22], [x + Math.cos(a) * 0.2, y + 0.5, z + Math.sin(a) * 0.2], 0.025, 4)); }
        bag.add(rand() < 0.5 ? 'pottery_dark' : 'terracotta', lathe([[0.001, 0], [0.05, 0.005], [0.12, 0.04], [0.13, 0.05], [0.001, 0.045]], 10, null, x + 0.08, y + 0.54, z));   // a kylix
      }
    }
  }
  // the painted panels on the back wall (the Stoa Poikile): boards in frames, the figures painted on a light ground
  const wo = F.out.map((v) => -v), wu = F.along;               // the wall's face looks to the front; u along it
  const onWall = (u, v, yy) => { const [x, z] = F.P(u, v); return [x, yy, z]; };
  if (el.paintings) {
    const subj = el.paintings, n = subj.length, pw = (L - 2 * wt - 2) / n - 0.8;
    subj.forEach((s, i) => {
      const uc = wt + 1 + (i + 0.5) * (L - 2 * wt - 2) / n, vf = D - wt;
      B(bag, 'cedar', F.R(uc - pw / 2 - 0.12, vf - 0.08, uc + pw / 2 + 0.12, vf), y + 1.5, y + 4.1);
      B(bag, 'plaster_white', F.R(uc - pw / 2, vf - 0.1, uc + pw / 2, vf - 0.08), y + 1.62, y + 3.98);
      // two registers of figures: horsemen and fighters, the colours of the four-colour palette
      const kinds = { marathon: ['walker', 'horseman', 'walker', 'walker', 'horseman'], amazons: ['horseman', 'walker', 'horseman', 'maiden'], troy: ['walker', 'maiden', 'walker', 'god', 'maiden'], oinoe: ['walker', 'walker', 'horseman', 'walker'] }[s] ?? ['walker'];
      const cols2 = ['wall_red', 'paint_ochre', 'cloth_brown', 'paint_blue', 'hair_dark'];
      for (let row = 0; row < 2; row++) for (let j = 0; ; j++) {
        const kind = kinds[(j + row * 2) % kinds.length], fw = kind === 'horseman' ? 0.62 : 0.34, uu = uc - pw / 2 + 0.25 + j * (fw + 0.12) + row * 0.2;
        if (uu + fw > uc + pw / 2 - 0.2) break;
        const p = onWall(uu + fw / 2, vf - 0.1 - (j % 4) * 0.008, y + 1.75 + row * 1.1);       // each a little proud of the last: none share a plane
        bag.add(cols2[(i + j + row) % cols2.length], relief(kind, j, { p, u: [wu[0], 0, wu[1]], o: [wo[0], 0, wo[1]], s: 0.95, d: 0.006, flip: (j + row) % 3 === 2 }));
      }
    });
  }
  // the bronze shields of the Spartans taken at Sphakteria and of Skione, hung high on the back wall
  if (el.shields) {
    for (let u = wt + 1.6; u < L - wt - 1.4; u += 2.4) {
      const [x, yy, z] = onWall(u, D - wt, y + 4.75), g = lathe([[0.001, 0.07], [0.12, 0.068], [0.42, 0.04], [0.47, 0.012], [0.47, 0], [0.001, 0]], 16);
      g.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2).premultiply(new Matrix4().makeRotationY(Math.atan2(wo[0], wo[1]))).setPosition(x, yy, z));
      bag.add('bronze', g);
    }
  }
}

/** A marble Victory alighting, her wings spread: an acroterion. */
function nike(bag, x, y, z, yaw) {
  const f = human({ pose: 'stride', drape: 'peplos', h: 1.6, n: 7, arms: { l: [[-0.15, 0.7, 0.05], [-0.25, 0.8, 0.1]], r: [[0.16, 0.72, 0.05], [0.26, 0.85, 0.12]] } });
  for (const s of [-1, 1]) f.stone.push(blob([s * 0.32, 1.25, -0.12], 0.36, [1.0, 0.75, 0.18], 7), limb([s * 0.08, 1.24, -0.06], [s * 0.45, 1.55, -0.18], 0.06, 0.03, 5));
  const g = placed(f, x, y, z, yaw);
  bag.add('marble_smooth', g.stone);
  bag.add('limestone', lathe([[0.42, 0], [0.42, 0.25], [0.001, 0.25]], 10, null, x, y - 0.25, z));
}

/**
 * tholos: { c, r (outer), h (the wall), y, door ('e'), kitchen ('n') } — the round house of the prytaneis: the wall on its
 * stone socle, the door, six inner columns carrying the ring beam, the conical roof of lozenge-shaped tiles with its
 * antefixes, rafters inside; benches round the wall, the hearth, the table of the official measures; the kitchen and
 * pantry on the north.
 */
function tholos(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 9.16, h = el.h ?? 5.2, y = el.y ?? 0, th = 0.7, N = 36, doorA = 0;   // the door on the east (+x)
  bag.add('limestone', lathe([[r + 0.55, -0.9], [r + 0.55, 0.15], [r + 0.3, 0.15], [r + 0.3, 0.3], [0.001, 0.3]], N, null, cx, y, cz));
  col.floor([cx - r, cz - r, cx + r, cz + r], y + 0.3);
  const y0 = y + 0.3, dw = 1.7 / r;                                     // the door's half-angle
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2, rm = r - th / 2;
    const A = [cx + Math.cos(a0) * rm, cz + Math.sin(a0) * rm], Bp = [cx + Math.cos(a1) * rm, cz + Math.sin(a1) * rm];
    const inDoor = Math.abs(Math.atan2(Math.sin(am - doorA), Math.cos(am - doorA))) < dw * 0.5;
    const ext = rm * Math.PI / N * 0.02 + 0.04;
    if (!inDoor) { bag.add('limestone', orientedBox(A, Bp, th + 0.06, y0, y0 + 1.0, ext)); col.segment(A, Bp, th, y0, y0 + h); }
    bag.add('lime_plaster', orientedBox(A, Bp, th, inDoor ? y0 + 3.0 : y0 + 1.0, y0 + h, ext));
  }
  // the door frame and lintel of marble
  const dx = cx + r - th / 2;
  for (const s of [-1, 1]) bag.add('marble', box(dx - th / 2 - 0.05, y0, cz + s * 0.85 - (s > 0 ? 0 : 0.2), dx + th / 2 + 0.05, y0 + 3.0, cz + s * 0.85 + (s > 0 ? 0.2 : 0)));
  bag.add('marble', box(dx - th / 2 - 0.05, y0 + 3.0, cz - 1.1, dx + th / 2 + 0.08, y0 + 3.35, cz + 1.1));
  bag.add('marble', box(dx - th / 2 - 0.1, y0, cz - 0.85, dx + th / 2 + 0.1, y0 + 0.12, cz + 0.85));
  // six columns on an oval clear of the door's axis, the ring beam on them
  const top = y0 + h + 0.6;
  for (let k = 0; k < 6; k++) {
    const a = (k + 0.5) / 6 * Math.PI * 2, px = cx + Math.cos(a) * 4.6, pz = cz + Math.sin(a) * 3.6;
    STYLES.greek.column({ at: [px, pz], y: y0, h: top - y0, d: 0.62, mat: 'limestone', flutes: 0 }, { bag, col });
  }
  const ring = [];
  for (let k = 0; k < 6; k++) { const a = (k + 0.5) / 6 * Math.PI * 2; ring.push([cx + Math.cos(a) * 4.6, cz + Math.sin(a) * 3.6]); }
  for (let k = 0; k < 6; k++) bag.add('timber', orientedBox(ring[k], ring[(k + 1) % 6], 0.35, top, top + 0.4, 0.15));
  // the roof: a cone of tiles laid in lozenges, eaves overhanging the wall, a finial; inside, the rafters and boards
  const rise = r * 0.42, eave = r + 0.55, yE = y0 + h;
  bag.add('roof_tile', lathe([[eave, -0.08], [eave, 0.06], [0.001, rise + 0.06]], 48, null, cx, yE, cz));
  bag.add('timber', lathe([[0.001, rise - 0.12], [r - th, -0.02]], 48, null, cx, yE, cz));
  for (let k = 0; k < 24; k++) {
    const a = k / 24 * Math.PI * 2, rr = r - th - 0.05;
    bag.add('timber', rod([cx + Math.cos(a) * rr, yE - 0.12, cz + Math.sin(a) * rr], [cx + Math.cos(a) * 0.6, yE + rise * (1 - 0.6 / rr) - 0.22, cz + Math.sin(a) * 0.6], 0.07, 4));
  }
  // the lozenges: two families of cover-ridges spiralling up the cone, crossing
  const cone = (t, a) => { const rr = eave * (1 - t); return [cx + Math.cos(a) * rr, yE + 0.07 + rise * t, cz + Math.sin(a) * rr]; };
  for (let k = 0; k < 28; k++) for (const s of [-1, 1]) {
    let prev = cone(0, k / 28 * Math.PI * 2);
    for (let j = 1; j <= 9; j++) {
      const t = j / 10, p = cone(t, k / 28 * Math.PI * 2 + s * t * 0.9);
      bag.add('terracotta', rod(prev, p, 0.035, 3));
      prev = p;
    }
  }
  bag.add('terracotta', lathe([[0.55, 0], [0.45, 0.25], [0.2, 0.5], [0.3, 0.75], [0.12, 1.0], [0.001, 1.1]], 12, null, cx, yE + rise - 0.1, cz));
  for (let k = 0; k < 44; k++) {
    const a = k / 44 * Math.PI * 2, ex = cx + Math.cos(a) * (eave + 0.02), ez = cz + Math.sin(a) * (eave + 0.02);
    const g = box(-0.11, 0, -0.02, 0.11, 0.3, 0.02); g.applyMatrix4(new Matrix4().makeRotationY(-a + Math.PI / 2).setPosition(ex, yE + 0.04, ez));
    bag.add('terracotta', g);
  }
  // inside: the bench round the wall, the hearth, the table of the measures with its bronze vessels and weights
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2, rb = r - th - 0.3;
    if (Math.abs(Math.atan2(Math.sin(am - doorA), Math.cos(am - doorA))) < 0.32) continue;
    const A = [cx + Math.cos(a0) * rb, cz + Math.sin(a0) * rb], Bp = [cx + Math.cos(a1) * rb, cz + Math.sin(a1) * rb];
    bag.add('limestone', orientedBox(A, Bp, 0.55, y0, y0 + 0.45, 0.03)); col.segment(A, Bp, 0.55, y0, y0 + 0.45);
  }
  bag.add('limestone', box(cx - 0.6, y0, cz - 0.6, cx + 0.6, y0 + 0.75, cz + 0.6)); bag.add('limestone', box(cx - 0.7, y0 + 0.75, cz - 0.7, cx + 0.7, y0 + 0.88, cz + 0.7));
  bag.add('rubble', box(cx - 0.45, y0 + 0.88, cz - 0.45, cx + 0.45, y0 + 0.95, cz + 0.45));
  col.rect([cx - 0.7, cz - 0.7, cx + 0.7, cz + 0.7], y0, y0 + 0.95);
  const mx = cx - 2.0, mz = cz - 5.2;
  bag.add('marble', box(mx - 1.0, y0 + 0.78, mz - 0.45, mx + 1.0, y0 + 0.86, mz + 0.45));
  for (const sx of [-1, 1]) bag.add('marble', box(mx + sx * 0.8 - 0.08, y0, mz - 0.35, mx + sx * 0.8 + 0.08, y0 + 0.78, mz + 0.35));
  col.rect([mx - 1.0, mz - 0.45, mx + 1.0, mz + 0.45], y0, y0 + 0.86);
  [[0.16, 0.2], [0.12, 0.15], [0.09, 0.11]].forEach(([rr, hh], i) => bag.add('bronze', lathe([[rr * 0.8, 0], [rr, hh * 0.3], [rr, hh], [rr * 0.85, hh], [rr * 0.85, 0.02], [0.001, 0.02]], 14, null, mx - 0.6 + i * 0.4, y0 + 0.86, mz)));
  for (let i = 0; i < 4; i++) bag.add('lead', box(mx + 0.3 + i * 0.14, y0 + 0.86, mz + 0.1, mx + 0.4 + i * 0.14, y0 + 0.86 + 0.03 + i * 0.012, mz + 0.22));
  // the kitchen and pantry on the north: two small rooms of rubble under a pent roof, the hearth and the pots
  const kz1 = cz - r - 0.25, kz0 = kz1 - 4.2, kx0 = cx - 5.0, kx1 = cx + 5.0;
  const kw = (rr, y1 = y0 + 3.2) => { bag.add('rubble', box(rr[0], y, rr[1], rr[2], y1, rr[3])); col.rect(rr, y, y1); };
  kw([kx0, kz0, kx1, kz0 + 0.5]); kw([kx0, kz0 + 0.5, kx0 + 0.5, cz - Math.sqrt(r * r - 25) + 0.3], y0 + 2.6); kw([kx1 - 0.5, kz0 + 0.5, kx1, cz - Math.sqrt(r * r - 25) + 0.3], y0 + 2.6);
  kw([cx - 0.25, kz0 + 0.5, cx + 0.25, kz1]);
  bag.add('roof_tile', frustum([kx0 - 0.3, kz0 - 0.4, kx1 + 0.3, kz1 + 0.6], y0 + 3.2, y0 + 3.6, 0, 0, 0, 0));
  col.floor([kx0, kz0 + 0.5, kx1, kz1], y);
  bag.add('rubble', box(cx - 3.6, y, kz0 + 0.5, cx - 2.2, y + 0.7, kz0 + 1.3));                // the cooking bench
  bag.add('rubble', box(cx - 3.45, y + 0.7, kz0 + 0.6, cx - 2.35, y + 0.74, kz0 + 1.2));
  for (const [px, pz, s] of [[cx - 3.2, kz0 + 0.9, 0.9], [cx - 2.6, kz0 + 0.9, 0.7]]) bag.add('pottery_dark', lathe([[0.1 * s, 0], [0.2 * s, 0.1 * s], [0.22 * s, 0.22 * s], [0.16 * s, 0.32 * s], [0.17 * s, 0.35 * s], [0.001, 0.33 * s]], 12, null, px, y + 0.74, pz));
  for (let i = 0; i < 6; i++) bag.add('terracotta', lathe([[0.04, 0], [0.09, 0.08], [0.2, 0.3], [0.21, 0.42], [0.12, 0.6], [0.06, 0.68], [0.07, 0.75], [0.001, 0.75]], 10, null, cx + 1.0 + (i % 3) * 0.55, y, kz0 + 1.0 + Math.floor(i / 3) * 0.6));
}

/** altar12: { c, y, w, d } — the Altar of the Twelve Gods: the low enclosure of marble parapet slabs between posts, open on
 *  the west and the east, the altar on its step in the middle. */
function altar12(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, w = (el.w ?? 9.35) / 2, d = (el.d ?? 9.8) / 2, ph = 1.0;
  bag.add('limestone', box(cx - w - 0.3, y - 0.6, cz - d - 0.3, cx + w + 0.3, y + 0.12, cz + d + 0.3)); col.floor([cx - w - 0.3, cz - d - 0.3, cx + w + 0.3, cz + d + 0.3], y + 0.12);
  const yb = y + 0.12;
  const side = (a, b, gap) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.round(L / 1.2);
    for (let i = 0; i <= n; i++) { const s = i * L / n, x = a[0] + ux * s, z = a[1] + uz * s; bag.add('marble', box(x - 0.13, yb, z - 0.13, x + 0.13, yb + ph + 0.1, z + 0.13)); }
    for (let i = 0; i < n; i++) {
      const s0 = i * L / n + 0.13, s1 = (i + 1) * L / n - 0.13, m = (s0 + s1) / 2;
      if (gap && Math.abs(m - L / 2) < 1.0) continue;
      const P0 = [a[0] + ux * s0, a[1] + uz * s0], P1 = [a[0] + ux * s1, a[1] + uz * s1];
      bag.add('marble', orientedBox(P0, P1, 0.12, yb, yb + ph)); col.segment(P0, P1, 0.15, yb, yb + ph);
      // the slab's carved panel: a raised frame
      bag.add('marble_smooth', orientedBox([P0[0] + ux * 0.12, P0[1] + uz * 0.12], [P1[0] - ux * 0.12, P1[1] - uz * 0.12], 0.16, yb + 0.15, yb + 0.22));
    }
  };
  side([cx - w, cz - d], [cx + w, cz - d], false); side([cx - w, cz + d], [cx + w, cz + d], false);
  side([cx - w, cz - d], [cx - w, cz + d], true); side([cx + w, cz - d], [cx + w, cz + d], true);
  bag.add('marble', box(cx - 1.3, yb, cz - 1.0, cx + 1.3, yb + 0.25, cz + 1.0));
  bag.add('marble', box(cx - 1.0, yb + 0.25, cz - 0.75, cx + 1.0, yb + 1.0, cz + 0.75));
  bag.add('marble', box(cx - 1.12, yb + 1.0, cz - 0.87, cx + 1.12, yb + 1.12, cz + 0.87));
  for (const s of [-1, 1]) bag.add('marble_smooth', lathe([[0.2, 0], [0.2, 0.3], [0.001, 0.3]], 10, null, cx, yb + 1.12 - 0.15, cz + s * 0.72).rotateX(0));
  bag.add('rubble', box(cx - 0.7, yb + 1.12, cz - 0.45, cx + 0.7, yb + 1.17, cz + 0.45));
  col.rect([cx - 1.3, cz - 1.0, cx + 1.3, cz + 1.0], yb, yb + 1.17);
}

/** herm: { at, rot, y } — a pillar of marble with the bearded head of Hermes, the stumps of arms, on a low base. */
function herm(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, m = new Matrix4().makeRotationY(el.rot ?? 0).setPosition(x, y, z), parts = [];
  parts.push(box(-0.28, 0, -0.25, 0.28, 0.22, 0.25), box(-0.17, 0.22, -0.14, 0.17, 1.38, 0.14), box(-0.25, 1.24, -0.06, 0.25, 1.33, 0.06));
  parts.push(blob([0, 1.53, 0.01], 0.13, [0.85, 1.05, 1.0], 9), blob([0, 1.42, 0.08], 0.09, [0.9, 1.1, 0.7], 7), blob([0, 1.6, -0.02], 0.13, [0.95, 0.75, 1.0], 8));
  parts.push(limb([0, 1.38, 0], [0, 1.45, 0.01], 0.06, 0.055, 7));
  const g = merge(parts); g.applyMatrix4(m); bag.add('marble_smooth', g);
  col.circle(x, z, 0.3, y, y + 1.7);
}

/** horos: { at, rot, y } — the boundary stone: "I am the boundary of the Agora", the letters cut down its face. */
function horos(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, m = new Matrix4().makeRotationY(el.rot ?? 0).setPosition(x, y, z), parts = [box(-0.2, -0.3, -0.12, 0.2, 1.2, 0.12)], cut = [];
  for (let i = 0; i < 14; i++) { const v = 1.08 - i * 0.075; cut.push(box(-0.04, v - 0.05, 0.119, 0.04, v, 0.126)); if (i % 3) cut.push(box(-0.09, v - 0.008, 0.119, 0.09, v, 0.126)); }
  const g = merge(parts); g.applyMatrix4(m); bag.add('marble_smooth', g);                // one stone: no joints
  const c = merge(cut); c.applyMatrix4(m); bag.add('marble_dark', c);
  col.circle(x, z, 0.25, y, y + 1.2);
}

/**
 * booth: { rect, front, kind ('pots' | 'oil' | 'fish' | 'bread' | 'bank' | 'myrtle'), y, seed } — a market booth: screens
 * of wicker on three sides, a cloth on poles over the front, a trestle table with the goods, more on the ground; the
 * seller sitting behind and a buyer before it.
 */
function booth(el, ctx) {
  const { bag, col } = ctx, F = frame(el.rect, el.front ?? 's'), { L, D } = F, y = el.y ?? 0, rand = rng(el.seed ?? 5), kind = el.kind ?? 'pots';
  const R = (u0, v0, u1, v1, y0, y1, m) => B(bag, m, F.R(u0, v0, u1, v1), y + y0, y + y1);
  // the screens (gerra) of wicker on posts
  for (const [u0, v0, u1, v1] of [[0, D - 0.06, L, D], [0, 0.8, 0.06, D], [L - 0.06, 0.8, L, D]]) R(u0, v0, u1, v1, 0.05, 1.8, 'wicker');
  for (const [u, v] of [[0, D], [L, D], [0, 0.8], [L, 0.8], [0, 0], [L, 0]]) R(u - 0.05, v - 0.05, u + 0.05, v + 0.05, 0, v > 0.5 ? 2.1 : 2.2, 'timber');
  R(-0.15, -0.15, L + 0.15, D + 0.1, 2.2, 2.24, el.awning ?? ['cloth_white', 'cloth_ochre', 'linen'][Math.floor(rand() * 3)]);
  col.rect(F.R(0, D - 0.06, L, D), y, y + 1.8);
  // the table across the front
  const tm = kind === 'fish' ? 'marble' : 'timber';
  R(0.3, 0.25, L - 0.3, 1.0, 0.78, 0.84, tm);
  for (const u of [0.45, L - 0.45]) R(u - 0.05, 0.4, u + 0.05, 0.85, 0, 0.78, tm);
  col.rect(F.R(0.3, 0.25, L - 0.3, 1.0), y, y + 0.84);
  const ty = y + 0.84, put = (m, g, u, v, yy = ty) => { const [x, z] = F.P(u, v); g.translate(x, yy, z); bag.add(m, g); };
  const amph = [[0.04, 0], [0.09, 0.08], [0.2, 0.3], [0.21, 0.42], [0.12, 0.6], [0.06, 0.68], [0.07, 0.75], [0.001, 0.75]];
  if (kind === 'pots') {
    // the black-glazed and the red-figured: cups, oil flasks, a mixing bowl
    for (let i = 0; i < 7; i++) {
      const u = 0.55 + i * (L - 1.1) / 6, v = 0.45 + (i % 2) * 0.3, t = i % 3;
      if (t === 0) put('pottery_dark', lathe([[0.001, 0], [0.04, 0.005], [0.04, 0.05], [0.13, 0.09], [0.14, 0.1], [0.001, 0.09]], 10), u, v);
      else if (t === 1) put(i % 2 ? 'pottery_dark' : 'terracotta', lathe([[0.04, 0], [0.06, 0.04], [0.06, 0.2], [0.04, 0.22], [0.015, 0.25], [0.02, 0.3], [0.001, 0.3]], 10), u, v);
      else put('terracotta', lathe([[0.06, 0], [0.08, 0.04], [0.16, 0.18], [0.19, 0.3], [0.17, 0.31], [0.001, 0.29]], 12), u, v);
    }
    for (let i = 0; i < 4; i++) put(i % 2 ? 'pottery_dark' : 'terracotta', lathe([[0.1, 0], [0.18, 0.1], [0.24, 0.32], [0.2, 0.42], [0.21, 0.46], [0.001, 0.44]], 12), 0.5 + i * 0.5, D - 0.5, y);
  } else if (kind === 'oil') {
    for (let i = 0; i < Math.floor((L - 0.6) / 0.45); i++) for (let j = 0; j < 2; j++) put('terracotta', lathe(amph, 10), 0.5 + i * 0.45, D - 0.45 - j * 0.48, y);
    for (let i = 0; i < 4; i++) put('terracotta', lathe([[0.03, 0], [0.06, 0.05], [0.065, 0.15], [0.03, 0.2], [0.035, 0.24], [0.001, 0.24]], 8), 0.6 + i * 0.4, 0.6);
  } else if (kind === 'fish') {
    for (let i = 0; i < 9; i++) {
      const g = blob([0, 0.05, 0], 0.12 + rand() * 0.08, [2.6, 0.4, 0.7], 6), [x, z] = F.P(0.6 + (i % 5) * (L - 1.2) / 4, 0.42 + Math.floor(i / 5) * 0.35);
      g.applyMatrix4(new Matrix4().makeRotationY(F.yaw + 0.3 * (rand() - 0.5) + (F.alongX ? 0 : Math.PI / 2)).setPosition(x, ty, z)); bag.add('steel_grey', g);
    }
    put('wicker', lathe([[0.25, 0], [0.32, 0.35], [0.3, 0.36], [0.22, 0.03], [0.001, 0.03]], 10), L - 0.6, D - 0.5, y);
  } else if (kind === 'bread') {
    for (let i = 0; i < 8; i++) put('stucco_siena', lathe([[0.12, 0], [0.13, 0.04], [0.08, 0.1], [0.001, 0.11]], 10), 0.5 + (i % 4) * (L - 1.0) / 3, 0.45 + Math.floor(i / 4) * 0.3);
    for (let i = 0; i < 3; i++) { put('wicker', lathe([[0.2, 0], [0.26, 0.28], [0.24, 0.28], [0.18, 0.03], [0.001, 0.03]], 10), 0.6 + i * 0.7, D - 0.45, y); put('stucco_ochre', lathe([[0.22, 0], [0.12, 0.08], [0.001, 0.1]], 10), 0.6 + i * 0.7, D - 0.45, y + 0.26); }
  } else if (kind === 'myrtle') {
    for (let i = 0; i < 6; i++) put('lotus_leaf', blob([0, 0.12, 0], 0.16, [1, 0.8, 1], 6), 0.5 + i * (L - 1.0) / 5, 0.55);
    for (let i = 0; i < 3; i++) put('wicker', lathe([[0.2, 0], [0.26, 0.3], [0.001, 0.3]], 10), 0.7 + i * 0.7, D - 0.45, y);
  } else {
    // the banker's table: coins in heaps, a balance, a chest
    for (let i = 0; i < 6; i++) put(i % 2 ? 'silver' : 'bronze', lathe([[0.05, 0], [0.04, 0.025 + rand() * 0.03], [0.001, 0.035]], 8), 0.6 + i * 0.25, 0.6);
    put('bronze', rod([0, 0, 0], [0, 0.35, 0], 0.012, 4), L / 2 + 0.3, 0.5); put('bronze', box(-0.22, 0.34, -0.01, 0.22, 0.36, 0.01), L / 2 + 0.3, 0.5);
    put('wood_dark', box(-0.35, 0, -0.25, 0.35, 0.45, 0.25), L / 2, D - 0.45, y);
  }
  // the seller behind the table and a buyer before it (the figures of the town's life)
  const fig = STYLES.life?.elements?.figure;
  if (fig) {
    // a figure faces −z: turned by θ it faces (−sin θ, −cos θ)
    const toOut = Math.atan2(-F.out[0], -F.out[1]), toIn = Math.atan2(F.out[0], F.out[1]), clothes = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'linen', 'cloth_red'];
    const su = L / 2 + (rand() - 0.5) * 0.6, [sx, sz] = F.P(su, 1.55), sit = kind !== 'fish' && rand() < 0.5;
    if (sit) { const [qx, qz] = F.P(su, 1.62); bag.add('timber', box(qx - 0.22, y, qz - 0.22, qx + 0.22, y + 0.45, qz + 0.22)); }
    fig({ t: 'figure', at: [sx, sz], y, rot: toOut, seed: el.seed ?? 3, pose: sit ? 'sit' : 'stand', dress: rand() < 0.5 ? 'tunic' : 'robe', cloth: clothes[Math.floor(rand() * 5)], skin: 'skin_medium', hat: rand() < 0.3 ? 'cap' : 'none' }, ctx);
    if (rand() < 0.75) {
      const [bx, bz] = F.P(L * (0.25 + rand() * 0.5), -0.75);
      fig({ t: 'figure', at: [bx, bz], y, rot: toIn, seed: (el.seed ?? 3) + 11, pose: rand() < 0.4 ? 'talk' : 'stand', dress: 'robe', cloth: clothes[Math.floor(rand() * 5)], skin: rand() < 0.5 ? 'skin_medium' : 'skin_light', hat: rand() < 0.25 ? 'veil' : 'none', carry: rand() < 0.2 ? 'basket' : 'none' }, ctx);
    }
  }
}

/** zeus_statue: { at, y, rot } — the bronze Zeus of Freedom before his stoa, on a stepped base. */
function zeusStatue(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('marble', box(x - 1.0, y, z - 1.0, x + 1.0, y + 0.3, z + 1.0)); bag.add('marble', box(x - 0.8, y + 0.3, z - 0.8, x + 0.8, y + 1.6, z + 0.8)); bag.add('marble', box(x - 0.9, y + 1.6, z - 0.9, x + 0.9, y + 1.75, z + 0.9));
  col.rect([x - 1.0, z - 1.0, x + 1.0, z + 1.0], y, y + 4.5);
  const f = human({ pose: 'ease', drape: 'mantle', h: 2.6, n: 10, spear: 'l', spearDir: [0, 1, 0], arms: { r: [[0.16, 0.62, 0.03], [0.2, 0.55, 0.16]], l: [[-0.16, 0.7, 0.02], [-0.18, 0.82, 0.05]] } });
  f.metal.push(limb([0.2 * 2.6, 0.56 * 2.6, 0.18 * 2.6], [0.2 * 2.6, 0.56 * 2.6, 0.42 * 2.6], 0.03, 0.05, 5));     // the thunderbolt
  const g = placed({ stone: [...f.stone, ...f.metal] }, x, y + 1.75, z, el.rot ?? 0);
  bag.add('bronze', g.stone);
}

/** cult_pair: { at, y } — the bronze Hephaistos and Athena of the Hephaisteion side by side on their base, facing east. */
function cultPair(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, bh = 1.15;
  bag.add('marble_dark', box(x - 0.9, y, z - 2.0, x + 0.9, y + 0.22, z + 2.0));
  bag.add('marble_dark', box(x - 0.75, y + 0.22, z - 1.85, x + 0.75, y + bh - 0.15, z + 1.85));
  bag.add('marble_dark', box(x - 0.85, y + bh - 0.15, z - 1.95, x + 0.85, y + bh, z + 1.95));
  col.rect([x - 0.9, z - 2.0, x + 0.9, z + 2.0], y, y + bh + 2.6);
  // Hephaistos in the craftsman's short chiton and cap, the hammer in his right hand; Athena armed, the spear and the shield
  const heph = human({ pose: 'ease', drape: 'chiton', h: 2.5, n: 10, arms: { r: [[0.15, 0.6, 0.06], [0.17, 0.52, 0.2]], l: [[-0.15, 0.62, 0.02], [-0.17, 0.48, 0.06]] } });
  heph.metal.push(limb([0.17 * 2.5, 0.52 * 2.5, 0.2 * 2.5], [0.17 * 2.5, 0.75 * 2.5, 0.22 * 2.5], 0.022, 0.022, 5), box(0.17 * 2.5 - 0.06, 0.75 * 2.5, 0.22 * 2.5 - 0.1, 0.17 * 2.5 + 0.06, 0.75 * 2.5 + 0.1, 0.22 * 2.5 + 0.1));
  const ath = human({ pose: 'stand', drape: 'peplos', helmet: true, shield: 'l', spear: 'r', h: 2.6, n: 10, arms: { r: [[0.16, 0.66, 0.02], [0.17, 0.78, 0.06]] } });
  for (const [f, dz] of [[heph, 0.95], [ath, -0.95]]) bag.add('bronze', placed({ stone: [...f.stone, ...f.metal] }, x, y + bh, z + dz, Math.PI / 2).stone);
}

Object.assign(STYLES.greek.elements, { stoa, tholos, altar12, herm, horos, booth, zeus_statue: zeusStatue, cult_pair: cultPair });
