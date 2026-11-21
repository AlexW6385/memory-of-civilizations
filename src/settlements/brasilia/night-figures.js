// The people who belong to Brasília's night (docs/settlements/brasilia.md §17): the keepers of the shops that stay lit in the evening (the snack bar,
// the pharmacy on duty, the bakery), a late customer at each snack-bar kiosk, the extra guards at the two palaces' ramps, a couple under the new apron lamp.
// All [inferred]. Each takes `nightKeep: 1`, so it stays when the other figures leave at dusk (src/objects/kit.js nightDusk).
// Pure data from places: no rand() of the town's stream (this runs after every other figure is made), seeds fixed here.
import { GALLERY, STRIP, KIOSKS, inBuilding } from './layout.js';

const LIT = ['lanchonete', 'farmacia', 'padaria'];
export function nightFigures(P) {
  let n = 0;
  const add = (at, rot, o = {}) => {
    const k = n++, w = o.w ?? k % 2 === 1;
    P.push({ t: 'figure', at, y: o.y ?? 0, rot, seed: 19700000 + k * 7919, skin: ['skin_light', 'skin_medium', 'skin_dark'][k % 3], pose: o.pose, nightKeep: 1,
      ...(o.kind === 'guard' ? { dress: 'trousers', cloth: 'prussian_blue', cloth2: 'prussian_blue', hat: 'cap', hair: 'short', over: 'belt' }
        : w ? { dress: 'robe', cloth: ['cloth_white', 'cloth_blue', 'cloth_ochre'][k % 3], cloth2: 'cloth_white', hat: 'none', hair: 'bun', over: 'none' }
          : { dress: 'trousers', cloth: ['cloth_white', 'cloth_blue', 'cloth_ochre'][k % 3], cloth2: 'cloth_grey', hat: 'none', hair: 'short', over: o.apron ? 'apron' : 'collar' }) });
  };
  // the keepers of the lit shops, behind their counters (where the day's keepers stand: town.js)
  for (const u of [...GALLERY, ...STRIP]) if (LIT.includes(u.trade)) add([u.strip[0] + 7.4 + 0.6, u.z + 3.6 - 0.9], 0, { apron: true });
  // a late customer at each snack-bar kiosk's window, beside the day's customer
  KIOSKS.forEach(([x, z, r, kind], i) => {
    if (kind !== 'lanchonete' || (i >= 6 && inBuilding(x, z, 2))) return;
    const q = r % 4, dx = [0, 1.8, 0, -1.8][q], dz = [1.8, 0, -1.8, 0][q], sx = [0.9, 0, -0.9, 0][q], sz = [0, -0.9, 0, 0.9][q];
    add([x + dx + sx, z + dz + sz], [0, Math.PI / 2, Math.PI, -Math.PI / 2][q], { w: false });
  });
  // sentries at the two palaces' ramps, outside the walk's lanes (the day's pair stand at 200 and 206)
  add([196.5, -141], Math.PI, { kind: 'guard', y: 0.3 }); add([209.5, -141], Math.PI, { kind: 'guard', y: 0.3 });
  add([196.5, 140.5], 0, { kind: 'guard', y: 0.3 }); add([210.5, 140.5], 0, { kind: 'guard', y: 0.3 });
  // a couple talking under the low lamp at the arrival's apron (lamps.js, [-114, 10])
  add([-112.6, 10.9], Math.PI, { pose: 'talk', w: false }); add([-112.6, 9.7], 0, { pose: 'talk', w: true });
}
