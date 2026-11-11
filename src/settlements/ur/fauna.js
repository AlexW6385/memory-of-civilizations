// Ur — the animals (src/engine/fauna.js draws them; docs/settlements/ur.md §10): carp in the harbour basin, swallows
// over the quay and the temenos, crows (kites) over the ziggurat, sparrows on the market square and the quay, a little
// egret on the harbour's reeds.
import { HARBOUR, MARKET, COURT } from './layout.js';
import { ground } from './ground.js';

const [hx0, hz0, hx1, hz1] = HARBOUR.rect;
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: HARBOUR.water, area: [hx0 + 14, hz0 + 14, hx1 - 8, hz1 - 14], dist: (x, z) => Math.min(x - hx0, hx1 - x, z - hz0, hz1 - z), margin: 5, a: [14, 9], ratio: 0.4, speed: 0.35, rise: 0.1, tries: 1 });
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [(hx0 + hx1) / 2 + 20, (hz0 + hz1) / 2], a: [50, 90], rot: 0 }, y: [1, 9], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -30], a: [60, 50], rot: 0.3 }, y: [8, 30], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [0, 0], a: [60, 45], rot: 0.5 }, y: [38, 55], speed: 8 },
];
const perches = [];
const spots = [[MARKET[0] + 6, MARKET[3] + 2], [MARKET[2] - 6, MARKET[3] + 2], [0, MARKET[1] - 12], [0, -150], [(COURT[0] + COURT[2]) / 2 + 12, -110], [hx1 + 3, -60], [hx1 + 3, 0], [hx1 + 8, 30]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
perches.push({ kind: 'egret', x: hx0 + 8, z: hz0 + 60, y: HARBOUR.water, rot: 0, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
