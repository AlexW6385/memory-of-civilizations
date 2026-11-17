// Brasília style — the Esplanade's lawn at its leisure (docs/settlements/brasilia.md §12): families' blankets with baskets, thermoses and
// food, a coolbox, a transistor radio, and a kick-about ("pelada") between two goals made of frames and a ball. Static, low, and kept off
// the lawn's central path and the arrival's line of sight.
import { box, lathe, rod } from '../../core/geom.js';
import { rngOf } from './kit.js';

const BL = ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_indigo'];

/** lawn_life: { picnics: [[x, z, turn]], games: [[x, z, rot]], seed } */
export function lawnLife(el, { bag, col }) {
  const rand = rngOf(el.seed ?? 61);
  for (const [x, z, t] of el.picnics ?? []) {
    const c = Math.cos(t), s = Math.sin(t), P = (u, v) => [x + u * c - v * s, z + u * s + v * c];
    // the blanket (2.2 × 1.7 m) as a turned quad slightly above the grass, with a stripe, then the things on it
    const q = [P(-1.1, -0.85), P(1.1, -0.85), P(1.1, 0.85), P(-1.1, 0.85)], mat = BL[Math.floor(rand() * BL.length)];
    const xs = q.map((p) => p[0]), zs = q.map((p) => p[1]);
    if (Math.abs(t) < 1e-6 || Math.abs(t - Math.PI) < 1e-6) { bag.add(mat, box(Math.min(...xs), 0.0, Math.min(...zs), Math.max(...xs), 0.025, Math.max(...zs))); bag.add('cloth_white', box(Math.min(...xs), 0.025, z - 0.1, Math.max(...xs), 0.03, z + 0.1)); }
    else { bag.add(mat, box(x - 1.1, 0.0, z - 1.1, x + 1.1, 0.025, z + 1.1)); }
    const [bx, bz] = P(0.3, -0.2);
    bag.add('wicker', lathe([[0.001, 0], [0.26, 0], [0.28, 0.28], [0.24, 0.3], [0.001, 0.3]], 10, null, bx, 0.025, bz));                        // a basket
    bag.add('cloth_white', lathe([[0.001, 0], [0.22, 0], [0.001, 0.05]], 10, null, bx, 0.3, bz));                                                // its cloth
    const [tx, tz] = P(-0.5, 0.3); bag.add('steel_chrome', lathe([[0.001, 0], [0.06, 0], [0.065, 0.3], [0.05, 0.32], [0.001, 0.32]], 8, null, tx, 0.025, tz));   // a thermos
    const [rx, rz] = P(0.7, 0.4); bag.add('paint_blue', box(rx - 0.18, 0.025, rz - 0.18, rx + 0.18, 0.2, rz + 0.18)); bag.add('cloth_white', box(rx - 0.1, 0.2, rz - 0.1, rx + 0.1, 0.205, rz + 0.1));   // a coolbox
    const [ox, oz] = P(-0.2, -0.5); bag.add('plaster_white', box(ox - 0.1, 0.025, oz - 0.07, ox + 0.1, 0.12, oz + 0.07)); bag.add('steel_chrome', rod([ox + 0.08, 0.12, oz], [ox + 0.16, 0.5, oz], 0.004, 4));   // a transistor radio, its aerial out
    for (let k = 0; k < 4; k++) { const [fx, fz] = P(-0.4 + k * 0.25, 0.65); bag.add(['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_ochre'][k], lathe([[0.001, 0], [0.07, 0], [0.065, 0.05], [0.001, 0.06]], 7, null, fx, 0.025, fz)); }
  }
  for (const [x, z, rot] of el.games ?? []) {
    // two goals 14 m apart, each a frame of white rods 3 m × 1.2 m (the lawn's kick-about, goals made with frames or bags), a ball between
    for (const sgn of [-1, 1]) {
      const gx = x + (rot ? 0 : sgn * 7), gz = z + (rot ? sgn * 7 : 0), a = rot ? [1, 0] : [0, 1];
      for (const e of [-1.5, 1.5]) bag.add('plaster_white', rod([gx + a[0] * e, 0, gz + a[1] * e], [gx + a[0] * e, 1.2, gz + a[1] * e], 0.05, 6));
      bag.add('plaster_white', rod([gx - a[0] * 1.55, 1.2, gz - a[1] * 1.55], [gx + a[0] * 1.55, 1.2, gz + a[1] * 1.55], 0.05, 6));
      for (const e of [-1.5, 1.5]) col.circle(gx + a[0] * e, gz + a[1] * e, 0.1, 0, 1.2);
    }
    bag.add('plaster_white', lathe([[0.001, 0], [0.11, 0.11], [0.001, 0.22]], 10, null, x + 0.5, 0, z - 0.8));
  }
}
