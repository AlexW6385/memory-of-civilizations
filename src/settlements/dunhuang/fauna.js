// Dunhuang — the animals (src/engine/fauna.js; docs/settlements/dunhuang.md): swifts and swallows over the stream and
// the street, ravens high over the cliff, sparrows on the apron and the roofs, a heron-like egret standing in for the
// birds of the Crescent Spring's reeds [inferred], small fish in the Daquan's stream.
import { RIVER, riverX, XF, ZEND, SPRING, TOWN } from './layout.js';
import { ground } from './ground.js';
import { walkRoutes } from './walk.js';
import { frame } from '../../styles/dunhuang/town.js';
import { doorU } from '../../styles/dunhuang/homes.js';
import { rng, CROSS, LANE_W, SERAI } from './layout.js';

const fish = [];
for (let z = -90; z <= 90; z += 45) fish.push({ n: 3, size: [0.1, 0.18], palette: 'carp', y: RIVER.water, dist: (x, zz) => Math.abs(x - riverX(zz)) - RIVER.w / 2, margin: 0.5, k: 1, rot: 0, area: [riverX(z) - 0.4, z - 12, riverX(z) + 0.4, z + 12], a: [9, 1.0], ratio: 0.12, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-60, 0], b: [150, 0] }, y: [1, 5], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-45, 0], a: [60, 30], rot: 0 }, y: [2, 12], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [XF - 8, 0], a: [18, 110], rot: 0 }, y: [34, 58], speed: 8 },
];
flights[0].a = [26, 3];
const perches = [];
for (const [x, z] of [[XF + 5, -50], [XF + 5.5, -20], [XF + 5.2, 20], [XF + 5, 50], [XF + 6, 90], [-34, 5], [-34, -5], [60, -6], [60, 6], [90, 5], [20, 5.5]]) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// the egret in the shallows of the Crescent Spring, facing the water
{ const x = SPRING.c[0] - 3, z = SPRING.c[1] + 3; perches.push({ kind: 'egret', x, z, y: -0.65, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }
// sparrows on the doorsteps and at the lane mouths of the town, on the east wall's coping (3.7 m) and the cliff's apron
for (const [x, z] of [[8, 6.8], [30, -6.8], [52, 6.9], [75, -6.9], [96, 6.9], [118, -6.8], [136, 5.6], [24, 12], [72, -14], [118, 22], [-20, -5], [100, 4.6], [44, -4.4], [64, 4.4]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: (x * 3) % 3, range: [1.6, 1.4] });
for (const z of [-48, -32, -16, 14, 30, 46]) perches.push({ kind: 'sparrow', x: TOWN[2], z, y: 3.7, rot: Math.PI / 2, range: [2.4, 0], alert: 5 });
for (const z of [-90, -10, 40, 70]) perches.push({ kind: 'sparrow', x: XF + 4.5, z, y: 0.5, rot: (z * 3) % 3, range: [1.8, 1.6] });
flights.push({ kind: 'swallow', n: 5, loop: { c: [100, 0], a: [40, 14], rot: 0 }, y: [1.5, 9], speed: 9 });
flights.push({ kind: 'swallow', n: 4, loop: { c: [165, 10], a: [20, 40], rot: 0 }, y: [1, 6], speed: 8 });
flights.push({ kind: 'crow', n: 4, loop: { c: [130, 90], a: [40, 30], rot: 0.5 }, y: [14, 30], speed: 7 });
void ZEND;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §15.4) ──
// Bactrian camels kneeling and standing in the caravanserai's stalls (the two-humped camel of the Silk Road: dossier §6), dogs at two shop doors of the walk, cats on two
// home steps, goats tethered at a lane mouth, doves of the shrines on the apron and at the wayside shrine, swallows' mud nests under the eaves of the walk's houses
// [inferred throughout: pets, flocks and the swallows of the oasis are not described by a source].
const critters = [];
for (let k = 0; k < 4; k++) critters.push({ model: k === 2 ? 'camel_dark' : 'camel_dun', at: [SERAI.x1 - 3.4, 0, SERAI.z0 + 5 + k * 4.5], rot: Math.PI + 0.12 * k, range: [11, 4.5], size: 0.96 + 0.04 * k });
critters.push({ model: 'camel_dun', at: [-64.5, 0.45, 38], rot: -Math.PI / 2, range: [11, 4.5] });
const wr = walkRoutes(), fr = (r) => { const f = frame(r.l.rect, r.l.front), du = doorU(f.W, r.shop, rng(r.l.seed * 7 + 3)()); return { f, du }; };
{ const shops = wr.filter((r) => r.shop); let k = 0;
  for (const r of [shops[2], shops[7]]) { if (!r) continue; const { f, du } = fr(r), [x, z] = f.P(du > 3.2 ? du - 2.3 : du + 2.9, -1.2); critters.push({ model: 'dog', at: [x, 0.02, z], rot: 1.2 + k++, range: [9, 3.5] }); } }
{ const homes = wr.filter((r) => !r.shop);
  for (const [i, r] of [homes[0], homes[3]].entries()) { if (!r) continue; const { f, du } = fr(r), [x, z] = f.P(du + 1.9, -0.7); critters.push({ model: i ? 'cat_orange' : 'cat_tabby', at: [x, 0.05, z], rot: 2.4 + i, range: [7, 2.5] }); } }
critters.push({ model: 'goat_black', at: [CROSS[0] - 0.9, 0.05, -9.2], rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: [CROSS[0] + 0.6, 0.05, -10.2], rot: 3.0, range: [9, 3.2] }, { model: 'goat_white', at: [CROSS[2] + 0.5, 0.05, 10.0], rot: 1.8, range: [9, 3.2] });
for (const [x, y, z, m] of [[XF + 5.6, 0.45, -8, 'pigeon_white'], [XF + 6.2, 0.45, -7.2, 'pigeon_grey'], [XF + 5.4, 0.45, 8.5, 'pigeon_grey'], [XF + 6.4, 0.45, 9.3, 'pigeon_white'], [XF + 6.0, 0.45, -40, 'pigeon_grey'], [XF + 5.2, 0.45, 60, 'pigeon_white'], [-34.5, 0.12, -2.6, 'pigeon_grey'], [-32.6, 0.12, -2.4, 'pigeon_white']]) critters.push({ model: m, at: [x, y, z], rot: x * 3, range: [1.4, 1.2] });
{ let k = 0;
  for (const r of wr.filter((q) => !q.shop || q.l.rect[2] - q.l.rect[0] >= 9)) {
    if (k > 5) break;
    const { f, du } = fr(r), u = du + 2.6 < f.W - 0.8 ? du + 2.6 : du - 2.6, [x, z] = f.P(u, -0.14);
    if (critters.some((c) => c.model === 'swallow_nest' && Math.hypot(c.at[0] - x, c.at[2] - z) < 10)) continue;
    const dir = f.dir, rot = Math.atan2(dir[1], dir[0]) ;
    critters.push({ model: 'swallow_nest', at: [x, 2.6, z], rot, cycle: 33 + (r.l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
  } }
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('dunhuang'));
export default { fish, flights, perches, critters };
