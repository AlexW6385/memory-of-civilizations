// The yards of the posad (docs/settlements/muscovy.md §5.3): what stood at eye level round a log house about 1600 —
// the earth bank (zavalinka) with its plank edge and bench under the front, the mud-splashed foot of the logs, the
// woodpile under the eaves, the rain barrel; and in the yard the small log buildings: the bathhouse (bania), the
// storehouse (klet, ambar) on its stumps, the byre, the well sweep (zhuravl); the kitchen garden (ogorod) in its beds.
// Everything is boxes and a few lathes, merged by the style's bag; nothing here is per-pixel.

import { box, lathe, rod } from '../../core/geom.js';
import { hexa, pitched } from '../norse/index.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const LOG = 'log_pine';

/**
 * The eye-level dressing of a house in its front's frame: o = { bag, B (box in the frame u, v, w), Cb (collision), P2 (frame → world),
 * u0, u1, D (depth), foot, y, H, rand, open }.
 */
export function dressHouse(o) {
  const { bag, B, Cb, P2, u0, u1, D, foot, y, rand } = o;
  const add = (m, ...a) => bag.add(m, B(...a));
  // the foot of the logs splashed with mud and rotted dark by the splash of the eaves, on the sides and the back
  add('wood_dark', u0 - 0.02, u0, foot, foot + 0.42, -D, 0.14);
  add('wood_dark', u1, u1 + 0.02, foot, foot + 0.42, -D, 0.14);
  add('wood_dark', u0, u1, foot, foot + 0.42, -D - 0.02, -D);
  // the zavalinka: an earth bank along the front wall, held by a plank edge, a board bench on it; a gap at the front where the porch is not
  const zb = rand() < 0.8;
  if (zb) {
    add('sod', u0 - 0.1, u1 + 0.1, foot, y + 0.42, 0.14, 0.66);
    add('planks_grey', u0 - 0.1, u1 + 0.1, foot, y + 0.46, 0.66, 0.7);
    if (rand() < 0.65) { add('timber', u0 + 0.3, u1 - 0.3, y + 0.5, y + 0.55, 0.78, 1.22); for (const u of [u0 + 0.8, u1 - 0.8]) add('timber', u - 0.05, u + 0.05, y, y + 0.5, 0.88, 1.12); Cb(u0 + 0.3, u1 - 0.3, 0.78, 1.22, foot, y + 0.55); }
    else Cb(u0 - 0.1, u1 + 0.1, 0.14, 0.7, foot, y + 0.46);
  }
  // the woodpile along the u1 wall under the eaves, split logs on end under a board cover; a log laid to hold it
  if (rand() < 0.75) {
    const wa = -D + 0.3 + rand() * 0.6, wb = wa + 1.8 + rand() * 1.4, h = 0.9 + rand() * 0.35;
    add('bark_pine', u1 + 0.02, u1 + 0.56, foot, foot + h, wa, wb);
    add('log_pine', u1 + 0.02, u1 + 0.56, foot + h * 0.35, foot + h * 0.38, wa - 0.01, wb + 0.01);
    add('planks_grey', u1 - 0.1, u1 + 0.72, foot + h, foot + h + 0.05, wa - 0.1, wb + 0.1);
    add('timber', u1 + 0.56, u1 + 0.64, foot, foot + h + 0.05, wa - 0.05, wa + 0.05); add('timber', u1 + 0.56, u1 + 0.64, foot, foot + h + 0.05, wb - 0.05, wb + 0.05);
    Cb(u1, u1 + 0.7, wa, wb, foot, foot + h + 0.05);
  }
  // a rain barrel at the front corner under the barge board, with its hoops
  if (rand() < 0.55) { const p = P2(u1 + 0.55, foot, 0.55); bag.add('timber', lathe([[0.001, 0], [0.3, 0], [0.34, 0.4], [0.3, 0.9], [0.001, 0.9]], 10, null, p[0], p[1], p[2])); bag.add('iron', lathe([[0.335, 0.2], [0.34, 0.26], [0.001, 0.26]], 10, null, p[0], p[1], p[2])); bag.add('iron', lathe([[0.3, 0.7], [0.305, 0.76], [0.001, 0.76]], 10, null, p[0], p[1], p[2])); }
  // bundles of herbs and onion strings hung under the porch eaves of the front; a yoke and its buckets at the wall
  if (rand() < 0.5) {
    const k = rand() < 0.5 ? u0 + 0.5 : u1 - 0.5;
    for (let i = 0; i < 3; i++) { const u = k + (i - 1) * 0.28; bag.add(i % 2 ? 'cloth_green' : 'cloth_ochre', B(u - 0.05, u + 0.05, y + 2.0 - (i % 2) * 0.2, y + 2.55, 0.12, 0.22)); }
  }
}

