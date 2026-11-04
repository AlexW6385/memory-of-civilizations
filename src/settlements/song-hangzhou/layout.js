// Southern Song Lin'an by the Qiantang (c. 1200) — the layout (docs/settlements/song-hangzhou.md
// §2): the river along the south behind its stone flood wall and the road on top of the bank;
// Yuelun Hill to the north-west with the Liuhe Pagoda on its lower slope and Kaihua Temple's halls
// on terraces behind it; to the east the Longshan quarter — the canal coming down to the river
// through its lock, streets of shophouses, tea houses on the road, warehouses by the lock. Pure data.
// Coordinates: metres, +x east, +z south (the river).

export const RADIUS = 400;
export const LEVEL = { river: -2.2, bed: -5, canal: -1.4, canalBed: -3, street: 0 };
export const WALL = { z0: 142, z1: 150 };              // the flood wall (its top a walk)
export const ROAD = { z0: 130, z1: 142 };              // the road along the river
export const HILL = { c: [-190, -150], r: 235, h: 62 };
export const PAGODA = { c: [-110, 76], y: 8 };
export const T1 = { rect: [-142, 52, -78, 102], y: 8 };   // the pagoda's terrace
export const T2 = { rect: [-146, -12, -74, 36], y: 16 };   // the temple's upper terrace
export const CANAL = { x0: 138, x1: 150, z0: -330, z1: WALL.z1 };
export const CANAL_STREETS = [[126, -330, 138, ROAD.z0], [150, -330, 162, ROAD.z0]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function hill(x, z) { const q = Math.hypot(x - HILL.c[0], z - HILL.c[1]) / HILL.r; return q >= 1 ? 0 : HILL.h * smooth(0, 1, 1 - q); }
export const inRiver = (x, z) => z > WALL.z1;
export const inCanal = (x, z) => x > CANAL.x0 && x < CANAL.x1 && z > CANAL.z0 && z < CANAL.z1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const fits = (r, m) => Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) <= RADIUS - m;

let LOTS = null;
/**
 * The town's houses: tea houses and shops on the road's north side, shophouses facing the streets
 * either side of the canal, rows along east–west lanes to the east and between the canal and the
 * temple, warehouses by the lock.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1165);
  const add = (r, front, storeys, shop) => { if (fits(r, 24) && hill((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) < 1.5) LOTS.push({ rect: r, front, storeys, shop, seed: Math.floor(rand() * 1e6) }); };
  const row = (x0, x1, z0, z1, front, shopP) => { for (let x = x0; x < x1 - 5;) { const w = 6 + rand() * 4; add([x, z0, Math.min(x + w, x1) - 0.3, z1], front, rand() < 0.6 ? 2 : 1, rand() < shopP); x += w; } };
  const col = (z0, z1, x0, x1, front, shopP) => { for (let z = z0; z < z1 - 5;) { const w = 6 + rand() * 4; add([x0, z, x1, Math.min(z + w, z1) - 0.3], front, rand() < 0.6 ? 2 : 1, rand() < shopP); z += w; } };
  // the road: houses on its north side (west of the canal: tea houses toward the pagoda)
  row(-70, CANAL_STREETS[0][0] - 2, ROAD.z0 - 14, ROAD.z0, 's', 0.8);
  row(CANAL_STREETS[1][2] + 18, RADIUS, ROAD.z0 - 14, ROAD.z0, 's', 0.8);
  // along the canal streets
  col(-330, ROAD.z0 - 18, CANAL_STREETS[0][0] - 13, CANAL_STREETS[0][0], 'e', 0.6);
  col(-330, ROAD.z0 - 18, CANAL_STREETS[1][2], CANAL_STREETS[1][2] + 13, 'w', 0.6);
  // lanes running east–west: a row on each side
  for (let z = -320; z < ROAD.z0 - 40; z += 36) {
    for (const [x0, x1] of [[-60, CANAL_STREETS[0][0] - 16], [CANAL_STREETS[1][2] + 16, RADIUS]]) {
      row(x0, x1, z, z + 13, 'n', 0.25);
      row(x0, x1, z + 13.4, z + 26, 's', 0.25);
    }
  }
  return LOTS;
}
export const WAREHOUSES = [[166, 96, 196, 124], [200, 96, 230, 124]];
let GRID = null;
export function inLot(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.rect[0] - 3) / 20); i <= Math.floor((h.rect[2] + 3) / 20); i++) for (let j = Math.floor((h.rect[1] - 3) / 20); j <= Math.floor((h.rect[3] + 3) / 20); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
