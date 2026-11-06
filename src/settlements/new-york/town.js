// The blocks' buildings (docs/settlements/new-york.md §5) and the street's life (§5a): the traffic of
// 1931 on the avenues and cross streets — Checker and Yellow cabs among black, cream and blue
// motor cars — people on the pavements, lamp posts along the avenues.
import { RADIUS, AVENUES, STREETS, lots, height, onBroadway, inLot, onElStair, inSpecial, streetZ, inRect, GRID, toCity } from './layout.js';
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
const nearStand = (x, z, m) => NEWSSTANDS.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < m);
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
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 150)},${Math.floor(e.at[1] / 150)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`new-york-life-${k}`, []), elements: list.map(placed), style: 'life', center: toCity(i * 150 + 75, j * 150 + 75), near: 260 }; });
}
/** The tenements' rear yards east of Lexington Avenue, washing on the lines from their back windows to a pole (§1d). */
function yards() {
  const rand = rng0(1932), out = [...NEWSSTANDS], all = lots();
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
export async function buildings() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 50) plans.push(base(`new-york-blocks-${i / 50}`, all.slice(i, i + 50).map((l) => ({ t: 'skyscraper', ...l }))));
  return [...plans, ...streetLife(), ...yards()];
}
