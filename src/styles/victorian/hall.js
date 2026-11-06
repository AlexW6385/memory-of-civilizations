// Westminster Hall (docs/settlements/london.md §1.3): William Rufus' hall of 1097–99 as Richard II remade it
// (1393–1401): 73 m by 20.7 m within thick stone walls refaced with a carved string course and traceried windows,
// buttressed outside; Hugh Herland's hammerbeam roof of oak — each truss a wall post on a stone corbel, a curved
// brace under the hammer beam, the hammer beam projecting 6.5 m with a carved angel holding a shield at its end,
// the hammer post standing on it, the great arch rising from low on the wall through the hammer post to the
// collar 19.35 m over the floor, open tracery between arch and rafters; purlins and boarding under the lead;
// the louvred lantern on the ridge. The north front (Soane, 1819–22, after Richard II's): the great doorway, the
// great window over it, the two towers. At the south end Barry's broad flight of steps rises to St Stephen's
// Porch under the great south window, with the statues of kings in their niches.
//
// westminster_hall: { rect (long along z; north end z0), y, h (wall), ridge }

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { faceFrame, prism, fbox } from '../dutch/facade.js';
import { figure } from '../../objects/figures.js';

const ST = 'limestone', OAK = 'timber', LD = 'lead';

export function hexa(b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  return fromTriangles(orientOutward(tris));
}
/** a timber in the plane z = const from a to b ([x, y]), t deep in that plane, w wide across it */
function tb(a, b, z, w, t) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * t / 2, ny = dx / L * t / 2;
  const P = (p, s, zz) => [p[0] + s * nx, p[1] + s * ny, zz];
  return hexa([P(a, -1, z - w / 2), P(b, -1, z - w / 2), P(b, -1, z + w / 2), P(a, -1, z + w / 2)], [P(a, 1, z - w / 2), P(b, 1, z - w / 2), P(b, 1, z + w / 2), P(a, 1, z + w / 2)]);
}
/** a curved timber along pts ([x, y]…) in the plane z */
const curved = (bag, m, pts, z, w, t) => { for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], e = 0.04 / Math.hypot(b[0] - a[0], b[1] - a[1]); bag.add(m, tb([a[0] - (b[0] - a[0]) * e, a[1] - (b[1] - a[1]) * e], [b[0] + (b[0] - a[0]) * e, b[1] + (b[1] - a[1]) * e], z, w, t)); } };

/** a pointed (two-centred) head: the height over the springing at offset u from the centre, half width r, rise H */
export const pointed = (u, r, H) => { const R = (r * r + H * H) / (2 * r); return Math.sqrt(Math.max(0, R * R - (Math.abs(u) + R - r) ** 2)); };

/**
 * A traceried window on face frame F (u along, v up from y, d out): lights between mullions, transoms, a pointed head,
 * the glass (`glass`) flush on the face and the stone tracery standing on it, a moulded surround and label.
 */
