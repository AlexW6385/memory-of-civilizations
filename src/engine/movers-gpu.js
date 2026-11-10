// The movers' meshes (src/engine/movers.js): a set of movers is one instanced mesh per material
// group, holding the union of its variants' pieces (movers-kit.js SetBuilder); this vertex shader
// keeps the instance's variant, moves its limbs and places it, and these materials colour it.
//
// Per vertex: position (in the mover's own frame), normal, mvM (the variants it belongs to, 12 bits
// a float in x, y, z; w: colour slot · 16 + limb class), mvC (fixed colour factor).
// Per instance: iW (walk phase, amplitude 0…1, variant + 64 · mode (0 walking, 1 sculling), arm swing
// + 4 · bounce of a load), iP (place x, y, z in the settlement's frame, roll), iT (yaw, scale x, y, z),
// iC (the colour factors of the slots, packed: garment, second garment, skin, hat or umbrella), and the
// instance matrix, which three uses for the normals (the limbs' small turns are left out of them).
// The motion is in the shader; the page writes a few dozen instances a frame, allocating nothing.
//
// The materials are the movers' own (MeshStandardNodeMaterial) and keep their patterns in each
// mover's own frame (weave, grain), so that the cloth and the planks do not swim as the movers go;
// their colours are those of src/core/palette.js (movers-kit.js GROUP_BASE).

import * as THREE from 'three/webgpu';
import {
  Fn, attribute, positionGeometry, vec3, float, sin, cos, abs, clamp, smoothstep, select, max, floor, fract, exp2, varying,
  mx_noise_float, uniform, time, mix, length, positionView,
} from 'three/tsl';
import { MATERIALS } from '../core/palette.js';
import { material as paletteMaterial } from './materials.js';
import { ENV } from './env.js';
import { GROUP_BASE, LIMB } from './movers-kit.js';

/** Instance attributes: name → [offset, item size] in one interleaved instance buffer (WebGPU allows 8 vertex buffers). */
// (and few: three's instance matrix and its last frame's, for the motion vectors, take eight of the
// sixteen attribute locations; the colours are packed, 8 bits a channel, a colour to a float)
export const INSTANCE_ATTRS = { iW: [0, 4], iP: [4, 4], iT: [8, 4], iC: [12, 4] };
const ISTRIDE = 16;
/** The vertex attributes in one interleaved buffer: name → [offset, item size]. */
const VERTEX_ATTRS = { position: [0, 3], normal: [3, 3], mvM: [6, 4], mvC: [10, 1] };
const VSTRIDE = 11;
/** A colour factor (0…2 a channel) packed into one float (exact: 24 bits). */
export const packColour = (r, g, b) => Math.round(Math.min(1, Math.max(0, r / 2)) * 255) * 65536 + Math.round(Math.min(1, Math.max(0, g / 2)) * 255) * 256 + Math.round(Math.min(1, Math.max(0, b / 2)) * 255);
const unpack = (f) => { const r = floor(f.div(65536)), g = floor(f.sub(r.mul(65536)).div(256)), b = f.sub(r.mul(65536)).sub(g.mul(256)); return vec3(r, g, b).mul(2 / 255); };

/** A turn about the x axis through (py, pz) by a: the vertex v. */
const rotX = (v, py, pz, a) => {
  const dy = v.y.sub(py), dz = v.z.sub(pz), c = cos(a), s = sin(a);
  return vec3(v.x, dy.mul(c).sub(dz.mul(s)).add(py), dy.mul(s).add(dz.mul(c)).add(pz));
};

