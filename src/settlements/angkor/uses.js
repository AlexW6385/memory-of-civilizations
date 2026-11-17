// Angkor — the uses of the village's houses, their fronts, the village shrines and the paddies (docs/settlements/angkor.md §24–§26).
// Elements added to the khmer style (names ak_*), built in the same plans as the houses and the stores so that their
// materials merge into the meshes already there. Everything here stands on what holds it: wall-hung things on the wall's
// inner face, floor things on the floor of the house (houseUp), shrines on their plinth, rice rows on the ground.

import { STYLES } from '../../core/build.js';
import '../../styles/khmer/index.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../../styles/ming/index.js';
import { frame, boxR, jar, houseUp, variantOf } from '../../styles/khmer/village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── which house gets which use ────────────────────────────────────────────────────────────────────────────────────
export const USES = ['altar', 'cradle', 'nets', 'rice', 'dye'];
/** The use of a house's front-left corner (or none): by its front design and its seed; houses too small for it get none. */
export function useOf(h) {
  const hF = Math.abs(h.front === 'e' || h.front === 'w' ? h.rect[2] - h.rect[0] : h.rect[3] - h.rect[1]) / 2, hS = Math.abs(h.front === 'e' || h.front === 'w' ? h.rect[3] - h.rect[1] : h.rect[2] - h.rect[0]) / 2;
  if (hS < 2.2 || hF < 3.0 || (h.seed || 1) % 7 === 0) return null;
  const v = variantOf(h), s = h.seed || 1;
  if (v === 'shop') return ['dye', 'rice'][s % 2];
  if (v === 'tile') return 'altar';
  if (v === 'porch') return ['nets', 'cradle'][s % 2];
  return USES[s % 5];
}
/** The dressing of the front wall: 'curtain' (a cloth tied back at the doorpost), 'strings' (chillies and gourds hung from the plate), 'cage' (a songbird's cage), or none. */
export function frontOf(h) {
  const v = variantOf(h), s = Math.floor((h.seed || 1) / 5);
  if (h.kind === 'small' || s % 4 === 3) return null;
  if (v === 'tile') return s % 2 ? 'cage' : null;
  return ['curtain', 'strings', 'cage'][s % 3];
}

