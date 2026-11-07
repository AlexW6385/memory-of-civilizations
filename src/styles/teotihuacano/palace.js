// Teotihuacan's palaces and plaza furniture (docs/settlements/teotihuacan.md §11): the Palace of
// Quetzalpapalotl at the Moon Plaza's south-west — its patio ringed by porticoes on carved pillars
// (the bird with obsidian eyes), painted lintels, stepped-fret walls and the year-sign merlons, the
// white-pillared vestibule — the Jaguars' patio with its murals of plumed jaguars blowing conches;
// the altars and theatre censers of the avenue's plazas; the "Teotihuacan Cross" and the Great
// Goddess of the Moon Plaza; the people about them.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import { carved, Kit } from '../maya/meso.js';
import '../../objects/index.js';
import { ttStair, tablero, ttPyramid, teoSerpent } from './index.js';
import { soot } from '../maya/household.js';

const RD = 'stucco_red', RF = 'limewash_red', WH = 'stucco_pale', PL = 'plaster_white', STN = 'andesite', OB = 'paint_minoan_black', GR = 'stucco_leaf';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FACE = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

/** A flat piece in a carving's frame (x across, y up): a strip from 2D point a to b, half-widths w0 → w1, from z0 out to z1. */
function strip(k, mat, a, b, w0, z0, z1, w1 = w0) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const P = (p, w, z) => [p[0] + nx * w, p[1] + ny * w, z];
  return k.hex(mat, [P(a, w0, z0), P(b, w1, z0), P(b, -w1, z0), P(a, -w0, z0), P(a, w0, z1), P(b, w1, z1), P(b, -w1, z1), P(a, -w0, z1)]);
}

/**
 * A wall along an axis: `ax` 'x' (running along x, occupying z c0…c1) or 'z'; from a0 to a1 along it;
 * y0 to y1; doors [{ at, w, h }] cut through it with the wall carried over them.
 */
function wall(bag, col, mat, ax, c0, c1, a0, a1, y0, y1, doors = []) {
  const R = (u0, u1) => (ax === 'x' ? [u0, c0, u1, c1] : [c0, u0, c1, u1]);
  let u = a0;
  for (const d of [...doors].sort((p, q) => p.at - q.at)) {
    const d0 = d.at - d.w / 2, d1 = d.at + d.w / 2;
    if (d0 > u) { const r = R(u, d0); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); }
    const r = R(d0, d1); bag.add(mat, box(r[0], y0 + d.h, r[1], r[2], y1, r[3]));
    u = d1;
  }
  if (a1 > u) { const r = R(u, a1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); }
}
/** The runs of a wall face between its doors: [[u0, u1], …]. */
function runs(a0, a1, doors = [], m = 0) {
  const out = []; let u = a0;
  for (const d of [...doors].sort((p, q) => p.at - q.at)) { if (d.at - d.w / 2 - m > u + 0.1) out.push([u, d.at - d.w / 2 - m]); u = d.at + d.w / 2 + m; }
  if (a1 > u + 0.1) out.push([u, a1]);
  return out;
}
/** A painted band on a wall face: the face at c (perpendicular coordinate) looking toward `side` (±1), from a0 to a1, y0 to y1, standing `off` out of it. */
function band(bag, mat, ax, c, side, a0, a1, y0, y1, off = 0.02) {
  const [p, q] = side > 0 ? [c - off, c + off] : [c - off, c + off];          // as deep into the wall as it stands out (layers keep apart front and back)
  bag.add(mat, ax === 'x' ? box(a0, y0, p, a1, y1, q) : box(p, y0, a0, q, y1, a1));
}

// ---- the carved pieces ----------------------------------------------------------------------------------

/**
 * The relief of a pillar of the Palace of Quetzalpapalotl's patio (Uncovered History; endow.world):
 * a framed panel about 0.84 × 2.3 m, a zig-zag band at its top; the bird — the Teotihuacan owl or
 * the "quetzal-butterfly" — its head in profile with a feather crest over the eye and a headdress of
 * green quetzal plumes, its body a flower, its wings spread like a butterfly's, sitting on a throne
 * inlaid with three obsidian stones over three mirrors; round it four double circles that held
 * obsidian discs. Faces +z, from y 0.
 */
const birdPanel = () => carved('qpp-bird', (k) => {
  const d = 0.05, hw = 0.42;
  // the frame and the zig-zag band
  k.bx(STN, -hw, hw, 0, 0.07, 0, d); k.bx(STN, -hw, hw, 2.23, 2.3, 0, d); k.bx(STN, -hw, -hw + 0.07, 0.07, 2.23, 0, d); k.bx(STN, hw - 0.07, hw, 0.07, 2.23, 0, d);
  k.bx(STN, -hw + 0.07, hw - 0.07, 1.98, 2.02, 0, d * 0.7);
  for (let i = 0; i < 6; i++) { const x0 = -0.33 + i * 0.11, up = i % 2; strip(k, STN, [x0, up ? 2.04 : 2.18], [x0 + 0.11, up ? 2.18 : 2.04], 0.022, 0, d * 0.8); }
  // the double circles round the bird, each with its obsidian disc
  for (const [x, y] of [[0, 1.84], [0, 0.17], [-0.29, 1.12], [0.29, 1.12]]) { k.disc(STN, x, y, 0, 0.085, d * 0.8, 14, 0.055); k.disc(STN, x, y, 0, 0.04, d * 0.6, 10, 0.028); k.disc(OB, x, y, -0.02, 0.026, 0.032, 8); }
  // the wings, spread up and down from the body (butterfly wings)
  for (const sx of [-1, 1]) {
    strip(k, STN, [sx * 0.08, 1.2], [sx * 0.3, 1.5], 0.09, 0, d * 0.9, 0.05);
    strip(k, STN, [sx * 0.08, 1.05], [sx * 0.27, 0.82], 0.08, 0, d * 0.9, 0.045);
    for (let j = 0; j < 3; j++) strip(k, STN, [sx * (0.12 + j * 0.06), 1.27 + j * 0.07], [sx * (0.16 + j * 0.06), 1.36 + j * 0.07], 0.012, d * 0.9, d * 1.1);   // the wing's feathers
  }
  // the body: a flower
  k.petals(STN, 0, 1.12, 0, 0.13, d * 1.2, 8); k.disc(OB, 0, 1.12, d * 1.1, 0.04, 0.02, 8);
  // the head in profile, its beak to +x, the eye of obsidian, the crest over it and the quetzal headdress
  k.bx(STN, -0.11, 0.1, 1.42, 1.66, 0, d * 1.3);
  strip(k, STN, [0.09, 1.57], [0.2, 1.47], 0.045, 0, d * 1.2, 0.012);
  k.disc(STN, -0.01, 1.56, d * 1.3, 0.05, 0.015, 10, 0.03); k.disc(OB, -0.01, 1.56, 0.045, 0.03, 0.055, 8);
  for (let j = 0; j < 4; j++) strip(k, STN, [-0.05 + j * 0.04, 1.66], [-0.1 + j * 0.06, 1.76], 0.016, 0, d * 1.1);
  for (let j = 0; j < 5; j++) { const a = 2.0 + j * 0.28; strip(k, GR, [-0.02, 1.7], [-0.02 + Math.cos(a) * 0.26, 1.7 + Math.sin(a) * 0.2 + 0.08], 0.03, -0.02, 0.025, 0.012); }
  // the throne and its three obsidian stones, the three mirrors under it
  k.bx(STN, -0.22, 0.22, 0.52, 0.72, 0, d * 1.1);
  for (const x of [-0.13, 0, 0.13]) { k.disc(OB, x, 0.62, d * 1.1, 0.035, 0.015, 8); k.disc(STN, x, 0.36, 0, 0.065, d, 12, 0.045); k.disc('mirror_work', x, 0.36, -0.02, 0.045, 0.05, 10); }
});

