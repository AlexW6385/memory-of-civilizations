// Eye-level dressing of Cahokia's houses (docs/settlements/cahokia.md §5.7): what stands about a
// house door — the porch arbor, jars, firewood, a hide stretched on its frame, the mortar, maize and
// gourds hung under the eaves, a hoe or paddle leaning on the wall, a log bench, a sleeping mat — and
// the marks of weather and use on the walls; the lean-to store at a house's end, the smoke-hole in
// its roof; the wattle fence of a courtyard. Everything is placed from the house's seed, and the
// house's own ground, so no two fronts are alike [inferred: the arrangement; the things themselves
// from the Illinois State Museum's RiverWeb pages on Mississippian houses, storage and cooking].
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { WALL, TH, rng, tri } from './kit.js';

export const gy = (el, x, z) => (typeof el.g === 'function' ? el.g(x, z) : el.y ?? 0);
/** A jar of dark shell-tempered ware, k its scale, standing at (x, y, z). */
export function jar(bag, x, y, z, k, mat = 'pottery_dark') {
  bag.add(mat, lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.13], [0.21, 0.24], [0.16, 0.33], [0.15, 0.37], [0.165, 0.39], [0.14, 0.39], [0.13, 0.35], [0.001, 0.34]].map(([r, h]) => [r * k, h * k]), 10, null, x, y, z));
}
const ears = (bag, x, y, z, n, rand) => {
  for (let e = 0; e < n; e++) { const a = e * 2.1 + rand(); bag.add(e % 3 ? 'cloth_ochre' : 'paint_ochre', lathe([[0.001, 0], [0.03, 0.04], [0.035, 0.12], [0.02, 0.17], [0.001, 0.18]], 6, null, x + Math.cos(a) * 0.05, y, z + Math.sin(a) * 0.05)); }
};
/** A flat quad pair (both faces) through four corners. */
export function slab(bag, mat, a, b, c, d, th = 0.12) {
  const T = [], up = [0, 1, 0], dn = [0, -1, 0], sh = (p, k) => [p[0], p[1] + k, p[2]];
  tri(T, sh(a, th), sh(b, th), sh(c, th), up); tri(T, sh(a, th), sh(c, th), sh(d, th), up);
  tri(T, a, b, c, dn); tri(T, a, c, d, dn);
  for (const [p, q] of [[a, b], [b, c], [c, d], [d, a]]) { tri(T, p, q, sh(q, th), [0, 0, 0.001]); tri(T, p, sh(q, th), sh(p, th), [0, 0, 0.001]); }
  bag.add(mat, fromTriangles(T));
}

/**
 * Dress the front of a house. g: { x0, z0, x1, z1 (the walls), y, f (the door wall's z), sg (+1 door
 * on the south, −1 north), mx (door x), wh (wall height), seed, lod (0 near, 1 middle, 2 far) }.
 */
