// Norse Norway (12th–13th c.; docs/settlements/norse-borgund.md §4): the stave church — the nave
// raised on its ring of staves above the aisles, the ambulatory (svalgang) round it under a lean-to
// roof, the chancel and the round apse with its little tower, the roofs stacked one above another
// under tarred shingles, the turret with its spire, dragon heads on the gables; the free-standing
// bell house; the farm's buildings of round logs notched at the corners, the dwellings under sod,
// the storehouse (loft) raised on posts.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe, quad, fromTriangles, orientOutward } from '../../core/geom.js';
import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import '../qing/index.js';

const W = 'tar_wood', SH = 'tar_shingle', LOG = 'log_pine';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A carved dragon head leaning out from a gable end at (x, y, z), pointing along dir (+1/-1 on x). */
function dragon(bag, x, y, z, dir, s = 1) {
  // the neck rising out from the gable's ridge in three curving pieces, the head with its open jaws and crest
  const seg = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); const g = box(0, -w, -w * 0.8, L, w, w * 0.8); g.rotateZ(Math.atan2(dy, dx * dir)); g.translate(x + a[0] * dir, y + a[1], z); bag.add(W, g); };
  const P = [[0, 0], [0.45 * s, 0.35 * s], [0.75 * s, 0.85 * s], [0.95 * s, 1.35 * s]];
  for (let i = 0; i < 3; i++) seg(P[i], P[i + 1], (0.14 - i * 0.02) * s);
  const h0 = P[3];
  seg(h0, [h0[0] + 0.55 * s, h0[1] + 0.12 * s], 0.11 * s);           // the upper jaw
  seg([h0[0] + 0.05 * s, h0[1] - 0.06 * s], [h0[0] + 0.5 * s, h0[1] - 0.22 * s], 0.06 * s);     // the lower jaw, open
  seg([h0[0] - 0.08 * s, h0[1] + 0.08 * s], [h0[0] - 0.25 * s, h0[1] + 0.4 * s], 0.05 * s);     // the crest curling back
}
/** A small cross on a gable's apex. */
function cross(bag, x, y, z, s = 1) { bag.add(W, box(x - 0.05 * s, y, z - 0.05 * s, x + 0.05 * s, y + 1.0 * s, z + 0.05 * s)); bag.add(W, box(x - 0.05 * s, y + 0.55 * s, z - 0.3 * s, x + 0.05 * s, y + 0.65 * s, z + 0.3 * s)); }
/** An extruded flat piece: `shape` drawn in (u, v) — u along a→b from a, v up from y — th thick, centred on the line a–b. */
export function slab(shape, th, a, b, y, curveSegments = 8) {
  let ux = b[0] - a[0], uz = b[1] - a[1]; const L = Math.hypot(ux, uz) || 1; ux /= L; uz /= L;
  const g = new ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments });
  g.deleteAttribute('uv'); g.translate(0, 0, -th / 2);
  g.applyMatrix4(new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: -uz, y: 0, z: ux }).setPosition(a[0], y, a[1]));
  return g;
}
/** A convex block from its eight corners (bottom a b c d, top e f g h, in the same order round). */
export function hexa(P) {
  const [a, b, c, d, e, f, g, h] = P, t = [];
  quad(t, a, b, c, d); quad(t, e, f, g, h); quad(t, a, b, f, e); quad(t, b, c, g, f); quad(t, c, d, h, g); quad(t, d, a, e, h);
  return fromTriangles(orientOutward(t));
}
/** A round log between two points on one axis (closed ends), r radius. */
export function logRod(a, b, r, seg = 7) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const g = lathe([[0.001, 0], [r, 0], [r, L], [0.001, L]], seg);
  if (Math.abs(b[0] - a[0]) > 1e-6) g.rotateZ(b[0] > a[0] ? -Math.PI / 2 : Math.PI / 2);
  else if (Math.abs(b[2] - a[2]) > 1e-6) g.rotateX(b[2] > a[2] ? Math.PI / 2 : -Math.PI / 2);
  return g.translate(a[0], a[1], a[2]);
}
/**
 * A pitched roof of two slabs (t thick) over rect, ridge along x (alongX) or z, overhang o, rise per
 * run `pitch`; the gable triangles under it in `wall` (kept below the slabs' undersides). Returns the
 * ridge's height (top of the slabs).
 */
