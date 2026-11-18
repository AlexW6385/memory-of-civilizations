// The wild animals' meshes (src/planet/wild-fauna.js, travellers.js): one instanced mesh per kind of
// beast and one for all the birds, children of the planet's group, so that the instances stand in
// planet coordinates (metres from the centre) and the group's matrix carries them to the view. The
// motion is in the vertex shader — legs striding in diagonal pairs, the head nodding and lowering to
// graze, a hop, wings beating, a neck and legs of their own length — the page writes a few dozen
// instances a frame (their place, heading, gait and colour) and allocates nothing.
//
// Per instance (16 floats): iP place (x, y, z of the planet) and scale; iF heading (a unit tangent) and
// the gait's phase; iA stride amplitude 0…1.4, head down 0…1, mode (0 walk, 1 hop), flags (pattern 0…3
// + 4 for no horns); iC the coat (linear rgb) and a seed. Birds: iA flap 0…1, mode (0 flying, 1 standing,
// 2 swimming), span, neck; iC plumage and the bill's colour code; iR roll, leg length.

import * as THREE from 'three/webgpu';
import {
  Fn, attribute, positionGeometry, normalGeometry, vec3, float, sin, cos, abs, floor, clamp, smoothstep, select, max, mix, normalize, cross, varying, time,
} from 'three/tsl';
import { noiseT, worleyT } from '../engine/env.js';
import { beastModel, birdModel, VSTRIDE, BSTRIDE } from './wild-models.js';

const CAP = 96, BIRD_CAP = 96, ISTRIDE = 16, BISTRIDE = 20;

const eq = (x, k) => abs(x.sub(k)).lessThan(0.5);
const rotX = (v, py, pz, a) => {
  const dy = v.y.sub(py), dz = v.z.sub(pz), c = cos(a), s = sin(a);
  return vec3(v.x, dy.mul(c).sub(dz.mul(s)).add(py), dy.mul(s).add(dz.mul(c)).add(pz));
};
/** Instance place: P + s (x right + y up + z back) in the planet's coordinates. */
const place = (q, P, F) => {
  const up = normalize(P.xyz), fwd = F.xyz, right = cross(fwd, up);
  return P.xyz.add(right.mul(q.x).add(up.mul(q.y)).sub(fwd.mul(q.z)).mul(P.w));
};

// ── beasts ───────────────────────────────────────────────────────────────────
function beastPosition() {
  return Fn(() => {
    const p0 = positionGeometry, pg = attribute('wGraze', 'vec3'), M = attribute('wMeta', 'vec3'), V = attribute('wPivot', 'vec2');
    const P = attribute('iP', 'vec4'), F = attribute('iF', 'vec4'), A = attribute('iA', 'vec4'), C = attribute('iC', 'vec4');
    const ph = F.w, amp = A.x, head = A.y, hop = A.z.greaterThan(0.5);
    const isHead = abs(M.y.sub(1)).lessThan(0.5), isLeg = abs(M.y.sub(2)).lessThan(0.5);
    const q = vec3(mix(p0, pg, head)).toVar();
    // the head: a nod with each step and a slow look about
    const nod = sin(ph.mul(2)).mul(0.07).mul(amp).add(sin(time.mul(0.9).add(C.w.mul(40))).mul(0.025).mul(float(1).sub(head)));
    q.assign(select(isHead, rotX(q, V.x, V.y, nod), q));
    // the legs, each pair in turn (the left fore with the right hind)
    const diag = select(p0.x.mul(p0.z).greaterThan(0), float(0), float(3.14159));
    const swing = sin(ph.add(diag)).mul(amp).mul(0.5).mul(M.z).mul(select(hop, float(0), float(1)));
    q.assign(select(isLeg, rotX(q, V.x, V.y, swing), q));
    q.y.addAssign(select(isLeg, max(cos(ph.add(diag)), 0).mul(amp).mul(0.045).mul(M.z).mul(select(hop, float(0), float(1))), float(0)));
    // the body: a little rise and fall at a walk; a hop's arc, the body pitched
    q.y.addAssign(select(hop, max(sin(ph), 0).mul(amp).mul(0.9), abs(sin(ph)).mul(amp).mul(0.018)));
    return place(q, P, F);
  })();
}

