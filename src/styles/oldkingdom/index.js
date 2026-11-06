// Old Kingdom Egyptian architecture (Giza, 4th dynasty, c. 2560 BC; docs/settlements/giza.md §4–§5):
// the true pyramid cased in polished white limestone; temples of granite pillars and basalt
// pavements behind plain limestone walls; the covered causeway; mastaba tombs with battered walls
// in streets; the workers' town of mudbrick — galleries (long halls), bakeries, houses with flat
// roofs and courtyards — and the great stone Wall of the Crow with its tunnel gate.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris, flipTris } from '../ming/index.js';
import { loft, ring } from '../egyptian/objects.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A frustum over a rectangle centred at (cx, cz): half-sizes (a0, b0) at y0 to (a1, b1) at y1. */
function frust(bag, mat, cx, cz, a0, b0, a1, b1, y0, y1) {
  const B = [[-a0, -b0], [a0, -b0], [a0, b0], [-a0, b0]], T = [[-a1, -b1], [a1, -b1], [a1, b1], [-a1, b1]], t = [];
  const P = (q, y) => [cx + q[0], y, cz + q[1]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...P(B[i], y0), ...P(T[j], y1), ...P(T[i], y1), ...P(B[i], y0), ...P(B[j], y0), ...P(T[j], y1)); }
  if (a1 > 0.01) t.push(...P(T[0], y1), ...P(T[2], y1), ...P(T[3], y1), ...P(T[0], y1), ...P(T[1], y1), ...P(T[2], y1));
  bag.add(mat, fromTriangles(t));
}

/**
 * ok_pyramid: a true pyramid { c, a (half the base), h, mat }: the faces of polished casing stone
 * on a pavement's edge, the apex a gilded capstone; the slope walkable (one can climb it, slowly,
 * as the faces are smooth only to the eye).
 */
function okPyramid(el, { bag, col }) {
  const [cx, cz] = el.c, a = el.a, h = el.h, y = el.y ?? 0;
  // the casing up to the foot of the pyramidion, the pyramidion gilded (electrum) at the top
  const ph = Math.min(3, h * 0.03), ap = a * ph / h;
  frust(bag, el.mat || 'tura_limestone', cx, cz, a, a, ap, ap, y, y + h - ph);
  frust(bag, 'gilt_bronze', cx, cz, ap, ap, 0, 0, y + h - ph, y + h);
  frust(bag, 'tura_limestone', cx, cz, a + 0.6, a + 0.6, a, a, y - 0.4, y + 0.3);                 // the pavement's edge
  // climbing the faces: each face as strips of ramps, from the foot up to where the strip meets the
  // arrises (the triangle of the face, approximated)
  const n = 40;
  for (let i = 0; i < n; i++) {
    const u0 = -a + 2 * a * i / n, u1 = -a + 2 * a * (i + 1) / n;
    const reach = a - (u0 * u1 < 0 ? 0 : (Math.abs(u0) + Math.abs(u1)) / 2);            // how far in the strip climbs (to its middle line's arris)
    if (reach <= 0.5) continue;
    const top = y + h * reach / a;
    col.ramp([cx + u0, cz - a, cx + u1, cz - a + reach], y, top, 's');               // the north face
    col.ramp([cx + u0, cz + a - reach, cx + u1, cz + a], y, top, 'n');               // the south face
    col.ramp([cx - a, cz + u0, cx - a + reach, cz + u1], y, top, 'e');               // the west face
    col.ramp([cx + a - reach, cz + u0, cx + a, cz + u1], y, top, 'w');               // the east face
  }
}

