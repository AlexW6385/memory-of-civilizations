// Shibam — smoke (docs/settlements/shibam.md §8): the kitchens of the houses' middle floors at the meals, a thin plume from the roof terraces of
// some houses, incense from the mosque's court at the calls. Engine part src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, heightOf } from './layout.js';

const ID = 'shibam';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1700);
  for (const l of lots()) {
    if (r() > 0.22) continue;
    const [x0, z0, x1, z1] = l.rect, x = x0 + (x1 - x0) * (0.3 + 0.4 * r()), z = z0 + (z1 - z0) * (0.3 + 0.4 * r());
    E.push({ p: [x, heightOf(l) + 1.0, z], kind: 'kitchen', thr: 0.2 + 0.7 * r(), seed: l.seed % 1000 });
  }
  E.push({ p: [-40, 0.8, -12], kind: 'incense', thr: 0.1, seed: 21 });
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
      const day = Math.min(1, Math.max(0, (h - 4.8) / 1.5)) * Math.min(1, Math.max(0, (19.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.0, 0.9, 0.7), bump(h, 12.5, 0.9, 0.5), bump(h, 18.0, 1.0, 0.8));
      const kitchen = Math.min(1, day * 0.3 + meals);
      const incense = 0.3 + 0.7 * Math.max(bump(h, 12.0, 1.0, 1), bump(h, 15.5, 1.0, 0.8));
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.6, 0, r.meal);
    }
  },
});
