// The Hall of Supreme Harmony's three-tier marble terrace, close to (docs/settlements/qing-beijing.md §36): bj_terrace and
// bj_stairs wrap the style's terrace and stairs, swapping the balustrade posts for posts with a foot, belt, a ring of
// lotus petals under the carved head (dragon or phoenix), hanging the dragon-head drains (chishou) with open mouths,
// horns, brows, snouts and manes, and carving the sumeru base's lotus-petal band along each face.
import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum, orientOutward } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import { Parts, ball, limb, T, merge, post as oldPost } from '../../styles/qing/carving.js';
import { dragon, cloud } from '../../styles/qing/throne.js';

const M = 'marble_smooth';
const hash01 = (v) => { const t = Math.sin(v * 12.9898) * 43758.5453; return t - Math.floor(t); };

// ── the post ──
/** The post, built at its origin: a foot, shaft with a belt, a collar of lotus petals, the carved cap. */
function post(P, head, H = 0.98) {
  P.add(M, lathe([[0.15, 0], [0.115, 0.08], [0.115, H - 0.09], [0.15, H - 0.05], [0.15, H]], 8));
  if (head === 'phoenix') {
    // the collar, the folded wings (three lobes) over the body, the crest and flame
    P.add(M, lathe([[0.12, H], [0.16, H + 0.04], [0.1, H + 0.12], [0.14, H + 0.24], [0.09, H + 0.38], [0.05, H + 0.52], [0.001, H + 0.7]], 8, (th, i) => (i === 3 ? 1 + 0.3 * Math.cos(th * 3) : i === 4 ? 1 + 0.25 * Math.cos(th * 2) : 1)));
  } else {
    // the collar, then the dragon's coils (a spiral swung round the column) and the head with the pearl
    P.add(M, lathe([[0.12, H], [0.16, H + 0.04], [0.1, H + 0.12], [0.135, H + 0.24], [0.1, H + 0.36], [0.12, H + 0.5], [0.05, H + 0.6], [0.001, H + 0.68]], 8, (th, i) => (i >= 3 && i <= 5 ? 1 + 0.3 * Math.cos(th - i * 1.6) : 1)));
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
  P.add(M, limb([0, -0.02, 0.0], [0, 0.0, 0.34], 0.125, 0.105, 5));                              // the neck
  P.add(M, T(ball(0.115, 0.09, 0.17, 5, 2), 0, 0.03, 0.4));                                      // the skull
  P.add(M, frustum([-0.085, 0.45, 0.085, 0.78], -0.04, 0.07, 0.005, 0.005, 0.02, 0.0, { noZn: true }));        // the snout, its mouth open under it
  for (const sx of [-1, 1]) P.add(M, limb([sx * 0.06, 0.1, 0.34], [sx * 0.1, 0.24, 0.12], 0.032, 0.012, 3));             // the horns, swept back
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
let JIT = 0;
function petal(P, h = 0.42, w = 0.27) {
  h += (JIT++ % 2003) * 0.0002;      // a hair taller each: petals merged with the terrace's meshes, not a draw per face
  const pts = [[-w / 2, 0], [w / 2, 0], [w / 2, h * 0.55], [0, h], [-w / 2, h * 0.55]], t = [];
  const d = 0.09;
  for (let i = 1; i < pts.length - 1; i++) t.push(pts[0][0], pts[0][1], d, pts[i][0], pts[i][1], d, pts[i + 1][0], pts[i + 1][1], d);
  for (const i of [2, 3]) { const a = pts[i], b = pts[(i + 1) % pts.length]; t.push(a[0], a[1], 0, b[0], b[1], 0, b[0], b[1], d, a[0], a[1], 0, b[0], b[1], d, a[0], a[1], d); }   // the two slanted edges
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
    const gaps = (o[fk] || []).map(([f, t]) => [lo + i + f - 0.6, lo + i + t + 0.6]);
    for (const [r0, r1] of runs(lo + 0.5, hi - 0.5, gaps)) {
      // the fillets
      const fil = new Parts(), fy = [[bb, bb + 0.07, 0.1], [bb + 0.5, bb + 0.57, 0.1]];
      for (const [ya, yb, out] of fy) {
        const rect = alongX ? [r0, vert + (dir > 0 ? 0 : -out), r1, vert + (dir > 0 ? out : 0)] : [vert + (dir > 0 ? 0 : -out), r0, vert + (dir > 0 ? out : 0), r1];
        fil.add(M, box(rect[0], ya, rect[1], rect[2], yb, rect[3]));
      }
      fil.emit(bag, 0, 0, 0);
      // the petals along it, 0.3 apart, each standing from the face of the plinth's top
      const n = Math.max(1, Math.floor((r1 - r0) / 0.5)), pw = 0.5, c0 = (r0 + r1) / 2 - n * pw / 2;
      for (let q = 0; q < n; q++) {
        const c = c0 + pw * (q + 0.5), P = new Parts(); petal(P, 0.42, 0.45);
        const yaw = fk === 's' ? 0 : fk === 'n' ? Math.PI : fk === 'e' ? Math.PI / 2 : -Math.PI / 2;
        if (alongX) P.emit(bag, c, bb + 0.07, vert, yaw); else P.emit(bag, vert, bb + 0.07, c, yaw);
      }
    }
  }
}

// ── the carved ramp (yu lu) ──
const reliefCache = new Map();
/** The relief on a ramp W wide and S long, in its own frame (x across, y up the slope, z out of the stone): a double border with a band of
 *  cloud heads, the sea's breaking waves and three stepped mountains at the foot, two dragons (legs, claws, scales' fins, mane) rising among
 *  clouds to the flaming pearl between their heads. */
function reliefParts(W, S) {
  const key = `${W.toFixed(2)}x${S.toFixed(2)}`;
  if (reliefCache.has(key)) return reliefCache.get(key);
  const P = new Parts(), m = 'marble';
  const e = 0.1, fw = 0.16;
  for (const sx of [-1, 1]) { P.add(m, box(sx * (W / 2 - e) - fw / 2, e, 0, sx * (W / 2 - e) + fw / 2, S - e, 0.06)); P.add(m, box(sx * (W / 2 - e - 0.3) - 0.04, e + 0.3, 0, sx * (W / 2 - e - 0.3) + 0.04, S - e - 0.3, 0.045)); }
  for (const y of [e, S - e - fw]) { P.add(m, box(-W / 2 + e, y, 0, W / 2 - e, y + fw, 0.06)); }
  for (const y of [e + 0.3, S - e - 0.3 - 0.08]) P.add(m, box(-W / 2 + e + 0.3, y, 0, W / 2 - e - 0.3, y + 0.08, 0.045));
  // the cloud heads (ruyi) in a row along the inner border's feet and head, and down its sides
  for (let i = 0; i < Math.floor((W - 1.4) / 0.5); i++) { const x = -W / 2 + 0.7 + (i + 0.5) * ((W - 1.4) / Math.floor((W - 1.4) / 0.5)); cloud(P, m, x, e + 0.5, 0.2, 0.03); cloud(P, m, x, S - e - 0.58, 0.2, 0.03); }
  const nw = Math.max(5, Math.round(W / 0.55));
  for (let row = 0; row < 2; row++) for (let i = 0; i < nw + row; i++) {
    const x = -W / 2 + (i + (row ? 0 : 0.5)) * (W / nw) - (row ? W / nw / 2 : 0);
    if (Math.abs(x) > W / 2 - 0.9) continue;
    P.add(m, T(ball(W / nw * 0.55, 0.17, 0.05, 8, 4), x, 0.78 + row * 0.24, 0.03));
    P.add(m, T(ball(W / nw * 0.3, 0.08, 0.065, 6, 3), x + 0.06, 0.86 + row * 0.24, 0.06));
  }
  for (const [x, hgt, wd] of [[-W * 0.2, 0.8, 0.55], [0, 1.1, 0.7], [W * 0.2, 0.8, 0.55]]) {
    P.add(m, T(lathe([[wd, 0], [wd * 0.6, hgt * 0.5], [0.001, hgt]], 6).scale(1, 1, 0.14), x, 1.1, 0.03));
    P.add(m, T(lathe([[wd * 0.6, 0], [wd * 0.3, hgt * 0.4], [0.001, hgt * 0.7]], 6).scale(1, 1, 0.1), x + wd * 0.3, 1.1 + hgt * 0.25, 0.07));
  }
  // the dragons
  const n = W > 5 ? 2 : 1, y0 = 2.35, hh = Math.max(1.6, S - y0 - 0.65), cw = (W - 1.1) / n;
  for (let k = 0; k < n; k++) {
    const D = new Parts(), cx = -W / 2 + 0.55 + cw * (k + 0.5), dr = n === 2 ? (k ? -1 : 1) : 1, ph = k ? Math.PI : 0, N = 28, pts = [], w = cw;
    for (let q = 0; q <= N; q++) { const t = q / N; pts.push([Math.sin(t * Math.PI * 2.2 + ph) * w * 0.3 * (1 - t * 0.3), hh * (0.88 - t * 0.8), 0]); }
    pts[0] = [pts[1][0] + w * 0.12 * dr, hh * 0.86, 0];
    dragon(D, m, pts, Math.min(0.3, cw * 0.075), { up: [0, 0, 1], flat: 0.8, pearl: true, pearlMat: 'gilt_bronze', head: 0.95, lite: W < 6.5 });
    for (const [mm, list] of D.m) P.add(mm, T(merge(list), cx, y0, 0.05));
  }
  for (let k = 0; k < 5; k++) for (const sx of [-1, 1]) {
    const y = 2.0 + k * (S - 3.2) / 4, x = sx * (W / 2 - 0.95) * (k % 2 ? 0.8 : 1);
    if (n === 1 && sx > 0 && k % 2) continue;
    cloud(P, m, x, y, 0.5, 0.035);
  }
  if (n === 2) for (let k = 0; k < 4; k++) cloud(P, m, 0, 2.8 + k * (S - 3.9) / 3, 0.45, 0.035);
  reliefCache.set(key, P);
  return P;
}
function rampRelief(bag, el) {
  const [x0, z0, x1, z1] = el.rect, dir = el.dir, alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0, rise = el.y1 - el.y0, S = Math.hypot(len, rise), W = alongZ ? x1 - x0 : z1 - z0;
  if (W < 2 || S < 2.5) return;
  const P = reliefParts(W, S), qc = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2;
  const [fx, fz] = dir === 'n' ? [qc, z1] : dir === 's' ? [qc, z0] : dir === 'e' ? [x0, qc] : [x1, qc];
  const h = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dir], c = len / S, sn = rise / S;
  const Y = new Vector3(h[0] * c, sn, h[1] * c), Z = new Vector3(-h[0] * sn, c, -h[1] * sn), X = new Vector3().crossVectors(Y, Z);
  const M4 = new Matrix4().makeBasis(X, Y, Z).setPosition(fx, el.y0, fz);
  for (const [mat, list] of P.m) bag.add(mat, merge(list).applyMatrix4(M4));
}

function bjStairs(el, ctx) {
  STYLES.qing.elements.stairs(el.slab ? { ...el, carve: false } : el, { ...ctx, bag: swapPosts(ctx.bag) });
  if (el.slab && el.carve !== false) rampRelief(ctx.bag, el);
}

STYLES.qing.elements.bj_terrace = bjTerrace;
STYLES.qing.elements.bj_stairs = bjStairs;