/** mastaba: a tomb of stone (or mudbrick) { c, a, b (half-sizes), h, mat, door ('e' default) }: battered walls, a flat top, an offering niche (false door) on its east face. */
function mastaba(el, { bag, col }) {
  const [cx, cz] = el.c, { a, b, h } = el, batter = h * 0.13;
  frust(bag, el.mat || 'limestone_core', cx, cz, a, b, a - batter, b - batter, 0, h);
  bag.add('limestone_core', box(cx - a + batter - 0.2, h, cz - b + batter - 0.2, cx + a - batter + 0.2, h + 0.3, cz + b - batter + 0.2));
  // the false door: a tall recessed panel on the east face, a little chapel before it
  const ex = cx + a - batter * 0.6;
  bag.add('lacquer_black', box(ex - 0.05, 0.1, cz - 0.6, ex + 0.05, h * 0.7, cz + 0.6));
  bag.add(el.mat || 'limestone_core', box(ex, 0, cz - 2.2, ex + 2.6, 2.4, cz - 1.8));
  bag.add(el.mat || 'limestone_core', box(ex, 0, cz + 1.8, ex + 2.6, 2.4, cz + 2.2));
  col.rect([cx - a, cz - b, cx + a, cz + b], 0, h);
  col.floor([cx - a + batter, cz - b + batter, cx + a - batter, cz + b - batter], h + 0.3);
}

/**
 * ok_temple: a pyramid temple { rect, h, court: [x0, z0, x1, z1] (an open court within), pillars
 * (granite pillars round the court), door ('e' | 'w' | …) }: thick limestone walls, the court
 * paved with basalt, square pillars of red granite carrying architraves round it.
 */
function okTemple(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 7, th = 2.2, [c0, d0, c1, d1] = el.court;
  bag.add('basalt', box(x0, -0.2, z0, x1, 0.12, z1));
  col.floor([x0, z0, x1, z1], 0.12);
  const walls = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  const doorSide = { n: 0, e: 1, s: 2, w: 3 }[el.door || 'e'], back = (doorSide + 2) % 4;
  walls.forEach(([a, b], i) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const gaps = i === doorSide ? [[L / 2 - 2, L / 2 + 2]] : i === back && el.backDoor ? [[L / 2 - 2, L / 2 + 2]] : [];
    let s = 0;
    for (const [g0, g1] of [...gaps, [L, L]]) {
      if (g0 - s > 0.1) {
        const p = [a[0] + ux * s, a[1] + uz * s], q = [a[0] + ux * g0, a[1] + uz * g0], t = [];
        beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, h);
        bag.add('tura_limestone', fromTriangles(t));
        col.segment(p, q, th, 0, h);
      }
      s = g1;
    }
  });
  // roofed parts round the court: slabs from the walls to the pillars
  for (const r of [[x0, z0, x1, d0], [x0, d1, x1, z1], [x0, d0, c0, d1], [c1, d0, x1, d1]]) if (r[2] - r[0] > 0.5 && r[3] - r[1] > 0.5) bag.add('tura_limestone', box(r[0], h - 0.9, r[1], r[2], h, r[3]));
  // the pillars of red granite round the court, their architraves
  const n = el.pillars ?? 6;
  for (const [a, b] of [[[c0, d0], [c1, d0]], [[c1, d0], [c1, d1]], [[c1, d1], [c0, d1]], [[c0, d1], [c0, d0]]]) {
    for (let k = 0; k < n; k++) {
      const s = k / n, x = a[0] + (b[0] - a[0]) * s, z = a[1] + (b[1] - a[1]) * s;
      bag.add('granite_red', box(x - 0.55, 0.12, z - 0.55, x + 0.55, h - 0.9, z + 0.55));
      col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], 0, h);
    }
    const t = [];
    beamTris(t, [a[0], h - 1.6, a[1]], [b[0], h - 1.6, b[1]], 0.6, 0.7);
    bag.add('granite_red', fromTriangles(t));
  }
}

