// The flame work of the Pagan temples (docs/settlements/bagan.md §13): the arch orders of a portal with their flame-edged outer band, the flame pediments (kudu arches) of the porches'
// gables, the pitched tiers of a porch roof with a flame fringe along each rake, the pointed niches, the fine stupa of the terraces. Triangles are built directly (kit.js tri3), so a
// moulding follows its curve instead of stepping; every piece is thin and stands on the wall or on the roof below it.
import { fromTriangles, lathe } from '../../core/geom.js';
import { tri3, quadH, Pw, Dw, archY } from './kit.js';

/** A hand-made variation in [0, 1) from a place: no two niches, merlons or small stupas are cut quite alike (and so they are merged into the wall's mesh, not drawn as instances). */
export const wob = (x, y, z) => { const t = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return t - Math.floor(t); };

/** The outline of a pointed arch (centre c, half width a, spring s, rise R): from the foot at `base` on the left, up the curve, down to the foot on the right. n samples on the curve. */
export function archPath(c, a, s, R, base, n = 12) {
  const p = [[c - a, base]];
  for (let i = 0; i <= n; i++) { const q = -1 + (2 * i) / n; p.push([c + a * q, archY(c + a * q, c, a, s, R)]); }
  p.push([c + a, base]);
  return p;
}

/** Teeth of flame along a polyline: each point pushed out along its outward normal (away from `inside`) by t, the even ones by t + e, and leaning along the line toward `lean` by l. */
export function teeth(P, inside, t, e, l = 0, skipEnds = true) {
  return P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    let nx = ty, ny = -tx;
    if (nx * (p[0] - inside[0]) + ny * (p[1] - inside[1]) < 0) { nx = -nx; ny = -ny; }
    const tip = i % 2 === 0 && !(skipEnds && (i === 0 || i === P.length - 1)), k = t + (tip ? e : 0);
    // the tips lean along the line toward its upper end, like the licks of a flame
    const up = ty < 0 ? -1 : 1, lx = tip ? tx * up * l : 0, ly = tip ? ty * up * l : 0;
    return [p[0] + nx * k + lx, p[1] + ny * k + ly];
  });
}

/**
 * A band solid between the inner polyline I and the outer O (matched points, [u, y]) standing on the wall face at v, out to v + dir·d; the front, the outer and the inner flank are built.
 */
export function ringSolid(F, mat, I, O, v, d, dir) {
  const out = [], vf = v + dir * d, H = Dw(F, 0, 0, dir);
  for (let i = 0; i + 1 < I.length; i++) {
    const a = I[i], b = I[i + 1], c = O[i + 1], e = O[i];
    quadH(out, Pw(F, a[0], a[1], vf), Pw(F, b[0], b[1], vf), Pw(F, c[0], c[1], vf), Pw(F, e[0], e[1], vf), H);
    // the outer flank, facing away from the inner line
    quadH(out, Pw(F, e[0], e[1], v), Pw(F, c[0], c[1], v), Pw(F, c[0], c[1], vf), Pw(F, e[0], e[1], vf), Dw(F, (e[0] + c[0] - a[0] - b[0]) / 2, (e[1] + c[1] - a[1] - b[1]) / 2, 0));
    quadH(out, Pw(F, a[0], a[1], v), Pw(F, b[0], b[1], v), Pw(F, b[0], b[1], vf), Pw(F, a[0], a[1], vf), Dw(F, (a[0] + b[0] - e[0] - c[0]) / 2, (a[1] + b[1] - e[1] - c[1]) / 2, 0));
  }
  if (out.length) F.bag.add(mat, fromTriangles(out));
}

/** A flat panel over a convex polygon (the points in order) at depth v, facing dir. */
export function panel(F, mat, P, v, dir) {
  const out = [], H = Dw(F, 0, 0, dir);
  for (let i = 1; i + 1 < P.length; i++) tri3(out, Pw(F, P[0][0], P[0][1], v), Pw(F, P[i][0], P[i][1], v), Pw(F, P[i + 1][0], P[i + 1][1], v), H);
  if (out.length) F.bag.add(mat, fromTriangles(out));
}

/**
 * The orders of a portal's arch: mouldings round a pointed opening (centre u, clear half width a, spring s, rise R, foot at `base`) on the wall face v, standing out toward dir.
 * orders: [{ t (width), d (how far proud), mat, flame (tooth height, 0 for a plain order) }] from the opening outward.
 */
export function archOrders(F, u, a, s, R, base, v, dir, orders) {
  let aa = a, RR = R;
  orders.forEach((o) => {
    const n = o.n ?? 14, I = archPath(u, aa, s, RR, base, n), O0 = archPath(u, aa + o.t, s, RR + o.t, base, n);
    const inside = [u, (s + base) / 2];
    const O = o.flame ? teeth(O0, inside, 0, o.flame, o.lean ?? o.flame * 0.5).map((p, i) => (i === 0 || i === O0.length - 1 ? O0[i] : p)) : O0;
    ringSolid(F, o.mat, I, O, v, o.d, dir);
    aa += o.t; RR += o.t;
  });
  return { a: aa, R: RR };
}

