// Bagan, c. 1200 — the layout (docs/settlements/bagan.md §2). The real zone is 13 × 8 km, so everything is compressed: the Irrawaddy along the west, the walled city on its
// bank (the west wall washed away), the Tharabar Gate on the east wall, the Ananda a short walk east, the Thatbyinnyu inside the city, the Shwezigon to the north-east, the
// Sulamani to the south-east, villages and the plain studded with small temples between. Pure data.
// Coordinates: metres, +x east, +z south, y up.

export const RADIUS = 330;
export const RIVER_Y = -2.4, BED = -5.5;
export const bankX = (z) => -285 + 8 * Math.sin(z / 55) + 5 * Math.sin(z / 23 + 1);       // the top of the bank (x) at z

export const ANANDA = { c: [105, 0], f: 1.2 };
export const PRECINCT = [15, -95, 195, 95];
export const CITY = [-262, -140, -100, 140];
export const WALL = { th: 3.2, h: 6.2 };
export const GATE = { x: -100, z: 0, pw: 4.6 };                 // Tharabar, on the city's east wall
export const THAT = { c: [-198, 82], k: 1, facing: 'e' };
export const THAT_ENC = [-250, 30, -146, 135];
export const PALACE = [-250, -135, -146, -30];
export const PAL_HALL = { c: [-198, -92], A: 14, B: 9 };
export const SHWE = { c: [140, -190] };
export const SHWE_PREC = [98, -232, 182, -148];
export const SULA = { c: [155, 198], k: 0.76, facing: 'n' };
export const SULA_PREC = [112, 160, 198, 236];
export const OKKYAUNG = [152, -90, 190, -62];
export const TANK = [-50, 165, -12, 190];
export const TANK_Y = -0.6;
export const KILNS = [[-40, 100], [-30, -105], [60, 112]];
export const KYAUNGS = [[-62, -66], [-56, 62], [52, -60]];
export const MAIN_ROAD = [-290, -4, 58, 4];

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

export const inTank = (x, z, m = 0) => inRect(TANK, x, z, m);
export const inRiver = (x, z, m = 0) => x - bankX(z) < -3 - m;
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = BED * smooth(2, -14, x - bankX(z));
  const dt = Math.min(x - TANK[0], TANK[2] - x, z - TANK[1], TANK[3] - z);
  if (dt > -1) h = Math.min(h, -1.5 * smooth(-1, 1.6, dt));
  return h * (1 - smooth(RADIUS - 30, RADIUS, r));
}

// ── streets (free of houses) ──
export function streets() {
  return [
    MAIN_ROAD,
    [-131.5, -138, -124.5, 138],                // the cross street of the city
    [-202, -30, -194, -4], [-202, 4, -194, 30],  // to the palace's and the Thatbyinnyu's gates
    [-146, 78, -131.5, 86],
    [101, -125, 109, -95], [101, -129, 144, -121], [136, -148, 144, -121],      // to the Shwezigon
    [101, 95, 109, 125], [101, 121, 159, 129], [151, 129, 159, 162],           // to the Sulamani
    [-12, 138, 92, 143], [-12, -146, 92, -141], [-216, 184, -108, 189], [-200, -194, -108, -189],     // the village lanes
    [105 - 3, -95, 105 + 3, -46], [105 - 3, 46, 105 + 3, 95],                    // inside the precinct, from the north and south gates
    [15, -4, 58, 4],
  ];
}

