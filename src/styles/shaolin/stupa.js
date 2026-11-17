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
  const D = el.rich ? new Parts() : null, dB = (m, ...a) => D.add(m, box(...a)), sd = el.seed ?? 0;
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
    if (D) {
      // the inscription on the tablet: columns of characters (a bar, a stem, a cross-stroke), and the dead monk's name in a plaque over it
      const nc = 3, nr = Math.max(3, Math.floor((ty1 - ty0 - 0.5) / 0.2)), cw = hw * 1.5 / nc;
      for (let i = 0; i < nc; i++) for (let j = 0; j < nr; j++) if (((i * 5 + j * 3 + sd) % 4) !== 0) {
        const cz = -hw * 0.75 + (i + 0.5) * cw - 0.03, cy = ty0 + 0.18 + j * 0.2;
        dB('granite_black', a + 0.045, cy + 0.06, cz, a + 0.052, cy + 0.085, cz + 0.07); dB('granite_black', a + 0.045, cy, cz + 0.025 + ((i + j) % 2) * 0.01, a + 0.052, cy + 0.15, cz + 0.045 + ((i + j) % 2) * 0.01);
      }
      dB(LIME, a - 0.02, ty1 + 0.1, -hw - 0.2, a + 0.1, ty1 + 0.34, hw + 0.2);
      dB('granite_black', a + 0.1, ty1 + 0.14, -hw - 0.12, a + 0.108, ty1 + 0.3, hw + 0.12);
      for (let i = 0; i < 4; i++) dB(LIME, a + 0.108, ty1 + 0.17, -hw * 0.9 + i * hw * 0.5, a + 0.114, ty1 + 0.27, -hw * 0.9 + i * hw * 0.5 + 0.05);
      // engaged pilasters at the corners of the first storey, with a foot and a capital
      for (let k = 0; k < n; k++) {
        const ph = Math.PI / n + k * 2 * Math.PI / n, cx = Math.cos(ph) * (r + 0.01), cz2 = Math.sin(ph) * (r + 0.01), q = 0.07;
        dB(STONE, cx - q, y, cz2 - q, cx + q, y + bodyH, cz2 + q);
      }
      // a false door on the back face: two leaves, lintel, a row of studs on each; blind windows on the faces at the sides
      const ab = -a, hd = Math.min(0.5, hw * 0.9), dh = Math.min(bodyH * 0.6, 1.6);
      dB(STONE, ab - 0.07, y, -hd - 0.1, ab + 0.01, y + dh + 0.1, -hd); dB(STONE, ab - 0.07, y, hd, ab + 0.01, y + dh + 0.1, hd + 0.1); dB(STONE, ab - 0.07, y + dh, -hd - 0.1, ab + 0.01, y + dh + 0.1, hd + 0.1);
      dB('lacquer_red', ab - 0.03, y, -hd, ab - 0.005, y + dh, -0.02); dB('lacquer_red', ab - 0.03, y, 0.02, ab - 0.005, y + dh, hd);
      for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) dB('gilt_bronze', ab - 0.05, y + 0.2 + j * (dh - 0.4) / 3 - 0.025, sg * (0.1 + i * (hd - 0.2) / 2) - 0.025, ab - 0.03, y + 0.2 + j * (dh - 0.4) / 3 + 0.025, sg * (0.1 + i * (hd - 0.2) / 2) + 0.025);
    }
    y += bodyH;
    // the eaves
    const tr = (i) => rb * (0.95 - 0.38 * (i / Math.max(1, T1 - 1 + (T1 === 1 ? 1 : 0))));
    const ev = Math.max(0.28 * u, 0.16), step = T1 === 1 ? 0 : (h - y - 2.2 * u) / T1;
    for (let i = 0; i < T1; i++) {
      r = T1 === 1 ? rb * 0.95 : tr(i);
      if (i > 0) { const bh = Math.max(0.12, step - 0.9 * u); put(BRICK, poly([[r * 0.88, y], [r * 0.88, y + bh], [0.001, y + bh]], n)); y += bh; }
      put(BRICK, poly([[0.001, y - 0.005], [r * 1.37, y - 0.005]], n));                                       // the soffit under the eave: closes the underside
      put(BRICK, poly([[r * 0.88, y], [r * 1.0, y + 0.04], [r * 1.1, y + 0.08], [r * 1.2, y + 0.14], [r * 1.34, y + 0.2], [0.001, y + 0.2]], n));
      if (D) {
        // the brick bracket course: rows of little blocks (dentils) under the eave on every face, and a blind niche on the front face of each body above the first
        const ar = ap(r * 1.17), fl = r * 1.17 * Math.sin(Math.PI / n), nd = Math.max(2, Math.floor(fl * 1.1 / 0.2));
        for (let f = 0; f < n; f++) { const al = f * 2 * Math.PI / n; for (let k = 0; k < nd; k++) { const u = (k + 0.5) / nd * 2 * fl - fl, px = Math.cos(al) * ar - Math.sin(al) * u, pz = Math.sin(al) * ar + Math.cos(al) * u; D.add(BRICK, box(-0.045, y + 0.02, -0.04, 0.045, y + 0.13, 0.04).rotateY(-al).translate(px + Math.cos(al) * 0.05, 0, pz + Math.sin(al) * 0.05)); } }
        if (i > 0) { const bh2 = Math.max(0.12, step - 0.9 * u), a2 = ap(r * 0.88), ny = y - bh2 + bh2 * 0.2; if (bh2 > 0.3) { dB('opening', a2 - 0.01, ny, -0.09, a2 + 0.03, ny + bh2 * 0.6, 0.09); dB(STONE, a2 - 0.01, ny + bh2 * 0.6, -0.14, a2 + 0.05, ny + bh2 * 0.6 + 0.045, 0.14); } }
      }
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
  if (D) D.emit(bag, x, y0, z, rot);
  col.circle(x, z, rb * 1.3, y0, y0 + h);
}
const fin2 = (g, x, y, z) => g.translate(x, y, z);

