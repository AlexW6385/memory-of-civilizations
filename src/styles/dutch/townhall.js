// The Town Hall's inside (docs/settlements/amsterdam.md §5.8): the vestibule behind the seven arches on the
// Dam; the Vierschaar, the white-marble tribunal, seen through its bronze grilles — the caryatids, the
// three reliefs of judgement, the bench of the magistrates; one of the two narrow stairways up; and the
// Burgerzaal — the barrel-vaulted marble hall across the building, its floor inlaid with the two
// hemispheres of the world and the northern sky, the galleries round it lit from the courts, the Maid of
// Amsterdam over the door from the Dam and Atlas bearing the heavens at the far end.

import { box, lathe, fromTriangles, orientOutward, quad } from '../../core/geom.js';
import { Shape, Path, ExtrudeGeometry } from '../../core/three.js';
import { relief } from '../norse/carving.js';
import { hexa } from '../norse/index.js';

const ST = 'sandstone_dressed', MB = 'marble_smooth', MF = 'marble_floor', VA = 'stucco', BZ = 'bronze';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Boxes [x0, y0, z0, x1, y1, z1] left of `b` once `v` is cut out of it. */
function cut(b, v) {
  const [ax0, ay0, az0, ax1, ay1, az1] = b, [vx0, vy0, vz0, vx1, vy1, vz1] = v;
  if (vx0 >= ax1 || vx1 <= ax0 || vy0 >= ay1 || vy1 <= ay0 || vz0 >= az1 || vz1 <= az0) return [b];
  const out = [], X0 = Math.max(ax0, vx0), X1 = Math.min(ax1, vx1), Y0 = Math.max(ay0, vy0), Y1 = Math.min(ay1, vy1);
  if (ax0 < X0) out.push([ax0, ay0, az0, X0, ay1, az1]);
  if (X1 < ax1) out.push([X1, ay0, az0, ax1, ay1, az1]);
  if (ay0 < Y0) out.push([X0, ay0, az0, X1, Y0, az1]);
  if (Y1 < ay1) out.push([X0, Y1, az0, X1, ay1, az1]);
  if (az0 < vz0) out.push([X0, Y0, az0, X1, Y1, vz0]);
  if (vz1 < az1) out.push([X0, Y0, vz1, X1, Y1, az1]);
  return out;
}
/** A flat shape lying on the floor: (u, v) → (x = cx + u, z = cz − v), from y0 to y1. */
function flat(shape, cx, cz, y0, y1, seg = 12) {
  const g = new ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: seg });
  g.deleteAttribute('uv'); g.rotateX(-Math.PI / 2); g.translate(cx, y0, cz); return g;
}
const polyShape = (pts) => { const s = new Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); s.closePath(); return s; };
const ringShape = (r0, r1) => { const s = new Shape(); s.absarc(0, 0, r1, 0, Math.PI * 2, false); const h = new Path(); h.absarc(0, 0, r0, 0, Math.PI * 2, true); s.holes.push(h); return s; };
const discShape = (r) => { const s = new Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; };
/** A thin strip on the floor from p to q (plan [u, v] round the map's centre), w wide. */
const stripShape = (p, q, w) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2; return polyShape([[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]]); };
/** A coastline from a rough outline: rounded by corner cutting, then made ragged with small capes and bays. */
function coast(pts, seed = 7) {
  let P = pts;
  for (let it = 0; it < 3; it++) { const Q = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } P = Q; }
  const r = rng(seed + pts.length * 13);
  return P.map(([u, v], i) => { const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, k = (r() - 0.5) * 0.035; const q = [u - ty / l * k, v + tx / l * k], m = Math.hypot(...q); return m > 0.97 ? [q[0] * 0.97 / m, q[1] * 0.97 / m] : q; });
}
/** A standing draped figure in marble at (x, y, z), sc its scale, facing (fx, fz); `globe` an orb borne on its shoulders, `seated` on a throne. */
function figure(bag, mat, x, y, z, sc, { globe = false, seated = false, fx = 1, fz = 0, arm = true } = {}) {
  const s = sc;
  if (seated) {
    bag.add(mat, box(x - 0.45 * s, y, z - 0.55 * s, x + 0.45 * s, y + 0.75 * s, z + 0.55 * s));
    bag.add(mat, box(x - fx * 0.45 * s - 0.12 * s, y, z - fz * 0.45 * s - 0.55 * s * Math.abs(fx) - 0.12 * s * Math.abs(fz), x - fx * 0.45 * s + 0.12 * s, y + 1.9 * s, z - fz * 0.45 * s + 0.55 * s * Math.abs(fx) + 0.12 * s * Math.abs(fz)));
    bag.add(mat, lathe([[0.36 * s, 0], [0.3 * s, 0.5 * s], [0.24 * s, 0.95 * s], [0.28 * s, 1.15 * s], [0.1 * s, 1.25 * s], [0.001, 1.26 * s]], 12, null, x, y + 0.75 * s, z));
    bag.add(mat, box(x + fx * 0.05 * s - 0.24 * s, y + 0.05 * s, z + fz * 0.05 * s - 0.24 * s, x + fx * 0.55 * s + 0.24 * s, y + 0.8 * s, z + fz * 0.55 * s + 0.24 * s));
    bag.add(mat, lathe([[0.001, 0], [0.12 * s, 0.04 * s], [0.13 * s, 0.2 * s], [0.07 * s, 0.32 * s], [0.001, 0.34 * s]], 12, null, x, y + 2.0 * s, z));
    return;
  }
  bag.add(mat, lathe([[0.32 * s, 0], [0.3 * s, 0.6 * s], [0.24 * s, 1.3 * s], [0.22 * s, 1.75 * s], [0.27 * s, 2.0 * s], [0.1 * s, 2.12 * s], [0.001, 2.13 * s]], 12, null, x, y, z));
  bag.add(mat, lathe([[0.001, 0], [0.12 * s, 0.04 * s], [0.13 * s, 0.2 * s], [0.07 * s, 0.32 * s], [0.001, 0.34 * s]], 12, null, x, y + 2.12 * s, z));
  if (globe) bag.add(BZ, lathe(Array.from({ length: 11 }, (_, i) => [Math.max(0.001, Math.sin(i / 10 * Math.PI) * 0.75 * s), (1 - Math.cos(i / 10 * Math.PI)) * 0.75 * s]), 16, null, x, y + 2.25 * s, z));
  else if (arm) bag.add(mat, box(x + fz * 0.28 * s - 0.05 * s, y + 1.4 * s, z - fx * 0.28 * s - 0.05 * s, x + fz * 0.28 * s + 0.05 * s, y + 2.5 * s, z - fx * 0.28 * s + 0.05 * s));
}

