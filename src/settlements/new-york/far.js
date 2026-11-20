// The blocks' far form (docs/settlements/new-york.md §5; DESIGN §8): each building of the grid built simple for when the
// visitor is far from it — the same masses, setbacks, cornices, shop-front bands, roof furniture and painted boards, without
// the goods, signs' lettering, windows' surrounds, railings, fire escapes' gratings and interiors, which are only seen near
// (town.js builds each tile twice, as src/settlements/lod.js does for the other townscapes).
//
// The art deco style's `skyscraper` draws from one random stream (seeded by the lot) in a fixed order: the shop fronts,
// then the setbacks' base height or the soot, fire escape, chimney, bulkhead and tank. The simple form takes the same
// numbers from the same stream in the same order (`storefronts`, `soot`, ... below) so that every mass, stack and tank
// stands exactly where the full form puts it; if the style's `skyscraper` changes its order, change it here too.
import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import '../../styles/artdeco/index.js';
import { face, rowPlan, rowStacks, LEAN, quadOut } from '../../styles/artdeco/blocks.js';
import { shopRoom } from '../../styles/artdeco/shoprooms.js';
import { nearEntrance, rng as rng2, fitCell } from '../../styles/artdeco/dress.js';
import { narrowRect, stripRect, adsOf } from './upper-plan.js';
import { withUpstairs } from './upper.js';
import { withTenement } from './tenement.js';

const LS = 'facade_limestone', PLAIN = 'limestone';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const block = (bag, mat, [x0, z0, x1, z1], y0, y1) => bag.add(mat, box(x0, y0, z0, x1, y1, z1));
const inset = ([x0, z0, x1, z1], ix, iz = ix) => [x0 + ix, z0 + iz, x1 - ix, z1 - iz];
const AWN = ['cloth_green', 'cloth_red', 'cloth_ochre'];
const ADS = ['car_red', 'paint_cab_yellow', 'shutter_green', 'car_blue', 'paint_white', 'prussian_blue', 'stucco_cream', 'cloth_red'];

