// Mount Wutai in 857 — the layout (docs/settlements/tang-wutai.md §2): Foguang Monastery on the
// west-facing slope of Foguang Hill — the lower courtyard, the middle terrace, the Great East Hall on
// the upper terrace against the hill; the founding master's small pagoda south of the hall on the upper
// terrace; a village of walled yards on a lane grid in the valley below to the west, terraced fields on
// its flanks; pines on the hills. Pure data. +x east, +z south.

export const RADIUS = 250;
export const HALL = { origin: [60, 0] };                  // the plan's origin (the hall's centre)
export const PLAN = [-58, -48, 94, 48];                    // the plan's terraces in settlement coordinates
export const PAGODA = [66, 32];                           // the Zushi pagoda, south of the hall on the upper terrace
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// ── the village's lanes (docs §5): the main lane runs west from the monastery gate; cross lanes north–south
// every 40 m; lanes east–west every 44 m. Rects [x0, z0, x1, z1].
export const GATE_X = -54;                                // the monastery's gate (hall plan x −114)
export const LANE_Z = [-88, -44, 0, 44, 88];
export const LANE_X = [-96, -136, -176, -216];
const LW = 3.2, MAIN = 5;
export const LANES = [
  [GATE_X - 4, -MAIN / 2, LANE_X[3] - 14, MAIN / 2],
  ...LANE_Z.filter((z) => z !== 0).map((z) => [LANE_X[0] - 1.6, z - LW / 2, LANE_X[3] + 1.6, z + LW / 2]),
  ...LANE_X.map((x) => [x - LW / 2, LANE_Z[0] - 14, x + LW / 2, LANE_Z[4] + 14]),
];
/** The village green on the main lane before the gate (a well, the market's pitch). */
export const GREEN = [-92, -10, -62, 10];

/**
 * The ground: the valley floor falling gently west from the monastery's gate, the flanks of the valley rising
 * in terraced fields, the hill behind (east) the monastery, kept below the monastery's terraces.
 */
export function height(x, z) {
  const flank = (() => {
    const t = smooth(104, 205, Math.abs(z)), n = 7, s = t * n, f = Math.min(n - 1, Math.floor(s)), r = s - f;
    return (f + smooth(0.45, 1, r)) / n * 34;             // seven terraces, their banks rising over a third of the run
  })();
  let h = 14 * smooth(-10, 94, x) + 46 * smooth(94, 250, x) + flank * smooth(-250, -70, x) * (0.4 + 0.6 * smooth(-100, 40, x));
  h -= 0.025 * Math.max(0, -x - 70);                     // the valley floor falls to the west
  if (inRect(PLAN, x, z, -0.5)) h = Math.min(h, x < -2 ? -0.3 : x < 30 ? 6.2 : 12.7);
  else if (x > -62 && x < 94 && Math.abs(z) < 54) h = Math.min(h, 14 * smooth(-10, 94, x));
  return h * (1 - smooth(RADIUS - 60, RADIUS - 8, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// the yards of the village (docs §5): rows hugging each east–west lane, the house at the back of its walled
// yard, the gate on the lane
const YARD_D = 17, YARD_GAP = 2;
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(857);
  const lanes = LANE_Z;
  // x spans between consecutive cross lanes (from east to west)
  const spans = [[LANE_X[0] + LW / 2 + 0.6, GATE_X - 10]];
  for (let i = 0; i < LANE_X.length - 1; i++) spans.push([LANE_X[i + 1] + LW / 2 + 0.6, LANE_X[i] - LW / 2 - 0.6]);
  let id = 0;
  const rows = [];                                        // [lane z, side: +1 yards south of the lane, −1 north]
  for (const z of lanes) for (const side of [-1, 1]) rows.push([z, side]);
  for (const [lz, side] of rows) for (const [sx0, sx1] of spans) {
    const W = sx1 - sx0, n = Math.max(1, Math.round(W / 19)), w = (W - YARD_GAP * (n - 1)) / n;
    for (let k = 0; k < n; k++) {
      const x0 = sx0 + k * (w + YARD_GAP), x1 = x0 + w, off = (lz === 0 ? MAIN : LW) / 2 + 0.8;
      const z0 = side > 0 ? lz + off : lz - off - YARD_D, z1 = z0 + YARD_D, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      // the rows face their lane; none beyond the outer lanes' far side, none on the green, none past the rim
      if (Math.hypot(cx, cz) > RADIUS - 34) continue;
      if (inRect(GREEN, cx, cz, 6) || Math.abs(cz) < MAIN / 2 + 1) continue;
      if (rand() < 0.07 && lz !== 0) continue;                       // an empty plot: a garden or threshing floor
      const ys = [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [cx, cz]].map(([a, b]) => height(a, b));
      if (Math.max(...ys) - Math.min(...ys) > 1.6) continue;
      LOTS.push({ id: id++, rect: [x0, z0, x1, z1], y: Math.max(...ys), foot: Math.min(...ys), front: side > 0 ? 'n' : 's', seed: Math.floor(rand() * 1e6), lane: lz });
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
export const inLane = (x, z, m = 0) => LANES.some((r) => inRect(r, x, z, m));
