// The Citadel of Mohenjo-daro, c. 2500 BC (docs/settlements/mohenjo-daro.md §2, §4): the mud-brick platform faced in baked brick with its buttresses,
// towers and parapet, the east stair and the south ramp; the Great Bath (court, pool, stairs, gallery of stepped piers, doors, the cells and the well);
// the granary or great hall on its 27 blocks; the Pillared Hall; the College of Priests. Authored in world coordinates (origin 0, yaw 0).

import { PLAT, MOUND, MOUND_BATTER, EAST_STAIR, SOUTH_RAMP, BATH, GRANARY, PILLARED, COLLEGE, TOP, lanes, inRect } from './layout.js';

const E = [];
E.push({ t: 'indus_mound', rect: MOUND, y: PLAT, batter: MOUND_BATTER, gaps: [EAST_STAIR.rect, SOUTH_RAMP.rect] });
// the east stair, 12 m wide, from the town up to the platform; the south ramp for the carts
{
  const [x0, z0, x1, z1] = EAST_STAIR.rect;
  E.push({ t: 'stair', rect: EAST_STAIR.rect, y0: 0, y1: PLAT, dir: 'w', riser: 0.17, mat: 'brick', base: -0.3 });
  for (const z of [z0 - 0.5, z1 + 0.2]) E.push({ t: 'block', rect: [x0, z - 0.3 + 0.3, x1, z + 0.3], y0: -0.3, y1: PLAT * 0.62, mat: 'brick', batter: [0, 0, 0, 0], collide: false });
  const [a0, b0, a1, b1] = SOUTH_RAMP.rect;
  E.push({ t: 'stair', rect: SOUTH_RAMP.rect, y0: 0, y1: PLAT, dir: 'n', riser: 0.2, mat: 'brick', base: -0.3 });
  for (const x of [a0 - 0.6, a1]) E.push({ t: 'block', rect: [x, b0, x + 0.6, b1], y0: -0.3, y1: PLAT * 0.55, mat: 'brick', batter: [0, 0, 0, 0] });
}
E.push({ t: 'indus_bath', B: BATH, y: PLAT });
E.push({ t: 'indus_granary', rect: GRANARY, y: PLAT });
E.push({ t: 'indus_pillared', rect: PILLARED, y: PLAT });
E.push({ t: 'indus_college', rect: COLLEGE, y: PLAT });

// the works of the platform: the covered drains of its streets and lanes at the platform's height, falling east to an outfall through the parapet; the wells, the trees,
// the water-stands, the banners of the towers, the dressing of the Bath's court
{
  const streetsTop = [[-198, -62, -116, -62], [-196, -20, -196, -62], [-116, 30, -116, -62], [-116, -62, -116, -79], [-116, -79, -65.5, -79]];
  const laneRuns = lanes().filter((l) => inRect(MOUND, (l[0] + l[2]) / 2, (l[1] + l[3]) / 2)).map((l) => (l[2] - l[0] > l[3] - l[1] ? [l[0], (l[1] + l[3]) / 2, l[2], (l[1] + l[3]) / 2] : [(l[0] + l[2]) / 2, l[1], (l[0] + l[2]) / 2, l[3]]));
  E.push({ t: 'indus_drains', y: PLAT, runs: streetsTop, w: 0.6, manhole: 12, seed: 61 });
  E.push({ t: 'indus_drains', y: PLAT, runs: laneRuns, w: 0.3, manhole: 16, seed: 62 });
  E.push({ t: 'indus_outfall', at: [-65.47, -79], dir: 'e', y: PLAT });
  for (const [x, z, k] of [[-124, -71, 1], [-192, -80.5, 2], [-72, -92, 3], [-150, -18, 4]]) E.push({ t: 'indus_pwell', c: [x, z], y: PLAT, seed: k });
  E.push({ t: 'indus_pipal', c: [-121, -97], y: PLAT, h: 9, seed: 4 }, { t: 'indus_pipal', c: [-178, -80], y: PLAT, h: 7.5, seed: 9 });
  E.push({ t: 'indus_pshade', c: [-188, -67], y: PLAT });
  [[TOP[0] + 3, TOP[1] + 3], [TOP[2] - 3, TOP[1] + 3], [TOP[0] + 3, TOP[3] - 3], [TOP[2] - 3, TOP[3] - 3]].forEach(([x, z], i) => E.push({ t: 'indus_banner', c: [x, z], y: PLAT + 4.85, h: 3.4, seed: i }));
  E.push({ t: 'indus_bathdress', B: BATH, y: PLAT, seed: 5 });
  E.push({ t: 'indus_topdress', y: PLAT, B: BATH, college: COLLEGE, pillared: PILLARED, granary: GRANARY, stair: EAST_STAIR.rect, seed: 8 });
}

const room = (id, rect, y, kind, o = {}) => ({ id, rect, y, kind, ...o });
const [cx0, cz0, cx1, cz1] = BATH.court, ex = BATH.outer[2] - 7.2 - 0.45;
const rooms = [
  room('bath-court', BATH.court, PLAT, 'open'),
  room('bath-gallery-south', [BATH.outer[0] + 1.2, cz1, ex, BATH.outer[3] - 1.2], PLAT, 'hall'),
  room('bath-cells', [ex + 0.6, BATH.outer[1] + 1.2, BATH.outer[2] - 0.6, BATH.outer[3] - 1.2], PLAT, 'hall'),
  room('great-granary', [GRANARY[0] + 1, GRANARY[1] + 1, GRANARY[2] - 1, GRANARY[3] - 1], PLAT + 1.78, 'hall'),
  room('pillared-hall', [PILLARED[0] + 1, PILLARED[1] + 1, PILLARED[2] - 1, PILLARED[3] - 1], PLAT + 0.45, 'open'),
  room('college-court', [COLLEGE[0] + 8, COLLEGE[1] + 8, COLLEGE[2] - 8, COLLEGE[3] - 8], PLAT, 'open'),
];
// the way: up the east stair, across the platform past the Pillared Hall to the Bath's south doors, in, round the court to the pool
const walks = [[[-30, -44], [-47, -44], [-64, -44], [-67, -48], [-67, -78], [-80, -78], [-114, -78], [-116, -70], [-116, -62], [-147.8, -62], [-147.8, -69], [-147.8, -75], [-147.8, -86], [-147.8, -94]]];
walks[0].y0 = 0;
const [bx0, bz0, bx1, bz1] = BATH.outer;

export const citadel = {
  id: 'mohenjo-daro-citadel',
  name: { en: 'The Citadel and the Great Bath', zh: '卫城与大浴池' },
  era: { en: 'Indus civilization, c. 2500 BC', zh: '印度河文明，约公元前2500年' },
  style: 'indus',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-155, -72.5], facing: 'n' },
  bounds: [MOUND[0] - 6, MOUND[1] - 6, MOUND[2] + 22, MOUND[3] + 14],
  bakeBounds: [bx0 - 2, bz0 - 2, bx1 + 2, bz1 + 2],
  view: [bx0 - 4, bz0 - 4, bx1 + 4, bz1 + 4],
  viewY: PLAT,
  bakeTop: PLAT + 9,
  bakeSpacing: 1.0,
  elements: E,
  rooms,
  walks,
};
export default citadel;
void cx0; void cz0; void cx1;
