// Ubirr — smoke (docs/settlements/kakadu.md §5): the two camp fires, small fires at the mouth of the hut and the lean-to, kept up against
// mosquitoes; thin by day, a little more at the evening meal. Engine part: src/engine/smoke.js; positions from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { CAMPS, RADIUS, height, shelterSpots } from './layout.js';

const ID = 'kakadu';
export function emitters() {
  const E = [];
  CAMPS.forEach((C, i) => {
    const [x, z] = C.fire;
    E.push({ p: [x, height(x, z) + 0.45, z], kind: 'kitchen', thr: 0.02, seed: 11 + i });
    if (C.turtle) E.push({ p: [x + 0.55, height(x, z) + 0.2, z + 0.2], kind: 'steam', thr: 0.1, seed: 21 + i });
  });
  shelterSpots().forEach(([kind, x, z], i) => { if (kind === 'hearth') E.push({ p: [x, height(x, z) + 0.45, z], kind: 'kitchen', thr: 0.05, seed: 41 + i }); });
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
      const meals = Math.max(bump(h, 7.0, 1.0, 0.5), bump(h, 18.0, 1.3, 0.9));
      smoke.setLevels(Math.min(1, 0.3 + day * 0.15 + meals), 0, day * 0.5, 0, h < 12 ? 0 : 2);
      r.meal = h < 12 ? 0 : 2;
    }
  },
});
