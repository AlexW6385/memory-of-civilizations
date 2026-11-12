// The courtyard house of Umayyad Jerusalem (docs/settlements/jerusalem.md §5): ranges of rooms of coursed
// limestone round a paved court — the main room across the back (north), a store range on the west, a
// kitchen range on the east on some — the court closed on the street by a wall with the house door; flat
// roofs of beams, reeds and beaten earth plastered over, behind low parapets, drained by timber spouts;
// a stone stair up to the roofs; in the court the cistern's mouth and the clay oven (tabun). The stone's
// weathering: the grey-green damp at the foot of the walls, the streaks greyed down under the spouts and the
// parapets. With `open` the house is built with its rooms hollow and walkable, its door standing open, and
// its main room furnished (mats, cushions and bolsters along the walls, a chest, a tray on its stand, a
// lamp burning in a niche); its jars, sacks, baskets and people are set by the settlement's life plan.

import { box, lathe, windMat, hangFrom } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const L = 'limestone', CUT = 'limestone_carved';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** A slab on a vertical face: the face plane at `p` across the axis ('x': a face at x = p, its span along z; 'z': at z = p, along x), out by sg. */
function onFace(bag, mat, axis, p, sg, u0, u1, y0, y1, d0, d1) {
  if (d0 === 0) d0 = -0.03;                       // (stones set into the wall, so that their backs lie inside it)
  const a = p + sg * d0, b = p + sg * d1;
  bag.add(mat, axis === 'x' ? box(Math.min(a, b), y0, u0, Math.max(a, b), y1, u1) : box(u0, y0, Math.min(a, b), u1, y1, Math.max(a, b)));
}
/** A solid range of rooms: its mass, the roof's plaster, the parapets round it; the floor on the roof. */
function range(bag, col, [x0, z0, x1, z1], yb, top, F) {
  bag.add(L, box(x0, yb, z0, x1, top, z1)); col.rect([x0, z0, x1, z1], yb, top); col.floor([x0, z0, x1, z1], top);
  parapets(bag, [x0, z0, x1, z1], top);
  void F;
}
/** Parapets round a roof [x0, z0, x1, z1] at `top` (the x-runs whole, the z-runs between them, so no two overlap), the roof's plaster within. */
function parapets(bag, [x0, z0, x1, z1], top, h = 0.55, t = 0.28, skip = '') {
  if (!skip.includes('n')) bag.add(L, box(x0, top, z0, x1, top + h, z0 + t));
  if (!skip.includes('s')) bag.add(L, box(x0, top, z1 - t, x1, top + h, z1));
  if (!skip.includes('w')) bag.add(L, box(x0, top, z0 + t, x0 + t, top + h, z1 - t));
  if (!skip.includes('e')) bag.add(L, box(x1 - t, top, z0 + t, x1, top + h, z1 - t));
  for (const [a, b, c, d] of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]]) bag.add(CUT, box(a - 0.03, top + h, b - 0.03, c + 0.03, top + h + 0.08, d + 0.03));
  bag.add('lime_plaster', box(x0 + t, top, z0 + t, x1 - t, top + 0.05, z1 - t));
}
/** A doorway on a face: dark opening (or none when it is open and real), jambs and lintel proud of the face. */
function doorway(bag, axis, p, sg, uc, w, F, h, dark = true) {
  if (dark) onFace(bag, 'opening', axis, p, sg, uc - w / 2, uc + w / 2, F, F + h, 0.005, 0.02);
  for (const s of [-1, 1]) onFace(bag, CUT, axis, p, sg, Math.min(uc + s * w / 2, uc + s * (w / 2 + 0.22)), Math.max(uc + s * w / 2, uc + s * (w / 2 + 0.22)), F, F + h, 0, 0.05);
  onFace(bag, CUT, axis, p, sg, uc - w / 2 - 0.32, uc + w / 2 + 0.32, F + h, F + h + 0.36, 0, 0.07);
  // a relieving arch of five voussoirs over the lintel
  for (let k = 0; k < 5; k++) { const a0 = Math.PI * k / 5, a1 = Math.PI * (k + 1) / 5, r = w / 2 + 0.1; onFace(bag, CUT, axis, p, sg, uc - Math.cos(a0) * r - 0.02, uc - Math.cos(a1) * r + 0.02, F + h + 0.36 + Math.sin(Math.min(a0, a1)) * r * 0.5, F + h + 0.36 + Math.max(Math.sin(a0), Math.sin(a1)) * r * 0.5 + 0.18, 0, 0.04); }
}
/** A small window high in a face: the dark opening, a sill, a lintel. */
function windowAt(bag, axis, p, sg, uc, y0, w = 0.5, h = 0.75) {
  onFace(bag, 'opening', axis, p, sg, uc - w / 2, uc + w / 2, y0, y0 + h, 0.005, 0.02);
  onFace(bag, CUT, axis, p, sg, uc - w / 2 - 0.12, uc + w / 2 + 0.12, y0 - 0.12, y0, 0, 0.08);
  onFace(bag, CUT, axis, p, sg, uc - w / 2 - 0.15, uc + w / 2 + 0.15, y0 + h, y0 + h + 0.22, 0, 0.05);
}
/** A timber spout through the parapet's foot, out over the face, and the streak greyed down the wall under it. */
function spout(bag, axis, p, sg, uc, top, run) {
  onFace(bag, 'timber', axis, p, sg, uc - 0.07, uc + 0.07, top - 0.02, top + 0.1, -0.1, 0.55);
  onFace(bag, 'plaster_streak', axis, p, sg, uc - 0.16, uc + 0.16, top - run, top - 0.02, 0.004, 0.012);
}
/** The damp at the foot of a face from u0 to u1, its top wavering, broken where `cuts` are. */
function damp(bag, axis, p, sg, u0, u1, yb, yt, cuts = []) {
  let u = u0;
  for (const [c0, c1] of [...cuts.filter(([a, b]) => b > u0 && a < u1).sort((a, b) => a[0] - b[0]), [u1, u1]]) {
    for (let s = u; s < Math.min(c0, u1) - 0.05; s += 1.4) { const e = Math.min(s + 1.4, c0, u1); onFace(bag, 'plaster_damp', axis, p, sg, s, e, yb, yt + 0.12 * Math.sin(s * 2.1) + 0.08 * Math.sin(s * 5.3), 0.003, 0.012); }
    u = Math.max(u, c1);
  }
}

