// Animals that move (DESIGN §8): fish under the water's face, and birds, drawn by the GPU. A
// settlement gives its data in src/settlements/<id>/fauna.js (the default export, below); this
// module is generic. Four draws at most: the fish, the rings they leave when they rise, the small
// birds (swallows, crows, sparrows) and the herons — each ONE mesh of copies of a template with the
// copy's parameters as vertex attributes, every motion computed in the vertex shader from a
// clock (uT) and the copy's seed: nothing is moved on the CPU, nothing is allocated in a frame.
//
//  Fish   swim round a closed loop (a Lissajous curve, validated to stay inside the water with a
//         margin by `dist`), in loose schools (each fish has its own offset), the tail beating.
//         The water is opaque (materials.js), so a fish is drawn as a soft, tinted shape laid on
//         its face, a hair above it, and fades into it; now and then one rises, lifting its nose,
//         and leaves a ring that spreads.
//  Birds  flight birds (swallows, crows) follow a loop likewise; a swallow's loop follows the
//         viewer along its canal (the loop's centre drifts to the nearest point of the canal, so a
//         few birds always play near the visitor); a crow's circles over a fixed place.
//         Perched birds (sparrows, herons) stand at a place: a sparrow hops and pecks, a heron
//         stands, its neck swaying. When the visitor comes near they fly off (the CPU only stamps
//         the time and the direction; the flight, the absence and the return are the shader's).
//         Wings: flapping and gliding, folded when perched, banking in turns.
//  Hours  swallows, sparrows and herons by day (less in rain), crows at twilight; faded by scale.
//
// The settlement's data (all metres in its frame, +x east, +y up, +z south):
//   fish:    [{ n, size:[min,max], palette:'goldfish'|'carp'|…, y (the water's level), area:[x0,z0,x1,z1]
//               (where the school's loop may be centred), dist(x,z) (negative inside the water),
//               margin, a:[ax,az] (the loop's largest half-axes), speed (m/s), rise (0…1: share of fish
//               that rise), k (loop shape: 1 ellipse, 2 figure of eight), tries }]
//   flights: [{ kind:'swallow'|'crow', n, lane:{a:[x,z], b:[x,z]} (follows the viewer along it) |
//               loop:{c:[x,z], a:[ax,az], rot, dist?, margin?}, half (lane: lateral half-width),
//               y:[low, high], speed }]
//   perches: [{ kind:'sparrow'|'egret'|'heron', x, z, y, rot (the axis of its hops / the way it faces),
//               range:[along, across], stay:[s0, s1] (herons: how long it stays), gone:[s0, s1] }]

import * as THREE from 'three/webgpu';
import {
  attribute, uniform, varying, vec2, vec3, float, positionGeometry, sin, cos, atan, exp, pow, abs, sign, fract, floor, mix, select,
  smoothstep, step, clamp, length, distance, max, renderGroup,
} from 'three/tsl';
import { ENV } from './env.js';
import { registerSystem } from './systems.js';

const TAU = Math.PI * 2;
const FISH_REACH = 58, BIRD_REACH = 150, CROW_REACH = 230;

// ── the clock and what the shaders share ─────────────────────────────────────
const U = {
  t: uniform(0), cam: uniform(new THREE.Vector3()), act: uniform(new THREE.Vector4(0, 0, 0, 0)),
  lane: [uniform(new THREE.Vector2()), uniform(new THREE.Vector2()), uniform(new THREE.Vector2()), uniform(new THREE.Vector2())],
};
U.t.setGroup(renderGroup); U.cam.setGroup(renderGroup); U.act.setGroup(renderGroup); for (const l of U.lane) l.setGroup(renderGroup);

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (n) => fract(sin(n.mul(12.9898).add(78.233)).mul(43758.5453));
/** The light the animals are lit by, roughly the ground's (as the flakes of rain.js). */
const lightNode = () => ENV.sunColor.mul(0.55).add(ENV.fogColor.mul(0.55)).add(ENV.nightFill.mul(0.4));

// ── templates ────────────────────────────────────────────────────────────────
/** A growing set of triangles: positions, per-vertex extras (width w), indices. */
class Mesher {
  constructor(w) { this.p = []; this.x = []; this.i = []; this.w = w; }
  v(p, ...x) { this.p.push(...p); this.x.push(...x); return this.p.length / 3 - 1; }
  tri(a, b, c) { this.i.push(a, b, c); }
  quad(a, b, c, d) { this.i.push(a, b, c, a, c, d); }
  /** A tube through stations [{ x, y, ry, rz }] with n sides; extra(sideAngle) gives the vertex extras. */
  loft(st, n, extra) {
    const rings = [];
    for (const s of st) {
      const ring = [];
      for (let k = 0; k < n; k++) { const a = (k / n) * TAU; ring.push(this.v([s.x, s.y + s.ry * Math.sin(a), s.rz * Math.cos(a)], ...extra(a, s))); }
      rings.push(ring);
    }
    for (let r = 0; r + 1 < rings.length; r++) for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; this.quad(rings[r][k], rings[r][k2], rings[r + 1][k2], rings[r + 1][k]); }
    // close the ends (a point for a zero radius)
    for (const [ring, flip] of [[rings[0], false], [rings[rings.length - 1], true]]) for (let k = 1; k + 1 < n; k++) flip ? this.tri(ring[0], ring[k + 1], ring[k]) : this.tri(ring[0], ring[k], ring[k + 1]);
  }
}

/** A fish of unit length, nose +x, the tail to −x: body, tail fin and two pectoral fins. extras: [edge]. */
function fishTemplate() {
  const m = new Mesher(1);
  m.loft([
    { x: 0.5, y: 0, ry: 0.0, rz: 0.0 }, { x: 0.44, y: 0, ry: 0.034, rz: 0.04 }, { x: 0.34, y: 0, ry: 0.07, rz: 0.08 }, { x: 0.18, y: 0, ry: 0.092, rz: 0.1 },
    { x: 0.0, y: 0, ry: 0.098, rz: 0.1 }, { x: -0.15, y: 0, ry: 0.07, rz: 0.07 }, { x: -0.27, y: 0, ry: 0.03, rz: 0.03 },
  ], 6, (a) => [Math.abs(Math.cos(a))]);
  const root = m.v([-0.26, 0, 0], 0.2), notch = m.v([-0.4, 0, 0], 0.6), l = m.v([-0.52, 0, -0.2], 1), r = m.v([-0.52, 0, 0.2], 1);
  m.tri(root, l, notch); m.tri(root, notch, r); m.tri(root, notch, l); m.tri(root, r, notch);
  for (const sg of [-1, 1]) {
    const a = m.v([0.2, -0.03, sg * 0.07], 0.5), b = m.v([0.02, -0.03, sg * 0.25], 1), c = m.v([0.1, -0.03, sg * 0.07], 0.5);
    m.tri(a, b, c); m.tri(a, c, b);
  }
  return m;
}

