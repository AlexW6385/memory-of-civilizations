// The Pagoda Forest's funerary stupas and the monastery's steles (docs/settlements/shaolin.md §3, §4).
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { ball, limb, T, Parts, seated } from '../qing/carving.js';

const BRICK = 'brick_grey', TILE = 'tile_grey', STONE = 'granite_grey', LIME = 'limestone';
/** A regular n-gon prism/frustum of a lathe profile [[r, y]…], faces toward +x (angles of multiples of 2π/n). */
const poly = (prof, n) => lathe(prof, n).rotateY(Math.PI / n);

/**
 * shaolin_stupa { c: [x, z], y, kind: 'brick' | 'stone' | 'bell', tiers, shape (4 | 6 | 8 sides), h, jit, seed }
 * brick: a stone sumeru base, a tall first storey with the memorial tablet in a niche, then `tiers` close eaves of
 * corbelled brick under grey tile, each storey narrower, a lotus-and-ball finial. stone: a square plinth, an eight-sided
 * waist, a vase-shaped body with a lotus cap (Yuan–Ming monks' stupas). bell: a low bell-shaped stupa on a stepped base.
 */
export function shaolinStupa(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y, h = el.h, n = el.shape || 8, rot = -Math.PI / 2 + (el.jit ?? 0), u = h / 14;
  const fin = (g) => g.rotateY(rot).translate(x, y0, z);
  const put = (m, g) => bag.add(m, fin(g));
  const ap = (r) => r * Math.cos(Math.PI / n);
  let rb;
  if (el.kind === 'brick') {
    const T1 = el.tiers;
    rb = Math.max(0.75, Math.min(2.5, h * 0.17));
    let y = 0;
    const base = [[rb * 1.3, 0], [rb * 1.3, 0.3 * u], [rb * 1.15, 0.4 * u], [rb * 1.15, 0.85 * u], [rb * 1.22, 0.95 * u], [rb * 1.22, 1.2 * u], [rb * 1.02, 1.3 * u], [0.001, 1.3 * u]];
    put(STONE, poly(base, n)); y = 1.3 * u;
    // the first storey: tall, with its tablet
    const bodyH = T1 === 1 ? h * 0.5 : h * 0.24;
    let r = rb * 0.95;
    put(BRICK, poly([[r, y], [r, y + bodyH], [0.001, y + bodyH]], n));
    // the tablet on the front face in a shallow niche, and a stone lintel and sill
    const a = ap(r), ty0 = y + bodyH * 0.2, ty1 = y + bodyH * 0.8, hw = Math.min(0.5, r * Math.sin(Math.PI / n) * 0.6);
    put(STONE, box(a - 0.01, ty0 - 0.08, -hw - 0.1, a + 0.07, ty0, hw + 0.1)); put(STONE, box(a - 0.01, ty1, -hw - 0.1, a + 0.07, ty1 + 0.1, hw + 0.1));
    put('opening', box(a - 0.01, ty0, -hw, a + 0.03, ty1, hw));
    put(LIME, box(a + 0.03, ty0 + 0.1, -hw * 0.8, a + 0.045, ty1 - 0.1, hw * 0.8));
    y += bodyH;
    // the eaves
    const tr = (i) => rb * (0.95 - 0.38 * (i / Math.max(1, T1 - 1 + (T1 === 1 ? 1 : 0))));
    const ev = Math.max(0.28 * u, 0.16), step = T1 === 1 ? 0 : (h - y - 2.2 * u) / T1;
    for (let i = 0; i < T1; i++) {
      r = T1 === 1 ? rb * 0.95 : tr(i);
      if (i > 0) { const bh = Math.max(0.12, step - 0.9 * u); put(BRICK, poly([[r * 0.88, y], [r * 0.88, y + bh], [0.001, y + bh]], n)); y += bh; }
      put(BRICK, poly([[r * 0.88, y], [r * 1.0, y + 0.04], [r * 1.1, y + 0.08], [r * 1.2, y + 0.14], [r * 1.34, y + 0.2], [0.001, y + 0.2]], n));
      const rr = r * 1.38, rise = Math.max(0.35, 0.55 * u * (r / rb) + 0.2);
      put(TILE, poly([[rr, y + 0.2], [rr * 0.8, y + 0.2 + rise * 0.3], [rr * 0.55, y + 0.2 + rise * 0.68], [rr * 0.34, y + 0.2 + rise], [0.001, y + 0.2 + rise]], n));
      y += 0.2 + rise;
      if (i === T1 - 1) r = r * 0.34;
    }
    // finial: a stone lotus seat, a ball, a spike
    const fr = Math.max(0.2, r * 0.9);
    put(STONE, poly([[fr, y], [fr * 1.25, y + 0.08], [fr * 1.1, y + 0.18], [fr * 0.6, y + 0.24], [0.001, y + 0.24]], 8));
    put(STONE, fin2(ball(fr * 0.62, fr * 0.62, fr * 0.62, 8, 5), 0, y + 0.24 + fr * 0.55, 0));
    put(STONE, lathe([[fr * 0.1, y + 0.24 + fr * 1.1], [0.01, y + 0.24 + fr * 1.1 + 0.4 * u + 0.2]], 5));
  } else if (el.kind === 'stone') {
    rb = Math.max(0.6, h * 0.22);
    put(LIME, box(-rb * 1.1, 0, -rb * 1.1, rb * 1.1, 0.22 * u + 0.12, rb * 1.1));
    put(STONE, box(-rb * 0.95, 0.22 * u + 0.12, -rb * 0.95, rb * 0.95, 0.4 * u + 0.2, rb * 0.95));
    const yb = 0.4 * u + 0.2;
    put(LIME, lathe([[rb * 0.8, yb], [rb * 0.86, yb + 0.08], [rb * 0.7, yb + 0.2], [rb * 0.78, yb + 0.5 * u + 0.2], [rb * 0.6, yb + 0.6 * u + 0.2], [0.001, yb + 0.6 * u + 0.2]], 8));
    const yw = yb + 0.6 * u + 0.2;
    // the vase body with a lotus-petal band and a front niche
    put(LIME, lathe([[rb * 0.5, yw], [rb * 0.7, yw + 0.18], [rb * 0.82, yw + 0.5 * u + 0.5], [rb * 0.74, yw + 0.9 * u + 0.8], [rb * 0.4, yw + 1.1 * u + 0.9], [0.001, yw + 1.1 * u + 0.9]], 14));
    put('opening', box(rb * 0.72, yw + 0.5 * u + 0.2, -0.2, rb * 0.84, yw + 0.5 * u + 0.8, 0.2));
    const yt = yw + 1.1 * u + 0.9;
    put(STONE, lathe([[rb * 0.45, yt], [rb * 0.6, yt + 0.06], [rb * 0.5, yt + 0.14], [rb * 0.3, yt + 0.2], [0.001, yt + 0.2]], 8));
    put(STONE, fin2(ball(rb * 0.24, rb * 0.24, rb * 0.24, 8, 5), 0, yt + 0.4, 0));
  } else {
    rb = Math.max(0.55, h * 0.24);
    put(STONE, poly([[rb * 1.2, 0], [rb * 1.2, 0.25], [rb * 1.0, 0.33], [rb * 1.0, 0.6], [rb * 0.82, 0.68], [0.001, 0.68]], 8));
    put(LIME, lathe([[rb * 0.6, 0.68], [rb * 0.78, 0.8], [rb * 0.84, 0.6 * h * 0.45 + 0.7], [rb * 0.7, h * 0.7], [rb * 0.35, h * 0.86], [0.001, h * 0.9]], 14));
    put(STONE, fin2(ball(rb * 0.16, rb * 0.16, rb * 0.16, 6, 4), 0, h * 0.93, 0));
    put('opening', box(rb * 0.8, 0.9, -0.17, rb * 0.9, 0.9 + h * 0.2, 0.17));
  }
  col.circle(x, z, rb * 1.3, y0, y0 + h);
}
const fin2 = (g, x, y, z) => g.translate(x, y, z);

