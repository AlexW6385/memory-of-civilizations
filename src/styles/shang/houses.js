// The houses of the lineage quarters (docs/settlements/shang-yinxu.md §5): a main house on a rammed foundation with plastered wattle
// walls under a hipped thatch roof, its porch, wings round a yard; semi-subterranean pit houses (modelled bermed: the ground mesh is
// too coarse to sink a 4 m floor); rows of wattle houses on the lane; the workshops of bone, jade, pottery and the diviners' craft.
// Fences run unbroken along the lane, every front is dressed, walls are weathered, the houses marked `open` are furnished.
import { box, lathe, frustum } from '../../core/geom.js';
import { rng } from '../../objects/kit.js';
import { frame, steps, vessel } from './geo.js';
import { JAR, jars, heap, skirt, streaks, ridge, fence, fenceRun, rack, pitStore, granary, well, garden, shock, woodpile, pen, hearth, grind, loom, bench, stool, washline, grainMat, dogHouse, tree } from './dress.js';

export { JAR };
const WALLS = ['mud_plaster', 'mud_plaster', 'earth_wall', 'mud_plaster'];

/** The doorway of a house: jambs, a lintel, a leaf of planks (shut, or swung open against the wall inside), a threshold slab. */
function doorway(F, dc, b, y0, wid, ht, th, open) {
  const a0 = dc - wid / 2, a1 = dc + wid / 2;
  F.b('timber', a0 - 0.1, y0, b - 0.06, a0 + 0.03, y0 + ht + 0.05, b + th + 0.05, false); F.b('timber', a1 - 0.03, y0, b - 0.06, a1 + 0.1, y0 + ht + 0.05, b + th + 0.05, false);
  F.b('timber', a0 - 0.12, y0 + ht, b - 0.07, a1 + 0.12, y0 + ht + 0.16, b + th + 0.06, false);
  if (!open) F.b('planks_grey', a0 + 0.03, y0, b + 0.12, a1 - 0.03, y0 + ht, b + 0.2, false);
  else F.b('planks_grey', a0 + 0.03, y0, b + th, a0 + 0.1, y0 + ht, b + th + wid - 0.1, false);
  F.b('granite_grey', a0 - 0.1, y0 - 0.02, b - 0.35, a1 + 0.1, y0 + 0.06, b + th, false);
}

