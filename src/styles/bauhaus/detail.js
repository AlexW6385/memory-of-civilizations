// The Bauhaus building seen close (docs/settlements/bauhaus-dessau.md §14): the curtain wall's steel profiles and opening lights, the columns behind it,
// the vertical BAUHAUS lettering, the Prellerhaus' balconies with their tube railings, the entrance. Everything is merged per material by the bag.
import { fromTriangles } from '../../core/geom.js';
import { slab } from './kit.js';
import { onBuildStart } from '../../core/build-reset.js';

// a millimetre of difference between repeated shapes, so that they are merged into one mesh per material and not instanced (one more draw each)
let J = 0;
onBuildStart(() => { J = 0; });
const jit = () => ((J = (J + 37) % 101) / 101) * 0.002;

/** The workshop wing's curtain wall on x = x0 (west face), z0..z1, floors F = [F0, F1, F2, FR]: T-profile mullions every 1.25 m with a flat outer cap, transoms with a drip flange,
 *  pivoting upper lights (closed frames, a few swung open on a top hinge), and the square columns standing 1.4 m behind the glass (docs §2). */
export function curtainWall(sk, x0, z0, z1, F) {
  const FR = F[3], W = 1.25;
  // mullions: the web runs through the plane of the glass, the cap shows on the outside
  for (let u = z0 + 0.05, k = 0; u <= z1 + 0.01; u += W, k++) {
    const j = (k % 3) * 0.001;
    sk.b('iron', x0 - 0.09, F[0], u - 0.014 - j, x0 + 0.03, FR, u + 0.014 + j);
    sk.b('iron', x0 - 0.115, F[0], u - 0.034, x0 - 0.09, FR, u + 0.034);
  }
  // transoms at every floor and sill, each with an outer flange (the "double rebated profile iron")
  for (const y of [F[0], F[1] - 0.6, F[1] + 0.9, F[1] + 2.2, F[2] - 0.6, F[2] + 0.9, F[2] + 2.2, FR - 0.06, F[0] + 1.0]) {
    sk.b('iron', x0 - 0.09, y, z0, x0 + 0.03, y + 0.05, z1);
    sk.b('iron', x0 - 0.105, y - 0.02, z0, x0 - 0.09, y + 0.075, z1);
  }
  // the upper lights: a frame in every bay, the reflecting pane in every third, a sash swung out on its top hinge in some
  const bays = Math.round((z1 - z0) / W);
  for (let f = 0; f < 3; f++) {
    const yb = F[f] + 2.27, yt = F[f] + 3.43;
    for (let k = 0; k < bays; k++) {
      const a = z0 + 0.05 + k * W + 0.04, b = z0 + 0.05 + (k + 1) * W - 0.04, xo = x0 - 0.125;
      if (k % 3 === 2 && (k + f) % 2 === 0) {
        // open: the sash hangs from the head, its foot swung 0.4 m out; frame rods on the edges and a pane both sides
        const xh = x0 - 0.12, xb = x0 - 0.5, yh = yt - 0.02, yl = yt - 1.04;
        const A = [xh, yh, a], B = [xh, yh, b], C = [xb, yl, b], D = [xb, yl, a];
        sk.bag.add('glass_outer', fromTriangles([...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C]));
        sk.rod('iron', A, B, 0.014, 4); sk.rod('iron', D, C, 0.014, 4); sk.rod('iron', A, D, 0.014, 4); sk.rod('iron', B, C, 0.014, 4);
        sk.rod('steel_chrome', [x0 - 0.12, yb + 0.3 + jit(), (a + b) / 2], [xb + 0.02, yl + 0.05, (a + b) / 2], 0.008, 4);   // the stay arm
      } else {
        sk.b('iron', xo, yb, a, xo + 0.03, yb + 0.04, b); sk.b('iron', xo, yt - 0.04, a, xo + 0.03, yt, b);
        sk.b('iron', xo, yb, a, xo + 0.03, yt, a + 0.04); sk.b('iron', xo, yb, b - 0.04, xo + 0.03, yt, b);
        if (k % 3 === 0) sk.b('steel_chrome', xo - 0.02, yb + 0.55, b - 0.1, xo, yb + 0.62, b - 0.04);   // the catch
      }
    }
  }
  // the columns behind the glass on a 5 m grid, white plaster, 1.4 m inside the wall (standing on the slab below, up to the soffit above)
  for (let k = 0; k < 3; k++) for (const z of [9, 14, 19, 24, 29]) sk.s('plaster_white', x0 + 1.2, F[k], z - 0.2, x0 + 1.6, F[k + 1] - 0.3, z + 0.2);
}

