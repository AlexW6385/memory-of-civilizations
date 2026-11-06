// The south slope of the Acropolis and the summit's smaller sanctuaries, about 410 BC (docs/settlements/athens.md §4e,
// §4f): the theatre of Dionysos — its orchestra terrace with the altar in the middle and the theatron above, rows of
// wooden benches (ikria) laid on an earth bank in straight facets, the stone front row for the officials, the stairs up
// the joints of the facets, the retaining walls at the ends and the back; the Odeion of Pericles' forest of columns
// rising to its pyramidal roof; the wooden statues of Artemis Brauronia and of Dionysos with the clothes dedicated to
// them; the colossal bronze Trojan horse of Strongylion on its inscribed base; the Lemnian Athena; the bronze store's
// racks of shields, helmets and spears; the inscribed stelae; the stretch of the Mycenaean wall. Registered into `greek`.

import { Matrix4 } from '../../core/three.js';
import { STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, rod, frustum, fromTriangles, orientOutward } from '../../core/geom.js';
import { human, horse, blob, limb, placed } from './sculpture.js';
import { merge } from './columns.js';
import './index.js';

const RAD = Math.PI / 180;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A convex polygon in plan ([x, z] points, either winding) raised from y0 to y1: a closed prism. */
export function prism(pts, y0, y1) {
  const t = [], n = pts.length, B = pts.map(([x, z]) => [x, y0, z]), T = pts.map(([x, z]) => [x, y1, z]);
  for (let i = 1; i + 1 < n; i++) t.push(...B[0], ...B[i + 1], ...B[i], ...T[0], ...T[i], ...T[i + 1]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...B[i], ...B[j], ...T[j], ...B[i], ...T[j], ...T[i]); }
  return fromTriangles(orientOutward(t));
}

/**
 * theatron: { c, y (the orchestra), d0 (the first row's distance), rows, tread, rise, facets (their angles from the
 * axis, degrees: 0 faces the orchestra from the north), end (the end lines' angle), base, earth, seat, riser, wall } —
 * rows of equal polygonal distance from the orchestra's centre, each an earth step with its wooden bench (the seat plank
 * over the front of the step, a board down its face); the front row of stone with backs on the middle facet (the
 * proedria); half-steps up the joints between the facets; the retaining walls on the end lines, stepped with the rows;
 * the walk behind the top row and its wall against the hill.
 */
