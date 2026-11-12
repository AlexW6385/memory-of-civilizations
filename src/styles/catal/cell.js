// Çatalhöyük — the houses of the town you can go down into (docs/settlements/catalhoyuk.md §4, §11): each a block of the quarter with its own
// roof hatch and ladder, a plastered main room with the hearth and oven under the hatch, platforms with burials beneath, a bin or two,
// and, by the house's trade and standing, painted bands, bucrania, a pair of leopards in relief, a seated figurine, a knapper's bench or a
// baker's second oven. The same plan as the landmark house (catal_house) in the dimensions of a cell. Variants and mirroring are set by
// the layout's ENTER list; everything is placed in the cell's own (u, v): u along the north wall from the corner the platforms start in,
// v south from the north wall.
import { box, lathe, rod, place } from '../../core/geom.js';
import { WALL, MUD, PLS, LIME, RED, BLK, LOG, REED, BONE, ASH, rng, ladder, dome, basket, jar, frame, flat, zigzag, diamonds, hands, bucranium, aurochs } from './kit.js';

/** The geometry of a cell's interior: walls 0.4 m, u/v to world, the hatch, hearth and oven (shared with the settlement's people). */
export function cellGeom(rect, mirror = false) {
  const T = 0.4, [x0, z0, x1, z1] = rect, ix0 = x0 + T, iz0 = z0 + T, ix1 = x1 - T, iz1 = z1 - T, W = ix1 - ix0, D = iz1 - iz0, S = mirror ? -1 : 1, XO = mirror ? ix1 : ix0;
  const lx = (u) => XO + S * u, lz = (v) => iz0 + v;
  const ur = (u0, v0, u1, v1) => [Math.min(lx(u0), lx(u1)), lz(v0), Math.max(lx(u0), lx(u1)), lz(v1)];
  return { T, x0, z0, x1, z1, ix0, iz0, ix1, iz1, W, D, S, XO, lx, lz, ur, PH: 0.45, hole: ur(1.2, D - 2.35, 2.5, D - 0.45), hearth: [lx(1.1), lz(D - 1.5)], oven: [lx(0.75), lz(D - 0.6)], room: [ix0 + 0.3, iz0 + 0.3, ix1 - 0.3, iz1 - 0.3] };
}

