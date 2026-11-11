// Ajanta, c. 480 (docs/settlements/ajanta.md §2, §6) — the layout. Pure data.
// +x east, +z south. The main cliff face stands at x = XF looking east, the rock behind it (west); two wings return
// east at z = ±ZW (their faces look into the pocket) so that the cliff is a squared horseshoe open to the east.
// The Waghora comes in round the north wing's end, bends under the main face and leaves round the south wing.
// On the east bank, the village of the workers; the path runs along the gorge floor.

export const RADIUS = 190;
export const XF = -60;                               // the main face
export const ROCK = 44;                              // depth of the rock behind a face
export const ZW = 60;                                // the wings' faces at z = ±ZW
export const WX1 = XF + 48;                          // the wings' east ends
export const ZOUT = ZW + ROCK;                       // the wings' outer sides
export const FLOOR = [0.0, 9.0, 20.0];               // gorge floor, the ledge, the unreachable upper tier
export const LEDGE = { x0: XF, x1: XF + 6, z0: -57, z1: 57 };
export const STAIR = { x0: XF + 6, x1: XF + 8.4, z0: -57, z1: -42 };   // rises to the south from the path to the ledge
export const PLATEAU = 30;
export const EAST = 6;                               // the east bank's plateau, over the gorge floor
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The faces: map(d, s) → [x, z] (d metres into the rock, s along the face), out: the unit vector out of the rock, s0..s1 the span, top(s). */
export const FACES = {
  main: { id: 'main', map: (d, s) => [XF - d, s], out: [1, 0], s0: -ZW - 2, s1: ZW + 2, top: (s) => 34 + 2.5 * Math.sin(s * 0.09) },
  north: { id: 'north', map: (d, s) => [s, -ZW - d], out: [0, 1], s0: XF, s1: WX1, top: (s) => 30 + 2 * Math.sin(s * 0.13) },
  south: { id: 'south', map: (d, s) => [s, ZW + d], out: [0, -1], s0: XF, s1: WX1, top: (s) => 30 + 2 * Math.cos(s * 0.11) },
};

/** The caves: kind 'vihara' (Cave 1), 'chaitya' (Cave 19), 'cell' (a small vihara), 'recess' (a shrine niche). tier 0/1/2 → FLOOR. */
export const C1 = { z: -26 }, C19 = { z: 24 }, C12 = { z: 46 };
export const CAVES = [];
{
  const r = rng(480);
  CAVES.push({ id: 'c1', face: 'main', kind: 'vihara', s: C1.z, tier: 1 });
  CAVES.push({ id: 'c19', face: 'main', kind: 'chaitya', s: C19.z, tier: 1 });
  CAVES.push({ id: 'c12', face: 'main', kind: 'cell', s: C12.z, tier: 1 });
  for (const s of [-50, -7, 3, 12, 35]) CAVES.push({ id: 'm1_' + s, face: 'main', kind: 'recess', s, tier: 1, w: 3.2 + r() * 0.8, h: 3.2 + r() * 0.6, seed: s });
  for (const s of [-52, -40, -28, -16, -4, 8, 20, 34, 48]) CAVES.push({ id: 'm2_' + s, face: 'main', kind: 'recess', s: s + (r() - 0.5) * 3, tier: 2, w: 2.8 + r(), h: 2.8 + r() * 0.6, seed: s + 7 });
  for (const f of ['north', 'south']) {
    for (const s of [XF + 8, XF + 17, XF + 26, XF + 35, XF + 43]) if (!(f === 'north' && s === XF + 35)) CAVES.push({ id: `${f}0_${s}`, face: f, kind: 'recess', s, tier: 0, w: 3.4 + r(), h: 3.4 + r() * 0.6, seed: s + (f === 'north' ? 3 : 5) });
    for (const s of [XF + 12, XF + 22, XF + 32, XF + 41]) CAVES.push({ id: `${f}1_${s}`, face: f, kind: 'recess', s, tier: 1, w: 3 + r(), h: 3 + r() * 0.6, seed: s + 11 });
  }
}

/** The river: from the north-east bend, round under the main face, out to the south-east. */
export const RIVER = { w: 10, bed: -0.9, water: -0.35 };
export const riverX = (z) => XF + 30 + 0.0105 * z * z + 4 * Math.sin(z / 19);
export const inRiver = (x, z, m = 0) => Math.abs(x - riverX(z)) < RIVER.w / 2 + m && Math.hypot(x, z) < RADIUS - 30;
export const bankY = (d) => (d < RIVER.w / 2 + 2 ? RIVER.bed * smooth(RIVER.w / 2 + 2, RIVER.w / 2 - 0.4, d) : 0);
/** The ford: stepping stones across the river at z = FORD. */
export const FORD = { z: 14 };
/** The waterfall down the north wing's face into its pool. */
export const FALL = { x: XF + 36, z: -ZW + 0.6, w: 2.6, pool: [XF + 36, -ZW + 5.5], pr: 4.2 };
export const inPool = (x, z, m = 0) => Math.hypot(x - FALL.pool[0], z - FALL.pool[1]) < FALL.pr + m;

/** The paths along the gorge floor (polylines): the west bank from the north gap past the stair's foot and the ford to the south gap; the ford's crossing and the way to the village. */
export const PATHS = [
  [[10, -120], [3, -90], [-4, -70], [-6, -58], [-8, -44], [-48, -44], [-48, -20], [-48, 14], [-48, 40], [-8, 50], [-4, 62], [3, 90], [10, 120]],
  [[-48, -44], [-48, -54]],
  [[-48, 14], [-15, 14], [20, 20], [40, 30]],
];
export const PATH_W = 2.2;
export const VILLAGE = [XF + 98, 4, XF + 160, 70];   // x0 z0 x1 z1 (the huts east of the river, south of the ford)
export const WELL = [XF + 120, 30];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export function onPath(x, z, m = 0) {
  for (const P of PATHS) for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), px = ax + dx * t, pz = az + dz * t;
    if (Math.hypot(x - px, z - pz) < PATH_W / 2 + m) return true;
  }
  return false;
}
/** The footprint of the rock (the main block and both wings) for the terrain. */
export const inRock = (x, z, m = 0) => (x > XF - ROCK - m && x < XF + m && Math.abs(z) < ZOUT + m) || (x >= XF - m && x < WX1 + m && Math.abs(z) > ZW - m && Math.abs(z) < ZOUT + m);
export const SHELTER = [XF + 14, -52, XF + 19, -47];   // the pilgrims' shelter at the stair's foot
