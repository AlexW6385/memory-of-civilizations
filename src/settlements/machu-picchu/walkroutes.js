// Machu Picchu — the places opened on the visitor's walk and the routes walk-check follows into them (docs/settlements/machu-picchu.md §13).
// A pure function of the layout and walk.js: town.js and plan.js open the places, plan.walks carries the routes.
import { KALLANKA, STORES, HUT, kanchas, houses } from './layout.js';
import { ground } from './ground.js';
import { WALK_REACH, walkDistance, ARRIVAL } from './walk.js';

/** Houses outside the kanchas that the visitor may enter: [rect, front, kind]. */
export const SPECIAL = [
  [[-46, -34, -36, -26], 'n', 'priest'],
  [[-52, -4, -42, 8], 'e', 'noble'],
  [[-56, 34, -46, 46], 'e', 'noble'],
  [HUT, 'w', 'chaski'],
  ...STORES.map((r) => [r, 'n', 'qollqa']),
];
const OUT = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] };
/** The middle of a house's front wall and the way out from it. */
export function doorOf(rect, front) {
  const [x0, z0, x1, z1] = rect, o = OUT[front], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const edge = front === 'e' ? [x1, cz] : front === 'w' ? [x0, cz] : front === 'n' ? [cx, z0] : [cx, z1];
  return { edge, out: o };
}
/** The kanchas whose gate lies within WALK_REACH of the walk: index → true. */
export function openKanchas() {
  const out = new Set();
  kanchas().forEach((K, i) => {
    const r = K.rect, gateE = K.inward[0] < 0, gx = gateE ? r[2] : r[0], gz = (r[1] + r[3]) / 2;
    if (walkDistance([gx, gz]) < WALK_REACH) out.add(i);
  });
  return out;
}
/** Is this house (by its place in houses()) one of an opened kancha's? The kanchas' houses come three by three, first. */
export function openHouse(i) { return i < kanchas().length * 3 && openKanchas().has(Math.floor(i / 3)); }
const at = (r, f, d) => { const { edge, out } = doorOf(r, f); return [edge[0] + out[0] * d, edge[1] + out[1] * d]; };
const withY = (pts) => { const w = pts.map(([x, z]) => [x, z]); w.y0 = ground.height(pts[0][0], pts[0][1]); return w; };

/** Routes into every opened place: [{ id, route }] (route.y0 set), the first of them the walk from the arrival. */
export function walkRoutes() {
  const out = [];
  out.push({ id: 'arrival', route: withY([ARRIVAL, [-24, 127], [-24, 104], [2, 104], [2, 84], [2, 20]]) });
  // the kanchas: from the lane out of the gate, up its stair, through the gateway, across the patio to each house's door and a little in
  const H = houses();
  for (const i of openKanchas()) {
    const K = kanchas()[i], r = K.rect, gateE = K.inward[0] < 0, gx = gateE ? r[2] : r[0], gz = (r[1] + r[3]) / 2, ox = gateE ? 1 : -1;
    const lane = [gx + ox * 3.0, gz], gate = [gx - ox * 0.1, gz], pat = K.at(K.A / 2, 3.2);
    for (let k = 0; k < 3; k++) {
      const h = H[i * 3 + k], d = doorOf(h.rect, h.front), o = d.out;
      const pre = [d.edge[0] + o[0] * 2.4, d.edge[1] + o[1] * 2.4], inn = [d.edge[0] - o[0] * 2.0, d.edge[1] - o[1] * 2.0];
      const mid = k === 0 ? [pat[0], pre[1]] : [pre[0], pat[1]];
      out.push({ id: `kancha-${i}-${k}`, route: withY([lane, gate, pat, mid, pre, d.edge, inn]) });
    }
  }
  for (const [r, f, kind] of SPECIAL) {
    const d = doorOf(r, f), o = d.out;
    out.push({ id: kind + '-' + Math.round(r[0]) + '-' + Math.round(r[1]), route: withY([[d.edge[0] + o[0] * 3, d.edge[1] + o[1] * 3], d.edge, [d.edge[0] - o[0] * 1.8, d.edge[1] - o[1] * 1.8]]) });
  }
  // the kallanka: in at its first, middle and last door
  { const L = KALLANKA[3] - KALLANKA[1];
    for (const i of [0, 3, 6]) { const z = KALLANKA[3] - (i + 0.5) * L / 7; out.push({ id: 'kallanka-' + i, route: withY([[KALLANKA[0] - 1.1, z], [KALLANKA[0], z], [KALLANKA[0] + 2.6, z]]) }); } }
  return out;
}
export { at as pointOut };
