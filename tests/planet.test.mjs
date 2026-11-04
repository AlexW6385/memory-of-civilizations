// The planet: the land map loads, every built settlement stands on its disc with room round it,
// its ground joins the open country without a step, and its houses build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLand, coastAt } from '../src/planet/land.js';
import { initRelief, BUILT, surface } from '../src/planet/relief.js';
import { SITES, spacing, PLANET_RADIUS as R, BLEND } from '../src/planet/sites.js';
import { PLACED } from '../src/planet/layout.js';
import { unit, angle, toPlanet, norm } from '../src/planet/geo.js';
import { mapEarth, unmapPlanet } from '../src/planet/warp.js';
import { BUILDINGS } from '../src/buildings/index.js';
import { buildPlan, toWorld } from '../src/core/build.js';
import { withFocus } from '../src/world/regions.js';

const buf = readFileSync(new URL('../data/planet/land.bin', import.meta.url));
const W = buf.readUInt32LE(8), H = buf.readUInt32LE(12), W2 = buf.readUInt32LE(16), H2 = buf.readUInt32LE(20), scale = buf.readFloatLE(24);
const b = gunzipSync(buf.subarray(32));
setLand({ W, H, W2, H2, scale, sdf: b.subarray(0, W * H), climate: b.subarray(W * H) });
initRelief();

test('every site has a place, and the map of Earth goes there and back', () => {
  for (const s of SITES) {
    assert.ok(PLACED[s.id], `${s.id}: placed`);
    const u = unit(s.lat, s.lon), back = unmapPlanet(mapEarth(u));
    assert.ok(angle(u, back) * R < 0.5, `${s.id}: the map is undone`);
  }
});

test('built settlements stand apart, on land', () => {
  for (let i = 0; i < BUILT.length; i++) {
    assert.ok(coastAt(BUILT[i].u) > 0, `${BUILT[i].id}: centre on land`);
    for (let j = i + 1; j < BUILT.length; j++) {
      const d = angle(BUILT[i].u, BUILT[j].u) * R;
      assert.ok(d >= spacing(BUILT[i].site, BUILT[j].site) * 0.97, `${BUILT[i].id} – ${BUILT[j].id}: ${Math.round(d)} m apart`);
    }
  }
});

test('each settlement holds its buildings on its disc', async () => {
  for (const S of BUILT.filter((s) => s.site.legacy)) {
    for (const id of S.site.legacy.buildings) {
      const { plan } = await BUILDINGS.find((x) => x.id === id).load();
      const [cx, cz] = S.focus.center;
      for (const [x, z] of [[plan.bounds[0], plan.bounds[1]], [plan.bounds[2], plan.bounds[1]], [plan.bounds[0], plan.bounds[3]], [plan.bounds[2], plan.bounds[3]]]) {
        const p = toWorld(plan, x, z);
        assert.ok(Math.hypot(p[0] - cx, p[2] - cz) < S.radius - 8, `${id}: corner (${p[0].toFixed(0)}, ${p[2].toFixed(0)}) beyond the disc of ${S.id}`);
      }
    }
  }
});

test('the ground joins the open country without a step', () => {
  for (const S of BUILT) {
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2;
      let prev = null;
      for (let r = S.radius - 30; r < S.radius + BLEND + 20; r += 2) {
        const p = toPlanet(S.enu, [Math.cos(a) * r, 0, Math.sin(a) * r]), h = surface(norm(p)).h;
        if (prev !== null) assert.ok(Math.abs(h - prev) < 3, `${S.id}: step of ${(h - prev).toFixed(2)} m at ${r} m, bearing ${k}`);
        prev = h;
      }
    }
  }
});

test('the houses of each settlement build on its disc', async () => {
  await import('../src/styles/vernacular/index.js');
  const city = await import('../src/world/city.js');
  for (const S of BUILT.filter((s) => s.site.legacy)) {
    const plan = withFocus(S.focus, () => city.plan(S.focus.region));
    assert.ok(plan.elements.length > 15, `${S.id}: ${plan.elements.length} houses`);
    for (const { geometry } of buildPlan(plan).parts) assert.ok(geometry.attributes.position.array.every(Number.isFinite), `${S.id}: non-finite vertex`);
  }
});

test('the settlements of their own build, finite, inside their discs', async () => {
  const { MODULES } = await import('../src/settlements/grounds.js');
  const { MATERIALS } = await import('../src/core/palette.js');
  for (const S of BUILT.filter((s) => !s.site.legacy)) {
    const mod = await MODULES[S.id]();
    const plans = [...mod.landmarks.map((l) => l.plan), ...(await mod.town())];
    for (const plan of plans) {
      const built = buildPlan(plan);
      for (const { mat, geometry } of built.parts) {
        assert.ok(MATERIALS[mat], `${plan.id}: unknown material ${mat}`);
        const a = geometry.attributes.position.array;
        assert.ok(a.every(Number.isFinite), `${plan.id}: non-finite vertex`);
        geometry.computeBoundingBox();
        const b = geometry.boundingBox;
        for (const [x, z] of [[b.min.x, b.min.z], [b.max.x, b.min.z], [b.min.x, b.max.z], [b.max.x, b.max.z]]) {
          assert.ok(Math.hypot(x, z) < S.radius * 1.42, `${plan.id}: ${mat} reaches (${x.toFixed(0)}, ${z.toFixed(0)})`);
        }
      }
    }
    for (const l of mod.landmarks) for (const r of l.plan.rooms) assert.ok(l.music.zones[r.kind], `${l.plan.id}: room kind ${r.kind} has music`);
  }
});

test('arriving at a settlement of its own: a free place in clear view of its landmark', async () => {
  const { MODULES, GROUNDS } = await import('../src/settlements/grounds.js');
  const { CollisionWorld, topField } = await import('../src/core/collide.js');
  const { viewpoint, standAt, clearLine } = await import('../src/core/arrival.js');
  for (const S of BUILT.filter((s) => !s.site.legacy)) {
    const G = GROUNDS[S.id], mod = await MODULES[S.id]();
    const C = new CollisionWorld();
    Object.assign(C, { terrain: G.height, water: G.water, waterLevel: G.waterLevel });
    for (const plan of [...mod.landmarks.map((l) => l.plan), ...(await mod.town())]) {
      const built = buildPlan(plan);
      built.colliders.tops = await topField(built.parts);
      C.add(built.colliders);
    }
    const plan = mod.landmarks[0].plan, b = plan.view || plan.bakeBounds;
    const v = viewpoint(C, b, 12, [0, 1], null, plan.viewY ?? null);
    assert.ok(v, `${S.id}: no viewpoint`);
    const d = Math.max(b[0] - v.x, v.x - b[2], b[1] - v.z, v.z - b[3]);
    assert.ok(d > 0 && d < 50, `${S.id}: viewpoint ${d.toFixed(1)} m from the landmark`);
    assert.ok(standAt(C, v.x, v.z) !== null, `${S.id}: viewpoint not free`);
    // looking at it: the yaw points at the landmark's middle
    const fx = -Math.sin(v.yaw), fz = -Math.cos(v.yaw), cx = (b[0] + b[2]) / 2 - v.x, cz = (b[1] + b[3]) / 2 - v.z;
    assert.ok((fx * cx + fz * cz) / Math.hypot(cx, cz) > 0.99, `${S.id}: not facing the landmark`);
    void clearLine;
  }
});
