// The inside of a Reformed church of Amsterdam about 1670 (docs/settlements/amsterdam.md §5.13): the walls
// whitewashed, the nave and its aisles on two rows of round stone columns, a plastered timber barrel vault over
// the nave (the groins where a transept crosses it), the floor of grey gravestones, the pulpit with its sounding
// board against a column and the benches and chairs round it, the organ on its gallery at the north end,
// brass chandeliers hanging in the nave, black funeral hatchments on the columns — the scene of Saenredam's
// and De Witte's church interiors. Built from the rects of the church (the nave and its transepts, as in
// landmarks.js dutchChurch); the exterior is landmarks.js'.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { faceFrame, fbox, prism } from './facade.js';

const PL = 'plaster_white', OAK = 'wood_dark';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const WALL = 0.9, SPRING = 8.5, RISE = 3.6;
/** The gaps in one edge of rect r (the edge at coordinate c along axis, running a0..a1) left by the other rects, as wall segments. */
function edgeSegments(r, k, rects) {
  const horiz = k === 'n' || k === 's', c = k === 'w' ? r[0] : k === 'e' ? r[2] : k === 'n' ? r[1] : r[3];
  const a0 = horiz ? r[0] : r[1], a1 = horiz ? r[2] : r[3];
  let segs = [[a0, a1]];
  for (const q of rects) {
    if (q === r) continue;
    const lo = horiz ? q[1] : q[0], hi = horiz ? q[3] : q[2];
    if (!(c > lo + 1e-6 && c < hi - 1e-6)) continue;
    const b0 = (horiz ? q[0] : q[1]) + WALL, b1 = (horiz ? q[2] : q[3]) - WALL;
    segs = segs.flatMap(([s0, s1]) => (b1 <= s0 || b0 >= s1 ? [[s0, s1]] : [[s0, Math.min(s1, b0)], [Math.max(s0, b1), s1]].filter(([p, q2]) => q2 - p > 1e-6)));
  }
  return { c, segs, horiz };
}

/** The vault's height over (x, z) in the nave (an elliptic barrel over its middle, the aisles flat) and the transepts (a barrel across their length). */
const vaultAt = (nave, trs, x, z) => {
  const cx = (nave[0] + nave[2]) / 2, mid = 4.6;
  let h = -Infinity;
  if (x >= nave[0] + WALL - 1e-6 && x <= nave[2] - WALL + 1e-6 && z >= nave[1] + WALL - 1e-6 && z <= nave[3] - WALL + 1e-6) {
    const t = Math.abs(x - cx) / mid; h = t >= 1 ? SPRING : SPRING + RISE * Math.sqrt(1 - t * t);
  }
  for (const r of trs) {
    if (x < r[0] + WALL - 1e-6 || x > r[2] - WALL + 1e-6 || z < r[1] + WALL - 1e-6 || z > r[3] - WALL + 1e-6) continue;
    const hw = (r[3] - r[1]) / 2 - WALL, t = Math.abs(z - (r[1] + r[3]) / 2) / hw;
    h = Math.max(h, SPRING + RISE * Math.sqrt(Math.max(0, 1 - Math.min(1, t) ** 2)));
  }
  return h;
};

function chandelier(bag, x, y, z, lights, seed) {
  bag.add('bronze', rod([x, y + 3.2, z], [x, y + 0.35, z], 0.014, 6));
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0.04], [0.2, 0.16], [0.12, 0.3], [0.05, 0.42], [0.001, 0.46]], 12, null, x, y - 0.1, z));
  const arms = 8;
  for (let k = 0; k < arms; k++) {
    const a = k / arms * Math.PI * 2, ex = x + Math.cos(a) * 0.62, ez = z + Math.sin(a) * 0.62, c = Math.cos(a), s = Math.sin(a);
    bag.add('bronze', rod([x + c * 0.12, y + 0.02, z + s * 0.12], [x + c * 0.42, y - 0.08, z + s * 0.42], 0.013, 5));
    bag.add('bronze', rod([x + c * 0.42, y - 0.08, z + s * 0.42], [ex, y + 0.18, ez], 0.013, 5));
    bag.add('bronze', lathe([[0.001, 0], [0.06, 0.005], [0.035, 0.04], [0.03, 0.06], [0.001, 0.06]], 8, null, ex, y + 0.16, ez));
    bag.add('linen', lathe([[0.014, 0], [0.014, 0.2], [0.001, 0.21]], 6, null, ex, y + 0.22, ez));
  }
  lights.push({ at: [x, y + 0.3, z], color: '#ffe3b4', intensity: 2.6, distance: 17 });
  void seed;
}

