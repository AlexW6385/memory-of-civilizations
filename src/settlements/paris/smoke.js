// Paris in 1248 — smoke, steam and mist (docs/settlements/paris.md §5c): the hearths' smoke from a share of the houses'
// chimneys at the three meals (smoke leaves by the chimney stack of the house itself), the bakers' ovens at dawn and
// the steam of the cook-shops, a faint mist on the Seine at first light. The engine part is src/engine/smoke.js;
// this registers the system and places the emitters from the layout. The coordinator adds the import to systems-list.js.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, NORTH_ARM, SOUTH_ARM, RADIUS, RIVER } from './layout.js';
import { chimneyAt, tradeOfSeed } from '../../styles/gothic/houses.js';

const ID = 'paris';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1250);
  for (const l of lots()) {
    const el = { rect: l.rect, y: RIVER.ground, seed: l.seed, front: l.front, storeys: l.storeys };
    const c = chimneyAt(el);
    if (c && rand() < 0.55) E.push({ p: c, kind: 'kitchen', seed: l.seed + 1 });
    const t = tradeOfSeed(l.seed);
    if (t === 'baker' || t === 'tavern') {
      const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
      if (rand() < 0.5) E.push({ p: [cx, RIVER.ground + 3.0, cz], kind: 'steam', thr: rand() * 0.3, seed: l.seed + 2 });
    }
  }
  for (const a of [NORTH_ARM, SOUTH_ARM]) for (let x = -RADIUS + 60; x < RADIUS - 60; x += 28) E.push({ p: [x, RIVER.level + 0.45, (a[1] + a[3]) / 2], kind: 'mist', thr: 0, seed: Math.floor(x) + 99 });
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
      const kitchen = Math.max(bump(h, 6.0, 0.8, 0.6), bump(h, 11.0, 0.8, 0.7), bump(h, 18.0, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 4.5) / 1.4)) * Math.min(1, Math.max(0, (19 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.2, 1.4, 0.9);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
