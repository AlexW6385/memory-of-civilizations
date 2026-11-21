// A Balinese temple village — wear and weathering of the ground (docs/settlements/bali-village.md §13.5): the lane the pilgrims' and the market's feet have worn smooth along the
// temple's axis (pieces of dark stone laid flat in the packed earth, with gaps), and the damp, green-black ground about the pancuran where the water splashes. The walls' own damp
// band and moss at the foot, the streaks and the lost plaster are already in the style (styles/balinese/stone.js). Added to the balinese style from here; flat slabs of materials
// the plan already uses, a hair above the ground (no new material, no sheet of zero thickness).
import '../../styles/balinese/index.js';
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import { hashAt } from './nightlight.js';

/**
 * bali_wear: { lane: [[x, z0, z1, y]…] (a worn lane along z at x, from z0 to z1, ground level y), damp: [[x, z, y]…] (a damp patch about a point) } — the lane is
 * pieces 1.1–2.3 m long, 0.6–0.95 m wide, 12 mm proud, with a hand's gap between; a damp patch is a few overlapping slabs of the damp plaster's green-grey.
 */
function wear({ lane = [], damp = [], paths = [] }, ctx) {
  // paths: [[xa, za, xb, zb, y]…] — an axis-aligned way worn by feet: dark slabs 0.7–1.0 m wide across it, gapped, 10 mm proud (the gate's foot and the way to a stall's steps)
  for (const [xa, za, xb, zb, y] of paths) {
    const alongX = Math.abs(xb - xa) > Math.abs(zb - za), a = alongX ? xa : za, b = alongX ? xb : zb, lo = Math.min(a, b), hi = Math.max(a, b), c0 = alongX ? za : xa;
    for (let t = lo; t < hi - 0.45;) {
      const l = 0.55 + 0.4 * hashAt(xa + t, za + t, 61), w = 0.7 + 0.3 * hashAt(xa - t, za, 62), c = c0 + (hashAt(xa, za + t, 63) - 0.5) * 0.25;
      if (t + l > hi) break;
      ctx.bag.add('andesite', alongX ? box(t, y, c - w / 2, t + l, y + 0.01, c + w / 2) : box(c - w / 2, y, t, c + w / 2, y + 0.01, t + l));
      t += l + 0.08 + 0.2 * hashAt(xa + t, za, 64);
    }
  }
  for (const [x, za, zb, y] of lane) {
    const lo = Math.min(za, zb), hi = Math.max(za, zb);
    for (let z = lo + 0.3; z < hi - 0.5;) {
      const l = 1.1 + 1.2 * hashAt(x, z, 31), w = 0.6 + 0.35 * hashAt(x, z, 32), c = x + (hashAt(x, z, 33) - 0.5) * 0.4;
      if (z + l > hi - 0.3) break;
      ctx.bag.add('andesite', box(c - w / 2, y, z, c + w / 2, y + 0.012, z + l));
      z += l + 0.1 + 0.3 * hashAt(x, z, 34);
    }
  }
  for (const [x, z, y] of damp) {
    for (let k = 0; k < 4; k++) {
      const a = hashAt(x, z, 40 + k), b = hashAt(x, z, 50 + k), w = 0.5 + 0.7 * a, d = 0.6 + 0.9 * b, cx = x + (a - 0.5) * 1.1, cz = z + (b - 0.5) * 1.5;
      ctx.bag.add('plaster_damp', box(cx - w / 2, y + 0.004 * k, cz - d / 2, cx + w / 2, y + 0.004 * k + 0.01, cz + d / 2));
    }
  }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  STYLES.balinese.elements.bali_wear = wear;
}
registerWear();
