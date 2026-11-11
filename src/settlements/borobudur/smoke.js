// Sailendra Java — smoke and mist (docs/settlements/borobudur.md §15): cooking smoke from a share of the houses at the
// morning and evening meals (the hearth's smoke leaves through the thatch), incense at the monastery's hall and before the
// monument's east stair all day, morning mist lying on the paddies and round the monument's foot. The engine part is
// src/engine/smoke.js; positions come from layout.js. Emitters in the settlement's frame.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, MONUMENT, MONASTERY, CELLS, houses, floorOf, wayStalls } from './layout.js';

const ID = 'borobudur';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(826);
  for (const h of houses()) {
    if (h.kind === 'lumbung' || rand() > 0.5) continue;
    const [x0, z0, x1, z1] = h.rect;
    // through the thatch over the hearth: the back of the house, a little under the ridge
    E.push({ p: [(x0 + x1) / 2 + (rand() - 0.5) * 2, floorOf(h.seed) + 2.25 + 2.9, (z0 + z1) / 2 + (rand() - 0.5) * 2], kind: 'kitchen', seed: h.seed + 1 });
  }
  // the hearths of the way's food stalls (steam and smoke through the thatch), the monks' kitchen houses
  for (const st of wayStalls()) if (st.kind === 'warung' && rand() > 0.3) E.push({ p: [st.at[0], 3.1, st.at[1]], kind: 'kitchen', seed: st.seed + 1 });
  for (const [x, z, , f] of CELLS) if (f && rand() < 0.5) E.push({ p: [x, floorOf(x * 7 + z) + 4.6, z], kind: 'kitchen', seed: Math.floor(x * 3 - z) });
  // incense in the great hall, before the Buddha, and at the monument's east stair
  E.push({ p: [MONASTERY[0] + 4.6, 2.0, -141], kind: 'incense', thr: 0, seed: 7 });
  E.push({ p: [MONUMENT.base.a + MONUMENT.base.p + MONUMENT.base.foot + 1.2, 0.6, 0], kind: 'incense', thr: 0, seed: 8 });
  // mist banks over the paddies and the monument's foot at dawn
  for (let a = 0; a < 6.28; a += 0.5) for (const r of [105, 170, 240]) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x, z) > RADIUS - 20) continue;
    E.push({ p: [x, 0.5, z], kind: 'mist', thr: 0, seed: Math.floor(a * 20 + r) });
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
      const kitchen = Math.max(bump(h, 6.0, 0.8, 0.6), bump(h, 17.5, 1.0, 0.9));
      smoke.setLevels(kitchen, 1, 0, Math.max(bump(h, 5.6, 1.4, 1.0), bump(h, 6.5, 1.0, 0.7)), h < 9 ? 0 : h < 15 ? 1 : 2);
    }
  },
});
