// Constantinople — smoke and steam (docs/settlements/constantinople.md §13): kitchen smoke from the tenements' roof
// vents at the morning and evening meals, steam from the bath's furnace and hot room, from the cook-shops
// of the Mese by day, incense from the chapel's censer and the steps of Hagia Sophia at the hours of the
// office. The engine part is src/engine/smoke.js (one draw call); positions from the layout.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, lots, special, height } from './layout.js';
import { MESE_STOAS } from './plan.js';

const ID = 'constantinople';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function emitters() {
  const E = [], S = special();
  for (const l of lots()) {
    if (Object.values(S).includes(l)) continue;
    const r = rng(l.seed || 1); r(); const n = 2 + (r() < 0.62 ? 1 : 0), [x0, z0, x1, z1] = l.rect;
    if (rng(l.seed + 7)() < 0.4) E.push({ p: [x0 + (x1 - x0) * (0.3 + 0.4 * rng(l.seed + 3)()), l.y + 3.9 + (n - 1) * 3.15 + 1.6, (z0 + z1) / 2], kind: 'kitchen', seed: l.seed + 1 });
  }
  const b = S.bath.rect, c = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  E.push({ p: [b[2] - 1.5, S.bath.y + 9.2, b[1] + 3], kind: 'steam', thr: 0, seed: 21 }, { p: [c[0], S.bath.y + 10.6, b[1] + 5], kind: 'steam', thr: 0.1, seed: 22 });
  const ch = S.chapel.rect; E.push({ p: [ch[2] - 6, S.chapel.y + 9.9, (ch[1] + ch[3]) / 2], kind: 'incense', thr: 0.1, seed: 23 });
  E.push({ p: [-6, 1.0, 40], kind: 'incense', thr: 0, seed: 24 }, { p: [6, 1.0, 40], kind: 'incense', thr: 0, seed: 25 });
  const r = rng(562);
  for (const st of MESE_STOAS) if (st.shops && r() < 0.7) {
    const [ax, az] = st.a, [bx, bz] = st.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], s = st.side;
    for (const d of [0.3, 0.62]) { const t = 9.2 * s; E.push({ p: [ax + L * d * u[0] - t * u[1], height(ax, az) + 9.6, az + L * d * u[1] + t * u[0]], kind: 'steam', thr: 0.1, seed: Math.floor(r() * 1e6) }); }
  }
  void RADIUS;
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
      const kitchen = Math.max(bump(h, 7.0, 0.9, 0.6), bump(h, 12.0, 0.8, 0.4), bump(h, 18.0, 1.0, 0.8));
      const incense = 0.4 + 0.6 * Math.max(bump(h, 6.0, 1.2, 1), bump(h, 15.0, 1.2, 0.8), bump(h, 18.0, 1.2, 0.8));
      const steam = Math.min(1, Math.max(0, (h - 6.5) / 1.4)) * Math.min(1, Math.max(0, (19.5 - h) / 1.5)) * 0.9;
      r.meal = h < 10 ? 0 : h < 15 ? 1 : 2;
      smoke.setLevels(kitchen, incense, steam, 0, r.meal);
    }
  },
});
