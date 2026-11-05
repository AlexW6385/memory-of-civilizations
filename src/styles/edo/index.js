// Edo Japanese architecture (c. 1600–1620; docs/settlements/edo-himeji.md §4–§5): the castle —
// stone ramparts with the curved batter, white plastered walls, grey tiled roofs (hip-and-gable at
// the top, hips on the lower tiers, triangular gables on the slopes), the keep of five tiers, small
// keeps and turrets, roofed passages, walls with tile copings, gate-houses; the lord's residence of
// single-storey halls; the samurai compounds; the merchants' townhouses (machiya). Roofs come from
// the ming style's rectRoof with a Japanese palette and a gentler curve.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, fromTriangles, orientOutward, rod } from '../../core/geom.js';
import { rectRoof, withPal, beamTris } from '../ming/index.js';
import '../qing/index.js';

const PL = 'plaster_castle', ST = 'ishigaki', TL = 'tile_grey', WD = 'wood_dark';
const JPAL = { roof: TL, soffit: PL, plaster: PL, wood: WD, column: WD };
const J = (fn) => (el, ctx) => withPal(fn)({ ...el, pal: { ...JPAL, ...(el.pal || {}) } }, ctx);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A Japanese roof over [x0, z0, x1, z1] (eave y, overhang o): hip, xieshan (irimoya) or gable; ridge along the longer side unless alongZ is given. */
function roof(bag, rect, y, o, kind, rise, opt = {}) {
  const [x0, z0, x1, z1] = rect, w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, alongZ = opt.alongZ ?? d > w;
  const A = (alongZ ? d : w) / 2, B = (alongZ ? w : d) / 2;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A, B, y, rise: rise ?? B * 0.62, kind, sweep: opt.sweep ?? 0.3, p: opt.p ?? 1.25, alongZ, curl: false, gableAt: opt.gableAt ?? 0.5, mat: opt.mat, hole: opt.hole }, bag);
}
/** A section [[offset, y]…] swept along a→b, capped at the ends. */
function sweepSection(bag, mat, a, b, sec) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L, t = [];
  const P = (p, [o, y]) => [p[0] + nx * o, y, p[1] + nz * o];
  for (let k = 0; k < sec.length; k++) { const s0 = sec[k], s1 = sec[(k + 1) % sec.length]; const A = P(a, s0), B = P(b, s0), C = P(b, s1), D = P(a, s1); t.push(...A, ...B, ...C, ...A, ...C, ...D); }
  for (let k = 1; k < sec.length - 1; k++) { t.push(...P(a, sec[0]), ...P(a, sec[k]), ...P(a, sec[k + 1]), ...P(b, sec[0]), ...P(b, sec[k + 1]), ...P(b, sec[k])); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
/** Small dark windows in a row along a face (the face from a to b at y, out along n). */
function windows(bag, a, b, y, h, n, w = 1.1, mat = 'lacquer_black') {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i < n; i++) { const s = (i + 0.5) * L / n, c = [a[0] + ux * s, a[1] + uz * s], t = []; beamTris(t, [c[0] - ux * w / 2, y, c[1] - uz * w / 2], [c[0] + ux * w / 2, y, c[1] + uz * w / 2], 0.06, h); bag.add(mat, fromTriangles(t)); }
}
/** The four faces of a box [x0, z0, x1, z1], each as [a, b] going round it (outward on the left). */
const faces = ([x0, z0, x1, z1], e = 0.04) => [[[x1, z0 - e], [x0, z0 - e]], [[x1 + e, z1], [x1 + e, z0]], [[x0, z1 + e], [x1, z1 + e]], [[x0 - e, z0], [x0 - e, z1]]];

/**
 * ishigaki: a stone rampart { rect, y0, y1, batter, ring (width, for a rampart round a bailey of
 * earth), walk }: the faces curve — steep at the top, spreading at the foot (ōgi-no-kōbai).
 */
