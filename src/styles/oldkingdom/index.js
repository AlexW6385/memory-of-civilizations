// Old Kingdom Egyptian architecture (Giza, 4th dynasty, c. 2560 BC; docs/settlements/giza.md §4–§5):
// the true pyramid cased in polished white limestone; temples of granite pillars and basalt
// pavements behind plain limestone walls; the covered causeway; mastaba tombs with battered walls
// in streets; the workers' town of mudbrick — galleries (long halls), bakeries, houses with flat
// roofs and courtyards — and the great stone Wall of the Crow with its tunnel gate.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris, flipTris } from '../ming/index.js';

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
 * ok_pyramid: a true pyramid { c, a (half the base), h, casing, apex }: the faces of polished casing
 * stone down to a band of granite at the foot (Khufu's lowest courses), the apex a capstone; the
 * slope walkable (one can climb it, slowly, as the faces are smooth only to the eye).
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

registerStyle('oldkingdom', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ok_pyramid: okPyramid, mastaba, ok_temple: okTemple, causeway, mud_house: mudHouse, gallery_hall: galleryHall, crow_wall: crowWall,
  },
  objects: {},
});
void flipTris;
