// The rock-hewn churches of Lalibela about 1220 (docs/settlements/lalibela.md §2–§4): each church
// on the floor of its pit, the pits' and trenches' rock walls (open where a trench joins), Bete
// Giyorgis alone to the south-west.

import { PITS, TRENCHES, EDGE, OUTER, inRect, slope } from './layout.js';

const E = [];
// ---- the walls of the cuts: each pit edge and trench side, broken where another cut opens onto it
const cuts = [...Object.values(PITS).map((p) => ({ rect: p.rect, depth: p.depth, pit: true })), ...TRENCHES.map((t) => ({ rect: t.rect, depth: Math.max(t.d0, t.d1), axis: t.axis }))];
const half = EDGE / 2;
for (const c of cuts) {
  const [x0, z0, x1, z1] = c.rect;
  const sides = [];
  // a pit's north and south walls run on past its corners under the ground, to cover them
  const xo = c.pit ? OUTER : 0;
  if (c.pit || c.axis === 'x') sides.push(['z', z0 + half, x0 - xo, x1 + xo], ['z', z1 - half, x0 - xo, x1 + xo]);
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
    // in lengths of a few metres, each topped at the ground's level where it stands (the slopes rise outside the precinct)
    for (const [p, q] of pieces) {
      const n = Math.max(1, Math.ceil((q - p) / 2));
      for (let i = 0; i < n; i++) {
        const s0 = p + (q - p) * i / n, s1 = p + (q - p) * (i + 1) / n, m = (s0 + s1) / 2, [mx, mz] = k === 'z' ? [m, v] : [v, m];
        const vo = v + (v < (k === 'z' ? (z0 + z1) / 2 : (x0 + x1) / 2) ? -OUTER / 2 : OUTER / 2);   // widened outward, under the ground
        const inn = v < (k === 'z' ? (z0 + z1) / 2 : (x0 + x1) / 2) ? 1 : -1;                     // the unit into the cut
        E.push({ t: 'rock_cut', a: k === 'z' ? [s0, vo] : [vo, s0], b: k === 'z' ? [s1, vo] : [vo, s1], y0: -c.depth - 0.2, th: EDGE + OUTER, top: slope(mx, mz) + 0.12, n: k === 'z' ? [0, inn] : [inn, 0] });   // a hewn kerb a hand proud of the ground (its top flush with the ground had flickered with it)
      }
    }
  }
}
void inRect;
// the pits' floors, levelled; round the churches of Giyorgis and Medhane Alem a drainage channel cut in the
// floor, in Bete Maryam's court three pools (docs/settlements/lalibela.md §12; the Met: "drainage canals and
// trenches" against flooding, three pools in the courtyard of Biete Mariam)
const loop = (c, hx, hz, w) => [[c[0] - hx - w, c[1] - hz - w, c[0] + hx + w, c[1] - hz], [c[0] - hx - w, c[1] + hz, c[0] + hx + w, c[1] + hz + w], [c[0] - hx - w, c[1] - hz, c[0] - hx, c[1] + hz], [c[0] + hx, c[1] - hz, c[0] + hx + w, c[1] + hz]];
const ctr = (p) => [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2];
const SUNK = {
  giyorgis: loop(ctr(PITS.giyorgis), 14.0, 14.0, 0.35).map((r) => [r, 0.3]),
  medhane: loop(ctr(PITS.medhane), 18.95, 13.95, 0.35).map((r) => [r, 0.3]),
  maryam: [[[79.2, -100.6, 81.6, -98.0], 1.1], [[79.2, -82.0, 81.6, -79.4], 1.1], [[58.4, -82.0, 60.8, -79.4], 1.1]],
};
for (const [id, p] of Object.entries(PITS)) {
  const [x0, z0, x1, z1] = p.rect, F = [x0 + EDGE - 0.2, z0 + EDGE - 0.2, x1 - EDGE + 0.2, z1 - EDGE + 0.2], holes = SUNK[id] ?? [];
  for (const r of carve(F, holes.map(([h]) => h))) E.push({ t: 'block', walk: true, rect: r, y0: -p.depth - 1.5, y1: -p.depth + 0.15, mat: 'tuff_red' });
  for (const [h, d] of holes) {
    E.push({ t: 'block', walk: true, rect: h, y0: -p.depth - 1.5, y1: -p.depth + 0.15 - d, mat: d > 0.5 ? 'tuff_hewn' : 'tuff_red' });
    if (d > 0.5) E.push({ t: 'water_rect', rect: h, y: -p.depth + 0.15 - 0.35 });
  }
}
/** A rectangle less the rectangles `holes` inside it (not overlapping), as rectangles: strips across x at the holes' edges, each cut along z. */
function carve(r, holes) {
  const xs = [...new Set([r[0], r[2], ...holes.flatMap((h) => [h[0], h[2]])])].sort((p, q) => p - q), out = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    const a = xs[i], b = xs[i + 1], cut = holes.filter((h) => h[0] < b - 1e-6 && h[2] > a + 1e-6).sort((p, q) => p[1] - q[1]);
    let z = r[1];
    for (const h of cut) { if (h[1] > z) out.push([a, z, b, h[1]]); z = h[3]; }
    if (r[3] > z) out.push([a, z, b, r[3]]);
  }
  return out;
}
// ---- the churches
const G = PITS.giyorgis, gc = [(G.rect[0] + G.rect[2]) / 2, (G.rect[1] + G.rect[3]) / 2];
// its roof level with the ground round the pit: the body stops 0.42 m below it, the three stepped crosses carved up to it
E.push({ t: 'giyorgis', c: gc, y0: -G.depth + 0.15, h: G.depth - 0.15 - 0.42, a: 12, w: 4.6 });
// the way in: the trench from the west narrows into a tunnel through the last eight metres of rock and
// opens into the court beside the church's west arm (Wikipedia: "a very narrow man-made canyon ...
// which becomes a tunnel close to the church"; Senses Atlas: "a descending trench and a tunnel")
{
  const T = TRENCHES[0], [, tz0, , tz1] = T.rect, x1 = G.rect[0] + EDGE;
  const zc = (tz0 + tz1) / 2, wT = tz1 - tz0 - 2 * EDGE;
  E.push({ t: 'rock_cut', a: [x1 - 8, zc], b: [x1, zc], y0: -7.4, th: wT, top: 0.12 });
  E.push({ t: 'block', walk: true, rect: [x1 - 8, tz0 + EDGE, x1, tz1 - EDGE], y0: -0.3, y1: 0, mat: 'tuff_red', collide: false });
  // the tunnel's mouths, each under a hewn band standing a little proud of the rock face
  for (const x of [x1 - 8 - 0.06, x1 + 0.06]) E.push({ t: 'rock_cut', a: [x, tz0 + EDGE - 0.2], b: [x, tz1 - EDGE + 0.2], y0: -7.75, th: 0.12, top: -7.1 });
}
const M = PITS.medhane, mc = [(M.rect[0] + M.rect[2]) / 2, (M.rect[1] + M.rect[3]) / 2];
E.push({ t: 'basilica', rect: [mc[0] - 16.75, mc[1] - 11.75, mc[0] + 16.75, mc[1] + 11.75], y0: -M.depth + 0.15, h: 11, cols: [12, 7] });
{ const p = PITS.maryam; E.push({ t: 'maryam', c: [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2], y0: -p.depth + 0.15, h: 9 }); }
const ch = (p, w, d, h) => { const c = [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2]; E.push({ t: 'aksumite', rect: [c[0] - w / 2, c[1] - d / 2, c[0] + w / 2, c[1] + d / 2], y0: -p.depth + 0.15, h }); };
ch(PITS.golgotha, 22, 12, 8); ch(PITS.amanuel, 18, 12, 11.5); ch(PITS.gabriel, 16, 10, 9);

