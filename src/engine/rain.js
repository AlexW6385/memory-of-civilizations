// Rain: thin streaks falling around the viewer, moved entirely on the GPU. Each streak has a
// fixed random seed; its position wraps inside a box that follows the camera, slanted by the
// wind. Faded out indoors (rooms that are not open to the sky) and when it is not raining.
// Snow and blowing dust (ENV.snow, ENV.dust: the set pieces of src/planet/setpieces.js) are a
// second such cloud of small round flakes: snow drifting down and swaying, dust motes driven
// along the wind near the ground. One draw each, drawn only while it falls. And the lightning's
// bolt in a thunderstorm (climate.js): one draw, only for the tenths of a second it shows.

import * as THREE from 'three/webgpu';
import { attribute, uniform, vec2, vec3, float, fract, time, cameraPosition, normalize, cross, mix, sin, length, smoothstep, max, exp } from 'three/tsl';
import { ENV } from './env.js';
import { PLANET_RADIUS } from '../planet/sites.js';

const N = 7000, BOX = [44, 22, 44], SPEED = 9, LEN = 0.55, WIDTH = 0.012;

export class Rain {
  constructor(scene) {
    const seed = new Float32Array(N * 4 * 3), corner = new Float32Array(N * 4 * 2), index = [];
    for (let i = 0; i < N; i++) {
      const s = [Math.random(), Math.random(), Math.random()];
      for (let k = 0; k < 4; k++) {
        seed.set(s, (i * 4 + k) * 3);
        corner.set([k & 1 ? 1 : -1, k & 2 ? 1 : 0], (i * 4 + k) * 2);
      }
      const b = i * 4;
      index.push(b, b + 1, b + 3, b, b + 3, b + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 4 * 3), 3));
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 3));
    g.setAttribute('corner', new THREE.BufferAttribute(corner, 2));
    g.setIndex(index);
    this.amount = uniform(0);
    const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
    const sd = attribute('seed', 'vec3'), cr = attribute('corner', 'vec2');
    const fall = vec3(ENV.wind.x.mul(0.6), float(-SPEED), ENV.wind.y.mul(0.6));
    const box = vec3(...BOX);
    // position of the drop inside a box that follows the camera
    const t = time;
    const rel = fract(sd.add(fall.mul(t).div(box)).sub(cameraPosition.div(box))).sub(0.5).mul(box);
    const base = cameraPosition.add(rel);
    // a thin quad along the direction of fall, turned toward the viewer
    const dir = normalize(fall);
    const side = normalize(cross(dir, normalize(base.sub(cameraPosition)))).mul(WIDTH);
    const p = base.add(side.mul(cr.x)).sub(dir.mul(cr.y.mul(LEN)));
    m.positionNode = p;
    // lit by the hour's light, as the snow is: rain at dusk and at night is dim, not white streaks on a dark scene
    m.colorNode = vec3(0.75, 0.78, 0.82).mul(max(ENV.sunColor.mul(0.35).add(ENV.fogColor.mul(0.6)), vec3(0.05)));
    m.opacityNode = this.amount.mul(0.2).mul(mix(float(0.15), float(1), cr.y));
    m.fog = false;
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    this.mesh.visible = false;
    scene.add(this.mesh);
    this.level = 0;
    this.flakes = new Flakes(scene);
    this.bolt = new Bolt(scene);
  }

  /** rain: 0…1 from the climate; outdoors: whether the viewer is under the open sky. */
  update(dt, rain, outdoors) {
    const target = outdoors ? rain : 0;
    this.level += (target - this.level) * Math.min(1, dt / 2.5);
    this.amount.value = this.level;
    this.mesh.visible = this.level > 0.01;
    this.flakes.update(dt, outdoors);
    this.bolt.update();
  }
}

