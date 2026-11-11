// Rome under Hadrian — smoke and steam (dossier §11): the bakery's oven by day from before dawn, the cookshops'
// (thermopolia) steam, kitchen smoke from a scattered share of the flats at the meals, the incense at the temple
// in the forum, the baths' furnace smoke. The engine part is src/engine/smoke.js; positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, rows, RADIUS, PISTRINUM, BATHS, TEMPLE } from './layout.js';

const ID = 'rome';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export function emitters() {
  const E = [], rand = rng(128);
  for (const l of lots()) if (rand() < 0.3) { const [x0, z0, x1, z1] = l.rect; E.push({ p: [x0 + (x1 - x0) * (0.3 + rand() * 0.4), 17.2, z0 + (z1 - z0) * (0.3 + rand() * 0.4)], kind: 'kitchen', seed: l.seed + 1 }); }
  // the shops: cookshops steam at their counters (the front's side of the row), a share of the flats above smoke
  for (const r of rows()) {
    const [x0, z0, x1, z1] = r.rect;
    if (rand() < 0.5) E.push({ p: [(x0 + x1) / 2, 14.5, (z0 + z1) / 2], kind: 'kitchen', seed: r.seed + 1 });
    if (rand() < 0.45) { const f = rand(), x = r.front === 'e' ? x1 - 0.8 : r.front === 'w' ? x0 + 0.8 : x0 + (x1 - x0) * f, z = r.front === 's' ? z1 - 0.8 : r.front === 'n' ? z0 + 0.8 : z0 + (z1 - z0) * f; E.push({ p: [x, 1.4, z], kind: 'steam', thr: rand() * 0.3, seed: r.seed + 2 }); }
  }
  // the bakery's chimney (the oven in the back corner, its flue 0.8 m over the roof at 5.0 m)
  E.push({ p: [PISTRINUM[2] - 0.5 - 2.2, 5.9, PISTRINUM[3] - 0.5 - 2.0], kind: 'kitchen', seed: 31, thr: 0 });
  E.push({ p: [(TEMPLE[2] + 6), 1.4, (TEMPLE[1] + TEMPLE[3]) / 2], kind: 'incense', thr: 0, seed: 9 });
  E.push({ p: [(BATHS[0] + BATHS[2]) / 2 + 20, 21, BATHS[3] - 12], kind: 'kitchen', seed: 5, thr: 0 });
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
      // (the Romans ate a light breakfast and a main meal at midday: the kitchens burn at dawn and noon, the cookshops all day)
      const kitchen = Math.max(bump(h, 6.5, 0.8, 0.6), bump(h, 12.3, 1.0, 0.8), bump(h, 17.0, 0.8, 0.5));
      const steam = Math.min(1, Math.max(0, (h - 5.5) / 1.2)) * Math.min(1, Math.max(0, (20.5 - h) / 1.5)) * 0.9;
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, 0, r.meal);
    }
  },
});
