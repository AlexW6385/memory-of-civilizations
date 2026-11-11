// Details of the Edo castle town (docs/settlements/edo-himeji.md §5.3–§5.6): the merchants' fronts with their
// lattices (kōshi), noren, signs and the goods of each trade; the plastered slatted windows (mushiko-mado) of the
// upper storey; ridge caps with their end tiles; the storehouse's namako walls; the samurai gate-house with its
// doors and barred windows; the garden's lantern, pine and well; the stacked sake barrels; moored boats.
// `q` is metres in from a front face (negative: out into the street), `u` along it.

import { box, lathe, rod, fromTriangles, clothBox, addCloth } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { barredWindows } from './detail.js';

const PL = 'plaster_castle', WD = 'wood_dark', TL = 'tile_grey';
export const TRADES = ['cloth', 'pottery', 'rice', 'dye', 'oil', 'sandals', 'sake', 'tea', 'medicine'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A frame for a front facing north or south: B(m, u0, u1, v0, v1, q0, q1), Z(q), at the front line fz. */
function frame(bag, col, fz, s) {
  const Z = (q) => fz - s * q;
  const B = (m, u0, u1, v0, v1, q0, q1) => bag.add(m, box(Math.min(u0, u1), Math.min(v0, v1), Math.min(Z(q0), Z(q1)), Math.max(u0, u1), Math.max(v0, v1), Math.max(Z(q0), Z(q1))));
  const C = (u0, u1, q0, q1, v0, v1) => col.rect([Math.min(u0, u1), Math.min(Z(q0), Z(q1)), Math.max(u0, u1), Math.max(Z(q0), Z(q1))], v0, v1);
  const L = (m, prof, seg, u, v, q) => bag.add(m, lathe(prof, seg, null, u, v, Z(q)));
  return { Z, B, C, L };
}

/** A barrel of staves with hoops: radius r, height h, at (x, y, z). */
export function barrel(bag, m, x, y, z, r = 0.3, h = 0.7, wrap = null) {
  bag.add(m, lathe([[0.001, 0], [r * 0.88, 0], [r, h * 0.3], [r * 1.08, h * 0.5], [r, h * 0.7], [r * 0.88, h], [0.001, h]], 12, null, x, y, z));
  for (const k of [0.18, 0.82]) bag.add('iron', lathe([[r * (k < 0.5 ? 0.96 : 0.96) + 0.004, k * h - 0.02], [r * 1.02 + 0.006, k * h - 0.02], [r * 1.02 + 0.006, k * h + 0.02], [r * 0.96 + 0.004, k * h + 0.02]], 12, null, x, y, z));
  if (wrap) bag.add(wrap, lathe([[r * 1.0 + 0.008, h * 0.2], [r * 1.09 + 0.008, h * 0.5], [r * 1.0 + 0.008, h * 0.8], [r * 0.92, h * 0.8], [r * 1.0, h * 0.5], [r * 0.92, h * 0.2]], 12, null, x, y, z));
}

/** A paper lantern (chōchin) hung at (x, y top, z): ribbed paper, black caps, a crest. */
export function chochin(bag, x, y, z, r = 0.16, h = 0.42, red = true) {
  bag.add('lacquer_black', box(x - r * 0.5, y - 0.04, z - r * 0.5, x + r * 0.5, y, z + r * 0.5));
  bag.add('lamp_paper', lathe([[0.001, 0], [r * 0.6, 0], [r, h * 0.35], [r, h * 0.65], [r * 0.6, h], [0.001, h]], 10, null, x, y - 0.04 - h, z));
  bag.add('lacquer_black', box(x - r * 0.55, y - 0.04 - h - 0.03, z - r * 0.55, x + r * 0.55, y - 0.04 - h, z + r * 0.55));
  void red;
}

// ---- the machiya's upper storey: mushiko-mado ----------------------------------------------------------------------
/**
 * Plastered slatted windows (mushiko-mado) in the upper storey's front: a thick plastered frame, dark slats set in it.
 * { x0, x1 } the front's ends, fz and s the front line and its outward sign, v0..v1 the storey.
 */
export function mushikoMado(bag, col, { x0, x1, fz, s, v0, v1, rand }) {
  const { B } = frame(bag, col, fz, s), W = x1 - x0, n = W > 8.2 ? 3 : 2, ww = Math.min(1.7, W / n - 1.3), hh = Math.min(0.85, v1 - v0 - 0.9), y = v0 + (v1 - v0 - hh) / 2 + 0.05;
  for (let i = 0; i < n; i++) {
    const c = x0 + W * (i + 0.5) / n, a = c - ww / 2, b = c + ww / 2, t = [];
    B('opening', a, b, y, y + hh, -0.02, 0.0);
    // the slats, a hand apart, standing in front of the dark recess
    const k = Math.max(5, Math.round(ww / 0.14));
    for (let j = 0; j < k; j++) { const u = a + (j + 0.5) * ww / k; B('koshi', u - 0.022, u + 0.022, y, y + hh, -0.09, -0.02); }
    void t;
    // the plastered frame, thick and rounded in its corners as a block of plaster: head, sill and jambs
    B(PL, a - 0.14, b + 0.14, y + hh, y + hh + 0.14, -0.13, 0.0); B(PL, a - 0.17, b + 0.17, y - 0.12, y, -0.15, 0.0);
    B(PL, a - 0.14, a, y, y + hh, -0.13, 0.0); B(PL, b, b + 0.14, y, y + hh, -0.13, 0.0);
    B(TL, a - 0.2, b + 0.2, y - 0.16, y - 0.12, -0.17, -0.0);
  }
  void rand;
}

/** The ridge's cap and its end tiles (onigawara), ridge along x at height y, centre z, from u0 to u1. */
export function ridgeCap(bag, u0, u1, y, zc, big = false) {
  bag.add('tile_dark', box(u0, y - 0.04, zc - 0.17, u1, y + 0.2, zc + 0.17));
  bag.add('tile_dark', box(u0, y + 0.2, zc - 0.1, u1, y + 0.3, zc + 0.1));
  for (const [u, d] of [[u0, 1], [u1, -1]]) {
    const h = big ? 0.55 : 0.4;
    bag.add('tile_dark', lathe([[0.001, 0], [0.2, 0], [0.2, 0.08], [0.14, 0.2], [0.17, 0.32], [0.001, h]], 8, null, u + d * 0.0, y + 0.2, zc));
    bag.add(PL, box(u - 0.17, y - 0.04, zc - 0.18, u + 0.17, y + 0.04, zc + 0.18));
  }
}

// ---- the front of a closed machiya ----------------------------------------------------------------------------------
/**
 * The ground storey's front of a merchant's house (the shop closed or shown from outside): a dark plinth, the
 * posts and the lattice (kōshi) between them over a dark recess, the entrance bay with its noren, the trade's sign
 * and goods. { x0, x1, fz, s, H1, seed, trade }.
 */
export function machiyaFront(bag, col, { x0, x1, fz, s, H1, seed, trade }) {
  const rand = rng((seed || 1) * 7 + 3), { B, C, L, Z } = frame(bag, col, fz, s), W = x1 - x0;
  const eW = 1.7 + rand() * 0.3, left = rand() < 0.5, e0 = left ? x0 + 0.5 : x1 - 0.5 - eW, e1 = e0 + eW;
  // the plinth and the dark recess behind the lattice
  B('plaster_grey', x0, x1, 0, 0.34, -0.06, 0.0);
  B('opening', x0 + 0.1, x1 - 0.1, 0.34, H1 - 0.3, -0.03, 0.0);
  // posts at the ends and either side of the entrance, the rail across at the plinth and the head beam below the pent roof
  for (const u of [x0 + 0.1, e0, e1, x1 - 0.1]) B(WD, u - 0.1, u + 0.1, 0.0, H1 - 0.28, -0.12, 0.0);
  B(WD, x0, x1, 0.34, 0.42, -0.1, 0.0); B(WD, x0, x1, H1 - 0.45, H1 - 0.28, -0.1, 0.0);
  // the lattice in the bays beside the entrance: slats, close-set, with a crossbar half way
  const bays = left ? [[e1 + 0.1, x1 - 0.1]] : [[x0 + 0.1, e0 - 0.1]];
  if (W > 6.2) bays.push(left ? [x0 + 0.1, e0 - 0.1] : [e1 + 0.1, x1 - 0.1]);
  for (const [a, b] of bays) {
    if (b - a < 0.5) continue;
    const t = []; beamTris(t, [a, 0.42, Z(-0.07)], [b, 0.42, Z(-0.07)], 0.035, H1 - 0.28 - 0.42 - 0.17); bag.add('koshi', fromTriangles(t));
    B(WD, a, b, 1.55, 1.6, -0.12, -0.04);
    C(a, b, -0.1, 0, 0, H1);
  }
  // the entrance bay: the dark passage, a noren hung from its head beam (cloth in the wind), a sliding door pushed aside
  B(WD, e0 + 0.1, e1 - 0.1, H1 - 0.62, H1 - 0.5, -0.07, -0.03);
  const nc = trade === 'tea' ? 'cloth_red' : trade === 'sake' ? 'cloth_white' : ['cloth_indigo', 'cloth_indigo', 'cloth_brown', 'cloth_black'][Math.floor(rand() * 4)];
  const np = 2 + (rand() < 0.5 ? 1 : 0), nw = (eW - 0.2) / np;
  for (let k = 0; k < np; k++) {
    const a = e0 + 0.1 + k * nw + 0.012, b = e0 + 0.1 + (k + 1) * nw - 0.012, zq = Z(-0.1), z2 = Z(-0.115);
    addCloth(bag, nc, clothBox(a, H1 - 1.9, Math.min(zq, z2), b, H1 - 0.62, Math.max(zq, z2), 0.2), H1 - 0.62);
  }
  // goods and signs by trade
  const tx = left ? x1 - 1.9 : x0 + 1.0;                // the lattice bay's side: where goods stand
  if (trade === 'sake') {
    // the cedar ball (sugidama) hung under the eave; komodaru, the barrels in straw mats, stacked by the door
    const cx = (e0 + e1) / 2;
    bag.add('rope_fibre', rod([cx, H1 - 0.26, Z(-0.45)], [cx, H1 - 0.62, Z(-0.45)], 0.012, 5));
    bag.add('flax_leaf', lathe([[0.001, 0], [0.16, 0.03], [0.27, 0.18], [0.3, 0.32], [0.27, 0.46], [0.16, 0.6], [0.001, 0.64]], 10, null, cx, H1 - 1.26, Z(-0.45)));
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) { const u = tx + 0.1 + k * 0.56 + r * 0.28, y = 0.34 + r * 0.55, q = -0.6; barrel(bag, 'timber', u, y - 0.34, Z(q), 0.27, 0.62, 'thatch'); }
    C(tx - 0.2, tx + 1.8, -0.9, -0.3, 0, 1.5);
  } else if (trade === 'tea') {
    // a bench (shōgi) with a red felt cover, the big red parasol over it, a kettle on a brazier
    const bu = left ? x1 - 3.3 : x0 + 0.6;
    B(WD, bu, bu + 2.1, 0.0, 0.42, -1.1, -0.55); B('cloth_red', bu + 0.04, bu + 2.06, 0.42, 0.47, -1.08, -0.57);
    for (const u of [bu + 0.3, bu + 1.8]) B(WD, u - 0.05, u + 0.05, 0.0, 0.42, -1.12, -1.05);
    bag.add(WD, rod([bu + 1.05, 0.0, Z(-0.38)], [bu + 1.05, 2.3, Z(-0.38)], 0.025, 6));
    bag.add('cloth_red', lathe([[0.001, 0.2], [0.35, 0.1], [1.1, 0.0], [1.15, -0.04], [1.1, -0.06], [0.001, 0.08]], 14, null, bu + 1.05, 2.15, Z(-0.38)));
    L('pottery_dark', [[0.001, 0], [0.18, 0], [0.2, 0.2], [0.001, 0.2]], 10, bu - 0.4, 0, -0.7);
    L('iron', [[0.001, 0], [0.09, 0.02], [0.13, 0.12], [0.07, 0.19], [0.001, 0.2]], 10, bu - 0.4, 0.2, -0.7);
    C(bu - 0.6, bu + 2.1, -1.15, -0.5, 0, 0.5);
  } else if (trade === 'cloth' || trade === 'dye') {
    // dyed cloth hung from poles under the eave, a bolt on a stand (dye: lengths of indigo hung out to dry)
    const cols = trade === 'dye' ? ['cloth_indigo', 'cloth_blue', 'cloth_indigo', 'linen'] : ['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_green'];
    const pu0 = left ? e1 + 0.2 : x0 + 0.3, pu1 = left ? x1 - 0.3 : e0 - 0.2;
    bag.add(WD, rod([pu0, H1 - 0.55, Z(-0.7)], [pu1, H1 - 0.55, Z(-0.7)], 0.025, 6));
    const kn = Math.max(2, Math.floor((pu1 - pu0) / 0.6));
    for (let k = 0; k < kn; k++) { const a = pu0 + 0.1 + k * (pu1 - pu0 - 0.2) / kn, w = (pu1 - pu0 - 0.2) / kn - 0.05; addCloth(bag, cols[k % cols.length], clothBox(a, H1 - 2.3 - (k % 2) * 0.3, Z(-0.7) - 0.01, a + w, H1 - 0.58, Z(-0.7) + 0.01, 0.2), H1 - 0.58); }
    for (const u of [pu0 - 0.05, pu1 + 0.05]) bag.add(WD, rod([u, 0, Z(-0.7)], [u, H1 - 0.5, Z(-0.7)], 0.03, 6));
  } else if (trade === 'pottery') {
    for (let k = 0; k < 6; k++) { const u = tx - 0.2 + (k % 3) * 0.55, y = 0, q = -0.5 - Math.floor(k / 3) * 0.5; L(k % 2 ? 'pottery_dark' : 'glaze_white', [[0.001, 0], [0.16, 0.0], [0.24, 0.2], [0.2, 0.38], [0.12, 0.46], [0.13, 0.5], [0.001, 0.5]], 10, u, y, q); }
    C(tx - 0.5, tx + 1.4, -1.2, -0.3, 0, 0.5);
  } else if (trade === 'rice') {
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) { const u = tx + k * 0.55 + r * 0.275, y = 0.25 + r * 0.48; const g = lathe([[0.2, -0.38], [0.25, -0.32], [0.27, 0], [0.25, 0.32], [0.2, 0.38], [0.001, 0.38]], 10); g.rotateX(Math.PI / 2); g.translate(u, y, Z(-0.6)); bag.add('thatch', g); }
    C(tx - 0.2, tx + 1.6, -0.9, -0.3, 0, 1.3);
  } else if (trade === 'oil') {
    for (let k = 0; k < 4; k++) barrel(bag, 'timber', tx + (k % 2) * 0.6, 0, Z(-0.5 - Math.floor(k / 2) * 0.55), 0.26, 0.62);
    C(tx - 0.3, tx + 1.0, -1.2, -0.2, 0, 0.7);
  } else if (trade === 'sandals') {
    // straw sandals (waraji) in rows hung on a rail along the front
    const a = left ? e1 + 0.3 : x0 + 0.3, b = left ? x1 - 0.3 : e0 - 0.3;
    B(WD, a, b, 1.95, 2.0, -0.2, -0.12);
    for (let u = a + 0.1; u < b - 0.1; u += 0.22) B('thatch', u, u + 0.12, 1.5, 1.95, -0.18, -0.14);
  } else {
    // medicine: a gilt-lettered board hung on its bracket, a mortar and a drawer chest at the door
    B(WD, e1 + 0.0, e1 + 0.05, 1.0, 1.9, -0.9, -0.85);
    B('gilt_bronze', left ? e1 + 0.3 : e0 - 1.1, left ? e1 + 1.1 : e0 - 0.3, 1.6, 1.62, -0.3, -0.1);
    L('granite_grey', [[0.001, 0], [0.2, 0], [0.2, 0.15], [0.15, 0.16], [0.001, 0.1]], 10, tx, 0, -0.55);
  }
  // the street's own small things: a tub of water with its dipper (hinoyoke) and a lantern at the eave on some fronts
  if (rand() < 0.55) { const u = left ? x1 - 0.5 : x0 + 0.5; barrel(bag, 'timber', u, 0, Z(-0.45), 0.27, 0.58); bag.add('opening', lathe([[0.001, 0], [0.22, 0], [0.22, 0.004], [0.001, 0.004]], 10, null, u, 0.575, Z(-0.45))); C(u - 0.3, u + 0.3, -0.75, -0.15, 0, 0.6); }
  if (rand() < 0.5) chochin(bag, left ? e1 + 0.45 : e0 - 0.45, H1 - 0.3, Z(-0.45), 0.15, 0.38);
  // the sign (kanban) hung from the eave's corner on a bracket, standing out into the street
  const ku = left ? x1 - 0.15 : x0 + 0.15, kz = Z(-0.5);
  B(WD, ku - 0.03, ku + 0.03, H1 - 0.7, H1 - 0.64, -0.0, -0.9);
  B('wood_painted', ku - 0.03, ku + 0.03, H1 - 1.55, H1 - 0.7, -0.62, -0.36);
  B('lacquer_black', ku, ku + 0.04, H1 - 1.4, H1 - 0.85, -0.58, -0.4);
  void kz;
  return { e0, e1, left };
}

