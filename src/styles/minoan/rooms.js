// Minoan rooms and their things (docs/settlements/knossos.md §4c): the Procession Fresco on the walls of the
// south passage (Evans set copies of it in the South Propylaeum: men carrying precious vases, the Cupbearer with
// his silver rhyton); the Throne Room's antechamber with its wooden throne and benches; the Queen's Megaron's
// bathroom behind its low partition and column, the painted clay bath, the dancing lady on the wall; a potter's
// yard by the Royal Road with the wheel, the cross-draught kiln and the pots set out to dry.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { ell, cap, poly } from '../greek/sculpture.js';
import { FRESCO, minoanColumn as column, minoanFresco as fresco } from './index.js';

const G = 'gypsum_minoan', P = 'plaster_ochre', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const shift = (pts, dx, dy, s = 1) => pts.map(([u, v]) => [dx + u * s, dy + v * s]);

// ── the Procession Fresco ────────────────────────────────────────────────────────────────────
/**
 * One bearer in profile, walking toward +u, his feet at (dx, dy), s the scale (1: 1.75 m): red-skinned, the waist
 * drawn in tight by the belt, the kilt to mid-thigh, the long black hair down the back; in his hands the vessel he
 * brings — the conical rhyton held upright (silver), a jar held before the chest, or a pitcher held out.
 */
