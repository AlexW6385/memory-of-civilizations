// Conques about 1120 — the layout (docs/settlements/conques.md §2): a steep hillside facing south
// over the gorge of the Dourdou. The abbey church of Sainte-Foy on its terrace in the middle, the
// cloister to its south; the village's houses on terraces above and below, along lanes that
// follow the slope; the river at the bottom with its bridge; woods on the far side. Pure data.
// +x east, +z south.

export const RADIUS = 360;
export const ABBEY = { origin: [-20, 0], terrace: [-50, -35, 60, 60] };
export const RIVER = { z: 235, w: 24, level: -44, bed: -48 };
export const BRIDGE = { x: -80 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverZ = (x) => RIVER.z + 14 * Math.sin(x / 90);
/** The hillside: rising north above the abbey, falling south to the river, the far bank rising again. */
export function height(x, z) {
  let h;
  if (inRect(ABBEY.terrace, x, z)) h = 0;
  else {
    const rz = riverZ(x);
    h = z < 0 ? -z * 0.13 : z < rz ? -(RIVER.level * -1) * (z / rz) ** 1.3 : RIVER.bed + (z - rz) * 0.5;
    if (z > rz - RIVER.w / 2 && z < rz + RIVER.w / 2) h = RIVER.bed;
    const t = Math.max(Math.abs(Math.max(ABBEY.terrace[0] - x, x - ABBEY.terrace[2], 0)), Math.abs(Math.max(ABBEY.terrace[1] - z, z - ABBEY.terrace[3], 0)));
    h *= smooth(0, 12, t);
  }
  return h * (1 - smooth(RADIUS - 90, RADIUS - 10, Math.hypot(x, z)));
}
export const inRiver = (x, z) => Math.abs(z - riverZ(x)) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 95;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses on the slope round the abbey, close above it, thinning downhill. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1120);
  for (let x = -230; x < 230; x += 12) for (let z = -230; z < 170; z += 11) {
    const w = 7 + rand() * 3, d = 7 + rand() * 2, cx = x + w / 2, cz = z + d / 2, r = Math.hypot(cx, cz);
    if (r > RADIUS - 110 || inRect(ABBEY.terrace, cx, cz, 8) || Math.abs(cx - BRIDGE.x) < 6 || rand() < 0.35 + 0.4 * smooth(80, 230, r)) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    if (Math.max(...ys) - Math.min(...ys) > 4) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(...ys), foot: Math.min(...ys), front: 's' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
