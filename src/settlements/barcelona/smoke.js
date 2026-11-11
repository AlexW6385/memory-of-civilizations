// Barcelona about 1910 — smoke and steam (docs/settlements/barcelona.md §7): kitchen smoke from the chimneys of a share of the
// Eixample's houses at the three meals (coal and charcoal ranges: thin grey plumes from the roof stacks, which blockChimneys
// finds from the same plan as the town's), the steam of the café's urn by day. The engine part is src/engine/smoke.js (one draw
// call); positions come from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { blockChimneys } from '../../styles/modernisme/index.js';
import { RADIUS, CASA, height } from './layout.js';
import { blockElements } from './town.js';

const ID = 'barcelona';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(1910);
  for (const el of blockElements()) for (const p of blockChimneys(el)) if (r() < 0.3) E.push({ p, kind: 'kitchen', thr: 0.25 + 0.6 * r(), seed: Math.floor(r() * 1e6) });
  const y0 = height(CASA.fx - 9, CASA.z0 + 8);
  E.push({ p: [CASA.fx - 16.6, y0 + CASA.h + 1.82, CASA.z0 + 14.0], kind: 'kitchen', thr: 0.1, seed: 11 });         // the flat's kitchen stack
  E.push({ p: [CASA.fx - 9.1, y0 + 0.12 + 1.07 + 0.55, CASA.z0 + 2.0], kind: 'steam', thr: 0.05, seed: 12 });          // the café's coffee urns
  E.push({ p: [CASA.fx - 13.6, y0 + 0.12 + 1.07 + 0.55, CASA.z0 + 2.0], kind: 'steam', thr: 0.2, seed: 13 });
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
      // Spanish hours: a late breakfast, the main meal at two, supper after nine
      const kitchen = Math.max(bump(h, 7.5, 0.9, 0.6), bump(h, 13.5, 1.0, 0.9), bump(h, 20.5, 1.0, 0.7));
      const steam = Math.min(1, Math.max(0, (h - 6.5) / 1.5)) * Math.min(1, Math.max(0, (23 - h) / 1.5)) * 0.9;
      r.meal = h < 11 ? 0 : h < 17 ? 1 : 2;
      smoke.setLevels(kitchen, 0, steam, 0, r.meal);
    }
  },
});
