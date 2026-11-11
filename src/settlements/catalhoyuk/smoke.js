// Çatalhöyük — smoke (docs/settlements/catalhoyuk.md §4, §9): the hearth's and the oven's smoke leaves every house by its hatch
// ("ceiling openings were the only ventilation, letting smoke from hearths and ovens escape" — Wikipedia), more at the meals; the
// opened house's hatch; the ovens of the courts. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { KIND, TOP, CW, CD, colX, rowZ, LANDMARK, RADIUS } from './layout.js';

const ID = 'catalhoyuk';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(6500);
  for (let i = 0; i < KIND.length; i++) for (let j = 0; j < KIND[0].length; j++) {
    const k = KIND[i][j], x0 = colX(j), z0 = rowZ(i);
    if (k === 'h') { if (r() < 0.55) E.push({ p: [x0 + CW[j] * (0.3 + r() * 0.35), TOP[i][j] + 0.75, z0 + CD[i] * (0.3 + r() * 0.35)], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: i * 41 + j }); }
    else if (k === 'c') E.push({ p: [x0 + CW[j] / 2 - 1.1, 1.1, z0 + CD[i] / 2 - 0.6], kind: 'kitchen', thr: 0.05, seed: i * 13 + j });
    else if (k === 'm') E.push({ p: [x0 + CW[j] / 2, 0.8, z0 + CD[i] / 2], kind: 'steam', thr: 0.6, seed: i * 7 + j });
  }
  const [x0, z0, x1] = LANDMARK.rect;
  E.push({ p: [x0 + 0.45 + 1.6, 2.5 + 1.0, z0 + 0.45 + 4.4], kind: 'kitchen', thr: 0, seed: 5 });
  void x1;
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
      const kitchen = Math.min(1, day * 0.2 + meals);
      const steam = day * 0.5;
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, 0, r.meal);
    }
  },
});
