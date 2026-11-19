// A canal house of Ming Suzhou whose upper floor can be climbed (docs/settlements/ming-suzhou.md §6,
// "Upstairs"). It stands in for the style's `house_jiangnan` where the plan names a lot of uphouses.js: the same
// plinth, plaster walls in two bands, shop front or lattice front, roof (gable, stepped horse-head gable, hip),
// but built whole here so that the inside is real: a floor of boards on joists with the stairwell cut in it, the
// steep timber stair along the side wall (risers closed by boards, a handrail), the upper storey's front with
// open window reveals (a lower lattice, the upper casement propped open) and a door to the gallery (deck, rail,
// posts and the roof's eave over it, over the street), a partition with a doorway, the rooms furnished by use
// (rooms.js). Everything is gathered per material into one geometry per house; repeated pieces vary by the
// house's own seed. Colliders: floors (the ramp of the stair, the floor with its hole, the deck), walls, rails,
// furniture.

import { fromTriangles, lathe, orientOutward } from '../../core/geom.js';
import { beamTris } from '../../styles/ming/index.js';
import { D_FRONT as V0, U_FRONT as UF, GALLERY, RISERS, TREAD, STAIR, layoutOf, frameOf, backDoor } from './uphouses.js';
import { groundFit, upperFit } from './rooms.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TONES = { white: ['plaster_white', 'plaster_damp'], grey: ['plaster_grey', 'plaster_damp'], patched: ['plaster_white', 'plaster_damp'], damp: ['plaster_damp', 'granite_grey'] };

/** Triangles turned to face along dir. */
function facing(arr, dir) {
  const o = [];
  for (let i = 0; i < arr.length; i += 9) {
    const ux = arr[i + 3] - arr[i], uy = arr[i + 4] - arr[i + 1], uz = arr[i + 5] - arr[i + 2], vx = arr[i + 6] - arr[i], vy = arr[i + 7] - arr[i + 1], vz = arr[i + 8] - arr[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * dir[0] + ny * dir[1] + nz * dir[2] >= 0) o.push(...arr.slice(i, i + 9)); else o.push(...arr.slice(i, i + 3), ...arr.slice(i + 6, i + 9), ...arr.slice(i + 3, i + 6));
  }
  return o;
}
/** The 12 triangles of an axis-aligned box. */
function boxT(x0, y0, z0, x1, y1, z1, noBottom = false) {
  const c = (x, y, z) => [x, y, z], q = [], f = (a, b, d, e) => q.push(...a, ...b, ...d, ...a, ...d, ...e);
  const p = [c(x0, y0, z0), c(x1, y0, z0), c(x1, y0, z1), c(x0, y0, z1), c(x0, y1, z0), c(x1, y1, z0), c(x1, y1, z1), c(x0, y1, z1)];
  f(p[4], p[7], p[6], p[5]); if (!noBottom) f(p[0], p[1], p[2], p[3]); f(p[0], p[4], p[5], p[1]); f(p[2], p[6], p[7], p[3]); f(p[1], p[5], p[6], p[2]); f(p[3], p[7], p[4], p[0]);
  return orientOutward(q);
}

