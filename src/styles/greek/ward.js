// The houses of Athens' wards (docs/settlements/athens.md §5c): courtyard houses built wall to wall along the lanes, each one
// facing its street — a range of rooms on the street with the door (or a wall with the door), the rooms round a court behind;
// of one storey or two; plastered mudbrick on a stone socle, tiled roofs; shuttered windows, shop fronts with their counters,
// the dado stained by damp and splash, rain streaks, plaster fallen from the mudbrick, rain spouts, chimney pots; and the
// outer dressing of the walk-in houses (simon_house). Registered into the `greek` style as `athens_house` and
// `athens_open_house`; `greek_house` and `simon_house` (Delphi's and Alexandria's) are left as they were.
//
// Local frame (agora.js frame): u along the street front, v from the front back. `tier`: 2 near the visitor's ways (all the
// detail), 1 a few hundred metres round them, 0 the outer town (walls, roofs, door, windows only).

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, rod } from '../../core/geom.js';
import { merge } from './columns.js';
import { frame } from './agora.js';
import { blob } from './sculpture.js';
import { gables } from './town.js';
import './house-interior.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TONES = ['mud_plaster', 'mud_plaster', 'mud_plaster', 'plaster_white', 'plaster_white', 'plaster_ochre', 'mud_plaster', 'plaster_grey'];

