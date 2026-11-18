// The Tōdai-ji sculpture by distance (docs/settlements/nara.md §19): each figure group is three plans — the old, reduced form drawn
// from `reach` m outward (the arrival, the court), the modelled form within `reach` m, and a fine layer within `fine` m. A plan names
// its centre and one distance (the engine's near / far), so only one of old and modelled is drawn at a time.
import { HALL, SOUTH_GATE } from './layout.js';

const base = { style: 'nara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], entrance: { at: [0, 180], facing: 'n' } };
// the distance forms draw in the town's own far materials (timber, granite): no new draws at the arrival
const FAR = { '*': 'timber', rock_boulder: 'granite_block' };
const set = (id, c, reach, fine, old, mid, fin) => {
  const bounds = [c[0] - 40, c[1] - 40, c[0] + 40, c[1] + 40];
  const out = [{ ...base, id: `${id}-old`, bounds, elements: old, far: reach, center: c }, { ...base, id: `${id}-mid`, bounds, elements: mid, near: reach, center: c }];
  if (fin) out.push({ ...base, id: `${id}-fine`, bounds, elements: fin, near: fine, center: c });
  return out;
};

export function sculptPlans() {
  const [hx0, hz0, hx1, hz1] = HALL, cx = (hx0 + hx1) / 2, cz = (hz0 + hz1) / 2 - 4, Y = 2.2 + 0.7;
  const plans = [];
  // the Great Buddha and the two attendants (one centre, so one plan each level): the Buddha 15.8 m on his throne, Kokūzō on the west, Nyoirin Kannon on the east
  const hall = [cx, cz], att = [['kokuzo', -1], ['nyoirin', 1]].map(([kind, sx]) => [kind, [cx + sx * 15, cz + 2]]);
  plans.push(...set('nara-hall-figures', hall, 56, 28,
    [{ t: 'obj', kind: 'daibutsu', at: [cx, cz - 1], y: Y, h: 15.8, dir: [0, 1], mat: 'timber', remap: FAR }, ...att.map(([kind, at]) => ({ t: 'obj', kind: 'bosatsu', bodhisattva: kind, at, y: Y, h: 5.2, dir: [0, 1], remap: FAR }))],
    [{ t: 'obj', kind: 'daibutsu_mid', at: [cx, cz - 1], y: Y, h: 15.8, dir: [0, 1] }, ...att.map(([kind, at]) => ({ t: 'obj', kind: 'bosatsu_mid', bodhisattva: kind, at, y: Y, h: 5.2, dir: [0, 1] }))],
    [{ t: 'obj', kind: 'daibutsu_fine', at: [cx, cz - 1], y: Y, h: 15.8, dir: [0, 1] }]));
  // the guardian kings of the Great South Gate and of the Middle Gate
  const gate = (id, zc, y, h) => plans.push(...set(id, [0, zc], 44, 0,
    [{ t: 'obj', kind: 'nio', form: 'a', at: [-12, zc], y, h, dir: [1, 0], remap: FAR }, { t: 'obj', kind: 'nio', form: 'un', at: [12, zc], y, h, dir: [-1, 0], remap: FAR }],
    [{ t: 'obj', kind: 'nio_mid', form: 'a', at: [-12, zc], y, h, dir: [1, 0] }, { t: 'obj', kind: 'nio_mid', form: 'un', at: [12, zc], y, h, dir: [-1, 0] }], null));
  gate('nara-nio-south', (SOUTH_GATE[1] + SOUTH_GATE[3]) / 2, 0.8, 5.7);
  // the lantern's musicians and lions, modelled, over the lantern (which has the panels' lattice and no figures) within 36 m
  plans.push({ ...base, id: 'nara-lantern-figures', bounds: [-40, -56, 40, 24], elements: [{ t: 'obj', kind: 'hakkaku_toro_figs', at: [0, -16], y: 0 }], near: 36, center: [0, -16] });
  return plans;
}
