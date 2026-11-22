// Ur — the animals (src/engine/fauna.js draws them; docs/settlements/ur.md §10): carp in the harbour basin, swallows
// over the quay and the temenos, crows (kites) over the ziggurat, sparrows on the market square and the quay, a little
// egret on the harbour's reeds.
import { HARBOUR, MARKET, COURT, inHouse } from './layout.js';
import { opened, doorPoint } from './openwalk.js';
import { ground } from './ground.js';

const [hx0, hz0, hx1, hz1] = HARBOUR.rect;
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: HARBOUR.water, area: [hx0 + 14, hz0 + 14, hx1 - 8, hz1 - 14], dist: (x, z) => Math.min(x - hx0, hx1 - x, z - hz0, hz1 - z), margin: 5, a: [14, 9], ratio: 0.4, speed: 0.35, rise: 0.1, tries: 1 });
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [(hx0 + hx1) / 2 + 20, (hz0 + hz1) / 2], a: [50, 90], rot: 0 }, y: [1, 9], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -30], a: [60, 50], rot: 0.3 }, y: [8, 30], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [0, 0], a: [60, 45], rot: 0.5 }, y: [38, 55], speed: 8 },
];
flights.push({ kind: 'swallow', n: 5, lane: { a: [-200, -200], b: [200, -200] }, y: [1.5, 6], speed: 9 }, { kind: 'swallow', n: 4, lane: { a: [60, -300], b: [60, 100] }, y: [1.5, 6], speed: 9 }, { kind: 'crow', n: 4, loop: { c: [-110, -20], a: [30, 25], rot: 0.2 }, y: [20, 32], speed: 8 });   // over the lanes and the temple's workshops
const perches = [];
const spots = [[-20, -200], [20, -194], [-70, -140], [95, -111], [-100, 70], [-40, 90], [140, -30], [-250, -20], [-265, 40], [MARKET[0] + 6, MARKET[3] + 2], [MARKET[2] - 6, MARKET[3] + 2], [0, MARKET[1] - 12], [0, -150], [(COURT[0] + COURT[2]) / 2 + 12, -110], [hx1 + 3, -60], [hx1 + 3, 0], [hx1 + 8, 30]];
spots.push([-31, COURT[1] + 28], [31, COURT[1] + 28], [-10.5, COURT[1] + 41.5], [10.5, COURT[1] + 33], [-33, COURT[1] + 49], [0, COURT[3] - 3]);   // on the stelae's plinths, the standards' bases, the pen's fence and the stairs' foot of the Court of Nanna
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
perches.push({ kind: 'egret', x: hx0 + 8, z: hz0 + 60, y: HARBOUR.water, rot: 0, stay: [80, 240], gone: [40, 150], alert: 10 });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §27) ──
// Dogs at the doors of the houses that can be entered nearest the visitor's walk, geese by the quay's landward edge, a raft of ducks on the basin, doves on the Court's paving
// and the market square, a kingfisher on a mooring post over the water, a cormorant on another, a crane on the basin's north rim among the reeds. Not built: cats (not attested
// enough for the date), fowl (the domestic hen came to Mesopotamia a thousand years later), camels and horses (not yet), and sheep and goats (the street-life pass draws them).
const critters = [];
{
  let dogs = 0;
  for (const l of opened().slice(0, 40)) {
    if (dogs >= 5 || l.seed % 3 === 1) continue;
    const d = doorPoint(l), n = Math.hypot(d.out[0], d.out[1]);
    for (const sd of l.seed % 2 ? [1, -1] : [-1, 1]) {
      const x = d.p[0] + d.out[0] / n * 1.1 + sd * d.side[0] * 2.9, z = d.p[1] + d.out[1] / n * 1.1 + sd * d.side[1] * 2.9;
      if (inHouse(x, z, 0.5)) continue;
      critters.push({ model: 'dog', at: [x, 0.05, z], rot: Math.atan2(d.out[0], d.out[1]) + 0.4 * sd, range: [9, 3.5] }); dogs++;
      break;
    }
  }
}
// geese (domestic in Sumer: fattened for the temples) on the ground behind the quay beside the moored boats
[[-92, 6.6, 0.6], [-90.4, 7.5, 1.9], [-44, 7.4, 3.1], [-42.6, 8.3, 4.4], [18, 7.0, 2.6]].forEach(([z, o, rot], i) => critters.push({ model: i % 2 ? 'goose_grey' : 'goose_white', at: [hx1 + o, 0.02, z], rot, range: [3, 1.8], size: 1 }));
// a raft of ducks on the basin's open water
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white', 'duck_brown', 'duck_brown'], raft: true, area: [hx0 + 18, -70, hx0 + 52, -30], dist: (x, z) => Math.min(x - hx0, hx1 - x, z - hz0, hz1 - z), a: [12, 2.2], ratio: 0.2, margin: 5, y: HARBOUR.water, speed: 0.18, cycle: [20, 26] });
// doves on the Court's paving (its south-east corner, off the sacred way and the altar) and on the market square
for (const [x, z] of [[27, -92], [27.8, -94], [-33, -128], [MARKET[0] + 8, MARKET[1] + 6], [MARKET[0] + 8.8, MARKET[1] + 8]]) critters.push({ model: 'pigeon_grey', at: [x, 0.07, z], rot: (x * 3) % 6, range: [1.6, 1.2] });
// the mooring posts along the quay's edge (plan.js: z = −140 + 9k, 1.45 m up from the quay's top): a kingfisher over the water, a cormorant drying itself
critters.push({ model: 'kingfisher', at: [hx1 - 1.21, 1.45, -113], rot: -Math.PI / 2, water: [hx1 - 5.5, -113, HARBOUR.water], cycle: 34 });
critters.push({ model: 'cormorant', at: [hx1 - 1.21, 1.45, -59], rot: -Math.PI / 2, range: [0.6, 0.4] });
// a crane (the winter visitor of the marshes) among the reeds on the basin's north rim
critters.push({ model: 'crane', at: [hx0 + 40, 0.02, hz0 - 2.5], rot: Math.PI / 2, range: [7.0, 1.6], tau: 50, speed: 0.4 });
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('ur'));
export default { fish, flights, perches, critters };
