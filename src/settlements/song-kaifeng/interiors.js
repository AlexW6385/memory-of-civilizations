// Bianjing's interiors, furnished with the things of the period (dossier §11, "Interiors"): the shop
// with its counter and shelves of the trade's goods, the tea house, the tavern (wine shop) with its
// counter of jars and tables, the inn with its beds and long table, the house with its main room
// (table, chairs, hanging scroll, bed) and its kitchen. Built in the lot's own frame (a across the
// front, b inward from the front line, y up from the floor), turned into place once, so a changed
// lot is furnished anew. The floor is the house builder's own.
//
// Wiring (town.js): `import { interiorElements, interiorLife, interiorRooms } from './interiors.js'`, then
//   plans.push(base('song-kaifeng-interiors', interiorElements()));              // style song
//   plans.push(base('song-kaifeng-interior-life', interiorLife(), 'life'));      // people at the tables and counters
// and interiorRooms() ({ id, rect, y, kind }) for a plan's `rooms` (music zones tea/tavern/inn/shop/house).
import { STYLES } from '../../core/build.js';
import '../../styles/song/index.js';
import '../../objects/index.js';
import { lots, BRIDGE } from './layout.js';
import { tradeOf, wineShops, teaHouses } from './trades.js';
import { doorOf } from './houses.js';
import { shopElements } from './shops.js';
import { Parts, box, lathe, rod, ly, drum, bowl, jar, limb, rng, table, bench, stool, chair, couch, bed, chest, shelves, screen, brazier, teaSet, hanging, lantern, lampStand, plumVase, crockery, WD, LQ, DK } from './props.js';

const FLOOR = 0.28;                                   // the floor of houses.js's shops and houses: the plinth's top, P0 (0.14 for thatch and farms)
const FRONT = { s: { o: (r) => [(r[0] + r[2]) / 2, r[3]], v: [0, -1] }, n: { o: (r) => [(r[0] + r[2]) / 2, r[1]], v: [0, 1] }, e: { o: (r) => [r[2], (r[1] + r[3]) / 2], v: [-1, 0] }, w: { o: (r) => [r[0], (r[1] + r[3]) / 2], v: [1, 0] } };

/** goods on a shelf row by trade (y: the shelf's top): jars, bowls, bolts, volumes, boxes... in the shelf's own frame (a along it, b across). */
function stock(S, trade, a0, a1, y, b, rand, step = 0.46) {
  const mk = (kind, x) => {
    const Q = new Parts();
    if (kind === 'jar') { Q.add('pottery_dark', jar(0.1, 0.22, 0, 0, 0)); }
    else if (kind === 'wine') { Q.add('pottery_dark', jar(0.13, 0.3, 0, 0, 0)); Q.add('cloth_red', ly([[0.08, 0.28], [0.09, 0.32], [0.04, 0.38], [0.001, 0.39]], 10)); }
    else if (kind === 'bowls') for (let k = 0; k < 3; k++) Q.add(trade === 'pottery' ? 'glaze_blue' : 'glaze_white', bowl(0, k * 0.05, 0, 1));
    else if (kind === 'bolt') { Q.add(['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_grey'][Math.floor(rand() * 6)], drum(0.07, 0.07, 0.34, 8, 0, 0, 0).rotateX(Math.PI / 2).translate(0, 0.07, 0)); }
    else if (kind === 'books') { for (let k = 0; k < 3; k++) Q.add(k % 2 ? 'cloth_indigo' : 'paint_white', box(-0.14, k * 0.05, -0.1, 0.14, k * 0.05 + 0.046, 0.1)); }
    else if (kind === 'box') { Q.add('lacquer_red', box(-0.14, 0, -0.1, 0.14, 0.14, 0.1)); Q.add('lacquer_black', box(-0.15, 0.14, -0.11, 0.15, 0.17, 0.11)); }
    else if (kind === 'packet') { for (let k = 0; k < 3; k++) Q.add('cloth_white', box(-0.1 + k * 0.07, 0, -0.07, -0.04 + k * 0.07, 0.1 + k * 0.02, 0.07)); Q.add('cloth_red', box(-0.1, 0.1, -0.01, 0.04, 0.11, 0.01)); }
    else if (kind === 'tea') { Q.add('glaze_white', jar(0.08, 0.22, 0, 0, 0)); }
    else if (kind === 'pan') { Q.add('iron', ly([[0.001, 0], [0.04, 0], [0.12, 0.06], [0.15, 0.1], [0.13, 0.1], [0.001, 0.03]], 10)); }
    else if (kind === 'bridle') { Q.add('hide_brown', rod([0, 0.3, 0], [0, 0.05, 0.03], 0.012, 4)); Q.add('iron', box(-0.05, 0.0, 0, 0.05, 0.05, 0.02)); }
    Q.emit(S, x, y, b);
  };
  const kinds = { wine: ['wine', 'wine', 'bowls'], tea: ['tea', 'tea', 'bowls'], rice: ['jar', 'jar', 'packet'], medicine: ['jar', 'packet', 'jar', 'packet'], cloth: ['bolt', 'bolt', 'bolt'], books: ['books', 'books', 'box'], lacquer: ['box', 'bowls', 'box'], pottery: ['jar', 'bowls', 'jar'], iron: ['pan', 'pan', 'box'], food: ['jar', 'bowls'], incense: ['packet', 'box', 'packet'], saddlery: ['bridle', 'bridle', 'box'], butcher: ['pan', 'jar'], inn: ['jar', 'bowls'] }[trade] || ['jar', 'bowls', 'box'];
  for (let a = a0 + 0.2; a < a1 - 0.15; a += step) mk(kinds[Math.floor(rand() * kinds.length)], a);
}

