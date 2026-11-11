// The town round the palace (docs/settlements/knossos.md §5, §5a): two- and three-storey flat-roofed houses after the
// Town Mosaic in rows with party walls along paved lanes, each turned with its door to its lane; some open to the visitor and
// furnished; the walled yards behind the shorter houses; the Royal Road paved from the west to the theatral area. The houses,
// lanes and yards are cut into 100 m tiles in two levels of detail (src/settlements/lod.js).
import { RADIUS, ROAD, LANE, lots, lanes, yards, height } from './layout.js';
import { YARD, lifePlan } from './life.js';
import { lodTiles } from '../lod.js';

const ENTRANCE = { at: [-100, 0], facing: 'e' };
const base = (id, elements) => ({ id, style: 'minoan', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: ENTRANCE });
function road() {
  const pts = [];
  for (let x = ROAD.x0 + 12; x <= ROAD.x1 + 0.01; x += 4) pts.push([x, height(x, ROAD.z), ROAD.z]);
  return base('knossos-royal-road', [{ t: 'royal_road', pts, w: ROAD.w }]);
}
const low = (r) => Math.min(height(r[0], r[1]), height(r[2], r[1]), height(r[0], r[3]), height(r[2], r[3]));
/** The houses that can be entered: near the palace on the flat ground, wide and deep enough; their kinds by the lot's seed. */
export function openHouses() {
  const m = new Map(), kinds = ['home', 'home', 'weaver', 'shop', 'shop', 'store', 'home', 'weaver'];
  const ok = lots().filter((l) => l.rect[0] > -150 && l.rect[2] < 62 && l.r < 135 && l.rect[2] - l.rect[0] >= 6.3 && l.rect[3] - l.rect[1] >= 10.5 && l.seed % 3 === 0);
  for (const l of ok.slice(0, 44)) m.set(l, kinds[l.seed % kinds.length]);
  return m;
}
export const laneEls = () => {
  const E = [];
  for (const L of lanes()) {
    if (Math.abs(L.z) > RADIUS - 40) continue;
    for (let a = L.x0 - 0.8; a < L.x1 + 0.8; a += 40) {
      const b = Math.min(L.x1 + 0.8, a + 40), pts = [];
      for (let x = a; x < b + 0.01; x += 5) pts.push([x, height(x, L.z), L.z]);
      if (b - pts[pts.length - 1][0] > 0.5) pts.push([b, height(b, L.z), L.z]);
      if (pts.length > 1 && Math.hypot(a, L.z) < 270) E.push({ t: 'lane_paving', pts, w: LANE.w, at: [(a + b) / 2, L.z] });
    }
  }
  return E;
};
export async function town() {
  const open = openHouses(), els = [];
  for (const l of lots()) els.push({ t: 'dwelling', y: low(l.rect), front: l.front, rect: l.rect, seed: l.seed, alW: l.alW, alE: l.alE, ...(open.has(l) ? { enter: true, kind: open.get(l) } : {}) });
  els.push(...laneEls());
  for (const y of yards()) { const c = [(y.rect[0] + y.rect[2]) / 2, (y.rect[1] + y.rect[3]) / 2]; els.push({ t: 'yard_garden', rect: y.rect, y: height(c[0], c[1]), seed: y.seed, at: c }); }
  const tiles = lodTiles('knossos-town', 'minoan', els, { near: 110, R: RADIUS, entrance: ENTRANCE });
  // the potter's yard by the Royal Road (§10), on the ground of its highest corner
  const yy = Math.max(...[[YARD[0], YARD[1]], [YARD[2], YARD[3]], [YARD[0], YARD[3]], [YARD[2], YARD[1]]].map(([x, z]) => height(x, z)));
  return [...tiles, road(), base('knossos-potter', [{ t: 'potter_yard', rect: YARD, y: yy, seed: 7 }]), lifePlan()];
}
