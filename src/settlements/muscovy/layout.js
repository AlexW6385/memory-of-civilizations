// Muscovy about 1600 — the layout (docs/settlements/muscovy.md §2): the Kremlin's triangle on its
// hill, the river Moskva below its south wall; Cathedral Square inside — the Dormition, the
// Archangel, the Annunciation, Ivan the Great's bell tower, the Palace of Facets — and the wooden
// palaces and courts; Red Square along the east wall with the Lobnoye Mesto, the trading rows on its
// east side and St Basil's at its south end above the river; the log houses of Kitai-gorod east and
// of Zamoskvorechye across the river. Distances compressed (the Kremlin's sides ~700 m → ~350 m).
// Pure data. +x east, +z south.

export const RADIUS = 420;
export const KREMLIN = [[-80, -185], [-25, 175], [-320, 175]];          // the north (Arsenal) corner, the south-east, the south-west
export const SPASSKY = [0, 0.42];                                        // the Spassky gate on the east wall (side 0, at t)
export const SQUARE = [-12, -150, 66, 150];                              // Red Square
export const BASIL = [26, 128];
export const LOBNOYE = [20, 72];
export const ROWS = [72, -140, 92, 90];
export const CATHEDRALS = { dormition: [-190, -10, -158, 18], archangel: [-150, 40, -126, 62], annunciation: [-210, 40, -192, 58], ivan: [-140, 0], facets: [-238, -8, -214, 16] };
// the moat (the Alevizov ditch) along the wall on the square: d0…d1 metres out from the wall's line, from z0 to z1
export const MOAT = { d0: 10, d1: 24, z0: -168, z1: 166, level: -4.5, bed: -7 };
export const NIKOLSKY = [0, 0.12];
export const wallX = (z) => KREMLIN[0][0] + (KREMLIN[1][0] - KREMLIN[0][0]) * (z - KREMLIN[0][1]) / (KREMLIN[1][1] - KREMLIN[0][1]);
export const gateZ = (t) => KREMLIN[0][1] + (KREMLIN[1][1] - KREMLIN[0][1]) * t;
export const inMoat = (x, z, m = 0) => z > MOAT.z0 - m && z < MOAT.z1 + m && x - wallX(z) > MOAT.d0 - m && x - wallX(z) < MOAT.d1 + m;
export const RIVER = { z: 250, w: 90, level: -7, bed: -10 };
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const riverZ = (x) => RIVER.z + 14 * Math.sin(x / 120);
export const inRiver = (x, z) => Math.abs(z - riverZ(x)) < RIVER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 50;
/** Inside the Kremlin's triangle (m metres in from its walls; negative m reaches out). */
export function inKremlin(x, z, m = 0) {
  for (let i = 0; i < 3; i++) {
    const a = KREMLIN[i], b = KREMLIN[(i + 1) % 3], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const side = ((b[0] - a[0]) * (z - a[1]) - (b[1] - a[1]) * (x - a[0])) / L;    // > 0 inside (the polygon runs clockwise in x-east, z-south)
    if (side < m) return false;
  }
  return true;
}
// the Borovitsky hill: the Kremlin stands ~8 m above the square's level, falling to the river
export function height(x, z) {
  const dr = Math.abs(z - riverZ(x)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  const hill = 6 * smooth(-30, -120, x) * smooth(200, 150, z);
  const bank = -4 * smooth(170, RIVER.z - RIVER.w / 2 - 4, z) * smooth(RIVER.z + RIVER.w / 2 + 30, RIVER.z + RIVER.w / 2 + 4, z);
  const river = (RIVER.bed - bank) * smooth(RIVER.w / 2 + 6, RIVER.w / 2 - 6, dr);
  const d = x - wallX(z), carve = smooth(MOAT.d0, MOAT.d0 + 0.5, d) * smooth(MOAT.d1, MOAT.d1 - 0.5, d) * smooth(MOAT.z0, MOAT.z0 + 0.5, z) * smooth(MOAT.z1, MOAT.z1 - 0.5, z);
  const h = (hill + bank + river) * (1 - edge);
  return h + (MOAT.bed - h) * carve;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const reserved = (cx, cz) => inRect(SQUARE, cx, cz, 6) || Math.hypot(cx - BASIL[0], cz - BASIL[1]) < 34 || inRect(ROWS, cx, cz, 6)
  || Object.values(CATHEDRALS).some((r) => r.length === 4 ? inRect(r, cx, cz, 14) : Math.hypot(cx - r[0], cz - r[1]) < 22)
  || (inKremlin(cx, cz, -14) && !inKremlin(cx, cz, 12)) || Math.abs(cz - riverZ(cx)) < RIVER.w / 2 + 8
  || (cz > KREMLIN[0][1] - 10 && cz < KREMLIN[1][1] + 10 && cx > wallX(cz) && cx < SQUARE[0] + 6);      // the open field cleared before the wall (1493–95), the moat in it
let LOTS = null;
/** The log houses: courts of the boyars inside the Kremlin, the posad outside. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1600);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 14) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 14) {
    const w = 8 + rand() * 4, d = 6 + rand() * 3, rot = rand() < 0.5, cx = x + 7, cz = z + 7;
    if (Math.hypot(cx, cz) > RADIUS - 45 || reserved(cx, cz) || Math.abs((cz + 420) % 70 - 35) < 4 || Math.abs((cx + 420) % 84 - 42) < 4 || rand() < 0.15) continue;
    if (inKremlin(cx, cz, 12) && (Math.abs(cx + 170) < 70 && Math.abs(cz - 20) < 55)) continue;  // Cathedral Square and round it
    const hw = (rot ? d : w) / 2, hd = (rot ? w : d) / 2, ys = [height(cx - hw, cz - hd), height(cx + hw, cz - hd), height(cx - hw, cz + hd), height(cx + hw, cz + hd)];
    LOTS.push({ rect: [cx - hw, cz - hd, cx + hw, cz + hd], y: Math.max(...ys), foot: Math.min(...ys) - 0.4, kind: rand() < 0.12 ? 'barn' : 'stue', roof: 'planks_grey', seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
