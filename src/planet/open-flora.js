// The open country's plants in the viewer (src/planet/trees.js): cells near the visitor are
// scattered in a worker, and their plants drawn as instanced meshes per species, variant and level
// of detail (src/engine/flora), each stood upright on the round ground.

import * as THREE from 'three/webgpu';
import { SPECIES, VARIANTS, speciesGeometry } from '../engine/flora/species.js';
import { foliageMaterial, solidMaterial } from '../engine/flora/index.js';
import { material as paletteMaterial } from '../engine/materials.js';
import { TREE_SPECIES, CELL_LEVEL } from './trees.js';
import { dirFace } from './chunk.js';
import { PLANET_RADIUS as R } from './relief.js';
import { eastNorth } from './geo.js';

const REACH = 650;                       // metres round the visitor whose cells are scattered

export class OpenFlora {
  constructor(group, land) {
    this.group = new THREE.Group();
    this.group.name = 'open-flora';
    group.add(this.group);
    this.cells = new Map();              // key → { state, data }
    this.batches = new Map();
    this.scale = 1;
    this.dirty = false;
    this.last = null;
    this.queue = [];
    this.workers = Array.from({ length: 2 }, () => {
      const w = new Worker(new URL('./terrain-worker.js', import.meta.url), { type: 'module' });
      w.idle = false;
      w.onmessage = (e) => {
        w.idle = true;
        if (e.data.cell) { const c = this.cells.get(e.data.cell); if (c) { c.data = e.data.data; c.state = 'done'; this.dirty = true; } }
        this.pump();
      };
      w.postMessage({ land });
      return w;
    });
  }

  /** Cells wanted round planet position cam (and the camera's height above the sea). */
  update(cam, alt) {
    const rc = Math.hypot(cam[0], cam[1], cam[2]), u = [cam[0] / rc, cam[1] / rc, cam[2] / rc];
    const want = new Set();
    if (alt < 450) {
      const [e, n] = eastNorth(u), n2 = 1 << CELL_LEVEL;
      const reach = REACH * this.scale;
      for (let y = -reach; y <= reach; y += 45) for (let x = -reach; x <= reach; x += 45) {
        if (x * x + y * y > reach * reach) continue;
        const v = [u[0] + (e[0] * x + n[0] * y) / R, u[1] + (e[1] * x + n[1] * y) / R, u[2] + (e[2] * x + n[2] * y) / R];
        const [f, s, t] = dirFace(v);
        const i = Math.min(n2 - 1, Math.floor((s + 1) / 2 * n2)), j = Math.min(n2 - 1, Math.floor((t + 1) / 2 * n2));
        want.add(`${f}/${i}/${j}`);
      }
    }
    for (const k of want) if (!this.cells.has(k)) this.cells.set(k, { state: 'queued' });
    for (const [k, c] of this.cells) if (!want.has(k) && c.state !== 'pending') { this.cells.delete(k); this.dirty = true; }
    this.queue = [...this.cells.entries()].filter(([, c]) => c.state === 'queued').map(([k]) => k);
    this.pump();
    const moved = !this.last || Math.hypot(cam[0] - this.last[0], cam[1] - this.last[1], cam[2] - this.last[2]) > 15;
    if (this.dirty || moved) { this.rebuild(cam); this.last = cam.slice(); this.dirty = false; }
  }

  pump() {
    for (const w of this.workers) {
      if (!w.idle || !this.queue.length) continue;
      const k = this.queue.shift(), c = this.cells.get(k);
      if (!c) continue;
      const [f, i, j] = k.split('/').map(Number);
      c.state = 'pending'; w.idle = false;
      w.postMessage({ cell: true, key: k, f, i, j });
    }
  }

