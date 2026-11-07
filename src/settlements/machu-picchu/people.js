// The people of Machu Picchu (docs/settlements/machu-picchu.md §5.2): men breaking the terraces' soil with
// the foot plough, side by side, a woman facing them with a hoe to break the clods; llama herders with their
// animals on the Main Plaza and on the way in; women weaving on backstrap looms in the kanchas' patios;
// quarrymen dressing blocks; a noble and a priest before the Main Temple, chosen women (aqllakuna) at the
// Three Windows; a guard at the Guardhouse. Dress: the men's knee-length tunic (unku) and mantle, the
// women's ankle-length wrap (anaku) under a shawl (lliklla), sandals [stated: encyclopedia.com, "America,
// South: History of Dress"].

import { SITE, TERRACE, KNOLL, PLOUGH, kanchas } from './layout.js';
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
  for (const K of kanchas()) {
    if (rand() < 0.45) continue;
    const at = K.at(12 + (rand() - 0.5) * 4, 4.5 + rand() * 2), rot = facing(K.inward), h = 1.5;
    figures.push(woman({ at, y: 0, rot, h, pose: 'seiza' }));
    const waist = toPlan(at, 0, rot, h, [0, 0.42, -0.22]), far = [at[0] + K.inward[0] * 2.1, at[1] + K.inward[1] * 2.1];
    gear.push({ t: 'backstrap_loom', a: [waist[0], waist[1], waist[2]], b: [far[0], 0.8, far[1]], cloth: ['cloth_red', 'cloth_ochre', 'cloth_black'][Math.floor(rand() * 3)], seed: seed() });
  }

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
  return { figures, gear };
}
