// Qufu, c. 1730 — the ridge beasts of the Dacheng Hall's roofs (docs/settlements/lu-qufu.md §19). On the diagonal ridges of the hall's lower hip roof and on the
// descending ridges of its upper nine-ridge (xieshan) roof, the line of small glazed beasts that rank a Qing hall: at the eave end a rider (the immortal on his hen),
// then the beasts (dragon, phoenix, lion, ... walking down the ridge, the more of them the higher the hall). Each stands on a block of tile let into the ridge, facing the
// eave. Wraps the style's `lu_dacheng` from here (the style files stay as they were); the places are read from the same height field the roof's tile courses use
// (src/styles/lu/tiles.js). All in the plan's yellow glaze: no new draw. [inferred: the line of ridge beasts is the Qing rule for imperial halls; the count and the
// kinds of Qufu's roofs are not recorded here]
import '../../styles/lu/index.js';
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import { Parts, ball, limb, T } from '../../styles/qing/carving.js';
import { dougongHeight } from '../../styles/qing/caihua.js';

const MAT = 'glaze_yellow';
/** One walking beast facing +z, about 0.55 m long, 0.5 m high on its block; kind 0 the rider on his hen, otherwise a beast with a horn, a mane or a tail by `kind`. */
function beast(P, kind) {
  P.add(MAT, box(-0.17, -0.34, -0.3, 0.17, 0.05, 0.3));                                    // the block let into the ridge
  P.add(MAT, box(-0.2, 0.0, -0.33, 0.2, 0.07, 0.33));                                      // its cap
  if (kind === 0) {                                                                        // the immortal on a hen
    P.add(MAT, T(ball(0.15, 0.13, 0.24, 8, 5), 0, 0.22, -0.02));
    P.add(MAT, limb([0, 0.24, 0.16], [0, 0.46, 0.26], 0.05, 0.04, 6)); P.add(MAT, T(ball(0.06, 0.06, 0.09, 6, 4), 0, 0.5, 0.31));
    P.add(MAT, limb([0, 0.2, -0.2], [0, 0.46, -0.34], 0.06, 0.02, 6));
    P.add(MAT, limb([0, 0.3, -0.03], [0, 0.66, -0.03], 0.09, 0.07, 7)); P.add(MAT, T(ball(0.07, 0.07, 0.07, 7, 4), 0, 0.74, -0.03));
    return;
  }
  P.add(MAT, T(ball(0.13, 0.12, 0.23, 8, 5), 0, 0.2, -0.04));                              // the body
  P.add(MAT, limb([0, 0.24, 0.1], [0, 0.4, 0.22], 0.08, 0.06, 6));                          // the neck
  P.add(MAT, T(ball(0.1, 0.09, 0.12, 7, 4), 0, 0.44, 0.27));                               // the head
  P.add(MAT, box(-0.05, 0.38, 0.35, 0.05, 0.42, 0.42));                                     // the muzzle
  if (kind % 3 === 1) P.add(MAT, limb([0, 0.5, 0.25], [0, 0.72, 0.17], 0.025, 0.006, 5));   // a horn (the dragon, the qilin)
  if (kind % 3 === 2) P.add(MAT, T(ball(0.07, 0.1, 0.05, 6, 4), 0, 0.5, 0.2));              // a crest (the phoenix, the lion's mane)
  P.add(MAT, limb([0, 0.22, -0.24], [0, 0.46 + 0.05 * (kind % 2), -0.42], 0.05, 0.015, 6)); // the tail raised
  for (const sx of [-1, 1]) for (const z of [0.12, -0.2]) P.add(MAT, box(sx * 0.1 - 0.035, 0.05, z - 0.035, sx * 0.1 + 0.035, 0.14, z + 0.035));
}

let done = false;
export function registerRidgeBeasts() {
  if (done) return; done = true;
  const E = STYLES.lu?.elements, fn = E?.lu_dacheng;
  if (!fn) return;
  E.lu_dacheng = function ridged(el, ctx) {
    const r = fn.call(this, el, ctx);
    if (el.simple || (el.lod ?? 0) >= 2 || !ctx?.bag) return r;
    const [x0, z0, x1, z1] = el.rect, y = el.y ?? 2.1, H = el.H ?? 8.4, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W0 = x1 - x0, D0 = z1 - z0, inset = Math.min(W0, D0) / 5.5, o = 3.4;
    const bk0 = dougongHeight({ tiers: H > 8 ? 3 : 2 }), yb0 = y + H + bk0, Dd = el.double ?? 7.2, sw = 0.8;
    const roofs = [
      { A: W0 / 2 + o, B: D0 / 2 + o, y: y + H - 0.25 + bk0, rise: (inset + o) * 0.55, p: 1.25, gAt: 9, n: 5 },
      { A: (W0 - 2 * inset) / 2 + o * 1.1, B: (D0 - 2 * inset) / 2 + o * 1.1, y: yb0 + Dd - 0.25 + bk0, rise: 9.4, p: 1.7, gAt: 0.45, n: 4 },
    ];
    const P = new Parts();
    for (const R of roofs) {
      const h = (x, z) => {
        const ax = Math.abs(x - cx), az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (R.B - az) / R.B));
        let te = Math.max(0, (R.A - ax) / R.B); if (R.gAt < 9 && te > R.gAt) te = 9;
        const t = Math.min(ts, te), corner = Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
        return R.y + R.rise * Math.pow(t, R.p) + sw * corner * corner;
      };
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < R.n; k++) {
        const u = 0.9 + 1.1 * k, px = cx + sx * (R.A - u), pz = cz + sz * (R.B - u);
        const q = new Parts(); beast(q, k === 0 ? 0 : (k + (sx > 0 ? 1 : 0) + (sz > 0 ? 2 : 0)) % 6 + 1);
        q.emit(ctx.bag, px, h(px, pz), pz, Math.atan2(sx, sz), 1.6);
      }
    }
    void P;
    return r;
  };
}
registerRidgeBeasts();
