// Angkor — smoke (docs/settlements/angkor.md §18): kitchen smoke seeping through the thatch of a share of
// the houses at the morning and evening meals, cooking fires and steam at the market by day, incense in
// the central sanctuary's porch. Registered by one line in src/engine/systems-list.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { houses, stores, RADIUS, CX, T, MARKET } from './layout.js';

const ID = 'angkor';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const FRONT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
function emitters() {
  const E = [], rand = rng(1150);
  for (const h of houses()) {
    if (rand() > 0.5) continue;
    const [x0, z0, x1, z1] = h.rect, f = FRONT[h.front], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    // the hearth stands at the back of the house; the smoke finds its way out under the ridge (about 6 m up)
    E.push({ p: [cx - f[0] * (Math.abs(f[0]) ? (x1 - x0) * 0.2 : 0), 6.2, cz - f[1] * (Math.abs(f[1]) ? (z1 - z0) * 0.2 : 0)], kind: 'kitchen', thr: rand() * 0.4, seed: h.seed + 1 });
  }
  // cooking fires and a pot of steam at the market's edge
  const [x0, z0, x1, z1] = MARKET;
  for (let k = 0; k < 4; k++) E.push({ p: [x0 + 4 + k * 7.5, 1.3, z1 + 1.2], kind: k % 2 ? 'steam' : 'kitchen', thr: rand() * 0.3, seed: 300 + k });
  // incense before the image in the sanctuary (the western porch)
  E.push({ p: [CX - 3.2, T.bakan.y + 1.2, 0], kind: 'incense', thr: 0, seed: 7 });
  void stores;
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
      const kitchen = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 11.2, 0.8, 0.6), bump(h, 17.3, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.2)) * Math.min(1, Math.max(0, (12.5 - h) / 1.0)) * 0.9;
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