export function dressHouse({ bag, col }, el, g) {
  const { x0, z0, x1, z1, y, f, sg, mx, wh } = g, dz = g.skin ? 0.04 : 0.012, d0 = g.skin ? 0.025 : 0, rand = rng((g.seed | 0) + 4141), lod = g.lod ?? 0, G = y - 0.18;
  const side = rand() < 0.5 ? 1 : -1, pick = (p) => rand() < p;
  const P = (u, v) => [mx + u, f + sg * v];
  // an opened house's doorway is walked: nothing of the dressing stands within DOOR m (the door's half-width and the walker's body, and a 0.5 m cell of the collision raster) of its middle; what would is moved out along u
  const DOOR = el.open ? 1.35 : 0, clear = (a, b, dir) => (!DOOR || b <= -DOOR || a >= DOOR ? 0 : (dir || ((a + b) / 2 < 0 ? -1 : 1)) > 0 ? DOOR - a : -DOOR - b);
  const yb = (u, v) => Math.min(y, gy(el, ...P(u, v))) - 0.08;
  // the soot over the door and the marks of the roof's drip: dark and pale clay patches on the walls
  bag.add('bark_dark', box(mx - 0.55, y + (el.open ? 2.4 : 1.78), Math.min(f + sg * d0, f + sg * dz), mx + 0.55, y + wh - 0.04, Math.max(f + sg * d0, f + sg * dz)));
  if (lod < 2) {
    for (let k = 0; k < 3; k++) {
      const w = 0.5 + rand() * 0.7, h = 0.4 + rand() * 0.5, u = (rand() - 0.5) * (x1 - x0 - 1.4) - (Math.abs(rand() - 0.5) < 0.1 ? 1 : 0), yy = y + 0.3 + rand() * (wh - 1.1);
      if (Math.abs(u) < 1.0) continue;
      const du = clear(u - w / 2, u + w / 2);
      if (du && Math.abs(u + du) + w / 2 > (x1 - x0) / 2) continue;
      const q = f + sg * dz, p0 = f + sg * d0, z = Math.min(p0, q), zz = Math.max(p0, q);
      bag.add(k % 2 ? 'earth_wall' : 'silt', box(mx + u + du - w / 2, yy, z, mx + u + du + w / 2, yy + h, zz));
    }
    // the back wall: a long damp stain along its foot
    const bz = f - sg * (z1 - z0);
    bag.add('bark_dark', box(x0 + 0.3, y - 0.02, Math.min(bz - sg * d0, bz - sg * dz), x1 - 0.3, y + 0.38, Math.max(bz - sg * d0, bz - sg * dz)));
  }
  if (lod >= 2) {                                              // far houses: the three things that read from afar
    jar(bag, mx + side * 1.3, yb(side * 1.3, 0.5), P(side * 1.3, 0.5)[1], 1.3); jar(bag, mx + side * 1.75, yb(side * 1.75, 0.45), P(side * 1.75, 0.45)[1], 0.95);
    return;
  }
  // the porch arbor: two posts, a beam, a shallow lean-to of thatch on poles over the door
  if (pick(0.38) && !el.open) {   // (not over an opened house's door: the walker's head passes under its lintel at 2.1 m, the porch's thatch lay at 2.05)
    const pw = 1.5 + rand() * 0.5, pd = 1.7 + rand() * 0.4, hp = 2.05;
    for (const s of [-1, 1]) { const [px, pz] = P(s * pw, pd); bag.add('timber', rod([px, yb(s * pw, pd) - 0.3, pz], [px, y + hp, pz], 0.075, 7)); col.circle(px, pz, 0.08, y - 0.3, y + hp); }
    const a = P(-pw - 0.35, pd + 0.3), b = P(pw + 0.35, pd + 0.3), c = P(pw + 0.35, -0.1), d = P(-pw - 0.35, -0.1);
    bag.add('timber', rod([a[0] + 0.3, y + hp - 0.04, a[1] - sg * 0.3], [b[0] - 0.3, y + hp - 0.04, b[1] - sg * 0.3], 0.07, 6));
    slab(bag, TH, [a[0], y + hp, a[1]], [b[0], y + hp, b[1]], [c[0], y + hp + 0.38, c[1]], [d[0], y + hp + 0.38, d[1]], 0.1);
    for (let k = 0; k < 5; k++) { const u = -pw + (2 * pw) * k / 4, p = P(u, pd), q = P(u, 0); bag.add('timber', rod([p[0], y + hp - 0.02, p[1]], [q[0], y + hp + 0.36, q[1]], 0.03, 5)); }
    if (pick(0.7)) { const pz = P(0, pd - 0.1); for (let k = 0; k < 3; k++) { const u = (k - 1) * 0.5; ears(bag, mx + u, y + hp - 0.62, pz[1], 3, rand); bag.add('linen', rod([mx + u, y + hp - 0.05, pz[1]], [mx + u, y + hp - 0.44, pz[1]], 0.008, 4)); } }
  }
  // jars by the door
  const nj = 1 + Math.floor(rand() * 3);
  for (let k = 0; k < nj; k++) { const u = side * (0.95 + (el.open ? 0.5 : 0) + k * 0.42 + rand() * 0.15), v = 0.3 + rand() * 0.6, p = P(u, v); jar(bag, p[0], yb(u, v), p[1], 0.9 + rand() * 0.9, k === 2 ? 'terracotta' : 'pottery_dark'); }
  // firewood stacked against a corner of the wall
  if (pick(0.5)) {
    const e = pick(0.5) ? 1 : -1, ln = 1.1 + rand() * 0.5, ex0 = e > 0 ? x1 - 1.0 : x0 + 1.0, ex = ex0 + clear(ex0 - mx - ln / 2 - 0.1, ex0 - mx + ln / 2 + 0.1, e);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 5 - r; k++) { const v = 0.18 + (k + r * 0.5) * 0.17; bag.add('log_pine', rod([ex - ln / 2, y - 0.06 + r * 0.14 + 0.07, f + sg * v], [ex + ln / 2, y - 0.06 + r * 0.14 + 0.07, f + sg * v], 0.07, 6)); }
    col.rect([ex - ln / 2, Math.min(f, f + sg * 1.0), ex + ln / 2, Math.max(f, f + sg * 1.0)], y - 0.1, y + 0.6);
  }
  // a hide stretched on its frame of poles, leaning against the wall at the side
  if (pick(0.3)) {
    const e = -side, ex0 = e > 0 ? x1 - 0.9 : x0 + 0.9, ex = ex0 + clear(ex0 - mx - 0.6, ex0 - mx + 0.6, e), v = 0.95, ym = y + 1.0;
    for (const dx of [-0.5, 0.5]) bag.add('timber', rod([ex + dx, y - 0.2, f + sg * (v + 0.05)], [ex + dx, y + 1.75, f + sg * (v + 0.05)], 0.03, 5));
    for (const hh of [0.15, 1.7]) bag.add('timber', rod([ex - 0.55, y + hh, f + sg * (v + 0.05)], [ex + 0.55, y + hh, f + sg * (v + 0.05)], 0.028, 5));
    bag.add(pick(0.5) ? 'hide_tan' : 'hide_brown', box(ex - 0.46, y + 0.22, Math.min(f + sg * v, f + sg * (v + 0.025)), ex + 0.46, y + 1.62, Math.max(f + sg * v, f + sg * (v + 0.025))));
    for (let k = 0; k < 6; k++) bag.add('linen', rod([ex - 0.5 + k * 0.2, y + 0.2, f + sg * (v + 0.04)], [ex - 0.46 + k * 0.2, y + 0.05, f + sg * (v + 0.04)], 0.008, 4));
    void ym;
  }
  // the mortar of a log, its pestle in it
  if (pick(0.28)) {
    const u0 = -side * (1.3 + rand() * 0.4), u = u0 + clear(u0 - 0.35, u0 + 0.35), v = 0.8, p = P(u, v), yy = yb(u, v);
    bag.add('timber', lathe([[0.001, 0], [0.2, 0], [0.19, 0.55], [0.15, 0.58], [0.12, 0.34], [0.001, 0.34]], 8, null, p[0], yy, p[1]));
    bag.add('timber', rod([p[0], yy + 0.36, p[1]], [p[0] + 0.06, yy + 1.3, p[1] - 0.03], 0.035, 6));
    col.circle(p[0], p[1], 0.2, yy, yy + 0.55);
  }
  // maize and gourds in bunches hung under the eaves along the front wall
  if (pick(0.5)) {
    const n = 3 + Math.floor(rand() * 4), u0 = side * (1.0 + rand() * 0.3);
    bag.add('timber', rod([mx + u0, y + wh - 0.28, f + sg * 0.16], [mx + u0 + side * (0.4 * n), y + wh - 0.28, f + sg * 0.16], 0.02, 5));
    for (let k = 0; k < n; k++) { const u = u0 + side * (0.2 + 0.4 * k); bag.add('linen', rod([mx + u, y + wh - 0.28, f + sg * 0.16], [mx + u, y + wh - 0.62, f + sg * 0.16], 0.008, 4)); ears(bag, mx + u, y + wh - 0.82, f + sg * 0.16, 3, rand); }
  }
  // a hoe or a paddle leaning on the wall
  if (pick(0.28)) {
    const u = side * (x1 - x0) * 0.32, p = P(u, 0.12), hoe = pick(0.5);
    bag.add('timber', rod([p[0], y - 0.1, p[1] + sg * 0.1], [p[0] + 0.05, y + (hoe ? 1.35 : 1.7), p[1]], 0.022, 5));
    if (hoe) bag.add('flagstone', box(p[0] - 0.01, y + 1.25, Math.min(p[1], p[1] + sg * 0.14), p[0] + 0.12, y + 1.38, Math.max(p[1], p[1] + sg * 0.14))); else bag.add('timber', box(p[0] - 0.1, y + 1.3, p[1] - 0.02, p[0] + 0.1, y + 1.78, p[1] + 0.02));
  }
  // a log bench by the wall, a sleeping mat laid out
  if (pick(0.3)) {
    const u0 = -side * (1.8 + rand() * 0.5), u = u0 + clear(u0 - 0.3, u0 + 1.7, -side), p = P(u, 0.55), q = P(u + 1.4, 0.55), yy = yb(u, 0.55);
    bag.add('log_pine', rod([p[0], yy + 0.26, p[1]], [q[0], yy + 0.26, q[1]], 0.15, 7));
    for (const s of [p, q]) bag.add('timber', rod([s[0], yy - 0.1, s[1]], [s[0], yy + 0.2, s[1]], 0.05, 5));
    col.segment([p[0], p[1]], [q[0], q[1]], 0.3, yy, yy + 0.42);
    if (pick(0.5)) { bag.add('reed_mat', box(p[0] + 0.15, yy + 0.4, p[1] - 0.2, p[0] + 1.25, yy + 0.43, p[1] + 0.2)); bag.add('hide_brown', box(p[0] + 0.5, yy + 0.43, p[1] - 0.17, p[0] + 1.1, yy + 0.47, p[1] + 0.17)); }
  }
  // a basket hung on a peg of the wall
  if (pick(0.22)) {
    const u = side * (1.0 + rand() * 1.0) + (side > 0 ? 0 : 0), p = P(u, 0.2);
    bag.add('timber', rod([p[0], y + 1.5, f + sg * 0.02], [p[0], y + 1.5, f + sg * 0.22], 0.02, 5));
    bag.add('wicker', lathe([[0.001, 0], [0.14, 0.01], [0.18, 0.12], [0.16, 0.22], [0.001, 0.2]], 8, null, p[0], y + 1.3, f + sg * 0.22));
  }
  // a dog's bed: a heap of grass against the wall
  if (pick(0.12)) { const p = P(-side * 0.9, 0.5); bag.add(TH, lathe([[0.5, 0], [0.44, 0.1], [0.2, 0.18], [0.001, 0.2]], 8, null, p[0], yb(-side * 0.9, 0.5), p[1])); }
  // the smoke-hole: a hood of thatch over a gap in the roof beside the ridge (some houses)
  if (g.smoke && pick(0.55)) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ry = y + wh + g.rise;
    bag.add('opening', box(cx - 0.3, ry - 0.55, cz - 0.3, cx + 0.3, ry - 0.5, cz + 0.3));
    bag.add('bark_dark', box(cx - 0.34, ry - 0.52, cz - 0.34, cx + 0.34, ry - 0.46, cz + 0.34));
  }
}