function theatron(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, N = el.rows, t = el.tread, rise = el.rise, d0 = el.d0, base = el.base ?? -0.5, E = el.end;
  const F = el.facets, earth = el.earth ?? 'ground', seat = el.seat ?? 'timber', riser = el.riser ?? 'planks_grey', wall = el.wall ?? 'limestone_yellow';
  // a facet's local frame: P(s, D) — D the distance out from the centre, s along the facet
  const frame = (phi) => { const n = [Math.sin(phi * RAD), -Math.cos(phi * RAD)], u = [Math.cos(phi * RAD), Math.sin(phi * RAD)]; return (s, D) => [cx + n[0] * D + u[0] * s, cz + n[1] * D + u[1] * s]; };
  // the angular range of each facet: between the joints (half-way between facets) and the end lines
  const ranges = F.map((phi, i) => [i === 0 ? -E : (F[i - 1] + phi) / 2, i === F.length - 1 ? E : (phi + F[i + 1]) / 2]);
  const joints = F.slice(1).map((phi, i) => (F[i] + phi) / 2), AISLE = 1.1;
  const yRow = (k) => y + (k + 1) * rise, dRow = (k) => d0 + k * t, dN = d0 + N * t, yTop = yRow(N - 1);
  // the region of facet i between D = a and b, its s-limits pulled in from the joints by `pull` (the aisles)
  const quadOf = (i, a, b, pull = 0) => {
    const phi = F[i], P = frame(phi), [b0, b1] = ranges[i];
    const p0 = i > 0 ? pull : 0, p1 = i < F.length - 1 ? pull : 0;
    const s0 = (D) => D * Math.tan((b0 - phi) * RAD) + p0, s1 = (D) => D * Math.tan((b1 - phi) * RAD) - p1;
    return [P(s0(a), a), P(s1(a), a), P(s1(b), b), P(s0(b), b)];
  };
  for (let k = 0; k < N; k++) {
    const a = dRow(k), b = a + t, yk = yRow(k), yp = k ? yRow(k - 1) : y;
    for (let i = 0; i < F.length; i++) {
      bag.add(earth, prism(quadOf(i, a, b), base, yk));
      const stone = k === 0 && F[i] === 0;
      if (stone) {
        // the proedria: seats of stone with low backs for the priests and the magistrates
        bag.add('limestone', prism(quadOf(i, a - 0.05, a + 0.6), yp - 0.05, yk + 0.04));
        bag.add('limestone', prism(quadOf(i, a + 0.58, a + 0.72), yk, yk + 0.55));
        continue;
      }
      // the bench of planks over the front of the step and the board down its face; the aisles left clear
      bag.add(seat, prism(quadOf(i, a - 0.07, a + 0.42, AISLE / 2), yk, yk + 0.055));
      bag.add(riser, prism(quadOf(i, a - 0.03, a - 0.002, AISLE / 2), yp, yk));
    }
    // the half-steps up the joints of the facets
    if (k > 0) for (const j of joints) {
      const dir = [Math.sin(j * RAD), -Math.cos(j * RAD)], c = Math.cos((F[1] - F[0]) / 2 * RAD), r0 = (a - t / 2) / c, r1 = a / c;
      bag.add(riser, orientedBox([cx + dir[0] * r0, cz + dir[1] * r0], [cx + dir[0] * r1, cz + dir[1] * r1], AISLE - 0.1, yp, yp + rise / 2));
    }
  }
  // the walk behind the top row and the wall that holds the hill back
  for (let i = 0; i < F.length; i++) {
    bag.add(earth, prism(quadOf(i, dN, dN + 2.6), base, yTop));
    bag.add(wall, prism(quadOf(i, dN + 2.6, dN + 3.4), base, yTop + 1.1));
  }
  // the retaining walls along the end lines, stepped with the rows, from the orchestra to the walk
  for (const s of [-1, 1]) {
    const al = s * E, dir = [Math.sin(al * RAD), -Math.cos(al * RAD)], off = [-dir[1] * s, dir[0] * s], c = Math.cos((E - Math.abs(F[s < 0 ? 0 : F.length - 1])) * RAD);
    const seg = (D0, D1, y1) => {
      const r0 = D0 / c, r1 = D1 / c, p = (r) => [cx + dir[0] * r + off[0] * 0.55, cz + dir[1] * r + off[1] * 0.55];
      bag.add(wall, orientedBox(p(r0), p(r1), 1.1, base, y1, 0.02)); col.segment(p(r0), p(r1), 1.1, base, y1);
    };
    for (let k = 0; k < N; k++) seg(dRow(k), dRow(k) + t, yRow(k) + 0.45);
    seg(dN, dN + 3.4, yTop + 1.1);
    seg(d0 - 1.6, d0, y + 0.45);
  }
}

/**
 * orchestra: { c, y, r, rim } — the round dancing floor of beaten earth on its terrace, the polygonal terrace wall on the
 * downhill side, a kerb of stone round the dancing circle, the altar (thymele) in the middle.
 */
function orchestra(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, r = el.r, R = el.rim ?? r + 1.45;
  bag.add('ground', lathe([[R, -0.6], [R, y], [0.001, y]], 64, null, cx, 0, cz));
  col.floor([cx - R * 0.7, cz - R * 0.7, cx + R * 0.7, cz + R * 0.7], y);
  // the kerb of the dancing circle, a hand's breadth proud of the floor
  bag.add('limestone', lathe([[r + 0.2, y - 0.02], [r + 0.2, y + 0.07], [r - 0.2, y + 0.07], [r - 0.2, y - 0.02]], 64, null, cx, 0, cz));
  // the terrace wall of polygonal stones on the south half, a little above the floor
  for (let k = 0; k < 32; k++) {
    const a0 = (k / 32) * Math.PI, a1 = ((k + 1) / 32) * Math.PI, rm = R + 0.45;
    const A = [cx + Math.cos(a0) * rm, cz + Math.sin(a0) * rm], B = [cx + Math.cos(a1) * rm, cz + Math.sin(a1) * rm];
    bag.add('rubble', orientedBox(A, B, 0.9, -0.6, y + 0.3, 0.12)); col.segment(A, B, 0.9, -0.6, y + 0.3);
  }
  // the thymele: a square altar with its moulded crown and the ash on it
  const T = (x0, y0, x1, y1, m = 'limestone') => bag.add(m, box(cx + x0, y0, cz + x0, cx + x1, y1, cz + x1));
  T(-0.75, y + 0.07, 0.75, y + 0.22); T(-0.55, y + 0.22, 0.55, y + 0.95); T(-0.65, y + 0.95, 0.65, y + 1.07); T(-0.45, y + 1.07, 0.45, y + 1.11, 'rubble');
  col.rect([cx - 0.75, cz - 0.75, cx + 0.75, cz + 0.75], y, y + 1.1);
}

