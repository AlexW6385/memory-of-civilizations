// Muromachi Kyoto — the dressing of every front and the street life (docs/settlements/muromachi-kyoto.md §5, §7): lanterns and
// banners at the shops, the trade's goods out on the street (barrels of sake, pots, sacks, dye cloths, straw sandals), benches with
// old men, water jars, firewood, hens and dogs, the family at the counter and in the doma; at the stream the women washing and
// the punts. Elements of the shared `life` style, placed from layout.js; tiles of 100 m as at Suzhou so that the viewer draws
// them by distance.
import { lots, isOpen, yards, STREAM, BRIDGES, RADIUS, streets, inRect, onBridge, GINKAKU, RYOAN, SHRINE } from './layout.js';
import { dims } from '../../styles/muromachi/machiya.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TURN = { s: [1, 0, Math.PI], e: [0, 1, -Math.PI / 2], n: [-1, 0, 0], w: [0, -1, Math.PI / 2] };
/** The frame of a house: P(x, z) the world point of x across the front and z out into the street; rot the heading of one who faces the street. */
export const frame = (l) => { const [co, si, rot] = TURN[l.facing]; return { P: (x, z) => [l.at[0] + x * co + z * si, l.at[1] - x * si + z * co], rot }; };

const MEN = ['cloth_brown', 'cloth_grey', 'cloth_indigo', 'cloth_ochre', 'cloth_green'];
const WOMEN = ['cloth_indigo', 'cloth_maroon', 'cloth_ochre', 'cloth_green', 'cloth_grey'];
const BANNER = { sake: 'cloth_white', tea: 'cloth_red', food: 'cloth_red', dye: 'cloth_indigo', cloth: 'cloth_ochre', pottery: 'cloth_brown', rice: 'cloth_white', lacquer: 'cloth_red', paper: 'cloth_white', sandals: 'cloth_brown', doso: 'cloth_black', smith: 'cloth_grey', wood: 'cloth_brown' };

/** The people of the fronts: a man or a woman of the town, in the dress of the age (the topknot, the hair worn long, the straw hat). */
export function person(rand, at, y, rot, o = {}) {
  const woman = o.woman ?? rand() < 0.4, pick = (a) => a[Math.floor(rand() * a.length)];
  const e = { t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(woman ? WOMEN : MEN), cloth2: pick(['cloth_grey', 'cloth_brown', 'cloth_white']), skin: 'skin_light', hat: woman ? 'none' : pick(['none', 'none', 'straw', 'cap']), hair: woman ? 'long' : 'topknot', hairMat: 'hair_dark', over: 'sash', feet: o.pose === 'seiza' ? 'bare' : pick(['shod', 'bare']), ...o };
  delete e.woman;
  return e;
}