/** causeway: a covered corridor { a, b, w, h }: walls of limestone, a roof of slabs with a slit for light, the floor a ramp following the ground. */
function causeway(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, w = (el.w ?? 4.6) / 2, h = el.h ?? 5, ya = el.ya ?? 0, yb = el.yb ?? 0;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const n = Math.ceil(L / 6);
  for (let k = 0; k < n; k++) {
    const s0 = k / n, s1 = (k + 1) / n, y0 = ya + (yb - ya) * s0, y1 = ya + (yb - ya) * s1;
    const p0 = [ax + (bx - ax) * s0, az + (bz - az) * s0], p1 = [ax + (bx - ax) * s1, az + (bz - az) * s1];
    for (const s of [-1, 1]) {
      const t = [];
      beamTris(t, [p0[0] + nx * (w + 0.7) * s, Math.min(y0, y1) - 1.5, p0[1] + nz * (w + 0.7) * s], [p1[0] + nx * (w + 0.7) * s, Math.min(y0, y1) - 1.5, p1[1] + nz * (w + 0.7) * s], 0.7, h + 1.5 + Math.abs(y1 - y0));
      bag.add('tura_limestone', fromTriangles(t));
      col.segment([p0[0] + nx * (w + 0.7) * s, p0[1] + nz * (w + 0.7) * s], [p1[0] + nx * (w + 0.7) * s, p1[1] + nz * (w + 0.7) * s], 1.4, Math.min(y0, y1) - 1.5, Math.max(y0, y1) + h);
      // the roof slabs, leaving a slit along the middle
      const r = [];
      beamTris(r, [p0[0] + nx * (w * 0.55) * s, Math.max(y0, y1) + h, p0[1] + nz * (w * 0.55) * s], [p1[0] + nx * (w * 0.55) * s, Math.max(y0, y1) + h, p1[1] + nz * (w * 0.55) * s], w * 0.45 + 0.7, 0.6);
      bag.add('tura_limestone', fromTriangles(r));
    }
    const f = [];
    beamTris(f, [p0[0], Math.min(y0, y1) - 1.5, p0[1]], [p1[0], Math.min(y0, y1) - 1.5, p1[1]], w, 1.5);
    bag.add('basalt', fromTriangles(f));
    const cx = (p0[0] + p1[0]) / 2, cz = (p0[1] + p1[1]) / 2, hx = Math.abs(ux) * L / n / 2 + Math.abs(nx) * w, hz = Math.abs(uz) * L / n / 2 + Math.abs(nz) * w;
    const dir = Math.abs(ux) > Math.abs(uz) ? (ux * (y1 - y0) > 0 ? 'e' : 'w') : (uz * (y1 - y0) > 0 ? 's' : 'n');
    if (Math.abs(y1 - y0) > 0.05) col.ramp([cx - hx, cz - hz, cx + hx, cz + hz], Math.min(y0, y1), Math.max(y0, y1), dir);
    else col.floor([cx - hx, cz - hz, cx + hx, cz + hz], y0);
  }
}

/**
 * mud_house: a house of the workers' town { rect, seed }: mudbrick walls plastered with mud, a
 * door, a small court open to the sky at one end, flat roofs of palm logs and mud, a few
 * storage bins and an oven in the court.
 */
function mudHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 2.6 + rand() * 0.6, th = 0.45;
  const W = x1 - x0, D = z1 - z0, court = rand() < 0.7;
  const split = court ? x0 + W * (0.45 + rand() * 0.2) : x1;
  for (const [a, b, gap] of [[[x0, z0], [x1, z0], false], [[x1, z0], [x1, z1], false], [[x1, z1], [x0, z1], true], [[x0, z1], [x0, z0], false]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const pieces = gap ? [[0, L * 0.3], [L * 0.3 + 1.0, L]] : [[0, L]];
    for (const [s0, s1] of pieces) {
      const p = [a[0] + ux * s0, a[1] + uz * s0], q = [a[0] + ux * s1, a[1] + uz * s1], t = [];
      beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, h);
      bag.add('mud_plaster', fromTriangles(t));
      col.segment(p, q, th, 0, h);
    }
  }
  if (court) {
    const t = [];
    beamTris(t, [split, 0, z0], [split, 0, z1 - 1.4], th / 2, h);
    bag.add('mud_plaster', fromTriangles(t));
    col.segment([split, z0], [split, z1 - 1.4], th, 0, h);
    // an oven and two storage bins in the court
    bag.add('mudbrick', box(split + 0.6, 0, z0 + 0.6, split + 1.6, 0.9, z0 + 1.6));
    bag.add('mud_plaster', box(x1 - 1.4, 0, z0 + 0.6, x1 - 0.6, 1.2, z0 + 1.4));
  }
  bag.add('timber', box(x0 - 0.1, h, z0 - 0.1, split + 0.1, h + 0.12, z1 + 0.1));
  bag.add('mud_plaster', box(x0 - 0.1, h + 0.12, z0 - 0.1, split + 0.1, h + 0.3, z1 + 0.1));
  col.floor([x0, z0, split, z1], h + 0.3);
  void W; void D;
}

