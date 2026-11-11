// The houses and yards of a mountain village of north Shanxi (Mount Wutai; docs/settlements/tang-wutai.md §5):
// walls of rubble stone, rammed earth or grey brick; the flat earth roof with its parapet and drain spouts, the
// single-pitch roof (yipo shui) falling to the back, the brick-arched dwelling (gu yao) with its fanlights; the
// big square lattice windows papered from inside, the plank door, corn and chillies hung to dry, the kang's
// chimney; the walled yard with its gate; a well, a stone roller mill, a drying rack. Elements of the
// `chinese` style, built from axis-aligned boxes and a few sloping slabs; every piece sits on what holds it.

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function hexa(out, b, t) {
  const tris = [];
  const q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}

/**
 * The local frame of a rectangle that faces `front` ('n', 's', 'e', 'w'): u along the front (left to right
 * as seen from outside), v from the front inward, P(u, v) → [x, z], R(u0, v0, u1, v1) → a world rect.
 */
export function frame(rect, f) {
  const [x0, z0, x1, z1] = rect, along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { L, D, P, R };
}
/** The direction a local axis points in the world, as 'n' 's' 'e' 'w'. */
export function dirOf(fr, du, dv) {
  const a = fr.P(0, 0), b = fr.P(du, dv), dx = b[0] - a[0], dz = b[1] - a[1];
  return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n');
}

/** Shared drawing helpers for one building: B (a box in the local frame), S (a sloping slab), pot. */
function tools(el, bag, col) {
  const fr = frame(el.rect, el.front), { P, R } = fr;
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  // a slab whose top slopes: heights ya at v = v0 and yb at v = v1, thickness th
  const S = (m, u0, v0, u1, v1, ya, yb, th) => {
    const t = [], pt = (u, v, y) => { const p = P(u, v); return [p[0], y, p[1]]; };
    hexa(t, [pt(u0, v0, ya - th), pt(u1, v0, ya - th), pt(u1, v1, yb - th), pt(u0, v1, yb - th)], [pt(u0, v0, ya), pt(u1, v0, ya), pt(u1, v1, yb), pt(u0, v1, yb)]);
    bag.add(m, fromTriangles(t));
  };
  // a sloping solid between ground-level bottom and the top plane (walls of a single-pitch house)
  const W = (m, u0, v0, u1, v1, yb, yf, yk) => {
    const t = [], pt = (u, v, y) => { const p = P(u, v); return [p[0], y, p[1]]; };
    hexa(t, [pt(u0, v0, yb), pt(u1, v0, yb), pt(u1, v1, yb), pt(u0, v1, yb)], [pt(u0, v0, yf), pt(u1, v0, yf), pt(u1, v1, yk), pt(u0, v1, yk)]);
    bag.add(m, fromTriangles(t));
  };
  const pot = (m, u, v, r, h, ya = 0) => { const p = P(u, v); bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, p[0], ya, p[1])); };
  return { fr, B, S, W, pot };
}

/**
 * wutai_house { rect, y (the highest ground under it), foot (the lowest), front ('n' 's' 'e' 'w'), seed,
 * kind: 'flat' | 'shed' | 'arch', open (flat: the inside can be entered), nb (bays, default by width) }
 */
