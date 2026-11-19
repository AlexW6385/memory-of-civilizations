// The courtyard houses and walled gardens of Timurid Samarkand (docs/settlements/timurid-samarkand.md §6, §7, §15): each house
// fills its lot from lane to lane, blank to the street but for the door, a few small latticed windows, the ends of the roof
// beams under the parapet, a bench (supa) and the goods of the house's trade; inside the door a passage and a privacy screen
// lead to a court with a pool or a tree, the talar (ayvan: a raised porch on timber columns, painted ceiling) on the north
// wing and, in the furnished houses, a room off the court; a mud-brick stair climbs to the flat roof, where fruit dries.

import { box, lathe, place, rod, clothBox, addCloth } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';
import { houseGeom } from '../../settlements/timurid-samarkand/layout.js';
import { frame } from './frame.js';
import { laneItem } from './market.js';
import { workshop } from './workshops.js';
import { upperFloor, upperMass, facts as upperFacts } from './upper.js';
import { bannai, rng, B, LAP, TUR, CRE, WHI } from './kit.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
const solid = (f, m, x0, z0, x1, z1, y0, y1) => { bx(f.bag, m, x0, y0, z0, x1, y1, z1); f.col.rect([x0, z0, x1, z1], y0, y1); };

/** A face of the house: runs a→b (local plan), outward normal n; p(s, o) the plan point s along it, o out. */
function faceOf(a, b, n) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  const p = (s, o) => [a[0] + u[0] * s + n[0] * o, a[1] + u[1] * s + n[1] * o];
  /** a box on the face: s0…s1 along, y0…y1 up, o0…o1 out from the wall's face */
  const put = (bag, m, s0, s1, y0, y1, o0, o1) => { const A = p(s0, o0), Bq = p(s1, o1); bx(bag, m, A[0], y0, A[1], Bq[0], y1, Bq[1]); };
  return { a, b, n, L, u, p, put };
}

// ---- the goods of a trade, set by the door --------------------------------------------------------------------
function woodStack(bag, x, z, yaw, w = 1.0, n = 3) {
  for (let r = 0; r < n; r++) for (let i = 0; i < w / 0.14 - r * 0.5; i++) bag.add(i % 3 ? 'timber' : 'wood_dark', place(box(-0.06, 0, -0.45, 0.06, 0.12, 0.45), x + (Math.cos(yaw) * (i * 0.14 + r * 0.07)), r * 0.125, z - Math.sin(yaw) * (i * 0.14 + r * 0.07), yaw));
}
function melons(bag, x, z, n, rand) {
  for (let i = 0; i < n; i++) {
    const a = rand() * 6.28, r = Math.sqrt(rand()) * 0.55, k = 0.9 + rand() * 0.3, lay = i > 7 ? 0.2 : 0;
    bag.add(rand() < 0.5 ? 'cloth_green' : 'cloth_ochre', lathe([[0.001, 0], [0.12 * k, 0.03], [0.17 * k, 0.15 * k], [0.12 * k, 0.28 * k], [0.001, 0.31 * k]], 8, null, x + Math.cos(a) * r * (1 - lay), lay ? 0.2 : 0, z + Math.sin(a) * r * (1 - lay)));
  }
}
function breads(bag, x, y, z, n) { for (let i = 0; i < n; i++) bag.add('cloth_ochre', lathe([[0.001, 0], [0.13, 0], [0.14, 0.02], [0.11, 0.045], [0.001, 0.05]], 10, null, x + (i % 3) * 0.27, y + Math.floor(i / 3) * 0.05, z + (i % 2) * 0.05)); }
/** What stands before the house on the street (face f, at s along it, facing the lane). */
function trade(f, kind, s, rand, bag, col) {
  const q = f.p(s, 0.0), N = f.n, yaw = Math.atan2(N[0], N[1]);
  const at = (ds, o) => f.p(s + ds, o);
  switch (kind) {
    case 'potter': {
      const p = at(0, 0.55); bx(bag, 'timber', ...[p[0] - 0.9, 0.0, p[1] - 0.25, p[0] + 0.9, 0.5, p[1] + 0.25].map((v, i) => (i === 1 ? 0.45 : i === 4 ? 0.5 : v)));
      F.pots(bag, p[0] - 0.4, 0.5, p[1], yaw, 5); F.pots(bag, p[0] + 0.4, 0.5, p[1], yaw, 4, ['glaze_blue', 'glaze_green', 'terracotta']);
      const g = at(2.2, 0.7); F.pots(bag, g[0], 0, g[1], yaw, 6); F.pots(bag, g[0] + 0.5, 0, g[1] + 0.3, yaw, 4, ['pottery_dark', 'terracotta', 'terracotta']);
      break;
    }
    case 'baker': {
      const p = at(-1.8, 0.7); bag.add('terracotta', lathe([[0.55, 0], [0.55, 0.35], [0.45, 0.65], [0.2, 0.82], [0.001, 0.84]], 12, null, p[0], 0, p[1])); col.circle(p[0], p[1], 0.58, 0, 0.9);
      const b = at(1.8, 0.5); bx(bag, 'timber', b[0] - 0.7, 0, b[1] - 0.3, b[0] + 0.7, 0.07, b[1] + 0.3); bag.add('timber', box(b[0] - 0.7, 0.8, b[1] - 0.3, b[0] + 0.7, 0.87, b[1] + 0.3));
      for (const dx of [-0.6, 0.6]) bx(bag, 'timber', b[0] + dx - 0.04, 0, b[1] - 0.04, b[0] + dx + 0.04, 0.8, b[1] + 0.04);
      breads(bag, b[0] - 0.4, 0.87, b[1] - 0.1, 8);
      break;
    }
    case 'smith': {
      const p = at(-1.7, 0.7); bag.add('iron', lathe([[0.13, 0], [0.11, 0.35], [0.2, 0.42], [0.2, 0.5], [0.001, 0.5]], 8, null, p[0], 0, p[1]));
      bag.add('wood_dark', lathe([[0.17, 0], [0.15, 0.4], [0.001, 0.4]], 8, null, p[0], 0, p[1])); col.circle(p[0], p[1], 0.3, 0, 0.5);
      const g = at(1.9, 0.45); for (let i = 0; i < 6; i++) bag.add('iron', place(box(-0.2, -0.02, -0.02, 0.2, 0.02, 0.02), g[0], 1.4 + (i % 3) * 0.2, g[1], yaw + 0.3 * (i - 2.5)));
      F.copperware(bag, g[0], 0, g[1] + 0.3, yaw, 3, 3);
      break;
    }
    case 'weaver': {
      const p = at(0, 0.6); for (const dx of [-1.3, 1.3]) bx(bag, 'timber', p[0] + dx - 0.04, 0, p[1] - 0.04, p[0] + dx + 0.04, 2.2, p[1] + 0.04);
      bag.add('timber', place(box(-1.35, 2.15, -0.04, 1.35, 2.22, 0.04), p[0], 0, p[1], yaw));
      ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_green'].forEach((m, i) => { const q2 = at(-1.0 + i * 0.4, 0.6); addCloth(bag, m, clothBox(q2[0] - 0.06, 1.0, q2[1] - 0.02, q2[0] + 0.06, 2.15, q2[1] + 0.02), 2.15); });
      break;
    }
    case 'carpenter': {
      const p = at(1.6, 0.9); woodStack(bag, p[0], p[1], yaw + Math.PI / 2, 1.0, 4);
      const g = at(-1.8, 0.4); bx(bag, 'timber', g[0] - 0.6, 0, g[1] - 0.2, g[0] + 0.6, 0.7, g[1] + 0.2);
      for (let i = 0; i < 4; i++) bag.add('wood_painted', place(box(-0.04, 0, -0.4, 0.04, 1.5, 0.0), g[0] - 0.35 + i * 0.22, 0, g[1] + 0.35, yaw + 0.1));
      break;
    }
    case 'papermaker': {
      // sheets of paper hung to dry on a line between two posts, a heap of bark, a tub
      const p = at(0, 0.7); for (const dx of [-1.4, 1.4]) { const q3 = at(dx, 0.7); bx(bag, 'timber', q3[0] - 0.04, 0, q3[1] - 0.04, q3[0] + 0.04, 2.1, q3[1] + 0.04); }
      bag.add('timber', place(box(-1.45, 2.05, -0.03, 1.45, 2.12, 0.03), p[0], 0, p[1], yaw));
      for (let i = 0; i < 7; i++) { const q2 = at(-1.2 + i * 0.4, 0.7); addCloth(bag, 'cloth_white', clothBox(q2[0] - 0.14, 1.25, q2[1] - 0.01, q2[0] + 0.14, 2.05, q2[1] + 0.01), 2.05); }
      const g = at(2.2, 0.6); bag.add('limestone', lathe([[0.001, 0], [0.4, 0], [0.42, 0.5], [0.36, 0.52]], 12, null, g[0], 0, g[1])); col.circle(g[0], g[1], 0.43, 0, 0.5);
      break;
    }
    default: {
      const p = at(-1.7, 0.8); melons(bag, p[0], p[1], 12, rand);
      const b = at(1.8, 0.6); F.spiceSacks(bag, b[0], 0, b[1], yaw, 4); F.bale(bag, b[0] + 0.7, 0, b[1] + 0.2, 0.6, 0.4, 0.5, yaw, 'sacking');
      const g = at(0.2, 0.35); bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.25, 0.26], [0.001, 0.24]], 10, null, g[0], 0, g[1]));
    }
  }
  void q;
}

