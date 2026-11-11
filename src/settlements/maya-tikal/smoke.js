// Classic Maya Tikal — smoke (docs/settlements/maya-tikal.md §10): kitchen smoke from the groups' kitchen houses at the meals (the
// hearth's smoke leaving through the thatch) and from a scatter of the other houses, copal incense burning on the temples'
// summits and before the shrines all day. The engine part is src/engine/smoke.js; positions come from layout.js and the plan.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, groups, T1, T2, NA, CA } from './layout.js';
import { ground } from './ground.js';

const ID = 'maya-tikal';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(750);
  for (const g of groups()) for (const h of g.houses) {
    if (h.kitchen || r() < 0.25) {
      const x = h.c[0], z = h.c[1];
      E.push({ p: [x, 0.42 + 3.6, z], kind: 'kitchen', thr: 0.2 + 0.6 * r(), seed: h.seed + 1 });
    }
  }
  E.push({ p: [T1.c[0] - T1.top[0] + 1.2, T1.H + 0.6, 2.4], kind: 'incense', thr: 0, seed: 31 });             // Temple I's terrace
  E.push({ p: [T2.c[0] + T2.top[0] - 1.2, T2.H + 0.6, -2.4], kind: 'incense', thr: 0, seed: 32 });            // Temple II's terrace
  E.push({ p: [-24, 0.9, -37.5 + 1.2], kind: 'incense', thr: 0, seed: 33 });                                // before the stelae of the North Acropolis
  E.push({ p: [24, 0.9, -37.5 + 1.2], kind: 'incense', thr: 0, seed: 34 });
  void NA; void CA; void ground;
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 12.0, 0.9, 0.35), bump(h, 18.0, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.12 + meals);
      const incense = 0.55 + 0.45 * Math.max(bump(h, 6.5, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
