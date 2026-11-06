// The Augustaion's sides and the Mese of Justinian's city (docs/settlements/constantinople.md §4.4–§4.6):
// the Chalke, the vestibule of the Great Palace on the Augustaion's south-east corner, with its dome on
// pendentives, vaulted side chambers, roof of gilded bronze, marble revetment and the mosaics of
// Belisarius' victories and of the emperor and empress among the Senate; the Senate house on the
// square's east side, its portico of six great white columns under a rounded roof with statues on it;
// the porticoes (stoas) round the Augustaion and along the Mese, with shops behind; the Forum of
// Constantine's ring of two-storeyed porticoes and its two marble arches. Registered into the `roman`
// style (the style of the city's plans), built of the Byzantine and Roman vocabularies.

import { Matrix4 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { spherePatch, arcSolid } from './index.js';
import '../roman/town.js';
import '../../objects/index.js';

const D2R = Math.PI / 180, NONE = { circle() {}, rect() {}, segment() {}, floor() {} };

/** A box in a frame: origin o [x, z], along u [ux, uz] (s0…s1), across n = (−uz, ux) (t0…t1), y0…y1. */
function fbox(o, u, s0, s1, t0, t1, y0, y1) {
  const g = box(s0, y0, t0, s1, y1, t1), p = g.attributes.position.array, nn = g.attributes.normal.array;
  const [ux, uz] = u, nx = -uz, nz = ux;
  for (let i = 0; i < p.length; i += 3) {
    const s = p[i], t = p[i + 2]; p[i] = o[0] + s * ux + t * nx; p[i + 2] = o[1] + s * uz + t * nz;
    const a = nn[i], b = nn[i + 2]; nn[i] = a * ux + b * nx; nn[i + 2] = a * uz + b * nz;
  }
  return g;
}
const seg = (col, o, u, s0, s1, t0, t1, y0, y1) => {
  const [ux, uz] = u, nx = -uz, nz = ux, tm = (t0 + t1) / 2;
  col.segment([o[0] + s0 * ux + tm * nx, o[1] + s0 * uz + tm * nz], [o[0] + s1 * ux + tm * nx, o[1] + s1 * uz + tm * nz], Math.abs(t1 - t0), y0, y1);
};
/** A point of a frame. */
const fp = (o, u, s, t) => [o[0] + s * u[0] - t * u[1], o[1] + s * u[1] + t * u[0]];
/** A convex solid from its 8 corners (bottom 4 then top 4), faces turned outward. */
function solid8(c) {
  const f = [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  for (const [a, b, cc, d] of f) t.push(...c[a], ...c[b], ...c[cc], ...c[a], ...c[cc], ...c[d]);
  return fromTriangles(orientOutward(t));
}
/** A gabled roof of two sloping plates over rect, ridge along x ('x') or z, eaves at y, rising `rise`, plates `th` thick. */
function gable(bag, mat, [x0, z0, x1, z1], y, rise, th, along = 'x') {
  if (along === 'x') {
    const zm = (z0 + z1) / 2;
    for (const [za, zb] of [[z0, zm], [z1, zm]]) {
      const ya = y, yb = y + rise;
      bag.add(mat, solid8([[x0, ya, za], [x1, ya, za], [x1, yb, zb], [x0, yb, zb], [x0, ya + th, za], [x1, ya + th, za], [x1, yb + th, zb], [x0, yb + th, zb]]));
    }
  } else {
    const xm = (x0 + x1) / 2;
    for (const [xa, xb] of [[x0, xm], [x1, xm]]) {
      const ya = y, yb = y + rise;
      bag.add(mat, solid8([[xa, ya, z0], [xa, ya, z1], [xb, yb, z1], [xb, yb, z0], [xa, ya + th, z0], [xa, ya + th, z1], [xb, yb + th, z1], [xb, yb + th, z0]]));
    }
  }
}
/** A barrel vault's surface along x (xa…xb) over the axis z = zc, radius r, springing at y; inward (seen from below) or outward. */
function barrel(xa, xb, zc, r, y, n, inward) {
  const t = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI * i / n, b = Math.PI * (i + 1) / n, P = (x, g) => [x, y + Math.sin(g) * r, zc + Math.cos(g) * r];
    const tri = [[P(xa, a), P(xb, a), P(xb, b)], [P(xa, a), P(xb, b), P(xa, b)]];
    for (const [p, q, s] of tri) {
      const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2], vx = s[0] - p[0], vy = s[1] - p[1], vz = s[2] - p[2];
      const ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, my = (p[1] + q[1] + s[1]) / 3 - y, mz = (p[2] + q[2] + s[2]) / 3 - zc;
      const out = ny * my + nz * mz > 0;
      t.push(...p, ...(out !== inward ? [...q, ...s] : [...s, ...q]));
    }
  }
  return fromTriangles(t);
}
/** A sloping ring roof (top face only) from radius r0 at y0 to r1 at y1, azimuths a0…a1 (degrees). */
function ringRoof(cx, cz, r0, r1, a0, a1, y0, y1, step = 3) {
  const t = [], n = Math.max(2, Math.ceil((a1 - a0) / step));
  for (let i = 0; i < n; i++) {
    const a = (a0 + (a1 - a0) * i / n) * D2R, b = (a0 + (a1 - a0) * (i + 1) / n) * D2R;
    const P = (r, g, y) => [cx + Math.cos(g) * r, y, cz + Math.sin(g) * r];
    for (const tri of [[P(r0, a, y0), P(r1, b, y1), P(r0, b, y0)], [P(r0, a, y0), P(r1, a, y1), P(r1, b, y1)]]) {
      const [p, q, s] = tri, ux = q[0] - p[0], uz = q[2] - p[2], vx = s[0] - p[0], vz = s[2] - p[2];
      t.push(...p, ...(uz * vx - ux * vz > 0 ? [...q, ...s] : [...s, ...q]));
    }
  }
  return fromTriangles(t);
}
/** A bag that flattens what is added into it toward the plane x = x0 (or z = z0): a figure in mosaic. */
function flatBag(bag, axis, at, k) {
  const M = new Matrix4();
  if (axis === 'x') M.set(k, 0, 0, at * (1 - k), 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  else M.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, k, at * (1 - k), 0, 0, 0, 1);
  return { add: (m, g) => { g.applyMatrix4(M); g.computeVertexNormals?.(); bag.add(m, g); } };
}
const figure = (bag, el) => STYLES.life.elements.figure(el, { bag, col: NONE });
/** A standing statue in one material, `h` tall, facing rot. */
const statue = (bag, mat, x, y, z, h, rot, extra = {}) => figure({ add: (_m, g) => bag.add(mat, g) }, { at: [x, z], y, rot, h, seed: 7, dress: 'robe', pose: 'stand', hat: 'none', ...extra });
/** A closed door in a wall: two leaves in the opening (from s0 to s1 along u, centred on t), up to the springing, a lunette above. */
function closedDoor(bag, col, mat, o, u, s0, s1, t, y0, spring) {
  const w = s1 - s0, m = (s0 + s1) / 2;
  for (const [a, b] of [[s0, m - 0.01], [m + 0.01, s1]]) {
    bag.add(mat, fbox(o, u, a, b, t - 0.08, t + 0.08, y0, spring));
    for (let k = 0; k < 3; k++) {                                                          // the leaves' panels, raised
      const ya = y0 + 0.4 + k * (spring - y0 - 0.6) / 3, yb = ya + (spring - y0 - 0.6) / 3 - 0.25;
      for (const s of [-1, 1]) bag.add(mat, fbox(o, u, a + 0.18, b - 0.18, t + s * 0.08 - (s > 0 ? 0 : 0.03), t + s * 0.08 + (s > 0 ? 0.03 : 0), ya, yb));
    }
  }
  STYLES.byzantine.elements.planar_wall({ o: fp(o, u, s0, t), u, th: 0.16, u0: 0, u1: w, y0: spring, y1: spring + w / 2, outline: { uc: w / 2, r: w / 2, spring }, mat, collide: false }, { bag, col: NONE });
  seg(col, o, u, s0, s1, t - 0.1, t + 0.1, y0, spring + w / 2);
}