/** A lean-to store at the end of a house: low walls of clay, a single slope of thatch up the house's wall, a low door. */
export function leanTo({ bag, col }, el, g) {
  const { x0, z0, x1, z1, y, foot, wh, end } = g, w = 1.9, hh = 1.35, rand = rng((g.seed | 0) + 77);
  const xa = end > 0 ? x1 : x0 - w, xb = end > 0 ? x1 + w : x0, za = z0 + 0.5, zb = z1 - 0.3, xo = end > 0 ? xb : xa;
  bag.add(WALL, box(xa, foot, za, xb, y + hh, zb)); col.rect([xa, za, xb, zb], foot, y + hh);
  bag.add('silt', box(xa - 0.2, foot, za - 0.2, xb + 0.2, y + 0.3, zb + 0.2));
  const hi = y + wh - 0.4, o = 0.45, E = end > 0 ? 1 : -1;
  slab(bag, TH, [xo + E * o, y + hh - 0.1, za - o], [xo + E * o, y + hh - 0.1, zb + o], [xo - E * (w + 0.1), hi, zb + o], [xo - E * (w + 0.1), hi, za - o], 0.22);
  const dz = pick(rand, 0.5) ? zb : za, s = dz === zb ? 1 : -1, dm = (xa + xb) / 2;
  bag.add('opening', box(dm - 0.3, y, Math.min(dz, dz + s * 0.02), dm + 0.3, y + 1.05, Math.max(dz, dz + s * 0.02)));
  for (const sd of [-1, 1]) bag.add('timber', rod([dm + sd * 0.36, y - 0.1, dz + s * 0.06], [dm + sd * 0.36, y + 1.15, dz + s * 0.06], 0.05, 6));
  bag.add('timber', rod([dm - 0.45, y + 1.12, dz + s * 0.06], [dm + 0.45, y + 1.12, dz + s * 0.06], 0.045, 6));
  void el;
}
const pick = (rand, p) => rand() < p;