/**
 * skene: { rect (the hall, its front on the south side of the orchestra: z0), y, h (two storeys), doors } — the stage
 * building of wood: the front wall of boards on posts with three doors, the middle one the widest, painted panels
 * between them (the skenographia), the upper storey's openings, the flat roof where the gods appear, its low railing.
 */
function skene(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 7.2, f = 3.6, L = x1 - x0, xm = (x0 + x1) / 2, th = 0.3;
  const W = (r, y0, y1, m = 'timber') => { bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  // the front wall with its three doors
  const doors = [[xm, 2.4, 3.4], [xm - L * 0.3, 1.6, 2.9], [xm + L * 0.3, 1.6, 2.9]].sort((p, q) => p[0] - q[0]);
  let s = x0;
  for (const [dx, w, dh] of doors) {
    W([s, z0, dx - w / 2, z0 + th], y, y + h);
    W([dx - w / 2, z0, dx + w / 2, z0 + th], y + dh, y + h);
    // the door's frame and its leaves standing ajar
    bag.add('wood_dark', box(dx - w / 2 - 0.18, y, z0 - 0.08, dx - w / 2, y + dh + 0.18, z0));
    bag.add('wood_dark', box(dx + w / 2, y, z0 - 0.08, dx + w / 2 + 0.18, y + dh + 0.18, z0));
    bag.add('wood_dark', box(dx - w / 2 - 0.18, y + dh, z0 - 0.08, dx + w / 2 + 0.18, y + dh + 0.18, z0));
    for (const sg of [-1, 1]) { const hx = dx + sg * w / 2; bag.add('timber', orientedBox([hx, z0 + th], [hx - sg * Math.cos(1.1) * w / 2, z0 + th + Math.sin(1.1) * w / 2], 0.06, y, y + dh - 0.02)); }
    s = dx + w / 2;
  }
  W([s, z0, x1, z0 + th], y, y + h);
  W([x0, z1 - th, x1, z1], y, y + h); W([x0, z0, x0 + th, z1], y, y + h); W([x1 - th, z0, x1, z1], y, y + h);
  // the posts standing proud of the front, the beam across the storey
  for (let x = x0 + 0.15; x <= x1 - 0.1; x += L / 10) bag.add('wood_dark', box(x - 0.12, y, z0 - 0.14, x + 0.12, y + h, z0));
  bag.add('wood_dark', box(x0 - 0.05, y + f - 0.15, z0 - 0.2, x1 + 0.05, y + f + 0.15, z0));
  // the painted panels between the doors and the posts: columns and a pediment drawn in colour on light boards
  const rand = rng(el.seed ?? 9);
  for (let x = x0 + 0.15; x < x1 - L / 10; x += L / 10) {
    const a = x + 0.2, b = x + L / 10 - 0.2;
    if (doors.some(([dx, w]) => a < dx + w / 2 + 0.2 && b > dx - w / 2 - 0.2)) continue;
    bag.add('plaster_white', box(a, y + 0.5, z0 - 0.04, b, y + f - 0.5, z0));
    const n = 2 + Math.floor(rand() * 2);
    for (let i = 0; i < n; i++) { const u = a + (b - a) * (i + 0.5) / n; bag.add(i % 2 ? 'paint_ochre' : 'wall_red', box(u - 0.09, y + 0.6, z0 - 0.055, u + 0.09, y + f - 0.9, z0 - 0.04)); }
    bag.add('egyptian_blue', box(a + 0.05, y + f - 0.85, z0 - 0.055, b - 0.05, y + f - 0.62, z0 - 0.04));
  }
  // the upper storey's three openings over the doors
  for (const [dx] of doors) bag.add('wood_dark', box(dx - 0.9, y + f + 0.9, z0 - 0.06, dx + 0.9, y + f + 2.4, z0 - 0.01));
  // the roof: boards on joists, the low railing round the edge
  bag.add('planks_grey', box(x0 - 0.1, y + h, z0 - 0.15, x1 + 0.1, y + h + 0.18, z1 + 0.05)); col.floor([x0, z0, x1, z1], y + h + 0.18);
  for (const r of [[x0, z0 - 0.15, x1, z0 - 0.05], [x0, z1 - 0.05, x1, z1 + 0.05], [x0 - 0.1, z0, x0, z1], [x1, z0, x1 + 0.1, z1]]) bag.add('timber', box(r[0], y + h + 0.18, r[1], r[2], y + h + 1.0, r[3]));
}

/**
 * odeion_roof: { rect, y (the wall-top), rise, cols: { x: [...], z: [...] }, floor } — the roof of the Odeion: a hipped
 * roof of tiles rising from all four walls to a short ridge (it was likened to Xerxes' tent), its timber underside,
 * and the rafters and purlins running from column-head to column-head; the columns themselves from the plan.
 */
function odeionRoof(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2, rise = el.rise, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ov = 0.9;
  const ridge = hz - hx;
  const H = (x, z) => y + rise * (1 - Math.max(Math.abs(x - cx), Math.abs(z - cz) - ridge) / hx);
  // the tiles: a hipped solid over the eaves, its pitch kept to the walls; its underside of boards
  const pitch = rise / hx;
  bag.add('roof_tile', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + ov], y - ov * pitch, y + rise, hx + ov, hx + ov, hx + ov, hx + ov, { noBottom: true }));
  const under = frustum([x0 - ov + 0.05, z0 - ov + 0.05, x1 + ov - 0.05, z1 + ov - 0.05], y - ov * pitch - 0.32, y + rise - 0.32, hx + ov - 0.05, hx + ov - 0.05, hx + ov - 0.05, hx + ov - 0.05, { noBottom: true });
  flip(under); bag.add('timber', under);
  // the eaves' fascia over the walls; the cover-tile ridges on the hips
  const ye = y - ov * pitch, wi = ov + 1.4;
  for (const r of [[x0 - ov, z0 - ov, x1 + ov, z0 - ov + wi], [x0 - ov, z1 + ov - wi, x1 + ov, z1 + ov], [x0 - ov, z0 - ov + wi, x0 - ov + wi, z1 + ov - wi], [x1 + ov - wi, z0 - ov + wi, x1 + ov, z1 + ov - wi]]) bag.add('timber', box(r[0], ye - 0.4, r[1], r[2], ye - 0.01, r[3]));
  for (const [ax, az] of [[x0 - ov, z0 - ov], [x1 + ov, z0 - ov], [x1 + ov, z1 + ov], [x0 - ov, z1 + ov]]) {
    const tx = cx, tz = cz + Math.sign(az - cz) * ridge;
    bag.add('terracotta', rod([ax, y - ov * pitch + 0.02, az], [tx, y + rise + 0.02, tz], 0.16, 5));
  }
  bag.add('terracotta', rod([cx, y + rise + 0.02, cz - ridge], [cx, y + rise + 0.02, cz + ridge], 0.18, 6));
  // the timbers under the roof: purlins from column-head to column-head along both ways, rafters out to the walls
  const X = el.cols.x, Z = el.cols.z, top = (x, z) => H(x, z) - 0.55;
  for (const x of X) for (let j = 0; j + 1 < Z.length; j++) bag.add('timber', rod([x, top(x, Z[j]), Z[j]], [x, top(x, Z[j + 1]), Z[j + 1]], 0.2, 5));
  for (const z of Z) for (let i = 0; i + 1 < X.length; i++) bag.add('timber', rod([X[i], top(X[i], z), z], [X[i + 1], top(X[i + 1], z), z], 0.2, 5));
  for (const x of X) { bag.add('timber', rod([x, top(x, Z[0]), Z[0]], [x, y - 0.3, z0 + 0.7], 0.18, 5)); bag.add('timber', rod([x, top(x, Z[Z.length - 1]), Z[Z.length - 1]], [x, y - 0.3, z1 - 0.7], 0.18, 5)); }
  for (const z of Z) { bag.add('timber', rod([X[0], top(X[0], z), z], [x0 + 0.7, y - 0.3, z], 0.18, 5)); bag.add('timber', rod([X[X.length - 1], top(X[X.length - 1], z), z], [x1 - 0.7, y - 0.3, z], 0.18, 5)); }
  // a square cushion of wood on every column's head under the crossing timbers
  for (const x of X) for (const z of Z) { const yy = top(x, z); bag.add('wood_dark', box(x - 0.45, yy - 0.5, z - 0.45, x + 0.45, yy - 0.18, z + 0.45)); }
}
/** Turn a geometry's faces inside out (seen from within). */
function flip(g) {
  const P = g.attributes.position.array, Nn = g.attributes.normal.array;
  for (let i = 0; i < P.length; i += 9) for (let k = 0; k < 3; k++) { const a = P[i + 3 + k]; P[i + 3 + k] = P[i + 6 + k]; P[i + 6 + k] = a; const b = Nn[i + 3 + k]; Nn[i + 3 + k] = Nn[i + 6 + k]; Nn[i + 6 + k] = b; }
  for (let i = 0; i < Nn.length; i++) Nn[i] = -Nn[i];
  return g;
}

