// The Tang hall: a timber building on a platform of rammed earth faced with brick, red columns, white walls, massive
// bracket sets (about as tall as the column's upper half) under a broad, low roof with deep eaves and owl-tail ridge ends.
// One element, many uses: temple halls, gate buildings, the houses' halls and wings, shops (open fronts). Built in its own
// frame facing +z and turned to `face`. { c, w, d, face, y, plat, H, nb, kind, roof, over, bh, det, interior, steps, seed, pal }
//   kind: 'hall' (front: a door in the middle bay, barred windows between), 'open' (no front wall: shops, gate buildings,
//   pavilions), 'closed' (blank); det 0 (walls and roof only), 1 (columns, brackets), 2 (everything: bases, doors, windows).

import { box, frustum } from '../../core/geom.js';
import { inFrame, YAW, wallRun, tangRoof } from './kit.js';

/** A bracket set on top of the column at (x, z) facing out along u = [ux, uz] (a unit axis), four tiers: arms stepping out, cross arms, blocks. */
function bracketSet(bag, x, z, y, u, bh, mat, big) {
  const t = [-u[1], u[0]], n = 4, th = bh / n, out = (k, s) => [x + u[0] * s + t[0] * k, z + u[1] * s + t[1] * k];
  const B = (c, hl, hw, y0, y1) => { // an axis box centred on c, half-length hl along u, hw across
    const ax = Math.abs(u[0]) > 0.5;
    bag.add(mat, ax ? box(c[0] - hl, y0, c[1] - hw, c[0] + hl, y1, c[1] + hw) : box(c[0] - hw, y0, c[1] - hl, c[0] + hw, y1, c[1] + hl));
  };
  B([x, z], 0.28, 0.28, y, y + 0.2);                                      // the capital block (luandou)
  for (let k = 0; k < n; k++) {
    const y0 = y + 0.2 + k * (bh - 0.2) / n, y1 = y0 + (bh - 0.2) / n * 0.62, reach = 0.32 + k * (big ? 0.34 : 0.26);
    const c = [x + u[0] * reach / 2, z + u[1] * reach / 2];
    B(c, reach / 2 + 0.14, 0.1 + (big ? 0.03 : 0), y0, y1);              // the arm out (huagong), a block at its head
    B([x + u[0] * reach, z + u[1] * reach], 0.14, 0.16 + k * 0.05, y0, y1 + 0.02);
    // the cross arm (the guazi), longer on the upper tiers
    bag.add(mat, Math.abs(u[0]) > 0.5 ? box(x - 0.1, y0, z - (0.35 + k * 0.2), x + 0.1, y1, z + (0.35 + k * 0.2)) : box(x - (0.35 + k * 0.2), y0, z - 0.1, x + (0.35 + k * 0.2), y1, z + 0.1));
    void th; void out;
    if (k < n - 1) B([x, z], 0.14, 0.14, y1, y0 + (bh - 0.2) / n + 0.0);         // the block between tiers
  }
}

