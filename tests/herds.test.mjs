// The herds table (src/settlements/herds-data.js, made by tools/herds-gen.mjs; src/settlements/herds.js): every critter is a known farm model of the kind it replaces,
// a settlement has at most 56, they are the ones its fauna.js lists, and the plans lose exactly the still animals the table names (nalanda, a small one).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HERDS } from '../src/settlements/herds-data.js';
import { herdCritters, dropHerds, herds } from '../src/settlements/herds.js';
import { MODELS } from '../src/engine/critter-models.js';
import '../src/engine/critter-models-farm.js';
import { farmKind } from '../src/engine/critter-models-farm.js';

const FARM = { horse: 'horse', ox: 'ox', zebu: 'ox', donkey: 'donkey', sheep: 'sheep' };
test('the table: known models of the right kind, at most 56 critters a settlement', () => {
  for (const [id, rows] of Object.entries(HERDS)) {
    let n = 0;
    for (const [kind, x, z, y, rot, model, range] of rows) {
      assert.ok(Number.isFinite(x + z + y + rot + range), `${id}: numbers`);
      if (!model) continue;
      n++; assert.ok(MODELS[model], `${id}: ${model}`);
      if (kind === 'goat') assert.ok(model.startsWith('goat_'), `${id}: a goat is ${model}`); else assert.equal(farmKind(model), FARM[kind], `${id}: a ${kind} is ${model}`);
    }
    assert.ok(n <= 56, `${id}: ${n} critters`);
    assert.equal(herdCritters(id).length, n);
  }
});

test('nalanda: fauna.js lists the herd critters and the plans lose exactly those animals', async () => {
  const { default: data } = await import('../src/settlements/nalanda/fauna.js');
  for (const c of herdCritters('nalanda')) assert.ok(data.critters.some((d) => d.model === c.model && d.at[0] === c.at[0] && d.at[2] === c.at[2]));
  const rows = HERDS.nalanda, plan = { id: 'p', elements: [...rows.map((r) => ({ t: 'animal', kind: r[0], at: [r[1] + 0.01, r[2] - 0.01] })), { t: 'animal', kind: 'ox', at: [1000, 1000] }, { t: 'pot', at: [rows[0][1], rows[0][2]] }] };
  const [out] = dropHerds('nalanda', [plan]);
  assert.equal(out.elements.length, 2); assert.equal(out.elements[0].at[0], 1000); assert.equal(out.elements[1].t, 'pot');
  herds.on = false; assert.equal(dropHerds('nalanda', [plan])[0], plan); herds.on = true;
});
