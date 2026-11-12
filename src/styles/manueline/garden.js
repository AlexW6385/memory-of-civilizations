// Gardens of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §9): the walled yards (quintais) left between houses with an
// orange tree or two, a vine pergola, a well and a bench; the orange tree itself (the cloister's court, the monastery gardens).
import { box, lathe, rod } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { rng, pick } from './util.js';

/** orange_tree { at: [x, z], y, h (3–4.5), seed } — a short trunk, a round dark crown, a scatter of fruit. */
export function orangeTree(el, { bag, col }) {
  const r = rng(el.seed || 1), [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 3.4 + r() * 0.8, cr = h * 0.42;
  bag.add('bark_dark', lathe([[0.17, 0], [0.12, 0.6], [0.1, h * 0.5], [0.001, h * 0.55]], 6, null, x, y, z));
  bag.add('fresco_green', lathe([[0.001, h * 0.38], [cr * 0.8, h * 0.45], [cr, h * 0.62], [cr * 0.85, h * 0.82], [cr * 0.4, h * 0.97], [0.001, h]], 9, null, x, y, z));
  for (let i = 0; i < 9; i++) { const a = r() * 6.28, rr = cr * (0.55 + 0.4 * r()), yy = h * (0.5 + 0.3 * r()); bag.add('glaze_yellow', lathe([[0.001, 0], [0.07, 0.07], [0.001, 0.14]], 5, null, x + Math.cos(a) * rr, y + yy, z + Math.sin(a) * rr)); }
  col.circle(x, z, 0.25, y, y + h);
}
/** manu_yard { rect, front, y, seed } — a walled yard with its gate on the front. */
export function manuYard(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, F = frame(el.rect, el.front ?? 's'), { L, D } = F, simple = !!el.simple;
  const R = (u0, v0, u1, v1, y0, y1, m, solid = true) => { const q = F.R(u0, v0, u1, v1); bag.add(m, box(q[0], y + y0, q[1], q[2], y + y1, q[3])); if (solid) col.rect(q, y + y0, y + y1); };
  const wm = pick(rand, ['limewash_white', 'plaster_white', 'stucco_cream', 'plaster_ochre']), t = 0.4, gu = L * (0.3 + rand() * 0.4), gw = 1.5;
  R(0, 0, gu - gw / 2, t, -0.5, 2.5, wm); R(gu + gw / 2, 0, L, t, -0.5, 2.5, wm); R(gu - gw / 2, 0, gu + gw / 2, t, 2.5, 2.9, wm, false);
  R(0, 0, t, D, -0.5, 2.3, wm); R(L - t, 0, L, D, -0.5, 2.3, wm); R(0, D - t, L, D, -0.5, 2.6, wm);
  R(-0.05, -0.05, gu - gw / 2, t + 0.05, 2.5, 2.62, 'roof_tile'); R(gu + gw / 2, -0.05, L + 0.05, t + 0.05, 2.5, 2.62, 'roof_tile');
  R(gu - gw / 2 - 0.15, -0.1, gu - gw / 2, t + 0.1, 0, 2.9, 'limestone'); R(gu + gw / 2, -0.1, gu + gw / 2 + 0.15, t + 0.1, 0, 2.9, 'limestone');
  if (simple) return;
  const nT = 2 + Math.floor(rand() * 3);
  for (let k = 0; k < nT; k++) { const p = F.P(1.2 + rand() * (L - 2.4), 3 + rand() * Math.max(1, D - 6)); orangeTree({ at: p, y, seed: Math.floor(rand() * 1e6) }, ctx); }
  // a pergola of posts and beams, a vine on it
  if (rand() < 0.7 && D > 8) { const u0 = 1, u1 = Math.min(L - 1, 5.5), v0 = D - 5.5, v1 = D - 1; for (const [a, b] of [[u0, v0], [u1, v0], [u0, v1], [u1, v1]]) R(a - 0.06, b - 0.06, a + 0.06, b + 0.06, 0, 2.3, 'timber', false); for (let v = v0; v <= v1; v += 0.8) R(u0, v - 0.04, u1, v + 0.04, 2.3, 2.4, 'timber', false); R(u0, v0, u1, v1, 2.4, 2.55, 'flax_leaf', false); }
  // a well with its curb, a bench along the wall
  const w = F.P(L - 1.6, D * 0.5); bag.add('limestone', lathe([[0.7, 0], [0.7, 0.8], [0.5, 0.8], [0.5, 0.0]], 10, null, w[0], y, w[1])); col.circle(w[0], w[1], 0.7, y, y + 0.8);
  R(1.0, D * 0.4, 2.8, D * 0.4 + 0.4, 0, 0.45, 'timber', false);
}
