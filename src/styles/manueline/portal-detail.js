// The upper stage of the Jerónimos' south portal (docs/settlements/manueline-lisbon.md §3b): the Madonna's great niche over the
// archivolt, two tiers of canopied saints' niches under ogee hoods, rope string courses, a crocketed gable with the arms of Manuel
// and the cross of the Order. Pieces use materials the church already has and carry a millimetre of variation (they merge).
import { lathe } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';
import { faceMap, fbox, ogeeHood, ropeLine, shield } from './belem-detail.js';
import { orderCross } from './util.js';
/** A stone armillary sphere: three rings (one the tilted ecliptic) and a core, all of the one carved stone. */
function armillary(bag, mat, x, y, z, r) {
  const ring = (f) => tube(Array.from({ length: 17 }, (_, k) => { const t = k / 16 * Math.PI * 2; const [a, b, c] = f(Math.cos(t) * r, Math.sin(t) * r); return [x + a, y + b, z + c, r * 0.08 + jit()]; }), 4, { capA: false, capB: false });
  bag.add(mat, ring((c, s) => [c, s, 0])); bag.add(mat, ring((c, s) => [c * 0.94, s * 0.4, c * 0.34])); bag.add(mat, ring((c, s) => [c * 0.5, s, c * 0.85]));
  bag.add(mat, lathe([[0.001, -r * 0.2], [r * 0.2, 0], [0.001, r * 0.2]], 8, null, x, y, z));
}

const CARVED = 'limestone_carved', MAT = 'limestone_yellow';
let s = 99;
const jit = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296 - 0.5) * 0.003;

/** A niche in the face: dark recess, carved jambs and sill, colonnettes, an ogee hood with a finial, a statue; w x h, base at v. */
export function niche(bag, M, u, v, w, h, fig, lift = 0) {
  fbox(bag, 'opening', M, u - w / 2, v, -0.1, u + w / 2, v + h, 0.04);
  fbox(bag, CARVED, M, u - w / 2 - 0.22, v - 0.2, 0, u + w / 2 + 0.22, v, 0.42);
  fbox(bag, CARVED, M, u - w / 2 - 0.22, v, 0, u - w / 2, v + h, 0.3); fbox(bag, CARVED, M, u + w / 2, v, 0, u + w / 2 + 0.22, v + h, 0.3);
  fbox(bag, CARVED, M, u - w / 2 - 0.22, v + h, 0, u + w / 2 + 0.22, v + h + 0.2, 0.3);
  for (const sg of [-1, 1]) { const p = M(u + sg * (w / 2 + 0.06), v, 0.34); bag.add(CARVED, lathe([[0.09, 0], [0.07, 0.1], [0.06, h - 0.2], [0.11, h - 0.1], [0.001, h + 0.5]].map(([r, hh]) => [r + jit(), hh]), 6, null, p[0], p[1], p[2])); }
  ogeeHood(bag, M, u, v + h + 0.2, w + 0.44, { d: 0.28, rise: 0.7 });
  const p = M(u, v, 0.18), k = fig;
  bag.add(CARVED, lathe([[0.3 * k, 0], [0.36 * k, 0.3 * k], [0.3 * k, 1.3 * k], [0.18 * k, 1.55 * k], [0.2 * k, 1.75 * k], [0.001, 1.8 * k]].map(([r, hh]) => [r + jit(), hh]), 8, null, p[0], p[1] + 0.05 + lift, p[2]));
  // the little canopy of three tiers over the head
  bag.add(CARVED, lathe([[0.45 * k, 0], [0.3 * k, 0.15], [0.4 * k, 0.28], [0.15 * k, 0.55], [0.001, 0.8 * k]], 6, null, p[0], p[1] + h - 0.55 * k - 0.1 - (lift ? 0.6 : 0), p[2]));
}

