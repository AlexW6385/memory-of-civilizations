// The blocks' buildings (docs/settlements/new-york.md §5) and the street's life (§5a): the traffic of
// 1931 on the avenues and cross streets — Checker and Yellow cabs among black, cream and blue
// motor cars — people on the pavements, lamp posts along the avenues.
import { RADIUS, AVENUES, STREETS, lots, chimneyAt, DINER_AT, WALKUP_AT, height, onBroadway, inLot, onElStair, inSpecial, streetZ, inRect, GRID, toCity, frontPoint, pavements, roomLots } from './layout.js';
import { entranceOf } from './plan.js';
// (all laid out in the grid's frame (layout.js); the buildings and the yards turned into the
// settlement's by the style's `turned`, the life of the streets — single placed things — moved and
// turned here, and each tile's centre with it)
function rng0(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The newsstands at the corners of the avenues with 34th, 38th and 42nd Streets (§1d). */
const NEWSSTANDS = (() => {
  const out = [], rand = rng0(1931);
  for (const [ax, w] of AVENUES) for (const n of [34, 38, 42]) for (const sg of [-1, 1]) {
    if (rand() < 0.45) continue;
    const sgz = rand() < 0.5 ? -1 : 1, x = ax + sg * (w / 2 + 2.3), z = streetZ(n) + sgz * 8.2;
    if (Math.hypot(x, z) > RADIUS - 50 || inLot(x, z, 1.4) || inSpecial(x, z, 1.4) || onElStair(x, z, 1.5) || onBroadway(x, z, 2)) continue;
    out.push({ t: 'newsstand', at: [x, z], y: height(x, z), rot: -sg * Math.PI / 2, seed: Math.floor(rand() * 1e6) });
  }
  return out;
})();
/** The subway's stair-heads (§1h): the Lexington Avenue line's stations at 33rd and 42nd Streets, one on each pavement just beyond the crossing. */
const SUBWAYS = (() => {
  const out = [], [ax, w] = AVENUES.find((a) => a[2] === 'Lexington');
  for (const [n, dz] of [[33, -10.5], [42, 10.5]]) for (const sg of [-1, 1]) {
    const x = ax + sg * (w / 2 + 1.65), z = streetZ(n) + dz;
    out.push({ t: 'subway_entrance', at: [x, z], y: height(x, z), rot: dz < 0 ? 0 : Math.PI, seed: n * 7 + sg });
  }
  return out;
})();
const nearStand = (x, z, m) => [...NEWSSTANDS, ...SUBWAYS].some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < m);
const base = (id, elements) => ({ id, style: 'artdeco', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [{ t: 'turned', angle: GRID, elements }], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: entranceOf() });
/** A placed thing of the grid's frame in the settlement's: its place and its turn. */
const placed = (e) => ({ ...e, at: toCity(...e.at), rot: (e.rot ?? 0) + GRID });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function streetLife() {
  const rand = rng(1931), L = [], inside = (x, z) => Math.hypot(x, z) < RADIUS - 45;
  const crossing = (x, z, m) => AVENUES.some(([ax, w]) => Math.abs(x - ax) < w / 2 + m) && STREETS.some(([sz, w]) => Math.abs(z - sz) < w / 2 + m);
  const car = (x, z, rot) => {
    if (!inside(x, z) || crossing(x, z, 2) || onBroadway(x, z, 2) || inLot(x, z, 1.5) || inSpecial(x, z, 1.4)) return;
    // no two cars in one place (a car 4.4 m long: keep 5.2 m between centres)
    if (L.some((c) => c.t === 'car' && Math.hypot(c.at[0] - x, c.at[1] - z) < 5.2)) return;
    const cab = rand() < 0.38;
    L.push({ t: 'car', at: [x, z], y: height(x, z), rot, era: 1930, seed: Math.floor(rand() * 1e9), ...(cab ? { mat: 'paint_cab_yellow' } : {}) });
  };
  // the avenues: two-way, traffic keeping right; the Sixth Avenue's lanes clear of the El's columns
  for (const [ax, w, name] of AVENUES) {
    const lanes = name === '6th' ? [[1.8, 0], [6.6, 0], [-1.8, Math.PI], [-6.6, Math.PI]] : w >= 18 ? [[2.4, 0], [5.9, 0], [-2.4, Math.PI], [-5.9, Math.PI]] : [[2.3, 0], [-2.3, Math.PI], [w / 2 - 1.4, 0], [-w / 2 + 1.4, Math.PI]];
    for (const [dx, rot] of lanes) { let z = -RADIUS + rand() * 20; while (z < RADIUS) { car(ax + dx, z, rot); z += 9 + rand() * (Math.abs(dx) > 5 ? 40 : 22); } }
  }
  // the cross streets, narrower, a car now and then and one parked at the kerb
  for (const [sz] of STREETS) for (const [dz, rot] of [[2, Math.PI / 2], [-2, -Math.PI / 2], [4.6, Math.PI / 2]]) { let x = -RADIUS + rand() * 30; while (x < RADIUS) { car(x, sz + dz, rot); x += 18 + rand() * 50; } }
  // people on the pavements, hats on; lamp posts along the avenues
  const DRESS = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_grey'];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  for (const [ax, w] of AVENUES) for (const sg of [-1, 1]) {
    const x = ax + sg * (w / 2 + 1.5);
    for (let z = -RADIUS; z < RADIUS; z += 6 + rand() * 18) {
      if (!inside(x, z) || inLot(x, z, 0.6) || crossing(x, z, 0) || onElStair(x, z, 1) || inSpecial(x, z, 0.8) || nearStand(x, z, 2.6)) continue;
      const woman = rand() < 0.4;
      L.push({ t: 'figure', at: [x + (rand() - 0.5) * 1.6, z], y: height(x, z), rot: rand() < 0.5 ? 0 : Math.PI, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'trousers', cloth: pick(DRESS), cloth2: pick(['cloth_white', 'cloth_grey', 'cloth_black']), skin: pick(['skin_light', 'skin_light', 'skin_medium', 'skin_dark']), hat: woman ? pick(['cap', 'none']) : 'brim', hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']) });
    }
    for (let z = -RADIUS + 10; z < RADIUS; z += 30) { const xx = ax + sg * (w / 2 + 0.5); if (inside(xx, z) && !inLot(xx, z, 0.4) && !crossing(xx, z, 1) && !onElStair(xx, z, 0.5) && !inSpecial(xx, z, 0.4) && !nearStand(xx, z, 1.8)) L.push({ t: 'street_lamp', at: [xx, z], y: height(xx, z), h: 5.5, seed: z }); }
  }
  // people waiting at the crossings: at about half the corners a knot of two to five on the kerb, facing across the
  // avenue or the street, a policeman in blue on some corners of Fifth Avenue
  for (const [ax, w, name] of AVENUES) for (const [sz, sw] of STREETS) for (const sx of [-1, 1]) for (const szs of [-1, 1]) {
    if (rand() < 0.5) continue;
    const cx = ax + sx * (w / 2 + 1.2), cz = sz + szs * (sw / 2 + 1.2);
    if (!inside(cx, cz) || inLot(cx, cz, 0.3) || onElStair(cx, cz, 1) || inSpecial(cx, cz, 0.5) || nearStand(cx, cz, 2.2) || onBroadway(cx, cz, 1)) continue;
    const across = rand() < 0.5, n = 2 + Math.floor(rand() * 4);
    for (let k = 0; k < n; k++) {
      const x = cx + (across ? (rand() - 0.5) * 1.6 : sx * k * 0.5), z = cz + (across ? szs * k * 0.5 : (rand() - 0.5) * 1.6), woman = rand() < 0.4;
      if (inLot(x, z, 0.3)) continue;
      L.push({ t: 'figure', at: [x, z], y: height(x, z), rot: across ? (szs > 0 ? 0 : Math.PI) + (rand() - 0.5) * 0.4 : (sx > 0 ? -Math.PI / 2 : Math.PI / 2) + (rand() - 0.5) * 0.4, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'trousers', cloth: pick(DRESS), cloth2: pick(['cloth_white', 'cloth_grey', 'cloth_black']), skin: pick(['skin_light', 'skin_light', 'skin_medium', 'skin_dark']), hat: woman ? pick(['cap', 'none']) : 'brim', hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']) });
    }
    if (name === '5th' && rand() < 0.35) L.push({ t: 'figure', at: [cx - sx * 0.6, cz - szs * 0.6], y: height(cx, cz), rot: rand() * 6, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: 'cloth_indigo', cloth2: 'cloth_indigo', skin: 'skin_light', hat: 'cap', hatMat: 'cloth_indigo', over: 'belt' });
  }
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 150)},${Math.floor(e.at[1] / 150)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`new-york-life-${k}`, []), elements: list.map(placed), style: 'life', center: toCity(i * 150 + 75, j * 150 + 75), near: 260 }; });
}
/** The tenements' rear yards east of Lexington Avenue, washing on the lines from their back windows to a pole (§1d). */
function yards() {
  const rand = rng0(1932), out = [...NEWSSTANDS, ...SUBWAYS], all = lots();
  for (const l of all) {
    const [x0, , x1, zb] = l.rect, cx = (x0 + x1) / 2;
    if (l.front !== 'n' || l.h > 35 || cx < 275 || x1 - x0 < 8 || rand() < 0.3) continue;
    const zm = zb + 3.5, opp = all.find((o) => o.front === 's' && o.h <= 40 && inRect(o.rect, cx, zm + 3.6, 0.1)), lines = [];
    const floors = (h, y) => { const f = []; for (let yy = y + 4.6; yy < y + h - 1.5 && f.length < 4; yy += 3.2) f.push(yy); return f; };
    for (const yy of floors(l.h, l.y)) if (rand() < 0.8) lines.push([cx + (rand() - 0.5) * (x1 - x0 - 3), yy, zb + 0.15]);
    if (opp) for (const yy of floors(opp.h, opp.y)) if (rand() < 0.7) lines.push([cx + (rand() - 0.5) * (x1 - x0 - 3), yy, opp.rect[1] - 0.15]);
    if (!lines.length) continue;
    out.push({ t: 'laundry', pole: [cx, zm], y: height(cx, zm), h: Math.min(16, Math.max(...lines.map((p) => p[1])) - l.y + 2), lines, seed: Math.floor(rand() * 1e6) });
  }
  const tiles = new Map();
  for (const e of out) { const p = e.at ?? e.pole, k = `${Math.floor(p[0] / 150)},${Math.floor(p[1] / 150)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`new-york-yards-${k}`, list), center: toCity(i * 150 + 75, j * 150 + 75), near: 300 }; });
}
/**
 * The pavements and what stands on them (docs §1i), in tiles: the flags and curbs of every block, then the street furniture
 * of the corners (signals on two diagonal corners of every crossing, hydrants, mail boxes, fire alarm boxes, Fifth Avenue's
 * clocks), manholes in the roadways, and at the shop fronts what each district put out: racks and hand trucks in the garment
 * district, ash cans and barrels in Murray Hill, sandwich boards on the avenues' cross streets.
 */
function pavePlans() {
  const rand = rng0(7731), items = [], inside = (x, z) => Math.hypot(x, z) < RADIUS - 50;
  const clear = (x, z, m = 0.5) => inside(x, z) && !inLot(x, z, m) && !inSpecial(x, z, m) && !onElStair(x, z, m + 0.6) && !onBroadway(x, z, m + 1) && !nearStand(x, z, 2.2) && !items.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 0.9);
  const put = (k, x, z, rot, extra = {}) => { if (clear(x, z, k === 'manhole' ? 0 : 0.4)) items.push({ k, at: [x, z], y: height(x, z), rot, seed: Math.floor(rand() * 1e6), ...extra }); };
  for (const [ax, w, name] of AVENUES) for (const [sz, sw] of STREETS) for (const sx of [-1, 1]) for (const szs of [-1, 1]) {
    const cx = ax + sx * (w / 2 + 0.7), cz = sz + szs * (sw / 2 + 0.7);
    if (sx === szs && name !== '3rd') put('signal', cx, cz, 0);
    if (rand() < 0.3) put('hydrant', cx - sx * 0.2, cz + szs * (3 + rand() * 4), 0);
    if (rand() < 0.22) put('mailbox', cx + sx * 0.1, cz - szs * (1.2 + rand() * 2), 0);
    if (rand() < 0.12) put('firebox', cx, cz - szs * 4.5, 0);
    if (rand() < 0.5) put('ashcan', cx - sx * 0.1, cz + szs * (1.6 + rand() * 2), 0);
  }
  for (const [ax, w, name] of AVENUES) {
    if (name === '5th') for (const sg of [-1, 1]) for (let z = -RADIUS + 40; z < RADIUS - 40; z += 38 + rand() * 40) put('clock', ax + sg * (w / 2 + 0.8), z, 0);
    for (let z = -RADIUS + 20; z < RADIUS - 40; z += 30 + rand() * 30) put('manhole', ax + (rand() - 0.5) * (w - 4), z, 0);
  }
  for (const [sz] of STREETS) for (let x = -RADIUS + 20; x < RADIUS - 40; x += 40 + rand() * 40) put('manhole', x, sz + (rand() - 0.5) * 6, 0);
  // the shop fronts
  const SPECIALS = ['LUNCH 35', 'HOT COFFEE', 'FRESH PIES', 'SODA', 'OPEN'];
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, L = x1 - x0, f = l.front, garment = x0 < -10, murray = x0 > 60 && z0 > -150, rowish = !!l.row;
    for (let u = 2.2 + rand() * 4; u < L - 1.2; u += 5 + rand() * 6) {
      const roll = rand(), [px, pz] = frontPoint(l.rect, f, u, (rowish ? 1.5 : 0.8) + rand() * 0.4);
      if (garment) { if (roll < 0.28) put('rack', px, pz, 0); else if (roll < 0.5) put('truck', px, pz, rand() < 0.5 ? 0 : Math.PI); else if (roll < 0.62) put('crates', px, pz, 0); else if (roll < 0.72) put('ashcan', px, pz, 0); }
      else if (murray) { if (roll < 0.28) put('ashcan', px, pz, 0); else if (roll < 0.4) put('barrel', px, pz, 0); else if (roll < 0.5 && !rowish) put('crates', px, pz, 0); }
      else if (roll < 0.22) put('asign', px, pz, (f === 'n' ? Math.PI / 2 : -Math.PI / 2) + (rand() - 0.5) * 0.3, { text: SPECIALS[Math.floor(rand() * SPECIALS.length)] }); else if (roll < 0.36) put('ashcan', px, pz, 0);
    }
  }
  const { segs, curbs } = pavements(), tiles = new Map(), slot = (p) => `${Math.floor(p[0] / 150)},${Math.floor(p[1] / 150)}`;
  const tile = (k) => { if (!tiles.has(k)) tiles.set(k, { segs: [], curbs: [], items: [] }); return tiles.get(k); };
  for (const s of segs) tile(slot([(s[0] + s[2]) / 2, (s[1] + s[3]) / 2])).segs.push(s);
  for (const c of curbs) tile(slot([(c[0] + c[2]) / 2, (c[1] + c[3]) / 2])).curbs.push(c);
  for (const it of items) tile(slot(it.at)).items.push(it);
  return [...tiles].map(([k, t]) => { const [i, j] = k.split(',').map(Number); return { ...base(`new-york-street-${k}`, [{ t: 'pavement', segs: t.segs, curbs: t.curbs }, { t: 'curb', items: t.items }]), center: toCity(i * 150 + 75, j * 150 + 75), near: 320 }; });
}
/** The lot of the diner (on 34th Street east of Fifth) and the walk-up (beside it), §1f. */
const lotAt = ([x, z]) => lots().find((l) => inRect(l.rect, x, z));
function special(l) {
  if (l === lotAt(DINER_AT)) return [{ t: 'diner', rect: l.rect, y: l.y }];
  if (l === lotAt(WALKUP_AT)) {
    // the walk-up takes the east 7.6 m of its lot (a 25-foot tenement), the rest a building as before
    const [x0, z0, x1, z1] = l.rect, xs = x1 - 7.6;
    return [{ t: 'skyscraper', ...l, rect: [x0, z0, xs - 0.3, z1], shops: l.shops.replace('e', ''), row: false, iron: false }, { t: 'walkup', rect: [xs, z0, x1, z1], y: l.y, h: 15.5, seed: l.seed }];
  }
  return null;
}
/** The diner's people: the counterman behind the counter, the cook at the grill, customers at the counter and in a booth (life style). */
function dinerLife() {
  const l = lotAt(DINER_AT); if (!l) return [];
  const [lx0, , lx1, lz1] = l.rect, F = l.y + 0.75, Lc = Math.min(13.5, lx1 - lx0 - 2), x0 = (lx0 + lx1) / 2 - Lc / 2, x1 = x0 + Lc, z0 = lz1 - 0.8 - 4.6;
  const zb = z0 + 0.12, zk1 = zb + 2.2, rand = rng(1933);
  const P = (o) => ({ t: 'figure', y: F, seed: Math.floor(rand() * 1e9), skin: rand() < 0.8 ? 'skin_light' : 'skin_medium', ...o });
  return [
    P({ at: [x0 + 6.5, zb + 1.1], rot: Math.PI, dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white', over: 'apron' }),
    P({ at: [x1 - 1.5, zb + 1.0], rot: 0, dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white', over: 'apron' }),
    P({ at: [x0 + 4.3, zk1 + 0.95], rot: 0, dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_white', hat: 'brim', hatMat: 'cloth_black', pose: 'talk' }),
    P({ at: [x0 + 8.4, zk1 + 0.95], rot: 0.1, dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'brim', hatMat: 'cloth_brown' }),
    P({ at: [x0 + 9.8, zk1 + 0.95], rot: -0.2, dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_red' }),
  ].map(placed);
}
/** The shops' people (life style): the keeper behind the counter, a customer or two across it (on the stools at the fountain and the lunch counter), the barbers at their chairs. */
function shopLife() {
  const rand = rng(1934), out = [];
  const DR = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'], pick = (a) => a[Math.floor(rand() * a.length)];
  const P = (l, u, d, o) => { const [x, z] = frontPoint(l.rect, l.front, u, -d), F = l.y + 0.06; return { t: 'figure', at: [x, z], y: F + (o.pose === 'sit' ? 0.16 : 0), seed: Math.floor(rand() * 1e9), skin: pick(['skin_light', 'skin_light', 'skin_medium']), ...o, rot: (o.rot ?? 0) + (l.front === 's' ? Math.PI : 0) }; };
  for (const l of roomLots()) {
    const L = l.rect[2] - l.rect[0], Dr = l.room.depth, mid = L / 2, k = l.room.kind, dC = Dr - 3.1;
    const keeper = { dress: 'trousers', cloth: k === 'bakery' || k === 'deli' || k === 'drug' || k === 'lunch' ? 'cloth_white' : pick(DR), cloth2: 'cloth_white', hat: k === 'bakery' || k === 'lunch' ? 'cap' : 'none', hatMat: 'cloth_white', over: k === 'tailor' || k === 'shoe' || k === 'deli' || k === 'bakery' || k === 'lunch' ? 'apron' : 'none' };
    const cust = (u, d, o = {}) => P(l, u, d, { dress: rand() < 0.35 ? 'robe' : 'trousers', cloth: pick(DR), cloth2: 'cloth_white', hat: 'brim', hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']), rot: Math.PI, ...o });
    if (k === 'barber') {
      const n = Math.max(2, Math.min(3, Math.floor((L - 0.6 - 0.8 - 2) / 1.8)));
      for (let i = 0; i < n; i++) { const u = 0.7 + 1.2 + i * ((L - 1.4 - 2.4) / Math.max(1, n - 1)); out.push(P(l, u + 0.7, Dr - 1.7, { ...keeper, cloth: 'cloth_white', over: 'apron', hat: 'none', rot: Math.PI / 2 })); if (i < 2) out.push(P(l, u, Dr - 1.7, { dress: 'trousers', cloth: pick(DR), cloth2: 'cloth_white', hat: 'none', pose: 'sit', rot: Math.PI })); }
    } else {
      out.push(P(l, mid + (rand() - 0.5) * 2, Dr - 1.5, keeper));
      if (k === 'drug' || k === 'lunch') { out.push(cust(mid - 1.2, dC - 0.55, { pose: 'sit' })); out.push(cust(mid + 0.6, dC - 0.55, { pose: 'sit', dress: 'trousers' })); }
      else out.push(cust(mid + (rand() - 0.5) * 3, dC - 0.9));
      if (rand() < 0.6) out.push(cust(mid + (rand() < 0.5 ? -2.2 : 2.2), 2.4 + rand() * 1.5, { rot: rand() * 6 }));
    }
  }
  const tiles = new Map();
  for (const e of out) { const k = `${Math.floor(e.at[0] / 150)},${Math.floor(e.at[1] / 150)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`new-york-shop-life-${k}`, []), elements: list.map(placed), style: 'life', center: toCity(i * 150 + 75, j * 150 + 75), near: 200 }; });
}
export async function buildings() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 50) plans.push(base(`new-york-blocks-${i / 50}`, all.slice(i, i + 50).flatMap((l) => special(l) ?? [{ t: 'skyscraper', ...l, chimney: chimneyAt(l) }])));
  const dl = dinerLife(), c = toCity(...DINER_AT);
  return [...plans, ...streetLife(), ...yards(), ...pavePlans(), ...shopLife(), { ...base('new-york-diner-life', []), elements: dl, style: 'life', center: c, near: 200 }];
}
