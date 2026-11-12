// Timurid Samarkand — smoke (docs/settlements/timurid-samarkand.md §11): kitchen smoke from a scattered share of the courtyard
// houses at the three meals (the tandoor and the hearth), steam from the tea kettles of the shops, incense at Gur-e Amir's
// portal all day. The engine part is src/engine/smoke.js; this registers the system and places the emitters from the
// layout. Emitter positions are in the settlement's frame (x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { houses, RADIUS, GUR, TAPCHANS } from './layout.js';

const ID = 'timurid-samarkand';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1420);
  for (const h of houses()) {
    if (rand() > 0.34) continue;
    const [x0, z0, x1, z1] = h.rect;
    // the kitchen at the back of the court's far wing, its smoke leaving by a hole in the flat roof (the roof at about 4.5 m)
    E.push({ p: [x0 + 2 + rand() * (x1 - x0 - 4), 5.2, z1 - 2], kind: 'kitchen', seed: h.seed + 1 });
  }
  // the charcoal under the kettles of the tea-houses' platforms
  for (const [x, z] of TAPCHANS) E.push({ p: [x + 0.7, 1.15, z + 0.3], kind: 'kitchen', thr: 0.05, seed: Math.floor(x * 5 + z) });
  E.push({ p: [(GUR.rect[0] + GUR.rect[2]) / 2 + 3, 1.0, GUR.rect[1] + 4], kind: 'incense', thr: 0, seed: 7 });
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
      const kitchen = Math.max(bump(h, 6.4, 0.8, 0.6), bump(h, 12.0, 0.8, 0.5), bump(h, 18.0, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.4)) * Math.min(1, Math.max(0, (20 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
