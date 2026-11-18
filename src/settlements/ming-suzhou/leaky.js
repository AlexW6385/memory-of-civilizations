// The leaky windows (lou chuang) of the Humble Administrator's Garden, each of its own tracery
// (docs/settlements/ming-suzhou.md §5 and §19): ice-crack (bing lie), copper cash (tong qian),
// begonia (hai tang), the eight directions (ba fang), swastika fret (wan zi), tortoise shell, lozenge,
// water waves (shui wen), the folding fan's ribs, plum over ice, and the vase (ping) — real openwork
// of slender bars standing through the wall's thickness, seen through from either side.
//
// The shared wall (src/styles/ming/index.js mingWall, also called inside mingGallery) draws four
// traceries of its own; `leakyBag` lets it cut the holes and the frames but drops that tracery, and
// `leakyWork` draws ours in its place, picking each window's pattern from a hash of its place among
// those that suit its outline. Patterns for the walls and galleries of the garden only.

import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { fromTriangles, orientOutward } from '../../core/geom.js';

const TAU = Math.PI * 2;
function hash(x, z, k = 0) {
  let h = Math.imul(Math.round(x * 16) | 0, 374761393) ^ Math.imul(Math.round(z * 16) | 0, 668265263) ^ Math.imul(k + 7, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the outline of a window (as the shared wall cuts it) ────────────────────
function outline(shape, cu, cv, w, h) {
  const pts = [], hw = w / 2, hh = h / 2;
  if (shape === 'round' || shape === 'begonia') {
    const N = shape === 'round' ? 40 : 64;
    for (let k = 0; k < N; k++) { const a = k / N * TAU, r = shape === 'round' ? 1 : 0.86 + 0.14 * Math.abs(Math.cos(2 * a)); pts.push([cu + Math.cos(a) * hw * r, cv + Math.sin(a) * hh * r]); }
  } else if (shape === 'hex' || shape === 'oct') {
    const N = shape === 'hex' ? 6 : 8, a0 = shape === 'hex' ? 0 : Math.PI / 8, sc = shape === 'oct' ? 1 / Math.cos(Math.PI / 8) : 1;
    for (let k = 0; k < N; k++) { const a = a0 + k / N * TAU; pts.push([cu + Math.cos(a) * hw * sc, cv + Math.sin(a) * hh * (shape === 'hex' ? 1 / Math.sin(Math.PI / 3) : sc)]); }
    for (const p of pts) { p[0] = cu + Math.max(-hw, Math.min(hw, p[0] - cu)); p[1] = cv + Math.max(-hh, Math.min(hh, p[1] - cv)); }
  } else if (shape === 'fan') {
    const R = fanR(w, h), oy = cv - hh + h - R, span = FAN_SPAN;
    for (let k = 0; k <= 16; k++) { const a = Math.PI / 2 - span + 2 * span * k / 16; pts.push([cu + Math.cos(a) * R, oy + Math.sin(a) * R]); }
    for (let k = 16; k >= 0; k--) { const a = Math.PI / 2 - span + 2 * span * k / 16; pts.push([cu + Math.cos(a) * R * 0.4, oy + Math.sin(a) * R * 0.4]); }
  } else pts.push([cu - hw, cv - hh], [cu + hw, cv - hh], [cu + hw, cv + hh], [cu - hw, cv + hh]);
  return pts;
}
const FAN_SPAN = 50 * Math.PI / 180;
const fanR = (w, h) => Math.min(w / 2 / Math.sin(FAN_SPAN), h / (1 - 0.4 * Math.cos(FAN_SPAN)));
/** The vase's outline in a box (the opening left in a rectangular hole by blanking plates): foot, waist, belly, neck, a flared lip. */
function vaseOutline(cu, cv, w, h) {
  const prof = [[0.0, 0.34], [0.06, 0.4], [0.2, 0.34], [0.3, 0.42], [0.42, 0.5], [0.55, 0.48], [0.66, 0.32], [0.76, 0.17], [0.86, 0.17], [0.93, 0.26], [1.0, 0.3]];
  const L = [], R = [];
  const at = (t) => { let i = 0; while (i < prof.length - 2 && t > prof[i + 1][0]) i++; const [t0, a] = prof[i], [t1, b] = prof[i + 1], u = (t - t0) / (t1 - t0), s = u * u * (3 - 2 * u); return a + (b - a) * s; };
  for (let k = 0; k <= 24; k++) { const t = k / 24, hw = at(t) * w * 0.96; R.push([cu + hw, cv - h / 2 + t * h]); L.push([cu - hw, cv - h / 2 + t * h]); }
  return [...R, ...L.reverse()];
}
function inPoly(P, u, v) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [ui, vi] = P[i], [uj, vj] = P[j];
    if ((vi > v) !== (vj > v) && u < (uj - ui) * (v - vi) / (vj - vi) + ui) c = !c;
  }
  return c;
}
function clipTo(S, P) {
  const out = [];
  for (const [p, q] of S) {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.ceil(L / 0.03));
    let start = -1;
    for (let k = 0; k <= n; k++) {
      const inside = k < n && inPoly(P, p[0] + (q[0] - p[0]) * (k + 0.5) / n, p[1] + (q[1] - p[1]) * (k + 0.5) / n);
      if (inside && start < 0) start = k;
      if (!inside && start >= 0) { out.push([[p[0] + (q[0] - p[0]) * start / n, p[1] + (q[1] - p[1]) * start / n], [p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]]); start = -1; }
    }
  }
  return out;
}
const arc = (S, cu, cv, r, a0, a1, n) => { for (let k = 0; k < n; k++) { const a = a0 + (a1 - a0) * k / n, b = a0 + (a1 - a0) * (k + 1) / n; S.push([[cu + Math.cos(a) * r, cv + Math.sin(a) * r], [cu + Math.cos(b) * r, cv + Math.sin(b) * r]]); } };

