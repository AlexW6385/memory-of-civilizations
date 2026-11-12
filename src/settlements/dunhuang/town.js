// The oasis town (docs/settlements/dunhuang.md §6, §7): rows of rammed-earth houses on both sides of the main
// street and along back lanes between the cross lanes, a wall round the town with the east gate, the caravanserai
// with camels and loads, the market's awnings and stalls, the painters, monks and pilgrims at the cliff foot.
import { RADIUS, XF, FLOOR, STREET, CROSS, LANE_W, TOWN, SERAI, GATE, CAVES, rng, inRect, riverX } from './layout.js';
import '../../styles/dunhuang/index.js';
import { doorU } from '../../styles/dunhuang/homes.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [14, 0], facing: 'w' } });
const clash = (r, o, m = 0.5) => !(r[2] + m <= o[0] || r[0] - m >= o[2] || r[3] + m <= o[1] || r[1] - m >= o[3]);
const SERAI_R = [SERAI.x0, SERAI.z0, SERAI.x1, SERAI.z1];
/** The segments of the town along the street between the cross lanes: [x0, x1]. */
const SEG = (() => { const xs = [TOWN[0], ...CROSS.flatMap((c) => [c - LANE_W / 2, c + LANE_W / 2]), TOWN[2]], out = []; for (let i = 0; i < xs.length; i += 2) out.push([xs[i], xs[i + 1]]); return out; })();
const TRADE_LIST = ['cloth', 'grain', 'pottery', 'smith', 'bake', 'wine', 'scribe', 'saddler', 'drugs'];
/** The trade of a lot on the main street (a home elsewhere): by place along the street, deterministic and apart from the lot rng. */
function shopTrade(r, row) {
  if (Math.abs(row.z0) > 30 || row.z0 < -20 && row.z0 > -22) return null;
  const h = Math.abs(Math.imul(Math.round(r[0] * 31 + r[1] * 17), 2654435761) >>> 0);
  const near = r[0] > 20 && r[0] < 130;
  return near || h % 3 === 0 ? TRADE_LIST[h % TRADE_LIST.length] : null;
}
/** Every lot: { rect, front, left }, exported for the movers and the smoke. */
export function lots() {
  const rand = rng(850), out = [];
  const rows = [
    { z0: -20, z1: -6, front: 's' }, { z0: -38.5, z1: -24.1, front: 's' }, { z0: -58.5, z1: -43.1, front: 's', back: true },
    { z0: 6, z1: 20, front: 'n' }, { z0: 24.1, z1: 38.5, front: 'n' }, { z0: 43.1, z1: 58.5, front: 'n', back: true },
  ];
  for (const row of rows) for (const [a, b] of SEG) {
    let x = a, first = true;
    while (b - x > 7) {
      const w = Math.min(b - x, 8 + rand() * 5), rest = b - (x + w);
      const W = rest < 7 ? b - x : w;
      const r = [x, row.z0, x + W, row.z1];
      x += W;
      if (clash(r, SERAI_R, 1.5) || (row.back && rand() < 0.25)) { first = false; continue; }
      out.push({ rect: r, front: row.front, left: first, seed: Math.round(r[0] * 13 + r[1] * 7), rich: Math.abs((r[0] + r[2]) / 2 - 60) < 55 && Math.abs(row.z0) < 30 && rand() < 0.38, two: rand() < 0.16 && Math.abs(row.z0) < 30, trade: shopTrade(r, row) });
      first = false;
    }
  }
  return out;
}

