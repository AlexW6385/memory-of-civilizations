// Manueline Lisbon about 1520 — the layout (docs/settlements/manueline-lisbon.md §2). North is up (-z); the Tagus lies to the
// south. West to east in their true order: the Belém Tower in the water and the Jerónimos monastery on its plaza; the Ribeira
// palace, the Terreiro do Paço and the Ribeira das Naus shipyard along the quay; the Rua Nova dos Mercadores behind them; the
// Alfama hill in the north-east with the Sé on its foot and the castle on its crown. Compressed from 7 km to this disc.
// Pure data. +x east, +z south.

export const RADIUS = 330;
export const SEA = -1.6, RIM = -10, GROUND = 1.4;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

/** The shore: z of the waterline at x (the shallow bay at Belém to the west). */
export const shore = (x) => 100 + 30 * smooth(-60, -160, x);
export const HILL = { c: [170, -150], R: 170, h: 40 };          // the Alfama hill, the castle on its crown
export const AJUDA = { c: [-120, -250], R: 150, h: 18 };         // the rise behind Belém

// the Jerónimos: church (east–west, south portal on the plaza), cloister north of it, the monastery's ranges round
export const CHURCH = [-240, 14, -168, 41];
export const CLOISTER = [-221, -41, -166, 14];
export const PORTAL_X = -206;
export const MONASTERY = [-240, -56, -147, 41];
export const PLAZA = [-262, 41, -120, 120];
export const TOWER = { c: [-245, 162], deck: 1.6 };               // the Belém Tower on its bastion in the river
export const CAUSEWAY = [TOWER.c[0] - 11 - 1.6, 118, TOWER.c[0] - 11 + 1.6, TOWER.c[1] - 6];
// the palace, the square, the yard
export const PALACE = [-40, 28, 40, 98];
export const TERREIRO = [40, 24, 150, 100];
export const YARD = [150, 30, 262, 100];
export const QUAY = [-120, 96.5, 262, 100];
export const RUA_NOVA = [-130, -8.5, 250, -0.5];
export const SE = [34, -98, 80, -62];
export const CASTLE = [145, -178, 197, -126];
export const SQUARE = [-100, -60, -60, -10];                       // a small square with the pelourinho and a fountain

export const ZS = [-260, -208, -156, -104, -52, -8.5];             // the cross streets between the house rows (north of Rua Nova)
export const ALLEYS = [-300, -150, -95, -20, 22, 120, 170, 215, 255];
const RESERVED = [MONASTERY, PLAZA, PALACE, TERREIRO, YARD, SE, CASTLE, SQUARE, [-190, 41, -120, 128]];

