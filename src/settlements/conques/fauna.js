// Conques about 1120 — the animals (src/engine/fauna.js draws them): swallows and house martins over the roofs and
// the lanes, crows and choughs about the church's roofs and the gorge at twilight, house sparrows on the cobbles of the
// lanes and the abbey's square, a grey heron and a little egret on the Dourdou's bank, dark trout in the river.
import { ABBEY, RIVER, RADIUS, lanes, laneZ, inRiver } from './layout.js';
import { ground } from './ground.js';

const rz = (x) => RIVER.z + 14 * Math.sin(x / 90);
const riverDist = (x, z) => Math.max(0, RIVER.w / 2 - 2 - Math.abs(z - rz(x)));
const fish = [];
for (let i = 0; i < 4; i++) fish.push({ n: 2, size: [0.3, 0.45], palette: 'carp', y: RIVER.level - 0.5, area: [-120 + i * 55, rz(-120 + i * 55) - 3, -80 + i * 55, rz(-80 + i * 55) + 3], dist: riverDist, margin: 1.2, a: [14, 2.4], ratio: 0.15, minA: 1.5, speed: 0.4, rise: 0 });

const flights = [
  { kind: 'swallow', n: 4, loop: { c: [ABBEY.origin[0] + 10, 0], a: [60, 40], rot: 0.2 }, y: [14, 6], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-70, 60], a: [40, 24], rot: 0.5 }, y: [9, 4], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [ABBEY.origin[0] + 36, 0], a: [34, 26], rot: 0.5 }, y: [32, 14], speed: 8 },
];
const perches = [];
// house sparrows on the cobbles of the lanes and the square
{
  let k = 0;
  for (const l of lanes()) for (let x = l.x0 + 10; x < l.x1 - 6; x += 38) {
    const px = x + (k % 4) * 3, pz = l.z + ((k * 7) % 5 - 2) * 0.25;
    if (Math.hypot(px, pz) > RADIUS - 150) { k++; continue; }
    perches.push({ kind: 'sparrow', x: px, z: pz, y: ground.height(px, pz), rot: 0.4 + (k % 7) * 0.8, range: [1.4, 1.1] }); k++;
  }
}
for (const [x, z] of [[-36, -10], [-33, 20], [-40, 34], [-25, 40]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: x % 3, range: [1.8, 1.5] });
// the grey heron and a little egret on the Dourdou's bank
for (const [x, kind] of [[-30, 'heron'], [40, 'egret']]) {
  const z = rz(x) - RIVER.w / 2 - 1.2;
  if (!inRiver(x, z)) perches.push({ kind, x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
}
void laneZ;
export default { fish, flights, perches };
