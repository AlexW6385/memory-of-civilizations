// Amsterdam about 1670 — the animals (src/engine/fauna.js; docs/settlements/amsterdam.md §11): carp and bream in the canals and
// the IJ's harbour, swifts and swallows over the water, gulls over the IJ and the Damrak, rooks round the Westerkerk's tower at
// dusk, sparrows on the paving of the Dam and the quays, a grey heron on the quay by the IJ.
import { C, RINGS, IJ_Z, GROUND, WATER, RADIUS, DAMRAK, DAM, VOC, wet, westerkerk } from './layout.js';
import { shopSites, dice } from './dice.js';

/** A point on a lot's front frame (src/styles/dutch/facade.js faceFrame, pure here): u along the front, d outward. */
const frontAt = ({ rect: [x0, z0, x1, z1], front: f }, u, d) => (f === 's' ? [x0 + u, z1 + d] : f === 'n' ? [x1 - u, z0 - d] : f === 'e' ? [x1 + d, z1 - u] : [x0 - d, z0 + u]);
/** The shop's counter bay (shopfront.js shopBay: the middle bay of three, else the one away from the door) and the bay's width. */
const shopBay = (l) => { const w = ['n', 's'].includes(l.front) ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], bays = w >= 6.4 ? 3 : 2, bw = w / bays, bay = bays === 3 ? 1 : dice(l).left ? 1 : 0; return { uw: (bay + 0.5) * bw, bw }; };

const wk = westerkerk();
const fish = [];
// the canals: a few schools along each ring's middle line, as short arcs (areas are axis-aligned boxes round a point on it)
for (const R of RINGS) for (const a of [0.45, 0.95, 1.45, 1.95, 2.45]) {
  const x = C[0] + Math.cos(a) * R, z = C[1] + Math.sin(a) * R;
  if (Math.hypot(x, z) > RADIUS - 80) continue;
  fish.push({ n: 3, size: [0.35, 0.6], palette: 'carp', y: WATER, area: [x - 7, z - 7, x + 7, z + 7], dist: (px, pz) => wet(px, pz) - 1, margin: 1.2, a: [5, 5], ratio: 0.6, speed: 0.3, rise: 0 });
}
for (let i = 0; i < 4; i++) fish.push({ n: 4, size: [0.3, 0.5], palette: 'carp', y: WATER, area: [-150 + i * 80, IJ_Z - 40, -90 + i * 80, IJ_Z - 6], dist: (px, pz) => pz - IJ_Z - 1, margin: 1.5, a: [12, 8], ratio: 0.4, speed: 0.4, rise: 0.2 });

const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, IJ_Z + 20], b: [200, IJ_Z + 20] }, y: [1, 8], speed: 9, half: 12 },
  { kind: 'swallow', n: 3, lane: { a: [21, IJ_Z], b: [21, DAMRAK[3]] }, y: [1, 7], speed: 8, half: 6 },
  { kind: 'swallow', n: 3, loop: { c: [0, -230], a: [40, 20], rot: 0 }, y: [14, 7], speed: 8 },
  { kind: 'crow', n: 7, loop: { c: [wk[0], wk[1]], a: [30, 26], rot: 0.4 }, y: [70, 42], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [-10, -260], a: [60, 18], rot: 0.1 }, y: [30, 16], speed: 9 },
];
const perches = [];
for (const [x, z] of [[-24, -224], [2, -232], [12, -222], [28, -240], [-12, -212], [-40, -248], [20, -214], [36, -226]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.09, range: [2.2, 1.6] });
// the quays of the rings: sparrows hopping on the paving by the stoops
for (const R of RINGS) for (const a of [0.6, 1.5, 2.3]) {
  const r = R + 11.5, x = C[0] + Math.cos(a) * r, z = C[1] + Math.sin(a) * r;
  if (Math.hypot(x, z) > RADIUS - 80) continue;
  perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: a, range: [1.6, 1.2] });
}
for (const R of RINGS) for (const a of [0.9, 1.3, 1.8, 2.2, 2.7]) {          // more sparrows: the quays by the stoops, on the bridges' approaches
  const r = R - 11.5, x = C[0] + Math.cos(a) * r, z = C[1] + Math.sin(a) * r;
  if (Math.hypot(x, z) > RADIUS - 80) continue;
  perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: a + 1, range: [1.8, 1.2] });
}
{ const a = 1.1, r = RINGS[1] + 12.3, x = C[0] + Math.cos(a) * r, z = C[1] + Math.sin(a) * r;          // a heron on a canal's quay
  perches.push({ kind: 'heron', x, z, y: GROUND, rot: a + Math.PI, stay: [80, 240], gone: [40, 150], alert: 10 }); }
flights.push({ kind: 'crow', n: 6, loop: { c: [59, -238], a: [24, 20], rot: 0.3 }, y: [30, 18], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -120], a: [90, 40], rot: 0.2 }, y: [10, 5], speed: 8 });
perches.push({ kind: 'heron', x: 70, z: IJ_Z + 1.4, y: GROUND, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void DAM;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/amsterdam.md §10.4) ──
// Pigeons on the Dam's paving (clear of the doors' lanes on its south side), domestic ducks on the Singel and the Herengracht, cats at the open shop fronts
// (they kept the rats from the goods), dogs at the VOC's warehouse doors on the IJ quay. [inferred: no census of 1670; every kind is in the dossier's own animals or in the paintings of the time.]
const critters = [];
[[-12, -216, 'grey'], [-9, -218, 'white'], [6, -222, 'grey'], [10, -220, 'dark'], [24, -226, 'grey'], [30, -222, 'grey'], [2, -232, 'white'], [-4, -229, 'grey']]
  .forEach(([x, z, v], i) => critters.push({ model: 'pigeon_' + v, at: [x, GROUND, z], rot: 0.8 + i * 1.7, range: [2.4, 1.6], tau: 10, speed: 0.33, stride: 0.1, size: 0.97 + 0.05 * (i % 3) }));
for (const [R, x] of [[RINGS[0], 20], [RINGS[1], 24], [RINGS[2], -20]]) {
  const z = C[1] + Math.sqrt(R * R - (x - C[0]) ** 2);
  critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown'], area: [x - 14, z - 5, x + 14, z + 5], dist: (px, pz) => wet(px, pz) + 0.0, a: [5, 3], ratio: 0.5, margin: 1.5, y: WATER, speed: 0.25, cycle: [18, 24] });
}
shopSites().slice(0, 4).forEach(({ lot: l }, i) => {
  if (i % 2) return;
  const B = shopBay(l), [x, z] = frontAt(l, B.uw - B.bw * 0.3, 1.35);
  critters.push({ model: i % 4 ? 'cat_orange' : 'cat_tabby', at: [x, (l.y ?? GROUND) + 0.02, z], rot: i * 1.3, range: [1.2, 0.9] });
});
for (const v of VOC.filter((q) => q[4]).slice(0, 2)) critters.push({ model: 'dog', at: [(v[0] + v[2]) / 2 + 3, GROUND + 0.02, v[1] - 2.2], rot: Math.PI, range: [6, 2.5] });
export default { fish, flights, perches, critters };
