// Mexica Tenochtitlan — smoke, steam and mist (docs/settlements/tenochtitlan.md §14): the hearths of the calli (cooking
// fires of wood and charcoal at the morning, afternoon and evening meals), the comals of the market's cooked-food stalls
// (steam and smoke by day), the copal of the braziers on the Templo Mayor and on the temples' summits, the palace's kitchens,
// the chinampa houses, and the mist on the lake at dawn. Registered by one line in src/engine/systems-list.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { houses, chinampaHouses, houseHearth, RADIUS, TM, LEVEL, PALACE, inLake, ISLAND } from './layout.js';
import { comals } from './market.js';
import { ground } from './ground.js';

const ID = 'tenochtitlan';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1519);
  // the hearths: about half the calli burn at a meal (the others cooked earlier or cold)
  for (const h of houses()) if (rand() < 0.55) E.push({ ...houseHearth(h), kind: 'kitchen', thr: rand() * 0.6, seed: h.seed + 1 });
  // the farmers' houses on the chinampas: through the thatch
  for (const h of chinampaHouses()) if (rand() < 0.5) E.push({ p: [h.c[0], ground.height(h.c[0], h.c[1]) + 3.1, h.c[1]], kind: 'kitchen', thr: rand() * 0.6, seed: h.seed + 3 });
  // the comals of the cooked-food stalls, and the pulque and tamale pots beside them
  for (const [x, z] of comals()) E.push({ p: [x, 0.5, z], kind: 'steam', thr: rand() * 0.3, seed: Math.floor(rand() * 1e6) }, { p: [x, 0.9, z], kind: 'kitchen', thr: 0.1 + rand() * 0.3, seed: Math.floor(rand() * 1e6) });
  // the palace's kitchens
  for (const [x, z] of [[PALACE[0] + 40, PALACE[1] + 70], [PALACE[0] + 12, PALACE[1] + 60], [PALACE[0] + 30, PALACE[1] + 18]]) E.push({ p: [x, 7.4, z], kind: 'kitchen', thr: 0.05, seed: 600 + Math.floor(x) });
  // copal: the braziers at the stairheads of the Templo Mayor, out of the shrines' doors, on the summits of the lesser temples
  const top = TM.h, sx = TM.c[0] - TM.top.w / 2 + 2;
  for (const s of [-1, 1]) {
    E.push({ p: [sx, top + 1.3, s * 20.3], kind: 'incense', thr: 0, seed: 40 + s }, { p: [sx + 5.4, top + 4.2, s * 10.8], kind: 'incense', thr: 0, seed: 42 + s });
  }
  for (const [x, y, z] of [[-55, 20.6, 75], [25, 18.6, -95], [42, 24, 102]]) E.push({ p: [x, y, z], kind: 'incense', thr: 0, seed: 50 + Math.floor(x) });
  // mist on the lake at dawn, in the channels of the chinampas and beyond
  for (let i = 0; i < 18; i++) {
    const a = (i + rand() * 0.6) / 18 * Math.PI * 2, r = ISLAND + 10 + rand() * 22, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!inLake(x, z) || Math.hypot(x, z) > RADIUS - 28) continue;
    E.push({ p: [x, LEVEL.water + 0.3, z], kind: 'mist', thr: rand() * 0.5, seed: 700 + i });
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
      // the fires of the tortilla at dawn, the main meal after noon, the evening meal
      const kitchen = Math.max(bump(h, 5.8, 0.9, 0.8), bump(h, 13.5, 1.3, 0.7), bump(h, 18.2, 1.2, 0.7));
      // the market's comals from dawn to dusk
      const steam = Math.min(1, Math.max(0, (h - 5.5) / 1.2)) * Math.min(1, Math.max(0, (19 - h) / 1.5)) * 0.9;
      // copal offered at dawn, noon, dusk and in the night's watches, always a little burning
      const incense = Math.min(1, 0.55 + Math.max(bump(h, 6, 1.0, 0.45), bump(h, 12, 0.8, 0.3), bump(h, 18, 1.0, 0.4)));
      const mist = bump(h, 5.8, 1.2, 0.9);
      smoke.setLevels(kitchen, incense, steam, mist, h < 9 ? 0 : h < 16 ? 1 : 2);
    }
  },
});
