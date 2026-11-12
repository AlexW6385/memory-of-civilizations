// Hakka tulou, Fujian, c. 1710 — the layout (docs/settlements/hakka-tulou.md §2): the clan's round tulou
// in the middle of a small valley, its gate south toward the drying ground and the stream, neighbouring
// tulou round and square on the valley floor, paddy in terraces up the hill behind (north) and on the
// valley's flanks, tea on the upper terraces. Pure data. +x east, +z south.

export const RADIUS = 190;
export const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The landmark: Chengqi's pattern (docs §4.1). Floors' tops (m), the eave and ridge. */
export const T = {
  c: [0, 0], R: 31.3, n: 72,
  floors: [0, 3.7, 7.0, 10.2], eave: 13.4, ridge: 15.5,
  roomDepth: 4.0, gallery: 1.7,          // rooms from the wall's inner face (r 29.8) inward to 25.8; the gallery 25.8 → 24.1
  wallIn: 29.8, front: 25.8, rail: 24.1,
  // the second ring: 40 rooms, two storeys, between r 14.3 and 17.9; its inner face opens on the hall's court
  ring2: { n: 40, r0: 14.3, r1: 17.9, floors: [0, 3.4], eave: 6.8, ridge: 8.3 },
  hall: [-7, -5.5, 7, 5.5],
  wells: [[-10.2, 4.0], [10.2, -4.0]],
  gateW: 2.4,
};
export const gateOf = (c, R) => [c[0], c[1] + R];

/** Neighbouring tulou (docs §2, §4.2): kind, centre, radius or half-size, storeys. */
export const NEIGHBOURS = [
  { id: 'sq-w', kind: 'square', c: [-92, -6], half: 21, floors: 3, yaw: 0, gate: 's' },
  { id: 'rd-e', kind: 'round', c: [80, 30], R: 14, floors: 3, gate: 's' },
  { id: 'rd-s', kind: 'round', c: [-66, 122], R: 19, floors: 4, gate: 'n' },
  { id: 'sq-ne', kind: 'square', c: [98, -62], half: 17, floors: 3, yaw: 0, gate: 's' },
];
/** Farm buildings (pigsty, barn) outside the walls: [cx, cz, w, d, yaw-ish]. */
export const FARMS = [[-40, 40, 9, 5], [42, 50, 8, 5], [-35, -52, 8, 5], [24, -50, 9, 5]];

/** The drying ground south of the gate. */
export const YARD = [-14, 33.5, 14, 56];

/** The stream: east–west on the south side, in a shallow cobbled bed (like a hill stream of the valley). */
export const STREAM = { w: 5.5, bed: -1.4, water: -0.9 };
export const streamZ = (x) => 80 + 5 * Math.sin(x / 38) + 2 * Math.sin(x / 13 + 1);
export const inStream = (x, z, m = 0) => Math.abs(z - streamZ(x)) < STREAM.w / 2 + m && Math.abs(x) < RADIUS - 8;
export const BRIDGE_X = 0;
export const bankY = (dz) => (dz < STREAM.w / 2 + 2 ? STREAM.bed * sm(STREAM.w / 2 + 2, STREAM.w / 2 - 0.5, dz) : 0);

/** The road from the south gate to the bridge, and on over the stream to the south. */
export const ROAD = [-2, 52, 2, 140];

/**
 * The hamlet of ordinary houses (docs §4.4): two storeys of rammed earth on a granite foot, a tiled roof with a deep front
 * eave, three bays (hall in the middle, a kitchen and a bedroom beside it), a loft over the back. Rows face the yard
 * and the road; yaw is a quarter turn: PI/2 faces east, -PI/2 faces west. [x of the front line, z start, count, yaw].
 */
export const HOUSE = { w: 7.4, d: 8.6, gap: 0.1 };
const ROWS = [
  { front: -16.0, z0: 33.8, n: 3, yaw: Math.PI / 2 }, { front: 16.0, z0: 33.8, n: 3, yaw: -Math.PI / 2 },
  { front: -2.9, z0: 57.4, n: 1, yaw: Math.PI / 2, off: 0 }, { front: 2.9, z0: 57.4, n: 1, yaw: -Math.PI / 2, off: 0 },
  { front: -2.9, z0: 91.6, n: 4, yaw: Math.PI / 2 }, { front: 2.9, z0: 91.6, n: 4, yaw: -Math.PI / 2 },
];
export const HOUSES = [];
for (const r of ROWS) for (let q = 0; q < r.n; q++) {
  const east = Math.sin(r.yaw) > 0, cx = r.front + (east ? -1 : 1) * (HOUSE.d / 2 + 1.3), cz = r.z0 + HOUSE.w / 2 + q * (HOUSE.w + HOUSE.gap);
  HOUSES.push({ c: [cx, cz], yaw: r.yaw, w: HOUSE.w, d: HOUSE.d, seed: HOUSES.length + 3 });
}
/** The mill-less water works: a bamboo noria (筒车) turning in the stream, a pair of washing steps, the earth-god shrines. */
export const NORIA = { x: -14, r: 3.2, axle: 2.3 };
export const WASH_STEPS = [[10.5, -1], [-31, -1], [46, -1]];
export const SHRINES = [[-4.3, 70.5, Math.PI / 2], [-70.2, 100, 0], [33, 33, Math.PI]];
/** Kitchen gardens behind the rows: [x0, z0, x1, z1]. */
export const PLOTS = [[-33, 33.8, -26.6, 56.2], [26.6, 33.8, 33, 56.2], [-18, 91.6, -12.6, 121.6], [12.6, 91.6, 18, 121.6]];

