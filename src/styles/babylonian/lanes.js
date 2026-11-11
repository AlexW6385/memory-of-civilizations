// The lanes of Babylon's blocks (docs/settlements/babylon.md §13): paving of baked brick in the core between the fronts, a
// bitumen-lined gutter along the middle of the narrow alleys, and at the lane crossings the furniture of a Babylonian street:
// a shrine in a niche of a brick pier (street chapels of Ishtar and Nergal are attested), a trough with the posts where
// animals are tied, a heap of bricks, a bench of brick, a clay stand with the great water jar for the passers-by.
import { box, lathe } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ZIR = [[0.001, 0], [0.12, 0], [0.2, 0.1], [0.3, 0.4], [0.28, 0.62], [0.2, 0.84], [0.14, 0.92], [0.17, 0.97], [0.12, 0.98], [0.001, 0.94]];

/** babylon_lanes: { rects: [[x0, z0, x1, z1]], alleys: [[x0, z0, x1, z1]], props: [{ at, kind, rot, seed }] } */
function lanes(el, { bag, col }) {
  for (const r of el.rects || []) bag.add('brick_paving', box(r[0], -0.3, r[1], r[2], 0.045, r[3]));
  for (const r of el.alleys || []) {
    bag.add('brick_paving', box(r[0], -0.3, r[1], r[2], 0.045, r[3]));
    const along = r[2] - r[0] > r[3] - r[1], c = along ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
    bag.add('bitumen', along ? box(r[0], 0.04, c - 0.14, r[2], 0.055, c + 0.14) : box(c - 0.14, 0.04, r[1], c + 0.14, 0.055, r[3]));
  }
  for (const p of el.props || []) {
    const [x, z] = p.at, rand = rng(p.seed || 1), c = Math.cos(p.rot || 0), s = Math.sin(p.rot || 0);
    const P = (lx, y, lz) => [x + lx * c + lz * s, y, z - lx * s + lz * c];
    const bx = (mat, x0, y0, z0, x1, y1, z1, solid = true) => {
      const a = P(x0, y0, z0), b = P(x1, y1, z1), r = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
      bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1);
    };
    const Lt = (mat, prof, lx, lz, y, seg = 10) => { const q = P(lx, 0, lz); bag.add(mat, lathe(prof, seg, null, q[0], y, q[2])); };
    if (p.kind === 'shrine') {
      // a pier 0.9 m square and 2.3 m high, a niche in its face (the god's emblem on a plaque, a lamp, offerings), a roof of mud
      bx('mudbrick', -0.45, 0.04, -0.45, 0.45, 2.3, 0.45); bx('mud_plaster', -0.52, 2.3, -0.52, 0.52, 2.42, 0.52, false);
      bx('opening', -0.28, 1.1, -0.47, 0.28, 2.0, -0.44, false); bx('limewash_white', -0.28, 1.1, -0.465, 0.28, 2.0, -0.455, false);
      bx('glaze_lapis', -0.18, 1.45, -0.475, 0.18, 1.85, -0.466, false); bx('glaze_yellow', -0.08, 1.55, -0.485, 0.08, 1.75, -0.476, false);
      bx('mudbrick', -0.5, 0.04, -0.85, 0.5, 0.95, -0.45); bx('brick_baked', -0.52, 0.95, -0.87, 0.52, 1.02, -0.45, false);
      Lt('terracotta', [[0.001, 0], [0.06, 0], [0.08, 0.04], [0.001, 0.05]], -0.2, -0.65, 1.02, 8); bx('flame', 0.18, 1.02, -0.67, 0.2, 1.1, -0.65, false);
      bx('pottery_dark', 0.12, 1.02, -0.72, 0.28, 1.06, -0.58, false);
    } else if (p.kind === 'trough') {
      bx('brick_baked', -1.1, 0.04, -0.3, 1.1, 0.5, 0.3); bx('bitumen', -0.95, 0.48, -0.18, 0.95, 0.52, 0.18, false);
      for (const sx of [-1.4, 1.4]) bx('palm_trunk', sx - 0.07, 0.04, 0.5, sx + 0.07, 1.4, 0.64);
      bx('palm_trunk', -1.5, 1.2, 0.5, 1.5, 1.3, 0.62, false);
    } else if (p.kind === 'bricks') {
      for (let r = 0; r < 4; r++) bx(r % 2 ? 'brick_baked' : 'mudbrick', -0.8 + r * 0.05, 0.04 + r * 0.2, -0.45, 0.8 - r * 0.07, 0.24 + r * 0.2, 0.45);
    } else if (p.kind === 'bench') {
      bx('mudbrick', -1.0, 0.04, -0.28, 1.0, 0.46, 0.28); bx('reed_mat', -0.9, 0.46, -0.24, 0.5, 0.47, 0.24, false);
    } else if (p.kind === 'zir') {
      bx('brick_baked', -0.36, 0.04, -0.36, 0.36, 0.3, 0.36); Lt('terracotta', ZIR.map(([r, y]) => [r * 1.25, y * 1.25]), 0, 0, 0.3, 12);
      Lt('pottery_dark', [[0.001, 1.25], [0.16, 1.26], [0.2, 1.32], [0.001, 1.33]], 0, 0, 0.3, 10);
      bx('brick_baked', 0.5, 0.04, -0.2, 0.9, 0.2, 0.2, false); Lt('terracotta', [[0.001, 0], [0.06, 0.005], [0.14, 0.06], [0.13, 0.065], [0.001, 0.02]], 0.7, 0, 0.2, 8);
    }
    void rand;
  }
}
export function babylonianLanes() { return { babylon_lanes: lanes }; }
