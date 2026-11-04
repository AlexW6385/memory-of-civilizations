// Baroque Rome about 1670 — the layout (docs/settlements/baroque-rome.md §2): St Peter's at the west
// facing east, Bernini's piazza before it — the straight piazza retta and the oval with its two
// colonnades, the obelisk and two fountains; the Vatican Palace to the north; the Borgo's houses to
// the east between the Borgo Vecchio and Borgo Nuovo, the Passetto wall running to Castel
// Sant'Angelo; the Tiber and the Ponte Sant'Angelo; the Vatican gardens on the rising ground west.
// Distances compressed (the Borgo is ~900 m long). Pure data. +x east, +z south.

export const RADIUS = 380;
export const CROSSING = [-210, 0];
export const FRONT_X = -82;                                  // the east front of the basilica
export const OVAL = { c: [40, 0], ax: 70, bz: 95 };
export const RETTA = [-78, -50, -28, 50];
export const PALACE = [-150, -175, -70, -112];
export const SISTINE = [-205, -138, -165, -118];
export const CASTEL = { c: [172, -60], r: 22 };
export const TIBER = { x: 268, w: 64, level: -5, bed: -8 };
export const BORGO = [-14, 14];                              // the Borgo Nuovo and Borgo Vecchio (z)
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const tiberX = (z) => TIBER.x + 14 * Math.sin(z / 110);
export const inTiber = (x, z) => Math.abs(x - tiberX(z)) < TIBER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 55;
export const inOval = (x, z, m = 0) => ((x - OVAL.c[0]) / (OVAL.ax * 1.18 + m)) ** 2 + ((z - OVAL.c[1]) / (OVAL.bz * 1.15 + m)) ** 2 < 1;
export const inBasilica = (x, z, m = 0) => inRect([CROSSING[0] - 70, -75, FRONT_X + 10, 75], x, z, m);
export function height(x, z) {
  const d = Math.abs(x - tiberX(z)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  const river = TIBER.bed * smooth(TIBER.w / 2 + 6, TIBER.w / 2 - 6, d);
  const hill = 9 * smooth(-290, -400, x);
  return (river + hill) * (1 - edge);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1667);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 12) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 12) {
    const w = 9 + rand() * 2, d = 9 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || cx < -150 || inBasilica(cx, cz, 8) || inOval(cx, cz, 8) || inRect(RETTA, cx, cz, 8) || inRect(PALACE, cx, cz, 10) || inRect(SISTINE, cx, cz, 10)
      || Math.hypot(cx - CASTEL.c[0], cz - CASTEL.c[1]) < CASTEL.r * 1.5 + 28 || Math.abs(cx - tiberX(cz)) < TIBER.w / 2 + 12
      || BORGO.some((b) => Math.abs(cz - b) < 6 && cx > 100) || Math.abs(cz - CASTEL.c[1]) < 9 && cx > 100 || Math.abs(cz + 158) < 6 && cx > -70 && cx < CASTEL.c[0]
      || Math.abs((cz + 420) % 60 - 30) < 3 || Math.abs((cx + 420) % 72 - 36) < 3 && Math.abs(cz) > 30 || rand() < 0.08) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(0, height(cx, cz)), foot: -0.3, storeys: 3 + (rand() < 0.5 ? 1 : 0), front: rand() < 0.5 ? 'n' : 's', plaster: rand() < 0.75 });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
