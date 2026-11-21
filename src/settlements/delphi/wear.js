// Delphi about 400 BC — wear on what the feet use (docs/settlements/delphi.md §15.5): the hollow worn in the middle of each tread of the stairs the pilgrims climb (the stair
// through the terrace's wall, the stair of the temple, the alleys' stairs), by the hash of the tread's own place so that no two are alike. `dl_stairwear` takes the
// stair element's own numbers. Registered into the greek elements (as house.js does); decals 4 mm above the tread, no collision.
import '../../styles/delphi/index.js';
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
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
