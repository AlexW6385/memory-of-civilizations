// Athens — wear on what the feet use (docs/settlements/athens.md §24): the hollow worn in the middle of each tread of the stairs the visitor climbs (the Propylaia's two
// flights, the Tholos' two steps, the Council house's), and the slabs of the Panathenaic Way where it is paved, worn to a polish. Decals a few millimetres above the tread
// and no collision; a hash of each tread's own place varies it. Registered into the greek elements.
import { STYLES, orientedBox } from '../../core/build.js';
import { box } from '../../core/geom.js';
import { WALK } from './walk.js';
import { WAY, height, pathAt, RAMP, inRect, lotAt } from './layout.js';

const hashAt = (x, z, s = 0) => { const k = Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453; return k - Math.floor(k); };

/** athens_stairwear: the numbers of a `stair` element plus `wear` (the dust under the polish, default 'limestone'). Each tread: a hollow of dust a little forward of the middle, a narrower polished track in it. */
function stairWear(el, { bag }) {
  const [x0, z0, x1, z1] = [Math.min(el.rect[0], el.rect[2]), Math.min(el.rect[1], el.rect[3]), Math.max(el.rect[0], el.rect[2]), Math.max(el.rect[1], el.rect[3])];
  const rise = el.y1 - el.y0, n = Math.max(1, Math.round(Math.abs(rise) / (el.riser || 0.17)));
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, yTop = el.y0 + rise * f1;
    let r;
    if (el.dir === 'n') r = [x0, z1 - (z1 - z0) * f1, x1, z1 - (z1 - z0) * f0];
    else if (el.dir === 's') r = [x0, z0 + (z1 - z0) * f0, x1, z0 + (z1 - z0) * f1];
    else if (el.dir === 'e') r = [x0 + (x1 - x0) * f0, z0, x0 + (x1 - x0) * f1, z1];
    else r = [x1 - (x1 - x0) * f1, z0, x1 - (x1 - x0) * f0, z1];
    const along = el.dir === 'n' || el.dir === 's', cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    const w = along ? r[2] - r[0] : r[3] - r[1], d = along ? r[3] - r[1] : r[2] - r[0];
    const off = (hashAt(cx, cz, 5) - 0.5) * w * 0.12, hw = w * (0.26 + 0.1 * hashAt(cx, cz, 3)), hd = d * (0.3 + 0.08 * hashAt(cx, cz, 4));
    const R = (a, b) => (along ? [cx + off - a, cz - b, cx + off + a, cz + b] : [cx - b, cz + off - a, cx + b, cz + off + a]);
    const A = R(hw, hd), B = R(hw * 0.55, hd * 0.6);
    bag.add(el.wear ?? 'limestone', box(A[0], yTop + 0.001, A[1], A[2], yTop + 0.004, A[3]));
    bag.add('marble_smooth', box(B[0], yTop + 0.0045, B[1], B[2], yTop + 0.008, B[3]));
  }
}

/** athens_wayworn: { list: [{ at: [x, z], yaw, w, d, y0, y1 }] } — flat slabs of the Way's paving, polished by carts and processions: a hollow of dust round a worn stone. */
function wayWorn(el, { bag }) {
  for (const s of el.list) {
    const ux = Math.cos(s.yaw), uz = Math.sin(s.yaw), h = s.d / 2;
    bag.add('limestone', orientedBox([s.at[0] - ux * h, s.at[1] - uz * h], [s.at[0] + ux * h, s.at[1] + uz * h], s.w, s.y0, s.y1));
    bag.add('marble_smooth', orientedBox([s.at[0] - ux * h * 0.7, s.at[1] - uz * h * 0.7], [s.at[0] + ux * h * 0.7, s.at[1] + uz * h * 0.7], s.w * 0.62, s.y1, s.y1 + 0.004));
  }
}
Object.assign(STYLES.greek.elements, { athens_stairwear: stairWear, athens_wayworn: wayWorn });

/** The worn slabs of the Way from the ramp's foot to the Agora's far end: by rule along the walk, 3 to 5 m apart, a metre either side of its middle, where the ground is level under the slab and nothing is built. */
export function wornSlabs() {
  const out = [], from = WALK.findIndex(([x, z]) => x === -310 && z === 70), over = [[-252, -237.6, -204, -225], [-292, -197, -273, -150], [-262, -124.89, -219, -110], [-242, -199, -178, -140], [-216, -124.9, -188, -110], [-182, -132, -166, -124], [-271, -186, -253, -166]];
  let acc = 2;
  for (let i = from; i + 1 < WALK.length; i++) {
    const a = WALK[i], b = WALK[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L;
    for (; acc < L; acc += 3 + 2 * hashAt(a[0] + tx * acc, a[1] + tz * acc, 1)) {
      const px = a[0] + tx * acc, pz = a[1] + tz * acc, k = hashAt(px, pz, 2), lat = (k - 0.5) * 2.0;
      const x = px - tz * lat, z = pz + tx * lat, yaw = Math.atan2(tz, tx) + (hashAt(px, pz, 3) - 0.5) * 0.3;
      if (pz < -232 || over.some((r) => inRect(r, x, z, 1.5)) || lotAt(x, z, 1.5) || pathAt(x, z, WAY)[0] > 4.5) continue;
      const w = 0.62 + 0.25 * hashAt(px, pz, 4), d = 0.95 + 0.4 * hashAt(px, pz, 5), ux = Math.cos(yaw), uz = Math.sin(yaw);
      const hs = [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]].map(([p, q]) => height(x + ux * p * d / 2 - uz * q * w / 2, z + uz * p * d / 2 + ux * q * w / 2));
      const lo = Math.min(...hs), hi = Math.max(...hs);
      if (hi - lo > 0.11) continue;
      out.push({ at: [Math.round(x * 100) / 100, Math.round(z * 100) / 100], yaw: Math.round(yaw * 1000) / 1000, w: Math.round(w * 100) / 100, d: Math.round(d * 100) / 100, y0: lo - 0.06, y1: hi + 0.012 });
    }
    acc -= L;
  }
  return out;
}
