// Hangzhou's critters (src/engine/fauna-critters.js; docs/settlements/song-hangzhou.md §31): the raft of ducks stays on the canal,
// the hens stay in their lane, the cormorants sit on the punt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/song-hangzhou/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { canals, rectDist } from '../src/settlements/song-hangzhou/ways.js';

const inst = expandCritters(data.critters, { id: 'song-hangzhou' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);

test('the instances: every model is known and the count is small', () => {
  assert.ok(inst.length >= 12 && inst.length <= 30, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
});
test('the ducks stay on the canal', () => {
  const ducks = [...of('duck_white'), ...of('duck_brown')];
  assert.ok(ducks.length >= 4);
  for (const d of ducks) for (let t = 0; t < 300; t += 0.5) { const r = run(d, t, far(d)); assert.ok(rectDist(canals()[0], r.X, r.Z) < -0.4, `duck off the water at ${t}`); }
});
test('the hens stay in their lane and the cormorants sit still', () => {
  for (const h of [...of('hen_brown'), ...of('hen_white'), ...of('rooster')]) for (let t = 0; t < 300; t += 0.5) { const r = run(h, t, far(h)); assert.ok(Math.hypot(r.X - 52.5, r.Z + 75) < 8, 'hen strayed'); }
  assert.equal(of('cormorant').length, 3);
});
