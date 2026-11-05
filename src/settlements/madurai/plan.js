// The Meenakshi temple about 1650 (docs/settlements/madurai.md §2–§4): the outer granite wall with
// its four great gopurams (the south one tallest, 52 m), the inner enclosures of Sundareswarar and
// Meenakshi with their own gopurams and gilded vimanas, the Golden Lotus tank in its colonnade,
// the Thousand-Pillar Hall, the pillared entrance hall from the east gate, the flagstaffs.

import { WALL, SUNDARA, MEENAKSHI, TANK, HALL, GATES } from './layout.js';

const E = [];
const wallLoop = (r, gates, h, th) => {
  const [x0, z0, x1, z1] = r, sides = [['n', [x0, z0], [x1, z0]], ['e', [x1, z0], [x1, z1]], ['s', [x0, z1], [x1, z1]], ['w', [x0, z0], [x0, z1]]];
  for (const [s, a, b] of sides) {
    const g = gates.filter((q) => q.s === s);
    if (!g.length) { E.push({ t: 'prakara', a, b, h, th }); continue; }
    const alongX = s === 'n' || s === 's', i = alongX ? 0 : 1;
    let cur = a[i];
    for (const q of g.sort((p, o) => p.at - o.at)) {
      const e0 = q.at - q.w / 2, e1 = q.at + q.w / 2;
      if (e0 > cur) E.push({ t: 'prakara', a: alongX ? [cur, a[1]] : [a[0], cur], b: alongX ? [e0, a[1]] : [a[0], e0], h, th });
      cur = e1;
    }
    if (b[i] > cur) E.push({ t: 'prakara', a: alongX ? [cur, a[1]] : [a[0], cur], b, h, th });
  }
};
// the outer wall and its four great gopurams
const OG = [
  { s: 'e', c: GATES.e, h: 47, w: 34, d: 20, n: 9 }, { s: 's', c: GATES.s, h: 52, w: 34, d: 20, n: 9 },
  { s: 'w', c: GATES.w, h: 49, w: 33, d: 20, n: 9 }, { s: 'n', c: GATES.n, h: 48, w: 33, d: 20, n: 9 },
];
wallLoop(WALL, OG.map((g) => ({ s: g.s, at: g.s === 'n' || g.s === 's' ? g.c[0] : g.c[1], w: g.w })), 9, 2);
for (const g of OG) E.push({ t: 'gopuram', c: g.c, dir: g.s === 'n' || g.s === 's' ? 'ns' : 'ew', w: g.w, d: g.d, h: g.h, tiers: g.n });
// Sundareswarar's enclosure: gopurams east, north and south, the vimana, the flagstaff
{
  const [x0, z0, x1, z1] = SUNDARA, cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
  const IG = [{ s: 'e', c: [x1, cz], h: 30, w: 20, d: 12, n: 5 }, { s: 'n', c: [cx, z0], h: 24, w: 16, d: 10, n: 5 }, { s: 's', c: [cx, z1], h: 24, w: 16, d: 10, n: 5 }];
  wallLoop(SUNDARA, IG.map((g) => ({ s: g.s, at: g.s === 'n' || g.s === 's' ? g.c[0] : g.c[1], w: g.w })), 7, 1.6);
  for (const g of IG) E.push({ t: 'gopuram', c: g.c, dir: g.s === 'n' || g.s === 's' ? 'ns' : 'ew', w: g.w, d: g.d, h: g.h, tiers: g.n });
  E.push({ t: 'mandapa', rect: [x0 + 10, z0 + 14, x1 - 12, z1 - 14], h: 6.5, step: 3.4 });
  E.push({ t: 'vimana', c: [cx - 10, cz], s: 11, h: 22, y: 7.3 });
  E.push({ t: 'dhvaja', c: [x1 + 10, cz], h: 14 });
  E.push({ t: 'mandapa', rect: [x1 + 3, cz - 8, GATES.e[0] - 12, cz + 8], h: 7, step: 3.4 });          // the corridor from the east gate
}
// Meenakshi's enclosure: its gopuram east, the vimana, the flagstaff
{
  const [x0, z0, x1, z1] = MEENAKSHI, cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
  const IG = [{ s: 'e', c: [x1, cz], h: 18, w: 14, d: 9, n: 3 }];
  wallLoop(MEENAKSHI, IG.map((g) => ({ s: 'e', at: cz, w: g.w })), 6, 1.4);
  E.push({ t: 'gopuram', c: IG[0].c, dir: 'ew', w: 14, d: 9, h: 18, tiers: 3 });
  E.push({ t: 'mandapa', rect: [x0 + 8, z0 + 10, x1 - 10, z1 - 10], h: 6, step: 3.4 });
  E.push({ t: 'vimana', c: [cx - 6, cz], s: 9, h: 18, y: 6.8 });
  E.push({ t: 'dhvaja', c: [x1 + 8, cz], h: 12 });
}
// the Golden Lotus tank and the Thousand-Pillar Hall
E.push({ t: 'tank', rect: TANK, depth: 4, water: 2.4 });
E.push({ t: 'mandapa', rect: HALL, h: 6, step: 2.6, carved: true });
// the open pillared halls along the inner side of the south and west gates
E.push({ t: 'mandapa', rect: [GATES.s[0] - 8, 82, GATES.s[0] + 8, GATES.s[1] - 12], h: 6, step: 3.4 });
E.push({ t: 'mandapa', rect: [WALL[0] + 12, GATES.w[1] - 7, MEENAKSHI[0] - 6, GATES.w[1] + 7], h: 6, step: 3.4 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('outer court', WALL, 0, 'open'),
  room('golden lotus tank', [TANK[0] - 6, TANK[1] - 6, TANK[2] + 6, TANK[3] + 6], 0.5, 'hall'),
  room('thousand-pillar hall', HALL, 0.5, 'hall'),
];
const walks = [[[GATES.s[0], 200], [GATES.s[0], 126], [GATES.s[0], 100], [GATES.s[0], 75]]];
walks[0].y0 = 0;

export const temple = {
  id: 'madurai-meenakshi',
  name: { en: 'The Meenakshi Temple', zh: '米纳克希神庙' },
  era: { en: 'Madurai, about 1650', zh: '马杜赖，约1650年' },
  style: 'dravidian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [GATES.s[0], 175], facing: 'n' },
  bounds: [WALL[0] - 4, WALL[1] - 4, WALL[2] + 4, WALL[3] + 4],
  view: [GATES.s[0] - 25, 105, GATES.s[0] + 25, 130],
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};
export default temple;
