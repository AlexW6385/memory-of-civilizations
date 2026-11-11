// Stonehenge — smoke (docs/settlements/stonehenge.md §10b): the hearths of the Durrington houses (smoke leaving through the
// thatch of a house with a central hearth, from about two in five at the morning and evening meals), and the fires of the
// midwinter feast and the gathering camp, which burn all the daylight hours and into the evening: a plume rising from each
// fire, steam from the cooking pots. The engine part is src/engine/smoke.js (one draw call); the places come from the layout
// and from town.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, houses, height } from './layout.js';
import { feast, camp } from './town.js';

const ID = 'stonehenge';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(2500);
  // a house's thatch rises 0.95 s above the wall (1.75 m, the eave at 1.5): the apex at 1.75 + 0.95 s, the smoke leaving just above it
  for (const h of houses()) if (r() < 0.45) E.push({ p: [h.c[0], h.y + 1.75 + h.s * 0.95 + 0.15, h.c[1]], kind: 'kitchen', thr: 0.1 + 0.85 * r(), seed: h.seed });
  // the feast and camp fires (town.js): smoke over the flames, steam from the pots beside them
  for (const p of [...feast(), ...camp()]) for (const e of p.elements) if (e.t === 'feast_fire') {
    const [x, z] = e.c, y = e.y ?? height(x, z);
    E.push({ p: [x, y + 0.85, z], kind: 'kitchen', thr: 0.05 + 0.25 * r(), seed: Math.floor(x * 7 + z * 13) });
    E.push({ p: [x + 0.55, y + 0.4, z + 0.3], kind: 'steam', thr: 0.1 + 0.4 * r(), seed: Math.floor(x * 3 + z * 5) });
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
      const kitchen = Math.min(1, 0.3 + Math.max(bump(h, 7, 1.0, 0.7), bump(h, 12.5, 1.6, 0.6), bump(h, 18.5, 1.6, 0.9)));
      const steam = Math.min(1, Math.max(0, (h - 6) / 1.5)) * Math.min(1, Math.max(0, (22 - h) / 2)) * 0.9;
      r.meal = h < 10 ? 0 : h < 15.5 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, 0, r.meal);
    }
  },
});
