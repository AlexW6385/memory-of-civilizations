// Renaissance Florence — smoke, steam and mist (docs/settlements/florence.md §10): kitchen smoke from a
// share of the houses at the meals, the bakers' and smiths' chimneys by day, steam off the dyers'
// vats on the Arno, a faint mist over the river at dawn. The engine part is src/engine/smoke.js (one
// draw call); this registers the system and places the emitters from the layout.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, ARNO, RADIUS, TINTORI, arnoZ } from './layout.js';

const ID = 'florence';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1480);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, w = x1 - x0, d = z1 - z0;
    if (l.kind === 'palazzo' || l.kind === 'torre') { if (rand() < 0.5) E.push({ p: [x0 + w * (0.3 + rand() * 0.4), (l.kind === 'torre' ? 6 * 3.5 : 15.5) + 1.7, z0 + d * (0.3 + rand() * 0.4)], kind: 'kitchen', seed: l.seed + 1 }); continue; }
    const top = l.storeys * 3.8 + (l.kind === 'bottega' ? 0.6 : 0.3) + 1.5 + 1.0;
    if (l.kind === 'bottega' && (l.trade === 'bread' || l.trade === 'smith' || l.trade === 'goldsmith') && rand() < 0.8) E.push({ p: [x0 + w * 0.5, top, z0 + d * 0.5], kind: 'kitchen', thr: 0.05, seed: l.seed + 2 });
    else if (rand() < 0.3) E.push({ p: [x0 + w * (0.25 + rand() * 0.5), top, z0 + d * (0.25 + rand() * 0.5)], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the dyers' vats under their shed: four, steaming all day
  const [t0, u0] = TINTORI;
  for (let k = 0; k < 4; k++) E.push({ p: [t0 + 4 + (k + 0.5) * 6, 2.1, u0 + 4 + 7 * 0.38], kind: 'steam', thr: 0.05, seed: 900 + k });
  // mist along the Arno
  for (let x = -230; x <= 230; x += 28) { const z = arnoZ(x); if (Math.hypot(x, z) > RADIUS - 60) continue; E.push({ p: [x, ARNO.level + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(x) + 99 }); }
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
      const kitchen = Math.max(bump(h, 7.0, 0.9, 0.6), bump(h, 12.2, 0.9, 0.7), bump(h, 18.0, 1.1, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 6) / 1.4)) * Math.min(1, Math.max(0, (19 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.6, 1.4, 0.8);
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, mist, r.meal);
    }
  },
});
