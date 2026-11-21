// Nalanda about 640 — where the niches of a stepped temple stand and which of them burn a lamp (docs/settlements/nalanda.md §23). Pure functions of the element's own
// numbers, repeating the loops of the style's `temple` (src/styles/nalanda/index.js) so the wear (wear.js) and the night's light (nightlight.js) meet the stucco exactly.
// No counters, no Math.random: the lamps lit are a hash of the niche's own place.
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const SW = 3.5;                                              // the stair's half-width (the style's `sw`)
/** Every niche of a temple { c, y, half, tiers, tierH }: { k tier, p [x, z] on the wall, o outward, tg tangent, y0 the tier's foot, by the niche's sill, ah its height }. */
export function niches(el) {
  if (el.panels || el.niches === false) return [];
  const [cx, cz] = el.c, y = el.y ?? 0, half = el.half, n = el.tiers, tH = el.tierH, ter = tH * 1.04, out = [], big = tH >= 4.5;
  for (let k = 0; k < n; k++) {
    const h = half - ter * k, y0 = y + k * tH;
    for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const o = [dx, dz], tg = dz ? [1, 0] : [0, 1], m = Math.max(2, Math.floor((2 * h - 3) / 3.4)), span = 2 * h - 3;
      const ah = Math.min(2.2, tH - 0.45 - (big ? 0.3 : 0.12) - 1.15 - 0.1);
      for (let i = 0; i < m; i++) {
        const t = -h + 1.5 + span * (i + 0.5) / m;
        if (dx === 1 && Math.abs(t) < SW + 0.7) continue;
        out.push({ k, p: [cx + o[0] * (h - 0.03) + tg[0] * t, cz + o[1] * (h - 0.03) + tg[1] * t], o, tg, y0, by: y0 + 1.15, ah });
      }
    }
  }
  return out;
}
/** Does the lamp of this niche burn (oil was dear: about a third of the lowest tier's, a quarter of the others')? */
export const burns = (q) => hashAt(q.p[0], q.p[1], 61 + q.k) < (q.k === 0 ? 0.34 : 0.24);
/** The treads of the temple's stairs: { x0, x1 (the tread's span along x), top, z (the stair's middle) } for each flight (the east face, the stair rising west). */
export function treads(el) {
  const [cx, cz] = el.c, y = el.y ?? 0, half = el.half, n = el.tiers, tH = el.tierH, ter = tH * 1.04, T = [];
  const hs = Array.from({ length: n }, (_, k) => half - ter * k);
  for (let k = 0; k < n; k++) {
    const y0 = y + k * tH, y1 = y0 + tH, x1 = cx + hs[k], xs = k === 0 ? x1 + ter : cx + hs[k - 1], x0 = x1 + 0.12, ns = Math.max(1, Math.round(ter / 0.25)), riser = tH / ns;
    const nn = Math.max(1, Math.round((y1 - y0) / riser));
    for (let i = 0; i < nn; i++) T.push({ k, i, n: nn, x0: xs - (xs - x0) * (i + 1) / nn, x1: xs - (xs - x0) * i / nn, top: y0 + (y1 - y0) * (i + 1) / nn, z: cz });
  }
  return T;
}
export { SW };
