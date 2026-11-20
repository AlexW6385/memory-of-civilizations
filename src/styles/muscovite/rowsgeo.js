// The plan of the trading rows (rows() in ./index.js, the settlement's openwalk.js and lavki.js read it): pure numbers, no three.js.
// Blocks run north–south between 3.2 m cross passages; across the width three ranges: a range opening on the square (side −1, west), a
// double range back to back (west and east fronts), a range at the back (west front). A shop is 3 m of front (the block's length
// divided into whole shops), its door in the middle of the front, its party walls 0.34 m thick.
export const DOOR_OPEN = { w: 2.4, h: 1.8 };      // an opened shop's door (arched above h); the closed shops keep w 2.1, h 1.85
export const SLAB = 0.4, END = 0.45, PART = 0.34;

/** The rows' frame: ranges [ra, rb, sides], blocks [{ b, za, zb, n, step }], the shop height H. */
export function rowsGeo([x0, z0, x1, z1]) {
  const W = x1 - x0, k = W / 20;
  const ranges = [[x0, x0 + 4 * k, [-1]], [x0 + 7 * k, x0 + 14 * k, [-1, 1]], [x0 + 17 * k, x1, [-1]]];
  const nb = 6, pass = 3.2, bl = (z1 - z0 - (nb - 1) * pass) / nb, H = 3.3, sw = 3.0, blocks = [];
  for (let b = 0; b < nb; b++) { const za = z0 + b * (bl + pass), n = Math.round(bl / sw); blocks.push({ b, za, zb: za + bl, n, step: bl / n }); }
  return { ranges, blocks, H, nb, bl };
}
/** The key of one shop: block.range.side.q (side w = front toward −x, e = toward +x). */
export const shopKey = (b, r, sg, q) => `${b}.${r}.${sg < 0 ? 'w' : 'e'}.${q}`;
/**
 * Every shop of the rows: { key, b, r, sg, q, fx (the front plane's x), ra, rb, z0, z1 (the cell along z), zc (the door's middle), depth (clear depth from the slab's inner face to the
 * back wall's), x0 (the slab's inner face), x1 (the back wall's inner face) }.
 */
export function shopList(rect) {
  const G = rowsGeo(rect), out = [];
  for (const B of G.blocks) G.ranges.forEach(([ra, rb, sides], r) => {
    for (const sg of sides) {
      const fx = sg < 0 ? ra : rb, x0 = fx - sg * SLAB, x1 = sides.length === 2 ? (ra + rb) / 2 + sg * 0.22 : rb - END;
      for (let q = 0; q < B.n; q++) out.push({ key: shopKey(B.b, r, sg, q), b: B.b, r, sg, q, fx, ra, rb, z0: B.za + q * B.step, z1: B.za + (q + 1) * B.step, zc: B.za + (q + 0.5) * B.step, x0, x1, depth: Math.abs(x1 - x0), step: B.step });
    }
  });
  return out;
}
