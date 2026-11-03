// Ming–Qing palace architecture (Beijing, 15th–18th c.) and the courtyard houses of the city round
// it (docs/settlements/qing-beijing.md §4–§5): halls of vermilion columns under yellow glazed
// tiles, beams painted blue and green, double eaves on the greatest halls (a hip roof for the
// first hall of the empire, hip-and-gable for the others, a pyramid for the square hall), white
// marble terraces in three tiers with carved balustrades and stairs with a dragon slab between
// them, red walls with yellow-tiled copings, the gate halls, the corner towers, the Golden Water
// River with its marble bridges, bronze vats, lions and incense burners; outside, grey-brick
// courtyard houses (siheyuan) on lanes (hutong) under grey tiles, red gates, scholar trees.
// Builds on the Ming Jiangnan vocabulary (src/styles/ming/), with the palace's materials.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../ming/index.js';
import { rectRoof, pyramidRoof, column, beamTris, flipTris, latticeBay, mingHall, mingPavilion, mingWall, withPal } from '../ming/index.js';

export const IMPERIAL = { wood: 'paint_caihua', column: 'lacquer_red', soffit: 'paint_caihua', base: 'marble', floor: 'brick_paving', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'palace_wall', plinth: 'marble', roof: 'tile_yellow' };
export const HOUSE = { wood: 'lacquer_red', column: 'lacquer_red', soffit: 'paint_caihua', base: 'brick_grey', floor: 'brick_paving', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'brick_grey', plinth: 'brick_grey', roof: 'tile_grey' };

// nested builders take the materials of the element they are given (el.pal)
const Hall = withPal(mingHall), Wall = withPal(mingWall);

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * A balustrade of white marble along a polyline at height y: posts every `step` metres with their
 * capitals, rails between them, panels below; `open` lists [from, to] distances left open.
 */
function balustrade(bag, col, a, b, y, open = [], step = 1.6) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const P = (s) => [a[0] + ux * s, a[1] + uz * s];
  const isOpen = (s) => open.some(([f, t]) => s > f && s < t);
  const posts = [], rails = [];
  const n = Math.max(1, Math.round(L / step));
  let runStart = null;
  for (let k = 0; k <= n; k++) {
    const s = k * L / n, p = P(s);
    if (isOpen(s)) { if (runStart !== null) { col.segment(P(runStart), P(s - L / n), 0.3, y, y + 1.1); runStart = null; } continue; }
    if (runStart === null) runStart = s;
    posts.push(box(p[0] - 0.12, y, p[1] - 0.12, p[0] + 0.12, y + 1.05, p[1] + 0.12));
    posts.push(lathe([[0.11, 0], [0.13, 0.08], [0.1, 0.2], [0.001, 0.3]], 8, null, p[0], y + 1.05, p[1]));
    if (k < n && !isOpen(s + L / n * 0.5)) {
      const q = P((k + 1) * L / n);
      beamTris(rails, [p[0], y + 0.12, p[1]], [q[0], y + 0.12, q[1]], 0.09, 0.42);     // the panel
      beamTris(rails, [p[0], y + 0.66, p[1]], [q[0], y + 0.66, q[1]], 0.07, 0.12);     // the rail
      beamTris(rails, [p[0], y + 0.86, p[1]], [q[0], y + 0.86, q[1]], 0.06, 0.08);
    }
  }
  if (runStart !== null) col.segment(P(runStart), b, 0.3, y, y + 1.1);
  for (const g of posts) bag.add('marble_smooth', g);
  bag.add('marble_smooth', fromTriangles(rails));
}

/**
 * terrace: a tier of a marble terrace { rect, y0, y1, open: { n|s|e|w: [[from, to], …] } (gaps in
 * the balustrade, measured along the side from its west or north end) }.
 */
