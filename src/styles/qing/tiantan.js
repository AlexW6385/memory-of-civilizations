// The Hall of Prayer for Good Harvests at the Temple of Heaven, as it stood between 1545 and 1751
// (docs/settlements/qing-beijing.md §13): the round hall of three eaves — then tiled blue above,
// yellow in the middle and green below (heaven, earth and the ten thousand things) — on the
// three-tiered round marble altar (Qigu Tan), 91, 80 and 68 m across and 5.6 m high; the hall 32.7 m
// across, about 38 m high to the gilt finial; its 28 columns in three rings: four dragon-well pillars
// 19.2 m high carrying the top roof, twelve gold columns the middle, twelve eave columns the lowest;
// lattice doors all round, the south's middle pair open on the shrine of Heaven's tablet.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris, latticeBay, column } from '../ming/index.js';
import { post, Parts, spout, ball, limb, torus, T } from './carving.js';
import { dragon, reliefDragon, cloud } from './throne.js';
import { hexiBay, dougongShape } from './caihua.js';

const TAU = Math.PI * 2;

/** The spouts under the balustrade's posts (Travel China Guide, §13): clouds on the lowest tier, phoenixes on the middle, dragons on the top. Facing +z. */
function spoutKind(P, kind, m = 'marble_smooth') {
  if (kind === 'dragon') { spout(P, m); return; }
  P.add(m, box(-0.12, -0.15, 0, 0.12, 0.1, 0.3));
  if (kind === 'cloud') {
    // a scroll of cloud: a fat ruyi head with two curled lobes
    P.add(m, T(ball(0.13, 0.08, 0.2, 6, 3), 0, -0.02, 0.45));
    for (const sx of [-1, 1]) P.add(m, T(ball(0.07, 0.07, 0.09, 5, 3), sx * 0.12, -0.03, 0.62));
    P.add(m, limb([0, -0.05, 0.3], [0, 0.04, 0.72], 0.1, 0.05, 5));
    return;
  }
  // a phoenix's head and neck, the crest swept back, the beak open
  P.add(m, limb([0, -0.05, 0.28], [0, 0.08, 0.6], 0.09, 0.055, 6));
  P.add(m, T(ball(0.065, 0.06, 0.08, 6, 3), 0, 0.1, 0.65));
  P.add(m, limb([0, 0.08, 0.68], [0, 0.06, 0.82], 0.03, 0.006, 4));
  for (const sx of [-1, 1]) P.add(m, limb([sx * 0.015, 0.15, 0.62], [sx * 0.04, 0.3, 0.46], 0.02, 0.004, 4));
}


