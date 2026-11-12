// The Oba's palace (docs/settlements/benin-city.md §3): courts of red clay with galleries on pillars sheathed in brass and hung with
// plaques, an impluvium in each court; the great gallery of audience with the Oba's dais; the ancestral altars with their cast heads
// and carved tusks; the turrets with their spires, brass snakes down their faces and brass birds on their points; the gate.
import { fromTriangles, quad } from '../../core/geom.js';
import { rng, wallMat, B, clayWall, gable, lean, hip, pillar, plaque, head, bird, snake, altar, box, frustum, lathe, rod } from './kit.js';
import { orientedBox } from '../../core/build.js';
import { frame } from '../greek/agora.js';
import { pot, pots, stool, bed, chest, hearth, mortar, wood, wear, claySeat, hung } from './props.js';

const SHINGLE = 'roof_bark';
const PH = 4.35, GY = 0.3;                        // pillar height, gallery floor

/** An impluvium: a raised clay rim round a pool of rain water at the court's middle. */
function impluvium(ctx, cx, cz, pw, pd) {
  const { bag, col } = ctx, o = 0.5, X0 = cx - pw / 2 - o, X1 = cx + pw / 2 + o, Z0 = cz - pd / 2 - o, Z1 = cz + pd / 2 + o;
  B(ctx, 'stucco_red', [X0, Z0, X1, Z0 + o], 0, 0.34); B(ctx, 'stucco_red', [X0, Z1 - o, X1, Z1], 0, 0.34);
  B(ctx, 'stucco_red', [X0, Z0 + o, X0 + o, Z1 - o], 0, 0.34); B(ctx, 'stucco_red', [X1 - o, Z0 + o, X1, Z1 - o], 0, 0.34);
  B(ctx, 'pottery_dark', [X0 + o, Z0 + o, X1 - o, Z1 - o], 0, 0.1);
  const t = []; quad(t, [X0 + o, 0.2, Z0 + o], [X0 + o, 0.2, Z1 - o], [X1 - o, 0.2, Z1 - o], [X1 - o, 0.2, Z0 + o]);
  bag.add('water', fromTriangles(t));
  col.rect([X0, Z0, X1, Z1], 0, 0.5);
}

/**
 * benin_court: { rect, sides: { n, e, s, w: gallery or not (default all) }, gd (gallery depth 4.4), doors: { n, e, s, w: [at…] or false },
 * altars: { side, n }, seed, tree }. A court of red earth with an impluvium, galleries on brass pillars with their roofs sloping to it,
 * the clay wall behind them with open doorways.
 */