/** A year-sign merlon (almena) of the palace's roof — the trapeze over the interlaced ray — about 0.9 × 1.15 m, facing +z. */
const yearMerlon = () => carved('qpp-almena', (k) => {
  const t = 0.07;
  k.bx(PL, -0.42, 0.42, 0, 0.16, -t, t);
  // the ray: an elongated diamond, red in a white rim
  k.hex(PL, [[-0.34, 0.33, -t], [0, 0.2, -t], [0.34, 0.33, -t], [0, 0.46, -t], [-0.34, 0.33, t], [0, 0.2, t], [0.34, 0.33, t], [0, 0.46, t]]);
  k.hex(RD, [[-0.24, 0.33, -t - 0.02], [0, 0.25, -t - 0.02], [0.24, 0.33, -t - 0.02], [0, 0.41, -t - 0.02], [-0.24, 0.33, t + 0.02], [0, 0.25, t + 0.02], [0.24, 0.33, t + 0.02], [0, 0.41, t + 0.02]]);
  k.bx(PL, -0.05, 0.05, 0.16, 0.24, -t, t);
  // the trapeze: two legs leaning in and the bar across their tops
  for (const sx of [-1, 1]) strip(k, PL, [sx * 0.38, 0.16], [sx * 0.2, 1.02], 0.07, -t, t);
  k.bx(PL, -0.27, 0.27, 0.98, 1.15, -t, t);
  k.hex(RD, [[-0.34, 0.16, -0.04], [0.34, 0.16, -0.04], [0.21, 1.0, -0.04], [-0.21, 1.0, -0.04], [-0.34, 0.16, 0.04], [0.34, 0.16, 0.04], [0.21, 1.0, 0.04], [-0.21, 1.0, 0.04]]);   // the red field inside the trapeze
});

/**
 * A plumed jaguar of the Jaguars' patio (endow.world; Uncovered History): in profile on a red ground in
 * an ochre border, a netted body, a headdress of quetzal feathers, holding to its mouth a plumed conch
 * trumpet from which drops fall; about 2.5 × 1.1 m, facing +z; `flip` turns it to walk the other way.
 */
const jaguarMural = (flip) => carved(`jaguar-mural-${flip ? 1 : 0}`, (k) => {
  const s = flip ? -1 : 1, X = (x) => s * x, P = ([x, y]) => [X(x), y];
  const J = 'stucco_ochre', NET = RF;
  // layers (z out of the wall): the red ground −0.02…0.01, the border and the figure 0…0.03, details over them
  k.bx(RD, -1.25, 1.25, 0, 1.1, -0.02, 0.01);
  k.bx('paint_ochre', -1.25, 1.25, 0, 0.08, 0, 0.03); k.bx('paint_ochre', -1.25, 1.25, 1.02, 1.1, 0, 0.03);
  k.bx('paint_ochre', -1.25, -1.17, 0.08, 1.02, 0, 0.03); k.bx('paint_ochre', 1.17, 1.25, 0.08, 1.02, 0, 0.03);
  // the body, the legs (one raised, its paw holding the conch), the tail curling up
  strip(k, J, P([-0.75, 0.48]), P([0.25, 0.52]), 0.16, 0, 0.03, 0.14);
  strip(k, J, P([-0.68, 0.38]), P([-0.72, 0.12]), 0.05, 0, 0.03, 0.04); strip(k, J, P([-0.5, 0.38]), P([-0.44, 0.12]), 0.05, 0, 0.03, 0.04);
  strip(k, J, P([0.12, 0.4]), P([0.18, 0.12]), 0.05, 0, 0.03, 0.04);
  strip(k, J, P([0.18, 0.56]), P([0.5, 0.6]), 0.05, 0, 0.03, 0.04);
  strip(k, J, P([-0.86, 0.5]), P([-1.02, 0.66]), 0.035, 0, 0.03, 0.025); strip(k, J, P([-1.02, 0.66]), P([-0.98, 0.84]), 0.025, 0, 0.03, 0.02);
  for (let i = 0; i < 5; i++) for (const dy of [-0.07, 0.07]) strip(k, NET, P([-0.7 + i * 0.2, 0.5 + dy - 0.06]), P([-0.6 + i * 0.2, 0.5 + dy + 0.06]), 0.01, 0.02, 0.045);   // the net over the body
  // the head, its open jaw at the conch's mouthpiece; the feathered headdress
  k.hex(J, [[X(0.24), 0.52, 0], [X(0.5), 0.62, 0], [X(0.48), 0.8, 0], [X(0.26), 0.84, 0], [X(0.24), 0.52, 0.03], [X(0.5), 0.62, 0.03], [X(0.48), 0.8, 0.03], [X(0.26), 0.84, 0.03]]);
  k.disc(OB, X(0.38), 0.75, 0.02, 0.025, 0.025, 8);
  for (let i = 0; i < 6; i++) { const a = 1.45 + s * (0.25 - i * 0.22); strip(k, GR, P([0.33, 0.84]), [X(0.33) + Math.cos(a) * 0.32, 0.84 + Math.sin(a) * 0.24], 0.035, 0.015, 0.05, 0.012); }
  // the conch trumpet, its feathers and the drops (speech or water) from its mouth
  strip(k, PL, P([0.5, 0.66]), P([0.95, 0.56]), 0.06, 0.015, 0.045, 0.13);
  for (let i = 0; i < 3; i++) k.disc(RD, X(0.62 + i * 0.1), 0.63 - i * 0.02, 0.03, 0.035, 0.03, 8);
  for (let i = 0; i < 3; i++) strip(k, GR, P([0.7 + i * 0.1, 0.68]), P([0.66 + i * 0.12, 0.86]), 0.022, 0.03, 0.065, 0.01);
  for (let i = 0; i < 4; i++) k.disc('maya_blue', X(1.0 + (i % 2) * 0.06), 0.46 - i * 0.09, 0, 0.03, 0.03, 8);
});

/** The jaguar at the foot of the Jaguars' stair: a block, its top third the eyes, the middle the upper jaw, the bottom the lower jaw. Faces +z. */
const jaguarHead = () => carved('jaguar-head', (k) => {
  k.bx(STN, -0.45, 0.45, 0, 0.32, -0.4, 0.3);                                                          // the lower jaw
  k.bx(STN, -0.48, 0.48, 0.32, 0.72, -0.4, 0.36);                                                      // the upper jaw
  k.bx(STN, -0.46, 0.46, 0.72, 1.05, -0.4, 0.28);                                                      // the brow and the eyes
  for (const sx of [-1, 1]) { k.disc(STN, sx * 0.22, 0.88, 0.28, 0.13, 0.05, 12, 0.07); k.disc(OB, sx * 0.22, 0.88, 0.26, 0.07, 0.04, 10); k.fy(PL, [sx * 0.3 - 0.05, sx * 0.3 + 0.05, 0.3, 0.38], [sx * 0.3 - 0.01, sx * 0.3 + 0.01, 0.33, 0.35], 0.34, 0.18); }
  for (let i = 0; i < 5; i++) { const x = -0.24 + i * 0.12; k.fy(PL, [x - 0.04, x + 0.04, 0.3, 0.38], [x - 0.01, x + 0.01, 0.33, 0.35], 0.32, 0.24); }
});