export function pitched(bag, mat, wall, [x0, z0, x1, z1], y, pitch, o = 0.3, alongX = null, t = 0.16) {
  const ax = alongX ?? (x1 - x0 >= z1 - z0);
  const hh = ax ? (z1 - z0) / 2 : (x1 - x0) / 2, rise = hh * pitch, yr = y + rise, ye = y - o * pitch;
  if (ax) {
    const zm = (z0 + z1) / 2, A = x0 - o, B = x1 + o;
    for (const [ze] of [[z0 - o], [z1 + o]]) bag.add(mat, hexa([[A, ye - t, ze], [B, ye - t, ze], [B, yr - t, zm], [A, yr - t, zm], [A, ye, ze], [B, ye, ze], [B, yr, zm], [A, yr, zm]]));
    if (wall) bag.add(wall, frustum([x0, z0, x1, z1], y - 0.01, yr - t - 0.04, 0, 0, hh, hh, { noBottom: true }));
  } else {
    const xm = (x0 + x1) / 2, A = z0 - o, B = z1 + o;
    for (const [xe] of [[x0 - o], [x1 + o]]) bag.add(mat, hexa([[xe, ye - t, A], [xe, ye - t, B], [xm, yr - t, B], [xm, yr - t, A], [xe, ye, A], [xe, ye, B], [xm, yr, B], [xm, yr, A]]));
    if (wall) bag.add(wall, frustum([x0, z0, x1, z1], y - 0.01, yr - t - 0.04, hh, hh, 0, 0, { noBottom: true }));
  }
  return yr;
}
/** A square pyramid or frustum with its sides parallel to the axes: half-widths a0 at y0, a1 at y1. */
export function pyr(x, z, a0, y0, a1, y1) { return lathe([[a0 * Math.SQRT2, 0], [Math.max(a1, 0.001) * Math.SQRT2, y1 - y0], [0.001, y1 - y0]], 4).rotateY(Math.PI / 4).translate(x, y0, z); }
/** An arcade's outline: a band L long and H high over n round arches (radius bay/2 − post), springing at v = 0. */
export function arcadeShape(L, H, n, post = 0.06) {
  const sh = new Shape(), bw = L / n, rr = bw / 2 - post;
  sh.moveTo(0, 0);
  for (let i = 0; i < n; i++) { const uc = (i + 0.5) * bw; sh.lineTo(uc - rr, 0); sh.absarc(uc, 0, rr, Math.PI, 0, true); }
  sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  return sh;
}
/**
 * The svalgang's arcade along a→b: a plank parapet, little turned columns with capitals, the
 * band of round arches and the wall plate; bays where skip(i) is true are left open (entrances).
 */
