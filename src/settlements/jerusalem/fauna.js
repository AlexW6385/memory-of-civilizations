// Jerusalem about 700 — the animals (src/engine/fauna.js draws them; docs/settlements/jerusalem.md §11): rock
// doves (drawn as sparrows) on the Haram's paving and the Dome's platform, sparrows at the shop fronts of the
// Cardo, swifts and swallows over the roofs and the esplanade, crows over the Kidron slope, a few over the city.
import { HARAM, CARDO, STREET, gardens, height } from './layout.js';
import { ground } from './ground.js';
import { openHouses, WELLS } from './soundmap.js';
import { allColonnades, colKey, shopsOf, TRADES_OF } from './shopline.js';

const hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 60], a: [110, 90], rot: 0.2 }, y: [18, 45], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [CARDO.x, 0], a: [40, 200], rot: 0 }, y: [10, 30], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [230, 20], a: [90, 140], rot: 0.4 }, y: [20, 60], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-200, 100], a: [90, 60], rot: 0 }, y: [25, 60], speed: 8 },
];
const perches = [];
const [x0, z0, x1, z1] = HARAM.rect;
for (const [x, z] of [[-50, -60], [-30, -35], [30, -50], [50, -10], [-60, 20], [10, 40], [70, 70], [-90, 90], [90, -120], [-100, -150], [0, 100], [40, 150], [-20, -170]]) if (x > x0 && x < x1 && z > z0 && z < z1) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [2.2, 1.8] });
for (const z of [-250, -190, -120, -60, 40, 100, 170, 240]) for (const s of [-1, 1]) perches.push({ kind: 'sparrow', x: CARDO.x + s * 4.5, z, y: ground.height(CARDO.x, z), rot: (z * 3) % 3, range: [1.6, 1.4] });
// the market street's shop fronts and the gardens' walls: sparrows and doves
for (let x = -355; x < -182; x += 17) for (const s of [-1, 1]) { if (x > -250 && x < -210) continue; perches.push({ kind: 'sparrow', x, z: s * (STREET.road - 0.4), y: ground.height(x, s * STREET.road), rot: (x * 5) % 3, range: [1.8, 1.2] }); }
for (const g of gardens().filter((q) => q.kind === 'yard' || q.kind === 'orchard').slice(0, 14)) { const cx = (g.rect[0] + g.rect[2]) / 2, cz = (g.rect[1] + g.rect[3]) / 2; perches.push({ kind: 'sparrow', x: cx, z: cz, y: ground.height(cx, cz), rot: g.seed % 3, range: [3, 3] }); }
flights.push({ kind: 'swallow', n: 5, loop: { c: [-300, 0], a: [70, 25], rot: 0 }, y: [8, 22], speed: 10 });

