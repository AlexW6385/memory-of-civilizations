// Mongol Karakorum — smoke (docs/settlements/mongol-karakorum.md §6): the smoke of the hearths through the crown rings of the gers (above all at the meals), the kilns' and
// forges' smoke in the Cathayan quarter, the cook-fires of the courts. The engine part is src/engine/smoke.js; positions come from layout.js and the camps.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { KILNS, FORGES, LOTS, CAMPS, COURT_GER, RADIUS } from './layout.js';
import { campGers } from './camp.js';

const ID = 'mongol-karakorum';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1254);
  // the gers' crown rings (the ger: wall 1.4–1.8 m, crown about 0.3 r + 0.5 above; the smoke leaves at about 2.6–3.4 m)
  const ger = (c, rad, k) => E.push({ p: [c[0], 1.5 + rad * 0.3 + 0.5 + 0.9, c[1]], kind: 'kitchen', thr: 0.05 + 0.6 * r(), seed: k });
  CAMPS_E(ger);
  for (const l of LOTS) if (l.kind === 'open') { const [x0, z0, x1, z1] = l.rect; ger([x0 + 4.2, (z0 + z1) / 2], 3.0, Math.round(x0 + z0)); if (r() < 0.5) ger([x0 + 11.6, (z0 + z1) / 2], 3.0, Math.round(x0 * 3 + z0)); }
  E.push({ p: [COURT_GER.c[0], 1.8 + 1.3 + 0.5 + 0.9, COURT_GER.c[1]], kind: 'kitchen', thr: 0.0, seed: 3 });
  // the courts' cook-fires and ovens in the houses
  for (const l of LOTS) if (l.kind === 'house' && r() < 0.5) E.push({ p: [l.rect[0] + 1.6, 1.2, l.gate === 's' ? l.rect[3] - 1.6 : l.rect[1] + 1.6], kind: 'kitchen', thr: 0.1 + 0.6 * r(), seed: Math.round(l.rect[0]) });
  for (const [x, z] of KILNS) E.push({ p: [x - Math.sin(0) * 0, 4.5, z + 0.0], kind: 'kitchen', thr: 0.0, seed: Math.round(x) });
  for (const q of FORGES) E.push({ p: [q[0] + 1.3, 3.2, q[1] + 0.7], kind: 'kitchen', thr: 0.0, seed: Math.round(q[0]) });
  return E;
  function CAMPS_E(f) { for (const [i, c] of [CAMPS.sw, CAMPS.se].entries()) for (const g of campGers(c, i ? 4242 : 1254, i ? 8 : 9)) f(g.c, g.r, Math.round(g.c[0] * 5 + g.c[1])); }
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
      const meals = Math.max(bump(h, 6.5, 1.0, 0.8), bump(h, 12.5, 1.0, 0.4), bump(h, 18.5, 1.2, 0.9));
      const kitchen = Math.min(1, 0.35 + day * 0.15 + meals);       // the gers' fires burn all day: cold steppe
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, day * 0.3, 0, r.meal);
    }
  },
});
