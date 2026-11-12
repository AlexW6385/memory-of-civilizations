// The town round the mosque (docs/settlements/djenne.md §6, §11): the market square on market day,
// the houses packed along the streets.

import { RADIUS, MARKET, LEVEL, ISLAND, MOSQUE, SHOPS, COURT, houses, shore, inHouse } from './layout.js';
import { ground } from './ground.js';
import { boatFloat } from '../../objects/index.js';

const base = (id, elements) => ({ id, style: 'sahel', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [70, 0], facing: 'w' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const ARRIVAL = [95, 30], LOOK = [40, 0];
/** Is (x, z) in the strip of the arrival's view of the qibla front (kept clear near the arrival)? */
function inView(x, z, m = 1.5) {
  const dx = LOOK[0] - ARRIVAL[0], dz = LOOK[1] - ARRIVAL[1], L = Math.hypot(dx, dz), u = ((x - ARRIVAL[0]) * dx + (z - ARRIVAL[1]) * dz) / L;
  const v = Math.abs((x - ARRIVAL[0]) * dz - (z - ARRIVAL[1]) * dx) / L;
  return (u < 28 && u > -4 && v < m + 1.5) || Math.hypot(x - ARRIVAL[0], z - ARRIVAL[1]) < 7;
}
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));

/**
 * The market on market day, Monday (docs/settlements/djenne.md §11): under the qibla wall, rows of
 * stalls under mats with aisles between; between the rows the sellers on their stools behind their
 * mats — dried fish, salt, pots, calabashes, grain, butter, cloth, mats, smoked meat; at the north
 * end the kola sellers in two lines facing each other, each with a small basket (Caillié); women
 * bringing firewood, buyers walking the aisles, some with a load on the head; donkeys with panniers
 * at the edge.
 */
