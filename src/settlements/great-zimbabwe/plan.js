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
E.push({ t: 'cone_tower', c: [ex + 24, ez - 10], r: 1.2, h: 4, dentelle: false });
// the platform beside the tower, 7.6 m across, the largest at Great Zimbabwe (zimfieldguide)
E.push({ t: 'platform', c: [ex + 31, ez], r: 3.8, h: 0.9, step: Math.PI * 1.15 });
// the Hill Complex: walls along the ridge among the boulders
const yh = (x, z) => height(x, z);
E.push({ t: 'dry_wall', pts: ellipse(HILL.c, [HILL.r[0] * 0.5, HILL.r[1] * 0.42], 22, Math.PI * 0.1, Math.PI * 1.75), h: 6, th: 3, yAt: yh });
E.push({ t: 'dry_wall', pts: ellipse([HILL.c[0] - 30, HILL.c[1] + 5], [22, 16], 12), h: 4, th: 2, yAt: yh, closed: true });
// the Valley Ruins: smaller enclosures between the hill and the Great Enclosure
for (const [c, r] of [[[-90, -40], [22, 16]], [[-30, -20], [18, 14]], [[60, -50], [20, 15]], [[-120, 60], [16, 12]]]) E.push({ t: 'dry_wall', pts: ellipse(c, r, 16, 0.4, Math.PI * 2 - 0.2), h: 3.5, th: 1.6, yAt: yh });

// the Eastern Enclosure at the hill's east end: a curved wall, the stone platform with the soapstone
// birds on their columns in a row and tall monoliths behind them (Wikipedia, Zimbabwe Bird: eight
// birds; slots in a platform here held the monoliths; the birds' order is unknown — ours a row)
{
  const EC = [46, -195];
  E.push({ t: 'dry_wall', pts: ellipse(EC, [13, 10], 12, Math.PI * 0.75, Math.PI * 2.45), h: 3.2, th: 1.6, yAt: yh });
  const P = [40, -200.2, 52, -196], hs = [[P[0], P[1]], [P[2], P[1]], [P[0], P[3]], [P[2], P[3]], [46, -198]].map(([x, z]) => yh(x, z));
  const y1 = Math.max(...hs) + 0.5;
  E.push({ t: 'block', rect: P, y0: Math.min(...hs) - 0.4, y1, mat: 'granite_block', walk: true });
  for (let k = 0; k < 8; k++) E.push({ t: 'soapstone_bird', at: [40.9 + k * 1.46, -197.1], y: y1, rot: Math.PI + (k % 3 - 1) * 0.06, s: k === 2 || k === 5 ? 0.8 : 1 });
  for (let k = 0; k < 6; k++) E.push({ t: 'monolith', at: [41.6 + k * 1.95, -199.3], y: y1, rot: (k % 2 ? 0.1 : -0.08), h: 1.9 + (k * 37 % 10) / 10 });
}
// the granite boulders of the hill, the walls winding among them
{
  const walls = [];
  for (const el of E) if (el.t === 'dry_wall' && el.yAt) for (let k = 0; k < el.pts.length - 1; k++) for (let f = 0; f < 1; f += 0.1) walls.push([el.pts[k][0] + (el.pts[k + 1][0] - el.pts[k][0]) * f, el.pts[k][1] + (el.pts[k + 1][1] - el.pts[k][1]) * f]);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let n = 0, tries = 0; n < 18 && tries < 600; tries++) {
    const a = rnd() * Math.PI * 2, e = 0.15 + rnd() * 0.75, x = HILL.c[0] + Math.cos(a) * HILL.r[0] * e, z = HILL.c[1] + Math.sin(a) * HILL.r[1] * e, r = 3 + rnd() * 5;
    if (walls.some(([wx, wz]) => Math.hypot(wx - x, wz - z) < r + 3) || Math.hypot(x - 46, z + 195) < r + 16) continue;
    if (yh(x, z) < 6) continue;
    if (E.some((o) => o.t === 'boulder' && Math.hypot(o.c[0] - x, o.c[1] - z) < o.r + r + 2)) continue;
    const ys = [[x, z], [x + r, z], [x - r, z], [x, z + r], [x, z - r]].map(([p, q]) => yh(p, q));
    E.push({ t: 'boulder', c: [x, z], r, h: r * (0.55 + rnd() * 0.35), y: Math.min(...ys) - 0.2, seed: n * 3 + 1 });
    n++;
  }
}

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
