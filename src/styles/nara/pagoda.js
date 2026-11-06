// A Nara-period seven-storey pagoda on a square plan (docs/settlements/nara.md §4): the Tōdai-ji
// pagodas, east and west, three bays a side (the excavated east pagoda: about 5.4 + 6 + 5.4 m),
// each storey a little smaller than the one below; vermilion posts with a white plastered wall
// between them, a door in the middle bay of each face and barred windows in the side bays, the
// head beams, bracket sets of three steps on every post and stepping diagonally out at the corners,
// deep hipped eaves of grey tile; on the top roof the spire (sōrin): the dew basin, the inverted
// bowl, the lotus, nine rings, the water flame, the dragon wheel and the jewel.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof } from '../ming/index.js';
import { bracketSet } from '../chinese/index.js';
import { plate } from '../japanese/shape.js';

/**
 * pagoda_jp { c, y, base: { half, h }, side (first storey), shrink (per storey), tiers (7), h0
 * (first storey's wall), dh (its decrease), over (eave overhang), spire (height) }.
 */
export function pagodaJp(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, n = el.tiers ?? 7, B0 = el.base;
  let y = el.y ?? 0;
  // the platform of dressed stone, with steps on its four sides
  bag.add('granite_block', box(cx - B0.half, y, cz - B0.half, cx + B0.half, y + B0.h, cz + B0.half));
  bag.add('granite_block', box(cx - B0.half - 0.25, y, cz - B0.half - 0.25, cx + B0.half + 0.25, y + 0.25, cz + B0.half + 0.25));
  col.rect([cx - B0.half, cz - B0.half, cx + B0.half, cz + B0.half], y, y + B0.h); col.floor([cx - B0.half, cz - B0.half, cx + B0.half, cz + B0.half], y + B0.h);
  for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const ns = Math.ceil(B0.h / 0.2), w = 1.8;
    for (let k = 0; k < ns; k++) {
      const o = B0.half + 0.35 * (ns - k), yy = y + (k + 1) * B0.h / ns;
      const r = dz ? [cx - w, cz + dz * (B0.half), cx + w, cz + dz * o] : [cx + dx * B0.half, cz - w, cx + dx * o, cz + w];
      bag.add('granite_block', box(Math.min(r[0], r[2]), y, Math.min(r[1], r[3]), Math.max(r[0], r[2]), yy, Math.max(r[1], r[3])));
    }
  }
  y += B0.h;
  const side = (i) => el.side - i * el.shrink;
  for (let i = 0; i < n; i++) {
    const s = side(i), hs = s / 2, H = el.h0 - i * el.dh, last = i === n - 1;
    const [x0, z0, x1, z1] = [cx - hs, cz - hs, cx + hs, cz + hs];
    // the wall: white plaster set in from the posts; the posts, the sill and the two head beams
    const red = [], wall = [], dark = [], lat = [];
    const yf = y - 0.06;                                                         // the foot, a little sunk into what is below
    wall.push(box(x0 + 0.12, yf, z0 + 0.12, x1 - 0.12, y + H, z1 - 0.12));
    const bays = [0, 0.32, 0.68, 1].map((t) => -hs + t * s), seen = new Set();
    for (const a of bays) for (const b of [-hs, hs]) for (const [px, pz] of [[a, b], [b, a]]) {
      const key = px.toFixed(3) + ',' + pz.toFixed(3);
      if (seen.has(key)) continue; seen.add(key);
      red.push(box(cx + px - 0.28, yf, cz + pz - 0.28, cx + px + 0.28, y + H, cz + pz + 0.28));
    }
    for (const [yy, hh] of [[yf, 0.36], [y + H - 0.5, 0.4], [y + H - 1.3, 0.3]]) {
      red.push(box(x0 - 0.05, yy, z0 - 0.05, x1 + 0.05, yy + hh, z0 + 0.12)); red.push(box(x0 - 0.05, yy, z1 - 0.12, x1 + 0.05, yy + hh, z1 + 0.05));
      red.push(box(x0 - 0.05, yy, z0 + 0.12, x0 + 0.12, yy + hh, z1 - 0.12)); red.push(box(x1 - 0.12, yy, z0 + 0.12, x1 + 0.05, yy + hh, z1 - 0.12));
    }
    // the doors in the middle bays (two leaves with rows of studs), barred windows in the side bays
    for (const [nx, nz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const ux = nz ? 1 : 0, uz = nz ? 0 : 1, f = (o) => [cx + nx * (hs + o), cz + nz * (hs + o)];
      const A = (t0, t1, o0, o1, ya, yb) => { const p = f(o0), q = f(o1); const xa = p[0] + ux * t0, xb = q[0] + ux * t1, za = p[1] + uz * t0, zb = q[1] + uz * t1; return box(Math.min(xa, xb), ya, Math.min(za, zb), Math.max(xa, xb), yb, Math.max(za, zb)); };
      const dw = s * 0.18 - 0.4, yd = y + H - 1.3;
      red.push(A(-dw, dw, -0.1, 0.06, y + 0.3, yd + 0.05));
      for (let r = 0; r < 5; r++) for (const sx of [-1, 1]) for (let c = 0; c < 3; c++) dark.push(A(sx * (dw * (0.2 + c * 0.3)) - 0.05, sx * (dw * (0.2 + c * 0.3)) + 0.05, 0.06, 0.1, y + 0.6 + r * (yd - y - 0.9) / 4.5, y + 0.7 + r * (yd - y - 0.9) / 4.5));
      red.push(A(-0.03, 0.03, 0.06, 0.09, y + 0.3, yd + 0.05));
      if (i === 0) for (const sd of [-1, 1]) {
        const mc = sd * s * 0.34, ww = s * 0.16 - 0.45, wy0 = y + H * 0.35, wy1 = yd - 0.15;
        lat.push(A(mc - ww, mc + ww, -0.1, 0.03, wy0, wy1));
        for (let b = 0; b <= 8; b++) { const t = mc - ww + b * 2 * ww / 8; red.push(A(t - 0.05, t + 0.05, 0.03, 0.12, wy0, wy1)); }
      }
    }
    col.rect([x0, z0, x1, z1], y, y + H);
    // the bracket sets on the posts, outward; at the corners stepping diagonally
    const yt = y + H;
    for (const a of bays) for (const [nx, nz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const corner = Math.abs(a) > hs - 0.01, at = nz ? [cx + a, cz + nz * hs] : [cx + nx * hs, cz + a];
      if (corner) { if (nz) bracketSet({ at, y: yt, dir: [Math.sign(a) * Math.SQRT1_2, nz * Math.SQRT1_2], tiers: 3, step: 0.62, mat: 'timber_red', blockMat: 'timber_red' }, ctx); continue; }
      bracketSet({ at, y: yt, dir: [nx, nz], tiers: 3, step: 0.62, mat: 'timber_red', blockMat: 'timber_red' }, ctx);
    }
    for (const g of red) bag.add('timber_red', g);
    for (const g of wall) bag.add('plaster_white', g);
    for (const g of dark) bag.add('gilt_bronze', g);
    for (const g of lat) bag.add('lacquer_black', g);
    // the eave: a hipped roof from the bracket top out over the overhang, open where the next storey rises
    const ye = yt + 1.5, O = el.over - i * 0.12, Bh = hs + O, R = Bh * (last ? 0.62 : 0.42), p = 1.25;
    const next = last ? null : side(i + 1) / 2;
    rectRoof({ c: [cx, cz], A: Bh, B: Bh, y: ye, rise: R, kind: 'hip', sweep: 0.55, p, curl: false, mat: 'tile_grey', soffit: 'timber_red', hole: next ? [cx - next, cz - next, cx + next, cz + next] : undefined }, bag);
    // the frieze between the wall's head and the roof's underside, closing the bracket zone
    const under = ye + R * Math.pow(O / Bh, p) - 0.1;
    bag.add('plaster_white', box(x0 + 0.3, yt, z0 + 0.3, x1 - 0.3, under, z1 - 0.3));
    y = next ? ye + R * Math.pow((Bh - next) / Bh, p) - 0.15 : ye + R;
  }
  // the spire on the top roof's apex
  spire(bag, cx, y - 0.4, cz, el.spire ?? 16);
}

function spire(bag, x, y, z, H) {
  const s = H / 16, G = 'gilt_bronze', out = [];
  bag.add(G, box(x - 1.0 * s, y, z - 1.0 * s, x + 1.0 * s, y + 0.9 * s, z + 1.0 * s));                                      // the dew basin (roban)
  bag.add(G, lathe([[0.95 * s, 0], [0.92 * s, 0.4 * s], [0.6 * s, 0.75 * s], [0.18 * s, 0.85 * s]], 16, null, x, y + 0.9 * s, z));   // the inverted bowl
  bag.add(G, lathe([[0.2 * s, 0], [0.75 * s, 0.35 * s], [0.8 * s, 0.5 * s], [0.18 * s, 0.55 * s]], 16, (th) => 1 + 0.1 * Math.abs(Math.cos(th * 4)), x, y + 1.75 * s, z));   // the lotus
  bag.add(G, lathe([[0.14 * s, 0], [0.14 * s, H - 2.3 * s], [0.001, H - 2.3 * s]], 8, null, x, y + 2.3 * s, z));            // the mast
  for (let k = 0; k < 9; k++) {
    const r = (0.78 - k * 0.035) * s, yy = y + 2.6 * s + k * 0.78 * s;
    bag.add(G, lathe([[0.15 * s, 0], [r, 0.04 * s], [r, 0.16 * s], [0.15 * s, 0.2 * s]], 20, null, x, yy, z));           // the nine rings
  }
  const yf = y + 2.6 * s + 9 * 0.78 * s;
  for (let k = 0; k < 4; k++) {                                                                                              // the water flame (suien), four openwork leaves
    const a = k * Math.PI / 2 + Math.PI / 4, d = [Math.cos(a), Math.sin(a)], sv = [-d[1], 0, d[0]], P = (r, v) => [x + d[0] * r * s, yf + v * s, z + d[1] * r * s];
    plate(out, [P(0.12, 0), P(0.55, 0.3), P(0.75, 0.8), P(0.6, 1.3), P(0.35, 1.6), P(0.12, 1.75)], sv, 0.04 * s);
  }
  bag.add(G, lathe([[0.2 * s, 0], [0.32 * s, 0.12 * s], [0.2 * s, 0.24 * s]], 12, null, x, yf + 1.85 * s, z));          // the dragon wheel
  bag.add(G, lathe([[0.001, 0], [0.18 * s, 0.1 * s], [0.24 * s, 0.3 * s], [0.16 * s, 0.5 * s], [0.001, 0.68 * s]], 12, null, x, yf + 2.15 * s, z));   // the jewel
  bag.add(G, fromTriangles(out));
}