/** The organ on its gallery against the north wall: the gallery on two columns, the case with its three towers of gilt pipes, a flat between them. */
function organ(bag, col, cx, zWall, y, w) {
  const gy = y + 4.6, gd = 2.6, gw = Math.min(w - 3, 11);
  bag.add(OAK, box(cx - gw / 2, gy - 0.5, zWall, cx + gw / 2, gy, zWall + gd));
  bag.add(OAK, box(cx - gw / 2 - 0.1, gy - 0.65, zWall + gd - 0.15, cx + gw / 2 + 0.1, gy - 0.5, zWall + gd + 0.1));
  for (const s of [-1, 1]) {
    bag.add('sandstone_dressed', lathe([[0.5, 0], [0.42, 0.4], [0.4, gy - y - 0.9], [0.5, gy - y - 0.65], [0.5, gy - y - 0.5]], 14, null, cx + s * (gw / 2 - 0.7), y, zWall + gd - 0.6));
    col.circle(cx + s * (gw / 2 - 0.7), zWall + gd - 0.6, 0.5, y, gy);
  }
  col.rect([cx - gw / 2, zWall, cx + gw / 2, zWall + 0.1], y, y + 14);
  col.floor([cx - gw / 2, zWall, cx + gw / 2, zWall + gd], gy);
  bag.add(OAK, box(cx - gw / 2 + 0.2, gy, zWall + gd - 0.06, cx + gw / 2 - 0.2, gy + 1.0, zWall + gd));            // the gallery's parapet
  const cy = gy, cw = gw - 1.4;
  bag.add(OAK, box(cx - cw / 2, cy, zWall + 0.1, cx + cw / 2, cy + 1.2, zWall + 1.7));                              // the chest
  bag.add(OAK, box(cx - cw / 2, cy + 1.2, zWall + 0.1, cx + cw / 2, cy + 1.3, zWall + 1.75));
  const towers = [[-cw / 2 + 1.2, 1.3, 6.2], [0, 1.6, 7.4], [cw / 2 - 1.2, 1.3, 6.2]];
  for (const [du, tw, th] of towers) {
    bag.add(OAK, box(cx + du - tw / 2 - 0.08, cy + 1.3, zWall + 0.12, cx + du + tw / 2 + 0.08, cy + th - 0.6, zWall + 0.2));
    const n = 7;
    for (let k = 0; k < n; k++) {
      const u = cx + du - tw / 2 + (k + 0.5) * tw / n, hgt = th - 1.9 - Math.abs(k - (n - 1) / 2) * (0.3 + th * 0.012);
      bag.add('gilt_bronze', lathe([[0.001, 0], [tw / n * 0.42, 0.04], [tw / n * 0.38, hgt], [tw / n * 0.2, hgt + 0.06], [0.001, hgt + 0.08]], 8, null, u, cy + 1.45 + (th - 1.9 - hgt) * 0, zWall + 0.5));
    }
    bag.add(OAK, box(cx + du - tw / 2 - 0.12, cy + th - 0.6, zWall + 0.1, cx + du + tw / 2 + 0.12, cy + th - 0.45, zWall + 0.75));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.18, 0.05], [0.1, 0.25], [0.001, 0.4]], 8, null, cx + du, cy + th - 0.45, zWall + 0.45));
  }
  for (const [a, b] of [[-0.7, -0.2], [0.2, 0.7]]) for (let k = 0; k < 9; k++) { const u = cx + a * cw / 2 + (k + 0.5) * (b - a) * cw / 2 / 9, hh = 2.1 + (k % 3) * 0.2; bag.add('gilt_bronze', lathe([[0.001, 0], [0.05, 0.03], [0.045, hh], [0.001, hh + 0.05]], 6, null, u, cy + 1.7, zWall + 0.4)); }
  col.rect([cx - cw / 2, zWall + 0.1, cx + cw / 2, zWall + 1.7], cy, cy + 7);
}

