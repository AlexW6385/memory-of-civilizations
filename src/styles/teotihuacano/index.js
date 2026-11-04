// Teotihuacano architecture (c. 100–550; docs/settlements/teotihuacan.md §4): talud-tablero — each
// stage a sloping apron with a framed vertical panel above — stuccoed and painted; pyramids with a
// stair on one face, the Adosada platform before them; walled apartment compounds of rooms round
// patios; the avenue's cross walls.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum } from '../../core/geom.js';
import '../qing/index.js';

const S = 'stucco_ochre', RD = 'stucco_red', RB = 'rubble_teo';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const stairs = (el, ctx) => STYLES.qing.elements.stairs(el, ctx);

/**
 * tt_pyramid: { c, w, d (base), tw, td (top), h, levels, tablero (share of each level's height in a
 * vertical panel; 0 for plain sloping stages), stair ('w'|'s'|…), stairW, temple: { w, d, h } }.
 */
function ttPyramid(el, { bag, col }) {
  const [cx, cz] = el.c, n = el.levels, H = el.h, tb = el.tablero ?? 0.35, y0b = el.y ?? 0;
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, ya = y0b + H * t0, yb = y0b + H * t1, ht = yb - ya;
    const a = [(el.w - (el.w - el.tw) * t0) / 2, (el.d - (el.d - el.td) * t0) / 2], b = [(el.w - (el.w - el.tw) * t1) / 2, (el.d - (el.d - el.td) * t1) / 2];
    const yt = ya + ht * (1 - tb), sx = a[0] - b[0], sz = a[1] - b[1];
    bag.add(k < 1 ? RB : RB, frustum([cx - a[0], cz - a[1], cx + a[0], cz + a[1]], ya, yt, sx * 0.85, sx * 0.85, sz * 0.85, sz * 0.85));
    if (tb > 0) {
      const p = [a[0] - sx * 0.85 + 0.25, a[1] - sz * 0.85 + 0.25];
      bag.add(RD, box(cx - p[0], yt, cz - p[1], cx + p[0], yb, cz + p[1]));
      bag.add(S, box(cx - p[0] + 0.3, yt + 0.35, cz - p[1] - 0.02, cx + p[0] - 0.3, yb - 0.35, cz + p[1] + 0.02));
      bag.add(S, box(cx - p[0] - 0.02, yt + 0.35, cz - p[1] + 0.3, cx + p[0] + 0.02, yb - 0.35, cz + p[1] - 0.3));
    }
    col.rect([cx - b[0], cz - b[1], cx + b[0], cz + b[1]], ya, yb); col.floor([cx - b[0], cz - b[1], cx + b[0], cz + b[1]], yb);
    col.rect([cx - a[0] + sx * 0.4, cz - a[1] + sz * 0.4, cx + a[0] - sx * 0.4, cz + a[1] - sz * 0.4], ya, ya + ht * 0.5);
  }
  // the stair up the chosen face, the whole height
  const sw = (el.stairW ?? 12) / 2, run = H * 1.05, f = el.stair || 'w';
  const r = f === 'w' ? [cx - el.tw / 2 - run, cz - sw, cx - el.tw / 2 + 0.5, cz + sw] : f === 'e' ? [cx + el.tw / 2 - 0.5, cz - sw, cx + el.tw / 2 + run, cz + sw] : f === 's' ? [cx - sw, cz + el.td / 2 - 0.5, cx + sw, cz + el.td / 2 + run] : [cx - sw, cz - el.td / 2 - run, cx + sw, cz - el.td / 2 + 0.5];
  stairs({ rect: r, y0: y0b, y1: y0b + H, dir: { w: 'e', e: 'w', s: 'n', n: 's' }[f], mat: S }, { bag, col });
  if (el.temple) { const T = el.temple; bag.add(S, box(cx - T.w / 2, y0b + H, cz - T.d / 2, cx + T.w / 2, y0b + H + T.h, cz + T.d / 2)); bag.add(RD, box(cx - T.w / 2 - 0.3, y0b + H + T.h - 0.8, cz - T.d / 2 - 0.3, cx + T.w / 2 + 0.3, y0b + H + T.h, cz + T.d / 2 + 0.3)); col.rect([cx - T.w / 2, cz - T.d / 2, cx + T.w / 2, cz + T.d / 2], y0b + H, y0b + H + T.h); }
}

/** tt_wall: a long talud-tablero platform or wall a rectangle { rect, h } (the Ciudadela's banks, the avenue's cross walls), its top a walk. */
function ttWall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h, y = el.y ?? 0, ins = Math.min(1.2, (x1 - x0) / 4, (z1 - z0) / 4);
  bag.add(RB, frustum([x0, z0, x1, z1], y, y + h * 0.6, ins, ins, ins, ins));
  bag.add(RD, box(x0 + ins - 0.2, y + h * 0.6, z0 + ins - 0.2, x1 - ins + 0.2, y + h, z1 - ins + 0.2));
  col.rect([x0, z0, x1, z1], y, y + h); col.floor([x0 + ins - 0.2, z0 + ins - 0.2, x1 - ins + 0.2, z1 - ins + 0.2], y + h);
}

/** compound: an apartment compound { rect, seed }: a blank outer wall on a talud, rooms (flat-roofed blocks) round three or four patios, a small altar in the main patio, a door on one side. */
function compound(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 3.2;
  for (const r of [[x0, z0, x1, z0 + 1], [x0, z1 - 1, x1, z1], [x0, z0 + 1, x0 + 1, z1 - 1], [x1 - 1, z0 + 1, x1, z1 - 1]]) { bag.add(S, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); }
  bag.add(RB, frustum([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], 0, 0.9, 0.5, 0.5, 0.5, 0.5));
  // rooms: a grid of blocks with patios left open
  const nx = 3, nz = 3, cw = (x1 - x0 - 2) / nx, cd = (z1 - z0 - 2) / nz, open = new Set([4, Math.floor(rand() * 9)]);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const k = i * nz + j, cx0 = x0 + 1 + i * cw, cz0 = z0 + 1 + j * cd;
    if (open.has(k)) { bag.add('stucco', box(cx0 + 0.5, 0, cz0 + 0.5, cx0 + cw - 0.5, 0.06, cz0 + cd - 0.5)); if (k === 4) { bag.add(RD, box(cx0 + cw / 2 - 0.8, 0, cz0 + cd / 2 - 0.8, cx0 + cw / 2 + 0.8, 1, cz0 + cd / 2 + 0.8)); } continue; }
    const r = [cx0 + 0.6, cz0 + 0.6, cx0 + cw - 0.6, cz0 + cd - 0.6];
    bag.add(S, box(r[0], 0, r[1], r[2], h - 0.2, r[3])); col.rect(r, 0, h); col.floor(r, h - 0.2);
    bag.add(RD, box(r[0] - 0.02, 0, r[1] - 0.02, r[2] + 0.02, 0.6, r[3] + 0.02));
  }
}

registerStyle('teotihuacano', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, tt_pyramid: ttPyramid, tt_wall: ttWall, compound },
  objects: {},
});
