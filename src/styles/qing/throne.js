// The throne rooms of the Qing palace and of Gyeongbokgung (docs/settlements/qing-beijing.md §11,
// joseon-seoul.md §11): the carved dragon (coiled on a column, in a caisson, in relief on a screen
// or a ceiling), the dragon throne, the screens behind it (seven or five gilt leaves carved with
// clouds and dragons; or the Joseon painting of the sun, the moon and the five peaks), the dais with
// its stairs and gilt balustrade, the furnishings round the throne (luduan, cranes, elephants
// bearing vases, incense pavilions, tripods, tables with censers, heating stoves, sedan chairs), the
// caisson with the coiled dragon and the pearl, the Joseon canopy (dangga) over the throne, the
// coffered ceiling and the floor of polished "gold bricks". Every piece is built at its own origin
// facing +z, then placed; the throne room faces south (+z).

import { Matrix4, Vector3 } from '../../core/three.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';
import { column } from '../ming/index.js';
import { Parts, ball, limb, torus, T, merge, seated, crane, tripod } from './carving.js';

// ── vectors ─────────────────────────────────────────────────────────────────────────────────────
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** A geometry built in a local frame (x side, y up, z forward) put at p with those axes. */
function framed(g, p, side, up, fwd, s = 1) {
  g.scale(s, s, s);
  g.applyMatrix4(new Matrix4().makeBasis(new Vector3(...side), new Vector3(...up), new Vector3(...fwd)));
  g.translate(p[0], p[1], p[2]);
  return g;
}
/** Parts merged per material, each geometry passed through fn (a non-uniform placing), into the bag. */
function emitWith(P, bag, fn) { for (const [mat, list] of P.m) bag.add(mat, fn(merge(list))); }

// ── the dragon ──────────────────────────────────────────────────────────────────────────────────
/**
 * A dragon along pts (head first) of body radius r: the scaled body tapering to the tail with its
 * flame tuft, the dorsal fins, four legs with spread claws (not when lite), the head — skull,
 * long snout with the nose, the open jaw, bulging eyes under heavy brows, two antlers swept back,
 * whiskers, the mane — and, when o.pearl, the flaming pearl before the mouth. o.up: the direction
 * the back faces where the body allows (default +y); o.flat squashes the body across (relief).
 */
export function dragon(P, m, pts, r, o = {}) {
  const n = pts.length, lite = !!o.lite, upRef = o.up ?? [0, 1, 0];
  const rad = (t) => r * (t < 0.07 ? 0.78 + 3 * t : 1 - 0.82 * Math.pow((t - 0.07) / 0.93, 1.3));
  P.add(m, tube(pts.map((p, i) => [p[0], p[1], p[2], rad(i / (n - 1)), rad(i / (n - 1)) * (o.flat ?? 1)]), lite ? 5 : 7, { capA: true, capB: true }));
  const frame = (i) => {
    const t = nrm(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]));
    let s = cross(t, upRef); if (Math.hypot(...s) < 1e-3) s = cross(t, [0, 0, 1]); s = nrm(s);
    return { t, s, u: nrm(cross(s, t)) };
  };
  // the fins along the back, every other ring
  for (let i = 3; i < n - 3; i += lite ? 3 : 2) {
    const { t, u } = frame(i), rr = rad(i / (n - 1)), b = add3(pts[i], u, rr * 0.7);
    P.add(m, limb(b, add3(add3(b, u, rr * 0.75), t, rr * 0.55), rr * 0.32, 0.004, 4));
  }
  // the legs: two pairs, each thigh out to the side, the shin down, three claws spread
  if (!lite) for (const ft of [0.2, 0.56]) {
    const i = Math.round(ft * (n - 1)), { t, s, u } = frame(i), rr = rad(ft);
    for (const k of [-1, 1]) {
      const hip = add3(pts[i], s, k * rr * 0.6), knee = add3(add3(add3(hip, s, k * r * 1.1), u, -r * 0.35), t, -r * 0.25), foot = add3(add3(knee, u, -r * 0.75), t, r * 0.55);
      P.add(m, limb(hip, knee, rr * 0.42, r * 0.28, 6)); P.add(m, limb(knee, foot, r * 0.28, r * 0.2, 6));
      for (const c of [-1, 0, 1]) P.add(m, limb(foot, add3(add3(add3(foot, t, r * 0.45), s, c * r * 0.3), u, -r * 0.12), r * 0.11, 0.004, 4));
    }
  }
  // the head
  const f = nrm(sub(pts[0], pts[1])); let hs = cross(upRef, f); if (Math.hypot(...hs) < 1e-3) hs = cross([0, 0, 1], f); hs = nrm(hs);
  const hu = nrm(cross(f, hs)), H = new Parts(), hb = (rx, ry, rz, x, y, z, q = 8) => H.add(m, T(ball(rx, ry, rz, q, q > 6 ? 5 : 4), x, y, z));
  hb(1.0, 0.82, 1.1, 0, 0.1, 0.1, 10);
  H.add(m, limb([0, 0.05, 0.7], [0, -0.05, 2.0], 0.62, 0.42, lite ? 6 : 8));
  hb(0.4, 0.3, 0.32, 0, 0.18, 2.0);
  H.add(m, limb([0, -0.45, 0.5], [0, -0.95, 1.75], 0.42, 0.22, 6));
  for (const k of [-1, 1]) {
    hb(0.26, 0.26, 0.22, k * 0.52, 0.55, 0.95, 6); hb(0.34, 0.16, 0.34, k * 0.5, 0.82, 0.8, 6);
    H.add(m, limb([k * 0.38, 0.8, 0.1], [k * 0.95, 1.85, -1.25], 0.17, 0.05, 5));
    if (!lite) { H.add(m, limb([k * 0.6, 1.25, -0.5], [k * 1.15, 1.45, -0.25], 0.08, 0.02, 4)); H.add(m, limb([k * 0.4, 0.0, 1.85], [k * 1.6, -0.35, 2.7], 0.06, 0.015, 4)); }
    hb(0.45, 0.4, 0.5, k * 0.68, 0.25, -0.55, 6); if (!lite) hb(0.35, 0.35, 0.45, k * 0.5, 0.75, -0.95, 6);
  }
  if (!lite) hb(0.4, 0.45, 0.5, 0, 0.95, -0.7, 6);
  emitWith(H, { add: (mm, g) => P.add(mm, g) }, (g) => framed(g, add3(pts[0], f, -r * 0.2), hs, hu, f, r * (o.head ?? 1)));
  // the tail's flame tuft
  const tb = frame(n - 2);
  for (const k of [-1, 0, 1]) P.add(m, limb(pts[n - 1], add3(add3(pts[n - 1], tb.t, r * 0.9), tb.s, k * r * 0.45), r * 0.22, 0.004, 4));
  if (o.pearl) {
    const c = add3(add3(pts[0], f, r * (o.head ?? 1) * 3.6), hu, -r * 0.3);
    P.add(o.pearlMat ?? m, T(ball(r * 0.75, r * 0.75, r * 0.75, 10, 6), ...c));
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, d = add3(add3([0, 0, 0], hs, Math.cos(a)), hu, Math.sin(a)); P.add(o.pearlMat ?? m, limb(add3(c, d, r * 0.6), add3(c, d, r * 1.35), r * 0.18, 0.004, 4)); }
  }
}
/** A dragon coiled up a column of radius cr from y0 to y1, its head at the top; turns about the shaft. */
export function columnDragon(P, m, cr, y0, y1, r, turns = 2.2, a0 = 0) {
  const N = 44, pts = [];
  for (let k = 0; k <= N; k++) { const t = k / N, a = a0 + t * turns * Math.PI * 2, R = cr + r * 0.75, y = y1 - t * (y1 - y0); pts.push([Math.cos(a) * R, y, Math.sin(a) * R]); }
  // the neck reaches out from the shaft so the head stands clear, facing outward and down
  pts[0] = [Math.cos(a0) * (cr + r * 2.2), y1 + r * 0.6, Math.sin(a0) * (cr + r * 2.2) + r * 0.8];
  dragon(P, m, pts, r, { up: [0, 1, 0] });
}
/** A dragon in relief in the xy plane (facing +z), rising in an S from below to its head at the top. */
function reliefDragon(P, m, w, h, r, o = {}) {
  const N = 30, pts = [];
  for (let k = 0; k <= N; k++) { const t = k / N; pts.push([Math.sin(t * Math.PI * 2.2 + (o.phase ?? 0)) * w * 0.32 * (1 - t * 0.3), h * (0.88 - t * 0.8), 0]); }
  pts[0] = [pts[1][0] + w * 0.12 * (o.dir ?? 1), h * 0.86, 0];
  dragon(P, m, pts, r, { up: [0, 0, 1], flat: 0.55, lite: o.lite, pearl: o.pearl, pearlMat: o.pearlMat });
}
/** A cloud scroll (ruyi) in relief: three lobes and a curling tail, w wide, in the xy plane. */
function cloud(P, m, x, y, w, z = 0) {
  for (const [dx, dy, k] of [[0, 0, 0.5], [-0.35, -0.12, 0.36], [0.35, -0.12, 0.36], [0.62, -0.32, 0.22]]) P.add(m, T(ball(w * k, w * k * 0.7, w * 0.12, 8, 4), x + dx * w, y + dy * w, z));
}

