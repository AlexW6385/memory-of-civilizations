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
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import '../ming/index.js';
import { rectRoof, pyramidRoof, column, beamTris, flipTris, latticeBay, mingHall, mingPavilion, mingWall, withPal } from '../ming/index.js';
import { dapo, dapoHeight, meoricho, postLines } from '../joseon/dancheong.js';
import { throneHall } from './throne.js';
import { Parts, sumeru, post, limb as limbG, seated, crouching, vat, tripod, tortoise, crane, sundial, jialiang, balustradeCarved, spout, roofOrnaments, gateDoors } from './carving.js';

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
  const gk = el.carve === 'joseon' ? (el.pal?.base || 'granite_korea') : null;
  bag.add(gk || 'marble', box(x0, y0 - 0.3, z0, x1, y1 - 0.25, z1));
  bag.add(gk || 'marble_smooth', box(x0 - 0.12, y1 - 0.25, z0 - 0.12, x1 + 0.12, y1 - 0.05, z1 + 0.12));    // the coping
  bag.add('brick_paving', box(x0 + 0.05, y1 - 0.05, z0 + 0.05, x1 - 0.05, y1, z1 - 0.05));
  // the base moulding: a band of carved lotus petals (a plain torus here)
  bag.add(gk || 'marble_smooth', box(x0 - 0.18, y0, z0 - 0.18, x1 + 0.18, y0 + 0.35, z1 + 0.18));
  col.floor([x0, z0, x1, z1], y1);
  col.rect([x0, z0, x1, z1], y0 - 0.3, y1 - 0.31);
  const o = el.open || {}, i = 0.25;
  if (!el.carve) {
    balustrade(bag, col, [x0 + i, z0 + i], [x1 - i, z0 + i], y1, o.n || []);
    balustrade(bag, col, [x0 + i, z1 - i], [x1 - i, z1 - i], y1, o.s || []);
    balustrade(bag, col, [x0 + i, z0 + i], [x0 + i, z1 - i], y1, o.w || []);
    balustrade(bag, col, [x1 - i, z0 + i], [x1 - i, z1 - i], y1, o.e || []);
    return;
  }
  // the carved balustrade (el.carve: 'qing' | 'joseon'); under each post of a Qing terrace a
  // dragon-head spout juts from the face below the coping, and a great one from each corner
  const stone = el.carve === 'joseon' ? (el.pal?.base || 'granite_korea') : 'marble_smooth', bo = { carve: el.carve, mat: stone, beasts: el.beasts };
  const sides = [['n', [x0 + i, z0 + i], [x1 - i, z0 + i], [0, -1]], ['s', [x0 + i, z1 - i], [x1 - i, z1 - i], [0, 1]], ['w', [x0 + i, z0 + i], [x0 + i, z1 - i], [-1, 0]], ['e', [x1 - i, z0 + i], [x1 - i, z1 - i], [1, 0]]];
  for (const [k, a, b, f] of sides) {
    const posts = balustradeCarved(bag, col, a, b, y1, o[k] || [], { ...bo, skipEnds: k === 'w' || k === 'e' });
    if (el.carve !== 'qing' || el.spouts === false) continue;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = Math.atan2(f[0], f[1]);
    for (const s of posts) {
      if (s < 0.5 || s > L - 0.5) continue;
      const u = s / L, px = a[0] + (b[0] - a[0]) * u, pz = a[1] + (b[1] - a[1]) * u;
      const P = new Parts(); spout(P, stone);
      P.emit(bag, f[0] ? (f[0] < 0 ? x0 : x1) : px, y1 - 0.42, f[1] ? (f[1] < 0 ? z0 : z1) : pz, yaw);
    }
  }
  if (el.carve === 'qing' && el.spouts !== false) for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const P = new Parts(); spout(P, stone);
    P.emit(bag, sx < 0 ? x0 + 0.05 : x1 - 0.05, y1 - 0.62, sz < 0 ? z0 + 0.05 : z1 - 0.05, Math.atan2(sx, sz), 1.7);
  }
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
    bag.add(el.mat || 'marble', box(r[0], y0 - 0.2, r[1], r[2], yy, r[3]));
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
  const orn = el.orn, omat = el.pal?.roof || 'tile_yellow', osoff = el.pal?.soffit || 'paint_caihua';
  const ornament = (r, figures, ends) => roofOrnaments(bag, r, { mat: omat, joseon: !!orn.joseon, white: !!orn.joseon && ends, figures, ends, lead: orn.lead });
  const lower = { ...el, t: 'ming_hall', roof: el.double || orn ? 'none' : (el.roof || 'xieshan'), front: el.front || 's' };
  mingHall(lower, ctx);
  // Joseon: moru dancheong at the beams' ends, dapo bracket sets under the eaves (raising them by bk)
  const jo = !!orn?.joseon, bk = el.dapo ? dapoHeight(el.dapo) : 0, fy = el.y + (el.H ?? 4.2);
  if (jo) meoricho(bag, el.rect, postLines(el), fy - 0.55, fy - 0.17, 0.14);
  /** The underside of roof r at d metres out from a wall line set back by `set` from its eave. */
  const under = (r, set) => (d) => r.y + r.rise * Math.pow(Math.max(0, (set - d) / r.B), r.p ?? 1.7) - 0.14;
  if (!el.double) {
    if (!orn) return;
    // the roof drawn here (as ming_hall draws it, its ridge without curled ends) to carry its ornaments
    const o1 = el.eave ?? 1.25, L1 = along ? x1 - x0 : z1 - z0, D1 = along ? z1 - z0 : x1 - x0;
    const r = { c: [(x0 + x1) / 2, (z0 + z1) / 2], A: L1 / 2 + o1, B: D1 / 2 + o1, y: fy - 0.25 + bk, rise: el.rise ?? (D1 / 2 + o1) * 0.62, kind: el.roof || 'xieshan', sweep: el.sweep ?? 1.0, alongZ: !along, mat: omat, soffit: osoff, curl: false };
    if (bk) dapo(bag, el.rect, postLines(el), fy - 0.17, el.dapo, under(r, o1));
    rectRoof(r, bag);
    ornament(r, orn.figures ?? 0, true);
    return;
  }
  const H = el.H, y = el.y, inset = el.inset ?? Math.min((x1 - x0), (z1 - z0)) / ((el.bays?.[1] ?? 4) + 0.5);
  // the lower roof: a skirt of tiles from the eaves up to the upper body's wall
  const o = el.eave ?? 1.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, A = (along ? x1 - x0 : z1 - z0) / 2 + o, B = (along ? z1 - z0 : x1 - x0) / 2 + o;
  const skirt = { c: [cx, cz], A, B, y: y + H - 0.25 + bk, rise: (inset + o) * 0.55, p: 1.25, kind: 'hip', sweep: el.sweep ?? 0.5, alongZ: !along, mat: el.pal?.roof || 'tile_yellow', soffit: el.pal?.soffit || 'paint_caihua' };
  if (bk) dapo(bag, el.rect, postLines(el), y + H - 0.17, el.dapo, under(skirt, o));
  rectRoof(skirt, bag);
  if (orn) roofOrnaments(bag, skirt, { mat: omat, joseon: !!orn.joseon, ends: false, figures: orn.lower ?? orn.figures ?? 0, lead: orn.lead, tLimit: (inset + o) / B, reach: 0.75 });
  // the upper body: red walls with a band of lattice windows, the painted frieze, the upper eaves;
  // a Joseon hall's white plaster between dancheong rails (sill, the rails round the window band)
  const u = [x0 + inset, z0 + inset, x1 - inset, z1 - inset], yb = y + H + bk, D = el.double;
  bag.add(jo ? (el.pal?.plaster || 'plaster_white') : 'palace_wall', box(u[0], yb - 0.2, u[1], u[2], yb + D - 1.2, u[3]));
  for (const [a, b] of [[[u[0], u[3] + 0.02], [u[2], u[3] + 0.02]], [[u[2], u[1] - 0.02], [u[0], u[1] - 0.02]]]) latticeBay(bag, null, a, b, yb + D * 0.35, D * 0.4, 'window', 0.03);
  const wood = jo ? (el.pal?.wood || 'paint_dancheong') : 'paint_caihua';
  bag.add(wood, box(u[0] - 0.05, yb + D - 1.2, u[1] - 0.05, u[2] + 0.05, yb + D - 0.2, u[3] + 0.05));
  if (jo) for (const [ya, yc] of [[yb - 0.15, yb + 0.28], [yb + D * 0.35 - 0.16, yb + D * 0.35], [yb + D * 0.75, yb + D * 0.75 + 0.14]]) bag.add(wood, box(u[0] - 0.07, ya, u[1] - 0.07, u[2] + 0.07, yc, u[3] + 0.07));
  const xs = [], zs = [], nb = el.bays?.[0] ?? 7, nd = el.bays?.[1] ?? 4;
  for (let i = 0; i <= nb - 2; i++) xs.push(u[0] + (u[2] - u[0]) * i / Math.max(1, nb - 2));
  for (let j = 0; j <= nd - 2; j++) zs.push(u[1] + (u[3] - u[1]) * j / Math.max(1, nd - 2));
  const cols = along ? [xs, zs] : [zs, xs];
  for (const x of (along ? cols[0] : cols[1])) for (const z of [u[1], u[3]]) column(bag, null, x, z, yb - 0.2, D - 0.2, 0.42, 'lacquer_red');
  if (jo) meoricho(bag, u, [xs, zs], yb + D - 1.2, yb + D - 0.2, 0.05);
  const A2 = (along ? u[2] - u[0] : u[3] - u[1]) / 2 + o * 1.1, B2 = (along ? u[3] - u[1] : u[2] - u[0]) / 2 + o * 1.1;
  const upper = { c: [cx, cz], A: A2, B: B2, y: yb + D - 0.25 + bk, rise: el.rise ?? B2 * 0.78, kind: el.roof || 'hip', sweep: el.sweep ?? 0.6, alongZ: !along, mat: el.pal?.roof || 'tile_yellow', soffit: el.pal?.soffit || 'paint_caihua', gableAt: 0.45, curl: orn ? false : undefined };
  if (bk) dapo(bag, u, [xs, zs], yb + D - 0.2, el.dapo, under(upper, o * 1.1));
  rectRoof(upper, bag);
  if (orn) { ornament(upper, orn.figures ?? 0, true); return; }
  // the guardian beasts on the hips (a row of little figures; here a row of knobs) and the ridge's dragon ends
  const R = el.rise ?? B2 * 0.78, top = yb + D - 0.25 + R, L = el.roof === 'hip' ? A2 - B2 : A2 * 0.6, beasts = [];
  for (const s of [-1, 1]) {
    const e = along ? [cx + s * (L + 0.2), cz] : [cx, cz + s * (L + 0.2)];
    bag.add(el.pal?.roof || 'tile_yellow', box(e[0] - 0.5, top - 0.1, e[1] - 0.5, e[0] + 0.5, top + 1.9, e[1] + 0.5));       // chiwen
  }
  void beasts; void col;
}

