// Jerusalem about 700 — smoke and steam (docs/settlements/jerusalem.md §13): kitchen smoke from the courtyard
// houses' ovens at the morning and evening meals, steam from the Cardo's bread and cook-shops by day, incense at
// the Holy Sepulchre's atrium and at the Dome of the Rock's doors. The engine part is src/engine/smoke.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, CARDO, SEPULCHRE, SEP_Y, CARDO_Y, height } from './layout.js';

const ID = 'jerusalem';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(700);
  for (const l of lots()) {
    if (r() > 0.4) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x1 - 2.2, l.y + 4.2 + 0.9, z1 - 2.0], kind: 'kitchen', seed: l.seed + 1 });   // the kitchen range's roof vent
  }
  for (let z = -250; z < 260; z += 38 + r() * 30) { if (Math.abs(z) < 12) continue; const s = r() < 0.5 ? -1 : 1; E.push({ p: [CARDO.x + s * (CARDO.road / 2 + CARDO.portico + 2.5), CARDO_Y + 7.2, z], kind: 'steam', thr: r() * 0.3, seed: Math.floor(r() * 1e6) }); }
  E.push({ p: [SEPULCHRE[2] - 24, SEP_Y + 1.2, (SEPULCHRE[1] + SEPULCHRE[3]) / 2], kind: 'incense', thr: 0, seed: 31 });
  E.push({ p: [-31, height(-31, -20) + 4 + 1.2, -20], kind: 'incense', thr: 0.1, seed: 32 });
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
      const kitchen = Math.max(bump(h, 6.6, 0.8, 0.6), bump(h, 12.0, 0.8, 0.5), bump(h, 17.6, 1.0, 0.8));
      const incense = 0.4 + 0.6 * Math.max(bump(h, 5.5, 1.2, 1), bump(h, 12.5, 1.2, 0.8), bump(h, 18.0, 1.2, 0.8));
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.4)) * Math.min(1, Math.max(0, (20 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, incense, steam, 0, r.meal);
    }
  },
});
