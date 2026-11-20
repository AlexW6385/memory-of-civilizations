// Constantinople — the animals (src/engine/fauna.js draws them; docs/settlements/constantinople.md §13): crows and gulls (drawn as crows) over
// the hill from the sea, pigeons (drawn as sparrows) on the paving of the Augustaion, the Mese and the
// Hippodrome, swifts over the roofs, sparrows at the shop fronts.
import { AUGUSTAION, HIPPODROME, FORUM, MESE } from './layout.js';
import { ground } from './ground.js';
import { lots, special, FORECOURT } from './layout.js';
import { shopRooms } from './shops.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 6, loop: { c: [60, 120], a: [200, 110], rot: 0.3 }, y: [40, 110], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-40, 260], a: [150, 70], rot: 0 }, y: [25, 80], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-120, 90], a: [120, 60], rot: 0.5 }, y: [10, 40], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [-10, 140], a: [60, 30], rot: 0 }, y: [14, 40], speed: 7 },
  { kind: 'swallow', n: 4, loop: { c: [-240, 200], a: [70, 40], rot: 0.8 }, y: [14, 40], speed: 7 },
];
const perches = [];
const spots = [[-30, 150], [-14, 160], [0, 135], [-45, 170], [-10, 120], [-80, 108], [-120, 112], [-175, 90], [-182, 60], [-230, 40], [-280, 36], [FORUM.c[0] + 10, FORUM.c[1] + 12], [FORUM.c[0] - 12, FORUM.c[1] - 10], [-140, 20], [-20, 60], [-12, 48], [6, 64], [-30, 72], [14, 86], [-24, 94], [4, 100], [24, 62], [-8, 58], [32, 80], [-40, 90]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// pigeons and sparrows on the lanes' paving at the row ends near the core, and on the garden walls
{ let n = 0; for (const l of lots()) { if (l.abut.e || Math.hypot(l.rect[2], l.rect[3]) > 260 || (l.seed % 3)) continue; const x = l.rect[2] + 2.5, z = (l.rect[1] + l.rect[3]) / 2 + (l.seed % 5) - 2; perches.push({ kind: l.seed % 2 ? 'sparrow' : 'sparrow', x, z, y: ground.height(x, z), rot: (l.seed % 7) / 2, range: [2.2, 1.2] }); if (++n > 40) break; } }
void AUGUSTAION; void HIPPODROME; void MESE;
// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §16.4) ──
// Facing: a critter's forward is (cos rot, sin rot) in (x, z): 0 east, π/2 south, π west.
const critters = [];
const hash = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
{
  // dogs and cats lie in the portico by the piers between two shops (the door is 2.2 m wide, the pier 0.6 m; the animal lies 1.5 m off a shop's middle and 1 m from the wall,
  // beside the door's lane, not in it), facing the street; a songbird in a cage hangs on the wall by one door
  const R = shopRooms().filter((r) => r.k > 0 && r.k < r.ns - 1);       // (not the corner shops, where two stoas meet)
  const beside = (r, a, b) => { const p = r.F.W(a, b), s = r.F.W(a, -r.F.f1 - 3); return { p, rot: Math.atan2(s[1] - p[1], s[0] - p[0]) }; };
  const near = (r) => Math.hypot(r.at[0] + 10, r.at[1] - 86);
  const byNear = R.slice().sort((a, b) => near(a) - near(b));
  const pick = (n, from) => from.filter((r, i) => i % 4 === 1).slice(0, n);
  pick(4, byNear).forEach((r, i) => { const { p, rot } = beside(r, i % 2 ? 1.55 : -1.55, -1.0); critters.push({ model: 'dog', at: [p[0], r.y, p[1]], rot: rot + (hash(p[0], p[1]) - 0.5) * 0.8, range: [9, 3.5] }); });
  pick(6, byNear.slice(8)).forEach((r, i) => { const { p, rot } = beside(r, i % 2 ? -1.6 : 1.6, -0.9); critters.push({ model: i % 2 ? 'cat_tabby' : 'cat_orange', at: [p[0], r.y, p[1]], rot: rot + (hash(p[1], p[0]) - 0.5) * 0.8, range: [7, 2.5] }); });
  const c = byNear[5]; { const p = c.F.W(1.5, -0.7); critters.push({ model: 'cagebird', at: [p[0], c.y + 2.6, p[1]], rot: Math.atan2(...(() => { const s = c.F.W(1.5, -c.F.f1 - 3); return [s[1] - p[1], s[0] - p[0]]; })()) }); }
}
// doves (the pigeons of the town, drawn as the fowl walk) on the forecourt's paving by the cistern head and the church's south wall, and on the Augustaion's by the canopied basin
for (const [model, x, z, rot] of [['pigeon_grey', -17.6, 64.4, 0.4], ['pigeon_grey', -16.9, 65.9, 2.1], ['pigeon_white', -18.4, 67.8, 4.0], ['pigeon_dark', -15.8, 63.5, 5.1],
  ['pigeon_grey', -3.1, 39.9, 1.3], ['pigeon_dark', -2.2, 40.6, 3.4], ['pigeon_grey', -4.1, 41.2, 5.0], ['pigeon_white', 25.8, 74.1, 2.2], ['pigeon_grey', 22.9, 70.3, 0.6],
  ['pigeon_grey', -12.8, 138.2, 0.9], ['pigeon_dark', -15.2, 141.7, 2.8], ['pigeon_white', -13.1, 142.4, 4.4], ['pigeon_grey', 22.9, 138.5, 1.7]]) critters.push({ model, at: [x, ground.height(x, z) + 0.01, z], rot, range: [1.8, 1.0] });
// a rooster and hens pecking in the lane before the enterable bakery's front, and a pair before the weaver's (the lane is 5 m wide: the birds keep to the house's side)
for (const [key, hens] of [['bakery', ['rooster', 'hen_brown', 'hen_white', 'hen_brown']], ['weaver', ['hen_brown', 'hen_white', 'hen_brown']]]) {
  const s = special()[key]; if (!s) continue;
  const [x0, , x1, z1] = s.rect;
  hens.forEach((model, i) => { const x = x0 + 2.2 + i * 1.1 + hash(i, x0) * 0.6, z = z1 + 1.3 + (i % 2) * 0.5; critters.push({ model, at: [x, ground.height(x, z) + 0.02, z], rot: hash(x, z) * 6.28, range: model === 'rooster' ? [1.4, 0.9] : [2.0, 0.9], size: 0.96 + 0.08 * hash(z, x) }); });
  void x1;
}
// a dog at the door of two of the enterable houses (kept 1.6 m off the middle of the front, where the door is not), and a cat on the marble bench at the church's south wall
for (const [key, dx] of [['tavern', 15.5], ['home', 2.4]]) { const s = special()[key]; if (!s) continue; const x = s.rect[0] + dx, z = s.rect[3] + 0.9; critters.push({ model: 'dog', at: [x, ground.height(x, z) + 0.01, z], rot: -Math.PI / 2 + 0.5, range: [9, 3.5] }); }
void FORECOURT;
export default { fish, flights, perches, critters };
