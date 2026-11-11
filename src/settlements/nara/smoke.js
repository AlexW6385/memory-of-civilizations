// Nara in 752 — smoke (docs/settlements/nara.md §13): incense before the Great Buddha and in Kōfuku-ji's court, the
// monks' kitchens, kitchen smoke from a scattered share of the capital's houses at the three meals, steam from the
// market's cookshops by day. Engine part: src/engine/smoke.js. Positions in the settlement's frame.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, MARKET, KOFUKU } from './layout.js';

const ID = 'nara';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function emitters() {
  const E = [], rand = rng(2752);
  E.push({ p: [0, 4.3, -54.7], kind: 'incense', thr: 0, seed: 7 });                                  // the censer on the altar before the Buddha
  E.push({ p: [(KOFUKU.block[0] + KOFUKU.block[2]) / 2 - 12, 1.9, KOFUKU.block[1] + 36], kind: 'incense', thr: 0, seed: 11 });
  E.push({ p: [-100, 5.6, -165], kind: 'kitchen', thr: 0, seed: 31 }, { p: [100, 5.6, -150], kind: 'kitchen', thr: 0, seed: 32 });     // the monks' kitchens
  for (const l of lots()) {
    if (l.shop) {
      E.push({ p: [(l.rect[0] + l.rect[2]) / 2, 5.4, (l.rect[1] + l.rect[3]) / 2 + 1], kind: 'steam', thr: rand() * 0.3, seed: l.seed + 2 });
      continue;
    }
    if (rand() < 0.3) E.push({ p: [(l.rect[0] + l.rect[2]) / 2 + (rand() - 0.5) * 3, 5.5, (l.rect[1] + l.rect[3]) / 2], kind: 'kitchen', seed: l.seed + 1 });
  }
  const cz = (MARKET.block[1] + MARKET.block[3]) / 2;
  for (let i = 0; i < 4; i++) E.push({ p: [MARKET.block[0] + 12 + i * 15, 1.8, cz + (i % 2 ? 6.4 : -6.4)], kind: 'steam', thr: 0.1 * i, seed: 60 + i });
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
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.4)) * Math.min(1, Math.max(0, (19 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
