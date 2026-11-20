// Small pieces that differ by a hair: an element built through varied() adds its small
// pieces (jars, sacks, mats, lamps, turned pieces under 0.4 m, not plain boxes) each turned a fraction of a degree and scaled a per cent or two,
// by a hash of its own position, so no shape repeats exactly. The core then merges them into the material's one fine-detail
// mesh instead of an instanced draw for each shape and material (DESIGN §8 draws); the same plan builds
// the same geometry every time (no counters, no RNG).
import { Matrix4 } from '../../core/three.js';

import { registerStyle, STYLES } from '../../core/build.js';
import '../../styles/babylonian/index.js';
import { lit, NIGHT_ELEMENTS } from './nightlight.js';

// the size under which a piece is varied: fine detail (under DETAIL), and larger for the materials whose merged mesh stays small
const BIG = { sacking: 1.5, reed_mat: 1.5 };
const SMALL = 0.4, M = new Matrix4();
const hash = (x, y, z) => {
  let h = Math.imul(Math.round(x * 1000) ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13) ^ Math.round(y * 1000), 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16) ^ Math.round(z * 1000), 0x27d4eb2f);
  return (h ^ (h >>> 15)) >>> 0;
};

/** The piece g turned and scaled a hair about its own foot, if it is small (and not a wind-hung cloth). */
export function vary(g, max = SMALL) {
  if (!g || g.attributes.hang) return g;
  g.computeBoundingBox();
  const BOX = g.boundingBox;
  const sx = BOX.max.x - BOX.min.x, sy = BOX.max.y - BOX.min.y, sz = BOX.max.z - BOX.min.z;
  if (Math.max(sx, sy, sz) >= max || !(sx + sy + sz > 0)) return g;
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
    bag.add = (mat, g) => ctx.bag.add(mat, vary(g, BIG[mat]));
    return fn(el, { ...ctx, bag });
  };
}


/** The Babylonian style with every element's small turned pieces varied (the houses, shops, yards and lanes use it; the landmark keeps the style itself). */
registerStyle('babylonian-g', {
  ...STYLES.babylonian,
  elements: {
    ...Object.fromEntries(Object.entries(STYLES.babylonian.elements).map(([k, fn]) => [k, lit(varied(fn))])),
    // a door's lane: nothing is built; the street-life pass of src/objects/life.js reads its rectangle as a footprint, so that none of its animals, people or things is put in front of a door (openwalk.js)
    door_clear: () => {},
    ...NIGHT_ELEMENTS,
  },
});
/** The landmark's style: the Babylonian style with the glow of every light its elements push (Esagila's cella and chambers, the throne room's lampstands). */
registerStyle('babylonian-n', { ...STYLES.babylonian, elements: Object.fromEntries(Object.entries(STYLES.babylonian.elements).map(([k, fn]) => [k, lit(fn)])) });
