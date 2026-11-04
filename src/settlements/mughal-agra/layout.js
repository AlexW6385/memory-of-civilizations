// Mughal Agra (1632–1653) — the layout of the settlement (docs/settlements/mughal-agra.md §2): the
// Taj Mahal complex on its north–south axis — the riverfront terrace on the Yamuna with the
// mausoleum on its plinth, the mosque and its twin; the charbagh garden with its channels and pool;
// the great gate; the forecourt (jilaukhana) — and south of it the town of Taj Ganj. Pure data.
// Coordinates: metres, +x east, +z south; the river on the north (−z).

export const RADIUS = 360;
export const RIVER_Z = -262;                          // the Yamuna's bank
export const TERRACE = { rect: [-150, -258, 150, -148], y: 1.5 };
export const PLINTH = { c: [0, -203], a: 47.5, y: 7.2 };   // 95 m square, 6.7 m above the terrace
export const GARDEN = [-150, -148, 150, 150];
export const GATE = { c: [0, 157], w: 40, d: 30, h: 30 };
export const FORECOURT = [-125, 172, 125, 228];
export const POOL = { c: [0, 0], a: 14 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/** Taj Ganj: houses along bazaar streets south of the forecourt, and east and west of the garden. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1632);
  for (let x = -330; x < 330; x += 14) for (let z = -230; z < 340; z += 14) {
    const r = [x + 1, z + 1, x + 1 + 9 + rand() * 3, z + 1 + 9 + rand() * 3];
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
    if (far > RADIUS - 24 || cz < RIVER_Z + 30) continue;
    if (inRect([-172, -262, 172, 232], cx, cz, 4)) continue;                 // the Taj complex and its walls
    if (Math.abs(cx) < 9 && cz > 230) continue;                              // the bazaar street on the axis
    if ((Math.abs(cz - 270) < 6 || Math.abs(cx - 200) < 5 || Math.abs(cx + 200) < 5)) continue;   // streets
    if (rand() < 0.18) continue;
    HOUSES.push({ rect: r, seed: Math.floor(rand() * 1e6) });
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
