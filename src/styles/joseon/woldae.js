// The throne court's stonework (docs/settlements/joseon-seoul.md §18): the tiers of Geunjeongjeon's
// platform (woldae) with a stone animal on every post of their balustrades, the three-lane stairs
// with the carved slab (dapdo) of the king's way between low flank walls, and the rank stones
// (pumgyeseok). Pieces are built at their own origin facing +z and placed; the repeated ones go
// into the bag one by one so that it draws them as instances (src/core/geom.js).

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { ball, limb, T, Parts, seated, torus } from '../qing/carving.js';

const yawOf = (fx, fz) => Math.atan2(fx, fz);

// ── the twelve animals of the Earthly Branches, about 0.35 m, seated on a post's cap, facing +z ─────
const ZODIAC = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig'];
function animal(P, m, kind) {
  const B = (rx, ry, rz, x, y, z) => P.add(m, T(ball(rx, ry, rz, 5, 2), x, y, z));
  const Lm = (a, b, r0, r1 = r0) => P.add(m, limb(a, b, r0, r1, 4));
  const legs = (y, z0, z1, x = 0.065, r = 0.028) => { for (const sx of [-1, 1]) { Lm([sx * x, y, z1], [sx * x, 0, z1 + 0.03], r, r * 0.8); Lm([sx * x, y * 0.8, z0], [sx * x, 0, z0 - 0.02], r * 1.1, r * 0.8); } };
  switch (kind) {
    case 'rat': B(0.09, 0.08, 0.13, 0, 0.09, -0.02); B(0.06, 0.055, 0.075, 0, 0.14, 0.12); for (const s of [-1, 1]) B(0.04, 0.045, 0.012, s * 0.055, 0.21, 0.09); Lm([0, 0.05, -0.14], [0, 0.17, -0.3], 0.018, 0.005); break;
    case 'ox': B(0.13, 0.115, 0.19, 0, 0.17, -0.02); B(0.075, 0.08, 0.1, 0, 0.22, 0.2); legs(0.1, -0.12, 0.1, 0.08, 0.035); for (const s of [-1, 1]) { Lm([s * 0.065, 0.28, 0.17], [s * 0.14, 0.31, 0.17], 0.02, 0.012); Lm([s * 0.14, 0.31, 0.17], [s * 0.15, 0.38, 0.19], 0.012, 0.005); } break;
    case 'tiger': B(0.11, 0.1, 0.18, 0, 0.16, -0.02); B(0.085, 0.08, 0.085, 0, 0.27, 0.12); legs(0.12, -0.12, 0.1); for (const s of [-1, 1]) B(0.03, 0.03, 0.015, s * 0.06, 0.34, 0.1); Lm([0, 0.17, -0.19], [0, 0.36, -0.24], 0.022, 0.012); break;
    case 'rabbit': B(0.09, 0.09, 0.12, 0, 0.1, -0.02); B(0.06, 0.06, 0.07, 0, 0.19, 0.1); for (const s of [-1, 1]) Lm([s * 0.03, 0.22, 0.07], [s * 0.04, 0.43, 0.04], 0.022, 0.01); break;
    case 'dragon': for (const k of [0, 1, 2]) P.add(m, T(torus(0.085 - k * 0.012, 0.035, 7, 3), 0, 0.04 + k * 0.065, 0)); Lm([0, 0.2, 0.0], [0, 0.34, 0.08], 0.04, 0.03); B(0.05, 0.05, 0.075, 0, 0.36, 0.14); for (const s of [-1, 1]) Lm([s * 0.03, 0.4, 0.12], [s * 0.06, 0.47, 0.05], 0.012, 0.004); break;
    case 'snake': for (const k of [0, 1]) P.add(m, T(torus(0.09 - k * 0.015, 0.032, 7, 3), 0, 0.035 + k * 0.06, 0)); Lm([0, 0.12, 0.02], [0, 0.26, 0.07], 0.03, 0.022); B(0.035, 0.03, 0.055, 0, 0.28, 0.11); break;
    case 'horse': B(0.095, 0.1, 0.2, 0, 0.2, -0.02); Lm([0, 0.22, 0.14], [0, 0.4, 0.22], 0.05, 0.035); B(0.045, 0.055, 0.095, 0, 0.42, 0.28); legs(0.15, -0.14, 0.12, 0.06, 0.025); Lm([0, 0.28, -0.2], [0, 0.12, -0.3], 0.022, 0.01); break;
    case 'sheep': B(0.11, 0.1, 0.15, 0, 0.14, -0.02); B(0.06, 0.07, 0.075, 0, 0.22, 0.16); legs(0.1, -0.1, 0.09); for (const s of [-1, 1]) { Lm([s * 0.05, 0.27, 0.14], [s * 0.12, 0.28, 0.1], 0.025, 0.018); Lm([s * 0.12, 0.28, 0.1], [s * 0.12, 0.2, 0.15], 0.018, 0.01); } break;
    case 'monkey': B(0.085, 0.11, 0.08, 0, 0.12, 0); B(0.07, 0.07, 0.07, 0, 0.27, 0.05); for (const s of [-1, 1]) { Lm([s * 0.08, 0.18, 0.02], [s * 0.05, 0.1, 0.12], 0.025, 0.018); Lm([s * 0.07, 0.06, 0.04], [s * 0.07, 0, 0.14], 0.03, 0.02); } Lm([0, 0.08, -0.07], [0, 0.22, -0.2], 0.02, 0.01); break;
    case 'rooster': B(0.085, 0.1, 0.12, 0, 0.14, 0); Lm([0, 0.2, 0.07], [0, 0.34, 0.1], 0.04, 0.03); B(0.04, 0.045, 0.05, 0, 0.37, 0.11); B(0.012, 0.04, 0.03, 0, 0.43, 0.1); Lm([0, 0.16, -0.1], [0, 0.4, -0.22], 0.03, 0.01); break;
    case 'dog': B(0.09, 0.09, 0.16, 0, 0.12, -0.02); B(0.065, 0.065, 0.08, 0, 0.21, 0.15); legs(0.09, -0.1, 0.09, 0.055, 0.024); for (const s of [-1, 1]) B(0.02, 0.045, 0.03, s * 0.06, 0.24, 0.12); Lm([0, 0.16, -0.17], [0, 0.26, -0.24], 0.02, 0.01); break;
    default: B(0.12, 0.105, 0.15, 0, 0.13, -0.02); B(0.08, 0.08, 0.09, 0, 0.17, 0.16); B(0.04, 0.035, 0.03, 0, 0.155, 0.25); legs(0.09, -0.1, 0.09, 0.07, 0.03); for (const s of [-1, 1]) B(0.035, 0.04, 0.015, s * 0.06, 0.25, 0.13);
  }
}

