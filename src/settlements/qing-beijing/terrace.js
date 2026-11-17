// The Hall of Supreme Harmony's three-tier marble terrace, close to (docs/settlements/qing-beijing.md §36): bj_terrace and
// bj_stairs wrap the style's terrace and stairs, swapping the balustrade posts for posts with a foot, belt, a ring of
// lotus petals under the carved head (dragon or phoenix), hanging the dragon-head drains (chishou) with open mouths,
// horns, brows, snouts and manes, and carving the sumeru base's lotus-petal band along each face.
import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum, orientOutward } from '../../core/geom.js';
import { Parts, ball, limb, T, post as oldPost } from '../../styles/qing/carving.js';

const M = 'marble_smooth';
const hash01 = (v) => { const t = Math.sin(v * 12.9898) * 43758.5453; return t - Math.floor(t); };

// ── the post ──
/** The post, built at its origin: a foot, shaft with a belt, a collar of lotus petals, the carved cap. */
function post(P, head, H = 0.98) {
  P.add(M, lathe([[0.15, 0], [0.15, 0.07], [0.12, 0.1], [0.115, 0.5], [0.14, 0.53], [0.14, 0.58], [0.115, 0.61], [0.115, H - 0.1], [0.15, H - 0.07], [0.15, H]], 8, (th, i) => (i === 4 || i === 5 ? 1 : 1)));
  const petals = (th, i) => (i <= 2 ? 1 + 0.2 * Math.cos(th * 6) : 1);
  if (head === 'phoenix') {
    // the collar, the folded wings (three lobes) over the body, the long crest and flame
    P.add(M, lathe([[0.12, H], [0.155, H + 0.035], [0.12, H + 0.09], [0.095, H + 0.14], [0.13, H + 0.22], [0.125, H + 0.3], [0.09, H + 0.38], [0.075, H + 0.46], [0.03, H + 0.58], [0.001, H + 0.72]], 12, (th, i) => (i <= 2 ? petals(th, i) : i >= 4 && i <= 6 ? 1 + 0.3 * Math.cos(th * 3) : i >= 7 ? 1 + 0.25 * Math.cos(th * 2) : 1)));
  } else {
    // the collar, then the dragon's coils (the spiral swung round the column) and the pearl-bearing head
    P.add(M, lathe([[0.12, H], [0.155, H + 0.035], [0.12, H + 0.09], [0.1, H + 0.14], [0.13, H + 0.22], [0.1, H + 0.3], [0.13, H + 0.38], [0.095, H + 0.46], [0.11, H + 0.53], [0.05, H + 0.6], [0.001, H + 0.68]], 12, (th, i) => (i <= 2 ? petals(th, i) : i >= 4 && i <= 8 ? 1 + 0.3 * Math.cos(th - i * 1.6) : 1)));
  }
}
// the old posts' signatures: their vertex counts and the bounding box at the origin, to find them among the bag's additions
const sig = (head) => { const P = new Parts(); oldPost(P, M, head, 0.98); const g = P.m.get(M).map((x) => (x.index ? x.toNonIndexed() : x)); let n = 0; const mn = [1e9, 1e9, 1e9]; for (const q of g) { n += q.attributes.position.count; const a = q.attributes.position.array; for (let i = 0; i < a.length; i += 3) for (let k = 0; k < 3; k++) if (a[i + k] < mn[k]) mn[k] = a[i + k]; } return { n, mn }; };
const OLD = { dragon: sig('dragon'), phoenix: sig('phoenix') };
/** A bag in which each old post is exchanged for the new one at the same place (found by its vertex count and corner). */
function swapPosts(bag) {
  const w = Object.create(bag);
  w.add = (mat, g) => {
    if (mat === M && g && g.attributes && !g.index) {
      const n = g.attributes.position.count;
      for (const head of ['dragon', 'phoenix']) {
        if (n !== OLD[head].n) continue;
        const a = g.attributes.position.array, mn = [1e9, 1e9, 1e9];
        for (let i = 0; i < a.length; i += 3) for (let k = 0; k < 3; k++) if (a[i + k] < mn[k]) mn[k] = a[i + k];
        const t = [mn[0] - OLD[head].mn[0], mn[1] - OLD[head].mn[1], mn[2] - OLD[head].mn[2]];
        // a post stands where its feet's lowest point is: y = the base; x, z its middle
        const P = new Parts(); post(P, head); P.emit(bag, t[0], t[1], t[2]);
        return;
      }
    }
    bag.add(mat, g);
  };
  return w;
}

