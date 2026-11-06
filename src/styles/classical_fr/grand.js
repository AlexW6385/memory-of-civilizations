// The central block of Versailles with its state rooms (docs/settlements/versailles.md §1c): Le Vau's envelope
// and Hardouin-Mansart's garden front, hollowed on the first floor for the Hall of Mirrors (1678–84) along the
// garden — seventeen arched windows facing seventeen arcades of mirrors (357 glasses), pilasters of Rance marble
// with gilt bronze capitals of the French order, green Campan marble on the piers with gilt trophies, the barrel
// vault painted under Le Brun in gilt frames, three rows of crystal chandeliers, the silver furniture of the 1680s
// — and at its ends the Salon de la Guerre (Coysevox's oval relief of the King on horseback) and the Salon de la
// Paix under their painted coves; from the Salon de la Guerre the King's Grand Apartment runs east — Apollo (the
// silver throne under its canopy), Mercury (the state bed behind its silver balustrade), Mars (the musicians'
// tribunes), Diana (the billiard table), Venus (Warin's statue of the King) — to the Ambassadors' Staircase.
//
// grand_corps: { rect (the block), ext (its extension east of the north end), stair (the staircase hall), y, h, fy (the first floor) }

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { planarWall } from '../byzantine/index.js';
import { gardenFront } from './front.js';
import { frame, ringGeo, bar, painting, wallPainting, cove, parquet, marbleFloor, chandelier, gueridon, silverTable, orangeTub, silverBench, trophy, mask, frenchCapital, rng, GB, GD, AG, MS, WM, RM, GM, DM, MI, FR } from './rooms.js';

const S = 'sandstone_dressed';
// heights above the first floor: the arches' springing and radius, the entablature, the top of the cornice
const SPRING = 7.16, AR = 1.1, ARCH = 8.35, FRIEZE = 8.75, CORN = 9.15, TOP = 9.6;

/** A partition along x (at plan z, thickness th) from xa to xb, or along z: a planar wall with doors, lined in its doors. */
function partition(ctx, { along, at, th, a, b, y0, y1, doors = [], arch }) {
  const { bag, col } = ctx, mid = (a + b) / 2;
  const o = along === 'x' ? [mid, at] : [at, mid], u = along === 'x' ? [1, 0] : [0, 1];
  const holes = doors.map((d) => ({ u0: d.c - d.w / 2 - mid, u1: d.c + d.w / 2 - mid, y0, y1: y0 + d.h }));
  const arches = arch ? [{ uc: arch.c - mid, r: arch.r, spring: arch.spring, sill: y0 }] : [];
  bag.add(S, planarWall({ o, u, th, u0: a - mid, u1: b - mid, y0, y1, holes, arches }));
  const R = (p, q, v0, v1) => col.rect(along === 'x' ? [p, at - th / 2, q, at + th / 2] : [at - th / 2, p, at + th / 2, q], v0, v1);
  const gaps = [...doors.map((d) => [d.c - d.w / 2, d.c + d.w / 2, y0 + d.h]), ...(arch ? [[arch.c - arch.r, arch.c + arch.r, arch.spring]] : [])].sort((p, q) => p[0] - q[0]);
  let cur = a;
  for (const [g0, g1, top] of gaps) { if (g0 > cur) R(cur, g0, y0, y1); R(g0, g1, top, y1); cur = g1; }
  if (b > cur) R(cur, b, y0, y1);
  // the floor through each opening, and its marble threshold; the reveals lined in marble
  for (const [g0, g1] of gaps) {
    const r = along === 'x' ? [g0, at - th / 2, g1, at + th / 2] : [at - th / 2, g0, at + th / 2, g1];
    bag.add(MS, box(r[0], y0, r[1], r[2], y0 + 0.06, r[3])); col.floor(r, y0 + 0.06);
  }
  for (const d of doors) for (const s of [-1, 1]) {
    const e = d.c + s * d.w / 2, q = along === 'x' ? [e - (s > 0 ? 0.03 : 0), at - th / 2, e + (s > 0 ? 0 : 0.03), at + th / 2] : [at - th / 2, e - (s > 0 ? 0.03 : 0), at + th / 2, e + (s > 0 ? 0 : 0.03)];
    bag.add(MS, box(q[0], y0 + 0.06, q[1], q[2], y0 + d.h, q[3]));
  }
  for (const d of doors) { const q = along === 'x' ? [d.c - d.w / 2, at - th / 2, d.c + d.w / 2, at + th / 2] : [at - th / 2, d.c - d.w / 2, at + th / 2, d.c + d.w / 2]; bag.add(MS, box(q[0], y0 + d.h - 0.03, q[1], q[2], y0 + d.h, q[3])); }
}

/**
 * A wall of the hall or of a salon on frame F, from u 0 to L at the first floor Y: the white marble facing with
 * its arches (window: open to the floor; mirror: the arcade of glasses) and doors, the skirting, the Rance
 * pilasters with their capitals, the green trumeaux with their trophies, the archivolts and keystones, the
 * entablature and cornice, the gilt groups on the cornice over the pilasters.
 */