function terrace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0, y1 = el.y1;
  bag.add('marble', box(x0, y0 - 0.3, z0, x1, y1 - 0.25, z1));
  bag.add('marble_smooth', box(x0 - 0.12, y1 - 0.25, z0 - 0.12, x1 + 0.12, y1 - 0.05, z1 + 0.12));    // the coping
  bag.add('brick_paving', box(x0 + 0.05, y1 - 0.05, z0 + 0.05, x1 - 0.05, y1, z1 - 0.05));
  // the base moulding: a band of carved lotus petals (a plain torus here)
  bag.add('marble_smooth', box(x0 - 0.18, y0, z0 - 0.18, x1 + 0.18, y0 + 0.35, z1 + 0.18));
  col.floor([x0, z0, x1, z1], y1);
  col.rect([x0, z0, x1, z1], y0 - 0.3, y1 - 0.31);
  const o = el.open || {}, i = 0.25;
  balustrade(bag, col, [x0 + i, z0 + i], [x1 - i, z0 + i], y1, o.n || []);
  balustrade(bag, col, [x0 + i, z1 - i], [x1 - i, z1 - i], y1, o.s || []);
  balustrade(bag, col, [x0 + i, z0 + i], [x0 + i, z1 - i], y1, o.w || []);
  balustrade(bag, col, [x1 - i, z0 + i], [x1 - i, z1 - i], y1, o.e || []);
}

/** stairs: { rect, y0, y1, dir (the way up: n|s|e|w), slab (a carved middle slab, no steps) } — marble steps, side walls. */
function stairs(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1 } = el, dir = el.dir;
  const alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.round((y1 - y0) / 0.16));
  if (el.slab) {
    // the dragon slab (yu lu): one inclined slab of marble carved with clouds and dragons
    const t = [];
    const lo = (d) => (dir === 'n' ? [z1, z1 - d] : dir === 's' ? [z0, z0 + d] : dir === 'e' ? [x0, x0 + d] : [x1, x1 - d]);
    const [a, bb] = lo(len);
    if (alongZ) { t.push(x0, y0, a, x1, y0, a, x1, y1, bb, x0, y0, a, x1, y1, bb, x0, y1, bb); }
    else { t.push(a, y0, z0, a, y0, z1, bb, y1, z1, a, y0, z0, bb, y1, z1, bb, y1, z0); }
    bag.add('marble_smooth', fromTriangles(t.concat(flipTris(t))));
    col.rect([x0, z0, x1, z1], y0, (y0 + y1) / 2);
    return;
  }
  for (let k = 0; k < n; k++) {
    const f0 = k / n, f1 = (k + 1) / n, yy = y0 + (y1 - y0) * f1;
    let r;
    if (dir === 'n') r = [x0, z1 - len * f1, x1, z1 - len * f0];
    else if (dir === 's') r = [x0, z0 + len * f0, x1, z0 + len * f1];
    else if (dir === 'e') r = [x0 + len * f0, z0, x0 + len * f1, z1];
    else r = [x1 - len * f1, z0, x1 - len * f0, z1];
    bag.add('marble', box(r[0], y0 - 0.2, r[1], r[2], yy, r[3]));
  }
  col.ramp([x0, z0, x1, z1], y0, y1, dir);
}

/**
 * qing_hall: a palace hall { rect, y, H (the lower eaves; the only eaves when single), double
 * (upper storey height over the lower eaves), roof ('hip' | 'xieshan' | 'gable'), bays [n, d], front, four }.
 * Double eaves: the lower roof runs round as a skirt, the upper body is set in by one bay.
 */