// ── the use, inside the house ─────────────────────────────────────────────────────────────────────────────────────
function useIn(el, { bag, col }) {
  const { W, R, hF, hS } = frame(el.rect, el.front), up = houseUp(el), use = el.use;
  const at = (u, v) => W(u, v);
  const sack = (u, v, y) => { const [x, z] = at(u, v); bag.add('sacking', lathe([[0.001, 0], [0.2, 0], [0.25, 0.15], [0.22, 0.4], [0.12, 0.5], [0.001, 0.52]], 9, null, x, y, z)); };
  if (use === 'altar') {
    // a household shelf on the left wall: a board on two brackets, a stone linga on its base, a bowl of lotus buds, a bowl of incense, a lamp; a kneeling mat before it
    const lo = hF * 0.3 + 0.7, hi = hF - 0.35, vc = (lo + hi) / 2, uw = -hS;
    bag.add('timber', boxR(R(uw + 0.04, uw + 0.36, vc - 0.4, vc + 0.4), up + 1.15, up + 1.19));
    for (const dv of [-0.33, 0.33]) bag.add('timber', boxR(R(uw + 0.04, uw + 0.1, vc + dv - 0.025, vc + dv + 0.025), up + 0.95, up + 1.15));
    bag.add('sandstone_khmer', boxR(R(uw + 0.07, uw + 0.33, vc - 0.13, vc + 0.13), up + 1.19, up + 1.24));
    { const [x, z] = at(uw + 0.2, vc); bag.add('sandstone_carved', lathe([[0.001, 0], [0.05, 0], [0.05, 0.13], [0.035, 0.18], [0.001, 0.2]], 8, null, x, up + 1.24, z)); }
    for (const [dv, mat] of [[-0.27, 'stucco_rose'], [0.27, null]]) {
      const [x, z] = at(uw + 0.2, vc + dv);
      bag.add('bronze', lathe([[0.001, 0], [0.05, 0], [0.075, 0.04], [0.08, 0.07], [0.001, 0.06]], 8, null, x, up + 1.19, z));
      if (mat) bag.add(mat, lathe([[0.001, 0.06], [0.03, 0.08], [0.025, 0.15], [0.001, 0.19]], 6, null, x, up + 1.19, z));
      else for (const d of [-0.02, 0, 0.02]) bag.add('timber', boxR(R(uw + 0.2 - 0.004 + d, uw + 0.2 + 0.004 + d, vc + dv - 0.004, vc + dv + 0.004), up + 1.25, up + 1.4));
    }
    { const [x, z] = at(uw + 0.14, vc + 0.08); bag.add('flame', lathe([[0.001, 0], [0.012, 0.045], [0.001, 0.09]], 4, null, x, up + 1.19 + 0.09, z)); }
    bag.add('reed_mat', boxR(R(uw + 0.55, uw + 1.35, vc - 0.4, vc + 0.4), up, up + 0.012));
  } else if (use === 'cradle') {
    // a wicker cradle on two rockers with a blanket in it, a spindle basket beside it
    const u = -hS + 0.9, v = hF - 1.0, [x, z] = at(u, v);
    for (const dv of [-0.3, 0.3]) bag.add('timber', boxR(R(u - 0.4, u + 0.4, v + dv - 0.025, v + dv + 0.025), up, up + 0.06));
    bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.3, 0.12], [0.33, 0.26], [0.29, 0.27], [0.001, 0.2]], 10, null, x, up + 0.06, z));
    bag.add('cloth_ochre', boxR(R(u - 0.17, u + 0.17, v - 0.2, v + 0.2), up + 0.3, up + 0.33));
    col.circle(x, z, 0.38, up, up + 0.4);
    const [bx, bz] = at(u + 0.75, v + 0.05); bag.add('wicker', lathe([[0.001, 0], [0.14, 0], [0.18, 0.1], [0.16, 0.2], [0.001, 0.2]], 8, null, bx, up, bz)); col.circle(bx, bz, 0.2, up, up + 0.2);
  } else if (use === 'nets') {
    // a fisherman's: a net hung on the right wall (ropes in a lattice, floats along its head), two conical fish traps on the floor
    const v0 = hF - 2.3, v1 = hF - 0.5, uw = hS - 0.036;
    for (let k = 0; k < 5; k++) { const y = up + 0.5 + k * 0.3; bag.add('rope_fibre', boxR(R(uw - 0.03, uw - 0.012, v0, v1), y, y + 0.012)); }
    for (let k = 0; k <= 6; k++) { const v = v0 + k * (v1 - v0) / 6; bag.add('rope_fibre', boxR(R(uw - 0.03, uw - 0.012, v - 0.006, v + 0.006), up + 0.5, up + 1.7)); }
    for (let k = 0; k < 6; k++) { const v = v0 + 0.15 + k * (v1 - v0 - 0.3) / 5; bag.add('timber', boxR(R(uw - 0.05, uw - 0.012, v - 0.04, v + 0.04), up + 1.714, up + 1.774)); }
    for (const [u, v] of [[-hS + 0.6, hF - 0.8], [-hS + 1.05, hF - 1.4]]) { const [x, z] = at(u, v); bag.add('wicker', lathe([[0.001, 0], [0.22, 0], [0.2, 0.1], [0.08, 0.6], [0.05, 0.7], [0.001, 0.7]], 9, null, x, up, z)); col.circle(x, z, 0.24, up, up + 0.7); }
  } else if (use === 'rice') {
    // the store of the husked grain: sacks (two and one on them), a big jar, a winnowing tray with a heap of rice on it
    sack(-hS + 0.4, hF - 0.55, up); sack(-hS + 0.95, hF - 0.5, up); sack(-hS + 0.68, hF - 0.53, up + 0.38);
    for (const [u, v] of [[-hS + 0.4, hF - 0.55], [-hS + 0.95, hF - 0.5]]) { const [x, z] = at(u, v); col.circle(x, z, 0.26, up, up + 0.9); }
    { const [x, z] = at(-hS + 1.0, hF - 1.5); bag.add('wicker', lathe([[0.001, 0], [0.46, 0], [0.46, 0.045], [0.4, 0.04], [0.001, 0.04]], 12, null, x, up, z)); bag.add('reed_mat', lathe([[0.001, 0.14], [0.14, 0.07], [0.3, 0.04], [0.001, 0.04]], 10, null, x, up, z)); }
    { const [x, z] = at(-hS + 0.45, hF - 2.35); jar(bag, x, z, up, 1.0, 'pottery_dark'); col.circle(x, z, 0.3, up, up + 0.7); }
  } else if (use === 'dye') {
    // a dyer's and weaver's: a drying pole on the wall and a post with dyed cloths hung from it, two pots of indigo and madder below
    const v = hF - 1.0, pu = -0.85, [px, pz] = at(pu, v);
    bag.add('bamboo_culm', boxR(R(-hS + 0.04, pu, v - 0.025, v + 0.025), up + 1.6, up + 1.65));
    bag.add('bamboo_culm', lathe([[0.04, 0], [0.035, 1.65]], 6, null, px, up, pz)); col.circle(px, pz, 0.06, up, up + 1.65);
    const cl = ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_indigo'];
    for (let k = 0, u = -hS + 0.4; u + 0.22 <= pu - 0.05 && k < 4; k++, u += 0.55) bag.add(cl[k], boxR(R(u - 0.22, u + 0.22, v - 0.015, v + 0.015), up + 0.45 + (k % 2) * 0.15, up + 1.6));
    for (const [u, c] of [[-hS + 0.5, 'cloth_indigo'], [-hS + 1.1, 'cloth_red']]) { const [x, z] = at(u, hF - 0.45); jar(bag, x, z, up, 1.0, 'pottery_dark'); bag.add(c, lathe([[0.001, 0.69], [0.16, 0.69], [0.16, 0.7], [0.001, 0.7]], 8, null, x, up, z)); col.circle(x, z, 0.3, up, up + 0.7); }
  }
}

