// The life of Ur's streets beyond what the generic pass puts down (docs/settlements/ur.md §5.2): a scribe
// with his tablets by the temenos's north gate and a man dictating to him; a train of donkeys with their
// packs and drivers coming down the north street to the market (the beasts of burden of Ur III: asses,
// not camels); a shepherd with sheep and goats; porters carrying jars up from the moored boats on the quay;
// a fisherman mending his net. Figures and beasts are a 'life' plan; the scribe's mat and tablets, the
// net and the stacked jars are the 'sumerian' style's (`scribe_kit`, `quay_goods`).
import { MARKET, COURT, HARBOUR, houses, usedLots, BOATS, YARD, TERRACE, stairY } from './layout.js';
import { doorOf } from '../../styles/sumerian/index.js';
import { lotPoint, lotRot, tradeRoom } from '../../styles/sumerian/house.js';
import { TRADE_SPOT } from '../../styles/sumerian/trades.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const N = 0, S = Math.PI, E = -Math.PI / 2, W = Math.PI / 2;             // a figure's rot to face north, south, east, west

export function urLife() {
  const rand = rng(2051), figures = [], gear = [], seed = () => Math.floor(rand() * 1e9);
  const man = (at, y, rot, o = {}) => figures.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', top: 'bare', cloth: ['cloth_white', 'linen', 'cloth_ochre'][Math.floor(rand() * 3)], over: 'belt', hair: 'shaven', beard: rand() < 0.4, skin: 'skin_medium', hat: 'none', feet: 'bare', ...o });
  // the scribe by the gate, cross-legged on his mat facing the man who dictates; a second client waits
  const [gx, gz] = [-15.5, -181.5];
  gear.push({ t: 'scribe_kit', at: [gx, gz], y: 0, rot: N });
  man([gx, gz], 0.03, N, { pose: 'cross', dress: 'robe', top: '', cloth: 'linen', over: 'shawl', cloth2: 'cloth_white', hair: 'shaven', beard: false, h: 1.66 });
  man([gx + 0.1, gz - 1.7], 0, S, { pose: 'talk', dress: 'robe', top: '', cloth: 'cloth_ochre', over: 'shawl', cloth2: 'cloth_brown', hair: 'long', beard: true, carry: 'staff', len: 1.5, staffMat: 'wood_dark' });
  man([gx - 1.3, gz - 2.6], 0, S + 0.4, { pose: 'stand', arms: 'clasp' });
  // the donkeys coming down the north street, loaded, with their drivers
  for (let k = 0; k < 4; k++) {
    const z = -262 + k * 3.1, x = -4.5 + (k % 2) * 0.6;
    figures.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot: S + (rand() - 0.5) * 0.15, seed: seed(), gear: true });
  }
  man([-3.4, -250.6], 0, S, { carry: 'staff', len: 1.6, staffMat: 'wood_dark', pose: 'staff' });
  man([-5.6, -264.8], 0, S + 0.1, { carry: 'staff', len: 1.5, staffMat: 'wood_dark', pose: 'staff', over: 'shawl', top: '' });
  // a shepherd with a few sheep and goats at the square's west end, bound for the temple's pens
  const [sx, sz] = [MARKET[0] + 5, MARKET[3] - 6];
  man([sx + 2.2, sz + 0.4], 0, E, { carry: 'staff', len: 1.7, pose: 'staff', staffMat: 'wood_dark', over: 'shawl', top: '', cloth: 'cloth_brown' });
  for (let k = 0; k < 7; k++) figures.push({ t: 'animal', kind: k < 5 ? 'sheep' : 'goat', at: [sx - k * 0.9 + (rand() - 0.5) * 0.8, sz + (rand() - 0.5) * 2.6], y: 0, rot: E + (rand() - 0.5) * 0.8, seed: seed() });
  // the quay: porters carrying jars up from the boats, jars stacked, a fisherman mending his net
  const qx = HARBOUR.rect[2], bx = qx + 3.6;                         // the quay's middle (its top 0.6 m up), the ground behind it
  for (const [z, rot, carry] of [[-94, E, 'pot'], [-91.5, W, 'none'], [-58.5, E, 'pot'], [-10, E, 'basket'], [-6.5, W, 'pot']]) man([qx + (rand() - 0.5) * 0.8, z], 0.6, rot, { carry });
  gear.push({ t: 'quay_goods', at: [bx, -97], y: 0, rot: W, kind: 'jars' }, { t: 'quay_goods', at: [bx, -55], y: 0, rot: W, kind: 'reeds' }, { t: 'quay_goods', at: [bx + 0.4, 24], y: 0, rot: E, kind: 'net' });
  man([bx + 0.4, 25.7], 0, N, { pose: 'sit_ground' });
  // the market: sellers squatting behind their mats of goods — fish from the marshes, dates, onions and greens,
  // bread, pots, baskets — and a few stalls shaded by reed mats on poles, in two rows either side of the way to the gate
  const WARES = [['fish', 'heap'], ['heap', 'baskets'], ['greens', 'heap'], ['bread', 'baskets'], ['pottery', 'pottery'], ['baskets', 'fish'], ['heap', 'greens']];
  let w = 0;
  for (const z of [-189, -204]) for (const x of [-38, -32, -26, -19, 13, 19, 25, 31, 37]) {
    if (rand() < 0.15) continue;
    const g = WARES[w++ % WARES.length], south = z > -195, srot = south ? S : N, rot = south ? N : S, back = south ? 1.0 : -1.0;   // the stall's front and the seller face the aisle
    if ((w % 4) === 0) {
      figures.push({ t: 'stall', at: [x, z], y: 0, rot: srot, seed: seed(), awning: 'reed_mat', stripe: null, goods: g, w: 2.4, d: 1.2 });
      man([x + 0.3, z + back * 1.3], 0, rot, { pose: 'stand', arms: 'clasp' });
    } else {
      figures.push({ t: 'goods_mat', at: [x, z], y: 0, rot, seed: seed(), goods: g, mat: 'reed_mat' });
      man([x - 0.2, z + back * 0.95], 0, rot, rand() < 0.5 ? { pose: 'squat' } : { pose: 'sit_ground', dress: 'robe', top: '', cloth: 'cloth_white', over: 'shawl', cloth2: 'cloth_ochre', hair: 'bun', beard: false, h: 1.5 });
    }
    // a buyer at every other one
    if (rand() < 0.5) man([x + (rand() - 0.5), z - back * 1.6], 0, rot + S + (rand() - 0.5) * 0.5, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
  }
  // two women with jars on their heads crossing the square, children by the houses
  figures.push({ t: 'figure', at: [6, -196], y: 0, rot: E + 0.3, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', carry: 'pot', h: 1.52 });
  figures.push({ t: 'figure', at: [7.1, -195.2], y: 0, rot: E + 0.2, seed: seed(), dress: 'robe', cloth: 'linen', cloth2: 'cloth_brown', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', h: 1.5 });
  figures.push({ t: 'figure', at: [-20.5, -219.2], y: 0, rot: S, seed: seed(), child: true, dress: 'wrap', top: 'bare', cloth: 'linen', hair: 'shaven', feet: 'bare' });
  const n0 = figures.length;
  courtLife(figures, gear, man, rand, seed);
  tradeWorkers(figures, man, rand);
  harbourLife(figures, gear, man, rand, seed);
  doorLife(figures, man, rand, seed);
  // the beasts in the pens of the empty lots: sheep and goats, a pair of oxen, or a donkey and a shepherd boy
  for (const { rect: r, k, kind } of usedLots()) {
    if (kind !== 'pen') continue;
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, n = 4 + (k % 4);
    for (let i = 0; i < n; i++) figures.push({ t: 'animal', kind: k % 5 === 0 ? 'ox' : k % 3 === 0 ? 'goat' : 'sheep', at: [cx + (rand() - 0.5) * (r[2] - r[0] - 3.2), cz + 0.5 + (rand() - 0.5) * (r[3] - r[1] - 3.6)], y: 0, rot: rand() * 6.28, seed: seed() });
    if (k % 4 === 1) man([r[2] + 0.9, cz], 0, W, { carry: 'staff', len: 1.6, pose: 'staff', child: true });
  }
  zigguratLife(figures, man, rand, seed);
  // the court is paved (the way of buff brick 5 cm, the rest 3.5 cm above the ground): feet on the pavement, not in it
  for (let i = n0; i < figures.length; i++) { const f = figures[i], [x, z] = f.at; if (f.y === 0 && x > COURT[0] + 1.25 && x < COURT[2] - 1.25 && z > COURT[1] + 1.25 && z < COURT[3]) f.y = Math.abs(x) < 5.5 ? 0.05 : 0.035; }
  return { figures, gear };
}

/** The worker of each trade house that can be entered, at his place in the trade's room (trades.js TRADE_SPOT). */
function tradeWorkers(figures, man, rand) {
  for (const h of houses()) {
    if (!h.open || !h.trade) continue;
    const sp = TRADE_SPOT[h.trade]?.(tradeRoom(h));
    if (!sp) continue;
    const [x, z] = lotPoint(h, ...sp.at), rot = lotRot(h, ...sp.face);
    if (sp.women) figures.push({ t: 'figure', at: [x, z], y: sp.pose === 'sit_low' ? 0.06 : 0.06, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', pose: sp.pose, h: 1.5 });
    else man([x, z], 0.06, rot, { pose: sp.pose });
  }
}

/** The life of the harbour (§6.2): a punter at the stern of each boat, women washing at the steps, fishermen, reed-cutters, oxen watering, a boat being built on the yard. */
function harbourLife(figures, gear, man, rand, seed) {
  const water = HARBOUR.water, qx = HARBOUR.rect[2];
  BOATS.forEach(([x, z, d, len], i) => {
    if (i % 3 === 2) return;                                           // some lie empty
    man([x, z - d * len * 0.38], water + 0.1, d > 0 ? S : N, { carry: 'punt', pose: 'punt', len: 3.2, poleMat: 'palm_trunk', over: 'belt' });
    if (i % 2 === 0) man([x + 0.05, z + d * len * 0.05], water + 0.1, d > 0 ? S : N, { pose: 'sit_ground', over: 'none' });
  });
  // the steps at z -80, -30, 12: women kneeling to wash, their baskets by them
  for (const z of [-80, -30, 12]) {
    const sx = qx - 4.6 + 10.5 * (3.1 / 14);
    for (const [dz, k] of [[0.5, 0], [1.7, 1]]) figures.push({ t: 'figure', at: [sx - k * 0.22, z + dz], y: -1.7 + (11 - k * 2) * 0.1643, rot: W, seed: seed(), dress: 'robe', cloth: k ? 'cloth_ochre' : 'cloth_white', cloth2: 'cloth_brown', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', pose: 'kneel', h: 1.5 });
    figures.push({ t: 'goods_mat', at: [qx - 1.2, z + 1.2], y: 0.6, rot: W, seed: seed(), goods: ['baskets', 'heap'], mat: 'reed_mat' });
  }
  // fishermen at the quay's edge with their spears and a boy with a line
  for (const [z, kind] of [[-44, 'spear'], [-20, 'spear'], [36, 'line']]) man([qx - 0.4, z], 0.6, W, { carry: 'staff', len: kind === 'spear' ? 2.6 : 2.0, pose: 'staff', staffMat: 'palm_trunk', child: kind === 'line' });
  // reed-cutters coming up from the marsh with bundles on their shoulders, a donkey with a load of reeds
  for (const z of [-75, -52, 0, 40]) man([qx + 5 + rand() * 4, z], 0, E, { carry: 'bundle' });
  figures.push({ t: 'animal', kind: 'donkey', at: [qx + 9, -66], y: 0, rot: E, seed: seed(), gear: true });
  // oxen watering at the steps, a herd boy by them
  for (const dz of [0, 2.4, 4.6]) figures.push({ t: 'animal', kind: 'ox', at: [qx + 3.6, 20 + dz], y: 0, rot: W + (rand() - 0.5) * 0.5, seed: seed() });
  man([qx + 5.4, 24], 0, W, { carry: 'staff', len: 1.6, pose: 'staff', child: true });
  // the yard: a boat on trestles, three men binding the bundles, a pot of bitumen over a fire, fish drying on a rack
  const [yx, yz] = YARD.at;
  man([yx + 1.4, yz - 1.5], 0, W, { pose: 'squat' }); man([yx - 1.4, yz + 0.8], 0, E, { pose: 'kneel' }); man([yx + 1.5, yz + 2.8], 0, W, { pose: 'stand', carry: 'bundle' });
  gear.push({ t: 'quay_goods', at: [yx + 3.5, yz + 3], y: 0, rot: W, kind: 'reeds' }, { t: 'quay_goods', at: [yx - 4, yz - 3], y: 0, rot: E, kind: 'net' });
  man([yx - 4, yz - 1.6], 0, N, { pose: 'sit_ground' });
}

/** The people at the doors of the houses near the core: a woman grinding at her door, an old man on his bench, children at play, a dog, a donkey tied up. */
function doorLife(figures, man, rand, seed) {
  const sx = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
  for (const h of houses()) {
    if (h.lod !== 2 || h.chapel || rand() > 0.34) continue;
    const { face, dc } = h.open ? { face: h.door, dc: null } : doorOf(h);
    if (dc === null) continue;
    const [x0, z0, x1, z1] = h.rect, [nx, nz] = sx[face], P = (u, v) => (nx ? [(nx > 0 ? x1 : x0) + nx * v, u] : [u, (nz > 0 ? z1 : z0) + nz * v]);
    const rot = Math.atan2(nx, nz) + Math.PI, k = rand(), side = rand() < 0.5 ? -1 : 1, [x, z] = P(dc + side * 1.9, 0.75);
    if (k < 0.3) figures.push({ t: 'figure', at: [x, z], y: 0, rot, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', pose: 'kneel', h: 1.5 });
    else if (k < 0.55) man([x, z], 0, rot, { pose: 'sit_ground', beard: true });
    else if (k < 0.75) man([x, z], 0, rot + (rand() - 0.5), { child: true, pose: 'squat' });
    else if (k < 0.9) figures.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: seed() });
    else figures.push({ t: 'animal', kind: 'donkey', at: P(dc + side * 2.0, 0.9), y: 0, rot: rot + 1.57, seed: seed(), gear: true });
  }
}

/**
 * The Court of Nanna at the visitor's arrival (§4.4): priests and temple staff at the altar and the table of offerings, a file of
 * bearers with jars, loaves and bundles going up the axis to the stairs, a lamb led to the pen, donkeys unloading fuel and grain by the
 * pen, worshippers at the stelae and the washing basins, scribes and musicians in the reed pavilion. Positions are from the court's rect
 * and the court furnishing (court.js), all 4 m or more from the arrival (the arrival is at the court's z0 + 22 looking south: everything is set in front of it, from z0 + 26 to the stairs' foot).
 */
function courtLife(figures, gear, man, rand, seed) {
  const z0 = COURT[1], robe = (cloth, o = {}) => ({ dress: 'robe', top: '', cloth, over: 'shawl', cloth2: 'cloth_white', hair: 'shaven', beard: rand() < 0.5, ...o });
  // the priests round the altar of burnt offering (x -17, z0 + 40) and at the table of offerings (x 17): one burns, one pours, others stand by
  man([-17, z0 + 37.4], 0, S, robe('cloth_white', { pose: 'stand', arms: 'clasp' }));
  man([-14.8, z0 + 41.2], 0, W, robe('linen', { pose: 'stand', carry: 'staff', len: 1.6, staffMat: 'wood_dark' }));
  man([-19.4, z0 + 41.6], 0, E, robe('cloth_white', { pose: 'talk' }));
  man([17, z0 + 38.2], 0, S, robe('cloth_white', { pose: 'stand', arms: 'clasp' }));
  man([19.4, z0 + 41.6], 0, W, { pose: 'stand', carry: 'pot' });
  figures.push({ t: 'figure', at: [14.6, z0 + 41.4], y: 0, rot: E, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', carry: 'basket', h: 1.52 });
  // the file of bearers going up the way to the stairs: jars, baskets, loaves, a bundle of reeds, two women, a boy
  const bear = [[-2.6, 28, 'pot'], [2.4, 31.5, 'basket'], [-2.2, 35, 'bundle'], [2.8, 39, 'pot'], [-2.8, 43.5, 'basket'], [2.2, 47.5, 'pot'], [-2.4, 52, 'pot'], [2.6, 56, 'basket']];
  bear.forEach(([x, dz, carry], i) => {
    if (i % 3 === 1) figures.push({ t: 'figure', at: [x, z0 + dz], y: 0, rot: S + (rand() - 0.5) * 0.2, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', carry, h: 1.52 });
    else man([x, z0 + dz], 0, S + (rand() - 0.5) * 0.2, { carry });
  });
  man([0.4, z0 + 41], 0, S, { child: true, carry: 'none' });
  // a lamb led to the pen of the offering (x -33, z0 + 52) by a temple herdsman, sheep inside it, a boy with a kid
  man([-24.5, z0 + 47], 0, E, { carry: 'staff', len: 1.7, pose: 'staff', staffMat: 'wood_dark', over: 'shawl', top: '', cloth: 'cloth_brown' });
  figures.push({ t: 'animal', kind: 'sheep', at: [-26.4, z0 + 47.4], y: 0, rot: E, seed: seed() }, { t: 'animal', kind: 'sheep', at: [-27.5, z0 + 46.4], y: 0, rot: E + 0.3, seed: seed() });
  for (let k = 0; k < 5; k++) figures.push({ t: 'animal', kind: k < 4 ? 'sheep' : 'goat', at: [-36.4 + k * 1.6 + (rand() - 0.5) * 0.4, z0 + 51.3 + (rand() - 0.5) * 2.4], y: 0, rot: rand() * 6.28, seed: seed() });
  // donkeys by the fuel stack and the pen, unloaded by their drivers: fuel for the altar, jars of beer and grain
  for (const [x, dz, r] of [[-30, 28, E + 0.5], [-28.2, 31.5, E - 0.3]]) figures.push({ t: 'animal', kind: 'donkey', at: [x, z0 + dz], y: 0, rot: r, seed: seed(), gear: true });
  man([-27.2, z0 + 29.6], 0, W, { carry: 'staff', len: 1.5, staffMat: 'wood_dark', pose: 'staff' });
  man([-29.4, z0 + 26.6], 0, N, { carry: 'bundle' });
  // worshippers at the stelae (x +-31, z0 + 28) and at the basins (x +-12, z0 + 14): kneeling, a man washing his hands
  for (const sx of [-1, 1]) {
    man([sx * 31 + 0.4, z0 + 31.4], 0, N, { pose: 'kneel', arms: 'pray' });
    man([sx * 29.2, z0 + 30.6], 0, N + 0.3, robe('cloth_ochre', { pose: 'stand', arms: 'clasp' }));
  }
  // the pavilion's shade (x 33, z0 + 52): the temple scribes on the bench and on the mat, a musician with a lyre's place
  man([32, z0 + 51], 0, N, robe('linen', { pose: 'cross' })); man([35, z0 + 50.4], 0, N, robe('cloth_white', { pose: 'cross', beard: true }));
  man([33.6, z0 + 54.2], 0, S, { pose: 'sit', over: 'shawl', top: '', cloth: 'cloth_ochre' });
  // two women with water jars on their heads by the entrance's jar stands, a pair of boys crossing, a dog
  for (const [x, dz, r] of [[-11.5, 31, S], [11.2, 34.5, N + 0.4]]) figures.push({ t: 'figure', at: [x, z0 + dz], y: 0, rot: r, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', carry: 'pot', h: 1.5 });
  man([-9.5, z0 + 29], 0, E, { child: true }); man([-7.8, z0 + 29.8], 0, E, { child: true, carry: 'basket' });
  figures.push({ t: 'animal', kind: 'dog', at: [8, z0 + 27], y: 0, rot: 1.2, seed: seed() });
  // the guards at the terrace stairs' foot with spear and shield, the temple's door-keepers
  for (const sx of [-1, 1]) man([sx * 8.2, z0 + 60.5], 0, N, { pose: 'staff', carry: 'staff', len: 2.0, staffMat: 'wood_dark', over: 'belt' });
}

/**
 * The people on the ziggurat's stair and terrace and before them (§4.4b): bearers going up the central stair with jars and loaves, priests
 * coming down, pilgrims waiting at the terrace stair's head, a bull led up the way by two herdsmen and a priest, musicians on a reed mat
 * at the way's edge, the queue of the offering, kneeling worshippers at the stair's foot, children at play under the palms. They give the
 * stages their scale from the court; none within 6 m of the arrival (0, -118).
 */
function zigguratLife(figures, man, rand, seed) {
  const robe = (cloth, o = {}) => ({ dress: 'robe', top: '', cloth, over: 'shawl', cloth2: 'cloth_white', hair: 'shaven', beard: rand() < 0.5, ...o });
  const woman = (at, y, rot, o = {}) => figures.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'robe', cloth: rand() < 0.5 ? 'cloth_white' : 'linen', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', skin: 'skin_medium', feet: 'bare', h: 1.5, ...o });
  // the central stair, 8 m wide between its low parapets: those going up on the west side, those coming down on the east
  for (const [x, z, k] of [[-2.6, -48.5, 'pot'], [-1.2, -45, 'basket'], [-2.8, -41, 'bundle'], [-1.0, -37.5, 'pot'], [-2.5, -33.5, 'basket'], [-1.3, -30, 'pot'], [-2.7, -26.5, 'none'], [-2.0, -23.5, 'basket']]) {
    const y = stairY(x, z); if (y === null) continue;
    if (k === 'pot' || k === 'basket') woman([x, z], y, S, { carry: k }); else man([x, z], y, S, k === 'none' ? robe('cloth_white', { pose: 'stand' }) : { carry: k });
  }
  for (const [x, z, c] of [[2.4, -46.5, 'cloth_white'], [1.3, -39, 'linen'], [2.7, -32, 'cloth_white'], [1.6, -27.5, 'cloth_ochre']]) { const y = stairY(x, z); if (y !== null) man([x, z], y, N, robe(c, { pose: 'stand', arms: 'clasp' })); }
  // the head of the terrace stair: pilgrims waiting for the priest who admits them, two door-keepers
  const ty = TERRACE.y;
  for (const [x, z, r, o] of [[-3.4, -64, N + 0.3, { pose: 'stand', arms: 'clasp' }], [-1.9, -62, N - 0.2, { pose: 'talk' }], [2.6, -63, N + 0.5, { carry: 'pot' }], [4.4, -61, N, { pose: 'stand', carry: 'basket' }], [0.6, -58.5, S, robe('cloth_white', { pose: 'stand', carry: 'staff', len: 1.7, staffMat: 'wood_dark' })]])
    man([x, z], ty, r, o);
  for (const sx of [-1, 1]) man([sx * 7.3, -66.5], ty, N, { pose: 'staff', carry: 'staff', len: 2.0, staffMat: 'wood_dark', over: 'belt' });
  // the bull of the offering led up the way: a herdsman at its head, one behind with the stick, a priest going before
  figures.push({ t: 'animal', kind: 'ox', at: [0.9, -88], y: 0.05, rot: S, seed: seed() });
  man([-0.6, -85.8], 0.05, S, { carry: 'staff', len: 1.6, pose: 'staff', staffMat: 'wood_dark', over: 'shawl', top: '', cloth: 'cloth_brown' });
  man([1.8, -91.4], 0.05, S, { carry: 'staff', len: 1.7, pose: 'staff', staffMat: 'wood_dark' });
  man([0, -83.6], 0.05, S, robe('cloth_white', { pose: 'stand', carry: 'staff', len: 1.7, staffMat: 'wood_dark', beard: false }));
  // the musicians on a reed mat at the way's east edge (the mat is the court's: court.js), facing the axis: a harp, a pipe, a drum
  for (const [z, pose] of [[-103.8, 'harp'], [-102.2, 'flute'], [-100.6, 'drum']]) man([4.85, z], 0.058, W, robe('cloth_white', { pose, beard: pose !== 'flute' }));
  // the queue of those bringing offerings, along the west edge, and the worshippers kneeling before the stair
  for (const [x, z, k] of [[-4.4, -104, 'pot'], [-4.6, -101.2, 'basket'], [-4.0, -97, 'none'], [-4.3, -93.5, 'pot']]) { if (k === 'none') man([x, z], 0.05, S, { child: true }); else woman([x, z], 0.05, S + (rand() - 0.5) * 0.2, { carry: k }); }
  for (const [x, z] of [[-4.6, -82.4], [-6.4, -81.6], [4.3, -82.2], [6.2, -81.4]]) man([x, z], 0.05, S, { pose: 'kneel', arms: 'pray' });
  // children at play by the palms of the way, a dog
  man([-13.4, -88.5], 0.035, E, { child: true }); man([-12.2, -87.2], 0.035, W, { child: true, carry: 'basket' });
  figures.push({ t: 'animal', kind: 'dog', at: [-11.4, -89.6], y: 0.035, rot: 2.2, seed: seed() });
}
