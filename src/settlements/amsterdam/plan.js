// The Dam about 1670 (docs/settlements/amsterdam.md §2–§4): the Town Hall, the Nieuwe Kerk's tower,
// the Westerkerk; the canals' water and bridges; ships on the IJ.
import { RADIUS, C, RINGS, CANAL_W, HALL, DAM, IJ_Z, WATER, GROUND, QUAY, BRIDGE_ANGLES, westerkerk, westerNave } from './layout.js';

const wk = westerkerk(), wn = westerNave();
export const dam = {
  id: 'amsterdam-dam',
  name: { en: 'The Dam and the Town Hall', zh: '水坝广场与市政厅' },
  era: { en: 'Amsterdam, about 1670', zh: '阿姆斯特丹，约1670年' },
  style: 'dutch',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [20, -195], facing: 'n' },
  bounds: [Math.min(HALL[0], wk[0] - 30) - 2, IJ_Z - 2, DAM[2] + 32, Math.max(DAM[3], wk[1] + 30) + 2],
  view: [HALL[0] - 4, HALL[1] - 4, HALL[2] + 4, HALL[3] + 4],
  bakeTop: 60,
  elements: [
    { t: 'town_hall', rect: HALL, h: 33, front: 'e', y: GROUND },
    // the Nieuwe Kerk: Gothic, rebuilt after the fire of 1645; its great tower was begun and never finished, so a ridge turret
    { t: 'dutch_church', rect: [DAM[2] + 8, DAM[1] - 6, DAM[2] + 30, DAM[1] + 40], h: 16, transepts: [[DAM[1] + 9, DAM[1] + 23]], tw: 5, gothic: true, turret: true, gables: ['n', 's'], door: 's', y: GROUND },
    // the Westerkerk: the Westertoren by the Prinsengracht, the nave with its two transepts behind it
    { t: 'wester_tower', c: wk, s: 9, h: 87, y: GROUND },
    { t: 'dutch_church', rect: [wn[0], wk[1] + 4.5, wn[2], wn[3]], h: 15, transepts: [[wn[1] + 9, wn[1] + 22], [wn[1] + 30, wn[1] + 43]], tw: 3.5, gables: ['n', 's'], door: 's', y: GROUND },
    // ships on the IJ
    ...[-180, -110, -40, 40, 120, 190].map((x, k) => ({ t: 'ship', at: [x, IJ_Z - 30 - (k % 2) * 25], dir: [1, 0.1], len: 28 + (k % 3) * 4, y: WATER })),
  ],
  rooms: [{ id: 'dam', rect: DAM, y: GROUND, kind: 'open' }],
  walks: [Object.assign([[20, -195], [20, -230]], { y0: GROUND })],
};
// the canals' water and their bridges (radial streets crossing each ring)
const inCanal = (x, z) => Math.hypot(x, z) < RADIUS - 60 && z > C[1] + 20 && RINGS.some((R) => Math.abs(Math.hypot(x - C[0], z - C[1]) - R) < CANAL_W / 2 + QUAY + 0.15);
export const canals = {
  id: 'amsterdam-canals', style: 'dutch', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'water_cells', rect: [-RADIUS + 60, C[1], RADIUS - 60, RADIUS - 60], y: WATER, cell: 1.5, inside: inCanal },
    { t: 'water_cells', rect: [-RADIUS + 60, -RADIUS + 60, RADIUS - 60, IJ_Z], y: WATER, cell: 2.5, inside: (x, z) => Math.hypot(x, z) < RADIUS - 60 && z < IJ_Z + QUAY + 0.15 },
    // the bridges: each street crossing every ring on a vaulted brick bridge
    ...BRIDGE_ANGLES.flatMap((a) => RINGS.map((R) => {
      const x = C[0] + Math.cos(a) * R, z = C[1] + Math.sin(a) * R;
      return Math.hypot(x, z) < RADIUS - 75 ? { t: 'canal_bridge', c: [x, z], dir: [Math.cos(a), Math.sin(a)], L: CANAL_W + 2 * QUAY + 8, w: 6.5, y: GROUND, water: WATER, bed: WATER - 1.8 } : null;
    })).filter(Boolean),
    // the quay walls along both edges of every canal and along the IJ
    ...quays(),
  ],
};
/** The quay walls: arcs on both sides of each ring, from the IJ round to the disc's edge; the IJ's front. */
function quays() {
  const out = [], inside = (x, z) => Math.hypot(x, z) < RADIUS - 62 && z > C[1] + 20;
  for (const R of RINGS) for (const s of [-1, 1]) {
    const r = R + s * (CANAL_W / 2 + QUAY + 0.2);
    let path = [];
    for (let a = 0; a <= Math.PI + 1e-9; a += Math.PI / 180) {
      const x = C[0] + Math.cos(a) * r, z = C[1] + Math.sin(a) * r;
      if (inside(x, z)) path.push([x, z]); else { if (path.length > 1) out.push({ t: 'quay_wall', path, y: GROUND, bed: WATER - 2.2, water: WATER, side: s }); path = []; }
    }
    if (path.length > 1) out.push({ t: 'quay_wall', path, y: GROUND, bed: WATER - 2.2, water: WATER, side: s });
  }
  const zq = IJ_Z + QUAY + 0.2, xq = Math.sqrt((RADIUS - 62) ** 2 - zq * zq);
  out.push({ t: 'quay_wall', path: Array.from({ length: 41 }, (_, i) => [-xq + i * 2 * xq / 40, zq]), y: GROUND, bed: WATER - 2.2, water: WATER, side: 1 });
  return out;
}
export default dam;
