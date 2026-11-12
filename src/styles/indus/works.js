// The works of the Citadel and the lanes (docs/settlements/mohenjo-daro.md §12): the covered brick drains of the platform's streets and lanes at the platform's
// height (the Lower Town's are drawn at the plain), their outfalls through the parapet, wells with their rope and pots, the dressing of the Great Bath's court
// (a gutter, racks for the bathers' cloth, lamp niches in the piers, washing lines, puddles), the pipal on its brick seat, the banner poles of the towers.
// Everything is small, non-solid except the wells and the trunk; coordinates are the settlement's (absolute), y the height of the ground it stands on.
import { box, lathe, frustum } from '../../core/geom.js';
import { rng } from './kit.js';

const JAR = (s) => [[0.07 * s, 0], [0.2 * s, 0.12 * s], [0.24 * s, 0.3 * s], [0.19 * s, 0.5 * s], [0.1 * s, 0.6 * s], [0.12 * s, 0.66 * s], [0.001, 0.66 * s]];
const jar = (bag, mat, x, y, z, s = 1) => bag.add(mat, lathe(JAR(s), 8, null, x, y, z), false);

/**
 * indus_drains: { y, runs: [[x0, z0, x1, z1] axis-aligned segments], w?, manhole? (spacing) } — a covered brick drain along each segment, its slabs
 * flush with the paving, a dark inspection slot every `manhole` m with a flat lid beside it, a soak jar where a branch would meet it.
 */
export function drains(el, ctx) {
  const { bag } = ctx, y = el.y ?? 0, w = el.w ?? 0.6, sp = el.manhole ?? 12, rand = rng(el.seed ?? 3);
  for (const [x0, z0, x1, z1] of el.runs) {
    const alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0), a = alongX ? Math.min(x0, x1) : Math.min(z0, z1), b = alongX ? Math.max(x0, x1) : Math.max(z0, z1), c = alongX ? z0 : x0;
    const R = (s0, d0, s1, d1, y0, y1, m) => bag.add(m, alongX ? box(s0, y + y0, c + d0, s1, y + y1, c + d1) : box(c + d0, y + y0, s0, c + d1, y + y1, s1), false);
    R(a, -w / 2, b, w / 2, 0.0, 0.07, 'brick');                                                // the cover slabs
    R(a, -w / 2 - 0.1, b, -w / 2, 0.0, 0.05, 'brick_baked'); R(a, w / 2, b, w / 2 + 0.1, 0.0, 0.05, 'brick_baked');   // the kerbs
    for (let s = a + sp * 0.5; s < b - 2; s += sp) {
      R(s, -w / 2 + 0.06, s + 0.5, w / 2 - 0.06, 0.07, 0.085, 'bitumen');                      // the inspection slot, dark
      R(s + 0.6, -w / 2 + 0.04, s + 1.2, w / 2 - 0.04, 0.07, 0.1, 'brick_buff');              // its lid, set aside
      if (rand() < 0.4) R(s - 0.7, w / 2 + 0.12, s - 0.1, w / 2 + 0.55, 0.0, 0.015, 'plaster_damp');   // a damp stain where it overflowed
    }
    // the salt that rises from the wet brick along the kerb: pale crust in patches
    for (let s = a + 1; s < b - 1; s += 2.5 + rand() * 4) R(s, -w / 2 - 0.2, s + 0.8 + rand() * 1.4, -w / 2 - 0.1, 0.0, 0.012, 'plaster_streak');
    if (b - a > 20) { const s = a + (b - a) * (0.3 + rand() * 0.4), side = rand() < 0.5 ? -1 : 1; jar(bag, 'terracotta', alongX ? s : c + side * (w / 2 + 0.5), y, alongX ? c + side * (w / 2 + 0.5) : s, 1.1); }
  }
}

