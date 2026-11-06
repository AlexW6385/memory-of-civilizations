// Norse carving (docs/settlements/norse-borgund.md §1, "The dragon heads and crests", "The west portal"):
// the dragon heads that swoop out from the ridge crests over the gables, the openwork crests, and the
// carved west portal — the broad side panels covered in carpet-like vine work growing out of dragon
// heads on the half-columns, the facing dragons with spread wings above, the archivolt and the small
// dragon curled in the field over it. All of it flat relief cut from a plank, as the carvers worked.

import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { lathe } from '../../core/geom.js';

/**
 * A piece of relief: `shape` drawn in (u, v) on a vertical plane through O = [x, y, z] whose outward normal is
 * n = [nx, nz]; u runs along (nz, −nx), v up; the piece stands from d0 to d1 along n.
 */
export function relief(shape, O, n, d0, d1, seg = 6) {
  const g = new ExtrudeGeometry(shape, { depth: d1 - d0, bevelEnabled: false, curveSegments: seg });
  g.deleteAttribute('uv'); g.translate(0, 0, d0);
  const [nx, nz] = n;
  g.applyMatrix4(new Matrix4().makeBasis({ x: nz, y: 0, z: -nx }, { x: 0, y: 1, z: 0 }, { x: nx, y: 0, z: nz }).setPosition(O[0], O[1], O[2]));
  return g;
}
/** A closed outline through the points pts, as a Shape. */
export function poly(pts) { const s = new Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; }
/** A ribbon (a band of width w — a number or a function of the fraction along) following the polyline pts, as a Shape. */
export function ribbon(pts, w) {
  const L = [], R = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
    const ww = (typeof w === 'function' ? w(i / (n - 1)) : w) / 2, nx = -ty / l * ww, ny = tx / l * ww;
    L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]);
  }
  return poly([...L, ...R.reverse()]);
}
/** A spiral (a tendril curling in on itself): from the point p0 on a circle of radius r round c, turning `turns` times (dir ±1), shrinking to `k` of r. */
export function spiral(c, a0, r, turns = 1.2, dir = 1, k = 0.3, n = 28) {
  return Array.from({ length: n + 1 }, (_, i) => { const f = i / n, a = a0 + dir * f * turns * Math.PI * 2, rr = r * (1 - (1 - k) * f); return [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]; });
}
/** A shape's outline as points, mapped by fn([u, v]) → [u, v] (a mirror is fine: the extrusion fixes the winding). */
function mapShape(sh, fn, div = 6) { return poly(sh.getPoints(div).map((p) => fn([p.x, p.y]))); }