// ---- the pent roof's fascia and the cap of the eave ---------------------------------------------------------------
/** A row of eave tiles along an edge u0..u1 at (y, q): a dark band 0.1 tall, proud 0.06 (the round end tiles). */
export function eaveBand(bag, col, { x0, x1, fz, s, y, q0, q1 }) {
  const { B } = frame(bag, col, fz, s);
  B('tile_dark', x0, x1, y - 0.09, y + 0.02, q0, q1);
}

// ---- the storehouse's namako walls ------------------------------------------------------------------------------------
/** A storehouse's walls: a plinth faced in dark flat tiles pointed with raised white plaster seams (namako-kabe), plastered white above. */
export function kuraWalls(bag, col, rect, y = 0, H = 5.4) {
  const [x0, z0, x1, z1] = rect, PH = 1.35;
  bag.add('granite_grey', box(x0 - 0.04, y, z0 - 0.04, x1 + 0.04, y + 0.28, z1 + 0.04));
  bag.add('tile_dark', box(x0, y + 0.28, z0, x1, y + PH, z1));
  bag.add(PL, box(x0, y + PH, z0, x1, y + H, z1));
  col.rect(rect, y, y + H);
  // the white seams: courses every 0.3 m, and the joints between, laid on the four faces (the faces' two long sides in full, the short sides likewise)
  const e = 0.012;
  for (let v = y + 0.28 + 0.15; v < y + PH - 0.05; v += 0.3) {
    bag.add(PL, box(x0 - e, v, z0 - e, x1 + e, v + 0.035, z0)); bag.add(PL, box(x0 - e, v, z1, x1 + e, v + 0.035, z1 + e));
    bag.add(PL, box(x0 - e, v, z0, x0, v + 0.035, z1)); bag.add(PL, box(x1, v, z0, x1 + e, v + 0.035, z1));
  }
  // the vertical seams on the long faces, every 0.6 m
  for (let u = x0 + 0.3; u < x1 - 0.1; u += 0.6) { bag.add(PL, box(u, y + 0.28, z0 - e, u + 0.035, y + PH, z0)); bag.add(PL, box(u, y + 0.28, z1, u + 0.035, y + PH, z1 + e)); }
  // the thick plastered doors on the street side's gable and the small barred window high in the wall
  const wy = y + PH + 1.6;
  for (const zf of [z0, z1]) { const dz = zf === z0 ? -1 : 1; for (const u of [x0 + (x1 - x0) * 0.35, x0 + (x1 - x0) * 0.65]) { bag.add('opening', box(u - 0.35, wy, zf + dz * 0.0 - (dz < 0 ? 0.03 : 0), u + 0.35, wy + 0.55, zf + (dz > 0 ? 0.03 : 0))); bag.add(PL, box(u - 0.45, wy - 0.1, zf - (dz < 0 ? 0.14 : 0), u + 0.45, wy + 0.65, zf + (dz > 0 ? 0.14 : 0))); bag.add('opening', box(u - 0.35, wy, zf - (dz < 0 ? 0.145 : 0), u + 0.35, wy + 0.55, zf + (dz > 0 ? 0.145 : 0))); } }
}

