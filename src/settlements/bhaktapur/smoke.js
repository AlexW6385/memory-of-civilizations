// Bhaktapur — smoke (docs/settlements/bhaktapur.md §7): hearth smoke seeping through the tiles of the houses at the meals (the Newar kitchen is on the
// top floor [inferred]), the kilns of Pottery Square (a pall over the potters' end by day), a little incense at the shrines and the temple
// steps. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, SHI, CHAITYA, NYA } from './layout.js';
import { houseHeight } from '../../styles/newar/house.js';
import { POT_KILNS } from './plan.js';

const ID = 'bhaktapur';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1710);
  for (const l of lots()) {
    if (Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) > 120 || r() > 0.3) continue;
    const H = houseHeight(l.n), cx = l.rect[0] + (l.rect[2] - l.rect[0]) * (0.3 + 0.4 * r()), cz = l.rect[1] + (l.rect[3] - l.rect[1]) * (0.3 + 0.4 * r());
    E.push({ p: [cx, H + 1.4, cz], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: l.seed });
  }
  for (const [x, z] of POT_KILNS) { E.push({ p: [x, 1.9, z], kind: 'kitchen', thr: 0.02, seed: Math.round(x) }); E.push({ p: [x + 0.4, 1.9, z - 0.3], kind: 'steam', thr: 0.05, seed: Math.round(z) }); }
  E.push({ p: [SHI.c[0] + 1.8, 0.9, SHI.c[1]], kind: 'incense', thr: 0.1, seed: 3 }, { p: [CHAITYA.c[0], 0.9, CHAITYA.c[1] + 1.2], kind: 'incense', thr: 0.2, seed: 4 });
  E.push({ p: [NYA.c[0] + 15.5, 0.4, NYA.c[1] - 3], kind: 'incense', thr: 0.1, seed: 5 });
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
      const meals = Math.max(bump(h, 7.0, 1.0, 0.9), bump(h, 19.0, 1.2, 0.9));
      const kitchen = Math.min(1, day * 0.2 + meals), steam = day * 0.7, incense = Math.min(1, day * 0.8 + 0.1);
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, steam, 0, r.meal);
    }
  },
});