function court(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ?? 1), gd = el.gd ?? 4.4, S = { n: 1, e: 1, s: 1, w: 1, ...el.sides };
  const wm = wallMat(rand), WH = 6.5, pitch = 3.2;
  bag.add('tuff_red', box(x0, -0.3, z0, x1, 0.03, z1)); col.floor(el.rect, 0.03);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (el.impluvium !== false) impluvium(ctx, cx, cz, 5.6, 4.2);
  const regions = {
    n: [x0, z0, x1, z0 + gd], s: [x0, z1 - gd, x1, z1],
    w: [x0, z0 + (S.n ? gd : 0), x0 + gd, z1 - (S.s ? gd : 0)], e: [x1 - gd, z0 + (S.n ? gd : 0), x1, z1 - (S.s ? gd : 0)],
  };
  const doorsOf = (side, L) => {
    if (el.doors && el.doors[side] === false) return [];
    if (el.doors && el.doors[side]) return el.doors[side].map((at) => ({ at, w: 2.6, h: 2.9 }));
    const n = Math.max(1, Math.round(L / 9)), out = [];
    for (let i = 0; i < n; i++) out.push({ at: (i + 0.5) * L / n, w: 2.6, h: 2.9 });
    return out;
  };
  for (const side of ['n', 's', 'w', 'e']) {
    if (!S[side]) continue;
    const r = regions[side], alongX = side === 'n' || side === 's', L = alongX ? x1 - x0 : r[3] - r[1];
    bag.add('tuff_red', box(r[0], 0, r[1], r[2], GY, r[3])); col.floor(r, GY);
    // the back wall on the court's outer edge, doors cut in it
    const a = { n: [x0, z0 + 0.3], s: [x0, z1 - 0.3], w: [x0 + 0.3, r[1]], e: [x1 - 0.3, r[1]] }[side], b = alongX ? [x1, a[1]] : [a[0], r[3]];
    if (!(el.noWall && el.noWall.includes(side))) { clayWall(ctx, a, b, 0.6, GY, WH, wm, doorsOf(side, L)); if (el.near !== false) wear(ctx, a, b, 0.6, GY, WH, (el.seed ?? 1) * 5 + side.charCodeAt(0)); }
    // the roof sloping to the court
    lean(ctx, r, { n: 'zp', s: 'zn', w: 'xp', e: 'xn' }[side], PH, WH + 0.1, SHINGLE, 0.35);
    // the pillars along the inner edge, sheathed, with plaques on both faces
    const inner = { n: r[3] - 0.3, s: r[1] + 0.3, w: r[2] - 0.3, e: r[0] + 0.3 }[side];
    const n = Math.max(2, Math.round((alongX ? r[2] - r[0] : r[3] - r[1]) / pitch));
    const start = alongX ? r[0] : r[1], len = alongX ? r[2] - r[0] : r[3] - r[1];
    const near = el.near !== false;
    for (let i = 0; i <= n; i++) {
      const u = start + 0.4 + i * (len - 0.8) / n, [px, pz] = alongX ? [u, inner] : [inner, u];
      pillar(ctx, px, pz, GY, PH - 0.0);
      if (near) {
        const toCourt = { n: 's', s: 'n', w: 'e', e: 'w' }[side], toBack = { n: 'n', s: 's', w: 'w', e: 'e' }[side];
        const off = { n: [0, 0.22], s: [0, -0.22], w: [0.22, 0], e: [-0.22, 0] }[side], offB = [-off[0], -off[1]];
        for (const y of [GY + 1.25, GY + 1.95, GY + 2.65]) {
          plaque(ctx, px + off[0], y, pz + off[1], toCourt, Math.floor(rand() * 1e6));
          if (y < GY + 2.3) plaque(ctx, px + offB[0], y, pz + offB[1], toBack, Math.floor(rand() * 1e6));
        }
      }
    }
    // the beam on the pillars
    const bm = alongX ? [r[0], inner, r[2], inner] : [inner, r[1], inner, r[3]];
    bag.add('wood_dark', alongX ? box(bm[0], PH - 0.25, bm[1] - 0.15, bm[2], PH, bm[3] + 0.15) : box(bm[0] - 0.15, PH - 0.25, bm[1], bm[2] + 0.15, PH, bm[3]));
  }
  if (el.altars) {
    const { side, n } = el.altars, r = regions[side], alongX = side === 'n' || side === 's';
    const face = { n: 's', s: 'n', w: 'e', e: 'w' }[side];
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, len = alongX ? r[2] - r[0] : r[3] - r[1], c = (alongX ? r[0] : r[1]) + u * len, w = Math.min(5.2, len / n - 1.6);
      const ar = side === 'n' ? [c - w / 2, z0 + 0.7, c + w / 2, z0 + 2.2] : side === 's' ? [c - w / 2, z1 - 2.2, c + w / 2, z1 - 0.7] : side === 'w' ? [x0 + 0.7, c - w / 2, x0 + 2.2, c + w / 2] : [x1 - 2.2, c - w / 2, x1 - 0.7, c + w / 2];
      altar(ctx, ar, face, (el.seed ?? 1) * 13 + i, 5);
    }
  }
  // the seats of clay along the galleries (the courtiers wait on them), stools, big water jars at the corners, mats
  if (el.near !== false) {
    for (const side of ['n', 's', 'w', 'e']) {
      if (!S[side]) continue;
      const r = regions[side], alongX = side === 'n' || side === 's', len = alongX ? r[2] - r[0] : r[3] - r[1], inner = { n: r[3], s: r[1], w: r[2], e: r[0] }[side], dirIn = { n: 1, s: -1, w: 1, e: -1 }[side];
      for (let k = 0; k < Math.max(1, Math.floor(len / 14)); k++) {
        if (el.altars && el.altars.side === side) continue;
        const c = (alongX ? r[0] : r[1]) + len * (k + 0.5) / Math.max(1, Math.floor(len / 14)), b0 = inner - dirIn * 0.9;
        const seat = alongX ? [c - 2.2, Math.min(b0, b0 - dirIn * 0.5), c + 2.2, Math.max(b0, b0 - dirIn * 0.5)] : [Math.min(b0, b0 - dirIn * 0.5), c - 2.2, Math.max(b0, b0 - dirIn * 0.5), c + 2.2];
        claySeat(ctx, [seat[0], seat[1], seat[2], seat[3]].map((v) => v), GY, k + side.charCodeAt(0));
      }
    }
    for (const [px, pz] of [[cx - 7, cz - 6], [cx + 7, cz - 6], [cx - 7, cz + 6], [cx + 7, cz + 6]]) pots(ctx, px, 0.03, pz, Math.floor(px * 31 + pz), 2);
    for (let i = 0; i < 4; i++) stool(ctx, cx - 2.4 + i * 1.6, 0.03, cz + 4.0 + (i % 2) * 0.5);
  }
  // brass birds on little spired towers at the roof corners
  for (const [px, pz] of [[x0 + 0.8, z0 + 0.8], [x1 - 0.8, z0 + 0.8], [x0 + 0.8, z1 - 0.8], [x1 - 0.8, z1 - 0.8]]) spire(ctx, px, pz, WH + 0.1, 3.6, rand);
}
/** A little spired tower on a roof with its brass bird. */
function spire(ctx, x, z, y, h, rand) {
  ctx.bag.add('timber', frustum([x - 0.28, z - 0.28, x + 0.28, z + 0.28], y, y + h * 0.55, 0.06, 0.06, 0.06, 0.06));
  ctx.bag.add(SHINGLE, frustum([x - 0.5, z - 0.5, x + 0.5, z + 0.5], y + h * 0.55, y + h, 0.46, 0.46, 0.46, 0.46));
  bird(ctx, x, y + h, z, h > 3 ? 1.3 : 0.9, rand() * 6, 'gilt_bronze');
}

/**
 * benin_hall: { rect, front 's', doors [at…] in the back wall, seed } — the Oba's great gallery of audience: a plinth, two rows of
 * brass-sheathed pillars with plaques, the back wall hung with plaques, the dais with the Oba's stool, a high roof of shingle.
 */