function market() {
  const rand = rng(77), E = [], P = [];
  const W = ['cloth_indigo', 'cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_brown', 'cloth_black'];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const woman = (at, rot, o = {}) => P.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: pick(W), cloth2: pick(W), skin: 'skin_dark', hat: 'turban', hatMat: pick(W), feet: 'bare', ...o });
  const man = (at, rot, o = {}) => P.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_brown']), cloth2: pick(W), skin: 'skin_dark', hat: pick(['cap', 'cap', 'turban', 'none']), hatMat: pick(['cloth_white', 'cloth_indigo']), feet: 'shod', ...o });
  // the stalls in four rows running north–south, aisles of 5 m between them
  for (const x of [52, 66, 80, 94]) for (let z = MARKET[1] + 6; z < MARKET[3] - 4; z += 5.2) {
    if (rand() < 0.15 || inView(x, z, 2.5)) continue;
    E.push({ t: 'market_stall', c: [x + (rand() - 0.5) * 0.6, z + (rand() - 0.5) * 0.6], s: 1.3 + rand() * 0.45 });
    // the stall's keeper behind the table, facing the aisle on the west (toward the mosque)
    if (rand() < 0.7) { const at = [x + 1.1, z + (rand() - 0.5)]; (rand() < 0.6 ? woman : man)(at, face(at, [x - 5, at[1]]), { pose: 'stand' }); }
  }
  // the mat sellers seated along the aisles, facing into them
  const GOODS = ['fish', 'fish', 'salt', 'pots', 'calabash', 'grain', 'grain', 'butter', 'cloth', 'mats', 'meat', 'pots'];
  for (const x of [59, 73, 87]) for (let z = MARKET[1] + 8; z < MARKET[3] - 6; z += 3.4) {
    if (rand() < 0.25) continue;
    const side = rand() < 0.5 ? -1 : 1, at = [x + side * 1.6, z + (rand() - 0.5) * 0.8];
    if (inView(at[0], at[1], 2)) continue;
    const rot = face(at, [x - side, at[1]]), goods = pick(GOODS);
    E.push({ t: 'market_mat', at, rot, goods, seed: Math.floor(rand() * 1e6) });
    (goods === 'meat' || goods === 'cloth' || goods === 'salt' ? man : woman)(at, rot, { pose: 'sit_ground' });
  }
  // the kola sellers in two lines facing each other at the north end of the market
  for (let k = 0; k < 9; k++) for (const [x, side] of [[44.5, 1], [48.5, -1]]) {
    const at = [x, MARKET[1] + 4 + k * 1.3];
    if (rand() < 0.2) continue;
    const rot = face(at, [x + side, at[1]]);
    E.push({ t: 'market_mat', at, rot, goods: 'kola', seed: Math.floor(rand() * 1e6) });
    woman(at, rot, { pose: 'sit_ground' });
  }
  // buyers in the aisles, in twos and threes; women with loads on the head
  for (let k = 0; k < 44; k++) {
    const x = pick([59, 73, 87, 45]) + (rand() - 0.5) * 2.4, z = MARKET[1] + 5 + rand() * (MARKET[3] - MARKET[1] - 10), at = [x, z];
    if (inView(x, z) || P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.1)) continue;
    const rot = rand() * 6.28;
    if (rand() < 0.55) woman(at, rot, { carry: rand() < 0.35 ? pick(['pot', 'basket']) : 'none', pose: rand() < 0.3 ? 'talk' : 'stand' });
    else man(at, rot, { pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  // firewood brought in by the women from round about (Caillié), stacked at the market's south edge
  for (let k = 0; k < 6; k++) {
    const at = [50 + k * 8 + rand() * 2, MARKET[3] - 2 - rand()];
    if (inView(at[0], at[1])) continue;
    P.push({ t: 'firewood', at, y: 0, rot: (rand() - 0.5) * 0.4, len: 1.5, seed: k });
    woman([at[0] + 1.3, at[1] - 0.4], face([at[0] + 1.3, at[1] - 0.4], [at[0] + 1.3, at[1] - 5]), { pose: 'squat' });
  }
  // donkeys with their panniers tethered along the market's east edge, goats among them
  for (let k = 0; k < 7; k++) {
    const at = [MARKET[2] - 3 - rand() * 3, MARKET[1] + 8 + k * 11 + rand() * 3];
    if (inView(at[0], at[1])) continue;
    P.push({ t: 'animal', kind: k % 3 === 2 ? 'goat' : 'donkey', at, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), gear: k % 3 !== 2 });
  }
  // goods on the ground between the stalls and mats: pots and baskets in heaps, sacks, a few hens and a goat tethered at a post
  const kin = ['pot', 'pot', 'basket', 'basket', 'sacks', 'pot', 'basket'];
  for (let k = 0, tries = 0; k < 110 && tries < 600; tries++) {
    const x = pick([52, 59, 66, 73, 80, 87, 94, 101]) + (rand() - 0.5) * 4.5, z = MARKET[1] + 4 + rand() * (MARKET[3] - MARKET[1] - 8), at = [x, z];
    if (inView(x, z, 2) || x > MARKET[2] - 5) continue;
    if (E.some((e) => (e.c || e.at) && Math.hypot((e.c || e.at)[0] - x, (e.c || e.at)[1] - z) < 1.7) || P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.1)) continue;
    const t = pick(kin), seed = Math.floor(rand() * 1e6);
    P.push(t === 'sacks' ? { t, at, y: 0, rot: rand() * 6, seed } : { t, at, y: 0, seed });
    if (t !== 'sacks' && rand() < 0.5) P.push({ t, at: [x + 0.45, z + 0.2], y: 0, seed: seed + 1 });
    k++;
  }
  for (let k = 0; k < 7; k++) { const at = [48 + rand() * 62, MARKET[1] + 6 + rand() * 80]; if (!inView(at[0], at[1]) && !E.some((e) => e.c && Math.hypot(e.c[0] - at[0], e.c[1] - at[1]) < 2)) P.push({ t: 'chickens', at, y: 0, rot: rand() * 6, n: 3 + Math.floor(rand() * 3), kind: 'hen', seed: k }); }
  // children running and playing between the aisles (boys in a short tunic, a girl with a small pot), cats under the stalls, dogs at the edge
  for (let k = 0, n = 0; n < 16 && k < 200; k++) {
    const x = pick([45, 52, 66, 80, 94, 101]) + (rand() - 0.5) * 4, z = MARKET[1] + 6 + rand() * (MARKET[3] - MARKET[1] - 12), at = [x, z];
    if (inView(x, z, 2.5) || P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.4)) continue;
    n++;
    P.push({ t: 'figure', at, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: n % 3 ? 'tunic' : 'wrap', legs: 'bare', cloth: pick(W), cloth2: pick(W), skin: 'skin_dark', hat: 'none', feet: 'bare', h: 0.6 + rand() * 0.14, pose: rand() < 0.4 ? 'squat' : 'stand', ...(n % 3 === 0 ? { carry: 'pot' } : {}) });
  }
  for (let k = 0, n = 0; n < 9 && k < 100; k++) { const at = [pick([52, 66, 80, 94]) + 1.0 + (rand() - 0.5), MARKET[1] + 8 + rand() * 80]; if (inView(at[0], at[1], 2)) continue; n++; P.push({ t: 'animal', kind: n % 4 === 0 ? 'dog' : 'cat', at, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e6) }); }
  // porters crossing the square with sacks and baskets on the head or the shoulder, a salt bearer with the slabs (the trade of the Sahara)
  for (let k = 0, n = 0; n < 12 && k < 200; k++) {
    const x = pick([45, 59, 73, 87, 101]) + (rand() - 0.5) * 1.8, z = MARKET[1] + 6 + rand() * (MARKET[3] - MARKET[1] - 12), at = [x, z];
    if (inView(x, z, 2.5) || P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.3)) continue;
    n++;
    (n % 2 ? man : woman)(at, rand() < 0.5 ? 0 : Math.PI, { carry: n % 3 === 0 ? 'sack' : n % 3 === 1 ? 'basket' : 'pot', pose: 'stand' });
  }
  // the sacks of grain and salt stacked at the market's edge ready for the boats, old men resting in the wall's shade on mats
  for (let z = MARKET[1] + 10; z < MARKET[3] - 8; z += 14 + rand() * 6) if (!inView(MARKET[2] - 1.5, z, 3)) P.push({ t: 'sacks', at: [MARKET[2] - 1.5, z], y: 0, rot: rand() * 6, n: 5, seed: Math.floor(z) });
  for (const z of [-30, -14, 4, 22, 36]) { const at = [MARKET[0] - 1.2, z]; if (inView(at[0], at[1], 2)) continue; E.push({ t: 'market_mat', at, rot: -Math.PI / 2, goods: 'mats', seed: Math.floor(z + 50) }); man([at[0] - 0.6, z], Math.PI / 2, { pose: 'sit_ground', hat: 'turban' }); }
  return { E, P };
}