// ── the patterns: segments in the wall's plane over the box [u0, v0, u1, v1] ─
const PATTERNS = {
  /** cracked ice: the box split again and again along random lines, every crack ending on another */
  ice(box, ctx, rand) {
    const S = [], [u0, v0, u1, v1] = box;
    const split = (poly, depth) => {
      let cu = 0, cv = 0; for (const p of poly) { cu += p[0]; cv += p[1]; } cu /= poly.length; cv /= poly.length;
      const ext = Math.max(...poly.map((p) => Math.hypot(p[0] - cu, p[1] - cv)));
      if (depth > 6 || ext < 0.17) return;
      const a = rand() * Math.PI, du = Math.cos(a), dv = Math.sin(a), ou = cu + (rand() - 0.5) * ext * 0.5, ov = cv + (rand() - 0.5) * ext * 0.5;
      const side = (p) => (p[0] - ou) * dv - (p[1] - ov) * du, A = [], B = [], cut = [];
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q);
        (sp >= 0 ? A : B).push(p);
        if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq), x = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; A.push(x); B.push(x); cut.push(x); }
      }
      if (cut.length === 2) S.push(cut);
      if (A.length > 2) split(A, depth + 1);
      if (B.length > 2) split(B, depth + 1);
    };
    split([[u0, v0], [u1, v0], [u1, v1], [u0, v1]], 0);
    return S;
  },
  /** copper cash: a ring with a square hole at every cell, the rings touching */
  cash([u0, v0, u1, v1]) {
    const S = [], s = 0.24, r = s / 2 * 0.98, q = s * 0.17;
    const cu0 = (u0 + u1) / 2 - Math.ceil((u1 - u0) / 2 / s) * s, cv0 = (v0 + v1) / 2 - Math.ceil((v1 - v0) / 2 / s) * s;
    for (let cu = cu0; cu < u1 + s; cu += s) for (let cv = cv0; cv < v1 + s; cv += s) {
      arc(S, cu, cv, r, 0, TAU, 12);
      S.push([[cu - q, cv - q], [cu + q, cv - q]], [[cu + q, cv - q], [cu + q, cv + q]], [[cu + q, cv + q], [cu - q, cv + q]], [[cu - q, cv + q], [cu - q, cv - q]]);
    }
    return S;
  },
  /** swastika fret: the arms of each tile turning to meet the neighbours', so that the fret never ends */
  wan([u0, v0, u1, v1]) {
    const S = [], h = 0.12, cu0 = (u0 + u1) / 2 - Math.ceil((u1 - u0) / 2 / (2 * h)) * 2 * h, cv0 = (v0 + v1) / 2 - Math.ceil((v1 - v0) / 2 / (2 * h)) * 2 * h;
    for (let cu = cu0; cu < u1 + 2 * h; cu += 2 * h) for (let cv = cv0; cv < v1 + 2 * h; cv += 2 * h) {
      const P = (a, b) => [cu + a * h, cv + b * h];
      S.push([P(0, 0), P(1, 0)], [P(1, 0), P(1, 1)], [P(0, 0), P(0, 1)], [P(0, 1), P(-1, 1)], [P(0, 0), P(-1, 0)], [P(-1, 0), P(-1, -1)], [P(0, 0), P(0, -1)], [P(0, -1), P(1, -1)]);
    }
    return S;
  },
  /** the eight directions: octagons and little squares, the truncated square tiling */
  bafang([u0, v0, u1, v1]) {
    const S = [], a = 0.1, pitch = a * (1 + Math.SQRT2), k = a * (1 + Math.SQRT2) / 2;
    const cu0 = (u0 + u1) / 2 - Math.ceil((u1 - u0) / 2 / pitch) * pitch, cv0 = (v0 + v1) / 2 - Math.ceil((v1 - v0) / 2 / pitch) * pitch;
    for (let cu = cu0; cu < u1 + pitch; cu += pitch) for (let cv = cv0; cv < v1 + pitch; cv += pitch) {
      const h = a / 2, P = (x, y) => [cu + x, cv + y];
      // the octagon's east and north sides, then its four slanted sides (the west and south are the neighbours')
      S.push([P(k, -h), P(k, h)], [P(-h, k), P(h, k)], [P(k, h), P(h, k)], [P(-h, k), P(-k, h)], [P(-k, -h), P(-h, -k)], [P(h, -k), P(k, -h)]);
    }
    return S;
  },
  /** tortoise shell: hexagons */
  turtle([u0, v0, u1, v1]) {
    const S = [], r = 0.16, dx = r * 1.5, dy = r * Math.sqrt(3);
    for (let i = Math.floor(u0 / dx) - 1; i * dx < u1 + dx; i++) for (let j = Math.floor(v0 / dy) - 1; j * dy < v1 + dy; j++) {
      const cu = i * dx, cv = j * dy + (i & 1 ? dy / 2 : 0);
      for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, b = (k + 1) * Math.PI / 3; S.push([[cu + Math.cos(a) * r, cv + Math.sin(a) * r], [cu + Math.cos(b) * r, cv + Math.sin(b) * r]]); }
    }
    return S;
  },
  /** lozenges: lines at right angles on the diagonal */
  lozenge([u0, v0, u1, v1]) {
    const S = [], d = 0.17, n = Math.ceil((u1 - u0 + v1 - v0) / d) + 2;
    for (let k = -n; k <= n; k++) {
      const c = (u0 + v0) / 2 + k * d, e = (u0 - v0) / 2 + k * d;
      S.push([[2 * c - (v0 - 1), v0 - 1], [2 * c - (v1 + 1), v1 + 1]]);
      S.push([[2 * e + (v0 - 1), v0 - 1], [2 * e + (v1 + 1), v1 + 1]]);
    }
    return S;
  },
  /** water waves: rows of sine curves, each row a little out of step with the last, tied by short uprights */
  wave([u0, v0, u1, v1], ctx, rand) {
    const S = [], row = 0.15, lam = 0.46 + rand() * 0.2, amp = 0.045, ph = rand() * TAU;
    for (let v = v0 + row * 0.6; v < v1; v += row) {
      const j = Math.round((v - v0) / row);
      let pu = u0, pv = v + amp * Math.sin((u0 / lam + j * 0.18) * TAU + ph);
      for (let u = u0 + 0.04; u <= u1 + 0.04; u += 0.04) { const nv = v + amp * Math.sin((u / lam + j * 0.18) * TAU + ph); S.push([[pu, pv], [u, nv]]); pu = u; pv = nv; }
      if (j % 2 === 0) for (let u = u0 + lam * 0.25; u < u1; u += lam) S.push([[u, v - 0.01], [u, v + row - 0.01]]);
    }
    return S;
  },
  /** the folding fan: ribs from its pivot, an arc across them */
  fan(box, ctx) {
    const S = [], R = fanR(ctx.w, ctx.h), cu = ctx.cu, oy = ctx.cv - ctx.h / 2 + ctx.h - R;
    for (let k = 0; k <= 12; k++) { const a = Math.PI / 2 - FAN_SPAN + 2 * FAN_SPAN * k / 12; S.push([[cu + Math.cos(a) * R * 0.4, oy + Math.sin(a) * R * 0.4], [cu + Math.cos(a) * R * 1.02, oy + Math.sin(a) * R * 1.02]]); }
    arc(S, cu, oy, R * 0.7, Math.PI / 2 - FAN_SPAN, Math.PI / 2 + FAN_SPAN, 14);
    return S;
  },
  /** the crab-apple flower: four petals round a heart, a ring, spokes */
  begonia(box, ctx) {
    const S = [], R = Math.min(ctx.w, ctx.h) / 2, cu = ctx.cu, cv = ctx.cv;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) arc(S, cu + dx * R * 0.34, cv + dy * R * 0.34, R * 0.34, 0, TAU, 12);
    arc(S, cu, cv, R * 0.74, 0, TAU, 24);
    for (const a of [0.785, 2.356, 3.927, 5.498]) S.push([[cu + Math.cos(a) * R * 0.3, cv + Math.sin(a) * R * 0.3], [cu + Math.cos(a) * R * 0.74, cv + Math.sin(a) * R * 0.74]], [[cu + Math.cos(a) * R * 0.74, cv + Math.sin(a) * R * 0.74], [cu + Math.cos(a) * R * 1.1, cv + Math.sin(a) * R * 1.1]]);
    return S;
  },
  /** plum over ice: a five-petalled plum flower in the middle of cracked ice */
  plumice(box, ctx, rand) {
    const S = PATTERNS.ice(box, ctx, rand), cu = ctx.cu, cv = ctx.cv, R = Math.min(ctx.w, ctx.h) * 0.22;
    const out = S.filter(([p, q]) => Math.hypot((p[0] + q[0]) / 2 - cu, (p[1] + q[1]) / 2 - cv) > R * 1.5);
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + 0.3; arc(out, cu + Math.cos(a) * R * 0.62, cv + Math.sin(a) * R * 0.62, R * 0.62, 0, TAU, 10); }
    return out;
  },
};
/** The patterns that suit an outline. */
const SUIT = {
  rect: ['ice', 'cash', 'wan', 'bafang', 'lozenge', 'wave', 'plumice', 'turtle', 'vase'],
  oct: ['bafang', 'cash', 'ice', 'lozenge'],
  hex: ['turtle', 'ice', 'bafang', 'wan'],
  round: ['cash', 'begonia', 'bafang', 'ice', 'wave'],
  begonia: ['begonia', 'plumice', 'cash'],
  fan: ['fan'],
};

