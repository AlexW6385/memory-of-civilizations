// Abbasid Baghdad — the animals (src/engine/fauna.js draws them; docs/settlements/abbasid-baghdad.md §10): carp and barbel in the Tigris and the
// canal, swallows and swifts over the river and the esplanade, kites (crows stand in) over the walls, sparrows on the suq rows and the quays,
// egrets at the reeds of the river bank.
import { RIVER, CANAL, ALL_SUQS as SUQS, C, JETTIES, jettyAt, riverX, canalEnd } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (let z = -440; z <= 440; z += 110) {
  const xr = riverX(z), edge = (x) => RIVER.w / 2 - Math.abs(x - xr);
  fish.push({ n: 4, size: [0.4, 0.9], palette: 'carp', y: RIVER.water, area: [xr - 38, z - 30, xr + 38, z + 30], dist: (x) => edge(x), margin: 8, a: [20, 12], ratio: 0.4, speed: 0.45, rise: 0.1, tries: 1 });
}
fish.push({ n: 3, size: [0.3, 0.6], palette: 'carp', y: CANAL.water, area: [-300, CANAL.z - 5, canalEnd() - 20, CANAL.z + 5], dist: (x, z) => CANAL.w / 2 - Math.abs(z - CANAL.z), margin: 2, a: [20, 2.5], ratio: 0.2, speed: 0.4, rise: 0.1, tries: 1 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [325, -60], a: [70, 160], rot: 0 }, y: [1, 10], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [C[0], C[1]], a: [120, 120], rot: 0.4 }, y: [10, 38], speed: 9 },
  { kind: 'crow', n: 7, loop: { c: [C[0], C[1]], a: [200, 180], rot: 0.5 }, y: [50, 90], speed: 8 },
];
const perches = [];
for (const s of SUQS) perches.push({ kind: 'sparrow', x: (s.rect[0] + s.rect[2]) / 2, z: s.rect[1] + 3, y: 4.9, rot: 0, range: [2, 2] });
for (const j of JETTIES.slice(0, 6)) { const J = jettyAt(j); perches.push({ kind: 'sparrow', x: J.a[0] + J.dir * 14, z: j.z + 1.0, y: -0.1, rot: 1.0, range: [2, 1.6] }); }
for (const z of [-200, -20, 150, 330]) { const x = riverX(z) - RIVER.w / 2 - 1.5; perches.push({ kind: 'egret', x, z, y: ground.height(x, z), rot: Math.PI / 2, stay: [60, 220], gone: [40, 150], alert: 10 }); }
export default { fish, flights, perches };
