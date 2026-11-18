// The Hall of Supreme Harmony's doors, seen from the terrace: real lattice leaves (docs/settlements/qing-beijing.md §36).
// bj_hall wraps the style's qing_hall and leaves out its front lattice (a texture on a flat slab); bj_hall_doors then
// hangs, bay by bay, the six leaves of each door with their frames, skirt panels, waist panels, the three-crossing
// six-petal lattice (sanjiao liuwan) of bars and gilt bosses, the gilt corner plates, and the transom windows above.
// Elements of style `qing`, registered here (the style's own files are read-only).
import { STYLES } from '../../core/build.js';
import { fromTriangles, orientOutward, box } from '../../core/geom.js';
import { Parts } from '../../styles/qing/carving.js';
import { onBuildStart } from '../../core/build-reset.js';

const DROP = '__drop';
let JIT = 0;
onBuildStart(() => { JIT = 0; });                                     // a hair of difference in each piece: pieces of one shape would be drawn as instances of their own (a draw each), these are merged with the hall's meshes
const S3 = Math.sqrt(3) / 2;

/** A convex prism of the polygon `poly` ([u, v] points) from depth z0 to z1, no back face; its triangles pushed into `out`. */
function prism(out, poly, z0, z1) {
  const t = [], n = poly.length;
  for (let i = 1; i < n - 1; i++) t.push(poly[0][0], poly[0][1], z1, poly[i][0], poly[i][1], z1, poly[i + 1][0], poly[i + 1][1], z1);
  for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n]; t.push(a[0], a[1], z0, b[0], b[1], z0, b[0], b[1], z1, a[0], a[1], z0, b[0], b[1], z1, a[0], a[1], z1); }
  orientOutward(t);
  for (let i = 0; i < t.length; i++) out.push(t[i]);
}
/** A bar of width w from a to b (no end caps), depth z0..z1. */
function bar(out, a, b, w, z0, z1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
  prism(out, [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], z0, z1);
}
const hex = (c, r) => Array.from({ length: 6 }, (_, i) => [c[0] + r * Math.cos(i * Math.PI / 3), c[1] + r * Math.sin(i * Math.PI / 3)]);
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

/** The segment of the line p0 + t·d inside [x0, y0, x1, y1], or null. */
function clip(p0, d, x0, y0, x1, y1) {
  let t0 = -1e9, t1 = 1e9;
  for (const [p, q, lo, hi] of [[p0[0], d[0], x0, x1], [p0[1], d[1], y0, y1]]) {
    if (Math.abs(q) < 1e-9) { if (p < lo || p > hi) return null; continue; }
    let a = (lo - p) / q, b = (hi - p) / q; if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
  }
  return t1 - t0 > 0.02 ? [[p0[0] + d[0] * t0, p0[1] + d[1] * t0], [p0[0] + d[0] * t1, p0[1] + d[1] * t1]] : null;
}

/**
 * The three-crossing six-petal lattice of a window or leaf in the rectangle [x0, y0, x1, y1]: bars along the three
 * directions of a triangular grid of side a (so that three bars cross at every node, and six triangles meet), a gilt
 * six-sided boss at each node; the paper behind (both faces).
 */