/** gallery_hall: one of the long halls of the workers' town { rect, h } — a colonnade down the middle under a roof, a porch at the end, sleeping platforms along the walls. */
function galleryHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 3.4, th = 0.6;
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x1, z0], [x1, z1]]]) {
    const t = [];
    beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], th / 2, h);
    bag.add('mud_plaster', fromTriangles(t));
    col.segment(a, b, th, 0, h);
  }
  const zc = (z0 + z1) / 2, n = Math.round((x1 - x0) / 3.2);
  for (let k = 1; k < n; k++) { const x = x0 + (x1 - x0) * k / n; bag.add('timber', box(x - 0.18, 0, zc - 0.18, x + 0.18, h, zc + 0.18)); col.rect([x - 0.2, zc - 0.2, x + 0.2, zc + 0.2], 0, h); }
  bag.add('timber', box(x0, h, z0, x1, h + 0.15, z1));
  bag.add('mud_plaster', box(x0 - 0.2, h + 0.15, z0 - 0.2, x1 + 0.2, h + 0.4, z1 + 0.2));
  for (const z of [z0 + 0.9, z1 - 0.9]) bag.add('mudbrick', box(x0 + 2, 0, z - 0.6, x1 - 0.5, 0.5, z + 0.6));
  col.floor([x0, z0, x1, z1], h + 0.4);
}

/** crow_wall: the Wall of the Crow { a, b, h, th, gate: { at, w, h } }: a wall of great limestone blocks with a corbelled tunnel through it. */
function crowWall(el, ctx) {
  STYLES.ming.elements.ming_wall({ a: el.a, b: el.b, y: 0, h: el.h, th: el.th, gates: [{ at: el.gate.at, w: el.gate.w, h: el.gate.h }], pal: { plaster: 'limestone_core', roof: 'limestone_core', plinth: 'limestone_core' } }, ctx);
}

/**
 * bakery: one of the bakeries of the workers' town (docs/settlements/giza.md §5) { rect }: a room
 * of low stone walls, the door on the north; along the south wall a hearth platform, a bed of hot
 * ash on it with the bell-shaped bread pots (bedja) set in rows, lids on some; a stack of pots
 * upturned over an open fire in a corner, heating; two large vats sunk in mudbrick rings for the
 * dough; a few spare pots by the wall.
 */
