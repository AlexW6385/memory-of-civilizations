// Persepolis about 480 BC — the layout (docs/settlements/persepolis.md §2): the terrace 300 m east–
// west by 455 m north–south, 14 m above the plain, against Kuh-e Rahmat on the east; the double
// stair up its west face at the north end; the Gate of All Nations; the Apadana; the Hall of a
// Hundred Columns; the palaces of Darius (Tachara) and Xerxes (Hadish); the Treasury; the town of
// Parsa on the plain to the west. Pure data. +x east, +z south.

export const RADIUS = 360;
export const TERRACE = { rect: [-150, -228, 150, 227], h: 14 };
export const STAIR = { x: -150, z: -140, w: 7 };            // the double-return stair's centre on the west face
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Kuh-e Rahmat: the mountain rising east of the terrace (fading at the settlement's edge). */
export function mountain(x, z) {
  const r = Math.hypot(x, z), f = smooth(RADIUS - 10, RADIUS - 110, r);
  return 90 * smooth(165, 330, x) * f;
}
export const ROAD = [-400, -146, -150, -134];               // the road from the plain to the stair
/** The market of Parsa beside the road to the terrace (docs/settlements/persepolis.md §14): no houses on it. */
export const MARKET = [-300, -128, -238, -92];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses of Parsa on the plain west and south-west of the terrace. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(480);
  for (let x = -380; x < -175; x += 15) for (let z = -330; z < 340; z += 14) {
    if (Math.hypot(x, z) > RADIUS - 30 || inRect(ROAD, x, z, 8) || inRect(ROAD, x + 12, z + 11, 8)) continue;
    if (rand() < 0.3) continue;
    const w = 9 + rand() * 4, d = 9 + rand() * 3;
    const seed = Math.floor(rand() * 1e6);
    if (inRect(MARKET, x + w / 2, z + d / 2, 4)) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
