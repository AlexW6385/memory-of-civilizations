// Knossos — the animals (src/engine/fauna.js draws them; docs/settlements/knossos.md §11): swallows and swifts over the court and the
// roofs, crows over the hill, sparrows on the paving of the West Court, the Royal Road and the Central Court
// a little egret by the Kairatos.
import { COURT, STREAM, STREAM_LEVEL, onStream, lanes, inRect, lots } from './layout.js';
import { walkRoutes } from './walkroutes.js';
import { dwellingFrame } from '../../styles/minoan/town.js';
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

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §20.4) ──
// The animals of the town: dogs (hunting dogs are shown on Minoan seals and ivories [inferred]) lying at two doors of the walk and in the West Court, cats (a cat stalking a
// pheasant is painted at Hagia Triada, LM IB [inferred as the domestic cat's evidence; no source checked]) on a step and by the magazines, goats tethered at the lane's edge
// (the Cretan wild goat's tame kin [inferred]), doves on the paving of the courts (the dove is the bird of the shrines in Minoan models [inferred]), and the swallows' mud nests
// under the eaves of the open houses on the walk (swallows are painted in the Spring Fresco of Thera, LM IA [inferred as to the place of the nests]). No fowl: the domestic hen is not
// in the Aegean of the 17th century as far as we know.
const critters = [];
const wr = walkRoutes().filter((r) => !r.up);
const doorOf = (l) => { const F = dwellingFrame({ rect: l.rect, front: l.front, seed: l.seed }); return F; };
const homes = wr.filter((r) => r.kind === 'home' || r.kind === 'weaver' || r.kind === 'shop');
// dogs at the doors of two homes of the walk, on the side away from the bench, off the door's lane
for (const [i, r] of homes.slice(0, 2).entries()) {
  const F = doorOf(r.l), [x, z] = F.P(F.du >= 3.2 ? F.du - 2.6 : F.du + 3.4 > F.L - 0.5 ? F.du - 1.9 : F.du + 3.2, -0.9);
  critters.push({ model: 'dog', at: [x, 0.02, z], rot: 1.2 + i, range: [9, 3.5] });
}
critters.push({ model: 'dog', at: [-95, 0.07, 14], rot: 0.5, range: [9, 3.5] });
// cats: one on a step of the walk, one at the mouth of the West Magazines' corridor
{ const r = homes[3]; if (r) { const F = doorOf(r.l), [x, z] = F.P(F.du >= 3.2 ? F.du - 2.3 : F.du + 3.0, -0.7); critters.push({ model: 'cat_tabby', at: [x, 0.05, z], rot: 2.4, range: [7, 2.5] }); } }
critters.push({ model: 'cat_orange', at: [-39.2, 0.05, -62.4], rot: 1.0, range: [7, 2.5] });
// goats tethered at the lane's west end by the well
critters.push({ model: 'goat_black', at: [-76.5, 0.05, 62.0], rot: 0.6, range: [9, 3.2] }, { model: 'goat_white', at: [-77.8, 0.05, 63.4], rot: 3.0, range: [9, 3.2] });
// doves on the paving: the West Court before the façade, the Central Court by the shrine's steps
for (const [x, z, m] of [[-100, 6, 'pigeon_grey'], [-99, 7.4, 'pigeon_white'], [-101.2, 5, 'pigeon_grey'], [-9, 14, 'pigeon_white'], [-8.2, 15.2, 'pigeon_grey']]) critters.push({ model: m, at: [x, 0.07, z], rot: x * 3, range: [1.4, 1.2] });
// swallows' nests under the eave of up to eight open houses of the walk, away from the doors
{ let k = 0;
  for (const r of wr.filter((q) => q.l.rect[2] - q.l.rect[0] >= 6.3)) {
    if (k > 7) break;
    const l = r.l, F = doorOf(l), sg = l.front === 's' ? 1 : -1, fz = l.front === 's' ? l.rect[3] : l.rect[1], x = (l.front === 'n' || l.front === 's') ? l.rect[0] + (F.du > F.L / 2 ? 0.9 : F.L - 0.9) : l.rect[0];
    if (critters.some((c) => c.model === 'swallow_nest' && Math.abs(c.at[0] - x) < 9 && Math.abs(c.at[2] - fz) < 9)) continue;
    critters.push({ model: 'swallow_nest', at: [x, 2.5, fz + sg * 0.14], rot: l.front === 's' ? Math.PI / 2 : -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side: k % 2 ? 1 : -1, rise: -0.8 }); k++;
  } }
void inRect; void lots;
export default { fish, flights, perches, critters };
