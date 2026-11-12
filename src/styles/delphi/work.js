// Work at the sanctuary (docs/settlements/delphi.md §4.6): the mason's yard where a city's dedication is being dressed and lettered — rough blocks, a stele on
// its trestles with the first lines of the inscription cut, the tool bench, the sheerlegs with the block and tackle, the heap of chips, the water jar, the
// shade of cloth — and the pen of hurdles where the animals for the sacrifice wait. Elements of the style `delphi`; each a few merged parts.
import { box, lathe, rod } from '../../core/geom.js';
import { merge } from '../greek/columns.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** mason_yard: { at: [x, z], y, yaw, seed } — local u right, v forward (the open side); about 4.4 × 3.4 m. */
function masonYard(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 3), c = Math.cos(yaw), s = Math.sin(yaw);
  const P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const put = (m, g) => { g.rotateY(yaw); g.translate(x, y, z); bag.add(m, g); };
  // the blocks: one rough, one dressed on the rollers, one half-squared; the chips about them
  put('limestone', box(-2.0, 0, -1.4, -0.9, 0.62, -0.5));
  for (const r of [-0.9, -0.55, -0.2]) put('timber', box(0.55 + r * 0.0 - 0.06, 0.0, -1.5 + (r + 0.9) * 1.0 - 0.06, 0.55 + 0.06, 0.12, -1.5 + (r + 0.9) * 1.0 + 0.06));
  put('timber', box(0.0, 0.0, -1.6, 0.04, 0.1, -0.3)); put('timber', box(1.2, 0.0, -1.6, 1.24, 0.1, -0.3));
  put('marble', box(0.1, 0.1, -1.5, 1.2, 0.72, -0.45));
  put('limestone', box(-0.5, 0, 0.35, 0.7, 0.45, 1.05));
  const chips = []; for (let k = 0; k < 14; k++) { const u = -1.2 + rand() * 2.6, v = -1.7 + rand() * 2.9, w = 0.04 + rand() * 0.08; chips.push(box(u - w, 0, v - w, u + w, w * 1.4, v + w)); }
  put('marble', merge(chips));
  // the stele on its trestles: a slab of Pentelic stone, the first lines cut (dark strokes), the top still rough
  put('wood_dark', box(-2.15, 0, 0.5, -2.05, 0.7, 1.3)); put('wood_dark', box(-1.0, 0, 0.5, -0.9, 0.7, 1.3));
  put('marble', box(-2.3, 0.7, 0.62, -0.78, 0.82, 1.18));
  const ln = []; for (let k = 0; k < 5; k++) ln.push(box(-2.2, 0.82, 0.7 + k * 0.095, -1.2 - rand() * 0.6, 0.826, 0.725 + k * 0.095));
  put('granite_black', merge(ln));
  // the tool bench: chisels, a mallet, a pointer, a line and plumb bob
  put('wood_dark', box(1.7, 0.78, 0.4, 2.7, 0.84, 0.9)); for (const [a, b] of [[1.75, 0.45], [2.6, 0.45], [1.75, 0.8], [2.6, 0.8]]) put('wood_dark', box(a, 0, b, a + 0.07, 0.78, b + 0.07));
  const tl = []; for (let k = 0; k < 5; k++) tl.push(rod([1.85 + k * 0.17, 0.84, 0.55], [1.9 + k * 0.17, 0.87, 0.78], 0.012, 4)); put('iron', merge(tl));
  put('wood_ochre', box(2.35, 0.84, 0.55, 2.5, 0.92, 0.7));
  // the water jar and the dipper, the basket of wedges
  put('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.22, 0.25], [0.2, 0.48], [0.11, 0.6], [0.14, 0.66], [0.001, 0.62]], 10, null, 2.3, 0, -1.1));
  put('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.3], [0.001, 0.3]], 8, null, 1.7, 0, -1.3));
  // the sheerlegs: two poles and a backstay, a block and tackle, the rope to the block on its sledge (the hoist for the capital)
  const hx = -2.9, apex = [hx, 3.3, -0.3];
  const hs = [rod([hx - 0.7, 0, -1.2], apex, 0.07, 5), rod([hx + 0.0, 0, -1.4], apex, 0.07, 5), rod([hx - 0.6, 0, 1.6], apex, 0.06, 5)];
  for (const g of hs) put('timber', g);
  put('iron', box(hx - 0.1, 2.5, -0.4, hx + 0.1, 3.3, -0.2));
  put('rope_fibre', rod([hx, 2.5, -0.3], [-1.45, 0.62, -0.95], 0.014, 4));
  col.rect(aabb4(P, -2.4, -1.5, 0.7, 1.3), y, y + 0.9);
  // the shade: a cloth on four poles over the stele's end
  for (const [u, v] of [[-2.4, 0.4], [-0.6, 0.4], [-2.4, 1.4], [-0.6, 1.4]]) put('timber', box(u - 0.04, 0, v - 0.04, u + 0.04, 2.3, v + 0.04));
  put('cloth_ochre', box(-2.55, 2.3, 0.25, -0.45, 2.34, 1.55));
}
const aabb4 = (P, u0, v0, u1, v1) => { const q = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]; return [Math.min(...q.map((a) => a[0])), Math.min(...q.map((a) => a[1])), Math.max(...q.map((a) => a[0])), Math.max(...q.map((a) => a[1]))]; };