function qingHall(el, ctx) {
  const { bag, col } = ctx;
  const [x0, z0, x1, z1] = el.rect, along = x1 - x0 >= z1 - z0;
  const lower = { ...el, t: 'ming_hall', roof: el.double ? 'none' : (el.roof || 'xieshan'), front: el.front || 's' };
  mingHall(lower, ctx);
  if (!el.double) return;
  const H = el.H, y = el.y, inset = el.inset ?? Math.min((x1 - x0), (z1 - z0)) / ((el.bays?.[1] ?? 4) + 0.5);
  // the lower roof: a skirt of tiles from the eaves up to the upper body's wall
  const o = el.eave ?? 1.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, A = (along ? x1 - x0 : z1 - z0) / 2 + o, B = (along ? z1 - z0 : x1 - x0) / 2 + o;
  rectRoof({ c: [cx, cz], A, B, y: y + H - 0.25, rise: (inset + o) * 0.55, p: 1.25, kind: 'hip', sweep: el.sweep ?? 0.5, alongZ: !along, mat: 'tile_yellow', soffit: 'paint_caihua' }, bag);
  // the upper body: red walls with a band of lattice windows, the painted frieze, the upper eaves
  const u = [x0 + inset, z0 + inset, x1 - inset, z1 - inset], yb = y + H, D = el.double;
  bag.add('palace_wall', box(u[0], yb - 0.2, u[1], u[2], yb + D - 1.2, u[3]));
  for (const [a, b] of [[[u[0], u[3] + 0.02], [u[2], u[3] + 0.02]], [[u[2], u[1] - 0.02], [u[0], u[1] - 0.02]]]) latticeBay(bag, null, a, b, yb + D * 0.35, D * 0.4, 'window', 0.03);
  bag.add('paint_caihua', box(u[0] - 0.05, yb + D - 1.2, u[1] - 0.05, u[2] + 0.05, yb + D - 0.2, u[3] + 0.05));
  const xs = [], zs = [], nb = el.bays?.[0] ?? 7, nd = el.bays?.[1] ?? 4;
  for (let i = 0; i <= nb - 2; i++) xs.push(u[0] + (u[2] - u[0]) * i / Math.max(1, nb - 2));
  for (let j = 0; j <= nd - 2; j++) zs.push(u[1] + (u[3] - u[1]) * j / Math.max(1, nd - 2));
  const cols = along ? [xs, zs] : [zs, xs];
  for (const x of (along ? cols[0] : cols[1])) for (const z of [u[1], u[3]]) column(bag, null, x, z, yb - 0.2, D - 0.2, 0.42, 'lacquer_red');
  const A2 = (along ? u[2] - u[0] : u[3] - u[1]) / 2 + o * 1.1, B2 = (along ? u[3] - u[1] : u[2] - u[0]) / 2 + o * 1.1;
  rectRoof({ c: [cx, cz], A: A2, B: B2, y: yb + D - 0.25, rise: el.rise ?? B2 * 0.78, kind: el.roof || 'hip', sweep: el.sweep ?? 0.6, alongZ: !along, mat: 'tile_yellow', soffit: 'paint_caihua', gableAt: 0.45 }, bag);
  // the guardian beasts on the hips (a row of little figures; here a row of knobs) and the ridge's dragon ends
  const R = el.rise ?? B2 * 0.78, top = yb + D - 0.25 + R, L = el.roof === 'hip' ? A2 - B2 : A2 * 0.6, beasts = [];
  for (const s of [-1, 1]) {
    const e = along ? [cx + s * (L + 0.2), cz] : [cx, cz + s * (L + 0.2)];
    bag.add('tile_yellow', box(e[0] - 0.5, top - 0.1, e[1] - 0.5, e[0] + 0.5, top + 1.9, e[1] + 0.5));       // chiwen
  }
  void beasts; void col;
}

/** palace_wall: a red wall { a, b, y, h, th, gates } with a marble footing and a coping of yellow tiles. */
const palaceWall = (el, ctx) => mingWall({ ...el, pal: undefined }, ctx);

/** A bronze vat (on its marble stand), an incense burner (a tripod on a pedestal), a lion on its plinth. */
function bronze(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  if (el.kind === 'vat') {
    bag.add('marble', box(x - 1.0, y, z - 1.0, x + 1.0, y + 0.45, z + 1.0));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.9, 0.05], [1.12, 0.5], [1.18, 1.0], [1.05, 1.35], [1.1, 1.42], [0.95, 1.42], [0.001, 1.3]], 18, null, x, y + 0.45, z));
    col.circle(x, z, 1.15, y, y + 1.9);
  } else if (el.kind === 'tripod') {
    bag.add('marble', box(x - 0.9, y, z - 0.9, x + 0.9, y + 1.0, z + 0.9));
    bag.add('bronze', lathe([[0.001, 0], [0.6, 0.15], [0.75, 0.6], [0.55, 0.95], [0.62, 1.05], [0.25, 1.3], [0.3, 1.9], [0.12, 2.3], [0.001, 2.5]], 12, null, x, y + 1.0, z));
    col.circle(x, z, 0.95, y, y + 3.5);
  } else {
    // a lion: a body leaning back on its haunches, the head with its mane, on a plinth
    const s = el.s ?? 1, f = el.face ?? [0, 1];
    bag.add('marble', box(x - 1.1 * s, y, z - 1.5 * s, x + 1.1 * s, y + 1.4 * s, z + 1.5 * s));
    const y1 = y + 1.4 * s;
    bag.add('bronze', lathe([[0.001, 0], [0.55, 0.05], [0.6, 0.5], [0.5, 1.2], [0.42, 1.5], [0.001, 1.55]], 10, null, x - f[0] * 0.25 * s, y1, z - f[1] * 0.25 * s));
    bag.add('bronze', lathe([[0.001, 0], [0.45, 0.1], [0.55, 0.45], [0.42, 0.8], [0.001, 0.9]], 10, null, x + f[0] * 0.2 * s, y1 + 1.45 * s, z + f[1] * 0.2 * s));
    col.rect([x - 1.1 * s, z - 1.5 * s, x + 1.1 * s, z + 1.5 * s], y, y + 4 * s);
  }
}

