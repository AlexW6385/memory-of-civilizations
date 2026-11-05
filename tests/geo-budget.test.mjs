// Static geometry budget (DESIGN §8): every settlement, built in Node as the viewer builds it, stays
// within the vertex data and mesh counts of tools/geo-budget.mjs (LIMITS). Frame rates cannot be
// measured headless (software WebGPU); these counts can, exactly.
import test from 'node:test';
import assert from 'node:assert';
import { MODULES } from '../src/settlements/grounds.js';
import { measureSite, LIMITS } from '../tools/geo-budget.mjs';

test('every settlement within the geometry budget', { timeout: 600_000 }, async () => {
  const over = [];
  for (const id of Object.keys(MODULES)) {
    const S = await measureSite(id);
    const mb = S.bytes / 1e6;
    if (mb > LIMITS.gpuMB || S.meshes > LIMITS.meshes) over.push(`${id}: ${mb.toFixed(0)} MB, ${S.meshes} meshes`);
  }
  assert.deepStrictEqual(over, [], `over budget (limits ${LIMITS.gpuMB} MB, ${LIMITS.meshes} meshes):\n${over.join('\n')}`);
});
