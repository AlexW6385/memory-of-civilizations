// Edo Japanese architecture (c. 1600–1620; docs/settlements/edo-himeji.md §4–§5): the castle —
// stone ramparts with the curved batter, white plastered walls, grey tiled roofs (hip-and-gable at
// the top, hips on the lower tiers, triangular gables on the slopes), the keep of five tiers, small
// keeps and turrets, roofed passages, walls with tile copings, gate-houses; the lord's residence of
// single-storey halls; the samurai compounds; the merchants' townhouses (machiya). Roofs come from
// the ming style's rectRoof with a Japanese palette and a gentler curve.

import { registerStyle, STYLES } from '../../core/build.js';
import { Matrix4 } from '../../core/three.js';
import { box, frustum, fromTriangles, orientOutward, rod, lathe } from '../../core/geom.js';
import { rectRoof, withPal, beamTris } from '../ming/index.js';
import '../qing/index.js';
import { barredWindows, shachi as shachiFish, karaHafu, samaWall, katomado } from './detail.js';
import { machiyaShop, zashiki, kago, daisho } from './rooms.js';
import { yashikiParts } from './yard.js';
import { machiyaFront, mushikoMado, ridgeCap, eaveBand, kuraWalls, gateFront, ishidoro, niwaki, ido, boat, barrel } from './town.js';

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
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0 ?? 0, y1 = el.y1, b = el.batter ?? (y1 - y0) * 0.3, N = Math.max(6, Math.min(16, Math.round((y1 - y0) / 0.95)));
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
    quoins([x0, z0, x1, z1], sd, y0, y1, out, N, bag);
    if (el.walk !== false) col.floor([x0, z0, x1, z1], y1);
  }
}

/**
 * The corners of a rampart are laid with long-and-short dressed blocks (sangi-zumi): in every course a long block on one
 * face and a short one on the other, alternating, in lighter granite standing a hand out of the curved face.
 */
function quoins([x0, z0, x1, z1], sd, y0, y1, out, N, bag) {
  const p = 0.08;
  for (const [cx, cz, kx, kz, on] of [[x0, z0, -1, -1, sd.w && sd.n], [x1, z0, 1, -1, sd.e && sd.n], [x0, z1, -1, 1, sd.w && sd.s], [x1, z1, 1, 1, sd.e && sd.s]]) {
    if (!on) continue;
    for (let k = 0; k < N; k++) {
      const t0 = k / N, t1 = (k + 1) / N, ya = y0 + (y1 - y0) * t0 + 0.02, yb = y0 + (y1 - y0) * t1 - 0.02, o = out(t0), X = cx + kx * o, Z = cz + kz * o;
      const lx = k % 2 ? 1.1 : 0.55, lz = k % 2 ? 0.55 : 1.1, bx = (a, b) => [Math.min(a, b), Math.max(a, b)];
      const [ax0, ax1] = bx(X, X - kx * lx), [az0, az1] = bx(Z + kz * p, Z);
      bag.add('granite_grey', box(ax0, ya, az0, ax1, yb, az1));
      const [bx0, bx1] = bx(X + kx * p, X), [bz0, bz1] = bx(Z, Z - kz * lz);
      bag.add('granite_grey', box(bx0, ya, bz0, bx1, yb, bz1));
      const [cx0, cx1] = bx(X + kx * p, X), [cz0, cz1] = bx(Z + kz * p, Z);
      bag.add('granite_grey', box(cx0, ya, cz0, cx1, yb, cz1));
    }
  }
}

/** dobei: a plastered earthen wall a→b { y, h } on a stone footing, under a little tiled roof. */
function dobei(el, { bag, col }) {
  const a = el.a, b = el.b, y = el.y ?? 0, h = el.h ?? 2.2, t = [];
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) return;
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], 0.3, 0.5); bag.add(ST, fromTriangles(t));
  if (el.sama) samaWall(bag, a, b, y + 0.5, y + h, 0.24);
  else { const t2 = []; beamTris(t2, [a[0], y + 0.5, a[1]], [b[0], y + 0.5, b[1]], 0.24, h - 0.5); bag.add(el.mat ?? PL, fromTriangles(t2)); }
  sweepSection(bag, TL, a, b, [[-0.55, y + h - 0.05], [0, y + h + 0.45], [0.55, y + h - 0.05], [0.3, y + h - 0.15], [-0.3, y + h - 0.15]]);
  col.segment(a, b, 0.6, y, y + h + 0.4);
}

