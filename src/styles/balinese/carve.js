// The carved stone of the Balinese village (docs/settlements/bali-village.md §11): scroll fields (pepatraan), the Bhoma face over the roofed gate, the elephant-head corner
// ornament (karang gajah), the guardian figure (dvarapala), the lotus finial, the turtle and serpents of the padmasana. Everything is built in a face frame (u across, v up,
// n out of the face) turned to any of the four world directions, from boxes, lathes and rods: no textures, one geometry bag per material.
import { lathe, rod } from '../../core/geom.js';
import { bx, rng, TAU } from './kit.js';

/** A ball (a lathe of a half circle) of radius r whose centre is at (x, y, z); sy squashes it. */
export function ball(ctx, mat, x, y, z, r, seg = 8, sy = 1) {
  const prof = [];
  for (let i = 0; i <= 4; i++) { const a = -Math.PI / 2 + Math.PI * i / 4; prof.push([Math.max(0.001, Math.cos(a) * r), r * sy + Math.sin(a) * r * sy]); }
  ctx.bag.add(mat, lathe(prof, seg, null, x, y - r * sy, z));
}

/**
 * A frame on a face: (cx, cz) the face's centre in plan, face ('s' | 'n' | 'e' | 'w') the way it looks. P(u, n) → world [x, z]; B a box in (u, v, n); rodF a rod between
 * [u, v, n] points; ballF, lathF a ball or a lathe at (u, v, n).
 */
export function frame(ctx, cx, cz, face = 's') {
  const P = (u, n) => (face === 's' ? [cx + u, cz + n] : face === 'n' ? [cx - u, cz - n] : face === 'e' ? [cx + n, cz - u] : [cx - n, cz + u]);
  const B = (mat, u0, v0, n0, u1, v1, n1, solid = false) => { const a = P(u0, n0), b = P(u1, n1); bx(ctx, mat, Math.min(a[0], b[0]), v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), v1, Math.max(a[1], b[1]), solid); };
  const rodF = (mat, a, b, r, seg = 5) => { const p = P(a[0], a[2]), q = P(b[0], b[2]); ctx.bag.add(mat, rod([p[0], a[1], p[1]], [q[0], b[1], q[1]], r, seg)); };
  const ballF = (mat, u, v, n, r, seg = 8, sy = 1) => { const p = P(u, n); ball(ctx, mat, p[0], v, p[1], r, seg, sy); };
  const lathF = (mat, prof, u, v, n, seg = 8, mod = null) => { const p = P(u, n); ctx.bag.add(mat, lathe(prof, seg, mod, p[0], v, p[1])); };
  return { P, B, rodF, ballF, lathF };
}

/** A spiral scroll (ukel) in the face plane at (u, v), n out of the face; dir ±1 the way it winds. */
export function ukel(F, mat, u, v, n, r, dir = 1, rad = 0.018, turns = 1.35) {
  let prev = null;
  const N = 7;
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = dir * t * turns * TAU + (dir > 0 ? 0 : Math.PI), rr = r * (1 - 0.72 * t), q = [u + Math.cos(a) * rr, v + Math.sin(a) * rr, n];
    if (prev) F.rodF(mat, prev, q, rad * (1 - 0.4 * t));
    prev = q;
  }
}

/**
 * A framed field of carved scrolls on a face: the field's plane is at n (the face's surface), the frame stands 0.06 proud, the scrolls 0.05; the scrolls in rows, alternately
 * turned, a bud between. u0..u1 across, v0..v1 up (world heights).
 */
export function patraField(F, mat, ground, u0, v0, u1, v1, n = 0, cell = 0.34) {
  const rim = 0.07, w = u1 - u0, h = v1 - v0;
  if (w < 0.5 || h < 0.4) return;
  F.B(ground, u0, v0, n, u1, v1, n + 0.02);
  F.B(mat, u0, v0, n, u1, v0 + rim, n + 0.06); F.B(mat, u0, v1 - rim, n, u1, v1, n + 0.06);
  F.B(mat, u0, v0 + rim, n, u0 + rim, v1 - rim, n + 0.06); F.B(mat, u1 - rim, v0 + rim, n, u1, v1 - rim, n + 0.06);
  const iw = w - 2 * rim - 0.06, ih = h - 2 * rim - 0.06, cols = Math.max(1, Math.round(iw / cell)), rows = Math.max(1, Math.round(ih / cell)), cw = iw / cols, ch = ih / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const cu = u0 + rim + 0.03 + (i + 0.5) * cw, cv = v0 + rim + 0.03 + (j + 0.5) * ch, r = Math.min(cw, ch) * 0.38, dir = (i + j) % 2 ? 1 : -1;
    ukel(F, mat, cu, cv, n + 0.03, r, dir);
    F.ballF(mat, cu + dir * r * 0.05, cv, n + 0.04, 0.026, 5);
  }
}