function hall(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ?? 3), wm = wallMat(rand), cx = (x0 + x1) / 2, Y = 0.35, T = 6.0, RISE = 8.2;
  bag.add('tuff_red', box(x0, 0, z0, x1, Y, z1)); col.floor(el.rect, Y);
  clayWall(ctx, [x0, z0 + 0.3], [x1, z0 + 0.3], 0.6, Y, T + 0.3, wm, (el.doors ?? [cx]).map((at) => ({ at: at - x0, w: 3, h: 3.1 })));
  if (el.near !== false) for (const x of [x0 + 0.3, x1 - 0.3]) wear(ctx, [x, z0], [x, z1], 0.6, Y, T + 0.3, Math.round(x));
  for (const x of [x0 + 0.3, x1 - 0.3]) clayWall(ctx, [x, z0], [x, z1], 0.6, Y, T + 0.3, wm, [{ at: (z1 - z0) / 2, w: 3, h: 3.1 }]);
  bag.add('timber', box(x0 - 0.9, T, z0 - 0.9, x1 + 0.9, T + 0.1, z1 + 0.9));
  gable(ctx, el.rect, T + 0.1, RISE, SHINGLE, 'x', 0.9);
  bag.add('roof_ridge', box(x0 - 0.9, T + 0.1 + RISE - 0.08, (z0 + z1) / 2 - 0.3, x1 + 0.9, T + 0.1 + RISE + 0.26, (z0 + z1) / 2 + 0.3));
  // the small spired towers along the ridge with their brass birds (Dapper: every roof is adorned with one)
  for (let i = 0; i < 6; i++) spire(ctx, x0 + 3 + i * (x1 - x0 - 6) / 5, (z0 + z1) / 2, T + 0.1 + RISE, i % 5 === 2 ? 4.4 : 2.8, rand);
  // the pillars: the front row and one a third of the way in
  const rows = [z1 - 0.5, z0 + 6.5];
  rows.forEach((z, k) => {
    const n = Math.round((x1 - x0 - 2) / 3.2);
    for (let i = 0; i <= n; i++) {
      const x = x0 + 1 + i * (x1 - x0 - 2) / n;
      pillar(ctx, x, z, Y, T - Y);
      if (el.near !== false) for (const y of [Y + 1.3, Y + 2.1, Y + 2.9, Y + 3.7]) { plaque(ctx, x, y, z + 0.22, 's', Math.floor(rand() * 1e6)); if (k === 1) plaque(ctx, x, y, z - 0.22, 'n', Math.floor(rand() * 1e6)); }
    }
  });
  bag.add('wood_dark', box(x0, T - 0.25, z1 - 0.65, x1, T, z1 - 0.35)); bag.add('wood_dark', box(x0, T - 0.25, z0 + 6.35, x1, T, z0 + 6.65));
  // the plaques on the back wall
  if (el.near !== false) for (let x = x0 + 2; x < x1 - 1.5; x += 2.2) for (const y of [Y + 1.4, Y + 2.2, Y + 3.0]) if (!(el.doors ?? [cx]).some((d) => Math.abs(d - x) < 2.4)) plaque(ctx, x, y, z0 + 0.67, 's', Math.floor(rand() * 1e6));
  // the dais, with the stool and two altars at the sides
  const dz0 = z0 + 1.2, dz1 = z0 + 5.4;
  B(ctx, 'stucco_red', [cx - 4.5, dz0, cx + 4.5, dz1], Y, Y + 0.45); col.floor([cx - 4.5, dz0, cx + 4.5, dz1], Y + 0.45);
  B(ctx, 'stucco_red', [cx - 3.5, dz0 + 0.4, cx + 3.5, dz1 - 0.4], Y + 0.45, Y + 0.9); col.floor([cx - 3.5, dz0 + 0.4, cx + 3.5, dz1 - 0.4], Y + 0.9);
  B(ctx, 'wood_dark', [cx - 0.55, dz0 + 1.2, cx + 0.55, dz0 + 2.1], Y + 0.9, Y + 1.38, true); B(ctx, 'timber', [cx - 0.7, dz0 + 1.1, cx + 0.7, dz0 + 2.2], Y + 1.38, Y + 1.5);
  B(ctx, 'bronze', [cx - 0.7, dz0 + 1.05, cx + 0.7, dz0 + 1.1], Y + 0.9, Y + 1.5);
  for (const s of [-1, 1]) { B(ctx, 'ivory', [cx + s * 2.6 - 0.07, dz0 + 1.4, cx + s * 2.6 + 0.07, dz0 + 1.54], Y + 0.9, Y + 2.8); head(ctx, cx + s * 2.0, Y + 0.9, dz0 + 1.3, 0, 40 + s, false); }
  for (const s of [-1, 1]) altar(ctx, [cx + s * 16 - 2.6, z0 + 0.7, cx + s * 16 + 2.6, z0 + 2.2], 's', 90 + s, 5);
  // the furnishings of the great gallery: leopard skins on the dais, the cast leopards at its steps, the stools of the chiefs in two rows,
  // mats in the aisle, benches of clay under the side walls
  if (el.near !== false) {
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const x = cx + s * (1.5 + i * 0.6), z = dz0 + 2.9; bag.add('hide_tan', box(x - 0.3, Y + 0.9, z - 0.4, x + 0.3, Y + 0.92, z + 0.4)); bag.add('hide_black', box(x - 0.08, Y + 0.92, z - 0.12, x + 0.08, Y + 0.925, z + 0.02)); }
    for (const s of [-1, 1]) leopard(ctx, cx + s * 5.2, Y, dz1 + 0.6, s);
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { stool(ctx, cx + s * (7 + i * 1.9), Y, z0 + 7.6 + (i % 2) * 0.4); }
    for (let x = x0 + 4; x < x1 - 3; x += 7) bag.add('reed_mat', box(x, Y, z0 + 8.4, x + 3, Y + 0.02, z1 - 1.6));
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const bx = s < 0 ? x0 + 0.9 : x1 - 0.9; claySeat(ctx, [bx - 0.4, z0 + 8 + k * 1.8, bx + 0.4, z0 + 9.6 + k * 1.8], Y, k); }
    for (let x = x0 + 6; x < x1 - 5; x += 6.4) { const [a, b] = [x, z0 + 12]; bag.add('bronze', lathe([[0.001, 0], [0.16, 0.03], [0.13, 0.3], [0.001, 0.38]], 8, null, a, T - 0.7, b)); bag.add('iron', rod([a, T - 0.35, b], [a, T - 0.25, b], 0.02, 4)); }
  }
  // the front's steps
  for (let i = 0; i < 2; i++) B(ctx, 'tuff_red', [cx - 5 - i * 0.4, z1 + i * 0.3, cx + 5 + i * 0.4, z1 + 0.3 + i * 0.3], 0, 0.2 - i * 0.1);
}



/**
 * benin_frontrange: { xs: [x0, x1], seed } — the long gallery behind the south wall of the palace, open to the outer court on a row of brass-sheathed
 * pillars hung with plaques, with a very steep roof of shingle (Dapper: "fair and long galleries ... all supported on pillars of wood", "every
 * roof adorned with a small spired tower on which cast copper birds stand"). Its roof rises over the wall and is what the square sees of the palace.
 */