// bird parts: 0 body, 1 wing, 2 tail, 3 leg, 4 neck. per vertex tm = (part, s along the wing, ny (up 1 … down −1), aux 1 = beak)
/** A small bird of unit length (beak +x, tail −x), wings along ±z of half-span 1, legs hanging 0.27 below the centre. */
function smallBirdTemplate() {
  const m = new Mesher(4);
  m.loft([
    { x: 0.5, y: 0.03, ry: 0, rz: 0 }, { x: 0.43, y: 0.035, ry: 0.022, rz: 0.022 }, { x: 0.34, y: 0.04, ry: 0.1, rz: 0.09 }, { x: 0.2, y: 0.02, ry: 0.15, rz: 0.13 },
    { x: 0.0, y: 0, ry: 0.17, rz: 0.15 }, { x: -0.2, y: -0.01, ry: 0.13, rz: 0.11 }, { x: -0.32, y: -0.02, ry: 0.05, rz: 0.045 },
  ], 6, (a, s) => [0, 0, Math.sin(a), s.x > 0.4 ? 1 : 0]);
  // tail (a fork)
  const A = m.v([-0.3, -0.02, -0.05], 2, 0, 0.3, 0), B = m.v([-0.3, -0.02, 0.05], 2, 0, 0.3, 0), C = m.v([-0.55, -0.02, -0.1], 2, 0, 0.3, 0), D = m.v([-0.55, -0.02, 0.1], 2, 0, 0.3, 0), E = m.v([-0.46, -0.02, 0], 2, 0, 0.3, 0);
  m.tri(A, B, E); m.tri(A, E, C); m.tri(B, D, E);
  // wings: sections at s = 0, 0.45, 1 (leading and trailing edge)
  for (const sg of [-1, 1]) {
    const secs = [0, 0.45, 1].map((s) => {
      const lead = 0.24 - 0.5 * Math.pow(s, 1.3), chord = 0.36 * (1 - 0.78 * Math.pow(s, 1.5)) + 0.03, z = sg * (0.06 + 0.94 * s);
      return [m.v([lead, 0.03, z], 1, s, 0.6, 0), m.v([lead - chord, 0.03, z], 1, s, 0.6, 0)];
    });
    for (let k = 0; k < 2; k++) { m.quad(secs[k][0], secs[k][1], secs[k + 1][1], secs[k + 1][0]); }
  }
  // legs
  for (const sg of [-1, 1]) {
    const a = m.v([-0.02, -0.12, sg * 0.05 - 0.012], 3, 0, 0, 0), b = m.v([-0.02, -0.12, sg * 0.05 + 0.012], 3, 0, 0, 0), c = m.v([0.0, -0.27, sg * 0.05], 3, 0, 0, 0), d = m.v([0.1, -0.27, sg * 0.05], 3, 0, 0, 0);
    m.tri(a, b, c); m.tri(a, c, b); m.tri(c, d, b); m.tri(c, b, d);
  }
  return m;
}

/** A heron / egret of unit length 0.55 m: feet at the origin, stands 1.4 high; long legs, an S neck, a long beak. */
function heronTemplate() {
  const m = new Mesher(4);
  const body = [
    { x: 0.5, y: 0.78, ry: 0, rz: 0 }, { x: 0.35, y: 0.78, ry: 0.07, rz: 0.06 }, { x: 0.15, y: 0.72, ry: 0.15, rz: 0.13 }, { x: -0.05, y: 0.68, ry: 0.19, rz: 0.15 },
    { x: -0.3, y: 0.66, ry: 0.14, rz: 0.1 }, { x: -0.5, y: 0.64, ry: 0.04, rz: 0.035 },
  ];
  m.loft(body, 6, (a) => [0, 0, Math.sin(a), 0]);
  // the neck: S-curved from the breast up to the head, then the head and the beak (aux 1)
  const neck = [
    { x: 0.3, y: 0.78, ry: 0.07, rz: 0.06 }, { x: 0.42, y: 0.95, ry: 0.04, rz: 0.035 }, { x: 0.36, y: 1.12, ry: 0.035, rz: 0.03 },
    { x: 0.46, y: 1.28, ry: 0.04, rz: 0.035 }, { x: 0.52, y: 1.38, ry: 0.06, rz: 0.05 },
  ];
  m.loft(neck, 5, (a) => [4, 0, Math.sin(a), 0]);
  m.loft([{ x: 0.5, y: 1.38, ry: 0.045, rz: 0.04 }, { x: 0.66, y: 1.36, ry: 0.025, rz: 0.022 }, { x: 0.9, y: 1.33, ry: 0.0, rz: 0.0 }], 4, (a) => [0, 0, Math.sin(a), 1]);
  // the tail
  const A = m.v([-0.45, 0.66, -0.05], 2, 0, 0.3, 0), B = m.v([-0.45, 0.66, 0.05], 2, 0, 0.3, 0), C = m.v([-0.72, 0.6, 0], 2, 0, 0.3, 0);
  m.tri(A, B, C); m.tri(A, C, B);
  // wings: long and broad
  for (const sg of [-1, 1]) {
    const secs = [0, 0.4, 1].map((s) => {
      const lead = 0.3 - 0.35 * Math.pow(s, 1.4), chord = 0.62 * (1 - 0.65 * Math.pow(s, 1.4)) + 0.05, z = sg * (0.08 + 0.92 * s);
      return [m.v([lead, 0.8, z], 1, s, 0.6, 0), m.v([lead - chord, 0.8, z], 1, s, 0.6, 0)];
    });
    for (let k = 0; k < 2; k++) m.quad(secs[k][0], secs[k][1], secs[k + 1][1], secs[k + 1][0]);
  }
  // the legs, from the belly to the feet (the hip at y 0.56)
  for (const sg of [-1, 1]) {
    const z = sg * 0.06;
    const a = m.v([0.0, 0.58, z - 0.012], 3, 0, 0, 0), b = m.v([0.0, 0.58, z + 0.012], 3, 0, 0, 0), c = m.v([0.0, 0.0, z - 0.012], 3, 0, 0, 0), d = m.v([0.0, 0.0, z + 0.012], 3, 0, 0, 0);
    m.quad(a, b, d, c); m.quad(a, c, d, b);
    const f0 = m.v([0.0, 0.0, z], 3, 0, 0, 0), f1 = m.v([0.16, 0.0, z], 3, 0, 0, 0), f2 = m.v([-0.04, 0.0, z], 3, 0, 0, 0);
    m.tri(f0, f1, f2); m.tri(f0, f2, f1);
  }
  return m;
}

