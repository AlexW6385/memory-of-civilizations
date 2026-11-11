// Babylon — the animals (src/engine/fauna.js draws them; docs/settlements/babylon.md §12): carp and barbel of the Euphrates
// along its length, swallows and swifts over the river and the Way, crows over the ziggurat and the palace, sparrows on the
// paving of the Way, the market, the quay and the precinct, a heron and an egret on the reeds of the river's bank.
import { RADIUS, WAY, PRECINCT, MARKET, BRIDGE, QUAY, RIVER, riverX, height } from './layout.js';

/** Negative inside the stream (its water edge is where the bed rises to the level, about 2 m inside the half width). */
const inWater = (x, z) => Math.abs(x - riverX(z)) - (RIVER.w / 2 - 2);
const fish = [];
// the stream: schools in stretches of the river's length, centred on its axis
for (let z = -330; z < 330; z += 60) for (let i = 0; i < 2; i++) {
  const x = riverX(z + 30);
  fish.push({ n: 3, size: [0.35, 0.7], palette: 'carp', y: RIVER.level, area: [x - 10, z, x + 10, z + 60], dist: inWater, margin: 3, a: [6, 26], ratio: 0.3, speed: 0.4, rise: 0.2 });
}
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [riverX(-200), -250], b: [riverX(200), 250] }, y: [1.5, 14], speed: 10, half: 26 },
  { kind: 'swallow', n: 4, lane: { a: [WAY.x, WAY.z0], b: [WAY.x, WAY.z1] }, y: [3, 16], speed: 9, half: 12 },
  { kind: 'swallow', n: 4, loop: { c: [0, 40], a: [90, 90], rot: 0 }, y: [30, 70], speed: 10 },
  { kind: 'crow', n: 6, loop: { c: [0, 40], a: [60, 55], rot: 0.4 }, y: [75, 45], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-135, -220], a: [40, 30], rot: 0.2 }, y: [22, 12], speed: 8 },
];
const perches = [];
const spots = [[WAY.x - 5, -330], [WAY.x + 6, -200], [WAY.x - 7, -140], [WAY.x + 4, -90], [PRECINCT[0] + 20, PRECINCT[1] + 14], [60, -30], [-70, 100], [8, 140], [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], [MARKET[0] + 12, MARKET[1] + 14], [MARKET[2] - 10, MARKET[3] - 12]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const z of [-60, 30, 100, 180]) perches.push({ kind: 'sparrow', x: riverX(z) + QUAY.d0 + 6, z, y: QUAY.y + 0.1, rot: z * 0.3, range: [1.6, 1.4] });
perches.push({ kind: 'heron', x: riverX(160) + QUAY.d0 + 1, z: 160, y: QUAY.y, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: riverX(-90) + QUAY.d0 + 1, z: -90, y: QUAY.y, rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void RADIUS; void BRIDGE;
export default { fish, flights, perches };