function frontRange(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed ?? 4), [x0, x1] = el.xs, z0 = -9.6, z1 = -0.1, EY = 4.1, RISE = 6.4, Y = GY, zm = (z0 + z1) / 2;
  bag.add('tuff_red', box(x0, 0, z0, x1, Y, z1 - 1.0)); col.floor([x0, z0, x1, z1 - 1.0], Y);
  // the roof, its tie beams, the ridge cap and the little spired towers along it
  bag.add('timber', box(x0 - 0.5, EY - 0.12, z0 - 0.5, x1 + 0.5, EY, z1 + 0.5));
  gable(ctx, [x0, z0, x1, z1], EY, RISE, SHINGLE, 'x', 0.6);
  bag.add('roof_ridge', box(x0 - 0.6, EY + RISE - 0.08, zm - 0.28, x1 + 0.6, EY + RISE + 0.24, zm + 0.28));
  for (const q of [0.3, 0.62]) for (const sg of [-1, 1]) bag.add('wood_dark', box(x0 - 0.6, EY + RISE * (1 - q) - 0.03, zm + sg * q * (z1 - z0 + 1.2) / 2 - 0.06, x1 + 0.6, EY + RISE * (1 - q) + 0.1, zm + sg * q * (z1 - z0 + 1.2) / 2 + 0.06));
  const n = Math.max(3, Math.round((x1 - x0) / 11));
  for (let i = 0; i < n; i++) spire(ctx, x0 + (i + 0.5) * (x1 - x0) / n, zm, EY + RISE, i % 3 === 1 ? 4.2 : 2.8, rand);
  // the colonnade on the court side, a second row of pillars in the middle, plaques on both
  const pitch = 3.2, m = Math.round((x1 - x0 - 1) / pitch);
  for (const [pz, plaq] of [[z0 + 0.4, true], [zm, false]]) for (let i = 0; i <= m; i++) {
    const x = x0 + 0.5 + i * (x1 - x0 - 1) / m;
    pillar(ctx, x, pz, Y, EY - 0.12 - Y, 0.22, 'gilt_bronze');
    if (plaq) for (const y of [Y + 1.3, Y + 2.05, Y + 2.8]) plaque(ctx, x, y, pz - 0.24, 'n', Math.floor(rand() * 1e6), 0.46, 0.58);
  }
  bag.add('wood_dark', box(x0, EY - 0.45, z0 + 0.1, x1, EY - 0.12, z0 + 0.7)); bag.add('wood_dark', box(x0, EY - 0.4, zm - 0.3, x1, EY - 0.12, zm + 0.3));
  // the back wall's inner face hung with plaques; clay seats under them, stools and mats on the floor
  for (let x = x0 + 1.6; x < x1 - 1; x += 2.4) for (const y of [Y + 1.7, Y + 2.5]) plaque(ctx, x, y, z1 - 1.0, 'n', Math.floor(rand() * 1e6), 0.42, 0.52);
  for (let x = x0 + 2; x < x1 - 4; x += 8.4) claySeat(ctx, [x, z1 - 1.6, x + 5.6, z1 - 1.1], Y, Math.round(x));
  for (let x = x0 + 3; x < x1 - 3; x += 5.6) { bag.add('reed_mat', box(x, Y, zm + 0.6, x + 2.6, Y + 0.02, zm + 2.8)); stool(ctx, x + 3.4, Y, zm + 1.7); }
  for (const px of [x0 + 1.2, x1 - 1.2]) pots(ctx, px, Y, z1 - 2.0, Math.round(px), 3);
  if (el.altar) altar(ctx, [x0 + (x1 - x0) / 2 - 2.8, z1 - 3.9, x0 + (x1 - x0) / 2 + 2.8, z1 - 1.5], 'n', 111, 5);
}

/**
 * benin_audience: { axis (x), z0, z1 (the court's south and north ends), seed } — the outer court as the court of audience: a way of polished clay
 * edged in white chalk from the gate to the steps of the great gallery, long clay benches in two ranks either side where the chiefs wait in their
 * order (the people are placed by town.js from the same numbers: AUD in layout.js), two slit log drums on forked posts and a staff of bells, big jars
 * of water at the gate end, mats [inferred: the accounts speak of the chiefs attending the Oba in order; the furnishing is the type].
 */
function audience(el, ctx) {
  const { bag, col } = ctx, ax = el.axis, rand = rng(el.seed ?? 8), z0 = el.z0, z1 = el.z1;
  bag.add('stucco_red', box(ax - 3.0, 0.03, z1, ax + 3.0, 0.07, z0));
  for (const s of [-1, 1]) bag.add('chalk', box(ax + s * 3.0 - 0.09, 0.03, z1, ax + s * 3.0 + 0.09, 0.075, z0));
  for (const b of el.benches) claySeat(ctx, b, 0.03, Math.round(b[0] * 3 + b[1]));
  // two log drums, one each side, on forked posts, with a staff of bells at one
  for (const s of [-1, 1]) {
    const dx = ax + s * 13.5, dz = el.drumZ ?? -36;
    for (const t of [-1, 1]) { bag.add('wood_dark', rod([dx, 0.03, dz + t * 1.2], [dx, 1.0, dz + t * 1.2], 0.09, 6)); col.circle(dx, dz + t * 1.2, 0.13, 0.03, 1.0); }
    bag.add('timber', rod([dx, 1.08, dz - 1.45], [dx, 1.08, dz + 1.45], 0.3, 9)); bag.add('wood_dark', box(dx - 0.07, 1.2, dz - 1.1, dx + 0.07, 1.42, dz + 1.1));
    col.rect([dx - 0.4, dz - 1.5, dx + 0.4, dz + 1.5], 0.03, 1.4);
  }
  { const bx = ax + 13.5, bz = el.drumZ ?? -36; bag.add('timber', lathe([[0.08, 0], [0.07, 2.6]], 6, null, bx + 2.6, 0.03, bz)); col.circle(bx + 2.6, bz, 0.1, 0.03, 2.6); for (let i = 0; i < 3; i++) bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.2], [0.04, 0.28], [0.001, 0.3]], 7, null, bx + 2.6 + (i - 1) * 0.2, 2.0 - Math.abs(i - 1) * 0.15, bz)); }
  // the great jars of water beside the passage's mouth, mats before each bench
  for (const s of [-1, 1]) pots(ctx, ax + s * 8.0, 0.03, z0 - 6.0, Math.round(s * 7 + 20), 3);
  for (const b of el.benches) if (rand() < 0.5) { const west = b[2] < ax; bag.add('reed_mat', box(west ? b[2] : b[0] - 1.3, 0.03, b[1] + 0.5, west ? b[2] + 1.3 : b[0], 0.05, b[3] - 0.5)); }
}