/**
 * xoanon: { at, y, yaw, h, god ('artemis' | 'dionysos'), gifts } — an old wooden image of the god on a stepped base, stiff
 * and frontal; Artemis Brauronia hung with the clothes the women dedicated to her, Dionysos bearded with his kantharos
 * and ivy; `gifts`: garments laid over a rail beside the statue.
 */
function xoanon(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.8, yaw = el.yaw ?? 0, m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  const P = (g, mat) => { g.applyMatrix4(m); bag.add(mat, g); };
  P(merge([box(-0.6, 0, -0.5, 0.6, 0.3, 0.5), box(-0.48, 0.3, -0.4, 0.48, 0.55, 0.4)]), 'limestone');
  const f = human({ pose: 'stand', drape: el.god === 'dionysos' ? 'mantle' : 'peplos', h, n: 7, arms: { l: [[-0.13, 0.64, 0.06], [-0.12, 0.52, 0.16]], r: [[0.13, 0.64, 0.06], [0.12, 0.54, 0.16]] } });
  const g = placed(f, 0, 0.55, 0, 0);
  P(g.stone, 'cedar');
  if (el.god === 'dionysos') {
    P(merge([blob([0, 0.55 + h * 0.86, 0.06], h * 0.045, [1, 1.3, 0.8], 6), lathe([[0.001, 0], [0.05, 0.01], [0.07, 0.08], [0.05, 0.1], [0.001, 0.09]], 8, null, 0.12 * h, 0.55 + 0.54 * h, 0.16 * h)]), 'cedar');
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; P(blob([Math.cos(a) * h * 0.06, 0.55 + h * 0.955, Math.sin(a) * h * 0.06], h * 0.022, [1.2, 0.5, 1], 5), 'lotus_leaf'); }
  } else {
    // the clothes the women gave her, laid about her shoulders and hanging down her front
    P(merge([limb([-0.12 * h, 0.55 + 0.8 * h, 0.0], [0.12 * h, 0.55 + 0.8 * h, 0.0], 0.06 * h, 0.06 * h, 7), box(-0.12 * h, 0.55 + 0.35 * h, 0.03 * h, 0.12 * h, 0.55 + 0.79 * h, 0.11 * h)]), 'cloth_red');
    P(box(-0.1 * h, 0.55 + 0.28 * h, 0.06 * h, 0.1 * h, 0.55 + 0.6 * h, 0.122 * h), 'cloth_white');
  }
  col.rect([x - 0.6, z - 0.6, x + 0.6, z + 0.6], y, y + 0.55 + h);
  // the garments on their rail
  if (el.gifts) {
    const cl = ['cloth_white', 'cloth_ochre', 'cloth_indigo', 'linen', 'cloth_red', 'cloth_green'];
    P(merge([rod([-1.6, 1.7, -0.7], [1.6, 1.7, -0.7], 0.035, 5), box(-1.65, 0, -0.75, -1.55, 1.75, -0.65), box(1.55, 0, -0.75, 1.65, 1.75, -0.65)]), 'timber');
    for (let i = 0; i < el.gifts; i++) { const u = -1.35 + i * 2.7 / Math.max(1, el.gifts - 1); P(box(u - 0.2, 0.75 + (i % 3) * 0.12, -0.74, u + 0.2, 1.72, -0.66 + (i % 2) * 0.012), cl[i % cl.length]); }
  }
}

