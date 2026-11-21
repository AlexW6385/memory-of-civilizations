// The carved work of Ajanta's caves (docs/settlements/ajanta.md §14): the pillars of the vihara and the chaitya hall
// in their four shaft forms (octagonal, fluted, spiral-fluted, octagon-into-sixteen) with a pot base, bands of beading and
// the bulbous fluted capital under its cushion; standing figures (the Buddha, an attendant bodhisattva with a chauri,
// a corpulent yaksha) in the round; the great teaching Buddha of Cave 1's shrine on his throne with its makara-topped
// back; the makara toranas and the frieze of Buddhas under the chaitya hall's vault. Coordinates are world; figures face +x
// unless a yaw is given (yaw −π/2 faces +z, +π/2 faces −z, π faces −x).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { PAL } from './paint.js';

const STONE = 'sandstone_carved', WHITE = 'lime_plaster', PLASTER = 'plaster_ochre';
const T = Math.PI * 2;

/** A lathe stretched sx along x and sz along z, then moved by (dx, dy, dz). */
export const lat = (prof, seg, mod, sx = 1, sz = 1, dx = 0, dy = 0, dz = 0) => lathe(prof, seg, mod).scale(sx, 1, sz).translate(dx, dy, dz);
/** A flat disc standing in the y–z plane at x, seen from both sides (a halo). */
export function diskX(r, x, y, z, n = 20) {
  const t = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * T, b = (i + 1) / n * T, p = [x, y + Math.sin(a) * r, z + Math.cos(a) * r], q = [x, y + Math.sin(b) * r, z + Math.cos(b) * r];
    t.push(x, y, z, ...p, ...q, x, y, z, ...q, ...p);
  }
  return fromTriangles(t);
}