// ── the throne ──────────────────────────────────────────────────────────────────────────────────
/**
 * The dragon throne (Taihe: 1.73 m high overall, seat at 0.49, 1.59 wide, 0.79 deep): the
 * footed frame, the waisted base, the seat with its cushion, the round back rail running into
 * the arms with dragons coiled along it and their heads at the arms' ends, the back panel with two
 * dragons playing with a pearl in openwork, the crest. o.body, o.trim: the materials (Joseon: red
 * lacquer with gilt).
 */
function throne(P, o = {}) {
  const g = o.body ?? 'gilt_bronze', t = o.trim ?? 'gold', W = 0.8, D = 0.4;
  P.add(g, box(-W, 0, -D, W, 0.07, D));                                                  // the foot frame
  for (const [x, z] of [[-W + 0.06, -D + 0.06], [W - 0.06, -D + 0.06], [-W + 0.06, D - 0.06], [W - 0.06, D - 0.06]]) {
    P.add(g, limb([x, 0.07, z], [x * 0.97, 0.3, z * 0.95], 0.07, 0.055, 6)); P.add(t, T(ball(0.08, 0.06, 0.08, 6, 4), x, 0.1, z));
  }
  P.add(g, box(-W + 0.02, 0.28, -D + 0.02, W - 0.02, 0.33, D - 0.02));                   // the waist
  P.add(t, box(-W + 0.06, 0.33, -D + 0.06, W - 0.06, 0.38, D - 0.06));
  P.add(g, box(-W, 0.38, -D, W, 0.49, D));                                               // the seat
  P.add(o.cushion ?? 'cloth_ochre', box(-0.6, 0.49, -0.26, 0.6, 0.56, 0.34));
  // the round back rail and the arm posts
  const rail = [[-0.74, 0.86, 0.36], [-0.75, 0.88, 0.1], [-0.72, 0.94, -0.18], [-0.58, 1.02, -0.33], [-0.3, 1.08, -0.38], [0, 1.1, -0.39], [0.3, 1.08, -0.38], [0.58, 1.02, -0.33], [0.72, 0.94, -0.18], [0.75, 0.88, 0.1], [0.74, 0.86, 0.36]];
  P.add(g, tube(rail.map((p) => [...p, 0.055]), 8));
  for (const k of [-1, 1]) { P.add(g, limb([k * 0.74, 0.49, 0.34], [k * 0.74, 0.86, 0.36], 0.05, 0.05, 6)); P.add(g, box(k * 0.74 - 0.03, 0.49, -0.3, k * 0.74 + 0.03, 0.88, 0.3)); }
  // the dragons coiled along the rail, heads at the arms' ends, looking out
  for (const k of [-1, 1]) {
    const pts = []; for (let i = 0; i <= 20; i++) { const s = i / 20, idx = s * 5, j = Math.min(4, Math.floor(idx)), f = idx - j, a = rail[k < 0 ? j : 10 - j], b = rail[k < 0 ? j + 1 : 9 - j], p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f], w = s * Math.PI * 5; pts.push([p[0] + Math.cos(w) * 0.07 * k, p[1] + Math.sin(w) * 0.07, p[2]]); }
    pts[0] = [k * 0.76, 0.98, 0.44];
    dragon(P, t, pts, 0.045, { lite: true, head: 1.5 });
  }
  // the back panel: a gilt field, two dragons facing over the pearl, the crest with the third dragon
  P.add(g, box(-0.52, 0.56, -0.4, 0.52, 1.5, -0.33));
  P.add(o.field ?? 'lacquer_red', box(-0.42, 0.66, -0.33, 0.42, 1.38, -0.315));
  for (const k of [-1, 1]) { const Q = new Parts(); reliefDragon(Q, t, 0.4, 0.7, 0.03, { lite: true, dir: -k, phase: k > 0 ? Math.PI : 0 }); Q.emit({ add: (mm, gg) => P.add(mm, gg) }, k * 0.2, 0.68, -0.31); }
  P.add(t, T(ball(0.05, 0.05, 0.04, 8, 5), 0, 1.22, -0.29));
  const crest = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; crest.push([-Math.cos(a) * 0.55, 1.47 + Math.sin(a) * 0.2, -0.37, 0.05]); }
  P.add(g, tube(crest, 6));
  const cp = []; for (let i = 0; i <= 14; i++) { const s = i / 14; cp.push([Math.sin(s * 7) * 0.12, 1.73 - s * 0.24, -0.33 + s * 0.02]); }
  cp[0] = [0, 1.68, -0.24];
  dragon(P, t, cp, 0.05, { lite: true, head: 1.3, up: [0, 0, 1] });
  for (const k of [-1, 1]) P.add(t, T(ball(0.07, 0.11, 0.06, 6, 4), k * 0.55, 1.5, -0.37));
}