/** A cast brass leopard, standing, at (x, y, z), facing +z (s = ±1 turns it to look across): the guardian of the Oba's steps. */
function leopard(ctx, x, y, z, s = 1) {
  const { bag, col } = ctx, g = (m, b) => { b.rotateY(s > 0 ? 0.25 : -0.25); b.translate(x, y, z); bag.add(m, b); };
  g('bronze', box(-0.22, 0.42, -0.62, 0.22, 0.82, 0.5)); g('bronze', box(-0.17, 0.5, 0.45, 0.17, 0.85, 0.82)); g('bronze', box(-0.14, 0.52, 0.8, 0.14, 0.78, 1.0));
  for (const sx of [-0.14, 0.14]) for (const sz of [-0.5, 0.35]) g('bronze', box(sx - 0.05, 0, sz - 0.05, sx + 0.05, 0.45, sz + 0.05));
  g('bronze', box(-0.04, 0.55, -1.15, 0.04, 0.65, -0.6));
  for (let i = 0; i < 5; i++) g('gilt_bronze', box(-0.225, 0.5 + (i % 2) * 0.15, -0.5 + i * 0.2, 0.225, 0.56 + (i % 2) * 0.15, -0.44 + i * 0.2));
  col.rect([x - 0.4, z - 0.8, x + 0.4, z + 0.9], y, y + 0.9);
}
/**
 * benin_range: { rect, front ('e' | 'w' | 'n' | 's'), seed, kinds } — a range of single rooms of the palace's servants and stores under one lean-to
 * roof, each 4.4 m wide and open to the lane by a doorway: stores of tusks and chests, kitchens, sleeping rooms, the casters' stock of brass.
 */
function range(el, ctx) {
  const { bag, col } = ctx, F = frame(el.rect, el.front), { L, D, P, R } = F, rand = rng(el.seed ?? 1), wm = wallMat(rand), H = 3.1, Y = 0.2;
  const n = Math.max(1, Math.round(L / 4.6)), rw = L / n, kinds = el.kinds ?? ['store', 'kitchen', 'sleep', 'sleep', 'brass', 'store', 'kitchen'];
  bag.add('tuff_red', box(el.rect[0], -0.3, el.rect[1], el.rect[2], Y, el.rect[3])); col.floor(el.rect, Y);
  const w = (u0, v0, u1, v1, ops = []) => { const a = P(u0, v0), b = P(u1, v1); clayWall(ctx, a, b, 0.5, Y, H, wm, ops, !el.simple); if (!el.simple) wear(ctx, a, b, 0.5, Y, H, (el.seed ?? 1) * 3 + Math.round(u0 * 7 + v0)); };
  for (let i = 0; i <= n; i++) w(i * rw, 0, i * rw, D);
  w(0, D - 0.25, L, D - 0.25);
  for (let i = 0; i < n; i++) w(i * rw, 0.25, (i + 1) * rw, 0.25, [{ at: rw / 2, w: 1.5, h: 2.3 }]);
  lean(ctx, R(0, 0, L, D), el.front === 'e' ? 'xp' : el.front === 'w' ? 'xn' : el.front === 'n' ? 'zn' : 'zp', H - 0.3, H + 1.0, 'thatch_palm', 0.6, !el.simple);
  if (el.simple) return;
  for (let i = 0; i < n; i++) {
    const k = kinds[(i + (el.seed ?? 0)) % kinds.length], u0 = i * rw + 0.4, u1 = (i + 1) * rw - 0.4;
    const at = (u, v) => P(u, v), yy = Y;
    if (k === 'store') {
      for (let j = 0; j < 5; j++) { const [a, b] = at(u0 + 0.3 + j * 0.28, D - 0.7), [c, d] = at(u0 + 0.5 + j * 0.28, D - 1.0); bag.add('ivory', rod([a, yy, b], [c, yy + 2.0 - (j % 2) * 0.2, d], 0.055, 6)); }
      const [x, z] = at(u1 - 0.6, D - 1.2); chest(ctx, x, yy, z, 0.9, 0.55); const [x2, z2] = at(u1 - 0.6, 1.6); chest(ctx, x2, yy, z2, 0.9, 0.55);
      const [p1, p2] = at(u0 + 0.6, 1.5); pots(ctx, p1, yy, p2, i + 3, 3);
    } else if (k === 'kitchen') {
      const [x, z] = at((u0 + u1) / 2, D - 1.8); hearth(ctx, x, yy, z, i + 9); const [m1, m2] = at(u1 - 0.3, 1.6); mortar(ctx, m1, yy, m2, i + 4);
      const [w1, w2] = at(u0 + 0.6, 2.2); wood(ctx, w1, yy, w2, F.along, 1.2, i + 5); const [p1, p2] = at(u1 - 0.5, D - 0.8); pots(ctx, p1, yy, p2, i + 7, 3);
    } else if (k === 'sleep') {
      const r = R(u0, D - 2.6, u0 + 2.4, D - 1.2); bed(ctx, r, yy, (el.seed ?? 1) + i); const [x, z] = at(u1 - 0.6, 1.8); stool(ctx, x, yy, z); const [c1, c2] = at(u1 - 0.6, D - 0.7); chest(ctx, c1, yy, c2, 0.8, 0.5);
    } else {
      // the casters' stock: heads and plaques on shelves, crucibles of clay in a row
      for (const h of [0.9, 1.6]) { const r = R(u0 - 0.1, D - 1.2, u1 + 0.1, D - 0.5); bag.add('timber', box(r[0], yy + h, r[1], r[2], yy + h + 0.05, r[3])); }
      for (let j = 0; j < 4; j++) { const [x, z] = at(u0 + 0.5 + j * 0.75, D - 0.85); head(ctx, x, yy + 1.65, z, 0, (el.seed ?? 1) * 11 + i * 5 + j, false); if (j < 3) head(ctx, x, yy + 0.95, z, 0, (el.seed ?? 1) * 13 + i * 7 + j, false); }
      for (let j = 0; j < 5; j++) { const [x, z] = at(u0 + 0.4 + j * 0.5, 1.8); bag.add('earth_wall', lathe([[0.001, yy], [0.16, yy + 0.01], [0.2, yy + 0.2], [0.12, yy + 0.32], [0.001, yy + 0.34]], 7, null, x, 0, z)); }
    }
  }
}

