// Han Chang'an, c. 100 BC — the layout (docs/settlements/han-changan.md §2). The real city is 25.7 km round, so everything is
// compressed: the Weiyang Palace precinct in the south-west with the Front Hall on its stepped rammed-earth terrace, the Changle
// Palace east of the great avenue, the walled lǐ wards in rows, the West and East Markets in the north, the city wall with its gates
// on the west and south, the Kunming Lake south-west outside the wall and the Imperial Academy south of it. Pure data.
// Coordinates: metres, +x east, +z south, y up.

export const RADIUS = 520;
export const AX = -110;                                            // the axis of the Front Hall (x)

// Weiyang: the walled precinct, the terrace (three tiers), the hall on its crown
export const PALACE = [-250, -250, 110, 115];
export const PALACE_WALL = { th: 5, h: 8 };
export const TIERS = [{ r: [AX - 70, -215, AX + 70, -115], top: 3 }, { r: [AX - 64, -209, AX + 64, -121], top: 6 }, { r: [AX - 58, -203, AX + 58, -127], top: 9 }];
export const CROWN = 9;
export const RAMP = { x: [AX - 5, AX + 5], z0: -127, z1: -91 };      // the central ramp-stair, 10 m wide, rising toward −z to the crown
export const HALL = { cx: AX, bays: 9, bayW: 6.6, depth: 4, depthW: 6, z1: -166, base: 0.9, h: 7 };   // the front (south) column line at z1
HALL.w = HALL.bays * HALL.bayW; HALL.d = HALL.depth * HALL.depthW; HALL.z0 = HALL.z1 - HALL.d; HALL.floor = CROWN + HALL.base;
export const SIDE_HALLS = [[AX - 48, -176, 18, 14], [AX + 48, -176, 18, 14]];          // the east and west chambers on the crown: cx, cz, w, d
export const JIAOFANG = { cx: AX, cz: -232, w: 36, d: 12 };                                // the empress's hall behind the terrace (inside the north wall)
export const GARDEN_POND = [-235, -90, -165, -30];                                         // the imperial pond south-west of the Front Hall (a shallow basin)
export const POND_Y = -0.6;

// the city
export const CITY_WALL = { th: 12, h: 11 };
export const WALL_W = -280;                                        // the west wall's centre line (x)
export const WALL_S = 268;                                         // the south wall's centre line (z)
export const WALL_N = -430;                                        // the north wall (z), clipped by the disc
export const WALL_E = 458;
export const GATE_W = { z: -20, w: 30 };                           // the west gate (the Silk Road's): three passages
export const GATE_S = { x: 150, w: 30 };                           // the south gate, on the great avenue
export const AVENUE = [135, -430, 165, 268];                       // the great avenue between the two palaces (N–S)
export const EAST_GATE = { z: -100, w: 14 };                       // the palace's east gate, with its que
export const SOUTH_GATE = { x: AX, w: 14 };                        // the palace's south gate

// the Changle Palace east of the avenue
export const CHANGLE = [190, -205, 400, 5];
export const CHANGLE_HALL = { cx: 295, z1: -80 };

// the markets
export const WEST_MARKET = [-205, -395, -65, -265];
export const EAST_MARKET = [200, -335, 330, -225];
export const MARKET_WALL = { th: 2.4, h: 5 };

// the Kunming Lake and the academy
export const LAKE = { c: [-225, 345], rx: 80, rz: 60 };
export const LAKE_Y = -1.6, LAKE_BED = -3.3;
export const ACADEMY = [60, 288, 175, 352];

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const lakeD = (x, z) => 1 - Math.hypot((x - LAKE.c[0]) / LAKE.rx, (z - LAKE.c[1]) / LAKE.rz);   // > 0 inside
export const inLake = (x, z, m = 0) => lakeD(x, z) > -m / 60;
export const inPond = (x, z, m = 0) => inRect(GARDEN_POND, x, z, m);
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  const d = lakeD(x, z);
  if (d > -0.03) h = Math.min(h, LAKE_BED * smooth(-0.03, 0.08, d));
  const dp = Math.min(x - GARDEN_POND[0], GARDEN_POND[2] - x, z - GARDEN_POND[1], GARDEN_POND[3] - z);
  if (dp > -1) h = Math.min(h, -1.4 * smooth(-1, 1.5, dp));
  return h * (1 - smooth(RADIUS - 30, RADIUS, r));
}

