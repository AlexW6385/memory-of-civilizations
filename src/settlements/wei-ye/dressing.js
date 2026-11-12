// Ye's streets and edges (docs/settlements/wei-ye.md §6, §6.1): what fills the wide places of the plan — the avenue with its kerbs, its royal way and the booths
// along the ward walls; the ward gates with their boards and benches; the market's cross lanes with their stalls; the wall's top with banners, braziers and
// drums; the granary and barracks compound north-east of the offices; the river's piers with ferries, skiffs and barges; the farmsteads outside the gates; and
// the beasts, carts and still figures of the street (style `life`). Pure data; positions come from layout.js.
import { RADIUS, WALL, CITY_WALL, AVENUE, AVENUE_Z, ROAD, GATES_S, GATES_N, GATE_W, WARDS, WARD_WALL, MARKET, PALACE, riverZ, RIVER, cityWalls, FARMS } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];
const AWN = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_green'];
const GOODS = [['cloth_red', 'cloth_ochre', 'cloth_green', 'wicker'], ['pottery_dark', 'terracotta', 'glaze_green', 'wicker'], ['sacking', 'wicker', 'cloth_ochre'], ['bamboo_culm', 'wood_ochre', 'lacquer_red'], ['hide_tan', 'hide_brown', 'hide_grey']];
const P = (kind, x, z, o = {}) => ({ t: 'wei_prop', kind, at: [x, z], ...o });

function walledRect(rect, th, h, mat, gates) {
  const [x0, z0, x1, z1] = rect, E = [];
  const gaps = (side) => gates.filter((g) => g.side === side).map((g) => ({ at: g.c - ((side === 'n' || side === 's') ? x0 : z0), w: g.w }));
  E.push({ t: 'han_wall', a: [x0, z0], b: [x1, z0], th, h, mat, gaps: gaps('n') }, { t: 'han_wall', a: [x0, z1], b: [x1, z1], th, h, mat, gaps: gaps('s') },
    { t: 'han_wall', a: [x0, z0], b: [x0, z1], th, h, mat, gaps: gaps('w') }, { t: 'han_wall', a: [x1, z0], b: [x1, z1], th, h, mat, gaps: gaps('e') });
  for (const g of gates) {
    const ax = g.side === 'n' || g.side === 's';
    const c = g.side === 'n' ? [g.c, z0] : g.side === 's' ? [g.c, z1] : g.side === 'w' ? [x0, g.c] : [x1, g.c];
    E.push({ t: 'han_gate', c, axis: ax ? 'x' : 'z', th, h, n: 1, pw: g.w - 2, ph: Math.min(4, h - 1), mat });
  }
  return E;
}

