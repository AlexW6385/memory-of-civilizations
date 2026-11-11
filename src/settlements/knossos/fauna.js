// Knossos — the animals (src/engine/fauna.js draws them; docs/settlements/knossos.md §11): swallows and swifts over the court and the
// roofs, crows over the hill, sparrows on the paving of the West Court, the Royal Road and the Central Court
// a little egret by the Kairatos.
import { COURT, STREAM, STREAM_LEVEL, onStream, lanes } from './layout.js';
import { ground } from './ground.js';

const fish = [];
// small fish in the Kairatos's pools, in reaches along the stream
for (let i = 0; i < 7; i++) { const z = -150 + i * 50; fish.push({ n: 4, size: [0.12, 0.22], palette: 'carp', y: STREAM_LEVEL, area: [STREAM.x - 9, z - 18, STREAM.x + 9, z + 18], dist: (x, zz) => (onStream(x, zz, 0) ? -3 : 3), margin: 1.0, a: [8, 14], ratio: 0.3, speed: 0.3, rise: 0.1 }); }
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 0], a: [70, 55], rot: 0.1 }, y: [14, 40], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-105, -20], a: [45, 40], rot: 0.4 }, y: [6, 18], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [60, 100], a: [90, 40], rot: 0.2 }, y: [8, 26], speed: 10 },
  { kind: 'crow', n: 5, loop: { c: [0, 0], a: [150, 100], rot: 0.5 }, y: [60, 100], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [180, 40], a: [60, 40], rot: 0.9 }, y: [25, 50], speed: 8 },
];
const perches = [];
const spots = [[-110, -20], [-100, 20], [-85, -30], [-90, 40], [-100, -88], [-96, -86], [-60, -89], [-140, -89], [-220, -89], [-12, 0], [10, 8], [-4, -10], [0, 26], [0, 50], [-8, 20], [8, -18], [90, -92], [90, 0], [-90, 84], [20, 84]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + (Math.abs(x) < 14 && Math.abs(z) < 26 ? 0.05 : 0), rot: (x * 7) % 3, range: [1.8, 1.6] });
void COURT;
// sparrows in the lanes of the town, on the doorsteps and the rims of the jars, a few swallows low over the lanes
{ let k = 0; for (const Ln of lanes()) { if (Math.hypot((Ln.x0 + Ln.x1) / 2, Ln.z) > 150 || k++ % 2) continue; const x = (Ln.x0 + Ln.x1) / 2; perches.push({ kind: 'sparrow', x, z: Ln.z + 0.4, y: ground.height(x, Ln.z) + 0.07, rot: (x * 3) % 3, range: [2.2, 1.0] }); } }
flights.push({ kind: 'swallow', n: 5, loop: { c: [-170, 60], a: [60, 40], rot: 0.3 }, y: [5, 14], speed: 9 });
// a little egret on the stream's bank, facing the water
perches.push({ kind: 'egret', x: STREAM.x - 4.4, z: -40, y: ground.height(STREAM.x - 4.4, -40), rot: 0, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: STREAM.x + 4.6, z: 60, y: ground.height(STREAM.x + 4.6, 60), rot: 3, stay: [80, 240], gone: [40, 150], alert: 10 });
export default { fish, flights, perches };