// ── the dressing of the front wall ─────────────────────────────────────────────────────────────────────────────────
function frontIn(el, { bag }) {
  const { W, R, hF, hS } = frame(el.rect, el.front), up = houseUp(el), f = el.dress, doorW = 0.5, rand = rng((el.seed || 1) * 31 + 7), wallH = variantOf(el) === 'tile' ? 2.45 : 2.25;
  if (f === 'curtain') {
    // the door's cloth, tied back at the right doorpost: a drop of cloth against the wall, a tie of fibre
    const c = ['cloth_red', 'cloth_indigo', 'cloth_ochre'][Math.floor(rand() * 3)];
    bag.add(c, boxR(R(doorW + 0.16, doorW + 0.4, hF + 0.036, hF + 0.075), up + 0.25, up + 1.92));
    bag.add('rope_fibre', boxR(R(doorW + 0.14, doorW + 0.42, hF + 0.075, hF + 0.095), up + 1.0, up + 1.05));
  } else if (f === 'strings') {
    // strings of red chillies and of dried gourds hung from the front plate on either side of the door
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
      const u = s * (1.0 + k * 0.38), n = 4 + Math.floor(rand() * 3), top = up + wallH - 0.12, len = 0.5 + 0.12 * n;
      if (Math.abs(u) > hS - 0.3) continue;
      bag.add('bamboo_culm', boxR(R(u - 0.012, u + 0.012, hF + 0.08, hF + 0.15), top - 0.04, top - 0.01));
      bag.add('rope_fibre', boxR(R(u - 0.006, u + 0.006, hF + 0.138, hF + 0.15), top - len, top - 0.04));
      for (let i = 0; i < n; i++) { const [x, z] = W(u, hF + 0.144), y = top - 0.25 - i * 0.12; if (k) bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.04], [0.09, 0.12], [0.05, 0.22], [0.001, 0.24]], 7, null, x, y - 0.24, z)); else bag.add('cloth_red', boxR(R(u - 0.04, u + 0.04, hF + 0.104, hF + 0.184), y - 0.1, y)); }
    }
  } else if (f === 'cage') {
    // a songbird's cage of split bamboo hung from the plate on a cord, a bowl of seed on its floor
    const u = (rand() < 0.5 ? -1 : 1) * (1.15 + rand() * 0.4), [x, z] = W(u, hF + 0.445), top = up + wallH - 0.12;
    bag.add('bamboo_culm', boxR(R(u - 0.015, u + 0.015, hF + 0.08, hF + 0.46), top - 0.14, top - 0.1));
    bag.add('rope_fibre', boxR(R(u - 0.006, u + 0.006, hF + 0.439, hF + 0.451), top - 0.45, top - 0.14));
    bag.add('bamboo_culm', lathe([[0.17, 0], [0.2, 0.1], [0.17, 0.26], [0.1, 0.34], [0.001, 0.36]], 10, null, x, top - 0.45 - 0.36, z));
    bag.add('timber', lathe([[0.001, 0], [0.18, 0], [0.18, 0.025], [0.001, 0.025]], 10, null, x, top - 0.45 - 0.36, z));
  }
}

