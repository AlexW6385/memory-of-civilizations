// Taos Pueblo — smoke (docs/settlements/taos.md §4.4): hearth smoke from the roofs of the house blocks at the meals (the fire's
// smoke leaves by the hatch), from the furnished room's hatch, from the kivas' hatches, and the steam of the steaming pits and
// the griddles of the cook yards. The engine part is src/engine/smoke.js; positions come from layout.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { NORTH, SOUTH, CELL, KIVAS, YARDS, ROOMS, RADIUS, isRoom, roomsOf } from './layout.js';

const ID = 'taos';
const ST = 2.7;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1500);
  for (const B of [NORTH, SOUTH]) {
    const H = B.heights;
    for (let i = 0; i < H.length; i++) for (let j = 0; j < H[0].length; j++) {
      const n = H[i][j];
      if (!n || isRoom(B, i, j) || r() > 0.2) continue;
      E.push({ p: [B.x0 + (j + 0.4 + r() * 0.2) * CELL, n * ST + 0.7, B.z0 + (i + 0.4 + r() * 0.2) * CELL], kind: 'kitchen', thr: 0.1 + 0.7 * r(), seed: i * 41 + j });
    }
  }
  // the furnished room's hatch (puebloRoom: hx = cx + 0.35, hz = cz − 0.25 in its cell; the coaming 0.22 above the roof)
  for (const B of [NORTH, SOUTH]) for (const q of roomsOf(B)) if (q.kind === 'home' || q.kind === 'sleep' || q.kind === 'weave') E.push({ p: [B.x0 + q.j * CELL + CELL / 2 + 0.35, ST + 0.9, B.z0 + q.i * CELL + CELL / 2 - 0.25], kind: 'kitchen', thr: q === ROOMS[0] ? 0 : 0.1 + 0.4 * ((q.j * 7) % 5) / 5, seed: 5 + q.j });
  for (const [x, z] of KIVAS) E.push({ p: [x, 1.4, z], kind: 'kitchen', thr: 0.35, seed: Math.round(x) });
  for (const [x, z] of YARDS.cook) { E.push({ p: [x - 1.5, 0.5, z], kind: 'steam', thr: 0.1, seed: 21 }); E.push({ p: [x + 1.3, 0.55, z], kind: 'kitchen', thr: 0.05, seed: 22 }); }
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 12.0, 0.9, 0.4), bump(h, 18.0, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.18 + meals);
      const steam = day * 0.85;
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, 0, r.meal);
    }
  },
});
