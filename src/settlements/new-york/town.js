// The blocks' buildings (docs/settlements/new-york.md §5) and the street's life (§5a): the traffic of
// 1931 on the avenues and cross streets — Checker and Yellow cabs among black, cream and blue
// motor cars — people on the pavements, lamp posts along the avenues.
import { RADIUS, AVENUES, STREETS, lots, height, onBroadway, inLot, onElStair } from './layout.js';
const base = (id, elements) => ({ id, style: 'artdeco', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [4, 176], facing: 's' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function streetLife() {
  const rand = rng(1931), L = [], inside = (x, z) => Math.hypot(x, z) < RADIUS - 45;
  const crossing = (x, z, m) => AVENUES.some(([ax, w]) => Math.abs(x - ax) < w / 2 + m) && STREETS.some(([sz, w]) => Math.abs(z - sz) < w / 2 + m);
  const car = (x, z, rot) => {
    if (!inside(x, z) || crossing(x, z, 2) || onBroadway(x, z, 2) || inLot(x, z, 1.5)) return;
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
      if (!inside(x, z) || inLot(x, z, 0.6) || crossing(x, z, 0) || onElStair(x, z, 1)) continue;
      const woman = rand() < 0.4;
      L.push({ t: 'figure', at: [x + (rand() - 0.5) * 1.6, z], y: height(x, z), rot: rand() < 0.5 ? 0 : Math.PI, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'trousers', cloth: pick(DRESS), cloth2: pick(['cloth_white', 'cloth_grey', 'cloth_black']), skin: pick(['skin_light', 'skin_light', 'skin_medium', 'skin_dark']), hat: woman ? pick(['cap', 'none']) : 'brim', hatMat: pick(['cloth_black', 'cloth_grey', 'cloth_brown']) });
    }
    for (let z = -RADIUS + 10; z < RADIUS; z += 30) { const xx = ax + sg * (w / 2 + 0.5); if (inside(xx, z) && !inLot(xx, z, 0.4) && !crossing(xx, z, 1) && !onElStair(xx, z, 0.5)) L.push({ t: 'street_lamp', at: [xx, z], y: height(xx, z), h: 5.5, seed: z }); }
  }
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 150)},${Math.floor(e.at[1] / 150)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`new-york-life-${k}`, list), style: 'life', center: [i * 150 + 75, j * 150 + 75], near: 260 }; });
}
export async function buildings() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 50) plans.push(base(`new-york-blocks-${i / 50}`, all.slice(i, i + 50).map((l) => ({ t: 'skyscraper', ...l }))));
  return [...plans, ...streetLife()];
}