// ── the screens ─────────────────────────────────────────────────────────────────────────────────
/**
 * The gilt screen of n leaves (seven at Taihe), the middle tallest, standing on its long base: each
 * leaf a framed field carved with a dragon among clouds, crowned by a cresting of clouds round a
 * flaming jewel; the outer leaves turned a little forward.
 */
function giltScreen(P, n = 7, Hc = 4.2, dh = 0.3, w = 1.05) {
  const g = 'gilt_bronze', c = 'gold', half = (n - 1) / 2;
  let x = -w * n / 2;
  P.add(g, box(-w * n / 2 - 0.15, 0, -0.32, w * n / 2 + 0.15, 0.32, 0.22));             // the base
  P.add(c, box(-w * n / 2 - 0.1, 0.32, -0.28, w * n / 2 + 0.1, 0.38, 0.18));
  for (let k = 0; k < n; k++, x += w) {
    const d = Math.abs(k - half), h = Hc - d * dh, x0 = x + 0.01, x1 = x + w - 0.01, cx = (x0 + x1) / 2;
    P.add(g, box(x0, 0.38, -0.12, x0 + 0.08, h, 0.06)); P.add(g, box(x1 - 0.08, 0.38, -0.12, x1, h, 0.06));
    P.add(g, box(x0 + 0.08, h - 0.1, -0.12, x1 - 0.08, h, 0.06)); P.add(g, box(x0 + 0.08, 0.38, -0.12, x1 - 0.08, 0.78, 0.06));
    P.add(g, box(x0 + 0.08, 0.78, -0.09, x1 - 0.08, h - 0.1, 0.0));                   // the field
    P.add(c, box(x0 + 0.12, 0.44, 0.06, x1 - 0.12, 0.72, 0.075));                      // the apron panel
    // the dragon among clouds
    const Q = new Parts();
    reliefDragon(Q, c, w * 0.85, h - 1.0, 0.085 + 0.02 * (half - d) / half, { lite: d > 1, dir: k < half ? 1 : -1, phase: k % 2 ? Math.PI : 0 });
    for (let j = 0; j < 4; j++) cloud(Q, c, (j % 2 ? 0.2 : -0.22) * w, 0.25 + j * (h - 1.3) / 4, w * 0.32, -0.02);
    Q.emit({ add: (mm, gg) => P.add(mm, gg) }, cx, 0.8, 0.04);
    // the cresting
    const cr = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; cr.push([cx - Math.cos(a) * (w / 2 - 0.04), h + Math.sin(a) * 0.22, -0.03, 0.045]); }
    P.add(g, tube(cr, 6));
    for (const s of [-1, 1]) cloud(P, c, cx + s * w * 0.22, h + 0.1, w * 0.24, -0.03);
    P.add(c, lathe([[0.001, 0], [0.09, 0.08], [0.07, 0.22], [0.001, 0.36]], 6, null, cx, h + 0.2, -0.03));
  }
}
/**
 * The Joseon screen of the sun, the moon and the five peaks (Irworobongdo) in its red frame: the
 * blue sky, five green peaks (the middle highest) outlined in darker green, two waterfalls, the red
 * sun (east, the viewer's right) and the white moon (west), a pine on each side with red trunk,
 * the waves at the foot with their white crests. Three leaves, the side ones turned forward.
 */
function sunMoonScreen(P, W = 5.4, Hs = 3.3) {
  const fr = 'lacquer_red', leaf = (x0, x1, yaw, cx) => {
    const L = new Parts(), w = x1 - x0;
    L.add(fr, box(-w / 2 - 0.08, 0, -0.1, w / 2 + 0.08, Hs + 0.12, 0));
    L.add('paint_blue', box(-w / 2, 0.25, 0, w / 2, Hs - 0.02, 0.01));
    return { L, w, x0, x1, yaw, cx };
  };
  const wc = W * 0.5, ws = W * 0.24, leaves = [leaf(-wc / 2, wc / 2, 0, 0), leaf(-ws / 2, ws / 2, 0.35, -wc / 2), leaf(-ws / 2, ws / 2, -0.35, wc / 2)];
  // the picture spans the three leaves; each piece goes on the leaf it falls in, laid on its face
  const peak = (L, x, w, h, z, mat) => L.add(mat, fromTriangles([x - w, 0.6, z, x + w, 0.6, z, x + w * 0.15, 0.6 + h, z, x - w, 0.6, z, x + w * 0.15, 0.6 + h, z, x - w * 0.2, 0.6 + h * 0.92, z]));
  const [C, Lf, Rt] = leaves;
  for (const [L, xs] of [[C.L, [[0, 2.1, 1.2], [-0.95, 1.55, 0.75], [0.95, 1.55, 0.75]]], [Lf.L, [[0, 1.25, 0.62]]], [Rt.L, [[0, 1.25, 0.62]]]]) for (const [x, h, w] of xs) { peak(L, x, w + 0.06, h + 0.07, 0.014, 'tile_green'); peak(L, x, w, h, 0.02, 'glaze_green'); }
  for (const x of [-0.45, 0.45]) C.L.add('paint_white', box(x - 0.06, 0.62, 0.03, x + 0.06, 1.55, 0.04));      // the waterfalls
  const disc = (L, x, y, mat) => { const d = lathe([[0.001, 0], [0.3, 0], [0.3, 0.025], [0.001, 0.025]], 18); d.rotateX(Math.PI / 2); d.translate(x, y, 0.045); L.add(mat, d); };
  disc(Rt.L, 0, Hs - 0.75, 'glaze_red'); disc(Lf.L, 0, Hs - 0.75, 'paint_white');
  for (const [L, s] of [[Lf, -1], [Rt, 1]]) {                                          // the pines
    L.L.add('lacquer_chestnut', box(s * 0.25 - 0.06, 0.45, 0.03, s * 0.25 + 0.06, 2.1, 0.045));
    for (const [dx, dy, k] of [[0, 2.1, 0.42], [-0.18 * s, 1.75, 0.34], [0.12 * s, 1.45, 0.3], [-0.05, 2.4, 0.28]]) L.L.add('glaze_green', T(ball(k, k * 0.35, 0.03, 10, 4), s * 0.25 + dx, dy, 0.05));
  }
  for (const L of leaves) {                                                            // the waves
    const n = Math.max(2, Math.round(L.w / 0.35));
    L.L.add('stucco_sky', box(-L.w / 2, 0.25, 0.012, L.w / 2, 0.62, 0.022));
    for (let i = 0; i < n; i++) L.L.add('paint_white', T(ball(L.w / n * 0.45, 0.07, 0.02, 8, 4), -L.w / 2 + (i + 0.5) * L.w / n, 0.58, 0.025));
  }
  // placed: the middle leaf flat, the sides hinged beside it and turned forward
  const out = new Parts(), hx = wc / 2 + 0.1;
  C.L.emit({ add: (mm, gg) => out.add(mm, gg) }, 0, 0, 0);
  Rt.L.emit({ add: (mm, gg) => out.add(mm, gg) }, hx + ws / 2 * Math.cos(-0.35), 0, -ws / 2 * Math.sin(-0.35), -0.35);
  Lf.L.emit({ add: (mm, gg) => out.add(mm, gg) }, -hx - ws / 2 * Math.cos(0.35), 0, ws / 2 * Math.sin(0.35), 0.35);
  for (const [mat, list] of out.m) for (const gg of list) P.add(mat, gg);
}