/** palace_wall: a red wall { a, b, y, h, th, gates } with a marble footing and a coping of yellow tiles. */
const palaceWall = (el, ctx) => mingWall({ ...el, pal: undefined }, ctx);

/**
 * bronze: the bronzes and carved stones of the courts { kind, at, y, s, face, stone (the pedestal's
 * stone), metal }: 'vat' (gilt, with ring handles; 'deumu' the wide Joseon basin), 'tripod' (the
 * ding burner), 'lion' (paw: 'ball' | 'cub'), 'haetae' and 'cheonrok' (in stone), 'tortoise',
 * 'crane', 'sundial', 'jialiang' (the grain measure in its shrine).
 */
function bronze(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, f = el.face ?? [0, 1], yaw = Math.atan2(f[0], f[1]), stone = el.stone ?? 'marble', P = new Parts();
  const k = el.kind;
  if (k === 'vat' || k === 'deumu') { vat(P, el.metal ?? (k === 'vat' ? 'gilt_bronze' : 'bronze'), stone, k === 'deumu'); col.circle(x, z, 1.15 * s * (k === 'deumu' ? 1.25 : 1), y, y + 1.9 * s); }
  else if (k === 'tripod') { tripod(P, el.metal ?? 'bronze', stone); col.circle(x, z, 0.95 * s, y, y + 3.2 * s); }
  else if (k === 'tortoise') { tortoise(P, 'bronze', stone); col.rect([x - 0.9 * s, z - 1.1 * s, x + 0.9 * s, z + 1.1 * s], y, y + 1.8 * s); }
  else if (k === 'crane') { crane(P, 'bronze', stone); col.circle(x, z, 0.55 * s, y, y + 2.6 * s); }
  else if (k === 'sundial') { sundial(P, el.lat ?? 40); col.rect([x - 0.8 * s, z - 0.8 * s, x + 0.8 * s, z + 0.8 * s], y, y + 2.4 * s); }
  else if (k === 'jialiang') { jialiang(P); col.rect([x - 0.85 * s, z - 0.85 * s, x + 0.85 * s, z + 0.85 * s], y, y + 3.2 * s); }
  else if (k === 'cheonrok') { crouching(P, stone); col.rect([x - 0.6 * s, z - 0.6 * s, x + 0.6 * s, z + 0.6 * s], y, y + 1.3 * s); P.emit(bag, x, y, z, yaw, s); return; }
  else {
    // a guardian on its sumeru pedestal: the bronze lions of the gates, or the Joseon haetae in granite
    const haetae = k === 'haetae', m = haetae ? stone : (el.metal ?? 'bronze'), ped = el.ped ?? 1.4;
    const Q = new Parts(); sumeru(Q, stone, -1.1, -1.5, 1.1, 1.5, ped); Q.emit(bag, x, y, z, yaw, s);
    seated(P, m, { paw: el.paw, horn: haetae, bell: !haetae });
    P.emit(bag, x, y + ped * s - 0.02 * s, z, yaw, s);
    col.rect([x - 1.1 * s, z - 1.5 * s, x + 1.1 * s, z + 1.5 * s], y, y + (ped + 2.4) * s);
    return;
  }
  P.emit(bag, x, y, z, yaw, s);
}
/**
 * corner_tower: the tower over a corner of the palace wall { c, y, s, out: [sx, sz] (the corner's
 * outward signs) } — on its platform with a marble balustrade, a cross-shaped plan: a square core of
 * three bays with a wing (baosha) on each side; three tiers of roofs: the lowest a skirt of eaves
 * round the ground storey of the whole cross (the "half-slope" eave), the middle four hip-and-gable
 * roofs over the wings' upper storey, their gables turned outward, the top the core's cross-ridged
 * roof (two gabled roofs crossing) with the gilt finial at the crossing (Travel China Guide: the
 * upper tier a cross-shaped ridge with a gilded copper finial, the middle four hip-and-gable roofs,
 * the lowest a half-sloped eave; 28 eave corners, "nine beams, eighteen columns, seventy-two ridges").
 */
