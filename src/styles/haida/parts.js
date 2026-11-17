// Carved parts of the Haida style beyond the beings: the frontal pole's doorway (the mouth of the lowest being), the mortuary
// chest with its carved front board, the formline paintings on the house fronts and gables, the canoe's carved prow
// (docs/settlements/sgang-gwaay.md §5d). Generic forms; no crest of a family is copied.
import { box, lathe } from '../../core/geom.js';
import { tube, ribbon, blob, yprism, setQ } from './carve.js';
import { prism, ellipse } from './util.js';

const BLK = 'tar_wood', RED = 'kokowai', WHT = 'plaster_white';
const FRONT = [0, 0, -1];

/** A ribbon on the plane z = zf: points [[x, y], …]. */
const flat = (pts, zf, w, h, closed = false) => ribbon(pts.map(([x, y]) => [x, y, zf]), FRONT, w, h, { closed });
/** An ovoid ring (a squircle) as a ribbon. */
const ring = (cx, cy, rx, ry, k = 14) => Array.from({ length: k }, (_, i) => { const a = i / k * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); return [cx + Math.sign(c) * Math.pow(Math.abs(c), 0.7) * rx, cy + Math.sign(s) * Math.pow(Math.abs(s), 0.7) * ry]; });
/** The formline eye on a plane: black ring, black dome, red dome, black pupil, and a brow over it. */
function eye(add, cx, cy, rx, ry, zf, s = 1) {
  add(BLK, flat(ring(cx, cy, rx, ry), zf, rx * 0.22, 0.04, true));
  add(BLK, blob([cx, cy, zf + 0.01], rx * 0.82, ry * 0.82, 0.05, { dome: true, n: 10, K: 2, e: 0.65 }));
  add(RED, blob([cx, cy, zf + 0.01], rx * 0.56, ry * 0.56, 0.08, { dome: true, n: 8, K: 2, e: 0.75 }));
  add(BLK, blob([cx, cy, zf + 0.01], rx * 0.22, ry * 0.24, 0.11, { dome: true, n: 6, K: 2 }));
  add(BLK, flat([[cx - s * rx * 1.15, cy + ry * 1.15], [cx - s * rx * 0.2, cy + ry * 1.55], [cx + s * rx * 0.9, cy + ry * 1.35], [cx + s * rx * 1.3, cy + ry * 0.8]], zf, rx * 0.16, 0.045));
}
/** A U-form on a plane: black band, the red one inside it. s flips it (opening up or down). */
function uf(add, cx, cy, w, h, zf, s = 1) {
  const p = (k) => Array.from({ length: 7 }, (_, i) => { const t = i / 3 - 1; return [cx + t * w * k, cy + s * h * k * (t * t - 0.5)]; });
  add(BLK, flat(p(1), zf, w * 0.13, 0.04)); add(RED, flat(p(0.62), zf, w * 0.1, 0.045));
}

/**
 * The doorway of the frontal pole, in the pole's frame (x across, y up from the terrace, z toward the house, the front at −z; the pole 1.6 m
 * through): the pillars with rounded corners, the lintel arched over the door, the arch's rim a red lip with teeth, the eyes, brows and nose of the
 * lowest being above it, the cheeks' eyes on the pillars. Returns the top height of the base (where the carved beings start).
 */
