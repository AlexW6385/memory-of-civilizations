// Southern Song Lin'an — houses opened upstairs (docs/settlements/song-hangzhou.md §30).
//
// Nine of the furnished lots nearest the arrival and along the river road and the lane behind it are built here, not as `hz_shell`
// (one floor) but as houses of two storeys whose upper floor can be climbed to:
//
//   storeySpec(lot)   the lot's plan: the front room, the partition with its doorway, the rear room, the side the stair stands on,
//                     the front's kind, the use of every room; pure, shared by the shell and the furniture
//   hz_storey         (style song)  the shell: plinth and floor, party walls, front, the stair, the slab with its opening and rail,
//                     the upper rooms' walls with their window reveals, the loggia over the street, the roof, the back yard
//   hz_upstairs_in      (style life)  the furniture and the people of the four rooms, by use
//
// Local frame (as dwellings.js): a across the lot from the middle, w from the street edge (0) back to the lot's depth D; the shell is
// built centred on the lot and turned to its front. The stair is a closed-riser flight (lou ti) of sixteen treads 0.24 m deep and 0.203 m
// high along one party wall, rising toward the rear to a landing at the back wall; its foot stands in the front room.
import { STYLES } from '../../core/build.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { rectRoof } from '../../styles/ming/index.js';
import { Parts, ball, limb } from '../../styles/qing/carving.js';
import { table, chair, bench, stool, teabowl, brazier, scroll, lantern, couch, chest, qinTable, altar, counter, shelf } from './interiors.js';
import '../../styles/song/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TH = 0.25, H1 = 3.2, SL = 0.25, F2 = H1 + SL, H2 = 2.9, UT = F2 + H2, NT = 16, RISE = F2 / (NT + 1), TREAD = 0.26;
const GROUND_FIGS = 0;
const RD = 4.5, PT = 0.16;
const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const SHUT = ['timber', 'wood_dark', 'timber'];
const ly = (prof, seg = 10, x = 0, y = 0, z = 0) => lathe(prof, seg, null, x, y, z);

/** Which lots are opened upstairs, by their seed, and what each is: the shop with its dwelling over it, the pawnshop, the inn, the tenement, the silk-weaver's, the merchant's, the craftsman's. */
const KINDS = { 865480: 'tenement', 919255: 'weaver', 849624: 'shop', 755370: 'pawn', 922068: 'shop', 879780: 'merchant', 146416: 'craftsman', 418595: 'inn', 945485: 'shop' };
export const storeyKind = (l) => KINDS[l.seed];

/** The plan of a lot opened upstairs: pure and deterministic. */
export function storeySpec(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front || 's', along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, kind = KINDS[l.seed] || 'shop', r = rng((l.seed || 1) * 11 + 5);
  const hw = L / 2 - TH, s = r() < 0.5 ? -1 : 1;
  const Fd = Math.max(4.4, Math.min(6.4, D - TH - PT - RD - TH - 2.0)), wP = TH + Fd, wR = wP + PT + RD, wB = wR + TH;
  const ft = { shop: r() < 0.5 ? 'boards' : 'open', pawn: 'boards', inn: 'open', tenement: 'door', weaver: 'lattice', merchant: L >= 6.5 ? 'lattice' : 'door', craftsman: 'open' }[kind];
  const gw = { door: 1.4, boards: 2.1, open: 2.5, lattice: 1.7 }[ft];
  const da = -s * (0.5 + r() * Math.max(0, Math.min(1.1, hw - gw / 2 - 1.6)));
  const dp = -s * (hw - 2.0);                               // the partition's doorway, on the side away from the stair
  const bs = r() < 0.5 ? -1 : 1, Bw = Math.min(3.0, 2 * hw - 1.0), ab = Math.max(-hw + 0.3 + Bw / 2, Math.min(hw - 0.3 - Bw / 2, bs * 0.8));   // the loggia over the street
  const wash = (() => { const q = r(); return q < 0.62 ? 'plaster_white' : q < 0.87 ? 'plaster_streak' : 'plaster_damp'; })();
  const roofMat = r() < 0.2 ? 'tile_grey' : 'tile_dark';
  return { f, L, D, kind, hw, s, Fd, wP, wR, wB, ft, gw, da, dp, ab, Bw, wash, roofMat, trade: l.trade };
}
/** The stair's treads: k = 1..NT, each { w0, w1, top } above the floor, in the lot's w; and the openings of the slab. */
export function stairOf(S) {
  const wf0 = S.wP - 0.5, treads = [];
  for (let k = 1; k <= NT; k++) treads.push({ w0: wf0 + TREAD * (k - 1), w1: wf0 + TREAD * k, top: RISE * k });
  return { wf0, treads, a0: S.s * (S.hw - 1.35), a1: S.s * S.hw, wO0: S.wP + 0.2, wO1: wf0 + NT * TREAD, aRail: S.s * (S.hw - 1.85) };
}

