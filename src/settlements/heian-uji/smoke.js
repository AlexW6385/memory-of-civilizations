// Heian Uji — smoke (docs/settlements/heian-uji.md §13): kitchen smoke leaving by the gable of a share of the village's houses
// at the morning and evening meals, the smoke of the servants' kitchen of the villa, and incense before Amida in the
// Phoenix Hall. Registered by one line in src/engine/systems-list.js; emitters in the settlement's frame.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, HALL, VILLA } from './layout.js';

const ID = 'heian-uji';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
/** Where the incense burns: on its stand before the dais in the hall, 1.1 m (the floor) + 0.9 m up. */
export const CENSER = [HALL.origin[0] + 3.2, 2.0, 0];

function emitters() {
  const E = [], rand = rng(1100);
  for (const l of lots()) {
    if (rand() > 0.4) continue;
    const [x0, z0, x1, z1] = l.rect;
    // the smoke leaves by the gable near the back: about 3.2 m up (the ridge of a low roof)
    E.push({ p: [x0 + (x1 - x0) * (0.3 + rand() * 0.4), 3.3 + rand() * 0.8, z0 + (z1 - z0) * (0.4 + rand() * 0.3)], kind: 'kitchen', seed: l.seed + 1 });
  }
  E.push({ p: [VILLA[2] - 8.5, 3.8, 11.5], kind: 'kitchen', thr: 0, seed: 71 });
  E.push({ p: CENSER, kind: 'incense', thr: 0, seed: 7 });
  // the mist banks over the river and the pond at dawn
  for (let z = -150; z < 160; z += 40) E.push({ p: [RIVER_X(z), -2.6, z], kind: 'mist', thr: 0, seed: z + 200 });
  for (const [x, z] of [[-10, -40], [10, 20], [0, 55], [-50, -53], [-50, 53]]) E.push({ p: [x, -0.1, z], kind: 'mist', thr: 0, seed: Math.floor(x + z) + 300 });
  return E;
}
const RIVER_X = (z) => 170 + 15 * Math.sin(z / 110);

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
    for (const r of ATT) {
      const { site, smoke } = r;
      if (site.state !== 'ready' || !site.group.visible || !r.ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 11.5, 0.8, 0.5), bump(h, 17.5, 1.1, 1.0));
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, bump(h, 5.4, 1.5, 0.9), r.meal);
    }
  },
});
