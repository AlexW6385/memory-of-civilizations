// Dogon village at the foot of the Bandiagara Escarpment, c. 1930 — the layout (docs/settlements/dogon.md §2–§5): the sandstone cliff
// closing the north (-z), its foot at about z = -46, two ledges of Tellem dwellings in its face; the village cut in terraces into the
// talus below it, three rows of compounds with a lane between the rows and one down the middle; the toguna and its small open place
// at the village's lower middle; the plain to the south with the millet fields. Pure data. +x east, +z south.

export const RADIUS = 90;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}

/** The terraces' profile along z: [z, y], flat on the rows of compounds, ramps across the lanes between them. */
const TERR = [[44, 0], [31, 1.2], [21, 1.2], [11.5, 4.3], [0.5, 4.3], [-6.5, 6.8], [-16.5, 6.8], [-22.5, 9.2], [-32.5, 9.2], [-40, 11.1], [-46, 12.2]];
export const PLACE_Y = 1.2;
export const CLIFF_Z = -46, CLIFF_H = 9;      // the terrain keeps only a low rocky shelf at the foot (the rim clamp below cannot hold a tall cliff); the escarpment itself is the built wall (cliff.js, wallFace/wallTop below)
function terraceY(z) {
  if (z >= TERR[0][0]) return 0;
  if (z <= TERR[TERR.length - 1][0]) return TERR[TERR.length - 1][1];
  for (let i = 0; i + 1 < TERR.length; i++) {
    const [z0, y0] = TERR[i], [z1, y1] = TERR[i + 1];
    if (z <= z0 && z >= z1) { const t = (z0 - z) / (z0 - z1); return y0 + (y1 - y0) * t * t * (3 - 2 * t); }
  }
  return 0;
}
/** The open slope's height without terraces: a plain line from the plain's edge to the cliff's foot. */
const natY = (z) => Math.max(0, Math.min(12.2, 0.15 * (34 - z)));
/** The cliff's foot line: wavy, with bays. */
export const cliffFoot = (x) => CLIFF_Z + 3 * Math.sin(x / 14 + 1) + 1.6 * Math.sin(x / 5.3);

