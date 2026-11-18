// The Eixample's houses with their upper floors open (docs/settlements/barcelona.md §13): the stair behind the vestibule rises in two
// flights to a floor round an open well, with its iron balustrade and a tiled dado, past the entresol to the principal floor, the
// upper floor and the roof terrace. The principal floor is one flat (the gallery over the door, the salon, the dining room, the
// kitchen on the light well, the bedrooms); the upper floor is three small units off the landing (families' flats, a boarding house,
// a seamstress' workroom, a doctor's rooms). Two pieces: `shell` (the plot's upper mass built hollow, in the block's plan) and
// `house` (the finish: stair, partitions, floors, linings, furniture and the roof's furniture, in a plan of its own).
//
// A plot's frame is the front's: s along the front, u the depth from the front face inward (u = −t). All numbers are metres.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

const IRON = 'iron', E = 1e-3;
/** The stair core (behind the vestibule: its partition at u 3.4–3.7) and the light well behind it. */
export const CORE = { hw: 1.3, u0: 3.7, u1: 9.1, run0: 4.8, run1: 8.0, lane: 0.96, well: 0.34 };
export const SHAFT = { hw: 1.7, u0: 9.6, u1: 12.64 };
const FW = 0.5, BW = 0.4, PW = 0.3, PA = 5.8, PC = 12.74, DW = 0.95, DH = 2.3, SLAB = 0.3;
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };

/** The levels of a house (m): the hall floor, each floor's, the roof terrace. */
export function levels(G, LV) {
  const lv = [G.yS + 0.12];
  for (let f = 1; f < G.top; f++) lv.push(G.y + LV[f] + 0.05);
  lv.push(G.y + G.h);
  return lv;
}
/** Rectangle [x0, x1] × [0, D] minus the voids [{ s0, s1, u0, u1 }]: the boxes that are left, as [s0, s1, u0, u1]. */
function carve(a, b, D, voids) {
  const xs = [...new Set([a, b, ...voids.flatMap((v) => [v.s0, v.s1])].filter((x) => x >= a - E && x <= b + E).map((x) => +x.toFixed(4)))].sort((p, q) => p - q), out = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    const x0 = xs[i], x1 = xs[i + 1];
    if (x1 - x0 < E) continue;
    const cuts = voids.filter((v) => v.s0 <= x0 + E && v.s1 >= x1 - E).map((v) => [v.u0, v.u1]).sort((p, q) => p[0] - q[0]);
    let u = 0;
    for (const [c0, c1] of cuts) { if (c0 > u + E) out.push([x0, x1, u, c0]); u = Math.max(u, c1); }
    if (D > u + E) out.push([x0, x1, u, D]);
  }
  return out;
}
/** The rectangles cut into pieces of at most m (the top field smears a big face's edge by 2 % of its size into the next cell: a stair beside a wide floor read as a roof). */
const chop = (rs, m = 1.2) => rs.flatMap(([s0, s1, u0, u1]) => {
  const ns = Math.max(1, Math.ceil((s1 - s0) / m)), nu = Math.max(1, Math.ceil((u1 - u0) / m)), o = [];
  for (let i = 0; i < ns; i++) for (let j = 0; j < nu; j++) o.push([s0 + (s1 - s0) * i / ns, s0 + (s1 - s0) * (i + 1) / ns, u0 + (u1 - u0) * j / nu, u0 + (u1 - u0) * (j + 1) / nu]);
  return o;
});
/** A wall's run [x0, x1] with openings [{ c, w, y0, y1 }] (y relative to the floor): the solid pieces as [x0, x1, y0, y1]. */
function pieces(x0, x1, y0, y1, ops) {
  const out = [], o = [...ops].sort((p, q) => p.c - q.c);
  let x = x0;
  for (const op of o) {
    const a = op.c - op.w / 2, b = op.c + op.w / 2;
    if (a > x + E) out.push([x, a, y0, y1]);
    if (op.y0 > E) out.push([a, b, y0, y0 + op.y0]);
    if (op.y1 < y1 - y0 - E) out.push([a, b, y0 + op.y1, y1]);
    x = Math.max(x, b);
  }
  if (x1 > x + E) out.push([x, x1, y0, y1]);
  return out;
}

/**
 * The layout of an opened plot (pure): the doorways and the rooms of a floor, the front's windows. G: { a, b, D, pc, nb, bw, door }.
 * Rooms: { id, tag, wing ('L', 'R', 'S'), s0, s1, u0, u1 }; doors: { n ('u': in a wall across u; 's': in a wall across s), at, c, w, from, to }.
 */
export function layout(G) {
  const { a, b, D, pc } = G, sl = a + PW, sr = b - PW, rooms = [], doors = [], back = [], DB = D - BW;
  rooms.push({ id: 'S', tag: 'S', wing: 'S', s0: pc - 1.3, s1: pc + 1.3, u0: FW, u1: 3.4 });
  for (const sg of [-1, 1]) {
    const w = sg < 0 ? 'L' : 'R', inner = pc + sg * 1.8, shaftW = pc + sg * 1.9, mid = pc + sg * 0.1;
    const R = (id, tag, i0, i1, u0, u1) => rooms.push({ id: id + w, tag, wing: w, s0: Math.min(i0, i1), s1: Math.max(i0, i1), u0, u1 });
    const outer = sg < 0 ? sl : sr;
    R('A', 'A', outer, inner, FW, PA - 0.06); R('B', 'B', outer, inner, PA + 0.06, CORE.u1); R('C', 'C', outer, shaftW, SHAFT.u0, SHAFT.u1);
    const wd = Math.abs(mid - outer);
    if (wd > 5.4) {
      const sm = (outer + mid) / 2;
      R('D1', 'D', outer, sm - 0.06, PC + 0.1, DB); R('D2', 'D', sm + 0.06, mid, PC + 0.1, DB);
      doors.push({ n: 's', at: sm, c: (PC + 0.1 + DB) / 2, w: DW, from: 'D1' + w, to: 'D2' + w });
      back.push({ c: (outer + sm) / 2 }, { c: (sm + mid) / 2 });
      doors.push({ n: 'u', at: PC, c: shaftW + sg * 0.9, w: DW, from: 'C' + w, to: sg < 0 ? 'D2' + w : 'D1' + w });
      // (the nearer of the two rooms to the shaft takes the door from the kitchen)
    } else {
      R('D', 'D', outer, mid, PC + 0.1, DB); back.push({ c: (outer + mid) / 2 });
      doors.push({ n: 'u', at: PC, c: shaftW + sg * 0.9, w: DW, from: 'C' + w, to: 'D' + w });
    }
    doors.push({ n: 's', at: pc + sg * 1.55, c: 4.3, w: DW, from: 'L', to: 'A' + w });                 // the landing's door
    doors.push({ n: 'u', at: PA, c: inner + sg * 1.0, w: DW, from: 'A' + w, to: 'B' + w });
    doors.push({ n: 'u', at: 9.35, c: inner + sg * 0.9, w: DW, from: 'B' + w, to: 'C' + w });
  }
  doors.push({ n: 'u', at: 3.55, c: pc, w: DW, from: 'L', to: 'S' });                                  // the landing's door into the gallery's room
  doors.push({ n: 's', at: pc - 1.55, c: 1.9, w: 1.5, from: 'S', to: 'AL', arch: true }, { n: 's', at: pc + 1.55, c: 1.9, w: 1.5, from: 'S', to: 'AR', arch: true });
  return { rooms, doors, back, sl, sr, DB };
}