/** The strips of house lots: { rect, axis ('x' | 'z': the strip's length), front }, cut into lots below. */
const STRIPS = [
  { rect: [-256, -27, -138, -6], axis: 'x', front: 's' }, { rect: [-256, 6, -138, 27], axis: 'x', front: 'n' },
  { rect: [-122, -27, -104, -6], axis: 'x', front: 's' }, { rect: [-122, 6, -104, 27], axis: 'x', front: 'n' },
  { rect: [-122, -136, -104, -30], axis: 'z', front: 'w' }, { rect: [-122, 30, -104, 136], axis: 'z', front: 'w' },
  { rect: [-8, 118, 90, 138], axis: 'x', front: 's' }, { rect: [-8, 146, 90, 166], axis: 'x', front: 'n' },
  { rect: [-8, -166, 90, -146], axis: 'x', front: 's' }, { rect: [-8, -138, 90, -118], axis: 'x', front: 'n' },
  { rect: [-214, 162, -110, 182], axis: 'x', front: 's' }, { rect: [-214, 191, -110, 211], axis: 'x', front: 'n' },
  { rect: [-198, -214, -110, -196], axis: 'x', front: 's' }, { rect: [-198, -187, -110, -168], axis: 'x', front: 'n' },
];
let LOTS = null;
/** The lots: { rect, front, seed, open, kind, village } */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const r = rng(1200);
  let k = 0;
  STRIPS.forEach((s, si) => {
    const [x0, z0, x1, z1] = s.rect, alongX = s.axis === 'x';
    let a = alongX ? x0 : z0;
    const end = alongX ? x1 : z1;
    while (a < end - 8) {
      const wd = 10.5 + Math.floor(r() * 5) * 1.0, b = Math.min(a + wd, end);
      const rect = alongX ? [a, z0, b, z1] : [x0, a, x1, b];
      const hit = streets().some((q) => q[0] < rect[2] && q[2] > rect[0] && q[1] < rect[3] && q[3] > rect[1]);
      if (b - a >= 9 && r() > 0.1 && !hit) {
        LOTS.push({ rect, front: s.front, seed: Math.floor(r() * 1e6), open: k++ % 3 === 0, kind: r() < 0.35 ? 'large' : 'small', village: si >= 6 });
      }
      a = b + 0.4;
    }
  });
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The small temples and stupas of the plain: { c, kind ('stupa' | 'cella' | 'tall'), h | w, facing, seed }. Scattered on a jittered grid, never on a road, a lot or a precinct. */
let PLAIN = null;
export function plainTemples() {
  if (PLAIN) return PLAIN;
  PLAIN = [];
  const CELL = 34, avoid = [CITY, PRECINCT, THAT_ENC, SHWE_PREC, SULA_PREC, TANK, [-290, -20, 70, 20], ...KYAUNGS.map(([x, z]) => [x - 12, z - 10, x + 12, z + 12])];
  for (let gx = -10; gx <= 10; gx++) for (let gz = -10; gz <= 10; gz++) {
    const hx = hash2(gx * 7 + 3, gz * 13 + 1), hz = hash2(gx * 11 + 5, gz * 5 + 9), hk = hash2(gx * 3 + 8, gz * 17 + 2);
    if (hash2(gx + 40, gz - 7) > 0.62) continue;
    const x = gx * CELL + (hx - 0.5) * 18, z = gz * CELL + (hz - 0.5) * 18;
    if (Math.hypot(x, z) > RADIUS - 34 || x < bankX(z) + 14) continue;
    const kind = hk < 0.5 ? 'stupa' : hk < 0.88 ? 'cella' : 'tall', ext = kind === 'cella' ? 9 : kind === 'tall' ? 12 : 8;
    if (avoid.some((a) => inRect(a, x, z, ext)) || inLot(x, z, ext) || streets().some((s) => inRect(s, x, z, ext - 2)) || KILNS.some(([kx, kz]) => Math.hypot(x - kx, z - kz) < 14)) continue;
    const facing = ['e', 'n', 'w', 's'][Math.floor(hash2(gx, gz) * 4)];
    PLAIN.push({ c: [Math.round(x * 10) / 10, Math.round(z * 10) / 10], kind, h: kind === 'tall' ? 17 + hk * 6 : 7 + hx * 6, w: 3 + hz * 2.2, facing, seed: Math.floor(hk * 1e6) });
  }
  return PLAIN;
}
export const inPlainTemple = (x, z, m = 0) => plainTemples().some((t) => Math.hypot(x - t.c[0], z - t.c[1]) < (t.kind === 'cella' ? t.w + 2.5 : t.kind === 'tall' ? 12 : 8) + m);

/** The city's walls: segments with the gate's gap: { a, b, gaps }. The west side is open to the river. */
export function cityWalls() {
  const [x0, z0, x1, z1] = CITY;
  return [
    { a: [x0, z0], b: [x1, z0], gaps: [] },
    { a: [x0, z1], b: [x1, z1], gaps: [] },
    { a: [x1, z0], b: [x1, z1], gaps: [{ at: GATE.z - z0, w: GATE.pw + 3.4 }] },
  ];
}
