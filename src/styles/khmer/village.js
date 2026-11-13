// The village of Angkor (docs/settlements/angkor.md §15): houses of timber on posts with a floor of
// planks 2–2.5 m up, walls of plank or woven bamboo with a door and shuttered windows, a deck at the
// door reached by a plank stair, a steep roof of palm thatch with a ridge roll and crossed finials;
// the space under the floor used (water jars, mortar and pestle, firewood); inside, sleeping mats,
// the hearth tray, a shelf of baskets, a hung cloth. The raised granary, the open sala (rest house),
// the lotus pond. Everything stands on the ground it is given and the floors, steps and doors are
// walkable.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import { tube, slathe } from '../../objects/kit.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FRONT = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] };

/** A house's local frame: u across the front, v out of the front; R(u0, u1, v0, v1) the world rectangle, W(u, v) the world point. */
export function frame(rect, front) {
  const F = FRONT[front] ?? FRONT.e, S = [-F[1], F[0]], cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2;
  const W = (u, v) => [cx + F[0] * v + S[0] * u, cz + F[1] * v + S[1] * u];
  const R = (u0, u1, v0, v1) => { const a = W(u0, v0), b = W(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const hF = Math.abs(F[0]) ? (rect[2] - rect[0]) / 2 : (rect[3] - rect[1]) / 2, hS = Math.abs(F[0]) ? (rect[3] - rect[1]) / 2 : (rect[2] - rect[0]) / 2;
  return { F, S, cx, cz, W, R, hF, hS };
}
export const boxR = (r, y0, y1) => box(r[0], y0, r[1], r[2], y1, r[3]);
/** A solid slab of thatch or board, as a box tilted by `drop` over its length along v: a quad prism. */
export function jar(bag, x, z, y, s, mat = 'terracotta') {
  bag.add(mat, lathe([[0.001, 0], [0.2 * s, 0.01], [0.3 * s, 0.14 * s], [0.34 * s, 0.34 * s], [0.28 * s, 0.56 * s], [0.2 * s, 0.64 * s], [0.23 * s, 0.68 * s], [0.2 * s, 0.7 * s], [0.15 * s, 0.66 * s]], 12, null, x, y, z));
}

/**
 * stilt_house: { rect, front, seed, kind ('plain' | 'big' | 'small') } — see the head of this file.
 */
/** The front design of a house: el.variant ('plain' | 'porch' | 'shop' | 'tile') or, by its seed, one of them; a small house has none. */
export const VARIANTS = ['plain', 'porch', 'shop', 'tile'];
export function variantOf(el) {
  if ((el.kind ?? 'plain') === 'small') return 'plain';
  return el.variant ?? VARIANTS[Math.floor(rng((el.seed || 1) * 7919 + 13)() * VARIANTS.length)];
}
/** The height of the floor above the ground (the first draw of the house's own stream; the tile house stands higher). */
export function houseUp(el) { return 2.0 + rng(el.seed || 1)() * 0.45 + (variantOf(el) === 'tile' ? 0.35 : 0); }
export function stiltHouse(el, { bag, col, lights }) {
  const rand = rng(el.seed || 1), { F, W, R, hF, hS } = frame(el.rect, el.front), kind = el.kind ?? 'plain', variant = variantOf(el);
  const up = houseUp(el), wallH = kind === 'small' ? 2.0 : variant === 'tile' ? 2.45 : 2.25, top = up + wallH;
  rand();                                                                       // (the floor's height, drawn above)
  const w0 = rand() < 0.5, wall = variant === 'tile' ? 'timber_red' : variant === 'porch' ? 'planks_grey' : variant === 'shop' ? 'wood_ochre' : w0 ? 'reed_mat' : 'timber';
  const th = 0.07, deck = kind === 'small' ? 0 : 0.95, doorW = 0.5, doorH = 1.85;
  // ── the posts: the perimeter ones rise to the eaves, the inner ones carry the floor
  const nu = hS > 2.3 ? 3 : 2, nv = hF > 3 ? 4 : 3;
  for (let i = 0; i <= nv; i++) for (let j = 0; j <= nu; j++) {
    const v = -hF + 2 * hF * i / nv, u = -hS + 2 * hS * j / nu, edge = i === 0 || i === nv || j === 0 || j === nu, [x, z] = W(u, v);
    bag.add('timber', lathe([[0.13, 0], [0.115, up * 0.5], [0.11, edge ? top : up - 0.02]], 6, null, x, 0, z));
    col.circle(x, z, 0.15, 0, up);
  }
  // the floor: bearers and planks, a slight overhang
  for (let j = 0; j <= nu; j++) { const u = -hS + 2 * hS * j / nu; bag.add('timber', boxR(R(u - 0.08, u + 0.08, -hF - 0.05, hF + 0.05), up - 0.32, up - 0.15)); }
  bag.add('timber', boxR(R(-hS - 0.12, hS + 0.12, -hF - 0.12, hF + 0.12), up - 0.15, up));
  // the floor's edge beams
  col.floor(R(-hS - 0.1, hS + 0.1, -hF - 0.1, hF + 0.1), up);
  // ── the walls
  const side = (s) => {
    // a side wall (u = s·hS) with a shuttered window if long enough
    const u = s * hS, u0 = u - th / 2, u1 = u + th / 2;
    if (hF > 2.6) {
      const w0 = -hF * 0.3 * (s < 0 ? -1 : 1), a = w0 - 0.45, b = w0 + 0.45, sill = up + 0.95, head = up + 1.65;
      for (const [v0, v1, y0, y1] of [[-hF, a, up, top], [b, hF, up, top], [a, b, up, sill], [a, b, head, top]]) {
        bag.add(wall, boxR(R(u0, u1, v0, v1), y0, y1));
        if (y0 === up && y1 === top) col.rect(R(u0, u1, v0, v1), up, top); else col.rect(R(u0, u1, v0, v1), y0, y1);
      }
      // the shutter propped open on a stick: a plank leaf hinged at the head, standing out and up
      const p0 = W(u + s * 0.04, a), p1 = W(u + s * 0.04, b);
      void p0; void p1;
      const out = s, q0 = W(u + out * (th / 2 + 0.01), w0), q1 = W(u + out * 0.75, w0);
      const t = [];
      beamTris(t, [q0[0], head + 0.02, q0[1]], [q1[0], head + 0.34, q1[1]], 0.43, 0.035);
      bag.add('timber', fromTriangles(t));
      bag.add('timber', boxR(R(u - 0.1, u + 0.1, a - 0.06, a), sill - 0.04, head)); bag.add('timber', boxR(R(u - 0.1, u + 0.1, b, b + 0.06), sill - 0.04, head));
      bag.add('timber', boxR(R(u - 0.12, u + 0.12, a - 0.06, b + 0.06), sill - 0.07, sill));
    } else { bag.add(wall, boxR(R(u0, u1, -hF, hF), up, top)); col.rect(R(u0, u1, -hF, hF), up, top); }
  };
  side(-1); side(1);
  bag.add(wall, boxR(R(-hS, hS, -hF - th / 2, -hF + th / 2), up, top)); col.rect(R(-hS, hS, -hF - th / 2, -hF + th / 2), up, top);
  // the front wall with its door
  const fv0 = hF - th / 2, fv1 = hF + th / 2;
  for (const [u0, u1] of [[-hS, -doorW], [doorW, hS]]) { bag.add(wall, boxR(R(u0, u1, fv0, fv1), up, top)); col.rect(R(u0, u1, fv0, fv1), up, top); }
  bag.add(wall, boxR(R(-doorW, doorW, fv0, fv1), up + doorH, top)); col.rect(R(-doorW, doorW, fv0, fv1), up + doorH, top);
  for (const s of [-1, 1]) bag.add('timber', boxR(R(s * doorW - 0.06 + (s > 0 ? 0.06 : -0.06), s * doorW + 0.06 + (s > 0 ? 0.06 : -0.06), hF - 0.1, hF + 0.1), up, up + doorH + 0.08));
  bag.add('timber', boxR(R(-doorW - 0.12, doorW + 0.12, hF - 0.1, hF + 0.1), up + doorH, up + doorH + 0.12));
  // a door leaf standing open against the inside of the front wall
  bag.add('timber', boxR(R(doorW - 0.02, doorW + 0.02, hF - 0.9, hF - 0.1), up, up + doorH - 0.05));
  // the top plate and the sill beam all round
  for (const [u0, u1, v0, v1] of [[-hS - 0.06, hS + 0.06, -hF - 0.08, -hF + 0.08], [-hS - 0.06, hS + 0.06, hF - 0.08, hF + 0.08], [-hS - 0.08, -hS + 0.08, -hF, hF], [hS - 0.08, hS + 0.08, -hF, hF]]) {
    bag.add('timber', boxR(R(u0, u1, v0, v1), top - 0.12, top));
    bag.add('timber', boxR(R(u0, u1, v0, v1), up, up + 0.1));
  }
  // woven wall: the frame's rails at the knee and the breast
  if (wall === 'reed_mat') for (const y of [up + 0.9, up + 1.5]) for (const s of [-1, 1]) bag.add('bamboo_culm', boxR(R(s * hS - 0.05 - (s > 0 ? -0.04 : 0.04), s * hS + 0.05 - (s > 0 ? -0.04 : 0.04), -hF, hF), y, y + 0.05));
  // ── the deck at the door, its rail, the stair
  const run = 0.34, nSteps = Math.ceil(up / 0.3), rise = up / nSteps, vd = hF + deck;
  if (deck) {
    const dw = Math.min(hS, 1.7);
    bag.add('timber', boxR(R(-dw, dw, hF, vd), up - 0.15, up));
    col.floor(R(-dw, dw, hF, vd), up);
    for (const s of [-1, 1]) {
      const [x, z] = W(s * dw, vd);
      bag.add('timber', lathe([[0.1, 0], [0.09, up + 0.95]], 6, null, x, 0, z)); col.circle(x, z, 0.13, 0, up);
      bag.add('timber', boxR(R(s * dw - 0.045, s * dw + 0.045, hF, vd), up + 0.88, up + 0.96));
      bag.add('timber', boxR(R(s * dw - 0.025, s * dw + 0.025, hF, vd), up + 0.4, up + 0.45));
      col.segment(W(s * dw, hF), W(s * dw, vd), 0.1, up, up + 1.0);
      // the front rail on either side of the stair
      bag.add('timber', boxR(R(s * 0.55, s * dw, vd - 0.045, vd + 0.045), up + 0.88, up + 0.96));
      col.segment(W(s * 0.55, vd), W(s * dw, vd), 0.1, up, up + 1.0);
    }
    // the stair: treads on two stringers, rails either side
    const t = [];
    for (const s of [-1, 1]) {
      const a = W(s * 0.5, vd), b = W(s * 0.5, vd + run * nSteps);
      beamTris(t, [a[0], up - 0.05, a[1]], [b[0], 0.1, b[1]], 0.035, 0.17);
      beamTris(t, [a[0], up + 0.85, a[1]], [b[0], 0.95, b[1]], 0.03, 0.06);
      const p = W(s * 0.5, vd + run * nSteps - 0.04);
      bag.add('timber', lathe([[0.06, 0], [0.05, 0.95 + 0.06]], 5, null, p[0], 0, p[1]));
    }
    bag.add('timber', fromTriangles(t));
    for (let k = 1; k < nSteps; k++) {
      const v0 = vd + (k - 1) * run, v1 = v0 + run + 0.02, y = up - k * rise;
      bag.add('timber', boxR(R(-0.5, 0.5, v0, v1), y - 0.05, y));
      col.floor(R(-0.5, 0.5, v0, v1), y);
    }
    col.floor(R(-0.5, 0.5, vd + (nSteps - 1) * run, vd + nSteps * run + 0.5), 0);
  }
  // ── the roof of palm thatch: a ridge roll and crossed finials at the gable ends
  const along = Math.abs(F[0]) ? false : true;                       // is the front axis z? then the ridge runs along x unless the rectangle is taller
  const long = el.rect[2] - el.rect[0] >= el.rect[3] - el.rect[1];
  void along;
  const cx = (el.rect[0] + el.rect[2]) / 2, cz = (el.rect[1] + el.rect[3]) / 2, A = (long ? el.rect[2] - el.rect[0] : el.rect[3] - el.rect[1]) / 2 + 0.85, B = (long ? el.rect[3] - el.rect[1] : el.rect[2] - el.rect[0]) / 2 + 0.95, rise2 = B * 1.15;
  const tiled = variant === 'tile';
  rectRoof({ c: [cx, cz], A, B, y: top, rise: tiled ? rise2 * 0.8 : rise2, kind: tiled ? 'hip' : 'gable', sweep: 0, curl: false, p: 1.05, alongZ: !long, mat: tiled ? 'roof_tile' : 'thatch_palm', soffit: tiled ? 'timber' : 'thatch_palm' }, bag);
  if (!tiled) {
    const ry = top + rise2, ends = long ? [[cx - A, cz], [cx + A, cz]] : [[cx, cz - A], [cx, cz + A]], d = long ? [1, 0] : [0, 1], ridge = [];
    const a = [cx - d[0] * (A - 0.1), ry + 0.04, cz - d[1] * (A - 0.1)], b = [cx + d[0] * (A - 0.1), ry + 0.04, cz + d[1] * (A - 0.1)];
    beamTris(ridge, a, b, 0.17, 0.2);
    bag.add('thatch_palm', fromTriangles(ridge));
    // the crossed boards of the gable's end, rising past the ridge
    for (const [ex, ez] of ends) {
      const sg = (long ? ex > cx : ez > cz) ? 1 : -1, t = [];
      for (const lean of [-1, 1]) {
        const p0 = [ex - d[0] * sg * 0.1 + (long ? 0 : lean * 0.05), ry - 0.35, ez - d[1] * sg * 0.1 + (long ? lean * 0.05 : 0)], p1 = [ex + d[0] * sg * 0.28 + (long ? 0 : lean * 0.55), ry + 0.75, ez + d[1] * sg * 0.28 + (long ? lean * 0.55 : 0)];
        beamTris(t, p0, p1, 0.03, 0.1);
      }
      bag.add('timber', fromTriangles(t));
    }
  }
  // ── under the house: water jars by the stair, a mortar and its pestle, firewood, a basket
  if (deck) for (const s of [-1, 1]) if (rand() < 0.75) { const [x, z] = W(s * 1.1, vd + 0.5 + rand() * 0.5); jar(bag, x, z, 0, 0.9 + rand() * 0.25, rand() < 0.5 ? 'terracotta' : 'pottery_dark'); col.circle(x, z, 0.3, 0, 0.7); }
  {
    const [x, z] = W((rand() - 0.5) * hS, -hF + 1.0 + rand() * 0.8);
    bag.add('laterite', lathe([[0.001, 0], [0.2, 0], [0.23, 0.12], [0.2, 0.34], [0.26, 0.4], [0.2, 0.4], [0.12, 0.3], [0.001, 0.3]], 8, null, x, 0, z));
    const p = [];
    beamTris(p, [x + 0.05, 0.3, z], [x + 0.32, 1.25, z + 0.1], 0.035, 0.07);
    bag.add('timber', fromTriangles(p));
  }
  if (rand() < 0.7) {
    const [x, z] = W(-hS + 0.5, -hF + 0.4);
    const f = [];
    for (let k = 0; k < 4; k++) f.push(boxR(R(-hS + 0.25 + k * 0.01, -hS + 0.75, -hF + 0.2 + k * 0.01, -hF + 0.45 + k * 0.01), k * 0.13, k * 0.13 + 0.1));
    for (const g of f) bag.add('timber', g);
    void x; void z;
  }
  // ── inside: sleeping mats with a rolled pillow, the hearth tray with its pot, a shelf of baskets, a hung cloth
  const cloth = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_brown'];
  for (const [u, v, w2, l] of [[-hS + 0.75, -hF + 1.3, 0.75, 1.8], [-hS + 1.6, -hF + 1.3, 0.75, 1.8]]) {
    if (hS < 1.9 && u > 0) continue;
    bag.add('reed_mat', boxR(R(u - w2 / 2, u + w2 / 2, v - l / 2, v + l / 2), up, up + 0.015));
    bag.add(cloth[Math.floor(rand() * 5)], boxR(R(u - 0.2, u + 0.2, v - l / 2 + 0.05, v - l / 2 + 0.3), up + 0.015, up + 0.12));
  }
  {
    const hu = hS - 0.7, hv = -hF + 0.7;
    const [px, pz] = W(hu, hv);
    bag.add('terracotta', boxR(R(hu - 0.35, hu + 0.35, hv - 0.35, hv + 0.35), up, up + 0.1));
    bag.add('rubble', lathe([[0.001, 0.1], [0.07, 0.1], [0.06, 0.2], [0.001, 0.21]], 5, null, px + 0.2, 0, pz + 0.2));
    bag.add('rubble', lathe([[0.001, 0.1], [0.07, 0.1], [0.06, 0.2], [0.001, 0.21]], 5, null, px - 0.2, 0, pz + 0.15));
    bag.add('rubble', lathe([[0.001, 0.1], [0.07, 0.1], [0.06, 0.2], [0.001, 0.21]], 5, null, px, 0, pz - 0.22));
    bag.add('pottery_dark', lathe([[0.001, 0.2], [0.14, 0.22], [0.2, 0.34], [0.17, 0.46], [0.2, 0.48]], 10, null, px, up - 0.1 + 0.1, pz));
    col.rect(R(hu - 0.38, hu + 0.38, hv - 0.38, hv + 0.38), up, up + 0.4);
  }
  // (the floor items sit at y = up: their lathes above start at the tray's top)
  for (let k = 0; k < 3; k++) {
    const u = -hS + 0.7 + k * 0.55, [x, z] = W(u, -hF + 0.3);
    bag.add('wicker', lathe([[0.001, 0], [0.18, 0.0], [0.24, 0.2], [0.26, 0.3], [0.001, 0.3]], 8, null, x, up + 1.55, z));
  }
  bag.add('timber', boxR(R(-hS + 0.1, hS - 0.1, -hF + 0.08, -hF + 0.5), up + 1.5, up + 1.55));
  if (rand() < 0.8) {
    const u = hS - 1.2, v = hF - 0.9;
    bag.add('bamboo_culm', boxR(R(u - 0.5, u + 0.5, v - 0.025, v + 0.025), up + 1.55, up + 1.6));
    bag.add(cloth[Math.floor(rand() * 5)], boxR(R(u - 0.4, u + 0.1, v - 0.02, v + 0.02), up + 0.5, up + 1.55));
  }
  if (kind === 'big') {
    // a second sleeping place and a stand of storage jars; a carved board over the door
    const [x, z] = W(0, -hF + 0.7);
    for (const dx of [-0.45, 0, 0.45]) jar(bag, ...(() => { const q = W(dx - hS * 0.4, -hF + 0.55); return [q[0], q[1]]; })(), up, 0.8, 'pottery_dark');
    void x; void z;
    bag.add('clay_gilt', boxR(R(-0.3, 0.3, hF + 0.02, hF + 0.06), up + doorH + 0.16, up + doorH + 0.4));
  }
  // ── the oil lamp: a wick in a dish of coconut oil on a low stand by the sleeping mats, its light filling the room
  { const [lx, lz] = W(hS * 0.3, -hF * 0.15);
    bag.add('timber', lathe([[0.001, 0], [0.12, 0], [0.1, 0.34], [0.001, 0.36]], 6, null, lx, up, lz));
    bag.add('pottery_dark', lathe([[0.001, 0.36], [0.08, 0.36], [0.1, 0.4], [0.001, 0.4]], 8, null, lx, up, lz));
    bag.add('flame', lathe([[0.001, 0.4], [0.014, 0.45], [0.001, 0.5]], 4, null, lx, up, lz));
    col.circle(lx, lz, 0.14, up, up + 0.4);
    if (lights) lights.push({ at: [lx, up + 0.55, lz], color: '#ffb25a', intensity: 2.6, distance: 6.5 }); }
  // ── the front designs (the houses along one road do not repeat one front)
  const sheetQ = (mat, a, b, c, d) => { const T = [], q = (p0, p1, p2, p3) => T.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3, ...p0, ...p2, ...p1, ...p0, ...p3, ...p2); q(a, b, c, d); bag.add(mat, fromTriangles(T)); };
  const P3 = (u, v, y) => { const [x, z] = W(u, v); return [x, y, z]; };
  if (variant === 'porch' && deck) {
    // the deck roofed over its whole width by a lean-to of thatch on two posts, a rolled reed blind under its edge, a bench and a woven fish trap
    const u1 = hS + 0.25, v1 = vd + 0.95, yh = top - 0.3, yl = up + 2.1;
    sheetQ('thatch_palm', P3(-u1, hF - 0.1, yh), P3(u1, hF - 0.1, yh), P3(u1, v1, yl), P3(-u1, v1, yl));
    sheetQ('thatch_palm', P3(-u1, hF - 0.1, yh - 0.12), P3(u1, hF - 0.1, yh - 0.12), P3(u1, v1, yl - 0.12), P3(-u1, v1, yl - 0.12));
    for (const sg of [-1, 1]) { const [x, z] = W(sg * (u1 - 0.1), v1 - 0.1); bag.add('timber', lathe([[0.09, 0], [0.075, yl - up - 0.05]], 6, null, x, up - 0.02, z)); col.circle(x, z, 0.1, up, yl); }
    bag.add('reed_mat', boxR(R(-hS + 0.3, hS - 0.3, v1 - 0.16, v1 - 0.08), yl - 0.28, yl - 0.06));
    bag.add('bamboo_culm', boxR(R(-hS + 0.25, hS - 0.25, v1 - 0.18, v1 - 0.12), yl - 0.08, yl - 0.02));
    { const bu = -hS * 0.55, [x, z] = W(bu, hF + 0.3); bag.add('bamboo_culm', boxR(R(bu - 0.6, bu + 0.6, hF + 0.12, hF + 0.42), up + 0.38, up + 0.44)); void x; void z; }
    { const [x, z] = W(hS * 0.6, hF + 0.55); bag.add('wicker', lathe([[0.001, 0], [0.16, 0], [0.2, 0.3], [0.14, 0.75], [0.001, 0.8]], 8, null, x, up + 0.0, z)); }
  }
  if (variant === 'shop' && deck) {
    // a shop: the counter across the deck either side of the stair with the day's goods, a striped cloth awning slung out from the eave on poles, wares hung from it, a hanging sign
    const dw2 = Math.min(hS, 1.7), cl = [['cloth_red', 'cloth_white'], ['cloth_indigo', 'cloth_white'], ['cloth_ochre', 'cloth_brown']][Math.floor(rand() * 3)];
    for (const sg of [-1, 1]) {
      const a = 0.62 * sg, b = (dw2 - 0.06) * sg;
      bag.add('wood_ochre', boxR(R(Math.min(a, b), Math.max(a, b), vd - 0.5, vd - 0.12), up, up + 0.86)); col.rect(R(Math.min(a, b), Math.max(a, b), vd - 0.5, vd - 0.12), up, up + 0.9);
      bag.add('timber', boxR(R(Math.min(a, b) - 0.03, Math.max(a, b) + 0.03, vd - 0.55, vd - 0.08), up + 0.86, up + 0.91));
      for (let k = 0; k < 4; k++) { const u = Math.min(a, b) + 0.2 + k * (Math.abs(b - a) - 0.4) / 3, [x, z] = W(u, vd - 0.3), r = rand();
        if (r < 0.4) bag.add('terracotta', lathe([[0.001, 0], [0.1, 0], [0.15, 0.12], [0.1, 0.22], [0.001, 0.22]], 7, null, x, up + 0.91, z));
        else if (r < 0.7) bag.add('wicker', lathe([[0.001, 0], [0.14, 0], [0.18, 0.1], [0.001, 0.12]], 7, null, x, up + 0.91, z));
        else bag.add(['cloth_green', 'cloth_ochre', 'cloth_red'][k % 3], boxR(R(u - 0.13, u + 0.13, vd - 0.42, vd - 0.18), up + 0.91, up + 1.03)); }
    }
    const u1 = hS + 0.1, v1 = vd + 1.5, yh = up + 2.25, yl = up + 1.75, n = 6, w = 2 * u1 / n;
    for (let k = 0; k < n; k++) sheetQ(k % 2 ? cl[1] : cl[0], P3(-u1 + k * w, hF - 0.05, yh), P3(-u1 + (k + 1) * w, hF - 0.05, yh), P3(-u1 + (k + 1) * w, v1, yl), P3(-u1 + k * w, v1, yl));
    for (const sg of [-1, 1]) { const [x, z] = W(sg * (u1 - 0.05), v1 - 0.05); bag.add('bamboo_culm', lathe([[0.04, 0], [0.035, yl - 0.05]], 5, null, x, 0, z)); col.circle(x, z, 0.06, 0, yl); }
    for (let k = 0; k < 3; k++) { const u = -0.9 + k * 0.9, [x, z] = W(u, v1 - 0.25); bag.add('rope_fibre', boxR([x - 0.004, z - 0.004, x + 0.004, z + 0.004], yl - 0.55, yl)); bag.add(k % 2 ? 'wicker' : 'sacking', lathe([[0.001, 0], [0.09, 0.02], [0.11, 0.14], [0.001, 0.2]], 7, null, x, yl - 0.75, z)); }
    bag.add('lacquer_red', boxR(R(hS - 0.95, hS - 0.2, v1 - 0.05, v1 - 0.01), yl - 0.8, yl - 0.05)); bag.add('clay_gilt', boxR(R(hS - 0.8, hS - 0.35, v1 - 0.06, v1 - 0.04), yl - 0.65, yl - 0.2));
  }
  if (variant === 'tile') {
    // the house of a person of standing: the posts on laterite footings, a carved gilt board over the door, painted window frames, a tile roof
    for (let i = 0; i <= nv; i++) for (let j = 0; j <= nu; j++) { const edge = i === 0 || i === nv || j === 0 || j === nu; if (!edge) continue; const [x, z] = W(-hS + 2 * hS * j / nu, -hF + 2 * hF * i / nv); bag.add('laterite', lathe([[0.26, 0], [0.22, 0.34], [0.16, 0.36], [0.001, 0.36]], 8, null, x, 0, z)); }
    bag.add('clay_gilt', boxR(R(-0.55, 0.55, hF + 0.02, hF + 0.07), up + doorH + 0.14, up + doorH + 0.52));
    bag.add('timber_red', boxR(R(-hS - 0.04, hS + 0.04, hF - 0.05, hF + 0.05), up + wallH - 0.2, up + wallH));
    bag.add('clay_gilt', boxR(R(-hS - 0.05, hS + 0.05, hF - 0.04, hF + 0.06), up + wallH - 0.2, up + wallH - 0.14));
  }
}

/** k_granary: { at, seed, front } a rice store on posts 1.5 m high: plank walls, a thatched roof, a door and a notched log to it. */
export function granary(el, { bag, col }) {
  const rand = rng(el.seed || 1), w = 1.7, d = 1.3, up = 1.5, hgt = 1.6, [cx, cz] = el.at;
  const x0 = cx - w, x1 = cx + w, z0 = cz - d, z1 = cz + d;
  for (const sx of [x0 + 0.15, x1 - 0.15]) for (const sz of [z0 + 0.15, z1 - 0.15]) {
    bag.add('timber', lathe([[0.12, 0], [0.1, up + hgt]], 6, null, sx, 0, sz)); col.circle(sx, sz, 0.14, 0, up);
    bag.add('laterite', lathe([[0.001, 0.32], [0.24, 0.32], [0.24, 0.38], [0.001, 0.38]], 7, null, sx, 0, sz));
  }
  for (const sx of [cx]) bag.add('timber', lathe([[0.1, 0], [0.09, up]], 6, null, sx, 0, cz));
  bag.add('timber', box(x0 - 0.05, up - 0.14, z0 - 0.05, x1 + 0.05, up, z1 + 0.05));
  const wall = rand() < 0.5 ? 'timber' : 'reed_mat';
  bag.add(wall, box(x0, up, z0, x1, up + hgt, z0 + 0.06)); bag.add(wall, box(x0, up, z1 - 0.06, x1, up + hgt, z1));
  bag.add(wall, box(x0, up, z0, x0 + 0.06, up + hgt, z1)); bag.add(wall, box(x1 - 0.06, up, z0, x1, up + hgt, z0 + 0.55)); bag.add(wall, box(x1 - 0.06, up, z1 - 0.55, x1, up + hgt, z1));
  bag.add(wall, box(x1 - 0.06, up + 1.1, z0 + 0.55, x1, up + hgt, z1 - 0.55));
  col.rect([x0, z0, x1, z1], up - 0.2, up + hgt);
  // the notched log leaning to the door (east side)
  const lg = [];
  beamTris(lg, [x1 + 1.0, 0, cz], [x1 + 0.05, up, cz], 0.12, 0.12);
  bag.add('timber', fromTriangles(lg));
  col.ramp([x1, cz - 0.3, x1 + 1.0, cz + 0.3], up, 0, 'w');
  rectRoof({ c: [cx, cz], A: w + 0.7, B: d + 0.75, y: up + hgt, rise: (d + 0.75) * 1.4, kind: 'gable', sweep: 0, curl: false, p: 1.05, alongZ: false, mat: 'thatch_palm', soffit: 'thatch_palm' }, bag);
}

/**
 * k_sala: { rect, seed } an open rest house (sala): a floor of planks 0.7 m up on round posts, no walls, a hipped roof of palm thatch
 * well overhanging, a bench along the back; one steps up from the front (south) and sits.
 */
export function sala(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, up = 0.7, hgt = 2.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const nx = Math.max(2, Math.round((x1 - x0) / 2.6)), nz = Math.max(2, Math.round((z1 - z0) / 2.6));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    if (!(i === 0 || i === nx || j === 0 || j === nz)) continue;
    const x = x0 + (x1 - x0) * i / nx, z = z0 + (z1 - z0) * j / nz;
    bag.add('timber', lathe([[0.14, 0], [0.12, up + hgt]], 7, null, x, 0, z)); col.circle(x, z, 0.16, 0, up + hgt);
  }
  bag.add('timber', box(x0 - 0.2, up - 0.18, z0 - 0.2, x1 + 0.2, up, z1 + 0.2));
  col.floor([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], up);
  // the beams over the posts
  bag.add('timber', box(x0 - 0.1, up + hgt - 0.2, z0 - 0.1, x1 + 0.1, up + hgt, z0 + 0.1)); bag.add('timber', box(x0 - 0.1, up + hgt - 0.2, z1 - 0.1, x1 + 0.1, up + hgt, z1 + 0.1));
  bag.add('timber', box(x0 - 0.1, up + hgt - 0.2, z0, x0 + 0.1, up + hgt, z1)); bag.add('timber', box(x1 - 0.1, up + hgt - 0.2, z0, x1 + 0.1, up + hgt, z1));
  // a low rail along the back (north), a bench of boards
  bag.add('timber', box(x0, up + 0.4, z0 + 0.15, x1, up + 0.46, z0 + 0.22)); bag.add('timber', box(x0, up + 0.9, z0 + 0.15, x1, up + 0.96, z0 + 0.22));
  col.segment([x0, z0 + 0.18], [x1, z0 + 0.18], 0.1, up, up + 1.0);
  // steps on the south side
  for (let k = 1; k <= 2; k++) {
    const zz = z1 + 0.2 + (2 - k) * 0.35 + 0.25, y = up * (3 - k) / 3 - 0.0;
    bag.add('timber', box(cx - 0.9, y - 0.06, zz - 0.17, cx + 0.9, y, zz + 0.17)); col.floor([cx - 0.9, zz - 0.17, cx + 0.9, zz + 0.17], y);
  }
  // a water jar and its coconut-shell dipper at the foot of the steps, as at the rest houses of the roads
  jar(bag, x0 + 0.4, z1 + 0.9, 0, 0.9); col.circle(x0 + 0.4, z1 + 0.9, 0.3, 0, 0.7);
  rectRoof({ c: [cx, cz], A: (x1 - x0) / 2 + 1.3, B: (z1 - z0) / 2 + 1.3, y: up + hgt, rise: Math.min((x1 - x0), (z1 - z0)) * 0.55 + 0.6, kind: 'hip', sweep: 0, curl: false, p: 1.05, mat: 'thatch_palm', soffit: 'thatch_palm' }, bag);
}

