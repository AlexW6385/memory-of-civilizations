// The village (docs/settlements/rapa-nui.md §5): boat-shaped houses with their paved forecourts and
// earth ovens, chicken houses and garden walls with bananas in them, each set on the ground where it
// stands; and the people (§4b): a gathering on the plaza before the ahu, a statue walked down the
// road by three rope teams, canoes drawn up on the shore with their fishermen.
import { RADIUS, ROAD, SEA, village, height, fields } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 40], facing: 's' } });
// bark cloth (mahute) white or dyed yellow with turmeric, red-brown with earth; most went nearly bare
const CLOTH = ['hide_white', 'hide_white', 'cloth_ochre', 'hide_tan', 'cloth_brown'];

/** The walking statue, its ropes and its haulers: { statue element, haulers }. */
function walking(rand) {
  const W = ROAD[1], N = ROAD[2], len = Math.hypot(N[0] - W[0], N[1] - W[1]), d = [(N[0] - W[0]) / len, (N[1] - W[1]) / len];
  const yaw = Math.atan2(-d[0], -d[1]), h = 5.4, HH = 0.96;                    // hands at 0.96 m on a 1.65 m figure
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const ropes = [], people = [];
  const team = (side, dir, first, n, facingOut) => {
    const path = [];
    for (let k = 0; k < n; k++) {
      const s = first + k * 0.95, p = [W[0] + dir[0] * s, W[1] + dir[1] * s], gy = height(p[0], p[1]);
      path.push([p[0], gy + HH, p[1]]);
      const f = facingOut ? dir : [-dir[0], -dir[1]], at = [p[0] - f[0] * 0.13, p[1] - f[1] * 0.13];
      people.push({ at, y: height(at[0], at[1]), rot: face(at, [at[0] + f[0], at[1] + f[1]]), h: 1.65, pose: 'stand' });
    }
    const e = first + n * 0.95 + 1.8, q = [W[0] + dir[0] * e, W[1] + dir[1] * e];
    path.push([q[0], height(q[0], q[1]) + 0.04, q[1]]);
    ropes.push({ side, path });
  };
  // the two forward teams pull from either side, a little out from the road's line; the team behind steadies it
  team('l', rot(d, -0.32), 5.2, 7, true);
  team('r', rot(d, 0.32), 5.2, 7, true);
  team('b', [-d[0], -d[1]], 3.6, 5, false);
  const statue = { t: 'moai_walk', at: W, y: height(W[0], W[1]), h, facing: yaw, rock: 0.07, lean: 0.05, ropes };
  return { statue, people };
}