// ── the furnishings ─────────────────────────────────────────────────────────────────────────────
/** An elephant bearing a vase on its saddle cloth (about 1.5 m with the vase), on a low stand. */
function elephant(P, hide = 'glaze_blue', trim = 'gilt_bronze') {
  P.add('wood_dark', box(-0.4, 0, -0.62, 0.4, 0.14, 0.62));
  const y = 0.14, B = (rx, ry, rz, x, yy, z, q = 10) => P.add(hide, T(ball(rx, ry, rz, q, 6), x, y + yy, z));
  B(0.34, 0.33, 0.52, 0, 0.66, -0.02, 12);
  for (const [x, z] of [[-0.18, 0.3], [0.18, 0.3], [-0.18, -0.32], [0.18, -0.32]]) { P.add(hide, limb([x, y + 0.6, z], [x, y, z], 0.11, 0.1, 8)); P.add(trim, T(torus(0.105, 0.015, 10, 4), x, y + 0.08, z)); }
  B(0.22, 0.24, 0.22, 0, 0.82, 0.52, 10);                                                 // the head
  const tr = [[0, 0.78, 0.7, 0.08], [0, 0.6, 0.78, 0.065], [0, 0.4, 0.76, 0.05], [0, 0.26, 0.68, 0.04], [0, 0.26, 0.6, 0.035]];
  P.add(hide, tube(tr.map(([a, b, c, r]) => [a, y + b, c, r]), 7));
  for (const k of [-1, 1]) {
    P.add(hide, T(ball(0.03, 0.2, 0.17, 8, 4), k * 0.24, y + 0.84, 0.42));               // the ears
    P.add('ivory', limb([k * 0.1, y + 0.68, 0.66], [k * 0.14, y + 0.6, 0.86], 0.03, 0.012, 6));
  }
  P.add(hide, limb([0, y + 0.72, -0.52], [0, y + 0.4, -0.6], 0.03, 0.015, 4));
  // the saddle cloth, its fringe, the vase
  P.add('cloth_red', box(-0.3, y + 0.94, -0.26, 0.3, y + 1.0, 0.2));
  for (const k of [-1, 1]) { P.add('cloth_red', box(k * 0.36 - 0.02, y + 0.55, -0.26, k * 0.36 + 0.02, y + 0.97, 0.2)); P.add(trim, box(k * 0.36 - 0.025, y + 0.52, -0.27, k * 0.36 + 0.025, y + 0.56, 0.21)); P.add('cloth_red', box(k * 0.3 - (k > 0 ? 0 : 0.04), y + 0.93, -0.26, k * 0.3 + (k > 0 ? 0.04 : 0), y + 0.99, 0.2).translate(k * 0.03, 0, 0)); }
  P.add(trim, lathe([[0.11, 0], [0.14, 0.04], [0.09, 0.13], [0.15, 0.23], [0.17, 0.32], [0.1, 0.41], [0.05, 0.47], [0.07, 0.51], [0.001, 0.51]], 12, null, 0, y + 1.0, -0.03));
}
/** A luduan, the one-horned beast that knows all tongues: a seated gilt beast on a small stand. */
function luduan(P, m = 'gilt_bronze') {
  P.add('wood_dark', box(-0.3, 0, -0.35, 0.3, 0.12, 0.35));
  const Q = new Parts(); seated(Q, m, { horn: true, bell: false, lite: true }); Q.emit({ add: (mm, g) => P.add(mm, g) }, 0, 0.12, 0, 0, 0.42);
}
/** An incense pavilion (xiangting): a six-sided little pavilion of gilt and enamel on a tall stand. */
function xiangting(P, metal = 'gilt_bronze', enamel = 'glaze_blue') {
  P.add('wood_dark', lathe([[0.42, 0], [0.42, 0.1], [0.32, 0.16], [0.001, 0.16]], 6));
  P.add(metal, lathe([[0.3, 0.16], [0.22, 0.3], [0.14, 0.4], [0.12, 1.0], [0.2, 1.08], [0.36, 1.14], [0.36, 1.2], [0.001, 1.2]], 6));
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6; P.add(metal, limb([Math.cos(a) * 0.28, 1.2, Math.sin(a) * 0.28], [Math.cos(a) * 0.28, 1.68, Math.sin(a) * 0.28], 0.025, 0.025, 5)); }
  P.add(enamel, lathe([[0.22, 1.2], [0.22, 1.62], [0.001, 1.62]], 6));                    // the screens between the posts
  P.add(enamel, lathe([[0.44, 1.66], [0.4, 1.7], [0.24, 1.84], [0.1, 1.98], [0.001, 2.0]], 6));
  P.add(metal, lathe([[0.46, 1.64], [0.46, 1.68], [0.001, 1.68]], 6));
  P.add(metal, lathe([[0.06, 1.96], [0.08, 2.06], [0.04, 2.14], [0.06, 2.2], [0.001, 2.3]], 8));
}
/** A round table of rosewood with a gilt censer on it (the Hall of Central Harmony). */
function censerTable(P) {
  P.add('wood_dark', lathe([[0.4, 0.74], [0.42, 0.78], [0.42, 0.82], [0.001, 0.82]], 16));
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; P.add('wood_dark', limb([Math.cos(a) * 0.3, 0.75, Math.sin(a) * 0.3], [Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36], 0.035, 0.03, 6)); }
  P.add('wood_dark', T(torus(0.3, 0.02, 14, 4), 0, 0.12, 0));
  P.add('gilt_bronze', lathe([[0.09, 0.82], [0.17, 0.86], [0.2, 0.98], [0.15, 1.06], [0.16, 1.08], [0.001, 1.08]], 12));
  P.add('gilt_bronze', lathe([[0.15, 1.08], [0.12, 1.16], [0.05, 1.22], [0.04, 1.27], [0.001, 1.3]], 12));
  for (const k of [-1, 1]) P.add('gilt_bronze', T(torus(0.05, 0.012, 8, 4).rotateZ(Math.PI / 2), k * 0.2, 1.02, 0));
}
/** A bronze heating stove: a round drum on lion feet under a pierced domed lid. */
function stove(P) {
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; P.add('bronze', limb([Math.cos(a) * 0.36, 0.3, Math.sin(a) * 0.36], [Math.cos(a) * 0.44, 0, Math.sin(a) * 0.44], 0.07, 0.05, 6)); }
  P.add('bronze', lathe([[0.3, 0.26], [0.48, 0.32], [0.52, 0.55], [0.48, 0.7], [0.5, 0.74], [0.001, 0.74]], 16));
  P.add('bronze', lathe([[0.46, 0.74], [0.4, 0.9], [0.25, 1.0], [0.08, 1.05], [0.1, 1.15], [0.001, 1.18]], 16));
  for (const k of [-1, 1]) P.add('bronze', T(torus(0.08, 0.018, 8, 4).rotateZ(Math.PI / 2), k * 0.52, 0.6, 0));
}
/** A sedan chair of the palace: the cabin hung with yellow cloth under a domed top, two poles on low trestles. */
function sedan(P) {
  for (const z of [-1.4, 1.4]) P.add('wood_dark', box(-0.55, 0, z - 0.1, 0.55, 0.42, z + 0.1));
  for (const k of [-1, 1]) P.add('lacquer_red', tube([[k * 0.5, 0.5, -2.1, 0.045], [k * 0.5, 0.48, 0, 0.05], [k * 0.5, 0.5, 2.1, 0.045]], 8));
  P.add('lacquer_red', box(-0.48, 0.42, -0.5, 0.48, 0.58, 0.5));
  P.add('cloth_ochre', box(-0.45, 0.58, -0.45, 0.45, 1.75, 0.45));
  P.add('lacquer_red', box(-0.3, 0.7, 0.45, 0.3, 1.5, 0.47));                             // the door curtain's frame
  P.add('cloth_ochre', box(-0.26, 0.74, 0.47, 0.26, 1.46, 0.5));
  P.add('gilt_bronze', lathe([[0.001, 1.75], [0.68, 1.75], [0.66, 1.82], [0.4, 1.95], [0.12, 2.05], [0.001, 2.07]], 4, null, 0, 0, 0).rotateY(Math.PI / 4));
  P.add('gilt_bronze', lathe([[0.08, 0], [0.1, 0.1], [0.04, 0.2], [0.001, 0.26]], 8, null, 0, 2.05, 0));
}