function ishigaki(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0 ?? 0, y1 = el.y1, b = el.batter ?? (y1 - y0) * 0.3, N = 6;
  // `rect` is the top; the faces lean out by out(t) at height fraction t: vertical at the top,
  // spreading at the foot
  const out = (t) => b * (1 - t) * (1 - t);
  const band = ([rx0, rz0, rx1, rz1], sd) => {
    for (let k = 0; k < N; k++) {
      const t0 = k / N, t1 = (k + 1) / N, ya = y0 + (y1 - y0) * t0, yb = y0 + (y1 - y0) * t1, o = out(t0), d = o - out(t1);
      const r0 = [rx0 - (sd.w ? o : 0), rz0 - (sd.n ? o : 0), rx1 + (sd.e ? o : 0), rz1 + (sd.s ? o : 0)];
      bag.add(el.mat ?? ST, frustum(r0, ya, yb, sd.w ? d : 0, sd.e ? d : 0, sd.n ? d : 0, sd.s ? d : 0));
      col.rect(r0, ya, yb);
    }
  };
  if (el.ring) {
    const w = el.ring;
    band([x0, z0, x1, z0 + w], { n: 1, w: 1, e: 1 }); band([x0, z1 - w, x1, z1], { s: 1, w: 1, e: 1 });
    // door { at (z), w, h }: a passage through the west side into the hollow (a keep's basement), under a stone lintel
    const dr = el.door;
    if (dr) {
      band([x0, z0 + w, x0 + w, dr.at - dr.w / 2], { w: 1 }); band([x0, dr.at + dr.w / 2, x0 + w, z1 - w], { w: 1 });
      const tb = (dr.h) / (y1 - y0), o = out(tb);
      bag.add(el.mat ?? ST, frustum([x0 - o, dr.at - dr.w / 2, x0 + w, dr.at + dr.w / 2], y0 + dr.h, y1, o, 0, 0, 0)); col.rect([x0 - o, dr.at - dr.w / 2, x0 + w, dr.at + dr.w / 2], y0 + dr.h, y1);
      bag.add('wood_dark', box(x0 + w - 0.25, y0, dr.at - dr.w / 2 - 0.2, x0 + w - 0.05, y0 + dr.h + 0.3, dr.at - dr.w / 2));
      bag.add('wood_dark', box(x0 + w - 0.25, y0, dr.at + dr.w / 2, x0 + w - 0.05, y0 + dr.h + 0.3, dr.at + dr.w / 2 + 0.2));
      bag.add('wood_dark', box(x0 + w - 0.3, y0 + dr.h, dr.at - dr.w / 2 - 0.2, x0 + w, y0 + dr.h + 0.35, dr.at + dr.w / 2 + 0.2));
    } else band([x0, z0 + w, x0 + w, z1 - w], { w: 1 });
    band([x1 - w, z0 + w, x1, z1 - w], { e: 1 });
    for (const r of [[x0, z0, x1, z0 + w], [x0, z1 - w, x1, z1], [x0, z0, x0 + w, z1], [x1 - w, z0, x1, z1]]) if (el.walk !== false) col.floor(r, y1);
  } else {
    const sd = el.sides ? Object.fromEntries([...el.sides].map((c) => [c, 1])) : { n: 1, s: 1, e: 1, w: 1 };
    band([x0, z0, x1, z1], sd);
    if (el.walk !== false) col.floor([x0, z0, x1, z1], y1);
  }
}

/** dobei: a plastered earthen wall a→b { y, h } on a stone footing, under a little tiled roof. */
function dobei(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h ?? 2.2, t = [];
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) return;
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], 0.3, 0.5); bag.add(ST, fromTriangles(t));
  const t2 = []; beamTris(t2, [a[0], y + 0.5, a[1]], [b[0], y + 0.5, b[1]], 0.24, h - 0.5); bag.add(el.mat ?? PL, fromTriangles(t2));
  sweepSection(bag, TL, a, b, [[-0.55, y + h - 0.05], [0, y + h + 0.45], [0.55, y + h - 0.05], [0.3, y + h - 0.15], [-0.3, y + h - 0.15]]);
  col.segment(a, b, 0.6, y, y + h + 0.4);
}

/** A tier of a keep or turret: the plastered box with rows of windows, a dark base band. */
function tierBox(bag, col, rect, y, h, nWin) {
  const [x0, z0, x1, z1] = rect;
  bag.add(PL, box(x0, y, z0, x1, y + h, z1));
  col.rect(rect, y, y + h);
  for (const [a, b] of faces(rect)) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); windows(bag, a, b, y + h * 0.42, h * 0.3, nWin ?? Math.max(1, Math.round(L / 3.2)), Math.min(1.2, L / 8)); }
}
/** chidori-hafu: a triangular gable standing on a roof slope, its plastered face out toward `dir`. */
function chidori(bag, c, y, w, dir) {
  const [cx, cz] = c, along = dir === 'n' || dir === 's', s = dir === 's' || dir === 'e' ? 1 : -1, d = 2.2;
  const rect = along ? [cx - w / 2, cz - (s > 0 ? 0 : d), cx + w / 2, cz + (s > 0 ? d : 0)] : [cx - (s > 0 ? 0 : d), cz - w / 2, cx + (s > 0 ? d : 0), cz + w / 2];
  roof(bag, rect, y, 0.5, 'gable', w * 0.42, { alongZ: along });
  const R = w * 0.42 + 0, g = [];
  if (along) { const z = s > 0 ? rect[3] + 0.2 : rect[1] - 0.2; g.push(cx - w / 2, y, z, cx + w / 2, y, z, cx, y + R * 0.95, z); }
  else { const x = s > 0 ? rect[2] + 0.2 : rect[0] - 0.2; g.push(x, y, cz - w / 2, x, y, cz + w / 2, x, y + R * 0.95, cz); }
  bag.add(PL, fromTriangles(g.concat([g[0], g[1], g[2], g[6], g[7], g[8], g[3], g[4], g[5]])));
}
/** shachi: a pair of tile fish at the ends of the top ridge (a tail rising). */
function shachi(bag, a, b, y) {
  for (const p of [a, b]) { const t = []; beamTris(t, [p[0], y, p[1]], [p[0], y + 0.01, p[1] + 0.01], 0.25, 1.4); bag.add('tile_dark', fromTriangles(t)); }
}

