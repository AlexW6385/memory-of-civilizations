// Mycenae — the animals (docs/settlements/mycenae.md §9): swifts and swallows over the ridge and the palace, a pair of ravens riding the ravine's air,
// sparrows about the houses of the lower town. No fish.
import { LANES, PALACE, lots, lotPoint, PAL_Y, GATE_Y } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 3, loop: { c: [10, -70], a: [130, 60], rot: 0.15 }, y: [30, 60], speed: 9 },
  { kind: 'swallow', n: 6, loop: { c: [60, 5], a: [60, 40], rot: 0.1 }, y: [26, 40], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-140, 30], a: [40, 40], rot: 0.4 }, y: [4, 12], speed: 9 },
];
const perches = [];
const sp = (x, z, y) => perches.push({ kind: 'sparrow', x, z, y: y ?? ground.height(x, z), rot: (x * 7) % 3, range: [1.6, 1.4] });
for (const lane of LANES) for (let i = 1; i < lane.length; i += 1) sp(lane[i][0] + 3, lane[i][1] + 3);
sp(PALACE.court[0] + 12, PALACE.court[1] + 6); sp(PALACE.court[0] + 4, PALACE.court[1] + 12, PAL_Y); sp(PALACE.court[0] + 20, PALACE.court[1] + 4, PAL_Y);
// on the parapets and in the lanes before the houses: sparrows at the doors, more near the arrival
let k = 0;
for (const l of lots()) {
  if (l.kind === 'granary' || (k++ % 2)) continue;
  const [x0, z0, x1, z1] = l.rect, st = l.kind === 'house' ? l.storeys : 1, x = x0 + (x1 - x0) * (0.3 + 0.4 * ((l.seed % 7) / 7)), z = z0 + (z1 - z0) * (0.3 + 0.4 * ((l.seed % 11) / 11));
  sp(x, z, l.y + st * 2.95 + 0.42);
}
sp(-125.8, -5.0); sp(-119.8, 5.6); sp(-100, 7, GATE_Y + 6.2); sp(-96, -7, GATE_Y + 7.0);
flights.push({ kind: 'swallow', n: 6, loop: { c: [-120, 0], a: [50, 30], rot: 0.05 }, y: [6, 14], speed: 9 }, { kind: 'crow', n: 2, loop: { c: [-150, -40], a: [60, 40], rot: 0.5 }, y: [25, 45], speed: 8 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §16.4) ──
// Dogs at the doors of the opened houses (hunting hounds run with the boar hunters of the Tiryns fresco and the Mycenaean vases; a house-dog is the natural guess [inferred]), goats tethered
// at the halt and on the verge by the spring (goats and sheep are the herds of the Linear B tablets of Knossos and Pylos [stated: common knowledge]; the herds' pens are ours), doves on the
// court's paving and at the shrines' steps (the dove sits on the shrine models and the idols of the cult rooms of Mycenae [inferred from the figurines of the cult centre]), and the swallows'
// mud nests under the eaves of the opened houses (swallows nest under the eaves of every house of the Mediterranean [inferred]). No cats and no fowl: neither the domestic cat nor the
// domestic hen is certain in the Aegean of the 13th century BC.
const critters = [];
const open = lots().filter((l) => l.open && l.kind !== 'cult' && l.kind !== 'guard');
for (const [i, l] of open.filter((q) => q.kind === 'house' || q.kind === 'workshop').slice(0, 4).entries()) {
  const dw = l.dw ?? 1.8, [x, z] = lotPoint(l, l.du >= l.W / 2 ? l.du - (dw / 2 + 1.7) : l.du + (dw / 2 + 1.7), -1.0);
  critters.push({ model: 'dog', at: [x, ground.height(x, z) + 0.02, z], rot: 1.2 + i, range: [9, 3.5] });
}
critters.push({ model: 'dog', at: [-121.8, ground.height(-121.8, 8.4) + 0.02, 8.4], rot: 0.6, range: [9, 3.5] });
for (const [x, z, m, r] of [[-121.0, 11.6, 'goat_black', 0.6], [-119.8, 12.6, 'goat_white', 3.0], [-92.5, 18.5, 'goat_white', 1.4]]) critters.push({ model: m, at: [x, ground.height(x, z) + 0.05, z], rot: r, range: [9, 3.2] });
for (const [x, z, m, y] of [[36.5, 9, 'pigeon_white', PAL_Y], [37.4, 9.8, 'pigeon_grey', PAL_Y], [50, -3.6, 'pigeon_white', PAL_Y], [49.2, -2.6, 'pigeon_grey', PAL_Y]]) critters.push({ model: m, at: [x, y + 0.03, z], rot: x * 3, range: [1.4, 1.2] });
for (const l of lots().filter((q) => q.kind === 'cult')) { const [x, z] = lotPoint(l, l.du > l.W / 2 ? 1.2 : l.W - 1.2, -1.3); critters.push({ model: 'pigeon_white', at: [x, ground.height(x, z) + 0.05, z], rot: x * 3, range: [1.4, 1.2] }); }
{ let k = 0;
  for (const l of lots().filter((q) => q.open && (q.face === 'n' || q.face === 's') && q.W >= 6.3 && q.kind !== 'guard')) {
    if (k > 5) break;
    const u = l.du > l.W / 2 ? 0.9 : l.W - 0.9, [x, z] = lotPoint(l, u, -0.14);
    critters.push({ model: 'swallow_nest', at: [x, l.y + 2.35, z], rot: l.face === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
  } }
export default { fish, flights, perches, critters };