// ── the dais ────────────────────────────────────────────────────────────────────────────────────
/**
 * The throne's dais { hw, hd half sizes, h, at [cx, cz], stairs [[x, w], …] on the front }: a waisted
 * base of red lacquer with gilt mouldings, a gilt balustrade round the top (posts with knob heads,
 * red panels, a round rail) open at the stairs, each stair of steps of about 0.29 m.
 */
function dais(bag, col, o) {
  const { hw, hd, h, at: [cx, cz], y } = o, body = o.body ?? 'lacquer_red', trim = o.trim ?? 'gilt_bronze';
  const R = [cx - hw, cz - hd, cx + hw, cz + hd];
  for (const [a, b, i, m] of [[0, 0.12, 0, trim], [0.12, 0.22, 0.06, trim], [0.22, 0.78, 0.14, body], [0.78, 0.88, 0.06, trim], [0.88, 1, 0, trim]]) bag.add(m, box(R[0] + i, y + a * h, R[1] + i, R[2] - i, y + b * h, R[3] - i));
  col.rect(R, y, y + h); col.floor(R, y + h);
  // the stairs before it
  const steps = Math.max(2, Math.round(h / 0.29)), run = 0.3;
  for (const [sx, w] of o.stairs) {
    for (let k = 0; k < steps; k++) bag.add(body, box(cx + sx - w / 2, y, R[3] + (steps - k - 1) * run, cx + sx + w / 2, y + (k + 1) * h / steps, R[3] + (steps - k) * run));
    for (const s of [-1, 1]) bag.add(trim, fromTriangles(cheek(cx + sx + s * (w / 2 + 0.06), R[3], R[3] + steps * run, y, y + h)));
    col.ramp([cx + sx - w / 2, R[3], cx + sx + w / 2, R[3] + steps * run], y, y + h, 'n');
  }
  // the balustrade round the top, open at each stair's head
  if (o.rail === false) return;
  const yt = y + h, open = o.stairs.map(([sx, w]) => [cx + sx - w / 2 - 0.06, cx + sx + w / 2 + 0.06]);
  const runRail = (a, b) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.3) return;
    const n = Math.max(1, Math.round(L / 0.9));
    for (let k = 0; k <= n; k++) { const p = [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]; bag.add(trim, lathe([[0.05, 0], [0.05, 0.72], [0.07, 0.76], [0.06, 0.84], [0.001, 0.9]], 8, null, p[0], yt, p[1])); }
    const t = []; const ax = Math.abs(b[0] - a[0]) > 0.01;
    for (let k = 0; k < n; k++) {
      const p = [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n], q = [a[0] + (b[0] - a[0]) * (k + 1) / n, a[1] + (b[1] - a[1]) * (k + 1) / n];
      if (ax) { bag.add(body, box(Math.min(p[0], q[0]) + 0.06, yt + 0.06, p[1] - 0.025, Math.max(p[0], q[0]) - 0.06, yt + 0.5, p[1] + 0.025)); bag.add(trim, box(Math.min(p[0], q[0]) + 0.05, yt, p[1] - 0.035, Math.max(p[0], q[0]) - 0.05, yt + 0.06, p[1] + 0.035)); }
      else { bag.add(body, box(p[0] - 0.025, yt + 0.06, Math.min(p[1], q[1]) + 0.06, p[0] + 0.025, yt + 0.5, Math.max(p[1], q[1]) - 0.06)); bag.add(trim, box(p[0] - 0.035, yt, Math.min(p[1], q[1]) + 0.05, p[0] + 0.035, yt + 0.06, Math.max(p[1], q[1]) - 0.05)); }
    }
    bag.add(trim, tube([[a[0], yt + 0.66, a[1], 0.035], [b[0], yt + 0.66, b[1], 0.035]], 6));
    col.segment(a, b, 0.1, yt, yt + 0.9); void t;
  };
  const e = 0.12, x0 = R[0] + e, x1 = R[2] - e, z0 = R[1] + e, z1 = R[3] - e;
  runRail([x0, z0], [x1, z0]); runRail([x0, z0], [x0, z1]); runRail([x1, z0], [x1, z1]);
  let xa = x0; for (const [p, q] of [...open].sort((u, v) => u[0] - v[0])) { runRail([xa, z1], [p, z1]); xa = q; } runRail([xa, z1], [x1, z1]);
}
/** A stair's cheek: a sloping slab beside the steps from (x, za, y top) down to (x, zb, y0). */
function cheek(x, za, zb, y0, y1) {
  const w = 0.06, t = [];
  const P = (dx, z, y) => [x + dx, y, z];
  const q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
  const A = [P(-w, za, y0), P(w, za, y0), P(w, zb, y0), P(-w, zb, y0)], B = [P(-w, za, y1 + 0.08), P(w, za, y1 + 0.08), P(w, zb, y0 + 0.12), P(-w, zb, y0 + 0.12)];
  q(A[0], A[1], A[2], A[3]); q(B[3], B[2], B[1], B[0]); q(A[1], B[1], B[2], A[2]); q(A[3], B[3], B[0], A[0]); q(A[0], B[0], B[1], A[1]); q(A[2], B[2], B[3], A[3]);
  return orientOutward(t);
}

