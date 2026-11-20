// The visitor's walk at Giza (docs/settlements/giza.md §19): from the arrival on the plateau the ways a visitor takes — in at the doorway of the
// causeway's head and down the covered causeway to the valley temple, out along the harbour's quay, and on south and west round the Wall of the
// Crow's end and through its tunnel gate into the workers' town — and the routes into the places they pass (bakeries, galleries, houses,
// the works' lodgings), which tools/walk-check.mjs walks (`plan.walks`; the plan's frame is the world's). Pure data and functions (no three.js).
import { town as townLots, CAUSEWAY, CROW_WALL, HARBOUR, furnished } from './layout.js';
import { LODGES } from './lodges.js';
import { ground } from './ground.js';
import { STALLS } from './rations.js';
import { plan as housePlan, BAKERY_DOOR, DOOR } from '../../styles/oldkingdom-giza/walkhouse.js';

export const ARRIVAL = [242, -50];
const CW = (() => { const [ax, az] = CAUSEWAY.a, [bx, bz] = CAUSEWAY.b, at = (x) => [x, az + (bz - az) * (x - ax) / (bx - ax)]; return { p: at(CAUSEWAY.down[0]), q: at(CAUSEWAY.down[1]) }; })();
const GATE_X = CROW_WALL.a[0] + CROW_WALL.gate.at;

/** The main walks, polylines in world x, z. */
export const WALKS = {
  // in at the doorway of the causeway's head, along the covered causeway and down the plateau's edge to the valley temple's west door and into its hall
  causeway: [ARRIVAL, [200, -47], [177, -46.5], [177, -40], [186, -40], CW.p, CW.q, [CAUSEWAY.b[0] - 2, CAUSEWAY.b[1]], [322, 52]],
  // down the plateau's east edge to the harbour, along the quay, the landing at the temple's front, and on south
  quay: [ARRIVAL, [306, -49], [347, 24], [347, 33], [350, 34], [350, 46], [348, 48], [348, 54], [350, 58], [350, 72]],
  // south of the valley temple, west across the valley's slope, round the Wall of the Crow's east end to the town's gate street
  town: [[350, 72], [347, 72], [345, 76], [335, 76], [276, 76], [200, 120], [140, 150], [90, 157], [62, 157], [GATE_X, 161], [GATE_X, 200], [GATE_X, 226]],
  // through the wall's tunnel gate from the quarry's side
  gate: [[GATE_X, 138], [GATE_X, 165]],
};
/** Distance (m) of a point from the nearest of the walks. */
export function walkDist(x, z) {
  let best = Infinity;
  for (const W of Object.values(WALKS)) for (let i = 0; i + 1 < W.length; i++) {
    const a = W[i], b = W[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t));
  }
  return best;
}

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const gateD = (l) => Math.hypot(mid(l.rect)[0] - GATE_X, mid(l.rect)[1] - 200);
/** The ways into the town's places, nearest the gate street first: [{ kind, rect, route: [[x, z]] }]. */
export function placeRoutes() {
  const out = [], L = townLots().slice().sort((a, b) => gateD(a) - gateD(b));
  for (const l of L) {
    const [x0, z0, x1, z1] = l.rect;
    if (l.kind === 'bakery') out.push({ kind: 'bakery', rect: l.rect, route: [[x0 + BAKERY_DOOR, z0 - 2.2], [x0 + BAKERY_DOOR, z0 + 1.6], [x0 + BAKERY_DOOR, z0 + 2.7]] });
    else if (l.kind === 'gallery') { const zc = (z0 + z1) / 2 + 1.0; out.push({ kind: 'gallery', rect: l.rect, route: [[x0 - 3, zc], [x0 + 3, zc], [x0 + 10, zc]] }); }
    else if (l.kind === 'house' && furnished(l)) {
      const P = housePlan(l);
      out.push({ kind: 'house', rect: l.rect, route: P.court ? [[P.xd, z1 + 0.9], [P.xd, z1 - 1.0], [P.split + 0.8, z1 - 1.0], [P.split - 1.3, z1 - 1.0]] : [[P.xd, z1 + 0.9], [P.xd, z1 - 1.0], [P.xd - 1.4, z1 - 1.2]] });
    }
  }
  for (const l of LODGES) {
    if (l.t !== 'ok_lodge') continue;
    const [x0, z0, x1, z1] = l.rect, [cx, cz] = mid(l.rect), D = l.door === 'w' || l.door === 'e' ? x1 - x0 : z1 - z0;
    const d = { w: [-1, 0], e: [1, 0], n: [0, -1], s: [0, 1] }[l.door], door = [l.door === 'w' ? x0 : l.door === 'e' ? x1 : cx, l.door === 'n' ? z0 : l.door === 's' ? z1 : cz];
    out.push({ kind: 'lodge:' + l.kind, rect: l.rect, route: [[door[0] + d[0] * 2.6, door[1] + d[1] * 2.6], [door[0] - d[0] * 0.6, door[1] - d[1] * 0.6], [door[0] - d[0] * Math.min(2.2, D * 0.45), door[1] - d[1] * Math.min(2.2, D * 0.45)]] });
  }
  for (const S of STALLS) {
    const c = Math.cos(S.rot), sn = Math.sin(S.rot), P = (u, v) => [S.at[0] + c * u - sn * v, S.at[1] + sn * u + c * v];
    out.push({ kind: 'stall:' + S.name, rect: [S.at[0] - 2, S.at[1] - 2, S.at[0] + 2, S.at[1] + 2], route: [P(-1.4, 3.2), P(-1.4, 1.6), P(-1.4, 0.95)] });
  }
  return out;
}

/** The floor a route starts on: the ground, or the quay's top where the ground is the harbour's bed. */
const startY = ([x, z]) => (x > HARBOUR[0] - 1 && x < HARBOUR[0] + 6 ? 0.02 : ground.height(x, z));

/** The routes walk-check follows (the plan's frame is the world's): the main walks, and from the street into `n` places of the town (houses, bakeries, galleries) and the lodgings. */
export function walkRoutes(n = { house: 7, bakery: 3, gallery: 2 }) {
  const out = [], count = {};
  for (const W of [WALKS.causeway, WALKS.quay, WALKS.town, WALKS.gate]) { const r = W.map((p) => [...p]); r.y0 = startY(r[0]); out.push(r); }
  for (const p of placeRoutes()) {
    const k = p.kind.startsWith('lodge') ? 'lodge' : p.kind.startsWith('stall') ? 'stall' : p.kind;
    if ((count[k] = (count[k] || 0) + 1) > (n[k] ?? 99)) continue;
    const r = p.route.map((q) => [...q]); r.y0 = startY(r[0]); out.push(r);
  }
  return out;
}
void walkDist; void DOOR;
