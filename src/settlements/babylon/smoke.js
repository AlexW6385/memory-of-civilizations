// Babylon — smoke (docs/settlements/babylon.md §12): kitchen smoke from a scatter of the houses at the meals (the oven
// of the courtyard, vented over the flat roof), the brick-kilns and bakers' ovens of the quarter by day, the incense and
// burnt offerings of Esagila's court and the great altar, the censers at the foot of the ziggurat's stair, a mist on the
// Euphrates at dawn. The engine part is src/engine/smoke.js (one draw call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, ZIGGURAT, ESAGILA, RIVER, QUAY, lots, riverX } from './layout.js';

const ID = 'babylon';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(570);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, k = r();
    if (k < 0.36) E.push({ p: [x0 + (x1 - x0) * (0.25 + 0.5 * r()), 3.9, z0 + (z1 - z0) * (0.3 + 0.4 * r())], kind: 'kitchen', thr: 0.3 + 0.5 * r(), seed: l.seed + 1 });
  }
  // Esagila: the great altar in the court, and the incense before the cella (court: x 32…63 from the west side; the middle line)
  const zc = (ESAGILA[1] + ESAGILA[3]) / 2, cx = ESAGILA[0] + 32;
  E.push({ p: [cx + 17, 1.8, zc], kind: 'incense', thr: 0, seed: 11 });
  E.push({ p: [cx + 4, 1.4, zc - 6], kind: 'incense', thr: 0.1, seed: 12 });
  E.push({ p: [cx + 4, 1.4, zc + 6], kind: 'incense', thr: 0.1, seed: 13 });
  // the censers at the foot of the tower's stair (south)
  E.push({ p: [ZIGGURAT.c[0] - 7, 1.4, ZIGGURAT.c[1] + 60], kind: 'incense', thr: 0.15, seed: 14 });
  E.push({ p: [ZIGGURAT.c[0] + 7, 1.4, ZIGGURAT.c[1] + 60], kind: 'incense', thr: 0.15, seed: 15 });
  // the river's mist, along its length
  for (let z = -300; z < 330; z += 34) E.push({ p: [riverX(z), RIVER.level + 0.45, z], kind: 'mist', thr: 0, seed: z + 400 });
  void QUAY;
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
      const meals = Math.max(bump(h, 6.2, 0.9, 0.7), bump(h, 12.3, 0.9, 0.5), bump(h, 18.5, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.14 + meals);
      const incense = 0.55 + 0.45 * Math.max(bump(h, 6.5, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      const mist = bump(h, 5.3, 1.3, 0.8);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, mist, r.meal);
    }
  },
});