// ── the ceiling ─────────────────────────────────────────────────────────────────────────────────
/**
 * The coffered ceiling at height cy over rect: boards over the whole, painted ribs on a 1.6 m grid
 * with gilt bosses, a hole left at `well` ([x0, z0, x1, z1]) for a caisson or a raised panel.
 */
function ceiling(bag, rect, cy, well, rib = 'paint_caihua', board = 'paint_caihua', boss = 'gilt_bronze') {
  const [x0, z0, x1, z1] = rect;
  const parts = well ? [[x0, z0, x1, well[1]], [x0, well[3], x1, z1], [x0, well[1], well[0], well[3]], [well[2], well[1], x1, well[3]]] : [rect];
  for (const r of parts) if (r[2] - r[0] > 0.05 && r[3] - r[1] > 0.05) bag.add(board, box(r[0], cy, r[1], r[2], cy + 0.08, r[3]));
  const inWell = (x, z) => well && x > well[0] - 0.05 && x < well[2] + 0.05 && z > well[1] - 0.05 && z < well[3] + 0.05;
  const nx = Math.round((x1 - x0) / 1.6), nz = Math.round((z1 - z0) / 1.6);
  for (let i = 1; i < nx; i++) { const x = x0 + i * (x1 - x0) / nx; for (let j = 0; j < nz; j++) { const za = z0 + j * (z1 - z0) / nz, zb = z0 + (j + 1) * (z1 - z0) / nz; if (!inWell(x, (za + zb) / 2)) bag.add(rib, box(x - 0.07, cy - 0.16, za, x + 0.07, cy, zb)); } }
  for (let j = 1; j < nz; j++) { const z = z0 + j * (z1 - z0) / nz; for (let i = 0; i < nx; i++) { const xa = x0 + i * (x1 - x0) / nx, xb = x0 + (i + 1) * (x1 - x0) / nx; if (!inWell((xa + xb) / 2, z)) bag.add(rib, box(xa, cy - 0.15, z - 0.07, xb, cy, z + 0.07)); } }
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = x0 + (i + 0.5) * (x1 - x0) / nx, z = z0 + (j + 0.5) * (z1 - z0) / nz; if (!inWell(x, z)) bag.add(boss, lathe([[0.001, -0.08], [0.07, -0.07], [0.17, -0.04], [0.22, -0.005], [0.001, -0.005]], 10, null, x, cy, z)); }
}
/**
 * The caisson over the throne (zaojing) at (cx, cz), its mouth at height cy: the square well with a
 * ring of little brackets, the octagon turned in it, the round drum with its brackets, the dome,
 * the dragon coiled under the dome with its head down, holding in its mouth the pearl ("the
 * Xuanyuan mirror") hung with smaller balls round it.
 */
function caisson(bag, cx, cy, cz, S = 6) {
  const P = new Parts(), g = 'gilt_bronze', pc = 'paint_caihua', h = S / 2;
  // the square well: four walls with a band of brackets at the top, a gilt rim at the mouth
  for (const [a, b, c, d] of [[-h, -h, h, -h + 0.12], [-h, h - 0.12, h, h], [-h, -h, -h + 0.12, h], [h - 0.12, -h, h, h]]) { P.add(pc, box(a, 0, b, c, 0.75, d)); P.add(g, box(a - 0.02, -0.08, b - 0.02, c + 0.02, 0.04, d + 0.02)); }
  for (let k = 0; k < 4; k++) for (let i = 0; i < 12; i++) { const t = -h + 0.3 + i * (S - 0.6) / 11, br = box(t - 0.07, 0.52, -h + 0.12, t + 0.07, 0.7, -h + 0.32); br.rotateY(k * Math.PI / 2); P.add(g, br); }
  // the octagon: a ring turned 22.5° inside the square, the corners filled with triangular boards
  const ring = (r0, r1, y0, y1, seg, rot = 0) => { const gg = lathe([[r0, y0], [r1, y0], [r1, y1], [r0, y1], [r0, y0]], seg); gg.rotateY(rot); return gg; };
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const a = [sx * h, sz * h], b = [sx * h * 0.25, sz * h], c = [sx * h, sz * h * 0.25], t = [], v = (p, yy) => [p[0], yy, p[1]];
    const q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
    t.push(...v(a, 0.75), ...v(b, 0.75), ...v(c, 0.75), ...v(a, 0.83), ...v(b, 0.83), ...v(c, 0.83));
    q(v(a, 0.75), v(b, 0.75), v(b, 0.83), v(a, 0.83)); q(v(b, 0.75), v(c, 0.75), v(c, 0.83), v(b, 0.83)); q(v(c, 0.75), v(a, 0.75), v(a, 0.83), v(c, 0.83));
    P.add(pc, fromTriangles(orientOutward(t)));
  }
  const r8 = h * 0.98;
  P.add(pc, ring(r8 - 0.12, r8 + 0.05, 0.75, 1.45, 8, Math.PI / 8));
  P.add(g, ring(r8 - 0.16, r8, 0.72, 0.8, 8, Math.PI / 8));
  P.add(pc, ring(r8 * 0.78, r8 + 0.05, 1.45, 1.53, 8, Math.PI / 8));
  // the drum and its brackets, the dome
  const rd = r8 * 0.74;
  P.add(pc, ring(rd - 0.1, rd + 0.02, 1.53, 2.3, 32));
  P.add(g, ring(rd - 0.14, rd, 1.5, 1.58, 32));
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, br = box(-0.06, 2.0, rd - 0.32, 0.06, 2.22, rd - 0.1); br.rotateY(a); P.add(g, br); }
  P.add(g, lathe([[rd + 0.02, 2.3], [rd * 0.8, 2.5], [rd * 0.5, 2.68], [0.001, 2.76], [0.001, 2.86], [rd + 0.08, 2.38]], 32));
  // the coiled dragon: round under the dome, then its neck down through the drum, head down, the pearl
  const pts = [];
  pts.push([0, 0.7, 0.25]); pts.push([0, 1.05, 0.35]); pts.push([0.15, 1.45, 0.55]); pts.push([0.45, 1.85, 0.75]);
  for (let k = 0; k <= 22; k++) { const a = Math.PI / 2 - 0.5 - k * 0.32, R = rd * 0.62 - k * 0.012; pts.push([Math.cos(a) * R, 2.15 + Math.sin(k * 0.5) * 0.05, Math.sin(a) * R]); }
  dragon(P, 'gold', pts, 0.16, { up: [0, -1, 0], head: 1.1 });
  P.add(g, limb([0, 0.42, 0.4], [0, -0.5, 0.4], 0.012, 0.012, 4));
  P.add('silver', T(ball(0.26, 0.26, 0.26, 14, 8), 0, -0.75, 0.4));
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; P.add(g, limb([0, -0.5, 0.4], [Math.cos(a) * 0.38, -0.62, 0.4 + Math.sin(a) * 0.38], 0.008, 0.008, 3)); P.add('silver', T(ball(0.07, 0.07, 0.07, 8, 5), Math.cos(a) * 0.38, -0.7, 0.4 + Math.sin(a) * 0.38)); }
  emitWith(P, bag, (gg) => { gg.scale(1, 0.75, 1); gg.translate(cx, cy, cz); return gg; });
}