// ── the tier ───────────────────────────────────────────────────────────────────────────────────────
/**
 * A balustrade run a→b over a tier's edge (the Joseon pattern of carving.js's balustradeCarved): posts every
 * `step`, each capped by one of the twelve animals in turn (the ends of runs and the stairs' sides by the seated
 * haetae), between them the sill, the panel, the cloud band, two vase balusters, the round handrail.
 */
function rail(bag, col, a, b, y, open, o) {
  const step = o.step ?? 1.6, m = o.mat, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const Pt = (s) => [a[0] + ux * s, a[1] + uz * s], isOpen = (s) => open.some(([f, t]) => s > f && s < t);
  const n = Math.max(1, Math.round(L / step)), e = L - n * step, rot = yawOf(ux, uz) - Math.PI / 2, face = yawOf(o.face[0], o.face[1]), posts = [];
  const sp = Array.from({ length: n + 1 }, (_, k) => (k === 0 ? 0 : k === n ? L : n === 1 ? L : k * step + e / 2));
  let runStart = null, kind = o.k0 ?? 0;
  for (let k = 0; k <= n; k++) {
    const s = sp[k], p = Pt(s), lNext = k < n ? sp[k + 1] - s : step, lPrev = k > 0 ? s - sp[k - 1] : step;
    if (isOpen(s)) { if (runStart !== null) { col.segment(Pt(runStart), Pt(sp[k - 1]), 0.3, y, y + 1.1); runStart = null; } continue; }
    if (runStart === null) runStart = s;
    const end = k === 0 || k === n || isOpen(s + lNext * 0.5) || isOpen(s - lPrev * 0.5);
    if (!(o.skipEnds && (k === 0 || k === n))) {
      const PP = new Parts();
      PP.add(m, box(-0.11, 0, -0.11, 0.11, 0.98, 0.11));
      PP.add(m, box(-0.15, 0.98, -0.15, 0.15, 1.04, 0.15));                                   // the cap
      PP.emit(bag, p[0], y, p[1]);
      const BB = new Parts();
      if (end) seated(BB, m, { bell: false, lite: true }); else if (!o.plain) animal(BB, m, ZODIAC[(kind++) % 12]);
      BB.emit(bag, p[0], y + 1.04, p[1], face, end ? 0.22 : 1);
    }
    posts.push(s);
    if (k < n && !isOpen(s + lNext * 0.5)) {
      const l = lNext, t = [], l0 = 0.1, l1 = l - 0.1, beam = (u0, u1, y0, h, w) => beamTris(t, [u0, y0, 0], [u1, y0, 0], w, h, true);
      beam(l0, l1, 0, 0.1, 0.14); beam(l0, l1, 0.1, 0.4, 0.075); beam(l0, l1, 0.5, 0.06, 0.055);
      const BP = new Parts(); BP.add(m, fromTriangles(t)); BP.emit(bag, p[0], y, p[1], rot);
      for (const j of [1, 2]) {
        const u = l0 + (l1 - l0) * j / 3, VP = new Parts();
        VP.add(m, lathe([[0.04, 0], [0.047, 0.09], [0.026, 0.18], [0.045, 0.2]].map(([r, yy]) => [r, yy + 0.56]), 6, null, u, 0, 0));
        const c = []; beamTris(c, [u - 0.12, 0, 0], [u + 0.12, 0, 0], 0.045, 0.075, true); VP.add(m, T(fromTriangles(c), 0, 0.76, 0));
        VP.emit(bag, p[0], y, p[1], rot);
      }
      const HP = new Parts(); HP.add(m, limb([l0 - 0.06, 0.86, 0], [l1 + 0.06, 0.86, 0], 0.045, 0.045, 6)); HP.emit(bag, p[0], y, p[1], rot);
    }
  }
  if (runStart !== null) col.segment(Pt(runStart), b, 0.3, y, y + 1.1);
  return posts;
}