/**
 * trojan_horse: { at, y, yaw, h } — the bronze wooden horse of Strongylion: colossal, standing four-square on a long base of
 * marble whose top course bears the dedication; the heroes look out of the hatch in its flank.
 */
function trojanHorse(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 2.6, yaw = el.yaw ?? 0, k = h / 1.5, m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  const P = (g, mat) => { g.applyMatrix4(m); bag.add(mat, g); };
  const L = 1.95 * k, W = 0.85 * k;
  // the base: a footing, the die and its crowning course with the inscription cut along the front
  P(merge([box(-L / 2 - 0.25, 0, -W / 2 - 0.25, L / 2 + 0.25, 0.3, W / 2 + 0.25), box(-L / 2, 0.3, -W / 2, L / 2, 1.0, W / 2), box(-L / 2 - 0.1, 1.0, -W / 2 - 0.1, L / 2 + 0.1, 1.18, W / 2 + 0.1)]), 'marble');
  const cut = [];
  for (let i = 0; i < 30; i++) { const u = -L / 2 + 0.3 + i * (L - 0.6) / 29; cut.push(box(u - 0.03, 0.8, W / 2 - 0.004, u + 0.03, 0.9, W / 2 + 0.003)); if (i % 4 === 1) cut.push(box(u - 0.03, 0.65, W / 2 - 0.004, u + 0.03, 0.73, W / 2 + 0.003)); }
  P(merge(cut), 'marble_dark');
  // the horse in bronze, its plates and rivets suggested by bands round the barrel; the hatch with the heroes' heads
  const hs = horse({ pose: 'stand', h, n: 8 });
  const g = placed(hs, 0, 1.18, 0, 0);
  P(g.stone, 'bronze');
  const bands = [];
  for (const u of [-0.3, 0, 0.3]) { const rr = 0.26 * k * Math.sqrt(1 - (u / 0.525) ** 2) + 0.01; bands.push(lathe([[rr, -0.03], [rr, 0.03]], 16).applyMatrix4(new Matrix4().makeRotationZ(Math.PI / 2).premultiply(new Matrix4().makeScale(1, 1, 0.24 / 0.26)).setPosition(u * k, 1.18 + 1.12 * k, 0))); }
  P(merge(bands), 'gilt_bronze');
  const hx = 0.05 * k, hy = 1.18 + 1.16 * k, hz = 0.23 * k;
  P(box(hx - 0.26 * k, hy - 0.1 * k, 0.15 * k, hx + 0.26 * k, hy + 0.1 * k, hz + 0.012), 'wood_dark');
  for (const [u, s] of [[-0.14, 1], [0.12, 0.95]]) P(merge([blob([hx + u * k, hy + 0.02 * k, hz + 0.04 * k], 0.07 * k, [0.85, 1.05, 0.95], 7), blob([hx + u * k, hy + 0.07 * k, hz + 0.02 * k], 0.072 * k * s, [0.95, 0.8, 1], 7)]), 'bronze');
  col.rect([x - Math.abs(Math.cos(yaw)) * L / 2 - Math.abs(Math.sin(yaw)) * W / 2 - 0.25, z - Math.abs(Math.sin(yaw)) * L / 2 - Math.abs(Math.cos(yaw)) * W / 2 - 0.25, x + Math.abs(Math.cos(yaw)) * L / 2 + Math.abs(Math.sin(yaw)) * W / 2 + 0.25, z + Math.abs(Math.sin(yaw)) * L / 2 + Math.abs(Math.cos(yaw)) * W / 2 + 0.25], y, y + 1.18 + 1.8 * k);
}

