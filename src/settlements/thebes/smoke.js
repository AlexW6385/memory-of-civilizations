// Thebes — smoke (docs/settlements/thebes.md §9): the bakers' ovens, the potters' kilns and the smiths' furnaces of the workshop street,
// the cooking fires of the houses at the meals, incense in the hall and before the gates, burnt in the morning. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, LAKE, lots as townLots } from './layout.js';
import { ground } from './ground.js';

const ID = 'thebes';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1250);
  for (const l of townLots()) {
    const [x0, z0, x1, z1] = l.rect, mx = (x0 + x1) / 2, y = ground.height(mx, (z0 + z1) / 2);
    if (l.trade === 'baker') { E.push({ p: [x0 + 1.3, y + 1.4, l.front === 'n' ? z0 + 2.5 : z1 - 2.5], kind: 'kitchen', thr: 0, seed: l.seed + 1 }, { p: [x0 + 3.3, y + 1.4, l.front === 'n' ? z0 + 2.5 : z1 - 2.5], kind: 'kitchen', thr: 0.1, seed: l.seed + 2 }); }
    else if (l.trade === 'potter') E.push({ p: [x1 - 2.4, y + 2.8, l.front === 'n' ? z0 + 3.6 : z1 - 3.6], kind: 'kitchen', thr: 0.15, seed: l.seed + 1 });
    else if (l.trade === 'smith') E.push({ p: [x0 + 1.9, y + 2.3, l.front === 'n' ? z0 + 2.7 : z1 - 2.7], kind: 'kitchen', thr: 0, seed: l.seed + 1 });
    else if (l.kind !== 'garden' && l.kind !== 'granary' && r() < 0.28) E.push({ p: [mx + (r() - 0.5) * 2, y + 3.4, (z0 + z1) / 2 + (r() - 0.5) * 3], kind: 'kitchen', thr: 0.3 + 0.6 * r(), seed: l.seed + 3 });
  }
  // incense: before the second pylon's gate, in the hall's nave, at the lake's stair, at the sanctuary's door
  for (const [x, z, thr] of [[-110, 0, 0], [-72, 0, 0], [-58, 0, 0.1], [-30, 0, 0.1], [36, 0, 0], [LAKE[0] + 3, (LAKE[1] + LAKE[3]) / 2, 0.2]]) E.push({ p: [x, 1.2, z], kind: 'incense', thr, seed: Math.round(x) });
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
      const day = Math.min(1, Math.max(0, (h - 4.8) / 1.5)) * Math.min(1, Math.max(0, (19.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.0, 0.9, 0.7), bump(h, 12.0, 0.9, 0.4), bump(h, 18.0, 1.0, 0.8));
      const kitchen = Math.min(1, day * 0.55 + meals);
      const incense = 0.4 + 0.6 * Math.max(bump(h, 7.5, 1.4, 1), bump(h, 17.0, 1.4, 0.7));
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.8, 0, r.meal);
    }
  },
});
