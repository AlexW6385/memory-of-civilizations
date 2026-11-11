// The houses and street fittings of Justinian's Constantinople (docs/settlements/constantinople.md §11):
// the tenements of the city's streets, three storeys of cloisonné brick and stone with a tabernae row
// below, windows with arched heads and stone surrounds, projecting timber maeniana (balconies and
// galleries) on brackets, tiled roofs on their rafter ends or flat roofs with a sun-room (heliakon);
// courtyard houses behind a walled garden; fountains (a niche fountain on a wall, a basin under a
// canopy). Registered into the `roman` style, the style of the city's plans.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import '../roman/town.js';
import '../../objects/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const NONE = { circle() {}, rect() {}, segment() {}, floor() {} };

/** A flat polygon (points in 3D, convex, counter-clockwise seen from the side the normal points to), a fan. */
function flat(pts, n) {
  const t = [], p0 = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const ux = a[0] - p0[0], uy = a[1] - p0[1], uz = a[2] - p0[2], vx = b[0] - p0[0], vy = b[1] - p0[1], vz = b[2] - p0[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) t.push(...p0, ...a, ...b); else t.push(...p0, ...b, ...a);
  }
  return fromTriangles(t);
}
/** A convex solid from its 8 corners (bottom four, top four), faces outward. */
function solid8(c) {
  const f = [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  let cx = 0, cy = 0, cz = 0;
  for (const p of c) { cx += p[0] / 8; cy += p[1] / 8; cz += p[2] / 8; }
  for (const q of f) {
    const [a, b, d, e] = q.map((i) => c[i]);
    for (const tri of [[a, b, d], [a, d, e]]) {
      const ux = tri[1][0] - tri[0][0], uy = tri[1][1] - tri[0][1], uz = tri[1][2] - tri[0][2], vx = tri[2][0] - tri[0][0], vy = tri[2][1] - tri[0][1], vz = tri[2][2] - tri[0][2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const out = nx * (tri[0][0] - cx) + ny * (tri[0][1] - cy) + nz * (tri[0][2] - cz) >= 0;
      t.push(...(out ? [...tri[0], ...tri[1], ...tri[2]] : [...tri[0], ...tri[2], ...tri[1]]));
    }
  }
  return fromTriangles(t);
}

/** The faces of a rectangle: origin a, along u, out o, length L. */
const faces = ([x0, z0, x1, z1]) => [
  { a: [x0, z0], u: [1, 0], o: [0, -1], L: x1 - x0 }, { a: [x0, z1], u: [1, 0], o: [0, 1], L: x1 - x0 },
  { a: [x0, z0], u: [0, 1], o: [-1, 0], L: z1 - z0 }, { a: [x1, z0], u: [0, 1], o: [1, 0], L: z1 - z0 },
];
/** The drawing helpers of one face of a wall: boxes along it (fb) and arched heads (arch), at distances d out of its plane. */
function onFace(bag, F) {
  const P = (u, d) => [F.a[0] + F.u[0] * u + F.o[0] * d, F.a[1] + F.u[1] * u + F.o[1] * d];
  const fb = (u0, u1, ya, yb, d0, d1, mat) => {
    const A = P(u0, d0), B = P(u1, d1);
    bag.add(mat, box(Math.min(A[0], B[0]), ya, Math.min(A[1], B[1]), Math.max(A[0], B[0]), yb, Math.max(A[1], B[1])));
  };
  /** A semicircular face (half disc) over uc, springing at ys, radius r, at distance d, material mat. */
  const arch = (uc, ys, r, d, mat, n = 8) => {
    const pts = [];
    for (let k = 0; k <= n; k++) { const a = Math.PI * k / n, p = P(uc + Math.cos(a) * r, d); pts.push([p[0], ys + Math.sin(a) * r, p[1]]); }
    bag.add(mat, flat(pts, [F.o[0], 0, F.o[1]]));
  };
  return { P, fb, arch };
}

const WALLS = ['brick', 'brick', 'brick', 'stucco_warm', 'plaster'];
const SHUT = ['shutter_brown', 'shutter_brown', 'shutter_green', 'wood_painted'];
const AWN = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_green', 'linen'];

/**
 * byz_house: { rect, seed, y, simple, balcony (chance of a maenianum), court (a walled yard behind) } — a tenement of
 * the 6th-century city: ground floor of tabernae (wide doors under timber lintels, boards, awnings) and the stair door,
 * two upper floors with arched windows (single or paired on a colonette) in stone surrounds, the walls banded in the
 * cloisonné manner (courses of stone between brick), a stone plinth, the maenianum on the long face, the eaves on
 * their rafter ends, a tiled hip roof, or a flat roof with a sun-room. `simple` (far away): the mass, the roof, the
 * dark openings and the maenianum's floor only.
 */
function byzHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), far = !!el.simple, y = el.y ?? 0;
  let [x0, z0, x1, z1] = el.rect;
  const yard = el.court ?? (rand() < 0.22 && Math.min(x1 - x0, z1 - z0) > 12);
  const full = el.rect, W0 = x1 - x0, D0 = z1 - z0, yardAlongZ = D0 >= W0;
  if (yard) { if (yardAlongZ) z1 = z0 + D0 * 0.62; else x1 = x0 + W0 * 0.62; }
  const n = 2 + (rand() < 0.62 ? 1 : 0), g0 = 3.9, sh = 3.15, H = g0 + (n - 1) * sh;
  const wall = WALLS[Math.floor(rand() * WALLS.length)], upper = rand() < 0.4 ? ['plaster', 'stucco_warm', 'lime_plaster'][Math.floor(rand() * 3)] : wall;
  const banded = (wall === 'brick' || upper === 'brick') && rand() < 0.75;
  const rect = [x0, z0, x1, z1];
  bag.add(wall, box(x0, y - 0.5, z0, x1, y + g0, z1));
  bag.add(upper, box(x0, y + g0, z0, x1, y + H, z1));
  col.rect(rect, y - 0.5, y + H);
  const fl = faces(rect);
  const long = fl[0].L >= fl[2].L ? (rand() < 0.5 ? 0 : 1) : (rand() < 0.5 ? 2 : 3);
  const flat = rand() < 0.28, sunroom = flat && rand() < 0.6;
  const mType = rand() < 0.45 ? 'open' : rand() < 0.65 ? 'closed' : 'corbel', balcony = !far && n > 2 !== undefined && rand() < (el.balcony ?? 0.6);
  const shut = SHUT[Math.floor(rand() * SHUT.length)];
  fl.forEach((F, fi) => {
    const { fb, arch } = onFace(bag, F), isLong = fi === long;
    // ground floor: tabernae on the long faces, a door and a window or two on the short ones
    const nb = isLong ? Math.max(1, Math.floor((F.L - 1.2) / 4.2)) : Math.max(1, Math.floor((F.L - 1.2) / 5.5)), bw = (F.L - 1.2) / nb, stair = isLong ? Math.floor(nb / 2) : 0;
    for (let i = 0; i < nb; i++) {
      const uc = 0.6 + (i + 0.5) * bw;
      if (i === stair) {
        fb(uc - 0.7, uc + 0.7, y, y + 2.5, -0.05, 0.02, 'opening'); arch(uc, y + 2.5, 0.7, 0.02, 'opening');
        if (far) continue;
        for (const s of [-1, 1]) fb(s < 0 ? uc - 1.0 : uc + 0.75, s < 0 ? uc - 0.75 : uc + 1.0, y, y + 2.5, -0.05, 0.14, 'limestone');
        arch(uc, y + 2.5, 1.0, 0.0, 'limestone'); arch(uc, y + 2.5, 0.7, 0.05, 'opening');
        fb(uc - 0.8, uc + 0.8, y, y + 0.14, -0.05, 0.4, 'limestone');
        continue;
      }
      if (isLong) {
        const w = Math.min(2.8, bw - 1.0);
        fb(uc - w / 2, uc + w / 2, y, y + 2.9, -0.05, 0.02, 'opening');
        if (far) continue;
        fb(uc - w / 2 - 0.2, uc + w / 2 + 0.2, y + 2.9, y + 3.2, -0.05, 0.12, 'timber');           // the lintel
        for (const s of [-1, 1]) fb(s < 0 ? uc - w / 2 - 0.3 : uc + w / 2, s < 0 ? uc - w / 2 : uc + w / 2 + 0.3, y, y + 2.9, -0.05, 0.16, 'limestone');   // the jambs
        fb(uc - w / 2 - 0.1, uc + w / 2 + 0.1, y - 0.1, y + 0.1, -0.05, 0.3, 'limestone');
        const r = rand();
        if (r < 0.28) fb(uc - w / 2, uc + w / 2, y + 0.1, y + 2.9, 0.03, 0.09, 'timber');                       // shut with its boards
        else if (r < 0.7) {                                                                                      // a counter in the door, an awning over it
          fb(uc - w / 2 + 0.05, uc + w / 2 - 0.05, y + 0.1, y + 0.95, 0.03, 0.55, 'limestone');
          fb(uc - w / 2 + 0.05, uc + w / 2 - 0.05, y + 0.95, y + 1.0, 0.0, 0.6, 'marble');
          const m = AWN[Math.floor(rand() * AWN.length)], aw = (w + 0.6) / 2, Q = onFace(bag, F).P;
          const c = [Q(uc - aw, 0.02), Q(uc + aw, 0.02), Q(uc + aw, 1.45), Q(uc - aw, 1.45)];
          bag.add(m, solid8([[c[0][0], y + 3.45, c[0][1]], [c[1][0], y + 3.45, c[1][1]], [c[2][0], y + 2.7, c[2][1]], [c[3][0], y + 2.7, c[3][1]], [c[0][0], y + 3.5, c[0][1]], [c[1][0], y + 3.5, c[1][1]], [c[2][0], y + 2.75, c[2][1]], [c[3][0], y + 2.75, c[3][1]]]));
        }
        fb(uc - 0.45, uc + 0.45, y + 3.35, y + 3.8, -0.05, 0.02, 'opening');                                       // the mezzanine's little window
      } else {
        fb(uc - 0.55, uc + 0.55, y + 0.9, y + 2.2, -0.05, 0.02, 'opening'); arch(uc, y + 2.2, 0.55, 0.02, 'opening');
        if (far) continue;
        arch(uc, y + 2.2, 0.7, 0.0, 'limestone'); fb(uc - 0.7, uc - 0.55, y + 0.8, y + 2.2, -0.05, 0.07, 'limestone'); fb(uc + 0.55, uc + 0.7, y + 0.8, y + 2.2, -0.05, 0.07, 'limestone');
        fb(uc - 0.65, uc + 0.65, y + 0.72, y + 0.9, -0.05, 0.22, 'limestone');
        if (rand() < 0.5) fb(uc - 0.55, uc + 0.55, y + 0.9, y + 2.2, 0.03, 0.06, 'iron');                              // a grille
      }
    }
    // the upper storeys
    const nw = Math.max(1, Math.floor((F.L - 1.0) / 3.4)), ww = (F.L - 1.0) / nw;
    for (let k = 1; k < n; k++) {
      const yk = y + g0 + (k - 1) * sh, wy = yk + 0.55, wh = 1.35;
      if (!far) fb(0, F.L, yk - 0.1, yk + 0.06, -0.05, 0.1, 'limestone');                                           // the string course at the floor
      for (let i = 0; i < nw; i++) {
        const uc = 0.5 + (i + 0.5) * ww, pair = rand() < 0.4 && ww > 2.8;
        if (balcony && isLong && k === 1) continue;                                                                // (the maenianum's own windows)
        if (pair) {
          for (const s of [-1, 1]) { fb(uc + s * 0.42 - 0.26, uc + s * 0.42 + 0.26, wy, wy + wh, -0.05, 0.02, 'opening'); arch(uc + s * 0.42, wy + wh, 0.26, 0.02, 'opening', 6); }
          if (far) continue;
          arch(uc, wy + wh, 0.95, 0.0, 'limestone', 8); arch(uc, wy + wh, 0.8, 0.01, 'limestone', 8);
          fb(uc - 0.04, uc + 0.04, wy, wy + wh + 0.2, 0.0, 0.14, 'marble');                                         // the colonette between
          fb(uc - 0.95, uc - 0.8, wy - 0.1, wy + wh, -0.05, 0.09, 'limestone'); fb(uc + 0.8, uc + 0.95, wy - 0.1, wy + wh, -0.05, 0.09, 'limestone');
          fb(uc - 1.0, uc + 1.0, wy - 0.16, wy - 0.02, -0.05, 0.2, 'limestone');
        } else {
          fb(uc - 0.36, uc + 0.36, wy, wy + wh, -0.05, 0.02, 'opening'); arch(uc, wy + wh, 0.36, 0.02, 'opening', 6);
          if (far) continue;
          arch(uc, wy + wh, 0.5, 0.0, 'limestone', 6); fb(uc - 0.5, uc - 0.36, wy - 0.1, wy + wh, -0.05, 0.08, 'limestone'); fb(uc + 0.36, uc + 0.5, wy - 0.1, wy + wh, -0.05, 0.08, 'limestone');
          fb(uc - 0.58, uc + 0.58, wy - 0.16, wy - 0.02, -0.05, 0.18, 'limestone');
          const r = rand();
          if (r < 0.35) for (const s of [-1, 1]) fb(s < 0 ? uc - 0.76 : uc + 0.5, s < 0 ? uc - 0.5 : uc + 0.76, wy, wy + wh + 0.1, -0.05, 0.05, shut);   // the shutters, folded back
          else if (r < 0.5) fb(uc - 0.36, uc + 0.36, wy, wy + wh * 0.7, 0.03, 0.06, shut);
        }
      }
    }
    if (far) return;
    // the bands of the cloisonné courses (stone between the brick), a plinth, the cornice
    fb(-0.05, F.L + 0.05, y, y + 0.4, -0.05, 0.08, 'limestone');
    if (banded) for (let k = 0; k < n; k++) for (const yb of k ? [0.55, 1.6, 2.5] : [1.2, 2.5, 3.5]) {
      const yy = y + (k ? g0 + (k - 1) * sh : 0) + yb;
      if (yy < y + H - 0.4) fb(0, F.L, yy, yy + 0.12, -0.05, 0.03, 'travertine');
    }
    fb(-0.2, F.L + 0.2, y + H - 0.3, y + H - 0.1, -0.05, 0.2, 'brick');
    fb(-0.35, F.L + 0.35, y + H - 0.1, y + H, -0.05, 0.34, 'limestone');
    // the maenianum
    if (balcony && isLong) {
      const yb = y + g0, dep = mType === 'open' ? 1.5 : 1.1, a0 = 0.5, a1 = F.L - 0.5;
      for (let u = a0 + 0.3; u < a1 - 0.2; u += 1.5) fb(u - 0.13, u + 0.13, yb - 0.55, yb - 0.1, -0.05, dep - 0.1, 'limestone');   // brackets
      fb(a0, a1, yb - 0.1, yb + 0.1, -0.05, dep, 'timber');                                                       // the floor
      fb(a0 - 0.05, a1 + 0.05, yb + 0.1, yb + 0.16, dep - 0.12, dep + 0.05, 'wood_dark');                         // the sill beam
      if (mType === 'open') {
        const np = Math.max(2, Math.round((a1 - a0) / 1.6));
        for (let i = 0; i <= np; i++) { const u = a0 + 0.08 + i * (a1 - a0 - 0.16) / np; fb(u - 0.07, u + 0.07, yb + 0.16, yb + 2.5, dep - 0.2, dep - 0.06, 'timber'); }   // posts
        for (let i = 0; i < np; i++) { const u0 = a0 + 0.08 + i * (a1 - a0 - 0.16) / np, u1 = u0 + (a1 - a0 - 0.16) / np;
          fb(u0 + 0.07, u1 - 0.07, yb + 0.16, yb + 0.28, dep - 0.2, dep - 0.08, 'timber'); fb(u0 + 0.07, u1 - 0.07, yb + 0.95, yb + 1.03, dep - 0.2, dep - 0.08, 'timber');
          for (let b = u0 + 0.28; b < u1 - 0.14; b += 0.2) fb(b - 0.025, b + 0.025, yb + 0.28, yb + 0.95, dep - 0.16, dep - 0.1, 'timber'); }
        fb(a0 - 0.1, a1 + 0.1, yb + 2.5, yb + 2.7, -0.05, dep + 0.1, 'timber');                                    // the plate under the roof
        // the lean-to roof from the wall to the plate
        const Q = onFace(bag, F).P, A = Q(a0 - 0.2, 0), B = Q(a1 + 0.2, 0), C = Q(a1 + 0.2, dep + 0.25), Dd = Q(a0 - 0.2, dep + 0.25);
        bag.add('roof_tile', solid8([[A[0], yb + 3.15, A[1]], [B[0], yb + 3.15, B[1]], [C[0], yb + 2.7, C[1]], [Dd[0], yb + 2.7, Dd[1]], [A[0], yb + 3.3, A[1]], [B[0], yb + 3.3, B[1]], [C[0], yb + 2.85, C[1]], [Dd[0], yb + 2.85, Dd[1]]]));
        if (n > 2) for (let i = 0; i < nw; i++) { const uc = 0.5 + (i + 0.5) * ww; fb(uc - 0.4, uc + 0.4, yb + 0.5, yb + 2.1, -0.05, 0.02, 'opening'); fb(uc - 0.55, uc + 0.55, yb + 0.5, yb + 0.58, -0.05, 0.08, 'limestone'); }
      } else if (mType === 'closed') {
        // a timber-framed box over the street: boards, windows with shutters, a pent roof
        fb(a0, a1, yb + 0.1, yb + 2.65, dep - 0.14, dep, 'wood_ochre');
        for (const u of [a0, a1 - 0.14]) fb(u, u + 0.14, yb + 0.1, yb + 2.65, -0.05, dep, 'wood_ochre');
        const nwin = Math.max(1, Math.floor((a1 - a0) / 1.8)), sw = (a1 - a0) / nwin;
        for (let i = 0; i < nwin; i++) { const uc = a0 + (i + 0.5) * sw; fb(uc - 0.4, uc + 0.4, yb + 0.8, yb + 2.0, dep - 0.15, dep + 0.02, 'opening'); for (const s of [-1, 1]) fb(s < 0 ? uc - 0.62 : uc + 0.4, s < 0 ? uc - 0.4 : uc + 0.62, yb + 0.8, yb + 2.0, dep - 0.15, dep + 0.06, shut); }
        const Q = onFace(bag, F).P, A = Q(a0 - 0.2, 0), B = Q(a1 + 0.2, 0), C = Q(a1 + 0.2, dep + 0.3), Dd = Q(a0 - 0.2, dep + 0.3);
        bag.add('roof_tile', solid8([[A[0], yb + 3.05, A[1]], [B[0], yb + 3.05, B[1]], [C[0], yb + 2.65, C[1]], [Dd[0], yb + 2.65, Dd[1]], [A[0], yb + 3.2, A[1]], [B[0], yb + 3.2, B[1]], [C[0], yb + 2.8, C[1]], [Dd[0], yb + 2.8, Dd[1]]]));
      } else {
        for (let u = a0 + 0.05; u < a1 - 0.2; u += 1.2) fb(u, u + 0.06, yb + 0.16, yb + 1.0, dep - 0.12, dep - 0.06, 'iron');
        fb(a0, a1, yb + 1.0, yb + 1.06, dep - 0.13, dep - 0.05, 'iron');
      }
    }
  });
  // roof
  if (flat) {
    const ph = 0.9;
    for (const [a, b] of [[[x0, z0, x1, z0 + 0.35], 0], [[x0, z1 - 0.35, x1, z1], 0], [[x0, z0 + 0.35, x0 + 0.35, z1 - 0.35], 0], [[x1 - 0.35, z0 + 0.35, x1, z1 - 0.35], 0]]) { void b; bag.add(upper, box(a[0], y + H, a[1], a[2], y + H + ph, a[3])); }
    bag.add('limestone', box(x0 - 0.05, y + H + ph, z0 - 0.05, x1 + 0.05, y + H + ph + 0.1, z0 + 0.4)); bag.add('limestone', box(x0 - 0.05, y + H + ph, z1 - 0.4, x1 + 0.05, y + H + ph + 0.1, z1 + 0.05));
    bag.add('flagstone', box(x0 + 0.35, y + H - 0.02, z0 + 0.35, x1 - 0.35, y + H + 0.04, z1 - 0.35));
    col.floor([x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4], y + H + 0.04); col.rect([x0, z0, x1, z0 + 0.4], y + H, y + H + ph); col.rect([x0, z1 - 0.4, x1, z1], y + H, y + H + ph); col.rect([x0, z0, x0 + 0.4, z1], y + H, y + H + ph); col.rect([x1 - 0.4, z0, x1, z1], y + H, y + H + ph);
    if (sunroom && !far) {
      // the heliakon: a sun-room on posts at one corner, a lean-to of tiles
      const sx = rand() < 0.5, sz = rand() < 0.5, w = Math.min(4.6, (x1 - x0) * 0.38), d = Math.min(3.6, (z1 - z0) * 0.34);
      const bx0 = sx ? x1 - 0.6 - w : x0 + 0.6, bz0 = sz ? z1 - 0.6 - d : z0 + 0.6, bx1 = bx0 + w, bz1 = bz0 + d, yy = y + H + 0.04;
      for (const [px, pz] of [[bx0, bz0], [bx1 - 0.14, bz0], [bx0, bz1 - 0.14], [bx1 - 0.14, bz1 - 0.14]]) { bag.add('timber', box(px, yy, pz, px + 0.14, yy + 2.6, pz + 0.14)); col.circle(px + 0.07, pz + 0.07, 0.12, yy, yy + 2.6); }
      bag.add('timber', box(bx0 - 0.1, yy + 2.6, bz0 - 0.1, bx1 + 0.1, yy + 2.75, bz1 + 0.1));
      bag.add('roof_tile', solid8([[bx0 - 0.4, yy + 3.15, bz0 - 0.3], [bx1 + 0.4, yy + 3.15, bz0 - 0.3], [bx1 + 0.4, yy + 2.75, bz1 + 0.4], [bx0 - 0.4, yy + 2.75, bz1 + 0.4], [bx0 - 0.4, yy + 3.3, bz0 - 0.3], [bx1 + 0.4, yy + 3.3, bz0 - 0.3], [bx1 + 0.4, yy + 2.9, bz1 + 0.4], [bx0 - 0.4, yy + 2.9, bz1 + 0.4]]));
      bag.add('timber', box(bx0 + 0.3, yy, bz1 - 0.12, bx1 - 0.3, yy + 0.6, bz1 - 0.02));
    }
  } else {
    const ov = far ? 0.3 : 0.6, W = x1 - x0, Dp = z1 - z0, rise = Math.min(W, Dp) * 0.2, alongX = W >= Dp;
    const ins = alongX ? [W * 0.12, W * 0.12, Dp / 2 + ov - 0.05, Dp / 2 + ov - 0.05] : [W / 2 + ov - 0.05, W / 2 + ov - 0.05, Dp * 0.12, Dp * 0.12];
    bag.add('roof_tile', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + ov], y + H, y + H + rise, ...ins));
    if (!far) {
      // the rafter ends under the eaves, the ridge's cap
      const ry = y + H + 0.02;
      for (const [a, b, nx, nz] of [[x0, x1, 0, -1], [x0, x1, 0, 1]]) for (let u = a + 0.3; u < b - 0.2; u += 0.55) bag.add('timber', box(u, ry - 0.12, (nz < 0 ? z0 : z1) + nz * (ov - 0.12) - 0.04, u + 0.1, ry, (nz < 0 ? z0 : z1) + nz * ov + 0.04 * 0));
      void rod; void lathe; void disc;
    }
  }
  // the walled yard behind (a court house): the wall with a gate, a well-head, a pergola of vine
  if (yard && !far) {
    const [fx0, fz0, fx1, fz1] = full, yh = 2.7;
    const ry = yardAlongZ ? [fx0, z1, fx1, fz1] : [x1, fz0, fx1, fz1];
    const wl = (a, b, c, d) => { bag.add(wall === 'plaster' ? 'plaster' : 'brick', box(a, y - 0.3, b, c, y + yh, d)); col.rect([a, b, c, d], y - 0.3, y + yh); bag.add('limestone', box(a - 0.08, y + yh, b - 0.08, c + 0.08, y + yh + 0.12, d + 0.08)); };
    if (yardAlongZ) {
      wl(ry[0], ry[1], ry[0] + 0.4, ry[3]); wl(ry[2] - 0.4, ry[1], ry[2], ry[3]); wl(ry[0], ry[3] - 0.4, (ry[0] + ry[2]) / 2 - 1.0, ry[3]); wl((ry[0] + ry[2]) / 2 + 1.0, ry[3] - 0.4, ry[2], ry[3]);
      bag.add('timber', box((ry[0] + ry[2]) / 2 - 1.0, y + 2.4, ry[3] - 0.42, (ry[0] + ry[2]) / 2 + 1.0, y + 2.65, ry[3] + 0.02));
      bag.add('wood_dark', box((ry[0] + ry[2]) / 2 - 0.95, y, ry[3] - 0.3, (ry[0] + ry[2]) / 2 - 0.05, y + 2.4, ry[3] - 0.2));
    } else {
      wl(ry[0], ry[1], ry[2], ry[1] + 0.4); wl(ry[0], ry[3] - 0.4, ry[2], ry[3]); wl(ry[2] - 0.4, ry[1], ry[2], (ry[1] + ry[3]) / 2 - 1.0); wl(ry[2] - 0.4, (ry[1] + ry[3]) / 2 + 1.0, ry[2], ry[3]);
      bag.add('timber', box(ry[2] - 0.42, y + 2.4, (ry[1] + ry[3]) / 2 - 1.0, ry[2] + 0.02, y + 2.65, (ry[1] + ry[3]) / 2 + 1.0));
      bag.add('wood_dark', box(ry[2] - 0.3, y, (ry[1] + ry[3]) / 2 - 0.95, ry[2] - 0.2, y + 2.4, (ry[1] + ry[3]) / 2 - 0.05));
    }
    const cx = (ry[0] + ry[2]) / 2 + (yardAlongZ ? -2.0 : 0), cz = (ry[1] + ry[3]) / 2 + (yardAlongZ ? 0 : -2.0);
    bag.add('marble', lathe([[0.62, 0], [0.62, 0.7], [0.5, 0.72], [0.5, 0.3]], 14, null, cx, y, cz)); bag.add('water', disc(0.5, y + 0.45, 14, cx, cz)); col.circle(cx, cz, 0.65, y, y + 0.7);
    bag.add('terracotta', lathe([[0.001, 0], [0.18, 0.05], [0.3, 0.35], [0.2, 0.7], [0.22, 0.74], [0.001, 0.74]], 10, null, ry[0] + 1.0, y, ry[1] + 1.0));
  }
  void NONE;
}

