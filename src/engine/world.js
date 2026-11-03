// The world: the planet's ground and sea, the settlements on it (loaded when near), and the frame
// in which the scene is drawn. DESIGN §4, docs/world.md.
//
// The scene is always drawn in a local frame round the visitor (an "anchor"): +y the local up.
// In or near a settlement the anchor is that settlement's own frame — its coordinates are those its
// plans, collision, baked light and plants are made in (for the ten settlements of the previous
// design, the old city's coordinates), and everything of it works unchanged. In the open country
// the anchor follows the visitor, re-centred under the feet every frame. Between the two, over the
// settlement's blend, the view is turned little by little from the settlement's up to the true up
// of the place, so that the switch from one frame to the other cannot be seen.

import * as THREE from 'three/webgpu';
import { BUILDINGS } from '../buildings/index.js';
import { buildPlanAsync, toWorld } from '../core/build.js';
import { CollisionWorld, topField } from '../core/collide.js';
import { Flora } from './flora/index.js';
import { material, flameMaterial } from './materials.js';
import { ENV } from './env.js';
import { loadLand } from '../planet/land.js';
import { BUILT, BUILT_BY_ID, initRelief, surface, groundInFrame, seaInFrame, PLANET_RADIUS as R, BLEND } from '../planet/relief.js';
import { PlanetTerrain } from '../planet/terrain.js';
import { OpenFlora } from '../planet/open-flora.js';
import { toPlanet, toLocal, dirToPlanet, dirToLocal, transportFrame, enuFrame, norm, dot, unit } from '../planet/geo.js';
import { withFocus } from '../world/regions.js';
import { MODULES } from '../settlements/grounds.js';

/** A settlement is built when the visitor comes within LOAD of its rim and let go beyond UNLOAD. */
export const LOAD = 700, UNLOAD = 1300;
const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** Matrix taking planet coordinates to a frame's local ones. */
function sceneFromPlanet(f, m = new THREE.Matrix4()) {
  const { x, y, z, o } = f;
  return m.set(
    x[0], x[1], x[2], -(x[0] * o[0] + x[1] * o[1] + x[2] * o[2]),
    y[0], y[1], y[2], -(y[0] * o[0] + y[1] * o[1] + y[2] * o[2]),
    z[0], z[1], z[2], -(z[0] * o[0] + z[1] * o[1] + z[2] * o[2]),
    0, 0, 0, 1);
}
/** Matrix taking a frame's local coordinates to planet ones. */
function planetFromFrame(f, m = new THREE.Matrix4()) {
  const { x, y, z, o } = f;
  return m.set(x[0], y[0], z[0], o[0], x[1], y[1], z[1], o[1], x[2], y[2], z[2], o[2], 0, 0, 0, 1);
}

/** Where u stands relative to a settlement: { r (m from the disc's centre, on its plane), x, z (local), uy }. */
function relTo(S, u) {
  const uy = dot(S.enu.y, u);
  if (uy <= 0.5) return { r: Infinity };
  const k = (R + S.base) / uy, x = dot(S.enu.x, u) * k, z = dot(S.enu.z, u) * k;
  return { r: Math.hypot(x, z), x, z, uy };
}

/** One settlement in the viewer: its group, its collision world, its buildings and houses. */
class Settlement {
  constructor(S, world) {
    this.S = S; this.world = world;
    this.id = S.id;
    this.group = new THREE.Group();
    this.group.name = 'settlement:' + S.id;
    this.group.matrixAutoUpdate = false;
    this.parts = [];                       // { id, plan, music, group, built, gi }
    this.state = 'idle';
    const C = this.collide = new CollisionWorld();
    const [cx, cz] = S.local.center, L = S.local;
    // the ground: the settlement's own on its disc, the planet's beyond (in the settlement's frame)
    const on = (x, z) => Math.hypot(x - cx, z - cz) < S.radius;
    C.terrain = (x, z) => (on(x, z) ? L.height(x, z) : groundInFrame(S.frame, x, z));
    C.water = (x, z, y) => (on(x, z) ? L.water(x, z, y) : (groundInFrame(S.frame, x, z) < seaInFrame(S.frame, x, z) - 0.3 && y < seaInFrame(S.frame, x, z) + 0.3));
    C.waterLevel = (x, z) => (on(x, z) ? L.waterLevel(x, z) : (groundInFrame(S.frame, x, z) < seaInFrame(S.frame, x, z) ? seaInFrame(S.frame, x, z) : -Infinity));
    this.music = null;                     // the settlement's own music, in its streets (its module's)
  }

