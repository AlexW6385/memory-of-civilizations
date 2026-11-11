// Petra — smoke (docs/settlements/petra.md §17): kitchen smoke from a share of the houses at the three meals (the court houses'
// ovens in their courts), the incense burning on the great altar before Qasr al-Bint all day, a thread from the shops of the
// incense dealers, a lamp-smoke from the Treasury's hall. The engine part is src/engine/smoke.js (one draw call).
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, QASR, lots, shopUnits, yards } from './layout.js';
import { houseLayout } from '../../styles/nabataean/house.js';

const ID = 'petra';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(50);
  for (const l of lots()) {
    if (r() > 0.4) continue;
    const H = houseLayout(l);
    if (H.court) { const [x, z] = H.P(H.court.cx - 1.2, H.court.cz + 0.8); E.push({ p: [x, l.y + 1.4, z], kind: 'kitchen', thr: 0.2 + 0.5 * r(), seed: l.seed + 1 }); }
    else { const [x, z] = H.P(H.W * (0.3 + 0.4 * r()), H.D * 0.6); E.push({ p: [x, l.y + H.h + 0.9, z], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 }); }
  }
  // the potters' kilns (the yard's dome, its chimney at the top) and the hearths before the tents
  for (const y of yards()) {
    const [x0, z0, x1, z1] = y.rect, s = y.gate === 's' ? 1 : -1;
    if (y.kind === 'potter') E.push({ p: [x1 - 3.2 - 0.6, y.y + 2.5, s > 0 ? z0 + 3.2 + 0.6 : z1 - 3.2 - 0.6], kind: 'kitchen', thr: 0.05, seed: y.seed });
    else if (y.kind === 'tents') E.push({ p: [(x0 + x1) / 2, y.y + 0.5, (z0 + z1) / 2 + s * 4.3], kind: 'kitchen', thr: 0.15, seed: y.seed + 1 });
  }
  E.push({ p: [QASR.altar[0], 1.9, QASR.altar[1]], kind: 'incense', thr: 0, seed: 7 });
  for (const s of shopUnits()) if ((s.i * 5 + 3) % 8 === 0 || (s.i * 5 + 3) % 8 === 5) E.push({ p: [s.x0 + 1.0, 1.3, s.z0 + 1.0], kind: 'incense', thr: 0.1, seed: 100 + s.i });
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
      const day = Math.min(1, Math.max(0, (h - 5.5) / 1.5)) * Math.min(1, Math.max(0, (20 - h) / 1.5));
      const meals = Math.max(bump(h, 6.5, 0.9, 0.7), bump(h, 12.5, 0.9, 0.5), bump(h, 18.5, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.12 + meals);
      const incense = 0.55 + 0.45 * Math.max(bump(h, 7.5, 1.2, 1), bump(h, 17, 1.4, 0.8));
      r.meal = h < 10 ? 0 : h < 16 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
