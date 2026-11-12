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
/** A Triton (a man's body with the coiled fish tail, blowing a conch) at (x, y, z) looking along yaw, s the scale. */
export function triton(bag, x, y, z, yaw, s = 1.5) {
  const P = (g) => { g.rotateY(yaw); g.translate(x, y, z); return g; };
  bag.add('limestone', P(box(-0.6 * s, 0, -0.6 * s, 0.6 * s, 0.35 * s, 0.6 * s)));                              // the plinth
  for (let k = 0; k < 4; k++) {                                                                                  // the tail's coils, rising and thinning
    const r = 0.42 - 0.07 * k;
    bag.add('bronze', P(lathe([[0.001, 0], [r * s, 0.05 * s], [r * s * 1.1, 0.25 * s], [r * s, 0.45 * s], [0.001, 0.5 * s]], 8, null, (k % 2 ? 0.12 : -0.12) * s, (0.35 + k * 0.42) * s, 0)));
  }
  bag.add('bronze', P(lathe([[0.001, 0], [0.34 * s, 0.02 * s], [0.38 * s, 0.5 * s], [0.3 * s, 0.9 * s], [0.18 * s, 1.0 * s], [0.001, 1.02 * s]], 8, null, 0, 2.0 * s, 0)));      // the chest and shoulders
  bag.add('bronze', P(lathe([[0.001, 0], [0.13 * s, 0.02 * s], [0.16 * s, 0.2 * s], [0.1 * s, 0.34 * s], [0.001, 0.36 * s]], 7, null, 0, 3.0 * s, 0)));                          // the head
  bag.add('bronze', P(rod([0.3 * s, 2.8 * s, 0], [0.4 * s, 3.1 * s, -0.5 * s], 0.06 * s, 5)));                   // the arm raised
  bag.add('gilt_bronze', P(lathe([[0.001, 0], [0.12 * s, 0.05 * s], [0.04 * s, 0.7 * s], [0.001, 0.72 * s]], 6, null, 0.4 * s, 3.1 * s, -0.5 * s)));        // the conch
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
/** Zeus Soter on the dome (6 m on a drum): the long himation, the bare chest, the bearded head, the right arm raised with the thunderbolt, the left holding the sceptre. */
export function zeus(bag, cx, ys, cz) {
  bag.add('gilt_bronze', lathe([[0.9, 0], [0.9, 0.5], [0.001, 0.5]], 10, null, cx, ys, cz));
  const y = ys + 0.5;
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.95, 0.04], [0.85, 0.8], [0.62, 2.1], [0.6, 2.9], [0.5, 3.3], [0.36, 3.9], [0.2, 4.15], [0.001, 4.2]], 10, null, cx, y, cz));      // robe to the shoulders
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.16, 0.05], [0.2, 0.24], [0.14, 0.45], [0.001, 0.5]], 8, null, cx, y + 4.15, cz));                                              // head
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.17, 0.0], [0.05, -0.55], [0.001, -0.6]], 6, null, cx, y + 4.3, cz + 0.13));                                                    // the beard
  bag.add('gilt_bronze', rod([cx + 0.4, y + 3.8, cz], [cx + 1.1, y + 5.1, cz], 0.12, 5));                                                                                     // the raised arm
  bag.add('gilt_bronze', rod([cx + 1.1, y + 5.1, cz], [cx + 1.15, y + 5.9, cz], 0.07, 4));                                                                                    // the thunderbolt
  for (const dz of [-0.2, 0, 0.2]) bag.add('gilt_bronze', rod([cx + 1.15, y + 5.55, cz + dz], [cx + 1.15, y + 6.2, cz + dz * 2], 0.025, 3));
  bag.add('gilt_bronze', rod([cx - 0.5, y + 3.2, cz + 0.2], [cx - 0.9, y + 3.5, cz + 0.5], 0.1, 5));                                                                          // the left arm
  bag.add('bronze', rod([cx - 0.9, y - 0.1, cz + 0.5], [cx - 0.9, y + 5.4, cz + 0.5], 0.04, 4));                                                                              // the sceptre
}