/** One interior element { t: 'kf_interior', rect, front, y, kind, trade, seed }: the furniture of a room of the lot. */
function interior(el, { bag, col }) {
  const rect = el.rect, f = el.front, F = FRONT[f], o = F.o(rect), v = F.v, rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const along = f === 'n' || f === 's', W = along ? rect[2] - rect[0] : rect[3] - rect[1], D = along ? rect[3] - rect[1] : rect[2] - rect[0];
  const y = el.y ?? FLOOR, kind = el.kind, trade = el.trade || 'cloth', lite = !!el.lite;      // lite: the far rooms (vertex budget) have half the goods and the small furniture left out
  const yaw = Math.atan2(v[0], v[1]), cs = Math.cos(yaw), sn = Math.sin(yaw);
  const WC = (a, b) => [o[0] + a * cs + b * sn, o[1] - a * sn + b * cs];
  const blk = (a0, b0, a1, b1, h) => { const p = WC(a0, b0), q = WC(a1, b1); col?.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  const S = new Parts(), put = (build, a, b, yw = 0, up = 0, ...args) => { const Q = new Parts(); build(Q, ...args); Q.emit(S, a, up, b, yw); };
  const hx = W / 2 - 0.5, b0 = 1.45, b1 = D - 0.3, ceil = el.ceil ?? 2.7;     // the room's inner limits in the house's own frame: the side walls are 0.3 thick, the back wall's face at D − 0.3, the open front's counters (houses.js) fill 0.8–1.3 in; ceil: the floor beams' underside above the floor
  const back = b1, doorA = (rand() - 0.5) * 1.2;
  const wallScroll = (a, up, w, h, seed) => put((Q) => hanging(Q, w, h, seed), a, b1 + 0.2, Math.PI, up);   // on the back wall, facing the front (−z)
  const sit = (a, b, yw) => put(stool, a, b, yw, 0, rand() < 0.5 ? WD : LQ, rand() < 0.3);

  if (kind === 'shop') {
    // (the counters of the open front and the goods on them are houses.js's; here the shelves along the back wall, stocked by trade, a chest, a stool, a lamp)
    for (let r = 0; r < 2; r++) { const w = Math.min(2.2, W - 1.0), a = (r ? -1 : 1) * (w / 2 + 0.1) * 0 + (r ? -hx + w / 2 : hx - w / 2); if (W < 5 && r) break; put((Q) => { const ys = shelves(Q, w, 0.4, 2.0); const st = lite ? 0.8 : 0.46; stock(Q, trade, -w / 2, w / 2, 0, 0, rand, st); for (const yy of ys.slice(1, lite ? 4 : 9)) stock(Q, trade, -w / 2, w / 2, yy, 0, rand, st); }, a, b1 - 0.22, Math.PI); blk(a - w / 2, b1 - 0.45, a + w / 2, b1, 2.0); }
    put(chest, -hx + 0.55, b0 + 2.2, 0.4, 0, 0.8, 0.45, 0.45); blk(-hx + 0.1, b0 + 1.95, -hx + 1.0, b0 + 2.45, 0.45);
    put(stool, hx - 0.6, b0 + 1.2, rand() * 6, 0, WD, false);
    put(lantern, -hx + 0.7, b0 + 1.5, 0, ceil - 0.5, 'lamp_paper', 0.45);
    wallScroll(0, 1.35, 0.55, 1.1, el.seed);
  } else if (kind === 'tea') {
    // tables with benches (two to four), the tea man's counter with brazier and kettle at the back, scrolls and a plum vase on the back wall, a flower rack by the door
    const n = W > 7 ? 4 : 2, cols = n > 2 ? 2 : 1, rows = Math.max(1, Math.round(n / cols));
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const a = (cols === 1 ? 0 : (i ? 1 : -1) * W * 0.22) + 0.0, b = b0 + 1.4 + j * 2.2; put(table, a, b, 0, 0, 1.1, 0.7, 0.76, LQ); blk(a - 0.55, b - 0.35, a + 0.55, b + 0.35, 0.8); put(teaSet, a, b, rand() * 0.6, 0.76, el.seed + i * 5 + j); for (const s of [-1, 1]) { put(bench, a, b + s * 0.62, 0, 0, 1.2); } }
    put((Q) => { Q.add(LQ, box(-1.2, 0, -0.3, 1.2, 0.95, 0.3)); Q.add(DK, box(-1.25, 0.95, -0.35, 1.25, 1.0, 0.35)); }, hx - 1.2, b1 - 0.35); blk(hx - 2.4, b1 - 0.65, hx, b1 - 0.05, 1.0);
    put(brazier, hx - 1.9, b1 - 0.35, 0, 1.0); for (let k = 0; k < 6; k++) put((Q) => Q.add('glaze_white', bowl(0, 0, 0, 1)), hx - 0.9 + (k % 3) * 0.14, b1 - 0.35 + (k < 3 ? -0.08 : 0.08), 0, 1.0);
    for (const [a, s] of [[-W * 0.28, el.seed], [0, el.seed + 1], [W * 0.28, el.seed + 2]]) wallScroll(a, 1.3, 0.6, 1.3, s);
    put(plumVase, -W * 0.14, b1 - 0.4, 0, 0.0); put(table, -W * 0.14, b1 - 0.4, 0, 0, 0.9, 0.4, 0.8, LQ);
    // the flower rack: three tiers of potted pines by the door
    put((Q) => { for (let t = 0; t < 3; t++) { Q.add(WD, box(-0.45 + t * 0.12, t * 0.35 + 0.3, -0.18, 0.45 - t * 0.12 + 0.0, t * 0.35 + 0.34, 0.18)); } for (const s of [-1, 1]) Q.add(WD, box(s * 0.45 - 0.02, 0, -0.18, s * 0.45 + 0.02, 1.0, 0.18)); for (let t = 0; t < 3; t++) for (const s of [-0.25, 0.25]) { Q.add('glaze_blue', drum(0.07, 0.05, 0.08, 8, s * (1 - t * 0.2), t * 0.35 + 0.34, 0)); Q.add('palm_leaf', lathe([[0.001, 0], [0.09, 0.05], [0.05, 0.16], [0.001, 0.22]], 7, null, s * (1 - t * 0.2), t * 0.35 + 0.42, 0)); } }, -hx + 0.5, b0 + 0.5, 0.0);
    put(lantern, 0, b0 + 1.6, 0, ceil - 0.5, 'lamp_paper', 0.45);
  } else if (kind === 'tavern') {
    // the counter with the wine jars and the dippers at the back, tables with stools (four or six), a screen between the front and the back, red lanterns
    put((Q) => { Q.add(LQ, box(-1.6, 0, -0.3, 1.6, 0.95, 0.3)); Q.add(DK, box(-1.66, 0.95, -0.36, 1.66, 1.0, 0.36)); }, 0, b1 - 0.35); blk(-1.6, b1 - 0.65, 1.6, b1 - 0.05, 1.0);
    for (const [a, r, h] of [[-1.2, 0.17, 0.4], [-0.55, 0.19, 0.44], [0.1, 0.16, 0.38], [0.8, 0.18, 0.42], [1.3, 0.14, 0.34]]) put((Q) => { Q.add('pottery_dark', jar(r, h, 0, 0, 0)); Q.add('cloth_red', ly([[r * 0.62, h - 0.02], [r * 0.7, h + 0.03], [r * 0.3, h + 0.1], [0.001, h + 0.11]], 12)); }, a, b1 - 0.35, 0, 1.0);
    for (let k = 0; k < 5; k++) put((Q) => Q.add('glaze_white', bowl(0, 0, 0, 0.7)), -0.2 + k * 0.1, b1 - 0.55, 0, 1.0);
    put((Q) => { shelves(Q, 3.0, 0.3, 2.0); for (let k = 0; k < 12; k++) Q.add('pottery_dark', jar(0.1, 0.24, -1.3 + k * 0.23, 0.43 + (k % 2) * 0.4, 0)); }, 0, b1 - 0.22, Math.PI);
    const ts = W > 7 ? [[-W * 0.25, b0 + 1.2], [W * 0.25, b0 + 1.2], [-W * 0.25, b0 + 3.4], [W * 0.25, b0 + 3.4]] : [[-W * 0.2, b0 + 1.3], [W * 0.2, b0 + 3.3]];
    for (const [a, b] of ts) { put(table, a, b, 0, 0, 1.0, 1.0, 0.76, LQ); blk(a - 0.5, b - 0.5, a + 0.5, b + 0.5, 0.8); for (const [dx, dz] of [[-0.72, 0], [0.72, 0], [0, -0.7], [0, 0.7]]) put(stool, a + dx, b + dz, 0, 0, WD, false); put((Q) => { Q.add('pottery_dark', ly([[0.001, 0], [0.05, 0], [0.07, 0.1], [0.04, 0.16], [0.001, 0.17]], 8, 0, 0, 0)); for (let k = 0; k < 3; k++) Q.add('glaze_white', bowl(0.12 - k * 0.12, 0, 0.1, 0.8)); }, a, b, 0, 0.76); }
    if (W > 6) put(screen, 0, b0 + 4.9 > b1 - 1.5 ? b1 - 1.6 : b0 + 4.9, 0, 0, 2.2, 1.6);
    for (const [a, b] of [[-W * 0.22, b0 + 0.9], [W * 0.22, b0 + 2.4], [0, b0 + 3.6]]) put(lantern, a, b, 0, ceil - 0.5, 'cloth_red', 0.5);
  } else if (kind === 'inn') {
    // the front hall: a long table with benches along it and the keeper's desk; behind it the bed-rooms' row of beds behind plank partitions, a lamp each, chests
    put(table, 0, b0 + 1.2, 0, 0, 2.6, 0.8, 0.76, LQ); blk(-1.3, b0 + 0.8, 1.3, b0 + 1.6, 0.8); for (const s of [-1, 1]) put(bench, 0, b0 + 1.2 + s * 0.7, 0, 0, 2.4);
    put((Q) => { Q.add(LQ, box(-0.6, 0, -0.25, 0.6, 0.9, 0.25)); Q.add(DK, box(-0.65, 0.9, -0.3, 0.65, 0.94, 0.3)); Q.add('paint_white', box(-0.2, 0.94, -0.1, 0.1, 0.96, 0.1)); Q.add('lacquer_black', box(0.2, 0.94, -0.03, 0.3, 0.99, 0.03)); }, -hx + 0.8, b0 + 0.3); blk(-hx + 0.2, b0 + 0.05, -hx + 1.4, b0 + 0.55, 0.95);
    const nb = Math.max(2, Math.min(4, Math.floor((W - 0.8) / 2.1)));
    for (let i = 0; i < nb; i++) { const a = -hx + 1.0 + i * ((hx * 2 - 2.0) / Math.max(1, nb - 1)) * (nb > 1 ? 1 : 0); const bb = b1 - 1.3; put(bed, a, bb, Math.PI, 0, 2.0, 1.1); blk(a - 1.0, bb - 0.55, a + 1.0, bb + 0.55, 0.5); put(chest, a + 0.2, bb - 0.95, 0, 0, 0.7, 0.4, 0.4); put(lampStand, a - 0.9, bb - 0.7, 0, 0, 1.2);
      if (i) put((Q) => { Q.add(WD, box(-0.03, 0, -0.6, 0.03, 2.1, 0.6)); }, a - 1.15, bb, 0, 0); }
    put(lantern, 0, b0 + 1.4, 0, 3.3, 'cloth_red', 0.5); put(lantern, 0, b0 + 3.4, 0, 3.3, 'lamp_paper', 0.5);
  } else {
    // the house: the main room's table between two chairs under a hanging scroll (the central bay's arrangement), a side table, a screen, a bed behind it, a chest, a lamp; the kitchen at the back right: stove with a pot, jars, a water vat, firewood
    const kb = Math.max(b1 - 2.6, b0 + 5.0);
    put(table, 0, kb - 2.4 > b0 + 2 ? b0 + 3.0 : b0 + 2.4, 0, 0, 1.4, 0.7, 0.8, LQ); const tb = kb - 2.4 > b0 + 2 ? b0 + 3.0 : b0 + 2.4; blk(-0.7, tb - 0.35, 0.7, tb + 0.35, 0.8);
    put(teaSet, 0, tb, 0.3, 0.8, el.seed); put(chair, -0.95, tb, Math.PI / 2, 0, LQ, true); put(chair, 0.95, tb, -Math.PI / 2, 0, LQ, true);
    put(table, 0, tb + 1.2 < b1 - 0.5 ? tb + 1.4 : tb + 1.0, 0, 0, 1.2, 0.4, 0.9, LQ);
    wallScroll(0, 1.2, 0.9, 1.6, el.seed + 3);
    if (!lite) put(plumVase, -0.55, tb + 1.4, 0, 0.9);
    if (W > 4.5) { put(bed, hx - 1.1, b1 - 1.6, Math.PI, 0, 2.0, 1.1); blk(hx - 2.1, b1 - 2.15, hx - 0.1, b1 - 1.05, 0.5); }
    put(chest, -hx + 0.5, b1 - 0.5, 0, 0, 0.9, 0.5, 0.5); put(lampStand, -hx + 0.3, tb, 0, 0, 1.3);
    if (!lite) put(screen, -hx + 1.8, b1 - 2.9, 0, 0, 2.0, 1.6);
    // the kitchen stove (zao): a brick block with two pot holes, an iron pot, a chimney; jars and a vat beside it, a stack of firewood
    const sa = -hx + 0.8;
    put((Q) => { Q.add('brick_grey', box(-0.5, 0, -0.35, 0.5, 0.75, 0.35)); Q.add('iron', ly([[0.001, 0.75], [0.2, 0.75], [0.28, 0.85], [0.24, 0.97], [0.001, 0.97]], 12, -0.2, 0, 0)); Q.add('wicker', drum(0.22, 0.2, 0.08, 10, 0.2, 0.75, 0)); Q.add('brick_grey', box(-0.15, 0.75, 0.2, 0.15, 2.8, 0.35)); Q.add('flame', box(-0.4, 0.2, -0.36, -0.2, 0.35, -0.35)); }, sa + (hx * 2 - 1.6) / 2, b1 - 0.4, Math.PI);
    blk(sa + (hx * 2 - 1.6) / 2 - 0.5, b1 - 0.75, sa + (hx * 2 - 1.6) / 2 + 0.5, b1 - 0.05, 0.8);
    put((Q) => { Q.add('pottery_dark', ly([[0.001, 0], [0.22, 0], [0.34, 0.3], [0.36, 0.6], [0.3, 0.8], [0.001, 0.85]], 14)); Q.add(DK, drum(0.3, 0.3, 0.03, 10, 0, 0.8, 0)); }, hx - 0.5, b1 - 0.55);
    put((Q) => { for (let k = 0; k < 10; k++) Q.add('bark_dark', drum(0.05, 0.05, 0.7, 6, -0.3 + (k % 5) * 0.12, Math.floor(k / 5) * 0.1, 0).rotateZ(0)); }, hx - 1.4, b1 - 0.3);
  }
  S.emit(bag, o[0], y, o[1], yaw);
}
STYLES.song.elements.kf_interior = interior;

