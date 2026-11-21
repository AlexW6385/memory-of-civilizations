// Chichén Itzá — the animals (src/engine/fauna.js draws them; docs/settlements/chichen-itza.md §14): swallows over the plaza and the
// Sacred Cenote (the swallows of the cenote are a famous sight), vultures-as-crows high over the temples, sparrows (stand-ins for the
// small seed-eaters) on the plaza's plaster and the sacbe, a heron-like egret at the cenote's rim. No fish: the cenote lies 20 m down.
import { PLAZA, CENOTE, RADIUS, lots, inLot, inRect, onSacbe } from './layout.js';
import { lotRoutes, doorOf, WALK_REACH } from './walk.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, CENOTE.c[1]], a: [CENOTE.r + 6, CENOTE.r + 4], rot: 0 }, y: [-14, 12], speed: 10 },
  { kind: 'swallow', n: 5, loop: { c: [20, 10], a: [110, 70], rot: 0.15 }, y: [6, 34], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-115, -40], a: [28, 80], rot: 0 }, y: [4, 22], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [10, -30], a: [150, 110], rot: 0.5 }, y: [55, 95], speed: 8 },
];
const perches = [];
const spots = [[-12, 45], [14, 52], [40, 60], [-40, 40], [70, 80], [100, 90], [-80, 60], [-20, -30], [30, -30], [-20, 18], [22, 18], [0, -150], [2, -190], [-2, -225], [60, 20], [-100, 100], [130, 20], [-60, -100], [60, -100], [150, 70]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// a little egret on the rim at the cenote's south edge, facing the water (north)
const ez = CENOTE.c[1] + CENOTE.r + 1.2;
perches.push({ kind: 'egret', x: 11, z: ez, y: ground.height(11, ez), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void PLAZA;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §19.4) ──
// What the Maya kept and what lived in their town about 1000: the domestic turkey (tamed in Mesoamerica; the Maya kept it for meat, eggs' sake and offerings [stated: general]) pecking in the yards and at the
// market's edge; the dog (the Maya's small short-haired dogs, kept for company, hunting and the table, buried with their masters [stated: general]) lying at the doors; the ocellated turkey of the Yucatán
// forest, wild at the edge of the lots [stated: its range is the Yucatán peninsula]; the swallows' mud nests on the Sacred Cenote's walls, whose swallows are a famous sight (§14). No hen, no cat, no goat, no donkey:
// the Old World's animals came with the Spanish; no sheep or cattle either. [inferred: the places and numbers]
const critters = [];
const turkey = (x, z, i, o = {}) => critters.push({ model: 'turkey', at: [x, ground.height(x, z) + 0.04, z], rot: (i * 2.1) % 6.28, range: [1.8, 1.4], tau: 12, speed: 0.4, stride: 0.26, ...o });
const dog = (x, z, i, o = {}) => critters.push({ model: 'dog', at: [x, ground.height(x, z) + 0.04, z], rot: (i * 0.9) % 6.28, range: [8, 3.2], ...o });
// the street's seven lots (walk.js): a dog lying beside the door of the first house of three lots, off the lane (2.3 m to the side of the route); two turkeys in the lot's south corners, away from the gate
{ const R = lotRoutes(), seen = new Set();
  for (const q of R) {
    if (q.kind !== 'house' || seen.has(q.lot) || seen.size >= 3 || (q.lot % 2)) continue;
    seen.add(q.lot);
    const d = doorOf(q.house, [q.route[0][0], 126]), t = [-d.n[1], d.n[0]];
    dog(d.at[0] + d.n[0] * 1.5 + t[0] * 2.3, d.at[1] + d.n[1] * 1.5 + t[1] * 2.3, q.lot);
  }
  void WALK_REACH;
  lots().forEach((l, i) => {
    if (l.rect[1] !== 126) return;
    turkey(l.rect[2] - 3.4, l.rect[3] - 3.0, i); turkey(l.rect[0] + 3.4, l.rect[3] - 3.4, i + 2, { size: 0.95 });
  });
}
// at the markets' edges: turkeys pecking at the east end of the east market and the south side of the great one; a dog among the stalls of the west market
turkey(88, 64, 11); turkey(90, 66, 12, { size: 0.94 }); turkey(112, 82, 13); turkey(126, 83, 14, { size: 0.95 });
dog(-12, 70, 5); dog(100, 80, 7);
// the ocellated turkeys at the forest's edge, in the gaps between the lots (a search of the ring 190–300 m out for places clear of every lot, the plaza and the sacbe)
{ let k = 0;
  for (let a = 0; a < 6.28 && k < 6; a += 0.07) for (const r of [210, 250, 290]) {
    const x = Math.round(Math.cos(a) * r), z = Math.round(Math.sin(a) * r);
    if (k >= 6 || inLot(x, z, 4) || inRect(PLAZA, x, z, 10) || onSacbe(x, z, 10) || Math.hypot(x, z) > RADIUS - 30 || (Math.floor(a * 100) + r) % 5) continue;
    if (critters.some((c) => c.model === 'turkey_ocellated' && Math.hypot(c.at[0] - x, c.at[2] - z) < 40)) continue;
    critters.push({ model: 'turkey_ocellated', at: [x, ground.height(x, z) + 0.04, z], rot: a * 3, range: [2.4, 1.6], tau: 16, speed: 0.4, stride: 0.26 }); k++;
  }
}
// the swallows' nests on the Sacred Cenote's walls, 2–11 m under the rim (the wall is at the radius where the ground falls away: ground.js, the walls' profile), each with its swallow
{ const { c, r } = CENOTE;
  for (const [th, ro] of [[1.2, 1.5], [1.9, 2.0], [2.6, 2.3], [3.4, 1.7], [4.1, 2.1], [4.8, 1.4], [5.5, 2.4], [0.5, 1.9]]) {
    const wx = c[0] + Math.cos(th) * (r - ro), wz = c[1] + Math.sin(th) * (r - ro), nx = -Math.cos(th), nz = -Math.sin(th);      // the wall's face at this radius, and the nest 0.1 m before it
    critters.push({ model: 'swallow_nest', at: [wx + nx * 0.1, ground.height(wx, wz) + 0.25, wz + nz * 0.1], rot: Math.atan2(nz, nx), cycle: 31 + (th * 7 | 0) % 6, flight: 8, radius: 7, side: th > 3 ? 1 : -1, rise: 0 });
  } }
export default { fish, flights, perches, critters };
