// Husuni Kubwa, the palace of al-Hasan ibn Sulaiman on its headland at Kilwa (early 14th c.;
// docs/settlements/kilwa.md §11, after Archnet site 3780 and Chittick's survey): the residential
// core of four courts — the audience court with its pavilion up nine steps, the domestic court with
// its well, the bathing court with the octagonal pool, the sunken private court — ringed by long,
// narrow barrel-vaulted rooms; the South Court of storerooms two deep with its corner dome; the
// terraces and the stair cut down the cliff to the beach and the small mosque at its foot.
// Coral rag in lime, plastered; doorways and carving in dressed porites coral.

import { box, fromTriangles } from '../../core/geom.js';
import { pointedSpandrel } from '../sahel/index.js';
import { C, RAG, DRESSED, CARVED, SMOOTH, solid, slab, wall, rooms, vault, domeBay, face, poleCeiling, carvedPanel, wallFace, nicheHoles, prism, frameOf, lathe8, cut } from './kit.js';

const ROUGH = 'plaster_grey';   // the servants' rooms' rough plaster (Archnet: left rough there)

/** A line of piers along x (alongX) or z at c, from a0 to a1, n bays of pointed arches (springing fl + ys, up to fl + yT). */
function arcade(ctx, { c, a0, a1, n, fl, ys = 2.0, yT = 3.2, along = 'x', pier = 0.6, endPiers = false }) {
  const s = (a1 - a0) / n, tris = [];
  for (let i = endPiers ? 0 : 1; i <= (endPiers ? n : n - 1); i++) {
    const a = a0 + i * s, r = along === 'x' ? [a - pier / 2, c - pier / 2, a + pier / 2, c + pier / 2] : [c - pier / 2, a - pier / 2, c + pier / 2, a + pier / 2];
    solid(ctx, C, r[0], fl - 0.05, r[1], r[2], fl + ys, r[3]);
    ctx.bag.add(DRESSED, box(r[0] - 0.05, fl + ys - 0.16, r[1] - 0.05, r[2] + 0.05, fl + ys, r[3] + 0.05));   // the impost
    ctx.bag.add(DRESSED, box(r[0] - 0.04, fl - 0.05, r[1] - 0.04, r[2] + 0.04, fl + 0.22, r[3] + 0.04));       // the base
  }
  for (let i = 0; i < n; i++) {
    const p = a0 + i * s + (i > 0 || endPiers ? pier / 2 : 0), q = a0 + (i + 1) * s - (i < n - 1 || endPiers ? pier / 2 : 0);
    pointedSpandrel(tris, c, pier / 2, p, q, fl + ys, fl + yT, along === 'x', 0.72);
  }
  ctx.bag.add(C, fromTriangles(tris));
}
/** A flight of steps over rect rising from y0 to y1 toward dir; solid down to `base`; each step's edge capped with timber (Archnet). */
export function flight(ctx, rect, y0, y1, dir, { base = null, mat = DRESSED, nosing = true, rise = 0.2 } = {}) {
  const [x0, z0, x1, z1] = rect, n = Math.max(1, Math.round((y1 - y0) / rise)), h = (y1 - y0) / n, b = base ?? y0 - 0.4;
  const along = dir === 'e' || dir === 'w' ? 'x' : 'z', L = along === 'x' ? x1 - x0 : z1 - z0, d = L / n, sg = dir === 'e' || dir === 's' ? 1 : -1;
  for (let k = 0; k < n; k++) {
    const yk = y0 + (k + 1) * h, a = sg > 0 ? (along === 'x' ? x0 : z0) + k * d : (along === 'x' ? x1 : z1) - (k + 1) * d;
    // the step from its front edge to the flight's top end, so the risers are solid
    const p = sg > 0 ? a : (along === 'x' ? x0 : z0), q = sg > 0 ? (along === 'x' ? x1 : z1) : a + d;
    if (along === 'x') ctx.bag.add(mat, box(p, k === 0 ? b : yk - h - 0.02, z0, q, yk, z1)); else ctx.bag.add(mat, box(x0, k === 0 ? b : yk - h - 0.02, p, x1, yk, q));
    if (nosing) {
      const e = sg > 0 ? a : a + d, f0 = e - sg * 0.02, f1 = e + sg * 0.1;
      if (along === 'x') ctx.bag.add('timber', box(Math.min(f0, f1), yk - 0.07, z0 + 0.01, Math.max(f0, f1), yk + 0.012, z1 - 0.01));
      else ctx.bag.add('timber', box(x0 + 0.01, yk - 0.07, Math.min(f0, f1), x1 - 0.01, yk + 0.012, Math.max(f0, f1)));
    }
  }
  ctx.col.ramp(rect, y0, y1, dir);
}
/** A parapet or cheek wall along a flight: from base up to 0.9 m over the steps' line (from ya at a0 to yb at a1). */
function cheek(ctx, along, c, t, a0, a1, base, ya, yb, mat = C) {
  const F = along === 'x' ? frameOf([0, 0, c - t / 2], [1, 0, 0], [0, 1, 0], [0, 0, -1]) : frameOf([c - t / 2, 0, 0], [0, 0, 1], [0, 1, 0], [-1, 0, 0]);
  const T = [];
  prism(T, F, [[a0, base], [a1, base], [a1, yb + 0.9], [a0, ya + 0.9]], 0, -t);
  ctx.bag.add(mat, fromTriangles(T));
  const T2 = [];
  prism(T2, F, [[a0, ya + 0.9], [a1, yb + 0.9], [a1, yb + 1.0], [a0, ya + 1.0]], 0.03, -t - 0.03);   // the coping
  ctx.bag.add(DRESSED, fromTriangles(T2));
  const n = Math.ceil(Math.abs(a1 - a0) / 0.5);
  for (let i = 0; i < n; i++) {
    const p = a0 + (a1 - a0) * i / n, q = a0 + (a1 - a0) * (i + 1) / n, y = Math.max(ya, yb) * 0 + ya + (yb - ya) * (i + 0.5) / n;
    ctx.col.rect(along === 'x' ? [Math.min(p, q), c - t / 2, Math.max(p, q), c + t / 2] : [c - t / 2, Math.min(p, q), c + t / 2, Math.max(p, q)], base, y + 1.0);
  }
}

