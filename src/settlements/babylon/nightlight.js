// Babylon by night (docs/settlements/babylon.md §19): what was lit there, as the engine's one additive material `halo` (palette.js, materials.js 'halo': light ADDED over what
// is behind it, at night only, no light, no shadow, no collision; the brightness carried by the vertex normals' y), so that the lamps read as lit at the low preset, where the
// pool of real point lights is off. Same construction as Suzhou's, Athens' and Thebes' (their files are not imported).
//
// What lit Babylon at night [inferred: no source describes the city's night; the lamps and fires are those the excavations and texts give for Mesopotamia]: clay oil lamps
// (sesame oil) in niches over doors and in the rooms, the braziers at the gates and the Way's standards, the lampstands of the temple and of the throne room (Daniel 5:5 has
// "lampstand" in the king's hall), the hearth and oven fires of the bakers, brewers, potters and smiths at work before dawn, the shrines' lamps at the lane crossings. The
// lanes themselves had no lighting.
//
// Three parts: lit(fn) wraps an element builder so that every light the builder pushes (the shops' rooms, the houses' rooms, Esagila's chambers and cella, the throne room's
// lampstands) also gets its glow ball and the pool of light on the floor under it; `babylon_night` is the plan of what no builder lights: the door lamp over each furnished
// house's door and the lit counter window of each shop, the braziers of the Way and the court, the lamps of the offering tables and street shrines.
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
 * (The floor is taken at 0.06 m, as every Babylonian room's floor is; a lamp more than 3 m above it throws no pool, only its glow.)
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

/** The settlement-frame point of a furnished house's door (urHouseOpen: 1.27 m from the corner of the front) and the unit vector out of the front. */
const OUT = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
export function houseDoor(rect, f) {
  const [x0, z0, x1, z1] = rect;
  const p = f === 'n' ? [x0 + 1.27, z0] : f === 's' ? [x1 - 1.27, z1] : f === 'w' ? [x0, z1 - 1.27] : [x1, z0 + 1.27];
  return { p, out: OUT[f], side: f === 'n' || f === 's' ? [1, 0] : [0, 1] };
}
/** A shop's counter window and door (babylon_shop's frame: u along the front from its corner, v in): the centre of the window, its width, the unit vectors. */
export function shopWindow(rect, f) {
  const [x0, z0, x1, z1] = rect, U = f === 'n' || f === 's' ? x1 - x0 : z1 - z0;
  const W = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const a = 3.0, b = U - 1.0, c = W((a + b) / 2, 0.25), alongU = f === 'n' || f === 's';
  return { c, w: b - a, out: OUT[f], side: alongU ? [f === 'n' ? 1 : -1, 0] : [0, f === 'w' ? -1 : 1], door: W(1.2, 0) };
}

/**
 * babylon_night: { doors: [{ rect, door }], windows: [{ rect, door }], fires: [{ at, y, r? }] } — one plan, one draw: the door lamp's glow and the pool before the door of each
 * furnished house; the lit window of each shop (a sheet, its wash on the front and the pool of the lane before it) and the lamp over its door; the fires (braziers, the lamps
 * of the offering tables and the shrines) each a glow ball and a pool.
 */
function night(el, { bag }) {
  const H = new Halo();
  for (const d of el.doors || []) {
    const { p, out, side } = houseDoor(d.rect, d.door), g = 0.04;
    H.ball(p[0] + out[0] * 0.3, 2.5, p[1] + out[1] * 0.3, 0.5);
    H.floor(p[0] + out[0] * 1.4, g, p[1] + out[1] * 1.4, 1.9, 10);
    void side;
  }
  for (const s of el.windows || []) {
    const { c, w, out, side, door } = shopWindow(s.rect, s.door);
    const P = (a, y) => [c[0] + side[0] * a * w / 2, y, c[1] + side[1] * a * w / 2];
    H.quad(P(-1, 0.97), P(1, 0.97), P(1, 2.43), P(-1, 2.43), 0.78);
    const q = [c[0] + out[0] * 0.3, 1.7, c[1] + out[1] * 0.3];
    H.spill(q, side[0] ? [1, 0, 0] : [0, 0, 1], [0, 1, 0], 0.9 + w * 0.5, [out[0], out[1]]);
    H.floor(c[0] + out[0] * 1.6, 0.04, c[1] + out[1] * 1.6, 1.6 + w * 0.35, 10);
    H.ball(door[0] + out[0] * 0.35, 2.6, door[1] + out[1] * 0.35, 0.4);
  }
  for (const f of el.fires || []) {
    H.ball(f.at[0], (f.y ?? 0) + (f.h ?? 1.25), f.at[1], f.r ?? 0.8);
    H.floor(f.at[0], (f.y ?? 0) + 0.04, f.at[1], (f.r ?? 0.8) * 3, 10);
  }
  H.flush(bag);
}

/** The element table additions: the night plan's element. */
export const NIGHT_ELEMENTS = { babylon_night: night };
