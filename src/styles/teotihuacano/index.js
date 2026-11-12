// Teotihuacano architecture (c. 100–550; docs/settlements/teotihuacan.md §4): talud-tablero — each
// stage a sloping apron with a framed vertical panel above — stuccoed and painted; pyramids with a
// stair on one face, the Adosada platform before them; walled apartment compounds of rooms round
// patios; the avenue's cross walls.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';
import { carved, Kit } from '../maya/meso.js';
import { porticoRooms } from './rooms.js';
import { patch } from '../maya/household.js';
import { ttPlants } from './plants.js';
import { ttMarket } from './market.js';
import { midden } from './market.js';
import { kiln, dyeYard } from './craft.js';
import { streetFront } from './street.js';
import { ttAvenue, ttPuma, weatherPyramid } from './avenue.js';
import { ttPalace, ttJaguars, ttPlazaAltars, ttCrossAltar, ttGoddess, ttTempleInside, ttPeople } from './palace.js';

const S = 'stucco_ochre', RD = 'stucco_red', RF = 'limewash_red', RB = 'rubble_teo', HS = 'andesite';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const stairs = (el, ctx) => STYLES.qing.elements.stairs(el, ctx);

/**
 * tt_stair: a stair { rect, y0, y1, dir (the way up), mat } between its alfardas — the plain sloping
 * balustrades either side, standing a little above the treads and painted red.
 */
export function ttStair(el, { bag, col }) {
  // the treads, each a block a little deeper than its riser (the alfardas close the sides below them)
  {
    const [x0, z0, x1, z1] = el.rect, { y0, y1, dir } = el, alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.round((y1 - y0) / 0.2));
    for (let k = 0; k < n; k++) {
      const f0 = k / n, f1 = (k + 1) / n, yy = y0 + (y1 - y0) * f1, yl = Math.max(y0 - 0.1, yy - (y1 - y0) / n - 0.3);
      const r = dir === 'n' ? [x0, z1 - len * f1, x1, z1 - len * f0] : dir === 's' ? [x0, z0 + len * f0, x1, z0 + len * f1] : dir === 'e' ? [x0 + len * f0, z0, x0 + len * f1, z1] : [x1 - len * f1, z0, x1 - len * f0, z1];
      bag.add(el.mat || S, frustum(r, yl, yy, 0, 0, 0, 0, { noBottom: k > 0 }));
    }
    col.ramp([x0, z0, x1, z1], y0, y1, dir);
  }
  const [x0, z0, x1, z1] = el.rect, { y0, y1, dir } = el, alongZ = dir === 'n' || dir === 's', W = alongZ ? x1 - x0 : z1 - z0, aw = Math.min(0.8, W * 0.08), up = 0.35;
  if (W < 2) return;
  const k = new Kit();
  for (const side of [0, 1]) {
    // u across the stair, v along it from the foot (v0) to the head (v1)
    const [u0, u1] = side ? [(alongZ ? x1 : z1) - aw, alongZ ? x1 : z1] : [alongZ ? x0 : z0, (alongZ ? x0 : z0) + aw];
    const [v0, v1] = dir === 'n' ? [z1, z0] : dir === 's' ? [z0, z1] : dir === 'e' ? [x0, x1] : [x1, x0];
    const P = (u, v, y) => (alongZ ? [u, y, v] : [v, y, u]);
    k.hex(RD, [P(u0, v0, y0 - 0.1), P(u1, v0, y0 - 0.1), P(u1, v1, y0 - 0.1), P(u0, v1, y0 - 0.1), P(u0, v0, y0 + up), P(u1, v0, y0 + up), P(u1, v1, y1 + up), P(u0, v1, y1 + up)]);
  }
  k.emit(bag, 0, 0, 0, 0, 1);
}

/**
 * A tablero round a rectangle, from y0 to y1: the inset panel painted red, framed by the projecting
 * moulding (a bar above, a bar below, posts at the corners) in a darker red, and along each face a
 * row of chalchihuites — green discs ringed in black — painted on the panel (the West Plaza's stair).
 * The frame stands `out` beyond the panel.
 */
