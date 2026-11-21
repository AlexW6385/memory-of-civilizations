// The town round the temenos (docs/settlements/ur.md §5): courtyard houses of plastered mud brick, three of them
// open and furnished on the market square before the north gate (§5.1); the square itself (a market: the
// generic life pass sets out its stalls) and the life of the streets and the quay (§5.2).
import { RADIUS, MARKET, HARBOUR, YARD, MAUS, BRICKYARD, RAMP, rampartArcs, houses, inHouse, inHarbour, usedLots } from './layout.js';
import { urLife } from './life.js';
import './trim.js';
import { doorClear } from './openwalk.js';
const base = (id, elements) => ({ id, style: 'ur-g', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -110], facing: 's' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`ur-houses-${i / 150}`, all.slice(i, i + 150).flatMap((h) => [{ t: h.chapel ? 'ur_chapel' : 'ur_house', ...h }, ...(h.open ? [{ t: 'door_clear', rect: doorClear(h) }] : [])])));   // (door_clear: the lane before a door, kept clear of the street life)
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
  // the night: the lamp over the door of each house that can be entered and the pool it throws on the lane (nightlight.js)
  // the wear of use and weather: the stair's polished lane, the thresholds, the dust at the doors, the quay's damp band (wear.js)
  plans.push(base('ur-wear', [{ t: 'ur_wear', doors: all.filter((h) => h.open).map((h) => ({ rect: h.rect, door: h.door })) }]));
  plans.push(base('ur-night', [{ t: 'ur_night', doors: all.filter((h) => h.open).map((h) => ({ rect: h.rect, door: h.door })) }]));
  plans.push(base('ur-lane-palms', trees));
  // the city rampart with its three gates (§5.10), the brickyard at the north-east edge (§5.9), the royal mausoleum outside the temenos (§5.11)
  const [N, E, S] = [[-14, -374, 14, -360], [360, -34, 374, -6], [-14, 360, 14, 374]];
  plans.push(base('ur-rampart', [{ t: 'rampart', r: RAMP.r, arcs: rampartArcs() }, { t: 'gate_tower', rect: N, door: 'n', w: 5, h: 10.5, dh: 5.2 }, { t: 'gate_tower', rect: E, door: 'e', w: 5, h: 10.5, dh: 5.2 }, { t: 'gate_tower', rect: S, door: 's', w: 5, h: 10.5, dh: 5.2 }]));
  plans.push(base('ur-brickyard', [{ t: 'brickyard', rect: BRICKYARD, seed: 2112 }]));
  // (the palms in the mausoleum's court, in the brick pits on the made ground, 3.3 m up)
  const maus = [{ t: 'ur_mausoleum', rect: MAUS, seed: 2094 }];
  for (const [u, v, k] of [[5, 20.5, 1], [55, 20.5, 2], [5, 44, 3], [55, 44, 4], [8, 8, 5], [52, 8, 6]]) maus.push({ t: 'ur_palm', at: [MAUS[0] + u, MAUS[1] + v], y: 3.32, h: 7.5 + (k % 3), seed: 300 + k });
  plans.push(base('ur-mausoleum', maus));
  plans.push({ ...base('ur-people', figures), style: 'life', center: [-60, -180], near: 320 });
  return plans;
}
