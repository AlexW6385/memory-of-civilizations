#!/usr/bin/env node
// Static geometry budget (DESIGN §8): every settlement built in Node exactly as the viewer builds
// it, and counted — vertices held (merged meshes and instance prototypes), instances, the triangles
// drawn if everything were in view, the meshes (plan × material, plus one per instanced prototype),
// the vertex data on the GPU, and the main-thread build time.
//
// Headless Chromium draws WebGPU in software, so frame rates measured there mean nothing; these
// counts are exact and are what memory and upload depend on. Real frame times: `?bench` on the
// author's machine (src/engine/bench.js).
//
// usage: node tools/geo-budget.mjs [--sites edfu,paris] [--json out.json] [--strict]
// --strict fails (exit 1) when a settlement exceeds the limits below.

import { writeFile } from 'node:fs/promises';
import { MODULES } from '../src/settlements/grounds.js';
import { buildPlan } from '../src/core/build.js';
import { LIFE_MIN } from '../src/engine/life-instances.js';

/** Per settlement, everything resident (near and far tiles both). */
export const LIMITS = { gpuMB: 45, meshes: 1500 };

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);

/** Count one built plan (the output of buildPlan). */
export function countBuilt(b, life = null) {
  const c = { verts: 0, tris: 0, meshes: 0, instances: 0, protoVerts: 0, bytes: 0 };
  for (const p of b.parts) {
    const g = p.geometry, n = g.attributes.position.count;
    const idx = g.index ? g.index.count : n;
    c.meshes++; c.verts += n; c.tris += idx / 3;
    c.bytes += n * 24 + (g.index ? g.index.array.byteLength : 0);
  }
  for (const p of b.instanced || []) {
    const g = p.geometry, n = g.attributes.position.count, idx = g.index ? g.index.count : n, k = p.matrices.length / 16;
    // the life of the streets is gathered settlement-wide (src/engine/life-instances.js): counted
    // per shape at the end (measureSite)
    if (life) { const e = life.get(p.key) || life.set(p.key, { n: 0, v: n, idx, colors: !!p.colors, bytes: n * 24 + (g.index ? g.index.array.byteLength : 0) }).get(p.key); e.n += k; continue; }
    c.meshes++; c.protoVerts += n; c.bytes += n * 24 + (g.index ? g.index.array.byteLength : 0);
    c.instances += k; c.tris += (idx / 3) * k; c.bytes += k * (64 + (p.colors ? 12 : 0));
  }
  return c;
}

export async function measureSite(id) {
  const mod = await MODULES[id]();
  const town = await mod.town();
  const plans = [...mod.landmarks.map((p) => p.plan), ...town];
  const life = new Map();
  const S = { id, plans: plans.length, verts: 0, protoVerts: 0, instances: 0, tris: 0, meshes: 0, bytes: 0, ms: 0 };
  for (const plan of plans) {
    const t0 = performance.now();
    const b = buildPlan(plan, { instancing: true, detail: true });
    S.ms += performance.now() - t0;
    const c = countBuilt(b, plan.style === 'life' ? life : null);
    for (const k of ['verts', 'protoVerts', 'instances', 'tris', 'meshes', 'bytes']) S[k] += c[k];
  }
  // life: shapes of LIFE_MIN copies or more are one instanced mesh each; rarer ones are merged into
  // their tiles' meshes, indexed (vertices and indices as copies; their tiles' meshes are already counted)
  for (const e of life.values()) {
    S.tris += (e.idx / 3) * e.n;
    if (e.n >= LIFE_MIN) { S.meshes += 2; S.protoVerts += e.v; S.instances += e.n; S.bytes += e.bytes + e.n * (64 + (e.colors ? 12 : 0)); }
    else { S.verts += e.v * e.n; S.bytes += e.n * (e.v * 24 + e.idx * 4); }
  }
  return S;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ids = opt('sites') ? opt('sites').split(',') : Object.keys(MODULES);
  const rows = [];
  let over = false;
  const T = { verts: 0, protoVerts: 0, instances: 0, tris: 0, meshes: 0, bytes: 0, ms: 0 };
  console.log('site                 plans  verts(M) protoV(k)  inst(k)  tris(M)  meshes  gpuMB  build ms');
  for (const id of ids) {
    const S = await measureSite(id);
    rows.push(S);
    for (const k of Object.keys(T)) T[k] += S[k];
    const mb = S.bytes / 1e6;
    const bad = mb > LIMITS.gpuMB || S.meshes > LIMITS.meshes;
    if (bad) over = true;
    console.log(`${id.padEnd(20)} ${String(S.plans).padStart(5)} ${(S.verts / 1e6).toFixed(2).padStart(9)} ${(S.protoVerts / 1e3).toFixed(0).padStart(9)} ${(S.instances / 1e3).toFixed(1).padStart(8)} ${(S.tris / 1e6).toFixed(2).padStart(8)} ${String(S.meshes).padStart(7)} ${mb.toFixed(0).padStart(6)} ${S.ms.toFixed(0).padStart(9)}${bad ? '  OVER' : ''}`);
  }
  console.log(`${'total'.padEnd(20)} ${''.padStart(5)} ${(T.verts / 1e6).toFixed(2).padStart(9)} ${(T.protoVerts / 1e3).toFixed(0).padStart(9)} ${(T.instances / 1e3).toFixed(1).padStart(8)} ${(T.tris / 1e6).toFixed(2).padStart(8)} ${String(T.meshes).padStart(7)} ${(T.bytes / 1e6).toFixed(0).padStart(6)} ${T.ms.toFixed(0).padStart(9)}`);
  if (opt('json')) await writeFile(opt('json'), JSON.stringify(rows, null, 1));
  process.exit(flag('strict') && over ? 1 : 0);
}
