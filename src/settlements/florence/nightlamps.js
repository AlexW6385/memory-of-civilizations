// Lamps of the great buildings at night (docs/settlements/florence.md §21): the iron torch-holders on the fronts of the Palazzo della Signoria
// and the Palazzo Medici, and the lamp-lit threshold of the cathedral's open west door. Elements of the renaissance style, registered from here
// (as house.js registers casa_f); each plan is near-only, so nothing of it is drawn from afar. Light is the `halo` material (halo.js), world frame.
import { STYLES } from '../../core/build.js';
import '../../styles/renaissance/index.js';
import { box, lathe } from '../../core/geom.js';
import { Halo } from './halo.js';
import { DUOMO, PALAZZO, MEDICI, RADIUS } from './layout.js';

const IR = 'iron';
/** A torch-holder on a wall at (x, z) facing n = [nx, nz], its lantern y m up: the bracket, the lantern, the glow, the wash on the wall and the pool on the ground. */
function torch(bag, H, x, z, n, y = 3.5) {
  const [nx, nz] = n, ex = (d) => x + nx * d, ez = (d) => z + nz * d;
  const ax = (d0, d1, w, y0, y1) => box(Math.min(ex(d0), ex(d1)) - (nx ? 0 : w), y0, Math.min(ez(d0), ez(d1)) - (nz ? 0 : w), Math.max(ex(d0), ex(d1)) + (nx ? 0 : w), y1, Math.max(ez(d0), ez(d1)) + (nz ? 0 : w));
  bag.add(IR, ax(0, 0.8, 0.02, y - 0.2, y - 0.16));          // the arm
  bag.add(IR, ax(0.02, 0.1, 0.03, y - 0.5, y + 0.3));         // the plate on the wall
  bag.add(IR, ax(0.76, 0.84, 0.02, y - 0.16, y));             // the post of the lantern
  bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.25], [0.001, 0.32]], 6, null, ex(0.8), y, ez(0.8)));
  H.ball(ex(0.8), y + 0.15, ez(0.8), 0.95);
  H.disc([ex(0.1), y + 0.1, ez(0.1)], [-nz, 0, nx], [0, 1, 0], 2.0, 1.6, [nx, nz], 6, [0.9, 0], [0, 1]);
  H.floor(ex(1.4), 0.04, ez(1.4), 2.6, 2.6, 6, 0.8);
}
function lamps(el, { bag }) {
  const H = new Halo();
  for (const l of el.torches ?? []) torch(bag, H, l.at[0], l.at[1], l.n, l.y);
  for (const p of el.pools ?? []) { H.floor(p.at[0], p.y ?? 0.06, p.at[1], p.r, p.rz ?? p.r, 6, p.b ?? 0.5); if (p.sheet) H.disc([p.sheet[0], p.sheet[1], p.at[1]], [0, 0, 1], [0, 1, 0], 2.0, 3.6, [-1, 0], 6, [0.8, 0], [0, 1]); }
  const g = H.geometry(); if (g) bag.add('halo', g);
}
if (STYLES.renaissance) STYLES.renaissance.elements.florence_lamps = lamps;

const plan = (id, c, el) => ({ id, style: 'renaissance', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, center: c, near: 140, nocollide: true, elements: [{ t: 'florence_lamps', ...el }] });

/** The plans of these lamps. [inferred: the torch-holders of the Palazzo Strozzi and Vecchio were the city's; the cathedral's lamps burnt before its altars through the night] */
export function lampPlans() {
  const nave = [DUOMO.c[0] - DUOMO.nave - DUOMO.d / 2, DUOMO.c[1]];
  return [
    plan('florence-lamps-signoria', [PALAZZO[0], (PALAZZO[1] + PALAZZO[3]) / 2], { torches: [{ at: [PALAZZO[0], PALAZZO[1] + 3], n: [-1, 0], y: 3.6 }, { at: [PALAZZO[0], PALAZZO[3] - 3], n: [-1, 0], y: 3.6 }] }),
    plan('florence-lamps-medici', [MEDICI[2], (MEDICI[1] + MEDICI[3]) / 2], { torches: [{ at: [MEDICI[2], MEDICI[1] + 3], n: [1, 0], y: 3.6 }, { at: [MEDICI[2], MEDICI[1] + 17], n: [1, 0], y: 3.6 }] }),
    plan('florence-lamps-duomo', [nave[0], nave[1]], { pools: [{ at: [nave[0] - 0.3, nave[1]], r: 4.6, rz: 3.4, b: 0.9, sheet: [nave[0] + 0.4, 3.6] }] }),
  ];
}
