// The Outer Court of the Forbidden City as rebuilt in the Qing (the Hall of Supreme Harmony in
// 1695–97, on the Ming plan of 1406–20; docs/settlements/qing-beijing.md §4): from the south, the
// Meridian Gate on the palace wall, its court crossed by the Inner Golden Water River under five
// marble bridges, the Gate of Supreme Harmony, the great courtyard with its side galleries and
// pavilions, the three-tiered white marble terrace with the Halls of Supreme, Central and
// Preserving Harmony, and the Gate of Heavenly Purity to the Inner Court. Compressed along the axis
// (see §2); the halls themselves at their true size.

import { LEVEL, WALL, RIVER, TIERS, HALLS } from './layout.js';
import { IMPERIAL } from '../../styles/qing/index.js';

const E = [];
const [wx0, wz0, wx1, wz1] = WALL.rect, WH = WALL.h, WT = WALL.th;

// ── the paving: grey brick everywhere inside, the imperial way of marble on the axis ──
E.push({ t: 'lane', rect: [wx0 + 2, RIVER[3], wx1 - 2, wz1 - 2], y: 0.03 });
E.push({ t: 'lane', rect: [wx0 + 2, wz0 + 2, wx1 - 2, RIVER[1]], y: 0.03 });
for (const [z0, z1] of [[RIVER[3], wz1 - 10], [124, RIVER[1]], [TIERS[0].rect[3], 108]]) E.push({ t: 'lane', rect: [-3.6, z0, 3.6, z1], y: 0.06, mat: 'marble_floor' });

// ── the wall, its corner towers, the Meridian Gate ──
const gates = (list) => list.map(([at, w, h]) => ({ at, w, h }));
E.push({ t: 'palace_wall', a: [wx0, wz0], b: [wx1, wz0], y: 0, h: WH, th: WT });
E.push({ t: 'palace_wall', a: [wx0, wz0], b: [wx0, wz1], y: 0, h: WH, th: WT, gates: gates([[255, 5, 6]]) });      // the West Flowery Gate
E.push({ t: 'palace_wall', a: [wx1, wz0], b: [wx1, wz1], y: 0, h: WH, th: WT, gates: gates([[255, 5, 6]]) });      // the East Flowery Gate
E.push({ t: 'palace_wall', a: [wx0, wz1], b: [-38, wz1], y: 0, h: WH, th: WT });
E.push({ t: 'palace_wall', a: [38, wz1], b: [wx1, wz1], y: 0, h: WH, th: WT });
// the Meridian Gate: its base a block of red wall 18 m deep pierced by three passages, the gate
// hall on top with double eaves (the real gate is U-shaped with towers on its wings; here its centre)
E.push({ t: 'palace_wall', a: [-38, wz1], b: [38, wz1], y: 0, h: 12, th: 18, gates: gates([[26, 5, 7.5], [38, 6, 8.5], [50, 5, 7.5]]) });
E.push({ t: 'block', rect: [-38, wz1 - 9, 38, wz1 + 9], y0: 11.9, y1: 12.2, mat: 'brick_paving' });
E.push({ t: 'qing_hall', rect: [-30, wz1 - 6.5, 30, wz1 + 6.5], y: 12.6, H: 7.5, double: 6, roof: 'xieshan', bays: [9, 5], front: 's', four: true, plat: 0.4 });
for (const [x, z] of [[wx0, wz0], [wx1, wz0], [wx0, wz1], [wx1, wz1]]) {
  E.push({ t: 'block', rect: [x - 9, z - 9, x + 9, z + 9], y0: 0, y1: WH, mat: 'palace_wall', solid: true });
  E.push({ t: 'corner_tower', c: [x, z], y: WH, s: 1.0 });
}

