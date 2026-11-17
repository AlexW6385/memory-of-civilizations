// The Pharos' detail (docs/settlements/alexandria.md §3, §12): what the eye reads on the three stages from the harbour — the quoins and
// the framed windows of the tower, the cavetto cornice under the platform, the Tritons that stood on its corners, the pilasters and the
// parapet of the octagon, the ribs and the gallery rail of the cylinder, the lantern with its fire, bowl and mirror, and Zeus Soter on
// the dome. Forms [inferred] from Thiersch's reconstruction, the coins of Alexandria (the Tritons at the corners of the first stage)
// and the Arab descriptions (the mirror, the fire); the sizes from §3. Everything merged into the tower's bag (no new objects).

import { box, lathe, rod } from '../../core/geom.js';

const ring4 = (bag, mat, cx, cz, ho, hi, y0, y1) => {              // a square ring: outer half-width ho, inner hi
  bag.add(mat, box(cx - ho, y0, cz - ho, cx + ho, y1, cz - hi)); bag.add(mat, box(cx - ho, y0, cz + hi, cx + ho, y1, cz + ho));
  bag.add(mat, box(cx - ho, y0, cz - hi, cx - hi, y1, cz + hi)); bag.add(mat, box(cx + hi, y0, cz - hi, cx + ho, y1, cz + hi));
};
/** The first stage: quoins up the four corners (long and short, alternating), framed windows in the four faces, the cavetto cornice under the platform. */
export function stageOne(bag, { cx, cz, y0, yt, h, inset, lean, H1, windows }) {
  const NC = 26, dc = (H1 - 4.0) / NC;
  for (let k = 0; k < NC; k++) {
    const ya = y0 + 4.0 + k * dc, yb = ya + dc, hw = h - lean(yb) + 0.2, long = k % 2 ? 2.1 : 1.0, short = k % 2 ? 1.0 : 2.1, m = k < 3 ? 'granite_grey' : k % 2 ? 'limestone' : 'tura_limestone';
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = cx + sx * hw, z = cz + sz * hw;
      bag.add(m, box(Math.min(x, x - sx * long), ya, Math.min(z, z - sz * short), Math.max(x, x - sx * long), yb, Math.max(z, z - sz * short)));
    }
  }
  // the windows' frames: jambs, a lintel and a sill standing out of the face
  for (const [yy, u] of windows) {
    const q = h - lean(yy + 2.2) + 0.02;
    for (const sd of [-1, 1]) {
      const n0 = sd > 0 ? q - 0.12 : -q - 0.32, n1 = sd > 0 ? q + 0.32 : -q + 0.12;
      for (const [a, ya, b, yb, m] of [[u - 0.7, yy - 0.15, u - 0.4, yy + 2.5, 'limestone'], [u + 0.4, yy - 0.15, u + 0.7, yy + 2.5, 'limestone'], [u - 0.8, yy + 2.2, u + 0.8, yy + 2.55, 'tura_limestone'], [u - 0.8, yy - 0.3, u + 0.8, yy - 0.1, 'tura_limestone']]) {
        bag.add(m, box(cx + a, ya, cz + n0, cx + b, yb, cz + n1));        // north and south faces
        bag.add(m, box(cx + n0, ya, cz + a, cx + n1, yb, cz + b));        // east and west faces
      }
    }
  }
  // the cavetto cornice: a corbel course, a painted band, then four steps rolling out
  const e = h - inset + 0.5;
  ring4(bag, 'tura_limestone', cx, cz, e + 0.15, e - 1.2, yt - 1.5, yt - 0.9);
  ring4(bag, 'egyptian_blue', cx, cz, e + 0.2, e - 1.2, yt - 0.9, yt - 0.62);
  for (let k = 0; k < 4; k++) ring4(bag, 'limestone', cx, cz, e + 0.2 + 0.4 * Math.sin((k + 1) / 4 * Math.PI / 2), e - 1.2, yt - 0.62 + k * 0.155, yt - 0.62 + (k + 1) * 0.155);
}
const ball = (r, x, y, z) => lathe([[0.001, -r], [r * 0.7, -r * 0.7], [r, 0], [r * 0.7, r * 0.7], [0.001, r]], 7, null, x, y, z);
/** A tapering tube along the points `pts` (radius r0 at the first, r1 at the last): rods with a ball at each joint. */
function chain(add, pts, r0, r1) {
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) {
    const ra = r0 + (r1 - r0) * i / n, rb = r0 + (r1 - r0) * (i + 1) / n;
    add(rod(pts[i], pts[i + 1], (ra + rb) / 2, 6));
    add(ball((i + 1 < n ? rb : rb * 0.9), pts[i + 1][0], pts[i + 1][1], pts[i + 1][2]));
  }
}
/**
 * A Triton (a man's torso on the coiled fish tail, blowing a conch, one hand on the coils) at (x, y, z) looking along yaw, s the scale
 * (1 = about 3.4 m tall). On the corners of the first stage, as on the coins of Alexandria [stated: Wikipedia "Lighthouse of Alexandria"]:
 * the tail rises in a loop from a fluked end on the plinth, the torso leans back, the head is turned up to the conch. Local +z is the way he faces.
 */
