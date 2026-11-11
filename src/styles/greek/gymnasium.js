// The Academy of Athens about 410 BC (docs/settlements/athens.md §11c): a public gymnasium in a grove outside the city.
// gymnasium: the palaestra — a peristyle court of unfluted columns round a floor of sand, the rooms of the athletes along its
// north side (the apodyterion with its benches and pegs, the loutron with its basins, the elaiothesion with the oil jars,
// the konisterion where the dust was kept, an exedra with its seats), the jumping pit, a rack of javelins, the korykos.
// academy_grounds: the precinct wall with its gate, the paths, the altar of Prometheus at the end of the torch race, the
// hero-shrine of Akademos, the exedra where the philosophers sit, herms and stone benches under the trees.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { frame, B } from './agora.js';
import { kit, pent, figurine } from './quarter.js';
import { rangeRoof } from './house-interior.js';
import { vase } from './vessels.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** gymnasium: { rect (34 × 31), front 's', y, seed }. */
function gymnasium(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, front = el.front ?? 's', rand = rng(el.seed ?? 7), { F, R, wall } = kit(ctx, el.rect, front, y), { L, D } = F;
  const T = 0.5, Ho = 4.6, CH = 3.1, PD = 3.0, vr = D - 6.3, vc = D - 9.3;        // wall thickness, wall height, column height, portico depth, rooms' front wall, north colonnade line
  // the floors: paving in the porticoes, sand in the court
  for (const r of [[0, 0, L, PD], [0, PD, PD, vc], [L - PD, PD, L, vc], [0, vc, L, vr]]) { R(...r, -0.3, 0, 'limestone', false); col.floor(F.R(...r), y); }
  R(PD, PD, L - PD, vc, -0.3, -0.02, 'sandstone_white', false); col.floor(F.R(PD, PD, L - PD, vc), y - 0.02);
  // the outer walls: the gateway in the south, the rooms' front wall with five doors, the partitions
  const gw = [L / 2 - 1.8, L / 2 + 1.8, 3.4];
  wall(true, T / 2, 0, L, Ho, [gw], 'mud_plaster', T);
  wall(false, T / 2, T, D, Ho, [], 'mud_plaster', T); wall(false, L - T / 2, T, D, Ho, [], 'mud_plaster', T);
  wall(true, D - T / 2, T, L - T, Ho, [], 'mud_plaster', T);
  const rw = [8.5, 6.5, 6, 6, 7], us = [0]; for (const w of rw) us.push(us[us.length - 1] + w);
  wall(true, vr, T, L - T, Ho, rw.map((w, i) => [us[i] + 1.0, us[i] + 2.2, 2.3]), 'mud_plaster', 0.4);
  for (const u of us.slice(1, -1)) wall(false, u, vr + 0.2, D - T, Ho, [], 'mud_plaster', 0.4);
  // the gateway's posts and lintel of stone, a little gabled roof of tile over it
  R(gw[0] - 0.55, -0.15, gw[0], 0.65, 0, 3.7, 'limestone'); R(gw[1], -0.15, gw[1] + 0.55, 0.65, 0, 3.7, 'limestone');
  R(gw[0] - 0.6, -0.2, gw[1] + 0.6, 0.7, 3.4, 3.7, 'limestone', false);
  pent(ctx, F.R(gw[0] - 0.6, -0.3, gw[1] + 0.6, 0.8), F.out[1] > 0 ? 'zp' : F.out[1] < 0 ? 'zn' : F.out[0] > 0 ? 'xp' : 'xn', y, 3.7, 4.1, 0.15);
  // the peristyle: unfluted Doric columns of stuccoed stone, a plain entablature with blue triglyphs, pent roofs falling to the court
  const colPos = [];
  const nS = 10, sp = (L - 2 * PD) / (nS - 1);
  for (let k = 0; k < nS; k++) { colPos.push([PD + k * sp, PD], [PD + k * sp, vc]); }
  const nW = Math.round((vc - PD) / sp);
  for (let k = 1; k < nW; k++) { const v = PD + (vc - PD) * k / nW; colPos.push([PD, v], [L - PD, v]); }
  for (const [u, v] of colPos) STYLES.greek.column({ at: F.P(u, v), y, h: CH, d: 0.5, mat: 'limestone', flutes: 0, simple: true }, ctx);
  const arch = (u0, v0, u1, v1) => { R(u0, v0, u1, v1, CH, CH + 0.35, 'plaster_white', false); R(u0, v0, u1, v1, CH + 0.35, CH + 0.7, 'plaster_white', false); R(u0 - 0.04, v0 - 0.04, u1 + 0.04, v1 + 0.04, CH + 0.7, CH + 0.85, 'plaster_white', false); };
  arch(PD - 0.3, PD - 0.3, L - PD + 0.3, PD + 0.3); arch(PD - 0.3, vc - 0.3, L - PD + 0.3, vc + 0.3);
  arch(PD - 0.3, PD + 0.3, PD + 0.3, vc - 0.3); arch(L - PD - 0.3, PD + 0.3, L - PD + 0.3, vc - 0.3);
  for (let u = PD + sp / 2; u < L - PD; u += sp) for (const v of [PD, vc]) R(u - 0.13, v - 0.31, u + 0.13, v + 0.31, CH + 0.35, CH + 0.7, 'egyptian_blue', false);
  const side = (r, lowAxis) => pent(ctx, F.R(...r), lowAxis, y, CH + 0.85, Ho, 0.1);
  const lowOf = (dv, du) => { const o = F.out; if (dv) return (dv * (o[1]) > 0 ? 'zp' : 'zn'); return (du * (o[0]) > 0 ? 'xp' : 'xn'); };
  void lowOf;
  // the four strips: low edges toward the court (in world axes)
  const worldStrip = (u0, v0, u1, v1, towardV, towardU) => {
    const r = F.R(u0, v0, u1, v1), mid = F.P((u0 + u1) / 2, (v0 + v1) / 2);
    const cu = F.P(L / 2, (PD + vc) / 2);
    const low = towardV ? (cu[1] > mid[1] ? 'zp' : 'zn') : (cu[0] > mid[0] ? 'xp' : 'xn');
    void towardU; pent(ctx, r, low, y, CH + 0.85, Ho, 0.1);
  };
  void side;
  worldStrip(T, T, L - T, PD + 0.3, true); worldStrip(T, vc - 0.3, L - T, vr, true);
  worldStrip(T, PD + 0.3, PD + 0.3, vc - 0.3, false); worldStrip(L - PD - 0.3, PD + 0.3, L - T, vc - 0.3, false);
  // the rooms' roof
  rangeRoof(ctx, F.R(0, vr - 0.2, L, D), y, Ho);

  // ── the apodyterion (u 0…8.5): benches round the walls, pegs with himatia, sandals under the benches
  const a0 = us[0] + T, a1 = us[1] - 0.2, bv = D - T;
  const bench = (u0, v0, u1, v1, h = 0.42) => R(u0, v0, u1, v1, 0, h, 'limestone');
  bench(a0, bv - 0.55, a1, bv); bench(a0, vr + 0.5, a0 + 0.55, bv - 0.55); bench(a1 - 0.55, vr + 1.9, a1, bv - 0.55);
  R(a0 + 0.05, bv - 0.03, a1 - 0.05, bv, 1.7, 1.76, 'timber', false);
  for (let u = a0 + 0.5; u < a1 - 0.3; u += 0.62) {
    R(u, bv - 0.1, u + 0.04, bv - 0.03, 1.66, 1.72, 'wood_dark', false);
    const m = ['cloth_white', 'cloth_ochre', 'cloth_red', 'linen', 'cloth_indigo', 'cloth_brown'][Math.floor(rand() * 6)];
    R(u - 0.14, bv - 0.1, u + 0.18, bv - 0.04, 0.75 + rand() * 0.3, 1.68, m, false);
  }
  for (let u = a0 + 0.8; u < a1 - 0.8; u += 1.4) R(u, bv - 0.45, u + 0.22, bv - 0.18, 0, 0.05, 'hide_brown', false);
  for (let k = 0; k < 3; k++) R(a0 + 2.0 + k * 1.7, bv - 0.5, a0 + 2.0 + k * 1.7 + 0.5, bv - 0.1, 0.42, 0.5, ['cloth_white', 'cloth_ochre', 'cloth_red'][k], false);

  // ── the loutron (u 8.5…15): four basins on pedestals along the back wall, a drain trough, a bronze spout over each
  const l0 = us[1] + 0.2, l1 = us[2] - 0.2;
  for (let k = 0; k < 4; k++) {
    const u = l0 + 0.9 + k * (l1 - l0 - 1.2) / 3, [x, z] = F.P(u, bv - 0.55);
    bag.add('limestone', lathe([[0.16, 0], [0.1, 0.1], [0.08, 0.7], [0.16, 0.85], [0.4, 0.9], [0.4, 0.99], [0.34, 1.0], [0.001, 0.93]], 12, null, x, y, z));
    bag.add('water', lathe([[0.001, 0], [0.33, 0]], 10, null, x, y + 0.96, z));
    col.circle(x, z, 0.42, y, y + 1.0);
    const [sx, sz] = F.P(u, bv - 0.02); bag.add('bronze', rod([sx, y + 1.5, sz], [sx + F.out[0] * 0.2, y + 1.5, sz + F.out[1] * 0.2], 0.025, 5));
  }
  R(l0, bv - 1.4, l1, bv - 1.05, 0, 0.06, 'marble_dark', false);

  // ── the elaiothesion (u 15…21): the oil jars in a row, a shelf of aryballoi and strigils
  const e0 = us[2] + T - 0.3, e1 = us[3] - 0.2;
  for (let k = 0; k < 4; k++) { const [x, z] = F.P(e0 + 0.7 + k * 1.2, bv - 0.7); vase(bag, 'pithos', x, y, z, { s: 0.9, seg: 12 }); col.circle(x, z, 0.36, y, y + 1.0); }
  R(e0, vr + 0.45, e0 + 0.35, vr + 4.0, 1.2, 1.25, 'timber', false);
  for (let v = vr + 0.7; v < vr + 3.8; v += 0.3) { const [x, z] = F.P(e0 + 0.17, v); vase(bag, 'lekythos', x, y + 1.25, z, { s: 0.5, seg: 8 }); }
  for (let k = 0; k < 5; k++) { const [x, z] = F.P(e1 - 0.1, vr + 1.0 + k * 0.4); bag.add('bronze', rod([x, y + 1.5, z], [x + F.out[0] * 0.0 - 0.0, y + 1.1, z + 0.0], 0.012, 4)); }
  col.rect(F.R(e0, vr + 0.45, e0 + 0.4, vr + 4.0), y, y + 1.3);

  // ── the konisterion (u 21…27): a floor of dust, the heap, the stone for rubbing
  const k0 = us[3] + 0.2, k1 = us[4] - 0.2;
  R(k0, vr + 0.4, k1, bv, 0, 0.03, 'sandstone_white', false);
  { const [x, z] = F.P((k0 + k1) / 2, vr + 3.2); bag.add('sandstone_white', lathe([[1.0, 0], [0.7, 0.3], [0.3, 0.5], [0.001, 0.55]], 12, null, x, y, z)); col.circle(x, z, 1.0, y, y + 0.5); }
  R(k0, bv - 0.5, k0 + 1.5, bv, 0, 0.45, 'limestone');
  // ── the exedra room (u 27…34): the seats round a niche, a herm in the middle
  { const cu = us[4] + 3.4, cv = bv - 0.2;
    for (let k = 0; k < 7; k++) { const a = Math.PI * (k + 0.5) / 7, [x, z] = F.P(cu + Math.cos(a) * 2.6, cv - Math.sin(a) * 2.6); const g = box(-0.5, 0, -0.26, 0.5, 0.45, 0.26); g.rotateY(-a - Math.PI / 2); bag.add('limestone', g.translate(x, y, z)); col.circle(x, z, 0.5, y, y + 0.45); }
    STYLES.greek.elements.herm({ at: F.P(cu, cv - 1.0), y, rot: Math.atan2(-F.out[0], -F.out[1]) }, ctx); }

  // ── the court: a herm at either side of the way in, the jumping pit with its weights, a rack of javelins, the korykos, the altar of Hermes
  for (const u of [L / 2 - 3.2, L / 2 + 3.2]) STYLES.greek.elements.herm({ at: F.P(u, PD + 1.4), y, rot: Math.atan2(F.out[0], F.out[1]) }, ctx);
  R(PD + 2.5, PD + 4.0, PD + 8.5, PD + 5.4, 0, 0.18, 'limestone'); R(PD + 2.7, PD + 4.2, PD + 8.3, PD + 5.2, 0.18, 0.2, 'sandstone_white', false);
  for (const u of [PD + 2.2, PD + 2.7]) { const [x, z] = F.P(u, PD + 3.5); bag.add('bronze', lathe([[0.001, 0], [0.07, 0.0], [0.08, 0.08], [0.07, 0.15], [0.001, 0.15]], 8, null, x, y, z)); }
  { const [x, z] = F.P(L - PD - 2.2, PD + 2.5); R(L - PD - 2.5, PD + 2.3, L - PD - 1.9, PD + 3.5, 0, 1.4, 'timber', false);
    for (let k = 0; k < 5; k++) bag.add('wood_dark', rod([x - 0.2 + k * 0.12, y + 0.05, z - 0.12 * 0 - 0.2], [x - 0.2 + k * 0.12, y + 2.4, z + 0.05], 0.014, 4)); col.rect(F.R(L - PD - 2.5, PD + 2.3, L - PD - 1.9, PD + 3.5), y, y + 2.0); }
  { const [x, z] = F.P(L - PD - 5.5, vc - 2.5);
    bag.add('timber', rod([x - 0.9, y, z], [x - 0.9, y + 2.7, z], 0.08, 6)); bag.add('timber', rod([x + 0.9, y, z], [x + 0.9, y + 2.7, z], 0.08, 6)); bag.add('timber', rod([x - 0.9, y + 2.65, z], [x + 0.9, y + 2.65, z], 0.07, 6));
    bag.add('rope_fibre', rod([x, y + 2.65, z], [x, y + 1.9, z], 0.012, 4)); bag.add('hide_tan', lathe([[0.001, 0], [0.14, 0.12], [0.16, 0.45], [0.1, 0.8], [0.001, 0.82]], 10, null, x, y + 1.15, z)); col.rect([x - 1, z - 0.15, x + 1, z + 0.15], y, y + 2.7); }
  { const [x, z] = F.P(L / 2, (PD + vc) / 2 + 2.0);
    bag.add('limestone', box(x - 0.6, y, z - 0.45, x + 0.6, y + 0.25, z + 0.45)); bag.add('limestone', box(x - 0.45, y + 0.25, z - 0.32, x + 0.45, y + 0.95, z + 0.32)); bag.add('limestone', box(x - 0.55, y + 0.95, z - 0.4, x + 0.55, y + 1.05, z + 0.4)); col.rect([x - 0.6, z - 0.45, x + 0.6, z + 0.45], y, y + 1.05); }
  void B; void figurine;
}

