// The Dam about 1670 (docs/settlements/amsterdam.md §2–§4): the Town Hall, the Nieuwe Kerk's tower,
// the Westerkerk; the canals' water and bridges; ships on the IJ.
import { RADIUS, C, RINGS, CANAL_W, HALL, DAM, IJ_Z, WATER, GROUND, QUAY, BRIDGE_ANGLES, DAMRAK, WAAG, FISH, NIEUWE_KERK, westerkerk, westerNave } from './layout.js';

const wk = westerkerk(), wn = westerNave();
/** The sledges on the Dam (docs §5.6): [x, z, rot (their front along −z turned by rot), load]; each has its horse (town.js). */
export const SLEDGES = [[-8, -236.2, Math.PI / 2, 'casks'], [33, -219, 0, 'bales'], [31.6, -268, 0, 'casks']];
export const dam = {
  id: 'amsterdam-dam',
  name: { en: 'The Dam and the Town Hall', zh: '水坝广场与市政厅' },
  era: { en: 'Amsterdam, about 1670', zh: '阿姆斯特丹，约1670年' },
  style: 'dutch',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [20, -207], facing: 'n' },
  bounds: [Math.min(HALL[0], wk[0] - 30) - 2, IJ_Z - 2, DAM[2] + 32, Math.max(DAM[3], wk[1] + 30) + 2],
  view: [HALL[0] - 4, HALL[1] - 4, HALL[2] + 4, HALL[3] + 4],
  bakeTop: 60,
  elements: [
    { t: 'town_hall', rect: HALL, h: 33, front: 'e', y: GROUND, interior: true },
    // the Nieuwe Kerk: Gothic, rebuilt after the fire of 1645; its great tower was begun and never finished, so a ridge turret
    { t: 'dutch_church', rect: NIEUWE_KERK, h: 16, transepts: [[DAM[1] + 9, DAM[1] + 23]], tw: 5, gothic: true, turret: true, gables: ['n', 's'], door: 's', y: GROUND },
    // the Westerkerk: the Westertoren by the Prinsengracht, the nave with its two transepts behind it
    { t: 'wester_tower', c: wk, s: 9, h: 87, y: GROUND },
    { t: 'dutch_church', rect: [wn[0], wk[1] + 4.5, wn[2], wn[3]], h: 15, transepts: [[wn[1] + 9, wn[1] + 22], [wn[1] + 30, wn[1] + 43]], tw: 3.5, gables: ['n', 's'], door: 's', y: GROUND },
    // the Weigh House before the Town Hall's north wing; the square paved, its gutters; the fish benches at the Damrak's head; sledges
    { t: 'waag', rect: WAAG, y: GROUND },
    { t: 'dam_paving', y: GROUND, gz: [-231, -208.2, -259], gx: [5], fields: [
      { rect: [DAM[0], DAMRAK[3] + QUAY + 0.55, DAM[2], DAM[3]] },
      { rect: [DAM[0], -262.4, DAMRAK[0] - QUAY - 0.55, DAMRAK[3] + QUAY + 0.55], kerb: 'we' },
      { rect: [DAMRAK[2] + QUAY + 0.55, -262.4, DAM[2], DAMRAK[3] + QUAY + 0.55], kerb: 'nwe' },
      { rect: [-30, DAM[3], -22.6, -202.6], mat: 'cotto_floor', kerb: '' },
      { rect: [-9.5, DAM[3], 23.2, -202.6], mat: 'cotto_floor', kerb: '' },
    ] },
    ...[15.5, 19, 22.5, 26, 29.5, 33, 36.5].map((x, k) => ({ t: 'fish_bench', at: [x, FISH[1] + 2.4], rot: 0, len: 2.4, seed: 11 + k, y: GROUND + 0.05 })),
    ...[17, 21, 25, 29, 33, 37].map((x, k) => ({ t: 'fish_bench', at: [x, -247.6], rot: Math.PI, len: 2.4, seed: 31 + k, y: GROUND + 0.05 })),
    ...SLEDGES.map(([x, z, rot, load], k) => ({ t: 'sledge', at: [x, z], rot, load, seed: 7 + k, y: GROUND + 0.053 })),
    // ships on the IJ
    ...[-180, -110, -40, 40, 120, 190].map((x, k) => ({ t: 'ship', at: [x, IJ_Z - 30 - (k % 2) * 25], dir: [1, 0.1], len: 28 + (k % 3) * 4, y: WATER })),
  ],
  // the Town Hall's rooms first (a point in them is not on the Dam): the vestibule, the stair, the Burgerzaal and its galleries
  // (the Vierschaar is not a room: as in life it is seen from the vestibule through its bronze grilles, not entered)
  rooms: [
    { id: 'vestibule', rect: [HALL[2] - 6.6, -246.8, HALL[2] + 1.4, -220.2], y: GROUND + 0.15, kind: 'hall' },
    { id: 'stair', rect: [HALL[2] - 15, -250.8, HALL[2] - 5, -246.8], y: GROUND + 0.15, kind: 'hall' },
    { id: 'burgerzaal', rect: [HALL[0] + 4, -245, HALL[2] - 4, -222], y: GROUND + 15.9, kind: 'hall' },
    { id: 'dam', rect: DAM, y: GROUND, kind: 'open' },
  ],
  walks: [Object.assign([[20, -207], [20, -230]], { y0: GROUND })],
};
/**
 * The lighters (praams) moored along the canals' quays and at the Damrak (docs §5.10): [x, z, rot, len, load],
 * clear of the bridges; each has its boatman on the after deck (town.js).
 */
