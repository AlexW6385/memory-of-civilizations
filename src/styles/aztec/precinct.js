// The Sacred Precinct's other buildings (docs/settlements/tenochtitlan.md §12): the House of the Eagles
// — the L-shaped platform, its porticoes on pilasters, the halls lined with benches carved with
// warriors processing to the zacatapayolli under a frieze of serpents, the walls banded black, blue,
// red and ochre, the ceramic eagle warriors at the main door, the Mictlantecuhtli figures at the north
// wing, Tlaloc braziers by the altars; the calmecac with its crest of cut-shell merlons; the coatepantli
// — the two serpents round the Templo Mayor, Tlaloc's blue and Huitzilopochtli's ochre; the precinct's
// enclosing platform with stairs on both faces; Ehecatl's round temple with its serpent-mouth door and
// coiled thatch; the temple of Tezcatlipoca; the stakes along the causeway.

import { box, frustum, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { Kit, carved, serpentHeadKit } from '../maya/meso.js';
import { treads } from './index.js';
import '../../objects/index.js';

const W = 'plaster_white', R = 'stucco_red', B = 'maya_blue', BK = 'paint_minoan_black', OC = 'paint_ochre', TC = 'terracotta', BS = 'basalt', LF = 'stucco_leaf';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FACE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

/** A flat strip in a carving's frame (x across, y up) from 2D a to b, half-widths w0 → w1, from z0 out to z1. */
function strip(k, mat, a, b, w0, z0, z1, w1 = w0) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const P = (p, w, z) => [p[0] + nx * w, p[1] + ny * w, z];
  return k.hex(mat, [P(a, w0, z0), P(b, w1, z0), P(b, -w1, z0), P(a, -w0, z0), P(a, w0, z1), P(b, w1, z1), P(b, -w1, z1), P(a, -w0, z1)]);
}
/** A wall along `ax` ('x': running along x over z c0…c1; 'z' the other way) from a0 to a1, y0 to y1, doors [{ at, w, h }] cut through. */
function wall(bag, col, mat, ax, c0, c1, a0, a1, y0, y1, doors = [], base = null) {
  const R2 = (u0, u1) => (ax === 'x' ? [u0, c0, u1, c1] : [c0, u0, c1, u1]);
  const put = (r, ya, yb) => { if (base && ya === y0) { bag.add(base, box(r[0], ya, r[1], r[2], ya + 0.4, r[3])); bag.add(mat, box(r[0], ya + 0.4, r[1], r[2], yb, r[3])); } else bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); };
  let u = a0;
  for (const d of [...doors].sort((p, q) => p.at - q.at)) {
    const d0 = d.at - d.w / 2, d1 = d.at + d.w / 2;
    if (d0 > u) { const r = R2(u, d0); put(r, y0, y1); col.rect(r, y0, y1); }
    put(R2(d0, d1), y0 + d.h, y1);
    u = d1;
  }
  if (a1 > u) { const r = R2(u, a1); put(r, y0, y1); col.rect(r, y0, y1); }
}
function runs(a0, a1, doors = [], m = 0) {
  const out = []; let u = a0;
  for (const d of [...doors].sort((p, q) => p.at - q.at)) { if (d.at - d.w / 2 - m > u + 0.1) out.push([u, d.at - d.w / 2 - m]); u = d.at + d.w / 2 + m; }
  if (a1 > u + 0.1) out.push([u, a1]);
  return out;
}
/** A painted band on the wall face at c looking toward side (±1), a0…a1 along it, y0…y1, standing `off` out (and as deep in). */
function band(bag, mat, ax, c, side, a0, a1, y0, y1, off = 0.02) {
  bag.add(mat, ax === 'x' ? box(a0, y0, c - off, a1, y1, c + off) : box(c - off, y0, a0, c + off, y1, a1));
}
/** A stair { rect, y0, y1, dir } of plastered treads between plain balustrades (Mexica). */
function stair(bag, col, rect, y0, y1, dir, mat = W, bal = W) {
  treads(bag, col, rect, y0, y1, dir, mat);
  const [x0, z0, x1, z1] = rect, alongZ = dir === 'n' || dir === 's', aw = 0.5, k = new Kit();
  for (const side of [0, 1]) {
    const [u0, u1] = side ? [(alongZ ? x1 : z1) - aw, alongZ ? x1 : z1] : [alongZ ? x0 : z0, (alongZ ? x0 : z0) + aw];
    const [v0, v1] = dir === 'n' ? [z1, z0] : dir === 's' ? [z0, z1] : dir === 'e' ? [x0, x1] : [x1, x0];
    const P = (u, v, y) => (alongZ ? [u, y, v] : [v, y, u]);
    k.hex(bal, [P(u0, v0, y0 - 0.1), P(u1, v0, y0 - 0.1), P(u1, v1, y0 - 0.1), P(u0, v1, y0 - 0.1), P(u0, v0, y0 + 0.4), P(u1, v0, y0 + 0.4), P(u1, v1, y1 + 0.4), P(u0, v1, y1 + 0.4)]);
  }
  k.emit(bag, 0, 0, 0, 0, 1);
}
/** A platform rect from y to y + h: a sloping talud with a red band under its lip, the top plastered (a walk). */
function platform(bag, col, r, y, h, ins = 0.5) {
  bag.add(W, frustum(r, y, y + h, ins, ins, ins, ins, { noBottom: true }));
  bag.add(R, frustum([r[0] + ins - 0.03, r[1] + ins - 0.03, r[2] - ins + 0.03, r[3] - ins + 0.03], y + h - 0.35, y + h - 0.12, 0, 0, 0, 0, { noBottom: true, noTop: true }));
  col.rect(r, y, y + h); col.floor([r[0] + ins, r[1] + ins, r[2] - ins, r[3] - ins], y + h);
}
function person(ctx, x, z, y, rot, who, seed) {
  const L = STYLES.life.elements, r = rng(seed);
  const base = { at: [x, z], y, rot, seed, dress: 'tunic', legs: 'bare', feet: 'bare', skin: r() < 0.5 ? 'skin_medium' : 'skin_dark', hair: 'long', hairMat: 'hide_black', beard: false };
  if (who === 'priest') L.figure({ ...base, dress: 'robe', cloth: 'cloth_black', over: 'none', hair: 'long' }, ctx);           // the priests black-robed, their hair long
  else if (who === 'eagle') L.figure({ ...base, cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'cape', hat: 'cap', hatMat: OC }, ctx);
  else if (who === 'youth') L.figure({ ...base, cloth: 'cloth_white', over: 'none', hair: 'short', pose: r() < 0.5 ? 'talk' : 'stand' }, ctx);
  else L.figure({ ...base, cloth: 'cloth_white', cloth2: 'cloth_white', over: r() < 0.5 ? 'cape' : 'none', pose: r() < 0.5 ? 'talk' : 'stand' }, ctx);
}

