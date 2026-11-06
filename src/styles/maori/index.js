// Māori building of the 18th century (docs/settlements/maori.md §4): palisades of split timber with
// taller posts crowned by carved figures (pou whakarae); fighting stages on posts; houses (whare)
// with low walls, a steep gabled roof of raupō thatch running down low, the side walls carried
// forward to make a porch; the chief's house carved at its front — bargeboards (maihi) ending in
// raparapa "fingers", carved uprights (amo) under them, a face (koruru) at the apex and a figure
// (tekoteko) above it, a carved lintel (pare) over the door, the threshold beam (paepae), carved
// slabs (poupou) lining the porch and the inside, reed panels (tukutuku) between them, a carved
// central post (poutokomanawa) — all in red ochre (kōkōwai); storehouses (pātaka) raised on posts,
// carved round the entrance, reached by a notched pole; kūmara pits under low pitched roofs;
// gateways (waharoa) of carved posts; war canoes (waka taua) with carved prow and sternpost;
// kūmara gardens of mounds in quincunx inside brushwood fences.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { sculpt, rows, smooth, bump, blob } from '../rapanui/sculpt.js';
import '../qing/index.js';

const K = 'kokowai', P = 'palisade', TH = 'raupo', PAUA = 'shell_inlay';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const post = (bag, x, y, z, r, h, mat = P) => bag.add(mat, lathe([[r, 0], [r * 0.9, h], [0.001, h + r]], 7, null, x, y, z));
/** A convex solid from its corner points, as triangles faced outward. */
function hull(pts) {
  const n = pts.length / 2, t = [];
  // pts: the first n the near face, the next n the far face, each a convex polygon in order
  for (let i = 1; i < n - 1; i++) t.push(...pts[0], ...pts[i], ...pts[i + 1], ...pts[n], ...pts[n + i + 1], ...pts[n + i]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...pts[i], ...pts[n + i], ...pts[n + j], ...pts[i], ...pts[n + j], ...pts[j]); }
  return fromTriangles(orientOutward(t));
}
/** A prism of a convex polygon [[x, y], …] in the x–y plane, from z0 to z1. */
const prism = (poly, z0, z1) => hull([...poly.map(([x, y]) => [x, y, z0]), ...poly.map(([x, y]) => [x, y, z1])]);
/** A board in the x–y plane from point a to point b (its centre line), `wd` wide, from z0 to z1. */
function board(a, b, wd, z0, z1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L * wd / 2, ny = dx / L * wd / 2;
  return prism([[a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny], [b[0] + nx, b[1] + ny], [a[0] + nx, a[1] + ny]], z0, z1);
}