export function tablero(bag, [x0, z0, x1, z1], y0, y1, { out = 0.25, discs = true, inner = null } = {}) {
  const H = y1 - y0, fh = Math.min(0.32, H * 0.18), fw = Math.min(0.4, H * 0.2);
  // the panel (its top the floor above), the frame's bars as rings (their hidden middles left out), the corner posts
  // (where a stage stands on it, `inner`, the panel's top is left out and the top bar reaches in under that stage)
  bag.add(RD, frustum([x0, z0, x1, z1], y0 + fh * 0.5, y1, 0, 0, 0, 0, { noBottom: true, noTop: !!inner }));
  for (const [ya, yb, top] of [[y0, y0 + fh, false], [y1 - fh, y1, true]]) {
    const [i0, j0, i1, j1] = top && inner ? [Math.max(inner[0], x0 + fw), Math.max(inner[1], z0 + fw), Math.min(inner[2], x1 - fw), Math.min(inner[3], z1 - fw)] : [x0 + fw, z0 + fw, x1 - fw, z1 - fw];
    bag.add(RF, box(x0 - out, ya, z0 - out, i0, yb, z1 + out)); bag.add(RF, box(i1, ya, z0 - out, x1 + out, yb, z1 + out));
    bag.add(RF, box(i0, ya, z0 - out, i1, yb, j0)); bag.add(RF, box(i0, ya, j1, i1, yb, z1 + out));
  }
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) bag.add(RF, box(cx - out - (cx === x1 ? fw : 0), y0 + fh * 0.5, cz - out - (cz === z1 ? fw : 0), cx + out + (cx === x0 ? fw : 0), y1 - fh * 0.5, cz + out + (cz === z0 ? fw : 0)));
  if (!discs) return;
  const r = Math.min(0.34, (H - 2 * fh) * 0.3), sp = Math.max(2.6, r * 7), ym = (y0 + y1) / 2;
  if (r < 0.12) return;
  const ring = lathe([[r, 0], [r, 0.03], [0.001, 0.03]], 8), dot = lathe([[r * 0.7, 0], [r * 0.7, 0.06], [0.001, 0.06]], 8);
  for (const [fx, fz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const L = fx ? z1 - z0 : x1 - x0, n = Math.floor((L - 2 * fw) / sp);
    for (let i = 0; i < n; i++) {
      const u = (fx ? z0 : x0) + fw + (L - 2 * fw) * (i + 0.5) / n;
      const px = fx ? (fx > 0 ? x1 : x0) : u, pz = fx ? u : (fz > 0 ? z1 : z0);
      for (const [g, m] of [[ring, 'paint_minoan_black'], [dot, 'clay_green']]) {
        const c = g.clone();
        if (fx) c.rotateZ(-fx * Math.PI / 2); else c.rotateX(fz * Math.PI / 2);
        bag.add(m, c.translate(px, ym, pz));
      }
    }
  }
}

/**
 * The heads of the Temple of the Feathered Serpent (Met essay): the feathered serpent's head
 * thrusting out of a collar of feathers (a flower, read as a mirror), with brows, eyes, the open
 * jaw and fangs; and the second head, the geometric Cipactli or fire-serpent headdress without a
 * lower jaw — rings for eyes, a row of teeth, plates on top. Each about 0.9 m tall, tenoned to
 * stand about 0.9 m out of the tablero. Faces +z, its middle at y 0.
 */
export const teoSerpent = () => carved('teo-serpent', (k) => {
  k.petals('stucco_pale', 0, 0, 0, 0.62, 0.14, 11);
  k.fz(HS, [-0.34, 0.34, -0.26, 0.32], [-0.26, 0.26, -0.16, 0.26], 0.1, 0.92);                // the skull and upper jaw
  k.fz(HS, [-0.27, 0.27, 0.12, 0.34], [-0.2, 0.2, 0.14, 0.3], 0.62, 1.0);                    // the snout
  k.fz(HS, [-0.28, 0.28, -0.44, -0.3], [-0.2, 0.2, -0.42, -0.32], 0.12, 0.82);               // the open lower jaw
  for (const sx of [-1, 1]) {
    k.fy('plaster_white', [sx * 0.17 - 0.05, sx * 0.17 + 0.05, 0.8, 0.88], [sx * 0.17 - 0.01, sx * 0.17 + 0.01, 0.83, 0.85], -0.16, -0.38);   // the fangs
    k.bx(HS, Math.min(sx * 0.12, sx * 0.36), Math.max(sx * 0.12, sx * 0.36), 0.26, 0.4, 0.3, 0.72);   // the brow
    k.discAt('paint_minoan_black', sx * 0.3, 0.1, 0.52, 0.08, 0.05, sx * Math.PI / 2);               // the eye (obsidian)
  }
});
const teoCipactli = () => carved('teo-cipactli', (k) => {
  k.fz(HS, [-0.46, 0.46, -0.42, 0.36], [-0.42, 0.42, -0.34, 0.3], 0, 0.62);                  // the block of the headdress
  k.bx(HS, -0.34, 0.34, 0.3, 0.48, 0.1, 0.5);                                                  // the plates on top
  for (const sx of [-1, 1]) {
    k.disc(HS, sx * 0.2, 0.08, 0.6, 0.15, 0.08, 12, 0.07);                                   // the ringed eyes
    k.bx(HS, Math.min(sx * 0.42, sx * 0.52), Math.max(sx * 0.42, sx * 0.52), -0.3, 0.3, 0.05, 0.4);   // the side scrolls
  }
  for (let i = 0; i < 6; i++) { const x = -0.3 + i * 0.12; k.fy('plaster_white', [x - 0.04, x + 0.04, 0.48, 0.56], [x - 0.01, x + 0.01, 0.51, 0.53], -0.32, -0.48); }   // the teeth of the upper jaw
});

