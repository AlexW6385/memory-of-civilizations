// Great Zimbabwe: what use has worn (docs/settlements/great-zimbabwe.md §19.5). Two things only, both of the kind that can be made correctly here:
//  - the soot of the open houses' hearths on the wall above the door, where the smoke finds its way out under the eave (a tongue of dark on the daga), and
//  - the ground trodden bare along the way from each homestead's gate to its middle and outside the gate, where the grass is gone and the earth is pale and packed.
// There is NO writing here: Great Zimbabwe has no script (no inscription, tablet or sign was ever found on the site), so no letters are made anywhere.
// Both are wrappers of elements of the zimbabwe style, which stays as it was; geometry in existing materials only (no new draw), no collision.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './nightlight.js';

/** A triangle list with its normals up (a flat sheet) or out (a sheet on a wall): each triangle is turned so that its normal faces `up` or the wall's outward `n`. */
function sheet(tris, dir) {
  const pos = [], nor = [];
  for (let i = 0; i < tris.length; i += 9) {
    let [a, b, c] = [[tris[i], tris[i + 1], tris[i + 2]], [tris[i + 3], tris[i + 4], tris[i + 5]], [tris[i + 6], tris[i + 7], tris[i + 8]]];
    const u = [c[0] - b[0], c[1] - b[1], c[2] - b[2]], v = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2] < 0) [b, c] = [c, b];
    const l = Math.hypot(...n) || 1, N = [n[0] / l, n[1] / l, n[2] / l], s = n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2] < 0 ? -1 : 1;
    for (const p of [a, b, c]) { pos.push(...p); nor.push(N[0] * s, N[1] * s, N[2] * s); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/** The soot above an open house's door: three rows of an arc of the wall (radius r + 0.025), the widest at the lintel, a ragged top. */
export function sootOver(el) {
  const [x, z] = el.c, r = el.r ?? 3, y = el.y ?? 0, seed = el.seed ?? Math.floor(Math.abs(x * 13 + z * 7)), a = (seed % 628) / 100;
  const rows = [[2.31, 0.62], [2.42, 0.78 + 0.1 * hashAt(x, z, 41)], [2.5, 0.38 + 0.2 * hashAt(x, z, 42)], [2.56, 0.12 + 0.1 * hashAt(x, z, 43)]], R = r + 0.025, T = [];
  const P = (row, k, K) => { const [h, w] = rows[row], t = a + ((k / K) * 2 - 1) * w / r; return [x + Math.cos(t) * R, y + h, z + Math.sin(t) * R]; };
  const K = 6;
  for (let row = 0; row + 1 < rows.length; row++) for (let k = 0; k < K; k++) {
    const p = P(row, k, K), q = P(row, k + 1, K), s = P(row + 1, k, K), t = P(row + 1, k + 1, K);
    T.push(...p, ...q, ...t, ...p, ...t, ...s);
  }
  return sheet(T, [Math.cos(a), 0, Math.sin(a)]);
}

/** The trodden way: from `from` to `to`, `w` wide, ragged at the edges, on the ground at each end (`yAt`) lifted 0.045 m. */
export function troddenWay(from, to, w, yAt, seed, lift = 0.045) {
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]), n = Math.max(2, Math.round(L / 1.2)), tx = (to[0] - from[0]) / L, tz = (to[1] - from[1]) / L, nx = -tz, nz = tx, T = [];
  const at = (i, side) => {
    const f = i / n, px = from[0] + (to[0] - from[0]) * f, pz = from[1] + (to[1] - from[1]) * f;
    const k = (0.5 + 0.5 * Math.sin(f * Math.PI)) * 0.4 + 0.6, ww = w / 2 * k * (0.85 + 0.3 * hashAt(px, pz, seed + (side > 0 ? 1 : 2)));
    return [px + nx * side * ww, yAt(px, pz) + lift, pz + nz * side * ww];
  };
  for (let i = 0; i < n; i++) { const a = at(i, 1), b = at(i + 1, 1), c = at(i + 1, -1), d = at(i, -1); T.push(...a, ...b, ...c, ...a, ...c, ...d); }
  return sheet(T, [0, 1, 0]);
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.zimbabwe.elements, hut0 = E.daga_hut, home0 = E.homestead_goods;
  E.daga_hut = function worn(el, ctx) {
    const r = hut0.call(this, el, ctx);
    if (el.open && !el.simple) ctx.bag.add('pottery_dark', sootOver(el));
    return r;
  };
  E.homestead_goods = function trodden(el, ctx) {
    const r = home0.call(this, el, ctx);
    if (!el.simple && el.yAt) {
      const [x, z] = el.c, g = el.gap, c = Math.cos(g), s = Math.sin(g), R = el.r ?? 9;
      ctx.bag.add('silt', troddenWay([x + c * 0.9, z + s * 0.9], [x + c * (R + 0.5), z + s * (R + 0.5)], 1.7, el.yAt, 51));
      ctx.bag.add('silt', troddenWay([x + c * (R + 0.5), z + s * (R + 0.5)], [x + c * (R + 3.4), z + s * (R + 3.4)], 1.5, el.yAt, 52));
    }
    return r;
  };
}
registerWear();
