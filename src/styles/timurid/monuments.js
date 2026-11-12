// The monuments of Timurid Samarkand besides the madrasa (docs/settlements/timurid-samarkand.md §2): the
// Bibi-Khanym mosque, the Gur-e Amir complex, Ulugh Beg's observatory, the chorsu (the bazaar's domed crossing)
// and the rows of shops, with the wall and dome helpers they share.

import { box, lathe, fromTriangles, clothBox, addCloth, place, rod } from '../../core/geom.js';
import { hungCarpet } from './market.js';
import { frame } from './frame.js';
import { chamber, cenotaph, prayerHall } from './interiors.js';
import { orientedBox } from '../../core/build.js';
import { arcadeWall } from '../mughal/index.js';
import * as F from '../mughal/furnish.js';
import { B, LAP, TUR, CRE, WHI, rng, boxR, unit, away, solid, wallRun, bannai, ribbedDome, tiledMinaret, bar, pishtaqOf } from './kit.js';

/**
 * niche_wall: a wall a→b { y, h, th (1.2), bay, facing (a point on the inner side), backing (2.4: the solid behind),
 * tiers (2), top (banna'i band at the top, true) }: two tiers of blind pointed niches, a marble plinth, a Kufic band
 * under the cornice. The line a→b is the wall's middle; its outer face stands th/2 from it away from `facing`.
 */
export function nicheWall(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h, th = el.th ?? 1.2, bay = el.bay ?? 4.5, bk = el.backing ?? 2.4;
  const [ux, uz, L] = unit(a, b), [ox, oz] = away(a, b, el.facing), nx = -ox, nz = -oz;     // (nx, nz): toward the inside
  const n = Math.max(1, Math.round(L / bay)), w = L / n, arches = [];
  const h1 = Math.min(h * 0.42, 6.4), two = el.tiers !== 1 && h > 9;
  for (let i = 0; i < n; i++) {
    arches.push({ at: (i + 0.5) * w, w: w * 0.58, h: h1, sill: 0.9, depth: 0.3, back: 'tile_lapis' });
    if (two) arches.push({ at: (i + 0.5) * w, w: w * 0.5, h: Math.min(h * 0.24, 3.8), sill: h * 0.55, depth: 0.3, back: 'tile_lapis' });
  }
  const inside = [(a[0] + b[0]) / 2 + nx * 100, (a[1] + b[1]) / 2 + nz * 100];
  arcadeWall(bag, col, a, b, y, h, th, B, arches, inside);
  if (bk > 0) bar(bag, col, B, [a[0] + nx * (th / 2 + bk / 2), a[1] + nz * (th / 2 + bk / 2)], [b[0] + nx * (th / 2 + bk / 2), b[1] + nz * (th / 2 + bk / 2)], bk, y, y + h);
  const out = [-nx, -nz], d = th / 2;
  const O = (p, k) => [p[0] + out[0] * k, p[1] + out[1] * k];
  bag.add('marble', orientedBox(O(a, d + 0.05), O(b, d + 0.05), 0.12, y, y + 0.9));
  if (el.top !== false && h > 6) bannai(bag, { a, b, n: out, d, y, s0: 0.2, s1: L - 0.2, v0: h - 1.5, v1: h - 0.5, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.55, seed: Math.round(L) });
}

/**
 * tim_dome_block: a square block { c, half, y, wallH, walls (true: solid walls), drum: { r, h }, dome: { r, h, ribs },
 * trans (the octagon of transition's height), mat } topped by the ribbed dome on its drum.
 */
export function domeBlock(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, A = el.half, H = el.wallH, dr = el.drum.r, tr = el.trans ?? A * 0.26;
  if (el.walls !== false) solid(bag, col, el.wallMat ?? B, [cx - A, cz - A, cx + A, cz + A], y, y + H);
  // the roof's edge as a band of tile, then the octagon rising to the drum
  bag.add(LAP, box(cx - A - 0.1, y + H - 0.5, cz - A - 0.1, cx + A + 0.1, y + H, cz + A + 0.1));
  bag.add(B, lathe([[A * 1.04 / Math.cos(Math.PI / 8) * 0.92, 0], [dr * 1.1, tr]], 8, (th) => 1, cx, y + H, cz));
  ribbedDome(bag, col, { c: [cx, cz], y: y + H + tr, r: el.dome.r, h: el.dome.h, drum: el.drum, ribs: el.dome.ribs ?? 24, mat: el.mat ?? TUR });
}

const S = Math.SQRT1_2;

