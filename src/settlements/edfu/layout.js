// Edfu in the 1st century BC — the layout (docs/settlements/edfu.md §2): the Temple of Horus in its
// mudbrick enclosure, the pylon facing south; the birth house (mammisi) before the pylon to the
// west; the sacred lake east of the temple; the town of mudbrick houses on its mound to the north
// and west; the Nile on the west with its landing; palm groves and fields. Pure data. +x east, +z south.

export const RADIUS = 380;
export const TEMPLE = { origin: [0, 60], bounds: [-44, -139, 44, 31] };     // pylon face at z = 60
export const ENCLOSURE = [-64, -92, 64, 108];
export const MAMMISI = [-62, 118, -22, 150];
export const LAKE = [78, -40, 118, 0];
export const NILE = { x: -300, w: 90, level: -4 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverX = (z) => NILE.x + 20 * Math.sin(z / 150);
export const inNile = (x, z) => Math.abs(x - riverX(z)) < NILE.w / 2 - 4 && Math.hypot(x, z) < RADIUS - 25;
export function height(x, z) {
  const d = Math.abs(x - riverX(z)), edge = smooth(RADIUS - 60, RADIUS - 20, Math.hypot(x, z));
  let h = (NILE.level - 3) * smooth(NILE.w / 2 + 8, NILE.w / 2 - 6, d) * (1 - edge);
  if (inRect(LAKE, x, z)) h = -3;
  return h;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Mudbrick houses packed north and west of the temple, toward the river. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(57);
  for (let x = -230; x < 200; x += 11) for (let z = -330; z < 60; z += 10) {
    const w = 7 + rand() * 3, d = 7 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 40 || inRect(ENCLOSURE, cx, cz, 14) || inRect(LAKE, cx, cz, 14) || Math.abs(cx - riverX(cz)) < NILE.w / 2 + 25) continue;
    if (Math.abs(cz + 160) < 5 || Math.abs(cx + 120) < 5 || rand() < 0.18) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
