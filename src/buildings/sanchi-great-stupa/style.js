// The Great Stupa's own pieces, on top of the early Indian style (src/styles/indian): the harmika and the chattra
// rebuilt as the stonework of a vedika in small — a square railing of lens-sectioned posts, three lens-shaped crossbars
// in each bay and a rounded coping, on a moulded plinth — round the pedestal of the shaft and its three stone parasols,
// each a disc with a rim and a curved top on a collar. docs/buildings/sanchi-great-stupa.md §4, §8.

import '../../styles/chinese/index.js';
import '../../styles/indian/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

/** The base stupa, with its own harmika and parasols left out (all of them stand above the flattened top). */
function stupa(el, ctx) {
  const s = el.s ?? 1, y = el.y ?? 0, [cx, cz] = el.c, TOP = 16.46 * s, hm = 2.3 * s;
  const keep = {
    add(mat, g) {
      g.computeBoundingBox();
      const b = g.boundingBox;
      if (b.min.y >= y + TOP - 0.01 && b.min.x >= cx - hm - 0.4 && b.max.x <= cx + hm + 0.4 && b.min.z >= cz - hm - 0.4 && b.max.z <= cz + hm + 0.4) return;
      ctx.bag.add(mat, g);
    },
  };
  STYLES.indian.elements.stupa(el, { ...ctx, bag: keep });
  harmika({ c: el.c, y: y + TOP, s }, ctx);
}

/**
 * The harmika { c, y (the flattened top), s }: a square plinth with a moulded edge; a railing of posts (lens-shaped in
 * section, their faces bevelled) with three crossbars of lens section between each pair, under a coping rounded on top;
 * a gap-less square, as on the reconstructed harmika; within it a square pedestal and the shaft with three parasols
 * diminishing upward. [stated: the harmika as a square railing and the triple chattra (dossier §4); the vedika's
 * construction from the ground railing; sizes inferred]
 */