export function triton(bag, x, y, z, yaw, s = 1.5) {
  const P = (g) => { g.rotateY(yaw); g.translate(x, y, z); return g; };
  const S = (p) => [p[0] * s, p[1] * s, p[2] * s];
  const body = (m, g) => bag.add(m, P(g));
  bag.add('limestone', P(box(-0.75 * s, 0, -1.05 * s, 0.75 * s, 0.3 * s, 0.9 * s)));                                // the plinth
  bag.add('limestone', P(box(-0.65 * s, 0.3 * s, -0.95 * s, 0.65 * s, 0.4 * s, 0.8 * s)));
  // the tail: from the waist down in a loop, thinning to the fluke that lies on the plinth
  const tail = [[0.1, 2.0, 0.1], [0.45, 1.5, 0.15], [0.55, 1.0, -0.35], [0.1, 0.8, -0.85], [-0.45, 0.85, -0.55], [-0.6, 0.62, 0.1], [-0.3, 0.52, 0.65], [0.15, 0.48, 0.8]].map(S);
  chain((g) => body('gilt_bronze', g), tail, 0.34 * s, 0.07 * s);
  for (const sd of [-1, 1]) { const f = box(-0.04 * s, 0, 0, 0.04 * s, 0.03 * s, 0.5 * s); f.rotateY(sd * 0.7); f.translate(0.15 * s, 0.44 * s, 0.8 * s); body('gilt_bronze', f); }  // the fluke
  // the scales' ridge along the tail: small balls at intervals
  for (let i = 0; i < tail.length - 1; i++) body('gilt_bronze', ball(0.08 * s, (tail[i][0] + tail[i + 1][0]) / 2 + 0.0, (tail[i][1] + tail[i + 1][1]) / 2 + 0.26 * s, (tail[i][2] + tail[i + 1][2]) / 2));
  // the torso, leaning back from the waist; the shoulders, the chest
  const t = new Float32Array(0); void t;
  const torso = lathe([[0.001, 0], [0.3 * s, 0.02 * s], [0.34 * s, 0.35 * s], [0.4 * s, 0.7 * s], [0.34 * s, 0.9 * s], [0.14 * s, 1.0 * s], [0.001, 1.02 * s]], 12, null, 0, 0, 0);
  torso.rotateX(-0.28); torso.translate(0.1 * s, 2.0 * s, 0.1 * s); body('gilt_bronze', torso);
  const hx = 0.1 * s, hy = 3.0 * s, hz = -0.12 * s;
  body('gilt_bronze', lathe([[0.001, 0], [0.14 * s, 0.02 * s], [0.17 * s, 0.2 * s], [0.12 * s, 0.38 * s], [0.001, 0.42 * s]], 8, null, hx, hy, hz));     // the head
  body('bronze', lathe([[0.001, 0.26 * s], [0.2 * s, 0.22 * s], [0.22 * s, 0.1 * s], [0.18 * s, -0.12 * s], [0.1 * s, -0.04 * s]], 8, null, hx, hy, hz - 0.03 * s));  // the wet hair, falling behind
  // the arms: the right bent up to the conch at the mouth, the left stretched back over the coils
  const sh = (sd) => [(0.1 + sd * 0.4) * s, 2.8 * s, -0.05 * s];
  const R = sh(1), L = sh(-1);
  chain((g) => body('gilt_bronze', g), [R, [0.78 * s, 2.55 * s, 0.35 * s], [0.45 * s, 3.05 * s, 0.4 * s]], 0.11 * s, 0.08 * s);
  chain((g) => body('gilt_bronze', g), [L, [-0.5 * s, 2.45 * s, 0.1 * s], [-0.55 * s, 1.95 * s, 0.45 * s]], 0.11 * s, 0.08 * s);
  // the conch: a spiral shell, the mouth-piece at the lips, the bell flaring forward and out
  const conch = lathe([[0.001, 0], [0.05 * s, 0.02 * s], [0.09 * s, 0.3 * s], [0.19 * s, 0.62 * s], [0.27 * s, 0.9 * s], [0.2 * s, 0.98 * s], [0.001, 1.0 * s]], 8, null, 0, 0, 0);
  conch.rotateX(Math.PI / 2 - 0.3); conch.translate(0.1 * s, 3.1 * s, 0.05 * s); body('marble', conch);
}
/** The octagon (stage two, half-width `w` across flats at the foot): eight round corner ribs, two painted belts, the parapet round its top. */
export function stageTwo(bag, { cx, cz, y2, H2, w, w2 }) {
  const R = (a) => a / 2 / Math.cos(Math.PI / 8);
  for (let a = 0; a < 8; a++) {
    const ang = Math.PI / 8 + a * Math.PI / 4, s = Math.sin(ang), c = Math.cos(ang);
    bag.add('limestone', rod([cx + s * (R(w) + 0.05), y2, cz + c * (R(w) + 0.05)], [cx + s * (R(w2) + 0.05), y2 + H2, cz + c * (R(w2) + 0.05)], 0.34, 6));
  }
  for (const f of [0.34, 0.68]) {
    const wid = w - (w - w2) * f + 0.5, g = lathe([[R(wid), 0], [R(wid), 0.5]], 8); g.rotateY(Math.PI / 8); g.translate(cx, y2 + f * H2, cz);
    bag.add(f < 0.5 ? 'egyptian_blue' : 'tura_limestone', g);
  }
  // the parapet on the octagon's cornice: a rail between eight posts
  const yp = y2 + H2 + 0.7, rr = R(17.0), pts = [];
  for (let a = 0; a < 8; a++) { const ang = Math.PI / 8 + a * Math.PI / 4; pts.push([cx + Math.sin(ang) * rr, cz + Math.cos(ang) * rr]); }
  for (let a = 0; a < 8; a++) {
    const p = pts[a], q = pts[(a + 1) % 8];
    bag.add('limestone', box(p[0] - 0.25, yp, p[1] - 0.25, p[0] + 0.25, yp + 1.3, p[1] + 0.25));
    bag.add('limestone', rod([p[0], yp + 1.0, p[1]], [q[0], yp + 1.0, q[1]], 0.14, 5));
    bag.add('limestone', rod([p[0], yp + 0.45, p[1]], [q[0], yp + 0.45, q[1]], 0.1, 4));
  }
}
/** The cylinder (stage three): eight ribs, a belt, a ring of small windows, the gallery's bronze rail round the top. */
export function stageThree(bag, { cx, cz, y3, H3 }) {
  for (let a = 0; a < 8; a++) {
    const ang = a * Math.PI / 4, s = Math.sin(ang), c = Math.cos(ang);
    bag.add('limestone', rod([cx + s * 4.55, y3, cz + c * 4.55], [cx + s * 4.2, y3 + H3, cz + c * 4.2], 0.2, 5));
    const ang2 = ang + Math.PI / 8, s2 = Math.sin(ang2), c2 = Math.cos(ang2);
    bag.add('opening', box(cx + s2 * 4.3 - 0.3, y3 + 4.5, cz + c2 * 4.3 - 0.3, cx + s2 * 4.3 + 0.3, y3 + 6.8, cz + c2 * 4.3 + 0.3));
  }
  bag.add('egyptian_blue', lathe([[4.42, 3.6], [4.42, 4.0], [4.3, 4.0], [4.3, 3.6]], 20, null, cx, y3, cz));
  const yg = y3 + H3 + 0.4;
  for (let a = 0; a < 16; a++) { const ang = a * Math.PI / 8; bag.add('bronze', rod([cx + Math.sin(ang) * 5.2, yg, cz + Math.cos(ang) * 5.2], [cx + Math.sin(ang) * 5.2, yg + 1.05, cz + Math.cos(ang) * 5.2], 0.05, 4)); }
  bag.add('bronze', lathe([[5.27, 0.98], [5.27, 1.08], [5.13, 1.08], [5.13, 0.98]], 20, null, cx, yg, cz));
}
/** The fire in the lantern: a bowl on a tripod, a stack of logs, five tongues of flame, and the mirror of polished bronze behind it on the seaward (north) side. */
export function fire(bag, { cx, cz, yl }) {
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3 + 0.4; bag.add('bronze', rod([cx + Math.sin(a) * 0.9, yl, cz + Math.cos(a) * 0.9], [cx + Math.sin(a) * 0.25, yl + 0.9, cz + Math.cos(a) * 0.25], 0.05, 4)); }
  bag.add('bronze', lathe([[0.3, 0], [1.0, 0.25], [1.05, 0.4], [0.9, 0.4], [0.001, 0.15]], 12, null, cx, yl + 0.8, cz));
  for (let k = 0; k < 6; k++) { const a = k * 1.05; bag.add('wood_dark', rod([cx + Math.sin(a) * 0.55, yl + 1.25, cz + Math.cos(a) * 0.55], [cx - Math.sin(a) * 0.55, yl + 1.5, cz - Math.cos(a) * 0.55], 0.08, 5)); }
  const tongues = [[0, 0, 3.0], [0.4, 0.2, 2.2], [-0.4, 0.1, 2.4], [0.1, -0.45, 2.0], [-0.15, 0.45, 2.1]];
  for (const [dx, dz, hh] of tongues) bag.add('flame', lathe([[0.001, 0], [0.4, 0.05], [0.28, hh * 0.45], [0.12, hh * 0.8], [0.001, hh]], 7, null, cx + dx, yl + 1.45, cz + dz));
  const m = box(-1.3, 0, -0.06, 1.3, 2.6, 0.06); m.rotateX(-0.28); m.translate(cx, yl + 0.9, cz - 1.45);      // the mirror, leaning out over the sea
  bag.add('silver', m);
  bag.add('bronze', box(cx - 1.38, yl + 0.8, cz - 1.62, cx + 1.38, yl + 0.95, cz - 1.38));
}
/** The lantern chamber (4.3 m across [stated]): a stylobate, eight columns with bases and capitals, an architrave ring with a palmette frieze, and the dome of lead with its ribs and finial. */
export function lantern(bag, { cx, cz, yl, HL }) {
  bag.add('marble', lathe([[0.001, 0], [2.55, 0], [2.55, 0.12], [2.35, 0.16], [0.001, 0.16]], 16, null, cx, yl, cz));              // the stylobate
  for (let a = 0; a < 8; a++) {
    const ang = a * Math.PI / 4 + Math.PI / 8, x = cx + Math.sin(ang) * 2.0, z = cz + Math.cos(ang) * 2.0, y = yl + 0.16;
    bag.add('marble', lathe([[0.001, 0], [0.3, 0], [0.3, 0.08], [0.24, 0.14], [0.001, 0.14]], 8, null, x, y, z));                   // the base
    bag.add('marble_column', lathe([[0.22, 0.14], [0.19, HL - 0.5]], 8, null, x, y, z));                                              // the shaft
    bag.add('marble', lathe([[0.19, HL - 0.5], [0.27, HL - 0.42], [0.3, HL - 0.25], [0.36, HL - 0.2], [0.36, HL - 0.16], [0.001, HL - 0.16]], 8, null, x, y, z));    // the capital
  }
  bag.add('marble', lathe([[0.001, 0], [2.55, 0], [2.55, 0.5], [2.4, 0.56], [0.001, 0.56]], 16, null, cx, yl + HL - 0.16, cz));      // the architrave, closed below
  bag.add('egyptian_blue', lathe([[2.56, 0.1], [2.56, 0.4], [2.5, 0.4], [2.5, 0.1]], 16, null, cx, yl + HL - 0.16, cz));             // its painted band
  const yd = yl + HL + 0.4;
  bag.add('lead', lathe([[2.55, 0], [2.3, 0.45], [1.7, 1.1], [1.0, 1.6], [0.45, 1.95], [0.001, 2.05]], 16, null, cx, yd, cz));
  for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4, s = Math.sin(ang), c = Math.cos(ang); bag.add('bronze', rod([cx + s * 2.58, yd, cz + c * 2.58], [cx + s * 0.35, yd + 2.0, cz + c * 0.35], 0.06, 4)); }
  bag.add('bronze', lathe([[0.001, 0], [0.5, 0.02], [0.4, 0.2], [0.001, 0.3]], 10, null, cx, yd + 1.95, cz));                          // the finial's plate
}
/**
 * Zeus Soter on the dome (6 m on a drum): standing, the weight on the right leg, the himation wrapped about the hips and thrown over the
 * left shoulder, the chest bare, the head bearded and crowned with the heavy hair, the right arm raised with the thunderbolt, the left
 * holding the long sceptre; an eagle at his feet. [inferred in form from Hellenistic Zeus types; stated: a statue of Zeus Soter or Poseidon topped the tower]
 */