  /** How much of the settlement is built (0…1), while it loads. */
  get fraction() { return this.state === 'ready' ? 1 : this.state === 'idle' ? 0 : Math.min(0.99, (this.done || 0) / (this.expected || 1)); }

  load() {
    if (this.loading) return this.loading;
    this.state = 'loading';
    this.world.scene.add(this.group);
    this.done = 0; this.expected = 1;
    this.loading = (async () => {
      const S = this.S;
      if (S.focus.region) {
        const entries = BUILDINGS.filter((b) => b.district === S.focus.region);
        this.expected = entries.length + 1.5;
        for (const entry of entries) {
          const mod = await entry.load();
          await this.addPart(entry.id, mod.plan, mod.music);
        }
        // the houses of the settlement, of its own time (src/world/city.js), on its disc
        await import('../styles/vernacular/index.js');
        const city = await import('../world/city.js');
        const plan = withFocus(S.focus, () => city.plan(S.focus.region));
        plan.id = `${S.id}-town`;
        await this.addPart(plan.id, plan, null);
      } else {
        // a settlement of its own: its landmarks, then its townscape (src/settlements/<id>/)
        const mod = await MODULES[S.id]();
        this.music = mod.music;
        const town = await mod.town();
        // the landmarks weigh more than a block of houses
        this.expected = mod.landmarks.length * 3 + town.length;
        for (const p of mod.landmarks) { await this.addPart(p.plan.id, p.plan, p.music); this.done += 2; }
        for (const plan of town) await this.addPart(plan.id, plan, null);
      }
      this.done = this.expected;
      this.state = 'ready';
      return this;
    })();
    return this.loading;
  }

  async addPart(id, plan, music) {
    const built = await buildPlanAsync(plan);
    const group = new THREE.Group();
    group.name = plan.id;
    for (const { mat, geometry } of built.parts) {
      const m = new THREE.Mesh(geometry, material(mat));
      m.castShadow = mat !== 'water' && mat !== 'glass_outer';
      m.receiveShadow = true;
      m.name = `${plan.id}:${mat}`;
      group.add(m);
    }
    if (built.lights.length) {
      const flame = new THREE.ConeGeometry(0.035, 0.13, 8);
      const inst = new THREE.InstancedMesh(flame, flameMaterial(), built.lights.length);
      const m4 = new THREE.Matrix4();
      built.lights.forEach((l, i) => inst.setMatrixAt(i, m4.makeTranslation(l.at[0], l.at[1] + 0.02, l.at[2])));
      group.add(inst);
    }
    this.group.add(group);
    // the upper surfaces, to land and walk on (roofs, wall tops)
    built.colliders.tops = await topField(built.parts);
    this.collide.add(built.colliders);
    const rec = { id, plan, music, group, built, settlement: this };
    if (!plan.feature) try { rec.gi = await this.world.r.gi.fetch(plan.id, `data/gi/${plan.id}.gi`); } catch (e) { console.warn(e); }
    this.parts.push(rec);
    this.done = (this.done || 0) + 1;
    return rec;
  }

