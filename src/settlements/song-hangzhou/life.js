// Southern Song Lin'an — the life's plans for the town (docs/settlements/song-hangzhou.md §15–16):
// the signs and goods of every shop front (shops.js), and the furnished interiors (interiors.js)
// of the lots chosen to be entered: tea houses, wine houses, shops of the Imperial Way, houses.
//
//   import { lifePlans, interiorLots, interiorRooms } from './life.js';
//   town():  plans.push(...lifePlans(base));      // base(id, elements, style) is town.js's own plan maker
//   plan rooms: rooms.push(...interiorRooms());   // the music zones of the interiors (kinds 'teahouse', 'winehouse', 'shop', 'house')
//
// `interiorLots()` says which lots must be built as enterable shells (floor at LEVEL.street + 0.45,
// front open on its side): the town's shells for exactly these lots must leave the room free.
import './shops.js';
import './interiors.js';
import { lots, onImperial, LEVEL, RADIUS } from './ways.js';
import { riverTeaHouses } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** A lot's front: P(t, off) a point at fraction t along it, off out from it; rot turns an object's +z outward; L its width, D its depth. */
export function frontOf(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, n = FR[f], along = f === 'n' || f === 's';
  const P = (t, off) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) + n[1] * off] : [(f === 'e' ? x1 : x0) + n[0] * off, z0 + (z1 - z0) * t]);
  return { P, n, L: along ? x1 - x0 : z1 - z0, D: along ? z1 - z0 : x1 - x0, rot: Math.atan2(n[0], n[1]) };
}
const nearIW = (l) => onImperial(l, frontOf(l).P(0.5, 3));
/** The trade of a shop lot: the layout's own (`l.trade`), else by seed — the Imperial Way's richer mix (silk, tea, books, wine, medicine, lacquer, fans), the lanes' plainer one. */
export function tradeOf(l) {
  if (l.trade) return l.trade;
  const r = rng((l.seed || 1) + 5)();
  const rich = nearIW(l) ? ['silk', 'tea', 'wine', 'books', 'medicine', 'lacquer', 'fans', 'incense', 'silk', 'wine', 'tea', 'flowers'] : ['food', 'wares', 'food', 'tea', 'incense', 'wares', 'flowers', 'silk', 'medicine', 'pawn'];
  return rich[Math.floor(r * rich.length)];
}

let CHOSEN = null;
/** The lots whose insides are furnished: { teahouse: [], winehouse: [], shop: [], house: [] } (lots' own seed/rect). */
export function interiorLots() {
  if (CHOSEN) return CHOSEN;
  const river = new Set(riverTeaHouses()), all = lots().filter((l) => !river.has(l)), rand = rng(1200), used = new Set();
  const inDisc = (l) => { const p = frontOf(l).P(0.5, 0); return Math.hypot(p[0], p[1]) < RADIUS - 40; };
  const take = (pred, n, sort) => { const c = all.filter((l) => !used.has(l) && inDisc(l) && pred(l)); c.sort(sort); const out = c.slice(0, n); out.forEach((l) => used.add(l)); return out; };
  const w = (l) => frontOf(l).L, d = (l) => frontOf(l).D;
  const iw = (a, b) => (nearIW(b) ? 1 : 0) - (nearIW(a) ? 1 : 0) || w(b) - w(a);
  CHOSEN = {
    winehouse: take((l) => l.shop && w(l) >= 8.5 && d(l) >= 14 && nearIW(l), 2, iw),
    teahouse: take((l) => l.shop && w(l) >= 8 && d(l) >= 8, 4, iw),
    shop: take((l) => l.shop && w(l) >= 6 && d(l) >= 6.5 && nearIW(l), 6, iw),
    house: take((l) => !l.shop && w(l) >= 6.5 && d(l) >= 7, 3, (a, b) => (b.storeys || 1) - (a.storeys || 1)),
  };
  void rand;
  for (const l of [...CHOSEN.winehouse, ...CHOSEN.teahouse, ...CHOSEN.shop]) l.trade = l.trade || tradeOf(l);
  CHOSEN.winehouse.forEach((l) => { l.trade = 'wine'; });
  CHOSEN.teahouse.forEach((l) => { l.trade = 'tea'; });
  return CHOSEN;
}
const ELEMENT = { winehouse: 'hz_restaurant', teahouse: 'hz_teahouse', shop: 'hz_imperial_shop', house: 'hz_house' };
const ZONE = { winehouse: 'winehouse', teahouse: 'teahouse', shop: 'shop', house: 'house' };
const inset = (l) => [l.rect[0] + 0.5, l.rect[1] + 0.5, l.rect[2] - 0.5, l.rect[3] - 0.5];

/** Rooms (for the music zones and the sound of a room) of every furnished interior. */
export function interiorRooms() {
  const out = [];
  for (const [k, list] of Object.entries(interiorLots())) list.forEach((l, i) => out.push({ id: `hz-${k}-${i}`, rect: inset(l), y: LEVEL.street + 0.45, kind: ZONE[k] }));
  return out;
}

/** The plans: shop fronts in tiles of 100 m (style 'life'), one plan per interior. base(id, elements, style) is the town's plan maker. */
export function lifePlans(base) {
  const plans = [], tiles = new Map(), chosen = interiorLots(), inside = new Set(Object.values(chosen).flat());
  for (const l of lots()) {
    if (!l.shop) continue;
    const F = frontOf(l), at = F.P(0.5, 0);
    if (Math.hypot(at[0], at[1]) > RADIUS - 20) continue;
    const e = { t: 'hz_shop', at, y: LEVEL.street, rot: F.rot, L: F.L, trade: l.trade || tradeOf(l), seed: (l.seed || 1) + 7, imperial: nearIW(l) };
    void inside;
    const k = `${Math.floor(at[0] / 100)},${Math.floor(at[1] / 100)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  for (const [k, list] of tiles) { const [i, j] = k.split(',').map(Number); plans.push({ ...base(`song-hangzhou-shops-${k}`, list, 'life'), center: [i * 100 + 50, j * 100 + 50], near: 230 }); }
  for (const [kind, list] of Object.entries(chosen)) list.forEach((l, i) => {
    const F = frontOf(l), r = inset(l), c = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
    const p = base(`song-hangzhou-${kind}-${i}`, [{ t: ELEMENT[kind], rect: r, front: l.front, y: LEVEL.street, floor: LEVEL.street + 0.45, seed: l.seed || (i + 1), trade: l.trade }], 'life');
    plans.push({ ...p, center: c, near: 70, rooms: [{ id: `hz-${kind}-${i}`, rect: r, y: LEVEL.street + 0.45, kind: ZONE[kind] }] });
    void F;
  });
  return plans;
}
