// Round the landmarks (docs/settlements/qin-xianyang.md §2, §6): the imperial road and its stations, the walled market with its
// stalls, scales and sellers, the figure-makers' quarter, the rammed-earth houses of the town, the people (officials, guards, labourers
// at the pit's roof, the figure-makers at their trades), carts on the road.
import { TRADES } from '../../styles/qin/shops.js';
import { doorOf } from '../../styles/qin/houses.js';
import { RADIUS, YARD, HAUL, rampZ, RAMP, ROAD, MARKET, TOWER, MWALL, TERRACE, STAIR, HALL, ROOF, PIT, WS_Z, lots } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, o = {}) => ({ id, style: 'qin', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, ...o });
const base0 = (id, elements) => base(id, elements);
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

/** The market's stalls: rows between the aisles, with a balance at many of them. */
function market() {
  const rand = rng(211), S = [], Q = [];
  const GOODS = [['heap', 'baskets'], ['bolts', 'heap'], ['pottery', 'pottery'], ['greens', 'bread'], ['fish', 'greens'], ['baskets', 'pottery'], ['heap', 'heap']];
  const rows = [[41, Math.PI], [48, 0], [70, Math.PI], [77, 0]];
  for (const [z, rot] of rows) for (let x = MARKET[0] + 4; x < MARKET[2] - 3; x += 4.4) {
    if (Math.abs(x - -30) < 4.5) continue;                                                          // the gates' aisle
    if (Math.abs(x - TOWER.x) < 12 && z > 62 && z < 74) continue;                                    // the tower's stair and the standards
    S.push({ t: 'stall', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), awning: pick(rand, ['cloth_white', 'cloth_ochre', 'reed_mat', 'cloth_indigo', 'cloth_black']), stripe: null, goods: pick(rand, GOODS), w: 2.8, d: 1.4 });
    if (rand() < 0.55) Q.push({ t: 'qin_scale', at: [x + 0.9, z + (rot ? 0.1 : -0.1)], y: 0.79, rot: rand() * 6.28 });
  }
  return { S, Q };
}

