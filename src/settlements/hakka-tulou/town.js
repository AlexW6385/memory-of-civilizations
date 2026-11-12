// The village round the landmark (docs/settlements/hakka-tulou.md §2, §4.2, §5): neighbouring tulou, round and
// square, farm buildings, the stream with its slab bridges and cobbled banks, the road and the drying ground; and
// its people — farmers, women with the broad straw hat, children, elders at the hall — and animals.
import { RADIUS, NEIGHBOURS, FARMS, YARD, STREAM, streamZ, inStream, T, rng, polar, inFoot, hill, HOUSES, SHRINES, NORIA, WASH_STEPS, PLOTS, furnishRing } from './layout.js';
import { ground } from './ground.js';
import './../../styles/tulou/index.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 40], facing: 'n' } });
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));

export async function town() {
  const V = [], rand = rng(1709);
  // neighbouring tulou
  for (const n of NEIGHBOURS) {
    if (n.kind === 'square') V.push({ t: 'tulou_enclosure', c: n.c, half: n.half, floors: n.floors, rect: [n.c[0] - n.half, n.c[1] - n.half, n.c[0] + n.half, n.c[1] + n.half] });
    else {
      const k = n.floors, fl = Array.from({ length: k }, (_, q) => (q === 0 ? 0 : 3.4 * q)), wallIn = n.R - 1.4, front = wallIn - 3.4;
      V.push({ t: 'tulou_ring', rect: [n.c[0] - n.R, n.c[1] - n.R, n.c[0] + n.R, n.c[1] + n.R], c: n.c, R: n.R, n: n.R > 16 ? 48 : 36, floors: fl, wallIn, front, rail: front - 1.4, full: false, windows: true, gates: [n.gate === 'n' ? 270 : 90], windowsFrom: 2, rooms: true, stairs: true, bays: [0, 180], furnish: furnishRing(n.R > 16 ? 48 : 36, k, { gates: [n.gate === 'n' ? 270 : 90], bays: [0, 180] }) });
    }
  }
  for (const [x, z, w, d] of FARMS) V.push({ t: 'farmhouse', c: [x, z], w, d, rot: 0, front: 's', rect: [x - w / 2 - 0.9, z - d / 2 - 0.9, x + w / 2 + 0.9, z + d / 2 + 0.9] });
  // the stream: water, two slab bridges, the road and the drying ground
  V.push({ t: 'water_cells', rect: [-RADIUS + 12, 60, RADIUS - 12, 100], y: STREAM.water, cell: 1, inside: (x, z) => inStream(x, z, -0.3) });
  for (const x of [0, -66]) { const z = streamZ(x); V.push({ t: 'slab_bridge', a: [x, z - 5.2], b: [x, z + 5.2], y: 0.1, w: 1.9 }); }
  V.push({ t: 'floor', rect: [YARD[0], YARD[1], YARD[2], YARD[3]], y: 0.04, th: 0.1, mat: 'flagstone', walk: false });
  V.push({ t: 'track', rect: [-1.6, YARD[1] - 0.5, 1.6, streamZ(0) - 5.2], y: 0.05, mat: 'bluestone' });
  V.push({ t: 'track', rect: [-1.6, streamZ(0) + 5.2, 1.6, 150], y: 0.05, mat: 'bluestone' });
  V.push({ t: 'track', rect: [-1.6, -80, 1.6, -T.R - 0.3], y: 0.05, mat: 'bluestone' });
  // props of the drying ground: trays, a handcart, baskets, benches
  const P = [], F = [];
  for (let k = 0; k < 7; k++) {
    const x = YARD[0] + 3 + (k % 4) * 6.5 + rand() * 1.2, z = YARD[1] + 3 + Math.floor(k / 4) * 9 + rand() * 2;
    P.push({ t: 'drying_tray', at: [x, z], y: 0.05, rot: rand() * 6, seed: k });
  }
  P.push({ t: 'handcart', at: [-12, 52], y: 0.05, rot: 1.2, load: 'baskets' });
  P.push({ t: 'barrow', at: [11, 38], y: 0.05, rot: -0.5 });
  P.push({ t: 'haystack', kind: 'pole', at: [-30, 62], y: 0, seed: 3 }); P.push({ t: 'haystack', kind: 'pole', at: [31, 63], y: 0, seed: 5 });
  P.push({ t: 'bench', at: [12.5, 45], y: 0.05, rot: 1.57, len: 1.8 }); P.push({ t: 'bench', at: [-12.5, 40], y: 0.05, rot: 1.57, len: 1.8 });
  P.push({ t: 'chickens', n: 6, kind: 'hen', at: [-8, 38], y: 0.05, seed: 2 }); P.push({ t: 'chickens', n: 4, kind: 'hen', at: [8, 50], y: 0.05, seed: 4 });
  P.push({ t: 'laundry', at: [-10, 36.5], y: 0.05, rot: 0, len: 4, seed: 9 }); P.push({ t: 'laundry', at: [-26, 12], y: 0, rot: 1.57, len: 4, seed: 11 });
  // pigsties' beasts and the buffalo in the paddy
  for (const [x, z] of FARMS) F.push({ t: 'animal', kind: 'pig', at: [x + (rand() - 0.5) * 3, z + 3.6], y: 0, rot: rand() * 6, seed: Math.round(x) });
  for (const [x, z] of [[-30, 112], [40, 118], [-110, 20], [130, 95]]) F.push({ t: 'animal', kind: 'buffalo', at: [x, z], y: ground.height(x, z), rot: rand() * 6, seed: Math.round(x) });
  for (let k = 0; k < 6; k++) { const x = -60 + rand() * 120, z = 36 + rand() * 24; if (!inStream(x, z, 2)) F.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0.05, rot: rand() * 6, seed: k + 2 }); }

  // the hamlet: the rows of houses round the yard and along the road, the shrines, the noria, the washing steps, the gardens
  const rectOf = (h) => { const q = Math.abs(Math.sin(h.yaw)) > 0.5, a = (q ? h.d : h.w) / 2 + 1.5, b = (q ? h.w : h.d) / 2 + 1.5; return [h.c[0] - a, h.c[1] - b, h.c[0] + a, h.c[1] + b]; };
  for (const h of HOUSES) V.push({ t: 'hakka_house', c: h.c, yaw: h.yaw, w: h.w, d: h.d, seed: h.seed, rect: rectOf(h) });
  for (const [x, z, r] of SHRINES) V.push({ t: 'earth_shrine', at: [x, z], rot: r, y: ground.height(x, z), rect: [x - 2, z - 2, x + 2, z + 2] });
  { const zc = streamZ(NORIA.x); V.push({ t: 'noria', x: NORIA.x, zc, r: NORIA.r, axle: NORIA.axle, rect: [NORIA.x - 4, zc - 8, NORIA.x + 4, zc + 5] }); }
  for (const [x] of WASH_STEPS) { const z = streamZ(x); V.push({ t: 'wash_steps', x, z, rect: [x - 2, z - 5, x + 3, z - 2] }); }
  PLOTS.forEach((r, k) => V.push({ t: 'veg_plot', rect: r, seed: k + 2 }));
  // the lane's apron before each row: flagstones along the porches
  for (const h of HOUSES) { const e = Math.sin(h.yaw) > 0, q = Math.abs(Math.sin(h.yaw)) > 0.5, hh = (q ? h.w : h.d) / 2, fx = h.c[0] + (e ? 1 : -1) * (h.d / 2 + 1.3); V.push({ t: 'floor', rect: [Math.min(fx, fx + (e ? 1.8 : -1.8)), h.c[1] - hh, Math.max(fx, fx + (e ? 1.8 : -1.8)), h.c[1] + hh], y: 0.03, th: 0.08, mat: 'flagstone', walk: false }); }

  // people (docs §5): indigo and black jackets and trousers, the broad straw hat in the fields, bun and plait
  const L = [], skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const woman = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: ['cloth_indigo', 'cloth_black', 'cloth_blue', 'cloth_indigo'][Math.floor(rand() * 4)], cloth2: 'cloth_black', over: 'none', skin: skin(), hat: 'none', feet: 'shod', hair: 'bun', beard: false, ...o });
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: ['cloth_black', 'cloth_indigo', 'cloth_grey'][Math.floor(rand() * 3)], cloth2: 'cloth_black', over: 'none', skin: skin(), hat: 'none', feet: 'shod', hair: 'short', beard: false, ...o });
  // the lane of the court and the inner court
  for (let k = 0; k < 22; k++) {
    const a = rand() * 360, r = 19.5 + rand() * 3.6, at = polar(r, a), q = Math.abs(((a % 90) + 90) % 90 - 45);
    if (q > 40 || P.some((p) => p.at && Math.hypot(p.at[0] - at[0], p.at[1] - at[1]) < 1.2)) continue;
    const rr = rand(), rot = rand() * 6.28;
    if (rr < 0.3) woman(at, 0, rot, { carry: 'basket' });
    else if (rr < 0.5) woman(at, 0, rot, { child: true, h: 1.1 });
    else if (rr < 0.8) { man(at, 0, rot, { pose: 'talk' }); const b = [at[0] + Math.sin(rot) * -1.1, at[1] + Math.cos(rot) * -1.1]; woman(b, 0, face(b, at)); }
    else man(at, 0, rot, { hat: 'cap' });
  }
  // the elders at the hall, the children in the inner court
  man([-1.8, 3.4], 0.35, 0, { pose: 'sit_low', hat: 'cap', cloth: 'cloth_black' }); man([1.6, 2.8], 0.35, Math.PI, { cloth: 'cloth_black', hat: 'cap' });
  for (let k = 0; k < 5; k++) L.push({ t: 'figure', at: [-11 + rand() * 22, 7 + rand() * 3], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: 'cloth_red', cloth2: 'cloth_blue', over: 'none', skin: 'skin_medium', hat: 'none', hair: 'short', h: 0.62 + rand() * 0.12, feet: 'shod' });
  // the drying ground and the road
  for (let k = 0; k < 8; k++) { const x = YARD[0] + 2 + rand() * 24, z = YARD[1] + 2 + rand() * 20; if (Math.abs(x) < 2.6) continue; (k % 2 ? woman : man)([x, z], 0.05, rand() * 6.28, k % 3 === 0 ? { pose: 'squat', carry: 'none' } : { hat: 'straw' }); }
  // the paddy: farmers bent with the hoe, women in straw hats; tea pickers on the upper terraces
  for (let k = 0; k < 14; k++) {
    const x = -80 + rand() * 160, z = 90 + rand() * 40, y = ground.height(x, z);
    if (inStream(x, z, 3) || inFoot(x, z, 2)) continue;
    (k % 3 ? man : woman)([x, z], y, rand() * 6.28, { hat: 'straw', pose: 'squat', carry: 'hoe', cloth: 'cloth_indigo' });
  }
  for (let k = 0; k < 10; k++) {
    const x = -100 + rand() * 200, z = -152 + rand() * 26, y = ground.height(x, z);
    if (hill(x, z) < 6 || inFoot(x, z, 2)) continue;
    woman([x, z], y, rand() * 6.28, { hat: 'straw', carry: 'basket', cloth: 'cloth_indigo' });
  }
  // the hamlet's people: an elder or a woman on the porch bench, a child at the door, the offering at the shrine, washers on the steps
  const fo = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
  HOUSES.forEach((h, k) => {
    const sd = h.seed, hz = h.d / 2, cs = Math.cos(h.yaw), sn = Math.sin(h.yaw), W = (x, z) => [h.c[0] + x * cs + z * sn, h.c[1] - x * sn + z * cs], out = h.yaw + Math.PI;
    if ((sd >> 1) % 3 === 0 && sd % 2) (k % 2 ? woman : man)(W(-1.6, hz + 0.5), 0, out, { pose: 'sit', hat: k % 2 ? 'none' : 'cap', carry: 'none' });
    else if (k % 3 === 0) woman(W(1.8, hz + 1.7), 0, out + 0.6, { carry: 'basket' });
    if (k % 4 === 1) L.push({ t: 'figure', at: W(0.9, hz + 2.4), y: 0, rot: out + 0.3, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: 'cloth_red', cloth2: 'cloth_blue', over: 'none', skin: 'skin_medium', hat: 'none', hair: 'short', h: 0.6 + rand() * 0.1, feet: 'shod' });
    if (k % 5 === 2) man(W(-3.18, 2.4), 0, h.yaw + Math.PI / 2 * (Math.sin(h.yaw) > 0 ? 1 : -1), { pose: 'sit', hat: 'cap', cloth: 'cloth_black', carry: 'none' });
    if (k % 3 === 1) F.push({ t: 'animal', kind: k % 2 ? 'dog' : 'cat', at: W(-hx(h) + 0.7, hz + 0.9), y: 0, rot: rand() * 6, seed: k + 4 });
  });
  function hx(h) { return h.w / 2; }
  for (const [x, z, r] of SHRINES) { const at = [x + 1.5 * Math.sin(r), z + 1.5 * Math.cos(r)]; woman(at, ground.height(at[0], at[1]), fo(at, [x, z]), { pose: 'kneel', carry: 'none' }); }
  WASH_STEPS.forEach(([x], k) => { const sz = streamZ(x); for (let q = 0; q < 2; q++) woman([x - 0.35 + q * 0.7, sz - 3.2 + 0.15], -0.58, 0, { pose: 'squat', hat: q ? 'straw' : 'none', carry: 'none' }); P.push({ t: 'basket', at: [x + 1.3, sz - 3.7], y: -0.3, n: 2, seed: k + 20 }); });
  for (const x of [-44, 52]) { const z = streamZ(x) - 3.2; man([x, z], ground.height(x, z), Math.PI, { hat: 'straw', carry: 'rope', pose: 'stand' }); }
  // ducks on the stream, a farmer with the buffalo by the road, a pedlar with his pole and baskets, children at the bridge
  for (const x of [-52, -24, 20, 36, 62]) F.push({ t: 'chickens', kind: 'duck', n: 4 + Math.floor(rand() * 3), at: [x, streamZ(x) + (rand() - 0.5) * 2], y: STREAM.water - 0.02, rot: rand() * 6.28, seed: Math.round(x) + 90 });
  man([2.4, 66], 0, Math.PI, { hat: 'straw', carry: 'pole', cloth: 'cloth_indigo' }); woman([-2.2, 74.6], 0, 0.4, { carry: 'basket' });
  for (let k = 0; k < 3; k++) L.push({ t: 'figure', at: [3.2 + k * 0.7, 76.5 + (k % 2)], y: 0, rot: 3.3 + k, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: ['cloth_red', 'cloth_blue', 'cloth_white'][k], cloth2: 'cloth_indigo', over: 'none', skin: 'skin_medium', hat: 'none', hair: 'short', h: 0.62 + k * 0.04, feet: 'shod' });
  // the courts of the neighbouring tulou: trays, washing, hens, a well, the people of the house
  NEIGHBOURS.forEach((n, q) => {
    const S = n.kind === 'square' ? n.half - 8 : n.R - 6, cc = n.c, rr = rng(300 + q);
    P.push({ t: 'well', kind: 'windlass', mat: 'bluestone', at: [cc[0] + S * 0.5, cc[1] - S * 0.2], y: 0, rot: 0.5 });
    for (let k = 0; k < 5; k++) { const a = rr() * 6.28, d = S * (0.35 + rr() * 0.6), at = [cc[0] + Math.cos(a) * d, cc[1] + Math.sin(a) * d]; if (Math.abs(at[0] - cc[0]) < 1.6 && at[1] > cc[1]) continue; const t = k % 4; P.push(t === 0 ? { t: 'drying_tray', at, y: 0.03, rot: rr() * 3, seed: q * 7 + k } : t === 1 ? { t: 'chickens', n: 4, kind: 'hen', at, y: 0.03, seed: q + k } : t === 2 ? { t: 'laundry', at, y: 0.03, rot: rr() * 3, len: 3.2, seed: q * 5 + k } : { t: 'basket', n: 2, at, y: 0.03, seed: q + k }); }
    for (let k = 0; k < (n.kind === 'square' ? 7 : 5); k++) { const a = rr() * 6.28, d = S * (0.2 + rr() * 0.7), at = [cc[0] + Math.cos(a) * d, cc[1] + Math.sin(a) * d]; if (Math.abs(at[0] - cc[0]) < 1.6 && at[1] > cc[1]) continue; (k % 2 ? woman : man)(at, 0.03, rr() * 6.28, k % 3 === 0 ? { carry: 'basket' } : k % 3 === 1 ? { pose: 'talk' } : {}); }
  });
  // a wayside rest pavilion by the bridge's near end, with its bench
  V.push({ t: 'ming_pavilion', c: [9.6, 75.4], shape: 'rect', w: 4.4, d: 3.4, y: 0.05, H: 3.1, bench: true, rect: [7, 73.2, 12.4, 77.8] });
  // ── the lane and the drying ground at the arrival: a roadside tea stand with its drinkers, firewood and a straw stack by the lane's end,
  // a buffalo with a herd boy, ploughing in the paddy, sacks of rice and mats of dried vegetables on the yard, an old man mending a basket
  {
    P.push({ t: 'stall', at: [7.8, 69.2], y: 0.05, rot: Math.PI / 2, seed: 61, w: 2.6, d: 1.3, awning: 'cloth_indigo', stripe: null, goods: ['pot:dark_pot', 'basket'] });
    P.push({ t: 'tea_table', at: [5.6, 68.0], y: 0.05, rot: 0.3 }, { t: 'bench', at: [7.2, 66.2], y: 0.05, rot: 1.57, len: 1.6 });
    man([7.8, 70.6], 0.05, Math.PI / 2, { pose: 'stand', hat: 'straw', cloth: 'cloth_indigo' });
    man([5.2, 66.9], 0.05, face([5.2, 66.9], [5.6, 68]), { pose: 'sit_low', hat: 'cap', cloth: 'cloth_black' }); woman([6.2, 69.2], 0.05, face([6.2, 69.2], [5.6, 68]), { pose: 'sit_low', carry: 'none' });
    P.push({ t: 'firewood', at: [-7.4, 66.4], y: 0.05, rot: 1.57, len: 1.8, seed: 8 }, { t: 'haystack', kind: 'pole', at: [-9.6, 69.5], y: 0.05, seed: 9 }, { t: 'sacks', at: [8.6, 60.2], y: 0.05, rot: 0.4, n: 4, seed: 12 });
    F.push({ t: 'animal', kind: 'buffalo', at: [-9.2, 63.4], y: 0.05, rot: 1.9, seed: 71, graze: true });
    L.push({ t: 'figure', at: [-7.8, 62.4], y: 0.05, rot: 1.2, seed: 7101, dress: 'trousers', cloth: 'cloth_red', cloth2: 'cloth_indigo', over: 'none', skin: 'skin_medium', hat: 'straw', hair: 'short', child: true, carry: 'staff', feet: 'bare' });
    for (const [x, z, r] of [[-26, 101, 1.2], [30, 108, -1.8], [-2, 103, 0.4]]) {
      F.push({ t: 'animal', kind: 'buffalo', at: [x, z], y: ground.height(x, z), rot: r, seed: Math.round(x) + 72, gear: true });
      man([x - Math.sin(r) * 2.8, z - Math.cos(r) * 2.8], ground.height(x, z), r, { pose: 'stand', hat: 'straw', carry: 'rope', cloth: 'cloth_indigo' });
    }
    for (let k = 0; k < 4; k++) P.push({ t: 'goods_mat', at: [YARD[0] + 4 + k * 6.4, YARD[3] - 2.2], y: 0.05, rot: Math.PI, goods: ['heap', 'baskets'], produce: ['cloth_ochre', 'cloth_red'], seed: k + 30 });
    P.push({ t: 'sacks', at: [-12.6, 47.6], y: 0.05, rot: 0.3, n: 5, seed: 33 }, { t: 'sacks', at: [12.6, 52.4], y: 0.05, rot: 2.2, n: 4, seed: 34 }, { t: 'barrel', at: [13, 40.5], y: 0.05, seed: 35, n: 2 });
    man([-13, 43.6], 0.05, 0.4, { pose: 'sit_low', hat: 'straw', cloth: 'cloth_grey', carry: 'none' }); P.push({ t: 'basket', at: [-12.1, 43.0], y: 0.05, n: 2, seed: 36 });
    woman([12.4, 46.4], 0.05, 3.6, { pose: 'talk' }); woman([11.5, 47.0], 0.05, 0.4, { pose: 'talk', carry: 'basket' });
  }
  // the apron round the landmark's foot: women at the wall's foot washing and sorting, the pigs' swill, the old men in the shade
  for (let k = 0; k < 16; k++) { const a = k * 22.5 + rand() * 10, at = polar(T.R + 1.3 + rand() * 1.0, a); if (a % 360 > 70 && a % 360 < 110) continue; (k % 3 ? woman : man)(at, 0, (a + 180) * Math.PI / 180 + rand(), k % 4 === 0 ? { pose: 'squat', carry: 'none' } : { carry: k % 4 === 1 ? 'basket' : 'none' }); }
  return [base('hakka-village', 'tulou', V), base('hakka-props', 'life', [...P, ...F, ...L])];
}