export const BOATS = (() => {
  let s = 1613; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), out = [];
  const loads = ['casks', 'bales', 'peat', 'casks', 'empty'];
  for (const R of RINGS) for (const sd of [-1, 1]) for (let a = 0.12 + r() * 0.3; a < Math.PI - 0.1; a += 0.35 + r() * 0.5) {
    const L = 9.5 + r() * 3, B = L * 0.27, rr = R + sd * (CANAL_W / 2 + QUAY - 0.5 - B / 2), x = C[0] + Math.cos(a) * rr, z = C[1] + Math.sin(a) * rr;
    if (Math.hypot(x, z) > RADIUS - 78 || z < C[1] + 26 || BRIDGE_ANGLES.some((b) => Math.abs(b - a) * R < L / 2 + 6) || r() < 0.45) continue;
    out.push([x, z, Math.atan2(-Math.sin(a), Math.cos(a)) + (r() < 0.5 ? Math.PI : 0), L, loads[Math.floor(r() * loads.length)]]);
  }
  out.push([DAMRAK[0] + 2.4, -291, 0, 10.5, 'casks'], [DAMRAK[2] - 2.4, -289, Math.PI, 11, 'bales']);
  return out;
})();
// the canals' water and their bridges (radial streets crossing each ring)
const inCanal = (x, z) => Math.hypot(x, z) < RADIUS - 60 && z > C[1] + 20 && RINGS.some((R) => Math.abs(Math.hypot(x - C[0], z - C[1]) - R) < CANAL_W / 2 + QUAY + 0.15);
export const canals = {
  id: 'amsterdam-canals', style: 'dutch', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'water_cells', rect: [-RADIUS + 60, C[1], RADIUS - 60, RADIUS - 60], y: WATER, cell: 1.5, inside: inCanal },
    { t: 'water_cells', rect: [-RADIUS + 60, -RADIUS + 60, RADIUS - 60, IJ_Z], y: WATER, cell: 2.5, inside: (x, z) => Math.hypot(x, z) < RADIUS - 60 && z < IJ_Z + QUAY + 0.15 },
    // the Damrak, from the IJ up to the Dam
    { t: 'water_cells', rect: [DAMRAK[0] - 2, IJ_Z, DAMRAK[2] + 2, DAMRAK[3] + 2], y: WATER, cell: 0.5, inside: (x, z) => x > DAMRAK[0] - QUAY - 0.15 && x < DAMRAK[2] + QUAY + 0.15 && z < DAMRAK[3] + QUAY + 0.15 },
    // the bridges: each street crossing every ring on a vaulted brick bridge
    ...BRIDGE_ANGLES.flatMap((a) => RINGS.map((R) => {
      const x = C[0] + Math.cos(a) * R, z = C[1] + Math.sin(a) * R;
      return Math.hypot(x, z) < RADIUS - 75 ? { t: 'canal_bridge', c: [x, z], dir: [Math.cos(a), Math.sin(a)], L: CANAL_W + 2 * QUAY + 8, w: 6.5, y: GROUND, water: WATER, bed: WATER - 1.8 } : null;
    })).filter(Boolean),
    ...BOATS.map(([x, z, rot, len, load], k) => ({ t: 'praam', at: [x, z], rot, len, load, seed: 40 + k, y: WATER })),
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
      if (inside(x, z)) path.push([x, z]); else { if (path.length > 1) out.push({ t: 'quay_wall', path, y: GROUND, bed: WATER - 2.2, water: WATER, side: -s }); path = []; }
    }
    if (path.length > 1) out.push({ t: 'quay_wall', path, y: GROUND, bed: WATER - 2.2, water: WATER, side: -s });
  }
  const zq = IJ_Z + QUAY + 0.2, xq = Math.sqrt((RADIUS - 62) ** 2 - zq * zq), e = QUAY + 0.2, da = DAMRAK[0] - e, db = DAMRAK[2] + e;
  // the IJ's front, broken by the Damrak's mouth; the Damrak's quays up its west side, round its head and down its east side
  const run = (a, b) => { const n = Math.max(2, Math.ceil((b - a) / 18)); return Array.from({ length: n + 1 }, (_, i) => [a + i * (b - a) / n, zq]); };
  out.push({ t: 'quay_wall', path: run(-xq, da - 0.32), y: GROUND, bed: WATER - 2.2, water: WATER, side: 1 });
  out.push({ t: 'quay_wall', path: run(db + 0.32, xq), y: GROUND, bed: WATER - 2.2, water: WATER, side: 1 });
  const hz = DAMRAK[3] + e;
  out.push({ t: 'quay_wall', path: [[da, zq - 0.32], [da, (zq + hz) / 2], [da, hz], [(da + db) / 2, hz], [db, hz], [db, (zq + hz) / 2], [db, zq - 0.32]], y: GROUND, bed: WATER - 2.2, water: WATER, side: 1 });
  return out;
}
export default dam;
