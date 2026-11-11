// Shaolin Monastery about 1600 (docs/settlements/shaolin.md §2–§6): the red-walled compound on the axis north–south, its halls
// (gate, Heavenly Kings, Mahavira, Dharma, abbot's, Lixue pavilion, Thousand Buddha / training hall), the courts with steles, lions,
// censers and bell and drum towers, the side ranges, and the Pagoda Forest of memorial stupas west of the wall.
import '../../styles/shaolin/index.js';
import { PAL, PAL_HOUSE } from '../../styles/shaolin/index.js';
import { WALL, AXIS, PLAT, HGT, BELL, DRUM, CROSS, RANGES, STUPAS, FOREST, FOREST_PATH, CELL, gateX, hw, inRect } from './layout.js';
import { ground } from './ground.js';

const E = [];
const H = (x, z) => ground.height(x, z);
const R = (r, d = 0) => [r[0] - d, r[1] - d, r[2] + d, r[3] + d];

// ── the courts: bluestone slabs, the processional way of the axis in granite ─────────────
const zs = CROSS.map((c) => c[1]).sort((a, b) => b - a);        // from south to north
const courts = [[zs[0], WALL[1]]];                              // (placeholder; replaced below)
courts.length = 0;
for (let i = 0; i + 1 < zs.length; i++) courts.push([zs[i + 1], zs[i]]);
courts.push([WALL[1], zs[zs.length - 1]]);
for (const [za, zb] of courts) E.push({ t: 'paving', rect: [WALL[0] + 0.3, za + 0.2, WALL[2] - 0.3, zb - 0.2], y: 0.02, th: 0.3, mat: 'bluestone' });
// the approach: a forecourt before the gate, the road out to the village
E.push({ t: 'paving', rect: [-16, 128.8, 16, 152], y: 0.02, th: 0.3, mat: 'bluestone' });
E.push({ t: 'paving', rect: [-4, 152, 4, 190], y: 0.02, th: 0.3, mat: 'granite_grey' });
// the processional way along the axis, in granite slabs, through the courts (not under the halls)
for (const [za, zb] of courts) E.push({ t: 'paving', rect: [-2.2, za + 0.2, 2.2, zb - 0.2], y: 0.04, th: 0.3, mat: 'granite_grey' });

// ── the walls ─────────────────────────────────────────────────────────────────────────
const wall = (a, b, o = {}) => E.push({ t: 'ming_wall', a, b, y: 0, h: 4.6, th: 0.55, pal: PAL, ...o });
// the east and west walls (the west one with a gate to the Pagoda Forest at z 70), the north wall
wall([WALL[2], WALL[3]], [WALL[2], WALL[1]]);
wall([WALL[0], WALL[3]], [WALL[0], WALL[1]], { gates: [{ at: WALL[3] - 70, w: 2.6, h: 3.2 }] });
wall([WALL[0], WALL[1]], [WALL[2], WALL[1]], { gates: [{ at: 62, w: 2.6, h: 3.2 }] });
// the cross walls to the flanks of each hall, a side gate each
CROSS.forEach(([name, z], i) => {
  const h = hw(name) + 1.2, gx = gateX(name), at = WALL[2] - gx;
  if (i === 0) { wall([WALL[0], z], [-h, z]); wall([h, z], [WALL[2], z]); return; }
  wall([WALL[0], z], [-h, z], { gates: [{ at: WALL[2] - gx - 0.3, w: 2.4, h: 3.0 }] });
  wall([h, z], [WALL[2], z], { gates: [{ at: gx - h - 0.1, w: 2.4, h: 3.0 }] });
  void at;
});

