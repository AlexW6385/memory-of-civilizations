// The walker's body and movement, shared by the controls and the walk-through check.

export const EYE = 1.62, RADIUS = 0.3, STEP = 0.5, HEAD = 1.75, LOW = 0.25;
export const WALK = 2.0, RUN = 5.2, GRAVITY = 18;
/** Flight. The height above the ground sets the top vertical speed, the same up and down
 *  (flightSpeeds().vertical: slow near the ground, so that take-off and landing are gentle, fast
 *  high up); held, one rises toward it, let go, one falls toward it, and the acceleration only
 *  smooths the start, reaching the top speed in about VERTICAL_RISE seconds. Cruising holds the
 *  height: the climb or fall dies away and nothing pulls down. The horizontal speeds grow with the
 *  height too, so that the planet can be crossed in minutes. CEILING is the highest the feet may
 *  rise above the open ground. */
export const FLY = 12, FLY_FAST = 24, SINK = 0.8, VERTICAL_RISE = 0.6, CEILING = 1500;
/** How fast the vertical speed dies away on cruising (1/s): the height changes by speed / this. */
export const CRUISE_SETTLE = 4.5;
/** Flight speeds at a height above the ground (m/s): horizontal { fly, fast }, and the top
 *  vertical speed, rising (falling is SINK of it) { vertical }. */
export function flightSpeeds(alt) {
  const a = Math.max(0, alt);
  return { fly: Math.min(120, FLY * 0.75 + a * 0.22), fast: Math.min(240, FLY_FAST * 0.75 + a * 0.45), vertical: Math.min(250, 6 + a * 0.4) };
}

/** The vertical speed aloft after dt (P: vy, lift, cruise; fs from flightSpeeds). */
export function flyVy(P, fs, dt) {
  let vy = P.vy;
  // cruising: the climb or fall dies away quickly, a few metres at most (a quarter of a second's
  // worth of the speed one had: at 1.1 s, a fall begun near the ground slid on to the ground)
  if (P.cruise && !P.lift) return vy * Math.exp(-dt * CRUISE_SETTLE);
  const top = fs.vertical, target = P.lift ? top : -top * SINK;   // falling a little slower than rising
  const acc = Math.max(16, top / VERTICAL_RISE) * dt;          // also slows one to a lower top speed
  return vy < target ? Math.min(target, vy + acc) : Math.max(target, vy - acc);
}

/** Where the feet come to rest at (x, z), reaching no higher than maxY: the ground, a floor, or the
 *  top of something built (a step, a terrace, a low wall) within reach. */
export function footing(C, x, z, maxY) {
  const g = C.groundAt(x, z, maxY);
  // (over the whole body's circle for obstacles, which stop that circle; the top field over the feet)
  return C.topAt ? Math.max(g, C.topAt(x, z, RADIUS, maxY)) : g;
}

/**
 * Move feet {x, y, z, vy} by (dx, dz) metres this frame against the collision world,
 * climbing and descending steps up to STEP, falling otherwise.
 */
export function move(P, dx, dz, dt, C) {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12));
  for (let i = 0; i < n; i++) {
    let nx = P.x + dx / n, nz = P.z + dz / n;
    let g = footing(C, nx, nz, P.y + STEP);
    [nx, nz] = C.resolve(nx, nz, RADIUS, Math.max(g, P.y) + LOW, Math.max(g, P.y) + HEAD);
    g = footing(C, nx, nz, P.y + STEP);
    if (!Number.isFinite(g)) continue;
    // a built surface with no floor of its own (a terrace, a causeway, a plinth, steps) is stepped
    // onto like a floor, but not where it goes on rising steeper than about 50° (a dome, a wall's
    // batter, a roof's slope from its eaves)
    if (g > P.y + 0.02 && g > C.groundAt(nx, nz, P.y + STEP) + 1e-3) {
      const run = Math.hypot(nx - P.x, nz - P.z) || 1, ux = (nx - P.x) / run, uz = (nz - P.z) / run;
      const ax = nx + ux * 0.5, az = nz + uz * 0.5, ahead = C.topAt(ax, az, RADIUS * 0.6, g + 0.75);
      if (ahead - g > 0.6 && C.groundAt(ax, az, g + 0.75) < g + 0.1) continue;   // (a floor or a ramp rising there: a stair)
    }
    // the ponds cannot be waded (but can be flown over, and left by one who lands in them)
    if (C.water && P.y <= g + 0.3 && C.water(nx, nz, g) && !C.water(P.x, P.z, g)) continue;
    // open ground steeper than about 40° cannot be climbed (built steps and ramps can)
    const run = Math.hypot(nx - P.x, nz - P.z);
    if (g - P.y > Math.max(0.02, run * 0.85) && Math.abs(g - C.terrain(nx, nz)) < 1e-6) continue;
    // nor walked into the slope of a roof (unless already caught in one: then out of it)
    if (C.inShell && C.inShell(nx, nz, RADIUS * 0.7, Math.max(g, P.y) + LOW, Math.max(g, P.y) + HEAD, P.y + STEP) && !C.inShell(P.x, P.z, RADIUS * 0.7, P.y + LOW, P.y + HEAD, P.y + STEP)) continue;
    P.x = nx; P.z = nz;
    if (g >= P.y - STEP && P.vy === 0) P.y = g;   // follow steps up and down
    else if (g > P.y) { P.y = g; if (P.vy < 0) P.vy = 0; }   // coming down onto rising ground
  }
  let g = C.groundAt(P.x, P.z, P.y + 0.01);
  if (P.vy > 0 || P.y > g + 1e-3) {
    // in the air: rising (held up by flight) or coming down — onto the ground, a floor, or the top
    // of a wall or a roof
    // (a step up is allowed, so that one walks up a roof's slope rather than sinking into it)
    if (C.topAt) g = Math.max(g, C.topAt(P.x, P.z, RADIUS * 0.6, P.y + (P.vy > 0 ? 0.01 : STEP)));
    if (C.waterLevel) g = Math.max(g, C.waterLevel(P.x, P.z));
    if (P.glide) P.vy = flyVy(P, P.fs || flightSpeeds(P.y - C.terrain(P.x, P.z)), dt);
    else P.vy -= GRAVITY * dt;                          // fell off an edge on foot
    if (P.vy > 0) {
      const top = C.terrain(P.x, P.z) + CEILING, dy = P.vy * dt;
      if (P.y + dy > top || (C.ceilingBetween && C.ceilingBetween(P.x, P.z, RADIUS, P.y + HEAD, P.y + HEAD + dy))) P.vy = 0;
    }
    P.y = Math.max(g, P.y + P.vy * dt);
    if (P.y <= g) P.vy = 0;
  } else if (g > P.y) P.y = g;
  else if (P.lift) P.vy = 1e-3;                       // take off
}