// ── instances ────────────────────────────────────────────────────────────────
/** Copies of a template: vertex attributes `names` (each a vec4, or 1 float) repeated for every copy. */
class Copies {
  constructor(tpl, extraDim, count, names) {
    this.tpl = tpl; this.n = count; this.nv = tpl.p.length / 3; this.names = names;
    this.dim = names.map(([, d]) => d);
    this.data = names.map(([, d]) => new Float32Array(count * this.nv * d));
    const pos = new Float32Array(count * this.nv * 3), ex = new Float32Array(count * this.nv * extraDim), index = [];
    for (let c = 0; c < count; c++) {
      pos.set(tpl.p, c * this.nv * 3); ex.set(tpl.x, c * this.nv * extraDim);
      for (const i of tpl.i) index.push(c * this.nv + i);
    }
    this.pos = pos; this.ex = ex; this.index = index; this.extraDim = extraDim;
  }
  set(c, name, values) {
    const k = this.names.findIndex(([n]) => n === name), d = this.dim[k], arr = this.data[k];
    for (let v = 0; v < this.nv; v++) for (let j = 0; j < d; j++) arr[(c * this.nv + v) * d + j] = values[j] ?? 0;
  }
  /** interleave: the copy attributes share one vertex buffer (WebGPU allows 8 buffers; the birds have ten attributes). */
  geometry(extraName, interleave = false) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute(extraName, new THREE.BufferAttribute(this.ex, this.extraDim));
    if (interleave) {
      const stride = this.dim.reduce((a, b) => a + b, 0), nvt = this.n * this.nv, arr = new Float32Array(nvt * stride);
      let off = 0; this.offsets = {};
      this.names.forEach(([n, d], k) => { this.offsets[n] = off; for (let v = 0; v < nvt; v++) for (let j = 0; j < d; j++) arr[v * stride + off + j] = this.data[k][v * d + j]; off += d; });
      const ib = new THREE.InterleavedBuffer(arr, stride); this.inter = arr; this.stride = stride; this.ibuf = ib;
      this.names.forEach(([n, d]) => g.setAttribute(n, new THREE.InterleavedBufferAttribute(ib, d, this.offsets[n])));
    } else this.names.forEach(([n, d], k) => g.setAttribute(n, new THREE.BufferAttribute(this.data[k], d)));
    g.setIndex(this.index);
    return g;
  }
}

// ── fish ─────────────────────────────────────────────────────────────────────
// vertex attributes: position (the template), edge (1 float: 0 along the back … 1 at the fins and flanks),
//   fa (cx, cz, ax, az), fb (w, phase, rot, k), fc (offset along, offset across, seed, size), fd (rgb, rise period; 0: never),
//   fe (the level of the water, how strongly the body is marked)
const PALETTES = {
  goldfish: [[0.93, 0.52, 0.1, 0.55], [0.88, 0.3, 0.09, 0.5], [0.96, 0.74, 0.3, 0.35], [0.72, 0.14, 0.08, 0.2], [0.94, 0.62, 0.2, 0.7]],
  carp: [[0.2, 0.22, 0.17, 0], [0.3, 0.26, 0.15, 0], [0.16, 0.19, 0.16, 0]],
  redcarp: [[0.8, 0.26, 0.09, 0.15], [0.86, 0.38, 0.1, 0.3], [0.7, 0.18, 0.08, 0.1]],
};

/** The pose of a fish at time t: its (x, z) and heading, from the loop attributes. */
function fishPose(t, fa, fb, fc) {
  const th = fb.x.mul(t).add(fb.y), k = fb.w, ph2 = th.mul(k).add(0.7);
  const lx = fa.z.mul(sin(th)), lz = fa.w.mul(sin(ph2));
  const dx = fa.z.mul(cos(th)).mul(fb.x), dz = fa.w.mul(k).mul(cos(ph2)).mul(fb.x);
  const cr = cos(fb.z), sr = sin(fb.z);
  const px = lx.mul(cr).sub(lz.mul(sr)), pz = lx.mul(sr).add(lz.mul(cr));
  const vx = dx.mul(cr).sub(dz.mul(sr)), vz = dx.mul(sr).add(dz.mul(cr));
  const psi = atan(vz, vx);
  const ol = fc.y.add(sin(t.mul(0.6).add(fc.z.mul(40))).mul(0.18)), cp = cos(psi), sp = sin(psi);
  return { x: fa.x.add(px).add(fc.x.mul(cp)).sub(ol.mul(sp)), z: fa.y.add(pz).add(fc.x.mul(sp)).add(ol.mul(cp)), psi };
}

function fishMaterial() {
  const edge = attribute('edge', 'float'), fa = attribute('fa', 'vec4'), fb = attribute('fb', 'vec4'), fc = attribute('fc', 'vec4'), fd = attribute('fd', 'vec4'), fe = attribute('fe', 'vec4');
  const pg = positionGeometry, t = U.t, seed = fc.z, size = fc.w;
  const T = max(fd.w, 1), has = step(0.5, fd.w);
  const ph = t.div(T).add(seed), u = fract(ph).mul(T);
  const bump = has.mul(smoothstep(0, 0.3, u)).mul(float(1).sub(smoothstep(0.7, 1.2, u)));
  const P = fishPose(t, fa, fb, fc);
  // the body, wagging from the middle to the tail
  const wgt = clamp(float(0.2).sub(pg.x).div(0.7), 0, 1), wag = sin(t.mul(7).sub(pg.x.mul(6)).add(seed.mul(40))).mul(wgt.mul(wgt)).mul(0.13);
  const ly = pg.y.mul(mix(float(0.3), float(1), bump)).add(pg.x.mul(0.32).mul(bump));
  const lz = pg.z.add(wag);
  const cp = cos(P.psi), sp = sin(P.psi);
  const wx = P.x.add(pg.x.mul(cp).sub(lz.mul(sp)).mul(size)), wz = P.z.add(pg.x.mul(sp).add(lz.mul(cp)).mul(size));
  const wy = fe.x.add(0.028).add(ly.mul(size)).add(bump.mul(0.035));
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
  m.positionNode = vec3(wx, wy, wz);
  const fade = varying(float(1).sub(smoothstep(FISH_REACH * 0.62, FISH_REACH, distance(vec3(P.x, fe.x, P.z), U.cam))));
  const rise = varying(bump);
  const tp = positionGeometry;
  const n1 = sin(tp.x.mul(11).add(seed.mul(50))).mul(sin(tp.z.mul(15).add(seed.mul(31)))).add(sin(tp.x.mul(5).sub(seed.mul(20))).mul(0.5));
  const patch = smoothstep(0.15, 0.4, n1).mul(fe.y);
  const base = mix(fd.xyz, vec3(0.97, 0.92, 0.82), patch);
  const L = lightNode();
  const lit = base.mul(L).mul(mix(float(0.62), float(1), rise));
  const tint = vec3(0.05, 0.1, 0.1).mul(L);
  m.colorNode = mix(lit, tint, edge.mul(0.3).add(0.08).mul(float(1).sub(rise.mul(0.7))));
  m.opacityNode = float(0.9).mul(float(1).sub(edge.mul(edge).mul(0.7))).mul(fade);
  m.fog = false;
  return m;
}

