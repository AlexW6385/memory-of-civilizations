// A Dogon village — smoke (docs/settlements/dogon.md §10): the cooking fires of the compounds at the meals, the smoke of the kitchens
// rising from the flat roofs, the opened ginna's own fire and kitchen. The engine part is src/engine/smoke.js; positions from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { COMPOUNDS, LANDMARK, RADIUS } from './layout.js';
import { ginnaOf } from '../../styles/dogon/compound.js';

const ID = 'dogon';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1930);
  for (const c of COMPOUNDS) {
    if (c.landmark) {
      // the opened ginna's kitchen hatch (compound.js house(): kitchen at ix0 + 5.45, hz0 − 1.55, roof at y + 2.25)
      const hz1 = c.rect[3] - 0.2, hz0 = hz1 - 5.4, ix0 = c.rect[0] + 0.95;
      E.push({ p: [ix0 + 5.45, c.y + 2.9, hz0 - 1.55], kind: 'kitchen', thr: 0, seed: 7 });
      continue;
    }
    if (r() > 0.55) continue;
    const g = ginnaOf(c), [x0, z0, x1, z1] = g.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + 0.4 * r()), c.y + g.H + 0.8, z0 + (z1 - z0) * 0.3], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: c.seed % 997 });
  }
  void LANDMARK;
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
      const meals = Math.max(bump(h, 6.5, 0.9, 0.8), bump(h, 12.5, 0.9, 0.5), bump(h, 18.5, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.15 + meals);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, day * 0.3, 0, r.meal);
    }
  },
});
