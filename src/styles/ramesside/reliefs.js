// The painted and carved wall reliefs of the Great Temple's first hall that are not the usual scenes of the king before the gods
// (egyptian/objects.js wallReliefs does those): the Battle of Kadesh across the north wall — the Egyptian camp in its wall of shields,
// the king's chariot, the Hittite chariots in flight, the Orontes and the fortress of Kadesh — and the campaigns of the south wall.
// (docs/settlements/abu-simbel.md §4.3.) The compositions are made in the manner of the sources, not copied from any one reproduction.

import { box, fromTriangles } from '../../core/geom.js';
import { figure } from '../egyptian/objects.js';
import { prismTris, rng } from './util.js';

const HORSE = [[0, 0.35], [0.05, 0.5], [0.18, 0.55], [0.3, 0.52], [0.55, 0.52], [0.62, 0.6], [0.7, 0.78], [0.78, 0.92], [0.9, 0.98], [0.98, 0.93], [1.0, 0.85], [0.93, 0.8], [0.85, 0.7], [0.82, 0.55], [0.78, 0.45], [0.74, 0.2], [0.76, 0], [0.71, 0], [0.66, 0.22], [0.62, 0.38], [0.55, 0.32], [0.5, 0.15], [0.52, 0], [0.47, 0], [0.42, 0.22], [0.38, 0.35], [0.25, 0.33], [0.22, 0.15], [0.24, 0], [0.19, 0], [0.14, 0.2], [0.1, 0.3]];
const MAN = [[-0.1, 0], [0.0, 0], [0.04, 0.4], [0.1, 0], [0.18, 0], [0.14, 0.5], [0.16, 0.8], [0.12, 0.95], [0.08, 1.05], [0, 1.08], [-0.08, 1.04], [-0.1, 0.95], [-0.14, 0.8], [-0.12, 0.5]];
const OVAL = (r = 0.2, h = 0.4) => Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return [Math.cos(a) * r, h / 2 + Math.sin(a) * h / 2]; });
const CIRCLE = (r, n = 12) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; });

/** A relief drawing board on a wall: `at(u, v, d)` maps the wall's coordinates to 3-D; shapes go into `bag` by material. */
function board(bag, at) {
  const out = new Map();
  const put = (m, tris) => { if (!out.has(m)) out.set(m, []); out.get(m).push(...tris); };
  // a polygon in wall coordinates (scaled s, turned to face `dir`, at (u, v)), raised by d0..d1
  const poly = (m, P, u, v, s = 1, dir = 1, d0 = 0.012, d1 = 0.06) => put(m, prismTris(P.map(([x, y]) => [u + dir * x * s, v + y * s]), at, d0, d1));
  return { poly, flush: () => { for (const [m, t] of out) bag.add(m, fromTriangles(t)); } };
}

/** The chariot with its pair of horses at (u, v) facing `dir`, scale s (the horses are s long), the driver and a warrior with his bow. */
function chariot(B, u, v, s, dir, o = {}) {
  const R = 'sandstone_relief', paint = o.paint ?? 'paint_ochre';
  B.poly(R, HORSE, u + dir * s * 1.5, v + s * 0.1, s, dir, 0.012, 0.05);
  B.poly(R, HORSE, u + dir * s * 1.35, v + s * 0.18, s * 0.96, dir, 0.05, 0.085);       // the second horse, a little behind the first and prouder
  B.poly(R, [[0.45, 0.5], [2.3, 0.62], [2.3, 0.67], [0.45, 0.56]], u, v, s * 0.7, dir, 0.012, 0.045);  // the pole
  B.poly(paint, [[0, 0.3], [0, 1.0], [0.12, 1.12], [0.6, 1.12], [0.66, 0.5], [0.35, 0.3]], u, v, s * 0.8, dir, 0.012, 0.07);   // the car
  B.poly(R, CIRCLE(0.34), u + dir * s * 0.3, v + s * 0.27, s * 0.8, dir, 0.07, 0.11);   // the wheel
  B.poly('sandstone_dressed', CIRCLE(0.08, 8), u + dir * s * 0.3, v + s * 0.27, s * 0.8, dir, 0.11, 0.125);
  if (o.king) {
    // the king drawing his bow, the reins about his waist, the double crown: a tall figure in the car
    B.poly(R, MAN, u + dir * s * 0.32, v + s * 0.9, s * 1.5, dir, 0.07, 0.11);
    B.poly('limewash_red', [[-0.06, 1.05], [0.07, 1.05], [0.08, 1.2], [0.0, 1.3], [-0.07, 1.2]], u + dir * s * 0.32, v + s * 0.9, s * 1.5, dir, 0.1, 0.13);
    B.poly(R, [[0.0, 0.85], [0.7, 0.8], [0.72, 0.85], [0.0, 0.9]], u + dir * s * 0.32, v + s * 0.9, s * 1.5, dir, 0.1, 0.13);      // the bow drawn
  } else {
    B.poly(R, MAN, u + dir * s * 0.22, v + s * 0.9, s * 0.8, dir, 0.07, 0.11);
    B.poly(R, MAN, u + dir * s * 0.44, v + s * 0.9, s * 0.78, dir, 0.07, 0.11);
  }
}
const soldier = (B, u, v, s, dir, mat = 'sandstone_relief') => B.poly(mat, MAN, u, v, s, dir, 0.012, 0.06);

