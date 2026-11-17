// Two more houses of the valley village that can be entered (docs/settlements/tang-wutai.md §15): the single-pitch house as a weaver's
// home (a loom at the window, a spinning wheel, the kang and its stove, grain bin and jars) and the middle cave of a brick-arched
// dwelling (gu yao: a barrel vault of plastered brick, the kang at its back, a cupboard, a niche for the lamp). Elements of the
// `wutai-site` style; the front, door and window of each follow the seed. [inferred: north Shanxi vernacular, as the rest of the village]

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { frame } from '../../styles/chinese/village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}
const TW = 0.34;                                  // wall thickness of the shed house
const ARCH = { bay: 3.6, cw: 2.6, D: 5.8, S: 2.0 };   // a cave: 2.6 m clear, 1.0 m of pier between, 5.8 m deep, springing 2.0 m up

/** Size of a dwelling: { L, D } for the lot planner. */
export const dwellingSize = (kind, nb) => (kind === 'arch' ? { L: nb * ARCH.bay, D: ARCH.D } : { L: nb * 3.3, D: 5.0 });
/** Where the lamp stands: [u, v, height above the floor] in the house's frame. */
export const lampSpot = (kind, nb) => {
  const { L, D } = dwellingSize(kind, nb);
  if (kind === 'arch') { const c = 0.5 + Math.floor(nb / 2) * ARCH.bay + ARCH.cw / 2; return [c, D - 0.4 - 0.85, 0.91]; }
  return [L - TW - 1.3 - 0.9, D - TW - 0.85, 0.91];
};

function tools(el, bag, col) {
  const fr = frame(el.rect, el.front), { P, R } = fr;
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const pt = (u, v, y) => { const p = P(u, v); return [p[0], y, p[1]]; };
  const S = (m, u0, v0, u1, v1, ya, yb, th) => { const t = []; hexa(t, [pt(u0, v0, ya - th), pt(u1, v0, ya - th), pt(u1, v1, yb - th), pt(u0, v1, yb - th)], [pt(u0, v0, ya), pt(u1, v0, ya), pt(u1, v1, yb), pt(u0, v1, yb)]); bag.add(m, fromTriangles(t)); };
  const W = (m, u0, v0, u1, v1, yb, yf, yk, c = false) => { const t = []; hexa(t, [pt(u0, v0, yb), pt(u1, v0, yb), pt(u1, v1, yb), pt(u0, v1, yb)], [pt(u0, v0, yf), pt(u1, v0, yf), pt(u1, v1, yk), pt(u0, v1, yk)]); bag.add(m, fromTriangles(t)); if (c) col.rect(R(u0, v0, u1, v1), yb, yk); };
  const pot = (m, u, v, r, h, ya = 0) => { const p = P(u, v); bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, p[0], ya, p[1])); };
  return { fr, B, S, W, pot };
}

const doorway = (B, uc, dw, F, h, front = 0) => {
  B('timber', uc - dw / 2 - 0.1, front - 0.1, uc - dw / 2, front, F, F + h + 0.12); B('timber', uc + dw / 2, front - 0.1, uc + dw / 2 + 0.1, front, F, F + h + 0.12);
  B('timber', uc - dw / 2 - 0.12, front - 0.12, uc + dw / 2 + 0.12, front, F + h, F + h + 0.14);
  // the leaves stand open against the jambs inside
  B('wood_dark', uc - dw / 2, front + 0.06, uc - dw / 2 + 0.08, front + 0.06 + dw / 2 - 0.04, F + 0.02, F + h);
  B('wood_dark', uc + dw / 2 - 0.08, front + 0.06, uc + dw / 2, front + 0.06 + dw / 2 - 0.04, F + 0.02, F + h);
  B('limestone', uc - dw / 2 - 0.25, front - 0.65, uc + dw / 2 + 0.25, front, F - 0.42, F - 0.2, true);       // the first step
  B('limestone', uc - dw / 2 - 0.1, front - 0.2, uc + dw / 2 + 0.1, front + 0.1, F - 0.2, F - 0.02, true);   // the second
};

