// West Lake, c. 1200 (docs/settlements/song-hangzhou.md §12), brought into the Lin'an disc: the lake lies north of the pagoda's
// court (settlement frame z from -496 to -230), with the Su causeway running north-south across it with its six bridges,
// a lakeside pavilion, a landing with painted pleasure boats moored, Beishan at the north end and Xizhao Hill with Leifeng
// Pagoda at the south end. Distances are compressed (the real causeway is 2.8 km).
// Plan-local coordinates (m, +x east, +z south), the plan's origin on the Imperial Way's axis in the lake.
import { LEVEL, LAKE_GATE } from './layout.js';


// ONE lake with the town's (layout.js WEST_LAKE: level, bowl and shore are the town's; ground.js digs the basin and the
// town's fabric lays its water). This plan adds only what stands in it: the causeway from the north gate's shore, its bridges,
// pavilions, the landing, Beishan at the far end, and Xizhao Hill with the pagoda on the south shore west of the causeway.
// The causeway's axis is the Imperial Way's (x 28): from the lake gate the Way's last stretch runs onto it.

export const WL = { origin: [LAKE_GATE.x, -372], hill: [-82, 84, -18, 128], leifeng: [-52, 108] };
const LAKE = LEVEL.lake, TOP = 0.0, BED = -3.6, ZS = 126;   // ZS: the causeway's south end, local (world z -246: where the Imperial Way begins, before the lake gate)
const E = [];
// the causeway: an earthen bank 22 m wide, its top 1.4 m over the water, to the south shore (the land there is its own ground), a paved path along its middle
// to the shore before the lake gate
E.push({ t: 'block', walk: true, rect: [-11, -100, 11, 108], y0: BED, y1: TOP, mat: 'ground' });
E.push({ t: 'paving', rect: [-2.6, -100, 2.6, ZS], y: TOP + 0.04, th: 0.2 });
// Beishan at the north end
E.push({ t: 'block', walk: true, rect: [-36, -112, 36, -96], y0: BED, y1: 3, mat: 'ground' });
E.push({ t: 'block', walk: true, rect: [-30, -106, 30, -96], y0: 3, y1: 3.4, mat: 'granite_block' });
E.push({ t: 'stairs', rect: [-4, -96, 4, -88], y0: TOP, y1: 3.4, dir: 'n', mat: 'granite_block' });
// the six bridges, from the north: Yingbo, Suolan, Wangshan, Yadi, Dongpu, Kuahong. The channels let the water through the bank; each
// bridge its own span and rise [inferred: the forms; the Song bridges are not described in the sources at hand]
const BR = [[-74, 'arch', 10, 2.0], [-48, 'arch', 12, 2.4], [-22, 'arch', 12, 2.6], [4, 'slab', 10], [30, 'arch', 12, 2.4], [56, 'arch', 10, 2.0]];
for (const [z, kind, sp, rise] of BR) {
  E.push({ t: 'water_rect', rect: [-11, z - sp / 2, 11, z + sp / 2], y: LAKE });
  if (kind === 'arch') E.push({ t: 'ming_arch_bridge', at: [0, z], across: 'z', span: sp + 0.4, width: 5.2, rise, landing: 4.2, y: TOP + 0.04, water: LAKE, bed: BED });
  else E.push({ t: 'ming_slab_bridge', pts: [[0, z - sp / 2 - 1.5], [0, z + sp / 2 + 1.5]], w: 5.2, y: TOP + 0.04, bed: BED });
}
export const LAKE_BRIDGES = BR.map(([z, kind, sp]) => ({ z: WL.origin[1] + z, kind, span: sp }));   // world z, kind and the water channel's width, for the boats' lanes
// lakeside pavilions on the east edge of the bank, between the third and fourth bridges and between the fifth and the sixth
E.push({ t: 'ming_pavilion', c: [7.2, -9], shape: 'hex', r: 3.0, y: TOP + 0.5, H: 3.6, plat: 0.5, open: [0, 1, 2, 3, 4, 5] });
E.push({ t: 'ming_pavilion', c: [-7.2, 43], shape: 'square', w: 5, y: TOP + 0.5, H: 3.4, plat: 0.5, open: [0, 1, 2, 3] });
// the landing on the west side of the bank: timber jetties with the painted boats moored along them
for (const z of [12, 22]) E.push({ t: 'block', walk: true, rect: [-24, z, -11, z + 2.4], y0: -1.8, y1: TOP, mat: 'timber' });
E.push({ t: 'lake_boat', at: [-18, 17.6], dir: [1, 0], len: 15, y: LAKE });
E.push({ t: 'lake_boat', at: [-17, 28.6], dir: [-1, 0], len: 11, y: LAKE });
E.push({ t: 'lake_boat', at: [-20, 7.6], dir: [1, 0], len: 9, y: LAKE });
E.push({ t: 'lake_boat', at: [-40, 40], dir: [1, 0.2], len: 12, y: LAKE, moored: false });
// Xizhao Hill and Leifeng Pagoda on the south shore west of the causeway: five storeys, a brick body with timber galleries and
// eaves (as repaired in 1171); a stair from the causeway to the hill, another to the terrace
E.push({ t: 'block', walk: true, rect: WL.hill, y0: BED, y1: 2.5, mat: 'ground' });
E.push({ t: 'block', walk: true, rect: [-76, 90, -30, 126], y0: 2.5, y1: 6, mat: 'granite_block' });
E.push({ t: 'stairs', rect: [-18, 102, -11, 110], y0: TOP, y1: 2.5, dir: 'w', mat: 'granite_block' });
E.push({ t: 'stairs', rect: [-30, 102, -18, 110], y0: 2.5, y1: 6, dir: 'w', mat: 'granite_block' });
const tiers = [{ r: 8.2, h: 11 }]; for (let i = 1; i < 5; i++) tiers.push({ r: 8.2 - 0.5 * i, h: 7.4 });
E.push({ t: 'liuhe_pagoda', c: WL.leifeng, y: 6, base: { r: 13, h: 1.6 }, tiers, bells: 'iron', interior: true, images: true });
export const leifengTop = 6 + 1.6 + tiers.reduce((a, t) => a + t.h, 0);

export const CAUSEWAY = { x: WL.origin[0], z0: WL.origin[1] - 100, z1: WL.origin[1] + 126, half: 11 };   // the bank's axis and ends (world)
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
export const westLake = {
  id: 'song-hangzhou-westlake',
  name: { en: 'West Lake and Leifeng Pagoda', zh: '西湖与雷峰塔' },
  era: { en: 'Southern Song, c. 1200', zh: '南宋，约1200年' },
  style: 'song',
  origin: WL.origin, base: 0, yaw: 0,
  entrance: { at: [0, 118], facing: 's' },
  bounds: [-125, -125, 125, 130],
  view: [-30, -100, 30, 100], viewY: TOP, bakeTop: 70,
  elements: E,
  rooms: [room('lake-causeway', [-8, -92, 8, ZS - 2], TOP, 'open')],
  walks: [Object.assign([[0, 118], [0, 60], [0, 0], [0, -60], [0, -90]], { y0: 0 }), Object.assign([[0, 118], [0, 106], [-14, 106], [-24, 106], [-34, 106], [-40, 96]], { y0: 0 })],   // along the causeway over its bridges to Beishan; up the stairs to the hill and the pagoda's terrace
};
export default westLake;