/**
 * corner_tower: the tower over a corner of the palace wall { c, y, s } — a square pavilion with a
 * wing to each side, each wing with its own gabled roof, eaves over eaves (here three tiers).
 */
function cornerTower(el, ctx) {
  const [cx, cz] = el.c, y = el.y, s = el.s ?? 1, pal = IMPERIAL;
  const w = 7 * s, d = 4.5 * s, H = 4.2 * s;
  // the core and its four wings (lower), then the upper square roof
  Hall({ rect: [cx - w / 2, cz - w / 2, cx + w / 2, cz + w / 2], y, H: H + 3 * s, front: 's', four: true, roof: 'none', plat: 0.2, bays: [3, 3], pal }, ctx);
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const r = dx ? [cx + (dx > 0 ? w / 2 : -w / 2 - d), cz - w / 2 + 1, cx + (dx > 0 ? w / 2 + d : -w / 2), cz + w / 2 - 1] : [cx - w / 2 + 1, cz + (dz > 0 ? w / 2 : -w / 2 - d), cx + w / 2 - 1, cz + (dz > 0 ? w / 2 + d : -w / 2)];
    Hall({ rect: r, y, H, front: dx > 0 ? 'e' : dx < 0 ? 'w' : dz > 0 ? 's' : 'n', four: true, roof: 'none', plat: 0.2, bays: [2, 1], pal }, ctx);
    const along = dx !== 0;
    rectRoof({ c: [(r[0] + r[2]) / 2 + dx * 0.6, (r[1] + r[3]) / 2 + dz * 0.6], A: (along ? r[2] - r[0] : r[3] - r[1]) / 2 + 1.2, B: (along ? r[3] - r[1] : r[2] - r[0]) / 2 + 1.0, y: y + H - 0.2, rise: 2.4 * s, kind: 'xieshan', sweep: 0.6, alongZ: !along, mat: 'tile_yellow', soffit: 'paint_caihua' }, ctx.bag);
  }
  pyramidRoof([[cx - w / 2 - 1.4, cz - w / 2 - 1.4], [cx + w / 2 + 1.4, cz - w / 2 - 1.4], [cx + w / 2 + 1.4, cz + w / 2 + 1.4], [cx - w / 2 - 1.4, cz + w / 2 + 1.4]], y + H + 3 * s - 0.2, w * 0.62, 0.6, ctx.bag, 'tile_yellow', 'paint_caihua');
}

/**
 * siheyuan: a courtyard house of the city { rect, seed } facing south: grey-brick walls, the gate at
 * the south-east corner with its red doors, the screen wall inside it, the inverted house along the
 * lane, the main house on the north side (raised a little, three or five bays), the side houses
 * east and west, the courtyard paved with brick.
 */
