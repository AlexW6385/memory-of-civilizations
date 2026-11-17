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
  return { L, D, P, R, B, X, f, bag, col };
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

/** Where an ordinary house's door is (u along the front) and, for a vintner's house, the cellar's: the other end of the front. */
export function doorU(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, L = (f === 's' || f === 'n') ? x1 - x0 : z1 - z0, r = rng(l.seed || 1);
  r(); const du = L * (0.3 + r() * 0.4);
  return { L, du, cellar: du < L / 2 ? L - 1.1 : 1.1 };
}

// ── the house ────────────────────────────────────────────────────────────────
function maison(el, { bag, col, lights }) {
  const c = frame(el, bag, col), { L, D, B, X, P } = c, rand = rng(el.seed || 1);
  const y = el.y, G = el.G ?? 2.7, G2 = el.G2 ?? 2.4, n = el.storeys ?? 2, S = el.stone || 'schist_rubble', simple = !!el.simple;
  const hostel = !!el.hostel, open = el.open && !simple ? el.open : null, shop = !!el.shop && !hostel, dep = 0.5;
  const barn = el.kind === 'grange' && !hostel && !shop, vint = el.kind === 'vintner' && !hostel && !shop && !el.perron && L >= 5.6, ashlar = el.kind === 'ashlar' && !hostel && !shop;
  const ytop = y + G + (n - 1) * G2;
  const mir = rand() < 0.5, U = (u) => (mir ? L - u : u);        // the door's end
  // an outside stair to a door in the upper wall (front 's', wide houses: a stone flight along the front, a landing at the door)
  const perron = !!el.perron && !hostel && !shop && !open && !simple && n > 1 && L >= 7.4 && c.f === 's';
  const perD = mir ? 0.85 : L - 0.85, perS = mir ? [1.35, 4.95] : [L - 4.95, L - 1.35];
  // ── the ground storey: a front wall pierced by the door, the windows and the shop's arch
  const holes = [];
  let du = null, shopA = null;
  if (hostel) du = L / 2;
  else if (shop && L >= 5.3) { shopA = [U(0.6 + 1.3)]; du = U(0.6 + 2.6 + 0.8 + 0.52); }
  else if (shop) shopA = [L / 2];
  else if (barn) du = L / 2;
  else if (perron) du = mir ? L - 1.2 - rand() * 0.6 : 1.2 + rand() * 0.6;
  else du = L * (0.3 + rand() * 0.4);
  const dw = hostel ? 1.9 : barn ? 2.4 : 1.05, dh = hostel ? 2.0 : barn ? 2.3 : 1.85;
  const cu = vint && du !== null ? (du < L / 2 ? L - 1.1 : 1.1) : null;              // a vintner's cellar door, at the other end of the front
  if (du !== null) holes.push(arch(du, dw, 0.1, dh));
  if (cu !== null) holes.push(arch(cu, 1.3, 0.0, 1.3));
  if (shopA) holes.push(arch(shopA[0], 2.6, 0.0, 1.25));
  const wins = [];
  if (barn) wins.push(U(0.9));
  else if (!shopA || L > 7) {
    const step = hostel ? 2.6 : 2.5, nw = Math.max(0, Math.floor((L - 0.8) / step));
    for (let k = 0; k < nw; k++) {
      const u = (k + 0.5) * L / nw;
      if ((du !== null && Math.abs(u - du) < dw / 2 + 0.55) || (shopA && Math.abs(u - shopA[0]) < 1.3 + 0.55) || (cu !== null && Math.abs(u - cu) < 1.2)) continue;
      if (perron && u > perS[0] - 0.5 && u < perS[1] + 1.5 && perS[0] < perS[1]) continue;
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
    furnish(c, open, { L, D, fy, ceil, du, dw, shopA, dep, rand, trade: el.trade, homeKind: el.homeKind ?? 0, barn });
    // the room is lit: a rushlight on its stand near the middle of the room (the hostel's long hall has two), at any hour
    for (const u of open === 'hostel' ? [L * 0.3, L * 0.7] : [L / 2]) { const q = c.P(u, D * 0.55); lights?.push({ at: [q[0], fy + 1.7, q[1]], color: '#ffb46b', intensity: 3, distance: 7 }); }
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
  // a vintner's cellar door: a round arch of dressed stone with its plank leaf, shut, and a stone sill; barrels stand before it (the lane's goods)
  if (cu !== null && !simple) {
    const ring = new Shape(), R0 = 0.65, R1 = 0.85, ys = 1.3;
    ring.moveTo(cu + R1, ys); ring.lineTo(cu + R0, ys);
    for (let k = 1; k < 10; k++) { const t = Math.PI * k / 10; ring.lineTo(cu + R0 * Math.cos(t), ys + R0 * Math.sin(t)); }
    ring.lineTo(cu - R0, ys); ring.lineTo(cu - R1, ys);
    for (let k = 9; k > 0; k--) { const t = Math.PI * k / 10; ring.lineTo(cu + R1 * Math.cos(t), ys + R1 * Math.sin(t)); }
    X('limestone_yellow', ring, 0.07, -0.06, y);
    B('limestone_yellow', cu - 0.85, -0.1, cu - 0.65, 0.02, y, ys); B('limestone_yellow', cu + 0.65, -0.1, cu + 0.85, 0.02, y, ys);
    const g = new Shape(); g.moveTo(cu - 0.63, 0.0); g.lineTo(cu + 0.63, 0.0); g.lineTo(cu + 0.63, ys);
    for (let k = 1; k < 8; k++) { const t = Math.PI * k / 8; g.lineTo(cu + 0.63 * Math.cos(t), ys + 0.63 * Math.sin(t)); }
    g.lineTo(cu - 0.63, ys); g.lineTo(cu - 0.63, 0.0);
    X('wood_dark', g, 0.05, dep - 0.1, y);
    for (const h of [0.4, 1.0]) B('iron', cu - 0.6, dep - 0.11, cu + 0.6, dep - 0.08, y + h, y + h + 0.06);
    B('limestone_yellow', cu - 0.8, -0.3, cu + 0.8, dep, y - 0.2, y + 0.06);
  }
  // an ashlar house: the quoins of red sandstone at both corners of the front in alternating courses, a plinth, a hood of red sandstone over the door
  if (ashlar && !simple) {
    for (let q = 0; q < Math.floor((ytop - y) / 0.5); q++) for (const e of [0, 1]) { const w = q % 2 ? 0.28 : 0.5; B('sandstone_red', e ? L - w + 0.04 : -0.04, -0.05, e ? L + 0.04 : w - 0.04, 0.35, y + q * 0.5, y + q * 0.5 + 0.5); }
    B('sandstone_red', 0.0, -0.07, L, 0.0, y - 0.1, y + 0.45);
    if (du !== null) {
      const hood = new Shape(), R0 = dw / 2 + 0.2, R1 = R0 + 0.16;
      hood.moveTo(du + R1, dh); hood.lineTo(du + R0, dh);
      for (let k = 1; k < 10; k++) { const t = Math.PI * k / 10; hood.lineTo(du + R0 * Math.cos(t), dh + dw / 2 * 0.0 + R0 * Math.sin(t)); }
      hood.lineTo(du - R0, dh); hood.lineTo(du - R1, dh);
      for (let k = 9; k > 0; k--) { const t = Math.PI * k / 10; hood.lineTo(du + R1 * Math.cos(t), dh + R1 * Math.sin(t)); }
      X('sandstone_red', hood, 0.06, -0.12, y);
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
    if (perron && i === 1) wh.push(arch(perD, 1.0, 0.0, 1.65));
    if (barn && i === 1) { ws.push([du, 'hatch']); wh.push(arch(du, 1.1, 0.0, 1.0)); }
    else for (let k = 0; k < nw; k++) { const u = (k + 0.5) * L / nw; if (perron && i === 1 && Math.abs(u - perD) < 1.05) continue; const tw = (el.twin || ashlar) && (ashlar || k % 2 === 0 || nw === 1) && L / nw > 2.1; ws.push([u, tw]); wh.push(arch(u, tw ? 0.95 : 0.55, 0.85, 1.35)); }
    X(S, wall(L, G2, 0, wh), dep, 0, yi);
    B(S, 0, dep, L, D, yi, yi + G2);
    if (!simple) {
      B('limestone_yellow', -0.03, -0.07, L + 0.03, 0.04, yi - 0.1, yi + 0.06);
      for (const [u, tw] of ws) {
        if (tw === 'hatch') {                                    // the hay-loft's door: two leaves of boards, a beam out over it for the hoist
          B('timber', u - 0.52, dep - 0.1, u + 0.52, dep - 0.05, yi, yi + 1.5); B('wood_dark', u - 0.52, dep - 0.12, u + 0.52, dep - 0.1, yi + 0.5, yi + 0.56);
          B('wood_dark', u - 0.06, -0.8, u + 0.06, 0.1, yi + 1.85, yi + 1.97); B('iron', u - 0.03, -0.78, u + 0.03, -0.74, yi + 1.6, yi + 1.85);
          B('limestone_yellow', u - 0.66, -0.06, u + 0.66, 0.1, yi - 0.08, yi + 0.0); continue;
        }
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
      if (el.gallery && !perron && i === 1 && !shop && L > 4.4) {
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
  if (!simple) { B('wood_dark', -0.02, -0.04, L + 0.02, 0.04, ytop - 0.1, ytop + 0.08); dress(c, el, { y, G, G2, n, L, D, du, dw, dh, dep, wins, shopA, shop, hostel, open, perron, perD, perS, mir, ytop, col, barn }); }
}

// ── the fronts dressed at eye level: what a visitor sees at 1–20 m (docs/settlements/conques.md §1i) ──
const fill = (bag, m, c, u, v, h, r, hh) => { const p = c.P(u, v); bag.add(m, lathe([[r * 0.55, 0], [r, hh * 0.4], [r * 0.7, hh], [0.001, hh]], 8, null, p[0], h, p[1])); };
function dress(c, el, o) {
  const { y, G, n, L, D, du, dw, dh, dep, wins, shopA, shop, hostel, open, perron, perD, perS, ytop, col } = o, B = (m, u0, v0, u1, v1, ya, yb, k = false) => c.B(m, u0, v0, u1, v1, ya, yb, k), bag = c.bag;
  const r = rng((el.seed || 1) ^ 0x5bd1e995);
  // the corbel table under the eaves: a row of dressed brackets (the modillons of the region's Romanesque houses)
  for (let u = 0.35; u < L - 0.2; u += 0.62) B('limestone_yellow', u - 0.07, -0.15, u + 0.07, 0.0, ytop - 0.42, ytop - 0.12);
  // a spout of stone at the corner for the roof's water
  if (el.seed % 3 === 0) B('limestone_yellow', L - 0.5, -0.45, L - 0.34, 0.0, ytop - 0.45, ytop - 0.3);
  // the door: strap hinges and studs on the leaf, a latch (shut doors only)
  if (du !== null && !open && !hostel) {
    for (const h of [0.45, 1.3]) B('iron', du - dw / 2 + 0.05, dep - 0.13, du + dw / 2 - 0.05, dep - 0.1, y + h, y + h + 0.07);
    B('iron', du + (o.mir ? 0.34 : -0.3), dep - 0.14, du + (o.mir ? 0.4 : -0.24), dep - 0.1, y + 0.95, y + 1.12);
    // a bench of stone by the door, a mounting block, or a hung braid of garlic and a bundle of herbs
    const pick = r(), side = r() < 0.5 ? -1 : 1, ub = du + side * (dw / 2 + 0.85);
    if (pick < 0.4 && ub > 0.7 && ub < L - 0.7 && !shopA) B('limestone_yellow', ub - 0.6, -0.5, ub + 0.6, -0.04, y, y + 0.46, true);
    else if (pick < 0.62) {
      const uh = du + side * (dw / 2 + 0.3);
      B('iron', uh - 0.02, -0.04, uh + 0.02, 0.0, y + 1.75, y + 1.8);
      B('rope_fibre', uh - 0.012, -0.06, uh + 0.012, -0.04, y + 1.2, y + 1.78);
      for (let k = 0; k < 5; k++) fill(bag, k % 2 ? 'cloth_ochre' : 'linen', c, uh, -0.07 - (k % 2) * 0.03, y + 1.25 + k * 0.1, 0.05, 0.08);
    } else if (pick < 0.78) { fill(bag, 'terracotta', c, du + side * (dw / 2 + 0.4), -0.3, y, 0.16, 0.34); fill(bag, 'palm_leaf', c, du + side * (dw / 2 + 0.4), -0.3, y + 0.32, 0.2, 0.28); }
  }
  // a herder's front: fleeces over a rail; a fisher's: a net hung up to dry, its floats along the top
  if (du !== null && !hostel && (el.kind === 'herder' || el.kind === 'fisher') && !o.barn) {
    const side2 = du < L / 2 ? 1 : -1, ub = du + side2 * (dw / 2 + 0.95);
    if (ub > 0.7 && ub < L - 0.7) {
      if (el.kind === 'herder') {
        for (const e of [-0.55, 0.55]) B('wood_dark', ub + e - 0.03, -0.5, ub + e + 0.03, -0.44, y, y + 1.3);
        B('wood_dark', ub - 0.6, -0.5, ub + 0.6, -0.44, y + 1.3, y + 1.36);
        for (const [e, w] of [[-0.35, 0.3], [0.0, 0.34], [0.38, 0.3]]) B(r() < 0.5 ? 'hide_white' : 'hide_grey', ub + e - w / 2, -0.52, ub + e + w / 2, -0.4, y + 0.6, y + 1.3);
      } else {
        B('rope_fibre', ub - 0.55, -0.09, ub + 0.55, -0.05, y + 0.5, y + 1.95);
        for (let k = 0; k < 6; k++) B('wood_ochre', ub - 0.5 + k * 0.2, -0.12, ub - 0.4 + k * 0.2, -0.04, y + 1.95, y + 2.02);
        B('iron', ub - 0.6, -0.1, ub + 0.6, -0.04, y + 2.02, y + 2.05);
      }
    }
  }
  // the windows of the ground storey: pots of herbs on some sills, a hung bird-cage? no — cloth hung to air on some upper sills
  for (const u of wins) if (r() < 0.45) { fill(bag, r() < 0.5 ? 'terracotta' : 'pottery_dark', c, u, 0.0, y + 1.0, 0.1, 0.14); fill(bag, r() < 0.6 ? 'palm_leaf' : 'flax_leaf', c, u, 0.0, y + 1.12, 0.14, 0.16); }
  if (n > 1 && !o.barn) {
    const yi = y + G, nw = Math.max(1, Math.floor(L / 2.3));
    for (let k = 0; k < nw; k++) {
      const u = (k + 0.5) * L / nw;
      if (perron && Math.abs(u - perD) < 1.05) continue;
      if (r() < 0.35) { fill(bag, 'terracotta', c, u, 0.0, yi + 0.85, 0.09, 0.13); fill(bag, 'flax_leaf', c, u, 0.0, yi + 0.96, 0.13, 0.15); }
      else if (r() < 0.25) { B('cloth_' + ['red', 'ochre', 'white', 'indigo'][Math.floor(r() * 4)], u - 0.22, -0.06, u + 0.22, -0.03, yi + 0.5, yi + 1.1); B('wood_dark', u - 0.24, -0.08, u + 0.24, -0.04, yi + 1.1, yi + 1.14); }
    }
  }
  // iron anchor plates of the tie rods at the floor between the storeys, a pair on the front
  if (n > 1) for (const u of [L * 0.25, L * 0.75]) B('iron', u - 0.14, -0.12, u + 0.14, -0.04, y + G - 0.06, y + G + 0.0);
  // the shop's sign: the bush of the tavern, the horseshoe of the smith, a bracket for the others
  if (shopA) {
    const a0 = shopA[0], T = el.trade, us = a0 + (el.seed % 2 ? -1 : 1) * 1.95;
    if (us > 0.5 && us < L - 0.5) {
      const hy = y + 2.35;
      B('iron', us - 0.02, -0.7, us + 0.02, 0.05, hy, hy + 0.04);
      B('iron', us - 0.015, -0.55, us + 0.015, -0.03, hy - 0.4, hy);
      if (T === 'tavern') { for (const [dx, dz, dy] of [[0, -0.62, 0.2], [0.1, -0.5, 0.05], [-0.1, -0.5, 0.1]]) fill(bag, 'palm_leaf', c, us + dx, dz, hy - 0.5 + dy, 0.22, 0.34); }
      else if (T === 'smith') { for (const [dx, dh2] of [[-0.14, 0], [0.14, 0]]) B('iron', us + dx - 0.02, -0.64, us + dx + 0.02, -0.6, hy - 0.5 + dh2, hy - 0.2); B('iron', us - 0.14, -0.64, us + 0.14, -0.6, hy - 0.54, hy - 0.5); }
      else B(T === 'bread' ? 'hide_tan' : T === 'pots' ? 'terracotta' : T === 'cloth' || T === 'weaver' ? 'cloth_red' : 'wood_ochre', us - 0.28, -0.66, us + 0.28, -0.6, hy - 0.62, hy - 0.2);
    }
  }
  // the perron: the stone flight along the front up to the door of the upper floor, a parapet on its open side
  if (perron) {
    const up = perS[1] > perS[0] && perD > L / 2, ns = Math.round(G / 0.19), run = perS[1] - perS[0], dd = 0.95, dir = up ? 'w' : 'e';
    for (let k = 0; k < ns; k++) {
      const a = up ? perS[0] + run * k / ns : perS[1] - run * (k + 1) / ns, b = a + run / ns, top = y + G * (k + 1) / ns;
      B('flagstone', a, -dd, b, 0.0, y - 0.3, top, false);
      B('schist_rubble', a, -dd, b, -dd + 0.16, top, top + 0.3);
      col.rect(c.R(a, -dd, b, 0), y - 0.3, top - 0.02); col.floor(c.R(a, -dd, b, 0), top);
    }
    const l0 = perD - 0.5, l1 = perD + 0.5;
    B('flagstone', l0, -dd, l1, 0.0, y - 0.3, y + G, false);
    B('schist_rubble', l0, -dd, l1, -dd + 0.16, y + G, y + G + 0.55); B('schist_rubble', up ? l1 - 0.16 : l0, -dd, up ? l1 : l0 + 0.16, 0.0, y + G, y + G + 0.55);
    col.rect(c.R(l0, -dd, l1, 0), y - 0.3, y + G - 0.02); col.floor(c.R(l0, -dd, l1, 0), y + G);
    B('limestone_yellow', perD - 0.62, -0.04, perD + 0.62, 0.1, y + G + 1.72, y + G + 1.8);
    B('timber', perD - 0.46, dep - 0.12, perD + 0.46, dep - 0.07, y + G + 0.02, y + G + 1.65);
    B('iron', perD - 0.42, dep - 0.13, perD + 0.42, dep - 0.1, y + G + 0.5, y + G + 0.57);
    void dir;
  }
}

// ── the workshops: baker, smith, tavern, weaver ──
function trade(c, kind, o) {
  const { L, D, fy, ceil, dep, B, bag, hearth, rand } = o, K = (m, a, b, e, f, g, h) => B(m, a, b, e, f, g, h, true);
  if (kind === 'baker') {
    // the oven of rubble under its dome at the back, its mouth glowing; the kneading trough, a table of loaves, a stack of wood, the peel
    K('schist_rubble', L - 2.4, D - 2.5, L - 0.5, D - 0.5, fy, fy + 0.9);
    bag.add('schist_rubble', lathe([[0.95, 0], [0.9, 0.22], [0.7, 0.46], [0.38, 0.62], [0.001, 0.7]], 14, null, c.P(L - 1.45, D - 1.5)[0], fy + 0.9, c.P(L - 1.45, D - 1.5)[1]));
    B('opening', L - 1.85, D - 2.54, L - 1.05, D - 2.5, fy + 0.95, fy + 1.4, false); B('flame', L - 1.75, D - 2.5, L - 1.15, D - 2.2, fy + 0.98, fy + 1.3, false);
    K('timber', 0.8, D - 1.5, 2.9, D - 0.8, fy + 0.62, fy + 0.72); for (const u of [0.95, 2.75]) B('timber', u, D - 1.4, u + 0.1, D - 0.9, fy, fy + 0.62, false);
    c.B('sacking', 3.2, D - 1.3, 4.0, D - 0.8, fy, fy + 0.6, true);
    K('timber', L / 2 - 1.0, D / 2 - 0.4, L / 2 + 0.9, D / 2 + 0.4, fy + 0.74, fy + 0.8); for (const [a, b] of [[-0.95, -0.35], [0.8, -0.35], [-0.95, 0.3], [0.8, 0.3]]) B('timber', L / 2 + a, D / 2 + b, L / 2 + a + 0.07, D / 2 + b + 0.07, fy, fy + 0.74, false);
    for (let k = 0; k < 9; k++) bag.add('hide_tan', lathe([[0.001, 0], [0.13, 0.01], [0.12, 0.06], [0.07, 0.1], [0.001, 0.11]], 8, null, c.P(L / 2 - 0.8 + (k % 5) * 0.4, D / 2 - 0.2 + Math.floor(k / 5) * 0.4)[0], fy + 0.8, c.P(L / 2 - 0.8 + (k % 5) * 0.4, D / 2 - 0.2 + Math.floor(k / 5) * 0.4)[1]));
    K('wood_dark', 0.55, dep + 0.8, 1.1, dep + 2.0, fy, fy + 1.0);
    B('timber', L - 2.6, D - 2.2, L - 2.56, D - 0.9, fy + 0.5, fy + 1.9, false);
    for (let u = 1.2; u < L - 3; u += 0.4) fill(bag, 'hide_tan', c, u, dep + 0.5 + (u * 7 % 0.5), fy, 0.1, 0.1);
    return;
  }
  if (kind === 'smith') {
    // the forge against the back wall under its hood, the bellows, the anvil on its stump, a tub of water, bars of iron and the tools on the wall
    K('schist_rubble', L / 2 - 1.1, D - 1.7, L / 2 + 1.1, D - 0.5, fy, fy + 0.85);
    K('schist_rubble', L / 2 - 0.7, D - 1.1, L / 2 + 0.7, D - 0.5, fy + 1.9, ceil);
    B('schist_rubble', L / 2 - 0.95, D - 1.45, L / 2 + 0.95, D - 0.5, fy + 1.6, fy + 1.9, false);
    B('flame', L / 2 - 0.45, D - 1.45, L / 2 + 0.45, D - 0.95, fy + 0.85, fy + 1.0, false); B('iron', L / 2 - 0.5, D - 1.5, L / 2 + 0.5, D - 1.46, fy + 0.85, fy + 0.95, false);
    K('hide_brown', L / 2 + 1.3, D - 1.4, L / 2 + 2.0, D - 0.8, fy + 0.45, fy + 1.0); B('iron', L / 2 + 0.9, D - 1.12, L / 2 + 1.3, D - 1.08, fy + 0.7, fy + 0.74, false); B('wood_dark', L / 2 + 1.3, D - 0.8, L / 2 + 2.0, D - 0.7, fy, fy + 1.0, false);
    K('wood_dark', L / 2 - 0.25, D / 2 - 0.6, L / 2 + 0.25, D / 2 - 0.1, fy, fy + 0.55);
    B('iron', L / 2 - 0.35, D / 2 - 0.65, L / 2 + 0.35, D / 2 - 0.05, fy + 0.55, fy + 0.72, false); B('iron', L / 2 + 0.35, D / 2 - 0.4, L / 2 + 0.65, D / 2 - 0.3, fy + 0.66, fy + 0.72, false);
    o.B('timber', 0.8, D - 1.5, 1.6, D - 0.7, fy, fy + 0.6, true); B('water', 0.9, D - 1.4, 1.5, D - 0.8, fy + 0.58, fy + 0.6, false);
    K('wood_dark', 0.55, dep + 0.9, 1.6, dep + 1.3, fy, fy + 0.5); for (let k = 0; k < 6; k++) B('iron', 0.6 + k * 0.16, dep + 0.95, 0.64 + k * 0.16, dep + 1.25, fy + 0.5, fy + 0.62, false);
    for (let k = 0; k < 9; k++) B('iron', 0.6 + k * 0.28, D - 0.53, 0.64 + k * 0.28, D - 0.5, fy + 1.2 + (k % 3) * 0.15, fy + 1.85 + (k % 2) * 0.1, false);
    return;
  }
  if (kind === 'tavern') {
    // two long tables with benches, the counter and casks at the back, hams from the beams, the hearth
    hearth(L - 0.5, D / 2);
    for (const v of [dep + 1.9, dep + 3.4]) { B('timber', 1.4, v - 0.4, L - 3.2, v + 0.4, fy + 0.72, fy + 0.78, true); for (const u of [1.6, L / 2 - 0.6, L - 3.4]) B('timber', u - 0.05, v - 0.35, u + 0.05, v + 0.35, fy, fy + 0.72, false); B('timber', 1.4, v + 0.5, L - 3.2, v + 0.85, fy + 0.4, fy + 0.45, true); if (v < D - 2.5) B('timber', 1.4, v - 0.85, L - 3.2, v - 0.5, fy + 0.4, fy + 0.45, true); for (let k = 0; k < 4; k++) fill(bag, k % 2 ? 'glaze_green' : 'pottery_dark', c, 2.0 + k * 0.9, v + (k % 2) * 0.1, fy + 0.78, 0.06, 0.12); }
    K('timber', 0.6, D - 1.0, 3.4, D - 0.5, fy, fy + 1.0);
    for (const u of [4.0, 4.7, 5.4]) if (u < L - 2.5) { bag.add('timber', lathe([[0.3, 0], [0.36, 0.3], [0.36, 0.7], [0.3, 1.0], [0.001, 1.0]], 12, null, c.P(u, D - 0.9)[0], fy, c.P(u, D - 0.9)[1])); bag.add('iron', lathe([[0.355, 0.15], [0.355, 0.2], [0.001, 0.2]], 12, null, c.P(u, D - 0.9)[0], fy, c.P(u, D - 0.9)[1])); }
    for (let k = 0; k < 4; k++) { const u = 1.5 + k * 1.1; B('rope_fibre', u - 0.01, dep + 2.4, u + 0.01, dep + 2.42, ceil - 0.6, ceil - 0.22, false); bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.1], [0.12, 0.25], [0.07, 0.42], [0.001, 0.47]], 8, null, c.P(u, dep + 2.4)[0], ceil - 1.1, c.P(u, dep + 2.4)[1])); }
    return;
  }
  if (kind === 'weaver') {
    // a loom: two posts, a beam, the warp hung and the cloth woven from the bottom, the stool; baskets of wool, a shelf of bolts
    const u0 = L / 2 - 1.1, u1 = L / 2 + 1.1, v = D - 1.4;
    for (const u of [u0, u1 - 0.1]) K('wood_dark', u, v, u + 0.1, v + 0.1, fy, fy + 2.0);
    B('wood_dark', u0, v - 0.05, u1, v + 0.15, fy + 1.95, fy + 2.05, false); B('wood_dark', u0, v - 0.05, u1, v + 0.15, fy + 0.35, fy + 0.45, false);
    B('linen', u0 + 0.12, v + 0.04, u1 - 0.12, v + 0.06, fy + 0.8, fy + 1.95, false); B('cloth_red', u0 + 0.12, v + 0.03, u1 - 0.12, v + 0.07, fy + 0.45, fy + 0.8, false); B('cloth_indigo', u0 + 0.12, v + 0.03, u1 - 0.12, v + 0.07, fy + 0.62, fy + 0.7, false);
    for (let k = 0; k < 8; k++) B('terracotta', u0 + 0.2 + k * 0.22, v + 0.1, u0 + 0.3 + k * 0.22, v + 0.16, fy + 0.45, fy + 0.6, false);
    K('timber', L / 2 - 0.3, v - 0.9, L / 2 + 0.3, v - 0.5, fy, fy + 0.45);
    for (let k = 0; k < 4; k++) { fill(bag, 'linen', c, 0.9 + k * 0.55, dep + 1.2, fy, 0.22, 0.3); fill(bag, k % 2 ? 'hide_grey' : 'cloth_brown', c, 0.9 + k * 0.55 + 0.1, dep + 1.8, fy, 0.2, 0.28); }
    const cols = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green']; B('timber', L - 2.2, D - 0.85, L - 0.6, D - 0.5, fy + 1.0, fy + 1.05, false);
    for (let k = 0; k < 4; k++) B(cols[k], L - 2.1 + k * 0.38, D - 0.82, L - 1.75 + k * 0.38, D - 0.54, fy + 1.05, fy + 1.4, false);
    void rand;
  }
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
  if (kind === 'mill') {
    // the mill: the stones in their wooden casing at the middle, the hopper above on four posts with its shoe, the meal chest under the spout, sacks of grain and flour, a ladder to the loft
    const cu = L * 0.58, cv = D * 0.5, p = c.P(cu, cv);
    c.col.rect(c.R(cu - 0.95, cv - 0.95, cu + 0.95, cv + 0.95), fy, fy + 1.0);
    bag.add('timber', lathe([[0.001, 0], [0.95, 0], [0.95, 0.62], [0.001, 0.62]], 14, null, p[0], fy, p[1]));
    bag.add('iron', lathe([[0.95, 0.12], [0.97, 0.12], [0.97, 0.17], [0.95, 0.17]], 14, null, p[0], fy, p[1])); bag.add('iron', lathe([[0.95, 0.46], [0.97, 0.46], [0.97, 0.51], [0.95, 0.51]], 14, null, p[0], fy, p[1]));
    bag.add('flagstone', lathe([[0.001, 0], [0.82, 0], [0.82, 0.2], [0.2, 0.27], [0.12, 0.26], [0.001, 0.26]], 18, null, p[0], fy + 0.62, p[1]));
    for (const [a, b] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) { const q = c.P(cu + a, cv + b); bag.add('wood_dark', box(q[0] - 0.05, fy + 0.62, q[1] - 0.05, q[0] + 0.05, fy + 1.95, q[1] + 0.05)); }
    const hq = c.P(cu, cv); const top = [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]].map(([a, b]) => { const q = c.P(cu + a, cv + b); return [q[0], fy + 2.05, q[1]]; });
    const bot = [[-0.18, -0.18], [0.18, -0.18], [0.18, 0.18], [-0.18, 0.18]].map(([a, b]) => { const q = c.P(cu + a, cv + b); return [q[0], fy + 1.3, q[1]]; });
    const hop = []; hexa(hop, bot, top); bag.add('timber', fromTriangles(hop)); void hq;
    const sh = c.P(cu, cv + 0.05); bag.add('wood_dark', box(sh[0] - 0.05, fy + 1.15, sh[1] - 0.45, sh[0] + 0.05, fy + 1.3, sh[1] + 0.05));
    c.B('wood_dark', cu + 1.1, cv - 0.4, cu + 2.0, cv + 0.4, fy, fy + 0.65, true); c.B('timber', cu + 1.05, cv - 0.45, cu + 2.05, cv + 0.45, fy + 0.65, fy + 0.7, false);
    c.B('timber', cu + 0.95, cv - 0.06, cu + 1.15, cv + 0.06, fy + 0.35, fy + 0.4, false);
    for (let k = 0; k < 5; k++) c.B('sacking', 0.6 + (k % 3) * 0.55, dep + 0.2 + Math.floor(k / 3) * 0.5, 1.05 + (k % 3) * 0.55, dep + 0.62 + Math.floor(k / 3) * 0.5, fy, fy + 0.6, true);
    for (let k = 0; k < 4; k++) c.B('linen', L - 1.3, D - 0.5 - 0.55 * (k + 1), L - 0.6, D - 0.5 - 0.55 * k - 0.05, fy, fy + 0.55, true);
    for (let k = 0; k < 7; k++) c.B('wood_dark', 0.55, D - 2.4, 0.62, D - 2.36, fy + k * 0.3, fy + k * 0.3 + 0.04, false);
    c.B('wood_dark', 0.54, D - 2.45, 0.58, D - 2.4, fy, ceil, false); c.B('wood_dark', 0.54, D - 1.8, 0.58, D - 1.75, fy, ceil, false);
    return;
  }
  if (kind === 'shop' && ['baker', 'bread', 'smith', 'tavern', 'weaver'].includes(o.trade)) { trade(c, o.trade === 'bread' ? 'baker' : o.trade, { ...o, B, bag, hearth }); return; }
  if (kind === 'shop') {
    const a0 = shopA ? shopA[0] : L / 2, side = du !== null && du > a0 ? -1 : 1;
    // by trade: the pilgrims' staffs stood in a rack and scrips hung, bolts of cloth, rows of pots on the floor
    if (o.trade === 'staffs' || o.trade === 'shells') {
      for (let k = 0; k < 9; k++) B('wood_ochre', 0.6 + k * 0.17, D - 0.62 - (k % 2) * 0.05, 0.64 + k * 0.17, D - 0.58 - (k % 2) * 0.05, fy, fy + 1.75 + (k % 3) * 0.08, false);
      for (let k = 0; k < 4; k++) fill(bag, 'hide_brown', c, 2.7 + k * 0.28, D - 0.55, ceil - 1.15, 0.1, 0.22);
      B('timber', L - 2.2, D / 2 - 0.4, L - 0.9, D / 2 + 0.4, fy + 0.72, fy + 0.78); for (let k = 0; k < 6; k++) fill(bag, 'ivory', c, L - 2.0 + (k % 3) * 0.4, D / 2 - 0.2 + Math.floor(k / 3) * 0.35, fy + 0.78, 0.1, 0.05);
    } else if (o.trade === 'cloth') {
      const cols = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white'];
      for (let k = 0; k < 5; k++) B(cols[k], 0.7 + k * 0.42, D - 0.95, 1.05 + k * 0.42, D - 0.55, fy + 0.95, fy + 1.3, false);
      for (let k = 0; k < 4; k++) B(cols[(k + 2) % 5], 0.7 + k * 0.5, D - 0.95, 1.1 + k * 0.5, D - 0.55, fy + 1.65, fy + 1.9, false);
      B('timber', L / 2 - 0.9, D / 2 - 0.45, L / 2 + 0.9, D / 2 + 0.45, fy + 0.74, fy + 0.8); B('cloth_red', L / 2 - 0.8, D / 2 - 0.4, L / 2 + 0.3, D / 2 + 0.4, fy + 0.8, fy + 0.9, false);
    } else if (o.trade === 'pots') {
      for (let row = 0; row < 3; row++) for (let u = 1.0; u < L - 1.2; u += 0.55) fill(bag, (u + row) % 1.7 < 0.8 ? 'terracotta' : 'pottery_dark', c, u + row * 0.12, D - 1.8 + row * 0.5, fy, 0.2, 0.4 - row * 0.05);
    }
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
  if (o.barn) {
    // a barn-house: the cart parked beside the door, a stack of hay bales against the back wall, the plough, sacks, a ladder to the loft, rakes and forks on the wall
    const pv = dep + 1.0, cx0 = 0.75, cx1 = Math.min(1.55, L / 2 - 1.5);
    c.B('timber', cx0, pv, cx1, pv + 2.0, fy + 0.5, fy + 0.58, true);
    for (const e of [cx0, cx1 - 0.04]) c.B('wood_dark', e, pv, e + 0.04, pv + 2.0, fy + 0.58, fy + 0.85, false);
    for (const e of [pv + 0.05, pv + 1.95]) c.B('wood_dark', cx0, e - 0.02, cx1, e + 0.02, fy + 0.58, fy + 0.85, false);
    for (const u of [cx0 - 0.04, cx1 + 0.04]) { const a = c.P(u - 0.03, pv + 1.0), b = c.P(u + 0.03, pv + 1.0); c.bag.add('wood_dark', rod([a[0], fy + 0.45, a[1]], [b[0], fy + 0.45, b[1]], 0.45, 14)); }
    for (const e of [cx0 + 0.1, cx1 - 0.1]) { const a = c.P(e, pv), b = c.P(e, pv - 0.8); c.bag.add('wood_dark', rod([a[0], fy + 0.6, a[1]], [b[0], fy + 0.3, b[1]], 0.025, 6)); }
    for (let r2 = 0; r2 < 2; r2++) for (let k = 0; k < 3 - r2; k++) { const u0 = L - 2.8 + k * 0.75 + r2 * 0.375; c.B('thatch', u0, D - 1.5, u0 + 0.72, D - 0.5, fy + r2 * 0.42, fy + 0.42 + r2 * 0.42, true); }
    for (let k = 0; k < 3; k++) { const u0 = L - 2.8 + k * 0.75; c.B('thatch', u0, D - 2.45, u0 + 0.72, D - 1.55, fy, fy + 0.42, true); }
    c.col.rect(c.R(cx0 - 0.1, pv - 0.1, cx1 + 0.1, pv + 2.1), fy, fy + 0.9);
    c.B('wood_dark', 0.7, D - 3.3, 0.78, D - 0.9, fy + 0.5, fy + 0.6, false); c.B('iron', 0.62, D - 1.4, 0.86, D - 0.9, fy + 0.1, fy + 0.5, false);
    for (const e of [D - 0.95, D - 1.3]) { const a = c.P(0.74, e), b = c.P(0.74, e - 0.2); c.bag.add('wood_dark', rod([a[0], fy + 0.5, a[1]], [b[0], fy + 1.2, b[1]], 0.02, 5)); }
    for (let k = 0; k < 4; k++) c.B('sacking', L - 1.35, dep + 0.6 + k * 0.55, L - 0.65, dep + 1.05 + k * 0.55, fy, fy + 0.55, true);
    for (let k = 0; k < 7; k++) c.B('wood_dark', L - 0.55, dep + 3.0, L - 0.5, dep + 3.04, fy + k * 0.3, fy + k * 0.3 + 0.04, false);
    c.B('wood_dark', L - 0.55, dep + 2.95, L - 0.5, dep + 3.0, fy, ceil, false); c.B('wood_dark', L - 0.55, dep + 3.55, L - 0.5, dep + 3.6, fy, ceil, false);
    for (let k = 0; k < 5; k++) c.B('wood_dark', 2.3 + k * 0.22, D - 0.53, 2.34 + k * 0.22, D - 0.5, fy + 0.5, fy + 1.95 - (k % 2) * 0.2, false);
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
  const hk = o.homeKind;
  if (hk === 3) {
    // a vintner's: the casks in a row along the back wall, a wine press of beams and a screw at the front, a tub for the must
    for (let u = 2.5; u < L - 2.2; u += 0.75) barrelAt(bag, c, u, D - 1.15, fy);
    const pv = dep + 1.5;
    c.B('timber', 0.55, pv, 1.35, pv + 1.1, fy + 0.12, fy + 0.3, true);
    for (const e of [0.57, 1.23]) for (const f of [pv + 0.03, pv + 0.97]) c.B('wood_dark', e, f, e + 0.1, f + 0.1, fy + 0.3, fy + 1.9, false);
    c.B('wood_dark', 0.57, pv + 0.03, 1.33, pv + 0.13, fy + 1.8, fy + 1.95, false); c.B('wood_dark', 0.57, pv + 0.97, 1.33, pv + 1.07, fy + 1.8, fy + 1.95, false);
    const sp = c.P(0.95, pv + 0.55); c.bag.add('wood_dark', lathe([[0.001, 0], [0.07, 0], [0.07, 0.95], [0.001, 0.95]], 8, null, sp[0], fy + 0.9, sp[1]));
    c.B('timber', 0.7, pv + 0.2, 1.2, pv + 0.9, fy + 0.3, fy + 0.8, false); c.B('timber', 0.62, pv + 0.15, 1.28, pv + 0.95, fy + 0.8, fy + 0.88, false);
    c.B('wood_dark', 0.6, pv + 0.52, 1.32, pv + 0.58, fy + 1.45, fy + 1.52, false);
    c.col.rect(c.R(0.55, pv, 1.35, pv + 1.1), fy, fy + 1.9);
    barrelAt(bag, c, 0.95, pv + 1.65, fy);
  } else if (hk === 5) {
    // a herder's: a rail of fleeces along the wall, a rack of cheeses on a board, a churn and a pail
    c.B('wood_dark', 0.5, dep + 1.2, 0.56, dep + 3.0, fy + 1.5, fy + 1.56, false);
    for (let k = 0; k < 4; k++) c.B(k % 2 ? 'hide_grey' : 'hide_white', 0.56, dep + 1.25 + k * 0.45, 0.72, dep + 1.6 + k * 0.45, fy + 0.75, fy + 1.5, false);
    c.B('timber', 2.2, D - 1.55, L - 2.5, D - 1.2, fy + 0.9, fy + 0.95, false); for (const e of [2.25, L - 2.55]) c.B('wood_dark', e, D - 1.5, e + 0.05, D - 1.25, fy, fy + 0.9, false);
    for (let u = 2.45; u < L - 2.6; u += 0.34) fill(bag, 'hide_white', c, u, D - 1.38, fy + 0.95, 0.13, 0.09);
    const ch = c.P(L - 2.3, D - 1.15); bag.add('wood_dark', lathe([[0.17, 0], [0.19, 0.1], [0.15, 0.85], [0.001, 0.85]], 10, null, ch[0], fy, ch[1]));
    pot(bag, 'terracotta', c, L / 2 - 1.2, D / 2 - 1.3, fy, 0.14, 0.22);
  } else if (hk === 6) {
    // a fisher's: a net hung on the wall with its floats, creels of wicker, fish hung to dry on a pole
    c.B('rope_fibre', 0.5, dep + 1.2, 0.54, dep + 3.2, fy + 0.5, fy + 2.0, false);
    for (let k = 0; k < 5; k++) c.B('wood_ochre', 0.5, dep + 1.3 + k * 0.4, 0.58, dep + 1.45 + k * 0.4, fy + 2.0, fy + 2.06, false);
    for (const [u, v] of [[0.95, dep + 3.5], [1.45, dep + 3.4], [0.9, dep + 4.0]]) fill(bag, 'wicker', c, u, v, fy, 0.22, 0.4);
    c.B('wood_dark', 1.9, dep + 1.0, L - 2.4, dep + 1.06, fy + 1.9, fy + 1.97, false);
    for (let u = 2.1; u < L - 2.5; u += 0.3) { const q = c.P(u, dep + 1.03); bag.add('hide_grey', lathe([[0.001, 0], [0.03, 0.03], [0.045, 0.11], [0.022, 0.2], [0.001, 0.23]], 6, null, q[0], fy + 1.68, q[1])); }
  } else if (hk === 1) {
    // a second bed, a cradle, a ladder to the loft, a spinner's stool with her basket of wool
    B('timber', L - 2.6, D - 0.5 - 2.0, L - 1.5, D - 0.55, fy, fy + 0.4); B('thatch', L - 2.55, D - 0.5 - 1.95, L - 1.55, D - 0.6, fy + 0.4, fy + 0.5, false); B('cloth_ochre', L - 2.5, D - 1.8, L - 1.6, D - 0.6, fy + 0.5, fy + 0.54, false);
    B('wood_dark', 1.9, D - 1.3, 2.5, D - 0.7, fy + 0.15, fy + 0.5); B('linen', 1.95, D - 1.25, 2.45, D - 0.75, fy + 0.5, fy + 0.54, false);
    for (let k = 0; k < 7; k++) B('wood_dark', 0.55, dep + 1.0, 0.62, dep + 1.04, fy + k * 0.3, fy + k * 0.3 + 0.04, false);
    B('wood_dark', 0.54, dep + 1.0, 0.58, dep + 1.04, fy, ceil, false); B('wood_dark', 0.54, dep + 1.7, 0.58, dep + 1.74, fy, ceil, false);
    B('timber', L / 2 + 0.9, dep + 0.9, L / 2 + 1.2, dep + 1.2, fy, fy + 0.4, false); fill(bag, 'linen', c, L / 2 + 1.05, dep + 1.05, fy + 0.4, 0.2, 0.2);
  } else if (hk === 2) {
    // a farmer's: sacks stacked, a trough, a rack of tools, a pen of straw at the back for a beast, a yoke on the wall
    for (let k = 0; k < 5; k++) c.B('sacking', 0.55 + (k % 3) * 0.5, dep + 0.2 + Math.floor(k / 3) * 0.45, 0.95 + (k % 3) * 0.5, dep + 0.55 + Math.floor(k / 3) * 0.45, fy, fy + 0.55, true);
    B('timber', L - 3.3, D - 2.6, L - 0.6, D - 2.5, fy, fy + 0.9, true); B('thatch', L - 3.2, D - 2.5, L - 0.6, D - 0.55, fy, fy + 0.18, false);
    B('wood_dark', L / 2 - 1.0, dep + 0.2, L / 2 + 0.2, dep + 0.5, fy + 0.3, fy + 0.5, false);
    for (let k = 0; k < 5; k++) B('wood_dark', 2.0 + k * 0.2, D - 0.55, 2.04 + k * 0.2, D - 0.5, fy + 0.4, fy + 1.9, false);
    B('wood_dark', 3.3, D - 0.55, 4.2, D - 0.5, fy + 1.7, fy + 1.78, false);
  }
}
// (the frame's B knows the bag it writes to, for the furniture's lathes)

// ── the village's works ──────────────────────────────────────────────────────

/** calade: a cobbled lane { x0, x1, z, y, w } — a slab of schist cobbles a little proud of the shelf, a gutter of dressed stone along its middle, weeds at the feet of the walls. */
function calade(el, { bag }) {
  const hw = (el.w ?? 3) / 2;
  bag.add(el.mat || 'pebbles', box(el.x0, el.y - 0.1, el.z - hw, el.x1, el.y + 0.035, el.z + hw));
  if (!el.simple) {
    bag.add('flagstone', box(el.x0, el.y - 0.1, el.z - hw - 0.12, el.x1, el.y + 0.03, el.z - hw)); bag.add('flagstone', box(el.x0, el.y - 0.1, el.z + hw, el.x1, el.y + 0.03, el.z + hw + 0.12));
    // the gutter: two dressed kerbs with the cobbles sunk between (the water of the roofs runs down the lane)
    for (const dz of [-0.17, 0.17]) bag.add('flagstone', box(el.x0, el.y, el.z + dz - 0.05, el.x1, el.y + 0.06, el.z + dz + 0.05));
    const rand = rng(Math.floor(el.x0 * 7 + el.z * 13) >>> 0 || 3);
    for (let x = el.x0 + 1 + rand() * 4; x < el.x1 - 1; x += 5 + rand() * 7) {
      const s = rand() < 0.5 ? -1 : 1, len = 0.8 + rand() * 1.8;
      bag.add('sod', box(x, el.y + 0.02, s < 0 ? el.z - hw : el.z + hw - 0.22, x + len, el.y + 0.06 + rand() * 0.04, s < 0 ? el.z - hw + 0.22 : el.z + hw));
    }
  }
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

/**
 * jardin: a walled yard { rect, y, seed }: low rubble walls with a coping, and by the seed one of four: ridged vegetable beds with
 * cabbages; vines on posts and wires (the terraces of the Rouergue were planted with vines); an orchard yard with straw skeps on a
 * stone bench and a hut of stone; or a pen with straw, a trough and a hay rick.
 */
function jardin(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 1), t = 0.4, h = 1.05;
  const wall4 = [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]];
  wall4.forEach((r, i) => {
    if (i === 1 && el.front === 'n' || i === 0 && el.front === 's') { const m = (r[0] + r[2]) / 2; bag.add('schist_rubble', box(r[0], y - 0.4, r[1], m - 0.6, y + h, r[3])); bag.add('schist_rubble', box(m + 0.6, y - 0.4, r[1], r[2], y + h, r[3])); col.rect([r[0], r[1], m - 0.6, r[3]], y - 0.4, y + h); col.rect([m + 0.6, r[1], r[2], r[3]], y - 0.4, y + h); return; }
    bag.add('schist_rubble', box(r[0], y - 0.4, r[1], r[2], y + h, r[3])); col.rect(r, y - 0.4, y + h);
  });
  bag.add('limestone_yellow', box(x0 - 0.03, y + h, z0 - 0.03, x1 + 0.03, y + h + 0.08, z0 + t + 0.03));
  if (el.simple) return;
  const kind = (el.seed >>> 3) % 4, ix0 = x0 + t, ix1 = x1 - t, iz0 = z0 + t, iz1 = z1 - t, cx = (ix0 + ix1) / 2, cz = (iz0 + iz1) / 2;
  if (kind === 0) {
    for (let x = ix0 + 0.7; x < ix1 - 0.5; x += 1.1) {
      bag.add('sod', box(x, y, iz0 + 0.6, x + 0.7, y + 0.16 + rand() * 0.1, iz1 - 0.6));
      for (let z = iz0 + 0.9; z < iz1 - 0.7; z += 0.55) bag.add('palm_leaf', lathe([[0.04, 0], [0.17, 0.08], [0.15, 0.2], [0.001, 0.22]], 7, null, x + 0.35, y + 0.2, z));
    }
  } else if (kind === 1) {
    // vines: rows of posts with two wires, the vines low and leafy between them
    for (let x = ix0 + 0.8; x < ix1 - 0.5; x += 1.3) {
      for (let z = iz0 + 0.5; z < iz1 - 0.4; z += 2.2) bag.add('wood_dark', box(x - 0.03, y, z - 0.03, x + 0.03, y + 1.3, z + 0.03));
      for (const hy of [0.55, 1.2]) bag.add('iron', box(x - 0.006, y + hy, iz0 + 0.5, x + 0.006, y + hy + 0.012, iz1 - 0.5));
      for (let z = iz0 + 0.7; z < iz1 - 0.6; z += 0.5) bag.add('palm_leaf', lathe([[0.1, 0], [0.22, 0.25], [0.2, 0.6], [0.001, 0.75]], 6, null, x, y + 0.1 + rand() * 0.1, z));
      bag.add('sod', box(x - 0.25, y, iz0 + 0.5, x + 0.25, y + 0.08, iz1 - 0.5));
    }
  } else if (kind === 2) {
    // straw skeps on a bench of stone, a hut of stone with a roof of lauze, the beds beside
    const bx = ix0 + 0.6, bz = iz0 + 0.8;
    bag.add('limestone_yellow', box(bx, y, bz, bx + 2.0, y + 0.5, bz + 0.45));
    for (let k = 0; k < 3; k++) bag.add('thatch', lathe([[0.2, 0], [0.19, 0.12], [0.14, 0.24], [0.06, 0.32], [0.001, 0.36]], 9, null, bx + 0.35 + k * 0.65, y + 0.5, bz + 0.22));
    const hx = Math.max(ix0 + 0.3, ix1 - 2.6), hz = Math.max(iz0 + 0.3, iz1 - 2.3);
    if (hx + 2.2 < ix1 && hz + 2.0 < iz1) { bag.add('schist_rubble', box(hx, y - 0.3, hz, hx + 2.2, y + 1.9, hz + 2.0)); bag.add('opening', box(hx + 0.8, y, hz - 0.02, hx + 1.5, y + 1.5, hz + 0.02)); bag.add('lauze', box(hx - 0.2, y + 1.9, hz - 0.2, hx + 2.4, y + 2.08, hz + 2.2)); bag.add('lauze', box(hx + 0.2, y + 2.08, hz, hx + 2.0, y + 2.22, hz + 2.0)); col.rect([hx, hz, hx + 2.2, hz + 2.0], y - 0.3, y + 2.3); }
    for (let x = ix0 + 0.8; x < ix1 - 3.2; x += 1.2) bag.add('sod', box(x, y, cz - 0.2, x + 0.7, y + 0.14, iz1 - 0.6));
  } else {
    // a pen: straw on the ground, a trough of stone, a rick of hay against the wall
    bag.add('thatch', box(ix0 + 0.4, y, iz0 + 0.4, ix1 - 0.4, y + 0.1, iz1 - 0.4));
    bag.add('limestone_yellow', box(cx - 0.8, y, iz1 - 0.9, cx + 0.8, y + 0.45, iz1 - 0.45)); bag.add('water', box(cx - 0.7, y + 0.4, iz1 - 0.85, cx + 0.7, y + 0.42, iz1 - 0.5));
    const rx = ix0 + 1.0, rz = iz0 + 1.0;
    bag.add('thatch', lathe([[1.0, 0], [1.1, 0.5], [0.9, 1.2], [0.5, 1.8], [0.001, 2.1]], 10, null, rx, y, rz)); col.circle(rx, rz, 1.0, y, y + 2);
  }
}

/** croix: a stone cross on its steps { at, y, h } (the calvary of a pilgrims' square): three steps, a plinth, a shaft, the arms. */
function croix(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h ?? 3.4;
  for (let k = 0; k < 3; k++) bag.add('limestone_yellow', box(x - 1.3 + k * 0.3, y - 0.4, z - 1.3 + k * 0.3, x + 1.3 - k * 0.3, y + 0.17 * (k + 1), z + 1.3 - k * 0.3));
  bag.add('limestone_yellow', box(x - 0.45, y + 0.51, z - 0.45, x + 0.45, y + 1.1, z + 0.45));
  bag.add('limestone_yellow', box(x - 0.13, y + 1.1, z - 0.13, x + 0.13, y + H, z + 0.13));
  bag.add('limestone_yellow', box(x - 0.55, y + H - 1.0, z - 0.1, x + 0.55, y + H - 0.76, z + 0.1));
  bag.add('limestone_yellow', box(x - 0.18, y + H, z - 0.18, x + 0.18, y + H + 0.08, z + 0.18));
  col.rect([x - 1.3, z - 1.3, x + 1.3, z + 1.3], y - 0.4, y + 0.51); col.circle(x, z, 0.5, y, y + H);
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


/**
 * roue { c: [x, z] (the wheel's middle, at its nearer face), y (the axle), r, w (the width along z), pier: z (where the axle's far end rests), wall: z (the mill wall it leaves),
 * bed: y (the foot of the pier and the cheeks) }: an undershot waterwheel in the stream, flat against the mill's wall — two rims, eight spokes
 * at each, boards between; the axle through the wall to a stone pier; stone cheeks either side. The stream runs along x (docs/settlements/conques.md §1k).
 */
function roue(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, r = el.r ?? 2.1, w = el.w ?? 1.2, z0 = cz, z1 = cz + w, out = [], N = 20;
  const P = (a, rr, s, z) => [cx + Math.cos(a) * rr - Math.sin(a) * s, y + Math.sin(a) * rr + Math.cos(a) * s, z];
  for (const [za, zb] of [[z0, z0 + 0.1], [z1 - 0.1, z1]]) for (let i = 0; i < N; i++) {
    const a = Math.PI * 2 * i / N, b = Math.PI * 2 * (i + 1) / N;
    hexa(out, [P(a, r - 0.14, 0, za), P(a, r, 0, za), P(b, r, 0, za), P(b, r - 0.14, 0, za)], [P(a, r - 0.14, 0, zb), P(a, r, 0, zb), P(b, r, 0, zb), P(b, r - 0.14, 0, zb)]);
  }
  for (const [za, zb] of [[z0 + 0.1, z0 + 0.16], [z1 - 0.16, z1 - 0.1]]) for (let k = 0; k < 8; k++) {
    const a = Math.PI * 2 * k / 8;
    hexa(out, [P(a, 0.14, -0.05, za), P(a, r - 0.14, -0.05, za), P(a, r - 0.14, 0.05, za), P(a, 0.14, 0.05, za)], [P(a, 0.14, -0.05, zb), P(a, r - 0.14, -0.05, zb), P(a, r - 0.14, 0.05, zb), P(a, 0.14, 0.05, zb)]);
  }
  bag.add('timber', fromTriangles(out));
  const pad = [];
  for (let k = 0; k < 16; k++) { const a = Math.PI * 2 * (k + 0.5) / 16; hexa(pad, [P(a, r - 0.2, -0.03, z0 + 0.1), P(a, r + 0.12, -0.03, z0 + 0.1), P(a, r + 0.12, 0.03, z0 + 0.1), P(a, r - 0.2, 0.03, z0 + 0.1)], [P(a, r - 0.2, -0.03, z1 - 0.1), P(a, r + 0.12, -0.03, z1 - 0.1), P(a, r + 0.12, 0.03, z1 - 0.1), P(a, r - 0.2, 0.03, z1 - 0.1)]); }
  bag.add('wood_dark', fromTriangles(pad));
  const wallZ = el.wall ?? z0 - 0.05, pierZ = el.pier ?? z1 + 0.5;
  bag.add('wood_dark', rod([cx, y, wallZ], [cx, y, pierZ + 0.3], 0.13, 10));
  bag.add('iron', rod([cx, y, z0 + 0.06], [cx, y, z0 + 0.1], 0.2, 10)); bag.add('iron', rod([cx, y, z1 - 0.1], [cx, y, z1 - 0.06], 0.2, 10));
  const bed = el.bed ?? y - 6;
  bag.add('schist_rubble', box(cx - 0.35, bed, pierZ, cx + 0.35, y + 0.55, pierZ + 0.6)); col.rect([cx - 0.35, pierZ, cx + 0.35, pierZ + 0.6], bed, y + 0.55);
  bag.add('limestone_yellow', box(cx - 0.42, y + 0.55, pierZ - 0.04, cx + 0.42, y + 0.65, pierZ + 0.64));
  for (const sg of [-1, 1]) {
    const xa = cx + sg * (r + 0.3), x0 = Math.min(xa, xa + sg * 0.35), x1 = Math.max(xa, xa + sg * 0.35);
    bag.add('schist_rubble', box(x0, bed, wallZ, x1, y + 0.6, pierZ + 0.6)); col.rect([x0, wallZ, x1, pierZ + 0.6], bed, y + 0.6);
  }
  col.rect([cx - r - 0.3, wallZ, cx + r + 0.3, z1 + 0.1], y - r + 0.3, y + r);
}

/**
 * tannerie { rect: [x0, z0, x1, z1], y }: a tanner's yard on its terrace — a parapet round it with the gate at the north-east corner, stone-curbed tanks of liquor with hides in them,
 * two wooden tubs, scraping beams with a hide over each, frames of hides drying, stacks of oak bark, a lean-to shed with the hearth and the copper (docs/settlements/conques.md §1k).
 */
function tannerie(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 7);
  const B = (m, a, b, c, d, ya, yb, k = false) => { bag.add(m, box(a, ya, b, c, yb, d)); if (k) col.rect([a, b, c, d], ya, yb); };
  const rodC = (m, a, b, r2, n = 8) => bag.add(m, rod(a, b, r2, n));
  const tank = (cx, cz, w, d) => {
    B('schist_rubble', cx - w / 2, cz - d / 2, cx + w / 2, cz - d / 2 + 0.16, y, y + 0.6, true); B('schist_rubble', cx - w / 2, cz + d / 2 - 0.16, cx + w / 2, cz + d / 2, y, y + 0.6, true);
    B('schist_rubble', cx - w / 2, cz - d / 2 + 0.16, cx - w / 2 + 0.16, cz + d / 2 - 0.16, y, y + 0.6, true); B('schist_rubble', cx + w / 2 - 0.16, cz - d / 2 + 0.16, cx + w / 2, cz + d / 2 - 0.16, y, y + 0.6, true);
    B('hide_brown', cx - w / 2 + 0.16, cz - d / 2 + 0.16, cx + w / 2 - 0.16, cz + d / 2 - 0.16, y, y + 0.46);
    B('limestone_yellow', cx - w / 2 - 0.04, cz - d / 2 - 0.04, cx + w / 2 + 0.04, cz - d / 2 + 0.2, y + 0.6, y + 0.66);
    if (rand() < 0.7) { const hx = cx - w / 2 + 0.3 + rand() * (w - 0.9); B(rand() < 0.5 ? 'hide_tan' : 'hide_grey', hx, cz - d / 2 + 0.25, hx + 0.5, cz + d / 2 - 0.25, y + 0.46, y + 0.5); }
  };
  // the parapet, with the gate at the north-east corner (the way in from the road)
  const T = 0.4, H = 0.9, gz = z0 + 2.4;
  B('schist_rubble', x0 - T, z0 - T, x0, z1 + T, y, y + H, true);                                     // west
  B('schist_rubble', x0, z1, x1 + T, z1 + T, y, y + H, true);                                         // south
  B('schist_rubble', x0, z0 - T, x1 + T, z0, y, y + H, true);                                         // north
  B('schist_rubble', x1, gz, x1 + T, z1, y, y + H, true);                                             // east, below the gate
  // tanks of two sizes along the south wall, two round tubs
  for (let k = 0; k < 4; k++) tank(x0 + 1.3 + k * 2.2, z1 - 1.0, 1.8, 1.3);
  for (const [dx, dz] of [[1.5, 3.6], [3.7, 3.7]]) {
    const q = [x0 + dx, z1 - dz]; bag.add('timber', lathe([[0.7, 0], [0.74, 0.5], [0.72, 0.9], [0.64, 0.9], [0.64, 0.8], [0.001, 0.8]], 14, null, q[0], y, q[1]));
    bag.add('iron', lathe([[0.74, 0.2], [0.76, 0.2], [0.76, 0.26], [0.74, 0.26]], 14, null, q[0], y, q[1])); col.circle(q[0], q[1], 0.76, y, y + 0.9);
  }
  // two scraping beams: a half-round log on trestles, sloping, a hide laid over it
  for (const [bx, bz] of [[x0 + 7.4, z0 + 4.2], [x0 + 7.4, z0 + 6.0]]) {
    rodC('wood_dark', [bx, y + 0.35, bz], [bx + 1.9, y + 1.05, bz], 0.15, 8);
    for (const [e, h] of [[0.2, 0.45], [1.7, 0.95]]) { B('wood_dark', bx + e - 0.04, bz - 0.2, bx + e + 0.04, bz - 0.12, y, y + h); B('wood_dark', bx + e - 0.04, bz + 0.12, bx + e + 0.04, bz + 0.2, y, y + h); }
    col.rect([bx - 0.1, bz - 0.25, bx + 2.0, bz + 0.25], y, y + 1.15);
    B('hide_grey', bx + 0.6, bz - 0.24, bx + 1.5, bz + 0.24, y + 0.72, y + 0.76);
  }
  // frames of hides drying: two posts, two poles, hides hung from the upper one
  for (const [fx, fz] of [[x0 + 1.4, z0 + 1.2], [x0 + 5.6, z0 + 1.2]]) {
    for (const e of [0, 3.2]) B('wood_dark', fx + e - 0.06, fz - 0.06, fx + e + 0.06, fz + 0.06, y, y + 2.3, true);
    B('wood_dark', fx - 0.08, fz - 0.04, fx + 3.28, fz + 0.04, y + 2.2, y + 2.28); B('wood_dark', fx - 0.08, fz - 0.04, fx + 3.28, fz + 0.04, y + 1.45, y + 1.52);
    for (let k = 0; k < 5; k++) B(['hide_brown', 'hide_tan', 'hide_brown', 'hide_grey', 'hide_tan'][k], fx + 0.2 + k * 0.58, fz - 0.03, fx + 0.7 + k * 0.58, fz + 0.03, y + 1.05 + (k % 2) * 0.12, y + 2.2);
  }
  // stacks of oak bark by the gate
  for (const [bx, bz] of [[x1 - 3.4, z0 + 4.2]]) for (let lv = 0; lv < 3; lv++) for (let k = 0; k < 3 - lv; k++) B('bark_dark', bx + lv * 0.5 + k * 1.0, bz, bx + lv * 0.5 + k * 1.0 + 0.95, bz + 1.4, y + lv * 0.4, y + 0.4 + lv * 0.4, lv === 0);
  // the shed at the south-east corner: four posts, a sloping roof of lauze, the hearth with the copper, a bench
  const sx0 = x1 - 4.2, sz0 = z1 - 3.6, sx1 = x1 - 0.2, sz1 = z1 - 0.2;
  for (const [a, b, h] of [[sx0, sz0, 2.4], [sx1 - 0.12, sz0, 2.4], [sx0, sz1 - 0.12, 1.9], [sx1 - 0.12, sz1 - 0.12, 1.9]]) B('wood_dark', a, b, a + 0.12, b + 0.12, y, y + h, true);
  const rf = []; hexa(rf, [[sx0 - 0.3, y + 2.4, sz0 - 0.3], [sx1 + 0.3, y + 2.4, sz0 - 0.3], [sx1 + 0.3, y + 1.9, sz1 + 0.3], [sx0 - 0.3, y + 1.9, sz1 + 0.3]], [[sx0 - 0.3, y + 2.55, sz0 - 0.3], [sx1 + 0.3, y + 2.55, sz0 - 0.3], [sx1 + 0.3, y + 2.05, sz1 + 0.3], [sx0 - 0.3, y + 2.05, sz1 + 0.3]]);
  bag.add('lauze', fromTriangles(rf));
  B('schist_rubble', sx0 + 0.6, sz0 + 0.5, sx0 + 2.0, sz0 + 1.4, y, y + 0.55, true);
  bag.add('iron', lathe([[0.001, 0], [0.32, 0.05], [0.42, 0.22], [0.4, 0.4], [0.34, 0.42], [0.001, 0.38]], 12, null, sx0 + 1.3, y + 0.55, sz0 + 0.95));
  B('flame', sx0 + 0.75, sz0 + 1.4, sx0 + 1.85, sz0 + 1.45, y + 0.12, y + 0.4);
  B('wood_dark', sx0 + 2.5, sz0 + 0.5, sx0 + 3.7, sz0 + 0.9, y, y + 0.45, true);
  void gz;
}
export const villageElements = { maison, calade, stairs, retain, strip, jardin, croix, fontaine, porte, roue, tannerie };