export function wutaiHouse(el, { bag, col }) {
  const kind = el.kind || 'flat', rand = rng((el.seed || 1) + 13), { fr, B, S, W, pot } = tools(el, bag, col);
  const { L, D } = fr, y = el.y, foot = Math.min(el.foot ?? y, y), F = y + 0.4;
  const nb = el.nb ?? Math.max(2, Math.round(L / 3.2)), bay = L / nb;
  const kindOfWall = rand(), stone = kindOfWall < 0.38, brick = !stone && kindOfWall < 0.62;
  const wallMat = el.wallMat ?? (stone ? 'schist_rubble' : brick ? 'brick_grey' : (rand() < 0.5 ? 'earth_wall' : 'mud_plaster'));
  const Hf = kind === 'arch' ? 3.7 : kind === 'shed' ? 3.5 : 3.2, Hk = kind === 'shed' ? Hf - 0.95 : Hf;
  // the footing: a stone plinth up to the floor, a step before the door
  B('schist_rubble', -0.1, -0.1, L + 0.1, D + 0.1, foot - 0.4, F - 0.02, true);
  // the walls: rubble dado (earth houses), the wall above; the open flat house is hollow
  const dado = !stone && kind !== 'arch';
  const wy0 = dado ? F + 0.9 : F;
  if (dado) B('schist_rubble', -0.04, -0.04, L + 0.04, D + 0.04, F - 0.02, F + 0.9, false);
  const door = el.door ?? Math.floor(nb / 2), dw = 1.15, du = (door + 0.5) * bay;
  if (el.open && kind === 'flat') openFlat(el, { B, fr, col, F, Hf, wallMat, wy0, du, dw, dado, pot });
  else if (kind === 'shed') W(wallMat, 0, 0, L, D, wy0, F + Hf, F + Hk), col.rect(fr.R(0, 0, L, D), F, F + Hk);
  else if (kind === 'arch') B(wallMat, 0, 0.28, L, D, wy0, F + Hf, true);
  else B(wallMat, 0, 0, L, D, wy0, F + Hf, true);
  if (dado) col.rect(fr.R(-0.04, -0.04, L + 0.04, D + 0.04), F, F + 0.9);
  // ── the front: papered lattice windows, the plank door, the lintel over it
  const top = F + Hf;
  if (kind === 'arch') archFront(el, { B, fr, F, Hf, nb, bay, door, wallMat, rand });
  else {
    for (let k = 0; k < nb; k++) {
      const uc = (k + 0.5) * bay;
      if (k === door) { doorLeaf(B, uc, dw, F, 2.1); continue; }
      // a big square window of lattice over a sill, in a timber frame, pushed 4 cm out of the wall
      const ww = Math.min(1.9, bay - 0.9), wh = 1.35, wb = F + 0.95;
      B('timber', uc - ww / 2 - 0.08, -0.07, uc + ww / 2 + 0.08, -0.0, wb - 0.08, wb + wh + 0.08);
      B(el.open ? 'lattice' : 'lattice', uc - ww / 2, -0.095, uc + ww / 2, -0.07, wb, wb + wh);
      B('timber', uc - ww / 2 - 0.14, -0.2, uc + ww / 2 + 0.14, -0.0, wb - 0.14, wb - 0.08);   // the sill board
      // (the lattice is fixed; its bars are the material's own)
    }
  }
  // ── the roof
  if (kind === 'flat' || kind === 'arch') {
    const pa = 0.38;
    B('mud_plaster', -0.12, -0.12, L + 0.12, D + 0.12, top, top + 0.3, true);
    // the parapet round the front and sides, a coping of tiles over it
    for (const [u0, v0, u1, v1] of [[-0.12, -0.12, L + 0.12, 0.06], [-0.12, -0.12, 0.06, D + 0.12], [L - 0.06, -0.12, L + 0.12, D + 0.12]]) {
      B(brick || kind === 'arch' ? 'brick_grey' : wallMat === 'schist_rubble' ? 'schist_rubble' : 'brick_grey', u0, v0, u1, v1, top + 0.3, top + 0.3 + pa, false);
      B('tile_grey', u0 - 0.04, v0 - 0.04, u1 + 0.04, v1 + 0.04, top + 0.3 + pa, top + 0.3 + pa + 0.07, false);
    }
    // the stone spouts that drain the roof over the front
    for (const u of [bay * 0.5, L - bay * 0.5]) B('limestone', u - 0.1, -0.5, u + 0.1, 0.0, top + 0.3, top + 0.38, false);
    // beam ends (the roof beams' heads) under the front edge
    if (kind === 'flat') for (let u = 0.5; u < L - 0.3; u += 0.6) B('timber', u - 0.07, -0.16, u + 0.07, -0.12, top - 0.16, top - 0.02);
    // the chimney of the kang's flue at one end, a stack of kaoliang stalks drying on the roof
    const cu = rand() < 0.5 ? 0.5 : L - 0.5, cv = D - 0.6;
    B('brick_grey', cu - 0.32, cv - 0.32, cu + 0.32, cv + 0.32, top + 0.3, top + 1.7, false); B('tile_grey', cu - 0.4, cv - 0.4, cu + 0.4, cv + 0.4, top + 1.7, top + 1.78, false);
    if (rand() < 0.6) B('thatch', L * 0.3, D * 0.45, L * 0.3 + 1.6, D * 0.45 + 0.9, top + 0.3, top + 0.75, false);
  } else {
    // single-pitch roof: tiles over a board deck, falling to the back (+v); eaves 0.6 front, 0.35 back and sides
    const yf = F + Hf + 0.28, yk = F + Hk + 0.28, ov = (v) => v, k0 = -0.6, k1 = D + 0.35, slope = (yk - yf) / D;
    const yAt = (v) => yf + slope * ov(v);
    S('timber', -0.35, k0, L + 0.35, k1, yAt(k0), yAt(k1), 0.1);
    S('tile_grey', -0.38, k0 - 0.02, L + 0.38, k1 + 0.02, yAt(k0) + 0.14, yAt(k1) + 0.14, 0.14);
    // the ridge cap on the high edge
    B('tile_grey', -0.38, -0.08, L + 0.38, 0.25, yAt(0) + 0.1, yAt(0) + 0.3, false);
    const cu = rand() < 0.5 ? 0.7 : L - 0.7;
    B('brick_grey', cu - 0.3, D * 0.62 - 0.3, cu + 0.3, D * 0.62 + 0.3, yAt(D * 0.62) + 0.12, yAt(D * 0.62) + 1.2, false);
  }
  // ── corn cobs and strings of chillies hung from the front to dry (autumn's goods), a water vat by the door
  if (!el.bare) {
    const hang = rand() < 0.7, cols = ['paint_ochre', 'paint_ochre', 'lacquer_red'];
    if (hang) for (let k = 0; k < nb; k++) if (k !== door && rand() < 0.7) {
      const uc = (k + 0.5) * bay, m = cols[Math.floor(rand() * cols.length)], w = m === 'lacquer_red' ? 0.05 : 0.16, n = m === 'lacquer_red' ? 9 : 5;
      for (const e of [-0.45, 0, 0.45]) for (let j = 0; j < n; j++) B(m, uc + e - w / 2, -0.38, uc + e + w / 2, -0.38 + w, top - 0.5 - j * (m === 'lacquer_red' ? 0.13 : 0.3), top - 0.5 - j * (m === 'lacquer_red' ? 0.13 : 0.3) + (m === 'lacquer_red' ? 0.18 : 0.34), false);
      B('timber', uc - 0.6, -0.4, uc + 0.6, -0.34, top - 0.5, top - 0.44, false);
    }
  }
  void pot;
}
function doorLeaf(B, uc, dw, F, h) {
  // the frame and lintel, two leaves of planks (battens across), a threshold stone with its step
  B('timber', uc - dw / 2 - 0.1, -0.1, uc - dw / 2, 0.0, F, F + h + 0.12);
  B('timber', uc + dw / 2, -0.1, uc + dw / 2 + 0.1, 0.0, F, F + h + 0.12);
  B('timber', uc - dw / 2 - 0.12, -0.12, uc + dw / 2 + 0.12, 0.0, F + h, F + h + 0.14);
  B('wood_dark', uc - dw / 2, -0.06, uc, 0.0, F + 0.02, F + h);
  B('wood_dark', uc, -0.06, uc + dw / 2, 0.0, F + 0.02, F + h);
  for (const hy of [0.4, 1.0, 1.65]) B('timber', uc - dw / 2, -0.09, uc + dw / 2, -0.06, F + hy, F + hy + 0.09);
  B('iron', uc - 0.08, -0.095, uc + 0.08, -0.06, F + 1.0, F + 1.16);
  B('limestone', uc - dw / 2 - 0.25, -0.65, uc + dw / 2 + 0.25, 0.0, F - 0.42, F - 0.02, false);
  B('limestone', uc - dw / 2 - 0.1, -0.2, uc + dw / 2 + 0.1, 0.0, F - 0.02, F + 0.04, false);
}

