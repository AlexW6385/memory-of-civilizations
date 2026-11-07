// San Marco inside, about 1500 (docs/settlements/venice.md §4, "San Marco inside"): the Greek cross
// hollow — five square bays under their domes, each dome raised on spherical pendentives over four
// great arches and lit by a ring of small windows at its foot; barrel vaults between the bays; the
// aisles of the arms behind colonnades under narrow galleries with their parapets; the crossing's four
// great piers. Below, the walls sheathed in slabs of veined marble to the galleries; above, every
// vault, dome, arch and upper wall in gold-ground mosaic, with its figures (the Ascension in the
// central dome, Pentecost in the west, Emmanuel and the prophets in the east, the evangelists in the
// pendentives, Christ Pantocrator in the apse); the twelfth-century pavement of opus sectile; the
// presbytery raised over the crypt behind the dalle Masegne iconostasis of 1394 with its crucifix
// (the fourteen statues are figures of their own, in plan.js); the two ambones before it; the high
// altar under its ciborium on four columns with the Pala d'Oro; hanging lamps; the south transept's
// rose. The narthex's central bay is opened as a vestibule from the central portal.
//
// All coordinates are the plan's: +x east, +z south; the church faces west.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe, rod } from '../../core/geom.js';

const T = 0.08;                                     // the thickness of a lining (marble slabs, mosaic bed)

/** Triangles with given per-vertex normals; each triangle turned to agree with its normals. */
function mesh(tris, nors) {
  const pos = [], nor = [];
  for (let i = 0; i < tris.length; i += 3) {
    let [a, b, c] = [tris[i], tris[i + 1], tris[i + 2]], [na, nb, nc] = [nors[i], nors[i + 1], nors[i + 2]];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const gx = uy * vz - uz * vy, gy = uz * vx - ux * vz, gz = ux * vy - uy * vx;
    if (gx * (na[0] + nb[0] + nc[0]) + gy * (na[1] + nb[1] + nc[1]) + gz * (na[2] + nb[2] + nc[2]) < 0) { [b, c] = [c, b]; [nb, nc] = [nc, nb]; }
    pos.push(...a, ...b, ...c); nor.push(...na, ...nb, ...nc);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}
const unit = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
/** A grid surface f(u, v) → point, u, v in 0..1, its normals toward toward(p) (a point on the inside). */
function surface(f, nu, nv, toward) {
  const tris = [], nors = [], N = (p) => { const q = toward(p); return unit([q[0] - p[0], q[1] - p[1], q[2] - p[2]]); };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = f(i / nu, j / nv), b = f((i + 1) / nu, j / nv), c = f((i + 1) / nu, (j + 1) / nv), d = f(i / nu, (j + 1) / nv);
    tris.push(a, b, c, a, c, d); nors.push(N(a), N(b), N(c), N(a), N(c), N(d));
  }
  return mesh(tris, nors);
}
/** A convex polygon (u, v) laid on a surface by map(u, v) → { p, n } (n toward the viewer): a fan from its centroid. */
function decal(map, pts) {
  const cu = pts.reduce((s, q) => s + q[0], 0) / pts.length, cv = pts.reduce((s, q) => s + q[1], 0) / pts.length;
  const c = map(cu, cv), tris = [], nors = [];
  for (let i = 0; i < pts.length; i++) {
    const a = map(...pts[i]), b = map(...pts[(i + 1) % pts.length]);
    tris.push(c.p, a.p, b.p); nors.push(c.n, a.n, b.n);
  }
  return mesh(tris, nors);
}
const circ = (u, v, r, n = 10) => Array.from({ length: n }, (_, k) => [u + Math.cos(k / n * Math.PI * 2) * r, v + Math.sin(k / n * Math.PI * 2) * r]);

/** Maps on the three kinds of surface: a sphere (from inside), the tangent plane at its crown, a vertical plane. */
const onSphere = (C, R, az0, el0, d) => (u, v) => {
  const el = el0 + v / R, az = az0 + u / (R * Math.max(0.2, Math.cos(el))), rr = R - d;
  const n = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
  return { p: [C[0] + n[0] * rr, C[1] + n[1] * rr, C[2] + n[2] * rr], n: [-n[0], -n[1], -n[2]] };
};
const onCrown = (C, R, d) => (u, v) => { const n = unit([u, R, v]); return { p: [C[0] + n[0] * (R - d), C[1] + n[1] * (R - d), C[2] + n[2] * (R - d)], n: [-n[0], -n[1], -n[2]] }; };
const onPlane = (O, U, N, d) => (u, v) => ({ p: [O[0] + U[0] * u + N[0] * d, O[1] + v, O[2] + U[2] * u + N[2] * d], n: N });

/**
 * A figure of the mosaics, standing, h tall, its feet at (u0, v0) of the map family mk(d) — a long
 * tunic (white glass, mosaic_silver) under a mantle in a colour, the head, the halo in polished gold,
 * the hands raised (orant) or one holding a book; scale is by h. `seat`: enthroned (a broad
 * throne behind, the knees forward).
 */
function mosaicFigure(bag, mk, u0, v0, h, { mantle = 'tile_lapis', tunic = 'mosaic_silver', book = false, orant = false, seat = false } = {}) {
  const s = h / 1.8, P = (pts) => pts.map(([u, v]) => [u0 + u * s, v0 + v * s]);
  if (seat) bag.add('paint_robe', decal(mk(0.01), P([[-0.62, 0.05], [0.62, 0.05], [0.62, 1.35], [0.5, 1.45], [-0.5, 1.45], [-0.62, 1.35]])));
  bag.add(tunic, decal(mk(0.024), P([[-0.36, 0], [0.36, 0], [0.24, 0.95], [-0.24, 0.95]])));
  bag.add(tunic, decal(mk(0.024), P([[-0.24, 0.95], [0.24, 0.95], [0.23, 1.42], [-0.23, 1.42]])));
  bag.add(mantle, decal(mk(0.038), P([[-0.38, 0.12], [-0.05, 0.3], [0.22, 1.0], [0.24, 1.4], [-0.02, 1.43], [-0.25, 1.2], [-0.33, 0.6]])));
  bag.add('gold', decal(mk(0.014), P(circ(0, 1.6, 0.24, 14))));
  bag.add('skin_light', decal(mk(0.052), P(circ(0, 1.6, 0.12, 10))));
  if (orant) for (const sg of [-1, 1]) bag.add(tunic, decal(mk(0.046), P([[sg * 0.2, 1.22], [sg * 0.3, 1.3], [sg * 0.5, 1.64], [sg * 0.4, 1.68]])));
  if (book) bag.add('paint_robe', decal(mk(0.064), P([[-0.05, 0.98], [0.18, 0.98], [0.18, 1.22], [-0.05, 1.22]])));
}