// ── the small log buildings of the yard ─────────────────────────────────────
/** A log cage of a box (courses), as one block with the course lines as dark strips on two faces. */
function cage(bag, col, [x0, z0, x1, z1], y0, y1, m = LOG) {
  bag.add(m, box(x0, y0, z0, x1, y1, z1));
  for (let v = y0 + 0.3; v < y1 - 0.05; v += 0.3) { bag.add('wood_dark', box(x0 - 0.012, v, z0, x1 + 0.012, v + 0.025, z1)); bag.add('wood_dark', box(x0, v, z0 - 0.012, x1, v + 0.025, z1 + 0.012)); }
  col.rect([x0, z0, x1, z1], y0, y1);
}
/**
 * yardbuild: { rect: [x0, z0, x1, z1], y, kind: 'bania' | 'klet' | 'byre' | 'sweep', face: 'x0' | 'x1' | 'z0' | 'z1' (the side the door is on),
 * seed } — a small log building of the yard. The bania: a low log cage with a pent of planks, a small window, the door with a step, a stack of
 * wood and a tub; the klet: a storehouse on its four log stumps, a planked ramp to the door, a gable roof with a wide eave; the byre: a low
 * shed of logs with a lean-to roof and a hay-loft; the sweep: a well with its pole on a post and the stone counterweight.
 */
