// The oasis town (docs/settlements/dunhuang.md §6): houses of rammed earth round courtyards, flat-roofed with
// parapets and the ends of the roof beams under the eaves, or gabled in grey tile for the rich; rammed-earth
// walls; the east gate; the timber bridge and the stream; the Crescent Spring; the caravanserai with its
// furnished guest room; awnings of the market.
import { box, lathe, fromTriangles, quad, rod } from '../../core/geom.js';
import { figure } from '../../objects/figures.js';
import { RIVER, riverX, ZEND, crescent, SPRING, rng } from '../../settlements/dunhuang/layout.js';
import { oilLamp } from './caves.js';
import { makeHouse } from './homes.js';

const WALL = 'earth_wall', FOOT = 'banco_rough';

/** The frame of a lot whose street lies on side `front`: (u along the street, v away from it) → world. */
function frame(rect, front) {
  const [x0, z0, x1, z1] = rect;
  const f = {
    s: { W: x1 - x0, D: z1 - z0, P: (u, v) => [x0 + u, z1 - v] },
    n: { W: x1 - x0, D: z1 - z0, P: (u, v) => [x0 + u, z0 + v] },
    w: { W: z1 - z0, D: x1 - x0, P: (u, v) => [x0 + v, z0 + u] },
    e: { W: z1 - z0, D: x1 - x0, P: (u, v) => [x1 - v, z0 + u] },
  }[front];
  f.rc = (u0, v0, u1, v1) => { const a = f.P(u0, v0), b = f.P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  f.dir = { s: [0, 1], n: [0, -1], w: [-1, 0], e: [1, 0] }[front];            // toward the street
  return f;
}
const slab = (ctx, mat, r, y0, y1, solid = true) => { ctx.bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) ctx.col.rect(r, y0, y1); };

/** A gabled roof over rect r (ridge along the longer side), tile over a timber frame, gable ends of earth. */
function gable(ctx, r, y, rise, over = 0.55) {
  const [x0, z0, x1, z1] = r, alongX = x1 - x0 >= z1 - z0, t = [], u = [], g = [];
  const X0 = x0 - (alongX ? over : over), X1 = x1 + over, Z0 = z0 - over, Z1 = z1 + over, yr = y + rise, ye = y - 0.15;
  if (alongX) {
    const zm = (z0 + z1) / 2;
    quad(t, [X0, ye, Z0], [X0, yr, zm], [X1, yr, zm], [X1, ye, Z0]); quad(t, [X0, yr, zm], [X0, ye, Z1], [X1, ye, Z1], [X1, yr, zm]);
    g.push(x0, y, z0, x0, y, z1, x0, yr - 0.1, zm, x1, y, z1, x1, y, z0, x1, yr - 0.1, zm);
    ctx.bag.add('roof_ridge', box(X0, yr - 0.02, zm - 0.18, X1, yr + 0.22, zm + 0.18));
  } else {
    const xm = (x0 + x1) / 2;
    quad(t, [X0, ye, Z0], [xm, yr, Z0], [xm, yr, Z1], [X0, ye, Z1]); quad(t, [xm, yr, Z0], [X1, ye, Z0], [X1, ye, Z1], [xm, yr, Z1]);
    g.push(x0, y, z0, xm, yr - 0.1, z0, x0, y, z1, x1, y, z1, xm, yr - 0.1, z1, x1, y, z0);
    ctx.bag.add('roof_ridge', box(xm - 0.18, yr - 0.02, Z0, xm + 0.18, yr + 0.22, Z1));
  }
  const fix = (tris, up) => { const o = []; for (let i = 0; i < tris.length; i += 9) { const ux = tris[i + 3] - tris[i], uy = tris[i + 4] - tris[i + 1], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vy = tris[i + 7] - tris[i + 1], vz = tris[i + 8] - tris[i + 2], ny = uz * vx - ux * vz; if ((ny >= 0) === up) o.push(...tris.slice(i, i + 9)); else o.push(...tris.slice(i, i + 3), ...tris.slice(i + 6, i + 9), ...tris.slice(i + 3, i + 6)); } return o; };
  ctx.bag.add('tile_grey', fromTriangles(fix(t, true)));
  ctx.bag.add('timber', fromTriangles(fix(t.map((v, i) => (i % 3 === 1 ? v - 0.16 : v)), false)));
  ctx.bag.add(WALL, fromTriangles(g.length ? orient(g) : []));
}
function orient(g) {   // gable triangles: facing outward is not known in advance; emit both windings for the thin end walls
  const o = [];
  for (let i = 0; i < g.length; i += 9) o.push(...g.slice(i, i + 9), ...g.slice(i, i + 3), ...g.slice(i + 6, i + 9), ...g.slice(i + 3, i + 6));
  return o;
}