/**
 * basilicaInterior(bag, col, lights, o): o = { cx, cz, y, S, Wd, H, DX, DZ, domes: [[dx, dz, rOuter]] } —
 * the hollow church. Returns the drums' outer radii for the windows outside.
 */
export function basilicaInterior(bag, col, lights, o) {
  const { cx, cz, y, S, Wd, H, DX, DZ } = o, r = 6.5, Wi = Wd / 2 - 1.5, ys = y + 13, yg = y + 6.5, yr = y + H - 0.4, dh = 3.1;
  const X = (u) => cx + u, Z = (w) => cz + w, B = 'brick', RV = 'revetment_byz', G = 'mosaic_gold', PC = 'proconnesian';
  const bx = (u0, y0, w0, u1, y1, w1, m) => bag.add(m, box(X(Math.min(u0, u1)), y0, Z(Math.min(w0, w1)), X(Math.max(u0, u1)), y1, Z(Math.max(w0, w1))));
  const solid = (u0, w0, u1, w1, y0 = y, y1 = y + 3) => col.rect([X(Math.min(u0, u1)), Z(Math.min(w0, w1)), X(Math.max(u0, u1)), Z(Math.max(w0, w1))], y0, y1);
  const xE = S - 1.5, zN = S * 0.8 - 2, apseU = DX + r;                       // the inner faces: the west wall at −xE, the transept ends at ±zN
  const BAYS = [[-DX, 0], [0, 0], [DX, 0], [0, -DZ], [0, DZ]];

  // ---- the outer walls (brick) and their linings: slabs of veined marble to the galleries, mosaic above ----
  // lining(a, b, n): a face from (u, w) a to b whose inward normal is n ([nu, nw]); doors: [[t0, t1, h]] along it (t from a)
  const lining = (a, b, n, doors = [], top = yr) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), du = (b[0] - a[0]) / L, dw = (b[1] - a[1]) / L;
    const cuts = [[0, 0, 0], ...doors.slice().sort((p, q) => p[0] - q[0]), [L, L, 0]];
    for (let i = 0; i + 1 < cuts.length; i++) {
      const t0 = cuts[i][1], t1 = cuts[i + 1][0];
      const piece = (s0, s1, y0, y1, m, out = T) => { if (s1 - s0 < 0.01 || y1 - y0 < 0.01) return; const p = [a[0] + du * s0, a[1] + dw * s0], q = [a[0] + du * s1, a[1] + dw * s1]; bx(p[0] - n[0] * T, y0, p[1] - n[1] * T, q[0] + n[0] * (out - T), y1, q[1] + n[1] * (out - T), m); };
      piece(t0, t1, y - 0.3, yg, RV); piece(t0, t1, yg, top, G);
      piece(t0, t1, y - 0.3, y + 0.4, 'verde_antico', T + 0.04);                  // the plinth
      piece(t0, t1, yg - 0.05, yg + 0.25, PC, T + 0.16);                           // the cornice at the galleries
      // the slabs framed by narrow fillets of white marble, every 2.1 m
      for (let s = t0 + 1.05; s < t1 - 0.3; s += 2.1) piece(s - 0.05, s + 0.05, y + 0.4, yg - 0.05, 'marble', T + 0.02);
    }
    for (const [t0, t1, hh] of doors) {                                           // over a door: the lining from its lintel
      const p = [a[0] + du * t0, a[1] + dw * t0], q = [a[0] + du * t1, a[1] + dw * t1];
      bx(p[0] - n[0] * T, y + hh, p[1] - n[1] * T, q[0], yg, q[1], RV); bx(p[0] - n[0] * T, yg, p[1] - n[1] * T, q[0], top, q[1], G);
      bx(p[0] - n[0] * T, yg - 0.05, p[1] - n[1] * T, q[0] + n[0] * 0.16, yg + 0.25, q[1] + n[1] * 0.16, PC);
    }
  };
  const wall = (u0, w0, u1, w1, y0 = y - 0.5, y1 = yr) => { bx(u0, y0, w0, u1, y1, w1, B); solid(u0, w0, u1, w1, y0, y1); };
  for (const s of [-1, 1]) {
    // the long walls of the nave-and-presbytery arm, from the transepts' walls outward
    wall(-S, s * (Wi + T), -(Wi + 1.5), s * Wd / 2); wall(Wi + 1.5, s * (Wi + T), S, s * Wd / 2);
    lining([-xE, s * Wi], [-Wi, s * Wi], [0, -s]); lining([Wi, s * Wi], [xE, s * Wi], [0, -s]);
    // the transepts' side walls
    wall(s * (Wi + T), -S * 0.8, s * Wd / 2, -Wi); wall(s * (Wi + T), Wi, s * Wd / 2, S * 0.8);
    lining([s * Wi, -zN], [s * Wi, -Wi], [-s, 0]); lining([s * Wi, Wi], [s * Wi, zN], [-s, 0]);
    // the transepts' end walls
    wall(-Wd / 2, s * (zN + T), Wd / 2, s * S * 0.8);
    lining([-Wi, s * zN], [Wi, s * zN], [0, -s]);
    // the east wall beside the apse, and the walls between the side chapels and the apse
    wall(xE + T, s * 6.5, S, s * Wd / 2); lining([xE, s * 6.9], [xE, s * Wi], [-1, 0]);
    wall(apseU + 0.8, s * 6.5, xE, s * 6.9 - T); lining([apseU + 0.8, s * 6.9], [xE, s * 6.9], [0, s]);
    wall(xE, s * 4.77, S, s * 6.5);
  }
  wall(xE, -6.5, S, 6.5, y + 19.7, yr);                                           // over the apse
  // the west wall with the door from the vestibule
  wall(-S, -Wd / 2, -(xE + T), -2.6); wall(-S, 2.6, -(xE + T), Wd / 2); wall(-S, -2.6, -(xE + T), 2.6, y + 5.3, yr);
  lining([-xE, Wi], [-xE, -Wi], [1, 0], [[Wi - 2.6, Wi + 2.6, 5.3]]);
  for (const s of [-1, 1]) bx(-S - 0.1, y - 0.3, s * 2.5, -xE + T + 0.1, y + 5.4, s * 2.65, PC);        // the jambs
  bx(-S - 0.1, y + 5.0, -2.65, -xE + T + 0.1, y + 5.4, 2.65, PC);                                     // the lintel
  // the roof over the vaults (brick slabs; over each domed bay only its top round the drum)
  const roof = (u0, w0, u1, w1) => { bx(u0, yr, w0, u1, y + H, w1, B); col.floor([X(Math.min(u0, u1)), Z(Math.min(w0, w1)), X(Math.max(u0, u1)), Z(Math.max(w0, w1))], y + H); };
  for (const s of [-1, 1]) { roof(-S, s * 6.5, S, s * Wd / 2); roof(s * 6.5, -S * 0.8, s * Wd / 2, -Wd / 2); roof(s * 6.5, Wd / 2, s * Wd / 2, S * 0.8); }
  for (const [u0, u1] of [[-S, -DX - r], [-DX + r, -r], [r, DX - r], [DX + r, S]]) roof(u0, -6.5, u1, 6.5);
  for (const [w0, w1] of [[-S * 0.8, -DZ - r], [-DZ + r, -Wd / 2], [Wd / 2, DZ - r], [DZ + r, S * 0.8]]) roof(-6.5, w0, 6.5, w1);
  for (const [du, dw] of BAYS) {
    const N = 32, tris = [], nors = [], up = [0, 1, 0];
    for (let k = 0; k < N; k++) {
      const t0 = k / N * Math.PI * 2, t1 = (k + 1) / N * Math.PI * 2, sq = (t) => r / Math.max(Math.abs(Math.cos(t)), Math.abs(Math.sin(t)));
      const P = (t, rr) => [X(du + Math.cos(t) * rr), y + H, Z(dw + Math.sin(t) * rr)];
      tris.push(P(t0, r), P(t0, sq(t0)), P(t1, sq(t1)), P(t0, r), P(t1, sq(t1)), P(t1, r)); nors.push(up, up, up, up, up, up);
    }
    bag.add(B, mesh(tris, nors));
    col.floor([X(du - r), Z(dw - r), X(du + r), Z(dw + r)], y + H);
  }

  // ---- the vaults ----
  for (const [du, dw] of BAYS) {
    const C = [X(du), ys, Z(dw)], R2 = r * Math.SQRT2;
    // the pendentives: the sphere through the bay's corners, outside the circle of the dome's foot
    bag.add(G, surface((a, t) => { const th = a * Math.PI * 2, sq = r / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th))), rr = r + (sq - r) * t; return [C[0] + Math.cos(th) * rr, ys + Math.sqrt(Math.max(0, R2 * R2 - rr * rr)), C[2] + Math.sin(th) * rr]; }, 64, 6, () => C));
    // the foot of the dome with its ring of sixteen windows, the dome
    const yf = ys + r, yd = yf + dh, D = [C[0], yd, C[2]];
    bag.add(G, lathe([[r, dh], [r, 0]], 48, null, C[0], yf, C[2]));
    bag.add(PC, lathe([[r - 0.18, 0.22], [r - 0.18, 0], [r, 0]].reverse().map(([a, b]) => [a, b]).reverse(), 48, null, C[0], yf + 0.6, C[2]));
    for (let k = 0; k < 16; k++) {
      const a = (k + 0.5) / 16 * Math.PI * 2, g = box(-0.02, 0, -0.34, 0.02, 1.3, 0.34);
      g.rotateY(-a); g.translate(C[0] + Math.cos(a) * (r - 0.04), yf + 0.95, C[2] + Math.sin(a) * (r - 0.04)); bag.add('daylight', g);
      const arch = lathe([[0.34, 0], [0.24, 0.18], [0.001, 0.3]], 8); arch.scale(1, 1, 0.12); arch.rotateY(-a); arch.translate(C[0] + Math.cos(a) * (r - 0.04), yf + 2.25, C[2] + Math.sin(a) * (r - 0.04)); bag.add('daylight', arch);
    }
    const prof = []; for (let i = 0; i <= 12; i++) { const e = Math.PI / 2 * (1 - i / 12); prof.push([Math.max(0.001, Math.cos(e) * r), Math.sin(e) * r]); }
    bag.add(G, lathe(prof, 48, null, D[0], D[1], D[2]));
    // the crown's medallion in blue, a band of gold round it
    const cap = (R, e0) => { const p = []; for (let i = 0; i <= 4; i++) { const e = Math.PI / 2 - (Math.PI / 2 - e0) * i / 4; p.push([Math.max(0.001, Math.cos(e) * R), Math.sin(e) * R]); } return p; };
    bag.add('gold', lathe(cap(r - 0.015, Math.PI / 2 - 1.95 / r), 32, null, D[0], D[1], D[2]));
    bag.add('tile_lapis', lathe(cap(r - 0.03, Math.PI / 2 - 1.75 / r), 32, null, D[0], D[1], D[2]));
    const centre = du === 0 && dw === 0, west = du < 0, east = du > 0;
    // the figures of the dome: round its foot (the Virgin and the apostles; in the west the apostles under the
    // rays of Pentecost; in the east the prophets), the crown's figure (Christ ascending, the dove, Emmanuel)
    const n = centre || west ? 12 : 8;
    for (let k = 0; k < n; k++) {
      const az = (k + 0.5) / n * Math.PI * 2, mk = (d) => onSphere(D, r, az, 0.12, d);
      mosaicFigure(bag, mk, 0, 0, 2.0, { mantle: ['tile_lapis', 'paint_robe', 'mosaic_green'][k % 3], book: !centre && k % 2 === 0, orant: centre && k === 0 });
      if (centre) for (const sg of [-1, 1]) {                                     // the trees of the Mount of Olives between them
        const m2 = onSphere(D, r, az + sg * Math.PI / n, 0.1, 0.022);
        bag.add('mosaic_green', decal(m2, [[-0.1, 0], [0.1, 0], [0.1, 0.9], [-0.1, 0.9]].map(([u, v]) => [u, v])));
        bag.add('mosaic_green', decal(m2, circ(0, 1.25, 0.42, 10)));
      }
      if (west) {                                                                  // the rays from the dove to each apostle
        for (let i = 0; i < 4; i++) { const e0 = 0.62 + i * 0.18, e1 = e0 + 0.18, m2 = onSphere(D, r, az, 0, 0.022); bag.add('mosaic_silver', decal(m2, [[-0.06, e0 * r], [0.06, e0 * r], [0.04, e1 * r], [-0.04, e1 * r]])); }
      }
    }
    const crown = onCrown(D, r, 0.045);
    if (centre) mosaicFigure(bag, (d) => onCrown(D, r, d + 0.03), 0, -0.9, 1.9, { mantle: 'paint_robe', tunic: 'mosaic_gold' });
    else if (west) { bag.add('mosaic_silver', decal(crown, [[0, -0.35], [0.12, -0.1], [0.55, 0.12], [0.1, 0.12], [0, 0.4], [-0.1, 0.12], [-0.55, 0.12], [-0.12, -0.1]])); }
    else mosaicFigure(bag, (d) => onCrown(D, r, d + 0.03), 0, -0.8, 1.5, { mantle: 'mosaic_silver', tunic: 'paint_robe', book: true });
    // the pendentives' figures: the four evangelists writing under the central dome, saints under the others
    for (let k = 0; k < 4; k++) {
      const az = Math.PI / 4 + k * Math.PI / 2;
      mosaicFigure(bag, (d) => onSphere(C, R2, az, 0.2, d), 0, 0, 1.7, { mantle: centre ? 'paint_robe' : 'tile_lapis', book: true, seat: centre });
    }
  }
  // the barrel vaults between the bays (radius r, from the springing at ys)
  const barrelX = (u0, u1) => bag.add(G, surface((a, t) => { const th = Math.PI * t; return [X(u0 + (u1 - u0) * a), ys + Math.sin(th) * r, Z(Math.cos(th) * r)]; }, Math.max(1, Math.round((u1 - u0) / 1.5)), 24, (p) => [p[0], ys, Z(0)]));
  const barrelZ = (w0, w1) => bag.add(G, surface((a, t) => { const th = Math.PI * t; return [X(Math.cos(th) * r), ys + Math.sin(th) * r, Z(w0 + (w1 - w0) * a)]; }, Math.max(1, Math.round((w1 - w0) / 1.5)), 24, (p) => [X(0), ys, p[2]]));
  barrelX(-xE, -DX - r); barrelX(-DX + r, -r); barrelX(r, DX - r);
  barrelZ(-zN, -DZ - r); barrelZ(-DZ + r, -r); barrelZ(r, DZ - r); barrelZ(DZ + r, zN);
  // a gold-ground figure in each barrel's crown, and on the west wall over the door (Christ between the Virgin and St Mark)
  for (const u of [(-xE - DX - r) / 2, (-DX + r - r) / 2, (r + DX - r) / 2]) mosaicFigure(bag, (d) => onCrown([X(u), ys, Z(0)], r, d), 0, -0.85, 1.6, { mantle: 'tile_lapis', book: true });
  for (const [k, uu] of [[0, 0], [1, -2.6], [2, 2.6]]) mosaicFigure(bag, (d) => onPlane([X(-xE), yg + 0.5, Z(0)], [0, 0, -1], [1, 0, 0], d + 0.004), uu, 0, k ? 2.2 : 2.6, { mantle: k === 0 ? 'paint_robe' : k === 1 ? 'tile_lapis' : 'mosaic_green', book: k === 2 });
  // the apse: its wall and half-dome, Christ Pantocrator enthroned
  const A = [X(apseU), ys, Z(0)];
  bag.add(RV, surface((a, t) => { const th = -Math.PI / 2 + Math.PI * a; return [A[0] + Math.cos(th) * r, y - 0.3 + (yg - y + 0.3) * t, A[2] + Math.sin(th) * r]; }, 24, 1, (p) => [A[0], p[1], A[2]]));
  bag.add(G, surface((a, t) => { const th = -Math.PI / 2 + Math.PI * a; return [A[0] + Math.cos(th) * r, yg + (ys - yg) * t, A[2] + Math.sin(th) * r]; }, 24, 1, (p) => [A[0], p[1], A[2]]));
  bag.add(G, surface((a, t) => { const th = -Math.PI / 2 + Math.PI * a, e = Math.PI / 2 * t; return [A[0] + Math.cos(th) * Math.cos(e) * r, ys + Math.sin(e) * r, A[2] + Math.sin(th) * Math.cos(e) * r]; }, 24, 10, () => A));
  mosaicFigure(bag, (d) => onSphere(A, r, 0, 0.18, d), 0, 0, 3.0, { mantle: 'tile_lapis', tunic: 'paint_robe', book: true, seat: true });
  for (const sg of [-1, 1]) mosaicFigure(bag, (d) => onPlane([A[0] + Math.cos(sg * 1.1) * (r - 0.02), yg + 0.6, A[2] + Math.sin(sg * 1.1) * (r - 0.02)], [-Math.sin(sg * 1.1), 0, Math.cos(sg * 1.1)], [-Math.cos(sg * 1.1), 0, -Math.sin(sg * 1.1)], d + 0.01), 0, 0, 2.2, { mantle: 'paint_robe', book: true });
  // the apse outside: the half-cylinder of brick beyond the east wall, its lead top
  const AR = 8, th0 = Math.acos((S - apseU) / AR);
  bag.add(B, surface((a, t) => { const th = -th0 + 2 * th0 * a; return [A[0] + Math.cos(th) * AR, y - 0.5 + (y + 21 - y + 0.5) * t, A[2] + Math.sin(th) * AR]; }, 16, 1, (p) => { const d = unit([p[0] - A[0], 0, p[2] - A[2]]); return [p[0] + d[0], p[1], p[2] + d[2]]; }));
  bag.add('lead', surface((a, t) => { const th = -th0 + 2 * th0 * a, rr = AR + 0.3 - t * 4.5; return [A[0] + Math.max(S - A[0] + 0.01, Math.cos(th) * rr) , y + 21 + t * 1.2, A[2] + Math.sin(th) * rr]; }, 16, 4, (p) => [p[0] + (p[0] - A[0]) * 0.3, p[1] + 3, p[2] + (p[2] - A[2]) * 0.3]));
  for (let k = 0; k < 5; k++) { const th = -th0 * 0.8 + k * th0 * 0.4, g = box(-0.4, 0, -0.18, 0.4, 2.2, 0.18); g.rotateY(-th); g.translate(A[0] + Math.cos(th) * (AR + 0.02), y + 9, A[2] + Math.sin(th) * (AR + 0.02)); bag.add('marble', g); }

  // ---- the galleries' aisles: fill over the aisle from the springing, the gallery slab, the colonnade, the parapet ----
  const aisle = (along, a0, a1, w0, w1, colonnade = true) => {       // along 'x': u from a0 to a1, w across from w0 (nave side) to w1 (outer)
    const R0 = (u0, yy0, wa, u1, yy1, wb, m) => along === 'x' ? bx(u0, yy0, wa, u1, yy1, wb, m) : bx(wa, yy0, u0, wb, yy1, u1, m);
    R0(a0, ys, w0, a1, yr, w1, G);
    R0(a0, yg - 0.35, w0, a1, yg, w1, G);
    if (!colonnade) return;
    const sw = Math.sign(w1 - w0), wn = w0;
    R0(a0, yg - 0.75, wn - sw * 0.22, a1, yg - 0.35, wn + sw * 0.26, PC);                                  // the architrave
    R0(a0, yg, wn, a1, yg + 0.12, wn + sw * 0.22, 'marble');                                               // the parapet's footing
    R0(a0, yg + 0.12, wn + sw * 0.04, a1, yg + 0.95, wn + sw * 0.18, PC);                                  // its slabs (plutei)
    R0(a0, yg + 0.95, wn - sw * 0.02, a1, yg + 1.08, wn + sw * 0.24, 'marble');                            // the rail
    const L = a1 - a0, np = Math.max(1, Math.round(L / 1.4));
    for (let i = 0; i <= np; i++) { const u = Math.min(a1 - 0.08, Math.max(a0 + 0.08, a0 + L * i / np)); R0(u - 0.07, yg + 0.12, wn - sw * 0.03, u + 0.07, yg + 0.95, wn + sw * 0.21, 'marble'); }
    for (let i = 0; i < np; i++) {                                                                         // a lozenge of green on each slab, toward the nave
      const u = a0 + L * (i + 0.5) / np, hw = Math.min(0.5, L / np / 2 - 0.15), yc = yg + 0.535, d = wn - sw * 0.002;
      const pts = [[u - hw, yc], [u, yc + 0.32], [u + hw, yc], [u, yc - 0.32]];
      const map = along === 'x' ? (uu, vv) => ({ p: [X(uu), vv, Z(d)], n: [0, 0, -sw] }) : (uu, vv) => ({ p: [X(d), vv, Z(uu)], n: [-sw, 0, 0] });
      bag.add('verde_antico', decal(map, pts));
    }
    const nc = Math.max(1, Math.round(L / 2.6));
    for (let i = 0; i < nc; i++) {
      const u = a0 + L * (i + 0.5) / nc, p = along === 'x' ? [X(u), Z(wn)] : [X(wn), Z(u)], m = i % 2 ? 'verde_antico' : PC;
      bag.add('marble', lathe([[0.36, 0], [0.36, 0.22], [0.3, 0.3], [0.25, 0.34]], 12, null, p[0], y, p[1]));
      bag.add(m, lathe([[0.24, 0], [0.22, yg - 0.75 - y - 1.0]], 12, null, p[0], y + 0.34, p[1]));
      bag.add('marble', lathe([[0.25, 0], [0.33, 0.25], [0.4, 0.5], [0.42, 0.56], [0.001, 0.56]], 8, null, p[0], yg - 0.75 - 0.6, p[1]));   // the basket capital
      col.circle(p[0], p[1], 0.3, y, yg);
    }
  };
  const pier = (u0, w0, u1, w1, top = yr) => {
    const a = Math.min(u0, u1), b = Math.max(u0, u1), c = Math.min(w0, w1), d = Math.max(w0, w1);
    bx(a, y - 0.3, c, b, yg, d, RV); bx(a, yg, c, b, top, d, G);
    bx(a - 0.04, y - 0.3, c - 0.04, b + 0.04, y + 0.4, d + 0.04, 'verde_antico'); bx(a - 0.16, yg - 0.05, c - 0.16, b + 0.16, yg + 0.25, d + 0.16, PC);
    solid(a, c, b, d, y, yg + 1);
  };
  for (const s of [-1, 1]) {
    for (const sx of [-1, 1]) pier(sx * 6.5, s * 6.5, sx * Wi, s * Wi);                                   // the four great piers of the crossing
    // the nave arm (west) and the presbytery arm (east), the aisles along z
    const ez = [s * 6.5, s * Wi];
    for (const [a0, a1] of [[-xE, -DX - r - 0.8], [-DX - r + 0.8, -DX + r - 0.8], [-DX + r + 0.8, -Wi], [Wi, DX - r - 0.8], [DX - r + 0.8, DX + r - 0.8]]) aisle('x', a0, a1, ez[0], ez[1]);
    aisle('x', DX + r + 0.8, xE, s * 6.9, ez[1], false);
    for (const uc of [-DX - r, -DX + r, DX - r, DX + r]) { pier(uc - 0.8, s * 6.5, uc + 0.8, s * 7.7, yg); pier(uc - 0.8, s * 6.5, uc + 0.8, s * Wi); }
    // the transepts, the aisles along x
    const ex = [s * 6.5, s * Wi];
    for (const [a0, a1] of [[-zN, -DZ + r - 0.8], [-DZ + r + 0.8, -Wi], [Wi, DZ - r - 0.8], [DZ - r + 0.8, zN]]) aisle('z', a0, a1, ex[0], ex[1]);
    for (const wc of [-DZ + r, DZ - r]) pier(s * 6.5, wc - 0.8, s * 7.7, wc + 0.8, yg), pier(s * 6.5, wc - 0.8, s * Wi, wc + 0.8);
  }

  // ---- the pavement of opus sectile; the presbytery raised over the crypt ----
  const floor = (u0, w0, u1, w1, yy = y + 0.05, m = 'opus_sectile') => { bx(u0, y - 0.3, w0, u1, yy, w1, m); col.floor([X(Math.min(u0, u1)), Z(Math.min(w0, w1)), X(Math.max(u0, u1)), Z(Math.max(w0, w1))], yy); };
  floor(-xE, -Wi, xE, Wi); floor(-Wi, -zN, Wi, -Wi); floor(-Wi, Wi, Wi, zN);
  const yp = y + 1.2;
  bx(Wi, y - 0.3, -6.5, apseU + r, yp - 0.06, 6.5, PC); floor(Wi, -6.5, apseU + r, 6.5, yp);
  for (let i = 0; i < 7; i++) {                                                   // the steps up through the iconostasis' door
    const u1 = Wi - i * 0.3, h = y + (yp - y) * (7 - i) / 8;
    bx(u1 - 0.3, y - 0.3, -1.6, u1, h, 1.6, PC);
  }
  col.ramp([X(Wi - 2.1), Z(-1.6), X(Wi), Z(1.6)], y + 0.05, yp, 'e');
  for (const s of [-1, 1]) { bx(Wi - 2.1, y - 0.3, s * 1.6, Wi, yp - 0.15, s * 1.75, 'marble'); solid(Wi - 2.1, s * 1.6, Wi, s * 1.75, y, yp + 0.4); }
  // ---- the iconostasis (1394): eight columns on a parapet of slabs with lozenges, the architrave, the crucifix ----
  const ui = Wi + 0.25, cols = [-6.2, -4.5, -2.8, -1.25, 1.25, 2.8, 4.5, 6.2], yc0 = yp, ya = yp + 3.6;
  for (const w of cols) {
    bag.add('marble_pink', lathe([[0.2, 0], [0.18, 3.0]], 12, null, X(ui), yc0 + 0.3, Z(w)));
    bag.add('marble', lathe([[0.27, 0], [0.27, 0.12], [0.2, 0.3]], 10, null, X(ui), yc0, Z(w)));
    bag.add('gilt_bronze', lathe([[0.18, 0], [0.26, 0.18], [0.3, 0.3], [0.001, 0.3]], 8, null, X(ui), yc0 + 3.3, Z(w)));
    col.circle(X(ui), Z(w), 0.25, yp, ya);
  }
  bx(ui - 0.3, ya, -6.5, ui + 0.3, ya + 0.5, 6.5, PC);                            // the architrave with its cornice
  bx(ui - 0.38, ya + 0.5, -6.6, ui + 0.38, ya + 0.62, 6.6, 'marble');
  for (const [w0, w1] of [[-6.2, -4.5], [-4.5, -2.8], [-2.8, -1.25], [1.25, 2.8], [2.8, 4.5], [4.5, 6.2]]) {
    bx(ui - 0.1, yp, w0 + 0.2, ui + 0.1, yp + 1.15, w1 - 0.2, PC); solid(ui - 0.1, w0, ui + 0.1, w1, yp, yp + 1.2);
    bx(ui - 0.14, yp + 1.15, w0 + 0.15, ui + 0.14, yp + 1.25, w1 - 0.15, 'marble');
    const wc = (w0 + w1) / 2, hw = (w1 - w0) / 2 - 0.4;
    bag.add('verde_antico', decal((uu, vv) => ({ p: [X(ui - 0.105), vv, Z(uu)], n: [-1, 0, 0] }), [[wc - hw, yp + 0.58], [wc, yp + 0.98], [wc + hw, yp + 0.58], [wc, yp + 0.18]]));
    bag.add('porphyry', decal((uu, vv) => ({ p: [X(ui - 0.11), vv, Z(uu)], n: [-1, 0, 0] }), circ(wc, yp + 0.58, 0.15, 10)));
  }
  for (const s of [-1, 1]) bx(ui - 0.15, yp, s * 6.2, ui + 0.15, ya, s * 6.5, PC);        // the screen's ends against the piers
  // the crucifix of silver and bronze on its post over the door
  const yx = ya + 0.62;
  bag.add('gilt_bronze', box(X(ui) - 0.08, yx, Z(0) - 0.08, X(ui) + 0.08, yx + 3.2, Z(0) + 0.08));
  bag.add('gilt_bronze', box(X(ui) - 0.08, yx + 2.15, Z(0) - 0.95, X(ui) + 0.08, yx + 2.31, Z(0) + 0.95));
  bag.add('silver', box(X(ui) - 0.2, yx + 1.25, Z(0) - 0.13, X(ui) - 0.08, yx + 2.15, Z(0) + 0.13));   // the corpus
  bag.add('silver', box(X(ui) - 0.2, yx + 2.15, Z(0) - 0.82, X(ui) - 0.08, yx + 2.27, Z(0) + 0.82));
  bag.add('silver', lathe([[0.001, 0], [0.11, 0.06], [0.11, 0.2], [0.001, 0.26]], 8, null, X(ui) - 0.14, yx + 2.3, Z(0)));
  for (const s of [-1, 1]) bag.add('gilt_bronze', lathe([[0.001, 0], [0.18, 0.02], [0.001, 0.04]], 10, null, X(ui), yx + 2.23, Z(s * 0.95)));
  // ---- the ambones before it: on the left (north) the double ambo for the Gospel, on the right the doge's platform ----
  for (const s of [-1, 1]) {
    const ac = [X(Wi - 2.4), Z(s * 4.6)], h1 = y + (s < 0 ? 2.6 : 2.2), ar = s < 0 ? 1.25 : 1.5;
    for (let k = 0; k < (s < 0 ? 8 : 6); k++) {
      const a = k / (s < 0 ? 8 : 6) * Math.PI * 2, p = [ac[0] + Math.cos(a) * ar * 0.8, ac[1] + Math.sin(a) * ar * 0.8];
      bag.add(k % 2 ? 'verde_antico' : 'marble_pink', lathe([[0.12, 0], [0.11, h1 - y - 0.3]], 8, null, p[0], y + 0.05, p[1]));
      bag.add('marble', lathe([[0.11, 0], [0.18, 0.25], [0.001, 0.25]], 8, null, p[0], h1 - 0.25, p[1]));
      col.circle(p[0], p[1], 0.14, y, h1);
    }
    bag.add(PC, lathe([[ar + 0.08, 0.3], [ar + 0.08, 0], [ar - 0.1, -0.15], [0.001, -0.2]].reverse(), s < 0 ? 8 : 4, null, ac[0], h1, ac[1]).rotateY(0));
    bag.add(PC, box(ac[0] - ar * 0.7, h1 + 0.28, ac[1] - ar * 0.7, ac[0] + ar * 0.7, h1 + 0.3, ac[1] + ar * 0.7));
    const par = lathe([[ar, 0], [ar, 1.0], [ar + 0.06, 1.1], [ar - 0.1, 1.1]], s < 0 ? 8 : 4, null, 0, 0, 0); par.rotateY(s < 0 ? Math.PI / 8 : Math.PI / 4); par.translate(ac[0], h1 + 0.3, ac[1]);
    bag.add(s < 0 ? 'marble_pink' : 'verde_antico', par);
    if (s < 0) {                                                                    // the upper ambo, smaller, on its own colonnettes
      for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; bag.add('marble', lathe([[0.07, 0], [0.07, 1.5]], 6, null, ac[0] + Math.cos(a) * 0.55, h1 + 0.3, ac[1] + Math.sin(a) * 0.55)); }
      bag.add(PC, lathe([[0.85, 0.15], [0.85, 0], [0.001, -0.05]].reverse(), 8, null, ac[0], h1 + 1.85, ac[1]));
      const p2 = lathe([[0.8, 0], [0.8, 0.85], [0.001, 0.85]], 8, null, 0, 0, 0); p2.rotateY(Math.PI / 8); p2.translate(ac[0], h1 + 2.0, ac[1]); bag.add('marble_pink', p2);
      bag.add('gilt_bronze', lathe([[0.001, 0], [0.9, 0.2], [0.75, 0.5], [0.001, 0.9]], 8, null, ac[0], h1 + 3.6, ac[1]));   // its little cupola
      for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; bag.add('marble', lathe([[0.05, 0], [0.05, 0.75]], 6, null, ac[0] + Math.cos(a) * 0.62, h1 + 2.85, ac[1] + Math.sin(a) * 0.62)); }
    }
    col.circle(ac[0], ac[1], ar * 0.85, y, h1 + 1.4);
  }
  // ---- the high altar under its ciborium, the Pala d'Oro on it ----
  const ua = DX + 2.2, alt = [X(ua), Z(0)];
  bx(ua - 0.9, yp, -1.5, ua + 0.9, yp + 1.05, 1.5, 'marble');
  bx(ua - 0.95, yp + 1.05, -1.55, ua + 0.95, yp + 1.15, 1.55, 'porphyry');
  bx(ua - 0.92, yp + 0.12, -1.52, ua - 0.9, yp + 0.95, 1.52, 'verde_antico');
  solid(ua - 0.9, -1.5, ua + 0.9, 1.5, yp, yp + 1.2);
  const pu = ua + 0.62, pw = 1.66, ph = 2.12, py = yp + 1.15;                    // the Pala: 3.3 by 2.1 m of gold and enamel
  bx(pu - 0.06, py, -pw - 0.08, pu + 0.12, py + ph + 0.08, pw + 0.08, 'gilt_bronze');
  const front = (uu, vv) => ({ p: [X(pu - 0.065), vv, Z(uu)], n: [-1, 0, 0] });
  bag.add('gold', decal(front, [[-pw, py + 0.04], [pw, py + 0.04], [pw, py + ph], [-pw, py + ph]]));
  for (let row = 0; row < 3; row++) for (let i = 0; i < 12; i++) {
    const w0 = -pw + 0.1 + i * (2 * pw - 0.2) / 12, w1 = w0 + (2 * pw - 0.2) / 12 - 0.06, v0 = py + 0.12 + row * 0.42, v1 = v0 + 0.34;
    if (row < 2 && i >= 4 && i < 8) continue;                                     // Christ in the middle of the lower rows
    const f2 = (uu, vv) => ({ p: [X(pu - 0.075), vv, Z(uu)], n: [-1, 0, 0] });
    bag.add(['tile_lapis', 'mosaic_green', 'paint_robe'][(row + i) % 3], decal(f2, [[w0, v0], [w1, v0], [w1, v1 - 0.08], [(w0 + w1) / 2, v1], [w0, v1 - 0.08]]));
  }
  bag.add('tile_lapis', decal((uu, vv) => ({ p: [X(pu - 0.075), vv, Z(uu)], n: [-1, 0, 0] }), circ(0, py + 0.5, 0.42, 16)));
  mosaicFigure(bag, (d) => onPlane([X(pu - 0.08), py + 0.14, Z(0)], [0, 0, -1], [-1, 0, 0], d * 0.3), 0, 0, 0.72, { mantle: 'paint_robe', tunic: 'mosaic_gold', seat: true, book: true });
  for (let i = 0; i < 9; i++) { const w = -pw + 0.15 + i * (2 * pw - 0.3) / 8; bag.add('tile_lapis', decal((uu, vv) => ({ p: [X(pu - 0.075), vv, Z(uu)], n: [-1, 0, 0] }), circ(w, py + 1.92, 0.12, 8))); }
  // the ciborium: four columns carved in bands of figures (verde antico stands in for the alabaster), the canopy
  const cy1 = yp + 4.3;
  for (const [du2, dw2] of [[-1.55, -1.9], [1.55, -1.9], [-1.55, 1.9], [1.55, 1.9]]) {
    const p = [X(ua + du2), Z(dw2)];
    bag.add('marble', lathe([[0.3, 0], [0.3, 0.3], [0.2, 0.42]], 10, null, p[0], yp, p[1]));
    bag.add('marble', lathe([[0.19, 0], [0.19, 3.3]], 12, (t, i) => 1 + 0.06 * Math.sin(t * 6) * (i ? 1 : 0), p[0], yp + 0.42, p[1]));
    for (let b = 0; b < 9; b++) bag.add('verde_antico', lathe([[0.2, 0], [0.2, 0.06]], 12, null, p[0], yp + 0.6 + b * 0.38, p[1]));
    bag.add('gilt_bronze', lathe([[0.19, 0], [0.3, 0.35], [0.34, 0.5], [0.001, 0.5]], 8, null, p[0], yp + 3.72, p[1]));
    col.circle(p[0], p[1], 0.22, yp, cy1);
  }
  bx(ua - 1.9, cy1 - 0.08, -2.25, ua + 1.9, cy1 + 0.6, 2.25, 'verde_antico');
  bx(ua - 1.98, cy1 + 0.6, -2.33, ua + 1.98, cy1 + 0.72, 2.33, 'marble');
  bag.add('verde_antico', lathe([[2.1, 0], [1.9, 0.6], [1.2, 1.4], [0.4, 1.8], [0.001, 1.85]], 4, null, 0, 0, 0).rotateY(Math.PI / 4).scale(0.9, 1, 1.1).translate(X(ua), cy1 + 0.72, Z(0)));
  bag.add('gilt_bronze', lathe([[0.15, 0], [0.15, 0.5], [0.001, 0.9]], 8, null, X(ua), cy1 + 2.5, Z(0)));
  // candlesticks with their flames on the altar, lamps in the bays (oil in glass under bronze crowns, on chains from the vaults)
  for (const dw2 of [-1.25, -0.6, 0.6, 1.25]) {
    bag.add('gilt_bronze', lathe([[0.1, 0], [0.04, 0.08], [0.025, 0.5], [0.06, 0.55], [0.02, 0.6]], 8, null, X(ua - 0.5), yp + 1.15, Z(dw2)));
    bag.add('linen', lathe([[0.022, 0], [0.022, 0.3]], 6, null, X(ua - 0.5), yp + 1.75, Z(dw2)));
    bag.add('flame', lathe([[0.001, 0], [0.018, 0.03], [0.001, 0.08]], 6, null, X(ua - 0.5), yp + 2.05, Z(dw2)));
  }
  lights.push({ at: [X(ua - 0.5), yp + 2.2, Z(0)], color: '#ffb45e', intensity: 4, distance: 9 });
  const lamp = (u, w, yl, top) => {
    bag.add('iron', rod([X(u), yl + 0.55, Z(w)], [X(u), top, Z(w)], 0.012, 4));
    bag.add('bronze', lathe([[0.001, 0], [0.32, 0.05], [0.34, 0.12], [0.3, 0.14]], 10, null, X(u), yl + 0.45, Z(w)));
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; bag.add('iron', rod([X(u + Math.cos(a) * 0.3), yl + 0.55, Z(w + Math.sin(a) * 0.3)], [X(u), yl + 0.95, Z(w)], 0.008, 3)); }
    bag.add('glass_lamp', lathe([[0.001, 0], [0.09, 0.05], [0.13, 0.2], [0.14, 0.3], [0.12, 0.36]], 10, null, X(u), yl + 0.12, Z(w)));
    bag.add('flame', lathe([[0.001, 0], [0.025, 0.04], [0.001, 0.1]], 6, null, X(u), yl + 0.36, Z(w)));
  };
  const lampsAt = [[0, 0, y + 4.2], [-DX, 0, y + 4.2], [0, -DZ, y + 4.2], [0, DZ, y + 4.2], [DX, 0, yp + 5.4], [-DX - r - 2.5, 0, y + 4.5], [-DX + r + 3, 0, y + 4.5], [-DX, -3.6, y + 4.6], [-DX, 3.6, y + 4.6], [-3.6, -DZ, y + 4.6], [3.6, DZ, y + 4.6]];
  // the chain's top: the dome over a domed bay (at the lamp's distance from its centre), else the barrel's crown
  const vaultAt = (u, w) => {
    for (const [a, b] of BAYS) { const d = Math.hypot(u - a, w - b); if (Math.abs(u - a) < r && Math.abs(w - b) < r && d < r - 0.3) return ys + r + dh + Math.sqrt(r * r - d * d) - 0.08; }
    return ys + Math.sqrt(Math.max(0, r * r - (Math.abs(u) <= Wi ? u * u : w * w))) - 0.05;
  };
  for (const [u, w, yl] of lampsAt) {
    lamp(u, w, yl, vaultAt(u, w));
    lights.push({ at: [X(u), yl + 0.3, Z(w)], color: '#ffb46b', intensity: 2.2, distance: 8 });
  }
  // the choir stalls along the presbytery's sides, of walnut
  for (const s of [-1, 1]) {
    bx(DX - 5.5, yp, s * 5.6, DX - 1.6, yp + 0.45, s * 6.3, 'wood_dark'); bx(DX - 5.5, yp, s * 6.2, DX - 1.6, yp + 2.1, s * 6.4, 'wood_dark');
    bx(DX - 5.6, yp + 2.1, s * 5.9, DX - 1.5, yp + 2.2, s * 6.45, 'wood_dark');
    for (let k = 0; k <= 6; k++) bx(DX - 5.5 + k * 0.65 - 0.03, yp + 0.45, s * 5.65, DX - 5.5 + k * 0.65 + 0.03, yp + 1.0, s * 6.2, 'wood_dark');
    solid(DX - 5.5, s * 5.6, DX - 1.6, s * 6.4, yp, yp + 2.2);
  }
  // the south transept's rose (fifteenth century) over its end wall, glass inside and dark without
  bag.add('stained_glass', lathe([[0.001, 0.01], [3, 0.01], [3, 0]].reverse(), 24, null, 0, 0, 0).rotateX(Math.PI / 2).translate(X(0), ys + 3.3, Z(zN - 0.012)));
  bag.add('marble', lathe([[3.3, 0], [3.3, 0.18], [3.0, 0.18], [3.0, 0]], 24, null, 0, 0, 0).rotateX(-Math.PI / 2).translate(X(0), ys + 3.3, Z(zN - 0.03)));
  bag.add('opening', lathe([[0.001, 0], [3, 0], [3, 0.01]], 24, null, 0, 0, 0).rotateX(-Math.PI / 2).translate(X(0), ys + 3.3, Z(S * 0.8 + 0.01)));
}

