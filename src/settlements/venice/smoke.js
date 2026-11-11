// Venice about 1500 — smoke and mist (docs/settlements/venice.md §10): kitchen smoke from a share of the houses at the three
// meals, rising out of the flared chimneys, and the lagoon's mist lying on the canals and the basin at dawn. The engine part is
// src/engine/smoke.js; this registers the system and places the emitters from the layout (the settlement's frame: x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, GRAND, CANALS, SEA, GROUND, RADIUS, BASIN_Z, wet } from './layout.js';

const ID = 'venice';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1516);
  for (const l of lots()) {
    if (rand() > 0.34) continue;
    const [x0, z0, x1, z1] = l.rect, ridge = GROUND + l.storeys * 3.55 + 0.35 + 0.15 * (x1 - x0);
    // a flared chimney near a corner of the roof
    E.push({ p: [x0 + (x1 - x0) * (0.2 + 0.2 * rand()), ridge + 1.2, z0 + (z1 - z0) * (0.3 + 0.4 * rand())], kind: 'kitchen', seed: l.seed + 1 });
  }
  const line = (p, step) => {
    for (let i = 0; i + 1 < p.length; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1], len = Math.hypot(bx - ax, bz - az);
      for (let t = step / 2; t < len; t += step) { const x = ax + (bx - ax) * t / len, z = az + (bz - az) * t / len; if (Math.hypot(x, z) < RADIUS - 70 && wet(x, z) < -3) E.push({ p: [x, SEA + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(t) + 99 + i }); }
    }
  };
  line(GRAND, 30);
  for (const c of CANALS) line(c, 30);
  for (let x = -200; x <= 220; x += 36) E.push({ p: [x, SEA + 0.45, BASIN_Z + 18 + (x % 5)], kind: 'mist', thr: 0, seed: Math.floor(x) + 400 });
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
      const mist = Math.max(bump(h, 5.6, 1.5, 1.0), 0.15);
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, mist, r.meal);
    }
  },
});
