// Djenné — smoke and mist (docs/settlements/djenne.md §14): cooking smoke from a share of the houses at the morning and
// evening meals, from the market's cooks (the smoked meat) by day, a faint mist on the channel at dawn. The engine part is
// src/engine/smoke.js (one draw call); this registers the system and places the emitters from the layout.
// Emitter positions are in the settlement's frame (x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, ISLAND, LEVEL, MARKET, houses } from './layout.js';

const ID = 'djenne';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const ringR = (a) => ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);

function emitters() {
  const E = [], rand = rng(1311);
  // the kitchen stove in the court behind the front: its smoke leaves over the roof terrace
  for (const h of houses()) {
    if (rand() > 0.3) continue;
    const [x0, z0, x1, z1] = h.rect, H = (h.storeys ?? 2) * 3.1;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + rand() * 0.4), H + 0.9, z0 + (z1 - z0) * (0.3 + rand() * 0.4)], kind: 'kitchen', seed: h.seed + 1 });
  }
  // the market's cooks: smoked meat on skewers over the fires, along its south part
  for (let k = 0; k < 6; k++) E.push({ p: [MARKET[0] + 14 + k * 11, 1.3, MARKET[3] - 6 - (k % 2) * 3], kind: 'steam', thr: rand() * 0.3, seed: 40 + k });
  // mist on the channel
  for (let k = 0; k < 24; k++) {
    const a = k / 24 * Math.PI * 2, r = ringR(a) + 23;
    if (Math.hypot(Math.cos(a) * r, Math.sin(a) * r) > RADIUS - 20) continue;
    E.push({ p: [Math.cos(a) * r, LEVEL.water + 0.45, Math.sin(a) * r], kind: 'mist', thr: 0, seed: k + 99 });
  }
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
      const kitchen = Math.max(bump(h, 6.4, 0.8, 0.6), bump(h, 12.2, 0.8, 0.5), bump(h, 18.0, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 7) / 1.5)) * Math.min(1, Math.max(0, (17 - h) / 1.5)) * 0.8;
      const mist = bump(h, 5.6, 1.2, 0.7);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