/** indus_outfall: { at: [x, z], dir: 'e' | 'w' | 'n' | 's' (out over the mound's edge), y (the platform's) } — the drain's spout through the parapet and the stain it leaves down the facing. */
export function outfall(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, y = el.y, d = el.dir, sx = d === 'e' ? 1 : d === 'w' ? -1 : 0, sz = d === 's' ? 1 : d === 'n' ? -1 : 0, L = 1.6, w = 0.34;
  const R = (a0, b0, a1, b1, y0, y1, m) => { const p = [x + sx * a0 + sz * b0, z + sz * a0 + sx * b0], q = [x + sx * a1 + sz * b1, z + sz * a1 + sx * b1]; bag.add(m, box(Math.min(p[0], q[0]), y + y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + y1, Math.max(p[1], q[1])), false); };
  R(-0.4, -w, L, w, 0.28, 0.4, 'brick'); R(-0.4, -w, L, -w + 0.07, 0.4, 0.55, 'brick'); R(-0.4, w - 0.07, L, w, 0.4, 0.55, 'brick'); R(-0.4, -w + 0.07, L, w - 0.07, 0.4, 0.43, 'bitumen');
  // the stain below the lip, in runs, the salt fan at the foot of the facing
  R(L - 0.15, -0.3, L, 0.3, -2.2, 0.28, 'plaster_damp'); R(L - 0.15, -0.14, L, 0.14, -3.6, -2.2, 'plaster_damp'); R(L - 0.14, -0.5, L - 0.05, 0.5, -5.2, -3.2, 'plaster_streak');
}

