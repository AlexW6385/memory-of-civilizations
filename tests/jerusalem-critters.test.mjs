// Jerusalem's critters (src/settlements/jerusalem/fauna.js, docs/settlements/jerusalem.md §12.4): the engine's rigged animals stepped through in Node:
// every model is known, the cats and dogs sit before shut shops (never an open one), the hens stay in the court of their own open house clear of the
// cistern, the oven and the stair, the doves feed on the Haram's paving.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/jerusalem/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { openHouses } from '../src/settlements/jerusalem/soundmap.js';
import { allColonnades, colKey, shopsOf, TRADES_OF } from '../src/settlements/jerusalem/shopline.js';
import { HARAM } from '../src/settlements/jerusalem/layout.js';

const inst = expandCritters(data.critters, { id: 'jerusalem' });
const vv = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => vv(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const at = (i) => run(i, 0, far(i));

test('the instances: every model is known and the count is small', () => {
  assert.ok(inst.length >= 25 && inst.length <= 100, `${inst.length} critters`);   // ceiling 45 -> 100: the settlement's herds and yard groups are critters too (src/settlements/herds-data.js, at most 56 per settlement)
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
});
test('cats and dogs lie before shut shops only, none before an open one, none in the portico walk', () => {
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog')];
  assert.ok(of('cat_tabby').length + of('cat_orange').length >= 6 && of('dog').length >= 2);
  const shops = [];
  for (const el of allColonnades()) for (const sh of shopsOf(el, TRADES_OF[colKey(el)])) shops.push({ el, sh });
  for (const p of pets) {
    const r = at(p), near = shops.map((q) => ({ ...q, d: Math.hypot(q.sh.door[0] - r.X, q.sh.door[1] - r.Z) })).sort((a, b) => a.d - b.d)[0];
    assert.ok(near.d < 2.6, `a ${p.model} at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is ${near.d.toFixed(1)} m from the nearest shop door`);
    assert.equal(near.sh.trade, null, 'the shop is shut');
    assert.ok(r.Y < near.el.y + 0.26 && r.Y > near.el.y - 0.1, `on the portico floor (${(near.el.y + 0.18).toFixed(2)}), not ${r.Y}`);   // (a dog lying sinks its root a hand's width)
    assert.ok(near.d > 0.9, 'off the doorway itself');
  }
});
test('the hens and the cock stay in the court of their own open house, off its cistern, oven, stair and door line', () => {
  const hens = [...of('hen_brown'), ...of('hen_white'), ...of('rooster')];
  assert.ok(hens.length >= 9 && hens.length % 3 === 0);
  const houses = openHouses();
  for (const h of hens) for (let t = 0; t < 300; t += 3) {
    const r = run(h, t, far(h)), home = houses.find((q) => r.X > q.rect[0] && r.X < q.rect[2] && r.Z > q.rect[1] && r.Z < q.rect[3]);
    assert.ok(home, `a hen at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is in no open house`);
    assert.equal(home.up, null, 'a house with a stair keeps no fowl');
    const [cx0, cz0, cx1, cz1] = home.rooms.court;
    assert.ok(r.X > cx0 + 0.5 && r.X < cx1 - 0.5 && r.Z > cz0 + 0.5 && r.Z < cz1 - 0.5, 'in the court');
    assert.ok(Math.hypot(r.X - (cx1 - 1.3), r.Z - (cz0 + 1.4)) > 0.75, 'not on the cistern head');
    assert.ok(Math.hypot(r.X - (cx1 - 0.85), r.Z - (cz1 - 0.95)) > 0.85, 'not in the oven');
  }
});
test('the doves feed on the Haram paving, near where they were set down', () => {
  const m = ['pigeon_grey', 'pigeon_white', 'pigeon_dark'];
  assert.ok(m.flatMap(of).length >= 9);
  for (const k of m) for (const i of of(k)) {
    const a = run(i, 0, far(i)), b = run(i, 300, far(i));
    assert.ok(a.X > HARAM.rect[0] && a.X < HARAM.rect[2] && a.Z > HARAM.rect[1] && a.Z < HARAM.rect[3]);
    assert.ok(Math.abs(a.Y - (HARAM.top + 0.04)) < 0.1);
    assert.ok(Math.hypot(b.X - a.X, b.Z - a.Z) < 6, k);
  }
});