// ── the halls ───────────────────────────────────────────────────────────────────────────
const stairs = (r, y1, side) => {
  const n = Math.max(2, Math.ceil(y1 / 0.15)), run = n * 0.38, cx = (r[0] + r[2]) / 2, w = Math.min(5, (r[2] - r[0]) * 0.28);
  if (side === 's') E.push({ t: 'stair', rect: [cx - w / 2, r[3] + 0.8, cx + w / 2, r[3] + 0.8 + run], y0: 0.02, y1: y1 + 0.02, dir: 'n', riser: 0.15, mat: 'granite_block' });
  else E.push({ t: 'stair', rect: [cx - w / 2, r[1] - 0.8 - run, cx + w / 2, r[1] - 0.8], y0: 0.02, y1: y1 + 0.02, dir: 's', riser: 0.15, mat: 'granite_block' });
};
const hall = (name, o) => {
  const r = AXIS[name], pl = PLAT[name];
  E.push({ t: 'ming_hall', rect: r, y: 0.02 + pl, H: HGT[name], front: 's', four: false, roof: 'xieshan', plat: pl, platMargin: 0.8, eave: 1.5, pal: PAL, lat: 'lattice_red', walls: { n: 'plaster', e: 'plaster', w: 'plaster' }, winWall: true, ...o });
  stairs(r, pl, 's');
};
hall('shanmen', { roof: 'hip', doors: ['n'], eave: 1.35 }); stairs(AXIS.shanmen, PLAT.shanmen, 'n');
hall('tianwang', { doors: ['n'] }); stairs(AXIS.tianwang, PLAT.tianwang, 'n');
hall('mahavira', { eave: 1.9, sweep: 1.4 });
hall('fatang', { roof: 'gable', eave: 1.3 });
hall('fangzhang', { roof: 'gable', doors: ['n'], eave: 1.2 }); stairs(AXIS.fangzhang, PLAT.fangzhang, 'n');
hall('lixue', { roof: 'xieshan', doors: ['n'], four: true, eave: 1.4 }); stairs(AXIS.lixue, PLAT.lixue, 'n');
hall('qianfo', { eave: 1.9, sweep: 1.4, plat: PLAT.qianfo, platMargin: 0.8 });
// the Mahavira Hall's terrace (yuetai) before it, with the great censers
{
  const r = AXIS.mahavira, z1 = r[3] + 0.8;
  E.push({ t: 'paving', rect: [-9, z1, 9, z1 + 5.2], y: 0.02 + PLAT.mahavira, th: PLAT.mahavira, mat: 'granite_block' });
  const n = Math.ceil(PLAT.mahavira / 0.15);
  E.push({ t: 'stair', rect: [-2.8, z1 + 5.2, 2.8, z1 + 5.2 + n * 0.38], y0: 0.02, y1: 0.02 + PLAT.mahavira, dir: 'n', riser: 0.15, mat: 'granite_block' });
  for (const s of [-1, 1]) E.push({ t: 'court_censer', at: [s * 6.2, z1 + 3.3], y: 0.02 + PLAT.mahavira, s: 1.1 });
}
// the shanmen's lions and the forecourt
for (const s of [-1, 1]) E.push({ t: 'stone_lion', at: [s * 4.6, 135.2], y: 0.02, yaw: 0, s: 1.15, male: s < 0 });
// the Qianfo hall: the worn training floor
{
  const r = AXIS.qianfo;
  E.push({ t: 'practice_floor', rect: [r[0] + 0.9, r[1] + 0.9, r[2] - 0.9, r[3] - 0.3], y: 0.02 + PLAT.qianfo, rows: 6, cols: 8, pzStart: r[1] + 7.0, seed: 3 });
}
// interiors
E.push({ t: 'shaolin_interior', kind: 'tianwang', rect: AXIS.tianwang, y: 0.02 + PLAT.tianwang, H: HGT.tianwang });
E.push({ t: 'shaolin_interior', kind: 'mahavira', rect: AXIS.mahavira, y: 0.02 + PLAT.mahavira, H: HGT.mahavira });
E.push({ t: 'shaolin_interior', kind: 'fatang', rect: AXIS.fatang, y: 0.02 + PLAT.fatang, H: HGT.fatang });
E.push({ t: 'shaolin_interior', kind: 'qianfo', rect: AXIS.qianfo, y: 0.02 + PLAT.qianfo, H: HGT.qianfo });
E.push({ t: 'hall_furniture', rect: AXIS.fangzhang, y: 0.02 + PLAT.fangzhang, front: 's', H: HGT.fangzhang, backDoor: true });
E.push({ t: 'hall_furniture', rect: AXIS.lixue, y: 0.02 + PLAT.lixue, front: 's', H: HGT.lixue, backDoor: true });
// the boards over the doors
const board = (cx, y, z, n, seed, w = 2.6) => E.push({ t: 'plaque', at: [cx, z], y, facing: [0, 1], w, h: 0.8, n, seed });
board(0, 0.02 + PLAT.shanmen + HGT.shanmen - 1.1, AXIS.shanmen[3] + 0.17, 4, 21);
board(0, 0.02 + PLAT.tianwang + HGT.tianwang - 1.1, AXIS.tianwang[3] + 0.17, 4, 22);
board(0, 0.02 + PLAT.mahavira + HGT.mahavira - 1.1, AXIS.mahavira[3] + 0.17, 5, 23, 3.4);
board(0, 0.02 + PLAT.fatang + HGT.fatang - 1.1, AXIS.fatang[3] + 0.17, 3, 24);
board(0, 0.02 + PLAT.lixue + HGT.lixue - 1.0, AXIS.lixue[3] + 0.17, 4, 25, 1.9);
board(0, 0.02 + PLAT.qianfo + HGT.qianfo - 1.1, AXIS.qianfo[3] + 0.17, 5, 26, 3.4);