export function fronts() {
  const L = [];
  const rand = rng(1491), id = () => Math.floor(rand() * 1e9);
  for (const l of lots()) {
    const F = frame(l), R = rng(l.seed * 13 + 5), D = dims(l.seed), open = isOpen(l), hw = l.w / 2, tr = l.trade, y = 0, hook = D.two ? D.H - 0.37 : D.H - 0.44;
    const put = (e) => L.push({ y, seed: id(), ...e });
    const P = F.P, out = F.rot + Math.PI;
    // the lantern at the eave, the banner on its bracket at the corner post
    if (open || R() < 0.3) put({ t: 'hang_lantern', at: P(hw - 0.8, 0.95), y: hook, kind: tr === 'sake' || tr === 'food' || tr === 'tea' ? 'paper' : 'white', drop: 0.25 });
    if (open && R() < 0.55) put({ t: 'shop_sign', at: P(-hw + 0.02, 0.15), rot: out, h: D.two ? D.H - 0.5 : 2.75, cloth: BANNER[tr] || 'cloth_indigo', len: 1.2 + R() * 0.4, out: 0.95, letters: 2 + Math.floor(R() * 2) });
    // the trade's goods in front
    const gx = -hw + 0.9 + R() * Math.max(0.1, l.w - 3.2);
    if (open || R() < 0.4) {
      if (tr === 'sake') { put({ t: 'barrel', at: P(gx, 1.5), n: 2 + Math.floor(R() * 2), rot: F.rot }); }
      else if (tr === 'pottery') { put({ t: 'pot', at: P(gx, 1.55), kind: R() < 0.5 ? 'dark_pot' : 'glazed_jar', n: 3, rot: F.rot }); put({ t: 'pot', at: P(gx + 0.9, 1.45), kind: 'blue_jar', rot: F.rot }); }
      else if (tr === 'rice') { put({ t: 'sacks', at: P(gx, 1.5), n: 4 + Math.floor(R() * 3), rot: F.rot }); }
      else if (tr === 'tea' || tr === 'food') {
        put({ t: 'tea_table', at: P(gx, 2.1), rot: F.rot });
        if (R() < 0.75) L.push(person(rand, P(gx, 2.95), 0, F.rot + Math.PI, { pose: 'sit', woman: R() < 0.3 }));
        if (R() < 0.6) L.push(person(rand, P(gx, 1.25), 0, F.rot, { pose: 'sit', woman: R() < 0.3 }));
      }
      else if (tr === 'dye') { put({ t: 'laundry', at: P(gx + 0.3, 1.8), rot: l.facing === 's' || l.facing === 'n' ? 0 : Math.PI / 2, len: 3.0 }); }
      else if (tr === 'paper') { put({ t: 'drying_tray', at: P(gx, 1.7), rot: R() * 6 }); put({ t: 'drying_tray', at: P(gx + 1.0, 1.5), rot: R() * 6 }); }
      else if (tr === 'smith' || tr === 'wood') { put({ t: 'firewood', at: P(gx, 1.4), rot: F.rot, len: 1.6 }); put({ t: 'crates', at: P(gx + 1.5, 1.6), rot: F.rot, n: 2 }); }
      else if (tr === 'sandals') { put({ t: 'basket', at: P(gx, 1.5), n: 2 }); put({ t: 'stool', at: P(gx + 0.8, 1.6) }); }
      else if (tr === 'cloth') { put({ t: 'goods_mat', at: P(gx, 1.9), rot: F.rot, goods: 'cloth' }); }
      else if (tr === 'doso') { L.push(person(rand, P(hw - 1.0, 1.8), 0, F.rot, { woman: false, cloth: 'cloth_black', hat: 'cap', over: 'collar' })); }
    }
    // the common things: a water jar by the door, firewood against the wall, a bench with an old man, a basket
    if (R() < (open ? 0.4 : 0.45)) put({ t: 'pot', at: P(hw - 0.15, 1.15), kind: 'vat', rot: R() * 6 });
    if (R() < 0.2) put({ t: 'firewood', at: P(-hw + 1.0 + R() * 1.5, 1.25), rot: F.rot, len: 1.25 });
    if (R() < 0.2) { const bx = -hw + 1.4 + R() * (l.w - 3), c = P(bx, 1.35); put({ t: 'bench', at: c, rot: F.rot, len: 1.6 }); if (R() < 0.7) L.push(person(rand, P(bx - 0.3, 1.38), 0.0, F.rot, { pose: 'sit', woman: R() < 0.3, hat: R() < 0.4 ? 'straw' : 'none' })); }
    else if (R() < 0.12) put({ t: 'basket', at: P(-hw + 1 + R() * 2, 1.4), n: 2 });
    if (R() < 0.1) put({ t: 'chickens', at: P(-hw + 1 + R() * (l.w - 2), 2.4), rot: R() * 6, kind: 'hen' });
    else if (R() < 0.06) put({ t: 'animal', kind: 'dog', at: P(R() * hw, 2.2), rot: R() * 6, seed: id() });
    else if (R() < 0.05) put({ t: 'animal', kind: 'cat', at: P(hw - 0.4, 1.3), rot: R() * 6, seed: id() });
    // a woman sweeping, a child at play
    if (R() < 0.06) L.push(person(rand, P(-0.5 + R(), 2.3), 0, F.rot + 2.4, { woman: true, carry: 'broom' }));
    if (R() < 0.07) L.push(person(rand, P(R() * 2, 2.6), 0, rand() * 6, { woman: R() < 0.5, child: true, h: 1.0 + R() * 0.25, hat: 'none' }));
    // a second-storey pole: washing out of the loft window
    if (D.two && R() < 0.5) put({ t: 'laundry_pole', at: P(R() * hw * 0.8, 0.2), y: D.H + 0.55, rot: out, len: 1.6 });
  }
  return L;
}

