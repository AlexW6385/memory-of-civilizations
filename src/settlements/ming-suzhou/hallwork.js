// Ming Suzhou — the landmark's fine work, built as real geometry (docs/settlements/ming-suzhou.md §12):
// the lattice of the halls' long windows (bars of wood standing proud of the paper, in the patterns
// the dossier names, instead of a pattern painted on a plane), the rows of cover tiles down the
// roofs, the rafters under the eaves, and the stone balustrade of the terrace before the Hall of
// Distant Fragrance.

import { fromTriangles, orientOutward, box, lathe } from '../../core/geom.js';

const PATTERN = { lattice_bubujin: 'bubujin', lattice_ice: 'ice', lattice_lantern: 'lantern', lattice_wan: 'wan', lattice_haitang: 'lantern', lattice: 'lantern' };

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the patterns, in the leaf's own plane (u along, v up): segments [u0, v0, u1, v1] ──
function bubujin(w, h, c0) {
  const n = Math.max(2, Math.round(w / c0)), c = w / n, S = [];
  for (let i = 1; i < n; i++) S.push([i * c, 0, i * c, h, 0]);                      // an upright every cell
  const band = 3 * c;
  for (let r = 1; r * band < h - 0.02; r++) S.push([0, r * band, w, r * band, 1]);   // a rail every third row
  for (let r = 0; r * band < h; r++) for (let i = 0; i < n; i++) {                   // a rail stepping up and down a cell per column
    const lev = 2.5 - Math.abs((i % 4) - 2), v = r * band + lev * c * 0.8 + c * 0.1;
    if (v < h - 0.03) S.push([i * c, v, (i + 1) * c, v, 2]);
  }
  return S;
}
function lantern(w, h, c0) {
  const n = Math.max(2, Math.round(w / c0)), c = w / n, S = [], fr = Math.max(1, Math.round(h / (5 * c))), F = h / fr;
  for (let i = 1; i < n; i++) S.push([i * c, 0, i * c, h, 0]);
  for (let f = 0; f < fr; f++) { S.push([0, f * F + F * 0.2, w, f * F + F * 0.2, 1]); S.push([0, f * F + F * 0.8, w, f * F + F * 0.8, 2]); if (f) S.push([0, f * F, w, f * F, 1]); }
  return S;
}
function wan(w, h, c0) {
  const n = Math.max(2, Math.round(w / c0)), c = w / n, m = Math.max(2, Math.round(h / c)), d = h / m, S = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const x = i * c, y = j * d, T = (a, b, e, f2, k) => S.push([x + a * c, y + b * d, x + e * c, y + f2 * d, k]);
    T(0.5, 0, 0.5, 1, 0); T(0, 0.5, 1, 0.5, 1); T(0.5, 1, 1, 1, 2); T(1, 0.5, 1, 0, 0); T(0.5, 0, 0, 0, 2); T(0, 0.5, 0, 1, 0);
  }
  return S;
}
/** Cracked ice (bing lie): the edges of a Voronoi net on jittered sites, each crack ending on another. */
function ice(w, h, c0, rand) {
  const nx = Math.max(2, Math.round(w / c0)), ny = Math.max(2, Math.round(h / c0)), cx = w / nx, cy = h / ny, sites = [], S = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) sites.push([(i + 0.15 + rand() * 0.7) * cx, (j + 0.15 + rand() * 0.7) * cy, i, j]);
  const at = (i, j) => sites.find((s) => s[2] === i && s[3] === j);
  sites.forEach((s, idx) => {
    let poly = [[0, 0, -1], [w, 0, -1], [w, h, -1], [0, h, -1]];      // [u, v, label of the edge that starts here]
    for (let di = -2; di <= 2 && poly.length; di++) for (let dj = -2; dj <= 2; dj++) {
      const o = at(s[2] + di, s[3] + dj); if (!o || o === s) continue;
      const nu = o[0] - s[0], nv = o[1] - s[1], k = (o[0] * o[0] + o[1] * o[1] - s[0] * s[0] - s[1] * s[1]) / 2, j = sites.indexOf(o);
      const f = (p) => p[0] * nu + p[1] * nv - k;                      // ≤ 0 keeps the point (nearer to s)
      const out = [];
      for (let q = 0; q < poly.length; q++) {
        const a = poly[q], b = poly[(q + 1) % poly.length], fa = f(a), fb = f(b);
        if (fa <= 0) out.push(fb <= 0 ? a : [a[0], a[1], a[2]]);
        if ((fa <= 0) !== (fb <= 0)) {
          const t = fa / (fa - fb), p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
          if (fa <= 0) out.push([p[0], p[1], j]); else out.push([p[0], p[1], a[2]]);
        }
      }
      poly = out;
    }
    for (let q = 0; q < poly.length; q++) {
      const a = poly[q], b = poly[(q + 1) % poly.length];
      if (a[2] > idx && Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.02) S.push([a[0], a[1], b[0], b[1], q % 3]);
    }
  });
  return S;
}

