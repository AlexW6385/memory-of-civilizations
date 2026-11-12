// Delphi — the dedications crowding the terrace and the Sacred Way (docs/settlements/delphi.md §4.6): statues on inscribed bases, steles,
// tripods, groups, maidens, trophies of armour, benches, planting of true height; placed by a seeded scatter that keeps clear of the
// ways, the buildings and one another. Pure data (elements); positions derive from layout.js.
import { WAY, TT, TT_Y, TREASURIES, STOA, TEMPLE, ALTAR, SPHINX, SERPENT, STAIR, pathAt, wayPoints, wayY, height, inRect, FC } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
/** The arrival (src/planet/arrivals.js), the mason's yard, the pen of hurdles by the Chians' altar. */
export const ARRIVAL = [62, 16];
export const YARD = { at: [37, 20.2], yaw: Math.PI };
export const PEN = [54.2, -11.6, 58.2, -8.6], PEN_C = [(PEN[0] + PEN[2]) / 2, (PEN[1] + PEN[3]) / 2];
const ROUTE = [[88, 26], [66, 8], [54, 6], [40, 4], [31.5, -1], [26, -1], [20.5, -1], [12, -1], [4, -3.5], [-6, -3.5], [-12, -1], [-15.2, -1], [-17.5, -1], [-20, 2], [-21, -1.5]];
const nearRoute = (x, z, m) => ROUTE.some((a, i) => { const b = ROUTE[i + 1]; if (!b) return false; const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) < m; });
const toward = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

/** The kinds of a scatter: [weight, builder(x, y, z, yaw, rand)]. */
function make(kind, x, z, y, yaw, R, E) {
  const sd = Math.floor(R() * 1e6);
  switch (kind) {
    case 'man': E.push({ t: 'ex_voto', at: [x, z], y, yaw, kind: 'man', h: 1.8 + R() * 0.5 }); return 1.4;
    case 'group': E.push({ t: 'ex_voto', at: [x, z], y, yaw, kind: 'group', h: 1.9 }); return 2.6;
    case 'stele': E.push({ t: 'votive', kind: 'stele', at: [x, z], y, yaw, h: 1.6 + R() * 1.2, w: 0.55 + R() * 0.2 }); return 1.2;
    case 'tripod': E.push({ t: 'votive', kind: 'tripod', at: [x, z], y, yaw }); return 1.2;
    case 'kore': E.push({ t: 'kore', at: [x, z], y: y + 1.1, yaw, h: 1.9, mat: 'marble_smooth' }); E.push({ t: 'block', rect: [x - 0.5, z - 0.5, x + 0.5, z + 0.5], y0: y - 0.2, y1: y + 1.1, mat: 'limestone' }); return 1.0;
    case 'bay': E.push({ t: 'tree', kind: 'bay', at: [x, z], y, seed: sd }); return 1.8;
    case 'cypress': E.push({ t: 'tree', kind: 'cypress', at: [x, z], y, h: 8 + R() * 5, seed: sd }); return 1.2;
    case 'olive': E.push({ t: 'tree', kind: 'olive', at: [x, z], y, seed: sd }); return 2.2;
    case 'plane': E.push({ t: 'tree', kind: 'plane', at: [x, z], y, seed: sd }); return 4;
    case 'holm': E.push({ t: 'tree', kind: 'holm', at: [x, z], y, seed: sd }); return 3;
    case 'bench': E.push({ t: 'stone_bench', at: [x, z], y, yaw: yaw + Math.PI / 2 * (R() < 0.5 ? 0 : 0), len: 2.2 }); return 1.3;
    case 'trophy': E.push({ t: 'tropaion', at: [x, z], y, yaw }); return 1.0;
    case 'table': E.push({ t: 'offering_table', at: [x, z], y, yaw, seed: sd }); return 1.1;
    case 'basin': E.push({ t: 'basin', at: [x, z], y }); return 0.8;
    default: return 0;
  }
}
function pick(R, table) { let t = R() * table.reduce((a, [w]) => a + w, 0); for (const [w, k] of table) { if ((t -= w) <= 0) return k; } return table[0][1]; }

