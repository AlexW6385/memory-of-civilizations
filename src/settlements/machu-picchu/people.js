// The people of Machu Picchu (docs/settlements/machu-picchu.md §5.2): men breaking the terraces' soil with
// the foot plough, side by side, a woman facing them with a hoe to break the clods; llama herders with their
// animals on the Main Plaza and on the way in; women weaving on backstrap looms in the kanchas' patios;
// quarrymen dressing blocks; a noble and a priest before the Main Temple, chosen women (aqllakuna) at the
// Three Windows; a guard at the Guardhouse. Dress: the men's knee-length tunic (unku) and mantle, the
// women's ankle-length wrap (anaku) under a shawl (lliklla), sandals [stated: encyclopedia.com, "America,
// South: History of Dress"].

import { SITE, TERRACE, KNOLL, hillRing, PLOUGH, CONDOR, kanchas, fountains, houses } from './layout.js';
import { ground } from './ground.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const N = 0, S = Math.PI, E = -Math.PI / 2, W = Math.PI / 2;
/** A figure's local point (x right, y up, z back: it faces −z) at (at, y, rot), height h, in plan coordinates. */
const toPlan = (at, y, rot, h, [lx, ly, lz]) => { const k = h / 1.65, c = Math.cos(rot), s = Math.sin(rot); return [at[0] + (lx * c + lz * s) * k, y + ly * k, at[1] + (-lx * s + lz * c) * k]; };
/** The ellipse's point at angle t grown by d (a terrace's line), and the outward normal there. */
const ring = (t, d) => [Math.cos(t) * (SITE.a + d), Math.sin(t) * (SITE.b + d)];
const outward = (t, d) => { const nx = Math.cos(t) / (SITE.a + d), nz = Math.sin(t) / (SITE.b + d), l = Math.hypot(nx, nz); return [nx / l, nz / l]; };
const facing = ([dx, dz]) => Math.atan2(-dx, -dz);          // the rot that turns a figure's face to (dx, dz)