/** A door of plank in a timber frame in a wall along the frame's street side: at u, v = 0. */
function door(ctx, f, u, w, h, y, v = 0) {
  const { bag } = ctx;
  const ex = (u0, u1, y0, y1, m) => bag.add(m, box(...(([a, b, c, d]) => [a, y0, b, c, y1, d])(f.rc(u0, v - 0.04, u1, v + 0.22))));
  ex(u - w / 2 - 0.12, u - w / 2, y, y + h + 0.14, 'timber_red'); ex(u + w / 2, u + w / 2 + 0.12, y, y + h + 0.14, 'timber_red'); ex(u - w / 2 - 0.12, u + w / 2 + 0.12, y + h, y + h + 0.14, 'timber_red');
  bag.add('wood_dark', box(...(([a, b, c, d]) => [a, y, b, c, y + h, d])(f.rc(u - w / 2, v + 0.04, u + w / 2, v + 0.1))));
}
function window(ctx, f, u, w, h, y0, v = 0) {
  const { bag } = ctx;
  const R = (u0, u1, y0_, y1_, m, a = -0.03, b = 0.2) => bag.add(m, box(...(([p, q, r, s]) => [p, y0_, q, r, y1_, s])(f.rc(u0, v + a, u1, v + b))));
  R(u - w / 2 - 0.08, u + w / 2 + 0.08, y0 - 0.08, y0, 'timber_red', -0.03, 0.06); R(u - w / 2 - 0.08, u + w / 2 + 0.08, y0 + h, y0 + h + 0.08, 'timber_red', -0.03, 0.06);
  R(u - w / 2 - 0.08, u - w / 2, y0, y0 + h, 'timber_red', -0.03, 0.06); R(u + w / 2, u + w / 2 + 0.08, y0, y0 + h, 'timber_red', -0.03, 0.06);
  R(u - w / 2, u + w / 2, y0, y0 + h, 'lattice', 0.0, 0.05);
}

/**
 * dh_house { rect, front ('n'|'s'|'e'|'w': the side of the street), seed, tiled?, storeys?, left? }: the house along
 * the street with its courtyard behind, walled; the front with its door and windows.
 */
function house(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), f = frame(el.rect, el.front);
  const W = f.W, D = f.D, Dh = Math.min(D - 3, 5.2 + rand() * 1.4), H = (el.storeys === 2 ? 6.0 : 3.1 + rand() * 0.4), th = 0.5, tiled = !!el.tiled;
  const U = (u0, v0, u1, v1, y0, y1, m = WALL, solid = true) => slab(ctx, m, f.rc(u0, v0, u1, v1), y0, y1, solid);
  // the plinth and the walls: the rammed earth with its layers (a horizontal groove every 0.8 m, drawn as thin darker bands)
  U(0, 0, W, Dh, -0.05, 0.55, FOOT); U(0.03, 0.03, W - 0.03, Dh - 0.03, 0.55, H);
  for (let y = 1.5; y < H; y += 0.8) bag.add('banco_rough', box(...(([a, b, c, d]) => [a, y, b, c, y + 0.05, d])(f.rc(0.0, -0.012, W, 0.03))));          // the layers of ramming, seen on the front
  // the roof
  if (tiled) { slab(ctx, WALL, f.rc(0, 0, W, Dh), H, H + 0.12, false); gable(ctx, f.rc(0.0, 0.0, W, Dh), H + 0.12, 1.3 + W * 0.08); }
  else {
    U(0, 0, W, Dh, H, H + 0.25, FOOT, false); col.floor(f.rc(0.3, 0.3, W - 0.3, Dh - 0.3), H + 0.25);
    // the parapet (thin walls round the roof), the ends of the roof beams under the front eave, a spout
    for (const r of [f.rc(0, 0, W, 0.3), f.rc(0, Dh - 0.3, W, Dh), f.rc(0, 0, 0.3, Dh), f.rc(W - 0.3, 0, W, Dh)]) bag.add(WALL, box(r[0], H + 0.25, r[1], r[2], H + 0.7, r[3]));
    const nb = Math.floor(W / 0.7);
    for (let k = 0; k < nb; k++) { const u = 0.4 + k * (W - 0.8) / Math.max(1, nb - 1); bag.add('timber', box(...(([a, b, c, d]) => [a, H - 0.2, b, c, H - 0.06, d])(f.rc(u - 0.08, -0.3, u + 0.08, 0.1)))); }
    bag.add('wood_dark', box(...(([a, b, c, d]) => [a, H + 0.05, b, c, H + 0.12, d])(f.rc(W * 0.7, -0.35, W * 0.7 + 0.18, 0.1))));
    // a roof door (a small hatch) and a chimney pot
    if (rand() < 0.6) U(W * 0.2, Dh * 0.4, W * 0.2 + 0.5, Dh * 0.4 + 0.5, H + 0.25, H + 0.95, WALL, false);
  }
  // the front: door and windows; for two storeys an upper window row and a timber balcony
  const du = W * (0.25 + 0.5 * rand());
  door(ctx, f, du, 1.1, 2.1, 0.0, 0.0);
  for (const wu of [W * 0.12, W * 0.88]) if (Math.abs(wu - du) > 1.0) window(ctx, f, wu, 0.8, 0.8, 1.3, 0.0);
  if (el.storeys === 2) {
    for (const wu of [W * 0.2, W * 0.5, W * 0.8]) window(ctx, f, wu, 0.9, 1.0, 4.0, 0.0);
    U(0, -0.8, W, 0, 3.0, 3.12, 'timber', false); U(0.05, -0.8, W - 0.05, -0.74, 3.12, 4.0, 'timber_red', false); // the balcony's front rail (a low board and posts) and floor
    for (let u = 0.2; u < W; u += 1.6) U(u, -0.8, u + 0.12, -0.68, 0, 3.0, 'timber_red');
  }
  // the yard walls: the back and the side(s), a wall with a gate-less face along the yard
  const wl = (u0, v0, u1, v1) => U(u0, v0, u1, v1, 0, 2.3, WALL);
  wl(W - th, Dh, W, D); wl(0, D - th, W, D);
  if (el.left) wl(0, Dh, th, D);
  for (const [u0, v0, u1, v1] of [[W - th, Dh, W, D], [0, D - th, W, D]]) bag.add('tile_grey', box(...(([a, b, c, d]) => [a, 2.3, b, c, 2.4, d])(f.rc(u0 - 0.06, v0 - 0.06, u1 + 0.06, v1 + 0.06))));
  // the yard: a haystack or a kang-chimney, a trough
  if (rand() < 0.5) { const cx = f.P(W * 0.5, Dh + 2.0); bag.add('thatch', lathe([[0.001, 0], [1.1, 0], [1.0, 0.8], [0.5, 1.6], [0.001, 1.9]], 9, null, cx[0], 0, cx[1])); col.circle(cx[0], cx[1], 1.0, 0, 1.6); }
}

