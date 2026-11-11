// Madurai about 1650 — smoke and steam (docs/settlements/madurai.md §13): kitchen smoke from a share of the
// houses at the three meals (leaving through the tiles near the ridge), the sweet-makers' cauldrons and
// fires by day, incense and camphor at the shrines' gopurams. The engine part is src/engine/smoke.js.
// Positions in the settlement's frame. The coordinator registers this system in src/engine/systems-list.js.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, lotMap, RADIUS, SUNDARA, MEENAKSHI } from './layout.js';

const ID = 'madurai';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function emitters() {
  const E = [], rand = rng(1655);
  for (const l of lots()) {
    if (l.kind === 'yard') continue;
    const { W, D, map } = lotMap(l);
    if (l.kind === 'shop' && l.trade === 'sweets') {
      const [x, z] = map(W - 0.8, 3.5);
      E.push({ p: [x, 1.65, z], kind: 'steam', thr: 0, seed: l.seed + 2 }); continue;
    }
    if (rand() > 0.3 || l.kind === 'court') continue;
    // the kitchen at the back of the house; the smoke leaves through the tiles near the ridge
    const [x, z] = map(W * (0.25 + rand() * 0.5), D * 0.62);
    E.push({ p: [x, (l.kind === 'hut' ? 3.4 : 5.4), z], kind: 'kitchen', seed: l.seed + 1 });
  }
  for (const r of [SUNDARA, MEENAKSHI]) E.push({ p: [r[2] - 6, 1.4, (r[1] + r[3]) / 2], kind: 'incense', thr: 0, seed: Math.floor(r[2]) });
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
      const kitchen = Math.max(bump(h, 6.2, 0.8, 0.6), bump(h, 12.2, 0.8, 0.7), bump(h, 18.8, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.5) / 1.4)) * Math.min(1, Math.max(0, (21 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