function ringMaterial() {
  const corner = attribute('corner', 'vec2'), fa = attribute('fa', 'vec4'), fb = attribute('fb', 'vec4'), fc = attribute('fc', 'vec4'), fd = attribute('fd', 'vec4'), fe = attribute('fe', 'vec4');
  const t = U.t, T = max(fd.w, 1), ph = t.div(T).add(fc.z), u = fract(ph).mul(T);
  const P = fishPose(t.sub(u), fa, fb, fc);
  const r = float(0.1).add(u.mul(0.3));
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  m.positionNode = vec3(P.x.add(corner.x.mul(r)), fe.x.add(0.034), P.z.add(corner.y.mul(r)));
  const uu = varying(u), fade = varying(float(1).sub(smoothstep(FISH_REACH * 0.62, FISH_REACH, distance(vec3(P.x, fe.x, P.z), U.cam))));
  const rr = length(corner);
  const ringShape = smoothstep(0.62, 0.8, rr).mul(float(1).sub(smoothstep(0.82, 1, rr)));
  m.colorNode = vec3(0.78, 0.84, 0.88).mul(lightNode());
  m.opacityNode = ringShape.mul(0.5).mul(float(1).sub(clamp(uu.div(3.2), 0, 1))).mul(smoothstep(0, 0.15, uu)).mul(fade).mul(step(uu, 3.2));
  m.fog = false;
  return m;
}

// ── birds ────────────────────────────────────────────────────────────────────
// vertex attributes: position, tm (part, s, ny, aux), then per copy
//   ia (kind 0 swallow 1 crow 2 sparrow 3 heron, seed, flap rate Hz, span)
//   ib (cx, cz, ax, az) — a perched bird: (home x, home z, hop range along, across)
//   ic (w, phase, rot, k) — a perched bird: (hop period s, –, rot, –)
//   id (y low, y rise, lane (−1: none), size)
//   ie (flew off at, comes back at, away x, away z) — set by the CPU
//   icol (back rgb, tail length), icol2 (belly rgb, stance: how far the feet are below the centre / size), ig (leg and beak rgb)
const KIND = { swallow: 0, crow: 1, sparrow: 2, egret: 3, heron: 3, pigeon: 2, raven: 1, kite: 1, gull: 1, vulture: 1, stork: 3, ibis: 3 };
// (the kinds the settlements name beyond these: drawn as the nearest look)
const BIRD_ALIAS = { dove: 'pigeon', rock_dove: 'pigeon', jackdaw: 'crow', chough: 'crow', rook: 'crow', magpie: 'crow', myna: 'sparrow', finch: 'sparrow', martin: 'swallow', swift: 'swallow',
  hawk: 'kite', falcon: 'kite', eagle: 'kite', buzzard: 'kite', tern: 'gull', duck: 'egret', goose: 'egret', crane: 'heron', flamingo: 'heron', parrot: 'sparrow' };
const birdKind = (k) => (KIND[k] !== undefined ? k : KIND[BIRD_ALIAS[k]] !== undefined ? BIRD_ALIAS[k] : 'sparrow');
const BIRD_ATTRS = [['ia', 4], ['ib', 4], ['ic', 4], ['id', 4], ['ie', 4], ['icol', 4], ['icol2', 4], ['ig', 4]];

