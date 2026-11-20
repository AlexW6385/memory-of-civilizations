// Vienna in spring 1902 — the animals (src/engine/fauna.js; docs/settlements/vienna.md §9): swallows and swifts over the Ring and the
// Wien, crows round the Karlskirche's dome and the Opera's roof, sparrows and pigeons on the paving and the Karlsplatz's lawns, a
// grey heron on the Wien's wall (carp lie in the channel).
import { faceFrame } from '../../styles/dutch/facade.js';
import { WIEN, KARLSKIRCHE, OPERA, GROUND, WING, yards, lots, passageRect, inRect } from './layout.js';

const inWater = (x, z) => (x > WIEN.x0 + 3 && x < WIEN.x1 - 3 ? Math.max(WIEN.z0 - z, z - WIEN.z1) : 20);
const fish = [];
for (let i = 0; i < 4; i++) fish.push({ n: 3, size: [0.25, 0.4], palette: 'carp', y: WIEN.water, area: [-240 + i * 120, WIEN.z0 + 1, -150 + i * 120, WIEN.z1 - 1], dist: inWater, margin: 1.2, a: [12, 3], ratio: 0.3, speed: 0.4, rise: 0.2 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-250, -230], b: [250, -230] }, y: [3, 20], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, lane: { a: [-260, 70], b: [260, 70] }, y: [2, 12], speed: 8, half: 10 },
  { kind: 'swallow', n: 4, lane: { a: [60, -140], b: [60, 200] }, y: [6, 20], speed: 8, half: 8 },
  { kind: 'crow', n: 4, loop: { c: [KARLSKIRCHE[0] - 20, KARLSKIRCHE[1]], a: [28, 26], rot: 0.3 }, y: [75, 45], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [(OPERA[0] + OPERA[2]) / 2, (OPERA[1] + OPERA[3]) / 2], a: [60, 30], rot: 0.1 }, y: [45, 28], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-30, -57], [30, -57], [-10, -37], [10, 6], [-20, 8], [90, -12], [140, -2], [170, 14], [-80, 52], [-160, 52], [0, -212], [60, -244]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.07, range: [1.5, 1.3] });
for (const y of yards().slice(0, 9)) perches.push({ kind: 'sparrow', x: (y.rect[0] + y.rect[2]) / 2 + 2, z: (y.rect[1] + y.rect[3]) / 2 + 1.5, y: GROUND + 0.1, rot: y.rect[0] * 0.05, range: [2, 1.6] });
flights.push({ kind: 'swallow', n: 3, lane: { a: [-200, -100], b: [200, -100] }, y: [8, 22], speed: 9, half: 12 });
perches.push({ kind: 'heron', x: -120, z: WIEN.z0 - 1.3, y: GROUND + 0.2, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §15.3) ──
const critters = [];
const PIG = ['pigeon_grey', 'pigeon_grey', 'pigeon_white', 'pigeon_dark'];
// pigeons, in knots of three or four where people sit, feed them and drop crusts: the Karlsplatz's benches, the garden behind the Secession, the court's flagstones, the Ring's promenade and the Naschmarkt's aisle
const knots = [[86.4, 0.04, -5.6], [128, 0.04, -5.4], [-12, 0.0, 5.4], [11, 0.04, 0.4], [-24, 0.03, -46], [15, 0.03, -47.5], [8, 0.11, -209], [-144, 0.11, 55.2], [-104, 0.11, 55.0]];
knots.forEach(([x, y, z], k) => { for (let i = 0; i < (k % 3 === 1 ? 4 : 3); i++) critters.push({ model: PIG[(k + i) % PIG.length], at: [x + 0.9 * Math.cos(k + i * 2.1), y, z + 0.8 * Math.sin(k * 1.7 + i * 2.1)], rot: k * 1.3 + i * 2.2, range: [2.6, 1.6], tau: 11 + i, size: 0.97 + 0.02 * i }); });
// the Hausmeister's dog, lying in the passage of the Durchhaus nearest the arrival, a little off the middle of the way, three metres in from the street
const passages = lots().filter((l) => l.passage !== undefined && l.passage !== null).map((l) => ({ l, d: Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 + 66) })).sort((a, b) => a.d - b.d);
for (const { l } of passages.slice(0, 2)) { const F = faceFrame(l.rect, l.front), u = F.w / 2 + 1.15 * (l.seed % 2 ? 1 : -1), [x, z] = F.at(u, -3.2); critters.push({ model: 'dog', at: [x, 0.05, z], rot: Math.atan2(F.at(u, 1)[0] - x, F.at(u, 1)[1] - z), range: [9, 3.5] }); }
// a house cat on the bench of a Hof (hof.js: the seat at 0.78 of the width, 0.1 of the depth past the middle, 0.48 m up), in the sun
yards().filter((q) => q.entry).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2, (a.rect[1] + a.rect[3]) / 2 + 66) - Math.hypot((b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2 + 66)).slice(0, 2).forEach((y, i) => { const [x0, z0, x1, z1] = y.rect, W = x1 - x0, D = z1 - z0; critters.push({ model: i ? 'cat_orange' : 'cat_tabby', at: [x1 - W * 0.22, 0.5, (z0 + z1) / 2 + D * 0.1], rot: 0.5 + i, range: [7, 2.5] }); });
// a canary in its cage on the balcony of an opened first floor (mietshaus.js: the balcony's bay; the slab's top 0.1 m over the floor, the rail 1.19), the cage hung at the rail
for (const l of lots().filter((q) => q.up && q.lod === 0).slice(0, 3)) {
  const F = faceFrame(l.rect, l.front), bays = Math.max(2, Math.round(F.w / 3.3)), bw = F.w / bays, bb = l.up.left ? 1 + Math.floor((bays - 1) / 2) : Math.floor((bays - 1) / 2), u = (bb + 0.5) * bw + 0.55;
  const [x, z] = F.at(u, 0.38), [ox, oz] = F.at(u, 1.38); critters.push({ model: 'cagebird', at: [x, 4.5 + 0.78, z], rot: Math.atan2(ox - x, oz - z) });
}
void WING; void inRect; void passageRect;
export default { fish, flights, perches, critters };