// ── pillars ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** A pillar standing on y, h high, r the shaft's radius, base the plinth's half width; kind 0 octagon, 1 sixteen flutes,
 *  2 spiral flutes, 3 octagon changing to sixteen sides (the four kinds of Cave 1's hall and porch). */
export function pillar(ctx, x, y, z, h, o = {}) {
  const { bag, col } = ctx, r = o.r ?? 0.34, base = o.base ?? 0.5, kind = o.kind ?? 0, s = r / 0.34, cap = o.cap ?? WHITE;
  const add = (m, g) => bag.add(m, g.translate(x, y, z));
  // the plinth, in two steps, then the pot (ghata) with its lip of foliage
  add(STONE, box(-base, 0, -base, base, 0.5 * s, base));
  add(STONE, box(-base * 0.84, 0.5 * s, -base * 0.84, base * 0.84, 0.62 * s, base * 0.84));
  add(PLASTER, lat([[0.001, 0], [r * 1.0, 0.02 * s], [r * 1.38, 0.14 * s], [r * 1.5, 0.26 * s], [r * 1.28, 0.36 * s], [r * 0.9, 0.42 * s], [r * 1.12, 0.46 * s], [r * 0.8, 0.5 * s]], 16, null, 1, 1, 0, 0.62 * s));
  const y0 = 1.12 * s, capH = 0.8 * s, y1 = h - capH, L = y1 - y0;
  const taper = (t) => r * (1 - 0.1 * t);
  if (kind === 0) add(PLASTER, lat([[taper(0), 0], [taper(1), L]], 8, null, 1, 1, 0, y0));
  else if (kind === 1) add(PLASTER, lat([[taper(0), 0], [taper(0.5), L * 0.5], [taper(1), L]], 48, (th) => 1 - 0.045 * Math.abs(Math.cos(8 * th)), 1, 1, 0, y0));
  else if (kind === 2) {
    const prof = Array.from({ length: 19 }, (_, i) => [taper(i / 18), L * i / 18]);
    add(PLASTER, lat(prof, 40, (th, i, rr, yy) => 1 + 0.05 * Math.cos(10 * th + yy * 4.2), 1, 1, 0, y0));
  } else {
    add(PLASTER, lat([[taper(0), 0], [taper(0.55), L * 0.55]], 8, null, 1, 1, 0, y0));
    add(PLASTER, lat([[taper(0.55) * 0.96, 0], [taper(1), L * 0.45]], 16, null, 1, 1, 0, y0 + L * 0.55));
    add(STONE, lat([[taper(0.55) * 1.05, 0], [taper(0.55) * 1.0, 0.05 * s], [taper(0.55) * 0.9, 0.09 * s]], 16, null, 1, 1, 0, y0 + L * 0.55 - 0.02));
  }
  // bands of beading round the shaft, painted red ground between (the "tracery" bands of the vihara's pillars)
  for (const t of kind === 3 ? [0.22, 0.8] : [0.2, 0.55, 0.88]) {
    const yb = y0 + L * t, rb = taper(t) * 1.04;
    add(PAL.ground, lat([[rb, 0], [rb, 0.14 * s]], 16, null, 1, 1, 0, yb));
    for (const d of [0, 0.15 * s]) add(STONE, lat([[rb * 1.0, 0], [rb * 1.07, 0.015 * s], [rb * 1.07, 0.04 * s], [rb * 1.0, 0.055 * s]], 16, null, 1, 1, 0, yb + d - 0.02 * s));
  }
  // the capital: a bulbous fluted bell, the cushion, the abacus slab
  const yc = y1;
  add(cap, lat([[r * 0.88, 0], [r * 1.25, 0.1 * s], [r * 1.72, 0.22 * s], [r * 1.85, 0.32 * s], [r * 1.6, 0.42 * s], [r * 1.3, 0.46 * s]], 32, (th) => 1 + 0.05 * Math.cos(16 * th), 1, 1, 0, yc));
  add(STONE, lat([[r * 1.35, 0], [r * 1.95, 0.05 * s], [r * 2.05, 0.13 * s], [r * 1.55, 0.19 * s]], 24, null, 1, 1, 0, yc + 0.46 * s));
  add(STONE, box(-r * 2.05, h - 0.15 * s, -r * 2.05, r * 2.05, h, r * 2.05));
  col.circle(x, z, base * 0.95, y, y + h);
}

// ── standing figures ────────────────────────────────────────────────────────────────────────────────────────────────
/** A figure in the round, h high, facing +x turned by yaw. kind 'buddha' (robe over both shoulders, right hand raised in
 *  reassurance), 'bodhi' (an attendant: dhoti, jewels, tall crown, a chauri in the raised hand), 'yaksha' (corpulent, turbaned,
 *  hands on the belly). o: robe, skin, lo (few polygons, no face), sway (the body's swing, ±1), col (a collider, default on). */
export function figure(ctx, x, y, z, h, o = {}) {
  const { bag, col } = ctx, kind = o.kind ?? 'buddha', yaw = o.yaw ?? 0, k = h / (kind === 'bodhi' ? 2.38 : kind === 'yaksha' ? 2.3 : 2.2), lo = !!o.lo;
  const robe = o.robe ?? PAL.ochre, skin = o.skin ?? (kind === 'yaksha' ? PAL.skin2 : PAL.skin), sw = (o.sway ?? (kind === 'bodhi' ? 1 : 0)) * 0.05 * k;
  const put = (m, g) => bag.add(m, g.rotateY(yaw).translate(x, y, z));
  const seg = lo ? 8 : 14, bell = kind === 'yaksha' ? 0.1 * k : 0;
  const cl = (g, dz = 0, dy = 0, dx = 0) => g.translate(dx, dy, dz);
  // the lower garment: a robe falling in folds (buddha) or a dhoti with a girdle
  if (kind === 'buddha') put(robe, lat([[0.001, 0], [0.33 * k, 0.01 * k], [0.3 * k, 0.5 * k], [0.25 * k, 1.0 * k], [0.24 * k, 1.3 * k], [0.28 * k, 1.55 * k], [0.26 * k, 1.7 * k], [0.1 * k, 1.78 * k]], seg + 4, (th, i, r, yy) => (yy < 1.0 * k ? 1 + 0.035 * Math.cos(9 * th) : 1), 0.78, 1.0));
  else {
    put(o.dhoti ?? (kind === 'yaksha' ? PAL.ochre : PAL.blue), lat([[0.001, 0], [0.27 * k, 0.01 * k], [0.25 * k, 0.5 * k], [0.22 * k, 1.0 * k], [0.2 * k + bell, 1.1 * k]], seg + 4, (th, i, r, yy) => (yy < 1.0 * k ? 1 + 0.04 * Math.cos(8 * th) : 1), 0.8, 1.0, 0, 0, sw));
    put(PAL.ochre, lat([[0.21 * k + bell, 0], [0.22 * k + bell, 0.07 * k]], seg, null, 0.8, 1.0, 0, 1.03 * k, sw));
    put(skin, lat([[0.2 * k + bell, 0], [0.17 * k + bell * 0.6, 0.15 * k], [0.21 * k, 0.5 * k], [0.24 * k, 0.66 * k], [0.1 * k, 0.72 * k]], seg, null, 0.76, 1.0, 0, 1.07 * k, sw * 0.3));
    for (const sg of [-1, 1]) put(skin, box(0.05 * k, 0, sg * 0.12 * k - 0.05 * k, 0.28 * k, 0.05 * k, sg * 0.12 * k + 0.05 * k));       // the feet below the hem
  }
  // the arms
  const R = kind === 'buddha' ? robe : skin, ar = 0.05 * k;
  const limb = (m, a, b, r2 = ar) => put(m, rod(a, b, r2, lo ? 4 : 6));
  const hand = (p) => put(skin, box(p[0] - 0.04 * k, p[1] - 0.05 * k, p[2] - 0.05 * k, p[0] + 0.06 * k, p[1] + 0.06 * k, p[2] + 0.05 * k));
  const sh = [0, 1.66 * k, 0.25 * k];
  if (kind === 'buddha') {
    limb(R, [0, 1.66 * k, 0.24 * k], [0.06 * k, 1.35 * k, 0.3 * k], ar * 1.2); limb(skin, [0.06 * k, 1.35 * k, 0.3 * k], [0.2 * k, 1.66 * k, 0.32 * k], ar * 0.9); hand([0.23 * k, 1.72 * k, 0.32 * k]);   // the right hand raised, palm out
    limb(R, [0, 1.66 * k, -0.24 * k], [0.04 * k, 1.3 * k, -0.3 * k], ar * 1.2); limb(skin, [0.04 * k, 1.3 * k, -0.3 * k], [0.14 * k, 1.0 * k, -0.29 * k], ar * 0.9); hand([0.15 * k, 0.95 * k, -0.29 * k]);   // the left lowered, holding the robe
  } else if (kind === 'bodhi') {
    limb(skin, [0, 1.66 * k, sh[2]], [0.08 * k, 1.36 * k, 0.33 * k]); limb(skin, [0.08 * k, 1.36 * k, 0.33 * k], [0.2 * k, 1.6 * k, 0.34 * k], ar * 0.85); hand([0.22 * k, 1.66 * k, 0.34 * k]);
    put(PAL.white, rod([0.22 * k, 1.66 * k, 0.34 * k], [0.24 * k, 2.02 * k, 0.34 * k], 0.012 * k, 4));                                                  // the chauri: a handle and a tuft of white hair
    put(PAL.white, lat([[0.001, 0], [0.05 * k, 0.04 * k], [0.09 * k, 0.2 * k], [0.04 * k, 0.34 * k], [0.001, 0.36 * k]], 8, null, 1, 0.6, 0.24 * k, 1.9 * k, 0.4 * k));
    limb(skin, [0, 1.66 * k, -sh[2]], [0.06 * k, 1.34 * k, -0.31 * k]); limb(skin, [0.06 * k, 1.34 * k, -0.31 * k], [0.16 * k, 1.12 * k, -0.27 * k], ar * 0.85); hand([0.18 * k, 1.08 * k, -0.27 * k]);
  } else {
    for (const sg of [-1, 1]) { limb(skin, [0, 1.66 * k, sg * sh[2]], [0.06 * k, 1.35 * k, sg * 0.37 * k], ar * 1.15); limb(skin, [0.06 * k, 1.35 * k, sg * 0.37 * k], [0.3 * k + bell, 1.2 * k, sg * 0.15 * k], ar); hand([0.31 * k + bell, 1.18 * k, sg * 0.14 * k]); }
  }
  // jewels: a sash over the shoulder, a necklace, armlets
  if (kind !== 'buddha') {
    put(PAL.ochre, rod([0.04 * k, 1.7 * k, 0.2 * k + sw], [0.12 * k, 1.1 * k, -0.2 * k + sw], 0.018 * k, 4));
    put('bronze', lat([[0.17 * k, 0], [0.19 * k, 0.025 * k], [0.17 * k, 0.05 * k]], 12, null, 0.8, 1, 0, 1.58 * k, sw * 0.3));
    for (const sg of [-1, 1]) put('bronze', lat([[0.058 * k, 0], [0.06 * k, 0.04 * k]], 8, null, 1, 1, 0.03 * k, 1.5 * k, sg * 0.28 * k));
  }
  // the head: neck, face, ears with long lobes, brow, eyes, nose, lips
  const hy = 1.74 * k;
  put(skin, lat([[0.075 * k, 0], [0.075 * k, 0.1 * k]], 8, null, 1, 1, 0, hy - 0.02 * k, sw * 0.4));
  put(skin, lat([[0.001, 0], [0.09 * k, 0.02 * k], [0.125 * k, 0.1 * k], [0.13 * k, 0.2 * k], [0.1 * k, 0.3 * k], [0.001, 0.345 * k]], seg, null, 0.92, 0.86, 0, hy + 0.06 * k, sw * 0.4));
  if (!lo) {
    for (const sg of [-1, 1]) {
      put(skin, box(-0.02 * k, hy + 0.13 * k, sg * 0.115 * k - 0.012 * k, 0.03 * k, hy + (kind === 'buddha' ? 0.3 : 0.26) * k, sg * 0.115 * k + 0.012 * k));
      put(PAL.black, box(0.11 * k, hy + 0.255 * k, sg * 0.05 * k - 0.03 * k, 0.125 * k, hy + 0.27 * k, sg * 0.05 * k + 0.03 * k));
      put(PAL.black, box(0.105 * k, hy + 0.285 * k, sg * 0.05 * k - 0.04 * k, 0.12 * k, hy + 0.292 * k, sg * 0.05 * k + 0.04 * k));
    }
    put(skin, box(0.112 * k, hy + 0.2 * k, -0.012 * k, 0.15 * k, hy + 0.255 * k, 0.012 * k));
    put(PAL.red, box(0.105 * k, hy + 0.15 * k, -0.035 * k, 0.12 * k, hy + 0.165 * k, 0.035 * k));
    put(PAL.ochre, box(0.11 * k, hy + 0.3 * k, -0.01 * k, 0.12 * k, hy + 0.315 * k, 0.01 * k));
  }
  if (kind === 'buddha') {
    put(PAL.black, lat([[0.118 * k, 0], [0.122 * k, 0.07 * k], [0.1 * k, 0.15 * k], [0.06 * k, 0.2 * k], [0.001, 0.215 * k]], seg, null, 0.95, 0.9, 0, hy + 0.27 * k, 0));
    if (!lo) for (let i = 0; i < 12; i++) { const a = i / 12 * T; put(PAL.black, lat([[0.001, 0], [0.02 * k, 0.01 * k], [0.001, 0.035 * k]], 5, null, 1, 1, Math.cos(a) * 0.115 * k, hy + 0.37 * k + (i % 2) * 0.05 * k, Math.sin(a) * 0.105 * k)); }
  } else if (kind === 'bodhi') {
    put(PAL.black, lat([[0.12 * k, 0], [0.125 * k, 0.07 * k], [0.1 * k, 0.12 * k]], seg, null, 0.95, 0.9, 0, hy + 0.27 * k, sw * 0.4));
    put(PAL.ochre, lat([[0.12 * k, 0], [0.135 * k, 0.04 * k], [0.12 * k, 0.17 * k], [0.08 * k, 0.28 * k], [0.04 * k, 0.34 * k], [0.001, 0.38 * k]], seg, null, 0.95, 0.9, 0, hy + 0.33 * k, sw * 0.4));
    put('bronze', lat([[0.138 * k, 0], [0.138 * k, 0.02 * k]], 14, null, 0.95, 0.9, 0, hy + 0.36 * k, sw * 0.4));
  } else {
    put('cloth_ochre', lat([[0.12 * k, 0], [0.15 * k, 0.04 * k], [0.16 * k, 0.12 * k], [0.12 * k, 0.21 * k], [0.05 * k, 0.26 * k], [0.001, 0.27 * k]], seg, null, 0.95, 0.95, 0, hy + 0.3 * k, 0));
    put(PAL.red, lat([[0.15 * k, 0], [0.16 * k, 0.03 * k]], 12, null, 0.95, 0.95, 0, hy + 0.33 * k, 0));
  }
  // the halo behind the head (an attendant's or a Buddha's), a green rim and an ochre disc, standing on a short stalk
  if (kind !== 'yaksha') {
    put(PAL.green2, diskX(0.36 * k, -0.1 * k, hy + 0.2 * k, sw * 0.4, 18)); put(PAL.ochre, diskX(0.29 * k, -0.105 * k, hy + 0.2 * k, sw * 0.4, 18));
    put(STONE, rod([-0.02 * k, hy + 0.0, sw * 0.4], [-0.1 * k, hy + 0.2 * k, sw * 0.4], 0.03 * k, 5));
  }
  if (o.col !== false) col.circle(x, z, 0.34 * k, y, y + h);
}

// ── the great Buddha of the shrine ──────────────────────────────────────────────────────────────────────────────────
/** A makara: the crocodile-like beast of the throne's back, a curled body rising to a gaping head, its tail a scroll. dir ±1 (the way it faces along z). */
function makara(bag, x, y, z, s, dir) {
  const pts = [[0, 0], [0.04, 0.18], [0.1, 0.34], [0.22, 0.44], [0.38, 0.46]];
  for (let i = 0; i < pts.length - 1; i++) bag.add(STONE, rod([x + pts[i][0] * s * 0.4, y + pts[i][1] * s, z + dir * pts[i][0] * s], [x + pts[i + 1][0] * s * 0.4, y + pts[i + 1][1] * s, z + dir * pts[i + 1][0] * s], (0.07 - i * 0.008) * s, 6));
  bag.add(WHITE, lat([[0.001, 0], [0.1 * s, 0.03 * s], [0.12 * s, 0.14 * s], [0.07 * s, 0.24 * s], [0.001, 0.26 * s]], 10, null, 1.4, 1, x + 0.15 * s, y + 0.36 * s, z + dir * 0.36 * s));   // the head
  bag.add(PAL.black, box(x + 0.2 * s, y + 0.38 * s, z + dir * 0.4 * s - 0.03 * s, x + 0.25 * s, y + 0.46 * s, z + dir * 0.4 * s + 0.03 * s));   // the open mouth
  bag.add(PAL.red, rod([x + 0.02 * s, y + 0.02 * s, z], [x + 0.04 * s, y + 0.3 * s, z - dir * 0.12 * s], 0.025 * s, 4));                             // the tail, curling back
}
/** A deer (the wheel's guardians), at (x, y, z) facing dz (±1) along z: body, neck, head, antlers, four legs. */
function deer(bag, x, y, z, dz, s) {
  bag.add('hide_tan', lat([[0.001, 0], [0.09 * s, 0.02 * s], [0.11 * s, 0.12 * s], [0.08 * s, 0.22 * s], [0.001, 0.24 * s]], 10, null, 0.8, 2.2, x, y + 0.2 * s, z));
  bag.add('hide_tan', rod([x, y + 0.34 * s, z + dz * 0.2 * s], [x, y + 0.52 * s, z + dz * 0.3 * s], 0.035 * s, 5));
  bag.add('hide_tan', lat([[0.001, 0], [0.05 * s, 0.02 * s], [0.045 * s, 0.1 * s], [0.001, 0.14 * s]], 8, null, 0.8, 1, x, y + 0.5 * s, z + dz * 0.34 * s).rotateX(dz * 0.0));
  for (const sx of [-1, 1]) {
    bag.add('hide_brown', rod([x + sx * 0.02 * s, y + 0.6 * s, z + dz * 0.32 * s], [x + sx * 0.07 * s, y + 0.74 * s, z + dz * 0.26 * s], 0.01 * s, 4));
    for (const sz of [-1, 1]) bag.add('hide_brown', rod([x + sx * 0.04 * s, y + 0.2 * s, z + sz * 0.14 * s], [x + sx * 0.04 * s, y, z + sz * 0.14 * s], 0.014 * s, 4));
  }
}
/** The Buddha of Cave 1's shrine, h high including his throne, back against the plane x = xw, centred on z, facing +x: the teaching Buddha. */
export function shrineBuddha(ctx, xw, y, z, h) {
  const { bag, col } = ctx, k = h / 3.2, X = (d) => xw + d * k, Y = (v) => y + v * k, Z = (v) => z + v * k;
  const add = (m, g) => bag.add(m, g);
  const cx = 1.0;                                                         // the seat's centre, d from the wall
  // the pedestal: a moulded plinth, a lotus-petalled upper tier, a front panel with the wheel, the deer and the five disciples (stated)
  add(STONE, box(X(0.05), y, Z(-1.42), X(2.05), Y(0.12), Z(1.42)));
  add(STONE, box(X(0.07), Y(0.12), Z(-1.3), X(1.95), Y(0.5), Z(1.3)));
  add(STONE, box(X(0.07), Y(0.5), Z(-1.36), X(2.0), Y(0.58), Z(1.36)));
  for (let i = 0; i < 13; i++) add(WHITE, lat([[0.001, 0], [0.09 * k, 0.04 * k], [0.1 * k, 0.12 * k], [0.05 * k, 0.2 * k], [0.001, 0.22 * k]], 8, null, 0.5, 1, X(2.0), Y(0.5), Z(-1.32 + i * 0.22)).rotateZ(0));
  add(PAL.ground, box(X(1.95), Y(0.14), Z(-1.2), X(1.99), Y(0.48), Z(1.2)));                        // the red ground of the panel
  { const wx = X(2.01), wy = Y(0.31), wr = 0.14 * k;                                                // the wheel: a hub, eight spokes, a rim of sixteen blocks
    add(PAL.ochre, box(wx - 0.01, wy - 0.025 * k, Z(-0.025), wx + 0.04 * k, wy + 0.025 * k, Z(0.025)));
    for (let i = 0; i < 8; i++) { const a = i / 8 * T; add(PAL.ochre, rod([wx + 0.01, wy + Math.sin(a) * 0.03 * k, z + Math.cos(a) * 0.03 * k], [wx + 0.01, wy + Math.sin(a) * wr, z + Math.cos(a) * wr], 0.008 * k, 4)); }
    for (let i = 0; i < 16; i++) { const a = i / 16 * T, b = (i + 0.7) / 16 * T; add(PAL.ochre, rod([wx + 0.012, wy + Math.sin(a) * wr, z + Math.cos(a) * wr], [wx + 0.012, wy + Math.sin(b) * wr, z + Math.cos(b) * wr], 0.011 * k, 4)); }
    add(STONE, rod([wx, Y(0.14), z], [wx, wy - wr, z], 0.02 * k, 5)); }
  for (const sg of [-1, 1]) deer(bag, X(2.03), Y(0.14), Z(sg * 0.42), -sg, 1.15 * k);              // two deer, one each side, their heads to the wheel
  for (let i = 0; i < 5; i++) { const zz = i < 3 ? -0.62 - (2 - i) * 0.17 - 0.2 : 0.62 + (i - 3) * 0.17 + 0.2 + 0.0; add(i % 2 ? PAL.ochre : PAL.white, lat([[0.001, 0], [0.085 * k, 0.02 * k], [0.075 * k, 0.17 * k], [0.04 * k, 0.28 * k], [0.001, 0.3 * k]], 8, null, 0.7, 0.9, X(2.04), Y(0.17), Z(zz * 0.9)));
    add(PAL.skin, lat([[0.001, 0], [0.03 * k, 0.01 * k], [0.001, 0.05 * k]], 6, null, 1, 1, X(2.04), Y(0.45), Z(zz * 0.9))); }   // the five disciples, kneeling in worship
  // the seat: a maroon cushion, the lap in crossed legs
  add(PAL.ground2, box(X(0.12), Y(0.58), Z(-1.2), X(1.9), Y(0.68), Z(1.2)));
  add(PAL.ochre, lat([[0.001, 0], [0.9 * k, 0.04 * k], [1.0 * k, 0.12 * k], [0.93 * k, 0.3 * k], [0.7 * k, 0.4 * k], [0.4 * k, 0.45 * k], [0.001, 0.47 * k]], 24, (th) => 1 + 0.03 * Math.cos(11 * th), 0.9, 1.22, X(cx), Y(0.68)));
  for (let i = 0; i < 6; i++) add('clay_robe', box(X(cx + 0.88 - i * 0.016), Y(0.78 + i * 0.06), Z(-1.0 + i * 0.05), X(cx + 0.93 - i * 0.016), Y(0.8 + i * 0.06), Z(1.0 - i * 0.05)));   // the folds over the knees
  add(PAL.skin, box(X(cx + 0.52), Y(0.92), Z(-0.62), X(cx + 0.7), Y(1.0), Z(-0.28))); add(PAL.skin, box(X(cx + 0.52), Y(0.92), Z(0.28), X(cx + 0.7), Y(1.0), Z(0.62)));   // the soles of the feet
  // the body in the monastic robe, over both shoulders; the arms bring the hands to the breast
  add(PAL.ochre, lat([[0.001, 0], [0.58 * k, 0.03 * k], [0.52 * k, 0.5 * k], [0.55 * k, 0.9 * k], [0.62 * k, 1.3 * k], [0.52 * k, 1.58 * k], [0.2 * k, 1.72 * k], [0.001, 1.75 * k]], 26, (th, i, r, yy) => 1 + 0.02 * Math.cos(9 * th), 0.76, 1.12, X(cx - 0.02), Y(1.15)));
  for (let i = 0; i < 7; i++) { const zz = -0.36 + i * 0.12; add('clay_robe', box(X(cx + 0.455 + 0.01 * Math.abs(zz)), Y(1.55), Z(zz - 0.012), X(cx + 0.5 + 0.01 * Math.abs(zz)), Y(2.28), Z(zz + 0.012))); }   // the folds of the breast
  add('clay_robe', rod([X(cx + 0.32), Y(2.62), Z(0.4)], [X(cx + 0.46), Y(1.6), Z(-0.38)], 0.035 * k, 5));  // the robe's edge across the chest
  for (const sg of [-1, 1]) { add(PAL.ochre, rod([X(cx - 0.05), Y(2.66), Z(sg * 0.6)], [X(cx + 0.18), Y(2.05), Z(sg * 0.7)], 0.11 * k, 7)); add(PAL.skin, rod([X(cx + 0.18), Y(2.05), Z(sg * 0.7)], [X(cx + 0.56), Y(2.24), Z(sg * 0.3)], 0.075 * k, 6)); }
  add(PAL.skin, box(X(cx + 0.55), Y(2.18), Z(-0.38), X(cx + 0.7), Y(2.34), Z(0.02))); add(PAL.skin, box(X(cx + 0.57), Y(2.2), Z(-0.04), X(cx + 0.68), Y(2.36), Z(0.3)));  // the hands: the wheel set turning
  for (let i = 0; i < 4; i++) add(PAL.skin, box(X(cx + 0.62), Y(2.34 + i * 0.0), Z(-0.36 + i * 0.1), X(cx + 0.7), Y(2.4), Z(-0.28 + i * 0.1)));
  // the head: neck with its three folds, the face, long ears, the closed lids, the urna, the hair in curls and the ushnisha
  add(PAL.skin, lat([[0.2 * k, 0], [0.2 * k, 0.14 * k]], 12, null, 0.9, 1, X(cx - 0.02), Y(2.66)));
  add(PAL.skin, lat([[0.001, 0], [0.2 * k, 0.04 * k], [0.28 * k, 0.2 * k], [0.29 * k, 0.34 * k], [0.22 * k, 0.5 * k], [0.001, 0.57 * k]], 20, null, 0.92, 0.84, X(cx - 0.02), Y(2.74)));
  for (const sg of [-1, 1]) {
    add(PAL.skin, box(X(cx - 0.12), Y(2.82), Z(sg * 0.255) - 0.025, X(cx - 0.04), Y(3.2), Z(sg * 0.255) + 0.025)); add(PAL.skin, box(X(cx - 0.12), Y(2.8), Z(sg * 0.262) - 0.03, X(cx - 0.02), Y(2.86), Z(sg * 0.262) + 0.03));    // the ear and its long lobe
    add(PAL.black, box(X(cx + 0.24), Y(3.05), Z(sg * 0.1) - 0.045, X(cx + 0.26), Y(3.065), Z(sg * 0.1) + 0.045)); add(PAL.black, box(X(cx + 0.23), Y(3.1), Z(sg * 0.1) - 0.06, X(cx + 0.25), Y(3.115), Z(sg * 0.1) + 0.06));
  }
  add(PAL.skin, box(X(cx + 0.25), Y(2.95), Z(-0.03), X(cx + 0.32), Y(3.05), Z(0.03))); add(PAL.red, box(X(cx + 0.235), Y(2.85), Z(-0.07), X(cx + 0.26), Y(2.88), Z(0.07)));  // nose, lips
  add(PAL.ochre, box(X(cx + 0.24), Y(3.13), Z(-0.012), X(cx + 0.26), Y(3.15), Z(0.012)));
  add(PAL.black, lat([[0.27 * k, 0], [0.29 * k, 0.12 * k], [0.25 * k, 0.26 * k], [0.15 * k, 0.34 * k], [0.001, 0.38 * k]], 20, null, 0.95, 0.88, X(cx - 0.03), Y(3.15)));
  for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const a = i / 12 * T + r * 0.26, rr = (0.27 - r * 0.05) * k; add(PAL.black, lat([[0.001, 0], [0.04 * k, 0.012 * k], [0.001, 0.06 * k]], 6, null, 1, 1, X(cx - 0.03) + Math.cos(a) * rr * 0.9, Y(3.2 + r * 0.1) - 0.02, z + Math.sin(a) * rr * 0.82)); }
  // the back of the throne: two uprights with lotus medallions, a crossbar, a makara on each upright turned outward
  for (const sg of [-1, 1]) {
    add(STONE, box(X(0.07), Y(0.62), Z(sg * 1.12 - 0.14), X(0.42), Y(3.25), Z(sg * 1.12 + 0.14)));
    add(STONE, box(X(0.07), Y(3.25), Z(sg * 1.12 - 0.19), X(0.46), Y(3.33), Z(sg * 1.12 + 0.19)));
    for (let m = 0; m < 4; m++) add(PAL.ochre, lat([[0.001, 0], [0.085 * k, 0.004 * k], [0.06 * k, 0.012 * k]], 10, null, 1, 1, X(0.42), Y(0.9 + m * 0.62), Z(sg * 1.12)).rotateZ(0));
    makara(bag, X(0.12), Y(3.33), Z(sg * 1.12), 0.8 * k, sg);
  }
  add(STONE, box(X(0.07), Y(2.95), Z(-1.14), X(0.38), Y(3.1), Z(1.14)));
  add(PAL.ground, box(X(0.38), Y(2.98), Z(-1.1), X(0.4), Y(3.07), Z(1.1)));
  for (let i = 0; i < 9; i++) add(i % 2 ? PAL.ochre : PAL.white, lat([[0.001, 0], [0.07 * k, 0.004 * k], [0.05 * k, 0.012 * k]], 8, null, 1, 1, X(0.4), Y(3.02), Z(-0.96 + i * 0.24)));
  col.rect([X(0.05), Z(-1.42), X(2.05), Z(1.42)], y, Y(0.68)); col.circle(X(cx), z, 0.8 * k, Y(0.68), Y(3.2));
}