// ── lettering ──────────────────────────────────────────────────────────────────────────────────
// Block letters on a 5 × 7 grid of identical 0.2 m cells (one repeated shape, so the cells are instanced and cost no extra draw).
const GL = {
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
};
/** BAUHAUS down the west face of the plastered pier at the wing's north-west corner by the bridge (docs §2, §14): black letters in relief 1.35 m tall, stacked from the top. */
export function lettering(sk, FR) {
  const x0 = -17.95, x1 = -17.05, z0 = 2.55, z1 = 3.95, top = FR + 1.9, C = 0.2;
  sk.s('plaster_white', x0, 0, z0, x1, top, z1);
  sk.b('concrete_light', x0 - 0.05, top, z0 - 0.05, x1 + 0.03, top + 0.1, z1 + 0.05); sk.b('concrete_light', x0 - 0.05, 0, z0 - 0.05, x1 + 0.03, 0.25, z1 + 0.05);
  const zl = z0 + 0.2;
  let y = top - 0.4;
  for (const ch of 'BAUHAUS') {
    GL[ch].forEach((row, r) => { for (let c = 0; c < 5; c++) if (row[c] === '1') sk.b('car_black', x0 - 0.07, y - (r + 1) * C, zl + c * C, x0, y - r * C, zl + (c + 1) * C); });
    y -= 7 * C + 0.4;
  }
  sk.b('plaster_damp', x0 - 0.01, 0.25, z0 + 0.05, x0 + 0.01, 0.9, z1 - 0.05);
}

// ── balconies ────────────────────────────────────────────────────────────────────────────────────
/** A tube railing along a run a→b (plan points) standing on y: a round handrail, two intermediate tubes, posts every ~0.9 m on small plates; blocking as a rail. */
export function tubeRail(sk, a, b, y, h = 1.05, col = true, mat = 'steel_chrome') {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 0.9));
  for (let i = 0; i <= n; i++) {
    const p = [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n];
    sk.rod(mat, [p[0], y + 0.02, p[1]], [p[0], y + h + jit(), p[1]], 0.019 + jit() / 40, 6);
    sk.b('iron', p[0] - 0.04, y, p[1] - 0.04, p[0] + 0.04, y + 0.02, p[1] + 0.04);
  }
  sk.rod(mat, [a[0], y + h + jit(), a[1]], [b[0], y + h + jit(), b[1]], 0.026, 6);
  for (const f of [0.36, 0.68]) sk.rod(mat, [a[0], y + h * f, a[1]], [b[0], y + h * f + jit(), b[1]], 0.014, 5);
  if (col) sk.col.segment(a, b, 0.1, y, y + h);
}
/** One cantilevered balcony of the Prellerhaus east face: a thin slab with an edge fascia and a coloured soffit, tube railing on the three free sides. */
export function balcony(sk, XB, x1, b0, b1, y, soffit) {
  slab(sk, [XB, b0, x1, b1], y, [], { mat: 'concrete_light', th: 0.16 });
  sk.b(soffit, XB, y - 0.165, b0 + 0.03, x1 - 0.03, y - 0.16, b1 - 0.03);       // the coloured underside (docs §3 of the Masters' Houses: balcony undersides in colour)
  sk.b('plaster_white', x1 - 0.05, y - 0.16, b0, x1, y + 0.03, b1);              // the front edge, a slim fascia
  tubeRail(sk, [x1 - 0.06, b0 + 0.04], [x1 - 0.06, b1 - 0.04], y);
  tubeRail(sk, [XB + 0.05, b0 + 0.04], [x1 - 0.06, b0 + 0.04], y);
  tubeRail(sk, [XB + 0.05, b1 - 0.04], [x1 - 0.06, b1 - 0.04], y);
}

