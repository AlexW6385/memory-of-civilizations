// Mississippian Cahokia — smoke and mist (docs/settlements/cahokia.md §5.5): the hearth smoke of a
// share of the houses leaving by the roof (kept burning most of the day in the cool months, cooking at
// the meals), the fire rings of the neighbourhood plazas, the potters' pit fires, the great house's
// two hearths and the eternal fire of the charnel house, a mist lying on Cahokia Creek at dawn. The
// engine part is src/engine/smoke.js; the coordinator registers this system.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, smallPlazas, RADIUS, CREEK, creekZ, SUMMIT, FOX, height } from './layout.js';

const ID = 'cahokia';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1175);
  for (const l of lots()) if (rand() < 0.38) {
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [(x0 + x1) / 2 + (rand() - 0.5) * 1.2, l.y + 2 + 3.0, (z0 + z1) / 2], kind: 'kitchen', thr: rand() * 0.6, seed: l.seed + 1 });
  }
  smallPlazas().forEach((p, i) => {
    E.push({ p: [p.c[0], height(p.c[0], p.c[1]) + 0.5, p.c[1]], kind: 'kitchen', thr: 0.3 + rand() * 0.4, seed: p.seed + 3 });
    if (i % 2) E.push({ p: [p.c[0] + 8.6, height(p.c[0] + 8.6, p.c[1] - 5.5) + 0.6, p.c[1] - 5.5], kind: 'kitchen', thr: 0.5 + rand() * 0.3, seed: p.seed + 4 });   // the pottery pit
  });
  // the great house on the summit: its hearths' smoke leaves by the roof
  const cx = (SUMMIT[0] + SUMMIT[2]) / 2, cz = SUMMIT[1] + 30, yS = height(cx, cz);
  for (const f of [0.3, 0.7]) E.push({ p: [SUMMIT[0] + (SUMMIT[2] - SUMMIT[0]) * f, yS + 4.4 + 9.6, cz], kind: 'kitchen', thr: 0, seed: 31 + Math.floor(f * 10) });
  // the eternal fire of the charnel house
  const fx = (FOX[0] + FOX[2]) / 2, fz = (FOX[1] + FOX[3]) / 2;
  E.push({ p: [fx, height(fx, fz) + 3.0 + 6.0, fz], kind: 'incense', thr: 0, seed: 17 });
  // mist on the creek
  for (let x = -RADIUS + 70; x < RADIUS - 70; x += 28) E.push({ p: [x, CREEK.level + 0.45, creekZ(x)], kind: 'mist', thr: 0, seed: Math.floor(x) + 99 });
  return E;
}

const ATT = [];
registerSystem({
  attach(site, world) {
    if (site.id !== ID) return;
    const smoke = new Smoke(emitters(), { name: 'smoke:' + ID });
    site.group.add(smoke.mesh);
    const rec = { site, smoke, ready: false };
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
      const kitchen = Math.max(bump(h, 6.5, 1.0, 0.7), bump(h, 12, 1.0, 0.7), bump(h, 18, 1.4, 1.0));
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, bump(h, 5.4, 1.4, 0.9), r.meal);
    }
  },
});
