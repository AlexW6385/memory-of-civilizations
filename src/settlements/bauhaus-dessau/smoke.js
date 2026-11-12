// Bauhaus Dessau — smoke (docs/settlements/bauhaus-dessau.md §8): coal smoke from the tenements' chimneys at the morning and evening fires, and the
// school's boiler chimney. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS } from './layout.js';
import { houseSpec } from '../../styles/bauhaus/tenement.js';

const ID = 'bauhaus-dessau';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1927);
  for (const l of lots()) {
    if (l.modern || l.roof === 'flat') continue;
    const sp = houseSpec(l);
    // a house burns coal in the stove of the shop or the kitchen; two chimneys, either or both in use
    for (const c of sp.chimneys) if (r() < 0.62) E.push({ p: [c.x, c.y + 0.4, c.z], kind: 'kitchen', thr: 0.1 + 0.8 * r(), seed: (l.seed + Math.floor(c.x)) % 1000 });
  }
  // the school's boiler chimney (central heating) behind the Prellerhaus, the Törten houses' stoves
  E.push({ p: [44, 17, 40], kind: 'kitchen', thr: 0, seed: 7 });
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
      const meals = Math.max(bump(h, 6.5, 1.0, 0.9), bump(h, 12.0, 0.9, 0.5), bump(h, 18.0, 1.2, 0.9));
      const kitchen = Math.min(1, 0.15 + meals);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, 0, 0, r.meal);
    }
  },
});
