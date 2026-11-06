// Greek columns: the Doric of the Parthenon and the Attic-Ionic.
//
// Doric: no base; a shaft of drums with 20 shallow flutes meeting in sharp arrises, swelling
// slightly (entasis) as it tapers; three incised grooves at the neck; four annulets; the
// cushion-like echinus; a square abacus. The Parthenon's shaft follows the measured profile
// r(z) = 0.954753 − 0.0152412 z − 0.000716763 z² (metres; docs/buildings/parthenon.md §4),
// scaled to each column's own height and diameter.
//
// Ionic: Attic base (torus, scotia, torus), 24 flutes separated by fillets, a capital with
// two volutes joined by the cushion (pulvinus) at the sides, and a thin abacus.

import { Matrix4, BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, disc, box, fromTriangles, quad } from '../../core/geom.js';

const TAU = Math.PI * 2;

/** Radial multiplier for a fluted shaft at angle th: n concave flutes, depth as a fraction of r. */
function fluteMod(n, depth, fillet = 0) {
  return (th) => {
    const u = ((th / TAU) * n) % 1;              // 0..1 across one flute
    const w = 1 - fillet;                        // fillets are the flat part between flutes
    const v = (u - fillet / 2) / w;
    if (v < 0 || v > 1) return 1;
    const c = 2 * v - 1;                         // -1..1
    return 1 - depth * Math.sqrt(Math.max(0, 1 - c * c));   // circular-arc flute
  };
}

/** Parthenon entasis, normalised: radius fraction at height fraction t (0 foot … 1 top of shaft). */
function parthenonRadius(t) {
  const z = t * 9.57;                            // the measured shaft is about 9.57 m tall
  return (0.954753 - 0.0152412 * z - 0.000716763 * z * z) / 0.954753;
}

// Columns are built once per shape at the origin and placed by a matrix (GeoBag.addInstance), so that the copies of a
// colonnade share one prototype however their positions round off. A Doric column of diameter d is the column of the
// reference diameter stretched across (every radius of it is proportional to d, every height to h), so the thicker
// corner columns of a peristyle are copies of the others; likewise every height of it is proportional to h, so one
// prototype per material serves the columns of every size in a plan (stretched along the axes, which the instanced
// normals follow). The Ionic column is three such pieces: the base and the capital scale with the diameter, the shaft
// with the diameter across and its own height up.
const CACHE = new Map();
const cached = (key, make) => { let v = CACHE.get(key); if (!v) { v = make(); CACHE.set(key, v); if (CACHE.size > 96) CACHE.delete(CACHE.keys().next().value); } return v; };
const REACH = 2500;
/** Put the pieces [[mat, geometry at the origin, scale [sx, sy, sz] or none]] at (x, y, z), turned by yaw, each stretched by its scale (or s). */
function place(bag, pieces, x, y, z, yaw = 0, s = [1, 1, 1]) {
  for (const [mat, g, sc = s, dy = 0] of pieces) {
    const m = new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(sc[0], sc[1], sc[2])).setPosition(x, y + dy, z);
    if (bag.addInstance) bag.addInstance(mat, g.clone(), m, { reach: REACH });
    else bag.add(mat, g.clone().applyMatrix4(m));
  }
}

