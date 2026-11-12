// Abbasid Baghdad — smoke (docs/settlements/abbasid-baghdad.md §10): kitchen smoke from the flat roofs of a scatter of the houses at the meals, the
// palace kitchens through the day, the bakers' and the coppersmiths' fires at the ends of the suq rows, incense in the mosque's court. The engine
// part is src/engine/smoke.js (one draw call); positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, MOSQUE, ALL_SUQS as SUQS, HAMMAM_RECT, KHAN_RECT, WORKSHOPS, lots } from './layout.js';

const ID = 'abbasid-baghdad';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(800);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, top = (l.storeys ?? 1) * 3.5 + 0.8;
    if (l.use === 'kitchen') { for (let k = 0; k < 3; k++) E.push({ p: [x0 + (x1 - x0) * (0.25 + 0.25 * k), top + 0.4, z0 + (z1 - z0) * 0.3], kind: 'kitchen', thr: 0, seed: l.seed + k }); continue; }
    if (r() < 0.16) E.push({ p: [x0 + (x1 - x0) * (0.2 + 0.6 * r()), top, z0 + (z1 - z0) * (0.2 + 0.6 * r())], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 });
  }
  for (const s of SUQS) { E.push({ p: [s.rect[0] + 2, 4.6, s.rect[1] + 1.5], kind: 'kitchen', thr: 0.05, seed: Math.round(s.rect[0]) }); E.push({ p: [s.rect[2] - 2, 4.6, s.rect[3] - 1.5], kind: 'steam', thr: 0.2, seed: Math.round(s.rect[3]) }); }
  // the hammam's furnace chimney and steam, the bakers' and smiths' fires, the khan's cooking
  E.push({ p: [(HAMMAM_RECT[0] + HAMMAM_RECT[2]) / 2 + 2, 6.4, HAMMAM_RECT[1] + 3], kind: 'steam', thr: 0.1, seed: 41 }, { p: [(HAMMAM_RECT[0] + HAMMAM_RECT[2]) / 2 - 3, 6.2, HAMMAM_RECT[3] - 3], kind: 'kitchen', thr: 0.05, seed: 42 });
  for (const w of WORKSHOPS) if (w.kind !== 'perfumer') E.push({ p: [(w.rect[0] + w.rect[2]) / 2 + 1, 6.0, (w.rect[1] + w.rect[3]) / 2 + 2], kind: 'kitchen', thr: 0, seed: Math.round(w.rect[0]) });
  E.push({ p: [(KHAN_RECT[0] + KHAN_RECT[2]) / 2 - 12, 7.0, KHAN_RECT[1] + 8], kind: 'kitchen', thr: 0.2, seed: 43 });
  E.push({ p: [(MOSQUE[0] + MOSQUE[2]) / 2 + 6, 1.4, (MOSQUE[1] + MOSQUE[3]) / 2 - 12], kind: 'incense', thr: 0.1, seed: 31 });
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.7), bump(h, 12.5, 0.9, 0.4), bump(h, 19.0, 1.1, 0.8));
      const kitchen = Math.min(1, day * 0.18 + meals);
      const incense = 0.5 + 0.5 * Math.max(bump(h, 7.0, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      const steam = day * 0.6;
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, incense, steam, 0, r.meal);
    }
  },
});