/** A bermed pit house: earth banked on three sides, a low front wall with the door, a gabled thatch roof reaching nearly to the ground. open = enterable and furnished. */
export function pitHouse(F, u, v, w, d, open = false, lod = 0) {
  const R = (a, b, c, e) => F.R(u + a, v + b, u + c, v + e), bh = open ? 0.62 : 0.78;
  const berm = (r) => { F.bag.add('earth_wall', frustum(r, 0, bh, 0.4, 0.4, 0.4, 0.4, { noBottom: true })); F.col.rect(r, 0, bh); };
  berm(R(0, 0.9, 1.0, d)); berm(R(w - 1.0, 0.9, w, d)); berm(R(1.0, d - 1.0, w - 1.0, d));
  const fl = R(1.0, 0.9, w - 1.0, d - 1.0);
  F.bag.add('earth_wall', box(fl[0], 0, fl[1], fl[2], 0.03, fl[3]));
  const dw = open ? 0.62 : 0.5, dc = u + w / 2, fh = open ? 1.7 : 1.5;
  F.b('mud_plaster', u, 0, v, dc - dw, fh, v + 0.45); F.b('mud_plaster', dc + dw, 0, v, u + w, fh, v + 0.45);
  F.b('mud_plaster', dc - dw, fh - 0.25, v, dc + dw, fh, v + 0.45, false);
  F.b('timber', dc - dw - 0.08, 0, v - 0.04, dc - dw + 0.04, fh - 0.2, v + 0.5, false); F.b('timber', dc + dw - 0.04, 0, v - 0.04, dc + dw + 0.08, fh - 0.2, v + 0.5, false);
  if (!open) F.b('opening', dc - dw + 0.04, 0, v + 0.3, dc + dw - 0.04, 1.2, v + 0.34, false);
  F.b('earth_wall', dc - dw - 0.2, 0, v - 0.45, dc + dw + 0.2, 0.12, v, false);
  F.b('earth_wall', u - 0.02, 0, v - 0.02, dc - dw, 0.5, v + 0.5, false);                    // the splashed foot
  const eave = open ? 1.0 : 0.72, rise = open ? 2.3 + w * 0.1 : 1.9 + w * 0.12;
  F.roof(u + 0.2, v + 0.05, u + w - 0.2, v + d - 0.1, eave, rise, 0.45, false); ridge(F, u + 0.2, v + 0.05, u + w - 0.2, v + d - 0.1, eave, rise, 0.45, false);
  F.b('timber', dc - 0.05, eave, v + 0.1, dc + 0.05, eave + rise + 0.1, v + 0.18, false);
  if (open) {
    F.b('reed_mat', u + 1.1, 0.03, v + 1.0, u + w - 1.1, 0.06, v + d - 1.3, false);
    F.lathe('rubble', [[0.45, 0.03], [0.45, 0.14], [0.28, 0.14]], dc, 0.03, v + d / 2, 9); F.lathe('flame', [[0.001, 0.12], [0.12, 0.14], [0.001, 0.34]], dc, 0.03, v + d / 2, 6);
    F.lathe('pottery_dark', [[0.001, 0.14], [0.22, 0.17], [0.26, 0.34], [0.001, 0.4]], dc + 0.02, 0.03, v + d / 2, 8);
    F.b('earth_wall', u + 1.05, 0.03, v + d - 1.95, u + w - 1.05, 0.36, v + d - 1.05, false); F.b('reed_mat', u + 1.05, 0.36, v + d - 1.9, u + w - 1.05, 0.39, v + d - 1.1, false);   // the sleeping bench
    F.b('timber', u + 1.1, 0.03, v + 1.0, u + 1.9, 0.5, v + 1.5); F.b('lacquer_red', u + 1.1, 0.5, v + 1.0, u + 1.9, 0.54, v + 1.5, false);
    jars(F, u + w - 2.5, v + 1.1, 3, 0.16, 0.03, 0.45);
    for (let k = 0; k < 3; k++) F.b('ichu', dc - 0.9 + k * 0.9, eave + 0.55, v + d / 2 - 0.1, dc - 0.8 + k * 0.9, eave + 1.1, v + d / 2 + 0.1, false);  // bundles hung from the rafters
  }
  void lod;
}

const mainEave = (H, P) => P + H;

/** The furnishing of a house: a hall of the great (an altar of lacquer with a ding, loom, bed) or a home (hearth, bench, jars, loom). */
function furnish(F, u, v, w, d, P, th, rich, rand) {
  const cx = u + w / 2, cz = (a, b) => F.P(a, b);
  F.b('earth_wall', u + th, P, v + th, u + w - th, P + 0.03, v + d - th, false);
  F.b('reed_mat', u + 1.0, P + 0.03, v + 1.2, u + w - 1.0, P + 0.06, v + 3.6, false);
  F.b('lacquer_black', cx - 0.6, P + 0.06, v + 1.9, cx + 0.6, P + 0.44, v + 2.7);
  const p = cz(cx, v + 2.3); vessel(rich ? 'ding' : 'gui', F.bag, p[0], P + 0.44, p[1], rich ? 0.8 : 0.7);
  F.b('earth_wall', u + th + 0.1, P + 0.03, v + d - th - 1.7, u + w - th - 0.1, P + 0.5, v + d - th - 0.1);                // the sleeping platform
  F.b('reed_mat', u + th + 0.2, P + 0.5, v + d - th - 1.6, u + w - th - 0.2, P + 0.53, v + d - th - 0.2, false);
  F.b('cloth_brown', u + th + 0.5, P + 0.53, v + d - th - 1.4, u + th + 2.2, P + 0.62, v + d - th - 0.5, false);
  F.b('timber', u + th + 0.1, P + 0.03, v + th + 0.1, u + th + 1.3, P + 0.6, v + th + 0.8); F.b('lacquer_red', u + th + 0.1, P + 0.6, v + th + 0.1, u + th + 1.3, P + 0.65, v + th + 0.8, false);
  jars(F, u + w - 4.2, v + th + 0.3, 4, 0.2, P + 0.03, 0.6);
  loom(F, u + w - th - 1.8, v + 2.4);
  const hp = cz(cx + 1.8, v + 3.3); F.bag.add('rubble', lathe([[0.5, 0], [0.5, 0.12], [0.3, 0.12]], 9, null, hp[0], P + 0.03, hp[1])); F.bag.add('flame', lathe([[0.001, 0.1], [0.14, 0.12], [0.001, 0.4]], 6, null, hp[0], P + 0.03, hp[1]));
  F.b('wicker', u + th + 0.2, P + 0.03, v + 3.6, u + th + 0.8, P + 0.4, v + 4.2); stool(F, cx - 1.8, v + 3.6);
  for (let k = 0; k < 6; k++) F.b(k % 2 ? 'ichu' : 'cloth_ochre', u + 1.2 + k * ((w - 2.4) / 6), P + 2.0, v + d * 0.5 - 0.06, u + 1.4 + k * ((w - 2.4) / 6), P + 2.7, v + d * 0.5 + 0.06, false);   // millet hung from the beam
  for (const a of [u + 0.6, u + w * 0.5, u + w - 0.6]) F.b('timber', a - 0.1, P + 2.6, v + th, a + 0.1, P + 2.78, v + d - th, false);                  // tie-beams
  F.b('timber', u + th, P + 2.6, v + d * 0.5 - 0.1, u + w - th, P + 2.78, v + d * 0.5 + 0.1, false);
  void rand;
}

