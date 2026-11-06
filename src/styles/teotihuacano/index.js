// Teotihuacano architecture (c. 100–550; docs/settlements/teotihuacan.md §4): talud-tablero — each
// stage a sloping apron with a framed vertical panel above — stuccoed and painted; pyramids with a
// stair on one face, the Adosada platform before them; walled apartment compounds of rooms round
// patios; the avenue's cross walls.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';
import { carved, Kit } from '../maya/meso.js';

const S = 'stucco_ochre', RD = 'stucco_red', RF = 'limewash_red', RB = 'rubble_teo', HS = 'andesite';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const stairs = (el, ctx) => STYLES.qing.elements.stairs(el, ctx);

/**
 * tt_stair: a stair { rect, y0, y1, dir (the way up), mat } between its alfardas — the plain sloping
 * balustrades either side, standing a little above the treads and painted red.
 */
function ttStair(el, { bag, col }) {
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
function tablero(bag, [x0, z0, x1, z1], y0, y1, { out = 0.25, discs = true, inner = null } = {}) {
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
const teoSerpent = () => carved('teo-serpent', (k) => {
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
function ttPyramid(el, { bag, col }) {
  const [cx, cz] = el.c, n = el.levels, H = el.h, tb = el.tablero ?? 0.35, y0b = el.y ?? 0;
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, ya = y0b + H * t0, yb = y0b + H * t1, ht = yb - ya;
    const a = [(el.w - (el.w - el.tw) * t0) / 2, (el.d - (el.d - el.td) * t0) / 2], b = [(el.w - (el.w - el.tw) * t1) / 2, (el.d - (el.d - el.td) * t1) / 2];
    const yt = ya + ht * (1 - tb), sx = a[0] - b[0], sz = a[1] - b[1];
    // the next stage stands on this one within `inner` (its foot, a little in): faces hidden under it are left out
    const last = k === n - 1, inner = last ? null : [cx - b[0] + 0.3, cz - b[1] + 0.3, cx + b[0] - 0.3, cz + b[1] - 0.3];
    bag.add(el.talud ?? RB, frustum([cx - a[0], cz - a[1], cx + a[0], cz + a[1]], ya, yt, sx * 0.85, sx * 0.85, sz * 0.85, sz * 0.85, { noBottom: true, noTop: tb > 0 || !last }));
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
    col.rect([cx - a[0] + sx * 0.4, cz - a[1] + sz * 0.4, cx + a[0] - sx * 0.4, cz + a[1] - sz * 0.4], ya, ya + ht * 0.5);
  }
  // the stair up the chosen face, the whole height
  const sw = (el.stairW ?? 12) / 2, run = H * 1.05, f = el.stair || 'w';
  const r = f === 'w' ? [cx - el.tw / 2 - run, cz - sw, cx - el.tw / 2 + 0.5, cz + sw] : f === 'e' ? [cx + el.tw / 2 - 0.5, cz - sw, cx + el.tw / 2 + run, cz + sw] : f === 's' ? [cx - sw, cz + el.td / 2 - 0.5, cx + sw, cz + el.td / 2 + run] : [cx - sw, cz - el.td / 2 - run, cx + sw, cz - el.td / 2 + 0.5];
  ttStair({ rect: r, y0: y0b, y1: y0b + H, dir: { w: 'e', e: 'w', s: 'n', n: 's' }[f], mat: S }, { bag, col });
  if (el.temple) {
    // the temple: plastered walls, its doorway over the stair, a red cornice and a crest of almenas
    const T = el.temple, ty = y0b + H, [w, d] = [T.w / 2, T.d / 2], top = ty + T.h;
    bag.add(S, box(cx - w, ty, cz - d, cx + w, top, cz + d));
    bag.add(RD, box(cx - w - 0.3, top - 0.8, cz - d - 0.3, cx + w + 0.3, top, cz + d + 0.3));
    const [fx, fz] = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f], dw = Math.min(1.2, (fx ? d : w) * 0.3), dh = Math.min(2.4, (T.h - 0.8) * 0.85);
    bag.add('opening', fx ? box(cx + fx * w - 0.06, ty, cz - dw, cx + fx * w + 0.06, ty + dh, cz + dw) : box(cx - dw, ty, cz + fz * d - 0.06, cx + dw, ty + dh, cz + fz * d + 0.06));
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
    col.rect([cx - w, cz - d, cx + w, cz + d], ty, top);
  }
}

/**
 * tt_wall: a long talud-tablero platform a rectangle { rect, h, y } (the Ciudadela's banks, the
 * platforms that enclose the avenue's sunken plazas and cross it): the sloping talud below, the
 * framed and painted tablero above standing out over it, the top a walk.
 */
function ttWall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h, y = el.y ?? 0, ins = Math.min(1.0, (x1 - x0) / 4, (z1 - z0) / 4), yt = y + h * 0.4;
  bag.add(RD, frustum([x0, z0, x1, z1], y, yt, ins, ins, ins, ins, { noBottom: true, noTop: true }));
  const p = ins - 0.3;
  tablero(bag, [x0 + p, z0 + p, x1 - p, z1 - p], yt, y + h, { out: 0.22, discs: el.discs !== false });
  bag.add('stucco_pale', frustum([x0 + p + 0.1, z0 + p + 0.1, x1 - p - 0.1, z1 - p - 0.1], y + h - 0.1, y + h + 0.03, 0, 0, 0, 0, { noBottom: true }));   // the plastered top
  col.rect([x0, z0, x1, z1], y, y + h); col.floor([x0 + p - 0.22, z0 + p - 0.22, x1 - p + 0.22, z1 - p + 0.22], y + h);
}

/** tt_floor: a plastered floor { rect, y, mat } laid on the ground (a thin slab, its underside left out). */
function ttFloor(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.03;
  bag.add(el.mat || 'stucco_pale', frustum([x0, z0, x1, z1], y - 0.25, y, 0, 0, 0, 0, { noBottom: true }));
  col.floor(el.rect, y);
}

/** compound: an apartment compound { rect, seed }: a blank outer wall on a talud, rooms (flat-roofed blocks) round three or four patios, a small altar in the main patio, a door on one side. */
function compound(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 3.2;
  for (const r of [[x0, z0, x1, z0 + 1], [x0, z1 - 1, x1, z1], [x0, z0 + 1, x0 + 1, z1 - 1], [x1 - 1, z0 + 1, x1, z1 - 1]]) { bag.add(S, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); }
  bag.add(RB, frustum([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], 0, 0.9, 0.5, 0.5, 0.5, 0.5));
  // rooms: a grid of blocks with patios left open
  const nx = 3, nz = 3, cw = (x1 - x0 - 2) / nx, cd = (z1 - z0 - 2) / nz, open = new Set([4, Math.floor(rand() * 9)]);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const k = i * nz + j, cx0 = x0 + 1 + i * cw, cz0 = z0 + 1 + j * cd;
    if (open.has(k)) { bag.add('stucco', box(cx0 + 0.5, 0, cz0 + 0.5, cx0 + cw - 0.5, 0.06, cz0 + cd - 0.5)); if (k === 4) { bag.add(RD, box(cx0 + cw / 2 - 0.8, 0, cz0 + cd / 2 - 0.8, cx0 + cw / 2 + 0.8, 1, cz0 + cd / 2 + 0.8)); } continue; }
    const r = [cx0 + 0.6, cz0 + 0.6, cx0 + cw - 0.6, cz0 + cd - 0.6];
    bag.add(S, box(r[0], 0, r[1], r[2], h - 0.2, r[3])); col.rect(r, 0, h); col.floor(r, h - 0.2);
    bag.add(RD, box(r[0] - 0.02, 0, r[1] - 0.02, r[2] + 0.02, 0.6, r[3] + 0.02));
  }
}

registerStyle('teotihuacano', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, tt_pyramid: ttPyramid, tt_wall: ttWall, tt_stair: ttStair, tt_floor: ttFloor, compound },
  objects: {},
});