/**
 * The narthex's central bay as a vestibule (its front door in the central portal, the door into the
 * nave behind), the rest of the narthex solid. f = the narthex's rect, door half-width hw and height dh.
 */
export function vestibule(bag, col, f, cz, y, top, hw, dh) {
  const vw = 4.6, x0 = f[0] + 0.8, x1 = f[2], ys = y + 5.5, G = 'mosaic_gold', M = 'marble';
  for (const s of [-1, 1]) { const r = s < 0 ? [f[0], f[1], f[2], cz - vw] : [f[0], cz + vw, f[2], f[3]]; bag.add(M, box(r[0], y - 0.5, r[1], r[2], top, r[3])); col.rect(r, y, top); }
  for (const s of [-1, 1]) { const r = s < 0 ? [f[0], cz - vw, x0, cz - hw] : [f[0], cz + hw, x0, cz + vw]; bag.add(M, box(r[0], y - 0.5, r[1], r[2], top, r[3])); col.rect(r, y, top); }
  bag.add(M, box(f[0], y + dh + 0.1, cz - hw, x0, top, cz + hw));
  bag.add(M, box(x0, ys + vw, cz - vw, x1, top, cz + vw));
  // the linings: marble slabs to the springing, gold above; the barrel vault along the bay
  for (const s of [-1, 1]) {
    const w = cz + s * vw;
    bag.add('revetment_byz', box(x0, y - 0.3, Math.min(w, w - s * T), x1, ys, Math.max(w, w - s * T)));
    bag.add('verde_antico', box(x0, y - 0.3, Math.min(w, w - s * (T + 0.04)), x1, y + 0.4, Math.max(w, w - s * (T + 0.04))));
    bag.add('proconnesian', box(x0, ys - 0.2, Math.min(w, w - s * (T + 0.14)), x1, ys + 0.05, Math.max(w, w - s * (T + 0.14))));
  }
  bag.add('revetment_byz', box(x1 - T, y - 0.3, cz - vw, x1, ys, cz - 2.65)); bag.add('revetment_byz', box(x1 - T, y - 0.3, cz + 2.65, x1, ys, cz + vw));
  bag.add('revetment_byz', box(x1 - T, y + 5.4, cz - 2.65, x1, ys, cz + 2.65)); bag.add(G, box(x1 - T, ys, cz - vw, x1, ys + vw, cz + vw));
  bag.add('revetment_byz', box(x0, y - 0.3, cz - vw, x0 + T, ys, cz - hw - 0.12)); bag.add('revetment_byz', box(x0, y - 0.3, cz + hw + 0.12, x0 + T, ys, cz + vw));
  bag.add('revetment_byz', box(x0, y + dh + 0.3, cz - hw - 0.12, x0 + T, ys, cz + hw + 0.12)); bag.add(G, box(x0, ys, cz - vw, x0 + T, ys + vw, cz + vw));
  for (const s of [-1, 1]) bag.add('proconnesian', box(f[0] - 0.05, y - 0.3, s < 0 ? cz - hw - 0.15 : cz + hw, x0 + T + 0.08, y + dh + 0.3, s < 0 ? cz - hw : cz + hw + 0.15));
  bag.add('proconnesian', box(f[0] - 0.05, y + dh, cz - hw - 0.15, x0 + T + 0.08, y + dh + 0.3, cz + hw + 0.15));
  bag.add(G, surface((a, t) => { const th = Math.PI * t; return [x0 + (x1 - x0) * a, ys + Math.sin(th) * vw, cz + Math.cos(th) * vw]; }, 6, 20, (p) => [p[0], ys, cz]));
  // the oldest mosaics of the porch: the Virgin and the apostles round the vault's crown, St Mark over the door into the church
  for (let k = 0; k < 4; k++) mosaicFigure(bag, (d) => onCrown([x0 + 1.4 + k * 2.1, ys, cz], vw, d), 0, -0.75, 1.4, { mantle: ['tile_lapis', 'paint_robe'][k % 2], book: k % 2 === 1 });
  mosaicFigure(bag, (d) => onPlane([x1 - T, ys + 0.4, cz], [0, 0, -1], [-1, 0, 0], d + 0.004), 0, 0, 2.4, { mantle: 'paint_robe', book: true });
  // the pavement
  bag.add('opus_sectile', box(f[0] - 2.4, y - 0.3, cz - vw, x1, y + 0.05, cz + vw)); col.floor([f[0] - 2.4, cz - vw, x1, cz + vw], y + 0.05);
  // the bronze leaves of the central door, open inward
  for (const s of [-1, 1]) {
    const g = box(x0 + T, y + 0.05, cz + s * hw - (s > 0 ? 0.08 : 0), x0 + T + hw - 0.1, y + dh - 0.05, cz + s * hw + (s < 0 ? 0.08 : 0));
    bag.add('bronze', g);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) bag.add('gilt_bronze', box(x0 + T + 0.25 + j * (hw - 0.4) / 2, y + 0.5 + i * (dh - 0.8) / 4, cz + s * (hw - 0.1), x0 + T + 0.05 + (j + 1) * (hw - 0.4) / 2, y + 0.3 + (i + 1) * (dh - 0.8) / 4, cz + s * (hw + 0.1)));
    col.segment([x0 + T, cz + s * hw], [x0 + T + hw - 0.1, cz + s * hw], 0.12, y, y + dh);
  }
}
