// Amsterdam about 1670 — the layout (docs/settlements/amsterdam.md §2): the city's half-rings of canals
// round the old centre on the IJ — the Singel, Herengracht, Keizersgracht and Prinsengracht; the Dam
// with the new Town Hall and the Nieuwe Kerk; the Westerkerk on the Prinsengracht; tall gabled houses
// along every canal under rows of elms; the IJ harbour full of ships to the north. Compressed (the
// rings are about 1.5 km across). Pure data. +x east, +z south (the IJ to the north).

export const RADIUS = 400;
export const C = [0, -300];                                 // the rings' centre, on the IJ's shore
export const RINGS = [130, 185, 240, 295];                  // the canals' radii
export const CANAL_W = 22;
export const DAM = [-30, -255, 40, -205];
export const HALL = [-75, -262, -30, -205];
export const IJ_Z = -290;
export const WATER = -1.0, GROUND = 1.0;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const rc = (x, z) => Math.hypot(x - C[0], z - C[1]);
/** How far into water: a canal of the rings, or the IJ. */
export function wet(x, z) {
  const r = rc(x, z), inDisc = Math.hypot(x, z) < RADIUS - 60;
  let d = Math.min(...RINGS.map((R) => Math.abs(r - R) - CANAL_W / 2));
  if (z < C[1] + 20) d = 9;                                  // the rings end at the IJ
  d = Math.min(d, z - IJ_Z);
  return inDisc ? d : 9;
}
export function height(x, z) {
  const w = wet(x, z), r = Math.hypot(x, z);
  const h = w > 1.5 ? GROUND : w > -1.5 ? GROUND + (WATER - 1.8 - GROUND) * smooth(1.5, -1.5, w) : WATER - 1.8;
  return h * (1 - smooth(RADIUS - 60, RADIUS - 15, r)) + 0;
}
export const inWater = (x, z) => wet(x, z) < -0.5;
export const westerkerk = () => { const a = Math.PI * 0.62, R = RINGS[3] + CANAL_W / 2 + 14; return [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R]; };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses in rows on both banks of every canal, their fronts to the water. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1670), wk = westerkerk();
  const bands = [[RINGS[0] - CANAL_W / 2 - 18, -1], ...RINGS.flatMap((R) => [[R - CANAL_W / 2 - 8 - 6, -1], [R + CANAL_W / 2 + 8, 1]])];
  for (const [R, side] of bands) {
    for (let a = 0.05; a < Math.PI - 0.05;) {
      const w = 6 + rand() * 2.5, x = C[0] + Math.cos(a) * (R + 7), z = C[1] + Math.sin(a) * (R + 7);
      a += w / (R + 7);
      if (Math.hypot(x, z) > RADIUS - 70 || z < C[1] + 26 || inRect([DAM[0] - 50, DAM[1] - 10, DAM[2] + 10, DAM[3] + 10], x, z) || Math.hypot(x - wk[0], z - wk[1]) < 16 || rand() < 0.06) continue;
      const nx = Math.cos(a), nz = Math.sin(a), alongX = Math.abs(nz) > Math.abs(nx);
      const front = alongX ? (nz * side > 0 ? 'n' : 's') : (nx * side > 0 ? 'w' : 'e');
      const rect = alongX ? [x - w / 2, z - 6, x + w / 2, z + 6] : [x - 6, z - w / 2, x + 6, z + w / 2];
      if (LOTS.some((l) => !(rect[2] <= l.rect[0] || rect[0] >= l.rect[2] || rect[3] <= l.rect[1] || rect[1] >= l.rect[3]))) continue;
      if ([[rect[0], rect[1]], [rect[2], rect[1]], [rect[0], rect[3]], [rect[2], rect[3]]].some(([p, q]) => wet(p, q) < 3)) continue;
      LOTS.push({ rect, front, storeys: 4 + (rand() < 0.4 ? 1 : 0), seed: Math.floor(rand() * 1e6), y: GROUND });
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
