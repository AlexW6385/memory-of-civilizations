// Qin Xianyang and the First Emperor's mausoleum, c. 210 BC — the layout (docs/settlements/qin-xianyang.md §2).
// North: Pit 1 of the terracotta army (230 × 62 m, floor 5 m down), its three ramps on the east, the figure-makers'
// quarter behind it; north-west the palace terrace with its hall and the twin que; the imperial road across the whole
// disc (z −20…20); south of it the walled market with its tower, and the rammed-earth houses in rows. Pure data.
// Coordinates: metres, +x east, +z south, y up. The army faces east.

export const RADIUS = 330;

// ── Pit 1 ──
export const PIT = { x0: -100, z0: -152, x1: 130, z1: -90, floor: -5, wall: 2.0 };       // outer faces of the earth walls
export const CORR = { n: 11, w: 3.4, part: 2.06, x0: -98, x1: 112 };                      // the corridors (inner x), partitions between
export const GALLERY = [112, 128];                                                          // the front gallery, between the corridors and the east wall
export const ROOF = { beamY0: -0.7, beamY1: -0.3, top: -0.3, mound: 2.2, bareX: 66 };       // the logs, the earth's height, where the earth stops
export const RAMP = { len: 22, w: 5, zs: [2, 5, 8] };                                       // the ramps: in line with these corridors
export const ARCHERS = { rows: [113.6, 115.0, 116.4], spacing: 0.9 };                       // the vanguard: three ranks across the front gallery
export const FILES = [-1.2, 1.2];                                                           // the two files of each corridor, from its centre line
export const FILE_STEP = 1.05;
export const corrZ = (k) => PIT.z0 + PIT.wall + CORR.w / 2 + k * (CORR.w + CORR.part);
export const rampZ = (i) => corrZ(RAMP.zs[i]);
/** Chariot places in the corridors: { k, x } (x = the horses' front, the chariot's body 7.5 m behind it). */
export const CHARIOTS = [
  ...[1, 3, 7, 9].flatMap((k) => [85, 40, -5, -50].map((x) => ({ k, x }))),
  ...[2, 5, 8].flatMap((k) => [-35, -80].map((x) => ({ k, x }))),
  ...[0, 4, 6, 10].map((k) => ({ k, x: 15 - k * 5 })),
];

/** The haul road east from the ramps' apron, on the line of the middle ramp (the visitor's arrival looks along it). */
export const HAUL = { z: -121, x0: 158, x1: 288, w: 9 };
export const YARD = [PIT.x1 + RAMP.len - 1, -178, PIT.x1 + RAMP.len + 66, -78];   // the building yard at the ramps' head

// ── the palace ──
export const TERRACE = { x0: -258, z0: -128, x1: -180, z1: -74, h: 7.0, h1: 3.5, rim: 6 };  // two tiers: the lower 3.5 m reaches 6 m wider
export const STAIR = { x: -219, w: 12, run: 22 };                                           // the great stair on the south face, its axis
export const HALL = { x0: -246, z0: -118, x1: -192, z1: -84 };                              // the principal hall's walls on the terrace (54 × 34 m)
export const QUE = { z: -48, off: 15, w: 9, d: 7, h: 11 };                                  // the twin gate towers, ±off from the stair's axis
export const FORECOURT = [-280, -66, -150, -22];                                            // the paved court between the terrace and the road

// ── the road ──
export const ROAD = { z0: -20, z1: 20, lane: 3.5 };                                         // 40 m wide; the emperor's lane 7 m along its middle
export const PINE_Z = 24;                                                                   // pines in a strip 3 m wide at z = ±PINE_Z

// ── the market (shi) ──
export const MARKET = [-100, 26, 40, 90];                                                    // inside its wall
export const TOWER = { x: -30, z: 58, w: 10, h: 12 };
export const MWALL = { th: 1.4, h: 3.4, gates: { n: [-30], s: [-30], w: [58], e: [58] }, gw: 7 };

// ── the figure-makers' quarter ──
export const WS_Z = -207;                                                                   // its street (E–W)
export const WS_X = [-100, 156];

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** Signed distance outside the pit's outer rectangle (negative inside). */
export const pitDist = (x, z) => Math.max(PIT.x0 - x, x - PIT.x1, PIT.z0 - z, z - PIT.z1);
const rampY = (x) => PIT.floor * (1 - (x - PIT.x1) / RAMP.len);
export function inRamp(x, z, m = 0) {
  if (x < PIT.x1 - 0.01 || x > PIT.x1 + RAMP.len + m) return false;
  return RAMP.zs.some((_, i) => Math.abs(z - rampZ(i)) < RAMP.w / 2 + m);
}
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  const d = pitDist(x, z);
  if (d < 0.5) h = Math.min(h, PIT.floor * (1 - smooth(-2.0, 0, d)));
  if (x > PIT.x1 - 3 && x < PIT.x1 + RAMP.len) {
    for (let i = 0; i < RAMP.zs.length; i++) {
      const dz = Math.abs(z - rampZ(i));
      if (dz < RAMP.w / 2 + 1) h = Math.min(h, Math.min(0, rampY(Math.max(x, PIT.x1))) * (1 - smooth(RAMP.w / 2 - 0.2, RAMP.w / 2 + 1, dz)));
    }
  }
  return h * (1 - smooth(RADIUS - 40, RADIUS - 10, r));
}

