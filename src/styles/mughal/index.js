// Mughal architecture of the Taj Mahal (1632–1653; docs/settlements/mughal-agra.md §4–§5): the
// mausoleum of white marble on its plinth, a square with chamfered corners, each face a great
// iwan (pishtaq: a pointed arch in a rectangular frame) flanked by two storeys of smaller arched
// niches; the bulbous double dome on its drum with a lotus crown and a finial, four domed kiosks
// (chhatri) round it; four minarets with balconies; the mosque and its twin of red sandstone with
// three white domes; the great gate; walls with octagonal towers; the charbagh garden with its
// raised channels and the central pool; the town of flat-roofed houses with balconies (jharokha).

import { Shape, Path, ExtrudeGeometry, Matrix4 } from 'three';
import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris } from '../ming/index.js';

const W = 'marble_smooth', R = 'sandstone_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The profile of a bulbous (onion) dome of radius r over its drum, height h, ending in a lotus and a finial. */
function onion(r, h) {
  const p = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, a = t * Math.PI;
    // swelling out a little past the drum, then drawing in to the neck
    const w = r * (1 + 0.12 * Math.sin(Math.min(1, t * 1.6) * Math.PI)) * Math.sin(Math.max(0.0001, Math.PI * 0.5 + a * 0.5)) ** 0.9;
    p.push([Math.max(0.001, w * (1 - t ** 3)), h * t]);
  }
  return p;
}
function dome(bag, mat, x, y, z, r, h, finial = true) {
  bag.add(mat, lathe(onion(r, h), 32, null, x, y, z));
  if (finial) {
    bag.add(mat, lathe([[r * 0.18, 0], [r * 0.22, r * 0.06], [r * 0.1, r * 0.12], [0.001, r * 0.14]], 16, (t) => 1 + 0.25 * Math.max(0, Math.cos(t * 16)), x, y + h * 0.98, z));
    bag.add('gilt_bronze', lathe([[0.001, 0], [r * 0.03, 0], [r * 0.05, r * 0.15], [r * 0.025, r * 0.3], [r * 0.05, r * 0.42], [0.001, r * 0.6]], 8, null, x, y + h * 0.98 + r * 0.12, z));
  }
}

/** A pointed-arch shape (2D, in the u–v plane) of width w and height h (spring at h − w/2·0.9). */
function archPath(path, u0, w, h) {
  // a four-centred-looking pointed arch: two arcs of radius r, each centred on the far side
  const r = w * 0.8, rise = Math.sqrt(r * r - (r - w / 2) ** 2), spring = Math.max(0.3, h - rise);
  const cL = u0 + r, cR = u0 + w - r, N = 10;
  path.moveTo(u0, 0.04); path.lineTo(u0, spring);
  for (let i = 1; i <= N; i++) { const x = u0 + (w / 2) * i / N; path.lineTo(x, spring + Math.sqrt(Math.max(0, r * r - (x - cL) ** 2))); }
  for (let i = 1; i <= N; i++) { const x = u0 + w / 2 + (w / 2) * i / N; path.lineTo(x, spring + Math.sqrt(Math.max(0, r * r - (x - cR) ** 2))); }
  path.lineTo(u0 + w, 0.04); path.lineTo(u0, 0.04);
}

/**
 * A facade panel from a to b { y, h, th, mat } with arched openings cut into it, each with a recess
 * (a back wall `depth` behind the face): arches: [{ at, w, h, sill, depth }].
 */