// ---- the walls ------------------------------------------------------------------------------------------------
/** The foot, patches of bare brick, roof-beam ends, small windows and eaves of a blank outer face. */
function dressFace(f, bag, rand, o) {
  const { L } = f, plinth = 0.55 + rand() * 0.35;
  f.put(bag, 'mud_plaster', 0, L, 0, plinth, 0, 0.035);
  // patches where the plaster has gone: bare brick, a few in the upper wall
  const np = Math.round(L / 3.2);
  for (let i = 0; i < np; i++) {
    if (rand() < 0.35) continue;
    const s = 0.5 + rand() * (L - 1.6), w = 0.5 + rand() * 0.9, h = 0.4 + rand() * 0.7, y = plinth + 0.25 + rand() * (o.H - plinth - h - 1.2);
    if (o.skip && o.skip.some(([a, b]) => s < b + 0.2 && s + w > a - 0.2)) continue;
    f.put(bag, o.brick ? 'kahgel' : 'brick_buff', s, s + w, y, y + h, 0, 0.03);
  }
  // the ends of the roof beams under the parapet, every 0.6 m
  const n = Math.floor(L / 0.6);
  for (let i = 0; i < n; i++) f.put(bag, i % 4 === 3 ? 'wood_dark' : 'timber', 0.3 + i * 0.6 - 0.05, 0.3 + i * 0.6 + 0.05, o.H - 0.32, o.H - 0.2, 0, 0.32);
  // small high windows with a lattice in a brick frame
  for (const s of o.windows ?? []) {
    if (o.open) {
      continue;
    }
    f.put(bag, 'brick_buff', s - 0.45, s + 0.45, o.wy - 0.07, o.wy + 0.6, 0, 0.05);
    f.put(bag, 'lattice', s - 0.34, s + 0.34, o.wy, o.wy + 0.5, 0.05, 0.1);
  }
}

/** Mud-brick bench (supa) with a felt; items beside the door of a house. */
function bench(f, bag, col, s, len, rand) {
  f.put(bag, 'brick_buff', s, s + len, 0, 0.46, 0, 0.55);
  f.put(bag, 'limestone', s, s + len, 0.46, 0.5, -0.02, 0.58);
  const c = f.p(s + len / 2, 0.3), yaw = Math.atan2(f.n[0], f.n[1]);
  F.kilim(bag, c[0], 0.506, c[1], len * 0.8, 0.45, yaw + Math.PI / 2 * (Math.abs(f.n[0]) > 0.5 ? 0 : 0), ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
  const a = f.p(s, 0), b = f.p(s + len, 0.55);
  col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0, 0.5);
  void rand;
}