// ── the dragon-head drain ──
/** A chishou facing +z at its origin: its stub in the wall (z < 0), the head jutting to z ≈ 0.75, mouth open. */
function spout(P) {
  P.add(M, frustum([-0.13, -0.5, 0.13, 0.05], -0.17, 0.12, 0, 0, 0, 0, { noZn: true }));
  // the neck, thick, rising to the skull; the skull, brow, snout, the upper lip, the lower jaw
  P.add(M, limb([0, -0.02, 0.0], [0, 0.0, 0.34], 0.125, 0.105, 7));
  P.add(M, T(ball(0.115, 0.09, 0.17, 8, 4), 0, 0.03, 0.4));                                    // the skull
  P.add(M, frustum([-0.085, 0.45, 0.085, 0.78], -0.04, 0.07, 0.005, 0.005, 0.02, 0.0, { noZn: true }));        // the snout
  P.add(M, T(ball(0.1, 0.035, 0.1, 8, 3), 0, 0.07, 0.62));                                      // the nose's bridge
  P.add(M, T(ball(0.1, 0.03, 0.11, 8, 3), 0, -0.065, 0.62));                                    // the lower jaw
  P.add('slate', T(ball(0.045, 0.02, 0.1, 6, 2), 0, -0.035, 0.6));                              // the throat: the drain, dark
  for (const sx of [-1, 1]) {
    P.add(M, T(ball(0.022, 0.022, 0.022, 4, 2), sx * 0.04, 0.09, 0.76));                         // the nostrils
    P.add(M, T(ball(0.04, 0.03, 0.07, 5, 2), sx * 0.085, 0.085, 0.47));                          // the brows
    P.add(M, T(ball(0.026, 0.026, 0.026, 5, 2), sx * 0.1, 0.06, 0.5));                           // the eyes
    P.add(M, limb([sx * 0.06, 0.1, 0.34], [sx * 0.1, 0.24, 0.12], 0.032, 0.012, 4));             // the horns, swept back
    P.add(M, limb([sx * 0.1, -0.02, 0.4], [sx * 0.22, 0.02, 0.22], 0.03, 0.012, 4));             // the whiskers / mane fins
    P.add(M, T(ball(0.07, 0.015, 0.11, 6, 2), sx * 0.17, 0.0, 0.3));                              // the ears
  }
  P.add(M, T(ball(0.045, 0.025, 0.09, 6, 2), 0, 0.12, 0.2));                                     // the mane's crest
}

function streak(out, x, z, f, y, len, k) {
  const ox = f[0] * 0.006, oz = f[1] * 0.006, tx = f[1] ? 1 : 0, tz = f[0] ? 1 : 0, w = 0.06 + 0.05 * k, drift = (k - 0.5) * 0.06;
  const P = (u, v) => [x + ox + tx * u, y - v * len, z + oz + tz * u];
  const ring = [P(-w, 0), P(w, 0), P(w * 1.9 + drift, 0.3), P(w * 0.8 + drift * 2, 0.75), P(drift * 3, 1), P(-w * 0.8 + drift * 2, 0.75), P(-w * 1.9 + drift, 0.3)], c = P(0, 0.2);
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length], ax = a[0] - c[0], ay = a[1] - c[1], az = a[2] - c[2], bx = b[0] - c[0], by = b[1] - c[1], bz = b[2] - c[2];
    const nx = ay * bz - az * by, nz = ax * by - ay * bx;
    if (nx * f[0] + nz * f[1] >= 0) out.push(...c, ...a, ...b); else out.push(...c, ...b, ...a);
  }
}

// ── the sumeru base's lotus band ──
/** One lotus petal of the band (the upturned lotus of the base), facing +z, 0.27 wide, 0.42 high, standing 0.09 off the face. */
function petal(P, h = 0.42, w = 0.27) {
  const pts = [[-w / 2, 0], [w / 2, 0], [w / 2, h * 0.5], [w * 0.32, h * 0.8], [0, h], [-w * 0.32, h * 0.8], [-w / 2, h * 0.5]], t = [];
  const d = 0.09;
  for (let i = 1; i < pts.length - 1; i++) t.push(pts[0][0], pts[0][1], d, pts[i][0], pts[i][1], d, pts[i + 1][0], pts[i + 1][1], d);
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; t.push(a[0], a[1], 0, b[0], b[1], 0, b[0], b[1], d, a[0], a[1], 0, b[0], b[1], d, a[0], a[1], d); }
  // the inner petal, a smaller one raised on it: the carved centre
  const k = 0.55, e = 0.14;
  for (let i = 1; i < 4; i++) t.push(pts[0][0] * k, h * 0.1 + pts[0][1] * k, e, pts[i][0] * k, h * 0.1 + pts[i][1] * k, e, pts[i + 1][0] * k, h * 0.1 + pts[i + 1][1] * k, e);
  orientOutward(t);
  P.add(M, fromTriangles(t));
}

