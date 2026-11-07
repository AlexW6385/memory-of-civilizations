// Japanese timber architecture of the Heian period (11th century): the vocabulary of the
// Phoenix Hall of Byōdō-in. Round columns painted red (ni) on stone bases, square posts under
// the pent roofs; three-stepped bracket sets; a hip-and-gable roof (irimoya) of dark clay tiles
// with deep eaves and turned-up corners, its ridge carrying a pair of gilt-bronze phoenixes;
// pent roofs (mokoshi) skirting the core, raised in the middle of the front; corridors of two
// levels with railings, gabled; corner towers with pyramidal roofs (hōgyō); an arched bridge
// and a stone lantern in the garden. Bracket sets and gabled roofs come from the Chinese style,
// from which this architecture descends.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { registerStyle } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { byzantineElements } from '../byzantine/index.js';
import { bracketSet, hexa, obox, buddha, alongZ, hipRoof, gableRoofC } from '../chinese/index.js';
import { tube, plate } from './shape.js';
import { suhama } from './garden.js';
import { byodoDais } from './dais.js';

/** Round column on a stone base, or a square post { at, y, h, d, square, mat }. */
function column(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, h = el.h, r = el.d / 2, mat = el.mat || 'timber_ni';
  bag.add('limestone', box(x - r * 1.7, y - 0.3, z - r * 1.7, x + r * 1.7, y + 0.06, z + r * 1.7));
  if (el.square) bag.add(mat, box(x - r, y + 0.06, z - r, x + r, y + h, z + r));
  else bag.add(mat, lathe([[r, 0], [r, h * 0.5], [r * 0.93, h - 0.06]], 16, null, x, y + 0.06, z));
  if (el.collide !== false) col.circle(x, z, r * 1.15, y, y + h);
}

/**
 * Hip-and-gable roof (irimoya) { c, A, B (half-sizes at the eave, A ≥ B, along x), y (eave), rise,
 * lift, gable (fraction of the rise where the gable begins), alongZ, mat, soffit, gableMat }:
 * hipped below, gabled above, the gable's triangle closed by a board wall set in from the hips.
 */
