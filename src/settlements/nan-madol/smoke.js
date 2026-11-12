// Nan Madol — smoke (docs/settlements/nan-madol.md §6): the earth ovens (umu) of the cook-houses at the meals, steam from the
// kitchen islet's ovens. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { cooks, ISLET, RADIUS, village } from './layout.js';

const ID = 'nan-madol';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1300), F = (k) => { const c = Math.cos(k.yaw), s = Math.sin(k.yaw); return [k.c[0] + 0 * c, k.c[1] - 0 * s]; };
  for (const k of cooks()) { const p = F(k); E.push({ p: [p[0], 0.5, p[1]], kind: k.islet === 'n3' ? 'steam' : 'kitchen', thr: 0.05 + 0.6 * r(), seed: Math.floor(k.seed % 997) }); }
  // the long cook-shed's ovens (steam by day), the oil works' fire under its pot, the shipyard's small fire for softening the hull's sides
  for (const k of village().works) {
    const W = (u, v) => [k.c[0] + u * Math.cos(k.yaw) + v * Math.sin(k.yaw), k.c[1] - u * Math.sin(k.yaw) + v * Math.cos(k.yaw)];
    if (k.kind === 'cookshed') { const n = Math.max(3, Math.floor(k.l / 4)); for (let i = 0; i < n; i++) { const p = W(-k.l / 2 + (i + 0.5) * k.l / n, 0); E.push({ p: [p[0], 0.5, p[1]], kind: i % 2 ? 'steam' : 'kitchen', thr: 0.05 + 0.5 * r(), seed: 7000 + i }); } }
    else if (k.kind === 'oilworks') { const p = W(0, -k.w / 2 + 1.0); E.push({ p: [p[0], 0.6, p[1]], kind: 'kitchen', thr: 0.2, seed: 7100 }); }
    else if (k.kind === 'shipyard') { const p = W(k.l / 2 - 1.2, k.w / 2 + 1.0); E.push({ p: [p[0], 0.4, p[1]], kind: 'kitchen', thr: 0.4, seed: 7200 }); }
  }
  void ISLET;
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
      const meals = Math.max(bump(h, 6.5, 0.9, 0.8), bump(h, 12.5, 1.0, 0.5), bump(h, 18.0, 1.1, 0.9));
      smoke.setLevels(Math.min(1, day * 0.2 + meals), 0, day * 0.6, 0, h < 9 ? 0 : h < 15 ? 1 : 2);
    }
  },
});
