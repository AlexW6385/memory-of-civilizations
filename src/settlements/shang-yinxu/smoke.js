// Shang Yinxu — smoke (docs/settlements/shang-yinxu.md §5): the crucible furnaces of the foundry (steady smoke from the casting), the
// cooking fires of the compounds at the meals, the kilns of the potters, the braziers of the ancestral hall (incense), the diviners'
// fires of the court and the archive's shed. The engine part is src/engine/smoke.js (one draw call); positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, AXIS, HALL, ARCHIVE, FURNACES, lots as townLots, lotPoint, spots } from './layout.js';
import { ground } from './ground.js';

const ID = 'shang-yinxu';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1200);
  for (const l of townLots()) {
    const W = l.rect[2] - l.rect[0], D = l.rect[3] - l.rect[1], S = spots(l.kind, W, D), h = lotPoint(l, S.hearth[0], S.hearth[1]), y = ground.height(h[0], h[1]);
    if (l.trade === 'pottery') { const k = lotPoint(l, W / 2, 6); E.push({ p: [k[0], y + 1.95, k[1]], kind: 'kitchen', thr: 0, seed: l.seed + 1 }, { p: [k[0] + 0.3, y + 1.95, k[1] + 0.2], kind: 'steam', thr: 0.05, seed: l.seed + 2 }); }
    else if (l.kind === 'workshop') { if (l.trade === 'oracle') { const k = lotPoint(l, W / 2, D / 2 - 2); E.push({ p: [k[0], y + 0.7, k[1]], kind: 'incense', thr: 0.1, seed: l.seed + 5 }); } }
    else if (r() < 0.75) E.push({ p: [h[0], y + 0.9, h[1]], kind: 'kitchen', thr: l.kind === 'court' ? 0.2 + 0.5 * r() : 0.1 + 0.8 * r(), seed: l.seed + 3 });
  }
  { const kiln = [-62, 1.75, 136]; E.push({ p: [kiln[0], kiln[1], kiln[2]], kind: 'kitchen', thr: 0.1, seed: 33 }, { p: [kiln[0] + 1.2, kiln[1], kiln[2]], kind: 'steam', thr: 0.3, seed: 34 }); }
  for (const [x, z] of FURNACES) { E.push({ p: [x, 1.7, z], kind: 'kitchen', thr: 0, seed: Math.round(x) + 1 }); }
  E.push({ p: [FURNACES[1][0], 1.9, FURNACES[1][1]], kind: 'steam', thr: 0.1, seed: 31 });
  for (const s of [-1, 1]) E.push({ p: [AXIS + s * 6, HALL.h + 0.9, -90.5], kind: 'incense', thr: 0, seed: 40 + s });
  for (let k = 0; k < 4; k++) E.push({ p: [4 + k * 10.5, 0.6, -30.6], kind: 'incense', thr: 0.1, seed: 50 + k });
  E.push({ p: [ARCHIVE.shed[0] + 6, 0.9, ARCHIVE.shed[3] - 3.4], kind: 'incense', thr: 0.2, seed: 60 });
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
      const meals = Math.max(bump(h, 7.0, 0.9, 0.8), bump(h, 12.0, 0.9, 0.4), bump(h, 18.0, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.5 + meals);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, day * 0.7 + 0.2, day * 0.6, 0, r.meal);
    }
  },
});