/**
 * A pitched tier of a porch roof: a prism along v (from v0 to v1) with a pentagonal section — half width hw, from y0 up to the eave at ye, to the ridge at yr — and its flame fringe along
 * the two rakes of the front face (at v1, toward +v of the frame): barge boards with teeth rising off the roof edge.
 */
export function gableTier(F, mat, fringeMat, hw, y0, ye, yr, v0, v1, tooth = 0.34) {
  const out = [], sec = [[-hw, y0], [hw, y0], [hw, ye], [0, yr], [-hw, ye]];
  const front = (arr, v, dir) => { for (let i = 1; i + 1 < arr.length; i++) tri3(out, Pw(F, arr[0][0], arr[0][1], v), Pw(F, arr[i][0], arr[i][1], v), Pw(F, arr[i + 1][0], arr[i + 1][1], v), Dw(F, 0, 0, dir)); };
  front(sec, v1, 1); front(sec, v0, -1);
  for (let i = 0; i < sec.length; i++) {
    const a = sec[i], b = sec[(i + 1) % sec.length];
    if (i === 0) continue;                                       // the bottom is hidden
    const hint = i === 1 ? Dw(F, 1, 0, 0) : i === 2 ? Dw(F, yr - ye, hw, 0) : i === 3 ? Dw(F, -(yr - ye), hw, 0) : Dw(F, -1, 0, 0);
    quadH(out, Pw(F, a[0], a[1], v0), Pw(F, b[0], b[1], v0), Pw(F, b[0], b[1], v1), Pw(F, a[0], a[1], v1), hint);
  }
  F.bag.add(mat, fromTriangles(out));
  // the fringe: along each rake, from the eave to the ridge
  const side = (sg) => {
    const A = [], n = Math.max(6, Math.round(Math.hypot(hw, yr - ye) / 0.38));
    for (let i = 0; i <= n; i++) { const t = i / n; A.push([sg * hw * (1 - t), ye + (yr - ye) * t]); }
    const O = teeth(A, [0, y0], 0.16, tooth, tooth * 0.6).map((p, i) => (i === 0 || i === A.length - 1 ? [A[i][0] + sg * 0.12, A[i][1] + 0.08] : p));
    ringSolid(F, fringeMat, A, O, v1 - 0.12, 0.2, 1);
  };
  side(-1); side(1);
}

/** A pointed niche (a blind kudu arch): a dark recess, a cream frame with a flame cap; centre u, foot y, face v, looking dir; width w, height h. */
export function pointedNiche(F, u, y, v, dir, w, h, recess = 'lacquer_black', frame = 'stucco_ochre', d = 0.05) {
  const [wx, wz] = F.pt(u, v), k = wob(wx, y, wz); w *= 1 + 0.06 * k; h *= 1 + 0.05 * wob(wz, y, wx);
  const a = w / 2, R = Math.min(a * 1.3, h * 0.4), s = y + h - R, t = Math.max(0.07, w * 0.12);
  panel(F, recess, archPath(u, a, s, R, y, 6), v + dir * (d + 0.012), dir);
  const I = archPath(u, a, s, R, y, 6), O = archPath(u, a + t, s, R + t, y, 6);
  ringSolid(F, frame, I, O, v, d, dir);
}

/** A fine stupa for where it is seen close: a square plinth with its corner points, a lotus-petal base, the bell with its ring mouldings, the banded cone, the bud and a gilt crown. */
export function fineStupa(bag, x, y, z, h, body = 'limewash_white', trim = 'gilt_bronze', gilt = true, seg = 16) {
  h *= 1 + 0.04 * wob(x, y, z);
  const s = h / 7, m = 'gilt_bronze';
  const petals = (th) => 1 + 0.07 * Math.cos(th * 8);
  bag.add(body, lathe([[1.15 * s, 0], [1.15 * s, 0.3 * s], [1.0 * s, 0.34 * s], [1.0 * s, 0.62 * s], [0.9 * s, 0.7 * s]], seg, null, x, y, z));
  bag.add(body, lathe([[0.88 * s, 0.7 * s], [0.9 * s, 1.0 * s], [0.76 * s, 1.15 * s], [0.72 * s, 1.45 * s], [0.84 * s, 1.55 * s]], seg, petals, x, y, z));
  bag.add(body, lathe([[0.7 * s, 1.55 * s], [0.95 * s, 1.95 * s], [1.02 * s, 2.5 * s], [0.9 * s, 3.1 * s], [0.62 * s, 3.8 * s], [0.4 * s, 4.3 * s]], seg, null, x, y, z));
  bag.add(trim, lathe([[0.4 * s, 4.3 * s], [0.5 * s, 4.38 * s], [0.34 * s, 4.5 * s], [0.5 * s, 4.62 * s], [0.3 * s, 4.74 * s], [0.4 * s, 4.86 * s], [0.24 * s, 4.98 * s]], seg, null, x, y, z));
  bag.add(gilt ? m : body, lathe([[0.24 * s, 4.98 * s], [0.3 * s, 5.2 * s], [0.18 * s, 5.5 * s], [0.1 * s, 6.1 * s], [0.035 * s, 7 * s], [0.001, 7 * s]], Math.min(seg, 10), null, x, y, z));
}
