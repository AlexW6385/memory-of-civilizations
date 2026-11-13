// The entered houses and osterie of Venice, lit and lived in (docs/settlements/venice.md §5c). The shared `house_med` builds the furnished ground
// floor of each (its tables, counter, hearth, bed); here, in the same frame (u along the front from the door's side, v inward), the lamp that
// lights it and the people at home: the innkeeper and two patrons, or the housewife at the hearth and the master on his stool. Pure data, from the lots.
import { ARRIVALS } from '../../planet/arrivals.js';
import { GROUND, RADIUS, lots, wet, inLot } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const ARRIVAL = [ARRIVALS['venice'][0], ARRIVALS['venice'][2]];
const MEN = ['cloth_brown', 'cloth_black', 'cloth_indigo', 'cloth_ochre', 'cloth_red'], WOMEN = ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_brown'];

/** The items (lamps and people) of one entered house { rect, front, seed } of use 'inn' | 'home', in world coordinates. */
export function roomItems(lot, use) {
  const [x0, z0, x1, z1] = lot.rect, f = lot.front || 's', r = rng(lot.seed + 505), T = 0.4, fy = (lot.y ?? GROUND) + 0.6;
  const L = x1 - x0, D = z1 - z0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : [x0 + u, z0 + v]);
  const face = ([du, dv]) => { const dx = f === 's' ? -du : du, dz = f === 's' ? -dv : dv; return Math.atan2(-dx, -dz); };
  const out = [], pick = (a) => a[Math.floor(r() * a.length)];
  const man = (u, v, fc, o = {}) => out.push({ k: 'person', at: P(u, v), y: fy, rot: face(fc), seed: Math.floor(r() * 1e9), dress: r() < 0.7 ? 'robe' : 'tunic', legs: 'hose', cloth: pick(MEN), cloth2: pick(MEN), skin: 'skin_light', hat: r() < 0.6 ? 'cap' : 'none', over: 'none', pose: 'stand', ...o });
  const woman = (u, v, fc, o = {}) => out.push({ k: 'person', at: P(u, v), y: fy, rot: face(fc), seed: Math.floor(r() * 1e9), dress: 'robe', cloth: pick(WOMEN), cloth2: 'cloth_white', skin: 'skin_light', hat: 'veil', hair: 'bun', over: 'shawl', pose: 'stand', ...o });
  if (use === 'inn') {
    const nt = Math.max(1, Math.floor((L - 2.6) / 2.2)), u0 = 1.6;
    if (u0 <= L - 1.8) out.push({ k: 'lamp', at: P(u0, D * 0.62 - 0.2), y: fy + 0.78 });
    out.push({ k: 'lamp', at: P(L - T - 0.6, D / 2 + 0.28), y: fy + 1.1, intensity: 2.0 });
    man(L - T - 1.25, D * 0.5, [1, 0], { over: 'apron', hat: 'none', cloth: 'cloth_white' });                       // the host, across his counter
    if (nt >= 1 && D * 0.38 - 0.55 > 0.8) {
      man(u0 - 0.2, D * 0.38 - 0.55, [0, 1], { pose: 'sit', over: 'cape', cloth: 'cloth_black' });                    // two patrons on the bench at the first table
      man(u0 + 0.35, D * 0.38 - 0.55, [0, 1], { pose: 'sit', over: 'none' });
    }
    if (nt >= 2 && r() < 0.7) woman(u0 + 2.2, D * 0.62 + 0.55, [0, -1], { pose: 'sit' });
  } else {
    out.push({ k: 'lamp', at: P(L / 2 + 0.05, D * 0.45 + 0.22), y: fy + 0.78 });
    const hu = L - 1.6 > 2 ? L - 1.6 : L / 2;
    if (r() < 0.75) woman(hu, D - T - 1.3, [0, 1], { pose: 'stand' });                                            // the housewife at the hearth
    if (r() < 0.6) man(L / 2 + 0.9, D * 0.45, [-1, 0], { pose: 'sit', over: pick(['none', 'cape']) });            // the master on his stool
    if (r() < 0.3) out.push({ k: 'person', at: P(L / 2 - 0.9, D * 0.45), y: fy, rot: face([1, 0]), seed: Math.floor(r() * 1e9), child: true, dress: 'tunic', cloth: pick(MEN), skin: 'skin_light', hat: 'cap', pose: 'sit' });
  }
  return out;
}

/** Plans of the rooms' lamps and people, one per 100 m tile, built only near: `open` is the map lot → use. */
export function roomPlans(open) {
  const tiles = new Map(), fronts = new Map(), A = ARRIVAL;
  // the shop fronts: a third of the houses within 170 m of the arrival that are not entered, on a front that has the calle before it (not a neighbour's wall or the water), get the bottega's striped awning
  for (const lot of lots()) {
    const [x0, z0, x1, z1] = lot.rect, c = [(x0 + x1) / 2, (z0 + z1) / 2];
    if (open.has(lot) || x1 - x0 < 6.5 || Math.hypot(c[0] - A[0], c[1] - A[1]) > 170 || rng(lot.seed + 909)() > 0.34) continue;
    const s = lot.front === 's' ? 1 : -1, zf = s > 0 ? z1 : z0;
    if ([0.5, 0.25, 0.75].some((t) => { const x = x0 + (x1 - x0) * t, z = zf + s * 1.5; return inLot(x, z, 0.1) || wet(x, z) < 1.2; })) continue;
    const k = `${Math.floor(c[0] / 100)},${Math.floor(c[1] / 100)}`;
    if (!fronts.has(k)) fronts.set(k, []);
    fronts.get(k).push({ rect: lot.rect, front: lot.front, y: lot.y ?? GROUND, seed: lot.seed });
  }
  for (const [lot, use] of open) {
    const c = [(lot.rect[0] + lot.rect[2]) / 2, (lot.rect[1] + lot.rect[3]) / 2], k = `${Math.floor(c[0] / 100)},${Math.floor(c[1] / 100)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(...roomItems(lot, use));
  }
  const keys = new Set([...tiles.keys(), ...fronts.keys()]);
  return [...keys].map((k) => {
    const [i, j] = k.split(',').map(Number), items = tiles.get(k), fr = fronts.get(k);
    return { id: `venice-rooms-${k}`, style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-120, -5], facing: 'e' }, center: [i * 100 + 50, j * 100 + 50], near: 130, nocollide: true, elements: [...(items ? [{ t: 'ven_room', items }] : []), ...(fr ? [{ t: 'ven_front', items: fr }] : [])] };
  });
}