export function doorway(add, wood, dw, pw, lint, top, rand, lod = 2) {
  setQ(lod >= 2 ? 1 : 0.8);
  const zF = -0.8;
  for (const s of [-1, 1]) {
    const inn = s * dw, out = s * pw, c = 0.22;
    add(wood, yprism([[inn, zF], [out - s * c, zF], [out, zF + c], [out, 0.8 - c], [out - s * c, 0.8], [inn, 0.8]], 0, 1.9));
  }
  // the lintel: slices over the arched opening
  const arch = (x) => (Math.abs(x) < dw ? 1.9 + 0.32 * Math.sqrt(1 - Math.pow(x / dw, 2)) : 1.9);
  const xs = lod >= 2 ? [-pw, -dw, -dw * 0.75, -dw * 0.4, 0, dw * 0.4, dw * 0.75, dw, pw] : [-pw, -dw, -dw * 0.5, 0, dw * 0.5, dw, pw];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1];
    add(wood, prism([[a, arch(a)], [b, arch(b)], [b, top], [a, top]], -0.8 + (i === 0 || i === xs.length - 2 ? 0.12 : 0), 0.8 - (i === 0 || i === xs.length - 2 ? 0.12 : 0)));
  }
  // the lip round the opening and the teeth
  const rim = []; for (let i = 0; i <= 10; i++) { const x = -dw + 2 * dw * i / 10; rim.push([x, arch(x) + 0.02]); }
  add(RED, flat([[-dw - 0.03, 0.15], [-dw - 0.03, 1.9], ...rim.slice(1, -1), [dw + 0.03, 1.9], [dw + 0.03, 0.15]], zF - 0.01, 0.2, 0.07));
  add(BLK, flat([[-dw - 0.2, 0.15], [-dw - 0.2, 1.95], [-dw * 0.6, 2.35], [0, 2.4], [dw * 0.6, 2.35], [dw + 0.2, 1.95], [dw + 0.2, 0.15]], zF - 0.01, 0.07, 0.05));
  for (let k = -3; k <= 3; k += lod >= 2 ? 1 : 2) { const x = k * dw * 0.27; add(WHT, box(x - 0.04, arch(x) - 0.17, zF - 0.1, x + 0.04, arch(x), zF + 0.0)); }
  // the face above: nose, eyes with their brows, cheek U-forms
  add(wood, tube([[0, top - 0.05, zF + 0.02], [0, top - 0.3, zF - 0.28], [0, 2.5, zF - 0.34]], [0.1, 0.14, 0.17], [0.12, 0.18, 0.19], { n: 6, hint: [0, 1, 0] }));
  for (const s of [-1, 1]) {
    eye(add, s * 0.5, 2.58, 0.24, 0.17, zF - 0.02, s);
    for (const [y, w, h] of [[1.45, 0.14, 0.23], [0.62, 0.12, 0.2]]) { const cx = s * 0.65; add(BLK, blob([cx, y, zF - 0.01], w, h, 0.07, { dome: true, n: 8, K: 2, e: 0.65 })); add(RED, blob([cx, y, zF - 0.01], w * 0.6, h * 0.6, 0.1, { dome: true, n: 6, K: 2 })); }
    uf(add, s * 0.65, 1.0, 0.1, 0.35, zF - 0.015, 1);
  }
  void rand;
}

/**
 * A mortuary chest on the head of a pole: two bearers across the pole's head, the box of boards, its front a carved board in a frame
 * (a face: eyes, brows, nose, lips and teeth, U-forms at the corners), a gabled lid with its ridge log, the lashings. r the pole's radius.
 */
