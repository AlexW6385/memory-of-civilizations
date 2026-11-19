// Renaissance Florence — the animals (src/engine/fauna.js draws them; docs/settlements/florence.md §10):
// carp and barbel in the Arno, swifts screaming over the roofs and the river, sparrows (and the town's
// pigeons, drawn as sparrows) on the paving of the squares, crows over the dome at twilight, a heron
// on the river's bank.
import { ARNO, PIAZZA_DUOMO, SIGNORIA, MERCATO, DUOMO, arnoZ, height } from './layout.js';
import { walkLots } from './walk.js';
import { ARRIVALS } from '../../planet/arrivals.js';

/** Negative inside the Arno's water (its middle line is arnoZ). */
const riverDist = (x, z) => Math.abs(z - arnoZ(x)) - (ARNO.w / 2 - 3);
const area = [-250, 0, 250, 0];

const fish = [];
for (let i = 0; i < 6; i++) {
  const x = -200 + i * 70, z = arnoZ(x);
  fish.push({ n: 2, size: [0.5, 0.75], palette: 'carp', y: ARNO.level, dist: riverDist, margin: 2, k: 1, rot: 0, area: [x - 20, z - 8, x + 20, z + 8], a: [18, 4], ratio: 0.2, minA: 1.5, speed: 0.35, rise: 0.1 });
}
void area;

const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-250, arnoZ(-250)], b: [250, arnoZ(250)] }, half: 22, y: [6, 24], speed: 11 },
  { kind: 'swallow', n: 4, loop: { c: [(SIGNORIA[0] + SIGNORIA[2]) / 2, (SIGNORIA[1] + SIGNORIA[3]) / 2], a: [50, 40], rot: 0.3 }, y: [14, 40], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [DUOMO.c[0] - 20, DUOMO.c[1]], a: [60, 40], rot: 0 }, y: [20, 60], speed: 10 },
  { kind: 'crow', n: 6, loop: { c: [DUOMO.c[0], DUOMO.c[1]], a: [50, 35], rot: 0.4 }, y: [45, 20], speed: 8 },
];

const perches = [];
const spots = [[-140, -20], [-100, -16], [-30, -16], [60, -12], [90, -18], [-150, -90], [20, 130], [20, 195], [70, 196], [100, 198], [-60, 50], [-40, 44], [-34, 62], [-70, 20], [-250, -130], [-230, -125]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: (x * 7 % 3), range: [1.8, 1.6] });
void PIAZZA_DUOMO; void MERCATO;
// a heron on the north bank of the Arno
{ const x = -90, z = arnoZ(x) - 36.5; perches.push({ kind: 'heron', x, z, y: height(x, z) + 0.0, rot: Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/florence.md §19) ──
const critters = [];
/** A point on a lot's front: u along it from its right-hand corner (as casa-open.js), out into the street by `out`; rot turns the animal's +z toward the street. */
function front(l, u, out) {
  const [x0, z0, x1, z1] = l.rect, f = l.front || 's';
  const P = f === 's' ? [x1 - u, z1 + out] : f === 'n' ? [x0 + u, z0 - out] : f === 'e' ? [x1 + out, z0 + u] : [x0 - out, z1 - u];
  const rot = f === 's' ? 0 : f === 'n' ? Math.PI : f === 'e' ? Math.PI / 2 : -Math.PI / 2;
  return { x: P[0], z: P[1], rot };
}
const lotL = (l) => (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]);
{
  // the lots on the walk by kind, in a fixed order of their own seeds; each animal takes the next lot of its kind that is wide enough and not yet used
  const A = ARRIVALS['florence'], ctr = (q) => [(q.rect[0] + q.rect[2]) / 2, (q.rect[1] + q.rect[3]) / 2];
  const on = walkLots(26).filter((l) => lotL(l) >= 5.5 && l.kind !== 'torre').sort((a, b) => Math.hypot(ctr(a)[0] - A[0], ctr(a)[1] - A[2]) - Math.hypot(ctr(b)[0] - A[0], ctr(b)[1] - A[2])), used = new Set();
  // (each the nearest lot of its kind to the arrival that lies 30 m or more from the lots already taken: the animals are spread along the walk)
  const take = (pred) => { const l = on.find((q) => !used.has(q) && pred(q) && [...used].every((u) => Math.hypot(ctr(u)[0] - ctr(q)[0], ctr(u)[1] - ctr(q)[1]) > 30)); if (l) used.add(l); return l; };
  // cats asleep on the pavement by the doors of the houses (the mousers of the shops and kitchens): in the sun at the foot of the wall, a metre out of the door's lane
  for (const kind of ['casa', 'bottega', 'casa', 'bottega', 'casa', 'palazzo']) {
    const l = take((q) => q.kind === kind); if (!l) continue;
    const L = lotL(l), p = front(l, L / 2 + (l.seed % 2 ? 1.5 : -1.5), 0.55);
    critters.push({ model: l.seed % 3 ? 'cat_tabby' : 'cat_orange', at: [p.x, height(p.x, p.z), p.z], rot: p.rot + 0.3, range: [8, 2.5] });
  }
  // dogs by the shops that feed them: the butchers' and bakers' fronts (dogs stood about the shambles; the trades are the lots' own), at the door's side
  for (const trade of ['bread', 'smith', 'wine']) {
    const l = take((q) => q.kind === 'bottega' && q.trade === trade) ?? take((q) => q.kind === 'bottega'); if (!l) continue;
    const p = front(l, lotL(l) / 2 + (l.seed % 2 ? -1.7 : 1.7), 0.9);
    critters.push({ model: 'dog', at: [p.x, height(p.x, p.z), p.z], rot: p.rot + 0.5, range: [10, 4] });
  }
  // two cages of songbirds (the goldfinch, the Florentines' pet) hung from the house fronts at the first floor's sill, at the corner away from the door and the lantern bracket
  for (const kind of ['casa', 'casa']) {
    const l = take((q) => q.kind === kind && q.storeys >= 3); if (!l) continue;
    const L = lotL(l), p = front(l, L * 0.28, 0.42);
    critters.push({ model: 'cagebird', at: [p.x, 3.15, p.z], rot: p.rot });
  }
}
// hens and a cock scratching in the Mercato Vecchio's open ground, east of the market hall where the poultry sellers set their baskets, the cock a little apart
for (const [model, x, z, size] of [['rooster', -36.2, 53.4, 1], ['hen_brown', -34.6, 54.4, 1], ['hen_brown', -35.8, 55.6, 0.96], ['hen_white', -37.4, 54.8, 1]]) critters.push({ model, at: [x, height(x, z), z], rot: 0.4, range: [3.4, 1.4], size });
// mallards on the Arno above the weir west of the bridge, in loose company (the river is shallow and slow there)
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_white', 'duck_brown', 'duck_brown'], raft: true, area: [-215, 240, -70, 292], dist: riverDist, a: [14, 3.2], ratio: 0.18, margin: 3, y: ARNO.level, speed: 0.2, cycle: [20, 26] });

export default { fish, flights, perches, critters };
