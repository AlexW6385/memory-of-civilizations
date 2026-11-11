// The village of Conques about 1120 (docs/settlements/conques.md §1f–§1h): the houses of schist and yellow
// stone with round-headed doors, windows and shop arches, steep roofs of lauzes; the pilgrims' hostel; stair
// streets, retaining walls, cobbled lanes; the Romanesque fountains and the gate. Elements of the romanesque style.
// Houses are written in their own frame: u along the front (from the left as one faces it), v inward from the
// front, h up; front 's' faces +z, 'n' −z, 'e' +x, 'w' −x.

import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** A convex hexahedron from 8 corners (bottom four, top four in the same order), outward. */
function hexa(out, b, t) {
  const tris = [];
  const q = (a, c, d, e) => tris.push(...a, ...c, ...d, ...a, ...d, ...e);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}

/** The frame of a rectangle with its front: P (u, v) → [x, z]; B a box in (u, v, h) → bag; X an extruded shape. */
function frame(el, bag, col) {
  const [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const T = { s: [-1, 0, x1, 0, -1, z1], n: [1, 0, x0, 0, 1, z0], e: [0, -1, x1, 1, 0, z0], w: [0, 1, x0, -1, 0, z1] }[f];
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => {
    const r = R(u0, v0, u1, v1);
    bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3]));
    if (c) col.rect(r, ya, yb);
  };
  /** An extruded shape (X along u, Y up from y0, Z = v from v0 to v0 + depth). */
  const X = (m, shape, depth, v0, y0) => {
    const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, v0); g.deleteAttribute('uv');
    g.applyMatrix4(new Matrix4().set(T[0], 0, T[1], T[2], 0, 1, 0, y0, T[3], 0, T[4], T[5], 0, 0, 0, 1));
    bag.add(m, g);
  };
  return { L, D, P, R, B, X, f, bag };
}

/** A path of a round-headed opening, its sill at ya, springing at ys. */
function arch(cu, w, ya, ys, n = 8) {
  const p = new Path();
  p.moveTo(cu - w / 2, ya); p.lineTo(cu + w / 2, ya); p.lineTo(cu + w / 2, ys);
  for (let k = 1; k < n; k++) { const t = Math.PI * k / n; p.lineTo(cu + w / 2 * Math.cos(t), ys + w / 2 * Math.sin(t)); }
  p.lineTo(cu - w / 2, ys); p.lineTo(cu - w / 2, ya);
  return p;
}
function wall(L, h, y0, holes) { const s = new Shape(); s.moveTo(0, y0); s.lineTo(L, y0); s.lineTo(L, h); s.lineTo(0, h); s.lineTo(0, y0); for (const p of holes) s.holes.push(p); return s; }

