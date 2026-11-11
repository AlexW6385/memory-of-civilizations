// The smock mills (wipmolens) on the bastions of Amsterdam's ramparts (docs/settlements/amsterdam.md §5.15): a
// brick base, an eight-sided tarred timber tower tapering up under its thatched cap, the stage (gallery) round it
// at the first floor, and four lattice sails on the windshaft, turned to the wind. { at, y, h, yaw, seed }.

import { box, lathe, place } from '../../core/geom.js';

export function windmill(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 15, yaw = el.yaw ?? -1.9, S = (m, g) => bag.add(m, place(g, x, y, z, yaw));
  const k = ((el.seed ?? 1) % 7) * 0.35;
  S('brick', lathe([[0.001, -0.5], [4.9, -0.5], [4.9, 0.0], [4.4, 3.4], [0.001, 3.4]], 8));                        // the brick base
  S('sandstone_dressed', lathe([[4.95, 0], [4.95, 0.35], [4.6, 0.35], [4.6, 0]], 8));
  S('tar_wood', lathe([[4.2, 3.4], [2.5, h], [0.001, h]], 8));                                                    // the tower, tapering
  S('wood_dark', lathe([[6.2, 4.3], [6.2, 4.45], [0.001, 4.45]], 8));                                             // the stage
  S('wood_dark', lathe([[6.2, 5.3], [6.2, 5.38], [6.0, 5.38], [6.0, 5.3]], 8));                                   // its rail
  S('thatch', lathe([[2.9, h], [2.75, h + 0.8], [1.4, h + 2.0], [0.001, h + 2.3]], 8));                           // the cap
  S('wood_dark', box(-0.35, 4.6, 4.1, 0.35, 6.6, 4.5));                                                           // the door on the stage's side
  S('timber', box(-0.18, h + 0.5, 0, 0.18, h + 1.3, 3.0));                                                        // the windshaft
  S('iron', lathe([[0.3, 0], [0.3, 0.4], [0.001, 0.4]], 8).rotateX(Math.PI / 2).translate(0, h + 0.9, 3.0));
  const hub = [0, h + 0.9, 3.15];
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + k, sg = (m, g) => S(m, g.rotateZ(a).translate(...hub));
    sg('timber', box(-0.1, -0.4, -0.09, 0.1, 12.6, 0.09));                                                       // the stock through the hub
    for (const s of [1]) {
      sg('linen', box(0.12, 2.6 * s, -0.025, 2.2, 12.2 * s, 0.025));                                              // the sail's cloth on its lattice
      for (let r = 0; r <= 8; r++) sg('timber', box(0.1, (2.6 + r * 1.2) * s, -0.04, 2.25, (2.7 + r * 1.2) * s, 0.04));
      sg('timber', box(2.2, 2.6 * s, -0.05, 2.32, 12.3 * s, 0.05));
    }
  }
  col.circle(x, z, 5.0, y - 0.5, y + 6);
}