/**
 * The Battle of Kadesh across a wall: from u0 to u1 (the Egyptian camp at the u0 end, the city at the u1 end), v0..v1 high. `at` maps (u, v, d) to 3-D.
 */
export function kadesh(bag, at, u0, u1, v0, v1, seed = 1) {
  const B = board(bag, at), r = rng(seed), H = v1 - v0, W = u1 - u0;
  const R = 'sandstone_relief';
  // ground lines: a band of the river at the foot, the field above it
  const campW = W * 0.27, cityU = u1 - W * 0.18, riverU = cityU - 1.2;
  // the camp: a wall of shields round a court, the tents inside, a lion, donkeys, soldiers at the gate
  const cx0 = u0 + 0.4, cx1 = u0 + campW, cy0 = v0 + 0.5, cy1 = v0 + H * 0.55;
  for (let x = cx0; x < cx1; x += 0.3) { B.poly(R, OVAL(0.12, 0.34), x, cy0, 1, 1, 0.012, 0.07); B.poly(R, OVAL(0.12, 0.34), x, cy1 - 0.2, 1, 1, 0.012, 0.07); }
  for (let y = cy0 + 0.3; y < cy1 - 0.2; y += 0.34) { B.poly(R, OVAL(0.12, 0.3), cx0, y, 1, 1, 0.012, 0.07); B.poly(R, OVAL(0.12, 0.3), cx1, y, 1, 1, 0.012, 0.07); }
  B.poly('paint_ochre', [[0, 0], [1.3, 0], [0.95, 0.6], [0.35, 0.6]], cx0 + 0.6, cy0 + 0.5, 1, 1, 0.012, 0.06);      // a tent
  B.poly('paint_ochre', [[0, 0], [1.1, 0], [0.8, 0.5], [0.3, 0.5]], cx0 + 2.0, cy0 + 0.4, 1, 1, 0.012, 0.06);
  B.poly(R, [[0, 0], [0.6, 0], [0.62, 0.3], [0.5, 0.34], [0.4, 0.26], [0.08, 0.3]], cx0 + 0.9, cy0 + 0.05, 1, 1, 0.012, 0.065);   // the king's lion lying by his tent
  soldier(B, cx0 + 1.2, cy0 + 1.2, 0.5, 1); soldier(B, cx1 + 0.6, cy0 + 0.1, 0.9, 1); soldier(B, cx1 + 1.0, cy0 + 0.1, 0.9, 1);
  // the king's chariot, drawn large, at the head of the charge toward the river; the Egyptian chariots behind him
  chariot(B, u0 + campW + 1.7, v0 + 0.5, 1.5, 1, { king: true });
  chariot(B, u0 + campW + 0.5, v0 + H * 0.58, 0.9, 1);
  // the Hittite chariots in flight toward the Orontes, three in a row below and above, the horses' reins loose; the fallen between them
  for (let i = 0; i < 3; i++) chariot(B, u0 + campW + 7 + i * 1.6, v0 + 0.45 + (i % 2) * 0.2, 0.95, 1, { paint: 'paint_robe' });
  for (let i = 0; i < 3; i++) chariot(B, u0 + campW + 5.2 + i * 1.7, v0 + H * 0.58 + (i % 2) * 0.15, 0.85, 1, { paint: 'paint_robe' });
  for (let i = 0; i < 7; i++) {
    const x = u0 + campW + 3.4 + r() * 6.5, y = v0 + 0.25 + r() * 1.7;
    B.poly(R, MAN, x, y, 0.55, r() < 0.5 ? 1 : -1, 0.012, 0.055);                       // a fallen warrior (small, as the carvers put the dead and the wounded between the chariots)
  }
  // the Orontes: a band of water in zigzag lines, the swimming men
  for (let k = 0; k < 3; k++) for (let x = riverU; x < riverU + 1.1; x += 0.18) B.poly(R, [[0, 0], [0.09, 0.07], [0.18, 0], [0.18, 0.025], [0.09, 0.095], [0, 0.025]], x, v0 + 0.5 + k * 0.45, 1, 1, 0.012, 0.045);
  B.poly(R, MAN, riverU + 0.55, v0 + 1.8, 0.4, -1, 0.012, 0.06); B.poly(R, MAN, riverU + 0.25, v0 + 2.0, 0.4, 1, 0.012, 0.06);
  // Kadesh: the city's walls with their battlements, the gate tower, the people on the walls, the moat round it
  const k0 = cityU, k1 = u1 - 0.3, wy = v0 + 1.1, wy1 = wy + H * 0.5;
  B.poly(R, [[k0, wy], [k1, wy], [k1, wy1], [k0, wy1]], 0, 0, 1, 1, 0.012, 0.07);
  for (let x = k0 + 0.1; x < k1 - 0.15; x += 0.3) B.poly(R, [[0, 0], [0.18, 0], [0.18, 0.22], [0, 0.22]], x, wy1, 1, 1, 0.012, 0.07);
  B.poly(R, [[(k0 + k1) / 2 - 0.5, wy], [(k0 + k1) / 2 + 0.5, wy], [(k0 + k1) / 2 + 0.5, wy1 + 0.9], [(k0 + k1) / 2 - 0.5, wy1 + 0.9]], 0, 0, 1, 1, 0.07, 0.11);   // the gate tower
  for (let x = (k0 + k1) / 2 - 0.5; x < (k0 + k1) / 2 + 0.5; x += 0.25) B.poly(R, [[0, 0], [0.14, 0], [0.14, 0.2], [0, 0.2]], x + 0.04, wy1 + 0.9, 1, 1, 0.07, 0.11);
  B.poly('lacquer_black', [[(k0 + k1) / 2 - 0.18, wy], [(k0 + k1) / 2 + 0.18, wy], [(k0 + k1) / 2 + 0.18, wy + 0.7], [(k0 + k1) / 2, wy + 0.85], [(k0 + k1) / 2 - 0.18, wy + 0.7]], 0, 0, 1, 1, 0.11, 0.115);   // the gate's arch
  for (let x = k0 + 0.3; x < k1 - 0.3; x += 0.55) if (Math.abs(x - (k0 + k1) / 2) > 0.7) soldier(B, x, wy1, 0.38, r() < 0.5 ? 1 : -1);   // the defenders on the walls
  for (let x = k0 - 0.2; x < k1 + 0.2; x += 0.2) B.poly(R, [[0, 0], [0.1, 0.06], [0.2, 0], [0.2, 0.025], [0.1, 0.085], [0, 0.025]], x, wy - 0.35, 1, 1, 0.012, 0.045);   // the moat
  B.flush();
}