  /** The far view (tools/impostors.mjs): the settlement simplified, shown until it is built in full. */
  async loadImpostor() {
    if (this.impostor !== undefined) return;
    this.impostor = null;
    try {
      const res = await fetch(`data/impostors/${this.id}.bin`);
      if (!res.ok) return;
      const buf = await res.arrayBuffer();
      const h = new DataView(buf), n = h.getUint32(8, true), ni = h.getUint32(12, true);
      const min = [h.getFloat32(16, true), h.getFloat32(20, true), h.getFloat32(24, true)], sc = h.getFloat32(28, true);
      const bytes = await new Response(new Blob([buf.slice(32)]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      const P = new Uint16Array(bytes, 0, n * 3), C = new Uint8Array(bytes, n * 6, n * 3);
      const off = n * 9 + ((4 - ((n * 9) % 4)) % 4), I = new Uint32Array(bytes, off, ni);
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
      for (let i = 0; i < n * 3; i++) { pos[i] = min[i % 3] + P[i] * sc; col[i] = lin(C[i]); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      g.setIndex(new THREE.BufferAttribute(I, 1));
      g.computeBoundingSphere();
      const m = new THREE.MeshStandardNodeMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(g, m);
      mesh.name = 'impostor:' + this.id;
      mesh.castShadow = true; mesh.receiveShadow = true;
      this.impostor = new THREE.Group();
      this.impostor.matrixAutoUpdate = false;
      this.impostor.add(mesh);
      this.world.scene.add(this.impostor);
    } catch (e) { console.warn('no far view for', this.id, e); }
  }

  unload() {
    if (this.state === 'idle') return;
    this.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    this.group.clear();
    this.parts = [];
    this.collide = Object.assign(new CollisionWorld(), { terrain: this.collide.terrain, water: this.collide.water, waterLevel: this.collide.waterLevel });
    this.loading = null;
    this.state = 'idle';
  }
}

export class World {
  constructor(renderer) {
    this.r = renderer;
    this.scene = renderer.scene;
    this.plans = new Map();               // building id → { id, entry, plan, music, site }
    this.anchor = null;                   // { frame, site (a Settlement or null) }
    this.tilt = new THREE.Quaternion();
    this._m = new THREE.Matrix4();
    this._m2 = new THREE.Matrix4();
  }

  async init() {
    const land = await loadLand('data/planet/land.bin');
    initRelief();
    this.planet = new THREE.Group();
    this.planet.name = 'planet';
    this.planet.matrixAutoUpdate = false;
    this.scene.add(this.planet);
    this.terrain = new PlanetTerrain(this.planet, land);
    this.openFlora = new OpenFlora(this.planet, land);
    this.settlements = BUILT.map((S) => new Settlement(S, this));
    this.byId = Object.fromEntries(this.settlements.map((s) => [s.id, s]));
    // the plants of the settlement the visitor is in (src/engine/flora), drawn in its frame
    this.legacy = new THREE.Group();
    this.legacy.name = 'flora-frame';
    this.legacy.matrixAutoUpdate = false;
    this.scene.add(this.legacy);
    this.flora = new Flora(this.legacy);
    // the open country's collision: the planet's ground and the sea in the current frame
    this.open = new CollisionWorld();
    this.open.terrain = (x, z) => groundInFrame(this.anchor.frame, x, z);
    this.open.water = (x, z, y) => { const s = seaInFrame(this.anchor.frame, x, z); return groundInFrame(this.anchor.frame, x, z) < s - 0.3 && y < s + 0.3; };
    this.open.waterLevel = (x, z) => { const s = seaInFrame(this.anchor.frame, x, z); return groundInFrame(this.anchor.frame, x, z) < s ? s : -Infinity; };
    // every building's plan (small modules), to know where its entrance is
    await Promise.all(BUILDINGS.map(async (entry) => {
      const mod = await entry.load();
      const site = this.settlements.find((s) => s.S.focus.region === entry.district);
      this.plans.set(entry.id, { id: entry.id, entry, plan: mod.plan, music: mod.music, site });
    }));
    for (const site of this.settlements) {
      if (!MODULES[site.id]) continue;
      const mod = await MODULES[site.id]();
      for (const p of mod.landmarks) this.plans.set(p.plan.id, { id: p.plan.id, plan: p.plan, music: p.music, site });
    }
    this.setAnchor(this.byId.edfu.S.frame, this.byId.edfu);
  }

  /** The collision world in force (the settlement's in its frame, the open country's elsewhere). */
  get collide() { return this.anchor?.site ? this.anchor.site.collide : this.open; }

  setAnchor(frame, site) {
    this.anchor = { frame, site };
    const f = frame;
    ENV.planetO.value.set(f.o[0], f.o[1], f.o[2]);
    ENV.planetM.value.set(f.x[0], f.y[0], f.z[0], f.x[1], f.y[1], f.z[1], f.x[2], f.y[2], f.z[2]);
    this.r.gi.clear?.();
    this.onCollide?.(this.collide);
  }

  /** Planet coordinates of a scene point (and back). */
  toPlanet(p) { return toPlanet(this.anchor.frame, p); }
  toScene(P) { return toLocal(this.anchor.frame, P); }

  /** The settlement whose zone (disc and blend) a planet direction is in: { s, r } or null. */
  zoneOf(u) {
    for (const s of this.settlements) {
      const q = relTo(s.S, u);
      if (q.r < s.S.radius + BLEND) return { s, r: q.r };
    }
    return null;
  }

  /** The nearest settlement within `reach` metres beyond its zone: { s, r } or null. */
  nearestSite(u, reach = 260) {
    let best = null;
    for (const s of this.settlements) {
      const q = relTo(s.S, u);
      if (q.r < s.S.radius + BLEND + reach && (!best || q.r - s.S.radius < best.r - best.s.S.radius)) best = { s, r: q.r };
    }
    return best;
  }

  /** Tilt of the view in a settlement's frame toward the true up at u (none on the disc, all at the zone's edge). */
  tiltFor(site, u, out = new THREE.Quaternion()) {
    if (!site) return out.identity();
    const q = relTo(site.S, u), w = sm(site.S.radius, site.S.radius + BLEND, q.r);
    const up = dirToLocal(site.S.frame, u);
    out.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(up[0], up[1], up[2]).normalize());
    return out.slerp(new THREE.Quaternion(), 1 - w);
  }

  /**
   * Keep the anchor right for the visitor (controls: feet, yaw, pitch): the settlement's frame in
   * its zone, else a frame under the feet; the pose is carried over so that nothing moves.
   */
  reanchor(controls) {
    const F = controls.feet;
    const P = toPlanet(this.anchor.frame, [F.x, F.y, F.z]);
    const u = norm(P);
    const z = this.zoneOf(u);
    const site = z ? z.s : null;
    if (site && site === this.anchor.site) { this.tiltFor(site, u, this.tilt); return; }
    const frame = site ? site.S.frame : transportFrame(this.anchor.frame, u, R);
    const newTilt = this.tiltFor(site, u, new THREE.Quaternion());
    this.carry(controls, frame, newTilt);
    this.setAnchor(frame, site);
    this.tilt.copy(newTilt);
  }

  /** Carry the visitor's pose over to another frame (with the view's tilt there). */
  carry(controls, frame, newTilt) {
    const F = controls.feet;
    const P = toPlanet(this.anchor.frame, [F.x, F.y, F.z]);
    const fwd = new THREE.Vector3(-Math.sin(controls.yaw) * Math.cos(controls.pitch), Math.sin(controls.pitch), -Math.cos(controls.yaw) * Math.cos(controls.pitch)).applyQuaternion(this.tilt);
    const fp = dirToPlanet(this.anchor.frame, [fwd.x, fwd.y, fwd.z]);
    const fl = dirToLocal(frame, fp);
    const f2 = new THREE.Vector3(fl[0], fl[1], fl[2]).applyQuaternion(newTilt.clone().invert());
    const L = toLocal(frame, P);
    F.x = L[0]; F.y = L[1]; F.z = L[2];
    controls.yaw = Math.atan2(-f2.x, -f2.z);
    controls.pitch = Math.asin(Math.max(-1, Math.min(1, f2.y)));
  }

  /** Put the scene's objects where the anchor says, and the camera's tilt. */
  place(camera, tilt = true) {
    const S = sceneFromPlanet(this.anchor.frame, this._m);
    this.planet.matrix.copy(S);
    this.planet.matrixWorldNeedsUpdate = true;
    for (const s of this.settlements) {
      if (s.state === 'idle') continue;
      s.group.matrix.multiplyMatrices(S, planetFromFrame(s.S.frame, this._m2));
      s.group.matrixWorldNeedsUpdate = true;
    }
    for (const s of this.settlements) {
      if (!s.impostor) continue;
      s.impostor.visible = s.state !== 'ready';
      if (s.impostor.visible) { s.impostor.matrix.multiplyMatrices(S, planetFromFrame(s.S.frame, this._m2)); s.impostor.matrixWorldNeedsUpdate = true; }
    }
    const fs = this.floraSite;
    if (fs) { this.legacy.matrix.multiplyMatrices(S, planetFromFrame(fs.S.frame, this._m2)); this.legacy.matrixWorldNeedsUpdate = true; }
    if (tilt) camera.quaternion.premultiply(this.tilt);
    camera.updateMatrixWorld();
  }

  /** The building the visitor is near (in the anchor's settlement) and the room the point is in. */
  locate(x, y, z) {
    const site = this.anchor?.site;
    if (!site) return { building: null, room: null, distance: Infinity };
    let best = null, bd = Infinity;
    for (const rec of site.parts) {
      if (rec.plan.feature) continue;
      const [x0, z0, x1, z1] = World.worldBounds(rec.plan);
      const d = Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1));
      if (d < bd) { bd = d; best = rec; }
    }
    if (!best) return { building: null, room: null, distance: Infinity };
    let room = null;
    for (const r of best.plan.rooms) {
      const a = toWorld(best.plan, r.rect[0], r.rect[1]), b = toWorld(best.plan, r.rect[2], r.rect[3]);
      if (x >= Math.min(a[0], b[0]) - 0.6 && x <= Math.max(a[0], b[0]) + 0.6 && z >= Math.min(a[2], b[2]) - 0.6 && z <= Math.max(a[2], b[2]) + 0.6 && Math.abs(y - (r.y + (best.plan.base || 0))) < 3) { room = r; break; }
    }
    return { building: best, room, distance: bd };
  }