function siheyuan(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, pal = HOUSE;
  el.simple = true;
  const wall = (a, b, gates = []) => Wall({ a, b, y: 0, h: 3.0, th: 0.42, gates, pal, simple: true }, ctx);
  // the outer walls, the gate opening in the south wall near its east end
  const gx = x1 - 3.4;
  wall([x0, z1], [x1, z1], [{ at: gx - x0, w: 1.6, h: 2.4 }]);
  wall([x0, z0], [x1, z0]); wall([x0, z0], [x0, z1]); wall([x1, z0], [x1, z1]);
  // the gatehouse: a small gabled roof over the gate, red doors standing open
  Hall({ rect: [gx - 1.6, z1 - 3.6, gx + 1.6, z1 - 0.2], y: 0.35, H: 3.1, front: 's', four: false, roof: 'gable', plat: 0.35, bays: [1, 1], pal, eave: 0.7 }, ctx);
  bag.add('lacquer_red', box(gx - 0.8, 0.35, z1 - 0.5, gx - 0.74, 2.6, z1 + 0.1));
  // the screen wall facing the gate
  Wall({ a: [gx - 1.8, z1 - 6.2], b: [gx + 1.8, z1 - 6.2], y: 0, h: 2.6, th: 0.36, pal }, ctx);
  // the houses round the courtyard
  const dN = Math.min(7.5, D * 0.3), dS = Math.min(5.5, D * 0.2), dE = Math.min(5.0, W * 0.24);
  const main = [x0 + dE * 0.4, z0 + 0.6, x1 - dE * 0.4, z0 + 0.6 + dN];
  Hall({ rect: main, y: 0.6, H: 3.4, front: 's', four: false, roof: 'gable', plat: 0.6, bays: [W > 22 ? 5 : 3, 2], pal, eave: 0.9 }, ctx);
  Hall({ rect: [x0 + 0.6, z1 - 0.6 - dS, gx - 2.2, z1 - 0.6], y: 0.3, H: 3.0, front: 'n', four: false, roof: 'gable', plat: 0.3, bays: [3, 1], pal, eave: 0.7 }, ctx);
  const sz0 = main[3] + 1.6, sz1 = z1 - dS - 2.4;
  if (sz1 - sz0 > 4) {
    Hall({ rect: [x0 + 0.6, sz0, x0 + 0.6 + dE, sz1], y: 0.4, H: 3.1, front: 'e', four: false, roof: 'gable', plat: 0.4, bays: [3, 1], pal, eave: 0.8 }, ctx);
    Hall({ rect: [x1 - 0.6 - dE, sz0, x1 - 0.6, sz1], y: 0.4, H: 3.1, front: 'w', four: false, roof: 'gable', plat: 0.4, bays: [3, 1], pal, eave: 0.8 }, ctx);
  }
  // the courtyard: brick paving with stone paths crossing it
  bag.add('brick_paving', box(x0 + 0.3, -0.2, z0 + 0.3, x1 - 0.3, 0.03, z1 - 0.3));
  col.floor([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], 0.03);
  if (rand() < 0.5) bronze({ kind: 'vat', at: [(x0 + x1) / 2 + 3, (sz0 + sz1) / 2], y: 0, }, { bag, col });
}

/** hutong: a lane of beaten earth and brick { rect, y } (walkable). */
function lane(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add(el.mat || 'brick_paving', box(x0, -0.3, z0, x1, el.y ?? 0.02, z1));
  col.floor(el.rect, el.y ?? 0.02);
}

/** block: a solid mass { rect, y0, y1, mat } with a walkable top. */
function block(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add(el.mat || 'palace_wall', box(x0, el.y0 - 0.3, z0, x1, el.y1, z1));
  col.floor(el.rect, el.y1);
  if (el.y1 - el.y0 > 0.4) col.rect(el.rect, el.y0 - 0.3, el.y1 - 0.31);
}
/** pyramid: a pyramidal roof of yellow tiles over a polygon { poly, y, rise, sweep }. */
function pyramid(el, { bag }) { pyramidRoof(el.poly, el.y, el.rise, el.sweep ?? 0.6, bag, el.mat || 'tile_yellow', el.soffit || 'paint_caihua'); }
/** rail: a marble balustrade { a, b, y, open: [[from, to], …] }. */
function rail(el, { bag, col }) { balustrade(bag, col, el.a, el.b, el.y, el.open || []); }

registerStyle('qing', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.ming.elements,
    terrace: withPal(terrace), stairs: withPal(stairs), bronze: withPal(bronze), lane: withPal(lane),
    qing_hall: (el, ctx) => withPal(qingHall)({ ...el, pal: el.pal || IMPERIAL }, ctx),
    palace_wall: (el, ctx) => withPal(palaceWall)({ ...el, pal: { plaster: 'palace_wall', roof: 'tile_yellow', plinth: 'marble' } }, ctx),
    corner_tower: withPal(cornerTower), siheyuan: (el, ctx) => withPal(siheyuan)({ ...el, simple: true }, ctx), block: withPal(block), pyramid: withPal(pyramid), rail: withPal(rail),
  },
  objects: {},
});