// ---- carved and modelled pieces ------------------------------------------------------------------------

/**
 * A tile of the House of the Eagles' benches, 2 m long, facing +z (mesoweb; cookjmex): the vertical
 * face carved with warriors in feathered regalia processing (dir ±1 along x), polychrome, under a
 * projecting lip with serpents undulating along it; `zac`: the tile holds the zacatapayolli, the
 * grass ball with the bloodied spines, to which the processions converge. Height 0.62 m.
 */
const benchTile = (dir, zac) => carved(`eagle-bench:${dir}:${zac ? 1 : 0}`, (k) => {
  k.bx(BS, -1, 1, 0.47, 0.62, 0, 0.07);                                                                // the lip
  for (let i = 0; i < 5; i++) {                                                                         // its serpents, one after another
    const x0 = -1 + i * 0.4;
    strip(k, R, [x0 + 0.02, 0.53], [x0 + 0.14, 0.57], 0.025, 0.05, 0.085); strip(k, R, [x0 + 0.14, 0.57], [x0 + 0.26, 0.51], 0.025, 0.05, 0.085);
    strip(k, R, [x0 + 0.26, 0.51], [x0 + 0.36, 0.55], 0.03, 0.05, 0.085, 0.04);
  }
  const fig = (x, s) => {                                                                               // a warrior in profile, facing s
    strip(k, 'stucco_ochre', [x - 0.03, 0.06], [x - 0.02, 0.2], 0.018, -0.005, 0.02); strip(k, 'stucco_ochre', [x + 0.03, 0.06], [x + 0.04, 0.2], 0.018, -0.005, 0.02);
    strip(k, B, [x, 0.19], [x + s * 0.01, 0.33], 0.05, -0.02, 0.035);                                  // the quilted tunic
    k.bx('stucco_ochre', x - 0.03, x + 0.03, 0.33, 0.39, -0.005, 0.02);                                // the head
    for (let j = 0; j < 4; j++) strip(k, LF, [x - s * 0.01, 0.38], [x - s * (0.06 + j * 0.03), 0.45 - j * 0.02], 0.012, -0.035, 0.05);   // the plumes streaming back
    k.disc(OC, x + s * 0.06, 0.26, -0.05, 0.045, 0.115, 10);                                          // the round shield
    strip(k, 'timber', [x + s * 0.09, 0.08], [x + s * 0.11, 0.42], 0.008, -0.02, 0.035);               // the staff (bone perforator, dart)
  };
  for (let i = 0; i < 3; i++) { const x = -0.66 + i * 0.66; if (zac && Math.abs(x) < 0.3) continue; fig(x, dir); }
  if (zac) {
    k.disc(OC, 0, 0.24, -0.05, 0.15, 0.1, 16);                                                         // the zacatapayolli
    for (let j = 0; j < 5; j++) { const a = 0.6 + j * 0.48; strip(k, W, [Math.cos(a) * 0.08, 0.24 + Math.sin(a) * 0.08], [Math.cos(a) * 0.22, 0.24 + Math.sin(a) * 0.22], 0.012, 0.0, 0.07, 0.004); }
    for (const sx of [-1, 1]) fig(sx * 0.55, -sx);
  }
});

/** A ceramic eagle warrior, life-size (about 1.7 m), facing +z: clawed feet, the feathered suit, the wings on the arms, the face in the open beak of the eagle helmet. */
const eagleWarrior = () => carved('eagle-warrior', (k) => {
  for (const sx of [-1, 1]) {
    k.seg(TC, [sx * 0.11, 0.08, 0], [sx * 0.11, 0.82, 0], 0.07, 0.07);                                  // the legs
    for (let c = 0; c < 3; c++) k.seg(TC, [sx * 0.11, 0.04, 0], [sx * (0.07 + c * 0.04), 0.02, 0.17], 0.025, 0.03);   // the talons
    k.seg(TC, [sx * 0.24, 1.35, 0], [sx * 0.42, 1.0, 0.18], 0.06, 0.06);                               // the arms, held forward
    for (let f = 0; f < 5; f++) k.seg(TC, [sx * (0.27 + f * 0.035), 1.32 - f * 0.07, -0.02], [sx * (0.34 + f * 0.04), 0.86 - f * 0.05, -0.08], 0.03, 0.06, 0.02, 0.03);   // the wing feathers hanging from them
  }
  k.fz(TC, [-0.22, 0.22, 0.78, 1.42], [-0.2, 0.2, 0.8, 1.4], -0.14, 0.15);                             // the body in its feathered suit
  for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) k.fy(TC, [-0.19 + i * 0.1, -0.11 + i * 0.1, 0.15, 0.18], [-0.17 + i * 0.1, -0.13 + i * 0.1, 0.15, 0.17], 1.36 - r * 0.15, 1.24 - r * 0.15);   // feather rows
  k.fz(TC, [-0.17, 0.17, 1.42, 1.78], [-0.15, 0.15, 1.44, 1.74], -0.16, 0.14);                         // the helmet
  k.fz(TC, [-0.13, 0.13, 1.66, 1.78], [-0.03, 0.03, 1.56, 1.6], 0.14, 0.36);                           // the upper beak, hooked down
  k.fz(TC, [-0.12, 0.12, 1.42, 1.48], [-0.05, 0.05, 1.45, 1.47], 0.14, 0.26);                          // the lower beak
  k.bx('skin_medium', -0.09, 0.09, 1.48, 1.64, 0.1, 0.16);                                              // the face between the jaws
  for (const sx of [-1, 1]) k.discAt(BK, sx * 0.165, 1.7, 0.06, 0.035, 0.03, sx * Math.PI / 2);         // the eagle's eyes
});

/** A ceramic Mictlantecuhtli (1.74 m, mesoweb), facing +z: the skull, the bare ribs, the liver hanging under them, the clawed hands raised. */
const mictlan = () => carved('mictlantecuhtli', (k) => {
  for (const sx of [-1, 1]) {
    k.seg(TC, [sx * 0.12, 0.05, 0], [sx * 0.12, 0.8, 0], 0.07, 0.07);
    k.seg(TC, [sx * 0.2, 1.38, 0], [sx * 0.42, 1.55, 0.2], 0.05, 0.05); k.seg(TC, [sx * 0.42, 1.55, 0.2], [sx * 0.38, 1.82, 0.22], 0.045, 0.045);   // the arms raised
    for (let c = 0; c < 3; c++) k.seg(W, [sx * 0.38, 1.82, 0.22], [sx * (0.32 + c * 0.05), 1.95, 0.27], 0.012, 0.012);
  }
  k.fz(TC, [-0.2, 0.2, 0.78, 1.0], [-0.18, 0.18, 0.8, 0.98], -0.12, 0.12);                              // the hips
  k.fz(TC, [-0.06, 0.06, 1.0, 1.42], [-0.06, 0.06, 1.0, 1.42], -0.12, -0.02);                           // the spine
  for (let i = 0; i < 5; i++) k.seg(W, [-0.18, 1.12 + i * 0.06, 0.06], [0.18, 1.12 + i * 0.06, 0.06], 0.012, 0.02);   // the ribs
  k.fz(TC, [-0.2, 0.2, 1.4, 1.46], [-0.2, 0.2, 1.4, 1.46], -0.1, 0.1);
  k.geo(R, lathe([[0.001, 0], [0.07, 0.04], [0.06, 0.16], [0.001, 0.19]], 8).translate(0, 0.86, 0.06));   // the liver
  k.fz(W, [-0.15, 0.15, 1.46, 1.78], [-0.13, 0.13, 1.5, 1.74], -0.14, 0.15);                            // the skull
  for (const sx of [-1, 1]) k.bx(BK, sx * 0.065 - 0.04, sx * 0.065 + 0.04, 1.62, 1.68, 0.14, 0.16);
  for (let i = 0; i < 5; i++) k.bx(W, -0.08 + i * 0.04, -0.065 + i * 0.04, 1.47, 1.53, 0.14, 0.17);    // the teeth
});

