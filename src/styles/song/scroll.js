// More of Bianjing as the Qingming scroll shows it (docs/settlements/song-kaifeng.md §10): the
// monastery's gate hall (a Song shanmen, three bays by two, split down its middle line by the doors),
// the ox cart under its reed-mat cover, the standing signboards of the pharmacies and shops, the
// fortune tellers' stands with their three signs, the heaps of wine jars in the Sun Yang shop's yard,
// the trackers' tow line.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { beamTris, rectRoof, column, platform } from '../ming/index.js';
import { gateDoors } from '../qing/carving.js';
import { hexa } from './kaifeng.js';
import { vajra } from './guardian.js';

const fromTri = (g) => { const p = g.index ? g.toNonIndexed() : g; return Array.from(p.attributes.position.array); };

/**
 * A Song bracket set (puzuo) on a wall line at (px, pz), the line running along (ux, uz), its
 * outside toward (nx, nz), its foot at y: the great bearing block, the cross arm along the wall with
 * its three small blocks, two tiers of arms (huagong) stepping out with blocks on their ends, the
 * ling'gong across the outer end carrying the eave purlin's beam. About 1.7 m tall; `s` scales it.
 */
function puzuo(A, B, px, pz, ux, uz, nx, nz, y, s = 1) {
  const Q = (u, n, yy) => [px + (ux * u + nx * n) * s, y + yy * s, pz + (uz * u + nz * n) * s];
  const bx = (out, u0, u1, n0, n1, y0, y1) => hexa(out, [Q(u0, n0, y0), Q(u1, n0, y0), Q(u1, n1, y0), Q(u0, n1, y0), Q(u0, n0, y1), Q(u1, n0, y1), Q(u1, n1, y1), Q(u0, n1, y1)]);
  // the bearing block: a cap and its tapered seat (two boxes, the lower narrower)
  bx(B, -0.3, 0.3, -0.3, 0.3, 0.12, 0.32); bx(B, -0.24, 0.24, -0.24, 0.24, 0, 0.12);
  // the cross arm in the wall plane, its three blocks
  bx(A, -0.62, 0.62, -0.1, 0.1, 0.32, 0.52);
  for (const u of [-0.55, 0, 0.55]) bx(B, u - 0.14, u + 0.14, -0.14, 0.14, 0.52, 0.7);
  bx(A, -0.95, 0.95, -0.09, 0.09, 0.7, 0.88);           // the long arm over it (man'gong)
  // the arms stepping out (and in, the same behind), each tier with a block at its end
  bx(A, -0.1, 0.1, -0.65, 0.65, 0.32, 0.52); bx(B, -0.14, 0.14, 0.44, 0.72, 0.52, 0.7); bx(B, -0.14, 0.14, -0.72, -0.44, 0.52, 0.7);
  bx(A, -0.1, 0.1, -1.25, 1.25, 0.7, 0.9); bx(B, -0.14, 0.14, 1.02, 1.3, 0.9, 1.08);
  // the ling'gong across the outer end, its blocks, the beam it carries
  bx(A, -0.62, 0.62, 1.07, 1.25, 1.08, 1.28);
  for (const u of [-0.55, 0, 0.55]) bx(B, u - 0.13, u + 0.13, 1.03, 1.29, 1.28, 1.44);
  bx(A, -0.12, 0.12, -0.2, 1.4, 0.9, 1.44);              // the beam's end (shuatou) passing through
}

/**
 * shanmen: the monastery's gate hall on the line of its wall { c [x, z], bays ([side, middle, side]
 * widths), depth (two bays), y, plat, H (the columns), door (the opening), doorH }: a stone platform
 * with steps before and behind the middle bay; columns on stone bases, the middle line of columns
 * carrying the doors (the plan divided down its middle, fen xin cao) and red walls in the side bays;
 * red end walls with a brick dado; architraves, bracket sets on the columns and one between each
 * pair; a hip roof; a framed plaque under the south eaves. The way through is the middle bay.
 */