/**
 * tt_pyramid: { c, w, d (base), tw, td (top), h, levels, tablero (share of each level's height in a
 * vertical panel; 0 for plain sloping stages), stair ('w'|'s'|…), stairW, temple: { w, d, h }, heads (faces
 * whose tableros carry the Feathered Serpent's heads, e.g. 'nse'), talud (its material: stone, or red stucco) }.
 */
export function ttPyramid(el, ctx) {
  const { bag, col } = ctx;
  const [cx, cz] = el.c, n = el.levels, H = el.h, tb = el.tablero ?? 0.35, y0b = el.y ?? 0;
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, ya = y0b + H * t0, yb = y0b + H * t1, ht = yb - ya;
    const a = [(el.w - (el.w - el.tw) * t0) / 2, (el.d - (el.d - el.td) * t0) / 2], b = [(el.w - (el.w - el.tw) * t1) / 2, (el.d - (el.d - el.td) * t1) / 2];
    const yt = ya + ht * (1 - tb), sx = a[0] - b[0], sz = a[1] - b[1];
    // the next stage stands on this one within `inner` (its foot, a little in): faces hidden under it are left out
    const last = k === n - 1, inner = last ? null : [cx - b[0] + 0.3, cz - b[1] + 0.3, cx + b[0] - 0.3, cz + b[1] - 0.3];
    if (el.band && tb === 0) {
      // a plain stage with its painted cornice: the plastered slope below, a band of red paint under the ledge
      const lo = 1 - el.band, yl = ya + ht * lo, kx = sx * 0.85, kz = sz * 0.85;
      bag.add(el.talud ?? RB, frustum([cx - a[0], cz - a[1], cx + a[0], cz + a[1]], ya, yl, kx * lo, kx * lo, kz * lo, kz * lo, { noBottom: true, noTop: true }));
      bag.add(RD, frustum([cx - a[0] + kx * lo, cz - a[1] + kz * lo, cx + a[0] - kx * lo, cz + a[1] - kz * lo], yl, yt, kx * el.band, kx * el.band, kz * el.band, kz * el.band, { noBottom: true, noTop: !last }));
    } else
    bag.add(el.talud ?? RB, frustum([cx - a[0], cz - a[1], cx + a[0], cz + a[1]], ya, yt, sx * 0.85, sx * 0.85, sz * 0.85, sz * 0.85, { noBottom: true, noTop: tb > 0 || !last }));
    if (el.staged && el.stair === 'w' && tb === 0) {
      // the stair climbs stage by stage, a flight on each face and a landing on each ledge (the first stage's flight is hidden behind the Adosada)
      const sw = (el.stairW ?? 12) / 2, xo = cx - a[0], xi = cx - (a[0] - sx * 0.85);
      if (k > 0) ttStair({ rect: [xo - 0.3, cz - sw, xi - 0.3, cz + sw], y0: ya, y1: yb, dir: 'e', mat: S }, { bag, col });
      if (!last) col.floor([xi - 0.3, cz - sw, cx - b[0] + 0.3, cz + sw], yb);
    }
    if (tb === 0 && !last) {
      // a plain stage: only the ledge round the next stage's foot
      const q = [a[0] - sx * 0.85, a[1] - sz * 0.85], m = el.talud ?? RB, [i0, j0, i1, j1] = inner;
      bag.add(m, box(cx - q[0], yb - 0.05, cz - q[1], i0, yb, cz + q[1])); bag.add(m, box(i1, yb - 0.05, cz - q[1], cx + q[0], yb, cz + q[1]));
      bag.add(m, box(i0, yb - 0.05, cz - q[1], i1, yb, j0)); bag.add(m, box(i0, yb - 0.05, j1, i1, yb, cz + q[1]));
    }
    if (tb > 0) {
      const p = [a[0] - sx * 0.85 + 0.25, a[1] - sz * 0.85 + 0.25];
      tablero(bag, [cx - p[0], cz - p[1], cx + p[0], cz + p[1]], yt, yb, { discs: !el.heads, inner });
      // the Feathered Serpent's heads and the headdresses, alternating along the panels of the given faces
      if (el.heads) for (const f of el.heads) {
        const [fx, fz] = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f], half = fx ? p[1] : p[0], n = Math.floor((2 * half - 1.2) / 3.0);
        for (let i = 0; i < n; i++) {
          const u = -half + 0.6 + (2 * half - 1.2) * (i + 0.5) / n, ym = (yt + yb) / 2;
          if (f === el.stair && Math.abs(u) < (el.stairW ?? 12) / 2 + 1) continue;
          const x = fx ? cx + fx * p[0] : cx + u, z = fx ? cz + u : cz + fz * p[1];
          (i % 2 ? teoCipactli : teoSerpent)().emit(bag, x, ym, z, fx, fz, Math.min(1, (yb - yt) / 1.25));
        }
        // on the talud below, the feathered serpent's body undulating in relief among shells and conches
        const k = new Kit(), ah = a[fx ? 0 : 1], sl = (fx ? sx : sz) * 0.85, at = (y) => ah - (y - ya) / (yt - ya) * sl + 0.06, yc = (ya + yt) / 2, amp = (yt - ya) * 0.22, lam = 9;
        const P = (u, y) => (fx ? [cx + fx * at(y), y, cz + u] : [cx + u, y, cz + fz * at(y)]);
        const ha = a[fx ? 1 : 0] - 1, stp = 0.9;
        for (let u = -ha; u < ha - stp; u += stp) {
          if (f === el.stair && Math.abs(u) < (el.stairW ?? 12) / 2 + 1) continue;
          const y0 = yc + amp * Math.sin(u * 2 * Math.PI / lam), y1 = yc + amp * Math.sin((u + stp) * 2 * Math.PI / lam);
          k.seg(HS, P(u, y0), P(u + stp + 0.05, y1), 0.16, 0.24);
          if (Math.abs(Math.cos(u * 2 * Math.PI / lam)) < 0.12) {                       // a shell in each bend of the body
            const ys = y0 - Math.sign(Math.sin(u * 2 * Math.PI / lam)) * amp * 1.5;
            k.seg('stucco_pale', P(u - 0.4, ys), P(u + 0.45, ys), 0.2, 0.22, 0.04, 0.04);
          }
        }
        k.emit(bag, 0, 0, 0, 0, 1);
      }
    }
    if (tb > 0 && k === n - 1) { const p = [a[0] - sx * 0.85 + 0.25, a[1] - sz * 0.85 + 0.25]; bag.add('stucco_pale', frustum([cx - p[0] + 0.1, cz - p[1] + 0.1, cx + p[0] - 0.1, cz + p[1] - 0.1], yb - 0.1, yb + 0.03, 0, 0, 0, 0, { noBottom: true })); }   // the plastered top
    col.rect([cx - b[0], cz - b[1], cx + b[0], cz + b[1]], ya, yb); col.floor([cx - b[0], cz - b[1], cx + b[0], cz + b[1]], yb);
    if (tb === 0 && last) col.floor([cx - a[0] + sx * 0.85, cz - a[1] + sz * 0.85, cx + a[0] - sx * 0.85, cz + a[1] - sz * 0.85], yb);   // the whole of the top, out to its edge
    col.rect([cx - a[0] + sx * 0.4, cz - a[1] + sz * 0.4, cx + a[0] - sx * 0.4, cz + a[1] - sz * 0.4], ya, ya + ht * 0.5);
  }
  if (el.weather) weatherPyramid(bag, el);
  // the stair up the chosen face, the whole height
  // (`stairFoot`: the stair starts higher than the pyramid's base, on a plaza laid above it)
  const sw = (el.stairW ?? 12) / 2, sy0 = el.stairFoot ?? y0b, run = (y0b + H - sy0) * 1.05, f = el.stair || 'w', ov = tb === 0 && el.talud ? -0.15 * (el.w - el.tw) / 2 / n : 0.5;   // the stair's head laid over the top's edge (on a plastered top, ending at its edge)
  const r = f === 'w' ? [cx - el.tw / 2 - run, cz - sw, cx - el.tw / 2 + ov, cz + sw] : f === 'e' ? [cx + el.tw / 2 - ov, cz - sw, cx + el.tw / 2 + run, cz + sw] : f === 's' ? [cx - sw, cz + el.td / 2 - ov, cx + sw, cz + el.td / 2 + run] : [cx - sw, cz - el.td / 2 - run, cx + sw, cz - el.td / 2 + ov];
  if (!el.staged) ttStair({ rect: r, y0: sy0, y1: y0b + H, dir: { w: 'e', e: 'w', s: 'n', n: 's' }[f], mat: S }, { bag, col });
  if (el.temple) {
    // the temple: plastered walls, its doorway over the stair, a red cornice and a crest of almenas
    const T = el.temple, ty = y0b + H, [w, d] = [T.w / 2, T.d / 2], top = ty + T.h;
    const [fx, fz] = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f], dw = Math.min(1.2, (fx ? d : w) * 0.3), dh = Math.min(2.4, (T.h - 0.8) * 0.85);
    if (T.inner && fx) {
      // a chamber inside (palace.js): thick walls of rubble, the door a passage through the front one, a flat roof of beams and earth
      const tw = T.wall ?? 3, I = [cx - w + tw, cz - d + tw, cx + w - tw, cz + d - tw], fr = fx < 0 ? [cx - w, I[0]] : [I[2], cx + w];
      for (const r of [[cx - w, cz - d, cx + w, I[1]], [cx - w, I[3], cx + w, cz + d], fx < 0 ? [I[2], I[1], cx + w, I[3]] : [cx - w, I[1], I[0], I[3]], [fr[0], I[1], fr[1], cz - dw], [fr[0], cz + dw, fr[1], I[3]]]) { bag.add(S, box(r[0], ty, r[1], r[2], top - 0.6, r[3])); col.rect(r, ty, top); }
      bag.add(S, box(fr[0], ty + dh, cz - dw, fr[1], top - 0.6, cz + dw));
      bag.add(S, box(cx - w, top - 0.6, cz - d, cx + w, top + 0.02, cz + d));
      ttTempleInside(I, ty, top - 0.6, fx, T.seed ?? 7, ctx);
    } else {
      bag.add(S, box(cx - w, ty, cz - d, cx + w, top, cz + d));
      bag.add('opening', fx ? box(cx + fx * w - 0.06, ty, cz - dw, cx + fx * w + 0.06, ty + dh, cz + dw) : box(cx - dw, ty, cz + fz * d - 0.06, cx + dw, ty + dh, cz + fz * d + 0.06));
      col.rect([cx - w, cz - d, cx + w, cz + d], ty, top);
    }
    if (T.inner && fx) for (const r of [[cx - w - 0.3, cz - d - 0.3, cx + w + 0.3, cz - d + 0.4], [cx - w - 0.3, cz + d - 0.4, cx + w + 0.3, cz + d + 0.3], [cx - w - 0.3, cz - d + 0.4, cx - w + 0.4, cz + d - 0.4], [cx + w - 0.4, cz - d + 0.4, cx + w + 0.3, cz + d - 0.4]]) bag.add(RD, box(r[0], top - 0.8, r[1], r[2], top, r[3]));   // the cornice, a ring round the walls' heads
    else bag.add(RD, box(cx - w - 0.3, top - 0.8, cz - d - 0.3, cx + w + 0.3, top, cz + d + 0.3));
    const am = Math.min(0.9, T.h * 0.22);
    for (const [ax, az, bx, bz] of [[-w, -d, w, -d], [-w, d, w, d], [-w, -d, -w, d], [w, -d, w, d]]) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.floor(L / 1.3));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, x = cx + ax + (bx - ax) * t, z = cz + az + (bz - az) * t, along = az === bz;
        if ((!along && (i === 0 || i === n - 1))) continue;                    // the corners once
        bag.add(S, along ? box(x - 0.32, top, z - 0.1, x + 0.32, top + am, z + 0.1) : box(x - 0.1, top, z - 0.32, x + 0.1, top + am, z + 0.32));
        bag.add(RD, along ? box(x - 0.12, top + am * 0.35, z - 0.13, x + 0.12, top + am * 0.75, z + 0.13) : box(x - 0.13, top + am * 0.35, z - 0.12, x + 0.13, top + am * 0.75, z + 0.12));
      }
    }
  }
}

