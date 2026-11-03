// Plans build to finite geometry and pass the plan check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { BUILDINGS } from '../src/buildings/index.js';
import { buildPlan } from '../src/core/build.js';
import { MATERIALS } from '../src/core/palette.js';
import { REGIONS } from '../src/world/regions.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

for (const b of BUILDINGS) {
  test(`${b.id}: geometry is finite and uses known materials`, async () => {
    const { plan, music } = await b.load();
    const built = buildPlan(plan);
    assert.ok(built.parts.length > 0);
    for (const { mat, geometry } of built.parts) {
      assert.ok(MATERIALS[mat], `unknown material ${mat}`);
      const p = geometry.attributes.position.array;
      for (let i = 0; i < p.length; i++) assert.ok(Number.isFinite(p[i]), `${mat}: non-finite vertex`);
    }
    assert.ok(music && music.zones, 'building has a score');
    for (const r of plan.rooms) assert.ok(music.zones[r.kind], `room kind ${r.kind} has music`);
  });
}

test('plan check passes', () => {
  execFileSync('node', ['tools/plan-check.mjs'], { cwd: ROOT, stdio: 'pipe' });
});

test('walk-through check passes', () => {
  execFileSync('node', ['tools/walk-check.mjs'], { cwd: ROOT, stdio: 'pipe' });
});

test('every district has what the houses and the planting need', async () => {
  const { RULES } = await import('../src/world/flora-rules.js');
  for (const r of REGIONS) {
    assert.ok(r.house && r.climate && r.ground && r.center, `${r.id}: house, climate, ground, centre`);
    assert.ok(RULES[r.id], `${r.id}: planting rules`);
  }
});

test('one can land on a roof from the air and walk on it', async () => {
  const { CollisionWorld, topField } = await import('../src/core/collide.js');
  const { move, STEP } = await import('../src/core/walk.js');
  const b = BUILDINGS.find((x) => x.id === 'foguang-east-hall');
  const { plan } = await b.load();
  const built = buildPlan(plan);
  const C = new CollisionWorld();
  C.terrain = () => -50;
  built.colliders.tops = await topField(built.parts);
  C.add(built.colliders);
  const { toWorld } = await import('../src/core/build.js');
  const c = toWorld(plan, 0, 0);
  const roof = C.topAt(c[0], c[2], 0.2, 1e4);
  const P = { x: c[0], y: roof + 20, z: c[2], vy: -0.01 };
  for (let i = 0; i < 600; i++) move(P, 0, 0, 1 / 60, C);
  assert.ok(Math.abs(P.y - roof) < 0.05, `landed at ${P.y}, roof ${roof}`);
  // walk 4 m along the roof: still on it (within a step of its surface)
  for (let i = 0; i < 90; i++) move(P, 0, 4 / 90, 1 / 60, C);
  const here = C.topAt(P.x, P.z, 0.2, P.y + STEP);
  assert.ok(P.y > roof - 4 && Math.abs(P.y - here) < 0.6, `on the roof: ${P.y} vs ${here}`);
});
