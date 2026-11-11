// A Nara-period hall (docs/settlements/nara.md §11): the Tang-style timber hall of Tōdai-ji and Kōfuku-ji — a stone
// platform, a ring of great vermilion columns with a tie beam, on every column and between every pair a stepped
// bracket set (the Tang sets of the `chinese` style at the hall's scale), plaster walls with plank doors and
// lattice transoms, rafters fanning round the corners of a hipped roof of grey tile with gilt-bronze owl-tail
// finials; a double hall (Daibutsuden, gates) has a smaller upper body with its own colonnade, brackets and roof.
//
// nara_hall { rect [x0, z0, x1, z1] (the column ring), y (the floor), H (column height to the tie beam), bays [nx, nz],
//   k (scale of the bracket sets, 1 = the Foguang Hall's), colD, plat (platform height; stone base up to y), pm (its margin),
//   walls 'full' | 'ends' | 'none', doors { s, n, e, w: [bay indices] } (plank doors; the others get windows),
//   doorH, upper: { H (body height), ins (inset, m), k, windows }, rise (lower roof's), top (the ridge's absolute y),
//   shibi (finial height) }

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { tangBracket, hipRoof, chineseColumn, hexa } from '../chinese/index.js';
import { tangDoor, tangWindow } from '../chinese/hallwork.js';

const S = 0.3, PW = 1.6;                 // the hip roof's eave slope and profile power (chinese/index.js hipRoofX, as the Tang halls call it)

/** A bracket set of the chinese style, scaled by k about its base point (x, yBase, z). */
function bracket(el, ctx, k, yBase) {
  const list = [];
  tangBracket(el, { bag: { add: (m, g) => list.push([m, g]) } });
  const [x, z] = el.at;
  for (const [m, g] of list) { g.translate(-x, -yBase, -z); g.scale(k, k, k); g.translate(x, yBase, z); ctx.bag.add(m, g); }
}

/** A gilt-bronze owl-tail finial (shibi) at a ridge end: a fin rising from the ridge, curling inward, its back serrated. */
function shibi(bag, x, z, y, inward, H) {
  const out = [], N = 16, W = H * 0.1;
  const sl = (t) => [-H * 0.07 - H * 0.05 * Math.pow(t, 3), H * 0.1 - H * 0.2 * Math.pow(t, 2.1)];     // [inner edge, outer edge] along the ridge, toward `inward`
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N, [a0, b0] = sl(t0), [a1, b1] = sl(t1), w0 = W * (1 - 0.45 * t0), w1 = W * (1 - 0.45 * t1);
    const P = (s, yy, w) => [x - inward * s, yy, z + w];
    hexa(out, [P(a0, y + H * t0, -w0), P(b0, y + H * t0, -w0), P(b0, y + H * t0, w0), P(a0, y + H * t0, w0)],
      [P(a1, y + H * t1, -w1), P(b1, y + H * t1, -w1), P(b1, y + H * t1, w1), P(a1, y + H * t1, w1)]);
    if (i % 2 === 1 && i < N - 1) {
      const [, bm] = sl((t0 + t1) / 2);
      hexa(out, [P(bm - 0.05, y + H * t0, -w0 * 0.5), P(bm + H * 0.045, y + H * t0 + H / N * 0.4, -w0 * 0.5), P(bm + H * 0.045, y + H * t0 + H / N * 0.4, w0 * 0.5), P(bm - 0.05, y + H * t0, w0 * 0.5)],
        [P(bm - 0.05, y + H * t1, -w1 * 0.5), P(bm, y + H * t1, -w1 * 0.5), P(bm, y + H * t1, w1 * 0.5), P(bm - 0.05, y + H * t1, w1 * 0.5)]);
    }
  }
  bag.add('gilt_bronze', fromTriangles(out));
}