/**
 * The Bhoma face over the roofed gate's opening, on the face at (cx, cz) looking `face`, standing on y0, its back at n: a slab with a flame-edged top, hair in scrolls,
 * a heavy brow, bulging eyes, a stepped nose, cheeks, an upper jaw of teeth and two long fangs and no lower jaw, a clawed hand either side of the mouth. 2.2 m wide, 1.6 high.
 */
export function bhoma(ctx, cx, y0, cz, face = 's', n = 0) {
  const F = frame(ctx, cx, cz, face), T = 'tuff_hewn', D = 'wood_dark', W = 'plaster_white', K = 'basalt';
  const B = (m, u0, v0, n0, u1, v1, n1) => F.B(m, u0, y0 + v0, n + n0, u1, y0 + v1, n + n1);
  B(K, -1.1, 0, 0, 1.1, 1.5, 0.08);
  for (let i = -4; i <= 4; i++) B(T, i * 0.24 - 0.09, 1.5, 0, i * 0.24 + 0.09, 1.5 + 0.1 + 0.12 * (1 - Math.abs(i) / 4), 0.08);
  // the hair: scrolls over the brow and a great curl either side
  for (const s of [-1, 1]) { ukel(F, T, s * 0.78, y0 + 1.18, n + 0.1, 0.24, s, 0.03); ukel(F, T, s * 0.36, y0 + 1.3, n + 0.1, 0.15, -s, 0.026); }
  B(T, -0.75, 0.92, 0.08, 0.75, 1.04, 0.26); B(T, -0.62, 1.04, 0.08, 0.62, 1.12, 0.2);
  // eyes: dark sockets, bulging whites, pupils
  for (const s of [-1, 1]) {
    B(D, Math.min(s * 0.14, s * 0.5), 0.68, 0.08, Math.max(s * 0.14, s * 0.5), 0.92, 0.12);
    F.ballF(W, s * 0.31, y0 + 0.8, n + 0.15, 0.12, 8); F.ballF(D, s * 0.31, y0 + 0.8, n + 0.26, 0.05, 6);
  }
  // nose, nostrils, cheeks
  B(T, -0.14, 0.6, 0.08, 0.14, 0.92, 0.3); B(T, -0.3, 0.5, 0.08, 0.3, 0.64, 0.28);
  for (const s of [-1, 1]) { B(D, s * 0.17 - 0.05, 0.52, 0.28, s * 0.17 + 0.05, 0.58, 0.3); B(T, s * 0.5, 0.42, 0.08, s * 0.8, 0.66, 0.2); F.ballF(T, s * 0.66, y0 + 0.54, n + 0.2, 0.1, 6, 0.8); }
  // the mouth: dark cavity, upper lip, the row of teeth, two fangs
  B(D, -0.7, 0.04, 0.06, 0.7, 0.46, 0.09); B(T, -0.78, 0.46, 0.08, 0.78, 0.58, 0.22);
  for (let i = 0; i < 8; i++) { const u = -0.63 + i * 0.18; B(W, u - 0.05, 0.32, 0.09, u + 0.05, 0.46, 0.13); }
  for (const s of [-1, 1]) F.lathF(W, [[0.001, 0], [0.04, 0.12], [0.065, 0.4]], s * 0.46, y0 + 0.06, n + 0.14, 6);
  // the clawed hands at the mouth's corners
  for (const s of [-1, 1]) {
    B(T, s * 0.8 - 0.1, 0.12, 0.08, s * 0.8 + 0.1, 0.44, 0.2);
    for (const q of [-0.07, 0, 0.07]) F.rodF(W, [s * 0.8 + q, y0 + 0.44, n + 0.15], [s * 0.8 + q * 1.6, y0 + 0.68, n + 0.2], 0.026);
  }
}

/** A karang gajah: the elephant head carved at a corner — brow and ear, an eye, tusks, the trunk curling down and in. At u, v (the head's base), n the face's surface. */
export function karangGajah(ctx, cx, cz, face, u, v, n = 0, s = 1) {
  const F = frame(ctx, cx, cz, face), T = 'tuff_hewn', W = 'plaster_white';
  F.B(T, u - 0.26, v + 0.34, n, u + 0.26, v + 0.68, n + 0.2);           // the forehead and brow
  F.B(T, u + s * 0.22, v + 0.2, n, u + s * 0.46, v + 0.7, n + 0.07);     // the ear
  F.ballF(W, u - s * 0.1, v + 0.52, n + 0.2, 0.06, 6); F.ballF('wood_dark', u - s * 0.1, v + 0.52, n + 0.26, 0.028, 5);
  F.B(T, u - 0.09, v + 0.1, n, u + 0.09, v + 0.36, n + 0.16);           // the trunk, falling
  F.rodF(T, [u, v + 0.12, n + 0.13], [u - s * 0.1, v + 0.02, n + 0.14], 0.07);
  F.rodF(T, [u - s * 0.1, v + 0.02, n + 0.14], [u - s * 0.2, v + 0.1, n + 0.13], 0.06);
  for (const q of [-1, 1]) F.rodF(W, [u + q * 0.16, v + 0.36, n + 0.15], [u + q * 0.2, v + 0.1, n + 0.19], 0.028);
}

