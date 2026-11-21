// The oval houses of Chichén Itzá's lots, varied by rule (docs/settlements/chichen-itza.md §17): each house takes from its seed
// the finish of its walls (red-earth daub, lime wash over a dado, bare sticks with a daubed foot and vine lashings), its
// footing and wall height, its roof's pitch and age, a rolled mat over a door, a porch over a door, a lean-to at the
// rounded end, and what it is used for (the hearth house, a weaver's, a store). Registered on the maya style from here.

import '../../styles/maya/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { hearthKit, ollaKit, metateKit, waterJarKit, bedKit, storeJarKit, put } from '../../styles/maya/household.js';
import { loomKit } from './carvings.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const reach = (h) => 1.25 * Math.max(h.a, h.b);

/**
 * The variant a house takes { finish, F (footing), wall (height), pitch, old, mat, porch (door index or −1), lean, use, keep (the radius the yard stays out of) }.
 * el.others: [{ c, r }] — what stands near, so that a porch or a lean-to is not put where it would run into a neighbour.
 */
export function variant(el) {
  const r = rng(((el.seed || 1) ^ 0x9e3779b1) >>> 0), u = r();
  const v = { finish: u < 0.45 ? 'daub' : u < 0.7 ? 'lime' : 'poles', F: 0.35 + r() * 0.25, wall: 2.45 + r() * 0.15, pitch: 0.9 + r() * 0.22, old: r() < 0.4, mat: r() < 0.6, porch: r() < 0.35 ? (r() < 0.5 ? 0 : 1) : -1, lean: r() < 0.3, use: 'home' };
  const w = r(); v.use = w < 0.55 ? 'home' : w < 0.75 ? 'weaver' : 'store';
  const alongX = el.dir !== 'z', others = el.others || [], [cx, cz] = el.c;
  const free = (x, z) => others.every((o) => Math.hypot(o.c[0] - x, o.c[1] - z) > o.r + 1.7);
  if (v.porch >= 0) {
    const n = doorNormal(alongX, v.porch), q = 1.25 * el.b + 1.0;
    if (!free(cx + n[0] * q, cz + n[1] * q) || !free(cx + n[0] * (q + 1), cz + n[1] * (q + 1))) v.porch = -1;
  }
  if (v.lean) {
    const e = alongX ? [-1, 0] : [0, -1], q = 1.25 * el.a + 1.0;
    if (el.a > 4.6 || !free(cx + e[0] * q, cz + e[1] * q) || !free(cx + e[0] * (q + 1.2), cz + e[1] * (q + 1.2))) v.lean = false;
  }
  v.keep = Math.max(el.a + 1.4, v.porch >= 0 ? 1.25 * el.b + 2.4 : 0, v.lean ? 1.25 * el.a + 2.6 : 0);
  return v;
}
/** The outward normal of door i (the two doors are in the middle of the long sides). */
function doorNormal(alongX, i) { return alongX ? (i ? [0, -1] : [0, 1]) : (i ? [-1, 0] : [1, 0]); }

function flipGeo(g) {
  const p = g.attributes.position.array, t = [];
  for (let i = 0; i < p.length; i += 9) t.push(p[i], p[i + 1], p[i + 2], p[i + 6], p[i + 7], p[i + 8], p[i + 3], p[i + 4], p[i + 5]);
  return fromTriangles(t);
}

/**
 * cz_house: an oval house { c, a, b (half-axes), dir ('x' | 'z'), seed, y (the ground at its middle), others }: a footing of rubble,
 * the wall with its two doors in the middle of the long sides, the thatched roof hipped at the rounded ends; see variant().
 */