const D_REF = 2, H_REF = 10;
/** The Doric column's pieces at the origin for height H_REF and diameter D_REF: the fluted shaft, the echinus, the abacus. */
function doricPieces(n, abacus, simple) {
  const H = H_REF;
  const R = D_REF / 2, capH = H * 0.082, abH = capH * 0.36, echH = capH - abH, shaftH = H - capH;
  // five facets to a flute keep its curve; two in the simple (far, plain) column
  const seg = n ? n * (simple ? 2 : 5) : (simple ? 12 : 24), rows = simple ? 3 : 8;
  const prof = [];
  for (let i = 0; i <= rows; i++) { const t = i / rows; prof.push([R * parthenonRadius(t), shaftH * t]); }
  const rTop = R * parthenonRadius(1);
  let shaft;
  if (simple) shaft = prof;
  else {
    // neck grooves: three shallow cuts a little below the capital
    const g0 = shaftH - capH * 0.55, grooves = [];
    for (let k = 0; k < 3; k++) {
      const yy = g0 + k * 0.035 * H / 10.4;
      grooves.push([rTop * 0.985, yy], [rTop * 0.985, yy + 0.0115 * H / 10], [rTop, yy + 0.019 * H / 10]);
    }
    shaft = prof.filter(([, yy]) => yy < g0 - 0.05 * H / 10).concat([[R * parthenonRadius(g0 / shaftH), g0 - 0.02 * H / 10]], grooves, [[rTop, shaftH]]);
  }
  // the echinus swells from the neck to just inside the abacus edge (Parthenon: abacus ≈ 1.07 D); the annulets below it
  const eR = rTop, EM = R * 1.04 * abacus, L = (t) => eR + (EM - eR) * t;
  const ech = simple
    ? [[eR, 0], [L(0.1), echH * 0.3], [L(0.6), echH * 0.65], [EM, echH * 0.95], [0, echH]]
    : [[eR * 0.99, 0], [eR * 1.025, echH * 0.06], [eR * 0.995, echH * 0.1], [eR * 1.03, echH * 0.16], [eR * 1.0, echH * 0.2],
      [L(0.08), echH * 0.28], [L(0.42), echH * 0.5], [L(0.76), echH * 0.72], [L(0.95), echH * 0.88], [EM, echH * 0.96], [EM * 0.97, echH], [0, echH]];
  const A = R * 1.07 * abacus;
  return [
    lathe(shaft, seg, n ? fluteMod(n, 0.045) : null),
    lathe(ech, simple ? 20 : 48, null, 0, shaftH, 0),
    box(-A, shaftH + echH, -A, A, H, A),
  ];
}

/**
 * Doric column: { at: [x, z], y, h (total, to the top of the abacus), d (lower diameter),
 *                 flutes (20; 0: an unfluted shaft of stuccoed poros), mat, abacus: width multiplier, simple (fewer facets, no neck grooves: stoas, far work) }
 */
export function doricColumn(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h, R = el.d / 2;
  const mat = el.mat || 'marble_column', n = el.flutes ?? 20, ab = el.abacus ?? 1, simple = !!el.simple;
  const g = cached(`d|${n}|${ab}|${simple}`, () => doricPieces(n, ab, simple));
  place(bag, g.map((p) => [mat, p]), x, y, z, 0, [el.d / D_REF, H / H_REF, el.d / D_REF]);
  col.circle(x, z, R * 1.02, y, y + H);
}

/** Ionic volute: a spiral ribbon on a capital face (in the x–y plane, facing +z), centred at the eye. */
function volute(r0, turns, width, thick) {
  const tris = [];
  const N = Math.round(turns * 28);
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = -Math.PI / 2 + t * turns * TAU;          // starts at the bottom, winds inward
    const r = r0 * (1 - t * 0.82);
    pts.push([Math.cos(a) * r, Math.sin(a) * r, width * (1 - t * 0.6)]);
  }
  for (let i = 0; i < N; i++) {
    const [ax, ay, aw] = pts[i], [bx, by, bw] = pts[i + 1];
    // ribbon: outer edge at the spiral, inner edge toward the eye; a raised rim on the face
    const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
    const ai = [ax - ax / la * aw, ay - ay / la * aw], bi = [bx - bx / lb * bw, by - by / lb * bw];
    quad(tris, [ax, ay, thick], [bx, by, thick], [bi[0], bi[1], thick * 0.6], [ai[0], ai[1], thick * 0.6]);
    quad(tris, [ax, ay, 0], [bx, by, 0], [bx, by, thick], [ax, ay, thick]);
  }
  // the eye
  const eye = [];
  for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; eye.push([Math.cos(a) * r0 * 0.12, Math.sin(a) * r0 * 0.12]); }
  for (let k = 1; k < 11; k++) tris.push(eye[0][0], eye[0][1], thick * 1.1, eye[k][0], eye[k][1], thick * 1.1, eye[k + 1][0], eye[k + 1][1], thick * 1.1);
  return fromTriangles(tris);
}