/**
 * woldae: a tier of the platform { rect, y0, y1, open: { n|s|e|w: [[from, to], …] }, mat }: the granite body with a
 * moulded foot (a plinth and a step-in), a string course, the coping, the paved top, and
 * the balustrade all round with its animals.
 */
export function woldae(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0, y1 = el.y1, g = el.pal?.base || 'granite_korea', h = y1 - y0;
  bag.add(g, box(x0, y0 - 0.3, z0, x1, y1 - 0.25, z1));
  bag.add(g, box(x0 - 0.12, y1 - 0.25, z0 - 0.12, x1 + 0.12, y1 - 0.05, z1 + 0.12));         // the coping
  bag.add('brick_paving', box(x0 + 0.05, y1 - 0.05, z0 + 0.05, x1 - 0.05, y1, z1 - 0.05));
  bag.add(g, box(x0 - 0.18, y0, z0 - 0.18, x1 + 0.18, y0 + 0.2, z1 + 0.18));                  // the plinth
  bag.add(g, box(x0 - 0.1, y0 + 0.2, z0 - 0.1, x1 + 0.1, y0 + 0.34, z1 + 0.1));               // the step-in above it
  bag.add(g, box(x0 - 0.06, y0 + h * 0.52, z0 - 0.06, x1 + 0.06, y0 + h * 0.52 + 0.14, z1 + 0.06));   // the string course
  col.floor([x0, z0, x1, z1], y1);
  col.rect([x0, z0, x1, z1], y0 - 0.3, y1 - 0.31);
  const o = el.open || {}, i = 0.25;
  const sides = [['n', [x0 + i, z0 + i], [x1 - i, z0 + i], [0, -1]], ['s', [x0 + i, z1 - i], [x1 - i, z1 - i], [0, 1]], ['w', [x0 + i, z0 + i], [x0 + i, z1 - i], [-1, 0]], ['e', [x1 - i, z0 + i], [x1 - i, z1 - i], [1, 0]]];
  for (const [k, a, b, f] of sides) rail(bag, col, a, b, y1, o[k] || [], { mat: g, face: f, plain: k === 'n', skipEnds: k === 'w' || k === 'e', k0: (el.k0 ?? 0) + (k === 'n' ? 0 : k === 'e' ? 3 : k === 's' ? 6 : 9) });
}

