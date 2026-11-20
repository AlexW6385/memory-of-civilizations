// Joseon Hanyang — the animals (src/engine/fauna.js draws them; docs/settlements/joseon-seoul.md §14):
// carp in Gyeonghoeru's pond and Hyangwonji, house swallows over the pond and the avenue, tree
// sparrows on the paving and on the palace wall's coping, magpies (kkachi) on the walls, crows at dusk over
// the throne court, a heron at Gyeonghoeru's shore; and the critters (docs §19.4): mandarin ducks on both
// ponds, a crane, hens, a dog and a cat in a hanok yard, swallows' nests under the shops' eaves, a caged
// songbird at a shop, a kingfisher at Hyangwonji.
import { POND, HYANG, HISLE, PALACE, AVENUE, JONGNO, inPond, inHyang, lots } from './layout.js';
import { blocksOf, shopsOf, walkHomes } from './openwalk.js';
import { homeLayout, classOf } from '../../styles/joseon/home.js';

const pondDistance = (x, z) => (inPond(x, z) ? -Math.min(x - POND[0], POND[2] - x, z - POND[1], POND[3] - z) : 3);
const hyangDistance = (x, z) => (inHyang(x, z) ? -Math.min(x - HYANG[0], HYANG[2] - x, z - HYANG[1], HYANG[3] - z) : 3);
const WATER = -1.2;

const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 3, size: [0.5, 0.75], palette: i < 3 ? 'redcarp' : 'carp', y: WATER, area: [POND[0] + 8, POND[1] + 8, POND[2] - 8, POND[3] - 8], dist: pondDistance, margin: 2.5, a: [24, 14], ratio: 0.5, speed: 0.3, rise: 0.3 });
for (let i = 0; i < 4; i++) fish.push({ n: 3, size: [0.45, 0.65], palette: i < 2 ? 'redcarp' : 'goldfish', y: WATER, area: [HYANG[0] + 6, HYANG[1] + 6, HYANG[2] - 6, HYANG[3] - 6], dist: hyangDistance, margin: 2.5, a: [12, 8], ratio: 0.5, speed: 0.3, rise: 0.3 });

const flights = [
  { kind: 'swallow', n: 4, loop: { c: [(POND[0] + POND[2]) / 2, 0], a: [40, 40], rot: 0, dist: pondDistance, margin: 2 }, y: [0.7, 2.2], speed: 8 },
  { kind: 'swallow', n: 3, lane: { a: [0, 240], b: [0, 380] }, y: [2, 9], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-130, 357], b: [130, 357] }, y: [2, 8], speed: 9 },
  { kind: 'crow', n: 7, loop: { c: [0, 20], a: [60, 50], rot: 0.3 }, y: [34, 14], speed: 8 },
];
flights[1].a = flights[2].a = [26, 4];