function arcade(bag, a, b, y0, n, { parapet = 0.8, col = 0.62, plate = 0.15, skip = () => false } = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, bw = L / n, rr = bw / 2 - 0.06;
  const at = (u) => [a[0] + ux * u, a[1] + uz * u];
  for (let i = 0; i < n; i++) if (!skip(i)) bag.add(W, orientedBox(at(i * bw), at((i + 1) * bw), 0.1, y0, y0 + parapet));
  for (let i = 0; i < n; i++) if (!skip(i)) bag.add(W, orientedBox(at(i * bw), at((i + 1) * bw), 0.16, y0 + parapet - 0.02, y0 + parapet + 0.05));   // the parapet's cap rail
  const ys = y0 + parapet + 0.05, sp = ys + col, H = rr + 0.14;
  for (let i = 0; i <= n; i++) {
    const [px, pz] = at(i * bw);
    if (i === 0 || i === n) { bag.add(W, box(px - 0.09, y0, pz - 0.09, px + 0.09, sp + H + plate, pz + 0.09)); continue; }
    bag.add(W, lathe([[0.075, 0], [0.05, 0.05], [0.045, col * 0.5], [0.05, col - 0.07], [0.085, col - 0.02], [0.085, col], [0.001, col]], 8, null, px, ys, pz));
  }
  bag.add(W, slab(arcadeShape(L, H, n), 0.1, a, b, sp, 6));
  bag.add(W, orientedBox(a, b, 0.18, sp + H, sp + H + plate));
  return sp + H + plate;
}
/** stave_church: { c, y, s (scale) } — the west door, the chancel and apse east. */
function staveChurch(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1, X = (v) => cx + v * s, Z = (v) => cz + v * s, U = (v) => y + v * s;
  // the footing: a rubble bed and the sill frame the staves stand on; the svalgang's floor on top
  const sv = [X(-7.4), Z(-6.8), X(6), Z(6.8)];
  bag.add('rubble', box(sv[0] - 0.25, y - 0.6, sv[1] - 0.25, sv[2] + 0.25, U(0.15), sv[3] + 0.25));
  bag.add(W, box(sv[0], U(0.15), sv[1], sv[2], U(0.35), sv[3])); col.rect(sv, y, U(2.6));
  // the svalgang (ambulatory): an arcade of little columns and round arches over a plank parapet on
  // the north, south and west; closed round the chancel at the east; an entrance bay in the south
  // under its skruv, the west bays behind the porch
  const n = 14, bwz = (sv[3] - sv[1]) / 11, bwx = (sv[2] - sv[0]) / n, sGate = Math.floor((X(-0.4) - sv[0]) / bwx);
  arcade(bag, [sv[0], sv[1]], [sv[2], sv[1]], U(0.35), n);
  arcade(bag, [sv[0], sv[3]], [sv[2], sv[3]], U(0.35), n, { skip: (i) => i === sGate });
  arcade(bag, [sv[0], sv[1]], [sv[0], sv[3]], U(0.35), 11, { skip: (i) => Math.abs(sv[1] + (i + 0.5) * bwz - cz) < 1.6 * s + 0.3 });
  bag.add(W, box(sv[2] - 0.1, U(0.35), sv[1], sv[2], U(2.6), sv[3]));
  bag.add(W, box(sv[0], U(2.6) - 0.04, sv[1], sv[2], U(2.6), sv[3]));                       // the gallery's boarded ceiling
  bag.add(SH, frustum([sv[0] - 0.3, sv[1] - 0.3, sv[2] + 0.3, sv[3] + 0.3], U(2.6), U(4.2), 1.9 * s, 0.3, 1.9 * s, 1.9 * s, { noBottom: true }));
  // the south skruv: a gabled porch standing out from the gallery over its entrance, a cross on its gable
  const sk = [sv[0] + sGate * bwx - 0.05, sv[3], sv[0] + (sGate + 1) * bwx + 0.05, sv[3] + 1.3 * s];
  bag.add(W, box(sk[0] - 0.05, U(0.15), sk[1], sk[2] + 0.05, U(0.35), sk[3]));
  for (const xx of [sk[0], sk[2]]) { bag.add(W, box(xx - 0.06, U(0.35), sk[1], xx + 0.06, U(0.35) + 0.75, sk[3])); bag.add(W, box(xx - 0.08, U(0.35), sk[3] - 0.16, xx + 0.08, U(2.5), sk[3])); }
  const skr = pitched(bag, SH, W, [sk[0] - 0.08, sk[1] - 0.3, sk[2] + 0.08, sk[3]], U(2.5), 1.3, 0.2, false);
  { const sh = new Shape(), L = sk[2] - sk[0] + 0.16, r = L / 2 - 0.1; sh.moveTo(0, 0); sh.lineTo(0.1, 0); sh.absarc(L / 2, 0, r, Math.PI, 0, true); sh.lineTo(L, 0); sh.lineTo(L, 0.55); sh.lineTo(0, 0.55); sh.lineTo(0, 0); bag.add(W, slab(sh, 0.12, [sk[0] - 0.08, sk[3] - 0.08], [sk[2] + 0.08, sk[3] - 0.08], U(2.5) - 0.55, 10)); }
  cross(bag, (sk[0] + sk[2]) / 2, skr - 0.1, sk[3] + 0.1, s * 0.6);
  // the aisles round the nave's core (their wall stands behind the gallery), their roof sloping in to the clerestory
  const ai = [X(-5.6), Z(-5), X(5.4), Z(5)];
  bag.add(W, box(ai[0], U(0.35), ai[1], ai[2], U(5.6), ai[3]));
  for (let k = 0; k <= 8; k++) for (const zz of [ai[1], ai[3]]) { const x = ai[0] + 0.3 + k * (ai[2] - ai[0] - 0.6) / 8; bag.add(W, box(x - 0.07, U(0.35), zz - (zz < cz ? 0.05 : -0.05) - 0.025, x + 0.07, U(2.6) - 0.04, zz - (zz < cz ? 0.05 : -0.05) + 0.025)); }   // the wall's staves standing proud
  bag.add(SH, frustum([ai[0] - 0.3, ai[1] - 0.3, ai[2] + 0.3, ai[3] + 0.3], U(5.6), U(7.4), 1.8 * s, 1.6 * s, 1.8 * s, 1.8 * s, { noBottom: true }));
  // the nave's raised core on its staves, its steep gable and the dragon heads
  const co = [X(-4), Z(-3.4), X(4), Z(3.4)];
  bag.add(W, box(co[0], U(7.4), co[1], co[2], U(10.5) + 0.35 * s * 1.55, co[3]));
  const ridge = pitched(bag, SH, W, co, U(10.5) + 0.35 * s * 1.55, 1.55, 0.35 * s, true, 0.18);
  for (const [x, d] of [[co[0] - 0.3, -1], [co[2] + 0.3, 1]]) { bag.add(W, box(x - 0.1, ridge - 0.3, cz - 0.1, x + 0.1, ridge + 0.6, cz + 0.1)); dragon(bag, x, ridge - 0.4, cz, d, s * 1.1); }
  // the openwork crest along the ridge (carved boards between the dragons)
  for (let x = co[0] + 0.1; x <= co[2] - 0.1; x += 0.28) { bag.add(W, box(x - 0.035, ridge - 0.05, cz - 0.03, x + 0.035, ridge + 0.32 + 0.06 * Math.cos(x * 9), cz + 0.03)); }
  bag.add(W, box(co[0], ridge + 0.12, cz - 0.035, co[2], ridge + 0.18, cz + 0.035));
  // the west porch: its gable and the two-storey superstructure over the portal (the skruv), a cross on top
  const po = [X(-8.8), Z(-1.6), sv[0], Z(1.6)];
  bag.add(W, box(po[0], y - 0.4, po[1], po[2], U(2.4) + 0.3, po[3])); col.rect(po, y, U(2.4));
  const pr = pitched(bag, SH, W, po, U(2.4) + 0.3, 1.2, 0.25, true);
  const pu = [po[0] + 0.45, Z(-1.05), po[2] + 0.2, Z(1.05)];
  bag.add(W, box(pu[0], pr - 0.9, pu[1], pu[2], pr + 1.1 * s, pu[3]));
  for (const zz of [-0.45, 0.45]) { bag.add('opening', box(pu[0] - 0.03, pr + 0.1 * s, cz + zz * s - 0.17 * s, pu[0], pr + 0.75 * s, cz + zz * s + 0.17 * s)); bag.add('opening', lathe([[0.17 * s, 0], [0.17 * s, 0.03], [0.001, 0.03]], 10).rotateZ(Math.PI / 2).translate(pu[0] - 0.003, pr + 0.75 * s, cz + zz * s)); }
  const pur = pitched(bag, SH, W, pu, pr + 1.1 * s + 0.2 * 1.4, 1.4, 0.2, true);
  cross(bag, pu[0] - 0.12, pur - 0.15, cz, s * 0.8);
  // the west portal: the door under a round head, framed by broad carved jambs (the vine and dragon work) and a capital each side
  bag.add('opening', box(po[0] - 0.04, y, cz - 0.6 * s, po[0], U(1.9), cz + 0.6 * s));
  bag.add('opening', lathe([[0.6 * s, 0], [0.6 * s, 0.04], [0.001, 0.04]], 12, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(po[0] - 0.02, U(1.9), cz));
  for (const sz of [-1, 1]) {
    bag.add(W, box(po[0] - 0.14, y, cz + sz * 0.62 * s - (sz > 0 ? 0 : 0.42 * s), po[0] - 0.02, U(1.95), cz + sz * 0.62 * s + (sz > 0 ? 0.42 * s : 0)));
    for (let k = 0; k < 6; k++) bag.add(W, box(po[0] - 0.2, U(0.2 + k * 0.3), cz + sz * 0.83 * s - 0.08 * s, po[0] - 0.12, U(0.36 + k * 0.3), cz + sz * 0.83 * s + 0.08 * s));
    bag.add(W, box(po[0] - 0.22, U(1.95), cz + sz * 0.83 * s - 0.25 * s, po[0] - 0.02, U(2.1), cz + sz * 0.83 * s + 0.25 * s));
  }
  // the chancel and the round apse with its tower
  const ch = [sv[2], Z(-2.6), X(9.6), Z(2.6)];
  bag.add(W, box(ch[0], y - 0.4, ch[1], ch[2], U(5.2), ch[3])); col.rect(ch, y, U(5.2));
  bag.add(SH, frustum([ch[0] - 0.3, ch[1] - 0.3, ch[2] + 0.3, ch[3] + 0.3], U(5.2), U(6), 0.3, 0.3, 0.9, 0.9, { noBottom: true }));
  bag.add(W, box(ch[0] + 0.5, U(6), Z(-1.8), ch[2] - 0.3, U(7.6) + 0.3 * 1.4, Z(1.8)));
  const cr = pitched(bag, SH, W, [ch[0] + 0.5, Z(-1.8), ch[2] - 0.3, Z(1.8)], U(7.6) + 0.3 * 1.4, 1.4, 0.3, true);
  cross(bag, ch[0] + 0.2, cr - 0.15, cz, s * 0.9);
  const ax = X(11);
  bag.add(W, lathe([[2 * s, 0], [2 * s, 4.6 * s], [0.001, 4.6 * s]], 16, null, ax, y - 0.4, cz)); col.circle(ax, cz, 2 * s, y, U(4.6));
  bag.add(SH, lathe([[2.3 * s, 0], [0.7 * s, 2.2 * s], [0.001, 2.4 * s]], 16, null, ax, U(4.2), cz));
  bag.add(W, lathe([[0.6 * s, 0], [0.6 * s, 1.4 * s], [0.001, 1.4 * s]], 8, null, ax, U(6.3), cz));
  bag.add(SH, lathe([[0.8 * s, 0], [0.001, 2.6 * s]], 8, null, ax, U(7.7), cz));
  cross(bag, ax, U(7.7) + 2.45 * s, cz, s * 0.7);
  // the ridge turret: a square base under crossing gables, two panelled storeys with their open
  // arcades and skirts, and the spire in two stages (seven roofs in all, one above another)
  const ty = ridge - 1.2 * s, b0 = 1.25 * s;
  bag.add(W, box(cx - b0, ty, cz - b0, cx + b0, ty + 2.1 * s, cz + b0));
  const g1 = pitched(bag, SH, W, [cx - b0, cz - b0, cx + b0, cz + b0], ty + 2.1 * s, 1.1, 0.25, true);
  pitched(bag, SH, W, [cx - b0, cz - b0, cx + b0, cz + b0], ty + 2.1 * s, 1.1, 0.25, false);
  const storey = (a, y0, h) => {
    bag.add(W, box(cx - a, y0, cz - a, cx + a, y0 + h, cz + a));
    for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let k = -1; k <= 1; k++) {
      const u = k * a * 0.6, w = a * 0.18, ox = cx + nx * (a + 0.02) + nz * u, oz = cz + nz * (a + 0.02) + nx * u;
      bag.add('opening', box(ox - (nx ? 0.02 : w), y0 + h * 0.2, oz - (nz ? 0.02 : w), ox + (nx ? 0.02 : w), y0 + h * 0.72, oz + (nz ? 0.02 : w)));
      bag.add(W, box(ox - (nx ? 0.04 : w + 0.05), y0 + h * 0.72, oz - (nz ? 0.04 : w + 0.05), ox + (nx ? 0.04 : w + 0.05), y0 + h * 0.8, oz + (nz ? 0.04 : w + 0.05)));
    }
  };
  const a1 = 0.85 * s, y1 = g1 - 0.6 * s;
  storey(a1, y1, 1.6 * s);
  bag.add(SH, pyr(cx, cz, a1 + 0.35 * s, y1 + 1.6 * s, a1 * 0.7, y1 + 2.1 * s));
  const a2 = 0.62 * s, y2 = y1 + 1.95 * s;
  storey(a2, y2, 1.2 * s);
  bag.add(SH, pyr(cx, cz, a2 + 0.4 * s, y2 + 1.2 * s, 0.4 * s, y2 + 2.4 * s));
  bag.add(W, box(cx - 0.36 * s, y2 + 2.3 * s, cz - 0.36 * s, cx + 0.36 * s, y2 + 2.9 * s, cz + 0.36 * s));
  bag.add(SH, pyr(cx, cz, 0.52 * s, y2 + 2.9 * s, 0, y2 + 8 * s));
  bag.add('iron', box(cx - 0.035, y2 + 7.8 * s, cz - 0.035, cx + 0.035, y2 + 8.9 * s, cz + 0.035));
  bag.add('iron', box(cx - 0.02, y2 + 8.45 * s, cz - 0.03, cx + 0.42 * s, y2 + 8.7 * s, cz + 0.03));   // the vane
}
/**
 * bell_house: { c, y, s } — the free-standing stave bell tower (støpul) south of the church: its posts
 * on a sill frame over a rubble bed, enclosed by the steep shingled skirt; above it the belfry with
 * its round-headed sound openings, and the pyramid roof with a flared eave and a cross.
 */