/**
 * The landing on the south shore, toward the Bani (docs/settlements/djenne.md §12): pirogues — long,
 * narrow plank canoes — moored along the bank and being poled out, two with a mat shelter amidships;
 * more drawn up on the bank; fishermen's nets folded over poles to dry; dried fish in baskets, jars
 * and sacks of grain waiting to be loaded; boatmen, porters, women come down for water and fish.
 */
function landing() {
  const rand = rng(911), E = [], P = [], W = LEVEL.water + boatFloat('canoe');
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const R = (a) => ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);
  const at = (a, s) => [Math.cos(a) * (R(a) + s), Math.sin(a) * (R(a) + s)];
  const W3 = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red', 'cloth_green'];
  const fig = (p, y, rot, o) => P.push({ t: 'figure', at: p, y, rot, seed: Math.floor(rand() * 1e9), skin: 'skin_dark', cloth: pick(W3), cloth2: pick(W3), hatMat: pick(W3), ...o });
  const A0 = Math.PI / 2 - 0.16, A1 = Math.PI / 2 + 0.16;
  // moored along the bank, parallel to it
  for (let a = A0; a < A1; a += 0.022 + rand() * 0.01) {
    const s = 10.5 + rand() * 1.5, p = at(a, s), mat = rand() < 0.2;
    E.push({ t: 'boat', kind: mat ? 'sampan' : 'canoe', len: mat ? 8 : 8 + rand() * 4, at: p, y: W, rot: -a + (rand() - 0.5) * 0.12, seed: Math.floor(rand() * 1e9) });
    if (rand() < 0.4) fig([p[0] + Math.cos(a) * 0.1, p[1] + Math.sin(a) * 0.1], W - 0.1, -a + Math.PI / 2, { dress: 'tunic', legs: 'bare', feet: 'bare', hat: pick(['cap', 'none']), pose: pick(['squat', 'stand']) });
  }
  // two poled out into the channel, a boatman standing at the stern of each
  for (const [a, s] of [[Math.PI / 2 - 0.05, 20], [Math.PI / 2 + 0.09, 24]]) {
    const p = at(a, s), rot = -a + 0.25;
    E.push({ t: 'boat', kind: 'canoe', len: 10, at: p, y: W, rot, seed: Math.floor(s * 97) });
    fig([p[0] + Math.sin(rot) * 3.6, p[1] + Math.cos(rot) * 3.6], W - 0.1, rot + 0.5, { dress: 'tunic', legs: 'bare', feet: 'bare', hat: 'cap', pose: 'punt', len: 4.2, poleMat: 'timber' });
    fig([p[0] - Math.sin(rot) * 1.5, p[1] - Math.cos(rot) * 1.5], W - 0.1, rot, { dress: 'wrap', feet: 'bare', hat: 'turban', pose: 'squat' });
  }
  // drawn up on the bank above the water's edge
  for (let a = A0 + 0.03; a < A1; a += 0.05 + rand() * 0.03) {
    const s = 2.2 + rand() * 0.6, p = at(a, s);
    E.push({ t: 'boat', kind: 'canoe', len: 7 + rand() * 2, at: p, y: ground.height(p[0], p[1]) + 0.08, rot: -a + (rand() - 0.5) * 0.06, seed: Math.floor(rand() * 1e9) });
  }
  // nets drying over poles on the bank's top, baskets of dried fish, jars, sacks of grain to load
  for (let a = A0 + 0.01; a < A1; a += 0.04 + rand() * 0.02) {
    const s = -3 - rand() * 2, p = at(a, s), k = rand();
    if (k < 0.35) E.push({ t: 'net_rack', at: p, rot: -a + Math.PI / 2, seed: Math.floor(rand() * 1e6) });
    else if (k < 0.6) { P.push({ t: 'basket', at: p, y: 0, seed: Math.floor(rand() * 1e6) }); P.push({ t: 'basket', at: [p[0] + 0.7, p[1] - 0.2], y: 0, seed: Math.floor(rand() * 1e6) }); }
    else if (k < 0.8) P.push({ t: 'sacks', at: p, y: 0, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
    else P.push({ t: 'pot', at: p, y: 0, seed: Math.floor(rand() * 1e6) });
  }
  // washing: cloths spread on lines along the bank's top, women squatting at the water's edge beating and rinsing, children wading
  for (let a = A0 + 0.02; a < A1 - 0.02; a += 0.085) { const p = at(a, -9 - rand() * 2); if (!inHouse(p[0], p[1], 2)) P.push({ t: 'laundry', at: p, y: 0, rot: -a + Math.PI / 2, len: 3 + rand() * 1.5, seed: Math.floor(rand() * 1e6) }); }
  for (let k = 0; k < 9; k++) { const a = A0 + 0.01 + rand() * (A1 - A0 - 0.02), p = at(a, 1.2 + rand() * 2.5); fig(p, ground.height(p[0], p[1]), -a - Math.PI / 2 + (rand() - 0.5) * 0.6, { dress: 'wrap', feet: 'bare', hat: 'turban', pose: 'squat' }); if (rand() < 0.6) P.push({ t: 'basket', at: [p[0] - Math.cos(a) * 0.7, p[1] - Math.sin(a) * 0.7], y: 0, seed: k }); }
  for (let k = 0; k < 4; k++) { const a = A0 + rand() * (A1 - A0), p = at(a, 3.5 + rand()); fig(p, ground.height(p[0], p[1]), rand() * 6, { dress: 'tunic', legs: 'bare', feet: 'bare', hat: 'none', pose: 'stand', h: 1.1 }); }
  // people: porters carrying loads up, women come for fish and water, boatmen talking
  for (let k = 0; k < 18; k++) {
    const a = A0 + rand() * (A1 - A0), s = -1 - rand() * 6, p = at(a, s), rot = rand() * 6.28;
    if (rand() < 0.5) fig(p, 0, rot, { dress: 'wrap', feet: 'bare', hat: 'turban', carry: rand() < 0.6 ? pick(['pot', 'basket']) : 'none', pose: 'stand' });
    else fig(p, 0, rot, { dress: rand() < 0.5 ? 'robe' : 'tunic', legs: 'bare', feet: 'bare', hat: pick(['cap', 'none', 'turban']), pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  return { E, P };
}

/**
 * Before the crépissage (docs/settlements/djenne.md §13): in the weeks before the yearly replastering the
 * clay soaks in round pits on the river bank; young masons break the lumps and work water into it, a
 * donkey brings more clay in panniers, women bring water in jars. At the mosque the ladders are already
 * set against the north wall and baskets stacked at its foot for the day; the chief mason looks the wall over.
 */
function crepissage() {
  const rand = rng(1907), E = [], P = [], W = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red'];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (p, y, rot, o) => P.push({ t: 'figure', at: p, y, rot, seed: Math.floor(rand() * 1e9), skin: 'skin_dark', cloth: pick(W), cloth2: pick(W), hatMat: pick(W), feet: 'bare', ...o });
  const R = (a) => ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);
  const at = (a, d) => [Math.cos(a) * (R(a) + d), Math.sin(a) * (R(a) + d)];
  // three pits on the bank east of the landing
  for (const [a, d, r] of [[Math.PI / 2 - 0.26, -6.5, 2.2], [Math.PI / 2 - 0.235, -12.5, 1.8], [Math.PI / 2 - 0.3, -10, 2.0]]) {
    const c = at(a, d);
    if (inHouse(c[0], c[1], r + 2.5)) continue;
    E.push({ t: 'mud_pit', c, r, y: 0, seed: Math.floor(rand() * 1e6) });
    // a young mason standing in the mud working it with a hoe, another squatting at the lumps on the edge
    fig([c[0] + 0.4, c[1] - 0.3], -0.2, rand() * 6.28, { dress: 'tunic', legs: 'bare', top: 'bare', hat: 'none', carry: 'hoe' });
    const b = rand() * 6.28; fig([c[0] + Math.cos(b) * (r + 1.3), c[1] + Math.sin(b) * (r + 1.3)], 0, Math.atan2(Math.cos(b), Math.sin(b)), { dress: 'tunic', legs: 'bare', hat: 'cap', pose: 'squat' });
  }
  // a donkey with its panniers of clay, its driver; women come with water jars on the head
  { const c = at(Math.PI / 2 - 0.27, -17); if (!inHouse(c[0], c[1], 2)) { P.push({ t: 'animal', kind: 'donkey', at: c, y: 0, rot: 1.2, seed: 1907, gear: true }); fig([c[0] - 1.3, c[1] + 0.6], 0, 1.2, { dress: 'robe', hat: 'cap', carry: 'staff', len: 1.4 }); } }
  for (let k = 0; k < 3; k++) { const c = at(Math.PI / 2 - 0.25 + k * 0.02, -3 - k * 2.5); if (!inHouse(c[0], c[1], 1)) fig(c, 0, rand() * 6.28, { dress: 'wrap', hat: 'turban', carry: 'pot' }); }
  // at the mosque's north wall: ladders against it between the pilasters, baskets stacked at its foot,
  // the chief mason and an elder looking the face over
  const zW = MOSQUE.c[1] - MOSQUE.a + 8 - 0.45, py = MOSQUE.py;
  for (const x of [-19.8, -4.6, 22.8, 28.4]) P.push({ t: 'ladder', at: [x, zW - 1.75], y: py, rot: Math.PI, len: 6.5, seed: 1 });          // (their feet 1.75 m out, their heads on the face)
  for (const [x, n] of [[-12, 5], [-1, 4], [24.5, 6]]) for (let k = 0; k < n; k++) P.push({ t: 'basket', at: [x + (k % 3) * 0.55, zW - 2.0 - Math.floor(k / 3) * 0.55], y: py, seed: Math.floor(rand() * 1e6) });
  fig([1.5, zW - 4.5], py, 0, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_indigo', hat: 'cap', hatMat: 'cloth_white', pose: 'talk', beard: true, h: 1.72 });
  fig([0.6, zW - 4.9], py, 0.4, { dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'turban', hatMat: 'cloth_indigo', pose: 'stand', beard: true });
  return { E, P };
}


/** The houses nearest the market and the mosque are enterable (docs §16): deep enough for the vestibule, court and back block. */
function enterable(all) {
  const ok = all.filter((h) => h.rect[2] - h.rect[0] >= 7 && h.rect[3] - h.rect[1] >= 10);
  const d = (h) => Math.hypot((h.rect[0] + h.rect[2]) / 2 - 30, (h.rect[1] + h.rect[3]) / 2);
  return new Set(ok.sort((a, b) => d(a) - d(b)).slice(0, 64));
}
/** An elder on the vestibule's bench in half of the enterable houses, a woman on a mat in the court of some. */
function homeLife(homes) {
  const rand = rng(404), P = [], W = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_brown'];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  for (const h of homes) {
    const [x0, z0, x1, z1] = h.rect, south = h.front === 's', Wd = x1 - x0, mid = Wd / 2;
    const pt = (u, v) => (south ? [x0 + u, z1 - v] : [x1 - u, z0 + v]);
    if (mid - 1.8 - 0.45 < 1.65) continue;
    if (rand() < 0.5) {
      const at = pt(mid - 1.2, 2.0), to = pt(mid + 1, 2.0);
      P.push({ t: 'figure', at, y: 0.45, rot: face(at, to), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_white', 'cloth_indigo']), cloth2: pick(W), skin: 'skin_dark', hat: 'cap', hatMat: 'cloth_white', feet: 'shod', pose: 'sit', beard: rand() < 0.6 });
    }
  }
  return P;
}

/** Elders, women with children and a few boys on the benches (tintin) of the fronts about the market and the mosque. */
function frontsLife(all) {
  const rand = rng(6001), P = [], W = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red'];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  for (const h of all) {
    const [x0, z0, x1, z1] = h.rect, f = h.front;
    if (Math.hypot((x0 + x1) / 2 - 40, (z0 + z1) / 2) > 135 || rand() < 0.62) continue;
    const L = f === 'w' ? z1 - z0 : x1 - x0, hw = Math.min(1.35, L / 2 - 1.2), mid = L / 2;
    const side = rand() < 0.5 ? 0 : 1, s = side ? L - 0.8 - (L - 0.8 - (mid + hw + 0.55)) / 2 : 0.8 + (mid - hw - 0.55 - 0.8) / 2;
    if (mid - hw - 0.55 - 0.8 < 0.8) continue;
    const p = f === 's' ? [x0 + s, z1 + 0.25] : f === 'n' ? [x1 - s, z0 - 0.25] : [x0 - 0.25, z0 + s], out = f === 's' ? [p[0], p[1] + 1] : f === 'n' ? [p[0], p[1] - 1] : [p[0] - 1, p[1]];
    const man = rand() < 0.5;
    P.push({ t: 'figure', at: p, y: 0.45, rot: face(p, out), seed: Math.floor(rand() * 1e9), dress: man ? 'robe' : 'wrap', cloth: pick(man ? ['cloth_white', 'cloth_indigo', 'cloth_brown'] : W), cloth2: pick(W), skin: 'skin_dark', hat: man ? pick(['cap', 'turban']) : 'turban', hatMat: pick(['cloth_white', 'cloth_indigo']), feet: man ? 'shod' : 'bare', pose: 'sit', beard: man && rand() < 0.5, carry: !man && rand() < 0.3 ? 'child' : 'none' });
    if (rand() < 0.35) { const q = f === 's' ? [p[0] + 1.3, p[1] + 1.2] : f === 'n' ? [p[0] - 1.3, p[1] - 1.2] : [p[0] - 1.2, p[1] + 1.3]; P.push({ t: 'figure', at: q, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'bare', cloth: pick(W), skin: 'skin_dark', hat: 'none', feet: 'bare', pose: 'stand', h: 1.15 }); }
  }
  return P;
}

/** The faithful at prayer in the hall, in the aisles of matting facing the qibla, a teacher with his pupils in the court's gallery, men resting between the piers. */
function mosqueLife() {
  const rand = rng(1907 + 3), P = [], xm = MOSQUE.c[0] + 2, x1 = MOSQUE.c[0] + MOSQUE.a - 4, z0 = MOSQUE.c[1] - MOSQUE.a + 8, z1 = MOSQUE.c[1] + MOSQUE.a - 8, py = MOSQUE.py;
  const rowX = (i) => xm + 0.45 + (x1 - xm - 0.9) * (i + 0.5) / 9, aisle = (i) => (rowX(i) + rowX(i + 1)) / 2;
  const man = (at, rot, o = {}) => P.push({ t: 'figure', at, y: py, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_brown'][Math.floor(rand() * 4)], cloth2: 'cloth_white', skin: 'skin_dark', hat: ['cap', 'turban', 'cap'][Math.floor(rand() * 3)], hatMat: 'cloth_white', feet: 'bare', beard: rand() < 0.5, ...o });
  for (const i of [5, 6, 7]) for (let z = z0 + 6; z < z1 - 4; z += 3.2 + rand() * 2.4) { if (rand() < 0.35) continue; man([aisle(i), z], -Math.PI / 2, { legs: rand() < 0.5 ? 'cross' : 'kneel', pose: 'pray' }); }
  for (const [i, z] of [[2, -8], [3, 6], [1, 14], [4, -18]]) man([aisle(i), z], rand() * 6.28, { legs: 'cross', pose: 'talk' });
  // the teacher and the pupils cross-legged on a mat in the west gallery
  const gx = MOSQUE.c[0] - MOSQUE.a + 6.5, gz = 6;
  man([gx, gz], Math.PI / 2, { legs: 'cross', pose: 'talk', beard: true, cloth: 'cloth_white', hat: 'turban', y: py });
  for (let k = 0; k < 5; k++) man([gx + 1.6, gz - 2.2 + k * 1.1], -Math.PI / 2, { legs: 'cross', pose: 'sit', dress: 'tunic', hat: 'cap', cloth: 'cloth_white' });
  return P;
}

/** Fulani herders with their zebu cattle on the floodplain north of the channel, workers in the rice fields, an egret by each beast. */
function plain() {
  const rand = rng(8801), P = [], W = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_brown'];
  const R = (a) => ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);
  const at = (a, d) => [Math.cos(a) * (R(a) + d), Math.sin(a) * (R(a) + d)];
  for (const a0 of [-Math.PI / 2 + 0.2, -Math.PI / 2 - 0.5, Math.PI + 0.3]) {
    const c = at(a0, 62);
    for (let k = 0; k < 7; k++) P.push({ t: 'animal', kind: 'zebu', at: [c[0] + (rand() - 0.5) * 14, c[1] + (rand() - 0.5) * 14], y: ground.height(c[0], c[1]), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
    P.push({ t: 'figure', at: [c[0] + 8, c[1] - 6], y: ground.height(c[0], c[1]), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'bare', cloth: pick(W, rand), skin: 'skin_dark', hat: 'cap', hatMat: 'cloth_ochre', feet: 'bare', carry: 'staff', len: 1.7, pose: 'stand' });
  }
  for (const a0 of [0.5, 1.9, 3.6, 5.1]) for (let k = 0; k < 4; k++) {
    const c = at(a0 + k * 0.012, 58 + (k % 2) * 6);
    P.push({ t: 'figure', at: c, y: ground.height(c[0], c[1]), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: rand() < 0.5 ? 'wrap' : 'tunic', legs: 'bare', cloth: pick(W, rand), cloth2: pick(W, rand), skin: 'skin_dark', hat: 'turban', hatMat: pick(W, rand), feet: 'bare', carry: 'hoe', pose: 'stand' });
  }
  return P;
}
const pick = (a, r) => a[Math.floor(r() * a.length)];

export async function town() {
  const { E, P } = market(), lnd = landing(), cr = crepissage();
  // (the channel's water is the planet's sea: ground.js, sea)
  const plans = [base('djenne-market', E), { ...base('djenne-market-people', P), style: 'life' }, base('djenne-landing', lnd.E.filter((e) => e.t !== 'boat')), { ...base('djenne-landing-life', [...lnd.P, ...lnd.E.filter((e) => e.t === 'boat')]), style: 'life' }, base('djenne-crepissage', cr.E), { ...base('djenne-crepissage-life', cr.P), style: 'life' }];
  // the masons' yards on the open ground round the platform, with their masons and a donkey with clay
  { const Y = [[-48, -48, 0.1], [-30, 48.5, 3.2], [-50, 18, 1.6], [20, -49, 0], [-50, -22, 1.5]].map(([x, z, r], i) => ({ t: 'brick_yard', c: [x, z], rot: r, n: 5, seed: i + 3 }));
    plans.push(base('djenne-yards', Y)); const rr = rng(77); const Pm = [];
    for (const y of Y) { Pm.push({ t: 'figure', at: [y.c[0] + 1, y.c[1] - 2], y: 0, rot: rr() * 6, seed: Math.floor(rr() * 1e9), dress: 'tunic', legs: 'bare', top: 'bare', skin: 'skin_dark', hat: 'none', feet: 'bare', carry: 'hoe' }); Pm.push({ t: 'animal', kind: 'donkey', at: [y.c[0] + 4, y.c[1] + 3], y: 0, rot: rr() * 6, seed: Math.floor(rr() * 1e9), gear: true }); }
    plans.push({ ...base('djenne-yards-life', Pm), style: 'life' }); }
  plans.push(base('djenne-shops', [{ t: 'sahel_shops', rect: SHOPS, n: 8, seed: 3 }, { t: 'sahel_court_house', rect: COURT, seed: 9 }]));
  const all = houses(), homes = enterable(all);
  for (let i = 0; i < all.length; i += 110) plans.push(base(`djenne-houses-${i / 110}`, all.slice(i, i + 110).map((h) => ({ t: homes.has(h) ? 'sahel_home' : 'sahel_house', ...h }))));
  plans.push({ ...base('djenne-home-life', [...homeLife(homes), ...frontsLife(all), ...mosqueLife(), ...plain()]), style: 'life' });
  return plans;
}
