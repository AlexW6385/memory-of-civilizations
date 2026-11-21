// Ayutthaya about 1687 — the routes walk-check follows into the opened places of the visitor's walk (docs §13.1) and the street furniture along it: pure functions
// of the layout. A shop is entered by the gap beside its counter; a house on posts by its stair, across the terrace and through its door (the style's own draws).
import { lots, kitchenOf } from './layout.js';
import { WALK, frontPoint, walkDistance } from './walk.js';
import { frame } from '../../styles/khmer/village.js';
import { rng } from '../../styles/siamese/houses.js';
import { shopGap, hashAt } from './walkwork.js';

/** [{ l, kind, route: [[x, z], …], y0 }]: one route into every opened lot on the walk (shops by their gap, houses by their stair). */
export function walkRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!l.walk) continue;
    const { W, hF, hS } = frame(l.rect, l.front);
    if (l.kind === 'shop') {
      const { ug } = shopGap(l, hS);
      out.push({ l, kind: 'shop', route: [W(ug, hF + 1.5), W(ug, hF + 0.6), W(ug, hF - 0.2), W(ug, hF - 1.5)], y0: 0 });
    } else if (l.kind !== 'small') {
      const r = rng(l.seed || 1), up = 1.9 + r() * 0.6; r(); r();
      const door = (r() < 0.5 ? -1 : 1) * hS * 0.38, td = l.kind === 'big' ? 2.3 : 1.6, vb = hF - td, n = Math.ceil(up / 0.3);
      out.push({ l, kind: 'house', route: [W(0, hF + 0.02 + 0.34 * n + 0.5), W(0, hF + 0.3), W(0, hF - 0.25), W(door, vb + 0.6), W(door, vb - 0.9)], y0: 0 });
    }
  }
  return out;
}
/** The street furniture of the walk: water jars set out on the bank road's edge, the seller's mats beside it, the spirit house at the bridge head. */
export function gearElements() {
  const E = [], bank = -71.7;
  for (const x of [-48, -14, 22, 52, 82]) E.push({ t: 'ay_gear', kind: 'angnam', at: [x + 0.5 * hashAt(x, 1), bank], rot: hashAt(x, 2) * 6.28 });
  for (const x of [-30, 5, 40, 70]) E.push({ t: 'ay_gear', kind: 'mat', at: [x + 3 * hashAt(x, 3), bank - 0.05], rot: Math.PI * 1.0 + (hashAt(x, 4) - 0.5) * 0.3 });
  void kitchenOf; void walkDistance; void frontPoint; void WALK;
  return E;
}
