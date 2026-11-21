// Stonehenge — the animals (src/engine/fauna.js draws them; docs/settlements/stonehenge.md §10b): rooks and crows (corvids
// followed the feasts and the herds) circling the camp and the Southern Circle, a few over the stones; swallows (summer visitors
// to the down) low over the grass; sparrows (the engine's small bird, standing in for the larks and pipits of the down) on the
// bare trodden chalk of the Avenue and the Durrington avenue. The down has no water: no fish, no egret.
import { AXIS, DURR, VILLAGE, HEEL, height, houses, OPEN } from './layout.js';
import { feast, soundSpots } from './town.js';

const ax = Math.cos(AXIS), az = Math.sin(AXIS), A = (s, t) => [s * ax - t * az, s * az + t * ax];
const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 0], a: [60, 45], rot: 0.3 }, y: [3, 16], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: A(160, 0), a: [90, 40], rot: AXIS }, y: [2, 10], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [VILLAGE.c[0], VILLAGE.c[1]], a: [80, 60], rot: 0.5 }, y: [3, 14], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: A(125, -40), a: [50, 35], rot: 0.2 }, y: [14, 30], speed: 8 },
  { kind: 'crow', n: 6, loop: { c: [DURR.c[0], DURR.c[1]], a: [70, 55], rot: 0.9 }, y: [18, 40], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [0, 0], a: [40, 40], rot: 0 }, y: [10, 20], speed: 7 },
];
const perches = [];
// on the trodden chalk of the Avenue and the avenue at Durrington, hopping about a spot
for (const [s, t] of [[70, 4], [96, -5], [130, 3], [165, -4], [200, 5], [240, -3], [290, 2]]) { const [x, z] = A(s, t); perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: AXIS + 1.2 + s % 3, range: [1.6, 1.4] }); }
for (const s of [40, 70, 100]) { const x = DURR.c[0] + DURR.dir[0] * s + 3, z = DURR.c[1] + DURR.dir[1] * s - 3; perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: s % 3, range: [1.8, 1.6] }); }
// on the ground by the Heel Stone's ring ditch
{ const [x, z] = A(HEEL.d + 6, -5); perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: 0.8, range: [1.4, 1.2] }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §14) ──
// Only what the down and the village had about 2500 BC: dogs (the Neolithic dog, a medium hound-like village dog), pigs (the feast's animals, small, long-snouted and
// dark, close to the boar) lying and rooting among the houses and about the middens, rooks and crows walking and pecking on the refuse and the trodden chalk (corvids
// followed the feasts and the herds). No cat (no domestic cat in Britain until the Roman period), hen or rooster (the domestic fowl came about 800 BC), goose, horse or
// donkey [inferred from these dates: no source cited here].
const critters = [];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const r4 = rng(4141), H = houses();
const frame = (h) => { const c = Math.cos(h.yaw), s = Math.sin(h.yaw); return (u, v) => [h.c[0] + u * c - v * s, h.c[1] + u * s + v * c]; };
const on = ([x, z], dy = 0.02) => [x, height(x, z) + dy, z];
// a dog lying beside the door of each second open house (seven), off the doorway's lane (the yard's lane is 1.2 m either side of the middle)
H.forEach((h, i) => {
  if (!OPEN.includes(i) || OPEN.indexOf(i) % 2) return;
  const F = frame(h), hw = h.s / 2, sd = i % 2 ? 1 : -1;
  critters.push({ model: 'dog', at: on(F(sd * (hw - 0.2), hw + 1.1), 0.02), rot: r4() * 6.28, range: [9, 3.5] });
});
// pigs beside the walls of the houses that are not open (rooting in the yards: one in three houses), the pale ones now and then
H.forEach((h, i) => {
  if (OPEN.includes(i) || i % 4) return;
  const F = frame(h), hw = h.s / 2, sd = r4() < 0.5 ? -1 : 1;
  critters.push({ model: r4() < 0.25 ? 'pig_pale' : 'pig_dark', at: on(F(sd * (hw + 1.5), -0.4 + r4())), rot: r4() * 6.28, range: [9, 3.5] });
});
// the middens: two pigs rooting in each and three rooks and a crow walking and pecking on the refuse
for (const p of feast()) for (const e of p.elements) if (e.t === 'midden') {
  const [x, z] = e.c;
  for (let k = 0; k < 2; k++) { const a = k * 3.1 + r4(); critters.push({ model: k ? 'pig_pale' : 'pig_dark', at: on([x + Math.cos(a) * (e.r + 1.4), z + Math.sin(a) * (e.r + 1.4)]), rot: a + 1.6, range: [9, 3.5] }); }
  for (let k = 0; k < 4; k++) { const a = k * 1.7 + r4(); critters.push({ model: 'rook', at: on([x + Math.cos(a) * (e.r * 0.6 + 0.3), z + Math.sin(a) * (e.r * 0.6 + 0.3)], 0.2), rot: a * 2, range: [3, 2.2], tau: 12 + k * 3 }); }
}
// rooks about the open fires of the feast (the scraps), on the trodden chalk of the Avenue by the Heel Stone, and on the ground by the dressing of the sarsen
soundSpots().fires.filter((f) => f.pig).slice(0, 5).forEach((f, i) => { for (let k = 0; k < 2; k++) { const a = i * 2 + k * 3.3; critters.push({ model: 'rook', at: on([f.at[0] + Math.cos(a) * 4.4, f.at[1] + Math.sin(a) * 4.4]), rot: a, range: [3, 2.2] }); } });
for (const [s, t] of [[84, 6], [88, -6.2], [52, 7.4]]) { const [x, z] = A(s, t); critters.push({ model: 'rook', at: on([x, z]), rot: s, range: [3, 2.2] }); }
export default { fish, flights, perches, critters };