function bearer(out, dx, dy, s, kind, rand) {
  const A = (mat, pts, f = 1) => out[mat].push([shift(pts, dx, dy, s), f]);
  const stride = 0.12 + rand() * 0.05;
  // the legs and feet: the far leg back, the near forward
  A(RED, cap([-0.02, 0.86], [-stride, 0.07], 0.085, 0.042), 0.6); A(RED, poly([-stride - 0.05, 0], [-stride + 0.11, 0], [-stride + 0.06, 0.06], [-stride - 0.04, 0.08]), 0.6);
  A(RED, cap([0.03, 0.86], [stride + 0.02, 0.07], 0.09, 0.044), 0.8); A(RED, poly([stride - 0.02, 0], [stride + 0.17, 0], [stride + 0.14, 0.05], [stride - 0.01, 0.08]), 0.8);
  // the kilt, its patterned hem, the belt (silver) that pinches the waist
  const kilt = rand() < 0.5 ? 'paint_white' : 'paint_ochre';
  A(kilt, poly([-0.15, 0.7], [0.21, 0.66], [0.14, 0.99], [-0.14, 0.99]), 1.25);
  A('egyptian_blue', poly([-0.15, 0.645], [0.215, 0.605], [0.21, 0.665], [-0.15, 0.705]), 1.5);
  A(RED, poly([-0.15, 0.645], [0.215, 0.605], [0.216, 0.62], [-0.15, 0.66]), 1.75);
  A('silver', poly([-0.13, 0.98], [0.12, 0.98], [0.115, 1.05], [-0.125, 1.05]), 1.5);
  // the torso broadening from the waist to the shoulders, the neck, the head; the eye, the hair
  A(RED, poly([-0.11, 1.04], [0.1, 1.04], [0.17, 1.34], [0.06, 1.43], [-0.13, 1.42], [-0.15, 1.3]), 1);
  A(RED, cap([0.0, 1.4], [0.03, 1.5], 0.05, 0.045), 1);
  A(RED, ell(0.045, 1.575, 0.08, 0.095, 12), 1);
  A(RED, poly([0.11, 1.535], [0.15, 1.545], [0.115, 1.6]), 1);
  A(BLK, ell(0.085, 1.59, 0.017, 0.009, 6), 1.25);
  A(BLK, ell(0.015, 1.64, 0.085, 0.05, 10), 1.25);
  for (const [a, b] of [[[-0.03, 1.62], [-0.1, 1.28]], [[0.0, 1.6], [-0.06, 1.22]]]) A(BLK, cap(a, b, 0.045, 0.025), 1.25);
  // the arms reaching forward to the vessel
  const hy = kind === 'pitcher' ? 1.12 : 1.22, hx = kind === 'pitcher' ? 0.33 : 0.25;
  A(RED, cap([0.03, 1.37], [0.12, 1.15], 0.045, 0.035), 0.6); A(RED, cap([0.12, 1.15], [hx, hy], 0.035, 0.028), 0.6);
  if (kind === 'rhyton') {
    // the conical rhyton, point down, held upright before the face with both hands; its bands in gold
    A('silver', poly([hx - 0.02, hy - 0.26], [hx + 0.06, hy + 0.3], [hx - 0.1, hy + 0.3]), 1.5);
    for (const f of [0.35, 0.7]) { const v = hy - 0.26 + f * 0.56, h0 = 0.04 + f * 0.07; A('gold', poly([hx - 0.02 - h0, v], [hx - 0.02 + h0 * 0.95, v], [hx - 0.02 + h0, v + 0.025], [hx - 0.02 - h0 * 1.05, v + 0.025]), 1.65); }
  } else if (kind === 'jar') {
    // a jar held before the chest, its neck and two handles; painted with a band of spirals (the dark band)
    A('paint_ochre', ell(hx + 0.08, hy + 0.04, 0.13, 0.16, 12), 1.5);
    A('paint_ochre', poly([hx + 0.03, hy + 0.17], [hx + 0.13, hy + 0.17], [hx + 0.12, hy + 0.26], [hx + 0.04, hy + 0.26]), 1.5);
    A(BLK, poly([hx - 0.045, hy + 0.0], [hx + 0.205, hy + 0.0], [hx + 0.2, hy + 0.05], [hx - 0.04, hy + 0.05]), 1.65);
  } else {
    // a beaked pitcher held out by its handle
    A('silver', ell(hx + 0.05, hy - 0.05, 0.08, 0.11, 10), 1.5);
    A('silver', poly([hx + 0.04, hy + 0.04], [hx + 0.17, hy + 0.17], [hx + 0.02, hy + 0.12]), 1.5);
  }
  // the near arm, over the body and the vessel
  A(RED, cap([0.05, 1.35], [0.16, 1.13], 0.05, 0.038), 1.85); A(RED, cap([0.16, 1.13], [hx + 0.02, hy - 0.02], 0.038, 0.03), 1.85);
}
/** A woman of the procession: white-skinned, the open bodice, the flounced skirt to the ground in bands of colour. */
function lady(out, dx, dy, s, rand) {
  const A = (mat, pts, f = 1) => out[mat].push([shift(pts, dx, dy, s), f]);
  const F = ['egyptian_blue', RED, 'egyptian_blue', BLK];
  A('paint_ochre', poly([-0.2, 0], [0.24, 0], [0.13, 0.98], [-0.12, 0.98]), 1);
  for (let k = 0; k < 4; k++) { const v0 = 0.08 + k * 0.22, w0 = 0.2 - k * 0.02, w1 = 0.24 - k * 0.028; A(F[(k + Math.floor(rand() * 4)) % 4], poly([-w0 - 0.005, v0], [w1 + 0.005, v0], [w1 - 0.01, v0 + 0.09], [-w0 + 0.005, v0 + 0.09]), 1.25); }
  A(RED, poly([-0.12, 0.98], [0.13, 0.98], [0.12, 1.06], [-0.12, 1.06]), 1.25);
  A('plaster_white', poly([-0.1, 1.04], [0.09, 1.04], [0.15, 1.32], [0.05, 1.42], [-0.12, 1.41], [-0.13, 1.3]), 1);
  A('egyptian_blue', poly([-0.1, 1.05], [-0.02, 1.05], [-0.04, 1.4], [-0.12, 1.4], [-0.13, 1.3]), 1.25);
  A('plaster_white', cap([0.0, 1.39], [0.03, 1.5], 0.045, 0.04), 1);
  A('plaster_white', ell(0.045, 1.57, 0.075, 0.09, 12), 1);
  A(BLK, ell(0.083, 1.585, 0.016, 0.009, 6), 1.25);
  A(BLK, ell(0.01, 1.63, 0.085, 0.055, 10), 1.25);
  for (const [a, b] of [[[-0.04, 1.62], [-0.12, 1.2]], [[-0.01, 1.6], [-0.07, 1.25]]]) A(BLK, cap(a, b, 0.045, 0.022), 1.25);
  A('plaster_white', cap([0.04, 1.36], [0.14, 1.16], 0.04, 0.03), 1.85); A('plaster_white', cap([0.14, 1.16], [0.26, 1.28], 0.03, 0.025), 1.85);
  A('silver', poly([0.23, 1.26], [0.34, 1.26], [0.31, 1.36], [0.26, 1.36]), 1.6);
}
/**
 * procession: the bearers walking toward +u over a white ground, under a blue sky-band whose lower edge waves; red
 * and black stripes frame it top and bottom. About one figure every 1.2 m, every fifth a woman; nearly life-size.
 */