export function windowOn(bag, F, y, { uc, hw, v0, vs, rise, lights, transoms = [], glass, d = 0, label = true, depth = 0.22 }) {
  const n = 14, P = (m, pts, d0, d1) => bag.add(m, prism(F, y, pts, d0, d1)), head = (u) => vs + pointed(u, hw, rise);
  // the glass: a rectangle to the springing, strips up the head
  P(glass, [[uc - hw, v0], [uc + hw, v0], [uc + hw, vs], [uc - hw, vs]], d - 0.04, d + 0.02);
  for (let i = 0; i < n; i++) { const a = -hw + 2 * hw * i / n, b = -hw + 2 * hw * (i + 1) / n; P(glass, [[uc + a, vs], [uc + b, vs], [uc + b, head(b)], [uc + a, head(a)]], d - 0.04, d + 0.02); }
  // the mullions up into the head, the transoms, sub-arches over each pair of lights in the head
  const lw = 2 * hw / lights;
  for (let k = 1; k < lights; k++) { const u = -hw + k * lw; P(ST, [[uc + u - 0.08, v0], [uc + u + 0.08, v0], [uc + u + 0.08, head(u + 0.08) - 0.02], [uc + u - 0.08, head(u - 0.08) - 0.02]], d, d + depth); }
  for (const v of transoms) { P(ST, [[uc - hw, v - 0.07], [uc + hw, v - 0.07], [uc + hw, v + 0.07], [uc - hw, v + 0.07]], d, d + depth * 0.9); for (let k = 0; k < lights; k++) { const a = -hw + k * lw; for (const s of [0, 1]) { const e = s ? a + lw : a, f = s ? e - lw * 0.35 : e + lw * 0.35; P(ST, [[uc + e, v - 0.07], [uc + f, v - 0.07], [uc + e, v - 0.07 - lw * 0.32]].sort((p, q) => p[0] - q[0]), d, d + depth * 0.7); } } }
  // the cusped heads of the lights at the springing, and an arch over each pair (the Perpendicular panel tracery)
  for (let k = 0; k < lights; k++) { const a = -hw + k * lw; for (const s of [0, 1]) { const e = s ? a + lw : a, f = s ? e - lw * 0.42 : e + lw * 0.42; P(ST, [[uc + e, vs + 0.02], [uc + f, vs + 0.02], [uc + e, vs - lw * 0.55]].sort((p, q) => p[0] - q[0]), d, d + depth * 0.8); } }
  P(ST, [[uc - hw, vs - 0.06], [uc + hw, vs - 0.06], [uc + hw, vs + 0.06], [uc - hw, vs + 0.06]], d, d + depth);
  if (lights >= 4) for (let k = 0; k + 1 < lights; k += 2) {
    const a = -hw + k * lw, c = a + lw, r = lw, pts = [];
    for (let j = 0; j <= 8; j++) { const t = -r + 2 * r * j / 8; pts.push([uc + c + t, vs + 0.06 + pointed(t, r, r * 1.2)]); }
    for (let j = 0; j < 8; j++) P(ST, [[pts[j][0], pts[j][1] - 0.07], [pts[j + 1][0], pts[j + 1][1] - 0.07], [pts[j + 1][0], pts[j + 1][1] + 0.07], [pts[j][0], pts[j][1] + 0.07]], d, d + depth * 0.8);
  }
  // the surround (a hollow moulding) and the label over the head
  for (const s of [-1, 1]) { const a = Math.min(uc + s * hw, uc + s * (hw + 0.3)), b = Math.max(uc + s * hw, uc + s * (hw + 0.3)); P(ST, [[a, v0 - 0.2], [b, v0 - 0.2], [b, vs], [a, vs]], d - 0.02, d + 0.3); }
  for (let i = 0; i < n; i++) { const a = -hw + 2 * hw * i / n, b = -hw + 2 * hw * (i + 1) / n, ga = (hw + 0.3) / hw; P(ST, [[uc + a, head(a)], [uc + b, head(b)], [uc + b * ga, vs + pointed(b * ga, hw + 0.3, rise + 0.3)], [uc + a * ga, vs + pointed(a * ga, hw + 0.3, rise + 0.3)]], d - 0.02, d + 0.3); }
  P(ST, [[uc - hw - 0.3, v0 - 0.36], [uc + hw + 0.3, v0 - 0.36], [uc + hw + 0.3, v0 - 0.2], [uc - hw - 0.3, v0 - 0.2]], d - 0.02, d + 0.36);
  if (label) for (let i = 0; i < n; i++) { const a = -hw - 0.3 + 2 * (hw + 0.3) * i / n, b = -hw - 0.3 + 2 * (hw + 0.3) * (i + 1) / n, R = hw + 0.3; P(ST, [[uc + a, vs + pointed(a, R, rise + 0.3)], [uc + b, vs + pointed(b, R, rise + 0.3)], [uc + b, vs + pointed(b, R, rise + 0.3) + 0.16], [uc + a, vs + pointed(a, R, rise + 0.3) + 0.16]], d - 0.02, d + 0.38); }
}

/** a king (or queen) in his niche: the canopied recess, the figure crowned; with ctx a robed figure, else a simple one holding orb and sceptre */
export function kingNiche(bag, F, y, u, v, d, ctx = null, seed = 1) {
  const P = (m, pts, d0, d1) => bag.add(m, prism(F, y, pts, d0, d1)), A = (m, ...r) => bag.add(m, fbox(F, y, ...r));
  A('opening', u - 0.55, u + 0.55, v, v + 2.4, d - 0.02, d + 0.01);
  for (const s of [-1, 1]) A(ST, u + s * 0.55 - 0.1, u + s * 0.55 + 0.1, v - 0.15, v + 2.6, d, d + 0.35);
  A(ST, u - 0.75, u + 0.75, v - 0.3, v, d, d + 0.45);
  P(ST, [[u - 0.7, v + 2.4], [u + 0.7, v + 2.4], [u, v + 3.3]], d, d + 0.4);
  const [x, z] = F.at(u, d + 0.25);
  if (ctx) {
    const [x1, z1] = F.at(u, d + 1.25), rot = Math.atan2(-(x1 - x), -(z1 - z)), h = 1.72, queen = seed % 4 === 3;
    figure({ t: 'figure', at: [x, z], y: y + v, rot, seed, h, dress: 'robe', cloth: 'limestone_carved', cloth2: 'limestone_carved', skin: 'limestone_carved', hairMat: 'limestone_carved', hair: queen ? 'long' : 'short', beard: !queen, over: 'cape', feet: 'bare', pose: 'stand' }, ctx);
    bag.add('limestone_carved', lathe([[0.1, 0], [0.105, 0.09], [0.13, 0.14], [0.001, 0.12]], 8, null, x, y + v + h * 1.075 - 0.07, z));
    return;
  }
  bag.add('limestone_carved', lathe([[0.3, 0], [0.3, 0.12], [0.24, 0.9], [0.22, 1.35], [0.25, 1.5], [0.15, 1.62], [0.001, 1.63]], 10, null, x, y + v, z));
  bag.add('limestone_carved', lathe([[0.001, 0], [0.1, 0.03], [0.11, 0.15], [0.07, 0.23], [0.001, 0.25]], 8, null, x, y + v + 1.63, z));
  bag.add('limestone_carved', lathe([[0.1, 0], [0.11, 0.1], [0.13, 0.14], [0.001, 0.15]], 6, null, x, y + v + 1.82, z));
}

