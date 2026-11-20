// Vienna by night, 1902 (docs/settlements/vienna.md §15.1): the light the street lamps, the lit shop windows, the flats and the coffee house throw. The glow shades
// of the lamps (`lamp_glass`, `lamp_white`) are lit from within by their own material; what they lack where the pool of real lights is off (the low preset) is the
// light they give the things round them. Here it is made of geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it,
// at night only, with no light, no shadow and no collision. The shape of each piece is carried by its normals: a glow round each lamp (three crossed discs), a pool of
// light on the paving or a floor, a sheet in front of a window (the room's lamp behind the glass). The pattern is the Suzhou reference's (nightlight.js), copied here
// because that file carries Suzhou's data.
//
// ONE element, `vienna_night`, in one plan that is not tiled, so that every piece of halo in the town is one mesh and one draw. The windows' places come from the
// houses themselves: each lot's own builder (mietshaus.js, with `night: true`: windows only, no interiors, mass or roof) is run on a recorder bag that has the hooks
// the builders call (`window`, `shop`, `lamp`), so a pane lies exactly where a window is. Everything is a function of the window's or lamp's own place: no counters,
// no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { mietshaus } from './mietshaus.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TAU = Math.PI * 2;
/** The shares of windows lit by floor: the first two floors, above; the Biedermeier houses'. */
export const LIT = { low: 0.38, high: 0.28, biedermeier: 0.3 };

/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc (an ellipse) at c, spanned by the unit axes U and V with the semi-axes su and sv, in rings R of brightness F (the normals' y). */
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
  /** A disc lying on a horizontal plane at height y (the paving, a floor); `U` the unit direction of the first semi-axis [x, z]. */
  floor(x, y, z, r, rz = r, U = [1, 0], segs = 8, k = 1) { this.disc([x, y, z], [U[0], 0, U[1]], [-U[1], 0, U[0]], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60°. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  /** Into the bag, one geometry. */
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

/** The light of one street lamp on its post (the style's `gaslamp`: the shade's middle at 3.62 m): an arc lamp of the Ring throws a wider, stronger pool. */
export function lampLight(H, x, y, z, ring = false) {
  H.ball(x, y + 3.62, z, ring ? 1.7 : 1.1, ring ? 0.8 : 0.62);
  H.floor(x, y + 0.03, z, ring ? 4.4 : 3.0, ring ? 4.4 : 3.0, [1, 0], ring ? 12 : 10, ring ? 0.85 : 0.7);
}

const TRADE_K = { kaffeehaus: 0.95, konditorei: 0.92, weinstube: 0.82, apotheke: 0.85, uhrmacher: 0.85, buchhandlung: 0.75 };
/** The hooks the house builders call, on a recorder bag: every `add` is dropped and what the hooks see becomes halo. */
function recorder(H, lot) {
  const none = () => {};
  const lit = lot.kind === 'biedermeier' ? LIT.biedermeier : null;
  const unit = (F) => { const a = F.at(0, 0), b = F.at(0, 1); const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
  return {
    add: none, addInstance: none,
    /** A window of a floor: its pane of room light (the share of rooms lit by hash of the window's place). */
    window(F, y, u, v0, ww, hh, o = {}) {
      const c = F.at(u, 0), share = lit ?? (v0 < 7.5 ? LIT.low : LIT.high);
      if (hashAt(c[0], c[1], 23 + Math.floor(v0 / 2.5)) >= share * (o.open ? 0.8 : 1)) return;
      const m = 0.06, f = (0.4 + 0.36 * hashAt(c[0], c[1], 41 + Math.floor(v0 / 2.5))) * (o.open ? 0.6 : 1), d = o.open ? 0.0 : 0.056, n = unit(F);
      const a = F.at(u - ww / 2 + m, d), b = F.at(u + ww / 2 - m, d), y0 = y + v0 + m, y1 = y + v0 + hh - m;
      H.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], n, f);
    },
    /** A shop window, u0 to u1 and sill to top, at depth d: lit by the trade; the pool of its light on the pavement before it. */
    shop(F, y, u0, u1, sill, top, d, trade) {
      const c = F.at((u0 + u1) / 2, 0), k = trade ? TRADE_K[trade] ?? 0.72 : 0.55;
      if (!trade && hashAt(c[0], c[1], 57) > 0.7) return;
      const n = unit(F), a = F.at(u0 + 0.04, d), b = F.at(u1 - 0.04, d), y0 = y + sill + 0.04, y1 = y + top - 0.04;
      H.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], n, k * (0.9 + 0.1 * hashAt(c[0], c[1], 59)));
      // the pool on the flagstones: the window's width along the front, 2.1 m out
      const p = F.at((u0 + u1) / 2, 1.5), e = F.at(u1, 1.5), w = Math.hypot(e[0] - p[0], e[1] - p[1]);
      const t = [(e[0] - p[0]) / (w || 1), (e[1] - p[1]) / (w || 1)];
      H.floor(p[0], y + 0.14, p[1], w + 0.5, 1.9, t, 10, 0.55 * k);
    },
    /** The bracket lamp of a Durchhaus: its glow and the pool on the flagstones of the passage. */
    passageLamp(x, y, z) { H.ball(x, y, z, 1.0, 0.62); H.floor(x, 0.14, z, 2.6, 2.6, [1, 0], 8, 0.6); },
    /** An opal globe hung in a shop room: its glow, and its pool on the floor (seen from inside the shop). */
    lamp(x, y, z, trade) {
      const big = trade === 'kaffeehaus' || trade === 'konditorei';
      H.ball(x, y, z, big ? 1.3 : 1.0, big ? 0.7 : 0.6);
      H.floor(x, 0.16, z, big ? 2.8 : 2.2, big ? 2.8 : 2.2, [1, 0], 8, 0.6);
    },
  };
}
const NO_COL = new Proxy({}, { get: () => () => {} });

