// Sanchi — smoke (docs/settlements/sanchi.md §12): the village's kitchen fires at the morning and evening meals, and incense burnt
// before the Great Stupa's south gateway and at Stupa 2. The engine part is src/engine/smoke.js (one draw call); positions
// come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, TOP, STUPA2, TANK, SHRINE, lots, height, tankD } from './layout.js';
import { SUMMIT_STALLS } from './summit.js';
import { STALLS } from './village.js';

const ID = 'sanchi';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(50);
  for (const l of lots()) {
    if (r() < 0.45) {
      const [x0, z0, x1, z1] = l.rect, x = x0 + (x1 - x0) * (0.3 + 0.4 * r()), z = z0 + (z1 - z0) * (0.3 + 0.4 * r());
      E.push({ p: [x, height(x, z) + 3.9, z], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 });
    }
  }
  // the smith's forge and the sweet-maker's pan steam; incense at the stalls that sell it, the tree shrine and the rest halls
  for (const l of lots()) if (l.kind === 'shop' && (l.trade === 'smith' || l.trade === 'sweets') && !l.farm) {
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [(x0 + x1) / 2, height((x0 + x1) / 2, (z0 + z1) / 2) + 3.7, (z0 + z1) / 2], kind: l.trade === 'smith' ? 'kitchen' : 'steam', thr: 0.05, seed: l.seed + 3 });
  }
  for (const [x, z, , t] of SUMMIT_STALLS) if (t === 'incense' || t === 'lamps') E.push({ p: [x, TOP + 1.0, z], kind: 'incense', thr: 0.1 + (z % 7) / 20, seed: Math.floor(x * 7 + z) });
  for (const [x, z, , t] of STALLS) if (t === 'incense' || t === 'lamps') E.push({ p: [x, 1.0, z], kind: 'incense', thr: 0.1, seed: Math.floor(x * 5 + z) });
  E.push({ p: [SHRINE.c[0], 1.1, SHRINE.c[1] + 1.2], kind: 'incense', thr: 0, seed: 41 });
  E.push({ p: [-18, TOP + 1.0, 78], kind: 'kitchen', thr: 0.2, seed: 43 });
  // mist over the tank at dawn
  for (let a = 0; a < 6.28; a += 1.0) for (const f of [0.35, 0.7]) {
    const x = TANK.c[0] + Math.cos(a) * TANK.r[0] * f, z = TANK.c[1] + Math.sin(a) * TANK.r[1] * f;
    if (tankD(x, z) > -3) continue;
    E.push({ p: [x, TANK.level + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(a * 10 + f * 100) });
  }
  E.push({ p: [-2.2, TOP + 0.5, 21], kind: 'incense', thr: 0, seed: 31 });
  E.push({ p: [2.2, TOP + 0.5, 21], kind: 'incense', thr: 0.2, seed: 32 });
  E.push({ p: [STUPA2.c[0] + 14, STUPA2.y + 0.5, 0], kind: 'incense', thr: 0.3, seed: 33 });
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
      const dawn = 0.7 * bump(h, 6.0, 1.0);
      smoke.setLevels(kitchen, incense, kitchen * 0.5, dawn, r.meal);
    }
  },
});