/**
 * tt_wall: a long talud-tablero platform a rectangle { rect, h, y } (the Ciudadela's banks, the
 * platforms that enclose the avenue's sunken plazas and cross it): the sloping talud below, the
 * framed and painted tablero above standing out over it, the top a walk.
 */
export function ttWall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h, y = el.y ?? 0, ins = Math.min(1.0, (x1 - x0) / 4, (z1 - z0) / 4), yt = y + h * 0.4;
  // `foot`: the talud carried on down at its slope below y (where the ground falls away beside a plaza laid higher)
  const ft = el.foot ?? 0, e = ft * ins / (yt - y);
  bag.add(RD, frustum([x0 - e, z0 - e, x1 + e, z1 + e], y - ft, yt, ins + e, ins + e, ins + e, ins + e, { noBottom: true, noTop: true }));
  const p = ins - 0.3;
  tablero(bag, [x0 + p, z0 + p, x1 - p, z1 - p], yt, y + h, { out: 0.22, discs: el.discs !== false });
  bag.add('stucco_pale', frustum([x0 + p + 0.1, z0 + p + 0.1, x1 - p - 0.1, z1 - p - 0.1], y + h - 0.1, y + h + 0.03, 0, 0, 0, 0, { noBottom: true }));   // the plastered top
  col.rect([x0, z0, x1, z1], y - ft, y + h); col.floor([x0 + p - 0.22, z0 + p - 0.22, x1 - p + 0.22, z1 - p + 0.22], y + h);
}