/** A tier of a keep or turret: the plastered box with rows of windows, a dark base band. */
function tierBox(bag, col, rect, y, h, nWin) {
  const [x0, z0, x1, z1] = rect;
  bag.add(PL, box(x0, y, z0, x1, y + h, z1));
  col.rect(rect, y, y + h);
  tierWindows(bag, rect, y, h, nWin);
}
/** The barred windows round a tier, at the height and spacing the keep's inside shares. */
function tierWindows(bag, rect, y, h, nWin) {
  for (const [a, b] of faces(rect, 0)) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); barredWindows(bag, a, b, y + h * 0.42, h * 0.3, nWin ?? Math.max(1, Math.round(L / 3.2)), Math.min(1.2, L / 8)); }
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
function shachi(bag, a, b, y, h = 1.9) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  shachiFish(bag, a, y, d, h); shachiFish(bag, b, y, [-d[0], -d[1]], h);
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
    if (H) tierWindows(bag, rect, y, t.h);
    // the stone-drop bays (ishi-otoshi) at the corners of the lowest storey: plastered boxes standing
    // out of the wall, open below so that stones could be dropped on the foot of the base
    if (i === 0 && el.ishiOtoshi) {
      const [x0, z0, x1, z1] = rect, o = 0.7, w = 2.2, yb = y + 1.0, yt = y + t.h - 1.3;
      for (const [bx0, bz0, bx1, bz1] of [[x0 + 0.5, z1, x0 + 0.5 + w, z1 + o], [x1 - 0.5 - w, z1, x1 - 0.5, z1 + o], [x0 + 0.5, z0 - o, x0 + 0.5 + w, z0], [x1 - 0.5 - w, z0 - o, x1 - 0.5, z0],
        [x1, z0 + 0.5, x1 + o, z0 + 0.5 + w], [x1, z1 - 0.5 - w, x1 + o, z1 - 0.5], [x0 - o, z0 + 0.5, x0, z0 + 0.5 + w], [x0 - o, z1 - 0.5 - w, x0, z1 - 0.5]]) {
        const ins = (a, b) => [Math.min(a, b), Math.max(a, b)];
        bag.add(PL, box(bx0, yb, bz0, bx1, yt, bz1));
        bag.add(TL, box(bx0 - 0.15, yt, bz0 - 0.15, bx1 + 0.15, yt + 0.18, bz1 + 0.15));
        const sx = ins(bx0 + 0.15, bx1 - 0.15), sz = ins(bz0 + 0.15, bz1 - 0.15);
        bag.add('lacquer_black', box(sx[0], yb - 0.03, sz[0], sx[1], yb + 0.02, sz[1]));
        col.rect([bx0, bz0, bx1, bz1], yb, yt);
      }
    }
    if (H) hollowTier(bag, col, rect, y, t.h, i, { T, below: i ? rects[i - 1] : el.basementRect ?? rect, hole: stairs.find((s) => s.into === i)?.hole, keep: stairs.filter((s) => s.into === i || s.y0 === y).map((s) => s.hole), racks: i < 3 });
    else { tierBox(bag, col, rect, y, t.h); col.floor(rect, y); }
    const ov = last ? 1.6 : 1.9;
    if (last) {
      roof(bag, rect, y + t.h - 0.2, ov, 'xieshan', (Math.min(t.hw, t.hd) + ov) * 0.75);
      const alongZ = t.hd > t.hw, L = (alongZ ? t.hd : t.hw) + ov - (Math.min(t.hw, t.hd) + ov), top = y + t.h - 0.2 + (Math.min(t.hw, t.hd) + ov) * 0.75;
      shachi(bag, alongZ ? [cx, cz - L] : [cx - L, cz], alongZ ? [cx, cz + L] : [cx + L, cz], top + 0.2, 1.9 * Math.min(1, Math.min(t.hw, t.hd) / 5.3));
      if (H) { bag.add(WD, box(rect[0] + T, y + t.h - 0.3, rect[1] + T, rect[2] - T, y + t.h, rect[3] - T)); }
    } else {
      roof(bag, rect, y + t.h - 0.2, ov, 'hip', (Math.min(t.hw, t.hd) + ov) * 0.62, H ? { hole: rects[i + 1] } : {});
      const gables = [...((el.kara || {})[i] || []).map((d) => [d, 'kara']), ...((el.chidori || []).includes(i) ? ['n', 's', 'e', 'w'].filter((d) => !((el.kara || {})[i] || []).includes(d)).map((d) => [d, 'chidori']) : [])];
      for (const [dir, kind] of gables) {
        const n = el.tiers[i + 1], E = (dir === 'n' || dir === 's' ? t.hd - n.hd : t.hw - n.hw) + ov, B = Math.min(t.hw, t.hd) + ov, R = B * 0.62, ye = y + t.h - 0.2;
        const nn = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dir], half = dir === 'n' || dir === 's' ? n.hd : n.hw;
        const roofAt = (dd) => ye + R * Math.pow(Math.max(0, Math.min(1, (E - dd) / B)), 1.25);
        const W = kind === 'kara' ? Math.min(7, (dir === 'n' || dir === 's' ? n.hw : n.hd) * 0.85) : Math.min(6, (dir === 'n' || dir === 's' ? n.hw : n.hd) * 0.9), D = E - 0.45;
        karaHafu(bag, { c: [cx + nn[0] * half, cz + nn[1] * half], n: nn, W, D, yb: roofAt(D) + 0.45, H: W * (kind === 'kara' ? 0.24 : 0.4), roofAt, kind });
      }
      if (false) {
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


/**
 * yagura: a turret { rect, y, storeys (1–3), top ('xieshan'|'hip'), h, gables (faces of the lower
 * roof carrying a gable, e.g. 'ns') }: plastered storeys stepping in, each under a tiled roof; on the
 * ground storey stone-drop bays standing out at the corners; a triangular gable (chidori-hafu) on
 * the lower roof's faces; shachi on the top ridge's ends.
 */
function yagura(el, { bag, col }) {
  let [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  const n = el.storeys ?? 2, h = el.h ?? 3.6, ov = 1.2;
  for (let i = 0; i < n; i++) {
    const rect = [x0, z0, x1, z1], last = i === n - 1, mn = Math.min(x1 - x0, z1 - z0), s = mn * 0.12;
    tierBox(bag, col, rect, y, h);
    if (i === 0) turretBays(bag, col, rect, y, h);
    const B = mn / 2 + ov, rise = B * (last ? 0.7 : 0.55);
    roof(bag, rect, y + h - 0.2, ov, last ? (el.top || 'xieshan') : 'hip', rise);
    if (last) {
      const alongZ = z1 - z0 > x1 - x0, L = (alongZ ? z1 - z0 : x1 - x0) / 2 - mn / 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, top = y + h - 0.2 + rise;
      if (L > 0.6 && (el.top || 'xieshan') === 'xieshan') shachi(bag, alongZ ? [cx, cz - L] : [cx - L, cz], alongZ ? [cx, cz + L] : [cx + L, cz], top + 0.15, Math.min(1.3, mn * 0.13));
    } else {
      // the gables on the faces of this roof, standing against the storey above
      const up = [x0 + s, z0 + s, x1 - s, z1 - s], E = s + ov, R = rise, ye = y + h - 0.2;
      const roofAt = (dd) => ye + R * Math.pow(Math.max(0, Math.min(1, (E - dd) / B)), 1.25);
      for (const dir of el.gables ?? 'ns') {
        const nn = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dir], ns = dir === 'n' || dir === 's';
        const half = ns ? (up[3] - up[1]) / 2 : (up[2] - up[0]) / 2, W = Math.min(4.2, (ns ? up[2] - up[0] : up[3] - up[1]) * 0.6), D = E - 0.35;
        karaHafu(bag, { c: [(x0 + x1) / 2 + nn[0] * half, (z0 + z1) / 2 + nn[1] * half], n: nn, W, D, yb: roofAt(D) + 0.4, H: W * 0.4, roofAt, kind: 'chidori' });
      }
    }
    y += h;
    x0 += s; z0 += s; x1 -= s; z1 -= s;
  }
}
/** A turret's stone-drop bays: one on each face, between its first and second windows (alternating ends round the turret), clear of them. */
function turretBays(bag, col, rect, y, h) {
  const o = 0.6, yb = y + Math.min(1.0, h * 0.25), yt = y + h - Math.min(1.3, h * 0.33), list = [];
  faces(rect, 0).forEach(([a, b], k) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nw = Math.max(1, Math.round(L / 3.2)), ww = Math.min(1.2, L / 8), gap = L / nw - ww - 0.3;
    if (nw < 2 || gap < 0.8) return;
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, sc = k % 2 ? L - L / nw : L / nw, w = Math.min(1.7, gap);
    const p = [a[0] + ux * (sc - w / 2), a[1] + uz * (sc - w / 2)], q = [a[0] + ux * (sc + w / 2) + nx * o, a[1] + uz * (sc + w / 2) + nz * o];
    list.push([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]);
  });
  for (const [bx0, bz0, bx1, bz1] of list) {
    bag.add(PL, box(bx0, yb, bz0, bx1, yt, bz1));
    bag.add(TL, box(bx0 - 0.15, yt, bz0 - 0.15, bx1 + 0.15, yt + 0.18, bz1 + 0.15));
    bag.add('lacquer_black', box(bx0 + 0.12, yb - 0.03, bz0 + 0.12, bx1 - 0.12, yb + 0.02, bz1 - 0.12));
    col.rect([bx0, bz0, bx1, bz1], yb, yt);
  }
}
/** watari: a roofed passage or long gallery { rect, y, storeys, h }: plastered, windowed, under a hip-and-gable roof. */
function watari(el, { bag, col }) {
  const rect = el.rect, y = el.y ?? 0, n = el.storeys ?? 1, h = el.h ?? 3.6;
  if (el.gate) watariGate(bag, col, rect, y, h * n, el.gate);
  else tierBox(bag, col, rect, y, h * n);
  if (n > 1) { const [x0, z0, x1, z1] = rect; bag.add(TL, box(x0 - 0.5, y + h - 0.1, z0 - 0.5, x1 + 0.5, y + h + 0.15, z1 + 0.5)); }
  col.floor(rect, y);
  roof(bag, rect, y + h * n - 0.2, 1.1, el.top || 'xieshan', (Math.min(rect[2] - rect[0], rect[3] - rect[1]) / 2 + 1.1) * 0.7);
}

