// The toguna, the men's house (docs/settlements/dogon.md §4.1): open on every side, eight posts of wood on stone footings, carved with
// ancestors, masks and zig-zags, forked at the top to carry the beams, and the roof, eight layers of millet stalks laid crosswise,
// stones set on the top as weights. Under it a floor of beaten earth, a low bench of mud along the back, mats, stools, a rope in the
// making. The real one is too low to stand in; ours is raised to 1.95 m clear so that a visitor can walk in (written in the dossier).

import { box, lathe, rod, place, fromTriangles } from '../../core/geom.js';
import { rng, hv, DARK, LOG, STONE, STONE2, THATCH, STALK, WALL, MUD, SMOOTH, RED, basket } from './props.js';

export const CLEAR = 1.95;

/** A carved post at (x, y, z): a round foot on a stone, the middle hewn square so that it can be carved on its faces (ancestors in relief, bands of zig-zag, a lizard up the side), collars at both ends of the carving, forked at the top to carry the beams. `face` is the direction (yaw) the main figure looks toward; k the post's number. */
function post(bag, col, x, y, z, rand, face, k) {
  const r = 0.2 + rand() * 0.03, h = (n) => hv(x, z, n);
  bag.add(STONE, lathe([[0.42, -0.3], [0.4, 0.1], [0.3, 0.2], [0.001, 0.2]], 8, (t) => 1 + 0.08 * Math.sin(t * 5 + x), x, y, z));
  bag.add(DARK, lathe([[r * 1.1, 0.18], [r, 0.3], [r * 0.96, 0.42]], 10, (t, i) => 1 + 0.025 * Math.sin(t * 3 + i * 2 + k), x, y, z));
  bag.add(DARK, box(x - 0.2, y + 0.38, z - 0.2, x + 0.2, y + 0.45, z + 0.2));                                   // the collar where the round foot ends
  bag.add(DARK, box(x - HD, y + 0.45, z - HD, x + HD, y + 1.72, z + HD));                                          // the hewn middle, its faces left flat for the carving
  bag.add(DARK, box(x - 0.2, y + 1.7, z - 0.2, x + 0.2, y + 1.77, z + 0.2));                                     // and the collar above it
  bag.add(DARK, lathe([[0.15, 0], [0.12, 0.05], [0.1, 0.1]], 8, null, x, y + 1.77, z));
  // the fork: two short branches opening upward, the beam lying in them
  for (const s of [-1, 1]) bag.add(DARK, rod([x, y + 1.82, z], [x + s * 0.17 * Math.cos(face), y + 2.02, z + s * 0.17 * Math.sin(face)], 0.065, 6));
  // carving (docs/settlements/dogon.md §13): the faces; the main one toward `face`, the other across when the post stands between two paths, a lizard and chevrons up a side
  const faces = k % 2 === 0 ? [face, face + Math.PI] : [face];
  faces.forEach((fc, n) => carve(bag, x, y, z, fc, h(1 + n * 7) < 0.4, h(2 + n * 7) < 0.5, h(3 + n * 7), x + n, z));
  const side = face + (h(4) < 0.5 ? Math.PI / 2 : -Math.PI / 2);
  if (h(5) < 0.7) lizardUp(bag, x, y, z, side, h(6)); else chevrons(bag, x, y, z, side);
  col.circle(x, z, HD + 0.1, y, y + 2.2);
}

const HD = 0.17;
const REL = 0.05;