// ── the entrance ─────────────────────────────────────────────────────────────────────────────────
/** The school's door on Kothener Strasse (north wing, x 8..10.4 on z = −10): steel frame with a fanlight, pull handles, tie rods for the canopy, a lamp. */
export function entrance(sk, z1, y0) {
  const a = 7.95, b = 10.45, zf = z1 + 0.02, h = y0 + 2.4;
  // the steel doorframe's outer face with a transom and the fanlight's bars above
  sk.b('iron', a - 0.08, y0, zf, a, h + 0.38, zf + 0.06); sk.b('iron', b, y0, zf, b + 0.08, h + 0.38, zf + 0.06);
  sk.b('iron', a - 0.08, h, zf, b + 0.08, h + 0.06, zf + 0.06); sk.b('iron', a - 0.08, h + 0.32, zf, b + 0.08, h + 0.38, zf + 0.06);
  for (const u of [a + (b - a) / 3, a + 2 * (b - a) / 3]) sk.b('iron', u - 0.015, h + 0.06, zf, u + 0.015, h + 0.32, zf + 0.04);
  sk.b('iron', (a + b) / 2 - 0.02, y0, zf, (a + b) / 2 + 0.02, h, zf + 0.05);            // the meeting stile of the double door
  for (const u of [(a + b) / 2 - 0.12, (a + b) / 2 + 0.12]) sk.rod('steel_chrome', [u, y0 + 0.8, zf + 0.12], [u, y0 + 1.7, zf + 0.12], 0.015, 6);   // long tube pulls
  for (const u of [(a + b) / 2 - 0.12, (a + b) / 2 + 0.12]) for (const yy of [0.85, 1.65]) sk.b('steel_chrome', u - 0.01, y0 + yy, zf + 0.05, u + 0.01, y0 + yy + 0.02, zf + 0.12);
  sk.b('steel_chrome', a, y0, zf, b, y0 + 0.28, zf + 0.012);                                    // the kick plate band
  // tie rods carrying the canopy's outer edge from the wall above
  for (const x of [6.8, 11.8]) sk.rod('iron', [x, 5.1, z1 + 0.04], [x, 3.55, z1 + 1.52], 0.012, 4);
  // a lamp over the door and the name plate
  sk.rod('iron', [9.2, 3.3, z1 + 0.3], [9.2, 3.22, z1 + 0.3], 0.01, 4);
  sk.lathe('lamp_white', [[0.001, 0], [0.1, 0.05], [0.12, 0.16], [0.001, 0.2]], 9.2, 3.05, z1 + 0.3, 10);
  sk.light(9.2, 3.0, z1 + 0.3, '#fff0d0', 1.5, 7);
}

// ── the bridge ───────────────────────────────────────────────────────────────────────────────────
/** The bridge over Kothener Strasse seen from the street: down-stand beams under its slab between the pillars, a slab-edge stringcourse at each floor, steel sills under the ribbon windows. */
export function bridgeDetail(sk, rect, F1, F2, FR) {
  const [x0, z0, x1, z1] = rect;
  for (let x = x0 + 0.3, i = 0; x < x1 - 0.2; x += (x1 - x0 - 0.6) / 5, i++) sk.b('plaster_white', x - 0.17 - i * 0.001, F1 - 0.66, z0 + 0.1, x + 0.17 + i * 0.001, F1 - 0.3, z1 - 0.1);    // beams in the span
  sk.b('plaster_white', x0, F1 - 0.7, z0 + 0.05, x1, F1 - 0.3, z0 + 0.4); sk.b('plaster_white', x0, F1 - 0.7, z1 - 0.4, x1, F1 - 0.3, z1 - 0.05);
  for (const [x, nx] of [[x0, -1], [x1, 1]]) {
    for (const y of [F1, F2, FR]) {
      const a = nx < 0 ? x - 0.07 : x, b = nx < 0 ? x : x + 0.07;
      sk.b('concrete_light', a, y - 0.32, z0, b, y + 0.12, z1);                                  // the slab edge as a stringcourse
    }
    for (const y of [F1, F2]) {
      const a = nx < 0 ? x - 0.1 : x, b = nx < 0 ? x : x + 0.1;
      sk.b('iron', a, y + 0.88, z0 + 0.1, b, y + 0.92, z1 - 0.1);                                // a steel sill line under the ribbon
    }
  }
}