/** dh_wall { a, b, h, th, cap }: a rammed-earth wall (a long one: the lanes' and fields' walls). */
function wallEl(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, h = el.h ?? 2.3, th = el.th ?? 0.5;
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), n = Math.max(1, Math.round(L / 4));
  const horiz = Math.abs(dx) >= Math.abs(dz);
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, x0 = ax + dx * t0, z0 = az + dz * t0, x1 = ax + dx * t1, z1 = az + dz * t1;
    const r = horiz ? [Math.min(x0, x1), Math.min(z0, z1) - th / 2, Math.max(x0, x1), Math.max(z0, z1) + th / 2] : [Math.min(x0, x1) - th / 2, Math.min(z0, z1), Math.max(x0, x1) + th / 2, Math.max(z0, z1)];
    const hh = h - 0.08 * ((k * 7) % 3);
    bag.add(WALL, box(r[0], 0, r[1], r[2], hh, r[3])); col.rect(r, 0, hh);
    bag.add('tile_grey', box(r[0] - (horiz ? 0 : 0.06), hh, r[1] - (horiz ? 0.06 : 0), r[2] + (horiz ? 0 : 0.06), hh + 0.1, r[3] + (horiz ? 0.06 : 0)));
  }
}

/** The east gate: two towers of rammed earth with the passage between, a timber gatehouse over it under a tiled hip roof. */
function gate(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.at, hw = 3.2, tw = 5.0, D = 9, H = 7.5;
  for (const s of [-1, 1]) {
    const z0 = s > 0 ? cz + hw : cz - hw - tw, z1 = s > 0 ? cz + hw + tw : cz - hw;
    bag.add(FOOT, box(cx - D / 2, 0, z0, cx + D / 2, 1.0, z1)); bag.add(WALL, frustumBox(cx - D / 2 + 0.1, z0 + 0.1, cx + D / 2 - 0.1, z1 - 0.1, 1.0, H));
    col.rect([cx - D / 2, z0, cx + D / 2, z1], 0, H);
  }
  bag.add('timber_red', box(cx - D / 2 + 0.2, 4.6, cz - hw, cx + D / 2 - 0.2, 5.4, cz + hw));
  bag.add(WALL, box(cx - D / 2 + 0.1, 5.4, cz - hw, cx + D / 2 - 0.1, H, cz + hw)); col.rect([cx - D / 2, cz - hw, cx + D / 2, cz + hw], 4.6, H);
  // the gatehouse on the top: columns and a hip roof
  const y = H + 0.1;
  bag.add('timber', box(cx - 4.8, H, cz - 5.2, cx + 4.8, y, cz + 5.2));
  for (const x of [-3.6, 3.6]) for (const z of [-4.4, -1.5, 1.5, 4.4]) bag.add('timber_red', lathe([[0.2, 0], [0.18, 0.1], [0.17, 3.0]], 8, null, cx + x, y, cz + z));
  bag.add('timber_red', box(cx - 4.2, y + 2.9, cz - 4.8, cx + 4.2, y + 3.3, cz + 4.8));
  bag.add('lime_plaster', box(cx - 3.8, y, cz - 4.6, cx - 3.5, y + 2.9, cz + 4.6));
  hip(ctx, cx - 5.8, cz - 6.4, cx + 5.8, cz + 6.4, y + 3.3, 2.6);
  col.rect([cx - 4.8, cz - 5.2, cx + 4.8, cz + 5.2], H, y + 3.3);
}
function frustumBox(x0, z0, x1, z1, y0, y1) { return fromFrustum(x0, z0, x1, z1, y0, y1, 0.5); }
function fromFrustum(x0, z0, x1, z1, y0, y1, ins) {
  const t = [], b = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], u = [[x0 + ins, y1, z0 + ins], [x1 - ins, y1, z0 + ins], [x1 - ins, y1, z1 - ins], [x0 + ins, y1, z1 - ins]];
  quad(t, u[0], u[3], u[2], u[1]); quad(t, b[0], u[0], u[1], b[1]); quad(t, b[1], u[1], u[2], b[2]); quad(t, b[2], u[2], u[3], b[3]); quad(t, b[3], u[3], u[0], b[0]);
  return fromTriangles(t);
}
/** A hipped tile roof over [x0, z0, x1, z1] at eave height y, rise r. */
function hip(ctx, x0, z0, x1, z1, y, r) {
  const t = [], a = Math.min(2.2, (x1 - x0) / 2 - 0.2), b = (z1 - z0) / 2, c = [(x0 + x1) / 2, (z0 + z1) / 2];
  const rA = [x0 + (x1 - x0) / 2 - a * 0.0, y + r, c[1]], rl = [c[0] - Math.max(0, (x1 - x0) / 2 - b), y + r, c[1]], rr = [c[0] + Math.max(0, (x1 - x0) / 2 - b), y + r, c[1]];
  void rA;
  const P = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
  quad(t, P[0], rl, rr, P[1]); quad(t, P[1], rr, rr, P[2]); quad(t, P[2], rr, rl, P[3]); quad(t, P[3], rl, rl, P[0]);
  const fix = (tris, up) => { const o = []; for (let i = 0; i < tris.length; i += 9) { const ux = tris[i + 3] - tris[i], uy = tris[i + 4] - tris[i + 1], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vy = tris[i + 7] - tris[i + 1], vz = tris[i + 8] - tris[i + 2]; const ny = uz * vx - ux * vz; if (Math.abs(ux * vy - uy * vx) + Math.abs(uy * vz - uz * vy) + Math.abs(ny) < 1e-9) continue; if ((ny >= 0) === up) o.push(...tris.slice(i, i + 9)); else o.push(...tris.slice(i, i + 3), ...tris.slice(i + 6, i + 9), ...tris.slice(i + 3, i + 6)); } return o; };
  // faces of the hip: the four slopes are above; the roof's up-side is found by the normal's side from the centre
  const o = [];
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i], ay = t[i + 1], az = t[i + 2], bx = t[i + 3], by = t[i + 4], bz = t[i + 5], cx = t[i + 6], cy = t[i + 7], cz = t[i + 8];
    const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay), ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az), nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.hypot(nx, ny, nz) < 1e-9) continue;
    const mx = (ax + bx + cx) / 3 - c[0], mz = (az + bz + cz) / 3 - c[1];
    if (nx * mx + nz * mz + ny * 0.5 >= 0) o.push(ax, ay, az, bx, by, bz, cx, cy, cz); else o.push(ax, ay, az, cx, cy, cz, bx, by, bz);
  }
  void fix;
  ctx.bag.add('tile_grey', fromTriangles(o));
  ctx.bag.add('roof_ridge', box(rl[0], y + r - 0.05, c[1] - 0.15, rr[0], y + r + 0.2, c[1] + 0.15));
  ctx.bag.add('timber_red', box(x0 - 0.05, y - 0.3, z0 - 0.05, x1 + 0.05, y - 0.02, z0 + 0.1)); ctx.bag.add('timber_red', box(x0 - 0.05, y - 0.3, z1 - 0.1, x1 + 0.05, y - 0.02, z1 + 0.05));
}