// ---- the samurai gate-house --------------------------------------------------------------------------------------------
/**
 * The front of a nagaya-mon: the gate-house's long face toward the street — the gate in the middle (two posts and
 * a head beam, the leaves of planks banded with iron and bossed, a small door in one), the barred windows on either
 * side, the base faced in namako tiles. g: the side ('n','s','e','w'), gate the rect.
 */
export function gateFront(bag, col, gate, g, seed) {
  const [x0, z0, x1, z1] = gate, along = g === 'n' || g === 's', sg = g === 's' || g === 'e' ? 1 : -1;
  const L = along ? x1 - x0 : z1 - z0, cu = along ? (x0 + x1) / 2 : (z0 + z1) / 2, fq = g === 's' ? z1 : g === 'n' ? z0 : g === 'e' ? x1 : x0;
  const P = (u, q) => (along ? [u, fq + sg * q] : [fq + sg * q, u]);
  const Bx = (m, u0, u1, v0, v1, q0, q1) => { const p = P(u0, q0), r = P(u1, q1); bag.add(m, box(Math.min(p[0], r[0]), v0, Math.min(p[1], r[1]), Math.max(p[0], r[0]), v1, Math.max(p[1], r[1]))); };
  const rand = rng((seed || 1) + 17), gw = 1.7 + rand() * 0.3;
  // the base: dark tiles with white seams across the long face
  Bx('tile_dark', cu - L / 2, cu + L / 2, 0.3, 1.1, 0.0, 0.03);
  for (let v = 0.45; v < 1.05; v += 0.3) Bx(PL, cu - L / 2, cu + L / 2, v, v + 0.035, 0.03, 0.045);
  // the gate: recess, posts, head beam, doors
  for (const u of [cu - gw - 0.12, cu + gw + 0.12]) Bx(WD, u - 0.16, u + 0.16, 0, 3.05, 0.0, 0.24);
  Bx(WD, cu - gw - 0.3, cu + gw + 0.3, 2.75, 3.05, 0.0, 0.3); Bx(WD, cu - gw - 0.3, cu + gw + 0.3, 3.05, 3.2, 0.04, 0.22);
  // the leaves stand open, swung inward against the passage's sides (the yard is entered here)
  for (const sd of [-1, 1]) {
    const u = cu + sd * (gw - 0.02), a = Math.min(u, u - sd * 0.1), b2 = Math.max(u, u - sd * 0.1);
    Bx(WD, a, b2, 0.0, 2.7, -0.3, -gw - 0.1);
    for (let v = 0.35; v < 2.6; v += 0.62) Bx('iron', a - 0.012, b2 + 0.012, v, v + 0.07, -0.3, -gw - 0.1);
  }
  // the crest on the head beam's face
  Bx('gilt_bronze', cu - 0.14, cu + 0.14, 2.82, 3.0, 0.3, 0.32);
  // barred windows (renji) either side of the gate, above the base; the outward normal lies on the left of the direction
  for (const sd of [-1, 1]) {
    const ua = cu + sd * (gw + 0.9), ub = cu + sd * (L / 2 - 0.5), lo = Math.min(ua, ub), hi = Math.max(ua, ub);
    if (hi - lo < 2) continue;
    const fwd = g === 's' || g === 'w', p0 = P(fwd ? lo : hi, 0.0), p1 = P(fwd ? hi : lo, 0.0);
    barredWindows(bag, p0, p1, 1.6, 1.0, Math.max(1, Math.floor((hi - lo) / 3)), 0.9);
  }
}

