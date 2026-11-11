// Modern New York about 1931 — the layout (docs/settlements/new-york.md §2): Midtown Manhattan's
// grid between 32nd and 44th Streets, Sixth Avenue to Lexington; the Empire State Building on Fifth
// Avenue between 33rd and 34th; the Public Library and Bryant Park on Fifth between 40th and 42nd;
// Grand Central on Park Avenue at 42nd; the Chrysler and Chanin Buildings at 42nd and Lexington;
// Broadway's diagonal through Herald Square; the Sixth Avenue El. The avenues and blocks are
// compressed (the landmarks' heights and the Empire State's plan true). Pure data.
//
// Everything here is in the grid's own frame: +x along the cross streets (toward the East River),
// −z up the avenues (uptown). The grid is turned into the settlement's frame (+x east, +z south)
// by GRID: Manhattan's avenues run 29° east of true north (§3), the element `turned` of the style
// doing it for the plans (src/styles/artdeco/turn.js), toCity / toGrid for points.

export const RADIUS = 460;
/** The grid's turn into the settlement's frame (as Matrix4.makeRotationY): uptown (−z) to N 29° E. */
export const GRID = -29 * Math.PI / 180;
const GC = Math.cos(GRID), GS = Math.sin(GRID);
/** A point of the grid's frame in the settlement's, and back. */
export const toCity = (x, z) => [GC * x + GS * z, -GS * x + GC * z];
export const toGrid = (x, z) => [GC * x - GS * z, GS * x + GC * z];
export const AVENUES = [[-200, 18, '6th'], [0, 18, '5th'], [90, 14, 'Madison'], [180, 24, 'Park'], [270, 16, 'Lexington'], [360, 16, '3rd']];
/** The cross streets: number → z of the centre line (34th at 200, 50 m apart, the Empire State's block 60). */
export const streetZ = (n) => (n <= 33 ? 260 + (33 - n) * 50 : 200 - (n - 34) * 50);
export const STREETS = Array.from({ length: 17 }, (_, i) => 30 + i).map((n) => [streetZ(n), 12, n]);
/** The Sixth Avenue El's stations at 33rd, 38th and 42nd Streets: the middle of each platform (its stair comes down mid-block north of the street). */
export const EL_STATIONS = [33, 38, 42].map((n) => streetZ(n) - 19.5);
/** Where an El stair stands on the pavement (no one stands there). */
export const onElStair = (x, z, m = 0) => Math.abs(Math.abs(x - AVENUES[0][0]) - 10) < 0.8 + m && EL_STATIONS.some((s) => z > s + 30 - 5.5 - 21 - m && z < s + 30 - 5.5 + m);
export const ESB = [-119, 206, -9, 254];
export const LIBRARY = [-78, -190, -9, -112];
export const BRYANT = [-191, -194, -82, -106];
export const GCT = [136, -244, 224, -206];
/** Park Avenue's viaduct of 1919, from the terminal's roadway over 42nd and 41st Streets down to 40th. */
export const VIADUCT = { x: 180, w: 8, z1: streetZ(40), spans: [[streetZ(42) - 6, streetZ(42) + 6], [streetZ(41) - 6, streetZ(41) + 6]], flat: streetZ(42) + 8 };
export const CHRYSLER = [279, -244, 329, -206];
export const CHANIN = [222, -194, 262, -160];
export const LINCOLN = [110, -194, 150, -164];
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
/** Broadway: from Herald Square (6th Avenue at 34th) north-west at the slope it really has. */
export const broadwayX = (z) => -200 - (200 - z) * 0.5;
export const onBroadway = (x, z, m = 0) => z < 230 && Math.abs(x - broadwayX(z)) < 12 + m;
export const onStreet = (x, z, m = 0) => AVENUES.some(([ax, w]) => Math.abs(x - ax) < w / 2 + m) || STREETS.some(([sz, w]) => Math.abs(z - sz) < w / 2 + m) || onBroadway(x, z, m);
export const height = (x, z) => 0.8 * smooth(-300, 300, -z) * (1 - smooth(RADIUS - 60, RADIUS - 30, Math.hypot(x, z)));   // Murray Hill's gentle rise
const SPECIAL = [ESB, LIBRARY, BRYANT, GCT, CHRYSLER, CHANIN, LINCOLN];
/** Inside one of the landmarks' lots, or on Park Avenue's viaduct. */
export const inSpecial = (x, z, m = 0) => SPECIAL.some((s) => s !== BRYANT && inRect(s, x, z, m)) || (Math.abs(x - VIADUCT.x) < VIADUCT.w / 2 + 0.6 + m && z > GCT[3] - m && z < VIADUCT.z1 + m);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The lot of the diner (on 34th Street east of Fifth) and the walk-up beside it (rooms.js), docs §1f. */
export const DINER_AT = [43, 185], WALKUP_AT = [75, 185];
let LOTS = null;
/** The buildings: each block cut into lots along its two street fronts; heights by district (lofts west of Fifth, towers near 42nd, brownstones in Murray Hill). */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1931), xs = [-460, ...AVENUES.map(([x]) => x), 460], zs = STREETS.map(([z]) => z).sort((a, b) => a - b);
  for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < zs.length; j++) {
    const ai = AVENUES[i - 1], bi = AVENUES[i];
    const bx0 = xs[i] + (ai ? ai[1] / 2 : 0) + 3, bx1 = xs[i + 1] - (bi ? bi[1] / 2 : 0) - 3, bz0 = zs[j] + 6 + 3, bz1 = zs[j + 1] - 6 - 3;
    if (bx1 - bx0 < 10 || bz1 - bz0 < 10) continue;
    const zm = (bz0 + bz1) / 2;
    for (const [z0, z1] of [[bz0, zm], [zm, bz1]]) {
      let x = bx0;
      while (x < bx1 - 6) {
        const w = Math.min(bx1 - x, 10 + rand() * 22), r = [x, z0, x + w - 0.3, z1 - 0.3], cx = x + w / 2, cz = (z0 + z1) / 2;
        x += w;
        if (Math.hypot(cx, cz) > RADIUS - 40 || SPECIAL.some((s) => inRect(s, cx, cz, 2) || inRect(s, r[0], cz) || inRect(s, r[2], cz)) || onBroadway(cx, cz, 2) || onBroadway(r[0], cz) || onBroadway(r[2], cz)) continue;
        const near42 = Math.exp(-((cz + 200) ** 2) / (2 * 90 ** 2)), murray = cx > 60 && cz > -150 ? 1 : 0, garment = cx < -10 ? 1 : 0;
        let h = 18 + rand() * 25;
        if (garment) h = 40 + rand() * 45;
        if (murray && rand() < 0.6) h = 12 + rand() * 8;
        if (rand() < 0.04 + near42 * 0.3) h = 90 + rand() * (100 + near42 * 120);
        const mats = garment ? ['facade_buff', 'facade_brick', 'facade_buff'] : murray ? ['facade_brick', 'facade_brick', 'facade_limestone'] : ['facade_limestone', 'facade_buff', 'facade_grey', 'facade_brick'];
        // the rear yard: the houses, tenements and lofts stop 3.5 m short of the block's middle line (the towers fill their lots)
        const front = z0 === bz0 ? 'n' : 's';
        if (h < 70) { if (front === 'n') r[3] -= 3.5; else r[1] += 3.5; }
        const shops = front + (r[0] <= bx0 + 0.01 ? 'w' : '') + (x >= bx1 - 6 || x + 0.01 >= bx1 ? 'e' : '');   // the street front, and the side at a corner
        const mat = mats[Math.floor(rand() * mats.length)], seed = Math.floor(rand() * 1e6), r2 = rng(seed ^ 0x51ed27), hh = Math.round(h);
        // the older blocks (docs/settlements/new-york.md §1h): rows of brownstones in Murray Hill, cast-iron loft fronts among the older mid-rise (their own rng: the town's is unchanged)
        const row = murray && h < 21 && !inRect(r, DINER_AT[0], DINER_AT[1]) && !inRect(r, WALKUP_AT[0], WALKUP_AT[1]), iron = !row && !garment && h >= 18 && h < 48 && r2() < 0.45;
        LOTS.push({ rect: r, y: height(cx, cz), h: hh, mat, seed, front, shops, ...(row ? { row: true } : {}), ...(iron ? { iron: true } : {}) });
      }
    }
  }
  return LOTS;
}
/** The chimney stack on a building's roof (the grid's frame: [x, z]) or null: a third of the low buildings that are not rows (a row has its own stacks, blocks.js rowStacks). */
export function chimneyAt(l) {
  if (l.row || l.h >= 60) return null;
  const r = rng(l.seed ^ 0x7777);
  if (r() > 0.38) return null;
  const [x0, z0, x1, z1] = l.rect;
  return [x0 + (x1 - x0) * (0.2 + 0.6 * r()), z0 + (z1 - z0) * (0.3 + 0.4 * r())];
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