/** The avenue, the Zhongyang road and the ward gates: kerbs and the royal way, booths and goods along the wards' north wall, boards and benches at every gate. */
export function streetElements() {
  const E = [], r = rng(515);
  // kerbs of dressed stone along both edges of the avenue and the road; the royal way (the middle of the avenue) paved
  for (const z of [AVENUE[1], AVENUE[3] - 0.5]) E.push({ t: 'floor', rect: [AVENUE[0] + 6, z, AVENUE[2] - 6, z + 0.5], y: 0.03, mat: 'bluestone', th: 0.3 });
  E.push({ t: 'floor', rect: [AVENUE[0] + 6, AVENUE_Z - 3.5, AVENUE[2] - 6, AVENUE_Z + 3.5], y: 0.025, mat: 'brick_paving', th: 0.3 });
  for (const x of [ROAD[0], ROAD[2] - 0.5]) E.push({ t: 'floor', rect: [x, ROAD[1] + 10, x + 0.5, ROAD[3] - 4], y: 0.03, mat: 'bluestone', th: 0.3 });
  E.push({ t: 'floor', rect: [-3.5, ROAD[1] + 10, 3.5, ROAD[3] - 4], y: 0.025, mat: 'brick_paving', th: 0.3 });
  // along the wards' north wall (the street strip south of the avenue): booths of the trades, timber, jars, hitching rails, benches
  const wz = WARDS[0][1] - 2.4;
  let k = 0;
  for (let x = -122; x <= 122; x += 8.5) {
    if (Math.abs(x) < 22 || (x > -128 && x < -118) || (x > -22 && x < -14) || (x > 14 && x < 22) || (x > 118 && x < 128)) continue;
    const q = k++ % 6;
    if (q === 0 || q === 3) E.push(P('stall', x, wz, { cloth: pick(r, AWN), goods: pick(r, GOODS), seed: Math.floor(r() * 99), w: 2.6 + r() * 0.8 }));
    else if (q === 1) E.push(P('lumber', x, wz - 0.4, { yaw: Math.PI / 2 * (r() < 0.5 ? 0 : 1) }));
    else if (q === 2) E.push(P('jars', x, wz - 0.3, { seed: Math.floor(r() * 99), n: 4 + Math.floor(r() * 3) }));
    else if (q === 4) E.push(P('rail', x, wz - 0.4, { len: 3.4 }));
    else E.push(P('bench', x, wz - 0.3, { len: 2.4 }));
  }
  // the avenue's edges: lamp trees and boards where the offices stand, wells, mounting blocks
  for (let x = -228; x <= 228; x += 24) {
    if (Math.abs(x) < 14) continue;
    E.push(P('lamp', x, AVENUE[3] - 1.2)); if (r() < 0.6) E.push(P('block', x + 4, AVENUE[3] - 1.2));
  }
  for (const x of [-110, -52, 52, 112, 170, -180]) E.push(P('well', x, AVENUE[3] - 2.8));
  // the road to the palace: guards' racks and a drum, the officials' hitching rails at the palace gate
  for (const sg of [-1, 1]) { E.push(P('rail', sg * 14, 28, { len: 4, yaw: Math.PI / 2 })); E.push(P('board', sg * 12, 7, { yaw: Math.PI })); }
  // the ward gates: the ward's drum (it marks the closing of the gates), a board of the ward's rules and a bench on the lane side of each
  for (const w of WARDS) {
    const z0 = w[1], lc = [z0 + WARD_WALL + 24.55, z0 + WARD_WALL + 72.85];
    for (const c of lc) for (const [side, x] of [['w', w[0] - 1.1], ['e', w[2] + 1.1]]) {
      const s = side === 'w' ? -1 : 1;
      E.push(P('board', x + s * 0.2, c - 3.0, { yaw: s > 0 ? -Math.PI / 2 : Math.PI / 2 }));
      E.push(P('bench', x + s * 0.4, c + 3.0, { yaw: Math.PI / 2, len: 1.8 }));
    }
  }
  return E;
}

/** The market's cross lanes: stalls on both sides, jars, wells, a banner at each gate. */
export function marketElements() {
  const E = [], r = rng(631), [x0, z0, x1, z1] = MARKET, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const row = (axis, c0, a0, a1) => {
    for (let a = a0; a <= a1; a += 6.4) {
      if (Math.abs(a - (axis === 'x' ? cx : cz)) < 11) continue;
      for (const s of [-1, 1]) {
        const off = 5.6 * s, x = axis === 'x' ? a : c0 + off, z = axis === 'x' ? c0 + off : a;
        const q = r();
        if (q < 0.6) E.push(P('stall', x, z, { cloth: pick(r, AWN), goods: pick(r, GOODS), seed: Math.floor(r() * 99), w: 2.4 + r() * 0.8, yaw: axis === 'x' ? 0 : Math.PI / 2 }));
        else if (q < 0.8) E.push(P('jars', x, z, { seed: Math.floor(r() * 99), n: 5 }));
        else E.push(P('bench', x, z, { len: 2.4, yaw: axis === 'x' ? 0 : Math.PI / 2 }));
      }
    }
  };
  row('x', cz, x0 + 8, x1 - 8); row('z', cx, z0 + 8, z1 - 8);
  for (const [x, z] of [[cx - 16, cz - 16], [cx + 16, cz + 16]]) E.push(P('well', x, z));
  for (const [x, z, dx, dz] of [[cx, z0 + 5.5, 9, 0], [cx, z1 - 5.5, 9, 0], [x0 + 5.5, cz, 0, 9], [x1 - 5.5, cz, 0, 9]]) E.push(P('flag', x - dx, z - dz, { h: 6, cloth: 'cloth_red' }), P('flag', x + dx, z + dz, { h: 6, cloth: 'cloth_black' }));
  return E;
}