FRESCO.procession = (w, h) => {
  const out = { [RED]: [], [BLK]: [], paint_white: [], paint_ochre: [], 'egyptian_blue': [], silver: [], gold: [], plaster_white: [] }, rand = rng(Math.round(w * 100));
  const b = 0.07;
  for (const [v0, v1, m] of [[0, b, RED], [b, b + 0.035, BLK], [h - b - 0.035, h - b, BLK], [h - b, h, RED]]) out[m].push([poly([-w / 2, v0], [w / 2, v0], [w / 2, v1], [-w / 2, v1]), 0.4]);
  // the sky band, its lower edge in a slow wave, in convex strips
  const n = Math.ceil(w / 0.3), top = h - b - 0.035, low = (u) => h * 0.62 + Math.sin(u * 2.1) * 0.12;
  for (let i = 0; i < n; i++) { const u0 = -w / 2 + i * w / n, u1 = u0 + w / n; out['egyptian_blue'].push([poly([u0, low(u0)], [u1, low(u1)], [u1, top], [u0, top]), 0.3]); }
  const s = Math.min(1, (h - 0.25) / 1.8), m = Math.max(1, Math.floor((w - 0.6) / 1.2));
  for (let i = 0; i < m; i++) {
    const u = -w / 2 + 0.55 + (i + 0.5) * (w - 1.1) / m + (rand() - 0.5) * 0.15;
    if (i % 5 === 3) lady(out, u, b + 0.05, s, rand);
    else bearer(out, u, b + 0.05, s, i % 5 === 1 ? 'rhyton' : rand() < 0.55 ? 'jar' : i % 2 ? 'rhyton' : 'pitcher', rand);
  }
  return Object.entries(out).map(([mat, parts]) => ({ mat, parts }));
};
/**
 * The dancing lady (the Queen's Megaron): a woman turning in the dance, her hair flying out behind her, one arm
 * raised; the open bodice, the flounced skirt swinging; on a pale ground with a wavy border below.
 */
FRESCO.dancer = (w, h) => {
  const out = { plaster_white: [], [BLK]: [], 'egyptian_blue': [], [RED]: [], paint_ochre: [] };
  const A = (mat, pts, f = 1) => out[mat].push([pts, f]);
  for (let i = 0; i < 10; i++) { const u0 = -w / 2 + i * w / 10; A('egyptian_blue', poly([u0, 0], [u0 + w / 10, 0], [u0 + w / 10, 0.09 + (i % 2) * 0.05], [u0, 0.14 - (i % 2) * 0.05]), 0.5); }
  const s = Math.min(1.2, (h - 0.2) / 1.25), dy = 0.18, F = (pts) => shift(pts, 0, dy, s);
  A(RED, F(poly([-0.24, 0], [0.26, 0.04], [0.14, 0.62], [-0.12, 0.6])), 1);
  for (let k = 0; k < 3; k++) A(k % 2 ? 'paint_ochre' : 'egyptian_blue', F(poly([-0.23 + k * 0.04, 0.05 + k * 0.18], [0.25 - k * 0.04, 0.09 + k * 0.18], [0.24 - k * 0.04, 0.15 + k * 0.18], [-0.22 + k * 0.04, 0.11 + k * 0.18])), 1.08);
  A('plaster_white', F(poly([-0.1, 0.6], [0.11, 0.62], [0.15, 0.9], [0.06, 0.98], [-0.11, 0.96], [-0.13, 0.86])), 1);
  A('egyptian_blue', F(poly([-0.1, 0.62], [-0.02, 0.62], [-0.03, 0.95], [-0.11, 0.95], [-0.13, 0.86])), 1.1);
  A('plaster_white', F(ell(0.03, 1.08, 0.075, 0.09, 12)), 1);
  A(BLK, F(ell(0.066, 1.095, 0.015, 0.009, 6)), 1.1);
  // the hair flying behind in long locks
  A(BLK, F(ell(-0.01, 1.14, 0.085, 0.05, 10)), 1.12);
  for (const [a, b2, r] of [[[-0.05, 1.13], [-0.38, 1.02], 0.035], [[-0.05, 1.1], [-0.34, 0.9], 0.03], [[-0.04, 1.16], [-0.36, 1.18], 0.028]]) A(BLK, F(cap(a, b2, r, 0.012)), 1.12);
  // the arms: one raised before the face, one held out low behind
  A('plaster_white', F(cap([0.05, 0.93], [0.2, 1.05], 0.035, 0.028)), 1.3); A('plaster_white', F(cap([0.2, 1.05], [0.22, 1.24], 0.028, 0.022)), 1.3);
  A('plaster_white', F(cap([-0.08, 0.92], [-0.22, 0.76], 0.035, 0.028)), 1.3); A('plaster_white', F(cap([-0.22, 0.76], [-0.36, 0.72], 0.028, 0.022)), 1.3);
  return Object.entries(out).map(([mat, parts]) => ({ mat, parts }));
};