/** A bar in the wall's plane from p to q ([u, v]), hw half its face, d its depth through the wall; W(u, v, o) maps to the world. */
function bar(out, W, p, q, hw, d) {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, pu = -(q[1] - p[1]) / L * hw, pv = (q[0] - p[0]) / L * hw;
  const c = [];
  for (const o of [-d / 2, d / 2]) for (const [bu, bv] of [p, q]) for (const sg of [-1, 1]) c.push(W(bu + pu * sg, bv + pv * sg, o));
  const loc = [], f = (a, b, cc, dd) => loc.push(...c[a], ...c[b], ...c[cc], ...c[a], ...c[cc], ...c[dd]);
  f(0, 1, 3, 2); f(4, 6, 7, 5); f(0, 2, 6, 4); f(1, 5, 7, 3);
  for (const v of orientOutward(loc)) out.push(v);
}

/**
 * Draw the tracery of one window into `bag` (material `mat`): w = { at (along the wall), cv (its
 * middle's height), w, h, shape, seed (a hash of its place) }; W maps (u, v, o) to the world.
 */
export function leakyWork(bag, mat, win, W, M) {
  const { at, cv, w, h, shape } = win, hs = win.seed;
  const rand = rng(Math.round(hs * 1e6) + 3);
  const suit = SUIT[shape] || SUIT.rect;
  const pat = suit[Math.floor(hs * suit.length) % suit.length];
  const t = [];
  if (pat === 'vase') {
    // a rectangular hole, blanked to a vase: plates of grey brick cover what is not vase, the vase itself filled with lozenges
    const vo = vaseOutline(at, cv, w - 0.03, h - 0.03), box = [at - w / 2, cv - h / 2, at + w / 2, cv + h / 2];
    const sh = new Shape(); sh.moveTo(at - w / 2 + 0.012, cv - h / 2 + 0.012); sh.lineTo(at + w / 2 - 0.012, cv - h / 2 + 0.012); sh.lineTo(at + w / 2 - 0.012, cv + h / 2 - 0.012); sh.lineTo(at - w / 2 + 0.012, cv + h / 2 - 0.012); sh.lineTo(at - w / 2 + 0.012, cv - h / 2 + 0.012);
    const hp = new Path(); hp.moveTo(...vo[0]); for (const p of vo.slice(1).reverse()) hp.lineTo(...p); hp.lineTo(...vo[0]); sh.holes.push(hp);
    const g = new ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false, curveSegments: 4 });
    g.translate(0, 0, -0.035);
    bag.add(mat, g.applyMatrix4(M));
    for (let k = 0; k < vo.length; k++) bar(t, W, vo[k], vo[(k + 1) % vo.length], 0.022, 0.075);
    const segs = clipTo(PATTERNS.lozenge(box), vo);
    for (const [p, q] of segs) bar(t, W, p, q, 0.016, 0.07);
    bag.add(mat, fromTriangles(t));
    return pat;
  }
  const inner = outline(shape, at, cv, w - 0.03, h - 0.03);
  const segs = clipTo(PATTERNS[pat]([at - w / 2, cv - h / 2, at + w / 2, cv + h / 2], { cu: at, cv, w, h }, rand), inner);
  for (let k = 0; k < inner.length; k++) bar(t, W, inner[k], inner[(k + 1) % inner.length], 0.022, 0.07);
  for (const [p, q] of segs) bar(t, W, p, q, pat === 'wave' || pat === 'wan' ? 0.014 : 0.016, 0.07);
  bag.add(mat, fromTriangles(t));
  return pat;
}