/**
 * A theatre censer (incensario tipo teatro): the hourglass base and its lid with the chimney, the lid's
 * front a framed stage of clay plaques round a face mask, flanges of plaques and a crest of feathers;
 * about 0.75 m high, facing +z. [inferred: after the excavated censers of the city's ritual]
 */
export const theatreCenser = () => carved('tt-censer', (k) => {
  k.geo('terracotta', lathe([[0.16, 0], [0.12, 0.08], [0.09, 0.18], [0.15, 0.3], [0.2, 0.32], [0.001, 0.32]], 14));
  k.geo('terracotta', lathe([[0.19, 0.32], [0.16, 0.4], [0.08, 0.48], [0.001, 0.48]], 14));
  k.bx('terracotta', -0.05, 0.05, 0.42, 0.66, -0.05, 0.05);
  k.bx('paint_ochre', -0.24, 0.24, 0.3, 0.68, 0, 0.14);                                            // the frame, set into the lid
  k.bx(RD, -0.18, 0.18, 0.36, 0.62, 0.14, 0.16);
  k.bx(WH, -0.08, 0.08, 0.4, 0.56, 0.16, 0.21);                                                     // the mask
  for (const sx of [-1, 1]) { k.bx(OB, sx * 0.04 - 0.025, sx * 0.04 + 0.025, 0.49, 0.51, 0.2, 0.23); k.disc('clay_green', sx * 0.13, 0.48, 0.16, 0.03, 0.02, 8); k.bx('paint_ochre', sx > 0 ? 0.24 : -0.34, sx > 0 ? 0.34 : -0.24, 0.32, 0.6, 0.1, 0.13); }
  k.bx(RD, -0.04, 0.04, 0.43, 0.45, 0.2, 0.23);
  for (let i = 0; i < 7; i++) { const a = 0.45 + i * 0.37; strip(k, GR, [0, 0.66], [Math.cos(a) * 0.3, 0.66 + Math.sin(a) * 0.14 + 0.04], 0.025, 0.1, 0.12, 0.01); }
});

// ---- people ----------------------------------------------------------------------------------------------

