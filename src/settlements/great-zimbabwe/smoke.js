// Great Zimbabwe — smoke (docs/settlements/great-zimbabwe.md §15): the hearths of the homesteads' houses at the morning
// and evening meals, the smoke leaving through the thatch (a central hearth; Herald), from about a third of the houses.
// The engine part is src/engine/smoke.js (one draw call); the places come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, compounds } from './layout.js';
import { courtAt } from './life.js';

const ID = 'great-zimbabwe';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1350);
  for (const k of compounds()) for (const h of k.huts) {
    if (r() > 0.45) continue;
    // the thatch's apex: the wall 0.2 + h 2.1 − 0.15, then 1.3 r of cone
    E.push({ p: [h.c[0], h.y + 2.15 + h.r * 1.3 + 0.1, h.c[1]], kind: 'kitchen', thr: 0.15 + 0.8 * r(), seed: k.seed + 1 });
  }
  // the smith's forge in the second Valley court (the pole shed's thatch apex 3.7 m up), lit at every hour of work
  { const f = courtAt(1); E.push({ p: [f.at[0], f.y + 3.9, f.at[1]], kind: 'kitchen', thr: 0.02, seed: 777 }); }
  return E;
}

const ATT = [];
registerSystem({
  attach(site, world) {
    if (site.id !== ID) return;
    const smoke = new Smoke(emitters(), { name: 'smoke:' + ID });
    site.group.add(smoke.mesh);
    const rec = { site, smoke, ready: false, meal: -1 };
    site._smoke = rec; ATT.push(rec);
    Promise.resolve(world.r.precompile?.(smoke.mesh)).then(() => { rec.ready = true; });
  },
  detach(site) {
    const i = ATT.findIndex((r) => r.site === site);
    if (i < 0) return;
    ATT[i].smoke.dispose(); ATT.splice(i, 1); site._smoke = null;
  },
  update(dt, camera) {
    for (let i = 0; i < ATT.length; i++) {
      const r = ATT[i], { site, smoke } = r;
      if (site.state !== 'ready' || !site.group.visible || !r.ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.min(1, 0.12 + Math.max(bump(h, 6.3, 0.9, 0.85), bump(h, 12.5, 0.9, 0.4), bump(h, 18, 1.1, 0.9)));
      r.meal = h < 10 ? 0 : h < 15.5 ? 1 : 2;
      smoke.setLevels(kitchen, 0, 0, 0, r.meal);
    }
  },
});
