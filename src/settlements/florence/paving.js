// Florence — the paving of the streets and the squares (docs/settlements/florence.md §22): the ground by day was a plain wet grey with no
// joints. Here it is laid in the materials the plans already hold (`flagstone`, `cotto_floor`, `pietra_serena`), so no draw is added: the
// generic 'floor' slab of core/build.js, a few centimetres thick and with no collision (the walker keeps the terrain under it), in one
// plan of the renaissance style. Pure data from layout.js.

import { STYLES } from '../../core/build.js';
import '../../styles/renaissance/index.js';
import { quad, fromTriangles } from '../../core/geom.js';
import { RADIUS, lots, streets, subtract, KEEP, PIAZZA_DUOMO, SIGNORIA, MERCATO, ORSAN, MEDICI, BAPTISTERY, CAMPANILE, DUOMO, PALAZZO } from './layout.js';

const Y = 0.025, TH = 0.1, GUT = 0.34;
const flr = (rect, mat, y = Y, th = TH) => ({ rect, y, th, mat });
const big = (r) => r[2] - r[0] > 0.3 && r[3] - r[1] > 0.3;
const shrink = (r, m) => [r[0] + m, r[1] + m, r[2] - m, r[3] - m];

/** The streets: slabs of pietraforte either side of a gutter along the middle (the channel the rain and the slops ran down, §22); the north-south
 *  pieces are cut by the east-west ones, so no two slabs overlap at a crossing. */
function streetSlabs() {
  const S = streets(), ew = S.filter((s) => s.horiz).map((s) => s.r), E = [];
  for (const s of S) {
    const [x0, z0, x1, z1] = s.r;
    const halves = s.horiz
      ? [[x0, z0, x1, (z0 + z1) / 2 - GUT / 2], [x0, (z0 + z1) / 2 + GUT / 2, x1, z1]]
      : [[x0, z0, (x0 + x1) / 2 - GUT / 2, z1], [(x0 + x1) / 2 + GUT / 2, z0, x1, z1]];
    for (const h of halves) for (const r of (s.horiz ? [h] : subtract(h, ew, 0))) if (big(r)) E.push(flr(r, 'flagstone'));
    // where a north-south street crosses an east-west one the crossing is laid whole, so the gutters do not run into each other
  }
  for (const a of S.filter((s) => s.horiz)) for (const b of S.filter((s) => !s.horiz)) {
    const r = [Math.max(a.r[0], b.r[0]), Math.max(a.r[1], b.r[1]), Math.min(a.r[2], b.r[2]), Math.min(a.r[3], b.r[3])];
    if (!(r[2] - r[0] > 0.5 && r[3] - r[1] > 0.5)) continue;
    // the east-west gutter is laid over by the crossing slab: the crossing stands 1 cm above the street so that its top is its own
    E.push(flr(r, 'flagstone', Y + 0.006));
  }
  return E;
}

/** The squares: a field of one material with bands of pietra serena across it, cut round the buildings (the footprints a little shrunk, so that no strip of
 *  bare ground shows at their feet and none of the slab lies inside their walls). */
function field(rect0, holes, mat, band, every = [12, 12], grow = 0) {
  // grown to meet the streets, less the lots standing in the way (the squares were cut out of the street grid with a margin the ground kept bare)
  const rect = grow ? [rect0[0] - grow, rect0[1] - grow, rect0[2] + grow, rect0[3] + grow] : rect0;
  const near = grow ? lots().map((l) => l.rect).filter((q) => q[0] < rect[2] && q[2] > rect[0] && q[1] < rect[3] && q[3] > rect[1]) : [];
  const E = [], cuts = [...holes, ...near];
  for (const r of subtract(rect, cuts, 0)) if (big(r)) E.push(flr(r, mat));
  if (band) {
    const strips = [];
    // (each band a hair different in width, so that no twelve are one shape and the engine does not make an instanced draw of them)
    let k = 0;
    for (let x = rect[0] + every[0] / 2; x < rect[2] - 1; x += every[0]) strips.push([x - 0.22 - (k++ % 13) * 0.0007, rect[1], x + 0.22, rect[3]]);
    for (let z = rect[1] + every[1] / 2; z < rect[3] - 1; z += every[1]) strips.push([rect[0], z - 0.18 - (k++ % 13) * 0.0007, rect[2], z + 0.18]);
    // (each strip is its own piece, cut by the holes; the east-west ones are cut by the north-south ones where they meet, so none overlaps)
    const ns = strips.filter((s) => s[3] - s[1] > s[2] - s[0]);
    for (const s of strips) for (const p of subtract(s, s[3] - s[1] > s[2] - s[0] ? cuts : [...cuts, ...ns], 0)) if (big(p) && Math.min(p[2] - p[0], p[3] - p[1]) > 0.2 && Math.max(p[2] - p[0], p[3] - p[1]) > 1.5) E.push(flr(p, band, Y + 0.012, TH));
  }
  return E;
}

