// The Temple of Confucius, c. 1730 (docs/settlements/lu-qufu.md §2, §4): the stone portals, the gates in their red walls, the Bishui pool and
// its bridge, Kuiwen Pavilion, the thirteen stele pavilions, the Dacheng Gate, the Apricot Altar, the Dacheng Hall on its base and moon terrace,
// the Wu corridors, the Resting Hall and the Hall of Sage Traces, the side compounds of the ancestors and the parents.
// Authored in world coordinates (origin 0, yaw 0). The temple faces south; the axis is x = 0.

import { TEMPLE, INNER_X, WALL_Z, TEMPLE_WALL, GATE_HALLS, GATE_D, LINGXING, TAIHE, POOL, POOL_Y, POOL_BED, BRIDGE, KUIWEN, STELE_PAV, ALTAR, HALL, BASE, MOON, WU, QIN, SAGE, SIDE, SIDE_GATE_Z } from './layout.js';

const E = [];
const [tx0, tz0, tx1, tz1] = TEMPLE, W = TEMPLE_WALL;
const wall = (a, b, gates, dh = 0, th = W.th) => E.push({ t: 'palace_wall', a, b, y: 0, h: W.h + dh, th, ...(gates ? { gates } : {}) });

// ── the ground: the stone way on the axis, the great court's brick ──
E.push({ t: 'lane', rect: [-3.6, tz0 + 2, 3.6, 170], y: 0.05, mat: 'bluestone' });
E.push({ t: 'lane', rect: [-INNER_X + 1, tz0 + 2, INNER_X - 1, WALL_Z.dacheng - 1], y: 0.03, mat: 'brick_paving' });
E.push({ t: 'lane', rect: [-12, 30, 12, 118], y: 0.03, mat: 'brick_paving' });

// ── the walls: outer, the cross walls with the gate halls between their halves, the compound's side walls ──
const h = W.th / 2;
const side = [{ at: tz1 + h - 40, w: 3.8, h: 3.6 }];                  // the side gates of the outer wall (west and east), at z 40
wall([tx0, tz1 + h], [tx0, tz0 + 5], side, 0.13); wall([tx1, tz1 + h], [tx1, tz0 + 5], side, 0.13); wall([tx0 + 5, tz0], [tx1 - 5, tz0], null, 0.13);
// the corner towers of the temple's wall (jiaolou), at the two north corners
for (const sx of [-1, 1]) E.push({ t: 'corner_tower', c: [sx * (tx1 - 1.5), tz0 + 1.5], y: 0, s: 0.42, out: [sx, -1] });
for (const g of GATE_HALLS) { const z = g.z; wall([tx0 + h, z], [-g.w / 2 - 1, z], null, -0.12); wall([g.w / 2 + 1, z], [tx1 - h, z], null, -0.12); }
for (const s of [-1, 1]) wall([s * INNER_X, WALL_Z.dacheng - h], [s * INNER_X, tz0 + h], [{ at: Math.abs(SIDE_GATE_Z - WALL_Z.dacheng) - h, w: 3.8, h: 3.6 }], -0.06);

// ── the gate halls ──
for (const g of GATE_HALLS) {
  const dacheng = g.id === 'dacheng';
  E.push({ t: 'qing_hall', rect: [-g.w / 2, g.z - GATE_D / 2, g.w / 2, g.z + GATE_D / 2], y: 0.45, H: dacheng ? 5.4 : 4.7, roof: 'xieshan', bays: [g.bays, 2], front: 's', doors: ['n'], four: false, plat: 0.45, orn: { figures: dacheng ? 7 : 5 } });
}
// ── the stone portals before the temple ──
E.push({ t: 'lu_pailou', c: [0, LINGXING.z], across: 'x', w: LINGXING.w, h: 7.4, n: 4, roof: false });
E.push({ t: 'lu_pailou', c: [0, TAIHE.z], across: 'x', w: TAIHE.w, h: 6.6, n: 4, roof: true });
// the bronze lions... of Qufu are stone: a pair of stone lions before the Shengshi Gate
for (const s of [-1, 1]) E.push({ t: 'bronze', kind: 'lion', at: [s * 12, 126], y: 0.03, s: 0.8, face: [0, 1], stone: 'granite_grey', metal: 'granite_grey', paw: s > 0 ? 'ball' : 'cub' });

