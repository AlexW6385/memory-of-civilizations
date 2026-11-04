// The rock-hewn churches of Lalibela about 1220 (docs/settlements/lalibela.md §2–§4): each church
// on the floor of its pit, the pits' and trenches' rock walls (open where a trench joins), Bete
// Giyorgis alone to the south-west.

import { PITS, TRENCHES, EDGE, inRect } from './layout.js';

const E = [];
// ---- the walls of the cuts: each pit edge and trench side, broken where another cut opens onto it
const cuts = [...Object.values(PITS).map((p) => ({ rect: p.rect, depth: p.depth, pit: true })), ...TRENCHES.map((t) => ({ rect: t.rect, depth: Math.max(t.d0, t.d1), axis: t.axis }))];
const half = EDGE / 2;
for (const c of cuts) {
  const [x0, z0, x1, z1] = c.rect;
  const sides = [];
  if (c.pit || c.axis === 'x') sides.push(['z', z0 + half, x0, x1], ['z', z1 - half, x0, x1]);
  if (c.pit || c.axis === 'z') sides.push(['x', x0 + half, z0, z1], ['x', x1 - half, z0, z1]);
  for (const [k, v, u0, u1] of sides) {
    let pieces = [[u0, u1]];
    for (const o of cuts) {
      if (o === c) continue;
      const [ox0, oz0, ox1, oz1] = o.rect;
      // another cut crossing this wall line opens it
      const hit = k === 'z' ? oz0 <= v + half && oz1 >= v - half : ox0 <= v + half && ox1 >= v - half;
      if (!hit) continue;
      const [a, b] = k === 'z' ? [ox0, ox1] : [oz0, oz1];
      const inner = k === 'z' ? (a > x0 - 1 && b < x1 + 1) || (a < x1 && b > x0) : (a > z0 - 1 && b < z1 + 1) || (a < z1 && b > z0);
      if (!inner) continue;
      pieces = pieces.flatMap(([p, q]) => (b <= p || a >= q ? [[p, q]] : [[p, a + EDGE], [b - EDGE, q]].filter(([s, e]) => e - s > 0.5)));
    }
    for (const [p, q] of pieces) E.push({ t: 'rock_cut', a: k === 'z' ? [p, v] : [v, p], b: k === 'z' ? [q, v] : [v, q], y0: -c.depth - 0.2, th: EDGE });
  }
}
void inRect;
// the pits' floors, levelled
for (const p of Object.values(PITS)) { const [x0, z0, x1, z1] = p.rect; E.push({ t: 'block', walk: true, rect: [x0 + EDGE - 0.2, z0 + EDGE - 0.2, x1 - EDGE + 0.2, z1 - EDGE + 0.2], y0: -p.depth - 1.5, y1: -p.depth + 0.15, mat: 'tuff_red' }); }
// ---- the churches
const G = PITS.giyorgis, gc = [(G.rect[0] + G.rect[2]) / 2, (G.rect[1] + G.rect[3]) / 2];
E.push({ t: 'giyorgis', c: gc, y0: -G.depth + 0.15, h: G.depth - 0.15, a: 12, w: 4.6 });
const M = PITS.medhane, mc = [(M.rect[0] + M.rect[2]) / 2, (M.rect[1] + M.rect[3]) / 2];
E.push({ t: 'basilica', rect: [mc[0] - 16.75, mc[1] - 11.75, mc[0] + 16.75, mc[1] + 11.75], y0: -M.depth + 0.15, h: 11, cols: [11, 7] });
const ch = (p, w, d, h) => { const c = [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2]; E.push({ t: 'aksumite', rect: [c[0] - w / 2, c[1] - d / 2, c[0] + w / 2, c[1] + d / 2], y0: -p.depth + 0.15, h }); };
ch(PITS.maryam, 15, 11, 8.5); ch(PITS.golgotha, 22, 12, 8); ch(PITS.amanuel, 18, 12, 11.5); ch(PITS.gabriel, 16, 10, 9);

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('giyorgis', G.rect, -G.depth, 'open'), room('medhane', M.rect, -M.depth, 'open')];
const walks = [[[-280, 128], [-262, 128], [-216, 128], [-210, 130]]];
walks[0].y0 = 0;

export const churches = {
  id: 'lalibela-churches',
  name: { en: 'The rock-hewn churches of Lalibela', zh: '拉利贝拉岩石教堂' },
  era: { en: 'Zagwe, c. 1220', zh: '扎格维王朝，约1220年' },
  style: 'zagwe',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-240, 100], facing: 's' },
  bounds: [-262, -146, 212, 146],
  bakeBounds: [-262, -146, 212, 146],
  view: [-212, 118, -188, 142],
  bakeTop: 4,
  elements: E,
  rooms,
  walks,
};
export default churches;
