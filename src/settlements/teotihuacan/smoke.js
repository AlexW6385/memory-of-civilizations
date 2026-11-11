// Teotihuacan — smoke (docs/settlements/teotihuacan.md §14): the compounds' kitchen hearths (the smoke hole in the flat roof) at
// the morning and evening meals, the incense burning on the censers of the plazas' altars and the Sun's temple all day. The engine
// part is src/engine/smoke.js (one draw call); the places come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, compounds, LEVELS } from './layout.js';

const ID = 'teotihuacan';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(450);
  // a compound's kitchen is the room off its west portico; its smoke hole is over the room's back corner, the flat roof about 3.2 m up
  for (const c of compounds()) {
    if (r() > 0.6) continue;
    const [x0, z0, x1, z1] = c.rect, cw = (x1 - x0 - 2) / 3, cd = (z1 - z0 - 2) / 3;
    E.push({ p: [x0 + 1 + cw * (0.35 + 0.3 * r()), 3.4 + 0.2, z0 + 1 + cd * (1.2 + 0.6 * r())], kind: 'kitchen', thr: 0.2 + 0.7 * r(), seed: c.seed + 1 });
  }
  // the censers on the arrival plaza's great altar (9 m, 1.6 m high) and the lone altar, the Moon Plaza's altar
  const y = LEVELS[2];
  for (const [x, yy, z, s] of [[-1.5, y + 1.9, 15, 31], [1.5, y + 1.9, 15, 32], [-9, y + 1.6, 42, 33], [0, 3 + 1.2, -209, 34]]) E.push({ p: [x, yy + 0.4, z], kind: 'incense', thr: 0, seed: s });
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
      const kitchen = Math.min(1, day * 0.15 + Math.max(bump(h, 6.5, 0.9, 0.8), bump(h, 13, 0.9, 0.45), bump(h, 18.5, 1.1, 0.85)));
      const incense = 0.55 + 0.45 * Math.max(bump(h, 7.5, 1.4, 1), bump(h, 17, 1.6, 0.8));
      r.meal = h < 10 ? 0 : h < 15.5 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
