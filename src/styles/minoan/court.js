// The Central Court's dress (docs/settlements/knossos.md §4f): the painted fronts of the wings on the court (pier-and-door
// bays, the red and black dado, panels of lilies, figure-of-eight shields and the crowd of the Grandstand Fresco), the
// Tripartite Shrine's three columns, the lime strip across the paving, the youth vaulting the bull, the offering table.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { tube, ball } from '../../objects/kit.js';
import { ell, cap, poly } from '../greek/sculpture.js';
import { FRESCO, minoanColumn as column, minoanFresco as fresco, minoanHorns as horns, minoanPithos as pithos } from './index.js';

const G = 'gypsum_minoan', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── new panels for the walls on the court ─────────────────────────────────────────────────────────
// the frame of painted stones round a panel (as the bull-leaping fresco's): blue, ochre, red and white blocks
const frame = (w, h, b = 0.07) => {
  const out = [], bands = ['egyptian_blue', 'paint_ochre', RED, 'plaster_white'], n = Math.max(6, Math.round(w / 0.3));
  for (let i = 0; i < n; i++) { const u0 = -w / 2 + i * w / n, u1 = u0 + w / n; out.push({ mat: bands[i % 4], parts: [[[[u0, h - b], [u1, h - b], [u1, h], [u0, h]], 0.6], [[[u0, 0], [u1, 0], [u1, b], [u0, b]], 0.6]] }); }
  return out;
};
Object.assign(FRESCO, {
  // red lilies on a pale ground, stems and leaves in green, the yellow stamens (after the Lily Fresco of Amnisos and the House of the Frescoes)
  lilies: (w, h) => {
    const out = frame(w, h), red = [], green = [], yel = [], k = (h - 0.14) / 1.3, n = Math.max(2, Math.round(w / 0.9));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * w / n + ((i * 7) % 3 - 1) * 0.06, y0 = 0.1, s = k * (0.85 + (i % 3) * 0.1);
      green.push([cap([x, y0], [x + 0.03 * s, y0 + 0.8 * s], 0.014 * s, 0.01 * s), 0.7], [poly([x, y0 + 0.2 * s], [x - 0.28 * s, y0 + 0.5 * s], [x - 0.2 * s, y0 + 0.5 * s], [x + 0.01, y0 + 0.28 * s]), 0.7], [poly([x, y0 + 0.15 * s], [x + 0.3 * s, y0 + 0.42 * s], [x + 0.22 * s, y0 + 0.43 * s], [x - 0.01, y0 + 0.24 * s]), 0.7]);
      const t = y0 + 0.8 * s, xc = x + 0.03 * s;
      red.push([poly([xc - 0.05 * s, t], [xc + 0.05 * s, t], [xc + 0.08 * s, t + 0.22 * s], [xc, t + 0.38 * s], [xc - 0.08 * s, t + 0.22 * s]), 1.0], [cap([xc - 0.03 * s, t + 0.02 * s], [xc - 0.24 * s, t + 0.22 * s], 0.045 * s, 0.012 * s), 1.0], [cap([xc + 0.03 * s, t + 0.02 * s], [xc + 0.24 * s, t + 0.22 * s], 0.045 * s, 0.012 * s), 1.0]);
      for (const d of [-0.05, 0, 0.05]) yel.push([cap([xc, t + 0.08 * s], [xc + d * s * 2, t + 0.3 * s], 0.006 * s, 0.006 * s), 1.2]);
    }
    out.push({ mat: 'fresco_green', parts: green }, { mat: RED, parts: red }, { mat: 'paint_ochre', parts: yel });
    return out;
  },
  // figure-of-eight shields of ox-hide with the dark spots of the hide, along a white band (the Hall of the Double Axes, the Grand Staircase)
  shields: (w, h) => {
    const out = frame(w, h), hide = [], spot = [], band = [], n = Math.max(2, Math.floor(w / 0.85)), sw = 0.34, sh = (h - 0.3) / 2;
    band.push([[[-w / 2 + 0.07, h * 0.5 - 0.04], [w / 2 - 0.07, h * 0.5 - 0.04], [w / 2 - 0.07, h * 0.5 + 0.04], [-w / 2 + 0.07, h * 0.5 + 0.04]], 0.5]);
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * w / n, c = h / 2;
      hide.push([ell(x, c + sh * 0.5, sw, sh * 0.52, 12), 1.0], [ell(x, c - sh * 0.5, sw, sh * 0.52, 12), 1.0], [poly([x - sw * 0.55, c + sh * 0.3], [x + sw * 0.55, c + sh * 0.3], [x + sw * 0.55, c - sh * 0.3], [x - sw * 0.55, c - sh * 0.3]), 1.0]);
      spot.push([ell(x - 0.1, c + sh * 0.7, 0.05, 0.05, 6), 1.3], [ell(x + 0.12, c + sh * 0.35, 0.04, 0.05, 6), 1.3], [ell(x - 0.08, c - sh * 0.4, 0.05, 0.04, 6), 1.3], [ell(x + 0.1, c - sh * 0.75, 0.04, 0.05, 6), 1.3]);
    }
    out.push({ mat: 'plaster_white', parts: band }, { mat: 'paint_ochre', parts: hide }, { mat: BLK, parts: spot });
    return out;
  },
  // the crowd at the court's edge: rows of heads, the men red-skinned, the women white, the dark hair, in robes of blue, ochre and red (after the Grandstand Fresco)
  grandstand: (w, h) => {
    const out = frame(w, h), rand = rng(97), red = [], white = [], hair = [], blue = [], ochre = [], robe = [], rows = 3, dx = 0.17, n = Math.floor((w - 0.3) / dx);
    for (let r = 0; r < rows; r++) {
      const y = 0.18 + r * ((h - 0.5) / rows);
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + 0.15 + (i + 0.5) * dx + (r % 2) * dx * 0.5;
        if (x > w / 2 - 0.12 || rand() < 0.08) continue;
        const m = rand() < 0.45, c = rand();
        (m ? red : white).push([ell(x, y + 0.2, 0.045, 0.055, 6), 1.0]);
        hair.push([ell(x - 0.01, y + 0.24, 0.05, 0.04, 6), 1.2]);
        (c < 0.35 ? blue : c < 0.7 ? ochre : robe).push([poly([x - 0.07, y], [x + 0.07, y], [x + 0.05, y + 0.16], [x - 0.05, y + 0.16]), 0.9]);
      }
    }
    out.push({ mat: RED, parts: red }, { mat: 'plaster_white', parts: white }, { mat: BLK, parts: hair }, { mat: 'egyptian_blue', parts: blue }, { mat: 'paint_ochre', parts: ochre }, { mat: 'paint_robe', parts: robe });
    return out;
  },
});