// ---- the garden ------------------------------------------------------------------------------------------------------------
/** A stone lantern (ishidōrō): base, post, the lit box with its openings, the hat, the jewel. */
export function ishidoro(bag, col, x, z, y = 0, s = 1) {
  const G = 'granite_grey';
  bag.add(G, lathe([[0.001, 0], [0.26 * s, 0], [0.26 * s, 0.06 * s], [0.16 * s, 0.09 * s], [0.001, 0.09 * s]], 8, null, x, y, z));
  bag.add(G, lathe([[0.001, 0], [0.09 * s, 0], [0.09 * s, 0.5 * s], [0.001, 0.5 * s]], 8, null, x, y + 0.09 * s, z));
  bag.add(G, lathe([[0.001, 0], [0.24 * s, 0], [0.26 * s, 0.05 * s], [0.12 * s, 0.07 * s], [0.001, 0.07 * s]], 8, null, x, y + 0.59 * s, z));
  bag.add(G, box(x - 0.13 * s, y + 0.66 * s, z - 0.13 * s, x + 0.13 * s, y + 0.9 * s, z + 0.13 * s));
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) bag.add('opening', box(x + dx * 0.131 * s - (dz ? 0.05 * s : 0.0), y + 0.72 * s, z + dz * 0.131 * s - (dx ? 0.05 * s : 0.0), x + dx * 0.131 * s + (dz ? 0.05 * s : 0.0), y + 0.84 * s, z + dz * 0.131 * s + (dx ? 0.05 * s : 0.0)));
  bag.add(G, lathe([[0.001, 0.0], [0.34 * s, 0.0], [0.34 * s, 0.03 * s], [0.16 * s, 0.17 * s], [0.06 * s, 0.2 * s], [0.001, 0.22 * s]], 8, null, x, y + 0.9 * s, z));
  bag.add(G, lathe([[0.001, 0], [0.05 * s, 0.0], [0.05 * s, 0.12 * s], [0.001, 0.17 * s]], 8, null, x, y + 1.12 * s, z));
  col.circle(x, z, 0.3 * s, y, y + 1.3 * s);
}