/** A lizard in relief going up a post's face (head up), by the maker's hand: body, head, four bent legs, a tail with a curl. */
function lizardUp(bag, x, y, z, yaw, hh) {
  const g = (geo) => bag.add(LOG, place(geo, x, y, z, yaw)), zp = HD + 0.02, c = (hh - 0.5) * 0.05;
  g(rod([c, 0.62, zp], [c, 1.2, zp], 0.028, 5));
  g(lathe([[0.001, 0], [0.04, 0.03], [0.045, 0.08], [0.001, 0.14]], 6, null, c, 1.2, zp));                // the head
  for (const [v, s] of [[0.68, -1], [0.68, 1], [1.1, -1], [1.1, 1]]) { g(rod([c + s * 0.02, v, zp], [c + s * 0.1, v + 0.06, zp], 0.015, 4)); g(rod([c + s * 0.1, v + 0.06, zp], [c + s * 0.12, v + 0.16, zp], 0.014, 4)); }
  g(rod([c, 0.62, zp], [c + 0.07, 0.5, zp], 0.02, 4)); g(rod([c + 0.07, 0.5, zp], [c + 0.02, 0.42, zp], 0.014, 4));
  for (let i = 0; i < 4; i++) g(box(-0.13, 0.46 + i * 0.35, zp - 0.02, 0.13, 0.48 + i * 0.35, zp + 0.01).translate(0, 0, 0));       // bars that close the registers
}
/** Two bands of chevrons on a face. */
function chevrons(bag, x, y, z, yaw) {
  const T = [], zp = HD + 0.012;
  for (const [y0, y1] of [[0.55, 0.78], [1.3, 1.53]]) for (let i = 0; i < 5; i++) { const a = -0.14 + i * 0.056, b = a + 0.056; T.push(a, y0, zp, (a + b) / 2, y1, zp, b, y0, zp); }
  bag.add(LOG, place(fromTriangles(T), x, y, z, yaw));
}

/** The relief on one face of a post (the face's plane at HD): a band of zig-zag at the foot of the carving, the ancestor above it — knees bent, hands at the belly or the arms raised, a head with nose, eyes and mouth and a cap, a few of them with the breasts and the scars dotted down the trunk — and the bars closing it. */
function carve(bag, x, y, z, yaw, female, raised, hh, sx, sz) {
  const g = (mat, geo) => bag.add(mat, place(geo.translate(0, -0.45, 0).scale(1, 0.88, 1).translate(0, 0.45, 0), x, y, z, yaw)), zp = HD, d = REL;      // the figure drawn at full height, squeezed to fit between the collars
  const R = (x0, y0, x1, y1, dd = d) => box(x0, y0, zp - 0.012, x1, y1, zp + dd);
  const T = [];
  for (let i = -2; i < 3; i++) { const a = i * 0.06 - 0.03, b = a + 0.06; T.push(a, 0.5, zp + 0.012, (a + b) / 2, 0.66, zp + 0.012, b, 0.5, zp + 0.012); }
  g(LOG, fromTriangles(T));
  g(LOG, R(-0.15, 0.7, 0.15, 0.735, 0.02));
  for (const s of [-1, 1]) {                                                       // legs: thigh out, shin back in, the foot
    g(LOG, rod([s * 0.05, 1.08, zp + 0.025], [s * 0.115, 0.92, zp + 0.03], 0.033, 5));
    g(LOG, rod([s * 0.115, 0.92, zp + 0.03], [s * 0.08, 0.76, zp + 0.025], 0.03, 5));
    g(LOG, R(s * 0.08 - 0.035, 0.735, s * 0.08 + 0.035, 0.775, 0.03));
  }
  g(LOG, R(-0.1, 1.06, 0.1, 1.44));                                               // trunk
  g(LOG, R(-0.035, 1.44, 0.035, 1.5));                                            // neck
  for (const s of [-1, 1]) {
    if (raised) { g(LOG, rod([s * 0.1, 1.4, zp + 0.025], [s * 0.14, 1.58, zp + 0.03], 0.028, 5)); g(LOG, rod([s * 0.14, 1.58, zp + 0.03], [s * 0.125, 1.76, zp + 0.025], 0.026, 5)); }
    else { g(LOG, rod([s * 0.11, 1.4, zp + 0.025], [s * 0.145, 1.22, zp + 0.03], 0.028, 5)); g(LOG, rod([s * 0.145, 1.22, zp + 0.03], [s * 0.035, 1.14, zp + 0.045], 0.025, 5)); }
  }
  if (female) for (const s of [-1, 1]) g(LOG, lathe([[0.001, 0], [0.045, 0.006], [0.036, 0.06], [0.001, 0.08]], 7, null, s * 0.055, 1.3, zp + d - 0.01).rotateX(0));
  else for (let i = 0; i < 4; i++) g(LOG, R(-0.012 + (i % 2) * 0.07 - 0.035, 1.15 + i * 0.07, 0.012 + (i % 2) * 0.07 - 0.035, 1.17 + i * 0.07, 0.065));    // the scars down the trunk
  g(LOG, lathe([[0.001, 0], [0.055, 0.03], [0.07, 0.11], [0.05, 0.2], [0.001, 0.23]], 8, null, 0, 1.5, zp + 0.03));         // the head
  g(LOG, R(-0.011, 1.56, 0.011, 1.66, 0.105));                                    // the nose
  for (const s of [-1, 1]) g('opening', box(s * 0.032 - 0.011, 1.63, zp + 0.08, s * 0.032 + 0.011, 1.65, zp + 0.092));
  g('opening', box(-0.026, 1.545, zp + 0.085, 0.026, 1.56, zp + 0.095));
  if (hh < 0.4) g(LOG, lathe([[0.09, 0], [0.085, 0.03], [0.001, 0.05]], 8, null, 0, 1.72, zp + 0.03));                       // a flat cap
  else if (hh < 0.75) for (const s of [-1, 1]) g(LOG, rod([s * 0.04, 1.71, zp + 0.05], [s * 0.095, 1.8, zp + 0.05], 0.018, 4));   // a pair of horns of the headdress
  else g(LOG, R(-0.06, 1.71, 0.06, 1.76, 0.05));                                  // a plaited crown
  void sx; void sz;
}

