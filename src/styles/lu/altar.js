// The Apricot Altar (Xingtan), docs/settlements/lu-qufu.md §12: the square pavilion in the middle of the court before the Dacheng Hall, "double eaves,
// yellow tiles", its "ceiling a sunk panel carved with golden dragons", the stele "杏坛" in seal script; rebuilt in 1569. Ours: a stone platform with
// a carved balustrade and a stair on each side; twelve red posts on stone drums under painted beams and bracket sets; four taller inner posts
// carrying a clerestory of lattice; a lower hip roof; over it the upper roof of two crossed xieshan roofs (shi zi ji, the "cross ridge": a gable on each
// of the four faces); inside, the caisson ceiling with its gilt dragon, the stele on its tortoise and the bronze burner.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris, latticeBay, withPal } from '../ming/index.js';
import { dougong, dougongHeight } from '../qing/caihua.js';
import { Parts, tripod, balustradeCarved, roofOrnaments, merge } from '../qing/carving.js';
import { dragon } from '../qing/throne.js';
import { stele } from './ritual.js';
import { glyph } from './plaques.js';
import { tileCourses } from './tiles.js';

const TILE = 'tile_yellow';
/** rectRoof in its light build (fewer rings: the roofs of a pavilion this small are smooth enough, and the plan's yellow tile mesh must stay under 80,000 triangles). */
const roof = (r, bag) => withPal((e, c) => rectRoof(c.r, c.bag))({ simple: true }, { r, bag });

