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
  // the ponds inside the enclosure (§19): the grid of roads, ponds and mounds that served the temple
  for (const rc of ENC_PONDS) PONDS.push({ rect: rc });
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2 + rand() * 0.3, r = 275 + rand() * 150, x = Math.cos(a) * r, z = Math.sin(a) * r, w = 12 + rand() * 12, d = 8 + rand() * 7, rc = [x - w / 2, z - d / 2, x + w / 2, z + d / 2];
    if (Math.hypot(Math.abs(x) + w / 2, Math.abs(z) + d / 2) > RADIUS - 28 || (Math.abs(z) < 24 && x < -150) || inRect(MARKET, x, z, 14)) continue;
    PONDS.push({ rect: rc });
  }
  return PONDS;
}
/** The paths of the enclosure (laterite, 3 m wide) and its ponds (§19): the quarters of the temple's servants lie along them. */
export const ENC_PATHS = [[-139, -138.5, 197, -135.5], [-139, 135.5, 197, 138.5], [162, -135.5, 165, -8], [162, 8, 165, 135.5], [-139.5, -135.5, -136.5, -8], [-139.5, 8, -136.5, 135.5], [165, -1.5, 200, 1.5]];
export const ENC_PONDS = [[-100, -128, -80, -118], [50, -128, 76, -118], [150, -126, 160, -116], [-60, 118, -38, 128], [90, 118, 114, 129], [140, 116, 156, 126], [168, -60, 182, -48], [168, 48, 182, 60]];
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
  // the quarters of the temple's servants inside the enclosure: along the laterite paths, fronts to the path
  const inEnc = (x, z, r) => { const m = 5; return x - (r[2] - r[0]) / 2 > ENCLOSURE[0] + m && x + (r[2] - r[0]) / 2 < ENCLOSURE[2] - m && z - (r[3] - r[1]) / 2 > ENCLOSURE[1] + m && z + (r[3] - r[1]) / 2 < ENCLOSURE[3] - m; };
  const encPlace = (x, z, alongX, front, kind) => {
    const w = kind === 'big' ? 6 + rand() * 1.5 : 5 + rand() * 1.8, d = kind === 'big' ? 9 + rand() * 1.5 : 7 + rand() * 2, r = alongX ? [x - d / 2, z - w / 2, x + d / 2, z + w / 2] : [x - w / 2, z - d / 2, x + w / 2, z + d / 2];
    if (!inEnc(x, z, r) || inRect(T.base.rect, x, z, 12) || BASINS.some((b) => inRect(b, x, z, 7)) || LIBRARIES.some((b) => inRect(b, x, z, 8)) || inRect(CAUSEWAY.inner, x, z, 9)) return;
    if (ENC_PATHS.some((p) => p[0] < r[2] + 0.3 && p[2] > r[0] - 0.3 && p[1] < r[3] + 0.3 && p[3] > r[1] - 0.3)) return;
    if (ponds().some((p) => p.rect[0] < r[2] + 2 && p.rect[2] > r[0] - 2 && p.rect[1] < r[3] + 2 && p.rect[3] > r[1] - 2) || overlaps(HOUSES, r, 2.6)) return;
    HOUSES.push({ rect: r, front, seed: Math.floor(rand() * 1e6), kind, enc: true });
  };
  const encKind = () => (rand() < 0.35 ? 'big' : 'plain');
  for (let x = -128; x < 190; x += 13 + rand() * 7) {
    encPlace(x, -148.5, false, 's', encKind()); encPlace(x, 148.5, false, 'n', encKind());
    if (rand() < 0.5) encPlace(x + 5, -128.5, false, 'n', encKind());
    if (rand() < 0.5) encPlace(x + 5, 128.5, false, 's', encKind());
  }
  for (let z = -128; z < 128; z += 14 + rand() * 6) { if (Math.abs(z) < 14) continue; encPlace(154.5, z, true, 'e', encKind()); encPlace(172.5, z, true, 'w', encKind()); }
  // the clusters: an inner ring of full ones, an outer ring of lighter ones
  const clusters = [];
  for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI * 2 + rand() * 0.15, r = 262 + rand() * 80; clusters.push([Math.cos(a) * r, Math.sin(a) * r, 5 + Math.floor(rand() * 6)]); }
  for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + rand() * 0.2, r = 360 + rand() * 70; clusters.push([Math.cos(a) * r, Math.sin(a) * r, 3 + Math.floor(rand() * 4)]); }
  for (const [cx, cz, n] of clusters) for (let i = 0; i < n; i++) {
    const x = cx + (rand() - 0.5) * 36, z = cz + (rand() - 0.5) * 36, toC = Math.atan2(-z, -x), front = Math.abs(Math.cos(toC)) > Math.abs(Math.sin(toC)) ? (Math.cos(toC) > 0 ? 'e' : 'w') : (Math.sin(toC) > 0 ? 's' : 'n');
    place(x, z, rand() < 0.5, front);
  }
  // the front designs (styles/khmer/village.js variantOf): along each side of a road the houses take them in turn, so that no two neighbours share a front
  { const n = {}, V = ['plain', 'porch', 'shop', 'tile']; for (const h of HOUSES) { n[h.front] = (n[h.front] ?? (h.front === 'e' ? 0 : h.front === 'w' ? 1 : h.front === 's' ? 2 : 3)) + 3; if (h.kind !== 'small') h.variant = V[n[h.front] % 4]; } }
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