// ---- carved figures ------------------------------------------------------------------------
// A figure cut from a post or a slab, at unit height, front −z, feet at y = 0 (sculpt.js): the
// head large (two-fifths of the figure), the eyes great slanting rings round inlaid pāua, a heavy
// brow, a broad flat nose, the mouth open in a figure of eight with the tongue thrust out over the
// chin; three-fingered hands on the belly, the arms in relief down the sides; the legs bent, apart;
// haehae — parallel grooves — over head and shoulders. 'post': round in section (palisade posts,
// tekoteko, the poutokomanawa); 'slab': flat (amo, poupou, the gateway's posts); 'face': the head
// alone on a slab (koruru, the pare's face).
const EYE = { x: 0.07, y: 0.83, r: 0.046 };
function figSection(kind) {
  const k = kind === 'post' ? 1 : 0.42;
  return (y) => {
    const head = smooth(0.52, 0.62, y), top = smooth(0.93, 1, y);
    return { w: (0.15 + 0.025 * head) * (1 - 0.35 * top ** 1.5), d: (0.12 + 0.01 * head) * k * (1 - 0.3 * top ** 1.5), zc: 0, n: kind === 'post' ? 2.3 : 3.2 };
  };
}
function figRelief(kind) {
  const s = kind === 'post' ? 1 : 0.7;
  return (x, y, z, front, side, back) => {
    const ax = Math.abs(x);
    let f = 0;
    if (y > 0.56) {
      // the eyes: a raised ring, slanting up outward, its bowl cut for the pāua
      const ex = (ax - EYE.x) / EYE.r, ey = (y - EYE.y - 0.25 * (ax - EYE.x)) / (EYE.r * 0.85), e = Math.hypot(ex, ey);
      f += 0.02 * bump((e - 1) / 0.32, 0.6) - 0.01 * (1 - smooth(0.6, 0.8, e));
      f += 0.012 * bump((y - (0.895 + 0.25 * (ax - 0.07))) / 0.016, 0.5) * bump(ax / 0.15, 0.3);  // the brow
      f += 0.02 * bump(ax / 0.036, 0.4) * bump((y - 0.765) / 0.04, 0.4);                      // the broad nose
      f -= 0.008 * blob((ax - 0.028) / 0.012, (y - 0.735) / 0.01, 0.4);                        // nostrils
      // the mouth open in a figure of eight, the tongue thrust out and down over the chin
      const m = Math.hypot(x / (0.085 * (1 - 0.25 * Math.cos(x / 0.085 * Math.PI) ** 2)), (y - 0.675) / 0.034);
      f += 0.015 * bump((m - 1) / 0.3, 0.6) - 0.028 * (1 - smooth(0.7, 0.95, m));
      f += 0.04 * bump(ax / 0.028, 0.5) * bump((y - 0.64) / 0.045, 0.4);
      // haehae: parallel grooves over the forehead and the sides of the head
      f -= 0.003 * (0.5 + 0.5 * Math.cos((y - 0.9) / 0.016 * Math.PI)) * smooth(0.92, 0.94, y);
      f -= 0.003 * (0.5 + 0.5 * Math.cos(ax / 0.016 * Math.PI)) * smooth(0.12, 0.15, ax) * (1 - smooth(0.92, 0.95, y));
    } else if (y > 0.3) {
      f += 0.016 * bump(ax / 0.12, 0.5) * bump((y - 0.4) / 0.1, 0.5);                         // the belly
      // the forearms in to the hands, three fingers spread on the belly
      const yc = 0.42 - 0.03 * clamp((0.15 - ax) / 0.1);
      f += 0.018 * bump((y - yc) / 0.022, 0.5) * bump((ax - 0.09) / 0.07, 0.3);
      for (const k of [-1, 0, 1]) f -= 0.006 * bump((y - yc - k * 0.014) / 0.003, 0.6) * bump((ax - 0.05) / 0.03, 0.3);
      f += 0.012 * bump((Math.hypot(ax - 0.1, y - 0.525) - 0.028) / 0.008, 0.5);               // the koru spirals on the shoulders
      f -= 0.003 * (0.5 + 0.5 * Math.cos((y - 0.5) / 0.014 * Math.PI)) * smooth(0.47, 0.5, y);
    } else {
      f -= 0.035 * bump(ax / 0.02, 0.5) * smooth(0.02, 0.05, y) * (1 - smooth(0.26, 0.3, y));   // between the legs
      f += 0.022 * bump((ax - 0.08) / 0.05, 0.5) * bump((y - 0.15) / 0.06, 0.5);              // the knees
      f += 0.018 * bump((ax - 0.07) / 0.06, 0.5) * bump((y - 0.035) / 0.03, 0.5);             // the feet
    }
    let r = front * f * s;
    // the arms down the sides, the elbows out
    r += side * 0.018 * s * bump((y - 0.48) / 0.08, 0.5) * bump(z / 0.06, 0.5);
    r += side * 0.012 * s * bump((y - 0.18) / 0.1, 0.5);                                      // the thighs
    r += back * 0.0;
    return r;
  };
}
const FIG = {};
function figureGeometry(kind) {
  if (FIG[kind]) return FIG[kind];
  let g;
  if (kind === 'face') {
    const ys = rows(0.57, 1, 34);
    g = sculpt({ ys, cols: 30, section: figSection('slab'), relief: figRelief('slab'), warp: 0.6 });
    g.translate(0, -0.57, 0); g.scale(1 / 0.43, 1 / 0.43, 1 / 0.43);
  } else {
    const ys = rows(0, 1, kind === 'post' ? 60 : 52, (y) => (y > 0.56 ? 2.2 : 1));
    g = sculpt({ ys, cols: kind === 'post' ? 34 : 30, section: figSection(kind), relief: figRelief(kind), warp: 0.55 });
  }
  return (FIG[kind] = g);
}
/** The front of a figure's eye (where its pāua sits), in the figure's unit frame. */
function eyeAt(kind) {
  const sec = figSection(kind === 'face' ? 'slab' : kind)(EYE.y), n = sec.n;
  const z = -sec.d * (1 - Math.abs(EYE.x / sec.w) ** n) ** (1 / n);
  const sc = kind === 'face' ? 1 / 0.43 : 1, s = kind === 'post' ? 1 : 0.7;
  return { x: EYE.x * sc, y: (kind === 'face' ? EYE.y - 0.57 : EYE.y) * sc, z: (z - 0.004 * s) * sc, r: EYE.r * 0.55 * sc };
}
const PAUA_EYE = lathe([[1, 0], [0.85, 0.35], [0.001, 0.45]], 10).rotateX(-Math.PI / 2);
/** Place a carved figure: { kind, at: [x, y, z], h (its height), yaw (radians; it faces −z turned by yaw) }. */
function figure(bag, kind, x, y, z, h, yaw = 0, reach = 400) {
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z).multiply(new Matrix4().makeScale(h, h, h));
  const put = (mat, g, mm) => { if (bag.addInstance) bag.addInstance(mat, g, mm.clone(), { reach }); else bag.add(mat, g.clone().applyMatrix4(mm)); };
  put(K, figureGeometry(kind), m);
  const e = eyeAt(kind);
  for (const s of [-1, 1]) {
    const mm = m.clone().multiply(new Matrix4().makeTranslation(s * e.x, e.y + 0.25 * 0 + (s ? 0 : 0), e.z)).multiply(new Matrix4().makeRotationZ(-s * 0.25)).multiply(new Matrix4().makeScale(e.r, e.r * 0.8, e.r));
    put(PAUA, PAUA_EYE, mm);
  }
}