function cornerTower(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y, s = el.s ?? 1, pal = IMPERIAL;
  const w = 8 * s, aw = 6 * s, d = 3.2 * s, H1 = 4.6 * s, H2a = 3.6 * s, H2c = 7.2 * s, o1 = 1.5 * s;
  const hw = w / 2, ha = aw / 2, ext = hw + d;
  const ARMS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  /** The rect of an arm from the core's centre out to `out`, half-width h. */
  const arm = ([dx, dz], out, h) => (dx ? [cx + Math.min(0, dx * out), cz - h, cx + Math.max(0, dx * out), cz + h] : [cx - h, cz + Math.min(0, dz * out), cx + h, cz + Math.max(0, dz * out)]);
  // the ground storey: the core and its four wings, lattice all round, no roofs of their own
  Hall({ rect: [cx - hw, cz - hw, cx + hw, cz + hw], y, H: H1, front: 's', four: true, roof: 'none', plat: 0.25, bays: [3, 3], pal }, ctx);
  for (const a of ARMS) {
    const r = a[0] ? (a[0] > 0 ? [cx + hw, cz - ha, cx + ext, cz + ha] : [cx - ext, cz - ha, cx - hw, cz + ha]) : (a[1] > 0 ? [cx - ha, cz + hw, cx + ha, cz + ext] : [cx - ha, cz - ext, cx + ha, cz - hw]);
    Hall({ rect: r, y, H: H1, front: a[0] > 0 ? 'e' : a[0] < 0 ? 'w' : a[1] > 0 ? 's' : 'n', four: true, roof: 'none', plat: 0.25, bays: [2, 1], pal }, ctx);
  }
  // the lowest tier: a skirt of eaves round each wing and the core's corners between them; each
  // skirt's inner end runs into the core (hidden by its upper storey), a hole left for the upper body
  const ins = 0.9 * s, yk = y + H1 - 0.25;
  for (const a of ARMS) {
    const along = a[0] !== 0, r = arm(a, ext, ha), A = (along ? r[2] - r[0] : r[3] - r[1]) / 2 + o1, B = ha + o1;
    const c = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], hole = arm(a, ext - ins, ha - ins * 0.6);
    rectRoof({ c, A, B, y: yk, rise: (ins + o1) * 0.5, p: 1.2, kind: 'hip', sweep: 0.55 * s, alongZ: !along, mat: 'tile_yellow', soffit: 'paint_caihua', hole }, bag);
  }
  // the upper storey: the core rises higher than the wings; red walls, a band of lattice windows, the painted frieze
  const body = (r, h, faces) => {
    const yb = y + H1 + 0.05;
    bag.add('palace_wall', box(r[0], yb - 0.4, r[1], r[2], yb + h - 1.0, r[3]));
    bag.add('paint_caihua', box(r[0] - 0.06, yb + h - 1.0, r[1] - 0.06, r[2] + 0.06, yb + h - 0.2, r[3] + 0.06));
    for (const [a, b] of faces) latticeBay(bag, null, a, b, yb + h * 0.3, Math.min(1.8, h * 0.4), 'window', 0.03);
    for (const [x, z] of [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]]) column(bag, null, x, z, yb - 0.4, h - 0.6, 0.36 * s, 'lacquer_red');
    col.rect(r, yb - 0.4, yb + h);
  };
  const cu = [cx - hw + ins * 0.5, cz - hw + ins * 0.5, cx + hw - ins * 0.5, cz + hw - ins * 0.5];
  body(cu, H2c, [[[cu[0], cu[3] + 0.02], [cu[2], cu[3] + 0.02]], [[cu[2], cu[1] - 0.02], [cu[0], cu[1] - 0.02]], [[cu[0] - 0.02, cu[1]], [cu[0] - 0.02, cu[3]]], [[cu[2] + 0.02, cu[3]], [cu[2] + 0.02, cu[1]]]]);
  for (const a of ARMS) {
    const r = arm(a, ext - ins, ha - ins * 0.6), [x0, z0, x1, z1] = r;
    const outer = a[0] > 0 ? [[x1 + 0.02, z1], [x1 + 0.02, z0]] : a[0] < 0 ? [[x0 - 0.02, z0], [x0 - 0.02, z1]] : a[1] > 0 ? [[x0, z1 + 0.02], [x1, z1 + 0.02]] : [[x1, z0 - 0.02], [x0, z0 - 0.02]];
    const rr = a[0] ? (a[0] > 0 ? [cu[2], z0, x1, z1] : [x0, z0, cu[0], z1]) : (a[1] > 0 ? [x0, cu[3], x1, z1] : [x0, z0, x1, cu[1]]);
    body(rr, H2a, [outer]);
    // the middle tier: a hip-and-gable roof over the wing, its ridge running out, its gable facing out
    const along = a[0] !== 0, o2 = 1.2 * s, A = (along ? r[2] - r[0] : r[3] - r[1]) / 2 + o2, B = (ha - ins * 0.6) + o2;
    rectRoof({ c: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], A, B, y: y + H1 + H2a - 0.2, rise: B * 0.72, kind: 'xieshan', gableAt: 0.5, sweep: 0.7 * s, alongZ: !along, mat: 'tile_yellow', soffit: 'paint_caihua', curl: false }, bag);
  }
  // the top tier: two gabled roofs crossing over the core (the cross-shaped ridge), their four gables
  // closed by boards; the gilt finial at the crossing
  const o3 = 1.3 * s, B3 = (cu[2] - cu[0]) / 2 + o3, R3 = B3 * 0.78, y3 = y + H1 + H2c - 0.2, p3 = 1.7;
  for (const az of [false, true]) rectRoof({ c: [cx, cz], A: B3 + 0.4 * s, B: B3, y: y3, rise: R3, kind: 'gable', sweep: 0, alongZ: az, mat: 'tile_yellow', soffit: 'paint_caihua', curl: false }, bag);
  const gb = [], N = 10;
  for (const [ux, uz] of ARMS) {
    const g = B3 + 0.25 * s;                       // the board stands just inside the gable's edge
    for (let k = 0; k < N; k++) {
      const t0 = -1 + 2 * k / N, t1 = -1 + 2 * (k + 1) / N, h = (t) => y3 + R3 * Math.pow(1 - Math.abs(t), p3) - 0.16;
      const P = (t, yy) => (ux ? [cx + ux * g, yy, cz + t * (B3 - 0.2)] : [cx + t * (B3 - 0.2), yy, cz + uz * g]);
      const a0 = P(t0, y3 - 0.1), a1 = P(t1, y3 - 0.1), b1 = P(t1, h(t1 * (B3 - 0.2) / B3)), b0 = P(t0, h(t0 * (B3 - 0.2) / B3));
      gb.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0);
    }
  }
  bag.add('palace_wall', fromTriangles(gb.concat(flipTris(gb))));
  bag.add('gilt_bronze', lathe([[0.42, 0], [0.5, 0.18], [0.3, 0.4], [0.42, 0.75], [0.2, 1.1], [0.26, 1.3], [0.08, 1.7], [0.001, 2.0]].map(([r, h]) => [r * s, h * s]), 12, null, cx, y3 + R3 - 0.15, cz));
}