/** The brick-arched dwelling's front: a wall of piers and arches (a door and window under each), fanlights over. */
function archFront(el, { B, fr, F, Hf, nb, bay, door, wallMat, rand }) {
  const top = F + Hf, ring = 'brick_grey';
  for (let k = 0; k < nb; k++) {
    const uc = (k + 0.5) * bay, hw = Math.min(1.05, bay / 2 - 0.35), spring = F + 2.1, rise = 0.75, isDoor = k === door;
    const bot = isDoor ? F : F + 0.9;
    // the wall over and beside the opening, built in thin strips following the arch
    const n = Math.round(2 * hw / 0.07);
    for (let i = 0; i < n; i++) {
      const u0 = uc - hw + i * (2 * hw / n), u1 = u0 + 2 * hw / n, um = (u0 + u1) / 2, t = (um - uc) / hw;
      const yA = spring + rise * Math.sqrt(Math.max(0, 1 - t * t));
      B(ring, u0, 0, u1, 0.28, yA, yA + 0.2, false);                               // the arch ring of brick
      B(wallMat, u0, 0, u1, 0.28, yA + 0.2, top, false);                            // the wall over it (up to the roof)
      // the fanlight: a lattice fan between the lintel line and the arch, set back
      B('lattice', u0, 0.1, u1, 0.16, spring + 0.08, yA, false);
    }
    // the piers between openings
    const pu0 = k === 0 ? 0 : (k) * bay - (bay / 2 - hw) + 0, pu1 = uc - hw;
    B(wallMat, k === 0 ? 0 : (k - 0.5) * bay + hw, 0, uc - hw, 0.28, F, top, false);
    if (k === nb - 1) B(wallMat, uc + hw, 0, fr.L, 0.28, F, top, false);
    void pu0; void pu1;
    // under the fanlight: the door (plank, two leaves) or a lattice window over a stone sill wall
    if (isDoor) { B('wood_dark', uc - hw, 0.1, uc, 0.16, F, spring + 0.08); B('wood_dark', uc, 0.1, uc + hw, 0.16, F, spring + 0.08); B('timber', uc - 0.03, 0.08, uc + 0.03, 0.18, F, spring + 0.08); B('limestone', uc - hw - 0.1, -0.5, uc + hw + 0.1, 0.0, F - 0.4, F - 0.02, false); }
    else { B('lattice', uc - hw, 0.1, uc + hw, 0.16, bot + 0.04, spring + 0.08, false); B(wallMat, uc - hw, 0, uc + hw, 0.28, F, bot, false); B('timber', uc - hw - 0.08, -0.08, uc + hw + 0.08, 0.0, bot - 0.06, bot + 0.04, false); }
  }
  // the roof's strip above the arches' crowns
  B('timber', -0.1, -0.12, fr.L + 0.1, 0.0, top - 0.14, top, false);
}