function arcadeWall(bag, col, a, b, y, h, th, mat, arches = [], inside = null) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const shape = new Shape();
  shape.moveTo(0, 0); shape.lineTo(L, 0); shape.lineTo(L, h); shape.lineTo(0, h); shape.lineTo(0, 0);
  for (const ar of arches) {
    const p = new Path(), sill = ar.sill ?? 0;
    archPath(p, ar.at - ar.w / 2, ar.w, ar.h);
    p.getPoints().length;
    const hole = new Path();
    const pts = p.getPoints().map((q) => [q.x, q.y + sill]);
    hole.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) hole.lineTo(q[0], q[1]);
    shape.holes.push(hole);
  }
  const g = new ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 6 });
  g.translate(0, 0, -th / 2);
  g.applyMatrix4(new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: -uz, y: 0, z: ux }).setPosition(a[0], y, a[1]));
  bag.add(mat, g);
  // the recesses' back walls (dark inside), the collision of the wall where no door opens
  // the recesses go back toward `inside` (the building's middle), else to the wall's left
  let nx = -uz, nz = ux;
  if (inside) { const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; if ((inside[0] - mx) * nx + (inside[1] - mz) * nz < 0) { nx = -nx; nz = -nz; } }
  for (const ar of arches) {
    const d = ar.depth ?? 1.2, c = [a[0] + ux * ar.at + nx * (th / 2 + d), a[1] + uz * ar.at + nz * (th / 2 + d)], sill = ar.sill ?? 0;
    const t = [];
    beamTris(t, [c[0] - ux * ar.w / 2, y + sill, c[1] - uz * ar.w / 2], [c[0] + ux * ar.w / 2, y + sill, c[1] + uz * ar.w / 2], 0.1, ar.h);
    if (!ar.pass) bag.add(ar.door ? 'lacquer_black' : (ar.back || mat), fromTriangles(t));
  }
  // an arch with `pass` is open: no back wall, and one walks through it
  let u = 0;
  const P = (s) => [a[0] + ux * s, a[1] + uz * s];
  for (const ar of arches.filter((q) => q.pass).sort((p, q) => p.at - q.at)) {
    const s0 = ar.at - ar.w / 2, s1 = ar.at + ar.w / 2;
    if (s0 > u) col.segment(P(u), P(s0), th, y, y + h);
    col.segment(P(s0), P(s1), th, y + (ar.sill ?? 0) + ar.h, y + h);
    u = s1;
  }
  if (u < L) col.segment(P(u), P(L), th, y, y + h);
}

/**
 * pishtaq_face: one face of the mausoleum or a gate { a, b, y, h, iwan: { w, h }, niches (the two
 * storeys of niches either side), mat, trim }: the face with the great arch in its middle, the
 * niches beside it, a parapet with a frieze along the top.
 */
function pishtaqFace(bag, col, a, b, y, h, iw, mat, niches = true, inside = null, trim = 'marble_dark') {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const arches = [{ at: L / 2, w: iw.w, h: iw.h, depth: iw.depth ?? 4, door: !iw.pass && !iw.back, back: iw.back, pass: iw.pass }];
  if (niches) for (const s of [-1, 1]) {
    const c = L / 2 + s * (iw.w / 2 + (L - iw.w) / 4);
    const nw = Math.min((L - iw.w) / 2 - 2, iw.w * 0.45);
    arches.push({ at: c, w: nw, h: iw.h * 0.42, sill: 0.6, depth: 1.5 }, { at: c, w: nw, h: iw.h * 0.38, sill: iw.h * 0.52, depth: 1.5 });
  }
  arcadeWall(bag, col, a, b, y, h, 2.4, mat, arches, inside);
  if (iw.pass) {
    // an open iwan: its back wall has a door one walks through
    const L0 = L, ux0 = (b[0] - a[0]) / L0, uz0 = (b[1] - a[1]) / L0;
    let mx = -uz0, mz = ux0;
    if (inside) { if ((inside[0] - (a[0] + b[0]) / 2) * mx + (inside[1] - (a[1] + b[1]) / 2) * mz < 0) { mx = -mx; mz = -mz; } }
    const off = 1.2 + (iw.depth ?? 4) + 0.2, c0 = [a[0] + ux0 * L0 / 2 + mx * off, a[1] + uz0 * L0 / 2 + mz * off];
    const p0 = [c0[0] - ux0 * iw.w / 2, c0[1] - uz0 * iw.w / 2], p1 = [c0[0] + ux0 * iw.w / 2, c0[1] + uz0 * iw.w / 2];
    const dw = Math.min(5, iw.w * 0.45);
    arcadeWall(bag, col, p0, p1, y, iw.h, 0.4, iw.backMat || mat, [{ at: iw.w / 2, w: dw, h: Math.min(iw.h * 0.5, dw * 1.6), pass: true }]);
  }
  // the frame round the iwan (a band of inlaid stone), the parapet
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  let nx = -uz, nz = ux;
  if (inside && (inside[0] - (a[0] + b[0]) / 2) * nx + (inside[1] - (a[1] + b[1]) / 2) * nz > 0) { nx = -nx; nz = -nz; }
  const c = [a[0] + ux * L / 2 + nx * 1.25, a[1] + uz * L / 2 + nz * 1.25];
  for (const s of [-1, 1]) { const t = []; beamTris(t, [c[0] + ux * s * (iw.w / 2 + 0.6), y, c[1] + uz * s * (iw.w / 2 + 0.6)], [c[0] + ux * s * (iw.w / 2 + 1.1), y, c[1] + uz * s * (iw.w / 2 + 1.1)], 0.15, h); bag.add(trim, fromTriangles(t)); }
  const t2 = []; beamTris(t2, [c[0] - ux * (iw.w / 2 + 1.1), y + iw.h + 1.2, c[1] - uz * (iw.w / 2 + 1.1)], [c[0] + ux * (iw.w / 2 + 1.1), y + iw.h + 1.2, c[1] + uz * (iw.w / 2 + 1.1)], 0.15, 0.5); bag.add(trim, fromTriangles(t2));
}

