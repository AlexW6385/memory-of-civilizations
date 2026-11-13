// The builders' houses (docs/settlements/stonehenge.md §5) and the people (§10): a gathering at the
// stones and up the Avenue, as at the midwinter feasts; at the houses people, pigs fattened for the
// feast, cattle and dogs.
import { RADIUS, AXIS, VILLAGE, DURR, BARROWS, DITCH, HEEL, height, houses, avenue, durr } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The huts of the camps (camp()): what can be entered, and who is inside. */
const HUTS = [];
const base = (id, elements, style, rooms = []) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, -40], facing: 'w' } });
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
export function feast() {
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


/** The gathering camp along the Avenue (§10b): the people who came for the feast (from across Britain, with their animals) camped
 *  in clusters either side of the Avenue outside the henge: a fire, three or four hide shelters, a hurdle windbreak, people
 *  sitting at the fire; and the cattle driven in, penned in hurdles with their drovers, a few grazing loose. */
export function camp() {
  const rand = rng(2504), N = [], L = [], ax = Math.cos(AXIS), az = Math.sin(AXIS), P = (u, v) => [u * ax - v * az, u * az + v * ax];
  const H = houses();
  const ok = (x, z, m) => Math.hypot(x, z) < RADIUS - 55 && H.every((h) => Math.hypot(h.c[0] - x, h.c[1] - z) > h.s + m) && BARROWS.every(([bx, bz, br]) => Math.hypot(bx - x, bz - z) > br + 6 + m)
    && (() => { const [ds, dt] = durr(x, z); return !(ds > -DURR.r - 8 && ds < DURR.r + DURR.len + 12 && Math.abs(dt) < DURR.w / 2 + 16) && Math.hypot(x - DURR.c[0], z - DURR.c[1]) > DURR.r + 14; })();
  const person = (at, rot, o = {}) => L.push({ t: 'figure', at, y: height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.35 ? 'robe' : 'tunic', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: rand() < 0.5 ? 'skin_light' : 'skin_medium', hat: 'none', ...o });
  const sites = [[68, 26], [86, -27], [112, 31], [138, -30], [166, 29], [196, -27], [60, -22]];
  for (const [u0, v0] of sites) {
    const [cx, cz] = P(u0 + (rand() - 0.5) * 8, v0 + (rand() - 0.5) * 6);
    if (!ok(cx, cz, 4)) continue;
    const yaw = rand() * 6.28;
    N.push({ t: 'feast_fire', c: [cx, cz], r: 2.4, y: height(cx, cz), yaw, pig: false, seed: Math.floor(rand() * 1e6) });
    const nS = 3 + Math.floor(rand() * 2), a0 = rand() * 6.28;
    for (let k = 0; k < nS; k++) {
      const a = a0 + k / nS * 6.28 + (rand() - 0.5) * 0.4, d = 6.2 + rand() * 1.6, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!ok(x, z, 2)) continue;
      const sr = 1.7 + rand() * 0.5, sh = 2.3 + rand() * 0.5, ss = Math.floor(rand() * 1e6), yawS = Math.atan2(-(cx - x), cz - z), y0 = height(x, z);
      // the camps within reach of the arrival have round huts a visitor can walk into (hide-roofed and thatched, in turn), one shelter in each camp left a leaning cone of hides
      if (Math.hypot(x - ARR[0], z - ARR[1]) < 135 && (k > 0 || nS < 3)) { const kind = k % 2 ? 'hide' : 'thatch', hut = { t: 'camp_hut', c: [x, z], y: y0, yaw: yawS, r: 2.2 + (ss % 7) * 0.05, h: 3.7 + (ss % 5) * 0.1, kind, fire: ss % 5 < 3, seed: ss }; N.push(hut); HUTS.push(hut); }
      else N.push({ t: 'camp_shelter', c: [x, z], y: y0, yaw: yawS, r: sr, h: sh, seed: ss });
    }
    // a windbreak of hurdles on the windward side (the wind is from the south-west: ENV wind [0.9, 0.3])
    const wa = Math.PI + 0.3 + (rand() - 0.5) * 0.5, wx = cx + Math.cos(wa) * 3.6, wz = cz + Math.sin(wa) * 3.6, wl = 2.4 + rand() * 1.2;
    if (ok(wx, wz, 1)) { const p0 = [wx - Math.sin(wa) * wl, wz + Math.cos(wa) * wl], p1 = [wx + Math.sin(wa) * wl, wz - Math.cos(wa) * wl]; N.push({ t: 'hurdle', a: p0, b: p1, y: Math.min(height(...p0), height(...p1)), h: 1.2, seed: 5 }); }
    const nP = 4 + Math.floor(rand() * 4);
    for (let k = 0; k < nP; k++) {
      const t = yaw + (k / nP) * 6.28 + rand() * 0.3, r = 1.9 + rand() * 0.5, at = [cx + Math.cos(t) * r, cz + Math.sin(t) * r];
      person(at, face(at, [cx, cz]), { pose: k === 0 ? 'squat' : rand() < 0.65 ? 'sit_ground' : 'talk' });
    }
    if (rand() < 0.6) { const at = [cx + Math.cos(yaw + 3) * 4.2, cz + Math.sin(yaw + 3) * 4.2]; person(at, rand() * 6.28, { pose: 'stand', carry: rand() < 0.5 ? 'pot' : 'basket' }); }
  }
  // the herd: a pen of hurdles beside the Avenue with oxen in it, drovers at the gate; more cattle loose on the grass beyond
  {
    const [pu, pv, W, D] = [128, -62, 18, 11];
    const c = P(pu, pv), corners = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]].map(([u, v]) => P(pu + u, pv + v));
    if (ok(c[0], c[1], 8)) {
      for (let k = 0; k < 4; k++) {
        const a = corners[k], b = corners[(k + 1) % 4];
        if (k === 3) { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], g = 1.6 / Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) * g, (b[1] - a[1]) * g]; N.push({ t: 'hurdle', a, b: [m[0] - d[0], m[1] - d[1]], y: height(...a), h: 1.25, seed: 2 }, { t: 'hurdle', a: [m[0] + d[0], m[1] + d[1]], b, y: height(...b), h: 1.25, seed: 3 }); }
        else N.push({ t: 'hurdle', a, b, y: Math.min(height(...a), height(...b)), h: 1.25, seed: k });
      }
      for (let k = 0; k < 9; k++) { const at = P(pu + (rand() - 0.5) * (W - 3), pv + (rand() - 0.5) * (D - 3)); L.push({ t: 'animal', kind: 'ox', at, y: height(...at), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
      const g = P(pu - W / 2 - 2, pv + D / 2 + 0.5);
      person(g, face(g, c), { carry: 'staff', pose: 'stand' }); const g2 = P(pu - W / 2 - 3.4, pv + D / 2 + 1.7); person(g2, face(g2, c) + 0.5, { pose: 'talk' });
    }
    for (let k = 0; k < 11; k++) {
      const u = 120 + rand() * 90, v = (rand() < 0.5 ? -1 : 1) * (40 + rand() * 45), at = P(u, v);
      if (!ok(at[0], at[1], 5) || Math.hypot(at[0] - c[0], at[1] - c[1]) < 14) continue;
      L.push({ t: 'animal', kind: 'ox', at, y: height(...at), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      if (k % 4 === 0) person([at[0] + 3, at[1] + 2], rand() * 6.28, { carry: 'staff', pose: 'stand' });
    }
  }
  // inside the huts, from a stream of its own: by the hearth, sitting on the floor or the bed's edge, one with a child; a hut left empty now and then
  {
    const r2 = rng(2599);
    HUTS.forEach((h, i) => {
      if (i % 4 === 3) return;
      const c = Math.cos(h.yaw), s = Math.sin(h.yaw), at = (u, v) => [h.c[0] + u * c - v * s, h.c[1] + u * s + v * c], y = h.y + 0.05;
      const mk = (u, v, to, o) => { const p = at(u, v), q = at(to[0], to[1]); L.push({ t: 'figure', at: p, y, rot: face(p, q), seed: Math.floor(r2() * 1e9), dress: r2() < 0.5 ? 'robe' : 'tunic', cloth: CLOTH[Math.floor(r2() * CLOTH.length)], cloth2: CLOTH[Math.floor(r2() * CLOTH.length)], skin: r2() < 0.5 ? 'skin_light' : 'skin_medium', hat: 'none', ...o }); };
      mk(0.85, 0.75, [0, 0], { pose: 'sit_ground' });
      if (i % 2 === 0) mk(-0.85, 0.7, [0, 0], { pose: 'sit_low' });
      if (i % 3 === 0) mk(0.2, 1.05, [0, 0], { pose: 'sit_ground', h: 0.62 });
    });
  }
  return [base('stonehenge-camp', N, 'neolithic'), base('stonehenge-camp-life', L, 'life')];
}

/** Where the village's open ground is free: not in a house, a fire, a figure or a camp. */
function freeSpots() {
  const H = houses(), pts = [];
  for (const p of feast()) for (const e of p.elements) { if (e.c) pts.push([e.c[0], e.c[1], 4]); }
  for (const p of camp()) for (const e of p.elements) { if (e.c) pts.push([e.c[0], e.c[1], e.t === 'camp_shelter' ? 3.5 : 5]); else if (e.a) pts.push([(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2, 3]); }
  for (const p of people()) pts.push([p.at[0], p.at[1], 1.6]);
  return (x, z, m) => H.every((h) => Math.hypot(h.c[0] - x, h.c[1] - z) > h.s * 1.1 + m) && pts.every(([a, b, r]) => Math.hypot(a - x, b - z) > r + m) && Math.hypot(x - DURR.c[0], z - DURR.c[1]) > DURR.r + 6
    && (() => { const [ds, dt] = durr(x, z); return !(ds > 0 && ds < DURR.r + DURR.len && Math.abs(dt) < DURR.w / 2 + 3); })();
}
const house_frame = (h) => { const c = Math.cos(h.yaw), s = Math.sin(h.yaw); return (u, v) => [h.c[0] + u * c - v * s, h.c[1] + u * s + v * c]; };

/** The living village (§10c): the yards before the doors, the work done in the open (flint, pots, baskets, grain, hides) with the workers at it,
 *  people at the hearth inside some houses; the scrub of the down; the track and the avenue trodden with chalk lumps and flints; the sheep with
 *  their herders on the down; and the people at the unfinished stone and about the entrance, where the visitor arrives. */
export function village() {
  const rand = rng(2510), H = houses(), free = freeSpots();
  const Y = [], C = [], K = [], S = [], L = [];
  const ax = Math.cos(AXIS), az = Math.sin(AXIS), P = (u, v) => [u * ax - v * az, u * az + v * ax];
  const person = (at, rot, o = {}) => L.push({ t: 'figure', at, y: height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.45 ? 'robe' : 'tunic', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: rand() < 0.6 ? 'skin_light' : 'skin_medium', hat: 'none', ...o });
  // the yards
  for (const h of H) Y.push({ t: 'yard', c: h.c, s: h.s, yaw: h.yaw, y: h.y, seed: h.seed, k: h.seed % 4 });
  // the people inside: at the hearth, on the log seat, in about a third of the houses
  for (const h of H) if (rand() < 0.33) {
    const F = house_frame(h), at = F(0.85, 0.15), hearth = F(0, -0.1);
    person(at, face(at, hearth), { pose: rand() < 0.5 ? 'sit_low' : 'sit_ground' });
    if (rand() < 0.4) { const a2 = F(-0.95, -0.2); person(a2, face(a2, hearth), { pose: 'sit_low' }); }
  }
  // the crafts, in the open spaces among the houses: each with its worker (and a watching child, a dog)
  const KINDS = ['knap', 'pots', 'basket', 'grind', 'hides'], POSE = { knap: 'squat', pots: 'squat', basket: 'sit_ground', grind: 'kneel', hides: 'kneel' };
  const spots = [];
  for (let n = 0; n < 2000 && spots.length < 28; n++) {
    const a = rand() * 6.28, d = 8 + rand() * 90, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    if (!free(x, z, 3) || Math.hypot(x, z) > RADIUS - 58 || spots.some((q) => Math.hypot(q[0] - x, q[1] - z) < 9)) continue;
    spots.push([x, z]);
  }
  spots.forEach(([x, z], i) => {
    const kind = KINDS[i % KINDS.length], yaw = rand() * 6.28;
    C.push({ t: 'craft', c: [x, z], y: height(x, z), yaw, kind, seed: Math.floor(rand() * 1e6) });
    const at = [x + Math.sin(yaw) * 1.4, z - Math.cos(yaw) * 1.4];
    person(at, face(at, [x, z]), { pose: POSE[kind] });
    if (rand() < 0.5) { const c2 = [x + Math.cos(yaw) * 2.2, z + Math.sin(yaw) * 2.2]; person(c2, face(c2, [x, z]), { pose: 'sit_ground', h: 0.62 }); }
    if (rand() < 0.35) L.push({ t: 'animal', kind: 'dog', at: [x - Math.sin(yaw) * 2.6, z + Math.cos(yaw) * 2.6], y: height(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  });
  // four-post granaries among the houses
  for (let n = 0, m = 0; n < 1500 && m < 16; n++) {
    const a = rand() * 6.28, d = 10 + rand() * 90, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    if (!free(x, z, 3.2) || Math.hypot(x, z) > RADIUS - 58 || C.some((q) => q.c && Math.hypot(q.c[0] - x, q.c[1] - z) < 5)) continue;
    m++; C.push({ t: 'granary', c: [x, z], y: height(x, z), yaw: rand() * 1.57, s: 2.0 + rand() * 0.5, seed: Math.floor(rand() * 1e6) });
  }
  // traders on their hides along the two avenues (goods came from across Britain: pots, polished axes of greenstone, hides, beads), a buyer or two at each
  {
    const spotsW = [];
    for (let s = DURR.r + 10; s < DURR.r + DURR.len - 6; s += 15) for (const sg of [-1, 1]) if (rand() < 0.55) spotsW.push([DURR.c[0] + DURR.dir[0] * s - DURR.dir[1] * sg * (DURR.w / 2 - 3), DURR.c[1] + DURR.dir[1] * s + DURR.dir[0] * sg * (DURR.w / 2 - 3), sg]);
    for (const [s, t] of [[78, -12.5], [104, 12.5], [150, -12.5], [186, 12.5], [226, -12.5]]) { const [x, z] = P(s, t); spotsW.push([x, z, 1]); }
    for (const [x, z] of spotsW) {
      if (Math.hypot(x, z) > RADIUS - 55) continue;
      const yaw = rand() * 6.28;
      C.push({ t: 'craft', c: [x, z], y: height(x, z), yaw, kind: 'wares', seed: Math.floor(rand() * 1e6) });
      const tr = [x + Math.sin(yaw) * 1.7, z - Math.cos(yaw) * 1.7]; person(tr, face(tr, [x, z]), { pose: 'sit_ground' });
      for (let k = 0, nb = 1 + Math.floor(rand() * 2); k < nb; k++) { const b = [x - Math.sin(yaw) * (1.8 + k * 0.7) + Math.cos(yaw) * (k - 0.5) * 1.3, z + Math.cos(yaw) * (1.8 + k * 0.7) + Math.sin(yaw) * (k - 0.5) * 1.3]; person(b, face(b, [x, z]) + (rand() - 0.5) * 0.5, { pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' }); }
    }
  }
  // the Southern Circle: a fire at its heart with people about it at the midwinter sunrise (the way the posts open toward the avenue)
  {
    const [cx, cz] = DURR.c;
    C.push({ t: 'feast_fire', c: [cx, cz], r: 2.4, y: height(cx, cz), yaw: 0.5, pig: false, seed: 909 });
    for (let k = 0; k < 6; k++) { const t = k / 6 * 6.28 + 0.4, at = [cx + Math.cos(t) * 2.7, cz + Math.sin(t) * 2.7]; person(at, face(at, [cx, cz]), { pose: k % 3 === 0 ? 'sit_ground' : k % 3 === 1 ? 'talk' : 'cross' }); }
    const posts = timberCircle()[0].posts;
    for (let k = 0, n = 0; k < 8 && n++ < 200;) { const t = rand() * 6.28, r = 7 + rand() * 4, at = [cx + Math.cos(t) * r, cz + Math.sin(t) * r]; if (posts.some((q) => Math.hypot(q.at[0] - at[0], q.at[1] - at[1]) < q.r + 0.75)) continue; k++; person(at, face(at, [cx, cz]) + (rand() - 0.5), { pose: rand() < 0.4 ? 'talk' : 'stand' }); }
  }
  // the scrub: gorse in clumps on the chalk, hawthorns alone and in threes (also by the barrows)
  const okScrub = (x, z, m) => { const r = Math.hypot(x, z), [, t] = avenue(x, z), [s0] = avenue(x, z); return r > DITCH.r + 12 && r < RADIUS - 55 && !(s0 > 0 && Math.abs(t) < 14) && free(x, z, m) && BARROWS.every(([bx, bz, br]) => Math.hypot(bx - x, bz - z) > br + 4); };
  for (let c = 0, n = 0; c < 26 && n++ < 600;) {
    const a = rand() * 6.28, d = 70 + rand() * 230, x0 = Math.cos(a) * d, z0 = Math.sin(a) * d;
    if (!okScrub(x0, z0, 3)) continue;
    c++;
    for (let k = 0, m = 2 + Math.floor(rand() * 4); k < m; k++) {
      const x = x0 + (rand() - 0.5) * 9, z = z0 + (rand() - 0.5) * 9;
      if (okScrub(x, z, 2)) S.push({ t: 'scrub', kind: 'gorse', c: [x, z], y: height(x, z), r: 0.8 + rand() * 0.9, h: 0.8 + rand() * 0.8, seed: Math.floor(rand() * 1e6) });
    }
  }
  for (let c = 0, n = 0; c < 18 && n++ < 600;) {
    const near = rand() < 0.5 ? BARROWS[Math.floor(rand() * BARROWS.length)] : null;
    const a = rand() * 6.28, d = near ? near[2] + 8 + rand() * 6 : 90 + rand() * 210, x = (near ? near[0] : 0) + Math.cos(a) * d, z = (near ? near[1] : 0) + Math.sin(a) * d;
    if (!okScrub(x, z, 3)) continue;
    c++;
    S.push({ t: 'scrub', kind: 'hawthorn', c: [x, z], y: height(x, z), r: 1.3 + rand() * 0.9, h: 1.7 + rand() * 1.2, seed: Math.floor(rand() * 1e6) });
  }
  // the trodden track and the avenue: chalk lumps and flints kicked up along them
  for (let s = 40; s < RADIUS - 40; s += 8) { const [x, z] = P(s, (rand() - 0.5) * 6); if (Math.abs(s - HEEL_D) > 6) S.push({ t: 'litter', kind: 'path', c: [x, z], y: height(x, z), r: 2.6, n: 14, seed: Math.floor(rand() * 1e6) }); }
  for (let s = DURR.r + 3; s < DURR.r + DURR.len; s += 7) { const t = (rand() - 0.5) * DURR.w * 0.8, x = DURR.c[0] + DURR.dir[0] * s - DURR.dir[1] * t, z = DURR.c[1] + DURR.dir[1] * s + DURR.dir[0] * t; S.push({ t: 'litter', kind: 'path', c: [x, z], y: height(x, z), r: 3, n: 18, seed: Math.floor(rand() * 1e6) }); }
  // sheep on the down with a herder and a dog each (a few; the Neolithic flocks were small, mixed with goats)
  const flocks = [[-150, 210], [-232, -58], [120, -260], [180, 160], [-180, -170], [-60, 120]];
  for (const [fx, fz] of flocks) {
    const x0 = fx + (rand() - 0.5) * 20 + 22, z0 = fz + (rand() - 0.5) * 20 + 14;
    if (!okScrub(x0, z0, 4)) continue;
    for (let k = 0, m = 7 + Math.floor(rand() * 5); k < m; k++) { const x = x0 + (rand() - 0.5) * 16, z = z0 + (rand() - 0.5) * 12; if (okScrub(x, z, 1)) L.push({ t: 'animal', kind: k % 6 === 5 ? 'goat' : 'sheep', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) }); }
    person([x0 + 9, z0 - 5], rand() * 6.28, { carry: 'staff', pose: 'stand', over: 'cloak' });
    L.push({ t: 'animal', kind: 'dog', at: [x0 + 7, z0 - 4], y: height(x0 + 7, z0 - 4), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  }
  // at the arrival: the unfinished stone and the men dressing it, a knapper and a child watching, a woman bringing water
  {
    const blk = P(34, 24);
    for (const [u, v, pose, rr] of [[31.5, 22.5, 'squat', 0.6], [36.5, 25.3, 'squat', 3.5], [33.5, 19.8, 'stand', 0.2]]) { const at = P(u, v); person(at, face(at, blk) + rr * 0.1, { pose }); }
    const kn = P(26, 18); C.push({ t: 'craft', c: kn, y: height(...kn), yaw: 1.1, kind: 'knap', seed: 4242 }); const w = P(26.2, 19.6); person(w, face(w, kn), { pose: 'squat' });
    const ch = P(28.4, 16.6); person(ch, face(ch, kn), { pose: 'stand', h: 0.6 });
    const wm = P(41, 17); person(wm, face(wm, [0, 0]) + 0.4, { dress: 'wrap', carry: 'pot' });
    const dg = P(30.5, 20.5); L.push({ t: 'animal', kind: 'dog', at: dg, y: height(...dg), rot: 2, seed: 77 });
  }
  // a sarsen being hauled up the Avenue on a sledge-ladder over rollers: the team of men and oxen ahead of it hauling toward the circle, the
  // rollers and the lever men behind, children running alongside; a second knot of people at the Heel Stone with their gifts
  {
    const stoneAt = P(124, 1.5);
    C.push({ t: 'standing_stone', at: P(121, 0), y: height(...P(121, 0)) + 0.35, yaw: AXIS, lying: true, h: 4.6, w0: 1.5, w1: 1.3, d0: 1.0, d1: 0.9, rough: 0.14, dress: 0, bury: 0.1, mat: 'rock_boulder', natural: true, tool: { faces: 'none', lichen: 20 }, seed: 6001 });
    const hz = P(122, 1.5); S.push({ t: 'litter', kind: 'dressing', c: hz, y: height(...hz), r: 2.6, n: 22, seed: 6002 });
    for (const [u, v, rot] of [[100, -1.3, 0], [100, 1.3, 0], [103.5, -1.6, 0], [103.5, 1.6, 0], [107, -1.0, 0], [107, 1.0, 0], [110.5, -1.7, 0], [110.5, 1.7, 0], [114, -1.1, 0], [114, 1.1, 0]]) { const at = P(u, v); person(at, face(at, P(u - 10, v)) + rot, { pose: 'stand', dress: 'tunic', carry: 'rope' }); }
    for (const v of [-0.9, 0.9]) { const at = P(95, v); L.push({ t: 'animal', kind: 'ox', at, y: height(...at), rot: face(at, P(60, v)), seed: 6010 + Math.round(v * 10), gear: true }); }
    for (const [u, v] of [[132, -2.0], [133, 2.2], [135, 0.2]]) { const at = P(u, v); person(at, face(at, stoneAt), { pose: 'stand', carry: 'staff' }); }
    for (const [u, v] of [[118, 4.8], [121, 5.6]]) { const at = P(u, v); person(at, rand() * 6.28, { pose: 'stand', h: 0.6 }); }
    // pilgrim parties and offerings between the entrance and the Heel Stone
    for (const [u, v, n] of [[60, 5.2, 3], [66, -4.4, 2], [88, 5.5, 3], [92, -5.4, 2]]) for (let k = 0; k < n; k++) { const at = P(u + (k - 1) * 1.2, v + (rand() - 0.5) * 1.4); person(at, face(at, [0, 0]) + (rand() - 0.5) * 0.8, { pose: k === 0 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' }); }
  }
  const rooms = H.map((h, i) => { const k = h.s / 2 / (Math.abs(Math.cos(h.yaw)) + Math.abs(Math.sin(h.yaw))) - 0.15; return { id: 'house ' + i, rect: [h.c[0] - k, h.c[1] - k, h.c[0] + k, h.c[1] + k], y: h.y, kind: 'hall' }; });
  return [base('stonehenge-yards', Y, 'neolithic', rooms), base('stonehenge-crafts', C, 'neolithic'), base('stonehenge-scrub', S, 'neolithic'), base('stonehenge-village-life', L, 'life')];
}
const HEEL_D = HEEL.d;

/** No figure or animal within 9 m of where the visitor arrives (34, -16): moved out along the line from the arrival. */
const ARR = [34, -16];
function clearArrival(plans) {
  for (const p of plans) for (const e of p.elements) {
    if ((e.t !== 'figure' && e.t !== 'animal') || !e.at) continue;
    const dx = e.at[0] - ARR[0], dz = e.at[1] - ARR[1], d = Math.hypot(dx, dz);
    if (d < 9) { const k = d < 0.01 ? 1 : 9.5 / d, a = d < 0.01 ? [1, 0] : [dx, dz], x = ARR[0] + (d < 0.01 ? 9.5 : a[0] * k), z = ARR[1] + (d < 0.01 ? 0 : a[1] * k); e.at = [x, z]; e.y = height(x, z); }
  }
  return plans;
}
export async function town() {
  return clearArrival([
    base('stonehenge-timber-circle', timberCircle(), 'neolithic'),
    base('stonehenge-houses', houses().map((h) => ({ t: 'neolithic_house', ...h })), 'neolithic'),
    base('stonehenge-people', people(), 'life'),
    ...feast(),
    ...camp(),
    ...village(),
  ]);
}
void avenue;
