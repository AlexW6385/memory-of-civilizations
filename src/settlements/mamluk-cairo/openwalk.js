// The routes into the opened places along the visitor's walk (docs/settlements/mamluk-cairo.md §18.1): from the lane or the street, over the step and through the
// 3.4 m opening of each enterable shop (styles/mamluk/shops.js cairo_shop: the opening at the middle of the front, the step 0.7 m out, the front wall 0.5 m thick) to
// the middle of its front room. walk-check follows each; they are the landmark plan's `walks`.
import { shops, SHOP } from './layout.js';

/** The way in to a shop of rect r with its front on side f: [[x, z] in the street, on the threshold, in the room]. */
export function shopRoute(r, f, d = 1.9) {
  const [x0, z0, x1, z1] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const P = (out) => (f === 'e' ? [x1 + out, cz] : f === 'w' ? [x0 - out, cz] : f === 's' ? [cx, z1 + out] : [cx, z0 - out]);
  return [P(2.4), P(0.3), P(-d)];
}
/** One route into each enterable shop (the merchant's shop at the Qasaba's bend and the shops of the market streets and the houses' rows). */
export function shopWalks() {
  const out = [shopRoute(SHOP, 'e'), ...shops().open.map((l) => shopRoute(l.rect, l.front || 's'))];
  for (const w of out) w.y0 = 0;
  return out;
}
