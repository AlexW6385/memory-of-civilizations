// Mamluk Cairo — smoke and steam (docs/settlements/mamluk-cairo.md §12): kitchen smoke from the houses' roofs at the meals,
// the hammam's chimney (the furnace burned all day) and steam from the bath's domes, incense at the doors of the great
// mosques at the hours of prayer, cook-shop smoke in the covered market streets. Engine part: src/engine/smoke.js.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, SUQ, SUQ2, SUQ3, HAMMAM, KHAN, height } from './layout.js';

const ID = 'mamluk-cairo';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [];
  for (const l of lots()) {
    const r = rng((l.seed || 1) + 5);
    if (r() < 0.28) { const [x0, z0, x1, z1] = l.rect; E.push({ p: [x0 + (x1 - x0) * (0.3 + 0.4 * r()), l.y + l.storeys * 3.1 + 0.8, z0 + (z1 - z0) * 0.5], kind: 'kitchen', seed: l.seed + 1 }); }
  }
  // the bath: the furnace chimney (always), steam from the domes of the maslakh and hot room
  const [X0, Z0, X1, Z1] = HAMMAM;
  E.push({ p: [X1 - 5, 6.4 + 9.8, Z1 - 3.5], kind: 'kitchen', seed: 31 });
  E.push({ p: [X0 + 6.5, 6.4 + 3.2, Z0 + 9], kind: 'steam', thr: 0, seed: 32 }, { p: [X1 - 6, 6.4 + 3.2, Z0 + 9], kind: 'steam', thr: 0, seed: 33 });
  // the cook-shops of the market streets: every fourth bay
  const r = rng(1363);
  for (const S of [SUQ, SUQ2, SUQ3]) for (let z = S[1] + 10; z < S[3] - 6; z += 18) if (r() < 0.75) E.push({ p: [S[0] + (r() < 0.5 ? 5.5 : S[2] - S[0] - 5.5), 8.2, z], kind: 'steam', thr: 0.1, seed: Math.floor(r() * 1e6) });
  // incense at the portal of Sultan Hasan's madrasa and Qalawun's, and at the khan's gate
  E.push({ p: [-37.5, 1.0, 4], kind: 'incense', thr: 0.2, seed: 41 }, { p: [-171, 1.0, -216], kind: 'incense', thr: 0.2, seed: 42 }, { p: [KHAN[0] - 1, 1.0, (KHAN[1] + KHAN[3]) / 2], kind: 'incense', thr: 0.1, seed: 43 });
  void RADIUS; void height;
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
      const kitchen = Math.max(0.35, bump(h, 7.0, 0.9, 0.6), bump(h, 12.5, 0.8, 0.5), bump(h, 18.0, 1.0, 0.8));
      const incense = 0.4 + 0.6 * Math.max(bump(h, 5.0, 1.0, 1), bump(h, 12.0, 1.0, 0.8), bump(h, 15.5, 1.0, 0.8), bump(h, 18.0, 1.0, 0.8));
      const steam = Math.min(1, Math.max(0, (h - 6.5) / 1.4)) * Math.min(1, Math.max(0, (20.5 - h) / 1.5)) * 0.9;
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, steam, 0, r.meal);
    }
  },
});