/** The family and the craftsmen inside the open houses: the housewife at the range, customers at the counter, a child on the mats, the smith at his forge. */
export function inside() {
  const P = [], rand = rng(1507);
  for (const l of lots()) {
    if (!isOpen(l)) continue;
    const F = frame(l), R = rng(l.seed * 31 + 7), hw = l.w / 2, d = l.d, doma = 1.6, qm = Math.min(4.2, d * 0.4), fl = 0.45, tr = l.trade;
    if (d < 9) continue;
    // the housewife at the kamado in the doma, standing; the doma's floor is 0.03
    if (R() < 0.6) P.push(person(rand, F.P(hw - 0.8, -d + 1.9), 0.03, F.rot + Math.PI * 0 + Math.PI, { woman: true, carry: 'none' }));
    // a customer in the doma at the counter
    if (R() < 0.45) P.push(person(rand, F.P(hw - 0.8, -0.9), 0.03, F.rot, { woman: R() < 0.5, hat: 'straw' }));
    // a child on the mats at the back, or the old man by the hearth
    if (R() < 0.3) P.push(person(rand, F.P(-hw + 1.5, -d + 2.3), fl, R() * 6, { child: true, h: 0.95 + R() * 0.2, pose: 'sit_ground', hat: 'none' }));
    else if (R() < 0.3) P.push(person(rand, F.P(-hw + 2.3, -d + 1.0), fl, F.rot, { pose: 'seiza', woman: false, hat: 'none', hair: 'shaven' }));
    // the craftsman at his work
    if (tr === 'smith') P.push(person(rand, F.P(-0.2, -qm + 0.5), fl, F.rot + Math.PI, { woman: false, dress: 'wrap', hat: 'none', cloth: 'cloth_grey', feet: 'bare' }));
    if (tr === 'dye') P.push(person(rand, F.P(-hw + 1.4, -qm + 0.5), fl, F.rot, { woman: false, dress: 'wrap', cloth: 'cloth_indigo', feet: 'bare' }));
    if (tr === 'paper' || tr === 'sandals') P.push(person(rand, F.P(-hw + 1.2, -1.1), fl, F.rot + Math.PI, { pose: 'seiza', woman: R() < 0.5 }));
  }
  return P;
}

const STREAM_STEPS = [-210, -150, -85, -30, 40, 140, 205];
/** The stream: the women washing at the steps, punts moored to the bank, an angler on the bank, a man poling a punt. */
export function waterLife() {
  const L = [], rand = rng(1523), W = STREAM.level;
  for (const z of STREAM_STEPS) {
    if (Math.hypot(STREAM.x0, z) > RADIUS - 40) continue;
    const side = z % 2 === 0 ? 1 : -1;
    for (let k = 0; k < 2; k++) if (rand() < 0.85) L.push(person(rand, [STREAM.x0 + 1.0 + k * 0.65, z + 0.9 - k * 0.8], k ? -0.317 : -0.083, -Math.PI / 2, { pose: 'squat', woman: true, hat: 'none' }));
    L.push({ t: 'basket', at: [STREAM.x0 - 0.5, z + 0.3], y: 0.05, rot: rand() * 6, n: 2, seed: Math.floor(rand() * 1e9) });
    void side;
  }
  for (const z of [-232, -118, -62, 10, 62, 122, 168, 225]) {
    if (Math.hypot(100, z) > RADIUS - 36 || BRIDGES.some(([, bz]) => Math.abs(bz - z) < 9)) continue;
    L.push({ t: 'boat', kind: 'rowboat', at: [STREAM.x0 + 1.5 + rand() * 2, z], y: W - 0.05, rot: (rand() - 0.5) * 0.15, len: 4.2 + rand(), seed: Math.floor(rand() * 1e9) });
  }
  // the punter, standing at his pole in the boat; two anglers on the bank, the egret keeps the other side
  { const z = 62; L.push({ t: 'boat', kind: 'canoe', at: [99, z], y: W - 0.05, rot: 0.02, len: 5.4, seed: 3 }); L.push(person(rand, [99, z - 0.8], W + 0.08, 0, { pose: 'punt', woman: false, hat: 'straw', carry: 'punt' })); }
  for (const z of [-90, 150]) L.push(person(rand, [STREAM.x1 + 0.8, z], 0.05, -Math.PI / 2, { pose: 'sit_low', woman: false, hat: 'straw' }));
  return L;
}

