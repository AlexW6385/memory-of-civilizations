// Modern Sydney, 1973 — smoke, steam and mist (docs/settlements/sydney.md §12): wood and coal smoke from the Rocks' terraces' chimneys
// at breakfast and in the evening, steam from the espresso machine of the bar by day, a faint mist over the cove and the harbour at
// dawn. The engine part is src/engine/smoke.js (one draw call); this registers the system and places the emitters from the layout.
// Emitter positions are in the settlement's frame (x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, LEVEL, RADIUS, COVE, inWater } from './layout.js';

const ID = 'sydney';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The emitters, from the layout (computed once). */
function emitters() {
  const E = [], rand = rng(1973);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, f = l.front ?? 'n';
    if (l.t === 'rocks_terrace' && l.kind === 'terrace') {
      // a chimney on the party walls of the row (rocks.js): on the ridge, 1.1 m behind it, its pots 1.5 m over the roof
      const L = x1 - x0, Dp = z1 - z0, n = Math.max(1, Math.round(L / 4.6)), fw = L / n, rise = Math.min(Dp / 2 * 0.58, 3.4), yT = l.y + 0.5 + 6.7 + rise + 1.7;
      for (let i = n === 1 ? 0 : 1; i < (n === 1 ? 1 : n); i++) {
        if (rand() > 0.5) continue;
        const u = n === 1 ? 0.45 : i * fw, d = Dp / 2 + 1.1, z = f === 'n' ? z0 + d : z1 - d;
        E.push({ p: [x0 + u, yT, z], kind: 'kitchen', seed: l.seed + i });
      }
    }
    if (l.t === 'espresso_bar') {
      // the machine on the counter (rooms.js: the counter along the east wall, its machine 4.8 m in)
      const L = x1 - x0, z = f === 'n' ? z0 + 4.8 : z1 - 4.8;
      E.push({ p: [x0 + L - 0.3 - 1.25, l.y + 0.12 + 1.95, z], kind: 'steam', thr: 0.05, seed: 21 });
    }
  }
  // the harbour's mist: banks along the cove and out on the water
  for (let x = COVE[0] + 10; x < COVE[2]; x += 22) for (let z = COVE[1] + 6; z < -30; z += 24) if (inWater(x, z)) E.push({ p: [x, LEVEL + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(x * 7 + z) });
  for (let x = -120; x < 220; x += 70) for (let z = -300; z < -130; z += 70) if (inWater(x, z) && Math.hypot(x, z) < RADIUS - 70) E.push({ p: [x, LEVEL + 0.45, z], kind: 'mist', thr: 0.3, seed: Math.floor(x * 3 + z) });
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
    // shown only when its shaders are built
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
      // nothing to draw when the eye is more than 300 m from the settlement's nearest edge
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.max(bump(h, 6.8, 0.9, 0.5), bump(h, 17.8, 1.1, 0.6));
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.4)) * Math.min(1, Math.max(0, (20 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.4, 1.4, 0.9);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
