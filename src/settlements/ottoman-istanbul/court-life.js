// The outer court of the Süleymaniye and the avenues before the shops (docs/settlements/ottoman-istanbul.md §10a): the court's
// paving in bands and joints with the way of marble from the north gate to the mosque; the crowd of a Friday forenoon
// (worshippers going in, students in their robes, porters, sherbet sellers, a pigeon-feeder with her flocks, children);
// and the goods before the arasta's shops. Pure data: `courtPaving()` for the 'ottoman' style plan, `courtLife()` for the life plan.

import { PRECINCT, ARASTA, TOP, MEDRESES, CARSI, TERRACE, RADIUS, lanes, height } from './layout.js';
import { subtractRects } from '../../core/build.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const [p0, q0, p1, q1] = PRECINCT;
const MOSQUE_FOOT = [-36, -50, 36, 54];

export function courtPaving() {
  const E = [], blk = (r, h, mat) => { if (r[2] - r[0] > 0.01 && r[3] - r[1] > 0.01) E.push({ t: 'block', rect: r, y0: TOP - 0.01, y1: TOP + h, mat, collide: false }); };
  const cut = (r, h, mat) => { for (const q of subtractRects(r, [MOSQUE_FOOT])) blk(q, h, mat); };
  // joints every 6 m
  for (let x = p0 + 6; x < p1 - 1; x += 6) cut([x - 0.03, q0 + 1.4, x + 0.03, q1 - 1.4], 0.012, 'limestone_carved');
  for (let z = q0 + 6; z < q1 - 1; z += 6) cut([p0 + 1.4, z - 0.03, p1 - 1.4, z + 0.03], 0.012, 'limestone_carved');
  // the way: nine metres of marble from the gate to the mosque's forecourt, edged and cross-jointed
  blk([-4.5, q0 + 1.2, 4.5, MOSQUE_FOOT[1]], 0.02, 'marble_floor');
  blk([-4.7, q0 + 1.2, -4.5, MOSQUE_FOOT[1]], 0.028, 'limestone_carved'); blk([4.5, q0 + 1.2, 4.7, MOSQUE_FOOT[1]], 0.028, 'limestone_carved');
  for (let z = q0 + 4; z < MOSQUE_FOOT[1]; z += 3) blk([-4.5, z - 0.03, 4.5, z + 0.03], 0.026, 'limestone_carved');
  // a band of marble round the court inside the wall
  for (const r of [[p0 + 1.3, q0 + 1.3, p1 - 1.3, q0 + 2.1], [p0 + 1.3, q1 - 2.1, p1 - 1.3, q1 - 1.3], [p0 + 1.3, q0 + 2.1, p0 + 2.1, q1 - 2.1], [p1 - 2.1, q0 + 2.1, p1 - 1.3, q1 - 2.1]]) blk(r, 0.016, 'marble_floor');
  return E;
}

