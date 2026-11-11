// Angkor (the Khmer capital, c. 1150) — the layout of the settlement (docs/settlements/angkor.md §2):
// Angkor Wat in the middle, facing west — its moat, the causeway with serpent balustrades, the
// western gate, the inner causeway with its libraries and basins, the temple's three levels of
// galleries and its five towers — and round the moat a village of houses on stilts among sugar
// palms, rice fields beyond. Pure data. Coordinates: metres, +x east, +z south; the temple's axis
// runs east–west along z = 0, the entrance on the west.

export const RADIUS = 460;
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
export const inBasin = (x, z) => BASINS.some((b) => inRect(b, x, z)) || inPond(x, z);
/** The market's ground and the rest houses (salas) along the road (town.js). */
export const MARKET = [-238, 10, -206, 40];
export const onRoad = (x, z) => inRect(ROAD, x, z) && !inRect(MOAT.outer, x, z, 1);

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let PONDS = null;
/** The village ponds (rectangular, as the trapeang of Khmer villages): { rect }, set among the clusters, clear of the road and the approach. */
export function ponds() {
  if (PONDS) return PONDS;
  PONDS = [];
  const rand = rng(1160);
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2 + rand() * 0.3, r = 275 + rand() * 150, x = Math.cos(a) * r, z = Math.sin(a) * r, w = 12 + rand() * 12, d = 8 + rand() * 7, rc = [x - w / 2, z - d / 2, x + w / 2, z + d / 2];
    if (Math.hypot(Math.abs(x) + w / 2, Math.abs(z) + d / 2) > RADIUS - 28 || (Math.abs(z) < 24 && x < -150) || inRect(MARKET, x, z, 14)) continue;
    PONDS.push({ rect: rc });
  }
  return PONDS;
}
export const inPond = (x, z, m = 0) => ponds().some((p) => inRect(p.rect, x, z, m));

let HOUSES = null, STORES = null;
const overlaps = (list, r, m) => list.some((h) => h.rect[0] < r[2] + m && h.rect[2] > r[0] - m && h.rect[1] < r[3] + m && h.rect[3] > r[1] - m);
/** The village's houses: { rect, front, seed, kind } in clusters round the moat road and on the paths beyond, a ribbon along the road's outer edge; none in the water or on the road. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1150), kindOf = () => { const q = rand(); return q < 0.18 ? 'big' : q < 0.3 ? 'small' : 'plain'; };
  const place = (x, z, alongX, front, kind = kindOf()) => {
    const w = kind === 'small' ? 4 + rand() * 1 : kind === 'big' ? 6 + rand() * 1.5 : 5 + rand() * 1.8, d = kind === 'small' ? 5.5 + rand() : kind === 'big' ? 9 + rand() * 2 : 7 + rand() * 2.5;
    const r = alongX ? [x - d / 2, z - w / 2, x + d / 2, z + w / 2] : [x - w / 2, z - d / 2, x + w / 2, z + d / 2];
    const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
    if (far > RADIUS - 22) return false;
    if (inRect(ROAD, x, z, 6) || (Math.abs(z) < 12 && x < -150) || inRect(MARKET, x, z, 8)) return false;
    if (ponds().some((p) => p.rect[0] < r[2] + 2 && p.rect[2] > r[0] - 2 && p.rect[1] < r[3] + 2 && p.rect[3] > r[1] - 2)) return false;
    if (overlaps(HOUSES, r, 2.6)) return false;
    HOUSES.push({ rect: r, front, seed: Math.floor(rand() * 1e6), kind });
    return true;
  };
  // the ribbon: houses side by side along the road's outer edge, their fronts to the road, 9–13 m apart (the road is the village street)
  const [r0, s0, r1, s1] = ROAD, off = 10;
  for (let z = s0 + 8; z < s1 - 8; z += 8 + rand() * 4) { place(r0 - off - rand() * 2, z, true, 'e'); place(r1 + off + rand() * 2, z + rand() * 3, true, 'w'); }
  for (let x = r0 + 20; x < r1 - 10; x += 8 + rand() * 4) { place(x, s0 - off - rand() * 2, false, 's'); place(x + rand() * 3, s1 + off + rand() * 2, false, 'n'); }
  // the clusters: an inner ring of full ones, an outer ring of lighter ones
  const clusters = [];
  for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI * 2 + rand() * 0.15, r = 262 + rand() * 80; clusters.push([Math.cos(a) * r, Math.sin(a) * r, 5 + Math.floor(rand() * 6)]); }
  for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + rand() * 0.2, r = 360 + rand() * 70; clusters.push([Math.cos(a) * r, Math.sin(a) * r, 3 + Math.floor(rand() * 4)]); }
  for (const [cx, cz, n] of clusters) for (let i = 0; i < n; i++) {
    const x = cx + (rand() - 0.5) * 36, z = cz + (rand() - 0.5) * 36, toC = Math.atan2(-z, -x), front = Math.abs(Math.cos(toC)) > Math.abs(Math.sin(toC)) ? (Math.cos(toC) > 0 ? 'e' : 'w') : (Math.sin(toC) > 0 ? 's' : 'n');
    place(x, z, rand() < 0.5, front);
  }
  return HOUSES;
}
/** Rice stores on posts beside the houses, and rest houses (salas) along the road: { at } and { rect }. */
export function stores() {
  if (STORES) return STORES;
  const rand = rng(1162);
  STORES = { granaries: [], salas: [] };
  for (const h of houses()) if (h.kind !== 'small' && rand() < 0.4) {
    const [x0, z0, x1, z1] = h.rect, at = [(x0 + x1) / 2 + (rand() < 0.5 ? -1 : 1) * ((x1 - x0) / 2 + 4.5), (z0 + z1) / 2 + (rand() < 0.5 ? -1 : 1) * ((z1 - z0) / 2 + 3.5)];
    const r = [at[0] - 2.8, at[1] - 2.4, at[0] + 2.8, at[1] + 2.4];
    if (!overlaps(houses(), r, 0.5) && !inPond(at[0], at[1], 3) && !inRect(ROAD, at[0], at[1], 4) && Math.hypot(...at) < RADIUS - 24 && !overlaps(STORES.granaries.map((g) => ({ rect: [g.at[0] - 2.8, g.at[1] - 2.4, g.at[0] + 2.8, g.at[1] + 2.4] })), r, 0.5)) STORES.granaries.push({ at, seed: Math.floor(rand() * 1e6) });
  }
  // salas: by the market, and on each side of the road's four corners
  const sal = (x, z) => { const rc = [x - 2.6, z - 2.2, x + 2.6, z + 2.2]; if (!overlaps(houses(), rc, 1) && !inRect(ROAD, x, z, 4)) STORES.salas.push({ rect: rc }); };
  sal(-250, 52); sal(-250, -30); sal(260, 60); sal(262, -70); sal(40, 222); sal(-60, -224); sal(140, -224); sal(-90, 224);
  return STORES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
