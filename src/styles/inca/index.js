// Inca architecture at Machu Picchu (15th c.; docs/settlements/machu-picchu.md §4–§5): walls of
// white granite — finely fitted ashlar in the temples, rougher stones set in clay in the houses —
// leaning slightly inward, with trapezoidal doorways, niches and windows; steep gabled roofs of
// ichu grass on the houses, their gables of stone with roof pegs; the curved wall of the Temple
// of the Sun on its rock; the three-walled temples of the Sacred Plaza; the Intihuatana; terraces
// held by stone walls, stairs cut into the rock.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum, rod, quad, orientOutward } from '../../core/geom.js';
import '../qing/index.js';
import { rectRoof, beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---- the wall -------------------------------------------------------------------------------------
// A wall is laid along a frame (a straight line or an arc): u runs along it, v up, and the offset
// across it. Both faces lean in as they rise (the Inca batter, about 5°), so the wall is thickest at
// its foot. Openings are trapezoids, narrower at the top: doorways and windows go through, niches
// are sunk into one face; a double jamb is a larger trapezoid recess round the opening on the
// outer face. Corners are mitred where walls meet, the ends capped where a wall stops.

const TAPER = 0.78;                       // an opening's width at the top over its width at the foot [inferred from the trapezoids]
const lineFrame = (a, b) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  return { L, curved: false, at: (u) => [a[0] + ux * u, a[1] + uz * u], t: () => [ux, uz], n: () => [-uz, ux] };
};
const arcFrame = (c, r, a0, a1) => {
  const s = Math.sign(a1 - a0), ang = (u) => a0 + s * u / r;
  return {
    L: Math.abs(a1 - a0) * r, curved: true,
    at: (u) => [c[0] + Math.cos(ang(u)) * r, c[1] + Math.sin(ang(u)) * r],
    t: (u) => [-Math.sin(ang(u)) * s, Math.cos(ang(u)) * s],
    n: (u) => [-Math.cos(ang(u)) * s, -Math.sin(ang(u)) * s],
  };
};
/** Push triangle a b c, turned to face `want`. */
function tri(out, a, b, c, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * want[0] + ny * want[1] + nz * want[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
const quad4 = (out, a, b, c, d, want) => { tri(out, a, b, c, want); tri(out, a, c, d, want); };

/**
 * Build a wall along frame F: { y, h, th, mat, openings, ends: ['mitre'|'cap', …], out (+1|-1: the
 * side of the frame's normal that is outside) }. Openings: { kind 'door'|'window'|'niche', at, w, h,
 * sill, jamb (double jamb on the outer face), side (a niche's face, ±1; default the inner), depth }.
 */
function incaWall(bag, col, F, o) {
  const { y, h, th, mat } = o, L = F.L, out = o.out ?? -1, ends = o.ends ?? ['cap', 'cap'], ops = o.openings ?? [];
  const bat = Math.min(0.087 * h, th / 4), off = (v) => th / 2 - bat * v / h;
  const W = (u, v, k) => { const p = F.at(u), n = F.n(u); return [p[0] + n[0] * k, y + v, p[1] + n[1] * k]; };
  const T = [];
  const up = [0, 1, 0], down = [0, -1, 0], nrm = (u, s) => { const n = F.n(u); return [n[0] * s, 0, n[1] * s]; }, tng = (u, s) => { const t = F.t(u); return [t[0] * s, 0, t[1] * s]; };
  // the face's ends: a mitre grows the outer face and shrinks the inner by the wall's half-thickness
  const endU = (sg, e, v) => (ends[e] === 'mitre' ? (sg === out ? 1 : -1) * off(v) : 0);
  const uL = (sg, v) => -endU(sg, 0, v), uR = (sg, v) => L + endU(sg, 1, v);
  // the trapezoids: the opening's own, and the jamb's round it
  const trap = (op, outer) => {
    const w = op.w, hh = op.h, sill = op.kind === 'door' ? 0 : (op.sill ?? 1), g = outer ? 0.13 : 0;
    return { c: op.at, v0: op.kind === 'door' ? 0 : sill - g * 0.8, v1: sill + hh + g, wb: w / 2 + g, wt: w / 2 * TAPER + g, door: op.kind === 'door' };
  };
  const holeOn = (op, sg) => {
    if (op.kind === 'niche') return sg === (op.side ?? -out) ? trap(op, !!op.jamb) : null;
    return trap(op, !!op.jamb && sg === out);
  };
  const xAt = (t, side, v) => t.c + side * (t.wb + (t.wt - t.wb) * (v - t.v0) / (t.v1 - t.v0));
  // the two faces, in bands between the openings' sills and heads
  for (const sg of [1, -1]) {
    const holes = ops.map((op) => holeOn(op, sg)).filter(Boolean).sort((p, q) => p.c - q.c);
    const vs = [...new Set([0, h, ...holes.flatMap((t) => [t.v0, t.v1])])].filter((v) => v >= 0 && v <= h).sort((p, q) => p - q);
    for (let i = 0; i + 1 < vs.length; i++) {
      const va = vs[i], vb = vs[i + 1];
      if (vb - va < 1e-4) continue;
      const act = holes.filter((t) => t.v0 <= va + 1e-6 && t.v1 >= vb - 1e-6);
      const bounds = [[(v) => uL(sg, v)]];
      for (const t of act) { bounds[bounds.length - 1].push((v) => xAt(t, -1, v)); bounds.push([(v) => xAt(t, 1, v)]); }
      bounds[bounds.length - 1].push((v) => uR(sg, v));
      for (const [l, r] of bounds) {
        const a0 = l(va), a1 = l(vb), b0 = r(va), b1 = r(vb);
        if (Math.max(b0 - a0, b1 - a1) < 1e-4) continue;
        const k = F.curved ? Math.max(1, Math.ceil(Math.max(b0 - a0, b1 - a1) / 0.5)) : 1;
        for (let j = 0; j < k; j++) {
          const f0 = j / k, f1 = (j + 1) / k;
          const p0 = a0 + (b0 - a0) * f0, p1 = a0 + (b0 - a0) * f1, q0 = a1 + (b1 - a1) * f0, q1 = a1 + (b1 - a1) * f1;
          quad4(T, W(p0, va, sg * off(va)), W(p1, va, sg * off(va)), W(q1, vb, sg * off(vb)), W(q0, vb, sg * off(vb)), nrm((p0 + p1) / 2, sg));
        }
      }
    }
  }
  // the top, and the capped ends
  {
    const a0 = uL(1, h), b0 = uR(1, h), a1 = uL(-1, h), b1 = uR(-1, h), k = F.curved ? Math.max(1, Math.ceil(L / 0.5)) : 1;
    for (let j = 0; j < k; j++) {
      const f0 = j / k, f1 = (j + 1) / k;
      quad4(T, W(a0 + (b0 - a0) * f0, h, off(h)), W(a0 + (b0 - a0) * f1, h, off(h)), W(a1 + (b1 - a1) * f1, h, -off(h)), W(a1 + (b1 - a1) * f0, h, -off(h)), up);
    }
    for (const e of [0, 1]) if (ends[e] !== 'mitre') { const u = e ? L : 0; quad4(T, W(u, 0, off(0)), W(u, 0, -off(0)), W(u, h, -off(h)), W(u, h, off(h)), tng(u, e ? 1 : -1)); }
  }
  // the openings' reveals: jambs, heads, sills, the step of a double jamb, a niche's back
  const reveal = (t, kA, kB) => {
    // kA, kB (v) → offsets of the tunnel's two ends
    const edge = (P, Q, want) => quad4(T, W(P[0], P[1], kA(P[1])), W(Q[0], Q[1], kA(Q[1])), W(Q[0], Q[1], kB(Q[1])), W(P[0], P[1], kB(P[1])), want);
    const lb = [t.c - t.wb, t.v0], lt = [t.c - t.wt, t.v1], rb = [t.c + t.wb, t.v0], rt = [t.c + t.wt, t.v1];
    edge(lb, lt, tng(t.c, 1)); edge(rb, rt, tng(t.c, -1)); edge(lt, rt, down);
    if (!t.door) edge(lb, rb, up);
  };
  const ring = (A, B, k, want) => {
    // the flat ring between trapezoid A (outer) and B (inner) at offset k(v)
    const P = (t, side, top) => (top ? [t.c + side * t.wt, t.v1] : [t.c + side * t.wb, t.v0]);
    const q = (p1, p2, p3, p4) => quad4(T, W(p1[0], p1[1], k(p1[1])), W(p2[0], p2[1], k(p2[1])), W(p3[0], p3[1], k(p3[1])), W(p4[0], p4[1], k(p4[1])), want);
    q(P(A, -1, 0), P(A, -1, 1), P(B, -1, 1), P(B, -1, 0));
    q(P(A, 1, 0), P(A, 1, 1), P(B, 1, 1), P(B, 1, 0));
    q(P(A, -1, 1), P(A, 1, 1), P(B, 1, 1), P(B, -1, 1));
    if (!A.door) q(P(A, -1, 0), P(A, 1, 0), P(B, 1, 0), P(B, -1, 0));
  };
  const DJ = 0.14;
  for (const op of ops) {
    const core = trap(op, false), jam = op.jamb ? trap(op, true) : null;
    const jside = op.kind === 'niche' ? (op.side ?? -out) : out;
    const at = (s, d) => (v) => s * (off(v) - d);
    let startD = 0;
    if (jam) { reveal(jam, at(jside, 0), at(jside, DJ)); ring(jam, core, at(jside, DJ), nrm(op.at, jside)); startD = DJ; }
    if (op.kind === 'niche') {
      const d = op.depth ?? 0.28;
      reveal(core, at(jside, startD), at(jside, startD + d));
      const k = at(jside, startD + d), P = (sd, top) => (top ? [core.c + sd * core.wt, core.v1] : [core.c + sd * core.wb, core.v0]);
      quad4(T, W(...P(-1, 0), k(core.v0)), W(...P(1, 0), k(core.v0)), W(...P(1, 1), k(core.v1)), W(...P(-1, 1), k(core.v1)), nrm(op.at, jside));
    } else reveal(core, at(out, op.jamb ? DJ : 0), at(-out, 0));
  }
  bag.add(mat, fromTriangles(T));
  // collision: the wall but its doorways, which keep only their lintels
  const doors = ops.filter((d) => d.kind === 'door').map((d) => trap(d, false)).sort((p, q) => p.c - q.c);
  const solid = (s0, s1, y0, y1) => { const k = F.curved ? Math.max(1, Math.ceil((s1 - s0) / 1)) : 1; for (let j = 0; j < k; j++) col.segment(F.at(s0 + (s1 - s0) * j / k), F.at(s0 + (s1 - s0) * (j + 1) / k), th, y0, y1); };
  let s = 0;
  for (const d of doors) { if (d.c - d.wb - s > 0.05) solid(s, d.c - d.wb, y, y + h); solid(d.c - d.wb, d.c + d.wb, y + d.v1, y + h); s = d.c + d.wb; }
  if (L - s > 0.05) solid(s, L, y, y + h);
  return { off, bat };
}

/** Stone pegs standing out of a face: at [u, v] along frame F at offset k, sticking out by `len` along `dir` (±1 of the normal). */
function pegs(bag, F, y, list, k, dir, len = 0.24, r = 0.065) {
  for (const [u, v] of list) {
    const p = F.at(u), n = F.n(u), a = [p[0] + n[0] * (k - dir * 0.08), y + v, p[1] + n[1] * (k - dir * 0.08)], b = [p[0] + n[0] * (k + dir * len), y + v - 0.02, p[1] + n[1] * (k + dir * len)];
    bag.add('granite_rough', rod(a, b, r, 7));
  }
}

/** The four walls of a rectangle [x0, z0, x1, z1] (corners mitred), with openings per side { n, s, e, w }; `open` leaves one side out (the three-walled temples). */
function rectWalls(bag, col, rect, y, h, th, mat, opsBySide, open = null) {
  const [x0, z0, x1, z1] = rect;
  const sides = { n: [[x0, z0], [x1, z0]], e: [[x1, z0], [x1, z1]], s: [[x1, z1], [x0, z1]], w: [[x0, z1], [x0, z0]] }, order = ['n', 'e', 's', 'w'];
  const res = {};
  order.forEach((k, i) => {
    if (k === open) return;
    const ends = [order[(i + 3) % 4] === open ? 'cap' : 'mitre', order[(i + 1) % 4] === open ? 'cap' : 'mitre'];
    const F = lineFrame(...sides[k]);
    res[k] = { F, ...incaWall(bag, col, F, { y, h, th, mat, openings: opsBySide[k] ?? [], ends, out: -1 }) };
  });
  return res;
}

/**
 * inca_house: a house { rect, y, h, front, roof ('thatch' | 'none'), jamb (a double-jambed doorway:
 * the houses of the nobility), mat, seed }: four battered walls, a trapezoid doorway in the front,
 * niches in rows inside, now and then a window; stone gables at the short ends with pegs standing
 * out of them to tie the roof down, a steep roof of ichu thatch between them.
 */
function incaHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 2.6, th = el.th ?? 0.7, mat = el.mat || 'granite_rough';
  const along = x1 - x0 >= z1 - z0, f = el.front || 's', ops = {};
  for (const k of ['n', 'e', 's', 'w']) {
    const L = k === 'n' || k === 's' ? x1 - x0 : z1 - z0, list = (ops[k] = []);
    if (k === f) list.push({ kind: 'door', at: L / 2, w: 1.0, h: 1.95, jamb: !!el.jamb });
    // a row of niches inside, at chest height; a small window now and then on a long wall
    const n = Math.floor((L - 1.2) / 1.35), gable = along ? k === 'e' || k === 'w' : k === 'n' || k === 's';
    for (let i = 0; i < n; i++) {
      const at = 0.6 + (i + 0.5) * (L - 1.2) / n;
      if (k === f && Math.abs(at - L / 2) < 1.2) continue;
      if (!gable && k !== f && rand() < 0.12) list.push({ kind: 'window', at, w: 0.42, h: 0.55, sill: 1.25 });
      else if (rand() < 0.8) list.push({ kind: 'niche', at, w: 0.48, h: 0.68, sill: 1.05, depth: 0.26 });
    }
  }
  const walls = rectWalls(bag, col, el.rect, y, h, th, mat, ops);
  bag.add('granite_inca', box(x0 - th / 2 - 0.12, y - 0.3, z0 - th / 2 - 0.12, x1 + th / 2 + 0.12, y + 0.04, z1 + th / 2 + 0.12));
  col.floor([x0, z0, x1, z1], y + 0.04);
  // pegs inside under the wall-head, for hangings and the roof's poles [stated: World History Encyclopedia]
  for (const k of ['n', 'e', 's', 'w']) {
    const { F, off } = walls[k], list = [];
    for (let u = 0.9; u < F.L - 0.5; u += 1.6) list.push([u, h - 0.32]);
    pegs(bag, F, y, list, off(h - 0.32), 1, 0.16, 0.05);
  }
  if (el.roof === 'none') return;
  // the gables at the short ends: the wall carried up in a triangle, its pegs along the rakes
  const B = (along ? z1 - z0 : x1 - x0) / 2, A = (along ? x1 - x0 : z1 - z0) / 2, rise = B * 1.45;
  for (const k of along ? ['e', 'w'] : ['n', 's']) {
    const { F, off } = walls[k], o = off(h), L = F.L, g = [];
    const P = (u, v, s) => { const p = F.at(u), n = F.n(u); return [p[0] + n[0] * o * s, y + h + v, p[1] + n[1] * o * s]; };
    for (const s of [1, -1]) g.push(...P(-o, 0, s), ...P(L + o, 0, s), ...P(L / 2, rise, s));
    quad(g, P(-o, 0, 1), P(L / 2, rise, 1), P(L / 2, rise, -1), P(-o, 0, -1));
    quad(g, P(L + o, 0, 1), P(L / 2, rise, 1), P(L / 2, rise, -1), P(L + o, 0, -1));
    bag.add(mat, fromTriangles(orientOutward(g)));
    const list = [];
    for (const fr of [0.28, 0.55]) for (const sd of [-1, 1]) list.push([L / 2 + sd * (1 - fr) * (L / 2 + o), fr * rise - 0.3]);
    list.push([L / 2, rise - 0.55]);
    pegs(bag, F, y + h, list, -o, -1, 0.26, 0.07);
  }
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  rectRoof({ c: [cx, cz], A: A + th / 2 + 0.35, B: B + th / 2 + 0.55, y: y + h - 0.12, rise: rise + 0.5, kind: 'gable', sweep: 0, p: 1, curl: false, alongZ: !along, mat: 'ichu', soffit: 'ichu' }, bag);
}

/**
 * inca_temple: a temple of fine ashlar { rect, y, h, open (a side left open — the three-walled
 * temples of the Sacred Plaza), windowSide, windows, door ({ side, jamb }) } on a platform of large
 * blocks: niches in rows on the inner faces, double-jambed where `jamb`; trapezoid windows.
 */
function incaTemple(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3.4, th = el.th ?? 1.0, ops = {};
  bag.add('granite_inca', box(x0 - th / 2 - 0.5, y - 1.2, z0 - th / 2 - 0.5, x1 + th / 2 + 0.5, y, z1 + th / 2 + 0.5));
  col.floor([x0 - th / 2 - 0.5, z0 - th / 2 - 0.5, x1 + th / 2 + 0.5, z1 + th / 2 + 0.5], y);
  col.rect([x0 - th / 2 - 0.5, z0 - th / 2 - 0.5, x1 + th / 2 + 0.5, z1 + th / 2 + 0.5], y - 1.2, y - 0.31);
  for (const k of ['n', 'e', 's', 'w']) {
    if (k === el.open) continue;
    const L = k === 'n' || k === 's' ? x1 - x0 : z1 - z0, list = (ops[k] = []);
    const nw = k === el.windowSide ? (el.windows ?? 3) : 0;
    for (let i = 0; i < nw; i++) list.push({ kind: 'window', at: (i + 1) * L / (nw + 1), w: 1.25, h: 1.45, sill: 0.95, jamb: !!el.jamb });
    if (el.door?.side === k) list.push({ kind: 'door', at: L / 2, w: 1.15, h: 2.3, jamb: !!el.door.jamb });
    else if (!nw) { const n = Math.max(1, Math.floor((L - 1.4) / 1.6)); for (let i = 0; i < n; i++) list.push({ kind: 'niche', at: 0.7 + (i + 0.5) * (L - 1.4) / n, w: 0.72, h: 1.1, sill: 1.0, depth: 0.34, jamb: !!el.jamb }); }
  }
  rectWalls(bag, col, el.rect, y, h, th, 'granite_inca', ops, el.open);
}

/**
 * torreon: the Temple of the Sun — a curved wall of the finest ashlar round the top of a rock
 * { c, r, y, h, from, to (the arc's angles) }, its two windows to the east set on the solstice
 * sunrises, the larger window to the north with its double jamb; the carved rock inside, its flat
 * altar; the platform it stands on.
 */
function torreon(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, y = el.y ?? 0, h = el.h ?? 4.5, a0 = el.from ?? -Math.PI * 0.9, a1 = el.to ?? Math.PI * 0.4;
  // angles: +x east, +z south; a sunrise azimuth A (from north, clockwise) lies at atan2(-cos A, sin A)
  const uOf = (az) => { const a = Math.atan2(-Math.cos(az * Math.PI / 180), Math.sin(az * Math.PI / 180)); return (a - a0) * r; };
  const F = arcFrame(el.c, r, a0, a1);
  incaWall(bag, col, F, {
    y, h, th: 1.0, mat: 'granite_inca', ends: ['cap', 'cap'], out: -1,
    openings: [
      { kind: 'window', at: uOf(65), w: 0.62, h: 0.82, sill: 1.35 },        // the June solstice sunrise
      { kind: 'window', at: uOf(113), w: 0.62, h: 0.82, sill: 1.35 },       // the December solstice sunrise
      { kind: 'window', at: uOf(0), w: 0.9, h: 1.05, sill: 1.2, jamb: true },   // the north window
    ],
  });
  // the sacred rock inside: a weathered outcrop carved flat on top into a long altar, a step cut in its side
  const rr = r - 0.5;
  bag.add('granite_rough', lathe([[rr * 0.98, -0.2], [rr * 0.9, 0.5], [rr * 0.72, 1.05], [rr * 0.55, 1.32], [rr * 0.42, 1.42], [0.001, 1.42]], 20, (t, i) => 1 + (i > 0 ? 0.09 * Math.sin(t * 3 + i * 1.3) + 0.05 * Math.sin(t * 7 - i) : 0), cx, y, cz));
  bag.add('granite_inca', frustum([cx - 1.5, cz - 0.55, cx + 1.3, cz + 0.55], y + 1.25, y + 1.62, 0.04, 0.04, 0.04, 0.04));
  bag.add('granite_inca', frustum([cx - 2.6, cz + 0.9, cx - 1.4, cz + 1.9], y + 0.4, y + 0.98, 0.03, 0.03, 0.03, 0.03));
  col.circle(cx, cz, rr * 0.8, y, y + 1.4);
  // the platform under it, of large blocks
  bag.add('granite_inca', box(cx - r - 3, y - 3, cz - r - 3, cx + r + 3, y, cz + r + 3));
  col.floor([cx - r - 3, cz - r - 3, cx + r + 3, cz + r + 3], y);
}

/**
 * intihuatana: the carved stone on the top of its terraced hill { c, y }: an outcrop of the
 * bedrock cut into planes and steps, a flat platform on it, and on that the upright post, its
 * top cut on a slant, leaning 13° to the north [stated: Wikipedia "Intihuatana"].
 */
function intihuatana(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y;
  // the outcrop, worn, a little irregular
  bag.add('granite_rough', lathe([[1.9, -0.3], [1.85, 0.35], [1.6, 0.72], [1.25, 0.86], [0.001, 0.86]], 14, (t, i) => (1 + 0.1 * Math.sin(t * 2 + 0.7) + 0.06 * Math.sin(t * 5 + i)) * (Math.abs(Math.cos(t)) * 0.35 + 0.65), cx, y, cz));
  // the carved planes: the main platform, a lower ledge on the east, a step on the south
  bag.add('granite_rough', frustum([cx - 1.05, cz - 0.7, cx + 0.95, cz + 0.6], y + 0.7, y + 1.12, 0.03, 0.03, 0.03, 0.03));
  bag.add('granite_rough', frustum([cx + 0.6, cz - 0.95, cx + 1.3, cz + 0.2], y + 0.2, y + 0.86, 0.02, 0.02, 0.02, 0.02));
  bag.add('granite_rough', frustum([cx - 0.7, cz + 0.3, cx + 0.2, cz + 1.1], y - 0.1, y + 0.55, 0.02, 0.02, 0.02, 0.02));
  // the post: a squared block about 0.6 m high, leaning north, its top cut on a slant
  const lean = Math.tan(13 * Math.PI / 180), hp = 0.62, b = [cx - 0.24, cz - 0.17, cx + 0.24, cz + 0.17], y0 = y + 1.06;
  const lo = [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]];
  const tops = lo.map(([x, z], i) => [x, y0 + hp + (i < 2 ? 0.07 : -0.05) - (x - cx) * 0.06, z - hp * lean]);
  const base = lo.map(([x, z]) => [x, y0, z]), g = [];
  quad(g, tops[0], tops[3], tops[2], tops[1]);
  for (let i = 0; i < 4; i++) quad(g, base[i], tops[i], tops[(i + 1) % 4], base[(i + 1) % 4]);
  bag.add('granite_rough', fromTriangles(orientOutward(g)));
  col.rect([cx - 1.6, cz - 1, cx + 1.6, cz + 1], y, y + 1.12);
  col.floor([cx - 1.05, cz - 0.7, cx + 0.95, cz + 0.6], y + 1.12);
}

