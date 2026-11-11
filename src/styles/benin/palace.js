// The Oba's palace (docs/settlements/benin-city.md §3): courts of red clay with galleries on pillars sheathed in brass and hung with
// plaques, an impluvium in each court; the great gallery of audience with the Oba's dais; the ancestral altars with their cast heads
// and carved tusks; the turrets with their spires, brass snakes down their faces and brass birds on their points; the gate.
import { fromTriangles, quad } from '../../core/geom.js';
import { rng, wallMat, B, clayWall, gable, lean, hip, pillar, plaque, head, bird, snake, altar, box, frustum, lathe } from './kit.js';
import { orientedBox } from '../../core/build.js';

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
  const wm = wallMat(rand), WH = 5.7, pitch = 3.2;
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
    if (!(el.noWall && el.noWall.includes(side))) clayWall(ctx, a, b, 0.6, GY, WH, wm, doorsOf(side, L));
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
  // brass birds on little spired towers at the roof corners
  for (const [px, pz] of [[x0 + 0.8, z0 + 0.8], [x1 - 0.8, z0 + 0.8], [x0 + 0.8, z1 - 0.8], [x1 - 0.8, z1 - 0.8]]) spire(ctx, px, pz, WH + 1.5, 2.6, rand);
}
/** A little spired tower on a roof with its brass bird. */
function spire(ctx, x, z, y, h, rand) {
  ctx.bag.add('timber', frustum([x - 0.28, z - 0.28, x + 0.28, z + 0.28], y, y + h * 0.55, 0.06, 0.06, 0.06, 0.06));
  ctx.bag.add(SHINGLE, frustum([x - 0.5, z - 0.5, x + 0.5, z + 0.5], y + h * 0.55, y + h, 0.46, 0.46, 0.46, 0.46));
  bird(ctx, x, y + h, z, 0.9, rand() * 6);
}

/**
 * benin_hall: { rect, front 's', doors [at…] in the back wall, seed } — the Oba's great gallery of audience: a plinth, two rows of
 * brass-sheathed pillars with plaques, the back wall hung with plaques, the dais with the Oba's stool, a high roof of shingle.
 */