/** The vertex in the settlement's frame: its variant kept or collapsed, its limbs moved, placed. */
const moverPosition = () => Fn(() => {
  const p = positionGeometry;
  const W = attribute('iW', 'vec4'), P = attribute('iP', 'vec4'), T = attribute('iT', 'vec4'), Mk = attribute('mvM', 'vec4');
  const mode = floor(W.z.div(64)), vid = W.z.sub(mode.mul(64)), bounce = floor(W.w.div(4)), swing = W.w.sub(bounce.mul(4));
  const X = { x: swing, y: float(1).sub(mode), z: bounce };              // (the sculler's legs stand)
  const limb = Mk.w.sub(floor(Mk.w.div(16)).mul(16));
  const ph = W.x, amp = W.y, scull = mode.greaterThan(0.5);
  const is = (k) => abs(limb.sub(k)).lessThan(0.5);
  const s = sin(ph), c = cos(ph);
  const q = vec3(p).toVar();
  // the arms: swung about the shoulders opposite to the legs (the left only where the right hand holds a pole or an
  // umbrella); the sculler's both pushed and drawn with the oar
  const sideX = select(p.x.lessThan(0), float(-1), float(1));
  const armOn = select(is(LIMB.arms).or(is(LIMB.scull)), float(1), select(is(LIMB.armL).and(p.x.lessThan(0)), float(1), float(0)));
  const wa = smoothstep(0.11, 0.19, abs(p.x)).mul(smoothstep(1.43, 1.25, p.y)).mul(armOn);
  const armA = select(is(LIMB.scull), sin(ph.add(0.35)).mul(0.22), s.mul(-0.3).mul(X.x).mul(sideX)).mul(amp).mul(wa);
  q.assign(rotX(q, 1.37, 0.0, armA));
  // the legs: about the hips, each by its side (a robe's skirt bent softly across, trousers sharply); the foot
  // that swings forward lifted
  const robe = is(LIMB.robe), legs = is(LIMB.legs), anyLeg = robe.or(legs);
  const legW = select(robe, smoothstep(0.93, 0.7, p.y), smoothstep(0.9, 0.72, p.y)).mul(select(anyLeg, float(1), float(0)));
  const sideK = clamp(p.x.mul(select(robe, float(9), float(40))), -1, 1);
  const legA = amp.mul(0.3).mul(X.y);
  q.assign(rotX(q, 0.88, 0.0, s.mul(legA).mul(sideK).mul(legW)));
  q.y.addAssign(amp.mul(X.y).mul(0.055).mul(max(sideK.mul(c), 0)).mul(smoothstep(0.45, 0.05, p.y)).mul(select(anyLeg, float(1), float(0))));
  // a load on a shoulder pole: the pole flexing, the baskets bouncing with it and swaying on their cords
  const bf = is(LIMB.basketF), bb = is(LIMB.basketB), basket = bf.or(bb);
  const flex = sin(ph.mul(2).add(0.5)).mul(0.028).mul(amp).mul(X.z);
  q.assign(select(basket, rotX(q, 1.34, select(bf, float(-0.88), float(0.88)), sin(ph.mul(2).sub(0.8)).mul(0.1).mul(amp).mul(X.z)), q));
  q.y.addAssign(select(basket, flex.mul(0.86), select(is(LIMB.pole), flex.mul(p.z.mul(p.z).div(0.9)), float(0))));
  // the whole body: walking, the hips' rise and fall over each step and a little sway toward the foot that bears;
  // sculling, the lean forward and back from the ankles
  const bob = float(1).sub(cos(legA.mul(s))).mul(-0.88);
  const walkQ = vec3(q.x.sub(c.mul(0.018).mul(amp)), q.y.add(bob), q.z);
  const lean = sin(ph).mul(-0.12).mul(amp).mul(smoothstep(0.05, 0.3, p.y));
  q.assign(select(scull, rotX(q, 0.08, 0.0, lean), walkQ));
  // placed: scaled, rolled (a boat), turned, moved
  const v = q.mul(T.yzw);
  const cr = cos(P.w), sr = sin(P.w);
  const rx = v.x.mul(cr).sub(v.y.mul(sr)), ry = v.x.mul(sr).add(v.y.mul(cr));
  const cy = cos(T.x), sy = sin(T.x);
  const out = vec3(rx.mul(cy).add(v.z.mul(sy)), ry, v.z.mul(cy).sub(rx.mul(sy))).add(P.xyz);
  // the variant's bit: component floor(id / 12), bit id mod 12 (movers-kit.js; the margins hold in float32)
  const comp = floor(vid.div(12)), bit = vid.sub(comp.mul(12)), inv = exp2(bit.negate());
  const m = select(comp.lessThan(0.5), Mk.x, select(comp.lessThan(1.5), Mk.y, Mk.z));
  const shown = fract(m.mul(inv).mul(0.5).add(inv.mul(0.25))).greaterThanEqual(0.5);
  return select(shown, out, vec3(0, -300, 0));
})();

