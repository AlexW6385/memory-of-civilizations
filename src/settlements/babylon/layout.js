// Babylon about 570 BC — the layout (docs/settlements/babylon.md §2): the inner city of
// Nebuchadnezzar II. The Processional Way runs south from the Ishtar Gate in the double northern
// wall, between glazed walls, past the Southern Palace on its west, to the precinct of Etemenanki —
// the great ziggurat — with Esagila, Marduk's temple, south of it; the Euphrates flows past on the
// west; houses fill the blocks. Compressed (the inner city is about 2.5 km across). Pure data.
// +x east, +z south.

export const RADIUS = 420;
export const WAY = { x: -40, z0: -380, z1: -60, w: 20 };
export const GATE = { c: [-40, -300] };
export const WALL_Z = -300;
/** The Southern Palace, its north side built against the inner city wall (Imgur-Enlil, z −284…−280) west of the Ishtar Gate. */
export const PALACE = [-200, -281, -70, -161];
export const PRECINCT = [-110, -60, 110, 150];
export const ZIGGURAT = { c: [0, 40] };
/** Esagila (Koldewey: 79.3 m on the north front, 85.8 m on the west). */
export const ESAGILA = [-40, 174, 40, 260];
export const RIVER = { x: -290, w: 70, level: -3, bed: -6 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const riverX = (z) => RIVER.x + 18 * Math.sin(z / 140);
export const inRiver = (x, z) => Math.abs(x - riverX(z)) < RIVER.w / 2 + 8 && height(x, z) < RIVER.level - 0.3;
export function height(x, z) {
  const d = Math.abs(x - riverX(z)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  return RIVER.bed * smooth(RIVER.w / 2 + 8, RIVER.w / 2 - 6, d) * (1 - edge);
}
export const onWay = (x, z, m = 0) => Math.abs(x - WAY.x) < WAY.w / 2 + m && z > WAY.z0 && z < WAY.z1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The market at the east end of the bridge (docs/settlements/babylon.md §5.2): no houses on it. */
export const MARKET = [-236, 8, -172, 66];
/** The bridge over the Euphrates west of Etemenanki (its axis), and the quay wall of the east bank (from the river's middle). */
export const BRIDGE = { z: 40, y: 0.45 };
export const QUAY = { z0: -150, z1: 250, d0: 31, d1: 44, y: 0.3 };
export const inQuay = (x, z, m = 0) => z > QUAY.z0 - m && z < QUAY.z1 + m && x - riverX(z) > QUAY.d0 - 4 - m && x - riverX(z) < QUAY.d1 + m;

// ---- the lanes and the blocks (docs/settlements/babylon.md §13) ---------------------------------------------------
// The inner city is a grid of lanes 5 m wide (the streets of Babylon ran straight and at right angles: Herodotus 1.180,
// "the houses ... of three and four storeys, and the streets all run in straight lines"), the Processional Way between two
// lanes that run beside it. Between the lanes lie blocks of houses built shoulder to shoulder: a row on each side facing its
// lane, and inside a back-to-back pair of rows on a 3 m alley. Lines of the lanes (centres):
const PITCH_X = 62, PITCH_Z = 64, LANE = 5;
export const XL = [];
for (let k = 0; k < 8; k++) XL.push(-53.5 - k * PITCH_X);
for (let k = 0; k < 9; k++) XL.push(-26.5 + k * PITCH_X);
XL.sort((a, b) => a - b);
export const ZL = [];
for (let k = -5; k <= 6; k++) ZL.push(40 + k * PITCH_Z);
const SKIP = (x, z, m = 0) => inRect(PALACE, x, z, m + 2) || inRect(PRECINCT, x, z, m + 2) || inRect(ESAGILA, x, z, m + 4) || inRect(MARKET, x, z, m + 2) || onWay(x, z, m + 2) || (Math.abs(x - WAY.x) < 30 && z < PALACE[3] + 4)
  || Math.abs(x - riverX(z)) < RIVER.w / 2 + 14 + m || z > 330 || z < WALL_Z + 10 || Math.hypot(x, z) > RADIUS - 40;
/** Is this point on a lane (its centre line within LANE/2 of a line and the lane not cut off by a landmark)? */
export function onLane(x, z, m = 0) {
  const hw = LANE / 2 + m;
  let ax = false, az = false;
  for (const l of XL) if (Math.abs(x - l) < hw) { ax = true; break; }
  for (const l of ZL) if (Math.abs(z - l) < hw) { az = true; break; }
  return (ax || az) && !SKIP(x, z, -2);
}
/** Widths for a run of houses along `len` metres, each 8.6 to 13.6 m. */
function split(rand, len) {
  const n = Math.max(1, Math.round(len / 11)), w = [];
  let sum = 0;
  for (let i = 0; i < n; i++) { w.push(0.8 + rand() * 0.45); sum += w[i]; }
  return w.map((a) => a / sum * len);
}
/** The door's side from a seed, as ur_house chooses it (sumerian/index.js urHouse: four draws, the fourth is the side). */
const FACES = ['n', 's', 'w', 'e'];
function seedFor(rand, door) {
  for (;;) {
    const seed = 1 + Math.floor(rand() * 1e6), r = rng(seed);
    r(); r(); r();
    if (FACES[Math.floor(r() * 4)] === door) return seed;
  }
}
let LOTS = null, ALLEYS = null, YARDS = null;
const TRADES = ['potter', 'baker', 'weaver', 'brewer', 'smith', 'grocer', 'carpenter'];
function build() {
  LOTS = []; ALLEYS = []; YARDS = [];
  const rand = rng(570), xs = XL, zs = ZL;
  const addRow = (x0, z0, x1, z1, door, kind) => {
    const along = door === 'n' || door === 's', L = along ? x1 - x0 : z1 - z0;
    let a = along ? x0 : z0;
    for (const w of split(rand, L)) {
      const r = along ? [a, z0, a + w, z1] : [x0, a, x1, a + w];
      a += w;
      const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
      if (SKIP(cx, cz) || SKIP(r[0], r[1]) || SKIP(r[2], r[3]) || SKIP(r[0], r[3]) || SKIP(r[2], r[1])) continue;
      const q = rand();
      if (q < 0.045) { YARDS.push({ rect: r, door, kind: ['garden', 'pen', 'brickyard', 'garden', 'kiln'][Math.floor(rand() * 5)], seed: Math.floor(rand() * 1e6) }); continue; }
      LOTS.push({ rect: r, door, seed: seedFor(rand, door), col: kind });
    }
  };
  for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < zs.length; j++) {
    let x0 = xs[i] + LANE / 2, x1 = xs[i + 1] - LANE / 2, z0 = zs[j] + LANE / 2, z1 = zs[j + 1] - LANE / 2;
    if (x1 - x0 < 30) continue;
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (Math.hypot(mx, mz) > RADIUS + 20) continue;
    const CW = 13, fullW = Math.abs(x0 + 24) < 0.01, fullE = Math.abs(x1 + 56) < 0.01;
    // the columns that face the Way
    if (fullW) { addRow(x0, z0, x0 + CW, z1, 'w', 'way'); x0 += CW; }
    if (fullE) { addRow(x1 - CW, z0, x1, z1, 'e', 'way'); x1 -= CW; }
    const wide = x1 - x0 > 46 && !fullW && !fullE;
    addRow(x0, z0, x1, z0 + 14, 'n', 'row');
    addRow(x0, z1 - 14, x1, z1, 's', 'row');
    const band0 = z0 + 14, band1 = z1 - 14;
    if (wide) {
      addRow(x0, band0, x0 + CW, band0 + 14, 'w', 'col'); addRow(x0, band1 - 14, x0 + CW, band1, 'w', 'col');
      addRow(x1 - CW, band0, x1, band0 + 14, 'e', 'col'); addRow(x1 - CW, band1 - 14, x1, band1, 'e', 'col');
      addRow(x0 + CW, band0, x1 - CW, band0 + 14, 's', 'inner'); addRow(x0 + CW, band1 - 14, x1 - CW, band1, 'n', 'inner');
      ALLEYS.push([x0 - LANE / 2, band0 + 14, x1 + LANE / 2, band1 - 14]);
    } else {
      addRow(x0, band0, x1, band0 + 14, 's', 'inner'); addRow(x0, band1 - 14, x1, band1, 'n', 'inner');
      ALLEYS.push([x0, band0 + 14, x1, band1 - 14]);
    }
  }
  // which houses are open to the visitor (furnished), and which are shops (§13): in the core, on the lanes beside the Way
  // and on the first lanes east of the river road, a house in every few
  const dist = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 40, (l.rect[1] + l.rect[3]) / 2 + 100);
  const dims = (l) => (l.door === 'n' || l.door === 's' ? [l.rect[2] - l.rect[0], l.rect[3] - l.rect[1]] : [l.rect[3] - l.rect[1], l.rect[2] - l.rect[0]]);
  const near = LOTS.filter((l) => dist(l) < 230 && dims(l)[0] >= 11 && dims(l)[1] >= 10.5);
  const rr = rng(2305);
  let nOpen = 0, nShop = 0;
  for (const l of near) {
    const way = l.col === 'way', q = rr();
    if (way && dist(l) < 120 && q < 0.42 && nOpen < 8) { l.open = true; nOpen++; if (nOpen === 4) l.school = true; }
    else if (q < (way ? 0.78 : 0.13) && nShop < 26 && (way || dist(l) < 200)) { l.shop = TRADES[nShop++ % TRADES.length]; }
    else if (!way && q > 0.93 && nOpen < 16) { l.open = true; nOpen++; }
  }
  // (the ones east of the Way are given the lane's first houses as shops too)
}
/** The houses of the blocks: { rect, door, seed, open?, school?, shop? }. */
export function lots() { if (!LOTS) build(); return LOTS; }
/** The 3 m alleys between the back-to-back rows: [x0, z0, x1, z1]. */
export function alleys() { if (!ALLEYS) build(); return ALLEYS; }
/** The walled yards in the blocks (gardens, pens, brickyards, a potter's kiln) where no house stands: { rect, door, kind, seed }. */
export function yards() { if (!YARDS) build(); return YARDS; }
let GRID = null;
const GC = 16;
/** Is the point in a house or a yard (grid of 16 m cells, each listing the rectangles that touch it ± 2 m). */
export function inLot(x, z, m = 0) {
  if (!GRID) {
    GRID = new Map();
    for (const l of [...lots(), ...yards()]) {
      const r = l.rect;
      for (let i = Math.floor((r[0] - 2) / GC); i <= Math.floor((r[2] + 2) / GC); i++) for (let j = Math.floor((r[1] - 2) / GC); j <= Math.floor((r[3] + 2) / GC); j++) { const k = i * 4096 + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(r); }
    }
  }
  const c = GRID.get(Math.floor(x / GC) * 4096 + Math.floor(z / GC));
  return !!c && c.some((r) => inRect(r, x, z, m));
}

