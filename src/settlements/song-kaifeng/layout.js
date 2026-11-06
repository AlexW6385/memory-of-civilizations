// Northern Song Bianjing (c. 1120) — the layout (docs/settlements/song-kaifeng.md §2): the Bian
// River east–west with the Rainbow Bridge, the street running north and south from it, the Kaibao
// monastery and the Iron Pagoda to the north-east, the east wall and its water gate on the west, the
// town along the river and the streets. Pure data. +x east, +z south.

export const RADIUS = 400;
export const RIVER = { z0: 60, z1: 92, bed: -4, water: -1.6 };
// the Rainbow Bridge: 20 m between its stone abutments, 8.6 m wide, the arch rising 4 m from springings 1 m above the water
export const BRIDGE = { at: [0, 76], span: 20, width: 8.6, spring: -0.6, crown: 4.0, y0: 0.06 };
/** The bridge deck's height at z (the line rainbow_bridge lays its planks on). */
export function bridgeDeck(z) {
  const S = BRIDGE.span / 2, E = S + 0.6, yc = BRIDGE.spring + BRIDGE.crown + 0.79;
  return BRIDGE.y0 + 0.06 + (yc - BRIDGE.y0 - 0.06) * (1 - Math.min(1, Math.abs(z - BRIDGE.at[1]) / E) ** 1.3);
}
export const GATE = { z: -80, rect: [-309, -96, -291, -64] };   // the city gate's platform over the road
export const MONASTERY = [80, -260, 240, -110];
export const PAGODA = [160, -190];
export const WALL_X = -300;
// the open country east of the suburb: wheat fields, the road and the towpath running on into them
export const FIELDS_X = 262;
// the stone-faced banks by the bridge (canal_wall); beyond them the banks are of earth and the towpath runs on the north one
export const STONE_BANK = 90;
export const STREETS = [[-7, -RADIUS, 7, RIVER.z0], [-7, RIVER.z1, 7, RADIUS], [-RADIUS, RIVER.z0 - 14, RADIUS, RIVER.z0], [-RADIUS, RIVER.z1, RADIUS, RIVER.z1 + 14], [-RADIUS, -84, RADIUS, -76], [-RADIUS, 196, RADIUS, 204], [-156, -RADIUS, -148, RIVER.z0 - 14], [146, RIVER.z1 + 14, 154, RADIUS]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRiver = (x, z) => z > RIVER.z0 && z < RIVER.z1 && Math.hypot(x, z) < RADIUS - 26;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses fronting the streets: rows on both sides of each street, deeper lots between, east of the wall. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1120);
  const fits = (r) => Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) <= RADIUS - 24;
  const ok = (r) => fits(r) && r[0] > WALL_X + 8 && r[2] < FIELDS_X && !inRect(MONASTERY, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 10) && !STREETS.some((s) => s[0] < r[2] && s[2] > r[0] && s[1] < r[3] && s[3] > r[1]) && !(r[1] < RIVER.z1 + 2 && r[3] > RIVER.z0 - 2);
  for (const s of STREETS) {
    const horiz = s[2] - s[0] > s[3] - s[1];
    if (horiz) for (const side of [-1, 1]) for (let x = s[0]; x < s[2];) { const w = 6 + rand() * 4, d = 11 + rand() * 4, r = side < 0 ? [x, s[1] - d, x + w - 0.3, s[1] - 0.2] : [x, s[3] + 0.2, x + w - 0.3, s[3] + d]; if (ok(r)) LOTS.push({ rect: r, front: side < 0 ? 's' : 'n', storeys: rand() < 0.5 ? 2 : 1, shop: rand() < 0.7, seed: Math.floor(rand() * 1e6) }); x += w; }
    else for (const side of [-1, 1]) for (let z = s[1]; z < s[3];) { const w = 6 + rand() * 4, d = 11 + rand() * 4, r = side < 0 ? [s[0] - d, z, s[0] - 0.2, z + w - 0.3] : [s[2] + 0.2, z, s[2] + d, z + w - 0.3]; if (ok(r)) LOTS.push({ rect: r, front: side < 0 ? 'e' : 'w', storeys: rand() < 0.5 ? 2 : 1, shop: rand() < 0.7, seed: Math.floor(rand() * 1e6) }); z += w; }
  }
  return LOTS;
}
let GRID = null;
export function inLot(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.rect[0] - 3) / 20); i <= Math.floor((h.rect[2] + 3) / 20); i++) for (let j = Math.floor((h.rect[1] - 3) / 20); j <= Math.floor((h.rect[3] + 3) / 20); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
