// The wall and ceiling painting of Ajanta (docs/settlements/ajanta.md §3): thin coloured pieces laid on plaster by the
// generic Panel of the Dunhuang style (read-only import). The palette is the nearest existing materials: red ochre
// ground, yellow ochre, malachite and terre-verte green, lapis blue, lime white, lamp black; the figures brown.
import { Panel, rngOf } from '../dunhuang/paint.js';

export { Panel, rngOf };
export const PAL = { ground: 'clay_robe', ground2: 'cloth_maroon', ochre: 'paint_ochre', green: 'clay_green', green2: 'fresco_green', blue: 'egyptian_blue', blue2: 'paint_blue', white: 'paint_white', black: 'lacquer_black', skin: 'skin_medium', skin2: 'skin_dark', plaster: 'plaster_ochre', red: 'wall_red', cloth: 'cloth_white' };

/** A panel standing on the floor at the left end [x, z] of a wall whose room-side normal is n (u runs to the viewer's right). */
export function wall(bag, x, z, n, y, len, off = 0.04) {
  return Object.assign(new Panel(bag, [x + n[0] * off, y, z + n[1] * off], [n[1], 0, -n[0]], [0, 1, 0], [n[0], 0, n[1]]), { len });
}

/** A standing figure of the paintings, s the height in metres: a swayed stance, dhoti, bare chest with jewels, a high crown, a halo for the great. dir ±1 faces the way. */
export function figM(P, u, v, s, o = {}, L = 1) {
  const d = o.dir ?? 1, sk = o.skin ?? PAL.skin, dh = o.dhoti ?? PAL.white, sw = (o.sway ?? 0.06) * s;
  P.poly(dh, [[u - 0.13 * s + sw, v], [u + 0.13 * s + sw, v], [u + 0.1 * s, v + 0.5 * s], [u - 0.1 * s, v + 0.5 * s]], L);
  P.poly(sk, [[u - 0.1 * s, v + 0.5 * s], [u + 0.1 * s, v + 0.5 * s], [u + 0.085 * s - sw, v + 0.78 * s], [u - 0.085 * s - sw, v + 0.78 * s]], L + 1);
  P.disc(sk, u - sw, v + 0.86 * s, 0.07 * s, L + 2, 8);
  P.rect(PAL.black, u - sw - 0.07 * s, v + 0.88 * s, u - sw + 0.07 * s, v + 0.95 * s, L + 3);
  P.rect(o.crown ?? PAL.ochre, u - sw - 0.05 * s, v + 0.93 * s, u - sw + 0.05 * s, v + 1.0 * s, L + 3);
  P.rect(PAL.ochre, u - 0.07 * s, v + 0.68 * s, u + 0.07 * s, v + 0.72 * s, L + 3);
  P.line(sk, u + d * 0.09 * s, v + 0.74 * s, u + d * 0.2 * s, v + 0.56 * s, 0.035 * s, L + 2);
  if (o.halo) P.disc(o.halo, u - sw, v + 0.86 * s, 0.13 * s, L, 10);
}
/** A seated figure (a king, a monk) on a low seat, s the seated height. */
export function seatM(P, u, v, s, o = {}, L = 1) {
  const sk = o.skin ?? PAL.skin;
  P.poly(o.dhoti ?? PAL.ochre, [[u - 0.3 * s, v], [u + 0.3 * s, v], [u + 0.2 * s, v + 0.25 * s], [u - 0.2 * s, v + 0.25 * s]], L);
  P.poly(sk, [[u - 0.13 * s, v + 0.25 * s], [u + 0.13 * s, v + 0.25 * s], [u + 0.1 * s, v + 0.62 * s], [u - 0.1 * s, v + 0.62 * s]], L + 1);
  P.disc(sk, u, v + 0.73 * s, 0.09 * s, L + 2, 8);
  P.rect(PAL.black, u - 0.09 * s, v + 0.77 * s, u + 0.09 * s, v + 0.87 * s, L + 3);
  if (o.halo) P.disc(o.halo, u, v + 0.73 * s, 0.17 * s, L, 10);
}
/** The great bodhisattva (Padmapani, Vajrapani): over life size, the body swayed, a tall jewelled crown, a halo, a lotus held in the hand, small attendants at his feet. */
export function bodhiM(P, u, v, s, o = {}, L = 1) {
  const d = o.dir ?? 1, sk = o.skin ?? PAL.skin2, sw = 0.09 * s * d;
  P.disc(o.halo ?? PAL.green2, u + sw, v + 0.82 * s, 0.2 * s, L, 14);
  P.disc(PAL.ochre, u + sw, v + 0.82 * s, 0.17 * s, L + 1, 14);
  P.poly(o.dhoti ?? PAL.blue, [[u - 0.17 * s, v], [u + 0.17 * s, v], [u + 0.13 * s - sw * 0.4, v + 0.46 * s], [u - 0.13 * s - sw * 0.4, v + 0.46 * s]], L + 2);
  P.rect(PAL.ochre, u - 0.17 * s, v + 0.2 * s, u + 0.17 * s, v + 0.215 * s, L + 3);
  P.poly(sk, [[u - 0.12 * s - sw * 0.4, v + 0.46 * s], [u + 0.12 * s - sw * 0.4, v + 0.46 * s], [u + 0.1 * s + sw * 0.5, v + 0.72 * s], [u - 0.1 * s + sw * 0.5, v + 0.72 * s]], L + 3);
  P.poly(PAL.ochre, [[u - 0.1 * s + sw * 0.5, v + 0.62 * s], [u + 0.1 * s + sw * 0.5, v + 0.62 * s], [u + 0.07 * s + sw * 0.5, v + 0.58 * s], [u - 0.07 * s + sw * 0.5, v + 0.58 * s]], L + 4);
  P.disc(sk, u + sw, v + 0.8 * s, 0.065 * s, L + 4, 8);
  P.poly(PAL.black, [[u + sw - 0.07 * s, v + 0.83 * s], [u + sw + 0.07 * s, v + 0.83 * s], [u + sw + 0.05 * s, v + 0.9 * s], [u + sw - 0.05 * s, v + 0.9 * s]], L + 5);
  P.poly(o.crown ?? PAL.ochre, [[u + sw - 0.06 * s, v + 0.89 * s], [u + sw + 0.06 * s, v + 0.89 * s], [u + sw + 0.045 * s, v + 1.02 * s], [u + sw, v + 1.06 * s], [u + sw - 0.045 * s, v + 1.02 * s]], L + 5);
  P.line(PAL.green, u + 0.1 * s * d, v + 0.4 * s, u + 0.26 * s * d, v + 0.62 * s, 0.012 * s, L + 4);
  P.disc(PAL.white, u + 0.26 * s * d, v + 0.65 * s, 0.04 * s, L + 5, 8);
  P.disc(PAL.red, u + 0.26 * s * d, v + 0.65 * s, 0.02 * s, L + 6, 6);
  P.line(sk, u - 0.1 * s * d, v + 0.7 * s, u - 0.2 * s * d, v + 0.45 * s, 0.035 * s, L + 4);
  for (const k of [-1, 1]) figM(P, u + k * 0.4 * s, v, 0.38 * s, { dir: -k, dhoti: k > 0 ? PAL.green : PAL.ochre }, L + 2);
}
/** A band of lotus rosettes and flying geese (hamsa) on a ground, u0…u1, v0…v1. */
export function lotusBand(P, u0, u1, v0, v1, L = 1, k = 0) {
  const h = v1 - v0;
  P.rect(PAL.black, u0, v0, u1, v1, L);
  P.rect(PAL.ground2, u0, v0 + h * 0.08, u1, v1 - h * 0.08, L + 1);
  const step = h * 1.5, n = Math.max(1, Math.floor((u1 - u0) / step));
  for (let i = 0; i < n; i++) {
    const u = u0 + (i + 0.5) * (u1 - u0) / n, m = v0 + h / 2;
    if ((i + k) % 2) { P.disc(PAL.white, u, m, h * 0.34, L + 2, 10); P.disc(PAL.ochre, u, m, h * 0.18, L + 3, 8); for (let a = 0; a < 6; a++) P.ell(PAL.red, u + Math.cos(a) * h * 0.36, m + Math.sin(a) * h * 0.36, h * 0.12, h * 0.05, L + 2, 5, a); }
    else { P.ell(PAL.white, u, m, h * 0.3, h * 0.13, L + 2, 8); P.disc(PAL.white, u + h * 0.3, m + h * 0.08, h * 0.07, L + 2, 6); P.poly(PAL.ochre, [[u + h * 0.36, m + h * 0.08], [u + h * 0.46, m + h * 0.07], [u + h * 0.36, m + h * 0.05]], L + 3); P.line(PAL.white, u - h * 0.1, m, u - h * 0.3, m + h * 0.28, h * 0.08, L + 2); }
  }
}
/** A pavilion of the Jataka scenes: a plinth, two columns, a roofed hall with a curtain, a king and queen seated within. */
function pavilion(P, u, v, w, h, L, seed) {
  P.rect(PAL.ochre, u, v, u + w, v + h * 0.1, L);
  P.rect(PAL.ground2, u + w * 0.08, v + h * 0.1, u + w * 0.92, v + h * 0.72, L + 1);
  for (const x of [0.06, 0.94]) P.rect(PAL.white, u + w * x - 0.03, v + h * 0.1, u + w * x + 0.03, v + h * 0.78, L + 2);
  P.poly(PAL.green, [[u - w * 0.05, v + h * 0.72], [u + w * 1.05, v + h * 0.72], [u + w * 0.85, v + h * 0.92], [u + w * 0.15, v + h * 0.92]], L + 2);
  P.rect(PAL.red, u + w * 0.1, v + h * 0.6, u + w * 0.9, v + h * 0.72, L + 3);
  seatM(P, u + w * 0.38, v + h * 0.1, h * 0.55, { dhoti: PAL.blue, halo: null }, L + 3);
  seatM(P, u + w * 0.64, v + h * 0.1, h * 0.5, { dhoti: PAL.green2, skin: PAL.skin }, L + 3);
  void seed;
}
/** A Jataka band: courtyards of tiers of small figures, pavilions, trees, elephants' backs (u0…u1, v0…v1). */
export function jatakaM(P, u0, v0, u1, v1, seed = 1, L = 1) {
  const rand = rngOf(seed), W = u1 - u0, H = v1 - v0, cols = [PAL.white, PAL.blue, PAL.green, PAL.ochre, PAL.red];
  P.rect(PAL.black, u0, v0, u1, v1, L);
  P.rect(PAL.ground, u0 + 0.05, v0 + 0.05, u1 - 0.05, v1 - 0.05, L + 1);
  P.rect(PAL.ground2, u0 + 0.05, v0 + H * 0.55, u1 - 0.05, v1 - 0.05, L + 1);
  const nPav = Math.max(1, Math.round(W / 3.2));
  for (let i = 0; i < nPav; i++) pavilion(P, u0 + (i + 0.12 + rand() * 0.1) * W / nPav, v0 + H * 0.28, W / nPav * 0.62, H * 0.5, L + 2, i);
  // trees between them
  for (let i = 0; i < nPav + 1; i++) { const u = u0 + i * W / nPav + (rand() - 0.5) * 0.3; if (u < u0 + 0.2 || u > u1 - 0.2) continue; P.line(PAL.skin2, u, v0 + H * 0.12, u, v0 + H * 0.5, 0.05, L + 2); P.ell(PAL.green2, u, v0 + H * 0.62, 0.34, H * 0.18, L + 3, 8); P.ell(PAL.green, u + 0.1, v0 + H * 0.66, 0.24, H * 0.12, L + 4, 8); }
  // the crowd: two rows of small standing figures, all different
  const n = Math.round(W / 0.55);
  for (let i = 0; i < n; i++) {
    const u = u0 + 0.2 + (i + rand() * 0.6) * (W - 0.4) / n;
    figM(P, u, v0 + H * 0.06 + (i % 2) * 0.05, H * (0.28 + rand() * 0.08), { dhoti: cols[Math.floor(rand() * 5)], dir: rand() < 0.5 ? 1 : -1, sway: 0.03 + rand() * 0.09, crown: rand() < 0.3 ? PAL.white : PAL.ochre, skin: rand() < 0.4 ? PAL.skin2 : PAL.skin }, L + 5);
  }
  // an elephant or two in the foreground
  for (let i = 0; i < Math.floor(W / 5); i++) { const u = u0 + 1 + rand() * (W - 2.4), v = v0 + H * 0.08; P.ell(PAL.white, u + 0.4, v + 0.28, 0.42, 0.24, L + 6, 10); P.rect(PAL.white, u + 0.05, v, u + 0.14, v + 0.12, L + 6); P.rect(PAL.white, u + 0.64, v, u + 0.73, v + 0.12, L + 6); P.poly(PAL.white, [[u + 0.76, v + 0.34], [u + 0.95, v + 0.25], [u + 0.97, v + 0.05], [u + 0.9, v + 0.05], [u + 0.86, v + 0.2], [u + 0.74, v + 0.18]], L + 6); }
}
/** The ceiling's painted panel (a square u × v): a black and red field of nested squares with a lotus medallion, geese and animals at its edges. */
export function ceilingM(P, a, b, seed = 1, L = 1) {
  const rand = rngOf(seed), cu = a / 2, cv = b / 2;
  P.rect(PAL.black, 0, 0, a, b, L);
  P.rect(PAL.ground, 0.06, 0.06, a - 0.06, b - 0.06, L + 1);
  P.rect(PAL.ground2, a * 0.14, b * 0.14, a * 0.86, b * 0.86, L + 2);
  P.disc(PAL.ochre, cu, cv, Math.min(a, b) * 0.32, L + 3, 16);
  P.disc(PAL.white, cu, cv, Math.min(a, b) * 0.26, L + 4, 16);
  for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2, r = Math.min(a, b) * 0.2; P.ell(k % 2 ? PAL.red : PAL.blue, cu + Math.cos(t) * r, cv + Math.sin(t) * r, Math.min(a, b) * 0.07, Math.min(a, b) * 0.03, L + 5, 6, t); }
  P.disc(PAL.green, cu, cv, Math.min(a, b) * 0.08, L + 6, 8);
  for (let k = 0; k < 4; k++) { const u = a * (0.07 + 0.86 * (k % 2)), v = b * (0.07 + 0.86 * (k >> 1)); P.disc(rand() < 0.5 ? PAL.white : PAL.ochre, u, v, a * 0.04, L + 3, 7); }
  for (let k = 0; k < 6; k++) P.ell(rand() < 0.5 ? PAL.white : PAL.green2, a * (0.2 + rand() * 0.6), b * (0.04 + (k % 2) * 0.92), a * 0.05, b * 0.018, L + 3, 6);
}
/** A seated Buddha of the niches and walls (mandorla, halo, a robe over one shoulder, the hands in the teaching gesture), s ≈ 1 m seated height. */
export function buddhaM(P, u, v, s, pal = {}, L = 1) {
  P.ell(pal.mand ?? PAL.green2, u, v + 0.55 * s, 0.38 * s, 0.55 * s, L, 14);
  P.disc(PAL.ochre, u, v + 0.72 * s, 0.18 * s, L + 1, 12);
  P.poly(pal.robe ?? PAL.ochre, [[u - 0.3 * s, v + 0.05 * s], [u + 0.3 * s, v + 0.05 * s], [u + 0.22 * s, v + 0.3 * s], [u - 0.22 * s, v + 0.3 * s]], L + 2);
  P.poly(pal.robe ?? PAL.ochre, [[u - 0.15 * s, v + 0.3 * s], [u + 0.15 * s, v + 0.3 * s], [u + 0.11 * s, v + 0.62 * s], [u - 0.11 * s, v + 0.62 * s]], L + 2);
  P.disc(PAL.skin, u, v + 0.72 * s, 0.07 * s, L + 3, 8);
  P.ell(PAL.black, u, v + 0.78 * s, 0.065 * s, 0.03 * s, L + 4, 6);
  P.ell(PAL.green, u, v + 0.04 * s, 0.34 * s, 0.05 * s, L + 1, 8);
}
