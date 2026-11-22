// Babylon — the animals (src/engine/fauna.js draws them; docs/settlements/babylon.md §12): carp and barbel of the Euphrates
// along its length, swallows and swifts over the river and the Way, crows over the ziggurat and the palace, sparrows on the
// paving of the Way, the market, the quay and the precinct, a heron and an egret on the reeds of the river's bank.
import { RADIUS, WAY, PRECINCT, MARKET, BRIDGE, QUAY, RIVER, ESAGILA, riverX, height, lots } from './layout.js';
import { opened, doorPoint } from './openwalk.js';

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
// the lanes of the blocks: sparrows on the paving at the crossings, swallows over the roofs
for (const [x, z] of [[-26, -110], [-26, -50], [-53, -112], [35, -150], [35, -86], [97, -150], [97, -22], [-115, -22], [-115, -150], [160, -90], [35, 270], [-26, 240], [97, 200], [-115, 100]]) perches.push({ kind: 'sparrow', x: x + 0.6, z: z + 0.4, y: 0.1, rot: (x * 5 + z) % 3, range: [1.6, 1.4] });
flights.push({ kind: 'swallow', n: 5, loop: { c: [60, -100], a: [90, 70], rot: 0.2 }, y: [9, 20], speed: 9 }, { kind: 'swallow', n: 4, loop: { c: [-120, 120], a: [70, 60], rot: -0.3 }, y: [9, 20], speed: 9 }, { kind: 'crow', n: 4, loop: { c: [120, 160], a: [60, 50], rot: 0.5 }, y: [20, 35], speed: 8 });
for (const z of [-60, 30, 100, 180]) perches.push({ kind: 'sparrow', x: riverX(z) + QUAY.d0 + 6, z, y: QUAY.y + 0.1, rot: z * 0.3, range: [1.6, 1.4] });
perches.push({ kind: 'heron', x: riverX(160) + QUAY.d0 + 1, z: 160, y: QUAY.y, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: riverX(-90) + QUAY.d0 + 1, z: -90, y: QUAY.y, rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void RADIUS; void BRIDGE;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §21) ──
// Dogs at the doors of the opened houses and shops nearest the arrival, hens and a cock in the yard of two court houses of the gate quarter, geese by the quay and on the river's
// edge, a raft of ducks on the stream, pigeons on the paving of the market and Esagila's court, a kingfisher on the rim of a moored round boat, a crane on the west bank. Not built: cats (not
// attested enough for the date to put in), sheep, camels and donkeys (no critter model: the street life draws them).
const critters = [];
const O = opened().filter((l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - WAY.x, (l.rect[1] + l.rect[3]) / 2 + 370) < 95);
{
  let dogs = 0, yardsDone = 0;
  for (const l of O) {
    const d = doorPoint(l), n = Math.hypot(d.out[0], d.out[1]), sd = l.seed % 2 ? 1 : -1;
    if (dogs < 5 && l.seed % 3 !== 1) {
      const x = d.p[0] + d.out[0] / n * 1.1 + sd * d.side[0] * 2.9, z = d.p[1] + d.out[1] / n * 1.1 + sd * d.side[1] * 2.9;
      critters.push({ model: 'dog', at: [x, 0.05, z], rot: Math.atan2(d.out[0], d.out[1]) + 0.4 * sd, range: [9, 3.5] }); dogs++;
    } else if (yardsDone < 2 && l.open && !l.shop) {
      // hens scratching in the lane before an open house, a cock among them
      const x = d.p[0] + d.out[0] / n * 2.4 - d.side[0] * 2.6, z = d.p[1] + d.out[1] / n * 2.4 - d.side[1] * 2.6;
      (yardsDone === 0 ? ['rooster', 'hen_brown', 'hen_white'] : ['hen_brown', 'hen_white']).forEach((model, i) => critters.push({ model, at: [x + 0.5 * i * d.side[0], 0.05, z + 0.5 * i * d.side[1] + 0.3 * (i % 2)], rot: i * 2.1 + yardsDone, range: [1.6, 1.2], size: i ? 0.96 : 1 }));
      yardsDone++;
    }
  }
}
// geese (domestic since the third millennium) by the quay's moored boats and at the river's edge
[[-52, 6.5, 0.6], [-50, 7.4, 1.9], [104, 8, 3.1], [106, 8.8, 4.4], [-48, 7.2, 2.6]].forEach(([z, o, rot], i) => critters.push({ model: i % 2 ? 'goose_grey' : 'goose_white', at: [riverX(z) + QUAY.d0 + o, QUAY.y + 0.02, z], rot, range: [3, 1.8], size: 1 }));
// a raft of ducks on the stream below the bridge (the river's centre is its axis; the water is where `inRiver` says)
const wet = (x, z) => Math.abs(x - riverX(z)) - (RIVER.w / 2 - 2);
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown', 'duck_brown', 'duck_white'], raft: true, area: [riverX(-80) - 14, -92, riverX(-80) + 14, -68], dist: wet, a: [12, 2.2], ratio: 0.2, margin: 2, y: RIVER.level, speed: 0.18, cycle: [20, 26] });
// pigeons on the market's paving and in Esagila's court
for (const [x, z] of [[MARKET[0] + 6, MARKET[1] + 8], [MARKET[0] + 6.8, MARKET[1] + 10], [MARKET[0] + 20, MARKET[3] - 6], [ESAGILA[0] + 41, 205], [ESAGILA[0] + 42, 207.5], [ESAGILA[0] + 50, 228]]) critters.push({ model: 'pigeon_grey', at: [x, 0.07, z], rot: (x * 3) % 6, range: [1.6, 1.2] });
// a kingfisher on the rim of the moored round boat at z −40, over the water, and a crane on the west bank beside a shaduf (the winter visitor of the river's marshes)
critters.push({ model: 'kingfisher', at: [riverX(-40) + 23 - 1.45, RIVER.level + 0.5, -40], rot: -Math.PI / 2, water: [riverX(-40) + 23 - 3.4, -40, RIVER.level], cycle: 34 });
critters.push({ model: 'crane', at: [riverX(-70) - 44, 0.02, -70], rot: Math.PI / 2, range: [7.0, 1.6], tau: 50, speed: 0.4 });
void lots; void height;
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('babylon'));
export default { fish, flights, perches, critters };
