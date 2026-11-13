// Teotihuacan (c. 400) — the layout (docs/settlements/teotihuacan.md §2): the Avenue of the Dead
// north–south, the Pyramid of the Moon on its rise at the north end with its plaza, the Pyramid of
// the Sun on the east side, the Ciudadela with the Feathered Serpent Pyramid to the south-east,
// apartment compounds on the grid. Pure data. +x east, +z south.

export const RADIUS = 440;
export const AVENUE = [-20, -262, 20, 400];
export const MOON = { c: [0, -330], w: 140, d: 128, tw: 40, td: 34, h: 43, rise: 3 };   // rise: the level of the Moon Plaza's terrace
/** The platforms across the avenue (their south faces' z), stepping it into sunken plazas; the last, at the Moon Plaza's edge, carries its terrace. */
export const CROSS = [-140, -10, 110, 240];
export const STEP = [-92, -199, 92, -189];
/** The platforms enclosing the plazas run from the avenue's edge out to BANK on either side. */
export const BANK = 52;
export const PLAZA = [-70, -262, 70, -196];
export const SUN = { c: [180, -80], w: 225, d: 222, tw: 40, td: 40, h: 65 };
export const CIUD = [30, 170, 210, 350];
export const KEEP_CLEAR = [[-100, -420, 100, -190], [22, -215, 315, 95], [22, 160, 220, 360]];
/** The Palace of Quetzalpapalotl at the Moon Plaza's south-west, its floor level with the top of the side platform it opens on; the Jaguars' patio south of it. */
export const QPP = { rect: [-93, -183, -52, -147], y: 4.2 };
export const JAGUARS = { rect: [-98, -141, -60, -111], y: 0.6 };
/** The Great Compound's market plaza west of the avenue, opposite the Ciudadela; its central platform. */
export const MARKET = [-190, 172, -66, 346];
export const MARKET_PLATFORM = [-142, 245, -114, 273];
export const PALACE_CLEAR = [-112, -190, -52, -104];
/**
 * The avenue rises from plaza to plaza toward the Moon (cookjmex: each plaza "raised a little above the
 * one before"): the level of each plaza's floor, from the one under the Moon Plaza's platform southward
 * (the arrival's plaza, between z −4 and 110, is the datum). The step between two is taken inside the
 * platform across the avenue that divides them.
 */
export const LEVELS = [1.8, 0.9, 0, -0.45, -0.9];
export function avenueLevel(z) {
  let L = LEVELS[0];
  for (let k = 0; k < CROSS.length; k++) L += (LEVELS[k + 1] - LEVELS[k]) * smooth(CROSS[k] + 0.8, CROSS[k] + 5.2, z);
  return L * (1 - smooth(AVENUE[3], AVENUE[3] + 24, z));
}
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
let EMPTY = [];
/** Apartment compounds of 46–58 m on a grid of 64 m, clear of the avenue and the monuments. */
export function compounds() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(400), S = 64;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    const w = 46 + rand() * 12, d = 46 + rand() * 12, r = [x + 3, z + 3, x + 3 + w, z + 3 + d], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > RADIUS - 26) continue;
    if (Math.abs(cx) < 34 + w / 2 || [...KEEP_CLEAR, PALACE_CLEAR].some((k) => inRect(k, cx, cz, w / 2 + 4))) continue;
    if (rand() < 0.1) { EMPTY.push(r); continue; }
    if (inRect(MARKET, cx, cz, w / 2 + 6)) continue;
    const seed = Math.floor(rand() * 1e6), h = (seed * 2654435761 >>> 0) / 4294967296;
    // the compounds with a painted room (Tepantitla's) and those of the obsidian workers (nearer the Ciudadela and the Moon)
    const h2 = ((seed ^ 0x9e3779b9) >>> 0) / 4294967296, mural = h < 0.2, workshop = h > 0.8 && (cz > 120 || cz < -300 || h > 0.93);
    // the potters' and the weavers' compounds (the rest are households)
    LOTS.push({ rect: r, seed, mural, workshop, craft: !mural && !workshop && h2 < 0.32 ? (h2 < 0.17 ? 'potter' : 'weaver') : null });
  }
  return LOTS;
}
export const inCompound = (x, z, m = 0) => compounds().some((c) => inRect(c.rect, x, z, m)) || lodges().some((l) => inRect(l.foot, x, z, m));

/**
 * The houses of those who serve the avenue (docs/settlements/teotihuacan.md §5b), standing where the city has room for them near the arrival: two on
 * the avenue's west platform in each of the two gaps between its platform temples (the priest's house and a dwelling; a workshop and a weaver's), and a
 * little barrio of six along a lane in the open ground east of the avenue, between the Sun's front and the Ciudadela. Each { rect (the block with its
 * portico), face, y, kind, seed, yard, foot (its whole footprint with the forecourt) }.
 */
let LODGES = null;
export function lodges() {
  if (LODGES) return LODGES;
  LODGES = [];
  const PL = LEVELS[2] + 2.4, add = (rect, face, y, kind, seed, yard = 0) => {
    const [x0, z0, x1, z1] = rect, e = { e: [x1, z0, x1 + yard + 1.8, z1], w: [x0 - yard - 1.8, z0, x0, z1], s: [x0, z1, x1, z1 + yard + 1.8], n: [x0, z0 - yard - 1.8, x1, z0] }[face];
    LODGES.push({ rect, face, y, kind, seed, yard, foot: [Math.min(x0, e[0]), Math.min(z0, e[1]), Math.max(x1, e[2]), Math.max(z1, e[3])] });
  };
  // the west platform's gaps (between the temples at z 6–24, 41–65 and 82–100), the platform's top 2.4 m up
  for (const [c, a, b, d] of [[32.5, 'lodge', 'dwelling', 0], [73.5, 'workshop', 'weaver', 1]]) {
    add([-50.5, c - 6.5, -39.5, c + 6.5], 'e', PL, a, 100 + d * 10, 0);
    add([-35.5, c - 6, -24.5, c + 6], 'e', PL, b, 101 + d * 10, 0);
  }
  // the barrio along the lane x 79–83, z 103–143: the west row faces east, the east row west, each in a forecourt
  const rows = [[103, 'dwelling', 'workshop'], [117, 'potter', 'lodge'], [131, 'dwelling', 'weaver']];
  rows.forEach(([z, w, e2], i) => {
    add([64.5, z, 75.5, z + 12], 'e', 0, w, 200 + i, 3.5);
    add([86.5, z, 97.5, z + 12], 'w', 0, e2, 210 + i, 3.5);
  });
  return LODGES;
}

/** Is (x, z) in a street of the grid (the gaps between the compounds' lots, along the lines x or z = −RADIUS + 64 k)? */
export function inStreet(x, z) {
  const u = (((x + RADIUS) % 64) + 64) % 64, v = (((z + RADIUS) % 64) + 64) % 64;
  return u < 3 || u > 58.5 || v < 3 || v > 58.5;
}
/** The lots left without a compound (kept as plots of maguey and nopal). */
export function emptyLots() { compounds(); return EMPTY; }