/**
 * benin_tower: { c, h, snake (face 'n' | 's' | 'e' | 'w'), r, bh, big, seed } — a turret: a battered clay body, an open lantern, a steep spire of shingle
 * with its brass bird. The great turrets (big): a python of new bright brass winding down the clay body, a second down the spire's edge,
 * and a large bird on the point (Dapper: "every corner a turret rising high with a spire"; van Nyendael: roofs adorned with brass snakes;
 * the 1897 photographs' python tower; the size of the bird is exaggerated to be read from the square [inferred]).
 */
function tower(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, h = el.h ?? 14, wm = wallMat(rng(el.seed ?? 5)), r = el.r ?? 1.7, bh = el.bh ?? Math.min(7, h * 0.45), big = !!el.big;
  bag.add(wm, frustum([cx - r, cz - r, cx + r, cz + r], 0, bh, 0.28, 0.28, 0.28, 0.28));
  for (let y = 0.8; y < bh - 0.4; y += 0.62) { const k = 0.28 * y / bh; bag.add(wm, frustum([cx - r + k - 0.06, cz - r + k - 0.06, cx + r - k + 0.06, cz + r - k + 0.06], y, y + 0.12, 0, 0, 0, 0)); }
  col.rect([cx - r, cz - r, cx + r, cz + r], 0, bh);
  bag.add('timber', box(cx - r - 0.15, bh, cz - r - 0.15, cx + r + 0.15, bh + 0.14, cz + r + 0.15));
  const ly = bh + 0.14, lh = Math.min(big ? 3.4 : 2.8, h * 0.18);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pillar(ctx, cx + dx * (r - 0.3), cz + dz * (r - 0.3), ly, lh, 0.13);
  bag.add('wood_dark', box(cx - r, ly + lh, cz - r, cx + r, ly + lh + 0.14, cz + r));
  // the lantern: the brass bell hung in it, a bead of plaques on the beams
  bag.add('bronze', lathe([[0.001, 0], [0.22, 0.04], [0.28, 0.3], [0.2, 0.46], [0.001, 0.5]], 8, null, cx, ly + lh - 0.55, cz));
  const sy = ly + lh + 0.14, span = h - sy, SM = big ? 'gilt_bronze' : 'bronze';
  // the spire of shingle in two tiers: a wide skirt, then the steep upper roof
  bag.add(SHINGLE, frustum([cx - r - 0.7, cz - r - 0.7, cx + r + 0.7, cz + r + 0.7], sy, sy + span * 0.3, 0.5, 0.5, 0.5, 0.5, { noBottom: true }));
  bag.add('roof_ridge', frustum([cx - r - 0.78, cz - r - 0.78, cx + r + 0.78, cz + r + 0.78], sy, sy + 0.16, 0, 0, 0, 0));
  // the upper roof is a truncated pyramid, flat on top, not a needle (the brass plaque of a palace in the British Museum's and the Art Institute's
  // collections shows a pyramid on the turret, a snake down its front head first, the bird above with outstretched wings)
  const u0 = sy + span * 0.28, u1 = sy + span * 0.82, hw0 = r + 0.1, hw1 = 0.5;
  bag.add(SHINGLE, frustum([cx - hw0, cz - hw0, cx + hw0, cz + hw0], u0, u1, hw0 - hw1, hw0 - hw1, hw0 - hw1, hw0 - hw1, { noBottom: true }));
  bag.add('timber', box(cx - hw1 - 0.15, u1, cz - hw1 - 0.15, cx + hw1 + 0.15, u1 + 0.12, cz + hw1 + 0.15));
  bag.add('timber', lathe([[0.1, 0], [0.1, Math.max(0.3, h - u1 - 0.1)]], 6, null, cx, u1 + 0.12, cz));
  bird(ctx, cx, h + 0.0, cz, big ? 2.4 : 1.3, (el.seed ?? 5) * 0.7, SM);
  if (el.snake) {
    const f = el.snake, dir = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f], al = [-dir[1], dir[0]];
    if (big) {
      // the python down the front of the pyramid, head first, following the slope of the face
      const pts = [], n = 18, wob = 0.34;
      for (let i = 0; i <= n; i++) {
        const t = i / n, y = u1 - 0.1 - t * (u1 - u0 - 0.3), hw = hw1 + (hw0 - hw1) * ((u1 - y) / (u1 - u0)), off = Math.sin(t * Math.PI * 3.5) * wob;
        pts.push([cx + dir[0] * (hw + 0.14) + al[0] * off, y, cz + dir[1] * (hw + 0.14) + al[1] * off]);
      }
      for (let i = 0; i < n; i++) bag.add(SM, rod(pts[i], pts[i + 1], 0.14 * (1 - 0.4 * i / n), 6));
      const hd = pts[n]; bag.add(SM, lathe([[0.001, 0], [0.2, 0.05], [0.2, 0.3], [0.1, 0.42], [0.001, 0.46]], 6, null, hd[0], hd[1] - 0.4, hd[2]));
      // the heads of cast brass hung over the clay body below the lantern, two to each turret, and a python winding on the body
      for (const sg of [-1, 1]) { const bx = cx + dir[0] * (r + 0.05) + al[0] * sg * r * 0.5, bz = cz + dir[1] * (r + 0.05) + al[1] * sg * r * 0.5; bag.add(SM, rod([bx, bh - 0.1, bz], [bx + dir[0] * 0.4, bh - 0.55, bz + dir[1] * 0.4], 0.12, 6)); bag.add(SM, lathe([[0.001, 0], [0.17, 0.05], [0.17, 0.3], [0.09, 0.42], [0.001, 0.46]], 6, null, bx + dir[0] * 0.4, bh - 1.0, bz + dir[1] * 0.4)); }
      snake(ctx, cx + dir[0] * (r - 0.2), bh - 1.2, cz + dir[1] * (r - 0.2), bh - 2.4, al, dir, r * 0.35, 0.13, SM, 3);
    } else {
      snake(ctx, cx + dir[0] * (r - 0.15), bh - 0.3, cz + dir[1] * (r - 0.15), bh - 1.0, al, dir, 0.55, 0.12);
      snake(ctx, cx + dir[0] * (r + 0.4), sy + (h - sy) * 0.55, cz + dir[1] * (r + 0.4), (h - sy) * 0.4, al, dir, 0.2, 0.07);
    }
  }
}