/** indus_pwell: { c: [x, z], y, seed } — a round well of wedge bricks with its parapet, a rope and pot on the curb, a trough at the foot, jars about it, a paved wet apron. */
export function pwell(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, y = el.y ?? 0, rand = rng(el.seed ?? 7), r = 0.62;
  bag.add('brick', lathe([[r + 0.2, 0], [r + 0.2, 0.62], [r + 0.1, 0.72], [r - 0.14, 0.72], [r - 0.14, 0.3], [0.001, 0.3]], 20, null, x, y, z));
  bag.add('brick_buff', lathe([[r + 1.5, 0], [r + 1.5, 0.035], [r + 0.2, 0.05], [r + 0.2, 0]], 20, null, x, y, z), false);   // the paved apron
  bag.add('bitumen', lathe([[r + 1.0, 0.04], [r + 1.0, 0.045], [r + 0.2, 0.05], [r + 0.2, 0.04]], 18, null, x, y, z), false);   // wet where the water is spilt
  col.circle(x, z, r + 0.22, y, y + 0.7);
  const a = rand() * 6.28, ca = Math.cos(a), sa = Math.sin(a);
  // the rope and pot on the curb, the worn grooves of the rope in the lip
  bag.add('rope_fibre', box(x + ca * (r + 0.02) - 0.02, y + 0.72, z + sa * (r + 0.02) - 0.02, x + ca * (r + 0.02) + 0.02, y + 0.74, z + sa * (r + 0.02) + 0.02), false);
  jar(bag, 'terracotta', x + Math.cos(a + 0.7) * (r + 0.02), y + 0.72, z + Math.sin(a + 0.7) * (r + 0.02), 1.0);
  // the trough of brick for the beasts and the washing, with water in it, and the jars waiting
  const tx = x + Math.cos(a + 3.0) * (r + 1.9), tz = z + Math.sin(a + 3.0) * (r + 1.9), alongX = Math.abs(Math.cos(a + 3.0)) < 0.7;
  const TB = alongX ? [tx - 0.9, tz - 0.3, tx + 0.9, tz + 0.3] : [tx - 0.3, tz - 0.9, tx + 0.3, tz + 0.9];
  bag.add('brick', box(TB[0], y, TB[1], TB[2], y + 0.5, TB[3])); col.rect(TB, y, y + 0.5); bag.add('water', box(TB[0] + 0.08, y + 0.4, TB[1] + 0.08, TB[2] - 0.08, y + 0.45, TB[3] - 0.08), false);
  for (let k = 0; k < 4; k++) { const b = a + 1.4 + k * 0.5 + rand() * 0.2, rr = r + 1.0 + rand() * 0.5; jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', x + Math.cos(b) * rr, y, z + Math.sin(b) * rr, 1.3 + rand() * 0.5); }
}

/** indus_pipal: { c: [x, z], y, h?, seed } — a pipal on a round seat of brick: the trunk, forking limbs, a canopy of lobes of leaf, the sacred tree of the seals. */
export function pipal(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, y = el.y ?? 0, rand = rng(el.seed ?? 11), H = el.h ?? 8.5, seat = 2.6;
  bag.add('brick', lathe([[seat, 0], [seat, 0.5], [seat - 0.12, 0.58], [0.5, 0.58], [0.001, 0.58]], 20, null, x, y, z)); col.circle(x, z, seat, y, y + 0.55);
  bag.add('brick_buff', lathe([[seat + 1.2, 0], [seat + 1.2, 0.03], [seat, 0.04], [seat, 0]], 20, null, x, y, z), false);
  bag.add('bark_grey', lathe([[0.55, 0.5], [0.42, 1.0], [0.34, 2.4], [0.3, H * 0.42], [0.001, H * 0.42]], 10, null, x, y, z)); col.circle(x, z, 0.4, y, y + H);
  const limbs = 5;
  for (let k = 0; k < limbs; k++) {
    const a = (k / limbs) * 6.28 + rand() * 0.6, len = 2.6 + rand() * 1.6, y0 = H * 0.36 + rand() * 0.6, rise = 1.4 + rand() * 1.0;
    const px = x + Math.cos(a) * len, pz = z + Math.sin(a) * len, py = y + y0 + rise;
    // a limb as a stack of short boxes rising outward (no tilt available: steps of the width of the branch)
    for (let s = 0; s < 4; s++) { const f = s / 4, g = (s + 1) / 4, ax0 = x + Math.cos(a) * len * f, az0 = z + Math.sin(a) * len * f, ax1 = x + Math.cos(a) * len * g, az1 = z + Math.sin(a) * len * g, yy = y + y0 + rise * f, w = 0.14 - 0.02 * s; bag.add('bark_grey', box(Math.min(ax0, ax1) - w, yy, Math.min(az0, az1) - w, Math.max(ax0, ax1) + w, yy + 2 * w + rise * 0.25, Math.max(az0, az1) + w), false); }
    // the lobe of leaf at its end, a flattened dome, and a smaller one above the fork
    const R = 2.4 + rand() * 1.3;
    bag.add('palm_leaf', lathe([[0.001, 0], [R * 0.75, 0.15], [R, R * 0.35], [R * 0.82, R * 0.62], [R * 0.4, R * 0.78], [0.001, R * 0.82]], 9, null, px, py + 0.2, pz), false);
  }
  bag.add('palm_leaf', lathe([[0.001, 0], [2.6, 0.1], [3.2, 1.0], [2.4, 1.9], [1.0, 2.4], [0.001, 2.5]], 9, null, x, y + H * 0.72, z), false);
}

/** indus_banner: { c: [x, z], y, h, seed } — a pole of timber on a tower's top with a long streamer of cloth. */
export function banner(el, ctx) {
  const { bag } = ctx, [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 3, m = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white'][(el.seed ?? 0) % 4];
  bag.add('timber', box(x - 0.06, y, z - 0.06, x + 0.06, y + h, z + 0.06), false);
  bag.add('bronze', box(x - 0.09, y + h, z - 0.09, x + 0.09, y + h + 0.16, z + 0.09), false);
  for (let k = 0; k < 5; k++) bag.add(m, box(x + 0.06 + k * 0.28, y + h - 0.2 - k * 0.07, z - 0.012, x + 0.34 + k * 0.28, y + h - 0.75 - k * 0.12, z + 0.012), false);
}

/**
 * indus_bathdress: { B (the layout's BATH), y } — the court of the Great Bath dressed for the bathers: the gutter that takes the splash, racks for the cloth they
 * leave, lamp niches in the piers, washing lines between them, folded cloth and sandals at the coping, ladles, puddles where the wet feet have been.
 */
export function bathdress(el, ctx) {
  const { bag, col } = ctx, B = el.B, y = el.y, rand = rng(el.seed ?? 5), [cx0, cz0, cx1, cz1] = B.court, [px0, pz0, px1, pz1] = B.pool, [ox0] = B.outer, wt = B.wall;
  const flat = (x0, z0, x1, z1, y0, y1, m) => bag.add(m, box(x0, y + y0, z0, x1, y + y1, z1), false);
  // the gutter along the court's four edges, 0.3 m wide, of dark bitumen between two kerbs of baked brick; it takes the splash to the corner outlet
  for (const [x0, z0, x1, z1] of [[cx0 + 0.9, cz0 + 1.05, cx1 - 0.9, cz0 + 1.35], [cx0 + 0.9, cz1 - 1.35, cx1 - 0.9, cz1 - 1.05]]) { flat(x0, z0 - 0.07, x1, z0, 0, 0.05, 'brick_baked'); flat(x0, z1, x1, z1 + 0.07, 0, 0.05, 'brick_baked'); flat(x0, z0, x1, z1, 0, 0.012, 'bitumen'); }
  flat(cx0 + 1.05, cz0 + 1.35, cx0 + 1.35, cz1 - 1.35, 0, 0.012, 'bitumen'); flat(cx0 + 0.98, cz0 + 1.35, cx0 + 1.05, cz1 - 1.35, 0, 0.05, 'brick_baked'); flat(cx0 + 1.35, cz0 + 1.35, cx0 + 1.42, cz1 - 1.35, 0, 0.05, 'brick_baked');
  // puddles where the wet feet have come out of the pool: dark, reflective, laid on the paving at both stair heads and along the coping
  for (const [x, z, w, d] of [[(px0 + px1) / 2 - 1.2, pz1 + 0.9, 1.7, 1.1], [(px0 + px1) / 2 + 1.3, pz1 + 1.4, 1.2, 0.8], [px0 - 0.9, pz1 - 2.5, 0.9, 1.6], [px1 + 0.9, pz0 + 2.0, 0.9, 1.4], [(px0 + px1) / 2, pz0 - 1.0, 2.0, 0.9], [px1 + 1.2, pz1 - 1.5, 1.0, 1.0]]) flat(x - w / 2, z - d / 2, x + w / 2, z + d / 2, 0.003, 0.016, 'water');
  // racks of timber for the cloth left by the bathers along the west wall, between the benches; cloth hung over each
  for (let k = 0; k < 4; k++) {
    const x = ox0 + wt + 1.3, z = cz0 + 5.25 + k * 4.5;
    flat(x - 0.05, z - 0.9, x + 0.05, z - 0.8, 0, 1.7, 'timber'); flat(x - 0.05, z + 0.8, x + 0.05, z + 0.9, 0, 1.7, 'timber'); flat(x - 0.06, z - 0.95, x + 0.06, z + 0.95, 1.62, 1.7, 'timber');
    for (let c = 0; c < 2 + (k % 2); c++) flat(x - 0.1, z - 0.7 + c * 0.55, x + 0.1, z - 0.3 + c * 0.55, 0.85 + (c % 2) * 0.1, 1.64, ['cloth_white', 'cloth_ochre', 'cloth_white', 'cloth_red'][(k + c) % 4]);
  }
  // lamp niches in the piers on the court faces, a soot smear above each; a washing line across some bays of the north and south galleries
  const xs = Array.from({ length: 9 }, (_, i) => cx0 + 0.55 + (cx1 - cx0 - 1.1) * i / 8);
  for (const [z, s] of [[cz0 - 0.55, 1], [cz1 + 0.55, -1]]) for (let i = 1; i < 8; i += 2) { flat(xs[i] - 0.1, z + s * 0.5, xs[i] + 0.1, z + s * 0.56, 1.25, 1.45, 'bitumen'); flat(xs[i] - 0.07, z + s * 0.5, xs[i] + 0.07, z + s * 0.545, 1.46, 1.9, 'plaster_damp'); }
  for (const i of [0, 2, 5, 7]) {
    const x0 = xs[i] + 0.6, x1 = xs[i + 1] - 0.6, zz = cz0 - 0.3;
    flat(x0, zz - 0.012, x1, zz + 0.012, 2.25, 2.27, 'rope_fibre');
    for (let c = 0; c < 3; c++) { const xx = x0 + 0.3 + c * ((x1 - x0 - 0.9) / 2); flat(xx, zz - 0.02, xx + 0.55, zz + 0.02, 1.45, 2.25, ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][(i + c) % 4]); }
  }
  // folded cloth and a pair of sandals' worth of leather at the coping, a ladle of clay on its rim, a bronze bowl on the corner
  for (const [x, z] of [[px0 - 0.9, pz0 + 1.0], [px1 + 1.0, pz1 - 1.0], [px0 - 1.1, pz1 - 3.0]]) {
    for (let k = 0; k < 3; k++) flat(x - 0.28, z - 0.2, x + 0.28, z + 0.2, 0.0 + k * 0.045, 0.045 + k * 0.045, ['cloth_white', 'cloth_ochre', 'cloth_white'][k]);
    flat(x + 0.45, z - 0.12, x + 0.7, z + 0.12, 0, 0.03, 'hide_tan');
  }
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.16, 0.08], [0.17, 0.1], [0.001, 0.1]], 8, null, px1 + 0.18, y + 0.14, pz0 + 0.18), false);
  for (const [x, z] of [[px0 - 0.15, pz0 - 0.15], [px1 + 0.15, pz1 + 0.15]]) jar(bag, 'terracotta', x, y + 0.14, z, 0.9);
  // the water jars at the south doors, in a row against the wall, and a low stand with a dipper
  for (let k = 0; k < 5; k++) jar(bag, k % 2 ? 'pottery_dark' : 'terracotta', cx0 + 2.5 + k * 0.7, y, cz1 - 1.2, 1.7);
  col.rect([cx0 + 2.0, cz1 - 1.7, cx0 + 6.1, cz1 - 0.7], y, y + 1.1);
  void rand;
}