// ── the Joseon canopy and ceiling dragons ───────────────────────────────────────────────────────
/**
 * The canopy over the Joseon throne (dangga), its top against the ceiling at cy: a miniature
 * building hung upside down — the ceiling board, tiers of little bracket arms painted in
 * dancheong, the eave frame, the carved gilt valance of pendant cloud-flowers along the front
 * and sides; under its ceiling a yellow dragon.
 */
function dangga(bag, cx, cy, cz, w = 4.4, d = 2.6) {
  const P = new Parts(), dp = 'paint_dancheong', g = 'gilt_bronze', hw = w / 2, hd = d / 2;
  P.add(dp, box(-hw, -0.12, -hd, hw, 0, hd));                                             // the board against the ceiling
  for (let tier = 0; tier < 3; tier++) {
    const y = -0.12 - (tier + 1) * 0.2, o = 0.35 - tier * 0.12;
    P.add(dp, box(-hw + o, y, -hd + o, hw - o, y + 0.2, -hd + o + 0.08)); P.add(dp, box(-hw + o, y, hd - o - 0.08, hw - o, y + 0.2, hd - o));
    P.add(dp, box(-hw + o, y, -hd + o, -hw + o + 0.08, y + 0.2, hd - o)); P.add(dp, box(hw - o - 0.08, y, -hd + o, hw - o, y + 0.2, hd - o));
    const n = Math.round((w - 2 * o) / 0.32);
    for (let i = 0; i <= n; i++) { const x = -hw + o + i * (w - 2 * o) / n; P.add('lacquer_red', box(x - 0.05, y - 0.06, hd - o - 0.04, x + 0.05, y + 0.02, hd - o + 0.12)); }
  }
  // the inner ceiling, with its dragon
  P.add('paint_blue', box(-hw + 0.5, -0.16, -hd + 0.5, hw - 0.5, -0.1, hd - 0.5));
  const D = new Parts(), pts = [];
  for (let k = 0; k <= 26; k++) { const t = k / 26; pts.push([(t - 0.5) * (w - 1.4) * -1, 0, Math.sin(t * Math.PI * 2) * (d - 1.4) * 0.3]); }
  dragon(D, 'gold', pts, 0.07, { up: [0, -1, 0], flat: 0.6 });
  D.emit({ add: (mm, gg) => P.add(mm, gg) }, 0, -0.26, 0);
  // the eave frame and the valance
  P.add(dp, box(-hw - 0.15, -0.86, -hd, hw + 0.15, -0.72, hd + 0.15));
  for (const [ax, n, len, z, along] of [[0, Math.round(w / 0.3), w + 0.3, hd + 0.17, true], [-hw - 0.17, Math.round(d / 0.3), d + 0.15, 0, false], [hw + 0.17, Math.round(d / 0.3), d + 0.15, 0, false]]) {
    for (let i = 0; i < n; i++) {
      const s = -len / 2 + (i + 0.5) * len / n, x = along ? s : ax, zz = along ? z : s + 0.075;
      P.add(g, T(along ? ball(0.11, 0.16, 0.03, 8, 4) : ball(0.03, 0.16, 0.11, 8, 4), x, -1.0, zz));
      P.add(g, T(along ? ball(0.05, 0.08, 0.025, 6, 4) : ball(0.025, 0.08, 0.05, 6, 4), x, -1.2, zz));
    }
    P.add(g, along ? box(-len / 2, -0.9, z - 0.03, len / 2, -0.86, z + 0.03) : box(ax - 0.03, -0.9, -len / 2 + 0.075, ax + 0.03, -0.86, len / 2 + 0.075));
  }
  P.emit(bag, cx, cy, cz);
}

// ── the throne room ─────────────────────────────────────────────────────────────────────────────
const KINDS = {
  // the Hall of Supreme Harmony: the two-metre dais with three stairs, the throne, the seven-leaved
  // screen, luduan, elephants and cranes on the dais, incense pavilions and tripods before it, the
  // six gilt columns with their dragons, the caisson with the pearl
  taihe: { dais: { hw: 5.2, hd: 3.4, h: 2.0, stairs: [[0, 2.2], [-3.6, 1.4], [3.6, 1.4]] }, screen: [7, 4.4, 0.32, 1.1], throne: 1, luduan: true, elephants: true, cranes: true, pavilions: true, tripods: true, caisson: 6, gilt: true, drop: 1.8 },
  // the Hall of Central Harmony: a low dais, the throne (1.9 m), luduan at its arms, four tables with
  // censers before it, two heating stoves, the two sedan chairs beside it
  zhonghe: { dais: { hw: 3.0, hd: 2.3, h: 0.86, stairs: [[0, 2.0]] }, screen: [5, 3.4, 0.3, 0.95], throne: 1.1, luduan: 'arms', tables: true, stoves: true, sedans: true },
  // the Hall of Preserving Harmony: a dais with three stairs, the throne, the seven-leaved screen,
  // luduan and cranes
  baohe: { dais: { hw: 4.4, hd: 2.9, h: 1.43, stairs: [[0, 2.0], [-3.0, 1.2], [3.0, 1.2]] }, screen: [7, 3.8, 0.28, 0.95], throne: 1, luduan: true, cranes: true, tripods: true },
  // Geunjeongjeon: the throne's platform with stairs on three sides, the red throne, the screen of
  // the sun, the moon and the five peaks, the canopy over them; the two yellow dragons in the ceiling
  joseon: { dais: { hw: 2.7, hd: 2.1, h: 1.2, stairs: [[0, 1.6]], body: 'lacquer_red', trim: 'paint_dancheong' }, irworo: true, throne: 1, joseon: true, dangga: true, ceilingDragons: true },
};

/**
 * throne_hall: the inside of a throne hall { rect, y (floor), H (to the ceiling), bays [n, d], kind
 * ('taihe' | 'zhonghe' | 'baohe' | 'joseon'; screen: 'irworo' means joseon), d (column diameter) }.
 * The inner columns of the grid (none in the throne's place, none in the two middle lines before
 * it, so that the throne is seen from the door), the floor of gold bricks, the dais and all on it,
 * the coffered ceiling and the caisson.
 */