/**
 * A gate through the ground storey of a roofed passage { at (along the long side), w, h }: the
 * passage crosses the short side; plastered piers either side, the storeys over it on a lintel beam;
 * at the outer mouth two posts and a head beam (kabuki) of dark timber, the two leaves of planks
 * sheathed in iron strips with rows of bosses, standing open against the passage's walls; a plank
 * ceiling under the storey above.
 */
function watariGate(bag, col, rect, y, H, g) {
  const [x0, z0, x1, z1] = rect, alongX = x1 - x0 >= z1 - z0, w = g.w ?? 2.6, gh = g.h ?? 3.0, a = g.at - w / 2, b = g.at + w / 2;
  // in local terms: u along the long side (the gate at u = at), v across (the passage runs along v)
  const R = (u0, v0, u1, v1) => (alongX ? [u0, v0, u1, v1] : [v0, u0, v1, u1]);
  const [U0, V0, U1, V1] = alongX ? [x0, z0, x1, z1] : [z0, x0, z1, x1];
  for (const r of [R(U0, V0, a, V1), R(b, V0, U1, V1)]) { bag.add(PL, box(r[0], y, r[1], r[2], y + gh, r[3])); col.rect(r, y, y + gh); }
  // the storeys over the passage, the windows of the upper one only
  bag.add(PL, box(x0, y + gh, z0, x1, y + H, z1)); col.rect(rect, y + gh, y + H);
  tierWindows(bag, rect, y + H / 2, H / 2);
  const cr = R(a, V0, b, V1);
  bag.add(WD, box(cr[0], y + gh - 0.08, cr[1], cr[2], y + gh - 0.02, cr[3]));
  for (let k = 1; k < 5; k++) { const v = V0 + (V1 - V0) * k / 5, r = R(a, v - 0.09, b, v + 0.09); bag.add(WD, box(r[0], y + gh - 0.26, r[1], r[2], y + gh - 0.08, r[3])); }
  // the gate's frame at the outer mouth (v = V0 when g.side is 'lo', else V1): posts, head beam, a sill at the ground
  const vo = g.side === 'hi' ? V1 : V0, s = g.side === 'hi' ? -1 : 1, d = 0.32;
  const fr = (u0, u1, yy0, yy1, vv0, vv1) => { const r = R(u0, Math.min(vv0, vv1), u1, Math.max(vv0, vv1)); bag.add(WD, box(r[0], yy0, r[1], r[2], yy1, r[3])); return r; };
  for (const u of [a, b]) { const r = fr(u - (u === a ? 0.02 : 0.34), u + (u === a ? 0.34 : 0.02), y, y + gh, vo - s * 0.04, vo + s * d); col.rect(r, y, y + gh); }
  fr(a - 0.25, b + 0.25, y + gh - 0.45, y + gh - 0.02, vo - s * 0.06, vo + s * (d + 0.04));
  // iron bands round the head beam's ends, a little boss at each
  for (const u of [a + 0.1, b - 0.1]) { const r = R(u - 0.16, Math.min(vo - s * 0.08, vo + s * (d + 0.06)), u + 0.16, Math.max(vo - s * 0.08, vo + s * (d + 0.06))); bag.add('iron', box(r[0], y + gh - 0.47, r[1], r[2], y + gh, r[3])); }
  // the leaves, opened back against the side walls inside the mouth
  const lw = w / 2 - 0.36, lt = 0.1;
  for (const [u, sg] of [[a + 0.34, 1], [b - 0.34, -1]]) {
    const v0 = vo + s * (d + 0.06), v1 = v0 + s * lw, uu0 = sg > 0 ? u : u - lt, uu1 = sg > 0 ? u + lt : u;
    fr(uu0, uu1, y + 0.04, y + gh - 0.5, v0, v1);
    // the iron strips across the leaf, and the bosses in rows
    const fu = sg > 0 ? uu1 : uu0, o = sg > 0 ? 0.015 : -0.015;
    for (let k = 0; k < 6; k++) { const yy = y + 0.25 + k * (gh - 0.95) / 5; fr(Math.min(fu, fu + o), Math.max(fu, fu + o), yy, yy + 0.09, v0, v1); }
    for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) { const yy = y + 0.25 + k * (gh - 0.95) / 5 + 0.045, vv = v0 + s * (0.2 + j * (lw - 0.4) / 2); bag.add('iron', boxAt(R, fu + o * 2, vv, yy, 0.03, 0.05)); }
    col.rect(R(uu0, Math.min(v0, v1), uu1, Math.max(v0, v1)), y, y + gh - 0.5);
  }
}
/** A small cube (a boss) at local (u, v), height y, half-sizes hu across the leaf's face and h. */
function boxAt(R, u, v, y, hu, h) { const r = R(u - hu, v - h, u + hu, v + h); return box(r[0], y - h, r[1], r[2], y + h, r[3]); }

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

