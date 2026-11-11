// The dressing of Machu Picchu's kanchas, storehouses, temples and plaza (docs/settlements/machu-picchu.md §11):
// the things of the patios (drying mats with chuño and maize, firewood, guinea-pig cells, urpu, washing,
// the open hearth, the grindstone, a stone seat), strings of maize cobs under the eaves, the storehouses' bins
// and sacks, the offerings on the Main Temple's altar, the Temple of the Condor's carved rock, a feast's jars.
// All merged into the element's bag: one mesh per material, nothing per-pixel.

import { box, lathe, frustum, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { urpu } from './life.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_black', 'cloth_white'];

function olla(bag, x, y, z, r, mat = 'pottery_dark') {
  bag.add(mat, lathe([[0.001, 0], [r * 0.6, 0], [r * 0.95, r * 0.45], [r, r * 0.8], [r * 0.75, r * 1.25], [r * 0.62, r * 1.35], [r * 0.68, r * 1.45], [r * 0.58, r * 1.42], [r * 0.5, r * 1.3], [0.001, r * 1.25]], 10, null, x, y, z));
}
/** A low heap (a cone of grains or tubers) at (x, y, z), radius r, height h, in a material. */
function heap(bag, mat, x, y, z, r, h, seg = 8) { bag.add(mat, lathe([[r, 0], [r * 0.82, h * 0.45], [r * 0.45, h * 0.85], [0.001, h]], seg, null, x, y, z)); }
/** An upright box turned by yaw about its centre: the half sizes (hu along the yaw's direction, hw across). */
function blk(bag, mat, x, y0, z, hu, hw, h, yaw, col = null) {
  const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, w) => [x + u * c - w * s, z + u * s + w * c];
  const a = [P(-hu, -hw), P(hu, -hw), P(hu, hw), P(-hu, hw)], t = [];
  const top = a.map(([px, pz]) => [px, y0 + h, pz]), bot = a.map(([px, pz]) => [px, y0, pz]);
  t.push(...top[0], ...top[2], ...top[1], ...top[0], ...top[3], ...top[2]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...bot[i], ...top[i], ...top[j], ...bot[i], ...top[j], ...bot[j]); }
  bag.add(mat, fromTriangles(orientOutward(t)));
  if (col) col.circle(x, z, Math.hypot(hu, hw) * 0.85, y0, y0 + h);
}
/** A cuy: a guinea pig, 0.25 m long, a lathe body squashed lengthwise, a little head, ears. */
function cuy(bag, x, y, z, yaw, mat) {
  const b = lathe([[0.001, 0], [0.045, 0.01], [0.06, 0.05], [0.05, 0.1], [0.02, 0.125], [0.001, 0.127]], 7); b.scale(1, 0.85, 1.7); b.rotateY(yaw); b.translate(x, y, z);
  bag.add(mat, b);
  const hx = x + Math.sin(yaw) * 0.12, hz = z + Math.cos(yaw) * 0.12;
  bag.add(mat, lathe([[0.001, 0], [0.035, 0.01], [0.04, 0.05], [0.001, 0.08]], 6, null, hx, y + 0.01, hz));
}

// ---- the patio -----------------------------------------------------------------------------------
/**
 * inca_patio: the things of a kancha's patio { o: [x, z] (the gate's centre), d: [dx, dz] (inward unit), A, D, sd, sv0, sv1, bd,
 * weaver (a loom stands in the middle), y, seed }. Local (v in from the gate, u across): the free ground is the corridor between the
 * side houses and the strip before the back house. Placed by rejection (nothing within 1.1 m of another thing, nothing on the loom):
 * drying mats with heaps of chuño (freeze-dried potatoes, dark) or maize, a stack of firewood, a cell of guinea pigs, a cluster of
 * urpu leaning together, a line of washing between two posts, the open hearth of three stones with a pot, a grindstone, a stone seat
 * [stated: the Andean house's mats, pots, jars, grinding stones — ancient-history-sites; chuño dried on the ground — general;
 * inferred: the arrangement, after the patios of today's Andean houses; guinea pigs (cuy) kept at the house — general].
 */
