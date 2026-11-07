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
import { houseInterior, INCA_LIFE } from './life.js';

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
  // the great stones of the lowest courses (o.stones: their top, metres above the foot): polygonal
  // blocks, each face cushioned, its edges bevelled back into the joints
  if (o.stones) {
    const S = [], rand = rng(o.seed || Math.round(L * 1000));
    for (const sg of [1, -1]) {
      const doorsU = ops.filter((d) => d.kind === 'door').map((d) => trap(d, !!d.jamb && sg === out)).map((t) => [t.c - t.wb - 0.04, t.c + t.wb + 0.04]);
      const a = uL(sg, o.stones) + 0.04, b = uR(sg, o.stones) - 0.04;
      // the spans of face between the doorways
      const spans = [];
      let s0 = a;
      for (const [d0, d1] of doorsU.sort((p, q) => p[0] - q[0])) { if (d0 - s0 > 0.5) spans.push([s0, d0]); s0 = Math.max(s0, d1); }
      if (b - s0 > 0.5) spans.push([s0, b]);
      for (const [p, q] of spans) {
        // joints: slanting, so the blocks are polygons; the course line between them kinked at each joint
        const n = Math.max(1, Math.round((q - p) / (1.1 + rand() * 0.9)));
        const ju = [], mid = [];
        for (let i = 0; i <= n; i++) { const u = p + (q - p) * i / n; ju.push([u, i && i < n ? u + (rand() - 0.5) * 0.3 : u]); mid.push(o.stones * (0.42 + rand() * 0.2)); }
        for (let i = 0; i < n; i++) {
          const tall = rand() < 0.3;                         // now and then one stone the full height
          for (const row of tall ? ['full'] : ['low', 'high']) {
            const vb = (k) => (row === 'high' ? mid[k] : 0), vt = (k) => (row === 'low' ? mid[k] : o.stones);
            const uAt = (k, v) => ju[k][0] + (ju[k][1] - ju[k][0]) * v / o.stones;
            const C = [[uAt(i, vb(i)), vb(i)], [uAt(i + 1, vb(i + 1)), vb(i + 1)], [uAt(i + 1, vt(i + 1)), vt(i + 1)], [uAt(i, vt(i)), vt(i)]];
            const cu = C.reduce((s, c) => s + c[0], 0) / 4, cv = C.reduce((s, c) => s + c[1], 0) / 4;
            const bevel = 0.045 + rand() * 0.02, proud = 0.025 + rand() * 0.02;
            const inner = C.map(([u, v]) => { const du = u - cu, dv = v - cv, l = Math.hypot(du, dv) || 1; return [u - du / l * bevel * 1.4, v - dv / l * bevel]; });
            const P = ([u, v], k) => W(u, v, sg * (off(v) + k));
            const want = nrm(cu, sg);
            quad4(S, P(inner[0], proud), P(inner[1], proud), P(inner[2], proud), P(inner[3], proud), want);
            for (let e = 0; e < 4; e++) { const f = (e + 1) % 4; quad4(S, P(C[e], -0.02), P(C[f], -0.02), P(inner[f], proud), P(inner[e], proud), want); }
          }
        }
      }
    }
    bag.add(mat, fromTriangles(S));
  }
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
function rectWalls(bag, col, rect, y, h, th, mat, opsBySide, open = null, extra = {}) {
  const [x0, z0, x1, z1] = rect;
  const sides = { n: [[x0, z0], [x1, z0]], e: [[x1, z0], [x1, z1]], s: [[x1, z1], [x0, z1]], w: [[x0, z1], [x0, z0]] }, order = ['n', 'e', 's', 'w'];
  const res = {};
  order.forEach((k, i) => {
    if (k === open) return;
    const ends = [order[(i + 3) % 4] === open ? 'cap' : 'mitre', order[(i + 1) % 4] === open ? 'cap' : 'mitre'];
    const F = lineFrame(...sides[k]);
    res[k] = { F, ...incaWall(bag, col, F, { y, h, th, mat, openings: opsBySide[k] ?? [], ends, out: -1, ...extra, seed: (extra.seed ?? 1) * 5 + i }) };
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
  // the things of the house: the stove, the grinding stone, the mats, the urpu, pots in the niches
  if (!el.empty) houseInterior(bag, col, el, walls, ops, f);
  // pegs inside under the wall-head, for hangings and the roof's poles [stated: World History Encyclopedia]
  for (const k of ['n', 'e', 's', 'w']) {
    const { F, off } = walls[k], list = [];
    for (let u = 0.9; u < F.L - 0.5; u += 1.6) list.push([u, h - 0.32]);
    pegs(bag, F, y, list, off(h - 0.32), 1, 0.16, 0.05);
  }
  if (el.roof === 'none') return;
  gableRoof(bag, walls, el.rect, y, h, th, mat);
}

/** The stone gables at a building's short ends (the wall carried up in a triangle, its pegs along the rakes) and the steep roof of ichu thatch between them. */
function gableRoof(bag, walls, rect, y, h, th, mat) {
  const [x0, z0, x1, z1] = rect, along = x1 - x0 >= z1 - z0;
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
 * temples of the Sacred Plaza and the wayronas), windowSide, windows, blind (blind windows — niches
 * of the windows' size — either side of them), door ({ side, jamb }), niches ({ side: count }),
 * pegs ({ side: count }: great stone pegs high on that wall's inner face), altar ({ side, w, d, h }:
 * a great block against that wall), stones (the height of the great stones in the lowest courses),
 * roof ('thatch': gables on the short sides, when the open side is a long one), seed } on a platform:
 * niches in rows on the inner faces, double-jambed where `jamb`; trapezoid windows.
 */
function incaTemple(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3.4, th = el.th ?? 1.0, ops = {}, rand = rng(el.seed || 5);
  // the platform: a slab of fine stone, its edge a course of long kerb blocks
  const P = [x0 - th / 2 - 0.5, z0 - th / 2 - 0.5, x1 + th / 2 + 0.5, z1 + th / 2 + 0.5];
  bag.add('granite_inca', box(P[0] + 0.02, y - 1.2, P[1] + 0.02, P[2] - 0.02, y - 0.03, P[3] - 0.02));
  for (const [p, q, nx, nz] of [[[P[0], P[1]], [P[2], P[1]], 0, -1], [[P[2], P[1]], [P[2], P[3]], 1, 0], [[P[2], P[3]], [P[0], P[3]], 0, 1], [[P[0], P[3]], [P[0], P[1]], -1, 0]]) {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uz = (q[1] - p[1]) / L;
    for (let u = 0.52; u < L - 0.05;) {
      let l = Math.min(L - u, 0.9 + rand() * 1.1); if (L - u - l < 0.45) l = L - u;
      const a = [p[0] + ux * (u + 0.015) - nx * 0.25, y - 1.2, p[1] + uz * (u + 0.015) - nz * 0.25], b = [p[0] + ux * (u + l - 0.015) - nx * 0.25, y - 1.2, p[1] + uz * (u + l - 0.015) - nz * 0.25];
      const t = []; beamTris(t, a, b, 0.26, 1.2); bag.add('granite_inca', fromTriangles(t));
      u += l;
    }
  }
  col.floor(P, y);
  col.rect(P, y - 1.2, y - 0.31);
  for (const k of ['n', 'e', 's', 'w']) {
    if (k === el.open) continue;
    const L = k === 'n' || k === 's' ? x1 - x0 : z1 - z0, list = (ops[k] = []);
    const nw = k === el.windowSide ? (el.windows ?? 3) : 0, nb = k === el.windowSide && el.blind ? 2 : 0;
    for (let i = 0; i < nw + nb; i++) {
      const at = (i + 1) * L / (nw + nb + 1), blind = nb && (i === 0 || i === nw + nb - 1);
      list.push(blind ? { kind: 'niche', at, w: 1.0, h: 1.3, sill: 1.0, depth: 0.4, jamb: !!el.jamb } : { kind: 'window', at, w: el.win?.w ?? 1.25, h: el.win?.h ?? 1.45, sill: el.win?.sill ?? 0.95, jamb: !!el.jamb });
    }
    if (el.door?.side === k) list.push({ kind: 'door', at: L / 2, w: 1.15, h: 2.3, jamb: !!el.door.jamb });
    else if (!nw) { const n = el.niches?.[k] ?? Math.max(1, Math.floor((L - 1.4) / 1.6)); for (let i = 0; i < n; i++) list.push({ kind: 'niche', at: 0.7 + (i + 0.5) * (L - 1.4) / n, w: 0.72, h: 1.1, sill: 1.0, depth: 0.34, jamb: !!el.jamb }); }
  }
  const walls = {};
  {
    const sides = { n: [[x0, z0], [x1, z0]], e: [[x1, z0], [x1, z1]], s: [[x1, z1], [x0, z1]], w: [[x0, z1], [x0, z0]] }, order = ['n', 'e', 's', 'w'];
    order.forEach((k, i) => {
      if (k === el.open) return;
      const ends = [order[(i + 3) % 4] === el.open ? 'cap' : 'mitre', order[(i + 1) % 4] === el.open ? 'cap' : 'mitre'];
      const F = lineFrame(...sides[k]);
      walls[k] = { F, ...incaWall(bag, col, F, { y, h, th, mat: 'granite_inca', openings: ops[k] ?? [], ends, out: -1, stones: el.stones, seed: (el.seed || 5) * 7 + i }) };
    });
  }
  // great pegs high on a wall's inner face [stated: the Main Temple's six, theonlyperuguide]
  for (const [k, n] of Object.entries(el.pegs ?? {})) {
    const { F, off } = walls[k], list = [];
    for (let i = 0; i < n; i++) list.push([0.9 + (i + 0.5) * (F.L - 1.8) / n, h - 0.45]);
    pegs(bag, F, y, list, off(h - 0.45), 1, 0.3, 0.085);
  }
  // the altar: one great block of fine granite against the wall, its edges eased
  if (el.altar) {
    const { side, w = 4.2, d = 0.9, h: ah = 0.95 } = el.altar, { F, off } = walls[side], k0 = off(0) - 0.04;
    const c = F.at(F.L / 2), n = F.n(F.L / 2), t = F.t(F.L / 2), q = (u, k) => [c[0] + t[0] * u + n[0] * k, c[1] + t[1] * u + n[1] * k];
    const pts = [q(-w / 2, k0), q(w / 2, k0), q(w / 2, k0 + d), q(-w / 2, k0 + d)], xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    bag.add('granite_inca', frustum([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y - 0.05, y + ah, 0.04, 0.04, 0.04, 0.04));
    col.rect([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y, y + ah);
  }
  if (el.roof === 'thatch') {
    gableRoof(bag, walls, el.rect, y, h, th, 'granite_inca');
    // over the open side, a beam from gable wall to gable wall carries the eaves
    if (el.open) {
      const [a, b] = { n: [[x0, z0], [x1, z0]], e: [[x1, z0], [x1, z1]], s: [[x1, z1], [x0, z1]], w: [[x0, z1], [x0, z0]] }[el.open];
      bag.add('timber', rod([a[0], y + h - 0.2, a[1]], [b[0], y + h - 0.2, b[1]], 0.13, 8));
    }
  }
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
  if (el.tomb) { tombRock(el, { bag, col }); return; }
  // the platform under it, of large blocks
  bag.add('granite_inca', box(cx - r - 3, y - 3, cz - r - 3, cx + r + 3, y, cz + r + 3));
  col.floor([cx - r - 3, cz - r - 3, cx + r + 3, cz + r + 3], y);
}

/**
 * The Torreón's rock and the Royal Tomb under it (el.tomb: { side 'e', at (along that side, from
 * its start), w (the mouth's width), d (the cave's depth) }): the platform's faces of battered fine
 * ashlar, great stones in their lowest courses, its top a slab of the living rock; in the east face
 * the mouth of the cave, a trapezoid; inside, the cave lined with fine masonry — two great niches
 * and two small, stone cylinders standing out high on the walls — the rock of its roof bulging
 * down, and the altar carved in the rock, a hemicycle of three steps [stated: Terandes, "Royal Tomb"].
 */
function tombRock(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, y = el.y, T = el.tomb, R = [cx - r - 3, cz - r - 3, cx + r + 3, cz + r + 3], th = 1.0, base = -0.5, H = y - base;
  const mouthAt = T.at, mw = T.w ?? 2.4, mh = 2.3 - base, cd = T.d ?? 4;
  const walls = rectWalls(bag, col, R, base, H, th, 'granite_inca', { e: [{ kind: 'door', at: mouthAt, w: mw, h: mh }] }, null, { stones: 1.55, seed: 29 });
  // the great stones of the faces, outside, below the mouth's head
  const off = walls.e.off;
  // the top: the rock, cut flat, the joints of the wall-heads round it
  const ti = off(H), S = [R[0] + ti, R[1] + ti, R[2] - ti, R[3] - ti];
  bag.add('granite_rough', box(S[0], y - 0.55, S[1], S[2], y, S[3]));
  col.floor([R[0] - th / 2, R[1] - th / 2, R[2] + th / 2, R[3] + th / 2], y);
  // the cave: its masonry lining (a back wall, two side walls running into the face's wall)
  const ez = R[1] + mouthAt, ex = R[2] - off(0), bx = ex - cd, hw = mw / 2 + 0.9, ch = y - 0.5 - base, fl = 0.05;
  const back = lineFrame([bx, ez + hw], [bx, ez - hw]);
  const bw = incaWall(bag, col, back, { y: base, h: ch, th: 0.7, mat: 'granite_inca', ends: ['mitre', 'mitre'], out: -1, openings: [
    { kind: 'niche', at: hw - 0.85, w: 0.75, h: 1.25, sill: 1.0 - base, depth: 0.32, jamb: true },
    { kind: 'niche', at: hw + 0.85, w: 0.75, h: 1.25, sill: 1.0 - base, depth: 0.32, jamb: true },
  ] });
  for (const sd of [-1, 1]) {
    const zz = ez + sd * hw, F = lineFrame(sd < 0 ? [bx, zz] : [ex + 0.35, zz], sd < 0 ? [ex + 0.35, zz] : [bx, zz]);
    const sw = incaWall(bag, col, F, { y: base, h: ch, th: 0.7, mat: 'granite_inca', ends: sd < 0 ? ['mitre', 'cap'] : ['cap', 'mitre'], out: -1, openings: [
      { kind: 'niche', at: sd < 0 ? cd * 0.45 : F.L - cd * 0.45, w: 0.42, h: 0.6, sill: 1.25 - base, depth: 0.26 },
    ] });
    // the stone cylinders high on the walls
    const list = []; for (const f of [0.25, 0.75]) list.push([f * cd + (sd < 0 ? 0 : F.L - cd), ch - 0.4]);
    pegs(bag, F, base, list, sw.off(ch - 0.4), 1, 0.22, 0.075);
  }
  { const list = [[hw - 1.7, ch - 0.4], [hw, ch - 0.4], [hw + 1.7, ch - 0.4]]; pegs(bag, back, base, list, bw.off(ch - 0.4), 1, 0.22, 0.075); }
  // the rock of the roof, bulging down out of the slab
  for (const [fx, fz, s] of [[0.35, -0.3, 1.0], [0.7, 0.35, 0.8], [0.15, 0.45, 0.6]]) {
    const px = bx + 0.35 + (ex - bx - 0.7) * fx, pz = ez + fz * hw, rr = 0.9 * s;
    bag.add('granite_rough', lathe([[0.001, 0], [rr * 0.7, 0.08], [rr, 0.28], [rr * 0.85, 0.5], [rr * 0.5, 0.62], [0.001, 0.66]], 10, (t, i) => 1 + 0.12 * Math.sin(t * 3 + i + fx * 9), px, y - 0.55 - 0.32 * s, pz));
  }
  // the altar carved in the rock, a hemicycle of three steps against the back wall
  const a0 = bx + bw.off(0) - 0.05;
  bag.add('granite_inca', lathe([[1.45, 0], [1.45, 0.3], [1.08, 0.3], [1.08, 0.6], [0.72, 0.6], [0.72, 0.9], [0.001, 0.9]], 28, null, a0, fl - 0.01, ez));
  bag.add('granite_rough', box(bx + 0.2, -0.3, ez - hw - 0.1, ex + 0.2, fl, ez + hw + 0.1));
  col.floor([bx + 0.2, ez - hw, ex, ez + hw], fl);
  col.circle(a0, ez, 1.45, fl, fl + 0.9);
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

/** An upright block a→b (plan points) of half-width w from y0 to y1, as triangles into t. */
const slab = (t, a, b, w, y0, y1) => beamTris(t, [a[0], y0, a[1]], [b[0], y0, b[1]], w, y1 - y0);

/**
 * inca_canal: the stone channel that brings the spring's water into the town { pts: [[x, z, y]…]
 * (y: the ground under it) }: a channel 11 cm wide and 13 deep between kerbs of cut stone, its bed
 * of stone, laid in blocks along the ground [stated: 749 m long, 10–12 cm wide, 10–16 cm deep,
 * stone-lined, ~3% fall — waterhistory.org]; the water in it.
 */
function incaCanal(el, { bag }) {
  const S = [], Wt = [], pts = el.pts, rand = rng(el.seed || 13);
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az, ay] = pts[i], [bx, bz, by] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    const yy = Math.min(ay, by);
    // the kerbs, in blocks with their joints; the bed
    for (let u = 0; u < L - 0.02;) {
      const l = Math.min(L - u, 0.55 + rand() * 0.5);
      for (const sd of [-1, 1]) {
        const k = sd * 0.125, a = [ax + ux * (u + 0.01) + nx * k, az + uz * (u + 0.01) + nz * k], b = [ax + ux * (u + l - 0.01) + nx * k, az + uz * (u + l - 0.01) + nz * k];
        slab(S, a, b, 0.07 + rand() * 0.01, yy - 0.18, yy + 0.07 + rand() * 0.015);
      }
      u += l;
    }
    // the bed (running a little past the segment's ends so the corners close) and the water over it
    const e = 0.06, A = [ax - ux * e, az - uz * e], B = [bx + ux * e, bz + uz * e];
    slab(S, A, B, 0.06, yy - 0.2, yy - 0.06);
    slab(Wt, A, B, 0.056, yy - 0.08, yy - 0.01);
  }
  bag.add('granite_rough', fromTriangles(S));
  bag.add('water', fromTriangles(Wt));
}

/**
 * inca_fountain: one of the sixteen fountains of the stairway { c: [x, z] (the court's centre), y
 * (its floor), ox, oz (the unit vector from the back wall to the front), w (the court's width,
 * across), d (its depth, back to front), stairSide (±1: the side, across, the stair is on), last }:
 * a little court partly enclosed by walls about 1.2 m high, open at the front corners; in its back
 * wall the channel comes out over a cut stone whose sharp lip throws a jet, to fill a jar; the water
 * gathers in a stone basin in the floor and runs out by a round drain [stated: waterhistory.org;
 * ancientengrtech.wisc.edu]. The back wall stands against the terrace wall behind it.
 */
function incaFountain(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, ox = el.ox, oz = el.oz, px = -oz, pz = ox, w = el.w ?? 2.2, d = el.d ?? 1.8, H = 1.2;
  // local (f: forward from the back wall, s: across) → plan
  const Q = (f, s) => [cx + ox * (f - d / 2) + px * s, cz + oz * (f - d / 2) + pz * s];
  const S = [];
  // the back wall: from inside the terrace wall's batter out to its face, fine stones in courses
  const bt = 0.5;
  slab(S, Q(-bt / 2 - 0.25, -w / 2 - 0.2), Q(-bt / 2 - 0.25, w / 2 + 0.2), bt / 2 + 0.25, y - 0.2, y + H + 0.15);
  col.segment(Q(-0.25, -w / 2), Q(-0.25, w / 2), 0.5, y, y + H + 0.15);
  // the side walls, the front corners left open for the way in
  for (const sd of [-1, 1]) {
    const a = Q(-0.1, sd * (w / 2 + 0.2)), b = Q(d - 0.95, sd * (w / 2 + 0.2));
    slab(S, a, b, 0.2, y - 0.2, y + H);
    col.segment(a, b, 0.4, y, y + H);
  }
  // the parapet along the front, on the terrace wall's head
  const fa = Q(d, -w / 2 - 0.4), fb = Q(d, w / 2 + 0.4);
  slab(S, fa, fb, 0.2, y - 0.15, y + 0.95);
  col.segment(fa, fb, 0.4, y, y + 0.95);
  bag.add('granite_inca', fromTriangles(S));
  // the spout: a cut stone on the back wall's head, its channel ending in a sharp lip over the basin
  const sp = [];
  const lipF = 0.16, yT = y + H + 0.15;
  slab(sp, Q(-0.3, -0.24), Q(lipF, -0.24), 0.06, yT - 0.22, yT + 0.06);
  slab(sp, Q(-0.3, 0.24), Q(lipF, 0.24), 0.06, yT - 0.22, yT + 0.06);
  slab(sp, Q(-0.3, 0), Q(lipF, 0), 0.19, yT - 0.24, yT - 0.08);
  bag.add('granite_inca', fromTriangles(sp));
  // the water: in the channel, and the jet falling from the lip in a curve to the basin
  const wv = []; slab(wv, Q(-0.3, 0), Q(lipF - 0.01, 0), 0.1, yT - 0.09, yT - 0.05); bag.add('water', fromTriangles(wv));
  const bc = 0.52, by = y + 0.06;
  // the jet: carried out at an even pace while it falls ever faster
  let prev = [Q(lipF, 0), yT - 0.07];
  for (let k = 1; k <= 6; k++) {
    const t = k / 6, cur = [Q(lipF + (bc - lipF) * t, 0), yT - 0.07 - (yT - 0.07 - by) * t * t];
    bag.add('water_jet', rod([prev[0][0], prev[1], prev[0][1]], [cur[0][0], cur[1], cur[0][1]], 0.026 - 0.008 * t, 5));
    prev = cur;
  }
  // the basin: a block of stone sunk in the floor, its hollow holding the water; the drain beside it
  const bf = lipF + 0.18, bw2 = 0.42, bd = 0.62;
  const R = [Q(bf - 0.1, -bw2 - 0.1), Q(bf + bd + 0.1, bw2 + 0.1)], xs = [R[0][0], R[1][0]], zs = [R[0][1], R[1][1]];
  const rim = [];
  slab(rim, Q(bf - 0.1, -bw2 - 0.05), Q(bf + bd + 0.1, -bw2 - 0.05), 0.05, y - 0.25, y + 0.14);
  slab(rim, Q(bf - 0.1, bw2 + 0.05), Q(bf + bd + 0.1, bw2 + 0.05), 0.05, y - 0.25, y + 0.14);
  slab(rim, Q(bf - 0.05, -bw2), Q(bf - 0.05, bw2), 0.05, y - 0.25, y + 0.14);
  slab(rim, Q(bf + bd + 0.05, -bw2), Q(bf + bd + 0.05, bw2), 0.05, y - 0.25, y + 0.14);
  slab(rim, Q(bf, 0), Q(bf + bd, 0), bw2, y - 0.25, y - 0.05);
  bag.add('granite_inca', fromTriangles(rim));
  const wb = []; slab(wb, Q(bf, 0), Q(bf + bd, 0), bw2, y - 0.07, y + 0.08); bag.add('water', fromTriangles(wb));
  col.rect([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y, y + 0.14);
  // the floor of the court: flags of stone
  const fl = [];
  slab(fl, Q(0.02, 0), Q(d, 0), w / 2 + 0.02, y - 0.12, y + 0.03);
  bag.add('flagstone', fromTriangles(fl));
  col.floor([Math.min(Q(0, -w / 2)[0], Q(d, w / 2)[0]), Math.min(Q(0, -w / 2)[1], Q(d, w / 2)[1]), Math.max(Q(0, -w / 2)[0], Q(d, w / 2)[0]), Math.max(Q(0, -w / 2)[1], Q(d, w / 2)[1])], y + 0.03);
}

/**
 * sacred_rock: the Sacred Rock { c, y, yaw (the way its face looks), w, h }: a great slab of the
 * granite standing on an altar-shaped base, its outline cut to the shape of the mountain behind it
 * [stated: about 3 m high on a base about 7 m wide — Tierras Vivas]; thick at its foot, thinning
 * to its edges, its faces a little irregular.
 */
function sacredRock(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, yaw = el.yaw ?? 0, W = el.w ?? 6.8, Ht = el.h ?? 3.0, rand = rng(el.seed || 17);
  const cs = Math.cos(yaw), sn = Math.sin(yaw);
  // local u (across), v (up), k (through: +k the face) → world; the face looks along (sin yaw, cos yaw)
  const P = (u, v, k) => [cx + u * cs + k * sn, y + v, cz - u * sn + k * cs];
  // the base: a low altar of two cut courses
  const base = [];
  const bk = (u0, u1, k0, k1, v0, v1) => { const a = P(u0, v0, k0), b = P(u1, v0, k0), c = P(u1, v0, k1), d = P(u0, v0, k1), e = (p) => [p[0], v1 + y, p[2]];
    const tq = [a, b, c, d], tp = tq.map(e), T = [];
    quad4(T, tp[0], tp[1], tp[2], tp[3], [0, 1, 0]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4, m = [(tq[i][0] + tq[j][0]) / 2 - (a[0] + c[0]) / 2, 0, (tq[i][2] + tq[j][2]) / 2 - (a[2] + c[2]) / 2]; quad4(T, tq[i], tq[j], tp[j], tp[i], m); }
    base.push(...T); };
  bk(-W / 2 - 0.5, W / 2 + 0.5, -1.25, 1.25, -0.3, 0.32);
  bk(-W / 2 - 0.15, W / 2 + 0.15, -0.95, 0.95, 0.3, 0.6);
  bag.add('granite_inca', fromTriangles(base));
  { const cs4 = [P(-W / 2 - 0.5, 0, -1.25), P(W / 2 + 0.5, 0, 1.25)]; col.rect([Math.min(cs4[0][0], cs4[1][0]), Math.min(cs4[0][2], cs4[1][2]), Math.max(cs4[0][0], cs4[1][0]), Math.max(cs4[0][2], cs4[1][2])], y, y + 0.6); }
  // the outline: the mountain's profile — a long shoulder, the summit a little off the middle, a lower peak
  const prof = [[-1, 0.02], [-0.92, 0.22], [-0.78, 0.42], [-0.62, 0.5], [-0.45, 0.72], [-0.28, 0.9], [-0.12, 1.0], [0.05, 0.93], [0.22, 0.8], [0.36, 0.78], [0.52, 0.62], [0.7, 0.42], [0.86, 0.22], [1, 0.02]];
  const top = (u) => { const x = u / (W / 2); for (let i = 0; i + 1 < prof.length; i++) if (x <= prof[i + 1][0]) { const f = (x - prof[i][0]) / (prof[i + 1][0] - prof[i][0]); return Ht * (prof[i][1] + (prof[i + 1][1] - prof[i][1]) * f); } return 0.05; };
  const NU = 30, NV = 9, T = [], noise = Array.from({ length: (NU + 1) * (NV + 1) }, () => rand());
  // thick at the foot, thinning up to the outline, where the two faces meet
  const thick = (i, j, u, v) => { if (i === 0 || i === NU || j === NV) return 0; const e = 1 - Math.abs(u) / (W / 2); return 0.5 * (1 - 0.55 * v / Ht) * Math.sqrt(1 - (j / NV) ** 2) * Math.min(1, e * 5) * (0.88 + 0.24 * noise[i * (NV + 1) + j]); };
  const grid = (sg) => {
    const G = [];
    for (let i = 0; i <= NU; i++) {
      const u = -W / 2 + W * i / NU, tv = Math.max(0.05, top(u));
      const col2 = [];
      for (let j = 0; j <= NV; j++) { const v = tv * j / NV; col2.push(P(u, 0.5 + v, sg * thick(i, j, u, v))); }
      G.push(col2);
    }
    return G;
  };
  for (const sg of [1, -1]) {
    const G = grid(sg);
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
      const want = [sn * sg, 0.15, cs * sg];
      tri(T, G[i][j], G[i + 1][j], G[i + 1][j + 1], want); tri(T, G[i][j], G[i + 1][j + 1], G[i][j + 1], want);
    }
  }
  bag.add('granite_rough', fromTriangles(T));
  col.segment(P(-W / 2, 0, 0), P(W / 2, 0, 0), 0.9, y + 0.6, y + 0.6 + Ht * 0.8);
}

/** stone_block: a battered wall of rough stones a→b { w (half-thickness), y0, y1 }, laid in two leaning faces. */
function stoneBlock(el, { bag, col }) {
  const L = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), F = lineFrame(el.a, el.b);
  // a gateway through it (el.door: { at (from a), w, h (above the ground, 0.3 m over the wall's foot), jamb })
  const openings = el.door ? [{ kind: 'door', at: el.door.at, w: el.door.w ?? 1.1, h: (el.door.h ?? 1.95) + 0.3, jamb: !!el.door.jamb }] : [];
  const { off } = incaWall(bag, col, F, { y: el.y0, h: el.y1 - el.y0, th: el.w * 2, mat: 'granite_rough', ends: ['cap', 'cap'], out: -1, openings, stones: Math.min(1.2, (el.y1 - el.y0) * 0.8), seed: Math.round(L * 77) });
  // the ring of stone over the lintel on the inner (-n) face, for the bar that held the door [stated: the main gate's ring — Machu Picchu guides]
  if (el.door?.ring) {
    const v = openings[0].h + 0.28, p = F.at(el.door.at), n = F.n(el.door.at), k = -(off(v) + 0.04);
    const g = lathe([[0.07, -0.03], [0.1, 0], [0.07, 0.03], [0.04, 0], [0.07, -0.03]], 12);
    g.rotateX(Math.PI / 2); g.rotateY(Math.atan2(n[0], n[1])); g.translate(p[0] + n[0] * (k - 0.06), el.y0 + v, p[1] + n[1] * (k - 0.06));
    bag.add('granite_inca', g);
    bag.add('granite_inca', box(p[0] - 0.16 + n[0] * k, el.y0 + v - 0.08, p[1] - 0.16 + n[1] * k, p[0] + 0.16 + n[0] * k, el.y0 + v + 0.08, p[1] + 0.16 + n[1] * k));
  }
}

registerStyle('inca', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, inca_house: incaHouse, inca_temple: incaTemple, torreon, intihuatana, ring_wall: ringWall, flying_stair: flyingStair, inca_canal: incaCanal, inca_fountain: incaFountain, sacred_rock: sacredRock, stone_block: stoneBlock, ...INCA_LIFE },
  objects: {},
});