/**
 * tenshu: a keep { c, base (y of its first floor), tiers: [{ hw, hd, h }], top ('xieshan'),
 * chidori: [tier indices], hollow, below (y of a basement floor inside the base) }: each tier a
 * plastered box with windows; the lower tiers skirted by hipped roofs, the top under a
 * hip-and-gable roof; gables on the slopes; fish on the ridge. hollow: the keep inside
 * (docs/settlements/edo-himeji.md §4): floors of boards on exposed joists, walls of plaster
 * between posts with barred windows lit from outside, gun racks, the warriors' corridor
 * (musha-bashiri) round each floor inside a ring of posts, the two great pillars (east and west)
 * rising from the basement to the floor of the top storey, steep stairs up from the basement to the
 * top, a stone sink in the basement. (The Osakabe shrine came to the top floor only after 1945.)
 */
function tenshu(el, { bag, col }) {
  const [cx, cz] = el.c, H = !!el.hollow, T = 0.45, RISE = 0.31, RUN = 0.3;
  let y = el.base;
  const rects = el.tiers.map((t) => [cx - t.hw, cz - t.hd, cx + t.hw, cz + t.hd]);
  // the stairs: from the basement to the first floor (north side), then each floor to the next, alternating sides
  const stairs = [];
  if (H) {
    let yy = el.base;
    if (el.below != null) { const n = Math.ceil((el.base - el.below) / RISE), hd = el.basementHd ?? el.tiers[0].hd - 2; stairs.push({ y0: el.below, y1: el.base, n, z: cz - (hd - 1.3), into: 0 }); }
    el.tiers.forEach((t, i) => { if (i + 1 < el.tiers.length) { const n = Math.ceil(t.h / RISE), up = el.tiers[i + 1]; stairs.push({ y0: yy, y1: yy + t.h, n, z: cz + (i % 2 ? -1 : 1) * (up.hd - T - 1.4), into: i + 1 }); } yy += t.h; });
    for (const st of stairs) { st.x0 = cx - st.n * RUN / 2; st.x1 = cx + st.n * RUN / 2; st.hole = [st.x0 - 0.15, st.z - 0.6, st.x1 + 0.1, st.z + 0.6]; }
  }
  el.tiers.forEach((t, i) => {
    const rect = rects[i], last = i === el.tiers.length - 1;
    if (H) hollowTier(bag, col, rect, y, t.h, i, { T, below: i ? rects[i - 1] : el.basementRect ?? rect, hole: stairs.find((s) => s.into === i)?.hole, keep: stairs.filter((s) => s.into === i || s.y0 === y).map((s) => s.hole), racks: i < 3 });
    else { tierBox(bag, col, rect, y, t.h); col.floor(rect, y); }
    const ov = last ? 1.6 : 1.9;
    if (last) {
      roof(bag, rect, y + t.h - 0.2, ov, 'xieshan', (Math.min(t.hw, t.hd) + ov) * 0.75);
      const alongZ = t.hd > t.hw, L = (alongZ ? t.hd : t.hw) + ov - (Math.min(t.hw, t.hd) + ov), top = y + t.h - 0.2 + (Math.min(t.hw, t.hd) + ov) * 0.75;
      shachi(bag, alongZ ? [cx, cz - L] : [cx - L, cz], alongZ ? [cx, cz + L] : [cx + L, cz], top + 0.2);
      if (H) { bag.add(WD, box(rect[0] + T, y + t.h - 0.3, rect[1] + T, rect[2] - T, y + t.h, rect[3] - T)); }
    } else {
      roof(bag, rect, y + t.h - 0.2, ov, 'hip', (Math.min(t.hw, t.hd) + ov) * 0.62, H ? { hole: rects[i + 1] } : {});
      if ((el.chidori || []).includes(i)) {
        const n = el.tiers[i + 1], ye = y + t.h - 0.2 + ov * 0.5;
        for (const dir of ['n', 's', 'e', 'w']) {
          const c = dir === 'n' ? [cx, cz - n.hd - 0.2] : dir === 's' ? [cx, cz + n.hd + 0.2] : dir === 'e' ? [cx + n.hw + 0.2, cz] : [cx - n.hw - 0.2, cz];
          chidori(bag, c, ye, Math.min(6, (dir === 'n' || dir === 's' ? n.hw : n.hd) * 0.9), dir);
        }
      }
    }
    y += t.h;
  });
  if (!H) return;
  // the great pillars, east and west, from the basement floor to the floor of the top storey
  const y0 = el.below ?? el.base, yp = y - el.tiers[el.tiers.length - 1].h;
  for (const s of [-1, 1]) { const px = cx + s * 3; bag.add(WD, box(px - 0.48, y0, cz - 0.48, px + 0.48, yp, cz + 0.48)); col.rect([px - 0.48, cz - 0.48, px + 0.48, cz + 0.48], y0, yp); }
  for (const st of stairs) stair(bag, col, st, RISE, RUN);
  // the basement: posts on a grid round the pillars, a sink of stone by the wall
  if (el.below != null) {
    const br = el.basementRect;
    for (let px = br[0] + 2.4; px < br[2] - 1.5; px += 3.2) for (let pz = br[1] + 2.4; pz < br[3] - 1.5; pz += 3.4) {
      if (Math.abs(pz - cz) < 1.2 && Math.abs(Math.abs(px - cx) - 3) < 1.6) continue;
      if (stairs.some((st) => px > st.hole[0] - 0.5 && px < st.hole[2] + 0.5 && pz > st.hole[1] - 0.5 && pz < st.hole[3] + 0.5)) continue;
      bag.add(WD, box(px - 0.18, y0, pz - 0.18, px + 0.18, el.base - 0.35, pz + 0.18)); col.rect([px - 0.18, pz - 0.18, px + 0.18, pz + 0.18], y0, el.base);
    }
    bag.add(ST, box(br[2] - 2.4, y0, br[3] - 1.4, br[2] - 0.2, y0 + 0.7, br[3] - 0.1)); bag.add('water', box(br[2] - 2.2, y0 + 0.55, br[3] - 1.2, br[2] - 0.4, y0 + 0.62, br[3] - 0.3));
    col.rect([br[2] - 2.4, br[3] - 1.4, br[2] - 0.2, br[3] - 0.1], y0, y0 + 0.7);
  }
}

