// Nasrid Granada — smoke and steam (docs/settlements/granada.md §13): kitchen smoke from a scattered share of the Albaicín's,
// the medina's and the south town's houses at the three meals, the hammam's furnace all day (its stack and its steam from the
// vaults), incense at the Great Mosque by day. The engine part is src/engine/smoke.js. Positions in the settlement's frame.
// The coordinator registers this system in src/engine/systems-list.js.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, SITES, siteY } from './layout.js';

const ID = 'granada';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function emitters() {
  const E = [], rand = rng(1391);
  for (const l of lots()) {
    if (rand() > 0.3) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + rand() * 0.4), l.y + (l.storeys > 1 ? 6.2 : 4.0) + 0.9, z0 + (z1 - z0) * (0.3 + rand() * 0.4)], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the hammam: the furnace's stack (x1 − 1.6, z0 − 1.6 above the roof) and steam rising from the vaults
  const h = SITES.hammam.rect, y = siteY('hammam');
  E.push({ p: [h[2] - 1.6, y + 7.9, h[1] - 1.6], kind: 'kitchen', thr: 0, seed: 71 });
  E.push({ p: [(h[0] + h[2]) / 2 + 1.6, y + 5.9, (h[1] + h[3]) / 2], kind: 'steam', thr: 0, seed: 72 });
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
      const kitchen = Math.max(bump(h, 7.0, 0.8, 0.6), bump(h, 13.2, 0.9, 0.7), bump(h, 19.2, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 6) / 1.5)) * Math.min(1, Math.max(0, (21 - h) / 1.5)) * 0.9;
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