const ROBE = ['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_maroon', 'cloth_brown', 'cloth_ochre', 'cloth_blue'];
export function courtLife() {
  const L = [], rand = rng(1566), pick = (a) => a[Math.floor(rand() * a.length)];
  const man = (x, z, rot, o = {}) => L.push({ t: 'figure', at: [x, z], y: TOP + 0.04, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', dress: 'robe', cloth: pick(ROBE), cloth2: pick(['cloth_white', 'cloth_ochre']), over: 'sash', hat: 'turban', hatMat: rand() < 0.8 ? 'cloth_white' : 'cloth_green', hair: 'short', beard: rand() < 0.75, feet: 'shod', ...o });
  const woman = (x, z, rot, o = {}) => L.push({ t: 'figure', at: [x, z], y: TOP + 0.04, rot, seed: Math.floor(rand() * 1e9), skin: 'skin_light', dress: 'robe', cloth: pick(['cloth_black', 'cloth_indigo', 'cloth_brown']), cloth2: 'cloth_white', hat: 'veil', hair: 'long', feet: 'shod', ...o });
  const kid = (x, z, rot, o = {}) => L.push({ t: 'figure', at: [x, z], y: TOP + 0.04, rot, seed: Math.floor(rand() * 1e9), child: true, skin: 'skin_light', dress: 'robe', cloth: pick(ROBE), cloth2: 'cloth_white', over: 'sash', hat: 'cap', hatMat: 'cloth_red', hair: 'short', ...o });
  const S = Math.PI, N = 0;                              // facing south (+z) = π, north = 0
  // the way from the north gate: worshippers going in to the noon prayer, a few coming out; in twos and threes
  for (let k = 0; k < 20; k++) {
    const z = -84 + rand() * 30, x = (rand() - 0.5) * 8, rot = rand() < 0.75 ? S : N;
    man(x, z, rot + (rand() - 0.5) * 0.3, rand() < 0.3 ? { pose: 'talk' } : {});
    if (rand() < 0.45) man(x + 0.9, z + 0.4, rot + 2.9 * (rand() < 0.3 ? 1 : 0), { pose: 'talk' });
    if (rand() < 0.15) woman(x - 1.3, z + 0.5, rot);
  }
  // students (softa) of the medreses in their white turbans and dark robes, in knots, one with a book
  for (const [cx, cz] of [[-24, -70], [26, -64], [-30, -58], [22, -80], [-18, -84], [34, -86]]) {
    for (let k = 0; k < 3 + Math.floor(rand() * 2); k++) man(cx + (rand() - 0.5) * 3.4, cz + (rand() - 0.5) * 3, rand() * 6.28, { cloth: pick(['cloth_brown', 'cloth_indigo', 'cloth_black']), cloth2: 'cloth_white', pose: k % 3 === 0 ? 'talk' : 'stand', carry: 'none' });
  }
  // the sherbet sellers' stalls at the court's sides, the seller behind, buyers before
  for (const sx of [-1, 1]) {
    const x = sx * 28, z = -78;
    L.push({ t: 'stall', at: [x, z], y: TOP, rot: sx > 0 ? Math.PI / 2 : -Math.PI / 2, seed: 41 + sx, w: 2.6, d: 1.2, awning: sx > 0 ? 'cloth_red' : 'cloth_green', stripe: 'cloth_white', goods: ['blue_jar', 'glazed_jar', 'water_pot'] });
    man(x + sx * 1.1, z + 0.2, sx > 0 ? -Math.PI / 2 : Math.PI / 2, { cloth: 'cloth_white', over: 'apron', pose: 'stand' });
    man(x - sx * 2.0, z - 0.5, sx > 0 ? Math.PI / 2 : -Math.PI / 2, { pose: 'stand' }); man(x - sx * 2.2, z + 1.1, sx > 0 ? Math.PI / 2 + 0.3 : -Math.PI / 2 - 0.3, { pose: 'talk' });
  }
  // the water-carriers (saka) with a brass-fitted skin and cups, a porter with his saddle (semer) at the gate
  for (const [x, z] of [[-8, -86], [9, -66]]) man(x, z, rand() * 6.28, { carry: 'bundle', loadCloth: 'hide_brown', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_red' });
  man(6.6, -92.5, S, { carry: 'bundle', loadCloth: 'cloth_indigo', cloth: 'cloth_brown', hat: 'cap' });
  // two gatekeepers (kapıcı) at the north gate, staff in hand, a third on the step
  for (const sx of [-1, 1]) man(sx * 7.0, q0 + 1.6, S, { pose: 'staff', carry: 'staff', cloth: 'cloth_blue', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white' });
  // a woman feeding the pigeons with children about her; flocks on the flags
  woman(-14, -66, 0.4, { pose: 'stand' }); kid(-13.0, -64.8, 3.4); kid(-15.2, -65.0, 2.8);
  for (const [x, z, n] of [[-14.3, -64.0, 12], [-9, -62, 9], [16, -72, 10], [3, -57, 8], [-21, -52, 8], [24, -52, 9], [11, -88, 7], [-30, -82, 7], [38, -66, 8]]) L.push({ t: 'chickens', kind: 'pigeon', n, at: [x, z], y: TOP + 0.04, seed: Math.floor(x * 9 + z) });
  // children running in the court; a boy with a hoop
  for (let k = 0; k < 7; k++) kid(-30 + rand() * 60, -80 + rand() * 40, rand() * 6.28, k % 3 ? {} : { pose: 'talk' });
  // elders and neighbours seated on the court's step along the north wall, a beggar by the gate
  for (const x of [-45, -33, -22, 22, 35, 47]) man(x, q0 + 2.6, S, { pose: 'cross', cloth: pick(['cloth_brown', 'cloth_ochre', 'cloth_grey']) });
  man(-7.2, q0 + 2.2, S + 0.2, { pose: 'cross', cloth: 'cloth_grey', hat: 'cap', hatMat: 'cloth_brown', beard: true });
  // the court's stray cats on the benches and the way's edge
  for (const [x, z] of [[-12.2, -75], [12.3, -64], [-4.8, -61], [38.2, -30], [-37.6, -2]]) L.push({ t: 'animal', kind: 'cat', at: [x, z], y: TOP + (Math.abs(x) > 11 && Math.abs(x) < 13 ? 0.46 : 0.04), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  // before the arasta's shops: goods set out at their fronts, a bench with the shopkeeper, buyers
  for (const sg of [-1, 1]) {
    const f = sg * (Math.abs(ARASTA.w) - ARASTA.d), out = -sg, rot = sg > 0 ? -Math.PI / 2 : Math.PI / 2;
    const gates = MEDRESES.filter((q) => (q.out === 'w') === (sg < 0)).map((q) => [q.rect[1] + 5 * 4.2 - 1.6, q.rect[1] + 6 * 4.2 + 1.6]);
    let n = 0;
    for (let z = ARASTA.z0 + 2.1; z < ARASTA.z1 - 1; z += 4.2, n++) {
      if (gates.some(([a, b]) => z > a - 0.5 && z < b + 0.5) || (z > -10.5 && z < -6)) continue;
      const x = f + out * 0.75, r = n % 5;
      if (r === 0) L.push({ t: 'basket', n: 3, at: [x, z + 1.2], y: TOP, seed: n * 3 + 1 });
      else if (r === 1) L.push({ t: 'pot', kind: pick(['blue_jar', 'glazed_jar', 'water_pot']), n: 3, at: [x, z + 1.0], y: TOP, seed: n * 3 + 2 });
      else if (r === 2) L.push({ t: 'goods_mat', at: [x - out * 0.1, z], y: TOP, rot, goods: 'cloth', seed: n * 3 + 3 });
      else if (r === 3) L.push({ t: 'crates', n: 2, at: [x, z - 1.1], y: TOP, seed: n * 3 + 4 });
      else { L.push({ t: 'bench', at: [x - out * 0.1, z], y: TOP, rot, len: 1.6, seed: n }); man(x - out * 0.1, z, rot + S, { pose: 'sit', y: TOP + 0.5 }); }
      if (rand() < 0.45) man(f + out * (1.6 + rand() * 1.4), z + (rand() - 0.5) * 2, rot + S + (rand() - 0.5), { pose: rand() < 0.4 ? 'talk' : 'stand' });
    }
    // a donkey with its panniers and a porter in the avenue
    L.push({ t: 'animal', kind: 'donkey', at: [f + out * 4.5, -36], y: TOP, rot: 0, seed: 90 + sg, gear: true }); man(f + out * 5.5, -35, 0, { carry: 'staff', pose: 'staff', cloth: 'cloth_brown' });
  }
  return L;
}

/**
 * The lanes of the timber quarter dressed at the doors, and the covered market's crowd: a water jar by a door, firewood stacked
 * against a wall, baskets, a stool with an old man or a grandmother and a child at her knee, a cat; shoppers and porters in each
 * trade's lane of the carsi. Nearest the terrace first (the first hundred metres of every way in).
 */
export function laneLife() {
  const L = [], rand = rng(1561), pick = (a) => a[Math.floor(rand() * a.length)], Y = (x, z) => height(x, z) + 0.04;
  const man = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), skin: 'skin_light', dress: 'robe', cloth: pick(ROBE), cloth2: 'cloth_white', over: 'sash', hat: 'turban', hatMat: 'cloth_white', hair: 'short', beard: rand() < 0.7, feet: 'shod', ...o });
  const wom = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), skin: 'skin_light', dress: 'robe', cloth: pick(['cloth_black', 'cloth_indigo', 'cloth_brown']), cloth2: 'cloth_white', hat: 'veil', hair: 'long', feet: 'shod', ...o });
  const ln = lanes().filter((l) => (l.vert ? Math.abs((l.r[0] + l.r[2]) / 2) < 270 : Math.abs((l.r[1] + l.r[3]) / 2) < 250));
  for (let k = 0; k < 130; k++) {
    const l = pick(ln), [x0, z0, x1, z1] = l.r, s = rand() < 0.5 ? -1 : 1;
    const u = l.vert ? z0 + 30 + rand() * (z1 - z0 - 60) : x0 + 30 + rand() * (x1 - x0 - 60);
    const px = l.vert ? (x0 + x1) / 2 + s * 1.15 : u, pz = l.vert ? u : (z0 + z1) / 2 + s * 1.15;
    if (px > TERRACE[0] - 8 && px < TERRACE[2] + 8 && pz > TERRACE[1] - 8 && pz < TERRACE[3] + 8) continue;
    if (Math.hypot(px, pz) > RADIUS - 70) continue;
    const toLane = l.vert ? (s > 0 ? -Math.PI / 2 : Math.PI / 2) : (s > 0 ? Math.PI : 0), r = rand(), y = Y(px, pz);
    if (r < 0.2) L.push({ t: 'pot', kind: pick(['water_pot', 'zir', 'glazed_jar']), n: 1 + (rand() < 0.4 ? 1 : 0), at: [px, pz], y, seed: k });
    else if (r < 0.36) L.push({ t: 'firewood', at: [px, pz], y, rot: l.vert ? 0 : Math.PI / 2, len: 1.1, seed: k });
    else if (r < 0.5) L.push({ t: 'basket', n: 2, at: [px, pz], y, seed: k });
    else if (r < 0.74) { L.push({ t: 'stool', at: [px, pz], y, rot: toLane, seed: k }); if (rand() < 0.6) man([px, pz], toLane, { pose: 'sit_low', cloth: pick(['cloth_brown', 'cloth_grey']), beard: true }); else wom([px, pz], toLane, { pose: 'sit_low' }); if (rand() < 0.5) L.push({ t: 'figure', at: [px + (l.vert ? -s * 0.5 : 0.4), pz + (l.vert ? 0.4 : -s * 0.5)], y, rot: toLane, seed: k * 7, child: true, skin: 'skin_light', dress: 'robe', cloth: pick(ROBE), cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_red', hair: 'short' }); }
    else if (r < 0.86) L.push({ t: 'animal', kind: 'cat', at: [px, pz], y, rot: rand() * 6.28, seed: k });
    else { wom([px, pz], toLane, { pose: 'talk', carry: rand() < 0.4 ? 'pot' : 'none' }); wom([px + (l.vert ? -s * 0.5 : 0.6), pz + (l.vert ? 0.6 : -s * 0.5)], toLane + 2.8, { pose: 'talk' }); }
  }
  // the covered market: shoppers, porters and sellers in each trade's lane
  for (const t of CARSI.lanes) {
    const n = t.horiz ? Math.floor(Math.abs(t.b - t.a) / 14) : 3;
    for (let q = 0; q < n; q++) {
      const a = t.a + (t.b - t.a) * (0.12 + 0.76 * (q + rand() * 0.6) / n), off = (rand() - 0.5) * 2.2, at = t.horiz ? [a, t.c + off] : [t.c + off, a], rot = t.horiz ? (rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2) : (rand() < 0.5 ? 0 : Math.PI);
      const r = rand();
      if (r < 0.4) man(at, rot, { pose: 'talk' }); else if (r < 0.65) wom(at, rot, {}); else if (r < 0.85) man(at, rot, { carry: 'bundle', loadCloth: pick(['sacking', 'cloth_brown', 'cloth_indigo']), cloth: 'cloth_brown', hat: 'cap' }); else man(at, rot, { pose: 'stand' });
      if (rand() < 0.5) man([at[0] + (t.horiz ? 0.6 : 0.7), at[1] + (t.horiz ? 0.7 : 0.4)], rot + 2.9, { pose: 'talk' });
    }
  }
  return L;
}
