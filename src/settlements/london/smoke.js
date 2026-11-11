// Victorian London — smoke, steam and fog (docs/settlements/london.md §7): coal smoke from the chimney pots of a scattered share of
// the houses, thickest at the morning and the evening fires, shops' and pubs' stacks all day; steam from the paddle steamers' funnels;
// a bank of river mist over the Thames. The engine part is src/engine/smoke.js (one draw call); this registers the system and places
// the emitters from the town's layout (computed once). Emitters are in the settlement's frame (x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, RIVER, GROUND, bank, BRIDGE } from './layout.js';

const ID = 'london';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
/** the height of a house's chimney pots: its walls, the roof's rise and the stack (index.js / shops.js) */
function potsY(l) {
  const D = l.rect[3] - l.rect[1], n = l.storeys ?? 3, H = l.pub ? 4 + 2 * 3.3 : l.shop ? 3.8 + (n - 1) * 3.2 : n * 3.2;
  return GROUND + H + D * 0.32 + 2.1;
}
function emitters() {
  const E = [], rand = rng(1871);
  for (const l of lots()) {
    if (Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) > 300) continue;       // smoke is drawn within 220 m of the eye
    const stacks = Math.max(1, Math.round((l.rect[2] - l.rect[0]) / 5.5));
    if (rand() < (l.pub || l.shop ? 0.7 : 0.45)) {
      const i = Math.floor(rand() * stacks), x = l.rect[0] + i * (l.rect[2] - l.rect[0]) / stacks, z = (l.rect[1] + l.rect[3]) / 2;
      E.push({ p: [x, potsY(l), z], kind: 'kitchen', thr: rand() * 0.9, seed: l.seed + 1 });
    }
  }
  // the steamers' funnels: steam from the pier's steamer and the one coming down (town.js)
  const pz = -219, bx = bank(pz)[0];
  E.push({ p: [bx + 11.8, RIVER.level + 9.5, pz - 2 - 3.5], kind: 'steam', thr: 0.1, seed: 5 }, { p: [188, RIVER.level + 9.5, 40 - 3.5], kind: 'steam', thr: 0.2, seed: 6 });
  // river mist banks over the Thames, off the channel's middle
  for (let z = -RADIUS + 90; z < RADIUS - 90; z += 34) { if (Math.abs(z - BRIDGE.z) < 18) continue; const [a, b] = bank(z); for (const t of [0.35, 0.65]) E.push({ p: [a + (b - a) * t, RIVER.level + 0.5, z], kind: 'mist', thr: 0, seed: Math.floor(z) + 77 + t * 10 }); }
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
    for (let i = 0; i < ATT.length; i++) {
      const { site, smoke, ready } = ATT[i];
      if (site.state !== 'ready' || !site.group.visible || !ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      // the coal fires: lit at 6, banked at 22; the busiest at the morning and evening
      const fires = 0.45 + 0.5 * Math.max(bump(h, 7.2, 1.3, 1), bump(h, 18.5, 2.2, 1)) + (h > 6 && h < 22 ? 0.05 : -0.3);
      const steam = h > 6 && h < 20 ? 0.9 : 0.2, mist = Math.max(0.35, bump(h, 6, 2.4, 0.9));
      smoke.setLevels(Math.min(1, Math.max(0, fires)), 0, steam, mist, h < 12 ? 0 : 1);
    }
  },
});
