// Baroque Rome — smoke, steam and mist (docs/settlements/baroque-rome.md §5): kitchen smoke from the chimneys of the
// Borgo's palazzi and houses at the meals, the bakers' ovens by day, steam off the shops' cauldrons, a faint mist
// over the Tiber at dawn. The emitters come from the rows of layout.js.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { rows, RADIUS, TIBER, tiberX } from './layout.js';

const ID = 'baroque-rome';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1670);
  for (const r of rows()) for (const u of r.units) {
    const [x0, z0, x1, z1] = r.rect, x = (u.x0 + u.x1) / 2, z = (z0 + z1) / 2 + (r.face === 'n' ? -1 : 1) * (z1 - z0) * 0.15;
    // (the chimneys stand at 0.35–0.65 of the depth, a metre and a half over the ridge)
    const top = u.H + 0.16 + (u.kind === 'palazzo' ? 3.0 : 2.4) * 0.8 + 1.8;
    if (u.kind === 'casa' && u.trade === 'baker' && !u.fountain) E.push({ p: [x, top, z], kind: 'kitchen', thr: 0.05, seed: u.seed + 2 });
    else if (rand() < 0.55) E.push({ p: [x, top, z], kind: 'kitchen', seed: u.seed + 1 });
  }
  for (let z = -300; z <= 300; z += 28) { const x = tiberX(z); if (Math.hypot(x, z) > RADIUS - 20) continue; E.push({ p: [x, TIBER.level + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(z) + 99 }); }
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
      const kitchen = Math.max(bump(h, 7.2, 0.9, 0.6), bump(h, 12.8, 0.9, 0.8), bump(h, 19.0, 1.1, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 6) / 1.4)) * Math.min(1, Math.max(0, (20 - h) / 1.5)) * 0.8;
      const mist = bump(h, 5.8, 1.4, 0.8);
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, mist, r.meal);
    }
  },
});
