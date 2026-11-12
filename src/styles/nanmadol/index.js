// The architecture of Nan Madol, c. 1300 (docs/settlements/nan-madol.md §4–§8): crib walls of columnar basalt
// (crib.js), the retaining walls of the islets, the royal mortuary Nandauwas with its tomb, the nahs of the
// islets — a platform of stacked basalt, posts, three half-walls of lashed reed and one open end under a deep
// hip roof of ivory-palm thatch —, cook-houses with their earth ovens, outrigger canoes, mangroves, the
// sakau stone. Elements are pure functions of their data; the settlement (src/settlements/nan-madol/) places them.

import { registerStyle } from '../../core/build.js';
import { box, lathe, frustum, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { subtractRects } from '../../core/build.js';
import { cribWall, cribCollide, laid, rng, R, C, ROCK } from './crib.js';
import { canoe } from './canoe.js';
import { yard, works, tomb_court, wall_dress, post, weir } from './dress.js';
import { plants, taro_bed } from './plants.js';
import { court } from './court.js';

const TH = 'thatch_palm', ROPE = 'rope_fibre', WOOD = 'palm_trunk';
const dirOf = (yaw) => { const dx = Math.round(Math.sin(yaw)), dz = Math.round(Math.cos(yaw)); return dz > 0 ? 's' : dz < 0 ? 'n' : dx > 0 ? 'e' : 'w'; };
/** A local frame at (cx, cz) turned by yaw (multiples of a quarter turn): map local (u, v) to the plan, and place geometry. */
function frame(c, yaw, y0 = 0) {
  const ca = Math.cos(yaw), sa = Math.sin(yaw), M = new Matrix4().makeRotationY(yaw).setPosition(c[0], y0, c[1]);
  return { W: (u, v) => [c[0] + u * ca + v * sa, c[1] - u * sa + v * ca], M };
}

// ── walls ─────────────────────────────────────────────────────────────────────────────────────────
/** crib_wall { a, b, y0, th, top, seed, sides, ends, proj, collide } (see crib.js). */
function crib_wall(el, { bag, col }) {
  cribWall(bag, el);
  if (el.collide !== false) cribCollide(col, el, el.ends ?? null);
}
/**
 * islet_wall { a, b, out: [nx, nz], seed }: the retaining wall of an islet along one stretch of its edge — three courses of heavy
 * columns standing 0.12 m outside the edge, headers and stretchers, the top 10 cm over the islet's surface.
 */
function islet_wall(el, { bag }) {
  const [a, b] = [el.a, el.b], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  const [nx, nz] = el.out, s = Math.sign(-uz * nx + ux * nz) || 1, th = 0.9, off = th / 2 - 0.12;
  const A = [a[0] - nx * off, a[1] - nz * off], B = [b[0] - nx * off, b[1] - nz * off];
  const r = 0.34, c = r * Math.sqrt(3) + 0.03, e = el.ends ?? [0, 0];
  cribWall(bag, { a: A, b: B, y0: 0.1 - 3 * c, th, top: 3 * c, seed: el.seed ?? 1, sides: [s], ends: e, proj: 1, r, depth: th - 0.05, reach: 170 });
  void C; void R;
}
/** steps { a, b, out, n }: landing steps at an islet's edge between a and b, going down toward the water (out). */
function steps(el, { bag }) {
  const [a, b] = [el.a, el.b], [nx, nz] = el.out, n = el.n ?? 3, d = 0.55;
  const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
  for (let k = 0; k < n; k++) {
    const top = -0.35 - k * 0.5, o0 = 0.12 + k * d, o1 = o0 + d;
    const px0 = nx > 0 ? x1 + o0 - 0.12 : nx < 0 ? x0 - o1 + 0.12 : x0, px1 = nx > 0 ? x1 + o1 - 0.12 : nx < 0 ? x0 - o0 + 0.12 : x1;
    const pz0 = nz > 0 ? z1 + o0 - 0.12 : nz < 0 ? z0 - o1 + 0.12 : z0, pz1 = nz > 0 ? z1 + o1 - 0.12 : nz < 0 ? z0 - o0 + 0.12 : z1;
    bag.add(ROCK[k % 4], box(px0, top - 0.5, pz0, px1, top, pz1));
  }
}
/** ford { c, axis, len, w }: the kerb of columns along both sides of a causeway across a canal, awash at its middle. */
function ford(el, { bag }) {
  const [x, z] = el.c, hl = Math.max(0.5, el.len / 2 - 2.8), w = el.w / 2 + 0.25, top = -0.78;
  for (const s of [-1, 1]) {
    if (el.axis === 'x') bag.add('granite_black', box(x - hl, -2.2, z + s * w - 0.2 + (s > 0 ? 0.0 : 0), x + hl, top, z + s * w + 0.2));
    else bag.add('granite_black', box(x + s * w - 0.2, -2.2, z - hl, x + s * w + 0.2, top, z + hl));
  }
}

// ── the tomb of Nandauwas ───────────────────────────────────────────────────────────────────────
/**
 * tomb { rect, h, pit, roof, ramp, stair, seed }: a platform of laid columns (its sides crib walls, its top a skin of coral
 * gravel) standing h over the court, a crypt cut into it — open at its south end where a stair goes down, its north part roofed
 * with columns laid across — and a stair up the platform's south face.
 */
function tomb(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 2.4, [px0, pz0, px1, pz1] = el.pit, roofZ = el.roofZ, seed = el.seed ?? 5;
  const th = 1.5, top = (u) => h - 0.1;
  cribWall(bag, { a: [x0 + th / 2, z0 + th / 2], b: [x1 - th / 2, z0 + th / 2], y0: 0, th, top: h - 0.1, seed, ends: [th / 2, th / 2], proj: 0, core: false, sides: [-1] });
  cribWall(bag, { a: [x0 + th / 2, z1 - th / 2], b: [x1 - th / 2, z1 - th / 2], y0: 0, th, top: h - 0.1, seed: seed + 1, ends: [th / 2, th / 2], proj: 1, core: false, sides: [1] });
  cribWall(bag, { a: [x0 + th / 2, z0 + th / 2], b: [x0 + th / 2, z1 - th / 2], y0: 0, th, top: h - 0.1, seed: seed + 2, ends: [th / 2, th / 2], proj: 1, core: false, sides: [1] });
  cribWall(bag, { a: [x1 - th / 2, z0 + th / 2], b: [x1 - th / 2, z1 - th / 2], y0: 0, th, top: h - 0.1, seed: seed + 3, ends: [th / 2, th / 2], proj: 0, core: false, sides: [-1] });
  // the fill: coral rubble up to the skin, round the crypt
  for (const r of subtractRects([x0 + 0.05, z0 + 0.05, x1 - 0.05, z1 - 0.05], [[px0 - 0.62, pz0 - 0.62, px1 + 0.62, pz1 + 0.62]])) bag.add('coral_rag', box(r[0], 0, r[1], r[2], h - 0.1, r[3]));
  // the crypt's lining: stretcher courses facing in
  const lw = 0.62;
  cribWall(bag, { a: [px0 - lw / 2, pz0 - lw / 2], b: [px1 + lw / 2, pz0 - lw / 2], y0: 0, th: lw, top: h - 0.1, seed: seed + 4, ends: [0, 0], core: false, sides: [1], depth: 0.5 });
  cribWall(bag, { a: [px0 - lw / 2, pz0 - lw / 2], b: [px0 - lw / 2, pz1 + lw / 2], y0: 0, th: lw, top: h - 0.1, seed: seed + 5, ends: [0, 0], core: false, sides: [-1], depth: 0.5 });
  cribWall(bag, { a: [px1 + lw / 2, pz0 - lw / 2], b: [px1 + lw / 2, pz1 + lw / 2], y0: 0, th: lw, top: h - 0.1, seed: seed + 6, ends: [0, 0], core: false, sides: [1], depth: 0.5 });
  // the skin of gravel over the platform, round the opening
  const open = [px0 - 0.62, roofZ, px1 + 0.62, pz1 + 0.62];
  for (const r of subtractRects([x0, z0, x1, z1], [open])) bag.add('coral', box(r[0], h - 0.1, r[1], r[2], h, r[3]));
  // the roof of the crypt: columns laid across, their tops at the platform's
  for (let z = pz0 - 0.05; z < roofZ - 0.25; z += 0.47) laid(bag, ROCK[Math.floor(z * 3) & 3], px1 - px0 + 2.4, px0 - 1.2, h - 0.1 - 0.25, z + 0.24, 1, 0, 200);
  // the bier: a great column laid on two stones in the crypt, the central column of the tomb
  const bz = pz0 + 1.3, bx = (px0 + px1) / 2;
  bag.add('granite_black', box(bx - 0.5, 0, bz - 0.2, bx - 0.2, 0.3, bz + 0.2)); bag.add('granite_black', box(bx + 0.2, 0, bz - 0.2, bx + 0.5, 0.3, bz + 0.2));
  laid(bag, 'dolerite_spotted', 2.6, bx - 1.3, 0.55, bz, 1, 0, 120, 0.25);
  col.rect([bx - 1.3, bz - 0.3, bx + 1.3, bz + 0.3], 0, 0.9);
  // the stair down into the crypt (south end, ascending south) and the stair up the platform's south face
  const sd = el.ramp, su = el.stair;
  stair(bag, col, sd, 0, h, 's', true);
  stair(bag, col, su, 0, h, 'n', false);
  // colliders: the platform's mass round the crypt, its skin walkable
  for (const r of subtractRects([x0, z0, x1, z1], [[px0, pz0, px1, pz1]])) col.rect(r, 0, h);
  for (const r of subtractRects([x0, z0, x1, z1], [[px0, roofZ, px1, pz1]])) col.floor(r, h);
}
/** A flight of steps: its boxes drawn, the walkable ramp laid over it. `dir` is the direction of ascent. */
function stair(bag, col, rect, y0, y1, dir, inner) {
  const [x0, z0, x1, z1] = rect, n = Math.round((y1 - y0) / 0.3), horiz = dir === 'e' || dir === 'w';
  const L = horiz ? x1 - x0 : z1 - z0;
  for (let k = 0; k < n; k++) {
    const t0 = k / n * L, t1 = (k + 1) / n * L, y = y0 + (k + 1) * (y1 - y0) / n;
    const a = dir === 'e' || dir === 's' ? t0 : L - t1, b = dir === 'e' || dir === 's' ? t1 : L - t0;
    const r = horiz ? [x0 + a, z0, x0 + b, z1] : [x0, z0 + a, x1, z0 + b];
    bag.add(k % 2 ? 'dolerite_spotted' : 'granite_black', box(r[0], inner ? Math.max(0, y - 0.3) : y0, r[1], r[2], y, r[3]));
  }
  col.ramp(rect, y0, y1, dir);
}

// ── the nah ─────────────────────────────────────────────────────────────────────────────────────
/**
 * nah { c, yaw, w, l, rank, seed }: the Pohnpeian house — a platform of stacked basalt (the chief's higher), posts, half walls of lashed
 * reed on three sides, the fourth (toward −z at yaw 0) wholly open, a deep hip roof of ivory-palm thatch (docs/settlements/nan-madol.md §6).
 */
function nah(el, { bag, col }) {
  const { w, l } = el, rank = el.rank ?? 0, rand = rng(el.seed ?? 1), F = frame(el.c, el.yaw ?? 0);
  const ph = rank ? 0.7 : 0.45, eave = 1.95, ov = 0.9, put = (mat, g) => { g.applyMatrix4(F.M); bag.add(mat, g); };
  // the platform: stacked basalt prisms laid in courses (a box of dark stone with the courses cut in), the top matted
  put('granite_black', box(-w / 2 - 0.15, 0, -l / 2 - 0.15, w / 2 + 0.15, ph - 0.12, l / 2 + 0.15));
  put('dolerite_spotted', box(-w / 2 - 0.2, 0, -l / 2 - 0.2, w / 2 + 0.2, 0.2, l / 2 + 0.2));
  put('coral_rag', box(-w / 2 - 0.15, ph - 0.12, -l / 2 - 0.15, w / 2 + 0.15, ph, l / 2 + 0.15));
  put('reed_mat', box(-w / 2 + 0.1, ph, -l / 2 + 0.1, w / 2 - 0.1, ph + 0.025, l / 2 - 0.1));
  // posts at the corners and the middle of the long sides, the front two taller carrying the beam
  const px = [-w / 2 + 0.2, w / 2 - 0.2], pz = [-l / 2 + 0.2, 0, l / 2 - 0.2];
  for (const x of px) for (const z of pz) put(WOOD, lathe([[0.075, 0], [0.07, eave - ph + 0.4]], 7, null, x, ph, z));
  put('timber', box(-w / 2 + 0.1, eave - 0.05, -l / 2 + 0.12, w / 2 - 0.1, eave + 0.1, -l / 2 + 0.28));              // the front beam
  // the three half walls: lashed reed over a frame, up to 1.3 m, a rail above
  const wall = (x0, z0, x1, z1) => { put('wicker', box(x0, ph, z0, x1, ph + 0.85, z1)); put('timber', box(x0 - 0.01, ph + 0.85, z0 - 0.01, x1 + 0.01, ph + 0.92, z1 + 0.01)); };
  wall(-w / 2 + 0.12, -l / 2 + 0.5, -w / 2 + 0.2, l / 2 - 0.12); wall(w / 2 - 0.2, -l / 2 + 0.5, w / 2 - 0.12, l / 2 - 0.12); wall(-w / 2 + 0.2, l / 2 - 0.2, w / 2 - 0.2, l / 2 - 0.12);
  // lashings at the posts
  for (const x of px) for (const z of pz) if (rand() < 0.8) put(ROPE, lathe([[0.1, 0], [0.1, 0.1]], 7, null, x, ph + 0.5 + rand() * 0.4, z));
  // the roof: a hip over rafters, the ridge along z, thatch in thick eaves; the ridge capped
  const W2 = w + 2 * ov, L2 = l + 2 * ov, inset = (W2 - 0.4) / 2, rise = inset * 0.85;
  const zi = Math.min(inset * 0.9, (L2 - 0.6) / 2);
  put(TH, frustum([-W2 / 2, -L2 / 2, W2 / 2, L2 / 2], eave - 0.35, eave + rise, inset, inset, zi, zi));
  put(TH, box(-0.18, eave + rise - 0.02, -(L2 - 2 * zi) / 2 - 0.1, 0.18, eave + rise + 0.2, (L2 - 2 * zi) / 2 + 0.1));
  // inside: a mat and a headrest log, the back wall's bench for the chief
  put('reed_mat', box(-w / 2 + 0.7, ph + 0.025, -0.4, w / 2 - 0.9, ph + 0.05, 0.9));
  put('palm_trunk', lathe([[0.07, 0], [0.07, 0.6]], 6).rotateZ(Math.PI / 2).translate(-0.3, ph + 0.12, l / 2 - 0.5));
  if (rank) put('timber', box(-w / 2 + 0.3, ph, l / 2 - 1.2, w / 2 - 0.3, ph + 0.22, l / 2 - 0.3));
  // the frame under the roof, seen from the platform: ridge pole, tie beams, rafters lashed to them
  { const rr = eave + rise - 0.06;
    put('timber', rod([0, rr, -l / 2 + 0.3], [0, rr, l / 2 - 0.3], 0.045, 6));
    for (const z of [-l / 2 + 0.2, 0, l / 2 - 0.2]) put('timber', rod([-w / 2 + 0.15, eave + 0.02, z], [w / 2 - 0.15, eave + 0.02, z], 0.04, 5));
    for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const z = -l / 2 + 0.3 + k * (l - 0.6) / 5; put('timber', rod([s * (w / 2 - 0.1), eave + 0.02, z], [s * 0.05, rr, z * 0.8], 0.022, 4)); }
    put(ROPE, lathe([[0.07, 0], [0.07, 0.07]], 6, null, 0, rr - 0.04, l / 2 - 1.2)); }
  // the household's things on the platform and hung from the beams: a second mat, a mat roll, bowls and cups, a hung basket, bananas, strung fish, a lamp
  { const bk = l / 2 - 0.35, u0 = -w / 2 + 0.45;
    put('reed_mat', box(u0, ph + 0.05, 0.9, w / 2 - 0.45, ph + 0.07, bk - 0.3));
    put('reed_mat', lathe([[0.09, 0], [0.09, 0.9]], 8).rotateZ(Math.PI / 2).translate(u0, ph + 0.1, bk - 0.1));
    put('palm_trunk', lathe([[0.06, 0], [0.06, 0.5]], 6).rotateZ(Math.PI / 2).translate(0.2, ph + 0.1, l / 2 - 0.5));
    for (let i = 0; i < 3; i++) put(i % 2 ? 'bark_dark' : 'timber', lathe([[0.001, 0], [0.1, 0.01], [0.13, 0.09], [0.001, 0.09]], 7, null, w / 2 - 0.7 - i * 0.28, ph + 0.07, bk - 0.2 - (i % 2) * 0.2));
    if (rand() < 0.7) { const x = -w / 4 + rand() * w / 2; put(ROPE, rod([x, eave, 0.3], [x, eave - 0.6, 0.3], 0.008, 3)); put('wicker', lathe([[0.001, 0], [0.15, 0.05], [0.17, 0.25], [0.001, 0.3]], 7, null, x, eave - 0.9, 0.3)); }
    if (rand() < 0.6) { const x = w / 4 + rand() * 0.3; put(ROPE, rod([x, eave, -0.4], [x, eave - 0.4, -0.4], 0.008, 3)); for (let k = 0; k < 7; k++) put('glaze_yellow', lathe([[0.001, 0], [0.04, 0.08], [0.036, 0.18], [0.001, 0.22]], 5, null, x + Math.cos(k) * 0.09, eave - 0.85 + (k % 3) * 0.06, -0.4 + Math.sin(k) * 0.09)); }
    if (rand() < 0.5) { const x = -w / 4; put(ROPE, rod([x, eave, -0.2], [x, eave - 0.5, -0.2], 0.006, 3)); for (let k = 0; k < 4; k++) put('hide_grey', box(x - 0.03, eave - 0.6 - k * 0.1, -0.21, x + 0.03, eave - 0.52 - k * 0.1, -0.19)); }
    if (rand() < 0.5) { put('bark_dark', lathe([[0.001, 0], [0.07, 0.01], [0.08, 0.06], [0.001, 0.06]], 6, null, -w / 2 + 0.7, ph + 0.07, 0.3)); put('flame', lathe([[0.001, 0.06], [0.015, 0.075], [0.001, 0.13]], 5, null, -w / 2 + 0.7, ph + 0.07, 0.3)); }
    for (const u of [-w / 2 + 0.3, w / 2 - 0.3]) put('timber', rod([u, ph + 0.9, l / 2 - 0.9], [u + 0.04, ph + 1.8, l / 2 - 0.9], 0.015, 4)); // spears in the corner
  }
  // colliders: the three half walls, the platform's floor, a ramp up at the front for a high platform
  const S = (u0, v0, u1, v1) => col.segment(F.W(u0, v0), F.W(u1, v1), 0.12, 0, ph + 0.95);
  S(-w / 2 + 0.16, -l / 2 + 0.5, -w / 2 + 0.16, l / 2 - 0.12); S(w / 2 - 0.16, -l / 2 + 0.5, w / 2 - 0.16, l / 2 - 0.12); S(-w / 2 + 0.2, l / 2 - 0.16, w / 2 - 0.2, l / 2 - 0.16);
  const fa = F.W(-w / 2 - 0.15, -l / 2 - 0.15), fb = F.W(w / 2 + 0.15, l / 2 + 0.15);
  col.floor([fa[0], fa[1], fb[0], fb[1]], ph);
  if (rank) { const ra = F.W(-0.8, -l / 2 - 1.5), rb = F.W(0.8, -l / 2 - 0.15); col.ramp([ra[0], ra[1], rb[0], rb[1]], 0, ph, dirOf((el.yaw ?? 0))); }
}

