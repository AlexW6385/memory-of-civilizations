// The Xianyang palace hall on its rammed-earth terrace (docs/settlements/qin-xianyang.md §2, §5): a two-tier terrace of beaten
// earth with a coping of grey brick, the great stair of brick steps with hollow-brick cheeks, the hall of vermilion walls
// and round red columns under a grey-tiled hipped roof, black and ochre architraves, simple bracket blocks, the throne dais,
// the screen, lamps and the bells of the hall inside; the twin que (gate towers) at the stair's foot.
import { box, frustum, lathe, rod, addCloth, clothBox, fromTriangles } from '../../core/geom.js';
import { frame, gable } from './houses.js';
import { hipRoof } from '../chinese/index.js';
import { TERRACE, STAIR, HALL, QUE, FORECOURT } from '../../settlements/qin-xianyang/layout.js';

const TOP = TERRACE.h, T1 = TERRACE.h1;

/**
 * A bracket set (ludou and gong) on the outer face of a wall plate: a cantilever beam from the plate, a block over its end, a cross arm
 * on the block, cap-pieces in ochre at the arm's ends. `face` is the plate's outer face (a z for a wall along x, an x for a wall along z),
 * `s` the outward sign, `p` the place along the wall, `ay` the plate's bottom; `k` scales the set (1 for the hall).
 */
function bracketSet(bag, alongX, face, s, p, ay, k = 1) {
  const B = (a0, a1, y0, y1, o0, o1, mat) => {
    const f0 = face + s * o0 * k, f1 = face + s * o1 * k, lo = Math.min(f0, f1), hi = Math.max(f0, f1);
    bag.add(mat, alongX ? box(p + a0 * k, ay + y0 * k, lo, p + a1 * k, ay + y1 * k, hi) : box(lo, ay + y0 * k, p + a0 * k, hi, ay + y1 * k, p + a1 * k));
  };
  B(-0.2, 0.2, 0.1, 0.4, -0.05, 1.05, 'lacquer_black');             // the cantilever
  B(-0.32, 0.32, 0.4, 0.75, 0.55, 1.0, 'timber_red');               // the block (dou) over its end
  B(-0.7, 0.7, 0.75, 0.92, 0.6, 0.95, 'lacquer_black');             // the cross arm (gong)
  for (const [a0, a1] of [[-0.76, -0.64], [0.64, 0.76]]) B(a0, a1, 0.73, 0.94, 0.58, 0.97, 'paint_ochre');   // the arm's ends
}
/** A lattice window painted on a wall's outer face: a dark ground, a black frame, red bars. `face` the wall's outer face, `s` outward sign. */
function windowOn(bag, alongX, face, s, p, y0, y1, w) {
  const P = (a0, a1, yy0, yy1, o0, o1, mat) => {
    const f0 = face + s * o0, f1 = face + s * o1, lo = Math.min(f0, f1), hi = Math.max(f0, f1);
    bag.add(mat, alongX ? box(p + a0, yy0, lo, p + a1, yy1, hi) : box(lo, yy0, p + a0, hi, yy1, p + a1));
  };
  P(-w / 2, w / 2, y0, y1, -0.02, 0.03, 'opening');
  for (let q = 1; q < Math.round(w / 0.2); q++) P(-w / 2 + q * 0.2 - 0.025, -w / 2 + q * 0.2 + 0.025, y0, y1, 0.0, 0.06, 'timber_red');
  P(-w / 2 - 0.1, w / 2 + 0.1, y1, y1 + 0.1, -0.02, 0.1, 'lacquer_black'); P(-w / 2 - 0.1, w / 2 + 0.1, y0 - 0.1, y0, -0.02, 0.12, 'lacquer_black');
  P(-w / 2 - 0.1, -w / 2, y0, y1, -0.02, 0.1, 'lacquer_black'); P(w / 2, w / 2 + 0.1, y0, y1, -0.02, 0.1, 'lacquer_black');
  P(-w / 2, w / 2, (y0 + y1) / 2 - 0.03, (y0 + y1) / 2 + 0.03, 0.0, 0.08, 'lacquer_black');
}
/** A plank door leaf of red lacquer with its studs and iron straps, standing on the outer face of a wall: along `alongX`, from a0 to a1. */
function leafOn(bag, alongX, face, s, a0, a1, y0, y1) {
  const P = (b0, b1, yy0, yy1, o0, o1, mat) => {
    const f0 = face + s * o0, f1 = face + s * o1, lo = Math.min(f0, f1), hi = Math.max(f0, f1);
    bag.add(mat, alongX ? box(b0, yy0, lo, b1, yy1, hi) : box(lo, yy0, b0, hi, yy1, b1));
  };
  P(a0, a1, y0, y1, 0.0, 0.1, 'lacquer_red');
  const nc = Math.max(2, Math.round((a1 - a0) / 0.4)), nr = Math.max(3, Math.round((y1 - y0) / 0.55));
  for (let j = 0; j < nr; j++) P(a0, a1, y0 + (j + 0.5) * (y1 - y0) / nr - 0.05, y0 + (j + 0.5) * (y1 - y0) / nr + 0.05, 0.1, 0.13, 'lacquer_black');   // the straps
  for (let i = 0; i < nc; i++) for (let j = 0; j < nr; j++) { const u = a0 + (i + 0.5) * (a1 - a0) / nc, v = y0 + (j + 0.5) * (y1 - y0) / nr; P(u - 0.05, u + 0.05, v - 0.05, v + 0.05, 0.13, 0.17, 'bronze'); }   // the studs
}

