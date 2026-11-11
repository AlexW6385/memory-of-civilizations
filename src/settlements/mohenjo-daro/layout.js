// Mohenjo-daro, c. 2500 BC — the layout (docs/settlements/mohenjo-daro.md §2). The Citadel mound on the west with the Great Bath,
// the granary, the Pillared Hall and the College; the Lower Town in a grid of baked-brick houses east and south of it, lanes of 3 m
// inside blocks bounded by streets of 9 m, doors on the lanes, the market place at the crossing of First Street; the Indus on the
// east with the landing. Compressed from the real 250 ha. Pure data. Coordinates: metres, +x east, +z south, y up.

export const RADIUS = 330;
export const PLAT = 7;                                              // the Citadel platform's top above the plain
export const MOUND = [-246, -120, -64, 40];
export const MOUND_BATTER = [0.8, 0, 0.8, 0];                       // inset at the top: −x, +x, −z, +z (the stairs and the ramp sides are plumb)
export const EAST_STAIR = { rect: [-64, -50, -47, -38] };           // ascends west
export const SOUTH_RAMP = { rect: [-168, 40, -152, 52] };           // ascends north
export const TOP = [MOUND[0] + MOUND_BATTER[0], MOUND[1] + MOUND_BATTER[2], MOUND[2], MOUND[3]];

// the buildings on the platform (rects in x0, z0, x1, z1)
export const BATH = { court: [-167, -98, -143, -70], pool: [-158.5, -90, -151.5, -78], depth: 2.4, outer: [-168.2, -102.2, -131.6, -65.8], gal: 3, wall: 1.2, h: 3.8 };
export const GRANARY = [-234, -108, -184, -85];
export const PILLARED = [-110, -112, -80, -82];
export const COLLEGE = [-194, -58, -120, -22];
export const QUARTERS = [[-241, -76, -198, 34], [-112, -76, -70, 34], [-192, -14, -118, 34]];

// the Lower Town
export const XS = [-214, -122, -30, 62, 154, 246];                  // the N–S streets' centre lines
export const ZS = [-216, -128, -40, 48, 136, 224];                  // the E–W streets'
export const STREET_W = 9, FIRST_W = 10, LANE_W = 3;
export const PLAZA = [38, -64, 86, -16];                            // the market place at the crossing of First Street and the street at z = −40
export const WELL_BIG = [62, -40];
export const WALL_Z = 236;                                          // the town wall on the south (centre line)
export const WALL = { x0: -150, x1: 150, th: 2.6, h: 5, gate: 62 };

// the Indus along the east edge, the landing before the town
export const RIVER = { x: 290, hw: 18, level: -2.0, bed: -4.2 };
export const riverX = (z) => RIVER.x + 3 * Math.sin(z / 90);
export const QUAY = { x0: 250, x1: 270, z0: -110, z1: 70, top: 0.5, stairs: [-80, -20, 40] };
export const CUSTOMS = [236, -64, 248, -46];                        // the harbour office where the seals are pressed, by the quay

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export const inRiver = (x, z) => Math.abs(x - riverX(z)) < RIVER.hw + 6 && Math.hypot(x, z) < RADIUS + 5 && height(x, z) < RIVER.level - 0.3;
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const d = Math.abs(x - riverX(z));
  return RIVER.bed * (1 - smooth(RIVER.hw - 5, RIVER.hw + 4, d)) * (1 - smooth(RADIUS - 18, RADIUS - 2, r));
}

/** The streets as rectangles, free of houses: [x0, z0, x1, z1]. */
export function streets() {
  const out = [], hw = (w) => w / 2;
  XS.forEach((x, i) => {
    const w = i === 3 ? FIRST_W : STREET_W;
    if (x < MOUND[2]) { out.push([x - hw(w), -222, x + hw(w), MOUND[1] - 4], [x - hw(w), MOUND[3] + 4, x + hw(w), 232]); }
    else out.push([x - hw(w), -222, x + hw(w), 232]);
  });
  ZS.forEach((z) => {
    const w = STREET_W - 1;
    if (z === -40) out.push([XS[2] - 4.5, z - hw(w), XS[5] + 4.5, z + hw(w)]);
    else out.push([XS[0] - 4.5, z - hw(w), XS[5] + 4.5, z + hw(w)]);
  });
  return out.filter((r) => r[2] - r[0] > 2 && r[3] - r[1] > 2);
}
/** The lanes inside the blocks. */
let LANES = null;