function shanmen(el, { bag, col }) {
  const [cx, cz] = el.c, bays = el.bays ?? [4.4, 6.1, 4.4], d = el.depth ?? 8.8, y = el.y ?? 0, pl = el.plat ?? 0.42, H = el.H ?? 4.4;
  const W = bays[0] + bays[1] + bays[2], x0 = cx - W / 2, x1 = cx + W / 2, z0 = cz - d / 2, z1 = cz + d / 2, Y = y + pl;
  const xs = [x0, x0 + bays[0], x1 - bays[2], x1], zs = [z0, cz, z1];
  const door = el.door ?? 3.4, doorH = el.doorH ?? 3.6, wallM = el.wall ?? 'wall_red';
  // the platform, its steps at the middle bay before and behind
  const pr = [x0 - 1.1, z0 - 1.3, x1 + 1.1, z1 + 1.3];
  platform(bag, col, pr, y, Y);
  for (const [za, zb] of [[z1 + 1.3, z1 + 1.75], [z0 - 1.75, z0 - 1.3]]) {
    const r = [cx - 2.4, za, cx + 2.4, zb];
    bag.add('granite_block', box(r[0], y - 0.3, r[1], r[2], y + pl / 2, r[3]));
    col.floor(r, y + pl / 2);
  }
  // the columns
  for (const x of xs) for (const z of zs) column(bag, col, x, z, Y, H - 0.2, 0.5, 'lacquer_red');
  // the end walls (red over a dado of grey brick), and the walls of the side bays on the middle line
  const wall = (a, b, th) => {
    const lo = [Math.min(a[0], b[0]) - (a[0] === b[0] ? th / 2 : 0), Math.min(a[1], b[1]) - (a[1] === b[1] ? th / 2 : 0)];
    const hi = [Math.max(a[0], b[0]) + (a[0] === b[0] ? th / 2 : 0), Math.max(a[1], b[1]) + (a[1] === b[1] ? th / 2 : 0)];
    bag.add('brick_grey', box(lo[0] - 0.03, Y, lo[1] - 0.03, hi[0] + 0.03, Y + 0.9, hi[1] + 0.03));
    bag.add(wallM, box(lo[0], Y + 0.9, lo[1], hi[0], Y + H - 0.6, hi[1]));
    col.segment(a, b, th, Y, Y + H);
  };
  // (the walls stop short of the column shafts, which stand proud of them)
  wall([x0, z0 + 0.22], [x0, z1 - 0.22], 0.7); wall([x1, z0 + 0.22], [x1, z1 - 0.22], 0.7);
  wall([xs[0] + 0.22, cz], [xs[1] - 0.22, cz], 0.5); wall([xs[2] + 0.22, cz], [xs[3] - 0.22, cz], 0.5);
  // the middle bay: door posts and lintel, the panels beside and above, the sill, the leaves open inward
  {
    const dl = cx - door / 2, dr = cx + door / 2, fr = [];
    for (const x of [dl - 0.14, dr + 0.14]) hexa(fr, box4(x - 0.14, Y, cz - 0.2, x + 0.14, Y + doorH + 0.3, cz + 0.2));
    hexa(fr, box4(dl - 0.28, Y + doorH, cz - 0.22, dr + 0.28, Y + doorH + 0.34, cz + 0.22));
    hexa(fr, box4(xs[1] + 0.25, Y + H - 0.62, cz - 0.2, xs[2] - 0.25, Y + H - 0.34, cz + 0.2));      // the beam over the bay
    bag.add('lacquer_red', fromTriangles(fr));
    for (const [a, b] of [[xs[1] + 0.25, dl - 0.28], [dr + 0.28, xs[2] - 0.25]]) bag.add(wallM, box(a, Y, cz - 0.16, b, Y + H - 0.62, cz + 0.16));
    bag.add(wallM, box(dl - 0.28, Y + doorH + 0.34, cz - 0.16, dr + 0.28, Y + H - 0.62, cz + 0.16));
    col.segment([xs[1], cz], [dl - 0.28, cz], 0.4, Y, Y + H); col.segment([dr + 0.28, cz], [xs[2], cz], 0.4, Y, Y + H);
    col.segment([dl, cz], [dr, cz], 0.4, Y + doorH, Y + H);
    // the door studs' rows on the leaves (gilt), the leaves turned back against the inside
    gateDoors({ at: [cx, cz], along: 'x', w: door, h: doorH, y: Y + 0.14, swing: -1, off: 0.22, nails: 7, mat: 'lacquer_red' }, { bag, col });
    // the sill, stepped over
    bag.add('lacquer_red', box(dl, Y, cz - 0.15, dr, Y + 0.14, cz + 0.15));
    col.floor([dl, cz - 0.15, dr, cz + 0.15], Y + 0.14);
  }
  // the architraves (lan'e) round the columns' heads and along the middle line, the pupai over them
  const ar = [], pu = [];
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) {
    beamTris(ar, [a[0], Y + H - 0.62, a[1]], [b[0], Y + H - 0.62, b[1]], 0.16, 0.42);
    beamTris(pu, [a[0], Y + H - 0.2, a[1]], [b[0], Y + H - 0.2, b[1]], 0.32, 0.2);
  }
  bag.add('lacquer_red', fromTriangles(ar)); bag.add('timber_red', fromTriangles(pu));
  // the bracket sets: on every outer column and one between each pair, all round
  const A = [], B = [], yb = Y + H;
  const run = (a, b, nx, nz, mid = true) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    puzuo(A, B, a[0], a[1], ux, uz, nx, nz, yb, 0.95);
    if (mid) puzuo(A, B, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, ux, uz, nx, nz, yb, 0.95);
  };
  // (the plaque hangs in the south front's middle bay, where the set between the columns would be)
  for (let i = 0; i < 3; i++) { run([xs[i], z1], [xs[i + 1], z1], 0, 1, i !== 1); run([xs[i + 1], z0], [xs[i], z0], 0, -1); }
  run([x0, z0], [x0, cz], -1, 0); run([x0, cz], [x0, z1], -1, 0); run([x1, z1], [x1, cz], 1, 0); run([x1, cz], [x1, z0], 1, 0);
  // the corner sets also point out along the diagonal
  for (const [px, pz, sx, sz] of [[x0, z0, -1, -1], [x1, z0, 1, -1], [x1, z1, 1, 1], [x0, z1, -1, 1]]) puzuo(A, B, px, pz, -sz / Math.SQRT2, sx / Math.SQRT2, sx / Math.SQRT2, sz / Math.SQRT2, yb, 1.05);
  bag.add('timber_red', fromTriangles(A)); bag.add('paint_ochre', fromTriangles(B));
  // the ceiling (pingqi) within, the eave purlins' beam round the sets' ends, the roof
  bag.add('ceiling_coffer', box(x0 + 0.3, Y + H + 1.28, z0 + 0.3, x1 - 0.3, Y + H + 1.36, z1 - 0.3));
  bag.add('timber_red', box(x0 + 0.3, Y + H + 1.36, z0 + 0.3, x1 - 0.3, Y + H + 1.5, z1 - 0.3));
  const ring = [], o = 1.28;
  for (const [a, b] of [[[x0 - o, z0 - o], [x1 + o, z0 - o]], [[x1 + o, z0 - o], [x1 + o, z1 + o]], [[x1 + o, z1 + o], [x0 - o, z1 + o]], [[x0 - o, z1 + o], [x0 - o, z0 - o]]]) beamTris(ring, [a[0], yb + 1.36, a[1]], [b[0], yb + 1.36, b[1]], 0.15, 0.3);
  bag.add('timber_red', fromTriangles(ring));
  const ov = 2.6;
  rectRoof({ c: [cx, cz], A: W / 2 + ov, B: d / 2 + ov, y: yb + 1.55, rise: (d / 2 + ov) * 0.5, kind: 'hip', sweep: 0.55, mat: 'tile_dark', soffit: 'timber_red', p: 1.5 }, bag);
  // the two guardians (jingang lishi), over 5 m tall, one in each side bay's front half under the eaves,
  // turned in toward the way through, on low stone plinths (guardian.js)
  if (el.guardians) {
    const gh = el.guardians.h ?? 4.6;
    for (const [bx0, bx1, dx] of [[x0, xs[1], 1], [xs[2], x1, -1]]) {
      const px = (bx0 + bx1) / 2 - dx * 0.35, pz = (cz + z1) / 2 + 0.2, r = [px - 1.1, pz - 1.15, px + 1.1, pz + 1.15];
      bag.add('granite_block', box(r[0], Y - 0.02, r[1], r[2], Y + 0.55, r[3]));
      bag.add('granite_block', box(r[0] - 0.08, Y - 0.02, r[1] - 0.08, r[2] + 0.08, Y + 0.12, r[3] + 0.08));
      col.rect(r, Y, Y + gh + 0.55);
      vajra(bag, { at: [px, pz], y: Y + 0.5, h: gh, dir: [dx, 0.35], side: dx, skirt: dx > 0 ? 'clay_green' : 'clay_robe', scarf: dx > 0 ? 'clay_robe' : 'clay_green' });
    }
  }
  // the plaque under the south eaves: a framed board, upright, its characters in gilt
  {
    const pz = z1 + 0.45, py = Y + H - 0.1, pw = 1.1, ph = 1.6, fr = [], ink = [];
    hexa(fr, box4(cx - pw / 2, py, pz - 0.06, cx + pw / 2, py + ph, pz + 0.06));
    bag.add('lacquer_black', fromTriangles(fr));
    for (const [a, b, c2, dd] of [[-pw / 2 - 0.1, -0.1, pw / 2 + 0.1, 0.05], [-pw / 2 - 0.1, ph - 0.05, pw / 2 + 0.1, ph + 0.12], [-pw / 2 - 0.1, -0.1, -pw / 2 + 0.02, ph + 0.12], [pw / 2 - 0.02, -0.1, pw / 2 + 0.1, ph + 0.12]]) hexa(ink, box4(cx + a, py + b, pz - 0.08, cx + c2, py + dd, pz + 0.1));
    for (let k = 0; k < 3; k++) { const yy = py + 1.08 - k * 0.45; strokes(ink, (u, v, kk) => [cx + u, yy + v, pz + 0.06 + kk], 0.38, 0.38, 7 + k); }
    bag.add('gilt_bronze', fromTriangles(ink));
  }
}
/** The eight corners of an axis box, for hexa. */
function box4(x0, y0, z0, x1, y1, z1) { return [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]; }
/**
 * A written character, abstracted, in a w × h cell on a board: a few strokes — horizontals, an
 * upright, slants — standing a little proud of the face. P(u, v, k) places the cell's point (u across
 * from its centre, v up from its foot, k out from the face) in the world; the strokes are chosen by
 * `seed`, so that neighbours differ.
 */
