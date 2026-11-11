// Joseon Hanyang — smoke and steam (docs/settlements/joseon-seoul.md §14): kitchen smoke from a share of
// the hanok at the meals, the ondol's evening firing (the flue's smoke leaves by the low chimney at a
// wing's end), steam from the Jongno food stalls by day, incense at the bronze burners on the throne
// hall's upper terrace. Registered by one line in src/engine/systems-list.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, SHOPS, YANGBAN } from './layout.js';

const ID = 'joseon-seoul';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1888);
  for (const l of lots()) {
    const [x0, z0, x1] = l.rect;
    // the kitchen's smoke through the roof at the range's west end; the ondol flue's low chimney (1.5 m) at its end
    if (rand() < 0.45) E.push({ p: [x0 + 3 + rand() * 4, 0.6 + 2.6 + (l.thatch ? 1.6 : 1.9), z0 + 3], kind: 'kitchen', seed: l.seed + 1 });
    if (rand() < 0.3) E.push({ p: [x0 + 0.75 - 1.5 + (rand() < 0.5 ? 0 : x1 - x0 - 1.5), 1.55, z0 + 2.1], kind: 'kitchen', thr: 0.4 + rand() * 0.4, seed: l.seed + 2 });
  }
  // the yangban house: the anchae's kitchen, the ondol of the anbang
  const [x0, z0] = YANGBAN;
  E.push({ p: [x0 + 5.5 + 1.4, 0.5 + 2.4 + 2.0, z0 + 3.4], kind: 'kitchen', thr: 0, seed: 77 });
  E.push({ p: [x0 + 5.5 - 0.5, 1.6, z0 + 2.0], kind: 'kitchen', thr: 0.3, seed: 78 });
  // food stalls of Jongno: steam before the shop rows
  for (const [sx0, sz0, sx1] of SHOPS) for (let x = sx0 + 9; x < sx1 - 6; x += 31) if (rand() < 0.6) E.push({ p: [x, 1.3, sz0 - 1.4], kind: 'steam', thr: rand() * 0.3, seed: Math.floor(x) });
  // the burners on the throne hall's upper terrace (y 3.2), the tripods at x ±10, z 38.5
  for (const x of [-10, 10]) E.push({ p: [x, 3.2 + 1.4, 38.5], kind: 'incense', thr: 0, seed: 50 + x });
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
      // breakfast, the noon meal, supper and the ondol's long evening firing
      const kitchen = Math.max(bump(h, 6.3, 0.9, 0.7), bump(h, 11.8, 0.8, 0.6), bump(h, 17.5, 1.1, 1.0), bump(h, 19.5, 1.5, 0.6));
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.4)) * Math.min(1, Math.max(0, (20 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