/** One floor of a hollow keep: walls with posts and barred windows, the floor and its joists, the warriors' corridor's ring of posts, gun racks. */
function hollowTier(bag, col, rect, y, h, i, { T, below, hole, keep, racks }) {
  const [x0, z0, x1, z1] = rect, inn = [x0 + T, z0 + T, x1 - T, z1 - T];
  // the walls
  for (const r of [[x0, z0, x1, z0 + T], [x0, z1 - T, x1, z1], [x0, z0 + T, x0 + T, z1 - T], [x1 - T, z0 + T, x1, z1 - T]]) { bag.add(PL, box(r[0], y, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }
  // the floor (over the storey below, its hole for the stair up into this one) and the joists under it
  const cut = (r, q) => q ? [[r[0], r[1], r[2], q[1]], [r[0], q[3], r[2], r[3]], [r[0], q[1], q[0], q[3]], [q[2], q[1], r[2], q[3]]].filter((a) => a[2] - a[0] > 0.05 && a[3] - a[1] > 0.05) : [r];
  const fb = [Math.min(below[0], x0), Math.min(below[1], z0), Math.max(below[2], x1), Math.max(below[3], z1)];
  for (const r of cut(fb, hole)) bag.add(WD, box(r[0], y - 0.36, r[1], r[2], y - 0.06, r[3]));
  for (const r of cut(inn, hole)) { bag.add('cedar', box(r[0], y - 0.06, r[1], r[2], y, r[3])); col.floor(r, y); }
  for (let zz = fb[1] + 0.9; zz < fb[3] - 0.5; zz += 0.9) for (const r of cut([fb[0] + 0.3, zz - 0.09, fb[2] - 0.3, zz + 0.09], hole)) if (!hole || r[3] < hole[1] || r[1] > hole[3] || r[0] >= hole[2] || r[2] <= hole[0]) bag.add(WD, box(r[0], y - 0.6, r[1], r[2], y - 0.36, r[3]));
  for (const xx of [x0 + T + 1.85, x1 - T - 1.85]) bag.add(WD, box(xx - 0.2, y - 0.82, fb[1] + 0.3, xx + 0.2, y - 0.36, fb[3] - 0.3));
  // the walls inside: posts, a rail at the windows' sill and a beam at the top; the barred windows lit from outside
  const faceIn = [[[x0 + T, z0 + T], [x1 - T, z0 + T], [0, 1]], [[x1 - T, z1 - T], [x0 + T, z1 - T], [0, -1]], [[x0 + T, z1 - T], [x0 + T, z0 + T], [1, 0]], [[x1 - T, z0 + T], [x1 - T, z1 - T], [-1, 0]]];
  const wy = y + h * 0.42, wh = h * 0.3;
  for (const [a, b, n] of faceIn) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, Lo = L + 2 * T;
    const P = (s, o) => [a[0] + ux * s + n[0] * o, a[1] + uz * s + n[1] * o];
    const nw = Math.max(1, Math.round(Lo / 3.2)), w = Math.min(1.2, Lo / 8);
    const t = [];
    const bar = (s0, s1, o, yb, hh, ww) => { const p = P(s0, o), q = P(s1, o); beamTris(t, [p[0], yb, p[1]], [q[0], yb, q[1]], ww, hh); };
    bar(0, L, 0.06, wy - 0.14, 0.14, 0.06); bar(0, L, 0.08, y + h - 0.42, 0.36, 0.08); bar(0, L, 0.04, y, 0.12, 0.04);
    for (let s = 0; s <= L + 0.01; s += L / Math.max(1, Math.round(L / 1.9))) { const p = P(s, 0.12); bag.add(WD, box(p[0] - 0.12, y, p[1] - 0.12, p[0] + 0.12, y + h, p[1] + 0.12)); }
    for (let k = 0; k < nw; k++) {
      const sc = (k + 0.5) * Lo / nw - T;
      const g = P(sc - w / 2, 0.02), g2 = P(sc + w / 2, 0.02), gt = [];
      beamTris(gt, [g[0], wy, g[1]], [g2[0], wy, g2[1]], 0.02, wh); bag.add('daylight_plain', fromTriangles(gt));
      for (let j = 0; j <= 8; j++) bar(sc - w / 2 + j * w / 8 - 0.025, sc - w / 2 + j * w / 8 + 0.025, 0.07, wy, wh, 0.05);
      bar(sc - w / 2 - 0.08, sc + w / 2 + 0.08, 0.06, wy + wh, 0.1, 0.06);
      // the gun racks between the windows
      if (racks && k + 1 < nw) {
        const sm = (k + 1) * Lo / nw - T;
        bar(sm - 0.7, sm + 0.7, 0.16, y + 0.55, 0.08, 0.05); bar(sm - 0.7, sm + 0.7, 0.16, y + 1.55, 0.08, 0.05);
        for (let j = 0; j < 5; j++) {
          const sj = sm - 0.56 + j * 0.28, p = P(sj, 0.22), q = P(sj + 0.06, 0.3);
          bag.add(WD, rod([p[0], y + 0.05, p[1]], [q[0], y + 1.0, q[1]], 0.035, 5));
          bag.add('iron', rod([q[0], y + 1.0, q[1]], [q[0] + (q[0] - p[0]) * 0.8, y + 1.75, q[1] + (q[1] - p[1]) * 0.8], 0.018, 5));
        }
      }
    }
    bag.add(WD, fromTriangles(t));
  }
  // the warriors' corridor: a ring of posts 1.85 m in from the walls, tied by beams at the top
  const rg = [inn[0] + 1.85, inn[1] + 1.85, inn[2] - 1.85, inn[3] - 1.85];
  const inKeep = (px, pz) => keep.some((q) => px > q[0] - 0.35 && px < q[2] + 0.35 && pz > q[1] - 0.35 && pz < q[3] + 0.35);
  const posts = [];
  for (const [ax, az, bx, bz] of [[rg[0], rg[1], rg[2], rg[1]], [rg[0], rg[3], rg[2], rg[3]], [rg[0], rg[1], rg[0], rg[3]], [rg[2], rg[1], rg[2], rg[3]]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 1.9));
    for (let k = 0; k <= n; k++) posts.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
    bag.add(WD, box(Math.min(ax, bx) - 0.13, y + h - 0.62, Math.min(az, bz) - 0.13, Math.max(ax, bx) + 0.13, y + h - 0.3, Math.max(az, bz) + 0.13));
  }
  for (const [px, pz] of posts) { if (inKeep(px, pz)) continue; bag.add(WD, box(px - 0.13, y, pz - 0.13, px + 0.13, y + h - 0.3, pz + 0.13)); col.rect([px - 0.13, pz - 0.13, px + 0.13, pz + 0.13], y, y + h); }
  void i;
}