/** chhatri: a domed kiosk { c, y, r, h, n (columns), mat } on a little platform. */
function chhatri(bag, col, x, y, z, r, h, n = 8, mat = W, domeMat = W) {
  bag.add(mat, lathe([[r * 1.15, 0], [r * 1.15, 0.4], [0.001, 0.4]], n, null, x, y, z));
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + Math.PI / n; bag.add(mat, lathe([[r * 0.09, 0], [r * 0.07, h], [r * 0.1, h + 0.1]], 8, null, x + Math.cos(a) * r, y + 0.4, z + Math.sin(a) * r)); }
  bag.add(mat, lathe([[r * 1.25, 0], [r * 1.25, 0.25], [r * 1.05, 0.5], [0.001, 0.5]], n, null, x, y + 0.4 + h, z));       // the chhajja (eave)
  dome(bag, domeMat, x, y + 0.9 + h, z, r * 0.95, r * 1.4);
  if (col) col.circle(x, z, r * 1.15, y, y + h + 1);
}

/** minaret: a tapering round tower { c, y, h, r } with three balconies and a kiosk on top. */
function minaret(bag, col, x, y, z, h, r) {
  bag.add(W, lathe([[r * 1.25, 0], [r * 1.25, 3], [r * 1.05, 3.2], [r * 0.82, h]], 24, null, x, y, z));
  for (const f of [0.34, 0.64, 0.92]) bag.add(W, lathe([[r * 0.9, 0], [r * 1.55, 0.7], [r * 1.6, 1.1], [r * 1.5, 1.5], [0.001, 1.5]], 24, null, x, y + h * f - 1.2, z));
  chhatri(bag, null, x, y + h + 0.3, z, r * 0.95, 3.4, 8);
  col.circle(x, z, r * 1.25, y, y + h);
}

/**
 * mausoleum: the tomb { c, y (the plinth's top), a (half-width of the square), chamfer, h (the
 * walls' height), dome: { r, h, drum } }: four faces with their iwans, four chamfered corners with
 * smaller iwans, the drum and the onion dome, the four chhatris.
 */
