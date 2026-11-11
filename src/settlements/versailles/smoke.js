// Versailles — smoke (docs/settlements/versailles.md §10): kitchen smoke from a share of the town's houses at the three
// meals out of the tall chimney stacks, the kitchens of the stables and the palace's offices at all hours, and a faint
// mist over the Grand Canal at dawn. The engine part is src/engine/smoke.js; this places the emitters from layout.js.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, houseH, RADIUS, RISE, CANAL, STABLES } from './layout.js';

const ID = 'versailles';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1700);
  for (const l of lots()) {
    if (rand() > 0.42) continue;
    const [x0, z0, x1, z1] = l.rect, ye = RISE + houseH(l) + 6.5;      // the stack's top (townhouse.js: 6.4 over the eave)
    E.push({ p: [x0 + (x1 - x0) * (0.2 + 0.6 * rand()), ye + 0.4, z0 + (z1 - z0) * (0.3 + 0.4 * rand())], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the stables' kitchens and forges, one stack each side of each court
  for (const s of STABLES) for (const dz of [-17, 17]) E.push({ p: [s.x + 40, RISE + 9.5 + 4.4 + 2.4, s.z + dz], kind: 'kitchen', seed: Math.floor(s.z) + dz + 5 });
  for (let z = -150; z <= 150; z += 40) E.push({ p: [CANAL.x0 - 6, -1 + 0.45, z * 0.15], kind: 'mist', thr: 0, seed: Math.floor(z) + 99 });
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
      const kitchen = Math.max(bump(h, 7.0, 0.8, 0.5), bump(h, 12.0, 0.9, 0.8), bump(h, 18.5, 1.0, 0.9));
      const mist = Math.max(bump(h, 5.6, 1.5, 1.0), 0.1);
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, mist, r.meal);
    }
  },
});
