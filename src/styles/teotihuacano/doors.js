// Where the rooms' doorways are (pure arithmetic, no three.js), shared by the builder (rooms.js) and the visitor's routes (settlements/teotihuacan/walk.js).

/** Half the width of a room's doorway: 1.6 m clear, as the walker's body needs (the real doorways were narrower: the widening is ours, dossier §17). */
export const DOOR_HALF = 0.8;

/**
 * Where the doorways of porticoRooms(…, back, [fx, fz], …, n rooms) are: [{ out: [x, z] (the middle of the doorway on the portico's side of the front wall), at(v) → [x, z]
 * (the line through it, v metres in), inward: [ix, iz] }]. The same arithmetic as porticoRooms, for the visitor's routes (settlements/teotihuacan/walk.js).
 */
export function roomDoors(back, [fx, fz], n) {
  const s = fx || fz, front = fx ? (fx > 0 ? back[2] : back[0]) : (fz > 0 ? back[3] : back[1]), U0 = fx ? back[1] : back[0], U1 = fx ? back[3] : back[2], cell = (U1 - U0) / n;
  return Array.from({ length: n }, (_, j) => {
    const m = U0 + (j + 0.5) * cell, at = (v) => (fx ? [front - s * v, m] : [m, front - s * v]);
    return { out: at(0), at, inward: [-fx, -fz], u: m };
  });
}
