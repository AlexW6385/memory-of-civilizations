// The upper rooms of London's open houses are really built where the walk-check routes end (dossier §9): each route of the landmark's
// `walks` ends in a room of an `up` lot; the near tile plan the viewer loads for that lot (town.js terraceTiles) must hold, at the end,
// a floor under the feet, a ceiling over the head and a wall round, and the lot's element must carry `up`. Builds only the tiles concerned.
import '../src/settlements/london/index.js';
import { buildPlan, flatParts } from '../src/core/build.js';
import { westminster } from '../src/settlements/london/plan.js';
import { houses } from '../src/settlements/london/town.js';
import { upLots } from '../src/settlements/london/town.js';

const ups = upLots(), routes = westminster.walks.slice(1);
if (routes.length !== ups.length || routes.length < 10) throw new Error(`routes ${routes.length} for ${ups.length} up lots`);
const plans = (await houses()).filter((p) => p.id.startsWith('london-terraces') && !p.far);
const rect = (l) => l.rect;
const inside = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
const tileOf = (l) => plans.find((p) => p.elements.some((e) => e.rect === rect(l)));
const need = new Set(ups.map((l) => tileOf(l)?.id));
if (need.has(undefined)) throw new Error('an up lot is in no near tile');
const tri = new Map();
for (const p of plans) {
  if (!need.has(p.id)) continue;
  const built = buildPlan(p, { instancing: true, detail: true }), T = [];
  for (const { geometry } of flatParts(built)) {
    const P = geometry.attributes.position.array, N = geometry.attributes.normal.array;
    for (let t = 0; t < P.length; t += 9) T.push([P.subarray(t, t + 9), N[t + 1]]);
  }
  tri.set(p.id, T);
  for (const g of built.parts) g.geometry.dispose();
}
const covers = ([a], x, z) => { const d = (a[5] - a[8]) * (a[0] - a[6]) + (a[6] - a[3]) * (a[2] - a[8]); if (Math.abs(d) < 1e-9) return false; const u = ((a[5] - a[8]) * (x - a[6]) + (a[6] - a[3]) * (z - a[8])) / d, v = ((a[8] - a[2]) * (x - a[6]) + (a[0] - a[6]) * (z - a[8])) / d; return u >= -1e-6 && v >= -1e-6 && 1 - u - v >= -1e-6; };
let bad = 0;
for (const [i, l] of ups.entries()) {
  const r = routes[i], [x, z] = r[r.length - 1], plan = tileOf(l), el = plan.elements.find((e) => e.rect === rect(l)), T = tri.get(plan.id);
  const floors = T.filter((t) => t[1] > 0.9 && covers(t, x, z)).map((t) => t[0][1]).sort((a, b) => b - a);
  const ceils = T.filter((t) => t[1] < -0.9 && covers(t, x, z)).map((t) => t[0][1]);
  // a floor with a ceiling 2.4–3.8 m above it and nothing else between: a room
  const room = floors.find((f) => f > 4 && ceils.some((c) => c - f > 2.4 && c - f < 3.8));
  const ok = el.up === true && el.open === true && inside(rect(l), x, z, 0.3) && room !== undefined;
  if (!ok) bad++;
  console.log(`up lot ${i + 1} ${l.pub ? 'pub' : l.shop ? 'shop' : 'house'} ${plan.id}: end ${x.toFixed(1)}, ${z.toFixed(1)} ${ok ? `room, floor ${room.toFixed(2)}` : `FAIL (up ${el.up}, open ${el.open}, in lot ${inside(rect(l), x, z, 0.3)}, floors ${floors.slice(0, 4).map((f) => f.toFixed(2))}, ceilings ${ceils.slice(0, 4).map((f) => f.toFixed(2))})`}`);
}
console.log(bad ? `${bad} FAILED` : `all ${ups.length} upper rooms built at their routes' ends`);
process.exit(bad ? 1 : 0);