/** Where a shop's arch is: { at: [x, z] on its front line, out: the facade's outward angle (a life element's rot), y }. */
export function shopPoint(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0;
  const mir = rng(l.seed || 1)() < 0.5, a0 = L >= 5.3 ? (mir ? L - 1.9 : 1.9) : L / 2;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  return { at: P(a0, 0), P, a0, out: { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[f], y: l.y };
}

/** The height at which the roof leaves a house's chimney: the top of its stack. */
export function chimneyTop(l) {
  const f = l.front, along = f === 's' || f === 'n', [x0, z0, x1, z1] = l.rect, L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const ytop = l.y + l.G + (l.storeys - 1) * l.G2, span = (l.ridgeAlong ? D : L) + (l.ridgeAlong ? 0.85 : 0.1);
  return ytop - 0.25 + span / 2 * l.pitch + 0.9;
}

// ── the house ────────────────────────────────────────────────────────────────
function maison(el, { bag, col }) {
  const c = frame(el, bag, col), { L, D, B, X, P } = c, rand = rng(el.seed || 1);
  const y = el.y, G = el.G ?? 2.7, G2 = el.G2 ?? 2.4, n = el.storeys ?? 2, S = el.stone || 'schist_rubble', simple = !!el.simple;
  const hostel = !!el.hostel, open = el.open && !simple ? el.open : null, shop = !!el.shop && !hostel, dep = 0.5;
  const ytop = y + G + (n - 1) * G2;
  const mir = rand() < 0.5, U = (u) => (mir ? L - u : u);        // the door's end
  // ── the ground storey: a front wall pierced by the door, the windows and the shop's arch
  const holes = [];
  let du = null, shopA = null;
  if (hostel) du = L / 2;
  else if (shop && L >= 5.3) { shopA = [U(0.6 + 1.3)]; du = U(0.6 + 2.6 + 0.8 + 0.52); }
  else if (shop) shopA = [L / 2];
  else du = L * (0.3 + rand() * 0.4);
  const dw = hostel ? 1.9 : 1.05, dh = hostel ? 2.0 : 1.85;
  if (du !== null) holes.push(arch(du, dw, 0.1, dh));
  if (shopA) holes.push(arch(shopA[0], 2.6, 0.0, 1.25));
  const wins = [];
  if (!shopA || L > 7) {
    const step = hostel ? 2.6 : 2.5, nw = Math.max(0, Math.floor((L - 0.8) / step));
    for (let k = 0; k < nw; k++) {
      const u = (k + 0.5) * L / nw;
      if ((du !== null && Math.abs(u - du) < dw / 2 + 0.55) || (shopA && Math.abs(u - shopA[0]) < 1.3 + 0.55)) continue;
      wins.push(u);
    }
  }
  for (const u of wins) holes.push(arch(u, hostel ? 0.62 : 0.5, 1.0, 1.55));
  const frontShape = wall(L, G, -0.4, holes);
  X(S, frontShape, dep, 0, y);
  const doorCol = du === null ? null : [du - dw / 2, du + dw / 2];
  if (!open) {
    if (shopA) { const sh = wall(L, G, -0.4, [arch(shopA[0], 2.6, 0.0, 1.25)]); X(S, sh, 0.8, dep, y); B(S, 0, 1.3, L, D, y - 0.4, y + G); }
    else B(S, 0, dep, L, D, y - 0.4, y + G);
    col.rect(el.rect, y - 0.5, ytop + 1.5);
  } else {
    const fy = y + 0.1, ceil = y + G;
    B(S, 0, dep, 0.5, D, y - 0.4, ceil); B(S, L - 0.5, dep, L, D, y - 0.4, ceil); B(S, 0.5, D - 0.5, L - 0.5, D, y - 0.4, ceil);
    B('flagstone', 0.5, dep, L - 0.5, D - 0.5, y - 0.4, fy);
    B('timber', 0, 0, L, D, ceil - 0.22, ceil);
    for (let u = 0.9; u < L - 0.5; u += 0.95) B('wood_dark', u - 0.1, dep, u + 0.1, D - 0.5, ceil - 0.46, ceil - 0.22);
    col.floor(c.R(0.5, dep, L - 0.5, D - 0.5), fy);
    const rr = (a, b, e, f2) => col.rect(c.R(a, b, e, f2), y - 0.4, ytop + 1.5);
    rr(0, dep, 0.5, D); rr(L - 0.5, dep, L, D); rr(0.5, D - 0.5, L - 0.5, D);
    rr(0, 0, doorCol[0], dep); rr(doorCol[1], 0, L, dep);
    col.rect(el.rect, ceil - 0.22, ytop + 1.5);
    furnish(c, open, { L, D, fy, ceil, du, shopA, dep, rand });
  }
  // the door: voussoirs of the arch in dressed stone, the step, the leaf of boards (shut unless the house is open)
  if (du !== null) {
    const ring = new Shape(), R0 = dw / 2, R1 = R0 + 0.2, a = Math.PI, ys = dh;
    ring.moveTo(du + R1, ys); ring.lineTo(du + R0, ys);
    for (let k = 1; k < 10; k++) { const t = Math.PI * k / 10; ring.lineTo(du + R0 * Math.cos(t), ys + R0 * Math.sin(t)); }
    ring.lineTo(du - R0, ys); ring.lineTo(du - R1, ys);
    for (let k = 9; k > 0; k--) { const t = Math.PI * k / 10; ring.lineTo(du + R1 * Math.cos(t), ys + R1 * Math.sin(t)); }
    X(el.stone === 'limestone_yellow' ? 'schist_rubble' : 'limestone_yellow', ring, 0.07, -0.06, y);
    void a;
    B('limestone_yellow', du - dw / 2 - 0.1, -0.3, du + dw / 2 + 0.1, dep, y - 0.2, y + 0.1);
    if (!open && !simple) {
      const g = new Shape(); g.moveTo(du - dw / 2 + 0.02, 0.1); g.lineTo(du + dw / 2 - 0.02, 0.1); g.lineTo(du + dw / 2 - 0.02, dh);
      for (let k = 1; k < 8; k++) { const t = Math.PI * k / 8; g.lineTo(du + (dw / 2 - 0.02) * Math.cos(t), dh + (dw / 2 - 0.02) * Math.sin(t)); }
      g.lineTo(du - dw / 2 + 0.02, dh); g.lineTo(du - dw / 2 + 0.02, 0.1);
      X('timber', g, 0.05, dep - 0.12, y);
      B('iron', du + (mir ? 0.3 : -0.3), dep - 0.14, du + (mir ? 0.34 : -0.26), dep - 0.1, y + 1.0, y + 1.04);
    }
  }
  // windows of the ground storey: shutters shut, or the dark opening
  if (!simple) for (const u of wins) {
    if (rand() < 0.5) B('timber', u - 0.23, dep - 0.1, u + 0.23, dep - 0.05, y + 1.0, y + 1.55); else B('opening', u - 0.23, dep - 0.04, u + 0.23, dep - 0.02, y + 1.0, y + 1.55);
    B('limestone_yellow', u - 0.33, -0.09, u + 0.33, 0.12, y + 0.92, y + 1.0);
  }
  // the shop: the arch's voussoirs, a stone counter with its hinged board let down over it, the shelf behind
  if (shopA && !simple) {
    const a0 = shopA[0];
    B('limestone_yellow', a0 - 1.3, 0.0, a0 + 1.3, 0.9, y, y + 0.9);
    B('timber', a0 - 1.45, -0.42, a0 + 1.45, 0.9, y + 0.9, y + 0.96);
    B('limestone_yellow', a0 - 1.55, -0.06, a0 - 1.3, dep, y, y + 1.25);
    B('limestone_yellow', a0 + 1.3, -0.06, a0 + 1.55, dep, y, y + 1.25);
    col.rect(c.R(a0 - 1.45, -0.42, a0 + 1.45, 0.9), y, y + 0.96);
  }
  // string courses between the floors, the upper floors with their windows (single, or twin under one arch with a colonnette)
  for (let i = 1; i < n; i++) {
    const yi = y + G + (i - 1) * G2, wh = [];
    const nw = Math.max(1, Math.floor(L / 2.3)), ws = [];
    for (let k = 0; k < nw; k++) { const u = (k + 0.5) * L / nw; const tw = el.twin && (k % 2 === 0 || nw === 1) && L / nw > 2.1; ws.push([u, tw]); wh.push(arch(u, tw ? 0.95 : 0.55, 0.85, 1.35)); }
    X(S, wall(L, G2, 0, wh), dep, 0, yi);
    B(S, 0, dep, L, D, yi, yi + G2);
    if (!simple) {
      B('limestone_yellow', -0.03, -0.07, L + 0.03, 0.04, yi - 0.1, yi + 0.06);
      for (const [u, tw] of ws) {
        const w = tw ? 0.95 : 0.55;
        if (tw) {
          B('opening', u - w / 2, dep - 0.06, u + w / 2, dep - 0.03, yi + 0.85, yi + 1.6);
          bag.add('limestone_yellow', lathe([[0.05, 0], [0.04, 0.4], [0.055, 0.45], [0.001, 0.45]], 8, null, ...(() => { const p = P(u, 0.25); return [p[0], yi + 0.85, p[1]]; })()));
          B('limestone_yellow', u - 0.08, 0.2, u + 0.08, 0.3, yi + 1.3, yi + 1.42);
        } else if (rand() < 0.5) B('timber', u - w / 2 + 0.02, dep - 0.1, u + w / 2 - 0.02, dep - 0.05, yi + 0.85, yi + 1.45);
        else B('opening', u - w / 2, dep - 0.06, u + w / 2, dep - 0.03, yi + 0.85, yi + 1.45);
        B('limestone_yellow', u - w / 2 - 0.1, -0.1, u + w / 2 + 0.1, 0.12, yi + 0.77, yi + 0.85);
      }
      // a timber gallery on the upper floor's front: planks on beams, posts down to the lane, a rail
      if (el.gallery && i === 1 && !shop && L > 4.4) {
        B('wood_dark', 0.2, -1.05, L - 0.2, 0.0, yi - 0.28, yi - 0.1); B('timber', 0.2, -1.05, L - 0.2, 0.0, yi - 0.1, yi);
        for (const u of [0.3, L / 2, L - 0.3]) B('wood_dark', u - 0.07, -1.0, u + 0.07, -0.86, y, yi - 0.28);
        B('wood_dark', 0.2, -1.04, L - 0.2, -0.98, yi + 0.9, yi + 0.98); B('wood_dark', 0.2, -1.04, L - 0.2, -0.98, yi + 0.4, yi + 0.46);
        for (let u = 0.4; u < L - 0.3; u += 0.7) B('wood_dark', u - 0.025, -1.03, u + 0.025, -0.99, yi, yi + 0.9);
        for (const u of [0.25, L - 0.25]) B('wood_dark', u - 0.06, -1.05, u + 0.06, -0.93, yi, yi + 1.0);
      }
    }
  }
  // ── the roof: two slabs of lauze meeting at the ridge, the gables walled, a stack of stone
  const th = 0.16, oF = 0.5, oB = 0.35, oS = 0.05, p = el.pitch ?? 1.0, ra = el.ridgeAlong !== false;
  const a0 = ra ? -oS : -oF, a1 = (ra ? L : D) + (ra ? oS : oB), c0 = ra ? -oF : -oS, c1 = (ra ? D : L) + (ra ? oB : oS);
  const cm = (c0 + c1) / 2, ye = ytop + 0.03 + 1.4 * th - oF * p * (ra ? 1 : 0) - oS * p * (ra ? 0 : 1), yr = ye + (c1 - c0) / 2 * p;
  const W = (a, cc, h) => { const q = ra ? P(a, cc) : P(cc, a); return [q[0], h, q[1]]; };
  for (const [ca, cb] of [[c0, cm], [c1, cm]]) {
    const top = [W(a0, ca, ye), W(a1, ca, ye), W(a1, cb, yr), W(a0, cb, yr)], bot = top.map((q) => [q[0], q[1] - th, q[2]]);
    const out = []; hexa(out, bot, top); bag.add('lauze', fromTriangles(out));
  }
  bag.add('roof_ridge', (() => { const q = [W(a0 - 0.03, cm - 0.17, yr - 0.1), W(a1 + 0.03, cm - 0.17, yr - 0.1), W(a1 + 0.03, cm + 0.17, yr - 0.1), W(a0 - 0.03, cm + 0.17, yr - 0.1)]; const t = q.map((w) => [w[0], yr + 0.14, w[2]]); const out = []; hexa(out, q, t); return fromTriangles(out); })());
  // the walls up into the gables (a front gable, when the ridge runs to the street, with a round-headed window)
  for (const a of [0, ra ? L : D]) {
    const cA = ra ? 0 : 0, cB = ra ? D : L, half = (cB - cA) / 2, h = half * p;
    const t1 = ra ? [P(a, cA), P(a, cA + half), P(a, cB)] : [P(cA, a), P(cA + half, a), P(cB, a)];
    const base = [t1[0][0], ytop - 0.05, t1[0][1], t1[2][0], ytop - 0.05, t1[2][1], t1[1][0], ytop + h, t1[1][1]];
    const out = [];
    out.push(...base); out.push(...base.slice(6, 9), ...base.slice(3, 6), ...base.slice(0, 3));
    bag.add(S, fromTriangles(out));
  }
  // the chimney: a stack of stone rising through the roof, its cap of slabs
  if (el.chim && !simple) {
    const [cx, cz] = el.chim, top = chimneyTop(el);
    bag.add(S, box(cx - 0.36, ytop - 0.4, cz - 0.3, cx + 0.36, top, cz + 0.3));
    bag.add('limestone_yellow', box(cx - 0.44, top, cz - 0.38, cx + 0.44, top + 0.1, cz + 0.38));
    bag.add('lauze', box(cx - 0.36, top + 0.1, cz - 0.3, cx + 0.36, top + 0.18, cz + 0.3));
  } else if (el.chim) bag.add(S, box(el.chim[0] - 0.36, ytop - 0.4, el.chim[1] - 0.3, el.chim[0] + 0.36, chimneyTop(el), el.chim[1] + 0.3));
  // wall plate under the eave (hides the slit between wall and slab)
  if (!simple) { B('wood_dark', -0.02, -0.04, L + 0.02, 0.04, ytop - 0.1, ytop + 0.08); }
}

// ── what furnishes the open houses ───────────────────────────────────────────
function pot(bag, m, c, u, v, h, r, hh) { const p = c.P(u, v); bag.add(m, lathe([[r * 0.6, 0], [r, hh * 0.45], [r * 0.75, hh * 0.85], [r * 0.55, hh], [0.001, hh]], 10, null, p[0], h, p[1])); }
function barrelAt(bag, c, u, v, h) { const p = c.P(u, v); bag.add('timber', lathe([[0.25, 0], [0.3, 0.22], [0.31, 0.42], [0.3, 0.62], [0.25, 0.84], [0.001, 0.84]], 12, null, p[0], h, p[1])); for (const yy of [0.1, 0.7]) bag.add('iron', lathe([[0.295, 0], [0.295, 0.04], [0.001, 0.04]], 12, null, p[0], h + yy, p[1])); }
function furnish(c, kind, o) {
  const { L, D, fy, ceil, rand, du, shopA, dep } = o, B = (m, u0, v0, u1, v1, ya, yb, k = true) => c.B(m, u0, v0, u1, v1, ya, yb, k);
  const bag = { add: (m, g) => c.bag.add(m, g) };
  const hearth = (u1, vm) => {
    B('schist_rubble', u1 - 1.3, vm - 0.8, u1, vm + 0.8, fy, fy + 0.32);
    B('schist_rubble', u1 - 0.7, vm - 0.6, u1, vm + 0.6, fy + 1.55, ceil);
    B('schist_rubble', u1 - 0.8, vm - 0.7, u1 - 0.7, vm + 0.7, fy + 1.55, fy + 1.7, false);
    pot(bag, 'iron', c, u1 - 0.65, vm, fy + 0.32, 0.24, 0.3);
    B('iron', u1 - 0.66, vm - 0.02, u1 - 0.64, vm + 0.02, fy + 0.62, fy + 1.55, false);
    B('flame', u1 - 1.0, vm - 0.2, u1 - 0.5, vm + 0.2, fy + 0.32, fy + 0.44, false);
  };
  if (kind === 'hostel') {
    // the long hall: straw beds along the back wall and the west end, a hearth at the east end, two long tables, water barrels
    const cols = ['cloth_brown', 'cloth_ochre', 'cloth_grey', 'cloth_red', 'cloth_brown', 'cloth_green'];
    const nb = Math.floor((L - 4.0) / 1.15);
    for (let k = 0; k < nb; k++) {
      const u = 0.6 + k * 1.15;
      B('timber', u, D - 0.5 - 2.0, u + 1.0, D - 0.5, fy, fy + 0.4);
      B('thatch', u + 0.04, D - 0.5 - 1.96, u + 0.96, D - 0.54, fy + 0.4, fy + 0.5, false);
      B(cols[k % cols.length], u + 0.04, D - 0.5 - 1.5, u + 0.96, D - 0.54, fy + 0.5, fy + 0.56, false);
      B('linen', u + 0.12, D - 0.5 - 1.9, u + 0.88, D - 0.5 - 1.62, fy + 0.5, fy + 0.6, false);
    }
    hearth(L - 0.5, D / 2);
    for (const v of [dep + 1.6, dep + 3.3]) { B('timber', 3.0, v - 0.4, L - 4.5, v + 0.4, fy + 0.72, fy + 0.78); for (const u of [3.2, L / 2, L - 4.7]) B('timber', u - 0.05, v - 0.35, u + 0.05, v + 0.35, fy, fy + 0.72, false); }
    for (const v of [dep + 0.8, dep + 2.4, dep + 4.1]) if (v + 0.2 < D - 2.8) B('timber', 3.0, v - 0.18, L - 4.5, v + 0.18, fy + 0.4, fy + 0.45, false);
    for (const [u, v] of [[0.95, dep + 0.5], [1.7, dep + 0.5], [0.95, dep + 1.3]]) barrelAt(bag, c, u, v, fy);
    B('wood_dark', 0.55, dep + 2.2, 1.45, dep + 2.8, fy, fy + 0.5);
    return;
  }
  if (kind === 'shop') {
    const a0 = shopA ? shopA[0] : L / 2, side = du !== null && du > a0 ? -1 : 1;
    // shelves on the back wall with pots and jars, sacks and barrels, a stool, a chest
    B('timber', 0.8, D - 0.85, L - 0.8, D - 0.5, fy + 0.9, fy + 0.95, false);
    B('timber', 0.8, D - 0.85, L - 0.8, D - 0.5, fy + 1.6, fy + 1.65, false);
    for (let u = 1.0; u < L - 1.0; u += 0.32) { pot(bag, rand() < 0.5 ? 'terracotta' : 'pottery_dark', c, u, D - 0.68, fy + 0.95, 0.09, 0.2); if (rand() < 0.7) pot(bag, 'terracotta', c, u + 0.05, D - 0.68, fy + 1.65, 0.08, 0.17); }
    B('wood_dark', 0.7, D - 0.52, 0.78, D - 0.5, fy, fy + 1.7, false); B('wood_dark', L - 0.78, D - 0.85, L - 0.7, D - 0.5, fy, fy + 1.7);
    for (const [u, v] of [[0.95, D - 1.2], [1.65, D - 1.25]]) barrelAt(bag, c, u, v, fy);
    c.B('sacking', L - 1.9, D - 1.3, L - 0.8, D - 0.9, fy, fy + 0.5, true);
    B('wood_dark', L - 1.5, dep + 0.6, L - 0.7, dep + 1.1, fy, fy + 0.5);
    B('timber', a0 + side * 0.9 - 0.2, dep + 1.5, a0 + side * 0.9 + 0.2, dep + 1.9, fy, fy + 0.3, false);
    return;
  }
  // a home: the hearth, a table with a bench, a chest, a bed of boards with straw, a shelf of pots
  hearth(L - 0.5, D / 2);
  B('timber', L / 2 - 0.8, D / 2 - 0.4, L / 2 + 0.6, D / 2 + 0.4, fy + 0.74, fy + 0.8);
  for (const [a, b] of [[-0.75, -0.35], [0.5, -0.35], [-0.75, 0.3], [0.5, 0.3]]) B('timber', L / 2 + a, D / 2 + b, L / 2 + a + 0.06, D / 2 + b + 0.06, fy, fy + 0.74, false);
  B('timber', L / 2 - 0.8, D / 2 - 0.85, L / 2 + 0.6, D / 2 - 0.6, fy + 0.4, fy + 0.45);
  B('wood_dark', 0.6, dep + 0.2, 1.5, dep + 0.8, fy, fy + 0.6);
  B('timber', 0.6, D - 0.5 - 2.0, 1.9, D - 0.55, fy, fy + 0.4); B('thatch', 0.65, D - 0.5 - 1.95, 1.85, D - 0.6, fy + 0.4, fy + 0.5, false); B('cloth_brown', 0.7, D - 1.8, 1.8, D - 0.6, fy + 0.5, fy + 0.54, false);
  B('timber', 0.6, D - 0.85, L - 2.2, D - 0.5, fy + 1.4, fy + 1.45, false);
  for (let u = 2.2; u < L - 2.4; u += 0.35) pot(bag, 'terracotta', c, u, D - 0.68, fy + 1.45, 0.09, 0.2);
  barrelAt(bag, c, L - 1.2, D - 1.2, fy);
}
// (the frame's B knows the bag it writes to, for the furniture's lathes)

// ── the village's works ──────────────────────────────────────────────────────

/** calade: a cobbled lane { x0, x1, z, y, w } — a slab of schist cobbles a little proud of the shelf. */
function calade(el, { bag }) {
  const hw = (el.w ?? 3) / 2;
  bag.add(el.mat || 'pebbles', box(el.x0, el.y - 0.1, el.z - hw, el.x1, el.y + 0.035, el.z + hw));
  if (!el.simple) { bag.add('flagstone', box(el.x0, el.y - 0.1, el.z - hw - 0.12, el.x1, el.y + 0.03, el.z - hw)); bag.add('flagstone', box(el.x0, el.y - 0.1, el.z + hw, el.x1, el.y + 0.03, el.z + hw + 0.12)); }
}

/**
 * stairs: a stair street { x, steps: [{ z0, z1, y0, y1 }], landings: [{ z, y }], shelf (z → the level beside it) }: treads of
 * flagstone, cheeks of rubble on both sides rising to the shelf beside, landings where the lanes cross.
 */
function stairs(el, { bag, col }) {
  const x = el.x, hw = 1.1, ck = 0.5;
  for (const l of el.landings) {
    bag.add('pebbles', box(x - hw, l.y - 1.4, l.z - 1.5, x + hw, l.y + 0.035, l.z + 1.5));
    col.floor([x - hw, l.z - 1.5, x + hw, l.z + 1.5], l.y + 0.035);
  }
  for (const s of el.steps) {
    const n = Math.max(2, Math.round(Math.abs(s.y0 - s.y1) / 0.19)), dz = (s.z1 - s.z0) / n;
    for (let i = 0; i < n; i++) {
      const za = s.z0 + i * dz, zb = za + dz, top = s.y0 + (s.y1 - s.y0) * i / n;       // the tread stands at its uphill edge's level: never under the slope
      const lo = s.y0 + (s.y1 - s.y0) * (i + 1) / n;
      bag.add('flagstone', box(x - hw, lo - 0.3, za, x + hw, top, zb + 0.02));
      col.floor([x - hw, za, x + hw, zb + 0.02], top);
      if (el.simple && i % 2) continue;
      const sh = el.shelf((za + zb) / 2), ctop = Math.max(top + 0.45, sh + 0.12);
      for (const sg of [-1, 1]) {
        const xa = sg < 0 ? x - hw - ck : x + hw, xb = sg < 0 ? x - hw : x + hw + ck;
        bag.add('schist_rubble', box(xa, lo - 0.5, za, xb, ctop - 0.1, zb + 0.02));
        bag.add('limestone_yellow', box(xa - 0.04, ctop - 0.1, za, xb + 0.04, ctop, zb + 0.02));
        col.rect([xa, za, xb, zb + 0.02], lo - 0.5, ctop);
      }
    }
  }
}

/** retain: a retaining wall of rubble with its coping { rect, y0, y1 } (the coping a hand proud of the shelf above). */
function retain(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add('schist_rubble', box(x0, el.y0, z0, x1, el.y1, z1));
  bag.add('limestone_yellow', box(x0 - 0.04, el.y1 - 0.02, z0 - 0.06, x1 + 0.04, el.y1 + 0.13, z1 + 0.06));
  col.rect(el.rect, el.y0, el.y1 + 0.13);
}

/** strip: a paved way over sloping ground { pts: [[x, z, y]…], w } laid on it a hand above. */
function strip(el, { bag }) {
  const hw = (el.w ?? 2.2) / 2, out = [];
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const [ax, az, ay] = el.pts[i], [bx, bz, by] = el.pts[i + 1];
    const A = [ax - hw, ay + 0.05, az], B = [ax + hw, ay + 0.05, az], C = [bx + hw, by + 0.05, bz], D = [bx - hw, by + 0.05, bz];
    out.push(...A, ...D, ...C, ...A, ...C, ...B);
    const dn = (p) => [p[0], p[1] - 0.4, p[2]];
    out.push(...A, ...dn(A), ...dn(D), ...A, ...dn(D), ...D, ...B, ...C, ...dn(C), ...B, ...dn(C), ...dn(B));
  }
  bag.add(el.mat || 'pebbles', fromTriangles(out));
}

