// A Balinese village — the animals (src/engine/fauna.js; docs/settlements/bali-village.md §8): swallows along the village street and the lane and over the paddies, crows over the
// temple's merus and the dalem's banyan, egrets standing in the flooded paddies (the white heron of the rice fields), sparrows on the walls' copings and the bale roofs' edges.
// Every place is derived from layout.js (the compounds' lots, the terraces' treads).
import { PURA, DALEM_C, STREET, LANE, lots, lotFrame, outward, compoundFrame, fieldSpots, height, flooded, CORE, RADIUS } from './layout.js';
import { walkRoutes } from './walkroutes.js';
import { compoundParts } from '../../styles/balinese/compound.js';

const flights = [
  { kind: 'swallow', n: 5, lane: { a: [0, STREET[1] - 20], b: [0, STREET[3] + 20] }, y: [1.4, 5], speed: 9, a: [26, 3] },
  { kind: 'swallow', n: 4, lane: { a: [LANE[0] - 20, (LANE[1] + LANE[3]) / 2], b: [LANE[2] + 20, (LANE[1] + LANE[3]) / 2] }, y: [1.4, 5], speed: 9, a: [26, 3] },
  { kind: 'swallow', n: 6, loop: { c: [0, 60], a: [90, 70], rot: 0.2 }, y: [2, 12], speed: 9 },
  { kind: 'swallow', n: 5, loop: { c: [-130, 90], a: [60, 40], rot: 0.5 }, y: [0.8, 4], speed: 8 },
  { kind: 'swallow', n: 5, loop: { c: [130, -60], a: [60, 40], rot: -0.4 }, y: [0.8, 4], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [0, (PURA.zN + PURA.zM) / 2], a: [45, 30], rot: 0.1 }, y: [26, 14], speed: 8 },
  { kind: 'crow', n: 3, loop: { c: [DALEM_C[0], DALEM_C[1]], a: [22, 16], rot: 0.3 }, y: [20, 12], speed: 7 },
];
const perches = [];
// sparrows on the copings of the street walls (every second compound) and on the temple walls' copings
lots().forEach((l, i) => {
  if (i % 2) return;
  const F = lotFrame(l), W = l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], u = W * (l.gateF > 0.5 ? 0.2 : 0.8), p = F(u, 0.25);
  perches.push({ kind: 'sparrow', x: p[0], z: p[1], y: l.rich ? 2.45 + 0.3 : 2.0 + 0.4, rot: l.front === 'n' || l.front === 's' ? 0 : Math.PI / 2, range: [1.8, 0], alert: 4 });
});
for (const [x, z, y] of [[-33.7, -100, 3.4], [33.7, -120, 5.0], [-20, -72, 3.2], [20, -72, 3.2], [33.7, -90, 3.4]]) perches.push({ kind: 'sparrow', x, z, y, rot: Math.abs(x) > 30 ? Math.PI / 2 : 0, range: [1.6, 0], alert: 4 });
// egrets in the flooded paddies: the first flat flooded tread found in each sector of the terraces
let seed = 7;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
for (let sector = 0; sector < 8; sector++) {
  for (let k = 0; k < 80; k++) {
    const a = (sector + rnd()) / 8 * 6.283, d = 112 + rnd() * 55, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.95;
    if (Math.hypot(x, z) > RADIUS - 14 || (x > CORE[0] - 2 && x < CORE[2] + 2 && z > CORE[1] - 2 && z < CORE[3] + 2)) continue;
    const y = height(x, z);
    if (![[2, 0], [-2, 0], [0, 2], [0, -2]].every(([dx, dz]) => Math.abs(height(x + dx, z + dz) - y) < 0.02) || !flooded(x, z, y)) continue;
    perches.push({ kind: 'egret', x, z, y: y + 0.07, rot: rnd() * 6, stay: [80, 240], gone: [40, 150], alert: 10 });
    break;
  }
}

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §13.4) ──
// The animals of the compounds, the street and the paddies, none of them where a walker goes (the gate's lane, the doors, the stairs, the steps of a stall, the street's middle):
// a cock and hens scratching in the natah of every third compound, the village dogs lying at the street's edge before some gates (they stand when the visitor comes), cats on the
// verandas of three sleeping houses and on the bale agung's floor, a pig in the sty of eight compounds, doves pecking on the forecourt's ground between the market's mats and its
// stalls, ducks afloat in the flooded paddies, Bali cattle tethered on the dry terraces, swallows' mud nests under the front beams of three stalls, a songbird's cage hung under
// the front beam of two stalls [inferred: all of it the ordinary animals of a Balinese village; the village dogs, the sway-backed black pig and the red Bali cow are the island's
// own kinds; the songbird in a bamboo cage hung out is a common sight; the dogs and the fowl are placed by the same rule as the people's (town.js) and not on its lanes].
const critters = [], L = lots(), ROUTES = walkRoutes().map((r) => r.pts || r.route || r);
const routeDist = (x, z) => Math.min(...ROUTES.flatMap((w) => w.slice(1).map((b, k) => { const a = w[k], dx = b[0] - a[0], dz = b[1] - a[1], q = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - a[0] - q * dx, z - a[1] - q * dz); })));
let n = 0;
for (const l of L) {
  const { P, M } = compoundFrame(l), [ox, oz] = outward(l), [gx, gz] = l.gate, tx = -oz, tz = ox, i = n++;
  // the cock and hens in the natah, in the strip between the kitchen and the guest bale (clear of the sty, the mat, the log and the cocks' domes)
  if (i % 3 === 0) {
    // the spot of a few in the natah farthest from the house routes; the fowl's range shrinks to what that distance leaves
    const spot = [[7.6, 5.0], [11.0, 5.0], [7.6, 7.0], [11.0, 7.0], [4.0, 5.0]].map(([u, v]) => P(M(u), v)).map((c) => [c, routeDist(c[0], c[1])]).sort((p, q) => q[1] - p[1])[0], rg = Math.min(2.4, spot[1] - 1.3);
    if (rg >= 1.0) {
      const [x, z] = spot[0], q = (k) => 0.97 + 0.03 * k, r = [rg, rg * 0.85];
      critters.push({ model: 'rooster', at: [x, 0.02, z], rot: i, range: r, tau: 14 + i % 5, speed: 0.5 }, { model: 'hen_brown', at: [x + 0.4, 0.02, z + 0.3], rot: i + 2, range: r, size: q(1) }, { model: i % 2 ? 'hen_white' : 'hen_brown', at: [x - 0.4, 0.02, z + 0.5], rot: i + 4, range: r, size: q(0) });
    }
  }
  // a pig in the sty (canonical u 4.3–6.5, v 8.6–10.2)
  if (i % 4 === 1) { const [x, z] = P(M(5.4), 9.4); critters.push({ model: i % 8 === 1 ? 'pig_spotted' : 'pig_black', at: [x, 0.04, z], rot: i * 1.7, range: [7, 3.2] }); }
  // a village dog at the street's edge before the gate, to the side (the visitor's lane and the gate's are clear), lying until one comes
  if (i % 4 === 2) critters.push({ model: 'dog', at: [gx + ox * 1.5 + tx * 3.4 * (i % 8 === 2 ? 1 : -1), 0.02, gz + oz * 1.5 + tz * 3.4 * (i % 8 === 2 ? 1 : -1)], rot: i * 0.9, range: [8, 3.2] });
  // a cat on the veranda of the sleeping house, at the corner away from its door
  const parts = compoundParts({ rect: l.rect, front: l.front, seed: l.seed, rich: l.rich, gateF: l.gateF, shop: l.shop });
  if (parts.house && i % 6 === 4) {
    const [x0, z0, x1, z1] = parts.house.rect, d = parts.house.door, cx = d === 'w' ? x1 + 0.45 : x0 - 0.45, cz = d === 'n' ? z1 + 0.45 : z0 - 0.45;
    critters.push({ model: i % 12 === 4 ? 'cat_orange' : 'cat_tabby', at: [d === 'e' || d === 'w' ? cx : (x0 + x1) / 2 + 1.2, 0.45, d === 'e' || d === 'w' ? (z0 + z1) / 2 + 1.0 : cz], rot: i, range: [6, 2.2] });
  }
  // a stall's swallow nests and a caged songbird: under the front beam, to the side of the steps (the beam's middle is the visitor's way in)
  if (l.shop) {
    const F = lotFrame(l), { u0, u1, kind } = l.shop, side = n % 2 ? 1 : -1, ux = side > 0 ? u1 - 0.55 : u0 + 0.55, p = F(ux, 0.3);
    if (['warung', 'cloth', 'weaver'].includes(kind)) critters.push({ model: 'swallow_nest', at: [p[0], 2.35, p[1]], rot: Math.atan2(oz, ox), cycle: 33 + n, flight: 9, radius: 10, side, rise: 1 });
    if (['offerings', 'basket', 'carver'].includes(kind)) { const c = F(side > 0 ? u0 + 0.6 : u1 - 0.6, 0.15); critters.push({ model: 'cagebird', at: [c[0], 2.45, c[1]], rot: Math.atan2(oz, ox) }); }
  }
}
// a cat on the bale agung's floor (the temple's pavilion, at its north-west corner, clear of the stair on the south side), and one on the plinth of the gong pavilion
critters.push({ model: 'cat_tabby', at: [-30.0, PURA.y1 + 0.6, -102.0], rot: 1.2, range: [6, 2.2] }, { model: 'cat_orange', at: [14.0, PURA.y1 + 0.5, -103.0], rot: 2.0, range: [6, 2.2] });
// doves on the forecourt's ground, between the market's mats (x ±5.9) and the stalls' fronts (x ±9.4), a walker's peck
for (const [x, z, m] of [[7.7, -66.5, 'pigeon_white'], [8.1, -65.8, 'pigeon_grey'], [-7.6, -61, 'pigeon_grey'], [-7.9, -60.2, 'pigeon_white'], [7.6, -55, 'pigeon_grey'], [-7.7, -51, 'pigeon_white'], [8.0, -50.3, 'pigeon_white']]) critters.push({ model: m, at: [x, 0.02, z], rot: x * 3, range: [2.2, 1.0] });
// ducks afloat in the flooded paddies: each group on its own flooded tread, the area that tread's flat and flooded extent (one metre steps out from the spot)
export function paddyArea(at, y) {
  const flat = (x, z) => Math.abs(height(x, z) - y) < 0.012 && flooded(x, z, y), ext = (dx, dz) => { let k = 0; while (k < 16 && flat(at[0] + dx * (k + 1), at[1] + dz * (k + 1))) k++; return k; };
  return [at[0] - ext(-1, 0), at[1] - ext(0, -1), at[0] + ext(1, 0), at[1] + ext(0, 1)];
}
fieldSpots().ducks.forEach((s, i) => {
  const r = paddyArea(s.at, s.y), cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, hx = (r[2] - r[0]) / 2, hz = (r[3] - r[1]) / 2;
  if (hx < 3 || hz < 3) return;
  critters.push({ type: 'floaters', models: i % 2 ? ['duck_white', 'duck_brown', 'duck_brown'] : ['duck_brown', 'duck_white'], area: [r[0], r[1], r[2], r[3]], dist: (x, z) => Math.max(Math.abs(x - cx) - hx, Math.abs(z - cz) - hz), a: [Math.min(6, hx - 1.6), Math.min(3, hz - 1.6)], ratio: 0.5, margin: 1.2, y: s.y + 0.07, speed: 0.2, cycle: [18, 26] });
});
// Bali cattle tethered on the dry terraces (by the field huts' treads): they lie down far off and stand when the visitor comes
fieldSpots().plough.forEach((s, i) => critters.push({ model: 'cow_bali', at: [s.at[0] + 3.0, s.y, s.at[1] - 2.0], rot: i * 2.1, range: [14, 5] }));
export default { fish: [], flights, perches, critters };