/**
 * fountain: { at, y, rot, kind } — 'niche': a brick wall with a marble niche, a lion-head spout over a basin on two
 * steps, a trough of limestone (the fountains of the Mese's porticoes); 'canopy': a round basin under four columns and a
 * low lead dome (a phiale), a step round it.
 */
function fountain(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, kind = el.kind ?? 'niche';
  const c = Math.cos(rot), s = Math.sin(rot), P = (a, b) => [x + a * c - b * s, z + a * s + b * c];
  if (kind === 'canopy') {
    const r = el.r ?? 1.5;
    bag.add('marble', lathe([[r + 0.7, 0], [r + 0.7, 0.16], [r + 0.4, 0.16], [r + 0.4, 0.34]], 28, null, x, y, z));
    bag.add('marble_smooth', lathe([[r, 0.3], [r + 0.08, 0.85], [r - 0.12, 0.9], [r - 0.14, 0.4]], 28, null, x, y, z));
    bag.add('water', disc(r - 0.14, y + 0.72, 28, x, z));
    bag.add('bronze', lathe([[0.14, 0.3], [0.06, 0.9], [0.1, 1.5], [0.04, 2.0], [0.001, 2.1]], 10, null, x, y, z));
    col.circle(x, z, r + 0.15, y, y + 0.9);
    const H = 3.4, q = r * 0.8;
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) STYLES.byzantine.column({ at: [x + dx * q, z + dz * q], y: y + 0.34, h: H, d: 0.32, shaftMat: 'verde_antico', impost: false }, { bag, col });
    for (const [a, b] of [[[-q, -q], [q, -q]], [[q, -q], [q, q]], [[q, q], [-q, q]], [[-q, q], [-q, -q]]]) bag.add('marble', box(x + Math.min(a[0], b[0]) - 0.2, y + 0.34 + H, z + Math.min(a[1], b[1]) - 0.2, x + Math.max(a[0], b[0]) + 0.2, y + 0.34 + H + 0.3, z + Math.max(a[1], b[1]) + 0.2));
    bag.add('lead', lathe([[q * 1.55, 0], [q * 1.3, 0.5], [q * 0.8, 0.95], [q * 0.3, 1.2], [0.001, 1.28]], 20, null, x, y + 0.34 + H + 0.3, z));
    bag.add('gilt_bronze', lathe([[0.1, 0], [0.12, 0.15], [0.001, 0.5]], 8, null, x, y + 0.34 + H + 1.58, z));
    return;
  }
  const part = (a0, b0, a1, b1, y0, y1, mat) => {
    const p = P(a0, b0), q = P(a1, b1), r = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])];
    bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r;
  };
  const wallR = part(-2.2, -0.35, 2.2, 0.35, y, y + 3.6, 'brick'); col.rect(wallR, y, y + 3.6);
  part(-2.35, -0.45, 2.35, 0.45, y + 3.6, y + 3.8, 'limestone');
  for (const sx of [-1, 1]) part(sx * 1.25 - 0.1, 0.35, sx * 1.25 + 0.1, 0.5, y + 0.2, y + 2.4, 'marble');                // the niche's jambs
  part(-1.35, 0.35, 1.35, 0.5, y + 2.4, y + 2.6, 'marble');                                                             // its lintel
  part(-1.15, 0.33, 1.15, 0.37, y + 0.2, y + 2.4, 'marble_dark');                                                       // its back
  const sp = P(0, 0.5);
  bag.add('bronze', lathe([[0.001, 0], [0.09, 0.0], [0.11, 0.1], [0.07, 0.2], [0.001, 0.22]], 8, null, sp[0], y + 1.5, sp[1]));
  const bR = part(-1.5, 0.35, 1.5, 1.45, y, y + 0.8, 'marble');
  col.rect(bR, y, y + 0.8);
  const w = part(-1.35, 0.5, 1.35, 1.3, y + 0.55, y + 0.79, 'water'); void w;
  for (let k = 0; k < 2; k++) { const r = part(-1.9 - k * 0.0, 1.45 + k * 0.4, 1.9, 1.85 + k * 0.4 - (k ? 0.2 : 0), y, y + 0.16 * (2 - k), 'limestone'); col.floor(r, y + 0.16 * (2 - k)); }
}

Object.assign(STYLES.roman.elements, { byz_house: byzHouse, byz_fountain: fountain });
export { solid8, flat, rng };