/** The inside of an open flat-roofed house: door cut in the front, the kang, stove, jars, chest; boarded ceiling. */
function openFlat(el, { B, fr, col, F, Hf, wallMat, wy0, du, dw, dado, pot }) {
  const { L, D } = fr, T = 0.34, top = F + Hf;
  // (the hollow shell is the walls on the four sides; the front has the way through)
  B(wallMat, 0, D - T, L, D, wy0, top, true); B(wallMat, 0, T, T, D - T, wy0, top, true); B(wallMat, L - T, T, L, D - T, wy0, top, true);
  B(wallMat, 0, 0, du - dw / 2 - 0.1, T, wy0, top, true); B(wallMat, du + dw / 2 + 0.1, 0, L, T, wy0, top, true); B(wallMat, du - dw / 2 - 0.1, 0, du + dw / 2 + 0.1, T, F + 2.15, top, false);
  if (dado) for (const [a, b, c, d] of [[0, D - T, L, D], [0, T, T, D - T], [L - T, T, L, D - T], [0, 0, du - dw / 2 - 0.1, T], [du + dw / 2 + 0.1, 0, L, T]]) B('schist_rubble', a, b, c, d, F, wy0, true);
  col.floor(fr.R(0, 0, L, D), F);
  col.rect(fr.R(0, 0, L, D), top - 0.12, top + 0.4);
  B('brick_grey', T, T, L - T, D - T, F - 0.1, F + 0.01);
  B('timber', T, T, L - T, D - T, top - 0.07, top - 0.02);
  for (let u = T + 0.6; u < L - T; u += 1.0) B('wood_dark', u - 0.09, T, u + 0.09, D - T, top - 0.26, top - 0.07);
  // the kang along the back wall (its mat, a low table, folded quilts), the stove at the end feeding it
  B('brick_grey', T, D - T - 1.9, L - T - 1.3, D - T, F, F + 0.62, true); B('reed_mat', T + 0.05, D - T - 1.85, L - T - 1.35, D - T - 0.05, F + 0.62, F + 0.64);
  B('lacquer_chestnut', L / 2 - 0.6, D - T - 1.3, L / 2 + 0.2, D - T - 0.7, F + 0.86, F + 0.91);
  for (const [a, b] of [[-0.55, -1.25], [0.15, -1.25], [-0.55, -0.75], [0.15, -0.75]]) B('lacquer_chestnut', L / 2 + a, D - T + b, L / 2 + a + 0.04, D - T + b + 0.04, F + 0.64, F + 0.86);
  B('cloth_indigo', T + 0.1, D - T - 0.75, T + 1.4, D - T - 0.1, F + 0.64, F + 0.85); B('cloth_red', T + 1.45, D - T - 0.75, T + 2.5, D - T - 0.1, F + 0.64, F + 0.82);
  B('brick_grey', L - T - 1.25, D - T - 1.3, L - T, D - T, F, F + 0.8, true); pot('iron', L - T - 0.65, D - T - 0.65, 0.36, 0.26, F + 0.8);
  B('brick_grey', L - T - 0.6, D - T - 0.45, L - T - 0.25, D - T - 0.05, F + 0.8, top);
  for (const u of [L - T - 0.55, L - T - 1.25]) pot('glaze_green', u, T + 0.5, 0.3, 0.8, F);
  B('lacquer_chestnut', T + 0.1, T + 0.2, T + 1.0, T + 0.75, F, F + 0.72, true);
  B('lacquer_chestnut', T + 1.2, T + 0.05, T + 2.0, T + 0.4, F + 0.9, F + 1.0, false);          // a shelf of bowls by the window
  B('timber', T + 0.05, D / 2 - 0.1, T + 0.12, D / 2 + 0.1, F + 1.6, F + 2.0, false);
}