/** Bibi-Khanym (docs/settlements/timurid-samarkand.md §2): { c, y }; the portal toward the north-east, the sanctuary and its dome toward the qibla (south-west). */
export function bibiKhanym(el, ctx) {
  const { bag, col } = ctx, C = el.c;
  const U = [S, S], V = [-S, S], M = (u, v) => [C[0] + U[0] * u + V[0] * v, C[1] + U[1] * u + V[1] * v];
  const HL = 83.5, HW = 54.5, CV = 39, CU = 32, WH = 14, GH = 7.2, centre = M(0, 0);
  const UV = (u0, v0, u1, v1, y0, y1, mat = B, collide = true) => bar(bag, collide ? col : null, mat, M((u0 + u1) / 2, v0), M((u0 + u1) / 2, v1), Math.abs(u1 - u0), y0, y1, collide);
  // the court
  UV(-CU, -CV, CU, CV, 0, 0.06, 'brick_paving', false);
  // the outer wall, set in by half its thickness so that its face stands on the enclosure's edge
  const wall = (p, q) => nicheWall({ a: p, b: q, facing: centre, h: WH, th: 1.2, bay: 4.6 }, ctx);
  const o = 0.6;
  wall(M(-HW + o, -HL + o), M(-HW + o, HL - o)); wall(M(HW - o, -HL + o), M(HW - o, HL - o));
  wall(M(-HW + o, HL - o), M(HW - o, HL - o));
  wall(M(-HW + o, -HL + o), M(-18, -HL + o)); wall(M(18, -HL + o), M(HW - o, -HL + o));
  // the great portal (35 m), facing north-east, its passage through to the court
  pishtaqOf({ a: M(18, -HL + o), b: M(-18, -HL + o), facing: M(0, -HL - 50), y: 0, h: 35, depth: 16, iwan: { w: 15, h: 28, depth: 9, pass: true, doorH: 8 } }, ctx);
  // the end belts: solid ranges of rooms (the entrance's, the sanctuary's), the passage left open between
  UV(-HW + 2, -HL + 16.5, -9, -CV, 0, WH); UV(9, -HL + 16.5, HW - 2, -CV, 0, WH);
  UV(-HW + 2, CV, HW - 2, HL - 2, 0, WH);
  // the court's faces: the end arcades, the gallery arcades with their bays (pass arches into the covered galleries)
  const gal = (u, v0, v1, ins) => {
    const a = M(u, v0), b = M(u, v1), L = v1 - v0, n = Math.round(L / 4.5), w = L / n, ar = [];
    for (let i = 0; i < n; i++) ar.push({ at: (i + 0.5) * w, w: w * 0.62, h: 5.2, pass: true });
    arcadeWall(bag, col, a, b, 0, GH, 0.8, B, ar, ins);
    bannai(bag, { a, b, n: [-ins[2], -ins[3]], d: 0.4, s0: 0.2, s1: L - 0.2, v0: 5.9, v1: 7.0, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.5, seed: 11 + n });
  };
  const galIn = (u, sgn) => [...M(u + sgn * 100, 0), -U[0] * sgn, -U[1] * sgn];
  void galIn;
  for (const s of [-1, 1]) {
    for (const [v0, v1] of [[-CV, -11], [11, CV]]) {
      const a = M(s * (CU + 0.4), v0), b = M(s * (CU + 0.4), v1), L = v1 - v0, n = Math.round(L / 4.5), w = L / n, ar = [];
      for (let i = 0; i < n; i++) ar.push({ at: (i + 0.5) * w, w: w * 0.62, h: 5.2, pass: true });
      arcadeWall(bag, col, a, b, 0, GH, 0.8, B, ar, centre);
      bannai(bag, { a, b, n: [-s * U[0], -s * U[1]].map((q, i) => (i ? q : q)), d: 0.4, s0: 0.2, s1: L - 0.2, v0: 5.9, v1: 7.0, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.5, seed: 21 + n });
      // the gallery's roof, its small domes in a line, the columns under it
      UV(s * (CU + 0.8), v0, s * (HW - 2.4), v1, GH - 0.8, GH, B, true);
      const um = [s * (CU + 0.8), s * (HW - 2.4)], uw = Math.abs(um[1] - um[0]), rows = Math.max(2, Math.round(uw / 4.5)), nv = Math.round((v1 - v0) / 4.5);
      for (let r = 0; r < rows; r++) for (let j = 0; j < nv; j++) {
        const u = s * (CU + 0.8 + (r + 0.5) * uw / rows), v = v0 + (j + 0.5) * (v1 - v0) / nv, p = M(u, v);
        bag.add('marble', lathe([[0.34, 0], [0.34, 0.25], [0.26, 0.3], [0.26, GH - 1.4], [0.33, GH - 1.3], [0.4, GH - 0.8]], 8, null, p[0], 0, p[1]));
        col.circle(p[0], p[1], 0.36, 0, GH - 0.8);
      }
      for (let j = 0; j < nv; j += 2) { const p = M(s * (HW - 8), v0 + (j + 0.5) * (v1 - v0) / nv); ribbedDome(bag, null, { c: p, y: GH, r: 2.7, h: 3.4, drum: { r: 2.4, h: 1.6 }, ribs: 12, mat: TUR }); }
    }
  }
  // the end arcades: the entrance end's with the way through, the sanctuary end's blind
  { const a = M(-CU, -CV - 0.4), b = M(CU, -CV - 0.4), ar = [];
    for (let i = 0; i < 16; i++) { const at = (i + 0.5) * 4; if (Math.abs(at - 32) < 5) continue; ar.push({ at, w: 2.8, h: 7.5, depth: 0.2, back: 'tile_lapis' }); }
    ar.push({ at: 32, w: 9, h: 10, pass: true });
    arcadeWall(bag, col, a, b, 0, WH, 0.8, B, ar, M(0, -CV - 100));
    bannai(bag, { a, b, n: [-V[0] * -1, -V[1] * -1], d: 0.4, s0: 0.2, s1: 63.8, v0: 11.3, v1: 12.9, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.6, seed: 31 }); }
  { const a = M(-CU, CV + 0.4), b = M(-14, CV + 0.4), b2 = M(14, CV + 0.4), c2 = M(CU, CV + 0.4), ar = [];
    for (const [p, q] of [[a, b], [b2, c2]]) { const L = Math.hypot(q[0] - p[0], q[1] - p[1]), n = 4, w = L / n, aa = []; for (let i = 0; i < n; i++) aa.push({ at: (i + 0.5) * w, w: 2.8, h: 7.5, depth: 0.2, back: 'tile_lapis' }); arcadeWall(bag, col, p, q, 0, WH, 0.8, B, aa, M(0, CV + 100)); }
    void ar; }
  // the sanctuary: the iwan on the court, the great dome behind it (about 40 m outside), 13 m square walls
  pishtaqOf({ a: M(-17, CV + 0.6), b: M(17, CV + 0.6), facing: M(0, 0), y: 0, h: 30, depth: 8, iwan: { w: 14, h: 24, depth: 7, pass: true, doorH: 7 } }, ctx);
  { // the prayer hall under the great dome: 22 × 22 m inside, walls 2 m (3.4 m at the entrance), the passage behind the iwan; built in the enclosure's own frame
    const fr = frame(ctx, C[0], C[1], -0.5), sol = (x0, z0, x1, z1, y0, y1, m = B) => { fr.bag.add(m, box(x0, y0, z0, x1, y1, z1)); fr.col.rect([x0, z0, x1, z1], y0, y1); };
    sol(-13, 47.6, -11, 75, 0, 16); sol(11, 47.6, 13, 75, 0, 16); sol(-11, 73, 11, 75, 0, 16);
    sol(-11, 47.6, -2.3, 51, 0, 16); sol(2.3, 47.6, 11, 51, 0, 16);
    fr.bag.add(B, box(-2.3, 7, 47.6, 2.3, 16, 51)); fr.col.rect([-2.3, 47.6, 2.3, 51], 7, 16);
    fr.bag.add('marble_floor', box(-2.3, 0, 47.4, 2.3, 0.06, 51));
    for (const sgn of [-1, 1]) bannai(fr.bag, { a: [sgn * 13, 60], b: [sgn * 13, 74], n: [sgn, 0], d: 0.02, y: 0, s0: 0.2, s1: 13.8, v0: 13.2, v1: 14.8, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.55, seed: 77 + sgn });
    domeBlock({ c: [0, 62], half: 13, y: 0, walls: false, wallH: 16, trans: 3.5, drum: { r: 8.6, h: 8 }, dome: { r: 10.2, h: 12.5, ribs: 32 } }, { bag: fr.bag, col: fr.col });
    chamber(fr, { c: [0, 62], hx: 11, hz: 11, h: 16, innerR: 8.1, drumH: 12, domeH: 10, ribs: 32, dado: 2.6, doorWall: 2, door: [8.7, 13.3] });
    prayerHall(fr, { c: [0, 62], hx: 11, hz: 11, lampY: 10.5, lampTop: 16 }, fr.lights);
  }
  // the two lesser domes at the middles of the long sides, behind a pishtaq each
  for (const s of [-1, 1]) {
    pishtaqOf({ a: M(s * (CU + 0.6), -11), b: M(s * (CU + 0.6), 11), facing: M(0, 0), y: 0, h: 18, depth: 21, iwan: { w: 10, h: 14, depth: 6 } }, ctx);
    domeBlock({ c: M(s * (CU + 12), 0), half: 9.5, y: 0, wallH: 18, walls: false, trans: 2.5, drum: { r: 6.8, h: 5 }, dome: { r: 8, h: 9, ribs: 24 } }, ctx);
  }
  // four minarets at the corners of the enclosure
  for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tiledMinaret(bag, col, { c: M(su * (HW - 1), sv * (HL - 1)), y: 0, h: 36, r: 2.6 });
  // the marble Qur'an stand in the middle of the court: a platform, two boards leaning on each other
  const q = M(0, 0);
  bag.add('marble', box(q[0] - 1.9, 0, q[1] - 1.9, q[0] + 1.9, 0.55, q[1] + 1.9)); col.rect([q[0] - 1.9, q[1] - 1.9, q[0] + 1.9, q[1] + 1.9], 0, 0.55);
  bag.add('marble', box(q[0] - 1.35, 0.55, q[1] - 1.35, q[0] + 1.35, 0.85, q[1] + 1.35));
  for (const sg of [-1, 1]) { const g = box(-1.2, -0.12, -0.08, 1.2, 0.12, 0.08); g.rotateZ(0); g.translate(0, 0, 0); bag.add('marble', orientedBox([q[0] - U[0] * 1.2 + V[0] * sg * 0.35, q[1] - U[1] * 1.2 + V[1] * sg * 0.35], [q[0] + U[0] * 1.2 + V[0] * sg * 0.35, q[1] + U[1] * 1.2 + V[1] * sg * 0.35], 0.18, 0.85, 1.75 - 0.35 * (sg > 0 ? 0 : 0.2))); }
  col.rect([q[0] - 1.4, q[1] - 1.4, q[0] + 1.4, q[1] + 1.4], 0.55, 1.8);
  void rng; void away; void boxR; void wallRun; void fromTriangles;
}