export async function town() {
  const E = [], L = [], rand = rng(851);
  for (const lot of lots()) E.push({ t: 'dh_house', rect: lot.rect, front: lot.front, seed: lot.seed, trade: lot.trade, tiled: lot.rich, storeys: lot.two ? 2 : 1, left: lot.left });
  // the wall round the town: the east side with the gate, the north and south sides pierced by the lanes
  const [wx0, wz0, wx1, wz1] = TOWN;
  const w = (a, b) => E.push({ t: 'dh_wall', a, b, h: 3.6, th: 0.9 });
  w([wx1, wz0], [wx1, -GATE.z - 3.2]); w([wx1, 3.2], [wx1, wz1]);
  for (const z of [wz0, wz1]) {
    let x = wx0;
    for (const c of CROSS) { w([x, z], [c - LANE_W / 2, z]); x = c + LANE_W / 2; }
    w([x, z], [wx1, z]);
  }
  E.push({ t: 'dh_gate', at: [GATE.x, GATE.z] });
  E.push({ t: 'dh_serai', ...SERAI });
  E.push({ t: 'dh_spring' }); E.push({ t: 'dh_streetwear', seed: 5 });
  // the market: awnings on both sides of the street between the first two cross lanes
  const cl = ['cloth_ochre', 'cloth_red', 'cloth_blue', 'cloth_white', 'cloth_green'];
  // the doors along the main street (the market keeps off them)
  const doorsX = (side) => lots().filter((l) => l.front === side && Math.abs(l.rect[side === 's' ? 3 : 1]) === 6).map((l) => l.rect[0] + doorU(l.rect[2] - l.rect[0], !!l.trade, rng(l.seed * 7 + 3)()));
  const dS = doorsX('s'), dN = doorsX('n'), gapsOf = (d) => d.map((x) => [x - 1.3, x + 1.3]);
  const nearDoor = (d, x) => d.some((q) => Math.abs(q - x) < 3.0);
  for (let x = 30, k = 0; x < 66; x += 9, k++) { E.push({ t: 'dh_awning', a: [x, -5.95], b: [x + 7, -5.95], dir: [0, 1], depth: 2.1, cloth: cl[k % 5], gaps: gapsOf(dS) }); E.push({ t: 'dh_awning', a: [x + 1, 5.95], b: [x + 8, 5.95], dir: [0, -1], depth: 2.1, cloth: cl[(k + 2) % 5], gaps: gapsOf(dN) }); }
  // ── the life
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_brown', 'cloth_grey', 'cloth_blue', 'cloth_ochre'][Math.floor(rand() * 4)], over: 'sash', skin: 'skin_medium', hat: 'none', hair: 'short', feet: 'shod', ...o });
  const sogdian = (at, y, rot, o = {}) => man(at, y, rot, { dress: 'tunic', legs: 'hose', cloth: ['cloth_green', 'cloth_red', 'cloth_blue'][Math.floor(rand() * 3)], cloth2: 'cloth_white', hat: 'cap', over: 'belt', beard: rand() < 0.5, skin: 'skin_light', ...o });
  const monk = (at, y, rot, o = {}) => man(at, y, rot, { dress: 'robe', cloth: ['cloth_ochre', 'cloth_brown', 'cloth_grey'][Math.floor(rand() * 3)], cloth2: 'cloth_brown', over: 'shawl', hair: 'shaven', hat: 'none', feet: 'shod', ...o });
  // the market's stalls under the awnings (the stall's front is +z)
  for (let x = 30, k = 0; x < 66; x += 9, k++) {
    if (!nearDoor(dS, x + 3.5)) L.push({ t: 'stall', at: [x + 3.5, -6.4], y: 0, rot: 0, awning: cl[k % 5], goods: [['cloth', 'produce', 'basket'][k % 3]], w: 2.2, d: 1.4 });
    if (!nearDoor(dN, x + 4.5)) L.push({ t: 'stall', at: [x + 4.5, 6.4], y: 0, rot: Math.PI, awning: cl[(k + 2) % 5], goods: [['basket', 'cloth', 'produce'][k % 3]], w: 2.2, d: 1.4 });
    if (!nearDoor(dS, x + 3.5)) sogdian([x + 3.5, -7.5], 0, Math.PI, { pose: 'stand' }); if (!nearDoor(dN, x + 4.5)) man([x + 4.5, 7.6], 0, 0);
  }
  // the caravan at the serai's gate: Bactrian camels (the one-humped beast standing in), loaded, with drivers
  const cx = (SERAI.x0 + SERAI.x1) / 2;
  for (let k = 0; k < 5; k++) {
    const x = cx - 14 + k * 4.2, z = 8.9; L.push({ t: 'animal', kind: 'camel', at: [x, z], y: 0, rot: Math.PI / 2 + 0.05 * k, seed: 40 + k, gear: true });
    if (k % 2 === 0) L.push({ t: 'sacks', at: [x + 1.6, z + 0.9], y: 0, rot: 0.4, n: 4, seed: k });
  }
  sogdian([cx - 7.4, 9.8], 0, -Math.PI / 2, { carry: 'staff' }); sogdian([cx + 1, 9.9], 0, 0.2, { pose: 'talk' }); sogdian([cx + 2.0, 10.4], 0, -2.9, { pose: 'talk' });
  // the yard: camels kneeling (standing) in the stalls, bales and sacks, a woman at the well
  for (let k = 0; k < 4; k++) L.push({ t: 'animal', kind: 'camel', at: [SERAI.x1 - 3.4, SERAI.z0 + 5 + k * 4.5], y: 0, rot: Math.PI, seed: 60 + k, gear: false, graze: k % 2 === 0 });
  for (const [x, z] of [[cx - 7, 21], [cx + 4, 33], [cx - 4, 35], [cx + 8, 20]]) L.push({ t: 'sacks', at: [x, z], y: 0, rot: x, n: 5, seed: Math.round(x) });
  for (const [x, z] of [[cx - 9, 36], [cx + 6, 24]]) L.push({ t: 'crates', at: [x, z], y: 0, rot: 0.3, n: 4, seed: Math.round(z) });
  sogdian([cx + 2.2, 30], 0, 3.0, { carry: 'pot' });
  // the cliff-foot: a monk reading at the apron's edge, painters on the scaffold, pilgrims, a sculptor
  const AX = XF + 3.5;
  for (const [z, rot] of [[-60, -Math.PI / 2], [75, -Math.PI / 2], [95, -Math.PI / 2]]) monk([AX + 0.4, z], 0.45, rot, { pose: 'stand', carry: 'staff' });
  monk([AX - 1.0, -64], 0.45, -Math.PI / 2, { pose: 'cross' }); monk([AX - 1.0, 63], 0.45, -Math.PI / 2, { pose: 'pray' });
  for (let j = 1; j <= 3; j++) { man([XF + 1.2, -70 + (j - 2) * 2.4], j * 2.5, -Math.PI / 2, { dress: 'tunic', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_brown', hat: 'cap', over: 'apron', pose: 'stand', carry: 'staff', staffMat: 'timber' }); L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [XF + 0.8, -68.5 + (j - 2) * 2.4], y: j * 2.5, seed: j }); }
  for (const [x, z] of [[XF + 5.0, -44], [XF + 5.5, -34], [XF + 4.5, -48], [XF + 5, 36], [XF + 4.2, 8], [XF + 6, 18], [XF + 3.5, -20]]) man([x, z], 0.45, -Math.PI / 2 + (rand() - 0.5) * 1.2, { pose: rand() < 0.5 ? 'pray' : 'stand', dress: rand() < 0.5 ? 'robe' : 'tunic', hat: rand() < 0.5 ? 'cap' : 'none' });
  // offerings at the foot of the great hall: incense, jars of oil
  for (const z of [-5, 5]) L.push({ t: 'pot', kind: 'water_pot', n: 2, at: [XF + 3.2, z], y: 0.45, seed: 9 + z });
  // the street: a donkey with panniers at a lane's mouth, a dog, a cart of fodder; people along it are the movers'
  L.push({ t: 'animal', kind: 'donkey', at: [22, 7.6], y: 0, rot: 1.2, seed: 11, gear: true });
  for (let k = 0; k < 6; k++) { const x = -20 + rand() * 150, z = (rand() < 0.5 ? -1 : 1) * (6 + rand() * 40); if (L.every((p) => !p.at || Math.hypot(p.at[0] - x, p.at[1] - z) > 3) && !lots().some((l) => inRect(l.rect, x, z, 0.5))) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  // ── the street at eye level: idlers at the shops, wells and troughs at the lane mouths, carts, fowl, flocks, guards at the gate
  {
    const LT = lots(), isFree = (x, z, m = 0.6) => !LT.some((l) => inRect(l.rect, x, z, m)) && !inRect([SERAI.x0, SERAI.z0, SERAI.x1, SERAI.z1], x, z, 1.0);
    const put = (o) => L.push(o);
    const pickc = (a) => a[Math.floor(rand() * a.length)];
    // the shop-front idlers: a shopkeeper's boy or a customer beside the door, an old man on a bench, a donkey tied at the post
    for (const l of LT) {
      if (!l.trade) continue;
      const W = l.rect[2] - l.rect[0], dx = l.rect[0] + doorU(W, true, rng(l.seed * 7 + 3)()), side = l.front === 's' ? 1 : -1, ze = l.front === 's' ? l.rect[3] : l.rect[1];
      const z = ze + side * 1.9, k = rand();
      if (Math.abs(dx - 100) > 70) continue;
      if (k < 0.4) { const f = k < 0.2 ? sogdian : man; f([dx + 2.4, z], 0, side > 0 ? Math.PI : 0, { pose: 'talk' }); f([dx + 3.4, z + side * 0.2], 0, side > 0 ? 0 : Math.PI, { pose: 'talk' }); }
      else if (k < 0.62 && !(dx > 28 && dx < 70)) { put({ t: 'bench', at: [dx - 3.4, ze + side * 0.45], y: 0, rot: 0, len: 1.7, mat: 'banco' }); man([dx - 3.4, ze + side * 0.45], 0.47, side > 0 ? Math.PI : 0, { pose: 'cross', hat: 'cap' }); }
      else if (k < 0.78) put({ t: 'animal', kind: 'donkey', at: [dx + 3.4, ze + side * 1.4], y: 0, rot: side > 0 ? 0.3 : Math.PI - 0.3, seed: l.seed, gear: true });
      if (rand() < 0.35) put({ t: 'chickens', at: [dx + 5, ze + side * 1.0], rot: rand() * 6, n: 3, seed: l.seed });
    }
    // the lane mouths: a draw-well with its trough (the lanes are watered from the Daquan's channels), a parked cart, firewood and ladders along the lane walls
    CROSS.forEach((c, i) => {
      for (const sd of [-1, 1]) {
        const x = c + LANE_W / 2 + 2.6, z = sd * 5.0;
        if (i === 1 && sd < 0) continue;
        if (isFree(x, z, 0.3) && i !== 1) { put({ t: 'well', kind: i === 0 ? 'pulley' : 'open', at: [x, z], y: 0, rot: 0, mat: 'banco', roof: false }); put({ t: 'trough', at: [x + 1.6, z + sd * 0.3], y: 0, rot: 0, mat: 'banco' }); man([x - 0.2, z + sd * 1.3], 0, 0.5, { carry: 'pot', arms: 'head', dress: 'tunic', cloth: pickc(['cloth_red', 'cloth_green', 'cloth_ochre']), hair: 'bun', hat: 'none' }); }
      }
      for (let z = -52; z <= 52; z += 9 + Math.floor(rand() * 5)) {
        if (Math.abs(z) < 8) continue;
        const sdx = rand() < 0.5 ? -1 : 1, x = c + sdx * (LANE_W / 2 - 0.55), r = rand();
        if (r < 0.35) put({ t: 'firewood', at: [x, z], y: 0, rot: Math.PI / 2, len: 1.5, seed: Math.round(z) });
        else if (r < 0.55) put({ t: 'ladder', at: [x + sdx * 0.3, z], y: 0, rot: sdx > 0 ? Math.PI / 2 : -Math.PI / 2, len: 3.4 });
        else if (r < 0.75) put({ t: 'pot', kind: 'water_pot', n: 3, at: [x, z], y: 0, seed: Math.round(z) });
        else if (r < 0.9) put({ t: 'chickens', at: [c, z], rot: rand() * 6, n: 4, seed: Math.round(z) });
        else put({ t: 'animal', kind: pickc(['goat', 'dog', 'donkey']), at: [c + sdx * 0.8, z], y: 0, rot: rand() * 6.28, seed: Math.round(z) });
      }
    });
    // the market's edge: mats with sellers on the ground beyond the stalls, a barrow, a cart of fodder, porters
    for (const [x, z] of [[33, 3.4], [47, -3.2], [60, 3.6], [41, -3.6], [56, -3.1]]) { put({ t: 'goods_mat', at: [x, z], y: 0, rot: z > 0 ? Math.PI : 0, goods: [['basket', 'produce', 'heap'], ['pot', 'basket']][Math.abs(Math.round(x)) % 2], seed: Math.round(x) }); sogdian([x, z + (z > 0 ? -0.9 : 0.9)], 0, z > 0 ? 0 : Math.PI, { pose: 'cross' }); }
    put({ t: 'barrow', at: [72, 3.9], y: 0, rot: 0.2, seed: 3 }); put({ t: 'cart', at: [96, 4.0], y: 0, rot: Math.PI / 2 + 0.1, seed: 9, load: 'hay', beast: 'donkey' });
    // the gate: two guards with staves, a dog in the shade, a flock of sheep and goats driven in, a toll table
    for (const s of [-1, 1]) man([GATE.x - 3, s * 3.6], 0, s > 0 ? Math.PI : 0, { dress: 'tunic', legs: 'hose', cloth: 'cloth_brown', cloth2: 'cloth_red', hat: 'cap', over: 'belt', carry: 'staff', pose: 'stand' });
    put({ t: 'animal', kind: 'dog', at: [GATE.x - 5, 3.9], y: 0, rot: 2, seed: 21 });
    for (let k = 0; k < 9; k++) put({ t: 'animal', kind: k % 3 === 0 ? 'goat' : 'sheep', at: [GATE.x + 8 + (k % 3) * 1.4 + rand(), -1.6 + Math.floor(k / 3) * 1.6 + rand() * 0.5], y: 0, rot: Math.PI + (rand() - 0.5), seed: 70 + k });
    man([GATE.x + 15, 0.8], 0, Math.PI, { carry: 'staff', dress: 'tunic', legs: 'hose', hat: 'straw', cloth: 'cloth_white' });
    // the fields east of the town: hay ricks at the field edges, a shaduf at a channel, farmers with hoes, an ox cart on the road
    for (const [x, z] of [[160, -34], [166, -30], [172, 40], [158, 46], [178, -12], [165, 22], [-10, 80], [10, 86], [36, 96]]) put({ t: 'haystack', kind: 'rick', at: [x, z], y: 0, rot: rand() * 6, seed: Math.round(x + z) });
    for (const [x, z] of [[163, -18], [172, 12], [156, 30]]) { put({ t: 'well', kind: 'shaduf', at: [x, z], y: 0, rot: Math.PI / 2, mat: 'banco' }); man([x + 1.4, z + 0.4], 0, 0, { dress: 'tunic', legs: 'hose', cloth: 'cloth_white', hat: 'straw', feet: 'bare', pose: 'stand' }); }
    for (let k = 0; k < 7; k++) { const x = 154 + rand() * 30, z = -40 + rand() * 90; if (Math.hypot(x, z) < RADIUS - 30) man([x, z], 0, rand() * 6.28, { dress: 'tunic', legs: 'hose', cloth: pickc(['cloth_white', 'cloth_grey', 'cloth_brown']), hat: 'straw', carry: 'hoe', arms: 'hoe', feet: 'bare', pose: 'stand' }); }
    put({ t: 'cart', at: [150, 14], y: 0, rot: 0.3, seed: 4, load: 'sacks' });
    // the stream: women washing on the stones, a ford of flat stones, a camel at the water
    const rx = (z) => riverX(z);
    for (const z of [-30, 22, 58]) { for (let j = 0; j < 2; j++) man([rx(z) + 2.5 + j * 0.8, z + j * 1.2], -0.1, -Math.PI / 2, { dress: 'tunic', cloth: pickc(['cloth_red', 'cloth_green', 'cloth_ochre']), hair: 'bun', hat: 'none', pose: 'cross' }); put({ t: 'laundry', at: [rx(z) + 4.2, z + 1.5], y: 0, rot: 0.4, len: 2.6, seed: z }); put({ t: 'basket', at: [rx(z) + 3.4, z - 0.8], y: 0, rot: 0.3, seed: z }); }
    put({ t: 'animal', kind: 'camel', at: [rx(-60) + 3.5, -60], y: 0, rot: -Math.PI / 2, seed: 5, gear: false, graze: true });
    put({ t: 'animal', kind: 'donkey', at: [rx(96) + 3.3, 96], y: 0, rot: -Math.PI / 2, seed: 15, gear: false, graze: true });
  }
  // ── the street at the arrival (x -34..14): a storyteller with his audience, a noodle seller's stove, tethered horses and a trough,
  // children at play, a fodder cart, a fortune-teller on his mat, drying trays of apricots at a door (all kept off the street's axis and the doors)
  {
    const put = (o) => L.push(o), pickc = (a) => a[Math.floor(rand() * a.length)], ONE = Math.PI;
    // the storyteller on a stool at the bridge approach, six listeners squatting and sitting round him, facing him
    man([-26, 3.6], 0, 0.5, { pose: 'stand', hat: 'cap', cloth: 'cloth_blue', carry: 'staff' }); put({ t: 'stool', at: [-26.9, 3.9], y: 0, rot: 0 });
    for (let k = 0; k < 6; k++) { const a = -0.3 + k * 0.62, x = -26 + Math.cos(a) * 2.2, z = 3.6 - Math.sin(a) * 2.2 * 0.8 - 0.5; if (Math.abs(z) > 4.6) continue; man([x, z], 0, face([x, z], [-26, 3.6]), { pose: k % 2 ? 'sit_ground' : 'cross', hat: k % 3 ? 'cap' : 'none', cloth: pickc(['cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_blue']) }); }
    // the noodle seller: a stove with a great pot, stools and a table, a customer eating, the seller ladling
    put({ t: 'tea_table', at: [-12, -3.9], y: 0, rot: 0.2 }); put({ t: 'pot', kind: 'vat', at: [-14.2, -4.3], y: 0, seed: 3 }); put({ t: 'firewood', at: [-15.4, -4.8], y: 0, rot: 0.1, len: 1.2, seed: 4 });
    man([-13.2, -3.3], 0, face([-13.2, -3.3], [-12, -3.9]), { pose: 'stand', hat: 'cap', cloth: 'cloth_white', over: 'apron' }); man([-11.2, -3.2], 0, face([-11.2, -3.2], [-12, -3.9]), { pose: 'sit_low', cloth: 'cloth_brown' });
    // horses tied at a rail before a shop, a trough, a boy with a bucket
    put({ t: 'trough', at: [-20, 4.5], y: 0, rot: 0, mat: 'banco' });
    for (const [x, r] of [[-22.2, 0.4], [-17.8, ONE - 0.3]]) put({ t: 'animal', kind: 'horse', at: [x, 3.9], y: 0, rot: r, seed: Math.round(x * 3), gear: true });
    man([-20, 3.2], 0, ONE, { dress: 'tunic', legs: 'hose', hat: 'none', cloth: 'cloth_white', carry: 'pails', feet: 'bare', child: true });
    // children playing in the dust near the lane mouth: a ring of four, two chasing
    for (let k = 0; k < 4; k++) { const a = k * 1.57, x = -5 + Math.cos(a) * 1.0, z = -2.8 + Math.sin(a) * 1.0; man([x, z], 0, a + 1.57, { dress: 'tunic', legs: 'hose', hat: 'none', cloth: pickc(['cloth_ochre', 'cloth_white', 'cloth_red']), child: true, feet: 'bare', pose: 'stand' }); }
    // a cart of fodder with its ox, unharnessed at the roadside, a carter asleep on the load's end
    put({ t: 'cart', beast: 'donkey', load: 'hay', at: [-30, -4.0], y: 0, rot: 0.1, seed: 7 });
    // a fortune-teller with his mat and a client; a seller of apricots and melons on a mat
    put({ t: 'goods_mat', at: [-1, 4.1], y: 0, rot: ONE, goods: ['melons', 'heap'], seed: 12 }); man([-1, 5.2], 0, 0, { pose: 'sit_ground', hat: 'straw', cloth: 'cloth_grey' }); man([-2.1, 3.0], 0, 3.6, { pose: 'stand', cloth: 'cloth_ochre', hair: 'bun' });
    for (const [x, z] of [[6, -5.2], [-8, 5.3], [-28, -5.2]]) put({ t: 'drying_tray', at: [x, z], y: 0, rot: 0.3, seed: Math.round(x) });
    // two guards of the town's ward walking with staves are the movers'; a dog and cat at the doors
    put({ t: 'animal', kind: 'dog', at: [4, 3.8], y: 0, rot: 2.4, seed: 31 }); put({ t: 'animal', kind: 'cat', at: [-9.5, 5.4], y: 0.0, rot: 0.8, seed: 32 });
  }
  void face; void CAVES; void FLOOR; void STREET; void riverX;
  return [base('dunhuang-town', 'dunhuang', E), base('dunhuang-people', 'life', L)];
}