function birdMaterial() {
  const tm = attribute('tm', 'vec4'), ia = attribute('ia', 'vec4'), ib = attribute('ib', 'vec4'), ic = attribute('ic', 'vec4'), id = attribute('id', 'vec4');
  const ie = attribute('ie', 'vec4'), icol = attribute('icol', 'vec4'), icol2 = attribute('icol2', 'vec4'), ig = attribute('ig', 'vec4');
  const pg = positionGeometry, t = U.t;
  const kind = ia.x, seed = ia.y, hz = ia.z, span = ia.w, size = id.w;
  const perched = step(1.5, kind), isHeron = step(2.5, kind), isSparrow = perched.sub(isHeron);
  const part = tm.x, s = tm.y, ny = tm.z, aux = tm.w;
  const isWing = step(0.5, part).mul(step(part, 1.5)), isTail = step(1.5, part).mul(step(part, 2.5)), isLeg = step(2.5, part).mul(step(part, 3.5)), isNeck = step(3.5, part);
  const isBody = float(1).sub(step(0.5, part));
  const PI = Math.PI;

  // ── the loop of a flying bird (centre: fixed, or the lane's drifting point)
  const lane = id.z, isLane = step(-0.5, lane);
  const laneC = select(lane.lessThan(0.5), U.lane[0], select(lane.lessThan(1.5), U.lane[1], select(lane.lessThan(2.5), U.lane[2], U.lane[3])));
  const centre = mix(vec2(ib.x, ib.y), laneC, isLane);
  const loop = (tt) => {
    const th = ic.x.mul(tt).add(ic.y), k = ic.w, ph2 = th.mul(k).add(0.7);
    const lx = ib.z.mul(sin(th)), lz = ib.w.mul(sin(ph2));
    const dx = ib.z.mul(cos(th)).mul(ic.x), dz = ib.w.mul(k).mul(cos(ph2)).mul(ic.x);
    const cr = cos(ic.z), sr = sin(ic.z);
    const sn = sin(th);
    return {
      x: centre.x.add(lx.mul(cr)).sub(lz.mul(sr)), z: centre.y.add(lx.mul(sr)).add(lz.mul(cr)),
      y: id.x.add(id.y.mul(sn).mul(sn)), psi: atan(dx.mul(sr).add(dz.mul(cr)), dx.mul(cr).sub(dz.mul(sr))),
    };
  };
  const L0 = loop(t), L1 = loop(t.add(0.15));
  const dpsi = atan(sin(L1.psi.sub(L0.psi)), cos(L1.psi.sub(L0.psi)));
  const roll0 = clamp(dpsi.div(0.15).mul(0.85), -0.75, 0.75);
  const dist1 = max(length(vec2(L1.x.sub(L0.x), L1.z.sub(L0.z))), 0.01);
  const pitch0 = atan(L1.y.sub(L0.y), dist1);

  // ── a perched bird: at home (hopping and pecking), flying off, away, coming back
  const tau = max(ic.x, 0.2), q = t.div(tau).add(seed.mul(37)), kc = floor(q), f = fract(q);
  const cr0 = cos(ic.z), sr0 = sin(ic.z);
  const target = (n) => {
    const a = ib.z.mul(hash(n.add(seed.mul(37))).mul(2).sub(1)), l = ib.w.mul(hash(n.mul(1.7).add(seed.mul(91))).mul(2).sub(1));
    return vec2(ib.x.add(a.mul(cr0)).sub(l.mul(sr0)), ib.y.add(a.mul(sr0)).add(l.mul(cr0)));
  };
  const prev = target(kc.sub(1)), cur = target(kc), dv = cur.sub(prev), dl = length(dv);
  const hop = smoothstep(0, 0.22, f), hpos = mix(prev, cur, hop);
  const hopY = sin(clamp(f.div(0.22), 0, 1).mul(PI)).mul(0.085).mul(smoothstep(0.1, 0.4, dl));
  const hh = select(dl.greaterThan(0.08), atan(dv.y, dv.x), ic.z.add(seed.mul(TAU)));
  const gate = step(0.3, hash(kc.add(seed.mul(13))));
  const peckWin = smoothstep(0.25, 0.3, f).mul(float(1).sub(smoothstep(0.82, 0.88, f)));
  const pd = pow(abs(sin(clamp(f.sub(0.25), 0, 0.6).div(0.6).mul(3 * PI))), 3).mul(peckWin).mul(gate).mul(0.95).mul(isSparrow);
  const stand = icol2.w.mul(size);
  const tS = t.sub(ie.x), tR = t.sub(ie.y);
  const scared = step(ie.x, t).mul(float(1).sub(step(ie.y.add(2.4), t)));
  const landing = scared.mul(step(ie.y, t)), fled = scared.mul(float(1).sub(step(5, tS))), hidden = scared.sub(landing).sub(fled);
  const away = vec2(ie.z, ie.w);
  const dFly = tS.mul(2.5).add(tS.mul(tS).mul(0.9)), climb = float(1).sub(exp(tS.mul(-0.8))).mul(isHeron.mul(1.5).add(7));
  const fl = clamp(tR.div(2.4), 0, 1), omf = float(1).sub(fl), dLand = pow(omf, 1.6).mul(22);
  const homeX = ib.x, homeZ = ib.y, hy = id.x;
  // (x, z, y, heading, pitch, roll, fold, vis)
  const homeNow = float(1).sub(scared);
  const stillHome = select(isHeron.greaterThan(0.5), vec2(homeX, homeZ), hpos);
  const posHomeX = stillHome.x, posHomeZ = stillHome.y;
  const yHome = hy.add(stand).add(hopY.mul(isSparrow));
  const psiHome = select(isHeron.greaterThan(0.5), ic.z, hh);
  const fleeP = { x: homeX.add(away.x.mul(dFly)), z: homeZ.add(away.y.mul(dFly)), y: hy.add(stand).add(climb), psi: atan(ie.w, ie.z), pitch: float(0.45).mul(float(1).sub(smoothstep(2, 5, tS))) };
  const landP = { x: homeX.add(away.x.mul(dLand)), z: homeZ.add(away.y.mul(dLand)), y: hy.add(stand).add(pow(omf, 2.2).mul(5)), psi: atan(ie.w.negate(), ie.z.negate()), pitch: mix(float(-0.2), float(0.35), smoothstep(0.6, 0.95, fl)) };
  const sel3 = (home, flee, land) => select(landing.greaterThan(0.5), land, select(scared.greaterThan(0.5), flee, home));
  const px = sel3(posHomeX, fleeP.x, landP.x), pz = sel3(posHomeZ, fleeP.z, landP.z), py = sel3(yHome, fleeP.y, landP.y);
  const ppsi = sel3(psiHome, fleeP.psi, landP.psi), ppitch = sel3(float(0), fleeP.pitch, landP.pitch);
  const pfold = sel3(float(1), float(1).sub(smoothstep(0, 0.12, tS)), smoothstep(0.88, 1, fl));
  const pvis = float(1).sub(hidden).mul(select(fled.greaterThan(0.5), float(1).sub(smoothstep(4, 5, tS)), float(1))).mul(select(landing.greaterThan(0.5), smoothstep(0, 0.15, fl), float(1)));

  // ── choose by kind
  const X = select(perched.greaterThan(0.5), px, L0.x), Z = select(perched.greaterThan(0.5), pz, L0.z), Y = select(perched.greaterThan(0.5), py, L0.y);
  const psi = select(perched.greaterThan(0.5), ppsi, L0.psi), pitch = select(perched.greaterThan(0.5), ppitch, pitch0), roll = select(perched.greaterThan(0.5), float(0), roll0);
  const fold = select(perched.greaterThan(0.5), pfold, float(0));
  const vis0 = select(perched.greaterThan(0.5), pvis, float(1));
  const actK = select(kind.lessThan(0.5), U.act.x, select(kind.lessThan(1.5), U.act.y, select(kind.lessThan(2.5), U.act.z, U.act.w)));
  const reach = select(kind.lessThan(1.5), select(kind.lessThan(0.5), float(BIRD_REACH), float(CROW_REACH)), float(BIRD_REACH * 0.6));
  const dcam = distance(vec3(X, Y, Z), U.cam);
  const scale = size.mul(actK).mul(vis0).mul(float(1).sub(smoothstep(reach.mul(0.75), reach, dcam)));

  // ── the wings: flapping in bursts and gliding, folded when perched
  const glide = smoothstep(0.3, 0.6, sin(t.mul(0.45).add(seed.mul(13)))).mul(float(1).sub(perched)).mul(0.9);
  const amp = select(kind.lessThan(0.5), float(0.8), select(kind.lessThan(1.5), float(0.55), select(kind.lessThan(2.5), float(0.95), float(0.5))));
  const flapA = amp.mul(float(1).sub(glide)).mul(sin(t.mul(hz * TAU).add(seed.mul(TAU)))).add(float(0.16).add(glide.mul(0.08)));
  // (hz is per copy: the attribute)
  return { pg, tm, ia, ib, ic, id, ie, icol, icol2, ig, part, s, ny, aux, isWing, isTail, isLeg, isNeck, isBody, isHeron, isSparrow, perched, kind, seed, hz, span, size, t, X, Y, Z, psi, pitch, roll, fold, glide, scale, pd, amp, glideAmp: glide, flapA0: flapA, PI };
}

