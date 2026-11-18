// The furniture of the temple's gate and forecourt (docs/settlements/ming-suzhou.md §20): the great incense burner of bronze
// on its stone base before the hall, the door leaves of the gate folded back against the wall's inner face with their rows of iron
// studs, the stone threshold, a pair of stone lions on plinths outside the gate, the stone lamp posts and a worn path of the
// pilgrims' feet in the paving. One element, `temple_ware`, builds them into one geometry per material (nothing instanced).

import { Acc, hash } from './townwork.js';

/** temple_ware { c: [x, z of the gate's middle on the wall's line], z1 (the wall's line), zt (the hall steps' foot), y } */
export function templeWare(el, ctx) {
  const [cx, zg] = el.gate, y = el.y ?? 0.04, acc = new Acc();
  // the burner: a granite plinth in two steps, a bronze cauldron on three legs with two ears, a lid of open work with a bud, and the ash in it
  const [bx, bz] = el.burner;
  acc.box('granite_grey', bx - 0.7, y, bz - 0.7, bx + 0.7, y + 0.12, bz + 0.7);
  acc.box('granite_grey', bx - 0.56, y + 0.12, bz - 0.56, bx + 0.56, y + 0.3, bz + 0.56);
  acc.box('granite_block', bx - 0.46, y + 0.3, bz - 0.46, bx + 0.46, y + 0.34, bz + 0.46);
  ctx.col.circle(bx, bz, 0.78, y, y + 1.4);
  acc.lathe('bronze', [[0.001, 0.36], [0.3, 0.36], [0.4, 0.5], [0.46, 0.8], [0.48, 1.05], [0.44, 1.07], [0.44, 1.0], [0.4, 0.8], [0.34, 0.56], [0.001, 0.52]], 16, bx, y, bz);
  acc.lathe('bronze', [[0.43, 1.0], [0.5, 1.03], [0.5, 1.09], [0.43, 1.07]], 16, bx, y, bz);
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5, lx = bx + Math.cos(a) * 0.34, lz = bz + Math.sin(a) * 0.34; acc.lathe('bronze', [[0.001, 0], [0.07, 0], [0.09, 0.1], [0.06, 0.38], [0.001, 0.4]], 7, lx, y + 0.34, lz); }
  for (const s of [-1, 1]) { acc.box('bronze', bx + s * 0.5 - 0.02, y + 0.95, bz - 0.17, bx + s * 0.5 + 0.02, y + 1.2, bz - 0.11); acc.box('bronze', bx + s * 0.5 - 0.02, y + 0.95, bz + 0.11, bx + s * 0.5 + 0.02, y + 1.2, bz + 0.17); acc.box('bronze', bx + s * 0.5 - 0.02, y + 1.17, bz - 0.17, bx + s * 0.5 + 0.02, y + 1.22, bz + 0.17); }
  acc.lathe('bronze', [[0.001, 1.07], [0.4, 1.07], [0.36, 1.16], [0.2, 1.24], [0.06, 1.3], [0.06, 1.38], [0.001, 1.44]], 16, bx, y, bz);
  acc.lathe('iron', [[0.001, 1.04], [0.4, 1.04], [0.4, 1.07], [0.001, 1.07]], 14, bx, y, bz);
  // the gate: the threshold (a raised board of granite across the opening), the door leaves swung back inward against the wall, studs in rows, iron straps, ring handles
  const W = el.w ?? 3.2, H = el.h ?? 3.5;
  acc.box('granite_grey', cx - W / 2 - 0.05, y, zg - 0.3, cx + W / 2 + 0.05, y + 0.17, zg + 0.3);
  for (const s of [-1, 1]) {
    const xa = cx + s * (W / 2 + 0.06), xb = cx + s * (W / 2 + 1.66), x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), zf = zg - 0.34;   // (the leaf folded back flat against the wall's inner face)
    acc.box('lacquer_red', x0, y + 0.17, zf, x1, y + H - 0.4, zf + 0.08);
    for (const yy of [0.5, 1.55, 2.6]) acc.box('iron', x0, y + yy, zf - 0.012, x1, y + yy + 0.1, zf);
    for (let r = 0; r < 7; r++) for (let q = 0; q < 6; q++) {
      const xx = x0 + 0.14 + q * (x1 - x0 - 0.28) / 5, yy = y + 0.45 + r * 0.42, j = (hash(xx, yy, s) - 0.5) * 0.004;
      acc.box('iron', xx - 0.03, yy, zf - 0.02 + j, xx + 0.03, yy + 0.06, zf);
    }
    acc.lathe('bronze', [[0.001, 0], [0.07, 0], [0.07, 0.02], [0.001, 0.02]], 10, xa + s * 0.3, y + 1.45, zf - 0.03);
  }
  // a pair of stone lions on plinths outside the gate, the male with his ball on the left, the female with her cub on the right (as one stands facing out)
  for (const s of [-1, 1]) {
    const lx = cx + s * (W / 2 + 1.15), lz = zg + 1.5;
    acc.box('granite_grey', lx - 0.5, y, lz - 0.55, lx + 0.5, y + 0.28, lz + 0.55);
    acc.box('granite_block', lx - 0.4, y + 0.28, lz - 0.45, lx + 0.4, y + 0.36, lz + 0.45);
    acc.lathe('granite_grey', [[0.001, 0], [0.26, 0], [0.34, 0.2], [0.3, 0.45], [0.2, 0.62], [0.001, 0.66]], 10, lx, y + 0.36, lz - 0.1);         // haunches and chest
    acc.lathe('granite_grey', [[0.001, 0], [0.2, 0], [0.22, 0.12], [0.2, 0.4], [0.14, 0.62], [0.001, 0.66]], 10, lx, y + 0.36 + 0.34, lz + 0.14);   // the forequarters, upright
    acc.lathe('granite_grey', [[0.001, 0], [0.19, 0], [0.24, 0.1], [0.22, 0.24], [0.12, 0.32], [0.001, 0.34]], 10, lx, y + 1.0, lz + 0.18);         // the head and its mane
    acc.box('granite_grey', lx - 0.13, y + 0.36, lz + 0.22, lx - 0.05, y + 0.78, lz + 0.34); acc.box('granite_grey', lx + 0.05, y + 0.36, lz + 0.22, lx + 0.13, y + 0.78, lz + 0.34);  // the forelegs
    acc.lathe('granite_grey', [[0.001, 0], [0.09, 0], [0.11, 0.1], [0.09, 0.2], [0.001, 0.22]], 8, lx + s * 0.55 * 0 - 0.0 + (s < 0 ? 0.3 : -0.3), y + 0.36, lz + 0.3);   // the ball / the cub by the paw
    ctx.col.circle(lx, lz, 0.6, y, y + 1.4);
  }
  // the stone lamp posts: two stone posts in the court either side of the way, the lamp-house open at the four sides
  for (const s of [-1, 1]) {
    const px = cx + s * 3.2, pz = bz + 0.4;
    acc.box('granite_grey', px - 0.3, y, pz - 0.3, px + 0.3, y + 0.2, pz + 0.3);
    acc.lathe('granite_grey', [[0.001, 0], [0.16, 0], [0.12, 0.05], [0.11, 1.0], [0.2, 1.05], [0.2, 1.12], [0.001, 1.14]], 8, px, y + 0.2, pz);
    acc.box('granite_grey', px - 0.19, y + 1.34, pz - 0.19, px + 0.19, y + 1.38, pz + 0.19);
    for (const [ox, oz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) acc.box('granite_grey', px + ox * 0.16 - 0.025, y + 1.38, pz + oz * 0.16 - 0.025, px + ox * 0.16 + 0.025, y + 1.7, pz + oz * 0.16 + 0.025);
    acc.lathe('granite_grey', [[0.001, 1.7], [0.3, 1.7], [0.28, 1.76], [0.16, 1.88], [0.001, 1.96]], 4, px, y, pz);
    ctx.col.circle(px, pz, 0.32, y, y + 1.96);
  }
  // the pilgrims' path: the paving's worn centre line from the gate to the steps, long slabs rubbed darker, with the hollows where they stand to bow
  const zA = zg - 0.6, zB = el.zt;
  for (let z = zA; z > zB + 0.6;) {
    const l = Math.min(1.1 + hash(cx, z, 3) * 0.9, z - zB - 0.2), w = 0.45 + 0.2 * hash(cx, z, 4), o = (hash(cx, z, 5) - 0.5) * 0.3;
    acc.quad('granite_grey', [cx + o - w, y + 0.008, z], [cx + o + w, y + 0.008, z], [cx + o + w, y + 0.008, z - l], [cx + o - w, y + 0.008, z - l]);
    z -= l + 0.15 + hash(cx, z, 6) * 0.3;
  }
  acc.flush(ctx.bag);
}
