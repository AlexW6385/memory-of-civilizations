// Modern Sydney, 1973 — the animals (src/engine/fauna.js draws them; docs/settlements/sydney.md §11): schools of dark fish in the
// cove and Farm Cove, welcome swallows low over the water, Australian ravens (crows) over the Garden and the Rocks at dusk, white
// birds (the silver gull's stand-in: the egret) on the quay's bollards and the wharves' rails, and pigeons (the sparrow's
// stand-in) on the promenade, the Opera House's stair and the Garden's paths.
import { LEVEL, QUAY, OPERA, GARDEN, shore, height } from './layout.js';

const dist = (x, z) => -shore(x, z);
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 5, size: [0.3, 0.5], palette: 'carp', y: LEVEL, area: [-38, -92, 34, -66], dist, margin: 4, a: [12, 6], ratio: 0.5, speed: 0.5, rise: 0.3, tries: 1 });
for (let i = 0; i < 4; i++) fish.push({ n: 4, size: [0.3, 0.55], palette: 'carp', y: LEVEL, area: [176, -92, 294, -48], dist, margin: 5, a: [14, 8], ratio: 0.5, speed: 0.5, rise: 0.3, tries: 1 });

const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, -50], a: [30, 20], rot: 0, dist, margin: 3 }, y: [0.8, 3], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [235, -70], a: [36, 18], rot: 0.2, dist, margin: 3 }, y: [0.8, 3], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [260, 60], a: [50, 36], rot: 0.5 }, y: [26, 12], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-190, -20], a: [40, 28], rot: 1.0 }, y: [24, 12], speed: 9 },
];
const perches = [];
let sd = 1973; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
// gulls on the promenade's rail and the wharves' bollards (the wharves' decks at y 1.2, the bollards 0.5 m up)
for (const x of [-36, -18, 0, 18]) for (const z of [-30, -12]) perches.push({ kind: 'egret', x: x + (rand() - 0.5) * 6, z, y: 1.2, rot: rand() * 6, stay: [60, 220], gone: [30, 120], alert: 8 });
for (let x = -40; x < 40; x += 30) perches.push({ kind: 'egret', x, z: -6.5, y: height(x, -6.5), rot: rand() * 6, stay: [60, 200], gone: [30, 120], alert: 8 });
// pigeons: the promenade, the stair and forecourt, the Garden's lawns, the streets' corners
const put = (x, z, range = [1.8, 1.4]) => perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: rand() * 3, range });
for (let i = 0; i < 10; i++) put(QUAY[0] + rand() * (QUAY[2] - QUAY[0]), -3.5 + rand() * 2.5);
for (let i = 0; i < 8; i++) put(66 + rand() * 68, OPERA.rect[3] + 6 + rand() * 14, [2, 1.6]);
for (let i = 0; i < 12; i++) put(GARDEN[0] + 20 + rand() * 220, GARDEN[1] + 30 + rand() * 120, [2.6, 2.0]);
export default { fish, flights, perches };