export function chest(add, y1, r, wood, rand, lod = 1) {
  setQ(lod >= 2 ? 1 : 0.75);
  const W = r * 3.9, D = r * 3.1, H = r * 2.5, x1 = W / 2, z1 = D / 2, yb = y1 + 0.2, yt = yb + H, zf = -z1 - 0.045;
  for (const dz of [-0.55, 0.55]) add(wood, tube([[-x1 - r * 0.5, y1 + 0.1, dz * r * 1.6], [x1 + r * 0.5, y1 + 0.1, dz * r * 1.6]], [r * 0.24, r * 0.24], [r * 0.24, r * 0.24], { n: 6 }));
  add(BLK, blob([-x1 - r * 0.5, y1 + 0.1, -r * 0.88], r * 0.2, r * 0.2, r * 0.12, { dome: true, dir: 1, n: 6, K: 1 }).rotateY(0));
  add(wood, box(-x1, y1 + 0.18, -z1, x1, yb, z1));
  const j = () => 1 + (rand() - 0.5) * 0.02;
  // the sides and the back: three boards each, a little proud of one another
  for (let k = 0; k < 3; k++) {
    const a = yb + H * k / 3, b = a + H / 3 - 0.01, o = (k % 2) * 0.012;
    add('cedar', box(-x1 - o, a, -z1 + 0.02, -x1 + 0.05, b, z1)); add('cedar', box(x1 - 0.05, a, -z1 + 0.02, x1 + o, b, z1));
    add('cedar', box(-x1, a, z1 - 0.05, x1, b, z1 + o * j()));
  }
  // the carved front: a frame of four black boards round a board with the face in relief
  const fh = H * 0.95, fy = yb + H * 0.5;
  add('cedar', box(-x1 * 0.94, fy - fh / 2, -z1 - 0.03, x1 * 0.94, fy + fh / 2, -z1 + 0.02));
  for (const [a, b, c, d] of [[-x1, fy - fh / 2 - 0.05, x1, fy - fh / 2 + 0.02], [-x1, fy + fh / 2 - 0.02, x1, fy + fh / 2 + 0.05], [-x1, fy - fh / 2, -x1 * 0.94, fy + fh / 2], [x1 * 0.94, fy - fh / 2, x1, fy + fh / 2]]) add(BLK, box(a, b, -z1 - 0.06, c, d, -z1 + 0.02));
  eye(add, -x1 * 0.46, fy + fh * 0.16, W * 0.12, H * 0.13, zf, -1); eye(add, x1 * 0.46, fy + fh * 0.16, W * 0.12, H * 0.13, zf, 1);
  add(wood, tube([[0, fy + fh * 0.32, zf + 0.02], [0, fy + fh * 0.1, zf - 0.07], [0, fy - fh * 0.05, zf - 0.1]], [r * 0.12, r * 0.18, r * 0.2], [r * 0.1, r * 0.16, r * 0.17], { n: 6, hint: [0, 1, 0] }));
  add(RED, flat([[-x1 * 0.55, fy - fh * 0.22], [-x1 * 0.25, fy - fh * 0.27], [0, fy - fh * 0.28], [x1 * 0.25, fy - fh * 0.27], [x1 * 0.55, fy - fh * 0.22]], zf, H * 0.13, 0.05));
  if (lod >= 2) {
    for (let k = -3; k <= 3; k++) add(WHT, box(k * x1 * 0.14 - 0.03, fy - fh * 0.27 - H * 0.05, zf - 0.04, k * x1 * 0.14 + 0.03, fy - fh * 0.27 + H * 0.05, zf + 0.01));
    for (const s of [-1, 1]) { uf(add, s * x1 * 0.62, fy - fh * 0.38, x1 * 0.2, H * 0.1, zf, 1); uf(add, s * x1 * 0.68, fy + fh * 0.4, x1 * 0.22, H * 0.1, zf, -1); }
  }
  // the lid: two slabs over the walls, overhanging at the front and back, the ridge log, boards in the gables
  const ov = r * 0.45, yR = yt + r * 1.0, e = x1 + ov;
  for (const s of [-1, 1]) add('planks_grey', prism([[s * 0.0, yR], [s * e, yt - 0.02], [s * e, yt - 0.1], [s * 0.0, yR - 0.1]], -z1 - ov, z1 + ov));
  add('log_pine', tube([[0, yR + 0.03, -z1 - ov - 0.05], [0, yR + 0.03, z1 + ov + 0.05]], [0.07, 0.07], [0.07, 0.07], { n: 6 }));
  for (const sz of [-1, 1]) add('timber', prism([[-x1, yt], [x1, yt], [0, yR - 0.1]], sz > 0 ? z1 - 0.05 : -z1, sz > 0 ? z1 : -z1 + 0.05));
  for (const dy of [0.25, 0.9]) add('rope_fibre', box(-x1 - 0.03, yb + H * dy / 1.2, -z1 - 0.05, x1 + 0.03, yb + H * dy / 1.2 + 0.05, z1 + 0.05));
  add('sod', box(-x1 * 0.6, yR - 0.04, -z1 * 0.5, x1 * 0.1, yR + 0.04, z1 * 0.7));
}

