// Geometry of the planet: positions as unit vectors and as latitude / longitude, local frames
// (east, up, south) and conversions between them. Pure functions on plain arrays, shared by the
// viewer, the workers and the tools.
//
// Planet coordinates: metres from the planet's centre; +y the north pole, the prime meridian
// through +z, longitude growing toward +x. A local frame has +x east, +y up, +z south (north is
// −z), as the settlements' plans do.

export const DEG = Math.PI / 180;

/** Unit vector toward (lat, lon) in degrees. */
export function unit(lat, lon) {
  const p = lat * DEG, l = lon * DEG, c = Math.cos(p);
  return [c * Math.sin(l), Math.sin(p), c * Math.cos(l)];
}

/** [lat, lon] in degrees of a vector (any length). */
export function latLon(v) {
  const L = Math.hypot(v[0], v[1], v[2]) || 1;
  return [Math.asin(Math.max(-1, Math.min(1, v[1] / L))) / DEG, Math.atan2(v[0], v[2]) / DEG];
}

export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** Angle between two directions (radians). */
export function angle(a, b) { return Math.atan2(len(cross(a, b)), dot(a, b)); }

/** East and north unit vectors at the direction u (north falls back near the poles). */
export function eastNorth(u) {
  let e = [u[2], 0, -u[0]];
  const l = Math.hypot(e[0], e[2]);
  e = l < 1e-9 ? [1, 0, 0] : [e[0] / l, 0, e[2] / l];
  return [e, cross(u, e)];
}

/**
 * A frame: origin o (planet coordinates) and basis columns x (east), y (up), z (south).
 * The east-north-up frame at direction u, its origin at radius r on that direction.
 */
export function enuFrame(u, r) {
  const [e, n] = eastNorth(u);
  return { o: scale(u, r), x: e, y: u.slice(), z: scale(n, -1) };
}

/** Planet coordinates of local point l in frame f. */
export function toPlanet(f, l) {
  return [
    f.o[0] + f.x[0] * l[0] + f.y[0] * l[1] + f.z[0] * l[2],
    f.o[1] + f.x[1] * l[0] + f.y[1] * l[1] + f.z[1] * l[2],
    f.o[2] + f.x[2] * l[0] + f.y[2] * l[1] + f.z[2] * l[2],
  ];
}

/** Local coordinates of planet point p in frame f. */
export function toLocal(f, p) {
  const d = sub(p, f.o);
  return [dot(f.x, d), dot(f.y, d), dot(f.z, d)];
}

/** A direction given in planet coordinates, expressed in frame f (and back). */
export function dirToLocal(f, d) { return [dot(f.x, d), dot(f.y, d), dot(f.z, d)]; }
export function dirToPlanet(f, d) {
  return [f.x[0] * d[0] + f.y[0] * d[1] + f.z[0] * d[2], f.x[1] * d[0] + f.y[1] * d[1] + f.z[1] * d[2], f.x[2] * d[0] + f.y[2] * d[1] + f.z[2] * d[2]];
}

/** Rotate vector v by the rotation that takes unit a to unit b by the shortest way. */
export function rotateMin(v, a, b) {
  const c = dot(a, b);
  if (c > 1 - 1e-12) return v.slice();
  const k = cross(a, b), s = len(k);
  if (s < 1e-12) return v.slice();                       // opposite: not needed here
  const ax = scale(k, 1 / s), cs = c;
  // Rodrigues
  const kv = cross(ax, v), kd = dot(ax, v);
  return [0, 1, 2].map((i) => v[i] * cs + kv[i] * s + ax[i] * kd * (1 - cs));
}

/**
 * The frame carried from f to a new origin direction u (radius r) without turning about the
 * vertical: the basis is rotated by the least rotation taking f's up to u.
 */
export function transportFrame(f, u, r) {
  return { o: scale(u, r), x: norm(rotateMin(f.x, f.y, u)), y: u.slice(), z: norm(rotateMin(f.z, f.y, u)) };
}

/** Great-circle point from u, toward bearing (radians from north, clockwise), angular distance d. */
export function travel(u, bearing, d) {
  const [e, n] = eastNorth(u);
  const t = add(scale(n, Math.cos(bearing)), scale(e, Math.sin(bearing)));
  return norm(add(scale(u, Math.cos(d)), scale(t, Math.sin(d))));
}

/** Bearing (radians from north, clockwise) from u toward v. */
export function bearing(u, v) {
  const [e, n] = eastNorth(u);
  const d = sub(v, scale(u, dot(u, v)));
  return Math.atan2(dot(d, e), dot(d, n));
}
