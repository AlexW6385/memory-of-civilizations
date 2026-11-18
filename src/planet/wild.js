// Places worth walking to in the open country (docs/world.md, "Ground"): rock outcrops and tors,
// cliffs and sea stacks on some coasts, terraces on dry hills, the river's gravel bars, rapids and
// the sandbanks of its mouth. Pure functions of a direction (and what relief.js knows of the place),
// the same in the viewer, the workers and the tools. Every feature is multiplied by `mask`
// (relief.js wildMask): nothing within a settlement's disc, its blend or 20 m beyond, so that the
// settlements' heights, rims and base levels are exactly as without them.

import { noise3 } from './noise.js';
import { PLANET_RADIUS as R } from './sites.js';

const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function hash(a, b, c) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// The cube face's cell of a direction (as src/planet/chunk.js dirFace, copied: chunk imports relief).
const FN = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const FA = [[0, 0, -1], [0, 0, 1], [1, 0, 0], [1, 0, 0], [1, 0, 0], [-1, 0, 0]];
const FB = [[0, 1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1], [0, 1, 0], [0, 1, 0]];
const UNIT = Math.PI / 4 * R;                          // metres per unit of a face's coordinates
/** [face, s, t] of u, s and t in metres from the face's middle. */
function faceXY(u) {
  let f = 0, bd = -2;
  for (let k = 0; k < 6; k++) { const n = FN[k], d = u[0] * n[0] + u[1] * n[1] + u[2] * n[2]; if (d > bd) { bd = d; f = k; } }
  const a = FA[f], b = FB[f];
  return [f, Math.atan((u[0] * a[0] + u[1] * a[1] + u[2] * a[2]) / bd) * UNIT, Math.atan((u[0] * b[0] + u[1] * b[1] + u[2] * b[2]) / bd) * UNIT];
}

/**
 * The cell of size `cs` (m) holding the face point (s, t): its integer index, and the offset of the
 * point from the cell's origin; `at(k)` gives the cell's random number k, 0…1.
 */
function cellOf(f, s, t, cs, salt) {
  const i = Math.floor(s / cs), j = Math.floor(t / cs);
  return { x: s - i * cs, y: t - j * cs, at: (k) => hash(i * 8 + f, j + salt, k + salt * 31) };
}

/** A flat-topped crag of radius r and height H at distance q from its middle, rough by `rough` (m). */
function crag(q, r, H, rough, nz) {
  const f = 1 - (q / r) * (q / r);
  if (f <= 0) return 0;
  return Math.min(1, f * 1.7) * H * (1 + rough * nz);
}

/**
 * The height added to the open country's land (m), before its coast and rivers are cut: terraces on
 * dry hills, tors and outcrops, the coast's cliffs. p: the place (planet metres), u its direction.
 * land: the height without them; d the distance to the coast (m, > 0 on land); mount the range's
 * height there; moist, warm the climate. mask 0…1: how far from every settlement.
 */
export function landFeatures(u, px, py, pz, land, d, mount, moist, warm, mask) {
  if (mask <= 0 || d < 3) return 0;
  let add = 0;
  // geology: where the rock stands near the surface (broad regions), more in ranges
  let geo = -1;
  const G = () => (geo < 0 ? (geo = noise3(px / 1500 + 21.7, py / 1500, pz / 1500) * 0.5 + 0.5) : geo), mk = sm(0, 60, mount);
  // terraces on dry hills: the height drawn toward a stair of 2.2 m treads, where the climate is dry and the hills low
  let dryK = sm(0.4, 0.26, moist) * sm(0.28, 0.4, warm) * (1 - mk) * sm(5, 14, land) * sm(60, 160, d);
  if (dryK > 0.01) dryK *= sm(0.45, 0.62, G());
  if (dryK > 0.01) {
    const k = land / 2.2, fl = Math.floor(k), tread = (fl + sm(0.5, 1, k - fl)) * 2.2;
    add += (tread - land) * 0.75 * dryK;
  }
  // tors and outcrops: a crag (with a sister or two) in one of a few cells of ~350 m
  if (d > 40 && land > 3) {
    const [f, s, t] = faceXY(u), C = cellOf(f, s, t, 350, 3), pTor = 0.06 + 0.3 * mk;
    if (C.at(0) < pTor + 0.22 && C.at(0) < pTor + 0.22 * G() * G()) {
      const cx = 70 + C.at(1) * 210, cy = 70 + C.at(2) * 210, r0 = 11 + C.at(3) * 15, H = 4 + C.at(4) * 8 + mk * 6;
      const nz = noise3(px / 5.5, py / 5.5, pz / 5.5);
      let c = crag(Math.hypot(C.x - cx, C.y - cy), r0, H, 0.22, nz);
      for (let k = 0; k < 2; k++) {
        const a = C.at(5 + k) * 6.283, o = r0 * (0.9 + C.at(7 + k) * 0.7);
        c = Math.max(c, crag(Math.hypot(C.x - cx - Math.cos(a) * o, C.y - cy - Math.sin(a) * o), r0 * (0.35 + 0.3 * C.at(9 + k)), H * (0.4 + 0.4 * C.at(11 + k)), 0.25, nz));
      }
      add += c;
    }
  }
  // cliffs: on some coasts the land stands up from the shore, falling away inland
  if (d < 240) {
    const cl = cliffK(px, py, pz);
    if (cl > 0) {
      const H = (7 + 9 * (noise3(px / 90 + 5.1, py / 90, pz / 90) * 0.5 + 0.5)) * cl;
      add += H * sm(2, 18, d) * (1 - sm(50, 235, d));
    }
  }
  return add * mask;
}

