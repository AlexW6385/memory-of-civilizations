// Brasília, 1970 — the layout (docs/settlements/brasilia.md §2). The Monumental Axis runs east–west
// along z = 0: the Congress on its platform at the east end of the Esplanade's lawn, the Three Powers
// Square behind it, the ministries in two files beyond the carriageways, the Cathedral on the south
// side, the Residential Axis' avenue and one superquadra south of it. Compressed (§1c, §1d). Pure data;
// +x east, +z south; the plateau is flat (y = 0) save for the Cathedral's sunken nave.

export const RADIUS = 520;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the Congress (§1a): the platform's roof deck, the ramp from the lawn, the two chambers, the towers ──
export const DECK = 6.5;
export const PLATFORM = [-10, -110, 70, 110];
export const RAMP = { x0: -96, x1: -10, z0: -22, z1: 22 };
export const POOLS = [[-34, -76, -6, -26], [-34, 26, -6, 76]];
export const DOME = { c: [38, -72], R: 24, h: 14, r: 21.4, door: Math.PI, doorW: 3.4 };      // the Senate: the convex dome, door on the west
export const BOWL = { c: [38, 72], R: 34, rim: 11, rin: 21, wall: 20, ceil: 7, door: Math.PI, doorW: 3.4 };   // the Chamber: the bowl
export const TOWERS = { x: [32, 43], z: [[-46, -18], [18, 46]], h: 100, bridge: [87, 91] };

// ── the Esplanade (§1c) ──
export const LAWN = [-460, -118, -12, 118];                           // between the two carriageways
export const ROAD_N = [-480, -140, 90, -118], ROAD_S = [-480, 118, 90, 140];
export const MIN_Z = 148, MIN_LEN = 52, MIN_W = 16, MIN_H = 38, PITCH = 38;
export const ITAMARATY = [-92, 150, -30, 206], JUSTICE = [-92, -206, -30, -150];

// ── the Cathedral (§1b) ──
export const CATH = { c: [-175, 205], R: 35, waist: 10.5, yw: 26, top: 30, floor: -4.5, pool: 47, n: 16 };
/** The tunnel and its ramp, on the north side (x across, z from the pool's edge to the road). */
export const TUNNEL = { x0: CATH.c[0] - 6, x1: CATH.c[0] + 6, z0: CATH.c[1] - CATH.pool, zN: CATH.c[1] - CATH.R + 1.3, zR: CATH.c[1] - CATH.pool - 18 };
export const cathR = (y) => Math.sqrt(CATH.waist ** 2 + (((y - CATH.yw) / CATH.yw) * Math.sqrt(CATH.R ** 2 - CATH.waist ** 2)) ** 2);

export const MINISTRIES = (() => {
  const out = [], inC = (x0, x1) => x1 > CATH.c[0] - CATH.pool - 6 && x0 < CATH.c[0] + CATH.pool + 6;
  for (let x = -128; x > -450; x -= PITCH) {
    const x0 = x - MIN_W / 2, x1 = x + MIN_W / 2;
    out.push({ rect: [x0, -MIN_Z - MIN_LEN, x1, -MIN_Z], side: 'n', seed: out.length * 7 + 1 });
    if (!inC(x0, x1)) out.push({ rect: [x0, MIN_Z, x1, MIN_Z + MIN_LEN], side: 's', seed: out.length * 7 + 3 });
  }
  return out;
})();

// ── the Three Powers Square (§1c) ──
export const PRACA = [90, -140, 330, 140];
export const PLANALTO = [150, -182, 250, -146], STF = [165, 146, 235, 174];

// ── the Residential Axis and the superquadra (§1d): a square of 180 m (compressed from 280 m) ──
export const AVENUE = [18, 140, 44, 505];
export const SQ = [-190, 268, -10, 448];
export const RING = 12;                                                   // the ring road round it
export const BELT = 11;                                                   // the belt of trees, inside the edge
export const BLOCK_L = 56, BLOCK_D = 11.6, BLOCK_H = 21.6, PILOTIS = 3.6;
export const BLOCKS = (() => {
  const out = [], rows = [296, 334, 372, 410];
  rows.forEach((zc, r) => [[-171, -115], [-87, -31]].forEach(([x0, x1], c) => out.push({ rect: [x0, zc - BLOCK_D / 2, x1, zc + BLOCK_D / 2], seed: r * 2 + c + 5, tile: (r + c) % 2 })));
  return out;
})();
export const SHOPS = [50, 290, 62, 372];                                  // the commercial strip east of the avenue

export const inCathPit = (x, z) => Math.hypot(x - CATH.c[0], z - CATH.c[1]) < CATH.R + 1.2;
/** The cathedral's sunken ground: the nave (flat), the tunnel under the pool, the ramp rising to the road. */
export function pitDepth(x, z) {
  const dx = x - CATH.c[0], dz = z - CATH.c[1], d = Math.hypot(dx, dz);
  const F = CATH.floor - 0.12;
  let h = 0;
  if (d < CATH.R - 1.2) h = F;
  else if (d < CATH.R - 0.4) h = F * (1 - (d - (CATH.R - 1.2)) / 0.8);
  const ax = Math.abs(dx);
  if (dz < 0 && dz > -CATH.pool) { const w = 1 - smooth(5.6, 6.2, ax); if (w > 0) h = Math.min(h, F * w); }
  if (z < TUNNEL.z0 && z > TUNNEL.zR - 0.2) { const t = (z - TUNNEL.zR) / (TUNNEL.z0 - TUNNEL.zR), w = 1 - smooth(5.6, 6.2, ax); h = Math.min(h, (CATH.floor - 0.12) * t * w); }
  return h;
}
export const onRoad = (x, z, m = 0) => inRect(ROAD_N, x, z, m) || inRect(ROAD_S, x, z, m) || inRect(AVENUE, x, z, m)
  || (inRect([SQ[0] - RING, SQ[1] - RING, SQ[2] + RING, SQ[3] + RING], x, z, m) && !inRect(SQ, x, z, -m));
export const inPraca = (x, z, m = 0) => inRect(PRACA, x, z, m);
export const inBuilding = (x, z, m = 0) => inRect(PLATFORM, x, z, m) || inRect(PLANALTO, x, z, m) || inRect(STF, x, z, m) || inRect(ITAMARATY, x, z, m) || inRect(JUSTICE, x, z, m)
  || MINISTRIES.some((b) => inRect(b.rect, x, z, m)) || BLOCKS.some((b) => inRect(b.rect, x, z, m)) || inRect(SHOPS, x, z, m)
  || Math.hypot(x - CATH.c[0], z - CATH.c[1]) < CATH.pool + m || inRect(TUNNEL_BOX(), x, z, m) || inRect([RAMP.x0, RAMP.z0, RAMP.x1, RAMP.z1], x, z, m) || POOLS.some((p) => inRect(p, x, z, m));
function TUNNEL_BOX() { return [TUNNEL.x0, TUNNEL.zR, TUNNEL.x1, TUNNEL.z0]; }