// ── the bell and drum towers: a brick podium with an arched door, a four-sided open pavilion on it ──
for (const [r, kind] of [[BELL, 'bell'], [DRUM, 'drum']]) {
  const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, top = 4.6;
  E.push({ t: 'block', rect: R(r), y0: 0, y1: top, mat: 'brick_grey' });
  E.push({ t: 'block', rect: R(r, 0.25), y0: top - 0.35, y1: top, mat: 'granite_grey' });
  E.push({ t: 'block', rect: R(r, 0.25), y0: 0, y1: 0.4, mat: 'granite_grey' });
  E.push({ t: 'ming_pavilion', c: [cx, cz], shape: 'square', w: r[2] - r[0] - 0.8, d: r[3] - r[1] - 0.8, y: top, H: 3.6, plat: 0.3, open: [0, 1, 2, 3], pal: PAL });
  if (kind === 'bell') E.push({ t: 'bell_hung', at: [cx, cz], y: top + 0.4, kind });
  else E.push({ t: 'bell_hung', at: [cx, cz], y: top + 0.4, kind });
}
// ── the side ranges ───────────────────────────────────────────────────────────────────────
for (const q of RANGES) {
  const west = q.front === 'w', walls = west ? { n: 'plaster', s: 'plaster', e: 'plaster' } : { n: 'plaster', s: 'plaster', w: 'plaster' };
  const big = q.kind === 'guest' || q.kind === 'patriarch' || q.kind === 'refectory';
  E.push({ t: 'ming_hall', rect: q.rect, y: 0.02 + 0.35, H: big ? 4.6 : 3.8, front: q.front, four: false, roof: 'gable', plat: 0.35, platMargin: 0.5, eave: 1.0, pal: PAL, lat: 'lattice_red', walls, winWall: true });
}
E.push({ t: 'shaolin_interior', kind: 'cell', rect: CELL.rect, y: 0.02 + 0.35, H: 3.8 });

// ── steles, lions, trees' places ─────────────────────────────────────────────────────────────
const stele = (x, z, o = {}) => E.push({ t: 'shaolin_stele', at: [x, z], y: 0.02, yaw: 0, ...o });
for (let k = 0; k < 4; k++) for (const s of [-1, 1]) stele(s * (13 + k * 8.5), 116, { kind: (k + (s > 0 ? 1 : 0)) % 2 ? 'plain' : 'bixi', h: 3.0 + (k % 2) * 0.5, seed: k * 5 + (s > 0 ? 2 : 0) });
for (let k = 0; k < 4; k++) for (const s of [-1, 1]) stele(s * (30 + (k % 2) * 4), 99 - k * 0 + (k > 1 ? 0 : 0), { kind: 'plain', h: 2.4, seed: 40 + k });
// the Taizong stele (728) under its little pavilion before the bell tower, another before the drum tower
for (const [x, z, s] of [[-21, 84.5, 1], [21, 84.5, 2]]) { E.push({ t: 'ming_pavilion', c: [x, z], shape: 'square', w: 3.6, d: 3.6, y: 0.02, H: 3.8, plat: 0.2, open: [0, 1, 2, 3], pal: PAL }); }
// the Corridor of steles along the inside of the west wall (the Forest of Steles), plain tablets close set
for (let k = 0; k < 12; k++) stele(-59, -8 - k * 1.9, { kind: 'plain', h: 2.0 + (k % 3) * 0.2, yaw: Math.PI / 2, seed: 60 + k, w: 0.8 });
for (let k = 0; k < 10; k++) stele(59, 20 - k * 2.2, { kind: 'plain', h: 2.0 + (k % 3) * 0.2, yaw: -Math.PI / 2, seed: 80 + k, w: 0.8 });
for (const x of [-30, 30]) stele(x, 60, { kind: 'bixi', h: 3.5, seed: 90 });
E.push({ t: 'court_censer', at: [0, 105], y: 0.04, s: 1.2 });
E.push({ t: 'court_censer', at: [0, 62], y: 0.04, s: 1.2 });
E.push({ t: 'court_censer', at: [0, 22], y: 0.04, s: 1.0 });