  rebuild(cam) {
    const buckets = new Map();
    for (const c of this.cells.values()) {
      if (c.state !== 'done') continue;
      const d = c.data;
      for (let i = 0; i < d.length; i += 8) {
        const sp = TREE_SPECIES[d[i + 3]], S = SPECIES[sp];
        const dist = Math.hypot(d[i] - cam[0], d[i + 1] - cam[1], d[i + 2] - cam[2]);
        const lod = dist < S.lod[0] * this.scale ? 0 : dist < Math.min(S.lod[1], REACH) * this.scale ? 1 : -1;
        if (lod < 0) continue;
        const key = `${sp}/${d[i + 4] % VARIANTS % 2}/${lod}`;          // (two shapes at each level: src/engine/flora/index.js NEAR_VARIANTS)
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(d, i);
      }
    }
    // (an instanced mesh of no copies is still a draw call: hidden)
    for (const [key, b] of this.batches) if (!buckets.has(key)) for (const m of b.meshes) { m.count = 0; m.visible = false; }
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qy = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
    for (const [key, list] of buckets) {
      const [sp, v, lod] = key.split('/'), n = list.length / 2, b = this.batch(sp, +v, +lod, n), S = SPECIES[sp];
      let k = 0;
      for (let j = 0; j < list.length; j += 2) {
        const d = list[j], i = list[j + 1];
        p.set(d[i], d[i + 1], d[i + 2]);
        up.copy(p).normalize();
        q.setFromUnitVectors(Y, up).multiply(qy.setFromAxisAngle(Y, d[i + 5]));
        s.setScalar(S.scale[0] + (S.scale[1] - S.scale[0]) * d[i + 6]);
        m4.compose(p, q, s);
        col.setRGB(0.88 + 0.24 * d[i + 7], 0.9 + 0.2 * d[i + 7], 0.86 + 0.2 * ((d[i + 7] * 7) % 1));
        for (const mesh of b.meshes) { mesh.setMatrixAt(k, m4); if (mesh.userData.tinted) mesh.setColorAt(k, col); }
        k++;
      }
      for (const mesh of b.meshes) {
        mesh.count = n;
        mesh.visible = b.ready && n > 0;
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    }
  }

  batch(sp, v, lod, n) {
    const key = `${sp}/${v}/${lod}`;
    let b = this.batches.get(key);
    if (b && b.cap >= n) return b;
    if (b) for (const mesh of b.meshes) { this.group.remove(mesh); mesh.dispose(); }
    const S = SPECIES[sp], geo = speciesGeometry(sp, v, lod), cap = Math.max(1100, Math.ceil(n * 1.5));
    const meshes = [];
    const sway = sp.includes('palm') ? 0.12 : 0.08;
    if (geo.trunk) meshes.push(new THREE.InstancedMesh(geo.trunk, S.bark === 'rock_boulder' ? paletteMaterial('rock_boulder') : solidMaterial(S.bark, sway * 0.3), cap));
    if (geo.leaves) {
      const mesh = new THREE.InstancedMesh(geo.leaves, geo.solidLeaves ? solidMaterial(S.leafMat, sway) : foliageMaterial(S.foliage, sway, sp), cap);
      mesh.userData.tinted = true;
      mesh.setColorAt(0, new THREE.Color(1, 1, 1));
      meshes.push(mesh);
    }
    for (const mesh of meshes) {
      mesh.count = 0; mesh.frustumCulled = false;
      mesh.castShadow = S.shadow && lod === 0; mesh.receiveShadow = true;
      mesh.name = `open-flora:${key}`;
      this.group.add(mesh);
    }
    // a species not drawn before: hidden until its shaders are compiled (set by the world), so that
    // the frame that first shows it does not stop to compile them
    b = { meshes, cap, ready: !this.precompile };
    for (const mesh of meshes) mesh.visible = false;
    if (this.precompile) {
      const bb = b;
      this.precompile(meshes).then(() => { bb.ready = true; for (const mesh of meshes) mesh.visible = mesh.count > 0; });
    }
    this.batches.set(key, b);
    return b;
  }
}
