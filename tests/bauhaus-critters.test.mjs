// Bauhaus Dessau's critters (src/engine/fauna-critters.js; docs/settlements/bauhaus-dessau.md §15.4): pigeons before the bakeries and on the school's forecourt,
// dogs at the pubs' and butchers' doors, cats on doorsteps, rooks on the lawn. The behaviours are written once for numbers and for the shader; this steps them in Node.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/bauhaus-dessau/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inSchool, inRoad, RADIUS } from '../src/settlements/bauhaus-dessau/layout.js';

const inst = expandCritters(data.critters, { id: 'bauhaus-dessau' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...models) => inst.filter((i) => models.includes(i.model));

test('the instances: every model is known, the count is small, all inside the disc and clear of the buildings', () => {
  assert.ok(inst.length >= 25 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) {
    const [x, , z] = i.groups[1];
    assert.ok(POSES[i.groups[0][0]], i.model);
    assert.ok(Math.hypot(x, z) < RADIUS - 20, i.model);
    assert.ok(!lots().some((l) => x > l.rect[0] && x < l.rect[2] && z > l.rect[1] && z < l.rect[3]), `${i.model} stands in a house at ${x.toFixed(1)}, ${z.toFixed(1)}`);
  }
  assert.ok(of('pigeon_grey', 'pigeon_white', 'pigeon_dark').length >= 8 && of('dog').length >= 3 && of('cat_tabby', 'cat_orange').length >= 3 && of('rook').length >= 3);
  void inSchool; void inRoad;
});

test('pigeons and rooks walk and peck within a few metres of where they stand, slowly', () => {
  for (const p of of('pigeon_grey', 'pigeon_white', 'pigeon_dark', 'rook')) {
    const x0 = p.groups[1][0], z0 = p.groups[1][2]; let prev = null, vmax = 0;
    for (let t = 0; t < 400; t += 0.2) {
      const r = run(p, t, far(p));
      assert.ok(Math.hypot(r.X - x0, r.Z - z0) < 4.2, `${p.model} strays to ${r.X}, ${r.Z}`);
      if (prev) vmax = Math.max(vmax, Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.2);
      prev = r;
    }
    assert.ok(vmax < 1.4, `${p.model} speed ${vmax}`);
  }
});

test('the dogs and cats answer the visitor by degrees', () => {
  for (const a of of('dog', 'cat_tabby', 'cat_orange')) {
    const x = a.groups[1][0], z = a.groups[1][2], awayR = run(a, 5, [x + 40, 1.6, z]), nearR = run(a, 5, [x + 2, 1.6, z]);
    assert.notDeepEqual(awayR, nearR, `${a.model} notices a visitor at 2 m`);
  }
});