// ── the Bishui pool and its bridge ──
{
  const [a, b, c, d] = POOL;
  E.push({ t: 'water_rect', rect: POOL, y: POOL_Y });
  for (const [p, q] of [[[a, b], [c, b]], [[a, d], [c, d]], [[a, b], [a, d]], [[c, b], [c, d]]]) E.push({ t: 'canal_wall', a: p, b: q, y: 0.05, bed: POOL_BED, th: 0.7 });
  E.push({ t: 'ming_arch_bridge', at: [0, BRIDGE.z], across: 'z', span: BRIDGE.span, width: BRIDGE.width, rise: 1.0, landing: 3, y: 0.04, water: POOL_Y, bed: POOL_BED, pal: { base: 'marble' }, rail: {} });
}

// ── Kuiwen Pavilion: two storeys, double eaves, the way through its ground floor ──
E.push({ t: 'qing_hall', rect: KUIWEN.rect, y: KUIWEN.y, H: 7.6, double: 7.6, roof: 'xieshan', bays: [7, 5], front: 's', doors: ['n'], four: false, plat: 1.0, platMargin: 1.6, orn: { figures: 9 } });
// the Ming steles in the open before it
for (const x of [-8, 8, -16, 16]) E.push({ t: 'lu_stele', at: [x, 20], y: 0, yaw: Math.PI, s: 0.8, h: 3.2 });

// ── the thirteen stele pavilions ──
for (const p of STELE_PAV) E.push({ t: 'lu_stele_pavilion', c: p.c, w: p.w, y: 0.5, big: p.big, yaw: 0 });

// ── the Apricot Altar, its steps on the four sides ──
{
  const [cx, cz] = ALTAR.c;
  E.push({ t: 'lu_altar', c: ALTAR.c, y: 0.6 });
  E.push({ t: 'stairs', rect: [cx - 2, cz + 6.3, cx + 2, cz + 8.6], y0: 0.03, y1: 0.6, dir: 'n' });
  E.push({ t: 'stairs', rect: [cx - 2, cz - 8.6, cx + 2, cz - 6.3], y0: 0.03, y1: 0.6, dir: 's' });
  E.push({ t: 'stairs', rect: [cx - 8.6, cz - 2, cx - 6.3, cz + 2], y0: 0.03, y1: 0.6, dir: 'e' });
  E.push({ t: 'stairs', rect: [cx + 6.3, cz - 2, cx + 8.6, cz + 2], y0: 0.03, y1: 0.6, dir: 'w' });
}

// ── the Dacheng Hall: base, moon terrace, stairs, the hall ──
{
  const [bx0, bz0, bx1, bz1] = BASE, [mx0, mz0, mx1, mz1] = MOON, y = HALL.y;
  const gapS = [[-18 - bx0, 18 - bx0]], gapN = [[-3.6 - bx0, 3.6 - bx0]];
  E.push({ t: 'terrace', rect: BASE, y0: 0, y1: y, open: { s: gapS, n: gapN }, carve: 'qing' });
  E.push({ t: 'terrace', rect: MOON, y0: 0, y1: y, open: { n: [[-1, mx1 - mx0 + 1]], s: [[-10.8 - mx0, 10.8 - mx0]] }, carve: 'qing' });
  for (const [a, b, slab] of [[-10.5, -4.0, false], [-3.6, 3.6, true], [4.0, 10.5, false]]) E.push({ t: 'stairs', rect: [a, mz1, b, mz1 + 5], y0: 0.03, y1: y, dir: 'n', slab, rakes: !slab });
  for (const [a, b, slab] of [[-3.4, 3.4, true]]) E.push({ t: 'stairs', rect: [a, bz0 - 5, b, bz0], y0: 0.03, y1: y, dir: 's', slab, rakes: !slab });
  E.push({ t: 'lu_dacheng', rect: HALL.rect, y, H: HALL.H, double: HALL.double, seed: 5 });
  // the bronze burners on the terrace before the hall, the stone lions at the foot of the stairs
  for (const s of [-1, 1]) E.push({ t: 'bronze', kind: 'tripod', at: [s * 12.5, mz0 + 5], y, s: 0.9, face: [0, 1] });
  void bz1;
}