/**
 * ring_wall: a terrace's retaining wall along a polyline { pts, y0, y1, mat }: the outer face
 * battered back as it rises, the top a band of stones at the terrace's level; the uphill side filled.
 * The outside is the side away from the polyline's mean.
 */
function ringWall(el, { bag, col }) {
  const pts = el.pts, n = pts.length, cx = pts.reduce((a, p) => a + p[0], 0) / n, cz = pts.reduce((a, p) => a + p[1], 0) / n;
  const yb = el.y0 - 0.6, yt = el.y1 + 0.05, half = 0.45, lean = Math.min(0.3, (yt - yb) * 0.12);
  // the outward normal at each point (mitred), turned away from the polyline's mean
  const nor = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
    let nx = -dz / l, nz = dx / l;
    if (nx * (p[0] - cx) + nz * (p[1] - cz) < 0) { nx = -nx; nz = -nz; }
    return [nx, nz];
  });
  const at = (i, k, yy) => [pts[i][0] + nor[i][0] * k, yy, pts[i][1] + nor[i][1] * k], t = [];
  for (let i = 0; i + 1 < n; i++) {
    const out = [nor[i][0], 0.1, nor[i][1]];
    quad4(t, at(i, half + lean, yb), at(i + 1, half + lean, yb), at(i + 1, half, yt), at(i, half, yt), out);
    quad4(t, at(i, half, yt), at(i + 1, half, yt), at(i + 1, -half, yt), at(i, -half, yt), [0, 1, 0]);
    quad4(t, at(i, -half, yt), at(i + 1, -half, yt), at(i + 1, -half, el.y1 - 0.4), at(i, -half, el.y1 - 0.4), [-nor[i][0], 0, -nor[i][1]]);
    col.segment(pts[i], pts[i + 1], 0.9, yb, yt - 0.3);
  }
  for (const i of [0, n - 1]) {
    const j = i ? i - 1 : 1, d = [pts[i][0] - pts[j][0], 0, pts[i][1] - pts[j][1]];
    quad4(t, at(i, half + lean, yb), at(i, -half, yb), at(i, -half, yt), at(i, half, yt), d);
  }
  bag.add(el.mat || 'granite_rough', fromTriangles(t));
}