export function yardbuild(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 1), kind = el.kind ?? 'bania', face = el.face ?? 'z1';
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ex = face[0] === 'x', sg = face.endsWith('1') ? 1 : -1;
  // door side helper: a box given as (a: along the door wall, v, w: out from the door wall)
  const fc = ex ? (sg > 0 ? x1 : x0) : (sg > 0 ? z1 : z0);
  const Bd = (a0, a1, v0, v1, w0, w1) => { const p = fc + sg * w0, q = fc + sg * w1; return ex ? box(Math.min(p, q), v0, cz + a0, Math.max(p, q), v1, cz + a1) : box(cx + a0, v0, Math.min(p, q), cx + a1, v1, Math.max(p, q)); };
  const roofAlongX = !ex;      // the ridge runs from the door wall back
  if (kind === 'sweep') {
    const [px, pz] = [cx, cz];
    bag.add(LOG, box(px - 0.55, y - 0.2, pz - 0.55, px + 0.55, y + 0.62, pz + 0.55)); bag.add('wood_dark', box(px - 0.4, y + 0.6, pz - 0.4, px + 0.4, y + 0.64, pz + 0.4));
    col.rect([px - 0.6, pz - 0.6, px + 0.6, pz + 0.6], y - 0.2, y + 0.7);
    const bx = px + (ex ? 0 : 0.9), bz = pz + (ex ? 0.9 : 0);
    bag.add('timber', box(bx - 0.13, y - 0.3, bz - 0.13, bx + 0.13, y + 3.7, bz + 0.13)); col.rect([bx - 0.14, bz - 0.14, bx + 0.14, bz + 0.14], y, y + 3.7);
    const a = [px - (ex ? 0 : 2.2), y + 3.85, pz - (ex ? 2.2 : 0)], b = [px + (ex ? 0 : 2.9), y + 3.1, pz + (ex ? 2.9 : 0)];
    bag.add('timber', rod([a[0], a[1], a[2]], [b[0], b[1], b[2]], 0.06, 5));
    // the stone on the short end, the bucket hung from the long end on a pole
    bag.add('rock_boulder', box(b[0] - 0.28, b[1] - 0.45, b[2] - 0.28, b[0] + 0.28, b[1], b[2] + 0.28));
    bag.add('timber', rod([a[0], a[1], a[2]], [a[0], y + 1.1, a[2]], 0.02, 4));
    bag.add('timber', lathe([[0.001, 0], [0.16, 0], [0.18, 0.28], [0.001, 0.28]], 8, null, a[0], y + 0.9, a[2]));
    return;
  }
  const W = Math.abs(ex ? z1 - z0 : x1 - x0), Dp = Math.abs(ex ? x1 - x0 : z1 - z0);
  if (kind === 'bania') {
    const H = 2.15;
    cage(bag, col, el.rect, y - 0.25, y + H);
    // the roof: a gable of planks over the cage, wide eaves, the ridge from the door wall back
    const yr = pitched(bag, 'planks_grey', LOG, [x0, z0, x1, z1], y + H, 0.62, 0.35, roofAlongX, 0.1);
    void yr;
    bag.add('wood_painted', Bd(-0.4, 0.4, y, y + 1.55, -0.02, 0.07)); bag.add('opening', Bd(-0.3, 0.3, y + 0.9, y + 1.5, 0.07, 0.075));      // the low door (dark by the steam)
    bag.add('timber', Bd(-0.55, 0.55, y - 0.2, y + 0.12, 0.07, 0.75));                                                                          // the step
    bag.add('opening', Bd(0.7, 1.05, y + 1.2, y + 1.55, -0.001, 0.02));                                                                        // the little window
    // wood by the wall, a tub with its dipper
    const o = Math.min(W / 2 - 0.2, 0.95);
    bag.add('bark_pine', Bd(-o - 0.9, -o - 0.1, y - 0.2, y + 0.7, 0.05, 0.55)); bag.add('timber', lathe([[0.001, 0], [0.26, 0], [0.3, 0.5], [0.001, 0.5]], 10, null, ...(ex ? [fc + sg * 0.8, y - 0.2, cz + o + 0.5] : [cx + o + 0.5, y - 0.2, fc + sg * 0.8])));
    return;
  }
  if (kind === 'klet') {
    // on four stumps (so that rats and damp keep out), a storehouse of logs with a wide gable roof
    const H = 2.3, s = 0.55;
    for (const [a, b] of [[x0 + 0.2, z0 + 0.2], [x1 - 0.2, z0 + 0.2], [x0 + 0.2, z1 - 0.2], [x1 - 0.2, z1 - 0.2]]) bag.add('log_pine', lathe([[0.001, 0], [0.22, 0], [0.2, s + 0.1], [0.001, s + 0.1]], 8, null, a, y - 0.3, b));
    cage(bag, col, [x0, z0, x1, z1], y + s, y + s + H);
    pitched(bag, 'planks_grey', LOG, [x0, z0, x1, z1], y + s + H, 0.7, 0.55, roofAlongX, 0.1);
    bag.add('wood_painted', Bd(-0.45, 0.45, y + s, y + s + 1.7, -0.02, 0.07)); bag.add('iron', Bd(-0.45, 0.45, y + s + 0.8, y + s + 0.86, 0.07, 0.09)); bag.add('iron', Bd(-0.04, 0.04, y + s + 0.55, y + s + 0.75, 0.09, 0.14));
    // the ramp of planks up to the door
    bag.add('planks_grey', hexa(((o) => { const L = 1.9; const P = (a, v, w) => (ex ? [fc + sg * w, v, cz + a] : [cx + a, v, fc + sg * w]); return [P(-0.55, y - 0.1, 0.05), P(0.55, y - 0.1, 0.05), P(0.55, y - 0.1, L), P(-0.55, y - 0.1, L), P(-0.55, y + s + 0.02, 0.05), P(0.55, y + s + 0.02, 0.05), P(0.55, y - 0.05, L), P(-0.55, y - 0.05, L)]; })()));
    return;
  }
  if (kind === 'byre') {
    // a low shed: logs to the eaves, a lean-to roof of planks sloping to the back, the hay-loft's gap under the high edge; the door a half-door
    const Hf = 2.0, Hb = 1.55;
    cage(bag, col, el.rect, y - 0.25, y + Hb);
    const P = (a, v, w) => (ex ? [fc + sg * w, v, cz + a] : [cx + a, v, fc + sg * w]);
    const hw = W / 2 + 0.3;
    bag.add('planks_grey', hexa([P(-hw, y + Hf - 0.1, -0.35), P(hw, y + Hf - 0.1, -0.35), P(hw, y + Hb - 0.1, Dp + 0.35), P(-hw, y + Hb - 0.1, Dp + 0.35), P(-hw, y + Hf + 0.03, -0.35), P(hw, y + Hf + 0.03, -0.35), P(hw, y + Hb + 0.03, Dp + 0.35), P(-hw, y + Hb + 0.03, Dp + 0.35)]));
    bag.add(LOG, Bd(-W / 2, W / 2, y + Hb, y + Hf - 0.08, 0, 0.2));
    bag.add('thatch', Bd(-W / 2 + 0.2, W / 2 - 0.2, y + Hb - 0.05, y + Hf - 0.12, 0.2, 0.5));     // hay pushed out at the loft
    bag.add('wood_painted', Bd(-0.45, 0.45, y, y + 1.35, -0.02, 0.07)); bag.add('opening', Bd(-0.4, 0.4, y + 1.0, y + 1.35, 0.07, 0.075));
    return;
  }
}