/** A band along an arc (a curved rail, a purlin, a ring of boards): radius r, from angle a0 to a1, section w (across) × h, its foot at y. */
function arcBand(out, c, r, a0, a1, y, w, h, segs) {
  const n = Math.max(2, segs), P = (a, rr, yy) => [c[0] + Math.cos(a) * rr, yy, c[1] + Math.sin(a) * rr];
  for (let i = 0; i < n; i++) {
    const p = a0 + (a1 - a0) * i / n, q = a0 + (a1 - a0) * (i + 1) / n;
    beamTris(out, P(p, r, y), P(q, r, y), w / 2, h);
  }
}
/** A concave round roof from the eave (rE, yE) up to (rT, yT): the tiles, the underside, the fascia, the tile rolls running up it. */
function roundRoof(bag, c, rE, yE, rT, yT, mat, ribs = 48, under = 'paint_caihua') {
  const N = 8, prof = [];
  for (let k = 0; k <= N; k++) { const t = k / N; prof.push([rE + (rT - rE) * t, yE + (yT - yE) * Math.pow(t, 1.7)]); }
  bag.add(mat, lathe(prof, 64, null, c[0], 0, c[1]));
  bag.add(under, lathe(prof.map(([r, y]) => [r - 0.05, y - 0.22]).reverse(), 64, null, c[0], 0, c[1]));
  bag.add(under, lathe([[rE - 0.05, yE - 0.22], [rE + 0.01, yE - 0.22], [rE + 0.01, yE + 0.02]], 64, null, c[0], 0, c[1]));
  // the rolls of tiles (tongwa), each a rounded ridge from the eave up to the ridge
  const t = [];
  for (let i = 0; i < ribs; i++) {
    const a = (i + 0.5) / ribs * TAU, ca = Math.cos(a), sa = Math.sin(a);
    for (let k = 0; k < N; k += 2) {
      const p = prof[k], q = prof[Math.min(N, k + 2)];
      beamTris(t, [c[0] + ca * p[0], p[1] + 0.005, c[1] + sa * p[0]], [c[0] + ca * q[0], q[1] + 0.005, c[1] + sa * q[0]], 0.07, 0.07);
    }
  }
  bag.add(mat, fromTriangles(t));
  // the eave's ring of tile ends
  const e = []; arcBand(e, c, rE + 0.02, 0, TAU, yE - 0.1, 0.12, 0.14, 64); bag.add(mat, fromTriangles(e));
}
/** A ring of bracket sets at radius r (the plate's top at yf), n sets, with the plate, the outer purlin and the red boards. */
function bracketRing(bag, c, r, yf, n, tiers, yTo) {
  const S = dougongShape({ tiers, step: 0.24 }), G = [], B = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5) / n * TAU;
    for (const [src, dst] of [[S.G, G], [S.B, B]]) {
      for (let k = 0; k < src.length; k += 3) {
        // the set is built pointing +z: turn it to point out along a
        const x = src[k], y = src[k + 1], z = src[k + 2], ca = Math.cos(a), sa = Math.sin(a);
        dst.push(c[0] + ca * (z + r) + sa * x, yf + 0.12 + y, c[1] + sa * (z + r) - ca * x);
      }
    }
  }
  const out = tiers * 0.24 + 0.08, yTop = yf + 0.12 + 0.18 + tiers * 0.15;
  arcBand(G, c, r, 0, TAU, yf, 0.32, 0.12, 48);
  arcBand(G, c, r + out, 0, TAU, yTop, 0.16, 0.16, 48);
  arcBand(R, c, r, 0, TAU, yf + 0.12, 0.05, yTo - yf - 0.12, 48);
  bag.add('paint_caihua', fromTriangles(G)); bag.add('paint_blue', fromTriangles(B)); bag.add('lacquer_red', fromTriangles(R));
}
/** The painted frieze round a drum: hexi bays on the twelve faces between the columns. */
function frieze(bag, c, r, n, y, h, colR, kind) {
  const T = {}, th = 0.26;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, p = [c[0] + Math.cos(a0) * r, c[1] + Math.sin(a0) * r], q = [c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r];
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]), t = [(q[0] - p[0]) / L, 0, (q[1] - p[1]) / L], nn = [t[2], 0, -t[0]];
    // the beam itself, then its outer face painted (the columns' round cut off each end)
    const bt = []; beamTris(bt, [p[0], y, p[1]], [q[0], y, q[1]], th / 2, h); bag.add('paint_caihua', fromTriangles(bt));
    const cut = Math.sqrt(Math.max(0, colR * colR - (th / 2) ** 2)) + 0.01;
    hexiBay(T, [p[0] + t[0] * cut, y, p[1] + t[2] * cut], t, nn, th / 2, L - 2 * cut, h, i % 2 === 0, kind, i % 2 ? 1 : -1);
  }
  for (const [m, tris] of Object.entries(T)) bag.add(m, fromTriangles(tris));
}

/**
 * The dragon-and-phoenix caisson over the four great pillars (Sohu: "three tiers, all round, each smaller than the one
 * below"): three round drums stepping in, blue with gilt rims and a ring of little brackets under each rim, a ring of
 * gilt cloud scrolls and phoenixes' crests on the second, the dome over them with the gilt dragon coiled under it, head
 * down, a pearl before its mouth.
 */
