// Chichén Itzá — smoke (docs/settlements/chichen-itza.md §14): kitchen smoke from a scatter of the town's houses at the meals (the
// hearth's smoke leaving through the thatch), copal incense burning at the Castillo's summit, in the Temple of the Warriors and at
// the Sacred Cenote's rim all day. The engine part is src/engine/smoke.js; positions come from the layout and the offerings' places.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, PLAZA_SHRINES, SWEATBATH } from './layout.js';
import { ground } from './ground.js';

const ID = 'chichen-itza';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1000);
  for (const l of lots()) for (const h of l.houses) {
    if (r() < 0.4) {
      // the hearth is at one rounded end of the long axis; its smoke through the thatch
      const s = r() < 0.5 ? 1 : -1, x = h.c[0] + (h.dir === 'x' ? s * h.a * 0.55 : 0), z = h.c[1] + (h.dir === 'z' ? s * h.a * 0.55 : 0);
      E.push({ p: [x, ground.height(x, z) + 4.2, z], kind: 'kitchen', thr: 0.25 + 0.5 * r(), seed: h.seed + 1 });
    }
  }
  for (const [x, z, rot] of PLAZA_SHRINES) E.push({ p: [x - 0.4, ground.height(x, z) + 1.1, z], kind: 'incense', thr: 0, seed: 40 + Math.floor(x + z) });   // the small altars' censers
  E.push({ p: [SWEATBATH.at[0], ground.height(...SWEATBATH.at) + 1.2, SWEATBATH.at[1] + 3.4], kind: 'kitchen', thr: 0.3, seed: 77 });                  // the sweat bath's fire
  E.push({ p: [-5.6, ground.height(-5.6, -240.2) + 0.5, -240.2], kind: 'incense', thr: 0, seed: 31 });   // the ladle censer at the cenote
  E.push({ p: [0, 24.9, 8.6], kind: 'incense', thr: 0, seed: 32 });                                  // the Castillo's summit
  E.push({ p: [118.0, 14.2, -13.2], kind: 'incense', thr: 0, seed: 33 });                              // the altar of the Atlanteans
  // the copal of the pilgrims at the Castillo's stair, and the camp's small fires along the plaza's south edge
  E.push({ p: [4.0, 0.8, 41.0], kind: 'incense', thr: 0, seed: 34 }, { p: [-4.0, 0.8, 41.0], kind: 'incense', thr: 0, seed: 35 });
  for (const [x, z] of [[-14, 100], [8, 99], [62, 98], [-68, 98]]) E.push({ p: [x, 0.5, z], kind: 'kitchen', thr: 0.3, seed: 60 + Math.floor(x) });
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 12.0, 0.9, 0.35), bump(h, 18.0, 1.1, 0.85));
      const kitchen = Math.min(1, day * 0.12 + meals);
      const incense = 0.55 + 0.45 * Math.max(bump(h, 6.5, 1.2, 1), bump(h, 17.5, 1.4, 0.8));
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, 0, 0, r.meal);
    }
  },
});