/** low_wall: a low parapet { a, b, y, h, th, open: [[from, to], …] } of grey brick under a stone coping. */
function lowWall(el, { bag, col }) {
  const L = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), ux = (el.b[0] - el.a[0]) / L, uz = (el.b[1] - el.a[1]) / L;
  const y = el.y ?? 0.05, h = el.h ?? 1.0, th = el.th ?? 0.5, P = (s) => [el.a[0] + ux * s, el.a[1] + uz * s];
  let runs = [[0, L]];
  for (const [f, t] of el.open || []) runs = runs.flatMap(([p, q]) => (t <= p || f >= q ? [[p, q]] : [[p, f], [t, q]].filter(([u, v]) => v - u > 0.3)));
  const body = [], cap = [];
  for (const [p, q] of runs) {
    const a = P(p), b = P(q);
    beamTris(body, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h - 0.12);
    beamTris(body, [a[0] - ux * 0.04, y, a[1] - uz * 0.04], [b[0] + ux * 0.04, y, b[1] + uz * 0.04], th / 2 + 0.05, 0.25);       // the plinth course
    beamTris(cap, [a[0] - ux * 0.06, y + h - 0.12, a[1] - uz * 0.06], [b[0] + ux * 0.06, y + h - 0.12, b[1] + uz * 0.06], th / 2 + 0.07, 0.12);
    col.segment(a, b, th, y, y + h);
  }
  bag.add(el.mat ?? 'brick_grey', fromTriangles(body));
  bag.add(el.cap ?? 'granite_grey', fromTriangles(cap));
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
  // the two leaves standing open; outside, the pair of drum stones (men dun) flanking the threshold,
  // and over the doorway the two round door pins (men zan) that hold the lintel
  for (const sx of [-1, 1]) {
    bag.add('lacquer_red', box(gx + sx * 0.8 - 0.03, 0.35, z1 - 0.95, gx + sx * 0.8 + 0.03, 2.38, z1 - 0.2));
    const D = new Parts(), xd = gx + sx * 1.02;
    D.add('granite_grey', box(-0.17, 0, -0.22, 0.17, 0.42, 0.22));
    const drum = lathe([[0.001, -0.09], [0.24, -0.09], [0.27, -0.05], [0.27, 0.05], [0.24, 0.09], [0.001, 0.09]], 14); drum.rotateZ(Math.PI / 2);
    D.add('granite_grey', drum.translate(0, 0.66, 0));
    D.add('granite_grey', box(-0.12, 0.42, -0.12, 0.12, 0.46, 0.12));
    D.emit(bag, xd, 0.35, z1 + 0.44);
    const pin = lathe([[0.001, 0], [0.07, 0], [0.075, 0.24], [0.001, 0.25]], 8); pin.rotateX(Math.PI / 2);
    bag.add('lacquer_red', pin.translate(gx + sx * 0.38, 2.6, z1 + 0.05));
  }
  col.rect([gx - 1.2, z1 + 0.2, gx - 0.84, z1 + 0.67], 0.35, 1.3); col.rect([gx + 0.84, z1 + 0.2, gx + 1.2, z1 + 0.67], 0.35, 1.3);
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