export function zeus(bag, cx, ys, cz) {
  const G = (g) => bag.add('gilt_bronze', g);
  G(lathe([[0.001, 0], [1.0, 0], [1.0, 0.25], [0.8, 0.35], [0.8, 0.5], [0.001, 0.5]], 12, null, cx, ys, cz));                          // the drum with its moulding
  const y = ys + 0.5;
  // the legs under the himation: the skirt falls from the hips in folds (a fluted lathe, then vertical ribs)
  G(lathe([[0.001, 0], [0.75, 0.03], [0.72, 0.3], [0.6, 1.3], [0.54, 2.2], [0.5, 2.5], [0.001, 2.5]], 12, null, cx, y, cz));
  for (let k = 0; k < 9; k++) { const a = k * Math.PI * 2 / 9 + 0.3, s = Math.sin(a), c = Math.cos(a); G(rod([cx + s * 0.74, y + 0.1, cz + c * 0.74], [cx + s * 0.55, y + 2.35, cz + c * 0.55], 0.045, 4)); }
  G(lathe([[0.001, 0], [0.5, 0.0], [0.4, 0.5], [0.36, 1.0], [0.4, 1.3], [0.3, 1.55], [0.001, 1.6]], 12, null, cx, y + 2.5, cz));            // the trunk: waist, bare chest, shoulders
  G(lathe([[0.001, 0], [0.09, 0.0], [0.11, 0.3], [0.001, 0.3]], 6, null, cx, y + 4.0, cz));                                               // the neck
  G(lathe([[0.001, 0], [0.17, 0.05], [0.21, 0.25], [0.15, 0.5], [0.001, 0.52]], 9, null, cx, y + 4.15, cz));                             // the head
  G(lathe([[0.001, 0.52], [0.24, 0.38], [0.27, 0.15], [0.22, -0.2], [0.12, -0.1]], 9, null, cx, y + 4.2, cz - 0.03));                    // the thick hair, falling behind the neck
  G(lathe([[0.001, 0], [0.15, 0.0], [0.12, -0.35], [0.001, -0.55]], 7, null, cx, y + 4.28, cz + 0.12));                                   // the beard
  // the himation's end across the chest and over the left shoulder: a broad diagonal band
  const band = box(-0.18, 0, -0.07, 0.18, 1.75, 0.07); band.rotateZ(-0.72); band.translate(cx + 0.42, y + 2.55, cz + 0.4); G(band);
  const drape = box(-0.14, -1.2, -0.05, 0.14, 0, 0.05); drape.translate(cx - 0.42, y + 3.8, cz - 0.38); G(drape);
  // the arms: the right raised with the thunderbolt (a spindle with three prongs each end), the left bent forward on the sceptre
  const arm = (a, b, c, r) => { G(rod(a, b, r, 6)); G(rod(b, c, r * 0.85, 6)); G(ball(r * 1.1, b[0], b[1], b[2])); };
  arm([cx + 0.42, y + 3.8, cz], [cx + 0.95, y + 4.3, cz + 0.1], [cx + 1.2, y + 5.2, cz + 0.1], 0.13);
  G(lathe([[0.001, 0], [0.13, 0.05], [0.12, 0.3], [0.001, 0.32]], 6, null, cx + 1.2, y + 5.1, cz + 0.1));                                // the fist
  G(lathe([[0.001, -0.7], [0.09, -0.3], [0.09, 0.3], [0.001, 0.7]], 6, null, cx + 1.2, y + 5.45, cz + 0.1));                              // the thunderbolt's shaft
  for (const sd of [-1, 0, 1]) for (const end of [-1, 1]) G(rod([cx + 1.2, y + 5.45 + end * 0.65, cz + 0.1], [cx + 1.2 + sd * 0.18, y + 5.45 + end * 1.05, cz + 0.1 + sd * 0.12], 0.03, 3));
  arm([cx - 0.42, y + 3.8, cz], [cx - 0.78, y + 3.1, cz + 0.3], [cx - 0.95, y + 3.5, cz + 0.7], 0.12);
  G(rod([cx - 0.95, y + 0.4, cz + 0.72], [cx - 0.95, y + 6.0, cz + 0.72], 0.045, 5));                                                    // the sceptre
  G(lathe([[0.001, 0], [0.12, 0.05], [0.16, 0.2], [0.001, 0.3]], 6, null, cx - 0.95, y + 6.0, cz + 0.72));                                // its finial
  // the eagle at his right foot: a body, folded wings, the head turned up
  G(lathe([[0.001, 0], [0.2, 0.1], [0.24, 0.4], [0.12, 0.7], [0.001, 0.75]], 7, null, cx + 0.95, y - 0.02, cz + 0.2));
  G(lathe([[0.001, 0], [0.1, 0.03], [0.09, 0.2], [0.001, 0.22]], 6, null, cx + 0.95, y + 0.75, cz + 0.2));
}

