// The walk-in house of Delphi (docs/settlements/delphi.md §4.5): a courtyard house of the Delphians on its terrace, its front to the
// lane on the south. A range of rooms on the lane — the shop or workroom with its wide opening, the passage with the street door, a
// room beside it — the court behind it between two walls, and the back range against the hill: kitchen, store, the room of the loom.
// Plastered mudbrick on a rubble socle, tiled roofs, every doorway open, every room fitted. The element is `delphi_house`
// { rect, seed, y, trade, fall, tier }; `houseRooms` gives the rooms of the plan. Front to the south (z1) always.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod, frustum } from '../../core/geom.js';
import { merge } from '../greek/columns.js';
import { frame } from '../greek/agora.js';
import { face, fig } from '../greek/ward.js';
import { rangeRoof, kline, trapeza, krater, lampstand } from '../greek/house-interior.js';
import { furnishShop } from '../greek/shops.js';
import { vase } from '../greek/vessels.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const T = 0.5, TI = 0.4, FR = 4.9, BK = 3.9, H = 3.2, DOOR = 0.95;
const TONES = ['mud_plaster', 'mud_plaster', 'plaster_white', 'plaster_ochre', 'plaster_white', 'plaster_grey', 'mud_plaster'];

/** The geometry of the house in the mirrored local frame: cells of the front range and the back range. */
function geom(rect, seed) {
  const F = frame(rect, 's'), { L, D } = F, mirror = (seed >> 3) % 2 === 1;
  const G = mirror ? { ...F, P: (u, v) => F.P(L - u, v), R: (u0, v0, u1, v1) => F.R(L - u1, v0, L - u0, v1) } : F;
  const room = L >= 11.0, pw = 2.0;
  const pb = room ? L - T - 2.6 - TI : L - T, pa = pb - pw, ss = pa - TI;
  const kx = T + (L - 2 * T) * 0.36, sx = T + (L - 2 * T) * 0.68;
  return { F, G, L, D, room, pa, pb, ss, kx, sx, mirror, v1: FR - TI / 2, v2: D - BK + TI / 2 };
}
/** Where the doors are, in the plain (unmirrored) front frame: the passage's centre and the shop's opening. */
export function houseDoors(rect, seed) {
  const g = geom(rect, seed), m = (u) => (g.mirror ? g.L - u : u), so = [Math.min(m(T + 0.7), m(Math.min(T + 3.1, g.ss - 0.6))), Math.max(m(T + 0.7), m(Math.min(T + 3.1, g.ss - 0.6)))];
  return { du: m((g.pa + g.pb) / 2), shop: false, two: false, shopU: -1, so };
}
/** The rooms the plan registers (world rectangles). */
export function houseRooms(rect, seed, y, trade) {
  const g = geom(rect, seed), { G, D, room, ss, pb, kx, sx, L } = g;
  const R = (u0, v0, u1, v1, id, o = {}) => ({ id, rect: G.R(u0, v0, u1, v1), y, kind: 'inner', ...o });
  const out = [R(T, T, ss, g.v1, `${trade} shop`, { market: false })];
  if (room) out.push(R(pb + TI, T, L - T, g.v1, 'room'));
  out.push(R(T, g.v2, kx - TI / 2, D - T, 'kitchen'), R(kx + TI / 2, g.v2, sx - TI / 2, D - T, 'store'), R(sx + TI / 2, g.v2, L - T, D - T, 'loom room'));
  return out;
}