/** procession_walls: the fresco along one wall face { at, face, y0, w, h, flip } over a gypsum dado. */
function processionWall(el, ctx) {
  fresco({ kind: 'procession', bg: 'plaster_white', d: 0.02, ...el }, ctx);
}

// ── the antechamber of the Throne Room ───────────────────────────────────────────────────────
/** antechamber: { rect, y, throne: [x, z] (against the north wall) } — the wooden throne (the copy of the gypsum one), the gypsum benches along the north and south walls. */
function antechamber(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, [tx, tz] = el.throne;
  // the throne of wood: the pedestal, the seat, the tall back with its wavy crest
  bag.add('wood_dark', box(tx - 0.33, y, tz + 0.1, tx + 0.33, y + 0.42, tz + 0.6));
  bag.add('wood_dark', box(tx - 0.36, y + 0.42, tz + 0.1, tx + 0.36, y + 0.5, tz + 0.64));
  bag.add('wood_dark', box(tx - 0.3, y + 0.5, tz + 0.02, tx + 0.3, y + 1.3, tz + 0.12));
  bag.add('wood_dark', lathe([[0.001, 0], [0.3, 0], [0.3, 0.1], [0.001, 0.1]], 14).rotateX(Math.PI / 2).scale(1, 1.35, 1).translate(tx, y + 1.3, tz + 0.12));
  col.rect([tx - 0.36, tz, tx + 0.36, tz + 0.64], y, y + 1.4);
  // the benches (gypsum, the Evans "alabaster" benches), on the north wall either side of the throne and along the south wall
  const bench = (r) => { bag.add(G, box(r[0], y, r[1], r[2], y + 0.4, r[3])); bag.add(G, box(r[0] - 0.02, y + 0.4, r[1] - 0.02, r[2] + 0.02, y + 0.46, r[3] + 0.03)); col.rect(r, y, y + 0.46); };
  bench([x0 + 0.05, z0, tx - 0.45, z0 + 0.45]); bench([tx + 0.45, z0, x1 - 0.6, z0 + 0.45]);
  bench([x0 + 0.05, z1 - 0.45, x1 - 0.6, z1]);
  // the red walls above the benches, with a dark band at the foot (as in the Throne Room)
  bag.add('wall_red', box(x0 + 0.05, y + 0.46, z0 + 0.004, x1 - 0.6, y + 2.6, z0 + 0.02));
  bag.add('wall_red', box(x0 + 0.05, y + 0.46, z1 - 0.02, x1 - 0.6, y + 2.6, z1 - 0.004));
}

// ── the Queen's Megaron ──────────────────────────────────────────────────────────────────────
/**
 * queens_bath: { rect (the bathroom, its west side open), y, partition: 'n' (the low wall on the room side) } — the
 * low partition wall with its column carrying the beam to the ceiling, the painted clay bath, a lamp on its stand.
 */
function queensBath(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.h ?? 3.6;
  // the partition on the north: gypsum-faced, a little over a metre high, a column at its open end, a beam over all
  bag.add(G, box(x0 + 0.5, y, z0, x1, y + 1.1, z0 + 0.28)); col.rect([x0 + 0.5, z0, x1, z0 + 0.28], y, y + 1.1);
  bag.add('plaster_white', box(x0 + 0.48, y + 1.1, z0 - 0.02, x1, y + 1.16, z0 + 0.3));
  column(bag, col, x0 + 0.25, z0 + 0.14, y, H - 0.55, 0.17);
  bag.add('timber', box(x0, y + H - 0.3, z0 - 0.02, x1, y + H, z0 + 0.3));
  // the bath: a clay tub with a rolled rim, rounded at the ends, handles at its sides; a band of red paint under the rim
  const bx = (x0 + x1) / 2 + 0.2, bz = (z0 + z1) / 2 + 0.25, L = 1.5, W = 0.72;
  const tub = lathe([[0.001, 0], [0.4, 0], [0.47, 0.42], [0.5, 0.5], [0.49, 0.54], [0.455, 0.54], [0.43, 0.45], [0.37, 0.08], [0.001, 0.08]], 24);
  bag.add('terracotta', tub.scale(L, 1, W).translate(bx, y, bz));
  bag.add(RED, lathe([[0.473, 0.34], [0.487, 0.34], [0.493, 0.46], [0.479, 0.46]], 24).scale(L, 1, W).translate(bx, y, bz));
  for (const s of [-1, 1]) bag.add('terracotta', box(bx - 0.14, y + 0.34, bz + s * W * 0.5 - 0.03, bx + 0.14, y + 0.4, bz + s * (W * 0.5 + 0.05)));
  col.rect([bx - L * 0.5, bz - W * 0.5, bx + L * 0.5, bz + W * 0.5], y, y + 0.54);
  // a lamp of stone on its tall foot, by the partition, burning
  const lx = x1 - 0.35, lz = z0 + 0.6;
  bag.add('serpentine', lathe([[0.001, 0], [0.13, 0], [0.13, 0.04], [0.05, 0.1], [0.04, 0.75], [0.12, 0.85], [0.13, 0.92], [0.11, 0.93], [0.06, 0.88], [0.001, 0.88]], 14, null, lx, y, lz));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.05]], 6, null, lx + 0.07, y + 0.92, lz));
  lights.push({ at: [lx, y + 1.05, lz], color: '#ffb46b', intensity: 2.5, distance: 6 });
}