// ── the stairs ─────────────────────────────────────────────────────────────────────────────────────
/** A closed convex prism over the polygon (in z, y) between two x's, as triangles. */
function prism(x0, x1, poly) {
  const t = [], n = poly.length;
  for (let i = 1; i + 1 < n; i++) { t.push(x0, poly[0][1], poly[0][0], x0, poly[i][1], poly[i][0], x0, poly[i + 1][1], poly[i + 1][0]); t.push(x1, poly[0][1], poly[0][0], x1, poly[i][1], poly[i][0], x1, poly[i + 1][1], poly[i + 1][0]); }
  for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n]; t.push(x0, a[1], a[0], x1, a[1], a[0], x1, b[1], b[0], x0, a[1], a[0], x1, b[1], b[0], x0, b[1], b[0]); }
  return orientOutward(t);
}

/**
 * woldae_stairs: the stairs up a tier's front { rect: [x0, z0, x1, z1] (the stair's footprint, the way up toward −z), y0, y1 }:
 * three lanes — steps on either hand and in the middle the king's way, a sloping slab (dapdo) carved with a pair of
 * phoenixes among clouds under a border — between low flank walls with a round scroll at each foot.
 */
export function woldaeStairs(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1 } = el, g = el.pal?.base || 'granite_korea', xm = (x0 + x1) / 2, wc = el.wc ?? 1.3, fw = 0.5;
  const run = z1 - z0, rise = y1 - y0, yAt = (z) => y0 + rise * (z1 - z) / run, n = Math.max(1, Math.round(rise / 0.16));
  const lanes = [[x0, xm - wc - fw], [xm + wc + fw, x1]];
  // the side lanes: granite steps, each running forward under the next
  for (const [a, b] of lanes) {
    for (let k = 0; k < n; k++) {
      const f0 = k / n, f1 = (k + 1) / n, za = z1 - run * f1, zb = z1 - run * f0;
      bag.add(g, box(a, y0 - 0.2, za, b, y0 + rise * f1, zb));
      bag.add(g, box(a + 0.01, y0 + rise * f1 - 0.03, zb - 0.06, b - 0.01, y0 + rise * f1, zb + 0.02));     // a nosing's shadow line
      // where feet went: the middle of each tread, darkened and polished by the officials' soles (a pad of the darker granite, 1.2 m wide, a hair proud)
      { const ac = (a + b) / 2, hw = Math.min(0.6, (b - a) / 2 - 0.1); bag.add('granite_grey', box(ac - hw, y0 + rise * f1, za + 0.05, ac + hw, y0 + rise * f1 + 0.012, zb - 0.08)); }
    }
    col.ramp([a, z0, b, z1], y0, y1, 'n');
  }
  // the king's way: the slab laid on the slope, its sides stepped to hold it
  const xa = xm - wc, xb = xm + wc;
  bag.add(g, fromTriangles(prism(xa, xb, [[z1, y0 - 0.2], [z0, y0 - 0.2], [z0, y1], [z1, y0]])));
  col.ramp([xa, z0, xb, z1], y0, y1, 'n');
  // the carving on it: a raised border, and inside it a pair of phoenixes, one above the other, among clouds
  const sl = Math.hypot(run, rise), uy = rise / sl, uz = -run / sl, tilt = Math.atan2(rise, run);       // up the slope
  // a point on the slab at u up the slope from its foot, v across, h out of the surface
  const Q = (u, v, h = 0) => [xm + v, y0 + uy * u + h * (run / sl), z1 + uz * u + h * (rise / sl)];
  const rel = [], line = (pts, w, h) => { for (let i = 0; i + 1 < pts.length; i++) beamTris(rel, pts[i], pts[i + 1], w, h, true); };
  const bor = (u0, u1, v0, v1) => line([Q(u0, v0, 0.01), Q(u1, v0, 0.01), Q(u1, v1, 0.01), Q(u0, v1, 0.01), Q(u0, v0, 0.01)], 0.035, 0.03);
  bor(0.18, sl - 0.18, -wc + 0.18, wc - 0.18);
  const cl = new Parts();
  const bird = (uc, flip) => {
    // the body along the slope, the head toward its top, the crest, the long curling tail, the spread wings
    const d = flip ? -1 : 1, c = (u, v, h = 0.02) => Q(uc + u, v * d, h);
    for (const [u, rl, rw] of [[0, 0.2, 0.11], [0.3, 0.09, 0.07]]) { const g2 = ball(rw, 0.035, rl, 6, 3); g2.rotateX(tilt); const p = c(u, 0, 0.02); g2.translate(p[0], p[1], p[2]); cl.add(g, g2); }
    line([c(-0.15, 0), c(-0.55, 0.1), c(-0.95, -0.12), c(-1.2, 0.05)], 0.022, 0.025);                       // the tail
    line([c(-0.12, -0.05), c(-0.5, -0.32), c(-0.85, -0.42)], 0.018, 0.02); line([c(-0.12, 0.05), c(-0.55, 0.34), c(-0.9, 0.4)], 0.018, 0.02);
    for (const sv of [-1, 1]) for (const k of [0, 1, 2]) line([c(0.05, sv * 0.12), c(0.15 - k * 0.12, sv * (0.38 + k * 0.1)), c(0.0 - k * 0.2, sv * (0.62 + k * 0.08))], 0.02, 0.022);   // the wings' feathers
    line([c(0.38, 0.02), c(0.47, 0.06), c(0.52, 0.0)], 0.014, 0.02);                                         // the crest
  };
  if (sl > 3.2 && wc > 0.8) { const nb = sl > 7 ? 2 : 1; for (let i = 0; i < nb; i++) bird(sl * (i + 0.5) / nb + 0.55, i % 2 === 1); }
  for (let i = 0; i < Math.floor(sl / 1.4); i++) for (const sv of [-1, 1]) { const q = Q(0.7 + i * 1.4, sv * (wc - 0.45), 0.02), r = torus(0.1, 0.018, 6, 3); r.rotateX(tilt); r.translate(q[0], q[1], q[2]); cl.add(g, r); }   // the clouds
  bag.add(g, fromTriangles(rel));
  cl.emit(bag);
  // the flank walls: a wedge each, its top parallel to the steps, a round scroll on the low end; the outer edges carry a handrail wall too
  for (const sx of [-1, 1]) {
    const a = sx < 0 ? xm - wc - fw : xm + wc, b = a + fw, top = 0.78;
    bag.add(g, fromTriangles(prism(a, b, [[z1, y0 - 0.2], [z0, y0 - 0.2], [z0, y1 + top], [z1, y0 + top]])));
    bag.add(g, T(ball(fw * 0.7, 0.42, fw * 0.7, 7, 4), (a + b) / 2, y0 + top, z1 - 0.05));            // the scroll
    bag.add(g, box(a - 0.03, y0 + top - 0.1, z1 - 0.3, b + 0.03, y0 + top, z1 + 0.05));
    for (let k = 0; k < Math.ceil(run / 1.5); k++) { const za = z1 - Math.min(run, (k + 1) * 1.5), zb = z1 - k * 1.5; col.rect([a, za, b, zb], y0, yAt(za) + top); }
  }
}