function galleryWall(ctx, F, L, Y, bays, pils, { trophies = true, groups = true } = {}) {
  const archs = bays.filter((b) => b.kind === 'window' || b.kind === 'mirror').map((b) => ({ uc: b.uc, r: AR, spring: Y + SPRING, sill: Y + (b.kind === 'mirror' ? 0.2 : 0) }));
  const doors = bays.filter((b) => b.kind === 'door');
  F.slab(WM, 0, 0.05, 0, L, Y, Y + ARCH, archs, doors.map((b) => ({ u0: b.uc - 0.95, u1: b.uc + 0.95, y0: Y, y1: Y + 4.0 })));
  // the skirting of dark marble, broken by the windows and doors
  const cuts = bays.filter((b) => b.kind !== 'mirror').map((b) => (b.kind === 'door' ? [b.uc - 0.95, b.uc + 0.95] : [b.uc - AR, b.uc + AR])).sort((p, q) => p[0] - q[0]);
  let cur = 0;
  for (const [a, b] of cuts) { if (a > cur + 0.01) F.box(DM, cur, a, Y, Y + 0.2, 0.05, 0.09); cur = Math.max(cur, b); }
  if (L > cur + 0.01) F.box(DM, cur, L, Y, Y + 0.2, 0.05, 0.09);
  for (const b of bays) {
    const top = Y + SPRING + AR;
    if (b.kind === 'window' || b.kind === 'mirror') {
      const m = b.kind === 'mirror' ? GB : MS, y0 = Y + (b.kind === 'mirror' ? 0.2 : 0);
      F.ring(m, b.uc, Y + SPRING, AR, AR + 0.16, 0.05, 0.1);
      for (const s of [-1, 1]) F.box(m, b.uc + s * AR, b.uc + s * (AR + 0.16), y0, Y + SPRING, 0.05, 0.1);
      if (b.kind === 'mirror') mirrorArcade(F, b.uc, y0, Y + SPRING);
    }
    if (b.kind === 'door') doorCase(ctx, F, b.uc, Y, b.leaves);
    if (b.kind === 'window' || b.kind === 'mirror') {
      // the keystone, breaking forward through the architrave, and its head: Apollo's and the lion's skin in turn
      F.box(MS, b.uc - 0.2, b.uc + 0.2, top - 0.05, Y + ARCH + 0.35, 0.05, 0.34);
      mask(F, b.uc, top + 0.28, 0.34, b.key ?? 'apollo', 0.9);
    }
  }
  for (const p of pils) {
    if (p < -0.5 || p > L + 0.5) continue;
    F.box(DM, p - 0.52, p + 0.52, Y, Y + 0.3, 0.05, 0.34);
    F.box(MS, p - 0.48, p + 0.48, Y + 0.3, Y + 0.45, 0.05, 0.3);
    F.box(RM, p - 0.42, p + 0.42, Y + 0.45, Y + 7.4, 0.05, 0.21);
    frenchCapital(F, p, Y + 7.4, 0.21, 0.84);
    if (trophies) for (const s of [-1, 1]) {
      const a = p + s * 0.46, b = p + s * 0.9;
      if (Math.min(a, b) < 0.05 || Math.max(a, b) > L - 0.05) continue;
      F.box(GM, Math.min(a, b), Math.max(a, b), Y + 0.6, Y + 6.9, 0.05, 0.066);
      trophy(F, (a + b) / 2, Y + 3.2, 0.066, 0.6);
    }
  }
  // the entablature: architrave with its gilt fillet, the frieze with gilt rosettes over the pilasters, the cornice on modillions
  F.box(MS, 0, L, Y + ARCH, Y + FRIEZE, 0.05, 0.3); F.box(GB, 0, L, Y + ARCH + 0.2, Y + ARCH + 0.25, 0.05, 0.31);
  F.box(WM, 0, L, Y + FRIEZE, Y + CORN, 0.05, 0.26);
  for (const p of pils) if (p > 0.3 && p < L - 0.3) F.disc(GB, [[0.001, 0], [0.13, 0.01], [0.14, 0.04], [0.08, 0.06], [0.001, 0.07]], p, Y + (FRIEZE + CORN) / 2, 0.26, 10);
  F.box(GB, 0, L, Y + CORN, Y + CORN + 0.06, 0.05, 0.33);
  F.box(MS, 0, L, Y + CORN + 0.06, Y + CORN + 0.2, 0.05, 0.45);
  for (let u = 0.3; u < L - 0.1; u += 0.55) F.box(MS, u - 0.06, u + 0.06, Y + CORN + 0.2, Y + TOP - 0.18, 0.4, 0.72);
  F.box(MS, 0, L, Y + TOP - 0.18, Y + TOP, 0.05, 0.78);
  F.box(GB, 0, L, Y + TOP - 0.2, Y + TOP - 0.17, 0.72, 0.79);
  // over each pilaster on the cornice: two gilt children holding Jupiter's thunderbolt
  if (groups) for (const p of pils) if (p > 0.6 && p < L - 0.6) {
    for (const s of [-1, 1]) {
      F.lathe(GD, [[0.001, 0], [0.1, 0.04], [0.12, 0.18], [0.08, 0.3], [0.001, 0.32]], p + s * 0.22, 0.6, Y + TOP, 8);
      F.lathe(GD, [[0.001, 0], [0.06, 0.02], [0.065, 0.08], [0.001, 0.12]], p + s * 0.22, 0.6, Y + TOP + 0.32, 8);
    }
    F.shape(GD, [[p - 0.18, Y + TOP + 0.45], [p + 0.02, Y + TOP + 0.3], [p - 0.02, Y + TOP + 0.24], [p + 0.18, Y + TOP + 0.08], [p - 0.04, Y + TOP + 0.22], [p, Y + TOP + 0.28]], 0.55, 0.6);
  }
}

/** The arcade of mirrors in an arch: six rows of three glasses and three in the head, held by gilt bars and cabochons. */
function mirrorArcade(F, uc, y0, ys) {
  const r = AR, w = 0.05, rows = 6, cols = 3, rh = (ys - y0) / rows, cw = 2 * r / cols;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const u0 = uc - r + i * cw, v0 = y0 + j * rh;
    F.box(MI, u0 + w / 2, u0 + cw - w / 2, v0 + w / 2, v0 + rh - w / 2, 0.004, 0.012);
  }
  for (let i = 0; i <= cols; i++) F.box(GB, uc - r + i * cw - w / 2, uc - r + i * cw + w / 2, y0, ys, 0.002, 0.036);
  for (let j = 0; j <= rows; j++) F.box(GB, uc - r, uc + r, y0 + j * rh - w / 2, y0 + j * rh + w / 2, 0.002, 0.034);
  for (let i = 1; i < cols; i++) for (let j = 1; j <= rows; j++) F.disc(GB, [[0.001, 0], [0.045, 0.01], [0.04, 0.03], [0.001, 0.04]], uc - r + i * cw, y0 + j * rh, 0.034, 8);
  // the head: three glasses in a fan, the radial bars, the arched bar
  for (let k = 0; k < 3; k++) {
    const a0 = k * Math.PI / 3, a1 = (k + 1) * Math.PI / 3, pts = [[uc, ys]];
    for (let q = 0; q <= 6; q++) { const a = a0 + (a1 - a0) * q / 6; pts.push([uc + Math.cos(a) * (r - w / 2), ys + Math.sin(a) * (r - w / 2)]); }
    F.shape(MI, pts, 0.004, 0.012);
  }
  for (const a of [Math.PI / 3, 2 * Math.PI / 3]) F.add(GB, bar([uc, ys, 0.019], [uc + Math.cos(a) * r, ys + Math.sin(a) * r, 0.019], w));
  F.ring(GB, uc, ys, r - w, r, 0.002, 0.036, 0, Math.PI, 12);
}

/** A door case: the marble chambranle with its gilt fillet, the leaves (open against the jambs, or shut), the overdoor painting. */
function doorCase(ctx, F, uc, Y, leaves = 'open', w = 1.9, h = 4.0, over = true) {
  const k = 0.22;
  F.box(MS, uc - w / 2 - k, uc - w / 2, Y, Y + h + k, 0.05, 0.13); F.box(MS, uc + w / 2, uc + w / 2 + k, Y, Y + h + k, 0.05, 0.13); F.box(MS, uc - w / 2, uc + w / 2, Y + h, Y + h + k, 0.05, 0.13);
  F.box(GB, uc - w / 2 - 0.08, uc - w / 2 - 0.05, Y, Y + h + 0.08, 0.13, 0.15); F.box(GB, uc + w / 2 + 0.05, uc + w / 2 + 0.08, Y, Y + h + 0.08, 0.13, 0.15); F.box(GB, uc - w / 2 - 0.08, uc + w / 2 + 0.08, Y + h + 0.05, Y + h + 0.08, 0.13, 0.15);
  if (leaves === 'shut') {
    // two leaves in the opening, carved in panels and gilt
    for (const s of [-1, 1]) {
      const a = uc + (s < 0 ? -w / 2 : 0.005), b = uc + (s < 0 ? -0.005 : w / 2);
      F.box(FR, a, b, Y + 0.06, Y + h, 0.004, 0.045);
      for (const [v0, v1] of [[0.4, 1.6], [1.9, 3.7]]) { F.box(GD, a + 0.12, b - 0.12, Y + v0, Y + v0 + 0.04, 0.045, 0.056); F.box(GD, a + 0.12, b - 0.12, Y + v1 - 0.04, Y + v1, 0.045, 0.056); F.box(GD, a + 0.12, a + 0.16, Y + v0, Y + v1, 0.045, 0.056); F.box(GD, b - 0.16, b - 0.12, Y + v0, Y + v1, 0.045, 0.056); }
    }
    const a = F.P(uc - w / 2, -0.06), b = F.P(uc + w / 2, 0);
    ctx.col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y, Y + h);
  } else if (leaves === 'open') {
    for (const s of [-1, 1]) {
      const e = uc + s * w / 2;
      F.box(FR, s < 0 ? e - 0.06 : e, s < 0 ? e : e + 0.06, Y + 0.06, Y + h - 0.02, 0.13, 0.13 + w / 2 - 0.02);
      for (const [v0, v1] of [[0.4, 1.6], [1.9, 3.7]]) F.box(GD, s < 0 ? e - 0.07 : e + 0.06, s < 0 ? e - 0.06 : e + 0.07, Y + v0, Y + v1, 0.3, 0.13 + w / 2 - 0.15);
      const a = F.P(s < 0 ? e - 0.07 : e, 0.13), b = F.P(s < 0 ? e : e + 0.07, 0.13 + w / 2);
      ctx.col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y, Y + h);
    }
  }
  if (over) wallPainting(ctx.bag, F, uc, Y + h + 0.95, w + 0.1, 1.2, { seed: Math.round(uc * 37 + Y), kind: 'earth', frame: 0, d: 0.05 });
}