/** A pruned pine (niwaki) with cloud-pads of needles on a leaning trunk: height h. */
export function niwaki(bag, col, x, z, y, h, seed) {
  const rand = rng(seed || 1), lean = (rand() - 0.5) * 0.6, top = [x + lean * h * 0.35, y + h * 0.78, z + (rand() - 0.5) * 0.4];
  bag.add('bark_redpine', rod([x, y, z], [x + lean * h * 0.15, y + h * 0.45, z], 0.17, 7));
  bag.add('bark_redpine', rod([x + lean * h * 0.15, y + h * 0.45, z], top, 0.11, 7));
  const pad = (c, rx, ry) => bag.add('flax_leaf', lathe([[0.001, -ry * 0.55], [rx * 0.7, -ry * 0.5], [rx, -ry * 0.1], [rx * 0.9, ry * 0.3], [rx * 0.5, ry * 0.6], [0.001, ry * 0.7]], 9, null, c[0], c[1], c[2]));
  pad(top, 1.5, 0.55);
  for (let k = 0; k < 3; k++) { const a = rand() * 6.28 + k * 2.1, d = 1.0 + rand() * 0.5, yy = y + h * (0.42 + k * 0.13), c = [x + lean * h * 0.15 + Math.cos(a) * d, yy, z + Math.sin(a) * d];
    bag.add('bark_redpine', rod([x + lean * h * 0.15, yy - 0.15, z], [c[0], c[1] - 0.1, c[2]], 0.05, 5)); pad(c, 1.1 - k * 0.12, 0.42); }
  col.circle(x, z, 0.28, y, y + h * 0.8);
}