// ── the frieze under the chaitya hall's vault ───────────────────────────────────────────────────────────────────────
/** A makara torana: an arch of a rod rising from two makara heads, over a figure; standing in the plane x = x0..., faces ±z. Local: centre (cx, y, z), half span a, facing n (±1 along z). */
function torana(bag, cx, y, z, a, n) {
  const N = 9, prof = [];
  for (let i = 0; i <= N; i++) { const t = Math.PI * i / N; prof.push([-Math.cos(t) * a, Math.sin(t) * a * 0.9]); }
  for (let i = 0; i < N; i++) bag.add(WHITE, rod([cx + prof[i][0], y + prof[i][1], z], [cx + prof[i + 1][0], y + prof[i + 1][1], z], 0.026, 5));
  for (const sg of [-1, 1]) bag.add(STONE, lat([[0.001, 0], [0.05, 0.02], [0.06, 0.1], [0.03, 0.15], [0.001, 0.16]], 8, null, 1.1, 0.7, cx + sg * a, y - 0.04, z + n * 0.02));      // the makara's head at each foot
}
/** A beast of the frieze in low relief over a pillar, 0.34 m long, walking along x, its flank to the nave (docs/settlements/ajanta.md §21): the elephant (even i) or the aquatic bull, a
 *  bull whose hind part ends in a fish's tail (odd i), both small as the band is 0.4 m high. n is the face's direction (±1 along z). */