/** The pulpit (the preekstoel) on its column, an octagonal basket carved in panels, the stair up behind it and the sounding board over it. */
function pulpit(bag, col, x, y, z, face) {
  const R = 0.62, by = y + 1.55;
  bag.add(OAK, lathe([[0.001, 0], [0.4, 0], [0.34, 0.2], [0.26, 0.6], [0.3, 1.2], [0.5, 1.45], [0.62, 1.55]], 8, null, x, y, z));
  bag.add(OAK, lathe([[R, 0], [R + 0.12, 0.12], [R + 0.22, 0.95], [R + 0.28, 1.05], [R + 0.28, 1.1], [0.001, 1.1]], 8, null, x, by, z));
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) / 8 * Math.PI * 2, px = x + Math.cos(a) * (R + 0.2), pz = z + Math.sin(a) * (R + 0.2);
    if (Math.abs(((a - face + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.45) continue;
    bag.add('timber', box(px - 0.13, by + 0.2, pz - 0.13, px + 0.13, by + 0.8, pz + 0.13).rotateY(0));
  }
  bag.add('gilt_bronze', lathe([[R + 0.3, 0], [R + 0.3, 0.04], [R + 0.28, 0.04], [R + 0.28, 0]], 8, null, x, by + 1.1, z));
  bag.add('cloth_red', lathe([[0.001, 0], [R * 0.9, 0], [R * 0.9, 0.04], [0.001, 0.04]], 8, null, x, by + 0.05, z));
  // the stair: a straight flight up against the column's side
  const sx = x - Math.cos(face) * (R + 0.2), sz = z - Math.sin(face) * (R + 0.2);
  for (let k = 0; k < 6; k++) bag.add(OAK, box(sx - 0.5 + Math.sin(face) * 0, by - 1.3 + k * 0.22, sz - 0.18 - k * 0.0, sx + 0.5, by - 1.3 + k * 0.22 + 0.2, sz + 0.18).translate(-Math.cos(face) * k * 0.3, 0, -Math.sin(face) * k * 0.3));
  // the sounding board: an octagonal canopy on a rod from the vault, a gilt finial
  const cy = by + 2.7;
  bag.add(OAK, lathe([[R + 0.5, 0], [R + 0.58, 0.1], [R + 0.45, 0.28], [R * 0.4, 0.5], [0.001, 0.55]], 8, null, x, cy, z));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.05], [0.08, 0.28], [0.001, 0.4]], 8, null, x, cy + 0.55, z));
  bag.add('iron', rod([x, cy + 0.95, z], [x, y + SPRING + RISE * 0.7, z], 0.02, 5));
  col.circle(x, z, R + 0.35, y, by + 1.1);
}

/** The benches round the pulpit (arcs of short benches facing it) and a few rush-seated chairs. */
function seating(bag, col, cx, zc, y, lim, rand, pulpitAt) {
  const [px, pz] = pulpitAt;
  for (const [R, nb] of [[4.2, 6], [6.2, 8], [8.2, 10]]) {
    for (let k = 0; k < nb; k++) {
      const a = (k + 0.5) / nb * Math.PI * 1.35 - Math.PI * 0.675 + Math.PI * 0.5 * 0 + Math.atan2(0, 1) + (lim.dir ?? 0);
      const bx = px + Math.cos(a) * R, bz = pz + Math.sin(a) * R, yaw = -a + Math.PI / 2;
      if (bx < lim.x0 + 1 || bx > lim.x1 - 1 || bz < lim.z0 + 1 || bz > lim.z1 - 1) continue;
      if (Math.hypot(bx - cx, bz - zc) < 0.01) continue;
      const len = R * 1.35 / nb * 0.82;
      const g = (a0, y0, a1, y1, a2, y2) => box(a0, y0, a1, y1, a2, y2).rotateY(yaw).translate(bx, y, bz);
      bag.add(OAK, g(-len / 2, 0.42, -0.22, len / 2, 0.47, 0.22)); bag.add(OAK, g(-len / 2, 0.47, 0.2, len / 2, 1.0, 0.25));
      for (const s of [-1, 1]) bag.add(OAK, g(s * len / 2 - 0.04, 0, -0.2, s * len / 2 + 0.04, 0.42, 0.2));
      col.circle(bx, bz, Math.min(0.62, len / 2), y, y + 1.0);
    }
  }
  void rand;
}