export function westminsterHall(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, T = 1.6, h = el.h ?? 14, ridge = y + (el.ridge ?? 28);
  const xi0 = x0 + T, xi1 = x1 - T, zi0 = z0 + T, zi1 = z1 - T, cx = (x0 + x1) / 2, W = xi1 - xi0, Li = zi1 - zi0;
  const door = 2.3, dSpring = 4.6, dRise = 3.2;
  // ── the walls: the long walls, the north wall round its doorway, the south wall
  bag.add(ST, box(x0, y - 0.5, z0, xi0, y + h, z1)); bag.add(ST, box(xi1, y - 0.5, z0, x1, y + h, z1));
  col.rect([x0, z0, xi0, z1], y - 0.5, y + h); col.rect([xi1, z0, x1, z1], y - 0.5, y + h);
  bag.add(ST, box(xi0, y - 0.5, z0, cx - door, y + h, zi0)); bag.add(ST, box(cx + door, y - 0.5, z0, xi1, y + h, zi0)); bag.add(ST, box(cx - door, y + dSpring + dRise, z0, cx + door, y + h, zi0));
  col.rect([xi0, z0, cx - door, zi0], y - 0.5, y + h); col.rect([cx + door, z0, xi1, zi0], y - 0.5, y + h); col.rect([cx - door, z0, cx + door, zi0], y + dSpring + dRise, y + h);
  { const n = 10; for (let i = 0; i < n; i++) { const a = -door + 2 * door * i / n, b = -door + 2 * door * (i + 1) / n; bag.add(ST, hexa([[cx + a, y + dSpring + pointed(a, door, dRise), z0], [cx + b, y + dSpring + pointed(b, door, dRise), z0], [cx + b, y + dSpring + pointed(b, door, dRise), zi0], [cx + a, y + dSpring + pointed(a, door, dRise), zi0]], [[cx + a, y + dSpring + dRise + 0.01, z0], [cx + b, y + dSpring + dRise + 0.01, z0], [cx + b, y + dSpring + dRise + 0.01, zi0], [cx + a, y + dSpring + dRise + 0.01, zi0]])); } }
  // the south wall, pierced by the porch's great arch (up to the landing, then the arch: half width 3.2, springing 6.6, rise 3)
  { const up = 2.4, r = 3.2, vs = y + up + 4.2, H = 3.0, top = vs + H;
    bag.add(ST, box(xi0, y - 0.5, zi1, cx - r, y + h, z1)); bag.add(ST, box(cx + r, y - 0.5, zi1, xi1, y + h, z1)); bag.add(ST, box(cx - r, top, zi1, cx + r, y + h, z1)); bag.add(ST, box(cx - r, y - 0.5, zi1, cx + r, y + up - 0.3, z1));
    col.rect([xi0, zi1, cx - r, z1], y - 0.5, y + h); col.rect([cx + r, zi1, xi1, z1], y - 0.5, y + h); col.rect([cx - r, zi1, cx + r, z1], top, y + h);
    for (let i = 0; i < 12; i++) { const a = -r + 2 * r * i / 12, b = -r + 2 * r * (i + 1) / 12, ha = vs + pointed(a, r, H), hb = vs + pointed(b, r, H); bag.add(ST, hexa([[cx + a, ha, zi1], [cx + b, hb, zi1], [cx + b, hb, z1], [cx + a, ha, z1]], [[cx + a, top + 0.01, zi1], [cx + b, top + 0.01, zi1], [cx + b, top + 0.01, z1], [cx + a, top + 0.01, z1]])); }
    bag.add('flagstone', box(cx - r, y + up - 0.3, zi1 - 0.01, cx + r, y + up, z1 + 0.01)); col.floor([cx - r, zi1, cx + r, z1], y + up); }
  // the gables, carried up to the roof's slopes
  const Y0 = y + h, eave = xi0 - 0.25, k = (ridge - Y0) / (cx - eave);
  for (const [za, zb] of [[z0, zi0], [zi1, z1]]) bag.add(ST, hexa([[x0, Y0, za], [x1, Y0, za], [x1, Y0, zb], [x0, Y0, zb]], [[cx - 0.01, ridge + 0.6, za], [cx + 0.01, ridge + 0.6, za], [cx + 0.01, ridge + 0.6, zb], [cx - 0.01, ridge + 0.6, zb]]));
  // the copings of the gables and a finial at each apex
  for (const [za, zb] of [[z0 - 0.15, zi0 - 0.2], [zi1 + 0.2, z1 + 0.15]]) {
    const kg = (ridge + 0.6 - Y0) / (cx - x0), ya = Y0 - 0.2 * kg - 0.05;
    for (const s of [-1, 1]) { const xa = s < 0 ? x0 - 0.2 : x1 + 0.2; bag.add(ST, hexa([[xa, ya, za], [cx, ridge + 0.55, za], [cx, ridge + 0.55, zb], [xa, ya, zb]], [[xa, ya + 0.45, za], [cx, ridge + 1.0, za], [cx, ridge + 1.0, zb], [xa, ya + 0.45, zb]])); }
    bag.add(ST, lathe([[0.35, 0], [0.3, 0.8], [0.4, 1.0], [0.001, 2.4]], 4, null, cx, ridge + 0.9, (za + zb) / 2));
  }
  // the floor of stone flags
  bag.add('flagstone', box(xi0, y - 0.3, zi0, xi1, y + 0.05, zi1)); col.floor([xi0, zi0, xi1, zi1], y + 0.05);
  bag.add('flagstone', box(cx - door, y - 0.3, z0 - 0.6, cx + door, y + 0.05, zi0)); col.floor([cx - door, z0 - 0.6, cx + door, zi0], y + 0.05);

  // ── the roof: two slopes of oak boarding under lead, from the wall heads to the ridge
  const zr0 = z0 - 0.35, zr1 = z1 + 0.35, rt = 0.32;
  for (const s of [-1, 1]) {
    const xe = s < 0 ? eave : xi1 + 0.25, P = (x, yy, z) => [x, yy, z];
    bag.add(OAK, hexa([P(xe, Y0 - rt, zr0), P(cx, ridge - rt, zr0), P(cx, ridge - rt, zr1), P(xe, Y0 - rt, zr1)], [P(xe, Y0, zr0), P(cx, ridge, zr0), P(cx, ridge, zr1), P(xe, Y0, zr1)]));
    bag.add(LD, hexa([P(xe, Y0, zr0), P(cx, ridge, zr0), P(cx, ridge, zr1), P(xe, Y0, zr1)], [P(xe, Y0 + 0.08, zr0), P(cx, ridge + 0.08, zr0), P(cx, ridge + 0.08, zr1), P(xe, Y0 + 0.08, zr1)]));
    // the lead rolls running down the slope
    for (let z = zr0 + 0.7; z < zr1 - 0.3; z += 0.75) bag.add(LD, tb([xe, Y0 + 0.1], [cx, ridge + 0.1], z, 0.06, 0.06));
    // the parapet over the eaves, with its gutter behind and a cornice outside
    const xo = s < 0 ? x0 : x1, xp = s < 0 ? x0 + 0.7 : x1 - 0.7;
    bag.add(ST, box(Math.min(xo, xp), Y0, z0, Math.max(xo, xp), Y0 + 1.2, z1));
    bag.add(ST, box(Math.min(xo - s * 0.25, xp), Y0 + 1.2, z0 - 0.1, Math.max(xo - s * 0.25, xp), Y0 + 1.38, z1 + 0.1));
    bag.add(ST, box(Math.min(xo, xo + s * 0.3), Y0 - 0.6, z0, Math.max(xo, xo + s * 0.3), Y0 - 0.25, z1));
  }
  bag.add(LD, box(cx - 0.18, ridge - 0.05, zr0, cx + 0.18, ridge + 0.3, zr1));
  // the louvred lantern on the ridge: an octagonal stage of louvres under a lead cap and vane
  { const lz = (zi0 + zi1) / 2, r = 1.9, ly = ridge + 0.1;
    bag.add(LD, lathe([[r + 0.25, -1.6], [r + 0.25, 0.8], [r + 0.35, 0.9], [r + 0.35, 1.05], [0.001, 1.05]], 8, null, cx, ly, lz));
    bag.add(OAK, lathe([[r, 0], [r, 3.1], [0.001, 3.1]], 8, null, cx, ly + 1.05, lz));
    for (let j = 0; j < 8; j++) {
      const a0 = j * Math.PI / 4 + Math.PI / 8, a = a0 + Math.PI / 8, c = Math.cos(a), sn = Math.sin(a), ap = r * Math.cos(Math.PI / 8);
      for (let l = 0; l < 7; l++) { const g = box(-0.62, -0.035, -0.02, 0.62, 0.035, 0.16); g.rotateX(-0.6); g.rotateY(-a + Math.PI / 2); g.translate(cx + c * ap, ly + 1.4 + l * 0.36, lz + sn * ap); bag.add(LD, g); }
      const pc = [cx + Math.cos(a0) * (r + 0.02), lz + Math.sin(a0) * (r + 0.02)]; bag.add(OAK, box(pc[0] - 0.12, ly + 1.05, pc[1] - 0.12, pc[0] + 0.12, ly + 4.15, pc[1] + 0.12));
    }
    bag.add(LD, lathe([[r + 0.4, 0], [r + 0.3, 0.3], [r * 0.6, 1.4], [0.35, 2.6], [0.12, 3.4], [0.001, 3.7]], 8, null, cx, ly + 4.15, lz));
    bag.add('iron', lathe([[0.04, 0], [0.03, 1.6], [0.001, 1.6]], 6, null, cx, ly + 7.8, lz));
    bag.add('gilt_bronze', box(cx - 0.02, ly + 8.6, lz - 0.55, cx + 0.02, ly + 9.0, lz + 0.35)); }

  // ── the trusses: thirteen, the end ones close to the gables
  const nT = 13, sp = Li / nT, Hb = y + 12.2, proj = (W - 7.77) / 2, Ac = y + 9.0, AR = W / 2, Hc = y + 19.35;
  const X = (q, s) => (s < 0 ? xi0 + q : xi1 - q);
  const raf = (q) => Y0 - rt + k * (q + (xi0 - eave));                               // underside of the boarding over q
  for (let i = 0; i < nT; i++) {
    const z = zi0 + (i + 0.5) * sp;
    for (const s of [-1, 1]) {
      // the stone corbel, the wall post, the brace under the hammer, the hammer beam
      bag.add('limestone_carved', box(Math.min(X(-0.05, s), X(0.55, s)), y + 7.7, z - 0.32, Math.max(X(-0.05, s), X(0.55, s)), y + 8.5, z + 0.32));
      bag.add('limestone_carved', lathe([[0.001, 0], [0.2, 0.05], [0.22, 0.28], [0.001, 0.3]], 8, null, X(0.42, s), y + 7.45, z));
      bag.add(OAK, tb([X(0.2, s), y + 8.5], [X(0.2, s), Hb], z, 0.42, 0.4));
      curved(bag, OAK, Array.from({ length: 7 }, (_, j) => { const t = j / 6 * Math.PI / 2; return [X(proj - (proj - 0.4) * Math.cos(t), s), Hb - 3.0 + 3.0 * Math.sin(t) - 0.12]; }), z, 0.38, 0.3);
      bag.add(OAK, tb([X(-0.4, s), Hb + 0.27], [X(proj, s), Hb + 0.27], z, 0.46, 0.56));
      // the great arch from low on the wall to the collar
      curved(bag, OAK, Array.from({ length: 11 }, (_, j) => { const t = j / 10 * Math.PI / 2; return [X(AR - (AR - 0.25) * Math.cos(t), s), Ac + (Hc - Ac) * Math.sin(t)]; }), z, 0.44, 0.48);
      // the hammer post up to the principal rafter; the principal rafter; struts of the open tracery between arch and rafter
      bag.add(OAK, tb([X(proj, s), Hb + 0.5], [X(proj, s), raf(proj)], z, 0.4, 0.42));
      bag.add(OAK, tb([X(-0.2, s), raf(-0.2) - 0.2], [cx, ridge - rt - 0.2], z, 0.44, 0.42));
      for (const q of [2.2, 4.3, 8.2]) { const ya = Ac + (Hc - Ac) * Math.sqrt(Math.max(0, 1 - ((AR - q) / (AR - 0.25)) ** 2)); if (raf(q) - ya > 0.5) bag.add(OAK, tb([X(q, s), ya], [X(q, s), raf(q)], z, 0.22, 0.18)); }
      // the angel at the hammer's end: a half-figure leaning out, wings raised, a shield before it
      { const xe = X(proj, s), dir = -s, yb = Hb + 0.1;
        const body = lathe([[0.001, -0.62], [0.26, -0.42], [0.3, 0], [0.24, 0.4], [0.001, 0.55]], 10, null, 0, 0, 0);
        body.scale(1, 1, 0.75); body.rotateZ(dir > 0 ? -Math.PI / 2 + 0.5 : Math.PI / 2 - 0.5); body.translate(xe + dir * 0.55, yb - 0.1, z); bag.add(OAK, body);
        bag.add(OAK, lathe([[0.001, 0], [0.13, 0.04], [0.15, 0.16], [0.1, 0.26], [0.001, 0.29]], 8, null, xe + dir * 1.05, yb + 0.12, z));
        for (const w of [-1, 1]) { const pts = [[xe, yb + 0.05], [xe + dir * 0.75, yb + 0.15], [xe + dir * 0.3, yb + 1.4], [xe - dir * 0.15, yb + 0.95]]; bag.add(OAK, hexa(pts.map(([a, b]) => [a, b, z + w * 0.22]), pts.map(([a, b]) => [a, b, z + w * 0.3]))); }
        bag.add('wood_dark', box(Math.min(xe + dir * 0.9, xe + dir * 1.0), yb - 0.85, z - 0.24, Math.max(xe + dir * 0.9, xe + dir * 1.0), yb - 0.2, z + 0.24)); }
    }
    // the collar, the king strut, the queen struts
    bag.add(OAK, tb([cx - 3.4, Hc + 0.1], [cx + 3.4, Hc + 0.1], z, 0.44, 0.5));
    bag.add(OAK, tb([cx, Hc + 0.35], [cx, ridge - rt - 0.2], z, 0.36, 0.34));
    for (const s of [-1, 1]) bag.add(OAK, tb([cx + s * 2.6, Hc + 0.35], [cx + s * 2.6, raf(W / 2 - 2.6)], z, 0.3, 0.28));
  }
  // the purlins and the wall plates running the length of the hall; the ridge piece
  for (const s of [-1, 1]) {
    for (const q of [2.2, proj, W / 2 - 2.6]) { const xx = X(q, s), yy = raf(q); bag.add(OAK, box(xx - 0.2, yy - 0.42, zi0 - 0.05, xx + 0.2, yy + 0.05, zi1 + 0.05)); }
    bag.add(OAK, box(Math.min(X(-0.1, s), X(0.55, s)), Y0 - 0.55, zi0 - 0.05, Math.max(X(-0.1, s), X(0.55, s)), Y0 - 0.05, zi1 + 0.05));
  }
  bag.add(OAK, box(cx - 0.2, ridge - rt - 0.45, zi0 - 0.05, cx + 0.2, ridge - rt + 0.05, zi1 + 0.05));

  // ── the long walls, inside and out: the string course, the windows of each bay, the buttresses
  for (const f of ['w', 'e']) {
    const Fo = faceFrame(el.rect, f), Fi = f === 'w' ? faceFrame([xi0 - 1, z0, xi0, z1], 'e') : faceFrame([xi1, z0, xi1 + 1, z1], 'w'), L = Fo.w;
    void L;
    const Ao = (m, ...r) => bag.add(m, fbox(Fo, y, ...r));
    Ao(ST, -0.1, Fo.w + 0.1, -0.5, 0.8, 0, 0.3);
    for (let i = 0; i < nT; i++) {
      const z = zi0 + (i + 0.5) * sp, zb = zi0 + (i + 1) * sp;
      // u of z on each frame: outside the 'w' frame runs with z, 'e' against it; the inner frames the other way
      const uo = (zz) => (f === 'w' ? zz - z0 : z1 - zz), ui = (zz) => (f === 'w' ? z1 - zz : zz - z0);
      // the buttress at each truss, stepped twice
      Ao(ST, uo(z) - 0.7, uo(z) + 0.7, -0.5, h - 1.0, 0, 1.0); Ao(ST, uo(z) - 0.7, uo(z) + 0.7, -0.5, 5.5, 0, 1.6);
      Fo && bag.add(ST, prism(Fo, y, [[uo(z) - 0.7, 5.5], [uo(z) + 0.7, 5.5], [uo(z) + 0.7, 6.3], [uo(z) - 0.7, 6.3]], 1.0, 1.6));
      bag.add(ST, prism(Fo, y, [[uo(z) - 0.7, h - 1.0], [uo(z) + 0.7, h - 1.0], [uo(z), h + 0.6]], 0, 1.0));
      if (i === nT - 1) continue;
      windowOn(bag, Fo, y, { uc: uo(zb), hw: 1.25, v0: 7.4, vs: 10.2, rise: 1.6, lights: 2, glass: 'glass_outer', depth: 0.18 });
      windowOn(bag, Fi, y, { uc: ui(zb), hw: 1.25, v0: 7.4, vs: 10.2, rise: 1.6, lights: 2, glass: 'daylight_plain', depth: 0.18, label: false });
    }
    // inside: the string course carved with the king's badges, a plain dado of panelling stone below
    const Ai = (m, ...r) => bag.add(m, fbox(Fi, y, ...r));
    Ai('limestone_carved', 0, Fi.w, 6.5, 6.85, 0, 0.22); Ai(ST, 0, Fi.w, 6.85, 7.0, 0, 0.1);
    for (let u = 0.8; u < Fi.w - 0.4; u += 1.6) { const [x, z] = Fi.at(u, 0.22); bag.add('limestone_carved', lathe([[0.001, 0], [0.12, 0.04], [0.13, 0.12], [0.001, 0.16]], 6, null, x, y + 6.6, z)); }
    Ai(ST, 0, Fi.w, 0.05, 0.4, 0, 0.12);
  }
  // the corbel table of the outside cornice is the parapet's; the north front
  northFront(bag, col, el, { y, h, T, cx, x0, x1, z0, zi0, door, dSpring, dRise, ridge, k, Y0 }, ctx);
  southEnd(bag, col, el, { y, h, cx, xi0, xi1, zi0, zi1, z1, ridge, k, Y0 }, ctx);
}

