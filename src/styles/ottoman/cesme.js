// The street fountain (çeşme) of Ottoman Istanbul about 1560 (docs/settlements/ottoman-istanbul.md §11). Wall fountains of
// the 15th–17th centuries have the tap on a plain stone (ayna taşı) set in a classical pointed-arched niche, the
// inscription (kitabe) over the tap naming the founder, a trough (kurna) below, low platforms either side for those
// who wait or set their vessels down, and a storage tank behind the wall [stated: turkishculture.org, "Fountains";
// Kırkçeşme on/off taps came in Süleyman's reign]. Ours, against a wall: a white marble block 3.4 m wide, 0.8 m
// deep, 3.4 m high, the niche 1.7 m wide, the tap stone with a bronze spout, the inscription panel in dark marble with
// gilt lines of script, the trough of marble, the platforms, a moulded cornice under a lead cap [inferred: sizes].

import { box, rod } from '../../core/geom.js';
import { arcadeWall } from './index.js';

/** cesme: { at: [x, z] (the middle of the back), face: 'n' | 's' | 'e' | 'w' (the way it faces), y }. */
export function cesme(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, f = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[el.face ?? 'e'], s = [-f[1], f[0]];
  const W = (u, v) => [x + f[0] * v + s[0] * u, z + f[1] * v + s[1] * u];
  const B = (mat, u0, y0, v0, u1, y1, v1) => { const a = W(u0, v0), b = W(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const hw = 1.7, D = 0.8;
  // the block: a plinth, the wall pierced by the pointed niche, the back of the niche, the cornice and the lead cap
  B('marble', -hw - 0.1, y - 0.2, 0, hw + 0.1, y + 0.18, D + 0.12);
  arcadeWall(bag, W(-hw, D / 2), W(hw, D / 2), [[hw - 0.85, hw + 0.85]], y + 0.18, y + 2.0, y + 3.3, D, 'marble');
  B('marble_smooth', -0.86, y + 0.18, 0, 0.86, y + 2.0, 0.14);
  B('marble_smooth', -0.5, y + 0.9, 0.14, 0.5, y + 2.0, 0.19);                          // the tap stone, a little proud
  B('marble_dark', -0.46, y + 2.08, 0.14, 0.46, y + 2.46, 0.17);                        // the inscription
  for (let k = 0; k < 3; k++) B('gold', -0.38, y + 2.14 + k * 0.11, 0.17, 0.38 - k * 0.07, y + 2.19 + k * 0.11, 0.18);
  const t = W(0, 0.19), t2 = W(0, 0.42);
  bag.add('bronze', rod([t[0], y + 1.2, t[1]], [t2[0], y + 1.2, t2[1]], 0.035, 6));
  bag.add('bronze', rod([t2[0], y + 1.2, t2[1]], [t2[0], y + 1.1, t2[1]], 0.03, 6));
  // the trough in the foot of the niche
  B('marble', -0.8, y + 0.18, 0.22, 0.8, y + 0.62, 0.3); B('marble', -0.8, y + 0.18, 0.7, 0.8, y + 0.62, 0.78);
  B('marble', -0.8, y + 0.18, 0.3, -0.72, y + 0.62, 0.7); B('marble', 0.72, y + 0.18, 0.3, 0.8, y + 0.62, 0.7);
  B('opening', -0.72, y + 0.18, 0.3, 0.72, y + 0.52, 0.7);
  // the platforms on either side in front
  for (const sg of [-1, 1]) B('marble', sg * 0.95, y - 0.1, D + 0.12, sg * 1.7, y + 0.42, D + 0.62);
  // the cornice and the lead cap
  B('marble', -hw - 0.12, y + 3.3, 0, hw + 0.12, y + 3.5, D + 0.18);
  B('marble_smooth', -hw - 0.04, y + 3.5, 0.06, hw + 0.04, y + 3.62, D + 0.1);
  B('lead', -hw - 0.08, y + 3.62, 0.02, hw + 0.08, y + 3.7, D + 0.14);
  col.rect(B('marble', -hw, y, 0, hw, y + 0.01, D), y, y + 3.6);
  for (const sg of [-1, 1]) col.rect(B('marble', sg * 0.95, y + 0.4, D + 0.12, sg * 1.7, y + 0.42, D + 0.62), y, y + 0.42);
}
