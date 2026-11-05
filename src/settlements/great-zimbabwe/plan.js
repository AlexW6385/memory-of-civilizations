// Great Zimbabwe about 1350 (docs/settlements/great-zimbabwe.md §2–§4): the Great Enclosure with its
// outer and inner walls, the parallel passage and the conical tower; the Hill Complex's walls; the
// Valley Ruins' enclosures.

import { ENCLOSURE, HILL, height } from './layout.js';

const E = [];
const ellipse = (c, r, n, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [c[0] + Math.cos(a) * r[0], c[1] + Math.sin(a) * r[1]]; });
const [ex, ez] = ENCLOSURE.c, [ra, rb] = ENCLOSURE.r;
// the outer wall (11 m high at its greatest, chevron band on the north-east), with the north entrance
E.push({ t: 'dry_wall', pts: ellipse(ENCLOSURE.c, ENCLOSURE.r, 40, -Math.PI * 0.42, Math.PI * 1.45), h: 10, th: 4.5, y: 0, chevron: [0, 0.2] });
// the inner wall forming the narrow parallel passage on the east, and an inner ring round the tower's court
E.push({ t: 'dry_wall', pts: ellipse(ENCLOSURE.c, [ra - 7, rb - 7], 14, -Math.PI * 0.35, Math.PI * 0.35), h: 8, th: 2.5, y: 0 });
E.push({ t: 'dry_wall', pts: ellipse([ex + 25, ez - 5], [16, 14], 14, Math.PI * 0.6, Math.PI * 1.9), h: 4, th: 1.6, y: 0 });
E.push({ t: 'cone_tower', c: [ex + 30, ez - 8], r: 2.8, h: 10 });
E.push({ t: 'cone_tower', c: [ex + 24, ez - 10], r: 1.2, h: 4 });
// the Hill Complex: walls along the ridge among the boulders
const yh = (x, z) => height(x, z);
E.push({ t: 'dry_wall', pts: ellipse(HILL.c, [HILL.r[0] * 0.5, HILL.r[1] * 0.42], 22, Math.PI * 0.1, Math.PI * 1.75), h: 6, th: 3, yAt: yh });
E.push({ t: 'dry_wall', pts: ellipse([HILL.c[0] - 30, HILL.c[1] + 5], [22, 16], 12), h: 4, th: 2, yAt: yh, closed: true });
// the Valley Ruins: smaller enclosures between the hill and the Great Enclosure
for (const [c, r] of [[[-90, -40], [22, 16]], [[-30, -20], [18, 14]], [[60, -50], [20, 15]], [[-120, 60], [16, 12]]]) E.push({ t: 'dry_wall', pts: ellipse(c, r, 16, 0.4, Math.PI * 2 - 0.2), h: 3.5, th: 1.6, yAt: yh });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
export const great = {
  id: 'great-zimbabwe-enclosure',
  name: { en: 'The Great Enclosure', zh: '大围场' },
  era: { en: 'Great Zimbabwe, about 1350', zh: '大津巴布韦，约1350年' },
  style: 'zimbabwe',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [ex + 6, ez - rb - 18], facing: 's' },
  bounds: [-180, -260, ex + ra + 4, ez + rb + 4],
  view: [ex - ra, ez - rb, ex + ra, ez + rb],
  bakeTop: 12,
  elements: E,
  rooms: [room('enclosure', [ex - ra + 6, ez - rb + 6, ex + ra - 6, ez + rb - 6], 0, 'open')],
  walks: [Object.assign([[ex + 6, ez - rb - 18], [ex + 6, ez - rb + 2], [ex + 6, ez]], { y0: 0 })],
};
export default great;