/**
 * hishi_mon: the Hishi gate, the turret gate at the entrance of the Ninomaru { rect, y, passage, h }
 * (docs/settlements/edo-himeji.md §4): the passage through the middle along z, the guard room on the
 * west and a plastered pier on the east on stone footings; the white plaster leaving the posts, the
 * tie beams and the head beam (kabuki) bare, of dark zelkova; on the head beam over the two main posts
 * the carved diamond crests (hishi) that name the gate; the two great leaves standing open, bound
 * with iron strips and studded with bosses; over all the storey for the garrison, its front (south)
 * with a row of warrior windows between two bell-shaped windows framed in black lacquer with gilt
 * fittings, its back with a double row of warrior windows; a hip-and-gable roof with shachi.
 */
function hishiMon(el, ctx) {
  if (el.front !== 's') return hishiMonN(el, ctx);
  // facing south: built facing north, then mirrored across the gate's middle (the triangles turned back)
  const [, z0, , z1] = el.rect, m = z0 + z1, fz = (r) => [r[0], m - r[3], r[2], m - r[1]];
  const M = new Matrix4().makeTranslation(0, 0, m).multiply(new Matrix4().makeScale(1, 1, -1));
  const bag = { add: (mat, g) => { if (!g) return; if (g.index) g = g.toNonIndexed(); g.applyMatrix4(M); for (const k of ['position', 'normal']) { const A = g.attributes[k]?.array; if (!A) continue; for (let i = 0; i < A.length; i += 9) for (let j = 0; j < 3; j++) { const t = A[i + 3 + j]; A[i + 3 + j] = A[i + 6 + j]; A[i + 6 + j] = t; } } ctx.bag.add(mat, g); } };
  const col = { rect: (r, y0, y1) => ctx.col.rect(fz(r), y0, y1), floor: (r, y) => ctx.col.floor(fz(r), y) };
  return hishiMonN(el, { ...ctx, bag, col });
}
function hishiMonN(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 4.4, w = el.passage ?? 5, H2 = el.h2 ?? 3.8, cx = (x0 + x1) / 2;
  const a = cx - w / 2, b = cx + w / 2, P = 0.55, F = 0.6;
  // the footings, the guard room and the pier, plastered
  for (const [u0, u1] of [[x0, a - P], [b + P, x1]]) {
    bag.add(ST, box(u0, y, z0, u1, y + F, z1)); bag.add(PL, box(u0 + 0.05, y + F, z0 + 0.05, u1 - 0.05, y + h, z1 - 0.05)); col.rect([u0, z0, u1, z1], y, y + h);
  }
  // the guard room's barred window onto the passage and its door at the back
  barredWindows(bag, [a - P, z1 - 2.2], [a - P, z0 + 2.2], y + 1.4, 1.0, 2, 1.1);
  bag.add(WD, box(x0 + 1.2, y + F, z1 - 0.07, x0 + 2.4, y + 2.6, z1 - 0.03));
  // the exposed frame: the main posts and the back posts, the tie beams, the head beam, a post line on the faces
  for (const u of [a - P, b]) for (const [za, zb] of [[z0 - 0.08, z0 + 0.6], [z1 - 0.6, z1 + 0.08]]) { bag.add(WD, box(u, y, za, u + P, y + h, zb)); col.rect([u, za, u + P, zb], y, y + h); }
  const face = (zf, o) => {
    bag.add(WD, box(x0 - 0.06, y + h - 0.85, Math.min(zf, zf + o), x1 + 0.06, y + h - 0.1, Math.max(zf, zf + o)));                // the head beam
    bag.add(WD, box(x0, y + h * 0.5, Math.min(zf, zf + o * 0.6), a - P, y + h * 0.5 + 0.3, Math.max(zf, zf + o * 0.6)));          // the tie beams
    bag.add(WD, box(b + P, y + h * 0.5, Math.min(zf, zf + o * 0.6), x1, y + h * 0.5 + 0.3, Math.max(zf, zf + o * 0.6)));
    for (const u of [x0 + 0.02, (x0 + a - P) / 2, (b + P + x1) / 2, x1 - 0.32]) bag.add(WD, box(u, y + F, Math.min(zf, zf + o * 0.5), u + 0.3, y + h - 0.85, Math.max(zf, zf + o * 0.5)));
  };
  face(z0 + 0.05, -0.16); face(z1 - 0.05, 0.16);
  // the diamond crests on the head beam over the main posts, and iron bands on its ends
  for (const u of [a - P / 2, b + P / 2]) {
    const yc = y + h - 0.48, t = [];
    const D = (dx, dy, dz) => [u + dx, yc + dy, z0 - 0.11 - dz];
    for (const [r, dz, m] of [[0.34, 0, WD], [0.22, 0.05, 'gilt_bronze']]) {
      const q = [D(0, r, dz), D(r * 0.8, 0, dz), D(0, -r, dz), D(-r * 0.8, 0, dz)];
      const qq = [];
      plateRhomb(qq, q, 0.06);
      bag.add(m, fromTriangles(orientOutward(qq)));
    }
    void t;
  }
  for (const u of [x0 + 0.25, x1 - 0.55]) bag.add('iron', box(u, y + h - 0.88, z0 - 0.13, u + 0.3, y + h - 0.07, z0 + 0.1));
  // the leaves, open inward against the posts, iron strips and bosses
  const lw = w / 2 - 0.05;
  for (const [u, sg] of [[a + 0.02, 1], [b - 0.14, -1]]) {
    const v0 = z0 + 0.65, v1 = v0 + lw;
    bag.add(WD, box(u, y + 0.05, v0, u + 0.12, y + h - 0.9, v1)); col.rect([u, v0, u + 0.12, v1], y, y + h - 0.9);
    const fu = sg > 0 ? u + 0.12 : u;
    for (let k = 0; k < 7; k++) { const yy = y + 0.3 + k * (h - 1.5) / 6; bag.add('iron', box(Math.min(fu, fu + sg * 0.015), yy, v0, Math.max(fu, fu + sg * 0.015), yy + 0.1, v1));
      for (let j = 0; j < 4; j++) { const vv = v0 + 0.25 + j * (lw - 0.5) / 3; bag.add('iron', box(Math.min(fu, fu + sg * 0.05), yy + 0.02, vv - 0.035, Math.max(fu, fu + sg * 0.05), yy + 0.08, vv + 0.035)); } }
  }
  // the ceiling of planks over the passage
  bag.add(WD, box(a, y + h - 0.12, z0, b, y + h, z1));
  // the upper storey, a tiled band under it
  const yu = y + h;
  bag.add(TL, box(x0 - 0.45, yu - 0.05, z0 - 0.45, x1 + 0.45, yu + 0.18, z1 + 0.45));
  bag.add(PL, box(x0, yu + 0.18, z0, x1, yu + H2, z1)); col.rect(el.rect, yu, yu + H2);
  // the front: the warrior windows between the bell-shaped windows; the back: a double row
  const wy = yu + 1.0;
  barredWindows(bag, [cx + 4.2, z0], [cx - 4.2, z0], wy, 1.0, 4, 1.7);
  for (const sx of [-1, 1]) katomado(bag, [cx + sx * 6.3, z0 - 0.01], [1, 0], [0, -1], wy - 0.15, 1.1, 1.75);
  barredWindows(bag, [x0 + 1.2, z1], [x1 - 1.2, z1], wy - 0.2, 0.75, 6, 1.6);
  barredWindows(bag, [x0 + 1.2, z1], [x1 - 1.2, z1], wy + 0.85, 0.75, 6, 1.6);
  for (const [p, q] of [[[x0, z0], [x0, z1]], [[x1, z1], [x1, z0]]]) barredWindows(bag, p, q, wy, 1.0, 1, 1.4);
  const rise = (Math.min(x1 - x0, z1 - z0) / 2 + 1.4) * 0.72, top = yu + H2 - 0.2 + rise;
  roof(bag, el.rect, yu + H2 - 0.2, 1.4, 'xieshan', rise);
  const L = (x1 - x0) / 2 + 1.4 - (Math.min(x1 - x0, z1 - z0) / 2 + 1.4);
  shachi(bag, [cx - L, (z0 + z1) / 2], [cx + L, (z0 + z1) / 2], top + 0.2, 1.2);
}
/** A rhomb plate (4 points, roughly in a vertical plane facing −z) of thickness t toward +z. */
function plateRhomb(out, q, t) {
  const back = q.map((p) => [p[0], p[1], p[2] + t]);
  const tr = (A, B, C) => out.push(...A, ...B, ...C);
  tr(q[0], q[1], q[2]); tr(q[0], q[2], q[3]);
  tr(back[0], back[2], back[1]); tr(back[0], back[3], back[2]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; tr(q[i], back[i], back[j]); tr(q[i], back[j], q[j]); }
}