/** A steep stair of open treads between two stringers { x0, x1, z, y0, n }, climbing along +x; a handrail on the open side. */
function stair(bag, col, st, RISE, RUN) {
  const rise = (st.y1 - st.y0) / st.n, t = [];
  for (let k = 0; k < st.n; k++) {
    const xa = st.x0 + k * RUN, yt = st.y0 + (k + 1) * rise;
    bag.add('cedar', box(xa, yt - 0.06, st.z - 0.5, xa + RUN + 0.04, yt, st.z + 0.5));
    col.floor([xa, st.z - 0.5, xa + RUN, st.z + 0.5], yt);
  }
  for (const s of [-1, 1]) beamTris(t, [st.x0 - 0.1, st.y0, st.z + s * 0.56], [st.x1 + 0.05, st.y1 - 0.25, st.z + s * 0.56], 0.05, 0.3);
  bag.add(WD, fromTriangles(t));
  bag.add(WD, rod([st.x0 + 0.1, st.y0 + 0.95, st.z + 0.62], [st.x1, st.y1 + 0.8, st.z + 0.62], 0.035, 6));
  for (let k = 0; k <= 3; k++) { const xa = st.x0 + 0.1 + k * (st.x1 - st.x0 - 0.1) / 3, ya = st.y0 + (xa - st.x0) / RUN * rise; bag.add(WD, box(xa - 0.03, ya, st.z + 0.59, xa + 0.03, ya + 0.95, st.z + 0.65)); }
  void RISE;
}