function delphiHouse(el, ctx) {
  const { bag, col, lights } = ctx, y = el.y ?? 0, rand = rng(el.seed || 1), tier = el.tier ?? 2, trade = el.trade ?? 'bronze', sd = Math.max(0.6, (el.fall ?? 0) + 0.3);
  const { F, G, L, D, room, pa, pb, ss, kx, sx, v1, v2 } = geom(el.rect, el.seed || 1), plaster = TONES[Math.floor(rand() * TONES.length)];
  const P = (u, v) => G.P(u, v);
  const seg = (r, y0, y1, m, solid = true) => { if (r[2] - r[0] < 0.01 || r[3] - r[1] < 0.01) return; bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };
  /** A wall along u at depth v (thickness t) from a to b with doorways [[u0, u1]]; or along v at fixed u. */
  const wall = (alongU, c, a, b, t, doors, h = H, outer = false) => {
    const R = (p, q) => (alongU ? G.R(p, c - t / 2, q, c + t / 2) : G.R(c - t / 2, p, c + t / 2, q));
    let u = a;
    for (const [d0, d1] of [...doors].sort((p, q) => p[0] - q[0])) {
      seg(R(u, d0), y - sd, y + 0.7, 'rubble'); seg(R(u, d0), y + 0.7, y + h, plaster);
      seg(R(d0, d1), y + 2.2, y + h, plaster);
      const r = alongU ? G.R(d0 - 0.1, c - t / 2 - 0.02, d1 + 0.1, c + t / 2 + 0.02) : G.R(c - t / 2 - 0.02, d0 - 0.1, c + t / 2 + 0.02, d1 + 0.1);
      bag.add('timber', box(r[0], y + 2.08, r[1], r[2], y + 2.22, r[3]));
      const th = R(d0, d1); bag.add('limestone', box(th[0], y - 0.1, th[1], th[2], y + 0.04, th[3]));
      u = d1;
    }
    seg(R(u, b), y - sd, y + 0.7, 'rubble'); seg(R(u, b), y + 0.7, y + h, plaster);
    void outer;
  };
  // ── floors: beaten earth in the rooms, pebbles in the court
  const fl = (u0, v0, u1, v1, m, dy = 0) => { const r = G.R(u0, v0, u1, v1); bag.add(m, box(r[0], y - 0.3, r[1], r[2], y - 0.02 + dy, r[3])); col.floor(r, y + dy - 0.02); };
  fl(T, T, L - T, v1, 'lime_plaster'); fl(T, v1, L - T, v2, 'pebbles'); fl(T, v2, L - T, D - T, 'lime_plaster');
  // ── the front wall on the lane: the shop's wide opening and the street door in the passage; the court wall; the back wall
  const so = [T + 0.7, Math.min(T + 3.1, ss - 0.6)];
  wall(true, T / 2, 0, L, T, [so, [(pa + pb) / 2 - 0.55, (pa + pb) / 2 + 0.55]]);
  wall(true, D - T / 2, 0, L, T, []);
  wall(false, T / 2, T, D - T, T, []);                                // the side wall at u = 0 (for the whole depth)
  wall(false, L - T / 2, T, D - T, T, []);
  // the inner walls of the front range: shop | passage | room, and the wall on the court (the shop's back door, the room's)
  wall(false, ss + TI / 2, T, v1, TI, []);
  wall(false, pb + TI / 2 - (room ? 0 : TI), T, v1, TI, room ? [] : [[100, 101]]);
  if (!room) { /* the passage is the last cell: its end is the side wall */ }
  wall(true, v1 + TI / 2 - TI / 2, T, ss, TI, [[ss - 1.5, ss - 0.55]]);
  if (room) wall(true, v1, pb + TI, L - T, TI, [[pb + TI + 0.5, pb + TI + 1.45]]);
  // the back range: the wall on the court with three doors, the partitions
  wall(true, v2, T, L - T, TI, [[kx - 1.45, kx - 0.5], [(kx + sx) / 2 - 0.5, (kx + sx) / 2 + 0.45], [sx + 0.5, sx + 1.45]]);
  wall(false, kx, v2, D - T, TI, []); wall(false, sx, v2, D - T, TI, []);
  // the court's side walls are the house's own side walls: lowered to 2.7 m where they enclose the court (coped below)
  // the front range by the house's kind (el.variant, 0–3), so that a row of walk-in houses shows different fronts: 0 the tiled hip over plaster; 1 a loft storey
  // over the front range with a pair of shuttered windows and a ledge (jettied on beams); 2 a flat roof terrace behind a parapet with its spouts and a red dado;
  // 3 an ashlar front of limestone with a painted frieze and a cornice
  const fr = G.R(0, 0, L, v1 + TI / 2), vr = el.variant ?? 0, openAt = [so, [(pa + pb) / 2 - 0.55, (pa + pb) / 2 + 0.55]].sort((p, q) => p[0] - q[0]);
  const fpiece = (mat, u0, u1, d0, d1, y0, y1) => { const r = G.R(u0, d0, u1, d1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); };
  if (vr === 1) {
    bag.add('timber', box(fr[0] + 0.05, y + H - 0.12, fr[1] + 0.05, fr[2] - 0.05, y + H, fr[3] - 0.05));
    bag.add(plaster, box(fr[0], y + H, fr[1], fr[2], y + H + 2.7, fr[3])); col.rect(fr, y + H, y + H + 2.7);
    fpiece('timber', 0, L, -0.45, 0.0, y + H - 0.2, y + H + 0.05);                                   // the beams that carry the loft out over the lane
    for (let k = 0; k < 3; k++) { const u = L * (k + 0.5) / 3; fpiece('opening', u - 0.4, u + 0.4, -0.05, 0.0, y + H + 0.8, y + H + 1.9); for (const sg of [-1, 1]) fpiece('shutter_brown', sg < 0 ? u - 0.72 : u + 0.42, sg < 0 ? u - 0.42 : u + 0.72, -0.07, 0.0, y + H + 0.8, y + H + 1.9); fpiece('timber', u - 0.5, u + 0.5, -0.12, 0.0, y + H + 0.7, y + H + 0.8); }
    rangeRoof(ctx, fr, y + 2.7, H);
  } else if (vr === 2) {
    bag.add('timber', box(fr[0] + 0.05, y + H - 0.12, fr[1] + 0.05, fr[2] - 0.05, y + H, fr[3] - 0.05));
    bag.add('mud_plaster', box(fr[0] - 0.1, y + H, fr[1] - 0.1, fr[2] + 0.1, y + H + 0.14, fr[3] + 0.1));
    for (const r of [G.R(-0.1, -0.1, L + 0.1, 0.1), G.R(-0.1, v1 + TI / 2 - 0.1, L + 0.1, v1 + TI / 2 + 0.1), G.R(-0.1, 0, 0.1, v1 + TI / 2), G.R(L - 0.1, 0, L + 0.1, v1 + TI / 2)]) bag.add(plaster, box(r[0], y + H + 0.14, r[1], r[2], y + H + 0.62, r[3]));
    for (let k = 0; k < 3; k++) fpiece('limestone', L * (k + 0.5) / 3 - 0.1, L * (k + 0.5) / 3 + 0.1, -0.3, 0.0, y + H + 0.18, y + H + 0.26);
    { let u = 0; for (const [d0, d1] of [...openAt, [L, L]]) { if (d0 - u > 0.05) fpiece('wall_red', u, d0, -0.05, 0.0, y + 0.7, y + 1.4); u = d1; } }                  // the red dado either side of the openings
  } else {
    rangeRoof(ctx, fr, y, H);
    if (vr === 3) {
      let u = 0; for (const [d0, d1] of [...openAt, [L, L]]) { if (d0 - u > 0.05) fpiece('limestone', u, d0, -0.1, 0.0, y, y + H); u = d1; }
      for (const [d0, d1] of openAt) fpiece('limestone', d0 - 0.1, d1 + 0.1, -0.1, 0.0, y + 2.4, y + H);
      fpiece('limestone', -0.1, L + 0.1, -0.22, 0.0, y + H - 0.3, y + H); fpiece('paint_blue', 0.1, L - 0.1, -0.12, -0.02, y + H - 0.62, y + H - 0.32);
    }
  }
  rangeRoof(ctx, G.R(0, v2 - TI / 2, L, D), y, H);
  for (const [ri, r] of [G.R(-0.3, 0, L + 0.3, v1 + TI / 2), G.R(-0.3, v2 - TI / 2, L + 0.3, D)].entries()) {
    if (ri === 0 && vr === 2) continue;
    const yb = ri === 0 && vr === 1 ? y + 2.7 : y;
    const along = r[2] - r[0] > r[3] - r[1], mx = (r[0] + r[2]) / 2, mz = (r[1] + r[3]) / 2, rise = (along ? r[3] - r[1] : r[2] - r[0]) * 0.28;
    bag.add('roof_ridge', along ? box(r[0] - 0.1, yb + H + rise - 0.02, mz - 0.1, r[2] + 0.1, yb + H + rise + 0.12, mz + 0.1) : box(mx - 0.1, yb + H + rise - 0.02, r[1] - 0.1, mx + 0.1, yb + H + rise + 0.12, r[3] + 0.1));
  }
  // the door leaf standing open inward, the shop's shutter propped as an awning, a threshold and a step on the lane
  { const u = (pa + pb) / 2, r = G.R(u - 0.5, T, u - 0.44, T + 0.9); bag.add('wood_dark', box(r[0], y + 0.04, r[1], r[2], y + 2.05, r[3]));
    const st = G.R(u - 0.75, -0.4, u + 0.75, 0.0); bag.add('limestone', box(st[0], y - 0.12, st[1], st[2], y + 0.02, st[3]));
    const fm = [G.R(u - 0.66, -0.1, u - 0.52, 0.12), G.R(u + 0.52, -0.1, u + 0.66, 0.12)];
    for (const q of fm) bag.add('timber', box(q[0], y + 0.05, q[1], q[2], y + 2.3, q[3]));
    const hd = G.R(u - 0.74, -0.12, u + 0.74, 0.14); bag.add('timber', box(hd[0], y + 2.2, hd[1], hd[2], y + 2.4, hd[3]));
    const aw = G.R(so[0] - 0.1, -1.4, so[1] + 0.1, -0.1); bag.add('timber', frustum(aw, y + 2.15, y + 2.4, 0, 0, 0, 0));
    for (const uu of [so[0] - 0.04, so[1] + 0.04]) { const p = P(uu, -1.35); bag.add('timber', rod([p[0], y, p[1]], [p[0], y + 2.17, p[1]], 0.04, 5)); }
    const cb = G.R(so[0] + 0.1, -0.05, so[1] - 0.1, 0.5); bag.add('timber', box(cb[0], y + 0.05, cb[1], cb[2], y + 0.92, cb[3]));
    const bd = G.R(so[0] + 0.05, -0.34, so[1] - 0.05, 0.0); bag.add('wood_dark', box(bd[0], y + 0.88, bd[1], bd[2], y + 0.94, bd[3]));
    col.rect(cb, y, y + 0.92);
    if (tier > 1) { const sg = G.R(so[0] + 0.3, -0.62, so[1] - 0.3, -0.56); bag.add('wood_ochre', box(sg[0], y + 2.65, sg[1], sg[2], y + 3.1, sg[3])); const em = G.R(so[0] + 0.7, -0.64, so[1] - 0.7, -0.62); bag.add(['paint_blue', 'wall_red', 'paint_ochre', 'pottery_dark'][(el.seed || 0) % 4], box(em[0], y + 2.75, em[1], em[2], y + 3.0, em[3])); }
  }
  // the weathering of the four faces (shared with the walls of Athens)
  const rr = rng((el.seed || 1) + 5);
  face(ctx, F, { u0: 0, u1: L, v: 0, s: -1, y, H, rand: rr, tier: Math.max(1, tier), wins: 0, spout: true, plaster });
  face(ctx, F, { u0: 0, u1: L, v: D, s: 1, y, H, rand: rr, tier: Math.max(1, tier), wins: 2, spout: false, plaster });
  for (const side of ['e', 'w']) { const S = frame(el.rect, side); face(ctx, S, { u0: 0, u1: S.L, v: 0, s: -1, y, H, rand: rr, tier: Math.max(1, tier), wins: 1, spout: false, plaster }); }
  // ── the shop
  const ia = T, ib = ss, va = T, vb = v1 + 0.0;
  if (['bronze', 'perfume', 'cloth', 'wine', 'carpenter'].includes(trade)) {
    // furnishShop works in the street frame (u from the front, v from the front): ia/ib along u, va/vb in v; the counter is at the street opening
    const FF = { R: (u0, v0, u1, v1) => G.R(u0, v0, u1, v1), P, out: [0, 1] };
    furnishShop(ctx, FF, y, ia, ib, va, vb, trade, rand);
  } else if (trade === 'pottery') {
    for (const u of [ia + 0.4, ib - 0.9]) { const r = G.R(u, vb - 0.9, u + 0.5, vb - 0.4); bag.add('timber', box(r[0], y, r[1], r[2], y + 1.8, r[3])); }
    for (const h of [0.5, 1.0, 1.5]) { const r = G.R(ia + 0.2, vb - 0.9, ib - 0.2, vb - 0.4); bag.add('timber', box(r[0], y + h - 0.04, r[1], r[2], y + h, r[3])); for (let u = ia + 0.5; u < ib - 0.5; u += 0.34) { const p = P(u, vb - 0.65); vase(bag, ['hydria', 'oinochoe', 'kylix', 'lekythos', 'amphora'][Math.floor(rand() * 5)], p[0], y + h, p[1], { s: 0.55 + rand() * 0.25, dark: rand() < 0.5, seg: 8 }); } }
    const wp = P((ia + ib) / 2 + 0.3, va + 2.4); bag.add('limestone', lathe([[0.4, 0], [0.38, 0.5], [0.001, 0.52]], 12, null, wp[0], y, wp[1])); bag.add('terracotta', lathe([[0.28, 0.5], [0.2, 0.7], [0.001, 0.72]], 10, null, wp[0], y, wp[1])); col.circle(wp[0], wp[1], 0.42, y, y + 0.7);
    for (let k = 0; k < 4; k++) { const p = P(ia + 0.6 + k * 0.45, va + 0.9); vase(bag, 'kylix', p[0], y + 0.95, p[1], { s: 1.0, seg: 8 }); }
  } else if (trade === 'weaver') {
    const cs = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'linen', 'cloth_brown'];
    for (let k = 0; k < 2; k++) { const p = P(ia + 0.8 + k * 1.8, vb - 0.5), a = G.R(p[0] - 0, 0, 0, 0); void a;
      const r = G.R(ia + 0.5 + k * 1.8, vb - 0.65, ia + 0.58 + k * 1.8, vb - 0.4), r2 = G.R(ia + 1.5 + k * 1.8, vb - 0.65, ia + 1.58 + k * 1.8, vb - 0.4), bm = G.R(ia + 0.45 + k * 1.8, vb - 0.6, ia + 1.65 + k * 1.8, vb - 0.46);
      bag.add('timber', box(r[0], y, r[1], r[2], y + 2.0, r[3])); bag.add('timber', box(r2[0], y, r2[1], r2[2], y + 2.0, r2[3])); bag.add('timber', box(bm[0], y + 1.9, bm[1], bm[2], y + 2.0, bm[3]));
      const cl = G.R(ia + 0.6 + k * 1.8, vb - 0.58, ia + 1.5 + k * 1.8, vb - 0.52); bag.add(cs[Math.floor(rand() * 6)], box(cl[0], y + 0.9, cl[1], cl[2], y + 1.9, cl[3]));
      const wt = G.R(ia + 0.6 + k * 1.8, vb - 0.58, ia + 1.5 + k * 1.8, vb - 0.52); bag.add('linen', box(wt[0], y + 0.3, wt[1], wt[2], y + 0.9, wt[3])); col.rect(G.R(ia + 0.45 + k * 1.8, vb - 0.7, ia + 1.65 + k * 1.8, vb - 0.4), y, y + 2.0); }
    for (let k = 0; k < 3; k++) { const p = P(ia + 0.7 + k * 0.6, va + 0.9); bag.add(cs[k], box(p[0] - 0.2, y + 0.94, p[1] - 0.15, p[0] + 0.2, y + 1.06, p[1] + 0.15)); }
  } else { // the cook-shop: a stone hearth with a pot, bread on the counter, a bench
    const [hx, hz] = P(ib - 1.1, vb - 0.9);
    bag.add('rubble', lathe([[0.7, 0], [0.7, 0.55], [0.55, 0.6], [0.001, 0.6]], 12, null, hx, y, hz)); bag.add('lacquer_black', lathe([[0.5, 0.58], [0.001, 0.62]], 10, null, hx, y, hz));
    bag.add('flame', lathe([[0.001, 0], [0.2, 0.02], [0.05, 0.22], [0.001, 0.3]], 6, null, hx, y + 0.62, hz)); bag.add('pottery_dark', lathe([[0.001, 0], [0.18, 0.04], [0.22, 0.2], [0.17, 0.32], [0.001, 0.32]], 12, null, hx, y + 0.62, hz));
    lights.push({ at: [hx, y + 1.0, hz], color: '#ff8030', intensity: 1.6, distance: 5 }); col.circle(hx, hz, 0.7, y, y + 0.62);
    for (let k = 0; k < 5; k++) { const p = P(ia + 1.9 + k * 0.4, va + 0.7); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.01], [0.13, 0.05], [0.001, 0.06]], 8, null, p[0], y + 0.95, p[1])); bag.add('thatch', lathe([[0.001, 0.05], [0.1, 0.06], [0.05, 0.1], [0.001, 0.11]], 8, null, p[0], y + 0.95, p[1])); }
    for (let k = 0; k < 3; k++) { const p = P(ia + 0.5, vb - 1.4 - k * 0.6); vase(bag, 'amphora', p[0], y, p[1], { s: 1.0, dark: false, seg: 8 }); }
  }
  // ── the room beside the passage: the andron in small, two couches and a table, a lamp
  if (room) {
    const A = [pb + TI + 0.1, T + 0.1, L - T - 0.1, v1 - 0.1], kl = (u0, v0, u1, v1_, head) => { const r = G.R(u0, v0, u1, v1_); kline(bag, col, r[0], r[1], r[2], r[3], y, head, rand); };
    kl(A[0], A[3] - 0.85, A[2], A[3], true); kl(A[0], A[1], A[0] + 0.85, A[1] + 1.9, false);
    const tp = P((A[0] + A[2]) / 2, (A[1] + A[3]) / 2 - 0.3); trapeza(bag, tp[0], tp[1], y, true, rand);
    const lp = P(A[2] - 0.35, A[1] + 0.35); lampstand(ctx, lp[0], lp[1], y);
  }
  // ── the court: the altar of Zeus Herkeios, the well-head, the jar, a bench, the fig; washing on a line on the side
  { const cu = L / 2, cv = (v1 + v2) / 2, a = G.R(cu - 0.35, cv - 0.3, cu + 0.35, cv + 0.3);
    bag.add('limestone', box(a[0], y, a[1], a[2], y + 0.7, a[3])); bag.add('limestone', box(a[0] - 0.07, y + 0.7, a[1] - 0.07, a[2] + 0.07, y + 0.8, a[3] + 0.07)); col.rect(a, y, y + 0.8);
    bag.add('lacquer_black', box(a[0] + 0.15, y + 0.8, a[1] + 0.15, a[2] - 0.15, y + 0.805, a[3] - 0.15));
    const [wx, wz] = P(L - T - 0.8, v1 + 0.9); bag.add('limestone', lathe([[0.42, 0], [0.42, 0.62], [0.34, 0.62], [0.34, 0.5], [0.001, 0.5]], 14, null, wx, y, wz)); col.circle(wx, wz, 0.42, y, y + 0.62);
    const [jx, jz] = P(T + 0.6, v2 - 0.6); bag.add('terracotta', lathe([[0.12, 0], [0.32, 0.25], [0.38, 0.6], [0.3, 0.95], [0.2, 1.05], [0.001, 1.1]], 12, null, jx, y, jz)); col.circle(jx, jz, 0.38, y, y + 1.1);
    const bn = G.R(T + 1.4, v1 + 0.15, T + 3.2, v1 + 0.55); bag.add('timber', box(bn[0], y, bn[1], bn[2], y + 0.42, bn[3])); col.rect(bn, y, y + 0.42);
    const [tx, tz] = P(L - 2.4, v2 - 1.2); if (rand() < 0.8) fig(bag, tx, y, tz, 4.2 + rand() * 1.4, rand);
    for (const [u, v, hh] of [[1.2, v2 - 0.5, 0.9], [L - 1.4, v2 - 0.5, 1.1]]) { const p = P(u, v); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.2], [0.2, hh * 0.5], [0.001, hh * 0.5]], 8, null, p[0], y, p[1])); }
    // a line of washing across the court
    const l0 = P(T + 0.2, cv + 0.8), l1 = P(L - T - 0.2, cv + 0.8); bag.add('rope_fibre', rod([l0[0], y + 2.2, l0[1]], [l1[0], y + 2.1, l1[1]], 0.01, 3));
    for (let k = 0; k < 3; k++) { const f = 0.2 + k * 0.27, px = l0[0] + (l1[0] - l0[0]) * f, pz = l0[1] + (l1[1] - l0[1]) * f; bag.add(['cloth_white', 'cloth_ochre', 'linen'][k], box(px - 0.3, y + 1.5, pz - 0.02, px + 0.3, y + 2.15, pz + 0.02)); }
  }
  // ── the kitchen: the hearth on the floor (ring of stones, ash, the pot), soot above; the store: amphorae, a pithos; the loom room
  { const ku = (T + kx - TI / 2) / 2, [kx0, kz0] = P(ku, (v2 + D - T) / 2);
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; bag.add('limestone', box(kx0 + Math.cos(a) * 0.45 - 0.09, y, kz0 + Math.sin(a) * 0.45 - 0.07, kx0 + Math.cos(a) * 0.45 + 0.09, y + 0.12, kz0 + Math.sin(a) * 0.45 + 0.07)); }
    bag.add('lacquer_black', box(kx0 - 0.36, y, kz0 - 0.36, kx0 + 0.36, y + 0.03, kz0 + 0.36));
    bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.17, 0.12], [0.15, 0.22], [0.12, 0.25], [0.13, 0.27], [0.001, 0.26]], 12, null, kx0, y + 0.13, kz0));
    lights.push({ at: [kx0, y + 0.4, kz0], color: '#ff8a3a', intensity: 1.5, distance: 4 }); col.circle(kx0, kz0, 0.55, y, y + 0.4);
    const sk = G.R(ku - 0.9, D - T - 0.03, ku + 0.9, D - T - 0.015); bag.add('lacquer_black', box(sk[0], y + 2.0, sk[1], sk[2], y + H - 0.12, sk[3]));
    const [wj, wk] = P(T + 0.45, D - T - 0.5); bag.add('terracotta', lathe([[0.1, 0], [0.24, 0.12], [0.28, 0.42], [0.2, 0.62], [0.12, 0.66], [0.001, 0.7]], 12, null, wj, y, wk)); col.circle(wj, wk, 0.28, y, y + 0.7);
    const su = (kx + sx) / 2;
    for (let k = 0; k < 4; k++) { const [ax, az] = P(kx + TI / 2 + 0.4 + k * 0.4, D - T - 0.3); vase(bag, 'amphora', ax, y, az, { s: 1.15, dark: false, tilt: 0.14, seg: 8 }); }
    for (let k = 0; k < 2; k++) { const [ax, az] = P(su + 0.2 + k * 0.8, v2 + 1.2 + k * 0.4); vase(bag, 'pithos', ax, y, az, { s: 0.85, seg: 10 }); col.circle(ax, az, 0.33, y, y + 0.95); }
    // the loom room: the warp-weighted loom against the back wall, a stool, a basket of wool
    const lu = (sx + TI / 2 + L - T) / 2, lw = 1.3;
    for (const s of [-1, 1]) { const r = G.R(lu + s * lw / 2 - 0.05, D - T - 0.5, lu + s * lw / 2 + 0.05, D - T - 0.4); bag.add('timber', box(r[0], y, r[1], r[2], y + 2.0, r[3])); }
    { const bm = G.R(lu - lw / 2 - 0.05, D - T - 0.5, lu + lw / 2 + 0.05, D - T - 0.4); bag.add('timber', box(bm[0], y + 1.9, bm[1], bm[2], y + 2.0, bm[3]));
      const cl = G.R(lu - lw / 2 + 0.08, D - T - 0.48, lu + lw / 2 - 0.08, D - T - 0.44); bag.add('cloth_white', box(cl[0], y + 1.3, cl[1], cl[2], y + 1.9, cl[3])); bag.add('cloth_ochre', box(cl[0], y + 1.55, cl[1] - 0.005, cl[2], y + 1.62, cl[3] + 0.005));
      const wp = G.R(lu - lw / 2 + 0.08, D - T - 0.46, lu + lw / 2 - 0.08, D - T - 0.43); bag.add('linen', box(wp[0], y + 0.5, wp[1], wp[2], y + 1.3, wp[3]));
      col.rect(G.R(lu - lw / 2 - 0.08, D - T - 0.55, lu + lw / 2 + 0.08, D - T - 0.35), y, y + 2.0); }
    const [bx, bz] = P(lu - 1.1, v2 + 1.0); bag.add('wicker', lathe([[0.001, 0], [0.18, 0], [0.22, 0.22], [0.2, 0.23], [0.16, 0.03], [0.001, 0.03]], 10, null, bx, y, bz)); bag.add('cloth_white', lathe([[0.001, 0.2], [0.18, 0.2], [0.12, 0.3], [0.001, 0.32]], 10, null, bx, y, bz));
    const [stx, stz] = P(lu + 0.4, D - T - 1.3); bag.add('wood_dark', box(stx - 0.17, y, stz - 0.17, stx + 0.17, y + 0.32, stz + 0.17)); col.rect([stx - 0.17, stz - 0.17, stx + 0.17, stz + 0.17], y, y + 0.32);
  }
  void krater; void merge;
}
Object.assign(STYLES.greek.elements, { delphi_house: delphiHouse });
export { delphiHouse };
