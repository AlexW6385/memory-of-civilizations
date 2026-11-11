// SG̱ang Gwaay — smoke (docs/settlements/sgang-gwaay.md §4a): the hearth smoke leaving by each house's smoke hole at the ridge
// (the landmark's open and burning, the others' by their meals), the smoke of the fish racks' fires on the street, a drift of
// forest mist at the tree line. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { houses, village, height, G, RADIUS, toWorld } from './layout.js';

const ID = 'sgang-gwaay';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1850);
  for (const h of houses()) {
    // the hole at the ridge, middle of the ridge (haida_house)
    const [x, z] = toWorld(h, 0, 0);
    E.push({ p: [x, G + h.ridge + 0.5, z], kind: 'kitchen', thr: h.landmark ? 0 : 0.05 + 0.6 * r(), seed: h.i * 17 + 3 });
  }
  for (const rk of village().racks) E.push({ p: [rk.c[0], height(rk.c[0], rk.c[1] + 1.2) + 0.3, rk.c[1] + 1.2], kind: 'kitchen', thr: 0.25 + 0.4 * r(), seed: Math.round(rk.c[1]) });
  for (const z of [-60, 40, 120]) E.push({ p: [-95, height(-95, z) + 6, z], kind: 'mist', thr: 0, seed: z });
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
      const day = Math.min(1, Math.max(0, (h - 5.5) / 1.5)) * Math.min(1, Math.max(0, (21 - h) / 1.5));
      const meals = Math.max(bump(h, 7.0, 1.0, 0.8), bump(h, 12.5, 1.0, 0.5), bump(h, 18.0, 1.2, 0.9));
      const kitchen = Math.min(1, 0.3 + day * 0.3 + meals);        // fires are never let out in the wet
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, day * 0.5, 0.5, r.meal);
    }
  },
});
