// Borgund — smoke and mist (docs/settlements/norse-borgund.md §10): the hearths of the dwellings smoke through the ljore on the
// ridge (no chimney: the fire burns day and night, the stronger at the meals) and a mist over
// the river at dawn. The engine part is src/engine/smoke.js (one draw call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, RIVER, riverZ, buildings, inRiver } from './layout.js';

const ID = 'norse-borgund';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1253);
  for (const b of buildings()) {
    if (b.kind !== 'stue' && b.kind !== 'smithy') continue;
    const [x0, z0, x1, z1] = b.rect, alongX = x1 - x0 >= z1 - z0, span = alongX ? z1 - z0 : x1 - x0;
    // the ljore: over the ridge (styles/norse logHouse: H 3.1, eave 0.45, pitch 0.5; its hood 0.35 over the ridge)
    const top = b.y + 3.1 + 0.45 * 0.5 + span / 2 * 0.5 + 0.35 + 0.5;
    E.push({ p: [(x0 + x1) / 2 - (alongX ? 0.6 : 0), top, (z0 + z1) / 2 - (alongX ? 0 : 0.6)], kind: 'kitchen', thr: b.kind === 'smithy' ? 0 : r() * 0.35, seed: b.seed + 1 });
  }
  // the river's morning mist
  for (let x = -280; x <= 280; x += 36) {
    const z = riverZ(x); if (!inRiver(x, z) || Math.hypot(x, z) > RADIUS - 40) continue;
    E.push({ p: [x, RIVER.level + 0.4, z], kind: 'mist', thr: 0, seed: Math.floor(x) + 400 });
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
      // the hearth is never out: banked at night, built up at the meals
      const meals = Math.max(bump(h, 7, 1.0, 0.45), bump(h, 13, 1.0, 0.3), bump(h, 19, 1.4, 0.5));
      const kitchen = Math.min(1, 0.5 + meals);
      const mist = bump(h, 5.2, 1.6, 0.9);
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, 0, 0, mist, r.meal);
    }
  },
});
