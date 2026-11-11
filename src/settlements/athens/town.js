// The town of Athens (docs/settlements/athens.md §5): courtyard houses in blocks round the hills.
import '../../styles/greek/ward.js';
import { RADIUS, lots, pathAt, WAY, RAMP, inRect, SLOPE, AGORA } from './layout.js';
import { TRADES } from '../../styles/greek/shops.js';
import { SIMON, lifePlan } from './life.js';
import { fronts, crossings, openLife } from './fronts.js';
import { WORKSHOPS, FOUNTAIN, SHOPROW, ACADEMY, PALAESTRA, XYSTOS, PARADROMIS, GATE, ALTAR_PROMETHEUS, HEROON, EXEDRA, ACADEMY_PATHS } from './quarters.js';
const base = (id, elements) => ({ id, style: 'greek', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-300, 70], facing: 'e' } });
const OPEN_TRADES = ['bronze', 'shoe', 'cloth', 'wine', 'perfume', 'carpenter'];
export async function town() {
  const all = lots(), plans = [], closed = all.filter((l) => !l.open), opened = all.filter((l) => l.open);
  for (let i = 0; i < closed.length; i += 120) plans.push(base(`athens-houses-${i / 120}`, closed.slice(i, i + 120).map((l) => ({ t: 'athens_house', rect: l.rect, front: l.front, seed: l.seed, y: l.y, tier: l.tier, fall: l.fall }))));
  // the walk-in houses (§5d): the same plan as Simon's, each with another trade in the shop on the street
  opened.forEach((l, k) => { const [X0, Z0, X1, Z1] = l.rect, t = 0.5, sz = Z1 - t - 3.1, xl = X0 + t + 4.3, xk = xl + 0.4 + 3.4;
    plans.push({ ...base(`athens-open-${k}`, [{ t: 'athens_open_house', rect: l.rect, y: l.y, seed: l.seed, trade: OPEN_TRADES[k % OPEN_TRADES.length] }]), rooms: [
      { id: `shop (${OPEN_TRADES[k % OPEN_TRADES.length]})`, rect: [X0 + 0.5, Z0 + 0.5, X0 + 5, Z0 + 5.3], y: l.y, kind: 'inner', market: false },
      { id: 'andron', rect: [X0 + 7.4, Z0 + 0.5, X1 - 0.5, Z0 + 5.3], y: l.y, kind: 'inner' },
      { id: 'loom room', rect: [X0 + 0.5, sz, xl, Z1 - 0.5], y: l.y, kind: 'inner' },
      { id: 'kitchen', rect: [xl + 0.4, sz, xk, Z1 - 0.5], y: l.y, kind: 'inner' },
      { id: 'store', rect: [xk + 0.4, sz, X1 - 0.5, Z1 - 0.5], y: l.y, kind: 'inner' }] }); });
  // the house and shop by the south-west corner of the Agora that the finds name Simon the shoemaker's (§5b), walked into
  plans.push({ ...base('athens-simon', [{ t: 'simon_house', rect: SIMON, y: 0, seed: 410 }]), rooms: [
    { id: 'shoemaker shop', rect: [SIMON[0] + 0.5, SIMON[1] + 0.5, SIMON[0] + 5, SIMON[1] + 5.3], y: 0, kind: 'inner', market: false },
    { id: 'andron', rect: [SIMON[0] + 7.4, SIMON[1] + 0.5, SIMON[2] - 0.5, SIMON[1] + 5.3], y: 0, kind: 'inner' }] });
  // the potters' quarter of the Kerameikos (§11a): workshops in two rows on a lane, each walked into
  plans.push({ ...base('athens-kerameikos', WORKSHOPS.map((w, i) => ({ t: 'potter_works', ...w, y: 0, firing: i % 4 === 1 }))), rooms: WORKSHOPS.map((w, i) => {
    const [x0, z0, x1, z1] = w.rect, n = w.front === 'n';
    return { id: `workshop ${i + 1}`, rect: n ? [x0 + 0.5, z0 + 0.5, x0 + 9.6, z0 + 5.3] : [x0 + 0.5, z1 - 5.3, x0 + 9.6, z1 - 0.5], y: 0, kind: 'inner', market: false };
  }) });
  // the workshops under the Agora's south side (§11d): five shops behind a double colonnade, each fitted for its trade
  { const [x0, z0, x1, z1] = SHOPROW, rw = (x1 - x0 - 1.4) / 5;
    plans.push({ ...base('athens-shops', [{ t: 'stoa', rect: SHOPROW, front: 'n', y: 0.35, h: 3.6, d: 0.53, sp: 1.745, flutes: 0, inner: { d: 0.5, every: 2 }, rooms: { n: 5, depth: 5.9, trades: TRADES }, mat: 'limestone', wall: 'mud_plaster', seed: 43 }]),
      rooms: TRADES.map((id, k) => ({ id: `shop: ${id}`, rect: [x0 + 0.7 + k * rw + 0.3, z1 - 5.9 + 0.55, x0 + 0.7 + (k + 1) * rw - 0.1, z1 - 0.8], y: 0.35, kind: 'inner', market: false })) }); }
  plans.push(base('athens-fountain', [{ t: 'fountain_house', rect: FOUNTAIN, front: 'n', y: 0.1 }]));
  // the Academy (§11c): the grove's precinct and its sanctuaries, the palaestra, the covered track
  plans.push({ ...base('athens-academy', [
    { t: 'academy_grounds', rect: ACADEMY, y: 0, gate: GATE, altar: ALTAR_PROMETHEUS, heroon: HEROON, exedra: EXEDRA, paths: ACADEMY_PATHS },
    { t: 'gymnasium', rect: PALAESTRA, front: 's', y: 0, seed: 7 },
    { t: 'stoa', rect: XYSTOS, front: 'n', y: 0, h: 3.4, d: 0.5, sp: 1.9, flutes: 0, mat: 'limestone', wall: 'mud_plaster', arch: 0.4, frieze: 0.4, geison: 0.2, tw: 0.3, triglyphMat: 'egyptian_blue' },
    { t: 'block', rect: PARADROMIS, y0: -0.3, y1: 0.02, mat: 'sandstone_white', walk: true }],
  ), rooms: [{ id: 'palaestra', rect: PALAESTRA, y: 0, kind: 'open' }] });
  // the street: what stands before the fronts, the herms at the lane crossings, the wells, the people of the fronts and of the walk-in houses
  { const { herms, wells } = crossings();
    plans.push(base('athens-herms', herms.map((h) => ({ t: 'herm', ...h }))));
    plans.push({ ...lifePlan(), id: 'athens-fronts', elements: [...fronts(), ...wells, ...openLife()] }); }
  plans.push(lifePlan());
  return plans;
}