/** pyramid: a pyramidal roof of yellow tiles over a polygon { poly, y, rise, sweep }. */
function pyramid(el, { bag }) { pyramidRoof(el.poly, el.y, el.rise, el.sweep ?? 0.6, bag, el.mat || 'tile_yellow', el.soffit || 'paint_caihua'); }
/** rail: a marble balustrade { a, b, y, open: [[from, to], …] }. */
function rail(el, { bag, col }) { if (el.carve) balustradeCarved(bag, col, el.a, el.b, el.y, el.open || [], { carve: el.carve, mat: el.mat ?? 'marble_smooth' }); else balustrade(bag, col, el.a, el.b, el.y, el.open || []); }

/**
 * An arched bridge (ming_arch_bridge) with, when el.rail, a carved balustrade standing on its
 * parapets and following their rise: posts every 1.6 m, sloping panels, balusters and handrail.
 */
function archBridgeRailed(el, ctx) {
  STYLES.ming.elements.ming_arch_bridge(el, ctx);
  if (!el.rail) return;
  const { bag } = ctx, [cx, cz] = el.at, S = el.span, W = el.width / 2, R = el.rise ?? 2.2, land = el.landing ?? 4.5, y0 = el.y ?? 0;
  const alongZ = el.across === 'z', half = S / 2 + land, N = 48, m = el.rail.mat ?? (el.pal?.base === 'marble' ? 'marble_smooth' : (el.pal?.base || 'granite_block'));
  const top = (s) => y0 + R * Math.cos(Math.min(1, Math.abs(s) / half) * Math.PI / 2) ** 0.8, q = (v) => Math.round(v / 0.16) * 0.16;
  const base = (s) => { const i = Math.max(0, Math.min(N - 1, Math.floor((s + half) / (2 * half / N)))), s0 = -half + 2 * half * i / N; return Math.max(q(top(s0)), q(top(s0 + 2 * half / N))) - 0.001 + 0.5; };
  const Pw = (s, o, y) => (alongZ ? [cx + o, y, cz + s] : [cx + s, y, cz + o]);
  const n = Math.max(2, Math.round((2 * half - 0.3) / 1.6)), ss = Array.from({ length: n + 1 }, (_, k) => -half + 0.15 + (2 * half - 0.3) * k / n);
  for (const o of [-W, W]) {
    for (const [k, s] of ss.entries()) {
      const p = Pw(s, o, base(s) - 0.02), P = new Parts();
      post(P, m, el.rail.head ?? (k % 2 ? 'phoenix' : 'dragon')); P.emit(bag, p[0], p[1], p[2]);
      if (k === n) continue;
      const s1 = ss[k + 1], b0 = base(s) - 0.02, b1 = base(s1) - 0.02, t = [];
      const A = (u, dy) => Pw(s + (s1 - s) * u, o, b0 + (b1 - b0) * u + dy);
      const u0 = 0.1 / (s1 - s), u1 = 1 - u0;
      beamTris(t, A(u0, -0.18), A(u1, -0.18), 0.07, 0.68);       // the panel, its foot sunk in the parapet
      beamTris(t, A(u0, 0.5), A(u1, 0.5), 0.055, 0.06);           // the cloud band
      for (const u of [1 / 3, 2 / 3]) { const c = A(u, 0.56); bag.add(m, lathe([[0.03, 0], [0.055, 0.04], [0.07, 0.09], [0.045, 0.15], [0.03, 0.18], [0.05, 0.2], [0.001, 0.2]], 8, null, c[0], c[1], c[2])); beamTris(t, A(u - 0.07, 0.76), A(u + 0.07, 0.76), 0.05, 0.075); }
      bag.add(m, fromTriangles(t));
      const r0 = A(u0 - 0.04, 0.86), r1 = A(u1 + 0.04, 0.86);
      bag.add(m, limbG(r0, r1, 0.045));
    }
  }
}

registerStyle('qing', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.ming.elements,
    terrace: withPal(terrace), stairs: withPal(stairs), bronze: withPal(bronze), lane: withPal(lane),
    qing_hall: (el, ctx) => withPal(qingHall)({ ...el, pal: el.pal || IMPERIAL }, ctx),
    palace_wall: (el, ctx) => withPal(palaceWall)({ ...el, pal: { plaster: 'palace_wall', roof: 'tile_yellow', plinth: 'marble' } }, ctx),
    ming_arch_bridge: archBridgeRailed, gate_doors: gateDoors,
    corner_tower: withPal(cornerTower), low_wall: withPal(lowWall), throne_hall: (el, ctx) => withPal(throneHall)({ ...el, pal: el.pal || IMPERIAL }, ctx), siheyuan: (el, ctx) => withPal(siheyuan)({ ...el, simple: true }, ctx), pyramid: withPal(pyramid), rail: withPal(rail),
  },
  objects: {},
});