/** jardin: a walled yard with its beds { rect, y, seed }: low rubble walls with a coping, ridged beds. */
function jardin(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 1), t = 0.4, h = 1.05;
  const wall4 = [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]];
  wall4.forEach((r, i) => {
    if (i === 1 && el.front === 'n' || i === 0 && el.front === 's') { const m = (r[0] + r[2]) / 2; bag.add('schist_rubble', box(r[0], y - 0.4, r[1], m - 0.6, y + h, r[3])); bag.add('schist_rubble', box(m + 0.6, y - 0.4, r[1], r[2], y + h, r[3])); col.rect([r[0], r[1], m - 0.6, r[3]], y - 0.4, y + h); col.rect([m + 0.6, r[1], r[2], r[3]], y - 0.4, y + h); return; }
    bag.add('schist_rubble', box(r[0], y - 0.4, r[1], r[2], y + h, r[3])); col.rect(r, y - 0.4, y + h);
  });
  bag.add('limestone_yellow', box(x0 - 0.03, y + h, z0 - 0.03, x1 + 0.03, y + h + 0.08, z0 + t + 0.03));
  if (el.simple) return;
  for (let x = x0 + t + 0.7; x < x1 - t - 0.5; x += 1.1) bag.add('sod', box(x, y, z0 + t + 0.6, x + 0.7, y + 0.16 + rand() * 0.1, z1 - t - 0.6));
}