function strokes(out, P, w, h, seed) {
  let s = (seed * 2654435761) >>> 0;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), t = 0.045 * Math.min(w, h) / 0.34, dz = 0.022;
  const bar = (u0, v0, u1, v1) => {
    const du = u1 - u0, dv = v1 - v0, L = Math.hypot(du, dv) || 1, pu = -dv / L * t / 2, pv = du / L * t / 2;
    hexa(out, [P(u0 - pu, v0 - pv, -0.015), P(u1 - pu, v1 - pv, -0.015), P(u1 - pu, v1 - pv, dz), P(u0 - pu, v0 - pv, dz), P(u0 + pu, v0 + pv, -0.015), P(u1 + pu, v1 + pv, -0.015), P(u1 + pu, v1 + pv, dz), P(u0 + pu, v0 + pv, dz)]);
  };
  const hw = w / 2;
  const nh = 2 + Math.floor(r() * 2);
  for (let i = 0; i < nh; i++) { const v = h * (0.15 + 0.7 * (i + r() * 0.3) / nh), a = -hw * (0.5 + r() * 0.4), b = hw * (0.5 + r() * 0.4); bar(a, v, b, v); }
  bar((r() - 0.5) * w * 0.4, h * 0.05, (r() - 0.5) * w * 0.4, h * 0.95);
  if (r() < 0.7) bar(-hw * 0.2, h * 0.5, -hw * 0.85, h * 0.08);
  if (r() < 0.6) bar(hw * 0.15, h * 0.45, hw * 0.85, h * 0.1);
  if (r() < 0.5) { const u = (r() < 0.5 ? -1 : 1) * hw * 0.7; bar(u, h * 0.2, u, h * 0.8); }
}