export function timHouse(el, ctx) {
  const h = el.h, G = houseGeom(h), fr = frame(ctx, G.cx, G.cz, h.k), { bag, col, lights } = fr, rand = rng(h.seed + 7);
  const W = G.W, D = G.D, x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2;
  const dN = 4.8, dW = 4.3, dS = 4.6, H = 3.9 + rand() * 0.5, HN = H + 0.45, rich = h.rich, HS = rich ? 7.0 : H, full = h.full;
  const WALL = rich ? 'brick_buff' : rand() < 0.2 ? 'mud_plaster' : 'kahgel';
  const zf = z0 + dN, zs = z1 - dS, xl = x0 + dW, xr = x1 - dW;      // the court's edges
  const xd = Math.max(x0 + 3.2, Math.min(x1 - 3.2, h.xd)), PW = 2.2, DH = 2.75;
  const rsgn = rand() < 0.5 ? -1 : 1;                              // the wing with the room (west −1, east +1)
  if (el.simple) {
    // the far form (src/settlements/lod.js): the masses of the wings in the house's wall, the parapets, the passage's lintel; nothing inside, one material
    const zb2 = zf - 2.5;
    bx(bag, WALL, x0, 0, z0, -3.6, HN, zf); bx(bag, WALL, 3.6, 0, z0, x1, HN, zf); bx(bag, WALL, -3.6, 0, z0, 3.6, HN, zb2); bx(bag, WALL, -3.6, 3.3, zb2, 3.6, HN, zf);
    bx(bag, WALL, x0, 0, zs, xd - PW / 2, HS, z1); bx(bag, WALL, xd + PW / 2, 0, zs, x1, HS, z1); bx(bag, WALL, xd - PW / 2, DH, zs, xd + PW / 2, HS, z1);
    bx(bag, WALL, x0, 0, zf, xl, H, zs); bx(bag, WALL, xr, 0, zf, x1, H, zs);
    bx(bag, WALL, x0, HN, z0, x1, HN + 0.6, z0 + 0.3); bx(bag, WALL, x0, H, z0 + 0.3, x0 + 0.3, H + 0.6, zs); bx(bag, WALL, x1 - 0.3, H, z0 + 0.3, x1, H + 0.6, zs);
    bx(bag, WALL, x0 + 0.3, HN, zf - 0.3, x0 + 3.5, HN + 0.5, zf); bx(bag, WALL, 3.7, HN, zf - 0.3, x1 - 0.3, HN + 0.5, zf);
    if (!rich) { bx(bag, WALL, x0, HS, z1 - 0.3, x1, HS + 0.65, z1); bx(bag, WALL, x0, HS, zs, x0 + 0.3, HS + 0.6, z1 - 0.3); bx(bag, WALL, x1 - 0.3, HS, zs, x1, HS + 0.6, z1 - 0.3); }
    // the openings of the full form at the same places (the same random draws): windows and the passage's mouth as flat dark boxes, the beam ends as a dark strip under each parapet
    const D0 = 'wood_dark', nil = { add() {} }, hW = [];
    const S2 = faceOf([x0, z1], [x1, z1], [0, 1]), N2 = faceOf([x1, z0], [x0, z0], [0, -1]), E2 = faceOf([x1, z1], [x1, z0], [1, 0]), W2 = faceOf([x0, z0], [x0, z1], [-1, 0]);
    const swin = []; for (const s0 of [3.4, W - 3.4]) if (Math.abs(s0 - (xd - x0)) > 2.2 && rand() < 0.8) swin.push(s0);
    const skip = [[xd - x0 - 1.8, xd - x0 + 1.8]], br = WALL === 'brick_buff';
    const face = (f, hh, wy, wins, sk) => { dressFace(f, nil, rand, { H: hh, wy, windows: wins, skip: sk, brick: br }); for (const s0 of wins) f.put(bag, D0, s0 - 0.34, s0 + 0.34, wy, wy + 0.5, 0, 0.03); f.put(bag, D0, 0.3, f.L - 0.3, hh - 0.3, hh - 0.2, 0, 0.03); };
    face(S2, HS, rich ? 5.0 : 2.5, rich ? [4.5, W - 4.5, W / 2 + 3] : swin, skip);
    face(N2, HN, 2.5, rand() < 0.5 ? [W / 2] : []);
    face(E2, H, 2.4, full && rsgn > 0 ? [] : [D / 2]); face(W2, H, 2.4, full && rsgn < 0 ? [] : [D / 2]);
    bx(bag, D0, xd - PW / 2, 0, z1 - 0.6, xd + PW / 2, DH, z1 - 0.55);
    if (full) { const zc = (zf + zs) / 2; bx(bag, D0, rsgn < 0 ? x0 - 0.03 : x1, 1.6, zc - 0.4, rsgn < 0 ? x0 : x1 + 0.03, 2.4, zc + 0.4); }
    upperMass(bag, upperFacts(h), WALL);
    void hW;
    return;
  }
  // ---- the wings (solid), the roofs walkable, the parapets
  solid(fr, WALL, x0, z0, -3.6, zf, 0, HN); solid(fr, WALL, 3.6, z0, x1, zf, 0, HN);          // the north wing round the talar's recess
  const zb = zf - 2.5;
  solid(fr, WALL, -3.6, z0, 3.6, zb, 0, HN);
  bx(bag, WALL, -3.6, 3.6, zb, 3.6, HN, zf); col.rect([-3.6, zb, 3.6, zf], 3.3, HN);
  // the street wing with the passage
  const HG = rich ? H : HS;       // a rich house: the ground floor's top is the upper floor (upper.js builds what stands on it)
  solid(fr, WALL, x0, zs, xd - PW / 2, z1, 0, HG); solid(fr, WALL, xd + PW / 2, zs, x1, z1, 0, HG);
  bx(bag, WALL, xd - PW / 2, DH, zs, xd + PW / 2, HG, z1); col.rect([xd - PW / 2, zs, xd + PW / 2, z1], DH, HG);
  bx(bag, 'brick_paving', xd - PW / 2, 0, zs, xd + PW / 2, 0.06, z1);
  // the side wings (the room's wing is built below)
  const side = (sg) => {
    const xa = sg < 0 ? x0 : xr, xb = sg < 0 ? xl : x1, zc = (zf + zs) / 2;
    if (full && sg === rsgn) {
      const rz0 = zc - 2.6, rz1 = zc + 2.6, wt = 0.5, cw = sg < 0 ? [xl - wt, xl] : [xr, xr + wt], ow = sg < 0 ? [x0, x0 + wt] : [x1 - wt, x1];
      solid(fr, WALL, xa, zf, xb, rz0, 0, H); solid(fr, WALL, xa, rz1, xb, zs, 0, H);
      solid(fr, WALL, ow[0], rz0, ow[1], rz1, 0, H);
      // the court wall of the room with its door (1.1 × 2.1)
      solid(fr, WALL, cw[0], rz0, cw[1], zc - 0.55, 0, H); solid(fr, WALL, cw[0], zc + 0.55, cw[1], rz1, 0, H);
      bx(bag, WALL, cw[0], 2.1, zc - 0.55, cw[1], H, zc + 0.55); col.rect([cw[0], zc - 0.55, cw[1], zc + 0.55], 2.1, H);
      // roof slab over the room, the ceiling under it, the floor
      bx(bag, WALL, ow[1], 3.2, rz0, cw[0], H, rz1); col.rect([ow[1], rz0, cw[0], rz1], 3.2, H);
      bx(bag, 'ceiling_painted', ow[1], 3.1, rz0, cw[0], 3.2, rz1);
      bx(bag, 'timber', ow[1], 0, rz0, cw[0], 0.08, rz1);
      const xin = sg < 0 ? ow[1] : cw[0], xout = sg < 0 ? cw[0] : ow[1], ix = (ow[1] + cw[0]) / 2, ya = sg < 0 ? -Math.PI / 2 : Math.PI / 2;
      // the door leaf folded back, and the window on the lane
      bag.add('wood_dark', box(sg < 0 ? cw[0] - 0.02 : cw[1] - 0.02, 0, zc - 0.55, sg < 0 ? cw[0] + 0.05 : cw[1] + 0.05, 2.05, zc - 0.5)); void xin; void xout;
      bx(bag, 'lattice', sg < 0 ? x0 - 0.06 : x1, 1.6, zc - 0.4, sg < 0 ? x0 : x1 + 0.06, 2.4, zc + 0.4);
      const kind = rich || h.seed % 3 === 0 ? 'guest' : ({ potter: 'pottery', baker: 'bakery', smith: 'smithy', weaver: 'loom', carpenter: 'joinery', grocer: 'store', papermaker: 'paper' })[h.trade];
      if (kind === 'guest') {
      // the furnishing: a kilim, the quilts (korpa) in a stack on a chest, a tray table, a lamp
        F.carpet(bag, ix, 0.08, zc, 3.0, 4.6, Math.PI / 2 + (sg < 0 ? 0 : 0), 'persian');
        F.kilim(bag, ix, 0.1, zc + 1.6, 2.2, 1.0, 0, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
        const wallx = sg < 0 ? ow[1] + 0.4 : ow[0] - 0.4;
        F.chest(bag, wallx, 0.08, rz0 + 0.7, 0.5, 1.0, 0.55, ya, 'wood_painted');
        ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon'].forEach((m, i) => bag.add(m, box(wallx - 0.28, 0.63 + i * 0.1, rz0 + 0.3, wallx + 0.28, 0.72 + i * 0.1, rz0 + 1.1)));
        F.trayTable(bag, ix, 0.08, zc - 0.2, { seed: h.seed });
        F.cushion(bag, ix + 0.8, 0.1, zc - 0.7, 0.7, 0.5, 0.12, 0.3, 'cloth_red'); F.cushion(bag, ix - 0.8, 0.1, zc + 0.5, 0.7, 0.5, 0.12, 2.4, 'cloth_indigo');
        F.oilLamp(bag, lights, wallx, 1.2, rz1 - 0.3, 'terracotta', 1.1);
        F.rahle(bag, ix, 0.1, rz1 - 0.9, ya + Math.PI);
        for (let i = 0; i < 3; i++) bx(bag, 'wood_dark', wallx - 0.02, 1.0, rz1 - 1.6 - i * 0.9, wallx + 0.02, 1.7, rz1 - 1.0 - i * 0.9);       // niches, dark
      } else workshop(kind, { bag, col, lights, ofx: sg < 0 ? ix - 1.65 : ix + 1.65, dir: sg < 0 ? 1 : -1, zc, seed: h.seed, breads, melons });
      col.floor([ow[1], rz0, cw[0], rz1], 0.08);
    } else solid(fr, WALL, xa, zf, xb, zs, 0, H);
  };
  side(-1); side(1);
  // walkable roofs of the wings and the parapets round them
  col.floor([x0, z0, x1, zf], HN, 'roof'); col.floor([x0, zf, xl, zs], H, 'roof'); col.floor([xr, zf, x1, zs], H, 'roof');
  if (!rich) col.floor([x0, zs, x1, z1], HS, 'roof');
  const par = (a, b, y, hgt) => { const c0 = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; bx(bag, WALL, ...[c0[0], y, c0[1], c0[2], y + hgt, c0[3]]); bx(bag, 'brick_buff', c0[0] - 0.04, y + hgt, c0[1] - 0.04, c0[2] + 0.04, y + hgt + 0.06, c0[3] + 0.04); col.rect(c0, y, y + 0.9); };
  par([x0, z0], [x1, z0 + 0.3], HN, 0.6); par([x0, z0], [x0 + 0.3, zs], H, 0.6); par([x1 - 0.3, z0], [x1, zs], H, 0.6);
  if (!rich) { par([x0, z1 - 0.3], [x1, z1], HS, 0.65); par([x0, zs], [x0 + 0.3, z1], HS, 0.6); par([x1 - 0.3, zs], [x1, z1], HS, 0.6); }
  par([x0 + 0.3, zf - 0.3], [x0 + 3.5, zf], HN, 0.5); par([3.7, zf - 0.3], [x1 - 0.3, zf], HN, 0.5);
  // ---- the faces
  const S = faceOf([x0, z1], [x1, z1], [0, 1]), Nf = faceOf([x1, z0], [x0, z0], [0, -1]), Ef = faceOf([x1, z1], [x1, z0], [1, 0]), Wf = faceOf([x0, z0], [x0, z1], [-1, 0]);
  const swin = []; for (const s of [3.4, W - 3.4]) if (Math.abs(s - (xd - x0)) > 2.2 && rand() < 0.8) swin.push(s);
  const sfaceSkip = [[xd - x0 - 1.8, xd - x0 + 1.8]];
  dressFace(S, bag, rand, { H: HS, wy: rich ? 5.0 : 2.5, windows: rich ? [1.8, 4.5, W / 2 + 3, W - 4.5, W - 1.8] : swin, open: rich, skip: sfaceSkip, brick: WALL === 'brick_buff' });
  dressFace(Nf, bag, rand, { H: HN, wy: 2.5, windows: rand() < 0.5 ? [W / 2] : [], brick: WALL === 'brick_buff' });
  dressFace(Ef, bag, rand, { H, wy: 2.4, windows: h.full && rsgn > 0 ? [] : [D / 2], brick: WALL === 'brick_buff' });
  dressFace(Wf, bag, rand, { H, wy: 2.4, windows: h.full && rsgn < 0 ? [] : [D / 2], brick: WALL === 'brick_buff' });
  // things of the lane on the other faces: a cart, a ladder to the roof, dung cakes drying, straw, a hung carpet, jars
  for (const [f, hh, n] of [[Nf, HN, 1 + (rand() < 0.4 ? 1 : 0)], [Ef, H, 1 + (rand() < 0.5 ? 1 : 0)], [Wf, H, 1 + (rand() < 0.5 ? 1 : 0)], [S, HS, rand() < 0.35 ? 1 : 0]])
    for (let i = 0; i < n; i++) {
      const kinds = ['cart', 'dung', 'straw', 'ladder', 'carpet', 'jars', 'jars'], kind = kinds[Math.floor(rand() * kinds.length)];
      const span = f.L - 6, s = 3 + rand() * span;
      if (f === S && Math.abs(s - (xd - x0)) < 4.5) continue;
      if (f !== S && (kind === 'cart') && f.L < 12) continue;
      laneItem({ ...f, s }, kind, rand, bag, col, hh);
    }
  // ---- the street door: a frame of brick, a carved lintel, the leaves open against the passage walls, studs, a step
  { const s = xd - x0, w2 = PW / 2;
    S.put(bag, 'brick_buff', s - w2 - 0.4, s - w2, 0, 2.95, 0, 0.14); S.put(bag, 'brick_buff', s + w2, s + w2 + 0.4, 0, 2.95, 0, 0.14);
    S.put(bag, 'brick_buff', s - w2 - 0.4, s + w2 + 0.4, 2.75, 3.05, 0, 0.14);
    S.put(bag, 'timber', s - w2 - 0.2, s + w2 + 0.2, 2.55, 2.75, 0, 0.18);
    for (let i = 0; i < 9; i++) S.put(bag, 'wood_dark', s - w2 - 0.05 + i * 0.28, s - w2 + 0.1 + i * 0.28, 2.5, 2.55, 0.0, 0.2);
    for (const sg of [-1, 1]) { const o = s + sg * (w2 - 0.06); S.put(bag, 'wood_dark', o, o + sg * 0.05, 0.1, 2.45, -1.2, -0.2); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) S.put(bag, 'iron', o + sg * 0.05, o + sg * 0.07, 0.5 + i * 0.5, 0.55 + i * 0.5, -1.05 + j * 0.45, -0.99 + j * 0.45); }
    S.put(bag, 'limestone', s - w2 - 0.3, s + w2 + 0.3, 0, 0.12, 0, 0.6);
    if (rich) {
      // the portal: banna'i around the door, a turquoise lunette, a lapis string-course, the way of the great pishtaqs in little
      const a = [x0, z1], b = [x1, z1], base = { a, b, n: [0, 1], d: 0.02, y: 0 };
      bannai(bag, { ...base, s0: s - w2 - 0.4, s1: s - w2 - 0.05, v0: 0.2, v1: 3.6, kind: 'kufic', base: LAP, ink: CRE, alt: WHI, ink2: TUR, cell: 0.2, seed: h.seed % 50 });
      bannai(bag, { ...base, s0: s + w2 + 0.05, s1: s + w2 + 0.4, v0: 0.2, v1: 3.6, kind: 'kufic', base: LAP, ink: CRE, alt: WHI, ink2: TUR, cell: 0.2, seed: h.seed % 50 + 3 });
      bannai(bag, { ...base, s0: s - w2 - 0.4, s1: s + w2 + 0.4, v0: 3.05, v1: 3.6, kind: 'diamond', base: TUR, ink: LAP, alt: WHI, ink2: CRE, cell: 0.27 });
      bannai(bag, { ...base, s0: 0.3, s1: W - 0.3, v0: HS - 1.2, v1: HS - 0.55, kind: 'checker', base: LAP, ink: TUR, alt: WHI, cell: 0.3 });
    }
    // the bench beside the door and the goods of the trade on the other side
    const side = rand() < 0.5 ? -1 : 1, bl = 2.4;
    const bs = side < 0 ? Math.max(0.6, s - w2 - 0.6 - bl) : Math.min(W - 0.6 - bl, s + w2 + 0.6);
    if (Math.abs(bs + bl / 2 - s) > w2 + bl / 2 + 0.3) bench(S, bag, col, bs, bl, rand);
    const ts = side < 0 ? Math.min(W - 2.6, s + 4.4) : Math.max(2.6, s - 4.4);
    if (ts > 2.4 && ts < W - 2.4 && Math.abs(ts - s) > 3) trade(S, h.trade, ts, rand, bag, col);
    // a water jar by the door; strings of dried gourds or peppers on a hook
    const jp = S.p(side < 0 ? s + w2 + 0.9 : s - w2 - 0.9, 0.4); F.waterJar(bag, jp[0], 0, jp[1], 0.8);
    addCloth(bag, 'cloth_red', clothBox(S.p(s + w2 + 0.55, 0)[0] - 0.03, 1.6, S.p(s + w2 + 0.55, 0.2)[1] - 0.03, S.p(s + w2 + 0.55, 0)[0] + 0.03, 2.4, S.p(s + w2 + 0.55, 0.2)[1] + 0.03), 2.4);
  }
  // ---- the front by rule (docs §17): a rich house has its banna'i portal and balcony; every other takes one of four forms by its seed:
  // plain (the bare lintel), canopy (a timber porch, aivancha, on two posts), gate (the door's block raised over the roof, a lattice in it), arch (a pointed arch of stepped brick with a lunette of tile);
  // and, for one in three of the others, a parapet of merlons
  const front = rich ? 'portal' : ['plain', 'canopy', 'gate', 'arch'][h.seed % 4];
  { const s = xd - x0, w2 = PW / 2;
    if (front === 'arch') {
      for (let i = 0; i < 6; i++) {
        const w = (PW + 0.9) * (1 - i / 6.5), y0 = 3.05 + i * 0.2;
        S.put(bag, 'brick_buff', s - w / 2, s + w / 2, y0, y0 + 0.2, 0, 0.16);
        if (i < 5) S.put(bag, i % 2 ? 'tile_cream' : 'tile_turquoise', s - w * 0.3, s + w * 0.3, y0, y0 + 0.2, 0.16, 0.19);
      }
    } else if (front === 'canopy') {
      const px = w2 + 0.55;
      for (const sg of [-1, 1]) {
        const p = S.p(s + sg * px, 1.05);
        bag.add('limestone', lathe([[0.17, 0], [0.17, 0.14], [0.11, 0.18]], 8, null, p[0], 0, p[1]));
        bag.add('wood_painted', lathe([[0.1, 0.18], [0.085, 1.5], [0.095, 2.95]], 8, null, p[0], 0, p[1]));
        S.put(bag, 'wood_ochre', s + sg * px - 0.08, s + sg * px + 0.08, 2.95, 3.15, 0.14, 1.2);
        col.circle(p[0], p[1], 0.13, 0, 3.15);
      }
      S.put(bag, 'wood_ochre', s - px - 0.1, s + px + 0.1, 2.95, 3.15, 1.0, 1.2);
      S.put(bag, 'timber', s - px - 0.2, s + px + 0.2, 3.15, 3.2, 0.14, 1.3);
      S.put(bag, 'reed_mat', s - px - 0.2, s + px + 0.2, 3.2, 3.24, 0.14, 1.3);
      S.put(bag, 'wood_painted', s - px - 0.2, s + px + 0.2, 3.05, 3.2, 1.22, 1.3);
    } else if (front === 'gate') {
      const a = S.p(s - 1.9, -1.0), b = S.p(s + 1.9, 0.05);
      const r0 = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
      bx(bag, WALL, r0[0], HS, r0[1], r0[2], HS + 1.15, r0[3]); col.rect(r0, HS, HS + 1.15);
      S.put(bag, 'brick_buff', s - 2.0, s + 2.0, HS + 1.15, HS + 1.21, -1.05, 0.1);
      S.put(bag, 'brick_buff', s - 0.55, s + 0.55, HS + 0.25, HS + 0.95, 0.05, 0.1); S.put(bag, 'lattice', s - 0.45, s + 0.45, HS + 0.32, HS + 0.88, 0.1, 0.14);
    }
    if (!rich && front !== 'gate' && h.seed % 3 === 1) for (let i = 0; i * 0.9 + 0.8 < W; i++) bx(bag, WALL, x0 + 0.35 + i * 0.9, HS + 0.71, z1 - 0.3, x0 + 0.8 + i * 0.9, HS + 1.05, z1);
  }
  // the roof of the street wing: a rich house's balcony of timber over the lane, level with the upper floor (a deck to step out on, rails on three sides)
  const balcony = () => {
    const s = W / 2 - 3, bw = 4.4, fy = H, dy = fy - 4.12;
    for (let i = 0; i < 4; i++) S.put(bag, 'timber', s - bw / 2 + 0.3 + i * (bw - 0.6) / 3 - 0.07, s - bw / 2 + 0.3 + i * (bw - 0.6) / 3 + 0.07, 3.55 + dy, 3.95 + dy, 0, 1.0);
    S.put(bag, 'timber', s - bw / 2, s + bw / 2, 3.95 + dy, 4.05 + dy, 0, 1.05);
    S.put(bag, 'wood_painted', s - bw / 2, s + bw / 2, 4.05 + dy, 4.12 + dy, 0, 1.05);
    for (let i = 0; i <= 8; i++) S.put(bag, 'timber', s - bw / 2 + i * bw / 8 - 0.03, s - bw / 2 + i * bw / 8 + 0.03, 4.12 + dy, 5.1 + dy - 0.1, 0.98, 1.04);
    S.put(bag, 'lattice', s - bw / 2, s + bw / 2, 4.3 + dy, 4.95 + dy, 0.98, 1.02);
    S.put(bag, 'timber', s - bw / 2, s + bw / 2, 5.0 + dy, 5.08 + dy, 0.95, 1.07);
    for (const sg of [-1, 1]) S.put(bag, 'timber', s + sg * 0.55 - 0.05, s + sg * 0.55 + 0.05, 4.12 + dy, 5.0 + dy, 0.0, 0.1);
    S.put(bag, 'timber', s - 0.65, s + 0.65, 4.12 + dy + 2.1, 4.12 + dy + 2.2, 0, 0.12);
    const rc = (a, b, y0, y1) => { const p = S.p(a, 0), q = S.p(b, 1.05); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y0, y1); };
    const fl = (a, b, o0, o1, y) => { const p = S.p(a, o0), q = S.p(b, o1); col.floor([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y); };
    fl(s - bw / 2, s + bw / 2, 0.0, 1.05, fy);
    // rails: the front and the two ends (the wall side is the house)
    { const p = S.p(s - bw / 2, 0.95), q = S.p(s + bw / 2, 1.05); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], fy, fy + 1.0); }
    for (const e of [s - bw / 2, s + bw / 2 - 0.1]) { const p = S.p(e, 0), q = S.p(e + 0.1, 1.05); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], fy, fy + 1.0); }
    void rc;
  };
  if (rich) balcony();
  // ---- the passage's screen, the court
  const sx = xd, scz = zs - 1.5;
  solid(fr, 'kahgel', sx - 1.8, scz - 0.2, sx + 1.8, scz + 0.2, 0, 2.3);
  bx(bag, 'brick_buff', sx - 1.84, 2.3, scz - 0.24, sx + 1.84, 2.4, scz + 0.24);
  bx(bag, 'brick_paving', xl, 0, zf, xr, 0.07, zs);
  // the talar: a platform, four columns on stone bases, the beam, a painted ceiling, the back wall's dado
  bx(bag, 'timber', -3.6, 0, zb, 3.6, 0.45, zf); col.floor([-3.6, zb, 3.6, zf], 0.45);
  bx(bag, 'limestone', -1.4, 0, zf, 1.4, 0.22, zf + 0.45); col.floor([-1.4, zf, 1.4, zf + 0.45], 0.22);
  for (const cxp of [-3.05, -1.0, 1.0, 3.05]) {
    bag.add('limestone', lathe([[0.2, 0], [0.2, 0.18], [0.14, 0.22]], 8, null, cxp, 0.45, zf - 0.3));
    bag.add('wood_painted', lathe([[0.11, 0], [0.095, 2.2], [0.1, 2.5]], 8, null, cxp, 0.67, zf - 0.3));
    bag.add('wood_ochre', box(cxp - 0.28, 3.15, zf - 0.58, cxp + 0.28, 3.3, zf - 0.02));
    bag.add('wood_painted', box(cxp - 0.18, 3.0, zf - 0.48, cxp + 0.18, 3.15, zf - 0.12));
    col.circle(cxp, zf - 0.3, 0.14, 0.45, 3.3);
  }
  bx(bag, 'timber', -3.6, 3.3, zf - 0.5, 3.6, 3.6, zf - 0.1);
  bx(bag, 'ceiling_painted', -3.6, 3.55, zb, 3.6, 3.62, zf - 0.5);
  for (let i = 0; i < 6; i++) bx(bag, 'wood_painted', -3.5 + i * 1.4, 3.3, zb, -3.4 + i * 1.4, 3.55, zf - 0.5);
  bx(bag, 'plaster_persian', -3.6, 0.45, zb - 0.01, 3.6, 3.3, zb + 0.02);
  if (rich) bannai(bag, { a: [-3.6, zb], b: [3.6, zb], n: [0, 1], d: 0.03, y: 0.45, s0: 0.1, s1: 7.1, v0: 0.0, v1: 1.1, kind: 'diamond', base: TUR, ink: LAP, alt: WHI, ink2: CRE, cell: 0.4 });
  else bx(bag, 'tile_turquoise', -3.6, 0.45, zb + 0.02, 3.6, 1.3, zb + 0.05);
  for (const sg of [-1, 1]) for (const cxn of [sg * 1.6, sg * 2.9]) { bx(bag, 'wood_dark', cxn - 0.25, 1.0, zb + 0.02, cxn + 0.25, 2.2, zb + 0.08); }      // niches
  if (full) {
    F.carpet(bag, 0, 0.45, (zb + zf) / 2 - 0.1, 6.0, 1.9, 0, 'persian');
    for (let i = 0; i < 5; i++) F.bolster(bag, -2.4 + i * 1.2, 0.47, zb + 0.4, 1.0, 0.13, 0, i % 2 ? 'cloth_red' : 'cloth_indigo', 'cloth_ochre');
    F.trayTable(bag, -0.4, 0.45, (zb + zf) / 2 + 0.1, { seed: h.seed + 1 });
    F.cushion(bag, 1.2, 0.47, (zb + zf) / 2, 0.7, 0.55, 0.12, 0.2, 'cloth_green'); F.cushion(bag, -1.8, 0.47, (zb + zf) / 2 + 0.2, 0.7, 0.55, 0.12, 2.9, 'cloth_maroon');
    F.rahle(bag, 2.2, 0.47, (zb + zf) / 2 + 0.2, 0.4);
    F.chest(bag, -3.1, 0.45, zb + 0.5, 0.6, 0.9, 0.55, Math.PI / 2, 'wood_painted');
    F.oilLamp(bag, lights, -2.05, 1.9, zb + 0.1, 'bronze', 1.3);
    F.ewer(bag, 0.9, 0.62, (zb + zf) / 2 + 0.1, 0.8, 0, 'bronze');
  } else F.kilim(bag, 0, 0.45, (zb + zf) / 2, 5.0, 1.5, 0, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
  // ---- the court: a pool with a coping, a tandoor, firewood, a charpoy, washing on a line, a trellis, jars
  const cc = [0, (zf + zs) / 2 + 0.6];
  if (rand() < 0.55) {
    const pw = 1.5 + rand() * 0.5, pd = 1.1 + rand() * 0.3, px = rand() < 0.5 ? -1.5 : 1.5;
    bx(bag, 'limestone', px - pw - 0.3, 0, cc[1] - pd - 0.3, px + pw + 0.3, 0.38, cc[1] + pd + 0.3); col.rect([px - pw - 0.3, cc[1] - pd - 0.3, px + pw + 0.3, cc[1] + pd + 0.3], 0, 0.38);
    bx(bag, 'water', px - pw, 0.3, cc[1] - pd, px + pw, 0.34, cc[1] + pd);
  }
  { const tx = rsgn < 0 ? xl + 0.8 : xr - 0.8, tz = zs - 1.2;
    bag.add('terracotta', lathe([[0.55, 0], [0.55, 0.35], [0.45, 0.65], [0.2, 0.82], [0.001, 0.84]], 12, null, tx, 0, tz)); col.circle(tx, tz, 0.58, 0, 0.9);
    woodStack(bag, tx + (rsgn < 0 ? 0.2 : -0.2), tz - 1.1, 0, 0.9, 3);
    F.waterJar(bag, tx, 0, tz - 2.2, 0.9); }
  if (full) {
    const lx = rsgn < 0 ? xl + 1.0 : xr - 1.0;
    for (const zz of [zf + 1.0, zf + 3.6]) { bx(bag, 'timber', lx - 0.03, 0, zz - 0.03, lx + 0.03, 2.1, zz + 0.03); }
    bag.add('rope_fibre', place(box(-0.01, -0.01, 0, 0.01, 0.01, 2.6), lx, 2.05, zf + 1.0));
    ['cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre'].forEach((m, i) => addCloth(bag, m, clothBox(lx - 0.25, 1.15, zf + 1.2 + i * 0.55, lx + 0.25, 2.05, zf + 1.28 + i * 0.55), 2.05));
    F.charpoy(bag, col, rsgn < 0 ? xl + 1.5 : xr - 1.5, 0, zf + 6.6 > zs - 3 ? zf + 3 : zf + 6.6, Math.PI / 2, { quilt: 'cloth_maroon' });
  }
  // ---- the roof stair, in the court beside the side wing without the room, climbing north to the roof
  { const sg = -rsgn, xa = sg < 0 ? xl : xr - 1.0, xb = sg < 0 ? xl + 1.0 : xr, nst = 9, z2 = zs - 0.5, run = z2 - (zf + 0.8), st = run / nst, rise = H / nst;
    if (Math.abs(sx - (xa + xb) / 2) > 2.6 || true) {
      for (let i = 0; i < nst; i++) bx(bag, 'brick_buff', xa, 0, z2 - (i + 1) * st, xb, rise * (i + 1), z2 - i * st);
      col.ramp([xa, z2 - run, xb, z2], 0, H, 'n');
      bx(bag, 'kahgel', xa, 0, z2 - run - 0.1, xb, H, z2 - run);
    }
  }
  // ---- the roof: bare, with the fruit drying on mats, a heap of fuel, a pigeon-house now and then, a little dome
  if (full) {
    const rx = rsgn > 0 ? xr + 0.8 : x0 + 0.8;
    bx(bag, 'reed_mat', rx, H + 0.01, zf + 0.9, rx + 1.9, H + 0.04, zf + 2.2);
    for (let i = 0; i < 28; i++) bx(bag, i % 4 ? 'cloth_ochre' : 'cloth_red', rx + 0.1 + (i % 7) * 0.26, H + 0.04, zf + 1.0 + Math.floor(i / 7) * 0.28, rx + 0.2 + (i % 7) * 0.26, H + 0.08, zf + 1.1 + Math.floor(i / 7) * 0.28);
    if (rand() < 0.4) { const px = (x0 + xl) / 2 * (rsgn > 0 ? -1 : 1) + (rsgn > 0 ? 0 : 0); bx(bag, 'kahgel', px - 0.7, HN, z0 + 1.5, px + 0.7, HN + 1.6, z0 + 2.9); for (let i = 0; i < 6; i++) bx(bag, 'wood_dark', px - 0.5 + (i % 3) * 0.4, HN + 0.9 + Math.floor(i / 3) * 0.35, z0 + 2.9, px - 0.4 + (i % 3) * 0.4, HN + 1.0 + Math.floor(i / 3) * 0.35, z0 + 2.95); }
  }
  if (!rich && rand() < 0.28 && !(upperFacts(h).room && upperFacts(h).room.e > 0)) { const r = 1.5; bag.add('kahgel', lathe([[r, 0], [r * 0.96, r * 0.35], [r * 0.7, r * 0.75], [r * 0.3, r * 0.98], [0.001, r]], 12, null, x1 - 3, HS + 0.05, z1 - 2.4)); }
  upperFloor({ bag, col, lights }, h);
  void lathe; void rod; void B;
}