/**
 * flying_stair: steps of long stones set into a terrace wall and standing out of its face, rising
 * across it on a slant { a, b (the wall's line, the outside to the right of a→b), from (where the
 * flight starts along it), y0, y1, dir (±1: the way it climbs along the wall) } [stated at Moray:
 * "cantilevered steps to connect the levels"; inferred for Machu Picchu].
 */
function flyingStair(el, { bag, col }) {
  const [a, b] = [el.a, el.b], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz, nz = -ux;
  const n = Math.max(3, Math.round((el.y1 - el.y0) / 0.36)), rise = (el.y1 - el.y0) / n, dir = el.dir ?? 1, face = el.face ?? 0.45;
  for (let k = 1; k < n; k++) {
    const s = el.from + dir * k * 0.42, yy = el.y0 + k * rise, lean = Math.min(0.3, (el.y1 - el.y0 + 0.65) * 0.12) * (1 - (yy - el.y0 + 0.6) / (el.y1 - el.y0 + 0.65));
    const c = [a[0] + ux * s, a[1] + uz * s], k0 = face - 0.3, k1 = face + lean + 0.42, t = [];
    beamTris(t, [c[0] + nx * k0, yy - 0.15, c[1] + nz * k0], [c[0] + nx * k1, yy - 0.15, c[1] + nz * k1], 0.27, 0.15);
    bag.add('granite_rough', fromTriangles(t));
    col.segment([c[0] + nx * (face + lean), c[1] + nz * (face + lean)], [c[0] + nx * k1, c[1] + nz * k1], 0.54, yy - 0.15, yy);
  }
}

registerStyle('inca', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, inca_house: incaHouse, inca_temple: incaTemple, torreon, intihuatana, ring_wall: ringWall, flying_stair: flyingStair },
  objects: {},
});
