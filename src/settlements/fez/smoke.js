// Fez about 1350 — smoke (docs/settlements/fez.md §8): kitchen smoke from a scattered share of the houses' roofs at the three meals,
// the tannery's hearths, the coppersmiths' charcoal and incense at the Qarawiyyin by day. Engine part: src/engine/smoke.js.
// The coordinator registers this system in src/engine/systems-list.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, SITES, RADIUS, siteY } from './layout.js';
import { houseList } from './houses.js';

const ID = 'fez';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
function emitters() {
  const E = [], rand = rng(1351);
  for (const l of lots()) {
    if (rand() > 0.4) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.25 + rand() * 0.5), l.y + 3.7 + 3.25 * (l.storeys - 1) + 1.1, z0 + (z1 - z0) * (0.25 + rand() * 0.5)], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the bakers' ovens (furnan): a thin smoke from the roof over each bread dukkan, early and at midday
  for (const h of houseList()) if (h.shops?.includes('bread') && Math.hypot(h.rect[0], h.rect[1]) < 280) E.push({ p: [(h.rect[0] + h.rect[2]) / 2, h.y + 3.7 + 3.25 * (h.storeys - 1) + 1.2, (h.rect[1] + h.rect[3]) / 2], kind: 'kitchen', thr: 0.1, seed: h.seed + 3 });
  const T = SITES.tannery, yt = siteY('tannery'), s = SITES.seffarine;
  for (const [x, z] of [[T[0] + 3.5, T[1] + 14], [T[2] - 3.5, T[1] + 30]]) E.push({ p: [x, yt + 11, z], kind: 'kitchen', thr: 0, seed: 81 });
  for (const [x, z] of [[s[0] - 2, s[1] + 10], [s[2] + 2, s[1] + 16]]) E.push({ p: [x, siteY('tannery') + 5, z], kind: 'kitchen', thr: 0.2, seed: 82 });
  const q = SITES.qar; E.push({ p: [(q[0] + q[2]) / 2, siteY('qar') + 1.2, q[1] + 14], kind: 'steam', thr: 0, seed: 83 });
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
      const kitchen = Math.max(bump(h, 6.8, 0.8, 0.6), bump(h, 13.0, 0.9, 0.7), bump(h, 19.0, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 6) / 1.5)) * Math.min(1, Math.max(0, (21 - h) / 1.5)) * 0.6;
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