// ── the town ──
const ROW_D = 17, STREET_W = 4;
export const STREET_ZS = [108, 148, 188, 228, 268, -58];
export const LANES_X = [-262, -200, -140, 60, 120, 180, 240];
export const LANE_W = 3.2;
const X0 = -300, X1 = 300;
const WS_ROW = 33;
/** Rectangles kept free of houses. */
const RESERVED = [
  [FORECOURT[0] - 4, -140, FORECOURT[2] + 6, FORECOURT[3] + 2],                              // the palace, its stair and court
  [TERRACE.x0 - TERRACE.rim - 4, TERRACE.z0 - TERRACE.rim - 4, TERRACE.x1 + TERRACE.rim + 4, TERRACE.z1 + TERRACE.rim + 24],
  [PIT.x0 - 12, PIT.z0 - 10, PIT.x1 + RAMP.len + 14, PIT.z1 + 10],                           // the pit, its mound and ramps
  [MARKET[0] - 6, MARKET[1] - 4, MARKET[2] + 6, MARKET[3] + 4],
  [-RADIUS, ROAD.z0 - 8, RADIUS, ROAD.z1 + 8],                                              // the road and its pines
];
let LOTS = null;
/**
 * The lots: { rect, front ('n' | 's'), kind ('row' | 'court' | 'official' | 'granary' | 'garden' | 'workshop'), trade, seed, open }.
 * Rows back to back along E–W streets, the doors on the street; lanes cut across the rows.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(210);
  const trades = ['clay', 'body', 'head', 'kiln', 'paint', 'ship'];
  let wsi = 0, furnished = 0;
  const rowOf = (zs, side, depth, xa, xb, ws) => {
    const z0 = side < 0 ? zs - STREET_W / 2 - depth : zs + STREET_W / 2, z1 = z0 + depth, front = side < 0 ? 's' : 'n';
    let x = xa;
    while (x < xb) {
      const lane = ws ? undefined : LANES_X.find((l) => x + 1 > l - LANE_W / 2 - 0.5 && x < l + LANE_W / 2 + 0.5);
      if (lane !== undefined) { x = lane + LANE_W / 2 + 0.5; continue; }
      const r = rand();
      let w = ws ? 22 + Math.floor(rand() * 4) : r < 0.5 ? 7 + rand() * 2 : r < 0.82 ? 11 + rand() * 3 : r < 0.94 ? 16 + rand() * 3 : 8 + rand() * 2;
      const kind = ws ? 'workshop' : r < 0.5 ? 'row' : r < 0.82 ? 'court' : r < 0.94 ? 'official' : 'granary';
      const next = ws ? undefined : LANES_X.find((l) => l - LANE_W / 2 > x && l - LANE_W / 2 < x + w + 1);
      if (next !== undefined) w = Math.max(5.5, next - LANE_W / 2 - 0.5 - x);
      const rect = [x, z0, x + w, z1], c = [x + w / 2, (z0 + z1) / 2];
      x += w;
      if (Math.hypot(c[0], c[1]) > RADIUS - 44) continue;
      if (RESERVED.some((q) => rect[0] < q[2] && rect[2] > q[0] && rect[1] < q[3] && rect[3] > q[1])) continue;
      if (ws && (rect[0] < WS_X[0] || rect[2] > WS_X[1])) continue;
      const seed = Math.floor(rand() * 1e6);
      const lot = { rect, front, kind: !ws && kind !== 'granary' && rand() < 0.07 ? 'garden' : kind, seed, open: false, row: zs };
      if (ws) lot.trade = trades[wsi++ % trades.length];
      if (lot.kind !== 'garden' && lot.kind !== 'granary' && (ws || lot.kind === 'official' || (Math.hypot(c[0], c[1]) < 240 && furnished++ % 3 === 0))) lot.open = true;
      LOTS.push(lot);
    }
  };
  for (const zs of STREET_ZS) for (const side of [-1, 1]) rowOf(zs, side, ROW_D, X0, X1, false);
  for (const side of [-1, 1]) rowOf(WS_Z, side, WS_ROW, WS_X[0], WS_X[1], true);
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The streets (rectangles, free of houses): the E–W streets, the lanes, the workshop street, the road itself. */
export function streets() {
  const out = [];
  for (const zs of STREET_ZS) out.push([X0 - 4, zs - STREET_W / 2, X1, zs + STREET_W / 2]);
  out.push([WS_X[0] - 4, WS_Z - STREET_W / 2, WS_X[1] + 4, WS_Z + STREET_W / 2]);
  for (const lx of LANES_X) out.push([lx - LANE_W / 2, 90, lx + LANE_W / 2, 286], [lx - LANE_W / 2, -86, lx + LANE_W / 2, -26]);
  return out.filter((r) => r[2] - r[0] > 2 && r[3] - r[1] > 2);
}

/** The pines of the road: every 3 zhang (≈ 6.9 m) along both edges. */
export function roadPines() {
  const out = [];
  for (let x = -300; x <= 300; x += 6.9) for (const s of [-1, 1]) out.push({ x, z: s * PINE_Z });
  return out;
}