/** k_lotus: { rect, y (the water), seed } lotus on a pond: round leaves floating and standing, a few pink flowers and seed heads on their stalks. */
export function lotus(el, { bag }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? -0.55, n = Math.round((x1 - x0) * (z1 - z0) / 7);
  for (let k = 0; k < n; k++) {
    const x = x0 + 1.2 + rand() * (x1 - x0 - 2.4), z = z0 + 1.2 + rand() * (z1 - z0 - 2.4), r = 0.22 + rand() * 0.2, stand = rand() < 0.35, h = stand ? 0.45 + rand() * 0.5 : 0.02;
    bag.add('lotus_leaf', lathe([[0.001, h + 0.045], [r * 0.5, h + 0.02], [r, h + 0.0], [r * 1.02, h + 0.01]], 9, null, x, y, z));
    if (stand) bag.add('lotus_leaf', lathe([[0.012, 0], [0.01, h]], 4, null, x, y, z));
    if (rand() < 0.15) {
      const fh = 0.7 + rand() * 0.4;
      bag.add('lotus_leaf', lathe([[0.012, 0], [0.01, fh]], 4, null, x, y, z));
      bag.add('stucco_rose', lathe([[0.001, fh], [0.05, fh + 0.03], [0.1, fh + 0.12], [0.07, fh + 0.2], [0.001, fh + 0.24]], 8, null, x, y, z));
    }
  }
}
void tube; void slathe;