export function naraHall(el, ctx) {
  const { bag, col } = ctx;
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H, [nx, nz] = el.bays, k = el.k ?? 1, colD = el.colD ?? 0.9;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, bx = (x1 - x0) / nx, bz = (z1 - z0) / nz;
  const xs = Array.from({ length: nx + 1 }, (_, i) => x0 + bx * i), zs = Array.from({ length: nz + 1 }, (_, j) => z0 + bz * j);
  const walls = el.walls ?? 'full', yb = y + H, TH = 0.8, C = colD / 2 + 0.02;
  const doors = el.doors || {};
  // the platform: faced stone, a moulded base course, the floor on top
  if (el.plat) {
    const pm = el.pm ?? 0.9;
    bag.add('granite_block', box(x0 - pm - 0.35, y - el.plat - 0.05, z0 - pm - 0.35, x1 + pm + 0.35, y - el.plat + Math.min(0.6, el.plat * 0.4), z1 + pm + 0.35));
    bag.add('granite_block', box(x0 - pm, y - el.plat - 0.05, z0 - pm, x1 + pm, y, z1 + pm));
    col.rect([x0 - pm, z0 - pm, x1 + pm, z1 + pm], y - el.plat - 0.05, y);
    col.floor([x0 - pm, z0 - pm, x1 + pm, z1 + pm], y);
  }
  // the ring of columns, and the tie beam on their heads
  const ring = [];
  for (let i = 0; i <= nx; i++) for (const j of [0, nz]) ring.push([xs[i], zs[j]]);
  for (let j = 1; j < nz; j++) for (const i of [0, nx]) ring.push([xs[i], zs[j]]);
  for (const [x, z] of ring) chineseColumn({ at: [x, z], y, h: H, d: colD }, ctx);
  const beam = (a, b, h, w) => bag.add('timber_red', orientedBox(a, b, w, yb - h, yb));
  for (const z of [z0, z1]) beam([x0 - 0.5, z], [x1 + 0.5, z], 0.9, 0.7);
  for (const x of [x0, x1]) beam([x, z0 - 0.5], [x, z1 + 0.5], 0.9, 0.7);
  // the bracket sets: on every column (the corners set at the diagonal), a lighter set between each pair
  const SQ = Math.SQRT1_2, sets = [];
  for (let i = 0; i <= nx; i++) for (const [j, d] of [[0, [0, -1]], [nz, [0, 1]]]) {
    const corner = i === 0 || i === nx;
    sets.push(corner ? { at: [xs[i], zs[j]], dir: [(i ? 1 : -1) * SQ, d[1] * SQ], kind: 'corner' } : { at: [xs[i], zs[j]], dir: d, kind: 'column' });
  }
  for (let j = 1; j < nz; j++) for (const [i, d] of [[0, [-1, 0]], [nx, [1, 0]]]) sets.push({ at: [xs[i], zs[j]], dir: d, kind: 'column' });
  for (let i = 0; i < nx; i++) for (const [j, d] of (el.betweenAll ? [[0, [0, -1]], [nz, [0, 1]]] : [[nz, [0, 1]]])) sets.push({ at: [(xs[i] + xs[i + 1]) / 2, zs[j]], dir: d, kind: 'between', post: 0.82 });
  if (el.betweenAll) for (let j = 0; j < nz; j++) for (const [i, d] of [[0, [-1, 0]], [nx, [1, 0]]]) sets.push({ at: [xs[i], (zs[j] + zs[j + 1]) / 2], dir: d, kind: 'between', post: 0.82 });
  for (const s of sets) bracket({ ...s, y: yb + (s.post ? 0.82 : 0) }, ctx, k, yb);

  // walls between the columns: plaster, plank doors in the named bays, windows in the rest
  const wallRun = (a, b, ops, yTop) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const piece = (s0, s1, ya, yc) => {
      if (s1 - s0 < 1e-3 || yc - ya < 1e-3) return;
      const p0 = [a[0] + u[0] * s0, a[1] + u[1] * s0], p1 = [a[0] + u[0] * s1, a[1] + u[1] * s1];
      bag.add('plaster_white', orientedBox(p0, p1, TH, ya, yc)); col.segment(p0, p1, TH, ya, yc);
    };
    let s = 0;
    for (const o of ops.sort((p, q) => p.at - q.at)) {
      const s0 = o.at - o.w / 2, s1 = o.at + o.w / 2;
      piece(s, s0, y, yTop);
      if (o.y0 > y) piece(s0, s1, y, o.y0);
      piece(s0, s1, o.y0 + o.h, yTop);
      s = s1;
    }
    piece(s, L, y, yTop);
  };
  const doorH = el.doorH ?? Math.min(H - 1.6, 4.2 * k + 0.6);
  const face = (side) => {
    const horiz = side === 's' || side === 'n', n = horiz ? nx : nz, step = horiz ? bx : bz, fixed = side === 's' ? z1 : side === 'n' ? z0 : side === 'e' ? x1 : x0;
    const out = side === 's' || side === 'e' ? 1 : -1, list = doors[side] || [];
    for (let i = 0; i < n; i++) {
      const a0 = (horiz ? x0 : z0) + i * step + C, a1 = (horiz ? x0 : z0) + (i + 1) * step - C, L = a1 - a0, mid = (a0 + a1) / 2;
      const A = horiz ? [a0, fixed] : [fixed, a0], B = horiz ? [a1, fixed] : [fixed, a1], at = horiz ? [mid, fixed] : [fixed, mid];
      const axis = horiz ? 'x' : 'z';
      if (list.includes(i)) {
        const w = Math.min(L - 0.6, 5.6 * Math.max(1, k / 1.8));
        wallRun(A, B, [{ at: L / 2, w, y0: y, h: H }], yb - 0.9);
        tangDoor({ at, axis, y, w, h: doorH, th: TH, out }, ctx);
        tangWindow({ at, axis, y: y + doorH + 0.3, w, h: H - 0.9 - doorH - 0.45, th: TH }, ctx);
      } else {
        const ww = Math.min(L - 1.2, 3.6 * k), wh = Math.min(3.4 * k, H * 0.34), wy = y + H * 0.42;
        wallRun(A, B, [{ at: L / 2, w: ww, y0: wy, h: wh }], yb - 0.9);
        if (el.windows !== false) tangWindow({ at, axis, y: wy, w: ww, h: wh, th: TH }, ctx);
      }
    }
  };
  if (walls === 'full') for (const sd of ['s', 'n', 'e', 'w']) face(sd);
  else if (walls === 'ends') for (const x of [x0, x1]) wallRun([x, z0 + C], [x, z1 - C], [], yb - 0.9);

  // the roof(s)
  const out1 = el.out ?? 3.0 * k, eave1 = yb + 2.4 * k, A1 = (x1 - x0) / 2 + out1, B1 = (z1 - z0) / 2 + out1;
  const roof = (c, A, B, ye, rise, out, kk) => {
    hipRoof({ c, A, B, y: ye, rise, eaveSlope: S, pow: PW, lift: 0.5 * kk, mat: 'tile_grey', soffit: 'timber_red', rafters: { out, sp: 0.3 * kk }, noChiwei: true, ridgeMat: 'tile_grey' }, ctx);
  };
  const ridge = (c, A, B, ye, rise, kk, fin) => {
    const top = ye + rise, L = A - B;
    bag.add('tile_grey', box(c[0] - L - 0.4 * kk, top - 0.1, c[1] - 0.55 * kk, c[0] + L + 0.4 * kk, top + 1.15 * kk, c[1] + 0.55 * kk));
    if (fin) for (const s of [-1, 1]) shibi(bag, c[0] + s * (L + 0.1), c[1], top + 1.1 * kk, -s, fin);
  };
  const up = el.upper;
  if (!up) {
    const rise = el.rise ?? 0.34 * B1;
    roof([cx, cz], A1, B1, eave1, rise, out1, k);
    ridge([cx, cz], A1, B1, eave1, rise, k, el.shibi);
    return;
  }
  // the double hall: the lower roof round the foot of the upper body, which stands in from the columns by `ins`
  const rise1 = el.rise ?? 0.34 * B1, ins = up.ins ?? bz, t = (out1 + ins) / B1;
  const yBase = eave1 + S * (out1 + ins) + (rise1 - S * B1) * Math.pow(t, PW);
  roof([cx, cz], A1, B1, eave1, rise1, out1, k);
  const ux0 = x0 + ins, uz0 = z0 + ins, ux1 = x1 - ins, uz1 = z1 - ins, uk = up.k ?? k * 0.8, uH = up.H, yTop = yBase + uH;
  const mx = nx - 2, mz = nz - 2, uxs = Array.from({ length: mx + 1 }, (_, i) => ux0 + (ux1 - ux0) * i / mx), uzs = Array.from({ length: mz + 1 }, (_, j) => uz0 + (uz1 - uz0) * j / mz);
  const uring = [];
  for (let i = 0; i <= mx; i++) for (const j of [0, mz]) uring.push([uxs[i], uzs[j]]);
  for (let j = 1; j < mz; j++) for (const i of [0, mx]) uring.push([uxs[i], uzs[j]]);
  // (the upper columns stand on the lower roof's tiles: their feet sunk below its surface)
  for (const [x, z] of uring) bag.add('timber_red', lathe([[colD * 0.4, 0], [colD * 0.4, uH + 0.6 - 0.8]], 16, null, x, yBase - 0.6, z));
  for (const z of [uz0, uz1]) bag.add('timber_red', orientedBox([ux0 - 0.4, z], [ux1 + 0.4, z], 0.6, yTop - 0.8, yTop));
  for (const x of [ux0, ux1]) bag.add('timber_red', orientedBox([x, uz0 - 0.4], [x, uz1 + 0.4], 0.6, yTop - 0.8, yTop));
  const uw = (a, b, ops) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    let s = 0;
    const seg = (s0, s1, ya, yc) => { if (s1 - s0 > 1e-3 && yc - ya > 1e-3) bag.add('plaster_white', orientedBox([a[0] + u[0] * s0, a[1] + u[1] * s0], [a[0] + u[0] * s1, a[1] + u[1] * s1], 0.6, ya, yc)); };
    for (const o of ops) { seg(s, o.at - o.w / 2, yBase - 0.5, yTop - 0.8); seg(o.at - o.w / 2, o.at + o.w / 2, yBase - 0.5, o.y0); seg(o.at - o.w / 2, o.at + o.w / 2, o.y0 + o.h, yTop - 0.8); s = o.at + o.w / 2; }
    seg(s, L, yBase - 0.5, yTop - 0.8);
  };
  const wy = yBase + uH * 0.28, wh = uH * 0.42;
  for (const [horiz, fixed, ts] of [[true, uz1, uxs], [true, uz0, uxs], [false, ux1, uzs], [false, ux0, uzs]]) for (let i = 0; i < ts.length - 1; i++) {
    const a0 = ts[i] + 0.3, a1 = ts[i + 1] - 0.3, L = a1 - a0, mid = (a0 + a1) / 2, ww = Math.min(L - 1.4, 3.4);
    const A = horiz ? [a0, fixed] : [fixed, a0], B = horiz ? [a1, fixed] : [fixed, a1];
    uw(A, B, up.windows === false ? [] : [{ at: L / 2, w: ww, y0: wy, h: wh }]);
    if (up.windows !== false) tangWindow({ at: horiz ? [mid, fixed] : [fixed, mid], axis: horiz ? 'x' : 'z', y: wy, w: ww, h: wh, th: 0.6 }, ctx);
  }
  // the upper brackets and roof
  const usets = [];
  for (let i = 0; i <= mx; i++) for (const [j, d] of [[0, [0, -1]], [mz, [0, 1]]]) {
    const corner = i === 0 || i === mx;
    usets.push(corner ? { at: [uxs[i], uzs[j]], dir: [(i ? 1 : -1) * SQ, d[1] * SQ], kind: 'corner' } : { at: [uxs[i], uzs[j]], dir: d, kind: 'column' });
  }
  for (let j = 1; j < mz; j++) for (const [i, d] of [[0, [-1, 0]], [mx, [1, 0]]]) usets.push({ at: [uxs[i], uzs[j]], dir: d, kind: 'column' });
  for (const s of usets) bracket({ ...s, y: yTop }, ctx, uk, yTop);
  const out2 = up.out ?? 3.0 * uk, eave2 = yTop + 2.4 * uk, A2 = (ux1 - ux0) / 2 + out2, B2 = (uz1 - uz0) / 2 + out2, top = el.top ?? eave2 + 0.4 * B2, rise2 = top - eave2;
  roof([cx, cz], A2, B2, eave2, rise2, out2, uk);
  ridge([cx, cz], A2, B2, eave2, rise2, uk, el.shibi);
}

export const hallElements = { nara_hall: naraHall };