/** A well (ido): a round curb of stones, two posts, a beam with its tiled little roof, the bucket on its rope. */
export function ido(bag, col, x, z, y = 0, rot = 0) {
  bag.add('granite_grey', lathe([[0.62, 0], [0.64, 0.1], [0.58, 0.5], [0.4, 0.5], [0.4, 0.1]], 12, null, x, y, z));
  bag.add('opening', lathe([[0.001, 0.495], [0.4, 0.495], [0.4, 0.5], [0.001, 0.5]], 12, null, x, y, z));
  const c = Math.cos(rot), s = Math.sin(rot), P = (a, b) => [x + a * c - b * s, z + a * s + b * c];
  for (const sd of [-1, 1]) { const p = P(sd * 0.5, 0); bag.add(WD, box(p[0] - 0.07, y + 0.5, p[1] - 0.07, p[0] + 0.07, y + 2.1, p[1] + 0.07)); }
  const a = P(-0.62, 0), b = P(0.62, 0);
  bag.add(WD, rod([a[0], y + 2.05, a[1]], [b[0], y + 2.05, b[1]], 0.07, 6));
  const r0 = P(-0.5, 0), r1 = P(0.5, 0);
  bag.add(TL, box(Math.min(r0[0], r1[0]) - 0.35, y + 2.12, Math.min(r0[1], r1[1]) - 0.35, Math.max(r0[0], r1[0]) + 0.35, y + 2.2, Math.max(r0[1], r1[1]) + 0.35));
  bag.add('rope_fibre', rod([x, y + 2.0, z], [x, y + 0.75, z], 0.012, 5));
  bag.add('timber', lathe([[0.001, 0], [0.13, 0], [0.15, 0.25], [0.001, 0.25]], 8, null, x, y + 0.5, z));
  col.circle(x, z, 0.66, y, y + 0.5);
}

