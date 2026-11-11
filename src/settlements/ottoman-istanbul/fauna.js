// Ottoman Istanbul about 1560 — the animals (src/engine/fauna.js draws them; docs/settlements/ottoman-istanbul.md §12): swallows
// and swifts over the roofs and domes (common over the city in summer), crows over the terrace and the cemetery's
// cypresses, sparrows on the paving of the avenues, the outer court and the market lanes. (Gulls and pigeons, so
// characteristic of Istanbul, are not among the engine's birds; the soundscape has the gulls.)
import { PRECINCT, CARSI, TERRACE, TOP, MESCIT, lanes, height } from './layout.js';

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, -30], a: [70, 60], rot: 0.3 }, y: [TOP + 14, TOP + 40], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-120, 60], a: [40, 30], rot: -0.4 }, y: [TOP + 8, TOP + 24], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [115, 20], a: [40, 40], rot: 0.5 }, y: [TOP + 8, TOP + 24], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [20, 70], a: [60, 28], rot: 0.1 }, y: [TOP + 30, TOP + 14], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-190, -60], a: [50, 40], rot: 0.7 }, y: [TOP + 6, TOP + 22], speed: 9 },
];
// swallows and swifts along the lanes of the timber quarter, low, following the visitor
for (const x of [-185, -100, 100, 185]) flights.push({ kind: 'swallow', n: 3, lane: { a: [x, -330], b: [x, 330] }, y: [4, 14], speed: 8 });
const perches = [];
// sparrows hopping on the paving: the avenues, the forecourt, the market's lanes and before its west gate
for (const [x, z] of [[-84, -75], [84, -75], [-84, 30], [84, 30], [-30, PRECINCT[1] - 6], [30, PRECINCT[1] - 8], [-50, PRECINCT[3] + 8], [30, PRECINCT[3] + 9], [-105, CARSI.lanes[0].c], [-100, CARSI.lanes[0].c + 0.6], [30, CARSI.lanes[1].c], [40, CARSI.lanes[1].c - 0.6], [-120, 118], [15, 118]])
  perches.push({ kind: 'sparrow', x, z, y: TOP + 0.04, rot: 0.3 + (x * 7 % 3), range: [1.6, 1.3] });
// on the copings of the outer court's wall (4 m up) and the bedesten's cornice
for (const [x, z, rot] of [[-30, PRECINCT[1] + 0.6, 0], [30, PRECINCT[1] + 0.6, 0], [PRECINCT[0] + 0.6, -40, Math.PI / 2], [PRECINCT[2] - 0.6, 10, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: TOP + 4.02, rot, range: [2.4, 0], alert: 5 });
// sparrows on the cobbles of the lanes nearest the terrace and on the mescit's portico
for (const [x, z] of [[-168, -60], [-168, 70], [168, -60], [168, 70], [-80, -112.5], [80, -112.5], [0, -112.5], [-40, 154], [40, 154], [-148, -76.5], [150, 112]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.04, rot: 0.4 + (x * 7 % 3), range: [1.6, 1.3] });
perches.push({ kind: 'sparrow', x: MESCIT.rect[0] + 3, z: MESCIT.rect[1] + 1.4, y: TOP + 0.14, rot: 0, range: [2, 0.6] });
void TERRACE; void lanes;
export default { fish: [], flights, perches };