/** What is built where: a piece of the front's frame, with its collider. */
function tools(ctx, fr) {
  const { bag, col } = ctx, F = fr.F;
  const ok = (s0, s1, u0, u1, y0, y1) => s1 - s0 > E && u1 - u0 > E && y1 - y0 > E;
  const B = (mat, s0, s1, u0, u1, y0, y1) => { if (ok(s0, s1, u0, u1, y0, y1)) bag.add(mat, F(s0, s1, -u1, -u0, y0, y1)); };
  const R = (s0, s1, u0, u1, y0, y1) => { if (!ok(s0, s1, u0, u1, y0, y1)) return; const p = fr.at(s0, -u0), q = fr.at(s1, -u1); col.rect([p[0], p[1], q[0], q[1]], y0, y1); };
  const BR = (mat, s0, s1, u0, u1, y0, y1) => { B(mat, s0, s1, u0, u1, y0, y1); R(s0, s1, u0, u1, y0, y1); };
  const P3 = (s, u, y) => { const q = fr.at(s, -u); return [q[0], y, q[1]]; };
  const RD = (mat, p, q, r, seg = 4) => bag.add(mat, rod(P3(...p), P3(...q), r, seg));
  const LT = (mat, prof, s, u, y, seg = 8) => { const q = fr.at(s, -u); bag.add(mat, lathe(prof, seg, null, q[0], y, q[1])); };
  const FL = (s, u, y) => fr.at(s, -u).concat(y);
  void FL;
  return { B, R, BR, RD, LT, P3, ok };
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// The shell: the plot's mass above the shops and the portal, built hollow where the floors are open
// ═════════════════════════════════════════════════════════════════════════════════════════════════
/**
 * The upper mass of an opened plot, from the ground floor's ceiling (G.lowTop) to the roof: the entresol solid with the stair's well
 * through it; the principal floor and the one above with their walls (the front's openings for the windows and the gallery, the back's
 * for the rooms, the core's doorways), their slabs; the floors over them solid with the well and the light well through; the roof.
 * ctx, the frame, the plot's numbers G, the facade's material mat, the window sizes WIN (index.js).
 */
export function shell(ctx, G, mat, WIN, LV) {
  const { fr, a, b, D, pc, y, h, lowTop, nb, bw, door } = G, T = tools(ctx, fr), { B, BR, R } = T, L = layout(G), lv = levels(G, LV);
  const cl = (f) => lv[f + 1] - SLAB;                                       // a floor's ceiling (the slab's underside over it)
  const core = { s0: pc - CORE.hw, s1: pc + CORE.hw, u0: CORE.u0, u1: CORE.u1 }, shaft = { s0: pc - SHAFT.hw, s1: pc + SHAFT.hw, u0: SHAFT.u0, u1: SHAFT.u1 };
  // the entresol: solid, the well through it
  for (const [s0, s1, u0, u1] of chop(carve(a, b, D, [core]))) BR(mat, s0, s1, u0, u1, lowTop, lv[2]);
  for (const f of [2, 3]) {
    const f0 = lv[f], f1 = cl(f), k = f === 2 ? 2 : 'mid';
    // the front wall: a window at each bay (the principal floor's to the floor, with its balcony; the gallery's wide opening in the door's bay)
    const ops = [];
    for (let i = 0; i < nb; i++) {
      const sc = a + (i + 0.5) * bw;
      if (i === door) ops.push({ c: sc, w: 2.0, y0: 0.0, y1: 2.6 }); else ops.push({ c: sc, w: WIN[k][0], y0: 0.0, y1: WIN[k][1] + 0.06 });
    }
    for (const [s0, s1, y0, y1] of pieces(a, b, f0, f1, ops)) BR(mat, s0, s1, 0, FW, y0, y1);
    // the back wall: a window to each room at the back
    const bops = L.back.map((q) => ({ c: q.c, w: 1.1, y0: 0.85, y1: 2.45 }));
    for (const [s0, s1, y0, y1] of pieces(a, b, f0, f1, bops)) BR(mat, s0, s1, D - BW, D, y0, y1);
    // the party walls
    BR(mat, a, a + PW, FW, D - BW, f0, f1); BR(mat, b - PW, b, FW, D - BW, f0, f1);
    // the core's side walls, from the front wall to the well's end: the arch of the gallery's room (the principal floor), the landing's door, a borrowed light
    for (const sg of [-1, 1]) {
      const s0 = sg < 0 ? pc - 1.8 : pc + 1.3, s1 = s0 + 0.5, o = [{ c: 4.3, w: DW, y0: 0, y1: DH }, { c: 7.0, w: 0.8, y0: 1.1, y1: 2.1 }];
      if (f === 2) o.push({ c: 1.9, w: 1.5, y0: 0, y1: 2.7 });
      for (const [u0, u1, y0, y1] of pieces(FW, CORE.u1, f0, f1, o)) BR(mat, s0, s1, u0, u1, y0, y1);
    }
    // the core's front wall (the door into the gallery's room) and the back wall of the core and light well
    for (const [s0, s1, y0, y1] of pieces(pc - CORE.hw, pc + CORE.hw, f0, f1, [{ c: pc, w: DW, y0: 0, y1: DH }])) BR(mat, s0, s1, 3.4, 3.7, y0, y1);
    BR(mat, pc - 1.9, pc + 1.9, CORE.u1, SHAFT.u0, f0, f1);
    // the light well's walls, a window from each kitchen
    for (const sg of [-1, 1]) {
      const s0 = sg < 0 ? pc - 1.9 : pc + 1.7;
      for (const [u0, u1, y0, y1] of pieces(SHAFT.u0, SHAFT.u1 + 0.2, f0, f1, [{ c: 11.0, w: 1.0, y0: 0.9, y1: 2.3 }])) BR(mat, s0, s0 + 0.2, u0, u1, y0, y1);
    }
    BR(mat, pc - 1.9, pc + 1.9, SHAFT.u1, SHAFT.u1 + 0.2, f0, f1);
    // the slab over the floor (the well and the light well through it)
    for (const [s0, s1, u0, u1] of chop(carve(a, b, D, [core, shaft]))) B(mat, s0, s1, u0, u1, f1, lv[f + 1]);
    for (const [s0, s1, u0, u1] of carve(a, b, D, [core, shaft])) R(s0, s1, u0, u1, f1, lv[f + 1]);
  }
  // the floors over them: solid to the roof, the well and the light well through it
  for (const [s0, s1, u0, u1] of chop(carve(a, b, D, [core, shaft]))) BR(mat, s0, s1, u0, u1, cl(3), y + h);
  // the light well's rim over the roof (a parapet ring, with the glazed lid in `house`)
  for (const [s0, s1, u0, u1] of [[pc - 1.9, pc + 1.9, SHAFT.u0 - 0.2, SHAFT.u0], [pc - 1.9, pc + 1.9, SHAFT.u1 + 0.2 - 0.2, SHAFT.u1 + 0.2], [pc - 1.9, pc - 1.7, SHAFT.u0, SHAFT.u1], [pc + 1.7, pc + 1.9, SHAFT.u0, SHAFT.u1]]) BR(mat, s0, s1, u0, u1, y + h, y + h + 0.9);
  // the party walls' and the back's parapets (the front's is the cornice's), so that the terrace is walled
  BR(mat, a, a + 0.25, 0, D, y + h, y + h + 1.0); BR(mat, b - 0.25, b, 0, D, y + h, y + h + 1.0);
  T.R(a, b, 0, 0.3, y + h, y + h + 1.0); T.R(a, b, D - 0.3, D + 0.1, y + h, y + h + 0.9);
  return { L, lv };
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// The house: stair, finish, furniture, the roof's furniture
// ═════════════════════════════════════════════════════════════════════════════════════════════════
const WALLS = ['stucco_pale', 'stucco_cream', 'stucco_rose', 'stucco_sky', 'paint_ochre', 'plaster_white'];
const BLANKET = ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_maroon'];
const KINDS = ['veins', 'pensio', 'taller', 'consulta'];
export const kindsOf = (seed) => { const k = (seed >>> 3) % 4; return { L: KINDS[k], R: KINDS[(k + 1) % 4], S: KINDS[(k + 2) % 4] }; };
const TYPES = {
  burges: { SL: 'saleta', AL: 'salon', BL: 'study', CL: 'maid', DL: 'bed2', D1L: 'bed2', D2L: 'bed1', AR: 'dining', BR: 'sewing', CR: 'kitchen', DR: 'bed2', D1R: 'bed1', D2R: 'bed2' },
  veins: { A: 'dining_poor', B: 'bed1', C: 'kitchen', D: 'bed1', D1: 'bed1', D2: 'bed1', S: 'store' },
  pensio: { A: 'sitting', B: 'lodger', C: 'kitchen', D: 'dorm', D1: 'dorm', D2: 'lodger', S: 'lodger' },
  taller: { A: 'workroom', B: 'fitting', C: 'kitchen', D: 'bed1', D1: 'bed1', D2: 'bed1', S: 'workroom' },
  consulta: { A: 'waiting', B: 'consult', C: 'kitchen', D: 'bed2', D1: 'bed2', D2: 'bed1', S: 'office' },
};
export const typeOf = (flat, room, f) => (f === 2 ? TYPES.burges[room.id] ?? 'bed1' : TYPES[flat][room.tag === 'D' ? room.id.replace(/[LR]$/, '') : room.tag] ?? 'bed1');

/**
 * The house element's content: G as the shell's (with `kinds`), the facade's material is not needed. ctx: { bag, col, lights }.
 * H: { LV, WIN, hall: the hall's tiles, dado: [d1, d2] }.
 */
export function house(ctx, G, H) {
  const { fr, a, b, D, pc, y, h, top, nb, bw, door } = G, { bag, col, lights } = ctx, T = tools(ctx, fr), { B, BR, R, RD, LT } = T;
  const L = layout(G), lv = levels(G, H.LV), cl = (f) => lv[f + 1] - SLAB, rand = rng(G.seed ^ 0x51ed27);
  const pick = (A) => A[Math.floor(rand() * A.length)];
  const kinds = G.kinds ?? kindsOf(G.seed), [d1, d2] = H.dado;
  const ITEMS = makeItems();
  void kinds;
  return build();
  function build() { stairs(); for (const f of [2, 3]) floorOf(f); roof(); }

  // ── the stair ──────────────────────────────────────────────────────────────────────────────────
  function stairs() {
    const u0 = CORE.u0, u1 = CORE.u1, r0 = CORE.run0, r1 = CORE.run1, s0 = pc - CORE.hw, s1 = pc + CORE.hw, wl = pc - CORE.well, wr = pc + CORE.well;
    const dirOf = (v) => (Math.abs(v[0]) > Math.abs(v[1]) ? (v[0] > 0 ? 'e' : 'w') : v[1] > 0 ? 's' : 'n');
    const away = dirOf([-fr.n[0], -fr.n[1]]), toward = dirOf(fr.n);                  // the ascent of the left flight (inward) and the right (outward)
    const rect = (sa, sb, ua, ub) => { const p = fr.at(sa, -ua), q = fr.at(sb, -ub); return [p[0], p[1], q[0], q[1]]; };
    const hand = (s, ua, ya, ub, yb) => {                                             // a rail on the well's edge along a flight: the hand rail and its balusters
      RD(IRON, [s, ua, ya + 0.92], [s, ub, yb + 0.92], 0.02, 4);
      const n = Math.max(2, Math.round(Math.abs(ub - ua) / 0.2));
      for (let k = 0; k <= n; k++) { const u = ua + (ub - ua) * k / n, yy = ya + (yb - ya) * k / n; RD(IRON, [s, u, yy], [s, u, yy + 0.92], k % 3 === 0 ? 0.016 : 0.008, 4); }
    };
    for (let i = 0; i < top; i++) {
      const L0 = lv[i], L1 = lv[i + 1], mid = (L0 + L1) / 2, n = Math.max(6, Math.round((L1 - L0) / 2 / 0.18)), r = (L1 - L0) / 2 / n, m = n - 1, run = (r1 - r0) / m;
      for (let k = 1; k <= m; k++) {
        B('marble', s0 + 0.02, wl, r0 + (k - 1) * run, r0 + k * run, L0 + k * r - 0.28, L0 + k * r);                 // the left flight, up and in
        B('marble', wr, s1 - 0.02, r1 - k * run, r1 - (k - 1) * run, mid + k * r - 0.28, mid + k * r);               // the right flight, back to the front
        B('marble_floor', s0 + 0.02, wl, r0 + (k - 1) * run, r0 + k * run, L0 + k * r - 0.02, L0 + k * r);
        B('marble_floor', wr, s1 - 0.02, r1 - k * run, r1 - (k - 1) * run, mid + k * r - 0.02, mid + k * r);
      }
      col.ramp(rect(s0 + 0.02, wl, r0, r1), L0 + r, L0 + m * r, away);
      col.ramp(rect(wr, s1 - 0.02, r1, r0), mid + r, mid + m * r, toward);
      // the half landing at the back, and the front landing at the next floor
      B('marble', s0 + 0.02, s1 - 0.02, r1, u1, mid - SLAB, mid); B('marble_floor', s0 + 0.02, s1 - 0.02, r1, u1, mid - 0.02, mid);
      col.floor(rect(s0 + 0.02, s1 - 0.02, r1, u1), mid);
      if (i + 1 < top) { B('marble', s0 + 0.02, s1 - 0.02, u0, r0, L1 - SLAB, L1); B('marble_floor', s0 + 0.02, s1 - 0.02, u0, r0, L1 - 0.02, L1); col.floor(rect(s0 + 0.02, s1 - 0.02, u0, r0), L1); }
      else { B('marble_floor', s0 + 0.02, s1 - 0.02, u0, r0, L1 - 0.02, L1); col.floor(rect(s0 + 0.02, s1 - 0.02, u0, r0), L1); }
      // the balustrade of the well: a rail along each flight, a guard across the well at each landing
      hand(wl, r0, L0 + r, r1, L0 + m * r); hand(wr, r1, mid + m * r, r0, mid + r);
      for (const [lvl, uu] of [[mid, r1], [L1, r0]]) { RD(IRON, [wl, uu, lvl + 0.92], [wr, uu, lvl + 0.92], 0.02, 4); for (let k = 0; k <= 3; k++) RD(IRON, [wl + 0.06 + k * 0.16, uu, lvl], [wl + 0.06 + k * 0.16, uu, lvl + 0.92], 0.008, 4); }
      // the dado of tile along the flights' walls and the landings' (a sloped band between the flights' ends, a border over it)
      slope(d1, s0 + 0.02, r0, L0 + r, r1, mid - r, 0.0, 1.3, +1); slope(d2, s0 + 0.02, r0, L0 + r + 1.3, r1, mid - r + 1.3, 0, 0.1, +1);
      slope(d1, s1 - 0.02, r1, mid + r, r0, L1 - r, 0.0, 1.3, -1); slope(d2, s1 - 0.02, r1, mid + r + 1.3, r0, L1 - r + 1.3, 0, 0.1, -1);
      // the lamp on the landing's newel
      if (i % 2 === 0) { LT(IRON, [[0.001, 0], [0.06, 0], [0.04, 0.2], [0.05, 0.9], [0.001, 0.94]], pc + 1.1, u0 + 0.35, L1 === lv[0] ? L1 : L1, 6); LT('lamp_glass', [[0.001, 0.94], [0.1, 1.0], [0.12, 1.18], [0.07, 1.32], [0.001, 1.34]], pc + 1.1, u0 + 0.35, L1, 8); lights?.push({ at: P3at(pc + 1.1, u0 + 0.35, L1 + 1.3), color: '#ffd9a0', intensity: 4, distance: 7 }); }
      // the doors on the landing: an architrave round each opening, the open leaf against the wall, or the closed door of a flat not shown
      if (i + 1 < top) for (const sg of [-1, 1]) doorway(sg < 0 ? s0 : s1, sg, 4.3, L1, i + 1 === 2 || i + 1 === 3);
      if (i + 1 < top) closedDoor(pc, 3.4, L1, i + 1 === 2 || i + 1 === 3);
    }
    // the well's shaft in the collision: four thin walls of rail (a guard from the first landing to the roof)
    const yA = lv[0], yB = lv[top] + 1.0;
    R(wl - 0.03, wl + 0.03, r0, r1, yA, yB); R(wr - 0.03, wr + 0.03, r0, r1, yA, yB);
    R(wl, wr, r0 - 0.03, r0 + 0.03, yA, yB); R(wl, wr, r1 - 0.03, r1 + 0.03, yA, yB);
    // the lining of the core: plaster to the roof on the four walls (the walls' own material is the facade's)
    const top2 = lv[top] + 2.7;
    B('plaster_white', s0, s0 + 0.02, u0, u1, lv[0], top2); B('plaster_white', s1 - 0.02, s1, u0, u1, lv[0], top2);
    B('plaster_white', s0, s1, u1 - 0.02, u1, lv[0], top2); B('plaster_white', s0, s1, u0, u0 + 0.02, lv[1] - SLAB, top2);
    // the dado on the hall floor's walls and the landings' (flat bands at each landing)
    for (let i = 0; i <= top; i++) {
      const lvl = i === 0 ? lv[0] : lv[i];
      for (const [sa, sb, ua, ub] of [[s0 + 0.02, s0 + 0.04, u0, r0], [s1 - 0.04, s1 - 0.02, u0, r0], [s0 + 0.02, s0 + 0.04, r1, u1], [s1 - 0.04, s1 - 0.02, r1, u1]]) { B(d1, sa, sb, ua, ub, lvl, lvl + 1.3); B(d2, sa - 0.002, sb + 0.002, ua, ub, lvl + 1.3, lvl + 1.4); }
      if (i > 0 && i < top) for (const lvl2 of [lvl]) void lvl2;
    }
    // the floor of the landings at the opened floors: tile border
    for (const f of [2, 3]) { B(d2, s0 + 0.02, s1 - 0.02, u0, u0 + 0.06, lv[f], lv[f] + 0.012); B(d2, s0 + 0.02, s1 - 0.02, r0 - 0.06, r0, lv[f], lv[f] + 0.012); }
    // the lid over the well: the stair house of the roof (built with the roof)

  }
  function P3at(s, u, yy) { const q = fr.at(s, -u); return [q[0], yy, q[1]]; }
  /** A sloped band of tile on a wall at s: from (ua, ya) to (ub, yb) (the bottom edge), `up0`…`up1` its height; side: the face toward +s or −s. */
  function slope(mat, s, ua, ya, ub, yb, _o, hgt, side) {
    const T2 = [], A = P3at(s, ua, ya), Bq = P3at(s, ub, yb), C = P3at(s, ub, yb + hgt), Dq = P3at(s, ua, ya + hgt);
    T2.push(...A, ...Bq, ...C, ...A, ...C, ...Dq);
    bag.add(mat, fromTriangles(both(T2)));
    void side;
  }
  /** A doorway in a wall at s (the core's side), centre u, at floor level lvl: the architrave and the leaf (open when `open`, flat and panelled when not). */
  function doorway(s, sg, uc, lvl, open) {
    const o = sg < 0 ? s + 0.02 : s - 0.02, f = sg < 0 ? 1 : -1;           // inward face
    B('wood_painted', Math.min(o, o + f * 0.03), Math.max(o, o + f * 0.03), uc - DW / 2 - 0.08, uc - DW / 2, lvl, lvl + DH + 0.08);
    B('wood_painted', Math.min(o, o + f * 0.03), Math.max(o, o + f * 0.03), uc + DW / 2, uc + DW / 2 + 0.08, lvl, lvl + DH + 0.08);
    B('wood_painted', Math.min(o, o + f * 0.03), Math.max(o, o + f * 0.03), uc - DW / 2 - 0.08, uc + DW / 2 + 0.08, lvl + DH, lvl + DH + 0.08);
    if (!open) { B('wood_dark', Math.min(o, o + f * 0.045), Math.max(o, o + f * 0.045), uc - DW / 2, uc + DW / 2, lvl, lvl + DH); B('wood_ochre', Math.min(o + f * 0.045, o + f * 0.06), Math.max(o + f * 0.045, o + f * 0.06), uc - 0.3, uc + 0.3, lvl + 0.4, lvl + 1.0); B('gilt_bronze', Math.min(o + f * 0.045, o + f * 0.06), Math.max(o + f * 0.045, o + f * 0.06), uc + 0.32, uc + 0.38, lvl + 1.0, lvl + 1.06); }
  }
  function closedDoor(s, u, lvl, open) {                                      // the core's front wall at s: the door to the gallery's room
    B('wood_painted', s - DW / 2 - 0.08, s - DW / 2, u + 0.3, u + 0.33, lvl, lvl + DH + 0.08); B('wood_painted', s + DW / 2, s + DW / 2 + 0.08, u + 0.3, u + 0.33, lvl, lvl + DH + 0.08);
    B('wood_painted', s - DW / 2 - 0.08, s + DW / 2 + 0.08, u + 0.3, u + 0.33, lvl + DH, lvl + DH + 0.08);
    if (!open) B('wood_dark', s - DW / 2, s + DW / 2, u + 0.3, u + 0.345, lvl, lvl + DH);
  }

  // ── a floor: the rooms' finish and furniture ────────────────────────────────────────────────────
  function floorOf(f) {
    const f0 = lv[f], f1 = cl(f), kinds2 = { L: f === 2 ? 'burges' : kinds.L, R: f === 2 ? 'burges' : kinds.R, S: f === 2 ? 'burges' : kinds.S };
    const rooms = L.rooms.map((q) => ({ ...q, kind: kinds2[q.wing] }));
    for (const q of rooms) q.type = typeOf(q.kind, q, f);
    // the partitions: thin walls across the wings, a doorway in each
    const D2 = L.DB, sl = L.sl, sr = L.sr;
    const DOORS = L.doors.filter((d) => d.from !== 'L' || true);
    const doorsAt = (n, at) => DOORS.filter((d) => d.n === n && Math.abs(d.at - at) < 0.2);
    // the walls across u at PA (A|B), 9.1–9.3 (B|C), PC (C|D), and the walls across s at the D rooms' split
    for (const sg of [-1, 1]) {
      const outer = sg < 0 ? sl : sr, inner = pc + sg * 1.8, shaftW = pc + sg * 1.9, mid = pc + sg * 0.1;
      const run = (x0, x1, at, thick, mat) => {
        const x = Math.min(x0, x1), xx = Math.max(x0, x1);
        const ops = doorsAt('u', at).filter((d) => d.c > x && d.c < xx).map((d) => ({ c: d.c, w: d.w, y0: 0, y1: DH }));
        for (const [s0, s1, y0, y1] of pieces(x, xx, f0, f1, ops)) BR(mat, s0, s1, at - thick / 2, at + thick / 2, y0, y1);
      };
      run(outer, inner, PA, 0.12, 'plaster_white'); run(outer, inner, 9.35, 0.5, 'plaster_white'); run(outer, shaftW, PC - 0.0, 0.2, 'plaster_white');
      // the D rooms' wall at the centre line (the party wall of the two wings' back rooms) and the split wall
      if (sg < 0) BR('plaster_white', pc - 0.1, pc + 0.1, PC + 0.1, L.DB, f0, f1);
      for (const d of L.doors.filter((q) => q.n === 's' && !q.arch && q.from.startsWith('D1') && q.from.endsWith(sg < 0 ? 'L' : 'R'))) {
        const ops = [{ c: d.c, w: d.w, y0: 0, y1: DH }];
        for (const [u0, u1, y0, y1] of pieces(PC + 0.1, L.DB, f0, f1, ops)) BR('plaster_white', d.at - 0.06, d.at + 0.06, u0, u1, y0, y1);
      }
    }
    for (const q of rooms) finish(q, f, f0, f1);
    // architraves round the doorways of the rooms
    for (const d of L.doors) {
      if (d.from === 'L') continue;                                           // (the landing's doors: stair())
      const hw = (d.n === 'u' ? (Math.abs(d.at - 9.35) < 0.1 ? 0.5 : Math.abs(d.at - PA) < 0.1 ? 0.12 : 0.2) : 0.12) / 2 + 0.065, a0 = d.at - hw, a1 = d.at + hw;   // (the casing stands 4.5 cm proud of the walls' lining)
      if (d.n === 'u') for (const s of [d.c - d.w / 2 - 0.045, d.c + d.w / 2 - 0.025]) B('wood_painted', s, s + 0.07, a0, a1, f0, f0 + DH - 0.015);
      if (d.n === 'u') B('wood_painted', d.c - d.w / 2 - 0.07, d.c + d.w / 2 + 0.07, a0, a1, f0 + DH - 0.015, f0 + DH + 0.07);
      else for (const u of [d.c - d.w / 2 - 0.045, d.c + d.w / 2 - 0.025]) B('wood_painted', a0, a1, u, u + 0.07, f0, f0 + (d.arch ? 2.7 : DH) + 0.07);
    }
    // the front's windows: the gallery's glazing and the balcony doors' frames, curtains
    frontDress(f, f0, f1, rooms);
  }

  // ── one room: floor, ceiling, lining, lamp, furniture ───────────────────────────────────────────
  function finish(q, f, f0, f1) {
    const W = q.s1 - q.s0, Lr = q.u1 - q.u0, k = f === 2 ? 2 : 'mid', FO = 0.015, FLR = f0 + FO;
    const kitchen = q.type === 'kitchen' || q.type === 'maid' || q.type === 'store';
    const wallMat = kitchen ? 'plaster_white' : pick(WALLS);
    // the openings of each wall: windows, doorways (F: u0, B: u1 along s; L: s0, R: s1 along u)
    const ops = { F: [], B: [], L: [], R: [] }, taken = [];
    const hold = (r) => taken.push(r);
    for (let i = 0; i < nb; i++) {
      const sc = a + (i + 0.5) * bw, w = i === door ? 2.0 : H.WIN[k][0];
      if (q.u0 === FW && sc - w / 2 > q.s0 && sc + w / 2 < q.s1) { ops.F.push({ c: sc, w, y0: 0, y1: i === door ? 2.6 : H.WIN[k][1] + 0.06 }); hold([sc - w / 2 - 0.1, sc + w / 2 + 0.1, q.u0, q.u0 + 0.5]); }
    }
    if (q.tag === 'D') for (const bk of L.back) if (bk.c > q.s0 + 0.5 && bk.c < q.s1 - 0.5) { ops.B.push({ c: bk.c, w: 1.1, y0: 0.85, y1: 2.45 }); hold([bk.c - 0.65, bk.c + 0.65, q.u1 - 0.5, q.u1]); }
    if (q.tag === 'C') { const wl = q.wing === 'L' ? 'R' : 'L'; ops[wl].push({ c: 11.0, w: 1.0, y0: 0.9, y1: 2.3 }); hold(wl === 'R' ? [q.s1 - 0.4, q.s1, 10.4, 11.6] : [q.s0, q.s0 + 0.4, 10.4, 11.6]); }
    if (q.tag === 'B') ops[q.wing === 'L' ? 'R' : 'L'].push({ c: 7.0, w: 0.8, y0: 1.1, y1: 2.1 });
    for (const d of L.doors) {
      if (d.from !== q.id && d.to !== q.id && !(d.from === 'L' && d.to === q.id)) continue;
      const op = { c: d.c, w: d.w, y0: 0, y1: d.arch ? 2.7 : DH };
      if (d.n === 'u') {
        const w2 = Math.abs(d.at - q.u1) < 0.3 ? 'B' : 'F';
        if (d.c > q.s0 && d.c < q.s1) { ops[w2].push(op); hold(w2 === 'B' ? [d.c - d.w / 2 - 0.2, d.c + d.w / 2 + 0.2, q.u1 - 1.1, q.u1] : [d.c - d.w / 2 - 0.2, d.c + d.w / 2 + 0.2, q.u0, q.u0 + 1.1]); }
      } else {
        const w2 = Math.abs(d.at - q.s1) < 0.3 ? 'R' : 'L';
        if (d.c > q.u0 && d.c < q.u1 && Math.abs(d.at - (w2 === 'R' ? q.s1 : q.s0)) < 0.3) { ops[w2].push(op); hold(w2 === 'R' ? [q.s1 - 1.1, q.s1, d.c - d.w / 2 - 0.2, d.c + d.w / 2 + 0.2] : [q.s0, q.s0 + 1.1, d.c - d.w / 2 - 0.2, d.c + d.w / 2 + 0.2]); }
      }
    }
    // floor and ceiling
    B(kitchen ? 'tile_cream' : 'wood_ochre', q.s0, q.s1, q.u0, q.u1, f0, FLR); col.floor(fr.at(q.s0, -q.u0).concat(fr.at(q.s1, -q.u1)).map((v, i) => v), FLR);
    B('plaster_white', q.s0, q.s1, q.u0, q.u1, f1 - 0.02, f1);
    // lining of the four walls round the openings
    const line = (mat, y0, y1) => {
      for (const [s0, s1, ya, yb] of pieces(q.s0, q.s1, f0, f1, ops.F)) if (yb > y0 + f0 && ya < y1 + f0) B(mat, s0, s1, q.u0, q.u0 + 0.02, Math.max(ya, f0 + y0), Math.min(yb, f0 + y1));
      for (const [s0, s1, ya, yb] of pieces(q.s0, q.s1, f0, f1, ops.B)) if (yb > y0 + f0 && ya < y1 + f0) B(mat, s0, s1, q.u1 - 0.02, q.u1, Math.max(ya, f0 + y0), Math.min(yb, f0 + y1));
      for (const [u0, u1, ya, yb] of pieces(q.u0, q.u1, f0, f1, ops.L)) if (yb > y0 + f0 && ya < y1 + f0) B(mat, q.s0, q.s0 + 0.02, u0, u1, Math.max(ya, f0 + y0), Math.min(yb, f0 + y1));
      for (const [u0, u1, ya, yb] of pieces(q.u0, q.u1, f0, f1, ops.R)) if (yb > y0 + f0 && ya < y1 + f0) B(mat, q.s1 - 0.02, q.s1, u0, u1, Math.max(ya, f0 + y0), Math.min(yb, f0 + y1));
    };
    line(wallMat, 1.4, f1 - f0);
    line(kitchen ? 'tile_white' : 'wood_painted', 0.0, 1.4);
    // the lamp from the ceiling and a light
    const cs = (q.s0 + q.s1) / 2, cu = (q.u0 + q.u1) / 2;
    RD(IRON, [cs, cu, f1 - 0.02], [cs, cu, f1 - 0.5], 0.01, 4); LT('lamp_glass', [[0.001, f1 - 0.9 - f1], [0.1, -0.84], [0.17, -0.7], [0.12, -0.52], [0.001, -0.5]].map(([r, yy]) => [r, yy]), cs, cu, f1, 8);
    lights?.push({ at: P3at(cs, cu, f1 - 0.6), color: '#ffd9a0', intensity: 3.5, distance: 6 });
    // furniture
    const place = makePlacer(q, f0, FLR, taken, ops);
    fills()[q.type]?.(place, q, W, Lr);
  }
  function makePlacer(q, f0, FLR, taken, ops) {
    const inside = (r) => r[0] >= q.s0 + 0.03 && r[1] <= q.s1 - 0.03 && r[2] >= q.u0 + 0.03 && r[3] <= q.u1 - 0.03;
    const hit = (r) => taken.some((t) => r[0] < t[1] - 0.02 && r[1] > t[0] + 0.02 && r[2] < t[3] - 0.02 && r[3] > t[2] + 0.02);
    const put = (name, cs, cu, rot, o = {}) => {
      const it = ITEMS[name], w = o.w ?? it.w, d = o.d ?? it.d, sw = rot % 2 ? d : w, sd = rot % 2 ? w : d, r = [cs - sw / 2, cs + sw / 2, cu - sd / 2, cu + sd / 2];
      if (!inside(r) || (!it.flat && hit(r))) return false;
      const m = (x, z) => { x -= w / 2; z -= d / 2; return rot === 0 ? [cs + x, cu + z] : rot === 1 ? [cs - z, cu + x] : rot === 2 ? [cs - x, cu - z] : [cs + z, cu - x]; };
      const g = {
        bx: (mat, x0, x1, z0, z1, y0, y1) => { const p = m(x0, z0), p2 = m(x1, z1); B(mat, Math.min(p[0], p2[0]), Math.max(p[0], p2[0]), Math.min(p[1], p2[1]), Math.max(p[1], p2[1]), FLR + y0, FLR + y1); },
        rd: (mat, p, p2, rr) => { const a1 = m(p[0], p[1]), b1 = m(p2[0], p2[1]); RD(mat, [a1[0], a1[1], FLR + p[2]], [b1[0], b1[1], FLR + p2[2]], rr, 4); },
        lt: (mat, prof, x, z, y) => { const p = m(x, z); LT(mat, prof, p[0], p[1], FLR + y, 8); },
        o,
      };
      it.build(g, w, d, o);
      if (!it.flat) { taken.push(r); if (it.h) R(r[0], r[1], r[2], r[3], FLR, FLR + it.h); }
      return true;
    };
    const len = (wl) => (wl === 'F' || wl === 'B' ? q.s1 - q.s0 : q.u1 - q.u0);
    const wall = (name, wls, along = 'c', o = {}) => {
      for (const wl of [].concat(wls)) {
        const it = ITEMS[name], w = o.w ?? it.w, d = o.d ?? it.d, n = len(wl), x0 = typeof along === 'number' ? along : along === 'e' ? n - w - 0.05 : along === 's' ? 0.05 : (n - w) / 2;
        for (let k = 0; k < 14; k++) {
          const x = x0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.25;
          if (x < 0 || x + w > n) continue;
          const ok = wl === 'F' ? put(name, q.s0 + x + w / 2, q.u0 + d / 2 + 0.02, 0, o) : wl === 'B' ? put(name, q.s0 + x + w / 2, q.u1 - d / 2 - 0.02, 2, o)
            : wl === 'L' ? put(name, q.s0 + d / 2 + 0.02, q.u0 + x + w / 2, 3, o) : put(name, q.s1 - d / 2 - 0.02, q.u0 + x + w / 2, 1, o);
          if (ok) return true;
        }
      }
      return false;
    };
    const chairs = (cs, cu, w, d, n, mat) => {                                // chairs round a table (w across s, d across u), facing it
      const sp = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, 1]];
      let c = 0;
      for (const [i, j] of [[-0.25, -1], [0.25, -1], [-0.25, 1], [0.25, 1], [-1, 0], [1, 0]]) {
        if (c >= n) break;
        const px = cs + i * (w / 2 + 0.05) * (Math.abs(i) > 0.5 ? 1 : 0) + (Math.abs(i) > 0.5 ? i * 0.3 : i * w), pz = cu + j * (d / 2 + 0.3) * (Math.abs(i) > 0.5 ? 0 : 1) + (Math.abs(i) > 0.5 ? 0 : 0);
        const rot = j < 0 ? 0 : j > 0 ? 2 : i < 0 ? 3 : 1;
        if (put('chair', px, pz, rot, { mat })) c++;
      }
      void sp;
    };
    return { put, wall, chairs, FLR, f0 };
  }
  function makeItems() {
    const woods = ['wood_dark', 'wood_ochre'];
    const I = {};
    I.bed2 = { w: 1.6, d: 2.1, h: 0.75, build: (g, w, d, o) => { const c = o.c ?? 'cloth_red'; g.bx('wood_dark', 0, w, 0, 0.07, 0, 1.15); g.bx('wood_dark', 0, w, d - 0.07, d, 0, 0.6); g.bx('wood_dark', 0, 0.06, 0, d, 0.25, 0.4); g.bx('wood_dark', w - 0.06, w, 0, d, 0.25, 0.4); g.bx('linen', 0.07, w - 0.07, 0.08, d - 0.07, 0.4, 0.58); g.bx(c, 0.07, w - 0.07, 0.9, d - 0.05, 0.58, 0.63); g.bx('cloth_white', 0.15, w / 2 - 0.05, 0.12, 0.5, 0.58, 0.7); g.bx('cloth_white', w / 2 + 0.05, w - 0.15, 0.12, 0.5, 0.58, 0.7); } };
    I.bed1 = { w: 0.95, d: 1.95, h: 0.7, build: (g, w, d, o) => { const c = o.c ?? 'cloth_indigo'; for (const [x, z, hh] of [[0.03, 0.03, 1.05], [w - 0.03, 0.03, 1.05], [0.03, d - 0.03, 0.7], [w - 0.03, d - 0.03, 0.7]]) g.rd(IRON, [x, z, 0], [x, z, hh], 0.015); g.rd(IRON, [0.03, 0.03, 0.9], [w - 0.03, 0.03, 0.9], 0.012); g.rd(IRON, [0.03, 0.03, 0.35], [0.03, d - 0.03, 0.35], 0.012); g.rd(IRON, [w - 0.03, 0.03, 0.35], [w - 0.03, d - 0.03, 0.35], 0.012); g.bx('linen', 0.05, w - 0.05, 0.06, d - 0.05, 0.36, 0.5); g.bx(c, 0.05, w - 0.05, 0.7, d - 0.04, 0.5, 0.54); g.bx('cloth_white', 0.1, w - 0.1, 0.1, 0.45, 0.5, 0.6); } };
    I.wardrobe = { w: 1.5, d: 0.6, h: 2.3, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0, 2.2); g.bx('wood_dark', -0.04, w + 0.04, -0.0, d + 0.04, 2.2, 2.3); g.bx('wood_ochre', 0.08, w / 2 - 0.04, d, d + 0.02, 0.2, 2.0); g.bx('mirror_tin', w / 2 + 0.08, w - 0.08, d, d + 0.015, 0.3, 1.9); } };
    I.chest = { w: 1.1, d: 0.5, h: 0.55, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0, 0.5); g.bx('wood_dark', -0.01, w + 0.01, -0.01, d + 0.01, 0.5, 0.56); g.bx(IRON, 0.12, 0.17, 0, d + 0.012, 0, 0.5); g.bx(IRON, w - 0.17, w - 0.12, 0, d + 0.012, 0, 0.5); } };
    I.washstand = { w: 0.9, d: 0.5, h: 0.9, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0, 0.8); g.bx('marble', -0.02, w + 0.02, -0.02, d + 0.02, 0.8, 0.85); g.lt('glaze_white', [[0.001, 0.85], [0.18, 0.86], [0.2, 0.93], [0.001, 0.93]], 0.35, 0.25, 0); g.lt('glaze_white', [[0.001, 0.85], [0.07, 0.86], [0.07, 1.05], [0.001, 1.05]], 0.72, 0.18, 0); g.bx('mirror_tin', 0.1, w - 0.1, 0.01, 0.03, 1.15, 1.75); g.bx('wood_ochre', 0.07, w - 0.07, 0.0, 0.015, 1.12, 1.78); } };
    I.table_round = { w: 1.1, d: 1.1, h: 0.8, build: (g, w, d, o) => { g.lt(o.mat ?? 'wood_dark', [[0.001, 0.76], [0.55, 0.76], [0.55, 0.8], [0.001, 0.8]], w / 2, d / 2, 0); g.lt('cloth_white', [[0.001, 0.8], [0.5, 0.8], [0.52, 0.5], [0.5, 0.5]], w / 2, d / 2, 0); g.lt('wood_dark', [[0.2, 0], [0.05, 0.05], [0.05, 0.7], [0.001, 0.76]], w / 2, d / 2, 0); } };
    I.table = { w: 1.0, d: 1.9, h: 0.8, build: (g, w, d, o) => { g.bx(o.mat ?? 'wood_dark', 0, w, 0, d, 0.74, 0.8); for (const [x, z] of [[0.06, 0.06], [w - 0.1, 0.06], [0.06, d - 0.1], [w - 0.1, d - 0.1]]) g.bx(o.mat ?? 'wood_dark', x, x + 0.05, z, z + 0.05, 0, 0.74); if (o.cloth) g.bx('cloth_white', 0.1, w - 0.1, 0.2, d - 0.2, 0.8, 0.805); } };
    I.chair = { w: 0.45, d: 0.45, h: 0.95, build: (g, w, d, o) => { const m = o.mat ?? 'wood_dark'; g.bx(m, 0.02, w - 0.02, 0.05, d - 0.02, 0.42, 0.46); for (const [x, z] of [[0.05, 0.08], [w - 0.05, 0.08], [0.05, d - 0.05], [w - 0.05, d - 0.05]]) g.rd(m, [x, z, 0], [x, z, 0.42], 0.013); for (const x of [0.05, w - 0.05]) g.rd(m, [x, 0.08, 0.46], [x, 0.08, 0.95], 0.012); g.bx(m, 0.03, w - 0.03, 0.06, 0.1, 0.8, 0.9); } };
    I.sofa = { w: 1.8, d: 0.8, h: 0.9, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0.1, 0.4); g.bx('cloth_maroon', 0.05, w - 0.05, 0.12, d - 0.03, 0.4, 0.55); g.bx('cloth_maroon', 0, w, 0, 0.18, 0.4, 0.9); g.bx('cloth_maroon', 0, 0.16, 0, d, 0.4, 0.7); g.bx('cloth_maroon', w - 0.16, w, 0, d, 0.4, 0.7); } };
    I.armchair = { w: 0.8, d: 0.8, h: 0.9, build: (g, w, d, o) => { const c = o.c ?? 'cloth_green'; g.bx('wood_dark', 0, w, 0, d, 0.1, 0.4); g.bx(c, 0.06, w - 0.06, 0.12, d - 0.03, 0.4, 0.55); g.bx(c, 0, w, 0, 0.16, 0.4, 0.95); g.bx(c, 0, 0.14, 0, d, 0.4, 0.68); g.bx(c, w - 0.14, w, 0, d, 0.4, 0.68); } };
    I.piano = { w: 1.5, d: 0.6, h: 1.3, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0.0, 1.3); g.bx('wood_painted', 0.04, w - 0.04, d, d + 0.2, 0.74, 0.78); g.bx('wood_dark', 0.0, w, d - 0.05, d + 0.22, 0.7, 0.74); for (let k = 0; k < 8; k++) g.bx('cloth_white', 0.12 + k * 0.17, 0.26 + k * 0.17, d + 0.02, d + 0.18, 0.78, 0.8); g.bx('wood_dark', 0.05, 0.1, d, d + 0.2, 0, 0.7); g.bx('wood_dark', w - 0.1, w - 0.05, d, d + 0.2, 0, 0.7); } };
    I.sideboard = { w: 1.6, d: 0.5, h: 1.0, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0, 0.95); g.bx('wood_ochre', 0.06, w / 2 - 0.03, d, d + 0.02, 0.1, 0.85); g.bx('wood_ochre', w / 2 + 0.03, w - 0.06, d, d + 0.02, 0.1, 0.85); g.bx('marble', -0.02, w + 0.02, -0.02, d + 0.03, 0.95, 1.0); g.bx('mirror_tin', 0.2, w - 0.2, 0.0, 0.02, 1.2, 1.9); g.bx('wood_ochre', 0.17, w - 0.17, -0.005, 0.01, 1.17, 1.93); } };
    I.bookcase = { w: 1.2, d: 0.35, h: 2.0, build: (g, w, d, o) => { g.bx('wood_dark', 0, w, 0, d, 0, 2.0); const cs = ['cloth_red', 'cloth_green', 'cloth_indigo', 'hide_brown', 'cloth_ochre']; for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) g.bx(cs[(r * 3 + k) % 5], 0.06 + k * 0.155, 0.06 + k * 0.155 + 0.13, d, d + 0.18 - 0.0, 0.3 + r * 0.33, 0.3 + r * 0.33 + 0.26); void o; } };
    I.desk = { w: 1.4, d: 0.7, h: 0.78, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0.7, 0.78); g.bx('wood_dark', 0.02, 0.4, 0.02, d - 0.02, 0, 0.7); g.bx('wood_dark', w - 0.06, w - 0.02, 0.02, d - 0.02, 0, 0.7); g.bx('cloth_green', 0.3, w - 0.3, 0.12, d - 0.12, 0.78, 0.785); g.bx('paper' in {} ? 'paper' : 'cloth_white', 0.5, 0.8, 0.2, 0.5, 0.785, 0.79); } };
    I.range = { w: 1.1, d: 0.6, h: 0.95, build: (g, w, d) => { g.bx(IRON, 0, w, 0, d, 0.1, 0.9); g.bx(IRON, 0.05, 0.1, 0.05, 0.1, 0, 0.1); g.bx(IRON, w - 0.1, w - 0.05, 0.05, 0.1, 0, 0.1); g.bx('glow' in {} ? 'glow' : 'gilt_bronze', 0.1, 0.4, d, d + 0.01, 0.3, 0.55); g.rd(IRON, [w * 0.8, 0.2, 0.9], [w * 0.8, 0.2, 2.6], 0.07); g.bx('terracotta', 0.4, w - 0.1, 0.08, d - 0.08, 0.9, 0.93); } };
    I.sink = { w: 1.0, d: 0.6, h: 0.9, build: (g, w, d) => { g.bx('granite_grey', 0, w, 0, d, 0.0, 0.85); g.bx('marble', -0.02, w + 0.02, -0.02, d + 0.02, 0.85, 0.9); g.bx('glaze_white', 0.15, 0.7, 0.1, d - 0.1, 0.86, 0.9); g.rd(IRON, [0.4, 0.05, 0.9], [0.4, 0.05, 1.2], 0.015); for (let k = 0; k < 3; k++) { g.bx('wood_dark', 0, w, 0.0, 0.2, 1.6 + k * 0.0, 1.63); g.lt('terracotta', [[0.001, 1.63], [0.09, 1.63], [0.1, 1.8], [0.001, 1.8]], 0.2 + k * 0.3, 0.1, 0); } } };
    I.sewing = { w: 0.9, d: 0.5, h: 0.85, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0.72, 0.78); for (const x of [0.05, w - 0.08]) g.bx(IRON, x, x + 0.03, 0.05, d - 0.05, 0, 0.72); g.bx(IRON, 0.12, w - 0.2, 0.1, d - 0.1, 0.78, 0.85); g.rd(IRON, [0.08, 0.25, 0.08], [w - 0.08, 0.25, 0.08], 0.012); g.bx('cloth_blue' in {} ? 'cloth_blue' : 'cloth_indigo', w - 0.3, w - 0.1, 0.12, 0.35, 0.78, 0.8); } };
    I.cutting = { w: 2.0, d: 1.0, h: 0.9, build: (g, w, d, o) => { g.bx('wood_ochre', 0, w, 0, d, 0.82, 0.9); for (const [x, z] of [[0.05, 0.05], [w - 0.1, 0.05], [0.05, d - 0.1], [w - 0.1, d - 0.1]]) g.bx('wood_dark', x, x + 0.06, z, z + 0.06, 0, 0.82); const cs = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green']; for (let k = 0; k < 4; k++) g.bx(cs[(k + (o.i ?? 0)) % 4], 0.15 + k * 0.4, 0.45 + k * 0.4, 0.2, 0.7, 0.9, 0.9 + 0.1 + (k % 2) * 0.05); g.bx(IRON, 1.6, 1.85, 0.4, 0.46, 0.9, 0.915); } };
    I.dressform = { w: 0.45, d: 0.45, h: 1.6, build: (g, w, d) => { g.lt('linen', [[0.001, 0.9], [0.14, 0.92], [0.17, 1.1], [0.15, 1.35], [0.08, 1.5], [0.04, 1.55], [0.001, 1.58]], w / 2, d / 2, 0); g.rd('wood_dark', [w / 2, d / 2, 0], [w / 2, d / 2, 0.95], 0.02); g.lt('wood_dark', [[0.2, 0], [0.2, 0.03], [0.001, 0.05]], w / 2, d / 2, 0); } };
    I.crates = { w: 1.2, d: 0.8, h: 1.1, build: (g, w, d) => { g.bx('wood_ochre', 0, 0.6, 0, d, 0, 0.5); g.bx('wood_dark', 0.02, 0.58, 0.02, d - 0.02, 0.5, 0.52); g.bx('wood_ochre', 0.05, 0.55, 0.1, d - 0.1, 0.52, 1.0); g.lt('sacking', [[0.001, 0], [0.22, 0.02], [0.26, 0.3], [0.2, 0.55], [0.001, 0.6]], 0.9, 0.3, 0); g.lt('wood_dark', [[0.2, 0], [0.26, 0.4], [0.2, 0.8], [0.001, 0.8]], 0.9, 0.62, 0); } };
    I.bench = { w: 1.6, d: 0.4, h: 0.5, build: (g, w, d) => { g.bx('leather_bench', 0, w, 0, d, 0.4, 0.47); for (const x of [0.05, w - 0.1]) g.bx('wood_dark', x, x + 0.05, 0.03, d - 0.03, 0, 0.4); } };
    I.plant = { w: 0.5, d: 0.5, h: 1.3, build: (g, w, d) => { g.lt('terracotta', [[0.001, 0], [0.15, 0], [0.2, 0.34], [0.22, 0.36], [0.001, 0.36]], w / 2, d / 2, 0); for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2; g.rd('cloth_green', [w / 2, d / 2, 0.34], [w / 2 + Math.cos(t) * 0.22, d / 2 + Math.sin(t) * 0.22, 0.95 + (k % 3) * 0.12], 0.014); } } };
    I.stove = { w: 0.5, d: 0.5, h: 1.0, build: (g, w, d) => { g.lt(IRON, [[0.001, 0.0], [0.2, 0.05], [0.22, 0.4], [0.2, 0.75], [0.001, 0.8]], w / 2, d / 2, 0); g.rd(IRON, [w / 2, d / 2, 0.8], [w / 2, d / 2, 2.4], 0.045); } };
    I.couch = { w: 1.9, d: 0.7, h: 0.6, build: (g, w, d) => { g.bx('wood_dark', 0, w, 0, d, 0.0, 0.35); g.bx('leather_bench', 0.02, w - 0.02, 0.02, d - 0.02, 0.35, 0.5); g.bx('leather_bench', 0.02, 0.4, 0.02, d - 0.02, 0.5, 0.58); g.bx('cloth_white', 0.5, w - 0.05, 0.05, d - 0.05, 0.5, 0.52); } };
    I.screen = { w: 1.2, d: 0.12, h: 1.7, build: (g, w, d) => { for (let k = 0; k < 3; k++) { g.bx('wood_dark', k * 0.4, k * 0.4 + 0.4, k % 2 ? 0.0 : 0.06, (k % 2 ? 0 : 0.06) + 0.03, 0.05, 1.7); g.bx('cloth_ochre', k * 0.4 + 0.03, k * 0.4 + 0.37, (k % 2 ? 0.0 : 0.06) + 0.005, (k % 2 ? 0.0 : 0.06) + 0.025, 0.2, 1.55); } void d; } };
    I.rug = { w: 2.2, d: 1.6, flat: true, build: (g, w, d, o) => { g.bx(o.c ?? 'cloth_maroon', 0, w, 0, d, 0, 0.012); g.bx('cloth_ochre', 0.12, w - 0.12, 0.12, d - 0.12, 0.012, 0.016); g.bx(o.c ?? 'cloth_maroon', 0.25, w - 0.25, 0.25, d - 0.25, 0.016, 0.02); } };
    void woods;
    return I;
  }

  function fills() { return {
    saleta: (p, q) => { p.wall('plant', ['L', 'R'], 's'); p.put('table_round', (q.s0 + q.s1) / 2, q.u0 + 1.9, 0, { w: 0.8, d: 0.8, mat: 'wood_ochre' }); p.put('armchair', q.s0 + 0.55, q.u0 + 1.6, 3, { c: 'cloth_maroon' }); p.put('armchair', q.s1 - 0.55, q.u0 + 1.6, 1, { c: 'cloth_maroon' }); },
    salon: (p, q) => { p.put('rug', (q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2 + 0.2, 0, { w: Math.min(3, q.s1 - q.s0 - 1.2), d: 2.4 }); p.wall('piano', 'L', 'c'); p.wall('sofa', 'B', 'c'); p.wall('bookcase', ['L', 'R'], 'e'); p.put('table_round', (q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2 + 0.2, 0, { w: 0.8, d: 0.8, mat: 'wood_ochre' }); p.put('armchair', (q.s0 + q.s1) / 2 - 1.0, (q.u0 + q.u1) / 2 + 0.8, 0, { c: 'cloth_green' }); p.wall('plant', 'F', 's'); },
    study: (p, q) => { p.wall('desk', ['L', 'R'], 'c'); p.wall('bookcase', ['L', 'R'], 's'); p.wall('bookcase', ['B', 'F'], 'e'); p.wall('armchair', ['B', 'F'], 's', { c: 'cloth_maroon' }); p.put('chair', (q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2, 0); },
    dining: (p, q) => { const cs = (q.s0 + q.s1) / 2, cu = (q.u0 + q.u1) / 2; p.put('rug', cs, cu, 0, { w: 2.4, d: 3.0, c: 'cloth_indigo' }); p.put('table', cs, cu, 0, { cloth: true, w: 1.0, d: 1.9 }); p.chairs(cs, cu, 1.0, 1.9, 4); p.wall('sideboard', ['L', 'R', 'B'], 'c'); p.wall('plant', ['B', 'F'], 'e'); },
    sewing: (p, q) => { p.wall('sewing', ['L', 'R'], 's'); p.wall('sewing', ['L', 'R'], 'e'); p.put('cutting', (q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2, 0, { w: Math.min(2, q.s1 - q.s0 - 1.4) }); p.wall('dressform', ['B', 'F'], 's'); p.wall('chest', ['B', 'F'], 'e'); },
    kitchen: (p, q) => { p.wall('range', ['L', 'R', 'B'], 's'); p.wall('sink', ['R', 'L', 'B'], 'e'); p.put('table', (q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2 + 0.2, 0, { w: 0.8, d: 1.3, cloth: true }); p.chairs((q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2 + 0.2, 0.8, 1.3, 2); p.wall('chest', ['B', 'F'], 'c'); },
    maid: (p) => { p.wall('bed1', ['L', 'R'], 's'); p.wall('chest', ['B', 'L', 'R'], 'e'); p.wall('crates', ['B', 'F', 'R', 'L'], 'e'); p.wall('wardrobe', ['F', 'B'], 'c'); },
    bed2: (p, q) => { p.wall('bed2', ['L', 'R', 'B'], 'c', { c: BLANKET[(q.s0 * 7 | 0) % 5] }); p.wall('wardrobe', ['R', 'L', 'F', 'B'], 'e'); p.wall('washstand', ['F', 'B', 'L', 'R'], 's'); p.wall('chest', ['F', 'B', 'R', 'L'], 'c'); p.put('rug', (q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2, 0, { w: 1.6, d: 1.2, c: 'cloth_indigo' }); },
    bed1: (p, q) => { p.wall('bed1', ['L', 'R', 'B'], 'c', { c: BLANKET[(q.u0 | 0) % 5] }); p.wall('chest', ['B', 'F', 'R', 'L'], 'e'); p.wall('wardrobe', ['R', 'L', 'F', 'B'], 'e'); p.wall('washstand', ['F', 'B'], 's'); },
    dining_poor: (p, q) => { const cs = (q.s0 + q.s1) / 2, cu = (q.u0 + q.u1) / 2; p.put('table', cs, cu, 0, { cloth: true, w: 0.9, d: 1.5, mat: 'wood_ochre' }); p.chairs(cs, cu, 0.9, 1.5, 4); p.wall('sideboard', ['L', 'R', 'B'], 'c'); p.wall('stove', ['L', 'R'], 's'); p.wall('chest', ['B', 'F'], 'e'); },
    sitting: (p, q) => { const cs = (q.s0 + q.s1) / 2, cu = (q.u0 + q.u1) / 2; p.put('table', cs, cu, 0, { w: 0.9, d: 2.4, cloth: true }); p.wall('bench', ['L', 'R'], 'c'); p.wall('bench', ['R', 'L'], 'c'); p.chairs(cs, cu, 0.9, 2.4, 2); p.wall('plant', ['B', 'F'], 'e'); p.wall('sideboard', ['B', 'F'], 'c'); },
    lodger: (p) => { p.wall('bed1', ['L', 'R', 'B'], 'c', { c: 'cloth_grey' in {} ? 'cloth_grey' : 'cloth_indigo' }); p.wall('washstand', ['F', 'B', 'L', 'R'], 's'); p.wall('wardrobe', ['R', 'L', 'F', 'B'], 'e'); p.wall('chair', ['F', 'B', 'L', 'R'], 'c'); },
    dorm: (p) => { p.wall('bed1', ['L'], 's'); p.wall('bed1', ['L'], 'c'); p.wall('bed1', ['R'], 's'); p.wall('bed1', ['R'], 'c'); p.wall('bed1', ['L'], 'e'); p.wall('chest', ['B', 'F'], 'c'); },
    workroom: (p, q) => { p.wall('sewing', ['L', 'R', 'F'], 's'); p.wall('sewing', ['L', 'R', 'F'], 'e'); p.wall('sewing', ['L', 'R'], 'c'); p.put('cutting', (q.s0 + q.s1) / 2, (q.u0 + q.u1) / 2, 0, { w: Math.min(2, q.s1 - q.s0 - 1.2), i: 1 }); p.wall('dressform', ['B', 'F', 'R'], 's'); p.wall('dressform', ['B', 'F', 'R'], 'e'); },
    fitting: (p) => { p.wall('dressform', ['L', 'R'], 'c'); p.wall('screen', ['B', 'F'], 'c'); p.wall('wardrobe', ['L', 'R'], 's'); p.wall('chair', ['F', 'B'], 'e'); p.wall('chest', ['R', 'L'], 'e'); },
    waiting: (p) => { p.wall('bench', ['L', 'R'], 'c'); p.wall('bench', ['R', 'L'], 'c'); p.wall('plant', ['B', 'F'], 's'); p.wall('plant', ['B', 'F'], 'e'); p.wall('bookcase', ['B', 'F', 'L'], 'c'); },
    consult: (p) => { p.wall('desk', ['L', 'R'], 'c'); p.wall('couch', ['R', 'L'], 'c'); p.wall('screen', ['B', 'F'], 's'); p.wall('bookcase', ['B', 'F', 'L'], 'e'); p.wall('chair', ['F', 'B', 'L'], 'c'); },
    office: (p) => { p.wall('desk', ['L', 'R', 'B'], 'c'); p.wall('bookcase', ['L', 'R'], 's'); p.wall('chair', ['L', 'R', 'B'], 'e'); },
    store: (p) => { p.wall('crates', ['L', 'R', 'B'], 's'); p.wall('crates', ['R', 'L', 'B'], 'e'); p.wall('chest', ['B', 'F'], 'c'); p.wall('wardrobe', ['L', 'R'], 'c'); },
  }; }

  // ── the front: the gallery's glazing frames, the balconies' railings in the collision, curtains ──
  function frontDress(f, f0, f1) {
    const cur = pick(['cloth_maroon', 'cloth_white', 'cloth_green']), k = f === 2 ? 2 : 'mid';
    const dg = a + (door + 0.5) * bw;
    for (let i = 0; i < nb; i++) {
      const sc = a + (i + 0.5) * bw, w = i === door ? 2.0 : H.WIN[k][0], hh = (i === door ? 2.6 : H.WIN[k][1]);
      // curtains drawn back at both jambs; the rod
      for (const e of [-1, 1]) B(cur, e < 0 ? sc - w / 2 - 0.02 : sc + w / 2 - 0.16, e < 0 ? sc - w / 2 + 0.16 : sc + w / 2 + 0.02, FW + 0.03, FW + 0.07, f0 + 0.1, f0 + hh + 0.15);
      RD(IRON, [sc - w / 2 - 0.1, FW + 0.06, f0 + hh + 0.2], [sc + w / 2 + 0.1, FW + 0.06, f0 + hh + 0.2], 0.01, 4);
      if (i === door) continue;
      if (f === 3) {                                                          // the upper floor's small balcony: floor and railing in the collision
        col.floor(fr.at(sc - 0.9, 0.6).concat(fr.at(sc + 0.9, 0.0)), f0 + 0.01);
        R(sc - 0.95, sc + 0.95, -0.6, -0.5, f0, f0 + 1.0); R(sc - 0.95, sc - 0.88, -0.6, 0, f0, f0 + 1.0); R(sc + 0.88, sc + 0.95, -0.6, 0, f0, f0 + 1.0);
      }
    }
    if (f === 2) {
      for (const [s0, s1] of [[a + 0.4, dg - 1.65], [dg + 1.65, b - 0.4]]) {
        const n = Math.floor((s1 - s0 - 0.1) / 0.96); if (n < 1) continue;
        const m = (s0 + s1) / 2, Lr = n * 0.96, x0 = m - Lr / 2, x1 = m + Lr / 2;
        R(x0, x1, -0.92, -0.82, f0, f0 + 1.0); R(x0, x0 + 0.05, -0.92, 0, f0, f0 + 1.0); R(x1 - 0.05, x1, -0.92, 0, f0, f0 + 1.0);
        col.floor(fr.at(x0, 0.95).concat(fr.at(x1, 0.0)), f0 + 0.01);
      }
    }
    // the gallery over the door: its floor, its glazed front and stone sides in the collision
    col.floor(fr.at(dg - 1.4, 0.9).concat(fr.at(dg + 1.4, 0.0)), f0 + 0.01);
    R(dg - 1.6, dg + 1.6, -1.1, -0.9, f0, f0 + 2.9); R(dg - 1.6, dg - 1.4, -1.1, 0, f0, f0 + 2.9); R(dg + 1.4, dg + 1.6, -1.1, 0, f0, f0 + 2.9);
  }

  // ── the roof terrace ────────────────────────────────────────────────────────────────────────────
  function roof() {
    const yr = y + h, sh = 2.6, sM = pc - 1.8, sP = pc + 1.8, wl = pc - CORE.well, wr = pc + CORE.well, M = 'stucco_cream';
    const voids = [{ s0: pc - 1.9, s1: pc + 1.9, u0: SHAFT.u0 - 0.2, u1: SHAFT.u1 + 0.2 }, { s0: sM, s1: sP, u0: 3.4, u1: 9.6 }];
    // the tiled floor of the terrace
    for (const [s0, s1, u0, u1] of carve(a + 0.25, b - 0.25, D - 0.3, voids)) if (u0 >= 0.3 || true) B('terracotta', s0, s1, Math.max(u0, 0.3), u1, yr, yr + 0.012);
    // the stair house over the core: three walls, the door in the front, a flat roof with a glazed lantern over the well
    for (const [s0, s1, y0, y1] of pieces(sM, sP, yr, yr + sh, [{ c: pc, w: 1.1, y0: 0, y1: 2.15 }])) BR(M, s0, s1, 3.4, 3.7, y0, y1);
    BR(M, sM, sM + 0.5, 3.7, 9.6, yr, yr + sh); BR(M, sP - 0.5, sP, 3.7, 9.6, yr, yr + sh); BR(M, sM + 0.5, sP - 0.5, 9.1, 9.6, yr, yr + sh);
    for (const [s0, s1, u0, u1] of carve(sM, sP, 9.6, [{ s0: wl - 0.1, s1: wr + 0.1, u0: 4.9, u1: 7.9 }, ...[]].map((v) => v)).filter((r) => r[3] > 3.4 && r[2] >= 0)) B(M, s0, s1, Math.max(u0, 3.4), u1, yr + sh, yr + sh + 0.2);
    B('glass_outer', wl - 0.1, wr + 0.1, 4.9, 7.9, yr + sh + 0.55, yr + sh + 0.57);
    for (const [s0, s1, u0, u1] of [[wl - 0.12, wl - 0.08, 4.9, 7.9], [wr + 0.08, wr + 0.12, 4.9, 7.9], [wl - 0.1, wr + 0.1, 4.88, 4.92], [wl - 0.1, wr + 0.1, 7.88, 7.92]]) B(IRON, s0, s1, u0, u1, yr + sh + 0.2, yr + sh + 0.55);
    for (const [s0, s1] of [[wl - 0.1, pc - 0.01], [pc + 0.01, wr + 0.1]]) B('glass_outer', s0, s1, 4.9, 7.9, yr + sh + 0.2, yr + sh + 0.22);
    // the door's leaf, folded back; a step up to the landing is not needed (the landing is the roof's level)
    B('wood_dark', pc + 0.55, pc + 0.6, 3.1, 3.4, yr, yr + 2.1);
    // the lid of the light well: a glazed pane in an iron frame, over its parapet
    B('glass_outer', pc - 1.7, pc + 1.7, SHAFT.u0, SHAFT.u1, yr + 0.92, yr + 0.94);
    for (let k = 0; k <= 3; k++) B(IRON, pc - 1.7 + k * 1.133 - 0.02, pc - 1.7 + k * 1.133 + 0.02, SHAFT.u0, SHAFT.u1, yr + 0.9, yr + 0.96);
    // the washing: two lines on posts across the back terrace, sheets and shirts hung out
    const r2 = rng(G.seed ^ 77), cols = ['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red'];
    for (const [u, s0, s1] of [[15.4, a + 1.2, b - 1.2], [14.2, a + 1.2, b - 1.2], [1.8, a + 1.0, pc - 2.4], [1.8, pc + 2.4, b - 1.0]]) {
      if (s1 - s0 < 1.5) continue;
      for (const s of [s0, s1]) { RD(IRON, [s, u, yr], [s, u, yr + 2.1], 0.025, 5); R(s - 0.04, s + 0.04, u - 0.04, u + 0.04, yr, yr + 2.1); }
      RD(IRON, [s0, u, yr + 2.05], [s1, u, yr + 2.05], 0.004, 3);
      for (let s = s0 + 0.2; s < s1 - 0.7;) { const wd = 0.5 + r2() * 0.6, hg = 0.5 + r2() * 0.8; B(cols[Math.floor(r2() * cols.length)], s, s + wd, u - 0.01, u + 0.01, yr + 2.05 - hg, yr + 2.05); s += wd + 0.12 + r2() * 0.3; }
    }
    // a water tank on its stand, flower pots on the back parapet's foot, a stool
    const tb = pc + 3.2 * (r2() < 0.5 ? -1 : 1);
    if (tb > a + 1.2 && tb < b - 1.2) { LT('iron_galv', [[0.45, 0.5], [0.5, 0.6], [0.5, 1.3], [0.001, 1.34]], tb, 2.0, yr, 10); for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) RD('wood_dark', [tb + x, 2.0 + z, yr], [tb + x, 2.0 + z, yr + 0.55], 0.03, 4); R(tb - 0.5, tb + 0.5, 1.5, 2.5, yr, yr + 1.35); }
    for (let k = 0; k < 6; k++) { const s = a + 1.5 + k * ((b - a - 3) / 5), u = D - 0.6; LT('terracotta', [[0.001, 0], [0.13, 0], [0.18, 0.28], [0.001, 0.3]], s, u, yr, 7); for (let j = 0; j < 4; j++) RD('cloth_green', [s, u, yr + 0.28], [s + (j - 1.5) * 0.08, u + (j % 2 - 0.5) * 0.1, yr + 0.55 + (j % 2) * 0.1], 0.012, 3); }
    lights?.push({ at: P3at(pc, 5.5, yr + 2.2), color: '#ffd9a0', intensity: 3, distance: 6 });
  }
}