// ── the fronts of the wings on the court ───────────────────────────────────────────────────────
/**
 * court_front: { face, p, u0, u1 (its extent along the wall, world
 * coordinates), y, doors: [{ u (centre), n (openings, 1–3), w (each), h }], panels: [{ u, kind, w, h, y0 }], jars: [[u, d, s]] (pithoi stood before the wall,
 * d from it) } — the dado in red and black, doorways framed in red timber with dark openings, painted panels, jars.
 */
function courtFront(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, o = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[el.face], ex = o[0] !== 0, sg = ex ? o[0] : o[1];
  const bx = (u0, u1, v0, v1, d0, d1) => { const q = el.p + sg * d0, r = el.p + sg * d1, lo = Math.min(q, r), hi = Math.max(q, r); return ex ? box(lo, y + v0, u0, hi, y + v1, u1) : box(u0, y + v0, lo, u1, y + v1, hi); };
  const doors = (el.doors ?? []).map((d) => { const n = d.n ?? 1, w = d.w ?? 1.5, pier = 0.5, W = n * w + (n - 1) * pier; return { ...d, n, w, W, h: d.h ?? 2.4, u0: d.u - W / 2, u1: d.u + W / 2 }; }).sort((p, q) => p.u - q.u);
  // the dado: a red band over the gypsum base and a black rule over it, broken at the doorways
  let u = el.u0;
  for (const d of [...doors, { u0: el.u1 + 1, u1: el.u1 + 1 }]) {
    const e = Math.min(el.u1, d.u0 - 0.2);
    if (e - u > 0.1) { bag.add(RED, bx(u, e, 1.2, 1.52, 0, 0.022)); bag.add(BLK, bx(u, e, 1.52, 1.58, 0, 0.028)); bag.add('plaster_white', bx(u, e, 1.58, 1.62, 0, 0.024)); }
    u = d.u1 + 0.2;
  }
  for (const d of doors) {
    const x0 = d.u0 - 0.2, x1 = d.u1 + 0.2;
    bag.add('timber', bx(x0 - 0.04, x1 + 0.04, d.h, d.h + 0.24, 0, 0.12));                              // the lintel beam, its round ends
    bag.add(RED, bx(x0, x1, d.h + 0.24, d.h + 0.36, 0, 0.09));
    bag.add(G, bx(x0 - 0.1, x1 + 0.1, 0, 0.1, 0, 0.36));                                                  // the threshold step
    for (let i = 0; i < d.n; i++) {
      const c0 = d.u0 + i * (d.w + 0.5);
      bag.add('opening', bx(c0, c0 + d.w, 0.1, d.h, 0, 0.035));
      bag.add(RED, bx(c0 - 0.06, c0, 0.1, d.h, 0, 0.07)); bag.add(RED, bx(c0 + d.w, c0 + d.w + 0.06, 0.1, d.h, 0, 0.07));
      // a leaf of the door standing half open
      if (i % 2 === 0) bag.add('timber', bx(c0 + 0.04, c0 + d.w * 0.45, 0.12, d.h - 0.05, 0.03, 0.07));
    }
    for (let i = 0; i <= d.n; i++) { const c = d.u0 + i * (d.w + 0.5) - 0.25; if (i > 0 && i < d.n) { bag.add('plaster', bx(c - 0.25, c + 0.25, 0.1, d.h, 0, 0.12)); bag.add(BLK, bx(c - 0.27, c + 0.27, d.h - 0.2, d.h, 0, 0.13)); } }
  }
  for (const p of el.panels ?? []) {
    const at = ex ? [el.p, p.u] : [p.u, el.p];
    fresco({ kind: p.kind, at, face: el.face, y0: y + (p.y0 ?? 1.7), w: p.w ?? 3, h: p.h ?? 1.4, bg: p.bg ?? 'plaster_white', flip: p.flip }, ctx);
  }
  for (const [uu, d, s, rot] of el.jars ?? []) pithos({ at: ex ? [el.p + sg * d, uu] : [uu, el.p + sg * d], y, s: s ?? 1, rot: rot ?? uu }, ctx);
  void col;
}

