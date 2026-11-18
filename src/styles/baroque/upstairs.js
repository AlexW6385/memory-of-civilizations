// The Borgo's houses entered and climbed (docs/settlements/baroque-rome.md §5c): a house of the
// rows whose door stands open on a stair — the door leaf folded back inside, a masonry flight up
// along the party wall, a landing, a second flight over the first, a floor of tiles on a plaster slab
// with the stairwell cut out of it, the front wall cut for real windows (the shutters open, the
// reveals deep) and, on the first floor, a door-window onto an iron balcony that can be stepped on.
// Three kinds of house: the casa (a bottega under the stair's house: shop-house, inn, craftsman's,
// tenement) and the palazzetto (an androne from the portal, the stair beside it, the piano nobile
// over it with its sala, camere and balcony, the rear wing's roof a terrace).
// Everything is built in the unit's own frame (u along the face, y up, d out; here s = −d inward)
// and a "canonical" x that runs from the stair side (the door's side) to the far wall, mirrored
// into u where the house is flipped. Only the near copy of a tile builds it (borgo.js).

import { box, lathe } from '../../core/geom.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { Local, ext, archOutline, wrect, toW } from '../renaissance/face.js';

export const SLAB = 0.3, T0 = 0.5, TB = 0.4, FL0 = 0.05, COL = 1.3, STR = 0.15;
const W_IN = 'plaster_white', FLR = 'cotto_floor', DOOR = 'wood_dark', BEAM = 'timber', PAINT = 'wood_painted';
const arch = (uc, y0, y1, w) => archOutline(uc, y0, w, y1 - w / 2, 'round', 8);

/** A box's geometry without its upward faces (a rail's top: the walker steps onto anything lower than half a metre, and a top face over the stairwell would be taken for a floor). */
function dropTop(g) {
  if (g.index) g = g.toNonIndexed();
  const P = g.attributes.position.array, N = g.attributes.normal.array, kp = [], kn = [];
  for (let i = 0; i < P.length; i += 9) {
    if (N[i + 1] > 0.99 && N[i + 4] > 0.99 && N[i + 7] > 0.99) continue;
    for (let k = 0; k < 9; k++) { kp.push(P[i + k]); kn.push(N[i + k]); }
  }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(kp, 3)); m.setAttribute('normal', new Float32BufferAttribute(kn, 3));
  return m;
}

/** The rectangles of r = [x0, x1, s0, s1] that lie outside every hole. */
function subtract(r, holes) {
  let out = [r];
  for (const h of holes) {
    const nx = [];
    for (const q of out) {
      if (h[1] <= q[0] || h[0] >= q[1] || h[3] <= q[2] || h[2] >= q[3]) { nx.push(q); continue; }
      if (h[0] > q[0]) nx.push([q[0], h[0], q[2], q[3]]);
      if (h[1] < q[1]) nx.push([h[1], q[1], q[2], q[3]]);
      const a = Math.max(q[0], h[0]), b = Math.min(q[1], h[1]);
      if (h[2] > q[2]) nx.push([a, b, q[2], h[2]]);
      if (h[3] < q[3]) nx.push([a, b, h[3], q[3]]);
    }
    out = nx;
  }
  return out.filter((q) => q[1] - q[0] > 0.01 && q[3] - q[2] > 0.01);
}

/**
 * The plan of the stair and the floors of a unit (shared by the builder and the walk-check routes).
 * o: { kind, w, D, S: storey heights, storeys, terrace }. x is "canonical": from the stair's outer wall (casa: the side wall's inner
 * face; palazzo: the androne's right wall) toward the other side.
 */
export function planUp(o) {
  const casa = o.kind !== 'palazzo', { w, D } = o, S = o.S.slice(0, o.storeys);
  const ys = [0]; for (const s of S) ys.push(ys[ys.length - 1] + s);
  const xc = w / 2, xs = casa ? T0 : xc + 1.9;             // the stair's outer wall
  const col1 = [xs, xs + COL], str = [xs + COL, xs + COL + STR], col2 = [xs + COL + STR, xs + 2 * COL + STR], xb = xs + 2 * COL + STR;
  const m = o.storeys - 1, lv = [FL0]; for (let k = 1; k <= m; k++) lv.push(ys[k]);
  const sStart = casa ? 0.9 : 1.9, sMin = casa ? 1.38 : 1.62, sBack = D - TB - 1.2;
  const fl = [];
  let s = sStart;
  for (let k = 1; k <= m; k++) {
    const rise = lv[k] - lv[k - 1], n = Math.ceil(rise / 0.2), h = rise / n, steps = n - 1, up = k % 2 ? 1 : -1;
    let tr = up > 0 ? (sBack - s) / steps : (s - sMin) / steps;
    tr = Math.max(0.24, Math.min(0.27, tr));
    const end = s + up * steps * tr;
    fl.push({ k, n, h, steps, tr, a: s, b: end, up, col: k % 2 ? col1 : col2, y0: lv[k - 1], y1: lv[k] });
    s = end;
  }
  const eMax = Math.max(sStart, ...fl.map((f) => Math.max(f.a, f.b)));
  return { casa, w, D, S, ys, H: ys[S.length], xc, xs, col1, str, col2, xb, m, lv, fl, eMax, sStart, sMin };
}

