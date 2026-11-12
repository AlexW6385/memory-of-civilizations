// The ger camp of the court outside the south wall (docs/settlements/mongol-karakorum.md §3, §6): "the ordu of a rich Mo'al seems like a large town"
// [stated: Rubruck]. Gers on the ground, their doors to the south, and on their wagons; the household's carts with the chests; one ger opened and furnished.
import { CAMPS } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Positions of the gers of a camp: rows facing south, the master's to the west first [stated: Rubruck: wives' dwellings in order, the first on the west]. */
export function campGers(c, seed, n = 9) {
  const r = rng(seed), out = [];
  const cols = 3;
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), k = i % cols, x = c[0] - 22 + k * 22 + (r() - 0.5) * 4, z = c[1] - 14 + row * 17 + (r() - 0.5) * 3;
    const cart = i % 4 === 3, rad = cart ? 2.8 + r() * 0.3 : 2.9 + r() * 1.3;
    out.push({ c: [x, z], r: rad, cart, seed: Math.floor(r() * 1e6) });
  }
  return out;
}
export function campElements(c, seed, openIndex = -1, n = 9, extraOpen = []) {
  const E = [], G = campGers(c, seed, n);
  G.forEach((g, i) => {
    E.push({ t: 'ger', c: g.c, r: g.r, cart: g.cart, open: i === openIndex || (extraOpen.includes(i) && !g.cart && g.r >= 3.1), rich: i % 3 === 0, seed: g.seed, door: Math.PI / 2 });
  });
  return { E, G };
}
export const camp = (id, c, seed, open) => {
  const { E } = campElements(c, seed, open);
  return { id, style: 'mongol', origin: [0, 0], base: 0, yaw: 0, elements: E, rooms: [], bounds: [c[0] - 40, c[1] - 24, c[0] + 40, c[1] + 28] };
};
export { CAMPS };
