// The Umayyad city's fabric (Jerusalem about 700; docs/settlements/jerusalem.md §4a): the city wall of
// the late Roman and Byzantine circuit, of ashlar, with a battlemented wall-walk and square towers;
// the gates, Hadrian's triple-arched north gate among them; the Cardo's colonnades, their timber-roofed
// porticoes and the row of shops behind each. Registered into the `islamic` style.

import { STYLES } from '../../core/build.js';
import { box, lathe, frustum } from '../../core/geom.js';
import './index.js';

/** A box in a frame: origin o [x, z], along u [ux, uz] (s0…s1), across n = (−uz, ux) (t0…t1), y0…y1. */
function fbox(o, u, s0, s1, t0, t1, y0, y1) {
  const g = box(s0, y0, t0, s1, y1, t1), p = g.attributes.position.array, nn = g.attributes.normal.array;
  const [ux, uz] = u, nx = -uz, nz = ux;
  for (let i = 0; i < p.length; i += 3) {
    const s = p[i], t = p[i + 2]; p[i] = o[0] + s * ux + t * nx; p[i + 2] = o[1] + s * uz + t * nz;
    const a = nn[i], b = nn[i + 2]; nn[i] = a * ux + b * nx; nn[i + 2] = a * uz + b * nz;
  }
  return g;
}
const seg = (col, o, u, s0, s1, t0, t1, y0, y1) => {
  const [ux, uz] = u, nx = -uz, nz = ux, tm = (t0 + t1) / 2;
  col.segment([o[0] + s0 * ux + tm * nx, o[1] + s0 * uz + tm * nz], [o[0] + s1 * ux + tm * nx, o[1] + s1 * uz + tm * nz], t1 - t0, y0, y1);
};
/** Merlons along a parapet in a frame, from s0 to s1, across t0…t1, standing on y. */
function merlons(bag, o, u, s0, s1, t0, t1, y, mat = 'limestone') {
  const L = s1 - s0, n = Math.max(1, Math.floor(L / 1.7));
  for (let k = 0; k < n; k++) { const a = s0 + (k + 0.25) * L / n, b = s0 + (k + 0.75) * L / n; bag.add(mat, fbox(o, u, a, b, t0, t1, y, y + 1.0)); }
}

/**
 * city_wall: { pts [[x, z, ground] …], th, h } — the wall along a polyline, its outside to the left of the
 * direction of travel (−n). Each stretch reaches from below its lowest ground to h above its highest; a
 * battlemented parapet on the outer edge, a low one on the inner, a plinth course at the foot.
 */
function cityWall(el, { bag, col }) {
  const P = el.pts, th = el.th ?? 2.8, h = el.h ?? 9;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az, ga, la = ga] = P[i], [bx, bz, gb, lb = gb] = P[i + 1], L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], o = [ax, az];
    const y0 = Math.min(la, lb) - 1.2, top = Math.max(ga, gb) + h, ext = 0.06;
    bag.add('limestone', fbox(o, u, -ext, L + ext, -th / 2, th / 2, y0, top));
    bag.add('limestone_yellow', fbox(o, u, -ext - 0.02, L + ext + 0.02, -th / 2 - 0.25, th / 2 - 0.4, y0, Math.min(la, lb) + 0.9));   // the plinth of large blocks
    merlons(bag, o, u, 0, L, -th / 2, -th / 2 + 0.6, top);
    bag.add('limestone', fbox(o, u, -ext, L + ext, th / 2 - 0.45, th / 2, top, top + 0.7));
    seg(col, o, u, 0, L, -th / 2, th / 2, y0, top + 1);
  }
}

/** wall_tower: { at, g (ground), u (the wall's direction), w (along), d (out from the wall's centre line), h, th } — a square tower standing out from the wall, battlemented, with loopholes. */
function wallTower(el, { bag, col }) {
  const o = el.at, u = el.u, w = el.w ?? 7, d = el.d ?? 6, th = el.th ?? 2.8, g = el.g, h = el.h ?? 12.5;
  const gl = el.gmin ?? g - 1, y0 = gl - 1.2, top = g + h;
  bag.add('limestone', fbox(o, u, -w / 2, w / 2, -d, th / 2, y0, top));
  bag.add('limestone_yellow', fbox(o, u, -w / 2 - 0.25, w / 2 + 0.25, -d - 0.25, th / 2 - 0.4, y0, gl + 1.0));
  // a string course under the battlements, the merlons all round, loopholes in the three outer faces
  bag.add('limestone', fbox(o, u, -w / 2 - 0.12, w / 2 + 0.12, -d - 0.12, th / 2, top - 0.35, top));
  merlons(bag, o, u, -w / 2, w / 2, -d, -d + 0.55, top);
  const un = [-u[1], u[0]];
  for (const s of [-1, 1]) merlons(bag, [o[0] + u[0] * s * (w / 2 - 0.275), o[1] + u[1] * s * (w / 2 - 0.275)], un, -d + 0.55, th / 2 - 0.2, -0.275, 0.275, top);
  for (const yy of [g + 4.5, g + 8.5]) {
    bag.add('opening', fbox(o, u, -0.12, 0.12, -d - 0.03, -d + 0.2, yy, yy + 1.3));
    for (const s of [-1, 1]) bag.add('opening', fbox(o, u, s > 0 ? w / 2 - 0.2 : -w / 2 - 0.03, s > 0 ? w / 2 + 0.03 : -w / 2 + 0.2, -d / 2 - 0.12, -d / 2 + 0.12, yy, yy + 1.3));
  }
  seg(col, o, u, -w / 2, w / 2, -d, th / 2, y0, top + 1);
}

