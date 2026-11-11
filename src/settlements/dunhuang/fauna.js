// Dunhuang — the animals (src/engine/fauna.js; docs/settlements/dunhuang.md): swifts and swallows over the stream and
// the street, ravens high over the cliff, sparrows on the apron and the roofs, a heron-like egret standing in for the
// birds of the Crescent Spring's reeds [inferred], small fish in the Daquan's stream.
import { RIVER, riverX, XF, ZEND, SPRING } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (let z = -90; z <= 90; z += 45) fish.push({ n: 3, size: [0.1, 0.18], palette: 'carp', y: RIVER.water, dist: (x, zz) => Math.abs(x - riverX(zz)) - RIVER.w / 2, margin: 0.5, k: 1, rot: 0, area: [riverX(z) - 0.4, z - 12, riverX(z) + 0.4, z + 12], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-60, 0], b: [150, 0] }, y: [1, 5], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-45, 0], a: [60, 30], rot: 0 }, y: [2, 12], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [XF - 8, 0], a: [18, 110], rot: 0 }, y: [34, 58], speed: 8 },
];
flights[0].a = [26, 3];
const perches = [];
for (const [x, z] of [[XF + 5, -50], [XF + 5.5, -20], [XF + 5.2, 20], [XF + 5, 50], [XF + 6, 90], [-34, 5], [-34, -5], [60, -6], [60, 6], [90, 5], [20, 5.5]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// the egret in the shallows of the Crescent Spring, facing the water
{ const x = SPRING.c[0] - 3, z = SPRING.c[1] + 3; perches.push({ kind: 'egret', x, z, y: -0.65, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
void ZEND;
export default { fish, flights, perches };
