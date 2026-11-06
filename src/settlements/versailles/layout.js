// Versailles about 1690 — the layout (docs/settlements/versailles.md §2): the château on its rise
// facing west over the gardens — the central block with the Hall of Mirrors, the north and south
// wings, the courts opening east; the water parterre, the Latona fountain, the Tapis Vert, the Apollo
// fountain and the Grand Canal down the axis; the bosquets either side; the Place d'Armes and the
// town east with its three avenues. Compressed (the gardens run some 3 km). Pure data. +x east, +z south.

export const RADIUS = 420;
export const AXIS_Z = 0;
export const CHATEAU = [0, -55, 40, 55];
export const LOGIS = [40, -38, 92, 38];
export const MARBLE = [52, -12, 74, 12], MARBLE_RISE = 0.85;     // the Marble Court, raised over the Royal Court
export const WINGS = [[8, -200, 46, -55], [8, 55, 46, 200]];
export const PARTERRE = [-70, -55, -4, 55];
export const LATONA = [-120, 0];
export const TAPIS = [-300, -22, -140, 22];
export const APOLLO = [-320, 0];
export const CANAL = { x0: -340, w: 40, cross: -390, crossW: 24 };
export const PLACE = [100, -70, 210, 70];
export const RISE = 6;
export const LATONA_Y = RISE * 0.352;                 // the ground at the Latona basin (the slope's height there)
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inCanal = (x, z) => Math.hypot(x, z) < RADIUS - 50 && ((x < CANAL.x0 && Math.abs(z - AXIS_Z) < CANAL.w / 2) || (Math.abs(x - CANAL.cross) < CANAL.crossW / 2 && Math.abs(z) < 260));
/** The rise of the château falling west down the gardens; the canal dug in. */
export function height(x, z) {
  let h = RISE * smooth(-160, -60, x);
  // the Latona basin stands on a level landing at the foot of the slope
  const dl = Math.hypot(x - LATONA[0], z - LATONA[1]);
  if (dl < 26) h = LATONA_Y + (h - LATONA_Y) * smooth(18, 26, dl);
  if (inCanal(x, z)) h = -2.2;
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
export const onAvenue = (x, z, m = 0) => x > PLACE[2] - 5 && [0, 0.35, -0.35].some((s) => Math.abs(z - (x - PLACE[2]) * s) < 12 + m);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** The town's houses east of the Place d'Armes, between the avenues. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1690);
  for (let x = 120; x < RADIUS - 20; x += 14) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 13) {
    const w = 10 + rand() * 3, d = 9 + rand() * 3, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || inRect(PLACE, cx, cz, 10) || onAvenue(cx, cz, 8) || (cx < 160 && Math.abs(cz) < 230) || rand() < 0.2) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: RISE, foot: RISE - 0.4, storeys: 3, front: rand() < 0.5 ? 'n' : 's', plaster: true });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
