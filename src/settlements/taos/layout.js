// Taos Pueblo (c. 1500) — the layout (docs/settlements/taos.md §2): the North House and the South
// House framing the east–west plaza, Red Willow Creek flowing west through it, kivas round about,
// the racks on the plaza's north side, the perimeter wall, fields beyond; the ground rising toward
// the mountain in the north-east. Pure data. +x east, +z south.

export const RADIUS = 320;
export const CELL = 5;
export const WALL = [-150, -150, 150, 140];
export const CREEK = { w: 5, bed: -1.3, water: -0.9 };
export const creekZ = (x) => 4 * Math.sin(x / 55) + x * 0.04;
export const inCreek = (x, z, m = 0) => Math.abs(z - creekZ(x)) < CREEK.w / 2 + m && Math.hypot(x, z) < RADIUS - 26;
export const KIVAS = [[-110, -30, 6], [-60, 30, 5.5], [95, -25, 6], [60, 120, 5.5], [-120, 95, 5], [120, 70, 5.5]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A house block's storeys on a grid: highest at the back, stepping down to the plaza and to its ends, alleys across it, ragged edges. */
function block(cols, rows, top, back, seed, alleys) {
  const rand = rng(seed), H = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const fromBack = back === 'n' ? i : rows - 1 - i, fromMid = Math.abs(j - (cols - 1) / 2);
      let h = top - Math.floor(fromBack / 1.7) - Math.floor(fromMid / (cols / 7)) + (rand() < 0.15 ? -1 : 0);
      if (alleys.includes(j)) h = 0;
      if ((j === 0 || j === cols - 1 || fromBack === rows - 1) && rand() < 0.35) h = 0;
      row.push(Math.max(0, Math.min(top, h)));
    }
    H.push(row);
  }
  // no bare lots in the block: a gap with two built neighbours is built over (a one-storey room), and the plaza face is a
  // continuous ground storey but for the alleys and the ragged ends (the pueblo's rooms are added to one another, not strewn)
  for (let pass = 0; pass < 2; pass++) {
    const src = H.map((r) => r.slice());
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      if (src[i][j] || alleys.includes(j)) continue;
      let n = 0;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) if ((di || dj) && (src[i + di]?.[j + dj] ?? 0) > 0) n++;
      if (n >= 2) H[i][j] = 1;
    }
  }
  const fr = back === 'n' ? rows - 1 : 0;
  for (let j = 2; j < cols - 2; j++) if (!alleys.includes(j) && !H[fr][j]) H[fr][j] = 1;
  return H;
}
export const NORTH = { x0: -75, z0: -98, heights: block(24, 9, 5, 'n', 1450, [8, 16]), front: 's' };
export const SOUTH = { x0: -35, z0: 46, heights: block(19, 8, 4, 's', 1000, [9]), front: 'n' };
/** The room opened and furnished (docs/settlements/taos.md §4.2): a ground-storey cell of the North House on the plaza, its doorway south. */
export const ROOM = { b: 'N', i: 8, j: 11, door: 's', kind: 'home' };
/** The storeroom beside it (§4.3): the next ground-storey cell but one, its doorway also on the plaza. */
export const STORE = { b: 'N', i: 8, j: 14, door: 's', kind: 'store', store: true };
/**
 * The rooms opened and furnished (§4.5): ground-storey cells on the plaza face of each house, each with its doorway on the plaza —
 * homes, storerooms, weaving rooms, sleeping rooms, workrooms (hunting and hide work), potters' rooms.
 */
export const ROOMS = [
  ROOM, STORE,
  { b: 'N', i: 8, j: 3, door: 's', kind: 'weave' }, { b: 'N', i: 8, j: 5, door: 's', kind: 'sleep' }, { b: 'N', i: 8, j: 7, door: 's', kind: 'work' },
  { b: 'N', i: 8, j: 10, door: 's', kind: 'pottery' }, { b: 'N', i: 8, j: 18, door: 's', kind: 'sleep' }, { b: 'N', i: 8, j: 20, door: 's', kind: 'weave' }, { b: 'N', i: 8, j: 17, door: 's', kind: 'home' },
  { b: 'S', i: 0, j: 3, door: 'n', kind: 'home' }, { b: 'S', i: 0, j: 5, door: 'n', kind: 'pottery' }, { b: 'S', i: 0, j: 7, door: 'n', kind: 'work' },
  { b: 'S', i: 0, j: 11, door: 'n', kind: 'weave' }, { b: 'S', i: 0, j: 13, door: 'n', kind: 'store', store: true }, { b: 'S', i: 0, j: 15, door: 'n', kind: 'sleep' },
];
/** The rooms of one house block, and whether a cell is one. */
export const roomsOf = (B) => ROOMS.filter((r) => r.b === (B === NORTH ? 'N' : 'S'));
export const isRoom = (B, i, j) => roomsOf(B).some((r) => r.i === i && r.j === j);
export const nearRoom = (B, i, j) => roomsOf(B).some((r) => r.i === i && Math.abs(r.j - j) <= 1);
const rectOf = (b) => [b.x0, b.z0, b.x0 + b.heights[0].length * CELL, b.z0 + b.heights.length * CELL];
export const NORTH_RECT = rectOf(NORTH), SOUTH_RECT = rectOf(SOUTH);
export const inHouses = (x, z, m = 0) => inRect(NORTH_RECT, x, z, m) || inRect(SOUTH_RECT, x, z, m);
/** The working yards of the plaza (docs/settlements/taos.md §4.3), each square to the plaza: cooking (steaming pit and griddle), puddling and building with mud. */
export const YARDS = { cook: [[-8, -30], [24, 36]], mud: [[-52, -17], [46, 17]], vigas: [[-66, -49, Math.PI / 2], [46, -49, Math.PI / 2], [-48, 43.5, Math.PI / 2]] };
export const nearYard = (x, z, m = 0) => [...YARDS.cook.map(([a, b]) => [a - 3.2, b - 1.8, a + 4.2, b + 1.8]), ...YARDS.mud.map(([a, b]) => [a - 3.2, b - 3.4, a + 3.4, b + 1.4]), ...YARDS.vigas.map(([a, b]) => [a - 3, b - 2, a + 3, b + 2])].some((r) => inRect(r, x, z, m));
/** The ground's height at a creek bank (as ground.js): the bed at CREEK.bed, rising to the plain over a smoothstep from 2 m to 4.5 m off the middle line. */
export const bankY = (dz) => (dz < CREEK.w / 2 + 2 ? CREEK.bed * smooth(CREEK.w / 2 + 2, CREEK.w / 2 - 0.5, dz) : 0);
/** The turkey pens of the plaza (§4.5), each a ring of stakes 2 m in radius with a gap toward +x, the flock inside. */
export const PENS = [[-30, 26], [56, -12], [-58, -30]];
/** The plaza proper, between the two house blocks. */
export const PLAZA = [-70, -45, 70, 40];
/** The racks' footprints (x0, x1 at z −44: poles and bins), kept clear of the plaza's scatter. */
export const RACKS = [[-62, -34], [-27, -1], [8, 36]];
/** The ways kept open for the visitor: the arrival and the route to the log bridge and the north house, the road out of the south gap. */
export const KEEP = [[[0, 200], [0, 141]], [[0, 141], [0, 30]], [[0, 30], [-35, 10]], [[-35, 10], [-35, -40]]];
export const distSeg = (x, z, [[ax, az], [bx, bz]]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - ax - dx * t, z - az - dz * t); };
export const onKeep = (x, z, m = 0) => KEEP.some((s) => distSeg(x, z, s) < m);