function patio(el, { bag, col }) {
  const rand = rng((el.seed || 1) * 13 + 5), [ox, oz] = el.o, [dx, dz] = el.d, y = el.y ?? 0, { A, D, sd, sv0, sv1, bd } = el;
  const W = (v, u) => [ox + dx * v - dz * u, oz + dz * v + dx * u], ang = Math.atan2(dx, dz);
  const free = (v, u, r) => {
    if (v < 0.8 + r || v > D - bd - 0.7 - r || Math.abs(u) > A / 2 - 0.7 - r) return false;
    if (v > sv0 - 0.6 - r && v < sv1 + 0.6 + r && Math.abs(u) > A / 2 - sd - 0.6 - r) return false;
    if (el.weaver && Math.abs(u) < 1.4 + r && v > 3.6 - r && v < 9.4 + r) return false;
    return true;
  };
  const placed = [];
  const spot = (r, vlo = 0, vhi = 99) => {
    for (let k = 0; k < 40; k++) {
      const v = Math.max(vlo, 0.8) + rand() * (Math.min(vhi, D - bd) - Math.max(vlo, 0.8)), u = (rand() * 2 - 1) * (A / 2);
      if (!free(v, u, r) || placed.some(([pv, pu, pr]) => Math.hypot(pv - v, pu - u) < pr + 0.55 + r)) continue;
      placed.push([v, u, r]);
      return { v, u, p: W(v, u) };
    }
    return null;
  };
  const kinds = ['mat', 'wood', 'cuy', 'urpu', 'wash', 'hearth', 'grind', 'seat'];
  // each patio has four or five of the eight, the mats nearly always
  const want = [rand() < 0.85 ? 'mat' : 'seat'];
  for (const k of kinds.sort(() => rand() - 0.5)) if (want.length < 4 + (rand() < 0.5 ? 1 : 0) && !want.includes(k)) want.push(k);
  for (const k of want) {
    if (k === 'mat') {
      const s = spot(1.0); if (!s) continue;
      const [x, z] = s.p, hu = 0.85, hw = 0.6;
      blk(bag, 'reed_mat', x, y + 0.002, z, hu, hw, 0.025, ang);
      const dark = rand() < 0.55, c = Math.cos(ang), sn = Math.sin(ang);
      for (let i = 0; i < 9; i++) {
        const u = (rand() * 2 - 1) * (hu - 0.15), w = (rand() * 2 - 1) * (hw - 0.14), r = 0.07 + rand() * 0.05;
        heap(bag, dark ? 'pottery_dark' : 'paint_ochre', x + u * c - w * sn, y + 0.025, z + u * sn + w * c, r, r * 0.8, 6);
      }
    } else if (k === 'wood') {
      const s = spot(0.7); if (!s) continue;
      const [x, z] = s.p, c = Math.cos(ang + Math.PI / 2), sn = Math.sin(ang + Math.PI / 2), L = 0.65;
      for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) {
        const off = (i - (3 - row) / 2) * 0.12, px = x + c * off * -1, pz = z + sn * off * -1, yy = y + 0.05 + row * 0.1;
        const jx = Math.cos(ang) * L / 2, jz = -Math.sin(ang) * L / 2;
        bag.add('timber', rod([px - jx, yy, pz - jz], [px + jx, yy, pz + jz], 0.05, 5));
      }
      col.circle(x, z, 0.4, y, y + 0.35);
    } else if (k === 'cuy') {
      // a low cell of rough stones, a lid of reeds over half of it, guinea pigs in the open half
      const s = spot(0.9); if (!s) continue;
      const [x, z] = s.p, c = Math.cos(ang), sn = Math.sin(ang), hu = 0.7, hw = 0.45;
      for (const [u, w, a, b] of [[0, -hw, hu, 0.07], [0, hw, hu, 0.07], [-hu, 0, 0.07, hw], [hu, 0, 0.07, hw]]) blk(bag, 'granite_rough', x + u * c - w * sn, y - 0.02, z + u * sn + w * c, a, b, 0.5, ang);
      blk(bag, 'reed_mat', x + 0.35 * c, y + 0.5, z + 0.35 * sn, 0.38, hw + 0.06, 0.05, ang);
      col.circle(x, z, 0.8, y, y + 0.5);
      bag.add('mud_plaster', box(x - hu + 0.1, y - 0.01, z - hw + 0.1, x + hu - 0.1, y + 0.03, z + hw - 0.1));
      const mats = ['hide_tan', 'hide_white', 'hide_brown', 'hide_tan'];
      for (let i = 0; i < 4; i++) { const u = -0.45 + rand() * 0.25 - (i % 2) * 0.1, w = (rand() * 2 - 1) * (hw - 0.15); cuy(bag, x + u * c - w * sn, y + 0.03, z + u * sn + w * c, rand() * 6.28, mats[i]); }
    } else if (k === 'urpu') {
      const s = spot(0.8); if (!s) continue;
      const [x, z] = s.p;
      const n = 2 + (rand() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) { const a = i * 2.1 + rand(), px = x + Math.cos(a) * 0.32, pz = z + Math.sin(a) * 0.32; urpu(bag, px, y - 0.04, pz, 0.62 + rand() * 0.25, rand() * 6.28); col.circle(px, pz, 0.2, y, y + 0.7); }
    } else if (k === 'wash') {
      // two posts and a cord between them, three cloths hung over it
      const s = spot(1.2, 1.5); if (!s) continue;
      const [x, z] = s.p, c = Math.cos(ang + Math.PI / 2), sn = Math.sin(ang + Math.PI / 2), hl = 1.15;
      for (const sg of [-1, 1]) { bag.add('wood_dark', rod([x + c * hl * sg, y - 0.2, z + sn * hl * sg], [x + c * hl * sg, y + 1.65, z + sn * hl * sg], 0.04, 6)); col.circle(x + c * hl * sg, z + sn * hl * sg, 0.05, y, y + 1.6); }
      bag.add('rope_fibre', rod([x - c * hl, y + 1.55, z - sn * hl], [x + c * hl, y + 1.5, z + sn * hl], 0.01, 4));
      for (let i = 0; i < 3; i++) {
        const t = (i + 0.5) / 3 * 2 - 1, cx = x + c * hl * t * 0.8, cz = z + sn * hl * t * 0.8, w = 0.34 + rand() * 0.15, hh = 0.55 + rand() * 0.3;
        blk(bag, CLOTH[Math.floor(rand() * 5)], cx, y + 1.52 - hh, cz, w / 2, 0.012, hh, ang + Math.PI / 2);
      }
    } else if (k === 'hearth') {
      // the open hearth: three stones, a pot, ash and sticks
      const s = spot(0.8); if (!s) continue;
      const [x, z] = s.p;
      for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.4, px = x + Math.cos(a) * 0.2, pz = z + Math.sin(a) * 0.2; bag.add('granite_rough', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.2], [0.06, 0.27], [0.001, 0.27]], 6, null, px, y, pz)); }
      bag.add('pottery_dark', lathe([[0.001, 0.01], [0.3, 0.01], [0.3, 0.02], [0.001, 0.03]], 10, null, x, y, z));
      olla(bag, x, y + 0.27, z, 0.15);
      for (let i = 0; i < 3; i++) { const a = rand() * 6.28; bag.add('timber', rod([x + Math.cos(a) * 0.55, y + 0.03, z + Math.sin(a) * 0.55], [x + Math.cos(a) * 0.15, y + 0.04, z + Math.sin(a) * 0.15], 0.02, 5)); }
      col.circle(x, z, 0.3, y, y + 0.3);
    } else if (k === 'grind') {
      const s = spot(0.7); if (!s) continue;
      const [x, z] = s.p;
      bag.add('granite_rough', frustum([x - 0.28, z - 0.2, x + 0.28, z + 0.2], y - 0.02, y + 0.1, 0.03, 0.03, 0.03, 0.03));
      bag.add('granite_rough', lathe([[0.001, 0], [0.09, 0.01], [0.12, 0.06], [0.1, 0.11], [0.001, 0.13]], 8, null, x, y + 0.1, z));
      bag.add('reed_mat', box(x - 0.45, y, z + 0.28, x + 0.45, y + 0.02, z + 0.8));
      heap(bag, 'paint_ochre', x + 0.3, y + 0.02, z + 0.55, 0.1, 0.08, 6);
    } else if (k === 'seat') {
      const s = spot(0.8); if (!s) continue;
      const [x, z] = s.p;
      blk(bag, 'granite_inca', x, y + 0.2, z, 0.5, 0.2, 0.12, ang + Math.PI / 2 * 0);
      for (const sg of [-1, 1]) blk(bag, 'granite_rough', x + Math.sin(ang + Math.PI / 2) * 0 + Math.cos(ang) * 0.32 * sg, y - 0.02, z - Math.sin(ang) * 0.32 * sg, 0.12, 0.14, 0.22, ang);
      col.circle(x, z, 0.5, y, y + 0.32);
    }
  }
}

