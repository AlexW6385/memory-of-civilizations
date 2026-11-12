// The blocks' buildings (docs/settlements/new-york.md §5) and the street's life (§5a): the traffic of
// 1931 on the avenues and cross streets — Checker and Yellow cabs among black, cream and blue
// motor cars — people on the pavements, lamp posts along the avenues.
import { RADIUS, AVENUES, STREETS, GCT, BRYANT, LIBRARY, lots, chimneyAt, DINER_AT, WALKUP_AT, height, onBroadway, inLot, onElStair, inSpecial, streetZ, inRect, GRID, toCity, frontPoint, pavements, roomLots } from './layout.js';
import { entranceOf } from './plan.js';
import { nearEntrance } from '../../styles/artdeco/dress.js';
import { concoursePeople } from '../../styles/artdeco/concourse.js';
import { libraryPeople } from '../../styles/artdeco/library.js';
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
/**
 * What stands in the street besides the cars (grid frame; docs/settlements/new-york.md §1m): Fifth Avenue Coach double-deckers at their stops on Fifth and Madison
 * Avenues (the stop on the far side of the cross street, at the kerb), delivery vans at the kerbs of the cross streets (the garment district's thickest), the
 * peddlers' pushcarts under their umbrellas on the corners, and the unemployed men selling apples from a crate on the avenues' pavements (autumn 1931: the
 * apple sellers of the Depression, from the winter of 1930). `box` is the half-extent [x, z] kept clear of cars.
 */