/** The main house: a rammed foundation 0.5 m, plastered walls 2.6 m, a porch of posts on stone bases under the deep eaves, a door, a hipped thatch roof. */
function mainHouse(F, u, v, w, d, open, rand, lod) {
  const wm = WALLS[Math.floor(rand() * WALLS.length)], th = 0.45, H = 2.6, P = 0.5, dw = 1.1, dc = u + w / 2;
  F.b('earth_wall', u - 0.4, 0, v - 0.4, u + w + 0.4, P, v + d + 0.4);
  steps(F.bag, F.col, F.R(dc - 0.9, v - 1.1, dc + 0.9, v - 0.4), 0, P, F.asc);
  F.b(wm, u, P, v, dc - dw / 2, P + H, v + th); F.b(wm, dc + dw / 2, P, v, u + w, P + H, v + th); F.b(wm, dc - dw / 2, P + 1.9, v, dc + dw / 2, P + H, v + th, false);
  F.b(wm, u, P, v + th, u + th, P + H, v + d); F.b(wm, u + w - th, P, v + th, u + w, P + H, v + d); F.b(wm, u + th, P, v + d - th, u + w - th, P + H, v + d);
  doorway(F, dc, v - 0.0, P, dw, 1.95, th, open);
  for (const k of [-2, -1, 1, 2]) { const c = dc + k * w * 0.2; if (Math.abs(c - dc) > dw) F.b('opening', c - 0.28, P + 1.6, v - 0.01, c + 0.28, P + 2.2, v + 0.03, false), F.b('timber', c - 0.34, P + 1.55, v - 0.03, c + 0.34, P + 1.6, v + 0.05, false); }
  F.b('kokowai', u - 0.02, P, v - 0.03, u + w + 0.02, P + 0.3, v, false);                                           // the red dado
  skirt(F, u, v, w, d, P, [dc - dw / 2 - 0.1, dc + dw / 2 + 0.1], 0.5); streaks(F, u, v, w, P + H, rand, 5, [dc - dw / 2, dc + dw / 2]);
  F.roof(u, v, u + w, v + d, P + H, 2.3 + w * 0.08, 0.95, true); ridge(F, u, v, u + w, v + d, P + H, 2.3 + w * 0.08, 0.95, true);
  if (lod === 0) {
    // the porch: posts on stone bases under the eave, a beam, a bench, jars, bundles hung
    const pv = v - 0.85;
    for (let k = 0; k <= 3; k++) { const a = u + 0.5 + k * (w - 1.0) / 3; F.lathe('granite_grey', [[0.2, 0], [0.2, 0.1], [0.12, 0.12]], a, 0, pv, 8); F.post(a, pv, 0.12, P + H - 0.3, 0.1); }
    F.b('timber', u + 0.3, P + H - 0.38, pv - 0.1, u + w - 0.3, P + H - 0.2, pv + 0.1, false);
    bench(F, u + 1.0, v - 0.75, 1.9, P - 0.08); jars(F, u + w - 3.0, v - 0.8, 3, 0.2, 0, 0.6);
    for (let k = 0; k < 4; k++) F.b(k % 2 ? 'ichu' : 'cloth_ochre', u + 0.9 + k * 0.7, P + H - 1.05, pv - 0.04, u + 1.08 + k * 0.7, P + H - 0.4, pv + 0.04, false);
  }
  if (open) furnish(F, u, v, w, d, P, th, true, rand);
}