/**
 * votive: { at, y, yaw, kind ('lemnian' | 'stele' | 'tripod'), h } — offerings standing on the summit: the Lemnian Athena
 * of Pheidias in bronze, bareheaded, her helmet held out in her right hand and the spear upright in her left; an inscribed
 * stele of marble on its stepped base; a bronze tripod on a column.
 */
function votive(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  const P = (g, mat) => { g.applyMatrix4(m); bag.add(mat, g); };
  if (el.kind === 'lemnian') {
    const h = el.h ?? 2.1;
    P(merge([box(-0.75, 0, -0.75, 0.75, 0.25, 0.75), box(-0.6, 0.25, -0.6, 0.6, 1.35, 0.6), box(-0.68, 1.35, -0.68, 0.68, 1.47, 0.68)]), 'marble');
    const f = human({ pose: 'ease', drape: 'peplos', h, n: 8, spear: 'l', spearDir: [0, 1, 0], arms: { r: [[0.16, 0.64, 0.08], [0.2, 0.62, 0.3]], l: [[-0.15, 0.63, 0.02], [-0.17, 0.62, 0.06]] } });
    const g = placed(f, 0, 1.47, 0, 0);
    P(g.stone, 'bronze'); if (g.metal) P(g.metal, 'bronze');
    // the Corinthian helmet in her hand, its crest; the aegis slung across her breast
    P(merge([blob([0.2 * h, 1.47 + 0.6 * h, 0.33 * h], 0.065 * h, [1, 0.95, 1.1], 8), limb([0.2 * h, 1.47 + 0.66 * h, 0.27 * h], [0.2 * h, 1.47 + 0.67 * h, 0.4 * h], 0.012 * h, 0.01 * h, 4)]), 'bronze');
    P(limb([-0.11 * h, 0.83 * h + 1.47, 0.045 * h], [0.09 * h, 0.62 * h + 1.47, 0.07 * h], 0.03 * h, 0.03 * h, 6), 'gilt_bronze');
    col.rect([x - 0.75, z - 0.75, x + 0.75, z + 0.75], y, y + 1.47 + h);
  } else if (el.kind === 'tripod') {
    P(lathe([[0.4, 0], [0.4, 0.2], [0.28, 0.25], [0.28, 1.6], [0.36, 1.68], [0.36, 1.78], [0.001, 1.78]], 14), 'marble');
    const tp = [];
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; tp.push(rod([Math.cos(a) * 0.3, 1.78, Math.sin(a) * 0.3], [Math.cos(a) * 0.34, 2.9, Math.sin(a) * 0.34], 0.03, 5)); tp.push(lathe([[0.04, 0], [0.04, 0.18], [0.001, 0.18]], 6, null, Math.cos(a) * 0.36, 2.92, Math.sin(a) * 0.36)); }
    tp.push(lathe([[0.001, 2.55], [0.25, 2.6], [0.38, 2.78], [0.4, 2.92], [0.37, 2.94], [0.001, 2.9]], 16));
    P(merge(tp), 'bronze');
    col.circle(x, z, 0.42, y, y + 2.9);
  } else {
    // the stele: a tall slab tapering a little, the decree cut in lines under a moulded crown, set in a stepped base
    const h = el.h ?? 2.2, w = el.w ?? 0.62, d = 0.16;
    P(merge([box(-w / 2 - 0.25, 0, -d / 2 - 0.2, w / 2 + 0.25, 0.32, d / 2 + 0.2)]), 'limestone');
    P(merge([frustum([-w / 2, -d / 2, w / 2, d / 2], 0.32, 0.32 + h, 0.03, 0.03, 0.005, 0.005), box(-w / 2 + 0.01, 0.32 + h, -d / 2 - 0.02, w / 2 - 0.01, 0.42 + h, d / 2 + 0.02)]), 'marble_smooth');
    const cut = [];
    for (let i = 0; i < Math.floor(h / 0.055) - 6; i++) { const v = 0.32 + h - 0.15 - i * 0.055, ww = w / 2 - 0.07; cut.push(box(-ww, v - 0.022, d / 2 - 0.01, i % 7 === 6 ? -ww * 0.2 : ww, v, d / 2 + 0.003)); }
    P(merge(cut), 'marble_dark');
    col.rect([x - w / 2 - 0.25, z - w / 2 - 0.25, x + w / 2 + 0.25, z + w / 2 + 0.25], y, y + 0.42 + h);
  }
}

