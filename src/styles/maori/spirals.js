// The spirals of Māori carving (docs/settlements/maori.md §4f): the koru / pītau, the unfurling fern frond
// cut as a spiral with a stalk, in runs along the maihi and on the gateway's lintel; and the manaia, the
// bird-headed profile figure with its hooked beak, an eye of pāua and a body that curls into a spiral
// [stated: Te Ara "Māori art" and "Manaia": the spiral (pītau) and the manaia as the commonest motifs of
// the Te Arawa and Ngāti Porou carvers; inferred: the proportions]. Both are drawn once at unit size and
// instanced, front toward −z like the carved figures (index.js).

import { Matrix4 } from '../../core/three.js';
import { fromTriangles, orientOutward, lathe } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';

const D = 0.05;                                     // the relief's depth at unit size
/** A convex prism of a quad [[x, y] ×4] in the x–y plane, from z = −D to 0, as triangles. */
function slab(q, d = D) {
  const t = [], n = q.length, A = q.map(([x, y]) => [x, y, -d]), B = q.map(([x, y]) => [x, y, 0]);
  for (let i = 1; i < n - 1; i++) t.push(...A[0], ...A[i + 1], ...A[i], ...B[0], ...B[i], ...B[i + 1]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...A[i], ...A[j], ...B[j], ...A[i], ...B[j], ...B[i]); }
  return t;
}
/** The centre line of a koru: a stalk rising to the spiral's outer end, then 1.35 turns inward. Unit height ≈ 1. */
function line(flip) {
  const pts = [], R = 0.34, cx = 0, cy = 0.12, N = 20, f = flip ? -1 : 1;
  for (let i = 0; i <= 4; i++) pts.push([f * (cx + R) , -0.5 + i * (cy + 0.5) / 4]);   // the stalk
  for (let i = 1; i <= N; i++) {
    const t = i / N, th = t * 1.35 * Math.PI * 2, r = R * Math.exp(-1.35 * t);
    pts.push([f * (cx + Math.cos(th) * r), cy + Math.sin(th) * r]);
  }
  return pts;
}
function koruTris(flip) {
  const P = line(flip), tris = [];
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1], k0 = i / (P.length - 1), k1 = (i + 1) / (P.length - 1);
    const w0 = 0.075 * (1 - 0.7 * k0 ** 1.4), w1 = 0.075 * (1 - 0.7 * k1 ** 1.4);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    tris.push(...slab([[a[0] - nx * w0, a[1] - ny * w0], [b[0] - nx * w1, b[1] - ny * w1], [b[0] + nx * w1, b[1] + ny * w1], [a[0] + nx * w0, a[1] + ny * w0]]));
  }
  const e = P[P.length - 1], r = 0.05, c = [];                // the bulb at the spiral's heart
  for (let k = 0; k < 8; k++) c.push([e[0] + Math.cos(k / 8 * 6.283) * r, e[1] + Math.sin(k / 8 * 6.283) * r]);
  tris.push(...slab(c, D * 1.4));
  return tris;
}
const KORU = {}, MANAIA = {};
const koruGeom = (flip) => (KORU[flip ? 1 : 0] ||= fromTriangles(orientOutward(koruTris(flip))));
/**
 * The manaia in profile, facing left: the head a bulb with the eye above a long hooked beak turning back to the
 * body; the body a spiral rising from the stalk; one arm in a hook. Returns { body, beak } geometries.
 */
function manaiaGeoms(flip) {
  const f = flip ? -1 : 1, tris = koruTris(flip);
  // the head on the stalk's foot, looking across: a flattened bulb
  const hx = f * -0.2, hy = -0.32, c = [];
  for (let k = 0; k < 10; k++) c.push([hx + Math.cos(k / 10 * 6.283) * 0.17, hy + Math.sin(k / 10 * 6.283) * 0.15]);
  tris.push(...slab(c, D * 1.6));
  const body = fromTriangles(orientOutward(tris));
  const beak = tube([[f * -0.3, -0.3, -D * 1.2, 0.045], [f * -0.5, -0.38, -D * 1.2, 0.04], [f * -0.52, -0.52, -D * 1.2, 0.03], [f * -0.38, -0.56, -D * 1.2, 0.02], [f * -0.28, -0.46, -D * 1.2, 0.012]], 6);
  const eye = { x: f * -0.22, y: -0.28, z: -D * 1.7, r: 0.045 };
  return { body, beak, eye };
}
const PAUA_EYE = lathe([[1, 0], [0.85, 0.35], [0.001, 0.45]], 10).rotateX(-Math.PI / 2);
const manaiaG = (flip) => (MANAIA[flip ? 1 : 0] ||= manaiaGeoms(flip));

const put = (bag, mat, g, m, reach) => { if (bag.addInstance) bag.addInstance(mat, g, m.clone(), { reach }); else bag.add(mat, g.clone().applyMatrix4(m)); };
const place = (x, y, z, s, yaw) => new Matrix4().makeRotationY(yaw).setPosition(x, y, z).multiply(new Matrix4().makeScale(s, s, s));
/** A koru at (x, y, z) (its stalk's foot at y − 0.5 s), `s` high, facing −z turned by `yaw`; `flip` winds it the other way. */
export function koru(bag, mat, x, y, z, s, yaw = 0, flip = false, reach = 200) { put(bag, mat, koruGeom(flip), place(x, y, z, s, yaw), reach); }
/** A manaia at (x, y, z), `s` high. */
export function manaia(bag, mat, paua, x, y, z, s, yaw = 0, flip = false, reach = 200) {
  const g = manaiaG(flip), m = place(x, y, z, s, yaw);
  put(bag, mat, g.body, m, reach); put(bag, mat, g.beak, m, reach);
  put(bag, paua, PAUA_EYE, m.clone().multiply(new Matrix4().makeTranslation(g.eye.x, g.eye.y, g.eye.z)).multiply(new Matrix4().makeScale(g.eye.r, g.eye.r * 0.8, g.eye.r)), reach);
}