function irimoya(el, ctx) { alongZ(irimoyaX, el, ctx); }
function irimoyaX(el, { bag }) {
  const [cx, cz] = el.c, A = el.A, B = el.B, R = el.rise, U = el.lift ?? 0.7, tg = el.gable ?? 0.45;
  const P = (t) => Math.pow(Math.max(0, Math.min(1, t)), 1.45);
  const yg = el.y + R * P(tg), xg = A - B * tg;                   // the gable's foot and its plane
  const hs = (z) => el.y + R * P((B - Math.abs(z - cz)) / B);
  const he = (x) => el.y + R * P((A - Math.abs(x - cx)) / B);
  const corner = (x, z) => { const c = Math.max(0, 1 - (A - Math.abs(x - cx)) / 4.5) * Math.max(0, 1 - (B - Math.abs(z - cz)) / 4.5); return U * c * c; };
  const h = (x, z, mid) => (mid ? hs(z) : Math.min(hs(z), he(x))) + corner(x, z);
  const part = (xa, xb, mid, off, up, mat) => {
    const N = Math.max(4, Math.round((xb - xa) / 0.5)), M = 40, pos = [], nor = [];
    const Q = (i, j) => { const x = xa + (xb - xa) * i / N, z = cz - B + 2 * B * j / M; return [x, h(x, z, mid) + off, z]; };
    const nrm = (i, j) => {
      const a = Q(Math.max(0, i - 1), j), b = Q(Math.min(N, i + 1), j), c = Q(i, Math.max(0, j - 1)), d = Q(i, Math.min(M, j + 1));
      let n = [-(b[1] - a[1]) / (b[0] - a[0] || 1), 1, -(d[1] - c[1]) / (d[2] - c[2] || 1)]; const l = Math.hypot(...n); n = n.map((v) => v / l);
      return up ? n : n.map((v) => -v);
    };
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      for (const tri of up ? [[0, 2, 1], [0, 3, 2]] : [[0, 1, 2], [0, 2, 3]]) for (const k of tri) { pos.push(...Q(...q[k])); nor.push(...nrm(...q[k])); }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    bag.add(mat, g);
  };
  for (const [off, up, mat] of [[0, true, el.mat || 'tile_dark'], [-0.3, false, el.soffit || 'timber_ni']]) {
    part(cx - A, cx - xg, false, off, up, mat);
    part(cx - xg, cx + xg, true, off, up, mat);
    part(cx + xg, cx + A, false, off, up, mat);
  }
  // the fascia round the eave
  const edge = [], E = 120, per = 4 * (A + B);
  const ring = (k) => {
    const d = per * k / E;
    if (d < 2 * A) return [cx - A + d, cz - B];
    if (d < 2 * A + 2 * B) return [cx + A, cz - B + (d - 2 * A)];
    if (d < 4 * A + 2 * B) return [cx + A - (d - 2 * A - 2 * B), cz + B];
    return [cx - A, cz + B - (d - 4 * A - 2 * B)];
  };
  for (let k = 0; k < E; k++) {
    const [ax, az] = ring(k), [bx, bz] = ring(k + 1), ya = h(ax, az, false), yb = h(bx, bz, false);
    edge.push(ax, ya + 0.02, az, bx, yb + 0.02, bz, bx, yb - 0.32, bz, ax, ya + 0.02, az, bx, yb - 0.32, bz, ax, ya - 0.32, az);
    edge.push(ax, ya + 0.02, az, bx, yb - 0.32, bz, bx, yb + 0.02, bz, ax, ya + 0.02, az, ax, ya - 0.32, az, bx, yb - 0.32, bz);
  }
  bag.add(el.soffit || 'timber_ni', fromTriangles(edge));
  // the gable walls (tsuma), a little in from the gable plane, under the bargeboards
  const gw = [], zr = B * (1 - tg);
  for (const s of [-1, 1]) {
    const x = cx + s * (xg - 0.25), N = 16;
    for (let k = 0; k < N; k++) for (const sz of [-1, 1]) {
      const z0 = cz + sz * zr * k / N, z1 = cz + sz * zr * (k + 1) / N;
      const a = [x, yg - 0.05, z0], b = [x, yg - 0.05, z1], c = [x, hs(z1) - 0.25, z1], d = [x, hs(z0) - 0.25, z0];
      gw.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
    }
  }
  bag.add(el.gableMat || 'plaster_white', fromTriangles(gw));
  // ridges: the main ridge, the bargeboard ridges down the gables, the hip ridges at the corners
  const r = [], top = el.y + R;
  obox(r, [cx, cz], [1, 0], [0, 1], xg + 0.3, 0.32, top - 0.15, top + 0.8);
  const strip = (pts, w, hgt) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz) || 1, px = -dz / l * w, pz = dx / l * w;
      hexa(r, [[a[0] - px, a[1] - 0.3, a[2] - pz], [a[0] + px, a[1] - 0.3, a[2] + pz], [b[0] + px, b[1] - 0.3, b[2] + pz], [b[0] - px, b[1] - 0.3, b[2] - pz]],
        [[a[0] - px, a[1] + hgt, a[2] - pz], [a[0] + px, a[1] + hgt, a[2] + pz], [b[0] + px, b[1] + hgt, b[2] + pz], [b[0] - px, b[1] + hgt, b[2] - pz]]);
    }
  };
  for (const s of [-1, 1]) for (const sz of [-1, 1]) {
    const down = [], hip = [];
    for (let k = 0; k <= 16; k++) { const z = cz + sz * zr * k / 16; down.push([cx + s * xg, hs(z) + 0.1, z]); }
    strip(down, 0.24, 0.32);
    for (let k = 0; k <= 16; k++) { const t = k / 16, x = cx + s * (xg + (A - xg) * t), z = cz + sz * (zr + (B - zr) * t); hip.push([x, h(x, z, false) + 0.2, z]); }
    strip(hip, 0.22, 0.3);
  }
  bag.add(el.ridgeMat || 'tile_dark', fromTriangles(r));
  if (el.phoenix) for (const s of [-1, 1]) phoenix({ at: [cx + s * (xg + 0.1), cz], y: top + 0.8, dir: [s, 0] }, { bag });
}

/**
 * Pent roof (mokoshi) skirting a core: a lean-to on all four sides { rect (the core's wall line),
 * out (horizontal reach to the eave), yIn (at the wall), yOut (at the eave), raise: { side, from, to,
 * yIn, yOut } (a raised section of one side between from…to along it), mat, soffit }.
 */
