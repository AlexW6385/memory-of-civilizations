// The upper storeys of the open timber houses of Istanbul about 1560 (docs/settlements/ottoman-istanbul.md §17).
//
// A house here is a stone ground storey (store, workshop or living room) and one or two timber storeys above. The stair
// is inside, steep and enclosed, against the left party wall; it brings one up into the sofa — the hall the rooms open
// off — and in a house of three storeys a second flight goes on up behind it. The rooms off the sofa: the street room
// at the front with its cumba (the bay on brackets, open to the room, with windows on three sides), the rooms behind with
// windows on the yard. In them: the sedir (divan) along the windows, the built-in cupboard (yüklük) with the bedding
// stacked in it, floor mattresses, chests, the brass tray, the brazier, the hearth with its plaster hood, the stock of
// the trade of the house.
//
// One frame throughout (the frame of konak.js room()): u along the front from the left, v in from the ground storey's
// front face (the jetty is v < 0); y is absolute.

import { box, lathe, frustum } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, l) => l[Math.floor(rand() * l.length)];

export const TW = 0.16;                    // the timber walls of the upper storeys
export const GT = 0.4;                     // the rubble walls of the ground storey
export const LANE = [0.45, 1.35];          // the flight's width (u)
export const FLIGHT1 = [1.45, 5.35];       // ground → first floor (v)
export const FLIGHT2 = [5.75, 9.0];       // first → second floor (v)
export const GUARD = 1.5;                  // the stair's open side: the partition (ground) or the rail (upper), u
/** The stair wells (u0, v0, u1, v1) in the floor of storey 1 and of storey 2. */
export const WELL1 = [TW, 2.0, GUARD, FLIGHT1[1]];
export const WELL2 = [TW, 6.6, GUARD, FLIGHT2[1]];

/** r (u0, v0, u1, v1) less the holes, as rectangles. */
export function cutRect(r, holes) {
  let out = [r];
  for (const h of holes) {
    const next = [];
    for (const q of out) {
      const a = Math.max(q[0], h[0]), b = Math.max(q[1], h[1]), c = Math.min(q[2], h[2]), d = Math.min(q[3], h[3]);
      if (a >= c || b >= d) { next.push(q); continue; }
      if (q[0] < a) next.push([q[0], q[1], a, q[3]]);
      if (c < q[2]) next.push([c, q[1], q[2], q[3]]);
      if (q[1] < b) next.push([a, q[1], c, b]);
      if (d < q[3]) next.push([a, d, c, q[3]]);
    }
    out = next;
  }
  return out;
}

/** The frame of a lot: P (u, v) → [x, z]; rc → the world rectangle; B a box with its collider; and the stair's ascent direction. */
export function frame(rect, f, bag, col) {
  const [x0, z0, x1, z1] = rect;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rc = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, v0, u1, v1, ya, yb, c = 0, noTop = false) => {
    const r = rc(u0, v0, u1, v1);
    bag.add(mat, noTop ? frustum(r, ya, yb, 0, 0, 0, 0, { noTop: true }) : box(r[0], ya, r[1], r[2], yb, r[3]));
    if (c) col.rect(r, ya - (c === true ? 0.3 : c), yb);
    return r;
  };
  const dir = f === 's' ? 'n' : f === 'n' ? 's' : f === 'e' ? 'w' : 'e';
  return { P, rc, B, dir, ramp: (u0, v0, u1, v1, ya, yb) => col.ramp(rc(u0, v0, u1, v1), ya, yb, dir), floor: (u0, v0, u1, v1, yy) => col.floor(rc(u0, v0, u1, v1), yy), rect: (u0, v0, u1, v1, ya, yb) => col.rect(rc(u0, v0, u1, v1), ya, yb) };
}

/** A steep enclosed flight: treads (thin planks) on closed risers, a ramp collider under them. */
export function flight(fr, bag, [u0, u1], [v0, v1], ya, yb, mat = 'timber') {
  const n = Math.max(8, Math.round((yb - ya) / 0.19)), dv = (v1 - v0) / n, dh = (yb - ya) / n;
  for (let k = 0; k < n; k++) {
    const top = ya + (k + 1) * dh, a = v0 + k * dv;
    fr.B(mat, u0, a - 0.03, u1, a + dv + 0.02, top - 0.035, top);               // the tread, with its nosing
    fr.B('wood_dark', u0, a - 0.03, u1, a + 0.0, top - dh, top - 0.035);         // the riser
  }
  fr.ramp(u0, v0, u1, v1, ya, yb);
}

/**
 * The upper storeys of one open house. ctx: { bag, col, lights, el, f, rect, y, st, n, L, D, jet, wall (the boards' material),
 *   seed, kind, trade, holes: [{ s, face: 'front' | 'back', u0, u1, v0, v1 }] (the windows, u in this frame, v above the storey's floor),
 *   bays: [{ a, b }] (the cumbas' spans along u) }.
 */
