// Giza — smoke and steam (docs/settlements/giza.md §12): the bakeries' hearths and the brewers' vats, fired from before dawn,
// the ovens in the courts of the town's houses at the meals, incense before the temples' doors and at a share of the tomb
// chapels, burnt in the morning. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, KHAFRE_VT, KV_Y, mastabas, town as townLots } from './layout.js';
import { ground } from './ground.js';

const ID = 'giza';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(2500);
  for (const l of townLots()) {
    const [x0, z0, x1, z1] = l.rect, mx = (x0 + x1) / 2;
    if (l.kind === 'bakery') {
      // the hearth platform along the south wall, the bread pots stacked in the ash; the vat's steam at the north
      E.push({ p: [mx, ground.height(mx, z1) + 1.5, z1 - 0.9], kind: 'kitchen', thr: 0, seed: l.seed + 1 });
      if (r() < 0.6) E.push({ p: [mx + 0.9, ground.height(mx, z0) + 1.2, z0 + 2.2], kind: 'steam', thr: 0.1 + r() * 0.3, seed: l.seed + 2 });
    } else if (l.kind === 'house' && r() < 0.3) {
      const x = x0 + (x1 - x0) * (0.55 + 0.2 * r()), z = z0 + (z1 - z0) * (0.3 + 0.3 * r());
      E.push({ p: [x, ground.height(x, z) + 1.6, z], kind: 'kitchen', thr: 0.3 + 0.6 * r(), seed: l.seed + 3 });
    }
  }
  // the tombs' chapels: incense at the door of one in seven (the chapel's door on its east face)
  for (const m of mastabas()) if (r() < 0.14) { const x = m.c[0] + m.a + 2.8, z = m.c[1] + m.b - 2.6; E.push({ p: [x - 1.0, ground.height(x, z) + 1.0, z], kind: 'incense', thr: 0.2 + 0.6 * r(), seed: m.seed % 997 }); }
  // the mortuary temple's court; the valley temples' doors
  E.push({ p: [146, 1.0, -40], kind: 'incense', thr: 0, seed: 21 });
  E.push({ p: [KHAFRE_VT[2] + 2.5, KV_Y + 0.9, KHAFRE_VT[1] + 15.3], kind: 'incense', thr: 0, seed: 22 }, { p: [KHAFRE_VT[2] + 2.5, KV_Y + 0.9, KHAFRE_VT[1] + 36.3], kind: 'incense', thr: 0.1, seed: 23 });
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
      const day = Math.min(1, Math.max(0, (h - 4.8) / 1.5)) * Math.min(1, Math.max(0, (19.5 - h) / 1.5));
      const meals = Math.max(bump(h, 6.0, 0.9, 0.7), bump(h, 12.0, 0.9, 0.4), bump(h, 18.0, 1.0, 0.8));
      const kitchen = Math.min(1, day * 0.55 + meals);
      const incense = 0.4 + 0.6 * Math.max(bump(h, 7.5, 1.4, 1), bump(h, 17.0, 1.4, 0.7));
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.8, 0, r.meal);
    }
  },
});
