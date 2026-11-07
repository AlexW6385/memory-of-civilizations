// The town round the mosque (docs/settlements/djenne.md §6, §11): the market square on market day,
// the houses packed along the streets.

import { RADIUS, MARKET, LEVEL, ISLAND, houses, shore } from './layout.js';
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
  // people: porters carrying loads up, women come for fish and water, boatmen talking
  for (let k = 0; k < 18; k++) {
    const a = A0 + rand() * (A1 - A0), s = -1 - rand() * 6, p = at(a, s), rot = rand() * 6.28;
    if (rand() < 0.5) fig(p, 0, rot, { dress: 'wrap', feet: 'bare', hat: 'turban', carry: rand() < 0.6 ? pick(['pot', 'basket']) : 'none', pose: 'stand' });
    else fig(p, 0, rot, { dress: rand() < 0.5 ? 'robe' : 'tunic', legs: 'bare', feet: 'bare', hat: pick(['cap', 'none', 'turban']), pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  return { E, P };
}

export async function town() {
  const { E, P } = market(), lnd = landing();
  const water = { t: 'water_cells', rect: [-RADIUS + 20, -RADIUS + 20, RADIUS - 20, RADIUS - 20], y: LEVEL.water, cell: 2, inside: (x, z) => { const s = shore(x, z); return s > 7 && s < 39; } };
  const plans = [base('djenne-market', [...E, water]), { ...base('djenne-market-people', P), style: 'life' }, base('djenne-landing', lnd.E.filter((e) => e.t !== 'boat')), { ...base('djenne-landing-life', [...lnd.P, ...lnd.E.filter((e) => e.t === 'boat')]), style: 'life' }];
  const all = houses();
  for (let i = 0; i < all.length; i += 110) plans.push(base(`djenne-houses-${i / 110}`, all.slice(i, i + 110).map((h) => ({ t: 'sahel_house', ...h }))));
  return plans;
}
