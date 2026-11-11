// Qin Xianyang — the animals (src/engine/fauna.js draws them; docs/settlements/qin-xianyang.md §7): swallows over the market and the road,
// crows (rooks) over the palace's roofs and the pit's mound, sparrows on the paving of the forecourt, the market and the walls,
// a pair of kites high over the plain. No water, so no fish.
import { height, TERRACE, MARKET, FORECOURT, PIT, ROOF, WS_Z } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-300, 10], b: [300, 10] }, y: [1, 8], speed: 10, half: 20 },
  { kind: 'swallow', n: 4, loop: { c: [-30, 58], a: [60, 28], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [-219, -100], a: [50, 34], rot: 0.2 }, y: [18, 40], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [20, -150], a: [90, 40], rot: 0.1 }, y: [14, 34], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [60, -230], a: [70, 30], rot: 0.5 }, y: [20, 45], speed: 8 },
];
const perches = [];
const spots = [[-219, -40], [-200, -34], [-240, -30], [-170, -36], [-60, 34], [-10, 46], [-28, 80], [20, 70], [-90, 40], [100, 10], [60, -14], [-130, 14], [170, -100], [-60, WS_Z + 6], [40, WS_Z - 8], [110, WS_Z + 4], [-120, 140], [60, 160], [-60, 200], [180, 130], [-200, 100]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
// on the terrace's coping and the pit's mound
for (const [x, z] of [[-250, -126], [-190, -126], [-230, -74.4]]) perches.push({ kind: 'sparrow', x, z, y: TERRACE.h + 1.1, rot: 0, range: [1.2, 0], alert: 5 });
for (const [x, z] of [[-40, -120], [10, -130], [30, -110]]) perches.push({ kind: 'sparrow', x, z, y: ROOF.mound + 0.1, rot: 1, range: [1.4, 1.2] });
void MARKET; void FORECOURT; void PIT;
export default { fish, flights, perches };