/**
 * shaolin_stele { at: [x, z], y, yaw (0: the inscription faces +z), h, w, kind: 'bixi' | 'plain', seed }
 * A tablet of grey stone: on a tortoise (bixi) with a carved heads of coiled dragons, or on a plain plinth with a rounded top.
 */
export function shaolinStele(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y, h = el.h ?? 2.7, w = el.w ?? 0.95, th = 0.26, yaw = el.yaw ?? 0;
  const P = new Parts();
  let yb = 0;
  if (el.kind === 'bixi') {
    P.add(STONE, T(ball(w * 0.95, 0.3, 0.72, 10, 5), 0, 0.3, 0.1));                      // the shell
    for (let k = 0; k < 6; k++) P.add(STONE, T(ball(0.2, 0.05, 0.2, 6, 3), -0.45 + (k % 3) * 0.45, 0.58, -0.1 + Math.floor(k / 3) * 0.4));
    P.add(STONE, T(ball(0.26, 0.2, 0.3, 8, 4), 0, 0.28, 1.0));                            // the head
    P.add(STONE, limb([0, 0.3, 0.5], [0, 0.3, 0.85], 0.17, 0.2, 6));                      // the neck
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(STONE, T(ball(0.2, 0.12, 0.28, 6, 4), sx * w * 0.75, 0.1, 0.1 + sz * 0.5));
    P.add(STONE, box(-w * 0.58, 0.46, -th * 0.9, w * 0.58, 0.62, th * 0.9)); yb = 0.62;
  } else {
    P.add(STONE, box(-w * 0.75, 0, -0.35, w * 0.75, 0.3, 0.35)); P.add(STONE, box(-w * 0.62, 0.3, -0.3, w * 0.62, 0.42, 0.3)); yb = 0.42;
  }
  // the tablet and its head
  const hs = h - yb - 0.55;
  P.add(LIME, box(-w / 2, yb, -th / 2, w / 2, yb + hs, th / 2));
  // inscription: a dark field with columns of characters
  P.add('granite_black', box(-w * 0.4, yb + 0.25, th / 2, w * 0.4, yb + hs - 0.25, th / 2 + 0.012));
  const cols = 5, rows = Math.max(3, Math.floor((hs - 0.9) / 0.3));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (((i * 7 + j * 3 + (el.seed ?? 0)) % 5) !== 0) P.add(LIME, box(-w * 0.34 + i * w * 0.17, yb + 0.35 + j * 0.3, th / 2 + 0.012, -w * 0.34 + i * w * 0.17 + 0.08, yb + 0.35 + j * 0.3 + 0.17, th / 2 + 0.02));
  const yt = yb + hs;
  if (el.kind === 'bixi') {
    // the head: two coiled dragons, a title panel between them
    P.add(LIME, box(-w / 2 - 0.04, yt, -th / 2 - 0.02, w / 2 + 0.04, yt + 0.5, th / 2 + 0.02));
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) P.add(LIME, T(ball(0.15, 0.13, 0.17, 6, 4), s * (0.18 + k * 0.12), yt + 0.38 - k * 0.04, 0));
    for (const s of [-1, 1]) P.add(LIME, T(ball(0.1, 0.09, 0.12, 6, 4), s * (w * 0.5), yt + 0.32, th / 2 + 0.02));
    P.add('granite_black', box(-0.17, yt + 0.12, th / 2 + 0.02, 0.17, yt + 0.4, th / 2 + 0.03));
  } else {
    P.add(LIME, lathe([[w * 0.5, 0], [w * 0.46, 0.2], [w * 0.3, 0.4], [0.001, 0.52]], 12).scale(1, 1, th / w).translate(0, yt, 0));
  }
  P.emit(bag, x, y0, z, yaw);
  col.rect([x - w * 0.8, z - 0.5, x + w * 0.8, z + 0.5], y0, y0 + h);
}

