// Timurid Samarkand (c. 1420) — the layout of the settlement (docs/settlements/timurid-samarkand.md §2): the Registan with
// Ulugh Beg's madrasa on its west side and the khanqah on its east, rows of shops north and south; the chorsu and the
// bazaar street south-east; Bibi-Khanym to the north-east (turned to the qibla), Gur-e Amir to the south-west, the
// observatory on its hill to the north-west; round them courtyard houses on lanes with irrigation channels (aryk) and,
// at the edge, orchards. Pure data. Coordinates: metres, +x east, +z south.

export const RADIUS = 330;
export const SQUARE = [-45, -42, 45, 42];
export const MADRASA = [-121, -28, -45, 28];
export const KHANQAH = { rect: [47, -15, 77, 15], portal: [[47, 7], [47, -7]] };
export const SHOPS_N = [-45, -50, 45, -42];
export const SHOPS_S = [-45, 42, 45, 50];
export const CHORSU = { c: [100, 58], r: 12 };
export const BAZAAR = [
  { a: [111.1, 58], b: [200, 58] }, { a: [88.9, 58], b: [50, 58] },
  { a: [100, 46.9], b: [100, 12] }, { a: [100, 69.1], b: [100, 125] },
];
export const BIBI = { c: [140, -110] };
export const GUR = { rect: [-190, 105, -110, 195] };
export const HILL = { c: [-175, -130], plateau: 26, outer: 100, h: 21 };
export const OBS = { c: [-175, -130], r: 23, y: 21 };
export const ARYK_X = [-136, -88, -40, 56, 104, 152, 200, 248];   // aryk lanes run north–south along these lines (the lanes between the lots are centred on x ≡ 2 mod 24 from -330)
export const ARYK_W = 1.2;

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const S2 = Math.SQRT1_2;
/** Is (x, z) in Bibi-Khanym's enclosure (167 × 109 m turned to the qibla), within m? */
export function inBibi(x, z, m = 0) {
  const dx = x - BIBI.c[0], dz = z - BIBI.c[1], u = dx * S2 + dz * S2, v = -dx * S2 + dz * S2;
  return Math.abs(u) <= 54.5 + m && Math.abs(v) <= 83.5 + m;
}
const monumentRects = () => [
  [SQUARE[0] - 3, SQUARE[1] - 12, SQUARE[2] + 3, SQUARE[3] + 12], [MADRASA[0] - 5, MADRASA[1] - 5, MADRASA[2] + 5, MADRASA[3] + 5],
  [KHANQAH.rect[0] - 3, KHANQAH.rect[1] - 3, KHANQAH.rect[2] + 3, KHANQAH.rect[3] + 3], [GUR.rect[0] - 4, GUR.rect[1] - 4, GUR.rect[2] + 4, GUR.rect[3] + 4],
];
/** The bazaar's footprint (street, shops either side) and the chorsu's. */
export function inBazaar(x, z, m = 0) {
  if (Math.hypot(x - CHORSU.c[0], z - CHORSU.c[1]) < CHORSU.r + m + 2) return true;
  for (const { a, b } of BAZAAR) {
    const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
    const horiz = x1 - x0 > z1 - z0;
    if (horiz ? x >= x0 - m && x <= x1 + m && Math.abs(z - a[1]) <= 12.5 + m : z >= z0 - m && z <= z1 + m && Math.abs(x - a[0]) <= 12.5 + m) return true;
  }
  return false;
}
export const onHill = (x, z) => Math.hypot(x - HILL.c[0], z - HILL.c[1]) < HILL.outer + 4;
export function hillHeight(x, z) {
  const d = Math.hypot(x - HILL.c[0], z - HILL.c[1]);
  if (d <= HILL.plateau) return HILL.h;
  if (d >= HILL.outer) return 0;
  const t = (HILL.outer - d) / (HILL.outer - HILL.plateau);
  return HILL.h * t * t * (3 - 2 * t);
}
/** Does an aryk run at (x, z) (within m)? Not through monuments, the bazaar or the hill. */
export function onAryk(x, z, m = 0) {
  if (Math.hypot(x, z) > RADIUS - 30) return false;
  for (const ax of ARYK_X) if (Math.abs(x - ax) <= ARYK_W / 2 + m && !blocked(x, z, 4)) return true;
  return false;
}
function blocked(x, z, m) { return inBibi(x, z, m) || inBazaar(x, z, m) || onHill(x, z) || monumentRects().some((r) => inRect(r, x, z, m)); }