/** The shop fronts of the faces: one dark band of glass for each shop, the awnings as sloped sheets, the fascia over all (the random numbers as the full form takes them). */
function storefronts(bag, rect, y, rand, faces = 'nsew') {
  const [x0, z0, x1, z1] = rect;
  for (const f of 'nsew') {
    if (!faces.includes(f)) continue;
    const F = face(rect, f), { R, P, L } = F, n = Math.max(1, Math.floor(L / 6)), full = nearEntrance((x0 + x1) / 2, (z0 + z1) / 2);
    for (let i = 0; i < n; i++) {
      const u0 = i * L / n + 0.6, u1 = (i + 1) * L / n - 0.6;
      rand();                                                     // the door's side
      bag.add('glass_outer', R(u0, u1, y + 0.3, y + 3.2, 0.15, 0.18));
      if (rand() < 0.35) {                                        // the awning
        const m = AWN[Math.floor(rand() * 3)], T = [], A = P(u0, 0.2, y + 3.55), B = P(u1, 0.2, y + 3.55), C = P(u1, 1.7, y + 2.95), D = P(u0, 1.7, y + 2.95);
        T.push(...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C);
        bag.add(m, fromTriangles(T));
      }
      if (rand() < 0.18) { rand(); rand(); rand(); rand(); if (full) rand(); }   // (the blade sign: not drawn far)
    }
    bag.add(PLAIN, R(0, L, y + 3.7, y + 4.3, 0, 0.4));
  }
}
/** Soot under the cornice of a street front (the full form's, boxes only). */
function soot(bag, rect, f, y, h, mat, rand) {
  const m = mat === 'facade_brick' ? 'pottery_dark' : 'plaster_damp', F = face(rect, f), { R, L } = F, top = y + h - 1.6, low = y + 4.6;
  const put = (u0, u1, ya, yb) => { if (yb - ya < 0.05) return; if (LEAN.on) { bag.add(m, quadOut(F.P(u0, 0.012, ya), F.P(u1, 0.012, ya), F.P(u1, 0.012, yb), F.P(u0, 0.012, yb), F.along ? [0, F.sg] : [F.sg, 0])); return; } bag.add(m, R(u0, u1, ya, yb, 0.004, 0.014)); };
  const n = Math.max(2, Math.round(L / 3));
  for (let i = 0; i < n; i++) put(i * L / n, (i + 1) * L / n, Math.max(low, top - 0.6 - rand() * 0.9), top);
  for (const u of [0.05, L - 0.55]) put(u, u + 0.5, Math.max(low, top - 4 - rand() * 6), Math.max(low, top - 0.6));
}
/** A painted advertisement of a side wall: the panel in the brand's colour. */
function wallAd(bag, rect, f, y, y0, h, r) {
  const F = face(rect, f), vis = h - y0;
  if (vis < 8.5 || F.L < 9) return;
  const name = 'X'.repeat(8), bm = ADS[Math.floor(r() * ADS.length)], w = Math.min(14, F.L - 3), u0 = (F.L - w) / 2 + (r() - 0.5) * 1.5, cell = fitCell(['COCA-COLA', 'CAMELS', 'LUCKY STRIKE', 'WRIGLEYS', 'CHESTERFIELD', 'PEPSODENT', 'ARROW SHIRTS', 'CAMPBELLS SOUP'][ADS.indexOf(bm)], w - 1.2, 0.3), hh = Math.min(vis - 4.2, 5 * cell + 2.4), yb = y + h - 2.6 - hh;
  bag.add(bm, F.R(u0, u0 + w, yb, yb + hh, 0, 0.07));
  return name;
}
/** The board on the roof: the panel in the brand's colour on two posts. */
function roofSign(bag, rect, front, yr, r) {
  if (r() > 0.22) return;
  const F = face(rect, front), bm = ADS[Math.floor(r() * ADS.length)], w = Math.min(8.6, F.L - 2.4), u0 = (F.L - w) / 2 + (r() - 0.5) * 0.6, u1 = u0 + w, hh = 3.0, lift = 1.5, dd = 1.3;
  bag.add(bm, F.R(u0, u1, yr + lift, yr + lift + hh, -dd, -dd + 0.12));
  for (const u of [u0 + 0.2, u1 - 0.3]) bag.add('tar_wood', F.R(u, u + 0.1, yr, yr + lift, -dd - 0.02, -dd + 0.1));
}
/** A fire escape's balconies, one slab of grating at each floor (its random numbers taken by the caller). */
function fireEscape(bag, rect, f, y0, top, u0, u1) {
  const F = face(rect, f);
  for (let yy = y0; yy < top - 1.5; yy += 3.4) { bag.add('iron', F.R(u0, u1, 0.02, 1.25, yy - 0.08, yy)); bag.add('iron', F.R(u0, u1, 1.2, 1.25, yy + 0.92, yy + 0.98)); }
}
/** The cast-iron loft front: spandrel, glass and columns of each floor, the cornice. */
function castIron(bag, rect, front, y, h, rand) {
  const F = face(rect, front), { R, L } = F, bay = 2.2, n = Math.max(2, Math.round(L / bay)), W = L / n;
  const y0 = y + 4.4, floors = Math.max(2, Math.floor((h - 4.4 - 1.2) / 3.4)), SH = (h - 4.4 - 1.2) / floors;
  const m = ['paint_white', 'stucco_cream', 'shutter_green', 'stucco_pale'][Math.floor(rand() * 4)];
  for (let f = 0; f < floors; f++) {
    const ya = y0 + f * SH, yb = ya + SH;
    bag.add('glass_outer', R(0.15, L - 0.15, ya + 0.5, yb, 0.14, 0.2));
    bag.add(m, R(0, L, ya, ya + 0.62, 0, 0.36));
    for (let i = 0; i <= n; i++) { const u = i * W; bag.add(m, R(Math.max(0, u - 0.17), Math.min(L, u + 0.17), ya + 0.5, yb, 0.0, 0.32)); }
  }
  const top = y + h;
  bag.add(m, R(0, L, top - 1.2, top - 0.5, 0, 0.3)); bag.add(m, R(-0.05, L + 0.05, top - 0.5, top - 0.1, 0, 0.9)); bag.add(m, R(-0.05, L + 0.05, top - 0.1, top + 0.55, 0.45, 0.9));
}
function chimney(bag, x, y, z, rand, hh) {
  const w = 0.8 + rand() * 0.3, h = (hh ?? 2.2 + rand() * 1.2) - 0.1 - 0.4;
  bag.add('brick', box(x - w / 2, y, z - w / 2, x + w / 2, y + h, z + w / 2));
  bag.add(PLAIN, box(x - w / 2 - 0.08, y + h, z - w / 2 - 0.08, x + w / 2 + 0.08, y + h + 0.1, z + w / 2 + 0.08));
}
function bulkhead(bag, x, y, z, rand) {
  const w = 1.6 + rand() * 0.6, d = 2.0;
  bag.add('brick', box(x - w / 2, y, z - d / 2, x + w / 2, y + 2.5, z + d / 2));
}
/** A water tank: the platform on its legs, the tub with its cone in one piece. */
function tank(bag, x, y, z, r = 2.2) {
  const H = 3.2, k = r * 0.62;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('tar_wood', box(x + dx * k - 0.11, y, z + dz * k - 0.11, x + dx * k + 0.11, y + H, z + dz * k + 0.11));
  bag.add('tar_wood', box(x - r - 0.1, y + H, z - r - 0.1, x + r + 0.1, y + H + 0.2, z + r + 0.1));
  bag.add('tar_wood', lathe([[r * 0.97, 0], [r, 2.0], [r * 0.98, 4.2], [r * 1.08, 4.5], [0.25, 5.75], [0.001, 5.8]], 10, null, x, y + H + 0.2, z));
}
/** The vertical piers on a stage. */
function piers(bag, [x0, z0, x1, z1], y0, y1) {
  for (const f of 'nsew') {
    const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, a0 = along ? x0 : z0, o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
    const n = Math.max(2, Math.round(L / 3.2));
    for (let i = 0; i <= n; i++) {
      const u = a0 + i * L / n, a = o, b = o + sg * 0.35;
      const o2 = LEAN.on ? { noBottom: true, noTop: true } : {};
      bag.add(PLAIN, along ? frustum([u - 0.3, Math.min(a, b), u + 0.3, Math.max(a, b)], y0, y1 + 0.4, 0, 0, 0, 0, o2) : frustum([Math.min(a, b), u - 0.3, Math.max(a, b), u + 0.3], y0, y1 + 0.4, 0, 0, 0, 0, o2));
    }
  }
}
/** A row of brownstone houses: bodies, basements, stoops, doors, windows, stringcourses, cornices, stacks. */
function rows(bag, rect, front, y, h, seed) {
  const F = face(rect, front), { R, L, ext } = F, plan = rowPlan(rect, front, h, seed), W = L / plan.length, B = 1.75;
  for (const st of rowStacks(rect, front, h, seed)) chimney(bag, st.x, y + st.y0 - 0.1, st.z, rng(seed + 7), st.y1 - st.y0 + 0.1);
  for (const { c0, c1, nf, H, mat, mir } of plan) {
    const left = (u) => (mir ? c1 - u : c0 + u), Rm = (a, b, y0, y1, d0, d1) => R(Math.min(left(a), left(b)), Math.max(left(a), left(b)), y0, y1, d0, d1);
    bag.add(mat, R(c0, c1, y - 0.5, y + H, -ext * 0.9, 0));
    bag.add('granite_grey', R(c0, c1, y - 0.5, y + B, 0, 0.12));
    for (let k = 1; k <= nf; k++) bag.add(PLAIN, R(c0, c1, y + B + (k - 1) * 3.4 + 0.02, y + B + (k - 1) * 3.4 + 0.2, 0, 0.1));
    const dU = 0.35, dW = 1.15, land = 0.95, sd = 0.85, sU0 = dU + dW + 0.15, steps = 7, run = 2.2, top0 = B - 0.04, rise = top0 / steps;
    bag.add('granite_grey', Rm(dU - 0.05, sU0, y - 0.5, y + top0, 0, land));
    for (const j of [0, 2, 4]) bag.add('granite_grey', Rm(sU0, sU0 + (j + 1) * run / steps, y - 0.5, y + top0 - (j + 1) * rise, 0, sd));
    const dY = y + B;
    bag.add(PLAIN, Rm(dU - 0.22, dU + dW + 0.22, dY + 2.55, dY + 3.25, 0, 0.4));
    bag.add('glass_outer', Rm(dU, dU + dW, dY, dY + 2.5, 0, 0.05));
    const uA = dU + dW + 0.55;
    for (let k = 0; k < 2; k++) { const ua = uA + k * 1.5; if (ua + 1.0 < W - 0.3) bag.add('glass_outer', Rm(ua, ua + 1.0, dY + 0.45, dY + 2.55, -0.02, 0.05)); }
    for (let f = 1; f < nf; f++) {
      const ya = y + B + f * 3.4 + 0.35, yb = ya + (f === 1 ? 2.35 : 2.05);
      for (let k = 0; k < 3; k++) { const ua = 0.5 + k * ((W - 1.0 - 1.0) / 2); bag.add('glass_outer', Rm(ua, ua + 1.0, ya, yb, -0.02, 0.05)); }
    }
    bag.add(PLAIN, R(c0 - 0.02, c1 + 0.02, y + H - 0.8, y + H - 0.25, 0, 0.12));
    bag.add(PLAIN, R(c0 - 0.02, c1 + 0.02, y + H - 0.25, y + H + 0.12, 0, 0.62));
    bag.add(PLAIN, R(c0 - 0.02, c1 + 0.02, y + H + 0.12, y + H + 0.5, 0.2, 0.55));
    bag.add('tar_wood', R(c0, c1, y + H, y + H + 0.04, -ext * 0.9, -0.1));
  }
}