/**
 * fontaine: a Romanesque fountain of the Rouergue { rect, front, y, kind }: spring water runs from a conduit into a
 * stone tank under the street and comes out through a round-headed opening into the trough at the foot of a wall of
 * yellow limestone, a coping to rest the buckets on (Conques tourist office, "The town map").
 */
function fontaine(el, { bag, col }) {
  const c = frame(el, bag, col), { L, D, B, X } = c, y = el.y;
  const hole = arch(L / 2, 1.0, 0.45, 1.25);
  X('limestone_yellow', wall(L, 2.3, -1.0, [hole]), 0.9, 0.3, y);
  B('opening', 0.3, D - 0.1, L - 0.3, D, y + 0.2, y + 2.0);
  const ring = new Shape(), R0 = 0.5, R1 = 0.72, ys = 1.25, cu = L / 2;
  ring.moveTo(cu + R1, ys); ring.lineTo(cu + R0, ys);
  for (let k = 1; k < 10; k++) { const t = Math.PI * k / 10; ring.lineTo(cu + R0 * Math.cos(t), ys + R0 * Math.sin(t)); }
  ring.lineTo(cu - R0, ys); ring.lineTo(cu - R1, ys);
  for (let k = 9; k > 0; k--) { const t = Math.PI * k / 10; ring.lineTo(cu + R1 * Math.cos(t), ys + R1 * Math.sin(t)); }
  X('limestone_yellow', ring, 0.08, 0.2, y + 0.45 - 0.0);
  B('limestone_yellow', -0.1, 1.2, L + 0.1, D + 0.1, y + 2.3, y + 2.45);
  // the trough in front: a basin of limestone, the water in it, the coping along its rim
  B('limestone_yellow', 0.15, -0.9, L - 0.15, 0.3, y - 1.0, y + 0.85, true);
  B('water', 0.35, -0.7, L - 0.35, 0.15, y + 0.8, y + 0.83);
  B('limestone_yellow', 0.1, -0.95, L - 0.1, 0.35, y + 0.85, y + 0.95);
  B('water_jet', L / 2 - 0.03, 0.2, L / 2 + 0.03, 0.26, y + 0.83, y + 1.0);
  B('iron', L / 2 - 0.04, 0.3, L / 2 + 0.04, 0.5, y + 0.95, y + 1.05);
  B('limestone_yellow', 0.2, 0.3, L - 0.2, 1.0, y - 1.0, y + 0.45, true);
  col.rect(c.R(0, 0.3, L, D), y - 0.3, y + 2.45);
}

