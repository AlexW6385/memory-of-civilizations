// Street furniture of Sydney in 1973 (docs/settlements/sydney.md §11): the cobra-head lamp on its concrete pole, the pillar box,
// the bus stop with its sign and shelter, the litter bin of mesh and wire.
import { box, lathe, rod } from '../../core/geom.js';

/** street_kit: { kind ('cobra' | 'pillar' | 'busstop' | 'bin'), at: [x, z], y, rot (the front or the arm toward +z turned by rot), seed } */
export function streetKit(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const W = (lx, ly, lz) => [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
  // a box in the local frame, turned: built from its four corners' bounds (rot is a multiple of 90 degrees here, or close: axis-aligned approximation)
  const B = (m, x0, y0, z0, x1, y1, z1) => { const a = W(x0, y0, z0), b = W(x1, y1, z1); bag.add(m, box(Math.min(a[0], b[0]), y + y0, Math.min(a[2], b[2]), Math.max(a[0], b[0]), y + y1, Math.max(a[2], b[2]))); };
  switch (el.kind) {
    case 'cobra': {                                                    // a concrete pole, tapering, with the arm over the road and the lamp's hood
      bag.add('concrete_light', lathe([[0.17, 0], [0.15, 0.3], [0.11, 4], [0.09, 8.2], [0.001, 8.2]], 8, null, x, y, z));
      const a = W(0, 8.0, 0), b = W(0, 8.5, 2.6); bag.add('steel_grey', rod(a, b, 0.05, 5));
      B('steel_grey', -0.2, 8.45, 2.0, 0.2, 8.6, 3.2); B('lamp_glass', -0.15, 8.38, 2.2, 0.15, 8.45, 3.0);
      col.circle(x, z, 0.2, y, y + 8);
      break;
    }
    case 'pillar': {                                                   // a red pillar box with its cap and slot
      bag.add('car_red', lathe([[0.3, 0], [0.3, 0.1], [0.27, 0.15], [0.27, 1.25], [0.31, 1.3], [0.31, 1.4], [0.18, 1.55], [0.001, 1.58]], 12, null, x, y, z));
      B('car_black', -0.14, 1.0, 0.255, 0.14, 1.06, 0.3); B('gilt_bronze', -0.1, 0.62, 0.26, 0.1, 0.7, 0.3);
      col.circle(x, z, 0.32, y, y + 1.6);
      break;
    }
    case 'busstop': {                                                  // a post with a round sign, a timetable board, and a slatted bench against a glass-and-steel shelter
      B('steel_grey', -1.5, 0, -0.55, -1.44, 2.4, -0.5); B('steel_grey', 1.44, 0, -0.55, 1.5, 2.4, -0.5);
      B('aluminium_dull', -1.6, 2.4, -0.7, 1.6, 2.48, 0.7); B('glass_outer', -1.44, 0.3, -0.55, 1.44, 2.4, -0.53);
      B('glass_outer', -1.5, 0.3, -0.5, -1.48, 2.4, 0.6); B('timber', -1.2, 0.42, -0.5, 1.2, 0.47, -0.2); B('steel_grey', -1.2, 0, -0.5, -1.14, 0.42, -0.2); B('steel_grey', 1.14, 0, -0.5, 1.2, 0.42, -0.2);
      B('steel_grey', 1.7, 0, 0.35, 1.76, 2.9, 0.41);
      bag.add('paint_cab_yellow', lathe([[0.001, 0], [0.24, 0], [0.24, 0.03], [0.001, 0.03]], 14, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(...W(1.7, 2.65, 0.45)));
      col.rect([Math.min(...[W(-1.6, 0, -0.7), W(1.6, 0, 0.7)].map((p) => p[0])), Math.min(...[W(-1.6, 0, -0.7), W(1.6, 0, 0.7)].map((p) => p[2])), Math.max(...[W(-1.6, 0, -0.7), W(1.6, 0, 0.7)].map((p) => p[0])), Math.max(...[W(-1.6, 0, -0.7), W(1.6, 0, 0.7)].map((p) => p[2]))], y, y + 2.5);
      break;
    }
    case 'bin': {                                                      // a wire-mesh litter bin on a post
      bag.add('steel_grey', lathe([[0.05, 0], [0.05, 0.7], [0.001, 0.7]], 6, null, x, y, z));
      bag.add('iron_galv', lathe([[0.2, 0.7], [0.23, 0.72], [0.25, 1.05], [0.22, 1.08], [0.001, 1.08]], 10, null, x, y, z));
      col.circle(x, z, 0.25, y, y + 1.1);
      break;
    }
    default: break;
  }
}