/** indus_pshade: { c: [x, z], y } — the water-stand of the platform: a pavilion of reed mats on four poles over a brick table with jars and a bench (the market's pavilion, at the platform's height). */
export function pshade(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, y = el.y ?? 0, H = 3.2, a = 2.0;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bag.add('timber', box(x + sx * a - 0.09, y, z + sz * a - 0.09, x + sx * a + 0.09, y + H, z + sz * a + 0.09)); col.circle(x + sx * a, z + sz * a, 0.11, y, y + H); }
  for (let k = -1; k <= 1; k++) bag.add('timber', box(x - a - 0.2, y + H, z + k * 1.3 - 0.06, x + a + 0.2, y + H + 0.1, z + k * 1.3 + 0.06), false);
  bag.add('reed_mat', box(x - a - 0.3, y + H + 0.1, z - a - 0.3, x + a + 0.3, y + H + 0.17, z + a + 0.3), false);
  bag.add('cloth_ochre', box(x - a - 0.3, y + H - 0.35, z + a + 0.26, x + a + 0.3, y + H, z + a + 0.3), false);
  bag.add('brick', box(x - 1.4, y, z - 0.5, x + 1.4, y + 0.75, z)); col.rect([x - 1.4, z - 0.5, x + 1.4, z], y, y + 0.75);
  for (let k = -1; k <= 1; k++) jar(bag, k % 2 ? 'terracotta' : 'pottery_dark', x + k * 0.8, y + 0.75, z - 0.25, 1.6);
  bag.add('mudbrick', box(x - 1.5, y, z + 0.9, x + 1.5, y + 0.44, z + 1.4)); col.rect([x - 1.5, z + 0.9, x + 1.5, z + 1.4], y, y + 0.44);
  bag.add('reed_mat', box(x - 1.4, y + 0.44, z + 0.95, x + 1.4, y + 0.47, z + 1.35), false);
}