// ── the stoas ─────────────────────────────────────────────────────────────────

/**
 * stoa: { a, b (the column line), y, side (±1: the side of a→b the portico lies on), depth, h (column),
 * d, spacing, shops (depth of a row of shops behind; 0 for none), back (a plain back wall if no shops),
 * goods } — a portico of marble Corinthian columns carrying an architrave, frieze and cornice, a lean-to
 * roof of tiles on rafters over a coffered timber ceiling, its floor of marble a step up from the street;
 * behind it a row of brick shops, each with an arched door and a window over it, a room upstairs.
 */
function stoa(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, side = el.side ?? 1, D = el.depth ?? 5, Sd = el.shops ?? 0, H = el.h ?? 6;
  const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], o = [ax, az], sp = el.spacing ?? 3.8, dcol = el.d ?? H * 0.1;
  const n = Math.max(1, Math.round(L / sp)), step = L / n, T = (t0, t1) => [Math.min(t0 * side, t1 * side), Math.max(t0 * side, t1 * side)];
  const yT = y + 0.18, wallTop = y + H + 2.9;
  // the floor, a step up from the street, its kerb of grey marble
  { const [p, q] = T(-0.55, D + 0.02); bag.add('marble_floor', fbox(o, u, 0, L, p, q, y - 0.4, yT)); }
  { const [p, q] = T(-0.6, -0.3); bag.add('marble_dark', fbox(o, u, 0, L, p, q, y - 0.38, yT + 0.005)); }
  { const a = fp(o, u, 0, T(-0.55, D)[0]), b = fp(o, u, L, T(-0.55, D)[1]); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], yT); }
  for (let k = 0; k <= n; k++) {
    const s = k * step, [cx, cz] = fp(o, u, s, 0);
    STYLES.roman.column({ at: [cx, cz], y: yT, h: H, d: dcol, mat: 'marble', shaftMat: k % 5 === 2 ? 'pavonazzetto' : 'proconnesian' }, ctx);
  }
  // the entablature: architrave in two fasciae, frieze, cornice
  const ya = yT + H;
  { const [p, q] = T(-0.34, 0.34); bag.add('marble', fbox(o, u, -0.35, L + 0.35, p, q, ya, ya + 0.28)); }
  { const [p, q] = T(-0.38, 0.38); bag.add('marble', fbox(o, u, -0.39, L + 0.39, p, q, ya + 0.28, ya + 0.5)); }
  { const [p, q] = T(-0.33, 0.33); bag.add('marble_smooth', fbox(o, u, -0.34, L + 0.34, p, q, ya + 0.5, ya + 0.95)); }
  { const [p, q] = T(-0.55, 0.45); bag.add('marble', fbox(o, u, -0.56, L + 0.56, p, q, ya + 0.95, ya + 1.2)); }
  // dentils under the cornice on the street side
  for (let s = 0; s < L; s += 0.36) { const [p, q] = T(-0.47, -0.33); bag.add('marble', fbox(o, u, s, s + 0.18, p, q, ya + 0.82, ya + 0.95)); }
  // the ceiling: a timber ceiling with beams across from the entablature to the wall
  const yc = ya + 1.0;
  { const [p, q] = T(0.34, D); bag.add('ceiling_painted', fbox(o, u, -0.3, L + 0.3, p, q, yc, yc + 0.06)); }
  for (let k = 0; k <= n * 2; k++) { const s = k * step / 2, [p, q] = T(0.34, D); bag.add('timber', fbox(o, u, s - 0.11, s + 0.11, p, q, yc - 0.22, yc)); }
  // the roof: tiles on rafters from over the cornice up to the wall behind
  const r0 = ya + 1.2, r1 = wallTop - 0.35;
  const roof = (mat, dy, th) => {
    const lo = -0.6 * side, hi = (D + 0.02) * side;                                              // the street edge, the wall
    const c = [fp(o, u, -0.55, lo), fp(o, u, L + 0.55, lo), fp(o, u, L + 0.55, hi), fp(o, u, -0.55, hi)];
    const yy = [r0 + dy, r0 + dy, r1 + dy, r1 + dy];
    bag.add(mat, solid8([...c.map((pt, i) => [pt[0], yy[i], pt[1]]), ...c.map((pt, i) => [pt[0], yy[i] + th, pt[1]])]));
  };
  roof('timber', 0, 0.08); roof('roof_tile', 0.08, 0.14);
  // the back: shops, or a plain wall
  const f0 = D, f1 = D + 0.6;
  if (Sd > 0 || el.back) {
    const ns = Sd > 0 ? Math.max(1, Math.round(L / 4.4)) : 0, sw = ns ? L / ns : L;
    // a wide door to each shop under a timber lintel, a small window to the room above (rectangular
    // openings keep the wall to a few courses of geometry)
    const holes = [];
    for (let k = 0; k < ns; k++) {
      const c = (k + 0.5) * sw;
      holes.push({ u0: c - 1.1, u1: c + 1.1, y0: y - 0.4, y1: yT + 2.7 }, { u0: c - 0.4, u1: c + 0.4, y0: yT + 3.9, y1: yT + 4.9 });
    }
    const [p, q] = T(f0, f1), tm = (p + q) / 2;
    STYLES.byzantine.elements.planar_wall({ o: fp(o, u, 0, tm), u, th: 0.6, u0: -0.6, u1: L + 0.6, y0: y - 0.4, y1: wallTop, mat: 'brick', holes }, ctx);
    for (let k = 0; k < ns; k++) {
      const c = (k + 0.5) * sw, [pp, qq] = T(f0 - 0.04, f1 + 0.04);
      bag.add('timber', fbox(o, u, c - 1.3, c + 1.3, pp, qq, yT + 2.7, yT + 2.92));                    // the lintel
      bag.add('marble', fbox(o, u, c - 0.5, c + 0.5, pp, qq, yT + 3.82, yT + 3.9));                    // the window's sill
    }
    // a marble band at the floor of the room upstairs, and a coping
    { const [pp, qq] = T(f0 - 0.06, f1 + 0.06); bag.add('marble', fbox(o, u, -0.6, L + 0.6, pp, qq, yT + 3.4, yT + 3.58)); bag.add('marble', fbox(o, u, -0.66, L + 0.66, pp, qq, wallTop, wallTop + 0.2)); }
    if (Sd > 0) {
      const bk = D + Sd;
      for (let k = 0; k <= ns; k++) {
        const s = k * sw, [pp, qq] = T(f1, bk);
        bag.add('brick', fbox(o, u, Math.max(-0.6, s - 0.3), Math.min(L + 0.6, s + 0.3), pp, qq, y - 0.4, wallTop));
        seg(col, o, u, Math.max(-0.6, s - 0.3), Math.min(L + 0.6, s + 0.3), pp, qq, y, wallTop);
      }
      { const [pp, qq] = T(bk - 0.6, bk); bag.add('brick', fbox(o, u, -0.6, L + 0.6, pp, qq, y - 0.4, wallTop)); seg(col, o, u, -0.6, L + 0.6, pp, qq, y, wallTop); }
      // inside each shop: a floor, the beamed ceiling of the room above; the flat roof over all
      { const [pp, qq] = T(f1, bk - 0.6); bag.add('flagstone', fbox(o, u, -0.3, L + 0.3, pp, qq, y - 0.4, yT)); bag.add('timber', fbox(o, u, -0.3, L + 0.3, pp, qq, yT + 3.3, yT + 3.45));
        const a = fp(o, u, 0, pp), b = fp(o, u, L, qq); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], yT); }
      { const [pp, qq] = T(f1 - 0.6, bk); bag.add('roof_tile', fbox(o, u, -0.66, L + 0.66, pp, qq, wallTop - 0.1, wallTop + 0.12)); }
    }
  }
}