/** palisade: { a, b, y, h } — close-set posts, every ninth a tall post crowned by a carved figure, two rails lashed across. */
function palisade(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 4, L = Math.hypot(bx - ax, bz - az);
  if (L < 0.5) return;
  const ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.round(L / (el.simple ? 1.2 : 0.45));
  // the figures look outward, away from the centre the palisade rings (el.center)
  const [ox, oz] = el.center ?? [ax - uz, az + ux], mx = (ax + bx) / 2 - ox, mz = (az + bz) / 2 - oz, out = Math.atan2(-mx, -mz);
  for (let i = 0; i <= n; i++) {
    const x = ax + ux * L * i / n, z = az + uz * L * i / n, big = i % 9 === 0;
    if (big && !el.simple) {
      post(bag, x, y - 0.5, z, 0.22, h + 0.8, K);
      figure(bag, 'post', x, y + h + 0.25, z, 1.3, out);
    } else post(bag, x, y - 0.5, z, big ? 0.22 : 0.12, (big ? h + 1.4 : h) + 0.5 + ((i * 37) % 5) * 0.06, big ? K : P);
  }
  for (const yy of [y + 1.0, y + h - 0.6]) bag.add(P, orientedBox(el.a, el.b, 0.12, yy, yy + 0.12));
  col.segment(el.a, el.b, 0.4, y - 0.5, y + h);
}

// ---- houses --------------------------------------------------------------------------------
/**
 * whare: a house { c, y, yaw, w, l, h (walls), rise, porch, carved, rank, walls (material) } facing
 * −z (its porch). Every house: low side walls running forward to make the porch, the front wall
 * with its door (kūwaha) and small window (matapihi), the gable walls, the roof of two slopes
 * running down low. A carved house (rank ≥ 1) adds the paepae, the amo, the maihi with their
 * raparapa, the koruru, the pare over the door and poupou in the porch; the chief's (rank 2) a
 * tekoteko, and inside the poutokomanawa, poupou and tukutuku round the walls, rafters (heke) and
 * ridge beam (tāhuhu), mats and the hearth.
 */