function northFront(bag, col, el, { y, h, cx, x0, x1, z0, zi0, door, dSpring, dRise, ridge, k, Y0 }, ctx) {
  const Fo = faceFrame(el.rect, 'n'), Fi = faceFrame([x0, zi0 - 1, x1, zi0], 's'), uo = (x) => x1 - x, ui = (x) => x - x0;
  const P = (F, m, pts, d0, d1) => bag.add(m, prism(F, y, pts, d0, d1));
  // the great doorway: its orders of mouldings and shafts, the label; the oak leaves standing open against the inner wall
  for (let o = 0; o < 3; o++) {
    const r = door + 0.18 + o * 0.28, n = 12;
    for (let i = 0; i < n; i++) { const a = -r + 2 * r * i / n, b = -r + 2 * r * (i + 1) / n, r2 = r - 0.2; const A2 = Math.abs(a) <= r2 ? a : Math.sign(a) * r2, B2 = Math.abs(b) <= r2 ? b : Math.sign(b) * r2;
      P(Fo, ST, [[uo(cx) + a, dSpring + pointed(a, r, dRise + o * 0.25)], [uo(cx) + b, dSpring + pointed(b, r, dRise + o * 0.25)], [uo(cx) + B2, dSpring + pointed(B2, r2, dRise + o * 0.25 - 0.18) - 0.01], [uo(cx) + A2, dSpring + pointed(A2, r2, dRise + o * 0.25 - 0.18) - 0.01]], 0, 0.5 - o * 0.15); }
    for (const s of [-1, 1]) { const [sx, sz] = Fo.at(uo(cx) + s * (r - 0.1), 0.2); bag.add('limestone_carved', lathe([[0.13, 0], [0.11, 0.25], [0.11, dSpring - 0.3], [0.15, dSpring - 0.1], [0.15, dSpring]], 8, null, sx, y, sz)); }
  }
  { const r = door + 1.0, n = 14; for (let i = 0; i < n; i++) { const a = -r + 2 * r * i / n, b = -r + 2 * r * (i + 1) / n, H = dRise + 0.85; P(Fo, ST, [[uo(cx) + a, dSpring + pointed(a, r, H)], [uo(cx) + b, dSpring + pointed(b, r, H)], [uo(cx) + b, dSpring + pointed(b, r, H) + 0.18], [uo(cx) + a, dSpring + pointed(a, r, H) + 0.18]], 0, 0.6); } }
  for (const s of [-1, 1]) {
    const xl = cx + s * (door - 0.08), lw = door - 0.1;
    bag.add('wood_dark', box(Math.min(xl, xl - s * 0.12), y + 0.05, zi0, Math.max(xl, xl - s * 0.12), y + dSpring + 1.2, zi0 + lw));
    for (let j = 0; j < 6; j++) bag.add('iron', box(Math.min(xl - s * 0.12, xl - s * 0.15), y + 0.6 + j * 0.85, zi0 + 0.2, Math.max(xl - s * 0.12, xl - s * 0.15), y + 0.68 + j * 0.85, zi0 + lw - 0.2));
    col.rect([Math.min(xl, xl - s * 0.15), zi0, Math.max(xl, xl - s * 0.15), zi0 + lw], y, y + dSpring + 1.2);
  }
  // the great window over the door, inside and out
  const gw = { uc: 0, hw: 5.2, v0: 9.6, vs: 18.4, rise: 5.6, lights: 8, transoms: [12.6, 15.6] };
  windowOn(bag, Fo, y, { ...gw, uc: uo(cx), glass: 'glass_outer', depth: 0.3 });
  windowOn(bag, Fi, y, { ...gw, uc: ui(cx), glass: 'daylight_plain', depth: 0.25, label: false, d: 0 });
  void k; void Y0;
  // the two towers: square, buttressed at their outer corners, in stages with niches and lancets, battlemented, with pinnacles
  for (const s of [-1, 1]) {
    const tx0 = s < 0 ? x0 - 1.2 : x1 - 5.8, tx1 = s < 0 ? x0 + 5.8 : x1 + 1.2, tz0 = z0 - 3.2, tz1 = z0 + 3.0, top = y + 27.5, r = [tx0, tz0, tx1, tz1];
    bag.add(ST, box(tx0, y - 0.5, tz0, tx1, top, tz1)); col.rect([tx0, tz0, tx1, tz1], y - 0.5, top);
    for (const f of ['n', s < 0 ? 'w' : 'e', s < 0 ? 'e' : 'w']) {
      const F = faceFrame(r, f), L = F.w, A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
      if (f === (s < 0 ? 'e' : 'w') ) { /* the inner face toward the door: only the stages above the hall's wall show */ }
      for (const v of [0.8, 7.6, 14.6, 21.0, 25.4]) A(ST, -0.1, L + 0.1, v - 0.25, v, 0, 0.22);
      A(ST, -0.15, L + 0.15, -0.5, 0.8, 0, 0.35);
      if (f !== 'n' && f === (s < 0 ? 'e' : 'w')) continue;
      kingNiche(bag, F, y, L / 2, 9.0, 0, ctx, 3 + s);
      windowOn(bag, F, y, { uc: L / 2, hw: 0.55, v0: 15.4, vs: 18.8, rise: 0.9, lights: 2, glass: 'opening', depth: 0.15 });
      windowOn(bag, F, y, { uc: L / 2, hw: 0.75, v0: 21.6, vs: 23.8, rise: 0.9, lights: 2, glass: 'opening', depth: 0.15 });
      for (const u of [0.5, L - 0.5]) A(ST, u - 0.12, u + 0.12, 0.8, 25.2, 0, 0.18);
    }
    // the angle buttresses at the outer corners, set back in stages
    const ox = s < 0 ? tx0 : tx1;
    for (const [w, v1] of [[1.1, 8.0], [0.85, 15.0], [0.6, 25.2]]) { bag.add(ST, box(Math.min(ox, ox + s * w), y - 0.5, tz0 - w, Math.max(ox, ox + s * w), y + v1, tz0 + 1.2)); bag.add(ST, box(Math.min(ox - s * 1.2, ox + s * w), y - 0.5, tz0 - w, Math.max(ox - s * 1.2, ox + s * w), y + v1, tz0)); }
    // the battlements and the pinnacles at the corners
    bag.add(ST, box(tx0 - 0.15, top, tz0 - 0.15, tx1 + 0.15, top + 0.3, tz1 + 0.15));
    for (const [a, b, alongX] of [[tx0, tx1, true], [tz0, tz1, false]]) for (const e of [0, 1]) for (let u = a + 0.35; u < b - 0.3; u += 1.1) { const m = alongX ? [u - 0.3, e ? tz1 - 0.35 : tz0 - 0.15, u + 0.3, e ? tz1 + 0.15 : tz0 + 0.35] : [e ? tx1 - 0.35 : tx0 - 0.15, u - 0.3, e ? tx1 + 0.15 : tx0 + 0.35, u + 0.3]; bag.add(ST, box(m[0], top + 0.3, m[1], m[2], top + 1.2, m[3])); }
    for (const px of [tx0, tx1]) for (const pz of [tz0, tz1]) { bag.add(ST, box(px - 0.4, top, pz - 0.4, px + 0.4, top + 2.0, pz + 0.4)); bag.add(ST, lathe([[0.5, 0], [0.001, 2.6]], 4, null, px, y + 29.5, pz)); bag.add(ST, lathe([[0.001, 0], [0.12, 0.12], [0.001, 0.35]], 6, null, px, y + 32.1, pz)); }
  }
  void ridge; void h;
}