/**
 * The painted front of a house: formline paintings in relief on the plane of the front wall, in a design of the seed: either side of the door the wall
 * (eyes, brows, U-forms and flowing bands), and on the gable the great eye with the bands that run up the slopes. kind 0..2; `rich` for the landmark.
 */
export function paintFront(add, o, kind, fr, rich) {
  setQ(rich ? 0.85 : 0.65);
  const { hw, hd, g, dw, pw, yAt, yTop, ridgeY } = o, zf = -hd - 0.05, yc = g + 1.55, ux = Math.min(hw - 1.9, 2.5 + fr() * 1.0);
  for (const s of [-1, 1]) {
    const cx = s * ux;
    if (kind === 0) {
      eye(add, cx, yc, 0.62 + fr() * 0.06, 0.42, zf, s);
      uf(add, cx, yc - 0.85, 0.5, 0.35, zf, 1);
      add(BLK, flat([[s * (pw + 0.35), yc + 0.2], [s * (ux - 0.9), yc + 0.45], [s * (ux - 1.2), yc - 0.4], [s * (pw + 0.55), yc - 0.7]], zf, 0.1, 0.04)); add(RED, flat([[s * (pw + 0.35), yc + 0.2], [s * (ux - 0.9), yc + 0.45], [s * (ux - 1.2), yc - 0.4], [s * (pw + 0.55), yc - 0.7]], zf, 0.05, 0.05));
      add(BLK, flat([[s * (ux + 0.9), yc - 0.3], [s * (ux + 1.4), yc + 0.1], [s * (ux + 1.7), yc + 0.7]], zf, 0.1, 0.04));
    } else if (kind === 1) {
      add(RED, prism([[cx - 0.9, yc - 0.6], [cx + 0.9, yc - 0.6], [cx + 0.9, yc + 0.6], [cx - 0.9, yc + 0.6]], zf - 0.025, zf + 0.04));
      for (const [a, b] of [[-0.9, 1], [0.9, 1]]) add(BLK, flat([[cx + a, yc - 0.6], [cx + a, yc + 0.6]], zf - 0.03, 0.07, 0.04), void b);
      add(BLK, flat([[cx - 0.9, yc + 0.6], [cx + 0.9, yc + 0.6]], zf - 0.03, 0.07, 0.04)); add(BLK, flat([[cx - 0.9, yc - 0.6], [cx + 0.9, yc - 0.6]], zf - 0.03, 0.07, 0.04));
      eye(add, cx, yc + 0.05, 0.45, 0.3, zf - 0.03, s);
      uf(add, cx, yc - 0.42, 0.3, 0.18, zf - 0.03, 1);
    } else {
      const sp = [[s * (pw + 0.3), yc + 0.9], [s * (pw + 1.3), yc + 0.35], [s * (ux + 0.3), yc + 0.55], [s * (ux + 1.3), yc - 0.1], [s * (ux + 0.6), yc - 0.8]];
      add(BLK, flat(sp, zf, 0.24, 0.045)); add(RED, flat(sp, zf, 0.1, 0.055));
      eye(add, cx, yc - 0.1, 0.38, 0.27, zf, s);
      uf(add, s * (pw + 0.7), yc - 0.55, 0.35, 0.25, zf, 1);
    }
  }
  // the gable: the great eye and the bands running up the slopes
  const cy = (yTop + ridgeY) / 2 + 0.15;
  eye(add, 0, cy, rich ? 0.8 : 0.6, rich ? 0.52 : 0.4, zf, 1);
  for (const s of [-1, 1]) {
    const bp = [0.55, 0.95, 1.4, 2.0, 2.6].map((u, i) => [s * (hw - 0.35 - (hw - 1.2) * (u - 0.55) / 2.05), yAt(hw - 0.35 - (hw - 1.2) * (u - 0.55) / 2.05) - 0.62 - (i % 2) * 0.03]);
    void bp;
    const band = []; for (let i = 0; i <= 8; i++) { const u = (hw - 0.4) - ((hw - 1.8) * i / 8); band.push([s * u, yAt(u) - 0.55]); }
    add(BLK, flat(band, zf, 0.2, 0.04)); add(RED, flat(band, zf, 0.08, 0.05));
    if (rich) uf(add, s * 1.7, cy - 0.15, 0.55, 0.3, zf, s);
  }
}

