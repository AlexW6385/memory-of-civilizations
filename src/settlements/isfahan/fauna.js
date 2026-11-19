// Safavid Isfahan — the animals (src/engine/fauna.js draws the birds, src/engine/fauna-critters.js the rigged small animals; docs/settlements/isfahan.md §26.4):
// the pigeons of the towers wheeling over the fields and the town and feeding on the paving; sparrows and crows; cats on the shops' platforms and
// at the doors, a dog or two at the caravan, hens in the courts of the houses. All on the ground and off the ways walked (platform gaps, the walks' edges,
// the court's corners), their places a function of the plan's own numbers (no counters, no Math.random).
import { SQUARE, CANAL, BAZAAR, DOVECOTES, openHouses, houseSpots, arcadeBays, ARRIVAL } from './layout.js';

const [sx0, sz0, sx1, sz1] = SQUARE;
const hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };

// ── the birds ──
// the pigeons of the six towers (Archnet 2888: thousands to a tower): a flock turning round each, high over its dome
const flights = DOVECOTES.map((d, i) => ({ kind: 'pigeon', n: 7, loop: { c: d.c, a: [d.r * 2.6, d.r * 1.9], rot: 0.6 * i }, y: [d.h + 3, d.h + 16], speed: 8 }));
// a few that come into the town and follow the visitor down the square's walks, and crows over the royal garden and the fields
flights.push({ kind: 'pigeon', n: 5, lane: { a: [-72, -280], b: [-72, 240] }, y: [7, 16], speed: 8 });
flights.push({ kind: 'pigeon', n: 5, lane: { a: [72, -280], b: [72, 240] }, y: [7, 16], speed: 8 });
flights.push({ kind: 'crow', n: 4, loop: { c: [-220, -90], a: [60, 40], rot: 0.4 }, y: [22, 40], speed: 9 });
flights.push({ kind: 'crow', n: 3, loop: { c: [180, 120], a: [70, 50], rot: -0.5 }, y: [24, 42], speed: 9 });
// sparrows on the paving of the walks by the canal and before the arcade's arches nearest the arrival, and on the bazaar portal's floor
const perches = [];
for (const [x, z] of [[-74, 120], [-72, 150], [-75, 196], [74, 130], [73, 160], [75, 205], [-8, 143], [9, 150], [-2, sz0 + 6], [6, sz0 + 9]]) perches.push({ kind: 'sparrow', x, z, y: 0.04, rot: 0.3 + (Math.abs(x * 7) % 3), range: [1.6, 1.3] });
// pigeons perched on the cornice of the arcade (12 m up), where the doves of the square rest
for (const [x, z, rot] of [[sx0 - 1, 200, Math.PI / 2], [sx1 + 1, 175, Math.PI / 2], [sx0 - 1, 130, Math.PI / 2]]) perches.push({ kind: 'pigeon', x: x - Math.sign(x) * 1.6, z, y: 12.05, rot, range: [3, 0], alert: 6 });

