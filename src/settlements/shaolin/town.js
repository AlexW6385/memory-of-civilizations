// Shaolin's townscape (docs/settlements/shaolin.md §5–§7): the village before the gate (grey-brick and earth-walled houses under grey
// tile along the approach), and the people of the monastery: monks at their drill in the training hall (standing in the worn pits with
// staffs), kneeling in the Mahavira Hall, sweeping the courts, pilgrims and villagers in Ming dress, dogs. Several plans.
import '../../styles/shaolin/index.js';
import { PAL_HOUSE } from '../../styles/shaolin/index.js';
import { HOUSES, YARDS, GAP, AXIS, PLAT, HGT, RANGES, CELL, RADIUS, rng } from './layout.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 165], facing: 'n' } });

const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** The frame of a house front: P(t, d) = the point at fraction t along the front and d out from the posts; rot turns local +z out into the street; L the front's width. */
function frontOf(h) {
  const [x0, z0, x1, z1] = h.rect, o = OUT[h.front], along = h.front === 'n' || h.front === 's';
  const L = along ? x1 - x0 : z1 - z0;
  const edge = { n: z0, s: z1, w: x0, e: x1 }[h.front];
  const P = (t, d) => along ? [x0 + L * t, edge + o[1] * d] : [edge + o[0] * d, z0 + L * t];
  return { P, L, rot: Math.atan2(o[0], o[1]), o, along };
}
const FRONT_Y = 0.25;

/** The houses: continuous fronts with party walls, furnished rooms, the yards behind them with their earth walls. */
function village() {
  const E = [], r = rng(1590);
  HOUSES.forEach((h) => {
    const rr = h.rect, along = h.front === 'n' || h.front === 's';
    const walls = { n: 'plaster', s: 'plaster', e: 'plaster', w: 'plaster' }; delete walls[h.front];
    E.push({ t: 'ming_hall', rect: rr, y: FRONT_Y, H: h.H, front: h.front, four: false, roof: h.roof, plat: 0.25, platMargin: 0.25, eave: 0.35, pal: PAL_HOUSE, lat: 'lattice', walls, winWall: true, bays: [3, 1] });
    E.push({ t: 'shaolin_room', kind: h.kind === 'shop' ? 'shop' : 'farmhouse', rect: rr, front: h.front, y: FRONT_Y, H: h.H, trade: h.trade, seed: h.seed });
    void along;
  });
  // the party walls between neighbours in a row
  for (let i = 0; i < HOUSES.length; i++) for (let j = i + 1; j < HOUSES.length; j++) {
    const a = HOUSES[i], b = HOUSES[j];
    if (a.front !== b.front) continue;
    const ra = a.rect, rb = b.rect, H = Math.min(a.H, b.H) - 0.3;
    if (Math.abs(rb[0] - ra[2] - GAP) < 0.01 || Math.abs(ra[0] - rb[2] - GAP) < 0.01) {
      const xl = Math.min(ra[2], rb[2]), xr = Math.max(ra[0], rb[0]), z0 = Math.max(ra[1], rb[1]), z1 = Math.min(ra[3], rb[3]);
      if (z1 - z0 > 0.5 && xr > xl) E.push({ t: 'block', rect: [xl, z0, xr, z1], y0: 0, y1: FRONT_Y + H, mat: 'earth_wall' });
    } else if (Math.abs(rb[1] - ra[3] - GAP) < 0.01 || Math.abs(ra[1] - rb[3] - GAP) < 0.01) {
      const zl = Math.min(ra[3], rb[3]), zr = Math.max(ra[1], rb[1]), x0 = Math.max(ra[0], rb[0]), x1 = Math.min(ra[2], rb[2]);
      if (x1 - x0 > 0.5 && zr > zl) E.push({ t: 'block', rect: [x0, zl, x1, zr], y0: 0, y1: FRONT_Y + H, mat: 'earth_wall' });
    }
  }
  // the yards: an earth wall behind, and along the party lines
  const seen = new Set(), wallOnce = (a, b, o = {}) => {
    const k = [a, b].map((p) => p.map((v) => Math.round(v * 2)).join(',')).sort().join('|');
    if (seen.has(k)) return; seen.add(k);
    E.push({ t: 'ming_wall', a, b, y: 0, h: 1.9, th: 0.38, pal: PAL_HOUSE, ...o });
  };
  for (const y of YARDS) {
    const q = y.rect, h = HOUSES[y.house], north = h.front === 'n';
    const back = north ? q[3] : q[1];
    wallOnce([q[0], back], [q[2], back], r() < 0.35 ? { gates: [{ at: (q[2] - q[0]) / 2, w: 1.5, h: 2.0 }] } : {});
    const z0 = north ? q[1] : q[3], z1 = back;
    wallOnce([q[0], z0], [q[0], z1]); wallOnce([q[2], z0], [q[2], z1]);
  }
  // the street: a strip of worn bluestone down the middle of the village street, the approach's shoulders and the processional way across the plaza
  E.push({ t: 'paving', rect: [-88, 153.4, 88, 156.6], y: 0.02, th: 0.3, mat: 'bluestone' });
  E.push({ t: 'paving', rect: [-5.2, 152, -4, 190], y: 0.02, th: 0.3, mat: 'bluestone' });
  E.push({ t: 'paving', rect: [4, 152, 5.2, 190], y: 0.02, th: 0.3, mat: 'bluestone' });
  E.push({ t: 'paving', rect: [-2.2, 131.6, 2.2, 152], y: 0.04, th: 0.3, mat: 'granite_grey' });
  E.push({ t: 'paving', rect: [-88, 158, 88, 159.1], y: 0.02, th: 0.3, mat: 'granite_grey' });       // the kerb of flagstones along the north row's fronts
  E.push({ t: 'paving', rect: [-88, 150.9, -17, 152], y: 0.02, th: 0.3, mat: 'granite_grey' });
  E.push({ t: 'paving', rect: [17, 150.9, 88, 152], y: 0.02, th: 0.3, mat: 'granite_grey' });
  // dry grass and weeds along the foot of the fronts and in the ruts
  for (const [x0, x1] of [[-88, -17], [17, 88]]) { E.push({ t: 'shaolin_wear', kind: 'tufts', rect: [x0, 156.7, x1, 157.9], y: 0.0, n: 120, seed: 12 }); E.push({ t: 'shaolin_wear', kind: 'tufts', rect: [x0, 152.1, x1, 153.3], y: 0.0, n: 100, seed: 13 }); }
  return E;
}