// ── wards: 104 × 104 walled units, two lanes each ──
export const WARD = 104, WARD_WALL = 1.6;
const WARD_X0 = [-241, -111, 19, 177, 307];
export const WARDS = [
  ...WARD_X0.map((x0) => [x0, 136, x0 + WARD, 136 + WARD]),                 // the south row, along the south wall
  [19, -395, 19 + WARD, -395 + WARD],                                       // the north ward by the avenue
];
const ROWS = [[0, 22, 'row', 's'], [27.1, 49.1, 'row', 'n'], [49.1, 71.1, 'row', 's'], [74.6, 98.6, 'row', 'n']];   // v0, v1, kind, front (lane 1 at 23.5–27.1, lane 2 at 71.1–74.6)
export const LANE_V = [[22.6, 27.1], [71.1, 74.6]];
const GATE_PAD = 8;
const wardWallRect = (w) => w;
export const wardRect = wardWallRect;
let LOTS = null;
/** The lots: { rect, front, kind ('court' | 'row' | 'tower' | 'office'), seed, open, ward }. Rows back to back, the doors on the lanes. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(100);
  let furnished = 0;
  WARDS.forEach((w, wi) => {
    const [x0, z0, x1] = w;
    for (let ri = 0; ri < ROWS.length; ri++) {
      const [v0, v1, , front] = ROWS[ri];
      let x = x0 + WARD_WALL + 1;
      while (x < x1 - WARD_WALL - 6) {
        const wd = 10 + Math.floor(rand() * 5) * 1.5;
        const xe = Math.min(x + wd, x1 - WARD_WALL - 1);
        const rect = [x, z0 + WARD_WALL + v0, xe, z0 + WARD_WALL + v1 - 0.4];
        const r = rand();
        const kind = ri === 0 || ri === 3 ? (r < 0.62 ? 'court' : r < 0.82 ? 'tower' : 'row') : (r < 0.45 ? 'court' : r < 0.6 ? 'tower' : 'row');
        const lot = { rect, front, kind, seed: Math.floor(rand() * 1e6), open: false, ward: wi };
        if (xe - x > 9 && kind !== 'tower' && furnished++ % 4 === 0) lot.open = true;
        LOTS.push(lot);
        x = xe + 0.6;
      }
    }
  });
  // the offices (shu) along the great avenue, west and east side
  const A = AVENUE;
  for (let z = -405; z < 108; z += 27) {
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? A[0] - 21 : A[2] + 4, rect = [x0, z, x0 + 17, z + 22];
      if (rand() < 0.1 || (side < 0 && Math.abs(z + 11 - EAST_GATE.z) < 24) || (side > 0 && z > -22 && z < 42 && false)) continue;
      if (inRect(PALACE, x0 + 9, z + 11, 3) || inRect(CHANGLE, x0 + 9, z + 11, 3) || inRect(WEST_MARKET, x0 + 9, z + 11, 3) || inRect(EAST_MARKET, x0 + 9, z + 11, 3)) continue;
      if (Math.hypot(x0 + 9, z + 11) > RADIUS - 46 || WARDS.some((w) => inRect(w, x0 + 9, z + 11, 12))) continue;
      LOTS.push({ rect, front: 's', kind: 'office', seed: Math.floor(rand() * 1e6), open: false, ward: -1 });
    }
  }
  // the quarters inside the palaces (guards, clerks, servants): rows of houses in pairs round a lane
  for (const q of QUARTERS) {
    const [qx0, qz0, qx1, qz1] = q;
    for (let zz = qz0; zz + 48.5 <= qz1 + 0.01; zz += 53) {
      for (const [v0, v1, front] of [[0, 22, 's'], [26.5, 48.5, 'n']]) {
        let x = qx0;
        while (x < qx1 - 8) {
          const xe = Math.min(x + 10 + Math.floor(rand() * 4) * 1.5, qx1), kind = rand() < 0.6 ? 'court' : rand() < 0.5 ? 'row' : 'tower';
          if (xe - x >= 8) LOTS.push({ rect: [x, zz + v0, xe, zz + v1 - 0.4], front, kind, seed: Math.floor(rand() * 1e6), open: furnished++ % 5 === 0, ward: -2 });
          x = xe + 0.6;
        }
      }
    }
  }
  return LOTS;
}
export const QUARTERS = [[-25, -78, 100, 106], [203, -190, 255, -4], [338, -190, 388, -4]];
export const QUARTER_LANES = QUARTERS.flatMap(([qx0, qz0, qx1, qz1]) => { const o = []; for (let zz = qz0; zz + 48.5 <= qz1 + 0.01; zz += 53) o.push([qx0, zz + 22, qx1, zz + 26.5]); return o; });
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** Rectangles of the wards' lanes, the great avenue and the streets between the wards (free of houses). */
export function streets() {
  const out = [];
  for (const [x0, z0, x1] of WARDS) for (const [v0, v1] of LANE_V) out.push([x0, z0 + WARD_WALL + v0, x1, z0 + WARD_WALL + v1]);
  out.push(AVENUE, ...QUARTER_LANES);
  out.push([-274, 118, 440, 134]);                                  // the street south of the palace, along the wards
  out.push([-274, 240, 440, 262]);                                  // the ring road inside the south wall
  out.push([-274, -430, -250, 262]);                                // the ring road inside the west wall
  out.push([-274, -272, 135, -254]);                                // the street north of the palace
  out.push([-440, -26, -274, -14]);                                 // the road out of the west gate
  out.push([-274, -26, -250, -14]);
  out.push([-30, -110, 135, -88]);                                  // from the palace's east gate to the avenue
  out.push([165, -110, 190, -90]);                                  // and on to the Changle's gate
  out.push([135, -270, 340, -254]);                                 // toward the East Market
  return out.filter((r) => r[2] - r[0] > 2 && r[3] - r[1] > 2);
}
/** The city wall's segments (centre lines) inside the disc: [a, b] with gaps for the gates, as {a, b}. */
export function cityWalls() {
  const L = RADIUS - 30, out = [];
  const seg = (a, b, fixed, axis) => {
    // clip to the disc along the free coordinate
    const f = Math.abs(fixed), lim = Math.sqrt(Math.max(0, L * L - f * f));
    const lo = Math.max(a, -lim), hi = Math.min(b, lim);
    if (hi - lo > 8) out.push(axis === 'x' ? { a: [lo, fixed], b: [hi, fixed] } : { a: [fixed, lo], b: [fixed, hi] });
  };
  seg(-286, WALL_E, WALL_S, 'x');           // south
  seg(-286, WALL_E, WALL_N, 'x');           // north
  seg(WALL_N, WALL_S, WALL_W, 'z');         // west
  seg(WALL_N, WALL_S, WALL_E, 'z');         // east
  return out;
}

/** The shop rows of a market: four quadrants about the cross lanes, rows in back-to-back pairs with a lane between: [{ rect, front, n, seed }]. */
export function marketShops(rect, seedBase, th = MARKET_WALL.th) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lane = 8, out = [];
  const quads = [[x0 + th + 3, z0 + th + 3, cx - lane, cz - lane], [cx + lane, z0 + th + 3, x1 - th - 3, cz - lane], [x0 + th + 3, cz + lane, cx - lane, z1 - th - 3], [cx + lane, cz + lane, x1 - th - 3, z1 - th - 3]];
  let seed = seedBase;
  for (const [qx0, qz0, qx1, qz1] of quads) {
    const nShops = Math.max(2, Math.floor((qx1 - qx0) / 5.2));
    for (let zz = qz0; zz + 12 <= qz1 + 0.01; zz += 16) {
      out.push({ rect: [qx0, zz, qx0 + nShops * 5.2, zz + 6], front: 'n', n: nShops, seed: seed++ }, { rect: [qx0, zz + 6, qx0 + nShops * 5.2, zz + 12], front: 's', n: nShops, seed: seed++ });
    }
  }
  return out;
}
