// Khajuraho about 1050 — where the style puts a village building's front and door (styles/nagara/village.js `building`): pure functions of an element's rect, front and seed.
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** The element's frame: its length L along the front, its depth D, and P(u, v) → world [x, z] (u along the front from its left, v from the front face inward). */
export function frame(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n';
  return { L: along ? x1 - x0 : z1 - z0, D: along ? z1 - z0 : x1 - x0, P: (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]) };
}
/** The u of a home's door (the style's own draw: the second number of the seed's stream). */
export function homeDoorU(l) {
  const { L } = frame(l), r = rng((l.seed || 1) + 5); r();
  return Math.min(L - 1, Math.max(1, Math.floor(L / 2) + (r() < 0.5 ? -0.8 : 0.8)));
}
/** Shops and cattle sheds are open along their whole front; every other building has one door. */
export const isOpenFront = (l) => l.kind === 'shop' || l.kind === 'shed';
