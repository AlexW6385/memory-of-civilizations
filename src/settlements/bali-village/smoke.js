// A Balinese village — smoke and mist (docs/settlements/bali-village.md §9): the kitchens' hearths of the compounds at the morning and evening meals (the smoke leaves
// through the thatch), incense at the temple's padmasana and the banyan's shrine, mist lying on the paddies at dawn. The engine part is src/engine/smoke.js; positions
// come from layout.js. Emitters in the settlement's frame.
import { registerSystem } from '../../engine/systems.js';
import { Smoke, solarHour, bump } from '../../engine/smoke.js';
import { RADIUS, PURA, BANYAN, DALEM_C, lots, lotFrame } from './layout.js';

const ID = 'bali-village';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function emitters() {
  const E = [], rand = rng(1900);
  for (const l of lots()) {
    if (rand() > 0.6) continue;
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    // through the thatch of the kitchen, a little under its ridge: toward the lot's front corner on the sanggah side (about 4 m in from the street wall)
    const a = l.front === 'e' ? [x1 - 4.4, cz - 4] : l.front === 'w' ? [x0 + 4.4, cz - 4] : l.front === 'n' ? [cx - 4, z0 + 4.4] : [cx - 4, z1 - 4.4];
    E.push({ p: [a[0] + (rand() - 0.5) * 3, 3.4, a[1] + (rand() - 0.5) * 3], kind: 'kitchen', thr: rand(), seed: l.seed + 1 });
  }
  // the trades: steam from the warung's pot and the smith's forge through the thatch by day, incense at the offering sellers'; the pura dalem's incense (its frame turned: local (dx, dz) is world (cx − dz, cz + dx))
  for (const l of lots()) {
    if (!l.shop) continue;
    const F = lotFrame(l), { kind, u0, u1 } = l.shop;
    if (kind === 'warung') { const p = F(u1 - 0.8, 2.3); E.push({ p: [p[0], 3.5, p[1]], kind: 'steam', thr: 0.1, seed: l.seed + 3 }); }
    else if (kind === 'pande') { const p = F(u0 + 1.1, 2.2); E.push({ p: [p[0], 3.6, p[1]], kind: 'steam', thr: 0.0, seed: l.seed + 4 }); E.push({ p: [p[0], 3.4, p[1]], kind: 'kitchen', thr: 0.0, seed: l.seed + 5 }); }
    else if (kind === 'offerings') { const p = F(u0 + 0.3, 0.5); E.push({ p: [p[0], 1.5, p[1]], kind: 'incense', thr: 0.3, seed: l.seed + 6 }); }
  }
  { const [cx, cz] = DALEM_C, W2 = (dx, dz) => [cx - dz, cz + dx]; for (const [dx, dz, y, sd] of [[0, -7.8, 1.5, 11], [-5.4, -3.0, 1.4, 12], [5.6, -9.2, 1.3, 13]]) { const q = W2(dx, dz); E.push({ p: [q[0], y, q[1]], kind: 'incense', thr: 0, seed: sd }); } }
  // incense at the temple: before the padmasana and the meru, at the banyan's shrine
  E.push({ p: [26, PURA.y2 + 1.2, -143], kind: 'incense', thr: 0, seed: 7 });
  E.push({ p: [0, PURA.y2 + 1.0, -138], kind: 'incense', thr: 0, seed: 8 });
  E.push({ p: [BANYAN[0] + 4.0, 1.4, BANYAN[1]], kind: 'incense', thr: 0.2, seed: 9 });
  // mist banks over the terraces at dawn
  for (let a = 0; a < 6.28; a += 0.5) for (const r of [120, 165]) {
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x, z) > RADIUS - 14) continue;
    E.push({ p: [x, -1.2, z], kind: 'mist', thr: 0, seed: Math.floor(a * 20 + r) });
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
    for (const r of ATT) {
      const { site, smoke } = r;
      if (site.state !== 'ready' || !site.group.visible || !r.ready) { smoke.mesh.visible = false; continue; }
      smoke.setEye(camera, site.group);
      const e = smoke.eye.value;
      if (Math.hypot(e.x, e.z) > RADIUS + 300 || Math.abs(e.y) > 600) { smoke.mesh.visible = false; continue; }
      smoke.mesh.visible = true;
      const h = solarHour();
      const kitchen = Math.max(bump(h, 6.0, 0.8, 0.6), bump(h, 17.5, 1.0, 0.9));
      smoke.setLevels(kitchen, 1, h > 6.2 && h < 17.2 ? 0.7 : 0, Math.max(bump(h, 5.6, 1.4, 1.0), bump(h, 6.5, 1.0, 0.7)), h < 9 ? 0 : h < 15 ? 1 : 2);
    }
  },
});