function pentRoof(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, o = el.out, top = [], under = [];
  const seg = (inA, inB, outA, outB, yi, yo) => {
    const a = [inA[0], yi, inA[1]], b = [inB[0], yi, inB[1]], c = [outB[0], yo, outB[1]], d = [outA[0], yo, outA[1]];
    hexa(top, [[a[0], a[1] - 0.22, a[2]], [b[0], b[1] - 0.22, b[2]], [c[0], c[1] - 0.22, c[2]], [d[0], d[1] - 0.22, d[2]]], [a, b, c, d]);
  };
  // the four sides with mitred corners; the raised section splits its side in three
  const sides = {
    n: [[x0, z0], [x1, z0], [x0 - o, z0 - o], [x1 + o, z0 - o]],
    s: [[x1, z1], [x0, z1], [x1 + o, z1 + o], [x0 - o, z1 + o]],
    w: [[x0, z1], [x0, z0], [x0 - o, z1 + o], [x0 - o, z0 - o]],
    e: [[x1, z0], [x1, z1], [x1 + o, z0 - o], [x1 + o, z1 + o]],
  };
  for (const [k, [ia, ib, oa, ob]] of Object.entries(sides)) {
    const R = el.raise && el.raise.side === k ? el.raise : null;
    if (!R) { seg(ia, ib, oa, ob, el.yIn, el.yOut); continue; }
    // positions along the side (from ia toward ib) where the raised section starts and ends
    const L = Math.hypot(ib[0] - ia[0], ib[1] - ia[1]), u = [(ib[0] - ia[0]) / L, (ib[1] - ia[1]) / L];
    const nrm = [oa[0] - ia[0] - u[0] * ((oa[0] - ia[0]) * u[0] + (oa[1] - ia[1]) * u[1]), oa[1] - ia[1] - u[1] * ((oa[0] - ia[0]) * u[0] + (oa[1] - ia[1]) * u[1])];
    const at = (p, out) => [ia[0] + u[0] * p + (out ? nrm[0] : 0), ia[1] + u[1] * p + (out ? nrm[1] : 0)];
    const p0 = Math.min(R.from, R.to), p1 = Math.max(R.from, R.to);
    seg(ia, at(p0, false), oa, at(p0, true), el.yIn, el.yOut);
    seg(at(p1, false), ib, at(p1, true), ob, el.yIn, el.yOut);
    seg(at(p0 - 0.4, false), at(p1 + 0.4, false), at(p0 - 0.4, true), at(p1 + 0.4, true), R.yIn, R.yOut);
    // the raised section's sides closed down to the pent roof
    const sideFill = [];
    for (const p of [p0 - 0.4, p1 + 0.4]) {
      const i = at(p, false), q = at(p, true);
      sideFill.push(i[0], el.yIn, i[1], q[0], el.yOut, q[1], q[0], R.yOut - 0.2, q[1], i[0], el.yIn, i[1], q[0], R.yOut - 0.2, q[1], i[0], R.yIn - 0.2, i[1]);
      sideFill.push(i[0], el.yIn, i[1], q[0], R.yOut - 0.2, q[1], q[0], el.yOut, q[1], i[0], el.yIn, i[1], i[0], R.yIn - 0.2, i[1], q[0], R.yOut - 0.2, q[1]);
    }
    bag.add(el.soffit || 'timber_ni', fromTriangles(sideFill));
  }
  bag.add(el.mat || 'tile_dark', fromTriangles(top));
  void under;
}

/** A pyramidal roof (hōgyō) { c, A (half-size at the eave), y, rise, lift } with a jewel finial. */
function hogyo(el, ctx) {
  hipRoof({ ...el, B: el.A, noChiwei: true, mat: el.mat || 'tile_dark', soffit: el.soffit || 'timber_ni', ridgeMat: 'tile_dark' }, ctx);
  const [x, z] = el.c, t = el.y + el.rise;
  ctx.bag.add('gilt_bronze', lathe([[0.32, 0], [0.28, 0.3], [0.12, 0.4], [0.1, 0.9], [0.3, 1.1], [0.32, 1.3], [0.18, 1.55], [0.001, 1.75]], 12, null, x, t + 0.6, z));
}