/** A still figure (src/objects): `who` 'priest' (a feathered cap and a red cape over the loincloth), 'pilgrim', 'bearer' (a load on the head) or 'kneel'. */
function person(ctx, x, z, y, rot, who, seed) {
  const L = STYLES.life.elements, r = rng(seed);
  const base = { at: [x, z], y, rot, seed, dress: 'tunic', legs: 'bare', feet: 'bare', skin: r() < 0.5 ? 'skin_medium' : 'skin_dark', hair: 'long', hairMat: 'hide_black', beard: false };
  if (who === 'priest') L.figure({ ...base, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cape', hat: 'cap', hatMat: GR }, ctx);
  else if (who === 'kneel') L.figure({ ...base, pose: 'squat', cloth: r() < 0.5 ? 'cloth_white' : 'cloth_ochre', over: 'none' }, ctx);
  else if (who === 'bearer') L.figure({ ...base, cloth: 'cloth_white', carry: r() < 0.5 ? 'basket' : 'pot', over: 'none' }, ctx);
  else L.figure({ ...base, pose: r() < 0.5 ? 'talk' : 'stand', cloth: ['cloth_white', 'cloth_ochre', 'cloth_brown'][Math.floor(r() * 3)], over: r() < 0.5 ? 'cape' : 'none', cloth2: 'cloth_white' }, ctx);
}

// ---- the plazas ------------------------------------------------------------------------------------------

/**
 * tt_plaza_altars { c, y, seed, small }: the altar in a plaza of the avenue (the central altar of the
 * West Plaza, the temple base of Plaza C — cookjmex) — a square talud-tablero platform with a stair on
 * each side, two theatre censers and offerings on its top, a small altar at each of its corners —
 * and the people about it: a priest at the censers, others kneeling at the stairs' feet with their
 * offerings, bearers coming up the avenue. `small`: one low altar, its censer and two people.
 */
export function ttPlazaAltars(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 0, r = rng(el.seed || 1), f = y + 0.03;
  if (el.small) {
    bag.add(RD, frustum([cx - 1.6, cz - 1.6, cx + 1.6, cz + 1.6], f, f + 0.45, 0.15, 0.15, 0.15, 0.15, { noBottom: true, noTop: true }));
    tablero(bag, [cx - 1.45, cz - 1.45, cx + 1.45, cz + 1.45], f + 0.45, f + 0.95, { out: 0.1, discs: false });
    bag.add(WH, frustum([cx - 1.35, cz - 1.35, cx + 1.35, cz + 1.35], f + 0.85, f + 0.97, 0, 0, 0, 0, { noBottom: true }));
    col.rect([cx - 1.6, cz - 1.6, cx + 1.6, cz + 1.6], f, f + 0.97);
    theatreCenser().emit(bag, cx, f + 0.97, cz, 0, 1);
    person(ctx, cx - 0.8, cz + 2.6, f, 0, 'kneel', el.seed + 1);
    person(ctx, cx + 1.2, cz + 3.4, f, Math.PI + 0.3, 'pilgrim', el.seed + 2);
    return;
  }
  // the altar: 9 m square, 1.6 m, its stairs on the four sides
  const a = 4.5, H = 1.6, yt = f + H * 0.45;
  bag.add(RD, frustum([cx - a, cz - a, cx + a, cz + a], f, yt, 0.4, 0.4, 0.4, 0.4, { noBottom: true, noTop: true }));
  tablero(bag, [cx - a + 0.15, cz - a + 0.15, cx + a - 0.15, cz + a - 0.15], yt, f + H, { out: 0.16, discs: false });
  bag.add(WH, frustum([cx - a + 0.25, cz - a + 0.25, cx + a - 0.25, cz + a - 0.25], f + H - 0.1, f + H + 0.03, 0, 0, 0, 0, { noBottom: true }));
  col.rect([cx - a, cz - a, cx + a, cz + a], f, f + H); col.floor([cx - a + 0.1, cz - a + 0.1, cx + a - 0.1, cz + a - 0.1], f + H + 0.03);
  for (const [fx, fz] of Object.values(FACE)) {
    const run = 2.0, w = 1.4, d = { n: 's', s: 'n', e: 'w', w: 'e' }[fx ? (fx > 0 ? 'e' : 'w') : (fz > 0 ? 's' : 'n')];
    const rect = fx ? [fx > 0 ? cx + a - 0.3 : cx - a - run, cz - w, fx > 0 ? cx + a + run : cx - a + 0.3, cz + w] : [cx - w, fz > 0 ? cz + a - 0.3 : cz - a - run, cx + w, fz > 0 ? cz + a + run : cz - a + 0.3];
    ttStair({ rect, y0: f, y1: f + H + 0.03, dir: d, mat: 'stucco_ochre' }, ctx);
  }
  // on the top: the two censers facing south, the offerings between them (flowers, a bowl, a bundle of plumes)
  const top = f + H + 0.03;
  for (const sx of [-1, 1]) theatreCenser().emit(bag, cx + sx * 1.6, top, cz - 1.2, 0, 1);
  bag.add('terracotta', lathe([[0.001, 0], [0.18, 0.02], [0.26, 0.12], [0.25, 0.14], [0.001, 0.05]], 12, null, cx, top, cz - 0.8));
  for (let i = 0; i < 7; i++) bag.add(i % 2 ? 'paint_ochre' : RD, lathe([[0.001, 0], [0.07, 0.02], [0.05, 0.07], [0.001, 0.08]], 8, null, cx - 0.6 + i * 0.2, top, cz + 0.2 + (i % 3) * 0.12));
  // the small altars at its corners
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = cx + sx * (a + 4), z = cz + sz * (a + 4);
    bag.add(RD, frustum([x - 0.9, z - 0.9, x + 0.9, z + 0.9], f, f + 0.35, 0.1, 0.1, 0.1, 0.1, { noBottom: true, noTop: true }));
    tablero(bag, [x - 0.8, z - 0.8, x + 0.8, z + 0.8], f + 0.35, f + 0.75, { out: 0.08, discs: false });
    bag.add(WH, frustum([x - 0.72, z - 0.72, x + 0.72, z + 0.72], f + 0.66, f + 0.77, 0, 0, 0, 0, { noBottom: true }));
    bag.add('terracotta', lathe([[0.001, 0], [0.16, 0.03], [0.2, 0.14], [0.001, 0.12]], 10, null, x, f + 0.77, z));
    col.rect([x - 0.9, z - 0.9, x + 0.9, z + 0.9], f, f + 0.77);
  }
  // the people: the priest at the censers, worshippers kneeling at the stairs, bearers and pilgrims about
  person(ctx, cx, cz - 0.1, top, 0, 'priest', el.seed + 10);
  person(ctx, cx + 0.6, cz + a + 3.2, f, 0, 'kneel', el.seed + 11);
  person(ctx, cx - 0.7, cz + a + 3.5, f, 0.2, 'kneel', el.seed + 12);
  person(ctx, cx - a - 3.0, cz + 0.5, f, -Math.PI / 2, 'kneel', el.seed + 13);
  for (let i = 0; i < 7; i++) {
    const x = cx + (r() < 0.5 ? -1 : 1) * (5 + r() * 11), z = cz + 12 + r() * 20, rot = (r() < 0.5 ? 0 : Math.PI) + (r() - 0.5) * 0.8;
    person(ctx, x, z, f, rot, i % 3 === 0 ? 'bearer' : 'pilgrim', el.seed + 20 + i);
    if (i % 2) person(ctx, x + 0.65, z + 0.2, f, Math.PI + (r() - 0.5), 'pilgrim', el.seed + 40 + i);
  }
}

/**
 * tt_cross_altar { c, y, s }: the Moon Plaza's structure with internal divisions — "four rectangular and
 * diagonal bodies that formed what is known as the Teotihuacan Cross" (Wikipedia): a square platform
 * s across, on it four long bodies set along its diagonals, leaving a cross of open ground between them.
 */
export function ttCrossAltar(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, a = el.s / 2, H = 1.1, yt = y + H * 0.45;
  bag.add(RD, frustum([cx - a, cz - a, cx + a, cz + a], y, yt, 0.35, 0.35, 0.35, 0.35, { noBottom: true, noTop: true }));
  tablero(bag, [cx - a + 0.1, cz - a + 0.1, cx + a - 0.1, cz + a - 0.1], yt, y + H, { out: 0.14 });
  bag.add(WH, frustum([cx - a + 0.2, cz - a + 0.2, cx + a - 0.2, cz + a - 0.2], y + H - 0.1, y + H + 0.03, 0, 0, 0, 0, { noBottom: true }));
  col.rect([cx - a, cz - a, cx + a, cz + a], y, y + H); col.floor([cx - a, cz - a, cx + a, cz + a], y + H + 0.03);
  // a stair up its south side
  ttStair({ rect: [cx - 1.2, cz + a - 0.3, cx + 1.2, cz + a + 1.4], y0: y, y1: y + H + 0.03, dir: 'n', mat: 'stucco_ochre' }, { bag, col });
  const k = new Kit(), t = y + H + 0.03, L = a * 0.62, w = a * 0.17, h = 0.75;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const m0 = a * 0.2, m1 = m0 + L;                                                   // from near the middle out toward the corner
    const P = (m, u, yy) => [cx + sx * m * Math.SQRT1_2 - sz * u * Math.SQRT1_2, yy, cz + sz * m * Math.SQRT1_2 + sx * u * Math.SQRT1_2];
    k.hex(RD, [P(m0, -w, t), P(m1, -w, t), P(m1, w, t), P(m0, w, t), P(m0, -w, t + h), P(m1, -w, t + h), P(m1, w, t + h), P(m0, w, t + h)]);
    k.hex(WH, [P(m0 + 0.05, -w + 0.05, t + h - 0.02), P(m1 - 0.05, -w + 0.05, t + h - 0.02), P(m1 - 0.05, w - 0.05, t + h - 0.02), P(m0 + 0.05, w - 0.05, t + h - 0.02), P(m0 + 0.05, -w + 0.05, t + h + 0.03), P(m1 - 0.05, -w + 0.05, t + h + 0.03), P(m1 - 0.05, w - 0.05, t + h + 0.03), P(m0 + 0.05, w - 0.05, t + h + 0.03)]);
    const mm = (m0 + m1) / 2, q = P(mm, 0, 0);
    col.circle(q[0], q[2], w + 0.2, t, t + h);
  }
  k.emit(bag, 0, 0, 0, 0, 1);
}

/**
 * tt_goddess { c, y }: the colossal water goddess (Chalchiuhtlicue) found in the Moon Plaza's forecourt — a
 * monolith of some 20 tons (Wikipedia) — about 3.2 m on a low base [inferred: height]: block-like, the
 * wide headdress with its tassels, the ear spools, the necklace of three strands of square beads, the
 * hands before the chest, the rectangular opening at mid-chest, the folds of the skirt; facing south.
 */
export function ttGoddess(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, B = 'basalt';
  bag.add(STN, frustum([cx - 1.2, cz - 1.2, cx + 1.2, cz + 1.2], y, y + 0.45, 0.05, 0.05, 0.05, 0.05, { noBottom: true }));
  col.rect([cx - 1.2, cz - 1.2, cx + 1.2, cz + 1.2], y, y + 3.7);
  const k = carved('tt-goddess', (k) => {
    k.fz(B, [-0.78, 0.78, 0, 1.3], [-0.72, 0.72, 0, 1.3], -0.6, 0.55);                                  // the skirt
    for (let i = 0; i < 4; i++) k.bx(B, -0.74, 0.74, 0.2 + i * 0.26, 0.26 + i * 0.26, 0.55, 0.6);        // its folds
    k.fz(B, [-0.7, 0.7, 1.25, 2.3], [-0.66, 0.66, 1.25, 2.3], -0.52, 0.48);                             // the body in its quechquemitl
    k.bx('stucco_ochre', -0.2, 0.2, 1.5, 1.8, 0.48, 0.5);                                                // the opening at mid-chest
    for (const sx of [-1, 1]) { k.bx(B, sx * 0.25 - 0.17, sx * 0.25 + 0.17, 1.3, 1.5, 0.48, 0.66); for (let f = 0; f < 4; f++) k.bx(B, sx * 0.25 - 0.15 + f * 0.08, sx * 0.25 - 0.1 + f * 0.08, 1.24, 1.3, 0.52, 0.64); }   // the hands, their fingers
    for (let j = 0; j < 3; j++) for (let i = 0; i < 9; i++) { const x = -0.48 + i * 0.12; k.bx(B, x - 0.045, x + 0.045, 1.95 - j * 0.12, 2.04 - j * 0.12, 0.48, 0.55); }   // the necklace
    k.fz(B, [-0.42, 0.42, 2.25, 2.8], [-0.4, 0.4, 2.25, 2.8], -0.4, 0.42);                              // the face
    for (const sx of [-1, 1]) { k.bx(B, sx * 0.17 - 0.08, sx * 0.17 + 0.08, 2.52, 2.58, 0.42, 0.46); k.disc(B, sx * 0.5, 2.5, 0.3, 0.15, 0.14, 14, 0.06); }   // the eyes, the ear spools
    k.bx(B, -0.05, 0.05, 2.36, 2.52, 0.42, 0.5);
    k.fz(B, [-0.86, 0.86, 2.78, 3.25], [-0.84, 0.84, 2.78, 3.22], -0.5, 0.5);                             // the headdress
    for (let i = 0; i < 7; i++) { const x = -0.66 + i * 0.22; k.bx(B, x - 0.07, x + 0.07, 2.62, 2.8, 0.42, 0.52); }   // its tassels
    k.bx(B, -0.86, 0.86, 3.0, 3.06, 0.5, 0.54);
  });
  k.emit(bag, cx, y + 0.45, cz, 0, 1);
}

