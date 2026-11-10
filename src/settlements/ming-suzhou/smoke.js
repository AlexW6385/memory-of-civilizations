// Ming Suzhou — smoke, steam and mist (docs/settlements/ming-suzhou.md §13): kitchen smoke from a
// scattered share of the houses at the three meals, incense smoke at the Bao'en Temple's censer all
// day, steam from the tea shops by day, a faint mist over the canals at dawn. The engine part is
// src/engine/smoke.js (one draw call); this registers the system and places the emitters from the
// town's layout. Emitter positions are in the settlement's frame (x east, y up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, CANALS, LEVEL, RADIUS, TEMPLE_COURT as COURT } from './layout.js';

const ID = 'ming-suzhou';
/** Where the temple's incense burner smokes: on the axis, in the court before the main hall's steps (the court's middle, x), 1.4 m up (the burner's top). */
export const CENSER = [(COURT[0] + COURT[2]) / 2, 1.4, -113.4];
const FRONT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The emitters, from the layout (computed once). */
function emitters() {
  const E = [], rand = rng(2711);
  for (const l of lots()) {
    if (l.kind === 'yard') continue;
    const [x0, z0, x1, z1] = l.rect, f = l.front, n = FRONT[f], along = f === 'n' || f === 's';
    const Lw = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
    // a point t along the front and d metres in from it
    const P = (t, d) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) - n[1] * d] : [(f === 'e' ? x1 : x0) - n[0] * d, z0 + (z1 - z0) * t]);
    if (rand() < 0.36 && Lw > 3.3) {
      // the kitchen stove (zao) stands at the back of the house; its smoke leaves by a vent in the roof near the ridge
      const [x, z] = P(0.25 + rand() * 0.5, D * (0.45 + rand() * 0.15));
      const yE = LEVEL.street + 0.45 + 3.15 + (l.storeys > 1 ? 2.65 : 0);
      E.push({ p: [x, yE + 1.15, z], kind: 'kitchen', seed: l.seed + 1 });
    }
    if (l.shop && l.trade === 'tea') {
      // the tea urn on the counter by the street
      const [x, z] = P(0.5, 0.9);
      E.push({ p: [x, LEVEL.street + 1.55, z], kind: 'steam', thr: rand() * 0.3, seed: l.seed + 2 });
    }
  }
  E.push({ p: CENSER, kind: 'incense', thr: 0, seed: 7 });
  // mist banks along the canals, in the middle of the water
  for (const c of CANALS) {
    const horiz = c[2] - c[0] > c[3] - c[1], mx = (c[0] + c[2]) / 2, mz = (c[1] + c[3]) / 2;
    const [a0, a1] = horiz ? [c[0], c[2]] : [c[1], c[3]];
    for (let a = a0 + 14; a < a1 - 14; a += 26) {
      const x = horiz ? a : mx, z = horiz ? mz : a;
      if (Math.hypot(x, z) > RADIUS - 20 || (z < -150)) continue;
      E.push({ p: [x, LEVEL.canal + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(a) + 99 });
    }
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
    // shown only when its shaders are built
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
      // nothing to draw when the eye is more than 300 m from the settlement's nearest edge
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.max(bump(h, 6.6, 0.8, 0.6), bump(h, 11.7, 0.8, 0.7), bump(h, 17.6, 1.0, 0.9));
      const steam = Math.min(1, Math.max(0, (h - 5.8) / 1.4)) * Math.min(1, Math.max(0, (20 - h) / 1.5)) * 0.9;
      const mist = bump(h, 5.4, 1.4, 0.9);
      r.meal = h < 9 ? 0 : h < 14.5 ? 1 : 2;
      smoke.setLevels(kitchen, 1, steam, mist, r.meal);
    }
  },
});
