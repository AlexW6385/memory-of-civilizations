// Parsa on the plain (docs/settlements/persepolis.md §5, §16): flat-roofed mudbrick houses round small courts, shops under reed awnings,
// walkable houses, the streets' stone-lined water, garden plots, the street life.
import { RADIUS, MARKET, WORKSHOPS, ROAD, STREETS, lots, gardens } from './layout.js';
import { people } from './people.js';
import { street } from './street.js';
import { houseRoom } from '../../styles/achaemenid/town.js';
const base = (id, elements) => ({ id, style: 'achaemenid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-200, -140], facing: 'e' } });

/** The channels of the streets and the road: runs of stone-lined water cut at every crossing. */
function channels() {
  const E = [], ys = [-140], xs = [-352, -306, -250, -190], zs = [-40, 60, 150, 240], R = RADIUS - 24;
  const runs = (lo, hi, cuts, gap) => {
    const c = cuts.filter((v) => v > lo && v < hi).sort((a, b) => a - b), out = []; let s = lo;
    for (const v of c) { out.push([s, v - gap]); s = v + gap; }
    out.push([s, hi]); return out.filter(([a, b]) => b - a > 3);
  };
  for (const x of xs) for (const [a, b] of runs(-330, 336, [...ys, ...zs], 3.6)) if (Math.hypot(x, a) < R && Math.hypot(x, b) < R) E.push({ t: 'street_channel', a: [x, a], b: [x, b], w: 0.4 });
  for (const z of zs) for (const [a, b] of runs(-380, -175, xs, 3.6)) if (Math.hypot(a, z) < R) E.push({ t: 'street_channel', a: [a, z], b: [b, z], w: 0.4 });
  for (const z of [ROAD[1] + 0.9, ROAD[3] - 0.9]) for (const [a, b] of runs(-396, -152, xs, 3.6)) E.push({ t: 'street_channel', a: [a, z], b: [b, z], w: 0.5 });
  // stone slabs: the apron before the workshops' gate, the market's aisle and the plaza round its well
  const xc = (WORKSHOPS[0] + WORKSHOPS[2]) / 2, cx = (MARKET[0] + MARKET[2]) / 2, cz = (MARKET[1] + MARKET[3]) / 2;
  E.push({ t: 'flag_apron', rect: [xc - 4.5, ROAD[3], xc + 4.5, WORKSHOPS[1]], y: 0 });
  E.push({ t: 'flag_apron', rect: [MARKET[0] + 2, cz - 2, MARKET[2] - 2, cz + 2], y: 0 });
  E.push({ t: 'flag_apron', rect: [cx - 4, cz - 4, cx + 4, cz + 4], y: 0.01 });
  void STREETS;
  return E;
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) {
    const part = all.slice(i, i + 160), p = base(`persepolis-houses-${i / 160}`, part.map((l) => ({ t: 'persian_house', ...l })));
    p.rooms = part.map((l, k) => { const r = houseRoom(l); return r && { id: `house-${i + k}`, rect: r, y: 0.08, kind: 'hall' }; }).filter(Boolean);
    plans.push(p);
  }
  plans.push(base('persepolis-streets', [...channels(), ...gardens().map((g) => ({ t: 'garden_plot', ...g }))]));
  plans.push({ ...base('persepolis-workshops', [{ t: 'royal_workshops', rect: WORKSHOPS, y: 0 }]), rooms: [{ id: 'workshops', rect: [WORKSHOPS[0] + 2.2, WORKSHOPS[3] - 23.1, WORKSHOPS[2] - 2.2, WORKSHOPS[3] - 1.1], y: 0.12, kind: 'hall' }] });
  plans.push({ ...base('persepolis-people', people().figures), style: 'life', center: [-60, -125], near: 320 });
  plans.push({ ...base('persepolis-street-life', street().figures), style: 'life', center: [-230, -60], near: 260 });
  plans.push(base('persepolis-market', []));
  plans[plans.length - 1].rooms = [{ id: 'market', rect: MARKET, y: 0, kind: 'open', market: true }];
  return plans;
}