/** The wall's top: banners, braziers, drums and halberd racks at the gates, watch huts of straw, a pile of throwing stones. */
export function wallElements() {
  const E = [], r = rng(907), y = CITY_WALL.h, gates = [...GATES_S.map((x) => [x, WALL.s]), ...GATES_N.map((x) => [x, WALL.n]), [WALL.e, AVENUE_Z], [WALL.w, AVENUE_Z]];
  const nearGate = (x, z) => gates.some(([gx, gz]) => Math.hypot(gx - x, gz - z) < GATE_W / 2 + 8);
  let k = 0;
  for (const { a, b } of cityWalls()) {
    const alongX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]), len = alongX ? b[0] - a[0] : b[1] - a[1];
    const inner = alongX ? (a[1] > 0 ? -3.6 : 3.6) : (a[0] > 0 ? -3.6 : 3.6);
    for (let t = 14; t < len - 10; t += 22) {
      const x = alongX ? a[0] + t : a[0] + inner, z = alongX ? a[1] + inner : a[1] + t;
      if (nearGate(x, z) || Math.hypot(x, z) > RADIUS - 34) continue;
      const q = k++ % 4, yaw = alongX ? 0 : Math.PI / 2;
      if (q === 0) E.push(P('flag', x, z, { y, h: 6.6, cloth: r() < 0.5 ? 'cloth_red' : 'cloth_black', long: true, yaw }));
      else if (q === 1) E.push(P('brazier', x, z, { y }));
      else if (q === 2) E.push(P('hut', x, z, { y }));
      else E.push(P('rack', x, z, { y, n: 6, yaw: yaw + Math.PI / 2 }));
    }
  }
  for (const [gx, gz] of gates) {
    const alongX = gz === WALL.s || gz === WALL.n;
    const o = GATE_W / 2 + 5;
    for (const sg of [-1, 1]) {
      const x = alongX ? gx + sg * o : gx + (gx > 0 ? -3.6 : 3.6), z = alongX ? gz + (gz > 0 ? -3.6 : 3.6) : gz + sg * o;
      if (Math.hypot(x, z) > RADIUS - 32) continue;
      E.push(P(sg > 0 ? 'drum' : 'bells', x, z, { y, yaw: alongX ? 0 : Math.PI / 2, n: 5 }));
    }
  }
  return E;
}

/** The granary and barracks compound (the army's stores of a military capital) between the Qili ward and the offices. */
export const COMPOUND = [84, -52, 226, -17];
export function compoundElements() {
  const [x0, z0, x1, z1] = COMPOUND, r = rng(1215), E = walledRect(COMPOUND, 2.0, 4.2, 'earth_wall', [{ side: 'w', c: -35, w: 6 }, { side: 'e', c: -35, w: 6 }]);
  for (const zr of [-44, -33]) for (let x = 97; x < 176; x += 11) E.push(P('granary', x + (r() - 0.5) * 0.6, zr, { w: 4.6, d: 3.6, yaw: 0 }));
  for (const [cx, sd] of [[186, 91], [210, 92]]) E.push({ t: 'han_hall', cx, z1: -22.5, bays: 4, bayW: 4.4, depth: 2, depthW: 3.6, floor: 0.6, base: 0.6, h: 4.0, roof: 'gable', rise: 2.2, overhang: 2.0, ap: 1.2, furnish: 'office', open: [1, 2], seed: sd });
  E.push({ t: 'han_hall', cx: 198, z1: -42, bays: 6, bayW: 4.4, depth: 2, depthW: 3.6, floor: 0.6, base: 0.6, h: 4.0, roof: 'gable', rise: 2.2, overhang: 2.0, ap: 1.2, furnish: 'office', open: [2, 3], seed: 93 });
  E.push({ t: 'floor', rect: [x0 + 1, -38.5, x1 - 1, -36], y: 0.02, mat: 'brick_paving', th: 0.3 });
  E.push(P('well', 180, -30), P('flag', 180, -47, { h: 7, cloth: 'cloth_red', long: true }), P('flag', 214, -47, { h: 7, cloth: 'cloth_black' }));
  for (const [x, z] of [[92, -28], [92, -42], [220, -28], [220, -46]]) E.push(P('brazier', x, z));
  for (const x of [182, 190, 204, 214]) E.push(P('rack', x, -26, { n: 8 }));
  for (const x of [100, 124, 148, 166]) E.push(P('lumber', x, -24.5, {}), P('jars', x + 8, -22, { seed: x, n: 5 }));
  for (const [x, z] of [[160, -48.5], [140, -48.5], [120, -48.5]]) E.push(P('stack', x, z, { r: 1.4 }));
  return E;
}

