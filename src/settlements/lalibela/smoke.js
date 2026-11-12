// Lalibela — smoke (docs/settlements/lalibela.md §14): the cooking fires of the round houses seeping through
// their thatch at the morning, midday and evening meals (injera baked on the clay griddle, coffee), incense
// burned in the church doors, a mist on the escarpment's edge at dawn. The engine part is src/engine/smoke.js
// (one draw call); the places come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, PITS, HUT, houses, enterable, slope } from './layout.js';

const ID = 'lalibela';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], rand = rng(1220);
  // a house's smoke leaves through the thatch a little below its apex (wall 2.7 or 5.4 m, the cone 1.05 r + 0.7 over it)
  for (const h of houses()) {
    if (h.kind === 'store' || (h.kind !== 'kitchen' && rand() > 0.3)) continue;
    const H = h.storeys === 2 ? 5.4 : 2.7, hc = h.r * 1.05 + 0.7, y = slope(h.c[0], h.c[1]);
    E.push({ p: [h.c[0], y + H - 0.25 + hc * 0.72, h.c[1]], kind: 'kitchen', thr: h.kind === 'kitchen' ? 0.05 + 0.4 * rand() : 0.1 + 0.8 * rand(), seed: h.seed + 1 });
  }
  for (const h of enterable()) E.push({ p: [h.c[0], slope(h.c[0], h.c[1]) + 2.8 + 3.2, h.c[1]], kind: 'kitchen', thr: 0, seed: h.seed + 7 });
  // the house one can enter: its hearth always lit at the meals
  E.push({ p: [HUT.c[0], 2.8 + 3.2, HUT.c[1]], kind: 'kitchen', thr: 0, seed: 5 });
  // incense in the doors of the churches: Giyorgis' west door, Medhane Alem's west door, Maryam's court
  const G = PITS.giyorgis, M = PITS.medhane, Mm = PITS.maryam;
  E.push({ p: [(G.rect[0] + G.rect[2]) / 2 - 9, -G.depth + 1.95 + 1.0, (G.rect[1] + G.rect[3]) / 2], kind: 'incense', thr: 0, seed: 11 });
  E.push({ p: [M.rect[0] + 7.5, -M.depth + 1.1, (M.rect[1] + M.rect[3]) / 2], kind: 'incense', thr: 0, seed: 12 });
  E.push({ p: [(Mm.rect[0] + Mm.rect[2]) / 2 - 4, -Mm.depth + 1.7, (Mm.rect[1] + Mm.rect[3]) / 2], kind: 'incense', thr: 0, seed: 13 });
  // morning mist lying in the Jordan
  for (let x = -100; x <= 160; x += 40) E.push({ p: [x, -6.5, -14], kind: 'mist', thr: 0, seed: Math.floor(x) + 300 });
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
      const day = Math.min(1, Math.max(0, (h - 5.5) / 1.5)) * Math.min(1, Math.max(0, (20.5 - h) / 1.5));
      const kitchen = Math.min(1, day * 0.12 + Math.max(bump(h, 6.8, 0.9, 0.85), bump(h, 13, 1.0, 0.5), bump(h, 18.2, 1.1, 0.9)));
      const incense = 0.5 + 0.5 * Math.max(bump(h, 6.5, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      const mist = bump(h, 5.8, 1.3, 0.8);
      r.meal = h < 10 ? 0 : h < 15.5 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, mist, r.meal);
    }
  },
});
