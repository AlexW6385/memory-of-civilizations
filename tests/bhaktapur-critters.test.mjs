// Bhaktapur's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/bhaktapur.md §17): the pigeons of Taumadhi on the brick (never on a
// temple's footprint or in a house), the cats on the pidhas (their seat's height), the dogs and goats that lie down far from the visitor and stand when he comes,
// the hens before a dwelling, and the new goat model on the dog's rig.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data, { CRITTER_CAT, CRITTER_DOG } from '../src/settlements/bhaktapur/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';
import { KEEP, inRect, inLot } from '../src/settlements/bhaktapur/layout.js';

const inst = expandCritters(data.critters, { id: 'bhaktapur' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const near = (i) => [i.groups[1][0] + 1.5, 1.6, i.groups[1][2]];
const of = (re) => inst.filter((i) => re.test(i.model));
const trace = (i, cam = far(i), dt = 0.5, T = 300) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };

test('the instances: every model is known, the count is small, the goat is a small model', () => {
  assert.ok(inst.length >= 20 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const k of ['goat_black', 'goat_white']) { const m = MODELS[k](); assert.ok(m.tris > 300 && m.tris < 1500, `${k} ${m.tris}`); }
  assert.equal(CRITTER_CAT.size, of(/^cat/).length);
  assert.equal(CRITTER_DOG.size, of(/^dog$/).length);
});

test('pigeons: on the brick, clear of the temples and the houses, a walker\'s pace', () => {
  const pg = of(/^pigeon/);
  assert.ok(pg.length >= 12);
  for (const p of pg) for (const s of trace(p, far(p), 2)) {
    assert.ok(!KEEP.some((k) => inRect(k, s.r.X, s.r.Z, 0)) && !inLot(s.r.X, s.r.Z, 0), `pigeon at ${s.r.X.toFixed(1)}, ${s.r.Z.toFixed(1)}`);
    assert.ok(Math.abs(s.r.Y - 0.05) < 0.02);
  }
});

test('cats on the seat of a pidha (0.46 m), dogs and goats lying far off and standing near', () => {
  for (const c of of(/^cat/)) assert.ok(Math.abs(c.groups[1][1] - 0.46) < 1e-6);
  for (const d of [...of(/^dog$/), ...of(/^goat/)]) {
    const lie = run(d, 10, far(d)), stand = run(d, 10, near(d));
    assert.ok(stand.Y - lie.Y > 0.15, `${d.model} stands up for the visitor (${lie.Y} → ${stand.Y})`);
  }
});

test('hens stay near their door', () => {
  for (const h of of(/^(hen|rooster)/)) {
    const [x0, , z0] = h.groups[1];
    for (const s of trace(h, far(h), 1)) assert.ok(Math.hypot(s.r.X - x0, s.r.Z - z0) < 5, `hen strays to ${s.r.X}, ${s.r.Z}`);
  }
});