// ── the Wu corridors: forty bays of the sages' cases on each side of the great court ──
for (const w of WU) E.push({ t: 'qing_hall', rect: w.rect, y: 0.45, H: 4.6, roof: 'gable', bays: [15, 2], front: w.front, four: false, plat: 0.45 });

// ── the Resting Hall and the Hall of Sage Traces ──
E.push({ t: 'qing_hall', rect: QIN.rect, y: QIN.y, H: 5.6, double: 4.2, roof: 'xieshan', bays: [7, 3], front: 's', doors: ['n'], four: false, plat: QIN.y, platMargin: 1.4, orn: { figures: 7 } });
E.push({ t: 'qing_hall', rect: SAGE.rect, y: SAGE.y, H: 5.2, roof: 'xieshan', bays: [5, 3], front: 's', four: false, plat: SAGE.y, platMargin: 1.4, orn: { figures: 5 } });

// ── the side compounds ──
for (const s of SIDE) E.push({ t: 'qing_hall', rect: s.rect, y: 0.45, H: 5.2, roof: 'xieshan', bays: [5, 2], front: 's', doors: ['n'], four: false, plat: 0.45, orn: { figures: 5 } });

// the stairs up to the high platforms of Kuiwen, the Resting Hall and the Hall of Sage Traces (a platform over half a metre needs them)
const flight = (cx, zEdge, y, dir) => { const len = 2.2 + y * 1.6; E.push({ t: 'stairs', rect: dir === 'n' ? [cx - 1.6, zEdge, cx + 1.6, zEdge + len] : [cx - 1.6, zEdge - len, cx + 1.6, zEdge], y0: 0.03, y1: y, dir }); };
flight(0, KUIWEN.rect[3] + 1.6, KUIWEN.y, 'n'); flight(0, KUIWEN.rect[1] - 1.6, KUIWEN.y, 's');
flight(0, QIN.rect[3] + 1.4, QIN.y, 'n'); flight(0, QIN.rect[1] - 1.4, QIN.y, 's');
flight(0, SAGE.rect[3] + 1.4, SAGE.y, 'n');

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('dacheng-hall', [HALL.rect[0] + 1, HALL.rect[1] + 1, HALL.rect[2] - 1, HALL.rect[3] - 1], HALL.y, 'hall'),
  room('kuiwen', [KUIWEN.rect[0] + 1, KUIWEN.rect[1] + 1, KUIWEN.rect[2] - 1, KUIWEN.rect[3] - 1], KUIWEN.y, 'hall'),
  room('qin-hall', [QIN.rect[0] + 1, QIN.rect[1] + 1, QIN.rect[2] - 1, QIN.rect[3] - 1], QIN.y, 'hall'),
  room('sage-hall', [SAGE.rect[0] + 1, SAGE.rect[1] + 1, SAGE.rect[2] - 1, SAGE.rect[3] - 1], SAGE.y, 'hall'),
  room('great-court', [-INNER_X + 4, -232 + 6, INNER_X - 4, -150], 0, 'open'),
  room('apricot-court', [-40, -100, 40, -56], 0, 'open'),
  room('first-courts', [-90, 30, 90, 112], 0, 'open'),
];
const walks = [[[0, 150], [0, 100], [0, 60], [0, 20], [0, -20], [0, -60], [0, -96], [0, -112], [0, -130]]];
walks[0].y0 = 0;

export const qufu = {
  id: 'lu-qufu-temple',
  name: { en: 'Temple of Confucius: the Dacheng Hall', zh: '孔庙大成殿' },
  era: { en: 'Qing, c. 1730', zh: '清，约1730年' },
  style: 'lu',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -60], facing: 'n' },
  bounds: [-100, -240, 100, 175],
  bakeBounds: [-60, -150, 60, -90],
  view: [-60, -150, 60, -90],
  bakeTop: 34,
  bakeSpacing: 1.2,
  elements: E,
  rooms,
  walks,
};
export default qufu;