/**
 * inca_cobs: strings of maize cobs hung to dry under a house's eaves { items: [{ at: [x, z], n (the facing's unit), y }] }: a cord
 * along the wall with ten cobs hung in pairs, the husks turned back [inferred: after the maize of today's Andean houses].
 */
function cobs(el, { bag }) {
  for (const it of el.items) {
    const [x, z] = it.at, [nx, nz] = it.n, tx = -nz, tz = nx, y = it.y, L = it.len ?? 1.0;
    bag.add('rope_fibre', rod([x - tx * L / 2, y, z - tz * L / 2], [x + tx * L / 2, y - 0.03, z + tz * L / 2], 0.012, 4));
    const m = Math.round(L / 0.1);
    for (let i = 0; i < m; i++) {
      const t = (i + 0.5) / m - 0.5, px = x + tx * t * L + nx * 0.03, pz = z + tz * t * L + nz * 0.03, h = 0.22 + ((i * 7) % 3) * 0.03;
      bag.add(i % 4 === 1 ? 'cloth_red' : 'paint_ochre', rod([px, y - 0.03 - h, pz], [px, y - 0.02, pz], 0.025, 5));
    }
  }
}

// ---- the storehouses --------------------------------------------------------------------------------
/**
 * inca_goods: what a storehouse (qollqa) holds { rect, y, front, seed }: maize in round bins of wickerwork, sacks of tubers,
 * jars along the back wall, a bundle of fleeces [stated: storehouses held maize, chuño, wool, cloth — Wikipedia, "Qollqa"; inferred: the arrangement].
 */