export function throneHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H, [nb, nd] = el.bays, cx = (x0 + x1) / 2;
  const K = KINDS[el.kind ?? (el.screen === 'irworo' ? 'joseon' : 'taihe')], dz = K.dais;
  const bx = (x1 - x0) / nb, bz = (z1 - z0) / nd;
  const tz = z0 + 1.6 + dz.hd + (K.irworo ? 0.6 : 1.2);                   // the dais' centre: against the back, room for the screen
  const front = tz + dz.hd;
  // the floor: dark polished bricks with fine joints
  bag.add(K.joseon ? 'granite_korea' : 'marble_dark', box(x0 + 0.3, y - 0.05, z0 + 0.3, x1 - 0.3, y + 0.01, z1 - 0.3));
  if (!K.joseon) { const n = 0.64; for (let i = 0; (i + 1) * n <= x1 - x0 - 0.6; i++) for (let j = 0; (j + 1) * n <= z1 - z0 - 0.6; j++) { const xa = x0 + 0.3 + i * n, za = z0 + 0.3 + j * n; bag.add('marble_dark', box(xa + 0.004, y + 0.01, za + 0.004, xa + n - 0.004, y + 0.025, za + n - 0.004)); } }
  // the inner columns
  const D = el.d ?? 1.0, giltX = [];
  for (let i = 1; i < nb; i++) for (let j = 1; j < nd; j++) {
    const x = x0 + i * bx, z = z0 + j * bz;
    if (Math.abs(x - cx) < dz.hw + 0.8 && z > tz - dz.hd - 1.0 && z < front + 2.8) continue;      // the dais and its stairs
    if (Math.abs(x - cx) < bx * 1.1) continue;                                                    // the middle lines before the throne
    const gilt = K.gilt && Math.abs(x - cx) < bx * 1.6 + dz.hw * 0.2 && j <= 3;
    column(bag, col, x, z, y, H - 0.2, D, gilt ? 'gilt_bronze' : 'lacquer_red');
    if (gilt) { giltX.push(x); const P = new Parts(); columnDragon(P, 'gold', D / 2, y + 1.2, y + H - (K.drop ?? 0.32) - 1.1, 0.17, 2.1, (i + j) * 1.3); P.emit(bag, x, 0, z); }
  }
  // the dais and the throne
  dais(bag, col, { ...dz, at: [cx, tz], y });
  const top = y + dz.h, sz = tz - dz.hd + 1.35;
  { const P = new Parts(); throne(P, K.joseon ? { body: 'lacquer_red', trim: 'gilt_bronze', field: 'paint_dancheong', cushion: 'cloth_red' } : {}); P.emit(bag, cx, top, sz, 0, K.throne); col.rect([cx - 0.85 * K.throne, sz - 0.42, cx + 0.85 * K.throne, sz + 0.42], top, top + 1.2); }
  if (K.joseon) { bag.add('lacquer_red', box(cx - 0.45, top, sz + 0.42, cx + 0.45, top + 0.18, sz + 0.82)); }       // the footstool
  // the screen behind the throne
  const zb = tz - dz.hd + 0.42;
  if (K.irworo) { const P = new Parts(); sunMoonScreen(P, 5.0, 3.2); P.emit(bag, cx, top, zb); }
  else { const P = new Parts(); giltScreen(P, ...K.screen); P.emit(bag, cx, top, zb); }
  // on the dais and before it
  const put = (fn, x, yy, z, yaw = 0, s = 1, ...a) => { const P = new Parts(); fn(P, ...a); P.emit(bag, x, yy, z, yaw, s); };
  if (K.luduan) for (const k of [-1, 1]) {
    if (K.luduan === 'arms') put(luduan, cx + k * 1.35, top, sz + 0.25);
    else put(luduan, cx + k * (dz.hw - 0.58), top, tz + dz.hd - 0.6);
  }
  if (K.elephants) for (const k of [-1, 1]) put(elephant, cx + k * 2.2, top, tz + dz.hd - 1.0);
  if (K.cranes) for (const k of [-1, 1]) put((P) => crane(P, 'bronze', 'wood_dark'), cx + k * (dz.hw - 1.0), top, tz - dz.hd + 1.5, -k * 0.3, 0.75);
  if (K.pavilions) for (const k of [-1, 1]) { put(xiangting, cx + k * (dz.hw + 1.4), y, front + 0.9); col.circle(cx + k * (dz.hw + 1.4), front + 0.9, 0.45, y, y + 2.3); }
  if (K.tripods) for (const k of [-1, 1]) { const tx = cx + k * (dz.hw + 1.4), tzz = front + (K.pavilions ? 3.4 : 1.2); put((P) => tripod(P, 'bronze', 'wood_dark'), tx, y, tzz, 0, 0.6); col.circle(tx, tzz, 0.6, y, y + 2); }
  if (K.tables) for (const k of [-1.5, -0.5, 0.5, 1.5]) { const tx = cx + k * 1.4, tzz = front + 2.6; put(censerTable, tx, y, tzz); col.circle(tx, tzz, 0.42, y, y + 1.3); }
  if (K.stoves) for (const k of [-1, 1]) { put(stove, cx + k * 3.6, y, front + 3.9); col.circle(cx + k * 3.6, front + 3.9, 0.55, y, y + 1.2); }
  if (K.sedans) for (const k of [-1, 1]) { const sx = cx + k * (dz.hw + 2.6); put(sedan, sx, y, tz + 0.6); col.rect([sx - 0.6, tz + 0.6 - 2.1, sx + 0.6, tz + 0.6 + 2.1], y, y + 2.1); }
  // the ceiling, the caisson or the canopy
  const cy = y + H - (K.drop ?? 0.32), J = !!K.joseon, rib = J ? 'paint_dancheong' : 'paint_caihua';
  const well = K.caisson ? [cx - K.caisson / 2, tz - K.caisson / 2, cx + K.caisson / 2, tz + K.caisson / 2] : K.ceilingDragons ? [cx - 4.5, (z0 + z1) / 2 - 3, cx + 4.5, (z0 + z1) / 2 + 3] : null;
  ceiling(bag, [x0 + 0.2, z0 + 0.2, x1 - 0.2, z1 - 0.2], cy, well, rib, rib, J ? 'paint_ochre' : 'gilt_bronze');
  if (K.caisson) caisson(bag, cx, cy, tz, K.caisson);
  if (K.dangga) dangga(bag, cx, cy - 0.16, tz - 0.3);
  if (K.ceilingDragons) {
    // the raised panel in the middle of the ceiling: its stepped sides, the blue field, two yellow dragons flying round a pearl
    const [a, b, c, d] = well, P = new Parts();
    for (let k = 0; k < 3; k++) { const o = k * 0.35, yy = cy + k * 0.3; for (const r of [[a + o, b + o, c - o, b + o + 0.36], [a + o, d - o - 0.36, c - o, d - o], [a + o, b + o, a + o + 0.36, d - o], [c - o - 0.36, b + o, c - o, d - o]]) P.add('paint_dancheong', box(r[0], yy, r[1], r[2], yy + 0.3, r[3])); }
    P.add('paint_blue', box(a + 0.7, cy + 0.9, b + 0.7, c - 0.7, cy + 0.98, d - 0.7));
    for (const k of [-1, 1]) {
      const pts = [], zc = (b + d) / 2; for (let i = 0; i <= 26; i++) { const t = i / 26; pts.push([cx + k * (0.75 + t * 2.7), cy + 0.82, zc + k * Math.sin(t * Math.PI * 1.7 + 0.3) * 1.0]); }
      dragon(P, 'gold', pts, 0.19, { up: [0, -1, 0], flat: 0.6 });
    }
    P.add('gold', T(ball(0.16, 0.16, 0.16, 10, 6), cx, cy + 0.78, (b + d) / 2));
    P.emit(bag, 0, 0, 0);
  }
  void giltX;
}