function bakery(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = 1.3, th = 0.5, rand = rng(el.seed || 3);
  const walls = [[[x0, z1], [x1, z1]], [[x1, z0], [x1, z1]], [[x0, z0], [x0, z1]]];
  const mx = (x0 + x1) / 2;
  walls.push([[x0, z0], [mx - 0.6, z0]], [[mx + 0.6, z0], [x1, z0]]);
  walls.forEach(([a, b], i) => {
    // the long walls run past the corners; the end walls stop against them (no faces in one plane)
    const e0 = i === 0 || i === 3 ? th / 2 : 0, e1 = i === 0 || i === 4 ? th / 2 : 0, ux = Math.sign(b[0] - a[0]), uz = Math.sign(b[1] - a[1]);
    const p = [a[0] - ux * e0, a[1] - uz * e0 + (i === 1 || i === 2 ? th / 2 : 0)], q = [b[0] + ux * e1, b[1] + uz * e1 - (i === 1 || i === 2 ? th / 2 : 0)], t = [];
    beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, h);
    bag.add('limestone_core', fromTriangles(t));
    col.segment(p, q, th, 0, h);
  });
  // the hearth platform along the south wall and its bed of ash
  const hz0 = z1 - th / 2 - 1.5, hz1 = z1 - th / 2;
  bag.add('mudbrick', box(x0 + th / 2, 0, hz0, x1 - th / 2, 0.3, hz1));
  bag.add('plaster_grey', box(x0 + th / 2 + 0.15, 0.3, hz0 + 0.12, x1 - th / 2 - 0.15, 0.4, hz1 - 0.05));
  col.rect([x0, hz0, x1, hz1], 0, 0.4);
  // the bread pots in rows, bedded in the ash, mouths up; lids (pots upturned) on some
  const bell = [[0.04, 0], [0.09, 0.02], [0.15, 0.2], [0.17, 0.3], [0.15, 0.31], [0.13, 0.22], [0.001, 0.08]];
  const n = Math.floor((x1 - x0 - th - 0.5) / 0.42);
  for (let r = 0; r < 3; r++) for (let k = 0; k < n; k++) {
    if (rand() < 0.12) continue;
    const px = x0 + th / 2 + 0.45 + k * 0.42 + (r % 2) * 0.12, pz = hz0 + 0.35 + r * 0.42;
    bag.add('terracotta', lathe(bell, 9, null, px, 0.28, pz));
    if (rand() < 0.4) { const g = lathe(bell, 9); g.rotateX(Math.PI); g.translate(px, 0.28 + 0.31 + 0.3, pz); bag.add('terracotta', g); }
  }
  // the stack of pots heating upturned over an open fire, in the north-west corner
  const sx = x0 + th / 2 + 0.7, sz = z0 + th / 2 + 0.7;
  bag.add('pottery_dark', box(sx - 0.55, 0, sz - 0.55, sx + 0.55, 0.08, sz + 0.55));
  for (let k = 0; k < 3; k++) for (const [ox, oz] of k === 2 ? [[0, 0]] : [[-0.2, -0.15], [0.2, -0.15], [0, 0.2]]) {
    const g = lathe(bell, 9); g.rotateX(Math.PI); g.translate(sx + ox, 0.08 + 0.31 + k * 0.24, sz + oz); bag.add('pottery_dark', g);
  }
  col.rect([sx - 0.55, sz - 0.55, sx + 0.55, sz + 0.55], 0, 0.9);
  // the two vats for the dough, sunk in rings of mudbrick
  for (const vx of [mx + 0.9, x1 - th / 2 - 0.8]) {
    const vz = z0 + th / 2 + 1.1;
    bag.add('mudbrick', lathe([[0.62, 0], [0.62, 0.45], [0.5, 0.5], [0.001, 0.5]], 14, null, vx, 0, vz));
    bag.add('terracotta', lathe([[0.5, 0.5], [0.56, 0.62], [0.52, 0.64], [0.4, 0.56], [0.001, 0.54]], 14, null, vx, 0, vz));
    col.circle(vx, vz, 0.62, 0, 0.64);
  }
}

/** A box turned in plan: centre (cx, cz), half-length a along the angle `ang`, half-width b across it, from y0 to y1. */
function turnedBox(cx, cz, ang, a, b, y0, y1) {
  const ux = Math.cos(ang), uz = Math.sin(ang), vx = -uz, vz = ux, t = [];
  const P = (s, r, y) => [cx + ux * s + vx * r, y, cz + uz * s + vz * r];
  const c = [[-a, -b], [a, -b], [a, b], [-a, b]];
  for (let i = 0; i < 4; i++) { const [p, q] = [c[i], c[(i + 1) % 4]]; t.push(...P(...p, y0), ...P(...q, y0), ...P(...q, y1), ...P(...p, y0), ...P(...q, y1), ...P(...p, y1)); }
  t.push(...P(...c[0], y1), ...P(...c[1], y1), ...P(...c[2], y1), ...P(...c[0], y1), ...P(...c[2], y1), ...P(...c[3], y1));
  // wind every face outward (the sides above may run either way, as ang turns them)
  return fromTriangles(orient(t, [cx, (y0 + y1) / 2, cz]));
}
function orient(t, c) {
  for (let i = 0; i < t.length; i += 9) {
    const a = t.slice(i, i + 3), b = t.slice(i + 3, i + 6), d = t.slice(i + 6, i + 9);
    const n = [(b[1] - a[1]) * (d[2] - a[2]) - (b[2] - a[2]) * (d[1] - a[1]), (b[2] - a[2]) * (d[0] - a[0]) - (b[0] - a[0]) * (d[2] - a[2]), (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0])];
    const m = [(a[0] + b[0] + d[0]) / 3 - c[0], (a[1] + b[1] + d[1]) / 3 - c[1], (a[2] + b[2] + d[2]) / 3 - c[2]];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  return t;
}

/**
 * boat_pit: a pit cut in the rock beside the pyramid for one of the king's boats, sealed (docs/settlements/giza.md §4.2)
 * { c, len, w, ang (the length's direction in plan, radians), shape ('rect' | 'boat'), n (the covering blocks) }:
 * the great limestone beams laid across it side by side, the joints between them stopped with
 * gypsum, a low kerb round the cutting; a boat-shaped pit covered by beams whose length follows
 * the outline of the hull below.
 */
