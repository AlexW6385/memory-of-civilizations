// Knossos about 1600 BC — the layout (docs/settlements/knossos.md §2): the palace on the low hill
// of Kefala, its wings round the Central Court (27 × 50 m, long side north–south); the West Court
// before the west façade; the theatral area at the north-west corner where the Royal Road arrives
// from the town; the slope east down to the Kairatos stream; the town all round. The town is laid
// out in rows of houses with party walls along paved lanes (§5a). Pure data. +x east, +z south.

export const RADIUS = 350;
export const COURT = [-13.5, -25, 13.5, 25];
export const PALACE = [-64, -72, 64, 60];
export const THEATRAL = [-104, -98, -72, -80];
export const ROAD = { z: -89, x0: -RADIUS, x1: -100, w: 3.8 };
export const WESTCOURT = [-130, -60, -64, 60];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const STREAM = { x: 205, w: 6, depth: 1.5 };
const ground0 = (x, z) => {
  const r = Math.hypot(x, z), fade = 1 - smooth(RADIUS - 70, RADIUS - 5, r);
  const east = -12 * smooth(75, 190, x) + 10 * smooth(215, 300, x), west = -3 * smooth(-120, -300, x);
  return (east + west) * fade;
};
/** The level of the Kairatos: a little under its banks at the stream's line (the stream runs north–south). */
export const STREAM_LEVEL = ground0(STREAM.x, 0) - 0.55;
/** The hill and the valley: flat round the palace, down east to the stream (cut into a bed 6 m across), up again beyond; level at the edge. */
export function height(x, z) {
  const h = ground0(x, z), d = Math.abs(x - STREAM.x + 3 * Math.sin(z / 55));
  return h - STREAM.depth * (1 - smooth(STREAM.w / 2 - 0.5, STREAM.w / 2 + 4, d)) * (1 - smooth(RADIUS - 60, RADIUS - 5, Math.hypot(x, z)));
}
export const onStream = (x, z, m = 0) => Math.abs(x - STREAM.x + 3 * Math.sin(z / 55)) < STREAM.w / 2 + m;
export const onRoad = (x, z, m = 0) => Math.abs(z - ROAD.z) < ROAD.w / 2 + m && x < ROAD.x1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// the lanes: east–west, 3.4 m wide, 26 m apart (a row of houses 11.3 m deep on each side, back to back); the first along the Royal Road's line
export const LANE = { w: 3.4, pitch: 26, z0: ROAD.z, depth: 11.3, alley: 2.6, cross: 3.2 };
const laneZ = (k) => LANE.z0 + k * LANE.pitch;
// the cross streets: north–south, 3.2 m wide, every 78 m, through the rows
const CROSS = Array.from({ length: 9 }, (_, i) => -300 + 78 * i);
let LOTS = null, ALLEYS = null, LANES = null, YARDS = null, STREETS = null;
function build() {
  LOTS = []; ALLEYS = []; YARDS = []; const spans = new Map();
  const xmin = -RADIUS + 22, xmax = 170;
  for (let k = -14; k <= 14; k++) {
    const zc = laneZ(k), hw = (k === 0 ? ROAD.w : LANE.w) / 2;
    for (const side of [-1, 1]) {
      const rand = rng(1600 + k * 31 + (side > 0 ? 7 : 0));
      let x = xmin + rand() * 4, since = 0, prev = null;
      while (x < xmax) {
        const w = 5.4 + rand() * 3.6, hit = CROSS.find((c) => x + w > c - 1.6 && x < c + 1.6);
        if (hit !== undefined) { if (prev) prev.alE = true; x = hit + 1.6; since = 0; prev = null; continue; }
        const d = rand() < 0.68 ? LANE.depth : 8.2 + rand() * 2.6;
        const alley = since >= 3 && rand() < 0.3;
        if (alley) { x += LANE.alley; since = 0; if (prev) prev.alE = true; prev = null; }
        const z0 = side < 0 ? zc - hw - d : zc + hw, z1 = z0 + d, cx = x + w / 2, cz = (z0 + z1) / 2, r = Math.hypot(cx, cz);
        x += w; since++;
        if (r > RADIUS - 35 || x > xmax + 4) { prev = null; continue; }
        if (inRect(PALACE, cx, cz, 12) || inRect(THEATRAL, cx, cz, 14) || onRoad(cx, cz, 3) || inRect(WESTCOURT, cx, cz, 6) || onStream(cx, cz, 14)) { prev = null; continue; }
        if (rand() < 0.03 * smooth(100, 170, r) + 0.6 * smooth(160, 300, r)) { prev = null; continue; }
        const lot = { rect: [x - w, z0, x, z1], seed: Math.floor(rand() * 1e6), front: side < 0 ? 's' : 'n', k, side, alW: !prev, alE: false, yardD: LANE.depth - d, r };
        if (prev) prev.alE = false;
        LOTS.push(lot); prev = lot;
        const key = `${k}`; if (!spans.has(key)) spans.set(key, []); spans.get(key).push([x - w, x]);
        if (d < LANE.depth - 2.0 && r < 210) YARDS.push({ rect: side < 0 ? [x - w + 0.2, z0 - (LANE.depth - d) + 0.3, x - 0.2, z0 - 0.08] : [x - w + 0.2, z1 + 0.08, x - 0.2, z1 + (LANE.depth - d) - 0.3], seed: lot.seed });
      }
    }
    void zc;
  }
  // an alley at a gap between two houses of a row: its rectangle (the gap's length across the row's depth)
  for (const l of LOTS) if (l.alE) {
    const nx = LOTS.find((o) => o.k === l.k && o.side === l.side && Math.abs(o.rect[0] - l.rect[2] - LANE.alley) < 0.01);
    if (nx) ALLEYS.push([l.rect[2], Math.min(l.rect[1], nx.rect[1]), nx.rect[0], Math.max(l.rect[3], nx.rect[3])]);
  }
  // a lane runs where a house stands on one side or the other
  LANES = [];
  for (let k = -14; k <= 14; k++) {
    const zc = laneZ(k), xs = LOTS.filter((l) => l.k === k).map((l) => l.rect).sort((a, b) => a[0] - b[0]);
    let run = null;
    for (const r of xs) { if (run && r[0] - run[1] < 3.4) run[1] = Math.max(run[1], r[2]); else { if (run) LANES.push({ z: zc, x0: run[0], x1: run[1], k }); run = [r[0], r[2]]; } }
    if (run) LANES.push({ z: zc, x0: run[0], x1: run[1], k });
  }
}
/** The cross streets between neighbouring lanes: { x, z0, z1 } (north–south). */
export function streets() {
  if (!LOTS) build();
  if (STREETS) return STREETS;
  STREETS = [];
  const ok = (x, z) => Math.hypot(x, z) < RADIUS - 50 && !inRect(PALACE, x, z, 12) && !inRect(WESTCOURT, x, z, 6) && !inRect(THEATRAL, x, z, 14) && !onRoad(x, z, 9) && !onStream(x, z, 14) && x < 168;
  for (const x of CROSS) for (let k = -14; k < 14; k++) {
    const za = laneZ(k), zb = laneZ(k + 1);
    if (ok(x, za) && ok(x, zb) && ok(x, (za + zb) / 2) && lots().some((l) => Math.abs(l.rect[0] - (x + 1.6)) < 0.05 || Math.abs(l.rect[2] - (x - 1.6)) < 0.05) && Math.hypot(x, (za + zb) / 2) < 250) STREETS.push({ x, z0: za, z1: zb });
  }
  return STREETS;
}
/** Houses of the town round the palace, in rows with party walls along lanes, thinning out toward the edge. */
export function lots() { if (!LOTS) build(); return LOTS; }
/** The paved lanes: { z, x0, x1 } (east–west, centre line z). */
export function lanes() { if (!LOTS) build(); return LANES; }
/** The alleys between houses of a row: rectangles. */
export function alleys() { if (!LOTS) build(); return ALLEYS; }
/** The walled yards behind the shorter houses: { rect, seed }. */
export function yards() { if (!LOTS) build(); return YARDS; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
export const inYard = (x, z, m = 0) => yards().some((y) => inRect(y.rect, x, z, m));
export const onLane = (x, z, m = 0) => lanes().some((l) => Math.abs(z - l.z) < LANE.w / 2 + m && x > l.x0 - m && x < l.x1 + m) || alleys().some((a) => inRect(a, x, z, m)) || streets().some((c) => Math.abs(x - c.x) < LANE.cross / 2 + m && z > c.z0 && z < c.z1);

/** The houses that can be entered: near the palace on the flat ground, wide and deep enough; their kinds by the lot's seed. */
export function openHouses() {
  const m = new Map(), kinds = ['home', 'home', 'weaver', 'shop', 'shop', 'store', 'home', 'weaver'];
  const ok = lots().filter((l) => l.rect[0] > -165 && l.rect[2] < 62 && l.r < 150 && l.rect[2] - l.rect[0] >= 6.3 && l.rect[3] - l.rect[1] >= 10.5 && l.seed % 2 === 0);
  const d = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 100, (l.rect[1] + l.rect[3]) / 2);
  for (const l of ok.sort((a, b) => d(a) - d(b)).slice(0, 56)) m.set(l, kinds[Math.floor(l.seed / 8) % kinds.length]);
  return m;
}