export function buildHall(L, p) {
  const { w, d, y = 0, H = 3.6, nb = 3, kind = 'hall', over = 1.9, det = 2, interior = false } = p;
  const plat = p.plat ?? 0.45, F = y + plat, bh = p.bh ?? 0.9, pal = p.pal || {};
  const gable = p.roof ? p.roof === 'gable' : w < d + 0.5, bag = L.bag, col = L.col;
  const colMat = pal.column || 'timber_red', wallMat = pal.wall || 'plaster_white', brk = pal.bracket || 'timber_red';
  const xs = Array.from({ length: nb + 1 }, (_, k) => -w / 2 + (w * k) / nb);
  const rows = p.rows === 3 ? [-d / 2, 0, d / 2] : [-d / 2, d / 2];
  // the platform and its steps (front, on the axis)
  const px = w / 2 + 0.8, pz = d / 2 + 0.8;
  bag.add(pal.plinth || 'brick_grey', frustum([-px, -pz, px, pz], y - 0.05, F, 0, 0, 0, 0, { noBottom: y <= 0.01 }));
  col.rect([-px, -pz, px, pz], y - 0.05, F); col.floor([-px, -pz, px, pz], F);
  if (plat > 0.2 && p.steps !== false) {
    const sw = Math.min(p.big ? 4.4 : 3.4, w / nb), ns = Math.max(2, Math.ceil(plat / 0.22)), dp = 0.42;
    for (let i = 0; i < ns - 1; i++) bag.add('granite_block', box(-sw / 2, y - 0.02, pz + i * dp, sw / 2, F - ((i + 1) * plat) / ns, pz + (i + 1) * dp));
    col.ramp([-sw / 2, pz, sw / 2, pz + ns * dp], y, F, 'n');
  }
  // columns on stone bases, the architrave, the frieze panels, the bracket sets
  const top = F + H;
  if (det >= 1) for (const z of rows) for (const x of xs) {
    if (z === 0 && (x === xs[0] || x === xs[nb])) { /* the side wall's middle post */ }
    bag.add('granite_block', box(x - 0.3, F, z - 0.3, x + 0.3, F + 0.16, z + 0.3));
    if (det >= 2 && L.style.column) L.style.column({ at: [x, z], y: F + 0.16, h: H - 0.16, d: 0.42 }, L);
    else bag.add(colMat, box(x - 0.2, F + 0.16, z - 0.2, x + 0.2, top, z + 0.2));
    col.circle(x, z, 0.24, F, top);
  }
  if (det >= 1) {
    for (const z of [-d / 2, d / 2]) bag.add(colMat, box(-w / 2 - 0.2, top - 0.4, z - 0.17, w / 2 + 0.2, top, z + 0.17));
    for (const x of [-w / 2, w / 2]) bag.add(colMat, box(x - 0.17, top - 0.4, -d / 2 - 0.2, x + 0.17, top, d / 2 + 0.2));
    // the frieze panels between the brackets, in plaster
    for (const z of [-d / 2, d / 2]) bag.add(wallMat, box(-w / 2 - 0.1, top, z - 0.13, w / 2 + 0.1, top + bh - 0.03, z + 0.13));
    for (const x of [-w / 2, w / 2]) bag.add(wallMat, box(x - 0.13, top, -d / 2 - 0.1, x + 0.13, top + bh - 0.03, d / 2 + 0.1));
    for (const x of xs) for (const [z, uz] of [[-d / 2, -1], [d / 2, 1]]) bracketSet(bag, x, z, top, [0, uz], bh, brk, !!p.big);
    for (const z of [-d / 2, d / 2]) for (const [x, ux] of [[-w / 2, -1], [w / 2, 1]]) if (x === -w / 2 || x === w / 2) bracketSet(bag, x, z, top, [ux, 0], bh, brk, !!p.big);
    for (const x of [-w / 2, w / 2]) for (let k = 1; k < rows.length * 0 + 1; k++) void k;
    if (p.big) for (let k = 0; k < nb; k++) { const x = (xs[k] + xs[k + 1]) / 2; for (const [z, uz] of [[-d / 2, -1], [d / 2, 1]]) bracketSet(bag, x, z, top + 0.1, [0, uz], bh - 0.2, brk, false); }
  }
  // the walls
  const wh = top - 0.4, bay = w / nb, e = 0.0;
  const sideWall = (x) => wallRun(L, wallMat, [x, -d / 2 + e], [x, d / 2 - e], 0.36, F, wh);
  if (p.sides !== false) { sideWall(-w / 2); sideWall(w / 2); }
  if (!p.through) wallRun(L, wallMat, [-w / 2, -d / 2], [w / 2, -d / 2], 0.36, F, wh);
  const front = [];
  if (kind === 'hall') {
    const dw = Math.min(bay - 0.9, p.doorW ?? 2.6);
    for (let k = 0; k < nb; k++) {
      const mid = (k + 0.5) * bay;
      if (k === (nb - 1) / 2) front.push({ at: mid, w: dw, h: Math.min(H - 0.8, 3.3), y0: F });
      else front.push({ at: mid, w: Math.min(bay - 1.2, 1.8), h: 1.35, y0: F + 1.05 });
    }
    wallRun(L, wallMat, [-w / 2, d / 2], [w / 2, d / 2], 0.36, F, wh, front);
    if (det >= 1) for (const o of front) {
      const x = -w / 2 + o.at;
      if (o.y0 > F + 0.5) bag.add('lattice_red', box(x - o.w / 2, o.y0, d / 2 - 0.05, x + o.w / 2, o.y0 + o.h, d / 2 + 0.05));
      else if (!interior) bag.add('timber_red', box(x - o.w / 2, F, d / 2 - 0.12, x + o.w / 2, F + o.h, d / 2 - 0.02));
      else { bag.add('timber_red', box(x - o.w / 2 - 0.12, F, d / 2 - 0.1, x - o.w / 2, F + o.h, d / 2 + 0.1)); bag.add('timber_red', box(x + o.w / 2, F, d / 2 - 0.1, x + o.w / 2 + 0.12, F + o.h, d / 2 + 0.1)); bag.add('timber_red', box(x - o.w / 2 - 0.12, F + o.h, d / 2 - 0.1, x + o.w / 2 + 0.12, F + o.h + 0.12, d / 2 + 0.1)); }
    }
  } else if (kind === 'closed') wallRun(L, wallMat, [-w / 2, d / 2], [w / 2, d / 2], 0.36, F, wh);
  else if (det >= 1) { // open front: a low counter in the end bays' lower half for shops (p.counter), else open
    if (p.counter) for (let k = 0; k < nb; k++) if (k !== (nb - 1) / 2 || nb === 1) {
      const x0 = -w / 2 + k * bay + 0.25, x1 = -w / 2 + (k + 1) * bay - 0.25;
      bag.add('wood_dark', box(x0, F, d / 2 - 0.45, x1, F + 0.9, d / 2 - 0.05)); bag.add('timber', box(x0 - 0.04, F + 0.9, d / 2 - 0.5, x1 + 0.04, F + 0.95, d / 2)); col.rect([x0, d / 2 - 0.5, x1, d / 2], F, F + 0.95);
    }
  }
  // the ceiling of a walkable room: red boards over a grid of strips
  if (interior) bag.add('ceiling_grid', box(-w / 2 + 0.18, top + 0.02, -d / 2 + 0.18, w / 2 - 0.18, top + 0.1, d / 2 - 0.18));
  // the roof: eaves `over` beyond the column line, soffit meeting the bracket sets' tops
  const rise = Math.max(1.2, (d / 2 + over) * (p.pitch ?? 0.27)), B = d / 2 + over, A = w / 2 + over, t0 = over / B;
  const yE = top + bh + 0.24 - rise * Math.pow(t0, 1.35);
  tangRoof(bag, { cx: 0, cz: 0, A: gable ? A : Math.max(A, B), B, y: yE, rise, gable, tile: pal.roof || 'tile_grey', ridge: pal.ridge || 'roof_ridge', chi: p.chi });
}

/** The element: the hall in its own frame turned to face `face` ('s', 'n', 'e' or 'w'). */
export function tangHall(el, ctx) {
  inFrame(ctx, el.c, YAW[el.face || 's'], (L) => buildHall(L, el));
}
