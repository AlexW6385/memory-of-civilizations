// Machu Picchu — smoke (docs/settlements/machu-picchu.md §10): the houses' hearths (q'uncha) at the morning and evening meals —
// the Inca house had no chimney, the smoke leaving through the thatch and the door — the kallanka's hearth, and the mist that
// the cloud forest sends up the saddle at dawn. The engine part is src/engine/smoke.js (one draw call); the places come from
// the layout (the houses' stoves stand in a back corner, so the smoke rises through the roof's thatch near the ridge).
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, KALLANKA, houses, outside } from './layout.js';
import { ground } from './ground.js';

const ID = 'machu-picchu';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1450);
  for (const h of houses()) {
    if (r() > 0.45) continue;
    const [x0, z0, x1, z1] = h.rect, th = 2.8, rise = (Math.min(x1 - x0, z1 - z0) / 2) * 1.45;
    const y = Math.min(ground.height(x0, z0), ground.height(x1, z1));
    // through the thatch, a little off the ridge (the stove stands at the back)
    E.push({ p: [x0 + (x1 - x0) * (0.35 + 0.3 * r()), y + th + rise - 0.3, z0 + (z1 - z0) * (0.35 + 0.3 * r())], kind: 'kitchen', thr: 0.2 + 0.7 * r(), seed: h.seed + 1 });
  }
  // the kallanka's hearth, mid-hall: the smoke leaves by the thatch at the ridge
  { const [x0, z0, x1, z1] = KALLANKA, hb = (z0 + z1) / 2, rise = ((x1 - x0) / 2) * 1.45; E.push({ p: [(x0 + x1) / 2, 3.3 + rise - 0.2, hb - 3.4], kind: 'kitchen', thr: 0.1, seed: 5 }); }
  // morning mist up the saddle's flanks, over the lowest terraces
  for (let t = 0; t < 6.28; t += 0.55) {
    const x = Math.cos(t) * 150, z = Math.sin(t) * 250;
    if (Math.hypot(x, z) > RADIUS - 24 || outside(x, z) < 20) continue;
    E.push({ p: [x, ground.height(x, z) + 0.6, z], kind: 'mist', thr: 0, seed: Math.floor(t * 100) + 17 });
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
      const kitchen = Math.max(bump(h, 6.2, 0.9, 0.8), bump(h, 12.3, 0.9, 0.5), bump(h, 18.0, 1.1, 0.9));
      const mist = Math.max(bump(h, 5.6, 1.6, 1), bump(h, 16.5, 1.5, 0.35));
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, 0, mist, r.meal);
    }
  },
});