/** The timber bridge on the street's axis over the stream: log piers, beams, a plank deck, rails. el { z, w }. */
function bridge(el, ctx) {
  const { bag, col } = ctx, z = el.z ?? 0, w = el.w ?? 4.4, rx = riverX(z), x0 = rx - 6.5, x1 = rx + 6.5, y = 0.24;
  bag.add('planks_grey', box(x0, y - 0.18, z - w / 2, x1, y, z + w / 2));
  col.floor([x0, z - w / 2, x1, z + w / 2], y);
  for (const x of [x0 + 0.6, rx - 2.2, rx + 2.2, x1 - 0.6]) for (const s of [-1, 1]) bag.add('timber', rod([x, RIVER.bed - 0.2, z + s * (w / 2 - 0.3)], [x, y - 0.1, z + s * (w / 2 - 0.3)], 0.2, 8));
  for (let x = x0; x < x1 - 0.1; x += 0.3) bag.add('timber', box(x + 0.02, y, z - w / 2, x + 0.26, y + 0.02, z + w / 2));
  for (const s of [-1, 1]) {
    const zz = z + s * (w / 2 - 0.08);
    bag.add('timber_red', box(x0, y + 0.95, zz - 0.05, x1, y + 1.05, zz + 0.05)); bag.add('timber_red', box(x0, y + 0.45, zz - 0.04, x1, y + 0.52, zz + 0.04));
    for (let x = x0 + 0.3; x <= x1 - 0.2; x += 1.6) bag.add('timber_red', box(x - 0.06, y, zz - 0.06, x + 0.06, y + 1.05, zz + 0.06));
    col.segment([x0, zz], [x1, zz], 0.12, y, y + 1.1);
  }
}

