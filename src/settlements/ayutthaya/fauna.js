// Ayutthaya — the animals (src/engine/fauna.js draws them; docs/settlements/ayutthaya.md §9): carp in the canals, swallows low over the water,
// egrets on the banks, doves about the wat's compound at its wall and gate, sparrows on the paths, crows over the chedis at dusk.
import { CANALS, WATER, WAT, PLATFORM, inRect, ISLAND } from './layout.js';

const fish = [];
for (const c of CANALS) {
  const [a, b, c1, d] = c.rect, ew = c1 - a > d - b, hw = (ew ? d - b : c1 - a) / 2;
  const dist = (x, z) => hw - Math.abs(ew ? z - (b + d) / 2 : x - (a + c1) / 2);
  for (let i = 0; i < 3; i++) {
    const t = 0.25 + i * 0.25;
    fish.push({ n: 3, size: [0.3, 0.55], palette: 'carp', y: WATER - 0.3, dist: (x, z) => -dist(x, z), margin: 1.2, k: 1, rot: ew ? 0 : Math.PI / 2,
      area: ew ? [a + 20 + (c1 - a - 40) * t - 12, (b + d) / 2 - 1, a + 20 + (c1 - a - 40) * t + 12, (b + d) / 2 + 1] : [(a + c1) / 2 - 1, b + 20 + (d - b - 40) * t - 12, (a + c1) / 2 + 1, b + 20 + (d - b - 40) * t + 12], a: [10, 1.6], ratio: 0.15, minA: 1, speed: 0.3, rise: 0.1 });
  }
}
const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, -78], b: [280, -78] }, y: [-0.2, 4], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [-200, 64], b: [280, 64] }, y: [-0.2, 4], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [154, -240], b: [154, 215] }, y: [-0.2, 4], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-270, -190], b: [-270, 190] }, y: [-0.2, 6], speed: 9 },
  { kind: 'dove', n: 6, loop: { c: [10, -140], a: [60, 30], rot: 0 }, y: [14, 40], speed: 7 },
  { kind: 'crow', n: 7, loop: { c: [10, -140], a: [45, 35], rot: 0.3 }, y: [50, 36], speed: 8 },
];
const perches = [];
// egrets standing on the canal banks, facing the water
for (let i = 0; i < CANALS.length; i++) { const [a, b, c1, d] = CANALS[i].rect; if (c1 - a > d - b) perches.push({ kind: 'egret', x: a + 40 + i * 20, z: b - 0.9, y: 0.1, rot: -Math.PI / 2 + Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 }, { kind: 'egret', x: a + 120 + i * 9, z: d + 0.9, y: 0.1, rot: 0, stay: [60, 200], gone: [60, 160], alert: 10 }); }
// sparrows and doves on the wat's forecourt and the wall
for (const [x, z] of [[0, -100], [20, -102], [-30, -110], [40, -112], [60, -105], [100, -110]]) perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.4 + (x * 7 % 3), range: [1.4, 1.3] });
void WAT; void PLATFORM; void inRect; void ISLAND;
export default { fish, flights, perches };