/** A leopard in plaster relief on a wall (local +z out of it), the head toward +x·s. */
function leopard(bag, x, y, z, yaw, s, k = 1) {
  const P = (g) => place(g, x, y, z, yaw);
  bag.add(PLS, P(lathe([[0.001, -1], [0.7, -0.75], [1, 0], [0.7, 0.75], [0.001, 1]], 10).rotateZ(Math.PI / 2).scale(0.46 * k, 0.17 * k, 0.07 * k)));
  bag.add(PLS, P(lathe([[0.001, -1], [0.8, -0.5], [1, 0], [0.7, 0.6], [0.001, 1]], 9).scale(0.11 * k, 0.12 * k, 0.07 * k).translate(s * 0.5 * k, 0.1 * k, 0)));
  for (const [a, b] of [[0.3, 0.36], [-0.3, -0.36]]) bag.add(PLS, P(rod([s * a * k, -0.05 * k, 0.03], [s * b * k, -0.34 * k, 0.03], 0.045 * k, 6)));
  let prev = [-s * 0.44 * k, 0.02 * k, 0.03];
  for (let i = 1; i <= 5; i++) { const t = i / 5, p = [-s * (0.44 + 0.3 * Math.sin(t * 1.6)) * k, (0.02 + 0.5 * t * t) * k, 0.03]; bag.add(PLS, P(rod(prev, p, (0.035 - 0.018 * t) * k, 5))); prev = p; }
  for (const [a, b] of [[-0.25, 0.06], [-0.1, -0.04], [0.05, 0.08], [0.2, -0.02], [0.3, 0.08], [-0.35, -0.05]]) bag.add(BLK, P(lathe([[0.03 * k, 0], [0.001, 0.012]], 5).rotateX(Math.PI / 2).translate(s * a * k, b * k, 0.075 * k)));
}
/** The seated woman of the figurines: clay, ochre, a hand on each of the two cats that flank her; 0.2 m high. */
function seated(bag, x, y, z, yaw) {
  const P = (g) => place(g, x, y, z, yaw);
  bag.add('terracotta', P(lathe([[0.001, 0], [0.1, 0.01], [0.12, 0.06], [0.09, 0.15], [0.07, 0.2], [0.05, 0.26], [0.001, 0.27]], 9)));
  bag.add('terracotta', P(lathe([[0.001, 0.26], [0.04, 0.27], [0.04, 0.31], [0.001, 0.33]], 7)));
  for (const s of [-1, 1]) {
    bag.add('terracotta', P(rod([s * 0.07, 0.17, 0.02], [s * 0.15, 0.08, 0.08], 0.018, 5)));
    bag.add('terracotta', P(lathe([[0.001, -1], [0.7, -0.6], [1, 0], [0.7, 0.7], [0.001, 1]], 7).rotateZ(Math.PI / 2).scale(0.09, 0.04, 0.035).translate(s * 0.19, 0.045, 0.08)));
    bag.add('terracotta', P(lathe([[0.001, 0], [0.025, 0.01], [0.025, 0.05], [0.001, 0.06]], 6).translate(s * 0.26, 0.04, 0.08)));
  }
  bag.add('paint_ochre', P(lathe([[0.121, 0.03], [0.121, 0.05], [0.115, 0.05], [0.115, 0.03]], 9)));
}
/** The knapper's place: an anvil stone, a core, flakes and blades, bone points, a few finished arrowheads on a hide. */
function knapper(bag, x, y, z, rand) {
  bag.add('granite_rough', lathe([[0.001, 0], [0.17, 0.01], [0.15, 0.1], [0.001, 0.12]], 8, null, x, y, z));
  bag.add('obsidian', lathe([[0.001, 0.12], [0.06, 0.12], [0.045, 0.2], [0.001, 0.22]], 6, null, x, y, z));
  bag.add('hide_tan', box(x + 0.35, y, z - 0.3, x + 1.0, y + 0.012, z + 0.3));
  for (let q = 0; q < 22; q++) { const a = rand() * 6.28, r = 0.2 + rand() * 0.55, c = rand() < 0.4 ? 'chalk' : 'obsidian', px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; bag.add(c, rod([px, y + 0.014, pz], [px + Math.cos(a * 3) * 0.1, y + 0.016, pz + Math.sin(a * 3) * 0.1], 0.011, 4)); }
  for (let q = 0; q < 6; q++) bag.add('obsidian', box(x + 0.45 + q * 0.09, y + 0.012, z - 0.1 + (q % 2) * 0.1, x + 0.51 + q * 0.09, y + 0.02, z + 0.02 + (q % 2) * 0.1));
}
const loaf = (bag, x, y, z, r = 0.12) => bag.add('hide_tan', lathe([[r, 0], [r * 1.02, 0.02], [r * 0.8, 0.045], [0.001, 0.05]], 8, null, x, y, z));
/** A mud bin with a lid of reeds, 0.8 m high, the grain showing in a second one. */
function bin(bag, col, r, F, full) {
  const [a, b, c, d] = r;
  for (const [p, q, rr, s] of [[a, b, c, b + 0.1], [a, d - 0.1, c, d], [a, b + 0.1, a + 0.1, d - 0.1], [c - 0.1, b + 0.1, c, d - 0.1]]) bag.add(MUD, box(p, F, q, rr, 0.8, s));
  bag.add(full ? 'cloth_ochre' : REED, box(a + 0.1, full ? 0.55 : 0.7, b + 0.1, c - 0.1, full ? 0.58 : 0.72, d - 0.1));
  col.rect([a, b, c, d], F, 0.8);
}

/**
 * catal_cell: { rect, top (roof), seed, variant (0 plain with painted bands and bucrania, 1 leopards in relief, 2 seated figurine and diamonds,
 * 3 the knapper's, 4 the baker's), mirror }: the whole cell: walls, the roof with its hatch, the interior.
 */