// ── the shrine of a village: a little prasat of brick ───────────────────────────────────────────────────────────────
/** ak_shrine: { at, seed } — a sanctuary of brick on a laterite plinth, its door to the east: a linga on its base inside, offerings before it. */
function shrine(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.at, P = 2.2, top = 0.6, hw = 1.4, ih = 0.7, wallTop = top + 2.0, dw = 0.45, dh = 1.7;
  // the plinth (laterite between two sandstone mouldings) and its step on the east side
  bag.add('sandstone_carved', box(cx - P, 0, cz - P, cx + P, 0.12, cz + P));
  bag.add('laterite', box(cx - P + 0.1, 0.12, cz - P + 0.1, cx + P - 0.1, top - 0.05, cz + P - 0.1));
  bag.add('sandstone_khmer', box(cx - P, top - 0.05, cz - P, cx + P, top, cz + P));
  col.floor([cx - P, cz - P, cx + P, cz + P], top); col.rect([cx - P, cz - P, cx + P, cz + P], -0.3, top - 0.01);
  STYLES.qing.elements.stairs({ rect: [cx + P, cz - 0.9, cx + P + 0.9, cz + 0.9], y0: 0, y1: top, dir: 'w', mat: 'sandstone_khmer' }, ctx);
  // the body: brick walls 0.7 thick round a cella 1.4 m square, a doorway in the east wall
  const wall = (r, y0 = top, y1 = wallTop) => { bag.add('brick', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1 + 0.001); };
  wall([cx - hw, cz - hw, cx + hw, cz - ih]); wall([cx - hw, cz + ih, cx + hw, cz + hw]); wall([cx - hw, cz - ih, cx - ih, cz + ih]);
  for (const s of [-1, 1]) wall([cx + ih, s < 0 ? cz - ih : cz + dw, cx + hw, s < 0 ? cz - dw : cz + ih]);
  wall([cx + ih, cz - dw, cx + hw, cz + dw], top + dh, wallTop);
  // doorway frame in sandstone: two jambs, a lintel; false doors on the other three faces
  for (const s of [-1, 1]) bag.add('sandstone_carved', box(cx + hw - 0.05, top, s < 0 ? cz - dw - 0.16 : cz + dw, cx + hw + 0.12, top + dh + 0.25, s < 0 ? cz - dw : cz + dw + 0.16));
  bag.add('sandstone_carved', box(cx + hw - 0.05, top + dh, cz - dw - 0.16, cx + hw + 0.12, top + dh + 0.25, cz + dw + 0.16));
  bag.add('sandstone_khmer', box(cx + hw - 0.05, top + dh + 0.25, cz - dw - 0.3, cx + hw + 0.18, top + dh + 0.42, cz + dw + 0.3));
  bag.add('sandstone_carved', box(cx - hw - 0.08, top + 0.15, cz - 0.5, cx - hw, top + 1.9, cz + 0.5));
  for (const s of [-1, 1]) bag.add('sandstone_carved', box(cx - 0.5, top + 0.15, s < 0 ? cz - hw - 0.08 : cz + hw, cx + 0.5, top + 1.9, s < 0 ? cz - hw : cz + hw + 0.08));
  // a cornice, then the roof of corbelled tiers narrowing to a lotus-bud finial
  bag.add('sandstone_carved', box(cx - hw - 0.1, wallTop, cz - hw - 0.1, cx + hw + 0.1, wallTop + 0.16, cz + hw + 0.1));
  bag.add('brick', box(cx - hw, wallTop + 0.16, cz - hw, cx + hw, wallTop + 0.6, cz + hw));
  let y = wallTop + 0.6;
  for (const [h, hh] of [[1.2, 0.5], [0.95, 0.45], [0.7, 0.4], [0.45, 0.35]]) {
    bag.add('sandstone_carved', box(cx - h - 0.1, y, cz - h - 0.1, cx + h + 0.1, y + 0.07, cz + h + 0.1));
    bag.add('brick', box(cx - h, y + 0.07, cz - h, cx + h, y + hh, cz + h)); y += hh;
  }
  bag.add('sandstone_khmer', lathe([[0.4, 0], [0.34, 0.08], [0.36, 0.18], [0.26, 0.36], [0.14, 0.62], [0.001, 0.9]], 10, null, cx, y, cz));
  col.rect([cx - hw, cz - hw, cx + hw, cz + hw], wallTop, y + 0.9);
  // inside: the linga on its base (the spout to the north), a lamp in a niche
  bag.add('sandstone_khmer', box(cx - 0.5, top, cz - 0.3, cx + 0.1, top + 0.15, cz + 0.3)); bag.add('sandstone_khmer', box(cx - 0.38, top, cz - 0.62, cx - 0.22, top + 0.1, cz - 0.3));
  bag.add('sandstone_carved', lathe([[0.001, 0], [0.1, 0], [0.1, 0.4], [0.07, 0.5], [0.001, 0.53]], 10, null, cx - 0.2, top + 0.15, cz));
  col.rect([cx - 0.5, cz - 0.3, cx + 0.1, cz + 0.3], top, top + 0.7);
  bag.add('bronze', lathe([[0.001, 0], [0.05, 0], [0.07, 0.04], [0.001, 0.05]], 8, null, cx + 0.45, top, cz + 0.45));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.045], [0.001, 0.09]], 4, null, cx + 0.45, top + 0.05, cz + 0.45));
  if (ctx.lights) ctx.lights.push({ at: [cx + 0.2, top + 1.2, cz + 0.2], color: '#ffb25a', intensity: 2.2, distance: 4.5 });
  // before the door on the plinth: a stone offering table with a bowl of lotus buds and a lamp
  bag.add('sandstone_khmer', box(cx + 1.7, top, cz + 0.75, cx + 2.05, top + 0.45, cz + 1.35)); bag.add('sandstone_carved', box(cx + 1.65, top + 0.45, cz + 0.7, cx + 2.1, top + 0.5, cz + 1.4));
  col.rect([cx + 1.65, cz + 0.7, cx + 2.1, cz + 1.4], top, top + 0.5);
  bag.add('bronze', lathe([[0.001, 0], [0.06, 0], [0.12, 0.06], [0.13, 0.1], [0.001, 0.09]], 10, null, cx + 1.87, top + 0.5, cz + 1.05));
  bag.add('stucco_rose', lathe([[0.001, 0.08], [0.06, 0.1], [0.08, 0.18], [0.001, 0.26]], 8, null, cx + 1.87, top + 0.5, cz + 1.05));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.045], [0.001, 0.09]], 4, null, cx + 1.87, top + 0.5, cz + 1.25));
}

