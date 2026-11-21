// Lalibela — the animals (src/engine/fauna.js; docs/settlements/lalibela.md §14): swallows hawking over the
// pits and the village (they nest in the hewn rock), thick-billed ravens high over the plateau, house
// sparrows on the rims of the pits and the roofs of the churches. All places come from layout.js.
import { PITS, PRECINCT, compounds, slope, enterable, houses } from './layout.js';

const c = (p) => [(p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2];
const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: c(PITS.giyorgis), a: [34, 30], rot: 0.3 }, y: [2, 14], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: c(PITS.medhane), a: [46, 34], rot: 0 }, y: [3, 16], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [60, 40], a: [60, 40], rot: 0.5 }, y: [4, 18], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-120, 40], a: [60, 50], rot: 0.2 }, y: [6, 22], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [0, 0], a: [190, 140], rot: 0.4 }, y: [38, 70], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [-140, 90], a: [90, 70], rot: 1.1 }, y: [30, 55], speed: 8 },
];
const perches = [];
const rim = (p, k, o = 1.2) => { const [x0, z0, x1, z1] = p.rect; return [[x0 + (x1 - x0) * k, z0 - o], [x0 + (x1 - x0) * (1 - k), z1 + o], [x0 - o, z0 + (z1 - z0) * k], [x1 + o, z0 + (z1 - z0) * (1 - k)]]; };
for (const [id, k] of [['giyorgis', 0.3], ['medhane', 0.25], ['maryam', 0.4], ['golgotha', 0.3], ['amanuel', 0.4], ['gabriel', 0.5], ['mercoreus', 0.4]]) for (const [x, z] of rim(PITS[id], k)) perches.push({ kind: 'sparrow', x, z, y: 0.12, rot: x * 3 % 3, range: [1.6, 1.4] });
// on Medhane Alem's roof (its ridge at the precinct's level less a hand) and Maryam's
for (const [x, z] of [[-4, -90], [24, -92], [8, -100]]) perches.push({ kind: 'sparrow', x, z, y: -0.35, rot: 0.4, range: [1.2, 0.8] });
// in the village, by the houses at the edge of the level ground
for (const [x, z] of [[-250, 40], [250, -60], [150, 200], [-120, -210], [60, 215], [-180, -150]]) perches.push({ kind: 'sparrow', x, z, y: 0.05 + Math.max(0, Math.hypot(x, z) - PRECINCT) * 0.16, rot: x % 3, range: [1.6, 1.4] });
// sparrows on the walls of the compounds (every fourth yard), doves on the granaries' thatch
compounds().forEach((q, i) => {
  if (i % 4) return;
  const a = q.gate + 2.2 + (i % 5) * 0.4, x = q.c[0] + Math.cos(a) * q.R, z = q.c[1] + Math.sin(a) * q.R;
  perches.push({ kind: 'sparrow', x, z, y: slope(x, z) + 0.9, rot: a, range: [1.4, 1.2] });
  if (q.granary && i % 8 === 0) perches.push({ kind: 'sparrow', x: q.granary[0], z: q.granary[1], y: slope(q.granary[0], q.granary[1]) + 2.5, rot: a, range: [0.5, 0.4] });
});
flights.push({ kind: 'swallow', n: 4, loop: { c: [-120, -60], a: [70, 50], rot: 0.7 }, y: [3, 14], speed: 9 }, { kind: 'swallow', n: 4, loop: { c: [120, 90], a: [70, 50], rot: 0.2 }, y: [3, 14], speed: 9 }, { kind: 'crow', n: 3, loop: { c: [-210, 30], a: [60, 50], rot: 0.4 }, y: [20, 40], speed: 7 });

// ── the critters: animals with a rig of their own (src/engine/fauna-critters.js; dossier §21) ──
// Dogs lying in the yards of the opened houses nearest the arrival, cats on their doorsteps, hens and a rooster scratching in others' yards, goats tethered by the pens,
// rock doves on the floors of the churches' courts. All beside the way from the gate to a door, never on it (the yard keeps that lane clear). [inferred]
const critters = [];
{
  const E = enterable().slice(0, 12), at = (h, d, sd) => { const u = [Math.cos(h.door), Math.sin(h.door)], t = [-u[1], u[0]], x = h.c[0] + u[0] * d + t[0] * sd, z = h.c[1] + u[1] * d + t[1] * sd; return [x, slope(x, z) + 0.02, z]; };
  const all = houses(), room = (p, m) => !all.some((o) => Math.hypot(o.c[0] - p[0], o.c[1] - p[2]) < o.r + m);
  // (a place is taken on the side of the door where nothing else stands within the animal's range)
  const put = (h, i, d, sd, m) => { const a = at(h, d, sd), b = at(h, d, -sd); return room(a, m) ? a : room(b, m) ? b : null; };
  E.forEach((h, i) => {
    if (i % 4 === 0) { const p = put(h, i, h.r + 1.7, 3.3, 1.2); if (p) critters.push({ model: 'dog', at: p, rot: i, range: [9, 3.5] }); }
    else if (i % 4 === 1) { const p = put(h, i, h.r + 2.4, 3.0, 1.2); if (p) critters.push({ model: 'cat_tabby', at: p, rot: i * 2, range: [7, 2.5] }); }
    else if (i % 4 === 2) { const p = put(h, i, h.r + 3.2, 4.2, 3.0); if (p) critters.push({ model: 'hen_brown', at: p, rot: i, range: [2.0, 1.4] }, { model: 'hen_white', at: [p[0] + 0.5, p[1], p[2] + 0.4], rot: i + 2, range: [2.0, 1.4] }, { model: 'rooster', at: [p[0] - 0.4, p[1], p[2] + 0.7], rot: i + 4, range: [2.0, 1.4] }); }
    else { const p = put(h, i, h.r + 4.5, 4.6, 1.5); if (p) critters.push({ model: i % 8 === 3 ? 'goat_black' : 'goat_white', at: p, rot: i * 3, range: [9, 3.2] }); }
  });
  const dove = (id, dx, dz, m) => { const p = PITS[id], c = [(p.rect[0] + p.rect[2]) / 2 + dx, (p.rect[1] + p.rect[3]) / 2 + dz]; critters.push({ model: m, at: [c[0], -p.depth + 0.2, c[1]], rot: dx, range: [1.4, 1.2] }); };
  dove('giyorgis', -15.5, 9.5, 'pigeon_grey'); dove('giyorgis', -15.0, 10.4, 'pigeon_white'); dove('medhane', -20.6, 8.2, 'pigeon_grey'); dove('medhane', -20.0, 9.0, 'pigeon_grey'); dove('maryam', -10.5, 6.4, 'pigeon_white'); dove('maryam', -10.0, 7.2, 'pigeon_grey');
}
export default { fish, flights, perches, critters };
