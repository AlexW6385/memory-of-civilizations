// Southern Song Lin'an — smoke, steam and mist (docs/settlements/song-hangzhou.md §17): kitchen smoke
// from a scattered share of the houses at the three meals, steam from the tea houses, wine houses and
// noodle and bun shops (Lin'an's streets fed the town through the night), incense at the temples'
// censers all day, mist over the canals at dawn and over West Lake — the lake's morning mist, thick
// at dawn and thinning by midmorning. The engine part is src/engine/smoke.js (one draw call); this
// registers the system and places the emitters from the layout (ways.js).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, canals, lake, lakeDist, LEVEL, RADIUS } from './ways.js';
import * as LAYOUT from './layout.js';

const ID = 'song-hangzhou';
const FRONT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** Where the temples' censers smoke: the layout's INCENSE list ([x, y, z]) or the old layout's pagoda court. */
export const CENSERS = LAYOUT.INCENSE ?? (LAYOUT.PAGODA ? [[LAYOUT.PAGODA.c[0], LAYOUT.PAGODA.y + 1.4, LAYOUT.PAGODA.c[1] + 14]] : []);
const STEAMY = new Set(['tea', 'wine', 'noodle', 'bun', 'restaurant', 'food']);

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The emitters, from the layout (computed once). */
export function emitters() {
  const E = [], rand = rng(2711);
  for (const l of lots()) {
    if (l.kind === 'yard') continue;
    const [x0, z0, x1, z1] = l.rect, f = l.front, n = FRONT[f] ?? [0, 1], along = f === 'n' || f === 's';
    const Lw = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
    const P = (t, d) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) - n[1] * d] : [(f === 'e' ? x1 : x0) - n[0] * d, z0 + (z1 - z0) * t]);
    if (rand() < 0.36 && Lw > 3.3) {
      const [x, z] = P(0.25 + rand() * 0.5, D * (0.45 + rand() * 0.15));
      E.push({ p: [x, (l.y ?? LEVEL.street) + 0.45 + 3.15 + ((l.storeys ?? 1) > 1 ? 2.65 : 0) + 1.15, z], kind: 'kitchen', seed: (l.seed ?? 1) + 1 });
    }
    const steamy = l.shop && (STEAMY.has(l.trade) || (l.trade === undefined && rand() < 0.14));
    if (steamy) {
      const [x, z] = P(0.5, 0.9);
      E.push({ p: [x, (l.y ?? LEVEL.street) + 1.55, z], kind: 'steam', thr: rand() * 0.3, seed: (l.seed ?? 1) + 2 });
    }
  }
  CENSERS.forEach((p, i) => E.push({ p, kind: 'incense', thr: 0, seed: 7 + i }));
  // mist banks along the canals
  for (const c of canals()) {
    const horiz = c[2] - c[0] > c[3] - c[1], mx = (c[0] + c[2]) / 2, mz = (c[1] + c[3]) / 2, [a0, a1] = horiz ? [c[0], c[2]] : [c[1], c[3]];
    for (let a = a0 + 14; a < a1 - 14; a += 26) {
      const x = horiz ? a : mx, z = horiz ? mz : a;
      if (Math.hypot(x, z) > RADIUS - 20) continue;
      E.push({ p: [x, LEVEL.canal + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(a) + 99 });
    }
  }
  // West Lake's mist: banks over the water on a 34 m grid, a little off the shore (within the smoke's reach of 220 m only those near the visitor are drawn)
  const L = lake();
  if (L) for (let x = L.rect[0]; x < L.rect[2]; x += 34) for (let z = L.rect[1]; z < L.rect[3]; z += 34) {
    const jx = x + ((x * 7) % 11) - 5, jz = z + ((z * 13) % 11) - 5;
    if (Math.hypot(jx, jz) > RADIUS - 25 || lakeDist(jx, jz) > -6) continue;
    E.push({ p: [jx, L.y + 0.5, jz], kind: 'mist', thr: rand() * 0.15, seed: Math.floor(x * 3 + z) + 311 });
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
    Promise.resolve(world.r?.precompile?.(smoke.mesh)).then(() => { rec.ready = true; });
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
      const kitchen = Math.max(bump(h, 6.6, 0.8, 0.6), bump(h, 11.7, 0.8, 0.7), bump(h, 17.6, 1.0, 0.9));
      // the food shops steam from before dawn to late (Lin'an's night markets run through the night: a floor of 0.25 after dark)
      const day = Math.min(1, Math.max(0, (h - 5.2) / 1.2)) * Math.min(1, Math.max(0, (21.5 - h) / 1.5));
      const steam = Math.max(day * 0.95, 0.25);
      // the lake's and the canals' mist: thick at dawn, gone by midmorning (the climate's river-mist weather thickens it in the engine's fog)
      const mist = bump(h, 5.6, 1.7, 1.0);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