// ── the paddy ─────────────────────────────────────────────────────────────────────────────────────────────────────
const STAGE = { seedling: ['papyrus', 0.16], green: ['palm_leaf', 0.58], ripe: ['reed_mat', 0.88], plough: ['mud_plaster', 0.11] };
/** ak_paddy: { rect, stage ('seedling' | 'green' | 'ripe' | 'plough'), seed } — rows of rice (low ridges of leaf, in clumps of varying height) or, ploughed, furrows of turned mud. */
function paddy(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, [mat, h0] = STAGE[el.stage] ?? STAGE.green, rand = rng(el.seed || 1), alongX = x1 - x0 >= z1 - z0;
  const L = alongX ? x1 - x0 : z1 - z0, Wd = alongX ? z1 - z0 : x1 - x0, sp = el.stage === 'plough' ? 0.5 : 0.5, hb = el.stage === 'plough' ? 0.26 : 0.4, nseg = Math.max(2, Math.round(L / 3));
  const T = [];
  const quad = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  const pt = (s, o, y) => (alongX ? [x0 + s, y, z0 + o] : [x0 + o, y, z0 + s]);
  for (let o = 0.6; o < Wd - 0.5; o += sp) {
    let prev = null;
    for (let i = 0; i <= nseg; i++) {
      const s = 0.4 + (L - 0.8) * i / nseg, h = h0 * (0.8 + rand() * 0.4), cur = { L: pt(s, o - hb / 2, 0.01), R: pt(s, o + hb / 2, 0.01), A: pt(s, o, h) };
      if (prev) { quad(prev.L, prev.A, cur.A, cur.L); quad(prev.A, prev.R, cur.R, cur.A); }
      prev = cur;
    }
  }
  bag.add(mat, fromTriangles(T));
  if (el.stage !== 'plough') {
    // the mud between the rows (a dull flat slab, 2 cm proud) so that the field reads as wet earth under the crop
    bag.add('mud_plaster', box(x0 + 0.3, 0, z0 + 0.3, x1 - 0.3, 0.02, z1 - 0.3));
  }
}