/** wutai_dwelling { rect, front, y, foot, seed, kind: 'shed' | 'arch', nb } */
export function wutaiDwelling(el, { bag, col }) {
  const rand = rng((el.seed || 1) + 29), T = tools(el, bag, col), { fr, B } = T, { L, D } = fr, F = el.y + 0.4, kind = el.kind, nb = el.nb ?? 2;
  const foot = Math.min(el.foot ?? el.y, el.y);
  const wm = rand() < 0.4 ? 'brick_grey' : rand() < 0.5 ? 'earth_wall' : 'mud_plaster';
  B('schist_rubble', -0.1, -0.1, L + 0.1, D + 0.1, foot - 0.4, F - 0.02, true);
  col.floor(fr.R(0, 0, L, D), F);
  if (kind === 'arch') arch(el, T, { rand, F, nb, wm }); else shed(el, T, { rand, F, nb, wm });
}

// ── the single-pitch house: a weaver's home ─────────────────────────────────
function shed(el, { fr, B, S, W, pot }, { rand, F, nb, wm }) {
  const { L, D } = fr, bay = L / nb, door = Math.floor(nb / 2), du = (door + 0.5) * bay, dw = 1.1;
  const Hf = 2.9, Hk = Hf + 0.95, e = 0.18, yf = F + Hf + e, yk = F + Hk + e;
  const dado = wm !== 'brick_grey';
  const m = (u0, v0, u1, v1, ya, c = true) => W(dado ? wm : 'brick_grey', u0, v0, u1, v1, ya, yf, yk, c);
  const wy0 = dado ? F + 0.8 : F;
  if (dado) for (const [a, b, c, d] of [[0, D - TW, L, D], [0, TW, TW, D - TW], [L - TW, TW, L, D - TW], [0, 0, du - dw / 2 - 0.1, TW], [du + dw / 2 + 0.1, 0, L, TW]]) B('schist_rubble', a, b, c, d, F - 0.02, wy0, true);
  m(0, D - TW, L, D, wy0); m(0, TW, TW, D - TW, wy0); m(L - TW, TW, L, D - TW, wy0);
  // the front: wall either side of the door and under and over each window
  m(0, 0, du - dw / 2 - 0.1, TW, wy0); m(du + dw / 2 + 0.1, 0, L, TW, wy0);
  B(wm === 'brick_grey' ? 'brick_grey' : wm, du - dw / 2 - 0.1, 0, du + dw / 2 + 0.1, TW, F + 2.1, yf, false);
  doorway(B, du, dw, F, 2.0);
  // windows: a big papered lattice window per other bay; the first bay's has a shutter propped open on a stick
  for (let k = 0; k < nb; k++) {
    if (k === door) continue;
    const uc = (k + 0.5) * bay, ww = Math.min(1.9, bay - 0.9), wb = F + 0.95, wh = 1.3;
    B('timber', uc - ww / 2 - 0.08, -0.07, uc + ww / 2 + 0.08, 0, wb - 0.08, wb + wh + 0.08);
    B('lattice', uc - ww / 2, -0.095, uc + ww / 2, -0.07, wb, wb + wh);
    B('timber', uc - ww / 2 - 0.14, -0.2, uc + ww / 2 + 0.14, 0, wb - 0.14, wb - 0.08);
    if (k === 0 && rand() < 0.6) { B('wood_dark', uc - ww / 2 - 0.08, -0.5, uc - ww / 2 - 0.0, -0.4, wb - 0.08, wb + wh + 0.08); B('timber', uc - ww / 2 - 0.34, -0.36, uc - ww / 2 - 0.3, -0.32, F + 0.3, wb + 0.2); }
  }
  // the roof: a boarded deck and tiles falling to the front, the ridge cap at the high back edge, the kang's chimney
  const k0 = -0.6, k1 = D + 0.35, slope = (yk - yf) / D, yAt = (v) => yf + slope * v;
  S('timber', -0.35, k0, L + 0.35, k1, yAt(k0), yAt(k1), 0.1);
  S('tile_grey', -0.38, k0 - 0.02, L + 0.38, k1 + 0.02, yAt(k0) + 0.14, yAt(k1) + 0.14, 0.14);
  B('tile_grey', -0.38, D - 0.1, L + 0.38, D + 0.3, yAt(D) + 0.1, yAt(D) + 0.3, false);
  const cu = L - TW - 0.6, cv = D - TW - 0.5;
  B('brick_grey', cu - 0.3, cv - 0.3, cu + 0.3, cv + 0.3, yAt(cv) + 0.1, yAt(cv) + 1.3, false); B('tile_grey', cu - 0.38, cv - 0.38, cu + 0.38, cv + 0.38, yAt(cv) + 1.3, yAt(cv) + 1.38, false);
  // the ceiling of boards on beams under the deck
  B('timber', TW, TW, L - TW, D - TW, F + Hf - 0.07, F + Hf - 0.02, false);
  for (let u = TW + 0.6; u < L - TW; u += 1.0) B('wood_dark', u - 0.09, TW, u + 0.09, D - TW, F + Hf - 0.26, F + Hf - 0.07, false);
  // inside: a brick floor, the kang along the back wall (its mat, quilts, a low table), the stove at its end, grain bin and jars
  B('brick_grey', TW, TW, L - TW, D - TW, F - 0.1, F + 0.01);
  const kx1 = L - TW - 1.3;
  B('brick_grey', TW, D - TW - 1.8, kx1, D - TW, F, F + 0.62, true); B('reed_mat', TW + 0.05, D - TW - 1.75, kx1 - 0.05, D - TW - 0.05, F + 0.62, F + 0.64);
  B('cloth_indigo', TW + 0.1, D - TW - 0.7, TW + 1.3, D - TW - 0.1, F + 0.64, F + 0.85); B('cloth_ochre', TW + 1.35, D - TW - 0.7, TW + 2.3, D - TW - 0.1, F + 0.64, F + 0.82);
  const tx = kx1 - 0.9, tz = D - TW - 0.85;
  B('lacquer_chestnut', tx - 0.4, tz - 0.3, tx + 0.4, tz + 0.3, F + 0.86, F + 0.91);
  for (const [a, b] of [[-0.36, -0.26], [0.32, -0.26], [-0.36, 0.22], [0.32, 0.22]]) B('lacquer_chestnut', tx + a, tz + b, tx + a + 0.04, tz + b + 0.04, F + 0.64, F + 0.86);
  B('brick_grey', kx1, D - TW - 1.3, L - TW, D - TW, F, F + 0.8, true); pot('iron', kx1 + 0.65, D - TW - 0.65, 0.34, 0.26, F + 0.8);
  B('brick_grey', L - TW - 0.55, D - TW - 0.45, L - TW - 0.2, D - TW - 0.05, F + 0.8, yAt(D - TW - 0.25) - 0.05);
  // the loom by the first window (a frame loom: four posts, the warp beam behind, the breast beam before, the heddle frame between, the
  // weaver's seat plank, two treadles; the cloth rolled on the breast beam), a spinning wheel beside it, a basket of cotton and spools
  const lu = bay * 0.5, lv = 0.55;
  for (const [a, b] of [[-0.7, 0], [0.7, 0], [-0.7, 1.5], [0.7, 1.5]]) B('timber', lu + a - 0.04, lv + b - 0.04, lu + a + 0.04, lv + b + 0.04, F, F + 1.35, true);
  B('timber', lu - 0.74, lv + 1.46, lu + 0.74, lv + 1.54, F + 1.15, F + 1.25);                      // the warp beam
  B('timber', lu - 0.74, lv - 0.04, lu + 0.74, lv + 0.04, F + 0.95, F + 1.03);                       // the breast beam
  B('cloth_white', lu - 0.5, lv - 0.12, lu + 0.5, lv + 0.12, F + 0.9, F + 1.06);                     // the woven cloth, rolled
  for (const v of [0.7, 0.85]) B('timber', lu - 0.7, lv + v - 0.015, lu + 0.7, lv + v + 0.015, F + 1.0, F + 1.35);   // the heddle frames' bars
  for (const a of [-0.45, -0.15, 0.15, 0.45]) B('linen', lu + a - 0.01, lv + 0.04, lu + a + 0.01, lv + 1.46, F + 1.1, F + 1.12);   // the warp
  B('timber', lu - 0.4, lv + 0.35, lu + 0.4, lv + 0.75, F + 0.42, F + 0.48, true);                   // the seat plank across the side rails
  for (const a of [-0.3, 0.3]) B('timber', lu + a - 0.04, lv + 0.2, lu + a + 0.04, lv + 1.1, F + 0.1, F + 0.16);   // treadles
  const wu = bay * 0.5 + 1.5, wv = 0.7;
  B('timber', wu - 0.45, wv - 0.05, wu + 0.45, wv + 0.05, F, F + 0.07); B('timber', wu - 0.45, wv - 0.04, wu - 0.37, wv + 0.04, F + 0.07, F + 0.55);
  B('wood_dark', wu - 0.3, wv + 0.12, wu + 0.3, wv + 0.16, F + 0.5, F + 0.62); B('wood_dark', wu - 0.03, wv + 0.12, wu + 0.03, wv + 0.16, F + 0.3, F + 0.8);   // the wheel's rim as two crossed bars on its stand
  B('timber', wu + 0.3, wv - 0.04, wu + 0.38, wv + 0.04, F + 0.07, F + 0.5);
  B('wicker', wu + 0.6, wv - 0.2, wu + 1.1, wv + 0.3, F, F + 0.32); B('cloth_white', wu + 0.65, wv - 0.15, wu + 1.05, wv + 0.25, F + 0.32, F + 0.45);
  for (let k = 0; k < 3; k++) B('cloth_brown', wu + 0.25 + k * 0.12, wv + 0.5, wu + 0.31 + k * 0.12, wv + 0.56, F, F + 0.14);
  // in a third bay: the grain bin, jars and a chest
  if (nb >= 3) { const gu = (nb - 0.5) * bay - 0.2; B('timber', gu - 0.5, 0.6, gu + 0.5, 1.5, F, F + 0.9, true); B('timber', gu - 0.55, 0.55, gu + 0.55, 1.55, F + 0.9, F + 0.98); pot('glaze_green', gu + 0.9, 1.0, 0.3, 0.8, F); }
  pot('glaze_green', TW + 0.4, D - TW - 2.3, 0.4, 0.9, F); pot('pottery_dark', TW + 1.1, D - TW - 2.2, 0.3, 0.7, F);
  // strings of corn and chillies from the beams, the kitchen god's paper over the stove, a shelf of bowls
  for (const [u, sw, mm] of [[kx1 - 1.7, 0.5, 'paint_ochre'], [kx1 - 2.4, 0.4, 'lacquer_red']]) B(mm, u - 0.05, D / 2 + 0.3, u + 0.05, D / 2 + 0.4, F + Hf - 0.26 - sw * 1.2, F + Hf - 0.26);
  B('paint_ochre', L - TW - 1.1, D - TW - 0.03, L - TW - 0.6, D - TW, F + 1.6, F + 2.2, false); B('lacquer_red', L - TW - 1.06, D - TW - 0.045, L - TW - 0.64, D - TW - 0.03, F + 1.65, F + 2.15, false);
  B('timber', TW + 0.4, D - TW - 0.02, TW + 2.4, D - TW, F + 1.55, F + 1.6, false);
  for (let k = 0; k < 4; k++) B(k % 2 ? 'glaze_green' : 'bluestone', TW + 0.5 + k * 0.45, D - TW - 0.28, TW + 0.8 + k * 0.45, D - TW - 0.04, F + 1.6, F + 1.78, false);
  // weathering and the smoke's black over the door
  B('bark_dark', du - 0.45, -0.05, du + 0.45, 0, F + 2.25, F + 2.6, false); B('bark_dark', du - 0.28, -0.05, du + 0.28, 0, F + 2.6, F + 2.85, false);
  if (wm !== 'brick_grey') for (let i = 0; i < 3; i++) { const u = 0.3 + rand() * (L - 1.4); B('brick_buff', u, -0.03, u + 0.6 + rand() * 0.5, 0, F + 1.9 + rand() * 0.4, F + 2.4 + rand() * 0.3, false); }
  if (rand() < 0.7) for (let k = 0; k < nb; k++) if (k !== door && rand() < 0.7) { const uc = (k + 0.5) * bay; for (const o of [-0.45, 0.45]) for (let j = 0; j < 4; j++) B('paint_ochre', uc + o - 0.08, -0.38, uc + o + 0.08, -0.22, F + Hf - 0.12 - j * 0.3 - 0.3, F + Hf - 0.12 - j * 0.3); B('timber', uc - 0.6, -0.4, uc + 0.6, -0.34, F + Hf - 0.14, F + Hf - 0.08); }
}