/**
 * city_gate: { at, g, u (along the wall), th, kind ('triple' | 'single'), h } — the gate: a passage through
 * a thickened stretch of wall between two towers. The triple gate: Hadrian's free-standing arch built into
 * the wall, a tall central arch between two low ones, pilasters and a cornice; the single gate an arch
 * between towers.
 */
function cityGate(el, ctx) {
  const { bag } = ctx, E = STYLES.islamic.elements, o = el.at, u = el.u, g = el.g, th = (el.th ?? 2.8) + 1.6, triple = el.kind === 'triple';
  const W = triple ? 21 : 12, h = el.h ?? 9, top = g + h + (triple ? 2.5 : 1);
  const arches = triple ? [{ uc: W / 2, r: 2.7, spring: g + 6.4, sill: g }, { uc: W / 2 - 6.6, r: 1.25, spring: g + 3.6, sill: g }, { uc: W / 2 + 6.6, r: 1.25, spring: g + 3.6, sill: g }]
    : [{ uc: W / 2, r: 2.0, spring: g + 4.4, sill: g }];
  const nx = -u[1], nz = u[0], start = [o[0] - u[0] * W / 2, o[1] - u[1] * W / 2];
  E.planar_wall({ o: start, u, th, u0: 0, u1: W, y0: Math.min(g, el.gmin ?? g) - 1.5, y1: top, arches, mat: 'limestone' }, ctx);
  // the passage paved; pilasters between the arches on the outer face, a cornice over them
  bag.add('flagstone', fbox(o, u, -W / 2 + 0.3, W / 2 - 0.3, -th / 2 - 1.5, th / 2 + 1.5, g - 0.3, g + 0.03));
  if (triple) {
    for (const s of [-9.6, -3.65, 3.65, 9.6]) for (const side of [-1, 1]) bag.add('limestone_yellow', fbox(o, u, s - 0.45, s + 0.45, side < 0 ? -th / 2 - 0.35 : th / 2, side < 0 ? -th / 2 : th / 2 + 0.35, g, g + 9.2));
    for (const side of [-1, 1]) bag.add('limestone_yellow', fbox(o, u, -W / 2 + 0.2, W / 2 - 0.2, side < 0 ? -th / 2 - 0.55 : th / 2, side < 0 ? -th / 2 : th / 2 + 0.55, g + 9.2, g + 9.9));
  }
  merlons(bag, o, u, -W / 2, W / 2, -th / 2, -th / 2 + 0.6, top);
  // the towers either side
  for (const s of [-1, 1]) wallTower({ at: [o[0] + u[0] * s * (W / 2 + 3.6), o[1] + u[1] * s * (W / 2 + 3.6)], u, w: 7.2, d: 6.5, th: th, g, gmin: el.gmin, h: h + 4.5 }, ctx);
  void nx; void nz;
}

/**
 * colonnade: { a, b (the column line, along the street), y, side (±1: which side of a→b the portico lies),
 * depth (portico), shops (depth of the shop row; 0 for none), h (column), spacing } — a row of columns
 * carrying an architrave, a lean-to roof of tiles on timber over the portico, its floor paved a step up
 * from the street; behind it the shops, each a vaulted room with a wide door, flat-roofed.
 */