/** yagura: a turret { rect, y, storeys (1–3), top ('xieshan'|'hip') }: plastered storeys stepping in, each under a tiled roof. */
function yagura(el, { bag, col }) {
  let [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  const n = el.storeys ?? 2, h = el.h ?? 3.6;
  for (let i = 0; i < n; i++) {
    const rect = [x0, z0, x1, z1], last = i === n - 1;
    tierBox(bag, col, rect, y, h);
    roof(bag, rect, y + h - 0.2, 1.2, last ? (el.top || 'xieshan') : 'hip', (Math.min(x1 - x0, z1 - z0) / 2 + 1.2) * (last ? 0.7 : 0.55));
    y += h;
    const s = Math.min(x1 - x0, z1 - z0) * 0.12;
    x0 += s; z0 += s; x1 -= s; z1 -= s;
  }
}

/** watari: a roofed passage or long gallery { rect, y, storeys, h }: plastered, windowed, under a hip-and-gable roof. */
function watari(el, { bag, col }) {
  const rect = el.rect, y = el.y ?? 0, n = el.storeys ?? 1, h = el.h ?? 3.6;
  tierBox(bag, col, rect, y, h * n);
  if (n > 1) { const [x0, z0, x1, z1] = rect; bag.add(TL, box(x0 - 0.5, y + h - 0.1, z0 - 0.5, x1 + 0.5, y + h + 0.15, z1 + 0.5)); }
  col.floor(rect, y);
  roof(bag, rect, y + h * n - 0.2, 1.1, el.top || 'xieshan', (Math.min(rect[2] - rect[0], rect[3] - rect[1]) / 2 + 1.1) * 0.7);
}

/** yagura_mon: a gate-house { rect, y, alongX (the passage runs along z when false) }: two stone-footed piers, the upper storey across, its roof; the passage open. */
function yaguraMon(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 4.5, w = el.passage ?? 5;
  const throughZ = (x1 - x0) > (z1 - z0);              // the long side spans the passage
  const cxm = (x0 + x1) / 2, czm = (z0 + z1) / 2;
  const piers = throughZ ? [[x0, z0, cxm - w / 2, z1], [cxm + w / 2, z0, x1, z1]] : [[x0, z0, x1, czm - w / 2], [x0, czm + w / 2, x1, z1]];
  for (const r of piers) { bag.add(ST, box(r[0], y, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h); }
  // the gate's doors (open), the upper storey
  const pass = throughZ ? [cxm - w / 2, z0, cxm + w / 2, z1] : [x0, czm - w / 2, x1, czm + w / 2];
  bag.add(WD, box(pass[0], y + h - 0.6, pass[1], pass[2], y + h, pass[3]));
  tierBox(bag, col, [x0, z0, x1, z1], y + h, 3.4);
  col.floor([x0, z0, x1, z1], y + h + 3.4);
  roof(bag, [x0, z0, x1, z1], y + h + 3.2, 1.2, 'xieshan', (Math.min(x1 - x0, z1 - z0) / 2 + 1.2) * 0.7);
}

/** shoin: a single-storey hall { rect, y, h } on a raised floor, posts and paper screens, a veranda, a big tiled roof. */
function shoinHall(bag, col, rect, y, h = 3.4, kind = 'xieshan', rmat = TL, bay = 1.8) {
  const [x0, z0, x1, z1] = rect;
  bag.add('timber', box(x0 - 1, y, z0 - 1, x1 + 1, y + 0.6, z1 + 1));
  col.rect(rect, y, y + h + 0.6); col.floor([x0 - 1, z0 - 1, x1 + 1, z1 + 1], y + 0.6);
  bag.add(PL, box(x0, y + 0.6, z0, x1, y + 0.6 + h, z1));
  for (const [a, b] of faces(rect, 0.05)) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / bay)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (let i = 0; i < n; i++) { const s0 = i * L / n + 0.12, s1 = (i + 1) * L / n - 0.12, t = []; beamTris(t, [a[0] + ux * s0, y + 0.6, a[1] + uz * s0], [a[0] + ux * s1, y + 0.6, a[1] + uz * s1], 0.04, h - 0.5); bag.add('shoji', fromTriangles(t)); }
    for (let i = 0; i <= n; i++) { const s = i * L / n, c = [a[0] + ux * s, a[1] + uz * s]; bag.add(WD, box(c[0] - 0.12, y + 0.6, c[1] - 0.12, c[0] + 0.12, y + 0.6 + h, c[1] + 0.12)); }
  }
  roof(bag, [x0 - 1, z0 - 1, x1 + 1, z1 + 1], y + 0.6 + h - 0.1, 0.9, kind, undefined, { mat: rmat });
}
function goten(el, { bag, col }) {
  for (const r of el.halls) shoinHall(bag, col, r, el.y ?? 0, r[4] ?? 3.6);
}