/**
 * Ionic column: { at, y, h, d, flutes (24), mat, yaw (radians; volutes face ±z when 0) }
 */
export function ionicColumn(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h, R = el.d / 2;
  const mat = el.mat || 'marble_column';
  const [base, shaft, cap] = cached('i', () => ionicPieces());
  // the base and the capital each half a diameter and a little more high; the shaft between them
  const shaftH = H - R * 2.1;
  place(bag, [[mat, base, [R, R, R], 0], [mat, shaft, [R, shaftH, R], R], [mat, cap, [R, R, R], R + shaftH]], x, y, z, el.yaw ?? 0);
  col.circle(x, z, R * 1.05, y, y + H);
}

/** The Ionic column's pieces at the origin for R = 1 (volutes facing ±z): the Attic base, the shaft (of height 1), the capital. */
function ionicPieces() {
  const out = [], R = 1;
  // Attic base: plinthless torus–scotia–torus, about half a diameter high
  const bH = R;
  const base = [[R * 1.42, 0], [R * 1.48, bH * 0.12], [R * 1.46, bH * 0.3], [R * 1.36, bH * 0.36], [R * 1.22, bH * 0.42],
    [R * 1.18, bH * 0.55], [R * 1.26, bH * 0.62], [R * 1.3, bH * 0.72], [R * 1.24, bH * 0.86], [R * 1.08, bH * 0.94], [R * 1.02, bH]];
  out.push(merge([lathe(base, 36), disc(R * 1.42, 0.001, 36, 0, 0, false)]));
  const capH = R * 1.1, abH = capH * 0.18;
  const rTop = R * 0.84;
  const prof = [];
  for (let i = 0; i <= 5; i++) { const t = i / 5; prof.push([R + (rTop - R) * (t * 0.7 + t * t * 0.3), t]); }
  out.push(lathe(prof, 24 * 5, fluteMod(24, 0.06, 0.18)));
  // capital: echinus ring, the volute block with its two faces, the thin abacus
  const parts = [lathe([[rTop * 1.02, 0], [rTop * 1.12, capH * 0.18], [rTop * 1.1, capH * 0.42], [0, capH * 0.42]], 32)];
  const vw = R * 1.55;
  // the canalis: a slab joining the volutes across the face; the cushion behind
  parts.push(box(-vw, capH * 0.34, -R * 0.82, vw, capH * 0.82, R * 0.82));
  for (const sx of [-1, 1]) {
    // pulvinus (bolster) seen from the side: a waisted cylinder along z
    const b = lathe([[R * 0.42, -R * 0.82], [R * 0.36, -R * 0.45], [R * 0.3, 0], [R * 0.36, R * 0.45], [R * 0.42, R * 0.82]], 16);
    b.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
    b.translate(sx * (vw - R * 0.42), capH * 0.5, 0);
    parts.push(b);
    for (const sz of [-1, 1]) {
      const v = volute(R * 0.42, 2.6, R * 0.12, R * 0.09);
      const m = new Matrix4().makeRotationY(sz > 0 ? 0 : Math.PI);
      m.setPosition(sx * (vw - R * 0.42), capH * 0.5, sz * R * 0.83);
      v.applyMatrix4(m);
      parts.push(v);
    }
  }
  const aw = vw * 0.98;
  parts.push(box(-aw, capH - abH, -R * 0.95, aw, capH, R * 0.95));
  out.push(merge(parts));
  return out;
}

function merge(list) {
  list = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const out = new BufferGeometry();
  out.setAttribute('position', new Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return out;
}

export { merge, fluteMod };
