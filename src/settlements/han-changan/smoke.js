// Han Chang'an — smoke (docs/settlements/han-changan.md §8): the hearths of the courtyard houses at the meals, the bakers' and cooks' ovens of the markets, incense
// before the throne and at the gates. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, AX, HALL, WEST_MARKET, EAST_MARKET, GATE_W, lots as townLots, marketShops } from './layout.js';
import { ground } from './ground.js';

const ID = 'han-changan';
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
  // the markets' ovens: a few by the cross lanes
  for (const [x0, z0, x1, z1] of [WEST_MARKET, EAST_MARKET]) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (const [dx, dz] of [[-22, -12], [24, 12], [-30, 26], [34, -28]]) E.push({ p: [cx + dx, 3.4, cz + dz], kind: 'kitchen', thr: 0, seed: Math.round(cx + dx) });
  }
  // the shops that cook or forge: a flue over every ninth shop of the rows
  [WEST_MARKET, EAST_MARKET].forEach((M, mi) => { let n = 0; for (const row of marketShops(M, mi ? 700 : 600)) for (let i = 0; i < row.n; i++, n++) if (n % 9 === 4) { const [rx0, rz0, rx1, rz1] = row.rect, sw = (rx1 - rx0) / row.n; E.push({ p: [rx0 + (i + 0.7) * sw, 4.8, row.front === 'n' ? rz1 - 1.2 : rz0 + 1.2], kind: 'kitchen', thr: 0.1 + 0.6 * r(), seed: n * 5 + mi }); } });
  // incense: before the throne, in the hall's aisle, at the ramp's foot and the west gate
  for (const [x, y, z, thr] of [[AX - 2.8, HALL.floor + 1.8, HALL.z0 + 4.3, 0], [AX + 2.8, HALL.floor + 1.8, HALL.z0 + 4.3, 0], [AX - 4.6, HALL.floor + 0.8, HALL.z1 - 2.5, 0.1], [AX + 4.6, HALL.floor + 0.8, HALL.z1 - 2.5, 0.1], [AX, 1.0, -88, 0.2], [-266, 1.0, GATE_W.z - 6, 0.3]]) E.push({ p: [x, y, z], kind: 'incense', thr, seed: Math.round(x) });
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