/** A railing (kōran) along a → b at floor y: posts, a top rail and a mid rail { a, b, y, h }. */
function railing(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]];
  const h = el.h || 0.85, out = [], c = [(ax + bx) / 2, (az + bz) / 2];
  obox(out, c, u, n, L / 2, 0.06, el.y + h - 0.08, el.y + h);
  obox(out, c, u, n, L / 2, 0.04, el.y + h * 0.45, el.y + h * 0.45 + 0.06);
  const k = Math.max(1, Math.round(L / 1.9));
  for (let i = 0; i <= k; i++) obox(out, [ax + u[0] * L * i / k, az + u[1] * L * i / k], u, n, 0.06, 0.06, el.y, el.y + h + 0.06);
  bag.add(el.mat || 'timber_ni', fromTriangles(out));
  if (el.collide !== false) col.segment(el.a, el.b, 0.15, el.y, el.y + h);
}

/** An arched bridge along a → b { a, b, y (at the ends), rise, w }: a deck of planks, railings, posts. */
function bridge(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]];
  const N = 12, w = el.w / 2, deck = [], rail = [];
  const Y = (t) => el.y + el.rise * Math.sin(Math.PI * t);
  const P = (t, s, dy = 0) => [ax + u[0] * L * t + n[0] * s, Y(t) + dy, az + u[1] * L * t + n[1] * s];
  for (let k = 0; k < N; k++) {
    const t0 = k / N, t1 = (k + 1) / N;
    hexa(deck, [P(t0, -w, -0.25), P(t0, w, -0.25), P(t1, w, -0.25), P(t1, -w, -0.25)], [P(t0, -w), P(t0, w), P(t1, w), P(t1, -w)]);
    for (const s of [-1, 1]) {
      hexa(rail, [P(t0, s * w - 0.06, 0.82), P(t0, s * w + 0.06, 0.82), P(t1, s * w + 0.06, 0.82), P(t1, s * w - 0.06, 0.82)], [P(t0, s * w - 0.06, 0.92), P(t0, s * w + 0.06, 0.92), P(t1, s * w + 0.06, 0.92), P(t1, s * w - 0.06, 0.92)]);
      const q = P(t0, s * w);
      rail.push(...boxTris(q[0] - 0.06, q[1], q[2] - 0.06, q[0] + 0.06, q[1] + 0.92, q[2] + 0.06));
    }
    // the deck is walkable: each plank section a ramp, ascending toward the middle
    const a = P(t0, 0), b = P(t1, 0), y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
    const dir = Math.abs(u[0]) > Math.abs(u[1]) ? ((b[0] - a[0]) * (b[1] - a[1]) > 0 ? 'e' : 'w') : ((b[2] - a[2]) * (b[1] - a[1]) > 0 ? 's' : 'n');
    col.ramp([Math.min(a[0], b[0]) - Math.abs(n[0]) * w, Math.min(a[2], b[2]) - Math.abs(n[1]) * w, Math.max(a[0], b[0]) + Math.abs(n[0]) * w, Math.max(a[2], b[2]) + Math.abs(n[1]) * w], y0, y1, dir);
    for (const s of [-1, 1]) col.segment(P(t0, s * w).filter((_, i) => i !== 1), P(t1, s * w).filter((_, i) => i !== 1), 0.12, el.y - 1.6, y1 + 0.9);
  }
  // piers in the water
  for (const t of [0.25, 0.5, 0.75]) for (const s of [-1, 1]) { const q = P(t, s * (w - 0.2)); deck.push(...boxTris(q[0] - 0.12, el.y - 1.6, q[2] - 0.12, q[0] + 0.12, q[1] - 0.2, q[2] + 0.12)); }
  bag.add(el.mat || 'timber_ni', fromTriangles(rail));
  bag.add(el.deckMat || 'timber', fromTriangles(deck));
}

/**
 * The Uji Bridge: a long timber bridge crossing a river along x from x0 to x1 at z { x0, x1, z, w,
 * y (ground at the ends), rise (the gentle arch), bed (the river bed), bay, sannoma: { at (x), out,
 * len } }: rows of round piles driven into the bed every bay, each row tied by a cap beam and a
 * brace, stringers along, a deck of planks across, railings of posts and two rails with
 * bronze onion finials (giboshi) on the posts at the ends and at every third post, and the
 * san-no-ma — a little railed platform projecting upstream from the third bay from the west end.
 */