  static worldBounds(plan) {
    const a = toWorld(plan, plan.bounds[0], plan.bounds[1]), b = toWorld(plan, plan.bounds[2], plan.bounds[3]);
    return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
  }

  /** A building's entrance in its settlement's frame: [x, y, z, yaw]. */
  entrance(plan) {
    const e = plan.entrance;
    const p = toWorld(plan, e.at[0], e.at[1], e.y || 0);
    const yaws = { n: 0, w: Math.PI / 2, s: Math.PI, e: -Math.PI / 2 };
    return [p[0], p[1], p[2], (yaws[e.facing] ?? 0) - (plan.yaw || 0) * Math.PI / 180];
  }

  /** Planet direction of the visitor's feet. */
  here(controls) { const F = controls.feet; return norm(toPlanet(this.anchor.frame, [F.x, F.y, F.z])); }

  /** Distance (m, along the ground) from u to a settlement's rim. */
  static rimDistance(s, u) { return Math.max(0, Math.acos(Math.max(-1, Math.min(1, dot(s.S.u, u)))) * R - s.S.radius); }

  /** Load the settlements near u, let go of those far; resolves when the near ones are built. */
  async ensureNear(u, radius = LOAD) {
    // from the air one sees farther: the reach grows with the height
    const lift = Math.min(1700, Math.max(0, (this.camAlt || 0) - 60) * 1.3);
    const wanted = [];
    for (const s of this.settlements) {
      const d = World.rimDistance(s, u);
      if (d < radius + lift) wanted.push(s.load());
      else if (d > UNLOAD + lift) s.unload();
      if (d < 6000) s.loadImpostor();
    }
    await Promise.all(wanted);
  }