/**
 * churchInterior: builds the walls of the church (as a ring of the nave's and the transepts' walls), the floor, the vault
 * and the furnishings; `door` the end ('n' or 's') of the nave with its door; returns nothing. el: { rect, transepts (rects), h, y, mat, door, gothic, id }.
 */
export function churchInterior(el, tr, { bag, col, lights }) {
  const nave = el.rect, y = el.y ?? 0, h = el.h ?? 15, mat = el.mat ?? 'brick', door = el.door ?? 's', T = WALL, rand = rng(el.seed ?? 1645);
  const rects = [nave, ...tr], cx = (nave[0] + nave[2]) / 2, W = nave[2] - nave[0], DW = 1.5, DH = 4.6;
  // ---- the walls: every edge of every rect, but where another rect opens into it; the door in the nave's end wall
  for (const r of rects) for (const k of ['n', 's', 'e', 'w']) {
    const { c, segs, horiz } = edgeSegments(r, k, rects);
    const inward = k === 'w' || k === 'n' ? 1 : -1;
    for (const [s0, s1] of segs) {
      const pieces = [];
      if (r === nave && k === door && horiz) {
        const d0 = cx - DW, d1 = cx + DW;
        if (s0 < d0) pieces.push([s0, Math.min(s1, d0), true]);
        if (s1 > d1) pieces.push([Math.max(s0, d1), s1, true]);
        pieces.push([Math.max(s0, d0), Math.min(s1, d1), false]);
      } else pieces.push([s0, s1, true]);
      for (const [a, b, full] of pieces) {
        if (b - a < 1e-6) continue;
        const lo = Math.min(c, c + inward * T), hi = Math.max(c, c + inward * T);
        const bx = horiz ? [a, lo, b, hi] : [lo, a, hi, b];
        const [yy0, yy1] = full ? [y - 0.5, y + h] : [y + DH, y + h];
        bag.add(mat, box(bx[0], yy0, bx[1], bx[2], yy1, bx[3]));
        if (full) { const o = c - inward * 0.25, q0 = Math.min(c, o), q1 = Math.max(c, o); bag.add('sandstone_dressed', horiz ? box(a, y - 0.5, q0, b, y + 1.2, q1) : box(q0, y - 0.5, a, q1, y + 1.2, b)); }
        col.rect(bx, yy0, yy1);
        // the whitewashed inner face
        const f = c + inward * T, sk = 0.03 * inward, ylo = full ? y + 0.05 : y + DH, yhi = y + Math.min(h, SPRING + RISE + 0.8);
        const pb = horiz ? [a, Math.min(f, f - sk), b, Math.max(f, f - sk)] : [Math.min(f, f - sk), a, Math.max(f, f - sk), b];
        bag.add(PL, box(pb[0], ylo, pb[1], pb[2], yhi, pb[3]));
      }
    }
  }
  // the stone plinth's threshold and the door's stone jambs inside, the leaves standing open
  { const zE = door === 's' ? nave[3] : nave[1], sg = door === 's' ? -1 : 1, zi = zE + sg * T;
    bag.add('sandstone_dressed', box(cx - DW, y - 0.5, Math.min(zE, zi), cx + DW, y + 0.08, Math.max(zE, zi)));
    for (const s of [-1, 1]) {
      bag.add('sandstone_dressed', box(cx + s * DW - 0.12, y, Math.min(zE, zi), cx + s * DW + 0.12, y + DH, Math.max(zE, zi)));
      bag.add('wood_dark', box(cx + s * (DW - 0.04) - 0.05 * s, y + 0.05, zi + sg * 0.02, cx + s * (DW - 0.04) + 0.05 * s + s * 0.0, y + DH - 0.1, zi + sg * (DW - 0.04)));
    }
    bag.add('sandstone_dressed', box(cx - DW - 0.12, y + DH, Math.min(zE, zi), cx + DW + 0.12, y + DH + 0.3, Math.max(zE, zi)));
  }
  // ---- the floor: gravestones laid in the paving; the vault over it; the space above the vault solid (no roof to walk on)
  const inner = (r) => [r[0] + T, r[1] + T, r[2] - T, r[3] - T];
  for (const r of rects) {
    const [a, b, c, d] = inner(r);
    bag.add('bluestone', box(a - 0.01, y - 0.5, b - 0.01, c + 0.01, y + 0.06, d + 0.01));
    col.floor([a, b, c, d], y + 0.06);
  }
  { const cnt = Math.round(W * (nave[3] - nave[1]) / 7);
    for (let k = 0; k < cnt; k++) {
      const r = inner(rects[Math.floor(rand() * rects.length)]), x = r[0] + 0.8 + rand() * Math.max(0.1, r[2] - r[0] - 2.6), z = r[1] + 1.2 + rand() * Math.max(0.1, r[3] - r[1] - 3.6), yaw = rand() < 0.8 ? 0 : 1;
      const lw = yaw ? 2.0 : 1.0, ld = yaw ? 1.0 : 2.0, ink = rand() < 0.6 ? 'marble_dark' : 'marble_smooth';
      bag.add(ink, box(x, y + 0.058, z, x + lw, y + 0.075, z + ld));
      if (rand() < 0.7) bag.add('lead', box(x + 0.15, y + 0.075, z + 0.15, x + lw - 0.15, y + 0.082, z + ld - 0.15));
    }
  }
  {
    const cell = 0.6, T3 = [];
    const xs = Math.min(...rects.map((r) => r[0])) + T, xe = Math.max(...rects.map((r) => r[2])) - T, zs = nave[1] + T, ze = nave[3] - T;
    for (let x = xs; x < xe - 1e-6; x += cell) for (let z = zs; z < ze - 1e-6; z += cell) {
      const x1 = Math.min(x + cell, xe), z1 = Math.min(z + cell, ze), mid = vaultAt(nave, tr, (x + x1) / 2, (z + z1) / 2);
      if (mid === -Infinity) continue;
      const at = (px, pz) => { const v = vaultAt(nave, tr, px, pz); return y + (v === -Infinity ? mid : v); };
      const A = [x, at(x, z), z], B = [x1, at(x1, z), z], C = [x1, at(x1, z1), z1], D = [x, at(x, z1), z1];
      T3.push(...A, ...B, ...D, ...B, ...C, ...D);
    }
    bag.add(PL, fromTriangles(T3));
    // the beams (moerbalken) across the aisles and a tie beam over every column
    const bays = Math.max(2, Math.round((nave[3] - nave[1] - 2 * T) / 6.4)), bl = (nave[3] - nave[1] - 2 * T) / bays;
    for (let i = 0; i <= bays; i++) {
      const z = nave[1] + T + i * bl, zz = Math.min(Math.max(z, nave[1] + T + 0.2), nave[3] - T - 0.2);
      for (const [x0, x1] of [[nave[0] + T, cx - 4.6], [cx + 4.6, nave[2] - T]]) bag.add(OAK, box(x0, y + SPRING - 0.34, zz - 0.18, x1, y + SPRING, zz + 0.18));
      bag.add(OAK, box(cx - 4.7, y + SPRING - 0.06, zz - 0.2, cx + 4.7, y + SPRING + 0.14, zz + 0.2));
    }
    for (const r of tr) col.rect(inner(r), y + SPRING + RISE + 0.1, y + h + 20);
    col.rect(inner(nave), y + SPRING + RISE + 0.1, y + h + 20);
    // the columns of the arcades, two rows, a bay apart: round shafts on square bases, a capital under the vault's spring
    const row = [cx - 4.6, cx + 4.6];
    for (const [ci, ux] of row.entries()) for (let i = 1; i < bays; i++) {
      const z = nave[1] + T + i * bl;
      if (tr.some((r) => z > r[1] + T - 0.6 && z < r[3] - T + 0.6) && false) continue;
      bag.add('sandstone_dressed', box(ux - 0.7, y, z - 0.7, ux + 0.7, y + 0.5, z + 0.7));
      bag.add('sandstone_dressed', lathe([[0.001, 0], [0.62, 0], [0.55, 0.1], [0.5, 0.5], [0.46, SPRING - 1.5], [0.5, SPRING - 0.6], [0.78, SPRING - 0.35], [0.78, SPRING - 0.1], [0.001, SPRING - 0.1]], 16, null, ux, y + 0.5, z));
      col.circle(ux, z, 0.58, y, y + SPRING);
      if ((i + ci) % 2 === 0) {                                                  // a black funeral hatchment (rouwbord) on the column's aisle side
        const fx = ux + (ci ? 1 : -1) * 0.52, A = (m, u0, u1, v0, v1) => bag.add(m, box(Math.min(fx, fx + (ci ? 0.05 : -0.05)) , y + v0, z + u0, Math.max(fx, fx + (ci ? 0.05 : -0.05)), y + v1, z + u1));
        A('lacquer_black', -0.32, 0.32, 3.3, 3.95); A('gilt_bronze', -0.36, 0.36, 3.26, 3.3); A('gilt_bronze', -0.36, 0.36, 3.95, 3.99);
        A('gilt_bronze', -0.36, -0.32, 3.26, 3.99); A('gilt_bronze', 0.32, 0.36, 3.26, 3.99); A('paint_white', -0.14, 0.14, 3.5, 3.75);
      }
    }
    // the windows on the inner faces: arched lights from the sills up to the aisle ceiling, in a stone surround
    const [nx0, nz0, nx1, nz1] = inner(nave), wid = 2.5;
    for (const k of ['e', 'w']) {
      const F = k === 'e' ? faceFrame([nx0 - 1, nz0, nx0, nz1], 'e') : faceFrame([nx1, nz0, nx1 + 1, nz1], 'w');
      for (let i = 0; i < bays; i++) {
        const m = (i + 0.5) * bl, zc = k === 'e' ? nz1 - m : nz0 + m;
        if (tr.some((r) => zc > r[1] - 1 && zc < r[3] + 1)) continue;
        window(bag, F, y, m, 2.4, wid, 5.8);
      }
    }
    for (const r of tr) {
      const q = inner(r), L = q[3] - q[1];
      const Fw = faceFrame([q[0] - 1, q[1], q[0], q[3]], 'e'), Fe = faceFrame([q[2], q[1], q[2] + 1, q[3]], 'w');           // the west end's inner face looks east, the east end's west
      window(bag, Fw, y, L / 2, 2.6, Math.min(4.2, L * 0.34), 8.2); window(bag, Fe, y, L / 2, 2.6, Math.min(4.2, L * 0.34), 8.2);
    }
    // ---- the furnishings
    const zn = nave[1] + T, zs2 = nave[3] - T, north = door === 's';
    organ(bag, col, cx, north ? zn : zs2 - 2.7, y, W - 2 * T);
    const lim = { x0: nx0, x1: nx1, z0: zn + 3.2, z1: zs2 - 3, dir: 0 };
    const pz = zn + (zs2 - zn) * 0.46, side = 1, px = cx + side * 4.6;
    pulpit(bag, col, px - 0.35, y, pz, Math.PI);
    seating(bag, col, cx, pz, y, { ...lim, dir: Math.PI }, rand, [px - 0.35, pz]);
    for (const z of [zn + (zs2 - zn) * 0.22, zn + (zs2 - zn) * 0.46, zn + (zs2 - zn) * 0.72]) chandelier(bag, cx, y + SPRING - 1.2, z, lights, 0);
    for (const [k, z] of [[0, zn + (zs2 - zn) * 0.34], [1, zn + (zs2 - zn) * 0.6]]) for (const s of [-1, 1]) chandelier(bag, cx + s * (nave[2] - nave[0] - 2 * T) * 0.3, y + SPRING - 1.4 - k * 0.0, z, lights, 1);
    // the church's tablet: the Ten Commandments on black boards either side of the door, in gilt
    for (const s of [-1, 1]) { const u = cx + s * 3.6, zi = door === 's' ? zs2 : zn, sg = door === 's' ? -1 : 1;
      bag.add('lacquer_black', box(u - 0.7, y + 2.2, Math.min(zi, zi + sg * 0.05), u + 0.7, y + 4.0, Math.max(zi, zi + sg * 0.05)));
      for (let r2 = 0; r2 < 6; r2++) bag.add('gilt_bronze', box(u - 0.55, y + 2.4 + r2 * 0.27, Math.min(zi + sg * 0.05, zi + sg * 0.065), u + 0.55, y + 2.4 + r2 * 0.27 + 0.05, Math.max(zi + sg * 0.05, zi + sg * 0.065))); }
    // the poor box (an oak post with an iron-banded box) by the door
    { const u = cx + DW + 1.2, zi = door === 's' ? zs2 - 0.8 : zn + 0.8;
      bag.add(OAK, box(u - 0.1, y, zi - 0.1, u + 0.1, y + 1.05, zi + 0.1)); bag.add(OAK, box(u - 0.2, y + 1.05, zi - 0.2, u + 0.2, y + 1.4, zi + 0.2)); bag.add('iron', box(u - 0.21, y + 1.2, zi - 0.21, u + 0.21, y + 1.25, zi + 0.21)); col.circle(u, zi, 0.25, y, y + 1.4); }
  }
}
function window(bag, F, y, u, v0, wid, hh) {
  const r = wid / 2, vs = v0 + hh - r;
  bag.add('opening', fbox(F, y, u - r, u + r, v0, vs, 0.0, 0.03));
  const n = 8, tri = [];
  void tri;
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI * i / n, a1 = Math.PI * (i + 1) / n;
    bag.add('opening', prism(F, y, [[u + Math.cos(a0) * r, vs + Math.sin(a0) * r], [u + Math.cos(a1) * r, vs + Math.sin(a1) * r], [u, vs]], 0.0, 0.03));
  }
  bag.add('sandstone_dressed', fbox(F, y, u - r - 0.18, u - r, v0 - 0.12, vs, 0, 0.1)); bag.add('sandstone_dressed', fbox(F, y, u + r, u + r + 0.18, v0 - 0.12, vs, 0, 0.1));
  bag.add('sandstone_dressed', fbox(F, y, u - r - 0.2, u + r + 0.2, v0 - 0.2, v0, 0, 0.14));
  for (let i = 0; i < n; i++) { const a0 = Math.PI * i / n, a1 = Math.PI * (i + 1) / n, o = r + 0.18; bag.add('sandstone_dressed', prism(F, y, [[u + Math.cos(a0) * r, vs + Math.sin(a0) * r], [u + Math.cos(a0) * o, vs + Math.sin(a0) * o], [u + Math.cos(a1) * o, vs + Math.sin(a1) * o], [u + Math.cos(a1) * r, vs + Math.sin(a1) * r]], 0, 0.1)); }
  bag.add('lead', fbox(F, y, u - 0.025, u + 0.025, v0, vs + r, 0.03, 0.06));
  for (let k = 1; k < 5; k++) bag.add('lead', fbox(F, y, u - r, u + r, v0 + (vs - v0) * k / 5 - 0.02, v0 + (vs - v0) * k / 5 + 0.02, 0.03, 0.06));
}