/** cookhouse { c, yaw, seed }: a small open shed on four posts over an earth oven (umu): a ring of stones with a mound of leaves, a stack of coconuts. */
function cookhouse(el, { bag, col }) {
  const F = frame(el.c, el.yaw ?? 0), rand = rng(el.seed ?? 1), put = (mat, g) => { g.applyMatrix4(F.M); bag.add(mat, g); };
  const s = 1.6, h = 1.9;
  for (const x of [-s, s]) for (const z of [-s * 0.8, s * 0.8]) put(WOOD, lathe([[0.06, 0], [0.055, h]], 6, null, x, 0, z));
  put(TH, frustum([-s - 0.7, -s * 0.8 - 0.7, s + 0.7, s * 0.8 + 0.7], h - 0.2, h + 1.0, s + 0.4, s + 0.4, s * 0.8 + 0.4, s * 0.8 + 0.4));
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; put('basalt', lathe([[0.17, 0], [0.19, 0.08], [0.12, 0.2], [0.001, 0.24]], 6, null, Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62)); }
  put('palm_leaf', lathe([[0.55, 0], [0.45, 0.12], [0.2, 0.2], [0.001, 0.22]], 9, null, 0, 0, 0));
  for (let i = 0; i < 5; i++) put('bark_dark', lathe([[0.1, 0], [0.12, 0.1], [0.06, 0.2], [0.001, 0.22]], 6, null, -s + 0.4 + rand() * 0.4, 0, s * 0.8 - 0.4 - i * 0.12));
  const c = F.W(0, 0); col.circle(c[0], c[1], 0.7, 0, 0.3);
}

