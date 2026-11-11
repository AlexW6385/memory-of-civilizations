// Khajuraho about 1050 — smoke and mist (docs/settlements/khajuraho.md §12): cooking smoke from a share of the
// village houses at the morning and evening meals, incense in each temple's porch all day, a faint mist over
// the Shivsagar tank at dawn. The engine part is src/engine/smoke.js; positions here come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, TANK, TEMPLES, tankD } from './layout.js';
import { porchOf } from './life.js';

const ID = 'khajuraho';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1052);
  // the clay stove's smoke leaves under the eaves of the tiled roof, near the back of the house
  for (const l of lots()) {
    if (rand() > 0.5) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + rand() * 0.4), 3.9, z0 + (z1 - z0) * (0.55 + rand() * 0.2)], kind: 'kitchen', seed: l.seed + 1 });
  }
  // incense burning before the sanctum's door, at the porch's west end
  TEMPLES.forEach((t, i) => { const { r, floor, cz } = porchOf(t); E.push({ p: [r[0] + 0.9, floor + 1.0, cz + 0.9], kind: 'incense', thr: 0, seed: 7 + i }); });
  // mist banks over the tank's middle at dawn
  for (let a = 0; a < 6.28; a += 0.9) for (const f of [0.35, 0.7]) {
    const x = TANK.c[0] + Math.cos(a) * TANK.r[0] * f, z = TANK.c[1] + Math.sin(a) * TANK.r[1] * f;
    if (tankD(x, z) > -3 || Math.hypot(x, z) > RADIUS - 20) continue;
    E.push({ p: [x, TANK.level + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(a * 10 + f * 100) });
  }
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
      const kitchen = Math.max(bump(h, 6.4, 0.8, 0.6), bump(h, 12.0, 0.8, 0.5), bump(h, 18.2, 1.0, 0.9));
      smoke.setLevels(kitchen, 1, 0, bump(h, 5.4, 1.3, 0.8), h < 9 ? 0 : h < 15 ? 1 : 2);
    }
  },
});