/** A ceramic brazier with Tlaloc's face (mesoweb: tears of rain), about 0.8 m, facing +z: the goggles, the moustache-lip and fangs. */
const tlalocBrazier = () => carved('tlaloc-brazier', (k) => {
  k.geo(TC, lathe([[0.2, 0], [0.16, 0.12], [0.2, 0.3], [0.28, 0.62], [0.3, 0.78], [0.26, 0.8], [0.001, 0.7]], 14));
  for (const sx of [-1, 1]) { k.disc(B, sx * 0.1, 0.56, 0.23, 0.08, 0.06, 12, 0.04); k.fy(W, [sx * 0.05 - 0.025, sx * 0.05 + 0.025, 0.25, 0.3], [sx * 0.05 - 0.005, sx * 0.05 + 0.005, 0.27, 0.29], 0.42, 0.32); for (let t = 0; t < 2; t++) k.bx(B, sx * 0.1 - 0.015, sx * 0.1 + 0.015, 0.36 - t * 0.09, 0.42 - t * 0.09, 0.2, 0.25); }
  k.fz(B, [-0.12, 0.12, 0.42, 0.47], [-0.1, 0.1, 0.43, 0.46], 0.23, 0.29);                               // the lip
});

/** A cut-conch merlon of the calmecac's roof (archaeology.org: snail-shaped, about 2.4 m), facing +z: a spiral volute on a block. */
const conchMerlon = () => carved('cut-conch', (k) => {
  k.bx(W, -0.55, 0.55, 0, 0.35, -0.12, 0.12);
  let prev = null;
  for (let i = 0; i <= 26; i++) {
    const a = i * 0.36, r = 0.95 * Math.exp(-0.085 * a), p = [Math.sin(a) * r, 1.35 + Math.cos(a) * r];
    if (prev) strip(k, W, prev, p, 0.13 * r + 0.03, -0.1, 0.1, 0.13 * r + 0.03);
    prev = p;
  }
  k.bx(W, -0.12, 0.12, 0.3, 0.45, -0.1, 0.1);
  k.disc(R, 0.06, 1.38, 0.1, 0.12, 0.02, 12);
});

// ---- the buildings -------------------------------------------------------------------------------------

/** Benches along a wall face (ax, c, side) from a0 to a1, height 0.62, depth 0.9, the procession converging on the middle. */
function benches(bag, col, ax, c, side, a0, a1, y) {
  const d = 0.9, L = a1 - a0, n = Math.max(1, Math.round(L / 2)), t = L / n;
  const r = ax === 'x' ? [a0, side > 0 ? c : c - d, a1, side > 0 ? c + d : c] : [side > 0 ? c : c - d, a0, side > 0 ? c + d : c, a1];
  bag.add(BS, box(r[0], y, r[1], r[2], y + 0.47, r[3])); col.rect(r, y, y + 0.62); col.floor(r, y + 0.62);
  bag.add('stucco', box(r[0], y + 0.47, r[1], r[2], y + 0.62, r[3]));
  const fc = c + side * d;
  for (let i = 0; i < n; i++) {
    const u = a0 + t * (i + 0.5), mid = i === Math.floor(n / 2), dir = u < (a0 + a1) / 2 ? 1 : -1;
    // the tile's +x must run along increasing u where the procession heads that way
    const [fx, fz] = ax === 'x' ? [0, side] : [side, 0], right = ax === 'x' ? side : -side;
    benchTile(dir * right, mid).emit(bag, ax === 'x' ? u : fc, y, ax === 'x' ? fc : u, fx, fz, t / 2);
  }
}
/** The painted bands of a room's walls above the benches: black, blue, red, ochre, bottom to top (mesoweb). */
function wallBands(bag, ax, c, side, a0, a1, y, doors = []) {
  for (const [u0, u1] of runs(a0, a1, doors, 0.02)) ['paint_minoan_black', B, R, OC].forEach((m, i) => band(bag, m, ax, c, side, u0, u1, y + 0.62 + i * 0.32, y + 0.94 + i * 0.32, 0.02));
}

/**
 * eagle_house { rect, seed }: the House of the Eagles north of the Templo Mayor (mesoweb, House of Eagles;
 * cookjmex): an L-shaped platform — a north wing and an east wing — with its stairs at the inner (south-west)
 * corner flanked by eagle heads; the east wing's portico on pilasters before the main room with its great
 * altar, the door guarded by two ceramic eagle warriors; the north wing's portico, behind it the hall of
 * benches (two Mictlantecuhtli figures at its door), the sunken patio with a pillar at each corner, and the
 * room with its small altar and pair of Tlaloc braziers; benches round the rooms, the walls banded.
 */
