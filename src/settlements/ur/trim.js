// Ur's own wrapping of the shared styles (the `sumerian` style belongs to Babylon as well and is left as it is; `sumerian-ur` is the town's): small pieces that differ by a hair
// (so that no shape repeats exactly and the core merges them instead of drawing an instanced mesh per shape and material), and the no-op element `door_clear`.
import { Matrix4 } from '../../core/three.js';
import { registerStyle, STYLES } from '../../core/build.js';
import '../../styles/sumerian/index.js';
import '../../styles/sumerian-ur/index.js';
import { lit, NIGHT_ELEMENTS } from './nightlight.js';

const SMALL = 0.4, M = new Matrix4();
const hash = (x, y, z) => {
  let h = Math.imul(Math.round(x * 1000) ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13) ^ Math.round(y * 1000), 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16) ^ Math.round(z * 1000), 0x27d4eb2f);
  return (h ^ (h >>> 15)) >>> 0;
};
// the materials whose pieces are varied up to a larger size
const BIG = { sacking: 1.5, reed_mat: 1.5 };

/** The piece g turned and scaled a hair about its own foot, if it is small (and not a wind-hung cloth). */
export function vary(g, max = SMALL) {
  if (!g || g.attributes.hang) return g;
  g.computeBoundingBox();
  const BOX = g.boundingBox;
  const sx = BOX.max.x - BOX.min.x, sy = BOX.max.y - BOX.min.y, sz = BOX.max.z - BOX.min.z;
  if (Math.max(sx, sy, sz) >= max || !(sx + sy + sz > 0)) return g;
  if ((g.index ? g.index.count : g.attributes.position.count) === 36) return g;   // (plain boxes share one prototype per material)
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
    bag.add = (mat, g) => ctx.bag.add(mat, vary(g, BIG[mat]));
    return fn(el, { ...ctx, bag });
  };
}

/** The town's style with every element's small pieces varied; `door_clear` builds nothing (the street-life pass of src/objects/life.js reads its rectangle as a footprint: openwalk.js). */
registerStyle('ur-g', {
  ...STYLES['sumerian-ur'],
  elements: {
    ...Object.fromEntries(Object.entries(STYLES['sumerian-ur'].elements).map(([k, fn]) => [k, varied(fn)])),
    door_clear: () => {},
    ...NIGHT_ELEMENTS,
  },
});
/** The landmark's style: the Sumerian style with the glow of every light its elements push (the court's altar fire and braziers, the shrine, the Giparu's and the palace's rooms). */
registerStyle('ur-n', { ...STYLES.sumerian, elements: Object.fromEntries(Object.entries(STYLES.sumerian.elements).map(([k, fn]) => [k, lit(fn)])) });