// ---- the Palace of Quetzalpapalotl ----------------------------------------------------------------------

/**
 * tt_palace { rect, y (the patio floor), seed }: the square patio (14 m) with its edge raised a step,
 * porticoes on all four sides on twelve carved pillars, the painted tablero lintels with stepped frets
 * and the roof crested with year-sign merlons round the patio; behind the north, west and south porticoes
 * rooms entered through doorways, their walls painted with stepped frets framed by hooks (the west wall
 * with red xicalcoliuhqui); east of the patio the vestibule, open to the east through five white pillars
 * on to the side platform's top, its lower walls painted with rippling water [stated/inferred: see the
 * dossier §11]. The patio is at the middle of the rect's west 41 m; the vestibule fills the rest.
 */
export function ttPalace(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, y = el.y, cz = (Z0 + Z1) / 2, cx = X0 + (Z1 - Z0) / 2;
  const P = 7.5, D = 4.0, T = 0.6, yp = y + 0.4, yr = yp + 3.4, rt = yr + 0.45, Q = P + D;
  // the raised floor round the patio (its kerb painted red), the patio's plaster
  const fl = [[X0, Z0, X1, cz - P - 0.3], [X0, cz + P + 0.3, X1, Z1], [X0, cz - P - 0.3, cx - P - 0.3, cz + P + 0.3], [cx + P + 0.3, cz - P - 0.3, X1, cz + P + 0.3]];
  for (const r of fl) { bag.add(WH, box(r[0], y - 0.1, r[1], r[2], yp, r[3])); col.floor(r, yp); }
  for (const r of [[cx - P - 0.3, cz - P - 0.3, cx + P + 0.3, cz - P], [cx - P - 0.3, cz + P, cx + P + 0.3, cz + P + 0.3], [cx - P - 0.3, cz - P, cx - P, cz + P], [cx + P, cz - P, cx + P + 0.3, cz + P]]) { bag.add(RD, box(r[0], y - 0.1, r[1], r[2], yp + 0.02, r[3])); col.floor(r, yp + 0.02); }
  bag.add('lime_plaster', box(cx - P, y - 0.1, cz - P, cx + P, y + 0.02, cz + P));
  // steps down into the patio, one in the middle of each side
  for (const [fx, fz] of Object.values(FACE)) {
    const r = fx ? [fx > 0 ? cx + P - 0.7 : cx - P, cz - 1.0, fx > 0 ? cx + P : cx - P + 0.7, cz + 1.0] : [cx - 1.0, fz > 0 ? cz + P - 0.7 : cz - P, cx + 1.0, fz > 0 ? cz + P : cz - P + 0.7];
    ttStair({ rect: r, y0: y + 0.02, y1: yp + 0.02, dir: fx ? (fx > 0 ? 'e' : 'w') : (fz > 0 ? 's' : 'n'), mat: WH }, ctx);
  }
  // the outer walls (north, south, west; the east between the rooms and the vestibule), the back walls of the porticoes
  const doorN = [{ at: cx, w: 1.5, h: 2.4 }, { at: cx - 9.5, w: 1.2, h: 2.2 }, { at: cx + 9.5, w: 1.2, h: 2.2 }];
  wall(bag, col, WH, 'x', Z0, Z0 + 0.7, X0, X1, yp, yr); wall(bag, col, WH, 'x', Z1 - 0.7, Z1, X0, X1, yp, yr);
  wall(bag, col, WH, 'z', X0, X0 + 0.7, Z0 + 0.7, Z1 - 0.7, yp, yr);
  wall(bag, col, WH, 'z', X1 - 0.7, X1, Z0 + 0.7, cz - Q - T, yp, yr); wall(bag, col, WH, 'z', X1 - 0.7, X1, cz + Q + T, Z1 - 0.7, yp, yr);
  wall(bag, col, WH, 'x', cz - Q - T, cz - Q, X0 + 0.7, X1, yp, yr, doorN);
  wall(bag, col, WH, 'x', cz + Q, cz + Q + T, X0 + 0.7, X1, yp, yr, doorN);
  wall(bag, col, WH, 'z', cx - Q - T, cx - Q, cz - Q, cz + Q, yp, yr, [{ at: cz, w: 1.5, h: 2.4 }]);
  wall(bag, col, WH, 'z', cx + Q, cx + Q + T, cz - Q, cz + Q, yp, yr, [{ at: cz, w: 1.8, h: 2.6 }]);
  // the rooms' partitions (north and south bands in three, the west band one long room)
  for (const xx of [cx - 5, cx + 5]) for (const [a, b] of [[Z0 + 0.7, cz - Q - T], [cz + Q + T, Z1 - 0.7]]) wall(bag, col, WH, 'z', xx - 0.25, xx + 0.25, a, b, yp, yr);
  // outside: the red dado and the cornice band
  for (const [ax, c, sd, a0, a1] of [['x', Z0, -1, X0, X1], ['x', Z1, 1, X0, X1], ['z', X0, -1, Z0, Z1]]) { band(bag, RD, ax, c, sd, a0, a1, yp - 0.4, yp + 0.9, 0.03); band(bag, RD, ax, c, sd, a0, a1, yr - 0.1, rt, 0.03); }
  // inside the porticoes: the painted walls — a red dado with white stepped frets framed by hooks; on the west wall red xicalcoliuhqui on white
  const frets = (ax, c, sd, a0, a1, doors, red) => {
    for (const [u0, u1] of runs(a0, a1, doors, 0.05)) {
      band(bag, red ? RD : PL, ax, c, sd, u0, u1, yp, yp + 1.1, 0.02);
      band(bag, RF, ax, c, sd, u0, u1, yp + 1.1, yp + 1.22, 0.03);
      for (let u = u0 + 0.15; u + 0.8 < u1; u += 0.9) {
        const m = red ? PL : RD;
        // the stepped fret: three steps rising, the hook turning back over them
        for (let s = 0; s < 3; s++) band(bag, m, ax, c, sd, u + s * 0.14, u + 0.42, yp + 0.2 + s * 0.14, yp + 0.34 + s * 0.14, 0.035);
        band(bag, m, ax, c, sd, u + 0.42, u + 0.54, yp + 0.2, yp + 0.86, 0.035);
        band(bag, m, ax, c, sd, u + 0.18, u + 0.42, yp + 0.74, yp + 0.86, 0.035);
        band(bag, m, ax, c, sd, u + 0.18, u + 0.3, yp + 0.62, yp + 0.74, 0.035);
      }
    }
  };
  frets('x', cz - Q, 1, cx - Q, cx + Q, doorN, true);
  frets('x', cz + Q, -1, cx - Q, cx + Q, doorN, true);
  frets('z', cx - Q, 1, cz - Q, cz + Q, [{ at: cz, w: 1.5 }], false);
  frets('z', cx + Q, -1, cz - Q, cz + Q, [{ at: cz, w: 1.8 }], true);
  // the vestibule's lower walls: rippling water, blue-green on pale blue
  const water = (ax, c, sd, a0, a1, doors = []) => {
    for (const [u0, u1] of runs(a0, a1, doors, 0.05)) {
      band(bag, 'stucco_sky', ax, c, sd, u0, u1, yp, yp + 0.95, 0.02);
      for (let row = 0; row < 3; row++) for (let u = u0 + 0.1 + (row % 2) * 0.25; u + 0.5 < u1; u += 0.5) {
        const yy = yp + 0.2 + row * 0.26;
        band(bag, row === 1 ? 'stucco_leaf' : 'maya_blue', ax, c, sd, u, u + 0.25, yy, yy + 0.06, 0.035);
        band(bag, row === 1 ? 'stucco_leaf' : 'maya_blue', ax, c, sd, u + 0.25, u + 0.5, yy + 0.06, yy + 0.12, 0.035);
      }
    }
  };
  water('z', cx + Q + T, 1, cz - Q, cz + Q, [{ at: cz, w: 1.8 }]);
  water('x', cz - Q, 1, cx + Q + T, X1 - 0.7); water('x', cz + Q, -1, cx + Q + T, X1 - 0.7);
  // the twelve carved pillars round the patio, each relief facing along its portico into the patio
  const pc = P + 0.56, ph = 0.5, ids = [-pc, -pc / 3, pc / 3, pc], yl = yr - 0.95;
  for (const i of ids) for (const j of ids) {
    if (Math.abs(i) < pc - 0.01 && Math.abs(j) < pc - 0.01) continue;
    const x = cx + i, z = cz + j;
    bag.add(STN, box(x - ph - 0.06, yp + 0.02, z - ph - 0.06, x + ph + 0.06, yp + 0.3, z + ph + 0.06));
    bag.add(STN, box(x - ph, yp + 0.3, z - ph, x + ph, yl, z + ph)); col.rect([x - ph, z - ph, x + ph, z + ph], yp, yr);
    if (Math.abs(j) > pc - 0.01) birdPanel().emit(bag, x, yp + 0.36, z - Math.sign(j) * ph, 0, -Math.sign(j), 0.82);
    if (Math.abs(i) > pc - 0.01) birdPanel().emit(bag, x - Math.sign(i) * ph, yp + 0.36, z, -Math.sign(i), 0, 0.82);
  }
  // the lintels over the pillars: painted tableros, red frames on red with white stepped frets, facing the patio
  for (const [fx, fz] of Object.values(FACE)) {
    const r = fx ? [cx + fx * pc - ph, cz - pc - ph, cx + fx * pc + ph, cz + pc + ph] : [cx - pc - ph, cz + fz * pc - ph, cx + pc + ph, cz + fz * pc + ph];
    bag.add(WH, box(r[0], yr - 0.95, r[1], r[2], yr, r[3]));
    const ax = fx ? 'z' : 'x', c = fx ? cx + fx * pc - fx * ph : cz + fz * pc - fz * ph, sd = -(fx || fz), a0 = (fx ? cz : cx) - pc - ph, a1 = (fx ? cz : cx) + pc + ph;
    band(bag, RF, ax, c, sd, a0, a1, yr - 0.95, yr, 0.03);
    band(bag, RD, ax, c, sd, a0 + 0.12, a1 - 0.12, yr - 0.83, yr - 0.12, 0.05);
    // the stepped fret: a stepped block rising to the right, and beside it the hook — a square spiral turning back
    for (let u = a0 + 0.3; u + 0.8 < a1 - 0.2; u += 0.9) {
      const yb = yr - 0.74;
      for (let q = 0; q < 4; q++) band(bag, PL, ax, c, sd, u + q * 0.09, u + 0.36, yb + q * 0.12, yb + (q + 1) * 0.12, 0.065);
      band(bag, PL, ax, c, sd, u + 0.42, u + 0.5, yb, yb + 0.48, 0.065);
      band(bag, PL, ax, c, sd, u + 0.5, u + 0.72, yb + 0.4, yb + 0.48, 0.065);
      band(bag, PL, ax, c, sd, u + 0.64, u + 0.72, yb + 0.16, yb + 0.4, 0.065);
      band(bag, PL, ax, c, sd, u + 0.56, u + 0.64, yb + 0.16, yb + 0.24, 0.065);
    }
  }
  // the vestibule's five white pillars at the east, their lintel
  const vx = X1 - 0.45;
  for (let i = 0; i < 5; i++) {
    const z = cz - Q + 0.6 + i * (2 * Q - 1.2) / 4;
    bag.add('lime_plaster', box(vx - 0.45, yp, z - 0.45, vx + 0.45, yr - 0.6, z + 0.45)); col.rect([vx - 0.45, z - 0.45, vx + 0.45, z + 0.45], yp, yr);
  }
  bag.add(WH, box(X1 - 0.9, yr - 0.6, cz - Q, X1, yr, cz + Q));
  band(bag, RF, 'z', X1, 1, cz - Q, cz + Q, yr - 0.6, yr, 0.03);
  band(bag, RD, 'z', X1, 1, cz - Q, cz + Q, yr - 0.1, rt, 0.03);
  // the landing that joins the vestibule to the side platform's top it opens on (el.land: that top's level), and the step up
  if (el.land != null) {
    bag.add(WH, box(X1 - 0.2, el.land - 1.2, Z0, X1 + 1.6, el.land, Z1)); col.floor([X1, Z0, X1 + 1.6, Z1], el.land);
    ttStair({ rect: [X1, cz - Q, X1 + 0.8, cz + Q], y0: el.land, y1: yp, dir: 'w', mat: WH }, ctx);
  }
  // the feathered serpent's head at the head of the broad stair up from the avenue, on its right only (endow.world)
  if (el.stairHead) { const [hx, hy, hz, dx, dz] = el.stairHead; teoSerpent().emit(bag, hx, hy + 0.46, hz, dx, dz); col.rect([hx - 0.5, hz - 0.5, hx + 0.5, hz + 0.5], hy, hy + 1); }
  // the roof over all but the patio; the year-sign merlons round the patio's edge and along the vestibule's front
  for (const r of [[X0, Z0, X1, cz - pc + ph], [X0, cz + pc - ph, X1, Z1], [X0, cz - pc + ph, cx - pc + ph, cz + pc - ph], [cx + pc - ph, cz - pc + ph, X1, cz + pc - ph]]) { bag.add(WH, box(r[0], yr, r[1], r[2], rt, r[3])); col.floor(r, rt); }
  for (const [fx, fz] of Object.values(FACE)) {
    const L = 2 * (pc - ph), n = Math.floor(L / 1.05);
    for (let i = 0; i < n; i++) { const u = -L / 2 + L * (i + 0.5) / n; yearMerlon().emit(bag, fx ? cx + fx * (pc - ph + 0.12) : cx + u, rt, fx ? cz + u : cz + fz * (pc - ph + 0.12), -fx, -fz); }
  }
  { const L = 2 * Q, n = Math.floor(L / 1.05); for (let i = 0; i < n; i++) yearMerlon().emit(bag, X1 - 0.15, rt, cz - Q + L * (i + 0.5) / n, 1, 0); }
  // inside the rooms: reed mats, a low bench along the back of the middle rooms
  for (const [zb, sd] of [[Z0 + 0.7, 1], [Z1 - 0.7, -1]]) {
    const z0 = sd > 0 ? zb : zb - 1.0, z1 = sd > 0 ? zb + 1.0 : zb;
    bag.add(RD, box(cx - 4.7, yp, z0, cx + 4.7, yp + 0.45, z1)); col.rect([cx - 4.7, z0, cx + 4.7, z1], yp, yp + 0.45); col.floor([cx - 4.7, z0, cx + 4.7, z1], yp + 0.45);
    for (const xm of [cx - 11, cx, cx + 11]) bag.add('reed_mat', box(xm - 1.2, yp, (sd > 0 ? cz - Q - T : cz + Q + T) - sd * 2.2 - 0.9, xm + 1.2, yp + 0.02, (sd > 0 ? cz - Q - T : cz + Q + T) - sd * 2.2 + 0.9));
  }
  bag.add('reed_mat', box(X0 + 1.5, yp, cz - 2, X0 + 3.5, yp + 0.02, cz + 2));
  // the people: a lord seated in the north portico, attendants, a priest crossing the patio, visitors in the vestibule
  person(ctx, cx, cz - Q + 1.3, yp + 0.02, Math.PI, 'priest', el.seed + 1);
  person(ctx, cx - 1.4, cz - Q + 1.6, yp + 0.02, Math.PI - 0.4, 'pilgrim', el.seed + 2);
  person(ctx, cx + 2.5, cz + 1.5, y + 0.02, 2.3, 'priest', el.seed + 3);
  person(ctx, cx + Q + 4, cz - 2.5, yp, -Math.PI / 2, 'pilgrim', el.seed + 4);
  person(ctx, cx + Q + 4.6, cz - 1.8, yp, -Math.PI / 2 + 0.5, 'bearer', el.seed + 5);
  person(ctx, cx - Q + 1.5, cz + 3, yp + 0.02, Math.PI / 2, 'kneel', el.seed + 6);
}