/**
 * Emit one bar of a lattice: from (u0, v0) to (u1, v1) in the leaf's plane, half-width hw, standing
 * zb..zf across it. The bar's two broad faces and its two flanks (the ends are buried in the frame
 * or in the next bar).
 */
function bar(out, F, u0, v0, u1, v1, hw, zb, zf) {
  const du = u1 - u0, dv = v1 - v0, l = Math.hypot(du, dv) || 1, pu = -dv / l * hw, pv = du / l * hw, eu = du / l * hw * 0.6, ev = dv / l * hw * 0.6;
  const P = (u, v, z) => [F.x + F.ux * u + F.nx * z, F.y + v, F.z + F.uz * u + F.nz * z];
  const A = [u0 - eu + pu, v0 - ev + pv], B = [u0 - eu - pu, v0 - ev - pv], C = [u1 + eu - pu, v1 + ev - pv], D = [u1 + eu + pu, v1 + ev + pv];
  const loc = [], q = (a, b, c, d) => loc.push(...a, ...b, ...c, ...a, ...c, ...d);
  q(P(...A, zf), P(...B, zf), P(...C, zf), P(...D, zf)); q(P(...A, zb), P(...B, zb), P(...C, zb), P(...D, zb));
  q(P(...A, zb), P(...A, zf), P(...D, zf), P(...D, zb)); q(P(...B, zb), P(...B, zf), P(...C, zf), P(...C, zb));
  orientOutward(loc);
  for (let i = 0; i < loc.length; i++) out.push(loc[i]);
}

/**
 * Wrap a plan's bag: every lattice leaf the builder adds (a thin slab with a painted pattern) is
 * replaced by a sheet of paper and the bars of the pattern as geometry standing on both its faces,
 * in the wood of the frame. Anything else passes through.
 */
