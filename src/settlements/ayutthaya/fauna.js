// Ayutthaya — the animals (src/engine/fauna.js draws them; docs/settlements/ayutthaya.md §9): carp in the canals, swallows low over the water,
// egrets on the banks, doves about the wat's compound at its wall and gate, sparrows on the paths, crows over the chedis at dusk.
import { CANALS, WATER, WAT, PLATFORM, inRect, ISLAND, lots } from './layout.js';
import { frame } from '../../styles/khmer/village.js';
import { rng } from '../../styles/siamese/houses.js';

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

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §13.4) ──
// The animals of the walk, all [inferred]: the dogs of the wat (a Thai wat keeps its dogs; two lie by the forecourt's way), a cat on the plinth of a shop and one on a terrace
// (the cat of Siam is older than this date: the Tamra Maew, the "Treatise on Cats", is of the Ayutthaya period; its cats' colours are not in the models, which have the tabby
// and the orange), a rooster and hens scratching under and behind four stilt houses (the red junglefowl is the Thai fowl; cock-fighting was a pastime of Siam), white and brown
// domestic ducks on the canal by the bridge, doves (the spotted dove of the wats) on the court's brick way and the platform's foot, a kingfisher on the canal's bank by the bridge,
// and songbirds in cages hung at three houses of the walk (the Thai keep caged doves and bulbuls). No goat, cow, buffalo or elephant model: the king's two elephants are figures
// of the people plan (town.js); the water monitor of the canals has no model yet.
const critters = [];
const walkLots = lots().filter((l) => l.walk), F4 = (l) => frame(l.rect, l.front);
const upOf = (l) => 1.9 + rng(l.seed || 1)() * 0.6;
const shops = walkLots.filter((l) => l.kind === 'shop'), homes = walkLots.filter((l) => l.kind !== 'shop');
// the dogs of the wat, lying on the forecourt's side of the gate road, off the way
for (const [x, z, rot] of [[22.5, -103.5, 1.2], [-5.5, -109, 2.6], [64, -108.5, 0.4]]) critters.push({ model: 'dog', at: [x, 0.03, z], rot, range: [9, 3.5] });
// a cat on the plinth of the second shop, beside the entry gap's far pier (the plinth is 0.3 m up), and one on the terrace of the first house
{ const l = shops[1]; if (l) { const { W, hF, hS } = F4(l), [x, z] = W(hS - 0.45, hF + 0.18); critters.push({ model: 'cat_orange', at: [x, 0.32, z], rot: 2.4, range: [7, 2.5] }); }
  const h = homes[0]; if (h) { const { W, hF, hS } = F4(h), [x, z] = W(hS - 0.45, hF - 0.45); critters.push({ model: 'cat_tabby', at: [x, upOf(h) + 0.02, z], rot: 0.6, range: [7, 2.5] }); } }
// the fowl under and behind four houses (the yard's side, away from the lane): a rooster and two hens each at the first two, a hen and chicks' mother at the others
homes.slice(0, 4).forEach((l, i) => {
  const { W, hF } = F4(l), set = i < 2 ? [['rooster', -0.9, 0.0], ['hen_brown', 0.2, -0.5], ['hen_white', 0.9, 0.3]] : [['hen_brown', -0.5, 0.0], ['hen_white', 0.6, -0.4]];
  for (const [model, u, dv] of set) { const [x, z] = W(u, -hF - 1.7 + dv); critters.push({ model, at: [x, 0.02, z], rot: (x * 7) % 3, range: [3.4, 1.4] }); }
});
// ducks on the canal by the gate bridge, a raft of them dabbling along the north bank
{ const c = CANALS.find((q) => q.id === 'z1').rect, zc = (c[1] + c[3]) / 2, hw = (c[3] - c[1]) / 2;
  critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_white', 'duck_brown', 'duck_brown'], raft: true, area: [26, c[1] + 1, 70, c[3] - 1], dist: (x, z) => -(hw - Math.abs(z - zc)), a: [9, 1.3], ratio: 0.14, margin: 0.8, y: WATER, speed: 0.17, cycle: [26, 34] });
  // the kingfisher on the bank at the bridge's west side, looking to the water
  critters.push({ model: 'kingfisher', at: [3.2, 0.14, c[1] - 0.45], rot: Math.PI / 2, water: [3.2, c[1] + 1.4, WATER], cycle: 36 }); }
// doves on the brick way of the court and the platform's foot
for (const [x, z, m] of [[8, -112.5, 'pigeon_grey'], [9.4, -113.2, 'pigeon_white'], [12, -126, 'pigeon_grey'], [-3, -125.5, 'pigeon_white'], [-2.2, -124.6, 'pigeon_grey'], [24, -126.6, 'pigeon_grey']]) critters.push({ model: m, at: [x, 0.05, z], rot: x * 3, range: [1.4, 1.2] });
// songbirds in cages at the front posts of three houses of the walk (the cage hangs 1.9 m over the terrace's floor)
homes.slice(0, 3).forEach((l, i) => { const { W, hS, hF } = F4(l), [x, z] = W(-hS + 0.3 + i * 0.1, hF + 0.1); critters.push({ model: 'cagebird', at: [x, upOf(l) + 1.9, z], rot: Math.PI / 2 }); });
void WAT; void PLATFORM; void inRect; void ISLAND;
export default { fish, flights, perches, critters };
