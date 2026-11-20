// The shops behind the Mese's porticoes and the forecourt's, as pure data (no three.js): which shop of which stoa has which trade (the same choice that
// interiors.js furnishes), and where each room lies. The styles' own `shopFrame` (src/styles/byzantine/interiors.js) makes the same frame; the test
// (tests/constantinople-sound.test.mjs) holds the two together. Read by interiors.js, the sound map, the walk's routes and the night's lamps.
import { MESE_STOAS } from './stoas.js';
import { height } from './layout.js';

/** The trades of the shops (the style's TRADES, kept equal by the test). */
export const TRADES = ['grocer', 'cloth', 'potter', 'silver', 'cook', 'painter'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The furnished shops: { st (the stoa, with its y and depth), k, ns, trade, seed }, in the order interiors.js has always made them. */
export function shopsOf() {
  const out = [], rand = rng(5602);
  for (const st0 of MESE_STOAS) {
    if (!st0.shops) continue;
    const st = { ...st0, y: height(...st0.a), depth: st0.depth ?? 5 }, L = Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]), ns = Math.max(1, Math.round(L / 4.4));
    for (let k = 0; k < ns; k++) if (rand() < 0.93) out.push({ st, k, ns, trade: TRADES[Math.floor(rand() * TRADES.length)], seed: Math.floor(rand() * 1e6) });
  }
  return out;
}

/**
 * The frame of a shop (as the style's shopFrame): W(a, b) the world point of local a (across, positive toward the stoa's far end for side 1) and b (from the door's
 * plane inward; negative toward the street), the width `sw`, the depth of the room (3.8 m) and the floor `y`. `f1` is the door plane's distance from the column line.
 */
export function shopFrame(st, k, ns) {
  const [ax, az] = st.a, [bx, bz] = st.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], side = st.side ?? 1, D = st.depth ?? 5;
  const sw = L / ns, c = (k + 0.5) * sw, f1 = D + 0.6;
  const W = (a, b) => { const s = c + a * side, t = (f1 + b) * side; return [ax + s * u[0] - t * u[1], az + s * u[1] + t * u[0]]; };
  return { W, sw, f1, depth: 3.8, y: (st.y ?? 0) + 0.18, u, side };
}

/** A shop's room as { rect, at (middle), y, door (the doorway's middle, on the door plane), street (a point two metres past the column line) }. */
export function shopRoom(s) {
  const F = shopFrame(s.st, s.k, s.ns), P = [F.W(-F.sw / 2, 0), F.W(F.sw / 2, 0), F.W(-F.sw / 2, F.depth), F.W(F.sw / 2, F.depth)];
  const xs = P.map((p) => p[0]), zs = P.map((p) => p[1]);
  return { rect: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], at: F.W(0, F.depth / 2), y: F.y, door: F.W(0, 0), street: F.W(0, -F.f1 - 2.2), F };
}
/** Every shop's room, with its trade and id. */
export function shopRooms() { return shopsOf().map((s, i) => ({ ...s, ...shopRoom(s), id: `shop:${i}` })); }