export function realLatticeBag(bag, wood, opts = {}) {
  const cell = opts.cell ?? 0.115, only = opts.only;
  let seed = 7;
  return new Proxy(bag, {
    get(t, k) {
      if (k === 'add') return (mat, g) => {
        if (typeof mat !== 'string' || !mat.startsWith('lattice') || mat === 'lattice_red' || (only && !only.includes(mat))) return t.add(mat, g);
        const pos = g.attributes.position.array;
        let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
        for (let i = 0; i < pos.length; i += 3) { x0 = Math.min(x0, pos[i]); x1 = Math.max(x1, pos[i]); y0 = Math.min(y0, pos[i + 1]); y1 = Math.max(y1, pos[i + 1]); z0 = Math.min(z0, pos[i + 2]); z1 = Math.max(z1, pos[i + 2]); }
        const thinX = x1 - x0 < z1 - z0, th = thinX ? x1 - x0 : z1 - z0, w = thinX ? z1 - z0 : x1 - x0, h = y1 - y0;
        if (th > 0.3 || w < 0.25 || h < 0.25) return t.add(mat, g);
        const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        const F = thinX ? { x: cx, z: z0, y: y0, ux: 0, uz: 1, nx: 1, nz: 0 } : { x: x0, z: cz, y: y0, ux: 1, uz: 0, nx: 0, nz: 1 };
        // the paper, a thin sheet in the middle of the leaf
        t.add('plaster_white', thinX ? box(cx - 0.006, y0, z0, cx + 0.006, y1, z1) : box(x0, y0, cz - 0.006, x1, y1, cz + 0.006));
        const rand = rng(seed = (seed * 31 + Math.round((x0 + z0) * 97) + Math.round(y0 * 13)) >>> 0 || 1);
        const pat = PATTERN[mat] || 'lantern', c = pat === 'ice' ? cell * 2.1 : pat === 'wan' ? cell * 1.8 : cell;
        const S = pat === 'ice' ? ice(w, h, c, rand) : pat === 'wan' ? wan(w, h, c) : pat === 'lantern' ? lantern(w, h, c) : bubujin(w, h, c);
        const out = [], hw = 0.0105, zs = [[-0.034, 0.034], [-0.03, 0.03], [-0.026, 0.027]];
        for (const [u0, v0, u1, v1, kk] of S) { const z = zs[(kk ?? 0) % 3]; bar(out, F, u0, v0, u1, v1, hw, z[0], z[1]); }
        // a thin frame round the leaf, standing a little proud of the bars
        for (const [u0, v0, u1, v1] of [[0, 0.012, w, 0.012], [0, h - 0.012, w, h - 0.012]]) bar(out, F, u0, v0, u1, v1, 0.014, -0.038, 0.038);
        for (const u of [0.012, w - 0.012]) bar(out, F, u, 0, u, h, 0.012, -0.038, 0.038);
        t.add(wood, fromTriangles(out));
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}

// ── the roof's cover tiles and the eaves' rafters ──
/** A bar along a polyline of 3D points, trapezoid section: base half-width b, top half-width a, height hh; cap at the last end. */
function ridgeBar(out, pts, b, a, hh, capEnd = false) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dz = q[2] - p[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
    const B0 = [p[0] - nx * b, p[1], p[2] - nz * b], B1 = [p[0] + nx * b, p[1], p[2] + nz * b], B2 = [q[0] + nx * b, q[1], q[2] + nz * b], B3 = [q[0] - nx * b, q[1], q[2] - nz * b];
    const T0 = [p[0] - nx * a, p[1] + hh, p[2] - nz * a], T1 = [p[0] + nx * a, p[1] + hh, p[2] + nz * a], T2 = [q[0] + nx * a, q[1] + hh, q[2] + nz * a], T3 = [q[0] - nx * a, q[1] + hh, q[2] - nz * a];
    const loc = [], f = (A, B, C, D) => loc.push(...A, ...B, ...C, ...A, ...C, ...D);
    f(T0, T1, T2, T3); f(B0, T0, T3, B3); f(B1, B2, T2, T1);
    if (capEnd && i === 0) f(B0, B1, T1, T0);
    const mid = [(p[0] + q[0]) / 2, p[1] + hh * 0.4, (p[2] + q[2]) / 2];
    for (let k = 0; k < loc.length; k += 9) {                      // each face turned to look away from the bar's axis
      const ux = loc[k + 3] - loc[k], uy = loc[k + 4] - loc[k + 1], uz = loc[k + 5] - loc[k + 2], vx = loc[k + 6] - loc[k], vy = loc[k + 7] - loc[k + 1], vz = loc[k + 8] - loc[k + 2];
      const n0 = uy * vz - uz * vy, n1 = uz * vx - ux * vz, n2 = ux * vy - uy * vx;
      const cx = (loc[k] + loc[k + 3] + loc[k + 6]) / 3 - mid[0], cy = (loc[k + 1] + loc[k + 4] + loc[k + 7]) / 3 - mid[1], cz = (loc[k + 2] + loc[k + 5] + loc[k + 8]) / 3 - mid[2];
      if (n0 * cx + n1 * cy + n2 * cz < 0) for (let m = 0; m < 3; m++) { const tt = loc[k + 3 + m]; loc[k + 3 + m] = loc[k + 6 + m]; loc[k + 6 + m] = tt; }
    }
    out.push(...loc);
  }
}

/**
 * The cover tiles (gai wa) of a hall's main slopes: a row down every 0.21 m from the ridge to the eave, on
 * the roof's own curve (ming_hall's rectRoof: height yr + rise·t^1.7 with t the fraction of the way to
 * the ridge), and the rafters (chuan) under the soffit, ending in a plastered tip.
 */
export function roofWork(bag, el, mats) {
  const [x0, z0, x1, z1] = el.rect, along = x1 - x0 >= z1 - z0, Lx = x1 - x0, Lz = z1 - z0, o = el.eave ?? 1.25;
  if (!along || (el.roof ?? 'xieshan') !== 'xieshan') return;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, A = Lx / 2 + o, B = Lz / 2 + o, R = el.rise ?? B * 0.62, yr = el.y + el.H - 0.25, p = 1.7, gAt = el.gableAt ?? 0.42;
  const xg = A - gAt * B, N = 6, hOf = (az) => yr + R * Math.pow(Math.max(0, (B - az) / B), p);
  const tiles = [], rafters = [];
  const nr = Math.floor((xg - 0.22) / 0.21);
  for (let i = -nr; i <= nr; i++) {
    const x = cx + i * 0.21;
    for (const s of [-1, 1]) {
      const pts = [];
      for (let k = 0; k <= N; k++) { const az = B * (1 - k / N); pts.push([x, hOf(az) + 0.012, cz + s * az]); }
      pts.reverse();
      // the row is bedded into the tiles under it: its base a hair below the surface
      ridgeBar(tiles, pts.map((q) => [q[0], q[1] - 0.012, q[2]]), 0.062, 0.04, 0.07, false);
    }
  }
  // rafters under the eave: from the plate on the wall's top to the eave's edge, on the soffit's own curve (0.14 under the tiles)
  const wallAz = Lz / 2 + 0.02, nrf = Math.floor((xg - 0.3) / 0.27);
  for (let i = -nrf; i <= nrf; i++) {
    const x = cx + i * 0.27;
    for (const s of [-1, 1]) {
      const pts = [];
      const a0 = wallAz, a1 = B - 0.03, M = 5;
      for (let k = 0; k <= M; k++) { const az = a0 + (a1 - a0) * k / M; pts.push([x, hOf(az) - 0.14 - 0.075, cz + s * az]); }
      ridgeBar(rafters, pts, 0.038, 0.034, 0.075, false);
    }
  }
  bag.add(mats.roof, fromTriangles(tiles));
  bag.add(mats.wood, fromTriangles(rafters));
}

// ── the terrace's stone balustrade ──
const STONE = 'bluestone';
/**
 * terrace_rail { rect: [x0, z0, x1, z1] (the terrace), y (its top), sides: ['n', 'w', 'e', 's'], h }: posts with a
 * lotus-bud head every ~1.9 m, between them a top rail, a plinth rail and a panel with a recessed field
 * and a raised medallion. Rails collide; the panels' bays are open below the top rail at nothing — it
 * is a parapet 0.95 m high.
 */
export function terraceRail(el, { bag: real, col }) {
  // (one piece, so that the rail is drawn with the terrace's own stone and not as loose detail)
  const acc = [], bag = { add: (m, g) => { const n = g.index ? g.toNonIndexed() : g, a = n.attributes.position.array; for (let i = 0; i < a.length; i++) acc.push(a[i]); } };
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 0.95, ins = 0.14;
  const runs = [];
  const sides = el.sides ?? ['n', 'w', 'e'];
  if (sides.includes('n')) runs.push([[x0 + ins, z0 + ins], [x1 - ins, z0 + ins]]);
  if (sides.includes('s')) runs.push([[x1 - ins, z1 - ins], [x0 + ins, z1 - ins]]);
  if (sides.includes('w')) runs.push([[x0 + ins, z0 + ins], [x0 + ins, z1 - ins]]);
  if (sides.includes('e')) runs.push([[x1 - ins, z0 + ins], [x1 - ins, z1 - ins]]);
  const posts = new Map();
  const post = (x, z) => {
    const key = `${x.toFixed(2)},${z.toFixed(2)}`; if (posts.has(key)) return; posts.set(key, 1);
    bag.add(STONE, box(x - 0.12, y, z - 0.12, x + 0.12, y + 0.16, z + 0.12));                 // the foot
    bag.add(STONE, box(x - 0.095, y + 0.16, z - 0.095, x + 0.095, y + h - 0.12, z + 0.095));  // the shaft
    bag.add(STONE, box(x - 0.115, y + h - 0.12, z - 0.115, x + 0.115, y + h - 0.07, z + 0.115)); // the collar
    bag.add(STONE, lathe([[0.001, 0], [0.07, 0.01], [0.085, 0.045], [0.07, 0.1], [0.04, 0.15], [0.012, 0.185], [0.001, 0.2]], 10, null, x, y + h - 0.07, z));   // the bud
    col.circle(x, z, 0.12, y, y + h);
  };
  for (const [a, b] of runs) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 1.9)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
    for (let i = 0; i <= n; i++) post(a[0] + ux * L * i / n, a[1] + uz * L * i / n);
    for (let i = 0; i < n; i++) {
      const s0 = L * i / n + 0.12, s1 = L * (i + 1) / n - 0.12;
      const P = (s, t) => [a[0] + ux * s + nx * t, a[1] + uz * s + nz * t];
      const slab = (sa, sb, ya, yb, t) => { const p = P(sa, 0), q = P(sb, 0); bag.add(STONE, box(Math.min(p[0], q[0]) - Math.abs(nx) * t, y + ya, Math.min(p[1], q[1]) - Math.abs(nz) * t, Math.max(p[0], q[0]) + Math.abs(nx) * t, y + yb, Math.max(p[1], q[1]) + Math.abs(nz) * t)); };
      slab(s0, s1, h - 0.2, h - 0.07, 0.075);          // the top rail (xunzi)
      slab(s0, s1, h - 0.255, h - 0.2, 0.05);          // its under-moulding, set back
      slab(s0, s1, 0.16, 0.26, 0.065);                 // the foot rail
      // the panel: frame, recessed field, a raised medallion in it
      slab(s0, s1, 0.26, h - 0.255, 0.04);
      const fw = 0.07, m0 = s0 + fw, m1 = s1 - fw, my0 = 0.26 + fw, my1 = h - 0.255 - fw;
      slab(s0, m0, 0.26, h - 0.255, 0.06); slab(m1, s1, 0.26, h - 0.255, 0.06); slab(m0, m1, 0.26, my0, 0.06); slab(m0, m1, my1, h - 0.255, 0.06);
      const c = (m0 + m1) / 2, ym = (my0 + my1) / 2;
      for (const sg of [-1, 1]) {                       // a lozenge medallion on each face
        const q = [];
        const pc = (s, v, t) => { const r = P(s, sg * t); return [r[0], y + v, r[1]]; };
        const hw = Math.min(0.2, (m1 - m0) * 0.28), hh = Math.min(0.17, (my1 - my0) * 0.4), t0 = 0.04, t1 = 0.062;
        const top = [pc(c, ym + hh, t1), pc(c + hw, ym, t1), pc(c, ym - hh, t1), pc(c - hw, ym, t1)];
        q.push(...top[0], ...top[1], ...top[2], ...top[0], ...top[2], ...top[3]);
        for (let k = 0; k < 4; k++) { const A2 = top[k], B2 = top[(k + 1) % 4], a0 = [A2[0] + (pc(0, 0, t0)[0] - pc(0, 0, t1)[0]), A2[1], A2[2] + (pc(0, 0, t0)[2] - pc(0, 0, t1)[2])], b0 = [B2[0] + (pc(0, 0, t0)[0] - pc(0, 0, t1)[0]), B2[1], B2[2] + (pc(0, 0, t0)[2] - pc(0, 0, t1)[2])]; q.push(...a0, ...b0, ...B2, ...a0, ...B2, ...A2); }
        orientOutward(q);
        bag.add(STONE, fromTriangles(q));
      }
    }
    col.segment(a, b, 0.2, y, y + h);
  }
  real.add(STONE, fromTriangles(acc));
}

// ── the moon gates' dressing ──
const TAU = Math.PI * 2;
/**
 * moon_dress { c: [x, z] (the gate's centre on the wall's line), u: [ux, uz] (the wall's direction), y (the wall's foot),
 * r (the opening), th (the wall's thickness) }: on both faces of the wall, round the opening's brick rim, a stepped
 * moulding of three rings (a broad band, a bead, a fillet), a square frame of brick bands round it and a
 * stepped rosette in each of the four corners (the spandrels); in the opening's foot a bluestone sill.
 */
export function moonDress(el, { bag }) {
  const [ux, uz] = el.u, nx = -uz, nz = ux, rr = el.r, th = el.th, cy = el.y + rr + 0.05, f0 = th / 2;
  const W = (u, v, z) => [el.c[0] + ux * u + nx * z, cy + v, el.c[1] + uz * u + nz * z];
  const D = (du, dv, dz) => [ux * du + nx * dz, dv, uz * du + nz * dz];
  const T = [], N = 40;
  // a triangle turned to face along dir
  const tri = (a, b, c, dir) => {
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2] >= 0) T.push(...a, ...b, ...c); else T.push(...a, ...c, ...b);
  };
  const quad = (a, b, c, d, dir) => { tri(a, b, c, dir); tri(a, c, d, dir); };
  for (const sg of [-1, 1]) {
    const Z = (z) => sg * z;
    const out = D(0, 0, sg);
    const ring = (r0, r1, zf) => {
      for (let k = 0; k < N; k++) {
        const a0 = k / N * TAU, a1 = (k + 1) / N * TAU, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1), cm = Math.cos((a0 + a1) / 2), sm = Math.sin((a0 + a1) / 2);
        quad(W(c0 * r0, s0 * r0, Z(zf)), W(c1 * r0, s1 * r0, Z(zf)), W(c1 * r1, s1 * r1, Z(zf)), W(c0 * r1, s0 * r1, Z(zf)), out);
        quad(W(c0 * r1, s0 * r1, Z(f0)), W(c1 * r1, s1 * r1, Z(f0)), W(c1 * r1, s1 * r1, Z(zf)), W(c0 * r1, s0 * r1, Z(zf)), D(cm, sm, 0));
        quad(W(c0 * r0, s0 * r0, Z(f0 + 0.025)), W(c1 * r0, s1 * r0, Z(f0 + 0.025)), W(c1 * r0, s1 * r0, Z(zf)), W(c0 * r0, s0 * r0, Z(zf)), D(-cm, -sm, 0));
      }
    };
    ring(rr + 0.115, rr + 0.27, f0 + 0.05);            // the broad band
    ring(rr + 0.27, rr + 0.325, f0 + 0.075);           // the bead
    ring(rr + 0.325, rr + 0.38, f0 + 0.04);            // the fillet
    // the spandrels' rosettes: four stacked discs, the top a bud
    for (const [su, sv] of [[1, 1], [-1, 1]]) {
      const cu = su * (rr + 0.62) * 0.707, cv = sv * (rr + 0.62) * 0.707;
      [[0.15, 0.014], [0.105, 0.028], [0.065, 0.042], [0.03, 0.056]].forEach(([r, d]) => {
        const M = 14;
        for (let k = 0; k < M; k++) {
          const a0 = k / M * TAU, a1 = (k + 1) / M * TAU, am = (a0 + a1) / 2;
          tri(W(cu, cv, Z(f0 + d)), W(cu + Math.cos(a0) * r, cv + Math.sin(a0) * r, Z(f0 + d)), W(cu + Math.cos(a1) * r, cv + Math.sin(a1) * r, Z(f0 + d)), out);
          quad(W(cu + Math.cos(a0) * r, cv + Math.sin(a0) * r, Z(f0)), W(cu + Math.cos(a1) * r, cv + Math.sin(a1) * r, Z(f0)), W(cu + Math.cos(a1) * r, cv + Math.sin(a1) * r, Z(f0 + d)), W(cu + Math.cos(a0) * r, cv + Math.sin(a0) * r, Z(f0 + d)), D(Math.cos(am), Math.sin(am), 0));
        }
      });
    }
  }
  bag.add('plaster_grey', fromTriangles(T));
}
