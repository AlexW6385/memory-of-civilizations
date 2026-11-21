// The visitor's main walk (docs/settlements/manueline-lisbon.md §14): from the arrival across the plaza of the Jerónimos, out of its
// east end by the lane between the second and third rows of houses, along the quay street, up the alley at x -95 to the Rua Nova
// dos Mercadores, and east along it. The street dressing keeps a corridor open along it (life.js); walk-check follows it.
export const MAIN_WALK = [
  [-206, 114], [-206, 92], [-196, 89], [-124, 89], [-117, 94.6], [-95, 94.6],            // the plaza, the east lane, the quay street
  [-95, 60], [-95, 24], [-95, 8], [-95, -4.5],                                           // the alley up to the Rua Nova
  [-40, -4.5], [30, -4.5], [100, -4.5], [170, -4.5],                                     // along the Rua Nova
];
/** The quay street east to the palace's west front (the palace stands on the quay: no way on past it), from the alley's foot. */
export const QUAY_WALK = [[-95, 94.6], [-48, 94.6]];
/** From the Rua Nova south by the alley at x 120 into the Terreiro do Paço, to the river's edge and east into the shipyard. */
export const TERREIRO_WALK = [[120, -4.5], [120, 12], [120, 26], [120, 60], [110, 90], [150, 90], [160, 60]];
export const WALKS = [MAIN_WALK, QUAY_WALK, TERREIRO_WALK];
/** Distance from (x, z) to the main walk's lines (a corridor test). */
export function nearWalk(x, z, half) {
  for (const W of WALKS) for (let i = 1; i < W.length; i++) {
    const [ax, az] = W[i - 1], [bx, bz] = W[i], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    if (Math.hypot(x - ax - t * dx, z - az - t * dz) < half) return true;
  }
  return false;
}
/** The corridor as footprints for the street-life pass of src/objects/life.js (it keeps its people, animals and things off a footprint): strips 2 m wide
 *  (a strip of at least 2 m a side would be read as a house), two abreast along every leg, built as nothing (door_clear). */
export function walkClear() {
  const out = [];
  for (const W of WALKS) for (let i = 1; i < W.length; i++) {
    const [ax, az] = W[i - 1], [bx, bz] = W[i];
    if (Math.abs(bx - ax) > Math.abs(bz - az)) for (const o of [-1, 1]) out.push({ t: 'door_clear', rect: [Math.min(ax, bx) - 1, Math.min(az, bz) + o - 1, Math.max(ax, bx) + 1, Math.min(az, bz) + o + 0.99] });
    else for (const o of [-1, 1]) out.push({ t: 'door_clear', rect: [Math.min(ax, bx) + o - 1, Math.min(az, bz) - 1, Math.min(ax, bx) + o + 0.99, Math.max(az, bz) + 1] });
  }
  return out;
}
/** The lane before each opened door (and each upstairs house's), 4 m wide and 5.5 m deep, as two strips under 2 m (door_clear: a footprint for the street-life pass, nothing built). */
export function doorClear(lots, frame) {
  const out = [];
  for (const l of lots) {
    if (!l.open && !l.up) continue;
    const F = frame(l.rect, l.front), m = F.L / 2;
    for (const [a, b] of [[m - 2.0, m - 0.01], [m, m + 1.99]]) out.push({ t: 'door_clear', rect: F.R(a, -4.5, b, 1.0) });
  }
  return out;
}