export function eagleHouse(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, PH = 1.4, y = PH, H = 3.4, T = 0.6, rt = y + H + 0.4;
  const NW = [X0, Z0, X1, Z0 + 16], EW = [X1 - 18, Z0 + 16, X1, Z1];
  platform(bag, col, NW, 0, PH, 0.4); platform(bag, col, [EW[0], EW[1] - 0.6, EW[2], EW[3]], 0, PH, 0.4);
  const ny = NW[3] - 0.4, ex = EW[0] + 0.4;                                    // the platforms' inner edges at their top
  // the stairs at the inner corner, eagle heads at the feet of their balustrades
  stair(bag, col, [X0 + 18, ny, X0 + 28, NW[3] + 3.4], 0, PH + 0.02, 'n');
  stair(bag, col, [EW[0] - 3.4, Z1 - 12, ex, Z1 - 4], 0, PH + 0.02, 'e');
  const eagleHead = carved('eagle-head', (k) => {
    k.bx(W, -0.35, 0.35, 0, 0.7, -0.4, 0.2);
    k.fz(W, [-0.3, 0.3, 0.45, 0.8], [-0.05, 0.05, 0.25, 0.4], 0.2, 0.75);                                 // the hooked beak
    k.fz(W, [-0.25, 0.25, 0.15, 0.35], [-0.1, 0.1, 0.22, 0.3], 0.2, 0.55);
    for (const sx of [-1, 1]) k.discAt(BK, sx * 0.355, 0.6, 0.0, 0.07, 0.03, sx * Math.PI / 2);
    for (let i = 0; i < 4; i++) k.seg(W, [-0.3 + i * 0.2, 0.7, -0.3], [-0.36 + i * 0.24, 1.05, -0.45], 0.06, 0.03);   // the crest
  });
  for (const x of [X0 + 18.25, X0 + 27.75]) { eagleHead.emit(bag, x, 0, NW[3] + 3.9, 0, 1); col.rect([x - 0.4, NW[3] + 3.4, x + 0.4, NW[3] + 4.6], 0, 1); }
  for (const z of [Z1 - 11.75, Z1 - 4.25]) { eagleHead.emit(bag, EW[0] - 3.9, 0, z, -1, 0); col.rect([EW[0] - 4.6, z - 0.4, EW[0] - 3.4, z + 0.4], 0, 1); }
  // ---- the east wing: the portico facing west on pilasters, the main room behind
  const px = ex + 3.4, mz = (EW[1] + EW[3]) / 2, door = [{ at: mz, w: 1.8, h: 2.6 }];
  wall(bag, col, W, 'z', px, px + T, EW[1], Z1 - 0.4, y, y + H, door);
  wall(bag, col, W, 'z', X1 - 0.4 - T, X1 - 0.4, EW[1], Z1 - 0.4, y, y + H);
  wall(bag, col, W, 'x', Z1 - 0.4 - T, Z1 - 0.4, ex, X1 - 0.4, y, y + H);
  for (let i = 0; i < 5; i++) { const z = EW[1] + 0.9 + i * (Z1 - 0.4 - 0.9 - EW[1] - 0.9) / 4; bag.add(W, box(ex + 0.1, y, z - 0.35, ex + 0.8, y + H, z + 0.35)); band(bag, R, 'z', ex + 0.1, -1, z - 0.36, z + 0.36, y, y + 0.6); col.rect([ex + 0.1, z - 0.35, ex + 0.8, z + 0.35], y, y + H); }
  bag.add(W, box(ex, y + H - 0.6, EW[1], px, y + H, Z1 - 0.4)); band(bag, R, 'z', ex, -1, EW[1], Z1 - 0.4, y + H - 0.6, y + H, 0.03);
  for (const s of [-1, 1]) eagleWarrior().emit(bag, px - 0.8, y, mz + s * 1.9, -1, 0, 1.0);
  for (const s of [-1, 1]) col.rect([px - 1.1, mz + s * 1.9 - 0.35, px - 0.5, mz + s * 1.9 + 0.35], y, y + 1.8);
  // the main room: the great altar against the east wall, benches along the north and south walls
  const rm = [px + T, EW[1], X1 - 0.4 - T, Z1 - 0.4 - T];
  bag.add(BS, box(rm[2] - 1.4, y, mz - 2, rm[2], y + 1.1, mz + 2)); band(bag, R, 'z', rm[2] - 1.4, -1, mz - 2, mz + 2, y + 0.8, y + 1.0, 0.02); col.rect([rm[2] - 1.4, mz - 2, rm[2], mz + 2], y, y + 1.1);
  for (const s of [-1, 1]) tlalocBrazier().emit(bag, rm[2] - 2.2, y, mz + s * 2.6, -1, 0);
  benches(bag, col, 'x', rm[3], -1, rm[0], rm[2] - 1.6, y); wallBands(bag, 'x', rm[3] - 0.9, -1, rm[0], rm[2] - 1.6, y);
  // ---- the north wing: its portico facing south, the hall of benches, the sunken patio, the room of the altar
  const pz = ny - 3.4, bz = pz - T, hallX = X0 + 20, patX = [X0 + 20.6, X0 + 31], q = Z0 + 0.4;
  const doorsN = [{ at: X0 + 10, w: 1.6, h: 2.5 }, { at: (patX[0] + patX[1]) / 2, w: 2.0, h: 2.6 }, { at: X1 - 24, w: 1.4, h: 2.4 }];
  wall(bag, col, W, 'x', bz, pz, X0 + 0.4, ex, y, y + H, doorsN);
  wall(bag, col, W, 'x', q, q + T, X0 + 0.4, X1 - 0.4, y, y + H);
  wall(bag, col, W, 'z', X0 + 0.4, X0 + 0.4 + T, q + T, ny, y, y + H);
  wall(bag, col, W, 'z', X1 - 0.4 - T, X1 - 0.4, q + T, EW[1], y, y + H);
  wall(bag, col, W, 'x', EW[1] - T, EW[1], px + T, X1 - 0.4 - T, y, y + H, [{ at: (px + X1) / 2, w: 1.4, h: 2.4 }]);
  for (const xx of [hallX, patX[1] + T]) wall(bag, col, W, 'z', xx - T, xx, q + T, bz, y, y + H);
  // the portico's pilasters along its front
  for (let i = 0; i < 8; i++) { const x = X0 + 1.4 + i * (ex - X0 - 2.8) / 7; bag.add(W, box(x - 0.35, y, ny - 0.8, x + 0.35, y + H, ny - 0.1)); band(bag, R, 'x', ny - 0.1, 1, x - 0.36, x + 0.36, y, y + 0.6); col.rect([x - 0.35, ny - 0.8, x + 0.35, ny - 0.1], y, y + H); }
  bag.add(W, box(X0 + 0.4, y + H - 0.6, pz, ex, y + H, ny - 0.1)); band(bag, R, 'x', ny - 0.1, 1, X0 + 0.4, ex, y + H - 0.6, y + H, 0.03);
  for (const s of [-1, 1]) { mictlan().emit(bag, X0 + 10 + s * 1.5, y, pz + 0.6, 0, 1); col.rect([X0 + 10 + s * 1.5 - 0.35, pz + 0.3, X0 + 10 + s * 1.5 + 0.35, pz + 0.9], y, y + 1.9); }
  // the hall of benches
  benches(bag, col, 'x', q + T, 1, X0 + 1, hallX - T, y); wallBands(bag, 'x', q + T + 0.9, 1, X0 + 1, hallX - T, y);
  benches(bag, col, 'z', X0 + 0.4 + T, 1, q + T + 0.9, bz, y); wallBands(bag, 'z', X0 + 0.4 + T + 0.9, 1, q + T + 0.9, bz, y);
  benches(bag, col, 'z', hallX - T, -1, q + T + 0.9, bz, y); wallBands(bag, 'z', hallX - T - 0.9, -1, q + T + 0.9, bz, y);
  for (const [a0, a1] of runs(X0 + 1, hallX - T, [{ at: X0 + 10, w: 1.6 }], 0.1)) { benches(bag, col, 'x', bz, -1, a0, a1, y); wallBands(bag, 'x', bz - 0.9, -1, a0, a1, y); }
  // the patio, open to the sky, a pillar at each of its corners (its floor kept level with the rooms': the sunken floor is not modelled)
  const ps = [patX[0], q + T, patX[1], bz];
  bag.add('lime_plaster', box(ps[0], PH - 0.05, ps[1], ps[2], PH + 0.035, ps[3]));
  for (const [x, z] of [[ps[0] + 0.5, ps[1] + 0.5], [ps[2] - 0.5, ps[1] + 0.5], [ps[0] + 0.5, ps[3] - 0.5], [ps[2] - 0.5, ps[3] - 0.5]]) { bag.add(W, box(x - 0.35, y, z - 0.35, x + 0.35, y + H, z + 0.35)); col.rect([x - 0.35, z - 0.35, x + 0.35, z + 0.35], y, y + H); }
  // the room of the small altar and the braziers, east of the patio
  const ar = [patX[1] + T, q + T, ex, bz], ac = (ar[0] + ar[2]) / 2;
  bag.add(BS, box(ac - 1, y, ar[1], ac + 1, y + 0.9, ar[1] + 1)); band(bag, R, 'x', ar[1] + 1, 1, ac - 1, ac + 1, y + 0.6, y + 0.8); col.rect([ac - 1, ar[1], ac + 1, ar[1] + 1], y, y + 0.9);
  for (const s of [-1, 1]) tlalocBrazier().emit(bag, ac + s * 1.7, y, ar[1] + 0.9, 0, 1);
  wallBands(bag, 'z', ar[0], 1, ar[1], ar[3], y - 0.62);
  // the roofs (open over the patio), red cornice outside
  for (const r of [[X0 + 0.4, q, patX[0], pz], [patX[1], q, X1 - 0.4, pz], [EW[0] + 0.4, pz, X1 - 0.4, Z1 - 0.4]]) { bag.add('stucco', box(r[0], y + H, r[1], r[2], rt, r[3])); col.floor(r, rt); }
  bag.add('stucco', box(X0 + 0.4, y + H, pz, ex, rt, ny - 0.1));
  for (const [ax, c, sd, a0, a1] of [['x', q, -1, X0 + 0.4, X1 - 0.4], ['z', X1 - 0.4, 1, q, Z1 - 0.4], ['x', Z1 - 0.4, 1, EW[0] + 0.4, X1 - 0.4], ['z', X0 + 0.4, -1, q, ny - 0.1]]) band(bag, R, ax, c, sd, a0, a1, y + H, rt, 0.03);
  // the floors at the platform's top
  bag.add('stucco', box(X0 + 0.4, PH - 0.05, q, patX[0], PH + 0.02, ny)); bag.add('stucco', box(patX[1], PH - 0.05, q, X1 - 0.4, PH + 0.02, ny));
  bag.add('stucco', box(patX[0], PH - 0.05, bz, patX[1], PH + 0.02, ny)); bag.add('stucco', box(ex, PH - 0.05, EW[1], X1 - 0.4, PH + 0.02, Z1 - 0.4));
  // eagle warriors in council on the benches, one at the door
  person(ctx, X0 + 6, q + T + 0.5, y + 0.62, Math.PI, 'eagle', el.seed + 1); person(ctx, X0 + 9, q + T + 0.5, y + 0.62, Math.PI, 'eagle', el.seed + 2);
  person(ctx, X0 + 14, bz - 2.5, y + 0.02, 0.4, 'eagle', el.seed + 3); person(ctx, (patX[0] + patX[1]) / 2, ps[1] + 3, y + 0.035, Math.PI, 'priest', el.seed + 4);
}

