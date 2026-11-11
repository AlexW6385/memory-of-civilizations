// The Hakka tulou — smoke (docs/settlements/hakka-tulou.md §4.1): the kitchens are on the ground floor, so the cooking
// smoke leaves through the gaps of the ring roof all round it at the meals (morning, noon, evening), thinner from the
// second ring, the neighbouring tulou, and the farm buildings. The engine part is src/engine/smoke.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { T, NEIGHBOURS, RADIUS, FARMS } from './layout.js';

const ID = 'hakka-tulou';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1710), ring = (c, R, y, n, ph = 0.3) => { for (let i = 0; i < n; i++) { const a = (i + r()) / n * Math.PI * 2; E.push({ p: [c[0] + Math.cos(a) * R, y, c[1] + Math.sin(a) * R], kind: 'kitchen', thr: ph + 0.6 * r(), seed: i * 13 + Math.round(R) }); } };
  ring(T.c, (T.front + T.wallIn) / 2 + 0.3, 15.9, 22, 0.1);   // the ridge of the great ring (ridge y 15.5)
  ring(T.c, (T.ring2.r0 + T.ring2.r1) / 2 + 0.2, 8.6, 10, 0.2);                            // the second ring's ridge
  for (const n of NEIGHBOURS) { const R = n.kind === 'square' ? n.half - 4 : n.R - 3, y = n.floors * 3.3 + 1.3; ring(n.c, R, y, n.kind === 'square' ? 8 : 6, 0.2); }
  for (const [x, z] of FARMS) E.push({ p: [x, 4.4, z], kind: 'kitchen', thr: 0.4, seed: Math.round(x) });
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
      const meals = Math.max(bump(h, 6.0, 0.9, 0.8), bump(h, 11.7, 0.9, 0.5), bump(h, 17.6, 1.1, 0.9));
      const kitchen = Math.min(1, day * 0.15 + meals);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 0, day * 0.3, 0, r.meal);
    }
  },
});
