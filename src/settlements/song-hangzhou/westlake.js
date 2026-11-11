// West Lake, c. 1200 (docs/settlements/song-hangzhou.md §12), brought into the Lin'an disc: the lake lies north of the pagoda's
// court (settlement frame z from -496 to -230), with the Su causeway running north-south across it with its six bridges,
// a lakeside pavilion, a landing with painted pleasure boats moored, Beishan at the north end and Xizhao Hill with Leifeng
// Pagoda at the south end. Distances are compressed (the real causeway is 2.8 km).
// Plan-local coordinates (m, +x east, +z south), the plan's origin at the lake's centre [0, -380]; the lake is level LAKE.


export const WL = { origin: [0, -380], lake: [-120, -116, 120, 150], hill: [-42, 88, 42, 150], leifeng: [0, 118] };
const LAKE = -1.0, TOP = 0.0;
const E = [];
E.push({ t: 'water_rect', rect: WL.lake, y: LAKE });
// the causeway: an earthen bank 22 m wide, its top a metre over the water here (0.4 m in the record), a paved path along its middle
E.push({ t: 'block', walk: true, rect: [-11, -100, 11, 90], y0: -3.6, y1: TOP, mat: 'ground' });
E.push({ t: 'paving', rect: [-2.6, -100, 2.6, 90], y: TOP + 0.04, th: 0.2 });
// Beishan at the north end, Xizhao Hill and the pagoda's terraces at the south end
E.push({ t: 'block', walk: true, rect: [-36, -116, 36, -96], y0: -3.6, y1: 3, mat: 'ground' });
E.push({ t: 'block', walk: true, rect: [-30, -106, 30, -96], y0: 3, y1: 3.4, mat: 'granite_block' });
E.push({ t: 'stairs', rect: [-4, -96, 4, -88], y0: TOP, y1: 3.4, dir: 'n', mat: 'granite_block' });
// the six bridges, from the north: Yingbo, Suolan, Wangshan, Yadi, Dongpu, Kuahong. The channels let the water through the bank; each
// bridge its own span and rise [inferred: the forms; the Song bridges are not described in the sources at hand]
const BR = [[-74, 'arch', 10, 2.0], [-48, 'arch', 12, 2.4], [-22, 'arch', 12, 2.6], [4, 'slab', 10], [30, 'arch', 12, 2.4], [56, 'arch', 10, 2.0]];
for (const [z, kind, sp, rise] of BR) {
  E.push({ t: 'water_rect', rect: [-11, z - sp / 2, 11, z + sp / 2], y: LAKE });
  if (kind === 'arch') E.push({ t: 'ming_arch_bridge', at: [0, z], across: 'z', span: sp + 0.4, width: 5.2, rise, landing: 4.2, y: TOP + 0.04, water: LAKE, bed: -3.6 });
  else E.push({ t: 'ming_slab_bridge', pts: [[0, z - sp / 2 - 1.5], [0, z + sp / 2 + 1.5]], w: 5.2, y: TOP + 0.04, bed: -3.6 });
}
// lakeside pavilions on the east edge of the bank, between the third and fourth bridges and between the fifth and the sixth
E.push({ t: 'ming_pavilion', c: [7.2, -9], shape: 'hex', r: 3.0, y: TOP + 0.5, H: 3.6, plat: 0.5, open: [0, 1, 2, 3, 4, 5] });
E.push({ t: 'ming_pavilion', c: [-7.2, 43], shape: 'square', w: 5, y: TOP + 0.5, H: 3.4, plat: 0.5, open: [0, 1, 2, 3] });
// the landing on the west side of the bank: timber jetties with the painted boats moored along them
for (const z of [12, 22]) E.push({ t: 'block', walk: true, rect: [-24, z, -11, z + 2.4], y0: -1.8, y1: TOP, mat: 'timber' });
E.push({ t: 'lake_boat', at: [-18, 17.6], dir: [1, 0], len: 15, y: LAKE });
E.push({ t: 'lake_boat', at: [-17, 28.6], dir: [-1, 0], len: 11, y: LAKE });
E.push({ t: 'lake_boat', at: [-20, 7.6], dir: [1, 0], len: 9, y: LAKE });
E.push({ t: 'lake_boat', at: [-40, 40], dir: [1, 0.2], len: 12, y: LAKE, moored: false });
// Xizhao Hill and Leifeng Pagoda: five storeys, a brick body with timber galleries and eaves (as repaired in 1171)
E.push({ t: 'block', walk: true, rect: WL.hill, y0: -3.6, y1: 2.5, mat: 'ground' });
E.push({ t: 'block', walk: true, rect: [-34, 98, 34, 146], y0: 2.5, y1: 6, mat: 'granite_block' });
E.push({ t: 'stairs', rect: [-5, 90, 5, 98], y0: 2.5, y1: 6, dir: 's', mat: 'granite_block' });
E.push({ t: 'stairs', rect: [-5, 80, 5, 88], y0: TOP, y1: 2.5, dir: 's', mat: 'granite_block' });
const tiers = [{ r: 8.2, h: 11 }]; for (let i = 1; i < 5; i++) tiers.push({ r: 8.2 - 0.5 * i, h: 7.4 });
E.push({ t: 'liuhe_pagoda', c: WL.leifeng, y: 6, base: { r: 13, h: 1.6 }, tiers, bells: 'iron', interior: true, images: true });
export const leifengTop = 6 + 1.6 + tiers.reduce((a, t) => a + t.h, 0);

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
export const westLake = {
  id: 'song-hangzhou-westlake',
  name: { en: 'West Lake and Leifeng Pagoda', zh: '西湖与雷峰塔' },
  era: { en: 'Southern Song, c. 1200', zh: '南宋，约1200年' },
  style: 'song',
  origin: WL.origin, base: 0, yaw: 0,
  entrance: { at: [0, 70], facing: 's' },
  bounds: [-125, -120, 125, 152],
  view: [-30, -100, 30, 90], viewY: TOP, bakeTop: 70,
  elements: E,
  rooms: [room('lake-causeway', [-8, -92, 8, 90], TOP, 'open')],
  walks: [],
};
export default westLake;