// ── the Pagoda Forest ───────────────────────────────────────────────────────────────────────
for (const s of STUPAS) {
  const y = H(s.c[0], s.c[1]) - 0.05;
  E.push({ t: 'shaolin_stupa', c: s.c, y, kind: s.kind, tiers: s.tiers, shape: s.shape, h: s.h, jit: ((s.seed % 7) - 3) * 0.05, seed: s.seed });
}
// the forest's own path of beaten earth, and two big steles at its entrance
E.push({ t: 'path_earth', pts: FOREST_PATH, w: 2.2, ground: H });
stele(-114, 63, { kind: 'bixi', h: 3.4, yaw: Math.PI / 2, seed: 5 }); stele(-114, 77, { kind: 'bixi', h: 3.4, yaw: Math.PI / 2, seed: 6 });

// ── rooms and the walk ────────────────────────────────────────────────────────────────────────
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('tianwang', AXIS.tianwang, 0.02 + PLAT.tianwang, 'hall'), room('mahavira', AXIS.mahavira, 0.02 + PLAT.mahavira, 'hall'),
  room('fatang', AXIS.fatang, 0.02 + PLAT.fatang, 'hall'), room('qianfo', AXIS.qianfo, 0.02 + PLAT.qianfo, 'hall'),
  room('fangzhang', AXIS.fangzhang, 0.02 + PLAT.fangzhang, 'hall'), room('lixue', AXIS.lixue, 0.02 + PLAT.lixue, 'hall'),
  room('cell', CELL.rect, 0.37, 'hall'),
  room('monastery', WALL, 0, 'open'), room('forest', FOREST, 0, 'open'),
];
const gm = gateX('mahavira'), gf = gateX('fatang'), ga = gateX('fangzhang'), gl = gateX('lixue');
void inRect; void gm;
const walks = [[[0, 170], [0, 140], [0, 133], [0, 126], [0, 118], [0, 99], [0, 97], [0, 93], [2.4, 92.6], [2.4, 89], [1, 88.3], [0, 84], [0, 47], [0, 44], [0, 40], [0, 37], [2, 40], [0, 46],
  [-gm, 46], [-gm, 38.7], [-gm, 30], [-6, 20], [-6, 8], [0, 7], [0, 2], [0, 7], [-gf, 8], [-gf, 1.7], [-gf, -8], [-6, -20], [0, -24], [0, -28], [0, -33], [0, -50], [-ga, -50], [-ga, -29], [0, -48], [-gl, -48], [-gl, -55], [-gl, -62], [0, -72], [0, -79], [0, -84]]];
walks[0].y0 = 0;

export const monastery = {
  id: 'shaolin-monastery',
  name: { en: 'Shaolin Monastery', zh: '少林寺' },
  era: { en: 'Ming dynasty, c. 1600', zh: '明，约1600年' },
  style: 'shaolin',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 165], facing: 'n' },
  bounds: [-175, -115, 66, 192],
  bakeBounds: [-18, -98, 18, 100],
  view: [-16, -2, 16, 128],
  bakeTop: 12,
  bakeSpacing: 1.4,
  elements: E,
  rooms,
  walks,
};
export default monastery;