function caissonRound(bag, c, y) {
  const g = (list) => { const t = []; for (const [r, yy, w, h] of list) arcBand(t, c, r, 0, TAU, yy, w, h, 48); bag.add('gilt_bronze', fromTriangles(t)); };
  const tiers = [[5.4, 0.7], [4.0, 0.7], [2.6, 0.7]];
  let yb = y;
  for (const [r, h] of tiers) {
    bag.add('paint_blue', lathe([[r, yb], [r, yb + h]], 48, null, c[0], 0, c[1]));
    bag.add('paint_caihua', lathe([[r + 1.4, yb + h], [r, yb + h]], 48, null, c[0], 0, c[1]));            // the step's soffit
    g([[r - 0.04, yb + h - 0.12, 0.14, 0.14], [r - 0.04, yb, 0.14, 0.12]]);
    // the little brackets under the rim
    const B = []; for (let i = 0; i < 24; i++) { const a = (i + 0.5) / 24 * TAU; B.push([c[0] + Math.cos(a) * (r - 0.1), yb + h - 0.3, c[1] + Math.sin(a) * (r - 0.1)]); }
    for (const [x, yy, z] of B) bag.add('paint_caihua', box(x - 0.1, yy, z - 0.1, x + 0.1, yy + 0.18, z + 0.1));
    yb += h;
  }
  // the dome, blue, ribbed in gilt
  const prof = []; for (let k = 0; k <= 8; k++) { const t = k / 8; prof.push([2.6 * (1 - t) + 0.001, yb + 0.85 * Math.sin(t * Math.PI / 2)]); }
  bag.add('paint_blue', lathe(prof, 48, null, c[0], 0, c[1]));
  { const t = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; for (let k = 0; k < 8; k++) { const p = prof[k], q = prof[k + 1]; beamTris(t, [c[0] + Math.cos(a) * p[0], p[1] + 0.02, c[1] + Math.sin(a) * p[0]], [c[0] + Math.cos(a) * q[0], q[1] + 0.02, c[1] + Math.sin(a) * q[0]], 0.05, 0.05); } } bag.add('gilt_bronze', fromTriangles(t)); }
  // gilt clouds and phoenix crests round the second drum (outward-facing relief)
  const R = new Parts();
  for (let i = 0; i < 12; i++) {
    const a = (i + 0.5) / 12 * TAU, P = new Parts();
    if (i % 2) { cloud(P, 'gilt_bronze', 0, 0.35, 0.8); } else {
      // a phoenix: body, tail streamers, wings spread
      P.add('gilt_bronze', T(ball(0.14, 0.2, 0.05, 6, 4), 0, 0.3, 0)); P.add('gilt_bronze', T(ball(0.07, 0.07, 0.05, 5, 3), 0, 0.55, 0));
      for (const sx of [-1, 1]) { P.add('gilt_bronze', limb([sx * 0.1, 0.35, 0], [sx * 0.55, 0.55, 0], 0.06, 0.01, 4)); P.add('gilt_bronze', limb([sx * 0.04, 0.12, 0], [sx * 0.18, -0.12, 0], 0.03, 0.006, 4)); }
    }
    P.emit(bag, c[0] + Math.cos(a) * 3.96, y + 0.7, c[1] + Math.sin(a) * 3.96, Math.atan2(-Math.cos(a), -Math.sin(a)));
  }
  void R;
  // the dragon coiled under the dome, head down at the centre
  const P = new Parts(), pts = [];
  for (let k = 0; k <= 30; k++) { const t = k / 30, a = t * TAU * 1.5, rr = 0.35 + t * 1.5; pts.push([Math.cos(a) * rr, yb + 0.1 + 0.55 * Math.sin(Math.min(1, rr / 2.6) * Math.PI / 2) - 0.0, Math.sin(a) * rr]); }
  pts[0] = [0, yb - 0.9, 0]; pts[1] = [0.45, yb - 0.25, 0.1];
  dragon(P, 'gilt_bronze', pts, 0.3, { up: [0, 1, 0], pearl: true });
  P.emit(bag, c[0], 0, c[1]);
}

