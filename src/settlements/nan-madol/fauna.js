// Nan Madol — the animals (src/engine/fauna.js draws them; docs/settlements/nan-madol.md §7, §9): terns and swiftlets over the canals and
// the reef (swallow and crow stand-ins), small birds on the islets' ground, an egret on the mud flat of the shore, small fish in the canals
// [inferred: the eels that oral history says the canals were cut for, and the lagoon's fish].
import { WATER, CANALS } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (const c of CANALS.slice(0, 6)) {
  const horiz = c[2] - c[0] > c[3] - c[1], len = horiz ? c[2] - c[0] : c[3] - c[1];
  if (Math.min(c[2] - c[0], c[3] - c[1]) < 6) continue;
  for (let t = 14; t < len - 14; t += 36) {
    const cx = horiz ? c[0] + t : (c[0] + c[2]) / 2, cz = horiz ? (c[1] + c[3]) / 2 : c[1] + t;
    fish.push({ n: 3, size: [0.14, 0.3], palette: 'carp', y: WATER - 0.4, dist: () => 3, margin: 0.5, k: 1, rot: 0, area: [cx - 6, cz - 6, cx + 6, cz + 6], a: [5, 5], ratio: 1, minA: 1.2, speed: 0.4, rise: 0.1 });
  }
}
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 30], a: [90, 60], rot: 0 }, y: [1.5, 9], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [60, -40], a: [60, 40], rot: 0.5 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [0, 0], a: [140, 100], rot: 0.3 }, y: [25, 50], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-30, 30], [10, 40], [-60, -40], [-65, 30], [50, 30], [55, -90], [-20, -100], [-60, 90]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
{ const x = -150, z = -75; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
export default { fish, flights, perches };