/**
 * wutai_yard { rect, front, hc: [the ground's height at the four corners (rect order x0z0, x1z0, x0z1, x1z1)], gate: [u, w], seed }:
 * the yard's wall — rammed earth on a stone footing, 2 m high, a coping of tiles — with the gate in the lane's
 * side: two posts, a lintel, a small tiled roof falling outward and two leaves of plank open inward.
 */
export function wutaiYard(el, { bag, col }) {
  const { fr, B, S } = tools(el, bag, col), { L, D } = fr, [h00, h10, h01, h11] = el.hc;
  const [x0, z0, x1, z1] = el.rect, g = (x, z) => { const a = (x - x0) / (x1 - x0), b = (z - z0) / (z1 - z0); return (h00 * (1 - a) + h10 * a) * (1 - b) + (h01 * (1 - a) + h11 * a) * b; };
  const [gu, gw] = el.gate ?? [L / 2, 2.2], T = 0.5;
  // a wall run in the local frame along u (at v) or along v (at u), in steps of 2 m following the ground
  const run = (a0, a1, fixed, alongU, skip = null) => {
    for (let a = a0; a < a1 - 1e-6; a += 2) {
      const b = Math.min(a1, a + 2), m = (a + b) / 2;
      if (skip && m > skip[0] && m < skip[1]) continue;
      const [x, z] = alongU ? fr.P(m, fixed) : fr.P(fixed, m), yy = g(x, z) - 0.05;
      const r = alongU ? [a, fixed - T / 2, b, fixed + T / 2] : [fixed - T / 2, a, fixed + T / 2, b];
      B('schist_rubble', r[0], r[1], r[2], r[3], yy - 0.4, yy + 0.55, true);
      B(el.wall ?? 'earth_wall', r[0] + 0.03, r[1] + 0.03, r[2] - 0.03, r[3] - 0.03, yy + 0.55, yy + 2.0, true);
      B('tile_grey', r[0] - 0.05, r[1] - 0.05, r[2] + 0.05, r[3] + 0.05, yy + 2.0, yy + 2.1, false);
    }
  };
  run(0, L, T / 2, true, [gu - gw / 2, gu + gw / 2]); run(0, L, D - T / 2, true); run(T / 2, D - T / 2, T / 2, false); run(T / 2, D - T / 2, L - T / 2, false);
  // the gate: posts, lintel, roof, the open leaves
  const [x, z] = fr.P(gu, T / 2), yy = g(x, z) - 0.05, hw = gw / 2;
  for (const s of [-1, 1]) { B('timber', gu + s * (hw + 0.14) - 0.14, -0.1, gu + s * (hw + 0.14) + 0.14, T + 0.1, yy - 0.2, yy + 2.5, true); B('schist_rubble', gu + s * (hw + 0.14) - 0.24, -0.2, gu + s * (hw + 0.14) + 0.24, T + 0.2, yy - 0.4, yy - 0.2, false); }
  B('timber', gu - hw - 0.4, -0.1, gu + hw + 0.4, T + 0.1, yy + 2.5, yy + 2.8, false);
  S('timber', gu - hw - 0.6, -0.9, gu + hw + 0.6, T + 0.7, yy + 3.05, yy + 2.55, 0.08);
  S('tile_grey', gu - hw - 0.64, -0.94, gu + hw + 0.64, T + 0.74, yy + 3.17, yy + 2.67, 0.12);
  B('tile_grey', gu - hw - 0.64, T / 2 - 0.1, gu + hw + 0.64, T / 2 + 0.1, yy + 3.15, yy + 3.3, false);
  for (const s of [-1, 1]) B('wood_dark', gu + s * hw - 0.0 - (s > 0 ? 0.05 : 0), T, gu + s * hw + (s > 0 ? 0 : 0.05), T + 0.9 * 0 + 0.06, yy, yy + 2.1, false);
  B('limestone', gu - hw, -0.5, gu + hw, T, yy - 0.5, yy - 0.04, false);                       // the threshold
}

