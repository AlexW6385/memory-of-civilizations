// The village round the landmark (docs/settlements/hakka-tulou.md §2, §4.2, §5): neighbouring tulou, round and
// square, farm buildings, the stream with its slab bridges and cobbled banks, the road and the drying ground; and
// its people — farmers, women with the broad straw hat, children, elders at the hall — and animals.
import { RADIUS, NEIGHBOURS, FARMS, YARD, STREAM, streamZ, inStream, T, rng, polar, inFoot, hill } from './layout.js';
import { ground } from './ground.js';
import './../../styles/tulou/index.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 40], facing: 'n' } });
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));

export async function town() {
  const V = [], rand = rng(1709);
  // neighbouring tulou
  for (const n of NEIGHBOURS) {
    if (n.kind === 'square') V.push({ t: 'tulou_square', c: n.c, half: n.half, floors: n.floors });
    else {
      const k = n.floors, fl = Array.from({ length: k }, (_, q) => (q === 0 ? 0 : 3.4 * q)), wallIn = n.R - 1.4, front = wallIn - 3.4;
      V.push({ t: 'tulou_round', c: n.c, R: n.R, n: n.R > 16 ? 48 : 36, floors: fl, wallIn, front, rail: front - 1.4, full: false, windows: true, gates: [n.gate === 'n' ? 270 : 90], windowsFrom: 2 });
    }
  }
  for (const [x, z, w, d] of FARMS) V.push({ t: 'farmhouse', c: [x, z], w, d, rot: x > 0 ? 0 : 0 });
  // the stream: water, two slab bridges, the road and the drying ground
  V.push({ t: 'water_cells', rect: [-RADIUS + 12, 60, RADIUS - 12, 100], y: STREAM.water, cell: 1, inside: (x, z) => inStream(x, z, -0.3) });
  for (const x of [0, -66]) { const z = streamZ(x); V.push({ t: 'slab_bridge', a: [x, z - 5.2], b: [x, z + 5.2], y: 0.1, w: 1.9 }); }
  V.push({ t: 'floor', rect: [YARD[0], YARD[1], YARD[2], YARD[3]], y: 0.04, th: 0.1, mat: 'flagstone', walk: false });
  V.push({ t: 'floor', rect: [-1.5, YARD[3], 1.5, streamZ(0) - 5.2], y: 0.04, th: 0.1, mat: 'bluestone', walk: false });
  V.push({ t: 'floor', rect: [-1.5, streamZ(0) + 5.2, 1.5, 150], y: 0.04, th: 0.1, mat: 'bluestone', walk: false });
  V.push({ t: 'floor', rect: [-1.5, -80, 1.5, -T.R - 0.3], y: 0.04, th: 0.1, mat: 'bluestone', walk: false });
  // props of the drying ground: trays, a handcart, baskets, benches
  const P = [], F = [];
  for (let k = 0; k < 7; k++) {
    const x = YARD[0] + 2 + (k % 4) * 6.5 + rand() * 1.2, z = YARD[1] + 3 + Math.floor(k / 4) * 9 + rand() * 2;
    P.push({ t: 'drying_tray', at: [x, z], y: 0.05, rot: rand() * 6, seed: k });
  }
  P.push({ t: 'handcart', at: [-12, 52], y: 0.05, rot: 1.2, load: 'baskets' });
  P.push({ t: 'barrow', at: [11, 38], y: 0.05, rot: -0.5 });
  P.push({ t: 'haystack', kind: 'pole', at: [-24, 48], y: 0, seed: 3 }); P.push({ t: 'haystack', kind: 'pole', at: [32, 40], y: 0, seed: 5 });
  P.push({ t: 'bench', at: [12.5, 45], y: 0.05, rot: 1.57, len: 1.8 }); P.push({ t: 'bench', at: [-12.5, 40], y: 0.05, rot: 1.57, len: 1.8 });
  P.push({ t: 'chickens', n: 6, kind: 'hen', at: [-8, 38], y: 0.05, seed: 2 }); P.push({ t: 'chickens', n: 4, kind: 'hen', at: [8, 50], y: 0.05, seed: 4 });
  P.push({ t: 'laundry', at: [-10, 36.5], y: 0.05, rot: 0, len: 4, seed: 9 }); P.push({ t: 'laundry', at: [-26, 12], y: 0, rot: 1.57, len: 4, seed: 11 });
  // pigsties' beasts and the buffalo in the paddy
  for (const [x, z] of FARMS) F.push({ t: 'animal', kind: 'pig', at: [x + (rand() - 0.5) * 3, z + 3.6], y: 0, rot: rand() * 6, seed: Math.round(x) });
  for (const [x, z] of [[-30, 112], [40, 118], [-110, 20], [130, 95]]) F.push({ t: 'animal', kind: 'buffalo', at: [x, z], y: ground.height(x, z), rot: rand() * 6, seed: Math.round(x) });
  for (let k = 0; k < 6; k++) { const x = -60 + rand() * 120, z = 36 + rand() * 24; if (!inStream(x, z, 2)) F.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0.05, rot: rand() * 6, seed: k + 2 }); }

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
  for (let k = 0; k < 8; k++) { const x = YARD[0] + 2 + rand() * 24, z = YARD[1] + 2 + rand() * 20; (k % 2 ? woman : man)([x, z], 0.05, rand() * 6.28, k % 3 === 0 ? { pose: 'squat', carry: 'none' } : { hat: 'straw' }); }
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
  return [base('hakka-village', 'tulou', V), base('hakka-props', 'life', [...P, ...F, ...L])];
}