/**
 * What stood on the flat roofs: a mat with figs or raisins drying, a washing line, jars, a pigeon cote, a stack of firewood, a bed for the summer nights.
 * rect: the roof's free ground [x0, z0, x1, z1] (clear of the parapets and the stair), top: its level.
 */
function roofLife(ctx, rand, [x0, z0, x1, z1], top) {
  const { bag, col } = ctx, W = x1 - x0, D = z1 - z0;
  if (W < 2.2 || D < 2.2) return;
  const at = () => [x0 + 0.9 + rand() * Math.max(0.1, W - 1.8), z0 + 0.9 + rand() * Math.max(0.1, D - 1.8)];
  const n = rand() < 0.2 ? 0 : rand() < 0.5 ? 1 : 2;
  for (let k = 0; k < n; k++) {
    const kind = Math.floor(rand() * 6), [x, z] = at();
    if (kind === 0) {                     // a mat of figs or raisins drying
      bag.add('reed_mat', box(x - 0.9, top + 0.05, z - 0.55, x + 0.9, top + 0.07, z + 0.55));
      for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) bag.add(rand() < 0.5 ? 'cloth_brown' : 'cloth_maroon', box(x - 0.8 + q * 0.28, top + 0.07, z - 0.45 + r * 0.28, x - 0.62 + q * 0.28, top + 0.1, z - 0.3 + r * 0.28));
    } else if (kind === 1 && W > 3.4) {   // a washing line between two posts, the cloths on it
      const L = Math.min(3.0, W - 1.4), xa = x0 + 0.7, y = top + 1.5;
      for (const xp of [xa, xa + L]) bag.add('timber', box(xp - 0.04, top, z - 0.04, xp + 0.04, y + 0.05, z + 0.04));
      bag.add('sacking', box(xa, y - 0.01, z - 0.008, xa + L, y + 0.01, z + 0.008));
      for (let q = 0; q < 3; q++) { const c = ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)], cx = xa + 0.35 + q * (L - 0.7) / 2.2; bag.add(windMat(c), hangFrom(box(cx - 0.3, y - 0.92, z - 0.012, cx + 0.3, y - 0.02, z + 0.012), y - 0.02)); }
      col.circle(xa, z, 0.08, top, top + 1.5);
    } else if (kind === 2) {              // jars, a cluster of three
      for (let q = 0; q < 3; q++) bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.03], [0.24, 0.3], [0.2, 0.55], [0.1, 0.68], [0.12, 0.73], [0.001, 0.73]], 10, null, x + (q - 1) * 0.5, top, z + (q % 2) * 0.35));
      col.circle(x, z + 0.17, 0.8, top, top + 0.75);
    } else if (kind === 3) {              // a pigeon cote: a small plastered tower pierced with holes
      bag.add('mud_plaster', box(x - 0.55, top, z - 0.45, x + 0.55, top + 1.6, z + 0.45)); bag.add('mud_plaster', box(x - 0.65, top + 1.6, z - 0.55, x + 0.65, top + 1.72, z + 0.55));
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) bag.add('opening', box(x - 0.42 + q * 0.28, top + 0.35 + r * 0.3, z - 0.46, x - 0.32 + q * 0.28, top + 0.45 + r * 0.3, z - 0.44));
      for (let q = 0; q < 4; q++) bag.add('timber', box(x - 0.45 + q * 0.28, top + 0.3 + (q % 2) * 0.3 - 0.03, z - 0.52, x - 0.3 + q * 0.28, top + 0.33 + (q % 2) * 0.3, z - 0.44));
      col.rect([x - 0.65, z - 0.55, x + 0.65, z + 0.55], top, top + 1.75);
    } else if (kind === 4) {              // a stack of firewood and brushwood for the winter
      for (let r = 0; r < 4; r++) for (let q = 0; q < 6 - r; q++) bag.add('timber', box(x - 0.8 + r * 0.14 + q * 0.27, top + r * 0.14, z - 0.3, x - 0.8 + r * 0.14 + q * 0.27 + 0.2, top + r * 0.14 + 0.13, z + 0.3));
      col.rect([x - 0.8, z - 0.3, x + 0.8, z + 0.3], top, top + 0.6);
    } else {                              // a bed for the summer nights: a mattress and a folded quilt
      bag.add('cedar', box(x - 0.5, top + 0.1, z - 0.95, x + 0.5, top + 0.15, z + 0.95)); for (const sx of [-0.45, 0.45]) for (const sz of [-0.9, 0.9]) bag.add('cedar', box(x + sx - 0.03, top, z + sz - 0.03, x + sx + 0.03, top + 0.1, z + sz + 0.03));
      bag.add(rand() < 0.5 ? 'cloth_indigo' : 'cloth_red', box(x - 0.46, top + 0.15, z - 0.9, x + 0.46, top + 0.25, z + 0.9)); bag.add('cloth_white', box(x - 0.4, top + 0.25, z - 0.9, x + 0.4, top + 0.33, z - 0.55));
    }
  }
}