// ── which lots are furnished ─────────────────────────────────────────────────────
// Only what can be seen is furnished: the shops, wine shops and tea shops show their rooms through the open front (houses.js); the
// tiled houses are closed and the inns' front range is solid, so those get their room (the music zone) and no furniture. The furniture
// stands in the building's footprint (lot.foot), on its floor (P0).
const KIND = { wine: 'tavern', tea: 'tea', inn: 'inn' };
let PICK = null;
/** Where the visitor arrives (src/planet/arrivals.js): the Iron Pagoda's enclosure. The rooms are furnished round it first, then round the bridge (the scroll's own scene). */
const ARRIVAL = [160, -140];
function picks() {
  if (PICK) return PICK;
  const L = lots(), out = [], mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
  const dB = (l) => { const [x, z] = mid(l); return Math.hypot(x - BRIDGE.at[0], z - BRIDGE.at[1]); };
  const dA = (l) => { const [x, z] = mid(l); return Math.hypot(x - ARRIVAL[0], z - ARRIVAL[1]); };
  const dist = (l) => Math.min(dA(l), dB(l) * 1.6);       // the arrival's lots count full; the bridge's are held to its nearest 55 m or so
  const skip = new Set(teaHouses());                      // the two tea houses by the bridge are the style's own tea_house (its room is its own)
  for (const l of L) {
    const t = tradeOf(l), w = l.foot[2] - l.foot[0], d = l.foot[3] - l.foot[1], dd = Math.min(w, d), big = Math.max(w, d);
    if (skip.has(l) || dd < 5 || big < 7 || l.zone !== 'city') continue;
    if (t === 'wine') { if (dist(l) < 82) out.push({ l, kind: 'tavern', trade: t, furnish: (l.kind === 'wine' || l.kind === 'shop') && l.bays > 1 }); }
    else if (t === 'inn') { if (dist(l) < 82) out.push({ l, kind: 'inn', trade: t, furnish: false }); }
    else if (t === 'tea' && dist(l) < 82) out.push({ l, kind: 'tea', trade: t, furnish: l.kind === 'shop' && l.bays > 1 });
    else if (t && l.kind === 'shop' && dist(l) < 82) out.push({ l, kind: 'shop', trade: t, furnish: l.bays > 1 });
    else if (!t && l.kind === 'house' && dist(l) < 82) out.push({ l, kind: 'house', trade: null, furnish: true });
  }
  // a door with a sign pole of a neighbour (or its own) in its way in is left shut
  const poles = shopElements().map((e) => { const c = Math.cos(e.rot), sn = Math.sin(e.rot); return [e.at[0] + e.poleX * c + e.poleZ * sn, e.at[1] - e.poleX * sn + e.poleZ * c]; });
  const OUT = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
  for (const p of out) {
    if (!p.furnish) continue;
    const d = doorOf(p.l), o = OUT[p.l.front], hwE = p.l.kind === 'house' ? 0.55 : 0.45;
    if (poles.some(([px, pz]) => { const dx = px - d.at[0], dz = pz - d.at[1], depth = dx * o[0] + dz * o[1], lat = -dx * o[1] + dz * o[0]; return depth > -0.5 && depth < 4 && Math.abs(lat) < hwE + 0.55; })) p.furnish = false;
  }
  return (PICK = out);
}
/** The lots whose back shelves the interiors replace (houses.js: el.furnished). */
export const furnishedLots = () => new Set(picks().filter((p) => p.furnish).map((p) => p.l));
const ceilOf = (l, kind) => (l.kind === 'wine' ? 3.2 : l.storeys === 2 ? 2.95 : 2.7);
/** The furniture elements (style song) of the furnished lots. */
export function interiorElements() {
  return picks().filter((p) => p.furnish).map(({ l, kind, trade }) => ({ t: 'kf_interior', rect: l.foot, front: l.front, y: FLOOR, kind, trade, seed: l.seed + 3, ceil: ceilOf(l, kind), lite: Math.min(Math.hypot((l.foot[0] + l.foot[2]) / 2 - BRIDGE.at[0], (l.foot[1] + l.foot[3]) / 2 - BRIDGE.at[1]), Math.hypot((l.foot[0] + l.foot[2]) / 2 - ARRIVAL[0], (l.foot[1] + l.foot[3]) / 2 - ARRIVAL[1]) * 1.4) > 85 }));
}
/**
 * The rooms (music and acoustics: kinds shop, tea, tavern, inn, house) of the lots of picks(): { id, rect, y, kind }. The buildings
 * are closed to the visitor (the open fronts are looked into, not walked into: their counters and walls are solid), so each room is the
 * footprint with the street's apron before its front (2.5 m; 1.5 m for a house's door): standing at a shop front one hears its zone.
 */
