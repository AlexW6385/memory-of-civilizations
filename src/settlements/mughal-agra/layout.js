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
// the raised walks of the garden's quarters: each quarter (from the axial walks at 12 m to the walls) cut by three walks
// each way into sixteen sunken beds; a walk round the inside of the walls. Centres (m from the axis), half-width 1.5.
export const GWALKS = [46, 80, 114], GW = 1.5, GRIM = 145;
/** Distance from (x, z) to the nearest edge of a garden walk (negative on one). */
export function walkDist(x, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  let d = Math.min(ax - 12, az - 12, GRIM - 2 - ax, GRIM - 2 - az);
  for (const c of GWALKS) d = Math.min(d, Math.abs(ax - c) - GW, Math.abs(az - c) - GW);
  return d;
}
// the Taj Ganj's two northern caravanserais either side of the bazaar street on the axis (docs/settlements/mughal-agra.md
// §11): Katra Omar Khan on the north-west, Katra Fulel (the perfume market) on the north-east, their gates on the street;
// and an open, furnished house on the street south of them
export const KATRAS = [{ id: 'omar-khan', rect: [-58, 235, -14, 266], gate: 'e' }, { id: 'fulel', rect: [14, 235, 58, 266], gate: 'w' }];
export const HAVELI_OPEN = [8, 277, 30, 299];
// the pietra dura workshop on the axis street's west side, its front on the street (§12)
export const WORKSHOP = { rect: [-20, 281, -8, 293], front: 'e' };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// the town's streets (rects [x0, z0, x1, z1]): the bazaar street on the axis from the forecourt's gate, the cross street
// beyond the katras, the bazaar streets running out from the forecourt's east and west gates, and the two streets
// north–south at the town's east and west; `bazaar`: lined with shops (docs/settlements/mughal-agra.md §12)
export const STREETS = [
  { id: 'axis', rect: [-8, 232, 8, RADIUS], bazaar: true },
  { id: 'cross', rect: [-RADIUS, 266, RADIUS, 274], bazaar: true },
  { id: 'ew-w', rect: [-RADIUS, 195.5, -170, 204.5], bazaar: true },
  { id: 'ew-e', rect: [170, 195.5, RADIUS, 204.5], bazaar: true },
  { id: 'ns-w', rect: [-205, -226, -195, RADIUS], bazaar: false },
  { id: 'ns-e', rect: [195, -226, 205, RADIUS], bazaar: false },
];
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** Distance from (x, z) to the nearest street's edge (0 on one). */
export const streetDist = (x, z) => Math.min(...STREETS.map((s) => rectDist(s.rect, x, z)));
export const onStreet = (x, z, m = 0) => STREETS.some((s) => inRect(s.rect, x, z, m));

let HOUSES = null;
/**
 * Taj Ganj: the houses stand shoulder to shoulder along the streets, their fronts on them (the bazaar streets' ground
 * floors open shops), and more loosely behind and east and west of the garden, each turned to its nearest street.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1632), KEEP = [[-176, -262, 176, 232], ...KATRAS.map((k) => k.rect), HAVELI_OPEN, WORKSHOP.rect];
  const far = (r) => Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
  const free = (r, m) => far(r) <= RADIUS - 24 && r[3] > RIVER_Z + 30 && !KEEP.some((q) => r[0] < q[2] + m && r[2] > q[0] - m && r[1] < q[3] + m && r[3] > q[1] - m)
    && !STREETS.some((s) => r[0] < s.rect[2] + 0.2 && r[2] > s.rect[0] - 0.2 && r[1] < s.rect[3] + 0.2 && r[3] > s.rect[1] - 0.2)
    && !HOUSES.some((h) => r[0] < h.rect[2] + 0.1 && r[2] > h.rect[0] - 0.1 && r[1] < h.rect[3] + 0.1 && r[3] > h.rect[1] - 0.1);
  const add = (rect, front, bazaar) => {
    const shop = bazaar ? rand() < 0.9 : rand() < 0.3;
    HOUSES.push({ rect, front, shop, storeys: shop && rand() < 0.5 ? 2 : undefined, seed: Math.floor(rand() * 1e6) });
  };
  // along each street, on both sides, lot after lot
  for (const s of STREETS) {
    const [x0, z0, x1, z1] = s.rect, alongZ = z1 - z0 > x1 - x0;
    for (const side of [-1, 1]) {
      const a0 = alongZ ? z0 : x0, a1 = alongZ ? z1 : x1;
      for (let t = a0; t < a1 - 4;) {
        const w = 5.5 + rand() * 4.5, d = 10 + rand() * 3;
        const r = alongZ ? (side < 0 ? [x0 - d, t, x0, t + w] : [x1, t, x1 + d, t + w]) : (side < 0 ? [t, z0 - d, t + w, z0] : [t, z1, t + w, z1 + d]);
        const front = alongZ ? (side < 0 ? 'e' : 'w') : (side < 0 ? 's' : 'n');
        if (free(r, 1.2)) add(r, front, s.bazaar); 
        t += w + 0.12;
      }
    }
  }
  // behind them and round the garden: houses on a loose grid, facing the nearest street
  for (let x = -330; x < 330; x += 14) for (let z = -230; z < 340; z += 14) {
    const r = [x + 1, z + 1, x + 1 + 9 + rand() * 3, z + 1 + 9 + rand() * 3];
    if (rand() < 0.05 || !free(r, 4)) continue;
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    let best = null, bd = 1e9;
    for (const s of STREETS) { const d = rectDist(s.rect, cx, cz); if (d < bd) { bd = d; best = s; } }
    const sr = best.rect, dx = cx < sr[0] ? sr[0] - cx : cx > sr[2] ? cx - sr[2] : 0, dz = cz < sr[1] ? sr[1] - cz : cz > sr[3] ? cz - sr[3] : 0;
    const front = dx > dz ? (cx < sr[0] ? 'e' : 'w') : (cz < sr[1] ? 's' : 'n');
    add(r, front, false);
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