/** A wattle fence from a to b: stakes every 0.7 m, withies woven between, 1.1 m high. */
export function wattle(bag, col, a, b, yAt, h = 1.1) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (L < 0.3) return;
  const n = Math.max(1, Math.round(L / 0.8)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let k = 0; k <= n; k++) { const x = a[0] + (b[0] - a[0]) * k / n, z = a[1] + (b[1] - a[1]) * k / n, yy = yAt(x, z); bag.add('timber', rod([x, yy - 0.2, z], [x, yy + h + (k % 3) * 0.06, z], 0.032, 5)); }
  const ym = yAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  const nx = -uz * 0.02, nz = ux * 0.02;
  for (let r = 0; r < 3; r++) bag.add('wicker', box(Math.min(a[0], b[0]) - 0.03 + (nx ? 0 : 0), ym + 0.1 + r * 0.33, Math.min(a[1], b[1]) - 0.03, Math.max(a[0], b[0]) + 0.03, ym + 0.27 + r * 0.33, Math.max(a[1], b[1]) + 0.03));
  col.segment(a, b, 0.12, ym - 0.2, ym + h);
  void nx; void nz;
}
export { ears };

/** The kinds of furnished house: what its household does (docs §5.7). g: { x0, z0, x1, z1, t, F, cx, cz, top, hx, hz }. */
export const HOUSE_KINDS = ['cook', 'weaver', 'knapper', 'shell', 'storage', 'drum', 'potter', 'basket', 'hide', 'fisher'];
export function furnishKind({ bag, col }, el, g, kind) {
  const { x0, z0, x1, z1, t, F, cx, cz, top, hx, hz } = g, rand = rng((el.seed | 0) + 909), wallN = z0 + t + 0.03, wallE = x1 - t - 0.03, wallW = x0 + t + 0.03;
  const hang = (x, y0, y1, z, mat = 'linen', r = 0.008) => bag.add(mat, rod([x, y0, z], [x, y1, z], r, 4));
  if (kind === 'cook') {
    // a pot hung over the fire from a tripod of poles; fish split and strung on a rod under the rafters
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.4; bag.add('timber', rod([hx + Math.cos(a) * 0.62, F, hz + Math.sin(a) * 0.62], [hx, F + 1.25, hz], 0.03, 5)); }
    hang(hx, F + 0.62, F + 1.2, hz);
    bag.add('pottery_dark', lathe([[0.001, 0], [0.1, 0.02], [0.17, 0.1], [0.19, 0.2], [0.14, 0.27], [0.15, 0.3], [0.001, 0.3]], 10, null, hx, F + 0.34, hz));
    bag.add('timber', rod([x0 + t + 0.3, top - 0.35, cz - 0.9], [x0 + t + 1.9, top - 0.35, cz - 0.9], 0.025, 5));
    for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'hide_grey' : 'hide_brown', box(x0 + t + 0.4 + k * 0.26, top - 0.95, cz - 0.93, x0 + t + 0.46 + k * 0.26, top - 0.38, cz - 0.87));
  } else if (kind === 'weaver') {
    // a bar under the rafters along the back wall, the warp hanging from it, a band of cloth woven down from the bar
    const a = x0 + t + 0.5, b = x1 - t - 0.5, zz = wallN + 0.14;
    bag.add('timber', rod([a, F + 2.05, zz], [b, F + 2.05, zz], 0.03, 6));
    for (const x of [a, b]) bag.add('timber', rod([x, F + 0.5, zz], [x, F + 2.1, zz], 0.035, 6));
    for (let x = a + 0.15; x < b - 0.4; x += 0.09) hang(x, F + 1.05, F + 2.03, zz, 'linen', 0.006);
    const w0 = a + 0.5, w1 = Math.min(b - 0.5, a + 2.1);
    for (let k = 0; k < 5; k++) bag.add(['cloth_ochre', 'cloth_black', 'linen', 'cloth_red', 'cloth_ochre'][k], box(w0, F + 1.3 + k * 0.1, zz - 0.015, w1, F + 1.4 + k * 0.1, zz + 0.015));
    for (let k = 0; k < 4; k++) bag.add('linen', lathe([[0.001, 0], [0.06, 0.02], [0.07, 0.07], [0.001, 0.1]], 7, null, b - 0.3 - k * 0.22, F + 0.49, wallN + 0.5));
    bag.add('wicker', lathe([[0.001, 0], [0.2, 0.01], [0.24, 0.14], [0.22, 0.14], [0.001, 0.05]], 10, null, wallE - 0.45, F, cz + 0.8));
  } else if (kind === 'knapper') {
    // a hide on the floor, the heap of chert flakes on it, cores, an antler hammer; bows and arrows on the east wall
    const px = wallW + 0.55, pz = z0 + t + 1.55;
    bag.add('hide_brown', box(px, F + 0.0, pz, px + 1.0, F + 0.025, pz + 0.75));
    for (let k = 0; k < 16; k++) bag.add(k % 4 ? 'flagstone' : 'granite_grey', box(px + 0.1 + rand() * 0.7, F + 0.025, pz + 0.08 + rand() * 0.55, px + 0.16 + rand() * 0.7, F + 0.05 + rand() * 0.03, pz + 0.12 + rand() * 0.55));
    bag.add('flagstone', lathe([[0.001, 0], [0.1, 0.01], [0.12, 0.08], [0.06, 0.13], [0.001, 0.14]], 6, null, px + 0.7, F + 0.025, pz + 0.3));
    bag.add('timber', rod([px + 0.2, F + 0.045, pz + 0.65], [px + 0.5, F + 0.07, pz + 0.7], 0.022, 5));
    for (let k = 0; k < 3; k++) { const z = cz - 0.5 + k * 0.45; bag.add('timber', rod([wallE - 0.05, F + 0.7, z], [wallE - 0.08, F + 1.95, z + 0.04], 0.025, 5)); }
    bag.add('hide_tan', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.5], [0.001, 0.5]], 8, null, wallE - 0.2, F + 1.0, cz + 1.0));
  } else if (kind === 'shell') {
    // whelk shells heaped on the bench, strings of beads hung on a bar, a slab and a drill on the floor by the door
    const zz = wallN + 0.12;
    bag.add('timber', rod([x0 + t + 0.6, F + 2.0, zz], [x1 - t - 0.6, F + 2.0, zz], 0.025, 5));
    for (let k = 0; k < 8; k++) { const x = x0 + t + 0.8 + k * ((x1 - x0 - 2 * t - 1.6) / 7); hang(x, F + 1.35, F + 2.0, zz); for (let b = 0; b < 7; b++) bag.add(b % 3 ? 'chalk' : 'ivory', lathe([[0.001, 0], [0.02, 0], [0.02, 0.012], [0.001, 0.012]], 8, null, x, F + 1.4 + b * 0.09, zz)); }
    for (let k = 0; k < 8; k++) { const a = rand() * 6.28, r = 0.1 + rand() * 0.3; bag.add(k % 2 ? 'chalk' : 'ivory', lathe([[0.001, 0], [0.08, 0.02], [0.1, 0.09], [0.06, 0.17], [0.001, 0.22]], 7, null, x0 + t + 1.2 + Math.cos(a) * r, F + 0.49, z0 + t + 0.45 + Math.sin(a) * r * 0.5)); }
    bag.add('flagstone', box(x0 + t + 0.3, F, z1 - t - 1.2, x0 + t + 0.95, F + 0.08, z1 - t - 0.7));
  } else if (kind === 'storage') {
    // a row of great jars along the east wall, baskets stacked, squash and fish strung from the rafters
    for (let k = 0; k < 4; k++) { const z = z0 + t + 1.2 + k * 0.62; if (z > z1 - t - 1.0) break; jar(bag, wallE - 0.33, F, z, 2.2 - k * 0.2); col.circle(wallE - 0.33, z, 0.4, F, F + 0.8); }
    for (let k = 0; k < 3; k++) bag.add('wicker', lathe([[0.001, 0], [0.26 - k * 0.03, 0.02], [0.3 - k * 0.03, 0.17], [0.001, 0.17]], 10, null, wallW + 0.45, F + k * 0.17, z1 - t - 0.9));
    bag.add('timber', rod([cx - 1.4, top - 0.4, z0 + t + 0.5], [cx + 1.4, top - 0.4, z0 + t + 0.5], 0.025, 5));
    for (let k = 0; k < 9; k++) { const x = cx - 1.3 + k * 0.32; hang(x, top - 0.4, top - 0.8, z0 + t + 0.5); bag.add(k % 3 ? 'cloth_ochre' : 'paint_ochre', lathe([[0.001, 0], [0.08, 0.04], [0.1, 0.1], [0.06, 0.18], [0.001, 0.2]], 7, null, x, top - 1.0, z0 + t + 0.5)); }
  } else if (kind === 'drum') {
    // a water drum, a rattle of a gourd and a shell on the wall, a second bench of robes along the east wall
    bag.add('pottery_dark', lathe([[0.001, 0], [0.14, 0.01], [0.24, 0.14], [0.26, 0.26], [0.2, 0.34], [0.001, 0.34]], 10, null, wallW + 0.5, F, z0 + t + 1.4));
    bag.add('hide_tan', lathe([[0.2, 0], [0.001, 0.01]], 10, null, wallW + 0.5, F + 0.34, z0 + t + 1.4));
    bag.add('timber', rod([wallE - 0.05, F + 1.35, cz - 0.3], [wallE - 0.05, F + 1.85, cz - 0.3], 0.022, 5));
    bag.add('paint_ochre', lathe([[0.001, 0], [0.07, 0.02], [0.09, 0.09], [0.05, 0.17], [0.001, 0.19]], 8, null, wallE - 0.06, F + 1.2, cz - 0.3));
    for (let k = 0; k < 3; k++) bag.add(k ? 'hide_brown' : 'hide_white', box(wallE - 0.9, F + 0.45 + k * 0.03, z1 - t - 2.4 + k * 0.3, wallE - 0.1, F + 0.48 + k * 0.03, z1 - t - 2.0 + k * 0.3));
    bag.add('reed_mat', box(wallE - 1.0, F + 0.4, z1 - t - 2.5, wallE - 0.05, F + 0.44, z1 - t - 0.9));
  } else if (kind === 'potter') {
    // on the bench: a lump of clay, coils laid in a ring, a half-raised jar, a burnishing pebble; on a plank shelf at the east wall the dried jars and bowls; a basket of crushed shell for the temper [inferred: the arrangement; the ware is shell-tempered, RiverWeb "Ceramic function"]
    const by = F + 0.49, bx = x0 + t + 0.6, bz = z0 + t + 0.45;
    bag.add('earth_wall', lathe([[0.001, 0], [0.2, 0.01], [0.17, 0.1], [0.08, 0.17], [0.001, 0.18]], 9, null, bx, by, bz));
    for (let k = 0; k < 3; k++) bag.add('terracotta', lathe([[0.17, 0], [0.19, 0.02], [0.17, 0.04], [0.001, 0.04]], 12, null, bx + 0.75, by + k * 0.04, bz));
    bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.01], [0.17, 0.1], [0.19, 0.2], [0.17, 0.26], [0.001, 0.26]], 10, null, bx + 1.45, by, bz));
    bag.add('granite_grey', lathe([[0.001, 0], [0.04, 0.005], [0.04, 0.02], [0.001, 0.025]], 6, null, bx + 2.0, by, bz + 0.15));
    const sy = F + 1.35, sa = z0 + t + 1.15, sb = z1 - t - 1.15;
    if (sb - sa > 0.8) {
      bag.add('timber', box(wallE - 0.34, sy, sa, wallE - 0.02, sy + 0.04, sb));
      for (const z of [sa + 0.1, sb - 0.1]) bag.add('timber', rod([wallE - 0.05, sy - 0.3, z], [wallE - 0.2, sy, z], 0.025, 5));
      const n = Math.max(2, Math.floor((sb - sa) / 0.38));
      for (let k = 0; k < n; k++) { const z = sa + 0.2 + k * (sb - sa - 0.3) / Math.max(1, n - 1); if (k % 2) bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.004], [0.11, 0.04], [0.13, 0.08], [0.001, 0.07]], 10, null, wallE - 0.18, sy + 0.04, z)); else jar(bag, wallE - 0.18, sy + 0.04, z, 0.62, 'pottery_dark'); }
    }
    bag.add('wicker', lathe([[0.001, 0], [0.2, 0.01], [0.24, 0.14], [0.22, 0.14], [0.001, 0.05]], 10, null, wallW + 0.4, F, z1 - t - 1.3));
    bag.add('chalk', lathe([[0.001, 0], [0.2, 0], [0.2, 0.01], [0.001, 0.02]], 10, null, wallW + 0.4, F + 0.13, z1 - t - 1.3));
  } else if (kind === 'basket') {
    // cane splints hung in a curtain from a rod along the east wall, a basket half made on the bench with its splints, finished baskets stacked in the corner, a bone awl [inferred: the craft; baskets and mats are among the household's goods]
    const a = z0 + t + 1.05, b = z1 - t - 1.2, zz = Math.max(a + 0.6, b);
    bag.add('timber', rod([wallE - 0.06, F + 1.95, a], [wallE - 0.06, F + 1.95, zz], 0.025, 5));
    for (let z = a + 0.08; z < zz; z += 0.1) bag.add(rand() < 0.5 ? 'wicker' : 'reed_mat', box(wallE - 0.075, F + 1.0 + rand() * 0.15, z, wallE - 0.045, F + 1.95, z + 0.045));
    const bx = x0 + t + 0.8 + (x1 - x0 - 2 * t - 1.6) * 0.45, bz = z0 + t + 0.42, by = F + 0.49;
    bag.add('wicker', lathe([[0.001, 0], [0.14, 0.01], [0.2, 0.1], [0.18, 0.17], [0.15, 0.19]], 12, null, bx, by, bz));
    for (let k = 0; k < 6; k++) { const an = k * 0.9; bag.add('reed_mat', rod([bx + 0.4 + Math.cos(an) * 0.05, by + 0.01 + k * 0.012, bz + 0.1], [bx + 0.95 + Math.cos(an) * 0.05, by + 0.01 + k * 0.012, bz - 0.1 + Math.sin(an) * 0.05], 0.007, 4)); }
    bag.add('ivory', rod([bx - 0.35, by + 0.01, bz + 0.2], [bx - 0.15, by + 0.01, bz + 0.3], 0.008, 4));
    for (let k = 0; k < 4; k++) bag.add('wicker', lathe([[0.001, 0], [0.27 - k * 0.03, 0.02], [0.32 - k * 0.03, 0.17], [0.001, 0.17]], 10, null, wallW + 0.42, F + k * 0.17, z1 - t - 1.25));
  } else if (kind === 'hide') {
    // a hide pegged flat on the north wall above the bench with cords, a folded stack of tanned hides, scrapers of chert and a bone fleshing tool, a second hide stretched on four poles under the rafters to smoke over the fire [inferred; hides are among the goods of the plaza's traders, §5.9]
    const zz = wallN + 0.03, a = x0 + t + 0.7, b = Math.min(x1 - t - 0.7, a + 1.7);
    bag.add('hide_white', box(a, F + 1.0, zz, b, F + 1.95, zz + 0.02));
    for (let k = 0; k <= 5; k++) { const x = a + (b - a) * k / 5; bag.add('linen', rod([x, F + 0.95, zz + 0.01], [x, F + 1.02, zz + 0.03], 0.006, 4)); bag.add('linen', rod([x, F + 1.95, zz + 0.01], [x, F + 2.02, zz + 0.03], 0.006, 4)); }
    for (let k = 0; k < 4; k++) bag.add(k % 2 ? 'hide_brown' : 'hide_tan', box(x1 - t - 1.3, F + 0.49 + k * 0.045, z0 + t + 0.2 + k * 0.02, x1 - t - 0.35, F + 0.53 + k * 0.045, z0 + t + 0.75));
    for (let k = 0; k < 3; k++) bag.add('flagstone', box(a + 1.0 + k * 0.22, F + 0.49, z0 + t + 0.3, a + 1.16 + k * 0.22, F + 0.51, z0 + t + 0.46));
    bag.add('ivory', rod([a + 0.2, F + 0.5, z0 + t + 0.5], [a + 0.65, F + 0.5, z0 + t + 0.6], 0.015, 5));
    const fx1 = Math.min(cx + 1.85, x1 - t - 0.15), fx0 = fx1 - 1.1, fz0 = cz - 0.55, fz1 = cz + 0.45, fy = top - 0.22;
    for (const [x, z] of [[fx0, fz0], [fx1, fz0], [fx1, fz1], [fx0, fz1]]) bag.add('timber', rod([x, fy, z], [x, top - 0.05, z], 0.02, 4));
    for (const [p, q] of [[[fx0, fz0], [fx1, fz0]], [[fx0, fz1], [fx1, fz1]], [[fx0, fz0], [fx0, fz1]], [[fx1, fz0], [fx1, fz1]]]) bag.add('timber', rod([p[0], fy, p[1]], [q[0], fy, q[1]], 0.02, 4));
    bag.add('hide_tan', box(fx0 + 0.04, fy - 0.03, fz0 + 0.04, fx1 - 0.04, fy - 0.01, fz1 - 0.04));
  } else if (kind === 'fisher') {
    // a net hung over the rafters, its weights of fired clay and gourd floats along its edge, a fish trap of withies, a spear and two paddles against the west wall, a string of split fish [inferred: the creek's fishing, §5.10]
    const nx0 = cx - 1.0, nx1 = cx + 1.0, ny1 = top - 0.2, ny0 = ny1 - 0.8, zz = wallN + 0.42;
    bag.add('timber', rod([nx0 - 0.1, ny1, zz], [nx1 + 0.1, ny1, zz], 0.02, 5));
    for (let k = 0; k <= 10; k++) { const x = nx0 + (nx1 - nx0) * k / 10; bag.add('rope_fibre', rod([x, ny1, zz], [x, ny0 + 0.04 * Math.sin(k), zz], 0.005, 4)); }
    for (let r = 0; r < 4; r++) bag.add('rope_fibre', rod([nx0, ny1 - 0.18 - r * 0.2, zz], [nx1, ny1 - 0.2 - r * 0.2, zz], 0.004, 4));
    for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'pottery_dark' : 'chalk', lathe([[0.001, 0], [0.025, 0], [0.025, 0.04], [0.001, 0.04]], 6, null, nx0 + 0.1 + k * 0.36, ny0 - 0.04, zz));
    bag.add('wicker', lathe([[0.17, 0], [0.22, 0.25], [0.15, 0.55], [0.001, 0.6]], 9, null, x1 - t - 0.9, F + 0.49, z0 + t + 0.4));
    const za = z0 + t + 0.4, zb = z1 - t - 0.4;
    bag.add('timber', rod([wallW + 0.1, F + 1.9, za], [wallW + 0.1, F + 1.9, zb], 0.02, 5));
    bag.add('flagstone', box(wallW + 0.07, F + 1.87, zb, wallW + 0.13, F + 1.93, zb + 0.14));
    for (const [yy, ln] of [[F + 1.6, 0.9], [F + 1.38, 0.8]]) { bag.add('timber', rod([wallW + 0.1, yy, za + 0.3], [wallW + 0.1, yy, zb - 0.1], 0.022, 5)); bag.add('timber', box(wallW + 0.07, yy - 0.09, za + 0.3 - ln * 0.3, wallW + 0.13, yy + 0.09, za + 0.3)); }
    bag.add('timber', rod([x1 - t - 1.9, top - 0.35, cz + 0.9], [x1 - t - 0.2, top - 0.35, cz + 0.9], 0.025, 5));
    for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'hide_grey' : 'hide_brown', box(x1 - t - 1.8 + k * 0.3, top - 0.95, cz + 0.87, x1 - t - 1.74 + k * 0.3, top - 0.38, cz + 0.93));
  }
}
