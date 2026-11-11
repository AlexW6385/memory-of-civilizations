// Midtown Manhattan 1931 — smoke and steam (docs/settlements/new-york.md §10): coal smoke from the chimneys of the lofts,
// tenements and houses (the autumn heating, thickest at the morning and the evening), steam from the street's manholes (the
// steam company's mains under the avenues) and from the diner's vent. The engine part is src/engine/smoke.js (one draw
// call); this registers the system and places the emitters from the layout (computed once). Emitters are in the settlement's
// frame (x east, y up, z south): the grid's points are turned by toCity.

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, AVENUES, STREETS, lots, height, toCity, inSpecial, chimneyAt, inRect, DINER_AT, WALKUP_AT } from './layout.js';
import { rowStacks } from '../../styles/artdeco/blocks.js';

const ID = 'new-york';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export function emitters() {
  const E = [], rand = rng(1931);
  const put = (x, y, z, kind, thr, seed) => { const [X, Z] = toCity(x, z); E.push({ p: [X, y, Z], kind, thr, seed }); };
  // the chimneys (the stacks of town.js: rows' own at the party walls, a third of the other low buildings): coal smoke above each
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect;
    if (Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) > 330 || inRect(l.rect, ...DINER_AT) || inRect(l.rect, ...WALKUP_AT)) continue;
    if (l.row) { for (const st of rowStacks(l.rect, l.front, l.h, l.seed)) put(st.x, l.y + st.y1 + 0.25, st.z, 'kitchen', 0.1 + 0.85 * rand(), l.seed + Math.round(st.x)); continue; }
    const c = chimneyAt(l);
    if (c) put(c[0], l.y + l.h + 4.0, c[1], 'kitchen', 0.15 + 0.8 * rand(), l.seed + 1);
  }
  // the steam manholes: in the avenues' roadways and at the cross streets' middles, a few at each block
  for (const [ax, w] of AVENUES) for (let k = 0; k < STREETS.length - 1; k++) {
    if (rand() > 0.28) continue;
    const z = (STREETS[k][0] + STREETS[k + 1][0]) / 2 + (rand() - 0.5) * 12, x = ax + (rand() < 0.5 ? -1 : 1) * w * 0.18;
    if (Math.hypot(x, z) > 300 || inSpecial(x, z, 0.5)) continue;
    put(x, height(x, z) + 0.3, z, 'steam', rand() * 0.6, 500 + k);
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
    for (let i = 0; i < ATT.length; i++) {
      const { site, smoke, ready } = ATT[i];
      if (site.state !== 'ready' || !site.group.visible || !ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      // the autumn heating: lit before 6, banked at 22; the busiest at the morning and the evening
      const fires = 0.4 + 0.5 * Math.max(bump(h, 7, 1.6, 1), bump(h, 18, 2.4, 1)) + (h > 6 && h < 22 ? 0.05 : -0.25);
      smoke.setLevels(Math.min(1, Math.max(0, fires)), 0, h > 5 && h < 23 ? 0.85 : 0.6, 0, h < 12 ? 0 : 1);
    }
  },
});
