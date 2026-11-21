// Bauhaus Dessau — the animals (src/engine/fauna.js; docs/settlements/bauhaus-dessau.md §7): swifts and house martins over the streets, jackdaws
// and crows over the roofs, house sparrows on the paving and the roofs' edges, a blackbird in the pines of the Masters' grove.
import { ground } from './ground.js';
import { B, MASTERS, RADIUS, lots, TORTEN, KONSUM } from './layout.js';
import { houseSpec, frontOf } from '../../styles/bauhaus/tenement.js';
import { Fr } from '../../styles/bauhaus/frame.js';

const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-180, 40], b: [180, 40] }, y: [4, 14], speed: 10, half: 18 },
  { kind: 'swallow', n: 5, loop: { c: [0, -2], a: [50, 24], rot: 0 }, y: [5, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-60, 100], a: [70, 40], rot: 0.4 }, y: [4, 12], speed: 9 },
  { kind: 'crow', n: 5, loop: { c: [20, -80], a: [90, 50], rot: 0.2 }, y: [32, 55], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [110, 60], a: [70, 40], rot: 0.5 }, y: [24, 40], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-30, -40], [-27, 20], [-28, 70], [10, 2], [30, -4], [60, 0], [100, 2], [3, 40], [-60, 80], [-38, 110], [-95, -40], [-95, 40], [70, 78], [120, 80], [20, 50], [140, 40], [-110, 120]])
  perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.12, rot: (x * 7) % 3, range: [1.6, 1.4] });
// on the school's flat roofs and parapets
for (const [x, z, y] of [[-12, 10, 12.9], [20, -20, 12.9], [30, -12, 12.9], [44, 12, 16.3], [20, 18, 4.5]]) perches.push({ kind: 'sparrow', x, z, y, rot: 0, range: [1.2, 0], alert: 5 });
// on the tenements' cornices at the front edge (the eave of the hipped roofs), and on the flat roofs' parapets
{
  let k = 0;
  for (const l of lots()) {
    k++;
    if (k % 3 !== 0 || Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) > 120) continue;
    const sp = houseSpec(l), [x0, z0, x1, z1] = l.rect, t = ((l.seed % 7) + 1) / 9, y = sp.top + (l.modern || l.roof === 'flat' ? 0.66 : 0.07);
    const p = l.front === 'n' ? [x0 + (x1 - x0) * t, z0 - 0.05] : l.front === 's' ? [x0 + (x1 - x0) * t, z1 + 0.05] : l.front === 'w' ? [x0 - 0.05, z0 + (z1 - z0) * t] : [x1 + 0.05, z0 + (z1 - z0) * t];
    perches.push({ kind: 'sparrow', x: p[0], z: p[1], y, rot: l.front === 'n' || l.front === 's' ? 0 : 1.57, range: [1.0, 0], alert: 6 });
  }
  // the Törten gardens and the Konsum's roof
  for (const r of TORTEN) for (let i = 0; i < 3; i++) perches.push({ kind: 'sparrow', x: r[0] + 10 + i * 24, z: r[1] - 2.5, y: ground.height(0, 0) + 0.12, rot: i, range: [2.0, 1.5] });
  perches.push({ kind: 'sparrow', x: KONSUM[0] + 6, z: KONSUM[3] + 2.2, y: 0.12, rot: 0.4, range: [1.6, 1.2] });
}
flights.push({ kind: 'swallow', n: 5, loop: { c: [0, 60], a: [80, 30], rot: 0.1 }, y: [6, 18], speed: 10 }, { kind: 'swallow', n: 4, loop: { c: [100, -60], a: [70, 40], rot: 0.9 }, y: [6, 16], speed: 9 }, { kind: 'crow', n: 4, loop: { c: [-60, 60], a: [80, 50], rot: 0.3 }, y: [26, 44], speed: 8 });
void B; void MASTERS; void RADIUS;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/bauhaus-dessau.md §15.4) ──
const critters = [];
const hashP = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
{
  // each lot's door in its frame: a point u along the front and d out into the street, and the heading (fauna-critters: forward is (cos rot, sin rot)) out of the door
  const at = (l, u, d) => { const F = new Fr(null, l.rect, l.front), p = F.at(u, -d), q = F.at(u, -d - 1), rot = Math.atan2(q[1] - p[1], q[0] - p[0]); return { x: p[0], z: p[1], rot }; };
  let i = 0;
  for (const l of lots()) {
    const f = frontOf(l), cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    if (Math.hypot(cx, cz) > 150) continue;
    i++;
    // a dog lying at the pub's step and one by the butcher's door (the scraps), a cat on a flat's doorstep in every fourth house
    if (f.kind === 'pub' || f.kind === 'butcher') { const p = at(l, f.du + 1.9, 1.1); critters.push({ model: 'dog', at: [p.x, 0, p.z], rot: p.rot + (hashP(cx, cz) - 0.5), range: [9, 3.5] }); }
    else if (!l.shop && i % 4 === 0) { const p = at(l, f.du - 1.3, 0.7); critters.push({ model: hashP(cz, cx) < 0.5 ? 'cat_tabby' : 'cat_orange', at: [p.x, 0, p.z], rot: p.rot + 1.2, range: [7, 2.5] }); }
    // pigeons before the bakeries and the grocers' sacks
    if (f.kind === 'baker' || f.kind === 'grocer') for (let k = 0; k < 3; k++) { const p = at(l, f.du - 2.6 + k * 1.1, 1.6 + 0.5 * (k % 2)); critters.push({ model: ['pigeon_grey', 'pigeon_dark', 'pigeon_white'][k], at: [p.x, 0, p.z], rot: hashP(p.x, p.z) * 6.28, range: [1.8, 1.4], size: 0.95 + 0.1 * hashP(p.z, p.x) }); }
  }
  // the forecourt before the school (the students' bicycles, crumbs of the canteen): a flock of pigeons, and rooks on the school garden's lawn
  for (const [x, z] of [[10, -2.5], [18, -3.5], [26, -1.5], [34, -3]]) for (let k = 0; k < 2; k++) critters.push({ model: k ? 'pigeon_dark' : 'pigeon_grey', at: [x + k * 0.9, 0, z + k * 0.4], rot: hashP(x, z + k) * 6.28, range: [2.2, 1.6] });
  for (const [x, z] of [[6, 44], [18, 62], [-4, 66]]) critters.push({ model: 'rook', at: [x, 0, z], rot: hashP(x, z) * 6.28, range: [3.2, 2.2] });
  // the school's gate dog (the porter's), and a cat on the Masters' house steps (Klee kept cats [inferred that one sat out in 1927])
  critters.push({ model: 'dog', at: [3.5, 0, 6.5], rot: 1.57, range: [9, 3.5] });
  const km = MASTERS[3].rect; critters.push({ model: 'cat_tabby', at: [km[0] + 2.2, 0.3, km[3] + 0.9], rot: 1.2, range: [7, 2.5] });
}

export default { fish: [], flights, perches, critters };