function frieze_beast(bag, xm, y, z, n, i) {
  const f = (i >> 1) & 1 ? -1 : 1, X = (d) => xm + f * d, M = WHITE;
  if (i % 2 === 0) {
    bag.add(M, lat([[0.001, 0], [0.08, 0.03], [0.1, 0.09], [0.07, 0.15], [0.001, 0.17]], 8, null, 1.35, 0.4, xm, y + 0.09, z));                       // the body
    bag.add(M, lat([[0.001, 0], [0.05, 0.02], [0.05, 0.08], [0.001, 0.11]], 7, null, 1, 0.45, X(0.15), y + 0.2, z));                               // the head
    bag.add(M, rod([X(0.19), y + 0.2, z], [X(0.26), y + 0.1, z + n * 0.01], 0.014, 5)); bag.add(M, rod([X(0.26), y + 0.1, z + n * 0.01], [X(0.24), y + 0.06, z + n * 0.01], 0.01, 5));   // the trunk
    for (const d of [-0.1, -0.04, 0.07, 0.13]) bag.add(M, rod([X(d), y + 0.02, z], [X(d), y + 0.1, z], 0.02, 5));                                  // four legs
  } else {
    bag.add(M, lat([[0.001, 0], [0.07, 0.03], [0.085, 0.08], [0.06, 0.13], [0.001, 0.15]], 8, null, 1.25, 0.4, X(0.04), y + 0.1, z));              // the bull's fore body
    bag.add(M, lat([[0.001, 0], [0.04, 0.02], [0.04, 0.07], [0.001, 0.1]], 7, null, 1, 0.45, X(0.17), y + 0.2, z));                                // the head
    for (const sg of [-1, 1]) bag.add(M, rod([X(0.19), y + 0.27, z + sg * 0.012], [X(0.22), y + 0.33, z + sg * 0.03], 0.008, 4));                  // the horns
    bag.add(M, rod([X(-0.1), y + 0.14, z], [X(-0.2), y + 0.2, z], 0.03, 5)); bag.add(M, rod([X(-0.2), y + 0.2, z], [X(-0.26), y + 0.3, z], 0.012, 5)); bag.add(M, rod([X(-0.2), y + 0.2, z], [X(-0.28), y + 0.14, z], 0.012, 5));   // the fish's tail
    for (const d of [0.08, 0.14]) bag.add(M, rod([X(d), y + 0.02, z], [X(d), y + 0.09, z], 0.018, 5));
  }
}
/** The entablature of Cave 19's nave on each side: a lotus-petal moulding, a frieze in the bay over each pair of pillars of a seated Buddha under a makara
 *  torana, an elephant or an aquatic bull between (stated: IGNCA Architecture), and the dentilled cornice; x from xA (north end) to xB, the vault's side at |dz|. */
