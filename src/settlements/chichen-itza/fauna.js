// Chichén Itzá — the animals (src/engine/fauna.js draws them; docs/settlements/chichen-itza.md §14): swallows over the plaza and the
// Sacred Cenote (the swallows of the cenote are a famous sight), vultures-as-crows high over the temples, sparrows (stand-ins for the
// small seed-eaters) on the plaza's plaster and the sacbe, a heron-like egret at the cenote's rim. No fish: the cenote lies 20 m down.
import { PLAZA, CENOTE } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, CENOTE.c[1]], a: [CENOTE.r + 6, CENOTE.r + 4], rot: 0 }, y: [-14, 12], speed: 10 },
  { kind: 'swallow', n: 5, loop: { c: [20, 10], a: [110, 70], rot: 0.15 }, y: [6, 34], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-115, -40], a: [28, 80], rot: 0 }, y: [4, 22], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [10, -30], a: [150, 110], rot: 0.5 }, y: [55, 95], speed: 8 },
];
const perches = [];
const spots = [[-12, 45], [14, 52], [40, 60], [-40, 40], [70, 80], [100, 90], [-80, 60], [-20, -30], [30, -30], [-20, 18], [22, 18], [0, -150], [2, -190], [-2, -225], [60, 20], [-100, 100], [130, 20], [-60, -100], [60, -100], [150, 70]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// a little egret on the rim at the cenote's south edge, facing the water (north)
const ez = CENOTE.c[1] + CENOTE.r + 1.2;
perches.push({ kind: 'egret', x: 11, z: ez, y: ground.height(11, ez), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void PLAZA;
export default { fish, flights, perches };