/**
 * benin_gatehouse: { c: [x, z of the passage on the wall's outer face], seed } — the gate of the palace: two wings of red clay with a steep two-tier
 * roof of shingle over a 5 m passage, a small spired tower on its ridge with the brass bird, and before it a portico of six pillars sheathed in
 * new brass and hung with plaques, under a skirt roof, on a clay plinth with steps ([inferred] from Dapper's galleries on cast pillars; the
 * gate itself is not described). Guards' seats, the rack of staves and a bench in each wing.
 */
function gatehouse(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, rand = rng(el.seed ?? 9), wm = wallMat(rand), W = 10.5, D = 11, Y = 0.3, T = 6.4, pw = 2.6, RISE = 6.4, PD = 3.4;
  for (const s of [-1, 1]) {
    const r = s < 0 ? [cx - W, cz - D, cx - pw, cz] : [cx + pw, cz - D, cx + W, cz];
    bag.add('tuff_red', box(r[0], 0, r[1], r[2], Y, r[3]));
    clayWall(ctx, [r[0] + 0.3, r[1]], [r[0] + 0.3, r[3]], 0.6, Y, T, wm, []); clayWall(ctx, [r[2] - 0.3, r[1]], [r[2] - 0.3, r[3]], 0.6, Y, T, wm, []);
    wear(ctx, [r[0] + 0.3, r[1]], [r[0] + 0.3, r[3]], 0.6, Y, T, Math.round(r[0])); wear(ctx, [r[2] - 0.3, r[1]], [r[2] - 0.3, r[3]], 0.6, Y, T, Math.round(r[2]) + 3); wear(ctx, [r[0], r[3] - 0.3], [r[2], r[3] - 0.3], 0.6, Y, T, Math.round(r[0]) + 5);
    clayWall(ctx, [r[0], r[1] + 0.3], [r[2], r[1] + 0.3], 0.6, Y, T, wm, []); clayWall(ctx, [r[0], r[3] - 0.3], [r[2], r[3] - 0.3], 0.6, Y, T, wm, [{ at: (r[2] - r[0]) / 2, w: 1.6, h: 2.5 }]);
    // the wing's room: a clay bed and a chest, the guards' bench, a stool, a jar of water
    const ox = s * (pw + (W - pw) / 2);
    bed(ctx, [cx + ox - 1.2, cz - D + 0.9, cx + ox + 1.2, cz - D + 2.9], Y, 70 + s, true);
    chest(ctx, cx + ox + s * 2.5, Y, cz - D + 1.2, 0.9, 0.5);
    claySeat(ctx, [cx + ox - 2.4, cz - 1.9, cx + ox + 0.6, cz - 1.4], Y, 3 + s);
    stool(ctx, cx + ox + 1.9, Y, cz - 2.4); pots(ctx, cx + ox - 3.3, Y, cz - D + 1.1, 90 + s, 2);
  }
  bag.add('tuff_red', box(cx - pw, 0, cz - D, cx + pw, 0.12, cz)); col.floor([cx - pw, cz - D, cx + pw, cz], 0.12);
  // the roof: tie beams, the steep upper roof, a ridge cap, a spired tower on the ridge with the great bird
  bag.add('timber', box(cx - W - 0.9, T, cz - D - 0.9, cx + W + 0.9, T + 0.12, cz + 0.9));
  gable(ctx, [cx - W, cz - D, cx + W, cz], T + 0.12, RISE, SHINGLE, 'x', 0.9);
  const ry = T + 0.12 + RISE;
  bag.add('roof_ridge', box(cx - W - 0.9, ry - 0.06, cz - D / 2 - 0.3, cx + W + 0.9, ry + 0.26, cz - D / 2 + 0.3));
  for (const q of [-0.62, -0.3, 0.3, 0.62]) bag.add('wood_dark', box(cx - W - 0.9, T + 0.12 + RISE * (1 - Math.abs(q) * 1.2) - 0.02, cz - D / 2 + q * (D / 2 + 0.9) - 0.07, cx + W + 0.9, T + 0.12 + RISE * (1 - Math.abs(q) * 1.2) + 0.1, cz - D / 2 + q * (D / 2 + 0.9) + 0.07));
  spire(ctx, cx, cz - D / 2, ry, 5.2, rand);
  for (const s of [-1, 1]) { for (const t of [0.45, 0.8]) spire(ctx, cx + s * W * t, cz - D / 2, ry - 0.05, 2.4, rand); bird(ctx, cx + s * (W + 0.5), ry - 0.1, cz - D / 2, 1.5, s, 'gilt_bronze'); }
  // the guards' seats of clay along the passage, a rack of staves
  for (const sd of [-1, 1]) { claySeat(ctx, sd < 0 ? [cx - pw + 0.1, cz - 8, cx - pw + 0.65, cz - 4.5] : [cx + pw - 0.65, cz - 8, cx + pw - 0.1, cz - 4.5], 0.12, sd + 3); for (let i = 0; i < 4; i++) bag.add('timber', rod([cx + sd * (pw - 0.25), 0.12, cz - 9.0 + i * 0.12], [cx + sd * (pw - 0.5), 2.0, cz - 9.0 + i * 0.12], 0.03, 5)); }
  bag.add('wood_dark', box(cx - pw - 0.3, 3.7, cz - 0.9, cx + pw + 0.3, 4.2, cz - 0.4));
  // the portico: a plinth with steps, six pillars of bright brass with plaques on a beam, a skirt roof of shingle sloping to the front
  const PY = 0.22, pz = cz + PD - 0.5, px = [-8.6, -5.6, -2.6, 2.6, 5.6, 8.6];
  bag.add('tuff_red', box(cx - W - 0.4, 0, cz, cx + W + 0.4, PY, cz + PD)); col.floor([cx - W - 0.4, cz, cx + W + 0.4, cz + PD], PY);
  for (let i = 0; i < 2; i++) { bag.add('tuff_red', box(cx - W - 0.4 - i * 0.3, 0, cz + PD + i * 0.3, cx + W + 0.4 + i * 0.3, 0.14 - i * 0.06, cz + PD + 0.3 + i * 0.3)); }
  for (const u of px) {
    pillar(ctx, cx + u, pz, PY, 4.6, 0.26, 'gilt_bronze');
    for (const y of [PY + 1.2, PY + 1.95, PY + 2.7, PY + 3.45]) { plaque(ctx, cx + u, y, pz + 0.3, 's', Math.floor(rand() * 1e6), 0.5, 0.62); plaque(ctx, cx + u, y, pz - 0.3, 'n', Math.floor(rand() * 1e6), 0.5, 0.62); }
  }
  bag.add('wood_dark', box(cx - W - 0.5, PY + 4.55, pz - 0.2, cx + W + 0.5, PY + 5.0, pz + 0.2));
  lean(ctx, [cx - W - 0.4, cz - 0.3, cx + W + 0.4, cz + PD + 0.3], 'zp', PY + 4.9, T + 0.5, SHINGLE, 0.5);
  // the plaques on the wings' front walls, a clay seat under the porch at each end
  for (const s of [-1, 1]) for (const u of [3.8, 5.0, 8.0, 9.2]) for (const y of [1.8, 2.7]) plaque(ctx, cx + s * u, y, cz, 's', Math.floor(rand() * 1e6), 0.4, 0.5);
  for (const s of [-1, 1]) claySeat(ctx, [cx + s * 9.0 - 1.2, cz + 0.5, cx + s * 9.0 + 1.2, cz + 1.0], PY, 6 + s);
}

