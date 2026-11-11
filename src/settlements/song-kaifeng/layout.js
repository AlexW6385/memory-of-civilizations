// Northern Song Bianjing (c. 1120) — the layout (docs/settlements/song-kaifeng.md §2, §11): the Bian
// River east–west with the Rainbow Bridge, the street running north and south from it, the Kaibao
// monastery and the Iron Pagoda to the north-east, the east wall and its water gate on the west, the
// town along the river and the streets, the suburb outside the gate, the farmsteads of the plain
// to the east. Pure data. +x east, +z south.

export const RADIUS = 520;
export const RIVER = { z0: 60, z1: 92, bed: -4, water: -1.6 };
// the Rainbow Bridge: 20 m between its stone abutments, 8.6 m wide, the arch rising 4 m from springings 1 m above the water
export const BRIDGE = { at: [0, 76], span: 20, width: 8.6, spring: -0.6, crown: 4.0, y0: 0.06 };
/** The bridge deck's height at z (the line rainbow_bridge lays its planks on). */
export function bridgeDeck(z) {
  const S = BRIDGE.span / 2, E = S + 0.6, yc = BRIDGE.spring + BRIDGE.crown + 0.79;
  return BRIDGE.y0 + 0.06 + (yc - BRIDGE.y0 - 0.06) * (1 - Math.min(1, Math.abs(z - BRIDGE.at[1]) / E) ** 1.3);
}
export const GATE = { z: -80, rect: [-309, -96, -291, -64] };   // the city gate's platform over the road
export const MONASTERY = [80, -260, 240, -110];
export const PAGODA = [160, -190];
export const WALL_X = -300;
// the open country east of the city: wheat fields, the road and the towpath running on into them, the farmsteads along the roads
export const FIELDS_X = 262;
// the stone-faced banks by the bridge (canal_wall); beyond them the banks are of earth, faced with a timber revetment, and the towpath runs on the north one
export const STONE_BANK = 150;
// the streets (main streets 14 m wide, the others 6–8 m): [x0, z0, x1, z1]; the first six are the shop streets
export const STREETS = [
  [-7, -RADIUS, 7, RIVER.z0], [-7, RIVER.z1, 7, RADIUS], [-RADIUS, RIVER.z0 - 14, RADIUS, RIVER.z0], [-RADIUS, RIVER.z1, RADIUS, RIVER.z1 + 14], [-RADIUS, -84, RADIUS, -76], [-RADIUS, 196, RADIUS, 204],
  [-156, -RADIUS, -148, RIVER.z0 - 14], [146, RIVER.z1 + 14, 154, RADIUS],
  // the cross streets of the quarters
  [-232, -RADIUS, -226, RIVER.z0 - 14], [-82, -RADIUS, -76, RIVER.z0 - 14], [-232, RIVER.z1 + 14, -226, RADIUS], [-82, RIVER.z1 + 14, -76, RADIUS], [78, RIVER.z1 + 14, 84, RADIUS], [226, RIVER.z1 + 14, 232, RADIUS],
  [-RADIUS, -170, 70, -164], [-RADIUS, -300, RADIUS, -294], [-RADIUS, 280, RADIUS, 286], [-RADIUS, 370, RADIUS, 376],
];
export const MAJOR = 6;     // the first MAJOR streets (and the one at z = -167) carry the shops
// the lanes (4 m) through the blocks, to open their middles to houses
export const LANES = [
  [-RADIUS, -42, RADIUS, -38], [-RADIUS, 8, RADIUS, 12], [-RADIUS, -127, 70, -123], [-RADIUS, 148, RADIUS, 152], [-RADIUS, 240, RADIUS, 244], [-RADIUS, 326, RADIUS, 330], [-RADIUS, -234, RADIUS, -230],
  [-44, -RADIUS, -40, RIVER.z0 - 14], [40, -RADIUS, 44, -112], [-192, -RADIUS, -188, RIVER.z0 - 14], [-44, RIVER.z1 + 14, -40, RADIUS], [-122, RIVER.z1 + 14, -118, RADIUS], [112, RIVER.z1 + 14, 116, RADIUS], [186, RIVER.z1 + 14, 190, RADIUS],
];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRiver = (x, z) => z > RIVER.z0 && z < RIVER.z1 && Math.hypot(x, z) < RADIUS - 26;
export const onStreet = (x, z, m = 0) => STREETS.some((s) => inRect(s, x, z, m));
export const onLane = (x, z, m = 0) => LANES.some((s) => inRect(s, x, z, m));
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Which part of the settlement a point lies in: 'city' (inside the wall), 'suburb' (outside the gate, west) or 'country' (east). */
export const zoneOf = (x) => (x < WALL_X - 8 ? 'suburb' : x > FIELDS_X ? 'country' : 'city');
const TRADES = ['cloth', 'grain', 'tea', 'medicine', 'pawn', 'books', 'incense', 'sweets', 'noodles', 'pottery', 'iron', 'oil', 'paper', 'lanterns', 'rope', 'bamboo'];
const TRADES_NEAR = ['cloth', 'tea', 'medicine', 'books', 'incense', 'sweets', 'noodles', 'lanterns', 'paper', 'pawn'];

