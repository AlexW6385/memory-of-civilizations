// Chichén Itzá (c. 1000) — the layout of the settlement (docs/settlements/chichen-itza.md §2):
// the Great Plaza with the Castillo (the Temple of Kukulcán) in its middle, the Great Ball Court to
// the west, the Temple of the Warriors and the Group of the Thousand Columns to the east, the
// Platform of Venus and the Tzompantli; a white road (sacbe) north to the Sacred Cenote; round the
// plaza, house lots (solares) walled with dry stone, each with its oval houses, in the dry forest.
// Pure data. Coordinates: metres, +x east, +z south.

export const RADIUS = 340;
export const PLAZA = [-150, -140, 170, 120];
export const CENOTE = { c: [0, -272], r: 30, water: -20, bed: -34 };
export const SACBE = { a: [0, -140], b: [0, -240], w: 6 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const cenoteDist = (x, z) => Math.hypot(x - CENOTE.c[0], z - CENOTE.c[1]) - CENOTE.r;
export const onSacbe = (x, z, m = 0) => Math.abs(x - SACBE.a[0]) < SACBE.w / 2 + m && z < SACBE.a[1] + m && z > SACBE.b[1] - m;

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let LOTS = null;
/** House lots { rect, houses: [{ c, a, b, dir, seed }], gate } round the plaza, none on the sacbe or by the cenote. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(987);
  for (let x = -330; x < 330; x += 34) for (let z = -330; z < 330; z += 34) {
    const r = [x + 2, z + 2, x + 30 + rand() * 2, z + 30 + rand() * 2];
    const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
    if (far > RADIUS - 24 || inRect(PLAZA, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 22)) continue;
    if (Math.abs((r[0] + r[2]) / 2) < 26 && (r[1] + r[3]) / 2 < -120) continue;     // the sacbe's corridor
    if (cenoteDist((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) < 30) continue;
    if (rand() < 0.22) continue;                                                       // forest between the lots
    const houses = [], n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = 3.6 + rand() * 1.4, b = 2.3 + rand() * 0.6, dir = rand() < 0.5 ? 'x' : 'z';
      const cx = r[0] + 7 + rand() * (r[2] - r[0] - 14), cz = r[1] + 7 + rand() * (r[3] - r[1] - 14);
      if (houses.some((h) => Math.hypot(h.c[0] - cx, h.c[1] - cz) < 10)) continue;
      houses.push({ c: [cx, cz], a, b, dir, seed: Math.floor(rand() * 1e6) });
    }
    LOTS.push({ rect: r, houses, gate: Math.floor(rand() * 4) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
export const nearHouse = (x, z, m) => lots().some((l) => l.houses.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.a + m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