/**
 * practice_floor { rect (the floor), y (the platform's top), rows, cols, seed }: the floor of the training hall, of square brick,
 * with its worn pits — a hole through the top course in each (a real recess, the bottom rough earth).
 * The top of the floor is at y + 0.19; the pits go down to y + 0.05.
 */
export function practiceFloor(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  const top = el.y + 0.19, bot = el.y + 0.05, rows = el.rows ?? 6, cols = el.cols ?? 8;
  const pz0 = el.pzStart ?? z0 + (z1 - z0) * 0.3, pz1 = z1 - 2.0, sx = (x1 - x0 - 5) / (cols - 1), sz = rows > 1 ? (pz1 - pz0) / (rows - 1) : 0;
  const hx = 0.27, hz = 0.2;                              // half sizes of a pit (a worn oval of about 0.5 × 0.4 m)
  const M = 'brick_paving';
  const slab = (a0, b0, a1, b1) => { if (a1 - a0 > 0.005 && b1 - b0 > 0.005) bag.add(M, box(a0, bot - 0.02, b0, a1, top, b1)); };
  let zc = z0;
  for (let j = 0; j < rows; j++) {
    const pz = pz0 + j * sz;
    slab(x0, zc, x1, pz - hz); zc = pz + hz;
    let xc = x0;
    for (let i = 0; i < cols; i++) {
      const px = x0 + 2.5 + i * sx + (((i * 5 + j * 3 + (el.seed ?? 0)) % 4) - 1.5) * 0.04;
      slab(xc, pz - hz, px - hx, pz + hz); xc = px + hx;
    }
    slab(xc, pz - hz, x1, pz + hz);
  }
  slab(x0, zc, x1, z1);
  // the pits' floors: rough earth, packed hard
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const px = x0 + 2.5 + i * sx + (((i * 5 + j * 3 + (el.seed ?? 0)) % 4) - 1.5) * 0.04, pz = pz0 + j * sz;
    bag.add('earth_wall', box(px - hx, bot - 0.02, pz - hz, px + hx, bot, pz + hz));
  }
  col.floor(el.rect, top);
}