/** Gur-e Amir: { rect: [x0, z0, x1, z1] }; the court between a madrasa (east) and a khanqah (west), the portal on the north, the mausoleum at the south. */
export function gurEAmir(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, side = 14, cz0 = z0 + 5, mz = z1 - 13;
  const court = [x0 + side, cz0, x1 - side, mz - 13];
  bag.add('brick_paving', boxR(court, 0, 0.06));
  const inC = [cx, (court[1] + court[3]) / 2];
  const nw = (p, q, h, f = inC) => nicheWall({ a: p, b: q, facing: f, h, th: 1.2, bay: 4.2 }, ctx);
  // outer walls
  nw([x0 + 0.6, z0], [x0 + 0.6, z1], 13); nw([x1 - 0.6, z0], [x1 - 0.6, z1], 13); nw([x0, z1 - 0.6], [x1, z1 - 0.6], 12);
  nw([x0, z0 + 0.6], [cx - 6, z0 + 0.6], 11); nw([cx + 6, z0 + 0.6], [x1, z0 + 0.6], 11);
  // the entrance portal on the north
  pishtaqOf({ a: [cx + 6, z0 + 0.6], b: [cx - 6, z0 + 0.6], facing: [cx, z0 - 60], y: 0, h: 17, depth: 5, iwan: { w: 8, h: 12, depth: 3.5, pass: true, doorH: 5 } }, ctx);
  // the madrasa (east) and khanqah (west) blocks: solid ranges with an arcaded two-storey face on the court
  for (const sg of [-1, 1]) {
    const fx = sg > 0 ? x1 - side : x0 + side, bx = sg > 0 ? [fx, x1 - 2] : [x0 + 2, fx];
    solid(bag, col, B, [bx[0], cz0, bx[1], mz - 13], 0, 12.5);
    const a = [fx - sg * 0.4, cz0], b = [fx - sg * 0.4, mz - 13], L = b[1] - a[1], n = Math.round(L / 4.2), w = L / n, ar = [];
    for (let i = 0; i < n; i++) ar.push({ at: (i + 0.5) * w, w: w * 0.6, h: 4.6, sill: 0.3, depth: 0.2, back: 'tile_lapis' }, { at: (i + 0.5) * w, w: w * 0.5, h: 3.2, sill: 6.6, depth: 0.2, back: 'tile_lapis' });
    arcadeWall(bag, col, a, b, 0, 12.5, 0.8, B, ar, [fx + sg * 50, a[1]]);
    bannai(bag, { a, b, n: [-sg, 0], d: 0.4, s0: 0.2, s1: L - 0.2, v0: 11.2, v1: 12.2, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.5, seed: 41 });
  }
  // the khanqah's dome (a lodge's domed hall) and a dome over the madrasa's lecture room
  domeBlock({ c: [x0 + 7, (cz0 + mz - 13) / 2], half: 6, y: 12.5, walls: false, wallH: 0.01, trans: 1.6, drum: { r: 4.4, h: 5 }, dome: { r: 5.3, h: 6.5, ribs: 20 } }, ctx);
  domeBlock({ c: [x1 - 7, (cz0 + mz - 13) / 2 + 8], half: 5, y: 12.5, walls: false, wallH: 0.01, trans: 1.4, drum: { r: 3.6, h: 4 }, dome: { r: 4.4, h: 5.2, ribs: 18 } }, ctx);
  // the south range beside the mausoleum, low
  solid(bag, col, B, [x0 + 2, mz - 13, cx - 13, z1 - 2], 0, 9); solid(bag, col, B, [cx + 13, mz - 13, x1 - 2, z1 - 2], 0, 9);
  const south = (p, q) => nicheWall({ a: p, b: q, facing: [(p[0] + q[0]) / 2, 0], h: 9, th: 1, bay: 4.2, backing: 0, tiers: 1 }, ctx);
  void south;
  // the mausoleum: a square block 26 m across, the pishtaq on the court, the octagon, the tall drum, the ribbed dome
  const A = 13;
  // the walls round the tomb chamber (12 × 12 inside): the entrance through the portal's iwan, a passage in the thick north wall
  solid(bag, col, B, [cx - A, mz - 11.8, cx - 6, mz + A], 0, 12); solid(bag, col, B, [cx + 6, mz - 11.8, cx + A, mz + A], 0, 12);
  solid(bag, col, B, [cx - 6, mz + 6, cx + 6, mz + A], 0, 12);
  solid(bag, col, B, [cx - 6, mz - 11.8, cx - 4.5, mz - 8.2], 0, 12); solid(bag, col, B, [cx + 4.5, mz - 11.8, cx + 6, mz - 8.2], 0, 12);
  solid(bag, col, B, [cx - 6, mz - 8.2, cx - 2.03, mz - 6], 0, 12); solid(bag, col, B, [cx + 2.03, mz - 8.2, cx + 6, mz - 6], 0, 12);
  bag.add(B, box(cx - 2.03, 5.2, mz - 8.2, cx + 2.03, 12, mz - 6)); col.rect([cx - 2.03, mz - 8.2, cx + 2.03, mz - 6], 5.2, 12);
  bag.add('marble_floor', box(cx - 2.03, 0, mz - 8.2, cx + 2.03, 0.06, mz - 6));
  pishtaqOf({ a: [cx - 10, mz - A + 0.6], b: [cx + 10, mz - A + 0.6], facing: [cx, mz - 80], y: 0, h: 16, depth: 4, iwan: { w: 9, h: 12, depth: 3.4, pass: true, doorH: 5.2 } }, ctx);
  { // inside: the finish of the chamber, the cenotaphs, the lamps
    const fr = frame(ctx, 0, 0, 0);
    chamber(fr, { c: [cx, mz], hx: 6, hz: 6, h: 12, innerR: 5.9, drumH: 11, domeH: 8, ribs: 32, doorWall: 2, door: [3.97, 8.03] });
    cenotaph(bag, col, cx, mz, Math.PI / 2, true, 1.0);
    for (const [dx, dz] of [[-3.5, 0.3], [3.5, 0.3], [-1.7, 3.5], [1.7, 3.5], [0, -3.7]]) cenotaph(bag, col, cx + dx, mz + dz, Math.PI / 2, false, 0.92);
    for (const [dx, dz] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) F.mosqueLamp(bag, ctx.lights, cx + dx, 8.2, mz + dz, 12, { k: 1.5, enamel: true, glow: 4, reach: 16 });
    F.mosqueLamp(bag, ctx.lights, cx, 7.0, mz, 12, { k: 1.9, enamel: true, glow: 5, reach: 20 });
  }
  domeBlock({ c: [cx, mz], half: A, y: 0, wallH: 12, walls: false, trans: 3.2, drum: { r: 7.6, h: 11 }, dome: { r: 9, h: 12.5, ribs: 32 } }, ctx);
  // four minarets: two on the portal's flanks, two at the mausoleum's front corners
  for (const [x, z] of [[cx - 7.5, z0 + 1], [cx + 7.5, z0 + 1], [cx - A + 0.5, mz - A + 0.5], [cx + A - 0.5, mz - A + 0.5]]) tiledMinaret(bag, col, { c: [x, z], y: 0, h: 30, r: 2.1 });
}