/** wutai_well { at, y, rot }: a well of stone with a stone kerb and a wooden windlass on two posts, a bucket and rope. */
export function wutaiWell({ at: [x, z], y }, { bag, col }) {
  bag.add('schist_rubble', lathe([[0.95, 0], [0.95, 0.35], [0.7, 0.36], [0.7, 0.34]], 14, null, x, y - 0.2, z));
  bag.add('limestone', lathe([[0.82, 0.3], [0.82, 0.62], [0.52, 0.62], [0.52, 0.3]], 14, null, x, y, z));
  bag.add('wood_dark', lathe([[0.5, 0.3], [0.5, 0.42], [0.001, 0.42]], 14, null, x, y - 0.12, z));      // the dark of the water
  // the windlass along x (the well's frame is not turned): two posts, a beam, the roller with its crank
  for (const sg of [-1, 1]) bag.add('timber', box(x + sg * 0.7 - 0.07, y + 0.6, z - 0.07, x + sg * 0.7 + 0.07, y + 2.0, z + 0.07));
  bag.add('timber', box(x - 0.8, y + 1.95, z - 0.06, x + 0.8, y + 2.05, z + 0.06));
  bag.add('timber', lathe([[0.1, -0.6], [0.1, 0.6], [0.001, 0.6]], 8).rotateZ(Math.PI / 2).translate(x, y + 1.75, z));
  bag.add('timber', box(x + 0.62, y + 1.5, z - 0.02, x + 0.66, y + 1.78, z + 0.3));
  bag.add('iron', box(x - 0.02, y + 0.9, z - 0.02, x + 0.02, y + 1.75, z + 0.02));
  bag.add('wood_dark', lathe([[0.1, 0], [0.13, 0.2], [0.001, 0.2]], 8, null, x, y + 0.7, z));
  col.circle(x, z, 0.95, y - 0.2, y + 0.65);
}

