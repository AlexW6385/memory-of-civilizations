// Qin Xianyang — smoke (docs/settlements/qin-xianyang.md §6): the round kilns of the figure-makers' quarter (the steady smoke of a firing),
// the cooking fires of the houses at the meals, the brazier and lamps of the palace hall (incense), the lamps of the pit (a thin
// soot). The engine part is src/engine/smoke.js (one draw call); positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, HALL, STAIR, PIT, RAMP, rampZ, shopLots, lots as townLots } from './layout.js';
import { ground } from './ground.js';

const ID = 'qin-xianyang';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(210);
  for (const l of townLots()) {
    const [x0, z0, x1, z1] = l.rect, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, y = ground.height(mx, mz);
    if (l.trade === 'kiln') E.push({ p: [mx, y + 4.0, l.front === 'n' ? z0 + 12 : z1 - 12], kind: 'kitchen', thr: 0, seed: l.seed + 1 }, { p: [mx + 0.4, y + 4.0, l.front === 'n' ? z0 + 12.3 : z1 - 12.3], kind: 'steam', thr: 0.05, seed: l.seed + 2 });
    else if (l.trade === 'clay' || l.trade === 'paint') E.push({ p: [x0 + 3, y + 1.0, l.front === 'n' ? z0 + 4 : z1 - 4], kind: 'steam', thr: 0.3, seed: l.seed + 1 });
    else if (l.kind !== 'garden' && l.kind !== 'granary' && !l.trade && r() < 0.3) E.push({ p: [mx + (r() - 0.5) * 2, y + 3.6, mz + (r() - 0.5) * 3], kind: 'kitchen', thr: 0.3 + 0.6 * r(), seed: l.seed + 3 });
  }
  // the hall's braziers: incense before the dais; the pit: the soot of the lamps at the corridors' mouths
  for (const [x, z] of [[(HALL.x0 + HALL.x1) / 2 - 7.5, HALL.z0 + 12], [(HALL.x0 + HALL.x1) / 2 + 7.5, HALL.z0 + 12]]) E.push({ p: [x, 9.4, z], kind: 'incense', thr: 0, seed: Math.round(x) });
  E.push({ p: [STAIR.x, 1.5, -40], kind: 'incense', thr: 0.2, seed: 9 });
  for (const [x, z] of [[118, -137], [118, -121], [118, -105]]) E.push({ p: [x, -3.3, z], kind: 'kitchen', thr: 0.6, seed: Math.round(z) });
  // the yard: the braziers at the three portals, the beacon on the watch tower, the kitchen of the gangs' sheds
  for (let i = 0; i < 3; i++) for (const q of [-1, 1]) E.push({ p: [PIT.x1 + RAMP.len + 2.2, 1.6, rampZ(i) + q * (RAMP.w / 2 + 0.55 + 1.6)], kind: 'incense', thr: 0.1, seed: 40 + i * 2 + (q > 0 ? 1 : 0) });
  E.push({ p: [PIT.x1 + RAMP.len + 54, 7.4, rampZ(0) - 24], kind: 'kitchen', thr: 0, seed: 77 });
  for (let k = 0; k < 2; k++) E.push({ p: [PIT.x1 + RAMP.len + 31 + k * 11, 2.6, rampZ(0) - 12 - k * 11], kind: 'kitchen', thr: 0.4, seed: 88 + k });
  // the market's wine and cook shops (their stoves), the shop-houses' chimneys
  shopLots().forEach((l, i) => { if (i % 3 === 0) E.push({ p: [(l.rect[0] + l.rect[2]) / 2, 5.2, (l.rect[1] + l.rect[3]) / 2], kind: 'kitchen', thr: 0.35, seed: l.seed }); });
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
      const meals = Math.max(bump(h, 7.0, 0.9, 0.8), bump(h, 12.0, 0.9, 0.4), bump(h, 18.0, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.5 + meals);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, day * 0.6, day * 0.8, 0, r.meal);
    }
  },
});
