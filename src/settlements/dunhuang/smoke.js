// Dunhuang — smoke (docs/settlements/dunhuang.md): hearth smoke from the houses' roofs at the meals, the caravanserai's
// cooking, the monk's cell stove, incense in the great hall. The engine part is src/engine/smoke.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, SERAI, CAVES, XF, FLOOR, rng } from './layout.js';
import { lots } from './town.js';

const ID = 'dunhuang';
export function emitters() {
  const E = [], r = rng(850);
  for (const l of lots()) {
    if (r() > 0.45) continue;
    const [x0, z0, x1, z1] = l.rect, u = 0.3 + 0.4 * r(), v = 0.3 + 0.4 * r();
    E.push({ p: [x0 + (x1 - x0) * u, (l.rich ? 5.4 : l.two ? 7.2 : 4.4), z0 + (z1 - z0) * v], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: Math.round(x0 * 3 + z0) });
  }
  for (const k of [0, 1, 3]) E.push({ p: [SERAI.x0 + 6 + k * 6, 4.6, SERAI.z0 + 14 + k * 5], kind: 'kitchen', thr: 0.2, seed: 7 + k });
  const cell = CAVES.find((c) => c.kind === 'cell'); E.push({ p: [XF - 4, FLOOR[0] + 3.2, cell.z], kind: 'kitchen', thr: 0.1, seed: 3 });
  E.push({ p: [XF + 3, 1.6, 0], kind: 'steam', thr: 0.0, seed: 4 });
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
      smoke.setLevels(kitchen, 0, day * 0.5, 0, r.meal);
    }
  },
});