function southEnd(bag, col, el, { y, cx, xi0, xi1, zi0, zi1, z1, ridge }, ctx) {
  // Barry's flight of steps across the south end, up to the landing of St Stephen's Porch; the porch's arch beyond
  const up = 2.4, s0 = zi1 - 10.5, s1 = zi1 - 5.5, n = 14;
  for (let i = 0; i < n; i++) bag.add('limestone', box(xi0 + 2.2, y - 0.2, s0 + (s1 - s0) * i / n, xi1 - 2.2, y + up * (i + 1) / n, s1));
  col.ramp([xi0 + 2.2, s0, xi1 - 2.2, s1], y + 0.05, y + up, 's');
  bag.add('flagstone', box(xi0, y - 0.2, s1, xi1, y + up, zi1)); col.floor([xi0, s1, xi1, zi1], y + up); col.rect([xi0, s1, xi1, zi1], y, y + up - 0.4);
  // the cheeks of the flight, the landing's front and its balustrade either side of the flight
  for (const s of [-1, 1]) {
    const xa = s < 0 ? xi0 : xi1 - 2.2, xb = s < 0 ? xi0 + 2.2 : xi1;
    bag.add('limestone', box(xa, y - 0.2, s0 + 2, xb, y + up, s1));
    bag.add('limestone', box(xa + 0.1, y + up, s1 - 0.25, xb - 0.1, y + up + 1.0, s1 + 0.05)); col.rect([xa, s1 - 0.25, xb, s1 + 0.05], y + up, y + up + 1.0);
    bag.add('limestone', box(xa, y + up + 1.0, s1 - 0.3, xb, y + up + 1.12, s1 + 0.1));
    for (let x = xa + 0.25; x < xb - 0.1; x += 0.36) bag.add('limestone_carved', box(x - 0.05, y + up + 0.15, s1 - 0.33, x + 0.05, y + up + 0.85, s1 - 0.27));
  }
  const Fi = faceFrame([xi0, zi1, xi1, zi1 + 1], 'n'), ui = (x) => xi1 - x, A = (m, ...r) => bag.add(m, fbox(Fi, y, ...r));
  // the porch's great arch (the way on to St Stephen's Porch and Hall), open through the wall
  { const r = 3.2, vs = up + 4.2, H = 3.0, P = (m, pts, d0, d1) => bag.add(m, prism(Fi, y, pts, d0, d1));
    for (let o = 0; o < 3; o++) { const R = r + 0.05 + o * 0.25; for (let i = 0; i < 12; i++) { const a = -R + 2 * R * i / 12, b = -R + 2 * R * (i + 1) / 12, R2 = R - 0.2, A2 = Math.max(-R2, Math.min(R2, a)), B2 = Math.max(-R2, Math.min(R2, b));
      P(ST, [[ui(cx) + a, vs + pointed(a, R, H + o * 0.2)], [ui(cx) + b, vs + pointed(b, R, H + o * 0.2)], [ui(cx) + B2, vs + pointed(B2, R2, H + o * 0.2 - 0.15) - 0.01], [ui(cx) + A2, vs + pointed(A2, R2, H + o * 0.2 - 0.15) - 0.01]], 0, 0.45 - o * 0.12); }
      for (const s of [-1, 1]) A(ST, ui(cx) + s * R - 0.1, ui(cx) + s * R + 0.1, up, vs, 0, 0.45 - o * 0.12); } }
  // the statues of kings in their niches, three either side of the arch
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) kingNiche(bag, Fi, y, ui(cx) + s * (4.8 + j * 1.75), up + 1.2, 0, ctx, 11 + j * 2 + s);
  // the great south window over it
  windowOn(bag, Fi, y, { uc: ui(cx), hw: 5.2, v0: 13.0, vs: 18.6, rise: 5.4, lights: 8, transoms: [15.8], glass: 'daylight_plain', depth: 0.25, label: false });
  const Fo = faceFrame([xi0 - 1.6, zi1, xi1 + 1.6, z1], 's');
  windowOn(bag, Fo, y, { uc: Fo.w / 2, hw: 5.2, v0: 13.0, vs: 18.6, rise: 5.4, lights: 8, transoms: [15.8], glass: 'glass_outer', depth: 0.3 });
  void ridge;
}