/** The frame: local (a, w) to the world, and the geometry placed. */
function frameOf(el, S) {
  const [x0, z0, x1, z1] = el.rect, yaw = YAW[S.f], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, cs = Math.cos(yaw), sn = Math.sin(yaw);
  const bw = (w) => S.D / 2 - w;
  const WC = (a, w) => { const zl = bw(w); return [cx + a * cs + zl * sn, cz - a * sn + zl * cs]; };
  const rect = (a0, w0, a1, w1) => { const p = WC(a0, w0), q = WC(a1, w1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const M = new Matrix4().makeRotationY(yaw).setPosition(cx, 0, cz);
  return { yaw, cx, cz, bw, WC, rect, M };
}

// ── the shell ──────────────────────────────────────────────────────────────────────────────────
function shell(el, ctx) {
  const S = storeySpec(el), { L, D, hw, s, wP, wR, wB, wash, roofMat } = S, Fm = frameOf(el, S), { bw } = Fm, st = stairOf(S);
  const y = el.y ?? 0, Y = y + 0.45, A0 = -L / 2, A1 = L / 2, rand = rng((el.seed || 1) + 9);
  const bag = { add: (m, g) => ctx.bag.add(m, g.applyMatrix4(Fm.M)) };
  const E = 0.2;
  const C = (a0, w0, a1, w1, y0, y1) => ctx.col.rect(Fm.rect(a0, w0, a1, w1), y0, y1);
  const CW = (a0, w0, a1, w1, y0, y1, nl, nr) => ctx.col.rect(Fm.rect(a0 - (nl ? 0 : E), w0 - E, a1 + (nr ? 0 : E), w1 + E), y0, y1);   // (0.2 m proud of the walls it follows)
  const FL = (a0, w0, a1, w1, yy) => ctx.col.floor(Fm.rect(a0, w0, a1, w1), yy);
  const bx = (a0, a1, w0, w1, y0, y1, mat) => { if (a1 - a0 < 1e-4 || w1 - w0 < 1e-4 || y1 - y0 < 1e-4) return; bag.add(mat, box(a0, y0, bw(w1), a1, y1, bw(w0))); };
  const bh = (a0, a1, w0, w1, h0, h1, mat) => bx(a0, a1, w0, w1, Y + h0, Y + h1, mat);   // (heights above the ground floor)
  const gwall = (a0, a1, w0, w1, h, nl, nr) => { if (a1 - a0 < 0.02) return; bh(a0, a1, w0, w1, 0, h, wash); bh(a0 - 0.01, a1 + 0.01, w0 - 0.01, w1 + 0.01, 0, 0.35, 'plaster_grey'); CW(a0, w0, a1, w1, Y, Y + h, nl, nr); };
  const post = (a, w, h) => { bh(a - 0.1, a + 0.1, w - 0.1, w + 0.1, 0, h, 'lacquer_chestnut'); CW(a - 0.1, w - 0.1, a + 0.1, w + 0.1, Y, Y + h, true, true); };

  // floor over the building, plinth under it
  ctx.bag && bag.add('granite_block', box(A0, y - 0.4, bw(wB), A1, Y - 0.04, bw(0)));
  bag.add('brick_paving', box(A0 + 0.02, Y - 0.04, bw(wB) + 0.02, A1 - 0.02, Y, bw(0) - 0.02));
  FL(A0, 0, A1, wB, Y);
  // party walls and back wall, full height (the walls' colliders are one piece from the floor to the eave)
  for (const [a0, a1] of [[A0, A0 + TH], [A1 - TH, A1]]) { bh(a0, a1, 0, wB, 0, H1, wash); bh(a0 - 0.01, a1 + 0.01, 0, wB, 0, 0.35, 'plaster_grey'); bx(a0, a1, 0, wB, Y + F2, Y + UT, wash); CW(a0, 0, a1, wB, Y, Y + UT, false, false); }
  // the rear wall: ground floor, and the upper floor with a window on the yard
  gwall(A0 + TH, A1 - TH, wR, wB, H1, true, true);
  const aw = -s * (hw - 1.5);
  { const ops = [[aw - 0.55, aw + 0.55, F2 + 0.85, F2 + 2.2]]; upperWall(wR, wB, ops, false); }
  // the partition between the rooms: the doorway on the far side, the stair's way open
  {
    const w0 = wP, w1 = wP + PT, dl = S.dp - 0.65, dr = S.dp + 0.65, sa = st.a0;
    const segs = s > 0 ? [[A0 + TH, dl], [dr, sa]] : [[sa, dl], [dr, A1 - TH]];
    if (s > 0) segs[0][0] = A0 + TH; else segs[1][1] = A1 - TH;
    const seg2 = s > 0 ? [[A0 + TH, Math.min(dl, dr)], [Math.max(dl, dr), sa]] : [[sa, Math.min(dl, dr)], [Math.max(dl, dr), A1 - TH]];
    for (const [p, q] of seg2) if (q - p > 0.05) gwall(p, q, w0, w1, H1, false, false);
    bh(dl - 0.07, dl, w0 - 0.03, w1 + 0.03, 0, 2.3, 'lacquer_chestnut'); bh(dr, dr + 0.07, w0 - 0.03, w1 + 0.03, 0, 2.3, 'lacquer_chestnut'); bh(dl - 0.07, dr + 0.07, w0 - 0.03, w1 + 0.03, 2.3, 2.42, 'lacquer_chestnut');
    bh(dl, dr, w0, w1, 2.42, H1, wash); C(dl, w0 - E, dr, w1 + E, Y + 2.42, Y + H1);
    void segs;
  }

  // ── the ground floor's front: by the lot's kind ──
  const wf = 0, a0 = A0 + TH, a1 = A1 - TH, gc = S.da, gwid = S.gw, g0 = gc - gwid / 2, g1 = gc + gwid / 2;
  const step = (c, w) => { bag.add('granite_block', box(c - w / 2 - 0.1, y + 0.03, bw(0), c + w / 2 + 0.1, y + 0.12, bw(-0.45))); FL(c - w / 2 - 0.1, -0.45, c + w / 2 + 0.1, 0, y + 0.12); };
  if (S.ft === 'door') {
    gwall(a0, g0, wf, wf + TH, H1, false, true); gwall(g1, a1, wf, wf + TH, H1, true, false); bh(g0, g1, wf, wf + TH, 2.45, H1, wash);
    bh(g0 - 0.1, g0, wf - 0.04, wf + TH + 0.04, 0, 2.45, 'lacquer_chestnut'); bh(g1, g1 + 0.1, wf - 0.04, wf + TH + 0.04, 0, 2.45, 'lacquer_chestnut'); bh(g0 - 0.12, g1 + 0.12, wf - 0.05, wf + TH + 0.05, 2.4, 2.55, 'lacquer_chestnut');
    bh(g0 - 0.5, g1 + 0.5, wf - 0.55, wf + 0.05, 2.58, 2.68, 'tile_dark'); bh(g0 - 0.5, g1 + 0.5, wf - 0.55, wf + 0.05, 2.5, 2.58, 'timber');
    for (const [s0, s1] of [[a0, g0], [g1, a1]]) { const wc = (s0 + s1) / 2; if (s1 - s0 < 1.7) continue; bh(wc - 0.5, wc + 0.5, wf - 0.04, wf + 0.02, 1.0, 2.3, 'lacquer_chestnut'); bh(wc - 0.44, wc + 0.44, wf - 0.05, wf - 0.0, 1.06, 2.24, 'lattice'); bh(wc - 0.55, wc + 0.55, wf - 0.12, wf + 0.02, 0.92, 1.0, 'granite_grey'); }
  } else if (S.ft === 'boards') {
    bh(a0, a1, wf - 0.1, wf + TH + 0.05, H1 - 0.45, H1, 'wood_dark');
    for (const [s0, s1, nl, nr] of [[a0, g0, false, true], [g1, a1, true, false]]) {
      bh(s0, s1, wf, wf + TH * 0.6, 0.18, H1 - 0.45, 'wood_dark'); bh(s0, s1, wf - 0.06, wf + TH, 0, 0.18, 'granite_grey'); CW(s0, wf, s1, wf + TH, Y, Y + H1 - 0.45, nl, nr);
      for (let a = s0 + 0.02, i = 0; a + 0.28 < s1; a += 0.32, i++) { if ((i * 7 + Math.floor(rand() * 5)) % 9 === 4) continue; bh(a, a + 0.28, wf - 0.03, wf, 0.18, H1 - 0.45, SHUT[i % 3]); }
    }
    bh(g0 - 0.1, g0, wf - 0.06, wf + TH, 0.18, H1 - 0.45, 'timber'); bh(g1, g1 + 0.1, wf - 0.06, wf + TH, 0.18, H1 - 0.45, 'timber');
  } else if (S.ft === 'open') {
    for (const [s0, s1, nl, nr] of [[a0, g0 - 0.1, false, true], [g1 + 0.1, a1, true, false]]) {
      if (s1 - s0 < 0.1) continue;
      bh(s0, s1, wf, wf + 0.2, 0, 0.9, 'timber'); bh(s0, s1, wf - 0.04, wf + 0.2, 0.9, 0.95, 'wood_dark'); bh(s0, s1, wf, wf + 0.12, 0.95, H1 - 0.8, 'lattice'); CW(s0, wf, s1, wf + 0.2, Y, Y + H1 - 0.8, nl, nr);
    }
    post(g0 - 0.1, wf + 0.1, H1 - 0.45); post(g1 + 0.1, wf + 0.1, H1 - 0.45);
    bh(a0, a1, wf - 0.12, wf + 0.12, H1 - 0.45, H1, 'lacquer_chestnut'); bh(a0, a1, wf - 0.02, wf + 0.02, H1 - 0.8, H1 - 0.45, 'lattice_red');
  } else {
    // lattice: full-height lattice leaves either side of the doorway under a pent eave, plaster beyond
    for (const [s0, s1, dir] of [[a0, g0, -1], [g1, a1, 1]]) {
      const lw = Math.min(1.6, Math.max(0, s1 - s0 - 0.4)), l0 = dir < 0 ? g0 - lw : g1, l1 = dir < 0 ? g0 : g1 + lw;
      if (dir < 0) gwall(s0, l0, wf, wf + TH, H1, false, false); else gwall(l1, s1, wf, wf + TH, H1, false, false);
      if (lw > 0.1) { bh(l0, l1, wf, wf + 0.1, 0, 0.2, 'lacquer_chestnut'); bh(l0, l1, wf, wf + 0.1, 0.2, 2.5, 'lattice_red'); bh(l0, l1, wf - 0.02, wf + 0.12, 2.5, 2.6, 'lacquer_chestnut'); CW(l0, wf - 0.02, l1, wf + 0.12, Y, Y + 2.6, dir > 0, dir < 0); }
    }
    bh(g0, g1, wf, wf + TH, 2.6, H1, wash); bh(g0 - 0.12, g0, wf - 0.04, wf + TH + 0.04, 0, 2.6, 'lacquer_chestnut'); bh(g1, g1 + 0.12, wf - 0.04, wf + TH + 0.04, 0, 2.6, 'lacquer_chestnut');
    bh(a0, a1, wf - 0.7, wf + 0.1, 2.9, 3.0, 'tile_dark'); bh(a0, a1, wf - 0.7, wf - 0.5, 2.8, 2.9, 'timber'); bh(a0, a1, wf - 0.05, wf + 0.1, 2.6, 2.9, 'timber');
  }
  step(gc, gwid);
  C(a0, wf - 0.0, a1, wf + TH, Y + H1 - 0.45, Y + H1);                // (the beam over the front: what the upper wall stands on)
  // the slab's front edge: a beam under the upper wall
  bx(A0, A1, -0.08, TH, Y + H1, Y + F2, 'wood_dark');

  // ── the slab (the upper floor) with the stair's opening; its joists under it ──
  const wO0 = st.wO0, wO1 = st.wO1, aR = st.aRail;
  const slabBox = (p0, q0, p1, q1) => { bx(p0, p1, q0, q1, Y + H1, Y + F2 - 0.02, 'timber'); bx(p0, p1, q0, q1, Y + F2 - 0.02, Y + F2, 'timber'); FL(p0, q0, p1, q1, Y + F2); };
  slabBox(a0, TH, a1, wO0);                                   // the front half, over the front room and the stair's foot
  slabBox(s > 0 ? a0 : aR, wO0, s > 0 ? aR : a1, wO1);        // beside the opening
  slabBox(a0, wO1, a1, wR);                                   // the landing and the rear
  for (let w = 0.9; w < wR - 0.3; w += 0.95) { const pa = (w > wO0 - 0.3 && w < wO1 + 0.1) ? (s > 0 ? [a0, aR] : [aR, a1]) : [a0, a1]; bx(pa[0], pa[1], w - 0.06, w + 0.06, Y + H1 - 0.14, Y + H1, 'wood_dark'); }
  // the opening's trim and its rail on the slab: a rail 1 m high on the room side and across the front end
  {
    const rl = (p0, q0, p1, q1) => { C(p0, q0, p1, q1, Y + F2, Y + F2 + 1.0); };
    const ra = aR, ae = s * hw;
    bx(Math.min(ra, ra + s * 0.0) - 0.04, Math.max(ra, ra) + 0.04, wO0, wO1, Y + F2 + 0.95, Y + F2 + 1.05, 'lacquer_chestnut');
    for (let w = wO0; w <= wO1 + 0.01; w += (wO1 - wO0) / 4) bx(ra - 0.03, ra + 0.03, w - 0.03, w + 0.03, Y + F2, Y + F2 + 0.96, 'lacquer_chestnut');
    bx(ra - 0.03, ra + 0.03, wO0, wO1, Y + F2 + 0.45, Y + F2 + 0.5, 'lacquer_chestnut');
    rl(ra - 0.04, wO0, ra + 0.04, wO1);
  }
  // ── the stair: closed treads of timber, the boarded flank on the room side with its rail ──
  {
    const fl = st.a0, a0s = Math.min(st.a0, st.a1), a1s = Math.max(st.a0, st.a1);
    for (const t of st.treads) {
      bx(a0s, a1s, t.w0, t.w1, Y, Y + t.top - 0.04, 'wood_dark'); bx(a0s, a1s, t.w0 - 0.02, t.w1, Y + t.top - 0.04, Y + t.top, 'timber');
      C(a0s, t.w0, a1s, t.w1, Y, Y + t.top);
      // the flank: a board standing on each tread, as high above it as a rail, and its collider
      bx(fl - 0.03, fl + 0.03, t.w0, t.w1, Y + t.top, Y + t.top + 0.5, 'wood_dark');
      C(fl - 0.05, t.w0, fl + 0.05, t.w1, Y, Y + t.top + 0.95);
    }
    const tp = st.treads;
    bag.add('lacquer_chestnut', rod([fl, Y + tp[0].top + 0.95, bw(tp[0].w0 + 0.12)], [fl, Y + tp[NT - 1].top + 0.95, bw(tp[NT - 1].w1 - 0.12)], 0.035, 5));
    for (const k of [0, 5, 10, 15]) bx(fl - 0.04, fl + 0.04, tp[k].w0 + 0.08, tp[k].w0 + 0.16, Y + tp[k].top + 0.5, Y + tp[k].top + 0.96, 'lacquer_chestnut');
    // the stringer beam under the flight on the ground floor is the stair's own mass
  }

  // ── the upper floor: front wall with its window reveals and the loggia's door; the partition; tie beams ──
  const bs = Math.max(-hw + 0.3, S.ab - S.Bw / 2), be = Math.min(hw - 0.3, S.ab + S.Bw / 2);
  const dwA = Math.max(a0 + 0.2, Math.min(a1 - 0.2, S.ab)) - 0.7, dwB = dwA + 1.4;
  const ops = [[dwA, dwB, F2, F2 + 2.35]];
  const nwin = Math.max(1, Math.round((2 * hw) / 2.0)), cw = (2 * hw) / nwin;
  for (let k = 0; k < nwin; k++) { const c = -hw + cw * (k + 0.5), p = c - 0.55, q = c + 0.55; if (q > dwA - 0.35 && p < dwB + 0.35) continue; ops.push([p, q, F2 + 0.85, F2 + 2.25]); }
  ops.sort((m, n) => m[0] - n[0]);
  upperWall(0, TH, ops, true);
  // the upper partition: the doorway on the far side
  {
    const dl = S.dp - 0.65, dr = S.dp + 0.65;
    for (const [p, q] of [[a0, dl], [dr, a1]]) if (q - p > 0.05) { bx(p, q, wP, wP + PT, Y + F2, Y + UT - 0.3, wash); CW(p, wP, q, wP + PT, Y + H1, Y + UT, false, false); }
    bx(dl - 0.07, dl, wP - 0.03, wP + PT + 0.03, Y + F2, Y + F2 + 2.3, 'lacquer_chestnut'); bx(dr, dr + 0.07, wP - 0.03, wP + PT + 0.03, Y + F2, Y + F2 + 2.3, 'lacquer_chestnut');
    bx(dl, dr, wP, wP + PT, Y + F2 + 2.3, Y + UT - 0.3, wash); bx(dl - 0.07, dr + 0.07, wP - 0.03, wP + PT + 0.03, Y + F2 + 2.3, Y + F2 + 2.42, 'lacquer_chestnut');
    C(dl, wP - E, dr, wP + PT + E, Y + F2 + 2.3, Y + UT);
  }

  // ── the loggia over the street: a deck on beam ends, a rail 1 m high, the door onto it ──
  {
    const lo = bs, hi = be, dk = 1.0;
    bx(lo, hi, -dk, TH, Y + F2 - 0.1, Y + F2, 'timber'); FL(lo, -dk, hi, TH, Y + F2);
    bx(lo - 0.05, hi + 0.05, -dk - 0.06, -dk, Y + F2 - 0.45, Y + F2, 'wood_dark');
    for (let a = lo + 0.15; a < hi; a += 0.6) bx(a - 0.07, a + 0.07, -dk, 0, Y + F2 - 0.45, Y + F2 - 0.1, 'timber');
    for (let a = lo; a <= hi + 0.01; a += (hi - lo) / Math.max(2, Math.round((hi - lo) / 0.5))) bx(a - 0.03, a + 0.03, -dk - 0.03, -dk + 0.03, Y + F2, Y + F2 + 1.0, 'lacquer_chestnut');
    bx(lo, hi, -dk - 0.05, -dk + 0.07, Y + F2 + 0.95, Y + F2 + 1.07, 'lacquer_chestnut'); bx(lo, hi, -dk - 0.02, -dk + 0.04, Y + F2 + 0.45, Y + F2 + 0.5, 'lacquer_chestnut');
    for (const a of [lo, hi]) { bx(a - 0.04, a + 0.04, -dk, 0, Y + F2 + 0.95, Y + F2 + 1.05, 'lacquer_chestnut'); bx(a - 0.03, a + 0.03, -dk, 0, Y + F2 + 0.45, Y + F2 + 0.5, 'lacquer_chestnut'); }
    C(lo, -dk - 0.05, hi, -dk + 0.05, Y + F2, Y + F2 + 1.0); C(lo - 0.05, -dk, lo + 0.05, 0, Y + F2, Y + F2 + 1.0); C(hi - 0.05, -dk, hi + 0.05, 0, Y + F2, Y + F2 + 1.0);
  }

  // ── the roof: the ridge along the front, eaves 0.9 m out over the loggia; the gables filled to its line ──
  {
    const B = wB / 2 + 0.9, cb = D / 2 - wB / 2, rise = Math.min(0.22 * (wB + 1.8), 2.8), A = L / 2 + 0.25, yR = Y + UT - 0.05;
    rectRoof({ c: [0, cb], A, B, alongZ: false, y: yR, rise, kind: 'gable', sweep: 0.15, mat: roofMat, soffit: 'timber', p: 1.4 }, bag);
    const prof = (b) => { const t = Math.max(0, Math.min(1, (B - Math.abs(b - cb)) / B)); return yR + rise * Math.pow(t, 1.4); };
    const n = 16;
    for (const [p, q] of [[A0, A0 + TH], [A1 - TH, A1]]) for (let i = 0; i < n; i++) {
      const w0 = wB * i / n, w1 = wB * (i + 1) / n, top = Math.min(prof(bw(w0)), prof(bw(w1))) - 0.14;
      if (top > Y + UT + 0.02) bag.add(wash, box(p, Y + UT, bw(w1), q, top, bw(w0)));
    }
  }
  // ── the back yard: walls, paving, a water jar, firewood ──
  if (D - wB > 1.2) {
    const wy = 2.8;
    for (const [p0, p1, w0, w1] of [[A0, A0 + TH, wB, D], [A1 - TH, A1, wB, D], [A0 + TH, A1 - TH, D - TH, D]]) {
      bx(p0, p1, w0, w1, y - 0.1, y + wy, wash); bx(p0 - 0.03, p1 + 0.03, w0, w1, y + wy, y + wy + 0.1, 'tile_dark'); CW(p0, w0, p1, w1, y, y + wy, false, false);
    }
    bx(A0 + TH, A1 - TH, wB, D - TH, y - 0.02, y + 0.03, 'brick_paving');
    const jx = -s * (hw - 0.7), jw = wB + 0.8;
    bag.add('pottery_dark', ly([[0.001, 0], [0.2, 0], [0.34, 0.12], [0.4, 0.4], [0.3, 0.7], [0.2, 0.8], [0.001, 0.8]], 8, jx, y + 0.03, bw(jw))); C(jx - 0.4, jw - 0.4, jx + 0.4, jw + 0.4, y, y + 0.85);
    const fx = s * (hw - 1.6), fw = D - TH - 0.45;
    if (fw > wB + 1.2) { for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - (r > 1 ? 1 : 0); k++) bag.add('bark_dark', rod([fx + 0.1 + k * 0.25 + (r % 2) * 0.1, y + 0.08 + r * 0.15, bw(fw)], [fx + 0.1 + k * 0.25 + (r % 2) * 0.1, y + 0.08 + r * 0.15, bw(fw - 0.4)], 0.065, 5)); C(fx, fw - 0.5, fx + 1.6, fw + 0.1, y, y + 0.7); }
  }

  /** The wall of the upper floor from w0 to w1 with openings [a0, a1, y0, y1] (heights over the street y + 0.45 = F1 + ...): pieces of wall about them, their frames, the leaves open against the wall. */
  function upperWall(w0, w1, openings, front) {
    const lo = A0 + TH, hi = A1 - TH, top = Y + UT, yb = Y + F2, ycol = Y + H1;
    const piece = (p, q, ya, yt, collide) => { if (q - p < 0.02 || yt - ya < 0.02) return; bx(p, q, w0, w1, ya, yt, wash); if (collide) CW(p, w0, q, w1, Math.min(ycol, ya), yt, false, false); };
    let a = lo;
    for (const [p, q, ya, yt] of openings) {
      piece(a, p, yb, top, true);
      if (ya > yb + 0.01) { piece(p, q, yb, Y + ya, false); CW(p, w0, q, w1, ycol, Y + ya, true, true); }
      piece(p, q, Y + yt, top, false); CW(p, w0, q, w1, Y + yt, top, true, true);
      // the reveal's frame: a timber surround standing out of the wall, a sill of granite, one lattice leaf open against the wall
      const o = front ? -0.05 : 0.0, o2 = front ? w0 : w1;
      bx(p - 0.08, p, w0 - 0.05, w1 + 0.03, Y + ya, Y + yt + 0.1, 'wood_dark'); bx(q, q + 0.08, w0 - 0.05, w1 + 0.03, Y + ya, Y + yt + 0.1, 'wood_dark'); bx(p - 0.08, q + 0.08, w0 - 0.05, w1 + 0.03, Y + yt, Y + yt + 0.1, 'wood_dark');
      if (ya > yb - Y + 0.01) bx(p - 0.12, q + 0.12, w0 - 0.1, w1 + 0.03, Y + ya - 0.07, Y + ya, 'granite_grey');
      if (ya > yb - Y + 0.01 && front) { const lw = (q - p) * 0.5; bx(q + 0.08, q + 0.08 + lw, w0 - 0.09, w0 - 0.05, Y + ya, Y + yt, 'lattice'); }
      void o; void o2;
      a = q;
    }
    piece(a, hi, yb, top, true);
  }
  void ball; void limb;
}
STYLES.song.elements.hz_upstairs = shell;

// ── the furniture ──────────────────────────────────────────────────────────────────────────────
const CLN = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black'];
const WD = 'lacquer_chestnut';
const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
const sg = (v) => (v < 0 ? -1 : 1);

/** A canopy bed (jiazi chuang), 1.9 × 1.1 × 1.95, the back at +z, the bedding in the cloths the interiors already use. */
function bed(P) {
  P.add(WD, box(-0.95, 0.18, -0.55, 0.95, 0.42, 0.55));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(WD, box(sx * 0.9 - 0.04, 0, sz * 0.5 - 0.04, sx * 0.9 + 0.04, 0.18, sz * 0.5 + 0.04));
  P.add('cloth_indigo', box(-0.92, 0.42, -0.52, 0.92, 0.5, 0.52)); P.add('cloth_red', box(-0.9, 0.5, -0.5, 0.25, 0.57, 0.5)); P.add('cloth_white', box(0.45, 0.5, -0.22, 0.85, 0.62, 0.22));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(WD, box(sx * 0.93 - 0.03, 0.42, sz * 0.53 - 0.03, sx * 0.93 + 0.03, 1.95, sz * 0.53 + 0.03));
  for (const sz of [-1, 1]) P.add(WD, box(-0.96, 1.88, sz * 0.53 - 0.025, 0.96, 1.95, sz * 0.53 + 0.025)); for (const sx of [-1, 1]) P.add(WD, box(sx * 0.93 - 0.025, 1.88, -0.53, sx * 0.93 + 0.025, 1.95, 0.53));
  P.add(WD, box(-0.95, 0.42, 0.5, 0.95, 1.5, 0.55)); P.add('paint_white', box(-0.85, 0.55, 0.45, 0.85, 1.4, 0.5));
  for (let k = 0; k < 3; k++) P.add('slate', fromTriangles([-0.6 + k * 0.5, 0.6, 0.448, -0.3 + k * 0.5, 0.6, 0.448, -0.45 + k * 0.5, 0.95 + (k % 2) * 0.15, 0.448]));
  for (const sx of [-1, 1]) P.add('cloth_white', box(sx > 0 ? 0.79 : -0.93, 0.7, -0.585, sx > 0 ? 0.93 : -0.79, 1.88, -0.565));
}
/** A plain pallet bed (a board bed, with a quilt and a hard pillow), 1.9 × 0.9, for the tenement's rooms and the apprentices'. */
function pallet(P, q = 'cloth_ochre') {
  P.add('timber', box(-0.95, 0.2, -0.45, 0.95, 0.26, 0.45)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add('timber', box(sx * 0.9 - 0.03, 0, sz * 0.4 - 0.03, sx * 0.9 + 0.03, 0.2, sz * 0.4 + 0.03));
  P.add('reed_mat', box(-0.93, 0.26, -0.43, 0.93, 0.285, 0.43)); P.add(q, box(-0.9, 0.285, -0.42, 0.3, 0.36, 0.42)); P.add('cloth_white', box(0.55, 0.285, -0.2, 0.88, 0.38, 0.2));
}
/** A stand for the washing basin with a towel on its rail, a rack of towels: 0.54 × 0.4 × 1.45. */
function washStand(P) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add('timber', box(sx * 0.25 - 0.015, 0, sz * 0.18 - 0.015, sx * 0.25 + 0.015, sz > 0 ? 1.45 : 0.75, sz * 0.18 + 0.015));
  P.add('timber', box(-0.27, 0.72, -0.2, 0.27, 0.75, 0.2)); P.add('timber', box(-0.26, 0.2, -0.17, 0.26, 0.22, 0.17)); P.add('timber', box(-0.27, 1.38, 0.16, 0.27, 1.42, 0.2));
  P.add('paint_white', ly([[0.001, 0], [0.12, 0], [0.22, 0.1], [0.24, 0.13], [0.22, 0.13], [0.11, 0.03], [0.001, 0.02]], 10, 0, 0.75, 0)); P.add('cloth_white', box(-0.2, 0.9, 0.17, 0.2, 1.38, 0.175));
}
/** A jar of the household's stores (a water jar, a pickle jar) with a timber lid. */
function jar(P, x, z, k = 1) {
  P.add('pottery_dark', ly([[0.001, 0], [0.2 * k, 0], [0.32 * k, 0.12 * k], [0.38 * k, 0.35 * k], [0.3 * k, 0.62 * k], [0.2 * k, 0.72 * k], [0.24 * k, 0.76 * k], [0.001, 0.76 * k]], 9, x, 0, z));
  P.add('timber', ly([[0.001, 0.77 * k], [0.26 * k, 0.77 * k], [0.26 * k, 0.8 * k], [0.001, 0.82 * k]], 9, x, 0, z));
}
/** A basket of reed with a cloth over it. */
function basket(P, x, z, r = 0.26, h = 0.3, fill = 'cloth_white') {
  P.add('reed_mat', ly([[0.001, 0], [r * 0.8, 0], [r, h * 0.9], [r * 0.95, h], [r * 0.85, h], [r * 0.7, h * 0.1], [0.001, 0.02]], 9, x, 0, z));
  P.add(fill, ball(r * 0.85, 0.07, r * 0.85, 7, 3).translate(x, h * 0.95, z));
}
/** A sack of grain (a cloth bag tied at the neck). */
function sack(P, x, z, c = 'cloth_brown') { P.add(c, ball(0.24, 0.3, 0.17, 7, 4).translate(x, 0.3, z)); P.add('timber', box(x - 0.04, 0.55, z - 0.04, x + 0.04, 0.6, z + 0.04)); }
/** A bale of cloth: a folded bundle tied with a cord, w × d × h. */
function bale(P, x, y, z, c = 'cloth_ochre', w = 0.5, d = 0.35, h = 0.3) { P.add(c, box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2)); P.add('timber', box(x - 0.02, y, z - d / 2 - 0.005, x + 0.02, y + h, z + d / 2 + 0.005)); }
/** A rack of three round bamboo trays of silkworms on mulberry leaves (cansang), on four posts: 1.0 × 0.7 × 1.8, the open side at −z. */
function trayRack(P, k = 0) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add('timber', box(sx * 0.46 - 0.02, 0, sz * 0.3 - 0.02, sx * 0.46 + 0.02, 1.8, sz * 0.3 + 0.02));
  for (const y of [0.35, 0.9, 1.45]) {
    for (const sz of [-1, 1]) P.add('timber', box(-0.48, y - 0.02, sz * 0.3 - 0.018, 0.48, y + 0.02, sz * 0.3 + 0.018));
    for (const sx of [-0.23, 0.23]) { const q = 0.9 + 0.02 * ((Math.round(y * 100) + Math.round(sx * 100) + k * 37) % 6); P.add('reed_mat', ly([[0.001, 0.0], [0.2 * q, 0.0], [0.22 * q, 0.05], [0.2 * q, 0.05], [0.001, 0.02]], 10, sx, y + 0.02, 0)); P.add('cloth_green', ball(0.18 * q, 0.025, 0.18 * q, 8, 3).translate(sx, y + 0.07, 0)); }
  }
}
/** A reeling stove with its basin and a six-armed reel on two posts beside it (silk-reeling as in the Gengzhi tu): 1.2 × 0.6 × 1.0. */
function reeling(P) {
  P.add('slate', box(-0.5, 0, -0.26, -0.0, 0.5, 0.26)); P.add('iron', ly([[0.001, 0.0], [0.2, 0.03], [0.26, 0.14], [0.001, 0.14]], 10, -0.25, 0.5, 0));
  for (const sx of [0.3, 0.9]) { P.add('timber', box(sx - 0.025, 0, -0.025, sx + 0.025, 0.9, 0.025)); P.add('timber', box(sx - 0.05, 0, -0.16, sx + 0.05, 0.04, 0.16)); }
  P.add('timber', rod([0.28, 0.9, 0], [0.92, 0.9, 0], 0.02, 5));
  for (let k = 0; k < 6; k++) { const t = k * Math.PI / 3, c = [0.9 + 0.34 * Math.cos(t), 0.34 * Math.sin(t)]; P.add('timber', rod([0.45, 0.9, 0], [0.45, c[0], c[1]], 0.01, 4)); P.add('timber', rod([0.75, 0.9, 0], [0.75, c[0], c[1]], 0.01, 4)); P.add('timber', rod([0.45, c[0], c[1]], [0.75, c[0], c[1]], 0.012, 4)); }
}
/** A drying line of paper sheets (or lanterns' paper) between two posts, `n` long. */
function sheets(P, len, n, y = 1.9) {
  for (const sx of [-1, 1]) P.add('timber', box(sx * len / 2 - 0.03, 0, -0.03, sx * len / 2 + 0.03, y + 0.1, 0.03));
  P.add('timber', rod([-len / 2, y + 0.06, 0], [len / 2, y + 0.06, 0], 0.012, 4));
  for (let k = 0; k < n; k++) P.add('paint_white', box(-len / 2 + 0.2 + k * (len - 0.4) / Math.max(1, n - 1) - 0.17, y - 0.55, -0.004, -len / 2 + 0.2 + k * (len - 0.4) / Math.max(1, n - 1) + 0.17, y + 0.04, 0.004));
}
/** A pawnshop's counter with its tall lattice screen (the keeper behind it); w long. */
function pawnCounter(P, w) {
  counter(P, w);
  P.add('lacquer_black', box(-w / 2, 0.95, -0.3, w / 2, 1.0, -0.26)); P.add('lacquer_black', box(-w / 2, 1.85, -0.3, w / 2, 1.9, -0.26));
  for (let k = 0; k <= Math.round(w / 0.12); k++) P.add('lacquer_black', box(-w / 2 + k * w / Math.round(w / 0.12) - 0.012, 1.0, -0.29, -w / 2 + k * w / Math.round(w / 0.12) + 0.012, 1.85, -0.27));
}