/** skyscraper (far): the full form's masses and roof furniture, its random stream taken as the full form takes it. */
function skyscraper(el, { bag }) {
  const rand = rng(el.seed || 1), y = el.y ?? 0, h = el.h ?? 40, mat = el.mat ?? LS;
  let r = el.rect;
  if (el.row && el.front) {
    storefronts(bag, r, y, rand, (el.shops ?? '').replace(el.front, ''));
    rows(bag, r, el.front, y, h, el.seed || 1);
    return;
  }
  const room = el.room && el.front && h < 70;
  storefronts(bag, r, y, rand, room ? (el.shops ?? '').replace(el.front, '') : (el.shops ?? 'nsew'));
  if (room) {
    storefronts(bag, r, y, rng(el.seed ^ 0x3c6ef), el.front);
    // (the shop's room takes its numbers from the stream too: built into nothing, for them alone)
    const nil = new Proxy(function () {}, { get: () => nil, apply: () => nil });
    shopRoom(nil, nil, [], el, rand);
  }
  if (h < 70) {
    block(bag, mat, r, y - 0.5, y + h); block(bag, 'granite_grey', inset(r, -0.15), y - 0.5, y + 4.5);
    block(bag, mat, inset(r, -0.5), y + h - 0.2, y + h + 0.8);
    block(bag, PLAIN, inset(r, -0.2), y + h - 1.6, y + h - 0.2);
    if (h > 20) block(bag, PLAIN, inset(r, -0.25), y + 12.2, y + 12.8);
    if (el.front) soot(bag, r, el.front, y, h, mat, rand);
    if (el.ads) for (const a of el.ads) wallAd(bag, r, a.f, y, a.y0, h, rng2((el.seed || 1) ^ (a.f === 'e' ? 0x1357 : 0x2b3d)));
    if (el.front && !el.iron && h > 14 && rand() < 0.55) {
      const f = el.front, along = f === 'n' || f === 's', L = along ? r[2] - r[0] : r[3] - r[1], a0 = along ? r[0] : r[1], w = Math.min(7, L - 2), u0 = a0 + (L - w) / 2 + (rand() - 0.5) * (L - w - 1);
      fireEscape(bag, r, f, y + 7.6, y + h, u0 - a0, u0 - a0 + w);
    }
    if (el.iron && el.front && h > 14) castIron(bag, r, el.front, y, h - 1.2, rand);
    if (el.chimney) chimney(bag, el.chimney[0], y + h + 0.04, el.chimney[1], rand);
    if (h > 18 && rand() < 0.5) bulkhead(bag, (r[0] + r[2]) / 2 + (rand() - 0.5) * (r[2] - r[0]) * 0.5, y + h + 0.04, (r[1] + r[3]) / 2 + (rand() - 0.5) * 3, rand);
    if (el.tanks !== false && rand() < 0.4) tank(bag, (r[0] + r[2]) / 2 + (rand() - 0.5) * 4, y + h + 0.8, (r[1] + r[3]) / 2 + (rand() - 0.5) * 4);
    if (el.front && h >= 18 && nearEntrance((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 260)) roofSign(bag, r, el.front, y + h + 0.8, rng2((el.seed || 1) ^ 0x2468ace));
    return;
  }
  const base = 25 + rand() * 20, w = r[2] - r[0], d = r[3] - r[1];
  block(bag, mat, r, y - 0.5, y + base); block(bag, 'granite_grey', inset(r, -0.15), y - 0.5, y + 5);
  let yy = y + base;
  const steps = h > 150 ? 3 : 2;
  for (let s = 0; s < steps; s++) {
    const f = s === steps - 1 ? 1 : 0.55 + s * 0.25, top = y + h * f, k = 0.12 + s * 0.08;
    r = inset(r, w * k / 1.3, d * k / 1.3);
    if (r[2] - r[0] < 6 || r[3] - r[1] < 6) break;
    block(bag, mat, r, yy - 0.3, top);
    if (s === steps - 1 || s === 0) piers(bag, r, yy, top);
    block(bag, PLAIN, inset(r, -0.3), yy - 0.6, yy + 0.2);
    yy = top;
  }
  if (h > 150) {
    const c = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], s0 = Math.min(r[2] - r[0], r[3] - r[1]) / 2;
    bag.add(rand() < 0.5 ? 'lead' : mat, frustum([c[0] - s0, c[1] - s0, c[0] + s0, c[1] + s0], yy, yy + s0 * 1.4, s0 * 0.9, s0 * 0.9, s0 * 0.9, s0 * 0.9, { noBottom: true }));
  } else block(bag, mat, inset(r, -0.4), yy - 0.2, yy + 0.8);
}
/** A lot with its upper floors open (upper.js): the shop's body in the narrowed lot, as the near form takes its stream, and the stair hall's strip a plain mass with its cornice. */
const withStrip = (fn) => (el, ctx) => {
  if (!el.up) return fn(el, ctx);
  fn({ ...el, rect: narrowRect(el), ads: adsOf(el) }, ctx);
  const [x0, z0, x1, z1] = stripRect(el), y = el.y ?? 0, h = el.h, lo = el.up.end === 'lo', bag = ctx.bag;
  bag.add(el.mat, box(x0, y - 0.5, z0, x1, y + h, z1)); bag.add('granite_grey', box(x0 - 0.15, y - 0.5, z0 - 0.15, x1 + 0.15, y + 4.5, z1 + 0.15));
  bag.add(el.mat, box(lo ? x0 - 0.5 : x0 + 0.5, y + h - 0.2, z0 - 0.5, lo ? x1 - 0.5 : x1 + 0.5, y + h + 0.8, z1 + 0.5)); bag.add(PLAIN, box(lo ? x0 - 0.2 : x0 + 0.2, y + h - 1.6, z0 - 0.2, lo ? x1 - 0.2 : x1 + 0.2, y + h - 0.2, z1 + 0.2));
};
const lowBox = (h, m) => (el, { bag }) => { const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0; bag.add(m, box(x0, y - 0.4, z0, x1, y + (el.h ?? h), z1)); bag.add(PLAIN, box(x0 - 0.2, y + (el.h ?? h) - 0.2, z0 - 0.2, x1 + 0.2, y + (el.h ?? h) + 0.4, z1 + 0.2)); };