/**
 * tim_garden: a lot walled in as an orchard garden { h }: the mud wall (2.4 m) with a coping, a gate toward the lane of
 * the house door's side, a platform (takhta) with a carpet and a tea service under the trees, a pool, a melon patch.
 */
export function timGarden(el, ctx) {
  const h = el.h, G = houseGeom(h), fr = frame(ctx, G.cx, G.cz, h.k), { bag, col, lights } = fr, rand = rng(h.seed + 11);
  const W = G.W, D = G.D, x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2, T = 0.55, HW = 2.4;
  const gx = Math.max(x0 + 3, Math.min(x1 - 3, h.xd)), GW = 2.4;
  if (el.simple) {
    // the far form: the wall round the orchard, the gate's lintel
    const wb = (xa, za, xb, zb2) => bx(bag, 'kahgel', xa, 0, za, xb, HW, zb2);
    wb(x0, z0, x1, z0 + T); wb(x0, z0 + T, x0 + T, z1); wb(x1 - T, z0 + T, x1, z1); wb(x0 + T, z1 - T, gx - GW / 2, z1); wb(gx + GW / 2, z1 - T, x1 - T, z1);
    bx(bag, 'kahgel', gx - GW / 2, HW - 0.2, z1 - T, gx + GW / 2, HW, z1);
    bx(bag, 'wood_dark', gx - GW / 2, 0, z1 - T - 0.05, gx + GW / 2, HW - 0.2, z1 - T);      // the gate's mouth
    return;
  }
  const wall = (xa, za, xb, zb2) => { solid(fr, 'kahgel', xa, za, xb, zb2, 0, HW); bx(bag, 'brick_buff', xa - 0.05, HW, za - 0.05, xb + 0.05, HW + 0.1, zb2 + 0.05); };
  wall(x0, z0, x1, z0 + T); wall(x0, z0 + T, x0 + T, z1); wall(x1 - T, z0 + T, x1, z1);
  wall(x0 + T, z1 - T, gx - GW / 2, z1); wall(gx + GW / 2, z1 - T, x1 - T, z1);
  bx(bag, 'timber', gx - GW / 2 - 0.1, HW - 0.2, z1 - T - 0.05, gx + GW / 2 + 0.1, HW + 0.1, z1 + 0.05); col.rect([gx - GW / 2, z1 - T, gx + GW / 2, z1], HW - 0.2, HW + 0.1);
  for (const sg of [-1, 1]) bag.add('wood_dark', box(gx + sg * (GW / 2 - 0.06), 0.1, z1 - T - 0.9, gx + sg * (GW / 2 - 0.02), 2.1, z1 - T - 0.05));
  bx(bag, 'limestone', gx - GW / 2, 0, z1 - T, gx + GW / 2, 0.1, z1 + 0.5);
  // the foot of the wall and patches, beam-less: the garden wall is plain mud
  const outs = [faceOf([x0, z1], [x1, z1], [0, 1]), faceOf([x1, z0], [x0, z0], [0, -1]), faceOf([x1, z1], [x1, z0], [1, 0]), faceOf([x0, z0], [x0, z1], [-1, 0])];
  outs.forEach((f, i) => { f.put(bag, 'mud_plaster', 0, f.L, 0, 0.5, 0, 0.03); for (let k = 0; k < Math.round(f.L / 4); k++) { if (i === 0 && Math.abs(f.L * 0 + 1) && false) continue; const s = 0.5 + rand() * (f.L - 1.8); if (i === 0 && Math.abs(s - (gx - x0)) < 2.2) continue; f.put(bag, 'brick_buff', s, s + 0.6 + rand() * 0.8, 0.7 + rand() * 1.0, 1.1 + rand() * 1.0, 0, 0.03); } });
  // inside: a takhta (raised wooden platform) under the trees with a carpet, bolsters, a tray and tea
  const px = rand() < 0.5 ? -2.5 : 2.5, pz = -1.5;
  bx(bag, 'timber', px - 2.1, 0.0, pz - 1.6, px + 2.1, 0.62, pz + 1.6); col.floor([px - 2.1, pz - 1.6, px + 2.1, pz + 1.6], 0.62);
  for (const dx of [-2.1, 2.1]) for (const dz of [-1.6, 1.6]) bx(bag, 'wood_dark', px + dx - 0.07, 0, pz + dz - 0.07, px + dx + 0.07, 1.9, pz + dz + 0.07);
  bx(bag, 'reed_mat', px - 2.2, 1.9, pz - 1.7, px + 2.2, 1.97, pz + 1.7);              // a roof of reeds over the platform
  F.carpet(bag, px, 0.62, pz, 3.6, 2.8, 0, 'persian');
  for (let i = 0; i < 3; i++) F.bolster(bag, px - 1.4 + i * 1.4, 0.64, pz - 1.15, 1.0, 0.13, 0, i % 2 ? 'cloth_red' : 'cloth_indigo', 'cloth_ochre');
  F.trayTable(bag, px, 0.62, pz + 0.1, { seed: h.seed }); F.ewer(bag, px + 0.9, 0.62, pz + 0.3, 0.8, 0, 'bronze'); F.oilLamp(bag, lights, px - 1.5, 0.62, pz + 0.9, 'bronze', 0.8);
  // a channel (aryk) feeding a pool, a melon patch with its melons
  const wx = -px, wz = 2.5;
  bx(bag, 'limestone', wx - 1.5, 0, wz - 1.1, wx + 1.5, 0.36, wz + 1.1); col.rect([wx - 1.5, wz - 1.1, wx + 1.5, wz + 1.1], 0, 0.36); bx(bag, 'water', wx - 1.2, 0.28, wz - 0.8, wx + 1.2, 0.32, wz + 0.8);
  melons(bag, px - 1.5, 3.4, 10, rand); melons(bag, px + 1.5, 3.9, 8, rand);
  F.waterJar(bag, px + 2.7, 0, pz + 1.2, 0.9); woodStack(bag, x0 + 1.2, z0 + 1.2, 0, 1.0, 3);
  void lathe; void rod; void place;
}