/** pen: { rect: [x0, z0, x1, z1], y, seed } — a pen of wattle hurdles on stakes with a gap on the south side, a trough of stone, straw underfoot. */
function pen(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 4), H = 1.0, gap = [(x0 + x1) / 2 - 0.7, (x0 + x1) / 2 + 0.7];
  const hurdle = (a, b, fixed, alongX) => {
    const n = Math.max(2, Math.round((b - a) / 0.9));
    for (let i = 0; i <= n; i++) { const u = a + (b - a) * i / n; bag.add('timber', alongX ? box(u - 0.03, y, fixed - 0.03, u + 0.03, y + H + 0.15, fixed + 0.03) : box(fixed - 0.03, y, u - 0.03, fixed + 0.03, y + H + 0.15, u + 0.03)); }
    for (const h of [0.22, 0.5, 0.78]) bag.add('wicker', alongX ? box(a, y + h, fixed - 0.04, b, y + h + 0.1, fixed + 0.04) : box(fixed - 0.04, y + h, a, fixed + 0.04, y + h + 0.1, b));
  };
  hurdle(x0, x1, z0, true); hurdle(z0, z1, x0, false); hurdle(z0, z1, x1, false); hurdle(x0, gap[0], z1, true); hurdle(gap[1], x1, z1, true);
  col.segment([x0, z0], [x1, z0], 0.15, y, y + H); col.segment([x0, z0], [x0, z1], 0.15, y, y + H); col.segment([x1, z0], [x1, z1], 0.15, y, y + H);
  col.segment([x0, z1], [gap[0], z1], 0.15, y, y + H); col.segment([gap[1], z1], [x1, z1], 0.15, y, y + H);
  const st = []; for (let k = 0; k < 16; k++) { const u = x0 + 0.3 + rand() * (x1 - x0 - 0.6), v = z0 + 0.3 + rand() * (z1 - z0 - 0.6); st.push(box(u - 0.25, y, v - 0.04, u + 0.25, y + 0.025, v + 0.04)); }
  bag.add('thatch', merge(st));
  bag.add('limestone', box(x0 + 0.4, y, z0 + 0.35, x0 + 1.5, y + 0.4, z0 + 0.75)); bag.add('water', box(x0 + 0.46, y + 0.34, z0 + 0.4, x0 + 1.44, y + 0.36, z0 + 0.7));
}
export const WORK = { mason_yard: masonYard, pen };
