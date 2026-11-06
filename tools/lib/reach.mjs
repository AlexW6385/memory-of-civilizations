// The walkable area reached from a point, flood-filled over a grid with the walker's own rules
// (src/core/walk.js: move and footing) — for tools/plan-check.mjs and its tests.

import { footing, RADIUS as R, STEP, LOW, HEAD } from '../../src/core/walk.js';

/**
 * Flood fill of the collision world cw over an n × n grid of cells C metres wide from (X0, Z0),
 * starting at start [x, y | undefined (the ground), z]. Each step is one of the walker's, from a
 * cell at a height into a neighbour. Returns { first: the first height reached in each cell (NaN:
 * none), extra: Map cell → more heights (storeys), reach: the number of cell heights reached,
 * started: whether the start itself is walkable }.
 */
export function flood(cw, { X0, Z0, n, C, start }) {
  const first = new Float32Array(n * n).fill(NaN), extra = new Map();
  const cx = (i) => X0 + (i + 0.5) * C, cz = (j) => Z0 + (j + 0.5) * C;
  const stack = [];
  const has = (k, h) => (first[k] === first[k] && Math.abs(first[k] - h) < 0.3) || (extra.get(k)?.some((y) => Math.abs(y - h) < 0.3) ?? false);
  // one step of the walker (src/core/walk.js, move) from cell (pi, pj) at height fromY into cell (i, j)
  const visit = (i, j, fromY, fromWet, pi, pj) => {
    if (i < 0 || j < 0 || i >= n || j >= n) return;
    const x = cx(i), z = cz(j), k = j * n + i;
    // where the feet come to rest: the ground, a floor, or a built top (a step, a terrace, a low
    // block, a roof, a wall) within a step — the walker's own footing
    const s = footing(cw, x, z, fromY + STEP);
    if (!Number.isFinite(s)) return;
    if (has(k, s)) return;
    const g = cw.groundAt(x, z, fromY + STEP);
    // a built top with no floor of its own is stepped onto, but not where it goes on rising steeper
    // than about 50° (a dome, a batter, a roof from its eaves) — unless a floor or a ramp rises there
    if (pi !== undefined && s > fromY + 0.02 && s > g + 1e-3) {
      const ax = x + (i - pi) * 0.5, az = z + (j - pj) * 0.5;
      const ahead = cw.topAt(ax, az, R * 0.6, s + 0.75);
      if (ahead - s > 0.6 && cw.groundAt(ax, az, s + 0.75) < s + 0.1) return;
    }
    // the ponds cannot be waded (but can be left by one who lands in them)
    if (fromY <= s + 0.3 && cw.water(x, z, s) && !fromWet) return;
    // open ground steeper than about 40° cannot be climbed (built steps and ramps can)
    if (s - fromY > Math.max(0.02, C * 0.85) && Math.abs(s - cw.terrain(x, z)) < 1e-6) return;
    // the body (at the higher of where it was and where it comes to rest) is not in an obstacle
    const b = Math.max(s, fromY);
    if (cw.blockedAt(x, z, R, b + LOW, b + HEAD)) return;
    // nor walked into the slope of a roof (unless already caught in one: then out of it)
    if (cw.inShell?.(x, z, R * 0.7, b + LOW, b + HEAD, fromY + STEP) && !(pi !== undefined && cw.inShell(cx(pi), cz(pj), R * 0.7, fromY + LOW, fromY + HEAD, fromY + STEP))) return;
    if (first[k] !== first[k]) first[k] = s; else (extra.get(k) || extra.set(k, []).get(k)).push(s);
    stack.push(i, j, s);
  };
  const [ax, ay, az] = start;
  const ai = Math.floor((ax - X0) / C), aj = Math.floor((az - Z0) / C);
  const startY = ay ?? cw.terrain(ax, az);
  visit(ai, aj, startY + 0.05, cw.water(ax, az, startY));
  const started = stack.length > 0;
  while (stack.length) {
    const s = stack.pop(), j = stack.pop(), i = stack.pop();
    const wet = cw.water(cx(i), cz(j), s);
    visit(i + 1, j, s, wet, i, j); visit(i - 1, j, s, wet, i, j); visit(i, j + 1, s, wet, i, j); visit(i, j - 1, s, wet, i, j);
  }
  let reach = 0;
  for (let k = 0; k < first.length; k++) if (first[k] === first[k]) reach++;
  for (const L of extra.values()) reach += L.length;
  return { first, extra, reach, started };
}
