// Willow catkins (liuxu, "willow floss"): in Jiangnan's late spring the willows shed white seed
// floss that drifts on the air. A small cloud of soft white flecks round the viewer, moved
// entirely on the GPU (like src/engine/rain.js's snow and dust): each has a fixed random seed,
// its position wraps inside a box that follows the camera, it drifts slowly with the wind and
// meanders. One draw call, drawn only in season (about 10 April to 25 May, thickest in the third
// week of April), outdoors, in a settlement whose ground plants willows (maxDensity.willow).
// A system (src/engine/systems.js), registered by systems-list.js.

import * as THREE from 'three/webgpu';
import { attribute, uniform, vec2, vec3, float, fract, time, cameraPosition, normalize, cross, mix, sin, length, smoothstep } from 'three/tsl';
import { ENV } from './env.js';
import { DAY } from './flora/phenology.js';
import { registerSystem } from './systems.js';
import { GROUNDS } from '../settlements/grounds.js';

const N = 900, BOX = [30, 12, 30];

function build(scene) {
  const seed = new Float32Array(N * 4 * 3), corner = new Float32Array(N * 4 * 2), index = [];
  for (let i = 0; i < N; i++) {
    const s = [Math.random(), Math.random(), Math.random()];
    for (let k = 0; k < 4; k++) {
      seed.set(s, (i * 4 + k) * 3);
      corner.set([k & 1 ? 1 : -1, k & 2 ? 1 : -1], (i * 4 + k) * 2);
    }
    const b = i * 4;
    index.push(b, b + 1, b + 3, b, b + 3, b + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 4 * 3), 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 3));
  g.setAttribute('corner', new THREE.BufferAttribute(corner, 2));
  g.setIndex(index);
  const amount = uniform(0);
  const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const sd = attribute('seed', 'vec3'), cr = attribute('corner', 'vec2');
  const own = sd.x.mul(0.5).add(0.6);
  // a slow fall (~0.25 m/s) and the wind's drift, each flake at its own pace
  const vel = vec3(ENV.wind.x.mul(0.7).add(0.15), float(-0.25), ENV.wind.y.mul(0.7)).mul(own);
  const box = vec3(...BOX);
  const rel = fract(sd.add(vel.mul(time).div(box)).sub(cameraPosition.div(box))).sub(0.5).mul(box);
  const ph = time.mul(0.7).add(sd.y.mul(40));
  const meander = vec3(sin(ph), sin(ph.mul(1.37).add(1.7)).mul(0.45), sin(ph.mul(0.83).add(sd.z.mul(30)))).mul(0.55);
  const base = cameraPosition.add(rel).add(meander);
  const toV = normalize(cameraPosition.sub(base));
  const side = normalize(cross(toV, vec3(0, 1, 0)).add(vec3(0.0001, 0, 0)));
  const upv = cross(side, toV);
  const size = sd.z.mul(0.016).add(0.014);
  m.positionNode = base.add(side.mul(cr.x.mul(size))).add(upv.mul(cr.y.mul(size)));
  // soft, round, lit by the haze and the sun a little; not near the eye nor at the box's edge
  m.colorNode = vec3(0.97, 0.96, 0.93).mul(ENV.sunColor.mul(0.45).add(ENV.fogColor.mul(0.65)));
  const d = length(rel);
  const near = smoothstep(0.4, 1.6, d), far = float(1).sub(smoothstep(BOX[0] * 0.25, BOX[0] * 0.48, d));
  const round = float(1).sub(smoothstep(0.35, 1.0, length(vec2(cr.x, cr.y))));
  m.opacityNode = amount.mul(0.9).mul(round).mul(near).mul(far);
  m.fog = false;
  m.alphaTest = 0.04;
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  mesh.renderOrder = 10;
  mesh.visible = false;
  scene.add(mesh);
  return { mesh, amount };
}

/** How much of the catkin season it is on this day of the year (0…1). */
function season(day) {
  const up = Math.min(1, Math.max(0, (day - 98) / 16)), down = Math.min(1, Math.max(0, (146 - day) / 22));
  return up * down;
}

const sites = new Set();
let cloud = null, level = 0;
const _p = new THREE.Vector3();

export const catkins = registerSystem({
  attach(site, world) {
    const w = GROUNDS[site.id]?.maxDensity?.willow;
    if (!(w > 0.1)) return;
    sites.add(site);
    if (!cloud) cloud = build(world.scene);
    cloud.mesh.parent !== world.scene && world.scene.add(cloud.mesh);
  },
  detach(site) { sites.delete(site); },
  update(dt, camera, world) {
    if (!cloud) return;
    let target = 0;
    if (sites.size && !world.indoorsIn) {
      const k = season(DAY.value);
      if (k > 0) for (const s of sites) {
        if (s.state !== 'ready' || !s.group.visible) continue;
        // only in the settlement and just beyond its edge, thinning outward
        _p.copy(camera.position); s.group.worldToLocal(_p);
        const c = s.S.local.center, r = Math.hypot(_p.x - c[0], _p.z - c[1]);
        target = Math.max(target, k * (1 - Math.min(1, Math.max(0, (r - s.S.radius) / 150))));
      }
    }
    level += (target - level) * Math.min(1, dt / 2);
    cloud.amount.value = level;
    cloud.mesh.visible = level > 0.01;
  },
});