/**
 * calmecac { rect, seed }: the school of the nobles' sons (INAH, Centro Cultural de España; archaeology.org):
 * a platform entered from the south by a broad stair; round its court porticoes on pilasters before rooms of
 * tezontle and mud, stuccoed, their benches along the walls and stucco floors; on the north range's roof the
 * crest of monumental cut-shell merlons, some 2.4 m, seen across the city.
 */
export function calmecac(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, PH = 1.2, y = PH + 0.02, H = 3.2, T = 0.6, D = 3.2, RM = 5, rt = y + H + 0.35;
  platform(bag, col, el.rect, 0, PH, 0.4);
  const xm = (X0 + X1) / 2, a = 0.4;
  stair(bag, col, [xm - 7, Z1 - a, xm + 7, Z1 + 2.6], 0, y, 'n');
  bag.add('stucco', box(X0 + a, PH - 0.05, Z0 + a, X1 - a, y, Z1 - a));
  // ranges north, west and east: outer wall, rooms, back wall with doors, portico of pilasters
  const cin = [X0 + a + RM + T + D, Z0 + a + RM + T + D, X1 - a - RM - T - D, Z1 - a - 2];    // the court
  const ranges = [
    { ax: 'x', out: Z0 + a, sd: 1, a0: X0 + a, a1: X1 - a },
    { ax: 'z', out: X0 + a, sd: 1, a0: Z0 + a + RM + T, a1: Z1 - a },
    { ax: 'z', out: X1 - a, sd: -1, a0: Z0 + a + RM + T, a1: Z1 - a },
  ];
  for (const g of ranges) {
    const o0 = g.sd > 0 ? g.out : g.out - T, back = g.out + g.sd * (T + RM), b0 = g.sd > 0 ? back : back - T, front = back + g.sd * (T + D);
    wall(bag, col, W, g.ax, o0, o0 + T, g.a0, g.a1, y, y + H, [], 'scoria_red');
    const L = g.a1 - g.a0, nd = Math.max(2, Math.round(L / 9)), doors = [];
    for (let i = 0; i < nd; i++) doors.push({ at: g.a0 + L * (i + 0.5) / nd, w: 1.3, h: 2.3 });
    wall(bag, col, W, g.ax, b0, b0 + T, g.a0 + (g.ax === 'z' ? 0 : RM + T), g.a1 - (g.ax === 'z' ? 0 : RM + T), y, y + H, doors, 'scoria_red');
    for (let i = 1; i < nd; i++) { const u = g.a0 + L * i / nd; wall(bag, col, W, g.ax === 'x' ? 'z' : 'x', u - 0.25, u + 0.25, Math.min(o0 + T, b0), Math.max(o0 + T, b0), y, y + H); }
    // benches along the rooms' outer walls
    for (let i = 0; i < nd; i++) {
      const u0 = g.a0 + L * i / nd + 0.4, u1 = g.a0 + L * (i + 1) / nd - 0.4, c = g.sd > 0 ? o0 + T : o0;
      const r = g.ax === 'x' ? [u0, g.sd > 0 ? c : c - 0.8, u1, g.sd > 0 ? c + 0.8 : c] : [g.sd > 0 ? c : c - 0.8, u0, g.sd > 0 ? c + 0.8 : c, u1];
      bag.add('stucco', box(r[0], y, r[1], r[2], y + 0.5, r[3])); band(bag, R, g.ax, c + g.sd * 0.8, g.sd, u0, u1, y, y + 0.12); col.rect(r, y, y + 0.5); col.floor(r, y + 0.5);
      bag.add('reed_mat', g.ax === 'x' ? box(u0 + 0.5, y, c + g.sd * 1.6 - 0.6, u0 + 2.3, y + 0.02, c + g.sd * 1.6 + 0.6) : box(c + g.sd * 1.6 - 0.6, y, u0 + 0.5, c + g.sd * 1.6 + 0.6, y + 0.02, u0 + 2.3));
    }
    // the pilasters along the portico's front
    const np = Math.max(3, Math.round((g.a1 - g.a0) / 4)), f0 = g.sd > 0 ? front - 0.7 : front;
    for (let i = 0; i < np; i++) {
      const u = g.a0 + (g.ax === 'z' ? D + T : 0) + 0.6 + i * ((g.a1 - g.a0 - (g.ax === 'z' ? D + T : 0)) - 1.2) / (np - 1);
      const r = g.ax === 'x' ? [u - 0.35, f0, u + 0.35, f0 + 0.7] : [f0, u - 0.35, f0 + 0.7, u + 0.35];
      bag.add(W, box(r[0], y, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H);
    }
    const rr = g.ax === 'x' ? [g.a0, Math.min(g.out, front), g.a1, Math.max(g.out, front)] : [Math.min(g.out, front), g.a0, Math.max(g.out, front), g.a1];
    bag.add('stucco', box(rr[0], y + H, rr[1], rr[2], rt, rr[3])); col.floor(rr, rt);
    band(bag, R, g.ax, g.out, -g.sd, g.a0, g.a1, y + H - 0.1, rt, 0.03);
    band(bag, R, g.ax, front, g.sd, g.a0, g.a1, y + H - 0.1, rt, 0.03);
  }
  // the crest of cut shells on the north range, facing the court
  const fz = Z0 + a + RM + T + T + D, n = 9;
  for (let i = 0; i < n; i++) { const x = X0 + 5 + (X1 - X0 - 10) * i / (n - 1); conchMerlon().emit(bag, x, rt, fz - 0.6, 0, 1); }
  // students and a priest in the court
  person(ctx, xm, cin[1] + 4, y, Math.PI, 'priest', el.seed + 1);
  for (let i = 0; i < 5; i++) person(ctx, xm - 4 + i * 2, cin[1] + 6.5 + (i % 2) * 0.6, y, 0, 'youth', el.seed + 10 + i);
}

/**
 * coatepantli { pts, paint, kind }: one of the two serpents round the Templo Mayor (Wikipedia, Coatepantli: the
 * 1981 excavation found "two walls shaped like large snakes with painted heads", the northern blue for Tlaloc,
 * the southern ochre for Huitzilopochtli): a low plastered wall carrying the serpent's body — undulating,
 * banded with scales — from the head at pts[0], its jaws open outward, to the rattles at the last point.
 */
export function coatepantli(el, { bag, col }) {
  const P = el.pts, paint = el.paint ?? B, k = new Kit(), WH = 0.9, by = 1.28, bw = 0.5, bh = 0.4;
  let s0 = 0;
  for (let i = 0; i + 1 < P.length; i++) {
    const [a, b] = [P[i], P[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const r = [Math.min(a[0], b[0]) - (ux ? 0 : 0.5), Math.min(a[1], b[1]) - (uz ? 0 : 0.5), Math.max(a[0], b[0]) + (ux ? 0 : 0.5), Math.max(a[1], b[1]) + (uz ? 0 : 0.5)];
    bag.add(W, frustum(r, 0, WH, 0.05, 0.05, 0.05, 0.05, { noBottom: true })); col.rect(r, 0, by + bh);
    const st = 0.8, n = Math.ceil(L / st);
    for (let j = 0; j < n; j++) {
      const t0 = j * L / n, t1 = (j + 1) * L / n, sw = (t) => 0.12 * Math.sin((s0 + t) * 2 * Math.PI / 7);
      const p0 = [a[0] + ux * t0 - uz * sw(t0), by, a[1] + uz * t0 + ux * sw(t0)], p1 = [a[0] + ux * (t1 + 0.04) - uz * sw(t1), by, a[1] + uz * (t1 + 0.04) + ux * sw(t1)];
      k.seg(paint, p0, p1, bw, bh);
      if (j % 2 === 0) { const m = [(p0[0] + p1[0]) / 2, by, (p0[2] + p1[2]) / 2]; k.seg(OC === paint ? R : W, [m[0] - ux * 0.08, by, m[2] - uz * 0.08], [m[0] + ux * 0.08, by, m[2] + uz * 0.08], bw + 0.025, bh + 0.025); }   // a band of scales
    }
    s0 += L;
  }
  k.emit(bag, 0, 0, 0, 0, 1);
  // the head at the first point, its jaws turned away from the body; the rattles at the tail
  const [h0, h1] = [P[0], P[1]], L0 = Math.hypot(h1[0] - h0[0], h1[1] - h0[1]), dx = (h0[0] - h1[0]) / L0, dz = (h0[1] - h1[1]) / L0;
  serpentHeadKit({ stone: paint, goggles: el.kind === 'tlaloc', plumes: el.kind !== 'tlaloc' }).emit(bag, h0[0] - dx * 0.5, 0, h0[1] - dz * 0.5, dx, dz, 1.05);
  col.rect([h0[0] - 1, h0[1] - 1, h0[0] + 1, h0[1] + 1], 0, 1.6);
  const [t0, t1] = [P[P.length - 1], P[P.length - 2]], Lt = Math.hypot(t0[0] - t1[0], t0[1] - t1[1]), tx = (t0[0] - t1[0]) / Lt, tz = (t0[1] - t1[1]) / Lt, kr = new Kit();
  for (let i = 0; i < 5; i++) { const w = bw * (0.85 - i * 0.12), c = [t0[0] + tx * (0.1 + i * 0.38), by - i * 0.08, t0[1] + tz * (0.1 + i * 0.38)]; kr.seg(i % 2 ? W : paint, [c[0] - tx * 0.2, c[1], c[2] - tz * 0.2], [c[0] + tx * 0.2, c[1], c[2] + tz * 0.2], w, w * 0.8); }
  kr.emit(bag, 0, 0, 0, 0, 1);
}

/**
 * mx_enclosure { a, b, w, h }: a side of the platform that bounded the precinct (mesoweb, Sacred Precinct:
 * "a wide rectangular platform with alternating vertical walls, inclined planes, and staircases on its inner
 * and outer faces"): on each face a talud below a vertical wall with a red band, the top a walk; a stair
 * up each face every ~45 m.
 */
export function enclosure(el, { bag, col }) {
  const [a, b] = [el.a, el.b], w = (el.w ?? 6) / 2, h = el.h ?? 3, alongX = a[1] === b[1];
  const r = alongX ? [Math.min(a[0], b[0]), a[1] - w, Math.max(a[0], b[0]), a[1] + w] : [a[0] - w, Math.min(a[1], b[1]), a[0] + w, Math.max(a[1], b[1])];
  const ti = 0.9, yt = h * 0.42;
  const e0 = alongX ? [0, ti, 0, ti] : [ti, 0, ti, 0];
  bag.add(W, frustum(r, 0, yt, e0[0], e0[2], e0[1], e0[3], { noBottom: true, noTop: true }));
  const r2 = alongX ? [r[0], r[1] + ti, r[2], r[3] - ti] : [r[0] + ti, r[1], r[2] - ti, r[3]];
  bag.add(W, frustum(r2, yt, h, 0, 0, 0, 0, { noBottom: true }));
  bag.add(R, frustum(alongX ? [r2[0], r2[1] - 0.03, r2[2], r2[3] + 0.03] : [r2[0] - 0.03, r2[1], r2[2] + 0.03, r2[3]], h - 0.45, h - 0.15, 0, 0, 0, 0, { noBottom: true, noTop: true }));
  col.rect(r, 0, h); col.floor(r2, h);
  const L = alongX ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / 45);
  for (let i = 0; i < n; i++) {
    const u = (alongX ? r[0] : r[1]) + L * (i + 0.5) / n, run = h * 1.1;
    for (const s of [-1, 1]) {
      const sr = alongX ? [u - 2, s < 0 ? r[1] - run + 0.9 : r[3] - 0.9, u + 2, s < 0 ? r[1] + 0.9 : r[3] + run - 0.9] : [s < 0 ? r[0] - run + 0.9 : r[2] - 0.9, u - 2, s < 0 ? r[0] + 0.9 : r[2] + run - 0.9, u + 2];
      stair(bag, col, sr, 0, h, alongX ? (s < 0 ? 's' : 'n') : (s < 0 ? 'e' : 'w'));
    }
  }
}

/**
 * ehecatl_temple { c, r, h, front }: Ehecatl-Quetzalcoatl's temple (INAH, Ventana arqueológica: a rectangular
 * platform about 34 m north–south with a circular part about 18 m across, the façade to the east; mesoweb,
 * after Acosta: a truncated cone, the door "built like the mouth of a snake"; archaeology.org: a conical roof
 * of straw said to resemble a coiled snake): the round body in two tiers behind the rectangular front, the stair
 * up its east face, on top the round red shrine with its serpent-jawed door and the coiled thatch.
 */
export function ehecatl(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, h = el.h, rd = el.front ?? 24, rw = r * 1.1;
  // the round body in two tiers, the rectangular front with the same two tiers
  const t1 = h * 0.55;
  bag.add(W, lathe([[r + 1.6, 0], [r + 0.9, t1], [0.001, t1]], 40, null, cx, 0, cz));
  bag.add(W, lathe([[r + 0.4, t1], [r - 0.2, h], [0.001, h]], 40, null, cx, 0, cz));
  bag.add(R, lathe([[r + 0.94, t1 - 0.35], [r + 0.94, t1 - 0.1], [r + 0.4, t1 - 0.1], [r + 0.4, t1 - 0.35]], 40, null, cx, 0, cz));
  bag.add(W, frustum([cx, cz - rd / 2, cx + rw, cz + rd / 2], 0, t1, 0, 0.7, 0.7, 0.7, { noBottom: true, noTop: true }));
  bag.add(W, frustum([cx, cz - rd / 2 + 1.2, cx + rw - 1.2, cz + rd / 2 - 1.2], t1, h, 0, 0.6, 0.6, 0.6, { noBottom: true }));
  bag.add(W, box(cx, t1 - 0.05, cz - rd / 2 + 0.7, cx + rw - 0.7, t1, cz + rd / 2 - 0.7));
  col.circle(cx, cz, r + 1.2, 0, h); col.rect([cx, cz - rd / 2, cx + rw, cz + rd / 2], 0, h);
  col.floor([cx - r * 0.7, cz - r * 0.7, cx + rw - 1.8, cz + r * 0.7], h); col.floor([cx, cz - rd / 2 + 1.8, cx + rw - 1.8, cz + rd / 2 - 1.8], h);
  // the stair up the east face
  stair(bag, col, [cx + rw - 1.8, cz - 3.5, cx + rw + h * 1.05, cz + 3.5], 0, h, 'w');
  // the round shrine: red walls, the serpent's jaws round its east door, the coiled thatch
  const rs = r * 0.55, sh = 3.8, y = h;
  bag.add(R, lathe([[rs, 0], [rs, sh], [0.001, sh]], 32, null, cx, y, cz)); col.circle(cx, cz, rs, y, y + sh);
  bag.add('opening', box(cx + rs - 0.05, y, cz - 0.9, cx + rs + 0.12, y + 2.3, cz + 0.9));
  const jaw = carved('ehecatl-door', (k) => {
    k.fz(W, [-1.5, 1.5, 2.3, 3.1], [-1.3, 1.3, 2.35, 2.95], 0, 0.9);                                   // the upper jaw over the door
    k.fz(W, [-1.4, 1.4, 0, 0.3], [-1.3, 1.3, 0, 0.22], 0, 0.8);                                        // the lower jaw at the threshold
    for (const sx of [-1, 1]) {
      k.bx(W, sx * 1.15 - 0.3, sx * 1.15 + 0.3, 0.3, 2.3, 0, 0.5);                                      // the jaws' hinges, the door's jambs
      k.fy('plaster_white', [sx * 0.75 - 0.1, sx * 0.75 + 0.1, 0.6, 0.85], [sx * 0.75 - 0.02, sx * 0.75 + 0.02, 0.72, 0.78], 2.35, 1.75);   // the fangs
      k.disc(BK, sx * 0.8, 2.75, 0.9, 0.12, 0.04, 10); k.disc(W, sx * 0.8, 2.75, 0.86, 0.22, 0.04, 12, 0.12);   // the eyes on the snout
    }
    for (let i = 0; i < 6; i++) { const x = -0.55 + i * 0.22; k.fy('plaster_white', [x - 0.05, x + 0.05, 0.7, 0.82], [x - 0.01, x + 0.01, 0.75, 0.77], 2.35, 2.05); }
    k.fz(R, [-0.35, 0.35, 0.22, 0.3], [-0.25, 0.25, 0.22, 0.28], 0.4, 1.4);                            // the tongue out over the step
  });
  jaw.emit(bag, cx + rs - 0.2, y, cz, 1, 0);
  for (let i = 0; i < 5; i++) {                                                                         // the thatch in coils, each a ring stepped in
    const r0 = rs + 1.3 - i * (rs + 1.1) / 5, r1 = rs + 1.3 - (i + 1) * (rs + 1.1) / 5 + 0.25, y0 = y + sh + i * 1.1;
    bag.add('thatch', lathe([[r0, 0], [r1, 1.15], [0.001, 1.15]], 32, null, cx, y0, cz));
  }
  bag.add('thatch', lathe([[0.45, 0], [0.001, 0.9]], 12, null, cx, y + sh + 5.5, cz));
}

/**
 * mx_temple { c, base, top, h, tiers, stair, stairW, god }: a Mexica temple-pyramid (the temple of
 * Tezcatlipoca: "very tall and very beautifully built", of eighty steps — mesoweb after Acosta): stuccoed
 * sloping tiers each under a red band, the stair between balustrades that steepen into a vertical dado near
 * the top, the shrine — red walls, a cotton curtain in the door, the roof stage painted black and set with
 * white stars (Tezcatlipoca's night) under a crest of merlons [inferred: the shrine's painting].
 */
import { shrineChamber } from './palace.js';
export function mxTemple(el, { bag, col }) {
  const [cx, cz] = el.c, n = el.tiers ?? 4, H = el.h, b = el.base / 2, t = el.top / 2;
  for (let k = 0; k < n; k++) {
    const y0 = H * k / n, y1 = H * (k + 1) / n, a0 = b - (b - t) * k / n, a1 = b - (b - t) * (k + 1) / n, ledge = 0.9, ins = a0 - a1 - ledge;
    bag.add(W, frustum([cx - a0, cz - a0, cx + a0, cz + a0], y0, y1, ins, ins, ins, ins, { noBottom: true }));
    const q = a0 - ins * (1 - 0.5 / (y1 - y0)) + 0.04;                          // the red band round the tier's lip, standing proud of its slope
    bag.add(R, frustum([cx - q, cz - q, cx + q, cz + q], y1 - 0.5, y1 - 0.03, 0, 0, 0, 0, { noBottom: true, noTop: true }));
    col.rect([cx - a0 + ins / 2, cz - a0 + ins / 2, cx + a0 - ins / 2, cz + a0 - ins / 2], y0, y1); col.floor([cx - a0 + ins, cz - a0 + ins, cx + a0 - ins, cz + a0 - ins], y1);
  }
  // the stair on the west, its balustrades steepening into a dado at the top
  const sw = (el.stairW ?? 8) / 2, run = H * 1.0, sx1 = cx - t, sx0 = sx1 - run;
  treads(bag, col, [sx0, cz - sw, sx1 + 0.5, cz + sw], 0, H, 'e', W);
  const k = new Kit();
  for (const s of [-1, 1]) {
    const z0 = cz + s * sw, z1 = z0 + s * 1.0, [za, zb] = s > 0 ? [z0, z1] : [z1, z0], xd = sx1 - 2.4;
    k.hex(W, [[sx0, -0.1, za], [sx0, -0.1, zb], [xd, -0.1, zb], [xd, -0.1, za], [sx0, 0.5, za], [sx0, 0.5, zb], [xd, (xd - sx0) / run * H + 0.5, zb], [xd, (xd - sx0) / run * H + 0.5, za]]);
    k.bx(R, xd, sx1 + 0.3, 0, H + 1.4, za, zb);
    col.segment([sx0, (za + zb) / 2], [sx1, (za + zb) / 2], 1, 0, H + 1.4);
  }
  k.emit(bag, 0, 0, 0, 0, 1);
  // the shrine
  const y = H, sw2 = t * 0.7, sh = 4.2, x0 = cx - sw2 + 0.6, x1 = cx + sw2, z0 = cz - sw2, z1 = cz + sw2;
  shrineChamber({ bag, col }, [x0, z0, x1, z1], y, sh, 'w', 'tezcatlipoca', R);
  bag.add(W, box(x0 - 0.35, y + sh, z0 - 0.35, x1 + 0.35, y + sh + 0.35, z1 + 0.35));
  bag.add(BK, box(x0 - 0.15, y + sh + 0.35, z0 - 0.15, x1 + 0.15, y + sh + 2.6, z1 + 0.15));
  const star = carved('tez-star', (kk) => { kk.disc(W, 0, 0, 0, 0.16, 0.05, 10); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; strip(kk, W, [Math.cos(a) * 0.12, Math.sin(a) * 0.12], [Math.cos(a) * 0.3, Math.sin(a) * 0.3], 0.05, 0, 0.05, 0.01); } });
  for (const yy of [y + sh + 0.95, y + sh + 1.95]) {
    for (let x = x0 + 0.6 + (yy > y + sh + 1 ? 0.5 : 0); x < x1 - 0.4; x += 1.0) { star.emit(bag, x, yy, z0 - 0.15, 0, -1); star.emit(bag, x, yy, z1 + 0.15, 0, 1); }
    for (let z = z0 + 0.6 + (yy > y + sh + 1 ? 0.5 : 0); z < z1 - 0.4; z += 1.0) { star.emit(bag, x0 - 0.15, yy, z, -1, 0); star.emit(bag, x1 + 0.15, yy, z, 1, 0); }
  }
  bag.add(W, box(x0 - 0.3, y + sh + 2.6, z0 - 0.3, x1 + 0.3, y + sh + 2.9, z1 + 0.3));
  for (let x = x0 + 0.4; x < x1 - 0.2; x += 1.2) for (const zz of [z0 + 0.15, z1 - 0.15]) bag.add(W, box(x - 0.3, y + sh + 2.9, zz - 0.18, x + 0.3, y + sh + 3.8, zz + 0.18));
  for (let z = z0 + 1.0; z < z1 - 0.6; z += 1.2) for (const xx of [x0 + 0.15, x1 - 0.15]) bag.add(W, box(xx - 0.18, y + sh + 2.9, z - 0.3, xx + 0.18, y + sh + 3.8, z + 0.3));
  for (const s of [-1, 1]) bag.add(BS, lathe([[0.6, 0], [0.8, 0.7], [0.55, 0.85], [0.001, 0.85]], 12, null, x0 - 1.4, y, cz + s * 2.4));
}

/** causeway_stakes { a, b, y0, y1 }: the stakes driven along a causeway's edge to hold its fill, a→b (axis-aligned), one every 0.6 m. */
export function causewayStakes(el, { bag }) {
  const [a, b] = [el.a, el.b], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 0.6), r = rng(el.seed || 5);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, top = el.y1 + (r() - 0.5) * 0.15;
    bag.add(i % 4 ? 'timber' : 'wood_dark', lathe([[0.1, 0], [0.1, top - el.y0], [0.06, top - el.y0 + 0.06], [0.001, top - el.y0 + 0.06]], 6, null, x, el.y0, z));
  }
}
