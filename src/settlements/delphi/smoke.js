// Delphi — smoke (docs/settlements/delphi.md §9): hearth smoke from the houses' roofs at the meals, the altar of the Chians and the temple's fire, steam at the gate. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, ALTAR, TT_Y, TEMPLE, RADIUS } from './layout.js';

const ID = 'delphi';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(400);
  // the hearths of the Delphians' houses at the meals (the smoke leaves by the roof)
  for (const l of lots()) if (r() < 0.72) E.push({ p: [l.rect[0] + (l.rect[2] - l.rect[0]) * (0.3 + r() * 0.3), l.y + 4.2, l.rect[1] + (l.rect[3] - l.rect[1]) * (0.4 + r() * 0.3)], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: Math.round(l.rect[0] * 3 + l.rect[1]) });
  // the sacrifices on the altar of the Chians burn all day and the temple's hearth of pine is never let out: a plume over the altar, a thin one from the temple's roof
  E.push({ p: [ALTAR.c[0], TT_Y + 3.2, ALTAR.c[1]], kind: 'kitchen', thr: 0, seed: 3 });
  E.push({ p: [-2.5, TT_Y + 14.5, TEMPLE.cz], kind: 'kitchen', thr: 0.05, seed: 4 });
  // the forges and cook-shops of the walk-in houses burn all day; the braziers of the terrace and the forecourt
  for (const l of lots()) if (l.open && (l.trade === 'bronze' || l.trade === 'cook')) E.push({ p: [l.rect[0] + 3, l.y + 4.4, l.rect[3] - 3], kind: l.trade === 'cook' ? 'steam' : 'kitchen', thr: 0.02, seed: Math.round(l.rect[0] * 5 + l.rect[1]) });
  for (const [x, z, y] of [[ALTAR.c[0] - 7.6, ALTAR.c[1] - 3.4, TT_Y + 1.1], [ALTAR.c[0] - 7.6, ALTAR.c[1] + 3.4, TT_Y + 1.1], [101.8, 110.6, 2.6], [134, 112.8, 2.6]]) E.push({ p: [x, y + 0.5, z], kind: 'steam', thr: 0.1, seed: Math.round(x + z) });
  // the gate's stalls: a brazier of the cook-shop by the forecourt
  E.push({ p: [112, 2.2, 121], kind: 'steam', thr: 0.2, seed: 8 });
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 12.0, 0.9, 0.4), bump(h, 18.0, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.18 + meals);
      const steam = day * 0.85;
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, 0, r.meal);
    }
  },
});