function harmika(el, { bag }) {
  const [cx, cz] = el.c, s = el.s, y = el.y, hm = 2.3 * s, R = 'sandstone_rail', D = 'sandstone_dressed';
  const out = [], cop = [], ped = [];
  // the plinth: a slab and a moulded edge stepping in
  hexa(out, ...sq(cx, cz, hm + 0.35 * s, hm + 0.35 * s, y - 0.12, y + 0.18 * s));
  hexa(out, ...sq(cx, cz, hm + 0.35 * s, hm + 0.22 * s, y + 0.18 * s, y + 0.3 * s));
  const yb = y + 0.3 * s, ph = 1.35 * s, pw = 0.11 * s;
  for (let side = 0; side < 4; side++) {
    const a = side * Math.PI / 2, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
    // the side runs from corner to corner along u, at distance hm along n
    const P = (t, d, yy) => [cx + n[0] * (hm + d) + u[0] * t, yy, cz + n[1] * (hm + d) + u[1] * t];
    const np = 7;
    for (let k = 0; k < np; k++) {
      const t = -hm + 2 * hm * k / np;
      // a post: an octagon-like lens (bevelled corners) from the plinth to the coping
      lens(out, P, t, pw * 1.2, pw, yb, yb + ph);
    }
    // three crossbars of lens section in each bay, mortised into the posts
    for (let k = 0; k < np; k++) {
      const t0 = -hm + 2 * hm * k / np + pw * 1.0, t1 = -hm + 2 * hm * (k + 1) / np - pw * 1.0;
      for (let b = 0; b < 3; b++) {
        const y0 = yb + ph * (0.14 + b * 0.25), y1 = y0 + ph * 0.17;
        const ym = (y0 + y1) / 2, e = pw * 0.55;
        // lens: thin at top and bottom, fullest at the middle
        hexa(out, [P(t0, -e * 0.25, y0), P(t1, -e * 0.25, y0), P(t1, e * 0.25, y0), P(t0, e * 0.25, y0)], [P(t0, -e, ym), P(t1, -e, ym), P(t1, e, ym), P(t0, e, ym)]);
        hexa(out, [P(t0, -e, ym), P(t1, -e, ym), P(t1, e, ym), P(t0, e, ym)], [P(t0, -e * 0.25, y1), P(t1, -e * 0.25, y1), P(t1, e * 0.25, y1), P(t0, e * 0.25, y1)]);
      }
    }
    // the coping: a flat underside, vertical faces, a rounded top, mitred at the corners
    const yc = yb + ph, cw = pw * 1.7, ch = 0.26 * s;
    const C = (t, d, yy) => P(t, d, yy);
    const prof = [[-cw, 0], [cw, 0], [cw, ch * 0.55], [cw * 0.7, ch * 0.88], [0, ch], [-cw * 0.7, ch * 0.88], [-cw, ch * 0.55]];
    for (let i = 0; i < prof.length; i++) {
      const [d0, h0] = prof[i], [d1, h1] = prof[(i + 1) % prof.length];
      // ends mitred: at t = ±(hm + d)
      const tA = (d) => -(hm + d), tB = (d) => hm + d;
      cop.push(...C(tA(d0), d0, yc + h0), ...C(tB(d0), d0, yc + h0), ...C(tB(d1), d1, yc + h1));
      cop.push(...C(tA(d0), d0, yc + h0), ...C(tB(d1), d1, yc + h1), ...C(tA(d1), d1, yc + h1));
    }
  }
  // the corner posts, square, a little taller than the coping's foot
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) out.push(...boxTris(cx + sx * hm, cz + sz * hm, pw * 1.3, yb, yb + ph + 0.02));
  // orient the coping's triangles outward from the harmika's axis line (each run is convex about its own centre)
  for (let i = 0; i < cop.length; i += 9) {
    const ux = cop[i + 3] - cop[i], uy = cop[i + 4] - cop[i + 1], uz = cop[i + 5] - cop[i + 2];
    const vx = cop[i + 6] - cop[i], vy = cop[i + 7] - cop[i + 1], vz = cop[i + 8] - cop[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (cop[i] + cop[i + 3] + cop[i + 6]) / 3, my = (cop[i + 1] + cop[i + 4] + cop[i + 7]) / 3, mz = (cop[i + 2] + cop[i + 5] + cop[i + 8]) / 3;
    // the run's centre line: the nearest point at distance hm from the axis on the dominant side, at mid-height
    const dx = mx - cx, dz = mz - cz, onX = Math.abs(dx) > Math.abs(dz);
    const rx = onX ? cx + Math.sign(dx) * hm : mx, rz = onX ? mz : cz + Math.sign(dz) * hm, ry = yb + ph + 0.13 * s;
    if (nx * (mx - rx) + ny * (my - ry) + nz * (mz - rz) < 0) for (let k = 0; k < 3; k++) { const t = cop[i + 3 + k]; cop[i + 3 + k] = cop[i + 6 + k]; cop[i + 6 + k] = t; }
  }
  // the pedestal of the shaft
  hexa(ped, ...sq(cx, cz, 0.55 * s, 0.55 * s, y + 0.29 * s, y + 0.75 * s));
  hexa(ped, ...sq(cx, cz, 0.62 * s, 0.62 * s, y + 0.75 * s, y + 0.86 * s));
  bag.add(R, fromTriangles(out));
  bag.add(R, fromTriangles(cop));
  bag.add(D, fromTriangles(ped));
  // the shaft, octagonal, and the three parasols: a collar, a disc with a rim, a curved top; a finial on the last
  bag.add(R, lathe([[0.17 * s, 0], [0.15 * s, 3.9 * s], [0.001, 3.9 * s]], 8, null, cx, y + 0.86 * s, cz));
  for (const [d, h] of [[3.6, 2.6], [3.0, 3.6], [2.4, 4.5]]) {
    const r = d / 2 * s, yy = y + h * s;
    bag.add(D, lathe([[0.2 * s, -0.2 * s], [0.26 * s, -0.17 * s], [0.26 * s, -0.12 * s], [0.4 * s, -0.11 * s], [r * 0.92, -0.06 * s], [r, -0.04 * s], [r, 0.05 * s], [r * 0.9, 0.08 * s], [r * 0.55, 0.16 * s], [0.25 * s, 0.22 * s], [0.18 * s, 0.25 * s], [0.001, 0.25 * s]], 28, null, cx, yy, cz));
  }
  bag.add(D, lathe([[0.001, 0], [0.12 * s, 0.02], [0.14 * s, 0.12 * s], [0.06 * s, 0.3 * s], [0.001, 0.36 * s]], 10, null, cx, y + 4.75 * s, cz));
}
/** A square block's 8 corners: half-widths at the bottom (hb) and top (ht), heights y0…y1. */
function sq(cx, cz, hb, ht, y0, y1) {
  const c = (h, y) => [[cx - h, y, cz - h], [cx + h, y, cz - h], [cx + h, y, cz + h], [cx - h, y, cz + h]];
  return [c(hb, y0), c(ht, y1)];
}
function boxTris(x, z, h, y0, y1) { const o = []; hexa(o, ...[[[x - h, y0, z - h], [x + h, y0, z - h], [x + h, y0, z + h], [x - h, y0, z + h]], [[x - h, y1, z - h], [x + h, y1, z - h], [x + h, y1, z + h], [x - h, y1, z + h]]]); return o; }
/** A post of lens section: wide `w` along the run, `d` deep across it, its four corners bevelled (two hexahedra). */
function lens(out, P, t, w, d, y0, y1) {
  const q = (yy, a, b) => [P(t - a, -b, yy), P(t + a, -b, yy), P(t + a, b, yy), P(t - a, b, yy)];
  hexa(out, q(y0, w, d * 0.55), q(y1, w, d * 0.55));
  hexa(out, q(y0, w * 0.6, d), q(y1, w * 0.6, d));
}

void box;
const base = STYLES.indian;
registerStyle('indian-sanchi', {
  ...base,
  elements: { ...base.elements, stupa },
});