/**
 * The rooms: furniture by level, 1 the ground floor, 2 the upper. put(level, parts, a, w, yaw, up): a piece at (a, w) in the lot's frame
 * (yaw 0 faces the back, π the street); box(level, a0, w0, a1, w1, h): its collider; person(level, a, w, toward…): a figure.
 */
function roomsOf(el, ctx) {
  const S = storeySpec(el), Fm = frameOf(el, S), y = el.y ?? 0, floors = [y + 0.45, y + 0.45 + F2], P = [new Parts(), new Parts()], figs = [];
  const put = (lv, Q, a, w, yaw = 0, up = 0) => Q.emit(P[lv - 1], a, up, Fm.bw(w), yaw);
  const hb = (lv, a0, w0, a1, w1, h) => { const r = Fm.rect(a0, w0, a1, w1); ctx.col?.rect([r[0] - 0.05, r[1] - 0.05, r[2] + 0.05, r[3] + 0.05], floors[lv - 1], floors[lv - 1] + h); };
  const rr = rng((el.seed || 1) + 41);
  const person = (lv, a, w, ta, tw, extra = {}) => { const p = Fm.WC(a, w), q = Fm.WC(a + ta, w + tw); figs.push({ t: 'figure', at: p, y: floors[lv - 1], rot: Math.atan2(-(q[0] - p[0]), -(q[1] - p[1])), seed: Math.floor(rng((el.seed ?? 1) + figs.length * 7)() * 1e9), skin: 'skin_light', hair: 'bun', ...extra }); };
  const emit = () => { for (const lv of [1, 2]) P[lv - 1].emit(ctx.bag, Fm.cx, floors[lv - 1], Fm.cz, Fm.yaw); };
  return { S, Fm, put, hb, rr, person, emit, figs };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const man = (r, extra = {}) => ({ dress: pick(r, ['robe', 'trousers']), cloth: pick(r, CLN), cloth2: pick(r, CLN), hat: pick(r, ['cap', 'none', 'cap']), ...extra });
const woman = (r, extra = {}) => ({ dress: 'robe', cloth: pick(r, ['cloth_indigo', 'cloth_brown', 'cloth_grey']), cloth2: pick(r, CLN), hat: 'none', ...extra });

function storeyIn(el, ctx) {
  const R = roomsOf(el, ctx), { S, put, hb, rr, person } = R, { hw, s, wP, wR, kind } = S, f = -s, FAR = f * hw;
  const wf0 = wP - 0.5, face = (dx, dz) => faceYaw(dx, dz);
  const toS = -s * Math.PI / 2;               // facing the strip's side (the chest's front toward the stair)
  void toS;
  const seed = el.seed || 1;
  // ── the ground floor, front room: by use. Kept free: the way from the door to the stair's foot ──
  const cw = Math.min(2.6, hw + 0.4);           // the counter's length along the far wall side
  if (kind === 'shop' || kind === 'pawn') {
    const cwp = wP - 2.2;
    { const Pc = new Parts(); if (kind === 'pawn') pawnCounter(Pc, cw); else counter(Pc, cw); put(1, Pc, f * (hw - cw / 2), cwp, Math.PI); hb(1, f * hw, cwp - 0.3, f * (hw - cw), cwp + 0.3, 0.95); }
    { const Ps = new Parts(), kindG = { medicine: 'jars', incense: 'jars', books: 'books', tea: 'bowls', food: 'bowls', pawn: 'cloth' }[S.trade] || 'cloth'; shelf(Ps, Math.min(2.4, hw + 0.2), 3, kind === 'pawn' ? 'cloth' : kindG, seed); put(1, Ps, f * 0.3 + (f * 0), wP - 0.02, Math.PI); hb(1, f * 0.3 - 1.2, wP - 0.2, f * 0.3 + 1.2, wP, 1.4); }
    person(1, f * (hw - cw / 2), wP - 1.15, 0, -1, man(rr, { pose: 'stand', hat: 'cap' }));
    { const Pg = new Parts(); jar(Pg, 0, 0, 1.0); put(1, Pg, f * (hw - 0.45), 0.85); hb(1, f * (hw - 0.45) - 0.4, 0.45, f * (hw - 0.45) + 0.4, 1.25, 0.8); const Pb = new Parts(); basket(Pb, 0, 0, 0.28, 0.32, 'cloth_red'); put(1, Pb, f * (hw - 1.4), 0.75); }
    { const Pl = new Parts(); lantern(Pl, 0, H1 - 0.02, 0); put(1, Pl, f * 1.2, 2.4); }
  } else if (kind === 'inn') {
    for (let k = 0; k < 2; k++) {
      const aa = f * (hw - 1.2), ww = 1.6 + k * 1.85;
      const T = new Parts(); table(T, 0.9, 0.7, 0.76); put(1, T, aa, ww); hb(1, aa - 0.45, ww - 0.35, aa + 0.45, ww + 0.35, 0.76);
      const V = new Parts(); teabowl(V, 0, 0.76, 0); teabowl(V, 0.2, 0.76, 0.08); put(1, V, aa - 0.1, ww);
      for (const d of [-1, 1]) { const Bn = new Parts(); bench(Bn, 0.8); put(1, Bn, aa, ww + d * 0.62, d > 0 ? 0 : Math.PI); hb(1, aa - 0.4, ww + d * 0.62 - 0.14, aa + 0.4, ww + d * 0.62 + 0.14, 0.46); if (rr() < 0.7) person(1, aa + (rr() - 0.5) * 0.3, ww + d * 0.62, 0, -d, man(rr, { pose: 'sit', dress: 'robe', hat: 'cap' })); }
    }
    { const Pc = new Parts(); counter(Pc, 1.9); put(1, Pc, f * (hw - 0.4), wP - 1.3, Math.PI / 2 * f); hb(1, f * hw, wP - 2.25, f * (hw - 0.65), wP - 0.35, 0.95); const Pb = new Parts(); brazier(Pb, 0, 0.95, 0); put(1, Pb, f * (hw - 0.4), wP - 1.9); person(1, f * (hw - 1.1), wP - 1.3, f, 0, man(rr, { pose: 'stand', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap' })); }
  } else if (kind === 'craftsman') {
    const wb = 2.4;
    { const T = new Parts(); table(T, 1.5, 0.7, 0.82); put(1, T, f * (hw - 1.1), wb); hb(1, f * (hw - 1.1) - 0.75, wb - 0.35, f * (hw - 1.1) + 0.75, wb + 0.35, 0.82);
      const Q = new Parts(); for (let k = 0; k < 3; k++) Q.add('timber', box(-0.5 + k * 0.4, 0.82, -0.18, -0.2 + k * 0.4, 0.9, 0.18)); Q.add('paint_white', box(-0.55, 0.82, 0.22, -0.2, 0.84, 0.3)); put(1, Q, f * (hw - 1.1), wb); }
    person(1, f * (hw - 1.1), wb + 0.8, 0, -1, man(rr, { pose: 'stand', hat: 'cap' }));
    for (let k = 0; k < 4; k++) { const Pl = new Parts(); lantern(Pl, 0, H1 - 0.02, 0, k % 3 === 0 ? 'lamp_paper' : 'lamp_paper'); put(1, Pl, f * (hw - 0.8) + (k - 1.5) * 0.0, 1.0 + k * 0.9); }
    { const Ps = new Parts(); shelf(Ps, 1.6, 3, 'books', seed); put(1, Ps, f * (hw - 1.0), wP - 0.02, Math.PI); hb(1, f * (hw - 1.0) - 0.8, wP - 0.2, f * (hw - 1.0) + 0.8, wP, 1.4); }
  } else if (kind === 'tenement') {
    { const T = new Parts(); table(T, 1.0, 0.7, 0.74); put(1, T, f * (hw - 1.0), 2.4); hb(1, f * (hw - 1.0) - 0.5, 2.05, f * (hw - 1.0) + 0.5, 2.75, 0.74); const V = new Parts(); teabowl(V, 0, 0.74, 0); teabowl(V, 0.18, 0.74, 0.06); put(1, V, f * (hw - 1.0), 2.4);
      for (const d of [-1, 1]) { const St = new Parts(); stool(St); put(1, St, f * (hw - 1.0), 2.4 + d * 0.65); hb(1, f * (hw - 1.0) - 0.2, 2.4 + d * 0.65 - 0.2, f * (hw - 1.0) + 0.2, 2.4 + d * 0.65 + 0.2, 0.44); } }
    person(1, f * (hw - 1.0), 3.05, 0, -1, woman(rr, { pose: 'sit' }));
    { const Pb = new Parts(); basket(Pb, 0, 0, 0.3, 0.35, 'cloth_indigo'); basket(Pb, 0.5, 0.2, 0.24, 0.3); put(1, Pb, f * (hw - 0.6), 0.9); hb(1, f * (hw - 0.6) - 0.35, 0.55, f * (hw - 0.6) + 0.85, 1.4, 0.35); }
    { const Pl = new Parts(); lantern(Pl, 0, H1 - 0.02, 0); put(1, Pl, f * 0.8, 2.4); }
  } else if (kind === 'weaver') {
    { const Pa = new Parts(); altar(Pa, 1.3); put(1, Pa, f * 0.9, wP - 0.02, Math.PI); hb(1, f * 0.9 - 0.65, wP - 0.45, f * 0.9 + 0.65, wP, 0.95); }
    { const T = new Parts(); table(T, 0.8, 0.55, 0.74); put(1, T, f * (hw - 1.0), 2.3); hb(1, f * (hw - 1.0) - 0.4, 2.0, f * (hw - 1.0) + 0.4, 2.6, 0.74); const V = new Parts(); teabowl(V, 0, 0.74, 0); put(1, V, f * (hw - 1.0), 2.3);
      for (const d of [-1, 1]) { const Ch = new Parts(); chair(Ch); put(1, Ch, f * (hw - 1.0), 2.3 + d * 0.7, d > 0 ? Math.PI : 0); hb(1, f * (hw - 1.0) - 0.28, 2.3 + d * 0.7 - 0.28, f * (hw - 1.0) + 0.28, 2.3 + d * 0.7 + 0.28, 1.0); } }
    person(1, f * (hw - 1.0), 3.0, 0, -1, woman(rr, { pose: 'sit' }));
    { const Pr = new Parts(); reeling(Pr); put(1, Pr, f * (hw - 0.7), 1.0, Math.PI / 2 * f * -1); hb(1, f * (hw - 0.7) - 0.5, 0.4, f * (hw - 0.7) + 0.5, 1.7, 0.9); }
    { const Pl = new Parts(); lantern(Pl, 0, H1 - 0.02, 0); put(1, Pl, f * 0.9, 2.3); }
  } else {   // merchant
    { const Pa = new Parts(); altar(Pa, 1.3); put(1, Pa, f * 1.0, wP - 0.02, Math.PI); hb(1, f * 1.0 - 0.65, wP - 0.45, f * 1.0 + 0.65, wP, 0.95); }
    for (let k = 0; k < 2; k++) { const Ps = new Parts(); scroll(Ps, 0, 0, 0, 0.45, 1.4, seed + k); put(1, Ps, f * (1.0 + (k ? 1.5 : -1.5)) , wP - 0.04, Math.PI, 0.95); }
    { const T = new Parts(); table(T, 0.7, 0.5, 0.74); put(1, T, f * (hw - 1.1), wP - 2.0); hb(1, f * (hw - 1.1) - 0.35, wP - 2.25, f * (hw - 1.1) + 0.35, wP - 1.75, 0.74); const V = new Parts(); teabowl(V, -0.1, 0.74, 0); teabowl(V, 0.1, 0.74, 0); put(1, V, f * (hw - 1.1), wP - 2.0);
      for (const d of [-1, 1]) { const Ch = new Parts(); chair(Ch); put(1, Ch, f * (hw - 1.1) + d * 0.75, wP - 2.0, face(-d, 0)); hb(1, f * (hw - 1.1) + d * 0.75 - 0.28, wP - 2.28, f * (hw - 1.1) + d * 0.75 + 0.28, wP - 1.72, 1.0); } }
    person(1, f * (hw - 1.1) + 0.75, wP - 2.0, -f, 0, man(rr, { pose: 'sit', dress: 'robe', hat: 'cap' }));
    { const Pc = new Parts(); couch(Pc, 1.9, 0.95); put(1, Pc, f * (hw - 0.55), 1.7, f > 0 ? Math.PI / 2 * -1 : Math.PI / 2); hb(1, f * (hw - 1.05), 0.75, f * hw, 2.65, 0.98); }
    { const Pl = new Parts(); lantern(Pl, 0, H1 - 0.02, 0); put(1, Pl, f * 1.0, wP - 2.0); }
  }
  // ── the ground floor, rear room (behind the partition's doorway, on the far side): kitchen and store ──
  {
    const wr = wP + PT;
    { const Pr = new Parts(); Pr.add('slate', box(-0.75, 0, -0.38, 0.75, 0.8, 0.38)); Pr.add('timber', box(-0.78, 0.8, -0.41, 0.78, 0.86, 0.41)); for (const sx of [-1, 1]) { Pr.add('iron', ly([[0.001, 0.0], [0.2, 0.03], [0.3, 0.12], [0.32, 0.17], [0.3, 0.17], [0.19, 0.05], [0.001, 0.02]], 10, sx * 0.38, 0.86, 0)); Pr.add('flame', box(sx * 0.38 - 0.08, 0.12, -0.39, sx * 0.38 + 0.08, 0.2, -0.375)); }
      put(1, Pr, f * (hw - 0.8), wR - 0.45, Math.PI); hb(1, f * (hw - 0.8) - 0.8, wR - 0.9, f * (hw - 0.8) + 0.8, wR, 0.86); }
    person(1, f * (hw - 0.8), wR - 1.45, 0, 1, woman(rr, { pose: 'stand' }));
    { const Pj = new Parts(); jar(Pj, 0, 0, 1.0); jar(Pj, 0.8, 0.15, 0.85); put(1, Pj, f * (hw - 2.4), wR - 0.5); hb(1, f * (hw - 2.4) - 0.4, wR - 0.9, f * (hw - 2.4) + 1.3, wR - 0.1, 0.8); }
    { const T = new Parts(); table(T, 0.9, 0.6, 0.78); put(1, T, f * (hw - 1.4), wr + 1.2); hb(1, f * (hw - 1.4) - 0.45, wr + 0.9, f * (hw - 1.4) + 0.45, wr + 1.5, 0.78);
      for (const d of [-1, 1]) { const St = new Parts(); stool(St); put(1, St, f * (hw - 1.4) + d * 0.7, wr + 1.2); hb(1, f * (hw - 1.4) + d * 0.7 - 0.2, wr + 1.0, f * (hw - 1.4) + d * 0.7 + 0.2, wr + 1.4, 0.44); } }
    { const Ps = new Parts(); shelf(Ps, 1.1, 3, 'bowls', seed + 3); put(1, Ps, f * (hw - 0.1) - s * 0.85, wr + 0.02, 0); hb(1, f * hw, wr, f * (hw - 1.1), wr + 0.2, 1.4); }
  }

  // ── the upper floor ──
  const WS = wP + PT, farA = f * (hw - 0.65);
  // the bed against the far wall of the rear room, its head to the wall; a chest at its foot; the wash stand
  const sleeping = () => {
    const Pb = new Parts(); bed(Pb); put(2, Pb, farA, WS + 1.5, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * hw, WS + 0.45, f * (hw - 1.25), WS + 2.55, 1.95);
    const Pc = new Parts(); chest(Pc, 0.9, 0.45, 0.5); put(2, Pc, f * (hw - 0.3), WS + 3.1, face(-f, 0)); hb(2, f * hw, WS + 2.65, f * (hw - 0.55), WS + 3.55, 0.5);
    const Pw = new Parts(); washStand(Pw); put(2, Pw, f * (hw - 0.3), WS + 3.8, face(-f, 0)); hb(2, f * hw, WS + 3.58, f * (hw - 0.55), WS + 4.02, 1.45);
  };
  const storage = (n) => {
    for (let k = 0; k < n; k++) { const Pc = new Parts(); chest(Pc, 0.9, 0.45, 0.5); put(2, Pc, f * (hw - 0.3), WS + 0.7 + k * 1.05, face(-f, 0)); hb(2, f * hw, WS + 0.7 + k * 1.05 - 0.5, f * (hw - 0.55), WS + 0.7 + k * 1.05 + 0.5, 0.5); if (k % 2 === 0) { const Pk = new Parts(); chest(Pk, 0.8, 0.45, 0.45); put(2, Pk, f * (hw - 0.3), WS + 0.7 + k * 1.05, face(-f, 0), 0.54); } }
    const Pj = new Parts(); jar(Pj, 0, 0, 1.0); put(2, Pj, f * (hw - 0.5), wR - 0.5); hb(2, f * (hw - 0.5) - 0.4, wR - 0.9, f * (hw - 0.5) + 0.4, wR - 0.1, 0.8);
    const Ps = new Parts(); for (let k = 0; k < 2; k++) sack(Ps, 0, -0.45 * k); put(2, Ps, f * (hw - 0.4), wR - 1.5); hb(2, f * (hw - 0.4) - 0.3, wR - 2.0, f * (hw - 0.4) + 0.3, wR - 1.2, 0.6);
  };
  const frontUp = {
    shop: () => {   // the family's sitting room over the shop: the stock in bales along the wall, a table with its chairs, a window seat
      for (let k = 0; k < 3; k++) { const Pb = new Parts(); bale(Pb, 0, 0, 0, ['cloth_ochre', 'cloth_indigo', 'cloth_red'][k], 0.6, 0.4, 0.3); bale(Pb, 0, 0.3, 0, ['cloth_white', 'cloth_brown', 'cloth_ochre'][k], 0.55, 0.38, 0.28); put(2, Pb, f * (hw - 0.5), 0.9 + k * 0.7, Math.PI / 2); }
      hb(2, f * hw, 0.5, f * (hw - 0.8), 3.0, 0.6);
      const T = new Parts(); table(T, 0.8, 0.6, 0.74); put(2, T, s * 0.9, wP - 1.7); hb(2, s * 0.9 - 0.4, wP - 2.0, s * 0.9 + 0.4, wP - 1.4, 0.74); const V = new Parts(); teabowl(V, 0, 0.74, 0); put(2, V, s * 0.9, wP - 1.7);
      for (const d of [-1, 1]) { const Ch = new Parts(); chair(Ch); put(2, Ch, s * 0.9 + d * 0.7, wP - 1.7, face(-d, 0)); hb(2, s * 0.9 + d * 0.7 - 0.28, wP - 1.98, s * 0.9 + d * 0.7 + 0.28, wP - 1.42, 1.0); }
      person(2, s * 0.9 + 0.7, wP - 1.7, -1, 0, man(rr, { pose: 'sit', dress: 'robe', hat: 'cap' }));
    },
    pawn: () => {   // the strong room: iron-bound chests and the pledged goods in labelled bundles on a rack
      for (let k = 0; k < 3; k++) { const Pc = new Parts(); chest(Pc, 1.0, 0.5, 0.6); put(2, Pc, f * (hw - 0.35), 1.0 + k * 1.15, face(-f, 0)); hb(2, f * hw, 1.0 + k * 1.15 - 0.55, f * (hw - 0.65), 1.0 + k * 1.15 + 0.55, 0.6); const Pk = new Parts(); chest(Pk, 0.8, 0.45, 0.45); put(2, Pk, f * (hw - 0.35), 1.0 + k * 1.15, face(-f, 0), 0.64); }
      { const Pr = new Parts(); for (const sx of [-1, 1]) Pr.add('timber', box(sx * 0.9 - 0.03, 0, -0.2, sx * 0.9 + 0.03, 1.9, 0.2)); for (const yy of [0.5, 1.0, 1.5]) Pr.add('timber', box(-0.9, yy - 0.02, -0.2, 0.9, yy + 0.02, 0.2)); for (let k = 0; k < 8; k++) Pr.add(['cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_red'][k % 4], box(-0.8 + (k % 4) * 0.42, [0.52, 1.02, 1.52][k >> 2 > 1 ? 2 : (k >> 2)] , -0.15, -0.5 + (k % 4) * 0.42, [0.52, 1.02, 1.52][k >> 2 > 1 ? 2 : (k >> 2)] + 0.3, 0.15));
        put(2, Pr, s * 0.9, wP - 0.3, Math.PI); hb(2, s * 0.9 - 0.95, wP - 0.55, s * 0.9 + 0.95, wP - 0.05, 1.9); }
      person(2, s * 0.9, wP - 1.2, 0, 1, man(rr, { pose: 'stand', hat: 'cap' }));
    },
    inn: () => {   // a guest room on the street, with a tea table
      const Pb = new Parts(); bed(Pb); put(2, Pb, f * (hw - 0.65), 1.6, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * hw, 1.05, f * (hw - 1.25), 3.15, 1.95);
      const T = new Parts(); table(T, 0.7, 0.5, 0.74); put(2, T, s * 0.9, wP - 1.5); hb(2, s * 0.9 - 0.35, wP - 1.75, s * 0.9 + 0.35, wP - 1.25, 0.74); const V = new Parts(); teabowl(V, 0, 0.74, 0); teabowl(V, 0.2, 0.74, 0.04); put(2, V, s * 0.9, wP - 1.5);
      for (const d of [-1, 1]) { const St = new Parts(); stool(St); put(2, St, s * 0.9 + d * 0.65, wP - 1.5); hb(2, s * 0.9 + d * 0.65 - 0.2, wP - 1.7, s * 0.9 + d * 0.65 + 0.2, wP - 1.3, 0.44); }
      person(2, s * 0.9 + 0.65, wP - 1.5, -1, 0, man(rr, { pose: 'sit', dress: 'robe', hat: 'cap' }));
    },
    tenement: () => {   // the family's one room over the street: a pallet bed, a chest, the cooking brazier and a table by the window
      const Pb = new Parts(); pallet(Pb, 'cloth_indigo'); put(2, Pb, f * (hw - 0.5), 1.5, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * hw, 1.05, f * (hw - 1.0), 2.95, 0.4);
      const Pc = new Parts(); chest(Pc, 0.9, 0.45, 0.5); put(2, Pc, f * (hw - 0.3), 3.4, face(-f, 0)); hb(2, f * hw, 2.95, f * (hw - 0.55), 3.85, 0.5);
      const Pr = new Parts(); brazier(Pr, 0, 0, 0); put(2, Pr, s * 0.8, wP - 1.3); hb(2, s * 0.8 - 0.2, wP - 1.5, s * 0.8 + 0.2, wP - 1.1, 0.25);
      const Pj = new Parts(); basket(Pj, 0, 0, 0.28, 0.32, 'cloth_green'); put(2, Pj, s * 0.8 + 0.9, wP - 1.3);
      person(2, s * 0.8 - 0.6, wP - 1.5, 1, 0, woman(rr, { pose: 'stand' }));
    },
    weaver: () => {   // the silkworm room: racks of trays against the walls, the reeling by the window
      for (let k = 0; k < 2; k++) { const Pt = new Parts(); trayRack(Pt, k); put(2, Pt, f * (hw - 0.4), 1.4 + k * 1.5, face(-f, 0) + Math.PI / 2 * 0 ); hb(2, f * hw, 1.4 + k * 1.5 - 0.5, f * (hw - 0.8), 1.4 + k * 1.5 + 0.5, 1.8); }
      { const Pr = new Parts(); reeling(Pr); put(2, Pr, s * 1.2, 2.6, Math.PI / 2 * -1); hb(2, s * 1.2 - 0.5, 2.1, s * 1.2 + 0.5, 3.4, 0.9); }
      person(2, s * 1.2 + 1.1, 2.7, -1, 0, woman(rr, { pose: 'stand' }));
    },
    merchant: () => {   // the upper room of reception, over the street: a couch, a table with the chairs, the qin and the scrolls, a view onto the loggia
      const Pc = new Parts(); couch(Pc, 1.9, 0.95); put(2, Pc, f * (hw - 0.55), 1.8, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * (hw - 1.05), 0.8, f * hw, 2.8, 0.98);
      const Pq = new Parts(); qinTable(Pq); put(2, Pq, f * (hw - 0.3), 3.45, face(-f, 0)); hb(2, f * hw, 3.2, f * (hw - 0.45), 3.7, 0.55);
      for (let k = 0; k < 2; k++) { const Ps = new Parts(); scroll(Ps, 0, 0, 0, 0.45, 1.4, seed + 5 + k); put(2, Ps, f * (hw - 0.04), 1.2 + k * 1.2, face(-f, 0) * 1, 0.9); }
      const T = new Parts(); table(T, 0.8, 0.6, 0.74); put(2, T, s * 0.9, wP - 1.5); hb(2, s * 0.9 - 0.4, wP - 1.8, s * 0.9 + 0.4, wP - 1.2, 0.74); const V = new Parts(); teabowl(V, -0.1, 0.74, 0); teabowl(V, 0.12, 0.74, 0); put(2, V, s * 0.9, wP - 1.5);
      for (const d of [-1, 1]) { const Ch = new Parts(); chair(Ch); put(2, Ch, s * 0.9 + d * 0.7, wP - 1.5, face(-d, 0)); hb(2, s * 0.9 + d * 0.7 - 0.28, wP - 1.78, s * 0.9 + d * 0.7 + 0.28, wP - 1.22, 1.0); }
      person(2, s * 0.9 + 0.7, wP - 1.5, -1, 0, man(rr, { pose: 'sit', dress: 'robe', hat: 'cap' }));
    },
    craftsman: () => {   // the workroom: paper and lanterns drying on lines, a bench of frames
      { const Ps = new Parts(); sheets(Ps, 2.0, 5); put(2, Ps, s * 1.5, 2.4); hb(2, s * 1.5 - 1.05, 2.35, s * 1.5 + 1.05, 2.45, 1.9); }
      { const Pl = new Parts(); for (let k = 0; k < 5; k++) lantern(Pl, -0.8 + k * 0.4, 2.7, 0, 'lamp_paper'); put(2, Pl, s * 1.5, 3.3); }
      { const T = new Parts(); table(T, 1.5, 0.7, 0.8); put(2, T, s * 1.5, wP - 1.2); hb(2, s * 1.5 - 0.75, wP - 1.55, s * 1.5 + 0.75, wP - 0.85, 0.8); const Q = new Parts(); for (let k = 0; k < 3; k++) Q.add('timber', box(-0.5 + k * 0.4, 0.8, -0.18, -0.2 + k * 0.4, 0.87, 0.18)); put(2, Q, s * 1.5, wP - 1.2); }
      person(2, s * 1.5, wP - 2.0, 0, 1, man(rr, { pose: 'stand', hat: 'cap' }));
    },
  };
  (frontUp[kind] || frontUp.shop)();
  // the rear room upstairs
  if (kind === 'weaver') { sleeping(); }
  else if (kind === 'tenement') { const Pb = new Parts(); pallet(Pb, 'cloth_red'); put(2, Pb, f * (hw - 0.5), WS + 1.5, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * hw, WS + 1.05, f * (hw - 1.0), WS + 2.95, 0.4); const Pb2 = new Parts(); pallet(Pb2, 'cloth_ochre'); put(2, Pb2, f * (hw - 0.5), WS + 3.2, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * hw, WS + 2.75, f * (hw - 1.0), WS + 3.65, 0.4); const Pj = new Parts(); jar(Pj, 0, 0, 1.0); put(2, Pj, f * (hw - 0.5), WS + 0.5); hb(2, f * (hw - 0.5) - 0.4, WS + 0.1, f * (hw - 0.5) + 0.4, WS + 0.9, 0.8); }
  else if (kind === 'craftsman') { const Pb = new Parts(); pallet(Pb, 'cloth_indigo'); put(2, Pb, f * (hw - 0.5), WS + 1.5, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * hw, WS + 1.05, f * (hw - 1.0), WS + 2.95, 0.4); const Pb2 = new Parts(); pallet(Pb2, 'cloth_brown'); put(2, Pb2, f * (hw - 0.5), WS + 3.2, f > 0 ? -Math.PI / 2 : Math.PI / 2); hb(2, f * hw, WS + 2.75, f * (hw - 1.0), WS + 3.65, 0.4); }
  else if (kind === 'pawn') { storage(3); }
  else if (kind === 'inn') { sleeping(); }
  else if (kind === 'merchant') { sleeping(); }
  else { sleeping(); }
  if (kind === 'shop') { /* the rear upstairs is the sleeping room */ }
  R.emit();
  return R.figs;
}
STYLES.life.elements.hz_upstairs_in = (el, ctx) => {
  const g0 = el.y ?? 0;
  let seen = 0;
  // (the ground floors keep no figures: the street life stands there, and their extra figure variants would add draws at the arrival)
  for (const fg of storeyIn(el, ctx)) { if (fg.y < g0 + 1 && seen++ >= GROUND_FIGS) continue; STYLES.life.elements.figure(fg, ctx); }
};

/** The rectangles of the music rooms: the ground floor's two rooms and the upper floor's, in the world. */
export function storeyRooms(l) {
  const S = storeySpec(l), Fm = frameOf(l, S), y = l.y ?? 0;
  return [[Fm.rect(-S.hw, TH, S.hw, S.wR), y + 0.45], [Fm.rect(-S.hw, TH, S.hw, S.wR), y + 0.45 + F2]];
}
export const STOREY = { H1, F2, UT, NT, RISE, TREAD, TH };
void bench; void limb;

/** The walk-check route of a lot: from the street through the door to the stair's foot, up to the landing, across the upper rear room, through the upper doorway to the front room and out on the loggia. */
export function storeyWalk(l) {
  const S = storeySpec(l), Fm = frameOf(l, S), { hw, s, wP, wR } = S, st = stairOf(S), as = s * (hw - 0.68);
  const pts = [[S.da, -1.8], [S.da, 0.9], [S.da * 0.3 + as * 0.7, wP - 2.0], [as, wP - 1.4], [as, st.wf0 + 0.15], [as, st.wf0 + NT * TREAD - 0.15], [as, wR - 0.65], [S.dp, wR - 0.65], [S.dp, wP + 0.9], [S.dp, wP - 0.7], [S.dp, 1.6], [S.ab, 1.2], [S.ab, -0.5]];
  return Object.assign(pts.map(([a, w]) => Fm.WC(a, w)), { y0: 0 });
}

/** The clear lane before each door (world rectangle): nothing of the street's life stands there. */
export function doorLanes(lots) {
  return lots.map((l) => { const S = storeySpec(l), Fm = frameOf(l, S); return Fm.rect(S.da - 1.4, -2.8, S.da + 1.4, 0.3); });
}

/** A rectangle of the street kept clear of the street life's figures and things (the engine reads every element's rect as a footprint); it builds nothing. */
STYLES.song.elements.hz_clear = () => {};
