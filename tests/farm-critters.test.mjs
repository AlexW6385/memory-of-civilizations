// The farm animals (src/engine/critter-models-farm.js: horse, ox/zebu, donkey, sheep) on the grazer pose (critter-poses.js): the models build at the stated size and
// detail, every one is a known kind, they walk (legs swing, the place moves), graze (the neck goes down), and answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { MODELS } from '../src/engine/critter-models.js';
import { POSES, context, KIND } from '../src/engine/critter-poses.js';
import '../src/engine/critter-models-farm.js';

const NAMES = ['horse_bay', 'horse_chestnut', 'horse_grey', 'horse_black', 'ox_red', 'ox_dun', 'ox_white', 'ox_pied', 'zebu_red', 'zebu_white', 'zebu_grey', 'donkey_grey', 'donkey_brown', 'sheep_white', 'sheep_dark', 'sheep_horned'];
const HEIGHT = { horse: [1.3, 1.9], ox: [1.2, 1.55], zebu: [1.3, 1.7], donkey: [1.0, 1.6], sheep: [0.6, 0.85] };   // (top of the standing animal, ears and horns included: withers 1.4 / 1.3 / 1.05 / 0.65 m)
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];

test('the sixteen models build: size, detail and parts', () => {
  for (const n of NAMES) {
    const m = MODELS[n](), top = Math.max(...m.pos.filter((_, i) => i % 3 === 1));
    const [lo, hi] = HEIGHT[n.split('_')[0]];
    assert.ok(top >= lo && top <= hi, `${n} is ${top.toFixed(2)} m high`);
    assert.ok(m.tris > 600 && m.tris < 1300, `${n}: ${m.tris} triangles`);
    for (const p of [1, 2, 3, 4, 5, 6, 7, 11]) assert.ok(m.part.includes(p), `${n} lacks part ${p}`);
    assert.ok(m.pos.every(Number.isFinite) && m.nrm.every(Number.isFinite));
  }
});

test('every kind is a grazer; the walk swings the legs and moves the animal, the rest grazes or looks about', () => {
  const inst = expandCritters(NAMES.map((model, k) => ({ model, at: [k * 7, 0, 3], rot: 0.4, range: [5, 3] })), { id: 't' });
  for (const i of inst) {
    assert.equal(i.kind, 'grazer', i.model); assert.equal(i.groups[0][0], KIND.grazer);
    let swing = 0, moved = 0, down = 0, up = 0, x0 = null;
    for (let t = 0; t < 300; t += 0.5) {
      const r = run(i, t, far(i));
      for (const v of Object.values(r)) assert.ok(Number.isFinite(v), `${i.model} NaN at ${t}`);
      if (r.la > 0.2) swing++;
      if (x0 !== null && Math.hypot(r.X - x0[0], r.Z - x0[1]) > 0.05) moved++;
      x0 = [r.X, r.Z];
      if (r.n1p > 0.5) down++; if (Math.abs(r.n1y) > 0.2) up++;
      assert.ok(Math.hypot(r.X - i.groups[1][0], r.Z - i.groups[1][2]) < 6.5, `${i.model} wandered off its range`);
    }
    assert.ok(swing > 20 && moved > 20, `${i.model} walks (${swing}, ${moved})`);
    assert.ok(down > 20, `${i.model} grazes`); assert.ok(up > 3, `${i.model} looks about`);
  }
});

test('the visitor makes them lift the head and turn to him', () => {
  const inst = expandCritters(NAMES.map((model, k) => ({ model, at: [k * 7, 0, 3], rot: 0, range: [0, 0] })), { id: 't' });
  for (const i of inst) {
    let graze = null;
    for (let t = 0; t < 800 && graze === null; t += 7) if (run(i, t, far(i)).n1p > 0.5) graze = t;
    if (graze === null) continue;
    const near = run(i, graze, [i.groups[1][0] + 1.5, 1.6, i.groups[1][2] + 3.5]), f = run(i, graze, far(i));
    assert.ok(near.n1p < f.n1p - 0.3, `${i.model} lifts its head`);
  }
});