/** The wall furniture of one outer face: dado, streaks, patches of bare mudbrick, rain spout, high windows. Face at v = vf looking toward `s` (−1 the front, +1 the back). */
function face(ctx, F, { u0, u1, v, s, y, H, rand, tier, wins = 1, spout = true, plaster }) {
  const { bag } = ctx, W = u1 - u0;
  if (W < 1.2) return;
  const R = (a, b, c, d, y0, y1, m) => { const r = F.R(a, v + s * c, b, v + s * d); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
  // the dado stained grey with damp and splash, its top edge ragged
  R(u0, u1, 0, 0.014, 0.7, 1.15, 'plaster_damp');
  if (tier < 1) return;
  for (let k = 0; k < (tier > 1 ? 4 : 2); k++) {                        // rain streaks down from the eaves and under the sills
    const u = u0 + 0.4 + rand() * (W - 0.8), w = 0.1 + rand() * 0.16, h = 0.9 + rand() * 1.6;
    R(u, u + w, 0.014, 0.032, H - 0.1 - h, H - 0.1, 'plaster_streak');
  }
  const patches = tier > 1 ? 3 : 1;
  for (let k = 0; k < patches; k++) {                                   // plaster fallen from the brick
    const u = u0 + 0.3 + rand() * (W - 1.2), w = 0.35 + rand() * 0.5, h = 0.3 + rand() * 0.5, y0 = 0.9 + rand() * 1.5;
    R(u, u + w, 0.032, 0.05, y0, y0 + h, 'mudbrick');
  }
  if (spout && H > 2.8) {                                               // a terracotta rain spout from the eaves
    const u = u0 + 0.6 + rand() * (W - 1.2), p = F.P(u, v + s * 0.2);
    bag.add('terracotta', merge([rod([p[0], y + H - 0.1, p[1]], [p[0] + F.out[0] * s * -0.02 + 0, y + H - 0.28, p[1]], 0.05, 5)]));
  }
  for (let k = 0; k < wins; k++) {                                      // a small high window, shuttered
    const u = u0 + (W) * (k + 0.5) / wins - 0.3 + (rand() - 0.5) * 0.6;
    R(u, u + 0.6, -0.02, 0.07, 2.1, 2.6, 'wood_dark');
    R(u - 0.06, u + 0.66, -0.01, 0.01, 2.04, 2.1, 'timber');
  }
}
/** Tiled roof over a range (ridge along its long side), gable ends of plaster, ridge cap. */
function roof(ctx, r, y, H, plaster, tier, rand) {
  const { bag } = ctx, along = r[2] - r[0] > r[3] - r[1], rise = (along ? r[3] - r[1] : r[2] - r[0]) * 0.3;
  bag.add('roof_tile', frustum([r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3], y + H, y + H + rise, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? (r[3] - r[1]) / 2 + 0.25 : 0, along ? (r[3] - r[1]) / 2 + 0.25 : 0, along ? { noXn: true, noXp: true } : { noZn: true, noZp: true }));
  bag.add(plaster, gables(r, y + H, rise, along));
  if (tier > 0) {                                                       // the ridge tiles
    const mx = (r[0] + r[2]) / 2, mz = (r[1] + r[3]) / 2;
    bag.add('roof_ridge', along ? box(r[0] - 0.3, y + H + rise - 0.02, mz - 0.1, r[2] + 0.3, y + H + rise + 0.12, mz + 0.1) : box(mx - 0.1, y + H + rise - 0.02, r[1] - 0.3, mx + 0.1, y + H + rise + 0.12, r[3] + 0.3));
  }
  return rise;
}
function fig(bag, x, y, z, h, rand) {
  bag.add('bark_olive', merge([rod([x, y, z], [x, y + h * 0.5, z], 0.12, 6), rod([x, y + h * 0.4, z], [x + 0.5, y + h * 0.75, z + 0.2], 0.07, 5), rod([x, y + h * 0.45, z], [x - 0.45, y + h * 0.78, z - 0.15], 0.07, 5)]));
  bag.add('cloth_green', merge([blob([x, y + h * 0.82, z], h * 0.3, [1.15, 0.8, 1.1], 8), blob([x + 0.7, y + h * 0.72, z + 0.25], h * 0.2, [1, 0.8, 1], 7), blob([x - 0.65, y + h * 0.75, z - 0.2], h * 0.2, [1, 0.8, 1], 7)]));
  void rand;
}

/** What kind of house this seed is, and where its door and shop opening are (shared with the street props of the town: u along the front). */
export function kindOf(el, L, D, tier) {
  const rand = rng(el.seed || 1), plaster = TONES[Math.floor(rand() * TONES.length)];
  const two = rand() < 0.34, typeA = rand() < 0.68, shop = typeA && tier > 0 && rand() < 0.3 && L > 10.2;
  const sw = Math.min(3.2, L * 0.28), q = rng((el.seed || 1) + 99), dw = 1.1;
  const left = q() < 0.5, shopU = shop ? (left ? 0.9 : L - 3.3) : -1, lo = shop && left ? shopU + 3.3 : 1.4, hi = shop && !left ? shopU - 0.9 : L - 1.4;
  const du = typeA ? lo + q() * Math.max(0, hi - lo) : L / 2 + (q() - 0.5) * Math.max(0, L - 2 * sw - dw - 0.8);
  return { rand, plaster, two, typeA, shop, sw, du: Math.max(0.3, Math.min(du, L - 0.3)), shopU };
}
/**
 * athens_house: { rect, front ('n'|'s'|'e'|'w'), seed, y, tier, fall } — see the header.
 * Type A (two houses in three): a range of rooms along the street, its door in the front wall, the court behind between
 * two side wings and the range at the back; a quarter of these are shops with a wide opening, a counter board, the shutter
 * propped up as an awning. Type B: a coped wall with the door on the street, the wings coming to it. Two storeys in one of three.
 */
function athensHouse(el, ctx) {
  const { bag, col } = ctx, F = frame(el.rect, el.front || 's'), { L, D } = F, y = el.y ?? 0, tier = el.tier ?? 1;
  const K = kindOf(el, L, D, tier), rand = K.rand, { plaster, two, typeA, shop, sw, du, shopU } = K;
  const sd = Math.max(0.6, (el.fall ?? 0) + 0.3);
  const fr = 3.4, bk = Math.min(4.2, D * 0.36);
  const dw = 1.1, dh = 2.15;
  const hF = typeA ? (two ? 5.7 : 3.1 + rand() * 0.3) : 3.0, hB = rand() < 0.28 ? 5.7 : 3.2, hS = 3.0 + rand() * 0.3;
  const wall = (u0, v0, u1, v1, H, solid = true) => {
    const r = F.R(u0, v0, u1, v1);
    bag.add('rubble', box(r[0], y - sd, r[1], r[2], y + 0.7, r[3]));
    bag.add(plaster, box(r[0] + 0.02, y + 0.7, r[1] + 0.02, r[2] - 0.02, y + H, r[3] - 0.02));
    if (solid) col.rect(r, y - sd, y + H);
  };
  const ranges = [];
  // the back range and the side wings
  wall(0, D - bk, L, D, hB); ranges.push([F.R(0, D - bk, L, D), hB]);
  const cv0 = typeA ? fr : 0;
  wall(0, cv0, sw, D - bk, hS); wall(L - sw, cv0, L, D - bk, hS);
  ranges.push([F.R(0, cv0, sw, D - bk), hS], [F.R(L - sw, cv0, L, D - bk), hS]);
  // the street door: its place along the front
  if (typeA) {
    if (shop) {
      // the front range in blocks round the shop's opening (u shopU … shopU + 2.4), a dark cell behind it
      const s0 = shopU, s1 = s0 + 2.4;
      wall(0, 0, s0, fr, hF); wall(s1, 0, L, fr, hF);
      const rr = F.R(s0, 0, s1, fr);
      bag.add('rubble', box(rr[0], y - sd, rr[1], rr[2], y + 0.7, rr[3]));
      const lin = F.R(s0, 0, s1, 0.5), back = F.R(s0, 2.2, s1, fr);
      bag.add(plaster, box(lin[0], y + 2.2, lin[1], lin[2], y + hF, lin[3]));
      bag.add(plaster, box(back[0], y + 0.7, back[1], back[2], y + hF, back[3]));
      for (const [a, b] of [[F.R(s0 + 0.02, 0.4, s1 - 0.02, 0.43), 0], [F.R(s0 + 0.02, 2.17, s1 - 0.02, 2.2), 0]]) bag.add('plaster_damp', box(a[0], y + 0.05, a[1], a[2], y + 2.2, a[3])), void b;
      col.rect(back, y - sd, y + hF);
      // the timber frame, the counter board, the shutter propped as an awning on two poles
      const post = (u) => { const r = F.R(u - 0.09, -0.12, u + 0.09, 0.06); bag.add('timber', box(r[0], y, r[1], r[2], y + 2.28, r[3])); };
      post(s0 + 0.02); post(s1 - 0.02);
      const hd = F.R(s0 - 0.12, -0.14, s1 + 0.12, 0.08); bag.add('timber', box(hd[0], y + 2.15, hd[1], hd[2], y + 2.34, hd[3]));
      const ct = F.R(s0 + 0.1, 0.0, s1 - 0.1, 0.55); bag.add('timber', box(ct[0], y + 0.05, ct[1], ct[2], y + 0.95, ct[3]));
      const cb = F.R(s0 + 0.04, -0.34, s1 - 0.04, 0.0); bag.add('wood_dark', box(cb[0], y + 0.9, cb[1], cb[2], y + 0.96, cb[3]));
      const aw = F.R(s0 - 0.1, -1.5, s1 + 0.1, -0.1); bag.add('timber', frustum(aw, y + 2.1, y + 2.34, 0, 0, 0, 0));
      for (const u of [s0 - 0.02, s1 + 0.02]) { const p = F.P(u, -1.45); bag.add('timber', rod([p[0], y, p[1]], [p[0], y + 2.12, p[1]], 0.04, 5)); }
      if (tier > 1) {                                                    // the trader's sign: a board on a bracket above the opening
        const sg = F.R(s0 + 0.4, -0.5, s1 - 0.4, -0.44);
        bag.add('wood_ochre', box(sg[0], y + 2.55, sg[1], sg[2], y + 3.0, sg[3]));
        const em = F.R(s0 + 0.9, -0.52, s1 - 0.9, -0.5); bag.add(['paint_blue', 'wall_red', 'paint_ochre', 'pottery_dark'][el.seed % 4], box(em[0], y + 2.65, em[1], em[2], y + 2.9, em[3]));
      }
    } else wall(0, 0, L, fr, hF);
    ranges.push([F.R(0, 0, L, fr), hF]);
  } else {
    // the coped wall across the court on the street, the door in it
    const cu0 = sw, cu1 = L - sw;
    wall(cu0, 0, cu1, 0.4, 2.55);
    const r = F.R(cu0 - 0.04, -0.12, cu1 + 0.04, 0.52);
    bag.add('roof_tile', frustum(r, y + 2.55, y + 2.78, F.alongX ? 0 : 0.2, F.alongX ? 0 : 0.2, F.alongX ? 0.2 : 0, F.alongX ? 0.2 : 0));
    ranges.push(null);
  }
  const dL = du;
  // the door: a timber frame proud of the wall, the leaf shut inside it, a stone threshold and a step
  const door = (u) => {
    const P = (a, b, c, d, y0, y1, m) => { const r = F.R(a, b, c, d); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
    P(u - dw / 2 - 0.14, -0.1, u - dw / 2, 0.12, 0.05, dh + 0.14, 'timber'); P(u + dw / 2, -0.1, u + dw / 2 + 0.14, 0.12, 0.05, dh + 0.14, 'timber');
    P(u - dw / 2 - 0.22, -0.12, u + dw / 2 + 0.22, 0.14, dh, dh + 0.18, 'timber');
    P(u - dw / 2, 0.0, u + dw / 2, 0.075, 0.05, dh, 'wood_dark');
    P(u - dw / 2 - 0.2, -0.45, u + dw / 2 + 0.2, 0.0, -0.08, 0.06, 'limestone');
    if (tier > 1) { P(u + dw / 2 - 0.22, -0.02, u + dw / 2 - 0.12, 0.02, 1.15, 1.25, 'iron'); P(u - dw / 2 + 0.05, -0.03, u + dw / 2 - 0.05, 0.0, 0.5, 1.9, 'wood_painted'); }
  };
  door(dL);
  // the roofs: ranges, then wings (the back range, its ridge along u; the wings along v; the front range along u)
  ranges.filter(Boolean).forEach(([r, H]) => roof(ctx, r, y, H, plaster, tier, rand));
  // wall dressing: front, back, flanks
  const wins = typeA ? (two ? 2 : 1) : 0;
  if (tier > 0) {
    face(ctx, F, { u0: 0, u1: typeA ? L : L, v: 0, s: -1, y, H: typeA ? hF : 2.5, rand, tier, wins: 0, spout: typeA, plaster });
    face(ctx, F, { u0: 0, u1: L, v: D, s: 1, y, H: hB, rand, tier, wins: 2, plaster });
    for (const side of ['e', 'w']) { const G = frame(el.rect, side); face(ctx, G, { u0: 0, u1: G.L, v: 0, s: -1, y, H: hS + 0.3, rand, tier, wins: 1, spout: false, plaster }); }
  } else {
    const r = F.R(0, 0, L, 0.012); bag.add('plaster_damp', box(r[0], y + 0.7, r[1] - 0.01, r[2], y + 1.15, r[3] + 0.01));
  }
  // windows on the street: upper storey (shuttered, one leaf swung open), a high ground-floor slit
  if (typeA) {
    const upper = (u, open) => {
      const P = (a, b, c, d, y0, y1, m) => { const r = F.R(a, b, c, d); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
      P(u - 0.4, -0.06, u + 0.4, 0.08, 4.05, 4.95, 'wood_dark'); P(u - 0.48, -0.1, u + 0.48, 0.0, 4.95, 5.05, 'timber'); P(u - 0.5, -0.14, u + 0.5, 0.0, 3.97, 4.05, 'timber');
      if (open) { P(u + 0.4, -0.5, u + 0.46, 0.0, 4.05, 4.95, 'shutter_brown'); }
    };
    if (two) {
      const n = L > 12 ? 3 : 2;
      for (let k = 0; k < n; k++) { const u = L * (k + 0.5) / n + (rand() - 0.5) * 0.6; if (Math.abs(u - dL) > 0.8 || true) upper(u, rand() < 0.5); }
      if (tier > 1 && rand() < 0.45) {                                   // a small wooden gallery over the door
        const g = F.R(dL - 1.0, -0.95, dL + 1.0, 0.0), rl = F.R(dL - 1.0, -0.97, dL + 1.0, -0.93);
        bag.add('timber', box(g[0], y + 3.15, g[1], g[2], y + 3.27, g[3])); bag.add('wood_dark', box(rl[0], y + 3.27, rl[1], rl[2], y + 4.2, rl[3]));
        for (const u of [dL - 0.9, dL + 0.9]) { const p = F.P(u, -0.9); bag.add('timber', rod([p[0], y + 2.3, p[1]], [p[0], y + 3.2, p[1]], 0.05, 5)); }
      }
    } else if (!shop) {
      for (const u of [dL > L / 2 ? L * 0.22 : L * 0.78]) { const r = F.R(u - 0.3, -0.03, u + 0.3, 0.06); bag.add('wood_dark', box(r[0], y + 2.0, r[1], r[2], y + 2.55, r[3])); }
    }
  }
  // chimney (kapnodoke) pots on the roofs; a fig in the court over the wall
  if (tier > 0 && rand() < 0.45) { const p = F.P(L * (0.2 + 0.6 * rand()), D - bk * 0.5); bag.add('terracotta', lathe([[0.2, 0], [0.2, 0.55], [0.26, 0.6], [0.26, 0.66], [0.001, 0.66]], 8, null, p[0], y + hB + bk * 0.3 + 0.3, p[1])); }
  const cx = L / 2, cz = (cv0 + D - bk) / 2;
  if (tier > 0 && rand() < 0.5 && L - 2 * sw > 2.2) { const p = F.P(cx + (rand() - 0.5), cz); fig(bag, p[0], y, p[1], 4.2 + rand() * 1.4, rand); }
  if (tier < 2) return;
  // the herm at the door, the altar of Zeus Herkeios, the well-head and a storage jar in the court
  const hp = F.P(dL + dw / 2 + 0.85, -0.55);
  STYLES.greek.elements.herm({ at: hp, y, rot: F.yaw }, ctx);
  if (L - 2 * sw > 2.2) {
    const [ax, az] = F.P(cx, cz), a = F.R(cx - 0.35, cz - 0.3, cx + 0.35, cz + 0.3);
    bag.add('limestone', box(a[0], y, a[1], a[2], y + 0.7, a[3])); bag.add('limestone', box(a[0] - 0.07, y + 0.7, a[1] - 0.07, a[2] + 0.07, y + 0.8, a[3] + 0.07)); col.rect(a, y, y + 0.8);
    const [wx, wz] = F.P(cx + 1.1, cz + 0.6);
    bag.add('limestone', lathe([[0.42, 0], [0.42, 0.62], [0.34, 0.62], [0.34, 0.5], [0.001, 0.5]], 14, null, wx, y, wz)); col.circle(wx, wz, 0.42, y, y + 0.62);
    void ax; void az;
  }
}

/** The outer dressing of a walk-in house (simon_house frame: street on the north, 13 × 14 m): dado, streaks, patches, high windows on all four faces, the shop's sign. */
function athensOpenHouse(el, ctx) {
  const rect = el.rect, F = frame(rect, 'n'), rand = rng((el.seed || 1) + 5), y = el.y ?? 0;
  STYLES.greek.elements.simon_house({ ...el, trade: el.trade ?? 'shoe' }, ctx);
  face(ctx, F, { u0: 0, u1: F.L, v: 0, s: -1, y, H: 3.2, rand, tier: 2, wins: 0, spout: true });
  face(ctx, F, { u0: 0, u1: F.L, v: F.D, s: 1, y, H: 3.2, rand, tier: 2, wins: 2, spout: true });
  for (const side of ['e', 'w']) { const G = frame(rect, side); face(ctx, G, { u0: 0, u1: G.L, v: 0, s: -1, y, H: 3.2, rand, tier: 2, wins: 2, spout: false }); }
  // a sign over the street opening: a painted board on a bracket
  const sg = F.R(1.0, -0.5, 3.6, -0.44), em = F.R(1.5, -0.52, 3.1, -0.5);
  ctx.bag.add('wood_ochre', box(sg[0], y + 2.75, sg[1], sg[2], y + 3.12, sg[3]));
  ctx.bag.add(['wall_red', 'paint_blue', 'paint_ochre', 'pottery_dark', 'wall_red'][(el.seed || 0) % 5], box(em[0], y + 2.82, em[1], em[2], y + 3.05, em[3]));
}

Object.assign(STYLES.greek.elements, { athens_house: athensHouse, athens_open_house: athensOpenHouse });
export { face, fig };
