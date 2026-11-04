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
/** Above the sea: the plain rising gently inland, the cone, the crater; the shore drops into the sea. */
export function height(x, z) {
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
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let HOUSES = null;
/** The village: boat-shaped houses (long axis roughly east–west), chicken houses and garden walls among them. */
export function village() {
  if (HOUSES) return HOUSES;
  const rand = rng(1500), out = { houses: [], moa: [], gardens: [] };
  const free = (x, z, m) => !inRect(PLAZA, x, z, m + 6) && !inRect(AHU.rect, x, z, m + 16) && Math.hypot(x - RARAKU.c[0], z - RARAKU.c[1]) > RARAKU.r + m && z < coastZ(x) - 20 && Math.hypot(x, z) < RADIUS - 30
    && ![...out.houses, ...out.moa, ...out.gardens].some((o) => Math.hypot(o.c[0] - x, o.c[1] - z) < m + 7);
  for (let k = 0; k < 2500 && out.houses.length < 40; k++) {
    const x = -260 + rand() * 520, z = -60 + rand() * 180;
    if (free(x, z, 6)) out.houses.push({ c: [x, z], len: 9 + rand() * 9, w: 2.4 + rand() * 0.6, yaw: (rand() - 0.5) * 0.5, seed: Math.floor(rand() * 1e6) });
  }
  for (let k = 0; k < 1500 && out.moa.length < 18; k++) { const x = -260 + rand() * 520, z = -100 + rand() * 220; if (free(x, z, 3)) out.moa.push({ c: [x, z] }); }
  for (let k = 0; k < 1500 && out.gardens.length < 40; k++) { const x = -280 + rand() * 560, z = -200 + rand() * 330; if (free(x, z, 3)) out.gardens.push({ c: [x, z], r: 2 + rand() * 2.5 }); }
  return (HOUSES = out);
}
