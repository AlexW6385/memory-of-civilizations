// The Chrysler Building's body as it stood in 1930 (docs/settlements/new-york.md §1n): a base with a black granite
// ground storey and three marble storeys, a three-storey Shastone granite portal on Lexington Avenue and on
// 42nd Street, white brick piers between windows with aluminium spandrels, the setbacks at the 16th, 18th, 23rd,
// 28th and 31st floors, the shaft of three window columns a side between brick and marble pillars, spandrels
// in alternating grey and white stripes and corners of horizontal rows of black brick, and the 31st floor's
// frieze of hubcaps. (The crown, the spire, the eagles and the radiator caps are in index.js.)

import { box, lathe, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { chryslerLobby } from './chryslerlobby.js';

const WH = 'plaster_white', MW = 'marble_smooth', GR = 'granite_grey', GB = 'granite_black', CH = 'steel_chrome', AL = 'aluminium_dull', GL = 'glass_outer', LS = 'limestone', GD = 'gilt_bronze';
const FLOOR = 3.9;
/** Where floor n ends above the base line. */
export const fl = (n) => n * FLOOR;
/** The tower's stages: through the 16th floor the whole lot, then the setbacks; the shaft above the 31st. */
export const STAGES = [[fl(16), 25, 19], [fl(18), 23.2, 18.0], [fl(23), 21.4, 17.0], [fl(28), 19.6, 16.2], [fl(31), 18.0, 15.6]];
export const SHAFT = { hw: 15, top: 240 };
/** Where the radiator caps stand (offsets from the centre): the corners of the 31st floor's roof. */
export const CAP_AT = [16.5, 14.3, fl(31) + 0.2];

/** A box on an axis-aligned face: along x (the face at z = o) or along z (at x = o), d out from it by sg, u0…u1 along it. */
const faceBox = (along, o, sg) => (u0, u1, d0, d1, ya, yb) => {
  const p = o + sg * d0, q = o + sg * d1;
  return along ? box(Math.min(u0, u1), ya, Math.min(p, q), Math.max(u0, u1), yb, Math.max(p, q)) : box(Math.min(p, q), ya, Math.min(u0, u1), Math.max(p, q), yb, Math.max(u0, u1));
};
/** The four faces of a stage's outline: [along, o, sg, u0, u1]. The along-x faces are 0.3 wider each end (the corner pier turns the corner). */
const facesOf = (cx, cz, hx, hz) => [
  [false, cx - hx, -1, cz - hz, cz + hz], [false, cx + hx, 1, cz - hz, cz + hz],
  [true, cz - hz, -1, cx - hx - 0.3, cx + hx + 0.3], [true, cz + hz, 1, cx - hx - 0.3, cx + hx + 0.3],
];
/** Window bays on a face between y0 and y1: a pier between bays (pier material `pier`), chrome frame strips each side, the aluminium spandrel at every floor. */
function bays(bag, F, u0, u1, y0, y1, pier = WH, step = FLOOR) {
  const L = u1 - u0; if (L < 1.2 || y1 - y0 < 1) return;
  const n = Math.max(1, Math.round(L / 1.7)), w = L / n, pw = 0.75;
  for (let i = 0; i <= n; i++) {
    const u = u0 + i * w, a = Math.max(u0, u - pw / 2), b = Math.min(u1, u + pw / 2);
    bag.add(pier, F(a, b, 0.004, 0.3, y0, y1));
    if (i < n) for (const e of [b + 0.01, u + w - pw / 2 - 0.09]) if (e > u0 && e + 0.08 < u1) bag.add(CH, F(e, e + 0.08, 0.004, 0.12, y0, y1));
  }
  for (let yy = y0 + step - 1.3; yy < y1 - 0.3; yy += step) bag.add(AL, F(u0 + 0.01, u1 - 0.01, 0.004, 0.09, yy, Math.min(y1, yy + 1.2)));
}
/** A flat band round a stage's outline, `d` proud (the courses of marble, the copings). */
const ring = (bag, mat, cx, cz, hx, hz, ya, yb, d) => bag.add(mat, box(cx - hx - d, ya, cz - hz - d, cx + hx + d, yb, cz + hz + d));

/** The portal: three storeys of Shastone granite framed round a recess with the revolving doors, a screen of chrome and glass above them. F is the face; c the centre (u). */
function portal(bag, F, c, y, depth) {
  const W = 9, PW = 1.7, H = 12.0, TOP = fl(4) + 2.4;
  // the frame: piers either side standing out, a lintel with its chevrons, the faces of the recess in granite
  for (const s of [-1, 1]) {
    const a = c + s * W / 2, b = c + s * (W / 2 + PW);
    bag.add(GR, F(Math.min(a, b), Math.max(a, b), 0.004, 0.55, y - 0.5, y + TOP));
    bag.add(MW, F(Math.min(a, a + s * 0.3), Math.max(a, a + s * 0.3), -0.0, 0.7, y + 0.2, y + TOP - 0.2));   // the inner moulding
  }
  bag.add(GR, F(c - W / 2 - PW, c + W / 2 + PW, 0.004, 0.55, y + H, y + TOP));
  bag.add(MW, F(c - W / 2, c + W / 2, 0.004, 0.65, y + H, y + H + 0.35));
  // chevrons on the lintel (gilt bronze rods in inverted Vs)
  for (let k = 0; k < 4; k++) { const yb = y + H + 0.5 + k * 0.38; for (const s of [-1, 1]) bag.add(GD, rod(F.P(c, 0.6, yb), F.P(c + s * (W / 2 - 0.2 - k * 0.55), 0.6, yb - 0.45), 0.05, 5)); }
  // the recess: floor, ceiling, the glazed screen set back 0.8 from the back wall
  bag.add('travertine', F(c - W / 2, c + W / 2, -depth, 0.05, y - 0.5, y + 0.04));
  bag.add(MW, F(c - W / 2, c + W / 2, -depth, 0.0, y + H - 0.1, y + H));
  const sd = depth - 1.2;
  bag.add(GL, F(c - W / 2, c + W / 2, -sd - 0.04, -sd, y + 0.04, y + H - 0.1));
  // three revolving doors: a glazed drum between two chrome rings, four leaves, a canopy ring
  for (const du of [-2.9, 0, 2.9]) {
    const [x, , z] = F.P(c + du, -sd, 0);
    bag.add(CH, lathe([[1.15, 0], [1.15, 0.06], [0.001, 0.06]], 16, null, x, y + 0.04, z));
    bag.add(CH, lathe([[1.17, 0], [1.17, 0.12], [0.001, 0.12]], 16, null, x, y + 2.5, z));
    bag.add(GL, lathe([[1.1, 0.1], [1.1, 2.4]], 16, null, x, y + 0.04, z));
    for (let k = 0; k < 4; k++) bag.add(CH, box(0, 0.1, -0.03, 1.1, 2.4, 0.03).rotateY(k * Math.PI / 2 + 0.5).translate(x, y + 0.04, z));
    for (const s of [-1, 1]) bag.add(CH, F(c + du + s * 1.22, c + du + s * 1.22 + s * 0.1, -sd, -sd + 2.3, y + 0.04, y + 2.5));
  }
  // the screen over the doors: chrome mullions and transoms, a fan of chevrons at the head
  for (let u = c - W / 2; u <= c + W / 2 + 0.01; u += W / 10) bag.add(CH, F(u - 0.05, u + 0.05, -sd - 0.1, -sd + 0.06, y + 2.62, y + H - 0.1));
  for (let yy = y + 2.62; yy < y + H - 0.1; yy += 1.4) bag.add(CH, F(c - W / 2, c + W / 2, -sd - 0.1, -sd + 0.06, yy, yy + 0.09));
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) bag.add(CH, rod(F.P(c, -sd + 0.1, y + H - 0.4 - k * 0.65 + 0.5), F.P(c + s * (1.0 + k * 0.8), -sd + 0.1, y + H - 0.4 - k * 0.65 - 0.6), 0.04, 5));
}

