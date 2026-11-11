// Tang Chang'an — smoke, steam and dust (dossier §12): kitchen smoke from a share of the courtyard houses at the morning and
// midday meals, steam from the market's food shops and the wine shops' stoves by day, incense at the censers of Daci'en and the
// Daoist temple, a faint haze over the market at noon. The engine part is src/engine/smoke.js (one draw call); this registers the system
// and places the emitters from the layout. Emitters are in the settlement's frame (x east, y up, z south).
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, marketRows, RADIUS, DACI_AX, DAO_AX, WINE } from './layout.js';

const ID = 'tang-changan';
export const CENSER = [DACI_AX, 3.6, 128.4];
export const CENSER2 = [DAO_AX, 3.0, -86];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The emitters, from the layout (computed once). */
export function emitters() {
  const E = [], rand = rng(753);
  for (const l of lots()) {
    if (l.kind === 'hut' ? rand() > 0.5 : rand() > 0.35) continue;
    const [x0, z0, x1, z1] = l.rect;
    // the kitchen at the back of the court: the hall's roof, about 6 m up; the chimney-less smoke leaves by the gable
    const bx = (x0 + x1) / 2 + (rand() - 0.5) * (x1 - x0) * 0.4, bz = l.front === 's' ? z0 + 5 : l.front === 'n' ? z1 - 5 : (z0 + z1) / 2;
    E.push({ p: [l.front === 'e' ? x0 + 5 : l.front === 'w' ? x1 - 5 : bx, l.kind === 'hut' ? 3.4 : 6.2, l.front === 'e' || l.front === 'w' ? (z0 + z1) / 2 + (rand() - 0.5) * 6 : bz], kind: 'kitchen', seed: l.seed + 1 });
  }
  for (const r of marketRows()) {
    const [x0, z0, x1, z1] = r.foot, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (r.units.some((u) => u.trade === 'food') && rand() < 0.8) E.push({ p: [mx, 1.6, mz], kind: 'steam', thr: rand() * 0.3, seed: r.seed + 2 });
    if (r.units.some((u) => u.trade === 'wine') && rand() < 0.5) E.push({ p: [mx, 5.2, mz], kind: 'kitchen', seed: r.seed + 3, thr: 0 });
  }
  E.push({ p: [(WINE.foot[0] + WINE.foot[2]) / 2 + 4, 4.8, WINE.foot[1] + 2], kind: 'kitchen', seed: 11, thr: 0 });
  E.push({ p: CENSER, kind: 'incense', thr: 0, seed: 7 }, { p: CENSER2, kind: 'incense', thr: 0, seed: 8 });
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
      // (the Tang ate two meals, morning and late afternoon, the markets stirred from noon, so the steam starts then)
      const kitchen = Math.max(bump(h, 7.8, 0.9, 0.6), bump(h, 12.5, 0.8, 0.5), bump(h, 17.4, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 11.5) / 1.0)) * Math.min(1, Math.max(0, (18.5 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.4, 1.4, 0.3);
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