/**
 * The campaigns across a wall: registers of the king striking the enemies he holds by the hair, before Amun and Ra-Horakhty (Nubians, Libyans and
 * Syrians in turn), with the bound captives led behind; `at` maps (u, v, d) to 3-D; the scenes from u0 to u1, v0 the first register's line.
 */
export function campaigns(bag, at, u0, u1, v0, regs, hh, seed = 3) {
  const r = rng(seed), B = board(bag, at);
  const R = 'sandstone_relief';
  for (let j = 0; j < regs; j++) {
    const v = v0 + j * (hh + 0.35), n = Math.max(1, Math.floor((u1 - u0) / (hh * 1.15 * 0.95))), w = (u1 - u0) / n;
    B.poly('egyptian_blue', [[u0, 0], [u1, 0], [u1, 0.07], [u0, 0.07]], 0, v - 0.08, 1, 1, 0.012, 0.03);
    for (let i = 0; i < n; i++) {
      const s0 = u0 + i * w, flip = (i + j) % 2 ? 1 : -1;
      figure(bag, R, 'smite', at, s0 + w * (flip > 0 ? 0.35 : 0.65), v, hh * 0.92, flip, 0.07);
      // the god receiving the captives: a seated figure on a block throne, its sceptre, at the end of each scene
      figure(bag, R, i % 2 ? 'seated' : 'god', at, s0 + w * (flip > 0 ? 0.9 : 0.1), v, hh * 0.78, -flip, 0.06);
      for (let k = 0; k < 2; k++) B.poly(R, MAN, s0 + w * (flip > 0 ? 0.62 : 0.38) + flip * k * 0.28, v + 0.02, hh * 0.38, -flip, 0.012, 0.045 + r() * 0.01);
    }
  }
  B.flush();
  void box;
}