function bellHouse(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, s = el.s ?? 4, h = s / 2;
  bag.add('rubble', box(x - h - 0.35, y - 0.6, z - h - 0.35, x + h + 0.35, y + 0.3, z + h + 0.35));
  bag.add(W, box(x - h - 0.15, y + 0.3, z - h - 0.15, x + h + 0.15, y + 0.55, z + h + 0.15));
  col.rect([x - h - 0.35, z - h - 0.35, x + h + 0.35, z + h + 0.35], y, y + 8);
  const a = h - 0.75;
  bag.add(SH, frustum([x - h - 0.1, z - h - 0.1, x + h + 0.1, z + h + 0.1], y + 0.55, y + 5.2, h + 0.1 - a, h + 0.1 - a, h + 0.1 - a, h + 0.1 - a));
  bag.add('opening', box(x - 0.45, y + 0.55, z + h - 0.02, x + 0.45, y + 2.3, z + h + 0.14));    // the low door in the skirt
  bag.add(W, box(x - 0.55, y + 2.3, z + h - 0.02, x + 0.55, y + 2.45, z + h + 0.2));
  bag.add(W, box(x - a, y + 5.2, z - a, x + a, y + 7.9, z + a));
  for (let k = -3; k <= 3; k++) for (const sz of [-1, 1]) { bag.add(W, box(x + k * a / 3.5 - 0.05, y + 5.2, z + sz * a - 0.04, x + k * a / 3.5 + 0.05, y + 7.9, z + sz * a + 0.04)); bag.add(W, box(x + sz * a - 0.04, y + 5.2, z + k * a / 3.5 - 0.05, x + sz * a + 0.04, y + 7.9, z + k * a / 3.5 + 0.05)); }
  // the sound openings: a board with two round-headed openings on each face, dark behind
  const so = new Shape(), L = 2 * a - 0.2, w = 0.32, H = 1.9;
  so.moveTo(0, 0); so.lineTo(L, 0); so.lineTo(L, H); so.lineTo(0, H); so.lineTo(0, 0);
  for (const uc of [L * 0.3, L * 0.7]) { const p = new Path(); p.moveTo(uc - w, 0.35); p.lineTo(uc + w, 0.35); p.lineTo(uc + w, 1.2); p.absarc(uc, 1.2, w, 0, Math.PI, false); p.lineTo(uc - w, 0.35); so.holes.push(p); }
  for (const [p0, p1, nx, nz] of [[[x - a + 0.1, z + a + 0.1], [x + a - 0.1, z + a + 0.1], 0, 1], [[x + a - 0.1, z - a - 0.1], [x - a + 0.1, z - a - 0.1], 0, -1], [[x + a + 0.1, z + a - 0.1], [x + a + 0.1, z - a + 0.1], 1, 0], [[x - a - 0.1, z - a + 0.1], [x - a - 0.1, z + a - 0.1], -1, 0]]) {
    bag.add(W, slab(so, 0.08, p0, p1, y + 5.6, 8));
    const e = a - 0.15, f = a + 0.03;
    bag.add('opening', nx ? box(x + nx * (a + 0.015) - 0.015, y + 5.9, z - e, x + nx * (a + 0.015) + 0.015, y + 7.4, z + e) : box(x - e, y + 5.9, z + nz * (a + 0.015) - 0.015, x + e, y + 7.4, z + nz * (a + 0.015) + 0.015));
  }
  bag.add(SH, pyr(x, z, a + 0.75, y + 7.75, a + 0.1, y + 8.25));
  bag.add(SH, pyr(x, z, a + 0.15, y + 8.2, 0, y + 12));
  cross(bag, x, y + 11.85, z, 0.7);
}
/** Round-log walls on rect from y to y + H: the courses of the long and the short walls half a log apart, crossing and standing out at the notched corners. */
function logWalls(bag, [x0, z0, x1, z1], y, H, d = 0.26, over = 0.3) {
  bag.add(LOG, box(x0 + 0.03, y, z0 + 0.03, x1 - 0.03, y + H, z1 - 0.03));     // the logs' backs
  const r = d * 0.54;
  for (let k = 0; y + k * d <= y + H - d * 0.4; k++) {
    for (const xx of [x0, x1]) bag.add(LOG, logRod([xx, y + k * d, z0 - over], [xx, y + k * d, z1 + over], r));
    const y2 = y + d / 2 + k * d;
    if (y2 <= y + H - d * 0.4) for (const zz of [z0, z1]) bag.add(LOG, logRod([x0 - over, y2, zz], [x1 + over, y2, zz], r));
  }
}
/** The gable ends in logs above y over rect (ridge along x if alongX), each course shorter, under a roof of the given rise. */
function logGables(bag, [x0, z0, x1, z1], y, rise, alongX, d = 0.26) {
  const r = d * 0.54, span = alongX ? z1 - z0 : x1 - x0, m = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2;
  for (let yy = y + d / 2; yy < y + rise - 0.3; yy += d) {
    const half = span / 2 * (1 - (yy + r - y) / rise) - 0.05;
    if (half < 0.25) break;
    for (const e of alongX ? [x0, x1] : [z0, z1]) bag.add(LOG, alongX ? logRod([e, yy, m - half], [e, yy, m + half], r) : logRod([m - half, yy, e], [m + half, yy, e], r));
  }
}
/** Barge boards (vindski) up the rakes of a gable at both ends, and on sod the eave logs (torvvol) that hold the turf. */
function roofTrim(bag, [x0, z0, x1, z1], y, pitch, o, alongX, sod) {
  const hh = alongX ? (z1 - z0) / 2 : (x1 - x0) / 2, yr = y + hh * pitch, ye = y - o * pitch;
  const lo = alongX ? z0 - o : x0 - o, hi = alongX ? z1 + o : x1 + o, m = (lo + hi) / 2;
  for (const e of alongX ? [x0 - o - 0.03, x1 + o + 0.03] : [z0 - o - 0.03, z1 + o + 0.03]) for (const [a, b] of [[lo, m + 0.12], [hi, m - 0.12]]) {
    const ya = ye, yb = yr + 0.12 * pitch, P = (u, v, w) => alongX ? [e + w, v, u] : [u, v, e + w];
    bag.add(W, hexa([P(a, ya - 0.24, -0.03), P(b, yb - 0.24, -0.03), P(b, yb + 0.07, -0.03), P(a, ya + 0.07, -0.03), P(a, ya - 0.24, 0.03), P(b, yb - 0.24, 0.03), P(b, yb + 0.07, 0.03), P(a, ya + 0.07, 0.03)]));
  }
  if (!sod) return;
  const L0 = alongX ? x0 - o : z0 - o, L1 = alongX ? x1 + o : z1 + o;
  for (const [ee, sg] of [[lo, 1], [hi, -1]]) {
    const c = ee + sg * 0.16, yy = ye + 0.16 * pitch + 0.08;
    bag.add(LOG, alongX ? logRod([L0, yy, c], [L1, yy, c], 0.08, 6) : logRod([c, yy, L0], [c, yy, L1], 0.08, 6));
  }
}
/** A plank door with its jambs and lintel on the face z = f (sg: the face's outward sign), centred at mx; w wide, h high, standing out by `out`. */
function door(bag, mx, f, sg, y, w, h, out) {
  const z = f + sg * out;
  bag.add(W, box(mx - w / 2, y, Math.min(z, z + sg * 0.06), mx + w / 2, y + h, Math.max(z, z + sg * 0.06)));
  for (const sx of [-1, 1]) bag.add(W, box(mx + sx * (w / 2 + 0.06) - 0.06, y, Math.min(z, z + sg * 0.1), mx + sx * (w / 2 + 0.06) + 0.06, y + h + 0.14, Math.max(z, z + sg * 0.1)));
  bag.add(W, box(mx - w / 2 - 0.14, y + h, Math.min(z, z + sg * 0.1), mx + w / 2 + 0.14, y + h + 0.14, Math.max(z, z + sg * 0.1)));
}
/** log_house: { rect, y, foot, kind ('stue' | 'barn' | 'loft'), roof (material, optional), seed } — round-log walls notched at the corners; sod roofs on dwellings, shingles or boards on the rest; the loft on posts. */
function logHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1), kind = el.kind ?? 'stue', d = 0.26, r = d * 0.54;
  if (kind === 'loft') {
    // the loft: a two-storey storehouse lifted on posts over stones; the upper storey overhangs on
    // corbelled logs, with its svalgang (gallery) on the front and the stair up to it outside
    const lx0 = x0 + 0.35, lz0 = z0 + 0.35, lx1 = x1 - 0.35, lz1 = z1 - 0.35, yb = y + 0.9;
    for (const [px, pz] of [[lx0 + 0.2, lz0 + 0.2], [lx1 - 0.2, lz0 + 0.2], [lx0 + 0.2, lz1 - 0.2], [lx1 - 0.2, lz1 - 0.2]]) {
      bag.add('rubble', box(px - 0.32, foot, pz - 0.32, px + 0.32, y + 0.2, pz + 0.32));
      bag.add(LOG, box(px - 0.16, y + 0.2, pz - 0.16, px + 0.16, yb - 0.08, pz + 0.16));
      bag.add(W, box(px - 0.26, yb - 0.08, pz - 0.26, px + 0.26, yb, pz + 0.26));    // the flat cap that turns the rats
    }
    col.rect(el.rect, foot, y + 5.2);
    logWalls(bag, [lx0, lz0, lx1, lz1], yb, 1.85, d, 0.22);
    door(bag, (lx0 + lx1) / 2 - 0.3, lz1, 1, yb, 0.7, 1.35, r + 0.01);
    // the corbels: the top logs of the lower storey reaching out under the overhang and the gallery
    const yc = yb + 1.85, ux0 = x0 - 0.1, ux1 = x1 + 0.1, uz0 = z0 - 0.1, uz1 = z1 + 0.1, gz = uz1 + 0.95;
    for (const xx of [lx0, lx1]) bag.add(LOG, logRod([xx, yc, lz0 - 0.5], [xx, yc, gz + 0.1], r));
    bag.add(W, box(ux0, yc + r - 0.02, uz0, ux1, yc + r + 0.08, uz1));                  // the floor of the upper storey
    bag.add(W, box(ux0, yc + r - 0.02, uz1, ux1 + 0.9, yc + r + 0.08, gz));            // and of the gallery, with the stair's landing at its end
    bag.add(LOG, box(ux1 + 0.72, foot, gz - 0.24, ux1 + 0.88, yc + r - 0.02, gz - 0.08));
    const yu = yc + r + 0.08;
    logWalls(bag, [ux0, uz0, ux1, uz1], yu, 1.6, d, 0.25);
    // the gallery: a plank parapet with a row of little arched openings, posts up to the roof
    const gy = yu + 0.85;
    bag.add(W, box(ux0, yu, gz - 0.08, ux1 + 0.9, gy, gz));
    bag.add(W, box(ux1 + 0.82, yu, uz1 + 0.15, ux1 + 0.9, gy, gz));
    bag.add(W, slab(arcadeShape(ux1 - ux0, 0.32, 5, 0.05), 0.06, [ux0, gz - 0.04], [ux1, gz - 0.04], gy + 0.35, 6));
    for (let k = 0; k <= 5; k++) { const px = ux0 + k * (ux1 - ux0) / 5; bag.add(W, box(px - 0.05, gy, gz - 0.09, px + 0.05, gy + 0.35, gz + 0.01)); }
    bag.add(W, box(ux0, gy + 0.67, gz - 0.1, ux1, yu + 1.6, gz + 0.02));
    door(bag, (ux0 + ux1) / 2, uz1, 1, yu, 0.65, 1.3, r + 0.01);
    // the stair up the side to the gallery's end
    const sx0 = ux1 + 0.15, sx1 = ux1 + 0.85, steps = 11, sz0 = z0 - 0.6;
    for (let k = 0; k < steps; k++) { const t = (k + 1) / steps, zz = sz0 + (uz1 - sz0) * (k / steps); bag.add(W, box(sx0, foot + (yu - foot) * t - 0.06, zz, sx1, foot + (yu - foot) * t, zz + (uz1 - sz0) / steps + 0.04)); }
    for (const sx of [sx0 - 0.08, sx1]) bag.add(W, hexa([[sx, foot, sz0], [sx + 0.08, foot, sz0], [sx + 0.08, yu - 0.3, uz1], [sx, yu - 0.3, uz1], [sx, foot + 0.3, sz0], [sx + 0.08, foot + 0.3, sz0], [sx + 0.08, yu + 0.04, uz1], [sx, yu + 0.04, uz1]]));
    const rr = [ux0, uz0, ux1, gz], ry = yu + 1.6;
    pitched(bag, SH, W, rr, ry, 0.95, 0.35, true);
    roofTrim(bag, rr, ry, 0.95, 0.35, true, false);
    return;
  }
  const H = kind === 'barn' ? 3.9 : 3.1;
  bag.add('rubble', box(x0 - 0.15, foot, z0 - 0.15, x1 + 0.15, y + 0.15, z1 + 0.15));
  logWalls(bag, el.rect, y + 0.15 + r, H - r, d); col.rect(el.rect, foot, y + H);
  const alongX = x1 - x0 >= z1 - z0, front = rand() < 0.5;
  // the door (and the stue's small window) in a long wall; a barn's wide double doors
  if (alongX) {
    const f = front ? z0 : z1, sg = front ? -1 : 1, mx = (x0 + x1) / 2 + (kind === 'stue' ? -0.8 : 0);
    door(bag, mx, f, sg, y + 0.15, kind === 'barn' ? 2.2 : 0.85, kind === 'barn' ? 2.3 : 1.7, r + 0.01);
    if (kind === 'stue') { const wx = mx + 1.7, z = f + sg * (r + 0.01); bag.add('opening', box(wx - 0.3, y + 1.4, Math.min(z, z + sg * 0.03), wx + 0.3, y + 1.85, Math.max(z, z + sg * 0.03))); for (const [a, b, c, e] of [[-0.38, -0.3, 1.32, 1.93], [0.3, 0.38, 1.32, 1.93], [-0.38, 0.38, 1.32, 1.4], [-0.38, 0.38, 1.85, 1.93]]) bag.add(W, box(wx + a, y + c, Math.min(z, z + sg * 0.06), wx + b, y + e, Math.max(z, z + sg * 0.06))); }
  } else {
    const f = front ? x0 : x1, sg = front ? -1 : 1, mz = (z0 + z1) / 2, X0 = f + sg * (r + 0.01), X1 = X0 + sg * 0.06;
    const w = kind === 'barn' ? 2.2 : 0.85, h = kind === 'barn' ? 2.3 : 1.7;
    bag.add(W, box(Math.min(X0, X1), y + 0.15, mz - w / 2, Math.max(X0, X1), y + 0.15 + h, mz + w / 2));
    bag.add(W, box(Math.min(X0, X1 + sg * 0.04), y + 0.15 + h, mz - w / 2 - 0.14, Math.max(X0, X1 + sg * 0.04), y + 0.29 + h, mz + w / 2 + 0.14));
  }
  const roof = el.roof ?? (kind === 'stue' ? 'sod' : rand() < 0.5 ? 'sod' : SH), pitch = kind === 'stue' ? 0.5 : 0.7, o = 0.45, yt = y + H + o * pitch;
  const span = alongX ? z1 - z0 : x1 - x0;
  const top = pitched(bag, roof, LOG, el.rect, yt, pitch, o, alongX, roof === 'sod' ? 0.28 : 0.16);
  logGables(bag, el.rect, y + H, span / 2 * pitch + o * pitch - 0.28, alongX, d);
  roofTrim(bag, el.rect, yt, pitch, o, alongX, roof === 'sod');
  // the stue's smoke-hole (ljore) on the ridge: a little boarded hood with its own roof — no chimney yet
  if (kind === 'stue') {
    const mx = (x0 + x1) / 2 - (alongX ? 0.6 : 0), mz = (z0 + z1) / 2 - (alongX ? 0 : 0.6);
    bag.add(W, box(mx - 0.35, top - 0.35, mz - 0.35, mx + 0.35, top + 0.35, mz + 0.35));
    bag.add('opening', box(mx - 0.25, top + 0.05, mz - 0.36, mx + 0.25, top + 0.3, mz + 0.36));
    pitched(bag, W, W, [mx - 0.35, mz - 0.35, mx + 0.35, mz + 0.35], top + 0.35, 0.8, 0.12, alongX, 0.05);
  }
}
/** fence: { pts, y, h } — a fence of split staves along a polyline. */
function fence(el, { bag, col }) {
  const pts = el.pts, y = el.y ?? 0, h = el.h ?? 1.2;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.5);
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t; bag.add(W, box(x - 0.08, y - 0.3, z - 0.08, x + 0.08, y + h + (k % 2) * 0.15, z + 0.08)); }
    col.segment([ax, az], [bx, bz], 0.2, y, y + h);
  }
}
registerStyle('norse', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, stave_church: staveChurch, bell_house: bellHouse, log_house: logHouse, fence },
  objects: {},
});