export function people() {
  const rand = rng(1471), figures = [], gear = [], seed = () => Math.floor(rand() * 1e9);
  const CL = ['cloth_brown', 'cloth_ochre', 'cloth_red', 'cloth_black', 'cloth_brown'];
  const man = (o) => ({ t: 'figure', dress: 'tunic', legs: 'bare', cloth: CL[Math.floor(rand() * 5)], cloth2: CL[Math.floor(rand() * 5)], over: rand() < 0.5 ? 'cape' : 'belt', hair: 'short', beard: false, skin: 'skin_medium', hat: 'none', feet: 'shod', seed: seed(), ...o });
  const woman = (o) => ({ t: 'figure', dress: 'robe', cloth: CL[Math.floor(rand() * 5)], cloth2: CL[Math.floor(rand() * 5)], over: 'shawl', hair: 'long', beard: false, skin: 'skin_medium', hat: 'none', feet: 'shod', seed: seed(), ...o });

  // the ploughing teams on the terraces: men side by side facing down the terrace, each with his foot plough, the
  // blade in the earth before him; a woman facing them across the furrow with her hoe [stated: men "side by side",
  // MOT; "his wife faced him with a hoe to break clods", Rowe in ancient-history-sites]
  for (const [t0, j, n] of PLOUGH) {
    const y = -TERRACE.h * j, dm = TERRACE.w * j - 2.05, dw = TERRACE.w * j - 0.72;
    for (let i = 0; i < n; i++) {
      const t = t0 + i * 1.35 / (SITE.b + dm) * Math.sign(Math.cos(t0) || 1), at = ring(t, dm), o = outward(t, dm), rot = facing(o), h = 1.56 + rand() * 0.14;
      figures.push(man({ at, y, rot, h, arms: 'staff', pose: 'stand' }));
      // the plough: its handle in the right hand, leaning back to the man, the blade in the soil before him
      const hand = toPlan(at, y, rot, h, [0.25, 1.11, -0.25]), lean = 0.3, k = 1.3, d = [Math.sin(rot) * Math.sin(lean), Math.cos(lean), Math.cos(rot) * Math.sin(lean)];
      gear.push({ t: 'chakitaqlla', at: [hand[0] - d[0] * k, hand[2] - d[2] * k], y: hand[1] - d[1] * k, yaw: rot + Math.PI, lean });
      if (i % 2 === 0) { const aw = ring(t, dw); figures.push(woman({ at: aw, y, rot: facing([-o[0], -o[1]]), carry: 'hoe', h: 1.48 + rand() * 0.08 })); }
    }
  }

  // llama herds: a herder and his animals grazing on the Main Plaza; a string coming in by the south lane
  for (const [cx, cz, n] of [[8, -30, 6], [12, 60, 4]]) {
    figures.push(man({ at: [cx - 3, cz + 1], y: ground.height(cx - 3, cz + 1), rot: facing([1, -0.3]), pose: 'staff', staffMat: 'wood_dark', len: 1.1, over: 'cape' }));
    for (let i = 0; i < n; i++) { const a = rand() * 6.28, r = 2 + rand() * 4, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; figures.push({ t: 'animal', kind: 'llama', at: [x, z], y: ground.height(x, z), rot: rand() * 6.28, seed: seed(), graze: rand() < 0.6 }); }
  }
  for (let i = 0; i < 4; i++) { const x = 4 + (i % 2) * 0.6, z = 92 + i * 2.6; figures.push({ t: 'animal', kind: 'llama', at: [x, z], y: ground.height(x, z), rot: N + (rand() - 0.5) * 0.3, seed: seed(), graze: false }); }
  figures.push(man({ at: [3.4, 103], y: 0, rot: N, pose: 'staff', staffMat: 'wood_dark', len: 1.1 }));

  // the weavers in the patios: kneeling, the backstrap loom's near bar at her waist, the far bar tied to a post
  for (const [ki, K] of kanchas().entries()) {
    // the patio's own people: a man at the gate with a load of firewood or a bundle, a child, a dog asleep (every patio but the weavers' skip is by ki)
    { const gate = K.at(K.A / 2 + (ki % 2 ? 2.2 : -2.2), 1.5), rotG = facing(K.inward);
      if (ki % 3 !== 1) figures.push(man({ at: gate, y: ground.height(...gate), rot: rotG, carry: ki % 2 ? 'bundle' : 'basket', h: 1.6 + rand() * 0.1 }));
      const ch = K.at(K.A / 2 + (ki % 2 ? -2.6 : 2.6), Math.min(K.sv0 + 1.2, K.D - K.bd - 2));
      figures.push((ki % 2 ? woman : man)({ at: ch, y: ground.height(...ch), rot: rand() * 6.28, h: 0.95 + rand() * 0.15, pose: 'stand', over: 'belt' }));
      if (ki % 2 === 0) { const dg = K.at(K.A / 2 + 1.9, Math.min(K.sv0 + 0.5, 3)); figures.push({ t: 'animal', kind: 'dog', at: dg, y: ground.height(...dg), rot: rand() * 6.28, seed: seed(), graze: false }); } }
    if (ki % 5 === 0 || rand() < 0.3) continue;
    const at = K.at(12 + (rand() - 0.5) * 4, 4.5 + rand() * 2), rot = facing(K.inward), h = 1.5;
    const yk = ground.height(...at);
    figures.push(woman({ at, y: yk, rot, h, pose: 'seiza' }));
    const waist = toPlan(at, yk, rot, h, [0, 0.42, -0.22]), far = [at[0] + K.inward[0] * 2.1, at[1] + K.inward[1] * 2.1];
    gear.push({ t: 'backstrap_loom', a: [waist[0], waist[1], waist[2]], b: [far[0], yk + 0.8, far[1]], cloth: ['cloth_red', 'cloth_ochre', 'cloth_black'][Math.floor(rand() * 3)], seed: seed() });
  }

  // on the lanes below the platforms, in the south half of the town (what the arrival looks over): a woman with a pot or a man with his load coming down a gate's stair, now and then a llama string-boy resting on it
  { let n = 0;
    for (const [ki, K] of kanchas().entries()) {
      if (K.rect[1] < 10 || n >= 14 || ki % 2) continue;
      const gateE = K.inward[0] < 0, gz = K.rect[1] + K.A / 2 + (ki % 4 ? 2.4 : -2.4), gx = gateE ? K.rect[2] : K.rect[0], ox = gateE ? 1 : -1, at = [gx + ox * 2.0, gz], rot = facing([-ox, 0.15]);
      if (Math.abs(at[0] - 2) < 4) continue;                 // not on the road
      const y = ground.height(...at);
      figures.push((n % 2 ? woman : man)({ at, y, rot, carry: n % 3 === 0 ? 'pot' : n % 3 === 1 ? 'bundle' : 'basket', h: 1.5 + rand() * 0.12 }));
      n++;
    } }
  // the quarrymen dressing the blocks lined up on the quarry's east side
  for (const [x, z, rot] of [[-27.3, -17.6, E + 0.2], [-26.9, -13.5, E - 0.3]]) figures.push(man({ at: [x, z], y: 0, rot, pose: 'squat', over: 'belt', cloth: 'cloth_brown' }));
  figures.push(man({ at: [-31, -10], y: 0, rot: S - 0.4, pose: 'stand' }));

  // before the Main Temple: a noble in a red mantle and a priest; chosen women at the Temple of the Three Windows
  figures.push(man({ at: [-43, -38], y: 0, rot: N, cloth: 'cloth_red', cloth2: 'cloth_black', over: 'cape', h: 1.68 }));
  figures.push(man({ at: [-41.2, -38.6], y: 0, rot: N + 0.5, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cape', pose: 'talk' }));
  for (const [x, z] of [[-34.5, -50], [-34.3, -47.6]]) figures.push(woman({ at: [x, z], y: 0, rot: W + (rand() - 0.5) * 0.4, cloth: 'cloth_white', cloth2: 'cloth_red', h: 1.5 }));

  // the guard at the Guardhouse, seated in its open side
  figures.push(man({ at: [KNOLL.c[0] - 3.2, KNOLL.c[1] + 1.6], y: 2.2 * KNOLL.n + 0.3, rot: N, pose: 'sit_low', over: 'cape' }));
  // the chaski's post on the road south of the fields (§5.3): a runner seated on the bench by its hut, his pututu and
  // quipu beside him, another standing at the road's edge looking south for the next to come; travellers on the road
  // with their loads in a cloth on the back (q'ipi), a woman with her child, a porter, a string of two llamas
  gear.push({ t: 'chaski_bench', at: [5.75, 121.9], y: ground.height(5.75, 121.9), rot: 0 });
  figures.push(man({ at: [5.55, 121.7], y: ground.height(5.55, 121.7), rot: W, pose: 'sit', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'belt', h: 1.62 }));
  figures.push(man({ at: [3.5, 123.6], y: ground.height(3.5, 123.6), rot: S, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'belt', pose: 'stand', h: 1.64 }));
  for (const [x, z, rot, o] of [[5.6, 131, N, { carry: 'bundle' }], [6.6, 134, N, { carry: 'bundle', over: 'cape' }], [2.2, 112.5, S, {}], [5.8, 146, N, { carry: 'bundle' }]]) figures.push(man({ at: [x, z], y: ground.height(x, z), rot, ...o }));
  figures.push(woman({ at: [6.9, 140.5], y: ground.height(6.9, 140.5), rot: N, carry: 'child', h: 1.5 }));
  figures.push(woman({ at: [5.4, 137.8], y: ground.height(5.4, 137.8), rot: N, carry: 'bundle', h: 1.48 }));
  for (const [x, z] of [[6.6, 149.5], [6.8, 152.0]]) figures.push({ t: 'animal', kind: 'llama', at: [x, z], y: ground.height(x, z), rot: N + (rand() - 0.5) * 0.2, seed: seed(), graze: false });
  figures.push(man({ at: [6.4, 154.4], y: ground.height(6.4, 154.4), rot: N, pose: 'staff', staffMat: 'wood_dark', len: 1.1, over: 'cape' }));
  // the neck's fields below the Guardhouse (the arrival's foreground): a team ploughing a plot, a woman with her hoe facing them,
  // women weeding the maize on the other side of the road, a boy with his llamas on the knoll's terraces, spearmen at the gate
  {
    const plough = (at, rot, h) => {
      const y = ground.height(at[0], at[1]);
      figures.push(man({ at, y, rot, h, arms: 'staff', pose: 'stand' }));
      const hand = toPlan(at, y, rot, h, [0.25, 1.11, -0.25]), lean = 0.3, k = 1.3, d = [Math.sin(rot) * Math.sin(lean), Math.cos(lean), Math.cos(rot) * Math.sin(lean)];
      gear.push({ t: 'chakitaqlla', at: [hand[0] - d[0] * k, hand[2] - d[2] * k], y: hand[1] - d[1] * k, yaw: rot + Math.PI, lean });
    };
    for (let i = 0; i < 3; i++) plough([-13.4 + i * 1.4, 104.5], N, 1.58 + rand() * 0.1);
    figures.push(woman({ at: [-12, 102.4], y: ground.height(-12, 102.4), rot: S, carry: 'hoe', h: 1.5 }));
    for (const [x, z] of [[9.2, 100.5], [11.3, 102.6], [9.9, 105.8], [12, 108]]) figures.push(woman({ at: [x, z], y: ground.height(x, z), rot: rand() * 6.28, pose: 'squat', h: 1.45 + rand() * 0.08 }));
    figures.push(man({ at: [-38, 103.5], y: ground.height(-38, 103.5), rot: E + 0.4, carry: 'basket', h: 1.6 }));
    // the boy and his llamas on the knoll's treads, facing the way in
    const kt = (m, th) => { const d = KNOLL.r + 6 - 2.4 * (m + 0.5), x = KNOLL.c[0] + Math.cos(th) * d, z = KNOLL.c[1] + Math.sin(th) * d; return [x, z, 2.2 * m]; };
    for (const [m, th] of [[1, -1.2], [1, -1.62], [2, -1.9], [3, -1.35], [1, -2.05]]) { const [x, z, y] = kt(m, th); figures.push({ t: 'animal', kind: 'llama', at: [x, z], y, rot: rand() * 6.28, seed: seed(), graze: true }); }
    { const [x, z, y] = kt(1, -1.45); figures.push(man({ at: [x, z], y, rot: S + 0.6, h: 1.1, pose: 'staff', staffMat: 'wood_dark', len: 1.0, over: 'belt' })); }
    // on the knoll's stair below the arrival: a porter coming down with his load, a woman with a pot going up, a girl behind her
    { const top = 2.2 * KNOLL.n, zl = KNOLL.c[1] - KNOLL.r - 10, zh = KNOLL.c[1] - hillRing(KNOLL, KNOLL.n - 1) + 0.6, ns = Math.round(top / 0.16), yAt = (z) => top * Math.ceil((z - zl) / (zh - zl) * ns) / ns;
      figures.push(man({ at: [KNOLL.c[0] + 0.55, 121.5], y: yAt(121.5), rot: N + 0.05, carry: 'bundle', h: 1.62 }));
      figures.push(woman({ at: [KNOLL.c[0] - 0.55, 115.5], y: yAt(115.5), rot: S, carry: 'pot', h: 1.5 }));
      figures.push(woman({ at: [KNOLL.c[0] + 0.3, 113.2], y: yAt(113.2), rot: S - 0.1, h: 1.2, over: 'shawl' })); }
    // the spearmen of the gate, inside the wall to either side of the road
    for (const [x, z, r] of [[-0.5, 81.2, S + 0.15], [4.5, 81.2, S - 0.15]]) figures.push(man({ at: [x, z], y: 0, rot: r, pose: 'staff', staffMat: 'wood_dark', len: 1.85, cloth: 'cloth_red', cloth2: 'cloth_black', over: 'cape', h: 1.7 }));
  }
  // the women at the fountains, urpu under the jet, on every third of the sixteen
  for (const [i, f] of fountains().entries()) {
    if (i % 3 !== 1) continue;
    const at = [f.c[0] - 0.25, f.c[1] + (i % 2 ? 0.25 : -0.25)];
    figures.push(woman({ at, y: f.y, rot: facing([1, 0]), carry: 'pot', h: 1.48 + rand() * 0.06 }));
  }
  // llamas grazing on the terraces' grass, in twos
  for (const [t, j] of [[0.6, 4], [0.75, 4], [2.5, 6], [2.62, 6], [-1.0, 8], [-1.12, 8], [3.9, 10], [-2.3, 5], [-2.2, 5], [1.5, 7]]) {
    const d = TERRACE.w * j - 1.5, at = ring(t, d), y = -TERRACE.h * j;
    if (Math.abs(ground.height(at[0], at[1]) - y) > 0.3) continue;       // not on a terrace now (the neck's cut, a peak's slope)
    figures.push({ t: 'animal', kind: 'llama', at, y, rot: rand() * 6.28, seed: seed(), graze: true });
  }
  // the feast on the Main Plaza: four seated round the jars, a woman serving, two men talking before the kallanka
  for (const [i, a] of [0.3, 1.35, 3.45, 5.55].entries()) {
    const r = 3.25, at = [4 + Math.cos(a) * r, -24 + Math.sin(a) * r], y = ground.height(at[0], at[1]);
    figures.push((i % 2 ? woman : man)({ at, y, rot: facing([-Math.cos(a), -Math.sin(a)]), pose: 'cross' }));
  }
  { const at = [5.2, -22.1]; figures.push(woman({ at, y: ground.height(...at), rot: S, carry: 'pot', cloth: 'cloth_red', h: 1.5 })); }
  for (const [x, z, rot] of [[22.4, -40, W + 3.14], [23.2, -39.2, W], [22.6, -19.5, E + 3.14 + 0.4]]) figures.push(man({ at: [x, z], y: ground.height(x, z), rot, pose: 'talk' }));
  // before the Temple of the Condor, a priest in white
  { const at = [CONDOR.c[0] + Math.sin(CONDOR.yaw) * 5.2, CONDOR.c[1] + Math.cos(CONDOR.yaw) * 5.2]; figures.push(man({ at, y: ground.height(...at), rot: facing([-Math.sin(CONDOR.yaw), -Math.cos(CONDOR.yaw)]), cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cape', pose: 'stand' })); }
  // porters and a string of llamas on the road between the gate and the plaza, kept to its east edge
  for (const [x, z, o] of [[4.6, 62, { carry: 'bundle' }], [5.4, 47, { carry: 'basket' }], [4.4, 30, { carry: 'bundle', over: 'cape' }]]) figures.push(man({ at: [x, z], y: 0, rot: N + (rand() - 0.5) * 0.4, ...o }));
  figures.push(woman({ at: [5.0, 38], y: 0, rot: S, carry: 'child' }));
  for (const z of [54, 55.8, 57.6]) figures.push({ t: 'animal', kind: 'llama', at: [5.2, z], y: 0, rot: N + 0.1, seed: seed(), graze: false });
  // the people at home in the houses within 140 m of the arrival (their hearths lit: town.js): a woman cooking or spinning by the stove, a man mending a tool or resting, a grandmother with a child, on about every second house
  { const A = [-21, 129.8], inV = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] };
    for (const [i, h] of houses().entries()) {
      const [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (Math.hypot(cx - A[0], cz - A[1]) >= 140 || i % 2) continue;
      const y = Math.min(ground.height(x0, z0), ground.height(x1, z0), ground.height(x0, z1), ground.height(x1, z1)) + 0.04, d = inV[h.front], k = (h.seed % 3);
      const at = [cx - d[1] * 0.5, cz + d[0] * 0.5];
      if (k === 0) figures.push(woman({ at, y, rot: facing(d), pose: 'cross', carry: 'none', h: 1.46 + rand() * 0.06 }));
      else if (k === 1) { figures.push(man({ at, y, rot: facing([-d[0], -d[1]]), pose: 'cross', carry: 'none' })); }
      else { figures.push(woman({ at, y, rot: facing(d), pose: 'cross', h: 1.5 })); figures.push({ ...woman({ at: [at[0] + d[0] * 0.55 - d[1] * 0.5, at[1] + d[1] * 0.55 + d[0] * 0.5], y, rot: facing([-d[0], -d[1]]), pose: 'stand', h: 1.0 }), cloth: 'cloth_red' }); }
    } }
  return { figures, gear };
}
