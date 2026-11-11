// Athens — smoke (docs/settlements/athens.md §12): the potters' kilns of the Kerameikos (a fire kept up through the day, the vent
// smoking), kitchen smoke from a scatter of the houses at the three meals, the bronze-smith's hearth under the Agora's south side,
// the burnt offerings on the Altar of the Twelve Gods and the altar of Prometheus in the Academy. The engine part is
// src/engine/smoke.js (one draw call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, SHOPROW, height } from './layout.js';
import { WORKSHOPS, ALTAR_PROMETHEUS } from './quarters.js';

const ID = 'athens';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(410);
  for (const l of lots()) {
    if (r() < 0.38) { const [x0, z0, x1, z1] = l.rect; E.push({ p: [x0 + (x1 - x0) * (0.25 + 0.5 * r()), l.y + 4.6, z0 + (z1 - z0) * (0.2 + 0.3 * r())], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 }); }
  }
  // the walk-in houses: the kitchen's hearth smoking through the roof tiles, the bronze-smith's shop's forge
  lots().filter((l) => l.open).forEach((l, k) => { const [X0, , , Z1] = l.rect; E.push({ p: [X0 + 6.9, l.y + 3.9, Z1 - 2.0], kind: 'kitchen', thr: 0.12 + 0.1 * (k % 3), seed: 700 + k }); });
  // the kilns: the vent over the dome (2.1 m); the ones being fired burn through the day
  WORKSHOPS.forEach((w, i) => E.push({ p: [w.kiln[0], 2.3, w.kiln[1]], kind: 'kitchen', thr: i % 4 === 1 ? 0 : 0.14 + 0.1 * (i % 3), seed: 900 + i }));
  // the bronze-smith's hearth (the first shop of the south side)
  E.push({ p: [SHOPROW[0] + 3.5, 5.4, SHOPROW[3] - 1.2], kind: 'kitchen', thr: 0.1, seed: 31 });
  // the altars
  E.push({ p: [-240, 1.4, -208], kind: 'incense', thr: 0, seed: 41 });
  E.push({ p: [ALTAR_PROMETHEUS[0], 1.9, ALTAR_PROMETHEUS[1]], kind: 'incense', thr: 0.1, seed: 42 });
  void height;
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
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.5), bump(h, 19.0, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.16 + meals);
      const incense = 0.5 + 0.5 * Math.max(bump(h, 7.0, 1.2, 1), bump(h, 17.0, 1.4, 0.8));
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