export function nave_frieze(ctx, xs, y, zc, hw) {
  const { bag } = ctx;
  for (const sg of [-1, 1]) {
    const zf = zc + sg * hw, n = -sg;                                       // the face looks to the nave's axis
    for (const [xa, xb] of [[xs[0], xs[xs.length - 1]]]) {
      bag.add(STONE, box(xb - 0.0, y + 4.3, Math.min(zf, zf + n * 0.2), xa + 0.0, y + 4.48, Math.max(zf, zf + n * 0.2)));
      bag.add(STONE, box(xb, y + 4.98, Math.min(zf, zf + n * 0.26), xa, y + 5.06, Math.max(zf, zf + n * 0.26)));
      for (let x = xb + 0.1; x < xa - 0.1; x += 0.22) bag.add(STONE, box(x, y + 4.92, Math.min(zf, zf + n * 0.24), x + 0.12, y + 4.98, Math.max(zf, zf + n * 0.24)));      // dentils
      for (let x = xb + 0.15; x < xa - 0.15; x += 0.3) bag.add(WHITE, lat([[0.001, 0], [0.06, 0.02], [0.06, 0.08], [0.001, 0.12]], 6, null, 1, 0.5, x, y + 4.48, zf + n * 0.1));     // petals of the moulding
    }
    for (let i = 0; i < xs.length - 1; i++) {
      const xm = (xs[i] + xs[i + 1]) / 2, zz = zf + n * 0.1;
      // the Buddha in his bay, under the torana
      bag.add(WHITE, lat([[0.001, 0], [0.26, 0.03], [0.22, 0.18], [0.1, 0.34], [0.001, 0.36]], 10, null, 1, 0.55, xm, y + 4.52, zz));
      bag.add(PAL.skin, lat([[0.001, 0], [0.07, 0.02], [0.065, 0.12], [0.001, 0.15]], 8, null, 1, 0.8, xm, y + 4.84, zz + n * 0.0));
      bag.add(PAL.ochre, diskX(0.14, 0, 0, 0, 12).rotateY(Math.PI / 2).translate(xm, y + 4.92, zz - n * 0.06));
      torana(bag, xm, y + 4.54, zz + n * 0.05, 0.5, n);
      if (i > 0) frieze_beast(bag, xs[i], y + 4.5, zf + n * 0.08, n, i);
    }
  }
}