/**
 * chryslerBody: the base, setbacks and shaft of the tower, centred (cx, cz) on its lot r = [x0, z0, x1, z1], standing at y.
 * Lexington Avenue is the west face (x0) and 42nd Street the south (z1): their portals. Collides with the base and its portals' recesses.
 */
export function chryslerBody(bag, col, r, y, cx, cz, lights = []) {
  const [x0, z0, x1, z1] = r, T = fl(16), PD = 2.4, PW2 = 6.2, HOLE = fl(4) + 2.4;
  // ── the base: the lot's whole outline through the 16th floor, the two portals cut into it ──
  const LOB = [x0 + PD, cz - 5.5, x0 + PD + 22, cz + 5.5], holes = [[x0, cz - 4.5, x0 + PD, cz + 4.5], [cx - 4.5, z1 - PD, cx + 4.5, z1], LOB];
  for (const [ya, yb, hs] of [[y - 0.5, y + 12.0, holes], [y + 12.0, y + T, []]]) for (const q of subtractRects(r, hs)) { bag.add(GL, box(q[0], ya, q[1], q[2], yb, q[3])); col.rect(q, ya, yb); }
  col.floor(r, y + T);
  for (const [a, b] of [[cz - 4.5, cz - 1.3], [cz + 1.3, cz + 4.5]]) col.rect([x0 + (PD - 1.2), a, x0 + PD, b], y, y + 12.0);   // (the middle revolving door stands open to the lobby)
  chryslerLobby(bag, col, lights, LOB, y, y + 11.9, [cz - 4.5, cz + 4.5]);
  col.rect([cx - 4.5, z1 - PD, cx + 4.5, z1 - (PD - 1.2)], y, y + 12.0);   // the screens at the recesses' backs
  const base = [[false, x0, -1, z0, z1, 'w'], [false, x1, 1, z0, z1, 'e'], [true, z0, -1, x0 - 0.3, x1 + 0.3, 'n'], [true, z1, 1, x0 - 0.3, x1 + 0.3, 's']];
  for (const [along, o, sg, u0, u1, name] of base) {
    const F = faceBox(along, o, sg), c = along ? cx : cz;
    const hasPortal = name === 'w' || name === 's';
    F.P = (u, d, yy) => (along ? [u, yy, o + sg * d] : [o + sg * d, yy, u]);
    // the black granite ground storey, its shop windows framed in Nirosta; the marble storeys over it; the brick above
    const segs = hasPortal ? [[u0, c - W2(PW2)], [c + W2(PW2), u1]] : [[u0, u1]];
    for (const [a, b] of segs) {
      if (b - a < 0.5) continue;
      bag.add(GB, F(a, b, 0.004, 0.2, y - 0.5, y + 6.0));
      const n = Math.max(1, Math.round((b - a) / 3.2)), w = (b - a) / n;
      for (let i = 0; i <= n; i++) bag.add(CH, F(a + i * w - 0.05, a + i * w + 0.05, 0.12, 0.27, y + 0.8, y + 5.2));
      for (const [ya, yb] of [[0.8, 0.9], [5.1, 5.2]]) bag.add(CH, F(a, b, 0.12, 0.27, y + ya, y + yb));
      bag.add(GL, F(a + 0.15, b - 0.15, 0.2, 0.22, y + 0.9, y + 5.1));
      bays(bag, F, a, b, y + 6.0, y + fl(4) + 2.4, MW);
      bays(bag, F, a, b, y + fl(4) + 2.4, y + T - 0.3, WH);
    }
    if (hasPortal) portal(bag, F, c, y, PD);
    if (hasPortal) for (const [ya, yb] of [[y + fl(4) + 2.4, y + T - 0.3]]) { const a = c - W2(PW2), b = c + W2(PW2); bays(bag, F, a, b, ya, yb, WH); }
    // the marble courses over the 4th floor and at the 10th (the white marble bands in the brick)
    for (const yy of [fl(4) + 2.3, fl(10)]) bag.add(MW, F(u0, u1, 0.004, 0.42, y + yy, y + yy + 0.4));
  }
  // ── the setbacks ──
  let yb = y + T;
  ring(bag, LS, cx, cz, STAGES[0][1], STAGES[0][2], yb - 0.35, yb + 0.2, 0.45);
  for (let i = 1; i < STAGES.length; i++) {
    const [top, hx, hz] = STAGES[i], ya = yb + 0.2, yt = y + top;
    bag.add(GL, box(cx - hx, ya - 0.3, cz - hz, cx + hx, yt, cz + hz));
    const last = i === STAGES.length - 1, skinTop = last ? yt - 3.3 : yt - 0.3;
    for (const [along, o, sg, u0, u1] of facesOf(cx, cz, hx, hz)) bays(bag, faceBox(along, o, sg), u0, u1, ya, skinTop, WH);
    if (last) {
      // the 31st floor: a frieze of hubcaps and fenders in grey and white round the stage, the radiator caps at its corners (index.js)
      for (const [along, o, sg, u0, u1] of facesOf(cx, cz, hx, hz)) {
        const F = faceBox(along, o, sg), ya2 = skinTop, yb2 = yt - 0.3;
        bag.add(WH, F(u0, u1, 0.004, 0.34, ya2, yb2));
        const nz = Math.round((u1 - u0 - 2) / 3);
        for (let k = 0; k <= nz; k++) {
          const u = u0 + 1 + k * (u1 - u0 - 2) / Math.max(1, nz);
          const g = lathe([[0.001, 0], [0.9, 0], [0.9, 0.1], [0.55, 0.2], [0.001, 0.26]], 12);
          if (along) g.rotateX(sg * Math.PI / 2); else g.rotateZ(-sg * Math.PI / 2);
          const p = along ? [u, 0, o + sg * 0.34] : [o + sg * 0.34, 0, u];
          g.translate(p[0], ya2 + 1.65, p[2]); bag.add(CH, g);
          if (k < nz) { const u2 = u + (u1 - u0 - 2) / Math.max(1, nz) / 2; bag.add(GR, F(u2 - 0.7, u2 + 0.7, 0.34, 0.4, ya2 + 0.5, ya2 + 0.8)); bag.add(GR, F(u2 - 0.5, u2 + 0.5, 0.34, 0.4, ya2 + 2.5, ya2 + 2.8)); }   // the fenders, flat bands
        }
      }
    }
    ring(bag, LS, cx, cz, hx, hz, yt - 0.35, yt + 0.2, 0.45);
    yb = yt;
  }
  // ── the shaft: three window columns a side between brick and marble pillars, striped spandrels, black brick corners ──
  const hw = SHAFT.hw, s0 = yb + 0.2, s1 = y + SHAFT.top, nF = Math.round((s1 - s0) / FLOOR), step = (s1 - s0) / nF;
  bag.add(GL, box(cx - hw, s0 - 0.3, cz - hw, cx + hw, s1, cz + hw));
  for (const [along, o, sg, u0, u1] of facesOf(cx, cz, hw, hw)) {
    const F = faceBox(along, o, sg), a0 = along ? cx - hw : cz - hw, e = 2.4, pil = 1.8, win = (2 * hw - 2 * e - 2 * pil) / 3;
    // corners: white brick with rows of black, the along faces carrying the corner round
    for (const [ca, cb] of [[a0 - (along ? 0.3 : 0), a0 + e], [a0 + 2 * hw - e, a0 + 2 * hw + (along ? 0.3 : 0)]]) {
      bag.add(WH, F(ca, cb, 0.004, 0.12, s0, s1));
      for (let yy = s0; yy < s1 - 0.2; yy += 0.6) bag.add(GB, F(ca, cb, 0.004, 0.17, yy + 0.3, yy + 0.58));
    }
    for (let k = 0; k < 3; k++) {
      const wa = a0 + e + k * (win + pil), wb = wa + win;
      if (k < 2) bag.add(MW, F(wb, wb + pil, 0.004, 0.36, s0, s1));                 // the marble pillar
      for (const m of [0.25, 0.5, 0.75]) bag.add(CH, F(wa + win * m - 0.05, wa + win * m + 0.05, 0.004, 0.14, s0, s1));   // the mullions
      bag.add(CH, F(wa, wa + 0.08, 0.004, 0.14, s0, s1)); bag.add(CH, F(wb - 0.08, wb, 0.004, 0.14, s0, s1));
      for (let f = 0; f < nF; f++) {
        const ya = s0 + f * step + step - 1.3, yb2 = ya + 1.2;
        if (ya > s1 - 0.5) break;
        bag.add(WH, F(wa, wb, 0.004, 0.1, ya, yb2));
        for (let u = wa + 0.3; u + 0.3 <= wb; u += 1.2) bag.add(GR, F(u, u + 0.6, 0.1, 0.15, ya + 0.04, yb2 - 0.04));   // the grey stripes of the spandrel
      }
    }
  }
  ring(bag, LS, cx, cz, hw, hw, s1 - 0.4, s1, 0.4);
}
const W2 = (v) => v;
