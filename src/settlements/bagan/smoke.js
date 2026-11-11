// Pagan — smoke (docs/settlements/bagan.md §10): cooking fires of the stilt houses at the morning and evening meals (the smoke seeps through the thatch), the brick kilns
// of the brickworks, which smoke all day, and incense at the Ananda's porches. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, KILNS, ANANDA, RADIUS } from './layout.js';

const ID = 'bagan';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1200);
  for (const l of lots()) {
    if (r() > 0.4) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.35 + r() * 0.3), 4.4, z0 + (z1 - z0) * (0.35 + r() * 0.3)], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: l.seed % 1000 });
  }
  for (const [x, z] of KILNS) { E.push({ p: [x - 1.2, 2.7, z], kind: 'kitchen', thr: 0, seed: Math.round(x) }); E.push({ p: [x + 1.2, 2.7, z + 0.6], kind: 'kitchen', thr: 0.05, seed: Math.round(z) }); }
  for (const [dx, dz] of [[-50, 0], [50, 0], [0, -50], [0, 50]]) E.push({ p: [ANANDA.c[0] + dx, 1.9, ANANDA.c[1] + dz], kind: 'steam', thr: 0.1, seed: Math.round(dx + dz + 7) });
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 11.0, 0.9, 0.35), bump(h, 18.0, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.15 + meals);
      const steam = day * 0.5;
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, 0, r.meal);
    }
  },
});