/** Walkers at rest and groups in the streets: knots of men talking, a porter resting at his load, a pedlar with his stall. */
export function streetLife() {
  const L = [], rand = rng(1531), pick = (a) => a[Math.floor(rand() * a.length)];
  for (const r of streets()) {
    const horiz = r[2] - r[0] > r[3] - r[1], len = horiz ? r[2] - r[0] : r[3] - r[1];
    if (Math.min(r[2] - r[0], r[3] - r[1]) < 6) continue;
    for (let s0 = 6 + rand() * 6; s0 < len - 5; s0 += 8 + rand() * 12) {
      const a = (horiz ? r[0] : r[1]) + s0, cen = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2, off = (rand() - 0.5) * 2.6, p = horiz ? [a, cen + off] : [cen + off, a];
      if (Math.hypot(p[0], p[1]) > RADIUS - 30 || onBridge(p[0], p[1], 4) || (p[0] > STREAM.x0 - 3 && p[0] < STREAM.x1 + 3)) continue;
      const k = rand();
      if (k < 0.3) { const a0 = rand() * 6.28; for (let q = 0; q < 2; q++) { const aa = a0 + q * Math.PI, pp = [p[0] + Math.cos(aa) * 0.5, p[1] + Math.sin(aa) * 0.5]; L.push(person(rand, pp, 0, Math.atan2(pp[0] - p[0], pp[1] - p[1]) + Math.PI, { pose: q ? 'stand' : 'talk', woman: q === 1 && rand() < 0.5 })); } }
      else if (k < 0.42) { L.push({ t: 'handcart', at: p, y: 0, rot: horiz ? Math.PI / 2 : 0, load: pick(['sacks', 'baskets', 'crates']), seed: Math.floor(rand() * 1e9) }); L.push(person(rand, [p[0] + (horiz ? 0 : 1.2), p[1] + (horiz ? 1.2 : 0)], 0, rand() * 6, { pose: 'sit_ground', woman: false, dress: 'trousers', hat: 'straw', feet: 'bare' })); }
      else if (k < 0.52) { L.push({ t: 'stall', at: p, y: 0, rot: horiz ? 0 : Math.PI / 2, w: 2.2, d: 1.2, awning: pick(['cloth_indigo', 'cloth_white', 'cloth_red']), goods: pick([['basket'], ['produce'], ['cloth'], ['dark_pot', 'blue_jar']]), seed: Math.floor(rand() * 1e9) }); L.push(person(rand, [p[0] + (horiz ? 0 : -0.9), p[1] + (horiz ? -0.9 : 0)], 0, horiz ? Math.PI : -Math.PI / 2, { pose: 'stand', woman: rand() < 0.5, dress: 'wrap' })); }
      else if (k < 0.62) L.push({ t: 'animal', kind: 'dog', at: p, y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
      else if (k < 0.7) L.push({ t: 'chickens', at: p, y: 0, rot: rand() * 6.28, kind: 'hen', seed: Math.floor(rand() * 1e9) });
      else if (k < 0.78) { for (let q = 0; q < 3; q++) L.push(person(rand, [p[0] + (rand() - 0.5) * 2, p[1] + (rand() - 0.5) * 2], 0, rand() * 6.28, { child: true, h: 0.95 + rand() * 0.25, hat: 'none', woman: rand() < 0.5, pose: q ? 'stand' : 'squat' })); }
    }
  }
  return L;
}

/** The yards' life: the wash on its line with the woman at it, hens, a rick of straw, a child, a dog, a cat on the woodshed. */
export function yardLife() {
  const L = [], rand = rng(1541);
  for (const y of yards()) {
    const w = y[2] - y[0], d = y[3] - y[1];
    if (w < 24 || d < 24) continue;
    const c = (i, j) => [y[0] + w / 3 * (i + 0.5), y[1] + d / 3 * (j + 0.5)], sd = () => Math.floor(rand() * 1e9);
    { const [x, z] = c(1, 2); L.push({ t: 'laundry', at: [x, z], y: 0, rot: 0, len: 4, seed: sd() }); if (rand() < 0.7) L.push(person(rand, [x + 0.6, z + 1.4], 0, Math.PI, { woman: true, carry: 'basket', hat: 'none' })); }
    { const [x, z] = c(0, 1); L.push({ t: 'chickens', at: [x, z], y: 0, rot: rand() * 6, kind: 'hen', seed: sd() }); if (rand() < 0.5) L.push({ t: 'haystack', at: [x + 3, z + 2], y: 0, kind: 'rick', seed: sd() }); }
    if (rand() < 0.5) { const [x, z] = c(1, 1); L.push(person(rand, [x + 4, z + 4], 0, rand() * 6, { child: true, h: 1.0 + rand() * 0.2, woman: rand() < 0.5, hat: 'none' })); }
    if (rand() < 0.4) { const [x, z] = c(2, 2); L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6, seed: sd() }); }
    if (rand() < 0.5) { const [x, z] = c(1, 0); L.push({ t: 'animal', kind: 'cat', at: [x, z - 0.2], y: 0, rot: rand() * 6, seed: sd() }); }
  }
  return L;
}