/** The plan of an open house (for the life plan that furnishes it): its court, main room, store, door. */
export function openLayout(el) {
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, T = 0.65, F = Math.max(el.y ?? 0, el.y1 ?? el.y ?? 0) + 0.05;
  const dN = clamp(D * 0.36, 4.2, 5.4), dW = clamp(W * 0.27, 3.4, 4.2), xc0 = x0 + dW, xc1 = x1 - 3.4, zc0 = z0 + dN, zc1 = z1 - T;
  return { F, court: [xc0, zc0, xc1, zc1], room: [x0 + T, z0 + T, x1 - T, zc0 - T], store: [x0 + T, zc0, xc0 - T, z1 - T], door: [(xc0 + xc1) / 2, z1] };
}

/** levant_house: { rect, y (lowest ground), y1 (highest), seed, open } */
export function levantHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, yb = (el.y ?? 0) - 0.6;
  const F = Math.max(el.y ?? 0, el.y1 ?? el.y ?? 0) + 0.05, W = x1 - x0, D = z1 - z0, T = 0.65, open = !!el.open;
  const dN = clamp(D * 0.36, 4.2, 5.4), dW = clamp(W * 0.27, 3.4, 4.2), hasE = open || rand() < 0.6, dE = 3.4;
  const two = !open && rand() < 0.4, hN = F + (two ? 7.4 : 4.2), hW = F + 3.9, hE = F + 3.6, hS = F + 3.0;
  const xc0 = x0 + dW, xc1 = hasE ? x1 - dE : x1 - T, zc0 = z0 + dN, zc1 = z1 - T;
  const N = [x0, z0, x1, zc0], Wr = [x0, zc0, xc0, z1], Er = hasE ? [xc1, zc0, x1, z1] : [x1 - T, zc0, x1, z1];
  // the court: paved, the cistern's mouth and the oven
  bag.add('flagstone', box(xc0, yb, zc0, xc1, F, zc1)); col.floor([xc0, zc0, xc1, zc1], F);
  // ── the ranges ──
  if (!open) {
    range(bag, col, N, yb, hN, F);
    range(bag, col, Wr, yb, hW, F);
    if (hasE) range(bag, col, Er, yb, hE, F);
    else { bag.add(L, box(Er[0], yb, Er[1], Er[2], hS, Er[3])); col.rect(Er, yb, hS); bag.add(CUT, box(Er[0] - 0.03, hS, Er[1], Er[2] + 0.03, hS + 0.1, Er[3])); }
  } else hollowRanges(ctx, el, { x0, z0, x1, z1, F, yb, T, N, Wr, Er, hN, hW, hE });
  // the court wall on the street with the house door
  const dc = open ? (xc0 + xc1) / 2 : (xc0 + xc1) / 2 + (rand() - 0.5) * Math.max(0, xc1 - xc0 - 3), dw = 1.1, dh = 2.1;
  for (const [a, b] of [[xc0, dc - dw / 2], [dc + dw / 2, xc1]]) { bag.add(L, box(a, yb, zc1, b, hS, z1)); col.rect([a, zc1, b, z1], yb, hS); }
  bag.add(L, box(dc - dw / 2, F + dh, zc1, dc + dw / 2, hS, z1));
  bag.add(L, box(dc - dw / 2, yb, zc1, dc + dw / 2, F, z1));
  bag.add(CUT, box(xc0, hS, zc1 - 0.03, xc1, hS + 0.1, z1 + 0.03));
  doorway(bag, 'z', z1, 1, dc, dw, F, dh, false);
  if (open) {
    // the two leaves swung back against the inside of the wall
    for (const s of [-1, 1]) { const hx = dc + s * dw / 2; bag.add('cedar', box(Math.min(hx, hx + s * 0.06), F + 0.02, zc1 - 0.56, Math.max(hx, hx + s * 0.06), F + dh - 0.04, zc1 - 0.01)); }
  } else {
    bag.add('cedar', box(dc - dw / 2, F, zc1 + T / 2 - 0.04, dc + dw / 2, F + dh, zc1 + T / 2 + 0.04)); col.rect([dc - dw / 2, zc1 + T / 2 - 0.04, dc + dw / 2, zc1 + T / 2 + 0.04], F, F + dh);
    for (const s of [-0.28, 0.28]) bag.add('iron', box(dc + s - 0.04, F + 1.0, zc1 + T / 2 + 0.04, dc + s + 0.04, F + 1.08, zc1 + T / 2 + 0.06));
  }
  // the threshold and, where the street falls away, steps down to it
  bag.add(CUT, box(dc - dw / 2 - 0.1, F - 0.12, z1 - 0.05, dc + dw / 2 + 0.1, F + 0.04, z1 + 0.32));
  // (the lanes between the lots may be only a metre wide: at most three steps, their risers as the drop needs)
  const drop = F - (el.ys ?? el.y ?? F), nS = Math.min(3, Math.ceil((drop - 0.08) / 0.18)), rS = nS > 0 ? drop / (nS + 1) : 0;
  for (let k = 1; k <= nS; k++) bag.add(CUT, box(dc - 0.75, yb, z1 + 0.32 + (k - 1) * 0.2, dc + 0.75, F - k * rS, z1 + 0.32 + k * 0.2));
  if (nS > 0) col.ramp([dc - 0.75, z1, dc + 0.75, z1 + 0.32 + nS * 0.2], el.ys ?? F, F, 'n');
  // the street front: a stone bench (mastaba) by the door where the lane is wide enough, a bracket lamp on the jamb
  if (!open) {
    if ((el.gs ?? 0) > 3.4 && rand() < 0.7) {
      const side = dc - dw / 2 - 2.6 > x0 + 0.6 ? -1 : 1, bx = side < 0 ? dc - dw / 2 - 0.6 : dc + dw / 2 + 0.6;
      if (bx - 1.0 > x0 + 0.4 && bx + 1.0 < x1 - 0.4 && (side < 0 ? bx - 1.0 > xc0 - 0.1 || true : true)) {
        const bz1 = z1 + 0.5, ys = el.ys ?? F, by = Math.max(ys, F - 0.25);
        bag.add(CUT, box(bx - 1.0, by - 0.1, z1 + 0.02, bx + 1.0, by + 0.45, bz1)); bag.add(L, box(bx - 1.04, by + 0.45, z1 + 0.02, bx + 1.04, by + 0.5, bz1 + 0.04));
        col.rect([bx - 1.04, z1, bx + 1.04, bz1 + 0.04], by - 0.1, by + 0.5);
      }
    }
    if (rand() < 0.6) {
      const lx = dc + dw / 2 + 0.34, ly = F + 2.45;
      bag.add('iron', box(lx - 0.012, ly, z1, lx + 0.012, ly + 0.03, z1 + 0.5)); bag.add('iron', lathe([[0.001, 0], [0.08, 0], [0.1, 0.03], [0.001, 0.03]], 8, null, lx, ly - 0.32, z1 + 0.48));
      bag.add('lamp_glass', lathe([[0.001, 0], [0.055, 0.01], [0.08, 0.09], [0.06, 0.18], [0.001, 0.18]], 8, null, lx, ly - 0.29, z1 + 0.48));
    }
  }
  // ── the faces: doors and windows onto the court, small windows to the streets, spouts, the damp ──
  const nDoor = (xc0 + xc1) / 2 + (open ? 0 : (rand() - 0.5) * 1.2);
  if (!open) {
    doorway(bag, 'z', zc0, 1, nDoor, 1.0, F, 2.2);
    for (const s of [-1, 1]) if (Math.abs(s * 2.0) < (xc1 - xc0) / 2 - 1.2) windowAt(bag, 'z', zc0, 1, nDoor + s * 2.0, F + 1.3, 0.55, 0.85);
    if (two) for (const s of [-1.6, 0, 1.6]) windowAt(bag, 'z', zc0, 1, nDoor + s, F + 5.0, 0.5, 0.9);
    const wc = zc0 + 1.0;
    doorway(bag, 'x', xc0, 1, wc, 0.9, F, 2.0);
    if (hasE) doorway(bag, 'x', xc1, -1, wc + 0.3 + rand() * 0.5, 0.9, F, 2.0);
  }
  // the roofs: what stood on them; the kitchen's vent
  if (!open) {
    const rr = rng((el.seed || 1) + 5);
    roofLife(ctx, rr, [N[0] + 0.7, N[1] + 0.7, N[2] - 0.7, N[3] - 0.7], hN);
    roofLife(ctx, rr, [Wr[0] + 0.7, Wr[1] + 0.7, Wr[2] - 1.9, Wr[3] - 0.7], hW);
    if (hasE) {
      roofLife(ctx, rr, [Er[0] + 0.7, Er[1] + 0.7, Er[2] - 2.6, Er[3] - 2.8], hE);
      const vx = x1 - 2.2, vz = z1 - 2.0;
      bag.add('mud_plaster', box(vx - 0.4, hE, vz - 0.4, vx + 0.4, hE + 0.95, vz + 0.4)); bag.add('pottery_dark', box(vx - 0.46, hE + 0.95, vz - 0.46, vx + 0.46, hE + 1.03, vz + 0.46)); bag.add('opening', box(vx - 0.2, hE + 1.03, vz - 0.2, vx + 0.2, hE + 1.035, vz + 0.2));
      col.rect([vx - 0.46, vz - 0.46, vx + 0.46, vz + 0.46], hE, hE + 1.05);
    }
  }
  // to the streets: high slits in the outer walls
  for (const [axis, p, sg, a, b, top] of [['z', z0, -1, x0, x1, hN], ['x', x0, -1, z0, z1, hW], ['x', x1, 1, z0, z1, hasE ? hE : hS]]) {
    const n = Math.max(1, Math.floor((b - a) / 4.5));
    for (let i = 0; i < n; i++) { const u = a + (i + 0.5) * (b - a) / n; if (top - F > 3.5) windowAt(bag, axis, p, sg, u, top - 1.4, 0.38, 0.6); }
    damp(bag, axis, p, sg, a, b, yb + 0.55, F + 0.55);
    // the parapet's streaks down the street face, here and there
    for (let i = 0; i <= n; i++) if (rand() < 0.6) { const u = i === 0 ? a + 0.7 : i === n ? b - 0.7 : a + i * (b - a) / n; onFace(bag, 'plaster_streak', axis, p, sg, u - 0.18, u + 0.18, Math.max(F + 1.0, top - 1.0 - rand() * 1.4), top - 0.02, 0.004, 0.012); }
  }
  damp(bag, 'z', z1, 1, x0, x1, yb + 0.55, F + 0.5, [[dc - dw / 2 - 0.25, dc + dw / 2 + 0.25]]);
  // the court faces: the damp low down, the spouts from the roofs into the court
  damp(bag, 'z', zc0, 1, xc0, xc1, F, F + 0.45, open ? [[nDoor - 1.0, nDoor + 1.0], [nDoor - 2.6, nDoor - 1.5], [nDoor + 1.5, nDoor + 2.6]] : [[nDoor - 0.8, nDoor + 0.8]]);
  spout(bag, 'z', zc0, 1, xc1 - 0.45, hN, 1.6 + rand());
  if (hasE) spout(bag, 'x', xc1, -1, zc0 + 0.9, hE, 1.2 + rand());
  // the stair to the roofs along the west range's court face, rising north to its roof
  const sx0 = xc0, sx1 = xc0 + 0.85, sLen = Math.min(zc1 - zc0 - 1.4, (hW - F) / 0.2 * 0.26), sz1 = zc1 - 0.2, sz0 = sz1 - sLen, nst = Math.round((hW - F) / 0.2);
  for (let k = 0; k < nst; k++) { const t1 = (k + 1) / nst; bag.add(L, box(sx0, F, sz1 - sLen * t1, sx1, F + (hW - F) * t1, sz1 - sLen * k / nst)); }
  if (open) col.ramp([sx0, sz0, sx1, sz1], F, hW, 'n'); else col.rect([sx0, sz0, sx1, sz1], F, F + 0.6);
  // the cistern's mouth: a round stone head, its lid, a channel from the spout
  const cx = xc1 - 1.3, cz = zc0 + 1.4;
  if (xc1 - xc0 > 3.6 && zc1 - zc0 > 3.4) {
    bag.add(CUT, lathe([[0.34, 0], [0.46, 0.04], [0.46, 0.5], [0.4, 0.56], [0.28, 0.56], [0.28, 0.4], [0.001, 0.4]], 14, null, cx, F, cz));
    bag.add(L, lathe([[0.32, 0], [0.32, 0.07], [0.12, 0.1], [0.1, 0.16], [0.001, 0.17]], 12, null, cx, F + 0.54, cz));
    col.circle(cx, cz, 0.48, F, F + 0.6);
    // the oven in the corner by the kitchen: a clay dome on its hearth, the lid on its mouth, ashes before it
    const ox = xc1 - 0.85, oz = zc1 - 0.95;
    bag.add('mud_plaster', lathe([[0.55, 0], [0.56, 0.18], [0.48, 0.42], [0.3, 0.58], [0.16, 0.62], [0.16, 0.66], [0.001, 0.66]], 14, null, ox, F, oz));
    bag.add('pottery_dark', lathe([[0.18, 0], [0.18, 0.03], [0.05, 0.06], [0.001, 0.08]], 10, null, ox, F + 0.66, oz));
    bag.add('basalt', box(ox - 0.7, F, oz - 0.95, ox + 0.2, F + 0.015, oz - 0.5));
    col.circle(ox, oz, 0.56, F, F + 0.66);
  }
  // a small plastered dome over the main room of some one-storey houses
  if (!two && !open && rand() < 0.45) { const ccx = (x0 + x1) / 2, ccz = z0 + dN / 2, r = Math.min(dN, W) * 0.32; bag.add('plaster', lathe([[r, 0], [r * 0.9, r * 0.45], [r * 0.55, r * 0.85], [0.001, r]], 14, null, ccx, hN + 0.05, ccz)); bag.add(L, lathe([[r + 0.12, 0], [r + 0.12, 0.25], [r, 0.25]], 14, null, ccx, hN - 0.2, ccz)); }
}