/** The paving of the lanes in the core (baked brick), as rectangles that do not overlap: x-lanes whole, z-lanes cut at them. */
const CORE = (x, z) => Math.hypot(x + 40, z + 60) < 250;
export function laneRects() {
  const out = [], run = (a0, a1, step, ok, mk) => {
    let s = null;
    for (let a = a0; a <= a1 + 1e-6; a += step) {
      const v = ok(a);
      if (v && s == null) s = a;
      if ((!v || a + step > a1 + 1e-6) && s != null) { const e = v ? a : a - step; if (e - s > 3) out.push(mk(s, e)); s = null; }
    }
  };
  for (const l of XL) run(WALL_Z + 12, 330, 2, (z) => !SKIP(l, z, -2) && CORE(l, z), (a, b) => [l - LANE / 2, a, l + LANE / 2, b]);
  for (const l of ZL) {
    const cuts = XL.map((x) => [x - LANE / 2, x + LANE / 2]);
    run(-RADIUS, RADIUS, 2, (x) => !SKIP(x, l, -2) && CORE(x, l) && !cuts.some(([a, b]) => x > a - 1 && x < b + 1), (a, b) => [a + (cuts.some(([c, d]) => Math.abs(a - d) < 1.5) ? 1 : 0) , l - LANE / 2, b - (cuts.some(([c]) => Math.abs(b - c) < 1.5) ? 1 : 0), l + LANE / 2]);
  }
  return out;
}
/** The furniture of the lanes: { at, kind, rot, seed } at the lane's edge every 20–45 m, clear of every open house and shop. */
let PROPS = null;
export function laneProps() {
  if (PROPS) return PROPS;
  PROPS = [];
  const rand = rng(1177), kinds = ['shrine', 'trough', 'bricks', 'bench', 'zir', 'zir', 'bench', 'trough'];
  const doors = lots().filter((l) => l.open || l.shop).map((l) => l.rect);
  const put = (x, z, rot, k) => { if (SKIP(x, z, -2) || !CORE(x, z) || doors.some((r) => inRect(r, x, z, 3.5))) return; PROPS.push({ at: [x, z], kind: kinds[k], rot, seed: Math.floor(rand() * 1e6) }); };
  const half = LANE / 2 - 0.5;
  for (const l of XL) for (let z = WALL_Z + 20; z < 320; z += 20 + rand() * 25) { const e = rand() < 0.5 ? 1 : -1; put(l + e * half, z, e > 0 ? Math.PI / 2 : -Math.PI / 2, Math.floor(rand() * kinds.length)); }
  for (const l of ZL) for (let x = -RADIUS + 20; x < RADIUS - 20; x += 20 + rand() * 25) { const e = rand() < 0.5 ? 1 : -1; put(x, l + e * half, e > 0 ? 0 : Math.PI, Math.floor(rand() * kinds.length)); }
  return PROPS;
}
export const LANE_W = LANE;