/** A lotus bud (the murdha at the summit of a gate or a shrine): a ribbed bud on a stem, a gilded tip. */
export function lotusFinial(ctx, x, y, z, r = 0.2) {
  const rib = (th, i) => (i >= 2 ? 1 + 0.13 * Math.cos(8 * th) : 1);
  ctx.bag.add('tuff_hewn', lathe([[0.001, 0], [r * 1.2, 0], [r * 1.0, 0.1], [r * 0.5, 0.14], [r * 1.15, 0.36], [r * 1.2, 0.58], [r * 0.8, 0.85], [r * 0.3, 1.05]], 12, rib, x, y, z));
  ctx.bag.add('gilt_bronze', lathe([[0.001, 1.05], [r * 0.3, 1.05], [r * 0.12, 1.25], [0.001, 1.4]], 8, null, x, y, z));
}

/** A flame finial: the small pointed ornament at a tier's corner. */
export function flame(ctx, x, y, z, h = 0.22, r = 0.07) {
  ctx.bag.add('tuff_hewn', lathe([[0.001, 0], [r, 0], [r * 0.7, h * 0.35], [r * 0.95, h * 0.55], [0.001, h]], 6, null, x, y, z));
}

/**
 * A guardian (dvarapala) at (x, z) on the ground y, looking `face`: a stepped plinth, a squat figure with legs apart, a belly with the poleng cloth, one hand on the club before
 * it, a bulging-eyed head with moustache and fangs, a tall pointed headdress. h the whole height.
 */
export function dwarapala(ctx, x, z, y, h = 1.4, face = 's') {
  const F = frame(ctx, x, z, face), T = 'tuff_hewn', S = h / 1.4;
  const B = (m, u0, v0, n0, u1, v1, n1, solid = false) => F.B(m, u0 * S, y + v0 * S, n0 * S, u1 * S, y + v1 * S, n1 * S, solid);
  B(T, -0.34, 0, -0.34, 0.34, 0.38, 0.34, true); B('andesite', -0.38, 0, -0.38, 0.38, 0.1, 0.38); B(T, -0.3, 0.38, -0.3, 0.3, 0.46, 0.3);
  const L = (m, prof, u, v, n, seg = 8) => F.lathF(m, prof.map(([r, yy]) => [r * S, yy * S]), u * S, y + v * S, n * S, seg);
  // legs, bent and apart, feet turned out; the kain between them
  for (const s of [-1, 1]) {
    B(T, s * 0.1, 0.46, -0.1, s * 0.25, 0.8, 0.1); B(T, s * 0.1, 0.46, 0.0, s * 0.27, 0.52, 0.24);
    F.rodF(T, [s * 0.18 * S, y + 0.78 * S, 0.0], [s * 0.26 * S, y + 0.64 * S, 0.12 * S], 0.07 * S);
  }
  L(T, [[0.18, 0], [0.26, 0.08], [0.2, 0.3]], 0, 0.78, 0, 8);                        // the belly over the cloth
  L(T, [[0.001, 0], [0.2, 0.0], [0.25, 0.14], [0.2, 0.34], [0.001, 0.38]], 0, 0.84, 0, 8);
  ctx.bag.add('cloth_black', lathe([[0.2 * S + 0.03, 0], [0.2 * S + 0.03, 0.08 * S]], 8, (th) => (Math.floor(th / TAU * 8) % 2 ? 1 : 0.001), F.P(0, 0)[0], y + 0.78 * S, F.P(0, 0)[1]));
  ctx.bag.add('cloth_white', lathe([[0.2 * S + 0.03, 0], [0.2 * S + 0.03, 0.08 * S]], 8, (th) => (Math.floor(th / TAU * 8) % 2 ? 0.001 : 1), F.P(0, 0)[0], y + 0.78 * S, F.P(0, 0)[1]));
  // arms: the right bent to the club, the left on the hip; the club upright before the figure
  B(T, 0.27, 1.0, -0.06, 0.37, 1.18, 0.06); B(T, 0.3, 0.9, 0.04, 0.4, 1.02, 0.22);
  B(T, -0.38, 1.02, -0.06, -0.28, 1.18, 0.06); B(T, -0.4, 0.88, -0.06, -0.3, 1.04, 0.06);
  F.rodF(T, [0.35 * S, y + 0.5 * S, 0.26 * S], [0.35 * S, y + 1.3 * S, 0.26 * S], 0.045 * S);
  F.ballF(T, 0.35 * S, y + 1.36 * S, 0.26 * S, 0.1 * S, 7);
  // the head, eyes, brows, moustache, fangs, the headdress
  F.ballF(T, 0, y + 1.28 * S, 0.0, 0.17 * S, 8, 1.0);
  for (const s of [-1, 1]) { F.ballF('plaster_white', s * 0.07 * S, y + 1.31 * S, 0.14 * S, 0.04 * S, 6); F.ballF('wood_dark', s * 0.07 * S, y + 1.31 * S, 0.175 * S, 0.018 * S, 5); }
  B('hair_dark', -0.13, 1.36, 0.1, 0.13, 1.4, 0.16); B('hair_dark', -0.15, 1.2, 0.1, 0.15, 1.24, 0.17);
  for (const s of [-1, 1]) B('plaster_white', s * 0.06 - 0.012, 1.14, 0.12, s * 0.06 + 0.012, 1.2, 0.15);
  L(T, [[0.001, 0], [0.15, 0.0], [0.13, 0.12], [0.07, 0.28], [0.001, 0.36]], 0, 1.4, -0.02, 8);
  ctx.bag.add('gilt_bronze', lathe([[0.152 * S, 0], [0.152 * S, 0.03 * S]], 8, null, F.P(0, -0.02 * S)[0], y + 1.41 * S, F.P(0, -0.02 * S)[1]));
}

