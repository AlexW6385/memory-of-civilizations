// The lanes and the courts of Bhaktapur's town (docs/settlements/bhaktapur.md §4.3): the lane's paving with its stone drain and cross slabs,
// the courts kept between houses for a stone spout, a rest-house, a pipal on its seat or a small stone shrine, with the brick wall round them.

import { box, lathe, rod } from '../../core/geom.js';
import { shikhara, chaitya } from './temples.js';
import { pot } from './pottery.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const bx = (x0, y0, z0, x1, y1, z1) => box(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1));

/** newar_lane { rect, y, reach }: a street's furniture — a granite drain along its middle, a kerb of sandstone along its edges, a slab across every 9–14 m [inferred: stone-dressed brick lanes]. */
export function lane(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = (el.y ?? 0.05), rand = rng(el.seed ?? 5), horiz = x1 - x0 > z1 - z0, reach = el.reach ?? 125;
  const cl = (a, b, c) => { const lo = Math.max(a, -c), hi = Math.min(b, c); return lo < hi ? [lo, hi] : null; };
  const [a0, a1] = horiz ? [x0, x1] : [z0, z1], [c0, c1] = horiz ? [z0, z1] : [x0, x1], mid = (c0 + c1) / 2, wide = c1 - c0 > 5.5;
  const put = (mat, u0, v0, u1, v1, h) => bag.add(mat, horiz ? bx(u0, y, v0, u1, y + h, v1) : bx(v0, y, u0, v1, y + h, u1));
  const cross = horiz ? Math.hypot(0, mid) : Math.hypot(mid, 0);
  const R = Math.sqrt(Math.max(0, reach * reach - cross * cross));
  const seg = cl(a0, a1, R); if (!seg) return;
  put('granite_grey', seg[0], mid - 0.18, seg[1], mid + 0.18, 0.012);
  for (const side of [c0, c1 - 0.28]) put('sandstone_floor', seg[0], side, seg[1], side + 0.28, 0.02);
  for (let u = seg[0] + 2 + rand() * 6; u < seg[1] - 1; u += 9 + rand() * 5) put('sandstone_floor', u, c0 + 0.28, u + 0.55 + rand() * 0.25, c1 - 0.28, 0.014);
  void wide;
}

/** newar_court { rect, front, use ('dhara' | 'pati' | 'tree' | 'shrine'), seed }: a lot kept as a court: brick wall on three sides, the front open between gate posts, paved within, with its piece. */
export function makeCourt({ dhara, pati, tree }) {
  return (el, ctx) => {
    const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, f = el.front, rand = rng(el.seed ?? 3);
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, t = 0.4, h = 2.7;
    const wall = (a, b, c, d) => { bag.add('brick', bx(a, 0, b, c, h, d)); bag.add('sandstone', bx(a - 0.05, h, b - 0.05, c + 0.05, h + 0.1, d + 0.05)); col.rect([Math.min(a, c), Math.min(b, d), Math.max(a, c), Math.max(b, d)], 0, h + 0.1); };
    // the walls: the rear and the two sides (the sides run to the front's line less a gate-post's width)
    if (f === 's') { wall(x0, z0, x1, z0 + t); } else if (f === 'n') { wall(x0, z1 - t, x1, z1); } else if (f === 'e') { wall(x0, z0, x0 + t, z1); } else { wall(x1 - t, z0, x1, z1); }
    if (f === 's' || f === 'n') { wall(x0, z0, x0 + t, z1); wall(x1 - t, z0, x1, z1); } else { wall(x0, z0, x1, z0 + t); wall(x0, z1 - t, x1, z1); }
    // the floor of stone slabs, the posts of the gate
    bag.add('sandstone_floor', bx(x0 + t, 0, z0 + t, x1 - t, 0.07, z1 - t)); col.floor([x0 + t, z0 + t, x1 - t, z1 - t], 0.07);
    for (const s of [-1, 1]) { const px = f === 's' || f === 'n' ? cx + s * 1.5 : (f === 'e' ? x1 - 0.4 : x0 + 0.4), pz = f === 's' || f === 'n' ? (f === 's' ? z1 - 0.4 : z0 + 0.4) : cz + s * 1.5; bag.add('timber', bx(px - 0.1, 0, pz - 0.1, px + 0.1, 2.3, pz + 0.1)); bag.add('gilt_bronze', bx(px - 0.12, 2.3, pz - 0.12, px + 0.12, 2.38, pz + 0.12)); col.circle(px, pz, 0.12, 0, 2.4); }
    const yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[f];
    const inset = (hw) => { const k = f === 's' ? [cx, z1 - 1.4] : f === 'n' ? [cx, z0 + 1.4] : f === 'e' ? [x1 - 1.4, cz] : [x0 + 1.4, cz]; void hw; return k; };
    if (el.use === 'dhara') {
      dhara({ c: f === 's' ? [cx, z0 + t + 0.3] : f === 'n' ? [cx, z1 - t - 0.3] : f === 'e' ? [x0 + t + 0.3, cz] : [x1 - t - 0.3, cz], yaw }, ctx);
      // women's pots set down beside the basin
      const q = (u, v) => [cx + (f === 'e' || f === 'w' ? 0 : u) + (f === 'e' ? v : f === 'w' ? -v : 0), cz + (f === 'n' || f === 's' ? (f === 's' ? v : -v) : u)];
      for (let k = 0; k < 4; k++) { const p = q(-1.8 + k * 0.5 - (k > 1 ? 0.2 : 0), 2.6 + (k % 2) * 0.3); pot(bag, p[0], 0.07, p[1], k % 2 ? 'round' : 'jar', 0.9); }
    } else if (el.use === 'pati') {
      pati({ rect: [x0 + t + 0.4, z0 + t + 0.4, x1 - t - 0.4, z1 - t - 0.4] }, ctx);
    } else if (el.use === 'tree') {
      const c = f === 's' || f === 'n' ? [cx, cz] : [cx, cz];
      tree({ at: c, h: 9 + rand() * 3, seed: Math.floor(rand() * 9) }, ctx);
      const k = inset(0); chaitya({ c: [k[0] + (f === 's' || f === 'n' ? 2.2 : 0), k[1] + (f === 's' || f === 'n' ? 0 : 2.2)], s: 0.6 }, ctx);
    } else {
      shikhara({ c: [cx, cz], s: 0.62 }, ctx);
      const k = inset(0);
      chaitya({ c: [k[0] + (f === 's' || f === 'n' ? 2.1 : 0), k[1] + (f === 's' || f === 'n' ? 0 : 2.1)], s: 0.5 }, ctx);
      chaitya({ c: [k[0] - (f === 's' || f === 'n' ? 2.1 : 0), k[1] - (f === 's' || f === 'n' ? 0 : 2.1)], s: 0.5 }, ctx);
    }
    void lathe; void rod;
  };
}
