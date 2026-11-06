// The Haram's walls and gates and the Umayyad palaces south of it (Jerusalem about 700;
// docs/settlements/jerusalem.md §4b–§4c): the retaining walls of Herodian ashlars, each block framed by
// its chiselled margin, with four courses of smaller, plainly dressed Umayyad stones above; the Double
// Gate (Herodian lintels and relieving arches under an Umayyad carved cornice) and the Triple Gate in
// the south wall; the Golden Gate in the east wall with its two arched portals and its domed vestibule;
// the palaces of al-Walid round paved courts with porticoes on reused columns or square piers, and the
// bridge from the palace roof to the Haram. Registered into the `islamic` style.

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import './index.js';
import './town.js';

/** A box in a frame: origin o [x, z], along u (s0…s1), across n = (−uz, ux) (t0…t1), y0…y1. */
function fbox(o, u, s0, s1, t0, t1, y0, y1) {
  const g = box(s0, y0, t0, s1, y1, t1), p = g.attributes.position.array, nn = g.attributes.normal.array;
  const [ux, uz] = u, nx = -uz, nz = ux;
  for (let i = 0; i < p.length; i += 3) {
    const s = p[i], t = p[i + 2]; p[i] = o[0] + s * ux + t * nx; p[i + 2] = o[1] + s * uz + t * nz;
    const a = nn[i], b = nn[i + 2]; nn[i] = a * ux + b * nx; nn[i + 2] = a * uz + b * nz;
  }
  return g;
}
const fp = (o, u, s, t) => [o[0] + s * u[0] - t * u[1], o[1] + s * u[1] + t * u[0]];
const seg = (col, o, u, s0, s1, t0, t1, y0, y1) => col.segment(fp(o, u, s0, (t0 + t1) / 2), fp(o, u, s1, (t0 + t1) / 2), Math.abs(t1 - t0), y0, y1);
const rectOf = (o, u, s0, s1, t0, t1) => { const a = fp(o, u, s0, t0), b = fp(o, u, s1, t1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
function solid8(c) {
  const f = [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  for (const [a, b, cc, d] of f) t.push(...c[a], ...c[b], ...c[cc], ...c[a], ...c[cc], ...c[d]);
  return fromTriangles(orientOutward(t));
}
/** A semicircular band (voussoirs, archivolt) on a wall face: centre s = c, springing y, radii r0…r1, across t0…t1. */
function archBand(bag, mat, o, u, c, y, r0, r1, t0, t1, n = 12) {
  for (let k = 0; k < n; k++) {
    const a = Math.PI * k / n, b = Math.PI * (k + 1) / n, P = (r, g, t) => { const [x, z] = fp(o, u, c - Math.cos(g) * r, t); return [x, y + Math.sin(g) * r, z]; };
    bag.add(mat, solid8([P(r0, a, t0), P(r1, a, t0), P(r1, b, t0), P(r0, b, t0), P(r0, a, t1), P(r1, a, t1), P(r1, b, t1), P(r0, b, t1)]));
  }
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * herodian_wall: { o, u (along the outer face; inward is n = (−uz, ux)), L, th, y0 (foundation), g (the
 * lowest ground outside), top (the esplanade), gates: [{ kind: 'double' | 'triple' | 'open' | 'facade',
 * s0, s1, y (sill) }], seed } — a retaining wall of the Haram. Herodian courses of 1.1 m, blocks 1.5–7 m
 * long, each with a margin cut round a slightly raised face, up to 2.4 m below the esplanade; four
 * Umayyad courses of small plain stones; a parapet with its coping. 'open' leaves the wall at the
 * esplanade's level (a stair head, a bridge); 'double' and 'triple' are the southern gates; 'facade'
 * only keeps the courses off a stretch another element dresses.
 */
function herodianWall(el, { bag, col }) {
  const { o, u, L } = el, th = el.th ?? 3, T = el.top, g = el.g, y0 = el.y0, rand = rng(el.seed ?? 1), gates = el.gates || [];
  const yH = T - 2.4, par = 0.9;
  // the core, cut round the gates' recesses
  const cuts = gates.filter((q) => q.kind === 'double' || q.kind === 'triple').sort((a, b) => a.s0 - b.s0);
  let s = 0;
  for (const q of [...cuts, { s0: L, s1: L }]) {
    if (q.s0 > s) bag.add('limestone', fbox(o, u, s, q.s0, 0, th, y0, T));
    if (q.s1 > q.s0) gateFront(el, q, { bag, col });
    s = Math.max(s, q.s1);
  }
  seg(col, o, u, 0, L, 0, th, y0, T);
  // the parapet and its coping, broken where the wall is open; the wall's walk at the esplanade's level
  const opens = gates.filter((q) => q.kind === 'open').sort((a, b) => a.s0 - b.s0);
  s = 0;
  for (const q of [...opens, { s0: L, s1: L }]) {
    if (q.s0 > s + 0.1) {
      bag.add('limestone', fbox(o, u, s, q.s0, 0, par, T, T + 1.05));
      bag.add('limestone', fbox(o, u, s, q.s0, -0.06, par + 0.06, T + 1.05, T + 1.22));
      seg(col, o, u, s, q.s0, 0, par, T, T + 1.22);
      if (s > 0) bag.add('limestone', fbox(o, u, s, s + 1.2, -0.1, par + 0.3, T, T + 1.6));          // a pier at the opening
      if (q.s0 < L) bag.add('limestone', fbox(o, u, q.s0 - 1.2, q.s0, -0.1, par + 0.3, T, T + 1.6));
    }
    s = Math.max(s, q.s1);
  }
  col.floor(rectOf(o, u, 0, L, 0, th), T);
  // the courses: margined Herodian ashlars, then the small Umayyad stones (in front of the face)
  const skip = (a, b, ya, yb) => gates.some((q) => q.kind !== 'open' && a < q.s1 + 0.2 && b > q.s0 - 0.2 && ya < (q.top ?? T + 2));
  let y = g - 0.3;
  while (y < T - 0.05) {
    const herod = y < yH - 0.3, h = herod ? 1.1 : Math.min(0.6, T - y), m = herod ? 0.11 : 0.025, d = herod ? 0.045 : 0.018;
    let a = rand() * -2;
    while (a < L) {
      const len = herod ? (rand() < 0.15 ? 5 + rand() * 3 : 1.5 + rand() * 3) : 0.8 + rand() * 0.9, b = Math.min(L, a + len), aa = Math.max(0, a);
      if (b - aa > 0.5 && !skip(aa, b, y, y + h)) bag.add(herod ? 'limestone_yellow' : 'limestone', fbox(o, u, aa + m, b - m, -d, 0.001, y + m, y + h - m));
      a = b;
    }
    y += h;
  }
}

/** The front of a southern gate: the recessed openings with their doors shut, lintels, relieving arches and carving. */
function gateFront(el, q, { bag, col }) {
  const { o, u } = el, th = el.th ?? 3, T = el.top, y0 = el.y0, yS = q.y, rec = 1.2, BZ = STYLES.islamic.elements;
  const n = q.kind === 'double' ? 2 : 3, W = 3.4, pier = q.kind === 'double' ? 2.6 : 1.8;
  const span = q.s1 - q.s0, mid = (q.s0 + q.s1) / 2, cs = Array.from({ length: n }, (_, i) => mid + (i - (n - 1) / 2) * (W + pier));
  bag.add('limestone', fbox(o, u, q.s0, q.s1, rec, th, y0, T));                                        // behind the recess
  const front = { o: fp(o, u, q.s0, rec / 2), u, th: rec, u0: 0, u1: span, y0, y1: T, mat: 'limestone' };
  if (q.kind === 'double') {
    const yt = yS + 3.4;
    BZ.planar_wall({ ...front, holes: cs.map((c) => ({ u0: c - q.s0 - W / 2, u1: c - q.s0 + W / 2, y0: y0, y1: yt })) }, { bag, col });
    for (const c of cs) {
      bag.add('limestone_yellow', fbox(o, u, c - W / 2 - 0.4, c + W / 2 + 0.4, -0.14, 0.01, yt, yt + 0.95));       // the Herodian lintel
      archBand(bag, 'limestone_yellow', o, u, c, yt + 0.95, W / 2 - 0.1, W / 2 + 0.75, -0.14, 0.01);            // its relieving arch
      archBand(bag, 'limestone_carved', o, u, c, yt + 0.95, W / 2 + 0.75, W / 2 + 1.15, -0.28, 0.01, 16);       // the Umayyad carved moulding
      for (const s of [-1, 1]) bag.add('limestone_carved', fbox(o, u, c + s * (W / 2 + 0.95) - 0.2, c + s * (W / 2 + 0.95) + 0.2, -0.28, 0.01, yt + 0.25, yt + 0.95));
      shut(bag, o, u, c, W, rec, yS, yt);
    }
    bag.add('limestone_carved', fbox(o, u, q.s0 + 0.3, q.s1 - 0.3, -0.42, 0.01, T - 0.75, T - 0.25));                // the carved cornice over the gate
    bag.add('limestone_carved', fbox(o, u, q.s0 + 0.2, q.s1 - 0.2, -0.55, 0.01, T - 0.25, T - 0.08));
  } else {
    const sp = yS + 3.0, r = W / 2;
    BZ.planar_wall({ ...front, arches: cs.map((c) => ({ uc: c - q.s0, r, spring: sp, sill: y0 })) }, { bag, col });
    for (const c of cs) {
      archBand(bag, 'limestone_carved', o, u, c, sp, r, r + 0.5, -0.2, 0.01, 16);
      for (const s of [-1, 1]) bag.add('limestone_carved', fbox(o, u, c + s * (r + 0.25) - 0.25, c + s * (r + 0.25) + 0.25, -0.2, 0.01, sp - 0.35, sp));   // the imposts
      shut(bag, o, u, c, W, rec, yS, sp);
      BZ.planar_wall({ o: fp(o, u, c - r, rec - 0.1), u, th: 0.14, u0: 0, u1: W, y0: sp, y1: sp + r, outline: { uc: r, r, spring: sp }, mat: 'timber', collide: false }, { bag, col });
    }
    bag.add('limestone_carved', fbox(o, u, q.s0 + 0.3, q.s1 - 0.3, -0.35, 0.01, sp + r + 1.4, sp + r + 1.85));
  }
  // the threshold, worn, a step up from the street
  bag.add('limestone', fbox(o, u, q.s0 + 0.5, q.s1 - 0.5, -0.8, rec, yS - 0.4, yS + 0.16));
}
/** Two shut timber leaves in an opening (centre c, width W) at the back of its recess. */
function shut(bag, o, u, c, W, rec, y0, y1) {
  for (const [a, b] of [[c - W / 2, c - 0.01], [c + 0.01, c + W / 2]]) {
    bag.add('timber', fbox(o, u, a, b, rec - 0.12, rec + 0.02, y0, y1));
    for (const yy of [y0 + 0.6, (y0 + y1) / 2, y1 - 0.5]) bag.add('iron', fbox(o, u, a + 0.05, b - 0.05, rec - 0.15, rec - 0.12, yy, yy + 0.08));
  }
}

/**
 * golden_gate: { at [x, z] (the centre on the wall's outer face), u (along the wall, inward n), g (ground
 * outside), top (the esplanade), w (along the wall), d (into the esplanade) } — the double gate in the
 * east wall: its façade standing 2 m out from the wall, two doorways 3.9 m wide under semicircular arches
 * with carved friezes, a column between them, shut; behind, the vestibule (20.4 × 10.5 m inside) rising
 * above the esplanade under six shallow domes, with two arched doors toward the Dome of the Rock.
 */
function goldenGate(el, { bag, col }) {
  const BZ = STYLES.islamic.elements, u = el.u, W = el.w ?? 24.4, D = el.d ?? 14.5, g = el.g, T = el.top;
  const o = fp(el.at, u, -W / 2, 0), ft = -2.0;                                         // t < 0: outside
  const sp = g + 5.4, r = 1.95, cs = [W / 2 - 2.45, W / 2 + 2.45], topF = T + 5.5;
  // the façade: a wall 2 m thick in front of the wall's face
  BZ.planar_wall({ o: fp(o, u, 0, ft / 2), u, th: 2.0, u0: 0, u1: W, y0: g - 0.8, y1: topF, mat: 'limestone_yellow', arches: cs.map((c) => ({ uc: c, r, spring: sp, sill: g - 0.8 })) }, { bag, col });
  for (const c of cs) {
    archBand(bag, 'limestone_carved', o, u, c, sp, r, r + 0.55, ft - 0.22, ft + 0.01, 18);              // the carved frieze of the arch
    bag.add('limestone_carved', fbox(o, u, c - r - 0.3, c + r + 0.3, ft - 0.22, ft + 0.01, sp - 0.4, sp));
    shut(bag, o, u, c, 2 * r, ft + 1.0, g, sp);
    BZ.planar_wall({ o: fp(o, u, c - r, ft + 0.95), u, th: 0.14, u0: 0, u1: 2 * r, y0: sp, y1: sp + r, outline: { uc: r, r, spring: sp }, mat: 'timber', collide: false }, { bag, col });
  }
  { const [cx, cz] = fp(o, u, W / 2, ft - 0.45); STYLES.islamic.elements.reused_column({ at: [cx, cz], y: g, h: sp - g, d: 0.62, shaft: 'marble_smooth' }, { bag, col }); }
  // pilasters at the corners, the cornice and a band of carving over the arches
  for (const s0 of [0, W - 1.2]) bag.add('limestone_yellow', fbox(o, u, s0, s0 + 1.2, ft - 0.3, ft + 0.01, g - 0.8, topF - 1.0));
  bag.add('limestone_carved', fbox(o, u, -0.2, W + 0.2, ft - 0.45, -0.01, sp + r + 1.0, sp + r + 1.6));
  bag.add('limestone_carved', fbox(o, u, -0.3, W + 0.3, ft - 0.6, -0.01, topF - 1.0, topF - 0.55));
  bag.add('limestone', fbox(o, u, -0.35, W + 0.35, ft - 0.7, -0.01, topF - 0.55, topF - 0.3));
  // the vestibule above the esplanade: walls, two arched doors on the inner side, six shallow domes on the roof
  const yr = topF, th = 1.5;
  for (const [a, b] of [[0, th], [W - th, W]]) { bag.add('limestone', fbox(o, u, a, b, 0, D, T - 0.5, yr)); seg(col, o, u, a, b, 0, D, T, yr); }
  BZ.planar_wall({ o: fp(o, u, 0, D - th / 2), u, th, u0: 0, u1: W, y0: T - 0.5, y1: yr, mat: 'limestone', arches: cs.map((c) => ({ uc: c, r: 1.6, spring: T + 3.2, sill: T - 0.5 })) }, { bag, col });
  for (const c of cs) { shut(bag, o, u, c, 3.2, D - th / 2 - 0.05, T, T + 3.2); BZ.planar_wall({ o: fp(o, u, c - 1.6, D - th / 2 - 0.12), u, th: 0.14, u0: 0, u1: 3.2, y0: T + 3.2, y1: T + 4.8, outline: { uc: 1.6, r: 1.6, spring: T + 3.2 }, mat: 'timber', collide: false }, { bag, col }); }
  bag.add('limestone', fbox(o, u, -0.2, W + 0.2, -0.2, D + 0.2, yr, yr + 0.5));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const [cx, cz] = fp(o, u, th + (W - 2 * th) * (i + 0.5) / 3, D * (j + 0.5) / 2), R = 2.9;
    bag.add('limestone', lathe([[R + 0.4, 0], [R + 0.4, 0.5], [R, 0.5]], 32, null, cx, yr + 0.5, cz));
    bag.add('plaster', lathe(Array.from({ length: 8 }, (_, k) => { const a = k / 7 * Math.PI / 2; return [Math.max(0.001, Math.cos(a) * R), 0.5 + Math.sin(a) * R * 0.55]; }), 32, null, cx, yr + 0.5, cz));
  }
}

/**
 * umayyad_palace: { rect, y, h (to the roof), ring (depth of the rooms), portico, piers (square pilasters
 * instead of columns), gates (sides with a gate: 'e' 'w' 'n' 's'), bridge: { x0, x1 } (a gap in the north
 * parapet) } — one of the great buildings of al-Walid south of the Haram: a wall 3 m thick of large
 * dressed stones (many reused Herodian blocks), rooms in two storeys round a stone-paved court, the court
 * ringed by a portico on reused columns (some cut with crosses) or square pilasters, gates on the east and
 * west, flat roofs with parapets, plastered rooms.
 */
function umayyadPalace(el, ctx) {
  const { bag, col } = ctx, BZ = STYLES.islamic.elements, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.h ?? 8, R = el.ring ?? 14, Pd = el.portico ?? 5;
  const rand = rng(el.seed ?? 705), gates = el.gates || ['e', 'w'], wt = 3;
  const sides = { n: { o: [x0, z0], u: [1, 0], L: x1 - x0 }, e: { o: [x1, z0], u: [0, 1], L: z1 - z0 }, s: { o: [x1, z1], u: [-1, 0], L: x1 - x0 }, w: { o: [x0, z1], u: [0, -1], L: z1 - z0 } };
  const yTop = y + H, yF = y + 4.4;                                                        // the roof; the upper floor
  for (const [k, S] of Object.entries(sides)) {
    const { o, u, L } = S, gate = gates.includes(k), gm = L / 2;
    // the outer wall: a gate passage, a row of small windows to the upper rooms; the parapet above the roof
    const arches = [];
    if (gate) arches.push({ uc: gm, r: 2.2, spring: y + 2.0, sill: y - 0.5 });
    for (let s = 6; s < L - 6; s += 7.5) if (!gate || Math.abs(s - gm) > 5) arches.push({ uc: s, r: 0.45, spring: yF + 2.1, sill: yF + 1.0 });
    const br = k === 'n' && el.bridge ? [el.bridge.x0 - x0, el.bridge.x1 - x0] : null;
    BZ.planar_wall({ o: fp(o, u, 0, wt / 2), u, th: wt, u0: 0, u1: L, y0: y - 0.5, y1: yTop + 1.0, mat: 'limestone', arches, holes: br ? [{ u0: br[0], u1: br[1], y0: yTop, y1: yTop + 1.01 }] : [] }, ctx);
    // the coursing of the outer face: large dressed blocks below, smaller above
    for (let yy = y - 0.2; yy < yTop + 0.9; ) {
      const hh = yy < y + 3 ? 1.0 : 0.6;
      let a = rand() * -1.5;
      while (a < L) { const b = Math.min(L, a + (hh > 0.8 ? 1.4 + rand() * 2.5 : 0.7 + rand())), aa = Math.max(0, a);
        const hit = arches.some((q) => aa < q.uc + q.r + 0.3 && b > q.uc - q.r - 0.3 && yy < q.spring + q.r + 0.4 && yy + hh > (q.sill ?? y) - 0.1) || (br && aa < br[1] && b > br[0] && yy + hh > yTop - 0.4);
        if (b - aa > 0.4 && !hit) bag.add('limestone_yellow', fbox(o, u, aa + 0.06, b - 0.06, -0.035, 0.001, yy + 0.06, Math.min(yTop + 0.95, yy + hh - 0.06)));
        a = b; }
      yy += hh;
    }
    // the inner wall of the rooms toward the portico: a door to each room, a window over it
    const Lin = L - 2 * R, oi = fp(o, u, R, R - 0.5);
    const doors = [], nr = Math.max(1, Math.round(Lin / 7)), rw = Lin / nr;
    for (let i = 0; i < nr; i++) { const c = (i + 0.5) * rw; if (gate && Math.abs(c + R - gm) < 3) continue; doors.push({ uc: c, r: 0.75, spring: y + 2.3, sill: y - 0.3 }, { uc: c, r: 0.5, spring: yF + 1.6, sill: yF + 0.6 }); }
    if (gate) doors.push({ uc: gm - R, r: 2.2, spring: y + 2.0, sill: y - 0.3 });
    const ns = k === 'n' || k === 's';
    BZ.planar_wall({ o: oi, u, th: 1.0, u0: ns ? -0.5 : 0.5, u1: ns ? Lin + 0.5 : Lin - 0.5, y0: y - 0.3, y1: yTop - 0.32, mat: 'plaster', arches: doors }, ctx);
    // the rooms: party walls from the outer wall to the inner, the gate passage walled either side
    const parts = [];
    for (let i = 0; i <= nr; i++) parts.push(R + i * rw);
    if (gate) parts.push(gm - 2.6, gm + 2.6);
    for (const s of parts.sort((a, b) => a - b)) {
      if (gate && Math.abs(s - gm) < 2.5) continue;
      if (s <= R + 0.01 || s >= L - R - 0.01) continue;
      bag.add('plaster', fbox(o, u, s - 0.35, s + 0.35, wt, R - 1.0, y - 0.3, yTop - 0.32)); seg(col, o, u, s - 0.35, s + 0.35, wt, R - 1.0, y, yTop);
    }
    // floors: stone slabs below, a timber floor between the storeys, the roof of beaten earth on timber
    const f0 = ns ? wt : R - 1.0, f1 = ns ? L - wt : L - R + 1.0;
    bag.add('flagstone', fbox(o, u, f0, f1, wt, R - 1.0, y - 0.3, y + 0.05));
    col.floor(rectOf(o, u, f0, f1, wt, R - 1.0), y + 0.05);
    bag.add('timber', fbox(o, u, f0, f1, wt, R - 1.0, yF - 0.25, yF));
    bag.add('plaster', fbox(o, u, f0, f1, wt, R - 1.0, yF, yF + 0.04));
    bag.add('plaster_grey', fbox(o, u, ns ? 0 : R, ns ? L : L - R, 0, R, yTop - 0.3, yTop)); col.floor(rectOf(o, u, ns ? 0 : R, ns ? L : L - R, 0, R), yTop);
    // a painted band of the plaster's geometric and floral ornament along the inner wall
    bag.add('paint_ochre', fbox(o, u, R + 0.5, L - R - 0.5, R + 0.0, R + 0.012, yF - 0.95, yF - 0.6));
    // the portico: columns or square pilasters carrying arches, a lean-to roof against the rooms' wall
    const Lp = L - 2 * (R + Pd), op = fp(o, u, R + Pd, R + Pd), nb = Math.max(2, Math.round(Lp / 3.6)), b = Lp / nb, spA = y + 3.9;
    BZ.planar_wall({ o: op, u, th: 0.7, u0: 0.35, u1: Lp + 0.35, y0: y, y1: y + 6.1, mat: 'limestone', arcade: true, noEnds: true, collide: false,
      arches: Array.from({ length: nb }, (_, i) => ({ uc: (i + 0.5) * b, r: (b - (el.piers ? 0.9 : 0.7)) / 2, spring: spA })) }, ctx);
    for (let i = 0; i < nb; i++) {
      const [cx, cz] = fp(op, u, i * b, 0);
      if (i === 0 || el.piers) { bag.add('limestone', box(cx - 0.45, y, cz - 0.45, cx + 0.45, spA, cz + 0.45)); bag.add('limestone_carved', box(cx - 0.55, spA - 0.3, cz - 0.55, cx + 0.55, spA, cz + 0.55)); col.circle(cx, cz, 0.5, y, spA); }
      else {
        STYLES.islamic.elements.reused_column({ at: [cx, cz], y, h: spA - y, d: 0.64, shaft: ['marble_smooth', 'granite_grey', 'proconnesian', 'giallo'][i % 4] }, ctx);
        if (i % 3 === 1) {                                                                  // a cross cut on a shaft taken from a church
          const [px, pz] = fp(op, u, i * b, -0.27);
          bag.add('marble_dark', box(px - 0.035, y + 1.6, pz - 0.035, px + 0.035, y + 2.15, pz + 0.035));
          bag.add('marble_dark', box(px - (u[0] ? 0.18 : 0.035), y + 1.92, pz - (u[1] ? 0.18 : 0.035), px + (u[0] ? 0.18 : 0.035), y + 1.99, pz + (u[1] ? 0.18 : 0.035)));
        }
      }
    }
    const pr = [fp(o, u, R - 0.3, R - 0.62), fp(o, u, L - R + 0.3, R - 0.62), fp(o, u, L - R + 0.3, R + Pd + 0.5), fp(o, u, R - 0.3, R + Pd + 0.5)];
    const yy = [yTop - 1.0, yTop - 1.0, y + 6.1, y + 6.1];
    bag.add('timber', solid8([...pr.map((p, i) => [p[0], yy[i] - 0.1, p[1]]), ...pr.map((p, i) => [p[0], yy[i], p[1]])]));
    bag.add('roof_tile', solid8([...pr.map((p, i) => [p[0], yy[i], p[1]]), ...pr.map((p, i) => [p[0], yy[i] + 0.14, p[1]])]));
    bag.add('flagstone', fbox(o, u, ns ? R - 0.5 : R + Pd + 0.4, ns ? L - R + 0.5 : L - R - Pd - 0.4, R - 0.5, R + Pd + 0.4, y - 0.3, y + 0.05));
  }
  // the court, paved with large slabs; the gate passages
  bag.add('flagstone', box(x0 + R + Pd + 0.4, y - 0.3, z0 + R + Pd + 0.4, x1 - R - Pd - 0.4, y + 0.03, z1 - R - Pd - 0.4));
  col.floor([x0 + R - 0.5, z0 + R - 0.5, x1 - R + 0.5, z1 - R + 0.5], y + 0.05);
  for (const k of gates) {
    const { o, u, L } = sides[k];
    bag.add('flagstone', fbox(o, u, L / 2 - 2.6, L / 2 + 2.6, -0.5, R - 0.5, y - 0.3, y + 0.06));
    col.floor(rectOf(o, u, L / 2 - 2.6, L / 2 + 2.6, -0.5, R - 0.5), y + 0.06);
  }
}

/** palace_bridge: { x0, x1, z0, z1, g (street), top (deck) } — the bridge from the palace roof to the Haram over the street: one arch, a parapet each side. */
function palaceBridge(el, ctx) {
  const { bag, col } = ctx, { x0, x1, z0, z1, g, top } = el, w = x1 - x0, L = z1 - z0, r = L / 2 - 0.2;
  STYLES.islamic.elements.planar_wall({ o: [(x0 + x1) / 2, z0], u: [0, 1], th: w, u0: 0, u1: L, y0: g - 0.5, y1: top, mat: 'limestone', arches: [{ uc: L / 2, r, spring: top - r - 1.0 }] }, ctx);
  archBand(bag, 'limestone_yellow', [x0, z0], [0, 1], L / 2, top - r - 1.0, r, r + 0.7, -0.01, 0.12);
  archBand(bag, 'limestone_yellow', [x1, z0], [0, 1], L / 2, top - r - 1.0, r, r + 0.7, 0.01, -0.12);
  for (const [a, b] of [[x0 - 0.05, x0 + 0.5], [x1 - 0.5, x1 + 0.05]]) { bag.add('limestone', box(a, top, z0 - 1.5, b, top + 1.0, z1 + 1.5)); col.rect([a, z0 - 1.5, b, z1 + 1.5], top, top + 1.0); }
  bag.add('flagstone', box(x0 + 0.5, top - 0.06, z0 - 1.5, x1 - 0.5, top + 0.02, z1 + 1.5));
  col.floor([x0, z0 - 1.5, x1, z1 + 1.5], top + 0.02);
}

Object.assign(STYLES.islamic.elements, { herodian_wall: herodianWall, golden_gate: goldenGate, umayyad_palace: umayyadPalace, palace_bridge: palaceBridge });
