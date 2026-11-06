// Venice about 1500 — the layout (docs/settlements/venice.md §2): islands in the lagoon. The Piazza
// San Marco with the basilica at its east end, the campanile, the Procuratie along its sides; the
// Piazzetta opening south to the water between the two columns, the Doge's Palace on its east side;
// the Grand Canal curving through the west; smaller canals; houses on every island; the lagoon
// round the disc's edge. Pure data. +x east, +z south (the basin of San Marco to the south).

export const RADIUS = 380;
export const SEA = -2.5, RIM = -10, GROUND = 1.2;
export const PIAZZA = [-150, -40, 25, 30];
export const PIAZZETTA = [25, 30, 76, 118];
export const BASILICA = { c: [62, -5], s: 34, w: 22 };
export const CAMPANILE = [12, 22];
export const CLOCK = [6, -50, 14.5, -40];                      // the Clock Tower (1496–99) over the way into the Merceria
export const MERCERIA = [4, -120, 17, -48];                    // the first stretch of the Merceria behind it, kept clear
export const PALACE = [80, 32, 150, 100];
export const BASIN_Z = 122;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }
const GRAND = [[-120, 125], [-190, 40], [-200, -80], [-140, -190], [-160, -300], [-260, -380]];
const CANALS = [[[-30, 125], [-40, -60], [-20, -200]], [[100, -40], [160, -160]], [[-300, 60], [-380, -60]], [[-60, -120], [-190, -120]], [[150, -40], [300, -60]]];
const pathD = (x, z, p) => { let d = Infinity; for (let i = 0; i + 1 < p.length; i++) d = Math.min(d, segDist(x, z, p[i], p[i + 1])); return d; };
/** How far into water (negative inside a canal or the basin). */
export function wet(x, z) {
  const d = Math.min(pathD(x, z, GRAND) - 20, ...CANALS.map((p) => pathD(x, z, p) - 5), BASIN_Z - z, RADIUS - 60 - Math.hypot(x, z));
  return inRect(PIAZZA, x, z) || inRect(PIAZZETTA, x, z, 0) && z < BASIN_Z - 2 ? Math.max(d, 1) : d;
}
export function height(x, z) {
  const w = wet(x, z), r = Math.hypot(x, z);
  const h = w > 1.5 ? GROUND : w > -1 ? GROUND + (SEA - 2 - GROUND) * smooth(1.5, -1, w) : SEA - 2;
  return r > RADIUS - 60 ? h + (RIM - h) * smooth(RADIUS - 60, RADIUS - 10, r) : h;
}
export const inWater = (x, z) => wet(x, z) < -0.5;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1500);
  for (let x = -RADIUS + 40; x < RADIUS - 40; x += 11) for (let z = -RADIUS + 40; z < BASIN_Z; z += 11) {
    const w = 8 + rand() * 2, d = 8 + rand() * 2;
    if ([[x, z], [x + w, z], [x, z + d], [x + w, z + d]].some(([a, b]) => wet(a, b) < 2.5)) continue;
    const cx = x + w / 2, cz = z + d / 2;
    if (inRect(PIAZZA, cx, cz, 8) || inRect(PIAZZETTA, cx, cz, 6) || inRect(PALACE, cx, cz, 6) || inRect([BASILICA.c[0] - 50, BASILICA.c[1] - 35, BASILICA.c[0] + 45, BASILICA.c[1] + 35], cx, cz) || Math.abs((cx + 400) % 44 - 22) < 2 || rand() < 0.1) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: GROUND, foot: GROUND - 0.5, storeys: 3 + (rand() < 0.5 ? 1 : 0), front: rand() < 0.5 ? 'n' : 's', plaster: true });
  }
  LOTS = LOTS.filter((l) => !inRect(MERCERIA, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2, 4));   // after the draw: the other lots stay as they were
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
