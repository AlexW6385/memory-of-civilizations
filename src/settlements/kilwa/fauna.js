// Kilwa about 1330 — the animals (src/engine/fauna.js draws them; docs/settlements/kilwa.md §17): pied crows (drawn as crows)
// wheeling over the town and the beach, swallows over the harbour and the streets, sparrows on the market street, reef egrets
// at the tide line by the drawn-up boats. No fish are drawn.
import { RADIUS, SOKO, MOSQUE_STREET, LANES, height } from './layout.js';
import { walkRoutes } from './walkroutes.js';

const shoreAt = (x) => -120 - 15 * Math.sin(x / 60);
const flights = [
  { kind: 'crow', n: 6, loop: { c: [-60, -70], a: [90, 60], rot: 0.2 }, y: [20, 45], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-150, -105], a: [50, 25], rot: 0 }, y: [9, 20], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [-40, -150], a: [90, 25], rot: 0 }, y: [1.2, 7], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [-200, -84], b: [100, -84] }, y: [2.5, 8], speed: 9 },
];
flights[3].a = [30, 5];
const perches = [];
for (let x = -170; x < 60; x += 21) { const z = SOKO[1] + 1.2 + ((x * 7) % 3), q = (x * 13) % 5; perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: q, range: [1.4, 1.3] }); }
for (const r of LANES) { const x = (r[0] + r[2]) / 2, z = -60; perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: 1.2, range: [1.2, 1.2] }); }
perches.push({ kind: 'sparrow', x: -15, z: MOSQUE_STREET[1] + 2, y: height(-15, MOSQUE_STREET[1] + 2), rot: 0.4, range: [1.5, 1.2] });
// reef egrets on the beach, facing the water
for (const x of [-120, -62, -20, 25]) { const z = shoreAt(x) + 7; if (height(x, z) > 0.2) perches.push({ kind: 'egret', x, z, y: height(x, z), rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
// pied crows round the fish-drying racks on the beach, and sparrows in the alleys
for (const x of [-165, -95, -22, 48]) { const z = shoreAt(x) + 13.5; if (height(x, z) > 0.4) perches.push({ kind: 'crow', x, z, y: height(x, z), rot: 2, stay: [30, 90], gone: [40, 120], alert: 12 }); }
for (let x = -190; x < 60; x += 33) { const z = -58.5 + ((x * 3) % 2); perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: x, range: [1.2, 0.5] }); }
void RADIUS;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/kilwa.md §22.4) ──
const critters = [];
const wr = walkRoutes();
// cats on the doorsteps of the walk (Swahili towns keep many cats [inferred]): beside the benches, off the door's lane
wr.filter((_, i) => i % 5 === 1).slice(0, 5).forEach((w, i) => {
  const f = w.f, out = f.flip ? 1 : -1, x = f.doorX + (i % 2 ? -3.0 : 3.0), z = (f.flip ? w.l.rect[3] : w.l.rect[1]) + out * 0.7;
  if (x > w.l.rect[0] + 0.5 && x < w.l.rect[2] - 0.5) critters.push({ model: i % 2 ? 'cat_orange' : 'cat_tabby', at: [x, height(x, z) + 0.03, z], rot: i * 1.7, range: [7, 2.5] });
});
// hens and a cock scratching in the lanes between the rows, goats tethered at a lane's mouth
for (const [x, z, m] of [[-100.9, -60, 'hen_brown'], [-99.6, -59, 'hen_white'], [-100.2, -61.4, 'rooster'], [44.2, -50, 'hen_white'], [45.6, -49, 'hen_brown'], [-174.2, -45, 'hen_brown'], [-175.6, -44, 'rooster']]) critters.push({ model: m, at: [x, height(x, z) + 0.03, z], rot: x * 3, range: [2.2, 1.6], tau: 12, speed: 0.4, stride: 0.26 });
critters.push({ model: 'goat_black', at: [-140.2, height(-140.2, -100), -100], rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: [-141.6, height(-141.6, -99), -99], rot: 3.0, range: [9, 3.2] });
// stray dogs at the fish racks on the beach
for (const x of [-95, 48]) { const z = shoreAt(x) + 16; critters.push({ model: 'dog', at: [x, height(x, z) + 0.03, z], rot: x, range: [8, 3.2] }); }
// doves on the paving of the mosque's forecourt
for (const [x, z, m] of [[-8, -16.5, 'pigeon_grey'], [-7, -15.5, 'pigeon_white'], [-9.2, -17.2, 'pigeon_dark'], [-24, -17, 'pigeon_grey'], [-23, -16, 'pigeon_white']]) critters.push({ model: m, at: [x, height(x, z) + 0.05, z], rot: x * 3, range: [1.4, 1.2] });
// swallows' nests under the coping of up to six of the walk's houses, on the side of the front away from the door
{ let k = 0;
  for (const w of wr.filter((q) => q.l.rect[2] - q.l.rect[0] >= 7.5)) {
    if (k > 5) break;
    const l = w.l, f = w.f, out = f.flip ? 1 : -1, fz = f.flip ? l.rect[3] : l.rect[1], x = f.doorX - l.rect[0] > l.rect[2] - f.doorX ? l.rect[0] + 0.9 : l.rect[2] - 0.9;
    if (critters.some((c) => c.model === 'swallow_nest' && Math.abs(c.at[0] - x) < 9 && Math.abs(c.at[2] - fz) < 9)) continue;
    critters.push({ model: 'swallow_nest', at: [x, l.y + 2.3, fz + out * 0.14], rot: f.flip ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
  } }
export default { fish: [], flights, perches, critters };
