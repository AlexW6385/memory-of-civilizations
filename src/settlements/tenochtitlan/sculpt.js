// The carved figures where the visitor walks, in two levels by his distance (docs/settlements/tenochtitlan.md §19): the old forms (the
// Kit carvings, stacked solids) from `far` metres, the modelled sculpture (src/styles/aztec/carve.js) within `near`. Each group is the
// same element built twice by its `mode` ('old' | 'new'): the structure stays in the precinct plan (mode 'struct'), these plans hold the
// figures only. The viewer batches a level's meshes per material (src/engine/merge.js).
import { RADIUS, TM, TZOMPANTLI, EAGLE_HOUSE } from './layout.js';

const base = (id, elements, o = {}) => ({ id, style: 'aztec', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-60, 0], facing: 'e' }, ...o });
const tm = { t: 'templo_mayor', c: TM.c, w: TM.w, d: TM.d, h: TM.h, terraces: 4, top: TM.top };
const tz = { t: 'tzompantli', rect: TZOMPANTLI, h: 4.6 };
const eh = { t: 'eagle_house', rect: EAGLE_HOUSE, seed: 3 };
const w1 = TM.top.w / 2, sx1 = TM.c[0] - w1, sx0 = sx1 - TM.h * 0.9;

/** [id, element, centre, distance (m) within which the modelled form is shown]. */
const GROUPS = [
  ['tm-foot', { ...tm, parts: ['heads', 'coyol'] }, [sx0 - 2, 8], 45],
  ['tm-summit', { ...tm, parts: ['summit'] }, [sx1 + 2, 0], 42],
  ['tzompantli', tz, [(TZOMPANTLI[0] + TZOMPANTLI[2]) / 2, (TZOMPANTLI[1] + TZOMPANTLI[3]) / 2 - 2], 40],
  ['eagle-house', eh, [(EAGLE_HOUSE[0] + EAGLE_HOUSE[2]) / 2, (EAGLE_HOUSE[1] + EAGLE_HOUSE[3]) / 2], 38],
];

export function sculptPlans() {
  const out = [];
  for (const [id, el, center, R] of GROUPS) {
    out.push(base(`tenochtitlan-${id}-old`, [{ ...el, mode: 'old' }], { far: R, center, nocollide: true }));
    out.push(base(`tenochtitlan-${id}-new`, [{ ...el, mode: 'new' }], { near: R, center, nocollide: true }));
  }
  return out;
}
