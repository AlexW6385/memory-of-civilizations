// The houses and yards of a mountain village of north Shanxi (Mount Wutai; docs/settlements/tang-wutai.md §5):
// walls of rubble stone, rammed earth or grey brick; the flat earth roof with its parapet and drain spouts, the
// single-pitch roof (yipo shui) falling to the back, the brick-arched dwelling (gu yao) with its fanlights; the
// big square lattice windows papered from inside, the plank door, corn and chillies hung to dry, the kang's
// chimney; the walled yard with its gate; a well, a stone roller mill, a drying rack. Elements of the
// `chinese` style, built from axis-aligned boxes and a few sloping slabs; every piece sits on what holds it.

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { tube, blob } from './statues.js';

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
  // the single-pitch roof falls toward the yard ("all the roofs are inclined toward the courtyard": the high wall is the back one)
  const Hf = kind === 'arch' ? 3.7 : kind === 'shed' ? 2.9 : 3.2, Hk = kind === 'shed' ? Hf + 0.95 : Hf;
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
    // the ridge cap on the high (back) edge
    B('tile_grey', -0.38, D - 0.1, L + 0.38, D + 0.3, yAt(D) + 0.1, yAt(D) + 0.3, false);
    const cu = rand() < 0.5 ? 0.7 : L - 0.7;
    B('brick_grey', cu - 0.3, D * 0.62 - 0.3, cu + 0.3, D * 0.62 + 0.3, yAt(D * 0.62) + 0.12, yAt(D * 0.62) + 1.2, false);
    // the roof's patches (the dry mountain climate: wind lifts the tiles, frost cracks them): replaced tiles darker than the old,
    // a patch of mud, a patch of straw, a few tiles gone; each kind at its own height over the tiles so that none lies in another's plane
    const wp = rng((el.seed || 1) + 91);
    for (let i = 0; i < 6; i++) {
      const u = 0.3 + wp() * (L - 1.4), v = 0.1 + wp() * (D - 0.9), w = 0.5 + wp() * 0.7, d = 0.4 + wp() * 0.5, kd = i % 3;
      S(kd === 0 ? 'tile_dark' : kd === 1 ? 'mud_plaster' : 'thatch', u, v, u + w, v + d, yAt(v) + 0.17 + kd * 0.025, yAt(v + d) + 0.17 + kd * 0.025, 0.04);
    }
  }
  weather(el, { B, fr, F, Hf, kind, wallMat, door, nb, bay, stone, wy0, top: F + Hf, dado });
  if (kind === 'flat' || kind === 'arch') {
    // earth roofs: patches of repair on the mud, a stone roller left on it (to press the earth after rain), weeds in the parapet's foot
    const wp = rng((el.seed || 1) + 93), t0 = top + 0.3;
    for (let i = 0; i < 4; i++) { const u = 0.5 + wp() * (L - 2), v = 0.5 + wp() * (D - 1.5), w = 0.6 + wp() * 0.8, d = 0.5 + wp() * 0.7; B(i % 2 ? 'tile_grey' : 'thatch', u, v, u + w, v + d, t0, t0 + (i % 2 ? 0.03 : 0.05)); }
    if (wp() < 0.5) { const [x, z] = fr.P(L * (0.3 + wp() * 0.4), D * 0.4); const r = lathe([[0.001, -0.4], [0.2, -0.4], [0.2, 0.4], [0.001, 0.4]], 9); r.rotateZ(Math.PI / 2); r.translate(x, top + 0.3 + 0.2, z); bag.add('granite_grey', r); }
  }
  // ── corn cobs and strings of chillies hung from the front to dry (autumn's goods), a water vat by the door
  if (!el.bare) {
    const hang = rand() < 0.7, cols = ['paint_ochre', 'paint_ochre', 'lacquer_red'];
    if (hang) for (let k = 0; k < nb; k++) if (k !== door && rand() < 0.7) {
      const uc = (k + 0.5) * bay, m = cols[Math.floor(rand() * cols.length)], w = m === 'lacquer_red' ? 0.05 : 0.16, n = m === 'lacquer_red' ? 9 : 5;
      for (const e of [-0.45, 0, 0.45]) for (let j = 0; j < n; j++) { const red = m === 'lacquer_red', yb = top - 0.47 - j * (red ? 0.13 : 0.3), v0 = red ? -0.37 : -0.38; B(m, uc + e - w / 2, v0, uc + e + w / 2, v0 + w, yb - (red ? 0.18 : 0.34), yb, false); }
      B('timber', uc - 0.6, -0.4, uc + 0.6, -0.34, top - 0.5, top - 0.44, false);
    }
  }
  void pot;
}