// ── the rank stones ────────────────────────────────────────────────────────────────────────────────
/**
 * rank_stone: a stone of the ranks (pumgyeseok) { at: [x, z], face: [fx, fz] (toward the throne), y, rank (0 high … 1 low) }: a base slab with a
 * moulded edge, the upright stone with a shoulder, its top slanting to the throne and its face there framed
 * with a recessed panel where the rank is cut.
 */
export function rankStone(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, f = el.face ?? [0, -1], yaw = yawOf(f[0], f[1]), g = el.pal?.base || 'granite_korea', tall = el.rank === 1 ? 0.6 : 0.72;
  const P = new Parts();
  P.add(g, box(-0.34, 0, -0.24, 0.34, 0.07, 0.24)); P.add(g, box(-0.3, 0.07, -0.2, 0.3, 0.13, 0.2));
  // the stone: front (toward +z) taller than the back, so its top slants down toward the throne? no: down toward the back — the face leans out a little
  const h0 = 0.13, w = 0.17, d = 0.075, t = [];
  const A = [-w, h0, -d], Bq = [w, h0, -d], C = [w, h0, d], D = [-w, h0, d], hb = tall, hf = tall - 0.1;
  const A2 = [-w + 0.02, hb, -d + 0.01], B2 = [w - 0.02, hb, -d + 0.01], C2 = [w - 0.02, hf, d - 0.005], D2 = [-w + 0.02, hf, d - 0.005];
  const q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
  q(A, Bq, B2, A2); q(Bq, C, C2, B2); q(C, D, D2, C2); q(D, A, A2, D2); q(A2, B2, C2, D2);
  P.add(g, fromTriangles(orientOutward(t)));
  P.add(g, box(-w - 0.025, h0, -d - 0.02, w + 0.025, h0 + 0.05, d + 0.02));                          // the foot of the stone
  // the recessed panel on the face: a dark inset with a raised frame of four strips
  const pf = d + 0.004, y0p = h0 + 0.12, y1p = hf - 0.08;
  P.add(g, box(-w + 0.045, y0p, pf, w - 0.045, y1p, pf + 0.012));
  for (const [a0, a1, b0, b1] of [[-w + 0.025, w - 0.025, y0p - 0.02, y0p], [-w + 0.025, w - 0.025, y1p, y1p + 0.02], [-w + 0.025, -w + 0.045, y0p, y1p], [w - 0.045, w - 0.025, y0p, y1p]]) P.add(g, box(a0, b0, pf, a1, b1, pf + 0.02));
  for (const k of [0, 1, 2]) P.add(g, box(-0.045, y0p + 0.06 + k * 0.1, pf + 0.012, 0.045, y0p + 0.075 + k * 0.1, pf + 0.02));   // the cut characters, as bars
  P.emit(bag, x, y, z, yaw);
  col.rect([x - 0.3, z - 0.22, x + 0.3, z + 0.22], y, y + tall);
}

export const WOLDAE = { woldae, woldae_stairs: woldaeStairs, rank_stone: rankStone };
