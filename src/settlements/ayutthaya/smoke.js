// Ayutthaya — smoke (docs/settlements/ayutthaya.md §9): kitchen smoke through the thatch of a share of the stilt houses at the morning and
// evening meals, cooking fires and steam at the floating market's edge by day, incense before the image in the royal wihan.
// Registered by one line in src/engine/systems-list.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, WIHAN, MARKET } from './layout.js';

const ID = 'ayutthaya';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function emitters() {
  const E = [], rand = rng(1687);
  for (const h of lots()) {
    if (h.row || rand() > 0.35) continue;
    const [x0, z0, x1, z1] = h.rect;
    E.push({ p: [(x0 + x1) / 2, 5.4, (z0 + z1) / 2], kind: 'kitchen', thr: rand() * 0.4, seed: h.seed + 1 });
  }
  // cooking fires and steam in boats at the market's edge
  for (let k = 0; k < 5; k++) E.push({ p: [MARKET[2] - 4, 0.4, MARKET[1] + 20 + k * 36], kind: k % 2 ? 'steam' : 'kitchen', thr: rand() * 0.3, seed: 300 + k });
  E.push({ p: [WIHAN[0] + 7, 2.4, (WIHAN[1] + WIHAN[3]) / 2], kind: 'incense', thr: 0, seed: 7 });
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
