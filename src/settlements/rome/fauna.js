// Rome under Hadrian — the animals (src/engine/fauna.js; dossier §11): swifts and swallows over the roofs and the
// Via Lata, pigeons (drawn as sparrows) on the paving of the forum and the Pantheon's forecourt, sparrows at the shop
// fronts, crows over the Stadium, egrets on the Tiber's banks. Places derive from layout.js.
import { ground } from './ground.js';
import { RADIUS, FORUM, PANTHEON, STADIUM, VIA_LATA, TIBER, height, rows, riverX, riverEdge, SAEPTA, BATHS, INN, gardens } from './layout.js';
import { DOMUS } from './life.js';

const fish = [];
// carp and barbel of the Tiber, loose schools over the middle of the stream (the water's centre line from layout.js)
for (let k = 0; k < 6; k++) fish.push({ n: 3, size: [0.4, 0.7], palette: k % 2 ? 'carp' : 'redcarp', y: TIBER.level - 0.45, area: [riverX(-60) - 14, -60, riverX(120) + 14, 120], dist: (x, z) => Math.max(Math.abs(x - riverX(z)) - (TIBER.w / 2 - 3), Math.hypot(x, z) - (RADIUS - 36)), margin: 3.0, a: [12 + k * 2, 5], ratio: 0.3, speed: 0.35, rise: 0.2 });
const flights = [
  { kind: 'swallow', n: 6, lane: { a: [VIA_LATA.x, -250], b: [VIA_LATA.x, 250] }, y: [4, 22], speed: 10, a: [26, 10] },
  { kind: 'swallow', n: 5, loop: { c: [0, 90], a: [90, 50], rot: 0.3 }, y: [14, 40], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-110, -112], a: [60, 40], rot: 0 }, y: [12, 30], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [(SAEPTA[0] + SAEPTA[2]) / 2, -70], a: [40, 120], rot: 0 }, y: [10, 30], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [(BATHS[0] + BATHS[2]) / 2, 100], a: [80, 40], rot: 0.2 }, y: [18, 40], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [-300, 40], a: [60, 90], rot: 0 }, y: [4, 14], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [(STADIUM[0] + STADIUM[2]) / 2, 0], a: [90, 120], rot: 0.1 }, y: [30, 60], speed: 8 },
];
const perches = [];
const i0 = (e) => Math.floor(Math.abs(e[1])) % 2 === 0;
const spots = [[(FORUM[0] + FORUM[2]) / 2, (FORUM[1] + FORUM[3]) / 2 - 8], [-100, -125], [-70, -100], [-90, -150], [0, -110], [14, -90], [-14, -75], [30, -120], [-30, -130], [VIA_LATA.x - 6, -60], [VIA_LATA.x + 6, 30], [VIA_LATA.x, 110], [-40, -172], [60, -176], [-100, 163], [20, 168]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.02, rot: (x * 7) % 3, range: [1.8, 1.6] });
// egrets on the Tiber's near bank
for (const z of [-60, 70, 160]) { const x = TIBER.x + 28 * Math.sin(z / 120) + TIBER.w / 2 + 2; perches.push({ kind: 'egret', x, z, y: height(x, z), rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 }); }
// sparrows at the shop fronts (every third row of the Via Lata and the street before the Pantheon), on the thresholds and the awning poles
rows().forEach((r, i) => {
  if (i % 3) return;
  const [x0, z0, x1, z1] = r.rect, f = r.front, x = f === 'e' ? x1 + 0.8 : f === 'w' ? x0 - 0.8 : (x0 + x1) / 2, z = f === 's' ? z1 + 0.8 : (z0 + z1) / 2;
  perches.push({ kind: 'sparrow', x, z, y: height(x, z) + 0.05, rot: f === 'e' || f === 'w' ? Math.PI / 2 : 0, range: [1.6, 0.4], alert: 4 });
});
// herons and egrets on the quay's edge and its mooring stones; pigeons about the baths' palaestrae and the Saepta's court
for (const e of riverEdge(1).filter((_, i) => i % 9 === 4)) perches.push({ kind: i0(e) ? 'heron' : 'egret', x: e[0] + 1.5, z: e[1], y: 0.62, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 12 });
for (const [x, z] of [[(BATHS[0] + BATHS[2]) / 2 - 50, 99], [(BATHS[0] + BATHS[2]) / 2 + 50, 99], [(SAEPTA[0] + SAEPTA[2]) / 2, -150], [(SAEPTA[0] + SAEPTA[2]) / 2, -30], [(SAEPTA[0] + SAEPTA[2]) / 2, 50]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: 1.2, range: [2.2, 1.6] });

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §4.20) ──
// Facing: a critter's forward is (cos rot, sin rot) in (x, z): 0 east, π/2 south, π west.
const critters = [];
const hash = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
// cats curled at the foot of a pier between two shops of a row, on the pavement (the piers stand 4.4 m apart, 0.6 m wide, so the cat is out of every doorway's width of
// 1.5 m and more), facing the street: one row in five by the position of the row, never more than six
{
  const fronts = { e: (r, u) => [r[2] + 0.3, r[1] + u, 0], w: (r, u) => [r[0] - 0.3, r[1] + u, Math.PI], s: (r, u) => [r[0] + u, r[3] + 0.3, Math.PI / 2] };
  let n = 0;
  for (const r of rows()) {
    const h = hash(r.rect[0], r.rect[1]);
    if (h > 0.21 || n >= 6) continue;
    const [x, z, rot] = fronts[r.front](r.rect, 4.4 * (1 + Math.floor(hash(r.rect[1], r.rect[0]) * 4)));
    critters.push({ model: h < 0.1 ? 'cat_tabby' : 'cat_orange', at: [x, ground.height(x, z) + 0.01, z], rot: rot + (hash(x, z) - 0.5) * 0.5, range: [7, 2.5] });
    n++;
  }
}
// a cat asleep on the coping of the wall of the walled garden nearest the arrival (the wall is 2.8 m high with a 0.15 m cap of tiles)
{
  const g = gardens().filter((q) => q.rect[0] > -80 && q.rect[0] < 0 && q.rect[1] < -200)[0];
  if (g) critters.push({ model: 'cat_tabby', at: [(g.rect[0] + g.rect[2]) / 2 + 3, 2.8 + 0.15, g.rect[3] - 0.25], rot: Math.PI / 2, range: [7, 2.5] });
}
// the dog of the atrium house, by the jamb of its street door (cave canem: the mosaic of the dog is stated for Pompeii; the live dog is [inferred]): off the 1.6 m of the door itself
{
  const mx = (DOMUS[0] + DOMUS[2]) / 2;
  critters.push({ model: 'dog', at: [mx - 1.6, 0, DOMUS[3] + 0.6], rot: Math.PI / 2, range: [9, 3.5] });
}
// hens and a rooster in the court of the inn, between the passage door and the well but off the line between them (u 9.5…12.5 stays clear), and one pair at the east side
for (const [model, u, d] of [['rooster', 6.8, 11.2], ['hen_brown', 5.6, 11.0], ['hen_brown', 6.8, 11.8], ['hen_white', 4.4, 11.6], ['hen_white', 16.0, 11.2], ['hen_brown', 17.2, 11.8]]) {
  const x = INN[0] + u, z = INN[3] - d;
  critters.push({ model, at: [x, 0.02, z], rot: hash(x, z) * 6.28, range: model === 'rooster' ? [1.4, 0.9] : [2.0, 0.9], size: 0.96 + 0.08 * hash(z, x) });
}
// a songbird in a cage hung under the lintel of the inn's bar door, off the door's width (Martial, Epigrams 14: caged birds are his gifts)
{
  const [u, d] = [0.85, -0.3];
  critters.push({ model: 'cagebird', at: [INN[0] + u, 2.55, INN[3] - d], rot: Math.PI / 2 });
}
// farm ducks on the Tiber by the landing where the steps go down to the water, and a kingfisher on a mooring stone of the quay
{
  const E = riverEdge(1), w = (x, z) => Math.abs(x - riverX(z)) - (TIBER.w / 2 - 1.4);
  if (E[14]) critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_white', 'duck_brown', 'duck_brown', 'duck_white'], raft: true, area: [E[14][0] - 14, E[14][1] - 12, E[14][0] - 3, E[14][1] + 12], dist: w, a: [9, 4], ratio: 0.4, margin: 1.2, y: TIBER.level, speed: 0.18, cycle: [26, 34] });
  if (E[17]) critters.push({ model: 'kingfisher', at: [E[17][0] + 1.5, 0.61, E[17][1]], rot: Math.PI, water: [E[17][0] - 3.0, E[17][1], TIBER.level], cycle: 34 });
}
void PANTHEON;
export default { fish, flights, perches, critters };
