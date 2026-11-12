// Muromachi Kyoto — smoke (docs/settlements/muromachi-kyoto.md §5): hearth smoke leaving by the gable of the open shops and of every
// fourth other house at the meals, incense at the temples. Engine part: src/engine/smoke.js; positions from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, isOpen, RADIUS, RYOAN, GINKAKU } from './layout.js';
import { dims } from '../../styles/muromachi/machiya.js';

const ID = 'muromachi-kyoto';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export function emitters() {
  const E = [], r = rng(1490);
  for (const l of lots()) {
    if (!(isOpen(l) || l.seed % 4 === 1)) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [(x0 + x1) / 2 + (r() - 0.5) * 1.5, (() => { const D = dims(l.seed); return D.top + D.rise + 0.4; })(), (z0 + z1) / 2 + (r() - 0.5) * 1.5], kind: 'kitchen', thr: 0.1 + 0.8 * r(), seed: l.seed % 977 });
  }
  E.push({ p: [RYOAN.hojo[0] + 7, 5.4, RYOAN.hojo[1] + 4], kind: 'kitchen', thr: 0.2, seed: 11 });
  E.push({ p: [GINKAKU.togudo[0] - 1.5, 7.2, GINKAKU.togudo[1] - 1], kind: 'kitchen', thr: 0.05, seed: 12 });
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 12.0, 0.9, 0.4), bump(h, 18.0, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.15 + meals);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, day * 0.3, 0, r.meal);
    }
  },
});