function ujiBridge(el, { bag, col }) {
  const { x0, x1, z, w, y, rise, bed } = el, L = x1 - x0, bay = el.bay ?? 5.4, hw = w / 2;
  const Y = (x) => y + rise * Math.sin(Math.PI * Math.max(0, Math.min(1, (x - x0) / L)));
  const wood = [], dark = [], bronze = [];
  const nb = Math.max(2, Math.round(L / bay)), B = L / nb;
  // the pile rows (not at the ends, which rest on the banks), their caps and braces
  for (let i = 1; i < nb; i++) {
    const x = x0 + i * B, yt = Y(x) - 0.65;
    for (const zz of [z - hw + 0.4, z - hw * 0.33, z + hw * 0.33, z + hw - 0.4]) { dark.push(lathe([[0.2, 0], [0.2, yt - bed + 0.5], [0.001, yt - bed + 0.5]], 10, null, x, bed - 0.5, zz)); col.circle(x, zz, 0.22, bed, yt); }
    dark.push(box(x - 0.2, yt, z - hw - 0.3, x + 0.2, yt + 0.42, z + hw + 0.3));
    dark.push(box(x - 0.12, yt - 2.0, z - hw + 0.1, x + 0.12, yt - 1.75, z + hw - 0.1));
  }
  // the stringers and the deck, in sections following the arch; walkable
  const N = Math.max(8, Math.round(L / 2));
  for (let k = 0; k < N; k++) {
    const xa = x0 + L * k / N, xb = x0 + L * (k + 1) / N, ya = Y(xa), yb = Y(xb);
    const deck = [], st = [];
    const q = (xx, yy, zz) => [xx, yy, zz];
    hexaBox(deck, [q(xa, ya, z - hw), q(xb, yb, z - hw), q(xb, yb, z + hw), q(xa, ya, z + hw)], 0.14);
    for (const zz of [z - hw + 0.4, z - hw * 0.33, z + hw * 0.33, z + hw - 0.4]) hexaBox(st, [q(xa, ya - 0.55, zz - 0.14), q(xb, yb - 0.55, zz - 0.14), q(xb, yb - 0.55, zz + 0.14), q(xa, ya - 0.55, zz + 0.14)], 0.41);
    wood.push(fromTriangles(deck)); dark.push(fromTriangles(st));
    col.ramp([xa, z - hw, xb, z + hw], Math.min(ya, yb), Math.max(ya, yb), yb > ya ? 'e' : 'w');
  }
  // the railings, each side; the san-no-ma's gap on the upstream (+z) side
  const sn = el.sannoma, gap = sn ? [sn.at - sn.len / 2, sn.at + sn.len / 2] : null;
  const rails = (side, from, to) => {
    const zz = z + side * (hw - 0.1), n = Math.max(1, Math.round((to - from) / 1.8));
    for (let k = 0; k <= n; k++) {
      const x = from + (to - from) * k / n, yy = Y(x);
      wood.push(box(x - 0.08, yy, zz - 0.08, x + 0.08, yy + 1.05, zz + 0.08));
      if (k === 0 || k === n || k % 3 === 0) bronze.push(lathe([[0.1, 0], [0.1, 0.06], [0.12, 0.08], [0.13, 0.17], [0.09, 0.25], [0.03, 0.33], [0.012, 0.4], [0.001, 0.42]], 10, null, x, yy + 1.05, zz));
    }
    for (const [h0, th] of [[0.95, 0.1], [0.5, 0.07]]) for (let k = 0; k < 12; k++) {
      const xa = from + (to - from) * k / 12, xb = from + (to - from) * (k + 1) / 12, t = [];
      hexaBox(t, [[xa, Y(xa) + h0, zz - th / 2], [xb, Y(xb) + h0, zz - th / 2], [xb, Y(xb) + h0, zz + th / 2], [xa, Y(xa) + h0, zz + th / 2]], th);
      wood.push(fromTriangles(t));
    }
    col.segment([from, zz], [to, zz], 0.2, y - 1, y + rise + 1.2);
  };
  rails(-1, x0, x1);
  if (gap) { rails(1, x0, gap[0]); rails(1, gap[1], x1); } else rails(1, x0, x1);
  // the san-no-ma: a deck projecting upstream on two piles, railed on three sides
  if (sn) {
    const ys = Y(sn.at), za = z + hw, zb = z + hw + sn.out, xa = gap[0], xb = gap[1];
    wood.push(box(xa, ys - 0.14, za - 0.1, xb, ys, zb));
    dark.push(box(xa, ys - 0.55, za, xb, ys - 0.14, zb));
    col.floor([xa, za - 0.1, xb, zb], ys);
    for (const xx of [xa + 0.3, xb - 0.3]) dark.push(lathe([[0.18, 0], [0.18, ys - 0.55 - bed + 0.5], [0.001, ys - 0.55 - bed + 0.5]], 10, null, xx, bed - 0.5, zb - 0.3));
    for (const [a, b] of [[[xa, za], [xa, zb]], [[xa, zb], [xb, zb]], [[xb, zb], [xb, za]]]) {
      const lx = Math.min(a[0], b[0]) - 0.04, hx = Math.max(a[0], b[0]) + 0.04, lz = Math.min(a[1], b[1]) - 0.04, hz = Math.max(a[1], b[1]) + 0.04;
      wood.push(box(lx, ys + 0.9, lz, hx, ys + 1.0, hz)); wood.push(box(lx + 0.01, ys + 0.47, lz + 0.01, hx - 0.01, ys + 0.53, hz - 0.01));
      col.segment(a, b, 0.2, ys - 0.5, ys + 1.1);
    }
    for (const [xx, zz2] of [[xa, za], [xa, zb], [xb, zb], [xb, za]]) { wood.push(box(xx - 0.08, ys, zz2 - 0.08, xx + 0.08, ys + 1.05, zz2 + 0.08)); bronze.push(lathe([[0.1, 0], [0.1, 0.06], [0.12, 0.08], [0.13, 0.17], [0.09, 0.25], [0.03, 0.33], [0.012, 0.4], [0.001, 0.42]], 10, null, xx, ys + 1.05, zz2)); }
  }
  for (const g of wood) bag.add(el.mat || 'timber', g);
  for (const g of dark) bag.add('wood_dark', g);
  for (const g of bronze) bag.add('bronze', g);
}
/** A slab hanging down `t` from the top quad `top` (4 corners), its faces turned outward. */
function hexaBox(out, top, t) { const bot = top.map((p) => [p[0], p[1] - t, p[2]]); hexa(out, bot, top); }

