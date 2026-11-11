// Ur — smoke (docs/settlements/ur.md §10): kitchen smoke from a scatter of the houses at the morning and evening meals (the
// hearth's vent in the flat roof), the Giparu's kitchen court through the day, incense before the Court of Nanna's gate
// and at the Giparu's altar. The engine part is src/engine/smoke.js (one draw call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, GIPARU, houses } from './layout.js';

const ID = 'ur';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(2050);
  for (const h of houses()) {
    if (h.chapel) continue;
    if (r() < 0.34) {
      const [x0, z0, x1, z1] = h.rect;
      E.push({ p: [x0 + (x1 - x0) * (0.2 + 0.6 * r()), 3.9, z0 + (z1 - z0) * (0.2 + 0.6 * r())], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: h.seed + 1 });
    }
    if (h.chapel) continue;
  }
  const [gx, gz] = [GIPARU[0], GIPARU[1]];
  E.push({ p: [gx + 13.2, 1.5, gz + 60.9], kind: 'kitchen', thr: 0, seed: 11 });               // the Giparu's cooking range (its kitchen court)
  E.push({ p: [gx + 42.6, 1.3, gz + 51.9], kind: 'incense', thr: 0, seed: 21 });              // before the altar in the great court
  E.push({ p: [0, 1.2, -138], kind: 'incense', thr: 0.1, seed: 22 });                         // at the Edublalmah
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
      const day = Math.min(1, Math.max(0, (h - 5.5) / 1.5)) * Math.min(1, Math.max(0, (20.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.4), bump(h, 18.5, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.14 + meals);
      const incense = 0.5 + 0.5 * Math.max(bump(h, 7.0, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