/**
 * qinian: the altar and the hall { c, y (the ground), tiers: [[r, top], …] (default the Qigu Tan's
 * 45.5, 40, 34 m and 5.6 m), stairs: the stair widths on the south (middle slab between two flights) }.
 */
export function qinian(el, { bag, col, style }) {
  const c = el.c, y0 = el.y ?? 0, tiers = el.tiers ?? [[45.5, 1.87], [40, 3.73], [34, 5.6]];
  // ── the altar: three round tiers of white marble, their balustrades, the stairs on the four sides ──
  const half = { s: 6.2, n: 3.2, e: 3.2, w: 3.2 }, dirs = { s: Math.PI / 2, n: -Math.PI / 2, e: 0, w: Math.PI };
  const rails = [], heads = ['lotus', 'phoenix', 'dragon'];
  tiers.forEach(([r, top], k) => {
    const yb = k ? y0 + tiers[k - 1][1] : y0, yt = y0 + top;
    bag.add('marble', lathe([[r, yb - 0.4], [r, yt - 0.18], [r + 0.08, yt - 0.14], [r + 0.08, yt], [0.001, yt]], 96, null, c[0], 0, c[1]));
    // the paving of the tier's top (inside the next tier, if any, it is hidden)
    bag.add('brick_paving', lathe([[r - 0.15, yt], [r - 0.15, yt + 0.02], [0.001, yt + 0.02]], 96, null, c[0], 0, c[1]));
    for (let z = -r; z < r; z += 2) { const w = Math.sqrt(Math.max(0, r * r - Math.max(z * z, (z + 2) ** 2))); if (w > 0.5) col.floor([c[0] - w, c[1] + z, c[0] + w, c[1] + z + 2], yt + 0.02); }
    // the balustrade: carved posts every 1.6 m (lotus heads on the lowest tier, phoenixes on the middle,
    // dragons on the top), the panel, the rail and the handrail running round between them, open at the stairs
    const rr = r - 0.3, n = Math.round(TAU * rr / 1.6), open = (a) => Object.entries(dirs).some(([d, ad]) => { const da = Math.atan2(Math.sin(a - ad), Math.cos(a - ad)); return Math.abs(da) * rr < half[d] + 0.5; });
    const PP = new Parts(); post(PP, 'marble_smooth', heads[k]);
    let run = null;
    for (let i = 0; i <= n; i++) {
      const a = i / n * TAU, isOpen = open(a) || i === n;
      if (!open(a) && i < n) PP.emit(bag, c[0] + Math.cos(a) * rr, yt, c[1] + Math.sin(a) * rr);
      if (!isOpen && run === null) run = a;
      if ((isOpen || i === n) && run !== null) {
        const a1 = isOpen ? (i - 1) / n * TAU : a, segs = Math.max(2, Math.round((a1 - run) * rr / 3.2));
        if (a1 > run) {
          arcBand(rails, c, rr, run, a1, yt + 0.06, 0.09, 0.42, segs);
          arcBand(rails, c, rr, run, a1, yt + 0.62, 0.11, 0.06, segs);
          arcBand(rails, c, rr, run, a1, yt + 0.84, 0.09, 0.08, segs);
          arcBand(rails, c, rr, run, a1, yt, 0.24, 0.07, segs);
          for (let j = 0; j < segs; j++) { const p = run + (a1 - run) * j / segs, q = run + (a1 - run) * (j + 1) / segs; col.segment([c[0] + Math.cos(p) * rr, c[1] + Math.sin(p) * rr], [c[0] + Math.cos(q) * rr, c[1] + Math.sin(q) * rr], 0.3, yt, yt + 1.1); }
        }
        run = null;
      }
    }
    // the spouts under each post, jutting from the tier's face below the coping
    { const SP = new Parts(); spoutKind(SP, ['cloud', 'phoenix', 'dragon'][k]);
      for (let i = 0; i < n; i++) { const a = i / n * TAU; if (open(a)) continue; SP.emit(bag, c[0] + Math.cos(a) * (r - 0.12), yt - 0.4, c[1] + Math.sin(a) * (r - 0.12), Math.atan2(Math.cos(a), Math.sin(a))); } }
    // the stairs up to this tier from the ring below (the ground for the lowest): on the south three
    // flights with the carved slab in the middle, one flight on the other sides
    const rLow = k ? tiers[k - 1][0] : r + 5, run2 = Math.min(rLow - r - 0.8, 4.4), ylo = yb;
    for (const [d, ad] of Object.entries(dirs)) {
      const hw = half[d], inner = Math.sqrt(r * r - hw * hw) - 0.05, outer = inner + run2, ux = Math.cos(ad), uz = Math.sin(ad);
      const rect = (o0, o1, s0, s1) => { const xs = [c[0] + ux * s0 - uz * o0, c[0] + ux * s1 - uz * o1], zs = [c[1] + uz * s0 + ux * o0, c[1] + uz * s1 + ux * o1]; return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]; };
      const up = { s: 'n', n: 's', e: 'w', w: 'e' }[d];
      const flights = d === 's' ? [[-hw, -2.3, false], [-2.0, 2.0, true], [2.3, hw, false]] : [[-hw, hw, false]];
      for (const [o0, o1, slab] of flights) style.elements.stairs({ rect: rect(o0, o1, inner, outer), y0: ylo + 0.02, y1: yt + 0.02, dir: up, slab, mat: 'marble', rakes: !slab, rakeOff: 0.15 }, { bag, col, style });
    }
  });
  bag.add('marble_smooth', fromTriangles(rails));

  // ── the hall ──
  const Y = y0 + tiers[tiers.length - 1][1], F = Y + 0.5;
  bag.add('marble', lathe([[17.2, Y - 0.1], [17.2, F - 0.08], [17.3, F - 0.04], [17.3, F], [0.001, F]], 64, null, c[0], 0, c[1]));
  bag.add('brick_paving', lathe([[17.1, F], [17.1, F + 0.02], [0.001, F + 0.02]], 64, null, c[0], 0, c[1]));
  for (let z = -17; z < 17; z += 1.5) { const w = Math.sqrt(Math.max(0, 289 - Math.max(z * z, (z + 1.5) ** 2))); if (w > 0.5) col.floor([c[0] - w, c[1] + z, c[0] + w, c[1] + z + 1.5], F + 0.02); }
  // the dragon-and-phoenix stone in the middle of the floor
  bag.add('marble_smooth', lathe([[1.1, F], [1.1, F + 0.05], [0.001, F + 0.05]], 24, null, c[0], 0, c[1]));
  { const V = new Parts(); for (const [k, a0] of [[1, 0.4], [-1, 3.4]]) { const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20, a = a0 + k * t * 3.4, rr = 0.25 + 0.55 * t; pts.push([Math.cos(a) * rr, 0.003, Math.sin(a) * rr]); } dragon(V, 'marble_dark', pts, 0.07, { up: [0, 1, 0], flat: 0.15, lite: true }); } V.emit(bag, c[0], F + 0.05, c[1]); }
  const ring = (r, n, a0 = 0.5) => Array.from({ length: n }, (_, i) => { const a = (i + a0) / n * TAU; return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; });
  // the eave columns, the lattice doors between them (the south's middle bay open), the frieze, the brackets, the green roof
  const R1 = 14.6, H1 = 7.9, e1 = ring(R1, 12);
  for (const [x, z] of e1) column(bag, col, x, z, F, H1 - 0.2, 0.62, 'lacquer_red');
  for (let i = 0; i < 12; i++) {
    const A = e1[i], B = e1[(i + 1) % 12], mid = Math.atan2((A[1] + B[1]) / 2 - c[1], (A[0] + B[0]) / 2 - c[0]);
    const south = Math.abs(mid - Math.PI / 2) < 0.2;
    // the doorway: the leaves folded back inside, the lattice transom over it
    if (south) { latticeBay(bag, null, A, B, F + 5.4, H1 - 0.75 - 5.4, 'window'); continue; }
    latticeBay(bag, col, A, B, F, H1 - 0.75, 'door');
  }
  frieze(bag, c, R1, 12, F + H1 - 0.62, 0.5, 0.31, 'longfeng');
  bracketRing(bag, c, R1, F + H1 - 0.12, 44, 2, F + H1 + 0.9);
  roundRoof(bag, c, R1 + 2.7, F + H1 + 0.75, 11.3, F + 11.4, 'tile_green');
  // the gold columns inside and the second drum over them: red walls with a band of lattice windows
  const R2 = 10.9, e2 = ring(R2, 12);
  for (const [x, z] of e2) column(bag, col, x, z, F, 15.0, 0.85, 'lacquer_red');
  for (let i = 0; i < 12; i++) {
    const A = e2[i], B = e2[(i + 1) % 12], t = [];
    beamTris(t, [A[0], F + 11.2, A[1]], [B[0], F + 11.2, B[1]], 0.14, 3.4); bag.add('palace_wall', fromTriangles(t));
    latticeBay(bag, null, A, B, F + 12.0, 1.6, 'window');
  }
  frieze(bag, c, R2, 12, F + 14.6, 0.45, 0.43, 'longfeng');
  bracketRing(bag, c, R2, F + 15.07, 32, 2, F + 16.0);
  roundRoof(bag, c, R2 + 2.5, F + 15.85, 7.2, F + 18.7, 'tile_yellow');
  // the four dragon-well pillars and the top drum, the blue roof, the gilt finial
  const R3 = 6.9, e3 = ring(R3, 12), dw = ring(4.4, 4, 0);
  for (const [x, z] of dw) { column(bag, col, x, z, F, 19.0, 1.2, 'lacquer_red'); for (const yy of [2.5, 9, 15.5]) bag.add('gilt_bronze', lathe([[0.61, 0], [0.63, 0.05], [0.63, 0.6], [0.61, 0.65]], 16, null, x, F + yy, z)); }
  for (let i = 0; i < 12; i++) {
    const A = e3[i], B = e3[(i + 1) % 12], t = [];
    beamTris(t, [A[0], F + 18.4, A[1]], [B[0], F + 18.4, B[1]], 0.14, 3.6); bag.add('palace_wall', fromTriangles(t));
    latticeBay(bag, null, A, B, F + 19.2, 1.5, 'window');
  }
  for (const [x, z] of e3) bag.add('lacquer_red', lathe([[0.2, 0], [0.19, 4.0], [0.001, 4.0]], 10, null, x, F + 18.4, z));
  frieze(bag, c, R3, 12, F + 21.9, 0.4, 0.2, 'longfeng');
  bracketRing(bag, c, R3, F + 22.32, 24, 2, F + 23.2);
  roundRoof(bag, c, R3 + 2.6, F + 23.1, 0.7, F + 31.2, 'glaze_blue', 40);
  bag.add('gilt_bronze', lathe([[0.85, F + 31.0], [0.7, F + 31.6], [0.4, F + 32.0], [0.5, F + 32.4], [0.32, F + 32.9], [0.6, F + 33.5], [1.0, F + 34.4], [1.05, F + 35.1], [0.8, F + 36.0], [0.35, F + 36.6], [0.42, F + 36.9], [0.001, F + 37.4]], 16, null, c[0], 0, c[1]));
  // the ceilings seen from inside: over each ring a painted ceiling; over the dragon-well pillars the caisson
  for (const [ra, rb, yy] of [[R1 + 0.3, R2, F + H1 + 0.02], [R2, R3, F + 15.2], [R3, 5.4, F + 22.2]]) bag.add('paint_caihua', lathe([[ra, yy], [rb, yy]], 48, null, c[0], 0, c[1]));
  caissonRound(bag, c, F + 22.2);
  // the shrine of the tablet of Heaven at the north: a dais, the red and gilt shrine, the gilt screen behind
  const sz = c[1] - 7.6;
  bag.add('marble_smooth', box(c[0] - 2.6, F, sz - 1.6, c[0] + 2.6, F + 0.75, sz + 1.6));
  for (let k = 0; k < 3; k++) bag.add('marble_smooth', box(c[0] - 1.2, F, sz + 1.6 + k * 0.28, c[0] + 1.2, F + 0.75 - (k + 1) * 0.25 + 0.25 - 0.01, sz + 1.6 + (k + 1) * 0.28));
  bag.add('lacquer_red', box(c[0] - 0.9, F + 0.75, sz - 0.6, c[0] + 0.9, F + 2.9, sz + 0.4));
  bag.add('gilt_bronze', box(c[0] - 0.5, F + 1.3, sz + 0.4, c[0] + 0.5, F + 2.5, sz + 0.43));
  bag.add('lacquer_red', box(c[0] - 1.05, F + 2.9, sz - 0.75, c[0] + 1.05, F + 3.15, sz + 0.55));
  bag.add('wood_dark', box(c[0] - 2.4, F + 0.75, sz - 1.5, c[0] + 2.4, F + 4.3, sz - 1.3));
  { const P = new Parts(); reliefDragon(P, 'gilt_bronze', 4.4, 3.2, 0.17, { lite: true, pearl: true, dir: 1 }); P.emit(bag, c[0] - 0.9, F + 0.95, sz - 1.28); const Q = new Parts(); reliefDragon(Q, 'gilt_bronze', 4.4, 3.2, 0.17, { lite: true, pearl: true, dir: -1, phase: Math.PI }); Q.emit(bag, c[0] + 0.9, F + 0.95, sz - 1.28);
    for (const sx of [-1, 1]) { const C = new Parts(); cloud(C, 'gilt_bronze', 0, 0, 0.7, 0); C.emit(bag, c[0] + sx * 1.9, F + 1.4, sz - 1.28); C.emit(bag, c[0] + sx * 1.9, F + 3.4, sz - 1.28); } }
  bag.add('lacquer_red', box(c[0] - 2.55, F + 0.7, sz - 1.55, c[0] + 2.55, F + 0.78, sz - 1.25));
  bag.add('gilt_bronze', box(c[0] - 2.5, F + 4.3, sz - 1.55, c[0] + 2.5, F + 4.42, sz - 1.25));
  bag.add('lacquer_red', box(c[0] - 1.6, F, sz + 2.6, c[0] + 1.6, F + 0.9, sz + 3.5));
  for (const dx of [-1, 0, 1]) bag.add('bronze', lathe([[0.18, 0], [0.22, 0.12], [0.16, 0.26], [0.2, 0.3], [0.001, 0.3]], 10, null, c[0] + dx, F + 0.9, sz + 3.05));
  // the tables before the seat: the prayer-board table and the incense-and-silk table, and on each side the tables of food and of wine
  // vessels for the companion tablets (Sohu: "祝版案、香帛案 … 馔桌、尊桌")
  const table = (x, z, w, d, hgt = 0.95) => { bag.add('lacquer_red', box(x - w / 2, F + hgt - 0.08, z - d / 2, x + w / 2, F + hgt, z + d / 2)); for (const sx of [-1, 1]) for (const sz2 of [-1, 1]) bag.add('lacquer_red', box(x + sx * (w / 2 - 0.1) - 0.05, F, z + sz2 * (d / 2 - 0.08) - 0.05, x + sx * (w / 2 - 0.1) + 0.05, F + hgt - 0.08, z + sz2 * (d / 2 - 0.08) + 0.05)); bag.add('gilt_bronze', box(x - w / 2 - 0.02, F + hgt - 0.1, z - d / 2 - 0.02, x + w / 2 + 0.02, F + hgt - 0.08, z + d / 2 + 0.02)); col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], F, F + hgt); };
  table(c[0] - 1.1, sz + 5.2, 1.8, 0.7); table(c[0] + 1.1, sz + 5.2, 1.8, 0.7);
  bag.add('bronze', lathe([[0.12, 0], [0.16, 0.1], [0.1, 0.24], [0.14, 0.3], [0.001, 0.3]], 10, null, c[0] - 1.1, F + 0.95, sz + 5.2)); bag.add('paint_blue', box(c[0] + 0.6, F + 0.95, sz + 5.05, c[0] + 1.6, F + 1.0, sz + 5.35));
  for (const sx of [-1, 1]) for (const k of [0, 1]) { table(c[0] + sx * 4.6, sz + 3.0 + k * 2.6, 0.7, 1.7, 0.9); for (let j = 0; j < 3; j++) bag.add(k ? 'bronze' : 'plaster_white', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.14], [0.001, 0.14]], 10, null, c[0] + sx * 4.6, F + 0.9, sz + 2.5 + k * 2.6 + j * 0.5)); }
  col.rect([c[0] - 2.6, sz - 1.6, c[0] + 2.6, sz + 1.6], F, F + 4.3);
  col.rect([c[0] - 1.6, sz + 2.6, c[0] + 1.6, sz + 3.5], F, F + 1.2);

  // the two side halls (peidian) at the north-east and north-west of the court, single-eaved, blue-tiled (Sohu), turned to the altar
  const pal = { wood: 'paint_caihua', column: 'lacquer_red', soffit: 'paint_caihua', base: 'marble', floor: 'brick_paving', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'palace_wall', plinth: 'marble', roof: 'glaze_blue' };
  for (const sx of [-1, 1]) {
    const hx = c[0] + sx * 43.5, hz = c[1] - 44, rect = [hx - 4.2, hz - 6.5, hx + 4.2, hz + 6.5];
    style.elements.qing_hall({ rect, y: y0 + 0.9, H: 4.2, roof: 'xieshan', bays: [5, 3], front: sx < 0 ? 'e' : 'w', four: true, plat: 0.9, pal, orn: { figures: 3 } }, { bag, col, style });
    style.elements.stairs({ rect: [sx < 0 ? rect[2] : rect[0] - 2.2, hz - 1.5, sx < 0 ? rect[2] + 2.2 : rect[0], hz + 1.5], y0: y0 + 0.03, y1: y0 + 0.9, dir: sx < 0 ? 'e' : 'w', mat: 'marble' }, { bag, col, style });
  }
  // the burning furnaces of cast iron on six open legs (Sohu), a pair before the hall on the top tier
  for (const sx of [-1, 1]) {
    const fx = c[0] + sx * 9, fz = c[1] + 22, ty = y0 + tiers[2][1] + 0.02, P = new Parts();
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; P.add('iron', limb([Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62], [Math.cos(a) * 0.5, 0.75, Math.sin(a) * 0.5], 0.08, 0.06, 6)); P.add('iron', limb([Math.cos(a) * 0.5, 0.75, Math.sin(a) * 0.5], [Math.cos(a + 0.5) * 0.52, 1.15, Math.sin(a + 0.5) * 0.52], 0.05, 0.04, 5)); }
    P.add('iron', lathe([[0.001, 0.72], [0.62, 0.74], [0.7, 1.4], [0.76, 1.75], [0.66, 1.78], [0.001, 1.6]].map(([r, v]) => [r, v]), 14));
    P.add('iron', torus(0.74, 0.04, 14, 4).translate(0, 1.78, 0));
    P.emit(bag, fx, ty, fz); col.circle(fx, fz, 0.8, ty, ty + 1.8);
  }
}