// cells and tombs cut into the rock faces of Bete Giyorgis' pit (sensesatlas: its walls have "a
// number of caves", lodgings of priests and burial places), some at the floor, some on a ledge
{
  const [x0, z0, x1, z1] = G.rect, yf = -G.depth + 0.15;
  // their places on the faces as first laid out for a pit of 26 m inside, stretched to this one's 36 m
  const k = (x1 - x0 - 2 * EDGE) / 26, mx = (v) => gc[0] + (v + 200) * k, mz = (v) => gc[1] + (v - 130) * k;
  const caves = [[[x1 - EDGE, mz(120)], [-1, 0], 0], [[mx(-208), z1 - EDGE], [0, -1], 1.8], [[x1 - EDGE, mz(139)], [-1, 0], 0], [[mx(-206), z0 + EDGE], [0, 1], 0], [[mx(-193), z0 + EDGE], [0, 1], 2.6], [[mx(-193.5), z1 - EDGE], [0, -1], 0], [[mx(-189), z1 - EDGE], [0, -1], 3.4], [[x0 + EDGE, mz(118.5)], [1, 0], 0], [[x0 + EDGE, mz(140)], [1, 0], 2.2]];
  for (const [c, n, up] of caves) E.push({ t: 'cave', c, n, y: yf + 0.25 + up, floor: yf, w: up ? 0.9 : 1.05, h: up ? 1.4 : 1.75 });
}
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('giyorgis', G.rect, -G.depth, 'open'), room('medhane', M.rect, -M.depth, 'open'), room('medhane-in', [mc[0] - 13.15, mc[1] - 8.15, mc[0] + 13.15, mc[1] + 8.15], -M.depth + 0.95, 'hall'), room('maryam-in', [62.8, -93.6, 77.2, -86.4], -PITS.maryam.depth + 0.75, 'hall')];
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
  view: [-208, 122, -182, 148],
  bakeTop: 4,
  elements: E,
  rooms,
  walks,
};
export default churches;
