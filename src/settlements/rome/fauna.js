// Rome under Hadrian — the animals (src/engine/fauna.js; dossier §11): swifts and swallows over the roofs and the
// Via Lata, pigeons (drawn as sparrows) on the paving of the forum and the Pantheon's forecourt, sparrows at the shop
// fronts, crows over the Stadium, egrets on the Tiber's banks. Places derive from layout.js.
import { ground } from './ground.js';
import { FORUM, PANTHEON, STADIUM, VIA_LATA, TIBER, height } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [VIA_LATA.x, -250], b: [VIA_LATA.x, 250] }, y: [4, 22], speed: 10, a: [26, 10] },
  { kind: 'swallow', n: 5, loop: { c: [0, 90], a: [90, 50], rot: 0.3 }, y: [14, 40], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-110, -112], a: [60, 40], rot: 0 }, y: [12, 30], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [(STADIUM[0] + STADIUM[2]) / 2, 0], a: [90, 120], rot: 0.1 }, y: [30, 60], speed: 8 },
];
const perches = [];
const spots = [[(FORUM[0] + FORUM[2]) / 2, (FORUM[1] + FORUM[3]) / 2 - 8], [-100, -125], [-70, -100], [-90, -150], [0, -110], [14, -90], [-14, -75], [30, -120], [-30, -130], [VIA_LATA.x - 6, -60], [VIA_LATA.x + 6, 30], [VIA_LATA.x, 110], [-40, -172], [60, -176], [-100, 163], [20, 168]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.02, rot: (x * 7) % 3, range: [1.8, 1.6] });
// egrets on the Tiber's near bank
for (const z of [-60, 70, 160]) { const x = TIBER.x + 28 * Math.sin(z / 120) + TIBER.w / 2 + 2; perches.push({ kind: 'egret', x, z, y: height(x, z), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 }); }
void PANTHEON;
export default { fish, flights, perches };
