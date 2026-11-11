// Edo Himeji — smoke, steam and mist (docs/settlements/edo-himeji.md §5.6): kitchen smoke from a share of the machiya (the
// range at the back of the passage, its smoke leaving by the roof's louvre) and the samurai houses at the three meals,
// steam from the teahouses' kettles by day, the sake brewer's steaming rice at dawn, a faint mist over the moats at
// dawn. Registered by one line in src/engine/systems-list.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, OUTER, INNER, MIDDLE, RADIUS, LEVEL } from './layout.js';

const ID = 'edo-himeji';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1620);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect;
    if (l.t === 'machiya') {
      const s = l.front === 's' ? 1 : -1, fz = s > 0 ? z1 : z0, dep = Math.min(11, z1 - z0);
      // the roof's ridge is 0.3 × depth over the eaves at 5.6–5.8 m; the range stands at the back of the house
      if (rand() < 0.4) E.push({ p: [x0 + 1.5 + rand() * 1.5, 5.7 + dep * 0.3 + 0.2, fz - s * dep * 0.7], kind: 'kitchen', seed: l.seed + 1 });
      if (l.trade === 'tea') E.push({ p: [x1 - 1.2, 0.8, fz - s * 1.4], kind: 'steam', thr: 0.05, seed: l.seed + 2 });
      if (l.trade === 'sake') E.push({ p: [(x0 + x1) / 2, 5.7 + dep * 0.3 + 0.4, fz - s * (dep + 6)], kind: 'steam', thr: 0.0, seed: l.seed + 3 });
    } else if (rand() < 0.3) E.push({ p: [x0 + 10 + rand() * 8, 4.6, z0 + 10 + rand() * 8], kind: 'kitchen', thr: rand() * 0.3, seed: l.seed + 4 });
  }
  for (const [x0, x1] of [[-RADIUS, -MIDDLE.gap / 2], [MIDDLE.gap / 2, RADIUS]]) for (let x = x0 + 40; x < x1 - 30; x += 26) {
    const z = (MIDDLE.z0 + MIDDLE.z1) / 2; if (Math.hypot(x, z) < RADIUS - 24) E.push({ p: [x, LEVEL.water + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(x) + 99 });
  }
  for (let a = OUTER[0] + 20; a < OUTER[2] - 20; a += 28) { E.push({ p: [a, LEVEL.water + 0.45, (OUTER[1] + INNER[1]) / 2], kind: 'mist', thr: 0, seed: Math.floor(a) + 7 }); }
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
    for (const r of ATT) {
      const { site, smoke } = r;
      if (site.state !== 'ready' || !site.group.visible || !r.ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.max(bump(h, 6.2, 0.8, 0.6), bump(h, 11.8, 0.8, 0.6), bump(h, 17.8, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.4)) * Math.min(1, Math.max(0, (20 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.4, 1.4, 0.9);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