export function upperFloors(ctx) {
  const { bag, col, lights, el, rect, f, y, st, n, L, D, jet, wall, kind } = ctx;
  const rand = rng((el.seed || 1) * 31 + 7), fr = frame(rect, f, bag, col), { P, B } = fr;
  const FL = (s) => y + s * st + 0.06;                    // the top of the boards of storey s
  const H = n * st, top = y + H;
  const bays = ctx.bays ?? [];
  const holesOf = (face, s) => ctx.holes.filter((h) => h.face === face && h.s === s).sort((a, b) => a.u0 - b.u0);

  // ---- the shell: the four walls (the front and back with the windows left open), the floors, the ceilings
  const stripe = (face, s, u0, u1, v0, v1, mat) => {
    // a run of wall over [u0, u1] of the front or back face, storey s, from v0 to v1 above the storey's base (the floor's underside)
    if (u1 - u0 < 0.005 || v1 - v0 < 0.005) return;
    const a = face === 'front' ? -jet : D - TW, b = face === 'front' ? -jet + TW : D;
    B(mat, u0, a, u1, b, y + s * st + v0, y + s * st + v1, 0.0);
    col.rect(fr.rc(u0, a, u1, b), y + s * st + v0 - (v0 > 0.5 ? 0 : 0.3), y + s * st + v1);
  };
  for (let s = 1; s < n; s++) {
    for (const face of ['front', 'back']) {
      const hs = holesOf(face, s).map((h) => ({ ...h }));
      if (face === 'front') for (const bb of bays) hs.push({ u0: bb.a, u1: bb.b, v0: 0.06, v1: st - 0.32, bay: true });
      hs.sort((p, q) => p.u0 - q.u0);
      let u = 0;
      for (const h of hs) {
        stripe(face, s, u, h.u0, 0, st, wall);
        stripe(face, s, h.u0, h.u1, 0, h.v0, wall); stripe(face, s, h.u0, h.u1, h.v1, st, wall);
        u = h.u1;
      }
      stripe(face, s, u, L, 0, st, wall);
    }
    // the side (party) walls
    for (const [u0, u1] of [[0, TW], [L - TW, L]]) { B(wall, u0, -jet + TW, u1, D - TW, y + s * st, y + (s + 1) * st, 0.0); col.rect(fr.rc(u0, -jet + TW, u1, D - TW), y + s * st - 0.1, y + (s + 1) * st); }
  }
  // the floors: boards over joists, the stair wells open; the walker's floor in the same pieces
  const wells = (s) => (s === 1 ? [WELL1] : s === 2 ? [WELL2] : []);
  for (let s = 1; s < n; s++) {
    const fy = FL(s);
    for (const r of cutRect([TW, -jet + TW, L - TW, D - TW], wells(s))) { B('timber', r[0], r[1], r[2], r[3], fy - 0.06, fy); fr.floor(r[0], r[1], r[2], r[3], fy); }
    if (s >= 2) for (const r of cutRect([0, -jet, L, D], wells(s))) B('timber', r[0], r[1], r[2], r[3], y + s * st - 0.18, y + s * st - 0.06);   // the joists of the floor between
  }
  // the ceilings: plaster on the beams under each floor above, the top storey's under the eaves' boards
  const beams = (yy, holes) => { for (let v = -jet + 0.7; v < D - TW - 0.2; v += 0.9) for (const r of cutRect([TW, v - 0.07, L - TW, v + 0.07], holes)) B('wood_dark', r[0], r[1], r[2], r[3], yy - 0.1, yy); };
  for (let s = 2; s <= n; s++) {
    const yy = y + s * st - (s === n ? 0.25 : 0.2), hs = s === n ? [] : wells(s);
    for (const r of cutRect([TW, -jet + TW, L - TW, D - TW], hs)) B('plaster_white', r[0], r[1], r[2], r[3], yy - 0.03, yy);
    beams(yy - 0.03, hs);
  }
  // the bays: the floor out over the street on its brackets, the sides and the front with the windows open
  for (const bb of bays) for (let s = 1; s < n; s++) {
    const fy = FL(s), Dp = 0.8, a = bb.a, b = bb.b, v0 = -jet - Dp;
    B('timber', a, v0, b, -jet + TW, fy - 0.06, fy); fr.floor(a, v0, b, -jet + TW, fy);
    B('timber', a - 0.1, v0 - 0.02, b + 0.1, -jet, fy - 0.12, fy - 0.06);
    for (const [e0, e1] of [[a, a + TW * 0.6], [b - TW * 0.6, b]]) { B(wall, e0, v0, e1, -jet, y + s * st, y + (s + 1) * st - 0.2, 0.0); col.rect(fr.rc(e0, v0, e1, -jet), fy - 0.3, y + (s + 1) * st - 0.2); }
    // the front of the bay: piers, sill and head round the sash openings
    const nw = Math.max(2, Math.round((b - a - 0.3) / 0.7)), ww2 = (b - a - 0.3) / nw, wa = y + s * st + 0.95, wb = y + (s + 1) * st - 0.55, fv = v0 + 0.1;
    let u = a + TW * 0.6;
    const pier = (u0, u1) => { if (u1 - u0 > 0.005) { B(wall, u0, v0, u1, v0 + 0.1, y + s * st, y + (s + 1) * st - 0.2); col.rect(fr.rc(u0, v0, u1, v0 + 0.1), fy - 0.3, y + (s + 1) * st - 0.2); } };
    for (let k = 0; k < nw; k++) {
      const c0 = a + 0.15 + k * ww2 + 0.06, c1 = a + 0.15 + (k + 1) * ww2 - 0.06;
      pier(u, c0);
      B(wall, c0, v0, c1, v0 + 0.1, y + s * st, wa); col.rect(fr.rc(c0, v0, c1, v0 + 0.1), fy - 0.3, wa);
      B(wall, c0, v0, c1, v0 + 0.1, wb, y + (s + 1) * st - 0.2); col.rect(fr.rc(c0, v0, c1, v0 + 0.1), wb, y + (s + 1) * st - 0.2);
      u = c1;
    }
    pier(u, b - TW * 0.6);
    // the sill board inside, and the cushion on it
    B('timber', a + 0.12, v0 + 0.1, b - 0.12, v0 + 0.3, wa - 0.04, wa + 0.02);
    void fv;
  }

  // ---- the stairs: the second flight behind the first in a house of three storeys
  if (n >= 3) {
    const fy1 = FL(1), fy2 = FL(2);
    flight(fr, bag, LANE, FLIGHT2, fy1, fy2, 'timber');
    // its side towards the sofa: a partition, open at the foot and at the top
    B('plaster_white', GUARD, 6.4, GUARD + 0.1, 8.3, fy1, y + 2 * st - 0.2, 0.0); col.rect(fr.rc(GUARD, 6.4, GUARD + 0.1, 8.3), fy1 - 0.3, y + 2 * st - 0.2);
    // at the top: a rail along the well in the floor above
    rail(fr, bag, FL(2), GUARD + 0.02, 6.7, GUARD + 0.02, 8.3);
  }

  // ---- the rooms
  const rooms = layout(ctx, rand);
  for (const r of rooms) furnish(r, { ...ctx, rand, fr, FL, lights, wells, ceilY: (s) => y + (s + 1) * st - (s + 1 === n ? 0.25 : 0.2) });
  // the partitions
  for (const w of partitions(ctx, rooms)) {
    const fy = FL(w.s), hi = w.s === n - 1 ? top - 0.25 : y + (w.s + 1) * st - 0.2;
    for (const [a0, a1, b0, b1] of w.pieces) { B('plaster_white', a0, b0, a1, b1, fy, hi, 0.0); col.rect(fr.rc(a0, b0, a1, b1), fy - 0.3, hi); }
    if (w.lintel) for (const [a0, a1, b0, b1] of w.lintel) { B('plaster_white', a0, b0, a1, b1, fy + 2.05, hi); col.rect(fr.rc(a0, b0, a1, b1), fy + 2.05, hi); }
    for (const [a0, a1, b0, b1] of w.jambs ?? []) B('wood_dark', a0, b0, a1, b1, fy, fy + 2.08);
  }
  // the rail round the well of the first floor
  rail(fr, bag, FL(1), GUARD + 0.02, 2.0, GUARD + 0.02, 5.0);
}

