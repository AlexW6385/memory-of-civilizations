// Abu Simbel — the animals (docs/settlements/abu-simbel.md §9): black kites over the cliff, swallows over the river, the terrace and the lanes, sparrows in the
// lanes and on the market's roofs, egrets and a heron at the water's edge and among the papyrus, tilapia and Nile perch in the shallows by the quay.
import { QUAY, TERRACE, MARKET, lanes } from './layout.js';
import { ground } from './ground.js';

const nile = (x) => 54 - x;
/** Fish: schools of tilapia (the dark carp's palette) in the shallows off the quay and the reed beds, a few larger perch in the deep. */
const fish = [];
for (const [a, y0, y1] of [[1, -34, -14], [2, 14, 34], [3, -10, 10]]) fish.push({ n: 4, size: [0.22, 0.38], palette: 'carp', y: ground.waterLevel(60), area: [66, y0, 92, y1], dist: nile, margin: 4, a: [14, 7], ratio: 0.5, speed: 0.4, rise: 0.35, tries: 1 + a * 0 });
fish.push({ n: 2, size: [0.7, 1.1], palette: 'carp', y: ground.waterLevel(60), area: [75, -20, 120, 20], dist: nile, margin: 6, a: [22, 10], ratio: 0.4, speed: 0.5, rise: 0.1 });
const flights = [
  { kind: 'crow', n: 4, loop: { c: [-30, -40], a: [120, 90], rot: 0.3 }, y: [40, 80], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [-60, 80], a: [60, 50], rot: 0.9 }, y: [30, 60], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [40, 0], a: [60, 50], rot: 0.1 }, y: [-5, 6], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-10, 70], a: [30, 24], rot: 0.4 }, y: [2, 8], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-12, -60], a: [24, 16], rot: 0 }, y: [2, 8], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-14, 100], a: [26, 28], rot: 1.2 }, y: [2, 8], speed: 9 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
// sparrows hopping in the lanes (a few to each) and the market street, and on the terrace
for (const l of lanes()) {
  const [x0, z0, x1, z1] = l.r, horiz = x1 - x0 > z1 - z0, len = horiz ? x1 - x0 : z1 - z0;
  for (let t = 5; t < len - 3; t += 24) sp(horiz ? x0 + t : (x0 + x1) / 2, horiz ? (z0 + z1) / 2 : z0 + t);
}
for (let x = MARKET[0] + 6; x < MARKET[2]; x += 11) sp(x, (MARKET[1] + MARKET[3]) / 2);
for (const z of [-14, 4, 15]) sp(TERRACE[0] + 12, z);
perches.push({ kind: 'egret', x: QUAY[2] - 0.6, z: QUAY[3] - 2, y: -6.3, rot: 0, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: 57, z: -26, y: ground.waterLevel(60) + 0.05, rot: 1.0, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'heron', x: 55, z: 27, y: ground.waterLevel(60) + 0.05, rot: 1.6, stay: [80, 240], gone: [60, 180], alert: 12 });
export default { fish, flights, perches };