/**
 * song_oxcart: the ox cart of the scroll { at, y, rot (its front toward −z turned by rot), seed }: two
 * tall spoked wheels on an axle under a long box of planks (boarded sides and ends), the vaulted cover
 * of reed mats over it on bent hoops, the shafts running forward to the ox, the yoke; the second and
 * third oxen walk ahead in traces (placed by the settlement; `traces` gives how far ahead).
 */
function songOxcart(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), sn = Math.sin(el.rot ?? 0);
  const P = (lx, ly, lz) => [x + lx * c + lz * sn, y + ly, z - lx * sn + lz * c];
  const r = 0.78, hw = 0.82, L = 3.6, yb = r + 0.18, tim = [], dark = [], mat = [], iron = [];
  const B8 = (x0, y0, z0, x1, y1, z1) => [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1), P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
  // the frame's side beams running on as the shafts, the floor, the boarded sides and back
  for (const s of [-1, 1]) {
    hexa(tim, B8(s * hw - 0.07, yb - 0.14, -L / 2, s * hw + 0.07, yb, L / 2));
    tim.push(...fromTri(rod(P(s * hw, yb - 0.07, -L / 2), P(s * 0.58, 1.0, -L / 2 - 2.2), 0.055, 6)));
    for (let k = 0; k < 4; k++) hexa(tim, B8(s * hw - 0.03, yb + k * 0.24, -L / 2 + 0.02, s * hw + 0.03, yb + k * 0.24 + 0.22, L / 2 - 0.02));
    for (const zz of [-L / 2, -L / 6, L / 6, L / 2]) hexa(dark, B8(s * hw - 0.06, yb, zz - 0.06, s * hw + 0.06, yb + 1.02, zz + 0.06));
  }
  for (let k = 0; k < 7; k++) { const x0 = -hw + k * 2 * hw / 7; hexa(tim, B8(x0 + 0.01, yb, -L / 2, x0 + 2 * hw / 7 - 0.01, yb + 0.05, L / 2)); }
  for (let k = 0; k < 4; k++) hexa(tim, B8(-hw, yb + 0.05 + k * 0.24, L / 2 - 0.05, hw, yb + 0.05 + k * 0.24 + 0.22, L / 2));
  // the axle and its block under the frame, the yoke over the shafts' ends
  hexa(dark, B8(-hw - 0.32, r - 0.07, -0.07, hw + 0.32, r + 0.07, 0.07));
  hexa(dark, B8(-hw, yb - 0.3, -0.2, hw, yb - 0.14, 0.2));
  tim.push(...fromTri(rod(P(-0.7, 1.06, -L / 2 - 2.1), P(0.7, 1.06, -L / 2 - 2.1), 0.05, 6)));
  // the cover: hoops of bent bamboo over the box, the mats laid over them, the ends open
  const N = 10, R0 = hw + 0.08, yc = yb + 1.02;
  for (let i = 0; i < N; i++) {
    const a0 = Math.PI * i / N, a1 = Math.PI * (i + 1) / N;
    const q = (a, zz, k = 0) => P(-Math.cos(a) * (R0 + k), yc + Math.sin(a) * (R0 * 0.78 + k), zz);
    for (const [z0, z1] of [[-L / 2 + 0.15, -0.02], [0.02, L / 2 - 0.1]]) hexa(mat, [q(a0, z0), q(a1, z0), q(a1, z1), q(a0, z1), q(a0, z0, 0.035), q(a1, z0, 0.035), q(a1, z1, 0.035), q(a0, z1, 0.035)]);
  }
  for (const zz of [-L / 2 + 0.2, -0.6, 0.6, L / 2 - 0.15]) for (let i = 0; i < N; i++) {
    const a0 = Math.PI * i / N, a1 = Math.PI * (i + 1) / N;
    tim.push(...fromTri(rod(P(-Math.cos(a0) * (R0 + 0.05), yc + Math.sin(a0) * (R0 * 0.78 + 0.05), zz), P(-Math.cos(a1) * (R0 + 0.05), yc + Math.sin(a1) * (R0 * 0.78 + 0.05), zz), 0.025, 4)));
  }
  // the wheels: felloes, the nave, sixteen spokes, an iron tyre
  for (const s of [-1, 1]) {
    const wx = s * (hw + 0.22), n = 28, sp = 16;
    for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2; hexa(dark, [P(wx - 0.05, r + Math.cos(a0) * (r - 0.1), Math.sin(a0) * (r - 0.1)), P(wx - 0.05, r + Math.cos(a1) * (r - 0.1), Math.sin(a1) * (r - 0.1)), P(wx - 0.05, r + Math.cos(a1) * (r - 0.012), Math.sin(a1) * (r - 0.012)), P(wx - 0.05, r + Math.cos(a0) * (r - 0.012), Math.sin(a0) * (r - 0.012)), P(wx + 0.05, r + Math.cos(a0) * (r - 0.1), Math.sin(a0) * (r - 0.1)), P(wx + 0.05, r + Math.cos(a1) * (r - 0.1), Math.sin(a1) * (r - 0.1)), P(wx + 0.05, r + Math.cos(a1) * (r - 0.012), Math.sin(a1) * (r - 0.012)), P(wx + 0.05, r + Math.cos(a0) * (r - 0.012), Math.sin(a0) * (r - 0.012))]); }
    for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2; hexa(iron, [P(wx - 0.055, r + Math.cos(a0) * (r - 0.014), Math.sin(a0) * (r - 0.014)), P(wx - 0.055, r + Math.cos(a1) * (r - 0.014), Math.sin(a1) * (r - 0.014)), P(wx - 0.055, r + Math.cos(a1) * r, Math.sin(a1) * r), P(wx - 0.055, r + Math.cos(a0) * r, Math.sin(a0) * r), P(wx + 0.055, r + Math.cos(a0) * (r - 0.014), Math.sin(a0) * (r - 0.014)), P(wx + 0.055, r + Math.cos(a1) * (r - 0.014), Math.sin(a1) * (r - 0.014)), P(wx + 0.055, r + Math.cos(a1) * r, Math.sin(a1) * r), P(wx + 0.055, r + Math.cos(a0) * r, Math.sin(a0) * r)]); }
    dark.push(...fromTri(rod(P(wx - 0.2, r, 0), P(wx + 0.2, r, 0), 0.13, 10)));
    for (let k = 0; k < sp; k++) { const a = (k + 0.5) / sp * Math.PI * 2; dark.push(...fromTri(rod(P(wx, r + Math.cos(a) * 0.12, Math.sin(a) * 0.12), P(wx, r + Math.cos(a) * (r - 0.09), Math.sin(a) * (r - 0.09)), 0.024, 4))); }
  }
  bag.add('timber', fromTriangles(tim)); bag.add('wood_dark', fromTriangles(dark)); bag.add('reed_mat', fromTriangles(mat)); bag.add('iron', fromTriangles(iron));
  // the traces from the shafts to the oxen ahead
  if (el.traces) for (const s of [-1, 1]) bag.add('sacking', rod(P(s * 0.58, 1.0, -L / 2 - 2.2), P(s * 0.55, 0.95, -L / 2 - 2.2 - el.traces), 0.018, 4));
  col.circle(...[P(0, 0, 0)].map((p) => [p[0], p[2]])[0], 1.2, y, y + 2.6);
  col.circle(...[P(0, 0, -L / 2 - 0.6)].map((p) => [p[0], p[2]])[0], 0.6, y, y + 1.2);
}

