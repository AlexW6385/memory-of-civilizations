// Lhasa — smoke, steam and mist (docs/settlements/lhasa.md §14): juniper smouldering in the urns (sang-khun)
// on the roofs of Shöl at dawn and dusk and in the incense burners (sangkhang) by the street and the outer
// pillar all day, kitchen smoke from the houses at the morning tea and the evening meal, steam from the tea
// houses' stoves by day, a mist over the pond at dawn. The engine part is src/engine/smoke.js (one draw
// call); this places the emitters from the layout. Positions in the settlement's frame.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, shops, POND, RADIUS, SHOL, inRect } from './layout.js';
import { SANG } from './town.js';

const ID = 'lhasa';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], rand = rng(1694);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect;
    if (!inRect(SHOL, (x0 + x1) / 2, (z0 + z1) / 2)) { if (rand() < 0.35) E.push({ p: [(x0 + x1) / 2, 7.2, (z0 + z1) / 2], kind: 'kitchen', seed: l.seed + 1 }); continue; }
    if (rand() < 0.5) E.push({ p: [(x0 + x1) / 2 + (rand() - 0.5) * 2, 7.2, z0 + (z1 - z0) * 0.3], kind: 'kitchen', seed: l.seed + 1 });
    // the juniper urn on the roof (the house's sang-khun, by its courtyard end)
    if (rand() < 0.45) E.push({ p: [x1 - 1.6, 7.0, z1 - 2.1], kind: 'incense', seed: l.seed + 3 });
  }
  for (const s of shops()) {
    if (s.kind === 'tea') { const [x0, z0, x1, z1] = s.rect; E.push({ p: [(x0 + x1) / 2, 6.1, z0 + (z1 - z0) * 0.75], kind: 'steam', thr: 0.05, seed: s.seed + 2 }); }
    else if (s.kind === 'trade' && rand() < 0.3) { const [x0, z0, x1, z1] = s.rect; E.push({ p: [x1 - 1.4, 5.7, z1 - 1.8], kind: 'incense', seed: s.seed + 3 }); }
  }
  E.push({ p: [SANG[0], 1.8, SANG[1]], kind: 'incense', thr: 0, seed: 11 });
  E.push({ p: [-10.5, 1.8, 234], kind: 'incense', thr: 0, seed: 12 });
  for (let k = 0; k < 6; k++) E.push({ p: [POND.c[0] - 50 + k * 20, POND.level + 0.45, POND.c[1] + ((k % 2) - 0.5) * 18], kind: 'mist', thr: 0, seed: 300 + k });
  void RADIUS;
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
      const kitchen = Math.max(bump(h, 7.4, 0.9, 0.6), bump(h, 12.5, 0.8, 0.4), bump(h, 18.4, 1.0, 0.8));
      const incense = 0.5 + 0.5 * Math.max(bump(h, 6.8, 1.2, 1), bump(h, 18.2, 1.2, 0.8));
      const steam = Math.min(1, Math.max(0, (h - 6.5) / 1.4)) * Math.min(1, Math.max(0, (20.5 - h) / 1.5)) * 0.9;
      const mist = bump(h, 6.0, 1.4, 0.8);
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, steam, mist, r.meal);
    }
  },
});
