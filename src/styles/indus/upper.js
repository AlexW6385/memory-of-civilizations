// The upper floor of a Lower Town house (docs/settlements/mohenjo-daro.md §14): the brick stair of the court climbs to the flat roof of the back
// range; on that roof one or two rooms of mud brick stand over the ground rooms (the "second storey" of "some had two stories"), their front on the
// court behind a loggia on brick piers, small lattice slits on the street, and the terrace of the rest of the roof with a low parapet. Frame: u along
// the lane, v from the lane into the lot (kit.js Fr); every piece is built from the house's own materials, its variation from a hash of its own position.
import { fromTriangles } from '../../core/geom.js';
import { furnishRoom } from './dress.js';
import { rng } from './kit.js';

export const UPPER_H = 2.7, LOGGIA = 1.5, EXT = 1.1;
const hash = (a, b) => (Math.imul(Math.round(a * 64) | 0, 73856093) ^ Math.imul(Math.round(b * 64) | 0, 19349663)) >>> 0;

/** A vertical panel from a to b (x, z), its foot at ya → yb and h high, both faces and no top (the walker steps onto a top). */
function panel(bag, mat, a, b, ya, yb, h) {
  // (each panel a little different, from a hash of its own position: a hundred equal panels would be one more instanced draw)
  const k = hash(a[0] + b[1] * 3, a[1] + b[0] * 5); h += ((k % 13) - 6) * 0.0035; yb += ((k >> 4) % 9 - 4) * 0.003;
  const A = [a[0], ya, a[1]], B = [b[0], yb, b[1]], C = [b[0], yb + h, b[1]], D = [a[0], ya + h, a[1]];
  bag.add(mat, fromTriangles([...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C]));
}

/**
 * Which rooms of the back range carry an upper floor, and where the loggia ends: null when the stair is too near the first room (the house keeps its roof).
 * rooms: the back range's rects [u0, v0, u1, v1]; sx the stair's centre line; ls: a left wing exists (its roof reaches the loggia's start).
 */
export function upperPlan(rooms, sx, ls, lw, T) {
  const s = rooms.findIndex((r) => sx >= r[0] + 0.2 && sx <= r[2] - 0.2);
  if (s < 1) return null;
  const up = rooms.slice(Math.max(0, s - 2), s), ub = up[up.length - 1][2], ua = up[0][0], ext = Math.min(EXT, sx - 0.45 - 0.4 - ub);
  if (ext < 0.8) return null;
  return { s, up, ua, ub, ext, uL: ls && ua < T + lw ? T + lw + 0.05 : ua };
}

/**
 * Builds the upper rooms, the loggia and the terrace parapet. F2: the frame raised to the roof's level (y = the floor). o: { pl (upperPlan), D, W, T, sx, sv1,
 * uses (the rooms' uses in order), rect (the lot's, for the hash), lit }. Returns the walk from the stair's head to the first room's door ([u, v] in the house frame).
 */
