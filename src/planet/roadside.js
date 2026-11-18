// The country along the roads in the viewer (src/planet/roadside-build.js): the chunks of the
// roads near the visitor are built in a worker and drawn as ONE mesh in planet coordinates (fields,
// small things, houses, fords and bridges; vertex-coloured, the crops following the season of the
// open country). Also the collision of what it draws: the decks of fords and bridges give footing
// over a river (and keep the walker on them), the houses and shrines are walked round.

import * as THREE from 'three/webgpu';
import { attribute, vec3, float, mix, clamp, abs, smoothstep, normalWorld, max } from 'three/tsl';
import { ENV } from '../engine/env.js';
import { PLANET_RADIUS as R } from './relief.js';
import { chunkList, crossings, deckAtDir, deckH, SEG } from './roadside-build.js';

const TRI_CAP = 330000;               // triangles at most in the one mesh (the budget is ~250k in view)

let MATERIAL = null;
/** One material for it all: the vertex colour, its out-of-season colour by the season of the open country, fresh snow on what faces up. */
export function roadsideMaterial() {
  if (MATERIAL) return MATERIAL;
  const col = attribute('color', 'vec3'), alt = attribute('alt', 'vec3'), ses = attribute('ses', 'vec3');
  const autumn = clamp(ENV.seasonAutumn.mul(ses.x), 0, 1), winter = clamp(ENV.seasonWinter.mul(ses.x), 0, 1);
  const spring = clamp(ENV.seasonAutumn.mul(ses.x).negate(), 0, 1).mul(clamp(float(1).sub(abs(ENV.seasonWinter.mul(ses.x))), 0, 1));
  const off = ses.y.mul(clamp(autumn.mul(0.9).add(winter), 0, 1));
  let c = mix(col, alt, off);
  c = c.mul(mix(vec3(1, 1, 1), vec3(0.9, 1.12, 0.84), spring.mul(0.4).mul(ses.y)));
  const snow = ENV.snowCover.mul(smoothstep(0.6, 0.95, normalWorld.y));
  c = mix(c, vec3(0.9, 0.92, 0.96), snow.mul(0.85));
  const m = new THREE.MeshStandardNodeMaterial({ metalness: 0 });
  m.colorNode = c;
  m.roughnessNode = max(ses.z, float(0.08));
  m.name = 'roadside';
  m.userData.staticShadow = true;
  MATERIAL = m;
  return m;
}