export function interiorRooms() {
  return picks().map(({ l, kind }, i) => {
    const [x0, z0, x1, z1] = l.foot, e = kind === 'house' ? 1.5 : 2.5, f = l.front;
    const rect = f === 's' ? [x0, z0, x1, z1 + e] : f === 'n' ? [x0, z0 - e, x1, z1] : f === 'e' ? [x0, z0, x1 + e, z1] : [x0 - e, z0, x1, z1];
    return { id: `kf-${kind}-${i}`, rect, y: FLOOR, kind };
  });
}
/** The people of the interiors (style life): the keeper at his counter, the customers on the benches and stools, the host at the stove. */
export function interiorLife() {
  const out = [], rand = rng(1128), CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_green', 'cloth_ochre'], pk = (a) => a[Math.floor(rand() * a.length)];
  for (const { l, kind, furnish } of picks()) {
    if (!furnish) continue;
    const f = l.front, F = FRONT[f], o = F.o(l.foot), v = F.v, along = f === 'n' || f === 's', W = along ? l.foot[2] - l.foot[0] : l.foot[3] - l.foot[1], D = along ? l.foot[3] - l.foot[1] : l.foot[2] - l.foot[0];
    const yaw = Math.atan2(v[0], v[1]), cs = Math.cos(yaw), sn = Math.sin(yaw), WC = (a, b) => [o[0] + a * cs + b * sn, o[1] - a * sn + b * cs];
    // (the figure's front is −z: it faces the front for rot = yaw + π... faceTo as the town's: a figure faces +b (inward) when rot = atan2(−v)...)
    const face = (dx, dz) => Math.atan2(-dx, -dz), toward = (a0, b0, a1, b1) => { const p = WC(a0, b0), q = WC(a1, b1); return face(q[0] - p[0], q[1] - p[1]); };
    const person = (a, b, tx, tb, o2 = {}) => out.push({ t: 'figure', at: WC(a, b), y: FLOOR, rot: toward(a, b, tx, tb), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pk(CL), cloth2: pk(CL), skin: rand() < 0.75 ? 'skin_light' : 'skin_medium', hat: pk(['cap', 'cap', 'none']), hatMat: 'cloth_black', hair: 'topknot', carry: 'none', ...o2 });
    const hx = W / 2 - 0.5, b0 = 1.45, b1 = D - 0.3;
    if (kind === 'shop') person(W * 0.28, b0 + 0.1, W * 0.28, -5, { cloth: 'cloth_brown', cloth2: 'cloth_white' });          // the keeper behind the counter, facing out
    else if (kind === 'tea') { for (const a of W > 7 ? [-W * 0.22, W * 0.22] : [0]) { const b = b0 + 1.4; person(a, b + 0.62, a, b, { pose: 'sit' }); if (rand() < 0.7) person(a, b - 0.62, a, b, { pose: 'sit' }); } person(hx - 1.2, b1 - 0.95, hx - 1.2, 0, { cloth: 'cloth_white', cloth2: 'cloth_black' }); }
    else if (kind === 'tavern') { const ts = W > 7 ? [[-W * 0.25, b0 + 1.2], [W * 0.25, b0 + 1.2], [-W * 0.25, b0 + 3.4], [W * 0.25, b0 + 3.4]] : [[-W * 0.2, b0 + 1.3], [W * 0.2, b0 + 3.3]]; for (const [a, b] of ts) { if (rand() < 0.75) person(a - 0.72, b, a, b, { pose: 'sit' }); if (rand() < 0.75) person(a + 0.72, b, a, b, { pose: 'sit' }); } person(0, b1 - 1.0, 0, 0, { cloth: 'cloth_white', cloth2: 'cloth_indigo' }); }
    else if (kind === 'inn') { person(-hx + 0.8, b0 + 0.65, 0, 8, { cloth: 'cloth_green', cloth2: 'cloth_white' }); if (rand() < 0.7) person(0, b0 + 1.9, 0, b0 + 1.2, { pose: 'sit' }); if (rand() < 0.5) person(0.8, b0 + 0.5, 0, b0 + 1.2, { pose: 'sit' }); }
    else if (kind === 'house' && rand() < 0.7) { const tb = b0 + 3.0; person(-0.95, tb, 0.95, tb, { pose: 'sit', cloth: 'cloth_grey' }); if (rand() < 0.6) person(0.95, tb, -0.95, tb, { pose: 'sit', dress: 'robe', hair: 'bun', hat: 'none', cloth: pk(['cloth_green', 'cloth_red', 'cloth_white']) }); }
  }
  return out;
}
void limb; void chair; void couch; void stock; void wineShops;
export { interior };
