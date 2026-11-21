// SG̱ang Gwaay — the animals (src/engine/fauna.js draws them; docs/settlements/sgang-gwaay.md §9): ravens (crows) over the village and
// the forest edge, more of them about the poles, small birds (sparrow stand-ins: wrens and juncos) on the drying racks and the
// logs of the beach, a heron (the great blue) on the rocks at the shore's end, small dark fish in the bay.
import { SEA, height, shoreX, houses, village, toWorld } from './layout.js';
import { yards } from './yards.js';

const fish = [];
for (const z of [-130, -90, -30, 40, 100, 140]) fish.push({ n: 3, size: [0.25, 0.45], palette: 'carp', y: SEA, dist: (x, zz) => height(x, zz) - SEA + 1.2, margin: 0.5, k: 1, rot: 0, area: [shoreX(z) + 16, z - 6, shoreX(z) + 30, z + 6], a: [9, 4], ratio: 0.3, minA: 1.5, speed: 0.5, rise: 0.12 });
const flights = [
  { kind: 'crow', n: 5, loop: { c: [10, 0], a: [60, 90], rot: 0.2 }, y: [14, 40], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [30, 60], a: [40, 30], rot: 0.6 }, y: [8, 22], speed: 7 },
  { kind: 'crow', n: 4, loop: { c: [60, -90], a: [40, 40], rot: 1.0 }, y: [10, 30], speed: 7 },
  { kind: 'crow', n: 3, loop: { c: [40, 100], a: [35, 40], rot: 0.3 }, y: [6, 18], speed: 7 },
  { kind: 'swallow', n: 4, lane: { a: [40, -150], b: [40, 150] }, y: [0.8, 4], speed: 9 },
];
flights.push({ kind: 'crow', n: 3, loop: { c: [36, 4], a: [26, 22], rot: 0.5 }, y: [5, 16], speed: 6 });        // ravens over the street before the landmark house
flights.push({ kind: 'eagle', n: 1, loop: { c: [20, -30], a: [70, 55], rot: 0.1 }, y: [45, 75], speed: 6 }, { kind: 'eagle', n: 1, loop: { c: [30, 80], a: [60, 50], rot: 0.8 }, y: [40, 65], speed: 6 });
flights.find((f) => f.kind === 'swallow').a = [30, 4];
const perches = [];
const v = village();
for (const r of v.racks) perches.push({ kind: 'sparrow', x: r.c[0], z: r.c[1] + 0.4, y: height(...r.c) + 2.85, rot: r.yaw, range: [r.w * 0.4, 0] , alert: 6 });
for (const l of v.logs.slice(0, 6)) perches.push({ kind: 'sparrow', x: l.c[0], z: l.c[1], y: height(...l.c) + 0.5, rot: l.yaw, range: [1.5, 0.3] });
for (const h of houses().slice(0, 8)) perches.push({ kind: 'sparrow', x: h.c[0], z: h.c[1], y: 1 + h.ridge + 0.2, rot: h.yaw, range: [0, 2], alert: 6 });
// small birds (wrens, juncos) on the pole tops and the mortuary chests; gulls (the pale egret stand-in) on the logs, the canoes' bows and the stakes of the weirs
for (const p of v.poles.slice(0, 14)) perches.push({ kind: 'sparrow', x: p.c[0], z: p.c[1], y: height(...p.c) + (p.kind === 'memorial' ? p.h + 0.2 : p.h * 0.75 + 0.9), rot: p.yaw, range: [0.25, 0.1], alert: 7 });
for (const l of v.logs.slice(6)) perches.push({ kind: 'egret', x: l.c[0], z: l.c[1], y: height(...l.c) + 0.62, rot: l.yaw, range: [0.8, 0.2], stay: [30, 120], gone: [40, 110], alert: 9 });
for (const c of v.canoes.filter((q) => !q.moored).slice(0, 5)) perches.push({ kind: 'egret', x: c.c[0] - c.l / 2 - 0.3, z: c.c[1], y: height(...c.c) + 1.1, rot: Math.PI / 2, range: [0.1, 0.1], stay: [30, 120], gone: [40, 110], alert: 8 });
for (const y of yards().props.filter((q) => q.kind === 'weir')) perches.push({ kind: 'egret', x: y.c[0], z: y.c[1] + 0.5, y: y.y + 1.2, rot: y.yaw, range: [0.3, 0.1], stay: [30, 120], gone: [40, 110], alert: 10 });
{ const z = 150, x = shoreX(z) + 1.5; perches.push({ kind: 'heron', x, z, y: height(x, z), rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 12 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §11d) ──
// Only what the island had about 1850: village dogs asleep by the doors, ravens (the rook's rig stands in) and gulls walking the beach wrack and the middens,
// geese on the beach at the north end, a heron in the shallows at the south end, cormorants on the weir stakes, a kingfisher on the shore, harlequin-like ducks
// afloat in the bay (the brown duck's rig). No hen, cat, horse or goat: none of them lived there then [inferred].
const critters = [];
const Hs = houses(), Y = yards();
for (const h of Hs.filter((q) => q.i % 3 !== 1)) {            // a dog asleep beside the doorway, off the lane that is kept clear
  const sg = h.i % 2 ? 1 : -1, [x, z] = toWorld(h, sg * 2.7, -h.d / 2 - 2.3);
  if (height(x, z) > 0.6) critters.push({ model: 'dog', at: [x, height(x, z) + 0.02, z], rot: h.yaw + 1.2 + h.i, range: [9, 3.5] });
}
for (const p of Y.props.filter((q) => (q.kind === 'midden' || q.kind === 'clams') && height(q.c[0] + 1.3, q.c[1] + 0.6) > 0.4).slice(0, 10)) {    // ravens and gulls at the shell heaps and clam baskets
  const q = p.c, m = (p.seed % 3 === 0) ? 'gull_silver' : 'rook';
  critters.push({ model: m, at: [q[0] + 1.3, height(q[0] + 1.3, q[1]) + 0.02, q[1] + 0.6], rot: p.seed % 6, range: [1.8, 2.2] });
}
for (const l of v.logs.filter((q) => height(q.c[0] - 1.2, q.c[1] + 0.9) > 0.3).slice(0, 5)) critters.push({ model: 'gull_silver', at: [l.c[0] - 1.2, height(l.c[0] - 1.2, l.c[1]) + 0.02, l.c[1] + 0.9], rot: l.yaw, range: [1.8, 2.2] });
for (const [dz, k] of [[0, 0], [1.4, 1], [-1.2, 2]]) { const z = -142 + dz, x = shoreX(z) - 3 + dz * 0.3; critters.push({ model: k === 1 ? 'goose_white' : 'goose_grey', at: [x, height(x, z) + 0.02, z], rot: 1.4 + k, range: [3, 1.8] }); }
{ const z = -152, x = shoreX(z) + 0.6; critters.push({ model: 'crane', at: [x, Math.max(height(x, z), SEA + 0.1), z], rot: Math.PI / 2, range: [3, 1.2], tau: 50, speed: 0.4 }); }
for (const w of Y.props.filter((q) => q.kind === 'weir').slice(0, 3)) critters.push({ model: 'cormorant', at: [w.c[0], w.y + 1.2, w.c[1] + 0.5], rot: Math.PI / 2, cycle: 30 + (w.seed % 9) });
for (const z of [-96, 62]) { const x = shoreX(z) - 0.6; critters.push({ model: 'kingfisher', at: [x, height(x, z) + 0.05, z], rot: Math.PI / 2, water: [x + 2.6, z, SEA], cycle: 34 + (z % 5) }); }
for (const z of [-60, 100]) critters.push({ type: 'floaters', models: ['duck_brown', 'duck_brown', 'duck_brown'], area: [shoreX(z) + 8, z - 8, shoreX(z) + 22, z + 8], dist: (x, zz) => height(x, zz) - SEA + 1.2, margin: 0.5, a: [7, 3], ratio: 0.3, minA: 1.5, y: SEA, speed: 0.25, cycle: [18, 24] });
export default { fish, flights, perches, critters };