/** The colour of the vertex's slot (the instance's, or none) times its fixed colour. */
const slotColour = () => Fn(() => {
  const M = attribute('mvM', 'vec4'), C = unpack(attribute('mvC', 'float')), I = attribute('iC', 'vec4'), slot = floor(M.w.div(16));
  const f = select(slot.lessThan(0.5), I.x, select(slot.lessThan(1.5), I.y, select(slot.lessThan(2.5), I.z, I.w)));
  return select(slot.lessThan(3.5), unpack(f), vec3(1, 1, 1)).mul(C);
})();

const MATS = new Map();
/** The material of a group (one each, shared by the sets and the settlements). */
export function moverMaterial(group) {
  if (MATS.has(group)) return MATS.get(group);
  const key = GROUP_BASE[group], spec = MATERIALS[key];
  const m = new THREE.MeshStandardNodeMaterial();
  m.name = `movers:${group}`;
  m.roughness = spec.roughness ?? 0.85; m.metalness = 0;
  // (the palette material's reflections of the baked light, where the renderer gives them)
  const pal = paletteMaterial(key);
  if (Object.prototype.hasOwnProperty.call(pal, 'setupLightMap')) m.setupLightMap = pal.setupLightMap;
  m.positionNode = moverPosition();
  const rest = varying(positionGeometry, 'vMoverRest'), tint = varying(slotColour(), 'vMoverTint');
  const base = uniform(new THREE.Color(spec.color));
  let pat;
  if (group === 'skin') pat = mx_noise_float(rest.mul(22)).mul(0.04).add(1);
  else if (group === 'cloth') {
    // a fine weave and the slow unevenness of hand-dyed cloth; a little darker in the folds low down
    pat = mx_noise_float(rest.mul(5)).mul(0.07).add(mx_noise_float(rest.mul(70)).mul(0.035)).add(1);
  } else if (group === 'fibre') {
    // plaited strips: two sets crossing, over and under in a checker
    const a = rest.x.add(rest.z).mul(38), b = rest.y.mul(38).add(rest.x.sub(rest.z).mul(12));
    const over = sin(a).mul(sin(b)).greaterThan(0);
    const strip = select(over, abs(sin(b.mul(2))), abs(sin(a.mul(2))));
    pat = strip.mul(0.22).add(0.84).mul(mx_noise_float(rest.mul(4)).mul(0.1).add(1));
  } else {
    // the grain running along the planks and the oar (the mover's z), rings and streaks
    const streak = mx_noise_float(vec3(rest.x.mul(34), rest.y.mul(34), rest.z.mul(0.9)));
    const fine = mx_noise_float(vec3(rest.x.mul(120), rest.y.mul(120), rest.z.mul(3)));
    pat = streak.mul(0.12).add(fine.mul(0.05)).add(0.97).mul(mx_noise_float(rest.mul(1.7)).mul(0.08).add(1));
  }
  m.colorNode = base.mul(tint).mul(pat);
  MATS.set(group, m);
  return m;
}

let WAKE = null;
/**
 * The wake's material: the ripples a boat pushes from its bow and leaves behind it, drawn over the
 * water in a quad round the boat (its frame: bow toward −z at z −3.5, the hull's half-beam 1).
 * Instance attributes iP (place, —), iT (yaw, scale x, y, z), iW (strength, phase, —, —).
 */