function boxTris(x0, y0, z0, x1, y1, z1) {
  const out = [];
  hexa(out, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]);
  return out;
}

/**
 * A gilt-bronze phoenix (hōō) standing on the ridge { at, y, dir, h }: on a small rounded base, the
 * legs, the body with its chest thrust out, the neck curving up to the crested head and open beak,
 * the wings raised and spread as if about to fly, each of five long feathers, and the tail of three
 * long plumes streaming back and curling up (docs/settlements/heian-uji.md §4).
 */
function phoenix(el, { bag }) {
  const [x, z] = el.at, y = el.y, d = el.dir || [1, 0], s = (el.h || 1.0) / 1.0, sd = [-d[1], d[0]], out = [];
  const o = [x, y, z];
  const P = (u, v, w = 0) => [x + (d[0] * u + sd[0] * w) * s, y + v * s, z + (d[1] * u + sd[1] * w) * s];
  const sc = (pts) => pts.map(([u, v]) => [u * s, v * s]), sr = (r) => r.map(([a, b]) => [a * s, b * s]);
  // the base and the legs
  bag.add('gilt_bronze', lathe([[0.16 * s, 0], [0.17 * s, 0.04 * s], [0.12 * s, 0.09 * s], [0.05 * s, 0.11 * s], [0.001, 0.11 * s]], 10, null, x, y, z));
  for (const w of [-0.06, 0.06]) tube(out, P(0, 0.1, w), d, sc([[0, 0], [-0.02, 0.14], [0.02, 0.26]]), sr([[0.022, 0.022], [0.02, 0.02], [0.03, 0.03]]), 6);
  // the body: from the root of the tail to the puffed chest; the neck and head
  tube(out, o, d, sc([[-0.3, 0.44], [-0.18, 0.4], [-0.02, 0.4], [0.12, 0.46], [0.19, 0.56], [0.2, 0.66]]), sr([[0.05, 0.04], [0.1, 0.09], [0.13, 0.13], [0.13, 0.14], [0.1, 0.11], [0.065, 0.065]]), 10);
  tube(out, o, d, sc([[0.19, 0.64], [0.24, 0.76], [0.25, 0.88], [0.27, 0.96], [0.33, 1.0], [0.4, 0.99], [0.47, 0.965]]), sr([[0.06, 0.06], [0.05, 0.05], [0.045, 0.045], [0.05, 0.05], [0.055, 0.05], [0.035, 0.03], [0.008, 0.008]]), 8);
  const up = [0, 1, 0], side = [sd[0], 0, sd[1]], fwd = [d[0], 0, d[1]];
  plate(out, [P(0.3, 1.02), P(0.22, 1.1), P(0.15, 1.08), P(0.25, 1.0)], side, 0.02 * s);       // the crest
  plate(out, [P(0.3, 0.94), P(0.26, 0.82), P(0.32, 0.86), P(0.36, 0.95)], side, 0.02 * s);       // the wattle
  // the wings: five feathers each, fanned from the shoulder, raised and spread
  for (const w of [-1, 1]) {
    const sh = [0.08, 0.64, w * 0.1];
    for (let k = 0; k < 5; k++) {
      const a = 0.25 + k * 0.17, len = 0.78 - k * 0.07;
      const tip = [sh[0] - Math.cos(a) * len * 0.55 - 0.05, sh[1] + Math.sin(a + 0.3) * len, sh[2] + w * (0.32 + k * 0.05)];
      const r0 = [sh[0] - 0.02 * k, sh[1] - 0.02, sh[2]], r1 = [sh[0] - 0.1 - 0.03 * k, sh[1] + 0.02, sh[2] + w * 0.05];
      plate(out, [P(...r0), P(...r1), P(tip[0] - 0.07, tip[1] - 0.06, tip[2]), P(...tip), P(tip[0] + 0.05, tip[1] - 0.12, tip[2] - w * 0.02)], side, 0.025 * s);
    }
    plate(out, [P(0.14, 0.62, w * 0.1), P(0.0, 0.7, w * 0.16), P(-0.1, 0.62, w * 0.14), P(0.02, 0.52, w * 0.12)], side, 0.03 * s);   // the coverts
  }
  // the tail: three plumes streaming back and curling up, a little fanned
  for (const [ang, lift] of [[-0.22, 0], [0, 0.06], [0.22, 0]]) {
    const dd = [d[0] * Math.cos(ang) - d[1] * Math.sin(ang), d[1] * Math.cos(ang) + d[0] * Math.sin(ang)];
    tube(out, P(-0.28, 0.44), dd, sc([[0, 0], [-0.2, -0.02 + lift], [-0.42, 0.06 + lift], [-0.6, 0.24 + lift], [-0.68, 0.48 + lift], [-0.62, 0.66 + lift], [-0.5, 0.72 + lift]]), sr([[0.05, 0.025], [0.07, 0.018], [0.08, 0.016], [0.08, 0.016], [0.07, 0.016], [0.05, 0.016], [0.02, 0.012]]), 6);
  }
  void up; void fwd;
  bag.add('gilt_bronze', fromTriangles(out));
}