/** porte: the Rue Charlemagne's gate { x, z, y, w }: a barrel-vaulted passage in a wall of rubble with a round arch of dressed stone (the Porte du Barry). */
function porte(el, { bag, col }) {
  const w = el.w ?? 4.6, hw = w / 2, d = 3.4, H = 6.2, wing = 8, y = el.y;
  const sh = new Shape(); sh.moveTo(-hw - wing, -1.5); sh.lineTo(hw + wing, -1.5); sh.lineTo(hw + wing, 4.2); sh.lineTo(hw + 1.6, 4.2); sh.lineTo(hw + 1.6, H); sh.lineTo(-hw - 1.6, H); sh.lineTo(-hw - 1.6, 4.2); sh.lineTo(-hw - wing, 4.2); sh.lineTo(-hw - wing, -1.5);
  const p = arch(0, w, 0, 2.4, 12); sh.holes.push(p);
  const g = new ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 1 }); g.translate(el.x, y, el.z - d / 2); g.deleteAttribute('uv');
  bag.add('schist_rubble', g);
  for (const zf of [el.z - d / 2 - 0.08, el.z + d / 2]) {
    const ring = new Shape(), R0 = hw, R1 = hw + 0.35;
    ring.moveTo(R1, 2.4); ring.lineTo(R0, 2.4); for (let k = 1; k < 12; k++) { const t = Math.PI * k / 12; ring.lineTo(R0 * Math.cos(t), 2.4 + R0 * Math.sin(t)); }
    ring.lineTo(-R0, 2.4); ring.lineTo(-R1, 2.4); for (let k = 11; k > 0; k--) { const t = Math.PI * k / 12; ring.lineTo(R1 * Math.cos(t), 2.4 + R1 * Math.sin(t)); }
    const r = new ExtrudeGeometry(ring, { depth: 0.08, bevelEnabled: false, curveSegments: 1 }); r.translate(el.x, y, zf); r.deleteAttribute('uv');
    bag.add('limestone_yellow', r);
  }
  bag.add('lauze', box(el.x - hw - wing - 0.1, y + 4.2, el.z - d / 2 - 0.15, el.x - hw - 1.5, y + 4.35, el.z + d / 2 + 0.15));
  bag.add('lauze', box(el.x + hw + 1.5, y + 4.2, el.z - d / 2 - 0.15, el.x + hw + wing + 0.1, y + 4.35, el.z + d / 2 + 0.15));
  col.rect([el.x - hw - wing, el.z - d / 2, el.x - hw, el.z + d / 2], y - 1.5, y + H);
  col.rect([el.x + hw, el.z - d / 2, el.x + hw + wing, el.z + d / 2], y - 1.5, y + H);
  col.rect([el.x - hw, el.z - d / 2, el.x + hw, el.z + d / 2], y + 2.4 + hw, y + H);
  void rod; void lathe;
}

export const villageElements = { maison, calade, stairs, retain, strip, jardin, fontaine, porte };