/** A rail along a well's open edge: turned posts and a bar, no top faces (the walker steps onto anything under half a metre). */
function rail(fr, bag, fy, u0, v0, u1, v1) {
  const len = Math.hypot(u1 - u0, v1 - v0), m = Math.max(2, Math.round(len / 0.7));
  for (let k = 0; k <= m; k++) {
    const u = u0 + (u1 - u0) * k / m, v = v0 + (v1 - v0) * k / m;
    fr.B('wood_dark', u - 0.03, v - 0.03, u + 0.03, v + 0.03, fy, fy + 0.95, 0, true);
  }
  fr.B('timber', Math.min(u0, u1) - 0.04, Math.min(v0, v1) - 0.04, Math.max(u0, u1) + 0.04, Math.max(v0, v1) + 0.04, fy + 0.9, fy + 0.97, 0, true);
  fr.B('wood_dark', Math.min(u0, u1) - 0.015, Math.min(v0, v1) - 0.015, Math.max(u0, u1) + 0.015, Math.max(v0, v1) + 0.015, fy + 0.45, fy + 0.5, 0, true);
}

// ---------------------------------------------------------------------------------------------------------------
// The plan of each storey: rooms (rectangles with a role), the sofa and the partitions between them.

function layout(ctx, rand) {
  const { n, L, D, jet, kind } = ctx, rooms = [];
  const u0 = TW, u1 = L - TW, vf0 = -jet + TW, vb1 = D - TW;
  const guard = GUARD + 0.1;                           // the stair's partition, where there is one
  const hasF2 = n >= 3;
  const split = (a, b, k, avoid = []) => {
    const cuts = [];
    for (let i = 1; i < k; i++) {
      let u = a + (b - a) * i / k;
      for (const q of avoid) if (u > q.a - 0.3 && u < q.b + 0.3) u = u < (q.a + q.b) / 2 ? q.a - 0.3 : q.b + 0.3;
      cuts.push(u);
    }
    const out = []; let s = a; for (const c of [...cuts, b]) { out.push([s, c]); s = c; }
    return out;
  };
  const inn = kind === 'inn';
  for (let s = 1; s < n; s++) {
    const R = ctx.roles[s] ?? {};
    if (hasF2 && s === 2) {
      rooms.push({ s, role: R.front ?? 'family', rect: [u0, vf0, u1, 4.15], win: 'front', door: [Math.max(2.4, (u0 + u1) / 2), 4.15, 'v1'] });
      rooms.push({ s, role: R.back ?? 'storeroom', rect: [guard + 0.05, 4.25, u1, vb1], win: 'back', door: [Math.max(2.4, (u0 + u1) / 2), 4.25, 'v0'] });
      continue;
    }
    const nf = inn ? Math.max(2, Math.round((u1 - u0) / 3.3)) : 1;
    const cells = split(u0, u1, nf, bays(ctx));
    cells.forEach(([a, b], i) => rooms.push({ s, role: R.front ?? 'family', rect: [a, vf0, b, 1.9], win: 'front', door: [Math.max((a + b) / 2, a + 0.6), 1.9, 'v1'], idx: i }));
    rooms.push({ s, role: 'sofa', rect: [u0, 2.0, u1, 6.4], win: null, door: null });
    const bu0 = hasF2 && s === 1 ? guard + 0.05 : u0;
    const bk = inn ? Math.max(2, Math.round((u1 - bu0) / 3.3)) : (u1 - bu0 > 6.2 && !hasF2 ? 2 : 1);
    split(bu0, u1, bk, []).forEach(([a, b], i) => rooms.push({ s, role: i === 0 ? (R.back ?? 'bedroom') : (R.back2 ?? 'storeroom'), rect: [a, 6.5, b, vb1], win: 'back', door: [Math.max((a + b) / 2, a + 0.6), 6.5, 'v0'], idx: i }));
  }
  return rooms;
}
const bays = (ctx) => ctx.bays ?? [];