function czHouse(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, a = el.a, b = el.b, alongX = el.dir !== 'z', rand = rng(el.seed || 1), v = variant(el), Y0 = el.y ?? 0;
  const sx = alongX ? 1 : b / a, sz = alongX ? b / a : 1;
  const oval = (th) => { const c = Math.cos(th), s = Math.sin(th); return 1 / Math.hypot(c / sx, s / sz); };
  const P = (th, r, y) => [cx + Math.cos(th) * r * oval(th), Y0 + y, cz + Math.sin(th) * r * oval(th)];
  const F = v.F, T = 0.16, top = F + v.wall;
  const base = v.finish === 'daub' ? 'mud_plaster' : v.finish === 'lime' ? 'lime_plaster' : 'log_pine';
  bag.add('rubble', lathe([[a * 1.04, -0.55], [a * 1.04, F - 0.03], [0.001, F - 0.03]], 24, oval, cx, Y0, cz));
  bag.add('mud_plaster', lathe([[a - T, F - 0.03], [a - T, F], [0.001, F]], 24, oval, cx, Y0, cz));            // the beaten earth floor
  // the doorways: 1.7 m or more clear and a lintel 2.1 m over the floor, so that a visitor can walk in (§19): three of the wall's 48 segments either side of the door's middle, so that the door's edges fall on the wall's segments
  const doors = alongX ? [Math.PI / 2, -Math.PI / 2] : [0, Math.PI], N = 48, step = 2 * Math.PI / N, dw = 3 * step, dh = F + 2.12;
  const t = [], tb = [], tv = [], q = (arr, p1, p2, p3, p4) => arr.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
  const inDoor = (th) => doors.some((d) => Math.abs(Math.atan2(Math.sin(th - d), Math.cos(th - d))) < dw);
  const dado = v.finish === 'poles' ? 0.55 : v.finish === 'lime' ? 0.5 : 0;
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * 2 * Math.PI, t1 = ((i + 1) / N) * 2 * Math.PI, mid = (t0 + t1) / 2, y0 = inDoor(mid) ? dh : F;
    const ro = a, ri = a - T;
    q(t, P(t0, ro, y0), P(t1, ro, y0), P(t1, ro, top), P(t0, ro, top));
    q(t, P(t1, ri, y0), P(t0, ri, y0), P(t0, ri, top), P(t1, ri, top));
    q(t, P(t0, ri, top), P(t0, ro, top), P(t1, ro, top), P(t1, ri, top));
    if (y0 > F) q(t, P(t0, ro, y0), P(t0, ri, y0), P(t1, ri, y0), P(t1, ro, y0));
    const nxt = inDoor(((i + 1.5) / N) * 2 * Math.PI), prv = inDoor(((i - 0.5) / N) * 2 * Math.PI);
    if (!inDoor(mid) && nxt) q(t, P(t1, ro, F), P(t1, ri, F), P(t1, ri, dh), P(t1, ro, dh));
    if (!inDoor(mid) && prv) q(t, P(t0, ri, F), P(t0, ro, F), P(t0, ro, dh), P(t0, ri, dh));
    if (!inDoor(mid)) {
      const A = P(t0, a - T / 2, 0), B = P(t1, a - T / 2, 0); col.segment([A[0], A[2]], [B[0], B[2]], T, Y0, Y0 + top);
      if (dado) q(tb, P(t0, ro + 0.012, F), P(t1, ro + 0.012, F), P(t1, ro + 0.012, F + dado), P(t0, ro + 0.012, F + dado));
      if (v.finish === 'poles') for (const yy of [F + 0.95, top - 0.35]) q(tv, P(t0, ro + 0.02, yy), P(t1, ro + 0.02, yy), P(t1, ro + 0.02, yy + 0.06), P(t0, ro + 0.02, yy + 0.06));
    }
  }
  bag.add(base, flipGeo(fromTriangles(t)));
  if (tb.length) bag.add('mud_plaster', flipGeo(fromTriangles(tb)));
  if (tv.length) bag.add('rope_fibre', flipGeo(fromTriangles(tv)));
  // the roof of palm thatch, hipped at the rounded ends, its underside seen from within
  const k = v.pitch, L0 = 2.35, prof = [[a * 1.25, L0], [a * 0.95, L0 + 0.7 * k], [a * 0.55, L0 + 1.9 * k], [a * 0.12, L0 + 3.1 * k], [0.001, L0 + 3.3 * k]], rm = v.old ? 'thatch' : 'thatch_palm';
  bag.add(rm, lathe(prof, 24, oval, cx, Y0, cz));
  bag.add(rm, flipGeo(lathe(prof.map(([r, y]) => [Math.max(0.001, r - 0.12), y - 0.1]), 24, oval, cx, Y0, cz)));
  { const e = lathe([[a * 1.25, L0], [a * 1.25 - 0.12, L0 - 0.1]], 24, oval, cx, Y0, cz); bag.add(rm, e); bag.add(rm, flipGeo(e.clone())); }
  col.floor([cx - (alongX ? a : b) * 0.7, cz - (alongX ? b : a) * 0.7, cx + (alongX ? a : b) * 0.7, cz + (alongX ? b : a) * 0.7], Y0 + F);
  // soot (§19.5): the hearth's smoke leaves by the doors and blackens the wall above them [stated: Yucatán Today, §17: the smoke leaves a black layer on walls and roof]; and the thatch inside over the hearth
  if (v.use !== 'store') {
    for (const d of doors) for (const j of [-3, -1, 1]) {
      const t0 = d + j * step, t1 = t0 + 0.7 * step, h0 = dh + 0.03, h1 = Math.min(dh + 0.3, top - 0.05), ts = [];
      q(ts, P(t0, a + 0.014, h0), P(t1, a + 0.014, h0), P(t1, a + 0.014, h1), P(t0, a + 0.014, h1));
      bag.add('pottery_dark', flipGeo(fromTriangles(ts)));
    }
  }
  if (v.use === 'home') {
    const pin = prof.map(([r, y]) => [Math.max(0.001, r - 0.12), y - 0.1]), yIn = (r) => { for (let k = 0; k + 1 < pin.length; k++) if (r <= pin[k][0] && r >= pin[k + 1][0]) return pin[k + 1][1] + (pin[k][1] - pin[k + 1][1]) * (r - pin[k + 1][0]) / (pin[k][0] - pin[k + 1][0]); return pin[0][1]; };
    const ax = alongX ? [1, 0] : [0, 1], lat = [-ax[1], ax[0]];
    for (const [rho, lt, sz] of [[a - 1.0, 0, 0.17], [a - 0.55, 0.28, 0.14], [a - 1.45, -0.22, 0.15]]) {
      const pt = (du, dl) => { const rr = rho + du, y = yIn(rr) - 0.012; return [cx + ax[0] * rr + lat[0] * (lt + dl), Y0 + y, cz + ax[1] * rr + lat[1] * (lt + dl)]; };
      const tri = [...pt(-sz, -sz), ...pt(sz, -sz), ...pt(sz, sz), ...pt(-sz, -sz), ...pt(sz, sz), ...pt(-sz, sz)];
      const ny = (tri[4] - tri[1]) * 0 + ((tri[3] - tri[0]) * (tri[8] - tri[2]) - (tri[5] - tri[2]) * (tri[6] - tri[0]));      // the winding's y: the patch faces down into the room
      if (ny > 0) { const f = tri.slice(); for (let k = 0; k < 3; k++) { f[3 + k] = tri[6 + k]; f[6 + k] = tri[3 + k]; f[12 + k] = tri[15 + k]; f[15 + k] = tri[12 + k]; } bag.add('pottery_dark', fromTriangles(f)); } else bag.add('pottery_dark', fromTriangles(tri));
    }
  }
  // a step stone before each doorway; a rolled mat above some
  doors.forEach((d, i) => {
    const n = doorNormal(alongX, i), w = [cx + n[0] * (b + 0.28), cz + n[1] * (b + 0.28)], hx = n[0] ? 0.3 : 0.45, hz = n[0] ? 0.45 : 0.3;
    bag.add('rubble', box(w[0] - hx, Y0 - 0.05, w[1] - hz, w[0] + hx, Y0 + 0.22, w[1] + hz)); col.floor([w[0] - hx, w[1] - hz, w[0] + hx, w[1] + hz], Y0 + 0.22);
    if (v.mat && (i + (el.seed || 0)) % 2 === 0) {
      const m = [cx + n[0] * (b + 0.07), cz + n[1] * (b + 0.07)], tx = n[0] ? 0 : 0.7, tz = n[0] ? 0.7 : 0;
      bag.add('reed_mat', box(m[0] - Math.max(0.06, tx), Y0 + dh + 0.03, m[1] - Math.max(0.06, tz), m[0] + Math.max(0.06, tx), Y0 + dh + 0.13, m[1] + Math.max(0.06, tz)));
    }
  });
  // a porch over a door: a thatched awning on two posts with a log bench and a water jar beside the door
  if (v.porch >= 0) {
    const n = doorNormal(alongX, v.porch), tn = [-n[1], n[0]], e0 = 1.25 * b - 0.25, e1 = 1.25 * b + 1.7, wq = (u0, u1, q0, q1) => {
      const xs = [cx + n[0] * q0 + tn[0] * u0, cx + n[0] * q1 + tn[0] * u1], zs = [cz + n[1] * q0 + tn[1] * u0, cz + n[1] * q1 + tn[1] * u1];
      return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
    };
    const sl = wq(-1.5, 1.5, e0, e1); bag.add('thatch_palm', box(sl[0], Y0 + 2.48, sl[1], sl[2], Y0 + 2.65, sl[3])); col.rect(sl, Y0 + 2.48, Y0 + 2.65);
    for (const u of [-1.35, 1.35]) { const p = wq(u - 0.07, u + 0.07, e1 - 0.15, e1 - 0.01); bag.add('log_pine', box(p[0], Y0 - 0.05, p[1], p[2], Y0 + 2.48, p[3])); col.circle((p[0] + p[2]) / 2, (p[1] + p[3]) / 2, 0.1, Y0, Y0 + 2.5); }
    const bm = wq(-1.42, 1.42, e1 - 0.2, e1 - 0.1); bag.add('timber', box(bm[0], Y0 + 2.39, bm[1], bm[2], Y0 + 2.48, bm[3]));
    const bn = wq(0.8, 1.3, b + 0.3, b + 0.7); bag.add('log_pine', box(bn[0], Y0, bn[1], bn[2], Y0 + 0.4, bn[3])); col.rect(bn, Y0, Y0 + 0.4);
    const jp = wq(-1.0, -1.0, b + 0.5, b + 0.5); put(bag, waterJarKit(), jp[0], Y0, jp[1], 0); col.circle(jp[0], jp[1], 0.33, Y0, Y0 + 0.8);
  }
  // a lean-to at the rounded end: an open shed for firewood and jars
  if (v.lean) {
    const e = alongX ? [-1, 0] : [0, -1], te = [-e[1], e[0]], e0 = 1.25 * a - 0.3, e1 = 1.25 * a + 1.9;
    const wq = (u0, u1, q0, q1) => { const xs = [cx + e[0] * q0 + te[0] * u0, cx + e[0] * q1 + te[0] * u1], zs = [cz + e[1] * q0 + te[1] * u0, cz + e[1] * q1 + te[1] * u1]; return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]; };
    const sl = wq(-1.1, 1.1, e0, e1); bag.add('thatch_palm', box(sl[0], Y0 + 2.15, sl[1], sl[2], Y0 + 2.3, sl[3])); col.rect(sl, Y0 + 2.15, Y0 + 2.3);
    for (const u of [-1.0, 1.0]) { const p = wq(u - 0.06, u + 0.06, e1 - 0.14, e1 - 0.02); bag.add('log_pine', box(p[0], Y0 - 0.05, p[1], p[2], Y0 + 2.15, p[3])); col.circle((p[0] + p[2]) / 2, (p[1] + p[3]) / 2, 0.09, Y0, Y0 + 2.2); }
    const m = wq(0, 0, 1.25 * a + 0.9, 1.25 * a + 0.9), L2 = STYLES.life.elements;
    L2.firewood({ at: [m[0], m[1]], y: Y0, rot: alongX ? Math.PI / 2 : 0, seed: el.seed, len: 1.4 }, ctx);
    const j = wq(0.7, 0.7, 1.25 * a + 0.5, 1.25 * a + 0.5); L2.pot({ at: [j[0], j[1]], y: Y0, kind: 'dark_pot', n: 2, seed: el.seed }, ctx);
  }
  things(ctx, el, v, P, alongX, Y0 + F, a, b, rand);
}