/** The ranges of an open house: the main room on the north and the store on the west hollow, with their ceilings of beams; the kitchen range solid. */
function hollowRanges(ctx, el, { x0, z0, x1, z1, F, yb, T, N, Wr, Er, hN, hW, hE }) {
  const { bag, col, lights } = ctx, C = F + 3.3;
  const wall = (r, y1 = hN) => { bag.add(L, box(r[0], yb, r[1], r[2], y1, r[3])); col.rect(r, yb, y1); };
  // the main room: walls, its door and two windows onto the court
  const [nx0, nz0, nx1, nz1] = N, mid = (x0 + x1) / 2, dw = 1.2, dh = 2.3;
  wall([nx0, nz0, nx1, nz0 + T]); wall([nx0, nz0 + T, nx0 + T, nz1]); wall([nx1 - T, nz0 + T, nx1, nz1]);
  const ws = [[mid - dw / 2, mid + dw / 2, F, F + dh], [mid - 2.5, mid - 1.6, F + 1.25, F + 2.2], [mid + 1.6, mid + 2.5, F + 1.25, F + 2.2]];
  let u = nx0 + T;
  for (const [a, b, ya, yt] of [...ws].sort((p, q) => p[0] - q[0])) {
    bag.add(L, box(u, yb, nz1 - T, a, hN, nz1)); col.rect([u, nz1 - T, a, nz1], yb, hN);
    bag.add(L, box(a, yb, nz1 - T, b, ya, nz1)); if (ya > F) col.rect([a, nz1 - T, b, nz1], yb, ya);
    bag.add(L, box(a, yt, nz1 - T, b, hN, nz1));
    u = b;
  }
  bag.add(L, box(u, yb, nz1 - T, nx1 - T, hN, nz1)); col.rect([u, nz1 - T, nx1 - T, nz1], yb, hN);
  doorway(bag, 'z', nz1, 1, mid, dw, F, dh, false);
  for (const [a, b, ya, yt] of ws.slice(1)) {
    onFace(bag, CUT, 'z', nz1, 1, a - 0.12, b + 0.12, ya - 0.12, ya, 0, 0.08);
    // a wooden grille in each window
    for (let k = 1; k < 4; k++) bag.add('cedar', box(a + (b - a) * k / 4 - 0.025, ya, nz1 - T / 2 - 0.025, a + (b - a) * k / 4 + 0.025, yt, nz1 - T / 2 + 0.025));
    for (let k = 1; k < 4; k++) bag.add('cedar', box(a, ya + (yt - ya) * k / 4 - 0.025, nz1 - T / 2 - 0.025, b, ya + (yt - ya) * k / 4 + 0.025, nz1 - T / 2 + 0.025));
  }
  // the floor, the ceiling of beams under reeds, the roof's mass over it
  const ri = [nx0 + T, nz0 + T, nx1 - T, nz1 - T];
  bag.add('flagstone', box(ri[0], yb, ri[1], ri[2], F, ri[3])); col.floor(ri, F);
  for (let x = ri[0] + 0.35; x < ri[2] - 0.2; x += 0.62) bag.add('cedar', box(x - 0.09, C - 0.2, ri[1], x + 0.09, C, ri[3]));
  bag.add('reed_mat', box(ri[0], C, ri[1], ri[2], C + 0.04, ri[3]));
  bag.add(L, box(nx0, C + 0.04, nz0, nx1, hN, nz1)); col.floor([nx0, nz0, nx1, nz1], hN);
  parapets(bag, N, hN);
  // its things: mats over the floor, a mattress and cushions along three walls, bolsters, a chest, a tray on its stand, the lamp in a niche
  bag.add('reed_mat', box(ri[0] + 0.1, F, ri[1] + 0.1, ri[2] - 0.1, F + 0.02, ri[3] - 0.15));
  const cl = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_red'];
  bag.add('cloth_indigo', box(ri[0] + 0.05, F + 0.02, ri[1] + 0.05, ri[2] - 0.05, F + 0.16, ri[1] + 0.85));
  bag.add('cloth_red', box(ri[0] + 0.05, F + 0.02, ri[1] + 0.85, ri[0] + 0.85, F + 0.16, ri[3] - 0.3));
  bag.add('cloth_red', box(ri[2] - 0.85, F + 0.02, ri[1] + 0.85, ri[2] - 0.05, F + 0.16, ri[3] - 0.3));
  for (let x = ri[0] + 1.1, k = 0; x < ri[2] - 1.0; x += 0.9, k++) bag.add(cl[k % 4], lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.35], [0.12, 0.68], [0.001, 0.7]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(x + 0.35, F + 0.3, ri[1] + 0.22));
  bag.add('cedar', box(ri[2] - 1.5, F, ri[3] - 0.62, ri[2] - 0.4, F + 0.62, ri[3] - 0.08));
  bag.add('cedar', box(ri[2] - 1.54, F + 0.62, ri[3] - 0.66, ri[2] - 0.36, F + 0.66, ri[3] - 0.04));
  bag.add('iron', box(ri[2] - 1.5, F + 0.3, ri[3] - 0.64, ri[2] - 0.4, F + 0.35, ri[3] - 0.62));
  const tx = mid, tz = (ri[1] + ri[3]) / 2 + 0.2;
  for (const s of [-1, 1]) bag.add('cedar', box(tx - 0.3, F + 0.02, tz + s * 0.24 - 0.02, tx + 0.3, F + 0.34, tz + s * 0.24 + 0.02).rotateY(0));
  bag.add('bronze', lathe([[0.001, 0], [0.42, 0], [0.44, 0.04], [0.42, 0.05], [0.001, 0.02]], 24, null, tx, F + 0.34, tz));
  bag.add('pottery_dark', lathe([[0.04, 0], [0.07, 0.04], [0.06, 0.09], [0.035, 0.12], [0.04, 0.14], [0.001, 0.14]], 10, null, tx + 0.15, F + 0.37, tz - 0.05));
  // the lamp's niche in the back wall, the clay lamp in it burning; the soot over it
  const lx = mid - 1.8, lz = ri[1];
  bag.add('opening', box(lx - 0.25, F + 1.5, lz - 0.01, lx + 0.25, F + 1.95, lz + 0.005));
  bag.add(CUT, box(lx - 0.3, F + 1.45, lz, lx + 0.3, F + 1.5, lz + 0.12));
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.01], [0.06, 0.03], [0.03, 0.045], [0.001, 0.05]], 10, null, lx, F + 1.5, lz + 0.06));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.04]], 6, null, lx + 0.055, F + 1.55, lz + 0.06));
  bag.add('pottery_dark', box(lx - 0.22, F + 1.95, lz + 0.001, lx + 0.22, F + 2.6, lz + 0.006));
  lights?.push({ at: [lx + 0.05, F + 1.6, lz + 0.2], color: '#ffae5e', intensity: 2.2, distance: 6 });
  // the store on the west: walls, its door, the floor; the roof over it
  const [wx0, wz0, wx1, wz1] = Wr, wc = wz0 + 1.0;
  wall([wx0, wz0, wx0 + T, wz1], hW); wall([wx0 + T, wz1 - T, wx1, wz1], hW);
  for (const [a, b] of [[wz0, wc - 0.5], [wc + 0.5, wz1 - T]]) { bag.add(L, box(wx1 - T, yb, a, wx1, hW, b)); col.rect([wx1 - T, a, wx1, b], yb, hW); }
  bag.add(L, box(wx1 - T, F + 2.0, wc - 0.5, wx1, hW, wc + 0.5));
  doorway(bag, 'x', wx1, 1, wc, 1.0, F, 2.0, false);
  const si = [wx0 + T, wz0, wx1 - T, wz1 - T];
  bag.add('flagstone', box(si[0], yb, si[1], si[2], F, si[3])); col.floor(si, F);
  for (let z = si[1] + 0.4; z < si[3] - 0.2; z += 0.66) bag.add('cedar', box(si[0], C - 0.18, z - 0.08, si[2], C, z + 0.08));
  bag.add('reed_mat', box(si[0], C, si[1], si[2], C + 0.04, si[3]));
  bag.add(L, box(wx0, C + 0.04, wz0, wx1, hW, wz1)); col.floor(Wr, hW);
  parapets(bag, Wr, hW, 0.55, 0.28, 'n');
  // the kitchen range on the east: solid, its door and a smoke hole's soot over it
  bag.add(L, box(Er[0], yb, Er[1], Er[2], hE, Er[3])); col.rect(Er, yb, hE); col.floor(Er, hE);
  parapets(bag, Er, hE, 0.55, 0.28, 'n');
  doorway(bag, 'x', Er[0], -1, (Er[1] + Er[3]) / 2, 0.9, F, 2.0);
  onFace(bag, 'pottery_dark', 'x', Er[0], -1, (Er[1] + Er[3]) / 2 - 0.5, (Er[1] + Er[3]) / 2 + 0.5, F + 2.75, hE - 0.05, 0.004, 0.01);
}