// ── the wrapping of the shared wall and gallery ─────────────────────────────
const SH = ['rect', 'oct', 'round', 'hex', 'begonia', 'rect', 'fan'];
/** The windows a shared gallery element makes, as the shared code lays them out (mirrors mingGallery). */
function galleryWindows(el) {
  const out = [], w = (el.w ?? 2.0) / 2, y = el.y ?? 0.3, pts = el.pts;
  if (!el.side) return out;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, sg = el.side;
    const n = Math.max(1, Math.round(L / 3));
    const A = [a[0] + nx * (w + 0.1) * sg, a[1] + nz * (w + 0.1) * sg], B = [b[0] + nx * (w + 0.1) * sg, b[1] + nz * (w + 0.1) * sg];
    const wins = el.fine && n > 1
      ? Array.from({ length: n }, (_, k) => k).filter((k) => k % 3 === 1).map((k, j) => ({ at: (k + 0.5) * L / n, w: 0.95, h: 0.95, sill: 1.05, shape: SH[(i * 3 + j) % 7] }))
      : L > 4 ? [{ at: L / 2, w: 1.0, h: 1.0, sill: 1.1, shape: SH[i % 7] }] : [];
    for (const wd of wins) if (wd.shape === 'fan') { wd.w *= 1.25; wd.h *= 0.8; }
    const gates = [];
    for (const g of el.gates || []) {
      const u = (g.at[0] - A[0]) * (B[0] - A[0]) / L + (g.at[1] - A[1]) * (B[1] - A[1]) / L, off = Math.abs((g.at[0] - A[0]) * nx + (g.at[1] - A[1]) * nz);
      if (u > g.r + 0.3 && u < L - g.r - 0.3 && off < w + 1) gates.push({ at: u, r: g.r });
    }
    for (const wd of wins.filter((q) => gates.every((g) => Math.abs(q.at - g.at) > g.r + q.w / 2 + 0.4))) out.push({ a: A, b: B, y, ...wd });
  }
  return out;
}
function wallWindows(el) {
  return (el.windows || []).map((wd) => ({ a: el.a, b: el.b, y: el.y, ...wd, sill: wd.sill ?? 1.2, shape: wd.shape || 'rect' }));
}