const EXTRA = (() => {
  const rand = rng0(1941), vehicles = [], carts = [], apples = [];
  const within = (x, z) => Math.hypot(x, z) < RADIUS - 60;
  const free = (x, z, hx, hz) => [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]].every(([a, b]) => { const px = x + a * hx, pz = z + b * hz; return within(px, pz) && !inLot(px, pz, 0.8) && !inSpecial(px, pz, 1.0) && !onBroadway(px, pz, 2) && !onElStair(px, pz, 1.5); });
  const apart = (x, z, hx, hz) => !vehicles.some((v) => Math.abs(v.at[0] - x) < v.box[0] + hx + 0.5 && Math.abs(v.at[1] - z) < v.box[1] + hz + 0.5);
  // the buses: Fifth (the near-side lanes ±5.9) and Madison (±5.6); northbound (rot 0, toward −z) stops beyond the crossing to the north, southbound (rot π) beyond it to the south
  for (const [ax, w, name] of AVENUES) {
    if (name !== '5th' && name !== 'Madison') continue;
    const lane = name === '5th' ? 5.9 : 5.6;
    for (const n of [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43]) for (const rot of [0, Math.PI]) {
      const forced = name === '5th' && ((n === 37 && rot === Math.PI) || (n === 36 && rot === 0));
      if (!forced && rand() > (name === '5th' ? 0.3 : 0.16)) continue;
      const sz = streetZ(n), x = ax + (rot === 0 ? lane : -lane), z = sz + (rot === 0 ? -1 : 1) * (6 + 2.5 + 4.8);
      if (!free(x, z, 1.4, 5.2) || STREETS.some(([s2, sw]) => Math.abs(z - s2) < sw / 2 + 5.4) || !apart(x, z, 2.6, 5.2)) continue;
      vehicles.push({ k: 'bus', at: [x, z], rot, box: [2.6, 7.2], seed: Math.floor(rand() * 1e6) });
    }
  }
  // the vans: along the cross streets at the kerb (the south kerb heading east, the north kerb heading west: traffic keeps right), more of them west of Fifth
  const BODY = ['car_cream', 'shutter_green', 'car_blue', 'car_red', 'paint_white', 'paint_cab_yellow', 'car_cream'];
  for (const [sz] of STREETS) for (let x = -RADIUS + 20 + rand() * 30; x < RADIUS - 70; x += (x < -10 ? 66 : 130) + rand() * 70) {
    const south = rand() < 0.5, z = sz + (south ? 4.6 : -4.6);
    if (AVENUES.some(([ax, w]) => Math.abs(x - ax) < w / 2 + 4.5) || !free(x, z, 3.2, 1.3) || !apart(x, z, 3.2, 1.3)) continue;
    vehicles.push({ k: 'van', at: [x, z], rot: south ? -Math.PI / 2 : Math.PI / 2, box: [5.4, 2.4], seed: Math.floor(rand() * 1e6), body: BODY[Math.floor(rand() * BODY.length)] });
  }
  // the pushcarts, one corner in six on the avenues' pavements beyond the crossing (clear of the newsstands and the signal posts)
  for (const [ax, w] of AVENUES) for (const [sz, sw] of STREETS) for (const sx of [-1, 1]) for (const szs of [-1, 1]) {
    if (rand() > 0.3) continue;
    const x = ax + sx * (w / 2 + 1.55), z = sz + szs * (sw / 2 + 5.2), rot = szs > 0 ? 0 : Math.PI;
    if (!free(x, z, 1.3, 1.0) || nearStand(x, z, 3.2) || carts.some((c) => Math.hypot(c.at[0] - x, c.at[1] - z) < 8)) continue;
    carts.push({ at: [x, z], rot, seed: Math.floor(rand() * 1e6), top: rand() < 0.5 ? 'cloth_red' : 'cloth_ochre' });
  }
  // the apple sellers: a crate of apples on the kerb side of the pavement, the man behind it in a worn coat
  for (const [ax, w, name] of AVENUES) {
    if (name === '3rd') continue;
    for (let z = -RADIUS + 60 + rand() * 30; z < RADIUS - 60; z += (name === '5th' ? 70 : 120) + rand() * 60) {
      const sg = rand() < 0.5 ? -1 : 1, x = ax + sg * (w / 2 + 1.0), zz = z;
      if (!free(x, zz, 0.9, 0.6) || !free(x + sg * 1.0, zz, 0.4, 0.4) || nearStand(x, zz, 2.4) || STREETS.some(([s2, sw]) => Math.abs(zz - s2) < sw / 2 + 2.5) || carts.some((c) => Math.hypot(c.at[0] - x, c.at[1] - zz) < 4)) continue;
      apples.push({ at: [x, zz], sg, seed: Math.floor(rand() * 1e9) });
    }
  }
  return { vehicles, carts, apples };
})();
/** A car's place is taken by a standing bus or van. */
const nearVehicle = (x, z) => EXTRA.vehicles.some((v) => Math.abs(v.at[0] - x) < v.box[0] && Math.abs(v.at[1] - z) < v.box[1]);
/** A point at (lx, lz) of a thing placed at `at` turned by `rot` (as Matrix4.makeRotationY). */
const loc = (at, rot, lx, lz) => [at[0] + lx * Math.cos(rot) + lz * Math.sin(rot), at[1] - lx * Math.sin(rot) + lz * Math.cos(rot)];
const base = (id, elements) => ({ id, style: 'artdeco', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [{ t: 'turned', angle: GRID, elements }], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: entranceOf() });
/** A placed thing of the grid's frame in the settlement's: its place and its turn. */
const placed = (e) => ({ ...e, at: toCity(...e.at), rot: (e.rot ?? 0) + GRID });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function streetLife() {
  const rand = rng(1931), L = [], inside = (x, z) => Math.hypot(x, z) < RADIUS - 45;
  const crossing = (x, z, m) => AVENUES.some(([ax, w]) => Math.abs(x - ax) < w / 2 + m) && STREETS.some(([sz, w]) => Math.abs(z - sz) < w / 2 + m);
  const car = (x, z, rot) => {
    if (!inside(x, z) || crossing(x, z, 2) || onBroadway(x, z, 2) || inLot(x, z, 1.5) || inSpecial(x, z, 1.4) || nearVehicle(x, z)) return;
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
  for (const [sz] of STREETS) for (const [dz, rot] of [[2, -Math.PI / 2], [-2, Math.PI / 2], [4.6, -Math.PI / 2]]) { let x = -RADIUS + rand() * 30; while (x < RADIUS) { car(x, sz + dz, rot); x += 18 + rand() * 50; } }
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
  // ── the street's slow life (EXTRA above): the peddlers behind their pushcarts with a customer at some, the apple sellers on the avenues' pavements, the carters at the heads of their horse wagons (milk, ice and coal still came by horse in 1931 [inferred]) ──
  for (const c of EXTRA.carts) {
    L.push({ t: 'figure', at: loc(c.at, c.rot, 0, -1.5), y: height(...c.at), rot: c.rot + Math.PI, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_black', over: 'apron', skin: pick(['skin_light', 'skin_medium', 'skin_medium']) });
    if (rand() < 0.5) L.push({ t: 'figure', at: loc(c.at, c.rot, 0.2, 1.7), y: height(...c.at), rot: c.rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.4 ? 'robe' : 'trousers', cloth: pick(DRESS), cloth2: 'cloth_white', hat: 'brim', hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']), skin: 'skin_light' });
  }
  // the newsstands' keepers inside under the roof, and a newsboy hawking at the corner of some
  for (const n of NEWSSTANDS) {
    L.push({ t: 'figure', at: loc(n.at, n.rot, 0, -0.05), y: n.y, rot: n.rot + Math.PI, seed: n.seed, dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_grey', over: 'apron', skin: 'skin_light', pose: 'stand' });
    if (n.seed % 3 === 0) L.push({ t: 'figure', at: loc(n.at, n.rot, 1.9, 1.3), y: n.y, rot: n.rot + 0.5, seed: n.seed + 7, dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_red', carry: 'bundle', h: 0.74, skin: 'skin_light', pose: 'stand' });
  }
  for (const a of EXTRA.apples) L.push({ t: 'figure', at: [a.at[0] + a.sg * 1.05, a.at[1]], y: height(...a.at), rot: a.sg > 0 ? Math.PI / 2 : -Math.PI / 2, seed: a.seed, dress: 'trousers', cloth: pick(['cloth_grey', 'cloth_brown', 'cloth_brown']), cloth2: 'cloth_grey', hat: 'brim', hatMat: pick(['cloth_black', 'cloth_brown', 'cloth_grey']), skin: pick(['skin_light', 'skin_light', 'skin_medium']), pose: 'stand' });
  { let placedW = 0;
    for (let k = 0; k < 400 && placedW < 10; k++) {
      const [sz] = STREETS[Math.floor(rand() * STREETS.length)], south = rand() < 0.5, x = -RADIUS + 50 + rand() * (2 * RADIUS - 150), z = sz + (south ? 2 : -2), rot = south ? -Math.PI / 2 : Math.PI / 2;
      if (!inside(x, z) || AVENUES.some(([ax, w]) => Math.abs(x - ax) < w / 2 + 9) || onBroadway(x, z, 8) || inLot(x, z, 1.5) || nearVehicle(x, z) || nearVehicle(x + 3 * Math.sign(-Math.sin(rot)), z) || L.some((c) => c.t === 'car' && Math.hypot(c.at[0] - x, c.at[1] - z) < 8.5)) continue;
      L.push({ t: 'cart', at: [x, z], y: height(x, z), rot, seed: Math.floor(rand() * 1e9), kind: 'two', load: pick(['barrels', 'sacks', 'hay', 'barrels']), beast: 'horse' });
      L.push({ t: 'figure', at: loc([x, z], rot, 1.0, -3.0), y: height(x, z), rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_ochre']), cloth2: 'cloth_brown', hat: 'cap', hatMat: pick(['cloth_black', 'cloth_brown']), skin: 'skin_light', pose: 'stand' });
      placedW++;
    }
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
  // the standing vehicles, the pushcarts and the apple crates (EXTRA: their own place, after the rest)
  for (const v of EXTRA.vehicles) items.push({ k: v.k, at: v.at, y: height(...v.at), rot: v.rot, seed: v.seed, ...(v.body ? { body: v.body } : {}) });
  for (const c of EXTRA.carts) items.push({ k: 'pushcart', at: c.at, y: height(...c.at), rot: c.rot, seed: c.seed, top: c.top });
  for (const a of EXTRA.apples) items.push({ k: 'crates', at: a.at, y: height(...a.at), rot: Math.PI / 2, seed: a.seed % 1e6 });
  const { segs, curbs } = pavements(), tiles = new Map(), slot = (p) => `${Math.floor(p[0] / 150)},${Math.floor(p[1] / 150)}`;
  const tile = (k) => { if (!tiles.has(k)) tiles.set(k, { segs: [], curbs: [], items: [] }); return tiles.get(k); };
  for (const s of segs) tile(slot([(s[0] + s[2]) / 2, (s[1] + s[3]) / 2])).segs.push(s);
  for (const c of curbs) tile(slot([(c[0] + c[2]) / 2, (c[1] + c[3]) / 2])).curbs.push(c);
  for (const it of items) tile(slot(it.at)).items.push(it);
  return [...tiles].map(([k, t]) => { const [i, j] = k.split(',').map(Number); return { ...base(`new-york-street-${k}`, [{ t: 'pavement', segs: t.segs, curbs: t.curbs }, { t: 'curb', items: t.items }]), center: toCity(i * 150 + 75, j * 150 + 75), near: 320 }; });
}
/**
 * Bryant Park behind the Library (docs §1l): gravel walks round the lawns and across them to a paved plaza at the middle, slatted benches
 * facing the walks (men in worn coats on many of them: it is 1931), lamp standards between. In grid-frame tiles like the streets.
 */
function parkPlans() {
  const [x0, z0, x1, z1] = BRYANT, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rand = rng0(1936), segs = [], plaza = [], items = [], seated = [];
  const strip = (a, b, c, d, out = segs) => { const nx = Math.max(1, Math.ceil((c - a) / 12)), nz = Math.max(1, Math.ceil((d - b) / 12)); for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const r = [a + (c - a) * i / nx, b + (d - b) * j / nz, a + (c - a) * (i + 1) / nx, b + (d - b) * (j + 1) / nz]; out.push([...r, height(r[0], r[1]), height(r[0], r[3])]); } };
  const I = 4.2, w = 3;
  strip(x0 + I, z0 + I, x1 - I, z0 + I + w); strip(x0 + I, z1 - I - w, x1 - I, z1 - I); strip(x0 + I, z0 + I + w, x0 + I + w, z1 - I - w); strip(x1 - I - w, z0 + I + w, x1 - I, z1 - I - w);
  strip(x0 + I + w, cz - 2, cx - 7, cz + 2); strip(cx + 7, cz - 2, x1 - I - w, cz + 2); strip(cx - 2, z0 + I + w, cx + 2, cz - 7); strip(cx - 2, cz + 7, cx + 2, z1 - I - w);
  strip(cx - 7, cz - 7, cx + 7, cz + 7, plaza);
  // benches facing the walks, a lamp standard between every few
  const bench = (x, z, rot) => { items.push({ k: 'bench', at: [x, z], y: height(x, z), rot, seed: Math.floor(rand() * 1e6) }); if (rand() < 0.4) seated.push({ at: [x, z], y: height(x, z) + 0.0, rot, men: rand() < 0.7 }); };
  const lamp = (x, z) => items.push({ k: 'lampost', at: [x, z], y: height(x, z), rot: 0, seed: 1 });
  const L = [[x0 + I + w / 2, z0 + I + w / 2, x1 - I - w / 2, z0 + I + w / 2], [x0 + I + w / 2, z1 - I - w / 2, x1 - I - w / 2, z1 - I - w / 2], [x0 + I + w / 2, z0 + I + w / 2, x0 + I + w / 2, z1 - I - w / 2], [x1 - I - w / 2, z0 + I + w / 2, x1 - I - w / 2, z1 - I - w / 2]];
  for (const [a, b, c, d] of L) {
    const horiz = b === d, len = horiz ? c - a : d - b;
    for (let t = 7; t < len - 4; t += 13) for (const sd of [-1, 1]) {
      const x = horiz ? a + t : a + sd * (w / 2 + 0.6), z = horiz ? b + sd * (w / 2 + 0.6) : b + t;
      if ((horiz ? x : z) % 2 > 2.5 && rand() < 0.3) continue;
      // facing the walk: the bench's front (+z in its frame) toward the path's middle
      const toward = horiz ? (sd > 0 ? Math.PI : 0) : (sd > 0 ? -Math.PI / 2 : Math.PI / 2);
      bench(x, z, toward + Math.PI);   // (the seat's front is −z in its frame)
    }
    for (let t = 14; t < len - 6; t += 26) { const x = horiz ? a + t : a + w / 2 + 0.9, z = horiz ? b + w / 2 + 0.9 : b + t; lamp(horiz ? x : a - w / 2 - 0.9, horiz ? z : z); }
  }
  for (const sd of [-1, 1]) { bench(cx + sd * 8.5, cz - 9, Math.PI); bench(cx + sd * 8.5, cz + 9, 0); bench(cx - 9, cz + sd * 8.5, -Math.PI / 2); bench(cx + 9, cz + sd * 8.5, Math.PI / 2); lamp(cx + sd * 7.8, cz + sd * 7.8); lamp(cx + sd * 7.8, cz - sd * 7.8); }
  const tile = base('new-york-park', [{ t: 'pavement', segs, curbs: [], mat: 'pebbles' }, { t: 'pavement', segs: plaza, curbs: [], mat: 'granite_block' }, { t: 'curb', items }]);
  const DR = ['cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_indigo'], pick = (a) => a[Math.floor(rand() * a.length)];
  const people = seated.map((p) => placed({ t: 'figure', at: [p.at[0], p.at[1]], y: p.y + 0.0, rot: p.rot, seed: Math.floor(rand() * 1e9), skin: pick(['skin_light', 'skin_light', 'skin_medium']), pose: 'sit', dress: p.men ? 'trousers' : 'robe', cloth: pick(DR), cloth2: 'cloth_white', hat: p.men ? 'brim' : 'cap', hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']) }));
  return [{ ...tile, center: toCity(cx, cz), near: 260 }, { ...base('new-york-park-life', []), elements: people, style: 'life', center: toCity(cx, cz), near: 200 }];
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
/** The people of Grand Central's Main Concourse (life style): travellers on the benches and waiting at the gates, the queue at the ticket windows, the crowd at the information booth, red-capped porters among them. */
function gctLife() {
  const rand = rng(1935), [x0, z0, x1, z1] = GCT, y = height((x0 + x1) / 2, (z0 + z1) / 2);
  const DR = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_grey'], pick = (a) => a[Math.floor(rand() * a.length)];
  const list = concoursePeople({ x0, z0, x1, z1, zc: z1 - 8 - 1.6, y, T: 1.2 }).map((p, i) => {
    const woman = rand() < 0.4, porter = p.role === 'walk' && i % 4 === 0;
    return placed({ t: 'figure', at: p.at, y: p.y, rot: p.rot, seed: Math.floor(rand() * 1e9), skin: pick(['skin_light', 'skin_light', 'skin_medium', 'skin_dark']), pose: p.role === 'sit' ? 'sit' : 'stand',
      dress: woman && !porter ? 'robe' : 'trousers', cloth: porter ? 'cloth_black' : pick(DR), cloth2: pick(['cloth_white', 'cloth_grey']), hat: porter ? 'cap' : woman ? pick(['cap', 'none']) : 'brim', hatMat: porter ? 'cloth_red' : pick(['cloth_black', 'cloth_grey', 'cloth_brown']), ...(porter ? { over: 'belt' } : {}) });
  });
  return { ...base('new-york-gct-life', []), elements: list, style: 'life', center: toCity((x0 + x1) / 2, (z0 + z1) / 2), near: 160 };
}
/** The Library's people (life style): readers at the long tables of the Main Reading Room, librarians at the desks, visitors in Astor Hall. */
function libraryLife() {
  const rand = rng(1937), y = height((LIBRARY[0] + LIBRARY[2]) / 2, (LIBRARY[1] + LIBRARY[3]) / 2), DR = ['cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_indigo'], pick = (a) => a[Math.floor(rand() * a.length)];
  const list = libraryPeople(LIBRARY, y).map((p) => { const woman = rand() < 0.4, desk = p.role === 'desk';
    return placed({ t: 'figure', at: p.at, y: p.y, rot: p.rot, seed: Math.floor(rand() * 1e9), skin: pick(['skin_light', 'skin_light', 'skin_medium']), pose: p.role === 'read' ? 'sit' : 'stand', dress: woman ? 'robe' : 'trousers', cloth: pick(DR), cloth2: desk ? 'cloth_white' : pick(['cloth_white', 'cloth_grey']), hat: p.role === 'read' || desk ? 'none' : woman ? pick(['cap', 'none']) : 'brim', hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']) }); });
  return { ...base('new-york-library-life', []), elements: list, style: 'life', center: toCity((LIBRARY[0] + LIBRARY[2]) / 2, (LIBRARY[1] + LIBRARY[3]) / 2), near: 160 };
}
export async function buildings() {
  const all = lots(), plans = [];
  // the painted advertisements on the bare side walls: a side that stands 8 m or more above its neighbour's roof (the block's ends are the streets' fronts and keep their shops), one side in three
  const adsOf = (l) => {
    if (l.h >= 70 || l.row || l.h < 24 || !nearEntrance(...l.rect.slice(0, 2))) return undefined;
    const out = [], r = rng(l.seed ^ 0xad5);
    for (const [f, edge, key] of [['e', l.rect[2], 0], ['w', l.rect[0], 2]]) {
      const n = all.find((o) => o !== l && o.front === l.front && Math.abs((key ? o.rect[2] : o.rect[0]) - edge) < 1.2 && o.rect[1] < l.rect[3] - 1 && o.rect[3] > l.rect[1] + 1);
      if (n && l.h - n.h >= 8 && r() < 0.34) out.push({ f, y0: n.h });
    }
    return out.length ? out : undefined;
  };
  for (let i = 0; i < all.length; i += 50) plans.push(base(`new-york-blocks-${i / 50}`, all.slice(i, i + 50).flatMap((l) => special(l) ?? [{ t: 'skyscraper', ...l, chimney: chimneyAt(l), ads: adsOf(l) }])));
  const dl = dinerLife(), c = toCity(...DINER_AT);
  return [...plans, ...streetLife(), ...yards(), ...pavePlans(), ...parkPlans(), ...shopLife(), gctLife(), libraryLife(), { ...base('new-york-diner-life', []), elements: dl, style: 'life', center: c, near: 200 }];
}
