// Smoke, steam and mist: soft sprites that rise from fixed emitters and fade, moved entirely on the
// GPU from the time and a seed per sprite (as rain.js does), in ONE draw call for all emitters of a
// settlement. Generic: a settlement gives its emitters (a point, a kind) and says how strongly each
// kind burns at the moment (setLevels); this module knows nothing of Suzhou.
//
// Kinds (KINDS): 'kitchen' wood smoke from a roof vent (thin, drifting with the wind, widening and
// fading as it rises), 'incense' thin curling threads from a censer, 'steam' short white puffs from
// a pot or a tea urn, 'mist' large, low, slow banks over water.
// Each emitter is on or off by its own threshold against the kind's level (a scattered fraction burns
// at a time; for kitchens the fraction is shuffled at each meal, `meal`), and fades in and out as
// the level rises and falls.
//
// Drawing: alpha-blended, depth-tested, no depth write; thin plumes of small sprites, so overdraw
// stays small; sprites farther than FAR m, or of an emitter that is off, collapse to nothing in the
// vertex stage. Colour: the sun's light and the haze's, as the snow flakes (rain.js) are lit.
// The wind is the climate's (ENV.wind); sun and wind are in the frame of the scene, which near a
// settlement is the settlement's own.

import * as THREE from 'three/webgpu';
import { attribute, uniform, vec2, vec3, vec4, float, fract, time, normalize, cross, dot, mix, sin, cos, atan, length, smoothstep, clamp, pow, varying } from 'three/tsl';
import { ENV } from './env.js';

export const FAR = 220;                       // m: no sprite is drawn beyond this
const ORDER = ['kitchen', 'incense', 'steam', 'mist'];
/**
 * Per kind: n sprites an emitter, life (s), rise (m/s), size at birth and at death (m), strength
 * (peak opacity), wind (how much of the wind it takes up), curl (sideways wander, m), near (m: faded
 * out when nearer the eye than this, so no sprite fills the view), colour.
 */
export const KINDS = {
  kitchen: { n: 6, life: 10, rise: 0.85, s0: 0.22, s1: 1.25, strength: 0.18, wind: 0.55, curl: 0.5, near: 2.0, color: [0.64, 0.65, 0.68] },
  incense: { n: 30, life: 9, rise: 0.36, s0: 0.05, s1: 0.28, strength: 0.3, wind: 0.2, curl: 0.22, near: 0.7, color: [0.86, 0.88, 0.92] },
  steam: { n: 7, life: 3.2, rise: 0.55, s0: 0.1, s1: 0.62, strength: 0.2, wind: 0.35, curl: 0.12, near: 0.8, color: [0.97, 0.97, 0.98] },
  mist: { n: 2, life: 36, rise: 0.015, s0: 4.5, s1: 6.0, strength: 0.07, wind: 0.2, curl: 3.0, near: 12, color: [0.9, 0.93, 0.97] },
};

/** The local solar hour (0…24) from the sun's direction in the scene (x east, z south): 12 when due south. */
export function solarHour(sun = ENV.sunDir.value) {
  const h = 12 - Math.atan2(sun.x, sun.z) * (12 / Math.PI);
  return h < 0 ? h + 24 : h >= 24 ? h - 24 : h;
}
/** A smooth bump of height a at hour c, half-width w (hours). */
export const bump = (h, c, w, a = 1) => a * Math.exp(-((h - c) / w) * ((h - c) / w));

const _v = new THREE.Vector3();

