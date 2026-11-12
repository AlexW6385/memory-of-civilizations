// Benin City about 1600 — smoke (docs/settlements/benin-city.md §8): kitchen smoke from a share of the compounds at the three meals,
// the thin smoke of the casters' furnaces by day, incense at the altar court, a low mist over the ditch at dawn. The engine part is
// src/engine/smoke.js; positions come from layout.js (the settlement's frame: x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, YARDS, RADIUS, crest, SHEDS, BRAZIERS } from './layout.js';

const ID = 'benin-city';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1600);
  for (const l of lots()) {
    if (rand() > 0.38) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + 0.4 * rand()), l.y + 4.6, z0 + (z1 - z0) * (0.3 + 0.4 * rand())], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the casters' furnaces
  for (const y of YARDS) if (y.kind === 'cast') {
    const [x0, z0, x1, z1] = y.rect, west = y.front === 'e';
    E.push({ p: [west ? x0 + 6.5 : x1 - 6.5, 1.9, z0 + 3.6], kind: 'kitchen', thr: 0, seed: y.seed + 5 });
  }
  // the incense in the altar court
  E.push({ p: [-66, 1.8, -120], kind: 'kitchen', thr: 0.2, seed: 78 });
  // the sellers' cooking fires by the waiting sheds before the gate (yam, plantain), the braziers of incense on the gate's porch
  for (const sh of SHEDS) if (sh.fire) E.push({ p: [sh.fire[0], 1.1, sh.fire[1]], kind: 'kitchen', thr: 0.02, seed: sh.seed + 3 });
  for (const b of BRAZIERS) E.push({ p: [b[0], 1.9, b[1]], kind: 'incense', thr: 0, seed: Math.round(b[0]) + 9 });
  // the cooks of the palace's kitchens behind the outer court
  for (const [x, z] of [[4, -104], [4, -44], [-135.5, -76], [-135.5, -20]]) E.push({ p: [x, 4.4, z], kind: 'kitchen', thr: 0.1, seed: Math.round(z) + 31 });
  // the mist over the ditch at dawn
  for (let a = 0; a < Math.PI * 2; a += 0.3) { const r = crest(a) + 16; E.push({ p: [Math.cos(a) * r, -2.6, Math.sin(a) * r], kind: 'mist', thr: 0, seed: Math.floor(a * 100) + 7 }); }
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
      const kitchen = Math.max(bump(h, 7.0, 0.8, 0.5), bump(h, 12.0, 0.9, 0.8), bump(h, 18.0, 1.0, 0.9));
      const mist = Math.max(bump(h, 5.8, 1.5, 1.0), 0.1);
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, mist, r.meal);
    }
  },
});