/** terrace_wall: a retaining wall of coral rag { rect, y0, y1 } with a coping of dressed coral, weep holes low down. */
function terraceWall(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, along = x1 - x0 > z1 - z0 ? 'x' : 'z';
  solid(ctx, RAG, x0, el.y0, z0, x1, el.y1, z1);
  ctx.bag.add(DRESSED, box(x0 - 0.05, el.y1, z0 - 0.05, x1 + 0.05, el.y1 + (el.parapet ?? 0.12), z1 + 0.05));
  if (el.parapet) ctx.col.rect([x0, z0, x1, z1], el.y1, el.y1 + el.parapet);
  // weep holes on the low face, dark slots a little proud of the rag
  if (el.face) {
    const L = along === 'x' ? x1 - x0 : z1 - z0, n = Math.floor(L / 3.2), lo = el.low ?? el.y0;
    for (let i = 0; i < n; i++) {
      const a = (along === 'x' ? x0 : z0) + (i + 0.5) * L / n, y = lo + 0.5;
      if (along === 'x') { const zz = el.face < 0 ? z0 : z1; ctx.bag.add('opening', box(a - 0.07, y, Math.min(zz, zz + el.face * 0.01), a + 0.07, y + 0.12, Math.max(zz, zz + el.face * 0.01))); }
      else { const xx = el.face < 0 ? x0 : x1; ctx.bag.add('opening', box(Math.min(xx, xx + el.face * 0.01), y, a - 0.07, Math.max(xx, xx + el.face * 0.01), y + 0.12, a + 0.07)); }
    }
  }
}

/** husuni_stair: the stair to the beach { head, fa, mid, bHead, fb, y } — two flights cut down the cliff. */
function husuniStair(el, ctx) {
  const { head, fa: a, mid, bHead, fb: b } = el, Y = el.y;
  solid(ctx, RAG, head[0], a.y0 - 0.4, head[1], head[2], Y - 0.25, head[3], false);
  slab(ctx, DRESSED, head, Y - 0.25, Y + 0.02);
  ctx.col.rect(head, a.y0 - 0.4, Y - 0.25);
  // flight a, rising east from the turn to the head, against the top terrace's wall; its parapet on the open (north) side
  flight(ctx, a.rect, a.y0 + 0.02, Y + 0.02, 'e', { base: a.y0 - 0.4 });
  cheek(ctx, 'x', head[1] + 0.3, 0.6, a.rect[0], a.rect[2], a.y0 - 0.4, a.y0 + 0.02, Y + 0.02);
  cheek(ctx, 'x', head[1] + 0.3, 0.6, head[0], head[2], Y - 0.6, Y + 0.02, Y + 0.02);
  cheek(ctx, 'z', head[2] + 0.3, 0.6, head[1], head[3], Y - 0.6, Y + 0.02, Y + 0.02);
  // the turn on the north terrace, and the second flight's head through the terrace's west wall
  slab(ctx, DRESSED, mid, a.y0 - 0.2, a.y0 + 0.02);
  cheek(ctx, 'x', mid[1] - 0.3, 0.6, mid[0] - 3.4, mid[2], a.y0 - 0.5, a.y0 + 0.02, a.y0 + 0.02);
  solid(ctx, RAG, bHead[0] - 0.5, b.y0 - 0.3, bHead[1], bHead[2], a.y0 - 0.2, bHead[3], true);
  slab(ctx, DRESSED, [bHead[0] - 0.5, bHead[1], bHead[2] + 0.6, bHead[3]], a.y0 - 0.2, a.y0 + 0.02);
  cheek(ctx, 'z', bHead[0] - 0.25, 0.5, bHead[1], bHead[3], b.y0 - 0.3, a.y0 + 0.02, a.y0 + 0.02);
  // flight b, falling north to the sand, its west side walled
  flight(ctx, b.rect, b.y0 + 0.02, a.y0 + 0.02, 's', { base: b.y0 - 0.35 });
  cheek(ctx, 'z', b.rect[0] - 0.25, 0.5, b.rect[1], b.rect[3], b.y0 - 0.35, b.y0 + 0.02, a.y0 + 0.02);
}

/** beach_mosque: the small mosque at the stair's foot { rect, y } — a door on the south, the mihrab north, a cistern either side. */
function beachMosque(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, fl = y + 0.35, mx = (x0 + x1) / 2;
  solid(ctx, RAG, x0 - 0.2, y - 0.4, z0 - 0.2, x1 + 0.2, fl - 0.03, z1 + 1.4, false);
  ctx.col.floor([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 1.4], fl - 0.03);
  const { rooms: R, yR } = rooms(ctx, { rect: [x0, z0, x1, z1], along: 'z', n: 1, t: 0.5, fl, hs: 2.9, roof: 'poles', door: null, holes: { s: [{ u0: mx - 0.5, u1: mx + 0.5, v0: fl, v1: fl + 2.1, frame: 'grand' }], w: [{ u0: z0 + 2.2, u1: z0 + 2.7, v0: fl + 1.3, v1: fl + 2.0 }], e: [{ u0: z0 + 2.2, u1: z0 + 2.7, v0: fl + 1.3, v1: fl + 2.0 }] }, rec: { n: [{ u0: mx - 0.45, u1: mx + 0.45, v0: fl, v1: fl + 1.9, d: 0.3, side: 1, holes: nicheHoles(mx, fl, 0.9, 1.6) }] }, parapet: 0.45 });
  void R;
  // the mihrab's back swelling out of the north wall, a carved panel over the niche inside
  solid(ctx, C, mx - 0.65, y - 0.3, z0 - 0.55, mx + 0.65, yR - 0.5, z0, true);
  carvedPanel(ctx, wallFace('x', z0 + 0.5, 1, 0), mx - 0.6, fl + 2.15, mx + 0.6, fl + 2.6, 'stars');
  // the cisterns for ablution by the door, of plastered coral, water within
  for (const s of [-1, 1]) {
    const cx = s < 0 ? x0 - 0.2 + 0.7 : x1 + 0.2 - 0.7, r = [cx - 0.6, z1 + 0.2, cx + 0.6, z1 + 1.35];
    for (const w of [[r[0], r[1], r[2], r[1] + 0.15], [r[0], r[3] - 0.15, r[2], r[3]], [r[0], r[1], r[0] + 0.15, r[3]], [r[2] - 0.15, r[1], r[2], r[3]]]) solid(ctx, C, w[0], fl - 0.05, w[1], w[2], fl + 0.75, w[3]);
    ctx.bag.add('water', fromTriangles([r[0] + 0.15, fl + 0.55, r[1] + 0.15, r[0] + 0.15, fl + 0.55, r[3] - 0.15, r[2] - 0.15, fl + 0.55, r[3] - 0.15, r[0] + 0.15, fl + 0.55, r[1] + 0.15, r[2] - 0.15, fl + 0.55, r[3] - 0.15, r[2] - 0.15, fl + 0.55, r[1] + 0.15]));
    ctx.bag.add(SMOOTH, box(r[0] + 0.15, fl - 0.05, r[1] + 0.15, r[2] - 0.15, fl + 0.2, r[3] - 0.15));
  }
  // a reed mat on the floor, a water jar by the door
  ctx.bag.add('reed_mat', box(x0 + 0.6, fl + 0.005, z0 + 1.2, x1 - 0.6, fl + 0.025, z1 - 0.8));
}

