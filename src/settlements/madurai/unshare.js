// Fewer draws for the town (docs/settlements/madurai.md §17b): a plan's boxes and posts of one material are all one "shape" to the
// viewer's instancing (src/core/geom.js shapeOf: axis-aligned pieces stretch from one prototype, lathed posts share one by move), so each
// tile of houses drew each material as an instanced mesh of its own besides the tiles' merged batch: one draw more for every material
// of every tile. `unshare` wraps a bag so that no two pieces are the same shape: the normals lean by a hair (so that a piece is no
// longer taken for an axis-aligned box) and its size varies by a few millimetres from a hash of its own place (never a counter or
// Math.random). The pieces then merge into the tiles' batches. The picture is the same to the millimetre; the memory is not.
import { STYLES } from '../../core/build.js';
import '../../styles/dravidian/index.js';

/** A number in [0, 1) from three numbers alone. */
export function hash3(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 1000) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 1000) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 1000) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** The geometry `g` varied: normals leaning by 3e-4, each axis stretched about its minimum by up to ±amp metres (at most `rel` of its extent). */
export function vary(g, amp, rel) {
  const P = g.attributes.position?.array, N = g.attributes.normal?.array;
  if (!P || !N || g.attributes.hang) return g;
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < P.length; i += 3) { if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 1] < y0) y0 = P[i + 1]; if (P[i + 1] > y1) y1 = P[i + 1]; if (P[i + 2] < z0) z0 = P[i + 2]; if (P[i + 2] > z1) z1 = P[i + 2]; }
  const h1 = hash3(x0, y0, z0), h2 = hash3(z0 + 1.7, x0, y0 + 0.3), h3 = hash3(y0, z0 + 2.9, x0 + 0.7);
  const sx = 1 + (h1 - 0.5) * 2 * Math.min(amp, rel * (x1 - x0)) / Math.max(x1 - x0, 1e-3), sy = 1 + (h2 - 0.5) * 2 * Math.min(amp, rel * (y1 - y0)) / Math.max(y1 - y0, 1e-3), sz = 1 + (h3 - 0.5) * 2 * Math.min(amp, rel * (z1 - z0)) / Math.max(z1 - z0, 1e-3);
  for (let i = 0; i < P.length; i += 3) { P[i] = x0 + (P[i] - x0) * sx; P[i + 1] = y0 + (P[i + 1] - y0) * sy; P[i + 2] = z0 + (P[i + 2] - z0) * sz; }
  const lean = 3e-4 * (0.5 + h1);
  for (let i = 0; i < N.length; i += 3) { if (N[i + 1] === 0) N[i + 1] += lean; else N[i] += lean; }
  return g;
}

/** A bag whose pieces are varied (see above), those of the materials in `only` (all if null); everything else goes through to the bag. */
export function unshare(bag, amp = 0.0015, rel = 0.03, only = null) {
  return new Proxy(bag, { get: (o, k) => (k === 'add' ? (mat, g) => o.add(mat, g && g.attributes?.position && (!only || only.has(mat)) ? vary(g.index ? g.toNonIndexed() : g, amp, rel) : g) : typeof o[k] === 'function' ? o[k].bind(o) : o[k]) });
}

/** The near tiles' materials whose repeated pieces are merged into the tiles' batches (each is a few kilobytes a tile; the big ones, timber, bronze, clay, granite, stay instanced). */
const NEAR = new Set((process.env.NEARMATS ?? '').split(',').filter(Boolean));
const { tamil_house, court_house } = STYLES.dravidian.elements;
/** { t: 'md_house' } / { t: 'md_court' }: the Tamil house and the merchant's court house, their pieces varied (far tiles by up to 2 cm, near ones by 1.5 mm). */
const wrap = (fn) => (el, ctx) => fn(el, { ...ctx, bag: unshare(ctx.bag, el.simple ? 0.02 : 0.0015, el.simple ? 0.06 : 0.03, el.simple ? null : NEAR) });
Object.assign(STYLES.dravidian.elements, { md_house: wrap(tamil_house), md_court: wrap(court_house) });
