// Djenné — the animals (src/engine/fauna.js; docs/settlements/djenne.md §14): fish in the channel of the Bani, swallows
// over the lanes and the water, black kites circling over the market and the town (the scavengers of every Sahel
// town), egrets and herons standing in the shallows and on the bank, sparrows on the market's ground and the lanes.
import { RADIUS, ISLAND, LEVEL, MARKET, shore } from './layout.js';

const ringR = (a) => ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);
/** Negative in the channel's water (distance from the edge of the water, shore 8–38), positive outside. */
const channelDist = (x, z) => { const s = shore(x, z); return Math.min(s - 8, 38 - s) * -1; };
const fish = [];
// schools of small fish and a few big (Nile perch, catfish) in the channel, round its length
for (let k = 0; k < 10; k++) {
  const a = (k + 0.5) / 10 * Math.PI * 2, r = ringR(a) + 23, x = Math.cos(a) * r, z = Math.sin(a) * r;
  fish.push({ n: 3, size: k % 3 ? [0.2, 0.34] : [0.45, 0.7], palette: 'carp', y: LEVEL.water, dist: channelDist, margin: 1.5, k: 1, rot: a + Math.PI / 2, area: [x - 8, z - 8, x + 8, z + 8], a: [8, 5], ratio: 0.3, minA: 1.5, speed: 0.3, rise: 0.15 });
}
const flights = [
  { kind: 'swallow', n: 3, lane: { a: [-200, -6.25], b: [200, -6.25] }, y: [2, 9], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [20, -200], b: [20, 200] }, y: [2, 9], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [0, ringR(Math.PI / 2) + 22], a: [40, 8], rot: 0 }, y: [0.2, 3], speed: 8 },
  // black kites over the market and the town
  { kind: 'crow', n: 5, loop: { c: [80, 0], a: [70, 50], rot: 0.3 }, y: [38, 20], speed: 7 },
  { kind: 'crow', n: 4, loop: { c: [-60, 40], a: [80, 60], rot: 1.1 }, y: [45, 25], speed: 7 },
];
for (const f of flights.slice(0, 2)) f.a = [30, 4];
const perches = [];
// egrets and herons on the bank and in the shallows round the island
for (const [a, kind] of [[0.4, 'egret'], [1.1, 'heron'], [2.0, 'egret'], [2.9, 'egret'], [3.8, 'heron'], [4.6, 'egret'], [5.4, 'egret'], [6.0, 'heron']]) {
  const r = ringR(a) + 9; perches.push({ kind, x: Math.cos(a) * r, z: Math.sin(a) * r, y: LEVEL.water + 0.1, rot: a, range: [0.5, 0.3], alert: 12 });
}
// sparrows on the market's ground and the lanes
for (const [x, z] of [[60, -20], [75, 10], [90, -30], [105, 25], [50, 30], [-6.25, 60], [-6.25, -90], [20.5, 120], [-100, -6.5], [100, 19.5], [-30, 150], [40, -150]])
  perches.push({ kind: 'sparrow', x, z, y: 0.04, rot: 0.3 + (x * 7 % 3), range: [1.3, 1.2] });
void RADIUS; void MARKET;
export default { fish, flights, perches };