export function houseUp(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const y = el.y ?? 0, mir = !!el.mir, use = el.use, F = frameOf(el.rect, mir, el.front || 's'), L = F.L, D = F.D;
  const lay = layoutOf(L), water = !!el.water;
  const W = (a, b, yy) => { const p = F.at(a, b); return [p[0], yy, p[1]]; };
  const dirU = (s) => [s * F.u[0], 0, s * F.u[1]], dirV = (s) => [s * F.v[0], 0, s * F.v[1]];
  const acc = new Map();
  const put = (mat, arr) => { let A = acc.get(mat); if (!A) acc.set(mat, A = []); for (let i = 0; i < arr.length; i++) A.push(arr[i]); };
  const wr = (a0, b0, a1, b1) => { const p = W(a0, b0, 0), q = W(a1, b1, 0); return [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]; };
  /** A box in the house's frame. */
  // (a box standing on a floor has no bottom face to draw: floor0 and floor1 are the two floors' heights, set below)
  let floor0 = -99, floor1 = -99;
  const B = (a0, b0, a1, b1, ya, yb, mat) => { if (a1 - a0 < 1e-4 || b1 - b0 < 1e-4 || yb - ya < 1e-4) return; const r = wr(a0, b0, a1, b1); put(mat, boxT(r[0], ya, r[1], r[2], yb, r[3], Math.abs(ya - floor0) < 1e-4 || Math.abs(ya - floor1) < 1e-4)); };
  const blk = (a0, b0, a1, b1, ya, yb) => col.rect(wr(a0, b0, a1, b1), ya, yb);
  const flr = (a0, b0, a1, b1, yy) => col.floor(wr(a0, b0, a1, b1), yy);
  const quad4 = (mat, P, dir) => put(mat, facing([...P[0], ...P[1], ...P[2], ...P[0], ...P[2], ...P[3]], dir));
  /** A vertical film in the plane b, facing the street (−1) or the back. */
  const qF = (mat, a0, a1, ya, yb, b, side = -1) => quad4(mat, [W(a0, b, ya), W(a1, b, ya), W(a1, b, yb), W(a0, b, yb)], dirV(side));
  /** A lathe piece (pots, lamps) standing at (a, b, yy): its triangles join the material's geometry. */
  const lat = (mat, profile, seg, a, b, yy, sx = 1, sz = 1) => {
    const p = W(a, b, yy), g = lathe(profile, seg, null, 0, 0, 0), arr = g.attributes.position.array, o = [];
    for (let i = 0; i < arr.length; i += 3) o.push(p[0] + arr[i] * sx, p[1] + arr[i + 1], p[2] + arr[i + 2] * sz);
    put(mat, o);
  };
  /** A thin slab: the quad A B C D (in order) given thickness th along its normal (for tilted leaves and props). */
  const slab = (mat, A, Bq, C, Dq, th) => {
    const ux = Bq[0] - A[0], uy = Bq[1] - A[1], uz = Bq[2] - A[2], vx = Dq[0] - A[0], vy = Dq[1] - A[1], vz = Dq[2] - A[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx *= th / l; ny *= th / l; nz *= th / l;
    const pts = [A, Bq, C, Dq].flatMap((p) => [p, [p[0] + nx, p[1] + ny, p[2] + nz]]);
    const q = [], f = (a, b, c, d) => q.push(...pts[a], ...pts[b], ...pts[c], ...pts[a], ...pts[c], ...pts[d]);
    f(0, 2, 4, 6); f(1, 7, 5, 3); f(0, 1, 3, 2); f(2, 3, 5, 4); f(4, 5, 7, 6); f(6, 7, 1, 0);
    put(mat, orientOutward(q));
  };

  const y0 = y + 0.45, Hf = el.Hf ?? 3.3, Hu = el.Hu ?? 2.75, Y1 = y0 + Hf, Y2 = Y1 + Hu;
  floor0 = y0; floor1 = Y1;
  const vb = D - 0.15, ibB = vb - 0.25, ibU = UF + 0.22;
  const [wallMat, bandMat] = TONES[el.tone || 'white'] || TONES.white;
  const roofMat = rand() < 0.22 ? 'tile_grey' : 'tile_dark';
  const shopFront = el.shopFront !== false && ['rice', 'inn', 'cloth', 'medicine', 'books', 'lacquer', 'wine', 'pawn', 'food', 'silk', 'pottery', 'iron', 'fans', 'teahouse', 'lodging', 'grocer', 'tinsmith', 'jade', 'printer'].includes(use);
  const openFront = use === 'inn' || use === 'teahouse' || use === 'lodging';                  // (the tea room and the inn's hall are open to the street, a counter at one end)
  const wall = (a0, b0, a1, b1, ya, yb) => { const m = Math.min(yb, ya + 0.95); B(a0, b0, a1, b1, ya, m, bandMat); if (yb > m) B(a0, b0, a1, b1, m, yb, wallMat); };

  // ── the ground: plinth, brick floor, doorstep ──
  B(0, V0 - 0.12, L, vb, y - 0.4, y0 - 0.02, 'granite_block');
  B(0.25, V0 + 0.15, L - 0.25, ibB, y0 - 0.02, y0, 'brick_grey');
  B(-0.02, V0 - 0.14, L + 0.02, V0 + 0.15, y0 - 0.14, y0 + 0.04, 'granite_grey');     // the plinth's cap, a little proud, along the front
  for (const [a0, a1] of [[-0.02, 0.27], [L - 0.27, L + 0.02]]) B(a0, V0 - 0.14, a1, vb + 0.02, y0 - 0.14, y0 + 0.04, 'granite_grey');
  B(-0.02, vb - 0.27, L + 0.02, vb + 0.02, y0 - 0.14, y0 + 0.04, 'granite_grey');
  col.rect(wr(0, V0 - 0.12, L, vb), y - 0.4, y + 0.2);
  flr(0.25, V0 + 0.0, L - 0.25, ibB, y0);
  B(lay.dc - 0.75, V0 - 0.55, lay.dc + 0.75, V0 - 0.14, y - 0.2, y + 0.22, 'granite_grey');    // the step up from the street
  flr(lay.dc - 0.75, V0 - 0.55, lay.dc + 0.75, V0 - 0.14, y + 0.22);

  // ── walls: both sides and the back, to the eaves ──
  for (const [a0, a1] of [[0, 0.25], [L - 0.25, L]]) { wall(a0, V0, a1, vb, y0, Y1); B(a0, UF, a1, vb, Y1, Y2, wallMat); blk(a0, V0, a1, vb, y - 0.4, Y2 + 0.2); }
  // a waterside house has its back door on the canal (backDoor, uphouses.js): the wall is cut for it
  const bk = water ? backDoor(L, D) : null;
  if (bk) {
    for (const [a0, a1] of [[0.25, bk.a0], [bk.a1, L - 0.25]]) { wall(a0, vb - 0.25, a1, vb, y0, Y1); blk(a0, vb - 0.25, a1, vb, y - 0.4, Y1 + 0.2); }
    B(bk.a0, vb - 0.25, bk.a1, vb, y0 + 2.2, Y1, wallMat); blk(bk.a0, vb - 0.25, bk.a1, vb, y0 + 2.2, Y1 + 0.2); blk(bk.a0, vb - 0.25, bk.a1, vb, y - 0.4, y0);
    B(0.25, vb - 0.25, L - 0.25, vb, Y1, Y2, wallMat); blk(0.25, vb - 0.25, L - 0.25, vb, Y1, Y2 + 0.2);
  } else { wall(0.25, vb - 0.25, L - 0.25, vb, y0, Y1); B(0.25, vb - 0.25, L - 0.25, vb, Y1, Y2, wallMat); blk(0.25, vb - 0.25, L - 0.25, vb, y - 0.4, Y2 + 0.2); }
  // a window high in the back wall, to the lane, downstairs and up (a waterside house: the door lights the ground floor)
  for (const [yy0, yy1, a] of [[y0 + 1.5, y0 + 2.3, bk ? -9 : L * 0.55], [Y1 + 0.8, Y1 + 2.0, L * 0.5]]) { if (a < 0) continue; B(a - 0.5, vb, a + 0.5, vb + 0.05, yy0, yy1, 'lattice'); B(a - 0.58, vb, a + 0.58, vb + 0.08, yy0 - 0.08, yy0, 'granite_grey'); }
  if (bk) {
    // the doorway: jambs, lintel, a worn sill, the leaf folded back against the wall inside; outside, the deck over the canal wall and the water
    // on posts to the canal's bed, its rail, and the flight of granite steps laid along the wall down to the slab just above the water
    for (const a of [bk.a0 - 0.1, bk.a1]) B(a, vb - 0.28, a + 0.1, vb + 0.03, y0, y0 + 2.2, 'lacquer_chestnut');
    B(bk.a0 - 0.1, vb - 0.28, bk.a1 + 0.1, vb + 0.03, y0 + 2.2, y0 + 2.32, 'lacquer_chestnut');
    B(bk.a0, vb - 0.27, bk.a1, vb + 0.02, y0, y0 + 0.04, 'granite_grey');
    B(bk.a1 + 0.02, vb - 0.33, bk.a1 + 0.6, vb - 0.3, y0 + 0.04, y0 + 2.1, 'lacquer_chestnut');
    const dk = y0 - 0.03, dx0 = bk.deck[0], dx1 = bk.deck[1], db0 = vb + 0.02, db1 = vb + bk.deck[2];
    B(dx0, db0, dx1, db1, dk - 0.1, dk, 'timber'); flr(dx0, db0, dx1, db1, dk);
    B(dx0, db1 - 0.12, dx1, db1, dk - 0.32, dk - 0.1, 'lacquer_chestnut');
    for (const a of [dx0 + 0.07, dx1 - 0.07]) { B(a - 0.06, db1 - 0.1, a + 0.06, db1 + 0.02, y - 2.6, dk - 0.1, 'lacquer_chestnut'); blk(a - 0.06, db1 - 0.1, a + 0.06, db1 + 0.02, y - 2.6, dk); }
    // the rail round the deck's water side and its east end (the west end is open to the steps): a rail, a lattice panel, posts
    const rl = (a0, b0, a1, b1) => { B(a0, b0, a1, b1, dk + 0.84, dk + 0.92, 'lacquer_chestnut'); B(a0 + 0.015, b0 + 0.02, a1 - 0.015, b1 - 0.02, dk + 0.22, dk + 0.84, 'lattice_ice'); B(a0, b0, a1, b1, dk + 0.14, dk + 0.22, 'lacquer_chestnut'); blk(a0, b0, a1, b1, dk, dk + 1.0); };
    rl(dx0, db1 - 0.08, dx1, db1); rl(dx1 - 0.08, db0 + 0.05, dx1, db1 - 0.08);
    for (const [a, b] of [[dx0 + 0.04, db1 - 0.04], [dx1 - 0.04, db1 - 0.04], [dx1 - 0.04, db0 + 0.1]]) B(a - 0.05, b - 0.05, a + 0.05, b + 0.05, dk, dk + 0.98, 'lacquer_chestnut');
    // the steps: n treads from the deck's level to the slab, each a block from the foot of the wall up, a run of bk.run along the wall, going down toward a = 0
    const n = bk.n, land = bk.land - y, rise = (dk - (y + land)) / n, wf = -1.45;
    const b0 = vb + 0.5, b1 = vb + 1.55;
    for (let k = 0; k < n; k++) {
      const top = dk - rise * (k + 1), s1 = bk.aS - k * bk.run, s0 = s1 - bk.run;
      B(s0, b0, s1, b1, wf, top, 'granite_grey'); flr(s0, b0, s1, b1, top);
    }
    const sl0 = bk.aS - n * bk.run - bk.slab, sl1 = bk.aS - n * bk.run;
    B(sl0, b0, sl1, b1, wf, y + land, 'granite_grey'); flr(sl0, b0, sl1, b1, y + land);
  }

  // ── the ground floor's front ──
  const dc = lay.dc, d0 = dc - 0.6, d1 = dc + 0.6;
  B(0, V0 - 0.04, 0.25, V0 + 0.2, y0, Y1 - 0.4, 'lacquer_chestnut'); B(L - 0.25, V0 - 0.04, L, V0 + 0.2, y0, Y1 - 0.4, 'lacquer_chestnut');
  B(0, V0 - 0.02, L, V0 + 0.15, Y1 - 0.4, Y1 - 0.05, 'lacquer_chestnut');                   // the beam the floor above and the gallery lie on
  blk(0, V0 - 0.04, 0.25, V0 + 0.2, y0, Y1); blk(L - 0.25, V0 - 0.04, L, V0 + 0.2, y0, Y1);
  B(d0 - 0.1, V0 - 0.04, d0, V0 + 0.2, y0, Y1 - 0.4, 'lacquer_chestnut'); B(d1, V0 - 0.04, d1 + 0.1, V0 + 0.2, y0, Y1 - 0.4, 'lacquer_chestnut');
  blk(d0 - 0.1, V0 - 0.04, d0, V0 + 0.2, y0, Y1); blk(d1, V0 - 0.04, d1 + 0.1, V0 + 0.2, y0, Y1);
  const span0 = 0.25, span1 = d0 - 0.1, sw = span1 - span0;
  if (shopFront) {
    const cEnd = openFront ? Math.min(span1, 3.0) : span1;
    B(span0, V0, cEnd, V0 + 0.14, y0, y0 + 0.95, 'timber'); B(span0, V0 - 0.1, cEnd, V0 + 0.2, y0 + 0.95, y0 + 1.0, 'wood_dark');
    B(span0, V0 - 0.02, cEnd, V0, y0 + 0.2, y0 + 0.9, 'wood_dark');
    blk(span0, V0 - 0.1, cEnd, V0 + 0.2, y0, y0 + 1.0);
    const npost = Math.max(0, Math.round(sw / 2.4) - 1);
    for (let k = 1; k <= npost; k++) { const a = span0 + sw * k / (npost + 1); B(a - 0.1, V0 - 0.04, a + 0.1, V0 + 0.2, y0, Y1 - 0.4, 'lacquer_chestnut'); blk(a - 0.1, V0 - 0.04, a + 0.1, V0 + 0.2, y0, Y1); }
    if (cEnd < span1 - 0.05) { B(cEnd, V0 - 0.04, cEnd + 0.2, V0 + 0.2, y0, Y1 - 0.4, 'lacquer_chestnut'); blk(cEnd, V0 - 0.04, cEnd + 0.2, V0 + 0.2, y0, Y1); }
  } else {
    // a house's front: lattice doors between posts on a dado of boards, the door leaf folded back at the doorway
    const n = Math.max(1, Math.round(sw / 1.2)), pw = sw / n;
    for (let k = 0; k < n; k++) {
      const a0 = span0 + pw * k + 0.05, a1 = span0 + pw * (k + 1) - 0.05;
      B(a0, V0, a1, V0 + 0.08, y0, y0 + 0.85, 'timber'); B(a0, V0, a1, V0 + 0.08, y0 + 0.85, Y1 - 0.4, k % 3 === 1 ? 'lattice_ice' : 'lattice');
      blk(a0 - 0.05, V0 - 0.02, a1 + 0.05, V0 + 0.1, y0, Y1);
      B(a1, V0 - 0.04, a1 + 0.1, V0 + 0.2, y0, Y1 - 0.4, 'lacquer_chestnut');
    }
  }
  B(d1 + 0.1, V0 + 0.02, d1 + 0.14, V0 + 0.62, y0, Y1 - 0.5, 'lacquer_chestnut');           // the door leaf folded back against the wall
  B(d0 - 0.14, V0 + 0.02, d0 - 0.1, V0 + 0.62, y0, Y1 - 0.5, 'lacquer_chestnut');

  // ── the stair: sixteen risers, closed with boards, a rail on its open side ──
  const S = STAIR, riser = Hf / RISERS, bh0 = S.b0 + Math.ceil((Hf - 2.05) / riser) * TREAD, bs1 = S.b1;
  for (let k = 0; k < RISERS - 1; k++) {
    const ba = S.b0 + k * TREAD, bb = ba + TREAD, top = y0 + (k + 1) * riser;
    qF('wood_dark', S.a0, S.a1 - 0.07, y0 + k * riser, top, ba, -1);                                           // the riser board, facing down the stair
    put('timber', facing([...W(S.a0, ba, top), ...W(S.a1 - 0.07, ba, top), ...W(S.a1 - 0.07, bb, top), ...W(S.a0, ba, top), ...W(S.a1 - 0.07, bb, top), ...W(S.a0, bb, top)], [0, 1, 0]));
    // the open side: a closed string of dark boards
    put('wood_dark', facing([...W(S.a1 - 0.07, ba, y0), ...W(S.a1 - 0.07, bb, y0), ...W(S.a1 - 0.07, bb, top), ...W(S.a1 - 0.07, ba, y0), ...W(S.a1 - 0.07, bb, top), ...W(S.a1 - 0.07, ba, top)], dirU(1)));
  }
  qF('wood_dark', S.a0, S.a1 - 0.07, y0 + (RISERS - 1) * riser, Y1, bs1, -1);
  const rise = (b) => y0 + 0.5 * riser + (b - S.b0) * riser / TREAD;                       // the line through the treads' middles
  {
    const rl = [], bz = bs1 - 0.2;
    beamTris(rl, W(S.a1 - 0.03, S.b0 + 0.1, rise(S.b0 + 0.1) + 0.95), W(S.a1 - 0.03, bz, rise(bz) + 0.95), 0.03, 0.06);
    put('lacquer_chestnut', rl);
    for (const b of [S.b0 + 0.1, S.b0 + 0.9, S.b0 + 1.7, bz]) B(S.a1 - 0.06, b - 0.03, S.a1, b + 0.03, rise(b) - 0.1, rise(b) + 1.0, 'lacquer_chestnut');
    for (let b = S.b0 + 0.5; b < bz - 0.2; b += 0.4) B(S.a1 - 0.05, b - 0.012, S.a1 - 0.02, b + 0.012, rise(b) - 0.05, rise(b) + 0.92, 'lacquer_chestnut');
    blk(S.a1 - 0.06, S.b0 + 0.1, S.a1, bs1 - 0.5, y0, Y1 + 1.0);
  }
  col.ramp(wr(S.a0 + 0.05, S.b0, S.a1 - 0.07, bs1 - 0.5 * TREAD), y0 + 0.5 * riser, Y1, 'n');                                  // (it rises with b, toward −z: 'n')

  // ── the upper floor: boards on joists, the stairwell cut out, a trimmer round it ──
  const slabRect = (a0, b0, a1, b1) => { B(a0, b0, a1, b1, Y1 - 0.05, Y1, 'timber'); flr(a0, b0, a1, b1, Y1); };
  slabRect(S.a1, V0, L - 0.25, ibB);
  slabRect(0.25, V0, S.a1, bh0); slabRect(0.25, bs1 - 0.02, S.a1, ibB);
  B(S.a1, bh0, S.a1 + 0.1, bs1, Y1 - 0.25, Y1 - 0.05, 'lacquer_chestnut'); B(0.25, bh0 - 0.1, S.a1 + 0.1, bh0, Y1 - 0.25, Y1 - 0.05, 'lacquer_chestnut');
  for (let a = 0.6; a < L - 0.3; a += 0.7) if (a < S.a0 - 0.1 || a > S.a1 + 0.2) B(a - 0.06, V0 + 0.15, a + 0.06, ibB, Y1 - 0.21, Y1 - 0.05, 'wood_dark');
  for (let a = S.a0 + 0.3; a < S.a1; a += 0.35) { B(a - 0.05, V0 + 0.15, a + 0.05, bh0 - 0.1, Y1 - 0.21, Y1 - 0.05, 'wood_dark'); B(a - 0.05, bs1, a + 0.05, ibB, Y1 - 0.21, Y1 - 0.05, 'wood_dark'); }
  // a rail round the stairwell: along its side (broken above the stair's top three steps) and across its foot
  {
    const rl = [], bEnd = bs1 - 0.55;
    beamTris(rl, W(S.a1 + 0.05, bh0, Y1 + 0.92), W(S.a1 + 0.05, bEnd, Y1 + 0.92), 0.035, 0.06);
    beamTris(rl, W(S.a0, bh0, Y1 + 0.92), W(S.a1 + 0.05, bh0, Y1 + 0.92), 0.035, 0.06);
    put('lacquer_chestnut', rl);
    for (const [a, b] of [[S.a1 + 0.05, bh0], [S.a1 + 0.05, bEnd], [S.a0 + 0.04, bh0], [(S.a0 + S.a1) / 2, bh0], [S.a1 + 0.05, (bh0 + bEnd) / 2]]) B(a - 0.035, b - 0.035, a + 0.035, b + 0.035, Y1, Y1 + 0.95, 'lacquer_chestnut');
    for (let b = bh0 + 0.12; b < bEnd - 0.05; b += 0.18) B(S.a1 + 0.035, b - 0.012, S.a1 + 0.065, b + 0.012, Y1, Y1 + 0.9, 'lacquer_chestnut');
    for (let a = S.a0 + 0.12; a < S.a1; a += 0.18) B(a - 0.012, bh0 - 0.012, a + 0.012, bh0 + 0.012, Y1, Y1 + 0.9, 'lacquer_chestnut');
    blk(S.a1 + 0.02, bh0, S.a1 + 0.08, bEnd, Y1, Y1 + 1.0);
  }

  // ── the upper floor's front: wall with window reveals, the door to the gallery ──
  const vf = -GALLERY - 0.55, vbE = vb + 0.35, type = el.roof || 'gable', riseR = Math.max(0.9, (vb - V0 + 0.9) * 0.26) * (type === 'hip' ? 0.9 : 1);
  const vmR = (vf + vbE) / 2, profF = (vv) => { const t = vv <= vmR ? (vv - vf) / (vmR - vf) : (vbE - vv) / (vbE - vmR); return Y2 + riseR * Math.pow(Math.max(0, Math.min(1, t)), 1.35); };
  const wallTop = type === 'hip' ? Math.min(profF(UF) - 0.03, Y2 + 0.45) : profF(UF) - 0.03;
  const ya = Y1 + 0.78, yb = Y1 + 2.05, yd = Y1 + 2.2;
  const open = [...lay.wins.map((w) => ({ a0: w.ac - w.w / 2, a1: w.ac + w.w / 2, ya, yb, win: true })), { a0: lay.du - 0.6, a1: lay.du + 0.6, ya: Y1, yb: yd }].sort((p, q) => p.a0 - q.a0);
  let cur = 0.25;
  const fw = (a0, a1, ylo, yhi) => B(a0, UF, a1, ibU, ylo, yhi, wallMat);
  for (const o of open) {
    if (o.a0 > cur) fw(cur, o.a0, Y1, wallTop);
    if (o.ya > Y1) fw(o.a0, o.a1, Y1, o.ya);
    fw(o.a0, o.a1, o.yb, wallTop);
    cur = o.a1;
  }
  fw(cur, L - 0.25, Y1, wallTop);
  for (const o of open) {
    if (o.win) {
      const { a0: wa0, a1: wa1 } = o, ac = (wa0 + wa1) / 2;
      B(wa0 - 0.07, UF - 0.05, wa1 + 0.07, UF + 0.01, ya - 0.1, ya, 'lacquer_chestnut'); B(wa0 - 0.07, UF - 0.05, wa1 + 0.07, UF + 0.01, yb, yb + 0.1, 'lacquer_chestnut');
      B(wa0 - 0.07, UF - 0.05, wa0, UF + 0.01, ya, yb, 'lacquer_chestnut'); B(wa1, UF - 0.05, wa1 + 0.07, UF + 0.01, ya, yb, 'lacquer_chestnut');
      B(wa0 - 0.12, UF - 0.1, wa1 + 0.12, UF + 0.02, ya - 0.18, ya - 0.1, 'granite_grey');                // the sill
      B(wa0, UF + 0.04, wa1, UF + 0.08, ya, ya + 0.42, 'lattice');                                          // the lower sash, fixed, paper behind lattice
      B(ac - 0.025, UF + 0.04, ac + 0.025, UF + 0.1, ya + 0.42, yb, 'lacquer_chestnut');
      // the upper sash propped open outward on a bamboo stick (zhi chuang): hinged at the head, its foot out
      const hx = UF - 0.05, hy = yb - 0.03, fx = hx - 0.62, fy = hy - 0.4;
      slab('lattice', W(wa0, hx, hy), W(wa1, hx, hy), W(wa1, fx, fy), W(wa0, fx, fy), 0.035);
      const sx = ac + 0.18; B(sx - 0.012, hx - 0.30, sx + 0.012, hx - 0.28, ya + 0.46, ya + 0.5, 'bamboo_culm');
      const st = []; beamTris(st, W(sx, UF - 0.02, ya + 0.44), W(sx, fx + 0.02, fy - 0.03), 0.012, 0.024); put('bamboo_culm', st);
      blk(wa0, UF, wa1, ibU, Y1 - 0.4, Y2);
    } else {
      B(o.a0 - 0.08, UF - 0.06, o.a0, ibU, Y1, yd + 0.08, 'lacquer_chestnut'); B(o.a1, UF - 0.06, o.a1 + 0.08, ibU, Y1, yd + 0.08, 'lacquer_chestnut');
      B(o.a0 - 0.08, UF - 0.06, o.a1 + 0.08, ibU, yd, yd + 0.1, 'lacquer_chestnut');
      B(o.a0 - 0.02, ibU, o.a0 + 0.02, ibU + 0.5, Y1, yd - 0.1, 'lattice'); B(o.a1 - 0.02, ibU, o.a1 + 0.02, ibU + 0.5, Y1, yd - 0.1, 'lattice');   // the leaves folded back
    }
  }
  { let c = 0.25;
    for (const o of open) { if (o.a0 > c) blk(c, UF, o.a0, ibU, Y1 - 0.4, Y2); if (o.win) blk(o.a0, UF, o.a1, ibU, Y1 - 0.4, Y2); else blk(o.a0, UF, o.a1, ibU, Y1 + 2.3, Y2); c = o.a1; }
    if (L - 0.25 > c) blk(c, UF, L - 0.25, ibU, Y1 - 0.4, Y2); }
  // ── the gallery over the street ──
  const [ga0, ga1] = lay.gal, gb = -GALLERY;
  B(ga0, gb, ga1, UF + 0.02, Y1 - 0.05, Y1, 'timber'); flr(ga0, gb, ga1, ibU + 0.25, Y1);
  for (let a = ga0 + 0.3; a < ga1 - 0.2; a += 0.75) if (Math.abs(a - L / 2) > 0.9) B(a - 0.07, gb + 0.15, a + 0.07, V0 + 0.1, Y1 - 0.4, Y1 - 0.05, 'lacquer_chestnut');   // beam ends under the deck
  B(ga0, gb, ga1, gb + 0.1, Y1 - 0.3, Y1 - 0.05, 'lacquer_chestnut');
  for (const a of [ga0 + 0.06, (ga0 + ga1) / 2, ga1 - 0.06]) { B(a - 0.06, gb + 0.02, a + 0.06, gb + 0.14, Y1, Y2 - 0.2, 'lacquer_chestnut'); }
  B(ga0, gb, ga1, gb + 0.15, Y2 - 0.2, Y2 - 0.05, 'lacquer_chestnut');
  B(ga0, gb + 0.05, ga1, gb + 0.12, Y1 + 0.88, Y1 + 0.96, 'lacquer_chestnut'); B(ga0, gb + 0.05, ga1, gb + 0.12, Y1 + 0.2, Y1 + 0.26, 'lacquer_chestnut');
  B(ga0, gb + 0.07, ga1, gb + 0.1, Y1 + 0.26, Y1 + 0.88, 'lattice_ice');
  for (const a of [ga0, ga1 - 0.07]) { B(a, gb + 0.05, a + 0.07, UF, Y1 + 0.88, Y1 + 0.96, 'lacquer_chestnut'); B(a, gb + 0.05, a + 0.07, UF, Y1 + 0.2, Y1 + 0.26, 'lacquer_chestnut'); }
  blk(ga0, gb, ga1, gb + 0.14, Y1, Y1 + 1.0); blk(ga0, gb, ga0 + 0.07, UF, Y1, Y1 + 1.0); blk(ga1 - 0.07, gb, ga1, UF, Y1, Y1 + 1.0);
  // the ends of the deck's rail are closed to the wall by the same rail; no gap but the door

  // ── the ceiling of the upper rooms (a flat boarded ceiling under the roof space) ──
  if (!el.cut) B(0.25, ibU, L - 0.25, ibB, Y2 - 0.06, Y2, 'timber');          // (el.cut: roof and ceiling left off, to look into the rooms in a render)
  if (!el.cut) for (let a = 0.9; a < L - 0.3; a += 1.15) B(a - 0.07, ibU, a + 0.07, ibB, Y2 - 0.2, Y2 - 0.06, 'lacquer_chestnut');

  // ── the roof (as the style's canal houses) ──
  const R = el.cut ? null : roofOf(type === 'hip' ? -0.25 : type === 'gable' ? -0.15 : 0, type === 'hip' ? L + 0.25 : type === 'gable' ? L + 0.15 : L, vf, vbE, Y2, riseR, type === 'hip' ? 'hip' : 'gable', 5);
  if (!el.cut) gables(R, { vf, vb: vbE, yE: Y2, rise: riseR, vw0: UF, vw1: vb }, type === 'hip' ? 'hip' : type);
  // the soffit under the front eave, from the wall to the eave's edge
  if (!el.cut) { const r0 = type === 'hip' ? -0.25 : type === 'gable' ? -0.15 : 0, r1 = type === 'hip' ? L + 0.25 : type === 'gable' ? L + 0.15 : L;
    quad4('timber', [W(r0, vf, Y2 - 0.14), W(r1, vf, Y2 - 0.14), W(r1, UF, Y2 - 0.14), W(r0, UF, Y2 - 0.14)], [0, -1, 0]);
    quad4('timber', [W(r0, vbE, Y2 - 0.14), W(r1, vbE, Y2 - 0.14), W(r1, vb, Y2 - 0.14), W(r0, vb, Y2 - 0.14)], [0, -1, 0]); }

  // ── the rooms ──
  const ctx = { B, F: B, latF: lat, blk, flr, put, lat, qF, W, wr, slab, quad4, rand, L, D, y0, Y1, Y2, lay, vb, ibB, ibU, S, bh0, use, el, wallMat, mir };
  if (lay.pa !== null) {
    const pa = lay.pa, [d0b, d1b] = lay.door;
    for (const [b0, b1] of [[ibU, d0b], [d1b, ibB]]) { B(pa - 0.06, b0, pa + 0.06, b1, Y1, Y2, 'timber'); blk(pa - 0.06, b0, pa + 0.06, b1, Y1, Y2); }
    B(pa - 0.06, d0b, pa + 0.06, d1b, Y1 + 2.1, Y2, 'timber'); B(pa - 0.09, d0b - 0.05, pa + 0.09, d0b, Y1, Y1 + 2.1, 'lacquer_chestnut'); B(pa - 0.09, d1b, pa + 0.09, d1b + 0.05, Y1, Y1 + 2.1, 'lacquer_chestnut');
    B(pa - 0.09, d0b - 0.05, pa + 0.09, d1b + 0.05, Y1 + 2.05, Y1 + 2.15, 'lacquer_chestnut');
  }
  groundFit(ctx);
  upperFit(ctx);
  for (const [mat, arr] of acc) if (arr.length) bag.add(mat, fromTriangles(arr));
  return { lay };

  // ── roof functions (after the canal houses of src/styles/ming, kept the same in form) ──
  function roofOf(a0, a1, vfx, vbx, yE, riseX, rtype, nt) {
    const vm = (vfx + vbx) / 2, hip = rtype === 'hip';
    let ra0 = a0, ra1 = a1;
    if (hip) { const ins = Math.min((vbx - vfx) / 2 - 0.1, (a1 - a0) / 2 - 0.2); ra0 = a0 + ins; ra1 = a1 - ins; }
    const yR = yE + riseX;
    const panel = (E0, E1, R0, R1) => {
      const P = (s, t) => { const ea = E0[0] + (E1[0] - E0[0]) * s, eb = E0[1] + (E1[1] - E0[1]) * s, ra = R0[0] + (R1[0] - R0[0]) * s, rb = R0[1] + (R1[1] - R0[1]) * s, k = Math.pow(t, 1.35); return W(ea + (ra - ea) * t, eb + (rb - eb) * t, yE + riseX * k); };
      const T = [];
      for (let i = 0; i < nt; i++) { const t0 = i / nt, t1 = (i + 1) / nt, p0 = P(0, t0), p1 = P(1, t0), p2 = P(1, t1), p3 = P(0, t1); T.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3); }
      put(roofMat, facing(T, [0, 1, 0]));
      return P;
    };
    panel([a0, vfx], [a1, vfx], [ra0, vm], [ra1, vm]); panel([a1, vbx], [a0, vbx], [ra1, vm], [ra0, vm]);
    if (hip) { panel([a0, vbx], [a0, vfx], [ra0, vm], [ra0, vm]); panel([a1, vfx], [a1, vbx], [ra1, vm], [ra1, vm]); }
    const fas = [];
    for (const [b, s] of [[vfx, -1], [vbx, 1]]) fas.push(...facing([...W(a0, b, yE - 0.14), ...W(a1, b, yE - 0.14), ...W(a1, b, yE + 0.03), ...W(a0, b, yE - 0.14), ...W(a1, b, yE + 0.03), ...W(a0, b, yE + 0.03)], dirV(s)));
    put(roofMat, fas);
    const rd = [];
    beamTris(rd, W(ra0, vm, yR - 0.04), W(ra1, vm, yR - 0.04), 0.1, 0.22);
    const du = dirU(1);
    if (!hip) for (const [a, sg] of [[ra0, -1], [ra1, 1]]) { const c = W(a + sg * 0.1, vm, yR); beamTris(rd, [c[0] - du[0] * sg * 0.22, yR + 0.1, c[2] - du[2] * sg * 0.22], [c[0] + du[0] * sg * 0.12, yR + 0.34, c[2] + du[2] * sg * 0.12], 0.07, 0.1); }
    if (hip) for (const [a0h, ra] of [[a0, ra0], [a1, ra1]]) for (const bb of [vfx, vbx]) beamTris(rd, W(ra, vm, yR - 0.04), W(a0h, bb, yE + 0.02), 0.07, 0.1);
    put(roofMat, rd);
    const prof = (vv) => { const t = vv <= vm ? (vv - vfx) / (vm - vfx) : (vbx - vv) / (vbx - vm); return yE + riseX * Math.pow(Math.max(0, Math.min(1, t)), 1.35); };
    return { prof, vm, yR };
  }
  function gables(Rr, o, gtype) {
    const { vf: vfx, vb: vbx, yE, rise: riseX, vw0, vw1 } = o, vm = Rr.vm;
    for (const [a, s] of [[0, -1], [L, 1]]) {
      if (gtype === 'hip') continue;
      const wa = s < 0 ? 0 : L - 0.26;
      if (gtype === 'gable') {
        const N = 5, T = [];
        for (let i = 0; i < N; i++) for (const [p, q] of [[vfx + (vm - vfx) * i / N, vfx + (vm - vfx) * (i + 1) / N], [vbx - (vbx - vm) * i / N, vbx - (vbx - vm) * (i + 1) / N]]) T.push(...W(a, p, yE - 0.02), ...W(a, q, yE - 0.02), ...W(a, q, Rr.prof(q) - 0.02), ...W(a, p, yE - 0.02), ...W(a, q, Rr.prof(q) - 0.02), ...W(a, p, Rr.prof(p) - 0.02));
        put(wallMat, facing(T, dirU(s)));
        continue;
      }
      // horse-head: steps from the eaves toward the ridge, each capped with tiles
      const ns = rand() < 0.5 ? 3 : 2, vs = [], vq = [];
      for (let k = 0; k <= ns; k++) { vs.push(vw0 + (vm - vw0) * k / ns); vq.push(vw1 - (vw1 - vm) * k / ns); }
      const topAt = (vv) => Rr.prof(vv) + 0.5, list = [];
      for (let k = 0; k < ns - 1; k++) { list.push([vs[k], vs[k + 1], topAt(vs[k + 1])]); list.push([vq[k + 1], vq[k], topAt(vq[k + 1])]); }
      list.push([vs[ns - 1], vq[ns - 1], Rr.yR + 0.5]);
      for (const [p, q, top] of list) { B(wa, p, wa + 0.26, q, yE - 0.3, top, wallMat); B(wa - 0.03, p - 0.02, wa + 0.29, q + 0.02, top, top + 0.1, roofMat); }
      for (const [p, sg] of [[vw0, 1], [vw1, -1]]) B(wa - 0.03, p - (sg > 0 ? 0.12 : -0.02), wa + 0.29, p + (sg > 0 ? -0.02 : 0.12), Rr.prof(p) + 0.5 - 0.02, Rr.prof(p) + 0.62, roofMat);
      // (the plain triangle fills the gap between the stepped wall and the eaves in front of it)
      const N = 4, T = [];
      for (const [p0, p1] of [[vfx, vw0]]) for (let i = 0; i < N; i++) { const pp = p0 + (p1 - p0) * i / N, qq = p0 + (p1 - p0) * (i + 1) / N; T.push(...W(a, pp, yE - 0.02), ...W(a, qq, yE - 0.02), ...W(a, qq, Rr.prof(qq) - 0.02), ...W(a, pp, yE - 0.02), ...W(a, qq, Rr.prof(qq) - 0.02), ...W(a, pp, Rr.prof(pp) - 0.02)); }
      put(wallMat, facing(T, dirU(s)));
      void riseX;
    }
  }
}