function whare(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, yaw = el.yaw ?? 0, w = el.w ?? 4, l = el.l ?? 6, h = el.h ?? 1.2, rise = el.rise ?? w * 0.55, pr = el.porch ?? 1.6, y0 = el.y ?? 0;
  const WM = el.walls ?? TH, rank = el.rank ?? 0, carved = el.carved !== false && rank > 0;
  const M = new Matrix4().makeRotationY(yaw).setPosition(cx, y0, cz);
  const add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  const W2 = (x, z) => [cx + x * ca + z * sa, cz - x * sa + z * ca];
  const fig = (kind, x, y, z, hh, ry = 0) => { const [wx, wz] = W2(x, z); figure(bag, kind, wx, y0 + y, wz, hh, yaw + ry); };
  const zf = -l / 2 + pr, ov = 0.4, e = h - 0.1, ridge = h + rise, t = 0.25;
  const under = (x) => e + (ridge - e) * (1 - Math.abs(x) / (w / 2 + ov)) - 0.07;   // just under the roof at x
  // the side walls, carried forward to the porch's mouth, their tops cut to the roof's slope
  for (const s of [-1, 1]) add(WM, prism([[s * (w / 2 - t), -0.2], [s * w / 2, -0.2], [s * w / 2, under(w / 2) + 0.04], [s * (w / 2 - t), under(w / 2 - t) + 0.04]], -l / 2 + 0.12, l / 2));
  // the back gable wall and the front wall's gable
  add(WM, prism([[-w / 2, -0.2], [w / 2, -0.2], [w / 2, under(w / 2) + 0.04], [0, under(0) + 0.04], [-w / 2, under(w / 2) + 0.04]], l / 2 - t, l / 2));
  const FM = carved ? 'timber' : WM;
  add(FM, prism([[-w / 2 + t, h], [w / 2 - t, h], [w / 2 - t, under(w / 2 - t) + 0.04], [0, under(0) + 0.04], [-w / 2 + t, under(w / 2 - t) + 0.04]], zf, zf + 0.15));
  // the front wall: the door left of centre, the window right (a storehouse: a small door in the middle)
  const small = w < 3, dl = small ? -0.28 : -w * 0.18 - 0.32, dr = small ? 0.28 : dl + 0.64, dh = small ? Math.min(0.75, h - 0.1) : Math.min(1.15, h - (carved ? 0.45 : 0.08));
  const wl = small ? w : w * 0.16, wr = wl + 0.5, wb = 0.6, wt = Math.min(1.05, h - 0.05);
  const piece = (x0, x1, a, b) => { if (x1 - x0 > 0.01 && b - a > 0.01) add(FM, box(x0, a, zf, x1, b, zf + 0.15)); };
  if (small) { piece(-w / 2 + t, dl, -0.2, h); piece(dr, w / 2 - t, -0.2, h); piece(dl, dr, dh, h); }
  else { piece(-w / 2 + t, dl, -0.2, h); piece(dr, wl, -0.2, h); piece(wr, w / 2 - t, -0.2, h); piece(dl, dr, dh, h); piece(wl, wr, -0.2, wb); piece(wl, wr, wt, h); }
  // the roof: two slopes running the house's length, porch included, eaves low
  const tr = [];
  for (const s of [-1, 1]) {
    const a = [s * (w / 2 + ov), e, -l / 2 - 0.1], b = [s * (w / 2 + ov), e, l / 2 + 0.2], c = [0, ridge, l / 2 + 0.2], d = [0, ridge, -l / 2 - 0.1];
    tr.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  add(TH, fromTriangles(tr));
  // the ridge beam (tāhuhu) under the ridge, the rafters (heke) of the porch
  add(carved ? K : 'timber', box(-0.1, ridge - 0.32, -l / 2 - 0.05, 0.1, under(0.1) - 0.005, l / 2 - t));
  for (const s of [-1, 1]) for (let zz = -l / 2 + 0.2; zz < zf - 0.1; zz += 0.45) add(carved ? K : 'timber', board([s * (w / 2 - 0.05), under(w / 2 - 0.05) - 0.06], [s * 0.12, under(0.12) - 0.06], 0.1, zz - 0.04, zz + 0.04));
  // door and window frames
  add('timber', box(dl - 0.1, -0.2, zf - 0.04, dl, dh, zf)); add('timber', box(dr, -0.2, zf - 0.04, dr + 0.1, dh, zf));
  if (!small) { add('timber', box(wl - 0.08, wb - 0.08, zf - 0.04, wr + 0.08, wb, zf)); add('timber', box(wl - 0.08, wt, zf - 0.04, wr + 0.08, wt + 0.08, zf)); }
  if (carved) {
    // paepae across the porch's mouth, amo at its corners, poupou down its walls
    add(K, box(-w / 2 + t, -0.15, -l / 2 + 0.05, w / 2 - t, 0.28, -l / 2 + 0.3));
    for (const s of [-1, 1]) {
      add(K, box(s * w / 2 - 0.18, -0.2, -l / 2 - 0.02, s * w / 2 + 0.18, 0.02, -l / 2 + 0.16));
      fig('slab', s * (w / 2 - 0.02), 0.02, -l / 2 + 0.07, e - 0.02);
      for (let k = 0; k < Math.floor((pr - 0.4) / 0.55); k++) fig('slab', s * (w / 2 - t - 0.03), 0, -l / 2 + 0.55 + k * 0.55, h - 0.05, s * Math.PI / 2);
    }
    // the maihi from the apex down past the amo, their raparapa fingers; the koruru; the tekoteko
    const zm0 = -l / 2 - 0.24, zm1 = -l / 2 - 0.12, mw = 0.32 + 0.03 * w;
    for (const s of [-1, 1]) {
      const A = [0, ridge + 0.12], Bp = [s * (w / 2 + ov + 0.1), e - 0.12], dx = Bp[0] - A[0], dy = Bp[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      add(K, board(A, Bp, mw, zm0, zm1));
      add(K, board([A[0] + ux * 0.1, A[1] + uy * 0.1 + mw * 0.32], [Bp[0] - ux * 0.05, Bp[1] - uy * 0.05 + mw * 0.32], mw * 0.16, zm0 - 0.03, zm0));   // the raised rib
      for (let k = 0; k < 3; k++) {                                     // the raparapa
        const off = (k - 1) * mw * 0.33, px = -uy * off, py = ux * off, len = 0.32 + 0.08 * (1 - Math.abs(k - 1));
        add(K, board([Bp[0] + px, Bp[1] + py], [Bp[0] + px + ux * len, Bp[1] + py + uy * len], mw * 0.22, zm0 + 0.01, zm1 - 0.01));
      }
    }
    fig('face', 0, ridge - 0.62, zm0 - 0.02, 0.62);
    if (rank > 1) fig('post', 0, ridge + 0.1, (zm0 + zm1) / 2, 1.1);
    // the pare over the door, with its face; the jambs
    const ph = Math.min(0.42, h - dh - 0.02);
    add(K, box(dl - 0.2, dh, zf - 0.1, dr + 0.2, dh + ph, zf));
    fig('face', (dl + dr) / 2, dh + 0.02, zf - 0.13, ph - 0.04);
  }
  if (rank > 1) {
    // inside: poutokomanawa, poupou and tukutuku round the walls, heke over each poupou, mats, the hearth
    const zi0 = zf + 0.4, zi1 = l / 2 - t - 0.3, n = Math.max(2, Math.round((zi1 - zi0) / 0.9));
    add(K, lathe([[0.16, 0], [0.14, under(0.16) - 0.3]], 10, null, 0, -0.1, (zf + l / 2) / 2 + 0.3));
    fig('post', 0, 0, (zf + l / 2) / 2 + 0.3 - 0.13, 1.25);
    for (const s of [-1, 1]) {
      add('tukutuku', box(s > 0 ? w / 2 - t - 0.03 : -w / 2 + t, 0.05, zi0 - 0.3, s > 0 ? w / 2 - t : -w / 2 + t + 0.03, h - 0.08, zi1 + 0.3));
      for (let k = 0; k <= n; k++) {
        const zz = zi0 + (zi1 - zi0) * k / n;
        fig('slab', s * (w / 2 - t - 0.08), 0, zz, h - 0.02, s * Math.PI / 2);
        add('kowhaiwhai', board([s * (w / 2 - t - 0.1), h - 0.02], [s * 0.15, under(0.15) - 0.07], 0.12, zz - 0.05, zz + 0.05));   // heke painted with kōwhaiwhai
      }
    }
    add('reed_mat', box(-w / 2 + t + 0.15, -0.2, zf + 1.2, w / 2 - t - 0.15, 0.03, l / 2 - t - 0.15));
    for (let k = 0; k < 4; k++) add('pebbles', box(-0.45 + (k % 2) * 0.75, -0.2, zf + 0.35 + Math.floor(k / 2) * 0.55, -0.3 + (k % 2) * 0.75, 0.1, zf + 0.5 + Math.floor(k / 2) * 0.55));
    add('opening', box(-0.3, -0.2, zf + 0.5, 0.3, 0.04, zf + 0.9));
  }
  col.segment(W2(-w / 2, -l / 2 + 0.1), W2(-w / 2, l / 2), 0.3, y0, y0 + h + rise * 0.5);
  col.segment(W2(w / 2, -l / 2 + 0.1), W2(w / 2, l / 2), 0.3, y0, y0 + h + rise * 0.5);
  col.segment(W2(-w / 2, l / 2), W2(w / 2, l / 2), 0.3, y0, y0 + h + rise);
  col.segment(W2(-w / 2, zf + 0.08), W2(dl, zf + 0.08), 0.2, y0, y0 + h + rise);
  col.segment(W2(dr, zf + 0.08), W2(w / 2, zf + 0.08), 0.2, y0, y0 + h + rise);
}

/** pataka: a storehouse raised on posts { c, y, yaw, w, l, lift } — walls of adzed boards, carved round the entrance, a deck before the door, a notched pole to climb. */
function pataka(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, yaw = el.yaw ?? 0, w = el.w ?? 1.8, l = el.l ?? 2.6, lift = el.lift ?? 1.8, y0 = el.y ?? 0;
  const ca = Math.cos(yaw), sa = Math.sin(yaw), P2 = (x, z) => [cx + x * ca + z * sa, cz - x * sa + z * ca];
  for (const [x, z] of [[-w / 2 + 0.2, -l / 2 + 0.3], [w / 2 - 0.2, -l / 2 + 0.3], [-w / 2 + 0.2, l / 2 - 0.2], [w / 2 - 0.2, l / 2 - 0.2]]) { const [px, pz] = P2(x, z); post(bag, px, y0 - 0.3, pz, 0.12, lift + 0.3, K); col.circle(px, pz, 0.14, y0, y0 + lift); }
  const M = new Matrix4().makeRotationY(yaw).setPosition(cx, y0, cz), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  // the deck: bearers on the posts, boards across, running out before the door
  for (const s of [-1, 1]) add('timber', box(s * (w / 2 - 0.2) - 0.08, lift - 0.25, -l / 2 - 0.1, s * (w / 2 - 0.2) + 0.08, lift - 0.1, l / 2 + 0.05));
  add('timber', box(-w / 2 - 0.1, lift - 0.1, -l / 2 - 0.15, w / 2 + 0.1, lift + 0.02, l / 2 + 0.1));
  whare({ c: [0, 0], yaw: 0, w, l, h: 0.9, rise: w * 0.5, porch: 0.45, y: lift + 0.02, rank: 1, walls: 'timber' }, { bag: { add: (mat, g) => add(mat, g), addInstance: bag.addInstance ? (mat, g, m, o) => bag.addInstance(mat, g, M.clone().multiply(m), o) : undefined }, col: { segment() {}, circle() {}, rect() {}, floor() {} } });
  // the notched pole (arawhata) leaning to the deck's front
  const z0 = -l / 2 - lift * 0.55, z1 = -l / 2 - 0.1;
  add('timber', rod([0.45, -0.1, z0], [0.45, lift, z1], 0.07, 7));
  for (let k = 1; k < 5; k++) { const t = k / 5; add('timber', box(0.36, -0.1 + (lift + 0.1) * t, z0 + (z1 - z0) * t - 0.07, 0.54, -0.1 + (lift + 0.1) * t + 0.04, z0 + (z1 - z0) * t + 0.03)); }
}

/** stage: a fighting stage (pūwhara) { c, h, s } — a platform on tall posts by the palisade. */
function stage(el, { bag, col }) {
  const [x, z] = el.c, h = el.h ?? 6, s = el.s ?? 2.4, y0 = el.y ?? 0;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { post(bag, x + dx * s / 2, y0 - 0.5, z + dz * s / 2, 0.15, h + 1.6); col.circle(x + dx * s / 2, z + dz * s / 2, 0.16, y0, y0 + h); }
  bag.add('timber', box(x - s / 2 - 0.3, y0 + h - 0.15, z - s / 2 - 0.3, x + s / 2 + 0.3, y0 + h, z + s / 2 + 0.3));
  for (const [a, b] of [[[x - s / 2, z - s / 2], [x + s / 2, z - s / 2]], [[x - s / 2, z + s / 2], [x + s / 2, z + s / 2]]]) bag.add(P, orientedBox(a, b, 0.1, y0 + h, y0 + h + 0.9));
  // the ladder up one side
  bag.add('timber', rod([x - s / 2 - 0.9, y0, z], [x - s / 2 - 0.05, y0 + h, z], 0.07, 6));
  for (let k = 1; k < 9; k++) { const t = k / 9; bag.add('timber', box(x - s / 2 - 0.9 + 0.85 * t - 0.03, y0 + h * t, z - 0.1, x - s / 2 - 0.9 + 0.85 * t + 0.05, y0 + h * t + 0.04, z + 0.1)); }
}

/** waharoa: a gateway { c, yaw, w, h } — two broad posts carved with figures one above another, a lintel with a face, a figure above it. */
function waharoa(el, { bag, col }) {
  const [x, z] = el.c, yaw = el.yaw ?? 0, w = el.w ?? 2.6, h = el.h ?? 4.6, y0 = el.y ?? 0, ca = Math.cos(yaw), sa = Math.sin(yaw);
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const fig = (kind, px, py, pz, hh, ry = 0) => figure(bag, kind, x + px * ca + pz * sa, y0 + py, z - px * sa + pz * ca, hh, yaw + ry);
  for (const s of [-1, 1]) {
    add(K, box(s * w / 2 - 0.3, -0.4, -0.12, s * w / 2 + 0.3, h, 0.25));
    fig('slab', s * w / 2, 0, -0.16, h / 2);
    fig('slab', s * w / 2, h / 2, -0.16, h / 2);
    fig('slab', s * w / 2, 0, 0.29, h / 2, Math.PI); fig('slab', s * w / 2, h / 2, 0.29, h / 2, Math.PI);
    const px = x + s * w / 2 * ca, pz = z - s * w / 2 * sa; col.circle(px, pz, 0.35, y0, y0 + h);
  }
  add(K, box(-w / 2 - 0.4, h, -0.2, w / 2 + 0.4, h + 0.55, 0.3));
  fig('face', 0, h + 0.02, -0.23, 0.52); fig('face', 0, h + 0.02, 0.33, 0.52, Math.PI);
  fig('post', 0, h + 0.55, 0.05, 1.3);
}

/** rua: a kūmara pit { c, yaw, w, l } — a low pitched roof over a pit, its ridge at knee height, a little door at one end. */
function rua(el, { bag }) {
  const [x, z] = el.c, w = el.w ?? 2.2, l = el.l ?? 3, y0 = el.y ?? 0, t = [];
  for (const s of [-1, 1]) {
    const a = [x + s * w / 2, y0 - 0.05, z - l / 2], b = [x + s * w / 2, y0 - 0.05, z + l / 2], c = [x, y0 + 0.8, z + l / 2], d = [x, y0 + 0.8, z - l / 2];
    t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  bag.add(TH, fromTriangles(t));
  // the gable ends: boards, a small door in the front one
  bag.add('timber', prism([[-w / 2 + 0.05, -0.05], [w / 2 - 0.05, -0.05], [0, 0.78]].map(([a, b]) => [x + a, y0 + b]), z + l / 2 - 0.08, z + l / 2 - 0.02));
  bag.add('timber', prism([[-w / 2 + 0.05, -0.05], [w / 2 - 0.05, -0.05], [0, 0.78]].map(([a, b]) => [x + a, y0 + b]), z - l / 2 + 0.02, z - l / 2 + 0.08));
  bag.add('opening', box(x - 0.2, y0 - 0.05, z - l / 2 + 0.005, x + 0.2, y0 + 0.4, z - l / 2 + 0.02));
}

// ---- canoes --------------------------------------------------------------------------------
/**
 * waka: a war canoe (waka taua) { c, y, yaw, l } drawn up on the shore: the hull hollowed from one
 * trunk, washstrakes (rauawa) lashed along its sides, thwarts across; at the bow the carved prow
 * (tauihu) with its figure thrust forward and its pierced spirals, at the stern the tall sternpost
 * (taurapa) with its two spirals; paddles laid across the thwarts.
 */
function waka(el, { bag, col }) {
  const [x, z] = el.c, L = el.l ?? 12, yaw = el.yaw ?? 0, y0 = el.y ?? 0, B = 0.55 + L * 0.015, D = 0.75;
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  const fig = (kind, px, py, pz, hh, ry = 0) => figure(bag, kind, x + px * ca + pz * sa, y0 + py, z - px * sa + pz * ca, hh, yaw + ry, 300);
  // the hull along local z (bow at −z): a U section narrowing to the ends, hollow
  const NU = 24, NS = 10, beam = (u) => B / 2 * Math.max(0.0004, 1 - Math.abs(2 * u / L) ** 2.2) ** 0.6, sheer = (u) => D + 0.25 * (2 * u / L) ** 4, rocker = (u) => 0.4 * Math.abs(2 * u / L) ** 5;
  const pt = (i, j, inner) => {
    const u = -L / 2 + L * i / NU, b = beam(u) * (inner ? 0.82 : 1), a = Math.PI * j / NS, top = sheer(u);
    const bot = rocker(u), yy = inner ? top - (top - bot - 0.14) * Math.sin(a) ** 0.6 * Math.min(1, beam(u) / (B * 0.2)) : top - (top - bot) * Math.sin(a) ** 0.7;
    return [-Math.cos(a) * b, yy, u];
  };
  const t = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NS; j++) {
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j + 1, false), d = pt(i, j + 1, false);
    t.push(...a, ...c, ...b, ...a, ...d, ...c);
    const a2 = pt(i, j, true), b2 = pt(i + 1, j, true), c2 = pt(i + 1, j + 1, true), d2 = pt(i, j + 1, true);
    t.push(...a2, ...b2, ...c2, ...a2, ...c2, ...d2);
  }
  for (let i = 0; i < NU; i++) for (const j of [0, NS]) {                // the gunwales
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j, true), d = pt(i, j, true);
    if (j === 0) t.push(...a, ...b, ...c, ...a, ...c, ...d); else t.push(...a, ...c, ...b, ...a, ...d, ...c);
  }
  add('wood_dark', fromTriangles(t));
  // the washstrakes: boards along the sides above the hull, ochred
  for (const s of [-1, 1]) for (let i = 1; i < NU - 1; i++) {
    const u0 = -L / 2 + L * i / NU, u1 = -L / 2 + L * (i + 1) / NU, h0 = sheer(u0), h1 = sheer(u1);
    add(K, hull([[s * beam(u0), h0 - 0.05, u0], [s * beam(u1), h1 - 0.05, u1], [s * (beam(u1) + 0.02), h1 + 0.28, u1], [s * (beam(u0) + 0.02), h0 + 0.28, u0],
      [s * (beam(u0) - 0.05), h0 - 0.05, u0], [s * (beam(u1) - 0.05), h1 - 0.05, u1], [s * (beam(u1) - 0.03), h1 + 0.28, u1], [s * (beam(u0) - 0.03), h0 + 0.28, u0]]));
  }
  // thwarts and paddles
  for (let k = 1; k < 8; k++) { const u = -L / 2 + L * (0.15 + 0.7 * k / 8), b = beam(u); add('timber', box(-b + 0.04, sheer(u) - 0.12, u - 0.06, b - 0.04, sheer(u) - 0.05, u + 0.06)); }
  for (let k = 0; k < 4; k++) { const u = -L / 4 + k * L * 0.15, b = beam(u); add('timber', box(-b - 0.4, sheer(u) + 0.29, u - 0.04, b + 0.5, sheer(u) + 0.32, u + 0.04)); add('timber', box(b + 0.5, sheer(u) + 0.25, u - 0.09, b + 1.1, sheer(u) + 0.28, u + 0.09)); }
  // the prow: a board thrust forward, a figure at its front looking ahead, two pierced spirals behind it
  const ub = -L / 2, hb = sheer(ub);
  add(K, hull([[-0.045, hb - 0.3, ub + 0.9], [-0.045, hb - 0.12, ub - 0.75], [-0.045, hb + 0.3, ub - 0.75], [-0.045, hb + 0.75, ub + 0.9],
    [0.045, hb - 0.3, ub + 0.9], [0.045, hb - 0.12, ub - 0.75], [0.045, hb + 0.3, ub - 0.75], [0.045, hb + 0.75, ub + 0.9]]));
  fig('post', 0, hb - 0.15, ub - 0.78, 0.8, 0);
  for (const k of [0, 1]) add(K, lathe([[0.15, -0.065], [0.2, 0], [0.15, 0.065], [0.11, 0]], 14, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(0, hb + 0.3 + k * 0.12, ub - 0.12 + k * 0.48));
  // the sternpost: tall, leaning back, two great spirals cut through it, a small figure at its foot
  const us = L / 2 - 0.1, hs = sheer(us);
  add(K, hull([[-0.05, hs - 0.3, us - 0.15], [0.05, hs - 0.3, us - 0.15], [0.05, hs - 0.3, us + 0.25], [-0.05, hs - 0.3, us + 0.25], [-0.05, hs + 2.6, us + 0.45], [0.05, hs + 2.6, us + 0.45], [0.05, hs + 2.6, us + 0.75], [-0.05, hs + 2.6, us + 0.75]]));
  for (const k of [0, 1]) add(K, lathe([[0.28, -0.05], [0.33, 0], [0.28, 0.05], [0.23, 0]], 14, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(0, hs + 0.75 + k * 1.05, us + 0.2 + (0.5 * (0.75 + k * 1.05) / 2.9)));
  fig('slab', 0, hs - 0.25, us - 0.18, 0.55, Math.PI);
  col.segment([x - sa * L / 2, z - ca * L / 2], [x + sa * L / 2, z + ca * L / 2], B, y0, y0 + D);
}

// ---- gardens -------------------------------------------------------------------------------
/** The fence's stakes, three heights. */
const STAKES = [1.25, 1.4, 1.55].map((hh) => lathe([[0.04, 0], [0.03, hh], [0.001, hh + 0.03]], 5));
/** The kūmara mound at unit size. */
const PUKE = lathe([[1, -0.3], [1, 0], [0.8, 0.28], [0.45, 0.42], [0.001, 0.46]], 8);
/**
 * mara: a kūmara garden { rect, y (a function (x, z) → ground height, or a number), seed } — mounds
 * (puke) of loosened soil in a quincunx, each with its sprouting vine; a fence of brushwood round
 * it against the wind; god sticks (atua kiato) at its corners.
 */
function mara(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, gy = () => el.y ?? 0, rand = rng(el.seed ?? 3), sp = 1.25;
  const put = (mat, g, m) => (bag.addInstance ? bag.addInstance(mat, g, m, { reach: 220 }) : bag.add(mat, g.clone().applyMatrix4(m)));
  let row = 0;
  for (let zz = z0 + 1; zz < z1 - 0.8; zz += sp * 0.5, row++) {
    for (let xx = x0 + 1 + (row % 2) * sp / 2; xx < x1 - 0.8; xx += sp) {
      const r = 0.36 + rand() * 0.08;
      put('banco', PUKE, new Matrix4().makeTranslation(xx, gy(xx, zz), zz).multiply(new Matrix4().makeScale(r, r, r)));
    }
  }
  // the brushwood fence: stakes with a rail, gaps for the path
  const fence = (a, b) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 0.5);
    for (let i = 0; i <= n; i++) { const px = a[0] + (b[0] - a[0]) * i / n, pz = a[1] + (b[1] - a[1]) * i / n; put(P, STAKES[Math.floor(rand() * 3)], new Matrix4().makeTranslation(px, gy(px, pz) - 0.2, pz)); }
    const ya = gy(a[0], a[1]), yb = gy(b[0], b[1]);
    bag.add(P, rod([a[0], ya + 0.85, a[1]], [b[0], yb + 0.85, b[1]], 0.035, 5));
  };
  fence([x0, z0], [x1, z0]); fence([x1, z0], [x1, z1]); fence([x1, z1], [x0, z1]);
  fence([x0, z1], [x0, (z0 + z1) / 2 + 1.2]); fence([x0, (z0 + z1) / 2 - 1.2], [x0, z0]);
  for (const [cx, cz] of [[x0 + 0.4, z0 + 0.4], [x1 - 0.4, z1 - 0.4]]) {
    bag.add(K, lathe([[0.05, 0], [0.04, 0.7]], 6, null, cx, gy(cx, cz) - 0.1, cz));
    figure(bag, 'post', cx, gy(cx, cz) + 0.55, cz, 0.38, rand() * 6.28, 160);
  }
}

registerStyle('maori', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, palisade, whare, pataka, stage, waharoa, rua, waka, mara },
  objects: {},
});