/** benin_wall: { a, b, th, h, openings, near } — a wall of red clay in ridged bands with a coping of shingle. */
function pwall(el, ctx) {
  const rand = rng(el.seed ?? 1), th = el.th ?? 0.9, h = el.h ?? 3.6, mat = wallMat(rand);
  clayWall(ctx, el.a, el.b, th, 0, h, mat, el.openings ?? []);
  if (!el.simple) wear(ctx, el.a, el.b, th, 0, h, (el.seed ?? 1) * 17);
  const Ln = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), ux = (el.b[0] - el.a[0]) / Ln, uz = (el.b[1] - el.a[1]) / Ln;
  let s = 0;
  for (const o of [...(el.openings ?? []).map((q) => [q.at - q.w / 2, q.at + q.w / 2]).sort((p, q) => p[0] - q[0]), [Ln, Ln]]) {
    if (o[0] - s > 0.05) ctx.bag.add(SHINGLE, orientedBox([el.a[0] + ux * s, el.a[1] + uz * s], [el.a[0] + ux * o[0], el.a[1] + uz * o[0]], th + 0.5, h, h + 0.22));
    s = o[1];
  }
  // buttresses (pilasters) with a stepped cap every few metres, a frieze of plaques between them (the south front on the king's square)
  if (el.pilasters) {
    const step = el.pilasters, skip = el.skip ?? [], inSkip = (x) => skip.some(([a, b]) => x > a && x < b);
    for (let u = step; u < Ln - step * 0.6; u += step) {
      const x = el.a[0] + ux * u, z = el.a[1] + uz * u;
      if (inSkip(x)) continue;
      ctx.bag.add(mat, orientedBox([x - ux * 0.35, z - uz * 0.35], [x + ux * 0.35, z + uz * 0.35], th + 0.5, 0, h - 0.18));
      ctx.bag.add('stucco_red', orientedBox([x - ux * 0.5, z - uz * 0.5], [x + ux * 0.5, z + uz * 0.5], th + 0.64, h - 0.18, h + 0.02));
      for (let y = 0.7; y < h - 0.4; y += 0.62) ctx.bag.add(mat, orientedBox([x - ux * 0.38, z - uz * 0.38], [x + ux * 0.38, z + uz * 0.38], th + 0.6, y, y + 0.12));
      if (!el.frieze) continue;
      const mx = x + ux * step / 2;
      if (mx > el.a[0] + ux * Ln - 3 || inSkip(mx)) continue;
      const f = el.frieze, nz = f.face === 's' ? 1 : -1, pz = z + uz * step / 2 + nz * (th / 2 + 0.02);
      for (const y of f.ys) plaque(ctx, mx, y, pz, f.face, Math.floor(rng(Math.round(mx * 13))() * 1e6), 0.5, 0.62);
    }
  }
}
export const PALACE_EL = { benin_audience: audience, benin_frontrange: frontRange, benin_court: court, benin_hall: hall, benin_tower: tower, benin_gatehouse: gatehouse, benin_wall: pwall, benin_range: range, benin_leopard: (el, ctx) => { if (el.plinth) { B(ctx, 'stucco_red', [el.at[0] - 0.75, el.at[1] - 1.3, el.at[0] + 0.75, el.at[1] + 1.4], 0, el.y ?? 0, true); } leopard(ctx, el.at[0], el.y ?? 0, el.at[1], el.s ?? 1); } };
void hip;