/**
 * Materials folded into a neighbour where the eye cannot tell (every distinct material of a tile is a mesh): the sign painters'
 * blues, maroon and black to one each, the soot to the dark brick, the gilt letters to gold, the chimney pots to brick, the
 * awnings' green to the shutters', the pale stucco to cream, the lamps' glasses to one.
 */
const FOLD = { prussian_blue: 'car_blue', cloth_blue: 'car_blue', cloth_maroon: 'cloth_red', car_black: 'cloth_black', plaster_damp: 'pottery_dark', gilt_bronze: 'gold', terracotta: 'brick', cloth_green: 'shutter_green', stucco_pale: 'stucco_cream', timber: 'wood_dark', lamp_white: 'lamp_glass', glass_lamp: 'lamp_glass', wood_ochre: 'wood_painted' };
const FOLD_FAR = { ...FOLD, paint_cab_yellow: 'cloth_ochre', limestone_yellow: 'limestone' };
const folded = (bag, T) => {
  const b = Object.create(bag);
  b.add = (m, g) => bag.add(T[m] ?? m, g);
  b.addInstance = (m, g, M, o) => bag.addInstance(T[m] ?? m, g, M, o && o.real ? { ...o, real: T[o.real] ?? o.real } : o);
  return b;
};
const wrap = (fn, T) => (el, ctx) => fn(el, { ...ctx, bag: folded(ctx.bag, T) });
const wrapAll = (els, T) => Object.fromEntries(Object.entries(els).map(([k, fn]) => [k, wrap(fn, T)]));
const A = STYLES.artdeco.elements;
/** The lean form (blocks.js LEAN): on while a lot with solid walls builds, off for a shop with its room or an opened lot (their fronts are hollow and seen from within). */
const lean = (fn, boxes = false) => (el, ctx) => { const was = [LEAN.on, LEAN.boxes]; LEAN.on = !el.room && !el.up; LEAN.boxes = LEAN.on && boxes; try { return fn(el, ctx); } finally { [LEAN.on, LEAN.boxes] = was; } };
registerStyle('artdeco_far', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: wrapAll({ skyscraper: lean(withStrip(skyscraper), true), diner: lowBox(3.4, 'paint_white'), walkup: lowBox(15, 'facade_brick'), turned: A.turned }, FOLD_FAR),
  objects: {},
});
// the near form: the style's own builders, their materials folded
registerStyle('artdeco_near', { ...STYLES.artdeco, elements: wrapAll({ ...A, skyscraper: lean(withUpstairs(A.skyscraper)), walkup: withTenement(A.walkup) }, FOLD) });