/** shoin: a single-storey hall { rect, y, h } on a raised floor, posts and paper screens, a veranda, a big tiled roof. */
function shoinHall(bag, col, rect, y, h = 3.4, kind = 'xieshan', rmat = TL, bay = 1.8, open = null) {
  const [x0, z0, x1, z1] = rect;
  bag.add('timber', box(x0 - 1, y, z0 - 1, x1 + 1, y + 0.6, z1 + 1));
  col.floor([x0 - 1, z0 - 1, x1 + 1, z1 + 1], y + 0.6);
  // a house open inside (docs §5.1): its reception room behind the paper doors of one face, slid open to the veranda
  let skip = () => false;
  if (!open) { col.rect(rect, y, y + h + 0.6); bag.add(PL, box(x0, y + 0.6, z0, x1, y + 0.6 + h, z1)); }
  else skip = zashikiIn(bag, col, rect, y, h, open);
  for (const [fi, [a, b]] of faces(rect, 0.05).entries()) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / bay)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (let i = 0; i < n; i++) { const s0 = i * L / n + 0.12, s1 = (i + 1) * L / n - 0.12, t = []; if (skip(fi, [a[0] + ux * (s0 + s1) / 2, a[1] + uz * (s0 + s1) / 2])) continue; beamTris(t, [a[0] + ux * s0, y + 0.6, a[1] + uz * s0], [a[0] + ux * s1, y + 0.6, a[1] + uz * s1], 0.04, h - 0.5); bag.add('shoji', fromTriangles(t)); }
    for (let i = 0; i <= n; i++) { const s = i * L / n, c = [a[0] + ux * s, a[1] + uz * s]; bag.add(WD, box(c[0] - 0.12, y + 0.6, c[1] - 0.12, c[0] + 0.12, y + 0.6 + h, c[1] + 0.12)); }
  }
  roof(bag, [x0 - 1, z0 - 1, x1 + 1, z1 + 1], y + 0.6 + h - 0.1, 0.9, kind, undefined, { mat: rmat });
}
/**
 * The reception room of an open samurai house: the frame of its front face `open.face`; the room (zashiki, rooms.js)
 * across the middle of that face, the rest of the house filled; a stepping stone before the veranda. Returns which
 * paper doors of the faces to leave out (those of the room's front, slid away).
 */
