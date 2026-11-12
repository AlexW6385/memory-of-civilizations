// Umayyad Jerusalem about 700 — the layout (docs/settlements/jerusalem.md §2): the Haram al-Sharif,
// the great esplanade on its retaining walls (compressed to 300 × 400 m), with the Dome of the Rock
// on its platform north of the middle and the al-Aqsa mosque at the south end; the Kidron valley
// falling away on the east; the Tyropoeon valley on the west and the city climbing beyond it to
// the Church of the Holy Sepulchre. Pure data. +x east, +z south.

export const RADIUS = 420;
export const HARAM = { rect: [-150, -200, 150, 200], top: 14 };
export const AQSA = [-40, 118, 40, 194];
/** The Umayyad palaces south of the Haram (§4c): al-Walid's palace with its bridge to the Haram, a pillared building east of it. */
export const PALACES = [{ rect: [-110, 214, -26, 310], gates: ['e', 'w'], bridge: { x0: -45.5, x1: -41.5 } }, { rect: [-12, 216, 72, 290], gates: ['w', 'e'], piers: true, ring: 12, portico: 4 }];
/** The Haram's gates (§4b): the Double and Triple Gates in the south wall, the Golden Gate in the east. */
export const HGATES = { double: -12, triple: 60, golden: -35 };
/** The Church of the Holy Sepulchre: from its propylaea on the Cardo west to the Anastasis (§1a). */
export const SEPULCHRE = [-366, -112, -247, -52];
/** The Cardo, the colonnaded street from the north gate to the south gate: roadway, porticoes, shops (§4a). */
export const CARDO = { x: -230, road: 12.5, portico: 5, shops: 5.5, z0: -298, z1: 296 };
export const CARDO_HALF = CARDO.road / 2 + CARDO.portico + CARDO.shops;
/** The city wall: an arc round the west from the Haram's north-east to its south-east, the Haram's east wall closing it (§4a). */
export const WALL = { r: 380, east: 151.5 };
/** The gates: the north gate (the Damascus Gate, Hadrian's arch) at the head of the Cardo, the west gate on the street to the Haram, the south gate at the Cardo's foot. */
export const GATES = [
  { id: 'north', at: [CARDO.x, -Math.sqrt(WALL.r ** 2 - CARDO.x ** 2)], kind: 'triple' },
  { id: 'west', at: [-WALL.r, 0], kind: 'single' },
  { id: 'south', at: [CARDO.x, Math.sqrt(WALL.r ** 2 - CARDO.x ** 2)], kind: 'single' },
];
/** The market street from the west gate to the Haram's stair (§4e): its roadway, and the shop rows either side of it (x ranges clear of the Cardo's own shops). */
export const STREET = { road: 4.6, portico: 2.6, shops: 5.5, shopW: 4.5, spans: [[-362, -248], [-212.5, -180]], half: 14.5, x0: -366, x1: -176 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const west = (x) => 6 + 18 * smooth(-170, -390, x);
/** The level of the Holy Sepulchre's terrace (its east end reached by a stair up from the Cardo). */
export const SEP_Y = 6 + 18 * smooth(-170, -390, -300);
export const SEP_STAIR = 17;
export const CARDO_Y = 6 + 18 * smooth(-170, -390, CARDO.x);
export function height(x, z) {
  if (inRect(HARAM.rect, x, z)) return HARAM.top;
  let h = west(x);
  if (inRect(SEPULCHRE, x, z, 8) && x < SEPULCHRE[2] - 1) {
    // the terrace of the church west of its stair, and the stair's slope up from the Cardo
    const sx = SEPULCHRE[2] - SEP_STAIR, top = x <= sx ? SEP_Y : CARDO_Y + (SEP_Y - CARDO_Y) * (SEPULCHRE[2] - x) / SEP_STAIR - 0.3;
    const d = Math.max(SEPULCHRE[0] - x, SEPULCHRE[1] - z, z - SEPULCHRE[3], 0);
    return (h + (top - h) * smooth(8, 0, d)) * (1 - smooth(RADIUS - 60, RADIUS - 5, Math.hypot(x, z)));
  }
  // the Cardo runs level across the slope, terraced into it
  { const d = Math.abs(x - CARDO.x); if (d < CARDO_HALF + 8) h += (west(CARDO.x) - h) * smooth(CARDO_HALF + 8, CARDO_HALF + 1, d); }
  if (x > 150) h = 6 - 30 * smooth(155, 245, x) + 24 * smooth(270, 400, x); // the Kidron valley, the slope of the Mount of Olives
  return h * (1 - smooth(RADIUS - 60, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null, GARDENS = null, GRID = null, GGRID = null, ARCHES = null;
const key = (i, j) => i + ',' + j;
/** Courtyard houses west and south of the Haram; the cells the dice or the slope left are gardens (gardens()). */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; GARDENS = []; GRID = new Map(); GGRID = new Map();
  const rand = rng(700);
  let i = 0;
  for (let x = -RADIUS + 20; x < 150; x += 17, i++) {
    let j = 0;
    for (let z = -RADIUS + 20; z < RADIUS - 20; z += 16, j++) {
      const w = 12 + rand() * 4, d = 12 + rand() * 3, cx = x + w / 2, cz = z + d / 2;
      const corners = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]];
      if (corners.some(([a, b]) => Math.hypot(a, b) > WALL.r - 5) || x + w > WALL.east - 6 || inRect(HARAM.rect, cx, cz, 16) || inRect(SEPULCHRE, cx, cz, 14) || PALACES.some((p) => inRect(p.rect, cx, cz, 14))
        || (z < STREET.half && z + d > -STREET.half && x + w > STREET.x0 && x < STREET.x1) || (z < 5 && z + d > -5) || (x < CARDO.x + CARDO_HALF + 1 && x + w > CARDO.x - CARDO_HALF - 1) || GATES.some((g) => Math.hypot(g.at[0] - cx, g.at[1] - cz) < 28)) continue;
      const skip = rand() < 0.15, kind = rand(), seed = Math.floor(rand() * 1e6);
      const ys = corners.map(([a, b]) => height(a, b)), steep = Math.max(...ys) - Math.min(...ys) > 2.5;
      if (skip || steep) {
        // a garden: terraced olives on a slope, else an orchard, a yard with its beasts, or a fallen house
        const g = { rect: [x, z, x + w, z + d], seed, y: Math.min(...ys), kind: steep ? 'terrace' : kind < 0.45 ? 'orchard' : kind < 0.8 ? 'yard' : 'ruin' };
        GARDENS.push(g); GGRID.set(key(i, j), g); continue;
      }
      const lot = { rect: [x, z, x + w, z + d], seed, y: Math.min(...ys), cell: [i, j] };
      LOTS.push(lot); GRID.set(key(i, j), lot);
    }
  }
  // the lanes: the gap to the next lot south (gs) and east (gx), for the doors' lanes and the arches over them
  for (const l of LOTS) {
    const [i, j] = l.cell, s = GRID.get(key(i, j + 1)), e = GRID.get(key(i + 1, j));
    l.gs = s ? s.rect[1] - l.rect[3] : 99; l.gx = e ? e.rect[0] - l.rect[2] : 99;
  }
  return LOTS;
}
export function gardens() { lots(); return GARDENS; }
const near = (map, x, z, m) => {
  const i = Math.floor((x + RADIUS - 20) / 17), j = Math.floor((z + RADIUS - 20) / 16);
  for (const [a, b] of m > 0 ? [[i, j], [i - 1, j], [i, j - 1], [i - 1, j - 1], [i + 1, j], [i, j + 1]] : [[i, j]]) { const l = map.get(key(a, b)); if (l && inRect(l.rect, x, z, m)) return l; }
  return null;
};
export const lotAt = (x, z, m = 0) => { lots(); return near(GRID, x, z, m); };
export const gardenAt = (x, z, m = 0) => { lots(); return near(GGRID, x, z, m); };
export const inLot = (x, z, m = 0) => !!lotAt(x, z, m);
/** The lanes worth an arch: between two lots side by side (gap 1.8 … 4.4 m), every third one, with the z of the arch's middle. */
export function laneArches() {
  if (ARCHES) return ARCHES;
  ARCHES = [];
  let n = 0;
  for (const l of lots()) {
    if (l.gx < 1.8 || l.gx > 4.4) continue;
    const [i, j] = l.cell, e = GRID.get(key(i + 1, j)), z0 = Math.max(l.rect[1], e.rect[1]), z1 = Math.min(l.rect[3], e.rect[3]);
    if (z1 - z0 < 6 || Math.abs(l.rect[2] - CARDO.x) < 40 || (l.rect[2] > -190 && Math.abs((z0 + z1) / 2) < 30) || (n++ % 3)) continue;
    ARCHES.push({ x0: l.rect[2], x1: e.rect[0], z: (z0 + z1) / 2 });
  }
  return ARCHES;
}