  /**
   * Arrive at a settlement's building entrance (or a pose in its frame): the anchor becomes the
   * settlement's frame, and the settlement, the ground and the plants round are made ready.
   */
  async arriveAt(site, report) {
    await site.load();
    report?.('build', 1);
  }

  /** Called every frame: load and unload by distance, the ground's detail, the plants, the baked light. */
  update(camera, controls) {
    const now = performance.now();
    const u = this.here(controls);
    const camP = toPlanet(this.anchor.frame, camera.position.toArray());
    if (!this._next || now > this._next) { this._next = now + 400; this.ensureNear(u); }
    if (!this._nextT || now > this._nextT) { this._nextT = now + 120; this.terrain.update(camP); }
    if (!this._nextF || now > this._nextF) { this._nextF = now + 300; this.openFlora.update(camP, Math.hypot(camP[0], camP[1], camP[2]) - R); }
    this.camAlt = Math.hypot(camP[0], camP[1], camP[2]) - R;
    ENV.camAlt.value = this.camAlt;
    // the plants: of the settlement whose zone the visitor is in, or the nearest within reach
    let fs = this.anchor.site;
    if (!fs) { let bd = 900; for (const s of this.settlements) { const d = World.rimDistance(s, u); if (d < bd) { bd = d; fs = s; } } }
    if (fs !== this.floraSite) { this.floraSite = fs; this.flora.setSite(fs ? fs.S.focus : null); }
    if (fs) {
      const L = toLocal(fs.S.frame, camP);
      this.flora.update(L[0], L[2]);
    }
    const here = this.locate(camera.position.x, camera.position.y, camera.position.z);
    if (here.building?.gi) this.r.gi.use(here.building.gi); else this.r.gi.clear?.();
    return here;
  }
}
