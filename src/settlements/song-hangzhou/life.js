// Southern Song Lin'an — the life's plans for the town (docs/settlements/song-hangzhou.md §18–19):
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
import { dwellingSpec, dwellingRoomRect } from './dwellings.js';
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
  // Suzhou's standard: many fronts open to walk into. Spread over the city: the Imperial Way first (sorted by richness), then the canal streets and the lanes,
  // never two chosen lots abutting (so that the street keeps its rhythm of open and closed fronts)
  const cx = (l) => (l.rect[0] + l.rect[2]) / 2, cz = (l) => (l.rect[1] + l.rect[3]) / 2;
  const apart = (l, m) => ![...used].some((o) => Math.hypot(cx(o) - cx(l), cz(o) - cz(l)) < m);
  const takeSpread = (pred, n, sort, gap) => { const c = all.filter((l) => !used.has(l) && inDisc(l) && pred(l)); c.sort(sort); const out = []; for (const l of c) { if (out.length >= n) break; if (!apart(l, gap)) continue; out.push(l); used.add(l); } return out; };
  const core = (l) => Math.hypot(cx(l) - 28, cz(l) + 120);
  const near = (a, b) => core(a) - core(b);
  CHOSEN = {
    winehouse: take((l) => l.shop && w(l) >= 8.5 && d(l) >= 14 && nearIW(l), 5, iw),
    teahouse: take((l) => l.shop && w(l) >= 8 && d(l) >= 8, 9, iw),
    shop: takeSpread((l) => l.shop && w(l) >= 6 && d(l) >= 6.5 && nearIW(l), 14, iw, 24),
    house: [],
  };
  // shops off the Way: the canal streets' and lanes' (trade by the layout's mix), nearest the core first
  CHOSEN.shop.push(...takeSpread((l) => l.shop && w(l) >= 6 && d(l) >= 6.5 && !nearIW(l) && core(l) < 330, 12, near, 30));
  CHOSEN.house = takeSpread((l) => !l.shop && w(l) >= 6.5 && d(l) >= 7 && core(l) < 300, 12, (a, b) => (b.storeys || 1) - (a.storeys || 1) || near(a, b), 34);
  // the fronts nearest the arrival (-110, 138, the stair's foot) come first in the visitor's reach: every lot of the river road within 125 m that is big enough
  // (the wide ones a tea house or a wine house, the rest shops and houses), so that there are fronts to walk into where one arrives
  const AR = [-110, 138], dAr = (l) => { const q = frontOf(l).P(0.5, 0); return Math.hypot(q[0] - AR[0], q[1] - AR[1]); };
  let nTea = 0, nWine = 0;
  for (const l of all.filter((o) => !used.has(o) && dAr(o) < 125 && w(o) >= 6 && d(o) >= 6.5).sort((a, b) => dAr(a) - dAr(b))) {
    used.add(l);
    if (l.shop && w(l) >= 8.5 && d(l) >= 14 && nWine < 1) { nWine++; CHOSEN.winehouse.push(l); }
    else if (l.shop && w(l) >= 8 && d(l) >= 8 && nTea < 2) { nTea++; CHOSEN.teahouse.push(l); }
    else if (l.shop) CHOSEN.shop.push(l);
    else CHOSEN.house.push(l);
  }
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
  const dwSet = new Set(dwellingLots());
  for (const l of lots()) {
    if (!l.shop || dwSet.has(l)) continue;   // (a dwelling's shop has its own goods inside, and no apron across its door)
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


// ── the dwellings of the lanes (dwellings.js, docs §28): lots beyond the arrival's first 120 m built as enterable, furnished houses ──
let DW = null;
/** The lots built as hz_dwelling: houses and workshops of the lanes and the canal streets, spread about 19 m apart, none of the lots chosen above, none within 125 m of the arrival. */
export function dwellingLots() {
  if (DW) return DW;
  const ch = interiorLots(), taken = new Set(Object.values(ch).flat()), river = new Set(riverTeaHouses()), AR = [-110, 138];
  const cx = (l) => (l.rect[0] + l.rect[2]) / 2, cz = (l) => (l.rect[1] + l.rect[3]) / 2, rand = rng(1211);
  const ok = (l) => { const F = frontOf(l); return !taken.has(l) && !river.has(l) && F.L >= 5.6 && F.D >= 7.5 && Math.hypot(cx(l) - AR[0], cz(l) - AR[1]) > 125 && Math.hypot(cx(l), cz(l)) < RADIUS - 60 && !nearIW(l); };
  const c = lots().filter(ok).map((l) => [rand(), l]).sort((a, b) => a[0] - b[0]).map((q) => q[1]);
  DW = [];
  for (const l of c) { if (DW.length >= 90) break; if (DW.some((o) => Math.hypot(cx(o) - cx(l), cz(o) - cz(l)) < 19)) continue; if (Object.values(ch).flat().some((o) => Math.hypot(cx(o) - cx(l), cz(o) - cz(l)) < 9)) continue; DW.push(l); }
  // (one lot has a city fixture, a 1.2 m planter, standing across its only doorway: it is left as it was)
  DW = DW.filter((l) => !(Math.abs(l.rect[0] - 77.37) < 0.1 && Math.abs(l.rect[1] + 115.7) < 0.1));
  return DW;
}
const dwSpec = (l) => dwellingSpec({ rect: l.rect, front: l.front, seed: l.seed, shop: !!l.shop });
export function dwellingRooms() { return dwellingLots().map((l, i) => ({ id: `hz-dwelling-${i}`, rect: dwellingRoomRect({ rect: l.rect, front: l.front, seed: l.seed, shop: !!l.shop }), y: LEVEL.street + 0.45, kind: l.shop ? 'shop' : 'house' })); }
/** The furniture of the dwellings, in tiles of 150 m of the street life's style. */
export function dwellingPlans(base) {
  const tiles = new Map(), rooms = dwellingRooms();
  dwellingLots().forEach((l, i) => {
    const r = rooms[i].rect, c = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], k = `${Math.floor(c[0] / 150)},${Math.floor(c[1] / 150)}`;
    if (!tiles.has(k)) tiles.set(k, { els: [], rooms: [] });
    tiles.get(k).els.push({ t: 'hz_dwelling_in', rect: l.rect, front: l.front, y: LEVEL.street, seed: l.seed || i + 1, shop: !!l.shop });
    tiles.get(k).rooms.push(rooms[i]);
  });
  const out = [];
  for (const [k, v] of tiles) { const [i, j] = k.split(',').map(Number); out.push({ ...base(`song-hangzhou-dwellings-${k}`, v.els, 'life'), center: [i * 150 + 75, j * 150 + 75], near: 260, rooms: v.rooms }); }
  return out;
}
export const dwellingShells = () => dwellingLots().map((l) => ({ t: 'hz_dwelling', rect: l.rect, front: l.front, y: LEVEL.street, seed: l.seed, shop: !!l.shop }));
void dwSpec;