/** Wing and servants' houses: wattle walls, a gabled thatch roof, a door; turned by the frame given. */
function smallHouse(F, w, d, open, rand, lod, H = 2.3) {
  const th = 0.4, wm = WALLS[Math.floor(rand() * WALLS.length)], dc = w / 2, dw = 0.95;
  F.b('earth_wall', -0.3, 0, -0.3, w + 0.3, 0.3, d + 0.3, false);
  F.b(wm, 0, 0.3, 0, dc - dw / 2, 0.3 + H, th); F.b(wm, dc + dw / 2, 0.3, 0, w, 0.3 + H, th); F.b(wm, dc - dw / 2, 2.0, 0, dc + dw / 2, 0.3 + H, th, false);
  F.b(wm, 0, 0.3, th, th, 0.3 + H, d); F.b(wm, w - th, 0.3, th, w, 0.3 + H, d); F.b(wm, th, 0.3, d - th, w - th, 0.3 + H, d);
  doorway(F, dc, 0, 0.3, dw, 1.8, th, open);
  F.b('opening', 0.8, 1.6, -0.01, 1.4, 2.1, 0.03, false); F.b('opening', w - 1.4, 1.6, -0.01, w - 0.8, 2.1, 0.03, false);
  skirt(F, 0, 0, w, d, 0.3, [dc - dw / 2 - 0.1, dc + dw / 2 + 0.1], 0.5); if (!lod) streaks(F, 0, 0, w, 0.3 + H, rand, 3, [dc - dw / 2, dc + dw / 2]);
  F.roof(0, 0, w, d, 0.3 + H, 2.0, 0.7, false); ridge(F, 0, 0, w, d, 0.3 + H, 2.0, 0.7, false);
  if (open) {
    F.b('reed_mat', 0.7, 0.33, 1.0, w - 0.7, 0.36, d - 0.7, false); F.b('lacquer_black', dc - 0.5, 0.36, 2.0, dc + 0.5, 0.72, 2.7); vessel('gui', F.bag, F.P(dc, 2.35)[0], 0.72, F.P(dc, 2.35)[1], 0.8);
    F.b('earth_wall', th + 0.1, 0.33, d - th - 1.3, w - th - 0.1, 0.7, d - th - 0.1); F.b('reed_mat', th + 0.1, 0.7, d - th - 1.25, w - th - 0.1, 0.73, d - th - 0.15, false);
    jars(F, w - 2.4, th + 0.3, 3, 0.17, 0.33, 0.5); stool(F, 1.0, 2.6);
    F.b('timber', th + 0.1, 2.5, th, th + 0.2, 2.65, d - th, false); F.b('timber', w - th - 0.2, 2.5, th, w - th - 0.1, 2.65, d - th, false);
  } else if (!lod) { bench(F, 0.8, -0.55, 1.4, 0.4); }
}

/** shang_court_house: { rect, front, seed, open, lod } — a compound of the great: a fenced yard, the main house at the back on its foundation, wings facing the yard, pit houses by the gate, granary, well, hearth, garden, pen. */
export function courtHouse(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D, lod = el.lod ?? 0;
  const gate = [W / 2 - 1.3, W / 2 + 1.3];
  fence(F, 0.4, 0.4, W - 0.4, D - 0.4, [gate], lod);
  const hw = 11 + Math.floor(rand() * 3), hd = 6.4, hv = D - hd - 1.3;
  mainHouse(F, (W - hw) / 2, hv, hw, hd, !!el.open, rand, lod);
  smallHouse(F.sub(5.6, 7.0, '+u'), 7.4, 4.8, lod === 0 && rand() < 0.5, rand, lod);
  smallHouse(F.sub(W - 5.6, 7.0, '-u'), 7.4, 4.8, false, rand, lod);
  pitHouse(F.sub(5.0, 6.2, 'back'), 0, 0, 3.6, 4.4, false, lod); if (rand() < 0.85) pitHouse(F.sub(W - 1.4, 6.2, 'back'), 0, 0, 3.6, 4.4, false, lod);
  granary(F, 1.6, D - 5.2, 2.6, 2.6);
  well(F, W / 2 - 4.6, 11); hearth(F, W / 2 + 4.5, 12.2, lod);
  pitStore(F, W / 2 - 2.5, 4.2, 0.8); pitStore(F, W / 2 + 2.5, 5.6, 0.7);
  pen(F, W - 6.6, D - 8.0, W - 1.2, D - 2.6, [W - 4.4, W - 3.3]);
  garden(F, 1.4, 14.6, 7.8, D - 6.0 < 15.4 ? 15.4 : D - 6.0, rand() < 0.5 ? 'millet' : 'hemp', rand, lod);
  tree(F, W / 2 + 7.2, 5.2, 4.4, rand() < 0.5 ? 'mulberry' : 'jujube');
  if (!lod) {
    rack(F, W / 2 + 3, 2.2, 3.4); rack(F, W / 2 - 7, 2.2, 3.0); jars(F, 1.2, 2.2, 3); woodpile(F, W / 2 + 7.2, 2.0, 2.4); grind(F, W / 2 - 8.5, 13.4);
    shock(F, 2.4, 11.4); shock(F, 3.4, 11.9); heap(F, 'hide_tan', W / 2 + 9, 11.5, 0.8); washline(F, W - 9.6, 5.8, 3.4, rand); bench(F, W / 2 + 1.5, 9.0, 1.8);
  }
}

