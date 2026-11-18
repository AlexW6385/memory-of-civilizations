// The ways up in the court's houses (docs/settlements/paris.md §5e): builds the court's near plans and walks each
// route from the street to the top storey's room, the attic, the gallery, printing where the feet end and how high.
import { courtHouses, courtLots } from '../src/settlements/paris/court-houses.js';
import { upperRoutes } from '../src/styles/gothic/houses.js';
import { buildPlan } from '../src/core/build.js';
import { CollisionWorld, topField } from '../src/core/collide.js';
import { move, footing, WALK } from '../src/core/walk.js';
import { height } from '../src/settlements/paris/layout.js';
import '../src/settlements/paris/index.js';

const cw = new CollisionWorld();
cw.terrain = (x, z) => height(x, z); cw.water = () => false; cw.waterLevel = () => -Infinity;
for (const plan of courtHouses()) {
  if (plan.nocollide) continue;
  const b = buildPlan(plan, { detail: true });
  b.colliders.tops = await topField(b.parts);
  cw.add(b.colliders);
}
const out = [];
let bad = 0;
for (const l of courtLots()) {
  if (!l.upper) continue;
  const el = { rect: l.rect, seed: l.seed, front: 'n', storeys: l.storeys, upper: l.upper };
  const R = upperRoutes(el);
  for (const [name, route] of Object.entries(R)) {
    const P = { x: route[0][0], y: 0, z: route[0][1], vy: 0 };
    P.y = footing(cw, P.x, P.z, 1 + 0.5);
    let fail = null;
    for (let k = 1; k < route.length && !fail; k++) {
      const [tx, tz] = route[k]; let t = 0, ok = false;
      const lim = Math.hypot(tx - P.x, tz - P.z) / WALK * 3 + 4;
      while (t < lim) { const dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz); if (d < 0.3) { ok = true; break; } const sp = Math.min(WALK / 60, d); move(P, dx / d * sp, dz / d * sp, 1 / 60, cw); t += 1 / 60; }
      if (!ok) fail = `stuck before ${k}/${route.length - 1} (${tx.toFixed(1)}, ${tz.toFixed(1)}) at (${P.x.toFixed(1)}, ${P.y.toFixed(2)}, ${P.z.toFixed(1)})`;
    }
    const want = name === 'attic' ? l.storeys : name === 'gallery' ? 1 : l.storeys - 1;
    const exp = 1 + 3.3 + (want - 1) * 2.75 + 0.03 - (name === 'room' ? 0 : 0);
    const okY = !fail && Math.abs(P.y - (name === 'gallery' ? 1 + 3.33 : 1 + 3.3 + (want - 1) * 2.75 + 0.03)) < 0.4;
    if (fail || !okY) bad++;
    out.push(`lot ${l.i} ${l.upper} n=${l.storeys} ${name}: ${fail || (okY ? 'ok' : 'WRONG HEIGHT')} y=${P.y.toFixed(2)} (expect ${(name === 'gallery' ? 4.33 : 1 + 3.3 + (want - 1) * 2.75 + 0.03).toFixed(2)})`);
    void exp;
  }
}
console.log(out.join('\n'));
console.log(bad ? `${bad} FAILED` : 'all ways up walk');
process.exit(bad ? 1 : 0);