/**
 * The weathering of a house's walls (the dry mountain climate: wind-driven rain and frost eat the earth at the foot, the
 * plaster falls and shows the adobe and the straw in it, the kang's smoke and the hearth's blacken the wall over the door and
 * the windows): patches proud of the wall by a few centimetres, each kind at its own offset (no two lie in one plane).
 */
function weather(el, { B, fr, F, Hf, kind, wallMat, door, nb, bay, stone, wy0, top, dado }) {
  const { L, D } = fr, wr = rng((el.seed || 1) + 77), earthy = wallMat === 'earth_wall' || wallMat === 'mud_plaster';
  const hs = kind === 'shed' ? [Hf, Hf + 0.95] : [Hf, Hf];
  const side = (m, sd, a0, a1, ya, yb, off) => (sd === 0 ? B(m, a0, -off, a1, 0, ya, yb) : sd === 1 ? B(m, L, a0, L + off, a1, ya, yb) : sd === 2 ? B(m, a0, D, a1, D + off, ya, yb) : B(m, -off, a0, 0, a1, ya, yb));
  const len = (sd) => (sd % 2 ? D : L);
  const wallTop = (sd) => F + (sd === 0 ? hs[0] : sd === 2 ? hs[1] : (hs[0] + hs[1]) / 2) - 0.25;
  for (let sd = 0; sd < 4; sd++) {
    if (kind === 'arch' && sd === 0) continue;
    const Ls = len(sd), n = earthy ? 2 + Math.floor(wr() * 2) : 1;
    for (let i = 0; i < n; i++) {
      const w = 0.6 + wr() * 0.9, h = 0.4 + wr() * 0.6, a = 0.2 + wr() * (Ls - w - 0.4), y0 = wy0 + 0.25 + wr() * Math.max(0.1, wallTop(sd) - wy0 - h - 0.5);
      if (earthy && sd !== 0 || (earthy && wr() < 0.6)) side('brick_buff', sd, a, a + w, y0, y0 + h, 0.03);                // fallen plaster: the adobe under it
      if (earthy) { const sa = a + wr() * 1.2 + 0.4, sy = y0 + h + 0.1 + wr() * 0.4; if (sa + 0.9 < Ls && sy + 0.15 < wallTop(sd)) for (let k = 0; k < 3; k++) side('thatch', sd, sa + k * 0.1, sa + 0.5 + k * 0.17 + wr() * 0.2, sy + k * 0.045, sy + k * 0.045 + 0.02, 0.04); }   // straw showing through
    }
    // the foot: where the wall has no stone dado the rain splash has eaten it, the stone of the footing showing through
    if (earthy && !dado) for (let i = 0; i < 3; i++) { const w = 0.5 + wr() * 1.1, a = 0.2 + wr() * (len(sd) - w - 0.4); side('schist_rubble', sd, a, a + w, F + 0.02, F + 0.35 + wr() * 0.3, 0.02); }
    if (earthy && dado) for (let i = 0; i < 3; i++) { const w = 0.4 + wr() * 0.9, a = 0.2 + wr() * (len(sd) - w - 0.4); side('mud_plaster', sd, a, a + w, wy0 - 0.0, wy0 + 0.12 + wr() * 0.2, 0.01 + 0.0); }
  }
  // the smoke's black over the door and over each window of the front, narrowing as it climbs
  if (kind !== 'arch') for (let k = 0; k < nb; k++) {
    const uc = (k + 0.5) * bay, isDoor = k === door, y0 = F + (isDoor ? 2.32 : 2.48), y1 = Math.min(top - 0.12, y0 + 0.5 + wr() * 0.35);
    if (y1 - y0 < 0.2) continue;
    const w = (isDoor ? 0.95 : 1.2) * (0.8 + wr() * 0.3);
    B('bark_dark', uc - w / 2, -0.05, uc + w / 2, 0, y0, (y0 + y1) / 2, false);
    B('bark_dark', uc - w * 0.3, -0.05, uc + w * 0.3, 0, (y0 + y1) / 2 - 0.0, y1, false);
  }
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
  const wr = rng((el.seed || 1) + 5), capKind = el.wall === 'mud_plaster' || wr() < 0.35 ? (wr() < 0.6 ? 1 : 2) : 0;
  const run = (a0, a1, fixed, alongU, skip = null) => {
    for (let a = a0; a < a1 - 1e-6; a += 2) {
      const b = Math.min(a1, a + 2), m = (a + b) / 2;
      if (skip && m > skip[0] && m < skip[1]) continue;
      const [x, z] = alongU ? fr.P(m, fixed) : fr.P(fixed, m), yy = g(x, z) - 0.05;
      const r = alongU ? [a, fixed - T / 2, b, fixed + T / 2] : [fixed - T / 2, a, fixed + T / 2, b];
      const wh = 1.75 + wr() * 0.4, rub = 0.45 + wr() * 0.25;                          // the wall's height and its rubble foot vary run to run
      B('schist_rubble', r[0], r[1], r[2], r[3], yy - 0.4, yy + rub, true);
      B(el.wall ?? 'earth_wall', r[0] + 0.03, r[1] + 0.03, r[2] - 0.03, r[3] - 0.03, yy + rub, yy + wh, true);
      // the cap: grey tiles, or (poorer yards) a thatch of sorghum straw with its ends hanging, or a crumbled top of bare earth
      const cap = capKind;
      if (cap === 0) B('tile_grey', r[0] - 0.05, r[1] - 0.05, r[2] + 0.05, r[3] + 0.05, yy + wh, yy + wh + 0.1, false);
      else if (cap === 1) B('thatch', r[0] - 0.12, r[1] - 0.14, r[2] + 0.12, r[3] + 0.14, yy + wh, yy + wh + 0.22, false);
      else B('mud_plaster', r[0], r[1] + 0.06, r[2], r[3] - 0.06, yy + wh, yy + wh + 0.08 + wr() * 0.1, false);
      // plaster fallen off in patches, showing the courses under it; a few stones that stand out
      for (const sd of [-1, 1]) if (wr() < 0.4) {
        const m = a + 0.3 + wr() * (b - a - 0.9), pw = 0.5 + wr() * 0.5, ph = 0.4 + wr() * 0.5, py = yy + rub + 0.1 + wr() * (wh - rub - ph - 0.3), mt = wr() < 0.5 ? 'brick_grey' : 'schist_rubble';
        const f = sd < 0 ? r[(alongU ? 1 : 0)] + 0.025 : (alongU ? r[3] : r[2]) - 0.025;
        if (alongU) B(mt, m, f - 0.02, m + pw, f + 0.02, py, py + ph, false);
        else B(mt, f - 0.02, m, f + 0.02, m + pw, py, py + ph, false);
      }
      // a pier of rubble at the run's joint on the outer side, hiding the seam and holding the wall
      if (a > 0.1 && (Math.round(a / 2) % 3 === 0)) { const q = alongU ? [a - 0.25, fixed - T / 2 - 0.12, a + 0.25, fixed + T / 2 + 0.12] : [fixed - T / 2 - 0.12, a - 0.25, fixed + T / 2 + 0.12, a + 0.25]; B('schist_rubble', q[0], q[1], q[2], q[3], yy - 0.3, yy + wh - 0.15, true); B('limestone', q[0] - 0.03, q[1] - 0.03, q[2] + 0.03, q[3] + 0.03, yy + wh - 0.15, yy + wh - 0.05, false); }
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


/** wutai_floor { at, y, r, mat, h }: a round floor of beaten earth or flagstones (a threshing floor, the apron of the well), its skirt buried. */
export function wutaiFloor({ at: [x, z], y, r = 5, mat = 'mud_plaster', h = 0.05 }, { bag }) {
  bag.add(mat, lathe([[0.001, -0.7], [r, -0.7], [r, h], [0.001, h]], 24, (th) => 1 + 0.03 * Math.sin(th * 5), x, y, z));
  bag.add('schist_rubble', lathe([[r * 0.995, -0.7], [r * 1.04, -0.7], [r * 1.04, h * 0.6], [r * 0.995, h * 0.6]], 24, (th) => 1 + 0.03 * Math.sin(th * 5), x, y, z));
}

/**
 * wutai_threshing { rect, front, y, seed }: a threshing floor: a round floor of rolled earth, the stone roller lying on it,
 * heaps of straw and of grain, a wooden fork and a winnowing shovel leaning on a post, a low wattle windbreak on the windward side.
 */
export function wutaiThreshing(el, { bag, col }) {
  const { fr, B } = tools(el, bag, col), { L, D, P } = fr, rand = rng((el.seed || 1) + 3), y = el.y;
  const r = Math.min(L, D) * 0.36, [cx, cz] = P(L * 0.5, D * 0.5);
  wutaiFloor({ at: [cx, cz], y, r, h: 0.06 }, { bag });
  const t = y + 0.06;
  // the roller: a stone cylinder in a wooden frame, lying on the floor
  const rl = lathe([[0.001, -0.5], [0.34, -0.5], [0.34, 0.5], [0.001, 0.5]], 14); rl.rotateZ(Math.PI / 2); const a = rand() * 3.14; rl.rotateY(a); rl.translate(cx + Math.cos(a) * 0.4, t + 0.34, cz - Math.sin(a) * 0.4); bag.add('granite_grey', rl);
  for (const sg of [-1, 1]) { const c = Math.cos(a), sn = Math.sin(a); const px = cx + Math.cos(a) * 0.4 + 0 * c, pz = cz - Math.sin(a) * 0.4; void sn; bag.add('timber', tube([[px + sg * 0 + Math.sin(a) * sg * 0.56, t + 0.34, pz + Math.cos(a) * sg * 0.56, 0.035], [px + Math.sin(a) * sg * 0.56 + Math.cos(a) * 1.6, t + 0.62, pz + Math.cos(a) * sg * 0.56 - Math.sin(a) * 1.6, 0.03]], 6)); }
  // straw and grain heaps at the edge of the floor
  for (let i = 0; i < 3; i++) { const u = (0.18 + 0.32 * i + rand() * 0.1) * L, v = D * (0.12 + rand() * 0.06), [hx, hz] = P(u, v), hr = 0.9 + rand() * 0.8;
    bag.add(i === 1 ? 'paint_ochre' : 'thatch', lathe([[0.001, -0.1], [hr, -0.1], [hr * 0.85, hr * 0.35], [hr * 0.45, hr * 0.62], [0.001, hr * 0.7]], 12, (th) => 1 + 0.07 * Math.sin(th * 3 + i), hx, y, hz)); }
  // the fork and the shovel leaning on a post by the floor's side
  const [px, pz] = P(L * 0.9, D * 0.55);
  B('timber', L * 0.9 - 0.05, D * 0.55 - 0.05, L * 0.9 + 0.05, D * 0.55 + 0.05, y - 0.3, y + 1.9, true);
  B('timber', L * 0.9 + 0.1, D * 0.55 - 0.02, L * 0.9 + 0.14, D * 0.55 + 0.02, y + 0.0, y + 1.7, false);
  B('timber', L * 0.9 + 0.2, D * 0.55 - 0.1, L * 0.9 + 0.24, D * 0.55 + 0.1, y + 0.0, y + 0.5, false);
  // the wattle windbreak: a low screen of sorghum stalks between posts
  for (let u = L * 0.05; u < L * 0.5; u += 0.8) B('timber', u - 0.04, D * 0.92 - 0.04, u + 0.04, D * 0.92 + 0.04, y - 0.2, y + 1.3, false);
  B('thatch', L * 0.05, D * 0.92 - 0.07, L * 0.55, D * 0.92 + 0.07, y + 0.1, y + 1.25, false);
  void px; void pz;
}

/**
 * wutai_garden { rect, front, y, seed }: a vegetable plot walled by a wattle fence: raised beds in rows, cabbages and onions,
 * a bean tent on poles, pumpkins on the ground, a lean-to tool shed and a water vat at the end.
 */
export function wutaiGarden(el, { bag, col }) {
  const { fr, B, S, pot } = tools(el, bag, col), { L, D } = fr, rand = rng((el.seed || 1) + 5), y = el.y;
  // the fence: posts and a screen of stalks round three sides, the gate side open
  const fence = (u0, v0, u1, v1) => B('thatch', u0, v0, u1, v1, y + 0.1, y + 1.15, false);
  fence(0.1, D - 0.4, L - 0.1, D - 0.3); fence(0.1, 0.3, 0.2, D - 0.3); fence(L - 0.2, 0.3, L - 0.1, D - 0.3);
  for (let u = 0.1; u < L; u += 1.5) B('timber', u - 0.05, D - 0.45, u + 0.05, D - 0.25, y - 0.2, y + 1.3, false);
  for (let v = 0.5; v < D - 0.4; v += 1.5) { B('timber', 0.05, v - 0.05, 0.25, v + 0.05, y - 0.2, y + 1.3, false); B('timber', L - 0.25, v - 0.05, L - 0.05, v + 0.05, y - 0.2, y + 1.3, false); }
  // the beds: long mounds of tilled earth in rows, each with its crop
  const rows = Math.floor((L - 2.0) / 1.5), crops = ['cab', 'onion', 'bean', 'pump', 'cab', 'onion'];
  for (let i = 0; i < rows; i++) {
    const u = 1.0 + i * 1.5, v0 = 1.4, v1 = D - 2.6, crop = crops[Math.floor(rand() * crops.length)];
    B('mud_plaster', u, v0, u + 1.0, v1, y - 0.3, y + 0.22, false);
    for (let v = v0 + 0.4; v < v1 - 0.2; v += crop === 'bean' ? 1.6 : 0.62) {
      const [px, pz] = fr.P(u + 0.5, v);
      if (crop === 'cab') bag.add('flax_leaf', lathe([[0.001, 0], [0.2, 0.06], [0.24, 0.17], [0.16, 0.3], [0.001, 0.32]], 9, (th) => 1 + 0.12 * Math.sin(th * 5), px, y + 0.2, pz));
      else if (crop === 'onion') for (let k = -1; k <= 1; k++) bag.add('flax_leaf', tube([[px + k * 0.14, y + 0.2, pz, 0.01], [px + k * 0.16, y + 0.55, pz, 0.012], [px + k * 0.14, y + 0.7, pz + 0.04, 0.003]], 4));
      else if (crop === 'pump') { bag.add('paint_ochre', blob([px, y + 0.4, pz], 0.2, 0.15, 0.2, 8, 4)); bag.add('flax_leaf', lathe([[0.001, 0], [0.4, 0.04], [0.3, 0.15], [0.001, 0.2]], 8, null, px + 0.3, y + 0.23, pz)); }
      else {                                                                                  // a bean tent: two leaning poles tied at the top, vines up them
        for (const sg of [-1, 1]) bag.add('timber', tube([[px + sg * 0.45, y + 0.2, pz, 0.018], [px, y + 1.7, pz, 0.014]], 5));
        for (const sg of [-1, 1]) bag.add('flax_leaf', tube([[px + sg * 0.42, y + 0.25, pz, 0.05], [px + sg * 0.22, y + 0.9, pz, 0.07], [px + sg * 0.05, y + 1.55, pz, 0.04]], 5));
      }
    }
  }
  // a lean-to tool shed against the back fence, a vat
  const su = L * 0.5 - 1.2;
  B('timber', su, D - 2.3, su + 0.1, D - 2.2, y - 0.2, y + 1.9, false); B('timber', su + 2.3, D - 2.3, su + 2.4, D - 2.2, y - 0.2, y + 1.9, false);
  S('thatch', su - 0.2, D - 2.4, su + 2.6, D - 0.3, y + 2.15, y + 1.55, 0.12);
  B('mud_plaster', su + 0.2, D - 1.0, su + 2.2, D - 0.5, y, y + 0.35, false);
  pot('wood_dark', 1.4, D - 1.2, 0.4, 0.8, y); void col;
}

/**
 * wutai_oldtree { at, y, h, seed }: the great old pagoda tree (huai) of the village green: a thick trunk flared at the root and
 * fissured, three limbs, a broad crown of leaf masses; round it a stone seat (a ring of dressed stone) worn smooth, red cloths
 * tied to a limb. The seat's inner space is trodden earth.
 */
export function wutaiOldTree({ at: [x, z], y, h = 11, seed = 1 }, { bag, col }) {
  const rand = rng(seed + 31), R = 0.85;
  bag.add('bark_grey', lathe([[0.001, -0.5], [R * 1.5, -0.5], [R * 1.35, 0.2], [R * 1.0, 0.9], [R * 0.92, 2.2], [R * 0.95, 3.0], [R * 0.8, 3.6], [0.001, 3.6]], 14, (th, i) => 1 + (i > 0 && i < 6 ? 0.07 * Math.cos(th * 7 + i) + 0.04 * Math.cos(th * 3) : 0), x, y, z));
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + rand(); bag.add('bark_grey', tube([[x + Math.cos(a) * R * 1.0, y + 0.1, z + Math.sin(a) * R * 1.0, 0.3], [x + Math.cos(a) * R * 1.9, y - 0.05, z + Math.sin(a) * R * 1.9, 0.1]], 6)); }
  const limbs = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 6.28 + rand() * 0.6, up = 5.8 + rand() * 2.8, out = 3.8 + rand() * 2.4;
    const p = [[x, y + 3.2, z, 0.5], [x + Math.cos(a) * out * 0.3, y + 3.2 + up * 0.35, z + Math.sin(a) * out * 0.3, 0.38], [x + Math.cos(a) * out * 0.7, y + 3.2 + up * 0.75, z + Math.sin(a) * out * 0.7, 0.24], [x + Math.cos(a) * out, y + 3.2 + up, z + Math.sin(a) * out, 0.12]];
    bag.add('bark_grey', tube(p, 7)); limbs.push(p[3]);
    // a side branch
    const m = p[2]; bag.add('bark_grey', tube([[m[0], m[1], m[2], 0.16], [m[0] + Math.cos(a + 0.7) * 2.2, m[1] + 1.3, m[2] + Math.sin(a + 0.7) * 2.2, 0.08], [m[0] + Math.cos(a + 0.7) * 3.4, m[1] + 2.1, m[2] + Math.sin(a + 0.7) * 3.4, 0.05]], 5));
    limbs.push([m[0] + Math.cos(a + 0.7) * 3.4, m[1] + 2.1, m[2] + Math.sin(a + 0.7) * 3.4]);
  }
  // the crown: leaf masses on the limb tips and between, the underside flat
  for (const [lx, ly, lz] of limbs) for (let k = 0; k < 2; k++) bag.add('flax_leaf', blob([lx + (rand() - 0.5) * 1.6, ly + 0.2 + k * 0.9, lz + (rand() - 0.5) * 1.6], 2.4 + rand() * 1.0, 1.4 + rand() * 0.5, 2.4 + rand() * 1.0, 9, 5));
  bag.add('flax_leaf', blob([x, y + 3.2 + 8.2, z], 3.4, 1.8, 3.4, 10, 5));
  // the seat: a ring of dressed stone with a step, the earth inside trodden hard; red cloths on the low limb
  bag.add('limestone', lathe([[2.0, -0.3], [2.35, -0.3], [2.35, 0.44], [2.0, 0.44]], 18, null, x, y, z));
  bag.add('mud_plaster', lathe([[0.001, -0.3], [2.0, -0.3], [2.0, 0.03], [0.001, 0.03]], 18, null, x, y, z));
  for (let i = 0; i < 6; i++) { const a = 0.5 + i * 0.35, q = limbs[0]; void a; bag.add('cloth_red', box(q[0] - 0.9 + i * 0.3, q[1] - 1.1, q[2] + 0.1, q[0] - 0.84 + i * 0.3, q[1] - 0.1, q[2] + 0.13)); }
  col.circle(x, z, 2.4, y - 0.3, y + 0.5);
  col.circle(x, z, R, y, y + 5);
}


/**
 * wutai_temple { rect, front, y, foot, seed }: the village's small temple (a Guandi or Dragon King temple of the kind every
 * village of the region keeps; here the village's own): a hall of three bays on a stone platform at the back of the yard,
 * walls of grey brick, a red plank door and two lattice windows, a gable roof of grey tiles with a ridge and small chiwei, a
 * porch of two red posts on stone bases under the front eave; before it a stone incense burner, a stele on a tortoise-less
 * base, a pair of old pines. The yard's wall is its own element (wutai_yard).
 */
export function wutaiTemple(el, { bag, col }) {
  const { fr, B, S } = tools(el, bag, col), { L, D, P } = fr, y = el.y, foot = Math.min(el.foot ?? y, y);
  const Wh = 9.6, Dh = 6.2, u0 = (L - Wh) / 2, v0 = D - 1.1 - Dh, F = y + 0.55, Hw = 3.7;
  const bay = Wh / 3, dc = u0 + bay * 1.5;
  B('schist_rubble', u0 - 0.5, v0 - 1.6, u0 + Wh + 0.5, v0 + Dh + 0.3, foot - 0.5, F - 0.04, true);              // the platform of stone
  B('limestone', u0 - 0.55, v0 - 1.65, u0 + Wh + 0.55, v0 + Dh + 0.35, F - 0.04, F, false);
  for (let k = 0; k < 3; k++) B('limestone', dc - 1.2 + k * 0.1, v0 - 1.65 - 0.34 * (k + 1), dc + 1.2 - k * 0.1, v0 - 1.65 - 0.34 * k, foot - 0.3, F - 0.04 - 0.17 * k - 0.0, false);
  // walls and the front: three bays, the middle one a door
  B('brick_grey', u0, v0, u0 + Wh, v0 + Dh, F, F + Hw, true);
  B('wood_dark', dc - 0.8, v0 - 0.08, dc, v0, F + 0.05, F + 2.6); B('wood_dark', dc, v0 - 0.08, dc + 0.8, v0, F + 0.05, F + 2.6);
  B('timber_red', dc - 0.95, v0 - 0.12, dc - 0.8, v0, F, F + 2.75); B('timber_red', dc + 0.8, v0 - 0.12, dc + 0.95, v0, F, F + 2.75); B('timber_red', dc - 0.95, v0 - 0.12, dc + 0.95, v0, F + 2.6, F + 2.75);
  for (const hy of [0.5, 1.3, 2.1]) B('timber', dc - 0.8, v0 - 0.1, dc + 0.8, v0 - 0.08, F + hy, F + hy + 0.1);
  for (const c of [u0 + bay * 0.5, u0 + bay * 2.5]) { B('timber_red', c - 0.8, v0 - 0.12, c + 0.8, v0, F + 0.9, F + 2.5); B('lattice_red', c - 0.7, v0 - 0.14, c + 0.7, v0 - 0.12, F + 1.0, F + 2.4); }
  // the porch: two red posts on stone bases, a beam, the eave over them
  for (const c of [dc - 1.55, dc + 1.55]) { B('granite_grey', c - 0.25, v0 - 1.35, c + 0.25, v0 - 0.85, F, F + 0.3, true); B('timber_red', c - 0.17, v0 - 1.27, c + 0.17, v0 - 0.93, F + 0.3, F + Hw - 0.25, true); }
  B('timber_red', dc - 1.8, v0 - 1.3, dc + 1.8, v0 - 0.9, F + Hw - 0.25, F + Hw + 0.1, false);
  // the roof: two slopes of grey tile from the ridge, the eaves wide, gable ends filled with brick; the ridge capped
  const rg = F + Hw + 1.55, ey = F + Hw + 0.05, vm = v0 + Dh / 2, vf = v0 - 2.0, vb = v0 + Dh + 0.9;
  const slopeF = (rg - ey) / (vm - (v0 - 0.0)), eF = rg - slopeF * (vm - vf), eB = rg - slopeF * (vb - vm);
  S('timber', u0 - 0.6, vf, u0 + Wh + 0.6, vm, eF, rg, 0.12); S('timber', u0 - 0.6, vm, u0 + Wh + 0.6, vb, rg, eB, 0.12);
  S('tile_grey', u0 - 0.65, vf - 0.05, u0 + Wh + 0.65, vm, eF + 0.14, rg + 0.14, 0.16); S('tile_grey', u0 - 0.65, vm, u0 + Wh + 0.65, vb + 0.05, rg + 0.14, eB + 0.14, 0.16);
  B('tile_grey', u0 - 0.7, vm - 0.3, u0 + Wh + 0.7, vm + 0.3, rg + 0.1, rg + 0.45, false);
  for (const e of [u0 - 0.6, u0 + Wh + 0.6 - 0.4]) B('tile_grey', e, vm - 0.2, e + 0.4, vm + 0.2, rg + 0.45, rg + 0.95, false);
  for (const gu of [u0 - 0.0, u0 + Wh - 0.5]) {
    const t = [], pt = (u, v, yy) => { const p = P(u, v); return [p[0], yy, p[1]]; };
    const g0 = gu, g1 = gu + 0.5, hmax = rg;
    const a = pt(g0, v0, F + Hw), b2 = pt(g0, v0 + Dh, F + Hw), c = pt(g0, vm, hmax), d = pt(g1, v0, F + Hw), e = pt(g1, v0 + Dh, F + Hw), f = pt(g1, vm, hmax);
    t.push(...a, ...b2, ...c, ...d, ...f, ...e); void d; void e; void f;
    bag.add('brick_grey', fromTriangles(orientOutward([...a, ...b2, ...c, ...d, ...f, ...e, ...a, ...c, ...f, ...a, ...f, ...d, ...b2, ...e, ...f, ...b2, ...f, ...c])));
  }
  // the yard: incense burner, stele, flag stones along the way
  const [bx, bz] = P(dc, v0 - 4.0);
  bag.add('bronze', lathe([[0.001, 0], [0.4, 0], [0.42, 0.05], [0.5, 0.15], [0.52, 0.45], [0.42, 0.5], [0.001, 0.5]], 12, null, bx, y + 0.5, bz));
  B('limestone', dc - 0.45, v0 - 4.45, dc + 0.45, v0 - 3.55, y - 0.2, y + 0.5, true);
  for (const s of [-1, 1]) B('bronze', dc + s * 0.38 - 0.04, v0 - 4.04, dc + s * 0.38 + 0.04, v0 - 3.96, y + 1.0, y + 1.25);
  const su = u0 - 1.6; B('limestone', su, v0 - 0.5, su + 0.9, v0 + 0.2, y - 0.2, y + 0.3, false); B('limestone', su + 0.1, v0 - 0.4, su + 0.8, v0 - 0.1, y + 0.3, y + 1.9, true); B('limestone', su + 0.05, v0 - 0.45, su + 0.85, v0 - 0.05, y + 1.9, y + 2.05, false);
  for (let v = 0.6; v < v0 - 2.0; v += 0.9) B('limestone', dc - 0.5, v, dc + 0.5, v + 0.7, y - 0.2, y + 0.03, false);
  void col;
}

/** wutai_shrine { at, y, rot }: a small earth-god shrine (tudi miao) of brick: a niche with a red lining, a tiled gable, a stone offering table. */
export function wutaiShrine(el, { bag, col }) {
  const f = { rect: [el.at[0] - 0.7, el.at[1] - 0.6, el.at[0] + 0.7, el.at[1] + 0.6], front: el.front || 'w' };
  const { fr, B, S } = tools(f, bag, col), y = el.y;
  B('schist_rubble', -0.1, -0.1, fr.L + 0.1, fr.D + 0.1, y - 0.4, y + 0.2, true);
  B('brick_grey', 0, 0, fr.L, fr.D, y + 0.2, y + 1.3, true);
  B('opening', 0.35, -0.03, fr.L - 0.35, 0, y + 0.5, y + 1.1);
  B('lacquer_red', 0.3, -0.02, fr.L - 0.3, 0.0, y + 0.45, y + 0.5); B('lacquer_red', 0.3, -0.02, 0.35, 0.0, y + 0.5, y + 1.15); B('lacquer_red', fr.L - 0.35, -0.02, fr.L - 0.3, 0.0, y + 0.5, y + 1.15);
  S('tile_grey', -0.2, -0.3, fr.L + 0.2, fr.D / 2, y + 1.3, y + 1.8, 0.12); S('tile_grey', -0.2, fr.D / 2, fr.L + 0.2, fr.D + 0.2, y + 1.8, y + 1.35, 0.12);
  B('limestone', 0.3, -0.5, fr.L - 0.3, -0.1, y - 0.1, y + 0.45, true);
  void col;
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
/** wutai_pine { at, y, h, seed }: an old Chinese pine (Pinus tabuliformis) of a courtyard bed: the red-scaled, leaning trunk, a crown of flat tiers. */
export function wutaiPine({ at: [x, z], y, h = 6, seed = 1 }, { bag, col }) {
  const rand = rng(seed + 99), lean = (rand() - 0.5) * 0.5, a = rand() * 6.28;
  const tr = lathe([[0.001, -0.3], [0.38, -0.3], [0.36, 0], [0.27, 1.4], [0.2, h * 0.55], [0.12, h * 0.9], [0.001, h * 0.9]], 10, null, 0, 0, 0);
  const pos = tr.attributes.position;
  for (let i = 0; i < pos.count; i++) { const t = Math.max(0, pos.getY(i)) / h; pos.setX(i, pos.getX(i) + Math.cos(a) * lean * t * t * h * 0.35); pos.setZ(i, pos.getZ(i) + Math.sin(a) * lean * t * t * h * 0.35); }
  tr.translate(x, y, z); bag.add('bark_redpine', tr);
  for (let k = 0; k < 5; k++) {
    const t = 0.5 + k * 0.1, R = (1.5 + rand() * 0.8) * (1.15 - k * 0.12) * (h / 6), oa = rand() * 6.28, off = R * 0.35 * (k > 0), yy = y + t * h - 0.1;
    const cx = x + Math.cos(a) * lean * t * t * h * 0.35 + Math.cos(oa) * off, cz = z + Math.sin(a) * lean * t * t * h * 0.35 + Math.sin(oa) * off;
    bag.add('flax_leaf', lathe([[0.001, -0.35], [R * 0.55, -0.22], [R, 0.0], [R * 0.9, 0.3], [R * 0.55, 0.55], [0.001, 0.68]], 12, null, cx, yy, cz));
    bag.add('bark_redpine', lathe([[0.001, 0], [0.07, 0], [0.05, R * 0.2], [0.001, R * 0.2]], 5, null, cx, yy - 0.4, cz));
  }
  col.circle(x, z, 0.4, y, y + h * 0.5);
}

export const villageElements = { wutai_floor: wutaiFloor, wutai_threshing: wutaiThreshing, wutai_garden: wutaiGarden, wutai_oldtree: wutaiOldTree, wutai_temple: wutaiTemple, wutai_shrine: wutaiShrine, wutai_pine: wutaiPine, wutai_house: wutaiHouse, wutai_yard: wutaiYard, wutai_well: wutaiWell, wutai_mill: wutaiMill, wutai_rack: wutaiRack };
