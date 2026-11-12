// Vienna in spring 1902 — smoke (docs/settlements/vienna.md §9): thin smoke from the chimneys of a share of the tenements at the
// morning and evening firing of the tiled stoves and at the midday kitchens, the chestnut-roaster's brazier on the Karlsplatz, the
// river mist over the Wien at dawn. The engine part is src/engine/smoke.js; positions come from layout.js (the settlement's frame: x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, WIEN, RADIUS, TRAIN } from './layout.js';

const ID = 'vienna';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1902);
  for (const l of lots()) {
    if (rand() > 0.22) continue;
    const [x0, z0, x1, z1] = l.rect, n = l.storeys ?? 4;
    E.push({ p: [x0 + (x1 - x0) * (0.25 + 0.5 * rand()), (l.y ?? 0) + (l.kind === 'biedermeier' ? n * 3.3 + 3.2 : n * 3.9 + 4.6), z0 + (z1 - z0) * (0.3 + 0.4 * rand())], kind: 'kitchen', seed: (l.seed ?? 1) + 1 });
  }
  // the chestnut roaster at the Karlsplatz's main walk
  E.push({ p: [118.2, 1.5, -3.6], kind: 'kitchen', thr: 0.1, seed: 77 });
  // the Stadtbahn engine standing on the viaduct
  E.push({ p: [TRAIN.x0 + 1.1, 3.0, TRAIN.z], kind: 'kitchen', thr: 0, seed: 1898 });
  // the mist on the Wien at dawn
  for (let x = -260; x <= 260; x += 40) if (Math.hypot(x, 70) < RADIUS - 40) E.push({ p: [x, WIEN.water + 0.45, 70], kind: 'mist', thr: 0, seed: Math.floor(x) + 99 });
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
      const kitchen = Math.max(bump(h, 7.0, 0.8, 0.5), bump(h, 11.8, 0.9, 0.8), bump(h, 18.0, 1.0, 0.9));
      const mist = Math.max(bump(h, 5.6, 1.5, 1.0), 0.12);
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, mist, r.meal);
    }
  },
});
