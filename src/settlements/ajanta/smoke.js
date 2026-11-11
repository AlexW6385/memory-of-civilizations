// Ajanta — smoke (docs/settlements/ajanta.md): hearth smoke from the village's thatch at the meals, incense and oil lamps
// in the sanctum of Cave 1 and at the stupa of Cave 19. The engine part is src/engine/smoke.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, EAST, XF, FLOOR, C1, C19, rng } from './layout.js';
import { lots } from './town.js';

const ID = 'ajanta';
export function emitters() {
  const E = [], r = rng(480);
  for (const l of lots()) {
    if (r() > 0.5) continue;
    const [x0, z0, x1, z1] = l.rect, u = 0.3 + 0.4 * r(), v = 0.3 + 0.4 * r();
    E.push({ p: [x0 + (x1 - x0) * u, EAST + 3.7, z0 + (z1 - z0) * v], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: Math.round(x0 * 3 + z0) });
  }
  E.push({ p: [XF - 27.1, FLOOR[1] + 1.2, C1.z], kind: 'incense', thr: 0.0, seed: 31 });
  E.push({ p: [XF - 12.6, FLOOR[1] + 0.6, C19.z + 0.5], kind: 'incense', thr: 0.2, seed: 32 });
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
      const day = Math.min(1, Math.max(0, (h - 5.5) / 1.5)) * Math.min(1, Math.max(0, (20.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.5, 0.9, 0.8), bump(h, 12.0, 0.9, 0.4), bump(h, 18.5, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.15 + meals);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, day * 0.7, 0, 0, r.meal);
    }
  },
});