function goods(el, { bag, col }) {
  const rand = rng((el.seed || 1) * 19 + 1), [x0, z0, x1, z1] = el.rect, y = (el.y ?? 0) + 0.04, m = 0.5;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = x1 - x0 >= z1 - z0, f = el.front ?? 'n';
  const inV = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] }[f];
  const L = alongX ? x1 - x0 - 2 * m : z1 - z0 - 2 * m, D = alongX ? z1 - z0 - 2 * m : x1 - x0 - 2 * m;
  const at = (u, v) => alongX ? [cx + u, cz + inV[1] * v] : [cx + inV[0] * v, cz + u];
  const n = Math.max(2, Math.floor(L / 1.15));
  for (let i = 0; i < n; i++) {
    const u = -L / 2 + (i + 0.5) * L / n, [x, z] = at(u, D / 2 - 0.45);
    const k = rand();
    if (k < 0.45) { bag.add('wicker', lathe([[0.4, 0], [0.43, 0.5], [0.38, 0.95], [0.34, 1.0], [0.001, 1.0]], 10, null, x, y, z)); heap(bag, 'paint_ochre', x, y + 0.9, z, 0.33, 0.14, 8); col.circle(x, z, 0.42, y, y + 1); }
    else if (k < 0.75) { for (let s = 0; s < 3; s++) { const a = s * 2.1 + rand(), px = x + Math.cos(a) * 0.17, pz = z + Math.sin(a) * 0.17; bag.add('sacking', lathe([[0.2, 0], [0.26, 0.2], [0.2, 0.45], [0.1, 0.6], [0.001, 0.62]], 8, null, px, y + s * 0.0, pz)); } col.circle(x, z, 0.4, y, y + 0.6); }
    else { urpu(bag, x, y - 0.04, z, 0.85, rand() * 6.28); col.circle(x, z, 0.25, y, y + 0.85); }
  }
  // fleeces and cloth bundles stacked by the side wall
  const [fx, fz] = at(-L / 2 + 0.3, D / 2 - 1.4);
  for (let i = 0; i < 3; i++) blk(bag, i % 2 ? 'hide_white' : CLOTH[i], fx, y + i * 0.12, fz, 0.35, 0.28, 0.12, 0);
  col.circle(fx, fz, 0.4, y, y + 0.4);
}

// ---- the offerings and the feast --------------------------------------------------------------------
/** A llama figurine of gold or silver, 9 cm high, standing at (x, y, z) facing yaw. */
function llamaFigurine(bag, mat, x, y, z, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v, w) => [x + u * c + w * s, y + v, z - u * s + w * c];
  bag.add(mat, rod(P(0, 0.05, -0.03), P(0, 0.05, 0.03), 0.017, 6));
  bag.add(mat, rod(P(0, 0.055, 0.03), P(0, 0.09, 0.045), 0.008, 5));
  bag.add(mat, rod(P(0, 0.09, 0.045), P(0, 0.095, 0.06), 0.007, 5));
  for (const [u, w] of [[-0.008, -0.02], [0.008, -0.02], [-0.008, 0.02], [0.008, 0.02]]) bag.add(mat, rod(P(u, 0, w), P(u, 0.045, w), 0.003, 4));
}
/**
 * inca_offerings: on an altar's top { at: [x, z] (its centre), y (the top), yaw, w }: small llama figurines of gold and silver,
 * spondylus shells, wooden kero cups, a bowl with maize [stated: figurines of llamas in gold and silver, Spondylus shells and
 * the kero as offerings — Wikipedia, "Inca religion"; inferred: the arrangement].
 */
