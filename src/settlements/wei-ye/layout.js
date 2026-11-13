// Three Kingdoms Ye, c. AD 215 — the layout (docs/settlements/wei-ye.md §2). The real city (about 3 km × 2.1 km) is compressed by about
// a sixth: the walled rectangle with the central east–west avenue and the Zhongyang road on the axis, the palace with the Wenchang Hall
// north of the avenue, the Tongque Garden with the Xuanwu pond and the three terraces (Ice Well, Bronze Sparrow, Golden Tiger) in the
// north-west, the Qili ward and the offices, the walled wards and the market south of the avenue, the Zhang River north of the wall. Pure data.
// Coordinates: metres, +x east, +z south, y up.

export const RADIUS = 330;
export const CITY_WALL = { th: 10, h: 10 };
export const WALL = { w: -245, e: 245, n: -175, s: 175 };       // the wall's centre lines
export const AVENUE = [-240, 11, 240, 39];                      // the central avenue (E–W)
export const AVENUE_Z = 25;
export const ROAD = [-10, 39, 10, 175];                         // the Zhongyang road
export const GATES_S = [-130, 0, 125], GATES_N = [-60, 90];
export const GATE_W = 30;                                       // the gap in the wall for a gate of three passages

// the palace: the Wenchang Hall on its terrace, the south gate on the axis
export const PALACE = [-75, -165, 75, -8];
export const PALACE_WALL = { th: 3, h: 5 };
export const WENCHANG = { cx: 0, z1: -62, bays: 9, bayW: 6.6, depth: 3, depthW: 6, base: 0.9, h: 7 };
WENCHANG.w = WENCHANG.bays * WENCHANG.bayW; WENCHANG.z0 = WENCHANG.z1 - WENCHANG.depth * WENCHANG.depthW;
export const W_TERRACE = { r: [-50, -102, 50, -50], top: 3 };
export const W_RAMP = { x: [-5, 5], z0: -50, z1: -37.5 };
WENCHANG.floor = W_TERRACE.top + WENCHANG.base;

// the three terraces, on the west side of the garden; each with its stair on the east face
export const BATTER = 2.4;
export const SPARROW = { r: [-225, -118, -166, -58], top: 12, dais: [-215, -108, -176, -68], daisTop: 15, name: 'sparrow' };
export const ICE = { r: [-222, -172, -169, -132], top: 12, name: 'ice' };
export const TIGER = { r: [-222, -44, -169, -6], top: 12, name: 'tiger' };
export const TERRACES = [ICE, SPARROW, TIGER];
export const zOf = (t) => (t.r[1] + t.r[3]) / 2;
export const faceX = (t) => t.r[2] - BATTER;                    // the crown's east edge
export const STAIR_LEN = 24;
export const stairRect = (t) => [faceX(t), zOf(t) - 4.5, faceX(t) + STAIR_LEN, zOf(t) + 4.5];
export const DAIS_STAIR = [-176, -92.5, -169, -83.5];               // from the lower crown up to the dais
export const TOWER = { c: [-196, -88], half: 8, floor: 15 };
export const SKYWAYS = [{ a: [-195, -132.5], b: [-195, -117.5] }, { a: [-195, -58.5], b: [-195, -43.5] }];

// the garden pond (the Xuanwu pond), the Zhang River
export const POND = [-135, -160, -85, -135], POND_Y = -0.6;
export const riverZ = (x) => -250 + 10 * Math.sin(x / 55);
export const RIVER = { w: 30, y: -0.9, bed: -2.4 };
export const inRiver = (x, z, m = 0) => Math.abs(z - riverZ(x)) < RIVER.w / 2 + m;

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export const inPond = (x, z, m = 0) => inRect(POND, x, z, m);
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  const dr = Math.abs(z - riverZ(x)) - RIVER.w / 2;                       // < 0 in the river
  if (dr < 5) h = Math.min(h, RIVER.bed * smooth(5, -2, dr));
  const dp = Math.min(x - POND[0], POND[2] - x, z - POND[1], POND[3] - z);
  if (dp > -1) h = Math.min(h, -1.4 * smooth(-1, 1.5, dp));
  return h * (1 - smooth(RADIUS - 30, RADIUS, r));
}

