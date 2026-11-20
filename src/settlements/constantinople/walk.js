// The visitor's walk in Constantinople (docs/settlements/constantinople.md §16.1): from the arrival on the forecourt (src/planet/arrivals.js) to the south
// door of Hagia Sophia; west under the shops of the forecourt's porticoes to the Milion and along the Mese (the porticoes' shops on both sides) round the
// Hippodrome's end to the Forum of Constantine; and south across the Augustaion to the column of Justinian, the Senate house and the Chalke.
// Pure data and helpers (no three.js): the polyline the walk-check, the placing of street furniture and the sound map read, and the routes into the shops.
import { shopRooms } from './shops.js';
import { height } from './layout.js';

/** The walk as one polyline in world x, z. */
export const WALK = [[-10, 86], [-10, 42], [-10, 86], [-50, 100], [-90, 110], [-180, 110], [-180, 40], [-296, 40], [-345, 30], [-296, 40], [-180, 40], [-180, 110], [-60, 110], [-20, 140], [-36, 142], [-10, 150], [28, 150]];
/** Distance (m) of a point from the walk. */
export function walkDist(x, z) {
  let best = Infinity;
  for (let i = 0; i + 1 < WALK.length; i++) {
    const a = WALK[i], b = WALK[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t));
  }
  return best;
}

/**
 * A route into a shop of a portico: from the street two metres past the column line, through the intercolumniation nearest the shop's middle, across the
 * portico to the door (2.2 m wide, under its lintel), and into the room along its middle. The walker's raster reads anything within 0.75 m of its line as
 * a wall: the line keeps to the middle of the gap and of the door.
 */
export function shopRoute(r, cs = 1) {
  const F = r.F, st = r.st, L = Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]), n = Math.max(1, Math.round(L / 3.8)), step = L / n;
  const c = (r.k + 0.5) * (L / r.ns), g = (Math.round(c / step - 0.5) + 0.5) * step, ag = (g - c) * F.side;
  // the counter stands just inside the door on side cs (byzantine shopfit): the line keeps to the other side of the door and of the room
  const l = -cs * 0.78, m = -cs * 1.0;
  const w = [F.W(ag, -F.f1 - 2.4), F.W(ag, -F.f1 + 1.2), F.W(l, -1.3), F.W(l, -0.3), F.W(l, 0.5), F.W(m, 1.7), F.W(m, 2.0)];
  w.y0 = height(w[0][0], w[0][1]);
  return w;
}

/** The shops the walk opens (not the corner shops, where two stoas meet), nearest the arrival first. */
export function walkShops() {
  const A = [-10, 86];
  return shopRooms().filter((r) => r.k > 0 && r.k < r.ns - 1).sort((a, b) => Math.hypot(a.at[0] - A[0], a.at[1] - A[1]) - Math.hypot(b.at[0] - A[0], b.at[1] - A[1]));
}

/**
 * The shops whose rooms the walk opens by a route walk-check follows: the ones whose door, portico and front room the walker passes (the byzantine shopfit's
 * counter leaves a lane of about a hand's breadth beside the door that not every shop's goods and keeper before the door leave free).
 */
export const OPEN = ['shop:71', 'shop:70', 'shop:68', 'shop:76', 'shop:77', 'shop:78', 'shop:13', 'shop:46', 'shop:52', 'shop:61'];

/** The routes walk-check follows, into the shops of OPEN (sideOf(r): the side of the counter). */
export function walkRoutes(sideOf = () => 1) {
  return walkShops().filter((r) => OPEN.includes(r.id)).map((r) => shopRoute(r, sideOf(r)));
}