/** court_censer { at, y, s }: the great bronze incense burner of a court, a round bowl on three legs with two upright ears, under a stone base. */
export function courtCenser(el, { bag, col }) {
  const [x, z] = el.at, s = el.s ?? 1, P = new Parts();
  P.add(STONE, box(-0.9 * s, 0, -0.9 * s, 0.9 * s, 0.35 * s, 0.9 * s)); P.add(STONE, box(-0.75 * s, 0.35 * s, -0.75 * s, 0.75 * s, 0.5 * s, 0.75 * s));
  P.add('bronze', lathe([[0.001, 0.95], [0.4, 0.95], [0.62, 1.15], [0.66, 1.5], [0.6, 1.75], [0.64, 1.82], [0.001, 1.82]].map(([r, h]) => [r * s, h * s]), 16, null, 0, 0, 0));
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; P.add('bronze', limb([Math.cos(a) * 0.3 * s, 1.0 * s, Math.sin(a) * 0.3 * s], [Math.cos(a) * 0.46 * s, 0.5 * s, Math.sin(a) * 0.46 * s], 0.09 * s, 0.07 * s, 6)); }
  for (const sg of [-1, 1]) P.add('bronze', limb([sg * 0.6 * s, 1.75 * s, 0], [sg * 0.6 * s, 2.15 * s, 0], 0.05 * s, 0.05 * s, 5));
  for (const sg of [-1, 1]) P.add('bronze', limb([sg * 0.6 * s, 2.15 * s, 0], [sg * 0.45 * s, 2.15 * s, 0], 0.05 * s, 0.05 * s, 5));
  P.emit(bag, x, el.y, z, el.yaw ?? 0);
  col.circle(x, z, 0.9 * s, el.y, el.y + 2.3 * s);
}
/** stone_lion { at, y, yaw, s, male }: a guardian lion on a plinth (the seated lion of the Qing carving kit). */
export function stoneLion(el, { bag, col }) {
  const [x, z] = el.at, s = el.s ?? 1.1, P = new Parts();
  P.add(STONE, box(-0.7 * s, 0, -0.9 * s, 0.7 * s, 0.7, 0.9 * s)); P.add(STONE, box(-0.8 * s, 0, -1.0 * s, 0.8 * s, 0.12, 1.0 * s));
  const L = new Parts(); seated(L, LIME, { paw: el.male === false ? 'cub' : 'ball', lite: true }); L.emit(P, 0, 0.7, 0, 0, s * 0.9);
  P.emit(bag, x, el.y, z, el.yaw ?? 0);
  col.rect([x - 0.8 * s, z - 1.0 * s, x + 0.8 * s, z + 1.0 * s], el.y, el.y + 2.6);
}