// ── Mangroves ───────────────────────────────────────────────────────────────────────────────────
/** mangrove { at, y, h, seed }: a tree on stilt roots standing in the mud and the water of the shore, a dense dark crown. */
function mangrove(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? -1.2, h = el.h ?? 5, rand = rng(el.seed ?? 3), n = 6 + Math.floor(rand() * 4);
  const hr = 0.8 + h * 0.18, base = y + h * 0.28;
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + rand() * 0.6, r1 = hr * (0.7 + rand() * 0.5);
    bag.add('bark_dark', rod([x + Math.cos(a) * 0.1, base + 0.3, z + Math.sin(a) * 0.1], [x + Math.cos(a) * r1, y - 0.25, z + Math.sin(a) * r1], 0.035 + rand() * 0.02, 5));
  }
  bag.add('bark_dark', lathe([[0.16, 0], [0.12, h * 0.4]], 6, null, x, base, z));
  bag.add('palm_leaf', lathe([[0.001, 0], [h * 0.34, h * 0.14], [h * 0.4, h * 0.38], [h * 0.26, h * 0.62], [0.001, h * 0.74]], 8, null, x, y + h * 0.3 + 0.4, z));
}

// ── sakau and offerings ────────────────────────────────────────────────────────────────────────
/** sakau { c, yaw }: the peitehl, a long basalt slab laid on two stones, the pounding stones on it, mats with offerings beside. */
function sakau(el, { bag, col }) {
  const F = frame(el.c, el.yaw ?? 0), put = (mat, g) => { g.applyMatrix4(F.M); bag.add(mat, g); };
  put('basalt', box(-1.6, 0, -0.35, -1.0, 0.45, 0.35)); put('basalt', box(1.0, 0, -0.35, 1.6, 0.45, 0.35));
  put('granite_black', box(-1.9, 0.45, -0.42, 1.9, 0.62, 0.42));
  for (const [x, z, r] of [[-0.9, 0.12, 0.6], [0.5, -0.1, 0.4], [1.1, 0.14, 0.3]]) put('basalt', lathe([[0.1, 0], [0.13, 0.12], [0.1, 0.24]], 7).rotateZ(Math.PI / 2).rotateY(r).translate(x, 0.76, z));
  put('timber', box(-0.2, 0.62, -0.2, 0.25, 0.7, 0.2));
  for (const sd of [-1, 1]) {
    put('reed_mat', box(-1.5, 0.0, sd * 1.35 - 0.55, 1.5, 0.03, sd * 1.35 + 0.55));
    for (let i = 0; i < 4; i++) put(['sandstone_green', 'bark_grey', 'bark_dark', 'sandstone_green'][i], lathe([[0.001, 0], [0.13, 0.12], [0.001, 0.25]], 7, null, -1.0 + i * 0.7, 0.03, sd * 1.35));
  }
  const a = F.W(-1.9, -0.42), b = F.W(1.9, 0.42);
  col.rect([a[0], a[1], b[0], b[1]], 0, 0.7);
}
/** coral_pile { c, r }: a heap of coral rubble and gravel. */
function pile(el, { bag }) {
  const [x, z] = el.c, r = el.r ?? 1.2;
  bag.add('coral', lathe([[r, 0], [r * 0.9, r * 0.2], [r * 0.5, r * 0.4], [0.001, r * 0.5]], 8, null, x, el.y ?? 0, z));
}

registerStyle('nanmadol', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { crib_wall, islet_wall, steps, ford, tomb, nah, cookhouse, canoe, mangrove, sakau, pile, yard, works, tomb_court, wall_dress, post, weir, plants, taro_bed, court },
  objects: {},
});
export { canoe };