/** The eye-level life of the fronts, yards, plaza and road, in tiles of 100 m: the shops' signs and goods, the clutter of the trades and the houses. */
function frontLife() {
  const L = [], r = rng(1611), pick = (a) => a[Math.floor(r() * a.length)], sd = () => Math.floor(r() * 1e9);
  const dressed = (h) => {
    const F = frontOf(h), Y = FRONT_Y - 0.25, at = F.P(0.5, 0.45);
    if (h.kind === 'shop') L.push({ t: 'suzhou_shop', at, y: 0, rot: F.rot, L: F.L, v0: 0.45, trade: h.trade, seed: h.seed + 7, open: false, detail: 1, water: false });
    else {
      // a home: a lantern at the door, firewood, a bench, a water tub, pots at the step, drying trays of corn on a rack
      if (r() < 0.6) L.push({ t: 'hang_lantern', at: F.P(0.5, 0.15), y: FRONT_Y + 2.7, rot: F.rot, kind: pick(['paper', 'paper', 'white']), seed: 1 });
      if (r() < 0.7) L.push({ t: 'firewood', at: F.P(0.12 + r() * 0.1, 0.9), y: Y, rot: F.rot, len: 1.5, seed: sd() });
      if (r() < 0.5) L.push({ t: 'bench', at: F.P(0.8, 1.0), y: Y, rot: F.rot + Math.PI / 2 * 0 + (F.along ? 0 : Math.PI / 2), seed: sd() });
      if (r() < 0.45) L.push({ t: 'rain_tub', at: F.P(0.9, 0.7), y: Y, rot: r() * 6.28, seed: sd() });
      for (let k = 0; k < (r() < 0.6 ? 2 : 0); k++) L.push({ t: 'pot', kind: pick(['glazed_jar', 'water_pot', 'dark_pot']), at: F.P(0.2 + r() * 0.6, 0.6 + r() * 0.3), y: Y + 0.25, rot: r() * 6.28, s: 0.8, seed: sd() });
      if (r() < 0.35) L.push({ t: 'drying_tray', at: F.P(0.3 + r() * 0.4, 1.3), y: Y, rot: r() * 6.28, seed: sd() });
      if (r() < 0.3) L.push({ t: 'chickens', at: F.P(r(), 1.8), y: Y, rot: r() * 6.28, seed: sd() });
    }
    if (r() < 0.45) L.push({ t: 'ladder', at: F.P(0.05, 0.4), y: Y, rot: F.rot, seed: sd() });
    if (r() < 0.35) L.push({ t: 'basket', at: F.P(0.05 + r() * 0.9, 0.8), y: Y, rot: r() * 6.28, n: 2, seed: sd() });
  };
  HOUSES.forEach(dressed);
  // the yards: a haystack, firewood, a rack with the robes of the household, hens, a well in every third
  YARDS.forEach((y, i) => {
    const q = y.rect, cx = (q[0] + q[2]) / 2, cz = (q[1] + q[3]) / 2;
    if (r() < 0.5) L.push({ t: 'haystack', at: [q[0] + 1.3, cz], y: 0 });
    if (r() < 0.6) L.push({ t: 'firewood', at: [q[2] - 1.0, cz - 0.7], y: 0, rot: Math.PI / 2, len: 2, seed: sd() });
    if (r() < 0.5) L.push({ t: 'chickens', at: [cx + (r() - 0.5) * 3, cz + (r() - 0.5) * 2], y: 0, rot: r() * 6.28, seed: sd() });
    if (r() < 0.4) L.push({ t: 'wash_line', at: [cx, cz + 1.2], y: 1.6, rot: 0, len: 4, pole: true, emb: [0.3, 0.3], seed: sd() });
    if (i % 3 === 0) L.push({ t: 'well', at: [cx + 1.2, cz + 0.3], y: 0, kind: 'windlass', mat: 'granite_grey', seed: sd() });
    if (r() < 0.3) L.push({ t: 'drying_tray', at: [cx - 1.5, cz - 1.2], y: 0, rot: r() * 6.28, seed: sd() });
  });
  // the pilgrims' plaza before the gate: stalls round its edge facing in, a handcart, benches
  const plaza = [];
  for (const sx of [-1, 1]) for (const [z, g] of [[133.5, ['bolts', 'pottery']], [138, ['basket', 'produce']], [142.5, ['heap', 'greens']], [147, ['bread', 'baskets']]]) {
    L.push({ t: 'stall', at: [sx * 14.6, z], y: 0.02, rot: -sx * Math.PI / 2, w: 2.5 + r() * 0.5, d: 1.1, awning: pick(['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_red']), goods: g, seed: sd() });
    plaza.push([sx * 12.4, z + 0.3]);
  }
  for (const sx of [-1, 1]) { L.push({ t: 'bench', at: [sx * 7.6, 149.5], y: 0.02, rot: Math.PI / 2, seed: sd() }); L.push({ t: 'handcart', at: [sx * 9, 139], y: 0.02, rot: sx * 0.4, load: pick(['baskets', 'crates', 'sacks']), seed: sd() }); }
  // beasts: donkeys in carts and with packs on the approach and the street, dogs, an ox cart, goats
  L.push({ t: 'cart', kind: 'two', beast: 'donkey', load: 'sacks', at: [-9, 170], y: 0, rot: 0.15, seed: 5 });
  L.push({ t: 'cart', kind: 'two', beast: 'donkey', load: 'barrels', at: [30, 155], y: 0, rot: Math.PI / 2, seed: 6 });
  L.push({ t: 'cart', kind: 'two', beast: 'ox', load: 'hay', at: [-48, 154.5], y: 0, rot: -Math.PI / 2, seed: 7 });
  for (const [x, z] of [[-26, 156.5], [52, 153.5], [4.6, 180]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot: r() * 6.28, seed: sd() });
  for (let k = 0; k < 14; k++) L.push({ t: 'animal', kind: r() < 0.8 ? 'dog' : 'cat', at: [-80 + r() * 160, 151.5 + r() * 7], y: 0, rot: r() * 6.28, seed: sd() });
  for (let k = 0; k < 5; k++) L.push({ t: 'animal', kind: 'goat', at: [-70 + r() * 140, 192 - 14 + r() * 3], y: 0, rot: r() * 6.28, seed: sd() });
  for (let k = 0; k < 12; k++) L.push({ t: 'chickens', at: [-80 + r() * 160, 152 + r() * 6], y: 0, rot: r() * 6.28, seed: sd() });
  // the street's own furniture: wells, benches under the eaves, carts waiting, a rack of tools at the smith's
  for (let x = -80; x < 80; x += 18 + r() * 10) { if (Math.abs(x) < 20) continue; L.push({ t: 'bench', at: [x, r() < 0.5 ? 152.6 : 157.4], y: 0, rot: 0, seed: sd() }); }
  // the monastery: lanterns under the eaves of the halls, and before each range's door its trade's clutter
  for (const [name, a] of Object.entries(AXIS)) {
    const front = name === 'shanmen' || name === 'tianwang' ? [a[3], a[1]] : [a[3]], hwid = (a[2] - a[0]) / 2;
    for (const z of front) for (const sx of [-1, 1]) L.push({ t: 'hang_lantern', at: [sx * Math.min(hwid - 0.6, 4.2), z + (z === a[3] ? 0.4 : -0.4)], y: 0.02 + PLAT[name] + HGT[name] - 1.7, rot: 0, kind: 'paper', seed: 3 });
  }
  for (const q of RANGES) {
    const e = q.front === 'e', cz = (q.rect[1] + q.rect[3]) / 2, ex = e ? q.rect[2] + 1.0 : q.rect[0] - 1.0, out = e ? 1 : -1, rt = e ? Math.PI / 2 : -Math.PI / 2, len = q.rect[3] - q.rect[1];
    L.push({ t: 'hang_lantern', at: [ex - out * 0.5, cz], y: 0.37 + 2.7, rot: rt, kind: 'paper', seed: 4 });
    L.push({ t: 'bench', at: [ex + out * 0.6, cz + len * 0.3], y: 0.02, rot: Math.PI / 2, seed: sd() });
    L.push({ t: 'pot', kind: 'glazed_jar', at: [ex + out * 0.3, cz - len * 0.3], y: 0.02, rot: r() * 6.28, s: 1, seed: sd() });
    if (q.kind === 'kitchen' || q.kind === 'refectory') { for (let k = 0; k < 3; k++) L.push({ t: 'firewood', at: [ex + out * 0.8, cz - len * 0.35 + k * 1.2], y: 0.02, rot: rt, len: 1.6, seed: sd() }); L.push({ t: 'rain_tub', at: [ex + out * 1.0, cz + len * 0.35], y: 0.02, rot: 0, seed: sd() }); L.push({ t: 'barrel', at: [ex + out * 0.9, cz + len * 0.25], y: 0.02, rot: 0.1, n: 2, seed: sd() }); }
    if (q.kind === 'guest') { L.push({ t: 'tea_table', at: [ex + out * 1.6, cz], c: [ex + out * 1.6, cz], r: 1.0, y: 0.02, rot: rt, seed: sd() }); }
  }
  const people = [];
  const stand = (p) => people.push(p);
  // gather by tile
  const tiles = new Map(), add = (e) => { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); };
  L.forEach(add); void stand; void plaza;
  return { tiles, plaza, add };
}

