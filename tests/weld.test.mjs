// The viewer's merged meshes are welded (indexed, identical corners kept once) and their normals
// packed to 16 bits (src/core/geom.js): unrolled again they must be the very triangles the tools'
// triangle soups hold — positions to the bit, normals within the packing's error — and the top
// field one stands on must not change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODULES } from '../src/settlements/grounds.js';
import { buildPlan, flatParts } from '../src/core/build.js';
import { topField } from '../src/core/collide.js';
import { weld } from '../src/core/geom.js';

test('weld keeps every corner and joins only identical ones', () => {
  const pos = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0]);
  const nor = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0]);
  const w = weld(pos, nor);
  assert.equal(w.pos.length / 3, 5);                  // 4 shared corners + one with another normal
  assert.ok(w.index instanceof Uint16Array);
  for (let i = 0; i < w.index.length; i++) for (let k = 0; k < 3; k++) {
    assert.equal(w.pos[3 * w.index[i] + k], pos[3 * i + k]);
    assert.equal(w.nor[3 * w.index[i] + k], nor[3 * i + k]);
  }
});

for (const id of ['paris', 'mamluk-cairo', 'maori']) {
  test(`${id}: welded meshes are the soups' triangles`, async () => {
    const mod = await MODULES[id]();
    const plans = [...mod.landmarks.map((p) => p.plan), ...(await mod.town()).slice(0, 12)];
    for (const plan of plans) {
      const a = buildPlan(plan, { instancing: true, detail: true, weld: false });
      const b = buildPlan(plan, { instancing: true, detail: true });
      assert.equal(a.parts.length, b.parts.length, plan.id);
      const fb = flatParts(b);
      for (let i = 0; i < a.parts.length; i++) {
        const ga = a.parts[i].geometry, gb = fb[i].geometry;
        assert.equal(a.parts[i].mat, b.parts[i].mat);
        assert.ok(b.parts[i].geometry.index, `${plan.id}: indexed`);
        const PA = ga.attributes.position.array, PB = gb.attributes.position.array, NA = ga.attributes.normal.array, NB = gb.attributes.normal.array;
        assert.equal(PA.length, PB.length, `${plan.id} ${a.parts[i].mat}: corner count`);
        for (let k = 0; k < PA.length; k++) {
          if (PA[k] !== PB[k]) assert.fail(`${plan.id} ${a.parts[i].mat}: position ${k} ${PA[k]} != ${PB[k]}`);
          if (Math.abs(NA[k] - NB[k]) > 4e-5) assert.fail(`${plan.id} ${a.parts[i].mat}: normal ${k} ${NA[k]} vs ${NB[k]}`);
        }
      }
      if (plan.nocollide) continue;
      const ta = await topField(flatParts(a)), tb = await topField(fb);
      if (!ta) { assert.equal(tb, null); continue; }
      assert.deepEqual([tb.x0, tb.z0, tb.w, tb.h], [ta.x0, ta.z0, ta.w, ta.h]);
      assert.deepEqual(tb.data, ta.data, `${plan.id}: top field`);
      assert.deepEqual(tb.under, ta.under, `${plan.id}: under field`);
    }
  });
}