/**
 * Amida seated in meditation on a lotus pedestal of many tiers, before a boat-shaped nimbus
 * { at, y (top of the altar), h (statue), dir }; all gilt.
 */
function amida(el, ctx) {
  const { bag } = ctx;
  const [x, z] = el.at, y = el.y, d = el.dir || [1, 0];
  // the pedestal: an octagonal base, tiers of lotus petals widening upward
  bag.add('lacquer_black', lathe([[1.5, 0], [1.5, 0.35], [1.2, 0.45], [1.0, 0.9], [1.25, 1.0], [1.25, 1.15]], 8, null, x, y, z));
  for (let k = 0; k < 4; k++) bag.add('clay_gilt', lathe([[0.9 + k * 0.12, 0], [1.3 + k * 0.14, 0.12], [1.45 + k * 0.14, 0.2], [1.2 + k * 0.12, 0.22]], 24, (th) => 1 + 0.08 * Math.abs(Math.cos(th * 8 + k)), x, y + 1.15 + k * 0.21, z));
  const s = el.h / 2.92;
  buddha({ at: [x, z], y: y + 2.0 - 1.6 * s, h: 5.2 * s, dir: d, robe: 'clay_gilt', gilt: 'clay_gilt', noThrone: true, noHalo: true }, ctx);
  // the nimbus: a pointed oval of gilt openwork behind the figure
  const R = 2.0, H = 4.4, cy = y + 2.0 + H * 0.45;
  const pts = [];
  for (let k = 0; k <= 24; k++) { const a = Math.PI * k / 24; const s = Math.sin(a); pts.push([R * s * (1 - 0.25 * Math.cos(a) * 0), -Math.cos(a) * H / 2 * (1 + 0.15 * Math.max(0, -Math.cos(a)))]); }
  const plate = [];
  for (let k = 0; k < pts.length - 1; k++) for (const sd of [-1, 1]) {
    const P = (p, t) => [x - d[0] * 0.75 + t * d[0] + u(d)[0] * p[0] * sd, cy + p[1], z - d[1] * 0.75 + t * d[1] + u(d)[1] * p[0] * sd];
    const a = pts[k], b = pts[k + 1], c0 = [0, a[1]], c1 = [0, b[1]];
    for (const t of [0, -0.06]) plate.push(...P(c0, t), ...P(a, t), ...P(b, t), ...P(c0, t), ...P(b, t), ...P(c1, t), ...P(c0, t), ...P(b, t), ...P(a, t), ...P(c0, t), ...P(c1, t), ...P(b, t));
  }
  bag.add('clay_gilt', fromTriangles(plate));
}
const u = (d) => [-d[1], d[0]];

