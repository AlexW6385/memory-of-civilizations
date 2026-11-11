// Rapa Nui — smoke and steam (docs/settlements/rapa-nui.md §4e): the earth ovens (umu) steaming at the forecourts at
// the midday and evening meals, hearth smoke leaving by the thatch of some houses and the chief's long house.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, CHIEF, village, height } from './layout.js';

const ID = 'rapa-nui';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export function emitters() {
  const E = [], r = rng(1500), L2W = (h, u, v) => [h.c[0] + u * Math.cos(h.yaw) + v * Math.sin(h.yaw), h.c[1] - u * Math.sin(h.yaw) + v * Math.cos(h.yaw)];
  for (const h of village().houses) {
    if (h.chief) {
      const p = L2W(h, -3, 0); E.push({ p: [p[0], height(p[0], p[1]) + h.h + 0.5, p[1]], kind: 'kitchen', thr: 0, seed: 11 });
      const o = L2W(h, h.len * 0.16, -h.w / 2 - 3.75); E.push({ p: [o[0], height(o[0], o[1]) + 0.35, o[1]], kind: 'steam', thr: 0.1, seed: 12 });
      continue;
    }
    if (r() < 0.45) { const o = L2W(h, h.len * 0.3 * (h.seed % 2 ? -1 : 1), -h.w / 2 - 2.4); E.push({ p: [o[0], height(o[0], o[1]) + 0.35, o[1]], kind: 'steam', thr: r() * 0.6, seed: h.seed }); }
    if (r() < 0.3) { E.push({ p: [h.c[0], height(h.c[0], h.c[1]) + h.h + 0.4, h.c[1]], kind: 'kitchen', thr: 0.2 + 0.7 * r(), seed: h.seed + 1 }); }
  }
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
    for (const r of ATT) {
      const { site, smoke } = r;
      if (site.state !== 'ready' || !site.group.visible || !r.ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.min(1, 0.15 + Math.max(bump(h, 7, 1, 0.5), bump(h, 12.5, 1.2, 0.8), bump(h, 18, 1.2, 0.9)));
      const steam = Math.min(1, Math.max(bump(h, 12.5, 1.5, 0.95), bump(h, 18.3, 1.5, 0.95), 0.2));
      r.meal = h < 10 ? 0 : h < 15.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