/** The river's piers, ferries, skiffs, barges, nets drying on poles, washing steps. */
export function riverElements() {
  const E = [], r = rng(1030), y = RIVER.y;
  for (const x of [-60, 90, -170]) {
    const zc = riverZ(x), z0 = zc + 22, z1 = zc + 5;
    E.push({ t: 'floor', rect: [x - 2.4, z1, x + 2.4, z0], y: 0.0, mat: 'timber', th: 0.35 });
    E.push({ t: 'wei_boat', at: [x + 6.5, zc + 10], y, yaw: Math.PI / 2, len: 9, kind: 'ferry' }, { t: 'wei_boat', at: [x - 6.5, zc + 9], y, yaw: Math.PI / 2 + 0.1, len: 8, kind: 'barge' });
    E.push(P('flag', x - 3.6, z0 + 2, { h: 5.5, cloth: 'cloth_red' }), P('brazier', x + 3.6, z0 + 2), P('stack', x + 9, z0 + 4, { r: 1.2 }), P('jars', x - 9, z0 + 3, { seed: x, n: 6 }));
  }
  for (let k = 0; k < 9; k++) {
    const x = -200 + k * 48 + (r() - 0.5) * 18, zc = riverZ(x), z = zc + (r() - 0.5) * 14;
    if ([-60, 90, -170].some((p) => Math.abs(x - p) < 14)) continue;
    E.push({ t: 'wei_boat', at: [x, z], y, yaw: r() * 6.28, len: 4.6 + r() * 2.4, kind: k % 3 === 2 ? 'barge' : 'skiff' });
  }
  // nets on poles along the south bank
  for (let x = -190; x < 200; x += 31) { const zc = riverZ(x) + 21 + r() * 2; E.push(P('lumber', x, zc, { yaw: 0 })); }
  return E;
}

/** The farmsteads outside the gates (kinds of the lots; see FARMS in layout.js) with their stacks, huts, wells. */
export function farmElements() {
  const E = [], r = rng(1500);
  FARMS.forEach(([x0, z0, x1, z1, front], i) => {
    E.push({ t: 'wei_house', rect: [x0, z0, x1, z1], front, kind: i % 3 === 0 ? 'court' : 'row', seed: 4000 + i * 7, open: i % 2 === 0 });
    const fz = front === 'n' ? z0 - 5 : z1 + 5;
    E.push(P('stack', x1 + 4, (z0 + z1) / 2, { r: 1.2 + r() * 0.5 }), P('stack', x1 + 7.5, (z0 + z1) / 2 + 3, { r: 1.0 }), P('well', x0 - 3, fz));
    if (i % 2) E.push(P('hut', x1 + 12, (z0 + z1) / 2 - 4));
  });
  return E;
}

