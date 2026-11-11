// Manueline Lisbon — smoke (docs/settlements/manueline-lisbon.md §9): kitchen smoke from a share of the houses at the meals, the
// shipyard's pitch kettles, incense in the Jerónimos, the river mist at dawn. The engine part is src/engine/smoke.js; positions
// come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, SEA, GROUND, YARD, CHURCH, RADIUS, wet } from './layout.js';

const ID = 'manueline-lisbon';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1520);
  for (const l of lots()) {
    if (rand() > 0.3) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + 0.4 * rand()), l.y + (l.kind === 'merchant' ? 11 : 7), z0 + (z1 - z0) * (0.3 + 0.4 * rand())], kind: 'kitchen', seed: l.seed + 1 });
  }
  for (const [x, z] of [[YARD[0] + 20, YARD[1] + 50], [YARD[0] + 60, YARD[1] + 50]]) E.push({ p: [x, GROUND + 1.2, z], kind: 'kitchen', thr: 0.2, seed: Math.round(x) });
  E.push({ p: [CHURCH[0] + 14, GROUND + 3, (CHURCH[1] + CHURCH[3]) / 2], kind: 'kitchen', thr: 0, seed: 78 });
  for (let x = -280; x <= 300; x += 40) for (const z of [120, 160, 200]) if (Math.hypot(x, z) < RADIUS - 70 && wet(x, z) < -3) E.push({ p: [x, SEA + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(x + z) + 99 });
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
      const kitchen = Math.max(bump(h, 7.0, 0.8, 0.5), bump(h, 12.5, 0.9, 0.8), bump(h, 19.0, 1.0, 0.9));
      const mist = Math.max(bump(h, 5.8, 1.5, 1.0), 0.1);
      r.meal = h < 9.5 ? 0 : h < 15.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, mist, r.meal);
    }
  },
});