/** The paving of the whole town: one plan. */
export function pavingPlans() {
  const S = streets().map((s) => s.r);
  // the footprints that stay unpaved: the landmarks' own, a little inside the KEEP rectangles
  const cathedral = [[-74, -82, 20, -38], [14, -106, 90, -14]].map((r) => shrink(r, 1.2));
  const baptistery = shrink([-147, -75, -110, -45], 1.2), campanile = shrink([-72, -38.5, -54, -21.5], 1.0);
  const palazzo = shrink([56, 112, 106, 164], 1.0), loggia = [8, 161, 54, 186];
  const E = [...streetSlabs()];
  // the Piazza del Duomo and the Mercato Vecchio in slabs of pietraforte, the stone the streets are laid in, banded with pietra serena
  E.push(...field(PIAZZA_DUOMO, [...cathedral, baptistery, campanile, ...S], 'flagstone', 'pietra_serena', [13, 11], 4.2));
  E.push(...field(MERCATO, [[MERCATO[0] + 8, MERCATO[3] - 14, MERCATO[2] - 22, MERCATO[3] - 7], [-53.5, 36.5, -46.5, 43.5], ...S], 'flagstone', 'pietra_serena', [10.5, 10.5], 4.2));
  // the Piazza della Signoria in brick in fields between bands of stone [inferred: the brick paving of the piazza laid in the 14th century, from memory, not verified here]
  E.push(...field(SIGNORIA, [palazzo, loggia, ...S], 'cotto_floor', 'pietra_serena', [11, 9.5], 4.2));
  // the ground round Orsanmichele, whose four streets are cleared, and round the Palazzo Medici: slabs up to the walls
  E.push(...field([ORSAN[0] - 5, ORSAN[1] - 5, ORSAN[2] + 5, ORSAN[3] + 5], [shrink([14, 18, 50.4, 44.1], 0.6), ...S], 'flagstone', null));
  E.push(...field([MEDICI[0] - 6, MEDICI[1] - 6, MEDICI[2] + 8, MEDICI[3] + 6], [[MEDICI[0] - 2, MEDICI[1] - 2, MEDICI[2] + 2, MEDICI[3] + 2], ...S], 'flagstone', null));
  return [{ id: 'florence-paving', style: 'renaissance', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [{ t: 'florence_paving', slabs: E }], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' } }];
}

/** The element: every slab of one material in one geometry (no collision). Merged here, not left to the bag, which would draw the many equal boxes as an instanced mesh of their own: one more draw each. */
function paving(el, { bag }) {
  const by = new Map();
  for (const { rect: [x0, z0, x1, z1], y, th, mat } of el.slabs) {
    if (!by.has(mat)) by.set(mat, []);
    const out = by.get(mat), y0 = y - th;
    const b = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], t = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
    quad(out, t[0], t[3], t[2], t[1]);
    quad(out, b[0], t[0], t[1], b[1]); quad(out, b[1], t[1], t[2], b[2]); quad(out, b[2], t[2], t[3], b[3]); quad(out, b[3], t[3], t[0], b[0]);
  }
  for (const [mat, tris] of by) bag.add(mat, fromTriangles(tris));
}
if (STYLES.renaissance) STYLES.renaissance.elements.florence_paving = paving;