function buildBirdMaterial(isHeronMesh) {
  const N = birdMaterial();
  const { pg, part, s, ny, aux, isWing, isTail, isLeg, isNeck, isBody, isHeron, isSparrow, perched, seed, hz, span, size, t, X, Y, Z, psi, pitch, roll, fold, glide, scale, pd, amp, icol, icol2, ig, kind, PI } = N;
  // the wing's angle from the body's plane: flapping (hz is the copy's rate) or held
  const phase = t.mul(hz).mul(TAU).add(seed.mul(TAU));
  const flap = amp.mul(float(1).sub(glide)).mul(float(1).sub(fold)).mul(sin(phase)).add(float(0.16).mul(float(1).sub(fold)).add(glide.mul(0.1)));
  // body: the head dips in a peck about (0.1, 0)
  const al = pd.negate().mul(smoothstep(0, 0.3, pg.x)), ca = cos(al), sa = sin(al);
  const bx = float(0.1).add(pg.x.sub(0.1).mul(ca)).sub(pg.y.mul(sa)), by = pg.x.sub(0.1).mul(sa).add(pg.y.mul(ca));
  let x = mix(pg.x, bx, isBody.mul(isSparrow)), y = mix(pg.y, by, isBody.mul(isSparrow)), z = pg.z;
  // wings
  const sg = sign(pg.z), az = abs(pg.z).mul(span).mul(mix(float(1), float(0.15), fold));
  const sw = max(s, 0.001), ang = flap.mul(pow(sw, 0.8));
  const sweep = float(0.08).add(glide.mul(0.12)).add(fold.mul(0.1));
  x = mix(x, pg.x.sub(s.mul(s).mul(sweep)), isWing);
  y = mix(y, pg.y.add(az.mul(sin(ang))).add(fold.mul(isHeronMesh ? 0.02 : 0.05)), isWing);
  z = mix(z, sg.mul(az).mul(cos(ang)), isWing);
  // tail
  x = mix(x, float(-0.3).add(pg.x.add(0.3).mul(icol.w)), isTail.mul(float(isHeronMesh ? 0 : 1)));
  // legs: tucked in flight (a heron trails them)
  const fly = float(1).sub(fold);
  if (!isHeronMesh) {
    y = mix(y, float(-0.12).add(pg.y.add(0.12).mul(mix(float(1), float(0.25), fly))), isLeg);
  } else {
    const drop = float(0.58).sub(pg.y);
    x = mix(x, pg.x.sub(drop.mul(fly).mul(1.5)), isLeg);
    y = mix(y, float(0.58).sub(drop.mul(mix(float(1), float(0.2), fly))), isLeg);
    // the neck: drawn in while flying, swaying slowly when it stands
    const sway = sin(t.mul(0.35).add(seed.mul(5))).mul(0.09).add(sin(t.mul(0.13).add(seed.mul(9))).mul(0.06));
    const nx = float(0.3).add(pg.x.sub(0.3).mul(mix(float(1), float(0.55), fly))).add(sway.mul(pg.y.sub(0.78)).mul(fold));
    const ny2 = float(0.78).add(pg.y.sub(0.78).mul(mix(float(1), float(0.5), fly)));
    const headOn = step(0.78, pg.y).mul(step(0.5, aux.add(isNeck))); // (the head and beak follow the neck)
    void headOn;
    x = mix(x, nx, isNeck); y = mix(y, ny2, isNeck);
  }
  // bank, pitch, turn
  const cr = cos(roll), sr = sin(roll), y2 = y.mul(cr).sub(z.mul(sr)), z2 = y.mul(sr).add(z.mul(cr));
  const cp = cos(pitch), sp = sin(pitch), x3 = x.mul(cp).sub(y2.mul(sp)), y3 = x.mul(sp).add(y2.mul(cp));
  const cy = cos(psi), sy = sin(psi);
  const wx = x3.mul(cy).sub(z2.mul(sy)), wz = x3.mul(sy).add(z2.mul(cy));
  const m = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  m.positionNode = vec3(X.add(wx.mul(scale)), Y.add(y3.mul(scale)), Z.add(wz.mul(scale)));
  const shade = smoothstep(-0.25, 0.35, ny);
  let col = mix(icol2.xyz, icol.xyz, shade);
  col = mix(col, icol.xyz.mul(0.8), isWing);
  col = mix(col, ig.xyz, max(isLeg, step(0.5, aux).mul(float(1).sub(isNeck))));
  m.colorNode = col.mul(lightNode());
  m.fog = false;
  void kind; void isHeron; void PI; void size;
  return m;
}

// ── the system ───────────────────────────────────────────────────────────────
const _inv = new THREE.Matrix4(), _cam = new THREE.Vector3();
const att = new Map();      // site -> state
const LIST = [];            // the states, for the frame loop (no iterator allocated)
const _o = [0, 0];

function lanePoint(l, cam, out) {
  const [ax, az] = l.a, [bx, bz] = l.b, vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((cam.x - ax) * vx + (cam.z - az) * vz) / (vx * vx + vz * vz)));
  out[0] = ax + vx * t; out[1] = az + vz * t;
}

/** Find a loop that stays in the water: shrinks the half-axes until it does. Returns [cx, cz, ax, az] or null. */
function fitLoop(dist, rect, amax, ratio, k, rot, margin, rand, minA = 2) {
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let tries = 0; tries < 260; tries++) {
    const cx = rect[0] + (rect[2] - rect[0]) * rand(), cz = rect[1] + (rect[3] - rect[1]) * rand();
    if (dist(cx, cz) > -margin - 0.8) continue;
    for (let ax = amax[0]; ax >= minA; ax *= 0.88) {
      const az = Math.min(ax * ratio, amax[1]);
      let ok = true;
      for (let i = 0; i < 96 && ok; i++) {
        const th = (i / 96) * TAU, lx = ax * Math.sin(th), lz = az * Math.sin(k * th + 0.7);
        if (dist(cx + lx * cr - lz * sr, cz + lx * sr + lz * cr) > -margin) ok = false;
      }
      if (ok) return [cx, cz, ax, az];
    }
  }
  return null;
}

function buildFish(data, site) {
  const rand = rng(1531 + site.id.length), fish = [], rings = [];
  for (const sc of data) {
    const pal = PALETTES[sc.palette] || PALETTES.goldfish;
    const k = sc.k ?? (rand() < 0.5 ? 1 : 2), rot = (sc.rot ?? rand() * TAU);
    const loop = fitLoop(sc.dist, sc.area, sc.a, sc.ratio ?? 0.6, k, rot, sc.margin ?? 1.6, rand, sc.minA ?? 2);
    if (!loop) continue;
    const meanR = Math.max(loop[2], loop[3]) * 0.8, w = (sc.speed / Math.max(2, meanR)) * (rand() < 0.5 ? 1 : -1), ph = rand() * TAU;
    for (let i = 0; i < sc.n; i++) {
      const c = pal[Math.floor(rand() * pal.length)];
      const T = rand() < (sc.rise ?? 0) ? 14 + rand() * 26 : 0;
      fish.push({ fa: loop, fb: [w, ph + (rand() - 0.5) * 0.35, rot, k], fc: [(rand() - 0.5) * 1.8, (rand() - 0.5) * 1.3, rand(), sc.size[0] + (sc.size[1] - sc.size[0]) * rand()], fd: [c[0], c[1], c[2], T], fe: [sc.y, c[3]] });
    }
  }
  for (const f of fish) if (f.fd[3] > 0) rings.push(f);
  return { fish, rings };
}

function makeFishMeshes(fr) {
  const out = [];
  if (!fr.fish.length) return out;
  const cp = new Copies(fishTemplate(), 1, fr.fish.length, [['fa', 4], ['fb', 4], ['fc', 4], ['fd', 4], ['fe', 4]]);
  fr.fish.forEach((f, i) => { cp.set(i, 'fa', f.fa); cp.set(i, 'fb', f.fb); cp.set(i, 'fc', f.fc); cp.set(i, 'fd', f.fd); cp.set(i, 'fe', f.fe); });
  const mesh = new THREE.Mesh(cp.geometry('edge'), fishMaterial());
  mesh.name = 'fauna:fish'; mesh.frustumCulled = false; mesh.renderOrder = 9; out.push(mesh);
  if (fr.rings.length) {
    const rm = new Mesher(2);
    rm.v([0, 0, 0], -1, -1); rm.v([0, 0, 0], 1, -1); rm.v([0, 0, 0], 1, 1); rm.v([0, 0, 0], -1, 1); rm.quad(0, 1, 2, 3);
    const rc = new Copies(rm, 2, fr.rings.length, [['fa', 4], ['fb', 4], ['fc', 4], ['fd', 4], ['fe', 4]]);
    fr.rings.forEach((f, i) => { rc.set(i, 'fa', f.fa); rc.set(i, 'fb', f.fb); rc.set(i, 'fc', f.fc); rc.set(i, 'fd', f.fd); rc.set(i, 'fe', f.fe); });
    const ring = new THREE.Mesh(rc.geometry('corner'), ringMaterial());
    ring.name = 'fauna:rings'; ring.frustumCulled = false; ring.renderOrder = 10; out.push(ring);
  }
  return out;
}