/**
 * The observatory (docs/settlements/timurid-samarkand.md §2): { c, y (the hilltop), r (23) }: a drum of brick of three
 * storeys, its faces in two tiers of pointed arches, a marble plinth, the roof's parapet; and, on the plateau to its
 * south, the line of the sextant's arc in marble set flush with the ground.
 */
export function observatory(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 0, R = el.r ?? 23, H = el.h ?? 31, N = 32;
  const poly = Array.from({ length: N }, (_, k) => { const a = k / N * Math.PI * 2; return [cx + Math.cos(a) * R, cz + Math.sin(a) * R]; });
  // the drum's mass is a ring of bars round the ground-floor hall (15 m radius), open at the south door (face 8)
  const DOOR = 8, HR = 15, RO = R - 1.1, rc = (HR + RO) / 2, chord = 2 * RO * Math.tan(Math.PI / N) + 0.15;
  for (let j = 0; j < N; j++) {
    const th = (j + 0.5) / N * Math.PI * 2, t = [-Math.sin(th), Math.cos(th)], c = [cx + Math.cos(th) * rc, cz + Math.sin(th) * rc];
    const a = [c[0] - t[0] * chord / 2, c[1] - t[1] * chord / 2], b = [c[0] + t[0] * chord / 2, c[1] + t[1] * chord / 2];
    if (j === DOOR) { bar(bag, col, B, a, b, RO - HR, y + 6.8, y + H); continue; }
    bar(bag, col, B, a, b, RO - HR, y, y + H);
  }
  bag.add('brick_buff', lathe([[R - 1.2, H], [0.001, H]], N, null, cx, y, cz));
  { // the hall: a marble floor, a painted ceiling under the first floor, a central pier with the armillary sphere, tables with astrolabes, star charts
    bag.add('marble_floor', lathe([[HR, 0.06], [0.001, 0.06]], 40, null, cx, y, cz));
    bag.add('ceiling_painted', lathe([[0.001, 9.6], [HR, 9.6]], 40, null, cx, y, cz));
    bag.add('tile_lapis', lathe([[HR - 0.02, 9.6], [HR - 0.02, 8.9]], 40, null, cx, y, cz));
    bag.add('mosaic_gold', lathe([[HR - 0.03, 8.9], [HR - 0.03, 8.8]], 40, null, cx, y, cz));
    bag.add('marble', lathe([[HR - 0.03, 1.6], [HR - 0.03, 0.06]], 40, null, cx, y, cz));
    // pier and armillary sphere: three rings of rods on a bronze stand
    bag.add('brick_buff', lathe([[2.4, 0], [2.4, 0.4], [1.9, 0.5], [1.9, 1.0]], 24, null, cx, y, cz)); col.circle(cx, cz, 2.4, y, y + 1.0);
    bag.add('bronze', lathe([[0.4, 0], [0.4, 0.1], [0.1, 0.2], [0.1, 0.9]], 12, null, cx, y + 1.0, cz));
    const ring = (rad, tilt, spin) => { const P = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; let px = Math.cos(a) * rad, py = Math.sin(a) * rad, pz = 0; const y1 = py * Math.cos(tilt) - pz * Math.sin(tilt), z1 = py * Math.sin(tilt) + pz * Math.cos(tilt); py = y1; pz = z1; const x2 = px * Math.cos(spin) + pz * Math.sin(spin), z2 = -px * Math.sin(spin) + pz * Math.cos(spin); P.push([cx + x2, y + 2.2 + py, cz + z2]); } for (let i = 0; i < 28; i++) bag.add('bronze', rod(P[i], P[(i + 1) % 28], 0.025, 4)); };
    ring(0.9, 0, 0); ring(0.9, Math.PI / 2, 0); ring(0.9, Math.PI / 2, Math.PI / 2); ring(0.7, 0.41, 0.6);
    bag.add('gilt_bronze', lathe([[0.001, -0.12], [0.12, 0], [0.001, 0.12]], 10, null, cx, y + 2.2, cz));
    bag.add('bronze', rod([cx, y + 1.9, cz], [cx, y + 2.5, cz], 0.02, 4));
    for (let i = 0; i < 6; i++) {
      const a = (i + 0.5) / 6 * Math.PI * 2 + 0.3, tx = cx + Math.cos(a) * 9, tz = cz + Math.sin(a) * 9;
      bag.add('wood_dark', box(tx - 0.9, y + 0.74, tz - 0.5, tx + 0.9, y + 0.8, tz + 0.5));
      for (const [dx, dz] of [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]]) bag.add('wood_dark', box(tx + dx - 0.035, y, tz + dz - 0.035, tx + dx + 0.035, y + 0.74, tz + dz + 0.035));
      col.rect([tx - 0.9, tz - 0.5, tx + 0.9, tz + 0.5], y, y + 0.8);
      F.rahle(bag, tx - 0.4, y + 0.8, tz, a); bag.add('bronze', lathe([[0.001, 0], [0.15, 0], [0.16, 0.015], [0.001, 0.02]], 14, null, tx + 0.35, y + 0.8, tz)); bag.add('bronze', lathe([[0.001, 0.02], [0.13, 0.02], [0.001, 0.05]], 14, null, tx + 0.35, y + 0.8, tz));
      F.cushion(bag, tx, y + 0.07, tz + (a > 3 ? 0.9 : -0.9), 0.7, 0.55, 0.12, a, 'cloth_indigo');
    }
    // star charts on the wall: a lapis disc ringed with gold, gilt stars
    for (const a0 of [0.2, 1.4, 2.6, 3.9, 5.1]) {
      const wx = cx + Math.cos(a0) * (HR - 0.05), wz = cz + Math.sin(a0) * (HR - 0.05), yaw = -a0 - Math.PI / 2;
      const d1 = lathe([[0.001, 0], [1.3, 0], [1.3, 0.04], [0.001, 0.04]], 24); d1.rotateX(Math.PI / 2); bag.add('tile_lapis', place(d1, wx - Math.cos(a0) * 0.05, y + 3.2, wz - Math.sin(a0) * 0.05, yaw));
      const d2 = lathe([[1.3, 0.06], [1.45, 0.06], [1.45, 0], [1.3, 0]], 24); d2.rotateX(Math.PI / 2); bag.add('mosaic_gold', place(d2, wx - Math.cos(a0) * 0.05, y + 3.2, wz - Math.sin(a0) * 0.05, yaw));
      for (let i = 0; i < 14; i++) { const q = i * 2.4, rr = 0.2 + (i % 5) * 0.2; bag.add('mosaic_gold', place(box(-0.04, -0.04, 0.045, 0.04, 0.04, 0.06), wx - Math.cos(a0) * 0.05 + Math.cos(q) * rr * -Math.sin(a0) * -1, y + 3.2 + Math.sin(q) * rr, wz - Math.sin(a0) * 0.05 + Math.cos(q) * rr * Math.cos(a0), yaw)); }
    }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.8; F.mosqueLamp(bag, ctx.lights, cx + Math.cos(a) * 6, y + 6.2, cz + Math.sin(a) * 6, y + 9.6, { k: 1.4, enamel: true, glow: 4, reach: 14 }); }
  }
  // the plinth: two steps of marble
  bag.add('marble', lathe([[R + 3.2, 0], [R + 3.2, 0.3], [R + 1.8, 0.3], [R + 1.8, 0.6], [R + 0.5, 0.6]], 48, null, cx, y, cz));
  col.circle(cx, cz, R + 3.2, y, y + 0.3); col.circle(cx, cz, R + 1.8, y, y + 0.6);
  for (let k = 0; k < N; k++) {
    const p = poly[k], q = poly[(k + 1) % N], ar = [], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    ar.push(k === DOOR ? { at: L / 2, w: L * 0.42, h: 6.6, pass: true } : { at: L / 2, w: L * 0.5, h: 7.5, sill: 0.6, depth: 0.3, back: 'tile_lapis' }, { at: L / 2, w: L * 0.46, h: 6.8, sill: 9.8, depth: 0.3, back: 'kahgel' }, { at: L / 2, w: L * 0.44, h: 6.5, sill: 18.8, depth: 0.3, back: 'kahgel' });
    arcadeWall(bag, col, p, q, y, H, 2.2, B, ar, [cx, cz], undefined);
    const mx = (p[0] + q[0]) / 2 - cx, mz = (p[1] + q[1]) / 2 - cz, ml = Math.hypot(mx, mz);
    bannai(bag, { a: p, b: q, n: [mx / ml, mz / ml], d: 1.1, y, s0: 0.3, s1: L - 0.3, v0: H - 1.7, v1: H - 0.6, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.55, seed: k + 1 });
    bannai(bag, { a: p, b: q, n: [mx / ml, mz / ml], d: 1.1, y, s0: 0.3, s1: L - 0.3, v0: 8.5, v1: 9.1, kind: 'checker', base: LAP, ink: TUR, alt: WHI, cell: 0.3 });
  }
  bag.add(B, lathe([[R + 0.2, H - 0.1], [R + 0.9, H], [R + 0.9, H + 1.1], [R - 0.2, H + 1.1]], N, null, cx, y, cz));
  // the sextant's arc on the plateau: a strip of marble (2 m wide) along an arc of 40 m radius, 70° of it, due south of the drum
  const r0 = 40, tris = [], n = 28, a0 = Math.PI / 2 - 0.61, a1 = Math.PI / 2 + 0.61;
  for (let i = 0; i < n; i++) {
    const t0 = a0 + (a1 - a0) * i / n, t1 = a0 + (a1 - a0) * (i + 1) / n;
    const P = (t, r) => [cx + Math.cos(t) * r, y + 0.07, cz + Math.sin(t) * r];
    const A1 = P(t0, r0 - 1), B1 = P(t0, r0 + 1), C1 = P(t1, r0 + 1), D1 = P(t1, r0 - 1);
    tris.push(...A1, ...C1, ...B1, ...A1, ...D1, ...C1);
  }
  bag.add('marble', fromTriangles(tris));
  // its degree marks: small cross-pieces of dark brick every 2.5°
  for (let k = 0; k <= 28; k++) { const t = a0 + (a1 - a0) * k / 28, p0 = [cx + Math.cos(t) * (r0 - 1), cz + Math.sin(t) * (r0 - 1)], p1 = [cx + Math.cos(t) * (r0 + 1.2), cz + Math.sin(t) * (r0 + 1.2)]; bag.add('lacquer_black', orientedBox(p0, p1, 0.08, y + 0.07, y + 0.1)); }
}

