// Machu Picchu (c. 1450–1530) — the layout of the settlement (docs/settlements/machu-picchu.md §2):
// the town on its saddle between the peaks of Machu Picchu (south, +z) and Huayna Picchu (north, -z), the
// Main Plaza in the middle, the Sacred sector and the Temple of the Sun on the west, the houses in
// kanchas on both sides, terraces stepping down every flank, the canyon of the Urubamba below and
// the mountains beyond. Pure data. Coordinates: metres, +x east, +z south... the ridge runs along z.

export const RADIUS = 330;
export const SITE = { a: 95, b: 175 };                     // the saddle's top: an ellipse (x half-width, z half-length)
export const TERRACE = { w: 3, h: 2.6, n: 15 };           // terraces round it: 3 m deep, 2.6 m high, 15 of them
export const PLAZA = [-18, -8, 22, 52];
export const PEAKS = [{ c: [0, -208], r: 88, h: 175 }, { c: [-14, 208], r: 88, h: 205 }];   // Huayna Picchu (north), Machu Picchu mountain (south)
export const HILL = { c: [-45, 82], r: 16, h: 11 };       // the Intihuatana's hill
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

/** Distance (m) outside the saddle's ellipse, measured as the growth s of the half-axes that brings (x, z) on to it (negative inside). */
export function outside(x, z) {
  const f = (s) => (x / (SITE.a + s)) ** 2 + (z / (SITE.b + s)) ** 2 - 1;
  if (f(0) <= 0) { let lo = -SITE.a + 1, hi = 0; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return hi; }
  let lo = 0, hi = 600; for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return hi;
}
/** The terrace level (0, 1, …) at distance d outside the ellipse, or -1 past the terraces. */
export const terraceAt = (d) => (d < 0 ? 0 : d < TERRACE.w * TERRACE.n ? Math.floor(d / TERRACE.w) + 1 : -1);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/** The houses in their kanchas: { rect, front, seed } in the west and east sectors. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1450);
  for (const [X0, X1, front] of [[-84, -24, 'e'], [28, 86, 'w']]) {
    for (let z = -150; z < 160; z += 15) for (let x = X0; x < X1; x += 13) {
      const w = 6 + rand() * 3, d = 9 + rand() * 3, r = [x, z, x + w, z + d];
      const cx = x + w / 2, cz = z + d / 2;
      if (outside(cx, cz) > -6 || inRect(PLAZA, cx, cz, 6)) continue;
      if (Math.hypot(cx - HILL.c[0], cz - HILL.c[1]) < HILL.r + 6) continue;
      if (inRect([-62, -40, -10, 60], cx, cz)) continue;                      // the Temple of the Sun and the Sacred Plaza
      if (rand() < 0.2) continue;
      HOUSES.push({ rect: r, front: rand() < 0.7 ? front : (rand() < 0.5 ? 'n' : 's'), seed: Math.floor(rand() * 1e6) });
    }
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