const coatColour = () => {
  const M = attribute('wMeta', 'vec3'), A = attribute('iA', 'vec4'), C = attribute('iC', 'vec4');
  const rest = varying(positionGeometry, 'vWildRest');
  const role = M.x, coat = C.xyz;
  const pat = floor0(A.w);                                    // 0 none, 1 stripes, 2 patches, 3 spots
  let col = select(role.lessThan(0.5), coat, select(role.lessThan(1.5), coat.mul(0.3).add(0.012), select(role.lessThan(2.5), vec3(0.34, 0.29, 0.22), select(role.lessThan(3.5), mix(coat, vec3(0.78, 0.74, 0.64), 0.65), select(role.lessThan(4.5), vec3(0.42, 0.06, 0.04), select(role.lessThan(5.5), vec3(0.4, 0.28, 0.15), vec3(0.1, 0.055, 0.03)))))));
  // the belly and the underside paler
  col = mix(col, mix(coat, vec3(0.8, 0.76, 0.66), 0.55), smoothstep(-0.15, -0.75, normalGeometry.y).mul(select(role.lessThan(0.5), float(0.7), float(0))));
  // zebra: bands on the body, rings on the legs
  const bands = select(rest.y.lessThan(0.75), sin(rest.y.mul(26)), sin(rest.z.mul(12).add(rest.y.mul(2.4)).add(sin(rest.y.mul(5)).mul(0.5))));
  const stripe = smoothstep(0.0, 0.3, bands).mul(select(eq(pat, 1), float(1), float(0)));
  col = mix(col, vec3(0.03, 0.028, 0.026), stripe.mul(select(role.lessThan(0.5), float(1), float(0.6))));
  // giraffe: dark patches divided by pale lines
  const cell = worleyT(rest.mul(2.6));
  const patch = smoothstep(0.52, 0.4, cell).mul(select(eq(pat, 2), float(1), float(0)));
  col = mix(col, coat.mul(0.45), patch);
  // chital: pale spots
  const spots = smoothstep(0.27, 0.2, worleyT(rest.mul(11))).mul(select(eq(pat, 3), float(1), float(0)));
  col = mix(col, vec3(0.8, 0.74, 0.62), spots.mul(select(role.lessThan(0.5), float(0.8), float(0))));
  return col.mul(noiseT(rest.mul(18)).mul(0.05).add(1));
};
// (A.w holds pattern + 4 × hornless: the pattern is its remainder)
const floor0 = (x) => x.sub(floor4(x).mul(4));
const floor4 = (x) => floor(x.div(4));

export class BeastSet {
  constructor(parent) {
    this.parent = parent;
    this.kinds = new Map();                                  // model id → { mesh, ibuf, matrix, n, ready }
    this.precompile = null;
  }
  kind(id) {
    let k = this.kinds.get(id);
    if (k) return k;
    const m = beastModel(id), v = m.data, n = m.n;
    const vb = new THREE.InterleavedBuffer(v, VSTRIDE);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.InterleavedBufferAttribute(vb, 3, 0));
    g.setAttribute('normal', new THREE.InterleavedBufferAttribute(vb, 3, 3));
    g.setAttribute('wGraze', new THREE.InterleavedBufferAttribute(vb, 3, 6));
    g.setAttribute('wMeta', new THREE.InterleavedBufferAttribute(vb, 3, 9));
    g.setAttribute('wPivot', new THREE.InterleavedBufferAttribute(vb, 2, 12));
    const ibuf = new THREE.InstancedInterleavedBuffer(new Float32Array(CAP * ISTRIDE), ISTRIDE, 1);
    for (const [name, off] of [['iP', 0], ['iF', 4], ['iA', 8], ['iC', 12]]) g.setAttribute(name, new THREE.InterleavedBufferAttribute(ibuf, 4, off));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    const mat = new THREE.MeshStandardNodeMaterial();
    mat.name = `wild:${id}`;
    mat.roughness = 0.92; mat.metalness = 0;
    mat.positionNode = beastPosition();
    mat.colorNode = coatColour();
    const matrix = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 16), 16);
    const mesh = new THREE.InstancedMesh(g, mat, CAP);
    mesh.instanceMatrix = matrix;
    mesh.count = 0; mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = true;
    mesh.visible = false; mesh.name = `wild:${id}`;
    this.parent.add(mesh);
    k = { id, mesh, ibuf, matrix, n: 0, ready: !this.precompile, height: m.height };
    if (this.precompile) this.precompile([mesh]).then(() => { k.ready = true; }).catch(() => { k.ready = true; });
    this.kinds.set(id, k);
    return k;
  }
  /** Start a frame: every kind empty. */
  begin() { for (const k of this.kinds.values()) k.n = 0; }
  /**
   * Add an instance of model id: place p (planet xyz), heading f (a tangent unit vector), scale s,
   * phase, amplitude, head down, mode (1 hop), flags, coat (rgb), seed.
   */
  put(id, p, f, s, ph, amp, head, mode, flags, r, g, b, seed) {
    const k = this.kind(id);
    if (k.n >= CAP) return false;
    f = tangent(p, f);
    const A = k.ibuf.array, o = k.n * ISTRIDE;
    A[o] = p[0]; A[o + 1] = p[1]; A[o + 2] = p[2]; A[o + 3] = s;
    A[o + 4] = f[0]; A[o + 5] = f[1]; A[o + 6] = f[2]; A[o + 7] = ph;
    A[o + 8] = amp; A[o + 9] = head; A[o + 10] = mode; A[o + 11] = flags;
    A[o + 12] = r; A[o + 13] = g; A[o + 14] = b; A[o + 15] = seed;
    writeMatrix(k.matrix.array, k.n * 16, p, f, s);
    k.n++;
    return true;
  }
  /** End the frame: the counts set, the buffers sent. */
  end() {
    for (const k of this.kinds.values()) {
      k.mesh.count = k.n;
      k.mesh.visible = k.ready && k.n > 0;
      if (k.n) { k.ibuf.needsUpdate = true; k.matrix.needsUpdate = true; }
    }
  }
  clear() { for (const k of this.kinds.values()) { k.n = 0; k.mesh.count = 0; k.mesh.visible = false; } }
}

