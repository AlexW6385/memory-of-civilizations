// Knossos about 1600 BC — the layout (docs/settlements/knossos.md §2): the palace on the low hill
// of Kefala, its wings round the Central Court (27 × 50 m, long side north–south); the West Court
// before the west façade; the theatral area at the north-west corner where the Royal Road arrives
// from the town; the slope east down to the Kairatos stream; the town all round. Pure data. +x
// east, +z south.

export const RADIUS = 350;
export const COURT = [-13.5, -25, 13.5, 25];
export const PALACE = [-64, -72, 64, 60];
export const THEATRAL = [-104, -98, -72, -80];
export const ROAD = { z: -89, x0: -RADIUS, x1: -100, w: 3.8 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill and the valley: flat round the palace, down east to the stream, up again beyond; level at the edge. */
export function height(x, z) {
  const r = Math.hypot(x, z), fade = 1 - smooth(RADIUS - 70, RADIUS - 5, r);
  const east = -12 * smooth(75, 190, x) + 10 * smooth(215, 300, x), west = -3 * smooth(-120, -300, x);
  return (east + west) * fade;
}
export const STREAM = { x: 205, w: 6 };
export const onRoad = (x, z, m = 0) => Math.abs(z - ROAD.z) < ROAD.w / 2 + m && x < ROAD.x1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses of the town round the palace, packed along lanes, thinning out toward the edge. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1600);
  for (let x = -RADIUS + 20; x < 175; x += 12) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 12) {
    const w = 7 + rand() * 4, d = 7 + rand() * 4, cx = x + w / 2, cz = z + d / 2, r = Math.hypot(cx, cz);
    if (r > RADIUS - 35 || inRect(PALACE, cx, cz, 40) || inRect(THEATRAL, cx, cz, 14) || onRoad(cx, cz, 9)) continue;
    if (inRect([-130, -60, -64, 60], cx, cz, 6)) continue;                     // the West Court and its approach
    if (rand() < 0.08 + 0.55 * smooth(170, 310, r)) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