export async function town() {
  const v = village(), E = [], P = [], rand = rng(1722), y = (c) => height(c[0], c[1]);
  // the house nearest the plaza being thatched anew (docs/settlements/rapa-nui.md §4c)
  const strip = v.houses.reduce((b, h) => (Math.hypot(h.c[0], h.c[1] - 40) < Math.hypot(b.c[0], b.c[1] - 40) ? h : b), v.houses[0]);
  for (const h of v.houses) E.push({ t: 'hare_paenga', ...h, y: y(h.c), strip: h === strip });
  // the sweet potato gardens under their mulch of stones
  fields().forEach((r, k) => E.push({ t: 'mulch_garden', rect: r, ground: height, seed: 40 + k }));
  for (const m of v.moa) E.push({ t: 'hare_moa', ...m, y: y(m.c), yaw: (m.c[0] * 0.37) % 1, len: 5 + Math.abs(m.c[1] * 0.13) % 3 });
  for (const g of v.gardens) {
    E.push({ t: 'manavai', ...g, y: y(g.c) });
    if (g.r > 2.6) E.push({ t: 'banana', at: g.c, y: y(g.c) - 0.08, h: 1.9 + rand() * 0.8, n: 1 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e6) });
  }
  // men bare but for the loincloth (hami) — drawn as a short "tunic" in the colour of the skin with a
  // girdle of bark cloth — some with a cloak of it over the shoulders; women in a wrap of bark cloth
  const fig = (o) => {
    const skin = rand() < 0.6 ? 'skin_medium' : 'skin_dark', man = o.man ?? rand() < 0.55;
    P.push(man ? { t: 'figure', dress: 'tunic', cloth: skin, cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], over: 'belt', skin, hat: 'none', feet: 'bare', hair: rand() < 0.6 ? 'short' : 'bun', beard: rand() < 0.4, seed: Math.floor(rand() * 1e9), ...o }
      : { t: 'figure', dress: 'wrap', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: 'hide_white', skin, hat: 'none', feet: 'bare', hair: rand() < 0.5 ? 'long' : 'bun', beard: false, seed: Math.floor(rand() * 1e9), ...o });
  };
  // at the houses: the thatchers at the stripped house; at some others a woman at the earth oven,
  // people sitting on the paved forecourt; chickens about the chicken houses (§4c)
  const L2W = (h, u, v) => [h.c[0] + u * Math.cos(h.yaw) + v * Math.sin(h.yaw), h.c[1] - u * Math.sin(h.yaw) + v * Math.cos(h.yaw)];
  for (const [u, v2, pose] of [[-strip.len / 2 - 1.6, strip.w / 2 + 1.2, 'stand'], [-strip.len / 2 + 0.8, -strip.w / 2 - 0.9, 'stand'], [-strip.len / 2 - 0.4, strip.w / 2 + 2.4, 'squat']]) {
    const at = L2W(strip, u, v2); fig({ at, y: y(at), rot: face(at, strip.c), pose, man: true });
  }
  v.houses.forEach((h, k) => {
    if (h === strip || k % 3) return;
    const dv = -h.w / 2 - 1.9;
    const a = L2W(h, (rand() - 0.5) * 1.5, dv - 0.8); fig({ at: a, y: y(a), rot: face(a, L2W(h, 0, 0)) + Math.PI, pose: rand() < 0.6 ? 'squat' : 'sit_ground' });
    if (rand() < 0.5) { const ou = h.len * 0.3 * (h.seed % 2 ? -1 : 1), b = L2W(h, ou + 0.95, -h.w / 2 - 2.4); fig({ at: b, y: y(b), rot: face(b, L2W(h, ou, -h.w / 2 - 2.4)), pose: 'squat', man: false }); }
  });
  for (const m of v.moa) for (const s of [-1, 1]) if (rand() < 0.7) { const at = [m.c[0] + s * 2.4, m.c[1] + (rand() - 0.5) * 2]; P.push({ t: 'chickens', at, y: y(at), n: 3 + Math.floor(rand() * 3), rot: rand() * 6.28, seed: Math.floor(rand() * 1e6) }); }
  // the statue walked down the road
  const w = walking(rand);
  E.push(w.statue);
  for (const p of w.people) fig({ ...p, man: true });
  // the gathering on the plaza, facing the statues; the walk up the middle left clear
  for (let k = 0; k < 44; k++) {
    const x = (rand() < 0.5 ? -1 : 1) * (4 + rand() * 40), z = 64 + rand() * 20, at = [x, z];
    if (P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 0.9)) continue;
    const r = rand();
    fig({ at, y: 0.12, rot: face(at, [x * 0.6, 103]) + (rand() - 0.5) * 0.4, pose: r < 0.3 ? 'squat' : r < 0.45 ? 'talk' : 'stand' });
  }
  // canoes drawn up above the shore east of the ahu, bow to the sea; a fisherman or two by each
  for (const [x, z] of [[66, 150], [74, 151], [86, 152]]) {
    const yaw = Math.PI + (rand() - 0.5) * 0.3;
    E.push({ t: 'vaka', c: [x, z], y: y([x, z]) - 0.02, yaw, l: 3.3 + rand() * 0.7 });
    const a = [x + 1.1, z - 0.6 + rand()];
    fig({ at: a, y: y(a), rot: face(a, [x, z]), pose: rand() < 0.6 ? 'squat' : 'stand', man: true });
    if (rand() < 0.6) { const b = [x - 1.3, z + 0.8]; fig({ at: b, y: y(b), rot: face(b, [x, z + 6]), pose: 'stand', man: true }); }
  }
  void SEA;
  return [plan('rapa-nui-village', 'rapanui', E), plan('rapa-nui-people', 'life', P)];
}
