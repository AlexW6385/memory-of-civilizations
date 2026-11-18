// The tower houses that can be climbed (docs/settlements/shibam.md §15): the frame that turns the enterable house of open.js (door on its
// west face, stair behind the door, windows on its north face) onto a lot of the town's rows whose front looks north or south; the
// walls' taper kept on the faces that are free only; the use of each storey; the walk of a visitor from the street up the stair.
import { K, T, SW, PT, RUN, ys, topOf, houseDims } from './dims.js';

/** Which use a storey has (the furnishing of open.js): 0 store, 1 women's, 2 family, 3 bedroom, 4 majlis, 5 upper room, 6 under the roof; the storeys between are the family's rooms in turn. */
export function kindOf(s, n, seed = 0) {
  if (s === n - 1) return 6;
  if (n <= 7 || s <= 5) return s;
  return [3, 2, 5][(s + (seed >>> 3)) % 3];
}

/** The depth a lot must have across the front and the narrowest face's length the stair, door and rooms need. */
export const UP_DEPTH = 9.2, UP_MIN = 8.6;

/** The frame of a lot (rect, front 'n'|'s'): P(u, v) from the house's own frame (u in from the door's face, v along it) to the world; M turns its geometry; dir turns a ramp's direction. */
export function frameOf(front, [x0, z0, x1, z1]) {
  if (front === 's') return { P: (u, v) => [x0 + v, z1 - u], M: [0, 0, 1, x0, 0, 1, 0, 0, -1, 0, 0, z1], dir: { n: 'w', s: 'e', e: 'n', w: 's' } };
  return { P: (u, v) => [x1 - v, z0 + u], M: [0, 0, -1, x1, 0, 1, 0, 0, 1, 0, 0, z0], dir: { n: 'e', s: 'w', e: 's', w: 'n' } };
}

/** The house's own description of a lot: { rect (its own frame), kf (the taper by face), noN (the side face touches a neighbour), doorAt }. */
export function upOf(l) {
  const f = l.free, fr = l.front, W = l.rect[2] - l.rect[0];
  const free = fr === 's' ? { w: f.s, n: f.w, s: f.e, e: f.n } : { w: f.n, n: f.e, s: f.w, e: f.s };
  const k = (a) => (a ? K : 0);
  return { rect: [0, 0, l.rect[3] - l.rect[1], W], kf: { w: k(free.w), n: k(free.n), e: k(free.e), s: k(free.s) }, noN: !free.n, doorAt: Math.min(5.3, W - 3.5) };
}

/** The street door's coordinate along the front (world x). */
export function upDoor(l) {
  const u = upOf(l);
  return l.front === 's' ? l.rect[0] + 1 + u.doorAt : l.rect[2] - 1 - u.doorAt;
}

/**
 * The walks of one climbable house, in the world: from the street at its door up the stair to its majlis (storey 4) and from there on to
 * the roof's terrace. Waypoints are made in the house's frame and turned.
 */
export function upRoutes(l) {
  const { rect, doorAt } = upOf(l);
  return routesIn(rect, frameOf(l.front, l.rect).P, l.storeys, doorAt);
}
/** The same for a house in its own frame (P the identity: the arrival's tower house). */
export function routesIn(rect, P, n, doorAt = 5.3) {
  const F = { P }, D = houseDims(rect), [I0, I1] = D.I, dz = I1 + doorAt;
  const a = I0 + 0.6, b = I0 + SW - 0.6, zIn = I1 + RUN + 0.3, zLand = I1 + 0.6;
  const W = (u, v) => F.P(u, v);
  const up = (r, from, to) => { for (let s = from; s < to; s++) { r.push(W(a, zIn), W(a, zLand), W(b, zLand), W(b, zIn)); } };
  const start = () => [W(-2.2, dz), W(-0.4, dz), W(a, dz)];
  const maj = Math.min(4, n - 1), room = D.room;
  const A = start(); up(A, 0, maj); A.push(W(b, dz), W(D.xp + PT / 2, dz), W(room[0] + 1.4, dz));
  const B = start(); up(B, 0, n); B.push(W(b, zIn + 1.3), W(b + 0.4, zIn + 2.0));
  return [A, B];
}
void T; void ys; void topOf;
