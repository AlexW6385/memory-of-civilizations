// Fewer draws for the town (docs/settlements/versailles.md §11.1): a plan's boxes of one material are all one "shape" to the viewer's instancing
// (src/core/geom.js shapeOf: axis-aligned pieces stretch from one prototype), so a tile of houses draws each material as an instanced mesh of its own
// besides the merged tiles' batch — one draw more for every material of every tile. `unshare` wraps a bag so that no two pieces are the same shape:
// the normals of each piece lean by a hair (so that it is no longer taken for an axis-aligned box) and its size varies by a few millimetres from a hash
// of its own place (never a counter or Math.random). The pieces then merge into the tiles' batches, which are one draw for the whole settlement.
// The picture is the same to the millimetre; the memory is not (the copies are no longer shared: Versailles has the room, geo-one).
import { STYLES } from '../../core/build.js';
import '../../styles/classical_fr/index.js';
import { townHouse } from '../../styles/classical_fr/townhouse.js';
import { ecurie } from '../../styles/classical_fr/ecuries.js';

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

/** Materials whose pieces stand face to face with others' (the kerb and its gutter stone: two boxes a house): few enough never to be instanced, and left exact. */
const KEEP = new Set(['granite_black', 'granite_grey']);
/** A bag whose pieces are varied (see above); everything else goes through to the bag. */
export function unshare(bag, amp = 0.006, rel = 0.03) {
  return new Proxy(bag, { get: (o, k) => (k === 'add' ? (mat, g) => o.add(mat, g && g.attributes?.position && !KEEP.has(mat) ? vary(g.index ? g.toNonIndexed() : g, amp, rel) : g) : typeof o[k] === 'function' ? o[k].bind(o) : o[k]) });
}

/** { t: 'vs_house' }: the classical_fr town house, its pieces varied (far tiles by up to 6 cm, near ones by 6 mm). */
function vsHouse(el, ctx) { townHouse(el, { ...ctx, bag: unshare(ctx.bag, el.simple ? 0.06 : 0.006, el.simple ? 0.08 : 0.03) }); }
/** { t: 'vs_ecurie' }: the royal stables, their pieces varied. */
function vsEcurie(el, ctx) { ecurie(el, { ...ctx, bag: unshare(ctx.bag, 0.006, 0.03) }); }
Object.assign(STYLES.classical_fr.elements, { vs_house: vsHouse, vs_ecurie: vsEcurie });
