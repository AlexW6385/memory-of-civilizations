// Knossos — smoke (docs/settlements/knossos.md §11): kitchen smoke from a scatter of the town's houses at the morning and evening
// meals (the cooking-hearth's vent in the flat roof), the potter's kiln by the Royal Road fired through the day (its flue), the
// lamps' thin smoke at dusk, and the incense burnt before the Tripartite Shrine. The engine part is src/engine/smoke.js (one draw
// call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, yards, height } from './layout.js';
import { YARD } from './life.js';
import { dwellingStoreys } from '../../styles/minoan/town.js';

const ID = 'knossos';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1600);
  for (const l of lots()) {
    if (l.r < 220 && r() < 0.32) {
      const [x0, z0, x1, z1] = l.rect, x = x0 + (x1 - x0) * (0.25 + 0.5 * r()), z = z0 + (z1 - z0) * (0.25 + 0.5 * r());
      const low = Math.min(height(x0, z0), height(x1, z0), height(x0, z1), height(x1, z1));
      E.push({ p: [x, low + dwellingStoreys(l.seed) * 2.9 + 0.5, z], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 });
    }
  }
  // the ovens in the yards behind the shorter houses, baking at the morning meal
  for (const y of yards()) if (Math.floor(rng(y.seed || 3)() * 3) === 0 && r() < 0.8) { const c = [(y.rect[0] + y.rect[2]) / 2, (y.rect[1] + y.rect[3]) / 2]; E.push({ p: [c[0], height(c[0], c[1]) + 0.9, c[1]], kind: 'kitchen', thr: 0.2 + 0.4 * r(), seed: y.seed + 3 }); }
  // the kiln: its flue at the north end of the chamber, 1.55 m up on the yard's ground; fired through the day
  const yy = Math.max(height(YARD[0], YARD[1]), height(YARD[2], YARD[3]), height(YARD[0], YARD[3]), height(YARD[2], YARD[1]));
  E.push({ p: [YARD[0] + 0.6 + 0.85, yy + 1.6, YARD[1] + 0.7 + 0.45], kind: 'kitchen', thr: 0, seed: 11 });
  // the incense before the Tripartite Shrine
  E.push({ p: [-12.4, 1.0, 6], kind: 'incense', thr: 0, seed: 21 });
  E.push({ p: [-16.8, 1.3, -14], kind: 'incense', thr: 0.2, seed: 22 });
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
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.4), bump(h, 19.0, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.14 + meals);
      const incense = 0.5 + 0.5 * Math.max(bump(h, 7.0, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
