// The modules of the tower house (docs/settlements/shibam.md §4): storey heights, the taper, the walls, the stair shaft.
export const GH = 3.4, SH = 3.0, K = 0.02, T = 1.0, SW = 2.4, PT = 0.3, RUN = 3.6, F0 = 0.06, STOREYS = 7;
/** The height of the floor of storey s (0 the street's level) and of the top of storey n. */
export const ys = (s) => (s === 0 ? 0 : GH + (s - 1) * SH);
export const fl = (s) => (s === 0 ? F0 : ys(s));
export const topOf = (n) => GH + (n - 1) * SH;
/** The inside of the enterable house from its outer rectangle: the interior I, the stair shaft, the lobby and the room beside it. */
export function houseDims(rect) {
  const [X0, Z0, X1, Z1] = rect, I = [X0 + T, Z0 + T, X1 - T, Z1 - T];
  return { I, xp: I[0] + SW, room: [I[0] + SW + PT, I[1], I[2], I[3]], shaft: [I[0], I[1], I[0] + SW, I[1] + RUN], lobby: [I[0], I[1] + RUN, I[0] + SW, I[3]], doorZ: I[1] + 5.3 };
}
