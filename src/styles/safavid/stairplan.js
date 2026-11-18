// The stair and the upper floor of a courtyard house of Isfahan (docs/settlements/isfahan.md §25): pure data, shared by
// the layout (which houses can have one) and the builder (upstairs.js). A flight of brick steps rises in the court
// along the court face of the kitchen or store wing, from its door end (the foot, F) to the other end (the top, T),
// where a landing at the wing's roof level meets the flat roof; on the roof stand the upper room (balakhaneh) at the
// F half and the terrace where the household sleeps in summer at the T half.

export const RISE = 0.24, TREAD = 0.25, STRIP = 1.2;

/** The plan of the upstairs of a house { rect, entry, v } (v: layout.js houseVar's data), or null when the wing is too short. */
export function upPlan(rect, entry, v) {
  const [x0, z0, x1, z1] = rect, d = v.d, c = [x0 + d.w, z0 + d.n, x1 - d.e, z1 - d.s];
  const hB = v.H - 0.3, rise = hB - 0.04, n = Math.ceil(rise / RISE - 1e-9), run = n * TREAD;
  for (const side of ['s', 'w', 'e']) {
    if (side === entry || (v.wings[side] !== 'kitchen' && v.wings[side] !== 'store')) continue;
    const L = side === 's' ? c[2] - c[0] : c[3] - c[1], lo = side === 's' ? c[0] : c[1];
    const landLen = 1.7, uF = L - run - landLen;
    if (uF < 1.6) continue;
    const Lr = Math.max(3.6, Math.min(5.6, L * 0.5)), terrace = L - Lr;
    if (terrace < 2.4) continue;
    const face = side === 'w' ? x0 + d.w : side === 'e' ? x1 - d.e : z1 - d.s;
    return { side, L, lo, hi: lo + L, face, dw: d[side], uF, run, n, landLen, hB, rise, riser: rise / n, Lr, court: c, entry };
  }
  return null;
}

/** The world point [x, z] at t along the wing from its foot end and v from the court face into the wing (negative: into the court). */
export function P(pl, t, v) {
  const a = pl.lo + t;
  return pl.side === 'w' ? [pl.face - v, a] : pl.side === 'e' ? [pl.face + v, a] : [a, pl.face + v];
}
/** The cardinal direction of ascent of the flight. */
export const ascent = (pl) => (pl.side === 's' ? 'e' : 's');