// ── the Meridian Gate's court: the Golden Water River and its bridges ──
E.push({ t: 'water_rect', rect: RIVER, y: LEVEL.river });
for (const z of [RIVER[1], RIVER[3]]) E.push({ t: 'canal_wall', a: [RIVER[0], z], b: [RIVER[2], z], y: 0.05, bed: LEVEL.riverBed, th: 0.6, pal: { base: 'marble' } });
for (const x of [RIVER[0], RIVER[2]]) E.push({ t: 'canal_wall', a: [x, RIVER[1]], b: [x, RIVER[3]], y: 0.05, bed: LEVEL.riverBed, th: 0.6, pal: { base: 'marble' } });
for (const [x, w] of [[-24, 4], [-12, 5], [0, 7], [12, 5], [24, 4]]) E.push({ t: 'ming_arch_bridge', at: [x, (RIVER[1] + RIVER[3]) / 2], across: 'z', span: 7.2, width: w, rise: 1.3, landing: 3.5, y: 0.04, water: LEVEL.river, bed: LEVEL.riverBed, pal: { base: 'marble' } });
// the river's marble balustrades along both banks, open at the bridges
const bridgeGaps = [[-24, 4], [-12, 5], [0, 7], [12, 5], [24, 4]].map(([x, w]) => [x - w / 2 - 0.4 - RIVER[0], x + w / 2 + 0.4 - RIVER[0]]);
for (const z of [RIVER[1] - 0.35, RIVER[3] + 0.35]) E.push({ t: 'rail', a: [RIVER[0], z], b: [RIVER[2], z], y: 0.04, open: bridgeGaps });

// ── the Gate of Supreme Harmony on its platform, the wall across the court with its side gates ──
const tm = HALLS.taihemen;
E.push({ t: 'terrace', rect: [-34, 106, 34, 125], y0: 0, y1: tm.y, open: { s: [[18, 50]], n: [[18, 50]] } });
for (const [z, dir] of [[125, 'n'], [101, 's']]) {
  const r = dir === 'n' ? [0, 125, 0, 125 + 6] : [0, 100, 0, 106];
  E.push({ t: 'stairs', rect: [-15, r[1], -4, r[3]], y0: 0.03, y1: tm.y, dir: dir === 'n' ? 'n' : 's' });
  E.push({ t: 'stairs', rect: [4, r[1], 15, r[3]], y0: 0.03, y1: tm.y, dir: dir === 'n' ? 'n' : 's' });
  E.push({ t: 'stairs', rect: [-3.5, r[1], 3.5, r[3]], y0: 0.03, y1: tm.y, dir: dir === 'n' ? 'n' : 's', slab: true });
  void z;
}
E.push({ t: 'qing_hall', rect: tm.rect, y: tm.y, H: 7.2, double: 5, roof: 'xieshan', bays: [9, 4], front: 's', four: true, plat: 0.3, open: true });
for (const s of [-1, 1]) E.push({ t: 'bronze', kind: 'lion', at: [s * 12, 127.5], y: 0.03, s: 1.0, face: [0, 1] });
E.push({ t: 'palace_wall', a: [wx0, 116], b: [-34, 116], y: 0, h: 6.5, th: 2.2, gates: gates([[38, 5, 4.8]]) });
E.push({ t: 'palace_wall', a: [34, 116], b: [wx1, 116], y: 0, h: 6.5, th: 2.2, gates: gates([[40, 5, 4.8]]) });

// ── the great courtyard: galleries along its sides, the two pavilions facing each other ──
for (const s of [-1, 1]) {
  const x = s * 98;
  E.push({ t: 'ming_gallery', pts: [[x, 104], [x, 66]], y: 0.6, w: 4.5, H: 4.4, side: s, pal: IMPERIAL });
  E.push({ t: 'qing_hall', rect: s < 0 ? [-108, 46, -88, 64] : [88, 46, 108, 64], y: 1.2, H: 6, double: 4.5, roof: 'xieshan', bays: [5, 3], front: s < 0 ? 'e' : 'w', four: true, plat: 1.2 });
  E.push({ t: 'ming_gallery', pts: [[x, 44], [x, -40]], y: 0.6, w: 4.5, H: 4.4, side: s, pal: IMPERIAL });
}

// ── the terrace in three tiers, its stairs, the bronzes on it ──
const stairX = [[-10.5, -4], [-3.6, 3.6], [4, 10.5]];
for (const [k, t] of TIERS.entries()) {
  const [x0, z0, x1, z1] = t.rect, y0 = k ? TIERS[k - 1].y : 0, W = x1 - x0;
  const gap = [[-11 - x0, 11 - x0]];
  E.push({ t: 'terrace', rect: t.rect, y0, y1: t.y, open: { s: gap, n: gap } });
  for (const [face, dir, zA] of [['s', 'n', z1], ['n', 's', z0]]) {
    const r0 = dir === 'n' ? zA : zA - 5, r1 = dir === 'n' ? zA + 5 : zA;
    for (const [i, [a, b]] of stairX.entries()) E.push({ t: 'stairs', rect: [a, r0, b, r1], y0, y1: t.y, dir, slab: i === 1 });
    void face;
  }
  void W;
}
const top = TIERS[2].y;
// the Dragon Pavement terrace before the hall: bronze cranes and tortoises, a sundial, a grain
// measure (here vats and tripods stand for them), and the eighteen tripods along the steps
for (const s of [-1, 1]) {
  E.push({ t: 'bronze', kind: 'tripod', at: [s * 16, 18], y: top });
  E.push({ t: 'bronze', kind: 'tripod', at: [s * 24, 18], y: top });
  E.push({ t: 'bronze', kind: 'vat', at: [s * 44, 16], y: top });
  E.push({ t: 'bronze', kind: 'vat', at: [s * 44, -40], y: top });
  E.push({ t: 'bronze', kind: 'vat', at: [s * 44, -100], y: top });
  E.push({ t: 'bronze', kind: 'vat', at: [s * 62, 70], y: 0.03 });
  E.push({ t: 'bronze', kind: 'vat', at: [s * 62, -20], y: 0.03 });
}