/** The walls of a room of the Grand Apartment: skirting, marble dado, hangings in gilt frames, the frieze and gilt cornice; doors. */
function apartmentWalls(ctx, F, L, Y, { doors = [], hang = 'cloth_red', c = 6.2, blank = [] }) {
  const holes = doors.map((d) => ({ u0: d.u - 0.95, u1: d.u + 0.95, y0: Y, y1: Y + 4.0 }));
  F.slab(MS, 0, 0.04, 0, L, Y, Y + 0.95, [], holes);
  F.slab(hang, 0, 0.02, 0, L, Y + 0.95, Y + c - 0.5, [], holes.map((h) => ({ ...h, y0: Y + 0.95 })).concat(blank));
  F.slab(MS, 0, 0.05, 0, L, Y + c - 0.5, Y + c - 0.2);
  // the skirting and the dado's gilt rail, broken by the doors
  const cuts = doors.map((d) => [d.u - 0.95, d.u + 0.95]).sort((p, q) => p[0] - q[0]);
  let cur = 0; const seg = [];
  for (const [a, b] of cuts) { if (a > cur + 0.01) seg.push([cur, a]); cur = b; }
  if (L > cur + 0.01) seg.push([cur, L]);
  for (const [a, b] of seg) {
    F.box(DM, a, b, Y, Y + 0.16, 0.04, 0.07); F.box(GD, a, b, Y + 0.9, Y + 0.97, 0.02, 0.07);
    // the hangings in panels: gilt borders at the ends and every two metres or so
    const n = Math.max(1, Math.round((b - a) / 2.2));
    for (let i = 0; i <= n; i++) { const u = a + (b - a) * i / n; F.box(GD, Math.max(0, u - 0.05), Math.min(L, u + 0.05), Y + 0.97, Y + c - 0.5, 0.02, 0.05); }
  }
  F.box(GD, 0, L, Y + c - 0.55, Y + c - 0.5, 0.02, 0.06);
  F.box(GD, 0, L, Y + c - 0.2, Y + c - 0.1, 0.05, 0.22); F.box(MS, 0, L, Y + c - 0.1, Y + c, 0.05, 0.4); F.box(GD, 0, L, Y + c - 0.03, Y + c, 0.4, 0.42);
  for (const d of doors) doorCase(ctx, F, d.u, Y, d.leaves ?? 'none', 1.9, 4.0, true);
}

/** A chimneypiece of marble on frame F at u, with a glass or a painting over it. */
function chimney(ctx, F, u, Y, { mat = RM, over = 'mirror', seed = 1 } = {}) {
  F.box(mat, u - 1.0, u - 0.75, Y, Y + 1.15, 0.02, 0.36); F.box(mat, u + 0.75, u + 1.0, Y, Y + 1.15, 0.02, 0.36);
  F.box(mat, u - 1.0, u + 1.0, Y + 1.15, Y + 1.38, 0.02, 0.38); F.box(DM, u - 1.1, u + 1.1, Y + 1.38, Y + 1.45, 0.02, 0.46);
  F.box('opening', u - 0.75, u + 0.75, Y, Y + 1.15, 0.02, 0.03);
  F.box(DM, u - 1.2, u + 1.2, Y, Y + 0.02, 0.02, 0.8);
  F.box('iron', u - 0.5, u - 0.45, Y + 0.02, Y + 0.32, 0.25, 0.45); F.box('iron', u + 0.45, u + 0.5, Y + 0.02, Y + 0.32, 0.25, 0.45);   // the andirons
  if (over === 'mirror') { F.box(MI, u - 0.8, u + 0.8, Y + 1.6, Y + 3.4, 0.02, 0.028); for (const [a, b, c2, d] of [[u - 0.9, u + 0.9, Y + 1.5, Y + 1.6], [u - 0.9, u + 0.9, Y + 3.4, Y + 3.5], [u - 0.9, u - 0.8, Y + 1.6, Y + 3.4], [u + 0.8, u + 0.9, Y + 1.6, Y + 3.4]]) F.box(GD, a, b, c2, d, 0.02, 0.07); }
  else if (over === 'painting') wallPainting(ctx.bag, F, u, Y + 2.6, 1.6, 1.9, { seed, kind: 'earth', frame: 0, d: 0.04 });
  const a = F.P(u - 1.2, 0), b = F.P(u + 1.2, 0.46);
  ctx.col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y, Y + 1.45);
}

/** The four frames of a rectangular room [x0, z0, x1, z1]: n, e, s, w with their lengths. */
function roomFrames(bag, r) {
  const [x0, z0, x1, z1] = r;
  return {
    n: { F: frame(bag, [x0, z0], [0, 1]), L: x1 - x0 }, e: { F: frame(bag, [x1, z0], [-1, 0]), L: z1 - z0 },
    s: { F: frame(bag, [x1, z1], [0, -1]), L: x1 - x0 }, w: { F: frame(bag, [x0, z1], [1, 0]), L: z1 - z0 },
  };
}