/** The ends of the beams that run through the front gable: round logs with a black end and a red heart, a hand's breadth proud of the eave's shadow. */
export function beamEnds(add, hw, hd, yAt, vF) {
  setQ(0.8);
  for (const u of [-hw * 0.82, -hw * 0.42, 0, hw * 0.42, hw * 0.82]) {
    const y = yAt(Math.abs(u)) - 0.72;
    add('log_pine', tube([[u, y, -hd + 0.2], [u, y, vF + 0.28]], [0.16, 0.16], [0.16, 0.16], { n: 7 }));
    add(BLK, lathe([[0.17, 0], [0.19, 0.05], [0.001, 0.07]], 8, null, 0, 0, 0).rotateX(-Math.PI / 2).translate(u, y, vF + 0.28));
    add(RED, ellipse(u, y, 0.08, 0.08, vF + 0.2, vF + 0.31, 8));
  }
}

/** The canoe's carved prow: a stem rising in a curve from the sheer, ending in a head (snout, eyes, ears, lips), its cheeks painted with eyes. */
export function prow(add, zb, yb, Dp, rand) {
  setQ(0.8);
  const tz = zb - 0.95, ty = yb + 0.22;
  add(BLK, tube([[0, yb - 0.3, zb + 0.8], [0, yb - 0.12, zb + 0.1], [0, yb + 0.02, zb - 0.5], [0, ty - 0.02, tz + 0.05]], [0.15, 0.15, 0.14, 0.14], [0.17, 0.2, 0.2, 0.18], { n: 6, hint: [0, 1, 0.2] }));
  add(BLK, blob([0, ty + 0.03, tz - 0.08], 0.2, 0.19, 0.26, { n: 8, K: 3 }));
  add(RED, tube([[0, ty + 0.0, tz - 0.2], [0, ty - 0.03, tz - 0.45], [0, ty - 0.07, tz - 0.66]], [0.12, 0.11, 0.09], [0.09, 0.08, 0.07], { n: 6, hint: [0, 1, 0] }));
  add(BLK, blob([0, ty - 0.05, tz - 0.68], 0.07, 0.05, 0.06, { n: 5, K: 2 }));
  for (const s of [-1, 1]) {
    add(BLK, blob([s * 0.13, ty + 0.2, tz - 0.02], 0.05, 0.08, 0.04, { n: 5, K: 2, dir: 1 }));
    for (const [rx, ry, d, m] of [[0.07, 0.06, 0.03, BLK], [0.045, 0.04, 0.05, RED], [0.02, 0.02, 0.07, BLK]]) add(m, blob([0, 0, 0], rx, ry, d, { dome: true, n: 7, K: 2 }).rotateY(s > 0 ? -Math.PI / 2 : Math.PI / 2).translate(s * 0.15, ty + 0.07, tz - 0.2));
    // the cheek of the stem: the formline eye, a red U-form under it
    const cz = zb + 0.0, cy = yb - 0.07;
    for (const [rx, ry, d, m] of [[0.2, 0.13, 0.03, BLK], [0.13, 0.085, 0.05, RED], [0.05, 0.05, 0.075, BLK]]) add(m, blob([0, 0, 0], rx, ry, d, { dome: true, n: 9, K: 2, e: 0.7 }).rotateY(s > 0 ? -Math.PI / 2 : Math.PI / 2).translate(s * 0.14, cy, cz));
  }
  void rand;
}
