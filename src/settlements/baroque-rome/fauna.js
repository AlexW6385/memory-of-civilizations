// Baroque Rome — the animals (src/engine/fauna.js draws them; docs/settlements/baroque-rome.md §5): swifts and
// swallows screaming over the roofs and the colonnade, crows over the dome at twilight, pigeons (drawn as
// sparrows) on the piazza's paving and the colonnade's balustrade, carp in the Tiber's shallows kept out.
import { CROSSING, OVAL, FRONT_X, tiberX, height, TIBER, rows, frontPt } from './layout.js';
import { openShops } from './openwalk.js';

const fish = [];
for (let i = 0; i < 4; i++) { const z = -250 + i * 150, x = tiberX(z); fish.push({ n: 2, size: [0.5, 0.8], palette: 'carp', y: TIBER.level, dist: (px, pz) => Math.abs(px - tiberX(pz)) - (TIBER.w / 2 - 4), margin: 2, k: 1, rot: 0, area: [x - 14, z - 14, x + 14, z + 14], a: [10, 10], ratio: 0.3, minA: 1.5, speed: 0.35, rise: 0.1 }); }
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [OVAL.c[0], 0], a: [80, 100], rot: 0 }, y: [14, 40], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [175, 0], a: [60, 25], rot: 0 }, y: [10, 28], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [CROSSING[0], 0], a: [70, 60], rot: 0.3 }, y: [40, 120], speed: 10 },
  { kind: 'crow', n: 5, loop: { c: [CROSSING[0], 0], a: [55, 45], rot: 0.4 }, y: [70, 40], speed: 8 },
];
const perches = [];
const spots = [[OVAL.c[0] - 10, 8], [OVAL.c[0] + 12, -14], [OVAL.c[0] - 4, 40], [OVAL.c[0] + 3, -40], [-40, -10], [-55, 18], [OVAL.c[0] + 50, 12], [OVAL.c[0] + 62, -20], [140, -16], [150, 16], [175, -18], [200, 17], [215, -16]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// pigeons and sparrows before the Borgo's fronts, where the baker's crumbs and the osteria's scraps fall
for (const r of rows()) for (const u of r.units) if (u.kind === 'casa' && (u.trade === 'baker' || u.trade === 'osteria' || u.seed % 3 === 0)) { const [x, z] = frontPt(r, u.u0 + u.w * 0.5, -2.2).at; perches.push({ kind: u.seed % 2 ? 'sparrow' : 'sparrow', x, z, y: height(x, z), rot: (x * 5) % 3, range: [1.6, 1.4] }); }
for (let a = 0; a < 6.28; a += 0.5) { const x = OVAL.c[0] + Math.cos(a) * OVAL.ax * 0.5, z = Math.sin(a) * OVAL.bz * 0.5; perches.push({ kind: 'sparrow', x, z, y: 0, rot: a, range: [2.4, 2.0] }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/baroque-rome.md §6d) ──
const critters = [];
const hash = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
// the pigeons of the piazza: grey, a few white and dark, walking and pecking on the paving about the obelisk, the fountains, the foot of the steps and the colonnade's feet
for (const [x, z] of [[OVAL.c[0] - 9, 7], [OVAL.c[0] - 11, 9.5], [OVAL.c[0] + 10, -12], [OVAL.c[0] + 12, -9.5], [OVAL.c[0] - 3, 36], [OVAL.c[0] + 4, -36], [OVAL.c[0] - 26, 3], [OVAL.c[0] - 28, -5],
  [FRONT_X + 58, 17], [FRONT_X + 60, -18], [FRONT_X + 64, -2], [OVAL.c[0] + 30, 24], [OVAL.c[0] + 33, 26], [OVAL.c[0] + 24, -30], [OVAL.c[0] - 50, 12], [-48, -28]]) {
  const k = hash(x, z), model = k < 0.15 ? 'pigeon_white' : k < 0.35 ? 'pigeon_dark' : 'pigeon_grey';
  critters.push({ model, at: [x, height(x, z), z], rot: k * 6.28, range: [3.2, 1.4], size: 0.95 + 0.1 * hash(z, x) });
}
// hens and a cock scratching in the alley between the spina's two rows and in the lane behind the baker's, where the scraps go
for (const [model, x, z, size] of [['rooster', 176.2, 0.2, 1], ['hen_brown', 177.6, -0.5, 1], ['hen_brown', 175.4, 0.9, 0.96], ['hen_white', 178.6, 0.6, 1]]) critters.push({ model, at: [x, height(x, z), z], rot: 0.4, range: [3.0, 1.0], size });
// cats asleep on the doorsteps of shops that can be entered, at the corner away from the door and out of its lane; dogs by the baker's and the osteria's fronts
{
  let n = 0;
  for (const s of openShops()) {
    if (s.kind !== 'row') continue;
    const r = s.row, u = s.unit, p = frontPt(r, u.u0 + (u.flip ? u.w - 0.35 : 0.35), -1.2).at, k = hash(u.seed, 3);
    if (s.trade === 'baker' || s.trade === 'osteria') critters.push({ model: 'dog', at: [p[0], height(p[0], p[1]), p[1]], rot: (r.face === 'n' ? 0 : Math.PI) + 0.6, range: [10, 4] });
    else if (k < 0.75 && n < 8) { n++; critters.push({ model: k < 0.4 ? 'cat_tabby' : 'cat_orange', at: [p[0], height(p[0], p[1]), p[1]], rot: (r.face === 'n' ? 0 : Math.PI) + 0.3, range: [8, 2.5] }); }
  }
}
// mallards on the Tiber's slack water by the west bank above the bridge, in loose company
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_white', 'duck_brown', 'duck_brown'], raft: true, area: [tiberX(-130) - 26, -150, tiberX(-110) + 4, -100], dist: (x, z) => Math.abs(x - tiberX(z)) - (TIBER.w / 2 - 4), a: [10, 3], ratio: 0.2, margin: 3, y: TIBER.level, speed: 0.2, cycle: [20, 26] });
export default { fish, flights, perches, critters };