const BIRD_LOOK = {
  swallow: { back: [0.07, 0.09, 0.17], belly: [0.82, 0.72, 0.58], leg: [0.12, 0.1, 0.1], size: 0.17, span: 0.95, hz: [5.5, 7.5], tail: 1.9 },
  crow: { back: [0.04, 0.04, 0.05], belly: [0.1, 0.1, 0.11], leg: [0.05, 0.05, 0.05], size: 0.46, span: 1.0, hz: [2.6, 3.6], tail: 1.0 },
  sparrow: { back: [0.4, 0.27, 0.17], belly: [0.72, 0.67, 0.58], leg: [0.5, 0.38, 0.32], size: 0.14, span: 0.72, hz: [10, 13], tail: 1.0 },
  egret: { back: [0.93, 0.94, 0.92], belly: [0.95, 0.95, 0.93], leg: [0.1, 0.1, 0.08], size: 0.55, span: 0.85, hz: [2.0, 2.6], tail: 1.0 },
  heron: { back: [0.5, 0.54, 0.6], belly: [0.82, 0.83, 0.82], leg: [0.3, 0.27, 0.15], size: 0.62, span: 0.9, hz: [1.8, 2.3], tail: 1.0 },
  pigeon: { back: [0.42, 0.44, 0.5], belly: [0.55, 0.56, 0.6], leg: [0.6, 0.3, 0.3], size: 0.24, span: 0.85, hz: [6, 8], tail: 1.0 },
  raven: { back: [0.03, 0.03, 0.04], belly: [0.06, 0.06, 0.07], leg: [0.04, 0.04, 0.04], size: 0.58, span: 1.1, hz: [2.2, 3.0], tail: 1.1 },
  kite: { back: [0.36, 0.24, 0.15], belly: [0.62, 0.48, 0.34], leg: [0.7, 0.6, 0.2], size: 0.55, span: 1.25, hz: [1.4, 2.0], tail: 1.5 },
  gull: { back: [0.7, 0.73, 0.77], belly: [0.95, 0.95, 0.95], leg: [0.85, 0.6, 0.3], size: 0.44, span: 1.2, hz: [2.4, 3.2], tail: 1.0 },
  vulture: { back: [0.2, 0.16, 0.12], belly: [0.32, 0.26, 0.2], leg: [0.4, 0.38, 0.35], size: 0.75, span: 1.35, hz: [1.2, 1.6], tail: 1.0 },
  stork: { back: [0.93, 0.93, 0.92], belly: [0.95, 0.95, 0.94], leg: [0.8, 0.3, 0.2], size: 0.7, span: 0.95, hz: [1.6, 2.1], tail: 1.0 },
  ibis: { back: [0.85, 0.85, 0.83], belly: [0.9, 0.9, 0.88], leg: [0.1, 0.1, 0.1], size: 0.5, span: 0.85, hz: [2.0, 2.6], tail: 1.0 },
};

function buildBirds(flights, perches, site) {
  flights = flights.map((f) => ({ ...f, kind: birdKind(f.kind) }));
  perches = perches.map((p) => ({ ...p, kind: birdKind(p.kind) }));
  const rand = rng(2203 + site.id.length), small = [], big = [], lanes = [];
  const rec = (kind, o) => {
    const L = BIRD_LOOK[kind];
    return { ia: [KIND[kind], rand(), L.hz[0] + (L.hz[1] - L.hz[0]) * rand(), L.span], icol: [...L.back, L.tail], icol2: [...L.belly, KIND[kind] === 2 ? 0.27 : 0], ig: [...L.leg, 0], ...o, kind, size: L.size * (0.92 + 0.16 * rand()) };
  };
  for (const fl of flights) {
    const L = BIRD_LOOK[fl.kind];
    let loop = null, lane = -1, rot = 0;
    if (fl.lane) {
      lane = lanes.length; if (lane > 3) continue;
      lanes.push(fl.lane);
      rot = Math.atan2(fl.lane.b[1] - fl.lane.a[1], fl.lane.b[0] - fl.lane.a[0]);
    } else {
      rot = fl.loop.rot ?? 0;
      if (fl.loop.dist) { const f = fitLoop(fl.loop.dist, [fl.loop.c[0] - 3, fl.loop.c[1] - 3, fl.loop.c[0] + 3, fl.loop.c[1] + 3], fl.loop.a, fl.loop.ratio ?? 0.35, fl.k ?? 2, rot, fl.loop.margin ?? 1.5, rand, 3); if (!f) continue; loop = f; }
      else loop = [fl.loop.c[0], fl.loop.c[1], fl.loop.a[0], fl.loop.a[1]];
    }
    const la = fl.a ?? [8, fl.half ?? 2.5], ax = loop ? loop[2] : la[0], az = loop ? loop[3] : la[1], k = fl.k ?? (KIND[fl.kind] === 1 ? 1 : 2);
    const mean = Math.max(ax, az) * 0.64;
    for (let i = 0; i < fl.n; i++) {
      const sp = fl.speed * (0.85 + 0.3 * rand()), w = (sp / Math.max(mean, 4)) * (rand() < 0.5 ? 1 : -1);
      small.push(rec(fl.kind, {
        ib: [loop ? loop[0] : 0, loop ? loop[1] : 0, ax * (0.8 + 0.4 * rand()), az * (0.8 + 0.4 * rand())], ic: [w, rand() * TAU, rot, k],
        id: [fl.y[0], fl.y[1] - fl.y[0], lane, 0], ie: [1e9, 1e9, 1, 0], perch: null,
      }));
      small[small.length - 1].id[3] = small[small.length - 1].size;
    }
  }
  const perchRecs = [];
  for (const p of perches) {
    const o = rec(p.kind, { ib: [p.x, p.z, p.range?.[0] ?? 0, p.range?.[1] ?? 0], ic: [1.4 + rand() * 1.4, 0, p.rot ?? 0, 0], id: [p.y, 0, -1, 0], ie: [1e9, 1e9, 1, 0] });
    o.id[3] = o.size;
    const P = { rec: o, def: p, big: KIND[p.kind] === 3, busy: 0, stayUntil: Infinity, alert: p.alert ?? (KIND[p.kind] === 3 ? 11 : 4.2) };
    (P.big ? big : small).push(o); perchRecs.push(P);
  }
  return { small, big, lanes, perchRecs };
}