/** A torana framing a standing image on the stupa's front (plane x, centre z, floor y): two pilasters, an arch of rods, a makara at each foot, a crest of lotus petals; a high. */
export function toranaFront(ctx, x, y, z, a, hp) {
  const { bag } = ctx, N = 12;
  for (const sg of [-1, 1]) {
    bag.add(STONE, box(x - 0.1, y, z + sg * a - 0.07, x + 0.06, y + hp, z + sg * a + 0.07));
    bag.add(STONE, lat([[0.001, 0], [0.07, 0.03], [0.09, 0.12], [0.05, 0.2], [0.001, 0.22]], 8, null, 1.3, 1, x + 0.04, y + hp - 0.04, z + sg * a));
  }
  for (let i = 0; i < N; i++) { const t0 = Math.PI * i / N, t1 = Math.PI * (i + 1) / N; bag.add(WHITE, rod([x + 0.02, y + hp + 0.1 + Math.sin(t0) * a * 0.95, z - Math.cos(t0) * a], [x + 0.02, y + hp + 0.1 + Math.sin(t1) * a * 0.95, z - Math.cos(t1) * a], 0.035, 5)); }
  for (let i = 1; i < N; i++) { const t = Math.PI * i / N; bag.add(WHITE, lat([[0.001, 0], [0.035, 0.03], [0.001, 0.09]], 6, null, 1, 1, x + 0.02, y + hp + 0.1 + Math.sin(t) * a * 0.95 + 0.04, z - Math.cos(t) * a)); }
}