// ---- the Jaguars' patio ---------------------------------------------------------------------------------

/**
 * tt_jaguars { rect, y, seed }: the patio of the Jaguars (endow.world; Uncovered History): a square patio,
 * three porticoes — north, west and south — each of two pillars before a wall with a central doorway into
 * the room behind, two plumed jaguars painted on the wall either side of the door; on the east the stair
 * up the temple platform over the Temple of the Feathered Conches, a carved jaguar at its foot.
 */
export function ttJaguars(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, y = el.y, P = 7, D = 3.5, T = 0.6;
  const cx = X0 + 0.7 + 6 + T + D + P, cz = (Z0 + Z1) / 2, yp = y + 0.25, yr = yp + 3.0, rt = yr + 0.4;
  // the patio, the raised floor of the porticoes and rooms west, north and south of it
  bag.add('lime_plaster', box(cx - P, y - 0.1, cz - P, cx + P, y + 0.02, cz + P));
  for (const r of [[X0, Z0, cx + P, cz - P], [X0, cz + P, cx + P, Z1], [X0, cz - P, cx - P, cz + P]]) { bag.add(WH, box(r[0], y - 0.1, r[1], r[2], yp, r[3])); col.floor(r, yp); }
  bag.add(WH, box(cx + P, y - 0.1, Z0, X1, y + 0.02, Z1));
  for (const [fx, fz] of [[-1, 0], [0, -1], [0, 1]]) {
    const r = fx ? [cx - P, cz - 1.0, cx - P + 0.5, cz + 1.0] : [cx - 1.0, fz > 0 ? cz + P - 0.5 : cz - P, cx + 1.0, fz > 0 ? cz + P : cz - P + 0.5];
    ttStair({ rect: r, y0: y + 0.02, y1: yp, dir: fx ? 'w' : fz > 0 ? 's' : 'n', mat: WH }, ctx);
  }
  // the walls: outer, the porticoes' back walls with their doors, the rooms' ends
  const Q = P + D, door = (at) => [{ at, w: 1.5, h: 2.3 }];
  wall(bag, col, WH, 'x', Z0, Z0 + 0.7, X0, cx + P, yp, yr); wall(bag, col, WH, 'x', Z1 - 0.7, Z1, X0, cx + P, yp, yr);
  wall(bag, col, WH, 'z', X0, X0 + 0.7, Z0 + 0.7, Z1 - 0.7, yp, yr);
  wall(bag, col, WH, 'z', cx + P - 0.6, cx + P, Z0 + 0.7, cz - Q, yp, yr); wall(bag, col, WH, 'z', cx + P - 0.6, cx + P, cz + Q, Z1 - 0.7, yp, yr);
  wall(bag, col, WH, 'x', cz - Q - T, cz - Q, cx - Q, cx + P - 0.6, yp, yr, door(cx));
  wall(bag, col, WH, 'x', cz + Q, cz + Q + T, cx - Q, cx + P - 0.6, yp, yr, door(cx));
  wall(bag, col, WH, 'z', cx - Q - T, cx - Q, cz - Q - T, cz + Q + T, yp, yr, door(cz));
  // the porticoes' ends (the corners closed) and their two pillars each
  for (const sz of [-1, 1]) bag.add(WH, box(cx - Q, yp, sz < 0 ? cz - Q : cz + P, cx - P, yr, sz < 0 ? cz - P : cz + Q)), col.rect([cx - Q, sz < 0 ? cz - Q : cz + P, cx - P, sz < 0 ? cz - P : cz + Q], yp, yr);
  const pil = (x, z) => { bag.add(WH, box(x - 0.4, yp, z - 0.4, x + 0.4, yr, z + 0.4)); band(bag, RD, 'x', z - 0.4, -1, x - 0.42, x + 0.42, yp, yp + 0.5, 0.02); band(bag, RD, 'x', z + 0.4, 1, x - 0.42, x + 0.42, yp, yp + 0.5, 0.02); col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], yp, yr); };
  for (const u of [-P / 3, P / 3]) { pil(cx + u, cz - P - 0.45); pil(cx + u, cz + P + 0.45); pil(cx - P - 0.45, cz + u); }
  // the murals: two jaguars either side of each door, walking toward it, on the lower wall
  const mural = (ax, c, sd, a0, a1, at) => {
    for (const [u0, u1, toward] of [[a0 + 0.2, at - 0.95, 1], [at + 0.95, a1 - 0.2, -1]]) {
      const L = u1 - u0, n = 2;
      for (let i = 0; i < n; i++) {
        const u = u0 + L * (i + 0.5) / n, s = 2.5 * Math.min(1, L / n / 2.6);
        // turn the mural so it walks toward the door: in its frame +x is to the right looking at the wall
        const right = ax === 'x' ? sd : -sd, flip = toward * right < 0;
        jaguarMural(flip).emit(bag, ax === 'x' ? u : c, yp + 0.22, ax === 'x' ? c : u, ax === 'x' ? 0 : sd, ax === 'x' ? sd : 0, s / 2.5);
      }
      band(bag, RF, ax, c, sd, u0 - 0.1, u1 + 0.1, yp, yp + 0.2, 0.02);
    }
  };
  mural('x', cz - Q, 1, cx - P, cx + P - 0.6, cx);
  mural('x', cz + Q, -1, cx - P, cx + P - 0.6, cx);
  mural('z', cx - Q, 1, cz - P, cz + P, cz);
  // the roof over porticoes and rooms, red cornice outside, merlons along the patio's edge
  for (const r of [[X0, Z0, cx + P, cz - P], [X0, cz + P, cx + P, Z1], [X0, cz - P, cx - P, cz + P]]) { bag.add(WH, box(r[0], yr, r[1], r[2], rt, r[3])); col.floor(r, rt); }
  for (const [ax, c, sd, a0, a1] of [['x', Z0, -1, X0, cx + P], ['x', Z1, 1, X0, cx + P], ['z', X0, -1, Z0, Z1]]) band(bag, RD, ax, c, sd, a0, a1, yr - 0.05, rt, 0.03);
  for (const [fx, fz] of [[-1, 0], [0, -1], [0, 1]]) { const n = 12; for (let i = 0; i < n; i++) { const u = -P + 2 * P * (i + 0.5) / n; yearMerlon().emit(bag, fx ? cx - P + 0.12 : cx + u, rt, fx ? cz + u : cz + fz * (P - 0.12), -fx, -fz); } }
  // the temple platform on the east, its stair down into the patio, the carved jaguar at its foot
  ttPyramid({ c: [cx + P + (X1 - cx - P) / 2, cz], y: y + 0.02, w: X1 - cx - P, d: 2 * P + 6, tw: X1 - cx - P - 2, td: 2 * P + 4, h: 3, levels: 1, tablero: 0.55, stair: 'w', stairW: 6, talud: RD, temple: { w: 5, d: 7, h: 3 } }, ctx);
  jaguarHead().emit(bag, cx + P - 2.9, y + 0.02, cz + 4.4, -1, 0);
  col.rect([cx + P - 3.3, cz + 3.9, cx + P - 2.5, cz + 4.9], y, y + 1.05);
  person(ctx, cx - 2, cz + 1, y + 0.02, 1.2, 'priest', el.seed + 1);
  person(ctx, cx - P - 1.5, cz - 2.4, yp, Math.PI / 2, 'pilgrim', el.seed + 2);
}