// ── the Chalke ───────────────────────────────────────────────────────────────

/**
 * chalke: { c [x, z] (the centre of the domed bay), y } — the vestibule of the Great Palace as Justinian
 * rebuilt it after 532: a rectangular hall, entered from the Augustaion on the west and leading east into
 * the palace; four great piers carry four arches and pendentives under the dome; vaulted chambers north
 * and south behind lower arches; the roofs of gilded bronze tiles; inside, walls and floor of coloured
 * marble, and the vaults in mosaic — over the entrance Belisarius returning with his army, over the
 * palace door the emperor and Theodora receiving the captive Vandal and Gothic kings among the Senate.
 */
function chalke(el, ctx) {
  const { bag, col } = ctx, BZ = STYLES.byzantine.elements, [cx, cz] = el.c, y = el.y ?? 0;
  const s = 6, th = 1.6, xo = s + th, ch = 5.8, zo = s + th + ch + th;                   // half the bay; the walls; the side chambers
  const ys = y + 7.6, yd = ys + s, yV = y + 8.2, rV = ch / 2, zV = s + th + ch / 2;      // springing, the dome's base; the chambers' vaults
  const top = yd + 0.2;
  const pw = (o) => BZ.planar_wall({ mat: 'brick', ...o }, ctx);
  // the west and east walls: the central part to the dome's base, the chambers' parts to their vaults
  for (const sx of [-1, 1]) {
    const x = cx + sx * (s + th / 2), o = [x, cz - zo];
    const door = { uc: zo, r: 2.2, spring: y + 4.8, sill: y };
    pw({ o, u: [0, 1], th, u0: zo - s - th, u1: zo + s + th, y0: y - 0.5, y1: top, arches: [door] });
    for (const sz of [-1, 1]) {
      const uc = zo + sz * zV, a = sz < 0 ? 0 : zo + s + th, b = sz < 0 ? zo - s - th : 2 * zo;
      pw({ o, u: [0, 1], th, u0: a, u1: b, y0: y - 0.5, y1: yV + rV + th * 0.5, outline: { uc, r: rV + th * 0.5, spring: yV }, arches: [{ uc, r: 1.1, spring: y + 3.2, sill: y }] });
    }
  }
  // the north and south end walls with a window each; the cross walls between the bay and the chambers
  for (const sz of [-1, 1]) {
    pw({ o: [cx - xo, cz + sz * (zo - th / 2)], u: [1, 0], th, u0: 0, u1: 2 * xo, y0: y - 0.5, y1: yV, arches: [{ uc: xo, r: 1.0, spring: y + 6.4, sill: y + 4.8 }] });
    pw({ o: [cx - s, cz + sz * (s + th / 2)], u: [1, 0], th, u0: 0, u1: 2 * s, y0: y - 0.5, y1: top, arches: [{ uc: s, r: 5.0, spring: ys, sill: y }] });
  }
  // the floor of coloured marble; the revetment of the walls up to a cornice
  bag.add('opus_sectile', box(cx - s, y - 0.3, cz - zo + th, cx + s, y + 0.04, cz + zo - th));
  col.floor([cx - s, cz - zo + th, cx + s, cz + zo - th], y + 0.04);
  const rv = (x0, z0, x1, z1, y1 = y + 5.6) => { bag.add('revetment_byz', box(x0, y + 0.04, z0, x1, y1, z1)); };
  const yR = y + 5.6, t = 0.03;
  for (const sx of [-1, 1]) {
    const x0 = sx < 0 ? cx - s - 0.001 : cx + s - t, x1 = sx < 0 ? cx - s + t : cx + s + 0.001;
    rv(x0, cz - s, x1, cz - 2.25, ys - 0.25); rv(x0, cz + 2.25, x1, cz + s, ys - 0.25);
    bag.add('revetment_byz', box(x0, y + 7.02, cz - 2.25, x1, ys - 0.25, cz + 2.25));            // over the door
    for (const sz of [-1, 1]) { const zc = cz + sz * zV; rv(x0, zc - ch / 2, x1, zc - 1.15); rv(x0, zc + 1.15, x1, zc + ch / 2); }
  }
  for (const sz of [-1, 1]) {
    const zf = cz + sz * (zo - th), z0 = sz < 0 ? zf - 0.001 : zf - t, z1 = sz < 0 ? zf + t : zf + 0.001;
    rv(cx - s, z0, cx + s, z1, y + 4.6);
    for (const sx of [-1, 1]) {                                                            // the piers' faces between the arches
      const zz = cz + sz * s, za = sz < 0 ? zz - 0.001 : zz - t, zb = sz < 0 ? zz + t : zz + 0.001;
      rv(sx < 0 ? cx - s : cx + 5.0, za, sx < 0 ? cx - 5.0 : cx + s, zb);
      const zw = cz + sz * (s + th), zwa = sz < 0 ? zw - t : zw - 0.001, zwb = sz < 0 ? zw + 0.001 : zw + t;
      rv(sx < 0 ? cx - s : cx + 5.0, zwa, sx < 0 ? cx - 5.0 : cx + s, zwb);
    }
  }
  // the cornice over the revetment
  for (const sx of [-1, 1]) {
    bag.add('marble', box(sx < 0 ? cx - s : cx + s - 0.16, ys - 0.25, cz - s, sx < 0 ? cx - s + 0.16 : cx + s, ys, cz + s));
    for (const sz of [-1, 1]) bag.add('marble', box(sx < 0 ? cx - s : cx + s - 0.16, yR, sz < 0 ? cz - zo + th : cz + s + th, sx < 0 ? cx - s + 0.16 : cx + s, yR + 0.24, sz < 0 ? cz - s - th : cz + zo - th));
  }
  // the pendentives and the dome, in gold mosaic; the chambers' barrel vaults
  const Rp = s * Math.SQRT2;
  bag.add('mosaic_gold', spherePatch({ c: [cx, ys, cz], R: Rp, clips: [[1, 0, 0, cx + s], [-1, 0, 0, -(cx - s)], [0, 0, 1, cz + s], [0, 0, -1, -(cz - s)]], e0: 0, e1: 45.01, segA: 96, segE: 24, inward: true }));
  bag.add('mosaic_gold', spherePatch({ c: [cx, yd, cz], R: s, e0: 0, e1: 90, segA: 64, segE: 16, inward: true }));
  // a cornice ring at the dome's foot, and a cross in the crown
  bag.add('marble', arcSolid(cx, cz, s - 0.2, s + 0.02, 0, 360, yd - 0.2, yd, 6));
  bag.add('mosaic_silver', box(cx - 0.25, yd + s - 0.06, cz - 1.4, cx + 0.25, yd + s - 0.02, cz + 1.4));
  bag.add('mosaic_silver', box(cx - 1.4, yd + s - 0.06, cz - 0.25, cx + 1.4, yd + s - 0.02, cz + 0.25));
  for (const sz of [-1, 1]) {
    const zc = cz + sz * zV;
    bag.add('mosaic_gold', barrel(cx - s, cx + s, zc, rV, yV, 24, true));
    bag.add('gilt_bronze', barrel(cx - xo - 0.3, cx + xo + 0.3, zc, rV + th * 0.5 + 0.06, yV, 24, false));
  }
  // outside: the square base of the dome under bronze, a cornice; the dome's bronze shell with its ribs of tiles
  bag.add('marble', box(cx - xo - 0.25, top - 0.25, cz - s - th - 0.25, cx + xo + 0.25, top, cz + s + th + 0.25));
  BZ.square_ring({ c: [cx, cz], half: s + th, r: s + 0.55, y: top + 0.05, y0: top, mat: 'gilt_bronze' }, ctx);
  // the dome's shell of gilded bronze tiles, laid in 24 ribbed bands from the foot to the crown
  bag.add('gilt_bronze', lathe(Array.from({ length: 15 }, (_, i) => { const e = (i / 14) * Math.PI / 2; return [Math.max(0.001, Math.cos(e) * (s + 0.6)), Math.sin(e) * (s + 0.6)]; }), 96, (th) => 1 + 0.018 * Math.pow(Math.abs(Math.cos(th * 12)), 8), cx, yd, cz));
  // a string course of marble round the hall at the doors' springing
  bag.add('marble', box(cx - xo - 0.12, y + 4.8, cz - zo - 0.12, cx - xo + 0.001, y + 5.05, cz - 2.4));
  bag.add('marble', box(cx - xo - 0.12, y + 4.8, cz + 2.4, cx - xo + 0.001, y + 5.05, cz + zo + 0.12));
  bag.add('gilt_bronze', lathe([[0.45, 0], [0.3, 0.4], [0.36, 0.7], [0.001, 1.3]], 12, null, cx, yd + s + 0.6, cz));
  bag.add('gilt_bronze', box(cx - 0.07, yd + s + 1.8, cz - 0.07, cx + 0.07, yd + s + 3.2, cz + 0.07));
  bag.add('gilt_bronze', box(cx - 0.07, yd + s + 2.6, cz - 0.55, cx + 0.07, yd + s + 2.74, cz + 0.55));
  for (const sz of [-1, 1]) bag.add('marble', box(cx - xo - 0.2, yV, sz < 0 ? cz - zo - 0.2 : cz + zo - th, cx + xo + 0.2, yV + 0.25, sz < 0 ? cz - zo + th : cz + zo + 0.2));   // the end walls' copings
  // the doors: the west door's bronze leaves stand open, the east door into the palace is shut
  for (const sz of [-1, 1]) bag.add('bronze', box(cx - s + 0.05, y + 0.04, cz + sz * 2.2 - (sz > 0 ? 0 : 0.12), cx - s + 2.1, y + 4.8, cz + sz * 2.2 + (sz > 0 ? 0.12 : 0)));
  closedDoor(bag, col, 'bronze', [cx + s + th / 2, cz - 2.2], [0, 1], 0, 4.4, 0, y + 0.04, y + 4.8);
  // the mosaics of the lunettes: over the entrance (west) Belisarius and his army bringing the spoils;
  // over the palace door (east) Justinian and Theodora in the middle, the captive kings before them,
  // the senators either side
  const lun = (sx) => {
    BZ.planar_wall({ o: [cx + sx * (s - 0.025), cz - s], u: [0, 1], th: 0.03, u0: 0.05, u1: 2 * s - 0.05, y0: ys, y1: ys + s - 0.1, outline: { uc: s, r: s - 0.08, spring: ys }, mat: 'mosaic_gold', collide: false }, ctx);
    { const a = cx + sx * (s - 0.045), b = cx + sx * (s - 0.012); bag.add('mosaic_green', box(Math.min(a, b), ys, cz - s + 0.3, Math.max(a, b), ys + 0.35, cz + s - 0.3)); }   // the ground line
    const fb = flatBag(bag, 'x', cx + sx * (s - 0.09), 0.12), rot = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    const people = sx > 0
      ? [[-4.2, 'cloth_white', 2.0], [-3.3, 'cloth_white', 2.0], [-2.4, 'cloth_white', 2.0], [-1.1, 'cloth_red', 2.35, 'gold'], [-0.35, 'cloth_brown', 1.6, null, 'sit'], [0.35, 'cloth_brown', 1.6, null, 'sit'], [1.1, 'cloth_red', 2.3, 'gold', 'stand', 'veil'], [2.4, 'cloth_white', 2.0], [3.3, 'cloth_white', 2.0], [4.2, 'cloth_white', 2.0]]
      : [[-4.4, 'cloth_grey', 1.9], [-3.7, 'cloth_grey', 1.9], [-3.0, 'cloth_grey', 1.9], [-2.2, 'cloth_red', 2.1], [-1.2, 'cloth_white', 2.05], [0, 'cloth_red', 2.2, 'gold'], [1.2, 'cloth_white', 2.05], [2.2, 'cloth_ochre', 1.9], [3.0, 'cloth_grey', 1.9], [3.7, 'cloth_grey', 1.9], [4.4, 'cloth_grey', 1.9]];
    for (const [dz, cloth, h, halo, pose = 'stand', hat = 'none'] of people) {
      const zz = cz + dz, yy = ys + 0.35;
      if (Math.abs(dz) > Math.sqrt(Math.max(0, (s - 0.3) ** 2 - (h + 0.5) ** 2))) continue;
      figure(fb, { at: [cx + sx * (s - 0.12), zz], y: yy, rot, h, seed: Math.floor((dz + 7) * 97), dress: 'robe', cloth, cloth2: cloth === 'cloth_red' ? 'gold' : 'cloth_white', skin: 'skin_light', pose, hat, hatMat: 'cloth_red' });
      if (halo) bag.add('gold', lathe(Array.from({ length: 9 }, (_, i) => { const g = i / 8 * Math.PI; return [Math.max(0.001, Math.sin(g) * 0.3), 0.3 - Math.cos(g) * 0.3]; }), 14).scale(0.07, 1, 1).translate(cx + sx * (s - 0.07), yy + h * 0.84, zz));
    }
  };
  lun(-1); lun(1);
}

