// The inside of the halls (docs/settlements/persepolis.md §20): what the walls and floors of the Hundred-Column Hall, the Tachara and
// the Hadish carry — stone-framed niches in the thick walls, a stone dado, a glazed band under the ceiling, hangings — and the
// furniture of the royal rooms: gilt-legged couches, low tables, footstools, chests, carpets in the manner of the Pazyryk
// carpet, braziers and lamp stands.
import { box, lathe, rod } from '../../core/geom.js';
import { rosette } from './reliefs.js';

const C = 'marble_dark', S = 'limestone_persian', W = 'plaster_persian';
const CLOTH = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'];

/**
 * A niche cut into the inner face of a wall: its recess `nd` deep between g0 and g1 (along the wall), the sill `sill` above the floor `y`
 * and `nh` high, lined and framed in dark stone — jambs, a lintel and the Egyptian cornice stepping out over it, a sill ledge — the wall
 * closed behind it. `bi` is the inner face's coordinate across the wall, `into` the way from it into the wall (+1/−1), `th` the wall's
 * thickness, `top` the wall's top.
 */
export function nicheCut(bag, { alongX, bi, into, th, g0, g1, y, sill, nh, nd, top }) {
  const Bn = (u0, u1, d0, d1, y0, y1, mat) => {
    const b0 = bi + into * d0, b1 = bi + into * d1, lo = Math.min(b0, b1), hi = Math.max(b0, b1);
    bag.add(mat, alongX ? box(u0, y0, lo, u1, y1, hi) : box(lo, y0, u0, hi, y1, u1));
  };
  const jl = 0.16, ys = y + sill, yt = ys + nh;
  Bn(g0, g1, 0, th, y, ys - 0.1, W);                               // the wall below, across its whole thickness
  Bn(g0, g1, nd, th, ys - 0.1, yt + 0.26, W);                      // the back of the recess
  Bn(g0, g1, 0, th, yt + 0.26, top, W);                            // the wall above
  Bn(g0, g0 + jl, -0.1, nd, ys, yt, C); Bn(g1 - jl, g1, -0.1, nd, ys, yt, C);                     // the jambs lining the recess, standing 10 cm out of the face
  Bn(g0 - 0.14, g0, -0.1, 0, ys - 0.1, yt, C); Bn(g1, g1 + 0.14, -0.1, 0, ys - 0.1, yt, C);      // their flanges on the wall
  Bn(g0, g1, -0.16, nd, ys - 0.1, ys, C);                                                      // the sill ledge
  Bn(g0 - 0.14, g1 + 0.14, -0.1, nd, yt, yt + 0.26, C);                                        // the lintel
  Bn(g0 - 0.24, g1 + 0.24, -0.2, -0.1, yt + 0.26, yt + 0.4, C);                                // the cornice: the roll
  Bn(g0 - 0.3, g1 + 0.3, -0.3, -0.2, yt + 0.4, yt + 0.5, C);                                   // and the gorge's fillet
  Bn(g0, g1, nd - 0.03, nd, ys, yt, 'paint_blue');                                             // the back painted, as the portico bull's skin was
}

/**
 * The dress of one stretch (a0…a1 along the wall) of an inner face: the stone dado with its dark ledge, the glazed band under the ceiling
 * (a lapis field between white edges, yellow rosettes) and, between the niches, hangings of dyed cloth on a gilt rod. `kPrev`, `kNext` say
 * what bounds the stretch ('door', 'niche', 'window' or 'corner').
 */
