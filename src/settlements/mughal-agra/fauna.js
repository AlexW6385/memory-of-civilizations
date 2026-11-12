// Mughal Agra about 1650 — the animals (src/engine/fauna.js draws them; docs/settlements/mughal-agra.md §12): house crows over
// the town's roofs, blue rock pigeons about the Taj's domes and the gate, swifts and swallows low over the Yamuna and the
// garden's channels, house sparrows on the paving of the forecourt and the streets, a little egret and a grey heron
// on the river's sandy bank (the Yamuna's bank is the Taj's north edge).
import { RIVER_Z, FORECOURT, STREETS, KATRAS } from './layout.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, -170], a: [40, 30], rot: 0 }, y: [36, 70], speed: 10 },            // pigeons and swifts round the dome
  { kind: 'swallow', n: 5, loop: { c: [0, 150], a: [34, 20], rot: 0.3 }, y: [24, 38], speed: 10 },           // about the great gate
  { kind: 'swallow', n: 4, lane: { a: [-150, RIVER_Z + 14], b: [150, RIVER_Z + 14] }, y: [-0.5, 3], speed: 9 },   // over the river's edge
  { kind: 'crow', n: 7, loop: { c: [-160, 290], a: [90, 40], rot: 0.4 }, y: [14, 30], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [150, 285], a: [80, 40], rot: -0.3 }, y: [12, 26], speed: 8 },
];
const perches = [];
const spar = (x, z, y = 0.04) => perches.push({ kind: 'sparrow', x, z, y, rot: 0.4 + (Math.abs(x * 7 + z) % 3), range: [1.4, 1.3] });
for (const [x, z] of [[-30, 185], [-12, 200], [25, 190], [40, 215], [-50, 218], [60, 183], [0, 246], [-5, 280], [6, 300], [-90, 270], [90, 272], [-40, 270], [45, 270], [-200, 100], [200, -40]]) spar(x, z);
// the bank of the Yamuna below the terrace's face
perches.push({ kind: 'egret', x: -60, z: RIVER_Z + 6, y: -2.2, rot: -1.57, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'heron', x: 110, z: RIVER_Z + 7, y: -2.3, rot: -1.57, stay: [80, 240], gone: [40, 150], alert: 11 });
// sparrows and house crows on the lanes of the town: along each street, spread by the layout, never in a fixed list
{
  let k = 0;
  for (const s of STREETS) {
    const [x0, z0, x1, z1] = s.rect, alongZ = z1 - z0 > x1 - x0, len = alongZ ? z1 - z0 : x1 - x0, step = s.bazaar ? 22 : 34;
    for (let t = 12; t < Math.min(len, 600) - 8; t += step + (k++ % 3) * 5) {
      const u = (alongZ ? z0 : x0) + t, v = alongZ ? (x0 + x1) / 2 + ((k % 3) - 1) * 2.6 : (z0 + z1) / 2 + ((k % 3) - 1) * 2.6;
      const x = alongZ ? v : u, z = alongZ ? u : v;
      if (Math.hypot(x, z) > 320) continue;
      if (k % 4 === 0) perches.push({ kind: 'crow', x, z, y: 0.04, rot: 1 + (k % 5), range: [2.2, 2.0] }); else spar(x, z);
    }
  }
  // the katras' courts: sparrows among the bales, crows on the well's rim
  for (const q of KATRAS) { const cx = (q.rect[0] + q.rect[2]) / 2, cz = (q.rect[1] + q.rect[3]) / 2; spar(cx - 3, cz + 1.2); spar(cx + 4, cz - 1.5); perches.push({ kind: 'crow', x: cx + 1, z: cz + 3, y: 0.04, rot: 2, range: [2, 2] }); }
}
// more of the river's birds: egrets and herons along the sand and the shallows on both sides of the terrace
for (const [x, z, k] of [[-120, RIVER_Z + 4, 'egret'], [-20, RIVER_Z + 7, 'egret'], [45, RIVER_Z + 5, 'heron'], [150, RIVER_Z + 6, 'egret'], [-170, RIVER_Z + 3, 'heron'], [196, RIVER_Z + 9, 'egret']]) perches.push({ kind: k, x, z, y: -2.25, rot: -1.57, stay: [80, 240], gone: [40, 150], alert: k === 'heron' ? 11 : 10 });
// the garden and the plinth (§13): blue rock pigeons on the marble before the tomb and along the channel's kerb, mynas on the
// walks and the lawns of the beds
for (const [x, z] of [[-14, -148], [9, -151], [-22, -150], [16, -153]]) perches.push({ kind: 'pigeon', x, z, y: 7.25, rot: 0.5 + (Math.abs(x) % 3), range: [1.6, 1.4] });
for (const [x, z] of [[-6, -60], [6, -96], [-6.6, -30], [6.6, 46], [-6, 104], [7.4, 128]]) perches.push({ kind: 'pigeon', x, z, y: 0.57, rot: 1.2 + (Math.abs(x + z) % 3), range: [1.8, 1.4] });
for (const [x, z] of [[-24, -62], [30, -40], [-38, 70], [52, 88], [-70, -96], [90, -60], [-96, 36], [64, 40]]) perches.push({ kind: 'myna', x, z, y: 0.02, rot: 2 + (Math.abs(x) % 4), range: [2.4, 2.0] });
void FORECOURT;
export default { fish, flights, perches };