export async function town() {
  const rand = rng(1600), P = [], A = [];
  const robeMonk = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.7 ? 'cloth_grey' : 'cloth_ochre', cloth2: 'cloth_ochre', over: 'sash', skin: 'skin_medium', hat: 'none', hair: 'shaven', beard: false, feet: 'shod', ...o });
  const man = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'sash', skin: 'skin_medium', hat: rand() < 0.5 ? 'cap' : 'none', cap: 'ming', hair: 'netknot', beard: rand() < 0.3, feet: 'shod', ...o });
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_ochre', 'cloth_maroon', 'cloth_green'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'collar', skin: 'skin_light', hat: 'none', hair: 'bun', feet: 'shod', h: 0.94, ...o });
  // the training hall: monks standing in the floor's pits in their stance, staff in hand, facing the Buddha (north)
  {
    const r = AXIS.qianfo, X0 = r[0] + 0.9, X1 = r[2] - 0.9, sx = (X1 - X0 - 5) / 7, pz0 = r[1] + 7.0, sz = (r[3] - 0.3 - 2.0 - pz0) / 5, yF = 0.02 + PLAT.qianfo + 0.05;
    const px = (i) => X0 + 2.5 + i * sx;
    for (const [i, j] of [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [1, 3], [3, 3], [5, 3], [6, 3], [2, 4], [4, 4]]) robeMonk([px(i), pz0 + j * sz], yF, 0, { carry: 'staff', len: 2.0, arms: 'staff', cloth: 'cloth_grey', over: 'none', legs: 'hose' });
    robeMonk([0, r[1] + 8.5], yF + 0.14, Math.PI, { pose: 'cross', over: 'cloak', cloth2: 'cloth_ochre' });            // the master, seated, facing them
  }
  // the Mahavira Hall: monks kneeling on the cushions before the altar at the hour of the recitation, the abbot's attendant at the drum
  {
    const r = AXIS.mahavira, y = 0.02 + PLAT.mahavira + 0.05, cx = 0;
    for (let rr = 0; rr < 2; rr++) for (let k = 0; k < 3; k++) if (rand() < 0.95) robeMonk([cx - 4.5 + k * 1.5, r[1] + 8.6 + rr * 1.1 + 0.1], y + 0.12, 0, { pose: 'kneel', arms: 'pray', over: 'cloak', cloth2: 'cloth_ochre' });
  }
  // the Dharma Hall: two monks at the reading tables
  { const r = AXIS.fatang, y = 0.02 + PLAT.fatang + 0.05; for (const s of [-1, 1]) robeMonk([s * 4.2 + 0.0, r[1] + 5.6 - 1.4], y, 0, { pose: 'stand', arms: 'hang' }); }
  // a monk in his cell, cross-legged on the rush cushion
  { const r = CELL.rect, y = 0.37 + 0.05; robeMonk([(r[0] + r[2]) / 2 + 1.6, r[3] - 2.4], y + 0.02, Math.PI, { pose: 'cross', over: 'none' }); }
  // the courts: monks sweeping, carrying water and wood, drilling with the staff in the court before the training hall; pilgrims at the censers
  for (let k = 0; k < 7; k++) robeMonk([-8 + k * 2.6, -66 + (k % 2) * 2.2], 0.02, (k % 3 - 1) * 0.5, { carry: 'staff', len: 2.0, arms: 'staff', over: 'none', legs: 'hose' });
  for (const [x, z] of [[-12, 70], [14, 52], [9, 24], [-9, 12], [-20, -38], [18, -42]]) robeMonk([x, z], 0.02, rand() * 6.28, { carry: 'broom', arms: 'sweep' });
  for (const [x, z] of [[-7, 100], [10, 66], [-27, 26], [6, -16]]) robeMonk([x, z], 0.02, rand() * 6.28, { carry: 'pole', arms: 'pole' });
  for (const [k, px] of [-9, -6.2, 6.2, 9].entries()) robeMonk([px, 93.6], 0.02 + PLAT.tianwang + 0.05 - 0.02, Math.PI * (k % 2), { pose: 'talk' });
  for (const [x, z, face] of [[5.9, 105.2, Math.PI / 2], [5.9, 106.4, Math.PI / 2], [5.9, 62.4, Math.PI / 2], [5.9, 22.4, Math.PI / 2]]) { const w = rand() < 0.5; (w ? woman : man)([x, z], 0.04, face, { pose: 'pray', arms: 'pray' }); }
  for (let k = 0; k < 22; k++) {
    const side = rand() < 0.5 ? -1 : 1, x = side * (6 + rand() * 40), z = 70 + rand() * 50;
    const r = rand(), at = [x, z];
    if (r < 0.45) man(at, 0.04, rand() * 6.28); else if (r < 0.8) woman(at, 0.04, rand() * 6.28); else man(at, 0.04, rand() * 6.28, { pose: 'talk' });
  }
  // the village and the plaza: static people near the arrival — vendors at the stalls, pilgrims buying incense and praying toward the gate,
  // women at the wells, children, old men on the benches, a porter and the shop keepers at their doors
  const fl = frontLife(), Q = [];
  const q = (p) => { Q.push(p); fl.add(p); };
  const mk = (kind, at, y, rot, o = {}) => { const n = P.length; kind(at, y, rot, o); q(P.pop()); void n; };
  const child = (at, rot, o = {}) => mk(rand() < 0.5 ? man : woman, at, 0, rot, { h: 0.62, hat: 'none', hair: 'bun', ...o });
  for (const sx of [-1, 1]) for (const z of [133.5, 138, 142.5, 147]) mk(rand() < 0.5 ? man : woman, [sx * 15.9, z + 0.2], 0.02, sx * Math.PI / 2, { pose: 'stand', arms: 'hang' });   // the sellers behind their tables
  for (let k = 0; k < 18; k++) { const x = (rand() < 0.5 ? -1 : 1) * (2 + rand() * 9), z = 131 + rand() * 20; mk(rand() < 0.45 ? man : woman, [x, z], 0.02, rand() * 6.28, rand() < 0.3 ? { pose: 'talk' } : rand() < 0.2 ? { pose: 'pray', arms: 'pray' } : {}); }
  for (let k = 0; k < 4; k++) mk(robeMonk, [(rand() - 0.5) * 12, 130.5 + rand() * 3], 0.02, Math.PI * rand(), { pose: 'talk' });
  for (let k = 0; k < 4; k++) child([(rand() - 0.5) * 14, 134 + rand() * 14], rand() * 6.28);
  for (let k = 0; k < 26; k++) { const x = -82 + rand() * 164; if (Math.abs(x) < 3) continue; mk(rand() < 0.5 ? man : woman, [x, 152.8 + rand() * 4.4], 0, rand() * 6.28, rand() < 0.2 ? { pose: 'talk' } : rand() < 0.15 ? { carry: 'pole', arms: 'pole' } : {}); }
  for (let k = 0; k < 10; k++) child([-70 + rand() * 140, 153 + rand() * 4], rand() * 6.28);
  for (let k = 0; k < 14; k++) mk(rand() < 0.5 ? man : woman, [(rand() < 0.5 ? -1 : 1) * (1 + rand() * 3.5), 160 + rand() * 28], 0, rand() < 0.5 ? 0 : Math.PI, rand() < 0.2 ? { carry: 'basket' } : {});
  // each shop keeper stands or sits at his door (a third of the shops), a woman sweeps before every fifth house
  HOUSES.forEach((h, i) => {
    const F = frontOf(h);
    if (h.kind === 'shop' && rand() < 0.4) mk(rand() < 0.6 ? man : woman, F.P(0.3 + rand() * 0.4, 1.5), 0, Math.atan2(-F.o[0], -F.o[1]), { pose: rand() < 0.5 ? 'stand' : 'talk' });
    else if (i % 5 === 0) mk(woman, F.P(0.2 + rand() * 0.6, 1.6), 0, rand() * 6.28, { carry: 'broom', arms: 'sweep' });
  });
  // the yards: the washing woman squatting at the tub, a man chopping wood
  YARDS.forEach((y, i) => { if (i % 4 === 0) mk(woman, [(y.rect[0] + y.rect[2]) / 2 - 0.8, (y.rect[1] + y.rect[3]) / 2 + 0.5], 0, rand() * 6.28, { pose: 'squat' }); });
  const lifePlan = base('shaolin-people', 'life', [...P, ...A]);
  const tiles = [...fl.tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`shaolin-village-life-${k}`, 'life', list), center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
  return [base('shaolin-village', 'shaolin', village()), lifePlan, ...tiles];
}
