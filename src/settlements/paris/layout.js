// Paris in 1248 — the layout (docs/settlements/paris.md §2): the Île de la Cité between the two
// arms of the Seine. The royal palace at the island's west end with the Sainte-Chapelle in its
// court, the great hall and the towers on the north quay; Notre-Dame at the east end with its
// parvis; streets of timber-framed houses between; the Grand Pont to the Right Bank and the Petit
// Pont to the Left Bank, houses on both banks. Pure data. +x east, +z south.

export const RADIUS = 420;
export const ISLAND = [-330, -95, 330, 95];
export const NORTH_ARM = [-RADIUS, -165, RADIUS, -105];
export const SOUTH_ARM = [-RADIUS, 105, RADIUS, 150];
export const RIVER = { level: -3, bed: -7, ground: 1 };
export const PALACE = [-328, -90, -110, 60];
export const GARDEN = [-322, -40, -270, 50];                  // the king's garden at the island's west end (§1c)
export const QUAY = { x0: -326, x1: -112, z: -107, back: -100, y: 1.08 };   // the palace's quay on the north arm
export const CHAPEL = { origin: [-200, -10] };                  // the plan's origin (its west door at x − 34)
export const CATHEDRAL = [150, -24, 278, 24];
export const PARVIS = [100, -40, 150, 40];
export const BRIDGES = [{ x: 0, arm: NORTH_ARM }, { x: 110, arm: SOUTH_ARM }];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const inArm = (x, z, m = 0) => (inRect(NORTH_ARM, x, z, m) || inRect(SOUTH_ARM, x, z, m)) && !inRect(ISLAND, x, z) && Math.abs(x) < RADIUS - 70;
export const inRiver = (x, z) => inArm(x, z, -3);
export function height(x, z) {
  const r = Math.hypot(x, z), fade = 1 - smooth(RADIUS - 90, RADIUS - 60, Math.abs(x)) ;
  let h = RIVER.ground;
  for (const A of [NORTH_ARM, SOUTH_ARM]) {
    const dz = Math.min(z - A[1], A[3] - z);
    if (dz > -4 && !inRect(ISLAND, x, z)) h = Math.min(h, RIVER.ground + (RIVER.bed - RIVER.ground) * smooth(-2, 6, dz) * fade);
  }
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, r)) ;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Timber-framed houses in rows along the streets of the island and the banks, their gables to the street. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1248);
  const rows = [];
  for (let z = -380; z < -180; z += 26) rows.push([z, z + 11, 's'], [z + 12, z + 23, 'n']);         // the Right Bank
  for (let z = 165; z < 380; z += 26) rows.push([z, z + 11, 's'], [z + 12, z + 23, 'n']);           // the Left Bank
  for (let z = -88; z < 88; z += 26) rows.push([z, z + 11, 's'], [z + 12, z + 23, 'n']);            // the island
  for (const [za, zb, front] of rows) for (let x = -RADIUS + 20; x < RADIUS - 20;) {
    const w = 6 + rand() * 3, cx = x + w / 2, cz = (za + zb) / 2;
    if (Math.hypot(cx, cz) < RADIUS - 40 && !inRect(PALACE, cx, cz, 8) && !inRect(CATHEDRAL, cx, cz, 14) && !inRect(PARVIS, cx, cz, 4) && !BRIDGES.some((b) => Math.abs(cx - b.x) < 8) && (inRect(ISLAND, cx, za, -4) && inRect(ISLAND, cx, zb, -4) || Math.abs(cz) > 175) && rand() > 0.08)
      LOTS.push({ rect: [x, za, x + w - 0.3, zb], seed: Math.floor(rand() * 1e6), front, storeys: 3 + (rand() < 0.4 ? 1 : 0) });
    x += w;
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
