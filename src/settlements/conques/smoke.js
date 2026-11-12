// Conques about 1120 — smoke, steam and mist (docs/settlements/conques.md §5c): the hearth smoke from the chimneys of
// the houses at the three meals (every house of the rows has its hearth; the hostel's long hall the most), incense at
// the Majesty's reliquary in the church by day, steam at the bakers' and shops by the pilgrims' way, a mist in the gorge
// over the Dourdou at dawn. The engine part is src/engine/smoke.js (one draw call); this registers the system and
// places the emitters from the layout. Positions in the settlement's frame (x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, ABBEY, RIVER, RADIUS } from './layout.js';
import { chimneyTop } from '../../styles/romanesque/village.js';

const ID = 'conques';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], rand = rng(1120);
  for (const l of lots()) {
    if (!l.chim) continue;
    const [cx, cz] = l.chim, top = chimneyTop(l) + 0.3;
    if (l.hostel || rand() < 0.55) E.push({ p: [cx, top, cz], kind: 'kitchen', seed: l.seed + 1 });
    if (l.open === 'shop' && ['bread', 'smith'].includes(l.trade)) E.push({ p: [cx, top, cz], kind: l.trade === 'smith' ? 'kitchen' : 'steam', thr: 0, seed: l.seed + 3 });
    if (l.shop && l.seed % 5 === 2) E.push({ p: [cx, top, cz], kind: 'steam', thr: rand() * 0.3, seed: l.seed + 2 });     // the baker's oven
  }
  // incense before the Majesty
  E.push({ p: [ABBEY.origin[0] + 41.8, 2.6, ABBEY.origin[1] + 2.2], kind: 'incense', thr: 0, seed: 7 });
  // mist in the gorge along the Dourdou
  for (let x = -250; x <= 250; x += 28) {
    const z = RIVER.z + 14 * Math.sin(x / 90);
    if (Math.hypot(x, z) > RADIUS - 25) continue;
    E.push({ p: [x, RIVER.level + 0.5, z], kind: 'mist', thr: 0, seed: Math.floor(x) + 400 });
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
      const kitchen = Math.max(bump(h, 6.4, 0.8, 0.8), bump(h, 11.8, 0.8, 0.55), bump(h, 18.0, 1.0, 0.9));
      const incense = 0.5 + 0.5 * Math.max(bump(h, 6.8, 1.2, 1), bump(h, 17.5, 1.2, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.2) / 1.2)) * Math.min(1, Math.max(0, (13 - h) / 1.5)) * 0.9;
      const mist = bump(h, 6.0, 1.6, 1.0);
      r.meal = h < 9 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, steam, mist, r.meal);
    }
  },
});