function lattice(M, x0, y0, x1, y1, a, bw = 0.026, zb = 0.0, zt = 0.045, bosses = true) {
  const h = a * S3, ox = (x0 + x1) / 2, oy = (y0 + y1) / 2, red = M('lacquer_red'), gilt = M('gilt_bronze'), paper = M('marble_smooth');
  // the paper: one quad each way
  const j = (JIT++ % 997) * 0.0004, quadT = (z, flip) => { const A = [x0, y0, z], B = [x1 + j, y0, z], C = [x1 + j, y1, z], D = [x0, y1, z]; return flip ? [...A, ...C, ...B, ...A, ...D, ...C] : [...A, ...B, ...C, ...A, ...C, ...D]; };
  paper.push(...quadT(zb, false), ...quadT(zb - 0.002, true));
  const n = 1 / 2;
  // family 0: horizontal rows
  for (let k = Math.ceil((y0 - oy) / h); oy + k * h <= y1; k++) { const y = oy + k * h; if (y > y0 + 0.01 && y < y1 - 0.01) bar(red, [x0, y], [x1, y], bw, zb, zt); }
  // families 1 and 2: the lines at ±60°, through the lattice points (ox + i·a, oy)
  for (const sgn of [1, -1]) {
    const d = [sgn * n, S3], nrm = [S3, -sgn * n];
    const cMin = Math.min(...[[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => nrm[0] * (x - ox) + nrm[1] * (y - oy)));
    const cMax = Math.max(...[[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => nrm[0] * (x - ox) + nrm[1] * (y - oy)));
    for (let i = Math.ceil(cMin / h); i * h <= cMax; i++) {
      const p0 = [ox + nrm[0] * i * h, oy + nrm[1] * i * h], s = clip(p0, d, x0, y0, x1, y1);
      if (s) bar(red, s[0], s[1], bw, zb, zt);
    }
  }
  // the bosses at the nodes
  const rows = Math.floor((y1 - oy) / h), rows0 = Math.ceil((y0 - oy) / h);
  for (let j = rows0; bosses && j <= rows; j++) {
    const y = oy + j * h, off = (j & 1) ? a / 2 : 0;
    for (let i = Math.ceil((x0 - ox - off) / a); ox + off + i * a <= x1; i++) {
      const x = ox + off + i * a;
      if (x > x0 + 0.04 && x < x1 - 0.04 && y > y0 + 0.04 && y < y1 - 0.04) { const hx = hex([x, y], 0.036); for (let q = 1; q < 5; q++) gilt.push(hx[0][0], hx[0][1], zt + 0.014, hx[q][0], hx[q][1], zt + 0.014, hx[q + 1][0], hx[q + 1][1], zt + 0.014); }
    }
  }
}

/** One door leaf, w × h, built at its own origin (back plane z = 0, the frame 9 cm deep toward +z): returns { mat: [triangles] }. */
function leaf(w, h) {
  const m = new Map(), M = (k) => { if (!m.has(k)) m.set(k, []); return m.get(k); };
  const red = M('lacquer_red'), gilt = M('gilt_bronze');
  const sw = 0.075, dF = 0.09;                                    // the stiles' width, the frame's depth
  const add = (out, x0, y0, z0, x1, y1, z1) => { const g = box(x0, y0, z0, x1, y1, z1).attributes.position.array; for (let i = 0; i < g.length; i++) out.push(g[i]); };
  add(red, 0, 0, 0, sw, h, dF); add(red, w - sw, 0, 0, w, h, dF);
  const iw0 = sw, iw1 = w - sw, cx = w / 2;
  // from the foot: rail, skirt panel (qunban), rail, waist panel (daohuanban), rail, the lattice, rail, upper waist panel, head rail
  const hSkirt = Math.min(1.0, h * 0.18), hWaist = 0.26, rail = 0.085;
  let y = 0;
  const railAt = (yy, d = dF - 0.012) => { add(red, iw0, yy, 0, iw1, yy + rail, d); };
  railAt(y); y += rail;
  const ySk0 = y, ySk1 = y + hSkirt; y = ySk1;
  railAt(y); y += rail;
  const yW0 = y, yW1 = y + hWaist; y = yW1;
  railAt(y); y += rail;
  const yL0 = y;
  const yT1 = h - rail, yW3 = yT1 - hWaist, yL1 = yW3 - rail;
  railAt(yL1);                                                   // the rail under the upper waist panel
  railAt(yT1 - 0.0); void yT1;
  // panels: a flat board in the frame, a raised field on it, a gilt emblem on that
  const panel = (y0, y1, emblem) => {
    add(red, iw0, y0, 0, iw1, y1, 0.04);
    add(red, iw0 + 0.06, y0 + 0.05, 0.04, iw1 - 0.06, y1 - 0.05, 0.062);
    if (emblem === 'skirt') {
      const ym = (y0 + y1) / 2, rx = (iw1 - iw0) * 0.3, ry = (y1 - y0) * 0.3;
      prism(gilt, [[cx, ym - ry], [cx + rx, ym], [cx, ym + ry], [cx - rx, ym]], 0.062, 0.072);                // the rhombus medallion
      prism(red, [[cx, ym - ry * 0.6], [cx + rx * 0.6, ym], [cx, ym + ry * 0.6], [cx - rx * 0.6, ym]], 0.072, 0.08);
      for (const [px, py] of [[iw0 + 0.12, y0 + 0.12], [iw1 - 0.12, y0 + 0.12], [iw0 + 0.12, y1 - 0.12], [iw1 - 0.12, y1 - 0.12]]) prism(gilt, [[px - 0.04, py], [px, py - 0.04], [px + 0.04, py], [px, py + 0.04]], 0.062, 0.07);   // the corner cloud heads, as lozenges
    } else prism(gilt, hex([cx, (y0 + y1) / 2], 0.065), 0.062, 0.071);                                  // a small roundel
  };
  panel(ySk0, ySk1, 'skirt'); panel(yW0, yW1, 'waist'); panel(yW3, yT1, 'waist');
  // the lattice
  lattice(M, iw0 + 0.035, yL0 + 0.035, iw1 - 0.035, yL1 - 0.035, 0.3, 0.03);
  // the lattice's inner frame (a slimmer moulding round it)
  add(red, iw0, yL0, 0, iw0 + 0.035, yL1, 0.07); add(red, iw1 - 0.035, yL0, 0, iw1, yL1, 0.07);
  add(red, iw0, yL0, 0, iw1, yL0 + 0.035, 0.07); add(red, iw0, yL1 - 0.035, 0, iw1, yL1, 0.07);
  // the gilt corner plates (kanye) where the rails meet the stiles
  for (const yy of [0, rail + hSkirt, yL0 - rail, yL1, yT1 - 0.0]) for (const [xx, f] of [[0, 1], [w, -1]]) add(gilt, xx + (f > 0 ? 0 : -0.1), yy + (yy === 0 ? 0.0 : 0), 0.0, xx + (f > 0 ? 0.1 : 0), yy + rail + 0.01, dF + 0.012);
  return m;
}

/** A window panel (no frame leaf): the lattice in a plain frame, w × h; at its origin, back plane z = 0. */
function windowPanel(w, h) {
  const m = new Map(), M = (k) => { if (!m.has(k)) m.set(k, []); return m.get(k); }, red = M('lacquer_red'), f = 0.07;
  const add = (x0, y0, z0, x1, y1, z1) => { const g = box(x0, y0, z0, x1, y1, z1).attributes.position.array; for (let i = 0; i < g.length; i++) red.push(g[i]); };
  add(0, 0, 0, f, h, 0.08); add(w - f, 0, 0, w, h, 0.08); add(f, 0, 0, w - f, f, 0.08); add(f, h - f, 0, w - f, h, 0.08);
  lattice(M, f, f, w - f, h - f, 0.3, 0.03, 0.0, 0.045, false);
  return m;
}

function emit(bag, m, x, y, z, merged = []) {
  const P = new Parts(), k = (JIT++ % 4001) * 0.0003;
  for (const [mat, t] of m) {
    if (!t.length) continue;
    // the pieces to be merged get a speck of their own behind the leaf (inside the wall), so that no two are the same shape
    const q = merged.includes(mat) ? [...t, 0, 0, -0.02, 0.01 + k, 0, -0.02, 0, 0.01, -0.02 + k] : t;
    P.add(mat, fromTriangles(q));
  }
  P.emit(bag, x, y, z);
}

/** A bag that leaves out one material. */
function without(bag, mat) {
  const w = Object.create(bag);
  w.add = (k, g) => { if (k !== mat) bag.add(k, g); };
  return w;
}

/** bj_hall: qing_hall with the lattice of the front side left out (bj_hall_doors hangs it). */
function bjHall(el, ctx) {
  const side = el.front || 's';
  STYLES.qing.elements.qing_hall({ ...el, lat: { ...(typeof el.lat === 'object' ? el.lat : {}), [side]: DROP } }, { ...ctx, bag: without(ctx.bag, DROP) });
}

/**
 * bj_hall_doors: the leaves of the front of a tall hall { rect, y, H, bays: [n, d], skip: [bay indices left open] } (south side only).
 * Bays as mingHall lays them out; the doors run from the floor to hd, the transom windows above the tie beam.
 */
function bjHallDoors(el, { bag }) {
  const [x0, , x1, z1] = el.rect, y = el.y, H = el.H, nb = el.bays[0], skip = el.skip ?? [Math.floor(nb / 2)];
  const hd = Math.min(H - 0.5, 5.5 + (H - 8) * 0.15), span = H - 1.0 - hd, cw = 0.45;       // the columns' clearance
  const nLeaf = el.leaves ?? 6, pitch = (x1 - x0) / nb, lw = (pitch - 2 * cw) / nLeaf;
  const nw = 3, ww = (pitch - 2 * cw) / nw, wh = span * 0.42;
  const yWin = y + hd + 0.45 + span * 0.3;
  for (let i = 0; i < nb; i++) {
    const bx = x0 + pitch * i + cw;
    if (!skip.includes(i)) for (let j = 0; j < nLeaf; j++) emit(bag, leaf(lw, hd - 0.12), bx + j * lw, y + 0.04, z1 + 0.07, ['gilt_bronze']);
    for (let j = 0; j < nw; j++) emit(bag, windowPanel(ww, wh), bx + j * ww, yWin, z1 + 0.15, ['gilt_bronze', 'lacquer_red']);
  }
}

STYLES.qing.elements.bj_hall = bjHall;
STYLES.qing.elements.bj_hall_doors = bjHallDoors;