/** The Café Museum's light (cafe.js: four big windows on the street front, two on the cross street; four globes hung in a row). */
function cafeLight(H, rect) {
  const [x0, z0, x1, z1] = rect, W = x1 - x0, D = z1 - z0, GH = 4.5, T = 0.5, b = (z0 + T + z1 - T) / 2;
  for (const c of [3.1, 7.6, 12.1, 16.6]) {
    const xa = x0 + c - 1.55, xb = x0 + c + 1.55;
    H.quad([xa, 0.9, z1 + 0.012], [xb, 0.9, z1 + 0.012], [xb, 3.85, z1 + 0.012], [xa, 3.85, z1 + 0.012], [0, 1], 0.9);
    H.floor(x0 + c, 0.14, z1 + 1.6, 2.2, 1.9, [1, 0], 10, 0.5);
  }
  for (const c of [3.6, 8.2]) {
    const za = z1 - c - 1.55, zb = z1 - c + 1.55;
    H.quad([x1 + 0.012, 0.9, za], [x1 + 0.012, 0.9, zb], [x1 + 0.012, 3.85, zb], [x1 + 0.012, 3.85, za], [1, 0], 0.9);
    H.floor(x1 + 1.6, 0.14, z1 - c, 1.9, 2.2, [1, 0], 10, 0.5);
  }
  for (const a of [x0 + T + 3, x0 + T + 8.5, x0 + T + 14, x0 + T + 19]) { H.ball(a, GH - 0.9, b, 1.4, 0.72); H.floor(a, 0.16, b, 3.0, 3.0, [1, 0], 8, 0.62); }
  void W; void D;
}

/** A standing tram's lit windows (street.js tram: the band of glass 1.95 to 2.75 m, 9.6 m long, 2.2 m wide): the electric bulbs of the car, on both sides. */
function tramLight(H, { at: [cx, cz], rot = 0, y = 0 }) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (p, q) => [cx + p * c + q * s, cz - p * s + q * c], L = 9.6;
  for (const sg of [-1, 1]) for (const [p0, p1] of [[-L / 2 + 0.45, -0.6], [0.6, L / 2 - 0.45]]) {
    const a = P(p0, sg * 1.14), b = P(p1, sg * 1.14);
    H.quad([a[0], y + 2.0, a[1]], [b[0], y + 2.0, b[1]], [b[0], y + 2.7, b[1]], [a[0], y + 2.7, a[1]], [s * sg, c * sg], 0.6);
  }
}

/** vienna_night: { lamps: [[x, z, y, ring]…], lots: [mietshaus elements], cafe: rect } — all the town's halo, one mesh. */
export function viennaNight(el, { bag }) {
  const H = new Halo();
  for (const [x, z, y, ring] of el.lamps || []) lampLight(H, x, y ?? 0, z, !!ring);
  if (el.cafe) cafeLight(H, el.cafe);
  for (const t of el.trams || []) tramLight(H, t);
  for (const lot of el.lots || []) mietshaus({ ...lot, night: true, simple: false }, { bag: recorder(H, lot), col: NO_COL, lights: [] });
  H.flush(bag);
}