function boatPit(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.len, W = el.w, ang = el.ang ?? 0, n = el.n ?? Math.round(L / 0.78), boat = el.shape === 'boat';
  const ux = Math.cos(ang), uz = Math.sin(ang), step = L / n, top = el.top ?? 0.45;
  const half = (s) => (boat ? W / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(s) / (L / 2), 2.2)), 0.6) : W / 2);
  for (let i = 0; i < n; i++) {
    const s = -L / 2 + (i + 0.5) * step, hb = half(s) + 0.45;
    if (hb < 0.7) continue;
    const x = cx + ux * s, z = cz + uz * s, tt = top - 0.04 * ((i * 7) % 3);           // the beams not quite level
    bag.add('tura_limestone', turnedBox(x, z, ang + Math.PI / 2, hb, step / 2 - 0.03, -0.9, tt));
    if (i < n - 1 && half(s + step / 2) + 0.35 > 0.7) bag.add('plaster_white', turnedBox(cx + ux * (s + step / 2), cz + uz * (s + step / 2), ang + Math.PI / 2, half(s + step / 2) + 0.3, 0.031, -0.9, top - 0.09));
    const r = Math.min(hb, step) * 0.6;
    col.floor([x - r, z - r, x + r, z + r], tt);
  }
  // the kerb of dressed blocks round the cutting, a hand's breadth above the rock
  const segs = boat ? 16 : 1;
  for (const side of [-1, 1]) for (let k = 0; k < segs; k++) {
    const s0 = -L / 2 + L * k / segs, s1 = -L / 2 + L * (k + 1) / segs, h0 = half(s0) + 0.75, h1 = half(s1) + 0.75;
    const p0 = [cx + ux * s0 - uz * side * h0, cz + uz * s0 + ux * side * h0], p1 = [cx + ux * s1 - uz * side * h1, cz + uz * s1 + ux * side * h1];
    const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    bag.add('limestone_core', turnedBox(m[0], m[1], Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), len / 2 + 0.16, 0.3, -0.3, 0.15));
  }
  if (!boat) for (const e of [-1, 1]) {
    const s = e * (L / 2 + 0.75);
    bag.add('limestone_core', turnedBox(cx + ux * s, cz + uz * s, ang + Math.PI / 2, W / 2 + 1.05, 0.3, -0.3, 0.15));
  }
}

/**
 * royal_ship: Khufu's ship as it lay at the harbour (docs/settlements/giza.md §4.3) { at (the
 * middle), y (the water), len, ang (the bow's direction in plan) }: a long shallow hull of cedar,
 * its ends rising into papyriform posts — the stern higher, curving in toward the bow — each
 * ending in a papyrus umbel; the decking with its stringers; the deckhouse aft of midships with its
 * anteroom, the light framework for an awning before it and the small canopy in the bow; ten oars
 * lashed amidships ahead of the deckhouse, and the two great steering oars at the stern.
 */