/** Beasts, carts and still figures of the street (style `life`, instanced). */
export function lifeElements() {
  const r = rng(777), L = [], y = 0;
  const [mx0, mz0, mx1, mz1] = MARKET, cx = (mx0 + mx1) / 2, cz = (mz0 + mz1) / 2;
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(r() * 1e9), dress: 'robe', top: '', cloth: 'cloth_brown', cloth2: 'cloth_white', skin: 'skin_light', hat: 'cap', hair: 'topknot', hairMat: 'hair_dark', feet: 'shod', carry: 'none', pose: 'stand', over: 'sash', ...o });
  // the Hu merchants' caravan in the market's west lane: camels laden, the drivers beside them
  for (let k = 0; k < 4; k++) {
    const x = mx0 + 14 + k * 3.6, z = cz - 2.6 + (k % 2) * 4.4;
    L.push({ t: 'animal', kind: 'camel', at: [x, z], y, rot: Math.PI / 2 + (r() - 0.5) * 0.3, seed: 10 + k, graze: false });
    if (k % 2 === 0) fig([x + 1.6, z], -Math.PI / 2, { dress: 'tunic', legs: 'hose', hat: 'brim', cloth: pick(r, ['cloth_green', 'cloth_red', 'cloth_blue']), over: 'belt', beard: 1, hair: 'short' });
  }
  // carts with their oxen by the gates and the compound, beasts at the hitching rails
  const spots = [[-8, 160, 0], [10, 165, Math.PI], [-120, 168, 0.2], [124, 168, -0.2], [-40, 42, Math.PI / 2], [60, 43.6, Math.PI / 2], [150, 20, Math.PI / 2], [-190, 16, -Math.PI / 2], [150, -26, 0], [166, -40, Math.PI], [112, -26.5, -Math.PI / 2], [-70, 12, Math.PI / 2], [-20, 16, 0]];
  spots.forEach(([x, z, rot], i) => L.push({ t: 'cart', kind: i % 4 === 3 ? 'four' : 'two', beast: i % 3 === 0 ? 'horse' : 'ox', load: pick(r, ['sacks', 'barrels', 'hay', 'sacks']), at: [x, z], y, rot, seed: 20 + i }));
  for (const [x, z, k] of [[-14, 28.6, 'horse'], [14, 28.6, 'horse'], [-62, 41, 'donkey'], [100, 41.5, 'donkey'], [-14.7, 38, 'horse'], [20, 15, 'donkey']]) L.push({ t: 'animal', kind: k, at: [x, z], y, rot: r() * 6.28, seed: Math.floor(r() * 99) });
  for (let k = 0; k < 18; k++) { const x = -225 + r() * 450, z = pick(r, [22, 29, 44, 166, 160, 14]) + r() * 3; L.push({ t: 'animal', kind: pick(r, ['dog', 'dog', 'pig', 'donkey']), at: [x, z], y, rot: r() * 6.28, seed: Math.floor(r() * 99) }); }
  for (let k = 0; k < 30; k++) { const z = pick(r, [74.4, 122.4]), x0 = WARDS[Math.floor(r() * 3)][0], x = x0 + 8 + r() * 85; L.push({ t: 'chickens', kind: pick(r, ['hen', 'hen', 'duck', 'goose']), at: [x, z + (r() - 0.5) * 1.6], y, rot: r() * 6.28, seed: Math.floor(r() * 99), n: 4 }); }
  // stall keepers and idlers: sellers behind the stalls of the market and the avenue's booths
  for (let k = 0; k < 24; k++) {
    const side = k % 2 ? 1 : -1, a = mx0 + 14 + (k >> 1) * 7.5;
    fig([a, cz + side * 5.6 + side * 1.0], side > 0 ? Math.PI : 0, { cloth: pick(r, ['cloth_brown', 'cloth_ochre', 'cloth_indigo', 'cloth_green']), pose: 'stand', hat: pick(r, ['cap', 'none']), over: 'belt' });
  }
  for (let k = 0; k < 14; k++) fig([-110 + k * 17, 45.2 + (r() - 0.5)], 0, { cloth: pick(r, ['cloth_brown', 'cloth_grey', 'cloth_indigo']), hat: pick(r, ['cap', 'straw', 'none']), over: 'belt' });
  // the boatmen at the piers
  for (const x of [-60, 90, -170]) { const zc = riverZ(x); fig([x + 1.2, zc + 20], Math.PI, { dress: 'trousers', top: 'bare', hat: 'straw', feet: 'bare', over: 'none', cloth: 'cloth_brown' }); fig([x - 1.4, zc + 16], Math.PI, { dress: 'trousers', hat: 'straw', feet: 'bare', over: 'none' }); }
  void PALACE; void ROAD;
  return L;
}