export function upperFloor(F2, o) {
  const { pl, D, sx, sv1, uses } = o, { up, ua, ub, ext, uL } = pl, bag = F2.bag, col = F2.col, h = UPPER_H;
  const va = up[0][1], vb = D, wt = 0.4, n = up.length;
  const R = rng(hash(o.rect[0], o.rect[1]) ^ 0x1d05);
  const wp = (m, a0, y0, b0, a1, y1, b1, solid = true) => F2.b(m, a0, y0, b0, a1, y1, b1, solid);
  const bounds = up.map((r) => r[2]);                                                   // the partitions stand on the ground rooms' walls
  // a wall along u (at v in [p0, p1]) or along v (at u in [p0, p1]) with openings { c, w, y0, y1, bars }
  const wall = (alongU, p0, p1, s0, s1, ops) => {
    const seg = (a, b, y0, y1, m = 'mudbrick', solid = true) => { if (b - a < 0.02 || y1 - y0 < 0.02) return; alongU ? wp(m, a, y0, p0, b, y1, p1, solid) : wp(m, p0, y0, a, p1, y1, b, solid); };
    const trim = (a, b, y0, y1, m = 'timber', e = 0.035) => { if (alongU) wp(m, a, y0, p0 - e, b, y1, p1 + e, false); else wp(m, p0 - e, y0, a, p1 + e, y1, b, false); };
    let s = s0;
    for (const op of [...ops].sort((a, b) => a.c - b.c)) {
      const lo = op.c - op.w / 2, hi = op.c + op.w / 2;
      seg(s, lo, 0, h); seg(lo, hi, 0, op.y0); seg(lo, hi, op.y1, h);
      trim(lo - 0.05, hi + 0.05, op.y1 - 0.1, op.y1);                                    // the lintel
      trim(lo - 0.06, lo, op.y0, op.y1); trim(hi, hi + 0.06, op.y0, op.y1);              // the jambs
      if (op.y0 > 0.3) trim(lo - 0.04, hi + 0.04, op.y0 - 0.06, op.y0, 'timber', 0.07);  // the sill plank
      if (op.bars) { const k = Math.max(2, Math.round(op.w / 0.17)); for (let i = 1; i < k; i++) { const c = lo + (hi - lo) * i / k; trim(c - 0.015, c + 0.015, op.y0, op.y1, 'timber', -0.1); } }
      s = hi;
    }
    seg(s, s1, 0, h);
  };
  const roomL = (i) => (i === 0 ? ua : bounds[i - 1]), roomR = (i) => bounds[i];
  const doors = [], uc = [];
  up.forEach((r, i) => {
    const l = roomL(i), rr = roomR(i), c = (r[0] + r[2]) / 2, w = rr - l;
    uc.push(c);
    // the court wall: the doorway on the loggia, two windows of the court (open reveals with timber bars), as the houses' doors and windows open onto the court
    const fr = [{ c, w: 1.1, y0: 0, y1: 2.05 }];
    for (const d of [-1, 1]) if (w > 4.4) fr.push({ c: c + d * Math.min(1.75, w * 0.33), w: 0.8, y0: 0.85, y1: 1.85, bars: d > 0 ? R() < 0.5 : R() < 0.7 });
    wall(true, va, va + wt, l + (i === 0 ? 0 : 0.15), rr - (i === n - 1 ? 0 : 0.15), fr);
    doors.push([c, va]);
  });
  // the street wall: lattice slits (0.5 × 0.6 m) high in it, where the room has no store shelf against it; its inner face is 0.45 m thick, carried over the lot's parapet
  {
    const ops = [];
    up.forEach((r, i) => { if (uses[i] !== 'store') ops.push({ c: roomL(i) + (roomR(i) - roomL(i)) * (0.5 + R() * 0.08), w: 0.5, y0: 1.15, y1: 1.75, bars: true }); });
    wall(true, vb - 0.45, vb, ua, ub, ops);
  }
  // the end walls and the partitions, each partition with a doorway
  wall(false, ua, ua + wt, va + wt, vb - 0.45, uses[0] === 'store' ? [] : [{ c: (va + vb) / 2 + 0.7, w: 0.45, y0: 1.2, y1: 1.7, bars: true }]);
  wall(false, ub - wt, ub, va + wt, vb - 0.45, []);
  for (let i = 0; i < n - 1; i++) wall(false, bounds[i] - 0.15, bounds[i] + 0.15, va + wt, vb - 0.45, [{ c: va + wt + 1.2 + 0.5, w: 1.0, y0: 0, y1: 2.0 }]);
  // the roof of the upper rooms: beams, a mud slab, a low parapet; the rafters show from below
  for (let i = 0; i < n; i++) {
    const l = roomL(i) + 0.4, rr = roomR(i) - 0.15;
    for (let u = l + 0.45; u < rr - 0.2; u += 0.85) wp('timber', u - 0.07, h - 0.52, va + wt, u + 0.07, h - 0.32, vb - 0.45, false);
  }
  wp('mud_plaster', ua - 0.05, h - 0.32, va - 0.05, ub + 0.05, h, vb, false);
  F2.floor(ua - 0.05, va - 0.05, ub + 0.05, vb, h);
  wp('mudbrick', ua - 0.05, h, va - 0.05, ub + 0.05, h + 0.35, va + 0.2, false); wp('mudbrick', ua - 0.05, h, vb - 0.2, ub + 0.05, h + 0.35, vb, false);
  wp('mudbrick', ua - 0.05, h, va + 0.2, ua + 0.2, h + 0.35, vb - 0.2, false); wp('mudbrick', ub - 0.2, h, va + 0.2, ub + 0.05, h + 0.35, vb - 0.2, false);
  // the furnishing by use, the first room lit
  up.forEach((r, i) => {
    const inner = [roomL(i) + (i === 0 ? wt : 0.15), va + wt, roomR(i) - (i === n - 1 ? wt : 0.15), vb - 0.45];
    furnishRoom(F2, inner, 'v0', uses[i], rng(hash(inner[0], inner[1]) ^ 0x77), F2.ctx.lights, !!o.lit && i === 0, true);
  });

  // the loggia over the court: a floor of mud on timber joists carried by brick piers, a guard of timber without tops, a mat awning on posts
  {
    const vf = va - LOGGIA, ue = ub + ext, ul = uL;
    wp('mud_plaster', ul, -0.3, vf, ue, 0, va, false);
    for (let u = ul + 0.5; u < ue - 0.2; u += 1.1) wp('timber', u - 0.06, -0.52, vf, u + 0.06, -0.3, va, false);
    wp('timber', ul, -0.55, vf, ue, -0.3, vf + 0.14, false);
    F2.floor(ul, vf, ue, va, 0);
    const piers = [ul + 0.3, ...bounds.slice(0, -1).filter((b) => b > ul + 1), ub, ue - 0.3].filter((u, i, a) => i === 0 || u - a[i - 1] > 0.8);
    for (const u of piers) {
      wp('brick', u - 0.22, -F2.y, vf + 0.06, u + 0.22, -0.55, vf + 0.5);          // from the court's floor to the beam
      wp('timber', u - 0.045, 0, vf + 0.1, u + 0.045, 2.5, vf + 0.19, false);       // the awning's posts
    }
    wp('reed_mat', ul - 0.15, 2.5, vf - 0.1, ue + 0.15, 2.56, va, false);
    wp('timber', ul - 0.15, 2.44, vf - 0.1, ue + 0.15, 2.5, vf + 0.0, false);
    // the guard: along the front and at the end on the court; the start is open where the left wing's roof carries on
    const g = (a, b, ya = 0) => {
      const p = F2.pt(a[0], a[1]), q = F2.pt(b[0], b[1]);
      panel(bag, 'timber', p, q, F2.y + ya + 0.86, F2.y + ya + 0.86, 0.08); panel(bag, 'timber', p, q, F2.y + ya + 0.4, F2.y + ya + 0.4, 0.05);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(len / 0.9));
      for (let i = 0; i <= k; i++) { const u = a[0] + (b[0] - a[0]) * i / k, v = a[1] + (b[1] - a[1]) * i / k; wp('timber', u - 0.04, 0, v - 0.04, u + 0.04, 0.94, v + 0.04, false); }
      col.segment(p, q, 0.08, F2.y + ya, F2.y + ya + 0.95);
    };
    g([ul, vf + 0.04], [ue - 0.04, vf + 0.04]); g([ue - 0.04, vf + 0.04], [ue - 0.04, va - 0.5]);
    if (ul === ua) g([ul + 0.04, vf + 0.04], [ul + 0.04, va - 0.3]);
  }
  // the terrace: the stair room's roof and the rest of the range behind a low parapet on the court, open at the stair's head and at the loggia's end
  {
    const rs = o.rooms[pl.s], pa = (a, b) => { if (b - a > 0.3) { wp('mudbrick', a, 0, va, b, 0.75, va + 0.3); wp('mud_plaster', a - 0.04, 0.75, va - 0.04, b + 0.04, 0.83, va + 0.34, false); } };
    pa(ub + ext + 0.2, sx - 0.75); pa(sx + 0.75, rs[2]);
  }
  // the walk, in the house frame: from the stair's head over the roof to the loggia and in at the first room's door
  const door = doors[0];
  return { door, walk: [[sx, sv1 + 1.3], [ub + ext * 0.5, sv1 + 1.3], [ub + ext * 0.5, va - 0.75], [door[0], va - 0.75], [door[0], va + 0.25], [door[0], va + 2.0]], ext };
}

/** The guard along both sides of the court's flight: timber posts, a rail and a lower rail as panels without tops, in sections a metre long, the flight rising from y 0.05 to H over 3.8 m. */
export function stairRails(F, sx, sv1, H) {
  const v0 = sv1 - 3.8, line = (v) => 0.05 + (v - v0) / 3.8 * (H - 0.05);
  for (const s of [-1, 1]) {
    const u = sx + s * 0.52;
    for (let a = v0; a < sv1 - 0.01; a += 1.0) {
      const b = Math.min(a + 1.0, sv1), p = F.pt(u, a), q = F.pt(u, b);
      panel(F.bag, 'timber', p, q, F.y + line(a) + 0.82, F.y + line(b) + 0.82, 0.08);
      panel(F.bag, 'timber', p, q, F.y + line(a) + 0.34, F.y + line(b) + 0.34, 0.05);
      F.b('timber', u - 0.04, line(a) - 0.1, a - 0.04, u + 0.04, line(a) + 0.9, a + 0.04, false);
      F.col.segment(p, q, 0.08, F.y + line(a) - 0.05, F.y + line(b) + 0.95);
    }
  }
}
