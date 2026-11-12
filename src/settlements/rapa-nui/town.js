// The village (docs/settlements/rapa-nui.md §5): boat-shaped houses with their paved forecourts and
// earth ovens, chicken houses and garden walls with bananas in them, each set on the ground where it
// stands; and the people (§4b): a gathering on the plaza before the ahu, a statue walked down the
// road by three rope teams, canoes drawn up on the shore with their fishermen.
import { RADIUS, ROAD, SEA, PLAZA, RARAKU, BAYS, CHIEF, TUPA, PETRO, village, height, fields } from './layout.js';

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
  const plain = v.houses.filter((h) => !h.chief);
  const strip = plain.find((h) => h.strip);
  for (const h of plain) {
    E.push({ t: h.inside ? 'hare_house' : 'hare_paenga', ...h, y: y(h.c), strip: h === strip });
    E.push({ t: 'house_yard', ...h, y: y(h.c) });
    if (h !== strip) E.push({ t: 'thatch_wear', ...h, y: y(h.c) });
  }
  E.push({ t: 'hare_paenga_long', ...CHIEF, y: y(CHIEF.c) });
  for (const [tx, tz, r, h, yaw] of TUPA) E.push({ t: 'tupa', c: [tx, tz], y: height(tx, tz), r, h, yaw, seed: Math.floor(tx * 3 + tz) });
  PETRO.forEach(([px, pz, , motifs], k) => E.push({ t: 'carved_rock', c: [px, pz], y: height(px, pz), motifs, seed: 9 + k }));
  BAYS.forEach((b, k) => { if (k % 2 === 0 || k === 5) E.push({ t: 'quarry_camp', at: b.at, facing: b.facing, hw: 0.19 * b.h, ground: height, side: k % 4 === 0 ? 1 : -1, seed: 6 + k }); });
  // the plaza's feast ovens and offerings, the working shore, reed rafts on the crater lake (§4g)
  E.push({ t: 'plaza_dress', rect: PLAZA, y: 0.12, seed: 8 });
  E.push({ t: 'shore_works', c: [80, 150], ground: height, seed: 31 });
  for (const [dx, dz, ya] of [[10, 8, 0.5], [-14, -12, 2.1]]) E.push({ t: 'pora', c: [RARAKU.c[0] + dx, RARAKU.c[1] + dz], y: RARAKU.lake - 0.04, yaw: ya, seed: 5 });
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
    if (h.chief || h === strip || k % 3) return;
    const dv = -h.w / 2 - 1.9;
    const a = L2W(h, (rand() - 0.5) * 1.5, dv - 0.8); fig({ at: a, y: y(a), rot: face(a, L2W(h, 0, 0)) + Math.PI, pose: rand() < 0.6 ? 'squat' : 'sit_ground' });
    if (rand() < 0.5) { const ou = h.len * 0.3 * (h.seed % 2 ? -1 : 1), b = L2W(h, ou + 0.95, -h.w / 2 - 2.4); fig({ at: b, y: y(b), rot: face(b, L2W(h, ou, -h.w / 2 - 2.4)), pose: 'squat', man: false }); }
  });
  for (const m of v.moa) for (const s of [-1, 1]) if (rand() < 0.7) { const at = [m.c[0] + s * 2.4, m.c[1] + (rand() - 0.5) * 2]; P.push({ t: 'chickens', at, y: y(at), n: 3 + Math.floor(rand() * 3), rot: rand() * 6.28, seed: Math.floor(rand() * 1e6) }); }
  // inside the houses, someone at the work of each; chickens in the yards (§4f)
  v.houses.forEach((h) => {
    if (!h.inside) return;
    const [u, vv, pose, tu, tv] = { sleep: [-1.9, 0.85, 'squat', -1.9, 0], cook: [4.0, 1.4, 'squat', 4.0, 0.3], net: [3.9, 0.55, 'sit_ground', 3.9, 1.05], tapa: [3.75, -0.8, 'squat', 3.75, -0.1], carver: [4.3, -0.6, 'sit_ground', 3.4, 0.05] }[h.kind];
    const at = L2W(h, u, vv); fig({ at, y: y(at) + 0.07, rot: face(at, L2W(h, tu, tv)), pose, man: h.kind === 'net' || h.kind === 'carver' });
  });
  v.houses.forEach((h, k) => {
    if (h.chief || h === strip || k % 5 > 2) return;
    const at = L2W(h, (rand() - 0.5) * 4, -h.w / 2 - 3.2); P.push({ t: 'chickens', at, y: y(at), n: 2 + Math.floor(rand() * 3), rot: rand() * 6.28, seed: Math.floor(rand() * 1e6) });
  });
  // the yards on the way up from the arrival to the plaza (approach_dress): a woman beating bark cloth at her slab, another by the drying line, sweet potato on a mat,
  // two at the hearth, children playing a string game (kai-kai) — the first people the visitor meets, ten to twenty metres off
  E.push({ t: 'approach_dress', ground: height, seed: 12 });
  { const at = (x, z, o) => fig({ at: [x, z], y: y([x, z]), ...o });
    at(-12.5, 55.2, { rot: face([-12.5, 55.2], [-12.5, 54]), pose: 'squat', man: false });
    at(-15.4, 57.4, { rot: face([-15.4, 57.4], [-12.5, 54]) + 0.4, pose: 'sit_ground', man: false });
    at(-8.6, 53.2, { rot: face([-8.6, 53.2], [-12.5, 54]), pose: 'stand', man: true });
    at(11.4, 51.0, { rot: face([11.4, 51.0], [11.5, 52.5]), pose: 'squat', man: false });
    at(14.6, 53.6, { rot: face([14.6, 53.6], [11.5, 52.5]), pose: 'sit_ground', man: true });
    at(6.0, 60.4, { rot: face([6.0, 60.4], [8.0, 60]), pose: 'sit_ground', man: true });
    at(7.6, 62.0, { rot: face([7.6, 62.0], [8.0, 60]), pose: 'sit_ground', man: false });
    at(10.9, 63.6, { rot: face([10.9, 63.6], [12.0, 64.4]), pose: 'squat', man: true, h: 1.05 });
    at(12.9, 65.0, { rot: face([12.9, 65.0], [10.9, 63.6]), pose: 'squat', man: false, h: 1.0 });
    for (const [cx, cz] of [[14, 57.5], [-5.5, 61], [-18, 50]]) P.push({ t: 'chickens', at: [cx, cz], y: y([cx, cz]), n: 4, rot: rand() * 6.28, seed: Math.floor(rand() * 1e6) });
  }
  // the shore: a woman splitting fish at the racks, a man mending a net
  for (const [x, z, pose] of [[62, 146.4, 'squat'], [100, 145.6, 'stand'], [84, 137.4, 'stand']]) { const at = [x, z]; fig({ at, y: y(at), rot: face(at, [x, z - 1]), pose, man: pose === 'stand' }); }
  // the statue walked down the road
  const w = walking(rand);
  E.push(w.statue);
  for (const p of w.people) fig({ ...p, man: true });
  // the gathering on the plaza, facing the statues; the walk up the middle left clear
  for (let k = 0; k < 44; k++) {
    const x = (rand() < 0.5 ? -1 : 1) * (4 + rand() * 40), z = 64 + rand() * 20, at = [x, z];
    if (P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 0.9) || [[-34, 71], [37, 69], [-16, 94], [-37, 71], [34, 69]].some(([a, b]) => Math.hypot(a - x, b - z) < 3.6) || (z > 82.4 && z < 86.6) || Math.abs(Math.abs(x) - 6.5) < 0.7) continue;
    const r = rand();
    fig({ at, y: 0.12, rot: face(at, [x * 0.6, 103]) + (rand() - 0.5) * 0.4, pose: r < 0.3 ? 'squat' : r < 0.45 ? 'talk' : 'stand' });
  }
  // carvers resting and sharpening at the camps of the quarry's bays, one by the long house's door
  BAYS.forEach((b, k) => {
    if (!(k % 2 === 0 || k === 5)) return;
    const side = k % 4 === 0 ? 1 : -1, hw = 0.19 * b.h, sf = Math.sin(b.facing), cf = Math.cos(b.facing), Wd = (u, vv) => [b.at[0] + u * cf + vv * sf, b.at[1] - u * sf + vv * cf];
    for (const [u, vv, pose] of [[side * (hw + 5.6), 1.4, 'squat'], [side * (hw + 7.2), 2.6, 'sit_ground'], [side * (hw + 6.2), 3.6, 'squat'], [side * (hw + 4.2), -0.4, 'stand']]) {
      const at = Wd(u, vv); fig({ at, y: y(at), rot: face(at, Wd(side * (hw + 6.4), 1.6)) + (rand() - 0.5) * 0.8, pose, man: true });
    }
  });
  { const at = [CHIEF.c[0] + 6, CHIEF.c[1] + 4.5]; fig({ at, y: y(at), rot: face(at, [CHIEF.c[0] + 6, CHIEF.c[1] + 2]), pose: 'stand', man: true }); }
  // canoes drawn up above the shore east of the ahu, bow to the sea; a fisherman or two by each
  for (const [x, z] of [[58, 148], [66, 150], [74, 151], [86, 152], [106, 149]]) {
    const yaw = Math.PI + (rand() - 0.5) * 0.3;
    E.push({ t: 'vaka', c: [x, z], y: y([x, z]) - 0.02, yaw, l: 3.3 + rand() * 0.7 });
    const a = [x + 1.1, z - 0.6 + rand()];
    fig({ at: a, y: y(a), rot: face(a, [x, z]), pose: rand() < 0.6 ? 'squat' : 'stand', man: true });
    if (rand() < 0.6) { const b = [x - 1.3, z + 0.8]; fig({ at: b, y: y(b), rot: face(b, [x, z + 6]), pose: 'stand', man: true }); }
  }
  void SEA;
  // the crater lake of Rano Raraku (the sea round the island is the planet's: ground.js, sea)
  const [lx, lz] = RARAKU.c, lr = RARAKU.crater;
  const lake = plan('rapa-nui-crater-lake', 'ming', [{ t: 'water_cells', rect: [lx - lr, lz - lr, lx + lr, lz + lr], y: RARAKU.lake, cell: 1, inside: (x, z) => Math.hypot(x - lx, z - lz) < lr && height(x, z) < RARAKU.lake }]);
  return [plan('rapa-nui-village', 'rapanui', E), plan('rapa-nui-people', 'life', P), lake];
}