export function cell(el, { bag, col, lights }) {
  const G = cellGeom(el.rect, el.mirror), { T, x0, z0, x1, z1, ix0, iz0, ix1, iz1, W, D, S, XO, lx, lz, ur, PH, hole } = G;
  const rand = rng(el.seed || 5), V = el.variant | 0, ST = el.top, F = 0.05, CH = 2.1, PL = 0.025;
  const B = (u0, y0, v0, u1, y1, v1) => box(Math.min(lx(u0), lx(u1)), y0, lz(v0), Math.max(lx(u0), lx(u1)), y1, lz(v1));
  // walls and floor
  for (const [a, b, c, d] of [[x0, z0, x1, iz0], [x0, iz1, x1, z1], [x0, iz0, ix0, iz1], [ix1, iz0, x1, iz1]]) { bag.add(rand() < 0.35 ? 'earth_wall' : MUD, box(a, -0.3, b, c, ST, d)); col.rect([a, b, c, d], 0, ST); }
  bag.add(PLS, box(ix0, -0.25, iz0, ix1, F, iz1)); col.floor([ix0, iz0, ix1, iz1], F);
  for (const [a, b, c, d] of [[ix0, iz0, ix1, iz0 + PL], [ix0, iz1 - PL, ix1, iz1], [ix0, iz0, ix0 + PL, iz1], [ix1 - PL, iz0, ix1, iz1]]) bag.add(PLS, box(a, F, b, c, CH, d));
  // the roof: reed mat under, beams across clear of the hatch, mud over, a skin of the roof's plaster; the hatch's coaming
  const slab = [[ix0 - T, iz0 - T, ix1 + T, hole[1]], [x0, hole[3], x1, z1], [x0, hole[1], hole[0], hole[3]], [hole[2], hole[1], x1, hole[3]]];
  for (const r of slab) {
    bag.add(REED, box(r[0], CH, r[1], r[2], CH + 0.1, r[3])); bag.add(MUD, box(r[0], CH + 0.1, r[1], r[2], ST, r[3]));
    bag.add(rand() < 0.55 ? 'banco_smooth' : 'banco', box(r[0] + 0.01, ST, r[1] + 0.01, r[2] - 0.01, ST + 0.09, r[3] - 0.01)); col.floor(r, ST + 0.09);
  }
  for (let u = 0.3; u < W - 0.1; u += 0.74) {
    const bxw = lx(u); if (bxw > hole[0] - 0.15 && bxw < hole[2] + 0.15) continue;
    bag.add(LOG, rod([bxw, CH - 0.07, iz0 + 0.02], [bxw + (rand() - 0.5) * 0.03, CH - 0.07, iz1 - 0.02], 0.085 + rand() * 0.02, 7));
  }
  for (const zz of [hole[1] - 0.07, hole[3] + 0.07]) bag.add(LOG, rod([hole[0] - 0.1, CH - 0.06, zz], [hole[2] + 0.1, CH - 0.06, zz], 0.06, 6));
  for (const r of [[hole[0] - 0.2, hole[1] - 0.2, hole[2] + 0.2, hole[1]], [hole[0] - 0.2, hole[3], hole[2] + 0.2, hole[3] + 0.2], [hole[0] - 0.2, hole[1], hole[0], hole[3]], [hole[2], hole[1], hole[2] + 0.2, hole[3]]]) { bag.add(MUD, box(r[0], ST + 0.05, r[1], r[2], ST + 0.27, r[3])); col.rect(r, ST + 0.09, ST + 0.27); }
  bag.add(ASH, box(hole[0], CH + 0.1, hole[1] - 0.02, hole[2], ST + 0.05, hole[1] - 0.01));      // the soot above the hearth, on the hatch's inner face
  // the ladder under the hatch, standing up through it, and the ramp one climbs it by
  ladder(bag, lx(1.95), F, lz(D - 1.25), ST - F, 0, -1, 1.1, 0.9);
  col.ramp(ur(1.4, D - 2.35, 2.5, D - 1.25), F, ST + 0.09, 'n');
  // platforms with the mats and hides on them; a fresh patch of plaster over a burial
  const east = ur(W - 1.3, 1.35, W, D - 2.3);
  for (const r of [ur(0, 0, W, 1.35), east]) { bag.add(PLS, box(r[0], F, r[1], r[2], PH, r[3])); bag.add(LIME, box(r[0] - 0.02, PH - 0.03, r[1] - 0.02, r[2] + 0.02, PH + 0.005, r[3] + 0.02)); col.rect(r, F, PH); }
  const mats = [[0.3, 0.2, W * 0.45, 1.15, REED], [W * 0.5, 0.25, W - 0.3, 1.2, REED], [W - 1.15, 1.5, W - 0.2, Math.max(2.4, D - 2.5), REED]];
  for (const [a, b, c, d, m] of mats) bag.add(m, B(a, PH + 0.005, b, c, PH + 0.03, d));
  bag.add(['hide_tan', 'hide_brown', 'hide_grey'][Math.floor(rand() * 3)], B(0.4, PH + 0.03, 0.3, 1.2, PH + 0.07, 1.1));
  bag.add('hide_white', B(W - 1.1, PH + 0.03, 1.7, W - 0.4, PH + 0.06, 2.4));
  bag.add('plaster_grey', B(W - 1.15, PH, Math.max(2.6, D - 2.8), W - 0.15, PH + 0.015, Math.max(2.85, D - 2.55)));
  // north wall: a red wash, a band of zig-zag, the trade's decoration
  const FN = frame([XO, iz0], [S, 0], [0, 1]), FE = frame([XO + S * W, iz0], [0, 1], [-S, 0]), FW = frame([XO, iz0], [0, 1], [S, 0]);
  const wash = () => { flat(bag, RED, FN, [[0, PH], [W, PH], [W, 1.72], [0, 1.72]], 0.008); zigzag(bag, BLK, FN, 0.1, W - 0.1, 1.76, 2.03, Math.round(W * 4)); };
  if (V === 0) { wash(); for (const u of W > 4.6 ? [0.9, W / 2, W - 0.9] : [1.1, W - 1.1]) bucranium(bag, lx(u), 1.15, iz0 + PL, 0, 0.95); hands(bag, FN, 0.3, 0.8, 3, 1); }
  else if (V === 1) {
    flat(bag, RED, FN, [[0, PH], [W, PH], [W, 1.6], [0, 1.6]], 0.008);
    leopard(bag, lx(W / 2 - 0.65), 1.15, iz0 + PL, 0, S, 1.1); leopard(bag, lx(W / 2 + 0.65), 1.15, iz0 + PL, 0, -S, 1.1);
    bucranium(bag, lx(W / 2), 1.25, iz0 + PL, 0, 0.85); zigzag(bag, BLK, FN, 0.1, W - 0.1, 1.7, 1.95, Math.round(W * 4));
  } else if (V === 2) {
    wash(); diamonds(bag, FE, 1.3, Math.max(3, D - 2.6), 0.9, 1.85, 4); seated(bag, lx(W / 2), PH + 0.005, iz0 + 0.35, 0);
    for (const u of [0.8, W - 0.8]) bucranium(bag, lx(u), 1.2, iz0 + PL, 0, 0.9);
  } else if (V === 3) {
    flat(bag, RED, FN, [[0, PH], [W, PH], [W, 0.75], [0, 0.75]], 0.008); hands(bag, FN, 0.4, 1.35, 4, 1);
    bag.add(LOG, B(0.2, 0.52, 1.4, 0.4, 0.58, D - 2.4));                    // a bench of a plank on stumps along the west wall
    knapper(bag, lx(0.95), F, lz(2.3), rand);
  } else {
    flat(bag, RED, FN, [[0.2, PH], [W - 0.2, PH], [W - 0.2, 1.4], [0.2, 1.4]], 0.008); zigzag(bag, BLK, FN, 0.3, W - 0.3, 1.45, 1.7, Math.round(W * 3));
    const o2 = [lx(W - 0.7), lz(D - 0.7)];                                  // the second oven, in the south-east corner
    dome(bag, MUD, o2[0], F, o2[1], 0.5, 0.7, 1, 1, 0, 0.02); bag.add('opening', box(o2[0] - S * 0.6, F + 0.15, o2[1] - 0.22, o2[0] - S * 0.2, F + 0.45, o2[1] + 0.22)); col.circle(o2[0], o2[1], 0.55, F, 0.7);
    for (let q = 0; q < 5; q++) loaf(bag, lx(W - 1.2 + q * 0.05), F + q * 0.05, lz(D - 1.6), 0.13);
    bag.add('granite_rough', B(W * 0.5, F, D - 1.7, W * 0.5 + 0.8, F + 0.12, D - 1.2)); bag.add('granite_rough', lathe([[0.001, 0], [0.12, 0.01], [0.1, 0.07], [0.001, 0.08]], 8, null, lx(W * 0.5 + 0.4), F + 0.12, lz(D - 1.45)));
  }
  // the east (or west) wall over the platform, the opposite wall: red band, or the aurochs on a bigger house of rank
  if (V !== 2) { flat(bag, RED, FE, [[1.4, PH + 0.1], [Math.max(3, D - 2.4), PH + 0.1], [Math.max(3, D - 2.4), 1.2], [1.4, 1.2]], 0.008); if (V < 2) bucranium(bag, XO + S * (W - PL), 1.1, lz(2.1), -S * Math.PI / 2, 0.85); }
  if (V === 1 && D > 5.2) aurochs(bag, FW, 2.4, 0.9, 1.0, rand); else flat(bag, RED, FW, [[0.2, 0.3], [D - 0.2, 0.3], [D - 0.2, 0.5], [0.2, 0.5]], 0.008);
  // hearth under the hatch: a ring of plaster, ash, a small fire; the oven in the south-west corner and the loaves by its mouth
  const [hx, hz] = G.hearth, [ox, oz] = G.oven;
  bag.add(LIME, lathe([[0.38, 0], [0.38, 0.1], [0.29, 0.1], [0.29, 0.04], [0.001, 0.04]], 12, null, hx, F, hz)); bag.add(ASH, lathe([[0.29, 0.055], [0.001, 0.06]], 10, null, hx, 0, hz));
  for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.4; bag.add('bark_dark', rod([hx + Math.cos(a) * 0.23, F + 0.08, hz + Math.sin(a) * 0.23], [hx + Math.cos(a) * 0.03, F + 0.12, hz + Math.sin(a) * 0.03], 0.024, 5)); }
  bag.add('flame', lathe([[0.1, 0], [0.08, 0.08], [0.04, 0.2], [0.001, 0.3]], 8, (t) => 1 + 0.25 * Math.sin(t * 3), hx, F + 0.08, hz)); col.circle(hx, hz, 0.4, F, F + 0.12);
  dome(bag, MUD, ox, F, oz, 0.55, 0.72, 1, 1, 0, 0.02); bag.add('opening', box(Math.min(ox + S * 0.2, ox + S * 0.56), F + 0.15, oz - 0.22, Math.max(ox + S * 0.2, ox + S * 0.56), F + 0.46, oz + 0.22)); col.circle(ox, oz, 0.55, F, 0.72);
  for (let q = 0; q < 3; q++) loaf(bag, lx(1.5 + q * 0.04), F + q * 0.05, lz(D - 0.35), 0.12);
  // the west wall's bins, jars and baskets, a mat on the floor, pegs with what hangs from them
  const bn = Math.min(2, Math.floor((D - 4.1) / 1.1) + 1);
  for (let q = 0; q < bn; q++) bin(bag, col, ur(0.05, 1.55 + q * 1.15, 0.95, 2.55 + q * 1.15), F, q % 2 === 0);
  const bvz = 1.55 + bn * 1.15;
  jar(bag, lx(0.4), F, lz(bvz + 0.1), 1.2, V === 3 ? 'terracotta' : 'pottery_dark'); jar(bag, lx(0.95), F, lz(bvz + 0.2), 0.9); basket(bag, lx(1.6), F, lz(bvz), 0.25, 'cloth_ochre');
  if (V !== 3) { bag.add(REED, B(1.0, F, 2.0, Math.min(W - 1.5, 3.0), F + 0.012, 3.0)); for (let k = 0; k < 3; k++) bag.add(rand() < 0.5 ? 'cloth_ochre' : 'hide_brown', B(1.2 + k * 0.5, F + 0.012, 2.1, 1.65 + k * 0.5, F + 0.04, 2.4)); }
  for (let k = 0; k < 3; k++) { const u = 0.8 + k * 1.0 + rand() * 0.2; bag.add(LOG, rod([lx(u), 1.6, iz0 + 0.02], [lx(u), 1.58, iz0 + 0.2], 0.02, 4)); bag.add(k % 2 ? 'cloth_ochre' : 'hide_brown', lathe([[0.001, 0], [0.09, -0.05], [0.07, -0.25], [0.001, -0.3]], 7, null, lx(u), 1.58, iz0 + 0.2)); }
  if (lights) lights.push({ at: [hx, F + 0.6, hz], color: '#ff9a4a', intensity: 2.4, distance: 5 });
}