function mausoleum(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, A = el.a, C = el.chamfer, H = el.h;
  const P = [[-A + C, -A], [A - C, -A], [A, -A + C], [A, A - C], [A - C, A], [-A + C, A], [-A, A - C], [-A, -A + C]].map(([x, z]) => [cx + x, cz + z]);
  for (let k = 0; k < 8; k++) {
    const a = P[k], b = P[(k + 1) % 8], main = k % 2 === 0;
    pishtaqFace(bag, col, a, b, y, H, main ? { w: (A - C) * 2 * 0.42, h: H * 0.82, depth: 5 } : { w: C * 1.4 * 0.5, h: H * 0.42 }, W, main, [cx, cz]);
  }
  bag.add(W, box(cx - A + 2, y + H - 0.8, cz - A + 2, cx + A - 2, y + H, cz + A - 2));
  col.floor([cx - A, cz - A, cx + A, cz + A], y + H);
  // the drum and the dome
  const dr = el.dome.r, dh = el.dome.h, drum = el.dome.drum;
  bag.add(W, lathe([[dr * 1.02, 0], [dr * 1.02, drum], [dr * 1.08, drum + 0.6], [dr, drum + 0.8]], 32, null, cx, y + H, cz));
  dome(bag, W, cx, y + H + drum + 0.8, cz, dr, dh);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) chhatri(bag, null, cx + sx * (A - C) * 0.75, y + H, cz + sz * (A - C) * 0.75, 3.4, 4.6, 8);
  // pinnacles at the corners of the chamfers
  for (const p of P) bag.add(W, lathe([[0.7, 0], [0.55, H + 4 - y + y], [0.001, H + 5.5]], 8, null, p[0], y, p[1]));
}

/** red_hall: the mosque or its twin (the jawab) { rect, y, h, front, domes: 3 }: a hall of red sandstone with arched openings, three white domes. */
function redHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 12, f = el.front || 'e';
  bag.add(R, box(x0, y, z0, x1, y + h, z1));
  col.rect([x0, z0, x1, z1], y, y + h);
  const [a, b] = f === 'e' ? [[x1 + 0.05, z0], [x1 + 0.05, z1]] : [[x0 - 0.05, z1], [x0 - 0.05, z0]];
  const L = z1 - z0, arches = [];
  for (let i = 0; i < 5; i++) { const c = L * (i + 0.5) / 5, big = i === 2; arches.push({ at: c, w: big ? 7 : 4.2, h: big ? h * 0.85 : h * 0.55, depth: 2.5, door: true }); }
  arcadeWall(bag, col, a, b, y, h, 1.2, R, arches, [(x0 + x1) / 2, (z0 + z1) / 2]);
  for (let i = 0; i < 3; i++) {
    const z = z0 + L * (i + 0.5) / 3, r = i === 1 ? 6.2 : 4.6, x = (x0 + x1) / 2;
    bag.add(R, lathe([[r * 1.04, 0], [r * 1.04, 2]], 24, null, x, y + h, z));
    dome(bag, W, x, y + h + 2, z, r, r * 1.5);
  }
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) chhatri(bag, null, x, y + h, z, 1.6, 2.6, 8, R, W);
}

/** great_gate: the gate { c, y, w, d, h, front ('n'|'s') }: a block of red sandstone, its faces with great iwans, a row of small chhatris along the top, towers with kiosks at its corners. */
function greatGate(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, w = el.w / 2, d = el.d / 2, h = el.h;
  for (const s of [-1, 1]) pishtaqFace(bag, col, [cx + w * s, cz + d * s], [cx - w * s, cz + d * s], y, h, { w: w * 0.6, h: h * 0.75, depth: d - 1.5 }, R, true, [cx, cz]);
  bag.add(R, box(cx - w, y, cz - d + 1.2, cx - w * 0.3, y + h, cz + d - 1.2));
  bag.add(R, box(cx + w * 0.3, y, cz - d + 1.2, cx + w, y + h, cz + d - 1.2));
  bag.add(R, box(cx - w * 0.3, y + h * 0.78, cz - d + 1.2, cx + w * 0.3, y + h, cz + d - 1.2));
  col.rect([cx - w, cz - d, cx - w * 0.3, cz + d], y, y + h); col.rect([cx + w * 0.3, cz - d, cx + w, cz + d], y, y + h);
  for (let i = 0; i < 11; i++) chhatri(bag, null, cx - w * 0.75 + i * w * 1.5 / 10, y + h, cz + d - 1.2, 0.9, 1.6, 6, W, W);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    bag.add(R, lathe([[2.2, 0], [2, h + 2]], 8, null, cx + sx * w, y, cz + sz * d));
    chhatri(bag, null, cx + sx * w, y + h + 2, cz + sz * d, 1.8, 2.8, 8, R, W);
  }
}