// ── the Senate house ─────────────────────────────────────────────────────────

/**
 * senate: { rect (the hall), y, porch (depth of the portico west of it), h } — the Senate house on the
 * Augustaion's east side: a tall hall of brick under a tiled roof, its west wall with a bronze door and
 * windows; before it six great white columns, two framing the wall and four standing a little beyond,
 * a portico under a rounded (domical) roof, the upper parts in marble and statues standing on the roof.
 */
function senate(el, ctx) {
  const { bag, col } = ctx, BZ = STYLES.byzantine.elements, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.h ?? 18;
  const zc = (z0 + z1) / 2, W = z1 - z0, P = el.porch ?? 12, th = 1.4;
  const pw = (o) => BZ.planar_wall({ mat: 'brick', ...o }, ctx);
  const win = (u0, u1, n, sill, r) => Array.from({ length: n }, (_, i) => ({ uc: u0 + (u1 - u0) * (i + 0.5) / n, r, spring: sill + 2.6, sill }));
  pw({ o: [x0 + th / 2, z0], u: [0, 1], th, u0: 0, u1: W, y0: y - 0.5, y1: y + H, arches: [{ uc: W / 2, r: 2.4, spring: y + 5.6, sill: y + 0.5 }, ...win(2, W - 2, 3, y + 10, 1.1)] });
  pw({ o: [x1 - th / 2, z0], u: [0, 1], th, u0: 0, u1: W, y0: y - 0.5, y1: y + H, arches: win(2, W - 2, 3, y + 10, 1.1) });
  for (const zz of [z0 + th / 2, z1 - th / 2]) pw({ o: [x0, zz], u: [1, 0], th, u0: 0, u1: x1 - x0, y0: y - 0.5, y1: y + H, arches: [...win(2, x1 - x0 - 2, 4, y + 3.5, 1.0), ...win(2, x1 - x0 - 2, 4, y + 10, 1.1)] });
  closedDoor(bag, col, 'bronze', [x0 + th / 2, z0], [0, 1], W / 2 - 2.4, W / 2 + 2.4, 0, y + 0.5, y + 5.6);
  bag.add('marble_floor', box(x0 + th, y - 0.3, z0 + th, x1 - th, y + 0.5, z1 - th));
  // stone bands and the cornice; the gable ends in brick; the roof of tiles
  for (const yy of [y + 7.6, y + H - 0.5]) bag.add('marble', box(x0 - 0.15, yy, z0 - 0.15, x1 + 0.15, yy + 0.5, z1 + 0.15));
  const rise = W * 0.22;
  for (const xx of [x0, x1 - th]) { const yt = y + H + rise; bag.add('brick', solid8([[xx, y + H, z0], [xx + th, y + H, z0], [xx + th, y + H, z1], [xx, y + H, z1], [xx, yt, zc - 0.01], [xx + th, yt, zc - 0.01], [xx + th, yt, zc + 0.01], [xx, yt, zc + 0.01]])); }
  gable(bag, 'roof_tile', [x0 - 0.5, z0 - 0.6, x1 + 0.5, z1 + 0.6], y + H - 0.05, rise + 0.1, 0.25, 'x');
  // the portico: four columns in front, two against the wall, the entablature round, the domical roof
  const xf = x0 - P, colH = 13, d = 1.45, yb = y + 0.5;
  bag.add('marble_floor', box(xf - 1.2, y - 0.3, z0 + 0.6, x0, yb, z1 - 0.6));
  for (let k = 1; k <= 2; k++) bag.add('marble_floor', box(xf - 1.2 - k * 0.55, y - 0.3, z0 + 0.6 + k * 0.1, xf - 1.2 - (k - 1) * 0.55, yb - k * 0.17, z1 - 0.6 - k * 0.1));
  col.floor([xf - 1.2, z0 + 0.6, x0, z1 - 0.6], yb);
  const fz = [0, 1, 2, 3].map((k) => zc - 10 + k * 20 / 3), Z0 = zc - 10, Z1 = zc + 10;
  for (const z of fz) STYLES.roman.column({ at: [xf, z], y: yb, h: colH, d, mat: 'marble', shaftMat: 'proconnesian' }, ctx);
  for (const z of [Z0, Z1]) STYLES.roman.column({ at: [x0 - 1.3, z], y: yb, h: colH, d, mat: 'marble', shaftMat: 'proconnesian' }, ctx);
  const ye = yb + colH, ys = ye + 1.8, bw = 0.8;
  const band = (a, b, z, mat, y0, y1, wd) => bag.add(mat, box(Math.min(a[0], b[0]) - wd, y0, Math.min(a[1], b[1]) - wd, Math.max(a[0], b[0]) + wd, y1, Math.max(a[1], b[1]) + wd));
  for (const [a, b] of [[[xf, Z0], [xf, Z1]], [[xf, Z0], [x0, Z0]], [[xf, Z1], [x0, Z1]]]) {
    band(a, b, 0, 'marble', ye, ye + 0.75, bw); band(a, b, 0, 'marble_smooth', ye + 0.75, ye + 1.45, bw - 0.06); band(a, b, 0, 'marble', ye + 1.45, ys, bw + 0.9);
  }
  // the rounded roof: a sail vault over the rectangle, marble inside, lead outside, its tympana
  const cxv = (xf + x0) / 2, hx = (x0 - xf) / 2, hz = 10, Rv = 14, yc = ys - Math.sqrt(Rv * Rv - hx * hx - hz * hz), Ro = Rv + 0.6, bo = bw;
  bag.add('marble_smooth', spherePatch({ c: [cxv, yc, zc], R: Rv, clips: [[1, 0, 0, cxv + hx], [-1, 0, 0, -(cxv - hx)], [0, 0, 1, zc + hz], [0, 0, -1, -(zc - hz)]], e0: 25, e1: 90, segA: 96, segE: 30, inward: true }));
  bag.add('lead', spherePatch({ c: [cxv, yc, zc], R: Ro, clips: [[1, 0, 0, cxv + hx], [-1, 0, 0, -(cxv - hx + bo)], [0, 0, 1, zc + hz + bo], [0, 0, -1, -(zc - hz - bo)], [0, -1, 0, -(ys - 0.02)]], e0: 25, e1: 90, segA: 96, segE: 30, inward: false }));
  const tyR = (dist) => Math.sqrt(Ro * Ro - dist * dist);
  BZ.planar_wall({ o: [xf - bo / 2, Z0 - bo], u: [0, 1], th: bo, u0: 0, u1: 2 * hz + 2 * bo, y0: ys, y1: yc + tyR(hx + bo), outline: { uc: hz + bo, r: tyR(hx + bo), spring: yc }, mat: 'marble', collide: false }, ctx);
  for (const sz of [-1, 1]) BZ.planar_wall({ o: [xf - bo, zc + sz * (hz + bo / 2)], u: [1, 0], th: bo, u0: 0, u1: x0 - xf + bo, y0: ys, y1: yc + tyR(hz + bo), outline: { uc: hx + bo, r: tyR(hz + bo), spring: yc }, mat: 'marble', collide: false }, ctx);
  // statues on the roof: on the cornice over each front column and at the back corners
  for (const z of fz) { const xs = xf - 1.25; bag.add('marble', box(xs - 0.4, ys, z - 0.4, xs + 0.4, ys + 0.5, z + 0.4)); statue(bag, 'marble', xs, ys + 0.5, z, 2.6, -Math.PI / 2, { dress: 'robe', seed: Math.floor(z * 13) }); }
  for (const z of [Z0 - 1.25, Z1 + 1.25]) { const xs = x0 - 2.2; bag.add('marble', box(xs - 0.4, ys, z - 0.4, xs + 0.4, ys + 0.5, z + 0.4)); statue(bag, 'marble', xs, ys + 0.5, z, 2.6, z < zc ? Math.PI : 0, { dress: 'robe' }); }
}

