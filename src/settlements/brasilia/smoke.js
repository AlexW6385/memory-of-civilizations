// Brasília about 1970 — smoke and steam (docs/settlements/brasilia.md §10): no chimneys in the modern city; the steam of the coffee
// counters of the commercial strip, the wood fires of the candangos' camp at the edge of the plateau (cooking on the ground),
// the bus-stop's exhaust is not drawn. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { SHOPS, RADIUS, KIOSKS, CARTS, CHAPEL, inBuilding } from './layout.js';

const ID = 'brasilia';
export function emitters() {
  const E = [];
  for (let z = SHOPS[1] + 9; z < SHOPS[3]; z += 29) E.push({ p: [SHOPS[0] + 1.6, 3.2, z], kind: 'steam', thr: 0.1 + (z % 7) / 20, seed: Math.round(z) });
  // the kiosks' coffee urns and the vendors' carts (the popcorn kettle, the churros' fryer)
  KIOSKS.forEach(([x, z, , kind], i) => { if (kind === 'lanchonete' && !inBuilding(x, z, 2)) E.push({ p: [x + 0.3, 2.6, z], kind: 'steam', thr: 0.15 + (i % 4) / 20, seed: 300 + i }); });
  CARTS.forEach(([x, z, kind], i) => { if ((kind === 'pipoca' || kind === 'churro') && !inBuilding(x, z, 1.5)) E.push({ p: [x, 1.4, z], kind: 'steam', thr: 0.12, seed: 400 + i }); });
  // the camp of the candangos beyond the ministries, west: three cooking fires
  for (const [x, z, s] of [[-482, 60, 11], [-478, 70, 12], [-486, 66, 13]]) E.push({ p: [x, 0.6, z], kind: 'kitchen', thr: 0.1, seed: s });
  return E;
}
const ATT = [];
registerSystem({
  attach(site, world) {
    if (site.id !== ID) return;
    const smoke = new Smoke(emitters(), { name: 'smoke:' + ID });
    site.group.add(smoke.mesh);
    const rec = { site, smoke, ready: false };
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
      const { site, smoke, ready } = ATT[i];
      if (site.state !== 'ready' || !site.group.visible || !ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const meals = Math.max(bump(h, 7, 1.2, 0.8), bump(h, 12.5, 1.2, 1), bump(h, 18.5, 1.4, 0.9));
      smoke.setLevels(Math.min(1, meals + 0.05), 0, h > 6 && h < 19 ? 0.9 : 0.2, 0, h < 12 ? 0 : 1);
    }
  },
});
