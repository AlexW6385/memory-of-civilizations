// Cloth hung in the wind (src/core/geom.js hangFrom, src/engine/materials.js clothSway): the hang of
// each vertex survives the build (merged, welded, instanced), the merge across plans and the street
// life's gathering, and only cloth in the wind carries it.

import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three/webgpu';
import { buildPlan } from '../src/core/build.js';
import { GeoBag, clothBox, hangFrom, windMat, isWind, baseMat, depthRank, weld } from '../src/core/geom.js';
import { MATERIALS, albedo } from '../src/core/palette.js';
import { tint } from '../src/objects/kit.js';
import { markMergeable, mergeParts } from '../src/engine/merge.js';
import '../src/objects/index.js';

const plan = (elements) => ({ id: 't', style: 'life', origin: [0, 0], base: 0, yaw: 0, elements, rooms: [], bounds: [-50, -50, 50, 50], entrance: { at: [0, 0], facing: 'n' } });
const CLOTH = [
  { t: 'shop_sign', at: [0, 0], h: 2.9, len: 1.5 },
  { t: 'laundry', at: [5, 0], seed: 3 },
  { t: 'laundry_pole', at: [10, 0], y: 4, seed: 2 },
  { t: 'wash_line', at: [15, 0], y: 5, len: 4, seed: 1 },
  { t: 'wash_line', at: [20, 0], y: 5, len: 4, pole: true, seed: 2 },
];

const checkHang = (g, mat, where) => {
  const h = g.attributes.hang;
  if (!isWind(mat)) { assert.ok(!h, `${where}: ${mat} has no hang`); return 0; }
  assert.ok(h, `${where}: ${mat} has its hang`);
  assert.equal(h.count, g.attributes.position.count, `${where}: a hang per vertex`);
  assert.ok(h.array instanceof Float32Array && h.itemSize === 1);
  let lo = Infinity, hi = -Infinity;
  for (const v of h.array) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  assert.ok(lo >= 0 && hi > 0.01 && hi < 2.5, `${where}: ${mat} hangs ${lo}…${hi} m`);
  return 1;
};

test('hanging cloth keeps its hang through the build', () => {
  for (const opts of [{}, { instancing: true, detail: true }]) {
    for (const el of CLOTH) {
      const b = buildPlan(plan([el]), opts);
      let n = 0;
      for (const p of b.parts) n += checkHang(p.geometry, p.mat, `${el.t} part`);
      for (const p of b.instanced) n += checkHang(p.geometry, p.mat, `${el.t} instanced`);
      assert.ok(n > 0, `${el.t} has cloth in the wind`);
    }
  }
  // many of one: instanced (the street life), the family's one material in the wind, tinted
  const many = Array.from({ length: 20 }, (_, i) => ({ t: 'shop_sign', at: [i * 3, 0], cloth: i % 2 ? 'cloth_red' : 'cloth_indigo' }));
  const b = buildPlan(plan(many), { instancing: true, detail: true });
  const wind = b.instanced.filter((p) => isWind(p.mat));
  assert.ok(wind.length > 0 && wind.every((p) => p.mat === 'cloth_white+wind'), 'one material per family');
  for (const p of wind) checkHang(p.geometry, p.mat, 'sign');
});

test('the bag: hang merged, welded apart, dropped where it means nothing', () => {
  const bag = new GeoBag({ weld: true });
  bag.add('cloth_red+wind', hangFrom(clothBox(0, 0, 0, 0.02, 1, 0.5), 1));
  // the same corners hung otherwise are other vertices
  bag.add('cloth_red+wind', hangFrom(clothBox(0, 0, 0, 0.02, 1, 0.5), 2));
  bag.add('cloth_red', hangFrom(clothBox(1, 0, 0, 1.02, 1, 0.5), 1));
  const parts = bag.merged();
  const w = parts.find((p) => p.mat === 'cloth_red+wind'), s = parts.find((p) => p.mat === 'cloth_red');
  assert.ok(!s.geometry.attributes.hang);
  const H = w.geometry.attributes.hang.array, P = w.geometry.attributes.position.array;
  assert.equal(H.length, P.length / 3);
  const one = new Set(), two = new Set();
  for (let i = 0; i < H.length; i++) {
    const y = P[i * 3 + 1];
    const d1 = Math.abs(H[i] - (1 - y)), d2 = Math.abs(H[i] - (2 - y));
    assert.ok(Math.min(d1, d2) < 0.01, 'hang = top − y (the stand-off aside)');
    (d1 < d2 ? one : two).add(i);
  }
  assert.equal(one.size, two.size, 'both pieces kept whole');
  const { hang } = weld(new Float32Array([0, 0, 0, 0, 0, 0]), new Float32Array([0, 1, 0, 0, 1, 0]), new Float32Array([0.5, 0.7]));
  assert.equal(hang.length, 2);
});

test('the key in the wind is its cloth everywhere it is looked up', () => {
  assert.equal(windMat('cloth_indigo'), 'cloth_indigo+wind');
  assert.equal(windMat('cloth_indigo+wind'), 'cloth_indigo+wind');
  assert.equal(baseMat('cloth_indigo+wind'), 'cloth_indigo');
  assert.equal(MATERIALS['cloth_indigo+wind'], MATERIALS.cloth_indigo);
  assert.ok('cloth_indigo+wind' in MATERIALS && !Object.keys(MATERIALS).some(isWind));
  assert.deepEqual(albedo('cloth_indigo+wind'), albedo('cloth_indigo'));
  assert.equal(depthRank('cloth_indigo+wind'), depthRank('cloth_indigo'));
  const t = tint('cloth_indigo+wind'), u = tint('cloth_indigo');
  assert.equal(t.base, 'cloth_white+wind');
  assert.deepEqual(t.color, u.color);
});

test('merged across plans, the hang goes with the cloth', async () => {
  const make = (geometry, mat, matrices = new THREE.Matrix4().elements, colors = null) => {
    const n = matrices.length / 16, m = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial({ name: mat }), n);
    m.instanceMatrix.array.set(matrices);
    m.instanceColor = new THREE.InstancedBufferAttribute(colors ?? new Float32Array(n * 3).fill(1), 3);
    m.computeBoundingSphere();
    return m;
  };
  const recs = [];
  for (let k = 0; k < 3; k++) {
    // (a house's plan, not the street life, so that it is merged)
    const p = { ...plan(CLOTH.map((e) => ({ ...e, at: [e.at[0] + k * 30, 0] }))), id: `p${k}`, style: 'life_static' };
    const b = buildPlan({ ...p, style: 'life' }, { instancing: true, detail: true });
    const group = new THREE.Group();
    for (const { mat, geometry } of b.parts) { const m = make(geometry, mat); m.name = `${p.id}:${mat}`; group.add(m); }
    for (const { mat, geometry, matrices, colors } of b.instanced) { const m = make(geometry, mat, matrices, colors); m.name = `${p.id}:${mat}:inst`; group.add(m); }
    markMergeable(p, group);
    recs.push({ group, plan: p });
  }
  const into = new THREE.Group();
  await mergeParts(recs, into, make, { castsShadow: () => true });
  const all = [...into.children, ...recs.flatMap((r) => r.group.children.filter((o) => !o.userData.released))];
  let n = 0;
  for (const o of all) n += checkHang(o.geometry, o.material.name, o.name);
  assert.ok(n > 0);
});
