// The Rainbow Bridge, carried further than the song style's (docs/settlements/song-kaifeng.md §17): the woven arch's logs are lashed
// with rope where each system crosses the transverse beams (the scroll's bridge is bound, not pinned), the outer ribs on both faces
// wearing the bindings, the beams' projecting ends capped with iron bands and pegged, and at each abutment's seat a bolster beam.
import { STYLES } from '../../core/build.js';
import { rod, box } from '../../core/geom.js';

export function rainbowRich(el, ctx) {
  STYLES.song.elements.rainbow_bridge(el, ctx);
  const { bag } = ctx;
  const [cx, cz] = el.at, alongZ = el.across === 'z';
  const P = (s, o, y) => (alongZ ? [cx + o, y, cz + s] : [cx + s, y, cz + o]);
  const S = el.span / 2, W = el.width / 2, ys = el.spring ?? -0.6, hc = el.crown ?? 4.0, d = 0.42, r = 0.19, rb = 0.22;
  const a = S * 0.62, b = a / 2, k = (S - a) / (S - b);
  const ha = (k * hc / 2 - k * d + d) / (1 - k / 2), hb = (ha + hc) / 2 - d;
  const A = [[-S, 0], [-a, ha], [0, hc], [a, ha], [S, 0]], B = [[-S, 0], [-b, hb], [b, hb], [S, 0]];
  const yOn = (poly, s) => { for (let i = 0; i + 1 < poly.length; i++) { const [s0, h0] = poly[i], [s1, h1] = poly[i + 1]; if (s >= s0 && s <= s1) return h0 + (h1 - h0) * (s - s0) / (s1 - s0); } return 0; };
  const ribs = 21, ro = (j) => -W + r + j * (2 * W - 2 * r) / (ribs - 1);
  const beams = [[-a, ha], [-b, hb], [0, hc], [b, hb], [a, ha]];
  // rope turns round every outer rib (the three nearest each face) just beside each beam, three turns apiece
  for (const j of [0, 1, 2, ribs - 3, ribs - 2, ribs - 1]) {
    const o = ro(j), poly = j % 2 === 0 ? A : B;
    for (const [s] of beams) for (const side of [-1, 1]) {
      const s2 = s + side * (rb + 0.1), yy = ys + yOn(poly, s2), m = (yOn(poly, s2 + 0.05) - yOn(poly, s2 - 0.05)) / 0.1, L = Math.hypot(1, m), ds = 1 / L, dy = m / L;
      for (let t = -1; t <= 1; t++) { const sx = s2 + t * 0.07 * ds, y1 = yy + t * 0.07 * dy; bag.add('sacking', rod(P(sx - 0.022 * ds, o, y1 - 0.022 * dy), P(sx + 0.022 * ds, o, y1 + 0.022 * dy), r + 0.035, 8)); }
    }
  }
  // the beams' projecting heads: an iron band, and a peg through each
  for (const [s, h] of beams) for (const sg of [-1, 1]) {
    const o = sg * (W + 0.3), y = ys + h;
    bag.add('wood_dark', rod(P(s, o - 0.04, y), P(s, o + 0.04, y), rb + 0.03, 10));
    bag.add('wood_dark', rod(P(s, o, y - rb - 0.06), P(s, o, y + rb + 0.06), 0.03, 5));
  }
  // the bolster beams under the arch's feet at each seat
  for (const sg of [-1, 1]) {
    const p = P(sg * (S + 0.15), -W - 0.1, ys - 0.38), q = P(sg * (S + 0.15), W + 0.1, ys - 0.38);
    bag.add('wood_dark', rod(p, q, 0.2, 8));
  }
  void box;
}
