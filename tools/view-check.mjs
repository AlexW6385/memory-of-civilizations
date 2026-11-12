// Every built settlement against tests/planet.test.mjs test 7 (a free viewpoint within 50 m of the landmark's
// view box, facing it), reporting all faults at once. usage: node tools/view-check.mjs [id …]
import { SITES } from '../src/planet/sites.js';
import { buildPlan } from '../src/core/build.js';
const { MODULES, GROUNDS } = await import('../src/settlements/grounds.js');
const { CollisionWorld, topField } = await import('../src/core/collide.js');
const { viewpoint, standAt } = await import('../src/core/arrival.js');
const ONLY = process.argv.slice(2);
let n = 0;
for (const S of SITES.filter((s) => MODULES[s.id] && !s.legacy && (!ONLY.length || ONLY.includes(s.id)))) {
  const G = GROUNDS[S.id], mod = await MODULES[S.id](), C = new CollisionWorld();
  Object.assign(C, { terrain: G.height, water: G.water, waterLevel: G.waterLevel });
  for (const plan of [...mod.landmarks.map((l) => l.plan), ...(await mod.town())]) { const b = buildPlan(plan); b.colliders.tops = await topField(b.parts); C.add(b.colliders); }
  const plan = mod.landmarks[0].plan, b = plan.view || plan.bakeBounds;
  const v = viewpoint(C, b, 12, [0, 1], null, plan.viewY ?? null);
  let err = null;
  if (!v) err = 'no viewpoint';
  else {
    const d = Math.max(b[0] - v.x, v.x - b[2], b[1] - v.z, v.z - b[3]);
    const fx = -Math.sin(v.yaw), fz = -Math.cos(v.yaw), cx = (b[0] + b[2]) / 2 - v.x, cz = (b[1] + b[3]) / 2 - v.z;
    if (!(d > 0 && d < 50)) err = `viewpoint ${d.toFixed(1)} m from the box ${JSON.stringify(b)}`;
    else if (standAt(C, v.x, v.z) === null) err = 'viewpoint not free';
    else if ((fx * cx + fz * cz) / Math.hypot(cx, cz) <= 0.99) err = 'not facing';
  }
  if (err) { n++; console.log(S.id, err); }
}
console.log('done', n);
