// Pagan's road and precinct life beyond the lots' own (docs/settlements/bagan.md §10): bullock carts on the main road and the plain's tracks
// (the ox-cart is the Burmese road's vehicle), flower and candle sellers on mats at the Ananda's west gate, pigeons on the precinct's
// paving, sweepers and the dog asleep in the porch's shade, farmers with their oxen on the plain. Static life in the layout's coordinates.
import { ANANDA, PRECINCT, MAIN_ROAD, inRect, inLot, inPlainTemple, inRiver, inTank, streets, bankX } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const ARRIVAL = [30, 0];

export function dressing() {
  const rand = rng(1717), E = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const fig = (at, y, rot, o = {}) => E.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_brown']), cloth2: 'cloth_red', over: 'none', skin: skin(), hat: 'none', feet: 'bare', hair: rand() < 0.5 ? 'bun' : 'long', beard: false, ...o });
  const man = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'wrap', hair: 'short', cloth: pick(['cloth_brown', 'cloth_green', 'cloth_white']), ...o });
  const monk = (at, y, rot, o = {}) => fig(at, y, rot, { cloth: 'cloth_red', cloth2: 'cloth_red', over: 'shawl', hair: 'shaven', ...o });
  const far = (x, z, m = 8) => Math.hypot(x - ARRIVAL[0], z - ARRIVAL[1]) > m;
  const open = (x, z, m = 3) => !inRiver(x, z, 4) && !inTank(x, z, 2) && !inLot(x, z, m) && !inPlainTemple(x, z, 2) && Math.hypot(x, z) < 300;

  // bullock carts on the main road (the road lies at z = -4…4), going to and from the river, loaded with jars, rice sacks and baskets
  [[-84, 2.4, 'sacks', 'zebu', 0], [-61, -2.4, 'baskets', 'zebu', 1], [-35, 2.4, 'sacks', 'buffalo', 0], [-12, -2.4, 'crates', 'zebu', 1], [8, 2.6, 'sacks', 'zebu', 0]].forEach(([x, z, load, beast, dir], i) => {
    E.push({ t: 'cart', kind: 'two', beast, load, at: [x, z], y: 0, rot: dir ? -Math.PI / 2 : Math.PI / 2, seed: 30 + i });
    man([x + (dir ? -2.6 : 2.6), z + (z > 0 ? 1.2 : -1.2)], 0, dir ? -Math.PI / 2 : Math.PI / 2, { carry: 'staff' });
  });
  // a cart outspanned by the roadside on the plain, the oxen tied to it, the driver asleep in its shade
  for (const [x, z, rot] of [[-20, 60, 0.4], [70, -130, 2.6], [30, 150, 1.1]]) if (open(x, z, 6) && !streets().some((s) => inRect(s, x, z, 2))) {
    E.push({ t: 'cart', kind: 'two', beast: 'zebu', load: 'hay', at: [x, z], y: 0, rot, seed: Math.round(x + z) });
    E.push({ t: 'animal', kind: 'zebu', at: [x + Math.cos(rot) * 3, z - Math.sin(rot) * 3], y: 0, rot: rot + 1.2, seed: Math.round(x) });
    man([x + 2.2, z + 1.5], 0, 0.5, { pose: 'sit_ground' });
  }
  // the Ananda's west gate: flower, candle and gold-leaf sellers on mats either side of the way, pilgrims buying (clear of the arrival's view line)
  [[34.5, -7.8], [41.5, -7.8], [48.5, -7.8], [34.5, 7.8], [41.5, 7.8], [48.5, 7.8]].forEach(([x, z], i) => {
    E.push({ t: 'goods_mat', at: [x, z], y: 0, rot: 0, goods: pick([['heap', 'basket'], ['basket', 'water_pot'], ['heap']]), seed: 3000 + i });
    fig([x, z + (z < 0 ? -0.1 : 0.1)], 0, z < 0 ? 0 : Math.PI, { pose: 'sit_ground' });
    if (i % 2 === 0) fig([x + 0.8, z + (z < 0 ? 1.9 : -1.9)], 0, z < 0 ? Math.PI : 0, { carry: 'basket', pose: 'stand' });
  });
  // sweepers in the precinct with their long brooms, a monk watering the bodhi tree (the Ananda's courtyard trees), the temple dog asleep
  for (const [x, z] of [[62, 11], [72, -14], [140, 16], [152, -12], [94, -26]]) if (far(x, z)) fig([x, z], 0, rand() * 6.28, { carry: 'staff', arms: 'staff', cloth: 'cloth_brown' });
  for (const [x, z] of [[66, -8], [80, 24], [128, -22], [145, 28]]) if (far(x, z)) E.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.round(x + z) });
  for (const [x, z] of [[58, 22], [100, 30], [120, -30], [160, 20], [92, -40]]) if (far(x, z)) E.push({ t: 'chickens', kind: 'pigeon', n: 8, at: [x, z], y: 0, seed: Math.round(x * 2 + z), spread: 3 });
  // the plain: farmers with a pair of oxen at their field's edge, women with water pots to the tank, a boy and his buffalo
  for (let k = 0; k < 14; k++) {
    const x = -20 + rand() * 250, z = -170 + rand() * 340;
    if (!open(x, z, 8) || streets().some((s) => inRect(s, x, z, 3)) || inRect(PRECINCT, x, z, 10) || inRect([-262, -140, -100, 140], x, z, 6) || x < bankX(z) + 20) continue;
    const q = rand();
    if (q < 0.5) { man([x, z], 0, rand() * 6.28, { carry: 'staff', arms: 'staff' }); E.push({ t: 'animal', kind: 'zebu', at: [x + 2.2, z + 0.6], y: 0, rot: rand() * 6.28, seed: k + 70 }, { t: 'animal', kind: 'zebu', at: [x + 3.6, z - 0.4], y: 0, rot: rand() * 6.28, seed: k + 90 }); }
    else if (q < 0.8) fig([x, z], 0, rand() * 6.28, { carry: 'pot', arms: 'head' });
    else { fig([x, z], 0, rand() * 6.28, { child: true, h: 1.1, hair: 'short', carry: 'staff', arms: 'staff' }); E.push({ t: 'animal', kind: 'buffalo', at: [x + 1.8, z + 0.5], y: 0, rot: rand() * 6.28, seed: k + 110 }); }
  }
  void ANANDA; void MAIN_ROAD;
  return E;
}
