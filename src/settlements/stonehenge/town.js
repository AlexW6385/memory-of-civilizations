// The builders' houses (docs/settlements/stonehenge.md §5) and the people (§10): a gathering at the
// stones and up the Avenue, as at the midwinter feasts; at the houses people, pigs fattened for the
// feast, cattle and dogs.
import { RADIUS, AXIS, VILLAGE, height, houses, avenue } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, style) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, -40], facing: 'w' } });
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const CLOTH = ['hide_tan', 'hide_brown', 'cloth_brown', 'cloth_ochre', 'cloth_grey', 'hide_grey'];

function people() {
  const rand = rng(2501), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.6 ? 'robe' : 'tunic', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: 'skin_light', hat: 'none', ...o });
  const ax = Math.cos(AXIS), az = Math.sin(AXIS), P = (u, v) => [u * ax - v * az, u * az + v * ax];
  // inside the circle: small knots of people between the bluestones and the trilithons, facing the Great Trilithon
  for (let k = 0; k < 16; k++) {
    const u = -1 + rand() * 6, v = (rand() - 0.5) * 6;
    if (Math.hypot(u + 0.6, v) < 5.4 && u < 0.8) continue;           // not among the bluestone horseshoe
    const at = P(u, v);
    fig(at, face(at, P(-7, 0)) + (rand() - 0.5) * 0.6, { pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  // along the Avenue, coming up from the river in twos and threes
  for (let k = 0; k < 26; k++) {
    const u = 58 + rand() * 180, v = (rand() - 0.5) * 9, at = P(u, v);
    if (Math.abs(u - 77) < 5) continue;                                // clear of the Heel Stone and its ditch
    fig(at, face(at, [0, 0]) + (rand() - 0.5) * 0.3, { carry: rand() < 0.15 ? 'basket' : 'none' });
  }
  // round the entrance, waiting
  for (let k = 0; k < 10; k++) { const at = P(20 + rand() * 22, (rand() - 0.5) * 14); fig(at, face(at, [0, 0]) + (rand() - 0.5), { pose: rand() < 0.4 ? 'talk' : 'stand' }); }
  // at the houses
  const H = houses();
  for (const h of H) {
    if (rand() < 0.45) {
      const dv = h.s / 2 + 1.6 + rand(), du = (rand() - 0.5) * 2;
      const at = [h.c[0] + du * Math.cos(h.yaw) - dv * Math.sin(h.yaw), h.c[1] + du * Math.sin(h.yaw) + dv * Math.cos(h.yaw)];
      fig(at, rand() * 6.28, { pose: rand() < 0.3 ? 'squat' : rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.15 ? 'pot' : 'none' });
    }
  }
  // pigs between the houses, a few cattle, dogs
  const free = (x, z) => H.every((h) => Math.hypot(h.c[0] - x, h.c[1] - z) > h.s * 0.75 + 1.2);
  let pigs = 0, n = 0;
  while (pigs < 40 && n++ < 600) {
    const a = rand() * 6.28, d = rand() * VILLAGE.r, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    if (!free(x, z) || Math.hypot(x, z) > RADIUS - 52) continue;
    const kind = pigs < 30 ? 'pig' : pigs < 36 ? 'ox' : 'dog';
    L.push({ t: 'animal', kind, at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
    pigs++;
  }
  return L;
}

export async function town() {
  return [
    base('stonehenge-houses', houses().map((h) => ({ t: 'neolithic_house', ...h })), 'neolithic'),
    base('stonehenge-people', people(), 'life'),
  ];
}
void avenue;
