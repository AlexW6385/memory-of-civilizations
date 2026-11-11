// Mycenae — smoke (docs/settlements/mycenae.md §5, §9): the cooking fires of the lower town's houses at the meals, the potters' kilns, the palace's hearth,
// the altar of the court. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, PALACE, PAL_Y } from './layout.js';
import { ground } from './ground.js';

const ID = 'mycenae';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1250);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, x = x0 + (x1 - x0) * (0.3 + 0.4 * r()), z = z0 + (z1 - z0) * (0.3 + 0.4 * r());
    if (l.kind === 'workshop') E.push({ p: [x, l.y + l.storeys * 2.7 + 1.2, z], kind: 'kitchen', thr: 0, seed: l.seed + 1 });
    else if (l.kind === 'house' && r() < 0.4) E.push({ p: [x, l.y + l.storeys * 2.7 + 1.0, z], kind: 'kitchen', thr: 0.3 + 0.6 * r(), seed: l.seed + 3 });
  }
  const M = PALACE.megaron;
  E.push({ p: [M.x0 + 6.4 + 0.9 + 3.7 + 0.9 + 6, PAL_Y + 7.6, M.ax], kind: 'incense', thr: 0, seed: 21 });
  E.push({ p: [43.5, PAL_Y + 0.8, 3], kind: 'incense', thr: 0.1, seed: 22 });
  void ground;
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
      const day = Math.min(1, Math.max(0, (h - 5) / 1.5)) * Math.min(1, Math.max(0, (20 - h) / 1.5));
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.4), bump(h, 18.5, 1.0, 0.8));
      const kitchen = Math.min(1, day * 0.5 + meals);
      const incense = 0.4 + 0.6 * Math.max(bump(h, 8, 1.4, 1), bump(h, 17.5, 1.4, 0.7));
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.8, 0, r.meal);
    }
  },
});