/** qin_terrace: {} — the two tiers, the coping, the colonnade's floor. The stair is a generic `stair` element. */
export function qinTerrace(el, { bag, col }) {
  const { x0, z0, x1, z1, rim } = TERRACE, sx = STAIR.x, sw = STAIR.w / 2;
  bag.add('earth_wall', frustum([x0 - rim, z0 - rim, x1 + rim, z1 + rim], 0, T1, 0.6, 0.6, 0.6, 0.6, { noBottom: true }));
  col.rect([x0 - rim, z0 - rim, x1 + rim, z1 + rim], 0, T1);
  bag.add('earth_wall', frustum([x0, z0, x1, z1], T1, TOP, 0.5, 0.5, 0.5, 0.5, { noBottom: true }));
  col.rect([x0, z0, x1, z1], T1, TOP);
  col.floor([x0, z0, x1, z1], TOP);
  // the lower tier's walk (its surface is 3.5 m up: reached from the hall's side stairs) and its coping
  const cp = (r, y, h = 0.3) => { bag.add('brick_grey', box(r[0], y, r[1], r[2], y + h, r[3])); };
  const w = 0.7;
  for (const [a, b, c, d] of [[x0, z0, x1, z0 + w], [x0, z0, x0 + w, z1], [x1 - w, z0, x1, z1]]) { bag.add('brick_grey', box(a, TOP, b, c, TOP + 1.0, d)); col.rect([a, b, c, d], TOP, TOP + 1.0); }
  for (const [a, b, c, d] of [[x0, z1 - w, sx - sw - 0.4, z1], [sx + sw + 0.4, z1 - w, x1, z1]]) { bag.add('brick_grey', box(a, TOP, b, c, TOP + 1.0, d)); col.rect([a, b, c, d], TOP, TOP + 1.0); }
  // the hollow-brick cheeks of the stair (barrier bricks, stepped with it)
  const n = Math.round(TOP / 0.16), run = STAIR.run / n, zs = z1 + STAIR.run;
  for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
    const y = (i + 1) * (TOP / n);
    bag.add('brick_grey', box(sx + s * (sw + 0.2) - 0.2, 0, zs - (i + 1) * run, sx + s * (sw + 0.2) + 0.2, y + 0.45, zs - i * run));
  }
  // the stamped pattern of the hollow bricks on the cheeks (inner and outer faces): a cord ridge along each step and a square boss over it [inferred: Qin hollow bricks carry
  // stamped geometric and cord patterns; no glyph or figure is drawn]; and the way the feet went: each tread darkened across its middle, narrowing toward the top (decals as thin boxes over the tread)
  for (let i = 0; i < n; i++) {
    const y = (i + 1) * (TOP / n), za = zs - (i + 1) * run + 0.06, zb = zs - i * run - 0.06, zm = (za + zb) / 2;
    for (const s of [-1, 1]) for (const f of [0, 0.4]) {
      const xf = sx + s * (sw + f), o = f === 0 ? -s : s;                              // the face's outward side
      const xa = Math.min(xf, xf + o * 0.025), xb = Math.max(xf, xf + o * 0.025);
      bag.add('brick_grey', box(xa, y + 0.14, za, xb, y + 0.18, zb));
      bag.add('brick_grey', box(Math.min(xf, xf + o * 0.03), y + 0.26, zm - 0.07, Math.max(xf, xf + o * 0.03), y + 0.34, zm + 0.07));
    }
    const hw = 2.3 - 1.0 * (i / n);
    bag.add('tile_dark', box(sx - hw, y + 0.004, za, sx + hw, y + 0.012, zb));
  }
  void cp;
}