/** tripartite_front: the Tripartite Shrine on the court's west side { x (the wall plane), z0, z1, y }: three bays, a gypsum plinth before each carrying a red column, the dark recess behind the middle one, the horns on the plinth. */
function tripartite(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, x = el.x, [z0, z1] = [el.z0, el.z1], zc = (z0 + z1) / 2, bw = (z1 - z0) / 3;
  for (let i = 0; i < 3; i++) {
    const c = z0 + (i + 0.5) * bw, mid = i === 1, hh = mid ? 3.0 : 2.45, py = mid ? 0.5 : 0.3;
    bag.add(G, box(x + 0.0, y, c - bw / 2 + 0.25, x + 1.1, y + py, c + bw / 2 - 0.25)); col.rect([x, c - bw / 2 + 0.25, x + 1.1, c + bw / 2 - 0.25], y, y + py);
    column(bag, col, x + 0.7, c, y + py, hh, 0.22);
    bag.add('opening', box(x + 0.01, y + py, c - bw / 2 + 0.55, x + 0.04, y + py + (mid ? 2.4 : 1.8), c + bw / 2 - 0.55));
    bag.add(RED, box(x + 0.01, y + py, c - bw / 2 + 0.45, x + 0.05, y + py + (mid ? 2.5 : 1.9), c - bw / 2 + 0.55)); bag.add(RED, box(x + 0.01, y + py, c + bw / 2 - 0.55, x + 0.05, y + py + (mid ? 2.5 : 1.9), c + bw / 2 - 0.45));
    bag.add('timber', box(x + 0.3, y + py + hh + 0.25, c - bw / 2 + 0.3, x + 1.1, y + py + hh + 0.5, c + bw / 2 - 0.3));
    horns(bag, x + 0.7, y + py + hh + 0.5, c, mid ? 0.8 : 0.55, false);
  }
  void zc;
}