export function wallDress(bag, { alongX, bi, into, y, h, a0, a1, kPrev, kNext, seed = 1, hang = false, band = true }) {
  const mg = (k) => (k === 'door' ? 1.2 : k === 'corner' ? 0.05 : 0.5);
  const u0 = a0 + mg(kPrev), u1 = a1 - mg(kNext);
  if (u1 - u0 < 0.9) return;
  const Bx = (p0, p1, d0, d1, y0, y1, mat) => {
    const b0 = bi - into * d0, b1 = bi - into * d1, lo = Math.min(b0, b1), hi = Math.max(b0, b1);
    bag.add(mat, alongX ? box(p0, y0, lo, p1, y1, hi) : box(lo, y0, p0, hi, y1, p1));
  };
  const place = (u, v, w) => (alongX ? [u, v, bi - into * w] : [bi - into * w, v, u]);
  Bx(u0, u1, 0, 0.07, y, y + 0.95, S);
  Bx(u0 - 0.02, u1 + 0.02, 0, 0.11, y + 0.95, y + 1.03, C);
  if (band) {
    const bh = Math.min(2.9, h * 0.26), yb1 = y + h - 0.5, yb0 = yb1 - bh;
    Bx(u0, u1, 0, 0.045, yb0, yb1, 'glaze_lapis');
    Bx(u0, u1, 0, 0.06, yb0, yb0 + 0.07, 'glaze_white'); Bx(u0, u1, 0, 0.06, yb1 - 0.07, yb1, 'glaze_white');
    Bx(u0, u1, 0, 0.055, yb0 + bh * 0.2, yb0 + bh * 0.2 + 0.05, 'glaze_yellow'); Bx(u0, u1, 0, 0.055, yb1 - bh * 0.2 - 0.05, yb1 - bh * 0.2, 'glaze_yellow');
    const n = Math.max(1, Math.floor((u1 - u0) / (bh * 0.62)));
    for (let i = 0; i < n; i++) rosette(bag, 'glaze_yellow', (u, v, w) => place(u, v, w + 0.045), u0 + (i + 0.5) * (u1 - u0) / n, (yb0 + yb1) / 2, bh * 0.27, 0.035);
  }
  if (hang && u1 - u0 > 4.6) {
    // a hanging in the stretch's middle: a field of one dye, a border of another, a gilt rod it hangs from
    const w = Math.min(3.6, (u1 - u0) - 1.6), c = (u0 + u1) / 2, yh1 = y + 4.6, yh0 = y + 1.3;
    const k = (seed + Math.floor(c)) % 4, f = CLOTH[k], g = CLOTH[(k + 1 + (seed % 2)) % 4];
    Bx(c - w / 2, c + w / 2, 0.075, 0.115, yh0, yh1, g);
    Bx(c - w / 2 + 0.2, c + w / 2 - 0.2, 0.115, 0.14, yh0 + 0.2, yh1 - 0.35, f);
    Bx(c - w / 2 + 0.32, c + w / 2 - 0.32, 0.14, 0.15, yh0 + 0.35, yh1 - 0.5, 'cloth_white');
    for (let i = 0; i < 3; i++) Bx(c - w / 2 + 0.55 + i * (w - 1.1) / 2 - 0.12, c - w / 2 + 0.55 + i * (w - 1.1) / 2 + 0.12, 0.15, 0.17, (yh0 + yh1) / 2 - 0.45, (yh0 + yh1) / 2 + 0.4, g);
    const p = place(c - w / 2 - 0.08, yh1 + 0.08, 0.14), q = place(c + w / 2 + 0.08, yh1 + 0.08, 0.14);
    bag.add('gilt_bronze', rod(p, q, 0.035, 6));
    for (const e of [p, q]) bag.add('gilt_bronze', lathe([[0.001, 0], [0.06, 0.02], [0.05, 0.07], [0.001, 0.1]], 8, null, e[0] + (alongX ? (e === p ? -0.04 : 0.04) : 0) - 0, e[1] - 0.02, e[2] + (alongX ? 0 : (e === p ? -0.04 : 0.04))));
  }
}