let HOUSES = null;
const touchesRect = (r, q) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1];
/** Does a lot (rect) run into a monument, the bazaar or the hill? Tested at 25 points and against the monuments' rectangles. */
function lotBlocked(r) {
  for (const fx of [0, 0.25, 0.5, 0.75, 1]) for (const fz of [0, 0.25, 0.5, 0.75, 1]) {
    const x = r[0] + (r[2] - r[0]) * fx, z = r[1] + (r[3] - r[1]) * fz;
    if (inBibi(x, z, 3.5) || inBazaar(x, z, 1.5) || onHill(x, z)) return true;
  }
  return monumentRects().some((q) => touchesRect(r, q));
}
/** The town's centres: the Registan and the chorsu (houses near them are furnished in full). */
const CORES = [[0, 0], [100, 58], [-150, 150], [140, -110]];
const nearCore = (x, z) => Math.min(...CORES.map(([a, b]) => Math.hypot(x - a, z - b)));
/**
 * The town: courtyard houses filling the lots between the lanes (a 4 m lane every 24 m, so that the house fronts run on
 * unbroken from lane to lane), round the monuments. Each { rect, seed, k (the street door's side: 0 south, 1 east, 2 north,
 * 3 west), xd (its offset along that wall), garden (a walled orchard with a pavilion instead of a house), full (furnished
 * rooms, a roof stair), rich (two storeys on the street), trade }. Lots touching a monument are left out.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1420), S = 24;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    const j = [rand(), rand(), rand(), rand()], skip = rand() < 0.09, seed = Math.floor(rand() * 1e6), kr = rand(), xr = rand(), tr = rand(), rr = rand();
    const r = [x + 4.2 + j[0] * 0.6, z + 4.2 + j[1] * 0.6, x + 23.8 - j[2] * 0.6, z + 23.8 - j[3] * 0.6], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
    if (far > RADIUS - 70 || lotBlocked(r)) continue;                          // the outer ring is orchards
    const k = kr < 0.45 ? 0 : kr < 0.7 ? 1 : kr < 0.9 ? 3 : 2, nc = nearCore(cx, cz);
    HOUSES.push({ rect: r, seed, k, xd: (xr - 0.5) * 6, garden: skip, full: nc < 135, rich: nc < 120 && rr < 0.45, trade: ['potter', 'baker', 'smith', 'weaver', 'carpenter', 'grocer'][Math.floor(tr * 6)] });
  }
  return HOUSES;
}
/** The house whose court is the one the visitor is led to first (the nearest full house to the bazaar's north street). */
let GRID = null;
export function houseAt(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of houses()) for (let i = Math.floor((h.rect[0] - 3) / 24); i <= Math.floor((h.rect[2] + 3) / 24); i++) for (let j = Math.floor((h.rect[1] - 3) / 24); j <= Math.floor((h.rect[3] + 3) / 24); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 24) + ',' + Math.floor(z / 24));
  return l ? l.find((h) => inRect(h.rect, x, z, m)) : undefined;
}
export const inHouse = (x, z, m = 0) => !!houseAt(x, z, m);
/** A house's local frame: the court's middle, and the point of its tree (planting) — the court lies away from the street door. */
export function houseGeom(h) {
  const [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
  const sw = h.k % 2 === 0, lw = sw ? W : D, ld = sw ? D : W;      // the local width and depth
  const th = h.k * Math.PI / 2, c = Math.round(Math.cos(th)), s = Math.round(Math.sin(th));
  const toWorld = (u, v) => [cx + u * c + v * s, cz - u * s + v * c];
  const SP = ['mulberry', 'apple', 'fig', 'mulberry', 'jujube'], sp = (i) => SP[(h.seed + i) % SP.length];
  const trees = h.garden
    ? [[-7, -6.5], [0, -7], [7, -6.5], [-7.5, 5], [7.5, 5], [-7.5, 0], [7.5, 0]].map(([u, v], i) => ({ at: toWorld(u, v), kind: sp(i) }))
    : [{ at: toWorld(0, -ld / 2 + 6.5), kind: sp(0) }];
  return { cx, cz, W: lw, D: ld, toWorld, trees };
}
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const built = (x, z, m = 0) => blocked(x, z, m) || inHouse(x, z, m);
