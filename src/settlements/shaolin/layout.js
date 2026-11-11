// Shaolin Monastery and Mount Song, c. 1600 — the layout (docs/settlements/shaolin.md §8). Pure data.
// +x east, +z south. The axis runs north–south on x = 0; the compound faces south; Mount Song rises north.

export const RADIUS = 190;
export const WALL = [-62, -112, 62, 128.25];            // the monastery's red wall
export const AXIS = {
  shanmen: [-10, 125, 10, 131.5],
  tianwang: [-11, 88, 11, 95],
  mahavira: [-15, 33, 15, 44.5],
  fatang: [-10, -2, 10, 5.5],
  fangzhang: [-8, -32, 8, -26],
  lixue: [-6, -58, 6, -52],
  qianfo: [-15, -94, 15, -81],
};
export const PLAT = { shanmen: 0.5, tianwang: 0.6, mahavira: 1.2, fatang: 0.7, fangzhang: 0.45, lixue: 0.5, qianfo: 1.4 };
export const HGT = { shanmen: 5.6, tianwang: 6.0, mahavira: 7.0, fatang: 5.6, fangzhang: 4.4, lixue: 4.2, qianfo: 7.2 };
export const BELL = [-25, 70, -17, 78], DRUM = [17, 70, 25, 78];
/** The cross walls dividing the courts: z, with a gateway on the axis. */
/** The cross walls dividing the courts run along the halls' lines; each is built to the hall's flank, with a side gate. */
export const CROSS = [['shanmen', 128], ['tianwang', 91.5], ['mahavira', 38.7], ['fatang', 1.7], ['fangzhang', -29], ['lixue', -55], ['qianfo', -87.5]];
/** Side ranges: monks' cells, guest hall, refectory, kitchen, Sixth Patriarch's hall (rect, front side, kind). */
export const RANGES = [
  { rect: [-52, 100, -42, 113], front: 'e', kind: 'guest' },
  { rect: [42, 100, 52, 113], front: 'w', kind: 'guest' },
  { rect: [-52, 48, -42, 62], front: 'e', kind: 'patriarch' },
  { rect: [42, 48, 52, 62], front: 'w', kind: 'refectory' },
  { rect: [-52, 8, -44, 14.5], front: 'e', kind: 'cell' },
  { rect: [-52, 15.5, -44, 22], front: 'e', kind: 'cells' },
  { rect: [44, 8, 52, 22], front: 'w', kind: 'cells' },
  { rect: [-52, -24, -42, -10], front: 'e', kind: 'cells' },
  { rect: [42, -24, 52, -10], front: 'w', kind: 'kitchen' },
  { rect: [-52, -50, -42, -36], front: 'e', kind: 'cells' },
  { rect: [42, -50, 52, -36], front: 'w', kind: 'cells' },
  { rect: [-52, -82, -42, -66], front: 'e', kind: 'cells' },
  { rect: [42, -82, 52, -66], front: 'w', kind: 'cells' },
];
export const CELL = { rect: [-52, 8, -44, 14.5], front: 'e' };
export const FOREST = [-172, 22, -108, 118];                     // the Pagoda Forest
export const FOREST_PATH = [[-62, 70], [-106, 70], [-125, 68], [-140, 70], [-160, 66]];
const segD = (x, z, a, b) => { const vx = b[0] - a[0], vz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / (vx * vx + vz * vz || 1))); return Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t); };
export const pathNear = (x, z, m) => FOREST_PATH.some((p, i) => i && segD(x, z, FOREST_PATH[i - 1], p) < m);
export const hw = (name) => (AXIS[name][2] - AXIS[name][0]) / 2;
/** Where a cross wall's side gate stands (distance from the axis). */
export const gateX = (name) => hw(name) + 1.2 + 3.0;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
/** The approach road (south of the gate) and the village streets, as rectangles. */
export const ROADS = [[-4, 131.5, 4, 190], [-95, 152, 95, 158], [-60, 160, -54, 190], [54, 160, 60, 190]];
export const onRoad = (x, z, m = 0) => ROADS.some((r) => inRect(r, x, z, m));
/** Courtyard houses of the village: rect, front. */
export const HOUSES = [];
{
  const r = rng(1600);
  for (const [x0, x1, side] of [[-100, -66, 1], [-50, -12, 1], [12, 50, 1], [66, 100, 1], [-100, -66, -1], [-50, -12, -1], [12, 50, -1], [66, 100, -1]]) {
    for (let x = x0; x + 9 <= x1; x += 9 + r() * 3) {
      const w = 7 + r() * 2.5, d = 4.4 + r() * 1.4;
      if (side > 0) { const z0 = 160 + r() * 2; HOUSES.push({ rect: [x, z0, x + w, z0 + d], front: 'n', seed: Math.floor(r() * 1e6) }); }
      else { const z1 = 150 - r() * 2; HOUSES.push({ rect: [x, z1 - d, x + w, z1], front: 's', seed: Math.floor(r() * 1e6) }); }
    }
  }
}
/** The stupas of the Pagoda Forest: { c, kind, tiers, shape, h, yaw, seed }. */
export const STUPAS = [];
{
  const r = rng(689);
  const [x0, z0, x1, z1] = FOREST;
  const near = (x, z, m) => pathNear(x, z, m + 1.5) || STUPAS.some((s) => Math.hypot(s.c[0] - x, s.c[1] - z) < s.rad + m);
  // the big ones first
  const big = [[-150, 48, 14, 7, 8], [-132, 92, 13, 7, 8], [-158, 100, 12, 7, 6], [-121, 54, 11, 5, 4], [-145, 78, 10.5, 5, 6], [-166, 62, 11, 7, 8], [-118, 108, 9.5, 5, 6]];
  for (const [x, z, h, tiers, shape] of big) STUPAS.push({ c: [x, z], kind: 'brick', tiers, shape, h, yaw: (x * 0.13) % 1, seed: Math.round(x * z), rad: h * 0.22 + 2 });
  let tries = 0;
  while (STUPAS.length < 62 && tries++ < 4000) {
    const x = x0 + 6 + r() * (x1 - x0 - 12), z = z0 + 6 + r() * (z1 - z0 - 12);
    const k = r(), kind = k < 0.35 ? 'stone' : k < 0.55 ? 'bell' : 'brick';
    const tiers = kind === 'brick' ? (r() < 0.35 ? 1 : 3 + 2 * Math.floor(r() * 2)) : 1;
    const shape = kind === 'brick' ? [4, 6, 8][Math.floor(r() * 3)] : 8;
    const h = kind === 'brick' ? (tiers === 1 ? 3.2 + r() * 1.6 : tiers === 3 ? 5 + r() * 2.5 : 7 + r() * 2.5) : 2.2 + r() * 1.6;
    const rad = h * 0.2 + 1.3;
    if (near(x, z, rad + 0.6)) continue;
    STUPAS.push({ c: [x, z], kind, tiers, shape, h, yaw: Math.floor(r() * 4) * Math.PI / 8 + (r() - 0.5) * 0.15, seed: Math.floor(r() * 1e6), rad });
  }
}
/** Mount Song: rises north of the compound; the ridge of Shaoshi in the north-west. */
export const MOUNT = (x, z) => {
  const n = Math.max(0, -125 - z), ridge = 1 + 0.45 * Math.sin(x / 38) + 0.25 * Math.sin(x / 15 + z / 23);
  return Math.pow(n, 1.25) * 0.16 * ridge * (1 - 0.25 * smooth(-60, 60, Math.abs(x)) * 0);
};