/** The people. */
function people() {
  const rand = rng(212), L = [];
  const fig = (at, rot, o = {}, y = 0) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'hose', cloth: pick(rand, ['cloth_brown', 'cloth_ochre', 'cloth_grey', 'cloth_white']), cloth2: 'cloth_brown', over: 'belt', skin: pick(rand, ['skin_medium', 'skin_light']), hat: 'none', feet: 'shod', hair: 'topknot', beard: rand() < 0.3, ...o });
  const official = (at, rot, o = {}, y = 0) => fig(at, rot, { dress: 'robe', legs: undefined, cloth: pick(rand, ['cloth_black', 'cloth_black', 'cloth_indigo']), cloth2: pick(rand, ['cloth_red', 'cloth_ochre']), over: 'sash', hat: 'cap', beard: rand() < 0.8, ...o }, y);
  const woman = (at, rot, o = {}, y = 0) => fig(at, rot, { dress: 'robe', legs: undefined, cloth: pick(rand, ['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white']), cloth2: 'cloth_black', over: 'sash', hair: 'bun', beard: false, ...o }, y);
  const guard = (at, rot, o = {}, y = 0) => fig(at, rot, { cloth: 'cloth_red', cloth2: 'cloth_brown', hat: 'cap', pose: 'staff', carry: 'staff', len: 2.2, ...o }, y);
  // the palace: guards at the stair's foot and head, in the hall's doors; officials on the terrace and in the hall, seated on their mats
  for (const s of [-1, 1]) { guard([STAIR.x + s * 7.5, TERRACE.z1 + STAIR.run + 0.8], Math.PI); guard([STAIR.x + s * 7.5, TERRACE.z1 - 2.5], 0, {}, TERRACE.h); guard([STAIR.x + s * 3.4, HALL.z1 - 5.5], Math.PI, {}, TERRACE.h + 0.08); }
  for (const [x, z, r] of [[-232, -78, 1], [-205, -78, 4], [-219, -70, 3], [-250, -100, 1.5]]) official([x, z], r, { pose: rand() < 0.5 ? 'talk' : 'stand' }, TERRACE.h);
  const cx = (HALL.x0 + HALL.x1) / 2, dz1 = HALL.z0 + 3.4 + 8.0;
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) if (rand() < 0.75) official([cx + s * 13, dz1 + 3 + i * 2.6], s < 0 ? -Math.PI / 2 : Math.PI / 2, { pose: 'seiza' }, TERRACE.h + 0.11);
  for (const [x, z] of [[-228, -100], [-210, -96], [-226, -91]]) official([x, z], rand() * 6, { pose: 'talk' }, TERRACE.h + 0.08);
  // the forecourt: officials and petitioners, a clerk with tablets
  for (let k = 0; k < 14; k++) { const x = -270 + rand() * 110, z = -62 + rand() * 36; (rand() < 0.5 ? official : fig)([x, z], rand() * 6.28, rand() < 0.3 ? { pose: 'talk' } : {}); }
  // the pit's bare roof: labourers with baskets of earth and shovels, an overseer, women with water; the ramps' tops
  for (let k = 0; k < 16; k++) { const x = ROOF.bareX + 22 + rand() * 38, z = PIT.z0 + 4 + rand() * (PIT.z1 - PIT.z0 - 8); fig([x, z], rand() * 6.28, { cloth: 'cloth_grey', hair: 'shaven', beard: false, carry: pick(rand, ['sack', 'sack', 'pole', 'none']), over: 'belt' }, ROOF.top); }
  for (const [x, z] of [[ROOF.bareX + 30, -121], [ROOF.bareX + 52, -105]]) guard([x, z], rand() * 6, {}, ROOF.top);
  for (const z of [-137.4, -121, -104.6]) { guard([158, z - 3.4], Math.PI / 2); guard([158, z + 3.4], Math.PI / 2); }
  // the market: sellers behind the stalls, the market officer at the standards, buyers
  const { S } = market();
  for (const s of S) if (rand() < 0.8) (rand() < 0.4 ? woman : fig)([s.at[0] - 0.8 + rand() * 1.6, s.at[1] + (s.rot ? 0.95 : -0.95) * 0.0 + (s.rot ? 1.0 : -0.9)], s.rot ? 0 : Math.PI, { pose: rand() < 0.5 ? 'squat' : 'stand' });
  official([TOWER.x - 1.5, TOWER.z + 5 + 8.2], Math.PI * 1.5, { pose: 'stand' }); official([TOWER.x + 1.5, TOWER.z + 5 + 8.2], Math.PI / 2, { pose: 'talk' });
  for (let k = 0; k < 24; k++) { const x = MARKET[0] + 4 + rand() * 132, z = pick(rand, [36.5, 38, 52 + rand() * 12, 80.5, 82]); (rand() < 0.4 ? woman : fig)([x, z], rand() * 6.28, rand() < 0.35 ? { carry: pick(rand, ['basket', 'sack', 'pole']) } : {}); }
  // the figure-makers' street: overseers with a tablet, porters between the yards
  for (let k = 0; k < 14; k++) { const x = -90 + rand() * 240; fig([x, WS_Z + (rand() - 0.5) * 3], rand() * 6.28, rand() < 0.5 ? { carry: pick(rand, ['sack', 'pole']) } : {}); }
  // the road and the lanes: travellers, soldiers, women with jars
  for (let k = 0; k < 30; k++) { const x = -300 + rand() * 600, z = (rand() - 0.5) * 36; (rand() < 0.2 ? woman : rand() < 0.2 ? official : fig)([x, z], rand() > 0.5 ? 0 : Math.PI / 2 * 3, rand() < 0.3 ? { carry: pick(rand, ['sack', 'pole', 'basket']) } : {}); }
  return L;
}