/** Wrap the style's terrace: swapped posts, new drains and the base's lotus band; `el` as the style's terrace. */
function bjTerrace(el, ctx) {
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y0 = el.y0, y1 = el.y1, o = el.open || {}, i = 0.25;
  STYLES.qing.elements.terrace({ ...el, carve: 'qing', spouts: false }, { ...ctx, bag: swapPosts(bag) });
  const sides = [['n', [x0 + i, z0 + i], [x1 - i, z0 + i], [0, -1]], ['s', [x0 + i, z1 - i], [x1 - i, z1 - i], [0, 1]], ['w', [x0 + i, z0 + i], [x0 + i, z1 - i], [-1, 0]], ['e', [x1 - i, z0 + i], [x1 - i, z1 - i], [1, 0]]];
  const streaks = [], step = 1.6;
  for (const [k, a, b, f] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = Math.atan2(f[0], f[1]), open = o[k] || [];
    const isOpen = (s) => open.some(([p, q]) => s > p && s < q);
    const n = Math.max(1, Math.round(L / step)), e = L - n * step;
    const sp = Array.from({ length: n + 1 }, (_, q) => (q === 0 ? 0 : q === n ? L : n === 1 ? L : q * step + e / 2));
    for (const s of sp) {
      if (isOpen(s) || s < 0.5 || s > L - 0.5) continue;
      const u = s / L, px = a[0] + (b[0] - a[0]) * u, pz = a[1] + (b[1] - a[1]) * u;
      const P = new Parts(); spout(P);
      const sx = f[0] ? (f[0] < 0 ? x0 : x1) : px, sz = f[1] ? (f[1] < 0 ? z0 : z1) : pz;
      P.emit(bag, sx, y1 - 0.42, sz, yaw);
      streak(streaks, sx, sz, f, y1 - 0.62, Math.min(y1 - y0 - 0.95, 0.9 + 1.0 * hash01(sx * 7.3 + sz * 3.1 + y1)), hash01(sx * 1.7 + sz * 5.9));
    }
  }
  if (streaks.length) bag.add('granite_elba', fromTriangles(streaks));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const P = new Parts(); spout(P);
    P.emit(bag, sx < 0 ? x0 + 0.05 : x1 - 0.05, y1 - 0.62, sz < 0 ? z0 + 0.05 : z1 - 0.05, Math.atan2(sx, sz), 1.7);
  }
  // the lotus band on the base: a fillet, the row of petals, a fillet over them, on each face, not across the stairs' openings
  const bb = y0 + 0.35, face = 0.18;                                      // the plinth's top (the plinth stands 0.18 off the face)
  const runs = (a0, a1, gaps) => {
    let r = [[a0, a1]];
    for (const [g0, g1] of gaps) r = r.flatMap(([p, q]) => (g1 <= p || g0 >= q ? [[p, q]] : [[p, g0], [g1, q]].filter(([u, v]) => v - u > 0.4)));
    return r;
  };
  const strip = (P, u0, u1, ya, yb, out, fa, along) => {            // a fillet: a thin slab on the face
    const t = along === 'x' ? box(u0, ya, fa - out, u1, yb, fa + out) : box(fa - out, ya, u0, fa + out, yb, u1);
    P.add(M, t);
  };
  void strip;
  for (const [fk, vert] of [['s', z1], ['n', z0], ['w', x0], ['e', x1]]) {
    const alongX = fk === 's' || fk === 'n', lo = alongX ? x0 : z0, hi = alongX ? x1 : z1, dir = fk === 's' || fk === 'e' ? 1 : -1;
    const gaps = (fk === 's' || fk === 'n') ? [[-11.6, 11.6]] : [];
    for (const [r0, r1] of runs(lo + 0.5, hi - 0.5, gaps)) {
      // the fillets
      const fil = new Parts(), fy = [[bb, bb + 0.07, 0.1], [bb + 0.5, bb + 0.57, 0.1]];
      for (const [ya, yb, out] of fy) {
        const rect = alongX ? [r0, vert + (dir > 0 ? 0 : -out), r1, vert + (dir > 0 ? out : 0)] : [vert + (dir > 0 ? 0 : -out), r0, vert + (dir > 0 ? out : 0), r1];
        fil.add(M, box(rect[0], ya, rect[1], rect[2], yb, rect[3]));
      }
      fil.emit(bag, 0, 0, 0);
      // the petals along it, 0.3 apart, each standing from the face of the plinth's top
      const n = Math.max(1, Math.floor((r1 - r0) / 0.3)), pw = (r1 - r0) / n;
      for (let q = 0; q < n; q++) {
        const c = r0 + pw * (q + 0.5), P = new Parts(); petal(P, 0.42, pw - 0.03);
        const yaw = fk === 's' ? 0 : fk === 'n' ? Math.PI : fk === 'e' ? Math.PI / 2 : -Math.PI / 2;
        if (alongX) P.emit(bag, c, bb + 0.07, vert, yaw); else P.emit(bag, vert, bb + 0.07, c, yaw);
      }
    }
  }
}

function bjStairs(el, ctx) { STYLES.qing.elements.stairs(el, { ...ctx, bag: swapPosts(ctx.bag) }); }

STYLES.qing.elements.bj_terrace = bjTerrace;
STYLES.qing.elements.bj_stairs = bjStairs;
