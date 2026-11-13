// What the street walkers (src/engine/movers.js) owe the visitor, as pure functions (no three.js,
// so that the checks run in Node): nobody appears at the arrival, nobody walks into a visitor who
// stands in the way.

/** No walker is spawned within this many metres of the arrival pose... */
export const ARRIVAL_CLEAR = 6;
/** ...for this many seconds (of the settlement's moving life) after arriving. */
export const ARRIVAL_QUIET = 12;
/** A walker whose path passes within this many metres of the visitor is held back short of it. */
export const VISITOR_CLEAR = 2.5;
/** ...from this far along its way (m), when the visitor is within the lane's reach. */
export const HOLD_REACH = 4.5;

/**
 * May a walker be spawned at (x, z)? `arr` is { x, z, until } (the arrival pose, and the time of
 * the moving life until which it holds), or null; `t` the moving life's time.
 */
export function spawnAllowed(arr, t, x, z) {
  if (!arr || t >= arr.until) return true;
  return Math.hypot(x - arr.x, z - arr.z) >= ARRIVAL_CLEAR;
}

/** Is a walker at (x, z) within the arrival's clear circle (to be let go of when one arrives)? */
export function inArrivalCircle(x, z, ax, az) { return Math.hypot(x - ax, z - az) < ARRIVAL_CLEAR; }

/**
 * The walker's wanted speed `vT` (m/s) kept short of a visitor in its path. The walker at (wx, wz)
 * heads `yaw` (0 looks along -z, as everywhere here); the visitor's eye is at (cx, cy, cz) and the walker's
 * head at height wy + 1.6. A visitor off to the side (beyond VISITOR_CLEAR across the path), behind, on
 * another level or farther than HOLD_REACH ahead changes nothing; otherwise the walker slows to stop
 * VISITOR_CLEAR short of the visitor (and stays stopped while the visitor stands there: the walker's own stuck
 * rule turns it round after a few seconds).
 */
export function holdBack(vT, wx, wz, wy, yaw, cx, cy, cz) {
  if (Math.abs(cy - (wy + 1.6)) > 2.2) return vT;
  const hx = -Math.sin(yaw), hz = -Math.cos(yaw), dx = cx - wx, dz = cz - wz;
  const fwd = dx * hx + dz * hz, lat = Math.abs(dx * -hz + dz * hx);
  if (fwd <= 0 || fwd >= HOLD_REACH || lat >= VISITOR_CLEAR) return vT;
  return Math.min(vT, Math.max(0, fwd - VISITOR_CLEAR) * 0.8);
}