export class Smoke {
  /**
   * emitters: [{ p: [x, y, z] (where it leaves, in the group's frame), kind, thr (0…1: it burns when the
   * kind's level exceeds it; default random), seed }]. Add .mesh to a group.
   */
  constructor(emitters, { name = 'smoke' } = {}) {
    let N = 0;
    for (const e of emitters) N += KINDS[e.kind].n;
    const pos = new Float32Array(N * 12), seed = new Float32Array(N * 12), corner = new Float32Array(N * 8);
    const prm = new Float32Array(N * 16), prm2 = new Float32Array(N * 16), kind = new Float32Array(N * 16), index = new Uint32Array(N * 6);
    let i = 0;
    for (const e of emitters) {
      const K = KINDS[e.kind], ki = ORDER.indexOf(e.kind);
      let s = ((e.seed ?? 1) * 2654435761) >>> 0 || 1;
      const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
      const thr = e.thr ?? rnd(), eseed = rnd();
      for (let n = 0; n < K.n; n++, i++) {
        // sprites spread evenly through the life (a stratified phase), so the plume is even
        const sd = [(n + rnd() * 0.8) / K.n, rnd(), rnd()];
        for (let k = 0; k < 4; k++) {
          const v = i * 4 + k;
          pos.set(e.p, v * 3); seed.set(sd, v * 3);
          corner.set([k & 1 ? 1 : -1, k & 2 ? 1 : -1], v * 2);
          prm.set([K.life, K.rise, K.s0, K.s1], v * 4);
          prm2.set([K.strength, thr, K.wind, K.curl * (0.6 + eseed * 0.8)], v * 4);
          kind[v * 4 + ki] = 1;
        }
        const b = i * 4;
        index.set([b, b + 1, b + 3, b, b + 3, b + 2], i * 6);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 3));
    g.setAttribute('corner', new THREE.BufferAttribute(corner, 2));
    g.setAttribute('prm', new THREE.BufferAttribute(prm, 4));
    g.setAttribute('prm2', new THREE.BufferAttribute(prm2, 4));
    g.setAttribute('kind', new THREE.BufferAttribute(kind, 4));
    g.setIndex(new THREE.BufferAttribute(index, 1));
    this.count = N;

    // uniforms: the level of each kind now, which meal it is, the eye in the group's frame
    this.levels = uniform(new THREE.Vector4(0, 0, 0, 0));
    this.meal = uniform(0);
    this.eye = uniform(new THREE.Vector3());
    this._lv = this.levels.value;

    const base = attribute('position', 'vec3'), sd = attribute('seed', 'vec3'), cr = attribute('corner', 'vec2');
    const P = attribute('prm', 'vec4'), Q = attribute('prm2', 'vec4'), kd = attribute('kind', 'vec4');
    const life = P.x, rise = P.y, wind = Q.z, curl = Q.w;
    // age: a 0…1 through the life, seconds
    const a = fract(time.div(life).add(sd.x)), age = a.mul(life);
    // up with a slowing rise; the wind's drift grows with the age (a plume bent over, not a pole); a lazy wander
    const h = rise.mul(age).mul(float(1).sub(a.mul(0.35)));
    const wv = vec3(ENV.wind.x, 0, ENV.wind.y).mul(wind.mul(age).mul(0.5));
    const ph = age.mul(0.8).add(sd.y.mul(40));
    const wob = vec3(sin(ph), 0, cos(ph.mul(0.83).add(1.3))).mul(curl.mul(a.mul(0.8).add(0.2)));
    const c = base.add(vec3(0, h, 0)).add(wv).add(wob);
    // how much of the emitter shows: its level against its threshold (kitchens: shuffled at each meal)
    const level = dot(this.levels, kd);
    const thr = fract(Q.y.add(this.meal.mul(0.381966).mul(kd.x)));
    const act = clamp(level.sub(thr).mul(5), 0, 1);
    // the sprite: fades in at birth, out toward the end; away with distance, and near the eye
    const env = smoothstep(0, 0.12, a).mul(pow(float(1).sub(smoothstep(0.25, 1, a)), 1.2));
    const d = length(c.sub(this.eye));
    const nearEnd = dot(kd, vec4(2.0, 0.7, 0.8, 12.0)), nearStart = nearEnd.mul(0.4);
    const vis = smoothstep(nearStart, nearEnd, d).mul(float(1).sub(smoothstep(FAR * 0.8, FAR, d)));
    const alpha = varying(Q.x.mul(act).mul(env).mul(vis));
    const size = mix(P.z, P.w, pow(a, 0.7)).mul(sd.z.mul(0.5).add(0.75)).mul(act.mul(vis).greaterThan(0.002).select(1, 0));
    // a square turned to the eye
    const toEye = normalize(this.eye.sub(c).add(vec3(0, 0.0001, 0)));
    const right = normalize(cross(vec3(0, 1, 0), toEye).add(vec3(0.0001, 0, 0)));
    const up = cross(toEye, right);

    const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, depthTest: true, side: THREE.DoubleSide });
    m.positionNode = c.add(right.mul(cr.x.mul(size))).add(up.mul(cr.y.mul(size)));
    const lit = ENV.sunColor.mul(0.5).add(ENV.fogColor.mul(0.6));
    const col = kd.x.mul(vec3(...KINDS.kitchen.color)).add(kd.y.mul(vec3(...KINDS.incense.color))).add(kd.z.mul(vec3(...KINDS.steam.color))).add(kd.w.mul(vec3(...KINDS.mist.color)));
    m.colorNode = col.mul(lit);
    // soft and a little ragged: the edge wavers round the sprite
    const r = length(cr), ang = atan(cr.y, cr.x);
    const rag = float(1).add(sin(ang.mul(3).add(sd.y.mul(37)).add(time.mul(0.3))).mul(0.18));
    const soft = float(1).sub(smoothstep(0.05, 1, r.mul(rag)));
    m.opacityNode = alpha.mul(soft.mul(soft));
    m.fog = false;
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.name = name;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 9;
    this.mesh.visible = false;
  }

  /** How strongly each kind burns now (0…1) and the meal's number (any number: it shuffles which kitchens burn). */
  setLevels(kitchen, incense, steam, mist, meal) {
    this._lv.set(kitchen, incense, steam, mist); this.meal.value = meal;
  }
  /** The eye (a world position) in the mesh's group;  */
  setEye(camera, group) {
    _v.copy(camera.position); group.worldToLocal(_v);
    this.eye.value.copy(_v);
  }
  dispose() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.mesh.removeFromParent(); }
}
