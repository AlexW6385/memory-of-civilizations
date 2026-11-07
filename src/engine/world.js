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
import { buildPlanAsync, toWorld, flatParts } from '../core/build.js';
import { CollisionWorld, topField } from '../core/collide.js';
import { Flora } from './flora/index.js';
import { material, flameMaterial } from './materials.js';
import { MATERIALS } from '../core/palette.js';
import { releaseAfterUpload } from './release.js';
import { LifeInstances } from './life-instances.js';
import { SMALL } from './layers.js';
import { Builder } from './builder.js';
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
/** At most this many settlements are built at once (the nearest); from the air the reach grows, the count does not. */
export const MAX_BUILT = 4;
/**
 * Every mesh of a building is an instanced mesh with instance colours — a merged part is one copy
 * at its place, white — so that each material is compiled once, in one form: plain and instanced
 * meshes of one material are two shaders and two pipelines (doubling the start-up's compiling).
 */
const IDENTITY = new THREE.Matrix4().elements, WHITE = [1, 1, 1];
export function buildingMesh(geometry, mat, matrices = IDENTITY, colors = null) {
  const n = matrices.length / 16;
  const m = new THREE.InstancedMesh(geometry, material(mat), n);
  m.instanceMatrix.array.set(matrices);
  m.instanceMatrix.needsUpdate = true;
  if (!colors) { colors = new Float32Array(n * 3); for (let i = 0; i < n; i++) colors.set(WHITE, i * 3); }
  m.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  m.computeBoundingSphere();
  return m;
}

/**
 * Materials whose shadow cannot be seen, or that should let the light through: window voids (dark
 * panels in the wall's thickness), clear glass, water, lamps. Fewer things to draw in each cascade.
 */
/** Fine detail is drawn within this distance (m) of its part's bounds, and casts shadows within the second. */
const DETAIL_REACH = 160, DETAIL_SHADOW = 50;
const NO_SHADOW = new Set(['water', 'glass_outer', 'glass_topaz', 'opening', 'daylight', 'daylight_plain']);
const NO_SHADOW_KINDS = new Set(['glow', 'water', 'foam']);
const castsShadow = (mat) => !NO_SHADOW.has(mat) && !NO_SHADOW_KINDS.has(MATERIALS[mat]?.kind);

/**
 * A module fetched on demand, tried again if its download fails (a dropped connection, or the site
 * being redeployed at that moment): one failed fetch used to stop the loading for good.
 */