export function portalUpper(bag, { px, ux, Wp, y, zf, pz0 }) {
  const M = faceMap('s', [ux, pz0, ux + Wp, zf]);
  // the stage's string courses of rope, broken by the Madonna's niche
  for (const yy of [19.9, 25.0]) {
    ropeLine(bag, [ux + 0.7, zf + 0.12], [px - 1.8, zf + 0.12], y + yy, { out: -1, lift: 0 }); ropeLine(bag, [px + 1.8, zf + 0.12], [ux + Wp - 0.7, zf + 0.12], y + yy, { out: -1, lift: 0 });
    fbox(bag, CARVED, M, ux - 0.2, yy - 0.2, -0.02, ux + Wp + 0.2, yy - 0.04, 0.3);
  }
  // two tiers of saints either side of the great niche
  for (const du of [-4.1, 4.1]) { niche(bag, M, px + du, y + 15.4, 1.6, 3.0, 0.95); niche(bag, M, px + du, y + 20.5, 1.6, 3.0, 0.95); }
  // the great niche: the Madonna and Child, in a canopy of three tiers
  niche(bag, M, px, y + 15.4, 2.4, 8.2, 1.5, 3.6);
  fbox(bag, CARVED, M, px - 0.8, y + 15.4, 0.0, px + 0.8, y + 19.0, 0.5); fbox(bag, CARVED, M, px - 0.95, y + 18.8, 0.0, px + 0.95, y + 19.1, 0.6);
  // the gable, its slopes lined with rope and leaf crockets, the arms of Manuel and the cross, a finial
  const rise = 5.5, ax = ux - 0.5, bx = ux + Wp + 0.5, y0 = y + 27;
  for (const sg of [-1, 1]) {
    const x0 = sg < 0 ? ax : bx, pts = Array.from({ length: 13 }, (_, k) => { const t = k / 12; return [x0 + (px - x0) * t, y0 + 0.12 + rise * t, zf + 0.1, 0.1 + jit()]; });
    bag.add(CARVED, tube(pts, 5, { capA: false, capB: false }));
    for (let k = 1; k < 10; k++) { const t = k / 10, X = x0 + (px - x0) * t, Y = y0 + 0.12 + rise * t; bag.add(CARVED, lathe([[0.17, 0], [0.12, 0.12], [0.2, 0.26], [0.001, 0.6]].map(([r, hh]) => [r + jit(), hh]), 5, null, X, Y + 0.05, zf + 0.12)); }
  }
  shield(bag, px, y0 + 2.2, zf + 0.0, 0, 1, 1.5, 1.9, 'limestone_carved');
  for (const sg of [-1, 1]) armillary(bag, CARVED, px + sg * 2.3, y0 + 2.2, zf + 0.25, 0.6);
  bag.add(CARVED, lathe([[0.3, 0], [0.22, 0.4], [0.28, 0.6], [0.1, 1.4], [0.001, 2.2]], 8, null, px, y0 + rise - 0.1, zf - 0.6));
  orderCross(bag, 'wall_red', px, y0 + rise + 0.9, zf + 0.0, 0.5, 's');
  // pinnacle clusters on the gable's shoulders
  for (const X of [ax + 0.4, bx - 0.4]) for (const [dz, r, h] of [[0.2, 0.3, 2.6]]) bag.add(CARVED, lathe([[r, 0], [r * 0.8, h * 0.15], [r * 0.6, h * 0.2], [r * 0.2, h * 0.8], [0.001, h]], 6, null, X, y0, pz0 + 1.2 + dz));
}

/** The portal's lower stage over the archivolt: the Madonna in her niche, the arms of Manuel and armillary spheres on the spandrels, the flanks' tiers of saints. */
export function portalLower(bag, { px, ux, Wp, y, pz0, pz1 }) {
  const M = faceMap('s', [ux, pz0, ux + Wp, pz1]);
  niche(bag, M, px, y + 9.6, 1.8, 3.4, 1.5);
  for (const sg of [-1, 1]) {
    const q = M(px + sg * 3.9, y + 9.2, 0.0); shield(bag, q[0], q[1], q[2], 0, 1, 0.9, 1.15, 'limestone_carved');
    const c = M(px + sg * 3.9, y + 11.9, 0.0); armillary(bag, CARVED, c[0], c[1], c[2] + 0.3, 0.6);
    for (const [r, hh] of [[0.8, 0.0]]) { const pts = Array.from({ length: 17 }, (_, k) => { const t = k / 16 * Math.PI * 2; return [c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r, c[2] + 0.1, 0.06 + jit()]; }); bag.add(CARVED, tube(pts, 4, { capA: false, capB: false })); void hh; }
  }
  for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) niche(bag, M, px + sg * 5.25, y + 1.6 + k * 4.2, 0.9, 2.3, 0.85);
}