export function grandCorps(el, ctx) {
  const { bag, col, lights } = ctx;
  const R1 = el.rect, R2 = el.ext, y = el.y ?? 0, h = el.h ?? 22, T = y + h, Y = el.fy;
  const [x0, z0, x1, z1] = R1, nb = Math.round((z1 - z0) / 4.4), bw = (z1 - z0) / nb, zb = (k) => z0 + k * bw, zc = (k) => z0 + (k + 0.5) * bw;
  const HW = 10.5, SD = 12.4, WALL = 0.8, TH = 0.6;
  const HALL = [x0, zb(4), x0 + HW, zb(nb - 4)];
  const GUERRE = [x0, zb(1), x0 + SD, zb(4) - WALL], PAIX = [x0, zb(nb - 4) + WALL, x0 + SD, zb(nb - 1)];
  const AX = zc(2), BAND = [AX - 5, AX + 5];
  const ROOMS = { apollo: [x0 + SD + TH, BAND[0], 22.0, BAND[1]], mercury: [22.6, BAND[0], 30.4, BAND[1]], mars: [31.0, BAND[0], 38.8, BAND[1]], diana: [39.4, BAND[0], 47.2, BAND[1]] };
  const VENUS = [39.4, zb(0) + TH, 47.2, BAND[0] - TH];
  const VS = Y + TOP;                                                           // the vault's springing
  // ── the masonry: solid but for the first floor's rooms; the floors' slabs, the roof
  const voids = [[x0, zb(1), x0 + SD, zb(4)], HALL, [x0, zb(nb - 4), x0 + SD, zb(nb - 1)], [GUERRE[2], BAND[0], R2[2], BAND[1]], [VENUS[0], VENUS[1], R2[2], BAND[0]]];
  for (const R of [R1, R2]) {
    bag.add(S, box(R[0], y - 0.5, R[1], R[2], Y - 0.06, R[3])); col.rect(R, y - 0.5, Y - 0.06);
    for (const p of subtractRects(R, voids.map((v) => [Math.max(v[0], R[0]), Math.max(v[1], R[1]), Math.min(v[2], R[2]), Math.min(v[3], R[3])]).filter((v) => v[2] > v[0] && v[3] > v[1]))) { bag.add(S, box(p[0], Y - 0.06, p[1], p[2], T - 0.5, p[3])); col.rect(p, Y - 0.06, T - 0.5); }
    bag.add(S, box(R[0], T - 0.5, R[1], R[2], T, R[3])); col.rect(R, T - 0.5, T); col.floor(R, T);
  }
  // the garden front, its windows seen from inside where the rooms are; the returns' band courses where the block shows
  gardenFront(ctx, 'w', R1, y, h, { inside: { bays: Array.from({ length: nb - 2 }, (_, i) => i + 1), storeys: 'p' } });
  const bands = (r) => { for (const [a, b] of [[0.34, 0.36], [0.78, 0.86], [0.985, 1.0]]) bag.add(S, box(r[0], y + h * a, r[1], r[2], y + h * b, r[3])); };
  bands([x0, z0 - 0.3, x1, z0]); bands([x0, z1, x1, z1 + 0.3]); bands([x1, 38, x1 + 0.3, z1]); bands([R2[2], -40.0, R2[2] + 0.3, R2[3]]);
  bag.add('lead', box(x0 + 1, T, z0 + 1, x1 - 1, T + 1.2, z1 - 1)); bag.add('lead', box(x1 - 1.5, T, R2[1] + 1, R2[2] - 1, T + 1.2, R2[3] - 1));

  // ── partitions: the hall's ends with their great arches into the salons; the enfilade's walls with their doors
  const yA = Y - 0.06, yB = T - 0.5;
  partition(ctx, { along: 'x', at: zb(4) - WALL / 2, th: WALL, a: x0, b: x0 + SD, y0: yA, y1: yB, arch: { c: x0 + HW / 2, r: 3.0, spring: Y + 5.2 } });
  partition(ctx, { along: 'x', at: zb(nb - 4) + WALL / 2, th: WALL, a: x0, b: x0 + SD, y0: yA, y1: yB, arch: { c: x0 + HW / 2, r: 3.0, spring: Y + 5.2 } });
  const door = (c) => ({ c, w: 1.9, h: 4.06 });
  for (const [xa, xb] of [[GUERRE[2], ROOMS.apollo[0]], [ROOMS.apollo[2], ROOMS.mercury[0]], [ROOMS.mercury[2], ROOMS.mars[0]], [ROOMS.mars[2], ROOMS.diana[0]]]) partition(ctx, { along: 'z', at: (xa + xb) / 2, th: xb - xa, a: BAND[0], b: BAND[1], y0: yA, y1: yB, doors: [door(AX)] });
  partition(ctx, { along: 'z', at: (ROOMS.diana[2] + R2[2]) / 2, th: R2[2] - ROOMS.diana[2], a: BAND[0], b: BAND[1], y0: yA, y1: yB, doors: [door(AX)] });
  partition(ctx, { along: 'z', at: (VENUS[2] + R2[2]) / 2, th: R2[2] - VENUS[2], a: VENUS[1], b: BAND[0], y0: yA, y1: yB, doors: [door((VENUS[1] + VENUS[3]) / 2)] });
  partition(ctx, { along: 'x', at: (VENUS[3] + BAND[0]) / 2, th: TH, a: VENUS[0], b: VENUS[2], y0: yA, y1: yB, doors: [door((VENUS[0] + VENUS[2]) / 2)] });
  // the passage between the hall's mirror wall and Guerre's/Paix's east walls stays solid; the hall's end-wall corners too

  hallOfMirrors(ctx, { HALL, Y, VS, zb, zc, nb });
  salon(ctx, 'guerre', GUERRE, Y, { zc, zb, AX });
  salon(ctx, 'paix', PAIX, Y, { zc, zb, AX: zc(nb - 3) });
  apartment(ctx, ROOMS, VENUS, Y, AX);
}

