// Muscovy about 1600 — the animals (src/engine/fauna.js draws them): carp and pike-perch in the Moskva's shallows, swifts
// and swallows over the river and the squares, jackdaws and rooks round the bell towers and domes of the churches (the crow
// flights circle the Kremlin's cathedrals and St Basil's), sparrows on the log paving and the fence tops.
import { RIVER, RADIUS, CATHEDRALS, BASIL, SQUARE, KITAI, riverZ, height, streetSegments, lots, openIzba, inLot, reserved, ROWS } from './layout.js';

const fish = [];
for (let i = 0; i < 6; i++) {
  const x = -230 + i * 85;
  fish.push({ n: 3, size: [0.5, 0.8], palette: 'carp', y: RIVER.level, dist: (px, pz) => Math.abs(pz - riverZ(px)) - (RIVER.w / 2 - 3), margin: 2, area: [x - 25, riverZ(x) - 12, x + 25, riverZ(x) + 12], a: [18, 6], ratio: 0.3, speed: 0.3, rise: 0 });
}
const [ix, iz] = CATHEDRALS.ivan;
const flights = [
  { kind: 'crow', n: 9, loop: { c: [ix, iz], a: [34, 30], rot: 0.3 }, y: [48, 20], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [BASIL[0], BASIL[1]], a: [26, 22], rot: 0 }, y: [32, 14], speed: 8 },
  { kind: 'swallow', n: 5, lane: { a: [-300, riverZ(-300) - 4], b: [300, riverZ(300) - 4] }, y: [RIVER.level + 1.5, RIVER.level + 4.5], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [30, 20], a: [40, 70], rot: 0 }, y: [4, 12], speed: 8 },
];
flights.push({ kind: 'crow', n: 6, loop: { c: [CATHEDRALS.archangel[0] + 12, CATHEDRALS.archangel[1] + 11], a: [26, 22], rot: 0 }, y: [26, 12], speed: 8 });
flights.push({ kind: 'crow', n: 5, loop: { c: [(KITAI[2][0] + KITAI[1][0]) / 2, KITAI[1][1] + 30], a: [60, 18], rot: 0.1 }, y: [22, 10], speed: 8 });
flights.push({ kind: 'swallow', n: 4, loop: { c: [150, 60], a: [90, 60], rot: 0.4 }, y: [4, 14], speed: 8 });
flights[2].a = [30, 3];
const perches = [];
for (const [x, z] of [[40, -100], [38, -30], [44, 40], [36, 90], [-90, 230 - 0], [120, 35], [-60, -120], [150, -35]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: (x * 7) % 3, range: [1.5, 1.3] });
// pigeons on the beaten earth of Red Square, about St Basil's steps and before the Spassky bridge, drawn to the crumbs of the market
for (const [x, z] of [[30, 60], [20, 100], [44, 112], [8, 110], [38, 70], [14, 30], [48, 6], [-4, -20]]) perches.push({ kind: 'pigeon', x, z, y: height(x, z), rot: x * 0.7, range: [2.2, 1.8] });
// sparrows on the fence tops and the log paving of the streets, near the middle first; herons standing in the river's shallows
{ const S = streetSegments(); for (let i = 0; i < S.length; i += 3) { const { a, b } = S[i], t = 0.3 + ((i * 37) % 40) / 100, x = a[0] + (b[0] - a[0]) * t + 3.2, z = a[1] + (b[1] - a[1]) * t + 2; if (Math.hypot(x, z) < 300) perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: (i * 5) % 6, range: [1.5, 1.3] }); } }
for (const x of [-210, -60, 90, 200]) perches.push({ kind: 'heron', x, z: riverZ(x) - RIVER.w / 2 + 4.5, y: RIVER.level - 0.4, rot: 1.6, range: [0.4, 0.4] });
void RADIUS; void SQUARE;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/muscovy.md §15) ──
const critters = [];
{
  const near = lots().filter((l) => l.kind !== 'barn' && openIzba(l)).map((l) => ({ l, d: Math.hypot((l.rect[0] + l.rect[2]) / 2 - 40, (l.rect[1] + l.rect[3]) / 2 - 20) })).filter((q) => q.d < 200).sort((a, b) => a.d - b.d);
  const free = (x, z) => !inLot(x, z, 1.0) && !reserved(x, z) && !(x > 62 && x < 96);
  // a spot beside a house (in the free strip of its street side or yard), the first free of the corners round the lot
  const spot = (l, k) => { const [x0, z0, x1, z1] = l.rect; const C = [[x0 - 1.4, z0 - 1.4], [x1 + 1.4, z1 + 1.4], [x0 - 1.4, z1 + 1.4], [x1 + 1.4, z0 - 1.4], [x0 - 1.4, (z0 + z1) / 2], [x1 + 1.4, (z0 + z1) / 2]]; for (let i = 0; i < C.length; i++) { const c = C[(i + k) % C.length]; if (free(...c)) return c; } return null; };
  const put = (model, p, o = {}) => critters.push({ model, at: [p[0], height(p[0], p[1]) + 0.02, p[1]], rot: ((p[0] * 7 + p[1] * 3) % 6.28), ...o });
  near.forEach(({ l }, i) => {
    if (i < 6) { const p = spot(l, i); if (p) { put('rooster', p, { range: [1.2, 0.8] }); put('hen_brown', [p[0] + 0.7, p[1] + 0.4], { range: [1.2, 0.8] }); put(i % 2 ? 'hen_white' : 'hen_brown', [p[0] - 0.6, p[1] - 0.5], { range: [1.2, 0.8], size: 0.96 }); } }
    else if (i < 11) { const p = spot(l, i + 2); if (p) put(i % 2 ? 'cat_tabby' : 'cat_orange', p, { range: [7, 2.5] }); }          // cats of the izby (the stove's warmth, the grain stores) [inferred]
    else if (i < 15) { const p = spot(l, i + 1); if (p) put('dog', p, { range: [9, 3.5] }); }
    else if (i < 18) { const p = spot(l, i + 3); if (p) put(i % 2 ? 'goat_white' : 'goat_black', p, { range: [4, 2.5] }); }
  });
  // street dogs of the square and the lane before the rows, a pair of geese by the Moskva's stages
  for (const p of [[22, 8], [-6, 60], [64, -40]]) put('dog', p, { range: [9, 3.5] });
  for (const [x, dz] of [[-40, 0], [60, 6], [150, 2]]) { const z = riverZ(x) - RIVER.w / 2 - 6 + dz; put('goose_white', [x, z], { range: [2, 1.5] }); put('goose_grey', [x + 0.9, z + 0.6], { range: [2, 1.5] }); }
}
void ROWS;
export default { fish, flights, perches, critters };