function zashikiIn(bag, col, [x0, z0, x1, z1], y, h, open) {
  const f = open.face, fl = y + 0.6, top = fl + h;
  const L = f === 'n' || f === 's' ? x1 - x0 : z1 - z0, D = f === 'n' || f === 's' ? z1 - z0 : x1 - x0, ua = f === 'n' || f === 's' ? x0 : z0;
  const at = (u, v, q) => (f === 's' ? [u, v, z1 - q] : f === 'n' ? [u, v, z0 + q] : f === 'e' ? [x1 - q, v, u] : [x0 + q, v, u]);
  const B = (m, u0, u1, v0, v1, q0, q1) => { const p = at(u0, v0, q0), q = at(u1, v1, q1); bag.add(m, box(Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[1], q[1]), Math.max(p[2], q[2]))); };
  const C = (u0, u1, q0, q1, v0, v1) => { const p = at(u0, 0, q0), q = at(u1, 0, q1); col.rect([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], v0, v1); };
  const lat = (m, prof, seg, u, v, q) => { const p = at(u, v, q); bag.add(m, lathe(prof, seg, null, p[0], p[1], p[2])); };
  const W = Math.min(9, L - 2), u0 = ua + (L - W) / 2, u1 = u0 + W, td = 0.75, dq = Math.min(5.4, D - td - 0.6), q1 = dq;
  zashiki(bag, B, C, lat, at, { u0, u1, q0: 0, q1, fl, h, seed: open.seed });
  // the rest of the house, closed behind its paper doors: filled
  const tw = Math.min(1.8, W * 0.32), tu0 = u0 + W * 0.5 - tw - 0.05, tb = Math.min(tu0 + tw + 0.12 + 1.6, u1 - 0.1) + 0.06;
  const fill = (a0, a1, b0, b1) => { if (a1 - a0 > 0.01 && b1 - b0 > 0.01) { B(PL, a0, a1, fl, top, b0, b1); C(a0, a1, b0, b1, y, top); } };
  fill(ua, u0, 0, D); fill(u1, ua + L, 0, D); fill(u0, u1, q1 + td, D); fill(u0, tu0 - 0.06, q1, q1 + td); fill(tb, u1, q1, q1 + td);
  C(u0, u1, -1.0, D, y, fl - 0.02);
  // the stepping stone (kutsunugi-ishi) before the veranda, where the shoes are left
  { const p = at((u0 + u1) / 2, y, -1.45); bag.add('granite_grey', lathe([[0.001, 0], [0.42, 0.0], [0.45, 0.22], [0.38, 0.3], [0.001, 0.31]], 10, null, p[0], y - 0.02, p[2]).scale(1, 1, 1)); col.circle(p[0], p[2], 0.42, y, y + 0.29); }
  const fi = { n: 0, e: 1, s: 2, w: 3 }[f];
  return (k, c) => { if (k !== fi) return false; const u = f === 'n' || f === 's' ? c[0] : c[1]; return u > u0 + 0.2 && u < u1 - 0.2; };
}
function goten(el, { bag, col }) {
  for (const r of el.halls) shoinHall(bag, col, r, el.y ?? 0, r[4] ?? 3.6);
}

/** kura: a storehouse { rect, y }: thick white walls, a dark plinth, a tiled gable roof. */
function kura(bag, col, rect, y = 0) {
  const [x0, z0, x1, z1] = rect;
  kuraWalls(bag, col, rect, y, 5.4);
  col.floor(rect, y + 5.4);
  roof(bag, rect, y + 5.3, 0.5, 'gable', Math.min(x1 - x0, z1 - z0) * 0.35, { sweep: 0 });
  const alongX = x1 - x0 >= z1 - z0, zc = (z0 + z1) / 2, xc = (x0 + x1) / 2, ry = y + 5.3 + Math.min(x1 - x0, z1 - z0) * 0.35;
  if (alongX) ridgeCap(bag, x0 - 0.5, x1 + 0.5, ry, zc, true);
}