// ── the Hall of Mirrors ─────────────────────────────────────────────────────────────────────────
function hallOfMirrors(ctx, { HALL, Y, VS, zb, zc }) {
  const { bag, col, lights } = ctx, [hx0, hz0, hx1, hz1] = HALL, L = hz1 - hz0, W = hx1 - hx0, n = 17;
  parquet(bag, col, HALL, Y);
  // the window wall (u runs south → north), the mirror wall (north → south): bays k = 4 … 20 of the front
  const Fw = frame(bag, [hx0, hz1], [1, 0]), Fe = frame(bag, [hx1, hz0], [-1, 0]);
  const keys = (j) => (j % 2 ? 'lion' : 'apollo');
  galleryWall(ctx, Fw, L, Y, Array.from({ length: n }, (_, j) => ({ uc: hz1 - zc(4 + j), kind: 'window', key: keys(j) })), Array.from({ length: n + 1 }, (_, j) => hz1 - zb(4 + j)));
  galleryWall(ctx, Fe, L, Y, Array.from({ length: n }, (_, j) => ({ uc: zc(4 + j) - hz0, kind: 'mirror', key: keys(j) })), Array.from({ length: n + 1 }, (_, j) => zb(4 + j) - hz0));
  // the end walls, with their great arches into the salons
  for (const [z, nz] of [[hz0, 1], [hz1, -1]]) {
    const F = nz > 0 ? frame(bag, [hx0, z], [0, 1]) : frame(bag, [hx1, z], [0, -1]), c = W / 2, sp = Y + 5.2;
    F.slab(WM, 0, 0.05, 0, W, Y, Y + ARCH, [{ uc: c, r: 3.0, spring: sp, sill: Y }]);
    F.ring(GB, c, sp, 3.0, 3.22, 0.05, 0.12, 0, Math.PI, 24); for (const s of [-1, 1]) F.box(GB, c + s * 3.0, c + s * 3.22, Y, sp, 0.05, 0.12);
    F.ring(MS, c, sp, 2.97, 3.0, -0.8, 0.05, 0, Math.PI, 24); for (const s of [-1, 1]) F.box(MS, c + s * 2.97, c + s * 3.0, Y + 0.06, sp, -0.8, 0.05);
    F.box(MS, c - 0.25, c + 0.25, sp + 2.9, Y + ARCH + 0.3, 0.05, 0.34); mask(F, c, sp + 3.35, 0.34, 'apollo', 1.1);
    F.box(DM, 0, c - 3.0, Y, Y + 0.2, 0.05, 0.09); F.box(DM, c + 3.0, W, Y, Y + 0.2, 0.05, 0.09);
    for (const s of [-1, 1]) { const a = c + s * 3.5, b = c + s * 4.6; F.box(GM, Math.min(a, b), Math.max(a, b), Y + 0.6, Y + 6.9, 0.05, 0.066); trophy(F, (a + b) / 2, Y + 3.2, 0.066, 0.8); }
    F.box(MS, 0, W, Y + ARCH, Y + FRIEZE, 0.05, 0.3); F.box(GB, 0, W, Y + ARCH + 0.2, Y + ARCH + 0.25, 0.05, 0.31); F.box(WM, 0, W, Y + FRIEZE, Y + CORN, 0.05, 0.26);
    F.box(GB, 0, W, Y + CORN, Y + CORN + 0.06, 0.05, 0.33); F.box(MS, 0, W, Y + CORN + 0.06, Y + CORN + 0.2, 0.05, 0.45);
    for (let u = 0.3; u < W - 0.1; u += 0.55) F.box(MS, u - 0.06, u + 0.06, Y + CORN + 0.2, Y + TOP - 0.18, 0.4, 0.72);
    F.box(MS, 0, W, Y + TOP - 0.18, Y + TOP, 0.05, 0.78);
    // the lunette under the vault, faced and painted
    F.slab(WM, 0, 0.03, 0, W, VS, VS + 2.7, [], [], { uc: c, r: 6.45, spring: VS + 2.7 - 6.45 });
    wallPainting(bag, F, c, VS + 1.0, 6.6, 1.5, { oval: true, seed: nz > 0 ? 1672 : 1678, kind: 'sky', frame: 0, d: 0.03 });
  }
  // ── the vault: a segmental barrel painted under Le Brun — the crown's paintings in gilt frames (large ones
  // and ovals in turn), framed pictures on the haunches, gilt bands over the pilasters and along the vault
  const R = 6.45, xc = hx0 + W / 2, yc = VS + 2.7 - R, tm = Math.asin(W / 2 / R), SEG = 32;
  const vmap = (s, t, off) => { const th = s / R; return [xc + (R - off) * Math.sin(th), yc + (R - off) * Math.cos(th), t]; };
  { const tris = []; for (let i = 0; i < SEG; i++) { const a = -tm + 2 * tm * i / SEG, b = -tm + 2 * tm * (i + 1) / SEG; const P = (th, z) => [xc + R * Math.sin(th), yc + R * Math.cos(th), z]; tris.push(...P(a, hz0), ...P(b, hz1), ...P(b, hz0), ...P(a, hz0), ...P(a, hz1), ...P(b, hz1)); }
    bag.add('paint_ochre', fromTriangles(tris)); }
  const smax = tm * R, band = (s0, s1, t0, t1) => painting(bag, vmap, { s: (s0 + s1) / 2, t: (t0 + t1) / 2, ws: s1 - s0, wt: t1 - t0, kind: 'gold', frame: 0, off: 0.02, seed: 1 }), gilt = (s0, s1, t0, t1) => {
    const tris = [], ns = Math.ceil((s1 - s0) / 0.4), nt = Math.max(1, Math.ceil((t1 - t0) / 2));
    for (let i = 0; i < ns; i++) for (let j = 0; j < nt; j++) { const a = s0 + (s1 - s0) * i / ns, b = s0 + (s1 - s0) * (i + 1) / ns, c = t0 + (t1 - t0) * j / nt, d = t0 + (t1 - t0) * (j + 1) / nt; tris.push(...vmap(a, c, 0.015), ...vmap(b, d, 0.015), ...vmap(b, c, 0.015), ...vmap(a, c, 0.015), ...vmap(a, d, 0.015), ...vmap(b, d, 0.015)); }
    bag.add(GD, fromTriangles(tris));
  };
  void band;
  for (let k = 5; k <= 20; k++) gilt(-smax, smax, zb(k) - 0.16, zb(k) + 0.16);
  for (const s of [-1.95, 1.95, -smax + 0.25, smax - 0.25]) gilt(s - 0.1, s + 0.1, hz0, hz1);
  for (let j = 0; j < n; j++) {
    const t = zc(4 + j), big = j % 2 === 0;
    painting(bag, vmap, big ? { s: 0, t, ws: 3.4, wt: j === 8 ? 4.0 : 3.6, kind: 'sky', seed: 1661 + j, frame: 0.14 } : { s: 0, t, ws: 2.6, wt: 3.0, oval: true, kind: j % 4 === 1 ? 'earth' : 'sky', seed: 1661 + j, frame: 0.12 });
    for (const sg of [-1, 1]) painting(bag, vmap, big ? { s: sg * 3.95, t, ws: 2.2, wt: 1.7, oval: true, kind: 'gold', seed: 2000 + j * 2 + sg, frame: 0.1 } : { s: sg * 3.95, t, ws: 3.0, wt: 2.8, kind: j % 4 === 1 ? 'sky' : 'earth', seed: 2000 + j * 2 + sg, frame: 0.12 });
  }
  // ── the chandeliers in three rows; the silver furniture along the walls: orange trees in silver tubs before
  // the window piers, silver tables and guéridons in turn before the mirror piers, benches under the arcades
  const vy = (x) => yc + Math.sqrt(R * R - (x - xc) ** 2);
  for (let j = 0; j < n; j++) {
    chandelier(bag, lights, xc, Y + 6.4, zc(4 + j), vy(xc) - 0.02, { arms: 10, R: 0.7 });
    if (j % 2 === 0) for (const x of [hx0 + 2.5, hx1 - 2.5]) chandelier(bag, lights, x, Y + 6.2, zc(4 + j), vy(x) - 0.02, { arms: 8, R: 0.55, s: 0.85 });
  }
  for (let k = 5; k <= 20; k++) {
    orangeTub(bag, col, hx0 + 1.05, Y, zb(k));
    if (k % 2) gueridon(bag, col, lights, hx1 - 0.85, Y, zb(k)); else silverTable(Fe, col, zb(k) - hz0, Y, 1.0, 0.55, 0.36);
  }
  for (let j = 0; j < n; j += 2) silverBench(Fe, col, zc(4 + j) - hz0, Y, 1.7, 0.2);
}