/** The octagon of inner half-width a (flats facing the axes): its corner points at angles 22.5° + k·45°. */
const oct = (cx, cz, a, y) => Array.from({ length: 8 }, (_, k) => { const th = Math.PI / 8 + k * Math.PI / 4, r = a / Math.cos(Math.PI / 8); return [cx + Math.cos(th) * r, y, cz + Math.sin(th) * r]; });
/** The flat ring between the rectangle r and the octagon (centre, half-width a) at height y, facing up. */
function ringFloor(out, r, cx, cz, a, y) {
  const P = oct(cx, cz, a, y), Rc = [[r[2], r[3]], [r[0], r[3]], [r[0], r[1]], [r[2], r[1]]];
  // each octagon corner k (angles 22.5 + 45k: k = 0 SE, 2 SW, 4 NW, 6 NE) joins the nearer rect points
  const side = (k) => { const [x, , z] = P[k]; return [[x, r[3]], [r[0], z], [x, r[1]], [r[2], z]]; };
  for (let k = 0; k < 8; k++) {
    const q = P[k], p = P[(k + 1) % 8], tris = [];
    // the edge k→k+1 is a flat (at angle 45(k+1)) or diagonal; project both ends onto the rectangle along the flat's normal
    const th = (k + 1) * Math.PI / 4, nx = Math.round(Math.cos(th) * 1e6) / 1e6, nz = Math.round(Math.sin(th) * 1e6) / 1e6;
    if (Math.abs(nx) < 1e-6 || Math.abs(nz) < 1e-6) {
      const pr = (v) => (Math.abs(nx) > 0.5 ? [nx > 0 ? r[2] : r[0], v[2]] : [v[0], nz > 0 ? r[3] : r[1]]);
      const a0 = pr(q), a1 = pr(p);
      tris.push(q, p, [a1[0], y, a1[1]], q, [a1[0], y, a1[1]], [a0[0], y, a0[1]]);
    } else {
      // a diagonal: the corner of the rectangle and the two points where the flats' lines meet it
      const corner = Rc[Math.floor(k / 2) % 4] || Rc[0], cr = [nx > 0 ? r[2] : r[0], nz > 0 ? r[3] : r[1]];
      const aq = Math.abs(nx) > 0 && Math.abs(q[0] - cx) > Math.abs(q[2] - cz) ? [cr[0], q[2]] : [q[0], cr[1]];
      const ap = Math.abs(p[0] - cx) > Math.abs(p[2] - cz) ? [cr[0], p[2]] : [p[0], cr[1]];
      void corner;
      tris.push(q, p, [cr[0], y, cr[1]], q, [cr[0], y, cr[1]], [aq[0], y, aq[1]], p, [ap[0], y, ap[1]], [cr[0], y, cr[1]]);
    }
    for (let i = 0; i < tris.length; i += 3) face(out, [0, 1, 0], tris[i], tris[i + 1], tris[i + 2]);
  }
  void side;
}

/** The bathing court { rect (the sunken court), fl (the arcades' floor), sunk, pool [cx, cz, a] }. */
function poolCourt(ctx, el) {
  const r = el.rect, fl = el.fl, cf = fl - el.sunk, [cx, cz, a] = el.pool, deep = el.deep;
  // the court's floor at cf round the pool, over the rock cut down beneath it; its kerbs to the arcades
  const T = []; ringFloor(T, r, cx, cz, a + 0.4, cf); ctx.bag.add(SMOOTH, fromTriangles(T));
  ctx.col.floor(r, cf);
  // the pool: an octagon 8 m across, its rim 60 cm over the court, 1.6 m deep at the west, 2 m at the east
  const wl = cf + 0.45, Pi = oct(cx, cz, a, 0), Po = oct(cx, cz, a + 0.4, 0), rim = cf + 0.6, R = [];
  const fy = (x) => wl - 1.6 - 0.4 * (x - (cx - a)) / (2 * a);
  for (let k = 0; k < 8; k++) {
    const i0 = Pi[k], i1 = Pi[(k + 1) % 8], o0 = Po[k], o1 = Po[(k + 1) % 8], th = (k + 0.5) * Math.PI / 4 + Math.PI / 8, n = [Math.cos(th), 0, Math.sin(th)];
    face(R, n.map((v) => -v), [i0[0], fy(i0[0]), i0[2]], [i1[0], fy(i1[0]), i1[2]], [i1[0], rim, i1[2]], [i0[0], rim, i0[2]]);   // the inner face
    face(R, n, [o0[0], cf - 0.02, o0[2]], [o1[0], cf - 0.02, o1[2]], [o1[0], rim, o1[2]], [o0[0], rim, o0[2]]);                    // the outer face
  }
  // the floor seen from above (its normal up), plastered
  const Fl = []; for (let k = 0; k < 8; k++) { const i0 = Pi[k], i1 = Pi[(k + 1) % 8]; face(Fl, [0, 1, 0], [i0[0], fy(i0[0]) + 0.001, i0[2]], [i1[0], fy(i1[0]) + 0.001, i1[2]], [cx, fy(cx) + 0.001, cz]); }
  ctx.bag.add(C, fromTriangles(R)); ctx.bag.add(SMOOTH, fromTriangles(Fl));
  // the coping of dressed coral on the rim
  const Cp = []; for (let k = 0; k < 8; k++) { const i0 = Pi[k], i1 = Pi[(k + 1) % 8], o0 = Po[k], o1 = Po[(k + 1) % 8], e = 0.03;
    face(Cp, [0, 1, 0], [i0[0], rim + 0.06, i0[2]], [i1[0], rim + 0.06, i1[2]], [o1[0], rim + 0.06, o1[2]], [o0[0], rim + 0.06, o0[2]]);
    const th = (k + 0.5) * Math.PI / 4 + Math.PI / 8, n = [Math.cos(th), 0, Math.sin(th)];
    face(Cp, n, [o0[0] + n[0] * e, rim - 0.02, o0[2] + n[2] * e], [o1[0] + n[0] * e, rim - 0.02, o1[2] + n[2] * e], [o1[0] + n[0] * e, rim + 0.06, o1[2] + n[2] * e], [o0[0] + n[0] * e, rim + 0.06, o0[2] + n[2] * e]);
    face(Cp, n, [o0[0], rim - 0.02, o0[2]], [o1[0], rim - 0.02, o1[2]], [o1[0] + n[0] * e, rim - 0.02, o1[2] + n[2] * e], [o0[0] + n[0] * e, rim - 0.02, o0[2] + n[2] * e]);
  }
  ctx.bag.add(DRESSED, fromTriangles(Cp));
  const W = []; for (let k = 0; k < 8; k++) { const i0 = Pi[k], i1 = Pi[(k + 1) % 8]; W.push(cx, wl, cz, i1[0], wl, i1[2], i0[0], wl, i0[2]); }
  ctx.bag.add('water', fromTriangles(W));
  ctx.col.circle(cx, cz, a + 0.4, cf - 2.5, rim);
  // the drain at the west, a dressed spout through the rim toward the cliff
  ctx.bag.add(DRESSED, box(cx - a - 0.45, rim - 0.25, cz - 0.12, cx - a - 0.05, rim - 0.12, cz + 0.12));
  // the rock under the court's kerbs: the arcades' platforms rise from the cut to the arcades' floor
  for (const k of el.kerbs) { solid(ctx, C, k[0], deep, k[1], k[2], fl - 0.06, k[3], false); ctx.col.rect(k, deep, cf + 0.15); }
  // steps down from the arcades in the middle of the three open sides
  for (const s of el.steps) flight(ctx, s.rect, cf, fl, s.dir, { base: deep, mat: DRESSED, nosing: false });
}

