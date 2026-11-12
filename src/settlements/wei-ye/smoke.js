// Three Kingdoms Ye — smoke (docs/settlements/wei-ye.md §8): the hearths of the courtyard houses at the meals, the bakers' and cooks' ovens of the markets, incense
// before the throne and at the gates. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, WENCHANG, MARKET, TOWER, SPARROW, ICE, TIGER, stairRect, zOf, lots as townLots } from './layout.js';
import { COMPOUND } from './dressing.js';
import { ground } from './ground.js';

const ID = 'wei-ye';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], r = rng(206);
  for (const l of townLots()) {
    if (l.kind === 'office' || r() > 0.55) continue;
    const [x0, z0, x1, z1] = l.rect, y = ground.height((x0 + x1) / 2, (z0 + z1) / 2);
    // the hearth in the hall's back corner: the hall's roof stands at the back of the lot (the front is the lane's side)
    const back = l.front === 's' ? z0 + 3.0 : z1 - 3.0;
    E.push({ p: [x0 + (x1 - x0) * (0.3 + 0.4 * r()), y + 4.6, back], kind: 'kitchen', thr: 0.2 + 0.7 * r(), seed: l.seed + 3 });
  }
  // the market's ovens: a few by the cross lanes
  { const cx = (MARKET[0] + MARKET[2]) / 2, cz = (MARKET[1] + MARKET[3]) / 2;
    for (const [dx, dz] of [[-22, -12], [24, 12], [-30, 26], [34, -28]]) E.push({ p: [cx + dx, 3.4, cz + dz], kind: 'kitchen', thr: 0, seed: Math.round(cx + dx) }); }
  // incense: before the throne, in the hall's aisle, in the Sparrow's ground storey, at the palace gate
  const dz = WENCHANG.z0, f = WENCHANG.floor;
  for (const [x, y, z, thr] of [[-2.8, f + 1.8, dz + 4.3, 0], [2.8, f + 1.8, dz + 4.3, 0], [-4.6, f + 0.8, WENCHANG.z1 - 2.5, 0.1], [4.6, f + 0.8, WENCHANG.z1 - 2.5, 0.1], [TOWER.c[0], TOWER.floor + 1.2, TOWER.c[1] - 2, 0], [0, 1.0, -10, 0.2]]) E.push({ p: [x, y, z], kind: 'incense', thr, seed: Math.round(x * 3 + z) });
  // the compound's cookhouses (the barracks' ovens), the braziers at the terraces' stairs and the palace's forecourt
  for (const [x, z] of [[190, -36], [208, -38], [200, -26]]) E.push({ p: [x, 4.4, z], kind: 'kitchen', thr: 0, seed: Math.round(x) });
  void COMPOUND; void SPARROW;
  for (const t of [ICE, SPARROW, TIGER]) { const st = stairRect(t), zc = zOf(t); for (const sg of [-1, 1]) E.push({ p: [st[2] + 1.8, 1.1, zc + sg * 5.4], kind: 'incense', thr: 0.2, seed: Math.round(zc + sg) }); }
  for (const sg of [-1, 1]) for (const z of [-14, -22, -30]) E.push({ p: [sg * 7.8, 1.1, z], kind: 'incense', thr: 0.3, seed: Math.round(z * sg) });
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
      const meals = Math.max(bump(h, 6.5, 0.9, 0.8), bump(h, 17.0, 1.0, 0.9));
      const kitchen = Math.min(1, day * 0.4 + meals);
      const incense = 0.4 + 0.6 * Math.max(bump(h, 7.5, 1.4, 1), bump(h, 17.0, 1.4, 0.7));
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, day * 0.8, 0, r.meal);
    }
  },
});
