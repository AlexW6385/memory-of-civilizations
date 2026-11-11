// Mughal Agra about 1650 — smoke and steam (docs/settlements/mughal-agra.md §12): kitchen smoke (the chulha's, through the
// roof) from a share of the houses at the morning and evening meals, the sweetmakers' and cooks' fires and the
// tea and milk boilers of the bazaar's shops by day, incense at the tomb's platform. The engine part is
// src/engine/smoke.js; positions are in the settlement's frame. The coordinator registers this system.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { houses, RADIUS, PLINTH } from './layout.js';
import { frameOf } from '../../styles/mughal/townhouse.js';

const ID = 'mughal-agra';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function emitters() {
  const E = [], rand = rng(1653);
  for (const h of houses()) {
    const f = frameOf(h.rect, h.front), H = 3.5 + ((h.storeys ?? 2) - 1) * 3.1;
    if (h.shop && rand() < 0.25) {
      // the cook-shop's or milk-boiler's pot at the front of the verandah
      const [x, z] = f.pt((rand() - 0.5) * (f.W - 2), -1.2);
      E.push({ p: [x, 1.55, z], kind: 'steam', thr: rand() * 0.3, seed: h.seed + 2 }); continue;
    }
    if (rand() > 0.3) continue;
    // the kitchen at the back of the house on its roof; the smoke leaves through a vent in the parapet's corner
    const [x, z] = f.pt((rand() - 0.5) * (f.W - 2), -f.D + 0.9);
    E.push({ p: [x, (h.storeys && h.storeys < 3 ? H : 3.5 + 2 * 3.1) + 1.2, z], kind: 'kitchen', seed: h.seed + 1 });
  }
  // incense burning at the tomb's door (on the plinth)
  E.push({ p: [-3.5, PLINTH.y + 0.9, PLINTH.c[1] + 30.5], kind: 'incense', thr: 0, seed: 11 });
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
      const kitchen = Math.max(bump(h, 6.4, 0.8, 0.6), bump(h, 12.4, 0.8, 0.7), bump(h, 18.4, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.5) / 1.4)) * Math.min(1, Math.max(0, (21 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
