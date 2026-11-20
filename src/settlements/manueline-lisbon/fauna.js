// Manueline Lisbon — the animals (src/engine/fauna.js; docs/settlements/manueline-lisbon.md §9): sardines and mullet in the Tagus
// along the quay, gulls and swifts over the river and the roofs, kites over the Alfama and the castle, sparrows on the paving,
// an egret on the shore of Belém.
import { SEA, GROUND, QUAY, HILL, RADIUS, TERREIRO, YARD, shore, height, wet, lots } from './layout.js';

const inWater = (x, z) => wet(x, z);
const fish = [];
for (let i = 0; i < 7; i++) fish.push({ n: 4, size: [0.2, 0.4], palette: 'carp', y: SEA, area: [-160 + i * 60, 108, -110 + i * 60, 135], dist: inWater, margin: 1.5, a: [12, 5], ratio: 0.3, speed: 0.4, rise: 0.25 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [-250, 90], b: [280, 90] }, y: [2, 18], speed: 9, half: 30 },
  { kind: 'swallow', n: 5, lane: { a: [-250, 20], b: [280, 20] }, y: [6, 20], speed: 8, half: 14 },
  { kind: 'swallow', n: 4, lane: { a: [-206, 30], b: [-206, 130] }, y: [8, 28], speed: 8, half: 10 },
  { kind: 'swallow', n: 4, lane: { a: [-130, -4], b: [200, -4] }, y: [6, 18], speed: 8, half: 6 },
  { kind: 'crow', n: 6, loop: { c: [-245, 175], a: [40, 30], rot: 0.2 }, y: [10, 26], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [HILL.c[0], HILL.c[1]], a: [60, 50], rot: 0.3 }, y: [70, 42], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [30, 140], a: [120, 40], rot: 0.1 }, y: [24, 40], speed: 8 },
];
const perches = [];
for (const [x, z] of [[-60, 98], [20, 98], [100, 98], [200, 98], [90, 60], [-200, 80], [-215, 100], [-100, -30], [-70, -40], [110, 28], [240, 40]]) perches.push({ kind: 'sparrow', x, z, y: GROUND + 0.1, rot: x * 0.07, range: [1.5, 1.3] });
{ let k = 0; for (const l of lots()) { if (l.kind === 'yard' || ++k % 6) continue; const [x0, z0, x1, z1] = l.rect; const fz = l.front === 'n' ? z0 - 1.5 : z1 + 1.5; perches.push({ kind: 'sparrow', x: (x0 + x1) / 2, z: fz, y: l.y + 0.05, rot: l.seed * 0.01, range: [1.5, 1.2] }); } }
for (const x of [-230, -140]) perches.push({ kind: 'egret', x, z: shoreZ(x) - 1.2, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
perches.push({ kind: 'egret', x: -170, z: shoreZ(-170) - 1.5, y: GROUND, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
function shoreZ(x) { for (let z = 140; z > 40; z--) if (wet(x, z) > 1) return z; return 100; }
void QUAY; void RADIUS;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs §13.3) ──
// Facing: a critter's forward is (cos rot, sin rot) in (x, z): 0 east, π/2 south, π west.
const critters = [];
const hash = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
const PAVED = GROUND + 0.05;                                         // the plaza's paving (plan.js: floor y g = GROUND + 0.05)
/** The street front of a lot: the point u metres along its front (from its west or north corner) and `out` metres out into the street, and the yaw that faces the street. */
function frontPoint(l, u, out) {
  const [x0, z0, x1, z1] = l.rect;
  return l.front === 'n' ? { x: x0 + u, z: z0 - out, rot: -Math.PI / 2 } : { x: x0 + u, z: z1 + out, rot: Math.PI / 2 };
}
const plazaOpen = lots().filter((l) => l.plazaRow && l.open);
// cats at the foot of the quoin beside a shop front, on the pavement and clear of the doorway (the door and its step span 3.2 m about the front's middle, so u 1.0 from the corner is out of it): three on the plaza's rows, three on the Rua Nova
for (const [i, l] of [plazaOpen[1], plazaOpen[4], plazaOpen[7]].entries()) if (l) { const p = frontPoint(l, 1.0, 0.6); critters.push({ model: i === 1 ? 'cat_orange' : 'cat_tabby', at: [p.x, PAVED + 0.01, p.z], rot: p.rot + (hash(p.x, p.z) - 0.5) * 0.6, range: [7, 2.5] }); }
{
  const nova = lots().filter((l) => l.nova && l.open && l.kind === 'merchant' && l.rect[0] > -125 && l.rect[2] < 120).sort((a, b) => a.rect[0] - b.rect[0]);
  for (const k of [1, 4, 7]) { const l = nova[k]; if (!l) continue; const p = frontPoint(l, 1.0, 0.6); critters.push({ model: k === 4 ? 'cat_orange' : 'cat_tabby', at: [p.x, height(p.x, p.z) + 0.04, p.z], rot: p.rot + (hash(p.x, p.z) - 0.5) * 0.6, range: [7, 2.5] }); }
}
// dogs: one at the far corner of a plaza home's front, one at an Alfama home's door (off its 3 m), one at the yard's gate (a watch dog of the chandlers' stores)
{
  const l = plazaOpen.find((q) => q.use === 'home' && q.kind === 'alfama');
  if (l) { const p = frontPoint(l, l.w - 0.7, 0.8); critters.push({ model: 'dog', at: [p.x, PAVED + 0.01, p.z], rot: p.rot, range: [9, 3.5] }); }
  const a = lots().filter((q) => q.open && q.kind === 'alfama' && !q.plazaRow).sort((p, q) => p.rect[0] - q.rect[0])[1];
  if (a) { const p = frontPoint(a, a.w - 0.8, 0.8); critters.push({ model: 'dog', at: [p.x, height(p.x, p.z) + 0.04, p.z], rot: p.rot, range: [9, 3.5] }); }
  critters.push({ model: 'dog', at: [YARD[0] + 3.5, height(YARD[0] + 3.5, 36) + 0.04, 36], rot: 0, range: [9, 3.5] });
}
// hens and a rooster at the edge of the lane between the plaza's first two rows of houses (the lane is z 62 to 68; they start 2.4 m from the wall and range 2 m (the rooster 1.4 m), so never against the wall and never past the lane's far side)
for (const [model, x, d] of [['rooster', -150.4, 1.9], ['hen_brown', -152.0, 2.4], ['hen_brown', -148.6, 2.5], ['hen_white', -146.2, 2.4], ['hen_white', -144.0, 2.5]]) critters.push({ model, at: [x, PAVED + 0.02, 62 + d], rot: hash(x, d) * 6.28, range: model === 'rooster' ? [1.4, 0.9] : [2.0, 0.9], size: 0.96 + 0.08 * hash(d, x) });
// pigeons on the Terreiro's flags about the fountain at its middle and by the stalls
for (const [model, x, z] of [['pigeon_grey', 98, 70], ['pigeon_grey', 101, 72], ['pigeon_dark', 96, 73], ['pigeon_white', 104, 71.5], ['pigeon_grey', 108, 74]]) critters.push({ model, at: [x, GROUND + 0.05, z], rot: hash(x, z) * 6.28, range: [3.0, 1.0] });
// geese on the sand at Belém by the hauled-up boats, and farm ducks in the shallows (the beach is the one bank without a quay)
// (between the hauled-up boats at x −193 and −176, which are 8 m long: the gap is x −189 to −180)
for (const [model, x] of [['goose_white', -186.5], ['goose_grey', -184.6], ['goose_white', -182.7]]) { const z = shore(x) - 6.5; critters.push({ model, at: [x, height(x, z) + 0.02, z], rot: hash(x, z) * 6.28, range: [1.5, 0.8] }); }
critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown', 'duck_white', 'duck_brown'], raft: true, area: [-205, shore(-205) + 3, -150, shore(-150) + 16], dist: (x, z) => wet(x, z), a: [9, 4], ratio: 0.4, margin: 1.4, y: SEA, speed: 0.18, cycle: [26, 34] });
// goats on the Alfama's slope beside the lane of the first open home above the Sé
{
  const g = lots().filter((q) => q.open && q.kind === 'alfama' && !q.plazaRow).sort((p, q) => q.rect[0] - p.rect[0])[0];
  if (g) for (const [model, dx] of [['goat_white', 1.2], ['goat_black', 2.4]]) { const p = frontPoint(g, g.w * 0.1 + dx, 1.8); critters.push({ model, at: [p.x, height(p.x, p.z) + 0.03, p.z], rot: p.rot + 0.5 * dx, range: [8, 3.0] }); }
}
void TERREIRO;
export default { fish, flights, perches, critters };
