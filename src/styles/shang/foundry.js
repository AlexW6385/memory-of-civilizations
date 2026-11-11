// The bronze foundry (docs/settlements/shang-yinxu.md §5): open sheds of posts and thatch — the mould-makers', the furnaces', the
// finished vessels' — the moulds drying in rows, a pouring pit with its assembled moulds, heaps of ore, charcoal and clay,
// the casters' pit houses.
import { box, lathe, frustum, rod } from '../../core/geom.js';
import { FOUNDRY, FURNACES } from '../../settlements/shang-yinxu/layout.js';
import { frame, thatch, vessel, KINDS } from './geo.js';
import { pitHouse, JAR } from './houses.js';

export function shangFoundry(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = FOUNDRY, W = x1 - x0, D = z1 - z0;
  const F = frame(FOUNDRY, 'n', bag, col);
  // a low wattle fence on the south and the west, open elsewhere
  for (const r of [[x0, z1 - 0.2, x1, z1], [x0, z0 + 14, x0 + 0.2, z1]]) { bag.add('wicker', box(r[0], 0, r[1], r[2], 1.2, r[3])); col.rect(r, 0, 1.2); }
  // three sheds side by side along the north: moulds, furnaces, finished vessels
  const shed = (a, b, c, d, h = 3.0) => {
    for (let x = a; x <= c + 0.1; x += (c - a) / 4) for (const z of [b, d]) { bag.add('timber', lathe([[0.15, 0], [0.13, h]], 8, null, x, 0, z)); col.circle(x, z, 0.2, 0, h); }
    bag.add('timber', box(a - 0.2, h, b - 0.15, c + 0.2, h + 0.2, b + 0.15)); bag.add('timber', box(a - 0.2, h, d - 0.15, c + 0.2, h + 0.2, d + 0.15));
    thatch(bag, [a, b, c, d], h + 0.2, 2.6, 1.0, false);
    bag.add('earth_wall', box(a + 0.3, 0, b + 0.3, c - 0.3, 0.04, d - 0.3));
  };
  shed(-138, 100, -116, 114); shed(-112, 100, -84, 114); shed(-80, 100, -58, 114);
  // shed A: the mould-makers: benches with models, sections of mould in clay, tubs of clay
  for (let i = 0; i < 2; i++) { const x = -135 + i * 9, z = 103; bag.add('timber', box(x, 0.65, z, x + 3.4, 0.72, z + 1.1)); for (const dx of [0.1, 3.2]) bag.add('timber', box(x + dx, 0, z + 0.5, x + dx + 0.1, 0.65, z + 0.6)); col.rect([x, z, x + 3.4, z + 1.1], 0, 0.72);
    for (let k = 0; k < 5; k++) bag.add('mud_plaster', box(x + 0.2 + k * 0.6, 0.72, z + 0.1, x + 0.7 + k * 0.6, 0.86, z + 0.9)); }
  for (const [x, z] of [[-123, 111], [-121, 110], [-136, 111]]) bag.add('mud_plaster', lathe([[0.001, 0], [0.4, 0.02], [0.45, 0.5], [0.001, 0.5]], 9, null, x, 0, z));
  // shed B: four crucible furnaces of clay, a glowing mouth each, a bellows of hide; charcoal; the founders' tongs and ladle
  for (const [x, z] of FURNACES) {
    bag.add('mud_plaster', lathe([[0.7, 0], [0.62, 0.5], [0.5, 1.2], [0.55, 1.35], [0.3, 1.38], [0.001, 1.3]], 12, null, x, 0, z)); col.circle(x, z, 0.72, 0, 1.4);
    bag.add('flame', lathe([[0.001, 0], [0.25, 0.02], [0.001, 0.2]], 8, null, x, 1.3, z));
    bag.add('hide_tan', box(x - 0.35, 0.35, z + 0.8, x + 0.35, 0.6, z + 1.5)); bag.add('timber', rod([x, 0.45, z + 0.8], [x, 0.6, z + 0.5], 0.05, 5));
    bag.add('timber', rod([x, 0.5, z + 1.5], [x, 0.9, z + 2.1], 0.025, 5));
  }
  lights.push({ at: [-103, 1.6, 107], color: '#ff9a50', intensity: 3.2, distance: 14 }, { at: [-91, 1.6, 107], color: '#ff9a50', intensity: 3.2, distance: 14 });
  for (const [x, z] of [[-110, 111], [-86, 111]]) bag.add('granite_black', frustum([x - 0.8, z - 0.7, x + 0.8, z + 0.7], 0, 0.9, 0.5, 0.5, 0.4, 0.4, { noBottom: true }));
  // shed C: tables of finished vessels and the ones still to be fettled
  for (let t = 0; t < 2; t++) { const z = 103 + t * 6; bag.add('timber', box(-78, 0.7, z, -60, 0.77, z + 1.2)); for (const x of [-78, -69, -61]) bag.add('timber', box(x, 0, z + 0.5, x + 0.12, 0.7, z + 0.62)); col.rect([-78, z, -60, z + 1.2], 0, 0.77);
    for (let k = 0; k < 8; k++) vessel(KINDS[(k + t * 2) % 5], bag, -76.6 + k * 2.2, 0.77, z + 0.6, k % 3 ? 0.9 : 1.2); }
  // the drying field: rows of mould sections on mats, laid out in the sun
  for (let r = 0; r < 6; r++) { bag.add('reed_mat', box(-140, 0.01, 121 + r * 3.2, -112, 0.04, 123.6 + r * 3.2)); for (let k = 0; k < 14; k++) bag.add('mud_plaster', box(-139.4 + k * 1.95, 0.04, 121.4 + r * 3.2, -138.2 + k * 1.95, 0.16 + (k % 3) * 0.04, 123.2 + r * 3.2)); }
  // the pouring pit: a trench ringed with earth, three assembled moulds standing in it with their pouring cups, the founders' ladle
  { const px = -88, pz = 132;
    bag.add('earth_wall', frustum([px - 6, pz - 4, px + 6, pz + 4], 0, 0.35, 0.8, 0.8, 0.8, 0.8, { noBottom: true })); col.floor([px - 5.2, pz - 3.2, px + 5.2, pz + 3.2], 0.35);
    for (let k = 0; k < 3; k++) { const x = px - 3.5 + k * 3.5; bag.add('mud_plaster', lathe([[0.55, 0], [0.55, 0.9], [0.3, 1.0], [0.3, 1.2], [0.5, 1.3], [0.001, 1.3]], 10, null, x, 0.35, pz)); col.circle(x, pz, 0.6, 0.35, 1.7);
      for (const a of [0, 2.1, 4.2]) bag.add('timber', rod([x + Math.cos(a) * 0.62, 0.35, pz + Math.sin(a) * 0.62], [x + Math.cos(a) * 0.62, 1.1, pz + Math.sin(a) * 0.62], 0.025, 4)); }
    bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.12], [0.001, 0.12]], 8, null, px + 4.4, 0.35, pz + 1.5)); bag.add('timber', rod([px + 4.4, 0.45, pz + 1.5], [px + 5.5, 0.6, pz + 2.3], 0.02, 4));
    // a finished large vessel cooling on its side, a ding still in its mould fragments
    vessel('ding', bag, px, 0.35, pz + 2.4, 1.6); }
  // heaps: copper ore, tin, lead, charcoal, clay; stacks of firewood
  const heap = (mat, x, z, r) => bag.add(mat, frustum([x - r, z - r * 0.8, x + r, z + r * 0.8], 0, r * 0.6, r * 0.55, r * 0.55, r * 0.45, r * 0.45, { noBottom: true }));
  heap('serpentine', -50, 124, 1.9); heap('serpentine', -46, 130, 1.3); heap('granite_black', -56, 146, 2.6); heap('granite_black', -50, 150, 1.6); heap('mud_plaster', -44, 138, 2.0); heap('lead', -122, 164, 1.0);
  for (let r = 0; r < 4; r++) bag.add('log_pine', box(-62, r * 0.28, 160, -56, r * 0.28 + 0.26, 161.8));
  for (let k = 0; k < 6; k++) bag.add('pottery_dark', lathe(JAR(0.24), 9, null, -126 + k * 0.7, 0, 120));
  // the casters' pit houses along the south
  for (let i = 0; i < 5; i++) pitHouse(frame([x0 + 6 + i * 16, z1 - 14, x0 + 6 + i * 16 + 8, z1 - 2], 'n', bag, col), 1.0, 1.5, 3.6, 4.8, false);
  void W; void D; void F;
}