/** bell_hung { at, y, kind: 'bell' | 'drum' }: the great bell of a bell tower on its timber frame, or the great drum on its stand. */
export function bellHung(el, { bag, col }) {
  const [x, z] = el.at, P = new Parts(), W = 'timber_red';
  if (el.kind === 'bell') {
    for (const s of [-1, 1]) { P.add(W, box(s * 1.35 - 0.13, 0, -0.35, s * 1.35 + 0.13, 2.9, 0.35)); P.add(W, box(s * 1.35 - 0.3, 0, -0.6, s * 1.35 + 0.3, 0.2, 0.6)); }
    P.add(W, box(-1.5, 2.9, -0.16, 1.5, 3.2, 0.16));
    P.add('bronze', lathe([[0.88, 0.7], [0.92, 0.95], [0.84, 1.6], [0.7, 2.35], [0.58, 2.62], [0.001, 2.7]], 16));
    P.add('bronze', lathe([[0.2, 2.7], [0.16, 2.95], [0.001, 2.95]], 8));
    for (const a of [0, 1, 2]) for (let k = 0; k < 3; k++) P.add('gilt_bronze', box(Math.cos(a * 2.09) * 0.9 - 0.04, 1.0 + k * 0.45, Math.sin(a * 2.09) * 0.9 - 0.04, Math.cos(a * 2.09) * 0.92 + 0.04, 1.35 + k * 0.45, Math.sin(a * 2.09) * 0.92 + 0.04));
    P.add(W, limb([0, 1.0, 1.45], [0, 1.3, 2.6], 0.1, 0.09, 6));           // the striking log
  } else {
    P.add('lacquer_red', lathe([[0.001, 0], [0.8, 0], [0.95, 0.55], [0.8, 1.1], [0.001, 1.1]], 18).rotateZ(Math.PI / 2).translate(0.0, 1.5, 0).scale(1, 1, 1));
    P.add('hide_tan', lathe([[0.001, 0], [0.8, 0]], 18).rotateZ(Math.PI / 2).translate(0.55, 1.5, 0));
    P.add('hide_tan', lathe([[0.001, 0], [0.8, 0]], 18).rotateZ(-Math.PI / 2).translate(-0.55, 1.5, 0));
    for (const s of [-1, 1]) { P.add(W, box(s * 0.5 - 0.5, 0, -0.9, s * 0.5 + 0.5, 0.25, 0.9)); P.add(W, limb([s * 0.5, 0.2, 0], [s * 0.45, 1.5, -0.6], 0.09, 0.07, 6)); P.add(W, limb([s * 0.5, 0.2, 0], [s * 0.45, 1.5, 0.6], 0.09, 0.07, 6)); }
  }
  P.emit(bag, x, el.y, z, 0);
  col.rect([x - 1.6, z - 0.9, x + 1.6, z + 0.9], el.y, el.y + 3.2);
}

/** path_earth { pts, w, ground }: a beaten-earth path laid on the ground, every vertex on it. */
export function pathEarth(el, { bag }) {
  const tris = [], H = el.ground, w = el.w / 2, S = 0.8, pts = [];
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const [a, b] = [el.pts[i], el.pts[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / S));
    for (let k = i ? 1 : 0; k <= n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  const side = (i, s) => {
    const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], r = pts[Math.max(0, i - 1)];
    let dx = q[0] - r[0], dz = q[1] - r[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const wv = w * (0.85 + 0.15 * Math.sin(i * 1.7)), x = p[0] - dz * s * wv, z = p[1] + dx * s * wv;
    return [x, H(x, z) + 0.035, z];
  };
  for (let i = 0; i + 1 < pts.length; i++) {
    const A = side(i, 1), B = side(i + 1, 1), C = side(i + 1, -1), D = side(i, -1);
    for (const t of [[A, B, C], [A, C, D]]) { const u = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], v = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]]; const ny = u[2] * v[0] - u[0] * v[2]; tris.push(...(ny >= 0 ? [...t[0], ...t[1], ...t[2]] : [...t[0], ...t[2], ...t[1]])); }
  }
  bag.add('pebbles', fromTriangles(tris));
}