/** nagaya: the retainers' row house { rect } along a wall of the yard: plastered, a dark base, doors and barred windows on the yard side, a long tiled gable roof. */
function nagaya(bag, col, rect, g) {
  const [x0, z0, x1, z1] = rect, H = 3.0, alongZ = z1 - z0 > x1 - x0;
  bag.add('plaster_grey', box(x0, 0, z0, x1, 0.5, z1));
  bag.add(PL, box(x0, 0.5, z0, x1, H, z1));
  col.rect(rect, 0, H);
  // the yard side: the face toward the compound's middle
  const sx = alongZ ? (g === 's' || g === 'n' ? -1 : -1) : 1, a = alongZ ? [x0 - 0.02, z0 + 0.6] : [x0 + 0.6, z0 - 0.02], b = alongZ ? [x0 - 0.02, z1 - 0.6] : [x1 - 0.6, z0 - 0.02];
  void sx;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 3.2)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i < n; i++) { const c = [a[0] + ux * (i + 0.5) * L / n, a[1] + uz * (i + 0.5) * L / n], t = []; beamTris(t, [c[0] - ux * 0.5, 0.5, c[1] - uz * 0.5], [c[0] + ux * 0.5, 0.5, c[1] + uz * 0.5], 0.04, 1.9); bag.add('shoji', fromTriangles(t)); }
  roof(bag, rect, H - 0.1, 0.5, 'gable', Math.min(x1 - x0, z1 - z0) * 0.5, { alongZ, sweep: 0 });
}

/** A small side door (kuguri) with its little roof in a wall: at (x, z), the wall running along x when alongX; out = the street side's sign. */
function sideDoor(bag, col, x, z, alongX, out) {
  const w = 0.9, T = (a, b, c, d, e, f) => bag.add(WD, box(a, b, c, d, e, f));
  if (alongX) { T(x - w / 2 - 0.1, 0, z - 0.2, x - w / 2, 1.9, z + 0.2); T(x + w / 2, 0, z - 0.2, x + w / 2 + 0.1, 1.9, z + 0.2); T(x - w / 2 - 0.1, 1.9, z - 0.22, x + w / 2 + 0.1, 2.05, z + 0.22); bag.add('wood_dark', box(x - w / 2, 0.05, z - 0.06, x + w / 2, 1.9, z + 0.06)); bag.add('iron', box(x - w / 2, 0.9, z + out * 0.07, x + w / 2, 0.96, z + out * 0.09)); bag.add(TL, box(x - 0.8, 2.05, z - 0.45, x + 0.8, 2.2, z + 0.45)); }
  else { T(x - 0.2, 0, z - w / 2 - 0.1, x + 0.2, 1.9, z - w / 2); T(x - 0.2, 0, z + w / 2, x + 0.2, 1.9, z + w / 2 + 0.1); T(x - 0.22, 1.9, z - w / 2 - 0.1, x + 0.22, 2.05, z + w / 2 + 0.1); bag.add('wood_dark', box(x - 0.06, 0.05, z - w / 2, x + 0.06, 1.9, z + w / 2)); bag.add('iron', box(x + out * 0.07, 0.9, z - w / 2, x + out * 0.09, 0.96, z + w / 2)); bag.add(TL, box(x - 0.45, 2.05, z - 0.8, x + 0.45, 2.2, z + 0.8)); }
  void col;
}