/** court_paving: the strip of lime-plastered slabs down the court's long axis between kerbs, patches of lime and of damp where the rain from the roofs falls { rect, y, strip (half-width), seed }. */
function courtPaving(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.05, hw = el.strip ?? 1.9, rand = rng(el.seed || 5), cx = (x0 + x1) / 2;
  bag.add('lime_plaster', box(cx - hw, y, z0, cx + hw, y + 0.012, z1));
  for (const s of [-1, 1]) bag.add(G, box(cx + s * hw - 0.07, y, z0, cx + s * hw + 0.07, y + 0.035, z1));
  for (let z = z0 + 1.5; z < z1 - 1; z += 2.6 + rand() * 1.6) bag.add(G, box(cx - hw, y + 0.012, z, cx + hw, y + 0.02, z + 0.05));
  for (let i = 0; i < 26; i++) {
    const w = 0.7 + rand() * 1.6, d = 0.6 + rand() * 1.4, x = x0 + 0.6 + rand() * (x1 - x0 - 1.2 - w), z = z0 + 0.6 + rand() * (z1 - z0 - 1.2 - d);
    if (x + w > cx - hw - 0.1 && x < cx + hw + 0.1) continue;
    bag.add(rand() < 0.5 ? 'lime_plaster' : 'plaster_damp', box(x, y, z, x + w, y + 0.006, z + d));
  }
}

/** offering_table: a gypsum table on two piers with a bowl, rhytons and a jug on it { at, rot, y }. */
function offeringTable(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0.05, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a);
  const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const Bx = (l0, l1, v0, v1, m0, m1, mat) => { const q = [P(l0, m0), P(l1, m0), P(l1, m1), P(l0, m1)], xs = q.map((p) => p[0]), zs = q.map((p) => p[1]); bag.add(mat, box(Math.min(...xs), y + v0, Math.min(...zs), Math.max(...xs), y + v1, Math.max(...zs))); };
  Bx(-0.75, 0.75, 0.74, 0.8, -0.38, 0.38, G);
  for (const sx of [-1, 1]) Bx(sx * 0.6 - 0.1, sx * 0.6 + 0.1, 0, 0.74, -0.3, 0.3, G);
  const at = (g, lx, v, lz) => { const p = P(lx, lz); bag.add(g[0], g[1].translate(p[0], y + v, p[1])); };
  at(['bronze', lathe([[0.001, 0], [0.07, 0], [0.16, 0.06], [0.17, 0.09], [0.15, 0.09], [0.001, 0.02]], 12)], -0.35, 0.8, 0);
  for (const lx of [0, 0.2, 0.4]) at(['silver', lathe([[0.001, 0], [0.03, 0], [0.07, 0.24], [0.075, 0.26], [0.065, 0.26], [0.03, 0.04], [0.001, 0.03]], 8)], lx, 0.8, -0.12);
  at(['terracotta', lathe([[0.001, 0], [0.05, 0], [0.09, 0.1], [0.05, 0.2], [0.04, 0.26], [0.001, 0.26]], 8)], 0.5, 0.8, 0.15);
  at(['paint_ochre', lathe([[0.001, 0], [0.09, 0], [0.09, 0.025], [0.001, 0.03]], 8)], 0.1, 0.8, 0.14);
  col.rect([x - 0.8, z - 0.4, x + 0.8, z + 0.4], y, y + 0.8);
}

/**
 * bull_leaper: a youth vaulting over a bull's back — the handspring of the fresco: his hands on the bull's shoulders, the body arched up and over, the legs trailing
 * over the rump { at, rot (the bull's), s (its scale incl. size), y, skin, cloth }. Built in the bull's frame (−z forward).
 */