/**
 * shaolin_stele { at: [x, z], y, yaw (0: the inscription faces +z), h, w, kind: 'bixi' | 'plain', seed }
 * A tablet of grey stone: on a tortoise (bixi) with a carved heads of coiled dragons, or on a plain plinth with a rounded top.
 */
export function shaolinStele(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y, h = el.h ?? 2.7, w = el.w ?? 0.95, th = 0.26, yaw = el.yaw ?? 0, sd = el.seed ?? 0;
  const fine = !!el.fine, P = new Parts(), bx = (m, ...a) => P.add(m, box(...a)), bl = (m, rx, ry, rz, x1, y1, z1, n = 6, k = 4) => P.add(m, T(ball(rx, ry, rz, n, k), x1, y1, z1));
  let yb = 0;
  if (el.kind === 'bixi') {
    // the tortoise (bixi): a low shell with its rim and scutes, four paddle legs with claws, a short tail, the dragon's head on its long neck
    P.add(STONE, T(ball(w * 0.98, 0.3, 0.74, 12, 6), 0, 0.3, 0.05));
    P.add(STONE, lathe([[w * 1.0, 0.14], [w * 1.06, 0.2], [w * 1.0, 0.26], [0.001, 0.26]], 12).scale(1, 1, 0.78).translate(0, 0.02, 0.05));        // the rim of the shell
    if (fine) for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) { if ((r + c) & 1 && r) continue; bl(STONE, 0.17, 0.045, 0.15, c * 0.4 * w * 1.1 + (r ? r * 0.18 : 0), 0.575 - Math.abs(c) * 0.07 - Math.abs(r) * 0.03, -0.12 + r * 0.31, 6, 3); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const lx = sx * w * 0.8, lz = 0.06 + sz * 0.46;
      bl(STONE, 0.22, 0.1, 0.3, lx, 0.1, lz, 7, 4);                                         // the paddle
      for (let k = -1; k <= 1; k++) bl(STONE, 0.045, 0.04, 0.06, lx + k * 0.1, 0.06, lz + sz * 0.3, 5, 3);   // the claws
    }
    P.add(STONE, limb([0, 0.28, 0.6], [0, 0.34, 1.0], 0.2, 0.17, 8));                         // the neck
    bl(STONE, 0.25, 0.2, 0.3, 0, 0.33, 1.12, 8, 5);                                         // the head
    bl(STONE, 0.18, 0.1, 0.2, 0, 0.27, 1.36, 8, 4); bl(STONE, 0.14, 0.05, 0.14, 0, 0.19, 1.3, 6, 3);   // snout, lower jaw
    for (const k of [-1, 1]) { bl(STONE, 0.03, 0.035, 0.03, k * 0.06, 0.32, 1.52, 4, 3); bl(STONE, 0.05, 0.05, 0.05, k * 0.14, 0.45, 1.1, 5, 3); bx(STONE, k * 0.1 - 0.02, 0.2, 1.38, k * 0.1 + 0.02, 0.25, 1.46); P.add(STONE, limb([k * 0.2, 0.4, 1.05], [k * 0.34, 0.3, 0.92], 0.05, 0.02, 5)); }   // nostrils, eyes, teeth, whiskers
    P.add(STONE, limb([0, 0.45, 1.2], [0, 0.62, 1.05], 0.04, 0.02, 4));                       // the single horn
    bl(STONE, 0.1, 0.07, 0.2, 0, 0.17, -0.72, 6, 3);                                         // the tail
    bx(STONE, -w * 0.58, 0.5, -th * 0.9, w * 0.58, 0.64, th * 0.9); yb = 0.64;
    // the carved mortise block under the tablet: a row of studs on its front
    if (fine) for (let k = 0; k < 5; k++) bl(STONE, 0.04, 0.035, 0.03, -w * 0.46 + k * w * 0.23, 0.57, th * 0.9 + 0.02, 5, 3);
  } else {
    P.add(STONE, box(-w * 0.75, 0, -0.35, w * 0.75, 0.3, 0.35)); P.add(STONE, box(-w * 0.62, 0.3, -0.3, w * 0.62, 0.42, 0.3)); yb = 0.42;
    for (let k = 0; k < 4; k++) bl(STONE, 0.06, 0.05, 0.03, -w * 0.5 + k * w * 0.33, 0.15, 0.36, 5, 3);        // petals on the plinth
  }
  // the tablet: limestone, a raised border all round the inscription field, the field sunk
  const hs = h - yb - 0.55;
  P.add(LIME, box(-w / 2, yb, -th / 2, w / 2, yb + hs, th / 2));
  const bw = 0.07, fz = th / 2 + 0.014;
  for (const [a0, b0, a1, b1] of [[-w / 2, yb + 0.05, -w / 2 + bw, yb + hs - 0.05], [w / 2 - bw, yb + 0.05, w / 2, yb + hs - 0.05], [-w / 2, yb + 0.05, w / 2, yb + 0.05 + bw], [-w / 2, yb + hs - 0.05 - bw, w / 2, yb + hs - 0.05]]) P.add(STONE, box(a0, b0, th / 2, a1, b1, fz));
  if (fine) for (let k = 0; k < Math.max(3, Math.floor(hs / 0.22)); k++) for (const sx of [-1, 1]) bl(LIME, 0.025, 0.03, 0.012, sx * (w / 2 - bw / 2), yb + 0.18 + k * 0.22, fz, 4, 3);        // the scroll border
  P.add('granite_black', box(-w * 0.4, yb + 0.25, th / 2, w * 0.4, yb + hs - 0.25, th / 2 + 0.012));
  const cols = 5, rows = Math.max(3, Math.floor((hs - 0.9) / 0.3));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (((i * 7 + j * 3 + sd) % 5) !== 0) {
    if (!fine && (i + j) % 2) continue;
    const cx = -w * 0.34 + i * w * 0.17, cy = yb + 0.35 + j * 0.3, t = (i * 3 + j + sd) % 3;
    P.add(LIME, box(cx, cy + 0.07, th / 2 + 0.012, cx + 0.085, cy + 0.095, th / 2 + 0.02));                     // each character: a bar and a stem or two bars
    if (t === 0) P.add(LIME, box(cx + 0.03, cy, th / 2 + 0.012, cx + 0.052, cy + 0.17, th / 2 + 0.02)); else if (t === 1) { P.add(LIME, box(cx, cy + 0.01, th / 2 + 0.012, cx + 0.085, cy + 0.034, th / 2 + 0.02)); P.add(LIME, box(cx + 0.02, cy + 0.12, th / 2 + 0.012, cx + 0.05, cy + 0.17, th / 2 + 0.02)); } else P.add(LIME, box(cx + 0.01, cy, th / 2 + 0.012, cx + 0.035, cy + 0.17, th / 2 + 0.02));
  }
  const yt = yb + hs;
  if (el.kind === 'bixi') {
    // the head (螭首): the board with six dragons coiled in two groups, their heads turned in to the title panel, the bodies in loops of scales
    P.add(LIME, box(-w / 2 - 0.04, yt, -th / 2 - 0.02, w / 2 + 0.04, yt + 0.5, th / 2 + 0.02));
    P.add(STONE, box(-w / 2 - 0.06, yt, -th / 2 - 0.03, w / 2 + 0.06, yt + 0.04, th / 2 + 0.03)); P.add(STONE, box(-w / 2 - 0.06, yt + 0.46, -th / 2 - 0.03, w / 2 + 0.06, yt + 0.5, th / 2 + 0.03));
    for (const sx of [-1, 1]) for (const zz of [-1, 1]) for (let d = 0; d < (fine ? 2 : 1); d++) {
      // a dragon: a body of seven segments in an S loop from the outer corner toward the middle, a head at the end with horn and eye, a claw
      const y1 = yt + 0.09 + d * 0.13, zf = zz * (th / 2 + 0.03);
      for (let k = 0; k < (fine ? 5 : 4); k++) { const u = k / (fine ? 4 : 3), px = sx * (w / 2 - 0.04 - u * (w * 0.5 - 0.12)), py = y1 + Math.sin(u * 6.28 + d) * 0.045; bl(LIME, 0.06 - u * 0.012, 0.045, 0.03, px, py, zf, 5, 3); }
      bl(LIME, 0.07, 0.055, 0.045, sx * 0.14, y1, zf, 6, 4); P.add(LIME, limb([sx * 0.15, y1 + 0.03, zf], [sx * 0.2, y1 + 0.12, zf], 0.015, 0.008, 4));
    }
    bx(LIME, -0.17, yt + 0.1, th / 2 + 0.02, 0.17, yt + 0.42, th / 2 + 0.035);
    P.add('granite_black', box(-0.14, yt + 0.13, th / 2 + 0.035, 0.14, yt + 0.39, th / 2 + 0.043));
    for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) if ((k + j + sd) % 4) P.add(LIME, box(-0.1 + k * 0.07, yt + 0.16 + j * 0.08, th / 2 + 0.043, -0.1 + k * 0.07 + 0.045, yt + 0.16 + j * 0.08 + 0.05, th / 2 + 0.05));
    bl(LIME, 0.1, 0.07, 0.05, 0, yt + 0.5, 0, 6, 3);                                              // the pearl on the crown
  } else {
    P.add(LIME, lathe([[w * 0.5, 0], [w * 0.46, 0.2], [w * 0.3, 0.4], [0.001, 0.52]], 12).scale(1, 1, th / w).translate(0, yt, 0));
    for (const sx of [-1, 1]) bl(STONE, 0.07, 0.05, 0.04, sx * w * 0.22, yt + 0.22, th / 2 + 0.01, 6, 3);      // the cloud scrolls on the arch
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
/**
 * stone_lion { at, y, yaw, s, male }: a guardian lion on a carved sumeru plinth. The plinth: a plain foot, a band of lotus petals, a waist with
 * a framed panel carved on each face, a band of petals upturned, a slab; the lion (the carving kit's seated lion, the curls of its mane, the open
 * jaw, the ball or the cub under its paw) in the grey limestone of the gate.
 */
export function stoneLion(el, { bag, col }) {
  const [x, z] = el.at, s = el.s ?? 1.1, P = new Parts(), hx = 0.72 * s, hz = 0.92 * s;
  const sb = (a, b, i, m = STONE) => P.add(m, box(-hx + i, a, -hz + i, hx - i, b, hz - i));
  sb(0, 0.12, -0.1); sb(0.12, 0.26, 0);
  // the band of lotus petals round the foot: upright petals, a ball-ended tip each
  const petals = (y0, up) => {
    for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) P.add(STONE, T(ball(0.075 * s, 0.07, 0.04 * s, 5, 3), sx * (hx + 0.005), y0, (-hz + (k + 0.5) * 2 * hz / 5) * 0.96).scale(1, up, 1));
    for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) P.add(STONE, T(ball(0.04 * s, 0.07, 0.075 * s, 5, 3), (-hx + (k + 0.5) * 2 * hx / 4) * 0.96, y0, sz * (hz + 0.005)).scale(1, up, 1));
  };
  petals(0.33, 1);
  sb(0.26, 0.4, 0.0 + 0.04);
  // the waist, set in, with a recessed panel carved on each face (a raised frame round a sunk field)
  sb(0.4, 0.58, 0.1);
  for (const sx of [-1, 1]) {
    const xf = sx * (hx - 0.1);
    P.add(LIME, box(Math.min(xf, xf + sx * 0.03), 0.43, -hz + 0.28, Math.max(xf, xf + sx * 0.03), 0.55, hz - 0.28));
    for (let k = 0; k < 3; k++) P.add(STONE, T(ball(0.05, 0.05, 0.05, 6, 3), xf + sx * 0.04, 0.49, -hz * 0.4 + k * hz * 0.4));
  }
  for (const sz of [-1, 1]) { const zf = sz * (hz - 0.1); P.add(LIME, box(-hx + 0.28, 0.43, Math.min(zf, zf + sz * 0.03), hx - 0.28, 0.55, Math.max(zf, zf + sz * 0.03))); P.add(STONE, T(ball(0.07, 0.05, 0.05, 6, 3), 0, 0.49, zf + sz * 0.04)); }
  sb(0.58, 0.64, 0.02); petals(0.67, -1);
  sb(0.62, 0.74, 0.0 - 0.02);
  const L = new Parts(); seated(L, LIME, { paw: el.male === false ? 'cub' : 'ball' }); L.emit(P, 0, 0.74, 0, 0, s * 0.95);
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