const _t = [0, 0, 0];
/** The heading f made tangent to the ground at p (into a scratch vector). */
function tangent(p, f) {
  const l = Math.hypot(p[0], p[1], p[2]) || 1, ux = p[0] / l, uy = p[1] / l, uz = p[2] / l, d = f[0] * ux + f[1] * uy + f[2] * uz;
  const x = f[0] - ux * d, y = f[1] - uy * d, z = f[2] - uz * d, m = Math.hypot(x, y, z) || 1;
  _t[0] = x / m; _t[1] = y / m; _t[2] = z / m;
  return _t;
}

/** The matrix of an instance (for the normals): its right, up and back columns scaled, at p. */
function writeMatrix(e, m, p, f, s) {
  const l = Math.hypot(p[0], p[1], p[2]) || 1, ux = p[0] / l, uy = p[1] / l, uz = p[2] / l;
  const rx = f[1] * uz - f[2] * uy, ry = f[2] * ux - f[0] * uz, rz = f[0] * uy - f[1] * ux;
  e[m] = rx * s; e[m + 1] = ry * s; e[m + 2] = rz * s; e[m + 3] = 0;
  e[m + 4] = ux * s; e[m + 5] = uy * s; e[m + 6] = uz * s; e[m + 7] = 0;
  e[m + 8] = -f[0] * s; e[m + 9] = -f[1] * s; e[m + 10] = -f[2] * s; e[m + 11] = 0;
  e[m + 12] = p[0]; e[m + 13] = p[1]; e[m + 14] = p[2]; e[m + 15] = 1;
}

// ── birds ────────────────────────────────────────────────────────────────────
function birdPosition() {
  return Fn(() => {
    const p0 = positionGeometry, M = attribute('bMeta', 'vec2');
    const P = attribute('iP', 'vec4'), F = attribute('iF', 'vec4'), A = attribute('iA', 'vec4'), Rr = attribute('iR', 'vec4');
    const ph = F.w, flap = A.x, mode = A.y, span = A.z, neck = A.w;
    const part = M.x, is = (k) => abs(part.sub(k)).lessThan(0.5);
    const q = vec3(p0).toVar();
    const folded = clamp(mode, 0, 1);
    // the wings: beating (the tip more than the root), or folded against the body
    const s = M.y;
    const ang = sin(ph).mul(0.75).mul(flap).mul(s).add(float(0.12).mul(s));
    const wingX = p0.x.mul(span).mul(cos(ang)).mul(mix(float(1), float(0.16), folded));
    const wingY = p0.y.add(abs(p0.x).mul(span).mul(sin(ang)).mul(float(1).sub(folded))).sub(folded.mul(s).mul(0.02));
    const wingZ = p0.z.add(folded.mul(s).mul(0.14).mul(abs(p0.x)));
    q.assign(select(is(1), vec3(wingX, wingY, wingZ), q));
    // the neck and head at their own length
    const pv = vec3(0, 0.02, -0.15);
    q.assign(select(is(2), vec3(q.x, pv.y.add(q.y.sub(pv.y).mul(neck)), pv.z.add(q.z.sub(pv.z).mul(neck))), q));
    q.assign(select(is(3), q.add(vec3(0, 0.08, -0.15).mul(neck.sub(1))), q));
    // the legs: their length, trailing back in flight
    const legL = Rr.y;
    q.assign(select(is(5), vec3(q.x, float(-0.06).add(q.y.add(0.06).mul(legL)), q.z.add(float(1).sub(folded).mul(0.12).mul(q.y.add(0.06).negate()).mul(legL))), q));
    // a lift with each beat; the roll into a turn
    q.y.addAssign(sin(ph.add(1.2)).mul(0.012).mul(flap));
    const cr = cos(Rr.x), sr = sin(Rr.x);
    q.assign(vec3(q.x.mul(cr).sub(q.y.mul(sr)), q.x.mul(sr).add(q.y.mul(cr)), q.z));
    return place(q, P, F);
  })();
}