// ── the Forum of Constantine ─────────────────────────────────────────────────

/**
 * forum_ring: { c, r (the inner column line), depth, y, gaps [[a0, a1] degrees] } — the round forum's
 * colonnade of white marble in two storeys, the upper on the lower's entablature, a tiled roof sloping
 * in toward the square from the back wall, which has a door into a shop or office every third bay.
 */
function forumRing(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, r = el.r, D = el.depth ?? 6, y = el.y ?? 0, R = r + D;
  const H1 = 7, H2 = 5, y1 = y + 0.08 + H1, y2 = y1 + 1.2 + 0.25 + H2, yt = y2 + 1.0, wallTop = yt + 1.6;
  const gaps = (el.gaps || []).slice().sort((a, b) => a[0] - b[0]);
  const runs = []; let a = gaps.length ? gaps[gaps.length - 1][1] - 360 : 0;
  for (const g of gaps) { runs.push([a, g[0]]); a = g[1]; }
  if (!gaps.length) runs.push([0, 360]);
  for (const [a0, a1] of runs) {
    const L = (a1 - a0) * D2R * r, n = Math.max(1, Math.round(L / 3.6));
    bag.add('marble_floor', arcSolid(cx, cz, r - 0.6, R, a0, a1, y - 0.4, y + 0.08, 2));
    for (let k = 0; k <= n; k++) {
      const g = (a0 + (a1 - a0) * k / n) * D2R, x = cx + Math.cos(g) * r, z = cz + Math.sin(g) * r;
      STYLES.roman.column({ at: [x, z], y: y + 0.08, h: H1, d: 0.72, mat: 'marble', shaftMat: 'proconnesian' }, ctx);
      STYLES.byzantine.column({ at: [x, z], y: y1 + 1.45, h: H2, d: 0.5, shaftMat: 'proconnesian', capMat: 'marble' }, ctx);
    }
    // the lower entablature and the gallery's floor; the upper entablature; the ceiling; the roof
    bag.add('marble', arcSolid(cx, cz, r - 0.4, r + 0.4, a0, a1, y1, y1 + 0.6, 2));
    bag.add('marble_smooth', arcSolid(cx, cz, r - 0.36, r + 0.36, a0, a1, y1 + 0.6, y1 + 1.0, 2));
    bag.add('marble', arcSolid(cx, cz, r - 0.6, R, a0, a1, y1 + 1.0, y1 + 1.25, 2));
    bag.add('marble', arcSolid(cx, cz, r - 0.42, r + 0.6, a0, a1, y1 + 1.25, y1 + 1.45, 2));                 // the gallery's parapet base
    bag.add('marble', arcSolid(cx, cz, r - 0.3, r + 0.3, a0, a1, y2, y2 + 0.55, 2));
    bag.add('marble', arcSolid(cx, cz, r - 0.5, r + 0.4, a0, a1, y2 + 0.55, yt, 2));
    bag.add('ceiling_painted', arcSolid(cx, cz, r + 0.3, R, a0, a1, y2 + 0.5, y2 + 0.56, 2));
    bag.add('timber', ringRoof(cx, cz, r - 0.55, R + 0.05, a0 - 0.3, a1 + 0.3, yt, wallTop - 0.3));
    bag.add('roof_tile', ringRoof(cx, cz, r - 0.6, R + 0.05, a0 - 0.3, a1 + 0.3, yt + 0.1, wallTop - 0.2));
    // the back wall, a door every third bay below, a window above
    const nd = Math.max(1, Math.floor(n / 3)), gapsW = [];
    for (let k = 0; k < nd; k++) { const g = a0 + (a1 - a0) * (k + 0.5) / nd; gapsW.push({ a: g, w: 2.0, y0: y - 0.4, y1: y + 3.4 }); }
    STYLES.byzantine.elements.arc_wall({ c: [cx, cz], r0: R, r1: R + 0.9, a0, a1, y0: y - 0.4, y1: wallTop, mat: 'brick', gaps: gapsW, step: 2 }, ctx);
    for (const gw of gapsW) {                                                              // dark doors (shut), a marble frame
      const g = gw.a * D2R, h = (gw.w / (R + 0.45)) / D2R / 2;
      bag.add('timber', arcSolid(cx, cz, R + 0.35, R + 0.5, gw.a - h, gw.a + h, y - 0.4, y + 3.4, 1));
      bag.add('marble', arcSolid(cx, cz, R - 0.06, R + 0.02, gw.a - h - 0.6, gw.a + h + 0.6, y + 3.4, y + 3.75, 1));
      void g;
    }
    // ends against the arches: a pier
    for (const e of [a0, a1]) if (gaps.length) { const g = e * D2R, w = 0.9 / r / D2R * (e === a0 ? 1 : -1); bag.add('brick', arcSolid(cx, cz, r - 0.6, R + 0.9, Math.min(e, e + w), Math.max(e, e + w), y - 0.4, wallTop, 1)); void g; }
  }
  void col;
}