/** The mapped footprint helper: a frame at (x, z) turned by a multiple of 90°; P(a, b) → world, Bx adds a box, rc a collider. */
function frame(bag, col, x, z, rot) {
  const c = Math.round(Math.cos(rot)), s = Math.round(Math.sin(rot));
  const P = (a, b) => [x + c * a - s * b, z + s * a + c * b];
  const R = (a0, a1, b0, b1) => { const p = P(a0, b0), q = P(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const Bx = (mat, a0, a1, b0, b1, y0, y1) => { const r = R(a0, a1, b0, b1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); };
  const solid = (a0, a1, b0, b1, y0, y1) => col.rect(R(a0, a1, b0, b1), y0, y1);
  return { P, R, Bx, solid };
}

const LEG = [[0.001, 0], [0.055, 0], [0.065, 0.05], [0.04, 0.11], [0.075, 0.19], [0.045, 0.27], [0.065, 0.34], [0.05, 0.4], [0.001, 0.4]];
const PAW = [[0.001, 0], [0.07, 0], [0.085, 0.04], [0.06, 0.1], [0.04, 0.16], [0.045, 0.36], [0.06, 0.4], [0.001, 0.4]];

/**
 * furnish: { y (the floor's top), items: [[kind, x, z, rot, opts], …] } — the furniture of a royal room. kinds: 'couch' (a bed to recline
 * on at the banquet: gilt turned legs, a frame, a mattress of dyed cloth, a bolster and a raised head; `cloth`), 'table' (a low table on
 * four lion-paw legs, a bronze bowl and a jug on it), 'stool' (a footstool, gilt, a cushion), 'chair' (a high-backed seat with lion-paw
 * legs), 'chest', 'carpet' ({ l, w } along the item's a and b), 'brazier' ({ lit }), 'stand' (a tall bronze lamp stand, `lit`).
 */
export function furnish(el, { bag, col, lights }) {
  const y = el.y;
  for (const [kind, x, z, rot = 0, o = {}] of el.items) {
    const F = frame(bag, col, x, z, rot), { P, Bx, solid } = F;
    if (kind === 'couch') {
      const f = o.cloth ?? 'cloth_red', g = o.cloth2 ?? 'cloth_ochre';
      for (const [a, b] of [[-0.92, -0.34], [-0.92, 0.34], [0.92, -0.34], [0.92, 0.34]]) { const p = P(a, b); bag.add('gilt_bronze', lathe(LEG, 10, null, p[0], y, p[1])); }
      Bx('timber', -1.05, 1.05, -0.425, 0.425, y + 0.4, y + 0.5);
      Bx('gilt_bronze', -1.07, 1.07, -0.445, -0.425, y + 0.4, y + 0.52); Bx('gilt_bronze', -1.07, 1.07, 0.425, 0.445, y + 0.4, y + 0.52);
      Bx(f, -1.0, 0.7, -0.4, 0.4, y + 0.5, y + 0.62);
      Bx(g, 0.7, 1.0, -0.38, 0.38, y + 0.5, y + 0.78);                                         // the bolster at the head
      Bx('gilt_bronze', 1.0, 1.07, -0.445, 0.445, y + 0.4, y + 0.95);                          // the raised head
      Bx('cloth_white', -1.0, -0.55, -0.4, 0.4, y + 0.62, y + 0.65);                           // a folded cover at the foot
      solid(-1.07, 1.07, -0.445, 0.445, y, y + 0.65);
    } else if (kind === 'table') {
      for (const [a, b] of [[-0.42, -0.27], [-0.42, 0.27], [0.42, -0.27], [0.42, 0.27]]) { const p = P(a, b); bag.add('gilt_bronze', lathe(PAW, 10, null, p[0], y, p[1])); }
      Bx('timber', -0.52, 0.52, -0.36, 0.36, y + 0.4, y + 0.46);
      Bx('gilt_bronze', -0.54, 0.54, -0.38, 0.38, y + 0.46, y + 0.49);
      const bw = P(-0.15, 0.05), jg = P(0.25, -0.1);
      bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.16, 0.06], [0.17, 0.09], [0.15, 0.09], [0.001, 0.03]], 12, null, bw[0], y + 0.49, bw[1]));
      bag.add('terracotta', lathe([[0.001, 0], [0.06, 0], [0.09, 0.1], [0.05, 0.2], [0.035, 0.26], [0.05, 0.28], [0.001, 0.27]], 10, null, jg[0], y + 0.49, jg[1]));
      solid(-0.54, 0.54, -0.38, 0.38, y, y + 0.5);
    } else if (kind === 'stool') {
      for (const [a, b] of [[-0.18, -0.12], [-0.18, 0.12], [0.18, -0.12], [0.18, 0.12]]) { const p = P(a, b); bag.add('gilt_bronze', rod([p[0], y, p[1]], [p[0], y + 0.26, p[1]], 0.03, 6)); }
      Bx('gilt_bronze', -0.24, 0.24, -0.18, 0.18, y + 0.26, y + 0.29);
      Bx(o.cloth ?? 'cloth_red', -0.22, 0.22, -0.16, 0.16, y + 0.29, y + 0.35);
      solid(-0.24, 0.24, -0.18, 0.18, y, y + 0.35);
    } else if (kind === 'chair') {
      // the seat turned toward +a: lion-paw legs, a cushioned seat, a tall back at −a, the footstool before it
      for (const [a, b] of [[-0.3, -0.3], [-0.3, 0.3], [0.3, -0.3], [0.3, 0.3]]) { const p = P(a, b); bag.add('gilt_bronze', lathe(PAW, 10, null, p[0], y, p[1])); }
      Bx('timber', -0.36, 0.36, -0.36, 0.36, y + 0.4, y + 0.47);
      Bx(o.cloth ?? 'cloth_red', -0.34, 0.34, -0.34, 0.34, y + 0.47, y + 0.56);
      Bx('timber', -0.36, -0.28, -0.36, 0.36, y + 0.47, y + 1.4);
      Bx('gilt_bronze', -0.38, -0.26, -0.38, 0.38, y + 1.32, y + 1.4);
      Bx('gilt_bronze', 0.5, 0.95, -0.2, 0.2, y, y + 0.2);
      Bx(o.cloth2 ?? 'cloth_ochre', 0.52, 0.93, -0.18, 0.18, y + 0.2, y + 0.25);
      solid(-0.38, 0.38, -0.38, 0.38, y, y + 1.4); solid(0.5, 0.95, -0.2, 0.2, y, y + 0.25);
    } else if (kind === 'chest') {
      const l = (o.l ?? 1.0) / 2, d = (o.d ?? 0.5) / 2, hh = o.h ?? 0.6;
      Bx('timber', -l, l, -d, d, y, y + hh);
      for (const a of [-l + 0.18, l - 0.18]) Bx('bronze', a - 0.025, a + 0.025, -d - 0.012, d + 0.012, y, y + hh + 0.01);
      Bx('bronze', -0.05, 0.05, -d - 0.02, -d, y + hh * 0.6, y + hh * 0.8);
      solid(-l, l, -d, d, y, y + hh);
    } else if (kind === 'carpet') {
      // after the Pazyryk carpet: an outer border, a band of another colour, an inner band, and a red field strewn with crossed lotus buds
      const l = (o.l ?? 4) / 2, w = (o.w ?? 3) / 2, a = o.border ?? 'cloth_indigo', b = o.band ?? 'cloth_ochre', f = o.field ?? 'cloth_red';
      Bx(a, -l, l, -w, w, y, y + 0.02);
      Bx(b, -l + 0.18, l - 0.18, -w + 0.18, w - 0.18, y + 0.02, y + 0.026);
      Bx(a, -l + 0.34, l - 0.34, -w + 0.34, w - 0.34, y + 0.026, y + 0.032);
      Bx(f, -l + 0.5, l - 0.5, -w + 0.5, w - 0.5, y + 0.032, y + 0.038);
      const nx = Math.max(1, Math.floor((2 * l - 1.2) / 0.7)), nz = Math.max(1, Math.floor((2 * w - 1.2) / 0.7));
      for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
        const ca = -l + 0.6 + (i + 0.5) * (2 * l - 1.2) / nx, cb = -w + 0.6 + (k + 0.5) * (2 * w - 1.2) / nz;
        Bx(b, ca - 0.11, ca + 0.11, cb - 0.025, cb + 0.025, y + 0.038, y + 0.043); Bx(b, ca - 0.025, ca + 0.025, cb - 0.11, cb + 0.11, y + 0.038, y + 0.043);
      }
    } else if (kind === 'brazier') {
      const p = P(0, 0);
      for (let k = 0; k < 3; k++) { const q = k * 2.0944 + 0.5; bag.add('bronze', rod([p[0] + Math.cos(q) * 0.3, y, p[1] + Math.sin(q) * 0.3], [p[0] + Math.cos(q) * 0.12, y + 0.7, p[1] + Math.sin(q) * 0.12], 0.025, 6)); }
      bag.add('bronze', lathe([[0.1, 0], [0.26, 0.06], [0.36, 0.2], [0.38, 0.24], [0.34, 0.24], [0.24, 0.14], [0.001, 0.08]], 14, null, p[0], y + 0.66, p[1]));
      bag.add('basalt', lathe([[0.001, 0], [0.3, 0.02], [0.001, 0.05]], 12, null, p[0], y + 0.84, p[1]));
      if (o.lit !== false) { bag.add('flame', lathe([[0.17, 0], [0.09, 0.14], [0.001, 0.32]], 8, null, p[0], y + 0.88, p[1])); if (o.light) lights?.push({ at: [p[0], y + 1.3, p[1]], color: '#ffb46b', intensity: 3.2, distance: 14 }); }
      col.circle(p[0], p[1], 0.38, y, y + 0.9);
    } else if (kind === 'stand') {
      const p = P(0, 0);
      bag.add('bronze', lathe([[0.001, 0], [0.2, 0], [0.22, 0.04], [0.12, 0.12], [0.045, 0.24], [0.045, 1.1], [0.09, 1.16], [0.045, 1.22], [0.045, 1.36], [0.15, 1.42], [0.17, 1.47], [0.12, 1.5], [0.001, 1.46]], 12, null, p[0], y, p[1]));
      if (o.lit !== false) { bag.add('flame', lathe([[0.07, 0], [0.04, 0.07], [0.001, 0.17]], 8, null, p[0], y + 1.5, p[1])); if (o.light) lights?.push({ at: [p[0], y + 1.8, p[1]], color: '#ffb46b', intensity: 2.2, distance: 12 }); }
      col.circle(p[0], p[1], 0.2, y, y + 1.5);
    }
  }
}