/**
 * The chorsu { c, r (12), h (9) }: an octagonal hall of brick where the bazaar's four streets cross, a way through on each
 * cardinal side, a shop recess on each diagonal, a ceiling painted in ochre, a ribbed dome on a drum over it (the light's source).
 */
export function chorsu(el, { bag, col, lights }) {
  const [cx, cz] = el.c, r = el.r ?? 12, h = el.h ?? 9, N = 8;
  const pts = Array.from({ length: N }, (_, k) => { const a = (k + 0.5) / N * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
  bag.add('brick_paving', lathe([[0.01, 0], [r * 1.0, 0.0], [r * 1.0, 0.06]], N, null, cx, 0, cz));
  for (let k = 0; k < N; k++) {
    const p = pts[k], q = pts[(k + 1) % N], L = Math.hypot(q[0] - p[0], q[1] - p[1]), card = k % 2 === 0, ar = [];
    // sides 0, 2, 4, 6 face the cardinal ways (centres at angle 22.5°+... ) – the sides are centred at (k + 1) / N turns
    ar.push(card ? { at: L / 2, w: 5.6, h: 6.2, pass: true } : { at: L / 2, w: 5.4, h: 4.2, sill: 0.3, depth: 0.3, back: 'tile_lapis' });
    arcadeWall(bag, col, p, q, 0, h, 1.2, B, ar, [cx, cz]);
    const mx = (p[0] + q[0]) / 2 - cx, mz = (p[1] + q[1]) / 2 - cz, ml = Math.hypot(mx, mz);
    bannai(bag, { a: p, b: q, n: [mx / ml, mz / ml], d: 0.6, s0: 0.2, s1: L - 0.2, v0: h - 1.5, v1: h - 0.5, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.5, seed: k + 61 });
    if (!card) {
      // a shop recess: a platform and the goods of its trade
      const c = [(p[0] + q[0]) / 2 - mx / ml * 0.9, (p[1] + q[1]) / 2 - mz / ml * 0.9], yaw = Math.atan2(-mx, -mz);
      if (k === 1 || k === 5) F.rolledCarpets(bag, c[0], 0, c[1], 4, 1.6, yaw); else F.copperware(bag, c[0], 0, c[1], yaw, k, 5);
    }
  }
  // the roof, the ceiling under it, the dome and its drum
  const ro = [], ri = [];
  for (const [p] of pts.map((p) => [p])) ro.push(p);
  bag.add(B, lathe([[r * 1.08, h - 0.2], [r * 1.08, h + 0.5], [r * 0.5, h + 0.9], [r * 0.5, h + 0.9]], N, (th) => 1, cx, 0, cz));
  bag.add('ceiling_painted', lathe([[r * 1.0, h - 0.3], [0.01, h - 0.3]], N, null, cx, 0, cz));
  col.circle(cx, cz, 0.01, 0, 0.01);
  ribbedDome(bag, null, { c: [cx, cz], y: h + 0.9, r: r * 0.62, h: r * 0.62, drum: { r: r * 0.5, h: 3.2 }, ribs: 20, mat: B });
  void ro; void ri; void lights;
}

/**
 * shop_row: a row of open shops { rect: [x0, z0, x1, z1], front ('s' or 'n'), unit (3.6), enter (the index of the
 * furnished one), seed }: each a recess of brick under a timber lintel, a raised sill, the goods of its trade on shelves
 * and the floor; the shopkeeper's carpet; the entered shop with its scale, shelves, kettle and lamp.
 */
export function shopRow(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, front = el.front ?? 's', nU = Math.max(1, Math.round((x1 - x0) / (el.unit ?? 3.6))), w = (x1 - x0) / nU, rand = rng(el.seed ?? 1);
  const H = 3.4, T = 0.4, back = front === 's' ? z0 : z1, fz = front === 's' ? z1 : z0, sg = front === 's' ? 1 : -1, D = Math.abs(fz - back);
  const Z = (d) => back + sg * d;
  const R = (xa, da, xb, db) => [Math.min(xa, xb), Math.min(Z(da), Z(db)), Math.max(xa, xb), Math.max(Z(da), Z(db))];
  // the back wall, the posts and partitions, the roof, the lintel and cornice
  solid(bag, col, B, R(x0, 0, x1, 0.6), 0, H + 1.6);
  for (let i = 0; i <= nU; i++) solid(bag, col, B, R(x0 + i * w - T / 2, 0.6, x0 + i * w + T / 2, D - 0.3), 0, H);
  bag.add(B, boxR(R(x0, 0.6, x1, D), H, H + 0.5)); col.rect(R(x0, 0.6, x1, D), H, H + 0.5);
  bag.add('timber', boxR(R(x0, D - 0.3, x1, D), H - 0.4, H)); col.rect(R(x0, D - 0.3, x1, D), H - 0.4, H);
  bannai(bag, { a: [x0, fz], b: [x1, fz], n: [0, sg], d: 0.0, y: 0, s0: 0.1, s1: x1 - x0 - 0.1, v0: H + 0.55, v1: H + 1.2, kind: 'checker', base: LAP, ink: TUR, alt: WHI, cell: 0.36 });
  const trades = ['cloth', 'carpets', 'copper', 'pots', 'spice'], inner = (i) => [x0 + i * w + T / 2 + 0.1, x0 + (i + 1) * w - T / 2 - 0.1];
  for (let i = 0; i < nU; i++) {
    const [ia, ib] = inner(i), xc = (ia + ib) / 2, kind = trades[Math.floor(rand() * trades.length)], yaw = front === 's' ? 0 : Math.PI;
    // the sill platform (the shopkeeper's seat) along the front
    bag.add('timber', boxR(R(ia, D - 1.3, ib, D - 0.3), 0, 0.5)); col.rect(R(ia, D - 1.3, ib, D - 0.3), 0, 0.5);
    F.carpet(bag, xc, 0.5, Z(D - 0.8), (ib - ia) * 0.7, 0.8, yaw, ['persian', 'maroon', 'blue'][i % 3]);
    // shelves on the back wall, the goods
    bag.add('wood_dark', boxR(R(ia, 0.6, ib, 1.0), 1.1, 1.16)); bag.add('wood_dark', boxR(R(ia, 0.6, ib, 1.0), 2.0, 2.06));
    const gz = Z(1.3);
    if (kind === 'cloth') { F.bolts(bag, xc, 1.16, Z(0.8), 5, yaw, undefined, 0.5); F.bolts(bag, xc, 2.06, Z(0.8), 4, yaw); F.bale(bag, ia + 0.5, 0, gz, 0.6, 0.45, 0.5, 0, 'cloth_indigo'); }
    else if (kind === 'carpets') { F.rolledCarpets(bag, xc, 0, gz, 4, 1.5, yaw); F.kilim(bag, xc, 1.16, Z(0.8), 1.2, 0.5, yaw); }
    else if (kind === 'copper') { F.copperware(bag, xc, 1.16, Z(0.8), yaw, i, 5); F.copperware(bag, xc, 2.06, Z(0.8), yaw, i + 3, 4); F.copperware(bag, ia + 0.5, 0, gz, yaw, i + 7, 3); }
    else if (kind === 'pots') { F.pots(bag, xc, 1.16, Z(0.8), yaw, 5); F.pots(bag, ia + 0.6, 0, gz, yaw, 4); F.pots(bag, ib - 0.6, 0, gz, yaw, 3); }
    else { F.spiceSacks(bag, ia + 0.7, 0, gz, yaw, 4); F.pots(bag, xc, 1.16, Z(0.8), yaw, 4, ['terracotta', 'glaze_white', 'terracotta']); }
    // the awning over the sill (cloth in the wind with a valance) on posts, the goods hung from the lintel, a basket at the foot
    {
      const AW = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_white'][Math.floor(rand() * 6)], xa = x0 + i * w + 0.1, xb = x0 + (i + 1) * w - 0.1;
      const za = Math.min(fz, fz + sg * 1.8), zb = Math.max(fz, fz + sg * 1.8);
      addCloth(bag, AW, clothBox(xa, 2.72, za, xb, 2.77, zb, 0.3), 2.77);
      addCloth(bag, AW, clothBox(xa, 2.38, fz + sg * 1.8 - 0.03, xb, 2.72, fz + sg * 1.8 + 0.03, 0.17), 2.72);
      if (i % 2 === 0) for (const px of [xa + 0.05, xb - 0.05]) { const pz = fz + sg * 1.75; bag.add('timber', box(px - 0.04, 0, pz - 0.04, px + 0.04, 2.76, pz + 0.04)); col.circle(px, pz, 0.06, 0, 2.7); }
      const hz = fz - sg * 0.12, hx = (kind === 'carpets' ? 0.3 : 0.45);
      if (kind === 'carpets') hungCarpet(bag, ia + hx + 0.3, 2.95, hz, 1.0, 1.5, front === 's' ? 0 : Math.PI, rand);
      else if (kind === 'cloth') for (let k2 = 0; k2 < 3; k2++) addCloth(bag, ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white'][(i + k2) % 4], clothBox(ia + 0.15 + k2 * 0.34, 1.7, hz - 0.03, ia + 0.4 + k2 * 0.34, 2.95, hz + 0.03), 2.95);
      else if (kind === 'copper') for (let k2 = 0; k2 < 4; k2++) bag.add('bronze', place(lathe([[0.001, 0], [0.2, 0], [0.22, 0.03], [0.001, 0.012]], 14, null, 0, 0, 0), ia + 0.4 + k2 * 0.6 * (w - 0.9) / 2.1 * 0.5, 2.1 + (k2 % 2) * 0.45, hz + sg * 0.03));
      else if (kind === 'spice') for (let k2 = 0; k2 < 5; k2++) addCloth(bag, k2 % 2 ? 'cloth_red' : 'cloth_ochre', clothBox(ia + 0.2 + k2 * 0.55 * (w - 0.9) / 2.7, 2.2, hz - 0.04, ia + 0.34 + k2 * 0.55 * (w - 0.9) / 2.7, 2.95, hz + 0.04), 2.95);
      else for (let k2 = 0; k2 < 4; k2++) bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.04], [0.14, 0.15], [0.1, 0.24], [0.001, 0.26]], 8, null, ia + 0.35 + k2 * 0.45 * (w - 0.9) / 2.0, 2.5 - 0.05 * (k2 % 2), hz + sg * 0.06));
      if (i % 2 === 1) { const bxp = xa + 0.35, bzp = fz + sg * 0.6; bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.27, 0.2], [0.26, 0.26], [0.22, 0.24], [0.001, 0.2]], 10, null, bxp, 0, bzp)); bag.add(['cloth_red', 'cloth_ochre', 'cloth_green'][i % 3], lathe([[0.22, 0.22], [0.15, 0.32], [0.001, 0.36]], 10, null, bxp, 0, bzp)); }
    }
    if (i === (el.enter ?? 3)) {
      // the entered shop: a balance on the sill, a kettle on a brazier, a lamp, a chest
      F.trayTable(bag, xc + 0.4, 0.5, Z(D - 0.8), { seed: i });
      F.brazier(bag, lights, ia + 0.5, 0, Z(D - 1.9), 0.2); F.ewer(bag, ia + 0.5, 0.5, Z(D - 1.9), 0.8, 0, 'bronze');
      F.chest(bag, ib - 0.5, 0, Z(1.4), 0.9, 0.5, 0.6, yaw); F.oilLamp(bag, lights, xc, 2.06, Z(0.8), 'bronze', 1.2);
    }
  }
}

