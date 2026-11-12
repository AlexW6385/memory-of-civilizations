// Alexandria about 250 BC — smoke (docs/settlements/alexandria.md §10): kitchen smoke from a share of the houses at the three meals,
// the smoke of the Pharos's fire (a column by day; its flame is lit at night), the Serapeum's incense, the sea mist on the harbour at
// dawn. The engine part is src/engine/smoke.js; positions come from layout.js (the settlement's frame: x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { houseLayout } from '../../styles/ptolemaic/house.js';
import { lots, PHAROS, SEROUTE, SEA, GROUND, RADIUS, wet } from './layout.js';

const ID = 'alexandria';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(250);
  for (const l of lots()) {
    if (rand() > 0.3) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + 0.4 * rand()), l.y + 4.2 + (l.quarter === 'egyptian' ? 3 : 0), z0 + (z1 - z0) * (0.3 + 0.4 * rand())], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the bakers' ovens and the potters' kilns burn all day in the shop lots of their trades
  for (const l of lots()) {
    if (l.warehouse || l.quarter === 'egyptian') continue;
    const K = houseLayout({ rect: l.rect, seed: l.seed, front: l.front });
    if (K.aShop && (K.trade === 'bread' || K.trade === 'pottery' || K.trade === 'bronze')) { const [x0, z0, x1, z1] = l.rect; E.push({ p: [(x0 + x1) / 2, l.y + K.H + 1.2, (z0 + z1) / 2], kind: 'kitchen', thr: 0, seed: l.seed + 5 }); }
  }
  // the Pharos: its fire's smoke over the lantern (about 104 m up)
  E.push({ p: [PHAROS.c[0], GROUND + 0.66 + 56.5 + 28.7 + 10.4 + 4.6, PHAROS.c[1]], kind: 'kitchen', thr: 0, seed: 77 });
  // the Serapeum: the incense on the altar before the temple
  E.push({ p: [SEROUTE.rect[0] + 58, SEROUTE.y + 1.6, (SEROUTE.rect[1] + SEROUTE.rect[3]) / 2], kind: 'kitchen', thr: 0.2, seed: 78 });
  // the mist on the harbour at dawn
  for (let x = -380; x <= 420; x += 40) for (const z of [-150, -200, -250]) if (Math.hypot(x, z) < RADIUS - 70 && wet(x, z) < -3) E.push({ p: [x, SEA + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(x + z) + 99 });
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
      const kitchen = Math.max(bump(h, 7.0, 0.8, 0.5), bump(h, 11.8, 0.9, 0.8), bump(h, 18.0, 1.0, 0.9));
      const mist = Math.max(bump(h, 5.6, 1.5, 1.0), 0.12);
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, mist, r.meal);
    }
  },
});