/** How far the coast here is a cliff coast, 0…1 (about a third of the coasts), by position. */
export function cliffK(px, py, pz) {
  return sm(0.12, 0.4, noise3(px / 1300 + 11, py / 1300 + 3.3, pz / 1300));
}

/** The height added to the sea floor off a cliff coast (m): sea stacks. d < 0: off the coast. */
export function stackAt(u, px, py, pz, d, mask) {
  if (mask <= 0 || d > -7 || d < -130) return 0;
  const cl = cliffK(px, py, pz);
  if (cl < 0.3) return 0;
  const [f, s, t] = faceXY(u), C = cellOf(f, s, t, 64, 9);
  if (C.at(0) > 0.28 * cl) return 0;
  const cx = 18 + C.at(1) * 28, cy = 18 + C.at(2) * 28, r0 = 3 + C.at(3) * 4.5, H = 9 + C.at(4) * 13;
  const q = Math.hypot(C.x - cx, C.y - cy), f2 = 1 - (q / r0) * (q / r0);
  if (f2 <= 0) return 0;
  return Math.min(1, f2 * 1.6) * H * (1 + 0.2 * noise3(px / 3.5, py / 3.5, pz / 3.5)) * mask;
}

/**
 * The river's bed (m above the sea) at rv (relief.js: riverAt): the plain bed, with gravel bars along
 * the banks (rising above the water), stones of the rapids, and at a mouth shoals and sandbanks.
 * Returns { bed, bar (0…1: how much of the place is bar), sand (the bar is sand: a mouth's) }.
 */
export function riverBed(rv, steep, mask, rapids) {
  let bed = -1.4, bar = 0, sand = false;
  const x = rv.s / 55 + rv.seg.seed * 3.1, y = rv.side * rv.d / 15;
  // gravel bars: long blobs hugging the banks
  const nb = noise3(x, y, rv.seg.seed + (rv.side > 0 ? 0.37 : 5.3));
  const hug = sm(rv.half * 0.15, rv.half * 0.6, rv.d) * (1 - sm(rv.half * 1.02, rv.half + 3, rv.d));
  const b = sm(0.12, 0.42, nb) * hug * (rv.mouth ? 0 : mask);
  if (b > 0) { bed += (0.32 - bed) * b; bar = b; }
  // rapids: stones in the river's middle
  rapids *= mask;
  if (rapids > 0 && rv.d < rv.half) {
    const st = noise3(rv.s / 4.5 + 3, rv.d * rv.side / 4 + 7, 2.5) * 0.5 + 0.5;
    const rb = -0.55 + 0.95 * st * st;
    bed += (rb - bed) * rapids * (1 - sm(rv.half * 0.7, rv.half, rv.d) * 0.5);
  }
  // a mouth: shoals and sandbanks across the last ~400 m, wider than the river
  if (rv.s > -380 && rv.s < 520) {
    const k = sm(520, 120, rv.s) * sm(-380, -120, rv.s);
    const ns = noise3(rv.s / 70 + 40, rv.side * rv.d / 24, 9.1) * 0.5 + 0.5;
    const sb = sm(0.52, 0.72, ns) * k * mask * (1 - sm(rv.half * 0.8, rv.half + 40, rv.d) * 0.6);
    if (sb > 0.01) { bed += (0.45 - bed) * sb; bar = Math.max(bar, sb); sand = true; }
  }
  return { bed, bar, sand };
}
