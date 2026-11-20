// The visitor's walk in Thebes (docs/settlements/thebes.md §15a): from the arrival on the avenue at the quay's end, the ways a visitor takes, and the
// routes into the places they pass (`plan.walks`, walked by tools/walk-check.mjs). Pure data and helpers (no three.js): the polylines
// the walk-check, the placing of street furniture and the sound map read. World frame: +x east, +z south.
import { lots, ARRIVAL, STREET_ZS } from './layout.js';
import { doorPoint } from '../../styles/newkingdom/doorsite.js';

/** The main walks as polylines in world x, z. A: up the avenue to the gateway and the forecourt; B: to the first streets, up the lane and east along the street of shops; C: south through the market to the quay's stair. */
export const WALKS = {
  avenue: [ARRIVAL, [-200, 0], [-172, 0], [-150, 0], [-114, 0]],
  streets: [ARRIVAL, [-218, -8], [-207, -12], [-207, -30], [-207, -44], [-190, -44], [-182, -44]],
  market: [ARRIVAL, [-232, 12], [-232, 24], [-232, 52], [-248, 70]],
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

/** Waypoints into a lot from its street, in the lot's own frame (u from rect[0], v into the lot): { pts: [[u, v]], ... } per kind. */
function inside(l, door) {
  const W = l.rect[2] - l.rect[0], D = l.rect[3] - l.rect[1], u = door.x - l.rect[0];
  if (l.kind === 'row') return [[u, -2.6], [u, 1.2], [W / 2, 2.2], [W / 2, 4.3]];
  if (l.kind === 'court') { const cv = 5.5; return [[u, -2.6], [u, 1.6], [W / 2 - 0.5, cv - 1.2], [W / 2 - 0.5, cv + 0.9]]; }
  if (l.kind === 'villa') return [[W / 2, -2.6], [W / 2, 1.0], [W / 2 + 3.3, 3.2], [W / 2 + 1.6, 6.2 + 0.2], [W / 2 + 0.6, 6.2 + 2.2]];
  if (l.kind === 'workshop') return [[W / 2, -2.6], [W / 2, 3.0]];
  void D;
  return null;
}
const frameToWorld = (l, p) => { const sg = l.front === 's' ? -1 : 1, zs = l.front === 's' ? l.rect[3] : l.rect[1]; return [l.rect[0] + p[0], zs + sg * p[1]]; };

/** The opened places nearest the walks (the lots with a door the walker can use), nearest first. */
export function walkLots(n = 14) {
  return lots().filter((l) => l.open && doorPoint(l) && walkDist(...[(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2]) < 60)
    .sort((a, b) => walkDist((a.rect[0] + a.rect[2]) / 2, (a.rect[1] + a.rect[3]) / 2) - walkDist((b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2)).slice(0, n);
}

/** The routes walk-check follows, in the landmark plan's local frame (the plan turned 90 degrees: local (x, z) = (world z, -world x)); from the street into n places. */
export function walkRoutes(n = 12) {
  const loc = ([x, z]) => [z, -x], out = [];
  for (const l of walkLots(n)) {
    const door = doorPoint(l), pts = inside(l, door);
    if (!pts) continue;
    const r = pts.map((p) => loc(frameToWorld(l, p)));
    r.y0 = 0;
    out.push(r);
  }
  return out;
}
void STREET_ZS;