/**
 * armoury: { rect, y, seed } — the bronze store's racks along a wall: shelves on posts holding helmets and bowls, shields
 * hung above, spears standing in a rack, a chest; rect is the strip along the wall (its long side the wall's).
 */
function armoury(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 7), alongX = x1 - x0 > z1 - z0;
  const L = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0;
  const P = (u, v) => (alongX ? [x0 + u, z0 + v] : [x0 + v, z0 + u]);
  const R = (u0, v0, u1, v1, y0, y1, mat) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); };
  // the rack: posts and three shelves
  for (let u = 0.1; u <= L - 0.05; u += 2.0) R(u - 0.06, 0, u + 0.06, D, y, y + 2.2, 'timber');
  for (const sy of [0.6, 1.25, 1.9]) R(0, 0.02, L, D - 0.02, y + sy, y + sy + 0.05, 'timber');
  col.rect(el.rect, y, y + 2.2);
  const parts = { bronze: [], wood_dark: [], iron: [] };
  for (let u = 0.45; u < L - 0.3; u += 0.55) for (const sy of [0.65, 1.3]) {
    const [px, pz] = P(u, D / 2), r = rand();
    if (r < 0.45) parts.bronze.push(merge([blob([px, y + sy + 0.13, pz], 0.12, [0.9, 1.1, 1.15], 7), box(px - 0.1, y + sy, pz - 0.02, px + 0.1, y + sy + 0.09, pz + 0.02)]));      // a helmet
    else if (r < 0.75) parts.bronze.push(lathe([[0.001, 0], [0.1, 0.01], [0.16, 0.08], [0.17, 0.11], [0.001, 0.1]], 10, null, px, y + sy + 0.05, pz));     // a bowl
    else if (r < 0.9) parts.bronze.push(lathe([[0.06, 0], [0.12, 0.08], [0.13, 0.22], [0.07, 0.32], [0.08, 0.36], [0.001, 0.36]], 10, null, px, y + sy + 0.05, pz));   // a hydria
  }
  // the shields on the wall above the rack, and the spears in their rack at the end
  for (let u = 0.8; u < L - 0.6; u += 1.15) {
    const [px, pz] = P(u, D + 0.02), g = lathe([[0.001, 0.07], [0.12, 0.068], [0.42, 0.04], [0.46, 0.012], [0.46, 0], [0.001, 0]], 16);
    g.applyMatrix4(new Matrix4().makeRotationX(alongX ? -Math.PI / 2 : 0).premultiply(new Matrix4().makeRotationZ(alongX ? 0 : Math.PI / 2)).setPosition(px, y + 2.85, pz));
    parts.bronze.push(g);
  }
  for (let i = 0; i < 9; i++) { const [px, pz] = P(L + 0.35 + (i % 3) * 0.12, 0.2 + Math.floor(i / 3) * 0.2); parts.wood_dark.push(rod([px, y, pz], [px + 0.02, y + 2.6, pz], 0.018, 4)); parts.iron.push(lathe([[0.025, 0], [0.03, 0.08], [0.001, 0.3]], 4, null, px + 0.02, y + 2.6, pz)); }
  for (const k in parts) if (parts[k].length) bag.add(k, merge(parts[k]));
}