/** yashiki: a samurai compound { rect, seed, gate ('n'|'s'|'e'|'w') }: walls with tile copings, the gate-house on the street (its passage open, so that the yard is entered), the main house, a storehouse, the retainers' row, a garden, a stone gutter along the street wall. */
function yashiki(el, { bag, col }) {
  const rand = rng((el.seed || 1) + 5), [x0, z0, x1, z1] = el.rect, P = yashikiParts(el), g = P.g, gate = P.gate;
  const wall = (a, b) => dobei({ a, b, h: 2.3 }, { bag, col });
  const sides = { n: [[x0, z0], [x1, z0]], s: [[x0, z1], [x1, z1]], w: [[x0, z0], [x0, z1]], e: [[x1, z0], [x1, z1]] };
  for (const [k, [a, b]] of Object.entries(sides)) {
    if (k !== g) { wall(a, b); continue; }
    if (k === 'n' || k === 's') { wall(a, [gate[0], a[1]]); wall([gate[2], a[1]], b); } else { wall(a, [a[0], gate[1]]); wall([a[0], gate[3]], b); }
  }
  const [gx0, gz0, gx1, gz1] = gate, along = g === 'n' || g === 's', gc = along ? (gx0 + gx1) / 2 : (gz0 + gz1) / 2, pw = P.gw + 0.12;
  // the gate-house: two blocks either side of the passage, the storey over it; the passage is open
  const blk = (u0, u1, y0, y1, m) => { const r = along ? [u0, gz0, u1, gz1] : [gx0, u0, gx1, u1]; if (m) bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const lo = along ? gx0 : gz0, hi = along ? gx1 : gz1;
  for (const [u0, u1] of [[lo, gc - pw], [gc + pw, hi]]) { blk(u0, u1, 0, 1.1, 'plaster_grey'); blk(u0, u1, 1.1, 3.6, PL); col.rect(blk(u0, u1, 0, 0, null), 0, 3.6); }
  blk(gc - pw, gc + pw, 3.0, 3.6, PL); col.rect(blk(gc - pw, gc + pw, 0, 0, null), 3.05, 3.6);
  gateFront(bag, col, gate, g, el.seed);
  roof(bag, gate, 3.5, 0.7, 'gable', Math.min(gx1 - gx0, gz1 - gz0) * 0.4, { sweep: 0 });
  if (g === 's' || g === 'n') ridgeCap(bag, gx0 - 0.7, gx1 + 0.7, 3.5 + Math.min(gx1 - gx0, gz1 - gz0) * 0.4, (gz0 + gz1) / 2);
  // the main house, the storehouse and the retainers' row
  shoinHall(bag, col, P.house, 0, 3.2, P.roof, TL, el.simple && !el.open ? 3.6 : 1.8, el.open ? { face: g, seed: el.seed } : null);
  if (P.kura) kura(bag, col, P.kura);
  nagaya(bag, col, P.nagaya, g);
  // the garden before the house: a stone lantern, a pruned pine, a well in some
  const gp = P.garden;
  ishidoro(bag, col, gp[0] + 1.6, gp[1] + 1.2, 0, 1.1);
  niwaki(bag, col, gp[0], gp[1], 0, 4.2 + rand() * 1.6, el.seed);
  if (rand() < 0.45) ido(bag, col, gp[0] + 4.5, gp[1] - 0.5, 0, rand() * 3);
  // a stone gutter along the foot of each wall outside, a small side door in the wall opposite the gate on some
  const gut = (a0, a1, b0, b1) => bag.add('granite_grey', box(a0, 0, b0, a1, 0.06, b1));
  for (const [k, [a, b]] of Object.entries(sides)) {
    if (k === 'n') gut(a[0] - 0.4, b[0] + 0.4, a[1] - 0.75, a[1] - 0.45);
    else if (k === 's') gut(a[0] - 0.4, b[0] + 0.4, a[1] + 0.45, a[1] + 0.75);
    else if (k === 'w') gut(a[0] - 0.75, a[0] - 0.45, a[1] - 0.4, b[1] + 0.4);
    else gut(a[0] + 0.45, a[0] + 0.75, a[1] - 0.4, b[1] + 0.4);
  }
  const opp = { n: 's', s: 'n', e: 'w', w: 'e' }[g];
  if (rand() < 0.6) { if (opp === 'n') sideDoor(bag, col, x0 + 8 + rand() * 20, z0, true, -1); else if (opp === 's') sideDoor(bag, col, x0 + 8 + rand() * 20, z1, true, 1); else if (opp === 'w') sideDoor(bag, col, x0, z0 + 6 + rand() * 16, false, -1); else sideDoor(bag, col, x1, z0 + 6 + rand() * 16, false, 1); }
}

/** machiya: a merchant's townhouse { rect, seed, front ('n'|'s') }: two storeys at the street — the lattice front below, a pent roof, the low upper storey with its plastered slatted windows — under a tiled roof with the ridge along the street; a storehouse at the back. */
function machiya(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, f = el.front || 's', dep = Math.min(11, z1 - z0);
  const r = f === 's' ? [x0, z1 - dep, x1, z1] : [x0, z0, x1, z0 + dep];
  const fz = f === 's' ? r[3] : r[1], s = f === 's' ? 1 : -1, H1 = 3.2, H2 = 2.5 + rand() * 0.6;
  if (el.open) machiyaShop(el, { bag, col }, { r, H1, H2 });
  else {
    bag.add(PL, box(r[0], 0, r[1], r[2], H1 + H2, r[3]));
    col.rect(r, 0, H1 + H2);
    // the front: posts, lattice and the entrance with its noren below, the trade's goods and sign (town.js)
    machiyaFront(bag, col, { x0, x1, fz, s, H1, seed: el.seed, trade: el.trade || 'cloth' });
  }
  bag.add(WD, box(x0, H1 - 0.25, Math.min(fz, fz + s * 0.1), x1, H1, Math.max(fz, fz + s * 0.1)));
  mushikoMado(bag, col, { x0, x1, fz, s, v0: H1 + 0.75, v1: H1 + H2 - 0.2, rand });
  // the pent roof over the street, the main roof (ridge along the street)
  const pent = f === 's' ? [x0, fz - 0.2, x1, fz + 1.1] : [x0, fz - 1.1, x1, fz + 0.2];
  const pt = [], ye = H1 + 0.05;
  const o = f === 's' ? [[pent[0], ye + 0.6, pent[1]], [pent[2], ye + 0.6, pent[1]], [pent[2], ye, pent[3]], [pent[0], ye, pent[3]]] : [[pent[0], ye, pent[1]], [pent[2], ye, pent[1]], [pent[2], ye + 0.6, pent[3]], [pent[0], ye + 0.6, pent[3]]];
  pt.push(...o[0], ...o[1], ...o[2], ...o[0], ...o[2], ...o[3]);
  bag.add(TL, fromTriangles(pt.concat([...o[0], ...o[2], ...o[1], ...o[0], ...o[3], ...o[2]])));
  eaveBand(bag, col, { x0, x1, fz, s, y: H1 + 0.05, q0: -1.1, q1: -1.04 });
  roof(bag, r, H1 + H2 - 0.1, 0.6, 'gable', dep * 0.3, { alongZ: false, sweep: 0 });
  ridgeCap(bag, x0 - 0.6, x1 + 0.6, H1 + H2 - 0.1 + dep * 0.3, (r[1] + r[3]) / 2);
  col.floor(r, H1 + H2);
  // the storehouse at the back
  if (z1 - z0 > 22 && rand() < 0.6) { const kz = f === 's' ? z0 + 2 : z1 - 9; kura(bag, col, [x0 + 0.6, kz, Math.min(x1 - 0.6, x0 + 6), kz + 7]); }
}

registerStyle('edo', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ishigaki, dobei, tenshu: J(tenshu), yagura: J(yagura), watari: J(watari), yagura_mon: J(yaguraMon), hishi_mon: J(hishiMon), goten: J(goten), yashiki: J(yashiki), machiya: J(machiya), kago, daisho,
    ido: (el, ctx) => ido(ctx.bag, ctx.col, el.at[0], el.at[1], el.y ?? 0, el.rot ?? 0),
    ishidoro: (el, ctx) => ishidoro(ctx.bag, ctx.col, el.at[0], el.at[1], el.y ?? 0, el.s ?? 1),
    niwaki: (el, ctx) => niwaki(ctx.bag, ctx.col, el.at[0], el.at[1], el.y ?? 0, el.h ?? 5, el.seed),
    taru: (el, ctx) => { for (let r = 0; r < (el.rows ?? 3); r++) for (let k = 0; k < (el.rows ?? 3) - r; k++) barrel(ctx.bag, 'timber', el.at[0] + (k + r * 0.5) * 0.56, (el.y ?? 0) + r * 0.55, el.at[1], 0.27, 0.62, 'thatch'); ctx.col.circle(el.at[0] + 0.6, el.at[1], 1.0, el.y ?? 0, (el.y ?? 0) + 1.5); },
    moat_boat: (el, ctx) => boat(ctx.bag, ctx.col, el.at[0], el.at[1], el.y, el.dir ?? [1, 0], el.len ?? 7.5),
  },
  objects: {},
});