// The bolt: VARIANTS forked channels built once (hashes, no Math.random), each a strip of quads in a
// flat frame (x across, y up, in units of its height) set upright at ENV.boltDist toward
// ENV.flashDir, facing the viewer; its width grows with the distance (a few pixels wide at any),
// a white core in a violet glow (added light), fading into the cloud at its top and into the haze.
const VARIANTS = 4, MAIN = 26, FORKS = 3, FORK = 9, QUADS = MAIN + FORKS * FORK, BOLT_H = 1300;
class Bolt {
  constructor(scene) {
    const pos = [], off = [], wt = [], index = [];
    let h = 0x9e3779b9;
    const rnd = () => { h = Math.imul(h ^ (h >>> 15), 2246822519); h = Math.imul(h ^ (h >>> 13), 3266489917); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
    const quad = (a, b, wa, wb) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, i = pos.length / 3;
      for (const [p, w, s] of [[a, wa, -1], [a, wa, 1], [b, wb, -1], [b, wb, 1]]) { pos.push(p[0], p[1], 0); off.push(nx * s, ny * s); wt.push(w, s); }
      index.push(i, i + 1, i + 3, i, i + 3, i + 2);
    };
    for (let v = 0; v < VARIANTS; v++) {
      const main = [[0, 1]];
      for (let k = 1; k <= MAIN; k++) {
        const [x] = main[k - 1], kink = rnd() < 0.18 ? 3 : 1;
        main.push([x + (rnd() - 0.5) * 0.05 * kink, 1 - k / MAIN + (rnd() - 0.5) * 0.012]);
      }
      main[MAIN][1] = 0;
      for (let k = 0; k < MAIN; k++) quad(main[k], main[k + 1], 1, 1);
      for (let f = 0; f < FORKS; f++) {
        let p = main[3 + Math.floor(rnd() * 14)];
        const side = rnd() < 0.5 ? -1 : 1, len = 0.02 + rnd() * 0.02;
        for (let k = 0; k < FORK; k++) {
          const q = [p[0] + side * len * (0.4 + rnd()), p[1] - len * (0.6 + rnd())];
          quad(p, q, 0.55 * (1 - k / FORK), 0.55 * (1 - (k + 1) / FORK));
          p = q;
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('off', new THREE.Float32BufferAttribute(off, 2));
    g.setAttribute('wt', new THREE.Float32BufferAttribute(wt, 2));
    g.setIndex(index);
    const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const lp = attribute('position', 'vec3'), of = attribute('off', 'vec2'), w = attribute('wt', 'vec2');
    const D = ENV.boltDist, dir = vec3(ENV.flashDir.x, 0, ENV.flashDir.z), right = vec3(dir.z.negate(), 0, dir.x);
    // its foot a little below the sea round, beyond the planet's curve (the ground in front hides it)
    const foot = vec3(cameraPosition.x, cameraPosition.y.sub(ENV.camAlt).sub(D.mul(D).div(2 * PLANET_RADIUS)).sub(30), cameraPosition.z).add(dir.mul(D));
    const width = D.mul(0.008).mul(w.x.mul(0.6).add(0.4));
    m.positionNode = foot.add(right.mul(lp.x.mul(BOLT_H).add(of.x.mul(width)))).add(vec3(0, lp.y.mul(BOLT_H).add(of.y.mul(width)), 0));
    const core = exp(w.y.mul(w.y).mul(-9)).mul(0.85).add(0.15);
    const fade = float(1).sub(smoothstep(0.82, 1.0, lp.y)).mul(exp(ENV.fogDensity.mul(D).mul(-0.25)));
    m.colorNode = mix(vec3(0.55, 0.5, 1.0), vec3(1.0, 0.98, 1.0), core).mul(ENV.bolt.mul(w.x).mul(fade).mul(core).mul(40));
    m.opacityNode = float(1);
    m.fog = false;
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 9;
    this.mesh.visible = false;
    this.n = QUADS * 6; this.variant = 0;
    scene.add(this.mesh);
  }
  update() {
    const on = ENV.bolt.value > 0.01;
    if (on && !this.mesh.visible) { this.variant = (this.variant + 1) % VARIANTS; this.mesh.geometry.setDrawRange(this.variant * this.n, this.n); }
    this.mesh.visible = on;
  }
}

const NF = 6000, FBOX = [36, 18, 36];

/** Snow flakes and dust motes round the viewer (one cloud; snow and dust do not fall together). */
class Flakes {
  constructor(scene) {
    const seed = new Float32Array(NF * 4 * 3), corner = new Float32Array(NF * 4 * 2), index = [];
    for (let i = 0; i < NF; i++) {
      const s = [Math.random(), Math.random(), Math.random()];
      for (let k = 0; k < 4; k++) {
        seed.set(s, (i * 4 + k) * 3);
        corner.set([k & 1 ? 1 : -1, k & 2 ? 1 : -1], (i * 4 + k) * 2);
      }
      const b = i * 4;
      index.push(b, b + 1, b + 3, b, b + 3, b + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NF * 4 * 3), 3));
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 3));
    g.setAttribute('corner', new THREE.BufferAttribute(corner, 2));
    g.setIndex(index);
    this.snow = uniform(0); this.dust = uniform(0);
    const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const sd = attribute('seed', 'vec3'), cr = attribute('corner', 'vec2');
    // the share of dust (0 snow … 1 dust); each particle's own speed varies a little
    const k = this.dust.div(max(this.snow.add(this.dust), 0.001));
    const wdir = normalize(vec3(ENV.wind.x, 0, ENV.wind.y).add(vec3(0.001, 0, 0)));
    const own = sd.x.mul(0.6).add(0.7);
    // snow falls ~1 m/s and drifts with the wind; dust runs ~7 m/s along it, rising and sinking a little
    const vSnow = vec3(ENV.wind.x.mul(0.8), float(-1.05), ENV.wind.y.mul(0.8)).mul(own);
    const vDust = wdir.mul(7).mul(own).add(vec3(0, 0.15, 0));
    const vel = mix(vSnow, vDust, k);
    const box = vec3(...FBOX);
    const t = time;
    const rel = fract(sd.add(vel.mul(t).div(box)).sub(cameraPosition.div(box))).sub(0.5).mul(box);
    // swaying: snow in slow circles, dust in quick eddies
    const ph = t.mul(mix(float(0.9), float(2.6), k)).add(sd.y.mul(40));
    const sway = vec3(sin(ph), sin(ph.mul(1.3).add(1.7)).mul(mix(float(0.2), float(0.6), k)), sin(ph.mul(0.8).add(sd.z.mul(30)))).mul(mix(float(0.35), float(0.5), k));
    const base = cameraPosition.add(rel).add(sway);
    // a small square turned to the viewer, drawn round
    const toV = normalize(cameraPosition.sub(base));
    const side = normalize(cross(toV, vec3(0, 1, 0)).add(vec3(0.0001, 0, 0)));
    const upv = cross(side, toV);
    const size = mix(float(0.026), float(0.016), k).mul(sd.z.mul(0.8).add(0.6));
    m.positionNode = base.add(side.mul(cr.x.mul(size))).add(upv.mul(cr.y.mul(size)));
    // lit as the ground round is, roughly: the sun's light and the haze's (unlit flakes read dark on sunlit snow)
    m.colorNode = mix(vec3(0.95, 0.96, 0.98), vec3(0.78, 0.62, 0.42), k).mul(ENV.sunColor.mul(0.5).add(ENV.fogColor.mul(0.6)));
    // round, fading near the camera (no flakes stuck in the eye) and toward the box's edge
    const d = length(rel);
    const near = smoothstep(0.25, 1.2, d), far = float(1).sub(smoothstep(FBOX[0] * 0.3, FBOX[0] * 0.48, d));
    const round = float(1).sub(smoothstep(0.55, 1.0, length(vec2(cr.x, cr.y))));
    m.opacityNode = mix(this.snow.mul(0.55), this.dust.mul(0.6), k).mul(round).mul(near).mul(far);
    m.fog = false;
    m.alphaTest = 0.04;
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
    this.mesh.visible = false;
    scene.add(this.mesh);
    this.s = 0; this.d = 0;
  }
  update(dt, outdoors) {
    const f = Math.min(1, dt / 2.5);
    this.s += ((outdoors ? ENV.snow.value : 0) - this.s) * f;
    this.d += ((outdoors ? ENV.dust.value : 0) - this.d) * f;
    this.snow.value = this.s; this.dust.value = this.d;
    this.mesh.visible = this.s + this.d > 0.01;
  }
}