/** The canopy (tengai) hung over the statue: an octagonal gilt canopy with a fringe { at, y, r }. */
function canopy(el, { bag }) {
  const [x, z] = el.at, y = el.y, r = el.r || 1.8;
  bag.add('clay_gilt', lathe([[r * 0.4, 0.9], [r, 0.55], [r * 1.05, 0.35], [r, 0.3], [r, 0], [r * 0.2, 0.0]], 8, null, x, y, z));
  bag.add('clay_gilt', lathe([[r * 0.5, 1.6], [r * 0.62, 1.25], [r * 0.6, 0.9]], 8, null, x, y, z));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; bag.add('clay_gilt', box(x + Math.cos(a) * r - 0.04, y - 0.7, z + Math.sin(a) * r - 0.04, x + Math.cos(a) * r + 0.04, y, z + Math.sin(a) * r + 0.04)); }
}

/** A bodhisattva on a cloud, carved and applied high on a wall { at, y, dir (out of the wall) }. */
function cloudBodhisattva(el, { bag }) {
  const [x, z] = el.at, y = el.y, d = el.dir, w = u(d);
  const cloud = lathe([[0.001, -0.12], [0.45, -0.06], [0.5, 0.04], [0.3, 0.12], [0.001, 0.14]], 10, null, 0, 0, 0);
  cloud.scale(1, 1, 0.45).rotateY(Math.atan2(w[0], w[1]) + Math.PI / 2).translate(x + d[0] * 0.18, y, z + d[1] * 0.18);
  bag.add('paint_white', cloud);
  bag.add('clay_gilt', lathe([[0.16, 0], [0.13, 0.3], [0.1, 0.45], [0.06, 0.5], [0.07, 0.6], [0.001, 0.66]], 8, null, x + d[0] * 0.2, y + 0.08, z + d[1] * 0.2));
}

/** A stone lantern (tōrō): base, shaft, fire-box, roof and jewel { at, y }. */
function lantern(el, { bag, col }) {
  const [x, z] = el.at, y = el.y;
  bag.add('limestone', lathe([[0.55, 0], [0.55, 0.2], [0.35, 0.3], [0.16, 0.38], [0.14, 1.3], [0.4, 1.4], [0.4, 1.5], [0.32, 1.5], [0.32, 2.0], [0.55, 2.05], [0.6, 2.15], [0.2, 2.45], [0.12, 2.55], [0.16, 2.7], [0.001, 2.85]], 6, null, x, y, z));
  bag.add('opening', box(x - 0.18, y + 1.6, z - 0.33, x + 0.18, y + 1.9, z + 0.33));
  col.circle(x, z, 0.55, y, y + 2.8);
}

/** Water of a garden pond over an ellipse { c, r, y } (the shores are the terrain dug by PONDS);
 *  the surface reaches a little beyond the shore line, under the rising bank. */
function pond(el, { bag }) {
  const [cx, cz] = el.c, m = el.margin ?? 3, rx = el.r[0] + m, rz = el.r[1] + m, N = 64, t = [];
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2;
    t.push(cx, el.y, cz, cx + Math.cos(a1) * rx, el.y, cz + Math.sin(a1) * rz, cx + Math.cos(a0) * rx, el.y, cz + Math.sin(a0) * rz);
  }
  bag.add('water', fromTriangles(t));
}

registerStyle('japanese', {
  column,
  trim: () => {},
  opening: () => {},
  elements: { ...byzantineElements, bracket_set: bracketSet, irimoya, pent_roof: pentRoof, hogyo, gable_roof_j: gableRoofC, railing, bridge, uji_bridge: ujiBridge, pond_water: pond, suhama, byodo_dais: byodoDais },
  objects: { amida, canopy, cloud_bodhisattva: cloudBodhisattva, lantern, phoenix },
});
