// Angkor (the Khmer capital, c. 1150) — the layout of the settlement (docs/settlements/angkor.md §2):
// Angkor Wat in the middle, facing west — its moat, the causeway with serpent balustrades, the
// western gate, the inner causeway with its libraries and basins, the temple's three levels of
// galleries and its five towers — and round the moat a village of houses on stilts among sugar
// palms, rice fields beyond. Pure data. Coordinates: metres, +x east, +z south; the temple's axis
// runs east–west along z = 0, the entrance on the west.

export const RADIUS = 400;
export const LEVEL = { ground: 0, moat: -1.2, moatBed: -3.2, basin: -0.8, basinBed: -2.2 };
export const CX = 25;                              // the central tower's x
/** The temple's levels: terrace rectangles, their tops; galleries on centre lines. */
export const T = {
  base: { rect: [CX - 99, -113, CX + 99, 113], y: 1.6 },
  third: { line: [CX - 93.5, -107.5, CX + 93.5, 107.5], w: 5.4, h: 4.6 },     // the third (outer) gallery, 187 × 215 m
  second: { terrace: [CX - 56, -64, CX + 56, 64], y: 7.6, line: [CX - 50, -57.5, CX + 50, 57.5], w: 4.6, h: 4.0 },
  bakan: { terrace: [CX - 32, -32, CX + 32, 32], y: 20.6, line: [CX - 28, -28, CX + 28, 28], w: 4.0, h: 3.8 },
};
export const ENCLOSURE = [-150, -160, 200, 160];
export const MOAT = { inner: [-158, -168, 208, 168], outer: [-188, -198, 238, 198] };
export const CAUSEWAY = { outer: [-196, -4.75, -150, 4.75], inner: [-150, -4.75, CX - 99, 4.75] };
export const BASINS = [[-112, -60, -82, -38], [-112, 38, -82, 60]];
export const LIBRARIES = [[-126, -36, -114, -28], [-126, 28, -114, 36]];
export const ROAD = [-198, -208, 248, 208];        // the road round the moat (its outer edge)

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const inMoat = (x, z) => inRect(MOAT.outer, x, z) && !inRect(MOAT.inner, x, z) && !inRect(CAUSEWAY.outer, x, z);
export const inBasin = (x, z) => BASINS.some((b) => inRect(b, x, z));
export const onRoad = (x, z) => inRect(ROAD, x, z) && !inRect(MOAT.outer, x, z, 1);

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/** The village's houses: { rect, front, seed } in clusters along the road and the paths west and east, none in the water or on the road. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1150);
  const clusters = [];
  for (let k = 0; k < 26; k++) {
    const a = k / 26 * Math.PI * 2 + rand() * 0.15, r = 268 + rand() * 70;
    clusters.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  for (const [cx, cz] of clusters) {
    const n = 5 + Math.floor(rand() * 6);
    for (let i = 0; i < n; i++) {
      const x = cx + (rand() - 0.5) * 34, z = cz + (rand() - 0.5) * 34, w = 5 + rand() * 2.5, d = 7 + rand() * 3;
      const alongX = rand() < 0.5, r = alongX ? [x - d / 2, z - w / 2, x + d / 2, z + w / 2] : [x - w / 2, z - d / 2, x + w / 2, z + d / 2];
      const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
      if (far > RADIUS - 22) continue;
      if (inRect(ROAD, x, z, 6) || (Math.abs(z) < 12 && x < -150)) continue;
      if (HOUSES.some((h) => h.rect[0] < r[2] + 3 && h.rect[2] > r[0] - 3 && h.rect[1] < r[3] + 3 && h.rect[3] > r[1] - 3)) continue;
      const toC = Math.atan2(-z, -x), front = Math.abs(Math.cos(toC)) > Math.abs(Math.sin(toC)) ? (Math.cos(toC) > 0 ? 'e' : 'w') : (Math.sin(toC) > 0 ? 's' : 'n');
      HOUSES.push({ rect: r, front, seed: Math.floor(rand() * 1e6) });
    }
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