/** The temples and the shrine: visitors on the south bank and in the court of Ginkaku-ji, a monk sweeping the gravel, a gardener at the pond with a boat; the worshippers at the shrine, the seated guests on the hōjō's veranda. */
export function templeLife() {
  const L = [], rand = rng(1553), P = GINKAKU.pond, k = GINKAKU.kannon;
  // the south bank of the pond, where the way arrives: three standing to look at the pavilion, a woman and a child, two sitting
  for (const [x, z, w] of [[186, 23, 0], [189.5, 23.6, 1], [211, 23, 0], [215, 23.4, 1], [220, 22.6, 0]]) L.push(person(rand, [x, z], 0, (rand() - 0.5) * 0.5, { woman: !!w || rand() < 0.3, pose: rand() < 0.2 ? 'talk' : 'stand' }));
  L.push(person(rand, [212.4, 24.2], 0, 0.1, { woman: false, child: true, h: 1.05, hat: 'none' }));
  for (const x of [181, 224]) L.push(person(rand, [x, 24.6], 0, 0.2, { pose: 'sit_ground', woman: x > 200, hat: 'none' }));
  // the court before the pavilion: visitors, a monk sweeping the gravel with a besom
  for (const [dx, dz] of [[-6, 10.5], [-2, 12], [4, 11], [9, 10.5]]) L.push(person(rand, [k[0] + dx, k[1] + dz], 0, rand() * 0.6 - 0.3, { woman: rand() < 0.4, pose: rand() < 0.25 ? 'talk' : 'stand' }));
  L.push(person(rand, [k[0] - 11, k[1] + 12.5], 0, 1.2, { cloth: 'cloth_black', cloth2: 'cloth_grey', hair: 'shaven', over: 'collar', hat: 'none', carry: 'broom', woman: false }));
  // the pond: a gardener in a punt, fishing nets spread on the bank
  L.push({ t: 'boat', kind: 'rowboat', at: [P.c[0] + 24, P.c[1] + 4], y: P.level - 0.05, rot: 1.2, len: 4.0, seed: 7 }); L.push(person(rand, [P.c[0] + 24.4, P.c[1] + 4.6], P.level + 0.1, 1.2 + Math.PI / 2, { pose: 'sit', woman: false, hat: 'straw', feet: 'bare' }));
  // the shrine: worshippers before the hall, a woman and child at the torii, a priest at the Noh stage's steps
  const h = SHRINE.hall;
  for (const [dx, dz, w] of [[-2.5, -6.5, 0], [0.3, -7.2, 1], [2.4, -6.4, 0]]) L.push(person(rand, [h[0] + dx, h[1] + dz], 0, Math.PI, { pose: 'stand', woman: !!w, hat: 'none' }));
  L.push(person(rand, [SHRINE.torii[0] + 1.2, SHRINE.torii[1] + 5], 0, Math.PI, { woman: true, hat: 'none' })); L.push(person(rand, [SHRINE.torii[0] + 1.9, SHRINE.torii[1] + 5.3], 0, Math.PI, { child: true, h: 1.0, hat: 'none' }));
  L.push(person(rand, [SHRINE.noh[0] - 6.5, SHRINE.noh[1] + 1], 0, -Math.PI / 2, { cloth: 'cloth_white', cloth2: 'cloth_red', hat: 'cap', over: 'collar', woman: false }));
  // Ryōan-ji: guests seated on the veranda before the garden, a lay woman and a boy at the gate
  const hj = RYOAN.hojo;
  for (const [dx, w] of [[5.4, 0], [8.4, 1], [10.8, 0]]) L.push(person(rand, [hj[0] + dx, hj[1] - 7.1], 0.85, 0, { pose: 'seiza', woman: !!w, hat: 'none' }));
  L.push(person(rand, [RYOAN.gate[0] + 2.5, RYOAN.gate[1] - 3], 0, 0.3, { woman: true, hat: 'none' })); L.push(person(rand, [RYOAN.gate[0] + 3.2, RYOAN.gate[1] - 3.2], 0, 0.2, { child: true, h: 1.1, hat: 'none' }));
  return L;
}

/** All of it in tiles of 100 m: [{ id, elements, center }]. */
export function lifeTiles() {
  const all = [...fronts(), ...inside(), ...waterLife(), ...streetLife(), ...yardLife(), ...templeLife()];
  const tiles = new Map();
  for (const e of all) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, elements]) => { const [i, j] = k.split(',').map(Number); return { id: `muromachi-life-${k}`, elements, center: [i * 100 + 50, j * 100 + 50] }; });
}
void yards; void inRect;