/** The Daquan's stream: a water strip along the bed. */
function stream(el, { bag }) {
  const t = [], n = Math.round(2 * ZEND / 2), y = RIVER.water, w = RIVER.w / 2 - 0.2;
  for (let k = 0; k < n; k++) {
    const z0 = -ZEND + k * 2, z1 = z0 + 2.02, a = riverX(z0), b = riverX(z1);
    quad(t, [a - w, y, z0], [a - w, y, z1], [b - w, y, z1], [b - w, y, z0]);
    t.length -= 18; quad(t, [a - w, y, z0], [b - w, y, z1], [b + w, y, z1], [a + w, y, z0]);
  }
  const o = [];
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2], ny = uz * vx - ux * vz;
    if (ny >= 0) o.push(...t.slice(i, i + 9)); else o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6));
  }
  bag.add('water', fromTriangles(o));
}
/** Crescent Spring: the water in 1 m cells of the crescent; stones and tamarisk are planting. */
function spring(el, { bag }) {
  const t = [], [cx, cz] = SPRING.c, y = -0.15;
  for (let x = cx - 16; x < cx + 17; x++) for (let z = cz - 16; z < cz + 17; z++) {
    if (!crescent(x + 0.5, z + 0.5, -0.6)) continue;
    t.push(x, y, z, x, y, z + 1, x + 1, y, z + 1, x, y, z, x + 1, y, z + 1, x + 1, y, z);
  }
  const o = [];
  for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; if (uz * vx - ux * vz >= 0) o.push(...t.slice(i, i + 9)); else o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); }
  bag.add('water', fromTriangles(o));
}

/** An awning over a stall row: poles, a ridge pole and cloth, from a to b along the street, facing `dir`. */
function awning(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, d = el.depth ?? 2.2, dir = el.dir ?? [0, 1], h = el.h ?? 2.5, cloth = el.cloth ?? 'cloth_ochre';
  const horizA = Math.abs(bx - ax) > Math.abs(bz - az), L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 3)), ux = (bx - ax) / L, uz = (bz - az) / L;
  for (let k = 0; k <= n; k++) {
    const x = ax + ux * L * k / n, z = az + uz * L * k / n;
    if (!(el.gaps || []).some((g) => (horizA ? x : z) > g[0] && (horizA ? x : z) < g[1])) { bag.add('timber', rod([x, 0, z], [x, h, z], 0.06, 6)); col.circle(x, z, 0.08, 0, h); }
    bag.add('timber', rod([x + dir[0] * d, 0, z + dir[1] * d], [x + dir[0] * d, h - 0.4, z + dir[1] * d], 0.05, 6));
  }
  const t = [], A = [ax, h, az], B = [bx, h, bz], C = [bx + dir[0] * d, h - 0.4, bz + dir[1] * d], D = [ax + dir[0] * d, h - 0.4, az + dir[1] * d];
  quad(t, A, B, C, D); quad(t, [D[0], D[1] - 0.1, D[2]], [C[0], C[1] - 0.1, C[2]], [B[0], B[1] - 0.1, B[2]], [A[0], A[1] - 0.1, A[2]]);
  bag.add(cloth + '+wind', fromTriangles(t));
}

