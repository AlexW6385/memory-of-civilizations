// Every built settlement's plans against tests/planet.test.mjs test 6, reporting all faults (the test stops at
// the first): unknown materials, non-finite vertices, geometry reaching beyond 1.42 × radius, rooms without music.
// usage: node tools/disc-check.mjs [id …]
import { SITES } from '../src/planet/sites.js';
import { buildPlan } from '../src/core/build.js';
const { MODULES } = await import('../src/settlements/grounds.js');
const { MATERIALS } = await import('../src/core/palette.js');
const ONLY = process.argv.slice(2);
let n = 0;
for (const S of SITES.filter((s) => MODULES[s.id] && !s.legacy && (!ONLY.length || ONLY.includes(s.id)))) {
  const mod = await MODULES[S.id](), bad = new Set();
  for (const plan of [...mod.landmarks.map((l) => l.plan), ...(await mod.town())]) {
    for (const { mat, geometry } of buildPlan(plan).parts) {
      if (!MATERIALS[mat]) bad.add(`${plan.id}: unknown material ${mat}`);
      if (!geometry.attributes.position.array.every(Number.isFinite)) bad.add(`${plan.id}: non-finite vertex`);
      geometry.computeBoundingBox(); const b = geometry.boundingBox;
      for (const [x, z] of [[b.min.x, b.min.z], [b.max.x, b.min.z], [b.min.x, b.max.z], [b.max.x, b.max.z]])
        if (Math.hypot(x, z) >= S.radius * 1.42) { bad.add(`${plan.id}: ${mat} reaches (${x.toFixed(0)}, ${z.toFixed(0)})`); break; }
    }
  }
  for (const l of mod.landmarks) for (const r of l.plan.rooms) if (!l.music.zones[r.kind]) bad.add(`${l.plan.id}: room kind ${r.kind} has no music`);
  if (bad.size) { n++; console.log(S.id, [...bad].slice(0, 6).join(' | ')); }
}
console.log('done', n);