// ---- the temple on the Pyramid of the Sun, inside; people on the stairs --------------------------------

/**
 * The chamber of a temple on a pyramid (ttPyramid's temple.inner), its inner rect I, floor y, ceiling ceil,
 * the door on the side fx (±1, x): a stucco floor; the walls with a red dado and, above, a band painted with
 * chalchihuites; the roof's beams; in the middle the altar — a little talud-tablero platform with a theatre
 * censer on it, two more on the floor before it, reed mats and offerings; a priest kneeling at the altar and
 * one standing by it.
 */
export function ttTempleInside(I, y, ceil, fx, seed, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = I, zc = (z0 + z1) / 2, xc = (x0 + x1) / 2, e = 0.03, dw = 1.2, f = y + 0.05;
  bag.add(WH, box(x0, y, z0, x1, f, z1));
  // the walls' paint: the dado, the band of chalchihuites (green discs ringed in black on red)
  const front = fx < 0 ? x0 : x1, back = fx < 0 ? x1 : x0;
  const faces = [['x', z0, 1, x0, x1], ['x', z1, -1, x0, x1], ['z', back, fx, z0, z1], ['z', front, -fx, z0, zc - dw], ['z', front, -fx, zc + dw, z1]];
  for (const [ax, c, s, a0, a1] of faces) {
    const B = (ya, yb, m) => bag.add(m, ax === 'x' ? box(a0, ya, s > 0 ? c : c - e, a1, yb, s > 0 ? c + e : c) : box(s > 0 ? c : c - e, ya, a0, s > 0 ? c + e : c, yb, a1));
    B(f, y + 1.0, RD); B(y + 2.1, y + 2.75, RF);
    for (let u = a0 + 0.6; u < a1 - 0.4; u += 0.9) {
      for (const [r, m, o] of [[0.24, OB, 0.03], [0.16, 'clay_green', 0.05]]) {
        const g = lathe([[0.001, 0], [r, 0], [r, o], [0.001, o]], 10);
        if (ax === 'x') g.rotateX(s > 0 ? Math.PI / 2 : -Math.PI / 2); else g.rotateZ(s > 0 ? -Math.PI / 2 : Math.PI / 2);
        bag.add(m, ax === 'x' ? g.translate(u, y + 2.42, c + s * e) : g.translate(c + s * e, y + 2.42, u));
      }
    }
  }
  for (let z = z0 + 0.6; z < z1 - 0.3; z += 0.9) bag.add('viga', box(x0 - 0.1, ceil - 0.26, z - 0.12, x1 + 0.1, ceil + 0.05, z + 0.12));
  // the altar a little behind the middle, its censer; two censers on the floor before it; mats and offerings
  const ax = xc - fx * 1.4, a = 0.9;
  bag.add(RD, frustum([ax - a, zc - a, ax + a, zc + a], f, f + 0.4, 0.12, 0.12, 0.12, 0.12, { noBottom: true, noTop: true }));
  tablero(bag, [ax - a + 0.1, zc - a + 0.1, ax + a - 0.1, zc + a - 0.1], f + 0.4, f + 0.9, { out: 0.08, discs: false });
  bag.add(WH, frustum([ax - a + 0.18, zc - a + 0.18, ax + a - 0.18, zc + a - 0.18], f + 0.8, f + 0.92, 0, 0, 0, 0, { noBottom: true }));
  col.rect([ax - a, zc - a, ax + a, zc + a], f, f + 0.92);
  theatreCenser().emit(bag, ax, f + 0.92, zc, fx, 0);
  soot(bag, [ax, ceil, zc], [0, -1, 0], 2.6, 2.2, seed + 5);                           // the censers' smoke on the ceiling between the beams
  for (const s of [-1, 1]) { theatreCenser().emit(bag, ax + fx * 2.4, f, zc + s * 1.8, fx, 0); col.circle(ax + fx * 2.4, zc + s * 1.8, 0.4, f, f + 1); }
  bag.add('reed_mat', box(Math.min(ax + fx * 1.2, ax + fx * 3.4), f, zc - 0.9, Math.max(ax + fx * 1.2, ax + fx * 3.4), f + 0.02, zc + 0.9));
  for (let i = 0; i < 6; i++) bag.add(i % 2 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.13, 0.01], [0.19, 0.1], [0.18, 0.11], [0.001, 0.04]], 10, null, ax - fx * (a + 0.5), f, zc - 1.25 + i * 0.5));
  person(ctx, ax + fx * 2.0, zc, f + 0.02, fx < 0 ? -Math.PI / 2 : Math.PI / 2, 'kneel', seed + 1);
  person(ctx, ax - fx * 0.3, zc + a + 0.8, f, Math.PI, 'priest', seed + 2);
}

/** tt_people { people: [[x, z, y, rot, who, seed]] }: still figures (person): who 'priest' | 'pilgrim' | 'bearer' | 'kneel'. */
export function ttPeople(el, ctx) {
  for (const [x, z, y, rot, who, seed] of el.people) person(ctx, x, z, y, rot, who, seed);
}