/** kura: a storehouse { rect, y }: thick white walls, a dark plinth, a tiled gable roof. */
function kura(bag, col, rect, y = 0) {
  const [x0, z0, x1, z1] = rect;
  bag.add('plaster_grey', box(x0, y, z0, x1, y + 1, z1));
  bag.add(PL, box(x0, y + 1, z0, x1, y + 5.4, z1));
  col.rect(rect, y, y + 5.4); col.floor(rect, y + 5.4);
  roof(bag, rect, y + 5.3, 0.5, 'gable', Math.min(x1 - x0, z1 - z0) * 0.35, { sweep: 0 });
}

/** yashiki: a samurai compound { rect, seed, gate ('n'|'s'|'e'|'w') }: walls with tile copings, the gate-house on the street, the main house, a storehouse, a garden. */
function yashiki(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, g = el.gate || 's';
  const W = x1 - x0, D = z1 - z0;
  // the gate-house (nagaya-mon) along the street side, the walls round the rest
  const gl = Math.min(18, (g === 'n' || g === 's' ? W : D) * 0.55), gd = 4.5;
  let gate;
  if (g === 's') gate = [(x0 + x1) / 2 - gl / 2, z1 - gd, (x0 + x1) / 2 + gl / 2, z1];
  else if (g === 'n') gate = [(x0 + x1) / 2 - gl / 2, z0, (x0 + x1) / 2 + gl / 2, z0 + gd];
  else if (g === 'e') gate = [x1 - gd, (z0 + z1) / 2 - gl / 2, x1, (z0 + z1) / 2 + gl / 2];
  else gate = [x0, (z0 + z1) / 2 - gl / 2, x0 + gd, (z0 + z1) / 2 + gl / 2];
  const wall = (a, b) => dobei({ a, b, h: 2.3 }, { bag, col });
  const sides = { n: [[x0, z0], [x1, z0]], s: [[x0, z1], [x1, z1]], w: [[x0, z0], [x0, z1]], e: [[x1, z0], [x1, z1]] };
  for (const [k, [a, b]] of Object.entries(sides)) {
    if (k !== g) { wall(a, b); continue; }
    if (k === 'n' || k === 's') { wall(a, [gate[0], a[1]]); wall([gate[2], a[1]], b); } else { wall(a, [a[0], gate[1]]); wall([a[0], gate[3]], b); }
  }
  const [gx0, gz0, gx1, gz1] = gate;
  bag.add('plaster_grey', box(gx0, 0, gz0, gx1, 1.1, gz1));
  bag.add(PL, box(gx0, 1.1, gz0, gx1, 3.6, gz1));
  col.rect(gate, 0, 3.6);
  roof(bag, gate, 3.5, 0.7, 'gable', Math.min(gx1 - gx0, gz1 - gz0) * 0.4, { sweep: 0 });
  // the main house in the middle-back, the storehouse in a corner
  const m = 5;
  let house;
  if (g === 's') house = [x0 + m, z0 + m, x1 - m - (W > 30 ? 8 : 0), z0 + m + D * 0.42];
  else if (g === 'n') house = [x0 + m + (W > 30 ? 8 : 0), z1 - m - D * 0.42, x1 - m, z1 - m];
  else if (g === 'e') house = [x0 + m, z0 + m, x0 + m + W * 0.45, z1 - m - 6];
  else house = [x1 - m - W * 0.45, z0 + m + 6, x1 - m, z1 - m];
  shoinHall(bag, col, house, 0, 3.2, rand() < 0.75 ? 'xieshan' : 'hip', TL, el.simple ? 3.6 : 1.8);
  const kr = g === 's' ? [x1 - 9, z0 + 4, x1 - 3, z0 + 11] : g === 'n' ? [x0 + 3, z1 - 11, x0 + 9, z1 - 4] : g === 'e' ? [x1 - 11, z0 + 3, x1 - 4, z0 + 9] : [x0 + 4, z1 - 9, x0 + 11, z1 - 3];
  if (rand() < 0.8) kura(bag, col, kr);
}

