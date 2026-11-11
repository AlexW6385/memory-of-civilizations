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
let LOTS = null, STREET_LIST = null;
const STREET_W = 4.4, ROW_D = 10.2;       // a rue between the fronts (the narrow streets of the Cité were 3–5 m), the houses' backs nearly against each other
const LANE_EVERY = 62, LANE_W = 3.4;      // a ruelle cut through the rows between the streets
const laneAt = (x) => { const k = Math.floor((x + 1000) / LANE_EVERY), c = k * LANE_EVERY - 1000 + 31 + ((k * 37) % 11); return Math.abs(x - c) < LANE_W / 2; };
/** The rows (z0, z1 of each, which way its fronts face): two rows of houses face each other across a street. */
function rowList() {
  const rows = [], blocks = [];
  for (let z = -380; z < -180; z += 26) blocks.push(z);          // the Right Bank
  for (let z = 165; z < 380; z += 26) blocks.push(z);            // the Left Bank
  for (let z = -88; z < 88; z += 26) blocks.push(z);             // the island
  for (const z of blocks) { rows.push([z, z + ROW_D, 's'], [z + ROW_D + STREET_W, z + 2 * ROW_D + STREET_W, 'n']); }
  return rows;
}
/** The streets between the rows, as rectangles [x0, z0, x1, z1] (for the walkers), the ruelles, and the bridges' streets. */
export function streets() {
  if (STREET_LIST) return STREET_LIST;
  const out = [], rows = rowList();
  for (let i = 0; i < rows.length; i += 2) {
    const z0 = rows[i][1], z1 = rows[i + 1][0], zc = (z0 + z1) / 2, island = zc > -95 && zc < 95;
    if (!island && Math.abs(zc) <= 175) continue;
    let segs = [island ? [-326, 326] : [-RADIUS + 30, RADIUS - 30]];
    const cut = (a, b) => { segs = segs.flatMap(([s0, s1]) => (b <= s0 || a >= s1 ? [[s0, s1]] : [[s0, Math.min(s1, a)], [Math.max(s0, b), s1]])).filter(([s0, s1]) => s1 - s0 > 8); };
    if (zc > PALACE[1] - 3 && zc < PALACE[3] + 3) cut(-340, PALACE[2] + 2);
    if (zc > CATHEDRAL[1] - 4 && zc < CATHEDRAL[3] + 4) cut(CATHEDRAL[0] - 2, 340);
    for (const [s0, s1] of segs) out.push([s0, z0, s1, z1]);
  }
  // the bridges' streets run on through the rows (the gap left in them) from bank to bank
  out.push([-3, -300, 3, 88], [BRIDGES[1].x - 3, -88, BRIDGES[1].x + 3, 300]);
  // the parvis before the cathedral
  out.push([PARVIS[0] + 2, PARVIS[1] + 3, PARVIS[2] + 2, PARVIS[3] - 3]);
  STREET_LIST = out;
  return out;
}
/** Timber-framed houses in rows along the streets of the island and the banks, their gables to the street. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1248);
  for (const [za, zb, front] of rowList()) for (let x = -RADIUS + 20; x < RADIUS - 20;) {
    const w = 5.2 + rand() * 3.2, cx = x + w / 2, cz = (za + zb) / 2;
    if (Math.hypot(cx, cz) < RADIUS - 40 && !inRect(PALACE, cx, cz, 8) && !inRect(CATHEDRAL, cx, cz, 14) && !inRect(PARVIS, cx, cz, 4) && !BRIDGES.some((b) => Math.abs(cx - b.x) < 8) && !laneAt(cx) && !laneAt(x) && !laneAt(x + w) && (inRect(ISLAND, cx, za, -4) && inRect(ISLAND, cx, zb, -4) || Math.abs(cz) > 175) && rand() > 0.05)
      LOTS.push({ rect: [x, za, x + w - 0.25, zb], seed: Math.floor(rand() * 1e6), front, storeys: 3 + (rand() < 0.35 ? 1 : 0) });
    x += w;
  }
  return LOTS;
}
/** Within the bands of the rows and their streets (on the island and the banks, outside the palace, the cathedral and the river). */
let BANDS = null;
export function inBlock(x, z, m = 0) {
  if (!BANDS) { BANDS = []; const r = rowList(); for (let i = 0; i < r.length; i += 2) { const zc = (r[i][0] + r[i + 1][1]) / 2; if (Math.abs(zc) > 175 || (zc > -95 && zc < 95)) BANDS.push([r[i][0], r[i + 1][1]]); } }
  if (Math.abs(x) > RADIUS - 28 || inRect(PALACE, x, z, 2) || inRect(CATHEDRAL, x, z, 2) || inRect(PARVIS, x, z, 0)) return false;
  return BANDS.some(([a, b]) => z > a - m && z < b + m);
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