/** The six chambers of Esagila's ranges: [{ kind, r (inside), f (the door's face) }] — the same as src/styles/babylonian/temple.js builds. */
export function esagilaChambers([x0, z0, x1, z1] = ESAGILA) {
  const zc = (z0 + z1) / 2, xm = (x0 + x1) / 2, C = [x0 + 32, zc - 18.8, x0 + 32 + 31.3, zc + 18.8], pw = 5, rw = 1.2, out = [];
  for (const north of [true, false]) {
    const a = north ? z0 : C[3], b = north ? C[1] : z1, rz0 = north ? b - rw - 8 : a + rw, rz1 = north ? b - rw : a + rw + 8;
    [[xm + pw / 2 + 1.5, xm + pw / 2 + 10.5], [xm + pw / 2 + 11.5, xm + pw / 2 + 20.5]].forEach(([u0, u1], i) => out.push({ kind: north ? (i ? 'scriptorium' : 'storehouse') : (i ? 'treasury' : 'kitchen'), r: [u0, rz0, u1, rz1], f: north ? 's' : 'n' }));
  }
  for (const north of [true, false]) { const a = north ? C[1] : zc + pw / 2, b = north ? zc - pw / 2 : C[3], rx0 = C[2] + rw; out.push({ kind: north ? 'bakehouse' : 'purification', r: [rx0, a + 1.2, rx0 + 10, b - 1.2], f: 'w' }); }
  return out;
}