/** mughal_wall: a crenellated red sandstone wall { a, b, h } with an arcade of blind arches. */
function mughalWall(el, { bag, col }) {
  const L = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), n = Math.max(1, Math.round(L / 6)), arches = [];
  for (let i = 0; i < n; i++) arches.push({ at: (i + 0.5) * L / n, w: 3.2, h: el.h * 0.55, sill: 0.5, depth: 0.3 });
  arcadeWall(bag, col, el.a, el.b, el.y ?? 0, el.h, 1.6, R, arches, el.inside || [0, 0]);
  const ux = (el.b[0] - el.a[0]) / L, uz = (el.b[1] - el.a[1]) / L;
  for (let i = 0; i < Math.floor(L / 1.6); i++) { const s = (i + 0.5) * 1.6, x = el.a[0] + ux * s, z = el.a[1] + uz * s; bag.add(R, box(x - 0.4, el.h + (el.y ?? 0), z - 0.4, x + 0.4, el.h + (el.y ?? 0) + 0.9, z + 0.4)); }
}

/** octa_tower: an octagonal corner tower with a kiosk { c, h, r }. */
function octaTower(el, { bag, col }) {
  const [x, z] = el.c;
  bag.add(R, lathe([[el.r, 0], [el.r * 0.92, el.h]], 8, null, x, el.y ?? 0, z));
  chhatri(bag, col, x, (el.y ?? 0) + el.h, z, el.r * 0.85, el.r * 1.3, 8, R, W);
  col.circle(x, z, el.r, el.y ?? 0, (el.y ?? 0) + el.h);
}

/** haveli: a town house { rect, storeys, seed }: plastered brick, flat roof with a parapet, a jharokha (a balcony on brackets with a little roof) over the door. */
function haveli(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, st = el.storeys ?? (rand() < 0.5 ? 2 : 3), H = st * 3.3;
  const mat = rand() < 0.5 ? 'stucco_warm' : (rand() < 0.5 ? 'lime_plaster' : 'sandstone_red');
  bag.add(mat, box(x0, 0, z0, x1, H, z1));
  bag.add(mat, box(x0 - 0.15, H, z0 - 0.15, x1 + 0.15, H + 0.9, z0 + 0.15)); bag.add(mat, box(x0 - 0.15, H, z1 - 0.15, x1 + 0.15, H + 0.9, z1 + 0.15));
  col.rect([x0, z0, x1, z1], 0, H); col.floor([x0, z0, x1, z1], H);
  const zf = z1 + 0.02, xc = (x0 + x1) / 2;
  bag.add('timber', box(xc - 0.8, 0, zf - 0.05, xc + 0.8, 2.4, zf + 0.05));
  if (st > 1) {
    bag.add('sandstone_red', box(xc - 1.4, 3.6, zf, xc + 1.4, 3.8, zf + 1.0));
    for (const s of [-1, 1]) bag.add('sandstone_red', box(xc + s * 1.3 - 0.1, 3.8, zf + 0.85, xc + s * 1.3 + 0.1, 5.6, zf + 1.0));
    bag.add('lacquer_black', box(xc - 1.1, 3.8, zf - 0.02, xc + 1.1, 5.4, zf));
    bag.add('sandstone_red', lathe([[1.6, 0], [1.2, 0.5], [0.001, 0.9]], 4, null, xc, 5.6, zf + 0.5));
  }
}

registerStyle('mughal', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    mausoleum,
    minaret: (el, { bag, col }) => minaret(bag, col, el.c[0], el.y, el.c[1], el.h, el.r),
    chhatri: (el, { bag, col }) => chhatri(bag, col, el.c[0], el.y, el.c[1], el.r, el.h, el.n ?? 8, el.mat ?? W, el.domeMat ?? W),
    red_hall: redHall, great_gate: greatGate, mughal_wall: mughalWall, octa_tower: octaTower, haveli,
  },
  objects: {},
});
void frustum;
export { onion, dome, archPath, arcadeWall, pishtaqFace, chhatri };