/**
 * The inside, given the hall's rect, foot y, height h, the bay width of the front bw and the seven entry bays
 * [zA, zB] on the east front; returns the boxes of solid mass left once the rooms are cut out of the block.
 */
export function townHallInterior(el, { bag, col, lights }, { zA, zB }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 33, E = x1, cz = (z0 + z1) / 2, rand = rng(1655);
  const Yf = y + 15.9, Yv = y + 0.12;
  const hx0 = x0 + 4, hx1 = x1 - 4, cxh = (hx0 + hx1) / 2;                     // the Burgerzaal's ends
  const voids = [
    [E - 6.6, Yv, zA, E, y + 8.6, zB],                                           // the vestibule
    [E - 15.4, Yv, cz - 6, E - 7.4, y + 11, cz + 6],                             // the Vierschaar
    ...[-4, 0, 4].map((dz) => [E - 7.4, Yv, cz + dz - 0.9, E - 6.6, y + 4.2, cz + dz + 0.9]),   // its grilled openings
    [E - 15, Yv, zA - 4, E - 5, Yf + 3.6, zA],                                   // the stairwell
    [E - 6.6, Yf - 0.03, zA - 0.01, E - 5, Yf + 3, cz - 11.5 + 0.01],            // the passage from the stair's head to the north gallery
    [hx0, Yf - 0.03, cz - 11.5, hx1, Yf + 9.6, cz + 11.5],                       // the Burgerzaal and its galleries
    [hx0, Yf + 9.6, cz - 8.8, hx1, Yf + 19.6, cz + 8.8],                         // the vault's height
  ];
  let mass = [[x0, y - 0.5, z0, x1, y + h, z1]];
  for (const v of voids) mass = mass.flatMap((b) => cut(b, v));
  for (const b of mass) { bag.add(ST, box(...b)); col.rect([b[0], b[2], b[3], b[5]], b[1], b[4]); }

  // ── the vestibule: its marble floor, the stucco ceiling on transverse arches, lamps
  bag.add(MF, box(E - 6.6, Yv, zA, E - 0.6, y + 0.15, zB)); col.floor([E - 6.6, zA, E + 1.5, zB], y + 0.15);
  bag.add(VA, box(E - 6.6, y + 8.55, zA, E - 0.6, y + 8.6, zB));
  for (let zz = zA + 3.8; zz < zB - 1; zz += 3.8) { bag.add(ST, box(E - 6.6, y + 7.9, zz - 0.3, E - 0.6, y + 8.55, zz + 0.3)); bag.add(ST, box(E - 6.6, Yv, zz - 0.35, E - 6.2, y + 7.9, zz + 0.35)); col.rect([E - 6.6, zz - 0.35, E - 6.2, zz + 0.35], y, y + 7.9); }
  for (const zz of [zA + 6, (zA + zB) / 2, zB - 6]) lights.push({ at: [E - 3.5, y + 6.5, zz], color: '#e6ebf5', intensity: 3, distance: 14 });

  // ── the Vierschaar: white marble, the bronze grilles toward the vestibule, the caryatids, the reliefs, the magistrates' bench
  const vx0 = E - 15.4, vx1 = E - 7.4;
  bag.add(MF, box(vx0, Yv, cz - 6, vx1, y + 0.15, cz + 6));
  for (const [a, b] of [[[vx0 + 0.08, cz - 6], [vx1, cz - 6]], [[vx0 + 0.08, cz + 6], [vx1, cz + 6]]]) bag.add(MB, box(Math.min(a[0], b[0]), y + 0.15, a[1] - (a[1] < cz ? 0 : 0.08), Math.max(a[0], b[0]), y + 10.4, a[1] + (a[1] < cz ? 0.08 : 0)));
  bag.add(MB, box(vx0, y + 0.15, cz - 6, vx0 + 0.08, y + 10.4, cz + 6));
  bag.add(MB, box(vx0, y + 10.4, cz - 6, vx1, y + 11, cz + 6));
  for (const dz of [-4, 0, 4]) {
    const zc = cz + dz;
    for (let k = 0; k <= 12; k++) { const zz = zc - 0.86 + k * 1.72 / 12; bag.add(BZ, box(E - 7.03, y + 0.15, zz - 0.02, E - 6.97, y + 4.2, zz + 0.02)); }
    for (const yy of [0.25, 2.2, 4.05]) bag.add(BZ, box(E - 7.06, y + yy, zc - 0.9, E - 6.94, y + yy + 0.1, zc + 0.9));
    col.rect([E - 7.06, zc - 0.9, E - 6.94, zc + 0.9], y, y + 4.2);
  }
  // the west wall: four caryatids carrying the frieze, the three reliefs of judgement between them (Brutus, Zaleucus, Solomon)
  { const wx = vx0 + 0.08;
    bag.add(MB, box(wx, y + 4.2, cz - 5.6, wx + 0.35, y + 4.75, cz + 5.6));
    for (const k of [-1.5, -0.5, 0.5, 1.5]) { const zz = cz + k * 3.6; bag.add(MB, box(wx, y + 1.2, zz - 0.4, wx + 0.7, y + 1.5, zz + 0.4)); figure(bag, MB, wx + 0.4, y + 1.5, zz, 1.25, { fx: 1, arm: false }); bag.add(MB, box(wx + 0.12, y + 4.2 - 0.18, zz - 0.32, wx + 0.68, y + 4.22, zz + 0.32)); }
    for (const k of [-1, 0, 1]) {
      const zz = cz + k * 3.6;
      bag.add(MB, box(wx, y + 5.2, zz - 1.4, wx + 0.12, y + 8.6, zz + 1.4));
      bag.add('marble', box(wx + 0.12, y + 5.4, zz - 1.2, wx + 0.18, y + 8.4, zz + 1.2));
      for (let f = 0; f < 4; f++) { const fz = zz - 0.9 + f * 0.6 + (rand() - 0.5) * 0.15, hh = 1.6 + rand() * 0.8; bag.add(MB, lathe([[0.16, 0], [0.13, hh * 0.6], [0.15, hh * 0.9], [0.06, hh], [0.001, hh + 0.01]], 8, null, wx + 0.2, y + 5.5, fz).scale(1, 1, 1)); bag.add(MB, lathe([[0.001, 0], [0.08, 0.03], [0.08, 0.16], [0.001, 0.2]], 8, null, wx + 0.2, y + 5.5 + hh, fz)); }
    }
    // the bench of the magistrates (the judge and the aldermen) on its step, its back panelled; the seat of the judge raised in the middle
    bag.add(MB, box(wx, y + 0.15, cz - 5.6, wx + 2.2, y + 0.45, cz + 5.6)); col.rect([wx, cz - 5.6, wx + 2.2, cz + 5.6], y, y + 0.45);
    bag.add(MB, box(wx + 0.9, y + 0.45, cz - 5.4, wx + 1.5, y + 0.92, cz + 5.4));
    bag.add(MB, box(wx + 0.75, y + 0.45, cz - 5.4, wx + 0.9, y + 1.15, cz + 5.4));
    bag.add(MB, box(wx + 0.9, y + 0.92, cz - 0.6, wx + 1.55, y + 1.05, cz + 0.6));
    bag.add('cloth_red', box(wx + 0.92, y + 0.92, cz - 5.3, wx + 1.48, y + 0.95, cz + 5.3)); }
  // the accused's place before the bench, roped off; lamps
  bag.add(MB, box(vx1 - 3.6, y + 0.15, cz - 0.6, vx1 - 2.4, y + 0.3, cz + 0.6));
  lights.push({ at: [vx0 + 4, y + 8, cz], color: '#eef0f5', intensity: 3, distance: 14 });

  // ── the stairway: four flights between landings, the stair's walls, up to the floor of the Burgerzaal
  { const lw = [E - 15, E - 13.4], le = [E - 6.6, E - 5], A = [zA - 4, zA - 2.1], B = [zA - 1.9, zA], rise = (Yf - (y + 0.15)) / 4;
    const flight = (lane, ya, westward) => {
      const n = Math.round(rise / 0.17), run = (le[0] - lw[1]) / n;
      for (let k = 0; k < n; k++) {
        const yt = ya + (k + 1) * rise / n, xa = westward ? le[0] - (k + 1) * run : lw[1] + k * run;
        bag.add(ST, box(xa, yt - 0.45, lane[0], xa + run + 0.005, yt, lane[1]));
      }
      col.ramp([lw[1], lane[0], le[0], lane[1]], ya, ya + rise, westward ? 'w' : 'e');
    };
    const yl = (k) => y + 0.15 + k * rise;
    flight(B, yl(0), true); flight(A, yl(1), false); flight(B, yl(2), true); flight(A, yl(3), false);
    for (const [r, yy] of [[[lw[0], zA - 4, lw[1], zA], yl(1)], [[le[0], zA - 4, le[1], zA], yl(2)], [[lw[0], zA - 4, lw[1], zA], yl(3)]]) { bag.add(ST, box(r[0], yy - 0.35, r[1], r[2], yy, r[3])); col.floor(r, yy); }
    bag.add(MF, box(le[0], Yv, zA - 4, le[1], y + 0.15, zA)); col.floor([le[0], zA - 4, le[1], zA], y + 0.15);
    bag.add(MF, box(le[0], Yf - 0.38, zA - 4, le[1], Yf, cz - 11.5)); col.floor([le[0], zA - 4, le[1], cz - 11.5], Yf);
    bag.add(MF, box(lw[0], Yv, zA - 4, lw[1] + 0.01, y + 0.15, zA));
    // the wall between the lanes (with a handrail's width of daylight at its ends)
    bag.add(ST, box(lw[1], Yv, A[1], le[0], Yf + 1.1, B[0])); col.rect([lw[1], A[1], le[0], B[0]], y, Yf + 1.1);
    for (let k = 0; k < 4; k++) lights.push({ at: [(lw[0] + le[1]) / 2, yl(k) + 2.6, zA - 2], color: '#ffe2b8', intensity: 1.6, distance: 9 }); }

  // ── the Burgerzaal: the marble floor with its maps, the arcades to the galleries, the pilasters and the entablature, the vault
  const hz0 = cz - 8, hz1 = cz + 8, Ys = Yf + 11, R = 8;
  bag.add(MF, box(hx0, Yf - 0.03, cz - 11.5, hx1, Yf, cz + 11.5)); col.floor([hx0, cz - 11.5, hx1, cz + 11.5], Yf);
  // the three maps, each 6.24 m across: the western hemisphere, the northern sky, the eastern hemisphere
  const R6 = 3.12, yi = Yf, t1 = 0.004, t2 = 0.008;
  const lines = (cx, cz2, mat, segs) => { for (const [p, q, w] of segs) bag.add(mat, flat(stripShape(p, q, w), cx, cz2, yi + t1, yi + t2, 2)); };
  const hemisphere = (cx, lands) => {
    bag.add(MB, flat(discShape(R6), cx, cz, yi, yi + t1, 48));
    bag.add(BZ, flat(ringShape(R6, R6 + 0.18), cx, cz, yi, yi + t2, 48));
    for (const L of lands) bag.add('giallo', flat(polyShape(coast(L).map(([u, v]) => [u * R6, v * R6])), cx, cz, yi + t1, yi + t2, 2));
    // the graticule: the equator, the tropics, the central meridian and meridians as arcs (strips)
    const segs = [];
    for (const lat of [-0.4, 0, 0.4]) { const half = Math.sqrt(1 - lat * lat) * R6; segs.push([[-half, lat * R6], [half, lat * R6], lat ? 0.025 : 0.04]); }
    for (const m of [-0.66, -0.33, 0, 0.33, 0.66]) { const pts = Array.from({ length: 13 }, (_, i) => { const v = -1 + i / 6; return [m * Math.sqrt(1 - v * v) * R6, v * R6]; }); for (let i = 0; i < 12; i++) segs.push([pts[i], pts[i + 1], 0.025]); }
    lines(cx, cz, BZ, segs);
  };
  // the lands, after the Blaeu maps of the time (the Americas; Europe, Africa and Asia with New Holland)
  hemisphere(cxh + 8.6, [
    [[-0.55, 0.72], [-0.2, 0.84], [0.12, 0.7], [0.1, 0.48], [-0.04, 0.36], [-0.08, 0.18], [-0.24, 0.26], [-0.44, 0.4], [-0.6, 0.55]],
    [[0.04, 0.1], [0.3, 0.02], [0.42, -0.18], [0.22, -0.48], [0.06, -0.74], [-0.04, -0.5], [-0.1, -0.14]],
    [[0.24, 0.86], [0.42, 0.8], [0.36, 0.68], [0.22, 0.72]],
    [[-0.66, -0.66], [-0.3, -0.8], [0.2, -0.86], [0.5, -0.8], [0.3, -0.92], [-0.3, -0.9]],
  ]);
  hemisphere(cxh - 8.6, [
    [[-0.55, 0.6], [-0.4, 0.76], [0, 0.86], [0.5, 0.76], [0.76, 0.5], [0.8, 0.2], [0.6, 0.1], [0.45, 0.24], [0.3, 0.14], [0.14, 0.3], [-0.1, 0.36], [-0.3, 0.46], [-0.5, 0.46]],
    [[-0.55, 0.34], [-0.15, 0.3], [0.05, 0.15], [0.1, -0.1], [-0.05, -0.46], [-0.2, -0.5], [-0.3, -0.2], [-0.6, 0.1]],
    [[0.55, -0.25], [0.76, -0.3], [0.72, -0.5], [0.5, -0.48]],
    [[-0.62, 0.66], [-0.55, 0.74], [-0.5, 0.64]],
  ]);
  // the northern sky: a dark disc, the ecliptic and the zodiac's ring, the stars and the constellations' lines in metal
  { const cx = cxh, segs = [];
    bag.add('marble_dark', flat(discShape(R6), cx, cz, yi, yi + t1, 48));
    bag.add(BZ, flat(ringShape(R6, R6 + 0.18), cx, cz, yi, yi + t2, 48));
    bag.add(BZ, flat(ringShape(R6 - 0.45, R6 - 0.4), cx, cz, yi + t1, yi + t2, 48));
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; segs.push([[Math.cos(a) * (R6 - 0.42), Math.sin(a) * (R6 - 0.42)], [Math.cos(a) * R6, Math.sin(a) * R6], 0.03]); }
    bag.add(BZ, flat(ringShape(1.55, 1.6), cx + 0.5, cz - 0.3, yi + t1, yi + t2, 32));
    for (let c = 0; c < 16; c++) {
      const a = rand() * Math.PI * 2, r0 = 0.3 + rand() * 2.2, star = [[Math.cos(a) * r0, Math.sin(a) * r0]];
      for (let k = 0; k < 3 + Math.floor(rand() * 4); k++) { const p = star[star.length - 1], b = rand() * Math.PI * 2, d = 0.2 + rand() * 0.35, q = [p[0] + Math.cos(b) * d, p[1] + Math.sin(b) * d]; if (Math.hypot(...q) < R6 - 0.55) star.push(q); }
      for (let k = 0; k + 1 < star.length; k++) segs.push([star[k], star[k + 1], 0.018]);
      for (const p of star) bag.add('gilt_bronze', flat(discShape(0.035 + rand() * 0.03), cx + p[0], cz - p[1], yi + t1, yi + t2 + 0.002, 8));
    }
    for (let k = 0; k < 90; k++) { const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * (R6 - 0.5); bag.add('gilt_bronze', flat(discShape(0.02 + rand() * 0.02), cx + Math.cos(a) * r, cz - Math.sin(a) * r, yi + t1, yi + t2, 6)); }
    lines(cx, cz, BZ, segs); }
  // the arcades along both long sides: five arches, marble piers with pilasters, the four elements in relief over the arches
  const nA = 5, pw = (hx1 - hx0) / nA, aw = 4.4, asp = Yf + 6.2;
  for (const sg of [-1, 1]) {
    const zw = cz + sg * 8.4, sh = new Shape();
    sh.moveTo(0, 0); sh.lineTo(hx1 - hx0, 0); sh.lineTo(hx1 - hx0, Ys - Yf); sh.lineTo(0, Ys - Yf); sh.lineTo(0, 0);
    for (let i = 0; i < nA; i++) { const u = (i + 0.5) * pw, p = new Path(); p.moveTo(u - aw / 2, 0); p.lineTo(u + aw / 2, 0); p.lineTo(u + aw / 2, asp - Yf); p.absarc(u, asp - Yf, aw / 2, 0, Math.PI, false); p.lineTo(u - aw / 2, 0); sh.holes.push(p); }
    bag.add(MB, relief(sh, [sg < 0 ? hx0 : hx1, Yf, zw], [0, -sg], -0.4, 0.4, 12));
    for (let i = 0; i <= nA; i++) {
      const xa = hx0 + i * pw, x2 = Math.min(hx1, Math.max(hx0, xa));
      if (i > 0 && i < nA) col.rect([xa - pw / 2 + aw / 2, zw - 0.4, xa + pw / 2 - aw / 2, zw + 0.4], Yf, Ys);
      // a pilaster on the hall's face, its capital
      const zf = zw - sg * 0.4, za = zf - sg * 0.18;
      bag.add('marble', box(Math.max(hx0, x2 - 0.5), Yf, Math.min(zf, za), Math.min(hx1, x2 + 0.5), Yf + 9.4, Math.max(zf, za)));
      bag.add('marble', box(Math.max(hx0, x2 - 0.65), Yf + 9.4, Math.min(zf, zf - sg * 0.28), Math.min(hx1, x2 + 0.65), Yf + 9.9, Math.max(zf, zf - sg * 0.28)));
    }
    col.rect([hx0, zw - 0.4, hx0 + pw / 2 - aw / 2, zw + 0.4], Yf, Ys); col.rect([hx1 - pw / 2 + aw / 2, zw - 0.4, hx1, zw + 0.4], Yf, Ys);
    // the entablature along the hall
    const zf = zw - sg * 0.4;
    bag.add('marble', box(hx0, Yf + 9.9, Math.min(zf, zf - sg * 0.35), hx1, Yf + 10.5, Math.max(zf, zf - sg * 0.35)));
    bag.add('marble', box(hx0, Yf + 10.5, Math.min(zf, zf - sg * 0.55), hx1, Ys, Math.max(zf, zf - sg * 0.55)));
    // the elements: a relief panel over each arch, figures and their attributes as rounded masses
    for (let i = 0; i < nA; i++) {
      const xc = hx0 + (i + 0.5) * pw, zp = zf - sg * 0.04;
      bag.add('marble', box(xc - 1.5, asp + aw / 2 + 0.25, Math.min(zf, zp), xc + 1.5, Yf + 9.75, Math.max(zf, zp)));
      for (let f = 0; f < 3; f++) { const xf = xc - 0.9 + f * 0.9, hh = 0.7 + rand() * 0.35; bag.add(MB, lathe([[0.17, 0], [0.13, hh * 0.7], [0.15, hh], [0.001, hh + 0.12]], 8, null, xf, asp + aw / 2 + 0.35, zp - sg * 0.04).scale(1, 1, 1)); }
    }
    // the gallery behind: its stucco ceiling, the windows to the court in its outer wall, a god on his pedestal at each end
    const zo = cz + sg * 11.5;
    bag.add(VA, box(hx0, Yf + 9.55, Math.min(zw + sg * 0.4, zo), hx1, Yf + 9.6, Math.max(zw + sg * 0.4, zo)));
    for (let i = 0; i < nA; i++) {
      const xc = (sg < 0 ? 1 : -1) * (hx0 + (i + 0.5) * pw), s2 = new Shape();
      s2.moveTo(xc - 1.2, 0); s2.lineTo(xc + 1.2, 0); s2.lineTo(xc + 1.2, 4.6); s2.absarc(xc, 4.6, 1.2, 0, Math.PI, false); s2.lineTo(xc - 1.2, 0);
      bag.add('daylight', relief(s2, [0, Yf + 1.6, zo], [0, -sg], -0.01, 0.02, 10));
      const fr2 = new Shape(); fr2.moveTo(xc - 1.4, 0); fr2.lineTo(xc - 1.2, 0); fr2.lineTo(xc - 1.2, 4.7); fr2.absarc(xc, 4.7, 1.2, Math.PI, 0, true); fr2.lineTo(xc + 1.2, 0); fr2.lineTo(xc + 1.4, 0); fr2.lineTo(xc + 1.4, 4.7); fr2.absarc(xc, 4.7, 1.4, 0, Math.PI, false); fr2.lineTo(xc - 1.4, 0);
      bag.add('marble', relief(fr2, [0, Yf + 1.5, zo], [0, -sg], -0.01, 0.08, 10));
    }
    for (const xx of [hx0 + 1.2, hx1 - 1.2]) { const zz = (zw + sg * 0.4 + zo) / 2; bag.add('marble', box(xx - 0.5, Yf, zz - 0.5, xx + 0.5, Yf + 1.4, zz + 0.5)); col.rect([xx - 0.5, zz - 0.5, xx + 0.5, zz + 0.5], Yf, Yf + 1.4); figure(bag, MB, xx, Yf + 1.4, zz, 1.15, { fx: xx < cxh ? 1 : -1 }); }
  }
  // the end walls: marble revetment, pilasters; east the door from the Dam's side with the Maid of Amsterdam enthroned over it; west Atlas bearing the heavens over Justice
  for (const [xe, sg] of [[hx1, -1], [hx0, 1]]) {
    const xs = xe + sg * 0.1;
    bag.add(MB, box(Math.min(xe, xs), Yf, hz0, Math.max(xe, xs), Ys, hz1));
    bag.add('marble', box(Math.min(xs, xs + sg * 0.3), Yf + 9.9, hz0, Math.max(xs, xs + sg * 0.3), Ys, hz1));
    for (const zz of [hz0 + 0.5, cz - 3.2, cz + 3.2, hz1 - 0.5]) bag.add('marble', box(Math.min(xs, xs + sg * 0.18), Yf, zz - 0.5, Math.max(xs, xs + sg * 0.18), Yf + 9.9, zz + 0.5));
    if (sg < 0) {
      bag.add('wood_dark', box(xs - 0.04, Yf, cz - 1.3, xs, Yf + 4.4, cz + 1.3));
      bag.add('marble', box(xs - 0.25, Yf + 4.4, cz - 1.7, xs, Yf + 4.9, cz + 1.7));
      for (const zz of [cz - 1.5, cz + 1.5]) bag.add('marble', box(xs - 0.22, Yf, zz - 0.2, xs, Yf + 4.4, zz + 0.2));
      bag.add('marble', box(xs - 1.2, Yf + 5.6, cz - 1.6, xs, Yf + 5.9, cz + 1.6));
      figure(bag, MB, xs - 0.75, Yf + 5.9, cz, 1.35, { seated: true, fx: -1 });
      for (const dz of [-2.6, 2.6]) { bag.add('marble', box(xs - 0.15, Yf + 5.7, cz + dz - 0.9, xs - 0.02, Yf + 8.2, cz + dz + 0.9)); for (let f = 0; f < 2; f++) bag.add(MB, lathe([[0.15, 0], [0.12, 0.9], [0.13, 1.4], [0.001, 1.55]], 8, null, xs - 0.2, Yf + 6.1, cz + dz - 0.35 + f * 0.7)); }
    } else {
      bag.add('marble', box(xs, Yf + 1.6, cz - 1.1, xs + 0.9, Yf + 2.0, cz + 1.1));
      figure(bag, MB, xs + 0.5, Yf + 2.0, cz, 1.2, { fx: 1 });
      bag.add('marble', box(xs, Yf + 6.0, cz - 1.4, xs + 1.3, Yf + 6.4, cz + 1.4));
      figure(bag, MB, xs + 0.7, Yf + 6.4, cz, 1.3, { globe: true, fx: 1 });
    }
  }
  // the barrel vault: its stucco shell on the entablature, transverse ribs, the half-round ends with a window high in each
  { const n = 24, P = (x, a, r) => [x, Ys + Math.sin(a) * r, cz + Math.cos(a) * r];
    const seg = (xa, xb, r0, r1, a0, a1) => hexa([P(xa, a0, r0), P(xb, a0, r0), P(xb, a1, r0), P(xa, a1, r0), P(xa, a0, r1), P(xb, a0, r1), P(xb, a1, r1), P(xa, a1, r1)]);
    for (let k = 0; k < n; k++) bag.add(VA, seg(hx0, hx1, R, R + 0.4, Math.PI * k / n, Math.PI * (k + 1) / n));
    for (let i = 1; i < nA; i++) { const xr = hx0 + i * pw; for (let k = 0; k < n; k++) bag.add(VA, seg(xr - 0.4, xr + 0.4, R - 0.3, R + 0.02, Math.PI * k / n, Math.PI * (k + 1) / n)); }
    for (const [xe, sg] of [[hx0, 1], [hx1, -1]]) {
      const s = new Shape(); s.moveTo(-R - 0.4, 0); s.lineTo(R + 0.4, 0); s.absarc(0, 0, R + 0.4, 0, Math.PI, false); s.lineTo(-R - 0.4, 0);
      const w = new Path(); w.absarc(0, 3.2, 2.4, 0, Math.PI * 2, true); s.holes.push(w);
      bag.add(VA, relief(s, [xe, Ys, cz], [sg, 0], -0.4, 0.0, 24));
      bag.add('daylight', relief(discShape(2.4), [xe, Ys + 3.2, cz], [sg, 0], -0.38, -0.3, 24));
    }
  }
  for (let i = 0; i < 4; i++) lights.push({ at: [hx0 + 4 + i * (hx1 - hx0 - 8) / 3, Yf + 12, cz], color: '#e6ecf8', intensity: 5, distance: 26 });
  for (const sg of [-1, 1]) lights.push({ at: [cxh, Yf + 5, cz + sg * 10], color: '#e6ecf8', intensity: 3, distance: 22 });
  return { Yf };
}
