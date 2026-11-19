// A small algebra that runs the same expression either on numbers (Node: tests and simulations) or on
// three.js TSL nodes (the vertex shader): `X.of(v)` wraps a number or a node, and the chain methods
// (add, mul, sin, smooth …) return a wrapped number when every operand is a number and a node
// otherwise. The animals' behaviours (critter-poses.js) are written once in it, so what the tests
// step through in Node is what the shader computes (up to float32 and the hash).
import {
  float, sin as tSin, cos as tCos, atan as tAtan, abs as tAbs, floor as tFloor, fract as tFract, sqrt as tSqrt, pow as tPow,
  min as tMin, max as tMax, clamp as tClamp, smoothstep as tSmooth, step as tStep,
} from 'three/tsl';

const num = (v) => typeof v === 'number';
const raw = (o) => (o instanceof X ? o.v : o);
const node = (v) => (num(v) ? float(v) : v);

export class X {
  constructor(v) { this.v = v; }
  static of(v) { return v instanceof X ? v : new X(v); }
  _b(o, f, g) { const a = this.v, b = raw(o); return new X(num(a) && num(b) ? f(a, b) : g(node(a), b)); }
  _u(f, g) { return new X(num(this.v) ? f(this.v) : g(this.v)); }
  add(o) { return this._b(o, (a, b) => a + b, (a, b) => a.add(b)); }
  sub(o) { return this._b(o, (a, b) => a - b, (a, b) => a.sub(b)); }
  mul(o) { return this._b(o, (a, b) => a * b, (a, b) => a.mul(b)); }
  div(o) { return this._b(o, (a, b) => a / b, (a, b) => a.div(b)); }
  neg() { return this.mul(-1); }
  sin() { return this._u(Math.sin, tSin); }
  cos() { return this._u(Math.cos, tCos); }
  abs() { return this._u(Math.abs, tAbs); }
  floor() { return this._u(Math.floor, tFloor); }
  fract() { return this._u((a) => a - Math.floor(a), tFract); }
  sqrt() { return this._u((a) => Math.sqrt(Math.max(a, 0)), tSqrt); }
  pow(o) { return this._b(o, (a, b) => Math.pow(Math.max(a, 0), b), (a, b) => tPow(a, b)); }
  min(o) { return this._b(o, Math.min, (a, b) => tMin(a, b)); }
  max(o) { return this._b(o, Math.max, (a, b) => tMax(a, b)); }
  clamp(lo = 0, hi = 1) { return this.max(lo).min(hi); }
  /** this as the angle y of atan2(y, x) */
  atan2(x) { return this._b(x, Math.atan2, (y, b) => tAtan(y, b)); }
  /** smoothstep(e0, e1, this) (e0 > e1 gives the falling edge) */
  smooth(e0, e1) {
    const a = this.v, p = raw(e0), q = raw(e1);
    if (num(a) && num(p) && num(q)) { const t = Math.max(0, Math.min(1, (a - p) / (q - p))); return new X(t * t * (3 - 2 * t)); }
    // (WGSL leaves smoothstep undefined when the edges are given the wrong way round: a falling edge is one minus the rising)
    if (num(p) && num(q) && p > q) return new X(float(1).sub(tSmooth(q, p, node(a))));
    return new X(tSmooth(p, q, node(a)));
  }
  /** 1 where this >= e, else 0 */
  ge(e) { return this._b(e, (a, b) => (a >= b ? 1 : 0), (a, b) => tStep(b, a)); }
  /** 1 where this < e, else 0 */
  lt(e) { return X.of(1).sub(this.ge(e)); }
  /** this + (b - this) * t (t 0…1) */
  mix(b, t) { return this.add(X.of(b).sub(this).mul(t)); }
  /** this as a 0/1 mask: a where it is 1, b where 0 */
  pick(a, b) { return X.of(b).add(X.of(a).sub(b).mul(this)); }
  /** the angle wrapped to −π…π */
  wrap() { return this.sin().atan2(this.cos()); }
  /** fract(sin(this·12.9898 + 78.233)·43758.5453), as the engine's hash */
  hash() { return this.mul(12.9898).add(78.233).sin().mul(43758.5453).fract(); }
}
/** Wrap a number or node. */
export const x = (v) => X.of(v);
/** Hypot of two wrapped values. */
export const hyp = (a, b) => X.of(a).mul(a).add(X.of(b).mul(b)).sqrt();
/** Is it a node? (false for numbers) */
export const isNode = (v) => !num(raw(v));
export { raw };
