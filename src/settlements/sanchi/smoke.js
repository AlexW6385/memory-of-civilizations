// Sanchi — smoke (docs/settlements/sanchi.md §12): the village's kitchen fires at the morning and evening meals, and incense burnt
// before the Great Stupa's south gateway and at Stupa 2. The engine part is src/engine/smoke.js (one draw call); positions
// come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, TOP, STUPA2, lots, height } from './layout.js';

const ID = 'sanchi';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(50);
  for (const l of lots()) {
    if (r() < 0.45) {
      const [x0, z0, x1, z1] = l.rect, x = x0 + (x1 - x0) * (0.3 + 0.4 * r()), z = z0 + (z1 - z0) * (0.3 + 0.4 * r());
      E.push({ p: [x, height(x, z) + 3.9, z], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 });
    }
  }
  E.push({ p: [-2.2, TOP + 0.5, 21], kind: 'incense', thr: 0, seed: 31 });
  E.push({ p: [2.2, TOP + 0.5, 21], kind: 'incense', thr: 0.2, seed: 32 });
  E.push({ p: [STUPA2.c[0] + 14, STUPA2.y + 0.5, 0], kind: 'incense', thr: 0.3, seed: 33 });
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
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.4), bump(h, 19.0, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.12 + meals);
      const incense = 0.5 + 0.5 * Math.max(bump(h, 6.5, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