const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export class Roadside {
  constructor(group, land) {
    this.group = new THREE.Group();
    this.group.name = 'roadside';
    group.add(this.group);
    this.scale = 1;
    this.chunks = new Map();         // key → { state, data, detail }
    this.list = null;
    this.mesh = null;
    this.dirty = false;
    this.last = null;
    this.decks = [];                 // the crossings near the visitor (collision)
    this.blk = [];                   // the circles near the visitor: [x, y, z, r, h] in planet coordinates
    this.ready = false;
    this.busy = false;
    this.queue = [];
    this.worker = new Worker(new URL('./roadside-worker.js', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e) => {
      if (e.data.ready) { this.ready = true; this.pump(); return; }
      this.busy = false;
      const c = this.chunks.get(e.data.key);
      if (c && c.detail === e.data.detail) { c.data = e.data.data; c.state = 'done'; this.dirty = true; }
      this.pump();
    };
    this.worker.postMessage({ land });
  }

  /** Chunks wanted round planet position cam (and the camera's height above the sea). */
  update(cam, alt) {
    if (!this.list) this.list = chunkList();
    const rc = Math.hypot(cam[0], cam[1], cam[2]), u = [cam[0] / rc, cam[1] / rc, cam[2] / rc];
    const detail = this.scale >= 0.9 ? 1 : 0;
    const reach = Math.max(200, Math.min(700, 420 * this.scale)), want = new Map();
    if (alt < 450) {
      const cosR = Math.cos((reach + SEG) / R);
      for (const c of this.list) if (dot3(c.c, u) > cosR) {
        const d = Math.acos(Math.min(1, dot3(c.c, u))) * R;
        if (d < reach + SEG * 0.6) want.set(c.key, d);
      }
    }
    for (const [k, d] of want) {
      const c = this.chunks.get(k);
      if (!c || c.detail !== detail) { if (!c || c.state !== 'pending') this.chunks.set(k, { state: 'queued', detail, d }); }
      else c.d = d;
    }
    for (const [k, c] of this.chunks) if (!want.has(k) && c.state !== 'pending') { this.chunks.delete(k); this.dirty = true; }
    this.queue = [...this.chunks.entries()].filter(([, c]) => c.state === 'queued').sort((a, b) => a[1].d - b[1].d).map(([k]) => k);
    this.pump();
    const moved = !this.last || Math.hypot(cam[0] - this.last[0], cam[1] - this.last[1], cam[2] - this.last[2]) > 12;
    if (moved) this.near(cam, u, alt);
    if (this.dirty) { this.rebuild(); this.dirty = false; this.near(cam, u, alt); }
    if (moved) this.last = cam.slice();
  }

  pump() {
    if (!this.ready || this.busy || !this.queue.length) return;
    const k = this.queue.shift(), c = this.chunks.get(k);
    if (!c) return this.pump();
    const [ri, kk] = k.split('/').map(Number);
    c.state = 'pending'; this.busy = true;
    this.worker.postMessage({ key: k, ri, k: kk, detail: c.detail });
  }

  /** The decks and circles within reach of the walker, for the collision. */
  near(cam, u, alt) {
    this.decks = []; this.blk = [];
    if (alt > 60) return;
    for (const cr of (this.allCross ??= crossings())) if (dot3(cr.c, u) > Math.cos((cr.half + 150) / R)) this.decks.push({ ...cr, cos: Math.cos((cr.half + 8) / R) });
    for (const c of this.chunks.values()) {
      const b = c.data?.blockers;
      if (!b) continue;
      for (let i = 0; i < b.length; i += 5) if (Math.hypot(b[i] - cam[0], b[i + 1] - cam[1], b[i + 2] - cam[2]) < 160) this.blk.push(b[i], b[i + 1], b[i + 2], b[i + 3], b[i + 4]);
    }
  }

  /** The mesh of the chunks done, one buffer for all of them. */
  rebuild() {
    const done = [...this.chunks.values()].filter((c) => c.state === 'done' && c.data);
    let nv = 0, ni = 0;
    for (const c of done) { nv += c.data.pos.length / 3; ni += c.data.idx.length; }
    if (ni / 3 > TRI_CAP) { done.sort((a, b) => a.d - b.d); let t = 0, n = 0; for (; n < done.length; n++) { t += done[n].data.idx.length / 3; if (t > TRI_CAP) break; } done.length = n; nv = 0; ni = 0; for (const c of done) { nv += c.data.pos.length / 3; ni += c.data.idx.length; } }
    if (!nv) { if (this.mesh) { this.mesh.visible = false; } return; }
    const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), col = new Float32Array(nv * 3), alt = new Float32Array(nv * 3), ses = new Float32Array(nv * 3), idx = new Uint32Array(ni);
    let v = 0, i = 0;
    for (const { data: d } of done) {
      pos.set(d.pos, v * 3); nrm.set(d.nrm, v * 3); col.set(d.col, v * 3); alt.set(d.alt, v * 3); ses.set(d.ses, v * 3);
      for (let k = 0; k < d.idx.length; k++) idx[i + k] = d.idx[k] + v;
      v += d.pos.length / 3; i += d.idx.length;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('alt', new THREE.BufferAttribute(alt, 3)); g.setAttribute('ses', new THREE.BufferAttribute(ses, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    if (this.mesh) { this.group.remove(this.mesh); this.mesh.geometry.dispose(); }
    const mesh = this.mesh = new THREE.Mesh(g, roadsideMaterial());
    mesh.frustumCulled = false; mesh.castShadow = this.scale >= 0.9; mesh.receiveShadow = true; mesh.name = 'roadside';
    this.group.add(mesh);
    // a material not drawn before: hidden until its shaders are compiled (set by the world)
    if (this.precompile && !this.compiled) {
      mesh.visible = false;
      this.compiled = this.precompile([mesh]).then(() => { this.compiledOk = true; if (this.mesh) this.mesh.visible = true; });
    } else mesh.visible = !this.precompile || !!this.compiledOk;
  }

  // ---- collision, in a frame f = { o, x, y, z } (src/planet/geo.js) -------------------------------

  /** Scene y of a deck under scene point (x, z), or -Infinity. */
  deck(f, x, z) {
    if (!this.decks.length) return -Infinity;
    const P0 = [f.o[0] + f.x[0] * x + f.z[0] * z, f.o[1] + f.x[1] * x + f.z[1] * z, f.o[2] + f.x[2] * x + f.z[2] * z];
    const L0 = Math.hypot(P0[0], P0[1], P0[2]), n = [P0[0] / L0, P0[1] / L0, P0[2] / L0];
    let best = -Infinity;
    for (const cr of this.decks) {
      if (dot3(n, cr.c) < cr.cos) continue;
      const H = deckAtDir(cr, n);
      if (H === -Infinity) continue;
      const b = dot3(P0, f.y), rs = R + H, y = -b + Math.sqrt(Math.max(0, b * b - L0 * L0 + rs * rs));
      if (y > best) best = y;
    }
    return best;
  }

  /**
   * Push the circle (x, z, r) feet y0..y1 off what stands: houses and shrines (circles), and the
   * sides of a deck (one who walks on a bridge keeps to it). Returns [x, z].
   */
  resolve(f, x, z, r, y0, y1) {
    if (this.blk.length) {
      const b = this.blk;
      for (let i = 0; i < b.length; i += 5) {
        const d = sub3([b[i], b[i + 1], b[i + 2]], f.o), cx = dot3(d, f.x), cy = dot3(d, f.y), cz = dot3(d, f.z);
        if (y0 > cy + b[i + 4] || y1 < cy - 0.3) continue;
        const dx = x - cx, dz = z - cz, dd = Math.hypot(dx, dz), mm = b[i + 3] + r;
        if (dd < mm) { const k = dd > 1e-6 ? (mm - dd) / dd : 0; x += dx * k; z += dz * k; if (dd <= 1e-6) x += mm; }
      }
    }
    if (this.decks.length) {
      const P0 = [f.o[0] + f.x[0] * x + f.z[0] * z, f.o[1] + f.x[1] * x + f.z[1] * z, f.o[2] + f.x[2] * x + f.z[2] * z];
      const L0 = Math.hypot(P0[0], P0[1], P0[2]), n = [P0[0] / L0, P0[1] / L0, P0[2] / L0];
      for (const cr of this.decks) {
        if (dot3(n, cr.c) < cr.cos) continue;
        const d = sub3(n, cr.c), s = dot3(d, cr.ax) * R, lat = dot3(d, cr.sd) * R, w = cr.width / 2 - r;
        if (Math.abs(s) > cr.half - 0.5 || Math.abs(lat) < w || Math.abs(lat) > w + 2.2) continue;
        const H = deckH(cr, s), b = dot3(P0, f.y), rs = R + H, dy = -b + Math.sqrt(Math.max(0, b * b - L0 * L0 + rs * rs));
        if (y0 - dy > 1.0 || y0 - dy < -0.6) continue;
        // the side's direction in the scene, and back to the deck's edge
        const sx = dot3(cr.sd, f.x), sz = dot3(cr.sd, f.z), sl = Math.hypot(sx, sz) || 1, k = ((Math.sign(lat) * w) - lat) / (sl * sl);
        x += sx * k; z += sz * k;
      }
    }
    return [x, z];
  }
}
