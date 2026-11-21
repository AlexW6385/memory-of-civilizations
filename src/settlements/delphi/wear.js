// Delphi about 400 BC — wear on what the feet use (docs/settlements/delphi.md §15.5): the hollow worn in the middle of each tread of the stairs the pilgrims climb (the stair
// through the terrace's wall, the stair of the temple, the alleys' stairs), by the hash of the tread's own place so that no two are alike. `dl_stairwear` takes the
// stair element's own numbers. Registered into the greek elements (as house.js does); decals 4 mm above the tread, no collision.
import '../../styles/delphi/index.js';
import { STYLES } from '../../core/build.js';
import { box, fromTriangles } from '../../core/geom.js';
import { hashAt } from './nightlight.js';

function stairWear(el, { bag }) {
  const [x0, z0, x1, z1] = [Math.min(el.rect[0], el.rect[2]), Math.min(el.rect[1], el.rect[3]), Math.max(el.rect[0], el.rect[2]), Math.max(el.rect[1], el.rect[3])];
  const rise = el.y1 - el.y0, n = Math.max(1, Math.round(Math.abs(rise) / (el.riser || 0.17))), mat = el.wear ?? 'plaster_damp';
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, yTop = el.y0 + rise * f1;
    let r;
    if (el.dir === 'n') r = [x0, z1 - (z1 - z0) * f1, x1, z1 - (z1 - z0) * f0];
    else if (el.dir === 's') r = [x0, z0 + (z1 - z0) * f0, x1, z0 + (z1 - z0) * f1];
    else if (el.dir === 'e') r = [x0 + (x1 - x0) * f0, z0, x0 + (x1 - x0) * f1, z1];
    else r = [x1 - (x1 - x0) * f1, z0, x1 - (x1 - x0) * f0, z1];
    const along = el.dir === 'n' || el.dir === 's', cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, h = hashAt(cx, cz, 3);
    const w = (along ? r[2] - r[0] : r[3] - r[1]), d = (along ? r[3] - r[1] : r[2] - r[0]), hw = w * (0.2 + 0.1 * h), hd = d * (0.3 + 0.08 * hashAt(cx, cz, 4)), off = (hashAt(cx, cz, 5) - 0.5) * w * 0.25;
    const a = along ? [cx + off - hw, cz - hd, cx + off + hw, cz + hd] : [cx - hd, cz + off - hw, cx + hd, cz + off + hw];
    bag.add(mat, box(a[0], yTop + 0.001, a[1], a[2], yTop + 0.005, a[3]));
  }
}
Object.assign(STYLES.greek.elements, { dl_stairwear: stairWear });

// dl_stepwear: { rect (the stylobate), y0, steps, rise, tread, at: [x…] (where the feet cross), w? } — a hollow worn into each step of a krepis on its south side, at each
// crossing; the front band of step i is [z1 + o − tread, z1 + o] with o = (steps − 1 − i)·tread (greek krepis), the top step's band lies inside the stylobate edge.
function stepWear(el, { bag }) {
  const [, , , z1] = el.rect, n = el.steps ?? 2, tread = el.tread, mat = el.wear ?? 'plaster_damp';
  for (const xc of el.at) for (let i = 0; i < n; i++) {
    const o = (n - 1 - i) * tread, yTop = el.y0 + (i + 1) * el.rise, h = hashAt(xc, z1 + i, 7), w = (el.w ?? 1.5) * (0.8 + 0.3 * h), off = (hashAt(xc, z1, 8 + i) - 0.5) * 0.3;
    const zb = z1 + o - tread * 0.78, zf = z1 + o - tread * 0.12;
    bag.add(mat, box(xc + off - w / 2, yTop + 0.001, zb, xc + off + w / 2, yTop + 0.005, zf));
  }
}
// dl_wayworn: { pts: [[x, y, z], …] (the Way's centre line), w } — the polished band the feet have worn down the middle of the paving: short darker patches along the line,
// 0.9–1.4 m across, a third of the length left unworn, by the hash of each patch's own place; decals 6 mm above the paving (the ribbon lifts 4 mm).
function wayWorn(el, { bag }) {
  const P = el.pts;
  for (let i = 0; i + 1 < P.length; i++) {
    const [ax, ay, az] = P[i], [bx, by, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az);
    if (L < 0.1) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    for (let s = 0.2; s < L - 0.4; s += 1.1 + 0.5 * hashAt(ax + ux * s, az + uz * s, 2)) {
      const px = ax + ux * s, pz = az + uz * s, h = hashAt(px, pz, 1);
      if (h < 0.3) continue;
      const half = (0.45 + 0.35 * hashAt(px, pz, 3)) / 2 * (el.w / 3.6 + 0.3), len = 0.55 + 0.6 * hashAt(px, pz, 4), off = (hashAt(px, pz, 5) - 0.5) * 0.7;
      const y = ay + (by - ay) * (s / L) + 0.05, cx = px + nx * off, cz = pz + nz * off;
      const q = [[cx - nx * half, cz - nz * half], [cx + nx * half, cz + nz * half], [cx + nx * half + ux * len, cz + nz * half + uz * len], [cx - nx * half + ux * len, cz - nz * half + uz * len]];
      bag.add(el.mat ?? 'plaster_damp', fromTriangles(tri(q, y)));
    }
  }
}
const tri = (q, y) => { const v = (p) => [p[0], y, p[1]]; return [...v(q[0]), ...v(q[1]), ...v(q[2]), ...v(q[0]), ...v(q[2]), ...v(q[3])]; };
Object.assign(STYLES.greek.elements, { dl_stepwear: stepWear, dl_wayworn: wayWorn });