// ── the critters (docs/settlements/jerusalem.md §12.4): the engine's rigged small animals, on the ground and off the ways walked ──
// (the goats, sheep and donkey of the yards stay the plan's own static animals, lanes.js and life.js)
const critters = [];
// cats before the shut shops of the Cardo and the market street (a cat sits in the shade of the portico by the keeper's door), a hand's width off
// the shop's axis, against the front wall, out of the portico's walk: the three shut shops of the market street nearest the Haram's stair, the five nearest the Cardo's middle
{
  const shut = [];
  for (const el of allColonnades()) {
    const codes = TRADES_OF[colKey(el)];
    if (!codes) continue;
    const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], side = el.side ?? 1;
    for (const sh of shopsOf(el, codes)) if (!sh.trade) {
      const s = (sh.i + 0.5) * sh.w + 1.15, t = (el.depth ?? 5) - 0.55;
      shut.push({ at: [ax + u[0] * s + n[0] * t * side, az + u[1] * s + n[1] * t * side], y: el.y + 0.18, out: [-n[0] * side, -n[1] * side] });
    }
  }
  const by = (c) => shut.slice().sort((p, q) => Math.hypot(p.at[0] - c[0], p.at[1] - c[1]) - Math.hypot(q.at[0] - c[0], q.at[1] - c[1]));
  const street = by([-190, 0]).filter((q) => Math.abs(q.at[1]) < 12 && Math.abs(q.at[0] - CARDO.x) > 20), cardo = by([CARDO.x, 0]).filter((q) => Math.abs(q.at[0] - CARDO.x) < 20);
  const take = [...street.slice(0, 3), ...cardo.slice(0, 5)];
  take.forEach((q, i) => critters.push({ model: i % 2 ? 'cat_orange' : 'cat_tabby', at: [q.at[0], q.y, q.at[1]], rot: Math.atan2(q.out[1], q.out[0]) + 0.5 * (i % 3 - 1), range: [7, 2.5] }));
  // a street dog asleep at the foot of a shut shop's front on the Cardo's far side from the cats, another in the market street
  const dogs = [by([CARDO.x, 150]).find((q) => !take.includes(q)), street.find((q) => !take.includes(q) && q.at[0] < -300)];
  dogs.forEach((q) => critters.push({ model: 'dog', at: [q.at[0] - q.out[0] * 0.2, q.y, q.at[1] - q.out[1] * 0.2], rot: Math.atan2(q.out[1], q.out[0]) + 1.2, range: [9, 3.5] }));
}
// hens and a cock in the court of four open houses without a stair, in the corner of the court clear of the cistern, the oven, the household and the line
// from the street door to the main room's door
{
  let n = 0;
  const homes = openHouses().filter((h) => !h.up).slice(0, 12);
  for (const h of homes) {
    if (n >= 4) break;
    const [x0, , x1] = h.rect, [cx0, cz0, cx1, cz1] = h.rooms.court, dc = (cx0 + cx1) / 2, mid = (x0 + x1) / 2;
    const F = Math.max(h.lot.y, ...[[h.rect[0], h.rect[1]], [h.rect[2], h.rect[1]], [h.rect[0], h.rect[3]], [h.rect[2], h.rect[3]]].map(([a, b]) => height(a, b))) + 0.05;
    const sx = [[cx1 - 1.3, cz0 + 1.4], [cx1 - 0.85, cz1 - 0.95], [cx1 - 1.4, cz1 - 1.0], [cx1 - 1.3, cz0 + 2.2], [(cx0 + cx1) / 2 - 0.6, (cz0 + cz1) / 2 + 0.3], [cx0 + 1.4, cz0 + 0.5], [dc + 1.1, cz1 - 0.45]];
    const lineD = (x, z) => { const ax = dc, az = cz1, bx = mid, bz = cz0, l2 = (bx - ax) ** 2 + (bz - az) ** 2, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / l2)); return Math.hypot(x - (ax + t * (bx - ax)), z - (az + t * (bz - az))); };
    const ok = (x, z) => x > cx0 + 1.9 && x < cx1 - 1.9 && z > cz0 + 1.9 && z < cz1 - 1.9 && sx.every(([a, b]) => Math.hypot(x - a, z - b) > 1.9) && lineD(x, z) > 1.7;
    const at = [[cx0 + 2.0, cz1 - 2.0], [cx0 + 2.0, cz0 + 2.0], [cx1 - 2.0, cz1 - 3.4], [(cx0 + cx1) / 2 + 2.0, cz0 + 2.0], [(cx0 + cx1) / 2 - 1.0, cz1 - 2.3]].find(([x, z]) => ok(x, z));
    if (!at) continue;
    [['rooster', 0, 0], ['hen_brown', -0.55, 0.5], ['hen_white', 0.45, -0.55]].forEach(([model, dx, dz]) => critters.push({ model, at: [at[0] + dx, F, at[1] + dz], rot: hashAt(at[0] + dx, at[1] + dz) * 6.28, range: [0.7, 0.6] }));
    n++;
  }
}
// doves feeding on the Haram's paving by three of its cisterns, where the water is (they walk and peck as the fowl do)
for (const [x, z] of WELLS.filter(([x, z]) => x > HARAM.rect[0] + 10 && x < HARAM.rect[2] - 10 && z > HARAM.rect[1] + 10 && z < HARAM.rect[3] - 10).slice(0, 3)) {
  [['pigeon_grey', 2.7, 0.3], ['pigeon_white', 3.2, -0.6], ['pigeon_dark', 2.5, -1.0]].forEach(([model, dx, dz]) => critters.push({ model, at: [x + dx, HARAM.top + 0.04, z + dz], rot: hashAt(x + dx, z) * 6.28, range: [1.4, 1.1] }));
}
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('jerusalem'));
export default { fish, flights, perches, critters };