/** ak_plough: { at, rot } — a wooden plough drawn by a buffalo: a yoke across its neck, a long beam back to the share, a handle. Its origin the animal's; the animal faces −z at rot 0. */
function plough(el, { bag }) {
  const [ax, az] = el.at, r = el.rot ?? 0, c = Math.cos(r), s = Math.sin(r);
  const T = (lx, y, lz) => [ax + lx * c + lz * s, y, az - lx * s + lz * c];
  const t = [], u = [];
  beamTris(t, T(-0.62, 1.12, -0.7), T(0.62, 1.12, -0.7), 0.07, 0.08);            // the yoke across the neck
  for (const sg of [-1, 1]) {                                                       // a shaft down each side of the animal, then in to the plough
    beamTris(t, T(sg * 0.62, 1.0, -0.7), T(sg * 0.62, 0.95, 1.4), 0.05, 0.07);
    beamTris(t, T(sg * 0.62, 0.95, 1.4), T(0, 0.32, 2.3), 0.05, 0.07);
  }
  beamTris(t, T(0, 0.3, 2.3), T(0, 1.0, 2.85), 0.06, 0.07);                       // the handle
  beamTris(t, T(0, 0.62, 2.45), T(0, 0.98, 2.62), 0.05, 0.05);                    // its brace
  beamTris(u, T(0, 0.32, 2.3), T(0, 0.02, 1.95), 0.1, 0.05);                      // the share: an iron-shod point
  beamTris(t, T(-0.16, 1.0, 2.85), T(0.16, 1.0, 2.85), 0.04, 0.04);               // the crossbar of the handle
  bag.add('timber', fromTriangles(t)); bag.add('bronze', fromTriangles(u));
}

Object.assign(STYLES.khmer.elements, { ak_use: useIn, ak_front: frontIn, ak_shrine: shrine, ak_paddy: paddy, ak_plough: plough });
export { useIn, frontIn, shrine, paddy, plough };