function bullLeaper(el, { bag }) {
  const [bx, bz] = el.at, y = el.y ?? 0.05, a = el.rot ?? 0, S = el.s ?? 1.15, c = Math.cos(a), s = Math.sin(a), g = el.girl;
  const P = (lx, ly, lz) => [bx + (lx * c + lz * s) * S, y + ly * S, bz + (-lx * s + lz * c) * S];
  const T = (pts, n = 6) => tube(pts.map(([lx, ly, lz, r1, r2]) => [...P(lx, ly, lz), r1 * S, (r2 ?? r1) * S]), n);
  const skin = el.skin ?? (g ? 'skin_light' : 'skin_medium');
  // the arms from the hands on the withers up to the shoulders, the torso arched back to the hips, the legs trailing over the rump
  const sh = [0, 1.98, -0.45], hp = [0, 2.36, 0.0], kn = [0, 2.62, 0.5], an = [0, 2.38, 0.98];
  for (const sx of [-1, 1]) {
    bag.add(skin, T([[sx * 0.14, 1.42, -0.8, 0.03], [sx * 0.15, 1.7, -0.62, 0.04], [sx * 0.17, sh[1], sh[2], 0.045]]));
    bag.add(skin, T([[sx * 0.07, hp[1], hp[2], 0.065], [sx * 0.07, kn[1], kn[2], 0.055], [sx * 0.05, an[1], an[2], 0.035], [sx * 0.05, an[1] - 0.12, an[2] + 0.2, 0.025]]));
  }
  bag.add(skin, T([[0, hp[1], hp[2], 0.12, 0.09], [0, (hp[1] + sh[1]) / 2, (hp[2] + sh[2]) / 2, 0.1, 0.085], [0, sh[1], sh[2], g ? 0.12 : 0.16, 0.09]], 8));
  bag.add(skin, T([[0, sh[1], sh[2], 0.04], [0, sh[1] - 0.1, sh[2] - 0.12, 0.045]]));
  const hd = P(0, 1.72, -0.66);
  bag.add(skin, ball(0.1 * S, 8, 6).translate(hd[0], hd[1] - 0.1 * S, hd[2]));
  // the long black hair streaming back along the body; the loincloth at the hips with its band, the belt
  bag.add('hide_black', T([[0, 1.78, -0.7, 0.07, 0.06], [0, 2.0, -0.45, 0.06, 0.05], [0, 2.3, -0.05, 0.05, 0.03], [0, 2.42, 0.4, 0.02]]));
  bag.add(el.cloth ?? (g ? 'cloth_red' : 'cloth_white'), T([[0, hp[1] - 0.04, hp[2] - 0.12, 0.15, 0.11], [0, hp[1] + 0.06, hp[2] + 0.2, 0.15, 0.1], [0, hp[1] + 0.2, hp[2] + 0.46, 0.05]], 8));
  bag.add('silver', T([[0, hp[1] - 0.05, hp[2] - 0.15, 0.158, 0.026], [0, hp[1] - 0.04, hp[2] - 0.08, 0.158, 0.026]], 8));
}

/** court_shrubs: myrtle and oleander grown in the tubs { at: [[x, z]…], y (the tub's rim), seed }: a bark stem, three clipped balls of leaf. */
function courtShrubs(el, { bag }) {
  const rand = rng(el.seed || 2), y = (el.y ?? 0.05) + 0.4;
  for (const [x, z] of el.at) {
    const h = 0.9 + rand() * 0.6;
    bag.add('bark_olive', tube([[x, y, z, 0.035], [x + (rand() - 0.5) * 0.1, y + h * 0.6, z, 0.03], [x, y + h, z, 0.02]], 5));
    for (let i = 0; i < 3; i++) { const r = 0.26 + rand() * 0.16, a = rand() * 6.28, d = i ? 0.22 : 0; bag.add('fresco_green', ball(r, 7, 5).translate(x + Math.cos(a) * d, y + h * (0.75 + 0.18 * i) - r, z + Math.sin(a) * d)); }
  }
}

Object.assign(STYLES.minoan.elements, { court_shrubs: courtShrubs, court_front: courtFront, tripartite_front: tripartite, court_paving: courtPaving, offering_table: offeringTable, bull_leaper: bullLeaper });