// ── the salons of War and of Peace ───────────────────────────────────────────────────────────────
function salon(ctx, which, r, Y, { zc, zb, AX }) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = r, war = which === 'guerre', VS = Y + TOP;
  parquet(bag, col, r, Y, { panel: 1.05 });
  const fr = roomFrames(bag, r);
  // the window wall: three windows of the garden front; the opposite wall: two arcades of mirrors and a door
  const ks = war ? [1, 2, 3] : [21, 22, 23];
  const W = fr.w, E = fr.e;
  galleryWall(ctx, W.F, W.L, Y, ks.map((k, i) => ({ uc: W.F.at(x0, zc(k)), kind: 'window', key: i % 2 ? 'lion' : 'apollo' })), ks.map((k) => W.F.at(x0, zb(k))).concat([W.F.at(x0, zb(ks[2] + 1))]).filter((u) => u > 0.3 && u < W.L - 0.3), { trophies: false });
  galleryWall(ctx, E.F, E.L, Y, ks.map((k, i) => (i === 1 ? { uc: E.F.at(x1, zc(k)), kind: 'door', leaves: war ? 'none' : 'shut' } : { uc: E.F.at(x1, zc(k)), kind: 'mirror', key: i % 2 ? 'lion' : 'apollo' })), ks.map((k) => E.F.at(x1, zb(k))).concat([E.F.at(x1, zb(ks[2] + 1))]).filter((u) => u > 0.3 && u < E.L - 0.3), { trophies: false });
  // the end wall (north for War, south for Peace): the chimneypiece, and over it the oval relief; the side toward the hall: the arch
  const EW = war ? fr.n : fr.s, TW = war ? fr.s : fr.n, c = EW.L / 2;
  galleryWall(ctx, EW.F, EW.L, Y, [], [0.6, EW.L - 0.6], { trophies: false, groups: false });
  chimney(ctx, EW.F, c, Y, { mat: GM, over: 'none' });
  if (war) {
    // Coysevox's relief: the King on horseback riding over his enemies, crowned by Glory, in an oval of gilt; two Fames
    // above blowing trumpets, two captives chained below (stucco, gilt)
    const F = EW.F, oy = Y + 4.6;
    F.add(GD, ringGeo(0, 0, 1, 1.12, 0, 0.12, 0, Math.PI * 2, 32).scale(1.55, 2.0, 1).translate(c, oy, 0.05));
    F.add(DM, ringGeo(0, 0, 0.001, 1, 0, 0.02, 0, Math.PI * 2, 32).scale(1.55, 2.0, 1).translate(c, oy, 0.05));
    const st = 'stucco';
    { const g = lathe([[0.001, -0.75], [0.3, -0.55], [0.36, 0], [0.3, 0.5], [0.001, 0.7]], 10); g.scale(1, 1, 0.5); g.rotateZ(Math.PI / 2 + 0.25); g.translate(c, oy - 0.3, 0.2); F.add(st, g); }        // the horse rearing
    F.add(st, bar([c + 0.55, oy - 0.1, 0.2], [c + 0.85, oy + 0.45, 0.2], 0.16)); F.disc(st, [[0.001, 0], [0.13, 0.04], [0.12, 0.14], [0.001, 0.18]], c + 0.9, oy + 0.55, 0.12, 8);   // neck and head
    for (const [a, b] of [[[c - 0.4, oy - 0.55], [c - 0.55, oy - 1.3]], [[c - 0.2, oy - 0.55], [c - 0.1, oy - 1.25]], [[c + 0.35, oy - 0.45], [c + 0.75, oy - 0.95]], [[c + 0.5, oy - 0.45], [c + 0.85, oy - 0.7]]]) F.add(st, bar([a[0], a[1], 0.2], [b[0], b[1], 0.2], 0.08));
    F.lathe(st, [[0.001, 0], [0.15, 0.05], [0.17, 0.35], [0.12, 0.6], [0.001, 0.65]], c, 0.25, oy - 0.05, 10);   // the King
    F.lathe(st, [[0.001, 0], [0.08, 0.03], [0.09, 0.12], [0.001, 0.2]], c, 0.25, oy + 0.6, 8);
    F.add(st, bar([c, oy + 0.45, 0.3], [c + 0.45, oy + 0.75, 0.3], 0.05));                                                                  // the baton raised
    for (const s of [-1, 1]) { const g = lathe([[0.001, -0.4], [0.16, -0.3], [0.2, 0], [0.14, 0.3], [0.001, 0.4]], 8); g.rotateZ(s * 1.2); g.scale(1, 1, 0.5); g.translate(c + s * 0.9, oy - 1.45, 0.2); F.add(st, g); }   // enemies under the hooves
    for (const s of [-1, 1]) {
      // the Fames above the oval with their trumpets, the captives below it
      { const g = lathe([[0.001, -0.5], [0.18, -0.35], [0.2, 0.1], [0.12, 0.45], [0.001, 0.55]], 8); g.rotateZ(s * 1.0); g.translate(c + s * 0.95, oy + 2.35, 0.18); F.add(GD, g); }
      F.add(GD, bar([c + s * 0.6, oy + 2.55, 0.25], [c + s * 0.05, oy + 2.95, 0.25], 0.05));
      F.lathe(GD, [[0.06, 0], [0.12, 0.6], [0.16, 0.7], [0.001, 0.72]], c + s * 1.85, 0.2, Y + 1.5, 8);
      F.lathe(GD, [[0.001, 0], [0.08, 0.03], [0.09, 0.12], [0.001, 0.18]], c + s * 1.85, 0.2, Y + 2.25, 8);
      F.add('iron', bar([c + s * 1.75, Y + 1.95, 0.32], [c + s * 1.4, oy - 1.7, 0.2], 0.03));
    }
    // Clio writing the King's history, the relief of the false chimney's opening
    F.disc(GB, [[0.001, 0], [0.35, 0.01], [0.33, 0.04], [0.001, 0.05]], c, Y + 0.6, 0.03, 12);
  } else {
    // over the chimneypiece: a glass in its gilt frame
    EW.F.box(MI, c - 1.1, c + 1.1, Y + 1.7, Y + 6.2, 0.05, 0.058); for (const [a, b, c2, d] of [[c - 1.22, c + 1.22, Y + 1.58, Y + 1.7], [c - 1.22, c + 1.22, Y + 6.2, Y + 6.5], [c - 1.22, c - 1.1, Y + 1.7, Y + 6.2], [c + 1.1, c + 1.22, Y + 1.7, Y + 6.2]]) EW.F.box(GB, a, b, c2, d, 0.05, 0.12);
  }
  // the six gilt trophies of arms on their marble panels: two on the end wall, two on each long wall's piers
  for (const s of [-1, 1]) for (const k of [2.4, 4.4]) { EW.F.box(GM, c + s * k - 0.55, c + s * k + 0.55, Y + 2.0, Y + 6.5, 0.05, 0.066); trophy(EW.F, c + s * k, Y + 3.3, 0.066, 1.2); }
  // the wall toward the hall: faced round its arch
  { const F = TW.F, cc = TW.F.at(x0 + 5.25, war ? z1 : z0); F.slab(WM, 0, 0.05, 0, TW.L, Y, Y + TOP, [{ uc: cc, r: 3.0, spring: Y + 5.2, sill: Y }]); F.ring(GB, cc, Y + 5.2, 3.0, 3.2, 0.05, 0.12, 0, Math.PI, 24); for (const s of [-1, 1]) F.box(GB, cc + s * 3.0, cc + s * 3.2, Y, Y + 5.2, 0.05, 0.12);
    F.box(MS, 0, TW.L, Y + ARCH, Y + TOP, 0.05, 0.3);
    for (const s of [-1, 1]) { const u = cc + s * 4.05; F.box(GM, u - 0.55, u + 0.55, Y + 1.2, Y + 6.9, 0.05, 0.066); trophy(F, u, Y + 3.0, 0.066, 1.1); } }
  // the coved ceiling: France armed on a cloud (War) or France bringing peace, in the middle; the four coves painted
  const cv = cove(bag, 'paint_ochre', r, VS, 2.7, 2.6);
  painting(bag, cv.flat, { s: 0, t: 0, ws: 6.2, wt: 6.2, oval: true, kind: 'sky', seed: war ? 1678 : 1679, frame: 0.18, off: 0.02 });
  for (const f of 'nesw') painting(bag, cv.side(f), { s: 0, t: 1.35, ws: 5.0, wt: 1.6, kind: war ? 'earth' : 'sky', seed: (war ? 30 : 40) + f.charCodeAt(0), frame: 0.12, off: 0.02 });
  chandelier(bag, lights, (x0 + x1) / 2, Y + 6.6, (z0 + z1) / 2, VS + 2.68, { arms: 12, R: 0.8, s: 1.1 });
  // silver guéridons in the corners
  for (const [gx, gz] of [[x0 + 0.9, z0 + 0.9], [x1 - 0.9, z0 + 0.9], [x0 + 0.9, z1 - 0.9], [x1 - 0.9, z1 - 0.9]]) if (Math.abs(gz - (war ? z1 : z0)) > 2) gueridon(bag, col, lights, gx, Y, gz);
  void AX;
}