let LOTS = null, GRID = null;
const rectsMeet = (a, b, m = 0) => a[0] - m < b[2] && a[2] + m > b[0] && a[1] - m < b[3] && a[3] + m > b[1];
/** The building's footprint inside its lot: against the street, `dep` deep, inset `ins` at the sides. */
function footOf(r, front, dep, ins) {
  const [x0, z0, x1, z1] = r;
  if (front === 's') return [x0 + ins, z1 - dep, x1 - ins, z1];
  if (front === 'n') return [x0 + ins, z0, x1 - ins, z0 + dep];
  if (front === 'e') return [x1 - dep, z0 + ins, x1, z1 - ins];
  return [x0, z0 + ins, x0 + dep, z1 - ins];
}
/**
 * Houses fronting the streets and the lanes, by rule (docs/settlements/song-kaifeng.md §11): on the shop streets
 * near the bridge shops of two storeys and one (open fronts), inns, warehouses by the river; behind them
 * and on the lanes tiled houses, further out thatched ones; outside the gate the suburb; in the country
 * farmsteads far apart. Each lot: { rect (the lot), foot (the building), front, kind, storeys, shop, seed,
 * bays, bay, det (0–2: how much detail), trade, street }. kind: shop | wine | tea | inn | warehouse | house | thatch | farm.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1120), placed = new Map();
  const key = (i, j) => i + ',' + j;
  const cells = (r) => { const o = []; for (let i = Math.floor(r[0] / 24); i <= Math.floor(r[2] / 24); i++) for (let j = Math.floor(r[1] / 24); j <= Math.floor(r[3] / 24); j++) o.push(key(i, j)); return o; };
  const free = (r) => !cells(r).some((k) => (placed.get(k) || []).some((o) => rectsMeet(o, r, 0.15)));
  const take = (r) => { for (const k of cells(r)) { if (!placed.has(k)) placed.set(k, []); placed.get(k).push(r); } };
  const ways = [...STREETS.map((r, i) => ({ r, major: i < MAJOR || i === 14, lane: false, i })), ...LANES.map((r, i) => ({ r, major: false, lane: true, i: 100 + i }))];
  const rw = (r) => ways.some((w) => rectsMeet(w.r, r, 0.1));
  const fits = (r) => Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) <= RADIUS - 24;
  const dBridge = (r) => Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2 - 76);
  const clearOfPlaces = (r) => !rectsMeet(MONASTERY, r, 6) && !(r[1] < RIVER.z1 + 2 && r[3] > RIVER.z0 - 2) && !(r[0] < WALL_X + 10 && r[2] > WALL_X - 10) && !(r[0] < GATE.rect[2] + 2 && r[2] > GATE.rect[0] - 2 && r[1] < GATE.rect[3] && r[3] > GATE.rect[1]);
  const inZone = (r) => { const a = zoneOf(r[0]), b = zoneOf(r[2]); return a === b ? a : null; };
  const pickTrade = (d) => { const L = d < 220 ? TRADES_NEAR : TRADES; return L[Math.floor(rand() * L.length)]; };

  for (const w of ways) {
    const s = w.r, horiz = s[2] - s[0] > s[3] - s[1];
    for (const side of [-1, 1]) {
      for (let t = horiz ? s[0] : s[1]; t < (horiz ? s[2] : s[3]);) {
        // a point on the frontage decides the zone and the kind
        const px = horiz ? t + 5 : (side < 0 ? s[0] - 6 : s[2] + 6), pz = horiz ? (side < 0 ? s[1] - 6 : s[3] + 6) : t + 5;
        const zone = zoneOf(px), d = Math.hypot(px, pz - 76);
        let kind, nb, bay = 3.1 + rand() * 0.6, dep, depLot, ins = 0, storeys = 1, q = rand();
        // the river streets: the shops on the river side of the north street face the water; warehouses by the south street's grain wharves
        const riverS = w.i === 3 && side > 0, riverN = w.i === 2 && side < 0;
        if (zone === 'country') {
          // a farmstead now and then, far apart
          if (rand() < 0.62 || !w.major && w.i !== 4 && w.i !== 5 && w.i !== 2 && w.i !== 3) { t += 14 + rand() * 50; continue; }
          kind = 'farm'; nb = 3; bay = 3.0 + rand() * 0.4; dep = 6.2; depLot = 20 + rand() * 6; ins = 1.0;
        } else if (zone === 'suburb') {
          if (rand() < 0.28) { t += 6 + rand() * 20; continue; }
          if (w.major && w.i === 4 && q < 0.45) { kind = 'shop'; nb = 2 + (q < 0.15 ? 1 : 0); dep = 8 + rand() * 2; depLot = 12 + rand() * 3; }
          else if (q < 0.7) { kind = 'thatch'; nb = 2 + (rand() < 0.4 ? 1 : 0); bay = 2.8 + rand() * 0.4; dep = 5.2 + rand() * 1.4; depLot = 11 + rand() * 4; ins = 1.1; }
          else { kind = 'house'; nb = 2 + (rand() < 0.4 ? 1 : 0); dep = 7 + rand() * 1.6; depLot = 12 + rand() * 4; ins = 1.0; }
        } else if (w.major && d < 300 && q < 0.9) {
          if (riverS && d < 300 && d > 40 && rand() < 0.5) { kind = 'warehouse'; nb = 3 + Math.floor(rand() * 3); bay = 3.4 + rand() * 0.5; dep = 10.5 + rand() * 2.5; depLot = 14 + rand() * 3; }
          else if (d < 260 && rand() < 0.07) { kind = 'inn'; nb = 4 + Math.floor(rand() * 2); bay = 3.5 + rand() * 0.4; dep = 19 + rand() * 3; depLot = dep + 1; }
          else { kind = 'shop'; storeys = rand() < (d < 150 ? 0.62 : d < 240 ? 0.4 : 0.2) ? 2 : 1; nb = d < 150 && rand() < 0.3 ? 4 : 2 + (rand() < 0.55 ? 1 : 0); dep = 8.4 + rand() * 2.2 + (storeys === 2 ? 0.6 : 0); depLot = dep + 2.5 + rand() * 4; }
        } else {
          const thatchP = d < 160 ? 0.08 : d < 260 ? 0.3 : d < 360 ? 0.55 : 0.8;
          if (rand() < (d < 330 ? 0.04 : 0.32 + (d - 330) / 500)) { t += 8 + rand() * 24; continue; }
          if (!w.lane && d < 220 && q < 0.3) { kind = 'shop'; nb = 2; dep = 8 + rand() * 1.5; depLot = dep + 3 + rand() * 3; }
          else if (rand() < thatchP) { kind = 'thatch'; nb = 2 + (rand() < 0.35 ? 1 : 0); bay = 2.8 + rand() * 0.4; dep = 5.2 + rand() * 1.4; depLot = 11 + rand() * 4; ins = 1.1; }
          else { kind = 'house'; nb = 2 + (rand() < 0.45 ? 1 : 0); dep = 7 + rand() * 1.8; depLot = 11.5 + rand() * 4; ins = 1.0; }
        }
        let wdt = nb * bay + ins * 2;
        if (kind === 'farm') wdt = 16 + rand() * 6;
        const r = horiz
          ? (side < 0 ? [t, s[1] - depLot, t + wdt - 0.3, s[1] - 0.2] : [t, s[3] + 0.2, t + wdt - 0.3, s[3] + depLot])
          : (side < 0 ? [s[0] - depLot, t, s[0] - 0.2, t + wdt - 0.3] : [s[2] + 0.2, t, s[2] + depLot, t + wdt - 0.3]);
        const front = horiz ? (side < 0 ? 's' : 'n') : (side < 0 ? 'e' : 'w');
        if (fits(r) && inZone(r) && clearOfPlaces(r) && !rw(r) && free(r)) {
          take(r);
          const det = zone === 'city' ? (d < 170 ? 2 : d < 300 ? 1 : 0) : (zone === 'suburb' ? (Math.hypot(px - WALL_X, pz + 80) < 90 ? 1 : 0) : 0);
          const along = horiz ? r[2] - r[0] : r[3] - r[1];
          LOTS.push({ rect: r, foot: footOf(r, front, kind === 'inn' ? depLot - 0.5 : dep, kind === 'farm' ? 0.5 : ins), front, kind, storeys: kind === 'inn' ? 2 : storeys, shop: kind === 'shop' || kind === 'inn' || kind === 'warehouse', seed: Math.floor(rand() * 1e6), bays: nb, bay: kind === 'farm' ? 3.2 : (along - 0.3 - ins * 2) / nb, ins, det, trade: kind === 'shop' ? pickTrade(d) : null, street: w.i, riverside: riverS || riverN, zone });
          t += wdt;
        } else t += 3;
      }
    }
  }
  // the wine shops (the scroll has five): the widest two-storey shops by the bridge, the Sun Yang main shop first
  const near = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 76), width = (l) => (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]);
  const cand = LOTS.filter((l) => l.kind === 'shop' && l.zone === 'city' && near(l) < 150 && width(l) > 9 && l.street < MAJOR && l.rect[3] - l.rect[1] > 13).sort((a, b) => near(a) - near(b));
  const wine = [];
  for (const l of cand) { if (wine.length < 5 && wine.every((m) => Math.hypot(m.rect[0] - l.rect[0], m.rect[1] - l.rect[1]) > 24)) wine.push(l); }
  wine.forEach((l, i) => { l.kind = 'wine'; l.storeys = 2; l.trade = 'wine'; l.main = i === 0; });
  // the two tea houses on the north river street by the bridge (their front to the water)
  const tea = LOTS.filter((l) => l.front === 's' && l.street === 2 && l.kind === 'shop' && l.storeys === 1 && width(l) > 8 && l.rect[3] - l.rect[1] > 11 && Math.abs(l.rect[3] - (RIVER.z0 - 14)) < 1).sort((a, b) => Math.abs((a.rect[0] + a.rect[2]) / 2) - Math.abs((b.rect[0] + b.rect[2]) / 2)).slice(0, 2);
  for (const l of tea) { l.kind = 'tea'; l.trade = 'tea'; }
  // wells in the yards of some houses, a little way behind
  for (const l of LOTS) if ((l.kind === 'house' || l.kind === 'farm' || l.kind === 'thatch') && ((l.seed >> 3) % 5 === 0)) {
    const [x0, z0, x1, z1] = l.rect, [fx0, fz0, fx1, fz1] = l.foot, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const at = l.front === 's' ? [cx, (z0 + fz0) / 2] : l.front === 'n' ? [cx, (z1 + fz1) / 2] : l.front === 'e' ? [(x0 + fx0) / 2, cz] : [(x1 + fx1) / 2, cz];
    if (Math.hypot(at[0] - cx, at[1] - cz) < 40 && ((l.front === 's' || l.front === 'n') ? Math.abs(z1 - z0) : Math.abs(x1 - x0)) > l.foot[3] - l.foot[1] + 4 + (l.front === 'e' || l.front === 'w' ? (l.foot[2] - l.foot[0]) - (l.foot[3] - l.foot[1]) : 0)) l.well = at;
  }
  return LOTS;
}
export const wineLots = () => lots().filter((l) => l.kind === 'wine');
export const teaLots = () => lots().filter((l) => l.kind === 'tea');
/** Is (x, z) within m of a building (not its yard)? */
export function inLot(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.foot[0] - 3) / 20); i <= Math.floor((h.foot[2] + 3) / 20); i++) for (let j = Math.floor((h.foot[1] - 3) / 20); j <= Math.floor((h.foot[3] + 3) / 20); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20));
  return !!l && l.some((h) => inRect(h.foot, x, z, m));
}
let LGRID = null;
/** The lot (building and yard) at (x, z), if any. */
export function lotAt(x, z, m = 0) {
  if (!LGRID) { LGRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.rect[0] - 3) / 20); i <= Math.floor((h.rect[2] + 3) / 20); i++) for (let j = Math.floor((h.rect[1] - 3) / 20); j <= Math.floor((h.rect[3] + 3) / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(h); } }
  const l = LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20));
  return (l && l.find((h) => inRect(h.rect, x, z, m))) || null;
}
// the wharves on the earth banks beyond the stone ones: { x, bank: 'n' | 's' } — a timber stage on piles with steps down to the water
export const WHARVES = [
  { x: -460, bank: 's' }, { x: -400, bank: 'n' }, { x: -352, bank: 's' }, { x: -262, bank: 'n' }, { x: -214, bank: 's' }, { x: 176, bank: 'n' }, { x: 196, bank: 's' }, { x: 262, bank: 'n' }, { x: 330, bank: 's' }, { x: 392, bank: 'n' }, { x: 452, bank: 's' },
];
// the stone steps (he bu tou) in the walls by the bridge
export const STEPS = [
  { x: -108, bank: 'n' }, { x: -64, bank: 's' }, { x: -34, bank: 'n' }, { x: 36, bank: 's' }, { x: 40, bank: 'n' }, { x: 96, bank: 'n' }, { x: 112, bank: 's' }, { x: -146, bank: 'n' }, { x: 100, bank: 's' },
];
