// The standing life of Samarkand c. 1420 (docs/settlements/timurid-samarkand.md §5, §7, §10): students and a teacher in the
// madrasa's court and its classroom, merchants and their camels and donkeys at the Registan's east side and the
// bazaar, shopkeepers sitting on the sills of the shops, water carriers at the aryk. (The walkers are in movers.js.)

import { RADIUS, SQUARE, MADRASA, SHOPS_N, SHOPS_S, BAZAAR, CHORSU, marketLayout, houses, houseGeom } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function life() {
  const rand = rng(1421), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  /** A man in a long robe (chapan) with a sash and a turban, or a woman in a long robe with a headcloth. */
  const person = (at, rot, o = {}) => {
    const woman = !o.man && rand() < 0.2;
    L.push({ t: 'figure', at, y: o.y ?? 0.04, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.7 ? 'skin_medium' : 'skin_light', dress: 'robe',
      ...(woman ? { cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_maroon']), cloth2: 'cloth_white', hat: 'veil', hair: 'long' }
        : { cloth: pick(['cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_brown', 'cloth_maroon']), cloth2: pick(['cloth_white', 'cloth_ochre']), over: 'sash', hat: 'turban', hatMat: pick(['cloth_white', 'cloth_white', 'cloth_ochre']), hair: 'short', beard: true }),
      pose: rand() < 0.3 ? 'talk' : 'stand', ...o });
  };
  const [sx0, sz0, sx1, sz1] = SQUARE;
  // the Registan: scholars crossing to the madrasa's pishtaq, merchants talking, a few standing in groups
  for (let k = 0; k < 14; k++) person([sx0 + 6 + rand() * 40, -21 + rand() * 42], rand() * 6.28);
  for (const z of [-20, -8, 6, 18]) person([-40, z], Math.PI / 2, { man: true, pose: 'stand', cloth: 'cloth_white', cloth2: 'cloth_white' });
  // a caravan resting at the east side: camels kneeling and standing with their bales, the cameleers, donkeys
  for (let k = 0; k < 5; k++) L.push({ t: 'animal', kind: 'camel', at: [32 + (k % 2) * 3, -26 + k * 5.5], y: 0.04, rot: Math.PI / 2 + (rand() - 0.5) * 0.4, seed: Math.floor(rand() * 1e9), gear: k !== 2 });
  for (const [x, z] of [[30, -22], [30, -6], [31, 12]]) person([x, z], Math.PI / 2, { man: true, pose: 'staff', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  for (const [x, z] of [[28, 24], [30, 27]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0.04, rot: Math.PI * 0.9, seed: Math.floor(rand() * 1e9), gear: true });
  // the shops: a shopkeeper sitting cross-legged on each second shop's sill, a buyer at some
  for (const [r, face] of [[SHOPS_N, 0], [SHOPS_S, Math.PI]]) {
    const n = Math.round((r[2] - r[0]) / 3.6), w = (r[2] - r[0]) / n;
    for (let i = 0; i < n; i += 2) {
      const xc = r[0] + (i + 0.5) * w, z = face === 0 ? r[3] - 0.8 : r[1] + 0.8;
      person([xc, z], face, { man: true, pose: 'cross', y: 0.5 });
      if (rand() < 0.4) person([xc + (rand() - 0.5) * 2, face === 0 ? r[3] + 1.6 : r[1] - 1.6], face + Math.PI + (rand() - 0.5), {});
    }
  }
  // the madrasa's court: students with their books, a teacher with a group by the north iwan, a water carrier at the cell doors
  const [mx0, mz0, mx1, mz1] = MADRASA, zm = (mz0 + mz1) / 2, cx = (mx0 + mx1) / 2 - 7;
  for (let k = 0; k < 9; k++) person([cx - 20 + rand() * 40, zm - 14 + rand() * 28], rand() * 6.28, { man: true, cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_indigo']), pose: rand() < 0.5 ? 'talk' : 'stand' });
  for (const [x, z] of [[cx - 4, zm - 12.5], [cx - 1.8, zm - 12.2], [cx - 6, zm - 12]]) person([x, z], Math.PI, { man: true, pose: 'cross', hatMat: 'cloth_white', cloth: 'cloth_white' });
  person([cx - 2.5, zm - 10.4], 0, { man: true, pose: 'talk', cloth: 'cloth_green', cloth2: 'cloth_white' });
  // the classroom: the teacher on the divan, students seated on the carpet
  { const rx0 = -58, rz0 = -25.6, rx1 = -47.4, rz1 = -18.5;
    person([rx1 - 1.4, (rz0 + rz1) / 2], -Math.PI / 2, { man: true, pose: 'cross', y: 0.47, cloth: 'cloth_green', cloth2: 'cloth_white' });
    for (let i = 0; i < 4; i++) person([rx0 + 2.5 + i * 2.0, (rz0 + rz1) / 2 + 1.5], Math.PI, { man: true, pose: 'cross', y: 0.1, cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_grey']) }); }
  // the market: a seller behind each stall's table, a buyer at every third; the sellers of the mats sit behind them
  { const { stalls, spreads } = marketLayout();
    stalls.forEach(([x, z, yaw], i) => {
      const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
      person(P(0, -0.75), yaw, { man: true, pose: i % 3 === 0 ? 'talk' : 'stand' });
      if (i % 3 === 1) person(P((rand() - 0.5) * 2, 1.6), yaw + Math.PI + (rand() - 0.5) * 0.6, {});
    });
    spreads.forEach(([x, z, yaw], i) => { if (i % 2) return; const c = Math.cos(yaw), s = Math.sin(yaw); person([x - 1.5 * s * 0.0 + (-1.25) * s, z + (-1.25) * c], yaw, { man: true, pose: 'cross', y: 0.03 }); }); }
  // the lanes: someone at the street door of about every second furnished house (a woman with a jar, an old man on the bench, a boy), a dog or a donkey now and then
  { let k = 0;
    for (const h of houses()) {
      if (h.garden || !h.full || (k++ % 2)) continue;
      const G = houseGeom(h), [px, pz] = G.toWorld(h.xd + (rand() < 0.5 ? -2.6 : 2.6), G.D / 2 + 1.4), face = Math.atan2(G.toWorld(0, G.D / 2 + 2)[0] - G.cx, G.toWorld(0, G.D / 2 + 2)[1] - G.cz);
      const r = rand();
      if (r < 0.4) person([px, pz], face + Math.PI * 0.5, { man: true, pose: rand() < 0.5 ? 'talk' : 'stand' });
      else if (r < 0.7) person([px, pz], face + Math.PI, { pose: 'stand' });
      else if (r < 0.85) L.push({ t: 'animal', kind: 'donkey', at: [px, pz], y: 0.04, rot: face + Math.PI / 2, seed: Math.floor(rand() * 1e9), gear: rand() < 0.5 });
      else L.push({ t: 'animal', kind: 'dog', at: [px, pz], y: 0.04, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
    } }
  // the bazaar: porters with loads, a donkey led through, buyers
  for (const { a, b } of BAZAAR) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    for (let k = 0; k < Math.floor(len / 22); k++) {
      const t = 6 + k * 22 + rand() * 8, x = a[0] + ux * t + (uz ? (rand() - 0.5) * 3 : 0), z = a[1] + uz * t + (ux ? (rand() - 0.5) * 3 : 0);
      person([x, z], Math.atan2(ux, uz) + (rand() < 0.5 ? 0 : Math.PI), { man: true, carry: rand() < 0.5 ? 'sack' : 'bundle', loadCloth: pick(['sacking', 'cloth_brown', 'cloth_indigo']) });
    }
  }
  for (const [x, z] of [[100, 25], [96, 100]]) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0.04, rot: 0, seed: Math.floor(rand() * 1e9), gear: true }); person([x + 0.6, z - 1.4], 0, { man: true, pose: 'stand', cloth: 'cloth_brown' }); }
  void CHORSU;
  return L;
}
export const lifePlan = () => ({ id: 'samarkand-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [38, 0], facing: 'w' } });