// ── the King's Grand Apartment and the Ambassadors' Staircase ───────────────────────────────────
function apartment(ctx, ROOMS, VENUS, Y, AX) {
  const { bag, col, lights } = ctx;
  const C = 6.2, CV = 1.8;                                    // cornice, cove
  const room = (key, r, opts) => {
    const fr = roomFrames(bag, r);
    if (opts.floor === 'marble') marbleFloor(bag, col, r, Y); else parquet(bag, col, r, Y, { panel: 1.0, border: 0.3 });
    for (const f of 'nesw') {
      const { F, L } = fr[f];
      // the frame coordinate along the wall: for n/s walls the door's x, for e/w its z
      const ds = (opts.doors[f] || []).map((d) => ({ u: f === 'n' ? d.at - r[0] : f === 's' ? r[2] - d.at : f === 'e' ? d.at - r[1] : r[3] - d.at, leaves: d.leaves }));
      apartmentWalls(ctx, F, L, Y, { doors: ds, hang: opts.hang, c: C });
    }
    const cv = cove(bag, 'paint_ochre', r, Y + C, CV, 1.5);
    const [x0, z0, x1, z1] = r, wx = x1 - x0 - 3.0, wz = z1 - z0 - 3.0;
    painting(bag, cv.flat, { s: 0, t: 0, ws: Math.min(wx, wz) * 0.95 + (wx > wz ? 0.8 : 0), wt: Math.min(wx, wz) * 0.95 + (wz > wx ? 0.8 : 0), oval: true, kind: 'sky', seed: opts.seed, frame: 0.14, off: 0.02 });
    for (const f of 'nesw') { const along = f === 'n' || f === 's' ? x1 - x0 : z1 - z0; painting(bag, cv.side(f), { s: 0, t: 0.95, ws: Math.max(1.2, along - 4.2), wt: 1.0, kind: 'gold', seed: opts.seed + f.charCodeAt(0), frame: 0.08, off: 0.02 }); }
    return fr;
  };
  const enf = (leaves) => [{ at: AX, leaves }];
  // Apollo: the throne room — the silver throne on its dais under the canopy against the south wall, six silver candlestands
  { const r = ROOMS.apollo, fr = room('apollo', r, { doors: { w: enf('open'), e: enf('none') }, hang: 'cloth_red', seed: 1680 }), F = fr.s.F, u = fr.s.L / 2;
    for (let k = 0; k < 3; k++) { F.box(k === 2 ? 'cloth_red' : MS, u - 1.9 + k * 0.2, u + 1.9 - k * 0.2, Y + k * 0.17, Y + (k + 1) * 0.17, 0.04, 2.6 - k * 0.3); }
    F.box('cloth_indigo', u - 1.55, u + 1.55, Y + 0.51, Y + 0.515, 0.25, 2.05); F.box('cloth_red', u - 1.35, u + 1.35, Y + 0.515, Y + 0.52, 0.4, 1.9);
    { const a = F.P(u - 1.9, 0.04), b = F.P(u + 1.9, 2.6); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y, Y + 0.34); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y + 0.51); }
    throne(F, u, Y + 0.52, 0.9);
    // the canopy: its tester on the wall, the dorsal cloth behind the throne, the gilt fringes
    F.box('cloth_red', u - 1.6, u + 1.6, Y + 0.52, Y + 5.2, 0.02, 0.05); F.box(GD, u - 1.6, u + 1.6, Y + 5.0, Y + 5.2, 0.05, 0.07);
    F.box('cloth_red', u - 1.8, u + 1.8, Y + 5.2, Y + 5.75, 0.04, 2.2); F.box(GD, u - 1.82, u + 1.82, Y + 5.12, Y + 5.22, 2.18, 2.24); for (const s of [-1, 1]) F.box(GD, u + s * 1.8 - 0.03, u + s * 1.8 + 0.03, Y + 5.12, Y + 5.22, 0.04, 2.2);
    for (const s of [-1, 1]) F.lathe(GD, [[0.12, 0], [0.08, 0.15], [0.12, 0.3], [0.001, 0.45]], u + s * 1.7, 2.1, Y + 5.75, 10);
    for (const s of [-1, 1]) for (const k of [0, 1, 2]) { const p = F.P(u + s * (2.3 + k * 0.8), 0.6 + k * 0.4); gueridon(bag, col, lights, p[0], Y, p[1], true); }
    chimney(ctx, fr.n.F, fr.n.L / 2, Y, { mat: RM, over: 'painting', seed: 74 });
    chandelier(bag, lights, (r[0] + r[2]) / 2, Y + 4.1, AX, Y + C + CV - 0.02, { arms: 10, R: 0.65, lit: true }); }
  // Mercury: the state bedchamber — the bed in its alcove behind the silver balustrade, brocade hangings, silver tables
  { const r = ROOMS.mercury, fr = room('mercury', r, { doors: { w: enf('none'), e: enf('none') }, hang: 'cloth_ochre', seed: 1681 }), F = fr.n.F, u = fr.n.L / 2;
    stateBed(F, col, u, Y);
    // the balustrade of silver across the alcove, with its gate
    const dB = 2.9;
    for (let uu = u - 3.2; uu <= u + 3.2 + 1e-6; uu += 0.16) if (Math.abs(uu - u) > 0.5) F.lathe(AG, [[0.045, 0], [0.03, 0.12], [0.06, 0.42], [0.028, 0.75], [0.04, 0.8]], uu, dB, Y, 8);
    F.box(AG, u - 3.3, u + 3.3, Y + 0.8, Y + 0.9, dB - 0.07, dB + 0.07); F.box(AG, u - 3.3, u + 3.3, Y, Y + 0.06, dB - 0.08, dB + 0.08);
    for (const s of [-1, 1]) { F.box(AG, u + s * 3.3 - 0.06, u + s * 3.3 + 0.06, Y, Y + 0.95, 0.04, dB + 0.08); F.box(AG, u + s * 0.5 - 0.06, u + s * 0.5 + 0.06, Y, Y + 1.1, dB - 0.08, dB + 0.08); F.lathe(AG, [[0.06, 0], [0.08, 0.06], [0.001, 0.2]], u + s * 0.5, dB, Y + 1.1, 8); }
    { const a = F.P(u - 3.3, dB - 0.08), b = F.P(u - 0.5, dB + 0.08), c = F.P(u + 0.5, dB - 0.08), d = F.P(u + 3.3, dB + 0.08); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y, Y + 0.9); col.rect([Math.min(c[0], d[0]), Math.min(c[1], d[1]), Math.max(c[0], d[0]), Math.max(c[1], d[1])], Y, Y + 0.9); }
    silverTable(fr.s.F, col, fr.s.L / 2, Y, 1.6, 0.7);
    chandelier(bag, lights, (r[0] + r[2]) / 2, Y + 4.1, r[3] - 2.6, Y + C + CV - 0.02, { arms: 8, R: 0.6, lit: true, mat: AG }); }
  // Mars: the guard room, then the ballroom — the chimneypiece on the north wall between two tribunes for the musicians; helmets on the cornice
  { const r = ROOMS.mars, fr = room('mars', r, { doors: { w: enf('none'), e: enf('none') }, hang: 'cloth_red', seed: 1682 }), F = fr.n.F, u = fr.n.L / 2;
    chimney(ctx, F, u, Y, { mat: DM, over: 'painting', seed: 99 });
    for (const s of [-1, 1]) {
      const a = u + s * 1.6, b = u + s * 3.7, ty = Y + 2.6, lo = Math.min(a, b), hi = Math.max(a, b);
      F.box(MS, lo, hi, ty - 0.25, ty, 0.04, 1.3); F.box(GD, lo, hi, ty - 0.3, ty - 0.25, 0.04, 1.32);
      for (const cu of [lo + 0.2, hi - 0.2]) F.box(MS, cu - 0.12, cu + 0.12, ty - 1.0, ty - 0.25, 0.04, 0.5);
      for (let uu = lo + 0.15; uu <= hi - 0.1; uu += 0.2) F.lathe(GD, [[0.035, 0], [0.025, 0.1], [0.05, 0.4], [0.022, 0.75], [0.035, 0.8]], uu, 1.22, ty, 6);
      F.box(GD, lo, hi, ty + 0.8, ty + 0.88, 1.16, 1.28);
      for (const ss of [lo + 0.5, hi - 0.5]) { F.lathe('wood_dark', [[0.001, 0], [0.12, 0.05], [0.14, 0.4], [0.06, 0.55], [0.001, 0.6]], ss, 0.6, ty, 8); }   // music stands' players' viols
    }
    for (const f of 'nesw') { const { F: G, L } = fr[f]; for (let uu = 0.8; uu < L - 0.5; uu += 1.6) G.lathe(GD, [[0.001, 0], [0.12, 0.03], [0.13, 0.16], [0.09, 0.26], [0.02, 0.32], [0.001, 0.36]], uu, 0.25, Y + C, 8); }
    chandelier(bag, lights, (r[0] + r[2]) / 2, Y + 4.1, AX, Y + C + CV - 0.02, { arms: 10, R: 0.65, lit: true }); }
  // Diana: the billiard room — the table, the tiers of benches for those who watched; paintings over the chimney and opposite
  { const r = ROOMS.diana, fr = room('diana', r, { doors: { w: enf('none'), e: enf('none'), n: [{ at: (VENUS[0] + VENUS[2]) / 2, leaves: 'none' }] }, hang: 'cloth_green', floor: 'marble', seed: 1683 }), cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2 + 0.8;
    bag.add('cloth_green', box(cx - 1.8, Y + 0.78, cz - 0.95, cx + 1.8, Y + 0.84, cz + 0.95)); bag.add('wood_dark', box(cx - 1.95, Y + 0.7, cz - 1.1, cx + 1.95, Y + 0.9, cz + 1.1));
    bag.add('cloth_green', box(cx - 1.78, Y + 0.84, cz - 0.93, cx + 1.78, Y + 0.845, cz + 0.93));
    for (const sx of [-1.75, 0, 1.75]) for (const sz of [-0.95, 0.95]) bag.add('wood_dark', lathe([[0.07, 0], [0.05, 0.2], [0.08, 0.45], [0.05, 0.7]], 8, null, cx + sx, Y, cz + sz));
    col.rect([cx - 1.95, cz - 1.1, cx + 1.95, cz + 1.1], Y, Y + 0.9);
    for (const [bx, bz] of [[-1.2, 0.3], [0.9, -0.4]]) bag.add(MS, lathe([[0.001, 0], [0.022, 0.02], [0.022, 0.03], [0.001, 0.045]], 6, null, cx + bx, Y + 0.845, cz + bz));
    bag.add('wood_dark', box(cx + 0.3, Y + 0.845, cz + 0.2, cx + 1.4, Y + 0.87, cz + 0.24));
    const F = fr.s.F;
    for (let k = 0; k < 2; k++) { F.box('cloth_red', 0.6, fr.s.L - 0.6, Y + k * 0.42, Y + (k + 1) * 0.42, 0.04, 1.0 - k * 0.45); F.box(GD, 0.6, fr.s.L - 0.6, Y + (k + 1) * 0.42 - 0.03, Y + (k + 1) * 0.42, 1.0 - k * 0.45, 1.02 - k * 0.45); }
    { const a = F.P(0.6, 0.04), b = F.P(fr.s.L - 0.6, 1.0); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y, Y + 0.42); }
    wallPainting(bag, fr.s.F, fr.s.L / 2, Y + 3.2, 3.0, 2.0, { seed: 7, kind: 'sky', frame: 0, d: 0.03 });
    chandelier(bag, lights, cx, Y + 4.1, cz, Y + C + CV - 0.02, { arms: 10, R: 0.65, lit: true }); }
  // Venus: Warin's marble King in his niche between columns; the buffet of silver vessels
  { const r = VENUS, fr = room('venus', r, { doors: { e: [{ at: (r[1] + r[3]) / 2, leaves: 'none' }], s: [{ at: (r[0] + r[2]) / 2, leaves: 'none' }] }, hang: 'cloth_indigo', floor: 'marble', seed: 1684 }), F = fr.w.F, u = fr.w.L / 2;
    F.box(DM, u - 1.0, u + 1.0, Y, Y + 0.9, 0.04, 0.9);
    F.lathe(MS, [[0.38, 0], [0.34, 0.25], [0.24, 0.9], [0.27, 1.3], [0.18, 1.45], [0.001, 1.46]], u, 0.47, Y + 0.9, 12);
    F.lathe(MS, [[0.001, 0], [0.11, 0.04], [0.12, 0.18], [0.07, 0.27], [0.001, 0.29]], u, 0.47, Y + 2.4, 10);
    F.add(MS, bar([u + 0.25, Y + 2.2, 0.47], [u + 0.5, Y + 2.65, 0.47], 0.09));
    for (const s of [-1, 1]) { F.lathe(RM, [[0.2, 0], [0.18, 4.5]], u + s * 1.35, 0.3, Y + 0.2, 12); F.box(MS, u + s * 1.35 - 0.26, u + s * 1.35 + 0.26, Y, Y + 0.2, 0.04, 0.56); F.box(GB, u + s * 1.35 - 0.26, u + s * 1.35 + 0.26, Y + 4.7, Y + 5.0, 0.04, 0.56); }
    { const a = F.P(u - 1.6, 0.04), b = F.P(u + 1.6, 0.9); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], Y, Y + 2.6); }
    silverTable(fr.n.F, col, fr.n.L / 2, Y, 2.2, 0.7);
    chandelier(bag, lights, (r[0] + r[2]) / 2, Y + 4.1, (r[1] + r[3]) / 2, Y + C + CV - 0.02, { arms: 8, R: 0.55, lit: true }); }
}