/**
 * dh_serai { x0, z0, x1, z1 }: the caravanserai, entered by the gate in its north wall: rooms along the west side
 * (the third of them furnished and open: kang, rugs, bales, a lamp), open stalls for the animals along the east
 * side with their mangers, a long store on the south, a well in the yard.
 */
function serai(el, ctx) {
  const { bag, col } = ctx, { x0, z0, x1, z1 } = el, gx = (x0 + x1) / 2, gw = 2.3, T = 0.7;
  const wall = (r, h = 4.6, m = WALL) => { slab(ctx, m, r, 0, h); };
  // the outer wall; the gate in the north
  wall([x0, z0, gx - gw, z0 + T], 5.0); wall([gx + gw, z0, x1, z0 + T], 5.0);
  slab(ctx, WALL, [gx - gw, z0, gx + gw, z0 + T], 4.4, 5.6, false); col.rect([gx - gw, z0, gx + gw, z0 + T], 4.4, 5.6);
  wall([x0, z1 - T, x1, z1]); wall([x0, z0, x0 + T, z1]); wall([x1 - T, z0, x1, z1]);
  for (const r of [[x0, z0, gx - gw, z0 + T], [gx + gw, z0, x1, z0 + T], [x0, z1 - T, x1, z1], [x0, z0, x0 + T, z1], [x1 - T, z0, x1, z1]]) bag.add('tile_grey', box(r[0] - 0.05, 4.6, r[1] - 0.05, r[2] + 0.05, 4.7, r[3] + 0.05));
  for (const s of [-1, 1]) { bag.add('timber_red', lathe([[0.2, 0], [0.18, 0.1], [0.17, 4.4]], 8, null, gx + s * gw, 0, z0 + 0.35)); }
  gable(ctx, [gx - gw - 0.6, z0 - 0.3, gx + gw + 0.6, z0 + T + 0.4], 5.6, 1.5, 0.5);
  // the gate leaves, swung back against the inside of the wall
  for (const s of [-1, 1]) bag.add('wood_dark', box(Math.min(gx + s * gw, gx + s * (gw + 1.1)), 0, z0 + T, Math.max(gx + s * gw, gx + s * (gw + 1.1)), 3.9, z0 + T + 0.1));
  // the west rooms: six, each 5.5 deep (x) and 5.3 wide (z); their fronts on the yard with a door apiece; flat roofs
  const rx1 = x0 + T + 5.5, zs = z0 + T + 1.5, rw = 5.3;
  for (let k = 0; k < 6; k++) {
    const za = zs + k * rw, zb = za + rw;
    if (zb > z1 - T - 1) break;
    const furnished = k === 2, zm = (za + zb) / 2;
    slab(ctx, WALL, [x0 + T, za, rx1, za + 0.4], 0, 3.6);                 // the partition (on the north side of each room)
    if (furnished) { slab(ctx, WALL, [rx1 - 0.4, za, rx1, zm - 0.7], 0, 3.6); slab(ctx, WALL, [rx1 - 0.4, zm + 0.7, rx1, zb], 0, 3.6); slab(ctx, WALL, [rx1 - 0.4, zm - 0.7, rx1, zm + 0.7], 2.1, 3.6, false); col.rect([rx1 - 0.4, zm - 0.7, rx1, zm + 0.7], 2.1, 3.6); }
    else slab(ctx, WALL, [rx1 - 0.4, za, rx1, zb], 0, 3.6);
  }
  void rx1;
  rooms(ctx, el, zs, rw, x0 + T, rx1);
  // the stalls: the east side, open to the yard
  const sx0 = x1 - T - 4.6;
  for (let z = z0 + T + 2; z < z1 - T - 6; z += 4.5) {
    for (const zz of [z, z + 4.5]) bag.add('timber', lathe([[0.15, 0], [0.13, 0.1], [0.12, 2.8]], 7, null, sx0 + 0.1, 0, zz));
    bag.add('timber', lathe([[0.15, 0], [0.13, 0.1], [0.12, 3.3]], 7, null, x1 - T - 0.2, 0, z)); col.circle(sx0 + 0.1, z, 0.15, 0, 2.8);
    bag.add('timber', box(sx0 + 0.3, 0.7, z + 3.6, x1 - T - 0.6, 0.85, z + 3.76));
    bag.add('timber', box(sx0 + 0.15, 0.5, z + 0.8, sx0 + 0.8, 0.8, z + 3.0));        // the manger
    col.rect([sx0 + 0.15, z + 0.8, sx0 + 0.8, z + 3.0], 0, 0.8);
  }
  { const t = [], ya = 2.8, yb = 3.3, xa = sx0 + 0.1, xb = x1 - T; const A = [xa, ya, z0 + T + 2], B = [xa, ya, z1 - T - 6], C = [xb, yb, z1 - T - 6], D = [xb, yb, z0 + T + 2]; quad(t, A, D, C, B); bag.add('thatch', fromTriangles(t)); const u = []; quad(u, B, C, D, A); bag.add('timber', fromTriangles(u.map((v, i) => (i % 3 === 1 ? v - 0.12 : v)))); }
  // the store on the south: a long closed hall with a wide door on the yard
  const zt = z1 - T - 6;
  slab(ctx, WALL, [x0 + T + 6, zt, gx - 3, zt + 0.5], 0, 4.0); slab(ctx, WALL, [gx + 3, zt, sx0 - 0.5, zt + 0.5], 0, 4.0);
  slab(ctx, WALL, [x0 + T + 6, zt, x0 + T + 6.5, z1 - T], 0, 4.0); slab(ctx, WALL, [sx0 - 1.0, zt, sx0 - 0.5, z1 - T], 0, 4.0);
  slab(ctx, WALL, [x0 + T + 6, zt, sx0 - 0.5, z1 - T], 4.0, 4.3, false);
  slab(ctx, WALL, [gx - 3, zt, gx + 3, zt + 0.5], 3.3, 4.0, false);
  for (const s of [-1, 1]) bag.add('timber_red', box(gx + s * 3 - 0.1, 0, zt - 0.05, gx + s * 3 + 0.1, 3.4, zt + 0.55));
  bag.add('timber_red', box(gx - 3, 3.2, zt - 0.05, gx + 3, 3.45, zt + 0.55));
  // the well in the yard: a ring of stone, a windlass post with a bucket
  const wx = gx, wz = (z0 + zt) / 2 + 2;
  bag.add('granite_block', lathe([[0.9, 0], [0.9, 0.7], [0.6, 0.7], [0.6, 0.0]], 12, null, wx, 0, wz)); col.circle(wx, wz, 0.95, 0, 0.7);
  for (const s of [-1, 1]) bag.add('timber', rod([wx + s * 0.8, 0, wz], [wx + s * 0.8, 1.9, wz], 0.07, 6));
  bag.add('timber', rod([wx - 0.8, 1.9, wz], [wx + 0.8, 1.9, wz], 0.06, 6));
  bag.add('timber', lathe([[0.15, 0], [0.18, 0.2], [0.001, 0.2]], 8, null, wx + 0.4, 1.0, wz));
}
/** The west rooms' fronts: a wall of earth with a door each; the furnished room's opened and fitted. */
function rooms(ctx, el, zs, rw, wx0, rx1) {
  const { bag, col } = ctx, { z1 } = el;
  for (let k = 0; k < 6; k++) {
    const za = zs + k * rw, zb = za + rw, zm = (za + zb) / 2;
    if (zb > z1 - 0.7 - 1) break;
    // (the plain front wall of the previous loop is replaced here for the furnished room's door: the wall pieces beside the opening)
    const furnished = k === 2;
    // the roof: flat, with a parapet; the beams' ends along the yard side
    slab(ctx, FOOT, [wx0, za, rx1, zb], 3.6, 3.85, false);
    bag.add(WALL, box(rx1 - 0.3, 3.85, za, rx1, 4.3, zb));
    bag.add('timber', box(rx1 - 0.2, 3.3, za + 0.3, rx1 + 0.35, 3.45, za + 0.45)); bag.add('timber', box(rx1 - 0.2, 3.3, zb - 0.45, rx1 + 0.35, 3.45, zb - 0.3));
    bag.add('timber_red', box(rx1 - 0.06, 0, zm - 0.7 - 0.12, rx1 + 0.12, 2.1, zm - 0.7)); bag.add('timber_red', box(rx1 - 0.06, 0, zm + 0.7, rx1 + 0.12, 2.1, zm + 0.82)); bag.add('timber_red', box(rx1 - 0.06, 2.1, zm - 0.82, rx1 + 0.12, 2.24, zm + 0.82));
    if (!furnished) bag.add('wood_dark', box(rx1 - 0.02, 0, zm - 0.7, rx1 + 0.06, 2.1, zm + 0.7));
    else furnish(ctx, wx0, za, rx1, zb, zm);
    // the door opening in this room's front: the wall pieces beside it
    void col;
  }
}
function furnish(ctx, x0, za, x1, zb, zm) {
  const { bag, col } = ctx;
  bag.add('reed_mat', box(x0 + 1.9, 0.0, za + 0.6, x1 - 0.5, 0.03, zb - 0.6));
  bag.add('cloth_red', box(x0 + 2.4, 0.03, zm - 1.0, x1 - 1.2, 0.05, zm + 1.0));
  slab(ctx, 'mudbrick', [x0, za + 0.4, x0 + 2.0, zb], 0, 0.55); col.floor([x0, za + 0.4, x0 + 2.0, zb], 0.55);
  bag.add('cloth_blue', box(x0 + 0.05, 0.55, za + 0.6, x0 + 1.95, 0.6, zb - 0.2)); bag.add('cloth_ochre', box(x0 + 0.1, 0.6, za + 0.7, x0 + 1.6, 0.66, za + 1.9));
  for (const [dx, dz, c] of [[0.5, 1.0, 'cloth_brown'], [1.1, 0.5, 'cloth_black'], [0.4, 2.6, 'cloth_brown']]) bag.add(c, box(x0 + 2.1 + dx, 0.03, za + 0.7 + dz, x0 + 2.9 + dx, 0.5, za + 1.3 + dz));
  slab(ctx, 'timber', [x0 + 2.2, zb - 1.3, x0 + 3.5, zb - 0.6], 0, 0.7);
  bag.add('pottery_dark', lathe([[0.001, 0], [0.18, 0.02], [0.26, 0.22], [0.2, 0.45], [0.12, 0.5], [0.001, 0.5]], 10, null, x0 + 0.9, 0.55, za + 0.6));
  oilLamp(ctx, x0 + 3.0, 0.7, zb - 0.95, 0.35, 2.4, 8);
  ctx.lights?.push({ at: [x0 + 2.6, 2.3, zm], color: '#ffc27a', intensity: 1.8, distance: 7 });
  bag.add('timber', box(x0, 3.4, za, x1, 3.55, za + 0.15)); for (let k = 0; k < 5; k++) bag.add('timber', box(x0 + 0.5 + k * 1.0, 3.3, za, x0 + 0.62 + k * 1.0, 3.45, zb));
  figure({ at: [x0 + 1.0, zm + 0.4], y: 0.6, rot: -Math.PI / 2, seed: 33, dress: 'tunic', legs: 'hose', cloth: 'cloth_blue', cloth2: 'cloth_red', pose: 'cross', hat: 'cap', over: 'belt', skin: 'skin_medium', beard: true, feet: 'shod' }, ctx);
}