function offerings(el, { bag }) {
  const [x, z] = el.at, y = el.y, yaw = el.yaw ?? 0, w = el.w ?? 3, c = Math.cos(yaw), s = Math.sin(yaw), rand = rng(el.seed || 5);
  const P = (u, v) => [x + u * c - v * s, z + u * s + v * c];
  for (let i = 0; i < 5; i++) { const u = -w / 2 + 0.35 + i * (w - 0.7) / 4, [px, pz] = P(u, (rand() - 0.5) * 0.25); llamaFigurine(bag, i % 2 ? 'silver' : 'gold', px, y, pz, yaw + (rand() - 0.5) * 0.5); }
  for (let i = 0; i < 3; i++) { const [px, pz] = P(-w / 2 + 0.7 + i * (w - 1.4) / 2 + 0.2, 0.22 + rand() * 0.1); bag.add('cloth_red', lathe([[0.001, 0], [0.06, 0.005], [0.075, 0.025], [0.04, 0.045], [0.001, 0.05]], 8, null, px, y, pz)); }
  for (let i = 0; i < 3; i++) { const [px, pz] = P(-w / 2 + 1.0 + i * (w - 2) / 2, -0.24); bag.add('wood_ochre', lathe([[0.001, 0], [0.04, 0.005], [0.042, 0.04], [0.065, 0.14], [0.06, 0.145], [0.036, 0.04], [0.001, 0.03]], 8, null, px, y, pz)); }
  const [bx, bz] = P(0, 0.05); bag.add('terracotta', lathe([[0.001, 0], [0.07, 0], [0.13, 0.05], [0.12, 0.055], [0.001, 0.02]], 10, null, bx, y, bz)); heap(bag, 'paint_ochre', bx, y + 0.02, bz, 0.09, 0.05, 6);
}

/**
 * inca_feast: the jars of a feast on the plaza { c: [x, z], y, seed }: a ring of reed mats, in the middle three tall urpu of maize beer
 * (aqha) with their cups, round them bowls and a small fire [stated: maize beer drunk at the Inca state's feasts; inferred: the ring].
 */
function feast(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, rand = rng(el.seed || 9);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + 0.3, r = 2.4, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; blk(bag, 'reed_mat', x, y + 0.002, z, 0.7, 0.5, 0.025, a + Math.PI / 2); for (const sg of [-0.18, 0.18]) { const bx = x + Math.cos(a + Math.PI / 2) * sg - Math.cos(a) * 0.12, bz = z + Math.sin(a + Math.PI / 2) * sg - Math.sin(a) * 0.12; bag.add('terracotta', lathe([[0.001, 0], [0.06, 0], [0.1, 0.05], [0.09, 0.055], [0.001, 0.02]], 8, null, bx, y + 0.025, bz)); } }
  for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.2, x = cx + Math.cos(a) * 0.55, z = cz + Math.sin(a) * 0.55; urpu(bag, x, y - 0.04, z, 0.95 + rand() * 0.12, rand() * 6.28); col.circle(x, z, 0.25, y, y + 0.95); }
  const fx = cx + 0.1, fz = cz - 0.02;
  bag.add('granite_rough', lathe([[0.62, 0.005], [0.7, 0.005], [0.7, 0.1], [0.62, 0.1], [0.62, 0.005]], 12, null, fx + 1.2, y, fz + 1.2));
  bag.add('pottery_dark', lathe([[0.001, 0.01], [0.6, 0.01], [0.6, 0.02], [0.001, 0.025]], 10, null, fx + 1.2, y, fz + 1.2));
}

// ---- the Temple of the Condor -----------------------------------------------------------------------
/**
 * condor_temple: the carved condor { c: [x, z], y, yaw }: the flat floor of cut stone is the bird's body and its ruff, the boulder
 * at the front carved into the head with a hooked beak, two slabs of the natural rock rising from the floor either side like open
 * wings, each cut along its edge into feathers [stated: the Temple of the Condor has a condor's head carved in a boulder on the
 * floor, its white-stone ruff, and two wings of rock rising behind — general; sizes and angle inferred].
 */