export function wakeMaterial() {
  if (WAKE) return WAKE;
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  m.name = 'movers:wake';
  const P = attribute('iP', 'vec4'), T = attribute('iT', 'vec4'), W = attribute('iW', 'vec4');
  m.positionNode = Fn(() => {
    const p = positionGeometry, v = p.mul(T.yzw), cy = cos(T.x), sy = sin(T.x);
    return vec3(v.x.mul(cy).add(v.z.mul(sy)), v.y, v.z.mul(cy).sub(v.x.mul(sy))).add(P.xyz);
  })();
  const loc = varying(positionGeometry, 'vWake'), str = varying(W.x, 'vWakeStr');
  const x = abs(loc.x), z = loc.z.add(3.5);                    // z: metres behind the bow
  // the bow wave's two arms spreading at the Kelvin angle (tan 19.5° ≈ 0.35) from the hull's sides
  const arm = x.sub(z.max(0).mul(0.35)).sub(0.75);
  const ridges = sin(z.mul(3.4).sub(time.mul(2.6))).mul(0.5).add(0.5);
  const armA = smoothstep(0.35, 0.0, abs(arm)).mul(ridges.mul(0.6).add(0.4)).mul(smoothstep(12, 1, z)).mul(smoothstep(-0.6, 0.2, z));
  // the foam along the hull at the waterline, the stirred water behind the stern where the oar works
  const hull = smoothstep(0.3, 0.0, abs(x.sub(mix(0.55, 0.95, smoothstep(-0.2, 1.5, z).mul(smoothstep(7.4, 5.5, z)))))).mul(smoothstep(-0.3, 0.4, z)).mul(smoothstep(7.6, 6.0, z)).mul(0.35);
  const swirl = smoothstep(1.2, 0.0, length(vec3(x.mul(0.8), 0, z.sub(9.2)))).mul(mx_noise_float(vec3(loc.x.mul(3), time.mul(0.7), loc.z.mul(3))).mul(0.5).add(0.5)).mul(0.5);
  // (fading off with distance: the fine ripples would only shimmer far away)
  const far = smoothstep(70, 22, length(positionView));
  const a = max(max(armA.mul(0.38), hull), swirl).mul(str).mul(far);
  const day = float(1).sub(ENV.night.mul(0.8));
  m.colorNode = vec3(0.78, 0.82, 0.83).mul(day);
  m.opacityNode = a.mul(0.42);
  WAKE = m;
  return m;
}

const BIG = new THREE.Sphere(new THREE.Vector3(), 600), BIGBOX = new THREE.Box3(new THREE.Vector3(-600, -50, -600), new THREE.Vector3(600, 100, 600));

/**
 * A set of movers on the GPU: an instanced mesh per group, all on the same instance buffers.
 * data: { groups: { group: { position, normal, index, mvM, mvC } } } (movers-worker.js).
 */