function partitions(ctx, rooms) {
  const { n, L, D, jet } = ctx, out = [];
  const u0 = TW, u1 = L - TW, hasF2 = n >= 3;
  const DW = 0.55;                                   // half a door
  for (let s = 1; s < n; s++) {
    const pieces = [], lintel = [], jambs = [];
    const run = (a, b, v0, v1, doors) => {
      // a wall along u from a to b at v0..v1 with door gaps (centre, 1.1 m wide)
      let u = a; const ds = doors.slice().sort((p, q) => p - q);
      for (const d of ds) { pieces.push([u, d - DW, v0, v1]); lintel.push([d - DW, d + DW, v0, v1]); jambs.push([d - DW - 0.05, d - DW, v0 - 0.02, v1 + 0.02], [d + DW, d + DW + 0.05, v0 - 0.02, v1 + 0.02]); u = d + DW; }
      pieces.push([u, b, v0, v1]);
    };
    const mine = rooms.filter((r) => r.s === s);
    if (hasF2 && s === 2) {
      const fr = mine.find((r) => r.win === 'front'), bk = mine.find((r) => r.win === 'back');
      run(u0, u1, 4.15, 4.25, [fr.door[0]]);
      void bk;
    } else {
      const fronts = mine.filter((r) => r.win === 'front'), backs = mine.filter((r) => r.win === 'back');
      run(u0, u1, 1.9, 2.0, fronts.map((r) => r.door[0]));
      run(hasF2 && s === 1 ? GUARD + 0.1 : u0, u1, 6.4, 6.5, backs.map((r) => r.door[0]));
      for (const set of [fronts, backs]) for (let i = 1; i < set.length; i++) { const u = set[i].rect[0]; pieces.push([u - 0.05, u + 0.05, set[i].rect[1], set[i].rect[3] + (set === fronts ? 0.1 : 0)]); }
    }
    out.push({ s, pieces, lintel, jambs });
  }
  void L; void D; void jet;
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// The furnishing

const CLOTH = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_blue'];
const BEDDING = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_indigo', 'cloth_blue', 'cloth_maroon'];

function furnish(r, c) {
  const { fr, bag, col, rand, FL, lights } = c, { B, P } = fr, fy = FL(r.s), [u0, v0, u1, v1] = r.rect, w = u1 - u0, d = v1 - v0;
  const lane = (r.door ? (r.door[2] === 'v1' ? [r.door[0] - 0.9, v1 - 0.95, r.door[0] + 0.9, v1] : [r.door[0] - 0.9, v0, r.door[0] + 0.9, v0 + 0.95]) : null);
  const ovl = (a0, b0, a1, b1, q) => q && a0 < q[2] && a1 > q[0] && b0 < q[3] && b1 > q[1];
  // a box on the floor, skipped where it would stand in the door's lane
  const K = (mat, a0, b0, a1, b1, h0, h1, solid = 0) => { if (ovl(a0, b0, a1, b1, lane) && h0 < 1.9) return; B(mat, a0, b0, a1, b1, fy + h0, fy + h1, solid ? 0.2 : 0); if (solid) { /* the collider above, kept clear of the step */ } };
  const kSolid = (mat, a0, b0, a1, b1, h0, h1) => { if (ovl(a0, b0, a1, b1, lane)) return; B(mat, a0, b0, a1, b1, fy + h0, fy + h1); fr.rect(a0, b0, a1, b1, fy + h0 - 0.3, fy + Math.max(h1, 0.62)); };
  const pot = (mat, u, v, rad, h, y0 = 0) => { if (ovl(u - rad, v - rad, u + rad, v + rad, lane)) return; const p = P(u, v); bag.add(mat, lathe([[rad * 0.6, 0], [rad, h * 0.4], [rad * 0.7, h * 0.85], [rad * 0.4, h], [0.001, h]], 10, null, p[0], fy + y0, p[1])); };
  const rug = (a0, b0, a1, b1) => { B(pick(rand, ['cloth_red', 'cloth_indigo', 'cloth_maroon']), a0, b0, a1, b1, fy, fy + 0.012); B(pick(rand, ['cloth_ochre', 'cloth_blue', 'cloth_green']), a0 + 0.12, b0 + 0.12, a1 - 0.12, b1 - 0.12, fy + 0.012, fy + 0.02); };
  const sedir = (a0, b0, a1, b1, along) => {
    // a divan: the frame, the mattress, cushions leant at the wall (the back is the side where the wall is: along = 'u' wall at the low-v side, etc.)
    kSolid('timber', a0, b0, a1, b1, 0, 0.36); K(pick(rand, CLOTH), a0 + 0.02, b0 + 0.02, a1 - 0.02, b1 - 0.02, 0.36, 0.46);
    const long = Math.max(a1 - a0, b1 - b0), m = Math.max(1, Math.floor(long / 0.75));
    for (let i = 0; i < m; i++) {
      const t = (i + 0.5) / m;
      if (along === 'u') { const u = a0 + (a1 - a0) * t; const wallV = along === 'u' && c.towardBack ? b1 : b0; void wallV; K(pick(rand, BEDDING), u - 0.27, b0 + 0.03, u + 0.27, b0 + 0.17, 0.46, 0.84); }
      else { const v = b0 + (b1 - b0) * t; K(pick(rand, BEDDING), a0 + 0.03, v - 0.27, a0 + 0.17, v + 0.27, 0.46, 0.84); }
    }
  };
  const tray = (u, v) => { if (ovl(u - 0.5, v - 0.5, u + 0.5, v + 0.5, lane)) return; const p = P(u, v); bag.add('wood_dark', lathe([[0.25, 0], [0.18, 0.15], [0.22, 0.38], [0.001, 0.38]], 8, null, p[0], fy + 0.02, p[1])); bag.add('gilt_bronze', lathe([[0.001, 0], [0.42, 0.01], [0.45, 0.05], [0.43, 0.06], [0.001, 0.03]], 20, null, p[0], fy + 0.4, p[1])); col.circle(p[0], p[1], 0.45, fy, fy + 0.5); };
  const brazier = (u, v) => { const p = P(u, v); bag.add('bronze', lathe([[0.001, 0], [0.26, 0.0], [0.3, 0.12], [0.28, 0.18], [0.001, 0.14]], 12, null, p[0], fy + 0.18, p[1])); bag.add('iron', lathe([[0.1, 0], [0.04, 0.1], [0.12, 0.18], [0.001, 0.18]], 8, null, p[0], fy, p[1])); bag.add('flame', box(p[0] - 0.14, fy + 0.3, p[1] - 0.14, p[0] + 0.14, fy + 0.34, p[1] + 0.14)); col.circle(p[0], p[1], 0.3, fy, fy + 0.4); };
  const chest = (u, v, a, b, h) => { kSolid('wood_painted', u - a / 2, v - b / 2, u + a / 2, v + b / 2, 0, h); K('iron', u - a / 2 + 0.02, v - b / 2 - 0.01, u + a / 2 - 0.02, v - b / 2 + 0.01, h * 0.45, h * 0.6); };
  const lamp = (u, v) => { const p = P(u, v), ct = c.ceilY(r.s); bag.add('iron', box(p[0] - 0.006, ct - 0.5, p[1] - 0.006, p[0] + 0.006, ct, p[1] + 0.006)); bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.15, 0.2], [0.08, 0.3], [0.001, 0.32]], 10, null, p[0], ct - 0.82, p[1])); };
  const cupboard = (a0, b0, a1, b1, face) => {
    // the yüklük: a wall of built-in cupboards, painted doors with a knob, one open on the stacked bedding; face: which side the doors look (+v / -v / +u / -u)
    const hgt = 2.05; kSolid('wood_painted', a0, b0, a1, b1, 0, hgt);
    const n2 = Math.max(2, Math.round(Math.max(a1 - a0, b1 - b0) / 0.55));
    for (let i = 0; i < n2; i++) {
      const t0 = i / n2, t1 = (i + 1) / n2;
      if (face === 'v-') { const x0 = a0 + (a1 - a0) * t0 + 0.03, x1 = a0 + (a1 - a0) * t1 - 0.03; K('wood_dark', x0, b0 - 0.02, x1, b0, 0.08, hgt - 0.08); K('bronze', x1 - 0.1, b0 - 0.04, x1 - 0.06, b0 - 0.02, 1.0, 1.06); }
      else if (face === 'v+') { const x0 = a0 + (a1 - a0) * t0 + 0.03, x1 = a0 + (a1 - a0) * t1 - 0.03; K('wood_dark', x0, b1, x1, b1 + 0.02, 0.08, hgt - 0.08); K('bronze', x0 + 0.06, b1 + 0.02, x0 + 0.1, b1 + 0.04, 1.0, 1.06); }
    }
    // an open bay: the folded bedding stacked in it
    if (face === 'v-') { const x0 = a0 + (a1 - a0) * 0.5 - 0.2, x1 = x0 + 0.4; K('opening', x0, b0 - 0.04, x1, b0 - 0.0, 0.2, 1.8); for (let q = 0; q < 6; q++) K(pick(rand, BEDDING), x0 + 0.02, b0 - 0.35, x1 - 0.02, b0 - 0.03, 0.25 + q * 0.26, 0.45 + q * 0.26); }
    else if (face === 'v+') { const x0 = a0 + (a1 - a0) * 0.5 - 0.2, x1 = x0 + 0.4; K('opening', x0, b1, x1, b1 + 0.04, 0.2, 1.8); for (let q = 0; q < 6; q++) K(pick(rand, BEDDING), x0 + 0.02, b1 + 0.03, x1 - 0.02, b1 + 0.35, 0.25 + q * 0.26, 0.45 + q * 0.26); }
  };
  const mattress = (u, v, a, b) => { K(pick(rand, ['cloth_indigo', 'cloth_red', 'cloth_blue']), u - a / 2, v - b / 2, u + a / 2, v + b / 2, 0, 0.12); K(pick(rand, BEDDING), u - a / 2 + 0.05, v - b / 2 + 0.4, u + a / 2 - 0.05, v + b / 2 - 0.03, 0.12, 0.2); K('cloth_white', u - a / 2 + 0.05, v - b / 2 + 0.03, u + a / 2 - 0.05, v - b / 2 + 0.33, 0.12, 0.28); };
  const hearth = (u, v, back) => {
    // the hearth with its plaster hood on the wall at v (back: the wall is at the high-v side)
    const s = back ? -1 : 1, v0w = back ? v - 0.7 : v, v1w = back ? v : v + 0.7;
    kSolid('brick', u - 0.7, v0w, u + 0.7, v1w, 0, 0.45); K('flame', u - 0.3, v0w + 0.1, u + 0.3, v1w - 0.1, 0.45, 0.5);
    B('plaster_white', u - 0.7, v0w, u + 0.7, v1w, fy + 1.55, fy + 1.62); B('plaster_white', u - 0.4, back ? v - 0.4 : v, u + 0.4, back ? v : v + 0.4, fy + 1.62, c.ceilY(r.s)); void s;
    const p = P(u, back ? v - 0.45 : v + 0.45); bag.add('bronze', lathe([[0.001, 0], [0.24, 0.02], [0.26, 0.24], [0.2, 0.3], [0.001, 0.3]], 12, null, p[0], fy + 0.5, p[1]));
  };
  const stock = (trade, a0, b0, a1, b1) => {
    // the stock of the trade in a storeroom, along its back wall (the high-v side): by trade
    const wv = b1 - 0.5;
    const shelf = (ys) => { for (const q of ys) { K('wood_dark', a0 + 0.05, b1 - 0.34, a1 - 0.05, b1 - 0.04, q, q + 0.04); } };
    const sacks = (n2, mat) => { for (let i = 0; i < n2; i++) { const u = a0 + 0.4 + i * 0.5; if (u > a1 - 0.3) break; pot(mat, u, b1 - 0.9 - (i % 2) * 0.1, 0.24, 0.55); } };
    const bolts = (n2) => { for (let i = 0; i < n2; i++) { const u = a0 + 0.3 + i * 0.32; if (u > a1 - 0.3) break; K(pick(rand, CLOTH), u - 0.13, b1 - 0.4, u + 0.13, b1 - 0.06, 0.6 + (i % 3) * 0.02, 1.25); } };
    switch (trade) {
      case 'coppersmith': kSolid('timber', a0 + 0.1, b1 - 0.55, a1 - 0.1, b1 - 0.05, 0, 0.5); for (let i = 0; i < 5; i++) pot('bronze', a0 + 0.5 + i * 0.5, b1 - 0.3, 0.2, 0.22, 0.5); for (let i = 0; i < 4; i++) K('bronze', a0 + 0.3 + i * 0.6, b1 - 0.1, a0 + 0.8 + i * 0.6, b1 - 0.06, 0.9 + (i % 2) * 0.5, 1.3 + (i % 2) * 0.5); break;
      case 'weaver': bolts(9); shelf([1.4, 1.9]); for (let i = 0; i < 6; i++) pot(pick(rand, ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo']), a0 + 0.4 + i * 0.4, b1 - 0.2, 0.13, 0.3, 1.4); break;
      case 'saddler': for (let i = 0; i < 4; i++) { const u = a0 + 0.5 + i * 0.7; if (u > a1 - 0.4) break; K('hide_tan', u - 0.25, b1 - 0.45, u + 0.25, b1 - 0.1, 0.0, 0.1); K('hide_brown', u - 0.22, b1 - 0.4, u + 0.22, b1 - 0.12, 0.1, 0.5 + (i % 2) * 0.1); K('iron', u - 0.04, b1 - 0.08, u + 0.04, b1 - 0.06, 1.3, 1.9); K('hide_brown', u - 0.12, b1 - 0.1, u + 0.12, b1 - 0.06, 1.0, 1.9); } break;
      case 'cobbler': shelf([0.5, 1.0, 1.5, 2.0]); for (let i = 0; i < 12; i++) { const u = a0 + 0.3 + (i % 6) * 0.35; if (u > a1 - 0.2) continue; pot(pick(rand, ['cloth_red', 'glaze_yellow', 'hide_black', 'cloth_blue']), u, b1 - 0.2, 0.07, 0.12, [0.54, 1.04][Math.floor(i / 6)]); } break;
      case 'tailor': kSolid('timber', a0 + 0.2, b0 + 0.6, a1 - 0.2, b0 + 1.4, 0, 0.8); K('cloth_white', a0 + 0.3, b0 + 0.7, a1 - 0.3, b0 + 1.3, 0.8, 0.84); bolts(6); break;
      case 'potter': shelf([0.5, 1.1, 1.7]); for (let i = 0; i < 10; i++) pot(pick(rand, ['terracotta', 'glaze_blue', 'glaze_green', 'pottery_dark', 'glaze_white']), a0 + 0.35 + (i % 5) * 0.4, b1 - 0.2, 0.15, 0.3, [0.54, 1.14][Math.floor(i / 5)]); break;
      case 'baker': sacks(6, 'sacking'); kSolid('wood_dark', a1 - 1.4, b0 + 0.5, a1 - 0.2, b0 + 1.1, 0, 0.8); K('cloth_white', a1 - 1.3, b0 + 0.55, a1 - 0.3, b0 + 1.05, 0.8, 0.86); break;
      case 'butcher': for (let i = 0; i < 4; i++) kSolid('timber', a0 + 0.4 + i * 0.7, b1 - 0.7, a0 + 1.0 + i * 0.7, b1 - 0.1, 0, 0.8 + (i % 2) * 0.1); break;
      case 'sherbet': for (let i = 0; i < 7; i++) pot(pick(rand, ['terracotta', 'glaze_white', 'glaze_blue']), a0 + 0.4 + (i % 4) * 0.5, b1 - 0.4 - Math.floor(i / 4) * 0.5, 0.2, 0.5); shelf([1.1, 1.7]); break;
      case 'attar': for (let i = 0; i < 7; i++) { const u = a0 + 0.3 + i * 0.35; if (u > a1 - 0.2) break; K('cloth_green', u - 0.05, b1 - 0.1, u + 0.05, b1 - 0.06, 1.2, 1.9); K('cloth_ochre', u - 0.08, b1 - 0.12, u + 0.08, b1 - 0.07, 1.8, 1.92); } sacks(4, 'cloth_ochre'); break;
      default: sacks(7, rand() < 0.5 ? 'sacking' : 'cloth_ochre'); for (let i = 0; i < 3; i++) pot('terracotta', a1 - 0.5 - i * 0.55, b0 + 0.6, 0.25, 0.75); shelf([1.2, 1.8]);
    }
  };

  const role = r.role;
  if (role === 'sofa') {
    // the sofa: the hall, a runner on the boards, a long divan on the right wall, a chest, water jars on a shelf by the stair, a hanging lamp
    const R0 = GUARD + 0.5, rr = u1 - 0.6;
    if (w > 3.2) { sedir(rr, 2.6, u1, 5.4, 'v'); }
    rug(R0 + 0.2, 2.3, Math.min(R0 + 1.5, rr - 0.3), 5.0);
    chest(u1 - 0.35, 5.95, 0.7, 0.8, 0.55);
    for (let i = 0; i < 3; i++) pot(pick(rand, ['terracotta', 'glaze_blue', 'pottery_dark']), u1 - 0.3 - i * 0.4, 2.35, 0.14, 0.34, 0);
    lamp((R0 + u1) / 2, 4.2);
    return;
  }
  const front = r.win === 'front';
  const rw = w;
  const wallBack = front ? v0 : v1;
  void wallBack; void rw;
  switch (role) {
    case 'reception': case 'family': {
      // divan along the window wall (kept clear of the cumba) and down the sides, a rug, the brass tray, a brazier
      const baysIn = (c.bays ?? []).filter((q) => q.a >= u0 && q.b <= u1 && front);
      let a = u0 + 0.0;
      const spans = []; for (const q of baysIn.sort((p, qq) => p.a - qq.a)) { spans.push([a, q.a]); a = q.b; } spans.push([a, u1]);
      if (front) for (const [s0, s1] of spans) if (s1 - s0 > 0.8) sedir(s0 + 0.02, v0, s1 - 0.02, v0 + 0.55, 'u');
      else for (const [s0, s1] of [[u0, u1]]) sedir(s0 + 0.02, v1 - 0.55, s1 - 0.02, v1, 'u');
      if (front && d > 2) { sedir(u0, v0 + 0.57, u0 + 0.55, v1 - 0.3, 'v'); if (w > 3.4) sedir(u1 - 0.55, v0 + 0.57, u1, v1 - 0.3, 'v'); }
      rug(u0 + 0.9, v0 + 0.75, u1 - 0.9, v1 - 0.6 > v0 + 1.2 ? v1 - 0.6 : v0 + 1.2);
      tray((u0 + u1) / 2, (v0 + v1) / 2 + 0.2);
      if (w > 4.2) chest(u0 + 0.9, v1 - 0.3, 0.9, 0.5, 0.6);
      if (rand() < 0.5) brazier(u1 - 1.3, v1 - 0.9);
      lamp((u0 + u1) / 2, (v0 + v1) / 2);
      break;
    }
    case 'bedroom': {
      // the yüklük along the partition wall, mattresses made up on the floor at the window, a chest, a cradle now and then
      cupboard(u0 + 0.3, v0, Math.min(u0 + 2.5, u1 - 1.4), v0 + 0.6, 'v+');
      const sx = (u0 + u1) / 2;
      mattress(sx - 0.7, v1 - 1.0, 0.9, 1.7); if (w > 3.2) mattress(sx + 0.6, v1 - 1.0, 0.9, 1.7);
      rug(u0 + 0.5, v0 + 0.9, u1 - 0.5, v1 - 1.9);
      chest(u1 - 0.5, v0 + 0.4, 0.8, 0.5, 0.55);
      if (rand() < 0.4) { kSolid('wood_dark', u1 - 1.1, v1 - 1.25, u1 - 0.4, v1 - 0.75, 0.18, 0.5); K('cloth_white', u1 - 1.05, v1 - 1.2, u1 - 0.45, v1 - 0.8, 0.5, 0.54); }
      lamp((u0 + u1) / 2, (v0 + v1) / 2);
      break;
    }
    case 'storeroom': {
      stock(ctx_trade(c), u0, v0, u1, v1);
      kSolid('timber', u0 + 0.1, v0 + 0.1, u0 + 1.0, v0 + 0.7, 0, 0.75);
      break;
    }
    case 'workroom': {
      stock(ctx_trade(c), u0, v0, u1, v1);
      sedir(u0 + 0.02, v1 - 0.55, Math.min(u1 - 0.02, u0 + 2.2), v1, 'u');
      lamp((u0 + u1) / 2, (v0 + v1) / 2);
      break;
    }
    case 'hearthroom': {
      // a room of a tenement: the hearth with its hood in the corner, a divan, bedding stacked on a chest, jars, a low table
      hearth(u1 - 1.0, v0 + 0.02, false);
      sedir(u0 + 0.02, front ? v0 : v1 - 0.55, Math.min(u0 + 2.4, u1 - 1.8), front ? v0 + 0.55 : v1, 'u');
      mattress((u0 + u1) / 2 - 0.2, v1 - 1.0, 0.9, 1.6);
      chest(u0 + 0.5, v1 - 0.4, 0.8, 0.6, 0.6); for (let q = 0; q < 3; q++) K(pick(rand, BEDDING), u0 + 0.2, v1 - 0.65, u0 + 0.8, v1 - 0.15, 0.6 + q * 0.17, 0.76 + q * 0.17);
      for (let i = 0; i < 2; i++) pot('terracotta', u1 - 0.4, v1 - 0.4 - i * 0.5, 0.22, 0.6);
      rug(u0 + 0.8, v0 + 0.9, u1 - 1.0, v1 - 1.9);
      lamp((u0 + u1) / 2, (v0 + v1) / 2);
      break;
    }
    case 'cell': {
      // a guest's cell of an inn: a divan along the window, bedding rolled on it, a brazier and a copper pot, the traveller's bundle
      sedir(u0 + 0.02, front ? v0 : v1 - 0.6, u1 - 0.02, front ? v0 + 0.6 : v1, 'u');
      rug(u0 + 0.5, front ? v0 + 0.8 : v0 + 0.3, u1 - 0.5, front ? v1 - 0.3 : v1 - 0.8);
      brazier(u0 + 0.7, front ? v1 - 0.5 : v0 + 0.5);
      chest(u1 - 0.5, front ? v1 - 0.4 : v0 + 0.4, 0.7, 0.5, 0.5);
      K('sacking', u1 - 1.2, front ? v1 - 0.7 : v0 + 0.3, u1 - 0.8, front ? v1 - 0.3 : v0 + 0.7, 0, 0.3);
      lamp((u0 + u1) / 2, (v0 + v1) / 2);
      break;
    }
    default: break;
  }
  void lights;
}
const ctx_trade = (c) => c.trade;

/**
 * The walk-check routes of one house in this frame (u, v): from the lane, in at the door, up the stair, round the rooms of
 * each floor. shop: the counter with its flap runs across the front, so the way to the stair goes through the flap.
 */
export function routes(L, n, kind, shop) {
  const u1 = L - TW, mid = L / 2, out = [];
  const door = (a, b) => Math.max((a + b) / 2, a + 0.6);
  const bu0 = n >= 3 ? GUARD + 0.15 : TW, inn = kind === 'inn';
  const bk = inn ? Math.max(2, Math.round((u1 - bu0) / 3.3)) : (u1 - bu0 > 6.2 && n < 3 ? 2 : 1);
  const bdoor = door(bu0, bu0 + (u1 - bu0) / bk);
  const foot = shop ? [[mid, -1.4], [mid, 0.8], [mid, 1.7], [0.9, 1.75]] : [[mid, -1.4], [mid, 0.8], [0.9, 1.0], [0.9, 1.6]];
  const up1 = [[0.9, 3.5], [0.9, 5.0], [2.3, 5.7]];
  // the street room (through the sofa), then the cumba's room's far end, back to the sofa and into the room behind
  out.push([...foot, ...up1, [mid, 3.6], [mid, 2.4], [mid, 1.2], [mid, 0.3], [mid, 2.4], [mid, 5.0], [bdoor, 6.1], [bdoor, 7.4]]);
  if (n >= 3) {
    const fd = Math.max(2.4, mid);
    out.push([...foot, ...up1, [0.9, 5.7], [0.9, 6.3], [0.9, 8.8], [2.3, 8.7], [Math.max(2.3, fd), 7.0], [fd, 5.0], [fd, 3.5], [fd, 1.5]]);
  }
  return out;
}