/** A moored flat-bottomed boat (takase-bune style): bow and stern raised, a plank deck amidships, a pole laid across; dir (ux, uz) along the keel. */
export function boat(bag, col, x, z, y, dir, len = 7.5) {
  const [ux, uz] = dir, nx = -uz, nz = ux, hw = 0.8, t = [];
  const P = (u, w, v) => [x + ux * u + nx * w, y + v, z + uz * u + nz * w];
  const n = 8, prof = (k) => { const u = -len / 2 + len * k / n, e = Math.abs(u) / (len / 2), w = hw * (1 - 0.65 * Math.pow(e, 3)), rise = 0.06 + 0.32 * Math.pow(e, 4); return [u, w, rise]; };
  for (let k = 0; k < n; k++) {
    const [u0, w0, r0] = prof(k), [u1, w1, r1] = prof(k + 1);
    for (const sd of [-1, 1]) {
      const a = P(u0, sd * w0, -0.18), b = P(u1, sd * w1, -0.18), c = P(u1, sd * w1, 0.34 + r1), d = P(u0, sd * w0, 0.34 + r0);
      if (sd > 0) t.push(...a, ...b, ...c, ...a, ...c, ...d); else t.push(...a, ...c, ...b, ...a, ...d, ...c);
    }
    const a = P(u0, -w0 * 0.7, -0.18), b = P(u1, -w1 * 0.7, -0.18), c = P(u1, w1 * 0.7, -0.18), d = P(u0, w0 * 0.7, -0.18);
    t.push(...a, ...c, ...b, ...a, ...d, ...c);
    // the side's slant to the bottom
    for (const sd of [-1, 1]) { const A = P(u0, sd * w0, -0.18), B2 = P(u1, sd * w1, -0.18), C2 = P(u1, sd * w1 * 0.7, -0.18), D2 = P(u0, sd * w0 * 0.7, -0.18); void A; void B2; void C2; void D2; }
  }
  bag.add('timber', fromTriangles(t));
  // the inside: a floor of boards, the gunwale strakes, a thwart or two, a pole laid across
  const d0 = P(-len * 0.2, -hw * 0.8, 0.12), d1 = P(len * 0.2, hw * 0.8, 0.14);
  void d0; void d1;
  for (let k = -1; k <= 1; k++) { const a = P(k * len * 0.18, -hw * 0.86, 0.3), b = P(k * len * 0.18, hw * 0.86, 0.3); bag.add(WD, rod(a, b, 0.045, 5)); }
  bag.add(WD, rod(P(-len * 0.45, 0.3, 0.45), P(len * 0.45, 0.3, 0.45), 0.03, 5));
  // a mooring post on the bank side is left to the landing
  col.rect([Math.min(x - Math.abs(ux) * len / 2, x + Math.abs(ux) * len / 2) - Math.abs(nx) * hw, Math.min(z - Math.abs(uz) * len / 2, z + Math.abs(uz) * len / 2) - Math.abs(nz) * hw, Math.max(x - Math.abs(ux) * len / 2, x + Math.abs(ux) * len / 2) + Math.abs(nx) * hw, Math.max(z - Math.abs(uz) * len / 2, z + Math.abs(uz) * len / 2) + Math.abs(nz) * hw], y - 0.2, y + 0.5);
}
