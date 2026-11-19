// Thebes — the animals (src/engine/fauna.js draws them; docs/settlements/thebes.md §9): tilapia and Nile perch in the river and the
// sacred lake, swallows over the water and the quay, black kites over the pylons (drawn as crows), sparrows on the paving of the
// avenue, the market and the courts, a heron and a little egret on the reeds and the quay.
import { RIVER, LAKE, QUAY, riverX, height, ENCL, lots, ARRIVAL } from './layout.js';
import { doorPoint } from '../../styles/newkingdom/doorsite.js';

const inWater = (x, z) => Math.abs(x - riverX(z)) - (RIVER.w / 2 - 2);
const fish = [];
for (let z = -300; z < 300; z += 60) for (let i = 0; i < 2; i++) fish.push({ n: 3, size: [0.3, 0.7], palette: 'carp', y: RIVER.level, area: [RIVER.x - 12, z, RIVER.x + 12, z + 60], dist: inWater, margin: 3, a: [6, 26], ratio: 0.3, speed: 0.4, rise: 0.2 });
// the sacred lake: schools in its stone basin
fish.push({ n: 5, size: [0.25, 0.5], palette: 'carp', y: -2.2, area: [LAKE[0] + 2, LAKE[1] + 2, LAKE[2] - 2, LAKE[3] - 2], dist: (x, z) => Math.min(x - LAKE[0], LAKE[2] - x, z - LAKE[1], LAKE[3] - z) - 1.5, margin: 1.5, a: [10, 8], ratio: 0.4, speed: 0.35, rise: 0.15 });
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [RIVER.x, -250], b: [RIVER.x, 250] }, y: [1.5, 14], speed: 10, half: 26 },
  { kind: 'swallow', n: 4, loop: { c: [-200, 40], a: [60, 60], rot: 0.3 }, y: [4, 22], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [100, 100], a: [70, 40], rot: 0 }, y: [2, 10], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [-70, 0], a: [90, 55], rot: 0.2 }, y: [60, 38], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [30, -20], a: [50, 40], rot: 0.9 }, y: [42, 28], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [-120, -200], a: [60, 40], rot: 0.1 }, y: [25, 14], speed: 8 },
];
const perches = [];
const spots = [[-200, 5], [-180, -4], [-140, 4], [-124, -8], [-60, 3], [-6, -3], [20, 4], [-224, 34], [-210, 40], [-226, 58], [-104, 80], [-60, 100], [60, 120], [90, 30], [-30, -120], [-10, -100], [-120, -224], [-40, -204], [40, 204], [-160, 140], [110, -60], [-246, 20], [-246, -60], [-246, 100]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
perches.push({ kind: 'heron', x: RIVER.x + RIVER.w / 2 - 2, z: -160, y: -3.2, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: QUAY.x - 1.3, z: 60, y: 0.7, rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: LAKE[0] - 1.8, z: 100, y: 0.4, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
void ENCL;
// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §15d) ──
// Dogs and cats at the doors of the entered houses nearest the arrival, hens and a cock in the yards of the court houses, grey geese on the lake's rim and the quay,
// pigeons on the paving of the market. Not built: donkeys, cattle (no model), the ibis (the heron stands in).
const critters = [];
const dist = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - ARRIVAL[0], (l.rect[1] + l.rect[3]) / 2 - ARRIVAL[1]);
const entered = lots().filter((l) => l.open && !l.temple && doorPoint(l)).sort((a, b) => dist(a) - dist(b));
{
  let dogs = 0, cats = 0, courts = 0;
  for (const l of entered) {
    if (dist(l) > 140) break;
    const p = doorPoint(l), side = l.seed % 2 ? 1 : -1, s = side * (p.w / 2 + 1.7);
    if (l.kind === 'court' && courts < 4 && l.open) {
      // the yard: the hens scratch between the quern and the granary (the court is 5.5 to 7 m deep, its walls 0.4 m)
      const W = l.rect[2] - l.rect[0], u = W * 0.68, v = 3.4, x = l.rect[0] + u, z = p.z + p.sg * v;
      const who = courts === 0 ? ['rooster', 'hen_brown', 'hen_white'] : ['hen_brown', 'hen_white'];
      who.forEach((model, i) => critters.push({ model, at: [x - 0.5 * i, height(x, z), z + 0.4 * (i % 2)], rot: i * 2.1 + courts, range: [1.5, 1.1], size: i ? 0.96 : 1 }));
      courts++;
    }
    if (dogs < 4 && (l.kind === 'row' || l.kind === 'court') && l.seed % 3 !== 0) {
      const x = p.x + s, z = p.z - p.sg * 0.7;
      critters.push({ model: 'dog', at: [x, height(x, z), z], rot: p.sg > 0 ? Math.PI : 0, range: [9, 3.5] }); dogs++;
    } else if (cats < 5 && l.seed % 3 === 0) {
      const x = p.x - s, z = p.z - p.sg * 0.5;
      critters.push({ model: (l.seed >> 1) % 2 ? 'cat_tabby' : 'cat_orange', at: [x, height(x, z), z], rot: p.sg > 0 ? 0.4 : Math.PI + 0.4, range: [7, 2.5] }); cats++;
    }
  }
}
// the geese of Amun: on the lake's rim and on the quay's promenade, behind the stairs
for (const [x, z, rot] of [[LAKE[0] - 3.0, 80, Math.PI / 2], [LAKE[0] - 3.8, 92, 1.2], [LAKE[0] - 3.2, 70, 2.0], [QUAY.x + 3.0, 100, 0.3], [QUAY.x + 3.6, 104, 1.1], [QUAY.x + 3.0, -100, 4.2]]) critters.push({ model: 'goose_grey', at: [x, height(x, z) + 0.02, z], rot, range: [3, 1.8], size: 1 });
// pigeons at the market's edge, on the paving
for (const [x, z] of [[-244, 20], [-244.6, 38], [-243.8, 58], [-244.2, 96], [-243.6, -88]]) critters.push({ model: 'pigeon_grey', at: [x, height(x, z) + 0.02, z], rot: (x * 3) % 6, range: [1.6, 1.2] });
export default { fish, flights, perches, critters };
