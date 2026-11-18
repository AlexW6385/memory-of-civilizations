// Small pieces that differ by a hair: an element built through varied() adds its small
// pieces (arch segments, jars, lamps, turned pieces: under DETAIL, not plain boxes) each turned a fraction of a degree and scaled a per cent or two,
// by a hash of its own position, so no shape repeats exactly. The core then merges them into the material's one fine-detail
// mesh (drawn near) instead of an instanced draw for each shape and material (DESIGN §8 draws); the same plan builds
// the same geometry every time (no counters, no RNG).
import { Matrix4 } from '../../core/three.js';

import { registerStyle, STYLES } from '../../core/build.js';
import '../../styles/nasrid/index.js';

const SMALL = 0.4, M = new Matrix4();
const hash = (x, y, z) => {
  let h = Math.imul(Math.round(x * 1000) ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13) ^ Math.round(y * 1000), 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16) ^ Math.round(z * 1000), 0x27d4eb2f);
  return (h ^ (h >>> 15)) >>> 0;
};

/** The piece g turned and scaled a hair about its own foot, if it is small (and not a wind-hung cloth). */
export function vary(g) {
  if (!g || g.attributes.hang) return g;
  g.computeBoundingBox();
  const BOX = g.boundingBox;
  const sx = BOX.max.x - BOX.min.x, sy = BOX.max.y - BOX.min.y, sz = BOX.max.z - BOX.min.z;
  if (Math.max(sx, sy, sz) >= SMALL || !(sx + sy + sz > 0)) return g;
  // (plain boxes already share one prototype per material, whatever their size)
  if ((g.index ? g.index.count : g.attributes.position.count) === 36) return g;
  const cx = (BOX.min.x + BOX.max.x) / 2, cz = (BOX.min.z + BOX.max.z) / 2, y0 = BOX.min.y;
  const h = hash(cx, y0, cz), a = ((h & 1023) / 1023 - 0.5) * 0.012, s = 1 + (((h >>> 10) & 1023) / 1023 - 0.5) * 0.03;
  M.makeTranslation(cx, y0, cz).multiply(new Matrix4().makeRotationY(a)).multiply(new Matrix4().makeScale(s, s, s)).multiply(new Matrix4().makeTranslation(-cx, -y0, -cz));
  g.applyMatrix4(M);
  g.boundingBox = null; g.boundingSphere = null;
  return g;
}

/** An element builder whose small pieces are varied (see above). */
export function varied(fn) {
  return (el, ctx) => {
    const bag = Object.create(ctx.bag);
    bag.add = (mat, g) => ctx.bag.add(mat, vary(g));
    return fn(el, { ...ctx, bag });
  };
}


/** The Nasrid style with every element's small turned pieces varied (the plans of the town use it). */
registerStyle('nasrid-g', { ...STYLES.nasrid, elements: Object.fromEntries(Object.entries(STYLES.nasrid.elements).map(([k, fn]) => [k, varied(fn)])) });