const birdColour = () => {
  const M = attribute('bMeta', 'vec2'), C = attribute('iC', 'vec4');
  const part = M.x, code = C.w;
  const bill = select(code.lessThan(0.5), vec3(0.06, 0.055, 0.05), select(code.lessThan(1.5), vec3(0.72, 0.52, 0.08), select(code.lessThan(2.5), vec3(0.62, 0.16, 0.07), vec3(0.5, 0.5, 0.46))));
  let col = C.xyz;
  col = mix(col, vec3(0.9, 0.88, 0.82), smoothstep(-0.2, -0.8, normalGeometry.y).mul(0.45));
  // the wing tips darker
  col = mix(col, col.mul(0.4), smoothstep(0.7, 0.95, M.y).mul(select(eq(part, 1), float(1), float(0))));
  col = select(eq(part, 3), bill, select(eq(part, 5), bill.mul(0.7), col));
  return col;
};

export class BirdSet {
  constructor(parent) {
    const m = birdModel(), vb = new THREE.InterleavedBuffer(m.data, BSTRIDE);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.InterleavedBufferAttribute(vb, 3, 0));
    g.setAttribute('normal', new THREE.InterleavedBufferAttribute(vb, 3, 3));
    g.setAttribute('bMeta', new THREE.InterleavedBufferAttribute(vb, 2, 6));
    this.ibuf = new THREE.InstancedInterleavedBuffer(new Float32Array(BIRD_CAP * BISTRIDE), BISTRIDE, 1);
    for (const [name, off] of [['iP', 0], ['iF', 4], ['iA', 8], ['iC', 12], ['iR', 16]]) g.setAttribute(name, new THREE.InterleavedBufferAttribute(this.ibuf, 4, off));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    const mat = new THREE.MeshStandardNodeMaterial({ side: THREE.DoubleSide });
    mat.name = 'wild:birds';
    mat.roughness = 0.85; mat.metalness = 0;
    mat.positionNode = birdPosition();
    mat.colorNode = birdColour();
    this.matrix = new THREE.InstancedBufferAttribute(new Float32Array(BIRD_CAP * 16), 16);
    const mesh = this.mesh = new THREE.InstancedMesh(g, mat, BIRD_CAP);
    mesh.instanceMatrix = this.matrix;
    mesh.count = 0; mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = false; mesh.visible = false; mesh.name = 'wild:birds';
    parent.add(mesh);
    this.n = 0; this.ready = true;
    this.cap = BIRD_CAP;
  }
  begin() { this.n = 0; }
  /** A bird: place p, heading f, scale s, phase, flap, mode, span, neck, plumage rgb, bill code, roll, leg length. */
  put(p, f, s, ph, flap, mode, span, neck, r, g, b, bill, roll, legs) {
    if (this.n >= this.cap) return false;
    f = tangent(p, f);
    const A = this.ibuf.array, o = this.n * BISTRIDE;
    A[o] = p[0]; A[o + 1] = p[1]; A[o + 2] = p[2]; A[o + 3] = s;
    A[o + 4] = f[0]; A[o + 5] = f[1]; A[o + 6] = f[2]; A[o + 7] = ph;
    A[o + 8] = flap; A[o + 9] = mode; A[o + 10] = span; A[o + 11] = neck;
    A[o + 12] = r; A[o + 13] = g; A[o + 14] = b; A[o + 15] = bill;
    A[o + 16] = roll; A[o + 17] = legs;
    writeMatrix(this.matrix.array, this.n * 16, p, f, s);
    this.n++;
    return true;
  }
  end() {
    this.mesh.count = this.n;
    this.mesh.visible = this.ready && this.n > 0;
    if (this.n) { this.ibuf.needsUpdate = true; this.matrix.needsUpdate = true; }
  }
}