/** The things inside, by use. */
function things(ctx, el, v, P, alongX, f, a, b, rand) {
  const { bag, col } = ctx, L2 = STYLES.life.elements, endA = alongX ? 0 : Math.PI / 2, endB = endA + Math.PI;
  const bd = P(endB, a - 1.3, 0); put(bag, bedKit(rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', 'cloth_red'), bd[0], f, bd[2], alongX ? Math.PI / 2 : 0);
  const w = P(endA - 1.2, a - 0.55, 0); put(bag, waterJarKit(), w[0], f, w[2], 0); col.circle(w[0], w[2], 0.33, f, f + 0.8);
  const sj = P(endB + 0.9, a - 0.5, 0); put(bag, storeJarKit(), sj[0], f, sj[2], 0);
  const bk = P(endB - 0.9, a - 0.55, 0); L2.basket({ at: [bk[0], bk[2]], y: f, seed: el.seed, n: 1 }, ctx);
  if (v.use === 'home') {
    const [hx, , hz] = P(endA, a - 1.0, 0); put(bag, hearthKit('rubble'), hx, f, hz, 0); col.circle(hx, hz, 0.45, f, f + 0.3);
    ctx.lights?.push({ at: [hx, f + 0.9, hz], color: '#ff9a4a', intensity: 2.4, distance: 6 });
    for (const [da, r] of [[0.5, a - 1.0], [-0.5, a - 1.0]]) { const p = P(endA + da, r, 0); put(bag, ollaKit(), p[0], f, p[2], 0); }
    const m = P(endA + 1.15, a - 0.75, 0); put(bag, metateKit(), m[0], f, m[2], alongX ? Math.PI : -Math.PI / 2);
    if (rand() < 0.4) { const kk = P(endA + 1.15, a - 1.35, 0); L2.figure({ at: [kk[0], kk[2]], y: f, rot: alongX ? 0 : Math.PI / 2, seed: el.seed, pose: 'kneel', dress: 'robe', cloth: 'cloth_white', skin: 'skin_dark', hair: 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx); }
  } else if (v.use === 'weaver') {
    // the backstrap loom at the end, the weaver kneeling before it, a basket of cotton
    const lp = P(endA, a - 1.0, 0), dir = [-Math.cos(endA), -Math.sin(endA)], yaw = Math.atan2(dir[0], dir[1]);
    put(bag, loomKit(), lp[0], f, lp[2], yaw); col.circle(lp[0], lp[2], 0.3, f, f + 1.3);
    L2.figure({ at: [lp[0] + dir[0] * 1.05, lp[2] + dir[1] * 1.05], y: f, rot: yaw + Math.PI, seed: el.seed, pose: 'kneel', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', skin: 'skin_dark', hair: 'bun', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx);
    const c = P(endA - 0.9, a - 2.3, 0); L2.basket({ at: [c[0], c[2]], y: f, seed: el.seed + 3, n: 1, goods: 'cloth_white' }, ctx);
    ctx.lights?.push({ at: [lp[0] + dir[0] * 1.2, f + 1.2, lp[2] + dir[1] * 1.2], color: '#ffd9a0', intensity: 1.2, distance: 5 });
  } else {
    // a store: maize and bean jars in a row against the wall, baskets of cobs
    for (let i = 0; i < 5; i++) { const p = P(endA - 0.8 + i * 0.4, a - 0.6, 0); put(bag, storeJarKit(), p[0], f, p[2], 0); col.circle(p[0], p[2], 0.26, f, f + 0.6); }
    for (const [da, r] of [[0.9, a - 1.5], [-0.9, a - 1.5]]) { const p = P(endA + da, r, 0); L2.basket({ at: [p[0], p[2]], y: f, seed: el.seed + Math.floor(da * 10), n: 2, goods: rand() < 0.5 ? 'paint_ochre' : 'cloth_ochre' }, ctx); }
  }
}

Object.assign(STYLES.maya.elements, { cz_house: czHouse });