function colonnade(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, side = el.side ?? 1, D = el.depth ?? 5, Sd = el.shops ?? 5.5, H = el.h ?? 5;
  const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], o = [ax, az], sp = el.spacing ?? 4.2;
  const n = Math.max(1, Math.round(L / sp)), step = L / n, t = (v) => v * side;
  const T = (t0, t1) => [Math.min(t(t0), t(t1)), Math.max(t(t0), t(t1))];
  // the portico floor, a kerb on the street side
  { const [p, q] = T(-0.45, D); bag.add('flagstone', fbox(o, u, 0, L, p, q, y - 0.4, y + 0.18));
    const nx = -u[1], nz = u[0], xs = [ax + nx * p, ax + nx * q, bx + nx * p, bx + nx * q], zs = [az + nz * p, az + nz * q, bz + nz * p, bz + nz * q];
    col.floor([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y + 0.18); }
  for (let k = 0; k <= n; k++) {
    const s = k * step, cx = ax + u[0] * s, cz = az + u[1] * s;
    // a plain shaft of hard limestone, an Attic base and a simple capital
    bag.add('limestone', box(cx - 0.42, y + 0.18, cz - 0.42, cx + 0.42, y + 0.45, cz + 0.42));
    bag.add('marble_smooth', lathe([[0.38, 0], [0.36, 0.1], [0.3, 0.16], [0.3, H - 0.95], [0.27, H - 0.75], [0.001, H - 0.75]], 10, null, cx, y + 0.45, cz));
    bag.add('limestone', lathe([[0.27, 0], [0.32, 0.25], [0.44, 0.48], [0.001, 0.48]], 10, null, cx, y + H - 0.78, cz));
    col.circle(cx, cz, 0.35, y, y + H);
  }
  bag.add('limestone', fbox(o, u, -0.3, L + 0.3, -0.4, 0.4, y + H - 0.3, y + H + 0.4));          // the architrave
  if (Sd > 0) {
    // the shops: a front wall with a door to each, party walls, a back wall, flat roofs; the portico roof leans on the front wall
    const f0 = D, f1 = D + 0.6, bk = D + Sd;
    const wf = (s0, s1, y0, y1) => { const [p, q] = T(f0, f1); bag.add('limestone', fbox(o, u, s0, s1, p, q, y0, y1)); };
    const ns = Math.max(1, Math.round(L / 4.5)), sw = L / ns;
    for (let k = 0; k < ns; k++) {
      const s0 = k * sw, s1 = s0 + sw, d0 = s0 + 0.55, d1 = s1 - 0.55;
      wf(s0, d0, y - 0.4, y + H + 1.6); wf(d1, s1, y - 0.4, y + H + 1.6); wf(d0, d1, y + 2.9, y + H + 1.6);
      bag.add('timber', (() => { const [p, q] = T(f0 - 0.05, f1 + 0.05); return fbox(o, u, d0 - 0.1, d1 + 0.1, p, q, y + 2.75, y + 2.9); })());
      { const [p, q] = T(f1, bk); bag.add('limestone', fbox(o, u, s1 - 0.3, s1 + 0.3 > L ? L : s1 + 0.3, p, q, y - 0.4, y + H + 1.6)); }
      // a dark interior: the floor, and the vault seen through the door
      { const [p, q] = T(f1, bk - 0.6); bag.add('plaster', fbox(o, u, s0 + 0.3, s1 - 0.3, p, q, y + 3.4, y + 3.6)); bag.add('flagstone', fbox(o, u, s0, s1, p, q, y - 0.4, y + 0.12)); }
      { const [p, q] = T(f0, f1); seg(col, o, u, s0, d0, p, q, y, y + H); seg(col, o, u, d1, s1, p, q, y, y + H); }
    }
    bag.add('limestone', fbox(o, u, 0, 0.3, ...T(f1, bk), y - 0.4, y + H + 1.6));
    { const [p, q] = T(bk - 0.6, bk); bag.add('limestone', fbox(o, u, 0, L, p, q, y - 0.4, y + H + 1.6)); seg(col, o, u, 0, L, p, q, y, y + H + 1.6); }
    { const [p, q] = T(f1, bk - 0.6); bag.add('plaster', fbox(o, u, 0, L, p, q, y + H + 1.45, y + H + 1.65)); }
  }
  // the lean-to roof: rafters from the architrave to the wall, tiles over them
  const r0 = y + H + 0.4, r1 = Sd > 0 ? y + H + 1.55 : y + H + 1.0, back = Sd > 0 ? D : D;
  const roof = (y0, y1, mat, dy) => {
    const [p, q] = T(-0.5, back + 0.02);
    const g = fbox(o, u, -0.3, L + 0.3, p, q, 0, 0.08);
    const P = g.attributes.position.array;
    for (let i = 0; i < P.length; i += 3) {
      // lift each vertex by its distance from the street line, up toward the wall
      const tx = (P[i] - o[0]) * -u[1] + (P[i + 2] - o[1]) * u[0], f = Math.max(0, Math.min(1, (tx * side + 0.5) / (back + 0.52)));
      P[i + 1] += y0 + (y1 - y0) * f + dy;
    }
    g.computeVertexNormals?.();
    bag.add(mat, g);
  };
  roof(r0, r1, 'timber', 0); roof(r0, r1, 'roof_tile', 0.1);
}

Object.assign(STYLES.islamic.elements, { city_wall: cityWall, wall_tower: wallTower, city_gate: cityGate, colonnade });
void frustum;
