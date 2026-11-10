// Ming Suzhou's own pieces, on top of the Jiangnan vocabulary (src/styles/ming/): the furniture and
// objects of the garden's halls and of a scholar's study (props.js, study.js, halls.js), the courts'
// vat, drums, screen wall and plants (court.js), the inscribed boards over the halls and the couplets
// on their columns, the potted landscapes (penjing) on their stands
// (docs/settlements/ming-suzhou.md §11).

import { STYLES, registerStyle } from '../../core/build.js';
import '../../objects/index.js';
import { suzhouShop } from './shops.js';
import '../../styles/ming/index.js';
import { Parts, table, rock, pine, plaqueBuild, box, lathe } from './props.js';
import { scholarStudy } from './study.js';
import { hallFurniture } from './halls.js';
import { courtPiece } from './court.js';
import { fromTriangles } from '../../core/geom.js';
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';

/**
 * plaque: an inscribed board { at, y (its foot), facing ([dx, dz]), w, h, n (characters), ink }: a frame
 * of dark lacquer round a field of wood, the characters raised on it in malachite green — each a
 * few strokes (the inscriptions themselves are not modelled; ours are generic strokes).
 */
function plaque(el, { bag }) {
  const P = new Parts(); plaqueBuild(P, el);
  const [fx, fz] = el.facing ?? [0, 1];
  P.emit(bag, el.at[0], el.y, el.at[1], Math.atan2(fx, fz));
}

/** penjing: a potted landscape on its stand { at, y, kind ('pine' | 'rock'), s, seed, stand ('stone' | 'wood') }. */
function penjing(el, { bag, col }) {
  const P = new Parts(), s = el.s ?? 1, sh = el.stand === 'wood' ? 0.75 : 0.55;
  if (el.stand === 'wood') { const Q = new Parts(); table(Q, 0.6 * s, 0.4 * s, sh); Q.emit(P, 0, 0, 0); }
  else { P.add('granite_grey', box(-0.32 * s, 0, -0.22 * s, 0.32 * s, sh - 0.05, 0.22 * s)); P.add('granite_grey', box(-0.36 * s, sh - 0.05, -0.26 * s, 0.36 * s, sh, 0.26 * s)); }
  const Q = new Parts();
  if (el.kind === 'rock') { Q.add('glaze_white', lathe([[0.001, 0], [0.3, 0], [0.32, 0.05], [0.29, 0.05], [0.001, 0.03]], 8).scale(1.4, 1, 0.9)); Q.add('water', lathe([[0.29, 0.042], [0.001, 0.042]], 8).scale(1.4, 1, 0.9)); const R = new Parts(); rock(R, 0.45, el.seed ?? 3); R.emit(Q, 0.05, 0.03, 0); }
  else pine(Q, 1, el.seed ?? 4, el.basin ?? 'glaze_blue');
  Q.emit(P, 0, sh, 0, 0, s);
  P.emit(bag, el.at[0], el.y ?? 0, el.at[1], el.rot ?? 0);
  col.circle(el.at[0], el.at[1], 0.35 * s, el.y ?? 0, (el.y ?? 0) + sh);
}
const base = STYLES.ming;

/**
 * path laid on the ground: when the element carries `ground` (the garden's height function), the
 * Jiangnan pebble path is built with its top at 0 and every vertex then lifted onto the ground
 * under it, `lift` (default 0.04 m) proud of it; its tile-edged sides (0.12 m deep) then sink
 * below the ground. Edges that would cut through curved ground (a mound) are split first, by a
 * rule of the edge alone, so that neighbouring triangles agree and no crack opens. Without
 * `ground` it is the flat path of the style.
 */