/**
 * Wrap a ctx for a shared wall or gallery element: the tracery the shared code draws in each of
 * `wins` is dropped (recognised by its box: at the window, its outline's size, in the plinth
 * material), and ours is added afterwards by `finish()`. Returns { ctx, finish, dropped }.
 */
export function leakyCtx(ctx, el, kind, plinth = 'plaster_grey') {
  const wins = (kind === 'gallery' ? galleryWindows(el) : wallWindows(el)).map((wd) => {
    const [ax, az] = wd.a, [bx, bz] = wd.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    const cv = wd.sill + wd.h / 2, cx = ax + ux * wd.at, cz = az + uz * wd.at;
    return { ...wd, ux, uz, cx, cz, cv, cy: wd.y + cv, L };
  });
  const state = { dropped: 0 };
  const bag = Object.create(ctx.bag);
  bag.add = (mat, g) => {
    if (mat === plinth && wins.length) {
      const P = g.attributes.position.array;
      let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9, mnz = 1e9, mxz = -1e9;
      for (let i = 0; i < P.length; i += 3) { if (P[i] < mnx) mnx = P[i]; if (P[i] > mxx) mxx = P[i]; if (P[i + 1] < mny) mny = P[i + 1]; if (P[i + 1] > mxy) mxy = P[i + 1]; if (P[i + 2] < mnz) mnz = P[i + 2]; if (P[i + 2] > mxz) mxz = P[i + 2]; }
      const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2, cz = (mnz + mxz) / 2;
      for (const wd of wins) {
        // its box lies within the window's (a frame is the window and 0.2 more; the tracery, the window itself)
        if (Math.abs(cx - wd.cx) > wd.w / 2 + 0.06 || Math.abs(cz - wd.cz) > wd.w / 2 + 0.06 || Math.abs(cy - wd.cy) > wd.h / 2 + 0.06) continue;
        let lo = 1e9, hi = -1e9;
        for (let i = 0; i < P.length; i += 3) { const u = (P[i] - wd.cx) * wd.ux + (P[i + 2] - wd.cz) * wd.uz; if (u < lo) lo = u; if (u > hi) hi = u; }
        if (hi - lo < wd.w + 0.06 && mxy - mny < wd.h + 0.06) { state.dropped++; return; }
      }
    }
    ctx.bag.add(mat, g);
  };
  const finish = () => {
    const out = [];
    for (const wd of wins) {
      const nx = -wd.uz, nz = wd.ux, W = (u, v, o) => [wd.a[0] + wd.ux * u + nx * o, wd.y + v, wd.a[1] + wd.uz * u + nz * o];
      const M = new Matrix4().makeBasis({ x: wd.ux, y: 0, z: wd.uz }, { x: 0, y: 1, z: 0 }, { x: -wd.uz, y: 0, z: wd.ux }).setPosition(wd.a[0], wd.y, wd.a[1]);
      out.push(leakyWork(ctx.bag, plinth, { at: wd.at, cv: wd.cv, w: wd.w, h: wd.h, shape: wd.shape, seed: hash(wd.cx, wd.cz, 3) }, W, M));
    }
    return out;
  };
  return { ctx: { ...ctx, bag }, finish, state, count: wins.length };
}
