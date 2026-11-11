// Amsterdam about 1670 — smoke and mist (docs/settlements/amsterdam.md §11): kitchen and hearth smoke from a share of the
// canal houses at the three meals, rising from the chimneys at the ridge; steam from the brew-houses' and bakers' roofs by day
// (the Weigh House's neighbours on the Dam); the mist of the Low Countries lying on the canals and the IJ at dawn. The engine part
// is src/engine/smoke.js; this registers the system and places the emitters from the layout (the settlement's frame: x east, y
// up, z south).

import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { lots, C, RINGS, IJ_Z, GROUND, WATER, RADIUS, DAMRAK } from './layout.js';

const ID = 'amsterdam';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The ridge's height over the ground for a house of n storeys (house.js: basement 1, ground floor 3.6, floors ~3.1, the roof behind the gable). */
const ridge = (n) => GROUND + 1.0 + 3.6 + (n - 1) * 3.1 + 4.4;

function emitters() {
  const E = [], rand = rng(1675);
  for (const l of lots()) {
    if (rand() > 0.4) continue;
    const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 'n' || f === 's';
    // the chimney stands on the party wall at the middle of the house's depth, to one side
    const t = 0.15 + 0.7 * rand(), d = 0.5 + 0.15 * rand();
    const x = along ? x0 + (x1 - x0) * t : f === 'e' ? x1 - (x1 - x0) * d : x0 + (x1 - x0) * d;
    const z = along ? (f === 's' ? z1 - (z1 - z0) * d : z0 + (z1 - z0) * d) : z0 + (z1 - z0) * t;
    E.push({ p: [x, ridge(l.storeys) + 0.9, z], kind: 'kitchen', seed: l.seed + 1 });
  }
  // the mist on the canals' middle lines and on the IJ and the Damrak
  for (const R of RINGS) for (let a = 0.12; a < Math.PI - 0.1; a += 30 / R) {
    const x = C[0] + Math.cos(a) * R, z = C[1] + Math.sin(a) * R;
    if (Math.hypot(x, z) > RADIUS - 70 || z < C[1] + 26) continue;
    E.push({ p: [x, WATER + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(a * 100 + R) });
  }
  for (let x = -250; x <= 250; x += 38) E.push({ p: [x, WATER + 0.45, IJ_Z - 8 - (Math.abs(x) % 9)], kind: 'mist', thr: 0, seed: Math.floor(x) + 700 });
  for (let z = DAMRAK[1] + 8; z < DAMRAK[3] - 6; z += 14) E.push({ p: [(DAMRAK[0] + DAMRAK[2]) / 2, WATER + 0.45, z], kind: 'mist', thr: 0, seed: Math.floor(z) + 900 });
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
      // the hearth burned all day in the cold, damp climate (peat and wood), with peaks at the meals
      const kitchen = Math.max(0.35, bump(h, 7.0, 0.9, 0.7), bump(h, 12.0, 0.9, 0.9), bump(h, 18.0, 1.1, 1.0));
      const mist = Math.max(bump(h, 5.8, 1.6, 1.0), 0.2);
      r.meal = h < 9.5 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, 1, 0, mist, r.meal);
    }
  },
});
