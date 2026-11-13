// The standing life of Samarkand c. 1420 (docs/settlements/timurid-samarkand.md §5, §7, §10): students and a teacher in the
// madrasa's court and its classroom, merchants and their camels and donkeys at the Registan's east side and the
// bazaar, shopkeepers sitting on the sills of the shops, water carriers at the aryk. (The walkers are in movers.js.)

import { RADIUS, SQUARE, MADRASA, SHOPS_N, SHOPS_S, BAZAAR, CHORSU, TAPCHANS, marketLayout, houses, houseGeom } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * The people at home in the furnished houses within 135 m of the arrival (a stream of its own, so that the rest of the life stays where it was): the host
 * or a guest sitting cross-legged on the carpet of the talar (the raised recess on the court), the housewife kneeling at the tandoor in the court, an old man
 * or a boy on the charpoy. Positions in each house's own frame (houses.js timHouse: the talar's floor is 0.45 m up, the tandoor beside the wing with the room).
 */
function homes(L) {
  const A = [14, 0];
  for (const h of houses()) {
    if (h.garden || !h.full || Math.hypot((h.rect[0] + h.rect[2]) / 2 - A[0], (h.rect[1] + h.rect[3]) / 2 - A[1]) > 135) continue;
    const r = rng(h.seed + 4242), G = houseGeom(h), q = rng(h.seed + 7), W = G.W, D = G.D;
    q(); if (!h.rich) q();
    const rsgn = q() < 0.5 ? -1 : 1, dN = 4.8, dW = 4.3, dS = 4.6, zf = -D / 2 + dN, zs = D / 2 - dS, zb = zf - 2.5, xl = -W / 2 + dW, xr = W / 2 - dW, mid = (zb + zf) / 2;
    const o = G.toWorld(0, 0), dir = ([du, dv]) => { const p = G.toWorld(du, dv); return Math.atan2(-(p[0] - o[0]), -(p[1] - o[1])); };
    const man = (u, v, fc, ex = {}) => L.push({ t: 'figure', at: G.toWorld(u, v), y: 0.45, rot: dir(fc), seed: Math.floor(r() * 1e9), skin: r() < 0.7 ? 'skin_medium' : 'skin_light', dress: 'robe', cloth: ['cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_brown', 'cloth_maroon'][Math.floor(r() * 6)], cloth2: 'cloth_white', over: 'sash', hat: 'turban', hatMat: r() < 0.6 ? 'cloth_white' : 'cloth_ochre', hair: 'short', beard: true, pose: 'cross', ...ex });
    const woman = (u, v, fc, ex = {}) => L.push({ t: 'figure', at: G.toWorld(u, v), y: 0.04, rot: dir(fc), seed: Math.floor(r() * 1e9), skin: 'skin_medium', dress: 'robe', cloth: ['cloth_indigo', 'cloth_maroon', 'cloth_green'][Math.floor(r() * 3)], cloth2: 'cloth_white', hat: 'veil', hair: 'long', pose: 'stand', ...ex });
    const t = r();
    if (t < 0.75) man(1.5, mid - 0.4, [0, 1]);                                                         // the host in the talar, facing the court
    if (t > 0.35) man(-1.2, mid + 0.65, [1, 0], { y: 0.45 });                                          // a guest across the tray
    const tx = rsgn < 0 ? xl + 0.8 : xr - 0.8, tz = zs - 1.2;
    if (r() < 0.8) woman(tx + (rsgn < 0 ? 1.1 : -1.1), tz, [rsgn < 0 ? -1 : 1, 0], { pose: 'kneel' });   // the housewife at the tandoor
    if (r() < 0.45) man(rsgn < 0 ? xl + 1.5 : xr - 1.5, zf + 6.6 > zs - 3 ? zf + 3 : zf + 6.6, [rsgn < 0 ? 1 : -1, 0], { y: 0.42, pose: 'cross', hat: 'none', cloth: 'cloth_white' });     // an old man on the charpoy
  }
}

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
  // ---- the Registan, deepened (§15): the tea-houses' platforms with their guests, the aisle to the pishtaq lined with people, groups, the carriers ----
  // tea-drinkers on the carpets (four to a platform, one pouring), a boy with the kettle
  for (const [x, z, yaw] of TAPCHANS) {
    const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v) => [x + u * c + v * s, z - u * s + v * c], n = 3 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) { const [u, v] = [[-1.0, -0.7], [0.9, -0.75], [-0.9, 0.8], [1.1, 0.75]][k]; person(P(u, v), yaw + Math.atan2(-u * 0.5, -v) * 0.0 + (v < 0 ? 0 : Math.PI) + (rand() - 0.5) * 0.5, { man: true, pose: 'cross', y: 0.66, cloth: pick(['cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_brown', 'cloth_white']) }); }
    person(P(0.3, 2.2), yaw + Math.PI, { man: true, pose: 'stand', carry: 'pot', cloth: 'cloth_white' });
  }
  // the aisle's two sides: a buyer at nearly every booth of the middle rows, pairs talking at the booths' ends, porters with their loads crossing
  for (let i = 0; i < 13; i++) for (const [z, yaw, dz] of [[-16, 0, 2.6], [16, Math.PI, -2.6]]) {
    if (rand() < 0.45) continue;
    const x = -37 + i * 4.7 + (z > 0 ? 1.5 : 0) + (rand() - 0.5) * 1.6;
    person([x, z + dz + (rand() - 0.5) * 0.6], yaw + Math.PI + (rand() - 0.5) * 0.6, { pose: rand() < 0.35 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'bundle' : 'none', loadCloth: pick(['cloth_brown', 'cloth_indigo', 'sacking']) });
  }
  for (let k = 0; k < 9; k++) { const sg = k % 2 ? 1 : -1; person([-30 + k * 6.2 + rand() * 2, sg * (4 + rand() * 4)], Math.PI / 2 * (rand() < 0.6 ? 1 : -1) + (rand() - 0.5) * 0.4, { man: true, carry: pick(['sack', 'bundle', 'pot']), loadCloth: pick(['sacking', 'cloth_brown']) }); }
  // students in a knot on their way into the madrasa, a dervish with his bowl and staff, a blind beggar led by a boy, the water-carrier with his skin, children at a game of knucklebones
  for (let k = 0; k < 6; k++) person([-37 + (k % 3) * 1.1, -3 + Math.floor(k / 3) * 1.3 + rand() * 0.5], -Math.PI / 2 + (rand() - 0.5) * 0.5, { man: true, hatMat: 'cloth_white', cloth: pick(['cloth_white', 'cloth_grey', 'cloth_ochre']), pose: k < 2 ? 'talk' : 'stand' });
  person([-8, 6.6], Math.PI / 2, { man: true, pose: 'staff', carry: 'staff', cloth: 'cloth_brown', cloth2: 'cloth_green', hatMat: 'cloth_green' });
  person([-18, -6.4], 0, { man: true, pose: 'cross', y: 0.03, cloth: 'cloth_grey', cloth2: 'cloth_grey' });
  person([2.2, 7.0], Math.PI, { man: true, pose: 'stand', carry: 'pot', cloth: 'cloth_brown' });
  for (const [x, z] of [[-24, 8.2], [-23.2, 8.9], [-24.6, 9.4]]) L.push({ t: 'figure', at: [x, z], y: 0.04, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), skin: 'skin_medium', dress: 'robe', cloth: pick(['cloth_ochre', 'cloth_indigo', 'cloth_red']), cloth2: 'cloth_white', hat: 'cap', hair: 'short', pose: 'squat', child: true });
  for (const [x, z] of [[-30, 9], [8, -8.6]]) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0.04, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  // nothing within a few metres of the arrival (x 14, z 0, looking west)
  const keep = L.filter((e) => !(e.at && Math.abs(e.at[1]) < 3.6 && e.at[0] > 4 && e.at[0] < 20));
  L.length = 0; L.push(...keep);
  homes(L);
  void CHORSU;
  return L;
}
export const lifePlan = () => ({ id: 'samarkand-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [38, 0], facing: 'w' } });
