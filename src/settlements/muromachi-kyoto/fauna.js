// Muromachi Kyoto — the animals (src/engine/fauna.js; docs/settlements/muromachi-kyoto.md §6): carp in the pond of Ginkaku-ji and
// in Ryōan-ji's Kyōyōchi, in the stream small fish; swallows over the streets and the stream, crows over the hills, sparrows on
// the gravel and the roofs' ridges, a heron standing at the stream.
import { STREAM, GINKAKU, RYOAN, RADIUS, NS, EW, lots } from './layout.js';
import { dims } from '../../styles/muromachi/machiya.js';
import { frame } from './life.js';

const pondDist = (P) => (x, z) => (Math.hypot((x - P.c[0]) / P.r[0], (z - P.c[1]) / P.r[1]) - 1) * Math.min(P.r[0], P.r[1]);
const streamDist = (x) => Math.min(x - STREAM.x0, STREAM.x1 - x);
const fish = [];
const G = GINKAKU.pond, R = RYOAN.pond;
for (let i = 0; i < 4; i++) fish.push({ n: 2, size: [0.45, 0.75], palette: i % 2 ? 'redcarp' : 'carp', y: G.level, dist: pondDist(G), margin: 1.2, k: 1, rot: 0, area: [G.c[0] - G.r[0] + 6, G.c[1] - G.r[1] + 5, G.c[0] + G.r[0] - 6, G.c[1] + G.r[1] - 5], a: [14, 2.5], ratio: 0.16, minA: 1.6, speed: 0.5, rise: 0.12 });
for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.4, 0.7], palette: 'carp', y: R.level, dist: pondDist(R), margin: 1.2, k: 1, rot: 0, area: [R.c[0] - R.r[0] + 6, R.c[1] - R.r[1] + 4, R.c[0] + R.r[0] - 6, R.c[1] + R.r[1] - 4], a: [12, 2.2], ratio: 0.16, minA: 1.4, speed: 0.5, rise: 0.12 });
for (let z = -200; z <= 200; z += 100) fish.push({ n: 3, size: [0.12, 0.2], palette: 'carp', y: STREAM.level, dist: (x) => streamDist(x), margin: 0.4, k: 1, rot: Math.PI / 2, area: [STREAM.x0, z - 20, STREAM.x1, z + 20], a: [18, 0.9], ratio: 0.1, minA: 1.2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [-120, 0], a: [110, 90], rot: 0.1 }, y: [3, 12], speed: 9 },
  { kind: 'swallow', n: 3, loop: { c: [-30, 130], a: [80, 60], rot: 0.3 }, y: [3, 10], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [99, -250], b: [99, 250] }, y: [0.3, 3], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [250, 0], a: [70, 70], rot: 0.4 }, y: [30, 60], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [-170, -170], a: [50, 40], rot: -0.3 }, y: [24, 44], speed: 8 },
];
// swallows low along the main streets, black kites high over the basin (the kite of the Kamo)
for (const z of [EW[2], EW[4]]) flights.push({ kind: 'swallow', n: 3, lane: { a: [-230, z], b: [80, z] }, y: [2.5, 6], speed: 9, a: [26, 3] });
for (const x of [NS[2], NS[4]]) flights.push({ kind: 'swallow', n: 2, lane: { a: [x, -150], b: [x, 220] }, y: [2.5, 6], speed: 9, a: [26, 3] });
flights.push({ kind: 'kite', n: 2, loop: { c: [60, -30], a: [150, 120], rot: 0.2 }, y: [60, 90], speed: 9 });
flights[2].a = [26, 3];
const perches = [];
for (const [x, z] of [[-165, -128], [-170, -108], [-160, -112], [190, 70], [175, 74], [160, 20], [-6, 175], [4, 205], [-45, 100], [10, -30], [-110, 60], [-180, -20], [60, 170]]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: (x * 7) % 3, range: [1.6, 1.4] });
// sparrows on the ridges of the houses (a ridge is at the roof's top) and hopping in the streets
{ let k = 0; for (const l of lots()) { if (l.seed % 17 !== 0) continue; const D = dims(l.seed), hx = (l.rect[0] + l.rect[2]) / 2, hz = (l.rect[1] + l.rect[3]) / 2; perches.push({ kind: k++ % 3 ? 'sparrow' : 'crow', x: hx, z: hz, y: D.top + D.rise + 0.1, rot: l.facing === 'n' || l.facing === 's' ? 0 : Math.PI / 2, range: [1.4, 0], alert: 6 }); } }
for (const z of EW.slice(1, 6)) for (const x of [-190, -120, -50, 10, 60]) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: (x * 7 + z) % 3, range: [1.8, 1.2] });
{ const x = 99.2, z = 60; perches.push({ kind: 'heron', x: STREAM.x1 + 1.1, z: -120, y: 0.15, rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); perches.push({ kind: 'egret', x: STREAM.x0 - 1.1, z, y: 0.15, rot: Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §12) ──
const critters = [];
// a pair of mandarin ducks (oshidori) on each pond, the hen leading: Kyōyōchi of Ryōan-ji was an old duck pond [inferred], and the Jishō-ji's pond at the arrival
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [G.c[0] - 30, G.c[1] - 5, G.c[0] + 30, G.c[1] + 5], dist: pondDist(G), a: [10, 3.6], ratio: 0.4, margin: 1.3, y: G.level, speed: 0.22, cycle: [18, 24] });
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [R.c[0] - 30, R.c[1] - 8, R.c[0] + 30, R.c[1] + 8], dist: pondDist(R), a: [10, 4], ratio: 0.4, margin: 1.3, y: R.level, speed: 0.22, cycle: [18, 24] });
// cats asleep in the sun at the corner post of two shops of the approach street (the sandal-maker's and the potter's), clear of the earth passage
for (const [k, model] of [[0, 'cat_tabby'], [5, 'cat_orange']]) {
  const l = lots().find((q) => q.at[1] === 103.5 && Math.abs(q.at[0] - (k === 0 ? 126 + 2.8 : 159.3 + 3.2)) < 0.5);
  if (l) { const P = frame(l).P, [x, z] = P(-l.w / 2 + 0.55, 1.25); critters.push({ model, at: [x, 0.02, z], rot: frame(l).rot, range: [7, 2.5] }); }
}
// a dog lying outside each of three gates: Ginkaku-ji's, Ryōan-ji's, and at the way onto the bridge
for (const [x, z, rot] of [[196.5, 97.4, 2.6], [-159.5, -99.8, 0.4], [91.5, 97.2, -0.3]]) critters.push({ model: 'dog', at: [x, 0.02, z], rot, range: [9, 3.5] });
// the keepers' fowl in the open ground south of their houses in Ginkaku-ji: a cock and two hens
for (const [model, x, z, size] of [['rooster', 253.5, 79.0, 1], ['hen_brown', 255.6, 78.2, 1], ['hen_white', 251.8, 80.4, 0.96]]) critters.push({ model, at: [x, 0.02, z], rot: 0.5, range: [3.2, 1.4], size });
// a songbird in a cage at the eave of the tea-seller's shop on the approach street (the nearer one, x 145–152)
{ const l = lots().find((q) => q.at[1] === 103.5 && q.trade === 'tea' && q.at[0] > 100 && q.at[0] < 160);
  if (l) { const D = dims(l.seed), [x, z] = frame(l).P(-l.w / 2 + 1.3, 0.95); critters.push({ model: 'cagebird', at: [x, D.H - 0.45, z], rot: 0 }); } }