/** The walker's way from the street to a room of floor `floor` (waypoints [u, d] in the unit's face frame); opts.balcony: on through the rooms to the front room, opts.terrace: out onto the terrace. */
export function upRoute(o, floor = o.storeys - 1, opts = {}) {
  const P = planUp(o), fl = o.kind === 'palazzo' || !!o.flip, mx = (x) => (fl ? o.u0 + x : o.u0 + o.w - x);
  const c1 = (P.col1[0] + P.col1[1]) / 2, c2 = (P.col2[0] + P.col2[1]) / 2;
  const doorX = P.casa ? 1.25 : P.xc + 1.0, r = [];
  r.push([mx(doorX), 2.6], [mx(doorX), -0.9]);
  if (!P.casa) r.push([mx(P.xc + 1.0), -1.25], [mx(c1), -1.25]);
  for (const f of P.fl) {
    if (f.k > floor) break;
    const c = f.col === P.col1 ? c1 : c2;
    if (f.k > 1) { const prev = P.fl[f.k - 2], pc = prev.col === P.col1 ? c1 : c2, ls = prev.b + prev.up * 0.6; r.push([mx(pc), -ls], [mx(c), -ls]); }
    r.push([mx(c), -(f.a + f.up * 0.25)], [mx(c), -(f.b - f.up * 0.15)]);
  }
  const f = P.fl[floor - 1], c = f.col === P.col1 ? c1 : c2, ls = f.b + f.up * 0.55;
  r.push([mx(c), -ls]);
  const endS = floor < P.m || !o.terrace ? o.D - TB : P.eMax + 0.2, Dp = Math.round((0.5 + endS) / 2 * 10) / 10;
  if (opts.terrace) { r.push([mx(c1), -ls], [mx(c1), -(P.eMax + 1.4)], [mx(c1), -(P.eMax + 2.6)]); return r; }
  if (P.casa) {
    r.push([mx(P.xb + 0.9), -ls], [mx(P.xb + 2.2), -(f.up > 0 ? Math.min(o.D - 1.4, ls + 0.1) : 2.2)]);
    if (opts.balcony) r.push([mx(P.xb + 0.6), -(f.up > 0 ? Dp + 0.8 : Dp - 0.8)], [mx(P.xb + 0.6), -(f.up > 0 ? Dp - 0.8 : Dp + 0.8)].slice(0, 2));
  } else {
    const xL = P.xs - 0.3;
    r.push([mx(P.xs - 1.4), -ls], [mx(P.xs - 3.0), -(f.up > 0 ? ls : 3.0)]);
    if (opts.balcony && f.up > 0) r.push([mx(xL - 2.65), -(Dp + 0.8)], [mx(xL - 2.65), -(Dp - 0.8)]);
  }
  return r;
}

/** The windows of the front wall, in the unit's face frame: [{ s: storey, u, w, y0, y1, door }] (the exterior in borgo.js is drawn from the same list). */
export function frontWindows(o) {
  const P = planUp(o), { ys, casa } = P, W = [];
  if (casa) {
    const nb = o.w < 7.6 ? 2 : 3, bw = (o.w - 0.8) / nb, kB = o.flip ? nb - 1 : 0;
    for (let s = 1; s < P.S.length; s++) for (let k = 0; k < nb; k++) {
      const u = o.u0 + 0.4 + (k + 0.5) * bw, wh = s === 1 ? 2.0 : 1.7;
      if (s === 1 && k === kB) W.push({ s, u, w: 0.9, y0: ys[1] + 0.12, y1: ys[1] + 2.57, door: true });
      else W.push({ s, u, w: 0.9, y0: ys[s] + 0.75, y1: ys[s] + 0.75 + wh });
    }
  } else {
    const nb = Math.max(3, Math.min(7, Math.round(o.w / 4.6) | 1)), bw = o.w / nb, c = Math.floor(nb / 2), y1 = ys[1], y2 = ys[2];
    for (let k = 0; k < nb; k++) {
      const u = o.u0 + (k + 0.5) * bw;
      if (k === c) W.push({ s: 1, u, w: 1.5, y0: y1 + 0.3, y1: y1 + 3.9, door: true }); else W.push({ s: 1, u, w: 1.3, y0: y1 + 1.0, y1: y1 + 3.7 });
      if (P.S.length > 2) W.push({ s: 2, u, w: 1.2, y0: y2 + 0.9, y1: y2 + 3.1 });
      if (P.S.length > 3) W.push({ s: 3, u, w: 0.9, y0: ys[3] + 0.8, y1: ys[3] + 2.1 });
    }
  }
  return W;
}

/** The balcony of the first floor: its centre u. */
export const balconyU = (o) => frontWindows(o).find((q) => q.door).u;

// ── the builder ─────────────────────────────────────────────────────────────────