/** tt_floor: a plastered floor { rect, y, mat } laid on the ground (a thin slab, its underside left out). */
function ttFloor(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.03;
  bag.add(el.mat || 'stucco_pale', frustum([x0, z0, x1, z1], y - 0.25, y, 0, 0, 0, 0, { noBottom: true }));
  col.floor(el.rect, y);
}

/**
 * compound: an apartment compound { rect, seed }: a blank outer wall on a talud, one doorway in it;
 * rooms (flat-roofed blocks) round a sunken main patio and a second one; the rooms on the main patio
 * raised on low talud platforms and opened to it by porticoes of square pillars, the principal room on
 * its north side higher, with a crest of almenas; a small talud-tablero altar in the patio's middle.
 */
function compound(el, ctx) {
  const { bag, col } = ctx;
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 3.2, gate = Math.floor(rand() * 4), gw = 0.9;
  // the outer wall, a doorway in the middle of one side
  const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
  const sides = [[[x0, z0, x1, z0 + 1], 'x'], [[x0, z1 - 1, x1, z1], 'x'], [[x0, z0 + 1, x0 + 1, z1 - 1], 'z'], [[x1 - 1, z0 + 1, x1, z1 - 1], 'z']];
  sides.forEach(([r, ax], i) => {
    const parts = i !== gate ? [r] : ax === 'x' ? [[r[0], r[1], xm - gw, r[3]], [xm + gw, r[1], r[2], r[3]]] : [[r[0], r[1], r[2], zm - gw], [r[0], zm + gw, r[2], r[3]]];
    for (const q of parts) { bag.add(S, box(q[0], 0, q[1], q[2], h, q[3])); col.rect(q, 0, h); }
    if (i === gate) {                                                                   // the wall over the doorway on a painted lintel
      bag.add(S, ax === 'x' ? box(xm - gw, 2.6, r[1], xm + gw, h, r[3]) : box(r[0], 2.6, zm - gw, r[2], h, zm + gw));
      bag.add(RD, ax === 'x' ? box(xm - gw - 0.2, 2.3, r[1] - 0.05, xm + gw + 0.2, 2.6, r[3] + 0.05) : box(r[0] - 0.05, 2.3, zm - gw - 0.2, r[2] + 0.05, 2.6, zm + gw + 0.2));
    }
  });
  bag.add(RB, frustum([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], 0, 0.9, 0.5, 0.5, 0.5, 0.5, { noBottom: true, noTop: true }));   // (a ring: its top must not roof the courts and floors inside)
  // the outer wall's plaster patched where it was re-laid, here and there fallen away from the rubble core
  for (const [nx, nz, c] of [[0, -1, z0], [0, 1, z1], [-1, 0, x0], [1, 0, x1]]) {
    const L = nx ? z1 - z0 : x1 - x0, a0 = nx ? z0 : x0;
    for (let i = 0; i < 2 + Math.floor(rand() * 3); i++) {
      const u = a0 + 1.5 + rand() * (L - 3), spall = rand() < 0.3, w = spall ? 0.4 + rand() * 0.6 : 0.9 + rand() * 1.6, hh = spall ? 0.3 + rand() * 0.4 : 0.6 + rand() * 0.9;
      const y = spall ? 1.15 + rand() * 0.5 : 1.0 + hh / 2 + rand() * (2.9 - 1.0 - hh);
      if (Math.abs(u - (nx ? zm : xm)) < gw + w / 2 + 0.3) continue;                      // clear of the doorway
      patch(bag, spall ? RB : rand() < 0.5 ? 'lime_plaster' : 'stucco_pale', nx ? [c, y, u] : [u, y, c], [nx, 0, nz], w, hh, Math.floor(rand() * 1e6), spall ? 0.004 : 0.01);
    }
  }
  if (el.simple) {
    // the far tile: the wall, the rooms as blocks on their platforms and the patio's floor; no fronts, rooms or furniture
    const cw = (x1 - x0 - 2) / 3, cd = (z1 - z0 - 2) / 3;
    bag.add('stucco_pale', frustum([x0 + 1 + cw + 0.5, z0 + 1 + cd + 0.5, x0 + 1 + 2 * cw - 0.5, z0 + 1 + 2 * cd - 0.5], -0.2, 0.06, 0, 0, 0, 0, { noBottom: true }));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) continue;
      const r = [x0 + 1 + i * cw + 0.6, z0 + 1 + j * cd + 0.6, x0 + 1 + (i + 1) * cw - 0.6, z0 + 1 + (j + 1) * cd - 0.6];
      bag.add(S, box(r[0], 0, r[1], r[2], i === 1 && j === 0 ? h + 0.4 : h - 0.2, r[3]));
    }
    return;
  }
  streetFront(ctx, el.rect, gate, h, el.seed || 1, el.rich ?? 0.6);
  // rooms: a grid of blocks, the middle cell the main patio, another the second patio
  const nx = 3, nz = 3, cw = (x1 - x0 - 2) / nx, cd = (z1 - z0 - 2) / nz, second = [0, 2, 6, 8][Math.floor(rand() * 4)];
  const P = [x0 + 1 + cw, z0 + 1 + cd, x0 + 1 + 2 * cw, z0 + 1 + 2 * cd];            // the main patio
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const k = i * nz + j, cx0 = x0 + 1 + i * cw, cz0 = z0 + 1 + j * cd;
    if (k === 4 || k === second) {
      bag.add(k === 4 ? 'stucco_pale' : 'stucco', frustum([cx0 + 0.5, cz0 + 0.5, cx0 + cw - 0.5, cz0 + cd - 0.5], -0.2, 0.06, 0, 0, 0, 0, { noBottom: true }));
      if (k !== 4 && el.workshop) midden(bag, col, cx0 + cw / 2, 0.06, cz0 + cd / 2, el.seed + k);
      if (k !== 4 && el.craft === 'potter') kiln(ctx, cx0 + cw / 2, 0.06, cz0 + cd / 2, el.seed + k);
      if (k !== 4 && el.craft === 'weaver') dyeYard(ctx, cx0 + cw / 2, 0.06, cz0 + cd / 2, el.seed + k);
      if (k === 4) {
        // the altar: a talud and a framed tablero, a little shrine in miniature
        const ax = cx0 + cw / 2, az = cz0 + cd / 2;
        bag.add(RD, frustum([ax - 1, az - 1, ax + 1, az + 1], 0.06, 0.5, 0.2, 0.2, 0.2, 0.2, { noBottom: true, noTop: true }));
        tablero(bag, [ax - 0.85, az - 0.85, ax + 0.85, az + 0.85], 0.5, 1.15, { out: 0.12, discs: false });
        col.rect([ax - 1, az - 1, ax + 1, az + 1], 0, 1.15);
      }
      continue;
    }
    // which side of the room faces the main patio (rooms beside it), and how far
    const face = k === 1 ? 'e' : k === 7 ? 'w' : k === 3 ? 's' : k === 5 ? 'n' : null;
    const r = [cx0 + 0.6, cz0 + 0.6, cx0 + cw - 0.6, cz0 + cd - 0.6];
    if (!face) {
      bag.add(S, box(r[0], 0, r[1], r[2], h - 0.2, r[3])); col.rect(r, 0, h); col.floor(r, h - 0.2);
      bag.add(RD, box(r[0] - 0.02, 0, r[1] - 0.02, r[2] + 0.02, 0.6, r[3] + 0.02));
      continue;
    }
    const principal = face === 's', ph = principal ? 1.1 : 0.5, rh = h + (principal ? 0.6 : 0) - 0.2, pd = 2.6;
    // the platform with its stair down into the patio
    bag.add(RD, frustum(r, 0, ph, 0, 0, 0, 0, { noBottom: true })); col.rect(r, 0, ph); col.floor(r, ph);
    const [fx, fz] = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[face];
    const mx = (r[0] + r[2]) / 2, mz = (r[1] + r[3]) / 2, edge = fx ? (fx > 0 ? r[2] : r[0]) : (fz > 0 ? r[3] : r[1]);
    ttStair({ rect: fx ? [fx > 0 ? edge : edge - ph * 1.6, mz - 1.4, fx > 0 ? edge + ph * 1.6 : edge, mz + 1.4] : [mx - 1.4, fz > 0 ? edge : edge - ph * 1.6, mx + 1.4, fz > 0 ? edge + ph * 1.6 : edge], y0: 0.06, y1: ph, dir: { e: 'w', w: 'e', s: 'n', n: 's' }[face], mat: S }, { bag, col });
    // the room set back behind its portico; the roof over both; two pillars at the front
    const back = fx ? (fx > 0 ? [r[0], r[1], r[2] - pd, r[3]] : [r[0] + pd, r[1], r[2], r[3]]) : (fz > 0 ? [r[0], r[1], r[2], r[3] - pd] : [r[0], r[1] + pd, r[2], r[3]]);
    // the rooms behind it, each with its doorway on the portico, furnished (rooms.js)
    const across = fx ? back[3] - back[1] : back[2] - back[0], nr = across > 11 ? 3 : 2;
    const roles = principal ? (nr === 3 ? ['sleep', 'shrine', 'sleep'] : ['shrine', 'sleep']) : Array.from({ length: nr }, (_, j) => (k === 1 && j === 0 ? 'kitchen' : ['sleep', 'store', 'kitchen', 'sleep'][Math.floor(rand() * 4)]));
    if (el.mural && principal) roles[nr === 3 ? 0 : 1] = 'mural';
    if (el.workshop && face === 'e') roles[roles.length - 1] = 'workshop';
    if (el.craft && face === 'n') roles[roles.length - 1] = el.craft;
    porticoRooms(ctx, back, [fx, fz], ph, rh - 0.45, roles, rand);
    bag.add(S, box(r[0], rh - 0.45, r[1], r[2], rh, r[3])); col.floor(r, rh);
    const L = fx ? r[3] - r[1] : r[2] - r[0];
    for (const t of [1 / 3, 2 / 3]) {
      const u = (fx ? r[1] : r[0]) + L * t;
      const [px, pz] = fx ? [edge - fx * 0.45, u] : [u, edge - fz * 0.45];
      bag.add(S, box(px - 0.3, ph, pz - 0.3, px + 0.3, rh - 0.45, pz + 0.3)); bag.add(RD, box(px - 0.32, ph, pz - 0.32, px + 0.32, ph + 0.5, pz + 0.32));
      col.rect([px - 0.3, pz - 0.3, px + 0.3, pz + 0.3], ph, rh);
    }
    bag.add(RD, box(r[0] - 0.03, rh - 0.45, r[1] - 0.03, r[2] + 0.03, rh - 0.2, r[3] + 0.03));    // the painted cornice band
    if (principal) for (let x = r[0] + 0.6; x < r[2] - 0.4; x += 1.2) { bag.add(S, box(x - 0.3, rh, edge - 0.25, x + 0.3, rh + 0.7, edge - 0.08)); bag.add(RD, box(x - 0.12, rh + 0.25, edge - 0.27, x + 0.12, rh + 0.55, edge - 0.06)); }
  }
}

registerStyle('teotihuacano', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, tt_pyramid: ttPyramid, tt_wall: ttWall, tt_stair: ttStair, tt_floor: ttFloor, compound, tt_palace: ttPalace, tt_jaguars: ttJaguars, tt_plaza_altars: ttPlazaAltars, tt_cross_altar: ttCrossAltar, tt_goddess: ttGoddess, tt_people: ttPeople, tt_market: ttMarket, meso_plants: ttPlants, tt_avenue: ttAvenue, tt_puma: ttPuma },
  objects: {},
});
