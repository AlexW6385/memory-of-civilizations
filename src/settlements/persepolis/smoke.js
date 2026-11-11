// Persepolis — smoke (docs/settlements/persepolis.md §15): kitchen smoke from the vents of Parsa's houses at the morning and
// evening meals (a third of the houses cook indoors without one), the kiln of the glaze-makers and the smiths' furnace
// through the working day, and the incense before the king's throne on the Apadana all day. The engine part is
// src/engine/smoke.js (one draw call); positions come from the layout and the style's own vents.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, WORKSHOPS, TERRACE, lots } from './layout.js';
import { houseVent, workshopVents } from '../../styles/achaemenid/town.js';

const ID = 'persepolis';
export function emitters() {
  const E = [];
  for (const l of lots()) {
    const v = houseVent(l.rect, l.seed, l.front);
    if (v) E.push({ p: v, kind: 'kitchen', thr: ((l.seed % 100) / 100) * 0.8, seed: l.seed + 1 });
  }
  workshopVents(WORKSHOPS).forEach((p, i) => E.push({ p, kind: 'kitchen', thr: 0, seed: 30 + i }));
  // the incense burners before the throne in the Apadana (audience: c [-30, -40] facing north, 2.75 m plinth, stands 2.1 m)
  for (const x of [-33.6, -26.4]) E.push({ p: [x, TERRACE.h + 2.75 + 2.15, -43.2], kind: 'incense', thr: 0, seed: Math.floor(x) + 90 });
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
      const day = Math.min(1, Math.max(0, (h - 5.5) / 1.5)) * Math.min(1, Math.max(0, (19.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.4), bump(h, 18.0, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.16 + meals);
      const incense = 0.4 + 0.6 * day;
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
