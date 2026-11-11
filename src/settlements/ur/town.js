// The town round the temenos (docs/settlements/ur.md §5): courtyard houses of plastered mud brick, three of them
// open and furnished on the market square before the north gate (§5.1); the square itself (a market: the
// generic life pass sets out its stalls) and the life of the streets and the quay (§5.2).
import { RADIUS, MARKET, HARBOUR, YARD, houses, inHouse, inHarbour, usedLots } from './layout.js';
import { urLife } from './life.js';
const base = (id, elements) => ({ id, style: 'sumerian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -110], facing: 's' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`ur-houses-${i / 150}`, all.slice(i, i + 150).map((h) => ({ t: h.chapel ? 'ur_chapel' : 'ur_house', ...h }))));
  const { figures, gear } = urLife();
  plans.push({ ...base('ur-square', gear), rooms: [{ id: 'market square west', rect: [MARKET[0], MARKET[1], -9, MARKET[3]], y: 0, kind: 'open', market: true }, { id: 'market square east', rect: [9, MARKET[1], MARKET[2], MARKET[3]], y: 0, kind: 'open', market: true }] });   // (the way from the north street to the gate kept clear)
  // the boat being built on the yard, on its trestles; the palms in the lanes of the core
  const [yx, yz] = YARD.at, yel = [{ t: 'reed_boat', at: [yx, yz], dir: [0, 1], len: YARD.len, y: 1.0, seed: 77, cargo: 'none' }];
  for (const dz of [-2.4, 0, 2.4]) yel.push({ t: 'block', rect: [yx - 0.5, yz + dz - 0.2, yx + 0.5, yz + dz + 0.2], y0: 0, y1: 0.7, mat: 'palm_trunk' });
  plans.push(base('ur-yard', yel));
  const trees = [];
  for (const h of all) {
    if (trees.length >= 44 || h.lod !== 2 || h.temple || h.chapel || h.seed % 3 !== 0) continue;
    const x = h.rect[2] + 1.0, z = h.rect[3] + 1.0;
    if (inHouse(x, z, 0.8) || inHarbour(x, z) || (Math.abs(x) < 9 && z < -170) || (x > 130 && Math.abs(z + 20) < 9) || Math.hypot(x, z) > RADIUS - 40) continue;
    trees.push({ t: 'ur_palm', at: [x, z], y: 0, h: 7 + (h.seed % 5), seed: h.seed });
  }
  // the empty lots of the core: pens (with their beasts: life.js) and little orchards
  const lots = [];
  for (const { rect: r, k, kind } of usedLots()) {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (kind === 'pen') lots.push({ t: 'ur_pen', rect: r, seed: k });
    else for (const [dx, dz] of [[-0.25, -0.2], [0.25, 0.0], [-0.1, 0.25]]) trees.push({ t: 'ur_palm', at: [cx + dx * (r[2] - r[0]), cz + dz * (r[3] - r[1])], y: 0, h: 6.5 + (k % 4), seed: k + Math.round(3 * dx) });
  }
  plans.push(base('ur-lots', lots));
  plans.push(base('ur-lane-palms', trees));
  plans.push({ ...base('ur-people', figures), style: 'life', center: [-60, -180], near: 320 });
  return plans;
}
