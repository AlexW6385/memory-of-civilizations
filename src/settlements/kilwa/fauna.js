// Kilwa about 1330 — the animals (src/engine/fauna.js draws them; docs/settlements/kilwa.md §17): pied crows (drawn as crows)
// wheeling over the town and the beach, swallows over the harbour and the streets, sparrows on the market street, reef egrets
// at the tide line by the drawn-up boats. No fish are drawn.
import { RADIUS, SOKO, MOSQUE_STREET, LANES, height } from './layout.js';

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
export default { fish: [], flights, perches };