/** husuni_core: the residential block of four courts { core, courts, pool, y }. */
function core(el, ctx) {
  const Y = el.y, fl = Y + 0.03, K = el.courts, [px, pz, pa] = el.pool, deep = Y - 3.3;
  const P = K.pool.rect, A = K.audience.rect, D = K.domestic.rect, Q = K.palace.rect;
  // ---- the north range over the cliff: long vaulted rooms, small windows to the harbour
  const nwin = Array.from({ length: 13 }, (_, i) => { const m = 142 + 4 * (i + 0.5); return { u0: m - 0.25, u1: m + 0.25, v0: fl + 1.5, v1: fl + 2.1 }; });
  rooms(ctx, { rect: [142, -150, 194, -146], along: 'x', n: 13, fl, door: 's', holes: { n: nwin } });
  // ---- the west range, its gate to the audience court from the west
  const wr = rooms(ctx, { rect: [142, -146.6, 146, -100], along: 'z', n: 12, fl, door: 'e', skip: ['n'], holes: { w: [{ u0: -117.25 - 0.75, u1: -117.25 + 0.75, v0: fl, v1: fl + 2.7, frame: 'grand' }] } });
  carvedPanel(ctx, wallFace('z', 142, -1, 0), -118.3, fl + 3.0, -116.2, fl + 3.5, 'stars');
  void wr;
  // ---- the bathing court: arcades on its west, south and east, the pool in the middle
  const kW = [146, P[1], P[0], P[3] + 2.6], kS = [146, P[3], 165, P[3] + 2.6], kE = [P[2], P[1], 165, P[3]];
  for (const k of [kW, kS, kE]) slab(ctx, SMOOTH, k, fl - 0.06, fl);
  poolCourt(ctx, { rect: P, fl, sunk: K.pool.sunk, pool: [px, pz, pa], deep,
    kerbs: [kW, kS, kE],
    steps: [{ rect: [P[0], pz - 1, P[0] + 1.2, pz + 1], dir: 'w' }, { rect: [(P[0] + P[2]) / 2 - 1, P[3] - 1.2, (P[0] + P[2]) / 2 + 1, P[3]], dir: 's' }, { rect: [P[2] - 1.2, pz - 1, P[2], pz + 1], dir: 'e' }] });
  // the north range's foot along the sunken court
  solid(ctx, C, P[0], deep, P[1] - 0.6, P[2], fl, P[1], false);
  arcade(ctx, { c: P[0] - 0.3, a0: P[1], a1: P[3] + 0.3, n: 4, fl, along: 'z' });
  arcade(ctx, { c: P[3] + 0.3, a0: P[0] - 0.3, a1: P[2] + 0.3, n: 4, fl, along: 'x', endPiers: true });
  arcade(ctx, { c: P[2] + 0.3, a0: P[1], a1: P[3] + 0.3, n: 4, fl, along: 'z' });
  for (const k of [[146, P[1], P[0], P[3] + 2.6], [P[0], P[3], 165, P[3] + 2.6], [P[2], P[1], 165, P[3]]]) poleCeiling(ctx, k, fl + 3.2, k[2] - k[0] < k[3] - k[1] ? 'x' : 'z', { th: 0.35 });
  // the arcades' cornice toward the pool: a dart frieze in carved coral
  carvedPanel(ctx, wallFace('z', P[0], 1, 0), P[1] + 0.2, fl + 3.22, P[3] - 0.4, fl + 3.5, 'darts');
  carvedPanel(ctx, wallFace('z', P[2], -1, 0), P[1] + 0.2, fl + 3.22, P[3] - 0.4, fl + 3.5, 'darts');
  carvedPanel(ctx, wallFace('x', P[3], -1, 0), P[0] + 0.4, fl + 3.22, P[2] - 0.4, fl + 3.5, 'darts');
  // ---- the row between the bathing court and the audience court (its doors to the arcade)
  rooms(ctx, { rect: [145.4, -130.4, 165, -126.6], along: 'x', n: 5, fl, door: 'n', skip: ['w'] });
  // ---- the double suite: the 17 m ante-room off the arcade, the main room, two bedrooms of 2.2 m
  const zid = (z0, z1, v0) => { const R = []; const n = Math.floor((z1 - z0) / 0.62); for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { const u = z0 + (i + 0.5) * (z1 - z0) / n; R.push({ u0: u - 0.22, u1: u + 0.22, v0: v0 + j * 0.78, v1: v0 + j * 0.78 + 0.5, d: 0.16, side: -1, holes: nicheHoles(u, v0 + j * 0.78, 0.4, 0.42) }); } return R; };
  rooms(ctx, { rect: [165, -146.6, 168.4, -128.4], along: 'z', n: 1, fl, door: null, skip: ['n'], holes: { w: [{ u0: -140, u1: -139, v0: fl, v1: fl + 2.2, frame: 'grand' }, { u0: -134, u1: -133.1, v0: fl, v1: fl + 2.1, frame: 'door' }], e: [{ u0: -138.2, u1: -137.2, v0: fl, v1: fl + 2.2, frame: 'grand' }] } });
  carvedPanel(ctx, wallFace('z', 165, -1, 0), -140.2, fl + 2.45, -138.8, fl + 2.85, 'stars');
  rooms(ctx, { rect: [167.8, -146.6, 171.8, -128.4], along: 'z', at: [-134.3, -131.5], fl, door: null, cross: true, skip: ['n', 'w'], rec: { e: zid(-145, -135, fl + 0.6) } });
  for (const [za, zb] of [[-134.0, -131.8], [-131.2, -129.0]]) solid(ctx, SMOOTH, 170.0, fl - 0.02, za + 0.1, 171.2, fl + 0.5, zb - 0.1);   // the built platform beds
  // ---- the private court: sunk a metre by four steps all round, walkways either side, wide-doored rooms
  rooms(ctx, { rect: [171.2, -146.6, 175.2, -128.4], along: 'z', n: 5, fl, door: 'e', doorW: 1.7, doorH: 2.4, skip: ['n', 'w'] });
  for (const w of [[175.2, Q[1], Q[0], Q[3]], [Q[2], Q[1], 190, Q[3]]]) slab(ctx, SMOOTH, w, fl - 0.06, fl);
  {
    const cf = fl - K.palace.sunk, n = 4, h = K.palace.sunk / n, d = 0.32;
    for (let k = 0; k < n; k++) {
      const e = k * d, top = fl - k * h, rr = [Q[0] + e, Q[1] + e, Q[2] - e, Q[3] - e];
      // each step a frame of dressed coral round the court, solid down to the cut rock
      for (const s of [[rr[0], rr[1], rr[2], rr[1] + d], [rr[0], rr[3] - d, rr[2], rr[3]], [rr[0], rr[1] + d, rr[0] + d, rr[3] - d], [rr[2] - d, rr[1] + d, rr[2], rr[3] - d]]) {
        ctx.bag.add(k === 0 ? DRESSED : SMOOTH, box(s[0], deep, s[1], s[2], top - (k === 0 ? 0 : 0.001), s[3])); ctx.col.floor(s, top);
      }
    }
    const ir = [Q[0] + n * d, Q[1] + n * d, Q[2] - n * d, Q[3] - n * d];
    slab(ctx, SMOOTH, ir, deep, cf);
    // the corner chambers' soakaway pits, planted (Archnet: perhaps for plants): a kerb and earth in each corner of the floor
    for (const [sx, sz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const x = sx ? ir[2] - 1.3 : ir[0] + 0.3, z = sz ? ir[3] - 1.3 : ir[1] + 0.3;
      for (const k of [[x, z, x + 1, z + 0.12], [x, z + 0.88, x + 1, z + 1], [x, z + 0.12, x + 0.12, z + 0.88], [x + 0.88, z + 0.12, x + 1, z + 0.88]]) solid(ctx, DRESSED, k[0], cf, k[1], k[2], cf + 0.25, k[3]);
      ctx.bag.add('ground', box(x + 0.12, cf, z + 0.12, x + 0.88, cf + 0.2, z + 0.88));
    }
  }
  // ---- the east range
  rooms(ctx, { rect: [190, -146.6, 194, -100], along: 'z', n: 12, fl, door: 'w', skip: ['n'] });
  // ---- the domestic court's north rooms (single storey), its west row, its servants' rooms (rough plaster) on the south
  rooms(ctx, { rect: [173, -128.4, 190, -124.6], along: 'x', n: 4, fl, door: 's', roof: 'poles', hs: 2.9 });
  rooms(ctx, { rect: [165, -128.4, 173.6, -124.6], along: 'x', n: 2, fl, door: null, cross: true, roof: 'poles', hs: 2.9, skip: ['e'] });
  rooms(ctx, { rect: [169.4, -125.2, 173, -104], along: 'z', n: 5, fl, door: 'e', skip: ['n'], roof: 'poles', hs: 2.9 });
  rooms(ctx, { rect: [169.4, -104, 190, -100], along: 'x', n: 6, fl, door: 'n', roof: 'poles', hs: 2.7, mat: ROUGH, skip: ['w'] });
  {
    const cf = fl - K.domestic.sunk;
    slab(ctx, SMOOTH, D, deep, cf);
    for (const s of [[D[0], D[1], D[2], D[1] + 0.35], [D[0], D[3] - 0.35, D[2], D[3]], [D[0], D[1] + 0.35, D[0] + 0.35, D[3] - 0.35], [D[2] - 0.35, D[1] + 0.35, D[2], D[3] - 0.35]]) slab(ctx, DRESSED, s, deep, cf + 0.2);
    // the well, a round kerb of coral, the shaft dark, a beam over it for the rope
    const wx = D[0] + 4, wz = (D[1] + D[3]) / 2;
    ctx.bag.add(C, fromTriangles(ringWall(wx, wz, 0.75, 1.05, cf, cf + 0.75)));
    ctx.bag.add(DRESSED, fromTriangles(ringWall(wx, wz, 0.72, 1.1, cf + 0.75, cf + 0.83)));
    ctx.bag.add('opening', fromTriangles(discTris(wx, wz, 0.75, cf + 0.05)));
    ctx.col.circle(wx, wz, 1.05, cf, cf + 0.83);
    for (const s of [-1, 1]) ctx.bag.add('timber', box(wx + s * 1.2 - 0.06, cf, wz - 0.06, wx + s * 1.2 + 0.06, cf + 2.0, wz + 0.06));
    ctx.bag.add('timber', box(wx - 1.3, cf + 1.95, wz - 0.06, wx + 1.3, cf + 2.07, wz + 0.06));
    ctx.bag.add('hide_brown', box(wx - 0.01, cf + 1.0, wz - 0.01, wx + 0.01, cf + 1.95, wz + 0.01));
    ctx.bag.add('pottery_dark', box(wx - 0.13, cf + 0.85, wz - 0.13, wx + 0.13, cf + 1.1, wz + 0.13));
    // water jars by the servants' doors, a grinding stone
    for (let i = 0; i < 4; i++) { const x = D[0] + 2 + i * 3.6, z = D[3] - 0.9; ctx.bag.add('pottery_dark', lathe8(x, cf, z)); }
  }
  // ---- the audience court: high walls with an upper walkway and three rows of small square niches, verandahs north and south
  slab(ctx, SMOOTH, [A[0], A[1], A[2], A[3]], fl - 0.08, fl);
  for (const [vr, zc] of [[[A[0], A[1] - 2.6, 162.2, A[1]], A[1]], [[A[0], A[3], A[2], A[3] + 2.4], A[3]]]) {
    slab(ctx, SMOOTH, vr, fl - 0.08, fl);
    arcade(ctx, { c: zc + (zc === A[1] ? -0.3 : 0.3), a0: vr[0], a1: vr[2], n: vr[2] - vr[0] > 14 ? 5 : 4, fl, ys: 2.3, yT: 3.6, along: 'x' });
    poleCeiling(ctx, vr, fl + 3.6, 'z', { th: 0.6 });
    // the walkway on the verandah's roof, its parapet to the court
    const pz = zc === A[1] ? zc - 0.6 : zc;
    solid(ctx, C, vr[0], fl + 4.2, pz, vr[2], fl + 5.05, pz + 0.6);
    ctx.col.floor(vr, fl + 4.2);
    carvedPanel(ctx, wallFace('x', zc === A[1] ? pz + 0.6 : pz, zc === A[1] ? 1 : -1, 0), vr[0] + 0.3, fl + 3.7, vr[2] - 0.3, fl + 4.05, 'darts');
  }
  // the court's high back walls: over the verandahs' back walls and the west range, up to fl + 7.4
  const sq = (a0, a1) => { const R = []; for (let j = 0; j < 3; j++) { const n = Math.floor((a1 - a0) / 0.75); for (let i = 0; i < n; i++) { const u = a0 + (i + 0.5) * (a1 - a0) / n, v = fl + 5.3 + j * 0.62; R.push({ u0: u - 0.13, u1: u + 0.13, v0: v, v1: v + 0.26, d: 0.18, side: 0 }); } } return R; };
  const hiN = sq(A[0] + 0.4, 162), hiS = sq(A[0] + 0.4, A[2] - 0.4), hiW = sq(A[1] + 0.3, A[3] - 0.3);
  wall(ctx, { axis: 'x', c: -126.6 - 0.3, u0: 146, u1: 165, t: 0.6, y0: fl + 3.0, y1: fl + 7.4, rec: hiN.map((r) => ({ ...r, side: 1 })) });
  wall(ctx, { axis: 'x', c: A[3] + 2.4 + 0.3, u0: 146, u1: 169.4, t: 0.6, y0: fl + 3.0, y1: fl + 7.4, rec: hiS.map((r) => ({ ...r, side: -1 })) });
  wall(ctx, { axis: 'z', c: 146 - 0.3, u0: A[1] - 2.6, u1: A[3] + 2.4, t: 0.6, y0: fl + 3.0, y1: fl + 7.4, rec: hiW.map((r) => ({ ...r, side: 1 })) });
  // the rooms south of the court, back to back: the inner row to the verandah, the outer row to the lane
  rooms(ctx, { rect: [145.4, A[3] + 2.4, 169.4, -103.2], along: 'x', n: 6, fl, door: 'n', t: 0.6, skip: ['w'] });
  rooms(ctx, { rect: [145.4, -103.8, 169.4, -100], along: 'x', n: 6, fl, door: 's', skip: ['n', 'w'] });
  // ---- the pavilion: up nine steps (3 m) on the court's east side; an open arcade, a hall behind with the sultan's seat
  pavilion(ctx, { rect: [159, A[1], 169.4, A[3] + 2.4], fl, deep });
  // the leftover corner between the verandah, the pavilion and the suite: solid
  solid(ctx, C, 162.2, fl - 0.5, -126.6, 165, fl + 4.5, A[1], true);
  // the lane between the core and the South Court, paved
  slab(ctx, SMOOTH, [142, -100, 194, -98], fl - 0.3, fl);
}
/** The pavilion { rect (the platform, the steps cut into its west face), fl, deep }. */
function pavilion(ctx, { rect, fl, deep }) {
  const [x0, z0, x1, z1] = rect, top = fl + 3, mz = (z0 + z1) / 2, st = [x0, mz - 3, x0 + 3.2, mz + 3];
  // the platform of coral rag, plastered, the nine steps cut into its front
  for (const r of [[x0, z0, x1, st[1]], [x0, st[3], x1, z1], [st[2], st[1], x1, st[3]]]) { solid(ctx, C, r[0], deep, r[1], r[2], top - 0.04, r[3], false); ctx.col.rect(r, deep, top - 0.5); }
  slab(ctx, SMOOTH, [x0, z0, x1, z1].map((v, i) => (i === 0 ? x0 + 3.2 : v)), top - 0.04, top);
  for (const r of [[x0, z0, x0 + 3.2, st[1]], [x0, st[3], x0 + 3.2, z1]]) slab(ctx, SMOOTH, r, top - 0.04, top);
  flight(ctx, st, fl, top, 'e', { base: deep, rise: 1 / 3 });
  for (const s of [st[1] - 0.3, st[3] + 0.3]) cheek(ctx, 'x', s, 0.6, x0, x0 + 3.2, fl, fl, top);
  // the open arcade on the platform's edge, the vaulted front aisle, the arcade wall, the back hall, the east wall with wide openings
  const ax = x0 + 3.2 + 0.3;
  arcade(ctx, { c: ax, a0: z0 + 0.6, a1: z1 - 0.6, n: 3, fl: top, ys: 2.4, yT: 3.4, along: 'z', pier: 0.7 });
  const R1 = [ax + 0.35, z0 + 0.6, x0 + 6.4, z1 - 0.6], R2 = [x0 + 7.0, z0 + 0.6, x1 - 0.6, z1 - 0.6], vt = [];
  for (const zz of [z0 + 0.3, z1 - 0.3]) wall(ctx, { axis: 'x', c: zz, u0: ax - 0.35, u1: x1, t: 0.6, y0: top - 0.04, y1: top + 5.2 });
  vault(vt, [R1[0] - 0.35, R1[1], R1[2], R1[3]], top + 3.4, 'z');
  const thirds = (a0, a1, w, v0, v1, frame) => [0, 1, 2].map((i) => { const m = a0 + (i + 0.5) * (a1 - a0) / 3; return { u0: m - w / 2, u1: m + w / 2, v0, v1, frame }; });
  wall(ctx, { axis: 'z', c: x0 + 6.7, u0: z0 + 0.6, u1: z1 - 0.6, t: 0.6, y0: top - 0.04, y1: top + 5.2, holes: thirds(z0 + 0.6, z1 - 0.6, 2.2, top, top + 2.7, 'grand') });
  vault(vt, R2, top + 3.3, 'z');
  // the east wall: two wide openings to the sea wind, between them the double niche over the sultan's slab
  const mzz = (z0 + z1) / 2;
  wall(ctx, { axis: 'z', c: x1 - 0.3, u0: z0 + 0.6, u1: z1 - 0.6, t: 0.6, y0: top - 0.04, y1: top + 5.2,
    holes: [{ u0: z0 + 2.2, u1: z0 + 4.4, v0: top + 0.5, v1: top + 2.9, frame: 'grand' }, { u0: z1 - 4.4, u1: z1 - 2.2, v0: top + 0.5, v1: top + 2.9, frame: 'grand' }],
    rec: [-0.55, 0.55].map((o) => ({ u0: mzz + o - 0.4, u1: mzz + o + 0.4, v0: top + 0.75, v1: top + 2.3, d: 0.25, side: -1, holes: nicheHoles(mzz + o, top + 0.75, 0.8, 1.35) })) });
  ctx.bag.add(C, fromTriangles(vt));
  for (const r of [[R1[0] - 0.35, R1[1], R1[2], R1[3]], R2]) ctx.bag.add(SMOOTH, box(r[0], top + 3.4 + (r[2] - r[0]) / 2 + 0.05, r[1], r[2], top + 5.2, r[3]));
  ctx.bag.add(SMOOTH, box(ax - 0.35, top + 3.4, z0 + 0.6, ax + 0.35, top + 5.2, z1 - 0.6));
  ctx.col.floor([ax - 0.35, z0, x1, z1], top + 5.2);
  // the sultan's slab, carved panels over the niches and on the arcade wall's openings, bosses on the vault ends
  solid(ctx, DRESSED, x1 - 2.2, top, mzz - 1.3, x1 - 0.6, top + 0.35, mzz + 1.3);
  ctx.bag.add('reed_mat', box(x1 - 2.15, top + 0.35, mzz - 1.2, x1 - 0.65, top + 0.37, mzz + 1.2));
  carvedPanel(ctx, wallFace('z', x1 - 0.6, -1, 0), mzz - 1.2, top + 2.75, mzz + 1.2, top + 3.2, 'stars');
  for (const zz of [z0 + 0.6, z1 - 0.6]) for (const xc of [(R1[0] + R1[2]) / 2 - 0.2, (R2[0] + R2[2]) / 2]) carvedPanel(ctx, wallFace('x', zz, zz < mzz ? 1 : -1, 0), xc - 0.35, top + 3.9, xc + 0.35, top + 4.6, 'boss');
  for (const h of thirds(z0 + 0.6, z1 - 0.6, 2.2, top, top + 2.7)) carvedPanel(ctx, wallFace('z', x0 + 6.4, -1, 0), h.u0, top + 3.1, h.u1, top + 3.36, 'cable');
  // the parapet round the roof
  for (const r of [[ax - 0.35, z0, x1, z0 + 0.5], [ax - 0.35, z1 - 0.5, x1, z1], [ax - 0.35, z0, ax + 0.15, z1], [x1 - 0.5, z0, x1, z1]]) solid(ctx, C, r[0], top + 5.2, r[1], r[2], top + 5.85, r[3]);
}

/** husuni_south: the South Court { rect, y }: storerooms two deep round a 46 m court, a gate in each side, upper rooms on the north and west, the corner dome, the manager's house and the square well. */
function southCourt(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, Y = el.y, fl = Y + 0.03, d = 4.0, t = 0.65, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  const port = (a0, a1, n) => Array.from({ length: n }, (_, i) => { const m = a0 + (i + 0.5) * (a1 - a0) / n; return [{ u0: m - 1.0, u1: m - 0.6, v0: fl + 1.9, v1: fl + 2.3 }, { u0: m + 0.6, u1: m + 1.0, v0: fl + 1.9, v1: fl + 2.3 }]; }).flat();
  const gate = (m) => ({ u0: m - 1.1, u1: m + 1.1, v0: fl, v1: fl + 2.8, frame: 'grand' });
  const ring = d * 2 - t;
  // north and south: back rows (portholes in the outer wall) and front rows (doors to the court), seven rooms each, the middle a passage
  const NS = [[z0, z0 + d, z0 + d - t, z0 + ring, 'n', 's'], [z1 - d, z1, z1 - ring, z1 - d + t, 's', 'n']];
  for (const [b0, b1, f0, f1, outS, inS] of NS) {
    const outH = port(x0, x1, 7).filter((h) => Math.abs((h.u0 + h.u1) / 2 - mx) > 2.5);
    rooms(ctx, { rect: [x0, b0, x1, b1], along: 'x', n: 7, fl, door: inS, roof: 'poles', hs: 2.75, t, parapetOn: [outS, 'w', 'e'], holes: { [outS]: [...outH, gate(mx)], [inS]: [gate(mx)] } });
    rooms(ctx, { rect: [x0, f0, x1, f1], along: 'x', n: 7, fl, door: inS, roof: 'poles', hs: 2.75, t, skip: [outS], parapetOn: [inS, 'w', 'e'], holes: { [inS]: [gate(mx)] } });
  }
  const WE = [[x0, x0 + d, x0 + d - t, x0 + ring, 'w', 'e'], [x1 - d, x1, x1 - ring, x1 - d + t, 'e', 'w']];
  const za = z0 + ring - t, zb = z1 - ring + t;
  for (const [b0, b1, f0, f1, outS, inS] of WE) {
    const outH = port(za, zb, 5).filter((h) => Math.abs((h.u0 + h.u1) / 2 - mz) > 2.5);
    rooms(ctx, { rect: [b0, za, b1, zb], along: 'z', n: 5, fl, door: inS, roof: 'poles', hs: 2.75, t, skip: ['n', 's'], parapetOn: [outS], holes: { [outS]: [...outH, gate(mz)], [inS]: [gate(mz)] } });
    rooms(ctx, { rect: [f0, za, f1, zb], along: 'z', n: 5, fl, door: inS, roof: 'poles', hs: 2.75, t, skip: ['n', 's', outS], parapetOn: [inS], holes: { [inS]: [gate(mz)] } });
  }
  // the court's floor of beaten earth and lime
  const ci = [x0 + ring, z0 + ring, x1 - ring, z1 - ring];
  // the upper storey on the north and west: vaulted apartments over the storerooms, doors onto the roof
  // of the front rows, the corner dome over the north-west corner room, raised high (about 60°)
  const yU = fl + 2.75 + 0.3, xc = x0 + (x1 - x0) / 7 + t / 2, cr = [x0, z0, xc, z0 + d];
  rooms(ctx, { rect: [xc - t, z0, x1 - (x1 - x0) / 7 - t / 2, z0 + d], along: 'x', n: 5, fl: yU, yB: yU, door: 's', hs: 2.2, t, floor: null, holes: { n: port(xc, x1 - (x1 - x0) / 7, 5).map((h) => ({ ...h, v0: yU + 1.3, v1: yU + 1.7 })) } });
  rooms(ctx, { rect: [x0, z0 + d - t, x0 + d, zb], along: 'z', n: 6, fl: yU, yB: yU, door: 'e', hs: 2.2, t, floor: null, holes: { w: port(z0 + d, zb, 6).map((h) => ({ ...h, v0: yU + 1.3, v1: yU + 1.7 })) } });
  {
    const yT = yU + 2.4, out = [], rI = [cr[0] + t, cr[1] + t, cr[2] - t, cr[3] - t];
    for (const [ax, c, a0, a1] of [['x', cr[1] + t / 2, cr[0], cr[2]], ['x', cr[3] - t / 2, cr[0], cr[2]], ['z', cr[0] + t / 2, cr[1] + t, cr[3] - t], ['z', cr[2] - t / 2, cr[1] + t, cr[3] - t]]) wall(ctx, { axis: ax, c, u0: a0, u1: a1, t, y0: yU, y1: yT + 0.9 });
    domeBay(out, [rI[0] - 0.02, rI[1] - 0.02, rI[2] + 0.02, rI[3] + 0.02], yT, 0.5, yT + 0.9, 0.6, 1.7);
    ctx.bag.add(C, fromTriangles(out));
  }
  // the front rows' roofs as a terrace before the upper rooms, a parapet to the court
  for (const r of [[x0 + d - t, z0 + d - t, x1 - d + t, z0 + ring], [x0 + d - t, z0 + ring, x0 + ring, zb]]) ctx.col.floor(r, yU);
  // the manager's house of two storeys in the south-west corner, and the square well beside it (4.6 m a side)
  const mh = [ci[0], ci[3] - 6.4, ci[0] + 7.2, ci[3]];
  rooms(ctx, { rect: mh, along: 'x', n: 2, fl, door: 'n', roof: 'poles', hs: 2.8, t: 0.55, cross: true, parapet: 0 });
  const up = rooms(ctx, { rect: mh, along: 'x', n: 2, fl: fl + 3.1 + 0.02, yB: fl + 3.1, door: null, roof: 'poles', hs: 2.6, t: 0.55, floor: null, holes: { n: [{ u0: mh[0] + 1.0, u1: mh[0] + 1.6, v0: fl + 4.4, v1: fl + 5.3 }, { u0: mh[2] - 1.6, u1: mh[2] - 1.0, v0: fl + 4.4, v1: fl + 5.3 }] } });
  void up;
  const wr = [mh[2] + 1.4, ci[3] - 5.6, mh[2] + 6.0, ci[3] - 1.0];
  // the court's floor of beaten earth and lime, round the house and the well
  for (const p of cut(ci[0], ci[1], ci[2], ci[3], [mh, wr])) slab(ctx, 'plaster_grey', p, fl - 0.3, fl - 0.01);
  for (const s of [[wr[0], wr[1], wr[2], wr[1] + 0.45], [wr[0], wr[3] - 0.45, wr[2], wr[3]], [wr[0], wr[1] + 0.45, wr[0] + 0.45, wr[3] - 0.45], [wr[2] - 0.45, wr[1] + 0.45, wr[2], wr[3] - 0.45]]) {
    solid(ctx, C, s[0], fl - 0.3, s[1], s[2], fl + 0.7, s[3]); ctx.bag.add(DRESSED, box(s[0] - 0.03, fl + 0.7, s[1] - 0.03, s[2] + 0.03, fl + 0.8, s[3] + 0.03));
  }
  ctx.bag.add('opening', box(wr[0] + 0.45, fl - 0.29, wr[1] + 0.45, wr[2] - 0.45, fl - 0.27, wr[3] - 0.45));
  ctx.bag.add('water', fromTriangles([wr[0] + 0.45, fl - 0.2, wr[1] + 0.45, wr[0] + 0.45, fl - 0.2, wr[3] - 0.45, wr[2] - 0.45, fl - 0.2, wr[3] - 0.45, wr[0] + 0.45, fl - 0.2, wr[1] + 0.45, wr[2] - 0.45, fl - 0.2, wr[3] - 0.45, wr[2] - 0.45, fl - 0.2, wr[1] + 0.45]));
  // goods in the court: bales of cloth, jars, ivory, stacked by the storeroom doors
  for (let i = 0; i < 10; i++) {
    const side = i % 4, k = Math.floor(i / 4), u = (k + 0.7) * 7.5;
    const [x, z] = side === 0 ? [ci[0] + 5 + u, ci[1] + 1.4] : side === 1 ? [ci[2] - 1.4, ci[1] + 5 + u] : side === 2 ? [ci[2] - 5 - u, ci[3] - 1.4] : [ci[0] + 1.4, ci[1] + 9 + u];
    if (i % 3 === 0) ctx.bag.add('sacking', box(x - 0.5, fl, z - 0.35, x + 0.5, fl + 0.55, z + 0.35));
    else if (i % 3 === 1) for (let j = 0; j < 3; j++) ctx.bag.add('pottery_dark', lathe8(x - 0.5 + j * 0.5, fl, z));
    else ctx.bag.add('cloth_indigo', box(x - 0.45, fl, z - 0.3, x + 0.45, fl + 0.4, z + 0.3));
  }
}

function ringWall(cx, cz, r0, r1, y0, y1, n = 16) {
  const T = [];
  for (let k = 0; k < n; k++) {
    const a = 2 * Math.PI * k / n, b = 2 * Math.PI * (k + 1) / n, m = (a + b) / 2, P = (r, th, y) => [cx + Math.cos(th) * r, y, cz + Math.sin(th) * r], nn = [Math.cos(m), 0, Math.sin(m)];
    face(T, nn, P(r1, a, y0), P(r1, b, y0), P(r1, b, y1), P(r1, a, y1));
    face(T, nn.map((v) => -v), P(r0, a, y0), P(r0, b, y0), P(r0, b, y1), P(r0, a, y1));
    face(T, [0, 1, 0], P(r0, a, y1), P(r0, b, y1), P(r1, b, y1), P(r1, a, y1));
  }
  return T;
}
function discTris(cx, cz, r, y, n = 16) { const T = []; for (let k = 0; k < n; k++) { const a = 2 * Math.PI * k / n, b = 2 * Math.PI * (k + 1) / n; face(T, [0, 1, 0], [cx, y, cz], [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r], [cx + Math.cos(b) * r, y, cz + Math.sin(b) * r]); } return T; }
/** gate_stair: { rect, y0, y1, dir, base, landing } — a flight between terraces, walled both sides; a landing at its head. */
function gateStair(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, along = el.dir === 'n' || el.dir === 's' ? 'z' : 'x';
  flight(ctx, el.rect, el.y0, el.y1, el.dir, { base: el.base });
  const [ya, yb] = el.dir === 'n' || el.dir === 'w' ? [el.y1, el.y0] : [el.y0, el.y1];
  if (along === 'z') for (const xx of [x0 - 0.3, x1 + 0.3]) cheek(ctx, 'z', xx, 0.6, z0, z1, el.base, ya, yb);
  else for (const zz of [z0 - 0.3, z1 + 0.3]) cheek(ctx, 'x', zz, 0.6, x0, x1, el.base, ya, yb);
  if (el.landing) { solid(ctx, RAG, el.landing[0], el.base, el.landing[1], el.landing[2], el.y1 - 0.1, el.landing[3], false); slab(ctx, DRESSED, el.landing, el.y1 - 0.1, el.y1); }
}

export const HUSUNI = { gate_stair: gateStair, husuni_core: core, husuni_south: southCourt, husuni_stair: husuniStair, terrace_wall: terraceWall, beach_mosque: beachMosque };
void CARVED;
