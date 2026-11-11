// Mohenjo-daro — smoke (docs/settlements/mohenjo-daro.md §6, §8): the hearths of the courts at the meals, the kilns of the potters, bead-makers and
// coppersmiths (alight all day), a brazier by the Bath's cells. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, PLAT, BATH, PLAZA, lots } from './layout.js';

const ID = 'mohenjo-daro';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(2500);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, trade = !['house', 'small'].includes(l.kind);
    if (!trade && r() > 0.5) continue;
    // the hearth in the court: its smoke rises from the open court between the rooms
    E.push({ p: [cx, l.y + (trade ? 3.4 : 3.2), cz], kind: 'kitchen', thr: trade ? 0 : 0.2 + 0.7 * r(), seed: l.seed + 3 });
  }
  for (const [dx, dz] of [[-14, -10], [16, 12], [-6, 20]]) E.push({ p: [(PLAZA[0] + PLAZA[2]) / 2 + dx, 2.0, (PLAZA[1] + PLAZA[3]) / 2 + dz], kind: 'kitchen', thr: 0.1, seed: 40 + dx });
  E.push({ p: [BATH.outer[2] - 2.5, PLAT + 1.4, BATH.outer[1] + 14], kind: 'incense', thr: 0.2, seed: 5 });
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
      const day = Math.min(1, Math.max(0, (h - 4.8) / 1.5)) * Math.min(1, Math.max(0, (19.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.5, 0.9, 0.8), bump(h, 17.5, 1.0, 0.9));
      const kitchen = Math.min(1, day * 0.5 + meals);
      const incense = 0.3 + 0.5 * Math.max(bump(h, 7, 1.4, 1), bump(h, 17.5, 1.4, 0.7));
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.8, 0, r.meal);
    }
  },
});
