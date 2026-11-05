// The walker's body and movement, shared by the controls and the walk-through check.

export const EYE = 1.62, RADIUS = 0.3, STEP = 0.5, HEAD = 1.75, LOW = 0.25;
export const WALK = 2.6, RUN = 6.5, GRAVITY = 18;
/** Flight. The height above the ground sets the top vertical speed, the same up and down
 *  (flightSpeeds().vertical: slow near the ground, so that take-off and landing are gentle, fast
 *  high up); held, one rises toward it, let go, one falls toward it, and the acceleration only
 *  smooths the start, reaching the top speed in about VERTICAL_RISE seconds. Cruising holds the
 *  height: the climb or fall dies away and nothing pulls down. The horizontal speeds grow with the
 *  height too, so that the planet can be crossed in minutes. CEILING is the highest the feet may
 *  rise above the open ground. */
export const FLY = 9, FLY_FAST = 18, VERTICAL_RISE = 0.6, CEILING = 1500;
/** Flight speeds at a height above the ground (m/s): horizontal { fly, fast }, and the top
 *  vertical speed, rising or falling { vertical }. */
export function flightSpeeds(alt) {
  const a = Math.max(0, alt);
  return { fly: Math.min(110, FLY + a * 0.2), fast: Math.min(200, FLY_FAST + a * 0.4), vertical: Math.min(250, 6 + a * 0.4) };
}

/** The vertical speed aloft after dt (P: vy, lift, cruise; fs from flightSpeeds). */
export function flyVy(P, fs, dt) {
  let vy = P.vy;
  if (P.cruise && !P.lift) return vy * Math.exp(-dt * 0.9);   // the climb or fall dies away
  const top = fs.vertical, target = P.lift ? top : -top;
  const acc = Math.max(16, top / VERTICAL_RISE) * dt;          // also slows one to a lower top speed
  return vy < target ? Math.min(target, vy + acc) : Math.max(target, vy - acc);
}

/**
 * Move feet {x, y, z, vy} by (dx, dz) metres this frame against the collision world,
 * climbing and descending steps up to STEP, falling otherwise.
 */
export function move(P, dx, dz, dt, C) {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12));
  for (let i = 0; i < n; i++) {
    let nx = P.x + dx / n, nz = P.z + dz / n;
    let g = C.groundAt(nx, nz, P.y + STEP);
    [nx, nz] = C.resolve(nx, nz, RADIUS, Math.max(g, P.y) + LOW, Math.max(g, P.y) + HEAD);
    g = C.groundAt(nx, nz, P.y + STEP);
    if (!Number.isFinite(g)) continue;
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