/** lu_altar: { c: [x, z], y } — the pavilion on its platform (the stairs are in the plan). */
export function altar(el, ctx) {
  // every piece of the altar is gathered by material and put into the plan as ONE geometry per material (so that its many small pieces join the
  // big mesh of their material in the plan and make no draw of their own: the arrival's draws must not rise)
  const { col } = ctx, G = new Parts();
  const bag = { add: (m, g) => { if (g) G.add(m, g); } };
  build(el, bag, col);
  for (const [m, list] of G.m) ctx.bag.add(m, merge(list));
}
function build(el, bag, col) {
  const [cx, cz] = el.c, y = el.y ?? 0.6, a = 4.1, u = 2.4, H = 5.2, o1 = 1.8, D = 3.6;
  const bk = dougongHeight({ tiers: 2 }), yb = y + H + bk, yu = yb + D - 0.25 + bk;
  // ── the platform: two courses of marble, a brick floor, a carved balustrade round it with a gap at each stair ──
  bag.add('marble', box(cx - 6.2, y - 0.7, cz - 6.2, cx + 6.2, y - 0.1, cz + 6.2));
  bag.add('marble_smooth', box(cx - 6.3, y - 0.12, cz - 6.3, cx + 6.3, y, cz + 6.3));
  bag.add('brick_paving', box(cx - 5.9, y - 0.02, cz - 5.9, cx + 5.9, y + 0.02, cz + 5.9));
  col.rect([cx - 6.3, cz - 6.3, cx + 6.3, cz + 6.3], -0.7, y - 0.15); col.floor([cx - 6.3, cz - 6.3, cx + 6.3, cz + 6.3], y);
  {
    const q = 6.0, run = [[[cx - q, cz - q], [cx + q, cz - q]], [[cx + q, cz - q], [cx + q, cz + q]], [[cx + q, cz + q], [cx - q, cz + q]], [[cx - q, cz + q], [cx - q, cz - q]]];
    // the gaps lie in the middle of each side, whose length is 2q
    run.forEach(([p0, p1], i) => balustradeCarved(bag, col, p0, p1, y, [[q - 2.0, q + 2.0]], { step: 1.5, skipEnds: i > 0 }));
  }
  // ── the posts: twelve outer on stone drums, four inner (jin zhu) rising through both storeys ──
  const post = (x, z, h, r, k) => {
    bag.add('granite_grey', lathe([[0.5 + k * 0.001, 0], [0.5, 0.1], [0.4, 0.22], [0.001, 0.22]], 12, null, x, y, z));
    bag.add('lacquer_red', lathe([[r, 0], [r * 0.93, h * 0.55], [r * 0.9, h], [0.001, h]], 12, null, x, y + 0.22, z));
    col.circle(x, z, r, y, y + h);
  };
  let k = 0;
  const ls = [-a, -a / 3, a / 3, a];
  for (const sx of ls) for (const sz of ls) if (Math.abs(sx) === a || Math.abs(sz) === a) post(cx + sx, cz + sz, H - 0.22, 0.3, k++);
  for (const sx of [-u, u]) for (const sz of [-u, u]) post(cx + sx, cz + sz, H + bk + D - 0.4, 0.27, k++);
  // ── the architraves of the outer ring and of the inner ring, with their gilt line; ties between them ──
  for (const [d, wd] of [[a, 0.3], [u, 0.28]]) {
    for (const s of [-1, 1]) {
      bag.add('paint_caihua', box(cx - d - 0.3, y + H - 0.85, cz + s * d - wd / 2, cx + d + 0.3, y + H - 0.12, cz + s * d + wd / 2));
      bag.add('paint_caihua', box(cx + s * d - wd / 2, y + H - 0.85, cz - d - 0.3, cx + s * d + wd / 2, y + H - 0.12, cz + d + 0.3));
      bag.add('gilt_bronze', box(cx - d - 0.3, y + H - 0.2, cz + s * d + s * wd / 2, cx + d + 0.3, y + H - 0.16, cz + s * d + s * (wd / 2 + 0.015)));
      bag.add('gilt_bronze', box(cx + s * d + s * wd / 2, y + H - 0.2, cz - d - 0.3, cx + s * d + s * (wd / 2 + 0.015), y + H - 0.16, cz + d + 0.3));
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const t = []; beamTris(t, [cx + sx * (a - 0.3), y + H - 0.5, cz + sz * (a - 0.3)], [cx + sx * (u + 0.2), y + H - 0.5, cz + sz * (u + 0.2)], 0.3, 0.4);
    bag.add('paint_caihua', fromTriangles(t));
  }
  // the bracket sets of the lower eaves, on the plate of the outer ring; the lower hip roof over them
  const lower = { c: [cx, cz], A: a + o1, B: a + o1, y: y + H - 0.25 + bk, rise: (a - u + o1) * 0.55, p: 1.25, kind: 'hip', sweep: 0.5, mat: TILE, soffit: 'paint_caihua' };
  const under = (r, set) => (d) => r.y + r.rise * Math.pow(Math.max(0, (set - d) / r.B), r.p ?? 1.7) - 0.14;
  dougong(bag, [cx - a, cz - a, cx + a, cz + a], [ls.map((v) => cx + v), ls.map((v) => cz + v)], y + H - 0.17, { tiers: 2, pitch: 1.0 }, under(lower, o1));
  roof(lower, bag);
  tileCourses(bag, lower, { reach: a - u + o1 - 0.3, seed: 1 });
  roofOrnaments(bag, lower, { mat: TILE, ends: false, figures: 0, tLimit: (a - u + o1) / (a + o1), reach: 0.75 });
  // ── the clerestory between the roofs: a red board course, lattice, the painted frieze; four short posts at the middle of the sides ──
  for (const s of [-1, 1]) {
    bag.add('lacquer_red', box(cx - u, yb - 0.2, cz + s * u - 0.06, cx + u, yb + 0.9, cz + s * u + 0.06));
    bag.add('lacquer_red', box(cx + s * u - 0.06, yb - 0.2, cz - u, cx + s * u + 0.06, yb + 0.9, cz + u));
    latticeBay(bag, null, [cx - u, cz + s * u], [cx + u, cz + s * u], yb + 0.9, D - 2.15, 'pane', 0.03, 'lattice');
    latticeBay(bag, null, [cx + s * u, cz - u], [cx + s * u, cz + u], yb + 0.9, D - 2.15, 'pane', 0.03, 'lattice');
    bag.add('paint_caihua', box(cx - u - 0.1, yb + D - 1.2, cz + s * u - 0.14, cx + u + 0.1, yb + D - 0.2, cz + s * u + 0.14));
    bag.add('paint_caihua', box(cx + s * u - 0.14, yb + D - 1.2, cz - u - 0.1, cx + s * u + 0.14, yb + D - 0.2, cz + u + 0.1));
    bag.add('lacquer_red', lathe([[0.17, 0], [0.15, D - 1.4], [0.001, D - 1.4]], 8, null, cx, yb - 0.2, cz + s * u));
    bag.add('lacquer_red', lathe([[0.17, 0], [0.15, D - 1.4], [0.001, D - 1.4]], 8, null, cx + s * u, yb - 0.2, cz));
  }
  // the upper bracket sets, on the plate of the inner ring
  const arm = (alongZ, sweep) => ({ c: [cx, cz], A: u + 2.4, B: u + 0.95, y: yu, rise: (u + 0.95) * 0.78, kind: 'xieshan', sweep, alongZ, gableAt: 0.45, mat: TILE, soffit: 'paint_caihua', curl: false });
  const r1 = arm(false, 0.5), r2 = arm(true, 0.5);
  dougong(bag, [cx - u, cz - u, cx + u, cz + u], [[cx - u, cx, cx + u], [cz - u, cz, cz + u]], yb + D - 0.2, { tiers: 2, pitch: 1.0 }, under(r1, 0.95));
  // ── the upper roof: two xieshan crossed (the cross ridge), a gable on each face ──
  for (const r of [r1, r2]) { roof(r, bag); tileCourses(bag, r, { seed: r.alongZ ? 4 : 3 }); roofOrnaments(bag, r, { mat: TILE, ends: true, figures: 0 }); }
  const top = yu + r1.rise;
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.3, 0.02], [0.34, 0.2], [0.2, 0.34], [0.26, 0.55], [0.2, 0.8], [0.1, 1.0], [0.12, 1.15], [0.001, 1.7]], 12, null, cx, top - 0.05, cz));   // the gilt finial (baoding) at the crossing
  // ── inside: the ceiling (coffers round a caisson with the gilt dragon), the stele on its tortoise, the bronze burner ──
  {
    const cy = yb + D - 0.2 - 0.37, n = 6, s = 2 * u / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i > 0 && i < n - 1 && j > 0 && j < n - 1) continue;
      const ax = cx - u + i * s, az = cz - u + j * s;
      bag.add('paint_blue', box(ax + 0.05, cy, az + 0.05, ax + s - 0.05, cy + 0.04, az + s - 0.05));
      bag.add('paint_caihua', box(ax - 0.05, cy - 0.1, az - 0.05, ax + 0.05, cy + 0.05, az + s + 0.05)); bag.add('paint_caihua', box(ax - 0.05, cy - 0.1, az - 0.05, ax + s + 0.05, cy + 0.05, az + 0.05));
      bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.02], [0.15, 0.05], [0.001, 0.08]], 8, null, ax + s / 2, cy - 0.04, az + s / 2));
    }
    bag.add('paint_caihua', box(cx + u - 0.05, cy - 0.1, cz - u - 0.05, cx + u + 0.05, cy + 0.05, cz + u + 0.05)); bag.add('paint_caihua', box(cx - u - 0.05, cy - 0.1, cz + u - 0.05, cx + u + 0.05, cy + 0.05, cz + u + 0.05));
    const hw = 1.6;                                                    // the caisson's half side
    for (const [m, e, d0, d1] of [['paint_caihua', 0.0, -0.1, 0.06], ['gilt_bronze', 0.12, -0.2, -0.1], ['lacquer_red', 0.26, -0.28, -0.2]]) bag.add(m, box(cx - hw + e, cy + d0, cz - hw + e, cx + hw - e, cy + d1, cz + hw - e));
    bag.add('paint_blue', box(cx - hw + 0.4, cy - 0.32, cz - hw + 0.4, cx + hw - 0.4, cy - 0.28, cz + hw - 0.4));
    const Cq = new Parts(), pts = [];
    for (let q = 0; q <= 30; q++) { const ang = 0.4 + q * 0.34, R = 1.12 - q * 0.025; pts.push([Math.cos(ang) * R, Math.sin(ang) * R, 0]); }
    pts[0] = [pts[1][0] * 0.7, pts[1][1] * 0.7, 0.1];
    dragon(Cq, 'gilt_bronze', pts, 0.1, { up: [0, 0, 1], flat: 0.55, head: 1.2 });
    for (const [mat, list] of Cq.m) for (const g of list) { g.rotateX(Math.PI / 2); g.translate(cx, cy - 0.28, cz); bag.add(mat, g); }
    bag.add('gilt_bronze', lathe([[0.001, -0.5], [0.14, -0.44], [0.2, -0.32], [0.14, -0.2], [0.001, -0.15]], 10, null, cx, cy - 0.3, cz));
    bag.add('gilt_bronze', lathe([[0.01, -0.15], [0.01, 0]], 4, null, cx, cy - 0.3, cz));
  }
  // the stele "杏坛" on its tortoise in the middle of the floor, facing south, the characters in seal script on its face
  stele({ at: [cx, cz - 0.3], y, yaw: 0, s: 0.8, h: 2.5 }, { bag, col });
  {
    const top = y + 1.25 * 0.8, h = 2.5 * 0.8;
    ['杏', '坛'].forEach((ch, i) => glyph(bag, ch, cx, top + h * 0.7 - i * 0.78, cz - 0.3 + 0.2 * 0.8 + 0.02, 0, 0.7));
  }
  // the bronze burner before it
  { const P = new Parts(); tripod(P, 'bronze', 'marble'); P.emit(bag, cx, y, cz + 2.4, 0, 0.62); col.rect([cx - 0.6, cz + 2.4 - 0.6, cx + 0.6, cz + 2.4 + 0.6], y, y + 1.4); }
  // the name board over the south lower eave: black field, gilt frame, 杏坛 (on the beam over the stair's middle bay)
  {
    const zf = cz + a + 0.2, yy = y + H - 1.9, w = 1.8, h = 1.0;
    bag.add('gilt_bronze', box(cx - w / 2 - 0.08, yy - 0.08, zf - 0.04, cx + w / 2 + 0.08, yy + h + 0.08, zf + 0.04));
    bag.add('lacquer_black', box(cx - w / 2, yy, zf, cx + w / 2, yy + h, zf + 0.06));
    ['杏', '坛'].forEach((ch, i) => glyph(bag, ch, cx + (i - 0.5) * 0.7, yy + h / 2, zf + 0.09, 0, 0.62));
  }
}
