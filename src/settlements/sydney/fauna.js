// Modern Sydney, 1973 — the animals (src/engine/fauna.js draws them; docs/settlements/sydney.md §11): schools of dark fish in the
// cove and Farm Cove, welcome swallows low over the water, Australian ravens (crows) over the Garden and the Rocks at dusk, white
// silver gulls (critters, below) on the quay's wharves and the sea walls, and pigeons (the sparrow's
// stand-in) on the promenade, the Opera House's stair and the Garden's paths.
import { LEVEL, QUAY, OPERA, GARDEN, MACQUARIE, shore, height, streetCells, lots } from './layout.js';

const dist = (x, z) => -shore(x, z);
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 5, size: [0.3, 0.5], palette: 'carp', y: LEVEL, area: [-38, -92, 34, -66], dist, margin: 4, a: [12, 6], ratio: 0.5, speed: 0.5, rise: 0.3, tries: 1 });
for (let i = 0; i < 4; i++) fish.push({ n: 4, size: [0.3, 0.55], palette: 'carp', y: LEVEL, area: [176, -92, 294, -48], dist, margin: 5, a: [14, 8], ratio: 0.5, speed: 0.5, rise: 0.3, tries: 1 });

const flights = [
  { kind: 'swallow', n: 4, loop: { c: [0, -50], a: [30, 20], rot: 0, dist, margin: 3 }, y: [0.8, 3], speed: 8 },
  { kind: 'swallow', n: 4, loop: { c: [235, -70], a: [36, 18], rot: 0.2, dist, margin: 3 }, y: [0.8, 3], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [260, 60], a: [50, 36], rot: 0.5 }, y: [26, 12], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-190, -20], a: [40, 28], rot: 1.0 }, y: [24, 12], speed: 9 },
];
const perches = [], gulls = [];
let sd = 1973; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
// gulls on the promenade's rail and the wharves' bollards (the wharves' decks at y 1.2, the bollards 0.5 m up)
for (const x of [-36, -18, 0, 18]) for (const z of [-30, -12]) gulls.push({ x: x + (rand() - 0.5) * 6, z, y: 1.2, rot: rand() * 6, stay: [60, 220], gone: [30, 120], alert: 8 });
for (let x = -40; x < 40; x += 30) gulls.push({ x, z: -6.5, y: height(x, -6.5), rot: rand() * 6, stay: [60, 200], gone: [30, 120], alert: 8 });
// pigeons: the promenade, the stair and forecourt, the Garden's lawns, the streets' corners
const put = (x, z, range = [1.8, 1.4]) => perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: rand() * 3, range });
for (let i = 0; i < 10; i++) put(QUAY[0] + rand() * (QUAY[2] - QUAY[0]), -3.5 + rand() * 2.5);
for (let i = 0; i < 8; i++) put(66 + rand() * 68, OPERA.rect[3] + 6 + rand() * 14, [2, 1.6]);
for (let i = 0; i < 12; i++) put(GARDEN[0] + 20 + rand() * 220, GARDEN[1] + 30 + rand() * 120, [2.6, 2.0]);
// pigeons at the city's crossings and in the Rocks' lanes' ends, gulls along the Point's wall and on the Farm Cove's walk
{
  const { xs, zs } = streetCells();
  for (const [a, b] of xs) for (const [c, d] of zs) { if (shore((a + b) / 2, (c + d) / 2) < 10) continue; for (let i = 0; i < 2; i++) put(a - 3 + rand() * (b - a + 6), c - 3 + rand() * (d - c + 6), [2.2, 1.6]); }
  for (let x = 224; x < 332; x += 18) { for (let z = -170; z < -60; z += 0.5) if (shore(x, z) > 1.8) { gulls.push({ x: x + rand() * 6, z: z + 1.2, y: height(x, z + 1.2), rot: rand() * 6, stay: [60, 200], gone: [30, 120], alert: 7 }); break; } }
  flights.push({ kind: 'crow', n: 4, loop: { c: [60, 140], a: [60, 40], rot: 0.2 }, y: [28, 14], speed: 9 }, { kind: 'swallow', n: 5, loop: { c: [270, -118], a: [40, 14], rot: 0, dist, margin: 3 }, y: [0.8, 3], speed: 8 });
}
// gulls on the Point's west wall (the arrival's foreground) and pigeons on its promenade
for (let z = -140; z < -100; z += 7) { let x = 205; while (shore(x, z) <= 1.8 && x < 260) x += 0.25; gulls.push({ x: x + 0.5 + rand(), z, y: height(x + 0.5, z), rot: 1.57 + rand() * 0.5, stay: [60, 200], gone: [30, 120], alert: 6 }); put(x + 4 + rand() * 4, z + rand() * 5, [2, 1.6]); }
void MACQUARIE;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/sydney.md §15) ──
const critters = [];
const hashP = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
/** The heading (fauna-critters: forward is (cos rot, sin rot)) toward the water from a point on a sea wall. */
const toWater = (x, z) => { const gx = shore(x + 0.4, z) - shore(x - 0.4, z), gz = shore(x, z + 0.4) - shore(x, z - 0.4); return Math.atan2(-gz, -gx); };
// the silver gulls: on the wharves' decks and the promenade, along the Point's wall and the Farm Cove walk, where they stood before as the egret's stand-in
for (const g of gulls) critters.push({ model: 'gull_silver', at: [g.x, g.y, g.z], rot: g.y > 1 && g.y < 1.3 ? -Math.PI / 2 + (hashP(g.x, g.z) - 0.5) : toWater(g.x, g.z) + (hashP(g.z, g.x) - 0.5) * 0.6, range: [2.2, 1.2], size: 0.95 + 0.1 * hashP(g.x, g.z + 1) });
// a little black cormorant on the sea wall by the arrival, drying its wings, and one at the quay's east end
for (const [x0, z0] of [[212, -118], [38, -9]]) {
  let x = x0; while (shore(x, z0) <= 1.0 && x < x0 + 40) x += 0.2;
  const y = height(x, z0);
  if (shore(x, z0) > 1.0) critters.push({ model: 'cormorant', at: [x + 0.35, y + 0.02, z0], rot: toWater(x, z0), cycle: 49 });
}
// a kelpie lying at the hotel's step on the Point's new street (the pub's door is at half its frontage: the dog keeps 2.4 m to one side), and cats on the Rocks' terraces' footpaths
{
  const pub = lots().find((l) => l.kind === 'pub');
  if (pub) { const [x0, z0, x1] = pub.rect, x = x0 + (x1 - x0) * 0.5 - 2.6, z = z0 - 1.2; critters.push({ model: 'dog', at: [x, height(x, z), z], rot: Math.PI * 1.5, range: [9, 3.5] }); }
  const ter = lots().filter((l) => l.kind === 'terrace');
  for (const i of [5, 14, 31]) {
    const l = ter[i]; if (!l) continue;
    const [x0, z0, x1, z1] = l.rect, x = x1 - 1.0, z = l.front === 's' ? z1 + 0.7 : z0 - 0.7;
    critters.push({ model: i % 2 ? 'cat_tabby' : 'cat_orange', at: [x, height(x, z), z], rot: l.front === 's' ? Math.PI * 0.5 : Math.PI * 1.5, range: [7, 2.5] });
  }
}
// Pacific black ducks dabbling on the cove below the Point's wall (the arrival's water), a pair and a flock of five in the Farm Cove's shallows
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown'], area: [178, -148, 206, -104], dist: shore, a: [9, 4], ratio: 0.5, margin: 2.4, y: LEVEL, speed: 0.2, cycle: [18, 24] });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_brown', 'duck_brown', 'duck_brown'], raft: true, area: [184, -96, 232, -52], dist: shore, a: [10, 1.2], ratio: 0.15, margin: 2.4, y: LEVEL, speed: 0.12 });
export default { fish, flights, perches, critters };
