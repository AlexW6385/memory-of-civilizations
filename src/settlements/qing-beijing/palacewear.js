// Wear on the palace's stone (docs/settlements/qing-beijing.md §45): the imperial way's slabs polished in the middle, the great courts' brick
// paler where the officials' feet went, the hollowed sills of the gates, the treads of the terraces polished, dust drifted at the feet of the
// red walls. Geometry only, in materials the landmark plan already holds (flagstone, marble_smooth, travertine, granite_grey): no new draw.
// Registered as one element of the landmark plan (`bj_wear_palace`) and a wrapper over `bj_stairs` (terrace.js). No Math.random: every
// variation is a hash of the place.
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import { WALL } from './layout.js';
import { Frame } from './houses.js';
import { wornSlab } from './wear.js';
import { hashAt } from './nightlight.js';

/** The stone way's slab sequence, as paving.js stoneWay lays it (same generator, same seed): [{ x0, x1, z0, z1, weathered }]. */
function slabsOfWay(rect, cols, seed) {
  let s = seed >>> 0 || 1;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), out = [], [x0, z0, , z1] = rect;
  let xa = x0;
  for (const w of cols) {
    let z = z0;
    while (z < z1 - 0.01) {
      const len = Math.min(z1 - z, 2.4 + r() * 1.2), weathered = r() < 0.16;
      out.push({ x0: xa, x1: xa + w, z0: z, z1: z + len, weathered, col: cols.indexOf(w) });
      z += len;
    }
    xa += w;
  }
  return out;
}

/** Pale patches of rubbed brick in the bands the officials crossed: lengthwise runs, thinning away from the way. */
function walkedBands(bag, z0, z1, xin, xout, seed) {
  for (const sx of [-1, 1]) for (let z = z0; z < z1 - 1.0; z += 1.3) {
    const h = hashAt(sx * 7, z, seed), ln = 1.1 + 1.6 * hashAt(z, sx, seed + 1);
    for (let k = 0; k < 3; k++) {
      const u = hashAt(z + k * 0.37, sx * 3, seed + 2 + k), x = xin + (xout - xin) * u * u * 0.9;       // denser by the way
      if (hashAt(x, z, seed + 9) > 0.78 - 0.45 * (x - xin) / (xout - xin)) continue;
      const w = 0.45 + 0.9 * hashAt(x, z, seed + 3), a = sx * x, zz = Math.min(z + h * 0.8, z1 - 0.2);
      bag.add('flagstone', box(Math.min(a, a + sx * w), 0.0305 + 0.0095, zz, Math.max(a, a + sx * w), 0.0305 + 0.0125, Math.min(zz + ln, z1)));
    }
  }
}

/** Drift of dust at the foot of a wall: low wedges of fine dust, 0.3–0.7 m wide, along x (z fixed, `out` ±1 the way it lies from the wall). */
function dustAlong(bag, x0, x1, zFace, out, gaps, y) {
  for (let x = x0; x < x1 - 0.2; x += 1.15) {
    const xm = x + 0.57;
    if (gaps.some(([a, b]) => xm > a - 0.7 && xm < b + 0.7)) continue;
    const w = 0.3 + 0.4 * hashAt(xm, zFace, 51), h = 0.012 + 0.03 * hashAt(xm, zFace, 52), L = 1.0 + 0.3 * hashAt(xm, zFace, 53);
    const za = zFace + out * 0.01, zb = zFace + out * (w + 0.01);
    bag.add('travertine', box(xm - L / 2, y, Math.min(za, zb), xm + L / 2, y + h, Math.max(za, zb)));
  }
}
function dustAlongZ(bag, z0, z1, xFace, out, gaps, y) {
  for (let z = z0; z < z1 - 0.2; z += 1.15) {
    const zm = z + 0.57;
    if (gaps.some(([a, b]) => zm > a - 0.7 && zm < b + 0.7)) continue;
    const w = 0.3 + 0.4 * hashAt(xFace, zm, 54), h = 0.012 + 0.03 * hashAt(xFace, zm, 55), L = 1.0 + 0.3 * hashAt(xFace, zm, 56);
    const xa = xFace + out * 0.01, xb = xFace + out * (w + 0.01);
    bag.add('travertine', box(Math.min(xa, xb), y, zm - L / 2, Math.max(xa, xb), y + h, zm + L / 2));
  }
}