/**
 * cyclopean: { a, b, th, y0, y1, seed } — a stretch of the Mycenaean wall: huge rough blocks laid in irregular courses,
 * the gaps chinked with small stones, its top ragged.
 */
function cyclopean(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, Lw = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / Lw, uz = (bz - az) / Lw, nx = -uz, nz = ux, th = el.th ?? 4, rand = rng(el.seed ?? 3);
  const y0 = el.y0 ?? 0, y1 = el.y1 ?? y0 + 3;
  const big = [], small = [];
  // the core and the blocks of both faces
  bag.add('rubble', orientedBox([ax, az], [bx, bz], th - 0.5, y0 - 0.5, y1 - 0.4));
  col.segment([ax, az], [bx, bz], th, y0 - 0.5, y1);
  let yy = y0 - 0.3;
  for (let row = 0; yy < y1 - 0.4; row++) {
    const ch = Math.min(0.9 + rand() * 0.7, y1 - yy);
    let s = -rand() * 0.8;
    while (s < Lw) {
      const w = 1.1 + rand() * 1.4, s0 = Math.max(0, s), s1 = Math.min(Lw, s + w);
      if (s1 - s0 > 0.3) for (const side of [-1, 1]) {
        const o = side * (th / 2 - 0.3 - rand() * 0.12), jag = (rand() - 0.5) * 0.25;
        const p = (q, oo) => [ax + ux * q + nx * oo, az + uz * q + nz * oo];
        const pts = [p(s0 + 0.06, o - 0.35), p(s1 - 0.06, o - 0.35), p(s1 - 0.06 - jag, o + side * 0.42), p(s0 + 0.06 + jag, o + side * 0.42)];
        big.push(prism(pts, yy + 0.04, yy + ch - 0.04 - rand() * 0.1));
        if (rand() < 0.5) { const q = p(s1, o + side * 0.32); small.push(blob([q[0], yy + ch * 0.5, q[1]], 0.16 + rand() * 0.08, [1, 0.8, 0.7], 5)); }
      }
      s += w;
    }
    yy += ch;
  }
  bag.add('limestone_yellow', merge(big));
  if (small.length) bag.add('rubble', merge(small));
}

Object.assign(STYLES.greek.elements, { theatron, orchestra, skene, odeion_roof: odeionRoof, xoanon, trojan_horse: trojanHorse, votive, armoury, cyclopean });
