// Ur by night (docs/settlements/ur.md §25): what was lit there, as the engine's one additive material `halo` (palette.js, materials.js 'halo': light ADDED over what is behind it,
// at night only, no light, no shadow, no collision; the brightness carried by the vertex normals' y), so that the lamps read as lit at the low preset, where the pool of real point
// lights is off. The same construction as Babylon's, Suzhou's and Athens' (their files are not imported).
//
// What lit Ur at night [inferred: no source describes the city's night; the lamps and fires are those the excavations and texts give for Mesopotamia]: clay oil lamps (sesame oil,
// a saucer with a pinched lip) on the lamp ledges of the house fronts and in the rooms, the fire on the altar of burnt offering in the Court of Nanna, the braziers of the court,
// the lamps of the shrines (the chapels' niches), the hearths and ovens of bakers and brewers at work before dawn. The lanes themselves had no lighting.
//
// Two parts: lit(fn) wraps an element builder so that every light the builder pushes (the court's altar fire and braziers, the shrine on the ziggurat's top, the Giparu's and the
// palace's rooms) also gets its glow ball and the pool of light on the floor under it; `ur_night` is the plan of what no builder lights: the lamp over the door of each house
// that can be entered, with the pool it throws on the lane.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const TAU = Math.PI * 2;

/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** The pool of light a lamp throws on the floor: a flat disc, brightest at its middle. */
  floor(x, y, z, r, segs = 8) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, r, null, segs, [1, 0.42, 0], [0, 0.5, 1]); }
  /** The glow round a flame: three crossed discs. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A sheet of one brightness f over the quadrilateral a b c d (the lamp of a room seen through a window), seen from either side. */
  quad(a, b, c, d, f = 0.8) {
    const N = [0, f, 0];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); this.tri(a, N, c, N, b, N); this.tri(a, N, d, N, c, N);
  }
  /** A wash of light on a wall or the street before a lit opening: a disc standing in the plane through c along the axes U, V, normal's brightness fading to the rim. */
  spill(c, U, V, r, nh) { this.disc(c, U, V, r, r * 0.8, nh, 8, [0.55, 0], [0, 1]); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

/** The glow of one `lights` entry ({ at, distance, intensity }) and the pool of light on the floor at `g` under it. */
export function lightHalo(H, l, g = 0.06) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  const fy = Math.min(g, y - 0.2);
  if (y - fy < 3.2) H.floor(x, fy + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), 10);
}

/**
 * An element builder whose lights get their halo: after the builder has run, each light it pushed gets its glow ball and floor pool in the plan's halo mesh.
 * (The floor is taken at 0.06 m, as every Ur room's floor is; a lamp more than 3 m above it throws no pool, only its glow.)
 */
export function lit(fn) {
  return (el, ctx) => {
    const n0 = ctx.lights ? ctx.lights.length : 0;
    const r = fn(el, ctx);
    if (ctx.lights && ctx.lights.length > n0) {
      const H = new Halo();
      for (const l of ctx.lights.slice(n0)) lightHalo(H, l, el.y ?? 0.06);
      H.flush(ctx.bag);
    }
    return r;
  };
}


// ── what no builder lights ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** The settlement-frame point of an open house's street door (urHouseOpen: its middle 1.275 m from the corner of the front) and the unit vector out of the front. */
const OUT = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
export function houseDoor(rect, f) {
  const [x0, z0, x1, z1] = rect, u = 1.275;
  const p = f === 'n' ? [x0 + u, z0] : f === 's' ? [x1 - u, z1] : f === 'w' ? [x0, z1 - u] : [x1, z0 + u];
  return { p, out: OUT[f], side: f === 'n' || f === 's' ? [1, 0] : [0, 1] };
}

/** ur_night: { doors: [{ rect, door }], fires: [{ at, y, h?, r? }] } — one plan, one draw: the door lamp's glow and the pool before the door of each house that can be entered; the fires. */
function night(el, { bag }) {
  const H = new Halo();
  for (const d of el.doors || []) {
    const { p, out } = houseDoor(d.rect, d.door);
    H.ball(p[0] + out[0] * 0.3, 2.35, p[1] + out[1] * 0.3, 0.45);
    H.floor(p[0] + out[0] * 1.4, 0.04, p[1] + out[1] * 1.4, 1.8, 10);
  }
  for (const f of el.fires || []) {
    H.ball(f.at[0], (f.y ?? 0) + (f.h ?? 1.25), f.at[1], f.r ?? 0.8);
    H.floor(f.at[0], (f.y ?? 0) + 0.04, f.at[1], (f.r ?? 0.8) * 3, 10);
  }
  H.flush(bag);
}

/** The element table additions: the night plan's element. */
export const NIGHT_ELEMENTS = { ur_night: night };