/**
 * signboard: a standing signboard (li pai) { at, y, rot (its face toward −z turned by rot), h (the
 * board), w, chars, board (material), ink, roof }: an upright board in a frame on two feet braced by
 * struts, a little tiled hood over it, its characters in a column.
 */
function signboard(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), sn = Math.sin(el.rot ?? 0), h = el.h ?? 2.2, w = el.w ?? 0.55, y0 = el.foot ?? 0.45;
  const P = (lx, ly, lz) => [x + lx * c + lz * sn, y + ly, z - lx * sn + lz * c];
  const B8 = (x0, y0_, z0, x1, y1, z1) => [P(x0, y0_, z0), P(x1, y0_, z0), P(x1, y0_, z1), P(x0, y0_, z1), P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
  const fr = [], bd = [], ink = [], hood = [];
  for (const s of [-1, 1]) {
    hexa(fr, B8(s * (w / 2 + 0.05) - 0.05, 0, -0.05, s * (w / 2 + 0.05) + 0.05, y0 + h + 0.12, 0.05));
    hexa(fr, B8(s * (w / 2 + 0.05) - 0.06, 0, -0.32, s * (w / 2 + 0.05) + 0.06, 0.1, 0.32));            // the foot
    fr.push(...fromTri(rod(P(s * (w / 2 + 0.05), 0.08, -0.28), P(s * (w / 2 + 0.05), 0.55, -0.03), 0.025, 4)), ...fromTri(rod(P(s * (w / 2 + 0.05), 0.08, 0.28), P(s * (w / 2 + 0.05), 0.55, 0.03), 0.025, 4)));
  }
  hexa(fr, B8(-w / 2 - 0.1, y0 - 0.08, -0.05, w / 2 + 0.1, y0, 0.05)); hexa(fr, B8(-w / 2 - 0.1, y0 + h, -0.05, w / 2 + 0.1, y0 + h + 0.08, 0.05));
  hexa(bd, B8(-w / 2, y0, -0.025, w / 2, y0 + h, 0.025));
  const n = el.chars ?? 6, ch = Math.min(w * 0.8, (h - 0.2) / n - 0.05);
  for (let k = 0; k < n; k++) for (const side of [-1, 1]) {
    const yy = y0 + h - 0.1 - (k + 1) * (h - 0.2) / n + ((h - 0.2) / n - ch) / 2;
    strokes(ink, (u, v, kk) => P(-side * u, yy + v, side * (0.025 + kk)), ch, ch, (el.seed ?? 1) * 31 + k);
  }
  // the hood: two sloped boards over the top
  for (const s of [-1, 1]) hexa(hood, [P(-w / 2 - 0.22, y0 + h + 0.12, s * 0.3), P(w / 2 + 0.22, y0 + h + 0.12, s * 0.3), P(w / 2 + 0.22, y0 + h + 0.32, 0), P(-w / 2 - 0.22, y0 + h + 0.32, 0), P(-w / 2 - 0.22, y0 + h + 0.16, s * 0.3), P(w / 2 + 0.22, y0 + h + 0.16, s * 0.3), P(w / 2 + 0.22, y0 + h + 0.36, 0), P(-w / 2 - 0.22, y0 + h + 0.36, 0)]);
  bag.add('wood_dark', fromTriangles(fr)); bag.add(el.board ?? 'paint_white', fromTriangles(bd)); bag.add(el.ink ?? 'lacquer_black', fromTriangles(ink)); bag.add(el.roof ?? 'tile_dark', fromTriangles(hood));
  col.circle(x, z, Math.max(0.35, w / 2 + 0.1), y, y + y0 + h);
}