/** The street fronts' life: benches with sitters, water vats, firewood, baskets, drying trays, laundry, hens, dogs, a woman or a man at the door. */
function frontLife() {
  const rand = rng(216), L = [], cl = ['cloth_brown', 'cloth_ochre', 'cloth_grey', 'cloth_white', 'cloth_indigo'];
  const sd = () => Math.floor(rand() * 1e9);
  for (const l of lots()) {
    if (l.trade || l.kind === 'garden') continue;
    const [x0, z0, x1, z1] = l.rect, W = x1 - x0, s = l.front === 's', out = (u, v) => [x0 + u, s ? z1 + v : z0 - v], ro = s ? Math.PI : 0;
    if (Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) > RADIUS - 50) continue;
    const d = doorOf({ kind: l.kind, seed: l.seed, rect: l.rect }), away = (u, k = 1.5) => Math.abs(u - d.u) > k && u > 0.7 && u < W - 0.7;
    const side = rand() < 0.5 ? 1 : -1, at = (u, v) => ({ at: out(u, v), y: 0 });
    const person = (u, v, o = {}) => L.push({ t: 'figure', ...at(u, v), rot: ro, seed: sd(), dress: 'tunic', legs: 'hose', cloth: cl[Math.floor(rand() * cl.length)], cloth2: 'cloth_brown', over: 'belt', skin: rand() < 0.5 ? 'skin_medium' : 'skin_light', hat: 'none', feet: 'shod', hair: 'topknot', beard: rand() < 0.3, ...o });
    const fem = (u, v, o = {}) => person(u, v, { dress: 'robe', legs: undefined, cloth: ['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white'][Math.floor(rand() * 4)], cloth2: 'cloth_black', over: 'sash', hair: 'bun', beard: false, ...o });
    if (l.kind === 'granary') { L.push({ t: 'sacks', ...at(d.u + 2.6, 0.5), rot: ro, seed: sd(), n: 3 }); continue; }
    const ub = d.u + side * (1.8 + rand() * 1.0);
    if (rand() < 0.3 && away(ub, 1.2)) { L.push({ t: 'bench', ...at(ub, 0.45), rot: ro, seed: sd(), len: 1.6 }); for (const q of [-0.4, 0.4]) if (rand() < 0.6) (rand() < 0.4 ? fem : person)(ub + q, 0.45, { pose: 'sit', dress: 'robe', cloth: cl[Math.floor(rand() * cl.length)] }); }
    if (rand() < 0.5) L.push({ t: 'pot', kind: 'vat', ...at(d.u - side * 0.9, 0.4), rot: 0, seed: sd() });
    const uf = d.u - side * (2.0 + rand() * 1.2);
    if (rand() < 0.4 && away(uf, 1.0)) L.push({ t: 'firewood', ...at(uf, 0.5), rot: 0, seed: sd(), len: 1.6 });
    if (rand() < 0.35) { const u = 0.8 + rand() * (W - 1.6); if (away(u, 1.0)) L.push({ t: 'basket', ...at(u, 0.5), rot: 0, seed: sd(), n: 1 + Math.floor(rand() * 3) }); }
    if (rand() < 0.2) { const u = 1.5 + rand() * (W - 3); if (away(u, 1.4)) L.push({ t: 'drying_tray', ...at(u, 0.8), rot: ro, seed: sd() }); }
    if (rand() < 0.18 && W > 8) { const u = W * 0.5 + side * W * 0.2; if (away(u, 2.2)) L.push({ t: 'laundry', ...at(u, 0.5), rot: 0, seed: sd(), len: 3 }); }
    if (rand() < 0.22) L.push({ t: 'chickens', ...at(d.u + side * 2.6, 1.3), rot: rand() * 6.28, seed: sd(), n: 3 + Math.floor(rand() * 3) });
    if (rand() < 0.1) L.push({ t: 'animal', kind: 'dog', ...at(d.u + side * 0.9, 1.2), rot: rand() * 6.28, seed: sd() });
    if (rand() < 0.08 && l.kind === 'row') L.push({ t: 'barrow', ...at(0.9 + rand() * (W - 1.8), 1.0), rot: Math.PI / 2, seed: sd() });
    if (rand() < 0.28) (rand() < 0.45 ? fem : person)(d.u, 0.9, rand() < 0.4 ? { pose: 'talk' } : {});
  }
  // shopkeepers behind their counters, a customer or two before them
  for (const sh of shopLots()) {
    const [x0, z0, x1, z1] = sh.rect, s = sh.front === 's', cx = x0 + (x1 - x0) / 2, zf = s ? z1 : z0, f = s ? -1 : 1, ro = s ? Math.PI : 0;
    const keep = { t: 'figure', at: [cx + (rand() - 0.5) * 3, zf + f * 1.6], y: 0, rot: ro, seed: sd(), dress: 'robe', cloth: cl[Math.floor(rand() * cl.length)], cloth2: 'cloth_brown', over: 'sash', skin: 'skin_light', hat: rand() < 0.4 ? 'cap' : 'none', feet: 'shod', hair: 'topknot', beard: rand() < 0.5 };
    L.push(keep);
    if (rand() < 0.6) L.push({ ...keep, at: [cx + (rand() - 0.5) * 4, zf - f * 1.0], rot: ro + Math.PI, seed: sd(), dress: 'tunic', legs: 'hose', over: 'belt', carry: rand() < 0.5 ? 'basket' : 'none', cloth: cl[Math.floor(rand() * cl.length)] });
  }
  // the yard before the ramps: gangs with baskets and poles, scribes at the pavilion, guards at the portals, carts of logs on the haul road
  const yx = YARD[0], base = rampZ(0);
  for (let k = 0; k < 26; k++) { const x = yx + 4 + rand() * 40, z = base - 24 + rand() * 62; L.push({ t: 'figure', at: [x, z], y: 0, rot: rand() * 6.28, seed: sd(), dress: 'tunic', legs: 'hose', cloth: rand() < 0.5 ? 'cloth_grey' : 'cloth_brown', cloth2: 'cloth_brown', over: 'belt', skin: 'skin_medium', hat: 'none', feet: rand() < 0.5 ? 'bare' : 'shod', hair: rand() < 0.4 ? 'shaven' : 'topknot', beard: false, carry: ['sack', 'pole', 'basket', 'none'][Math.floor(rand() * 4)] }); }
  for (let i = 0; i < 3; i++) for (const q of [-1, 1]) L.push({ t: 'figure', at: [yx - 1.5, rampZ(i) + q * (RAMP.w / 2 + 0.2)], y: 0, rot: -Math.PI / 2, seed: sd(), dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_brown', over: 'belt', skin: 'skin_light', hat: 'cap', feet: 'shod', hair: 'topknot', beard: true, pose: 'staff', carry: 'staff', len: 2.2 });
  L.push({ t: 'figure', at: [yx + 19, rampZ(2) + 9.5], y: 0, rot: Math.PI, seed: sd(), dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_red', over: 'sash', skin: 'skin_light', hat: 'cap', feet: 'shod', hair: 'topknot', beard: true, pose: 'seiza' });
  L.push({ t: 'figure', at: [yx + 20.5, rampZ(2) + 9.5], y: 0, rot: Math.PI * 1.5, seed: sd(), dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_brown', over: 'sash', skin: 'skin_light', hat: 'cap', feet: 'shod', hair: 'topknot', beard: false, pose: 'seiza' });
  [[YARD[0] + 40, HAUL.z - 2, Math.PI / 2], [YARD[0] + 78, HAUL.z + 2, -Math.PI / 2], [YARD[0] + 112, HAUL.z - 2, Math.PI / 2]].forEach(([x, z, rot], i) => L.push({ t: 'cart', kind: 'two', at: [x, z], y: 0, rot, seed: sd(), load: i === 1 ? 'hay' : 'barrels', beast: i === 1 ? 'horse' : 'ox' }));
  L.push({ t: 'sledge', at: [yx + 14, base - 8], y: 0, rot: 0, seed: sd(), beast: 'ox', load: 'empty' });
  for (const [x, z] of [[yx + 30, base - 1], [yx + 34, base + 22]]) L.push({ t: 'animal', kind: 'ox', at: [x, z], y: 0, rot: rand() * 6.28, seed: sd() });
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base0(`qin-frontlife-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
}

/** Carts on the road: ox carts and horse carts, one gauge; an official's cart with a canopy of cloth. */
function carts() {
  const rand = rng(213), L = [];
  const beasts = ['ox', 'ox', 'horse', 'ox', 'horse', 'ox'];
  [[-250, 7, 1.57], [-170, -9, -1.57], [-90, 12, 1.57], [40, -11, -1.57], [120, 6, 1.57], [230, -7, -1.57]].forEach(([x, z, rot], i) => {
    L.push({ t: 'cart', kind: 'two', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), load: pick(rand, ['sacks', 'barrels', 'hay']), beast: beasts[i % beasts.length] });
  });
  return L;
}

/** The shop-houses under the market's north and south walls: { rect, front, trade, seed }. */
export function shopLots() {
  const rand = rng(215), out = [];
  let ti = 0;
  for (const [z0, z1, front] of [[27.4, 35.2, 's'], [83.6, 88.4, 'n']]) {
    let x = MARKET[0] + 1.5;
    while (x < MARKET[2] - 6) {
      const w = 5.4 + Math.floor(rand() * 3) * 0.6;
      if (x + w > -30 - 4.5 && x < -30 + 4.5) { x = -30 + 4.6; continue; }
      if (x + w > MARKET[2] - 1) break;
      out.push({ rect: [x, z0, x + w, z1], front, trade: TRADES[ti++ % TRADES.length], seed: Math.floor(rand() * 1e6) });
      x += w + 0.15;
    }
  }
  return out;
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  const plans = [], { S, Q } = market();
  plans.push(base('qin-road', [{ t: 'qin_road', x0: -RADIUS + 14, x1: RADIUS - 14 }, { t: 'qin_pavilion', at: [-150, ROAD.z0 - 6] }, { t: 'qin_pavilion', at: [170, ROAD.z1 + 6] }]));
  plans.push(base('qin-yard', [{ t: 'qin_yard' }, { t: 'qin_haul' }]));
  plans.push(base('qin-shops', shopLots().map((l) => ({ t: 'qin_shop', ...l }))));
  plans.push(base('qin-market', [{ t: 'qin_market' }, ...Q]));
  plans.push({ ...base('qin-stalls', S), style: 'life' });
  plans.push({ ...base('qin-people', people()), style: 'life' });
  plans.push({ ...base('qin-carts', carts()), style: 'life' });
  const LOTS = lots(), K = { row: 'qin_row_house', court: 'qin_court_house', official: 'qin_official', granary: 'qin_granary', garden: 'qin_garden', workshop: 'qin_workshop' };
  const ws = LOTS.filter((l) => l.trade), houses = LOTS.filter((l) => !l.trade);
  plans.push(base('qin-workshops', ws.map((l) => ({ t: K.workshop, rect: l.rect, front: l.front, seed: l.seed, open: l.open, trade: l.trade }))));
  for (let i = 0; i < houses.length; i += 70) plans.push(base(`qin-town-${i / 70}`, houses.slice(i, i + 70).map((l) => ({ t: K[l.kind], rect: l.rect, front: l.front, seed: l.seed, open: l.open }))));
  plans.push(...frontLife());
  void MWALL;
  return (CACHE = plans);
}