/** The terrace east of the temple, along its north and south strips: a crowd of offerings. */
export function terraceDedications(E) {
  const R = rng(2217), occ = [[41.5, -7.5, 3], [31.5, 12.5, 3], [36, -12, 3.2], [38, 8, 3.2], [58, 7, 2.5], [64, -9, 2.5], [54, 13, 2], [32, -16, 2], [-10, -17, 2], [8, -17.5, 2], [26, -17, 2], [47, -16.5, 2], [ALTAR.c[0], ALTAR.c[1], 6.2]];
  const table = [[0.3, 'man'], [0.12, 'stele'], [0.12, 'tripod'], [0.1, 'group'], [0.07, 'kore'], [0.07, 'bay'], [0.06, 'cypress'], [0.07, 'bench'], [0.04, 'trophy'], [0.03, 'table'], [0.02, 'plane']];
  // the places kept: the arrival's lawn of paving (nothing within 5 m of the visitor's first view), the mason's yard on the south edge, the pen of the sacrifice's beasts by the altar
  occ.push([ARRIVAL[0], ARRIVAL[1], 3.2], [YARD.at[0], YARD.at[1], 3.4], [PEN_C[0], PEN_C[1], 2.6]);
  const [x0, z0, x1, z1] = TT;
  for (let i = 0; i < 1000 && occ.length < 150; i++) {
    const x = x0 + 3 + R() * (x1 - x0 - 6), z = z0 + 2 + R() * (z1 - z0 - 4);
    if (inRect([-32.5, -13.8, 33.5, 11.8], x, z) || pathAt(x, z, WAY)[0] < 3.4 || nearRoute(x, z, 3.0) || inRect([STAIR[0] - 2, 20, STAIR[2] + 2, 27], x, z)) continue;
    if (x > 40 && x < 92 && z > 12 && inRect([x0, 14, x1, z1], x, z) && pathAt(x, z, WAY)[0] < 4.6) continue;
    const kind = pick(R, table), need = { plane: 6, bay: 2.5, cypress: 2.5, olive: 3.5, group: 3.2 }[kind] ?? 2.4;
    if (occ.some(([ox, oz, r]) => Math.hypot(ox - x, oz - z) < r + need)) continue;
    const yaw = toward(x, z, 60 + (R() - 0.5) * 30, 14 + (R() - 0.5) * 8);
    make(kind, x, z, TT_Y + 0.03, kind === 'bench' || kind === 'table' ? Math.PI : yaw, R, E);
    occ.push([x, z, 1.4]);
  }
  E.push({ t: 'mason_yard', at: YARD.at, y: TT_Y + 0.03, yaw: YARD.yaw, seed: 7 }, { t: 'pen', rect: PEN, y: TT_Y + 0.03, seed: 5 });
  // the temple's door: the lustral basins before the steps, and the stoa's flank of benches on the south side
  E.push({ t: 'basin', at: [TEMPLE.X + 3.3, TEMPLE.cz - 4.4], y: TT_Y + 0.03 }, { t: 'basin', at: [TEMPLE.X + 3.3, TEMPLE.cz + 4.4], y: TT_Y + 0.03 });
  E.push({ t: 'brazier', at: [ALTAR.c[0] - 7.6, ALTAR.c[1] - 3.4], y: TT_Y + 0.03 }, { t: 'brazier', at: [ALTAR.c[0] - 7.6, ALTAR.c[1] + 3.4], y: TT_Y + 0.03 });
  E.push({ t: 'offering_table', at: [ALTAR.c[0] + 6.6, ALTAR.c[1] - 2.2], y: TT_Y + 0.03, yaw: Math.PI / 2, seed: 4 }, { t: 'offering_table', at: [ALTAR.c[0] + 6.6, ALTAR.c[1] + 2.2], y: TT_Y + 0.03, yaw: Math.PI / 2, seed: 9 });
  E.push({ t: 'ash', c: [ALTAR.c[0] - 4.2, ALTAR.c[1]], r: 3.4, y: TT_Y + 0.03, seed: 2 });
  E.push({ t: 'flags', rect: [x0 + 0.6, z0 + 0.6, x1 - 0.6, z1 - 0.6], y: TT_Y + 0.03, seed: 8, skip: (x, z) => inRect([-31.5, -12.8, 32.5, 10.8], x, z) || pathAt(x, z, WAY)[0] < 2.3 || inRect(STAIR, x, z, 1) });
}

/** Along the legs of the Sacred Way, on either side of the paving, the dedications of the cities and the planting between the treasuries. */
export function wayDedications(E) {
  const R = rng(9141), pts = wayPoints(WAY, wayY, 6.4), table = [[0.27, 'man'], [0.09, 'group'], [0.18, 'stele'], [0.1, 'tripod'], [0.04, 'kore'], [0.06, 'bay'], [0.1, 'cypress'], [0.05, 'olive'], [0.09, 'bench'], [0.03, 'trophy'], [0.02, 'basin']];
  const placed = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, , z] = pts[i], a = pts[i - 1], b = pts[i + 1], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, nx = dz / L, nz = -dx / L;
    for (const s of [-1, 1]) {
      if (R() < 0.3) continue;
      const off = 3.1 + R() * 0.7, px = x + nx * s * off + (R() - 0.5) * 1.2, pz = z + nz * s * off + (R() - 0.5) * 1.2;
      if (pz < 28 || pathAt(px, pz, WAY)[0] < 2.9 || TREASURIES.some((t) => inRect([t.rect[0] - 1.6, t.rect[1] - 1.6, t.rect[2] + 1.6, t.rect[3] + 2.4], px, pz)) || inRect([STOA[0] - 1, STOA[1] - 1, STOA[2] + 1, STOA[3] + 2], px, pz) || inRect(FC, px, pz, 1) || inRect([STAIR[0] - 2, 24, STAIR[2] + 2, 46], px, pz)) continue;
      if (placed.some(([ox, oz]) => Math.hypot(ox - px, oz - pz) < 3.0)) continue;
      const kind = pick(R, table), y = height(px, pz);
      // the downhill side of a leg gives onto the leg below: nothing tall on the edge
      make(kind, px, pz, y, toward(px, pz, x, z), R, E); placed.push([px, pz]);
    }
  }
}