/** The solid footprints (tulou, farm buildings) for planting and walkers: [x0, z0, x1, z1]. */
export function footprints() {
  const out = [[-T.R - 3, -T.R - 3, T.R + 3, T.R + 3]];
  for (const n of NEIGHBOURS) { const h = n.kind === 'square' ? n.half : n.R; out.push([n.c[0] - h - 2.5, n.c[1] - h - 2.5, n.c[0] + h + 2.5, n.c[1] + h + 2.5]); }
  for (const [x, z, w, d] of FARMS) out.push([x - w / 2 - 1, z - d / 2 - 1, x + w / 2 + 1, z + d / 2 + 1]);
  for (const h of HOUSES) { const q = Math.abs(Math.sin(h.yaw)) > 0.5, hx = (q ? h.d : h.w) / 2 + 1.4, hz = (q ? h.w : h.d) / 2 + 1.4; out.push([h.c[0] - hx, h.c[1] - hz, h.c[0] + hx, h.c[1] + hz]); }
  for (const r of PLOTS) out.push([r[0], r[1], r[2], r[3]]);
  for (const [x, z] of SHRINES) out.push([x - 1.4, z - 1.4, x + 1.4, z + 1.4]);
  out.push([NORIA.x - 3.5, streamZ(NORIA.x) - 6, NORIA.x + 3.5, streamZ(NORIA.x) + 6]);
  return out;
}
const FOOT = footprints();
export const inFoot = (x, z, m = 0) => FOOT.some((r) => inRect(r, x, z, m));

/** The hill's raw height: the valley floor flat, the hills rising north, east and west. */
export function hill(x, z) {
  const n = Math.max(0, -z - 88) * 0.42 + Math.max(0, Math.abs(x) - 122) * 0.38 + Math.max(0, z - 150) * 0.12;
  return n + 2.4 * sm(0, 1, n / 6) * Math.sin(x / 23) * Math.cos(z / 29);
}
export const STEP = 0.75;
/** Terraces: the slope cut into level treads with short steep risers. */
export function terrace(h) {
  if (h < 0.6) return h;
  const k = Math.floor(h / STEP), f = h / STEP - k;
  return (k + sm(0.55, 1, f)) * STEP;
}
/** Where the ground is terraced (the hills), 0…1. */
export const terraced = (x, z) => sm(0.4, 2.0, hill(x, z));

/** The fully furnished rooms of the landmark: kind by floor index k and room index i (docs §4.1: kitchens below, grain store, bedrooms). */
export const FURNISH_FULL = [
  ...[14, 15, 16, 17, 19, 20, 21, 23, 26, 29, 32].map((i) => ({ k: 0, i, kind: 'kitchen' })),
  ...[14, 15, 20, 24, 28].map((i) => ({ k: 1, i, kind: 'granary' })),
  ...[15, 17, 19, 22, 27, 31].map((i) => ({ k: 2, i, kind: 'bedroom' })),
  ...[16, 21, 25].map((i) => ({ k: 3, i, kind: 'bedroom' })),
];
/**
 * Every room of a ring is furnished (docs §4.1: a family owned a vertical slice, kitchen below to bedroom above); the rooms
 * not in `full` get the light version of their floor's kind (fewer pieces, one obstacle). Bays (stairs) and the gate
 * passages on the ground floor stay empty. Kinds vary by room: tools, loom, tea and the household altar among them.
 */
export function furnishRing(n, K, { gates = [], bays = [], full = [] } = {}) {
  const out = [], da = 360 / n, idx = (g) => Math.round(g / da), G = gates.map(idx), Bs = bays.map(idx);
  const near = (list, i) => list.some((b) => Math.abs((((i - b) % n) + n * 1.5) % n - n / 2) <= 1);
  for (let k = 0; k < K; k++) for (let i = 0; i < n; i++) {
    if (near(Bs, i) || (k === 0 && G.includes(i))) continue;
    const f = full.find((q) => q.k === k && q.i === i), h = ((i * 2654435761 + k * 40503) >>> 0) % 100;
    if (f) { out.push({ ...f, light: false }); continue; }
    let kind;
    if (k === 0) kind = h < 14 ? 'tools' : h < 24 ? 'pen' : 'kitchen';
    else if (k === 1) kind = h < 20 ? 'loom' : h < 34 ? 'tools' : 'granary';
    else kind = h < 22 ? 'tea' : h < 30 ? 'loom' : 'bedroom';
    out.push({ k, i, kind, light: true });
  }
  return out;
}
export const FURNISH = furnishRing(T.n, T.floors.length, { gates: [90, 270], bays: [0, 180], full: FURNISH_FULL });
/** A point of the landmark in polar form (r, angle in degrees from +x toward +z). */
export const polar = (r, deg) => [T.c[0] + r * Math.cos(deg * Math.PI / 180), T.c[1] + r * Math.sin(deg * Math.PI / 180)];
/** The outer lane of the court (between the two rings) and the inner court. */
export const inLandmark = (x, z, m = 0) => Math.hypot(x - T.c[0], z - T.c[1]) < T.R + m;