function wetRaw(x, z) { return shore(x) - z; }
/** How far onto land (negative in the water). */
export function wet(x, z) { return Math.min(wetRaw(x, z), RADIUS - 60 - Math.hypot(x, z)); }
export const inWater = (x, z) => wet(x, z) < -0.5;
export function height(x, z) {
  const w = wetRaw(x, z), r = Math.hypot(x, z), b = smooth(-100, -150, x);
  const quayH = w > 0.5 ? GROUND : w > -0.5 ? GROUND + (SEA - 2 - GROUND) * smooth(0.5, -0.5, w) : SEA - 2;
  const beachH = GROUND + (SEA - 2 - GROUND) * smooth(8, -4, w);
  let h = quayH * (1 - b) + beachH * b;
  if (w > 2) {
    h += HILL.h * smooth(HILL.R, HILL.R * 0.15, Math.hypot(x - HILL.c[0], z - HILL.c[1]));
    h += AJUDA.h * smooth(AJUDA.R, AJUDA.R * 0.2, Math.hypot(x - AJUDA.c[0], z - AJUDA.c[1]));
  }
  return r > RADIUS - 60 ? h + (RIM - h) * smooth(RADIUS - 60, RADIUS - 10, r) : h;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let LOTS = null;
/** The houses: rows between the cross streets, each facing one; { rect, seed, y, plinth, front, kind ('merchant' | 'alfama' | 'fisher'), w, d }. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1520);
  // [z0, z1, mode]: mode 'two' = two rows back to back, 'n' = one row facing the street on its north, 's' = on its south
  const bands = [[-256, -212, 'two'], [-204, -160, 'two'], [-152, -108, 'two'], [-100, -56, 'two'], [-48, -12, 'two'], [-0.5 + 4, 22, 'n'], [26, 92, 'two']];
  for (const [za, zb, mode] of bands) {
    
    const rows = mode === 'two' ? [[za, (za + zb) / 2 - 0.3, 'n'], [(za + zb) / 2 + 0.3, zb, 's']] : [[za, zb, mode]];
    for (const [z0, z1, face] of rows) {
      for (let x = -300; x < 290;) {
        const alfama = x > 20 && z0 < -40;
        const w = alfama ? 4.5 + Math.floor(rand() * 4) : 7 + Math.floor(rand() * 5), d = z1 - z0, cx = x + w / 2, cz = (z0 + z1) / 2;
        const rect = [x, z0, x + w, z1];
        x += w + (alfama ? 0.4 : rand() < 0.2 ? 1.5 : 0.4);
        if (ALLEYS.some((a) => Math.abs(cx - a) < w / 2 + 2.6)) continue;
        if (RESERVED.some((r) => inRect(r, cx, cz, 4) || inRect(r, rect[0], cz, 2) || inRect(r, rect[2], cz, 2))) continue;
        if (Math.hypot(cx, cz) > RADIUS - 72 || Math.hypot(rect[0], cz) > RADIUS - 70 || Math.hypot(rect[2], cz) > RADIUS - 70) continue;
        if (wet(rect[0], z1) < 3 || wet(rect[2], z1) < 3) continue;
        if (rand() < 0.05) continue;
        const ys = [[rect[0], z0], [rect[2], z0], [rect[0], z1], [rect[2], z1]].map(([a, b]) => height(a, b));
        const lo = Math.min(...ys), hi = Math.max(...ys);
        if (hi - lo > 5) continue;
        const kind = alfama ? 'alfama' : cx < -130 ? 'fisher' : 'merchant';
        LOTS.push({ rect, seed: Math.floor(rand() * 1e6), y: lo, plinth: hi - lo + 0.6, front: face, kind, w, d });
      }
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** The street: the cross streets, the alleys, Rua Nova, the quay walk, the open squares. */
export function onStreet(x, z, m = 0) {
  if (wet(x, z) < 0.5) return false;
  if (inRect(RUA_NOVA, x, z, m) || inRect(QUAY, x, z, m) || inRect(TERREIRO, x, z) || inRect(PLAZA, x, z) || inRect(SQUARE, x, z)) return true;
  if (ZS.some((s) => Math.abs(z - s) < 3.4 + m) || ALLEYS.some((a) => Math.abs(x - a) < 2.4 + m)) return !inLot(x, z, -0.1);
  return false;
}

/** The ships at anchor and at the quay: carracks (nau), caravels, lateen boats. at [x, z], rot (yaw: 0 = bow to −z), len. */
export const SHIPS = [
  { kind: 'carrack', at: [-20, 150], rot: 0.15, len: 34, seed: 1 }, { kind: 'carrack', at: [60, 172], rot: -0.3, len: 38, seed: 2 },
  { kind: 'carrack', at: [130, 160], rot: 0.5, len: 32, seed: 3 }, { kind: 'carrack', at: [215, 150], rot: -0.1, len: 36, seed: 4 },
  { kind: 'carrack', at: [-95, 190], rot: 0.9, len: 30, seed: 5 }, { kind: 'carrack', at: [25, 215], rot: 0.2, len: 40, seed: 6 },
  { kind: 'caravel', at: [-60, 140], rot: -0.6, len: 21, seed: 7 }, { kind: 'caravel', at: [95, 135], rot: 0.1, len: 20, seed: 8 },
  { kind: 'caravel', at: [180, 190], rot: 0.7, len: 22, seed: 9 }, { kind: 'caravel', at: [-150, 186], rot: 0.3, len: 20, seed: 10 },
  { kind: 'barca', at: [-30, 106], rot: Math.PI / 2, len: 9, seed: 11 }, { kind: 'barca', at: [10, 106], rot: Math.PI / 2 + 0.1, len: 9, seed: 12 },
  { kind: 'barca', at: [75, 106], rot: Math.PI / 2, len: 10, seed: 13 }, { kind: 'barca', at: [112, 106], rot: Math.PI / 2 - 0.1, len: 9, seed: 14 },
  { kind: 'barca', at: [-180, 133], rot: 1.2, len: 8, seed: 15 }, { kind: 'barca', at: [-150, 134], rot: 0.9, len: 8, seed: 16 }, { kind: 'barca', at: [-120, 112], rot: 1.4, len: 8, seed: 17 },
];
/** The ship being built on the stocks in the yard: hulls lying on their slips (rects). */
export const SLIPS = [[158, 62, 196, 74, 'n'], [158, 80, 200, 92, 'n'], [212, 56, 250, 68, 'n']];
