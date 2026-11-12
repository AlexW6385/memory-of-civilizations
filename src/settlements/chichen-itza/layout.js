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
    if (rand() < 0.1) continue;                                                        // forest between the lots
    const mx = (r[0] + r[2]) / 2, mz = (r[1] + r[3]) / 2, houses = [], n = 2 + Math.floor(rand() * 3);
    // the long house of a better family, in the lots nearer the plaza: its front toward the lot's middle
    let range = null;
    if (Math.hypot(mx, mz) < 270 && rand() < 0.5) {
      const rot = [0, Math.PI, Math.PI / 2, Math.PI * 1.5][Math.floor(rand() * 4)], a = 6.2, b = 2.4, along = rand(), across = rand();
      const ux = r[0] + 9 + along * (r[2] - r[0] - 18), uz = r[1] + 9 + along * (r[3] - r[1] - 18);
      const cx = rot === 0 || rot === Math.PI ? ux : r[0] + (rot === Math.PI / 2 ? 5 + across * 2 : 9 + across * 2) + 1.5, cz = rot === Math.PI / 2 || rot === Math.PI * 1.5 ? uz : r[1] + (rot === 0 ? 5 + across * 2 : 9 + across * 2) + 1.5;
      range = { c: [cx, cz], a, b, rot, seed: Math.floor(rand() * 1e6) };
    }
    for (let i = 0; i < n * 2 && houses.length < n; i++) {
      const a = 3.6 + rand() * 1.4, b = 2.3 + rand() * 0.6, dir = rand() < 0.5 ? 'x' : 'z';
      const cx = r[0] + 6 + rand() * (r[2] - r[0] - 12), cz = r[1] + 6 + rand() * (r[3] - r[1] - 12);
      if (houses.some((h) => Math.hypot(h.c[0] - cx, h.c[1] - cz) < 9.5)) continue;
      if (range && Math.hypot(range.c[0] - cx, range.c[1] - cz) < 11 + a * 0.4) continue;
      houses.push({ c: [cx, cz], a, b, dir, seed: Math.floor(rand() * 1e6) });
    }
    LOTS.push({ rect: r, houses, range, gate: Math.floor(rand() * 4), level: Math.hypot(mx, mz) < 210 ? 1 : Math.hypot(mx, mz) < 260 ? 0.6 : 0.35, seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
export const nearHouse = (x, z, m) => lots().some((l) => l.houses.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.a + m) || (l.range && Math.hypot(l.range.c[0] - x, l.range.c[1] - z) < 9.5 + m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** The stelae and the small altars set about the Great Plaza (clear of the buildings): where, turned how. */
export const PLAZA_STELAE = [[-9, 50, 0], [9, 50, 0.1], [52, 30, 0.4], [-62, 22, -0.3], [32, -84, 0], [-34, -98, 0.2], [74, -72, 0], [18, -112, 0], [-84, -80, 0.3], [140, -70, 0]];
export const PLAZA_SHRINES = [[-42, 52, 0], [47, 46, 0], [76, 20, Math.PI / 2], [58, -104, 0], [-72, -104, 0], [-18, -116, 0], [-90, 100, 0], [20, 98, 0]];
export const CEIBAS = [[-122, 62], [150, -92], [62, 102], [-8, 106], [38, -262], [-35, -268], [-150, -120], [160, 100]];
export const SWEATBATH = { at: [27, -243], rot: 0 };
/** Rectangles the plaza's wear leaves alone (the buildings' feet). */
export const WEAR_SKIP = [[-37, -37, 37, 37], [-135, -112, -95, 40], [86, -40, 136, 10], [60, -38, 88, 10], [82, 26, 166, 48], [144, -38, 166, 30], [-23, -87, 23, -41], [-70, -58, -46, -34], [-58, -22, -38, -2], [-80, 36, -20, 112]];