/** The turtle Bedawang Nala with its two serpents coiled round it, at (cx, cz) on y, the head toward the front (+z of the frame `face`). r the shell's radius at its foot. */
export function bedawang(ctx, cx, cz, y, r = 1.0, face = 's') {
  const F = frame(ctx, cx, cz, face), rib = (th, i) => (i >= 1 ? 1 + 0.06 * Math.cos(6 * th) : 1);
  ctx.bag.add('basalt', lathe([[r, 0], [r * 1.02, 0.1], [r * 0.96, 0.27], [r * 0.78, 0.44], [r * 0.64, 0.54], [r * 0.62, 0.6]], 12, rib, cx, y, cz));
  F.B('basalt', -0.2, y + 0.06, r * 0.8, 0.2, y + 0.34, r * 1.2);            // the head
  F.ballF('basalt', 0, y + 0.32, r * 1.22, 0.16, 7); F.ballF('plaster_white', -0.1, y + 0.36, r * 1.34, 0.035, 5); F.ballF('plaster_white', 0.1, y + 0.36, r * 1.34, 0.035, 5);
  for (const s of [-1, 1]) { F.B('basalt', s * r * 0.8, y + 0.04, r * 0.4, s * r * 1.15, y + 0.2, r * 0.7); F.B('basalt', s * r * 0.8, y + 0.04, -r * 0.7, s * r * 1.15, y + 0.2, -r * 0.4); }
  // the serpents: two coils each round the shell, the heads raised at the front corners, crowned
  for (const s of [-1, 1]) {
    for (const [k, rr, yy] of [[0, r * 1.0, 0.2], [1, r * 0.86, 0.38]]) {
      const N = 14;
      for (let i = 0; i < N; i++) {
        const a0 = (s > 0 ? 0 : Math.PI) + (i / N) * Math.PI * 0.95 + k * 0.5, a1 = (s > 0 ? 0 : Math.PI) + ((i + 1) / N) * Math.PI * 0.95 + k * 0.5;
        const p = F.P(Math.cos(a0) * rr * 1.03, Math.sin(a0) * rr * 1.03), q = F.P(Math.cos(a1) * rr * 1.03, Math.sin(a1) * rr * 1.03);
        ctx.bag.add('wood_dark', rod([p[0], y + yy + 0.02 * k, p[1]], [q[0], y + yy + 0.02 * k, q[1]], 0.075 - 0.01 * k, 5));
      }
    }
    const hp = F.P(s * r * 0.55, r * 0.85);
    ctx.bag.add('wood_dark', rod([hp[0], y + 0.34, hp[1]], [hp[0], y + 0.74, hp[1]], 0.075, 6));
    ball(ctx, 'wood_dark', hp[0], y + 0.8, hp[1], 0.12, 7);
    ctx.bag.add('gilt_bronze', lathe([[0.1, 0], [0.07, 0.08], [0.001, 0.2]], 6, null, hp[0], y + 0.88, hp[1]));
  }
}

/** The relief panels for a flat of masonry: returns nothing; convenience for the stone code (a frame on the face centred at (cx, cz)). */
export function panel(ctx, cx, cz, face, u0, v0, u1, v1, n = 0, cell = 0.34) {
  const F = frame(ctx, cx, cz, face);
  patraField(F, 'tuff_hewn', 'andesite', u0, v0, u1, v1, n, cell);
}

void rng;