function drapedPath(el, ctx) {
  if (!el.ground) return base.elements.path(el, ctx);
  const H = el.ground, lift = el.lift ?? 0.04, got = [], real = ctx.bag;
  // the medallions: still instanced where the ground under them is a plane (turned to it), else laid on it vertex by vertex
  const addInstance = real.addInstance && ((mat, g, m, opts) => {
    const x = m.elements[12], z = m.elements[14], e = 0.6, h0 = H(x, z);
    const hx = (H(x + e, z) - H(x - e, z)) / (2 * e), hz = (H(x, z + e) - H(x, z - e)) / (2 * e);
    let dev = 0;
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, dx = Math.cos(a) * e, dz = Math.sin(a) * e; dev = Math.max(dev, Math.abs(H(x + dx, z + dz) - (h0 + hx * dx + hz * dz))); }
    if (dev > TOL) { got.push([opts?.real ?? mat, g.applyMatrix4(m)]); return; }
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(-hx, 1, -hz).normalize());
    const t = new Matrix4().makeTranslation(x, h0 + lift, z).multiply(new Matrix4().makeRotationFromQuaternion(q)).multiply(new Matrix4().makeTranslation(-x, 0, -z)).multiply(m);
    real.addInstance(mat, g, t, opts);
  });
  base.elements.path({ ...el, y: 0 }, { ...ctx, bag: { add: (mat, g) => got.push([mat, g]), addInstance } });
  for (const [mat, g0] of got) {
    const g = g0.index ? g0.toNonIndexed() : g0, p = g.attributes.position.array, out = [];
    for (let i = 0; i < p.length; i += 9) drapeTri([p[i], p[i + 1], p[i + 2]], [p[i + 3], p[i + 4], p[i + 5]], [p[i + 6], p[i + 7], p[i + 8]], H, out, 0);
    for (let i = 0; i < out.length; i += 3) out[i + 1] += H(out[i], out[i + 2]) + lift;
    ctx.bag.add(mat, fromTriangles(out));
  }
}
const LIM = 0.4, TOL = 0.003;
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
/** Does the ground bend under this edge enough that it must be split? (depends on the edge only) */
function bends(a, b, H) {
  if (Math.hypot(b[0] - a[0], b[2] - a[2]) <= LIM) return false;
  const ha = H(a[0], a[2]), hb = H(b[0], b[2]);
  for (const t of [0.25, 0.5, 0.75]) if (Math.abs(H(a[0] + (b[0] - a[0]) * t, a[2] + (b[2] - a[2]) * t) - (ha + (hb - ha) * t)) > TOL) return true;
  return false;
}
function drapeTri(a, b, c, H, out, depth) {
  const s = depth < 8 ? [bends(a, b, H), bends(b, c, H), bends(c, a, H)] : [false, false, false];
  const n = s[0] + s[1] + s[2];
  if (!n) { out.push(...a, ...b, ...c); return; }
  // turn the triangle (keeping its winding) so that the split edges come first
  let v = [a, b, c], k = 0;
  if (n === 1) k = s.indexOf(true); else if (n === 2) k = (s.indexOf(false) + 1) % 3;
  v = [v[k], v[(k + 1) % 3], v[(k + 2) % 3]];
  const [A, B, C] = v, d = depth + 1;
  if (n === 1) { const m = mid(A, B); drapeTri(A, m, C, H, out, d); drapeTri(m, B, C, H, out, d); return; }
  if (n === 2) { const m = mid(A, B), q = mid(B, C); drapeTri(m, B, q, H, out, d); drapeTri(A, m, q, H, out, d); drapeTri(A, q, C, H, out, d); return; }
  const m = mid(A, B), q = mid(B, C), r = mid(C, A);
  drapeTri(A, m, r, H, out, d); drapeTri(m, B, q, H, out, d); drapeTri(r, q, C, H, out, d); drapeTri(m, q, r, H, out, d);
}

registerStyle('suzhou-site', { ...base, elements: { ...base.elements, scholar_study: scholarStudy, hall_furniture: hallFurniture, court_piece: courtPiece, plaque, penjing, path: drapedPath } });

// the shop fronts are an element of the street life (instanced pieces, shared settlement-wide)
STYLES.life.elements.suzhou_shop = suzhouShop;
