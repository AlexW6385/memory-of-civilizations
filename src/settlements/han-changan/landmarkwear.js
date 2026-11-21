// Han Chang'an, c. 100 BC — where feet went on the landmark (docs/settlements/han-changan.md §19): the ramp-stair's treads worn to a darker, polished track up the middle (every
// tread's front half, 2.8 m wide, the middle of the way worn more than the sides), the crown's apron worn to a band from the ramp's head to the hall's steps, with a wider
// patch at the head of the ramp where those who climbed stopped to take in the hall, and a short worn path to each of the hall's side flights. Only in `bluestone`, which the
// landmark plan holds already (no new draw); boxes 1 cm proud of the tread or the paving, no collision. A pure function of the ramp's own numbers.
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';

/** hanl_wear: { ax, ramp: { x: [x0, x1], z0, z1 }, top, hallZ } */
function wear({ ax, ramp, top, hallZ }, { bag }) {
  const n = Math.round(top / 0.18), d = (ramp.z1 - ramp.z0) / n, mid = (ramp.x[0] + ramp.x[1]) / 2, e = 0.012;
  for (let i = 0; i < n; i++) {
    const zf = ramp.z1 - d * i, yT = 0.18 * (i + 1), w = 1.4 + 0.25 * Math.sin(i * 1.9);       // the front of tread i is at zf, it covers to zf - d
    bag.add('bluestone', box(mid - w, yT + 0.012, zf - d * 0.82, mid + w, yT + 0.02, zf - d * 0.1));
  }
  // the apron: the band along the axis, the patch at the ramp's head, the paths toward the side flights
  const T = top, y0 = T + 0.002, y1 = T + e;
  bag.add('bluestone', box(ax - 1.5, y0, hallZ + 3, ax + 1.5, y1, ramp.z0 - 0.2));
  bag.add('bluestone', box(ax - 3.2, y0, ramp.z0 - 4.4, ax + 3.2, y1, ramp.z0 - 0.2));
  for (const s of [-1, 1]) bag.add('bluestone', box(ax + s * 1.6 - (s < 0 ? 4.4 : 0), y0, hallZ + 3, ax + s * 1.6 + (s > 0 ? 4.4 : 0), y1, hallZ + 5.6));
}
STYLES.hanlodge.elements.hanl_wear = wear;

/**
 * hanl_hangings: { cx, z1, floor, h, bayW, bays, first, last } — the hall's front hung with cloth (Han halls were hung with curtains, 帷幕, between the columns; dossier §19): across each
 * open bay a valance of red silk under the architrave with a row of pointed tongues, and at every front column of the opening a pair of curtains gathered at the waist and swelling
 * out below. Red cloth only (the crown's banner material: no new draw), 5 cm thick, hung 0.45 m before the column line, no collision, the bays' middles left clear.
 */
function hangings({ cx, z1, floor: f, h: H, bayW, bays, first, last }, { bag }) {
  const x0 = cx - bays * bayW / 2, X = (i) => x0 + i * bayW, zz = z1 + 0.45, top = f + H - 0.62;
  for (let b = first; b <= last; b++) {
    const a = X(b) + 0.55, c = X(b + 1) - 0.55;
    bag.add('cloth_red', box(a, top - 0.95, zz, c, top, zz + 0.05));
    const n = Math.round((c - a) / 0.9), w = (c - a) / n;
    for (let k = 0; k < n; k++) { const u = a + k * w; bag.add('cloth_red', box(u + 0.12, top - 1.4, zz, u + w - 0.12, top - 1.03, zz + 0.05)); }
  }
  for (let i = first; i <= last + 1; i++) for (const s of [-1, 1]) {
    const m = 'cloth_red', xc = X(i) + s * 0.95, y1 = top - 1.0, yt = f + 1.65;
    bag.add(m, box(xc - 0.3, yt, zz, xc + 0.3, y1, zz + 0.06));                                              // the curtain's fall to the cord
    bag.add(m, box(xc - 0.3 + s * 0.14, f + 0.95, zz - 0.02, xc + 0.3 + s * 0.14, yt - 0.04, zz + 0.1));      // below the cord it swells outward and sweeps to the floor's edge
  }
}
STYLES.hanlodge.elements.hanl_hangings = hangings;