/** shang_pit_yard: { rect, front, seed, open, lod } — pit houses round a yard with a hearth, a granary, racks, a pen, storage pits, a garden. */
export function pitYard(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D, lod = el.lod ?? 0;
  fence(F, 0.4, 0.4, W - 0.4, D - 0.4, [[W / 2 - 1.1, W / 2 + 1.1]], lod);
  pitHouse(F.sub(1.8 + 3.6, 2.0 + 4.6, 'back'), 0, 0, 3.6, 4.6, false, lod); pitHouse(F.sub(W - 1.8, 2.0 + 4.6, 'back'), 0, 0, 3.6, 4.6, false, lod);
  const rv = D - 6.4;
  pitHouse(F, 1.6, rv, 3.8, 4.6, false, lod); pitHouse(F, W / 2 - 3.2, rv, 5.0, 5.0, !!el.open, lod); pitHouse(F, W - 5.4, rv, 3.8, 4.6, false, lod);
  hearth(F, W / 2, D / 2 - 1, lod);
  granary(F, W / 2 + 4.4, D / 2 - 3.2, 2.6, 2.6); well(F, 4.6, D / 2 - 1);
  pitStore(F, W / 2 - 4.4, 5.6, 0.8); pitStore(F, W / 2 + 3.4, 5.2, 0.75);
  pen(F, W - 7.0, 6.6, W - 1.2, 11.4, [W - 4.8, W - 3.7]);
  garden(F, 1.4, D / 2 + 2.6, 8.2, D / 2 + 6.4 > rv - 0.8 ? rv - 0.8 : D / 2 + 6.4, rand() < 0.5 ? 'millet' : 'beans', rand, lod);
  tree(F, W / 2 + 8.8, D / 2 + 4.6, 4.2, rand() < 0.5 ? 'mulberry' : 'jujube');
  if (!lod) { rack(F, W / 2 - 2.5, D / 2 + 3.6, 3); jars(F, W - 7.5, D / 2 + 3.4, 4); woodpile(F, W - 9.0, D - 1.0 > rv + 5 ? rv + 5.2 : D - 1.0, 2.2); grainMat(F, W / 2 + 3.2, D / 2 + 2.6); shock(F, W - 3, D / 2 + 3); shock(F, W - 3.9, D / 2 + 3.5); dogHouse(F, 2.4, 6.4); }
}