// ── the Three Great Halls ──
const th = HALLS.taihe, zh = HALLS.zhonghe, bh = HALLS.baohe;
E.push({ t: 'qing_hall', rect: th.rect, y: th.y, H: 9.2, double: 7.5, roof: 'hip', bays: [11, 5], front: 's', four: false, plat: 0.5, eave: 2.2, sweep: 0.55 });
E.push({ t: 'qing_hall', rect: zh.rect, y: zh.y, H: 6.4, roof: 'none', bays: [5, 5], front: 's', four: true, plat: 0.4 });
E.push({ t: 'pyramid', poly: [[zh.rect[0] - 2, zh.rect[1] - 2], [zh.rect[2] + 2, zh.rect[1] - 2], [zh.rect[2] + 2, zh.rect[3] + 2], [zh.rect[0] - 2, zh.rect[3] + 2]], y: zh.y + 6.2, rise: 9, sweep: 0.6 });
E.push({ t: 'qing_hall', rect: bh.rect, y: bh.y, H: 7.6, double: 6, roof: 'xieshan', bays: [9, 5], front: 's', four: false, plat: 0.4, eave: 1.9 });

// ── the Gate of Heavenly Purity and the wall to the Inner Court ──
E.push({ t: 'palace_wall', a: [wx0, -172], b: [-22, -172], y: 0, h: 7, th: 2.4, gates: gates([[60, 5, 5]]) });
E.push({ t: 'palace_wall', a: [22, -172], b: [wx1, -172], y: 0, h: 7, th: 2.4, gates: gates([[30, 5, 5]]) });
E.push({ t: 'terrace', rect: [-22, -177, 22, -164], y0: 0, y1: 1.6, open: { s: [[14, 30]] } });
E.push({ t: 'stairs', rect: [-8, -164, 8, -159], y0: 0.03, y1: 1.6, dir: 'n' });
E.push({ t: 'qing_hall', rect: [-17, -175, 17, -166], y: 1.6, H: 6.2, roof: 'xieshan', bays: [5, 2], front: 's', four: true, plat: 0.1 });
for (const s of [-1, 1]) E.push({ t: 'bronze', kind: 'lion', at: [s * 11, -160], y: 0.03, s: 0.8, face: [0, 1] });

// ── rooms and the walk ──
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('taihe', th.rect, th.y, 'hall'),
  room('zhonghe', zh.rect, zh.y, 'hall'),
  room('baohe', bh.rect, bh.y, 'hall'),
  room('terrace', TIERS[2].rect, top, 'open'),
  room('courtyard', [wx0, wz0, wx1, wz1], 0, 'open'),
];
const walks = [[[0, 215], [0, 190], [0, 165], [0, 130], [-20, 128], [-36, 116], [-20, 100], [0, 70], [0, 38], [0, 31], [0, 26], [0, 20], [0, 14]]];
walks[0].y0 = 0;

export const palace = {
  id: 'qing-beijing-palace',
  name: { en: 'The Forbidden City: the Outer Court', zh: '紫禁城外朝' },
  era: { en: 'Ming plan of 1420; Hall of Supreme Harmony rebuilt 1695–97', zh: '明永乐十八年（1420年）规划；太和殿康熙三十六年（1697年）重建' },
  style: 'qing',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 215], facing: 'n' },
  bounds: [wx0 - 10, wz0 - 10, wx1 + 10, wz1 + 10],
  bakeBounds: [-66, -158, 66, 35],
  view: [-34, -27, 34, 15],
  bakeTop: 36,
  elements: E,
  rooms,
  walks,
};
export default palace;
