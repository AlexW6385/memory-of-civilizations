// Qufu — smoke (docs/settlements/lu-qufu.md §8): the hearths of the courtyard houses at the meals, the bakers' and cooks' ovens of the markets, incense
// before the throne and at the gates. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, MX, HALL, ALTAR, shopRuns, lots as townLots } from './layout.js';

const ID = 'lu-qufu';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1730);
  // the hearths of the courtyard houses at the meals: the kitchen's chimney behind the main house
  for (const l of townLots()) {
    if (r() > 0.5) continue;
    const [x0, z0, x1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.25 + 0.5 * r()), 5.6, z0 + 3.2], kind: 'kitchen', thr: 0.2 + 0.7 * r(), seed: l.seed + 3 });
  }
  // the shops of Queli Street: the cake-sellers' and the noodle-cooks' stoves
  for (const s of shopRuns()) {
    const [x0, z0, x1, z1] = s.rect;
    for (let i = 0; i < s.n; i++) if (r() < 0.25) E.push({ p: [(x0 + x1) / 2, 4.2, z0 + (i + 0.5) * (z1 - z0) / s.n], kind: 'kitchen', thr: 0, seed: i * 11 + Math.round(z0) });
  }
  // the mansion's kitchens, behind the great halls
  for (const dz of [-80, -112, 20]) E.push({ p: [MX + 22, 5.4, dz], kind: 'kitchen', thr: 0.1, seed: dz + 400 });
  // incense: before the shrine of Confucius, at the bronze burners of the hall, the Apricot Altar, the Resting Hall, the Kuiwen gate
  const zb = HALL.rect[1] + 1;
  for (const [x, y, z, thr] of [[-1.8, HALL.y + 2.4, zb + 9.2, 0], [1.8, HALL.y + 2.4, zb + 9.2, 0], [-5.4, HALL.y + 1.1, zb + 12.2, 0], [5.4, HALL.y + 1.1, zb + 12.2, 0], [ALTAR.c[0] + 2.4, 1.2, ALTAR.c[1] + 2.6, 0.05], [-12.5, HALL.y + 3.3, -106, 0.1], [12.5, HALL.y + 3.3, -106, 0.1], [0, 1.4, -170, 0.2], [0, 1.4, 20, 0.3]]) E.push({ p: [x, y, z], kind: 'incense', thr, seed: Math.round(x * 3 + z) });
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
      const day = Math.min(1, Math.max(0, (h - 4.8) / 1.5)) * Math.min(1, Math.max(0, (19.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.5, 0.9, 0.8), bump(h, 17.0, 1.0, 0.9));
      const kitchen = Math.min(1, day * 0.4 + meals);
      const incense = 0.4 + 0.6 * Math.max(bump(h, 7.5, 1.4, 1), bump(h, 17.0, 1.4, 0.7));
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.8, 0, r.meal);
    }
  },
});