export function openUp(bag, col, M, o, wall, lights) {
  const { u0, w, D, H, rand } = o, P = planUp(o), { casa, ys, lv, fl: FLT, m } = P;
  let MIRX = null;
  const fl = casa ? !!o.flip : true, mx = (x) => { if (MIRX !== null) x = MIRX - x; return fl ? u0 + x : u0 + w - x; }, xOf = (u) => (fl ? u - u0 : u0 + w - u);
  const L = new Local(), terr = !!o.terrace, eMax = P.eMax;
  const R = (x0, x1, s0, s1) => wrect(M, mx(x0), -s0, mx(x1), -s1);
  const bx = (mat, x0, x1, s0, s1, y0, y1, c) => {
    L.box(mat, mx(x0), y0, -s0, mx(x1), y1, -s1);
    if (c) { const cy = c === true ? [y0, y1] : c; col.rect(R(x0, x1, s0, s1), cy[0], cy[1]); }
  };
  const lt = (mat, prof, x, s, y, seg = 8) => L.add(mat, lathe(prof, seg, null, mx(x), y, -s));
  const fbox = (mat, x0, x1, s0, s1, y0, y1) => L.add(mat, dropTop(box(Math.min(mx(x0), mx(x1)), y0, Math.min(-s0, -s1), Math.max(mx(x0), mx(x1)), y1, Math.max(-s0, -s1))));
  const sT = terr ? eMax + 0.2 : D - TB;                       // the top floor's rooms end here (a terrace behind), else at the back wall
  const wingTop = terr ? ys[m] : H;
  const lvTop = (k) => (k < m ? ys[k + 1] : H), yc = (k) => lvTop(k) - SLAB;
  const zones = [], zone = (z) => zones.push(z), free = (a0, a1, s0, s1) => { const x0 = MIRX === null ? a0 : MIRX - a1, x1 = MIRX === null ? a1 : MIRX - a0; return !zones.some((z) => x0 < z[1] && x1 > z[0] && s0 < z[3] && s1 > z[2]); };

  // ── the shell: party walls, back wall; a terrace's wing comes down to a parapet
  const sW = terr ? sT + 0.4 : D, pTop = wingTop + 1.05;
  for (const [a, b] of [[0, T0], [w - T0, w]]) { bx(wall, a, b, 0, sW, -0.5, H, [0, H]); if (terr) bx(wall, a, b, sW, D, -0.5, pTop, [0, pTop]); }
  bx(wall, T0, w - T0, D - TB, D, -0.5, terr ? pTop : H, [0, terr ? pTop : H]);
  const win = frontWindows(o);

  // ── the front wall: one extrusion with the door, the arch and the windows cut through it
  const hole = [], strips = [];
  let doorU, shopU, sw = 0, dw = 1.1;
  if (casa) {
    sw = Math.min(2.8, w - dw - 1.6);
    shopU = u0 + 0.7 + sw / 2 + (o.flip ? dw + 0.4 : 0); doorU = o.flip ? u0 + 0.7 + dw / 2 : u0 + w - 0.7 - dw / 2;
    hole.push([[doorU - dw / 2, 0], [doorU + dw / 2, 0], [doorU + dw / 2, 2.4], [doorU - dw / 2, 2.4]], arch(shopU, 0, 3.4, sw));
    strips.push([doorU - dw / 2, doorU + dw / 2], [shopU - sw / 2, shopU + sw / 2]);
  } else {
    const uc = u0 + P.xc; doorU = uc;
    hole.push(arch(uc, 0, 2.9 + 1.35, 2.7)); strips.push([uc - 1.35, uc + 1.35]);
  }
  for (const q of win) hole.push([[q.u - q.w / 2, q.y0], [q.u + q.w / 2, q.y0], [q.u + q.w / 2, q.y1], [q.u - q.w / 2, q.y1]]);
  L.add(wall, ext([[u0, -0.5], [u0 + w, -0.5], [u0 + w, H], [u0, H]], hole, -T0, 0, 8));
  const stripsOf = (list, a, b) => { const s = list.slice().sort((p, q) => p[0] - q[0]); const out = []; let c = a; for (const [p, q] of s) { if (p > c + 0.02) out.push([c, p]); c = Math.max(c, q); } if (b > c + 0.02) out.push([c, b]); return out; };
  for (const [a, b] of stripsOf(strips, u0, u0 + w)) col.rect(wrect(M, a, -T0, b, 0), 0, ys[1]);
  for (let s = 1; s < P.S.length; s++) {
    const ws = win.filter((q) => q.s === s), top = ys[s + 1];
    for (const [a, b] of stripsOf(ws.map((q) => [q.u - q.w / 2, q.u + q.w / 2]), u0, u0 + w)) col.rect(wrect(M, a, -T0, b, 0), ys[s], top);
    for (const q of ws) if (q.y0 - ys[s] > 0.25) col.rect(wrect(M, q.u - q.w / 2, -T0, q.u + q.w / 2, 0), ys[s], q.y0);
  }
  // the balcony: the doorway's sill and the slab's floor can be walked, the iron rail is a wall
  const bw = win.find((q) => q.door), by = bw.y0;
  { const bwid = casa ? 1.7 : 3.4, bd = casa ? 0.95 : 1.05, u = bw.u;
    col.floor(wrect(M, u - bw.w / 2, -T0, u + bw.w / 2, 0), by); col.floor(wrect(M, u - bwid / 2, 0, u + bwid / 2, bd), by);
    col.rect(wrect(M, u - bwid / 2, bd - 0.1, u + bwid / 2, bd), by, by + 1.0);
    for (const sg of [-1, 1]) col.rect(wrect(M, u + sg * (bwid / 2 - 0.05) - 0.05, 0, u + sg * (bwid / 2 - 0.05) + 0.05, bd), by, by + 1.0); }

  // ── the stair: flights of masonry, each over its own solid mass, a ramp laid along it for the walker
  const stepMat = FLR;
  for (const f of FLT) {
    const [cx0, cx1] = f.col;
    for (let i = 1; i <= f.steps; i++) {
      const s0 = f.a + f.up * (i - 1) * f.tr, s1 = f.a + f.up * i * f.tr;
      bx(stepMat, cx0, cx1, Math.min(s0, s1), Math.max(s0, s1), f.y0 - 0.04, f.y0 + i * f.h);
    }
    const sb = f.a + f.up * f.steps * f.tr, cm = (cx0 + cx1) / 2;
    const p0 = toW(M, mx(cm), -f.a), p1 = toW(M, mx(cm), -sb), dx = p1[0] - p0[0], dz = p1[1] - p0[1];
    col.ramp(R(cx0 + 0.02, cx1 - 0.02, Math.min(f.a, sb), Math.max(f.a, sb)), f.y0 + f.h * 0.5, f.y1 - f.h * 0.5, Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n'));
  }
  // ── the floors: slabs with the stairwell cut out
  for (let k = 1; k <= m; k++) {
    const f = FLT[k - 1], hole1 = [f.col[0], f.col[1], k === 1 ? 0.5 : Math.min(f.a, f.b) - 0.02, Math.max(f.a, f.b) + 0.02];
    for (const r of subtract([T0, w - T0, 0.5, D - TB], [hole1])) {
      const deck = terr && k === m && r[2] >= sT;
      bx(W_IN, r[0], r[1], r[2], r[3], lv[k] - SLAB, lv[k] - 0.03);
      bx(deck ? 'brick' : (!casa && k === 1 ? 'marble_smooth' : FLR), r[0], r[1], r[2], r[3], lv[k] - 0.03, lv[k]);
      col.floor(R(r[0], r[1], r[2], r[3]), lv[k]);
    }
  }
  bx(W_IN, T0, w - T0, 0.5, sT, H - SLAB, H);                    // the ceiling of the top storey
  function rail(x0, x1, s, y, h = 0.98) {
    const s0 = s - 0.04, s1 = s + 0.04, n = Math.max(2, Math.round((x1 - x0) / 0.13));
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; fbox('iron', x - 0.012, x + 0.012, s0 + 0.02, s1 - 0.02, y + 0.05, y + h - 0.04); }
    fbox('iron', x0, x1, s0, s1, y + h - 0.04, y + h); fbox('iron', x0, x1, s0, s1, y + 0.02, y + 0.08);
    col.rect(R(x0, x1, s0, s1), y, y + h);
  }
  for (const f of FLT) if (f.k >= 2) rail(f.col[0], f.col[1], f.a, lv[f.k]);

  // ── walls with doors
  const across = (mat, a, b, s, t, y0, y1, gaps = []) => {
    gaps = gaps.slice().sort((p, q) => p[0] - q[0]);
    const cuts = [a, ...gaps.flat(), b];
    for (let i = 0; i < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > 0.02) bx(mat, cuts[i], cuts[i + 1], s - t / 2, s + t / 2, y0, y1, [y0, y1]);
    for (const [ga, gb] of gaps) {
      bx(mat, ga, gb, s - t / 2, s + t / 2, y0 + 2.15, y1);
      bx(DOOR, ga, ga + 0.05, s - t / 2 - 0.02, s + t / 2 + 0.02, y0, y0 + 2.2); bx(DOOR, gb - 0.05, gb, s - t / 2 - 0.02, s + t / 2 + 0.02, y0, y0 + 2.2); bx(DOOR, ga, gb, s - t / 2 - 0.02, s + t / 2 + 0.02, y0 + 2.15, y0 + 2.2);
      zone([ga - 0.2, gb + 0.2, s - 1.0, s + 1.0]);
    }
  };
  const along = (mat, x, a, b, t, y0, y1, gaps = []) => {
    gaps = gaps.slice().sort((p, q) => p[0] - q[0]);
    const cuts = [a, ...gaps.flat(), b];
    for (let i = 0; i < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > 0.02) bx(mat, x - t / 2, x + t / 2, cuts[i], cuts[i + 1], y0, y1, [y0, y1]);
    for (const [ga, gb] of gaps) {
      bx(mat, x - t / 2, x + t / 2, ga, gb, y0 + 2.15, y1);
      bx(DOOR, x - t / 2 - 0.02, x + t / 2 + 0.02, ga, ga + 0.05, y0, y0 + 2.2); bx(DOOR, x - t / 2 - 0.02, x + t / 2 + 0.02, gb - 0.05, gb, y0, y0 + 2.2); bx(DOOR, x - t / 2 - 0.02, x + t / 2 + 0.02, ga, gb, y0 + 2.15, y0 + 2.2);
      zone([x - 1.0, x + 1.0, ga - 0.2, gb + 0.2]);
    }
  };

  // ── the ground storey
  const SD = Math.min(D - TB, 6.2), top1 = ys[1] - SLAB;
  const cm1 = (P.col1[0] + P.col1[1]) / 2;
  if (casa) {
    bx(wall, T0, w - T0, SD, D - TB, -0.5, top1, [0, ys[1]]);                                   // the mass behind the shop
    bx(W_IN, P.col1[0], P.col1[1], eMax, SD, 0, top1, [0, ys[1]]);                               // under the landing
    bx(W_IN, P.str[0], P.str[1], 0.5, SD, 0, top1, [0, ys[1]]);                                  // the stair's wall toward the shop
    bx(FLR, P.col1[0], P.col1[1], 0.5, P.sStart, -0.12, FL0); col.floor(R(P.col1[0], P.col1[1], 0.5, P.sStart), FL0);
    bx(FLR, P.str[1], w - T0, 0.5, SD, -0.12, FL0); col.floor(R(P.str[1], w - T0, 0.5, SD), FL0);
    bx(DOOR, P.col1[0], P.col1[0] + 0.05, 0.55, 1.5, 0, 2.35);                                   // the door leaf folded back inside
    const uA = mx(P.str[1]), uB = mx(w - T0), vy = 2.9, rise = 0.5, pts = [[uA, vy]];
    for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([uA + (uB - uA) * t, vy + Math.sin(t * Math.PI) * rise]); }
    pts.push([uB, vy], [uB, top1], [uA, top1]);
    L.add(W_IN, ext(pts, [], -SD, -T0, 1));
    o.furnish(bag, col, M, { u0: Math.min(uA, uB), u1: Math.max(uA, uB), d0: -T0, d1: -SD, y: FL0, trade: o.trade, rand, vy });
    if (lights) { const q = wrect(M, shopU, -3.2, shopU, -3.2); lights.push({ at: [q[0], 2.6, q[1]], color: '#ffc27a', intensity: 3, distance: 7 }); }
  } else {
    const xc = P.xc;
    bx(W_IN, T0, xc - 1.6, 0.5, D - TB, 0, top1, [0, ys[1]]);                                    // (the mass left of the androne)
    along(W_IN, xc + 1.75, 0.5, D - TB, 0.3, 0, top1, [[0.7, 1.8]]);                             // the androne's right wall, a door to the stair
    bx(W_IN, P.xs + COL, w - T0, 0.5, D - TB, 0, top1, [0, ys[1]]);
    bx(W_IN, P.col1[0], P.col1[1], eMax, D - TB, 0, top1, [0, ys[1]]);
    bx('travertine', xc - 1.6, xc + 1.6, 0.5, D - TB, -0.12, FL0); col.floor(R(xc - 1.6, xc + 1.6, 0.5, D - TB), FL0);
    bx('travertine', P.xs, P.xs + COL, 0.5, P.sStart, -0.12, FL0); col.floor(R(P.xs, P.xs + COL, 0.5, P.sStart), FL0);
    bx('travertine', xc + 1.6, P.xs, 0.7, 1.8, -0.12, FL0); col.floor(R(xc + 1.6, P.xs, 0.7, 1.8), FL0);
    const uc = u0 + xc, pts = [[uc - 1.6, 3.0]];
    for (let i = 1; i < 16; i++) { const a = Math.PI - i / 16 * Math.PI; pts.push([uc + Math.cos(a) * 1.6, 3.0 + Math.sin(a) * 1.6]); }
    pts.push([uc + 1.6, 3.0], [uc + 1.6, top1], [uc - 1.6, top1]);
    L.add(W_IN, ext(pts, [], -(D - TB), -T0, 1));
    bx(DOOR, xc - 1.2, xc + 1.2, D - TB - 0.08, D - TB, FL0, 2.9);                               // the rear gate, shut
    bx('travertine', xc - 1.6, xc - 1.2, 2.5, 4.2, FL0, 0.45, true);                              // the porter's stone seat
    lights?.push({ at: [wrect(M, uc, -3, uc, -3)[0], 3.2, wrect(M, uc, -3, uc, -3)[1]], color: '#ffc27a', intensity: 2.5, distance: 7 });
  }

  // ── the upper floors
  const mats = { bed: ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_maroon'] };
  const taken = (a0, a1, s0, s1) => zones.push(MIRX === null ? [a0, a1, s0, s1] : [MIRX - a1, MIRX - a0, s0, s1]);
  const ok = (x0, x1, s0, s1, r) => x0 >= r[0] - 0.001 && x1 <= r[1] + 0.001 && s0 >= r[2] - 0.001 && s1 <= r[3] + 0.001 && free(x0, x1, s0, s1);
  const mk = (axis, head, x0, x1, s0, s1) => {
    const al = axis === 'x' ? [x0, x1] : [s0, s1], ac = axis === 'x' ? [s0, s1] : [x0, x1];
    return (t0, t1, c0, c1) => {
      const a = head ? [al[0] + t0, al[0] + t1] : [al[1] - t1, al[1] - t0], c = [ac[0] + c0, ac[0] + c1];
      return axis === 'x' ? [a[0], a[1], c[0], c[1]] : [c[0], c[1], a[0], a[1]];
    };
  };
  let ROOM = null, FY = 0;
  // furniture: each returns whether it was set (it is left out where a door's or the stair's lane would be blocked)
  const place = (rect, fn) => { if (!ok(...rect, ROOM)) return false; fn(); taken(...rect); return true; };
  const bed = (x0, x1, s0, s1, axis, head, wide = 1.1) => {
    const len = 2.0, p = mk(axis, head, ...(axis === 'x' ? [x0, x0 + len, s0, s0 + wide] : [x0, x0 + wide, s0, s0 + len]));
    const rect = p(0, len, 0, wide), y = FY;
    return place(rect, () => {
      bx(PAINT, ...rect, y, y + 0.36, [y, y + 0.6]);
      bx('cloth_white', ...p(0.04, len - 0.04, 0.04, wide - 0.04), y + 0.36, y + 0.48);
      bx(mats.bed[Math.floor(rand() * 5)], ...p(0.03, len * 0.66, 0.02, wide - 0.02), y + 0.46, y + 0.53);
      bx('cloth_white', ...p(len - 0.55, len - 0.1, 0.12, wide - 0.12), y + 0.48, y + 0.58);
      bx(PAINT, ...p(len - 0.07, len, 0, wide), y, y + 1.0); bx(PAINT, ...p(0, 0.06, 0, wide), y, y + 0.55);
    });
  };
  const chest = (x0, x1, s0, s1) => place([x0, x1, s0, s1], () => { bx(PAINT, x0, x1, s0, s1, FY, FY + 0.5, [FY, FY + 0.55]); bx(BEAM, x0 - 0.01, x1 + 0.01, s0 - 0.01, s1 + 0.01, FY + 0.5, FY + 0.56); bx('iron', (x0 + x1) / 2 - 0.03, (x0 + x1) / 2 + 0.03, s0 - 0.012, s1 + 0.012, FY + 0.2, FY + 0.5); });
  const table = (x0, x1, s0, s1, hh = 0.76) => place([x0, x1, s0, s1], () => {
    bx(DOOR, x0, x1, s0, s1, FY + hh - 0.05, FY + hh, [FY, FY + hh + 0.03]);
    for (const x of [x0 + 0.04, x1 - 0.1]) for (const s of [s0 + 0.04, s1 - 0.1]) bx(DOOR, x, x + 0.06, s, s + 0.06, FY, FY + hh - 0.05);
  });
  const stool = (x, s) => place([x - 0.2, x + 0.2, s - 0.2, s + 0.2], () => bx(DOOR, x - 0.17, x + 0.17, s - 0.17, s + 0.17, FY, FY + 0.45));
  const bench = (x0, x1, s0, s1) => place([x0, x1, s0, s1], () => bx(DOOR, x0, x1, s0, s1, FY, FY + 0.46, true));
  const cupboard = (x0, x1, s0, s1, h = 1.8) => place([x0, x1, s0, s1], () => { bx(DOOR, x0, x1, s0, s1, FY, FY + h, [FY, FY + h]); bx(BEAM, x0 - 0.03, x1 + 0.03, s0 - 0.03, s1 + 0.03, FY + h, FY + h + 0.06); });
  const sacks = (x0, x1, s0, s1) => place([x0, x1, s0, s1], () => { bx('sacking', x0, x1, s0, s1, FY, FY + 0.55, [FY, FY + 0.55]); bx('sacking', x0 + 0.05, x1 - 0.1, s0 + 0.05, s1 - 0.05, FY + 0.55, FY + 0.95); });
  const barrel = (x, s) => place([x - 0.4, x + 0.4, s - 0.4, s + 0.4], () => { lt(BEAM, [[0.3, 0], [0.36, 0.28], [0.3, 0.56], [0.001, 0.56]], x, s, FY, 12); col.rect(R(x - 0.36, x + 0.36, s - 0.36, s + 0.36), FY, FY + 0.6); });
  const jar = (x, s, y, mat = 'terracotta') => lt(mat, [[0.001, 0], [0.07, 0], [0.1, 0.1], [0.07, 0.2], [0.04, 0.24], [0.001, 0.24]], x, s, y);
  const hearth = (xFar, sc) => place([xFar - 0.9, xFar, sc - 0.95, sc + 0.95], () => {   // the hearth in the far wall: the brick breast to the ceiling, the mouth, a mantel, the crane with its pot
    bx('brick', xFar - 0.7, xFar, sc - 0.95, sc + 0.95, FY, ROOM.yc, [FY, ROOM.yc]);
    bx('opening', xFar - 0.72, xFar - 0.68, sc - 0.5, sc + 0.5, FY + 0.15, FY + 1.1);
    bx(BEAM, xFar - 0.82, xFar - 0.64, sc - 1.0, sc + 1.0, FY + 1.15, FY + 1.25); bx('brick', xFar - 0.78, xFar - 0.68, sc - 0.55, sc + 0.55, FY, FY + 0.12);
    bx('iron', xFar - 0.9, xFar - 0.88, sc - 0.02, sc + 0.02, FY + 0.5, FY + 1.1); lt('iron', [[0.001, 0], [0.16, 0.04], [0.2, 0.15], [0.14, 0.24], [0.001, 0.24]], xFar - 1.05, sc, FY + 0.35);
    bx('iron', xFar - 1.05, xFar - 0.68, sc - 0.015, sc + 0.015, FY + 0.58, FY + 0.6);
  });
  const picture = (xFar, c, y, mat = 'cloth_maroon', ww = 0.55, hh = 0.75) => { bx(PAINT, xFar - 0.05, xFar, c - ww / 2 - 0.05, c + ww / 2 + 0.05, y, y + hh + 0.1); bx(mat, xFar - 0.07, xFar - 0.05, c - ww / 2, c + ww / 2, y + 0.05, y + hh + 0.05); };
  const crucifix = (xFar, c, y) => { bx('bronze', xFar - 0.04, xFar, c - 0.02, c + 0.02, y, y + 0.4); bx('bronze', xFar - 0.04, xFar, c - 0.12, c + 0.12, y + 0.26, y + 0.3); };
  const shelves = (x0, x1, s, y, mat = 'terracotta') => { for (let k = 0; k < 3; k++) { const yy = y + k * 0.5; bx(DOOR, x0, x1, s, s + 0.3, yy, yy + 0.04); for (let x = x0 + 0.2; x < x1 - 0.1; x += 0.3) jar(x, s + 0.16, yy + 0.04, k === 1 ? 'glaze_green' : mat); } };
  const beams = (r, y) => { for (let s = r[2] + 0.5; s < r[3] - 0.2; s += 1.1) bx(BEAM, r[0], r[1], s - 0.09, s + 0.09, y - 0.2, y); };
  const lamp = (x, s, y) => { lt('lamp_glass', [[0.001, 0], [0.1, 0.04], [0.12, 0.18], [0.07, 0.26], [0.001, 0.28]], x, s, y - 0.45); bx('iron', x - 0.005, x + 0.005, s - 0.005, s + 0.005, y - 0.2, y); };
  const cloth = (x0, x1, s, y0, y1, mat) => bx(mat, x0, x1, s - 0.01, s + 0.01, y0, y1);

  // the kits: a room's contents by use (r = [x0, x1, s0, s1] is the room's clear floor; its far wall is at x1)
  const KITS = {
    camera(r, rich) {
      const [, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      bed(x1 - 2.0, x1, s1 - 1.2, s1 - 0.05, 'x', true, 1.15); chest(x1 - 0.55, x1 - 0.05, s0 + 0.15, s0 + 1.15);
      if (rich) { bed(x1 - 2.0, x1, s0 + 0.05, s0 + 1.2, 'x', true, 1.15); } else table(x1 - 1.5, x1 - 0.8, s0 + 0.1, s0 + 0.6);
      picture(x1, mid, FY + 1.3); crucifix(x1, mid + 0.9, FY + 1.5); lamp((r[0] + x1) / 2 + 0.5, mid, ROOM.yc);
    },
    sala(r, rich) {
      const [x0, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      table(x1 - 3.0, x1 - 1.4, mid - 0.45, mid + 0.45); for (const s of [mid - 0.75, mid + 0.75]) { stool(x1 - 2.6, s); stool(x1 - 1.8, s); }
      cupboard(x1 - 0.5, x1, mid - 0.9, mid + 0.9); chest(x1 - 3.4, x1 - 2.2, s0 + 0.08, s0 + 0.58);
      picture(x1, mid + 1.5, FY + 1.3, 'cloth_blue'); lamp(x1 - 2.2, mid, ROOM.yc);
      if (rich) { picture(x1, mid - 1.5, FY + 1.3, 'cloth_red'); }
      void x0;
    },
    cucina(r) {
      const [, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      hearth(x1, mid); table(x1 - 3.2, x1 - 1.8, s1 - 1.0, s1 - 0.3); stool(x1 - 2.8, s1 - 1.45); stool(x1 - 2.0, s1 - 1.45);
      cupboard(x1 - 1.0, x1 - 0.1, s0 + 0.05, s0 + 0.5, 1.9); shelves(x1 - 2.6, x1 - 1.2, s0 + 0.04, FY + 0.9); barrel(x1 - 0.5, s1 - 0.5);
      lamp(x1 - 2.4, mid, ROOM.yc);
    },
    famiglia(r) { KITS.camera(r, false); hearth(r[1], (r[2] + r[3]) / 2); },
    deposito(r) {
      const [, x1, s0, s1] = r;
      sacks(x1 - 1.0, x1, s0 + 0.1, s0 + 0.9); sacks(x1 - 1.0, x1, s1 - 0.9, s1 - 0.1); barrel(x1 - 1.0, (s0 + s1) / 2); barrel(x1 - 1.0, (s0 + s1) / 2 + 0.85);
      shelves(x1 - 3.0, x1 - 1.8, s1 - 0.3, FY + 0.5); chest(x1 - 2.8, x1 - 1.7, s0 + 0.1, s0 + 0.6);
      for (let x = r[0] + 1.6; x < x1 - 1.2; x += 0.45) bx('timber', x, x + 0.18, (s0 + s1) / 2 - 0.03, (s0 + s1) / 2 + 0.03, ROOM.yc - 0.8, ROOM.yc - 0.3);
    },
    rosario(r) {
      const [, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      table(x1 - 2.4, x1 - 0.8, mid - 0.5, mid + 0.5); stool(x1 - 1.6, mid - 0.9); stool(x1 - 1.6, mid + 0.9);
      cupboard(x1 - 0.5, x1, s1 - 1.4, s1 - 0.1); shelves(x1 - 2.4, x1 - 0.8, s0 + 0.04, FY + 0.8, 'terracotta'); chest(x1 - 3.2, x1 - 2.2, s1 - 0.6, s1 - 0.1);
      for (let k = 0; k < 4; k++) bx('bronze', x1 - 2.2 + k * 0.32, x1 - 2.2 + k * 0.32 + 0.12, mid - 0.2, mid + 0.1, FY + 0.76, FY + 0.8);
      for (let k = 0; k < 5; k++) bx(k % 2 ? 'timber' : 'bronze', x1 - 0.05, x1, s0 + 0.5 + k * 0.28, s0 + 0.55 + k * 0.28, FY + 1.1, FY + 1.7);
      lamp(x1 - 1.5, mid, ROOM.yc);
    },
    calzolaio(r) {
      const [, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      table(x1 - 2.2, x1 - 0.8, s0 + 0.15, s0 + 0.85); stool(x1 - 1.5, s0 + 1.2); shelves(x1 - 2.4, x1 - 0.9, s1 - 0.3, FY + 0.5, 'hide_brown');
      for (let k = 0; k < 4; k++) bx(k % 2 ? 'hide_black' : 'hide_brown', x1 - 2.0 + k * 0.3, x1 - 1.8 + k * 0.3, s0 + 0.3, s0 + 0.6, FY + 0.8, FY + 0.88);
      sacks(x1 - 0.9, x1, s1 - 0.9, s1 - 0.1); for (let k = 0; k < 4; k++) bx('hide_tan', x1 - 0.5, x1, mid - 0.5 + k * 0.25, mid - 0.3 + k * 0.25, FY, FY + 0.4);
      lamp(x1 - 1.5, mid, ROOM.yc);
    },
    fornaio(r) {
      const [, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      sacks(x1 - 1.0, x1, s0 + 0.1, s0 + 0.9); sacks(x1 - 1.0, x1, s0 + 1.0, s0 + 1.8); table(x1 - 3.0, x1 - 1.4, mid - 0.5, mid + 0.5, 0.8);
      bx('timber', x1 - 2.8, x1 - 2.3, mid - 0.2, mid + 0.2, FY + 0.8, FY + 0.88); cupboard(x1 - 1.0, x1, s1 - 1.0, s1 - 0.1); lamp(x1 - 2.0, mid, ROOM.yc);
    },
    comune(r) {
      const [x0, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      table(x1 - 3.4, x1 - 1.0, mid - 0.45, mid + 0.45); bench(x1 - 3.4, x1 - 1.0, mid - 1.0, mid - 0.6); bench(x1 - 3.4, x1 - 1.0, mid + 0.6, mid + 1.0);
      cupboard(x1 - 0.5, x1, mid - 1.0, mid + 1.0); barrel(x1 - 0.6, s1 - 0.55); lamp(x1 - 2.2, mid, ROOM.yc); picture(x1, mid, FY + 1.5, 'cloth_green');
      void x0;
    },
    ospiti(r) {
      const [, x1, s0, s1] = r;
      bed(x1 - 2.0, x1, s1 - 1.15, s1 - 0.05, 'x', true, 1.1); bed(x1 - 2.0, x1, s0 + 0.05, s0 + 1.15, 'x', true, 1.1); chest(x1 - 2.6, x1 - 2.1, (s0 + s1) / 2 - 0.5, (s0 + s1) / 2 + 0.5);
      crucifix(x1, (s0 + s1) / 2, FY + 1.5); lamp(x1 - 2.2, (s0 + s1) / 2, ROOM.yc);
    },
    dormitorio(r) {
      const [, x1, s0, s1] = r;
      for (let k = 0; k < 4; k++) { const s = s0 + 0.15 + k * 0.95; if (s + 0.8 > s1) break; place([x1 - 2.0, x1, s, s + 0.8], () => { bx('sacking', x1 - 2.0, x1, s, s + 0.8, FY, FY + 0.16, [FY, FY + 0.3]); bx(mats.bed[k % 5], x1 - 1.4, x1 - 0.2, s + 0.04, s + 0.76, FY + 0.16, FY + 0.2); }); }
      for (let k = 0; k < 4; k++) bx(DOOR, x1 - 0.05, x1, s0 + 0.4 + k * 0.8, s0 + 0.46 + k * 0.8, FY + 1.5, FY + 1.56);
      lamp(x1 - 2.4, (s0 + s1) / 2, ROOM.yc);
    },
    nobile(r) {
      const [x0, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      table(x1 - 4.4, x1 - 1.6, mid - 0.55, mid + 0.55, 0.78);
      for (const s of [mid - 0.95, mid + 0.95]) for (const x of [x1 - 3.9, x1 - 3.0, x1 - 2.1]) place([x - 0.25, x + 0.25, s - 0.25, s + 0.25], () => { bx(DOOR, x - 0.22, x + 0.22, s - 0.22, s + 0.22, FY, FY + 0.48, [FY, FY + 0.5]); bx(DOOR, x - 0.22, x + 0.22, s + (s < mid ? -0.22 : 0.17), s + (s < mid ? -0.17 : 0.22), FY + 0.48, FY + 1.1); });
      cupboard(x1 - 0.7, x1, mid - 1.2, mid + 1.2, 2.2); chest(x0 + 1.5, x0 + 2.8, s0 + 0.08, s0 + 0.62); chest(x0 + 1.5, x0 + 2.8, s1 - 0.62, s1 - 0.08);
      picture(x1, mid - 2.0, FY + 1.6, 'cloth_blue', 0.9, 1.2); picture(x1, mid + 2.0, FY + 1.6, 'cloth_red', 0.9, 1.2); lamp(x1 - 3.0, mid, ROOM.yc);
      for (let k = 0; k < 3; k++) jar(x1 - 3.4 + k * 0.5, mid, FY + 0.78, 'glaze_green');
    },
    studio(r) {
      const [x0, x1, s0, s1] = r, mid = (s0 + s1) / 2;
      table(x1 - 1.4, x1 - 0.5, mid - 0.7, mid + 0.7); stool(x1 - 2.0, mid); cupboard(x0 + 0.1, x0 + 0.6, mid - 0.6, mid + 0.6, 2.0); chest(x1 - 0.55, x1 - 0.05, s1 - 1.3, s1 - 0.3);
      for (let k = 0; k < 4; k++) bx(k % 2 ? 'cloth_maroon' : 'cloth_blue', x1 - 1.3 + k * 0.2, x1 - 1.15 + k * 0.2, mid - 0.2, mid + 0.2, FY + 0.76, FY + 0.82);
      lamp(x1 - 1.4, mid, ROOM.yc);
    },
    guardaroba(r) {
      const [x0, x1, s0, s1] = r;
      cupboard(x1 - 0.55, x1, s0 + 0.1, s0 + 1.4, 2.1); chest(x1 - 0.6, x1 - 0.05, s1 - 1.3, s1 - 0.1); chest(x0 + 0.1, x0 + 0.65, s0 + 0.9, s0 + 1.9); lamp((x0 + x1) / 2, (s0 + s1) / 2, ROOM.yc);
    },
  };
  const furnishRoom = (name, r, y, ceil, rich, mir = false) => { ROOM = r; ROOM.yc = ceil; FY = y; MIRX = mir ? r[0] + r[1] : null; KITS[name](r, rich); beams(r, ceil); MIRX = null; ROOM = null; };
  const PROG = {
    dwelling: [['sala', 'cucina'], ['camera', 'camera'], ['rosario', 'deposito']],
    tenement: [['famiglia', 'famiglia'], ['famiglia', 'famiglia'], ['famiglia', 'famiglia']],
    craftsman: [['cucina', 'camera'], [o.trade === 'cobbler' ? 'calzolaio' : 'fornaio', 'camera'], ['deposito', 'deposito']],
    inn: [['comune', 'cucina'], ['ospiti', 'ospiti'], ['dormitorio', 'ospiti']],
    palazzetto: [['nobile', 'camera'], ['camera', 'camera']],
  };
  const prog = PROG[o.up] ?? PROG.dwelling;
  const xB = xOf(bw.u);

  const sFront = (k) => (k === 1 || FLT.length < 2 ? 0.5 : FLT[1].b - 0.02);
  for (let k = 1; k <= m; k++) {
    const y = lv[k], ceil = yc(k), last = k === m, endS = last ? sT : D - TB, pr = prog[Math.min(k - 1, prog.length - 1)];
    const arriveFront = k % 2 === 0, fK = FLT[k - 1];
    zones.length = 0;
    if (casa) {
      const xr0 = P.xb + STR, xr1 = w - T0, Dp = Math.round((0.5 + endS) / 2 * 10) / 10;
      const shaftGaps = arriveFront ? [[0.55, Math.min(1.4, fK.b - 0.05)]] : [];
      along(W_IN, P.xb + STR / 2, 0.5, eMax + 0.02, STR, y, ceil, shaftGaps);
      across(W_IN, P.xb + STR, xr1, Dp, 0.2, y, ceil, [[xr0 + 0.1, xr0 + 1.0]]);
      along(W_IN, (P.col1[1] + P.col2[0]) / 2, sFront(k), eMax + 0.02, STR, y, ceil);
      zone([xr0, xr0 + 1.4, 0.5, endS]); zone([T0, xr0 + 1.2, eMax - 0.3, D - TB]);
      if (k === 1) zone([xB - 0.8, xB + 0.8, 0.5, 2.0]);
      const F = [xr0, xr1, 0.6, Dp - 0.2], K = [xr0, xr1, Dp + 0.2, endS - 0.05];
      furnishRoom(pr[0], F, y, ceil, o.up === 'palazzetto'); furnishRoom(pr[1], K, y, ceil, false);
      if (lights && k === 1) { const q = wrect(M, mx((xr0 + xr1) / 2), -(Dp / 2 + 0.2), mx((xr0 + xr1) / 2), -(Dp / 2 + 0.2)); lights.push({ at: [q[0], y + 2.4, q[1]], color: '#ffc27a', intensity: 2.5, distance: 6 }); }
    } else {
      const xs = P.xs, xb = P.xb, Dp = Math.round((0.5 + endS) / 2 * 10) / 10, xL = xs - 0.3, xR = xb + 0.2;
      const gF = arriveFront ? [[0.65, Math.min(1.5, fK.b - 0.1)]] : [], backGap = !last || !terr ? [[eMax + 0.3, eMax + 1.3]] : [];
      const gaps = [...gF, ...(last && terr ? [] : backGap)];
      const wEnd = last && terr ? eMax + 0.1 : D - TB;
      along(W_IN, xs - 0.15, 0.5, wEnd, 0.3, y, ceil, gaps);
      along(W_IN, xb + 0.1, 0.5, wEnd, 0.2, y, ceil, gaps);
      along(W_IN, (P.col1[1] + P.col2[0]) / 2, sFront(k), eMax + 0.02, STR, y, ceil);
      across(W_IN, T0, xL, Dp, 0.2, y, ceil, [[xL - 3.1, xL - 2.2]]);
      if (!last || !terr) zone([xs, xb, eMax - 0.3, D - TB]);
      zone([xL - 1.4, xL, 0.5, endS]);
      if (k === 1) zone([xB - 0.9, xB + 0.9, 0.5, 2.2]);
      const Fl = [T0, xL, 0.6, Dp - 0.2], Kl = [T0, xL, Dp + 0.2, endS - 0.05], Rr = [xR, w - T0, 0.6, endS - 0.05];
      // (the far wall of the left rooms is the outer wall: the kits want it at x1, so the rooms are mirrored by building them toward the high end)
      const flipRoom = (r) => r;
      furnishRoom(k === 1 ? 'nobile' : 'camera', flipRoom(Fl), y, ceil, k === 2, true); furnishRoom('camera', flipRoom(Kl), y, ceil, k === 1, true);
      furnishRoom(k === 1 ? 'studio' : 'guardaroba', Rr, y, ceil, false);
      if (last && terr) {
        const gt = [[xs + 0.15, xs + COL - 0.15], [xL - 3.1, xL - 2.2], [xR + 0.4, Math.min(xR + 1.4, w - T0 - 0.3)]].filter((g) => g[1] - g[0] > 0.7);
        across(wall, T0, w - T0, sT + 0.2, 0.4, y, H, gt);
        // the altana: a loggia of two piers and a tiled lean-to against the step wall, a bench under it, pots on the parapet
        const s0t = sT + 0.4, ax0 = xs - 4.2, ax1 = xs + 0.4, sp = s0t + 2.4;
        for (const x of [ax0, ax1]) bx(wall, x - 0.2, x + 0.2, sp - 0.2, sp + 0.2, y, y + 2.7, true);
        bx(BEAM, ax0 - 0.3, ax1 + 0.3, sp - 0.12, sp + 0.12, y + 2.7, y + 2.9);
        const rg = box(mx(ax0 - 0.4), 0, -2.9, mx(ax1 + 0.4), 0.09, 0); rg.rotateX(-Math.atan2(0.8, 2.9)); rg.translate(0, y + 3.5, -s0t); L.add('roof_tile', rg);
        bx(DOOR, ax0 + 0.6, ax1 - 0.6, s0t + 0.05, s0t + 0.55, y, y + 0.46, true);
        for (let x = T0 + 0.4; x < w - T0 - 0.3; x += 2.6) lt('terracotta', [[0.001, 0], [0.12, 0.02], [0.16, 0.2], [0.14, 0.3], [0.001, 0.3]], x, D - TB - 0.25, y + 1.05);
        bx('brick', T0, w - T0, D - TB - 0.3, D - TB, y + 0.95, y + 1.05);
      }
    }
  }
  void arch; void ext;
  L.emit(bag, M);
}
