// Where one arrives, and which way one looks: a free place to stand near a building with a clear
// view of it (not too far, not facing a wall), or, in the open, the direction with the widest view.
// Pure: works on a collision world (src/core/collide.js); shared by the site and its tests.

const EYE = 1.62;

/** The height to stand at (x, z), or null where one cannot stand: water, a wall in the body, something built overhead. */
export function standAt(C, x, z, r = 0.4) {
  const g = Math.max(C.groundAt(x, z, 1e4), C.waterLevel?.(x, z) ?? -Infinity);
  if (!Number.isFinite(g) || C.water?.(x, z, g)) return null;
  if (C.topAt(x, z, r, 1e4) > g + 0.3) return null;
  if (C.blockedAt(x, z, r, g + 0.2, g + 1.9)) return null;
  return g;
}

/** Is the straight line from a to b (both [x, y, z]) clear of obstacles and built surfaces, up to a share `upTo` of its length? */
export function clearLine(C, a, b, upTo = 1, trees = null) {
  const L = Math.hypot(b[0] - a[0], b[2] - a[2]), n = Math.max(2, Math.ceil(L / 0.6));
  // trees in the way (their crowns hide what is behind them at eye height)
  if (trees) for (const t of trees) {
    const vx = b[0] - a[0], vz = b[2] - a[2], l2 = vx * vx + vz * vz || 1;
    const s = ((t.x - a[0]) * vx + (t.z - a[2]) * vz) / l2;
    if (s < 0.04 || s > upTo) continue;
    if (Math.hypot(a[0] + vx * s - t.x, a[2] + vz * s - t.z) < t.r * 0.8) return false;
  }
  for (let i = 1; i <= n * upTo; i++) {
    const t = i / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, z = a[2] + (b[2] - a[2]) * t;
    if (C.blockedAt(x, z, 0.12, y - 0.15, y + 0.15)) return false;
    // under a roof (a built surface above the line, well above the ground): through a building
    const top = C.topAt(x, z, 0.05, 1e4);
    if (top > y + 0.3 && top - C.terrain(x, z) > 2.5) return false;
    if (C.terrain(x, z) > y) return false;
  }
  return true;
}

/**
 * A place to stand in view of a building: core [x0, z0, x1, z1] (its main body, world coordinates),
 * top (its height), front [dx, dz] (the side to prefer). Tries rings round the core, nearest first;
 * scores the clear line of sight to the building's middle, the front, and the distance. Returns
 * { x, y, z, yaw, pitch } (yaw from −z, as the controls take it) or null.
 */
export function viewpoint(C, core, top, front, trees = null) {
  const [x0, z0, x1, z1] = core, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
  const span = Math.max(hx, hz);
  // far enough back to see the whole building (its height and some of its breadth in view),
  // trying nearer and farther rings when that one has no free place with a clear view
  const ground = C.terrain(cx, cz), tall = Math.max(4, top - ground);
  const pref = Math.max(12, Math.min(70, Math.max(tall * 0.95, span * 0.45)));
  let best = null;
  for (const extra of [pref, pref * 1.3, pref * 0.75, pref * 1.7, pref * 0.5, pref * 2.2].map((e) => Math.max(6, e))) {
    for (let k = 0; k < 24; k++) {
      const a = k / 24 * Math.PI * 2, dx = Math.sin(a), dz = -Math.cos(a);
      // a point `extra` metres out from the core's edge in this direction
      const s = Math.min(hx / Math.max(1e-6, Math.abs(dx)), hz / Math.max(1e-6, Math.abs(dz)));
      const x = cx + dx * (s + extra), z = cz + dz * (s + extra);
      const g = standAt(C, x, z);
      if (g === null) continue;
      // lines from the eye to the building at about its doors' height — the middle and either side
      // of its front — must be clear up to its edge (the middle and one side): nothing in the way, no wall
      const eye = [x, g + EYE, z], dist = Math.hypot(cx - x, cz - z), edge = Math.max(0.02, (s * 1.02) / dist);
      const ty = Math.max(g + EYE, C.terrain(cx, cz) + 2.5), px = -dz, pz = dx, w = Math.min(hx * Math.abs(pz) + hz * Math.abs(px), 30) * 0.4;
      const upTo = Math.min(0.98, 1 - edge);
      if (!clearLine(C, eye, [cx, ty, cz], upTo, trees)) continue;
      const sides = [[cx + px * w, ty, cz + pz * w], [cx - px * w, ty, cz - pz * w]].filter((t) => clearLine(C, eye, t, upTo, trees)).length;
      if (sides < 1) continue;
      const facing = front ? (dx * front[0] + dz * front[1]) : 0;
      const score = facing * 1.2 - Math.abs(extra - pref) / pref + (C.blockedAt(x, z, 2.5, g + 0.3, g + 2) ? -0.5 : 0);
      if (!best || score > best.score) {
        const yaw = Math.atan2(-(cx - x), -(cz - z));
        // look up so that the building fills the view: at about a third of its height
        const pitch = Math.max(-0.05, Math.min(0.45, Math.atan2(Math.min(top - g, span * 1.2) * 0.38 - EYE, dist)));
        best = { x, y: g, z, yaw, pitch, score };
      }
    }
    if (best && best.score > -0.2) break;              // a good place at this distance: no need to go farther
  }
  return best;
}

/** The direction (yaw) with the longest free view at eye height from (x, y, z), leaning toward `prefer` (a yaw) when given. */
export function openYaw(C, x, y, z, prefer = null) {
  let best = 0, bs = -Infinity;
  for (let k = 0; k < 24; k++) {
    const yaw = k / 24 * Math.PI * 2, dx = -Math.sin(yaw), dz = -Math.cos(yaw);
    let d = 0;
    for (; d < 60; d += 1) {
      const px = x + dx * d, pz = z + dz * d, ey = y + EYE;
      if (C.blockedAt(px, pz, 0.15, ey - 0.4, ey + 0.4) || C.terrain(px, pz) > ey) break;
    }
    const score = d + (prefer === null ? 0 : 12 * Math.cos(yaw - prefer));
    if (score > bs) { bs = score; best = yaw; }
  }
  return best;
}