/** Louis XIV's silver throne (2.6 m high): legs, seat, arms, the tall back with a sun at its crest, on frame F at u facing out. */
function throne(F, u, y, d) {
  for (const su of [-1, 1]) for (const sd of [0, 1]) F.lathe(AG, [[0.06, 0], [0.08, 0.06], [0.04, 0.25], [0.06, 0.45], [0.05, 0.5]], u + su * 0.42, d + (sd ? 0.75 : 0.1), y, 8);
  F.box(AG, u - 0.5, u + 0.5, y + 0.5, y + 0.62, d + 0.02, d + 0.85); F.box('cloth_red', u - 0.44, u + 0.44, y + 0.62, y + 0.7, d + 0.08, d + 0.8);
  F.box(AG, u - 0.5, u + 0.5, y + 0.62, y + 2.3, d - 0.04, d + 0.06); F.box('cloth_red', u - 0.4, u + 0.4, y + 0.8, y + 2.1, d + 0.06, d + 0.08);
  F.ring(AG, u, y + 2.3, 0.001, 0.5, d - 0.04, d + 0.06, 0, Math.PI, 10);
  F.disc(GD, [[0.001, 0], [0.16, 0.02], [0.17, 0.06], [0.001, 0.08]], u, y + 2.48, d + 0.06, 12);
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; F.add(GD, bar([u + Math.cos(a) * 0.16, y + 2.48 + Math.sin(a) * 0.16, d + 0.1], [u + Math.cos(a) * 0.3, y + 2.48 + Math.sin(a) * 0.3, d + 0.1], 0.03)); }
  for (const su of [-1, 1]) { F.box(AG, u + su * 0.5 - 0.05, u + su * 0.5 + 0.05, y + 0.62, y + 1.0, d + 0.06, d + 0.8); F.disc(AG, [[0.001, 0], [0.07, 0.03], [0.001, 0.08]], u + su * 0.5, y + 1.0, d + 0.8, 8); F.lathe(AG, [[0.06, 0], [0.04, 0.12], [0.001, 0.25]], u + su * 0.48, d, y + 2.3, 8); }
}

/** The state bed in its alcove: the posts, the tester with its plumes, the curtains, the counterpane. */
function stateBed(F, col, u, y) {
  F.box('cloth_ochre', u - 1.0, u + 1.0, y + 0.3, y + 0.75, 0.1, 2.2); F.box(GD, u - 1.02, u + 1.02, y + 0.25, y + 0.32, 0.08, 2.22);
  F.box('cloth_white', u - 0.9, u + 0.9, y + 0.75, y + 0.95, 0.15, 0.6);
  F.box('cloth_ochre', u - 1.0, u + 1.0, y + 0.3, y + 3.9, 0.04, 0.1);
  for (const su of [-1, 1]) for (const sd of [0.1, 2.15]) F.lathe(GD, [[0.06, 0], [0.05, 3.8]], u + su * 0.98, sd, y, 8);
  F.box('cloth_ochre', u - 1.1, u + 1.1, y + 3.8, y + 4.3, 0.04, 2.3); F.box(GD, u - 1.12, u + 1.12, y + 3.75, y + 3.82, 0.02, 2.32);
  for (const su of [-1, 1]) for (const sd of [0.1, 2.2]) F.lathe('cloth_white', [[0.001, 0], [0.12, 0.1], [0.08, 0.35], [0.001, 0.4]], u + su * 1.0, sd, y + 4.3, 8);
  for (const su of [-1, 1]) F.box('cloth_ochre', u + su * 1.05 - 0.06, u + su * 1.05 + 0.06, y + 0.3, y + 3.8, 0.2, 2.2);
  const a = F.P(u - 1.1, 0.04), b = F.P(u + 1.1, 2.3);
  col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 1.0);
}

void rng;