/** megaron_bench: a gypsum bench along a wall { rect, y }. */
function megaronBench(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  bag.add(G, box(x0, y, z0, x1, y + 0.4, z1)); bag.add(G, box(x0 - 0.02, y + 0.4, z0 - 0.02, x1 + 0.02, y + 0.46, z1 + 0.02)); col.rect(el.rect, y, y + 0.46);
}

// ── the potter's yard ────────────────────────────────────────────────────────────────────────
/**
 * potter_yard: { rect, y, seed } — a yard by the road: a rubble wall round three sides; the cross-draught kiln (its
 * firing chamber of stone and clay, a low vault, the stoke-hole at one end and the flue at the other, the channels
 * under its floor); the wheel (a clay wheel-head on its pivot stone) with the potter's low stool and a heap of clay;
 * the boards of pots set out to dry: conical cups by the dozen, jugs and jars; a water jar.
 */
function potterYard(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 7);
  // the yard's wall on the north, east and west (the south open to the road), rubble with a clay coping
  for (const r of [[x0, z0, x1, z0 + 0.5], [x0, z0 + 0.5, x0 + 0.5, z1], [x1 - 0.5, z0 + 0.5, x1, z1]]) {
    bag.add('rubble', box(r[0], y - 0.3, r[1], r[2], y + 1.3, r[3])); bag.add('mud_plaster', box(r[0] - 0.02, y + 1.3, r[1] - 0.02, r[2] + 0.02, y + 1.38, r[3] + 0.02)); col.rect(r, y - 0.3, y + 1.38);
  }
  bag.add('earth_wall', box(x0 + 0.5, y - 0.3, z0 + 0.5, x1 - 0.5, y + 0.02, z1));
  col.floor([x0 + 0.5, z0 + 0.5, x1 - 0.5, z1], y + 0.02);
  // the kiln against the west wall: the chamber 2.6 × 1.6 m, its walls 0.4 thick, the vault over it, the stoke-hole facing the yard
  const kx0 = x0 + 0.6, kz0 = z0 + 0.7, kx1 = kx0 + 1.7, kz1 = kz0 + 2.6, kh = 1.05;
  bag.add('rubble', box(kx0, y - 0.3, kz0, kx1, y + kh, kz1));
  const vault = lathe([[0.001, 0], [0.85, 0], [0.84, 0.18], [0.72, 0.45], [0.48, 0.62], [0.001, 0.68]], 16);
  bag.add('mud_plaster', vault.scale(1, 1, 1.53).translate((kx0 + kx1) / 2, y + kh - 0.02, (kz0 + kz1) / 2));
  // the stoke-hole on the yard side at the south end, blackened, the ash before it; the flue at the north end
  bag.add('opening', box(kx1 - 0.002, y + 0.12, kz1 - 0.9, kx1 + 0.012, y + 0.72, kz1 - 0.35));
  bag.add('lacquer_black', box(kx1 + 0.004, y + 0.72, kz1 - 1.0, kx1 + 0.014, y + 1.1, kz1 - 0.25));
  bag.add('pottery_dark', box(kx1, y + 0.0, kz1 - 1.0, kx1 + 0.7, y + 0.05, kz1 - 0.25));
  bag.add('mud_plaster', lathe([[0.18, 0], [0.16, 0.45], [0.12, 0.5], [0.001, 0.5]], 10, null, (kx0 + kx1) / 2, y + kh + 0.5, kz0 + 0.45));
  bag.add('lacquer_black', lathe([[0.001, 0], [0.11, 0], [0.11, 0.01], [0.001, 0.01]], 10, null, (kx0 + kx1) / 2, y + kh + 1.0, kz0 + 0.45));
  col.rect([kx0, kz0, kx1, kz1], y - 0.3, y + kh + 0.7);
  lights.push({ at: [kx1 + 0.3, y + 0.4, kz1 - 0.6], color: '#ff8a3a', intensity: 3, distance: 5 });
  // the wheel: the pivot stone, the clay wheel-head with a pot on it, the stool before it, the heap of clay
  const wx = (kx1 + x1) / 2 + 0.3, wz = z0 + 1.6;
  bag.add('limestone', lathe([[0.001, 0], [0.22, 0], [0.2, 0.18], [0.06, 0.2], [0.001, 0.2]], 12, null, wx, y, wz));
  bag.add('terracotta', lathe([[0.001, 0], [0.3, 0], [0.31, 0.03], [0.29, 0.06], [0.001, 0.06]], 20, null, wx, y + 0.2, wz));
  bag.add('terracotta', lathe([[0.001, 0], [0.06, 0], [0.09, 0.07], [0.08, 0.12], [0.065, 0.13], [0.001, 0.13]], 12, null, wx, y + 0.26, wz));
  bag.add('wood_dark', box(wx - 0.18, y, wz + 0.45, wx + 0.18, y + 0.24, wz + 0.75));
  bag.add('mud_plaster', lathe([[0.001, 0], [0.4, 0], [0.32, 0.18], [0.12, 0.3], [0.001, 0.32]], 10, null, wx + 0.9, y, wz - 0.1));
  bag.add('water', lathe([[0.001, 0], [0.16, 0], [0.001, 0.001]], 10, null, wx - 0.6, y + 0.3, wz));
  bag.add('terracotta', lathe([[0.12, 0], [0.2, 0.15], [0.19, 0.3], [0.17, 0.31], [0.001, 0.31]], 12, null, wx - 0.6, y, wz).translate(0, -0.01, 0));
  col.circle(wx, wz, 0.32, y, y + 0.4);
  // the drying boards on trestles along the east wall: rows of conical cups, jugs and jars
  const cup = lathe([[0.001, 0], [0.025, 0], [0.045, 0.06], [0.04, 0.06], [0.02, 0.008], [0.001, 0.008]], 8);
  const jug = lathe([[0.04, 0], [0.08, 0.06], [0.085, 0.13], [0.05, 0.2], [0.035, 0.26], [0.045, 0.28], [0.001, 0.28]], 10);
  for (let k = 0; k < 2; k++) {
    const bx0 = x1 - 1.3, bz0 = z0 + 0.9 + k * 1.6, bz1 = bz0 + 1.3, by = y + 0.7 - k * 0.0;
    bag.add('timber', box(bx0, by, bz0, bx0 + 0.55, by + 0.04, bz1));
    for (const zz of [bz0 + 0.1, bz1 - 0.1]) for (const xx of [bx0 + 0.06, bx0 + 0.49]) bag.add('timber', box(xx - 0.03, y, zz - 0.03, xx + 0.03, by, zz + 0.03));
    col.rect([bx0, bz0, bx0 + 0.55, bz1], y, by + 0.04);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 9; j++) {
      if (k === 1 && j % 3 === 2) { if (i % 2 === 0) bag.add('terracotta', jug.clone().translate(bx0 + 0.12 + i * 0.11, by + 0.04, bz0 + 0.1 + j * 0.135)); continue; }
      bag.add('terracotta', cup.clone().translate(bx0 + 0.08 + i * 0.13, by + 0.04, bz0 + 0.08 + j * 0.14));
    }
  }
  // finished jars and a pithos waiting by the wall
  for (let i = 0; i < 3; i++) bag.add('terracotta', lathe([[0.08, 0], [0.18, 0.12], [0.22, 0.3], [0.16, 0.48], [0.09, 0.54], [0.1, 0.58], [0.001, 0.58]], 12, null, x0 + 2.8 + i * 0.5, y, z0 + 0.85 + rand() * 0.1));
}

Object.assign(STYLES.minoan.elements, { procession_wall: processionWall, antechamber, queens_bath: queensBath, megaron_bench: megaronBench, potter_yard: potterYard });