let SHOPS = null;
const TRADES = ['potter', 'smith', 'sugar', 'mill'];
/**
 * The open workshops of the village (§20): { rect, front, trade, seed } on the ground outside the road, fronts to it — one in about every
 * 38 m of its length, the trades in turn; none among the houses, in a pond, or at the approach and the market.
 */
export function shops() {
  if (SHOPS) return SHOPS;
  SHOPS = [];
  const rand = rng(1163), [r0, s0, r1, s1] = ROAD;
  const put = (x, z, front) => {
    const alongX = front === 'e' || front === 'w', w = 6.4, d = 5.2, rect = alongX ? [x - d / 2, z - w / 2, x + d / 2, z + w / 2] : [x - w / 2, z - d / 2, x + w / 2, z + d / 2];
    if (inRect(MARKET, x, z, 16) || (Math.abs(z) < 16 && x < -150) || overlaps(houses(), rect, 3.2) || overlaps(SHOPS, rect, 6) || overlaps(Object.values(stores().granaries).map((g) => ({ rect: [g.at[0] - 2.8, g.at[1] - 2.4, g.at[0] + 2.8, g.at[1] + 2.4] })), rect, 1.5) || ponds().some((p) => p.rect[0] < rect[2] + 3 && p.rect[2] > rect[0] - 3 && p.rect[1] < rect[3] + 3 && p.rect[3] > rect[1] - 3)) return;
    if (Math.hypot(Math.abs(x) + 4, Math.abs(z) + 4) > RADIUS - 26) return;
    SHOPS.push({ rect, front, trade: TRADES[SHOPS.length % 4], seed: Math.floor(rand() * 1e6) });
  };
  for (let z = s0 + 20; z < s1 - 20; z += 34 + rand() * 10) { for (const dx of [-17, -22, -27]) { const n = SHOPS.length; put(r0 + dx, z, 'e'); if (SHOPS.length > n) break; } for (const dx of [17, 22, 27]) { const n = SHOPS.length; put(r1 + dx, z + 6, 'w'); if (SHOPS.length > n) break; } }
  for (let x = r0 + 30; x < r1 - 20; x += 36 + rand() * 10) { for (const dz of [-17, -22, -27]) { const n = SHOPS.length; put(x, s0 + dz, 's'); if (SHOPS.length > n) break; } for (const dz of [17, 22, 27]) { const n = SHOPS.length; put(x + 8, s1 + dz, 'n'); if (SHOPS.length > n) break; } }
  return SHOPS;
}
export const inShop = (x, z, m = 0) => shops().some((h) => inRect(h.rect, x, z, m));

let LOTUS = null;
/** Patches of lotus on the moat's water along both banks (§19), clear of the causeway and the lanes of the boats: { rect }. */
export function moatLotus() {
  if (LOTUS) return LOTUS;
  LOTUS = [];
  const rand = rng(1164), [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
  const strips = [[a0 + 0.8, b0 + 0.8, a1 - 0.8, b0 + 5.4], [a0 + 0.8, d0 - 5.4, a1 - 0.8, d0 - 0.8], [a0 + 0.8, d1 + 0.8, a1 - 0.8, d1 + 5.4], [a0 + 0.8, b1 - 5.4, a1 - 0.8, b1 - 0.8], [a0 + 0.8, b0 + 5.4, a0 + 5.4, d0 - 5.4], [a0 + 0.8, d1 + 5.4, a0 + 5.4, b1 - 5.4], [a1 - 5.4, b0 + 5.4, a1 - 0.8, d0 - 5.4], [a1 - 5.4, d1 + 5.4, a1 - 0.8, b1 - 5.4], [c0 - 5.4, d0 + 5.4, c0 - 0.8, -6.5], [c0 - 5.4, 6.5, c0 - 0.8, d1 - 5.4], [c1 + 0.8, d0 + 5.4, c1 + 5.4, d1 - 5.4]];
  for (const [x0, z0, x1, z1] of strips) {
    const alongX = x1 - x0 > z1 - z0;
    for (let s = (alongX ? x0 : z0) + 4 + rand() * 6; s < (alongX ? x1 : z1) - 14; s += 22 + rand() * 30) {
      const len = 8 + rand() * 9, rc = alongX ? [s, z0, s + len, z1] : [x0, s, x1, s + len];
      if (rc[0] < CAUSEWAY.outer[2] + 2 && rc[2] > CAUSEWAY.outer[0] - 2 && rc[1] < 8 && rc[3] > -8) continue;
      LOTUS.push({ rect: rc });
    }
  }
  // beside the causeway's flanks, close to the visitor at the arrival: patches in the water just off the naga rails
  for (const sg of [-1, 1]) for (const [xa, xb] of [[-186, -174], [-171, -160]]) LOTUS.push({ rect: [xa, Math.min(sg * 6.2, sg * 12.4), xb, Math.max(sg * 6.2, sg * 12.4)] });
  return LOTUS;
}
/** The reaches of the moat the boats ply (middle lines, 3 m wide), the corners crossing so that they turn: for movers.js and the moored boats. */
export function moatLanes() {
  const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner, xm = (a0 + c0) / 2, xe = (c1 + a1) / 2, zn = (b0 + d0) / 2, zs = (d1 + b1) / 2;
  return [[a0 + 8, zn - 1.5, a1 - 8, zn + 1.5], [a0 + 8, zs - 1.5, a1 - 8, zs + 1.5], [xm - 1.5, zn - 4, xm + 1.5, -9], [xm - 1.5, 9, xm + 1.5, zs + 4], [xe - 1.5, zn - 4, xe + 1.5, zs + 4]];
}