// ── the dragon's head, in profile: the neck swooping up out of the crest, the head looking out with open
// jaws and teeth, the snout curled up at its tip, a horn swept back; u out from the crest's end, v up; about
// 1.9 long and 1.3 high at k = 1 (the Urnes-style heads of Borgund and Lom).
function headShape() {
  const s = new Shape();
  s.moveTo(0, -0.1);
  s.bezierCurveTo(0.35, -0.12, 0.62, 0.05, 0.78, 0.3);
  s.bezierCurveTo(0.86, 0.42, 0.95, 0.5, 1.08, 0.52);
  s.lineTo(1.55, 0.5);
  s.quadraticCurveTo(1.66, 0.5, 1.68, 0.58);
  for (const p of [[1.6, 0.59], [1.56, 0.64], [1.5, 0.59], [1.44, 0.64], [1.38, 0.59], [1.32, 0.63], [1.18, 0.66],
    [1.28, 0.72], [1.34, 0.77], [1.4, 0.71], [1.46, 0.77], [1.52, 0.71], [1.58, 0.77], [1.64, 0.72], [1.74, 0.78]]) s.lineTo(p[0], p[1]);
  s.quadraticCurveTo(1.88, 0.82, 1.86, 0.96);
  s.quadraticCurveTo(1.82, 1.03, 1.74, 0.99);
  s.quadraticCurveTo(1.55, 0.93, 1.38, 0.96);
  s.quadraticCurveTo(1.28, 1.06, 1.18, 1.02);
  s.lineTo(1.05, 1.22);
  s.quadraticCurveTo(0.92, 1.33, 0.8, 1.26);
  s.quadraticCurveTo(0.92, 1.17, 1.0, 0.99);
  s.bezierCurveTo(0.8, 0.82, 0.55, 0.45, 0.35, 0.22);
  s.bezierCurveTo(0.25, 0.1, 0.12, 0.06, 0, 0.06);
  s.lineTo(0, -0.1);
  return s;
}
/** The mane along the back of the neck: a band with a scalloped outer edge (curls of hair), its inner edge sunk in the neck. */
function maneShape() {
  const back = [[0.12, 0.02], [0.3, 0.13], [0.5, 0.36], [0.7, 0.6], [0.88, 0.8], [0.98, 0.92]];
  const out = [], inner = back.map(([u, v]) => [u + 0.03, v - 0.05]);
  for (let i = 0; i + 1 < back.length; i++) {
    const [a, b] = [back[i], back[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    for (let k = 0; k <= 4; k++) { const f = k / 4, bump = Math.sin(f * Math.PI) * 0.11; out.push([a[0] + dx * f + nx * (0.03 + bump), a[1] + dy * f + ny * (0.03 + bump)]); }
  }
  return poly([...out, ...inner.reverse()]);
}
const HEAD = headShape(), MANE = maneShape();
const TONGUE = ribbon([[1.22, 0.69], [1.5, 0.68], [1.78, 0.66], [1.96, 0.6], [2.04, 0.5], [2.02, 0.41], [1.95, 0.38]], (f) => 0.06 * (1 - 0.6 * f));
/**
 * A dragon head swooping out from a ridge crest's end at O = [x, y, z], looking out along dir = [dx, dz],
 * k its size; a neck th thick, the mane thinner, the tongue thinner still, the eyes standing proud.
 */
export function dragonHead(bag, mat, O, dir, k = 1, th = 0.2) {
  const n = [-dir[1], dir[0]], sc = (p) => [p[0] * k, p[1] * k], t = th * k;
  bag.add(mat, relief(mapShape(HEAD, sc), O, n, -t / 2, t / 2, 8));
  bag.add(mat, relief(mapShape(MANE, sc), O, n, -t * 0.32, t * 0.32, 4));
  bag.add(mat, relief(mapShape(TONGUE, sc), O, n, -t * 0.12, t * 0.12, 4));
  // the eye: an almond boss on each side of the head; the nostril's curl on the snout
  const eye = new Shape(); eye.absellipse(1.3 * k, 0.86 * k, 0.07 * k, 0.045 * k, 0, Math.PI * 2, false, -0.3);
  bag.add(mat, relief(eye, O, n, -t / 2 - 0.025 * k, t / 2 + 0.025 * k, 8));
  bag.add(mat, relief(ribbon(spiral([1.74 * k, 0.9 * k], Math.PI, 0.05 * k, 0.9, -1, 0.4, 12), 0.022 * k), O, n, -t / 2 - 0.015 * k, t / 2 + 0.015 * k, 4));
}
/**
 * An openwork ridge crest: a board th thick, standing h above the ridge from a to b (plan points) at height y, pierced
 * with round holes and slots between them, its top cut in a row of lobes.
 */
export function ridgeCrest(bag, mat, a, b, y, h = 0.36, th = 0.06) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / (h * 1.1))), p = L / n;
  const sh = new Shape(); sh.moveTo(0, -0.08); sh.lineTo(L, -0.08); sh.lineTo(L, h * 0.7);
  for (let i = n - 1; i >= 0; i--) sh.absarc((i + 0.5) * p, h * 0.7, p / 2, 0, Math.PI, false);
  sh.lineTo(0, -0.08);
  for (let i = 0; i < n; i++) {
    const c = new Path(); c.absarc((i + 0.5) * p, h * 0.55, Math.min(p, h) * 0.24, 0, Math.PI * 2, true); sh.holes.push(c);
    if (i > 0) { const s = new Path(), u = i * p, w = p * 0.08; s.moveTo(u - w, h * 0.1); s.lineTo(u + w, h * 0.1); s.lineTo(u + w, h * 0.42); s.absarc(u, h * 0.42, w, 0, Math.PI, false); s.lineTo(u - w, h * 0.1); sh.holes.push(s); }
  }
  const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L;
  bag.add(mat, relief(sh, [a[0], y, a[1]], [-dz, dx], -th / 2, th / 2, 6));
}