export class MoverSet {
  constructor(name, data, max, { layer, cast }) {
    this.max = max; this.n = 0;
    this.group = new THREE.Group(); this.group.name = `movers:${name}`;
    this.ibuf = new THREE.InstancedInterleavedBuffer(new Float32Array(max * ISTRIDE), ISTRIDE, 1);
    this.ibuf.setUsage(THREE.DynamicDrawUsage);
    this.matrix = new THREE.InstancedBufferAttribute(new Float32Array(max * 16), 16); this.matrix.setUsage(THREE.DynamicDrawUsage);
    this.meshes = [];
    for (const [group, d] of Object.entries(data.groups)) {
      const n = d.position.length / 3, v = new Float32Array(n * VSTRIDE);
      for (const [k, [o, size]] of Object.entries(VERTEX_ATTRS)) {
        const src = d[k];
        if (k === 'mvC') for (let i = 0; i < n; i++) v[i * VSTRIDE + o] = packColour(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]);
        else for (let i = 0; i < n; i++) for (let c = 0; c < size; c++) v[i * VSTRIDE + o + c] = src[i * size + c];
      }
      const vb = new THREE.InterleavedBuffer(v, VSTRIDE);
      const g = new THREE.BufferGeometry();
      for (const [k, [o, size]] of Object.entries(VERTEX_ATTRS)) g.setAttribute(k, new THREE.InterleavedBufferAttribute(vb, size, o));
      g.setIndex(new THREE.BufferAttribute(d.index, 1));
      for (const [k, [o, size]] of Object.entries(INSTANCE_ATTRS)) g.setAttribute(k, new THREE.InterleavedBufferAttribute(this.ibuf, size, o));
      g.boundingSphere = BIG; g.boundingBox = BIGBOX;
      const mesh = new THREE.InstancedMesh(g, moverMaterial(group), max);
      mesh.instanceMatrix = this.matrix;
      mesh.count = 0; mesh.frustumCulled = false;
      mesh.castShadow = cast; mesh.receiveShadow = true;
      mesh.userData.dynamic = true;
      mesh.layers.set(layer);
      mesh.name = `movers:${name}:${group}`;
      this.group.add(mesh); this.meshes.push(mesh);
    }
  }
  /**
   * Write instance k from S: { x, y, z (place), yaw, roll, sx, sy, sz (scale), ph (phase), amp, v (variant),
   * mode, swing, legs, bounce } and its colours c (12 floats: the four slots).
   */
  put(k, S, c) {
    const x = S.x, y = S.y, z = S.z, yaw = S.yaw, roll = S.roll, sx = S.sx, sy = S.sy, sz = S.sz;
    const A = this.ibuf.array, o = k * ISTRIDE;
    A[o] = S.ph; A[o + 1] = S.amp; A[o + 2] = S.v + 64 * S.mode; A[o + 3] = Math.min(3.9, S.swing) + 4 * S.bounce;
    A[o + 4] = x; A[o + 5] = y; A[o + 6] = z; A[o + 7] = roll;
    A[o + 8] = yaw; A[o + 9] = sx; A[o + 10] = sy; A[o + 11] = sz;
    for (let i = 0; i < 4; i++) A[o + 12 + i] = packColour(c[i * 3], c[i * 3 + 1], c[i * 3 + 2]);
    // the matrix (for the normals): translate · turn about y · roll about z · scale
    const e = this.matrix.array, m = k * 16, cy = Math.cos(yaw), sy2 = Math.sin(yaw), cr = Math.cos(roll), sr = Math.sin(roll);
    e[m] = cy * cr * sx; e[m + 1] = sr * sx; e[m + 2] = -sy2 * cr * sx; e[m + 3] = 0;
    e[m + 4] = -cy * sr * sy; e[m + 5] = cr * sy; e[m + 6] = sy2 * sr * sy; e[m + 7] = 0;
    e[m + 8] = sy2 * sz; e[m + 9] = 0; e[m + 10] = cy * sz; e[m + 11] = 0;
    e[m + 12] = x; e[m + 13] = y; e[m + 14] = z; e[m + 15] = 1;
  }
  /** n instances written this frame: drawn. */
  commit(n) {
    this.n = n;
    for (const mesh of this.meshes) mesh.count = n;
    if (!n) return;
    // (whole buffers: a few kB; an update range would be an object a frame)
    this.ibuf.needsUpdate = true;
    this.matrix.needsUpdate = true;
  }
  dispose() { for (const m of this.meshes) m.geometry.dispose(); this.group.removeFromParent(); }
}

/** The wakes: an instanced quad per boat over the water. */
export class WakeSet {
  constructor(max) {
    this.max = max;
    const g = new THREE.BufferGeometry();
    // a quad round the boat and behind it (its frame: bow at z −3.5), lying flat
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-2.6, 0, -4.4, 2.6, 0, -4.4, 2.6, 0, 12, -2.6, 0, 12]), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
    g.setIndex([0, 2, 1, 0, 3, 2]);
    this.a = {};
    for (const [k, size] of [['iP', 4], ['iT', 4], ['iW', 4]]) { const at = new THREE.InstancedBufferAttribute(new Float32Array(max * size), size); at.setUsage(THREE.DynamicDrawUsage); this.a[k] = at; g.setAttribute(k, at); }
    this.al = Object.values(this.a);
    g.boundingSphere = BIG; g.boundingBox = BIGBOX;
    this.mesh = new THREE.InstancedMesh(g, wakeMaterial(), max);
    this.mesh.count = 0; this.mesh.frustumCulled = false; this.mesh.castShadow = false; this.mesh.receiveShadow = false;
    this.mesh.renderOrder = 2; this.mesh.name = 'movers:wakes';
  }
  /** Write wake k from S: { x, y, z, yaw, sx, sz, amp (its strength) }. */
  put(k, S) {
    const o = k * 4, a = this.a;
    a.iP.array[o] = S.x; a.iP.array[o + 1] = S.y; a.iP.array[o + 2] = S.z;
    a.iT.array[o] = S.yaw; a.iT.array[o + 1] = S.sx; a.iT.array[o + 2] = 1; a.iT.array[o + 3] = S.sz;
    a.iW.array[o] = S.amp;
  }
  commit(n) {
    this.mesh.count = n;
    if (!n) return;
    for (const at of this.al) at.needsUpdate = true;
  }
  dispose() { this.mesh.geometry.dispose(); this.mesh.removeFromParent(); }
}
