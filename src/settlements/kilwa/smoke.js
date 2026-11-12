// Kilwa about 1330 — smoke, steam and mist (docs/settlements/kilwa.md §17): cooking fires in the courts of the stone houses at
// the meals (a share of them, from the back rooms' makuti roofs), the cooking pots of the market stalls by day, incense (uvumba)
// at the Great Mosque's north door and in Husuni Kubwa's audience court, a low mist on the harbour at dawn. The engine part is
// src/engine/smoke.js (one draw call); the emitters come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, SEA, MOSQUE, COURTS, PY, HARBOUR, lots, height } from './layout.js';
import { market } from './life.js';

const ID = 'kilwa';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1331);
  for (const l of lots()) {
    if (r() > 0.38) continue;
    const [x0, z0, x1, z1] = l.rect, x = x0 + (x1 - x0) * (0.3 + 0.5 * r()), z = l.flip ? z0 + 1.2 + r() : z1 - 1.2 - r();
    E.push({ p: [x, l.y + 3.9, z], kind: 'kitchen', thr: r(), seed: l.seed + 1 });
  }
  // a cooking pot on the fire at one in four of the market's stalls (hot food for the porters and sailors)
  for (const m of market()) if (m.t === 'stall' && (m.seed % 4) === 0) E.push({ p: [m.at[0] + 1.6, m.y + 0.9, m.at[1]], kind: 'steam', thr: (m.seed % 7) / 10, seed: m.seed % 1000 });
  // incense: before the mosque's north door (x = −15, z = −30) and in the sultan's audience court
  E.push({ p: [-15, height(-15, -31) + 1.0, -31.6], kind: 'incense', thr: 0, seed: 5 });
  const a = COURTS.audience.rect;
  E.push({ p: [(a[0] + a[2]) / 2, PY + 0.9, (a[1] + a[3]) / 2], kind: 'incense', thr: 0.1, seed: 6 });
  // the harbour's mist, in banks over the open water
  for (let x = HARBOUR[0] + 20; x < HARBOUR[2] - 10; x += 38) for (const z of [HARBOUR[1] + 10, HARBOUR[3] - 12]) E.push({ p: [x, SEA + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(x + z) + 99 });
  void MOSQUE;
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
      const kitchen = Math.max(bump(h, 6.2, 0.8, 0.6), bump(h, 12.5, 0.9, 0.5), bump(h, 18.0, 1.0, 0.9));
      const day = Math.min(1, Math.max(0, (h - 6.0) / 1.5)) * Math.min(1, Math.max(0, (19.0 - h) / 1.5));
      const incense = 0.35 + 0.65 * Math.max(bump(h, 12.3, 1.2, 1), bump(h, 15.5, 1.2, 0.8), bump(h, 18.4, 1.0, 0.8));
      const mist = bump(h, 5.6, 1.3, 0.8);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.8, mist, r.meal);
    }
  },
});
