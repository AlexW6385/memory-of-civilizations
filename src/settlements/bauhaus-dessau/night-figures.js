// The people who belong to Dessau's night (docs/settlements/bauhaus-dessau.md §16): late workers behind the lit glass wall, the Aula's evening, the pubs' guests,
// a couple under a lamp, the tram's driver. All [inferred]. Each takes `nightKeep: 1`, so it stays when the other figures leave at dusk (src/objects/kit.js nightDusk).
// Pure data from places: no rand() of the town's stream (this runs after every other figure is made), seeds fixed here.
import { ARRIVALS } from '../../planet/arrivals.js';
import { LV, TRAM_STOP, TRAM_TRACKS } from './layout.js';
import { lampSites } from './lamps.js';
import { nearShops } from './walks.js';

const MEN = ['cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_black'], WOM = ['cloth_blue', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_grey'];
const face = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));

export function nightFigures(P) {
  let n = 0;
  const add = (at, rot, o = {}) => {
    const k = n++;
    P.push({ t: 'figure', at, y: 0, rot, seed: 19270000 + k * 7919, dress: 'trousers', cloth: MEN[k % 4], cloth2: 'cloth_grey', skin: 'skin_light', hat: 'none', hair: 'short', hairMat: k % 2 ? 'hair_dark' : 'hide_brown', feet: 'shod', beard: false, pose: 'stand', nightKeep: 1, ...o });
  };
  const wom = (at, rot, o = {}) => add(at, rot, { dress: 'robe', cloth: WOM[n % 5], over: 'none', ...o });
  // behind the glass wall: late work in the carpentry (floor 0), the weaving and the metal workshop (the wall's lit bays)
  add([-10.4, 21.4], 3.14, { y: LV.f0, cloth: 'cloth_brown', cloth2: 'cloth_brown', over: 'apron' });
  wom([-12.6, 22.4], 3.14, { y: LV.f1, hair: 'bun' });
  wom([-9.2, 24.6], 1.57, { y: LV.f1, hair: 'bun' });
  add([-10.6, 20.2], 3.14, { y: LV.f2, cloth: 'cloth_indigo', cloth2: 'cloth_indigo', over: 'apron' });
  // the Aula in the evening: a party, four talking in the hall, one at the stage
  add([14.2, 21.8], 1.0, { y: LV.f0, pose: 'talk' }); wom([15.2, 22.4], 4.2, { y: LV.f0, pose: 'talk' });
  add([18.6, 27.0], 2.4, { y: LV.f0, pose: 'talk', beard: true }); wom([17.6, 26.2], 5.5, { y: LV.f0, pose: 'talk' });
  add([24.4, 24.0], 1.57, { y: LV.f0 });
  // the pubs near the arrival: two guests before the door (out of its lane), one inside at the counter
  for (const d of nearShops(14).filter((q) => q.kind === 'pub').slice(0, 3)) {
    const dx = d.door[0] - d.out[0], dz = d.door[1] - d.out[1], m = Math.hypot(dx, dz) || 1, px = -dz / m, pz = dx / m;
    const a = [d.out[0] + px * 2.2, d.out[1] + pz * 2.2], b = [a[0] + px * 0.8, a[1] + pz * 0.8];
    add(a, face(a, b), { pose: 'talk', hat: 'brim', cloth: 'cloth_black' }); add(b, face(b, a), { pose: 'talk', hat: 'cap' });
    add([d.in[0] + px * 1.0, d.in[1] + pz * 1.0], face(d.in, d.inner), { y: 0.12, over: 'apron', cloth: 'cloth_white' });
  }
  // a couple under the lamp nearest the arrival
  const A = ARRIVALS['bauhaus-dessau'], L = lampSites().slice().sort((p, q) => Math.hypot(p[0] - A[0], p[1] - A[2]) - Math.hypot(q[0] - A[0], q[1] - A[2]))[0];
  if (L) { const a = [L[0] + 1.3, L[1] + 0.6], b = [L[0] + 1.3, L[1] - 0.4]; add(a, face(a, b), { pose: 'talk', hat: 'brim', cloth: 'cloth_black' }); wom(b, face(b, a), { pose: 'talk' }); }
  // the tram's driver at the front of the standing car
  add([TRAM_STOP[0] + 5 + 3.4, TRAM_TRACKS[1]], 1.57, { y: 0.8, hat: 'cap', cloth: 'cloth_indigo' });
}