export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const wT = 1 - smooth(66, 82, Math.abs(x));
  let h = natY(z) + (terraceY(z) - natY(z)) * wT;
  h += 0.12 * Math.sin(x / 7 + z / 9) * smooth(30, 44, z);
  const d = cliffFoot(x) - z;
  if (d > -6) {
    // the cliff: steep, ribbed by vertical joints, topped by the plateau
    const rib = 1 + 0.05 * Math.sin(x * 0.8 + 2) + 0.04 * Math.sin(x * 1.9);
    const base = terraceY(cliffFoot(x)) * wT + natY(cliffFoot(x)) * (1 - wT);
    const face = CLIFF_H * Math.pow(smooth(-0.5, 11, d), 0.85) * rib * (1 - smooth(44, 60, r));   // the cliff sinks before the rim
    // boulder fall at the foot
    const scree = 1.2 * Math.max(0, vnoise(x * 0.35, z * 0.35)) * smooth(-6, 0, d);
    h = Math.max(h, base + face + scree + (d > 11 ? 0.06 * (d - 11) : 0));
    if (d > 0) h += 0.5 * vnoise(x * 0.5, z * 0.5) * smooth(0, 4, d) * (1 - smooth(8, 11, d));
  }
  // the rim meets the open country at no more than 1 m in 1 m (tests/planet.test.mjs: no step)
  const lim = Math.max(0, RADIUS - 1 - r) * 0.9;
  return Math.max(-lim, Math.min(lim, h * (1 - smooth(70, RADIUS, r))));
}
/** z on the terrain shelf's face (x) at height y (m), found by search from the foot inward. */
export function faceZ(x, y) {
  let lo = cliffFoot(x) + 4, hi = cliffFoot(x) - 16;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (height(x, m) < y) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

// ── the escarpment: a built wall of sandstone strata behind the village's plateau (cliff.js), 36 m above the plateau at the middle,
// sinking into the ground toward both ends before the rim. Its face line z(x); the alcoves of the Tellem dwellings cut into it.
export const WALL_DX = 2, WALL_DY = 1.2, WALL_X = 66;
export const wallFace = (x) => -58 - 2.2 * Math.sin(x / 13 + 0.7) - 1.2 * Math.sin(x / 5.1 + 1) + 0.0035 * x * x * 0.5;
export const wallBase = (x) => height(x, wallFace(x));
export const wallTop = (x) => wallBase(x) + (34 + 5 * Math.sin(x / 9 + 2) + 3 * Math.sin(x / 3.7)) * (1 - smooth(26, 72, Math.abs(x))) + 1.5;
/** The strata: hard bands stand proud of the soft ones. */
export const strata = (y) => (Math.floor(y / 3.6) % 3 === 1 ? 0.55 : 0) + 0.25 * Math.sin(y * 1.7);
export const wallZ = (x, y) => wallFace(x) + strata(y) * 0.5 - 0.45 * Math.sin(x * 0.9 + y * 0.35) * Math.min(1, (y - wallBase(x)) / 4);
/** The ledges of the Tellem: alcoves cut into the face — x of the middle (a multiple of 2), width (multiple of 2), y of the floor (a multiple of 1.2), 5 rows (6 m) high. */
export const LEDGES = [
  { x: -16, w: 12, y: 8 * 1.2 + 14.4 }, { x: 14, w: 10, y: 9 * 1.2 + 14.4 }, { x: -2, w: 12, y: 15 * 1.2 + 14.4 }, { x: -30, w: 8, y: 6 * 1.2 + 14.4 },
  { x: 34, w: 8, y: 6 * 1.2 + 14.4 }, { x: 4, w: 8, y: 6 * 1.2 + 14.4 },
];

// ── the compounds ────────────────────────────────────────────────────────
const ROWS = [
  { id: 'C', z0: 0.9, z1: 11.0, y: 4.3 },
  { id: 'B', z0: -16.1, z1: -7.0, y: 6.8 },
  { id: 'A', z0: -32.1, z1: -23.0, y: 9.2 },
];
export const LANE = 3.4;
export const CENTRE_LANE = [-2.2, 2.2];
/** The enterable compound: row C, east of the middle lane, its ginna's facade on the place. */
export const COMPOUNDS = [];
{
  const rand = rng(1930);
  for (const row of ROWS) {
    for (const side of [1, -1]) {
      let cur = side > 0 ? CENTRE_LANE[1] : CENTRE_LANE[0], k = 0;
      for (;;) {
        const w = 11.5 + Math.floor(rand() * 7);
        const x0 = side > 0 ? cur : cur - w, x1 = side > 0 ? cur + w : cur;
        cur = side > 0 ? x1 + LANE : x0 - LANE;
        const far = Math.max(Math.abs(x0), Math.abs(x1));
        if (Math.hypot(far, Math.max(Math.abs(row.z0), Math.abs(row.z1))) > 68) break;
        COMPOUNDS.push({ row: row.id, i: k++, rect: [x0, row.z0 - (row.id === 'A' ? 0 : 0), x1, row.z1], y: row.y, seed: Math.floor(rand() * 1e6), ginna: 'niche' });
      }
    }
  }
  // the landmark compound: the first of row C on the east side (k = 0)
  const L = COMPOUNDS.find((c) => c.row === 'C' && c.rect[0] > 0 && c.i === 0);
  L.landmark = true;
  // a compound or two of the plainer, older kind (smooth facades)
  // and five kinds of front along the rows (docs/settlements/dogon.md §5): niched, tall, zig-zag banded, plain, two-tone wash
  const KIND = ['niche', 'zigzag', 'niche', 'tall', 'wash', 'plain', 'wash', 'tall', 'niche', 'zigzag', 'niche', 'plain', 'tall', 'plain', 'wash', 'niche', 'zigzag', 'tall'];
  COMPOUNDS.forEach((c, n) => { c.ginna = c.landmark ? 'niche' : KIND[n % KIND.length]; });
  // the compounds whose ginna is opened to walk into (the nearest of rows C and B, the middle of row A): the house on the pad's west
  // part (hw) or its east part, the courtyard beside it
  COMPOUNDS.forEach((c) => {
    const cx = (c.rect[0] + c.rect[2]) / 2;
    c.hw = c.landmark ? true : c.seed % 2 === 0;
    c.open = c.landmark || (c.row !== 'A' && Math.abs(cx) <= 34) || (c.row === 'A' && Math.abs(cx) <= 20);
  });
}
export const LANDMARK = COMPOUNDS.find((c) => c.landmark);
/** The toguna and its place. */
export const TOGUNA = { c: [-7, 25.5], w: 7.2, d: 5.4, y: PLACE_Y };
export const PLACE = [-26, 14, 24, 33];
/** The village's pads, the lanes between them, the place: where nothing grows. */
export const inCompound = (x, z, m = 0) => COMPOUNDS.some((c) => inRect(c.rect, x, z, m));
export const VILLAGE = [-68, -42, 68, 13];
/** The open places and trades round the place: the shade trees, the forge, the dyers, the threshing floors, the pens (all on the flat at y = PLACE_Y). */
export const SHADE = [{ at: [15.5, 23.5], r: 0.66, h: 5.6, seed: 3 }, { at: [-24.5, 22.8], r: 0.6, h: 5.2, seed: 8 }, { at: [38.5, 24.5], r: 0.62, h: 5.4, seed: 12 }, { at: [-37.5, 30.5], r: 0.58, h: 5.0, seed: 15 }];
export const FORGE = { at: [-44.5, 29.5], seed: 7 };
export const DYE = { at: [19.5, 29.2], seed: 9 };
export const THRESH = [{ at: [-19.5, 27.2], r: 3.0, seed: 3 }, { at: [31.5, 27.5], r: 3.1, seed: 5 }];
export const PENS = [{ at: [-34, 25], r: 3.2, seed: 4, gap: 2 }, { at: [46.5, 28], r: 2.8, seed: 6, gap: 9 }];
const EXTRA = [[-52, 17, -28, 34], [25, 17, 52, 34]];
export const inVillage = (x, z, m = 0) => inRect(VILLAGE, x, z, m) || inRect(PLACE, x, z, m) || EXTRA.some((r) => inRect(r, x, z, m));
/** Punulu (the menstruation huts, round) at the village's edges. */
export const PUNULU = [[-61, 19], [58, 17], [-55, -38]];
/** Altars: conical Lébé altars at the lanes' ends and the binu shrine. */
export const ALTARS = [
  { at: [-12.2, 13.4], kind: 'cone' }, { at: [0, -3.6], kind: 'binu' }, { at: [13.2, 15], kind: 'cone' }, { at: [0.2, -19.6], kind: 'cone' },
];
/** The baobabs. */
export const BAOBABS = [{ at: [-34, 41], r: 2.3 }, { at: [46, 28], r: 1.8 }, { at: [66, 6], r: 2.0 }];
/** The millet fields on the plain. */
export const FIELDS = [[-80, 44, 80, 80]];
export const inFields = (x, z, m = 0) => z > 40 && Math.hypot(x, z) < RADIUS - 8;
export const nearBaobab = (x, z, m = 0) => BAOBABS.some((b) => Math.hypot(x - b.at[0], z - b.at[1]) < b.r + m);