/**
 * academy_grounds: { rect, y, gate: [x, z] on the east wall, altar, heroon, exedra: [x, z], paths: [[x0, z0, x1, z1]…], seed } — see the header.
 */
function academyGrounds(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, t = 0.5, H = 1.9;
  const wallR = (r, h = H) => { bag.add('rubble', box(r[0], y - 0.4, r[1], r[2], y + 0.5, r[3])); bag.add('mud_plaster', box(r[0] + 0.01, y + 0.5, r[1] + 0.01, r[2] - 0.01, y + h, r[3] - 0.01)); bag.add('roof_tile', box(r[0] - 0.08, y + h, r[1] - 0.08, r[2] + 0.08, y + h + 0.12, r[3] + 0.08)); col.rect(r, y - 0.4, y + h + 0.12); };
  const [gx, gz] = el.gate, gh = 2.2;
  wallR([x0, z0, x1, z0 + t]); wallR([x0, z1 - t, x1, z1]); wallR([x0, z0 + t, x0 + t, z1 - t]);
  wallR([x1 - t, z0 + t, x1, gz - gh]); wallR([x1 - t, gz + gh, x1, z1 - t]);
  // the gate: two square posts of limestone, a lintel and a little roof of tile, leaves standing open against the wall
  for (const s of [-1, 1]) { const zc = gz + s * gh; bag.add('limestone', box(x1 - 0.6, y, zc - (s > 0 ? 0.0 : 0.7) - 0.0, x1 + 0.2, y + 3.3, zc + (s > 0 ? 0.7 : 0.0))); col.rect([x1 - 0.6, zc - (s > 0 ? 0 : 0.7), x1 + 0.2, zc + (s > 0 ? 0.7 : 0)], y, y + 3.3); }
  bag.add('limestone', box(x1 - 0.65, y + 3.3, gz - gh - 0.75, x1 + 0.25, y + 3.55, gz + gh + 0.75));
  bag.add('roof_tile', box(x1 - 0.85, y + 3.55, gz - gh - 0.95, x1 + 0.45, y + 3.7, gz + gh + 0.95));
  // the paths of pebbles
  for (const [a, b, c, d] of el.paths) { const w = 1.6, r = a === c ? [a - w, Math.min(b, d), a + w, Math.max(b, d)] : [Math.min(a, c), b - w, Math.max(a, c), b + w]; bag.add('pebbles', box(r[0], y, r[1], r[2], y + 0.03, r[3])); }
  // the altar of Prometheus, where the torch race from the Kerameikos ended: three steps and the block, the burnt top, a torch on either side
  { const [x, z] = el.altar;
    for (let k = 0; k < 3; k++) bag.add('limestone', box(x - 2.2 + k * 0.4, y + k * 0.18, z - 1.6 + k * 0.4, x + 2.2 - k * 0.4, y + (k + 1) * 0.18, z + 1.6 - k * 0.4));
    bag.add('limestone', box(x - 1.2, y + 0.54, z - 0.8, x + 1.2, y + 1.5, z + 0.8)); bag.add('limestone', box(x - 1.35, y + 1.5, z - 0.95, x + 1.35, y + 1.62, z + 0.95)); bag.add('lacquer_black', box(x - 1.0, y + 1.62, z - 0.6, x + 1.0, y + 1.625, z + 0.6));
    col.rect([x - 2.2, z - 1.6, x + 2.2, z + 1.6], y, y + 0.54); col.rect([x - 1.35, z - 0.95, x + 1.35, z + 0.95], y, y + 1.62);
    for (const s of [-1, 1]) { bag.add('timber', rod([x + s * 2.8, y, z], [x + s * 2.8, y + 2.2, z], 0.05, 6)); bag.add('iron', lathe([[0.001, 0], [0.09, 0.0], [0.1, 0.12], [0.001, 0.12]], 8, null, x + s * 2.8, y + 2.2, z)); } }
  // the hero-shrine of Akademos: a low walled enclosure of rubble with its stele and offering table
  { const [x, z] = el.heroon, w = 3.2, d = 2.6;
    for (const r of [[x - w, z - d, x + w, z - d + 0.4], [x - w, z + d - 0.4, x + w, z + d], [x - w, z - d + 0.4, x - w + 0.4, z + d - 0.4], [x + w - 0.4, z - d + 0.4, x + w, z - 0.7], [x + w - 0.4, z + 0.7, x + w, z + d - 0.4]]) { bag.add('rubble', box(r[0], y, r[1], r[2], y + 1.0, r[3])); col.rect(r, y, y + 1.0); }
    bag.add('limestone', box(x - 0.5, y, z - 0.18, x + 0.5, y + 1.7, z + 0.18)); bag.add('limestone', box(x - 0.55, y + 1.7, z - 0.22, x + 0.55, y + 1.85, z + 0.22)); col.rect([x - 0.55, z - 0.22, x + 0.55, z + 0.22], y, y + 1.85);
    bag.add('limestone', box(x + 1.2, y, z + 0.6, x + 2.0, y + 0.7, z + 1.4)); col.rect([x + 1.2, z + 0.6, x + 2.0, z + 1.4], y, y + 0.7); }
  // the exedra: a half-ring of seats of limestone, its back to the south
  { const [cx, cz] = el.exedra, r = 3.2;
    for (let k = 0; k < 9; k++) { const a = Math.PI * (k + 0.5) / 9, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; const g = box(-0.55, 0, -0.27, 0.55, 0.46, 0.27); g.rotateY(-a - Math.PI / 2); bag.add('limestone', g.clone().translate(x, y, z)); col.circle(x, z, 0.55, y, y + 0.46);
      const g2 = box(-0.55, 0.46, -0.27, 0.55, 1.0, -0.15); g2.rotateY(-a - Math.PI / 2); bag.add('limestone', g2.translate(x, y, z)); }
    bag.add('limestone', box(cx - 0.4, y, cz - 0.4, cx + 0.4, y + 0.7, cz + 0.4)); col.rect([cx - 0.4, cz - 0.4, cx + 0.4, cz + 0.4], y, y + 0.7); }
  // herms and benches along the way from the gate
  const [pa, pb] = [el.paths[0][0], el.paths[0][2]];
  for (let k = 0; k < 4; k++) { const x = pa + (pb - pa) * (0.18 + k * 0.2), z = gz + (k % 2 ? 2.4 : -2.4);
    STYLES.greek.elements.herm({ at: [x, z], y, rot: k % 2 ? -Math.PI / 2 : Math.PI / 2 }, ctx);
    const bx = x + 2.0, bz = gz + (k % 2 ? 2.5 : -2.5); bag.add('limestone', box(bx - 0.7, y + 0.34, bz - 0.25, bx + 0.7, y + 0.46, bz + 0.25)); for (const s of [-0.5, 0.5]) bag.add('limestone', box(bx + s - 0.1, y, bz - 0.22, bx + s + 0.1, y + 0.34, bz + 0.22)); col.rect([bx - 0.7, bz - 0.25, bx + 0.7, bz + 0.25], y, y + 0.46); }
}

Object.assign(STYLES.greek.elements, { gymnasium, academy_grounds: academyGrounds });
