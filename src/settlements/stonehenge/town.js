// The builders' houses (docs/settlements/stonehenge.md §5) and the people (§10): a gathering at the
// stones and up the Avenue, as at the midwinter feasts; at the houses people, pigs fattened for the
// feast, cattle and dogs.
import { RADIUS, AXIS, VILLAGE, DURR, height, houses, avenue } from './layout.js';

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

/** The Southern Circle (§5b): 166 posts in five rings 40 m across, two great posts at the entrance facing the avenue
 *  and the midwinter sunrise; the rings broken on that axis. */
function timberCircle() {
  const rand = rng(2502), posts = [], [dx, dz] = DURR.dir, [cx, cz] = DURR.c, ax = Math.atan2(dz, dx);
  const RINGS = [[19.5, 52, 0.45, 3.6], [16, 42, 0.6, 4.6], [12.5, 33, 0.85, 6.2], [9, 24, 0.7, 5.2], [5.5, 15, 0.5, 4.0]];
  for (const [r, n, d, h] of RINGS) for (let i = 0; i < n; i++) {
    const a = ax + (i + 0.5) / n * Math.PI * 2, rel = Math.atan2(Math.sin(a - ax), Math.cos(a - ax));
    if (Math.abs(rel) * r < 1.8) continue;                                  // the way in
    const at = [cx + Math.cos(a) * r + (rand() - 0.5) * 0.25, cz + Math.sin(a) * r + (rand() - 0.5) * 0.25];
    posts.push({ at, y: height(at[0], at[1]), r: d / 2 * (0.9 + rand() * 0.2), h: h * (0.92 + rand() * 0.16), seed: Math.floor(rand() * 1e9) });
  }
  for (const s of [-1, 1]) { const at = [cx + dx * 21.5 - dz * s * 1.9, cz + dz * 21.5 + dx * s * 1.9]; posts.push({ at, y: height(at[0], at[1]), r: 0.52, h: 7, seed: 7 + s }); }
  return [{ t: 'timber_circle', posts }];
}

/** The midwinter feast (§10a): open fires in the spaces between the houses, a pig roasting on the spit over each, people
 *  sitting and squatting round them; the leavings thrown on middens at the edge of the houses. */
function feast() {
  const rand = rng(2503), F = [], L = [], H = houses(), others = people();
  const clear = (x, z, m) => others.every((o) => Math.hypot(o.at[0] - x, o.at[1] - z) > m - 1) && H.every((h) => Math.hypot(h.c[0] - x, h.c[1] - z) > h.s * 0.75 + m) && Math.hypot(x - DURR.c[0], z - DURR.c[1]) > DURR.r + 6;
  const fires = [];
  for (let n = 0; n < 800 && fires.length < 7; n++) {
    const a = rand() * 6.28, d = 25 + rand() * 60, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    if (!clear(x, z, 4.5) || Math.hypot(x, z) > RADIUS - 60 || fires.some((f) => Math.hypot(f[0] - x, f[1] - z) < 18)) continue;
    fires.push([x, z]);
  }
  const middens = [];
  for (let n = 0; n < 800 && middens.length < 4; n++) {
    const a = rand() * 6.28, d = 40 + rand() * 50, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    if (!clear(x, z, 3.5) || Math.hypot(x, z) > RADIUS - 60 || fires.some((f) => Math.hypot(f[0] - x, f[1] - z) < 7) || middens.some((f) => Math.hypot(f[0] - x, f[1] - z) < 25)) continue;
    middens.push([x, z]);
    F.push({ t: 'midden', c: [x, z], y: height(x, z) - 0.03, r: 1.4 + rand() * 0.8, seed: Math.floor(rand() * 1e6) });
  }
  for (const [x, z] of fires) {
    const yaw = rand() * 6.28;
    F.push({ t: 'feast_fire', c: [x, z], r: 2.8, y: height(x, z), yaw, seed: Math.floor(rand() * 1e6) });
    // round the fire, clear of the spit's stakes: some sitting on the ground, one squatting to the pots, one standing to turn the spit
    const n = 4 + Math.floor(rand() * 4);
    for (let k = 0; k < n; k++) {
      const t = yaw + Math.PI / 2 + (k / n - 0.5) * 2.4 + (k % 2 ? Math.PI : 0), r = 2.0 + rand() * 0.5, at = [x + Math.cos(t) * r, z + Math.sin(t) * r];
      L.push({ t: 'figure', at, y: height(...at), rot: face(at, [x, z]), seed: Math.floor(rand() * 1e9), dress: rand() < 0.6 ? 'robe' : 'tunic', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: 'skin_light', hat: 'none', pose: k === 0 ? 'squat' : rand() < 0.6 ? 'sit_ground' : 'talk' });
    }
    const st = [x + Math.cos(yaw) * 1.55, z + Math.sin(yaw) * 1.55];
    L.push({ t: 'figure', at: st, y: height(...st), rot: face(st, [x, z]), seed: Math.floor(rand() * 1e9), dress: 'tunic', cloth: 'hide_tan', cloth2: 'hide_brown', skin: 'skin_light', hat: 'none' });
  }
  return [base('stonehenge-feast', F, 'neolithic'), base('stonehenge-feast-people', L, 'life')];
}

export async function town() {
  return [
    base('stonehenge-timber-circle', timberCircle(), 'neolithic'),
    base('stonehenge-houses', houses().map((h) => ({ t: 'neolithic_house', ...h })), 'neolithic'),
    base('stonehenge-people', people(), 'life'),
    ...feast(),
  ];
}
void avenue;