/** Ulugh Beg's khanqah { rect: [x0, z0, x1, z1] }, its portal on the west (the Registan's side): a domed lodge. */
export function khanqah(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, zm = (z0 + z1) / 2, c = [(x0 + x1) / 2, zm], h = 14;
  const nw = (p, q, tiers = 2, bk = 0) => nicheWall({ a: p, b: q, facing: c, h, th: 1.2, bay: 4.4, backing: bk, tiers }, ctx);
  nw([x0 + 0.6, z0], [x0 + 0.6, zm - 7]); nw([x0 + 0.6, zm + 7], [x0 + 0.6, z1]);
  nw([x0, z0 + 0.6], [x1, z0 + 0.6]); nw([x0, z1 - 0.6], [x1, z1 - 0.6]); nw([x1 - 0.6, z0], [x1 - 0.6, z1]);
  pishtaqOf({ a: [x0 + 0.6, zm + 7], b: [x0 + 0.6, zm - 7], facing: [x0 - 50, zm], y: 0, h: 19, depth: 9, iwan: { w: 8, h: 13, depth: 5 } }, ctx);
  solid(bag, col, B, [x0 + 1.2, z0 + 1.2, x0 + 9.6, zm - 7.6], 0, h); solid(bag, col, B, [x0 + 1.2, zm + 7.6, x0 + 9.6, z1 - 1.2], 0, h);
  solid(bag, col, B, [x0 + 9.6, z0 + 1.2, x1 - 1.2, z1 - 1.2], 0, h);
  domeBlock({ c: [x1 - 11, zm], half: 8, y: h - 1, walls: false, wallH: 1, trans: 2, drum: { r: 6, h: 7 }, dome: { r: 7.4, h: 9.5, ribs: 24 } }, ctx);
  for (const z of [z0, z1]) tiledMinaret(bag, col, { c: [x0, z], y: 0, h: 26, r: 1.8 });
}
