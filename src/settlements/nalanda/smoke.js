// Nalanda — smoke (docs/settlements/nalanda.md §9): the village's kitchen fires at the morning and evening meals, incense burnt
// before the shrines of Monastery 1 and the great temple. The engine part is src/engine/smoke.js (one draw call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, M1, T3, lots, height, ANNEXES, WAY_LAMPS, BOOTHS } from './layout.js';

const ID = 'nalanda';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(640);
  for (const l of lots()) {
    if (r() < 0.5) {
      const [x0, z0, x1, z1] = l.rect, x = x0 + (x1 - x0) * (0.3 + 0.4 * r()), z = z0 + (z1 - z0) * (0.3 + 0.4 * r());
      E.push({ p: [x, height(x, z) + 3.9, z], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 });
    }
  }
  const [x0, z0, x1, z1] = M1.rect, zc = (z0 + z1) / 2, sx = x1 - 7.6 - 8;
  E.push({ p: [sx - 3.2, 0.5, zc - 1.2], kind: 'incense', thr: 0, seed: 31 }, { p: [sx - 3.2, 0.5, zc + 1.2], kind: 'incense', thr: 0.2, seed: 32 });
  E.push({ p: [T3.c[0] + T3.half + 8, 0.5, -3], kind: 'incense', thr: 0.1, seed: 33 }, { p: [T3.c[0] + T3.half + 8, 0.5, 3], kind: 'incense', thr: 0.3, seed: 34 });
  // the monasteries' kitchens: the chimneys of the hearths in the annexes; incense at the booths of the lamp-sellers
  for (const a of ANNEXES) if (a.kind === 'kitchen') for (let i = 0; i < 3; i++) E.push({ p: [a.rect[0] + 2.5 + i * ((a.rect[2] - a.rect[0] - 5) / 2), 5.4, a.rect[1] + 0.9], kind: 'kitchen', thr: i * 0.1, seed: 60 + i });
  for (const b of BOOTHS) if (b[3] === 'lamps') E.push({ p: [b[0] + 0.5, 1.4, b[1]], kind: 'incense', thr: 0.2, seed: 70 + Math.round(b[1]) });
  void x0; void z1; void WAY_LAMPS;
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
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.4), bump(h, 19.0, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.12 + meals);
      const incense = 0.5 + 0.5 * Math.max(bump(h, 6.5, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