/** toguna: { c: [x, z], w, d, y, yaw?, seed }: the plan about its centre, the floor at y + 0.12. */
export function toguna(el, { bag, col }) {
  const rand = rng(el.seed || 31), [cx, cz] = el.c, W = el.w ?? 7.2, D = el.d ?? 5.4, y = el.y ?? 0;
  const F = y + 0.12;
  // the floor: a platform of beaten earth edged with stones
  bag.add(MUD, box(cx - W / 2 - 0.5, y - 0.3, cz - D / 2 - 0.5, cx + W / 2 + 0.5, F, cz + D / 2 + 0.5));
  col.floor([cx - W / 2 - 0.5, cz - D / 2 - 0.5, cx + W / 2 + 0.5, cz + D / 2 + 0.5], F);
  for (let i = 0; i < 26; i++) {
    const t = i / 26, side = Math.floor(t * 4), u = (t * 4) % 1, hw = W / 2 + 0.5, hd = D / 2 + 0.5;
    const px = side === 0 ? -hw + u * 2 * hw : side === 2 ? hw - u * 2 * hw : side === 1 ? hw : -hw, pz = side === 1 ? -hd + u * 2 * hd : side === 3 ? hd - u * 2 * hd : side === 0 ? -hd : hd;
    bag.add(STONE2, lathe([[0.2 + rand() * 0.08, 0], [0.17, 0.12], [0.001, 0.15]], 6, (t2) => 1 + 0.2 * Math.sin(t2 * 3 + i), cx + px, F - 0.06, cz + pz));
  }
  // the eight posts, two rows of four
  const U = [-0.375, -0.125, 0.125, 0.375].map((f) => f * W), V = [-D * 0.34, D * 0.34];
  let k = 0;
  for (const v of V) for (const u of U) { post(bag, col, cx + u, F, cz + v, rand, v < 0 ? 0 : Math.PI, k); k++; }
  // the beams: two long ones in the forks along x, cross-beams over them, then the roof's layers
  const yb = F + CLEAR - 0.1;
  for (const v of V) bag.add(DARK, rod([cx - W / 2 - 0.5, yb + 0.03, cz + v], [cx + W / 2 + 0.5, yb + 0.03, cz + v], 0.1, 7));
  for (let i = 0; i < 9; i++) { const u = cx - W / 2 - 0.2 + i * (W + 0.4) / 8; bag.add(LOG, rod([u, yb + 0.17, cz - D / 2 - 0.3], [u + (rand() - 0.5) * 0.05, yb + 0.17, cz + D / 2 + 0.3], 0.065, 6)); }
  // the layers: bundles of millet stalks, each layer crosswise to the one below
  const RW = W + 1.0, RD = D + 1.0, BH = 0.13;
  let yy = yb + 0.25;
  for (let L = 0; L < 8; L++) {
    const alongX = L % 2 === 0, n = Math.round((alongX ? RD : RW) / 0.21), span = alongX ? RW : RD, mat = L % 3 === 1 ? STALK : THATCH;
    const inset = L * 0.05 + (L > 5 ? 0.1 * (L - 5) : 0);
    const rise = (o) => 0.06 * (1 - Math.min(1, Math.abs(o) / ((alongX ? RD : RW) / 2)) ** 2) * (L / 7);      // the mat swells toward its middle
    for (let i = 0; i < n; i++) {
      const o = -(alongX ? RD : RW) / 2 + (i + 0.5) * (alongX ? RD : RW) / n, ext = span / 2 - inset + (rand() - 0.5) * 0.18, bh = BH * (0.9 + rand() * 0.25);
      if (alongX) bag.add(mat, box(cx - ext, yy + rise(o), cz + o - 0.105, cx + ext, yy + bh + rise(o), cz + o + 0.105));
      else bag.add(mat, box(cx + o - 0.105, yy + rise(o), cz - ext, cx + o + 0.105, yy + bh + rise(o), cz + ext));
    }
    yy += BH;
  }
  // the ragged eaves: loose stalk ends hanging and splayed from the lowest layers on all four sides, and the lashings (a cord of bark round the bundle ends)
  for (let i = 0; i < 70; i++) {
    const t = i / 70, per = 2 * (RW + RD), d = t * per;
    let px, pz, nx, nz;
    if (d < RW) { px = -RW / 2 + d; pz = -RD / 2; nx = 0; nz = -1; } else if (d < RW + RD) { px = RW / 2; pz = -RD / 2 + (d - RW); nx = 1; nz = 0; } else if (d < 2 * RW + RD) { px = RW / 2 - (d - RW - RD); pz = RD / 2; nx = 0; nz = 1; } else { px = -RW / 2; pz = RD / 2 - (d - 2 * RW - RD); nx = -1; nz = 0; }
    const len = 0.22 + rand() * 0.2, sp = (rand() - 0.5) * 0.25, y0 = yb + 0.3 + rand() * 0.1;
    bag.add(THATCH, rod([cx + px - nx * 0.05, y0, cz + pz - nz * 0.05], [cx + px + nx * 0.12 + nz * sp, y0 - len, cz + pz + nz * 0.12 + nx * sp], 0.016, 3));
  }
  for (const f of [-0.33, 0, 0.33]) { bag.add('bark_dark', box(cx - RW / 2 + 0.02, yb + 0.3, cz + f * RD - 0.02, cx + RW / 2 - 0.02, yb + 0.33, cz + f * RD + 0.02)); }
  // stones and a broken bundle on top, held down
  for (let i = 0; i < 9; i++) bag.add(STONE2, lathe([[0.2 + rand() * 0.1, 0], [0.18, 0.1], [0.001, 0.14]], 6, (t) => 1 + 0.15 * Math.sin(t * 3 + i), cx + (rand() - 0.5) * (RW - 1), yy - 0.02, cz + (rand() - 0.5) * (RD - 1)));
  col.rect([cx - RW / 2, cz - RD / 2, cx + RW / 2, cz + RD / 2], F + CLEAR, yy);
  // under the roof: the bench of mud along the back, mats and stools, baskets, a hoe hung from a beam
  const bz = cz - D / 2 + 0.05;
  bag.add(WALL, box(cx - W / 2 + 0.6, y, bz - 0.3, cx + W / 2 - 0.6, F + 0.35, bz + 0.3));
  bag.add(SMOOTH, box(cx - W / 2 + 0.55, F + 0.35, bz - 0.34, cx + W / 2 - 0.55, F + 0.4, bz + 0.34));
  col.rect([cx - W / 2 + 0.55, bz - 0.34, cx + W / 2 - 0.55, bz + 0.34], F, F + 0.4);
  bag.add(STALK, box(cx - 2.2, F + 0.4, bz - 0.28, cx - 0.4, F + 0.42, bz + 0.28));
  bag.add('cloth_indigo', box(cx + 0.7, F + 0.42, bz - 0.2, cx + 1.5, F + 0.46, bz + 0.2));
  bag.add(STALK, box(cx - 1.8, F, cz + 0.2, cx + 0.2, F + 0.015, cz + 1.4));
  for (const [sx, sz] of [[cx + 1.8, cz + 0.6], [cx + 2.5, cz + 1.0], [cx - 2.4, cz + 1.6]]) {
    bag.add(DARK, lathe([[0.17, 0], [0.12, 0.02], [0.1, 0.12], [0.16, 0.2], [0.17, 0.26], [0.001, 0.26]], 8, null, sx, F, sz));      // a carved stool
    col.circle(sx, sz, 0.2, F, F + 0.26);
  }
  basket(bag, cx + 2.9, F, cz - 1.2, 0.26, 'cloth_ochre'); basket(bag, cx - 2.9, F, cz - 0.2, 0.22);
  bag.add(LOG, rod([cx - 0.8, yb - 0.02, cz + V[1]], [cx - 0.8, yb - 0.5, cz + V[1] - 0.05], 0.012, 4));
  bag.add('iron', box(cx - 0.84, yb - 0.62, cz + V[1] - 0.12, cx - 0.76, yb - 0.46, cz + V[1] - 0.04));
  bag.add(RED, box(cx - W / 2 + 0.6, F + 0.4, bz + 0.3, cx + W / 2 - 0.6, F + 0.43, bz + 0.34));
  // the men's strip loom: two posts and a beam with the heddles, the warp running away west along the ground to its stone weight, a narrow
  // strip of indigo and white already woven; the weaver sits on a low stool at its east end (town.js)
  const lx = cx + 1.2, lz = cz - 1.35;
  for (const s of [-1, 1]) bag.add(DARK, rod([lx, F, lz + s * 0.35], [lx + 0.05, F + 1.35, lz + s * 0.35], 0.03, 5));
  bag.add(DARK, rod([lx + 0.05, F + 1.3, lz - 0.4], [lx + 0.05, F + 1.3, lz + 0.4], 0.025, 5));
  bag.add(LOG, rod([lx - 0.15, F + 1.0, lz - 0.38], [lx - 0.15, F + 1.0, lz + 0.38], 0.018, 4));
  for (let k = -3; k <= 3; k++) bag.add(THATCH, rod([lx - 0.15, F + 1.0, lz + k * 0.045], [lx - 2.6, F + 0.05, lz + k * 0.045], 0.004, 3));
  bag.add('cloth_indigo', box(lx - 0.5, F + 0.55, lz - 0.1, lx - 0.15, F + 0.57, lz + 0.1));
  bag.add('cloth_white', box(lx - 0.5, F + 0.57, lz - 0.1, lx - 0.4, F + 0.575, lz + 0.1));
  bag.add(STONE2, lathe([[0.2, 0], [0.16, 0.1], [0.001, 0.14]], 6, null, lx - 2.65, F, lz));
  col.circle(lx, lz - 0.35, 0.05, F, F + 1.4); col.circle(lx, lz + 0.35, 0.05, F, F + 1.4);
  bag.add(DARK, lathe([[0.17, 0], [0.12, 0.02], [0.1, 0.12], [0.16, 0.2], [0.17, 0.26], [0.001, 0.26]], 8, null, lx + 0.55, F, lz));
  col.circle(lx + 0.55, lz, 0.2, F, F + 0.26);
}
