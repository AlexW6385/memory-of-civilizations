// Brasília style — the trades of the commercial strips and their order along a strip. No three.js: the sound map, the night light and
// the walks read it too. A strip of seed s has its units' trades in this order (shops.js shopsRow uses the same function).
export const TRADES = ['padaria', 'banca', 'armarinho', 'farmacia', 'lanchonete', 'mercearia', 'sapataria', 'barbearia', 'papelaria', 'acougue', 'hortifruti', 'otica'];
const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** The trades in the order of the units (a shuffle by the strip's seed, repeated if the strip has more units than trades). */
export function shopOrder(seed) {
  const rand = rngOf(seed * 53 + 9), order = TRADES.slice();
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}
/** Units of a strip (rect along z): their count, z of each unit's start, the door's centre. Unit width 4.2 m, the front plane 3.0 m inside the rect. */
export function stripUnits(rect, seed) {
  const [x0, z0, x1, z1] = rect, W = 4.2, n = Math.floor((z1 - z0 - 0.4) / W + 0.01), order = shopOrder(seed), fx = x0 + 3.0;
  return Array.from({ length: n }, (_, k) => { const z = z0 + 0.4 + k * W; return { k, trade: order[k % order.length], z, door: z + 2.05, fx, xb: x1 - 0.25, rect: [fx, z, x1, z + W] }; });
}
