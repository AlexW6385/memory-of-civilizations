// The Hakka tulou — the animals (src/engine/fauna.js draws them; docs/settlements/hakka-tulou.md §5): swallows over the
// paddy and the stream, egrets standing in the stream and over the paddy, crows over the hill, sparrows on the
// court's cobbles and the roof ridge, small carp in the stream [inferred: a hill stream of the valley].
import { STREAM, streamZ, T, RADIUS } from './layout.js';
import { ground } from './ground.js';

const dist = (x, z) => Math.abs(z - streamZ(x)) - STREAM.w / 2;
const fish = [];
for (let x = -90; x <= 90; x += 30) fish.push({ n: 3, size: [0.14, 0.26], palette: 'carp', y: STREAM.water, dist, margin: 0.5, k: 1, rot: 0, area: [x - 14, streamZ(x) - 0.4, x + 14, streamZ(x) + 0.4], a: [10, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-200, 0], b: [200, 0] }, y: [0.5, 3.5], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [0, 100], a: [90, 26], rot: 0 }, y: [1, 6], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, 0], a: [30, 30], rot: 0 }, y: [14, 26], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-20, -110], a: [90, 40], rot: 0.3 }, y: [30, 55], speed: 8 },
];
flights[0].a = [26, 3];
const perches = [];
// sparrows in the court and the lane; on the stone curbs of the wells
for (const [x, z] of [[-14, 8], [10, 12], [-8, -9], [17, 3], [-22, 14], [22, -12], [-3, 21], [0, 36], [-10, 44], [9, 53]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// egrets by the stream, facing the water
for (const x of [-40, 25, 70]) { const z = streamZ(x) - 3.3; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void T; void RADIUS;
export default { fish, flights, perches };