const perches = [];
for (const [x, z] of [[-60, 358], [40, 356], [100, 357], [0, 300], [6, 270], [-8, 330], [-80, 357], [120, 360]]) perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.4 + (x * 7 % 3), range: [1.4, 1.3] });
for (const [x, z, rot] of [[-80, PALACE[3], 0], [80, PALACE[3], 0], [PALACE[0], 100, Math.PI / 2], [PALACE[2], 100, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: 5.5 + 0.5, rot, range: [2.6, 0], alert: 5 });
// sparrows on the court's paving between the files, on the Heungnyemun court and the platform's steps
for (const [x, z, y] of [[-22, 70, 0.04], [24, 62, 0.04], [-12, 58, 0.04], [14, 78, 0.04], [-30, 112, 0.04], [28, 118, 0.04], [10, 48, 1.64]]) perches.push({ kind: 'sparrow', x, z, y, rot: x * 0.3, range: [1.5, 1.3] });
// a heron on the pond's south bank, facing the water
perches.push({ kind: 'heron', x: -125, z: POND[3] + 1.2, y: 0.05, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
// magpies (kkachi, the bird of glad tidings) on the palace walls' copings and the throne court's flank walls [inferred: a bird of Seoul; the place is ours]
for (const [x, z, rot] of [[-50, PALACE[3], 0], [112, PALACE[3], 0], [PALACE[0], 40, Math.PI / 2], [PALACE[2], 150, Math.PI / 2]]) perches.push({ kind: 'pica', x, z, y: 6.0, rot, range: [2.2, 0], alert: 6.5 });
void AVENUE; void JONGNO;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs §19.4) ──
const critters = [];
// mandarin ducks (wonnyang, the pair that stays together) on Gyeonghoeru's pond and on Hyangwonji [stated: Gyeonghoeru's pond; the ducks are inferred]
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [POND[0] + 6, POND[1] + 6, POND[2] - 6, POND[3] - 6], dist: pondDistance, a: [14, 6], ratio: 0.5, margin: 1.4, y: WATER, speed: 0.22, cycle: [18, 24] });
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [HYANG[0] + 6, HYANG[1] + 6, HYANG[2] - 6, HYANG[3] - 6], dist: hyangDistance, a: [9, 4], ratio: 0.5, margin: 1.4, y: WATER, speed: 0.2, cycle: [18, 24] });
// the crane (a long-lived bird of the palace's gardens) on the pond's south-east bank, walking along it and stopping [inferred: its place]
critters.push({ model: 'crane', at: [-96, 0, POND[3] + 3.6], rot: Math.PI, range: [6, 1.6], tau: 50, speed: 0.4 });
// the kingfisher on Hyangwonji's south bank, fishing the pond [inferred]
critters.push({ model: 'kingfisher', at: [HISLE.c[0] + 14, 0.05, HYANG[3] + 0.4], rot: -Math.PI / 2, water: [HISLE.c[0] + 14, HYANG[3] - 1.6, WATER], cycle: 34 });
// the swallows' nests under the head beam of the shops of Jongno nearest the avenue (the street's north front, the beam's front face), the birds sweeping down the street
{
  const bs = blocksOf().sort((p, q) => Math.abs((p.rect[0] + p.rect[2]) / 2) - Math.abs((q.rect[0] + q.rect[2]) / 2)).slice(0, 2);
  bs.forEach((b, i) => critters.push({ model: 'swallow_nest', at: [b.rect[0] + b.bw * (1.5 + i), 2.55, b.rect[1] + 0.04], rot: -Math.PI / 2, cycle: 34 + 3 * (i ? -1 : 1), flight: 7, radius: 12, side: i ? -1 : 1, rise: 0.2 }));
  // the cage of a songbird hung from the beam of a one-bay shop, off its lantern's line
  const b = bs[0], one = shopsOf(b).find((q) => !q.open && q.x0 > b.rect[0] + 2 * b.bw);
  if (one) critters.push({ model: 'cagebird', at: [one.x0 + 1.55, 2.55, b.rect[1] - 0.35], rot: Math.PI / 2 });
}
// a hanok yard on the walk: hens and a rooster in the yard, a dog at the gate, a cat on the wall's coping [inferred: household animals]
{
  const l = walkHomes(1)[0];
  if (l) {
    const L = homeLayout({ ...l, cls: classOf(l) }), gx = L.gate.x, gz = l.rect[3], yx = gx - 2.6, yz = gz - 6;
    for (const [model, dx, dz, size] of [['rooster', 0, 0, 1], ['hen_brown', 1.1, 0.5, 1], ['hen_white', -0.9, 0.9, 0.96], ['hen_brown', 0.4, -1.1, 0.96]]) critters.push({ model, at: [yx + dx, 0.03, yz + dz], rot: dz * 2, range: [2.2, 1.4], size });
    critters.push({ model: 'dog', at: [gx - 2.2, 0.03, gz + 1.1], rot: Math.PI / 2, range: [9, 3.5] });
    critters.push({ model: 'cat_tabby', at: [l.rect[0] + (l.rect[2] - l.rect[0]) * 0.3, 2.4, gz], rot: 0.15, range: [7, 2.5] });
  }
}
void lots;
export default { fish, flights, perches, critters };