/** wutai_mill { at, y }: a stone roller mill (nian): a round bed of stone, the roller of stone on a wooden pole turned about a post. */
export function wutaiMill({ at: [x, z], y, rot = 0 }, { bag, col }) {
  bag.add('limestone', lathe([[1.4, 0], [1.4, 0.34], [1.15, 0.38], [0.2, 0.3], [0.001, 0.3]], 20, null, x, y, z));
  bag.add('granite_grey', lathe([[0.001, 0.3], [0.2, 0.3], [0.2, 0.95], [0.001, 0.95]], 10, null, x, y, z));
  const r = lathe([[0.001, -0.25], [0.52, -0.25], [0.52, 0.25], [0.001, 0.25]], 16);
  r.rotateZ(Math.PI / 2); r.rotateY(-rot); r.translate(x + Math.cos(rot) * 0.65, y + 0.55, z + Math.sin(rot) * 0.65);
  bag.add('granite_grey', r);
  const p = box(-0.05, -0.05, -0.04, 1.9, 0.05, 0.04); p.rotateY(-rot); p.translate(x, y + 0.88, z); bag.add('timber', p);
  col.circle(x, z, 1.4, y, y + 0.4);
}

/** wutai_rack { rect, y, rot }: a frame of poles with cobs of corn and strings of red chillies hung in rows to dry. */
export function wutaiRack({ at: [x, z], y, rot = 0, len = 3.6 }, { bag }) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (a, b = 0) => [x + a * c - b * s, z + a * s + b * c];
  const bx = (m, a0, b0, a1, b1, ya, yb) => { const p = P(a0, b0), q = P(a1, b1); bag.add(m, box(Math.min(p[0], q[0]), ya, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yb, Math.max(p[1], q[1]))); };
  const e = Math.abs(c) > 0.5 ? [0.05, 0.05] : [0.05, 0.05];
  for (const a of [-len / 2, len / 2]) bx('timber', a - e[0], -0.05, a + e[0], 0.05, y, y + 2.2);
  bx('timber', -len / 2 - 0.1, -0.04, len / 2 + 0.1, 0.04, y + 2.1, y + 2.18); bx('timber', -len / 2 - 0.1, -0.04, len / 2 + 0.1, 0.04, y + 1.2, y + 1.26);
  for (let a = -len / 2 + 0.35; a < len / 2 - 0.2; a += 0.32) { bx('paint_ochre', a - 0.07, -0.07, a + 0.07, 0.07, y + 1.4, y + 2.08); }
  for (let a = -len / 2 + 0.5; a < len / 2 - 0.2; a += 0.7) bx('lacquer_red', a - 0.03, -0.03, a + 0.03, 0.03, y + 0.7, y + 1.18);
}
export const villageElements = { wutai_house: wutaiHouse, wutai_yard: wutaiYard, wutai_well: wutaiWell, wutai_mill: wutaiMill, wutai_rack: wutaiRack };
