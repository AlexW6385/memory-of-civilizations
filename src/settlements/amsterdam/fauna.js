// Amsterdam about 1670 — the animals (src/engine/fauna.js; docs/settlements/amsterdam.md §11): carp and bream in the canals and
// the IJ's harbour, swifts and swallows over the water, gulls over the IJ and the Damrak, rooks round the Westerkerk's tower at
// dusk, sparrows on the paving of the Dam and the quays, a grey heron on the quay by the IJ.
import { C, RINGS, IJ_Z, GROUND, WATER, RADIUS, DAMRAK, DAM, wet, westerkerk } from './layout.js';

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
export default { fish, flights, perches };
