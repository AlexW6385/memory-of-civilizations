// Ming–Qing Beijing — smoke and steam (docs/settlements/qing-beijing.md §19): coal and kitchen smoke
// from a share of the courtyard houses at the morning and evening meals (and for the kang's fire at
// dusk), steam from the tea and chestnut booths of the avenue by day, incense from the bronze
// burners on the terrace before the Hall of Supreme Harmony. The engine's kinds have one colour
// (grey): coal's darker smoke is wanted (see the report). Registered by one line in
// src/engine/systems-list.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { houses, RADIUS, TIERS } from './layout.js';
import { SHOP_SITES } from './shops.js';

const ID = 'qing-beijing';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1735);
  for (const h of houses()) {
    const [x0, z0, x1, z1] = h.rect, W = x1 - x0;
    // the kitchen chimney: a brick stack beside the main house's ridge (north side), and a second for the kang's stove at the east side house
    if (rand() < 0.5) E.push({ p: [x0 + W * (0.25 + rand() * 0.5), 0.6 + 3.4 + 1.9, z0 + 0.6 + 2.5], kind: 'kitchen', seed: h.seed + 1 });
    if (rand() < 0.22) E.push({ p: [x1 - 3, 4.1, z0 + 11], kind: 'kitchen', thr: 0.5 + rand() * 0.4, seed: h.seed + 2 });
  }
  for (const s of SHOP_SITES) {
    if (s.trade !== 'tea' && s.trade !== 'chestnut') continue;
    const c = Math.cos(s.rot), n = Math.sin(s.rot);
    E.push({ p: [s.at[0] + n * 1.2, s.trade === 'tea' ? 1.3 : 1.4, s.at[1] + c * 1.2], kind: s.trade === 'tea' ? 'steam' : 'kitchen', thr: rand() * 0.3, seed: s.seed });
  }
  // the bronze burners on the upper terrace before the Hall of Supreme Harmony
  const top = TIERS[2].y;
  for (const x of [-22, 22, -9, 9]) E.push({ p: [x, top + 2.2, 17], kind: 'incense', thr: 0, seed: 40 + Math.floor(x) });
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
      // dawn fires early (the cold north), the noon meal, the evening meal and the kang's long fire
      const kitchen = Math.max(bump(h, 6.0, 0.9, 0.7), bump(h, 11.5, 0.8, 0.6), bump(h, 17.4, 1.2, 1.0), bump(h, 20.5, 1.2, 0.5));
      const steam = Math.min(1, Math.max(0, (h - 5.5) / 1.2)) * Math.min(1, Math.max(0, (20.5 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 0.8, steam, 0, r.meal);
    }
  },
});
