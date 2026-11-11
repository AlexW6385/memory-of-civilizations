// Shaolin — smoke (docs/settlements/shaolin.md §7): incense at the censers of the courts and halls all day, kitchen smoke from the
// monastery kitchen and the village houses at the meals, steam from the refectory. Emitters from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RANGES, HOUSES, AXIS, PLAT, RADIUS, rng } from './layout.js';

const ID = 'shaolin';
export function emitters() {
  const E = [], r = rng(1600);
  // incense: the great censers (plan.js: court_censer at the processional way, 2.3 m high) and the halls' altars
  for (const z of [105, 62, 22]) E.push({ p: [0, 2.4, z], kind: 'incense', thr: 0, seed: Math.round(z) });
  { const q = AXIS.mahavira, y = 0.02 + PLAT.mahavira; for (const s of [-1, 1]) E.push({ p: [s * 6.2, y + 2.6, q[3] + 0.8 + 3.3], kind: 'incense', thr: 0, seed: 31 + s }); E.push({ p: [0, y + 2.1, q[1] + 7.0], kind: 'incense', thr: 0, seed: 5 }); }
  { const q = AXIS.tianwang, y = 0.02 + PLAT.tianwang; E.push({ p: [0, y + 1.9, q[1] + 5.8], kind: 'incense', thr: 0, seed: 6 }); }
  // the kitchen (a range) and refectory: stove smoke through a roof vent, steam
  for (const q of RANGES) if (q.kind === 'kitchen' || q.kind === 'refectory') {
    const cx = (q.rect[0] + q.rect[2]) / 2, cz = (q.rect[1] + q.rect[3]) / 2;
    E.push({ p: [cx, 0.37 + 4.4 + 0.9, cz], kind: 'kitchen', thr: 0, seed: Math.round(cz) });
    E.push({ p: [cx, 0.37 + 4.4 + 0.9, cz + 3], kind: 'steam', thr: 0.1, seed: Math.round(cz) + 1 });
  }
  for (const h of HOUSES) if (r() < 0.4) { const rr = h.rect; E.push({ p: [(rr[0] + rr[2]) / 2 + r() * 2 - 1, 0.25 + 3.6 + 0.9, (rr[1] + rr[3]) / 2], kind: 'kitchen', thr: r() * 0.7, seed: h.seed % 997 }); }
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
      const day = Math.min(1, Math.max(0, (h - 5.0) / 1.5)) * Math.min(1, Math.max(0, (21 - h) / 1.5));
      const kitchen = Math.max(bump(h, 6.0, 0.9, 0.9), bump(h, 11.0, 0.9, 0.8), bump(h, 17.0, 1.0, 0.7));
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(Math.min(1, kitchen + day * 0.1), Math.max(0.5, day), day * 0.7, 0, r.meal);
    }
  },
});