/** shang_row_house: { rect, front, seed, open, lod } — three houses of wattle with thatched gables on the lane, an alley between, a yard behind with a rack, pit, pen, garden, well. */
export function rowHouse(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D, lod = el.lod ?? 0;
  const alley = [9.4, 10.9], spans = [[0.5, alley[0] - 0.2], [alley[1] + 0.2, alley[1] + 8.4], [alley[1] + 8.8, W - 0.5]];
  spans.forEach(([a0, a1], i) => {
    const w = a1 - a0, d = 5.2 + rand() * 1.2, th = 0.4, H = 2.4, wm = WALLS[Math.floor(rand() * WALLS.length)], dc = a0 + w / 2, open = !!el.open && i === 1, v = 0.7;
    F.b(wm, a0, 0, v, dc - 0.5, H, v + th); F.b(wm, dc + 0.5, 0, v, a1, H, v + th); F.b(wm, dc - 0.5, 1.85, v, dc + 0.5, H, v + th, false);
    F.b(wm, a0, 0, v + th, a0 + th, H, v + d); F.b(wm, a1 - th, 0, v + th, a1, H, v + d); F.b(wm, a0 + th, 0, v + d - th, a1 - th, H, v + d);
    doorway(F, dc, v, 0, 1.0, 1.85, th, open);
    for (const s of [-1, 1]) { const c = dc + s * w * 0.3; F.b('opening', c - 0.3, 1.45, v - 0.01, c + 0.3, 1.95, v + 0.03, false); F.b('timber', c - 0.36, 1.4, v - 0.03, c + 0.36, 1.45, v + 0.05, false); }
    skirt(F, a0, v, w, d, 0, [dc - 0.6, dc + 0.6], 0.5); if (!lod) streaks(F, a0, v, w, H, rand, 3, [dc - 0.5, dc + 0.5]);
    F.roof(a0, v, a1, v + d, H, 2.1, 0.75, false); ridge(F, a0, v, a1, v + d, H, 2.1, 0.75, false);
    // the lane front: a pent roof over the door on two posts, a bench, jars and baskets, a hung bundle
    if (!lod) {
      F.b('timber', dc - 1.1, 2.0, v - 0.75, dc - 1.0, 2.1, v - 0.05, false);
      for (const s of [-1, 1]) F.post(dc + s * 1.05, v - 0.7, 0, 2.1, 0.07);
      F.roof(dc - 1.2, v - 0.8, dc + 1.2, v - 0.05, 2.1, 0.5, 0.15, false);
      bench(F, a0 + 0.3, v - 0.55, 1.6); jars(F, a1 - 2.4, v - 0.5, 3, 0.2); F.b('wicker', dc + 1.4, 0, v - 0.45, dc + 1.8, 0.3, v - 0.1, false);
    }
    if (open) { F.b('reed_mat', a0 + 0.6, 0.01, v + 1.0, a1 - 0.6, 0.04, v + d - 0.6, false); F.b('lacquer_black', dc - 0.5, 0.04, v + 2.1, dc + 0.5, 0.42, v + 2.8); vessel('gui', F.bag, F.P(dc, v + 2.45)[0], 0.42, F.P(dc, v + 2.45)[1], 0.8);
      F.b('earth_wall', a0 + th + 0.1, 0, v + d - th - 1.2, a1 - th - 0.1, 0.42, v + d - th - 0.1); F.b('reed_mat', a0 + th + 0.1, 0.42, v + d - th - 1.15, a1 - th - 0.1, 0.45, v + d - th - 0.15, false);
      jars(F, a1 - 2.8, v + th + 0.3, 3, 0.18, 0, 0.55); loom(F, a0 + th + 0.3, v + 2.3); for (const a of [a0 + 0.8, dc, a1 - 0.8]) F.b('timber', a - 0.08, 2.15, v + th, a + 0.08, 2.3, v + d - th, false); }
  });
  // the alley: two posts, a lintel, a lamp-less gate between the houses; the party walls of wattle
  for (const a of alley) F.b('timber', a - 0.1, 0, 0.5, a + 0.1, 2.2, 0.7, false);
  F.b('timber', alley[0] - 0.15, 2.1, 0.5, alley[1] + 0.15, 2.28, 0.7, false);
  fenceRun(F, 0.4, 7.0, alley[0] - 0.2, 7.0); fenceRun(F, alley[1] + 0.2, 7.0, W - 0.4, 7.0, [[W / 2 + 4.6, W / 2 + 6.2]]);
  fenceRun(F, 0.4, D - 0.4, W - 0.4, D - 0.4); fenceRun(F, 0.4, 0.4, 0.4, D - 0.4); fenceRun(F, W - 0.4, 0.4, W - 0.4, D - 0.4);
  well(F, W / 2 - 5, 12.4); pitStore(F, W / 2 + 0.5, 10.6, 0.75); hearth(F, W / 2 + 3, 11, lod);
  pen(F, W - 6.5, 8.4, W - 1.2, 13.0, [W - 4.4, W - 3.3]);
  garden(F, 1.4, 14.6, W / 2 + 4, D - 1.4, rand() < 0.5 ? 'millet' : 'hemp', rand, lod);
  tree(F, 3.2, 10.6, 4.0, rand() < 0.5 ? 'mulberry' : 'jujube');
  if (!lod) { rack(F, W / 2 + 5, 15.2, 3.4); jars(F, W - 7.2, 15.4, 4); woodpile(F, W - 8.2, D - 1.7, 2.4); grainMat(F, 2, 8.4, 2.6, 2.2); shock(F, W - 3, 19); shock(F, W - 3.9, 19.6); washline(F, W / 2 + 4.6, 20.4, 3.4, rand); }
}

