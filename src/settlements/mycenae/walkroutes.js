// The routes walk-check follows into the opened lots of the visitor's walk (walk.js): in at the door, along the front room to the counter or the middle of the room. A pure
// function of the layout (plan.js puts them in the citadel's `walks`).
import { lots, lotPoint, GRANARY, GATE_Y } from './layout.js';

/** [{ l, kind, route: [[x, z], …], y0 }] for every opened lot on the walk (one route each), the granary included. */
export function walkRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!l.open && l.kind !== 'granary') continue;
    const dw = l.dw ?? 2.2, du = l.kind === 'granary' ? 5 : l.du, D = l.face === 'n' || l.face === 's' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0], deep = Math.min(D - 2.2, l.kind === 'workshop' || l.kind === 'store' ? 1.6 : 3.2);
    void dw;
    const route = [lotPoint(l, du, -2.4), lotPoint(l, du, 0.3), lotPoint(l, du, 1.0), lotPoint(l, du, deep)];
    out.push({ l, kind: l.kind, route, y0: l.kind === 'granary' ? GATE_Y + 1.0 : l.y - 0.2 });
  }
  void GRANARY;
  return out;
}
