// The Empire State Building as it opened on 1 May 1931 (docs/settlements/new-york.md §1a): the five-storey
// base with its granite storefronts and the Fifth Avenue entrance between two great piers with eagles; the
// tower stepping back at the 21st, 25th, 30th, 72nd, 81st and 85th floors; the windows in vertical bands
// framed by strips of chrome-nickel steel, with spandrels of dull aluminium between the floors and piers of
// limestone between the bands; the 86th-floor observatory with its open promenade; the mooring mast of
// four stepped tiers, a cylindrical shaft, the enclosed 102nd-floor gallery, the small open gallery and the
// cone of the mooring gear, to 381 m.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { esbLobby } from './lobby.js';

const LS = 'limestone', CH = 'steel_chrome', AL = 'aluminium_dull', GL = 'glass_outer';
const FLOOR = 3.6, BASE = 22;
/** The top of floor n (the base's five storeys to 22 m, then 3.6 m a floor). */
const fl = (n) => BASE + (n - 5) * FLOOR;

/**
 * One face of the tower's skin, from u0 to u1 along the face, between y0 and y1: the window bands every
 * ~1.55 m with a chrome strip down each side, a limestone pier between bands, the aluminium spandrel at every
 * floor. `F(u0, u1, d0, d1, ya, yb)` gives a box on the face (d out from it).
 */
function skin(bag, F, u0, u1, y0, y1, step = FLOOR, glass = false) {
  const L = u1 - u0; if (L < 1.2 || y1 - y0 < 1) return;
  const n = Math.max(1, Math.round(L / 1.55)), w = L / n, pw = Math.min(0.8, w * 0.5);
  if (glass) bag.add(GL, F(u0, u1, 0.002, 0.02, y0, y1));
  for (let i = 0; i <= n; i++) {
    const u = u0 + i * w, a = Math.max(u0, u - pw / 2), b = Math.min(u1, u + pw / 2);
    bag.add(LS, F(a, b, 0.004, 0.26, y0, y1));                                       // the pier
    if (i < n) for (const e of [b + 0.012, u + w - pw / 2 - 0.112]) if (e > u0 && e + 0.1 < u1) bag.add(CH, F(e, e + 0.1, 0.004, 0.14, y0, y1));   // the strips
  }
  for (let yy = y0 + step - 1.25; yy < y1 - 0.3; yy += step) bag.add(AL, F(u0 + 0.01, u1 - 0.01, 0.004, 0.085, yy, Math.min(y1, yy + 1.15)));   // the spandrels
}
/** A face helper for an axis-aligned face: `along` x (the face at z = o) or z (at x = o), outward sg. */
const faceBox = (along, o, sg) => (u0, u1, d0, d1, ya, yb) => {
  const p = o + sg * d0, q = o + sg * d1;
  return along ? box(Math.min(u0, u1), ya, Math.min(p, q), Math.max(u0, u1), yb, Math.max(p, q)) : box(Math.min(p, q), ya, Math.min(u0, u1), Math.max(p, q), yb, Math.max(u0, u1));
};
/**
 * A stage of the tower in the plan the shaft has: a cross of a broad pavilion on each face (half-widths px on the
 * long faces, pz on the short) standing p proud of the recessed corners; glass behind its bands, a flush limestone
 * coping on top. Returns its outline half-widths.
 */