/**
 * forum_arch: { at, u (along the road), w (the opening), depth, y, statues } — one of the forum's two
 * facing arches of Proconnesian marble by which the Mese entered and left it: a single opening between
 * piers dressed with pilasters, an archivolt with a Gorgon's head for keystone, a cornice and an attic;
 * on the western arch two bronze statues of women.
 */
function forumArch(el, ctx) {
  const { bag } = ctx, BZ = STYLES.byzantine.elements, [x, z] = el.at, y = el.y ?? 0, u = el.u, n = [-u[1], u[0]];
  const W = el.w ?? 10, pier = 3.6, D = el.depth ?? 6, sp = y + 8.2, r = W / 2, top = sp + r + 1.4, att = top + 3.2;
  const half = W / 2 + pier, o = [x - n[0] * half, z - n[1] * half];
  BZ.planar_wall({ o, u: n, th: D, u0: 0, u1: 2 * half, y0: y - 0.5, y1: top, arches: [{ uc: half, r, spring: sp }], mat: 'proconnesian' }, ctx);
  // pilasters on both faces, the impost moulding, the archivolt, the cornice and the attic
  for (const f of [-1, 1]) {
    const F = (d0, d1) => (f > 0 ? [D / 2 + d0, D / 2 + d1] : [-D / 2 - d1, -D / 2 - d0]);
    for (const sc of [0.7, pier - 0.7, 2 * half - pier + 0.7, 2 * half - 0.7]) {
      bag.add('proconnesian', fbox(o, n, sc - 0.5, sc + 0.5, ...F(-0.01, 0.35), y - 0.5, top - 1.5));
      bag.add('marble', fbox(o, n, sc - 0.62, sc + 0.62, ...F(-0.01, 0.47), top - 1.5, top - 0.9));     // the pilaster's capital
    }
    for (const s0 of [pier - 0.35, 2 * half - pier]) bag.add('marble', fbox(o, n, s0, s0 + 0.35, ...F(-0.01, 0.2), sp - 0.45, sp));   // the impost
    // the archivolt: a moulded band round the arch on the face
    const pts = 24, [ta, tb] = f > 0 ? [D / 2 - 0.01, D / 2 + 0.18] : [-D / 2 + 0.01, -D / 2 - 0.18];
    for (let k = 0; k < pts; k++) {
      const g0 = Math.PI * k / pts, g1 = Math.PI * (k + 1) / pts, P = (rr, g, t) => { const [px, pz] = fp(o, n, half - Math.cos(g) * rr, t); return [px, sp + Math.sin(g) * rr, pz]; };
      bag.add('marble', solid8([P(r, g0, ta), P(r + 0.75, g0, ta), P(r + 0.75, g1, ta), P(r, g1, ta), P(r, g0, tb), P(r + 0.75, g0, tb), P(r + 0.75, g1, tb), P(r, g1, tb)]));
    }
    // the Gorgon's head on the keystone
    { const [kx, kz] = fp(o, n, half, f * (D / 2 + 0.12)); const g = lathe([[0.001, 0], [0.38, 0.1], [0.45, 0.45], [0.36, 0.8], [0.001, 0.95]], 12); g.scale(1, 1, 0.5); g.rotateY(Math.atan2(u[0], u[1])); g.translate(kx, sp + r - 0.2, kz); bag.add('marble', g); }
  }
  bag.add('marble', fbox(o, n, -0.4, 2 * half + 0.4, -D / 2 - 0.55, D / 2 + 0.55, top - 0.9, top - 0.5));
  bag.add('marble', fbox(o, n, -0.6, 2 * half + 0.6, -D / 2 - 0.75, D / 2 + 0.75, top - 0.5, top));
  bag.add('proconnesian', fbox(o, n, 0.3, 2 * half - 0.3, -D / 2 + 0.2, D / 2 - 0.2, top, att));
  bag.add('marble', fbox(o, n, 0.1, 2 * half - 0.1, -D / 2, D / 2, att, att + 0.4));
  for (const f of [-1, 1]) { const [p, q] = [-(f * (D / 2 - 0.2)), -(f * (D / 2 - 0.12))].sort((a, b) => a - b); bag.add('marble', fbox(o, n, 2, 2 * half - 2, p, q, top + 0.8, att - 0.8)); }   // the inscription panel
  if (el.statues) for (const s of [-1, 1]) { const [sx, sz] = fp(o, n, half + s * (half - 2.2), 0); statue(bag, 'bronze', sx, att + 0.4, sz, 3.0, Math.atan2(-u[0], -u[1]), { dress: 'robe', hat: 'veil', seed: 30 + s }); }
}

Object.assign(STYLES.roman.elements, { stoa, chalke, senate, forum_ring: forumRing, forum_arch: forumArch });