/**
 * fortune: a fortune teller's stand (gua tan) { at, y, rot (its open front toward −z turned by rot) }:
 * an awning of matting on four poles, a table with its cloth, a stool; three narrow signboards on
 * poles before it (in the scroll they read "divine lessons", "reading fates", "resolving doubts").
 */
function fortune(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), sn = Math.sin(el.rot ?? 0);
  const P = (lx, ly, lz) => [x + lx * c + lz * sn, y + ly, z - lx * sn + lz * c];
  const B8 = (x0, y0, z0, x1, y1, z1) => [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1), P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
  const tim = [], mat = [], cloth = [], dk = [], ink = [];
  const hw = 1.5, hd = 1.2;
  for (const [px, pz, hh] of [[-hw, -hd, 2.35], [hw, -hd, 2.35], [-hw, hd, 2.6], [hw, hd, 2.6]]) { tim.push(...fromTri(rod(P(px, 0, pz), P(px, hh + 0.05, pz), 0.035, 5))); col.circle(...[P(px, 0, pz)].map((p) => [p[0], p[2]])[0], 0.08, y, y + hh); }
  for (const [a, b] of [[[-hw, 2.35, -hd], [hw, 2.35, -hd]], [[-hw, 2.6, hd], [hw, 2.6, hd]], [[-hw, 2.35, -hd], [-hw, 2.6, hd]], [[hw, 2.35, -hd], [hw, 2.6, hd]]]) tim.push(...fromTri(rod(P(...a), P(...b), 0.025, 4)));
  // the mat awning, sloping back, with a short valance at the front
  hexa(mat, [P(-hw - 0.25, 2.38, -hd - 0.35), P(hw + 0.25, 2.38, -hd - 0.35), P(hw + 0.25, 2.66, hd + 0.2), P(-hw - 0.25, 2.66, hd + 0.2), P(-hw - 0.25, 2.41, -hd - 0.35), P(hw + 0.25, 2.41, -hd - 0.35), P(hw + 0.25, 2.69, hd + 0.2), P(-hw - 0.25, 2.69, hd + 0.2)]);
  hexa(cloth, B8(-hw - 0.25, 2.08, -hd - 0.37, hw + 0.25, 2.38, -hd - 0.34));
  // the table and its cloth, the stool behind
  hexa(dk, B8(-0.75, 0.74, -0.38, 0.75, 0.8, 0.38));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) hexa(dk, B8(sx * 0.68 - 0.03, 0, sz * 0.32 - 0.03, sx * 0.68 + 0.03, 0.74, sz * 0.32 + 0.03));
  hexa(cloth, B8(-0.77, 0.3, -0.41, 0.77, 0.8, -0.39));
  hexa(dk, B8(-0.2, 0.42, 0.62, 0.2, 0.46, 0.92));
  for (const sx of [-1, 1]) for (const sz of [0.66, 0.88]) hexa(dk, B8(sx * 0.17 - 0.02, 0, sz - 0.02, sx * 0.17 + 0.02, 0.42, sz + 0.02));
  // on the table: a brush stand and an inkstone, a tube of lots
  hexa(dk, B8(0.25, 0.8, -0.15, 0.5, 0.84, 0.05));
  bag.add('bamboo_culm', lathe([[0.05, 0], [0.05, 0.22], [0.045, 0.22], [0.045, 0.02], [0.001, 0.02]], 8, null, ...P(-0.4, 0.8, 0)));
  for (let k = 0; k < 6; k++) bag.add('bamboo_culm', rod(P(-0.4 + (k % 3 - 1) * 0.015, 0.82, (Math.floor(k / 3) - 0.5) * 0.02), P(-0.4 + (k % 3 - 1) * 0.03, 1.1, (Math.floor(k / 3) - 0.5) * 0.04), 0.005, 3));
  // the three signs on their poles before the stand, leaning a little
  // (two tied to the front poles, one standing behind the seer)
  for (let i = 0; i < 3; i++) {
    const [lx, lz] = [[-hw + 0.05, -hd - 0.13], [hw - 0.05, -hd - 0.13], [0, hd + 0.14]][i], top = i === 2 ? 2.55 : 2.2, bw = 0.32, bh = 1.15;
    tim.push(...fromTri(rod(P(lx, 0, lz), P(lx, top + 0.1, lz), 0.025, 4)));
    hexa(cloth, B8(lx - bw / 2, top - bh, lz - 0.04, lx + bw / 2, top, lz - 0.02));
    for (let k = 0; k < 2; k++) { const v0 = top - 0.5 - k * 0.45; strokes(ink, (u, v, kk) => P(lx - u, v0 + v, lz - 0.04 - kk), 0.24, 0.3, 50 + i * 7 + k); }
    col.circle(...[P(lx, 0, lz)].map((p) => [p[0], p[2]])[0], 0.08, y, y + top);
  }
  bag.add('bamboo_culm', fromTriangles(tim)); bag.add('reed_mat', fromTriangles(mat)); bag.add(el.cloth ?? 'cloth_white', fromTriangles(cloth)); bag.add('wood_dark', fromTriangles(dk)); bag.add('lacquer_black', fromTriangles(ink));
  col.circle(...[P(0, 0, 0)].map((p) => [p[0], p[2]])[0], 0.85, y, y + 0.85);
}