/** The great doorway on the harbour face: the torus rolls up the jambs, the winged sun with its feathers on the lintel's frieze, the cavetto cornice rolling out over it. [inferred: the Egyptian temple door, as the Ptolemaic builders used it] */
export function doorway(bag, { dx, zf, y0 }) {
  for (const sd of [-1, 1]) {
    bag.add('limestone', rod([dx + sd * 3.85, y0 + 0.2, zf + 1.0], [dx + sd * 3.85, y0 + 7.0, zf + 1.0], 0.16, 7));
    bag.add('limestone', box(dx + sd * 3.4 - 0.3, y0, zf + 0.9, dx + sd * 3.4 + 0.3, y0 + 0.5, zf + 1.25));            // the foot of the jamb
  }
  bag.add('egyptian_blue', box(dx - 3.5, y0 + 6.3, zf + 1.1, dx + 3.5, y0 + 7.3, zf + 1.16));                         // the frieze's painted ground
  const disc = lathe([[0.001, 0], [0.45, 0], [0.45, 0.07], [0.001, 0.07]], 14, null, 0, 0, 0); disc.rotateX(Math.PI / 2); disc.translate(dx, y0 + 6.8, zf + 1.28);
  bag.add('gilt_bronze', disc);
  for (const sd of [-1, 1]) for (let r = 0; r < 4; r++) {                                                           // the wings: four tiers of feathers
    const x0 = dx + sd * 0.45, x1 = dx + sd * (3.2 - r * 0.28), y = y0 + 7.12 - r * 0.2;
    bag.add(r % 2 ? 'limestone' : 'gilt_bronze', box(Math.min(x0, x1), y, zf + 1.16, Math.max(x0, x1), y + 0.15, zf + 1.24 + r * 0.004));
  }
  for (let k = 0; k < 5; k++) {                                                                                       // the cavetto cornice
    const o = 0.18 * (k + 1) * (1 + 0.25 * Math.sin(k / 4 * Math.PI / 2)), y = y0 + 7.9 + k * 0.17;
    bag.add(k === 0 ? 'egyptian_blue' : 'limestone', box(dx - 4.0 - o, y, zf + 0.002 * k, dx + 4.0 + o, y + 0.17, zf + 1.3 + o));
  }
  bag.add('tura_limestone', box(dx - 4.9, y0 + 8.75, zf + 0.001, dx + 4.9, y0 + 9.0, zf + 2.4));                         // the corona
}