/**
 * indus_topdress: { y, B (BATH), college: rect, pillared: rect, granary: rect, stair: rect } — what stands in the platform's streets: benches of mud brick along the College's
 * north face, heaps of sacks and jars at the granary's loading ramp, a stack of brick, tripod braziers at the stair's head, a scribe's mat with its clay blanks, and the
 * rolled reed curtains over the Bath's doors.
 */
export function topdress(el, ctx) {
  const { bag, col } = ctx, y = el.y, rand = rng(el.seed ?? 8), [gx0, gz0, gx1, gz1] = el.granary, [kx0, kz0, kx1] = el.college;
  const B = (x0, z0, x1, z1, y0, y1, m, solid = false) => { bag.add(m, box(x0, y + y0, z0, x1, y + y1, z1), solid ? undefined : false); if (solid) col.rect([x0, z0, x1, z1], y + y0, y + y1); };
  for (let x = kx0 + 8; x < kx1 - 10; x += 12) { B(x, kz0 - 0.62, x + 2.4, kz0 - 0.1, 0, 0.44, 'mudbrick', true); B(x + 0.1, kz0 - 0.55, x + 2.3, kz0 - 0.15, 0.44, 0.47, 'reed_mat'); if (rand() < 0.5) jar(bag, 'terracotta', x + 2.9, y, kz0 - 0.5, 1.3); }
  // heaps of sacks and jars by the loading ramp (the ramp rises on the granary's south, x0 + 23.6 .. 27.4)
  for (const [cx, cz, s] of [[gx0 + 17.5, gz1 + 3.4, -1], [gx0 + 33.4, gz1 + 3.0, 1], [gx0 + 14.5, gz1 + 8.0, -1]]) {
    for (let k = 0; k < 7; k++) { const a = (k % 3) * 0.8, b = Math.floor(k / 3) * 0.55; B(cx + s * a - 0.45, cz + b - 0.3, cx + s * a + 0.45, cz + b + 0.3, (k > 4 ? 0.38 : 0), (k > 4 ? 0.76 : 0.38), k % 2 ? 'sacking' : 'wicker'); }
    for (let k = 0; k < 3; k++) jar(bag, k % 2 ? 'pottery_dark' : 'terracotta', cx + s * (2.4 + k * 0.5), y, cz + 0.5 + rand() * 0.6, 1.7);
  }
  // a stack of baked brick, mortar mud in a trough: the mending of the facing
  { const x = -128, z = -86; for (let c = 0; c < 9; c++) for (let k = 0; k < 7 - Math.floor(c / 3) * 2; k++) B(x + k * 0.3 - 1, z + (c % 3) * 0.16 - 0.2, x + k * 0.3 - 0.72, z + (c % 3) * 0.16 - 0.04, Math.floor(c / 3) * 0.1, Math.floor(c / 3) * 0.1 + 0.095, 'brick'); B(x + 1.6, z - 0.4, x + 2.8, z + 0.4, 0, 0.3, 'wood_dark'); B(x + 1.7, z - 0.3, x + 2.7, z + 0.3, 0.2, 0.28, 'mudbrick'); }
  // tripod braziers with embers at the stair's head, either side of the way; a rail of timber along each side of the first steps
  { const [sx0, sz0, , sz1] = el.stair; for (const z of [sz0 - 2.5, sz1 + 2.5]) { const x = sx0 - 2.2; for (let a = 0; a < 3; a++) B(x + Math.cos(a * 2.09) * 0.32 - 0.03, z + Math.sin(a * 2.09) * 0.32 - 0.03, x + Math.cos(a * 2.09) * 0.32 + 0.03, z + Math.sin(a * 2.09) * 0.32 + 0.03, 0, 0.8, 'timber'); bag.add('bronze', lathe([[0.001, 0], [0.34, 0.05], [0.42, 0.22], [0.3, 0.25], [0.001, 0.2]], 10, null, x, y + 0.8, z), false); bag.add('wood_dark', lathe([[0.001, 0.2], [0.3, 0.2], [0.001, 0.22]], 10, null, x, y + 0.8, z), false); } }
  // the scribe's mat: a reed mat, blanks of clay in rows, a bowl of water, a copper tool; beside the Pillared Hall's south stair
  { const x = el.pillared[0] + 8, z = el.pillared[1] - 3.2; B(x - 1.1, z - 0.8, x + 1.1, z + 0.8, 0, 0.03, 'reed_mat'); for (let k = 0; k < 8; k++) B(x - 0.9 + (k % 4) * 0.28, z - 0.3 + Math.floor(k / 4) * 0.28, x - 0.7 + (k % 4) * 0.28, z - 0.1 + Math.floor(k / 4) * 0.28, 0.03, 0.06, 'earth_wall'); bag.add('terracotta', lathe([[0.001, 0], [0.14, 0.01], [0.16, 0.08], [0.001, 0.08]], 8, null, x + 0.6, y + 0.03, z + 0.5), false); }
  // the rolled reed curtains over the Bath's doors on the inner face, and a stone threshold in each
  { const [ox0, oz0, ox1, oz1] = el.B.outer, wt = el.B.wall, [cx0, , cx1] = el.B.court, xs = Array.from({ length: 9 }, (_, i) => cx0 + 0.55 + (cx1 - cx0 - 1.1) * i / 8);
    for (const d of [(xs[1] + xs[2]) / 2, (xs[6] + xs[7]) / 2]) { B(d - 1.3, oz1 - wt - 0.22, d + 1.3, oz1 - wt - 0.02, 2.62, 2.9, 'reed_mat'); B(d - 1.2, oz1 - wt, d + 1.2, oz1 + 0.18, 0, 0.1, 'brick_buff'); }
    { const d = (xs[3] + xs[4]) / 2; B(d - 1.3, oz0 + wt + 0.02, d + 1.3, oz0 + wt + 0.22, 2.4, 2.7, 'reed_mat'); B(d - 1.2, oz0 - 0.18, d + 1.2, oz0 + wt, 0, 0.1, 'brick_buff'); } }
}