function hall(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ?? 3), wm = wallMat(rand), cx = (x0 + x1) / 2, Y = 0.35, T = 4.7;
  bag.add('tuff_red', box(x0, 0, z0, x1, Y, z1)); col.floor(el.rect, Y);
  clayWall(ctx, [x0, z0 + 0.3], [x1, z0 + 0.3], 0.6, Y, T + 0.3, wm, (el.doors ?? [cx]).map((at) => ({ at: at - x0, w: 3, h: 3.1 })));
  for (const x of [x0 + 0.3, x1 - 0.3]) clayWall(ctx, [x, z0], [x, z1], 0.6, Y, T + 0.3, wm, [{ at: (z1 - z0) / 2, w: 3, h: 3.1 }]);
  bag.add('timber', box(x0, T, z0, x1, T + 0.1, z1));
  gable(ctx, el.rect, T + 0.1, 5.2, SHINGLE, 'x', 0.9);
  bag.add(SHINGLE, box(x0 - 0.9, T + 5.2, cx * 0 + (z0 + z1) / 2 - 0.15, x1 + 0.9, T + 5.45, (z0 + z1) / 2 + 0.15));
  // the pillars: the front row and one a third of the way in
  const rows = [z1 - 0.5, z0 + 6.5];
  rows.forEach((z, k) => {
    const n = Math.round((x1 - x0 - 2) / 3.2);
    for (let i = 0; i <= n; i++) {
      const x = x0 + 1 + i * (x1 - x0 - 2) / n;
      pillar(ctx, x, z, Y, T - Y);
      if (el.near !== false) for (const y of [Y + 1.3, Y + 2.1, Y + 2.9]) { plaque(ctx, x, y, z + 0.22, 's', Math.floor(rand() * 1e6)); if (k === 1) plaque(ctx, x, y, z - 0.22, 'n', Math.floor(rand() * 1e6)); }
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
  // the front's steps
  for (let i = 0; i < 2; i++) B(ctx, 'tuff_red', [cx - 5 - i * 0.4, z1 + i * 0.3, cx + 5 + i * 0.4, z1 + 0.3 + i * 0.3], 0, 0.2 - i * 0.1);
}

/** benin_tower: { c, h, snake (face 'n' | 's' | 'e' | 'w'), seed } — a turret: a battered clay body, an open lantern, a steep spire of shingle with its brass bird. */
function tower(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, h = el.h ?? 14, wm = wallMat(rng(el.seed ?? 5)), r = 1.7, bh = Math.min(7, h * 0.45);
  bag.add(wm, frustum([cx - r, cz - r, cx + r, cz + r], 0, bh, 0.28, 0.28, 0.28, 0.28));
  for (let y = 0.8; y < bh - 0.4; y += 0.62) { const k = 0.28 * y / bh; bag.add(wm, frustum([cx - r + k - 0.06, cz - r + k - 0.06, cx + r - k + 0.06, cz + r - k + 0.06], y, y + 0.12, 0, 0, 0, 0)); }
  col.rect([cx - r, cz - r, cx + r, cz + r], 0, bh);
  bag.add('timber', box(cx - r, bh, cz - r, cx + r, bh + 0.14, cz + r));
  const ly = bh + 0.14, lh = Math.min(2.8, h * 0.18);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pillar(ctx, cx + dx * (r - 0.3), cz + dz * (r - 0.3), ly, lh, 0.13);
  bag.add('wood_dark', box(cx - r, ly + lh, cz - r, cx + r, ly + lh + 0.14, cz + r));
  const sy = ly + lh + 0.14;
  bag.add(SHINGLE, frustum([cx - r - 0.5, cz - r - 0.5, cx + r + 0.5, cz + r + 0.5], sy, sy + (h - sy) * 0.82, r + 0.3, r + 0.3, r + 0.3, r + 0.3, { noBottom: true }));
  bag.add('timber', lathe([[0.1, 0], [0.1, (h - sy) * 0.2 + 0.01]], 6, null, cx, sy + (h - sy) * 0.82, cz));
  bird(ctx, cx, h + 0.0, cz, 1.3, (el.seed ?? 5) * 0.7);
  if (el.snake) {
    const f = el.snake, dir = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f], al = [-dir[1], dir[0]];
    snake(ctx, cx + dir[0] * (r - 0.15), bh - 0.3, cz + dir[1] * (r - 0.15), bh - 1.0, al, dir, 0.55, 0.12);
    snake(ctx, cx + dir[0] * (r + 0.4), sy + (h - sy) * 0.55, cz + dir[1] * (r + 0.4), (h - sy) * 0.4, al, dir, 0.2, 0.07);
  }
}

/** benin_gatehouse: { c: [x, z of the passage on the wall's outer face], front 's', seed } — a gabled gatehouse over a 5 m passage, posts with plaques at its mouth. */
function gatehouse(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, rand = rng(el.seed ?? 9), wm = wallMat(rand), W = 9.5, D = 11, Y = 0.3, T = 4.9, pw = 2.6;
  for (const s of [-1, 1]) {
    const r = s < 0 ? [cx - W, cz - D, cx - pw, cz] : [cx + pw, cz - D, cx + W, cz];
    bag.add('tuff_red', box(r[0], 0, r[1], r[2], Y, r[3]));
    clayWall(ctx, [r[0] + 0.3, r[1]], [r[0] + 0.3, r[3]], 0.6, Y, T, wm, []); clayWall(ctx, [r[2] - 0.3, r[1]], [r[2] - 0.3, r[3]], 0.6, Y, T, wm, []);
    clayWall(ctx, [r[0], r[1] + 0.3], [r[2], r[1] + 0.3], 0.6, Y, T, wm, []); clayWall(ctx, [r[0], r[3] - 0.3], [r[2], r[3] - 0.3], 0.6, Y, T, wm, [{ at: (r[2] - r[0]) / 2, w: 1.6, h: 2.5 }]);
  }
  bag.add('tuff_red', box(cx - pw, 0, cz - D, cx + pw, 0.12, cz)); col.floor([cx - pw, cz - D, cx + pw, cz], 0.12);
  bag.add('timber', box(cx - W - 0.9, T, cz - D - 0.9, cx + W + 0.9, T + 0.12, cz + 0.9));
  gable(ctx, [cx - W, cz - D, cx + W, cz], T + 0.12, 4.4, SHINGLE, 'x', 0.9);
  for (const s of [-1, 1]) { bird(ctx, cx + s * (W - 0.4), T + 4.5, cz - D / 2, 1.1, s); }
  // the beam across the mouth and the two posts with plaques
  bag.add('wood_dark', box(cx - pw - 0.3, 3.7, cz - 0.9, cx + pw + 0.3, 4.2, cz - 0.4));
  for (const s of [-1, 1]) { pillar(ctx, cx + s * (pw - 0.2), cz + 0.35, 0.12, 4.0, 0.24); for (const y of [1.3, 2.1, 2.9]) plaque(ctx, cx + s * (pw - 0.2), y, cz + 0.6, 's', Math.floor(rand() * 1e6)); }
}

/** benin_wall: { a, b, th, h, openings, near } — a wall of red clay in ridged bands with a coping of shingle. */
function pwall(el, ctx) {
  const rand = rng(el.seed ?? 1), th = el.th ?? 0.9, h = el.h ?? 3.6, mat = wallMat(rand);
  clayWall(ctx, el.a, el.b, th, 0, h, mat, el.openings ?? []);
  const Ln = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), ux = (el.b[0] - el.a[0]) / Ln, uz = (el.b[1] - el.a[1]) / Ln;
  let s = 0;
  for (const o of [...(el.openings ?? []).map((q) => [q.at - q.w / 2, q.at + q.w / 2]).sort((p, q) => p[0] - q[0]), [Ln, Ln]]) {
    if (o[0] - s > 0.05) ctx.bag.add(SHINGLE, orientedBox([el.a[0] + ux * s, el.a[1] + uz * s], [el.a[0] + ux * o[0], el.a[1] + uz * o[0]], th + 0.5, h, h + 0.22));
    s = o[1];
  }
}
export const PALACE_EL = { benin_court: court, benin_hall: hall, benin_tower: tower, benin_gatehouse: gatehouse, benin_wall: pwall };
void hip;