// the household of the Tongque Garden (docs/settlements/wei-ye.md §6.3): the lodgings and workrooms of the people who kept it — the guards' barracks, the
// ice-keepers' store, the steward's office, the garden's kitchen, the musicians' hall, the weavers' row, the smith, the servants' row — in the garden's open
// ground between the terraces and the palace wall, on the paths; door sides on the paths (front 's': the door on the south side)
export const LODGES = [
  { rect: [-164, -58, -151, -43], front: 's', kind: 'row', room: 'barracks', seed: 2151, say: 'guards\' barracks' },
  { rect: [-150, -58, -137, -43], front: 's', kind: 'court', room: 'ice', seed: 2152, say: 'ice-keepers\' store' },
  { rect: [-136, -63, -122, -43], front: 's', kind: 'tower', room: 'scribe', seed: 2153, say: 'steward\'s office' },
  { rect: [-106, -58, -92, -43], front: 's', kind: 'court', room: 'kitchen', seed: 2154, say: 'garden kitchen' },
  { rect: [-91, -58, -78, -43], front: 's', kind: 'row', room: 'smithy', seed: 2155, say: 'smithy' },
  { rect: [-106, -128, -92, -113], front: 's', kind: 'court', room: 'music', seed: 2156, say: 'musicians\' hall' },
  { rect: [-165, -130, -153, -119], front: 's', kind: 'row', room: 'loom', seed: 2157, say: 'weavers\' row' },
];
export const inLodge = (x, z, m = 0) => LODGES.some((l) => inRect(l.rect, x, z, m));
// the markets and wards (walled units of 104 × 104 m, two lanes each) and the Qili ward
export const MARKET = [128, 50, 236, 158];
export const MARKET_WALL = { th: 2.4, h: 5 };
export const WARD = 104, WARD_WALL = 1.6;
export const WARDS = [[-232, 48, -128, 152], [-122, 48, -18, 152], [18, 48, 122, 152], [96, -160, 200, -56]];
const ROWS = [[0, 22, 'row', 's'], [27.1, 49.1, 'row', 'n'], [49.1, 71.1, 'row', 's'], [74.6, 98.6, 'row', 'n']];
export const LANE_V = [[22.6, 27.1], [71.1, 74.6]];
let LOTS = null;
/** The lots: { rect, front, kind ('court' | 'row' | 'tower' | 'office'), seed, open, ward }. Rows back to back, the doors on the lanes. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(215);
  let furnished = 0;
  WARDS.forEach((w, wi) => {
    const [x0, z0, x1] = w;
    for (let ri = 0; ri < ROWS.length; ri++) {
      const [v0, v1, , front] = ROWS[ri];
      let x = x0 + WARD_WALL + 1;
      while (x < x1 - WARD_WALL - 6) {
        const wd = 10 + Math.floor(rand() * 5) * 1.5, xe = Math.min(x + wd, x1 - WARD_WALL - 1);
        const rect = [x, z0 + WARD_WALL + v0, xe, z0 + WARD_WALL + v1 - 0.4], r = rand();
        const kind = ri === 0 || ri === 3 ? (r < 0.62 ? 'court' : r < 0.82 ? 'tower' : 'row') : (r < 0.45 ? 'court' : r < 0.6 ? 'tower' : 'row');
        const lot = { rect, front, kind, seed: Math.floor(rand() * 1e6), open: false, ward: wi };
        if (xe - x > 9 && furnished++ % 2 === 0) lot.open = true;
        LOTS.push(lot);
        x = xe + 0.6;
      }
    }
  });
  // the offices (shu) of the Wei court along the north side of the avenue
  for (let x = -150; x < 235; x += 27) {
    if (x + 17 > PALACE[0] - 6 && x < PALACE[2] + 6) continue;
    const rect = [x, -13, x + 17, 9];
    if (rand() < 0.1) continue;
    LOTS.push({ rect, front: 's', kind: 'office', seed: Math.floor(rand() * 1e6), open: false, ward: -1 });
  }
  return LOTS;
}
// the farmsteads outside the gates: [x0, z0, x1, z1, front] (the lot's door side), houses with their yards
export const FARMS = [[-60, 186, -46, 206, 'n'], [32, 186, 46, 206, 'n'], [-100, 186, -86, 206, 'n'], [160, 186, 174, 206, 'n'], [258, 34, 272, 56, 'n'], [258, -24, 272, -6, 's'], [-272, 34, -258, 56, 'n'], [-272, -24, -258, -6, 's'], [-30, -216, -16, -196, 's'], [120, -216, 134, -196, 's']];
export const inFarm = (x, z, m = 0) => FARMS.some((f) => x >= f[0] - m - 1 && x <= f[2] + m + 16 && z >= f[1] - m - 6 && z <= f[3] + m + 6);
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** Rectangles of the streets, lanes and open ways (free of houses). */
export function streets() {
  const out = [];
  for (const [x0, z0, x1] of WARDS) for (const [v0, v1] of LANE_V) out.push([x0, z0 + WARD_WALL + v0, x1, z0 + WARD_WALL + v1]);
  out.push(AVENUE, ROAD, [-10, -8, 10, 11]);                           // the avenue, the Zhongyang road, the way to the palace gate
  out.push([-240, 154, 240, 170], [-240, -170, 240, -158]);            // the ring roads inside the south and north walls
  out.push([-240, -170, -228, 170], [228, -170, 240, 170]);            // and the west and east
  out.push([-20, 39, 20, 48], [-130, 39, 130, 48]);                    // the street along the wards' north
  out.push([-17, 48, -10, 152], [10, 48, 18, 152], [-128, 48, -122, 152], [122, 48, 128, 152]);
  return out.filter((r) => r[2] - r[0] > 2 && r[3] - r[1] > 2);
}
/** The city wall's segments (centre lines), with the gates' gaps made by the callers: [{ a, b }]. Clipped by the disc. */
export function cityWalls() {
  const L = RADIUS - 28, out = [];
  const seg = (a, b, fixed, axis) => {
    const f = Math.abs(fixed), lim = Math.sqrt(Math.max(0, L * L - f * f)), lo = Math.max(a, -lim), hi = Math.min(b, lim);
    if (hi - lo > 8) out.push(axis === 'x' ? { a: [lo, fixed], b: [hi, fixed] } : { a: [fixed, lo], b: [fixed, hi] });
  };
  seg(WALL.w, WALL.e, WALL.s, 'x'); seg(WALL.w, WALL.e, WALL.n, 'x'); seg(WALL.n, WALL.s, WALL.w, 'z'); seg(WALL.n, WALL.s, WALL.e, 'z');
  return out;
}
export const inCity = (x, z) => x > WALL.w - 5 && x < WALL.e + 5 && z > WALL.n - 5 && z < WALL.s + 5;