/**
 * garden: { rect: [x0, z0, x1, z1], y, seed } — a kitchen garden (ogorod): raised beds edged with boards, in rows of cabbage, onions,
 * turnips and beets (flat green and red leaves), a row of hemp, and a scarecrow now and then.
 */
export function garden(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 1), alongX = x1 - x0 >= z1 - z0;
  const n = Math.max(1, Math.floor((alongX ? z1 - z0 : x1 - x0) / 1.25)), kinds = ['cloth_green', 'cloth_green', 'cloth_ochre', 'cloth_red'];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, b0 = (alongX ? z0 : x0) + t * (alongX ? z1 - z0 : x1 - x0) - 0.4, b1 = b0 + 0.8, k = kinds[Math.floor(rand() * kinds.length)], h = k === 'cloth_green' ? 0.34 : 0.22;
    const R = alongX ? [x0 + 0.2, b0, x1 - 0.2, b1] : [b0, z0 + 0.2, b1, z1 - 0.2];
    bag.add('wood_dark', box(R[0], el.foot ?? y - 0.05, R[1], R[2], y + 0.14, R[3]));
    bag.add(k, box(R[0] + (alongX ? 0.1 : 0.22), y + 0.14, R[1] + (alongX ? 0.22 : 0.1), R[2] - (alongX ? 0.1 : 0.22), y + 0.14 + h, R[3] - (alongX ? 0.22 : 0.1)));
  }
  if (rand() < 0.4) { const p = [(x0 + x1) / 2, (z0 + z1) / 2]; bag.add('timber', box(p[0] - 0.03, y, p[1] - 0.03, p[0] + 0.03, y + 1.7, p[1] + 0.03)); bag.add('timber', box(p[0] - 0.55, y + 1.35, p[1] - 0.025, p[0] + 0.55, y + 1.4, p[1] + 0.025)); bag.add('cloth_brown', box(p[0] - 0.4, y + 0.85, p[1] - 0.04, p[0] + 0.4, y + 1.35, p[1] + 0.04)); bag.add('linen', lathe([[0.001, 0], [0.12, 0.05], [0.13, 0.2], [0.001, 0.28]], 8, null, p[0], y + 1.7, p[1])); }
}