/** shang_workshop: { rect, front, seed, open, trade, lod } — a yard of a craft: bone, jade, pottery or the oracle-bone craft, under a shed of posts and thatch. */
export function workshop(el, ctx) {
  const rand = rng(el.seed), F = frame(el.rect, el.front, ctx.bag, ctx.col), W = F.W, D = F.D, T = el.trade ?? 'bone', lod = el.lod ?? 0;
  fence(F, 0.4, 0.4, W - 0.4, D - 0.4, [[W / 2 - 1.3, W / 2 + 1.3]], lod);
  const su0 = 1.5, sv0 = D - 10, su1 = W - 1.5, sv1 = D - 1.4, sh = 2.6;
  for (let u = su0; u <= su1 + 0.1; u += (su1 - su0) / 5) for (const v of [sv0, sv1]) F.post(u, v, 0, sh, 0.13);
  F.b('timber', su0, sh, sv0 - 0.1, su1, sh + 0.18, sv0 + 0.1, false); F.b('timber', su0, sh, sv1 - 0.1, su1, sh + 0.18, sv1 + 0.1, false);
  F.roof(su0, sv0, su1, sv1, sh + 0.18, 2.1, 0.8, false); ridge(F, su0, sv0, su1, sv1, sh + 0.18, 2.1, 0.8, false);
  F.b('wicker', su0, 0, sv1 - 0.05, su1, 1.1, sv1 + 0.05);                              // the shed's back wall, waist high
  const bn = (u, v, l = 3, wd = 0.9) => { F.b('timber', u, 0.62, v, u + l, 0.7, v + wd); for (const a of [0.1, l - 0.2]) for (const b of [0.1, wd - 0.2]) F.b('timber', u + a, 0, v + b, u + a + 0.1, 0.62, v + b + 0.1, false); F.col.rect(F.R(u, v, u + l, v + wd), 0, 0.7); };
  if (T === 'bone') {
    bn(su0 + 1, sv0 + 2.4, 3.2); for (let i = 0; i < 6; i++) F.b('ivory', su0 + 1.2 + i * 0.45, 0.7, sv0 + 2.6, su0 + 1.3 + i * 0.45, 0.72, sv0 + 3.2, false);
    bn(su1 - 4.5, sv0 + 2.4, 3.2); for (let i = 0; i < 5; i++) F.b('ivory', su1 - 4.3 + i * 0.55, 0.7, sv0 + 2.6, su1 - 4.1 + i * 0.55, 0.78, sv0 + 3.1, false);
    bn(W / 2 - 1.6, sv0 + 5.2, 3.2); for (let i = 0; i < 4; i++) F.b('ivory', W / 2 - 1.4 + i * 0.7, 0.7, sv0 + 5.4, W / 2 - 1.0 + i * 0.7, 0.74, sv0 + 5.9, false);
    heap(F, 'ivory', W / 2 - 4, 6, 1.1); heap(F, 'ivory', W / 2 + 4, 7, 0.9); heap(F, 'hide_grey', W - 5, 8, 1.0); F.lathe('granite_grey', [[0.5, 0], [0.5, 0.3], [0.001, 0.32]], W / 2, 0, D / 2 - 2.5, 8);
    for (let k = 0; k < 8; k++) F.b('ivory', 2 + k * 0.3, 0, 7, 2.2 + k * 0.3, 1.1 + (k % 3) * 0.1, 7.1, false);        // bone blanks leaned on the fence
  } else if (T === 'jade') {
    bn(su0 + 1, sv0 + 2.4, 2.4); F.lathe('inlay_jade', [[0.001, 0.7], [0.14, 0.7], [0.14, 0.76], [0.001, 0.8]], su0 + 1.6, 0, sv0 + 2.8, 8);
    F.b('reed_mat', W / 2 - 1.6, 0.01, sv0 + 1.2, W / 2 + 1.6, 0.04, sv0 + 3.4, false); for (let i = 0; i < 5; i++) F.b('inlay_jade', W / 2 - 1.2 + i * 0.5, 0.04, sv0 + 2.0, W / 2 - 0.95 + i * 0.5, 0.07, sv0 + 2.5, false);
    F.lathe('sandstone', [[0.4, 0], [0.4, 0.2], [0.001, 0.2]], su1 - 2, 0, sv0 + 3, 8); F.lathe('granite_grey', [[0.5, 0.2], [0.5, 0.26]], su1 - 2, 0, sv0 + 3, 12);
    F.b('timber', su1 - 5.2, 0.36, sv0 + 4.6, su1 - 3.6, 0.44, sv0 + 5.2); F.b('serpentine', su1 - 4.9, 0.44, sv0 + 4.7, su1 - 4.2, 0.52, sv0 + 5.1, false);   // a treadle-less lapidary's bench
    heap(F, 'granite_grey', W / 2 + 4, 6.5, 1.0); heap(F, 'serpentine', W / 2 - 4.5, 7, 0.7); jars(F, 2, 6, 3, 0.2);
  } else if (T === 'pottery') {
    const kb = F.P(W / 2, 6); F.bag.add('mud_plaster', frustum([kb[0] - 2.2, kb[1] - 2.0, kb[0] + 2.2, kb[1] + 2.0], 0, 1.7, 0.9, 0.9, 0.8, 0.8, { noBottom: true })); F.col.rect(F.R(W / 2 - 2.2, 4, W / 2 + 2.2, 8), 0, 1.7);
    F.b('opening', W / 2 - 0.5, 0.1, 4.05, W / 2 + 0.5, 0.9, 4.1, false); F.lathe('granite_black', [[0.001, 1.7], [0.3, 1.7], [0.3, 1.82], [0.001, 1.82]], W / 2, 0, 6, 8);
    for (let r = 0; r < 4; r++) jars(F, 2 + r * 0.1, 9.2 + r * 0.9, 6, 0.2 + 0.03 * r);
    F.lathe('timber', [[0.35, 0.3], [0.35, 0.36], [0.001, 0.36]], su1 - 1.5, 0, sv0 + 2.3, 12); F.b('timber', su1 - 1.6, 0, sv0 + 2.2, su1 - 1.4, 0.3, sv0 + 2.4, false);
    heap(F, 'mud_plaster', W - 3, 5, 1.2); heap(F, 'mud_plaster', 3.5, 5, 1.0); woodpile(F, W - 7.5, 3.2, 2.4, 5); F.b('reed_mat', 2, 0.01, 3.0, 6, 0.04, 5, false); for (let k = 0; k < 7; k++) F.lathe('terracotta', [[0.001, 0], [0.18, 0.01], [0.2, 0.2], [0.001, 0.24]], 2.4 + k * 0.55, 0.04, 4, 7);
  } else {
    bn(su0 + 1, sv0 + 2.4, 3.4); for (let i = 0; i < 5; i++) F.b('ivory', su0 + 1.2 + i * 0.62, 0.7, sv0 + 2.6, su0 + 1.7 + i * 0.62, 0.74, sv0 + 3.2, false);
    bn(su1 - 4.6, sv0 + 2.4, 3.4); F.b('bronze', su1 - 2.2, 0.7, sv0 + 2.7, su1 - 1.9, 0.72, sv0 + 3.0, false);
    F.lathe('bronze', [[0.001, 0.3], [0.28, 0.33], [0.32, 0.46], [0.001, 0.46]], W / 2, 0, D / 2 - 2, 10); F.lathe('flame', [[0.001, 0.46], [0.1, 0.5], [0.001, 0.7]], W / 2, 0, D / 2 - 2, 6);
    heap(F, 'hide_grey', W / 2 - 4, 6, 1.0); heap(F, 'ivory', W / 2 + 4, 5.5, 0.8); rack(F, 2.5, 6.6, 3);
  }
  jars(F, su0 + 0.2, sv1 - 0.9, 3); tree(F, W - 2.8, 4.2, 3.8, 'jujube'); if (!lod) { woodpile(F, 1.6, 2.2, 2.2); stool(F, su0 + 3, sv0 + 3.8); stool(F, su1 - 6, sv0 + 3.8); }
}
export const KINDS_H = WALLS;
void mainEave;
