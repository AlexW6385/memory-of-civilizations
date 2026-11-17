// The carved beings of the Haida poles, cut in the round: a being is a length of the log (radius r, from y0 up len, facing −z) with
// its eyes (a black ovoid dome, a red dome in it, a black pupil), brows, nose or beak, lips and teeth standing out of it, the wings
// or arms or fins carved as thick limbs, and U-form bands in relief. Generic beings of the coast, no crest of a family copied
// (docs/settlements/sgang-gwaay.md §4c, §5d). Materials: black tar_wood, red kokowai, plaster_white (teeth, incisors), the wood.
import { lathe, box } from '../../core/geom.js';
import { tube, ribbon, blob, setQ } from './carve.js';

const BLK = 'tar_wood', RED = 'kokowai', WHT = 'plaster_white';

/** The torso of the log and everything cut in it. lod 0 leaves the small relief out (poles seen from afar). */
export function being(add, type, y0, len, r, wood, rand, lod = 1) {
  setQ(lod >= 2 ? 1 : lod === 1 ? 0.8 : 0.65);
  const q = (a) => a * len, j = () => 1 + (rand() - 0.5) * 0.04;     // a hair of difference so that the pieces merge
  const S = (x) => -Math.sqrt(Math.max(r * r - x * x, r * r * 0.05));
  const P = (x, y, o = 0) => [x, y, S(x) - o];
  const Nm = (x) => { const z = S(x), l = Math.hypot(x, z); return [x / l, 0, z / l]; };
  const nS = lod ? 12 : 10;
  add(wood, lathe([[r, y0], [r * 1.03 * j(), y0 + len * 0.5], [r * 0.95, y0 + len], [0.001, y0 + len]], nS));
  // the ridge at the foot of every being, where one is set on the next
  add(BLK, lathe([[r * 1.04, y0 - 0.03], [r * 1.08, y0 + 0.02], [r * 1.04, y0 + 0.07]], nS));

  const ey = y0 + len * 0.62, ex = r * 0.44, rx = r * 0.3, ry = r * 0.22;
  // eyes: black squircle dome, red dome in it, black pupil
  for (const s of [-1, 1]) {
    const c = P(s * ex, ey, -0.01);
    add(BLK, blob(c, rx, ry, r * 0.1, { dome: true, n: 10, K: 2, e: 0.6 }));
    add(RED, blob(c, rx * 0.64, ry * 0.62, r * 0.14, { dome: true, n: 8, K: 2, e: 0.7 }));
    add(BLK, blob(c, rx * 0.26, ry * 0.3, r * 0.19, { dome: true, n: 6, K: 2 }));
    if (lod >= 1) {
      // the brow: a curved ridge over the eye, running into the root of the nose
      const br = [[s * r * 0.05, ey + ry * 1.45], [s * r * 0.22, ey + ry * 1.8], [s * r * 0.5, ey + ry * 1.95], [s * r * 0.78, ey + ry * 1.6], [s * r * 0.95, ey + ry * 0.9]];
      add(BLK, tube(br.map(([x, y]) => P(x, y, 0.0)), r * 0.05, r * 0.06, { n: 5, hint: br.map(([x]) => Nm(x)) }));
    }
  }
  // lips: a broad band round the mouth, a red lip with black edges
  const my = y0 + len * 0.3, mw = type === 'frog' ? 0.95 : type === 'whale' ? 0.85 : 0.62, lh = type === 'whale' ? 0.07 : 0.055;
  const lip = (yy, curv, m, w, h) => { const xs = [-1, -0.5, 0, 0.5, 1].map((u) => u * r * mw); return tube(xs.map((x, i) => P(x, yy + curv * (1 - Math.pow(x / (r * mw), 2)), 0.0)), w, h, { n: 6, hint: xs.map((x) => Nm(x)) }); };
  if (type !== 'whale' && type !== 'bird' && type !== 'beaver') {
    add(RED, lip(my + q(0.03), q(0.02), 0, len * lh, r * 0.07));
    add(RED, lip(my - q(0.05), -q(0.015), 0, len * lh * 1.2, r * 0.07));
    if (lod >= 2) {
      for (let k = -2; k <= 2; k++) {
        const x = k * r * 0.17, c = P(x, my - q(0.005), 0.0);
        add(WHT, box(x - 0.03, my - q(0.03), c[2] - r * 0.08, x + 0.035, my + q(0.01), c[2] + 0.03 * j()));
      }
    }
  }

  if (type === 'bird') {
    const yb = y0 + len * 0.47;
    // the hooked beak: a thick tapering tube running out and curving down to the point; the lower mandible short under it
    add(RED, tube([[0, yb + q(0.1), -r * 0.8], [0, yb + q(0.1), -r * 1.35], [0, yb + q(0.06), -r * 1.95], [0, yb - q(0.04), -r * 2.25], [0, yb - q(0.17), -r * 2.15]], [r * 0.3, r * 0.3, r * 0.26, r * 0.15, r * 0.03], [r * 0.2, r * 0.24, r * 0.23, r * 0.14, r * 0.03], { n: 8, hint: [0, 1, 0] }));
    add(BLK, tube([[0, yb - q(0.02), -r * 0.8], [0, yb - q(0.08), -r * 1.3], [0, yb - q(0.13), -r * 1.75]], [r * 0.26, r * 0.22, r * 0.1], [r * 0.12, r * 0.12, r * 0.07], { n: 6, hint: [0, 1, 0] }));
    for (const s of [-1, 1]) {
      add(BLK, blob([s * r * 0.13, yb + q(0.15), -r * 1.65], r * 0.05, r * 0.03, r * 0.06, { n: 5, K: 2 }));
      // the wings, folded down the sides: thick carved limbs, the ends curling out; feather ridges in red; a U-form at the shoulder
      const wp = [[0.98, 0.88, -0.28], [1.1, 0.56, -0.25], [1.08, 0.22, -0.22], [1.0, 0.06, -0.2]].map(([a, b, c]) => [s * r * a, y0 + len * b, r * c]);
      add(BLK, tube(wp, [r * 0.2, r * 0.34, r * 0.32, r * 0.18], [r * 0.12, r * 0.13, r * 0.12, r * 0.08], { n: 6, hint: [s * 0.5, 0, -0.85] }));
      add(RED, tube(wp.map(([x, y, z]) => [x + s * r * 0.0, y, z - r * 0.1]), r * 0.06, r * 0.05, { n: 5, hint: [0, 0, -1] }));
      if (lod >= 2) for (let k = 0; k < 4; k++) {
        const yy = y0 + len * (0.74 - k * 0.14), x0 = s * r * 1.02;
        add(RED, tube([[x0, yy, -r * 0.3], [x0 + s * r * 0.24, yy - q(0.045), -r * 0.34], [x0 + s * r * 0.46, yy - q(0.1), -r * 0.34]], r * 0.04, r * 0.04, { n: 5, hint: [0, 0, -1] }));
      }
    }
    if (lod >= 2) uform(add, r, S, y0 + len * 0.16, 0.5, q(0.12), 0.05);
  } else if (type === 'bear') {
    // the muzzle runs forward under the eyes, the black nose at its end; round ears; the arms folded to the chest, the paws with claws
    const yb = y0 + len * 0.47;
    add(wood, tube([[0, yb + q(0.03), -r * 0.8], [0, yb, -r * 1.35], [0, yb - q(0.02), -r * 1.75]], [r * 0.42, r * 0.38, r * 0.3], [r * 0.3, r * 0.27, r * 0.21], { n: 8, hint: [0, 1, 0] }));
    add(BLK, blob([0, yb + q(0.02), -r * 1.78], r * 0.2, r * 0.13, r * 0.14, { n: 8, K: 3 }));
    for (const s of [-1, 1]) {
      add(wood, blob([s * r * 0.68, y0 + len * 0.95, -r * 0.5], r * 0.22, r * 0.22, r * 0.14, { dome: true, n: 8, K: 2 }));
      add(BLK, blob([s * r * 0.68, y0 + len * 0.95, -r * 0.55], r * 0.12, r * 0.12, r * 0.1, { dome: true, n: 6, K: 2 }));
      const arm = [[1.0, 0.34, -0.25], [1.12, 0.2, -0.5], [0.8, 0.1, -0.95]].map(([a, b, c]) => [s * r * a, y0 + len * b, r * c]);
      add(BLK, tube(arm, [r * 0.2, r * 0.19, r * 0.17], [r * 0.2, r * 0.19, r * 0.17], { n: 6 }));
      add(wood, blob([s * r * 0.74, y0 + len * 0.1, -r * 1.02], r * 0.22, r * 0.17, r * 0.15, { n: 7, K: 3 }));
      if (lod >= 2) for (let k = -1; k <= 1; k++) add(WHT, tube([[s * r * 0.74 + k * r * 0.1, y0 + len * 0.1, -r * 1.12], [s * r * 0.74 + k * r * 0.12, y0 + len * 0.04, -r * 1.22]], [r * 0.03, 0.005], [r * 0.03, 0.005], { n: 4 }));
    }
    if (lod >= 2) uform(add, r, S, y0 + len * 0.15, 0.55, q(0.1), 0.05);
  } else if (type === 'whale') {
    // the blunt head with its wide down-curved mouth full of teeth, the blowhole, the tall fin, the flippers, the notched tail below
    const yy = y0 + len * 0.3;
    for (const [dy, m, h] of [[0.06, RED, 0.06], [-0.07, BLK, 0.05]]) {
      const xs = [-1, -0.6, -0.2, 0.2, 0.6, 1].map((u) => u * r * 0.82);
      add(m, tube(xs.map((x) => P(x, yy + q(dy) - q(0.07) * Math.pow(x / (r * 0.82), 2), 0.0)), len * h, r * 0.08, { n: 6, hint: xs.map((x) => Nm(x)) }));
    }
    if (lod >= 2) for (let k = -4; k <= 4; k++) { const x = k * r * 0.16; add(WHT, box(x - 0.03, yy - q(0.04) - q(0.05) * Math.pow(x / (r * 0.82), 2), S(x) - r * 0.1, x + 0.03, yy + q(0.05), S(x) + 0.02)); }
    add(BLK, blob([0, y0 + len * 0.94, S(0) * 0.3], r * 0.13, r * 0.05, r * 0.08, { n: 6, K: 3 }));
    add(BLK, tube([[0, y0 + len * 0.86, -r * 0.05], [0, y0 + len * 1.08, -r * 0.1], [0, y0 + len * 1.38, 0.0]], [0.001, r * 0.03, r * 0.01], [r * 0.2, r * 0.11, 0.02], { n: 4, hint: [0, 0, -1] }));
    for (const s of [-1, 1]) {
      const fl = [[1.0, 0.55, -0.3], [1.4, 0.38, -0.3], [1.7, 0.18, -0.3]].map(([a, b, c]) => [s * r * a, y0 + len * b, r * c]);
      add(BLK, tube(fl, [r * 0.34, r * 0.3, r * 0.1], [r * 0.09, r * 0.08, r * 0.05], { n: 6, hint: [0, 0, -1] }));
    }
    add(RED, blob([0, y0 + len * 0.15, S(0)], r * 0.3, r * 0.14, r * 0.1, { dome: true, n: 8, K: 2 }));
    if (lod >= 2) uform(add, r, S, y0 + len * 0.14, 0.45, q(0.1), 0.05);
  } else if (type === 'frog') {
    // the very wide mouth, the eyes standing up on the head, the hands with spread fingers
    for (const s of [-1, 1]) {
      add(wood, blob([s * ex, ey + ry * 1.6, S(s * ex) * 0.88], rx * 0.85, ry * 0.9, r * 0.22, { n: 8, K: 3 }));
      add(BLK, blob([s * ex, ey + ry * 1.6, S(s * ex) * 0.88 - r * 0.2], rx * 0.45, ry * 0.5, r * 0.07, { dome: true, n: 6, K: 2 }));
      for (let k = 0; k < 3; k++) {
        const x0 = s * (r * 0.44 + k * r * 0.17), a = s * k * 0.2;
        add(BLK, tube([[x0, y0 + len * 0.2, -r * 0.9], [x0 + a * r * 0.2, y0 + len * 0.14, -r * 1.0], [x0 + a * r * 0.5, y0 + len * 0.07, -r * 1.02]], [r * 0.045, r * 0.035, r * 0.025], [r * 0.05, r * 0.04, r * 0.03], { n: 5 }));
      }
      add(BLK, blob([s * r * 0.9, y0 + len * 0.3, -r * 0.5], r * 0.12, r * 0.12, r * 0.1, { n: 6, K: 2 }));
    }
    add(wood, tube([[0, ey - ry * 0.4, S(0) - 0.02], [0, ey - ry * 0.6, S(0) - r * 0.3]], [r * 0.1, r * 0.06], [r * 0.08, r * 0.06], { n: 6, hint: [0, 1, 0] }));
    if (lod >= 2) uform(add, r, S, y0 + len * 0.1, 0.4, q(0.08), 0.05);
  } else if (type === 'beaver') {
    // the broad blunt nose, the two great incisors, the stick gripped in the hands, the scaled tail hanging down the chest
    add(wood, tube([[0, y0 + len * 0.5, -r * 0.8], [0, y0 + len * 0.46, -r * 1.3]], [r * 0.4, r * 0.33], [r * 0.26, r * 0.23], { n: 8, hint: [0, 1, 0] }));
    add(BLK, blob([0, y0 + len * 0.5, -r * 1.33], r * 0.16, r * 0.1, r * 0.1, { n: 6, K: 3 }));
    for (const s of [-1, 1]) add(WHT, tube([[s * r * 0.09, y0 + len * 0.39, -r * 1.25], [s * r * 0.09, y0 + len * 0.26, -r * 1.3]], r * 0.09, r * 0.05, { n: 5, hint: [0, 0, -1] }));
    add(BLK, tube([[0, y0 + len * 0.17, S(0) - 0.01], [0, y0 + len * 0.1, S(0) - r * 0.1], [0, y0 + len * 0.02, S(0) - 0.03]], [r * 0.3, r * 0.34, r * 0.3], [r * 0.07, r * 0.08, r * 0.05], { n: 6, hint: [0, 0, -1] }));
    if (lod >= 2) for (let k = 0; k < 4; k++) add(RED, tube([[-r * 0.3, y0 + len * (0.04 + k * 0.035), S(0) - r * 0.12], [r * 0.3, y0 + len * (0.04 + k * 0.035), S(0) - r * 0.12]], r * 0.012, r * 0.02, { n: 4, hint: [0, 0, -1] }));
    add('log_pine', tube([[-r * 1.0, y0 + len * 0.22, -r * 1.0], [r * 1.0, y0 + len * 0.22, -r * 1.0]], r * 0.07, r * 0.07, { n: 6 }));
    for (const s of [-1, 1]) add(BLK, blob([s * r * 0.55, y0 + len * 0.22, -r * 1.02], r * 0.14, r * 0.12, r * 0.12, { n: 6, K: 3 }));
  } else {
    // the human face: a long nose standing out, ears, the arms folded to the chest with the hands
    add(wood, tube([[0, y0 + len * 0.7, S(0) * 0.9], [0, y0 + len * 0.52, -r * 1.15], [0, y0 + len * 0.45, -r * 1.3]], [r * 0.07, r * 0.12, r * 0.15], [r * 0.08, r * 0.14, r * 0.15], { n: 6, hint: [0, 1, 0] }));
    for (const s of [-1, 1]) {
      add(wood, blob([s * r * 0.98, ey, -r * 0.2], r * 0.07, r * 0.2, r * 0.14, { n: 6, K: 3, dir: 1 }));
      const arm = [[1.0, 0.46, -0.3], [1.08, 0.28, -0.7], [0.5, 0.18, -1.0]].map(([a, b, c]) => [s * r * a, y0 + len * b, r * c]);
      add(BLK, tube(arm, [r * 0.17, r * 0.16, r * 0.14], [r * 0.16, r * 0.15, r * 0.14], { n: 6 }));
      add(wood, blob([s * r * 0.36, y0 + len * 0.17, -r * 1.02], r * 0.2, r * 0.15, r * 0.12, { n: 6, K: 3 }));
    }
    if (type === 'watchman') {
      // the tall hat of stacked rings, each ring a rolled band
      for (let k = 0; k < 5; k++) add(k % 2 ? BLK : 'planks_grey', lathe([[r * (0.5 - k * 0.04), 0], [r * (0.64 - k * 0.04), 0.05], [r * (0.66 - k * 0.04), 0.17], [r * (0.5 - k * 0.04), 0.3]], 12, null, 0, y0 + len + k * 0.28, 0));
    }
    if (lod >= 2) uform(add, r, S, y0 + len * 0.1, 0.45, q(0.08), 0.05);
  }
  // weathering: dark cracks down the back and sides of the log, a collar of moss at the foot of some beings
  const rr = rand;
  for (let k = 0; k < 3; k++) {
    const a = 1.0 + rr() * 1.7, sg = rr() < 0.5 ? -1 : 1, x = Math.sin(a) * r * 0.98 * sg, z = -Math.cos(a) * r * 0.98, ya = y0 + len * (0.05 + rr() * 0.4);
    add('wood_dark', box(x - 0.012, ya, z - 0.012, x + 0.012, ya + len * (0.25 + rr() * 0.3), z + 0.012));
  }
  if (rr() < 0.35) add('sod', lathe([[r * 1.07, y0], [r * 1.07, y0 + 0.1], [r * 0.99, y0 + 0.14], [r * 0.99, y0]], 12));
}

/** A U-form in relief on the log: black band with the red field in it, under the face. S is the surface depth function. */
function uform(add, r, S, y, wid, h, th) {
  const pts = [], nrm = [], pin = [], nin = [];
  for (let k = 0; k <= 6; k++) {
    const t = k / 3 - 1, x = r * wid * 1.2 * t * 0.85, yy = y + h * t * t * 1.2;
    pts.push([x, yy, S(x)]); const l = Math.hypot(x, S(x)); nrm.push([x / l, 0, S(x) / l]);
    const x2 = x * 0.62, y2 = y + h * t * t * 0.9 - h * 0.1; pin.push([x2, y2, S(x2) - 0.012]); nin.push([x2 / r, 0, S(x2) / r]);
  }
  add('tar_wood', ribbon(pts, nrm, r * 0.12, r * 0.045));
  add('kokowai', ribbon(pin, nin, r * 0.09, r * 0.05));
}