function makeBirdMesh(tpl, recs, name) {
  if (!recs.length) return null;
  const cp = new Copies(tpl, 4, recs.length, BIRD_ATTRS);
  recs.forEach((r, i) => { for (const [n] of BIRD_ATTRS) cp.set(i, n, r[n] || [0, 0, 0, 0]); });
  const g = cp.geometry('tm', true);
  const mesh = new THREE.Mesh(g, buildBirdMaterial(name === 'fauna:herons'));
  mesh.name = name; mesh.frustumCulled = false;
  mesh.userData.copies = cp;
  return mesh;
}

/** Stamp the state of a perched bird into its mesh's `ie` attribute. */
function stamp(P, mesh, idx) {
  const cp = mesh.userData.copies, arr = cp.inter, r = P.rec.ie, base = cp.offsets.ie;
  for (let v = 0; v < cp.nv; v++) { const o = (idx * cp.nv + v) * cp.stride + base; arr[o] = r[0]; arr[o + 1] = r[1]; arr[o + 2] = r[2]; arr[o + 3] = r[3]; }
  cp.ibuf.needsUpdate = true;
}

async function attach(site, world) {
  if (att.has(site)) return;
  let mod;
  try { mod = await import(`../settlements/${site.id}/fauna.js`); } catch (e) { return; }
  const data = mod.default;
  if (!data || site.state !== 'ready') return;
  const gen = site.gen;
  const S = { site, gen, meshes: [], act: [0, 0, 0, 0], fish: null, lanes: [], laneC: [], perch: [], birdsSmall: null, birdsBig: null, first: true, area: [0, 0, 1e9] };
  att.set(site, S); LIST.push(S);
  const fr = buildFish(data.fish || [], site);
  S.meshes.push(...makeFishMeshes(fr));
  const B = buildBirds(data.flights || [], data.perches || [], site);
  S.lanes = B.lanes; S.laneC = B.lanes.map(() => [0, 0]);
  const small = makeBirdMesh(smallBirdTemplate(), B.small, 'fauna:birds'), big = makeBirdMesh(heronTemplate(), B.big, 'fauna:herons');
  S.birdsSmall = small; S.birdsBig = big;
  for (const P of B.perchRecs) { const list = P.big ? B.big : B.small; P.idx = list.indexOf(P.rec); P.mesh = P.big ? big : small; S.perch.push(P); }
  if (small) S.meshes.push(small); if (big) S.meshes.push(big);
  S.rand = rng(77 + site.id.length);
  S.radius = (site.S?.radius ?? 250) + 320;
  // the herons come "now and then": some are away at first
  for (const P of S.perch) {
    if (!P.def.stay) continue;
    if (S.rand() < 0.5) { P.rec.ie = [-100, U.t.value + 15 + S.rand() * 70, Math.cos(S.rand() * TAU), Math.sin(S.rand() * TAU)]; P.busy = P.rec.ie[1] + 2.4; }
    else P.stayUntil = U.t.value + P.def.stay[0] + S.rand() * (P.def.stay[1] - P.def.stay[0]);
    stamp(P, P.mesh, P.idx);
  }
  for (const m of S.meshes) { m.visible = false; site.group.add(m); }
  try { await world.r?.precompile?.(S.meshes); } catch (e) { console.warn('fauna precompile', e); }
  if (att.get(site) !== S || site.gen !== gen) return;      // let go of meanwhile
  for (const m of S.meshes) m.visible = true;
  S.ready = true;
}

function detach(site) {
  const S = att.get(site);
  if (!S) return;
  att.delete(site); LIST.splice(LIST.indexOf(S), 1);
  for (const m of S.meshes) { m.removeFromParent(); m.geometry.dispose(); m.material.dispose(); }
  S.meshes.length = 0;
}

const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function update(dt, camera, world) {
  U.t.value += dt;
  const T = U.t.value;
  for (let li = 0; li < LIST.length; li++) {
    const S = LIST[li], site = S.site;
    if (!S.ready) continue;
    if (site.state !== 'ready' || !site.group.visible) { for (const m of S.meshes) m.visible = false; continue; }
    _inv.copy(site.group.matrixWorld).invert(); _cam.copy(camera.position).applyMatrix4(_inv);
    const far = Math.hypot(_cam.x, _cam.z) > S.radius;
    for (const m of S.meshes) m.visible = !far;
    if (far) continue;
    U.cam.value.copy(_cam);
    // the hours: the sun's height; rain keeps the small birds in
    const sun = ENV.sunDir.value.y, rain = ENV.rain.value;
    const target0 = sm(0.02, 0.14, sun), tw = sm(0.22, 0.1, sun) * sm(-0.16, -0.05, sun);
    const a = S.act, k = Math.min(1, dt / 2.5), act = U.act.value;
    const k2 = S.first ? 1 : k;
    a[0] += (target0 * (1 - 0.6 * rain) - a[0]) * k2; a[1] += (tw * (1 - 0.5 * rain) - a[1]) * k2;
    a[2] += (sm(0.03, 0.16, sun) * (1 - 0.9 * rain) - a[2]) * k2; a[3] += (target0 * (1 - 0.5 * rain) - a[3]) * k2;
    act.set(a[0], a[1], a[2], a[3]);
    // the lanes' drifting points: the nearest point of each lane to the viewer
    for (let i = 0; i < S.lanes.length; i++) {
      const c = S.laneC[i], o = _o;
      lanePoint(S.lanes[i], _cam, o);
      if (S.first) { c[0] = o[0]; c[1] = o[1]; } else { const kk = Math.min(1, dt * 0.35); c[0] += (o[0] - c[0]) * kk; c[1] += (o[1] - c[1]) * kk; }
      U.lane[i].value.set(c[0], c[1]);
    }
    S.first = false;
    // the perched birds: off at the visitor, the herons off and on after their own time
    for (const P of S.perch) {
      if (T < P.busy) continue;
      const r = P.rec, dx = _cam.x - P.def.x, dz = _cam.z - P.def.z, dy = _cam.y - (P.def.y + 0.5);
      const near = dx * dx + dz * dz + dy * dy < P.alert * P.alert;
      const leave = T > P.stayUntil;
      if ((near && a[P.big ? 3 : 2] > 0.3) || leave) {
        let ax = -dx, az = -dz; const l = Math.hypot(ax, az);
        if (leave || l < 0.01) { const th = S.rand() * TAU; ax = Math.cos(th); az = Math.sin(th); } else { ax /= l; az /= l; }
        const gone = P.def.gone || [25, 60];
        r.ie = [T, T + 8 + gone[0] + S.rand() * (gone[1] - gone[0]), ax, az];
        P.busy = r.ie[1] + 2.4;
        P.stayUntil = P.def.stay ? P.busy + P.def.stay[0] + S.rand() * (P.def.stay[1] - P.def.stay[0]) : Infinity;
        stamp(P, P.mesh, P.idx);
      }
    }
  }
}

export const FAUNA_SYSTEM = registerSystem({ attach, detach, update });