function royalShip(el, { bag }) {
  const L = el.len ?? 43.6, B = el.beam ?? 5.9, ang = el.ang ?? 0, [X0, Z0] = el.at, Y0 = el.y ?? 0;
  // local frame: the ship along −z (bow) to +z (stern), x across, y up from the water
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const W = ([x, y, z]) => { const f = -z; return [X0 + ca * f - sa * x, Y0 + y, Z0 + sa * f + ca * x]; };
  const parts = { cedar: [], linen: [], timber: [] };
  const put = (mat, g) => parts[mat].push(g);
  const gun = (t) => 0.95 + (t > 0 ? 1.6 : 1.1) * Math.pow(Math.max(0, Math.abs(t) - 0.55) / 0.45, 2);
  const keel = (t) => -0.95 * (1 - Math.pow(Math.abs(t), 2.4)) + 0.25 * Math.pow(Math.abs(t), 3) * 3;
  const wid = (t) => B / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 2.4)), 0.55) + 0.14;
  // the hull: half-elliptic sections from gunwale to gunwale, the deck closing each across
  const rings = [];
  for (let i = 0; i <= 40; i++) {
    const t = -1 + 2 * i / 40, w = wid(t), g = gun(t), k = Math.min(keel(t), g - 0.3), r = [];
    for (let j = 0; j <= 12; j++) { const a = Math.PI * j / 12; r.push([Math.cos(a) * w, g - Math.sin(a) * (g - k), t * L / 2]); }
    rings.push(r);
  }
  put('cedar', loft(rings));
  // the wale along each side just under the gunwale
  for (const s of [-1, 1]) put('cedar', loft([-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9].map((t) => ring([s * (wid(t) + 0.03), gun(t) - 0.22, t * L / 2], X, Y, 0.06, 0.07, 6))));
  // the papyriform posts: the hull's ends drawn up into tapering columns, the stern's curling inboard,
  // each ending in an umbel flaring like the papyrus flower
  const post = (pts, r0, r1) => {
    put('cedar', loft(pts.map((p, i) => {
      const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)], d = [q[1] - o[1], q[2] - o[2]], l = Math.hypot(...d) || 1;
      return ring(p, X, [0, -d[1] / l, d[0] / l], r0 + (r1 - r0) * i / (pts.length - 1), r0 + (r1 - r0) * i / (pts.length - 1), 10);
    })));
    const e = pts[pts.length - 1], f = pts[pts.length - 2], d = [e[1] - f[1], e[2] - f[2]], l = Math.hypot(...d), v = [0, d[0] / l, d[1] / l], n = [0, -d[1] / l, d[0] / l];
    put('cedar', loft([[0, r1 * 0.9], [0.18, r1 * 1.1], [0.42, r1 * 2.0], [0.62, r1 * 2.6], [0.66, r1 * 2.2]].map(([o, rr]) => ring([e[0], e[1] + v[1] * o, e[2] + v[2] * o], X, n, rr, rr, 14, (t) => 1 + 0.08 * Math.cos(t * 16)))));
  };
  const zs = L / 2, zb = -L / 2;
  post([[0, gun(1) - 0.3, zs - 0.4], [0, gun(1) + 0.4, zs + 0.15], [0, gun(1) + 1.4, zs + 0.55], [0, gun(1) + 2.4, zs + 0.6], [0, gun(1) + 3.2, zs + 0.3], [0, gun(1) + 3.7, zs - 0.25]], 0.34, 0.16);
  post([[0, gun(-1) - 0.3, zb + 0.4], [0, gun(-1) + 0.4, zb - 0.15], [0, gun(-1) + 1.3, zb - 0.55], [0, gun(-1) + 2.2, zb - 0.85]], 0.3, 0.15);
  // the stringers along the deck to which the oars were lashed
  for (const s of [-1, 1]) put('timber', loft([-0.5, -0.25, 0, 0.25, 0.5].map((t) => ring([s * 1.15, gun(t) + 0.06, t * L / 2], X, Y, 0.08, 0.07, 6))));
  // the deckhouse aft of midships: the main cabin, its anteroom before it, a roof with eaves
  const dy = 0.95;
  put('cedar', box(-1.6, dy, 3.2, 1.6, dy + 2.25, 12.2));
  put('cedar', box(-1.8, dy + 2.25, 2.9, 1.8, dy + 2.45, 12.5));
  put('cedar', box(-1.25, dy, 0.6, 1.25, dy + 1.9, 3.2));
  put('cedar', box(-1.4, dy + 1.9, 0.4, 1.4, dy + 2.05, 3.2));
  for (const z of [4.6, 6.4, 8.2, 10.0]) for (const s of [-1, 1]) put('timber', box(s * 1.6 - 0.04, dy + 0.1, z - 0.06, s * 1.6 + 0.04, dy + 2.2, z + 0.06));   // the framing of the panels
  // the awning frame forward of the deckhouse: posts with palm capitals, rails, a linen awning on the aft half
  for (const z of [-3.6, -1.2, 0.6]) for (const s of [-1, 1]) {
    put('timber', lathe([[0.07, 0], [0.06, 2.3], [0.1, 2.4], [0.05, 2.5]], 8, null, s * 1.5, dy, z));
  }
  for (const s of [-1, 1]) put('timber', box(s * 1.5 - 0.05, dy + 2.5, -3.7, s * 1.5 + 0.05, dy + 2.6, 0.6));
  for (const z of [-3.6, -1.2, 0.6]) put('timber', box(-1.55, dy + 2.5, z - 0.05, 1.55, dy + 2.6, z + 0.05));
  put('linen', box(-1.6, dy + 2.6, -1.2, 1.6, dy + 2.64, 0.6));
  // the canopy in the bow: four slender posts and a light roof
  const bz = -L / 2 + 6.5;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('timber', lathe([[0.06, 0], [0.05, 1.9], [0.09, 2.0], [0.04, 2.1]], 8, null, sx * 0.85, gun(-0.7) - 0.05, bz + sz * 0.9));
  put('cedar', box(-1.0, gun(-0.7) + 2.05, bz - 1.05, 1.0, gun(-0.7) + 2.18, bz + 1.05));
  // ten oars lashed amidships ahead of the deckhouse, their looms on the stringers, their blades in the water
  for (const z of [-10.5, -8.2, -5.9, -3.6, -1.3]) for (const s of [-1, 1]) {
    const a = [s * 1.15, gun(z * 2 / L) + 0.15, z], b = [s * 7.2, -0.25, z + 1.6], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l, (b[2] - a[2]) / l], u2 = [d[2], 0, -d[0]].map((q) => q / Math.hypot(d[2], d[0]));
    put('timber', loft([0, 0.6, 1].map((f) => ring([a[0] + d[0] * l * f * 0.8, a[1] + d[1] * l * f * 0.8, a[2] + d[2] * l * f * 0.8], u2, [d[1] * u2[2] - d[2] * u2[1], d[2] * u2[0] - d[0] * u2[2], d[0] * u2[1] - d[1] * u2[0]], 0.07 - f * 0.02, 0.07 - f * 0.02, 6))));
    const bc = [a[0] + d[0] * l * 0.9, a[1] + d[1] * l * 0.9, a[2] + d[2] * l * 0.9];
    put('timber', loft([-0.7, 0, 0.7].map((o, i) => ring([bc[0] + d[0] * o, bc[1] + d[1] * o, bc[2] + d[2] * o], u2, [d[1] * u2[2] - d[2] * u2[1], d[2] * u2[0] - d[0] * u2[2], d[0] * u2[1] - d[1] * u2[0]], i === 1 ? 0.2 : 0.1, 0.025, 8))));
  }
  // the two steering oars at the stern, each against an upright post
  for (const s of [-1, 1]) {
    const pz = L / 2 - 4.5, gy = gun(pz * 2 / L);
    put('timber', box(s * 1.7 - 0.08, gy - 0.1, pz - 0.08, s * 1.7 + 0.08, gy + 1.8, pz + 0.08));
    const a = [s * 1.75, gy + 1.7, pz - 0.6], b = [s * 2.6, -0.9, pz + 4.6], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l, (b[2] - a[2]) / l];
    const u2 = [1, 0, 0], v2 = [0, -d[2], d[1]].map((q) => q / Math.hypot(d[2], d[1]));
    put('timber', loft([0, 0.75].map((f) => ring([a[0] + d[0] * l * f, a[1] + d[1] * l * f, a[2] + d[2] * l * f], u2, v2, 0.09, 0.09, 8))));
    put('timber', loft([0.72, 0.86, 1].map((f, i) => ring([a[0] + d[0] * l * f, a[1] + d[1] * l * f, a[2] + d[2] * l * f], u2, v2, 0.04, i === 1 ? 0.35 : 0.18, 8))));
  }
  for (const [mat, list] of Object.entries(parts)) for (const g of list) {
    const p = g.attributes.position, nn = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const w = W([p.getX(i), p.getY(i), p.getZ(i)]); p.setXYZ(i, w[0], w[1], w[2]);
      const nx = nn.getX(i), nz = nn.getZ(i), f = -nz; nn.setXYZ(i, ca * f - sa * nx, nn.getY(i), sa * f + ca * nx);
    }
    bag.add(mat, g);
  }
}
const X = [1, 0, 0], Y = [0, 1, 0];

registerStyle('oldkingdom', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ok_pyramid: okPyramid, mastaba, ok_temple: okTemple, causeway, mud_house: mudHouse, gallery_hall: galleryHall, crow_wall: crowWall,
    boat_pit: boatPit, royal_ship: royalShip, bakery,
  },
  objects: {},
});
void flipTris;