// ── the brick-arched dwelling: its middle cave ──────────────────────────────
function arch(el, { fr, B, pot }, { rand, F, nb, wm }) {
  const { L, D } = fr, { bay, cw, S } = ARCH, top = F + 3.7, r = cw / 2, rise = r, face = 0.3, back = 0.4;
  const mid = Math.floor(nb / 2), stone = rand() < 0.3, ring = stone ? 'limestone' : 'brick_grey';
  const caves = Array.from({ length: nb }, (_, k) => [0.5 + k * bay, 0.5 + k * bay + cw]);
  // solid mass beside and between the caves (full depth, to the roof), the back wall
  B(wm, 0, 0, caves[0][0], D, F, top, true);
  for (let k = 0; k < nb - 1; k++) B(wm, caves[k][1], 0, caves[k + 1][0], D, F, top, true);
  B(wm, caves[nb - 1][1], 0, L, D, F, top, true);
  for (let k = 0; k < nb; k++) {
    const [a, b] = caves[k], uc = (a + b) / 2, open = k === mid, n = Math.round(cw / 0.1);
    for (let i = 0; i < n; i++) {
      const u0 = a + i * cw / n, u1 = u0 + cw / n, t = ((u0 + u1) / 2 - uc) / r, yA = F + S + rise * Math.sqrt(Math.max(0, 1 - t * t));
      B(ring, u0, 0, u1, face, yA, yA + 0.2, false);                            // the arch ring on the front
      B(wm, u0, 0, u1, face, yA + 0.2, top, false);
      if (open) {
        B('plaster_white', u0, face, u1, D - back, yA, yA + 0.05, false);       // the vault's plaster
        B(wm, u0, face, u1, D - back, yA + 0.05, top, false);
      }
      B('lattice', u0, 0.1, u1, 0.16, F + S + 0.08, yA, false);                  // the fanlight
    }
    if (open) B(wm, a, D - back, b, D, F, top, true); else B(wm, a, face, b, D, F, top, true);      // the back wall; a shut cave is solid
    // below the springing: the front wall with the door (middle cave) or a window
    if (open) {
      const dw = 1.1, du = uc;
      B(wm, a, 0, du - dw / 2 - 0.1, face, F, F + S, true); B(wm, du + dw / 2 + 0.1, 0, b, face, F, F + S, true);
      B('timber', a, -0.06, b, 0.1, F + S - 0.12, F + S + 0.08, false);
      doorway(B, du, dw, F, 1.9, 0);
      B(wm, du - dw / 2 - 0.1, 0, du + dw / 2 + 0.1, face, F + 2.0, F + S, false);
    } else {
      const sill = F + 0.9;
      B(wm, a, 0, b, face, F, sill, true); B('lattice', a + 0.2, 0.1, b - 0.2, 0.16, sill + 0.04, F + S + 0.08, false); B(wm, a, 0, a + 0.2, face, sill, F + S, false); B(wm, b - 0.2, 0, b, face, sill, F + S, false);
      B('timber', a + 0.1, -0.08, b - 0.1, 0, sill - 0.06, sill + 0.04, false);
    }
  }
  // the roof of rammed earth with its parapet, the spouts, the chimney, a stone roller left on it
  B('mud_plaster', -0.12, -0.12, L + 0.12, D + 0.12, top, top + 0.3, true);
  for (const [u0, v0, u1, v1] of [[-0.12, -0.12, L + 0.12, 0.06], [-0.12, -0.12, 0.06, D + 0.12], [L - 0.06, -0.12, L + 0.12, D + 0.12]]) { B('brick_grey', u0, v0, u1, v1, top + 0.3, top + 0.68, false); B('tile_grey', u0 - 0.04, v0 - 0.04, u1 + 0.04, v1 + 0.04, top + 0.68, top + 0.75, false); }
  for (const u of [bay * 0.5, L - bay * 0.5]) B('limestone', u - 0.1, -0.5, u + 0.1, 0, top + 0.3, top + 0.38, false);
  { const [a, b] = caves[mid], cu = (a + b) / 2 + 0.6, cv = D - 1.2; B('brick_grey', cu - 0.32, cv - 0.32, cu + 0.32, cv + 0.32, top + 0.3, top + 1.7, false); B('tile_grey', cu - 0.4, cv - 0.4, cu + 0.4, cv + 0.4, top + 1.7, top + 1.78, false); }
  // the middle cave inside: a brick floor, the kang across the back (mat, quilts, table, lamp), the stove beside it, a cupboard, a niche
  const [a, b] = caves[mid], vb = D - back;
  B('brick_grey', a, face, b, vb, F - 0.1, F + 0.01);
  B('brick_grey', a, vb - 1.7, b, vb, F, F + 0.62, true); B('reed_mat', a + 0.05, vb - 1.65, b - 0.05, vb - 0.05, F + 0.62, F + 0.64);
  B('cloth_red', a + 0.1, vb - 0.7, a + 1.1, vb - 0.1, F + 0.64, F + 0.85); B('cloth_indigo', a + 1.15, vb - 0.7, b - 0.15, vb - 0.1, F + 0.64, F + 0.82);
  const tx = (a + b) / 2, tz = vb - 0.85;
  B('lacquer_chestnut', tx - 0.4, tz - 0.3, tx + 0.4, tz + 0.3, F + 0.86, F + 0.91);
  for (const [p, q] of [[-0.36, -0.26], [0.32, -0.26], [-0.36, 0.22], [0.32, 0.22]]) B('lacquer_chestnut', tx + p, tz + q, tx + p + 0.04, tz + q + 0.04, F + 0.64, F + 0.86);
  B('brick_grey', a, vb - 2.7, a + 0.8, vb - 1.7, F, F + 0.8, true); pot('iron', a + 0.4, vb - 2.2, 0.3, 0.24, F + 0.8);
  B('brick_grey', a, vb - 2.3, a + 0.25, vb - 2.1, F + 0.8, F + 3.0);                                   // the flue up the pier's face
  B('lacquer_chestnut', b - 0.55, face + 0.5, b - 0.02, face + 1.6, F, F + 1.7, true); B('lacquer_chestnut', b - 0.6, face + 0.45, b - 0.0, face + 1.65, F + 1.7, F + 1.76);   // the cupboard
  for (const dv of [0.3, 0.8]) B('wood_dark', b - 0.58, face + 0.5 + dv - 0.01, b - 0.55, face + 0.5 + dv + 0.01, F + 0.3, F + 1.5);
  pot('glaze_green', a + 0.35, face + 0.6, 0.38, 0.85, F);
  B('plaster_white', a - 0.02, vb - 3.6, a + 0.0, vb - 3.0, F + 1.3, F + 1.9, false);                    // the niche: a small recess in the pier, picked out in plaster
  B('paint_ochre', b + 0.0, vb - 0.03, b + 0.0, vb, F + 1.6, F + 2.2, false);
  for (const u of [tx - 0.5, tx + 0.5]) for (let j = 0; j < 3; j++) B('paint_ochre', u - 0.05, vb - 2.2 + j * 0.02, u + 0.05, vb - 2.1 + j * 0.02, F + 3.0 - 0.3 - j * 0.28, F + 3.0 - j * 0.28);
  // weathering and the fronts' differences: smoke over the door, fallen plaster at the piers, a stone or brick ring by the seed
  B('bark_dark', (a + b) / 2 - 0.5, -0.05, (a + b) / 2 + 0.5, 0, F + 2.0, F + 2.5, false);
  for (let i = 0; i < 3; i++) { const u = rand() * (L - 1.2); B('brick_buff', u, -0.03, u + 0.5 + rand() * 0.5, 0, F + 0.4 + rand() * 1.6, F + 0.9 + rand() * 1.4, false); }
}
