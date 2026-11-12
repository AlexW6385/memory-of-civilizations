import { ARRIVALS } from '../../planet/arrivals.js';
// The timber houses of the slopes (docs/settlements/ottoman-istanbul.md §5); the coffee house on the lane west of the
// terrace by the Tiryaki shops (§10); the street life (§10, life.js).
import { RADIUS, lots, COFFEE } from './layout.js';
import { lifePlan } from './life.js';
/** The houses and shops that can be entered (many): the nearest to four points round the terrace, the shops by preference. */
function openSet(all) {
  const out = new Set(), ok = all.filter((l) => l.rect[2] - l.rect[0] >= 4.5 && l.rect[3] - l.rect[1] >= 4.5);
  for (const [px, pz, nShop, nHome] of [[0, -135, 8, 4], [-176, 40, 8, 4], [176, 40, 8, 4], [0, 185, 8, 4], [-176, -80, 4, 2], [176, -80, 4, 2]]) {
    const d = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - px, (l.rect[1] + l.rect[3]) / 2 - pz), srt = ok.filter((l) => !out.has(l)).sort((a, b) => d(a) - d(b)).slice(0, 60);
    srt.filter((l) => l.shop).slice(0, nShop).forEach((l) => out.add(l)); srt.filter((l) => !l.shop).slice(0, nHome).forEach((l) => out.add(l));
  }
  return out;
}
/** The houses cut into 160 m tiles in two levels (as lod.js, but coarser: the mesh count is plan x material, DESIGN §8; budget). */
const TILE = 160;
function tiles(id, style, elements, { near = 240, R = RADIUS } = {}) {
  const map = new Map();
  for (const e of elements) {
    const x = (e.rect[0] + e.rect[2]) / 2, z = (e.rect[1] + e.rect[3]) / 2, k = `${Math.floor(x / TILE)},${Math.floor(z / TILE)}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of map) {
    const [i, j] = k.split(',').map(Number), center = [i * TILE + TILE / 2, j * TILE + TILE / 2];
    const b = { style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-R, -R, R, R], entrance: { at: [0, 0], facing: 'n' }, center };
    plans.push({ ...b, id: `${id}-${k}`, near, elements: list });
    plans.push({ ...b, id: `${id}-${k}-far`, far: near, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -100], facing: 's' } });
export async function town() {
  const coffee = COFFEE(), all = lots().filter((l) => l !== coffee), plans = [], open = openSet(all);
  plans.push(...tiles('ottoman-istanbul-houses', 'ottoman', all.map((l) => ({ t: 'ottoman_house', ...l, ...(l.shop ? { shop: true, use: l.trade } : {}), ...(open.has(l) ? { open: true, use: l.shop ? l.trade : 'home' } : {}) })), { R: RADIUS }));
  const [x0, z0, x1, z1] = coffee.rect;
  plans.push({ ...base('ottoman-istanbul-kahvehane', [{ t: 'kahvehane', rect: coffee.rect, y: coffee.y, foot: coffee.foot, front: 'e', seed: coffee.seed }]), style: 'ottoman', bounds: [x0 - 2, z0 - 2, x1 + 2, z1 + 2],
    rooms: [{ id: 'coffee house', rect: [x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4], y: coffee.y + 0.45, kind: 'hall' }] });
  plans.push(lifePlan());
  return plans;
}