// a kingfisher on the stone edge of the stream's east bank, watching the water
critters.push({ model: 'kingfisher', at: [STREAM.x1 + 0.4, STREAM.top + 0.05, -60], rot: Math.PI, water: [STREAM.x1 + 0.4 - 1.7, -60, STREAM.level], cycle: 34 });
// house swallows' nests (tsubame; hash-chosen) under the eaves of the one-storey shops of the approach street, on the wall's face under the
// eave's end, the opening to the street: from them the birds sweep out over the street and back
{ let k = 0; for (const l of lots()) {
    if (l.at[1] !== 103.5 || l.at[0] < 100 || l.at[0] > 195 || l.facing !== 'n') continue;
    const D = dims(l.seed); if (D.two || (l.seed * 2654435761 >>> 0) % 5 > 2) continue;
    const [x, z] = frame(l).P(((l.seed >> 3) % 2 ? 1 : -1) * (l.w / 2 - 0.45), 0.06); if (critters.some((c) => c.model === 'swallow_nest' && Math.abs(c.at[0] - x) < 12)) continue; const side = k++ % 2 ? 1 : -1;
    critters.push({ model: 'swallow_nest', at: [x, D.top - 0.4, z], rot: -Math.PI / 2, cycle: 33 + (l.seed % 5), flight: 9, radius: 10, side, rise: -0.8 });
  } }
void RADIUS;
export default { fish, flights, perches, critters };
