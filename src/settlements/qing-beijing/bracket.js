// The carving on the Hall of Supreme Harmony's bracket sets (dougong, docs/settlements/qing-beijing.md §37): the style lays the timbers and
// blocks (caihua.js); here, over each set, the dragon heads at the tongues' tips (the top tier's ang carved as a dragon's head with horns,
// eyes and open snout; the lower tiers' as the sloping beak), the cloud-shaped ends of the cross arms (the "chun tou" lotus ends), and a gilt
// bead on each block. Gilt on the painted timber; drawn only near (a plan of its own). Element of style `qing`:
// bj_dougong_fine { rect, y (the frieze beam's top), tiers, pitch, step, posts: [xs, zs] relative to the rect, sides }.
import { STYLES } from '../../core/build.js';
import { Parts } from '../../styles/qing/carving.js';
import { ell, cone, curve, add, h01 } from './sculpt.js';

const AH = 0.15;
const G = 'gilt_bronze';
/** The carved set at the origin, its tongues toward n = [nx, nz]; t the direction along the wall; the foot at y = 0. */
function carved(P, n, t, tiers, step, seed) {
  const at = (s, d, y) => [t[0] * s + n[0] * d, y, t[1] * s + n[1] * d], ax = [[n[0], 0, n[1]], [0, 1, 0], [t[0], 0, t[1]]], axT = [[t[0], 0, t[1]], [0, 1, 0], [n[0], 0, n[1]]];
  const put = (g) => P.add(G, g);
  for (let k = 0; k < tiers; k++) {
    const y = 0.18 + k * AH + AH * 0.5, lat = 0.3 + k * 0.12, proj = (k + 1) * step;
    const jit = 0.004 * h01(seed, k);
    if (k === tiers - 1) {
      // the dragon head: skull, snout, open lower jaw, horns, eyes
      const c = at(0, proj + 0.03, y);
      put(ell(c, [0.06, 0.05, 0.05], ax, 7, 4));
      put(ell(at(0, proj + 0.12, y - 0.005), [0.07, 0.035, 0.035], ax, 7, 4));
      put(ell(at(0, proj + 0.1, y - 0.05), [0.05, 0.015, 0.03], ax, 6, 3));
      put(cone(at(0, proj + 0.05, y + 0.04), at(0, proj - 0.02, y + 0.12 + jit), 0.014, 4));
      for (const s of [-1, 1]) { put(cone(at(s * 0.03, proj + 0.0, y + 0.04), at(s * 0.06, proj - 0.1, y + 0.13), 0.011, 4)); put(ell(at(s * 0.036, proj + 0.05, y + 0.025), [0.012, 0.012, 0.012], ax, 4, 3)); }
    } else {
      put(ell(at(0, proj + 0.02, y), [0.055, 0.03, 0.025], ax, 7, 4));
      put(cone(at(0, proj + 0.06, y - 0.01), at(0, proj + 0.12, y - 0.03), 0.02, 4));
    }
    // the arms' cloud-shaped ends
    for (const s of [-1, 1]) put(ell(at(s * (lat + 0.03), 0.0, y), [0.04, 0.035, 0.02], axT, 7, 4));
  }
}
function bracketFine(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, yf = el.y, tiers = el.tiers ?? 3, step = el.step ?? 0.24, [xs, zs] = el.posts;
  const sides = [[[x0, z0], [x1, z0], xs.map((x) => x - x0), [0, -1]], [[x1, z1], [x0, z1], xs.map((x) => x1 - x).reverse(), [0, 1]], [[x0, z1], [x0, z0], zs.map((z) => z1 - z).reverse(), [-1, 0]], [[x1, z0], [x1, z1], zs.map((z) => z - z0), [1, 0]]];
  const only = el.sides ?? 'swen';
  const names = ['n', 's', 'w', 'e'];
  sides.forEach(([a, b, ps, n], si) => {
    if (!only.includes(names[si])) return;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, at = [];
    for (let i = 0; i < ps.length; i++) { at.push(ps[i]); if (i + 1 < ps.length) { const sp = ps[i + 1] - ps[i], k = Math.max(1, Math.round(sp / (el.pitch ?? 1.0)) - 1); for (let j = 1; j <= k; j++) at.push(ps[i] + sp * j / (k + 1)); } }
    for (const s of at) {
      const px = a[0] + ux * s, pz = a[1] + uz * s, P = new Parts();
      carved(P, n, [ux, uz], tiers, step, px * 3.1 + pz * 1.7);
      P.emit(bag, px, yf + 0.12, pz);
    }
  });
}
STYLES.qing.elements.bj_dougong_fine = bracketFine;
void curve; void add;
