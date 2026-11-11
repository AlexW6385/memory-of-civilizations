// Northern Song Bianjing — smoke, steam and mist (dossier §11): kitchen smoke from a scattered share of
// the houses at the three meals, steam from the tea houses, the food shops' steamers and the wine
// shops' stoves by day, incense at the Kaibao monastery's censer, a faint mist over the Bian at dawn.
// The engine part is src/engine/smoke.js (one draw call); this registers the system and places the
// emitters from the layout. Emitters are in the settlement's frame (x east, y up, z south).
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, RIVER, RADIUS, MONASTERY, PAGODA, WALL_X } from './layout.js';
import { tradeOf } from './trades.js';

const ID = 'song-kaifeng';
/** The censer in the main hall's court, on the axis south of the hall's steps, 1.4 m up. */
export const CENSER = [PAGODA[0], 1.4, MONASTERY[1] + 38];
const FRONT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The emitters, from the layout (computed once). */
export function emitters() {
  const E = [], rand = rng(1127);
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, f = l.front, n = FRONT[f], along = f === 'n' || f === 's';
    const Lw = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, trade = tradeOf(l);
    const P = (t, d) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) - n[1] * d] : [(f === 'e' ? x1 : x0) - n[0] * d, z0 + (z1 - z0) * t]);
    const big = trade === 'wine' || trade === 'inn' || trade === 'food' || trade === 'tea';
    if ((rand() < 0.34 || big) && Lw > 3.3) {
      // the kitchen stove at the back of the house; its smoke leaves by the roof vent near the ridge (the house's floor 0.45 m up, 3.15 m walls, 2.65 for a second storey)
      const [x, z] = P(0.25 + rand() * 0.5, D * (0.45 + rand() * 0.15));
      E.push({ p: [x, 0.45 + 3.15 + (l.storeys > 1 ? 2.65 : 0) + 1.15, z], kind: 'kitchen', seed: l.seed + 1, thr: big ? 0 : undefined });
    }
    if (trade === 'tea' || trade === 'food') { const [x, z] = P(0.5, 0.9); E.push({ p: [x, 1.55, z], kind: 'steam', thr: rand() * 0.3, seed: l.seed + 2 }); }
  }
  E.push({ p: CENSER, kind: 'incense', thr: 0, seed: 7 });
  // mist banks along the river, in the middle of the water
  for (let x = WALL_X + 20; x < 260; x += 26) { if (Math.hypot(x, 76) > RADIUS - 20) continue; E.push({ p: [x, RIVER.water + 0.45, 76 + ((x / 26) % 2 ? 4 : -4)], kind: 'mist', thr: 0, seed: Math.floor(x) + 99 }); }
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
      // (the Song capital ate two or three meals; its tea houses opened at the fifth watch, so the steam starts early)
      const kitchen = Math.max(bump(h, 6.6, 0.8, 0.6), bump(h, 11.7, 0.8, 0.7), bump(h, 17.6, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.0) / 1.2)) * Math.min(1, Math.max(0, (21 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.4, 1.4, 0.9);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
