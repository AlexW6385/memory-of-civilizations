// Mount Wutai in 857 — smoke (docs/settlements/tang-wutai.md §12): incense from the bronze burners before the Great East Hall and
// the Hall of Manjusri all day, the kitchen of the monks' quarters, kitchen smoke from the kang's chimney of a scattered
// share of the village's houses at the three meals. Engine part: src/engine/smoke.js. Positions in the settlement's frame.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS } from './layout.js';
import { village } from './village.js';
import { CENSERS } from './monastery.js';

const ID = 'tang-wutai';
function emitters() {
  const E = [];
  CENSERS.forEach(([x, z, y], i) => E.push({ p: [x, y + 0.35 + 1.22, z], kind: 'incense', thr: 0, seed: 7 + i }));
  // the monks' kitchen: the east end of the south range's roof (quarters at x −43…−16, z 35…43)
  E.push({ p: [-20, 8.4, 39], kind: 'kitchen', thr: 0, seed: 31 });
  for (const s of village().smoke) E.push({ p: [s.p[0], s.y + 1.7, s.p[1]], kind: 'kitchen', seed: s.r + 1 });
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
    for (const r of ATT) {
      const { site, smoke } = r;
      if (site.state !== 'ready' || !site.group.visible || !r.ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.max(bump(h, 6.4, 0.8, 0.6), bump(h, 11.5, 0.8, 0.7), bump(h, 17.4, 1.0, 0.9));
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, 0, r.meal);
    }
  },
});