/** machiya: a merchant's townhouse { rect, seed, front ('n'|'s') }: two storeys at the street — the lattice front below, a pent roof, the low upper storey with its plastered slatted windows — under a tiled roof with the ridge along the street; a storehouse at the back. */
function machiya(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, f = el.front || 's', dep = Math.min(11, z1 - z0);
  const r = f === 's' ? [x0, z1 - dep, x1, z1] : [x0, z0, x1, z0 + dep];
  const fz = f === 's' ? r[3] : r[1], s = f === 's' ? 1 : -1, H1 = 3.2, H2 = 2.5 + rand() * 0.6;
  bag.add(PL, box(r[0], 0, r[1], r[2], H1 + H2, r[3]));
  col.rect(r, 0, H1 + H2);
  // the front: lattice and an entrance below, the upper windows
  { const t = []; beamTris(t, [x0 + 0.2, 0.3, fz + s * 0.04], [x1 - 0.2, 0.3, fz + s * 0.04], 0.04, H1 - 0.5); bag.add('koshi', fromTriangles(t)); }
  bag.add(WD, box(x0, H1 - 0.25, Math.min(fz, fz + s * 0.1), x1, H1, Math.max(fz, fz + s * 0.1)));
  for (const [u0, u1] of [[0.12, 0.4], [0.6, 0.88]]) { const t = [], xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1; beamTris(t, [xa, H1 + 0.8, fz + s * 0.05], [xb, H1 + 0.8, fz + s * 0.05], 0.04, Math.max(0.5, H2 - 1.6)); bag.add('koshi', fromTriangles(t)); }
  // the pent roof over the street, the main roof (ridge along the street)
  const pent = f === 's' ? [x0, fz - 0.2, x1, fz + 1.1] : [x0, fz - 1.1, x1, fz + 0.2];
  const pt = [], ye = H1 + 0.05;
  const o = f === 's' ? [[pent[0], ye + 0.6, pent[1]], [pent[2], ye + 0.6, pent[1]], [pent[2], ye, pent[3]], [pent[0], ye, pent[3]]] : [[pent[0], ye, pent[1]], [pent[2], ye, pent[1]], [pent[2], ye + 0.6, pent[3]], [pent[0], ye + 0.6, pent[3]]];
  pt.push(...o[0], ...o[1], ...o[2], ...o[0], ...o[2], ...o[3]);
  bag.add(TL, fromTriangles(pt.concat([...o[0], ...o[2], ...o[1], ...o[0], ...o[3], ...o[2]])));
  roof(bag, r, H1 + H2 - 0.1, 0.6, 'gable', dep * 0.3, { alongZ: false, sweep: 0 });
  col.floor(r, H1 + H2);
  // the storehouse at the back
  if (z1 - z0 > 22 && rand() < 0.6) { const kz = f === 's' ? z0 + 2 : z1 - 9; kura(bag, col, [x0 + 0.6, kz, Math.min(x1 - 0.6, x0 + 6), kz + 7]); }
}

registerStyle('edo', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ishigaki, dobei, tenshu: J(tenshu), yagura: J(yagura), watari: J(watari), yagura_mon: J(yaguraMon), goten: J(goten), yashiki: J(yashiki), machiya: J(machiya),
  },
  objects: {},
});