/**
 * The west portal (Sogn–Valdres type) on a wall facing n = [nx, nz], the door's foot centred at O = [x, y, z]:
 * the door w wide, round-headed, springing at hs; the broad side panels (vanger) pw wide each side carrying the
 * carpet of vine work; the field over the arch up to top(u) (the gable's underside, u from the door's axis).
 * The board stands `d` proud of the wall; the relief another few centimetres on it.
 */
export function westPortal(bag, mat, O, n, { w, hs, pw, top, d = 0.1 }) {
  const W2 = w / 2 + 0.02, U = W2 + pw, R = (u) => Math.max(hs + W2 + 0.3, top(u));
  // the board: the side panels and the field over the arch in one, the door cut out of it
  const board = new Shape(); board.moveTo(-U, 0); board.lineTo(-W2, 0); board.lineTo(-W2, hs); board.absarc(0, hs, W2, Math.PI, 0, true); board.lineTo(W2, 0); board.lineTo(U, 0);
  for (let i = 0; i <= 8; i++) { const u = U - (2 * U) * i / 8; board.lineTo(u, R(u)); }
  board.lineTo(-U, 0);
  bag.add(mat, relief(board, O, n, -0.01, d, 12));
  const F = (sh, d1, seg = 4) => bag.add(mat, relief(sh, O, n, d - 0.005, d + d1, seg));
  // the archivolt: a band round the arch, a twisted stem running in it
  { const r0 = W2 + 0.02, r1 = W2 + 0.16, a = new Shape(); a.absarc(0, hs, r1, Math.PI, 0, true); a.lineTo(r0, hs); a.absarc(0, hs, r0, 0, Math.PI, false); a.lineTo(-r1, hs); F(a, 0.03, 16);
    const tw = [], m = 40; for (let i = 0; i <= m; i++) { const t = Math.PI * (1 - i / m), rr = (r0 + r1) / 2 + 0.045 * Math.sin(i * Math.PI / 3); tw.push([Math.cos(t) * rr, hs + Math.sin(t) * rr]); }
    F(ribbon(tw, 0.028), 0.06);
    const tw2 = tw.map(([u, v], i) => { const t = Math.PI * (1 - i / m), rr = (r0 + r1) / 2 - 0.045 * Math.sin(i * Math.PI / 3); return [Math.cos(t) * rr, hs + Math.sin(t) * rr]; });
    F(ribbon(tw2, 0.028), 0.05); }
  for (const sg of [-1, 1]) {
    const M = (p) => [sg * p[0], p[1]];
    // the half-column at the door's edge: base, shaft, the capital under the springing
    const uc = sg * (W2 + 0.07), [cx, cz] = [O[0] + n[1] * uc + n[0] * (d + 0.02), O[2] - n[0] * uc + n[1] * (d + 0.02)];
    bag.add(mat, lathe([[0.1, 0], [0.1, 0.12], [0.075, 0.18], [0.065, 0.24], [0.06, hs - 0.2], [0.075, hs - 0.16], [0.11, hs - 0.04], [0.11, hs], [0.001, hs]], 10, null, cx, O[1], cz));
    // a dragon's head on the shaft above the plinth, looking out across the panel, the vine stem growing from its jaws
    const hk = 0.2, hu = W2 + 0.13, hv = 0.24;
    F(mapShape(HEAD, (p) => M([hu + p[0] * hk, hv + p[1] * hk])), 0.07, 6);
    // the stem: rising across the panel in a wave from the jaws to the panel's head, a tendril curling in each bay
    const u0 = hu + 1.86 * hk, v0 = hv + 0.62 * hk, uA = W2 + pw * 0.5, A = pw * 0.3, v1 = hs + 0.1, lam = (v1 - v0) / 2.5;
    // two stems twine up the panel from the jaws, crossing each other (one standing prouder than the other), a tendril curling in each bay
    for (const [ph, dd] of [[Math.PI, 0.06], [0, 0.045]]) {
      const yAt = (v) => uA + A * Math.sin((v - v0) / lam * Math.PI * 2 + ph);
      const stem = [[u0, v0]];
      for (let i = 1; i <= 60; i++) { const f = i / 60, v = v0 + (v1 - v0) * f, b = Math.min(1, f * 4); stem.push([yAt(v) * b + u0 * (1 - b), v]); }
      F(ribbon(stem.map(M), 0.042), dd);
      for (let j = 0; j < 5; j++) {
        const vj = v0 + lam * (0.25 + j * 0.5), uj = yAt(vj), side = Math.sign(uj - uA) || 1, r = pw * 0.15;
        if (vj > v1 - 0.05 || vj < v0 + lam * 0.4) continue;
        const c = [uj - side * r, vj + r * 0.45];
        F(ribbon(spiral(c, side > 0 ? 0 : Math.PI, r, 1.2, side > 0 ? 1 : -1, 0.25).map(M), (f) => 0.034 * (1 - 0.55 * f)), dd - 0.008);
        // a leaf lobe off the outer side of the stem
        const lv = vj - lam * 0.12, lu = yAt(lv);
        F(ribbon([[lu, lv], [lu + side * 0.06, lv + 0.04], [lu + side * 0.11, lv + 0.1], [lu + side * 0.09, lv + 0.16]].map(M), (f) => 0.05 * (1 - 0.8 * f)), dd - 0.012);
      }
    }
    // the outer border: a band with the small dragons running down it (a beaded strand)
    const bu = U - 0.035;
    F(ribbon([[bu, 0.05], [bu, R(sg * bu) - 0.06]].map(M), 0.05), 0.02);
    for (let v = 0.12; v < R(sg * bu) - 0.12; v += 0.11) F(ribbon(spiral([bu, v], -Math.PI / 2, 0.022, 0.8, 1, 0.5, 8).map(M), 0.014), 0.035);
    // the great dragon above, its body rising in an S from the panel's head, the wing spread, the head turned in toward the arch
    const b0 = [W2 + pw * 0.75, hs + 0.05], body = [];
    for (let i = 0; i <= 30; i++) { const f = i / 30; body.push([b0[0] - pw * 0.25 * Math.sin(f * Math.PI * 1.2) - pw * 0.25 * f, b0[1] + f * 0.62]); }
    F(ribbon(body.map(M), (f) => 0.1 * (0.5 + 0.5 * f)), 0.07);
    // its tail coiled at the panel's head
    F(ribbon(spiral([b0[0] + 0.02, b0[1] + 0.06], -Math.PI / 2, 0.07, 1.1, -1, 0.3).map(M), (f) => 0.03 * (1 - 0.5 * f)), 0.05);
    const end = body[body.length - 1], hk2 = 0.2;
    F(mapShape(HEAD, (p) => M([end[0] - p[0] * hk2 + 0.04, end[1] + p[1] * hk2 - 0.08])), 0.08, 6);
    { const wb = body[18], wing = poly([[0, 0], [0.1, 0.06], [0.2, 0.2], [0.22, 0.3], [0.14, 0.24], [0.12, 0.3], [0.05, 0.2], [0.02, 0.24], [-0.02, 0.1]].map((p) => M([wb[0] + p[0] * 1.6, wb[1] + p[1] * 1.5]))); F(wing, 0.055); }
    // the leg reaching down toward the column's head
    F(ribbon([body[9], [body[9][0] - 0.06, body[9][1] - 0.12], [body[9][0] - 0.03, body[9][1] - 0.2]].map(M), 0.03), 0.05);
  }
  // the small dragon curled in on itself in the field over the archivolt
  { const c = [0, hs + W2 + 0.38]; F(ribbon(spiral(c, -Math.PI / 2, 0.16, 1.3, 1, 0.3), (f) => 0.05 * (1 - 0.5 * f)), 0.055);
    F(mapShape(HEAD, (p) => [c[0] - 0.02 + p[0] * 0.12, c[1] - 0.24 + p[1] * 0.12]), 0.06, 6); }
}