function bjWearPalace(el, { bag }) {
  const [wx0, wz0, wx1, wz1] = WALL.rect;
  // 1. the imperial way's slabs, polished along the middle where the chair-bearers' and the processions' feet fell (slab tops at y 0.06 [paving.js])
  for (const [z0, z1] of el.way) {
    for (const s of slabsOfWay([-3.6, z0, 3.6, z1], [2.2, 2.8, 2.2], Math.round(z0))) {
      if (s.weathered) continue;
      const mx = (s.x0 + s.x1) / 2, w = s.col === 1 ? 1.0 : 0.55, ins = 0.28 + 0.2 * hashAt(mx, s.z0, 61);
      if (s.z1 - s.z0 < 0.9) continue;
      const xa = s.col === 0 ? s.x1 - 1.0 : s.col === 2 ? s.x0 + 0.45 : mx - w;
      const xb = s.col === 0 ? s.x1 - 0.45 : s.col === 2 ? s.x0 + 1.0 : mx + w;
      bag.add('marble_smooth', box(xa, 0.0615, s.z0 + ins, xb, 0.0645, s.z1 - ins));
    }
  }
  // 2. the courts' brick, paler in the bands beside the way (the bricks' cells there stand a hair lower, plan.js `wear`)
  for (const [z0, z1, seed] of el.bands) walkedBands(bag, z0, z1, 4.0, 13.0, seed);
  // 3. the gates' sills, hollowed (granite, the dip a hand's breadth across the middle)
  for (const g of el.sills) {
    const F = Frame(g.at[0], g.at[1], g.along === 'x' ? 's' : 'e');
    wornSlab(bag, 'granite_grey', F, -g.w / 2, g.w / 2, -0.26, 0.26, 0.0, 0.13, 0.04);
  }
  // 4. dust at the feet of the red walls
  const c = WALL.th / 2, y = 0.03;
  dustAlongZ(bag, wz0 + 9, wz1 - 9, wx0 + c, 1, [[60, 70]], y);
  dustAlongZ(bag, wz0 + 9, wz1 - 9, wx1 - c, -1, [[60, 70]], y);
  dustAlong(bag, wx0 + 9, wx1 - 9, wz0 + c, 1, [], y);
  for (const sg of [-1, 1]) {
    const lo = sg < 0 ? -110 : 36, hi = sg < 0 ? -36 : 110;
    dustAlong(bag, lo, hi, 116 - 1.1, -1, [[-74 - 3, -74 + 3], [74 - 3, 74 + 3]], 0.019);
    dustAlong(bag, lo, hi, 116 + 1.1, 1, [[-74 - 3, -74 + 3], [74 - 3, 74 + 3]], 0.019);
  }
  dustAlong(bag, -44, 44, 172 - 6, -1, el.passages, 0.019);
}

/** The treads of a flight of stairs, polished in their middle where the feet fall: a thin patch of smooth marble on each tread (the flight's
 *  own geometry is marble; the patch stands 4 mm over it). */
export function polishTreads(bag, el) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1, dir } = el;
  const alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.round((y1 - y0) / 0.16));
  const across = alongZ ? x1 - x0 : z1 - z0;
  if (across < 3 || el.slab) return;
  const inset = Math.min(0.5, across * 0.12);
  for (let k = 0; k < n; k++) {
    const f0 = k / n, f1 = (k + 1) / n, yy = y0 + (y1 - y0) * f1, d = len / n;
    // the worn part: the front three-fifths of the tread (the foot falls forward), from the nosing back
    const a = d * 0.12, b = d * 0.72;
    const r = alongZ
      ? (dir === 'n' ? [x0 + inset, z1 - len * f1 + (d - b), x1 - inset, z1 - len * f1 + (d - a)] : [x0 + inset, z0 + len * f0 + a, x1 - inset, z0 + len * f0 + b])
      : (dir === 'e' ? [x0 + len * f0 + a, z0 + inset, x0 + len * f0 + b, z1 - inset] : [x1 - len * f1 + (d - b), z0 + inset, x1 - len * f1 + (d - a), z1 - inset]);
    // (the front is the tread's lower edge: for 'n' the tread's front is at its larger z, for 's' at its smaller z, as the flight is climbed toward `dir`)
    bag.add('marble_smooth', box(r[0], yy + 0.0015, r[1], r[2], yy + 0.0045, r[3]));
  }
}

STYLES.qing.elements.bj_wear_palace = bjWearPalace;
