// West Lake, c. 1200 (docs/settlements/song-hangzhou.md §12): a stretch of the Su causeway with three of its six bridges and a
// lakeside pavilion, a landing with painted pleasure boats moored, and Leifeng Pagoda on Xizhao Hill south of the lake.
// This lies some 3 km north of the Liuhe Pagoda, outside the Lin'an disc: the plan is complete and builds on its own
// (tools/showroom.mjs), but is NOT registered in index.js; it needs a site of its own or a larger disc.
// Local coordinates (m, +x east, +z south); the causeway runs along z, the lake's level is y = 0, the hill is at the south end.

const LAKE = 0, DECK = 0.9;
const E = [];
E.push({ t: 'water_rect', rect: [-170, -230, 170, 170], y: LAKE });
// the causeway: an earthen bank 0.4 m above the water in the record; ours stands a little higher to be walked, 26 m wide, with a paved path
E.push({ t: 'block', walk: true, rect: [-13, -200, 13, 128], y0: -3, y1: 0.5, mat: 'ground' });
E.push({ t: 'paving', rect: [-3, -200, 3, 128], y: 0.54, th: 0.2 });
// three bridges (of the six) across the channels that let the water through, stone arches [inferred: arched; the Song form is not described]
for (const z of [-120, -20, 80]) {
  E.push({ t: 'water_rect', rect: [-13, z - 9, 13, z + 9], y: LAKE });
  E.push({ t: 'ming_arch_bridge', at: [0, z], across: 'z', span: 18, width: 6, rise: 2.2, landing: 4.6, y: 0.5, water: LAKE, bed: -3 });
}
// a lakeside pavilion on the east side of the bank between the second and third bridges, on a stone platform
E.push({ t: 'ming_pavilion', c: [9, 30], shape: 'hex', r: 3.0, y: 1.0, H: 3.6, plat: 0.5, open: [0, 1, 2, 3, 4, 5] });
// the landing on the west side: a timber jetty with the painted boats moored along it
E.push({ t: 'block', walk: true, rect: [-30, 52, -13, 56], y0: -1, y1: 0.5, mat: 'timber' });
E.push({ t: 'block', walk: true, rect: [-30, 66, -13, 70], y0: -1, y1: 0.5, mat: 'timber' });
E.push({ t: 'lake_boat', at: [-22, 60], dir: [1, 0], len: 15, y: LAKE });
E.push({ t: 'lake_boat', at: [-21, 76], dir: [-1, 0], len: 11, y: LAKE });
E.push({ t: 'lake_boat', at: [-24, 46], dir: [1, 0], len: 9, y: LAKE });
// Xizhao Hill at the south end, with Leifeng Pagoda: five storeys, brick body, timber galleries and eaves (as repaired in 1171)
E.push({ t: 'block', walk: true, rect: [-45, 128, 45, 200], y0: -3, y1: 2.5, mat: 'ground' });
E.push({ t: 'block', walk: true, rect: [-34, 138, 34, 192], y0: 2.5, y1: 6, mat: 'granite_block' });
E.push({ t: 'stairs', rect: [-5, 128, 5, 138], y0: 2.5, y1: 6, dir: 'n', mat: 'granite_block' });
const tiers = [{ r: 8.2, h: 11 }]; for (let i = 1; i < 5; i++) tiers.push({ r: 8.2 - 0.5 * i, h: 7.4 });
E.push({ t: 'pagoda_oct', c: [0, 165], y: 6, base: { r: 13, h: 1.6 }, tiers, spire: 4.2, bells: 'iron', interior: true, images: true });

export const westLake = {
  id: 'song-hangzhou-westlake',
  name: { en: 'West Lake and Leifeng Pagoda', zh: '西湖与雷峰塔' },
  era: { en: 'Southern Song, c. 1200', zh: '南宋，约1200年' },
  style: 'song',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -190], facing: 's' },
  bounds: [-170, -230, 170, 200],
  view: [-30, -190, 30, 130], viewY: 0.5, bakeTop: 70,
  elements: E, rooms: [], walks: [],
};
export default westLake;