function condorTemple(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  const P = (u, v, w) => [cx + u * c + w * s, y + v, cz - u * s + w * c];      // u across, w forward (the head's way)
  // the floor
  { const a = [P(-2.6, 0.12, -0.6), P(2.6, 0.12, -0.6), P(2.0, 0.12, 2.6), P(-2.0, 0.12, 2.6)], b = a.map((q) => [q[0], y - 0.1, q[2]]), t = [];
    t.push(...a[0], ...a[2], ...a[1], ...a[0], ...a[3], ...a[2]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...b[i], ...a[i], ...a[j], ...b[i], ...a[j], ...b[j]); }
    bag.add('granite_inca', fromTriangles(orientOutward(t))); }
  // the head: a boulder squashed long, the beak hooked down, the ruff of white stone behind
  { const h = lathe([[0.001, 0], [0.55, 0.02], [0.7, 0.35], [0.55, 0.7], [0.3, 0.88], [0.001, 0.92]], 9, (t, i) => 1 + 0.06 * Math.sin(t * 3 + i)); h.scale(1, 1, 1.35); h.rotateY(yaw); h.translate(...P(0, 0.12, 2.0)); bag.add('granite_rough', h);
    const beak = rod(P(0, 0.62, 2.55), P(0, 0.47, 3.1), 0.17, 6); bag.add('granite_rough', beak);
    bag.add('granite_rough', rod(P(0, 0.52, 3.05), P(0, 0.2, 3.22), 0.09, 6));
    const ruff = lathe([[0.62, 0], [0.7, 0.04], [0.68, 0.14], [0.55, 0.16]], 12); ruff.rotateY(yaw); ruff.translate(...P(0, 0.12, 1.35)); bag.add('limestone', ruff);
    col.circle(...[cx + s * 2.0, cz + c * 2.0], 0.85, y, y + 1.0); }
  // the wings: two slabs standing on edge, leaning outward, a feathered top edge
  for (const sg of [-1, 1]) {
    const base = [P(sg * 0.9, 0.1, 0.4), P(sg * 4.6, 0.1, -1.3)], lean = [sg * 1.1, 2.9, -0.5], th = 0.5;
    const top = base.map((q) => [q[0] + c * lean[0] + s * lean[2], q[1] + lean[1], q[2] - s * lean[0] + c * lean[2]]);
    const nrm = [-s * 0 + c * 0 + (base[1][2] - base[0][2]), 0, -(base[1][0] - base[0][0])], nl = Math.hypot(nrm[0], nrm[2]);
    const n = [nrm[0] / nl * th / 2, 0, nrm[2] / nl * th / 2];
    const q = [base[0], base[1], top[1], top[0]], v = [];
    const A = q.map((p) => [p[0] + n[0], p[1], p[2] + n[2]]), B = q.map((p) => [p[0] - n[0], p[1], p[2] - n[2]]);
    v.push(...A[0], ...A[1], ...A[2], ...A[0], ...A[2], ...A[3], ...B[0], ...B[2], ...B[1], ...B[0], ...B[3], ...B[2]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; v.push(...A[i], ...B[i], ...B[j], ...A[i], ...B[j], ...A[j]); }
    bag.add('granite_rough', fromTriangles(orientOutward(v)));
    // the feathers: long cuts along the face
    for (let k = 1; k < 5; k++) { const t = k / 5; const p0 = [base[0][0] + (base[1][0] - base[0][0]) * t + n[0] * 1.05, 0.2, base[0][2] + (base[1][2] - base[0][2]) * t + n[2] * 1.05], p1 = [top[0][0] + (top[1][0] - top[0][0]) * t + n[0] * 1.05, 2.7, top[0][2] + (top[1][2] - top[0][2]) * t + n[2] * 1.05]; bag.add('granite_inca', rod([p0[0], y + p0[1], p0[2]], [p1[0], y + p1[1] * 0.9, p1[2]], 0.035, 4)); }
    for (let k = 0; k < 4; k++) { const t = k / 3, px = base[0][0] + (base[1][0] - base[0][0]) * t, pz = base[0][2] + (base[1][2] - base[0][2]) * t; col.circle(px, pz, 0.55, y, y + 2.4 - 1.1 * t); }
  }
}

export const INCA_DRESS = { condor_temple: condorTemple, inca_patio: patio, inca_cobs: cobs, inca_goods: goods, inca_offerings: offerings, inca_feast: feast };
