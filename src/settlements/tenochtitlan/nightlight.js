// Tenochtitlan by night (docs/settlements/tenochtitlan.md §21): where the light was. The Mexica had no street lighting and no oil lamps;
// fire was kept burning all night in the temples and palaces, tended by novices and stewards, and a house's one light was its hearth.
// So the lit places are: the braziers of the Templo Mayor (the first ledge's row of Tlaloc's, the stair foot's, the stairheads' and the shrines'
// doors), the fires on the lesser temples' summits and on the calpulli temples' stairs, the House of the Eagles' main room, and the hearth rooms
// of the compounds the visitor can enter, their doors full of firelight. Pure data: the light list that plan.js turns into one mesh of the
// engine's additive `halo` material (styles/aztec/halo.js). Nothing is lit that the style does not build (the palace's halls are left dark here).
import { TM, SITES, EAGLE_HOUSE } from './layout.js';
import { openSet, recordOf } from './walk.js';

/** Braziers kept burning on the precinct's plaza between the arrival and the great stair (mx_dress in town.js; lit here). */
export const PLAZA_BRAZIERS = [[6, 24], [6, 37], [17, 17], [20, 31], [26, 24], [14, 44]];

/** The braziers and fires and lit doors, { k, x, y, z, gy, s?, n?, w?, h?, f? } (see styles/aztec/halo.js). */
export function lights() {
  const L = [], H = TM.h, cx = TM.c[0], w0 = TM.w / 2, w1 = TM.top.w / 2, d1 = TM.top.d / 2;
  // the first ledge's row of Tlaloc's braziers (styles/aztec/index.js: x of the terrace's inner edge, z 23, 29, 35, 41 either side)
  const tH = H / 4, ix = (w0 - w1) / 4 - 1.6, bx = cx - w0 + ix + 0.8;
  for (const s of [-1, 1]) for (const zz of [23, 29, 35, 41]) L.push({ k: 'brazier', x: bx, y: tH + 0.85, z: s * zz, gy: tH, s: 1.05 });
  // the braziers at the stair's foot (town.js precinct)
  for (const [x, z] of [[35, -16.5], [35, 16.5], [35, -10], [35, 10]]) L.push({ k: 'brazier', x, y: 0.95, z, gy: 0.03 });
  for (const [x, z] of PLAZA_BRAZIERS) L.push({ k: 'brazier', x, y: 0.95, z, gy: 0.03, s: 1.7 });
  // Ehecatl's temple (c -4, -10, r 9, h 8): a brazier either side of its stair's foot (town.js) and the fire of the round shrine at its serpent-jawed door
  // [inferred: fire was kept in the temples all night, §21; this temple is 20 m from the arrival]
  for (const z of [-14.8, -5.2]) L.push({ k: 'brazier', x: 15.6, y: 0.95, z, gy: 0.03 });
  L.push({ k: 'door', x: 1.2, z: -10, n: [1, 0], gy: 8, w: 1.6, h: 2.2, f: 0.5, s: 1.2 });
  // the palace (PALACE [160, 100, 211, 191], floor 1.0 m; first court's doorways at u = 175.9 + 3.025 i): the kitchen of the north range with its hearth and the hall of the
  // south block with its braziers, their doors open on the court [inferred: Díaz says the lords' fires and the stewards' kitchens served the palace all night, as §21]
  L.push({ k: 'door', x: 175.9, z: 112.1, n: [0, 1], gy: 1.0, w: 1.5, h: 2.5, f: 0.5, s: 1.2 });
  L.push({ k: 'door', x: 175.9, z: 140.4, n: [0, -1], gy: 1.0, w: 1.5, h: 2.5, f: 0.5, s: 1.2 });
  // the stairheads' cauldrons, and the fire at each shrine's door (the huehuetl is beaten beside Huitzilopochtli's)
  const sxw = cx - w1 * 0.55;
  for (const s of [-1, 1]) {
    L.push({ k: 'fire', x: cx - w1 + 2, y: H + 1.2, z: s * (d1 * 0.45 + d1 * 0.32 + 2.6), gy: H, s: 0.6 });
    L.push({ k: 'door', x: sxw - 0.1, z: s * 10.8, n: [-1, 0], gy: H, w: 2.0, h: 2.6, f: 0.55, s: 1.3 });
  }
  // the fires of the lesser temples' summits (smoke.js has their copal)
  for (const [x, y, z] of [[-55, 20.6, 75], [25, 18.6, -95], [42, 24, 102]]) L.push({ k: 'fire', x, y: y + 0.8, z, gy: y, s: 0.75 });
  // the calpulli temples' stairs: a brazier either side of the stair's foot (town.js)
  for (const q of SITES) for (const dx of [15.2, 22.8]) L.push({ k: 'brazier', x: q.x + dx, y: 0.95, z: q.z + 32.2, gy: 0.03 });
  // the House of the Eagles: the main room of the east wing, its doorway and its two braziers of Tlaloc (styles/aztec/precinct.js eagleHouse)
  {
    const [X0, Z0, X1, Z1] = EAGLE_HOUSE, PH = 1.4, T = 0.6, ex = X1 - 18 + 0.4, px = ex + 3.4, mz = (Z0 + 16 + Z1) / 2, rm2 = X1 - 0.4 - T;
    L.push({ k: 'door', x: px + 0.4, z: mz, n: [-1, 0], gy: PH, w: 1.8, h: 2.5, f: 0.5, s: 1.4 });
    for (const s of [-1, 1]) L.push({ k: 'brazier', x: rm2 - 2.2, y: PH + 0.85, z: mz + s * 2.6, gy: PH, s: 1.1 });
    void X0;
  }
  // the hearth rooms of the compounds that can be entered: the door full of the fire's light, spilling on the patio
  for (const h of openSet()) {
    const r = recordOf(h), d = r.rooms[0], [ix2, iz2] = d.inward;
    L.push({ k: 'door', x: d.at[0] + ix2 * 0.2, z: d.at[1] + iz2 * 0.2, n: [-ix2, -iz2], gy: 0.42, w: 1.5, h: 1.9, f: 0.5 });
  }
  return L;
}
