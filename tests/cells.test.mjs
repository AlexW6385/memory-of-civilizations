// The cells and distance detail of merged meshes (src/engine/cells.js, merge.js): a settlement's
// plans merged as the viewer merges them keep every triangle and every copy, the cut cells cover
// their mesh exactly, and the shapes drawn by distance choose each copy once.

import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three/webgpu';
import { MODULES } from '../src/settlements/grounds.js';
import { buildPlan } from '../src/core/build.js';
import { markMergeable, mergeParts } from '../src/engine/merge.js';
import { coarse, trianglesByCell, subGeometry, LOD_NEAR, THIN_FAR, FINE_SHADOW } from '../src/engine/cells.js';

const make = (geometry, mat, matrices = new THREE.Matrix4().elements, colors = null) => {
  const n = matrices.length / 16, m = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial({ name: mat }), n);
  m.instanceMatrix.array.set(matrices);
  m.instanceColor = new THREE.InstancedBufferAttribute(colors ?? new Float32Array(n * 3).fill(1), 3);
  m.computeBoundingSphere();
  return m;
};
const tris = (m) => (m.geometry.index.count / 3) * m.count;

test('coarse pieces: fewer triangles, the same extent', () => {
  // a post: a 16-sided shaft with a head (a lathe), as the balustrades' are
  const g = new THREE.LatheGeometry([[0.12, 0], [0.12, 1.2], [0.15, 1.25], [0.15, 1.4], [0.06, 1.55], [0, 1.6]].map(([x, y]) => new THREE.Vector2(x, y)), 16);
  const c = coarse(g.attributes.position.array, g.attributes.normal.array, g.index.array);
  assert.ok(c && c.index.length < g.index.count * 0.6, 'saves triangles');
  const box = (P) => { const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]; for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], P[i + k]); b[k + 3] = Math.max(b[k + 3], P[i + k]); } return b; };
  const a = box(g.attributes.position.array), b = box(c.pos);
  for (let k = 0; k < 3; k++) assert.ok(b[k + 3] - b[k] > 0.6 * (a[k + 3] - a[k]), `keeps its extent on axis ${k}`);
});

test('cells: every triangle in exactly one cell', () => {
  const g = new THREE.PlaneGeometry(500, 500, 40, 40).rotateX(-Math.PI / 2);
  const I = g.index.array, P = g.attributes.position.array, cells = trianglesByCell(P, I);
  let n = 0;
  for (const { tri } of cells.values()) {
    const s = subGeometry([{ array: P, size: 3 }], I, tri);
    assert.equal(s.index.length, tri.length * 3);
    n += tri.length;
  }
  assert.equal(n, I.length / 3);
  assert.ok(cells.size >= 9);
});

test('a settlement merged: the same triangles and copies, chosen once each', async () => {
  const mod = await MODULES['qing-beijing']();
  const recs = [];
  let before = 0, copies = 0;
  for (const { plan } of mod.landmarks) {
    const b = buildPlan(plan, { instancing: true, detail: true });
    const group = new THREE.Group();
    for (const { mat, geometry, detail } of b.parts) { const m = make(geometry, mat); m.name = `${plan.id}:${mat}`; if (detail) m.userData.detail = true; group.add(m); if (!detail) before += tris(m); }
    for (const { mat, geometry, matrices, colors, detail } of b.instanced) { const m = make(geometry, mat, matrices, colors); m.name = `${plan.id}:${mat}:inst`; if (detail) m.userData.detail = true; group.add(m); if (!detail) { before += tris(m); copies += m.count; } }
    markMergeable(plan, group);
    recs.push({ group, plan });
  }
  const into = new THREE.Group(), lods = [];
  await mergeParts(recs, into, make, { castsShadow: () => true, lods });
  assert.ok(lods.some((L) => L.kind === 'fine') && lods.some((L) => L.kind === 'thin'), 'balustrades drawn by distance');
  // what is drawn with every copy in full: the triangles of before
  const inLod = new Set(lods.flatMap((L) => L.meshes));
  let after = 0, n = 0;
  for (const r of recs) for (const o of r.group.children) if (!o.userData.detail) { after += tris(o); if (o.isInstancedMesh && o.name.endsWith(':inst')) n += o.count; }
  for (const o of into.children) if (!inLod.has(o)) { after += tris(o); if (o.name.endsWith(':inst')) n += o.count; }
  for (const L of lods) { after += L.n * L.full.geometry.index.count / 3; n += L.n; }
  assert.equal(after, before);
  assert.equal(n, copies);
  // from the arrival: each copy of a fine shape near or far, never both; its shadow within reach
  const [x, y, z] = [0, 1.65, 70];
  for (const L of lods) {
    L.update(x, y, z);
    const d = (i) => Math.hypot(L.pos[i * 3] - x, L.pos[i * 3 + 1] - y, L.pos[i * 3 + 2] - z);
    let near = 0, far = 0, sh = 0;
    for (let i = 0; i < L.n; i++) { const e = d(i); if (e < (L.kind === 'thin' ? THIN_FAR : LOD_NEAR)) near++; else far++; if (e < FINE_SHADOW) sh++; }
    assert.equal(L.full.count, near);
    if (L.kind === 'fine') { assert.equal(L.far.count, far); assert.equal(L.shadow.count, sh); assert.ok(L.far.geometry.index.count < L.full.geometry.index.count); }
  }
});
