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

/** The worn middle of a flight of treads: on each, a dished, paler patch where the feet fall (the front 65% of the tread, the middle 60% of its width, ragged), 1.2 cm over its top. */
export function wornTreads(el) {
  const { x, z0, z1, w } = el, sg = Math.sign(z1 - z0), go = 0.42, n = Math.floor(Math.abs(z1 - z0) / go), T = [];
  for (let k = 0; k < n; k++) {
    const za = z0 + sg * k * go, zb = za + sg * go, zl = Math.min(za, zb), zh = Math.max(za, zb);
    const yt = Math.max(el.yAt(x - w / 2, (za + zb) / 2), el.yAt(x + w / 2, (za + zb) / 2), el.yAt(x, za), el.yAt(x, zb)) + 0.08 + 0.012;
    const h = (i) => hashAt(x + i, zl, 61), hw = w * 0.26 * (0.8 + 0.3 * h(1)), cx = x + (h(2) - 0.5) * 0.2;
    const zf = sg > 0 ? zl : zh, zi = zf + sg * go * 0.65 * (0.7 + 0.3 * h(3));       // from the tread's near edge into it
    const a = [cx - hw, yt, zf + sg * 0.03], b = [cx + hw, yt, zf + sg * 0.03], c = [cx + hw * (0.75 + 0.2 * h(4)), yt, zi], d = [cx - hw * (0.75 + 0.2 * h(5)), yt, zi];
    T.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
  return sheet(T, [0, 1, 0]);
}
/** The worn way over the stepped threshold of an entrance: a polished band across each tread and the packed earth on its top, toward the walker's point `from`. */
export function wornThreshold(el) {
  const [x, z] = el.c, r = el.r ?? 3.4, y = el.y ?? 0, f = el.from ?? [46, 60], a0 = Math.atan2(f[1] - z, f[0] - x), T = [], U = [];
  for (let k = 0; k < 3; k++) {
    const rk = r - k * 0.75, y1 = y + k * 0.14 + 0.14 + (k ? 0 : 0.06) + (k === 2 ? 0.02 + 0.012 : 0.012), ro = k === 2 ? rk - 0.35 : rk - 0.03, ri = k === 2 ? 0.3 : rk - 0.7, n = 6, sp = 0.3 + 0.05 * k;
    for (let i = 0; i < n; i++) {
      const t0 = a0 - sp + 2 * sp * i / n, t1 = t0 + 2 * sp / n, e0 = ro - 0.05 * hashAt(x + i, z + k, 62), e1 = ro - 0.05 * hashAt(x + i + 1, z + k, 62);
      const P = (t, rr) => [x + Math.cos(t) * rr, y1, z + Math.sin(t) * rr];
      (k === 2 ? U : T).push(...P(t0, ri), ...P(t0, e0), ...P(t1, e1), ...P(t0, ri), ...P(t1, e1), ...P(t1, ri));
    }
  }
  return [sheet(T, [0, 1, 0]), sheet(U, [0, 1, 0])];
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
  const steps0 = E.stone_steps, thr0 = E.entrance_steps;
  E.stone_steps = function wornSteps(el, ctx) { const r = steps0.call(this, el, ctx); if (!el.simple && el.yAt) ctx.bag.add('granite_grey', wornTreads(el)); return r; };
  E.entrance_steps = function wornThresh(el, ctx) { const r = thr0.call(this, el, ctx); if (!el.simple) { const [g, e] = wornThreshold(el); ctx.bag.add('granite_grey', g); ctx.bag.add('silt', e); } return r; };
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
