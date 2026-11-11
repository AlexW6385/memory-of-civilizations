// The pā — smoke, steam and mist (docs/settlements/maori.md §4d): the cooking fires and hāngī of the
// summit, the smoke of the houses' hearths through door and thatch (no chimneys), the steam of the
// hot ground on the lake's south shore (the geothermal field of Rotorua, where food was cooked in the
// hot pools and steam vents), and a mist over the lake at dawn. The engine part is src/engine/smoke.js
// (one draw call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, HILL, LAKE, VENTS, shoreZ, height, inLake, village } from './layout.js';

const ID = 'maori';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1769), v = village(), [hx, hz] = HILL.c;
  // the chief's house: the hearth inside, its smoke from the door and the thatch (the roof's ridge 1.6 + 2.75 high)
  const h0 = v.houses[0];
  E.push({ p: [h0.c[0], HILL.top + 4.5, h0.c[1]], kind: 'kitchen', thr: 0, seed: 21 });
  // the cooking place on the summit's east (plan: town.js `hangi` at hx + 13, hz + 10): the earth oven's steam and the fire's smoke
  E.push({ p: [hx + 13, HILL.top + 0.9, hz + 10], kind: 'steam', thr: 0.1, seed: 22 });
  E.push({ p: [hx + 14.6, HILL.top + 1.3, hz + 9.2], kind: 'kitchen', thr: 0.1, seed: 23 });
  // the houses: a share of them have the fire lit; the smoke leaves by the door and through the thatch at the ridge
  for (const h of v.houses.slice(1)) {
    if (r() > 0.32) continue;
    const rise = (h.w ?? 4) * 0.55, hh = h.h ?? 1.2;
    E.push({ p: [h.c[0], (h.y ?? 0) + hh + rise + 0.2, h.c[1]], kind: 'kitchen', thr: 0.15 + 0.8 * r(), seed: Math.floor(r() * 1e6) });
  }
  // the whānau yards' cooking places: the fire's smoke and the oven's steam, lit at the meals
  v.compounds.forEach((c, k) => {
    if (Math.hypot(c.c[0], c.c[1]) > RADIUS - 56) return;
    const y = height(c.c[0], c.c[1]) + 0.5, off = k % 3 === 0 ? 0 : 1;
    E.push({ p: [c.c[0] - 1.4, y, c.c[1]], kind: 'kitchen', thr: 0.05 + 0.5 * r(), seed: 800 + k });
    if (off === 0) E.push({ p: [c.c[0] + 1.5, y, c.c[1] + 0.2], kind: 'steam', thr: 0.15 + 0.4 * r(), seed: 850 + k });
  });
  // the hot ground
  VENTS.forEach(([x, z], k) => { if (!inLake(x, z)) E.push({ p: [x, height(x, z) + 0.4, z], kind: 'steam', thr: 0, seed: 600 + k }); });
  // the lake's morning mist
  for (let x = -280; x <= 280; x += 34) {
    const z = shoreZ(x) - 10 - r() * 20; if (Math.hypot(x, z) > RADIUS - 30) continue;
    E.push({ p: [x, LAKE.level + 0.4, z], kind: 'mist', thr: 0, seed: Math.floor(x) + 400 });
  }
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
      // the hearth is never out; built up at the morning and evening meals, the hāngī lit for the midday and evening one
      const meals = Math.max(bump(h, 7, 1.0, 0.45), bump(h, 12.5, 1.2, 0.4), bump(h, 18, 1.4, 0.6));
      const kitchen = Math.min(1, 0.45 + meals);
      const steam = Math.min(1, 0.55 + 0.4 * Math.max(bump(h, 11, 1.4, 1), bump(h, 17, 1.4, 1)));   // the hot ground steams day and night, the more when the air is cool; the ovens opened at the meals
      const mist = bump(h, 5.4, 1.5, 0.9);
      r.meal = h < 10 ? 0 : h < 15.5 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, mist, r.meal);
    }
  },
});
