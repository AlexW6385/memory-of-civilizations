// The Pharos of Alexandria (docs/settlements/alexandria.md §3): the lighthouse of Sostratos of Knidos, finished about 280 BC,
// of three tiers each leaning a little in — a square tower of limestone with a granite foot and a Triton on each corner, an
// octagon, a cylinder carrying the lantern, the fire and the polished mirror, and on the top the statue of Zeus Soter.
// Square 30 m at the foot [stated: Arab accounts], octagon 16.4 m across, cylinder 8.7 m, lantern chamber 4.3 m [stated]; the
// heights 56 / 28 / 10 m [inferred from Thiersch]; about 104 m with the statue. Registered into the `ptolemaic` style.

import { box, lathe, rod, frustum, fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

/** An eight-sided tapering prism (flat across `w` at the foot, `w2` at the top), turned so that a face looks along +z. */
function octagon(x, y0, y1, z, w, w2) {
  const R = (a) => a / 2 / Math.cos(Math.PI / 8), g = lathe([[R(w), 0], [R(w2), y1 - y0]], 8, null, 0, 0, 0);
  g.rotateY(Math.PI / 8); g.translate(x, y0, z); return g;
}
function triton(bag, x, y, z, yaw) {
  const g = lathe([[0.001, 0], [0.5, 0.05], [0.42, 0.9], [0.3, 1.5], [0.34, 2.1], [0.2, 2.5], [0.18, 3.0], [0.001, 3.1]], 8, null, 0, 0, 0);
  g.rotateY(yaw); g.translate(x, y, z); bag.add('bronze', g);
  const t = rod([x + Math.cos(yaw) * 0.2, y + 2.8, z - Math.sin(yaw) * 0.2], [x + Math.cos(yaw) * 0.9, y + 3.6, z - Math.sin(yaw) * 0.9], 0.05, 5);   // the horn (a conch)
  bag.add('bronze', t);
}
/**
 * pharos: { c [x, z], y (the ground), base (30) }. The podium and its steps, the tower, its windows, the door, the Tritons.
 */
function pharos(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 1.2, B = el.base ?? 30, h = B / 2;
  const S = STYLES.ptolemaic.elements;
  // the podium: three steps of limestone about the tower, the paving round it
  S.krepis({ rect: [cx - h - 4, cz - h - 4, cx + h + 4, cz + h + 4], y0: y, steps: 3, rise: 0.22, tread: 0.5, mat: 'limestone' }, ctx);
  const y0 = y + 0.66, H1 = 56, inset1 = 2.2;
  // tier 1, hollow: the foot of granite, then limestone in courses leaning in 2.2 m; inside, the horsemen's ramp (Balawi) winds up round a
  // solid core in four legs a turn, to the platform; the door on the south opens on the ground hall. [stated: Wikipedia/Balawi: a
  // broad inner ramp roofed in masonry, rooms above; the plan of the ramp is inferred]
  const IN = 11.6, CORE = 8.4, RB = [8.5, 11.5], TURNS = 4, LEGS = TURNS * 4, RISE = H1 / LEGS, yTop = y0 + H1 + 0.5;
  const yt = y0 + H1, q1 = h - inset1;
  const lean = (yy) => inset1 * (yy - 4.0) / (H1 - 4.0);
  const walls = (ya, yb, hw, mat) => {            // the four walls of a course: outer half-width hw, inner IN (the south wall is cut for the door below y0 + 7.6)
    const S = [[cx - hw, cz - hw, cx + hw, cz - IN], [cx - hw, cz - IN, cx - IN, cz + IN], [cx + IN, cz - IN, cx + hw, cz + IN]];
    for (const r of S) { bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); col.rect(r, ya, yb); }
    const south = [cx - hw, cz + IN, cx + hw, cz + hw];
    if (ya >= y0 + 7.6) { bag.add(mat, box(south[0], ya, south[1], south[2], yb, south[3])); col.rect(south, ya, yb); }
    else { for (const r of [[south[0], south[1], cx - 2.4, south[3]], [cx + 2.4, south[1], south[2], south[3]]]) { bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); col.rect(r, ya, yb); } if (yb > y0 + 6.2) { const r = [cx - 2.4, south[1], cx + 2.4, south[3]], lo = Math.max(ya, y0 + 6.2); bag.add(mat, box(r[0], lo, r[1], r[2], yb, r[3])); col.rect(r, lo, yb); } }
  };
  walls(y0 - 0.3, y0 + 4.0, h + 0.5, 'granite_grey');
  const NC = 26, dc = (H1 - 4.0) / NC;
  for (let k = 0; k < NC; k++) { const ya = y0 + 4.0 + k * dc, yb = ya + dc; walls(ya, yb, h - lean(yb), k % 2 ? 'limestone' : 'tura_limestone'); }
  bag.add('limestone', box(cx - CORE, y0, cz - CORE, cx + CORE, yt, cz + CORE)); col.rect([cx - CORE, cz - CORE, cx + CORE, cz + CORE], y0, yt);
  // the ground hall's floor, and the ramp: legs E (north-going), N (west-going), W (south-going), S (east-going), with flat landings at the corners
  bag.add('flagstone', box(cx - IN, y0 - 0.1, cz - IN, cx + IN, y0 + 0.02, cz + IN)); col.floor([cx - IN, cz - IN, cx + IN, cz + IN], y0 + 0.02);
  const wedge = (rect, ylo, dir) => {
    const ins = { n: [0, 0, 0, 1], s: [0, 0, 1, 0], e: [1, 0, 0, 0], w: [0, 1, 0, 0] }[dir], W = rect[2] - rect[0], D = rect[3] - rect[1];
    bag.add('limestone', frustum(rect, ylo, ylo + RISE, ins[0] * W, ins[1] * W, ins[2] * D, ins[3] * D));
    col.ramp(rect, ylo + 0.02, ylo + RISE + 0.02, dir);
  };
  const a0 = RB[0], a1 = RB[1];
  for (let t = 0, yy = y0; t < TURNS; t++) for (let k = 0; k < 4; k++, yy += RISE) {
    const leg = [[cx + a0, cz - a0, cx + a1, cz + a0, 'n'], [cx - a0, cz - a1, cx + a0, cz - a0, 'w'], [cx - a1, cz - a0, cx - a0, cz + a0, 's'], [cx - a0, cz + a0, cx + a0, cz + a1, 'e']][k];
    wedge([leg[0], leg[1], leg[2], leg[3]], yy, leg[4]);
    const land = [[cx + a0, cz - a1, cx + a1, cz - a0], [cx - a1, cz - a1, cx - a0, cz - a0], [cx - a1, cz + a0, cx - a0, cz + a1], [cx + a0, cz + a0, cx + a1, cz + a1]][k];
    bag.add('limestone', box(land[0], yy + RISE - 0.5, land[1], land[2], yy + RISE, land[3])); col.floor(land, yy + RISE);
    if (k === 2 && ctx.lights) ctx.lights.push({ at: [cx - 10, yy + RISE + 2.4, cz + 10], color: '#ffb260', intensity: 7, distance: 34 });
  }
  if (ctx.lights) ctx.lights.push({ at: [cx, y0 + 3.2, cz + 12], color: '#ffb260', intensity: 6, distance: 30 });
  for (let k = 0; k < 4; k++) { const hh = y0 + 3.0 + k * (H1 / 4); bag.add('bronze', lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.12], [0.001, 0.12]], 6, null, cx + (k % 2 ? 11 : -11), hh, cz + (k < 2 ? -3 : 3))); }
  // the string-courses (a moulded band at each fifth of the height) and the slits of the windows in the four faces
  for (const f of [0.22, 0.46, 0.7, 0.92]) {
    const yy = y0 + 4 + f * (H1 - 4), q = h - lean(yy + 0.45) + 0.3;
    bag.add('limestone', box(cx - q, yy, cz - q, cx + q, yy + 0.45, cz + q));
  }
  for (const f of [0.1, 0.34, 0.58, 0.82]) {
    const yy = y0 + 4 + f * (H1 - 4), q = h - lean(yy + 2.2);
    for (const sd of [-1, 1]) for (const u of [-6, 0, 6]) {
      bag.add('opening', box(cx + u - 0.4, yy, cz + sd * q - 0.1 - (sd > 0 ? 0 : 0.2), cx + u + 0.4, yy + 2.2, cz + sd * q + 0.1 + (sd > 0 ? 0.2 : 0)));
      bag.add('opening', box(cx + sd * q - 0.1 - (sd > 0 ? 0 : 0.2), yy, cz + u - 0.4, cx + sd * q + 0.1 + (sd > 0 ? 0.2 : 0), yy + 2.2, cz + u + 0.4));
    }
  }
  // the door on the harbour side (south): a great lintelled doorway of granite, the leaves of cedar thrown back inside
  { const zf = cz + h + 0.5, dx = cx;
    bag.add('granite_grey', box(dx - 3.4, y0, zf, dx - 2.4, y0 + 7.2, zf + 0.9)); bag.add('granite_grey', box(dx + 2.4, y0, zf, dx + 3.4, y0 + 7.2, zf + 0.9));
    bag.add('granite_grey', box(dx - 3.7, y0 + 6.2, zf, dx + 3.7, y0 + 7.4, zf + 1.1));
    bag.add('limestone', box(dx - 4.0, y0 + 7.4, zf, dx + 4.0, y0 + 7.9, zf + 1.3));
    for (const sd of [-1, 1]) { bag.add('cedar', box(dx + sd * 2.4 - (sd > 0 ? 0 : 0.0) - 0.0, y0, cz + IN - 0.3, dx + sd * 2.4 + sd * 2.4, y0 + 6.1, cz + IN - 0.15)); for (let k = 0; k < 3; k++) bag.add('bronze', box(dx + sd * 3.6 - 0.3, y0 + 1.4 + k * 1.7, cz + IN - 0.32, dx + sd * 3.6 + 0.3, y0 + 1.8 + k * 1.7, cz + IN - 0.3)); }
  }
  // the Zeus inscription over the door, a band of lettered stone on the seaward face
  bag.add('marble_smooth', box(cx - 5, y0 + 9.0, cz + h - lean(y0 + 9.0) + 0.0, cx + 5, y0 + 9.9, cz + h - lean(y0 + 9.0) + 0.14));
  // the platform on the tier: a slab with a hole over the last leg of the ramp, a parapet round it, a Triton on each corner
  { const e = q1 + 0.5, hole = [cx - a0, cz + a0, cx + a0, cz + a1], P = [[cx - e, cz - e, cx + e, hole[1]], [cx - e, hole[1], hole[0], hole[3]], [hole[2], hole[1], cx + e, hole[3]], [cx - e, hole[3], cx + e, cz + e]];
    for (const r of P) { bag.add('limestone', box(r[0], yt, r[1], r[2], yt + 0.5, r[3])); col.floor(r, yt + 0.5); }
    const pt = 0.35, ph = 1.1;
    for (const r of [[cx - e, cz - e, cx + e, cz - e + pt], [cx - e, cz + e - pt, cx + e, cz + e], [cx - e, cz - e, cx - e + pt, cz + e], [cx + e - pt, cz - e, cx + e, cz + e]]) { bag.add('limestone', box(r[0], yt + 0.5, r[1], r[2], yt + 0.5 + ph, r[3])); col.rect(r, yt + 0.5, yt + 0.5 + ph); }
    col.circle(cx, cz, 8.4, yt + 0.5, yt + 9); }
  void yTop;
  // tier 2: the octagon, 16.4 m across at the foot; windows in four faces; a cornice
  const H2 = 28, y2 = yt + 0.5;
  bag.add('limestone', octagon(cx, y2, y2 + H2, cz, 16.4, 14.6));
  for (const f of [0.2, 0.5, 0.8]) for (let a = 0; a < 8; a++) {
    const ang = a * Math.PI / 4, rr = (16.4 - 1.8 * f) / 2 + 0.03;
    bag.add('opening', box(cx + Math.sin(ang) * rr - 0.35, y2 + f * H2, cz + Math.cos(ang) * rr - 0.35, cx + Math.sin(ang) * rr + 0.35, y2 + f * H2 + 1.8, cz + Math.cos(ang) * rr + 0.35));
  }
  bag.add('limestone', octagon(cx, y2 + H2, y2 + H2 + 0.7, cz, 16.0, 17.4));
  // tier 3: the cylinder, 8.7 m across; the lantern gallery on it
  const y3 = y2 + H2 + 0.7, H3 = 10;
  bag.add('limestone', lathe([[4.5, 0], [4.15, H3]], 20, null, cx, y3, cz));
  bag.add('limestone', lathe([[4.5, H3], [5.3, H3], [5.3, H3 + 0.4], [0.001, H3 + 0.4]], 20, null, cx, y3, cz));
  // the lantern: eight columns of marble round the fire, a dome of lead; the fire's bowl, the flame, the bronze mirror
  const yl = y3 + H3 + 0.4, HL = 4.2;
  for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4; bag.add('marble_column', lathe([[0.2, 0], [0.17, HL]], 8, null, cx + Math.sin(ang) * 2.0, yl, cz + Math.cos(ang) * 2.0)); }
  bag.add('marble', lathe([[2.5, HL], [2.5, HL + 0.35], [0.001, HL + 0.35]], 16, null, cx, yl, cz));
  bag.add('lead', lathe([[2.5, HL + 0.35], [2.2, HL + 0.9], [1.2, HL + 1.8], [0.4, HL + 2.3], [0.001, HL + 2.4]], 16, null, cx, yl, cz));
  bag.add('bronze', lathe([[0.7, 0.0], [0.9, 0.5], [0.8, 0.6], [0.001, 0.4]], 12, null, cx, yl + 0.2, cz));
  bag.add('flame', lathe([[0.001, 0], [0.55, 0.05], [0.3, 1.1], [0.001, 2.2]], 8, null, cx, yl + 0.8, cz));
  bag.add('silver', box(cx + 0.9, yl + 0.5, cz - 0.9, cx + 1.0, yl + 2.5, cz + 0.9));                             // the mirror
  if (ctx.lights) ctx.lights.push({ at: [cx, yl + 1.6, cz], color: '#ffb260', intensity: 60, distance: 140 });
  // on the dome, the statue of Zeus Soter: a standing figure on a drum, the cloak, the raised arm with the sceptre
  const ys = yl + HL + 2.4;
  bag.add('bronze', lathe([[0.7, 0], [0.7, 0.5], [0.001, 0.5]], 10, null, cx, ys, cz));
  bag.add('bronze', lathe([[0.001, 0.5], [0.8, 0.55], [0.7, 1.9], [0.5, 3.0], [0.55, 3.6], [0.3, 3.9], [0.32, 4.6], [0.001, 4.75]], 10, null, cx, ys, cz));
  bag.add('bronze', rod([cx + 0.4, ys + 3.4, cz], [cx + 1.3, ys + 5.4, cz], 0.07, 5));
  bag.add('bronze', rod([cx + 1.3, ys + 5.4, cz], [cx + 1.3, ys + 3.0, cz], 0.04, 5));
  void fromTriangles;
}
export const PHAROS_EL = { pharos };
