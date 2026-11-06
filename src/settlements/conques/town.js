import { openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The village (docs/settlements/conques.md §5): schist and limestone houses with lauze roofs on the slope;
// and its people (§5a): pilgrims on the road to Santiago before the west portal, in hats and cloaks with their
// staffs, looking up at the tympanum; others coming down the lane; monks of the abbey by the cloister.
import { RADIUS, ABBEY, lots, height } from './layout.js';
const base = (id, elements, style = 'vernacular') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, 0], facing: 'e' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0

function people() {
  const rand = rng(1120), L = [], S = [];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const pilgrim = (at, rot, pose = 'stand') => {
    const y = height(...at), H = 1.56 + rand() * 0.16, k = H / 1.65;
    L.push({ t: 'figure', at, y, rot, h: H, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_brown', 'cloth_ochre']), cloth2: pick(['cloth_grey', 'cloth_brown']), skin: 'skin_light', hat: rand() < 0.7 ? 'brim' : 'cap', hatMat: pick(['cloth_brown', 'cloth_black', 'cloth_grey']), pose });
    if (pose !== 'stand') return;
    // the staff in the right hand, its foot on the ground beside the right foot
    const hx = 0.235 * k, hz = -0.06 * k, c = Math.cos(rot), s = Math.sin(rot);
    S.push({ t: 'bourdon', at: [at[0] + hx * c + hz * s, at[1] - hx * s + hz * c], y, h: 1.75 + rand() * 0.2 });
  };
  const monk = (at, rot, pose = 'stand') => L.push({ t: 'figure', at, y: height(...at), rot, h: 1.62 + rand() * 0.12, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', skin: 'skin_light', hat: 'veil', hatMat: 'cloth_black', pose });
  // before the west front: a knot of pilgrims looking up at the Judgement, two sitting on the terrace's edge
  const portal = [ABBEY.origin[0] + 1, 0];
  for (let k = 0; k < 9; k++) {
    const p = [ABBEY.origin[0] - 7 - rand() * 6, (rand() - 0.5) * 9];
    pilgrim(p, face(p, portal) + (rand() - 0.5) * 0.4);
  }
  for (const z of [-7.5, 6.8]) pilgrim([ABBEY.origin[0] - 12.5 + rand(), z], face([0, z], [0, 0]) + 0.6, 'sit');
  // coming down the lane north-west of the church onto the terrace
  for (let k = 0; k < 4; k++) { const p = [ABBEY.origin[0] - 22 + k * 1.6 + rand() * 0.6, -26 + k * 4.5]; pilgrim(p, face(p, [p[0] + 1.6, p[1] + 4.5])); }
  // monks at the cloister's west door and on the terrace south of the nave
  monk([ABBEY.origin[0] - 2.2, 16.2], face([0, 16.2], [1, 16.2]));
  monk([ABBEY.origin[0] - 2.4, 17.6], face([0, 17.6], [1, 16.6]), 'talk');
  monk([ABBEY.origin[0] - 6, 4.5], face([ABBEY.origin[0] - 6, 4.5], [ABBEY.origin[0] - 9, 2]), 'talk');
  return [base('conques-people', L, 'life'), base('conques-staffs', S, 'romanesque')];
}

export async function houses() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['conques'][0], ARRIVALS['conques'][2]]);
  for (let i = 0; i < all.length; i += 160) plans.push(base(`conques-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'house_rouergue', ...l, ...(open.has(l) ? { open: true } : {}) }))));
  return [...plans, ...people()];
}