// ── the critters (dossier §26.4) ──
const critters = [];
// cats on the stone platforms of the arcade's shut shops (a cat sits among the wares at the keeper's door), the nearest three each side of the arrival's axis
{
  const bays = arcadeBays().filter((b) => !b.open && Math.abs(b.c[1] - ARRIVAL[1]) < 70 && Math.abs(Math.abs(b.c[0]) - 80.6) < 1).sort((a, b) => Math.hypot(a.c[0] - ARRIVAL[0], a.c[1] - ARRIVAL[1]) - Math.hypot(b.c[0] - ARRIVAL[0], b.c[1] - ARRIVAL[1]));
  const take = [...bays.filter((b) => b.c[0] < 0).slice(0, 2), ...bays.filter((b) => b.c[0] > 0).slice(0, 2)];
  take.forEach((b, i) => {
    const u = 0.78 * (i % 2 ? -1 : 1), d = 2.6, x = b.c[0] + b.u[0] * u + b.n[0] * d, z = b.c[1] + b.u[1] * u + b.n[1] * d;
    critters.push({ model: i % 2 ? 'cat_orange' : 'cat_tabby', at: [x, 0.47, z], rot: Math.atan2(-b.n[1], -b.n[0]) + 0.4, range: [7, 2.5] });
  });
}
// pigeons feeding on the paving of the walks and by the canal's curb (they walk and peck as the fowl do): flocks of four at three places in view of the arrival
[[-72.5, 128], [72.5, 214], [-71.5, 186], [20, 262]].forEach(([x, z], k) => {
  [['pigeon_grey', 0, 0], ['pigeon_white', 0.7, 0.5], ['pigeon_dark', -0.6, 0.7], ['pigeon_grey', 0.3, -0.8]].forEach(([model, dx, dz], i) => critters.push({ model, at: [x + dx, 0.04, z + dz], rot: hashAt(x + i, z) * 6.28, range: [1.4, 1.1], size: 0.96 + 0.04 * ((i + k) % 2) }));
});
// and at the foot of three of the towers, where the grain is thrown
for (const d of DOVECOTES.slice(0, 3)) {
  const a = Math.atan2(d.c[1], d.c[0]) + Math.PI, r = d.r + 2.2;
  [['pigeon_grey', 0], ['pigeon_white', 0.5], ['pigeon_dark', -0.5]].forEach(([model, da], i) => { const x = d.c[0] + Math.cos(a + da * 0.4) * r, z = d.c[1] + Math.sin(a + da * 0.4) * r; critters.push({ model, at: [x, 0.04, z], rot: hashAt(x, z) * 6.28, range: [1.4, 1.1] }); });
}
// street dogs at the caravan's end of the bazaar and by the lane east of the square, asleep or watching
critters.push({ model: 'dog', at: [BAZAAR.x + 6.5, 0.04, BAZAAR.z1 - 12.5], rot: 1.1, range: [9, 3.5] });
critters.push({ model: 'dog', at: [sx1 + 15, 0.04, -184.5], rot: -0.6, range: [9, 3.5] });
// hens (and a rooster) in the courts of the walk-in houses nearest the arrival that have no stair: a corner clear of the pool, the takht, the beds and the people
{
  const near = openHouses().filter((h) => !h.up).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - ARRIVAL[0], (a.rect[1] + a.rect[3]) / 2 - ARRIVAL[1]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - ARRIVAL[0], (b.rect[1] + b.rect[3]) / 2 - ARRIVAL[1]));
  let n = 0;
  for (const h of near) {
    if (n >= 4) break;
    const sp = houseSpots(h), c = sp.court, [pcx, pcz, pw, pd] = h.v.pool, ins = (r, x, z, m) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m;
    const corners = [[c[0] + 2.3, c[1] + 2.3], [c[2] - 2.3, c[1] + 2.3], [c[0] + 2.3, c[3] - 2.3], [c[2] - 2.3, c[3] - 2.3]];
    const ok = (x, z) => !(Math.abs(x - pcx) < pw + 1.15 && Math.abs(z - pcz) < pd + 1.15) && !(h.v.takht && ins(h.v.takht, x, z, 1.2)) && !h.v.beds.some(([bx, bz, hb = 1]) => Math.abs(x - bx) < hb + 0.9 && Math.abs(z - bz) < hb + 0.9) && !sp.people.some((p) => Math.hypot(x - p.at[0], z - p.at[1]) < 1.8) && !(Math.hypot(x - (h.rect[0] + h.rect[2]) / 2, z - (h.rect[1] + h.rect[3]) / 2) < 0.1);
    // keep to a corner away from the street door's lane (the entry side's wing), toward the middle of the court
    const at = corners.find(([x, z]) => ok(x, z));
    if (!at) continue;
    const sx = at[0] < pcx ? 1 : -1, sz = at[1] < pcz ? 1 : -1;
    [['rooster', 0, 0], ['hen_brown', -0.8 * sx, 0.5 * sz], ['hen_white', -0.3 * sx, -0.8 * sz]].forEach(([model, dx, dz]) => critters.push({ model, at: [at[0] + dx, 0.04, at[1] + dz], rot: hashAt(at[0] + dx, at[1] + dz) * 6.28, range: [0.7, 0.6] }));
    n++;
  }
}
void CANAL;
export default { fish: [], flights, perches, critters };
