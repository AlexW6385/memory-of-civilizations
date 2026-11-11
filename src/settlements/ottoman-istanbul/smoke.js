// Ottoman Istanbul about 1560 — smoke (docs/settlements/ottoman-istanbul.md §12): the soup kitchen's two bakery chimneys and the
// lanterns of its kitchens (the imaret fed hundreds daily), the hamam's furnace chimney, the coffee house's hearth, and
// cooking smoke from a share of the timber houses at the morning and evening meals. The engine part is src/engine/smoke.js;
// positions come from layout.js (the imaret's frame as src/styles/ottoman/kulliye.js builds it).
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RADIUS, TOP, IMARET, HAMAM, COFFEE } from './layout.js';

const ID = 'ottoman-istanbul';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1561), m = 4.4;
  // the soup kitchen: the bakery's chimneys at its east corner (kulliye.js imaret: P(0.7, 2m + 0.7) and P(0.7, 4m − 0.7), 10.4 m up)
  for (const ob of [2 * m + 0.7, 4 * m - 0.7]) E.push({ p: [IMARET[2] - 0.7, TOP + 10.9, IMARET[1] + ob], kind: 'kitchen', seed: Math.floor(ob) });
  // …and the lanterns of the kitchen domes along its north side (units at a = 0, 2, 4, 6 modules, dome tops about 11 m)
  for (const i of [0, 2, 4]) E.push({ p: [IMARET[2] - (i + 1) * m, TOP + 11.4, IMARET[1] + m], kind: 'kitchen', seed: 40 + i });
  // the hamam's furnace chimney behind the hot room (kulliye.js hamam: P(ak1 − 1.2, −sh/2 + 2), 12 m up)
  { const cz = (HAMAM[1] + HAMAM[3]) / 2, sh = HAMAM[3] - HAMAM[1] - 1, ak1 = (HAMAM[3] - HAMAM[1]) + 6.4 + sh + 5.0; E.push({ p: [HAMAM[0] + ak1 - 1.2, TOP + 12.2, cz - sh / 2 + 2], kind: 'kitchen', seed: 51 }); }
  // the coffee house: steam from the pots on the hearth in the back corner
  { const c = COFFEE(); E.push({ p: [c.rect[0] + 1.0, c.y + 3.9, (c.rect[1] + c.rect[3]) / 2 - 2.0], kind: 'steam', thr: 0.1, seed: 52 }); }
  // the houses of the slopes: a share, the stove's smoke from a vent near the ridge
  for (const l of lots()) {
    if (rand() > 0.34) continue;
    const [x0, z0, x1, z1] = l.rect;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + rand() * 0.4), l.y + 2.7 * l.storeys + 2.6, z0 + (z1 - z0) * (0.35 + rand() * 0.3)], kind: 'kitchen', seed: l.seed + 1 });
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
      const kitchen = Math.max(bump(h, 6.4, 0.9, 0.7), bump(h, 11.8, 0.9, 0.7), bump(h, 17.8, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 6) / 1.5)) * Math.min(1, Math.max(0, (22 - h) / 1.5)) * 0.9;
      smoke.setLevels(Math.max(kitchen, 0.35), 1, steam, 0, h < 9 ? 0 : h < 15 ? 1 : 2);
    }
  },
});