/** dh_scaffold { at, w, h, levels }: poles lashed with rope, plank platforms at each level, ladders; against the face (x < at.x). */
function scaffold(el, { bag, col }) {
  const [ax, az] = el.at, w = el.w ?? 6, h = el.h ?? 6, n = el.levels ?? 3, lv = h / n, out = 1.4;
  for (let k = 0; k <= Math.round(w / 2.2); k++) {
    const z = az - w / 2 + k * (w / Math.round(w / 2.2));
    bag.add('log_pine', rod([ax + out, 0, z], [ax + out, h + 1.0, z], 0.06, 6)); col.circle(ax + out, z, 0.07, 0, h + 1);
    for (let j = 1; j <= n; j++) bag.add('log_pine', rod([ax, j * lv - 0.1, z], [ax + out, j * lv - 0.1, z], 0.045, 5));
  }
  for (let j = 1; j <= n; j++) { bag.add('planks_grey', box(ax - 0.05, j * lv - 0.08, az - w / 2, ax + out + 0.1, j * lv, az + w / 2)); col.floor([ax - 0.05, az - w / 2, ax + out + 0.1, az + w / 2], j * lv); bag.add('log_pine', rod([ax + out, j * lv + 0.9, az - w / 2], [ax + out, j * lv + 0.9, az + w / 2], 0.04, 5)); }
  for (let j = 0; j < n; j++) { const z = az - w / 2 + 0.4 + (j % 2) * 1.0; bag.add('log_pine', rod([ax + out + 0.6, j * lv, z], [ax + out + 0.1, (j + 1) * lv + 0.4, z], 0.04, 5)); }
  for (let j = 1; j < n * 3; j++) for (const z of [az - w / 2 + 0.2]) bag.add('rope_fibre', box(ax + out - 0.07, j * lv / 3, z - 0.07, ax + out + 0.07, j * lv / 3 + 0.04, z + 0.07));
}
const house2 = makeHouse({ frame, gable });
export const TOWN_ELEMENTS = { dh_scaffold: scaffold, dh_serai: serai, dh_house: house2, dh_wall: wallEl, dh_gate: gate, dh_bridge: bridge, dh_stream: stream, dh_spring: spring, dh_awning: awning };
export { frame, slab, gable, door, window, hip, oilLamp, figure };
