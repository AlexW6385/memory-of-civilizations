// The riverside quarter (docs/settlements/song-hangzhou.md §5, §10): shophouses and tea houses of the
// Jiangnan type; and the day of the tide — the coloured stands of the great houses along the flood
// wall below the pagoda, the crowd on the wall looking out for the bore, tea tables on the road; the
// peddlers come to the riverbank for the crowd: stalls along the foot of the flood wall, hawkers with
// their shoulder poles, a fruit seller under a parasol.
import { RADIUS, LEVEL, WALL, ROAD, PAGODA, CANAL, lots } from './layout.js';
import { RIVER_BOATS, CANAL_BOATS } from './plan.js';
const base = (id, elements, style = 'song') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-110, 136], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_red', 'cloth_green'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

function tideDay() {
  const S = [], L = [], rand = rng(1165), pick = (a) => a[Math.floor(rand() * a.length)], yW = 1.0, zc = (WALL.z0 + WALL.z1) / 2;
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.75 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: 'skin_light', hat: pick(['none', 'cap', 'cap', 'brim', 'veil']), carry: 'none', ...extra });
  // the stands along the wall, either side of the pagoda's stair; people seated in them, the crowd at the wall's edge
  for (let x = -200; x < CANAL.x0 - 20; x += 7.5) {
    if (Math.abs(x - PAGODA.c[0]) < 9) continue;
    if (rand() < 0.55) {
      S.push({ t: 'view_tent', at: [x, zc - 0.6], y: yW, w: 5, d: 3.2, h: 2.4, cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_red']), trim: pick(['cloth_white', 'cloth_ochre', 'cloth_red']), open: 's' });
      for (const dx of [-1.4, 0, 1.4]) if (rand() < 0.75) person([x + dx, zc - 1.0], yW, faceTo([0, 1]), { pose: 'sit', dress: 'robe' });
    }
    for (let k = 0; k < 3; k++) if (rand() < 0.7) person([x + (rand() - 0.5) * 6, WALL.z1 - 1.2 - rand() * 0.6], yW, faceTo([(rand() - 0.5) * 0.6, 1]), { pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  // tea tables on the road before the tea houses, people at them
  for (const l of lots()) {
    if (l.front !== 's' || !l.shop || l.rect[3] < ROAD.z0 - 1 || rand() > 0.4) continue;
    const c = [(l.rect[0] + l.rect[2]) / 2, ROAD.z0 + 2.2];
    if (Math.hypot(...c) > RADIUS - 35) continue;
    L.push({ t: 'tea_table', at: c, c, r: 1.1, y: LEVEL.street + 0.04, rot: 0, seed: Math.floor(rand() * 1e9) });
    for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85]]) if (rand() < 0.7) person([c[0] + dx, c[1] + dz], LEVEL.street + 0.04, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe' });
  }
  // people on the road walking to the river
  for (let k = 0; k < 40; k++) { const x = -190 + rand() * 300; if (Math.abs(x - (CANAL.x0 + CANAL.x1) / 2) < 10) continue; person([x, ROAD.z0 + 4.5 + rand() * 4], LEVEL.street + 0.04, faceTo([rand() < 0.5 ? 1 : -1, 0.3]), { carry: pick(['none', 'none', 'basket', 'pole']) }); }
  // the riverbank market of the tide day: stalls at the foot of the flood wall facing the road, the
  // sellers behind them, buyers before; hawkers with their poles set down; a parasol over a fruit seller
  const zs = WALL.z0 - 1.6, yR = LEVEL.street + 0.04;
  for (let x = -196; x < CANAL.x0 - 14; x += 6.5 + rand() * 4) {
    if (Math.abs(x - PAGODA.c[0]) < 10) continue;
    const r = rand();
    if (r < 0.6) {
      const W = 2.2 + rand() * 0.8;
      L.push({ t: 'stall', at: [x, zs], y: yR, rot: Math.PI, w: W, d: 1.3, awning: pick(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white']), stripe: rand() < 0.4 ? pick(['cloth_red', 'cloth_indigo']) : undefined, goods: pick([['produce', 'basket'], ['dark_pot', 'water_pot', 'basket'], ['cloth', 'basket'], ['produce', 'produce', 'basket']]), seed: Math.floor(rand() * 1e9) });
      person([x + (rand() - 0.5) * W * 0.5, zs + 0.95], yR, faceTo([0, -1]), { dress: pick(['robe', 'trousers']), hat: pick(['none', 'cap']), pose: rand() < 0.5 ? 'talk' : 'stand' });
      if (rand() < 0.7) person([x + (rand() - 0.5) * W * 0.7, zs - 1.9 - rand() * 0.5], yR, faceTo([(rand() - 0.5) * 0.4, 1]), { pose: rand() < 0.5 ? 'talk' : 'stand' });
    } else if (r < 0.85) {
      // a hawker squatting by the two baskets of his shoulder pole
      for (const dx of [-0.55, 0.55]) L.push({ t: 'basket', at: [x + dx, zs + 0.2], y: yR, rot: rand() * 6.28, n: 1, seed: Math.floor(rand() * 1e9) });
      person([x, zs + 0.85], yR, faceTo([0, -1]), { pose: 'squat', dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']), hat: pick(['straw', 'none']) });
    } else {
      S.push({ t: 'parasol', at: [x, zs + 0.3], y: yR, h: 2.3, r: 1.3, cloth: pick(['cloth_white', 'cloth_ochre']) });
      for (const dx of [-0.5, 0.3]) L.push({ t: 'basket', at: [x + dx, zs - 0.2], y: yR, rot: rand() * 6.28, n: 2, seed: Math.floor(rand() * 1e9) });
      person([x + 0.2, zs + 0.7], yR, faceTo([0, -1]), { pose: 'squat', dress: 'robe', hat: 'none' });
    }
  }
  teaInside(S, L, rand, person);
  // the shops' name boards over their fronts, on the beam over the opening; the tea houses' on their front beam
  const tea = new Set(teaHouses()), F = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
  for (const l of lots()) {
    if (!l.shop) continue;
    const [x0, z0, x1, z1] = l.rect, o = F[l.front], len = o[0] ? z1 - z0 : x1 - x0, edge = [o[0] > 0 ? x1 : o[0] < 0 ? x0 : (x0 + x1) / 2, o[1] > 0 ? z1 : o[1] < 0 ? z0 : (z0 + z1) / 2];
    const n = Math.min(Math.floor((len - 1.6) / 0.36), 2 + (l.seed % 4)), back = tea.has(l) ? 0.435 : 0.505;
    if (n < 2) continue;
    S.push({ t: 'shop_plaque', at: [edge[0] - o[0] * back, edge[1] - o[1] * back], y: LEVEL.street, yb: tea.has(l) ? 3.3 : 2.28, rot: Math.atan2(o[0], o[1]), n: tea.has(l) ? 2 : n, scheme: tea.has(l) ? 0 : [0, 0, 1, 2][(l.seed >> 2) % 4], seed: l.seed >> 5 });
  }
  return [base('song-hangzhou-stands', S), base('song-hangzhou-tide-crowd', L, 'life')];
}

/** The tea houses on the road below the pagoda: three of the wide shop lots nearest its stair. */
let TEA = null;
export function teaHouses() {
  if (TEA) return TEA;
  TEA = lots().filter((l) => l.front === 's' && l.rect[3] > ROAD.z0 - 1 && l.rect[0] < -30 && l.rect[2] - l.rect[0] > 8).slice(0, 3);
  return TEA;
}
/** Inside each tea house: tea tables with their benches, customers seated round them, the host at the counter. */
function teaInside(S, L, rand, person) {
  for (const l of teaHouses()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2 - 0.6, Y = LEVEL.street + 0.45;
    S.push({ t: 'tea_house', rect: l.rect, y: LEVEL.street, seed: l.seed });
    for (const zz of [z0 + 4.4, z0 + 8.2]) {
      L.push({ t: 'tea_table', at: [cx, zz], y: Y, rot: 0, seed: Math.floor(rand() * 1e9) });
      for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85], [0, -0.85]]) if (rand() < 0.6) person([cx + dx, zz + dz], Y, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe', hat: rand() < 0.6 ? 'cap' : 'none' });
    }
    person([x1 - 1.15, z0 + 6], Y, faceTo([-1, 0]), { pose: 'stand', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap' });
  }
}

/**
 * The boats' people (§11): on the river boats the steersman at the stern and a hand at the bow — on
 * those under sail a third at the mast, on those moored by the wall one sitting on the deck; on the
 * canal boats the boatman at the stern's sculling oar, a passenger under the awning on some.
 */
function boatPeople() {
  const L = [], rand = rng(1200), pick = (a) => a[Math.floor(rand() * a.length)];
  const hand = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo', 'cloth_white']), cloth2: pick(['cloth_brown', 'cloth_grey']), skin: 'skin_medium', hat: pick(['straw', 'none', 'cap']), hair: 'bun', ...extra });
  for (const [x, z, d, L0] of RIVER_BOATS) {
    const len = L0 + 4, H = len / 2, yw = LEVEL.river, sheer = (t) => yw + 0.95 + 0.35 * t * t + (t > 0 ? 0.7 : 0.45) * t ** 6, deck = (t) => sheer(t) - 0.3;
    const at = (t) => [x + d * t * H, z];
    hand(at(-0.8), deck(-0.8), faceTo([d, 0]), { pose: 'pull' });                                       // at the tiller
    hand(at(0.72), deck(0.72), faceTo([d, (rand() - 0.5) * 0.6]), { pose: rand() < 0.5 ? 'stand' : 'talk' });
    if (z > 165) hand([x - d * 0.6, z + 0.5], deck(0) , faceTo([0, -1]), { pose: 'brace', carry: 'rope' });
    else hand([x + d * 0.3 * H, z - 0.4], deck(0.3), faceTo([0, 1]), { pose: 'cross', dress: 'robe' });
  }
  for (const [z, d] of CANAL_BOATS) {
    const len = 7, x = (CANAL.x0 + CANAL.x1) / 2 + (d > 0 ? -2 : 2), yw = LEVEL.canal, s = -0.38 * len;
    const stern = [x, z + d * s], ys = yw + 0.5 + 0.32 * Math.pow(0.76, 2.2) - 0.06;
    hand(stern, ys, faceTo([0, d]) + (rand() - 0.5) * 0.5, { pose: 'row' });
    L.push({ t: 'oar', at: [x, z + d * (s - 0.45)], y: ys - 0.1, rot: d > 0 ? Math.PI : 0, seed: 5 });
    if (rand() < 0.6) hand([x, z + d * 0.6], yw + 0.07, faceTo([0, d]), { pose: 'low', dress: 'robe', hat: 'cap', cloth: pick(['cloth_indigo', 'cloth_white']) });
  }
  return { ...base('song-hangzhou-boat-people', L, 'life'), center: [0, 120] };
}

export async function town() {
  const tea = new Set(teaHouses()), all = lots().filter((l) => !tea.has(l)), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`song-hangzhou-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'house_jiangnan', y: LEVEL.street, ...l }))));
  plans.push(...tideDay(), boatPeople());
  return plans;
}