/** qin_hall: {} — the principal hall on the terrace, its interior. */
export function qinHall(el, { bag, col, lights }) {
  const { x0, z0, x1, z1 } = HALL, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ch = 6.4, y = TOP;
  const wall = 3.4, c = [x0 + wall, z0 + wall, x1 - wall, z1 - wall], th = 1.0;
  // the floor of grey brick over the whole hall
  bag.add('brick_grey', box(x0, y, z0, x1, y + 0.08, z1));
  col.floor([x0, z0, x1, z1], y + 0.08);
  // the peristyle: round red columns on stone bases, along the four sides
  const colAt = (x, z) => {
    bag.add('granite_grey', lathe([[0.62, 0], [0.62, 0.16], [0.5, 0.2]], 12, null, x, y + 0.08, z));
    bag.add('timber_red', lathe([[0.46, 0], [0.42, ch * 0.5], [0.38, ch - 0.5]], 14, null, x, y + 0.28, z));
    bag.add('timber_red', box(x - 0.55, y + ch - 0.22, z - 0.55, x + 0.55, y + ch - 0.02, z + 0.55));       // the cap block
    col.circle(x, z, 0.5, y, y + ch);
  };
  const nx = 9, nz = 5;
  for (let i = 0; i <= nx; i++) for (const z of [z0 + 0.6, z1 - 0.6]) colAt(x0 + 0.6 + i * (x1 - x0 - 1.2) / nx, z);
  for (let j = 1; j < nz; j++) for (const x of [x0 + 0.6, x1 - 0.6]) colAt(x, z0 + 0.6 + j * (z1 - z0 - 1.2) / nz);
  // the architrave: black, with an ochre band, the rafters' ends below the eave
  const ay = y + ch;
  for (const [a, b, c2, d] of [[x0, z0, x1, z0 + 1.2], [x0, z1 - 1.2, x1, z1], [x0, z0, x0 + 1.2, z1], [x1 - 1.2, z0, x1, z1]]) {
    bag.add('lacquer_black', box(a, ay, b, c2, ay + 0.7, d));
    bag.add('paint_ochre', box(a - (c2 - a > 2 ? 0 : 0.02), ay + 0.7, b - (d - b > 2 ? 0 : 0.02), c2 + (c2 - a > 2 ? 0 : 0.02), ay + 0.82, d + (d - b > 2 ? 0 : 0.02)));
  }
  // a bracket set (ludou and gong) on every column of the colonnade, under the eave
  for (let i = 0; i <= nx; i++) { const px = x0 + 0.6 + i * (x1 - x0 - 1.2) / nx; bracketSet(bag, true, z0, -1, px, ay); bracketSet(bag, true, z1, 1, px, ay); }
  for (let j = 1; j < nz; j++) { const pz = z0 + 0.6 + j * (z1 - z0 - 1.2) / nz; bracketSet(bag, false, x0, -1, pz, ay); bracketSet(bag, false, x1, 1, pz, ay); }
  // the enclosed core: vermilion walls (a dark dado), doors in the south wall, a window slit row in the others
  const Wl = (r, y0 = y, y1 = y + ch) => { bag.add('palace_wall', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  const doors = [cx - 12, cx, cx + 12], dw = 4.4;
  Wl([c[0], c[1] - th, c[2], c[1]]); Wl([c[0] - th, c[1] - th, c[0], c[3] + th]); Wl([c[2], c[1] - th, c[2] + th, c[3] + th]);
  let xa = c[0] - th;
  for (const d of doors) { Wl([xa, c[3], d - dw / 2, c[3] + th]); xa = d + dw / 2; bag.add('timber_red', box(d - dw / 2, y + 3.6, c[3], d + dw / 2, y + ch, c[3] + th)); col.rect([d - dw / 2, c[3], d + dw / 2, c[3] + th], y + 3.6, y + ch); bag.add('lacquer_black', box(d - dw / 2 - 0.2, y + 3.4, c[3] - 0.05, d + dw / 2 + 0.2, y + 3.6, c[3] + th + 0.05)); }
  Wl([xa, c[3], c[2] + th, c[3] + th]);
  // the doors' leaves (red lacquer, studded, strapped) folded back on the wall's face, a granite sill; lattice windows high on the walls
  for (const d of doors) {
    leafOn(bag, true, c[3] + th, 1, d - dw / 2 - 1.15, d - dw / 2 - 0.05, y + 0.1, y + 3.5); leafOn(bag, true, c[3] + th, 1, d + dw / 2 + 0.05, d + dw / 2 + 1.15, y + 0.1, y + 3.5);
    bag.add('granite_grey', box(d - dw / 2, y + 0.08, c[3] - 0.1, d + dw / 2, y + 0.17, c[3] + th + 0.25));
  }
  for (const p of [cx - 6, cx + 6]) windowOn(bag, true, c[3] + th, 1, p, y + 2.0, y + 3.3, 1.6);
  for (const p of [cx - 14, cx - 7, cx, cx + 7, cx + 14]) windowOn(bag, true, c[1] - th, -1, p, y + 2.0, y + 3.3, 1.6);
  for (const p of [cz - 10, cz - 3.3, cz + 3.3, cz + 10]) { windowOn(bag, false, c[0] - th, -1, p, y + 2.0, y + 3.3, 1.6); windowOn(bag, false, c[2] + th, 1, p, y + 2.0, y + 3.3, 1.6); }
  bag.add('lacquer_black', box(c[0] - th - 0.04, y + 0.08, c[1] - th - 0.04, c[2] + th + 0.04, y + 1.0, c[1] - th));
  bag.add('lacquer_black', box(c[0] - th - 0.05, y + ch - 0.4, c[1] - th - 0.05, c[2] + th + 0.05, y + ch + 0.06, c[3] + th + 0.05));       // the wall plate, under the roof
  // inside the core: two rows of columns, the dais, the screen, seats and tables, lamps, bells, a drum
  for (let i = -3; i <= 3; i++) { if (i === 0) continue; for (const z of [cz - 3.5, cz + 5]) { const x = cx + i * 6; bag.add('timber_red', lathe([[0.4, 0], [0.37, ch * 0.5], [0.34, ch - 0.7]], 12, null, x, y + 0.08, z)); bag.add('lacquer_black', box(x - 0.5, y + ch - 0.7, z - 0.5, x + 0.5, y + ch - 0.4, z + 0.5)); col.circle(x, z, 0.45, y, y + ch); } }
  const dz0 = c[1] + 0.2, dz1 = c[1] + 8.0;
  bag.add('lacquer_black', box(cx - 9, y + 0.08, dz0, cx + 9, y + 1.1, dz1)); col.floor([cx - 9, dz0, cx + 9, dz1], y + 1.1);
  for (let k = 0; k < 4; k++) bag.add('timber_red', box(cx - 3 - k * 0.0, y + 0.08, dz1 + k * 0.4 + 0.0, cx + 3, y + 1.1 - (k + 1) * 0.27, dz1 + k * 0.4 + 0.4));
  col.ramp([cx - 3, dz1, cx + 3, dz1 + 1.6], y + 0.08, y + 1.1, 'n');
  bag.add('lacquer_red', box(cx - 3.2, y + 1.1, dz0 + 0.4, cx + 3.2, y + 1.16, dz0 + 3.4));              // the sovereign's mat
  bag.add('cloth_black', box(cx - 3.0, y + 1.16, dz0 + 0.5, cx + 3.0, y + 1.19, dz0 + 3.3));
  col.rect([cx - 3.2, dz0 + 0.4, cx + 3.2, dz0 + 3.4], y + 1.1, y + 1.5);
  bag.add('lacquer_black', box(cx - 5, y + 1.1, dz0 + 0.02, cx + 5, y + 4.6, dz0 + 0.3));                // the screen (pingfeng)
  bag.add('paint_ochre', box(cx - 4.7, y + 1.4, dz0 + 0.3, cx + 4.7, y + 1.5, dz0 + 0.34)); bag.add('paint_ochre', box(cx - 4.7, y + 4.1, dz0 + 0.3, cx + 4.7, y + 4.2, dz0 + 0.34));
  for (let i = 0; i < 5; i++) bag.add('palace_wall', box(cx - 4.2 + i * 1.9, y + 1.8, dz0 + 0.3, cx - 3.0 + i * 1.9, y + 3.8, dz0 + 0.34));
  // officials' seats: low lacquer tables on mats in two ranks down the hall
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) {
    const x = cx + s * 13, z = dz1 + 3 + i * 2.6;
    bag.add('reed_mat', box(x - 1.2, y + 0.08, z - 0.9, x + 1.2, y + 0.11, z + 0.9));
    bag.add('lacquer_red', box(x - 0.55, y + 0.11, z - 0.3, x + 0.55, y + 0.4, z + 0.3));
  }
  // lamp trees of bronze either side of the dais, braziers
  for (const s of [-1, 1]) {
    const x = cx + s * 7.5, z = dz1 + 0.8;
    bag.add('bronze', lathe([[0.3, 0], [0.25, 0.1], [0.05, 0.3], [0.04, 1.8], [0.2, 1.9], [0.001, 2.0]], 10, null, x, y + 0.08, z)); col.circle(x, z, 0.3, y, y + 2);
    bag.add('flame', lathe([[0.001, 0], [0.06, 0.08], [0.001, 0.3]], 6, null, x, y + 2.0, z));
    lights.push({ at: [x, y + 2.3, z], color: '#ffb468', intensity: 2.4, distance: 14 });
  }
  // the bell frame (bianzhong): two posts, a beam, two rows of bronze bells; a great drum on a stand
  { const bx = c[0] + 3, bz = cz + 3;
    for (const dz of [-3.4, 3.4]) { bag.add('lacquer_black', box(bx - 0.18, y + 0.08, bz + dz - 0.18, bx + 0.18, y + 2.8, bz + dz + 0.18)); col.rect([bx - 0.2, bz + dz - 0.2, bx + 0.2, bz + dz + 0.2], y, y + 2.8); }
    bag.add('lacquer_black', box(bx - 0.14, y + 2.7, bz - 3.5, bx + 0.14, y + 2.9, bz + 3.5)); bag.add('lacquer_black', box(bx - 0.14, y + 1.6, bz - 3.5, bx + 0.14, y + 1.75, bz + 3.5));
    for (let i = 0; i < 9; i++) { const zz = bz - 3 + i * 0.75; bag.add('bronze', lathe([[0.001, -0.5], [0.2, -0.46], [0.24, -0.1], [0.1, 0]], 8, null, bx, y + 2.7, zz)); }
    for (let i = 0; i < 8; i++) { const zz = bz - 2.6 + i * 0.75; bag.add('bronze', lathe([[0.001, -0.4], [0.16, -0.36], [0.19, -0.08], [0.08, 0]], 8, null, bx, y + 1.6, zz)); }
    const dx = c[2] - 3;
    bag.add('timber_red', lathe([[0.7, 0.9], [0.9, 1.5], [0.9, 2.2], [0.001, 2.2]], 16, null, dx, y + 0.08, bz)); col.circle(dx, bz, 0.9, y, y + 2.3);
    bag.add('lacquer_black', box(dx - 0.7, y + 0.08, bz - 0.7, dx + 0.7, y + 0.9, bz + 0.7));
  }
  // the ceiling: a coffered field of painted panels between black beams, the beams' ends carved as bracket blocks
  { const cy = y + ch - 0.14;
    bag.add('ceiling_coffer', box(c[0], cy, c[1], c[2], cy + 0.1, c[3]));
    for (let x = c[0]; x <= c[2] + 0.01; x += (c[2] - c[0]) / 8) bag.add('lacquer_black', box(x - 0.14, cy - 0.34, c[1], x + 0.14, cy, c[3]));
    for (let z = c[1]; z <= c[3] + 0.01; z += (c[3] - c[1]) / 6) bag.add('lacquer_black', box(c[0], cy - 0.3, z - 0.12, c[2], cy, z + 0.12));
    for (let x = c[0] + 2; x < c[2]; x += 5.9) for (let z = c[1] + 2; z < c[3]; z += 4.6) bag.add('paint_caihua', box(x - 0.55, cy - 0.02, z - 0.55, x + 0.55, cy, z + 0.55));    // the painted panels' roundels
  }
  // the murals along the walls' inner faces: a white ground, a frieze of chariots, horses, banqueters and tribute-bearers in ochre, red, blue and green
  { const band = (a, b, fixed, alongX) => {
      const len = Math.abs(b - a), lo = Math.min(a, b);
      const P = (u0, y0, u1, y1, d, mat) => { const n = Math.abs(d) > 0.04 ? d / 4 : 0, a = Math.min(n, d), b = Math.max(n, d); bag.add(mat, alongX ? box(lo + u0, y + y0, fixed + a, lo + u1, y + y1, fixed + b) : box(fixed + a, y + y0, lo + u0, fixed + b, y + y1, lo + u1)); };
      return { len, P };
    };
    const sides = [[c[0], c[2], c[1] + 0.0, true, 1], [c[1], c[3], c[0], false, 1], [c[1], c[3], c[2], false, -1]];
    sides.forEach(([a, b, fixed, alongX, dir], si) => {
      const { len, P } = band(a, b, fixed, alongX), d = 0.03 * dir;
      P(0.5, 1.15, len - 0.5, 3.6, d, 'paint_white');
      P(0.45, 1.1, len - 0.45, 1.3, d * 2, 'lacquer_red'); P(0.45, 3.45, len - 0.45, 3.65, d * 2, 'lacquer_red');
      const r2 = ((si + 1) * 2654435761 >>> 0) / 4294967296;
      for (let u = 1.2, k = 0; u < len - 2.2; u += 2.4, k++) {
        const kind = (k + si) % 3;
        if (kind === 0) { P(u, 1.65, u + 1.4, 2.3, d * 2, 'lacquer_black'); P(u + 0.1, 2.3, u + 0.2, 2.9, d * 2, 'timber_red'); for (let h = 0; h < 2; h++) P(u + 1.4 + h * 0.4, 1.65, u + 1.7 + h * 0.4, 2.3 + (h ? 0.1 : 0), d * 2, h ? 'hide_brown' : 'hide_black'); }   // a chariot and its horses
        else if (kind === 1) { for (let q = 0; q < 3; q++) { P(u + q * 0.55, 1.6, u + 0.35 + q * 0.55, 2.55, d * 2, ['cloth_red', 'paint_ochre', 'cloth_green'][(q + k) % 3]); P(u + 0.07 + q * 0.55, 2.55, u + 0.28 + q * 0.55, 2.8, d * 2, 'skin_light'); } }   // banqueters
        else { for (let q = 0; q < 2; q++) { P(u + q * 0.8, 1.6, u + 0.45 + q * 0.8, 2.6, d * 2, 'paint_blue'); P(u + 0.1 + q * 0.8, 2.6, u + 0.35 + q * 0.8, 2.85, d * 2, 'skin_light'); } P(u + 1.7, 1.6, u + 2.1, 1.95, d * 2, 'bronze'); }   // tribute-bearers
        void r2;
      }
    });
  }
  // curtains and banners: black valances across the dais, long red and black streamers from the beams
  { const cy = y + ch - 0.4;
    addCloth(bag, 'cloth_black', clothBox(cx - 9, cy - 1.5, c[1] + 8.1, cx + 9, cy, c[1] + 8.2), cy);
    for (let i = -4; i <= 4; i++) addCloth(bag, i % 2 ? 'cloth_red' : 'cloth_black', clothBox(cx + i * 4.4 - 0.4, cy - 3.4, cz + 1.0, cx + i * 4.4 + 0.4, cy, cz + 1.05), cy);
  }
  // a canopy over the sovereign's mat, on four posts; the great ding either side of the doors
  { const dz = c[1] + 0.2;
    for (const sx of [-1, 1]) for (const sz of [0.45, 3.2]) { bag.add('lacquer_black', lathe([[0.1, 0], [0.09, 3.4]], 8, null, cx + sx * 3.3, y + 1.1, dz + sz)); col.circle(cx + sx * 3.3, dz + sz, 0.14, y + 1.1, y + 4.5); }
    bag.add('lacquer_black', box(cx - 3.5, y + 4.5, dz + 0.3, cx + 3.5, y + 4.7, dz + 3.4)); bag.add('paint_ochre', box(cx - 3.55, y + 4.7, dz + 0.25, cx + 3.55, y + 4.76, dz + 3.45));
    addCloth(bag, 'cloth_red', clothBox(cx - 3.4, y + 3.7, dz + 3.35, cx + 3.4, y + 4.5, dz + 3.4), y + 4.5);
    for (const sx of [-1, 1]) { const px = cx + sx * 6.0, pz = c[3] - 2.6; bag.add('bronze', lathe([[0.001, 0.5], [0.6, 0.62], [0.78, 1.0], [0.7, 1.3], [0.001, 1.3]], 14, null, px, y + 0.08, pz)); for (const a of [0.3, 2.4, 4.5]) bag.add('bronze', rod([px + Math.cos(a) * 0.45, y + 0.08, pz + Math.sin(a) * 0.45], [px + Math.cos(a) * 0.45, y + 0.6, pz + Math.sin(a) * 0.45], 0.1, 6)); col.circle(px, pz, 0.8, y, y + 1.4); }
  }
  // the hipped roof of grey tiles, the eaves reaching 3.5 m past the colonnade
  const A = (x1 - x0) / 2 + 3.5, B = (z1 - z0) / 2 + 3.5;
  hipRoof({ c: [cx, cz], A, B, y: ay + 1.2, rise: 6.4, lift: 0.3, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true }, { bag });
  // the eave's round tile-ends: a row of small discs under the edge
  for (let x = cx - A + 1; x < cx + A - 0.5; x += 1.0) for (const z of [cz - B, cz + B]) bag.add('terracotta', rod([x, ay + 0.9, z], [x, ay + 1.15, z], 0.17, 8));
  // the great bronze tripod (ding) before the stair
  { const dx = STAIR.x + 5, dz = TERRACE.z1 + STAIR.run + 6;
    bag.add('bronze', lathe([[0.001, 0.6], [0.6, 0.7], [0.9, 1.2], [0.85, 1.6], [0.001, 1.6]], 14, null, dx, 0, dz));
    for (const a of [0.3, 2.4, 4.5]) bag.add('bronze', rod([dx + Math.cos(a) * 0.55, 0, dz + Math.sin(a) * 0.55], [dx + Math.cos(a) * 0.55, 0.9, dz + Math.sin(a) * 0.55], 0.14, 6));
    col.circle(dx, dz, 1.0, 0, 1.7); }
}

/**
 * qin_que: { at [x, z] } — a gate tower (que) of the stair's foot: a battered base of rammed earth with its timber wall-posts and
 * ramming courses, a stone kerb, a deck with a railing (pingzuo), a room of vermilion walls between red posts with lattice windows and
 * a door on the side toward the stair, bracket sets under a hipped roof of grey tile with round tile-ends and a bird on the ridge;
 * and beside it, outward, the lower subsidiary tower (zi que) with a roof of its own (docs/settlements/qin-xianyang.md §9d).
 */
export function qinQue(el, { bag, col }) {
  const [x, z] = el.at, hw = QUE.w / 2, hd = QUE.d / 2, h = QUE.h - 3, out = x < STAIR.x ? -1 : 1;
  const inset = 0.9;
  // ── the main tower's base: rammed earth, battered, with a stone kerb at its foot
  bag.add('earth_wall', frustum([x - hw, z - hd, x + hw, z + hd], 0, h, inset, inset, inset, inset, { noBottom: true }));
  col.rect([x - hw, z - hd, x + hw, z + hd], 0, h);
  bag.add('brick_grey', box(x - hw + 0.4, 0, z - hd + 0.4, x + hw - 0.4, 0.6, z + hd - 0.4));
  for (const [a, b, c, d] of [[x - hw - 0.2, z - hd - 0.2, x + hw + 0.2, z - hd], [x - hw - 0.2, z + hd, x + hw + 0.2, z + hd + 0.2], [x - hw - 0.2, z - hd, x - hw, z + hd], [x + hw, z - hd, x + hw + 0.2, z + hd]]) bag.add('granite_grey', box(a, 0, b, c, 0.35, d));
  // the ramming courses (light bands of clay between the layers) and the wall-posts of timber standing in the earth
  for (let y = 0.7; y < h - 0.3; y += 0.7) {
    const i = inset * y / h;
    bag.add('mud_plaster', box(x - hw + i - 0.02, y, z - hd + i - 0.03, x + hw - i + 0.02, y + 0.05, z - hd + i + 0.03)); bag.add('mud_plaster', box(x - hw + i - 0.02, y, z + hd - i - 0.03, x + hw - i + 0.02, y + 0.05, z + hd - i + 0.03));
    bag.add('mud_plaster', box(x - hw + i - 0.03, y, z - hd + i - 0.02, x - hw + i + 0.03, y + 0.05, z + hd - i + 0.02)); bag.add('mud_plaster', box(x + hw - i - 0.03, y, z - hd + i - 0.02, x + hw - i + 0.03, y + 0.05, z + hd - i + 0.02));
  }
  for (const u of [-hw + 1.5, 0, hw - 1.5]) for (const sz of [-1, 1]) {
    const zf = sz < 0 ? z - hd - 0.06 : z + hd - 1.3 + 0.0;                               // the batter-following post: its face stands 0.06 off the earth's
    bag.add('timber', frustum([x + u - 0.13, zf, x + u + 0.13, zf + 1.36], 0, h, 0, 0, sz < 0 ? inset : 0, sz < 0 ? 0 : inset));
  }
  for (const u of [-1.1, 1.1]) for (const sx of [-1, 1]) {
    const xf = sx < 0 ? x - hw - 0.06 : x + hw - 1.3;
    bag.add('timber', frustum([xf, z + u - 0.13, xf + 1.36, z + u + 0.13], 0, h, sx < 0 ? inset : 0, sx < 0 ? 0 : inset, 0, 0));
  }
  // ── the deck: a timber floor a little wider than the base's top, a railing (pingzuo) of posts and two rails
  const dx = hw - inset + 0.5, dz = hd - inset + 0.5;                                      // half-sizes of the deck (4.1 × 3.1)
  bag.add('timber', box(x - dx, h - 0.25, z - dz, x + dx, h + 0.06, z + dz));
  const rx = dx - 0.12, rz = dz - 0.12, y0 = h + 0.06;
  for (let u = -rx; u <= rx + 0.01; u += rx / 4) for (const sz of [-1, 1]) bag.add('timber_red', box(x + u - 0.05, y0, z + sz * rz - 0.05, x + u + 0.05, y0 + 0.95, z + sz * rz + 0.05));
  for (let v = -rz + rz / 2; v < rz - 0.01; v += rz / 2) for (const sx of [-1, 1]) bag.add('timber_red', box(x + sx * rx - 0.05, y0, z + v - 0.05, x + sx * rx + 0.05, y0 + 0.95, z + v + 0.05));
  for (const [yy, m] of [[0.9, 'lacquer_black'], [0.5, 'timber']]) {
    for (const sz of [-1, 1]) bag.add(m, box(x - rx - 0.06, y0 + yy - 0.05, z + sz * rz - 0.04, x + rx + 0.06, y0 + yy + 0.05, z + sz * rz + 0.04));
    for (const sx of [-1, 1]) bag.add(m, box(x + sx * rx - 0.04, y0 + yy - 0.05, z - rz - 0.06, x + sx * rx + 0.04, y0 + yy + 0.05, z + rz + 0.06));
  }
  // ── the room: vermilion walls between red posts (the corners and two more on each long face), the plate above, lattice windows, a door toward the stair
  const ex = hw - 1.3, ez = hd - 1.3, rh = 2.65, ry = y0, plate = ry + rh;
  bag.add('palace_wall', box(x - ex, ry, z - ez, x + ex, plate, z + ez));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('timber_red', box(x + sx * ex - 0.17, ry, z + sz * ez - 0.17, x + sx * ex + 0.17, plate, z + sz * ez + 0.17));
  for (const u of [-ex / 3, ex / 3]) for (const sz of [-1, 1]) bag.add('timber_red', box(x + u - 0.12, ry, z + sz * ez - 0.1, x + u + 0.12, plate, z + sz * ez + 0.1));
  bag.add('lacquer_black', box(x - ex - 0.12, plate, z - ez - 0.12, x + ex + 0.12, plate + 0.4, z + ez + 0.12));
  for (const sz of [-1, 1]) windowOn(bag, true, z + sz * ez, sz, x, ry + 1.2, ry + 2.1, 1.3);
  windowOn(bag, false, x + out * ex, out, z, ry + 1.2, ry + 2.1, 1.3);
  const side = -out;                                                                       // the door faces the stair's axis
  leafOn(bag, false, x + side * ex, side, z - 0.62, z - 0.02, ry + 0.05, ry + 2.15); leafOn(bag, false, x + side * ex, side, z + 0.02, z + 0.62, ry + 0.05, ry + 2.15);
  bag.add('lacquer_black', box(Math.min(x + side * ex, x + side * (ex + 0.12)) - 0.0, ry + 2.15, z - 0.75, Math.max(x + side * ex, x + side * (ex + 0.12)) + 0.0, ry + 2.3, z + 0.75));
  // bracket sets on the plate (small ones), at the corners and the posts
  const ba = plate + 0.0;
  for (const u of [-ex, -ex / 3, ex / 3, ex]) for (const sz of [-1, 1]) bracketSet(bag, true, z + sz * (ez + 0.12), sz, x + u, ba - 0.12, 0.8);
  for (const v of [-ez, 0, ez]) for (const sx of [-1, 1]) bracketSet(bag, false, x + sx * (ex + 0.12), sx, z + v, ba - 0.12, 0.8);
  // ── the roof: grey tile, the eave's round tile-ends, a bird on the ridge
  const A = hw + 1.4, B = hd + 1.4, ey = h + 3.3 + 0.2, R = 3.0;
  hipRoof({ c: [x, z], A, B, y: ey, rise: R, lift: 0.2, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true }, { bag });
  for (let u = -A + 0.4; u < A - 0.3; u += 0.55) for (const sz of [-1, 1]) bag.add('terracotta', rod([x + u, ey - 0.3, z + sz * B], [x + u, ey - 0.02, z + sz * B], 0.1, 6));
  for (let v = -B + 0.7; v < B - 0.6; v += 0.55) for (const sx of [-1, 1]) bag.add('terracotta', rod([x + sx * A, ey - 0.3, z + v], [x + sx * A, ey - 0.02, z + v], 0.1, 6));
  bird(bag, x, ey + R + 0.74, z, out);
  // ── the subsidiary tower, outward: a lower battered base standing against the main one, a small room, a roof of its own
  const sh = 4.0, sw = 4.0, sd = 2.4, bi = 0.6, xin = x + out * (hw - 0.9), xfar = x + out * (hw - 0.9 + sw);
  const ox = Math.min(xin, xfar), ox1 = Math.max(xin, xfar);
  bag.add('earth_wall', frustum([ox, z - sd, ox1, z + sd], 0, sh, out > 0 ? 0 : bi, out > 0 ? bi : 0, bi, bi, { noBottom: true }));
  col.rect([ox, z - sd, ox1, z + sd], 0, sh);
  for (const sz of [-1, 1]) bag.add('granite_grey', box(ox, 0, sz < 0 ? z - sd - 0.2 : z + sd, ox1, 0.3, sz < 0 ? z - sd : z + sd + 0.2));
  bag.add('granite_grey', box(out > 0 ? ox1 : ox - 0.2, 0, z - sd - 0.2, out > 0 ? ox1 + 0.2 : ox, 0.3, z + sd + 0.2));
  for (let y = 0.7; y < sh - 0.3; y += 0.7) {
    const i = bi * y / sh, xo = out > 0 ? ox1 - i : ox + i;
    bag.add('mud_plaster', box(xo - 0.03, y, z - sd + i - 0.02, xo + 0.03, y + 0.05, z + sd - i + 0.02));
    for (const sz of [-1, 1]) bag.add('mud_plaster', box(out > 0 ? ox : ox + i, y, z + sz * (sd - i) - 0.03, out > 0 ? ox1 - i : ox1, y + 0.05, z + sz * (sd - i) + 0.03));
  }
  const sTop = sh + 0.06, szh = sd - 0.8, srw = 2.5, rxa = out > 0 ? x + 4.0 : x - 4.0 - srw, rxb = rxa + srw, rcx = (rxa + rxb) / 2;
  bag.add('brick_grey', box(out > 0 ? ox : ox + bi, sh, z - sd + bi, out > 0 ? ox1 - bi : ox1, sTop, z + sd - bi));
  bag.add('palace_wall', box(rxa, sTop, z - szh, rxb, sTop + 2.0, z + szh));
  for (const xx of [rxa, rxb]) for (const sz of [-1, 1]) bag.add('timber_red', box(xx - 0.15, sTop, z + sz * szh - 0.15, xx + 0.15, sTop + 2.0, z + sz * szh + 0.15));
  bag.add('lacquer_black', box(rxa - 0.1, sTop + 2.0, z - szh - 0.1, rxb + 0.1, sTop + 2.35, z + szh + 0.1));
  windowOn(bag, false, out > 0 ? rxb : rxa, out, z, sTop + 0.7, sTop + 1.5, 1.1);
  for (const sz of [-1, 1]) windowOn(bag, true, z + sz * szh, sz, rcx, sTop + 0.7, sTop + 1.5, 1.1);
  for (const sz of [-1, 1]) bracketSet(bag, true, z + sz * (szh + 0.1), sz, rcx, sTop + 2.0 - 0.12, 0.6);
  hipRoof({ c: [rcx, z], A: szh + 1.0, B: srw / 2 + 1.0, y: sTop + 2.35 + 0.2, rise: 1.5, lift: 0.15, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true, alongZ: true }, { bag });
}

/** A bird (the cresting of the que's ridge): a pedestal, a body, a neck and head, a beak, a fan of tail feathers. */
function bird(bag, x, y, z, dir) {
  bag.add('tile_dark', box(x - 0.18, y - 0.04, z - 0.18, x + 0.18, y + 0.3, z + 0.18));
  bag.add('bronze', lathe([[0.001, 0], [0.2, 0.06], [0.24, 0.22], [0.14, 0.42], [0.001, 0.48]], 10, null, x, y + 0.3, z));
  bag.add('bronze', rod([x + dir * 0.05, y + 0.62, z], [x + dir * 0.32, y + 1.0, z], 0.07, 6));
  bag.add('bronze', lathe([[0.001, 0], [0.1, 0.05], [0.1, 0.16], [0.001, 0.2]], 8, null, x + dir * 0.34, y + 0.96, z));
  bag.add('bronze', rod([x + dir * 0.38, y + 1.05, z], [x + dir * 0.62, y + 1.0, z], 0.03, 5));
  for (const a of [-0.5, 0, 0.5]) bag.add('bronze', rod([x - dir * 0.15, y + 0.5, z], [x - dir * 0.7, y + 0.8 + a * 0.2, z + a * 0.4], 0.035, 5));
}

/** qin_court: {} — the terrace's paving and drains, the galleries and lamp-posts of the forecourt, banner staffs, incense burners. */
export function qinCourt(el, { bag, col, lights }) {
  const { x0, z0, x1, z1 } = TERRACE, sx = STAIR.x, sw = STAIR.w / 2;
  // the terrace's paving of grey brick round the hall (the hall has its own floor), with drains along the south coping
  bag.add('brick_grey', box(x0 + 0.7, TOP, z0 + 0.7, x1 - 0.7, TOP + 0.04, HALL.z0 - 0.05));
  bag.add('brick_grey', box(x0 + 0.7, TOP, HALL.z1 + 0.05, x1 - 0.7, TOP + 0.04, z1 - 0.7));
  bag.add('brick_grey', box(x0 + 0.7, TOP, HALL.z0, HALL.x0 - 0.05, TOP + 0.04, HALL.z1)); bag.add('brick_grey', box(HALL.x1 + 0.05, TOP, HALL.z0, x1 - 0.7, TOP + 0.04, HALL.z1));
  for (let x = x0 + 8; x < x1 - 4; x += 12) { if (Math.abs(x - sx) < sw + 1) continue; bag.add('bronze', rod([x, TOP + 0.3, z1], [x, TOP + 0.1, z1 + 1.2], 0.1, 6)); bag.add('granite_grey', box(x - 0.35, 0, z1 + 0.9, x + 0.35, 0.12, z1 + 2.4)); }   // the dragon-head spouts and their stones
  for (const s of [-1, 1]) for (const dz of [-10, 10]) { const bx = (x0 + x1) / 2 + s * 16, bz = (HALL.z0 + HALL.z1) / 2 + dz * 1.4; bag.add('granite_grey', lathe([[0.5, 0], [0.45, 0.5], [0.5, 0.6], [0.001, 0.6]], 10, null, bx, TOP, bz)); bag.add('bronze', lathe([[0.001, 0.6], [0.4, 0.64], [0.5, 0.9], [0.001, 0.95]], 10, null, bx, TOP, bz)); col.circle(bx, bz, 0.55, TOP, TOP + 1.0); }
  // the forecourt: lamp-posts with bronze lamps along the stair's axis and banner staffs along the sides
  const [fx0, fz0, fx1, fz1] = FORECOURT;
  for (const s of [-1, 1]) for (let z = fz0 + 14; z < fz1 - 6; z += 9) {
    const lx = sx + s * 9;
    bag.add('granite_grey', lathe([[0.3, 0], [0.26, 0.4]], 8, null, lx, 0.02, z)); bag.add('bronze', lathe([[0.07, 0], [0.05, 2.4], [0.22, 2.5], [0.001, 2.7]], 8, null, lx, 0.4, z));
    bag.add('flame', lathe([[0.001, 0], [0.08, 0.1], [0.001, 0.35]], 6, null, lx, 2.9, z)); col.circle(lx, z, 0.3, 0, 3); lights.push({ at: [lx, 3.1, z], color: '#ffb468', intensity: 1.6, distance: 10 });
  }
  for (const x of [fx0 + 6, fx0 + 22, fx1 - 22, fx1 - 6]) {
    bag.add('log_pine', lathe([[0.12, 0], [0.1, 9.0]], 8, null, x, 0.02, fz0 + 8)); bag.add('timber', box(x - 0.9, 8.3, fz0 + 7.96, x + 0.9, 8.38, fz0 + 8.04));
    addCloth(bag, 'cloth_black', clothBox(x - 0.85, 4.6, fz0 + 7.95, x + 0.85, 8.3, fz0 + 8.05), 8.3); col.circle(x, fz0 + 8, 0.2, 0, 9);
  }
  // two long galleries along the north of the court, open to the south: a rammed base, posts, a tiled roof, benches for those who wait
  for (const [gx0, gx1] of [[fx0 + 1, sx - 22], [sx + 22, fx1 - 1]]) {
    const F = frame([gx0, -64, gx1, -57], 's', bag, col), W = F.W;
    F.b('earth_wall', 0, 0, 0, W, 0.45, 7.0, false); col.floor([gx0, -64, gx1, -57], 0.45);
    F.b('earth_wall', 0, 0.45, 6.4, W, 3.2, 7.0); F.b('earth_wall', 0, 0.45, 0, 0.6, 3.2, 7.0); F.b('earth_wall', W - 0.6, 0.45, 0, W, 3.2, 7.0);
    for (let u = 3; u < W; u += 4) F.b('timber_red', u - 0.17, 0.45, 0.2, u + 0.17, 3.2, 0.54);
    F.b('lacquer_black', 0, 3.2, 0.05, W, 3.6, 0.6, false);
    gable(F, 0, 0, W, 7.0, 3.6, 1.6, 'tile_grey', 0.9);
    for (let u = 0.3; u < W; u += 0.3) F.b('tile_dark', u - 0.06, 3.58, -0.92, u + 0.06, 3.73, -0.86, false);
    for (let u = 6; u < W - 4; u += 9) F.b('timber', u, 0.45, 1.5, u + 2.2, 0.9, 2.0);
    for (let u = 2; u < W - 2; u += 5) F.b('reed_mat', u, 0.45, 3.5, u + 2.4, 0.48, 5.5, false);
  }
}
