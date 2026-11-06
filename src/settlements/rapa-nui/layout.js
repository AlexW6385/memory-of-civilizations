// Rapa Nui about 1500 — the layout (docs/settlements/rapa-nui.md §2): Ahu Tongariki on the
// south-east coast with its fifteen moai facing inland, the sea behind; the plaza before it; the
// cone of Rano Raraku to the north-west with its crater lake, the quarry on its outer slope, moai
// half-cut and moai standing buried to the shoulders below; houses of the village on the plain
// between, with their chicken houses and round garden walls. Rano Raraku is brought nearer (it
// stands about 1 km inland). Pure data. +x east, +z south.

export const RADIUS = 320;
export const SEA = -2.5;                                   // the sea (the planet's sea level: the disc's base stands 2.5 m above it)
export const RIM = -14;                                    // the sea floor at the disc's rim, meeting the open sea
export const COAST = 150;                                  // the shore runs along z ≈ 150 (the sea beyond, to the south)
export const AHU = { rect: [-50, 100, 50, 106], h: 3.6 };
export const PLAZA = [-60, 60, 60, 99];
export const RARAKU = { c: [-120, -120], r: 85, h: 70, crater: 38, floor: 28, lake: 30 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const coastZ = (x) => COAST + 18 * Math.sin(x / 47) + 9 * Math.sin(x / 19 + 1);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * The bays of the quarry on the cone's outer south-east face: in each a statue lies half-cut on its
 * back, head up the slope, in a niche cut down into the rock to the plane it lies on (tilt).
 * { at (its foot), y, h, facing (yaw toward its head), tilt, hw (the niche's half-width), len }.
 */
export const BAYS = [];
{
  const rand = rng(77), [rx, rz] = RARAKU.c;
  for (let k = 0; k < 8; k++) {
    const a = Math.PI * (0.06 + 0.075 * k + 0.02 * rand()), d = RARAKU.r * (0.66 + 0.06 * rand()), x = rx + Math.cos(a) * d, z = rz + Math.sin(a) * d;
    const h = 7 + rand() * 4.5, tilt = 0.32 + 0.1 * rand();
    BAYS.push({ at: [x, z], y: 0, h, facing: Math.atan2(rx - x, rz - z), tilt, hw: 0.19 * h + 0.55 + 2.2, len: h + 3 });
  }
  for (const b of BAYS) b.y = baseHeight(b.at[0], b.at[1]);
}
/** The height with the quarry's niches cut in. */
export function height(x, z) {
  let h = baseHeight(x, z);
  for (const b of BAYS) {
    const dx = x - b.at[0], dz = z - b.at[1], s = Math.sin(b.facing), c = Math.cos(b.facing);
    const u = dx * c - dz * s, v = dx * s + dz * c;                 // across, and along toward the head
    if (Math.abs(u) > b.hw + 2 || v < -3 || v > b.len + 2) continue;
    const plane = b.y + Math.max(0, v) * Math.tan(b.tilt) - 0.21 * b.h;
    const m = smooth(b.hw + 1.5, b.hw - 0.5, Math.abs(u)) * smooth(b.len + 2, b.len, v) * smooth(-3, -1, v);
    if (plane < h) h = h - (h - plane) * m;
  }
  return h;
}
/** Above the sea: the plain rising gently inland, the cone, the crater; the shore drops into the sea. */
function baseHeight(x, z) {
  const r = Math.hypot(x - RARAKU.c[0], z - RARAKU.c[1]);
  let h = 2 * smooth(100, -200, z);
  if (r < RARAKU.r) {
    const cone = RARAKU.h * smooth(RARAKU.r, RARAKU.crater + 6, r);
    h = Math.max(h, r < RARAKU.crater + 6 ? RARAKU.floor + (RARAKU.h - RARAKU.floor) * smooth(RARAKU.crater - 10, RARAKU.crater + 6, r) : cone);
  }
  const cz = coastZ(x), sea = Math.max(smooth(cz - 6, cz + 12, z), smooth(RADIUS - 95, RADIUS - 25, Math.hypot(x, z)));
  return h * (1 - sea) + RIM * sea;
}
export const inLake = (x, z) => Math.hypot(x - RARAKU.c[0], z - RARAKU.c[1]) < RARAKU.crater - 8;
export const inSea = (x, z) => height(x, z) < SEA - 0.2 && !inLake(x, z);
/**
 * The statue road from the foot of the quarry to the plaza (docs/settlements/rapa-nui.md §4b): a
 * track about 4.5 m wide, its bed a little dished; a statue walking down it, another fallen by it.
 */
export const ROAD = [[-98, -62], [-66, -36], [-40, -10], [-14, 30], [-4, 58]];
export const ROAD_W = 4.5;
/** The distance from (x, z) to the road's centre line. */
export function roadDist(x, z) {
  let d = Infinity;
  for (let i = 0; i < ROAD.length - 1; i++) {
    const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    d = Math.min(d, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return d;
}
let HOUSES = null;
/** The village: boat-shaped houses (long axis roughly east–west), chicken houses and garden walls among them. */
export function village() {
  if (HOUSES) return HOUSES;
  const rand = rng(1500), out = { houses: [], moa: [], gardens: [] };
  const free = (x, z, m) => !inRect(PLAZA, x, z, m + 6) && !inRect(AHU.rect, x, z, m + 16) && Math.hypot(x - RARAKU.c[0], z - RARAKU.c[1]) > RARAKU.r + m && z < coastZ(x) - 20 && Math.hypot(x, z) < RADIUS - 30 && roadDist(x, z) > m + ROAD_W / 2 + 4
    && ![...out.houses, ...out.moa, ...out.gardens].some((o) => Math.hypot(o.c[0] - x, o.c[1] - z) < m + 7);
  for (let k = 0; k < 2500 && out.houses.length < 40; k++) {
    const x = -260 + rand() * 520, z = -60 + rand() * 180;
    if (free(x, z, 6)) out.houses.push({ c: [x, z], len: 10 + rand() * 7, w: 1.9 + rand() * 0.5, h: 2.2 + rand() * 0.5, yaw: (rand() - 0.5) * 0.5, seed: Math.floor(rand() * 1e6) });
  }
  for (let k = 0; k < 1500 && out.moa.length < 18; k++) { const x = -260 + rand() * 520, z = -100 + rand() * 220; if (free(x, z, 3)) out.moa.push({ c: [x, z] }); }
  for (let k = 0; k < 1500 && out.gardens.length < 40; k++) { const x = -280 + rand() * 560, z = -200 + rand() * 330; if (free(x, z, 3)) out.gardens.push({ c: [x, z], r: 2 + rand() * 2.5 }); }
  return (HOUSES = out);
}