let LOTS = null;
const free = (r) => !inRect(PLAZA, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 2) && Math.hypot(Math.max(Math.abs(r[0]), Math.abs(r[2])), Math.max(Math.abs(r[1]), Math.abs(r[3]))) < RADIUS - 26 && r[2] < QUAY.x0 - 2;
/** Splits a length into lots of 11–17 m. */
function split(a, b, rand) {
  const L = b - a, n = Math.max(1, Math.round(L / 14)), w = Array.from({ length: n }, () => 0.8 + rand() * 0.4), s = w.reduce((p, q) => p + q, 0);
  const out = []; let x = a;
  for (const k of w) { const e = x + L * k / s; out.push([x, e]); x = e; }
  return out;
}
/**
 * The lots: { rect, front ('e' | 'w' | 'n' | 's': the lane the door is on), kind ('house' | 'bead' | 'seal' | 'potter' | 'bronze' | 'shell' | 'small'), seed, open, y }.
 * A block is cut into four columns by two N–S lanes (the middle two back to back) and into halves by a cross lane.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; LANES = [];
  const rand = rng(2500);
  const block = (r, y, ncol, tag) => {
    const [x0, z0, x1, z1] = r, W = x1 - x0, H = z1 - z0, lw = LANE_W;
    const cw = (W - lw * (ncol === 4 ? 2 : 1)) / ncol, cols = [];
    if (ncol === 4) {
      const l1 = x0 + cw, l2 = x0 + 3 * cw + lw;
      cols.push([x0, x0 + cw, 'e'], [l1 + lw, l1 + lw + cw, 'w'], [l1 + lw + cw, l1 + lw + 2 * cw, 'e'], [l2 + lw, x1, 'w']);
      LANES.push([l1, z0, l1 + lw, z1], [l2, z0, l2 + lw, z1]);
    } else {
      cols.push([x0, x0 + cw, 'e'], [x0 + cw + lw, x1, 'w']);
      LANES.push([x0 + cw, z0, x0 + cw + lw, z1]);
    }
    const cross = H > 60 ? [(z0 + z1) / 2 - 1.25, (z0 + z1) / 2 + 1.25] : null;
    if (cross) LANES.push([x0, cross[0], x1, cross[1]]);
    const segs = cross ? [[z0, cross[0]], [cross[1], z1]] : [[z0, z1]];
    for (const [cx0, cx1, front] of cols) for (const [s0, s1] of segs) for (const [a, b] of split(s0, s1, rand)) {
      const rect = [cx0, a, cx1, b - 0.25];
      if (!free(rect) && tag === 'town') continue;
      LOTS.push({ rect, front, kind: 'house', seed: Math.floor(rand() * 1e6), open: false, y, tag });
    }
  };
  for (let i = 0; i < XS.length - 1; i++) for (let j = 0; j < ZS.length - 1; j++) {
    const r = [XS[i] + (i === 3 ? 5 : 4.5), ZS[j] + 4, XS[i + 1] - (i + 1 === 3 ? 5 : 4.5), ZS[j + 1] - 4];
    if (inRect(MOUND, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 0) || (r[2] > MOUND[0] - 8 && r[0] < MOUND[2] + 8 && r[3] > MOUND[1] - 8 && r[1] < MOUND[3] + 8)) continue;
    if (r[0] < MOUND[2] + 8 && r[1] < -50 && r[1] > -126 && r[0] > MOUND[0]) continue;
    if (Math.hypot(Math.min(Math.abs(r[0]), Math.abs(r[2])), Math.min(Math.abs(r[1]), Math.abs(r[3]))) > RADIUS - 40) continue;
    block(r, 0, 4, 'town');
  }
  for (const q of QUARTERS) block(q, PLAT, q[2] - q[0] > 70 ? 4 : 2, 'top');
  // the trades: workshops in the blocks nearest First Street and the market, furnished houses beside them
  const near = LOTS.filter((l) => l.tag === 'town' && l.y === 0).map((l) => ({ l, d: Math.hypot((l.rect[0] + l.rect[2]) / 2 - 62, (l.rect[1] + l.rect[3]) / 2 + 10) })).sort((a, b) => a.d - b.d).map((o) => o.l);
  const trades = ['bead', 'seal', 'potter', 'bronze', 'shell', 'bead', 'potter', 'seal'];
  let t = 0, k = 0;
  for (const l of near) {
    if (t < trades.length && l.rect[3] - l.rect[1] >= 12 && k % 7 === 3) { l.kind = trades[t++]; l.open = t <= 5; }
    else if (k % 9 === 5 && l.rect[3] - l.rect[1] >= 11) l.open = true;
    k++;
  }
  // a few small, poor houses (a single row of rooms), and the open ones on the platform
  for (const l of LOTS) if (l.kind === 'house' && l.seed % 11 === 0 && !l.open) l.kind = 'small';
  const top = LOTS.filter((l) => l.tag === 'top'); if (top[3]) top[3].open = true;
  return LOTS;
}
export function lanes() { lots(); return LANES; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
const GRID = new Map();
export function lotAt(x, z) {
  if (!GRID.size) for (const l of lots()) for (let i = Math.floor(l.rect[0] / 16); i <= Math.floor(l.rect[2] / 16); i++) for (let j = Math.floor(l.rect[1] / 16); j <= Math.floor(l.rect[3] / 16); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(l); }
  return (GRID.get(Math.floor(x / 16) + ',' + Math.floor(z / 16)) || []).find((l) => inRect(l.rect, x, z));
}