export async function retry(load, tries = 4) {
  for (let i = 0; ; i++) {
    try { return await load(); } catch (e) {
      if (i >= tries - 1) {
        // a module that cannot be fetched at all: most likely the site was deployed again since this
        // page opened and its folder is gone (the last versions are kept, src/../pages.yml): say so
        if (/dynamically imported module|Importing a module script failed|error loading dynamically/i.test(e.message)) globalThis.dispatchEvent?.(new Event('mp-stale'));
        throw e;
      }
      console.warn('retrying a module:', e.message);
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
}

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
    this.gen = 0;                          // bumped by unload(): a load begun before it stops adding parts
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
    this.lifeParts = [];
    const gen = this.gen;
    const stale = () => gen !== this.gen;
    this.loading = (async () => {
      const S = this.S;
      if (S.focus.region) {
        const entries = BUILDINGS.filter((b) => b.district === S.focus.region);
        this.expected = entries.length + 1.5;
        for (const entry of entries) {
          const mod = await retry(entry.load);
          if (stale()) return this;
          await this.addPart(entry.id, mod.plan, mod.music, gen);
        }
        // the houses of the settlement, of its own time (src/world/city.js), on its disc
        await import('../styles/vernacular/index.js');
        const city = await import('../world/city.js');
        if (stale()) return this;
        const plan = withFocus(S.focus, () => city.plan(S.focus.region));
        plan.id = `${S.id}-town`;
        await this.addPart(plan.id, plan, null, gen);
      } else {
        // a settlement of its own: its landmarks, then its townscape (src/settlements/<id>/)
        const mod = await retry(MODULES[S.id]);
        this.music = mod.music;
        const B = this.world.builder;
        let inWorker = false;
        if (B?.ok) {
          // laid out and built in a worker (src/engine/build-worker.js); the main thread only makes
          // the meshes. A failure falls back to building here, from what is not yet built.
          const got = new Set();
          const job = B.settlement(S.id,
            (count, nl) => { this.expected = nl * 3 + (count - nl); },
            async (i, header, built) => {
              if (stale()) return;
              const L = mod.landmarks[i];
              await this.addPart((L ? L.plan : header).id, L ? L.plan : header, L ? L.music : null, gen, built);
              if (L) this.done += 2;
              got.add(i);
            });
          this.job = job;
          try { await job.done; inWorker = true; } catch (e) { console.warn('building', S.id, 'in the page:', e.message); }
          this.job = null;
          if (stale()) return this;
          if (!inWorker) this.got = got;
        }
        if (!inWorker) {
          const town = await mod.town();
          if (stale()) return this;
          // the landmarks weigh more than a block of houses
          this.expected = mod.landmarks.length * 3 + town.length;
          const all = [...mod.landmarks.map((p) => [p.plan, p.music]), ...town.map((p) => [p, null])];
          for (let i = 0; i < all.length; i++) {
            if (stale()) return this;
            if (this.got?.has(i)) continue;            // built by a worker before it failed
            const [plan, music] = all[i];
            await this.addPart(plan.id, plan, music, gen);
            if (i < mod.landmarks.length) this.done += 2;
          }
          this.got = null;
        }
      }
      // let go of while it was being built (the visitor moved away): unload() has cleaned up
      if (stale()) return this;
      this.buildLife();
      this.done = this.expected;
      this.state = 'ready';
      return this;
    })();
    return this.loading;
  }

  async addPart(id, plan, music, gen = this.gen, prebuilt = null) {
    const built = prebuilt ?? await buildPlanAsync(plan, undefined, { instancing: true, detail: true });
    if (gen !== this.gen) { for (const { geometry } of [...built.parts, ...built.instanced]) geometry.dispose(); return null; }
    const group = new THREE.Group();
    group.name = plan.id;
    for (const { mat, geometry, detail } of built.parts) {
      const m = buildingMesh(geometry, mat);
      m.castShadow = castsShadow(mat);
      m.receiveShadow = true;
      if (detail) { m.userData.detail = true; m.layers.set(SMALL); }
      m.name = `${plan.id}:${mat}`;
      group.add(m);
    }
    // repeated pieces: one prototype, a matrix per copy (src/core/geom.js, GeoBag); the life of the
    // streets is gathered settlement-wide once all its tiles are built (buildLife)
    const lifeList = plan.style === 'life' ? built.instanced : [];
    for (const { mat, geometry, matrices, colors, detail } of plan.style === 'life' ? [] : built.instanced) {
      const m = buildingMesh(geometry, mat, matrices, colors);
      m.castShadow = castsShadow(mat);
      m.receiveShadow = true;
      m.name = `${plan.id}:${mat}:inst`;
      if (detail) { m.userData.detail = true; m.layers.set(SMALL); }
      group.add(m);
    }
    if (built.lights.length) {
      const flame = new THREE.ConeGeometry(0.035, 0.13, 8);
      const inst = new THREE.InstancedMesh(flame, flameMaterial(), built.lights.length);
      const m4 = new THREE.Matrix4();
      built.lights.forEach((l, i) => inst.setMatrixAt(i, m4.makeTranslation(l.at[0], l.at[1] + 0.02, l.at[2])));
      group.add(inst);
    }
    // its shaders compiled before it shows, not in the frame that first draws it (a hitch)
    await this.world.r.precompile?.(group);
    if (gen !== this.gen) { for (const { geometry } of [...built.parts, ...built.instanced]) geometry.dispose(); return null; }
    this.group.add(group);
    // the upper surfaces, to land and walk on (roofs, wall tops)
    if (!plan.nocollide) {
      if (!prebuilt) built.colliders.tops = await topField(flatParts(built));
      this.collide.add(built.colliders);
    }
    const rec = { id, plan, music, group, built, settlement: this, detail: group.children.filter((o) => o.userData.detail) };
    for (const o of rec.detail) { o.visible = false; o.castShadow = false; }
    if (!plan.feature) try { rec.gi = await this.world.r.gi.fetch(plan.id, `data/gi/${plan.id}.gi`); } catch (e) { console.warn(e); }
    // unloaded while the collision or the light was being made: unload() already cleared the group
    if (gen !== this.gen) { this.world.r.gi.release?.(plan.id); return null; }
    // the collision and the bounds are made: the vertex arrays are not needed once on the GPU
    group.traverse(releaseAfterUpload);
    if (lifeList.length) this.lifeParts.push({ rec, list: lifeList });
    this.parts.push(rec);
    this.done = (this.done || 0) + 1;
    return rec;
  }

  /** The life of the streets, settlement-wide (src/engine/life-instances.js). */
  buildLife() {
    if (!this.lifeParts?.length) return;
    this.life = new LifeInstances(this.group, castsShadow);
    const rare = this.life.build(this.lifeParts);
    for (const [rec, list] of rare) {
      for (const { mat, geometry } of list) {
        const m = buildingMesh(geometry, mat);
        m.castShadow = castsShadow(mat); m.receiveShadow = true; m.name = `${rec.plan.id}:${mat}:rare`;
        m.layers.set(SMALL);
        releaseAfterUpload(m);
        rec.group.add(m);
      }
    }
    this.lifeParts = [];
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
      // a far view lies beyond the shadow cascades' reach (it is shown only until the settlement is built)
      mesh.castShadow = false; mesh.receiveShadow = true;
      releaseAfterUpload(mesh);
      this.impostor = new THREE.Group();
      this.impostor.matrixAutoUpdate = false;
      this.impostor.add(mesh);
      this.world.scene.add(this.impostor);
    } catch (e) { console.warn('no far view for', this.id, e); }
  }

  unload() {
    if (this.state === 'idle') return;
    this.gen++;                            // a load still running stops adding parts
    this.job?.cancel(); this.job = null;
    this.world.scene.remove(this.group);
    this.group.traverse((o) => { if (o.isInstancedMesh) o.dispose(); else if (o.geometry) o.geometry.dispose(); });
    this.group.clear();
    this.life?.dispose(); this.life = null; this.lifeParts = [];
    for (const rec of this.parts) this.world.r.gi.release?.(rec.plan.id);
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

  /** onStep(label, fraction): the loading bar's detail (src/main.js Progress). */
  async init(onStep = () => {}) {
    this.builder = new Builder(2);
    onStep('map', 0);
    const land = await loadLand('data/planet/land.bin');
    onStep('map', 1);
    initRelief();
    this.planet = new THREE.Group();
    this.planet.name = 'planet';
    this.planet.matrixAutoUpdate = false;
    this.scene.add(this.planet);
    this.terrain = new PlanetTerrain(this.planet, land);
    this.openFlora = new OpenFlora(this.planet, land);
    this.openFlora.precompile = (o) => this.r.precompile(o);
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
    // only the starting settlement's module now (the ten buildings of the old city, src/buildings,
    // are fetched by the settlements that use them); the others' come after the start: fetched by
    // the build workers when they are idle, nearest first (warm), so that the page never evaluates
    // them while one walks and a click on the map finds them in the cache
    this.setAnchor(this.byId.edfu.S.frame, this.byId.edfu);
    await this.plansOf(this.byId.edfu);
    onStep('plans', 1);
  }

  /** The landmark plans of a settlement of its own (fetched once). */
  async plansOf(site) {
    if (!MODULES[site.id]) return;
    site.plansLoaded ??= (async () => {
      const mod = await retry(MODULES[site.id]);
      for (const p of mod.landmarks) this.plans.set(p.plan.id, { id: p.plan.id, plan: p.plan, music: p.music, site });
    })().catch((e) => { site.plansLoaded = null; throw e; });   // a failed fetch is tried again next time
    return site.plansLoaded;
  }

  /** Every settlement's landmark plans, a few at a time (after the start). */
  async loadPlans(start = null) {
    if (start) await this.plansOf(start);
    const queue = this.settlements.filter((s) => MODULES[s.id]);
    await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) { try { await this.plansOf(queue.shift()); } catch (e) { console.warn(e); } } }));
  }

  /**
   * After the start: the other settlements' modules fetched ahead, nearest to u first — by the
   * build workers when they are idle (into the browser's cache, evaluated off the main thread), or
   * without workers by the page when it is idle.
   */
  prefetch(u) {
    const order = this.settlements.filter((s) => MODULES[s.id] && !s.plansLoaded).map((s) => [World.rimDistance(s, u), s]).sort((a, b) => a[0] - b[0]).map(([, s]) => s);
    if (this.builder?.ok) this.builder.warm(order.map((s) => s.id));
    else this.loadPlansIdle(order);
  }

  /** The page's own prefetch, one module at a time when the page is idle. */
  async loadPlansIdle(order = this.settlements) {
    const idle = () => new Promise((r) => (globalThis.requestIdleCallback ? requestIdleCallback(r, { timeout: 2000 }) : setTimeout(r, 200)));
    for (const s of order) {
      if (!MODULES[s.id] || s.plansLoaded) continue;
      await idle();
      try { await this.plansOf(s); } catch (e) { console.warn(e); }
    }
  }

  /** The entrance record of a settlement's first landmark, its module fetched if need be. */
  async recordFor(S) {
    const find = () => [...this.plans.values()].find((r) => r.site?.S === S);
    if (find()) return find();
    const site = this.settlements.find((s) => s.S === S);
    if (site) await this.plansOf(site);
    return find();
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
    // nearest first: only the MAX_BUILT nearest are built; one more is kept if already built
    // (so a settlement at the edge of the count does not flicker), the rest let go
    const near = this.settlements.map((s) => [World.rimDistance(s, u), s]).sort((a, b) => a[0] - b[0]);
    near.forEach(([d, s], i) => {
      if (d < radius + lift && (i < MAX_BUILT || s === this.anchor?.site)) wanted.push(s.load());
      else if (d > UNLOAD + lift || i > MAX_BUILT) { if (s !== this.anchor?.site) s.unload(); }
      if (d < 6000) s.loadImpostor();
    });
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
    // small things (the life of the streets) are drawn only near: each tile within its plan's reach,
    // in every settlement built (a neighbour's too: its streets' small things were all drawn, from
    // kilometres off, a draw call each)
    if (!this._nextN || now > this._nextN) {
      this._nextN = now + 250;
      for (const st of this.settlements) {
        if (st.state === 'idle' || !st.parts.length) continue;
        const L = toLocal(st.S.frame, camP);
        const alt = Math.max(0, this.camAlt - (st.S.base ?? 0));
        for (const rec of st.parts) {
          const P = rec.plan;
          if (!P.near && !P.far) continue;
          const d = Math.hypot(L[0] - P.center[0], L[2] - P.center[1], alt * 0.7);
          rec.group.visible = P.near ? d < P.near : d >= P.far;
          // the small things of the streets cast shadows only in the tiles round the visitor: farther
          // off their shadows are a few texels in the outer cascades but cost a draw each
          if (P.style === 'life') {
            const cast = d < 120;
            if (rec.cast !== cast) { rec.cast = cast; rec.group.traverse((o) => { if (o.isMesh) o.castShadow = cast; }); }
          }
        }
      }
    }
    // fine detail (pieces under 0.4 m, src/core/geom.js): drawn within DETAIL_REACH of the part's
    // bounds, casting shadows within DETAIL_SHADOW; indoors, only the building one is in casts
    if (!this._nextD || now > this._nextD) {
      this._nextD = now + 250;
      const inside = this.indoorsIn;
      for (const s of this.settlements) {
        if (s.state === 'idle' || !s.parts.length) continue;
        const L = toLocal(s.S.frame, camP);
        for (const rec of s.parts) {
          for (const o of rec.detail) {
            const b = o.boundingSphere || o.geometry.boundingSphere;
            const d = Math.hypot(L[0] - b.center.x, L[1] - b.center.y, L[2] - b.center.z) - b.radius;
            const vis = d < DETAIL_REACH, cast = vis && d < DETAIL_SHADOW && castsShadow(o.material.name);
            if (o.visible !== vis) o.visible = vis;
            if (o.castShadow !== cast) o.castShadow = cast;
          }
          // indoors in a landmark: the other parts' shadows cannot reach in (their light comes
          // through the building's own openings, which its own walls frame)
          const quiet = inside && rec !== inside && rec.settlement === inside.settlement;
          if (rec.quiet !== quiet) {
            rec.quiet = quiet;
            rec.group.traverse((o) => { if (o.isMesh && !o.userData.detail) o.castShadow = quiet ? false : (rec.plan.style === 'life' ? rec.cast !== false : castsShadow(o.material.name)); });
            if (s.life) for (const L2 of s.life.meshes) L2.near.castShadow = !quiet && castsShadow(L2.near.material.name);
          }
        }
      }
    }
    // the life of the streets: the copies within reach, chosen four times a second
    if (!this._nextL || now > this._nextL) {
      this._nextL = now + 250;
      for (const s of this.settlements) {
        if (!s.life) continue;
        const L = toLocal(s.S.frame, camP);
        s.life.group.visible = !this.lifeHidden;
        s.life.update(L[0], L[1], L[2]);
      }
    }
    const here = this.locate(camera.position.x, camera.position.y, camera.position.z);
    this.indoorsIn = here.room && here.room.kind !== 'open' && here.distance === 0 ? here.building : null;
    // the baked light of the landmark's rooms the viewer stands in (src/engine/gi.js)
    if (here.building?.gi) this.r.gi.use(here.building.gi, camera.position); else this.r.gi.clear?.();
    return here;
  }
}