/**
 * jar_heap: the wine jars heaped in a shop's yard { at, y, rot, n (jars along the bottom row), rows }:
 * big jars of dark glazed stoneware lying on their sides in rows, each row stepped in over the one
 * below, mouths outward, a few standing upright before the heap.
 */
function jarHeap(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), sn = Math.sin(el.rot ?? 0), n = el.n ?? 6, rows = el.rows ?? 3;
  const P = (lx, ly, lz) => [x + lx * c + lz * sn, y + ly, z - lx * sn + lz * c];
  const prof = [[0.001, 0], [0.2, 0], [0.33, 0.12], [0.37, 0.34], [0.33, 0.6], [0.2, 0.74], [0.13, 0.78], [0.14, 0.86], [0.12, 0.88], [0.001, 0.88]], R = 0.37;
  const D = 2 * R + 0.02;
  for (let j = 0; j < rows; j++) for (let i = 0; i < n - j; i++) for (const side of [-1, 1]) {
    // two rows back to back, mouths outward; each tier rests in the hollows of the one below
    const lx = (i - (n - j - 1) / 2) * D, ly = R + j * R * 1.7, lz = side * 0.47;
    const g = lathe(prof, 12);
    g.translate(0, -0.37, 0); g.rotateX(side * Math.PI / 2); g.rotateY(el.rot ?? 0);
    const p = P(lx, ly, lz); g.translate(p[0], p[1], p[2]);
    bag.add((i + j) % 3 === 1 ? 'terracotta' : 'pottery_dark', g);
  }
  for (let i = 0; i < (el.upright ?? 3); i++) { const p = P((i - 1) * 0.9, 0, 1.5 + (i % 2) * 0.2); bag.add('pottery_dark', lathe(prof, 12, null, p[0], p[1], p[2])); }
  const hl = n * D / 2 + 0.2;
  col.segment(P(-hl, 0, 0).filter((_, k) => k !== 1), P(hl, 0, 0).filter((_, k) => k !== 1), 1.9, y, y + R * 2 + (rows - 1) * R * 1.7);
}

/** tow_line: a line { pts: [[x, y, z], …], sag (per metre of span), r }: a rope through the points, hanging a little between them. */
function towLine(el, { bag }) {
  const pts = el.pts, t = [];
  for (let k = 0; k + 1 < pts.length; k++) {
    const a = pts[k], b = pts[k + 1], span = Math.hypot(b[0] - a[0], b[2] - a[2]), sag = (el.sag ?? 0.02) * span, N = Math.max(2, Math.round(span / 1.2));
    for (let i = 0; i < N; i++) {
      const f0 = i / N, f1 = (i + 1) / N, q = (f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f - sag * 4 * f * (1 - f), a[2] + (b[2] - a[2]) * f];
      t.push(...fromTri(rod(q(f0), q(f1), el.r ?? 0.016, 4)));
    }
  }
  bag.add(el.mat ?? 'sacking', fromTriangles(t));
}

export const SCROLL_ELEMENTS = { shanmen, song_oxcart: songOxcart, signboard, fortune, jar_heap: jarHeap, tow_line: towLine };
