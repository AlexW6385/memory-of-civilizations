// Paris in 1248 — the lodgings and offices along the palace court's south side (docs/settlements/paris.md §5d): the court has no
// ordinary houses of its own at the arrival, so the row that served it is built and furnished here: the panetier's bakehouse, the
// buttery, the cooper, the chandler who lit the chapel, the clerks' scriveners, the fishmonger and butcher of the kitchens, a
// pilgrims' inn at the gate and a joiner's shop. Each can be entered, has its hanging lamp, its goods and its people.
import { RIVER } from './layout.js';
import { lodTiles } from '../lod.js';
import { shopPoint, upperRoutes } from '../../styles/gothic/houses.js';

import { courtLots } from './court-lots.js';
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export { courtLots };

export function courtHouses() {
  const y = RIVER.ground, opts = { near: 200, R: 420, entrance: { at: [-250, -10], facing: 'e' } };
  return lodTiles('paris-court-houses', 'gothic', courtLots().map((l) => ({ t: 'paris_house', noLantern: true, y, foot: y, rect: l.rect, seed: l.seed, front: 'n', storeys: l.storeys, open: true, lit: true, upper: l.upper })), opts);
}
/** Who is inside and at the doors: the master behind the counter, a customer, goods and a lantern outside. */
export function courtHouseLife() {
  const rand = lrng(1261), L = [], y0 = RIVER.ground, pick = (a) => a[Math.floor(rand() * a.length)];
  const CL = ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
  const fig = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, h: 1.56 + rand() * 0.18, seed: Math.floor(rand() * 1e9), dress: rand() < 0.5 ? 'robe' : 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_light', hat: pick(['cap', 'none', 'brim', 'cap']), hatMat: pick(['cloth_brown', 'cloth_red', 'cloth_black', 'cloth_white']), legs: 'hose', feet: 'shod', hair: pick(['short', 'long', 'short']), ...o });
  for (const l of courtLots()) {
    {
      const sp = shopPoint({ rect: l.rect, y: 1, seed: l.seed, front: 'n' }), [ox, oz] = sp.out, q = (a, b) => [sp.at[0] + ox * a - oz * b, sp.at[1] + oz * a + ox * b];
      if (l.i % 3 !== 2) fig(sp.inside, y0 + 0.1, faceTo(sp.inside, sp.at), { pose: 'stand', over: pick(['sash', 'none']), carry: 'none' });
      if (l.i % 2 === 0) { const a = q(0.2, (rand() - 0.5) * 1.2); fig(a, y0, faceTo(a, [a[0] - ox, a[1] - oz]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.4 ? 'basket' : 'none' }); }
      switch (sp.trade) {
        case 'cooper': L.push({ t: 'barrel', at: q(1.4, 1.2), y: y0, rot: rand() * 6, n: 3, seed: Math.floor(rand() * 1e6) }); break;
        case 'baker': L.push({ t: 'sacks', at: q(1.3, 1.5), y: y0, rot: rand() * 6, n: 3, seed: Math.floor(rand() * 1e6) }); break;
        case 'tavern': L.push({ t: 'bench', at: q(1.5, 1.4), y: y0, rot: Math.PI / 2, len: 1.6 }, { t: 'barrel', at: q(1.0, -1.7), y: y0, rot: 0, n: 2, seed: Math.floor(rand() * 1e6) }); break;
        case 'butcher': L.push({ t: 'crates', at: q(1.2, 1.4), y: y0, rot: rand() * 6, seed: Math.floor(rand() * 1e6) }); break;
        case 'fishmonger': L.push({ t: 'basket', at: q(1.1, 1.0), y: y0, rot: 0, s: 1, seed: Math.floor(rand() * 1e6) }); break;
        default: L.push({ t: 'basket', at: q(1.1, 1.2), y: y0, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
      }
      // (no lantern at the door: none is attested for 1248)
    }
  }
  return { id: 'paris-court-houses-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [-250, -10], facing: 'e' }, bounds: [-260, 10, -120, 60], rooms: [], elements: L };
}
/** Walk-check routes (world [x, z]) from the court to the top storey's room, the attic and the gallery of each house with rooms above. */
export function upperWalks() {
  const out = [];
  for (const l of courtLots()) {
    if (!l.upper) continue;
    for (const r of Object.values(upperRoutes({ rect: l.rect, seed: l.seed, front: 'n', storeys: l.storeys, upper: l.upper }))) { const w = r.map(([x, z]) => [x, z]); w.y0 = 0; out.push(w); }
  }
  return out;
}
