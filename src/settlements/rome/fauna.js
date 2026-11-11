// Rome under Hadrian — the animals (src/engine/fauna.js; dossier §11): swifts and swallows over the roofs and the
// Via Lata, pigeons (drawn as sparrows) on the paving of the forum and the Pantheon's forecourt, sparrows at the shop
// fronts, crows over the Stadium, egrets on the Tiber's banks. Places derive from layout.js.
import { ground } from './ground.js';
import { RADIUS, FORUM, PANTHEON, STADIUM, VIA_LATA, TIBER, height, rows, riverX, riverEdge, SAEPTA, BATHS } from './layout.js';

const fish = [];
// carp and barbel of the Tiber, loose schools over the middle of the stream (the water's centre line from layout.js)
for (let k = 0; k < 6; k++) fish.push({ n: 3, size: [0.4, 0.7], palette: k % 2 ? 'carp' : 'redcarp', y: TIBER.level - 0.45, area: [riverX(-60) - 14, -60, riverX(120) + 14, 120], dist: (x, z) => Math.max(Math.abs(x - riverX(z)) - (TIBER.w / 2 - 3), Math.hypot(x, z) - (RADIUS - 36)), margin: 3.0, a: [12 + k * 2, 5], ratio: 0.3, speed: 0.35, rise: 0.2 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [VIA_LATA.x, -250], b: [VIA_LATA.x, 250] }, y: [4, 22], speed: 10, a: [26, 10] },
  { kind: 'swallow', n: 5, loop: { c: [0, 90], a: [90, 50], rot: 0.3 }, y: [14, 40], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-110, -112], a: [60, 40], rot: 0 }, y: [12, 30], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [(SAEPTA[0] + SAEPTA[2]) / 2, -70], a: [40, 120], rot: 0 }, y: [10, 30], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [(BATHS[0] + BATHS[2]) / 2, 100], a: [80, 40], rot: 0.2 }, y: [18, 40], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-300, 40], a: [60, 90], rot: 0 }, y: [4, 14], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [(STADIUM[0] + STADIUM[2]) / 2, 0], a: [90, 120], rot: 0.1 }, y: [30, 60], speed: 8 },
];
const perches = [];
const i0 = (e) => Math.floor(Math.abs(e[1])) % 2 === 0;
const spots = [[(FORUM[0] + FORUM[2]) / 2, (FORUM[1] + FORUM[3]) / 2 - 8], [-100, -125], [-70, -100], [-90, -150], [0, -110], [14, -90], [-14, -75], [30, -120], [-30, -130], [VIA_LATA.x - 6, -60], [VIA_LATA.x + 6, 30], [VIA_LATA.x, 110], [-40, -172], [60, -176], [-100, 163], [20, 168]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.02, rot: (x * 7) % 3, range: [1.8, 1.6] });
// egrets on the Tiber's near bank
for (const z of [-60, 70, 160]) { const x = TIBER.x + 28 * Math.sin(z / 120) + TIBER.w / 2 + 2; perches.push({ kind: 'egret', x, z, y: height(x, z), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 }); }
// sparrows at the shop fronts (every third row of the Via Lata and the street before the Pantheon), on the thresholds and the awning poles
rows().forEach((r, i) => {
  if (i % 3) return;
  const [x0, z0, x1, z1] = r.rect, f = r.front, x = f === 'e' ? x1 + 0.8 : f === 'w' ? x0 - 0.8 : (x0 + x1) / 2, z = f === 's' ? z1 + 0.8 : (z0 + z1) / 2;
  perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.05, rot: f === 'e' || f === 'w' ? Math.PI / 2 : 0, range: [1.6, 0.4], alert: 4 });
});
// herons and egrets on the quay's edge and its mooring stones; pigeons about the baths' palaestrae and the Saepta's court
for (const e of riverEdge(1).filter((_, i) => i % 9 === 4)) perches.push({ kind: i0(e) ? 'heron' : 'egret', x: e[0] + 1.5, z: e[1], y: 0.62, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 12 });
for (const [x, z] of [[(BATHS[0] + BATHS[2]) / 2 - 50, 99], [(BATHS[0] + BATHS[2]) / 2 + 50, 99], [(SAEPTA[0] + SAEPTA[2]) / 2, -150], [(SAEPTA[0] + SAEPTA[2]) / 2, -30], [(SAEPTA[0] + SAEPTA[2]) / 2, 50]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: 1.2, range: [2.2, 1.6] });
void PANTHEON;
export default { fish, flights, perches };
