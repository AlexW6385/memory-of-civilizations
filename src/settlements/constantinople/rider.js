// The Column of Justinian's rider, modelled (docs/settlements/constantinople.md §4.11): the emperor on a colossal bronze horse facing east, in the dress of Achilles
// with a plumed helmet, the orb with the cross in his left hand, his right raised toward the sunrise [stated: wikiwand "Column of Justinian"; livius.org]. The horse is
// the Parthenon kit's (bridled, the barrel, shoulder and haunch, the joints, the mane); the rider is its body kit's (trunk, rounded limbs, hands, head with brow, nose,
// lips, helmet and cloak). Three forms by distance (the viewer's plan `near` / `far`): the old statue beyond 110 m, this within.
import { STYLES } from '../../core/build.js';
import '../../styles/roman/town.js';
import '../../styles/byzantine/city.js';
import { lathe, box } from '../../core/geom.js';
import { horseOf } from '../../buildings/parthenon/horses.js';
import { bodyOf, setFigure } from '../../buildings/parthenon/bodies.js';

const NONE = { circle() {}, rect() {}, segment() {}, floor() {} };
/** The column's shaft, steps and capital as the shared `honor_column` builds them; `keep` 'rider' keeps only what stands above the capital, 'column' only what is below. */
function filtered(el, ctx, keep) {
  const [, , ] = el.at;
  const r = (el.d ?? 3) / 2, steps = el.steps ?? 7, yTop = (el.y ?? 0) + steps * 0.4 + r * 3.2 + 1.1 + (el.h ?? 30) + 2.1 - 0.05;
  const bag = { add: (m, g) => { g.computeBoundingBox(); const up = g.boundingBox.min.y >= yTop; if ((keep === 'rider') === up) ctx.bag.add(m, g); } };
  STYLES.roman.elements.honor_column(el, { bag, col: keep === 'rider' ? NONE : ctx.col });
}
export const cnColumn = (el, ctx) => filtered({ ...el, kind: 'justinian' }, ctx, 'column');
export const cnOldRider = (el, ctx) => filtered({ ...el, kind: 'justinian' }, ctx, 'rider');

/** { at, y (the capital's top), s (the horse's height at the withers) }: the rider, facing east. */
export function cnRider(el, { bag }) {
  const [x, z] = el.at, y = el.y, k = el.s ?? 3.4;
  const horse = setFigure(horseOf({ pose: 'stand', bridle: true, lod: 1 }), k, x, y, z, 0);
  const man = setFigure(bodyOf({
    pose: 'stand', drape: 'chiton', helmet: true, lod: 1, beard: false,
    J: { pelvis: [0, 0.5, 0] }, feet: { R: [-0.15, 0.2, 0.12], L: [0.15, 0.2, 0.12] }, legBendR: [-0.4, 0.2, 1], legBendL: [0.4, 0.2, 1],
    arms: { R: [-0.14, 0.98, 0.24], L: [0.17, 0.66, 0.2] }, cloak: { dir: [0, -0.9, -0.5], len: 0.3, w: 0.12 },
  }), 1.3 * k, x + 0.04 * k, y + 0.41 * k, z, Math.PI / 2);
  for (const g of Object.values(horse)) bag.add('gilt_bronze', g);
  for (const g of Object.values(man)) bag.add('gilt_bronze', g);
  // the orb with the cross in his left hand (the body's left, +x of the body, is toward −z of the world once he is turned east) and the plume of the helmet
  const ox = x + 0.04 * k + 0.23 * 1.3 * k, oy = y + 0.41 * k + 0.66 * 1.3 * k, oz = z - 0.17 * 1.3 * k;
  const R0 = 0.1 * k;
  bag.add('gilt_bronze', lathe(Array.from({ length: 9 }, (_, i) => { const t = i / 8 * Math.PI; return [Math.max(0.001, Math.sin(t) * R0), R0 - Math.cos(t) * R0]; }), 14, null, ox, oy, oz));
  bag.add('gilt_bronze', box(ox - 0.012 * k, oy + 2 * R0 - 0.02, oz - 0.012 * k, ox + 0.012 * k, oy + 2 * R0 + 0.2 * k, oz + 0.012 * k));
  bag.add('gilt_bronze', box(ox - 0.012 * k, oy + 2 * R0 + 0.12 * k, oz - 0.07 * k, ox + 0.012 * k, oy + 2 * R0 + 0.15 * k, oz + 0.07 * k));
}
Object.assign(STYLES.roman.elements, { cn_justinian_column: cnColumn, cn_old_rider: cnOldRider, cn_rider: cnRider });
