// Muscovy about 1600 — smoke (docs/settlements/muscovy.md §5.3): the chimneyless izby smoked through their doors and the
// smoke-hole under the gable (the black izba, kurnaya), so a share of the houses smoke at the three meals, heaviest in the cold
// hours; the kvass and sbiten sellers' steam in Red Square's market by day; a faint river mist at dawn over the Moskva.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { yards } from './town.js';
import { lots, RIVER, riverZ, RADIUS, SQUARE, height } from './layout.js';

const ID = 'muscovy';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1600);
  for (const l of lots()) {
    if (rand() > 0.34) continue;
    const [x0, z0, x1, z1] = l.rect, x = (x0 + x1) / 2, z = (z0 + z1) / 2;
    E.push({ p: [x, l.y + 3.3 + 0.5 + (Math.min(x1 - x0, z1 - z0) / 2) * 1.05 - 0.4, z], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the bathhouses (a black bania: its smoke leaves by the door and the hole in the roof) smoke on bathing days
  for (const y of yards(lots())) if (y.t === 'yardbuild' && y.kind === 'bania' && rand() < 0.4) E.push({ p: [(y.rect[0] + y.rect[2]) / 2, y.y + 2.4 + 0.55, (y.rect[1] + y.rect[3]) / 2], kind: 'kitchen', seed: y.seed });
  // the kvass and sbiten sellers in the market: steam from the urn
  for (let z = -120; z < 100; z += 34) E.push({ p: [SQUARE[2] - 2.4, height(SQUARE[2] - 2.4, z) + 1.3, z], kind: 'steam', thr: rand() * 0.3, seed: z + 7 });
  for (let x = -RADIUS + 100; x < RADIUS - 100; x += 26) {
    const z = riverZ(x) - 2;
    E.push({ p: [x, RIVER.level + 0.4, z], kind: 'mist', thr: 0, seed: Math.floor(x) + 99 });
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
    for (const r of ATT) {
      const { site, smoke } = r;
      if (site.state !== 'ready' || !site.group.visible || !r.ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.max(bump(h, 6.0, 0.9, 0.7), bump(h, 12.0, 0.9, 0.7), bump(h, 18.0, 1.1, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 6.5) / 1.4)) * Math.min(1, Math.max(0, (19 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.6, 1.4, 0.9);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, mist, r.meal);
    }
  },
});