function stage(bag, col, cx, cz, hw, hd, y0, y1, { px = hw, pz = hd, p = 0 } = {}) {
  const rects = p > 0 ? [[-px, -hd, px, hd], [px, -(hd - p), hw - p, hd - p], [-(hw - p), -(hd - p), -px, hd - p], [hw - p, -pz, hw, pz], [-hw, -pz, -(hw - p), pz]]
    : [[-hw, -hd, hw, hd]];
  for (const [a, b, c, d] of rects) {
    if (c - a < 0.01 || d - b < 0.01) continue;
    bag.add(GL, box(cx + a, y0 - 0.3, cz + b, cx + c, y1 - 0.25, cz + d));
    bag.add(LS, box(cx + a, y1 - 0.25, cz + b, cx + c, y1 + 0.9, cz + d));          // the coping
  }
  col.rect([cx - hw, cz - hd, cx + hw, cz + hd], y0, y1 + 0.9);
  const faces = p > 0 ? [
    [true, cz - hd, -1, -px, px], [true, cz + hd, 1, -px, px],
    [true, cz - hd + p, -1, -(hw - p), -px], [true, cz - hd + p, -1, px, hw - p], [true, cz + hd - p, 1, -(hw - p), -px], [true, cz + hd - p, 1, px, hw - p],
    [false, cx - hw, -1, -pz, pz], [false, cx + hw, 1, -pz, pz],
    [false, cx - hw + p, -1, -(hd - p), -pz], [false, cx - hw + p, -1, pz, hd - p], [false, cx + hw - p, 1, -(hd - p), -pz], [false, cx + hw - p, 1, pz, hd - p],
  ] : [[true, cz - hd, -1, -hw, hw], [true, cz + hd, 1, -hw, hw], [false, cx - hw, -1, -hd, hd], [false, cx + hw, 1, -hd, hd]];
  // the pavilions' returns, in limestone
  if (p > 0) for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const xa = cx + sx * px, za = cz + sz * (hd - p), zb = cz + sz * hd;
    bag.add(LS, box(Math.min(xa, xa + sx * 0.26), y0, Math.min(za, zb), Math.max(xa, xa + sx * 0.26), y1 + 0.9, Math.max(za, zb)));
    const zc = cz + sz * pz, xb = cx + sx * (hw - p), xc = cx + sx * hw;
    bag.add(LS, box(Math.min(xb, xc), y0, Math.min(zc, zc + sz * 0.26), Math.max(xb, xc), y1 + 0.9, Math.max(zc, zc + sz * 0.26)));
  }
  for (const [along, o, sg, a, b] of faces) {
    const c0 = along ? cx : cz;
    skin(bag, faceBox(along, o, sg), c0 + a + 0.3, c0 + b - 0.3, y0, y1 - 0.25);
    // the solid limestone corners of each face
    bag.add(LS, faceBox(along, o, sg)(c0 + a, c0 + a + 0.3, 0.004, 0.26, y0, y1 + 0.9));
    bag.add(LS, faceBox(along, o, sg)(c0 + b - 0.3, c0 + b, 0.004, 0.26, y0, y1 + 0.9));
  }
}
// The letters of the inscription over the entrance, as strokes on a grid (x across, y down), not overlapping.
const GLYPH = {
  E: [3, [[0, 0, 1, 5], [1, 0, 3, 1], [1, 2, 2.5, 3], [1, 4, 3, 5]]],
  M: [5, [[0, 0, 1, 5], [4, 0, 5, 5], [1, 1, 2, 2], [2, 2, 3, 3], [3, 1, 4, 2]]],
  P: [3, [[0, 0, 1, 5], [1, 0, 2, 1], [2, 0, 3, 3], [1, 2, 2, 3]]],
  I: [1, [[0, 0, 1, 5]]],
  R: [3, [[0, 0, 1, 5], [1, 0, 2, 1], [2, 0, 3, 2.6], [1, 2, 2, 3], [1.7, 3, 2.7, 4], [2, 4, 3, 5]]],
  S: [3, [[0, 0, 3, 1], [0, 1, 1, 2], [0, 2, 3, 3], [2, 3, 3, 4], [0, 4, 3, 5]]],
  T: [3, [[0, 0, 3, 1], [1, 1, 2, 5]]],
  A: [3, [[0, 0, 1, 5], [2, 0, 3, 5], [1, 0, 2, 1], [1, 2, 2, 3]]],
  ' ': [1, []],
};
/** Letters on a face, centred at uc, the top at yTop, k metres a grid unit; u runs as the reader's left to right (dir ±1 along the face's axis). */
function inscribe(bag, F, text, uc, yTop, k, dir) {
  const W = [...text].reduce((s, c) => s + GLYPH[c][0] + 1, -1);
  let u = -W / 2;
  for (const c of text) {
    const [w, strokes] = GLYPH[c];
    for (const [a, b, cc, d] of strokes) {
      const p = uc + dir * (u + a) * k, q = uc + dir * (u + cc) * k;
      bag.add('gilt_bronze', F(Math.min(p, q), Math.max(p, q), 0.004, 0.06, yTop - d * k, yTop - b * k));
    }
    u += w + 1;
  }
}
/** A stylised eagle of stone, wings raised, facing out along +d of the face, standing on a pier top at (uc, y). */
function eagle(bag, F, uc, y, d0) {
  bag.add(LS, F(uc - 0.9, uc + 0.9, d0, d0 + 1.2, y, y + 0.5));                        // the plinth
  bag.add(LS, F(uc - 0.45, uc + 0.45, d0 + 0.2, d0 + 1.0, y + 0.5, y + 2.2));           // the body
  bag.add(LS, F(uc - 0.3, uc + 0.3, d0 + 0.5, d0 + 1.25, y + 2.2, y + 2.8));            // the head and beak
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {                                   // the wings in stepped feathers
    const a = uc + s * (0.45 + k * 0.32), b = a + s * 0.32;
    bag.add(LS, F(Math.min(a, b), Math.max(a, b), d0 + 0.25, d0 + 0.75, y + 1.0 + k * 0.15, y + 3.0 - k * 0.38));
  }
}
/** empire_state: { rect (the full lot), y } */
export function empireState(el, { bag, col, lights }) {
  const r = el.rect, y = el.y ?? 0, cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
  const [x0, z0, x1, z1] = r;
  // the base: five storeys over the whole lot
  const RD = 2.2, ez0 = cz - 5.2, ez1 = cz + 5.2, ey = y + 14.5;                          // the entrance's recess in the Fifth Avenue front
  // (hollowed by the lobby: the hall from the doors west to the silhouette, the corridor across it — new-york.md §1e)
  const xr = x1 - RD, H1 = [xr - 28.8, ez0 + 0.2, xr, ez1 - 0.2], H2 = [xr - 20.8, z0 + 6, xr - 14.8, z1 - 6], hTop = y + 14.5, cTop = y + 7.6;
  for (const [ya, yb2, holes] of [[y - 0.5, cTop, [H1, H2]], [cTop, hTop, [H1]], [hTop, y + BASE, []]]) for (const q of subtractRects([x0, z0, xr, z1], holes)) { bag.add(LS, box(q[0], ya, q[1], q[2], yb2, q[3])); col.rect(q, ya, yb2); }
  for (const [a, b, ya] of [[z0, ez0, y - 0.5], [ez1, z1, y - 0.5], [ez0, ez1, ey]]) { bag.add(LS, box(x1 - RD, ya, a, x1, y + BASE, b)); col.rect([x1 - RD, a, x1, b], ya, y + BASE); }
  col.rect(r, y + BASE, y + BASE + 1.2); col.floor(r, y + BASE + 1.2);
  esbLobby(bag, col, lights, { H1, H2, y, yF: y + 0.15, hTop, cTop });
  bag.add(LS, box(x0 - 0.3, y + BASE, z0 - 0.3, x1 + 0.3, y + BASE + 1.2, z1 + 0.3));     // the parapet over the base
  const faces = [[true, z0, -1, x0, x1], [true, z1, 1, x0, x1], [false, x0, -1, z0, z1], [false, x1, 1, z0, z1]];
  for (const [along, o, sg, a, b] of faces) {
    const F = faceBox(along, o, sg), fifth = !along && sg > 0, mid = (a + b) / 2;
    const gaps = fifth ? [[a, mid - 7.5], [mid + 7.5, b]] : [[a, b]];
    for (const [u0, u1] of gaps) {
      // the storefronts: a base of black granite, plate glass between granite piers, a chrome-framed transom, a limestone fascia
      bag.add('granite_black', F(u0, u1, 0.004, 0.12, y - 0.5, y + 0.8));
      const n = Math.max(1, Math.round((u1 - u0) / 6.2)), w = (u1 - u0) / n;
      for (let i = 0; i < n; i++) {
        const s0 = u0 + i * w, s1 = s0 + w;
        bag.add('granite_black', F(s0, s0 + 0.7, 0.004, 0.18, y + 0.8, y + 4.6)); if (i === n - 1) bag.add('granite_black', F(s1 - 0.7, s1, 0.004, 0.18, y + 0.8, y + 4.6));
        bag.add(GL, F(s0 + 0.7, s1 - (i === n - 1 ? 0.7 : 0), 0.004, 0.03, y + 0.8, y + 4.4));
        bag.add(CH, F(s0 + 0.7, s1 - (i === n - 1 ? 0.7 : 0), 0.004, 0.08, y + 3.3, y + 3.4));
        if (i % 2 === 1) bag.add(CH, F(s0 + w / 2 - 0.05, s0 + w / 2 + 0.05, 0.004, 0.08, y + 0.8, y + 3.3));
      }
      bag.add(LS, F(u0, u1, 0.004, 0.3, y + 4.4, y + 5.0));
      skin(bag, F, u0 + 0.4, u1 - 0.4, y + 5.0, y + BASE - 0.4, (BASE - 5) / 4, true);
    }
    if (!fifth) continue;
    // the Fifth Avenue entrance: two great piers crowned by eagles, the triple-height transom of chrome in a stepped
    // pattern over the doors, a central pair of doors flanked by revolving doors; EMPIRE STATE in gilt over the fifth floor
    for (const s of [-1, 1]) {
      const pa = mid + s * 7.5, pb = mid + s * 5.2;
      bag.add(LS, F(Math.min(pa, pb), Math.max(pa, pb), 0.004, 1.4, y - 0.5, y + 16));
      for (let k = 0; k < 6; k++) bag.add(LS, F(Math.min(pa, pb) + 0.3, Math.max(pa, pb) - 0.3, 1.4, 1.55, y + 2 + k * 2.3, y + 3.6 + k * 2.3));   // the mouldings down the pier
      eagle(bag, F, (pa + pb) / 2, y + 16, 0.2);
    }
    bag.add(LS, F(mid - 5.2, mid + 5.2, 0.004, 0.5, y + 14.5, y + 16));                 // the lintel
    bag.add('granite_black', F(mid - 5.2, mid + 5.2, -RD, 0.004, y - 0.5, y + 0.15));    // the threshold
    // the glass at the back of the recess, the central doors standing open into the lobby
    for (const [a, b, ya] of [[mid - 5.2, mid - 1.4, y + 0.15], [mid + 1.4, mid + 5.2, y + 0.15], [mid - 1.4, mid + 1.4, y + 3.6]]) bag.add(GL, F(a, b, -RD, -RD + 0.02, ya, y + 14.5));
    for (const [a, b] of [[mid - 5.2, mid - 1.4], [mid + 1.4, mid + 5.2]]) col.rect(along ? [a, o - RD, b, o - RD + 0.02] : [o - RD, a, o - RD + 0.02, b], y, y + 14.5);
    for (let i = 0; i <= 8; i++) { const u = mid - 5.2 + i * 10.4 / 8; bag.add(CH, F(Math.max(mid - 5.2, u - 0.07), Math.min(mid + 5.2, u + 0.07), -RD + 0.02, -RD + 0.2, i === 4 ? y + 3.6 : y + 0.15, y + 14.5)); }
    for (const s of [-1, 1]) bag.add(CH, F(mid + s * 1.4 - 0.08, mid + s * 1.4 + 0.08, -RD + 0.02, -RD + 0.24, y + 0.15, y + 3.6));
    for (const s of [-1, 1]) bag.add('gilt_bronze', F(mid + s * 1.4, mid + s * 1.45, -RD - 1.3, -RD, y + 0.15, y + 3.45));     // the leaves folded back inside
    for (let k = 0; k < 7; k++) {                                                          // the stepped transom
      const yy = y + 5 + k * 1.35, hwk = 5.2 - Math.abs(k - 3) * 0.6;
      bag.add(CH, F(mid - 5.2, mid + 5.2, -RD + 0.02, -RD + 0.16, yy, yy + 0.12));
      bag.add(CH, F(mid - hwk, mid + hwk, -RD + 0.16, -RD + 0.28, yy + 0.5, yy + 0.6));
    }
    for (const s of [-1, 1]) bag.add('opening', F(mid + s * 3.6 - 1.0, mid + s * 3.6 + 1.0, -RD + 0.2, -RD + 0.3, y + 0.15, y + 3.0));
    for (const s of [-1, 1]) bag.add(CH, lathe([[0.95, 0], [0.95, 0.12], [0.9, 0.12], [0.9, 2.9], [0.95, 2.9], [0.95, 3.05], [0.001, 3.05]], 16, null, ...(along ? [mid + s * 3.6, y + 0.15, o - sg * 1.05] : [o - sg * 1.05, y + 0.15, mid + s * 3.6])));   // the revolving doors' drums
    bag.add(CH, F(mid - 5.2, mid + 5.2, -RD + 0.02, -RD + 0.3, y + 4.4, y + 4.6));
    inscribe(bag, F, 'EMPIRE STATE', mid, y + BASE - 0.5, 0.26, -sg);
  }
  // the tower: set back on all sides above the fifth floor, stepping in at the 21st, 25th, 30th, 72nd, 81st and 85th floors
  const T = [
    [44, 18.5, 5, 21, {}],
    [41, 17, 21, 25, {}],
    [37, 15.5, 25, 30, {}],
    [31, 14, 30, 72, { px: 18, pz: 7, p: 1.6 }],
    [20, 10.5, 72, 81, { px: 12, pz: 5, p: 1.0 }],
    [14.5, 9, 81, 85, {}],
  ];
  for (const [hw, hd, f0, f1, o] of T) stage(bag, col, cx, cz, hw, hd, y + fl(f0) + 0.9, y + fl(f1), o);
  // the 86th floor: the open promenade round the enclosed observatory, its parapet; the observatory's tall windows
  const y85 = y + fl(85) + 0.9, y86 = y85 + 4.6;
  for (const [a, b, c, d] of [[-14.5, -9, 14.5, -8.4], [-14.5, 8.4, 14.5, 9], [-14.5, -8.4, -13.9, 8.4], [13.9, -8.4, 14.5, 8.4]]) bag.add(LS, box(cx + a, y85, cz + b, cx + c, y85 + 1.3, cz + d));
  bag.add('granite_grey', box(cx - 13.9, y85, cz - 8.4, cx + 13.9, y85 + 0.05, cz + 8.4));
  bag.add(LS, box(cx - 10, y85, cz - 6.5, cx + 10, y86, cz + 6.5)); col.rect([cx - 10, cz - 6.5, cx + 10, cz + 6.5], y85, y86);
  for (const [along, o, sg, a, b] of [[true, cz - 6.5, -1, cx - 10, cx + 10], [true, cz + 6.5, 1, cx - 10, cx + 10], [false, cx - 10, -1, cz - 6.5, cz + 6.5], [false, cx + 10, 1, cz - 6.5, cz + 6.5]]) {
    const F = faceBox(along, o, sg), n = Math.round((b - a) / 1.7), w = (b - a) / n;
    for (let i = 0; i < n; i++) { bag.add(GL, F(a + i * w + 0.25, a + (i + 1) * w - 0.25, 0.004, 0.02, y85 + 0.9, y86 - 0.9)); bag.add(CH, F(a + i * w + 0.18, a + i * w + 0.25, 0.004, 0.12, y85 + 0.9, y86 - 0.9)); }
  }
  bag.add(LS, box(cx - 10.4, y86, cz - 6.9, cx + 10.4, y86 + 1.0, cz + 6.9));
  // the mooring mast of aluminium, chrome-nickel steel and glass: four stepped tiers, the wings at their corners,
  // the cylindrical shaft, the enclosed and the open galleries, the cone of the mooring gear
  let ym = y86 + 1.0;
  const tiers = [[8.2, 7.2, 5.5], [7.0, 6.1, 5.0], [5.9, 5.1, 4.6], [4.8, 4.3, 4.2]];
  for (const [hx, hz, h] of tiers) {
    bag.add(AL, box(cx - hx + 0.4, ym, cz - hz + 0.4, cx + hx - 0.4, ym + h - 0.4, cz + hz - 0.4));
    bag.add(CH, box(cx - hx, ym + h - 0.4, cz - hz, cx + hx, ym + h, cz + hz));
    for (const [along, o, sg, a, b] of [[true, cz - hz + 0.4, -1, cx - hx + 0.4, cx + hx - 0.4], [true, cz + hz - 0.4, 1, cx - hx + 0.4, cx + hx - 0.4], [false, cx - hx + 0.4, -1, cz - hz + 0.4, cz + hz - 0.4], [false, cx + hx - 0.4, 1, cz - hz + 0.4, cz + hz - 0.4]]) {
      const F = faceBox(along, o, sg), n = Math.max(3, Math.round((b - a) / 1.1)), w = (b - a) / n;
      for (let i = 0; i <= n; i++) bag.add(CH, F(a + i * w - 0.09, a + i * w + 0.09, 0.004, 0.4, ym, ym + h - 0.4));     // the ribs
      for (let i = 0; i < n; i++) bag.add(GL, F(a + i * w + 0.2, a + (i + 1) * w - 0.2, 0.004, 0.02, ym + h * 0.45, ym + h - 0.9));
    }
    ym += h;
  }
  // the wings: four fins at the corners, sloping from the first tier's corners in to the shaft
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const a = [cx + dx * 8.6, y86 + 1.0, cz + dz * 7.6], b = [cx + dx * 2.4, ym + 9, cz + dz * 2.4], c = [cx + dx * 2.4, y86 + 1.0, cz + dz * 2.4];
    const nx = dz / Math.SQRT2 * 0.22, nz = -dx / Math.SQRT2 * 0.22, T2 = [];
    const P = (p, s) => [p[0] + s * nx, p[1], p[2] + s * nz];
    const A1 = P(a, 1), B1 = P(b, 1), C1 = P(c, 1), A2 = P(a, -1), B2 = P(b, -1), C2 = P(c, -1);
    T2.push(...A1, ...B1, ...C1, ...A2, ...C2, ...B2, ...A1, ...A2, ...B2, ...A1, ...B2, ...B1, ...B1, ...B2, ...C2, ...B1, ...C2, ...C1, ...C1, ...C2, ...A2, ...C1, ...A2, ...A1);
    bag.add(CH, fromTriangles(T2));
  }
  // the shaft with its fluting, the 102nd floor's glass drum, the open gallery, the cone and the mooring tip
  const yTop = y + 381, yS = ym, yG = yTop - 16, yO = yTop - 11.8, yC = yTop - 9.5;
  bag.add(AL, lathe([[3.6, 0], [3.6, yG - yS], [0.001, yG - yS]], 24, null, cx, yS, cz));
  for (let k = 0; k < 16; k++) { const t = k / 16 * Math.PI * 2; bag.add(CH, box(-0.14, 0, -0.1, 0.14, yG - yS, 0.1).rotateY(-t).translate(cx + Math.cos(t) * 3.62, yS, cz + Math.sin(t) * 3.62)); }
  for (let k = 0; k < 8; k++) { const t = (k + 0.5) / 8 * Math.PI * 2; for (let yy = yS + 2; yy < yG - 2; yy += 3.4) bag.add(GL, box(-0.1, 0, -0.38, 0.1, 1.6, 0.38).rotateY(-t).translate(cx + Math.cos(t) * 3.56, yy, cz + Math.sin(t) * 3.56)); }
  bag.add(CH, lathe([[3.9, 0], [3.9, 0.5], [3.3, 0.5]], 24, null, cx, yG, cz));
  bag.add(GL, lathe([[3.3, 0], [3.3, yO - yG - 0.6], [0.001, yO - yG - 0.6]], 24, null, cx, yG + 0.5, cz));      // the enclosed gallery
  for (let k = 0; k < 12; k++) { const t = k / 12 * Math.PI * 2; bag.add(CH, rod([cx + Math.cos(t) * 3.34, yG + 0.5, cz + Math.sin(t) * 3.34], [cx + Math.cos(t) * 3.34, yO - 0.1, cz + Math.sin(t) * 3.34], 0.08, 4)); }
  bag.add(CH, lathe([[3.7, 0], [3.7, 0.4], [0.001, 0.4]], 24, null, cx, yO - 0.1, cz));
  bag.add(AL, lathe([[2.6, 0], [2.6, yC - yO - 0.3], [0.001, yC - yO - 0.3]], 20, null, cx, yO + 0.3, cz));   // the open gallery's core
  bag.add(CH, lathe([[3.6, 0], [3.6, 0.06], [3.55, 0.06], [3.55, 1.1], [3.6, 1.1], [3.6, 1.16], [3.5, 1.16], [3.5, 0.06]], 24, null, cx, yO + 0.3, cz));   // its railing
  for (let k = 0; k < 24; k++) { const t = k / 24 * Math.PI * 2; bag.add(CH, rod([cx + Math.cos(t) * 3.56, yO + 0.3, cz + Math.sin(t) * 3.56], [cx + Math.cos(t) * 3.56, yO + 1.4, cz + Math.sin(t) * 3.56], 0.03, 4)); }
  bag.add(AL, lathe([[2.8, 0], [2.8, 0.5], [2.2, 1.5], [1.3, 6.2], [1.0, 7.0], [0.55, 7.2], [0.55, 9.0], [0.3, 9.5], [0.001, 9.5]], 20, null, cx, yC, cz));
  for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); bag.add(CH, rod([cx + c * 2.82, yC + 0.4, cz + s * 2.82], [cx + c * 1.05, yC + 7.0, cz + s * 1.05], 0.1, 4)); }
}
