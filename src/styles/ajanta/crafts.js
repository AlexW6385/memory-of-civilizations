// The craft workshops of Ajanta's village (docs/settlements/ajanta.md §14): the open-fronted sheds of the trades that fed the cliff —
// the smith (his forge, bellows and anvil; the masons' chisels were drawn and sharpened here), the potter (wheel, drying pots, kiln),
// the oil-presser (the ox-driven ghani, jars of lamp oil for the caves) and the weaver (pit loom, warp, skeins). Each is a hut on a lot's
// footprint (rect, front 's'|'n') open at the front under a deep thatched eave, furnished, with its trade at work in the yard before it.
import { box, lathe, rod, frustum, disc } from '../../core/geom.js';
import { rng } from '../../settlements/ajanta/layout.js';
import { frame, B, C, pot, wallRun } from './houses.js';

/** The shed: side and back walls of mud, an open front on two posts under a beam, a timber ceiling plate, a thatch hip, an earth floor. */
function shed(F, bag, col, lights, o) {
  const { W, D } = F, t = 0.35, H = o.H ?? 2.4, mud = o.mud ?? 'mud_plaster', ext = 1.0;
  wallRun(F, bag, col, mud, 0, t, 0, D, H, []); wallRun(F, bag, col, mud, W - t, W, 0, D, H, []);
  wallRun(F, bag, col, mud, t, W - t, D - t, D, H, [[W * 0.5, 0.22, 1.2, 1.65]]);
  for (const u of [0.45, W - 0.45]) { const [px, pz] = F.xz(u, -1.3); bag.add('timber', rod([px, 0, pz], [px, H + 0.1, pz], 0.075, 6)); col.circle(px, pz, 0.1, 0, H); }
  B(F, bag, 'timber', -0.1, H - 0.14, -1.4, W + 0.1, H + 0.08, -1.2);
  B(F, bag, 'tuff_red', 0, 0, -0.02, t, 0.5, 0.0); B(F, bag, 'tuff_red', W - t, 0, -0.02, W, 0.5, 0.0);
  { const [a, b, c, d] = F.rect4(t, -1.45, W - t, D - t); bag.add('timber', box(a, H - 0.1, b, c, H, d)); }
  { const [a, b, c, d] = F.rect4(t, -1.4, W - t, D - t); bag.add('earth_wall', box(a, -0.1, b, c, 0.02, d)); col.floor([a, b, c, d], 0.02); }
  bag.add('thatch', frustum(F.rect4(-0.55, -0.55 - ext, W + 0.55, D + 0.55), H - 0.1, H + 0.5, 0.18, 0.18, 0.18, 0.18));
  bag.add('thatch', frustum(F.rect4(-0.3, -0.3 - ext, W + 0.3, D + 0.3), H + 0.5, H + 1.55, 0.5, 0.5, 0.55, 0.55));
  void lights;
}
const R = (F, bag, mat, a, b, r, seg = 5) => { const [x0, z0] = F.xz(a[0], a[2]), [x1, z1] = F.xz(b[0], b[2]); bag.add(mat, rod([x0, a[1], z0], [x1, b[1], z1], r, seg)); };
const L = (F, bag, mat, prof, u, v, y, seg = 10, mod = null) => { const [x, z] = F.xz(u, v); bag.add(mat, lathe(prof, seg, mod, x, y, z)); };

/** aj_smithy: { rect, front, seed } */
export function smithy(el, { bag, col, lights }) {
  const F = frame(el.rect, el.front), { W, D } = F, t = 0.35, rand = rng(el.seed ?? 1);
  shed(F, bag, col, lights, { mud: 'earth_wall' });
  // the forge against the back wall: a clay hearth with its pit of coals, the soot above, the tuyere and two goatskin bellows
  const fu = W * 0.34, fv = D - t - 0.95;
  B(F, bag, 'earth_wall', fu, 0, fv, fu + 1.1, 0.58, D - t); C(F, col, fu, fv, fu + 1.1, D - t, 0, 0.58);
  B(F, bag, 'pottery_dark', fu + 0.25, 0.58, fv + 0.2, fu + 0.85, 0.6, fv + 0.7); B(F, bag, 'flame', fu + 0.4, 0.6, fv + 0.32, fu + 0.7, 0.63, fv + 0.58);
  B(F, bag, 'pottery_dark', fu - 0.2, 0.58, D - t - 0.03, fu + 1.3, 2.05, D - t);
  R(F, bag, 'terracotta', [fu - 0.7, 0.5, fv + 0.45], [fu + 0.25, 0.56, fv + 0.45], 0.035, 6);
  for (const k of [0, 1]) { L(F, bag, 'hide_tan', [[0.001, 0], [0.24, 0.02], [0.28, 0.12], [0.2, 0.22], [0.08, 0.26], [0.001, 0.27]], fu - 1.0, fv + 0.2 + k * 0.5, 0.0, 10); R(F, bag, 'timber', [fu - 1.0, 0.22, fv + 0.2 + k * 0.5], [fu - 0.45, 0.5, fv + 0.45], 0.022, 4); }
  C(F, col, fu - 1.3, fv - 0.1, fu - 0.7, fv + 1.0, 0, 0.3);
  { const [lx, lz] = F.xz(fu + 0.55, fv + 0.45); lights?.push({ at: [lx, 0.85, lz], color: '#ff7a2a', intensity: 4, distance: 8 }); }
  // the anvil: a block of dark stone on a log, the quenching tub, the tongs and hammers on pegs, a rack of chisels, the charcoal
  const au = W * 0.5 + 0.5, av = D * 0.5;
  L(F, bag, 'timber', [[0.001, 0], [0.22, 0], [0.2, 0.4], [0.001, 0.4]], au, av, 0, 10); C(F, col, au - 0.25, av - 0.25, au + 0.25, av + 0.25, 0, 0.55);
  B(F, bag, 'granite_rough', au - 0.16, 0.4, av - 0.16, au + 0.16, 0.56, av + 0.16);
  L(F, bag, 'terracotta', [[0.001, 0], [0.3, 0.02], [0.38, 0.2], [0.34, 0.36], [0.3, 0.4], [0.001, 0.38]], au + 0.9, av - 0.1, 0, 12); L(F, bag, 'water', [[0.001, 0.36], [0.29, 0.36]], au + 0.9, av - 0.1, 0.0, 10); C(F, col, au + 0.55, av - 0.45, au + 1.25, av + 0.25, 0, 0.4);
  B(F, bag, 'planks_grey', t, 1.35, 0.9, t + 0.22, 1.4, D - 0.8);
  for (let k = 0; k < 9; k++) { const v = 1.0 + k * ((D - 1.9) / 8); R(F, bag, 'iron', [t + 0.1, 1.55, v], [t + 0.12, 1.4, v], 0.012, 4); R(F, bag, 'iron', [t + 0.1, 1.55, v], [t + 0.1, 1.9 + rand() * 0.05, v], 0.012, 4); }
  for (const k of [0, 1]) { R(F, bag, 'timber', [W - t - 0.05, 1.5 + k * 0.25, D * 0.5 - 0.3], [W - t - 0.05, 1.12 + k * 0.25, D * 0.5 - 0.3], 0.02, 4); B(F, bag, 'iron', W - t - 0.11, 1.5 + k * 0.25, D * 0.5 - 0.35, W - t - 0.03, 1.58 + k * 0.25, D * 0.5 - 0.15); }
  L(F, bag, 'lacquer_black', [[0.5, 0], [0.42, 0.2], [0.2, 0.34], [0.001, 0.4]], W - t - 0.6, D - t - 0.6, 0, 10); C(F, col, W - t - 1.1, D - t - 1.1, W - t - 0.1, D - t - 0.1, 0, 0.4);
  // the yard: a grindstone on its frame, a stack of iron bars on sleepers, a bundle of chisels, the stone-cutter's sharpening trough
  { const gu = 1.0, gv = -2.2, [gx, gz] = F.xz(gu, gv);
    bag.add('sandstone_dressed', lathe([[0.001, 0], [0.3, 0], [0.3, 0.09], [0.001, 0.09]], 14).rotateX(Math.PI / 2).translate(gx, 0.45, gz - 0.045));
    for (const sg of [-1, 1]) R(F, bag, 'timber', [gu + 0.22 * sg, 0, gv], [gu + 0.1 * sg, 0.6, gv], 0.04, 5);
    R(F, bag, 'timber', [gu - 0.12, 0, gv], [gu + 0.12, 0, gv], 0.01, 3); C(F, col, gu - 0.4, gv - 0.35, gu + 0.4, gv + 0.35, 0, 0.7);
    for (const sg of [-1, 1]) B(F, bag, 'water', gu + sg * 0.05 - 0.2, 0.0, gv + 0.5, gu + sg * 0.05 + 0.2, 0.03, gv + 0.8); }
  { const su = W - 1.9, sv = -2.4;
    for (const s of [0.1, 1.0]) B(F, bag, 'timber', su, 0, sv + s, su + 1.2, 0.08, sv + s + 0.08);
    for (let r2 = 0; r2 < 4; r2++) for (let c = 0; c < 4 - r2; c++) B(F, bag, 'iron', su + 0.06 + c * 0.1 + r2 * 0.05, 0.08 + r2 * 0.06, sv + 0.05, su + 0.12 + c * 0.1 + r2 * 0.05, 0.14 + r2 * 0.06, sv + 1.1);
    C(F, col, su, sv, su + 1.2, sv + 1.1, 0, 0.35); }
  for (let k = 0; k < 6; k++) R(F, bag, 'iron', [W * 0.5 - 0.4 + k * 0.06, 0.03, -1.6], [W * 0.5 - 0.35 + k * 0.06, 0.03, -2.0], 0.012, 4);
}

/** aj_potter: { rect, front, seed } */
export function potter(el, { bag, col }) {
  const F = frame(el.rect, el.front), { W, D } = F, t = 0.35, rand = rng(el.seed ?? 1);
  shed(F, bag, col, null, { mud: 'mud_plaster' });
  // shelves along the back wall with rows of pots, the clay heap, the water tub and the wheel on its stone seat
  for (const h of [0.9, 1.65]) { B(F, bag, 'planks_grey', t + 0.9, h, D - t - 0.42, W - t - 0.2, h + 0.05, D - t); for (let u = t + 1.05; u < W - t - 0.3; u += 0.34 + rand() * 0.1) { const [px, pz] = F.xz(u, D - t - 0.22); pot(bag, px, h + 0.05, pz, 0.1 + rand() * 0.05, 0.2 + rand() * 0.12, rand() < 0.5 ? 'terracotta' : 'pottery_dark'); } }
  L(F, bag, 'earth_wall', [[0.6, 0], [0.5, 0.25], [0.25, 0.45], [0.001, 0.52]], t + 0.55, D - t - 0.6, 0, 10); C(F, col, t + 0.05, D - t - 1.15, t + 1.05, D - t - 0.1, 0, 0.5);
  L(F, bag, 'terracotta', [[0.001, 0], [0.34, 0.02], [0.42, 0.25], [0.38, 0.45], [0.34, 0.5]], W - t - 0.6, D - t - 0.7, 0, 12); L(F, bag, 'water', [[0.001, 0.46], [0.33, 0.46]], W - t - 0.6, D - t - 0.7, 0, 10); C(F, col, W - t - 1.05, D - t - 1.15, W - t - 0.15, D - t - 0.25, 0, 0.5);
  const wu = W * 0.5, wv = D * 0.5;
  B(F, bag, 'granite_rough', wu - 0.25, 0, wv + 0.55, wu + 0.25, 0.2, wv + 0.95);
  L(F, bag, 'timber', [[0.001, 0], [0.07, 0], [0.06, 0.2], [0.001, 0.2]], wu, wv, 0, 6); L(F, bag, 'terracotta', [[0.001, 0], [0.4, 0], [0.42, 0.05], [0.36, 0.1], [0.001, 0.1]], wu, wv, 0.2, 16);
  L(F, bag, 'earth_wall', [[0.001, 0], [0.13, 0.01], [0.1, 0.12], [0.05, 0.2], [0.001, 0.22]], wu, wv, 0.3, 8);
  C(F, col, wu - 0.45, wv - 0.45, wu + 0.45, wv + 0.45, 0, 0.32);
  // the yard before the shed: two rows of pots drying and shaped, a stack of dung-cake fuel, the sherd heap, the kiln with its fire-mouth
  for (let r2 = 0; r2 < 2; r2++) for (let c = 0; c < 6; c++) { const u = 0.5 + c * ((W - 1.0) / 5), v = -1.9 - r2 * 0.9, h = 0.28 + rand() * 0.2, rr = 0.15 + rand() * 0.1; { const [px, pz] = F.xz(u, v); pot(bag, px, 0, pz, rr, h, (c + r2) % 3 ? 'terracotta' : 'pottery_dark'); } if (c % 2 === 0) col.circle(...F.xz(u, v), rr + 0.04, 0, h); }
  { const ku = W + 1.3, kv = -2.6, [kx, kz] = F.xz(ku, kv);
    bag.add('mud_plaster', lathe([[1.05, 0], [1.08, 0.3], [0.95, 0.62], [0.6, 0.95], [0.28, 1.12], [0.001, 1.16]], 16, null, kx, 0, kz));
    B(F, bag, 'pottery_dark', ku - 0.28, 0, kv + 0.95, ku + 0.28, 0.5, kv + 1.15); L(F, bag, 'pottery_dark', [[0.001, 0], [0.24, 0], [0.24, 0.02], [0.001, 0.03]], ku, kv, 1.12, 10);
    L(F, bag, 'pottery_dark', [[0.001, 0], [0.8, 0], [0.6, 0.04], [0.001, 0.05]], ku + 0.1, kv + 1.6, 0, 10); C(F, col, ku - 1.1, kv - 1.1, ku + 1.1, kv + 1.1, 0, 1.2);
    for (let r2 = 0; r2 < 5; r2++) for (let c = 0; c < 3; c++) B(F, bag, 'earth_wall', ku + 1.35 + c * 0.16, r2 * 0.09, kv - 0.3 + 0.0, ku + 1.5 + c * 0.16, r2 * 0.09 + 0.08, kv + 0.2 + 0.0); }
  L(F, bag, 'terracotta', [[0.001, 0], [0.5, 0], [0.4, 0.12], [0.2, 0.18], [0.001, 0.2]], 0.0, -3.2, 0, 8); C(F, col, -0.5, -3.7, 0.5, -2.7, 0, 0.2);
}

/** aj_oilpress: { rect, front, seed } — the oil-presser's shed (the ghani: a log mortar, a pestle turned by an ox on a long arm). */
export function oilpress(el, { bag, col }) {
  const F = frame(el.rect, el.front), { W, D } = F, t = 0.35, rand = rng(el.seed ?? 1);
  shed(F, bag, col, null, { mud: 'earth_wall' });
  // the shed: sacks of sesame and mustard seed, jars of the oil, a strainer cloth on a frame, a bronze measure and a dish of lamps
  for (let k = 0; k < 4; k++) { B(F, bag, 'sacking', t + 0.12 + (k % 2) * 0.5, (k >> 1) * 0.42, D - t - 0.5 - (k % 2) * 0.05, t + 0.62 + (k % 2) * 0.5, 0.4 + (k >> 1) * 0.42, D - t - 0.05); }
  C(F, col, t + 0.1, D - t - 0.55, t + 1.2, D - t - 0.05, 0, 0.85);
  for (let k = 0; k < 5; k++) { const [x, z] = F.xz(W - t - 0.5 - (k % 3) * 0.55, D - t - 0.5 - (k >> 1) * 0.45 * (k > 2 ? 1 : 0)); bag.add('terracotta', lathe([[0.001, 0], [0.17, 0.02], [0.27, 0.25], [0.24, 0.5], [0.12, 0.62], [0.15, 0.66], [0.001, 0.66]], 10, null, x, 0, z)); }
  C(F, col, W - t - 1.7, D - t - 0.95, W - t - 0.2, D - t - 0.2, 0, 0.7);
  for (const u of [W * 0.45, W * 0.45 + 1.0]) R(F, bag, 'timber', [u, 0, D * 0.5], [u, 1.1, D * 0.5], 0.04, 5);
  B(F, bag, 'linen', W * 0.45, 0.8, D * 0.5 - 0.01, W * 0.45 + 1.0, 1.1, D * 0.5 + 0.01);
  L(F, bag, 'bronze', [[0.001, 0], [0.07, 0], [0.09, 0.1], [0.07, 0.13], [0.001, 0.13]], W * 0.45 + 0.5, D * 0.5 + 0.4, 0, 8);
  for (let k = 0; k < 4; k++) L(F, bag, 'terracotta', [[0.001, 0], [0.05, 0], [0.06, 0.03], [0.001, 0.04]], W * 0.55 + k * 0.14, D * 0.5 + 0.9, 0, 6);
  // the ghani in the yard: a log mortar sunk in a ring of stones, a pestle through the arm, the arm reaching out to the ox's yoke
  const gu = W * 0.4, gv = -2.9, [gx, gz] = F.xz(gu, gv), ax = F.f === 's' || F.f === 'n';
  bag.add('rubble', lathe([[0.62, 0], [0.62, 0.12], [0.001, 0.12]], 12, null, gx, 0, gz));
  bag.add('timber', lathe([[0.001, 0], [0.4, 0], [0.46, 0.3], [0.44, 0.78], [0.38, 0.86], [0.28, 0.86], [0.001, 0.5]], 12, null, gx, 0.1, gz));
  C(F, col, gu - 0.5, gv - 0.5, gu + 0.5, gv + 0.5, 0, 1.0);
  R(F, bag, 'timber', [gu + 0.05, 0.75, gv], [gu + 0.2, 2.25, gv], 0.075, 7);                  // the pestle, leaning, thick at the foot
  R(F, bag, 'timber', [gu - 0.2, 2.1, gv], [gu + 2.9, 2.1, gv], 0.065, 6);                     // the arm, above a person's reach
  R(F, bag, 'timber', [gu + 0.2, 2.1, gv], [gu + 0.2, 2.3, gv], 0.09, 6);
  R(F, bag, 'timber', [gu + 2.55, 2.1, gv - 0.35], [gu + 2.55, 2.1, gv + 0.35], 0.04, 5); R(F, bag, 'rope_fibre', [gu + 2.55, 1.5, gv - 0.3], [gu + 2.55, 2.08, gv - 0.3], 0.015, 4); R(F, bag, 'rope_fibre', [gu + 2.55, 1.5, gv + 0.3], [gu + 2.55, 2.08, gv + 0.3], 0.015, 4);
  void ax; void rand;
  for (let k = 0; k < 3; k++) { const [x, z] = F.xz(gu - 1.2 + k * 0.3, gv + 1.0); bag.add('terracotta', lathe([[0.001, 0], [0.15, 0.02], [0.23, 0.2], [0.2, 0.4], [0.1, 0.5], [0.001, 0.5]], 9, null, x, 0, z)); }
  B(F, bag, 'sacking', W - 1.2, 0, -1.9, W - 0.4, 0.3, -1.3); C(F, col, W - 1.2, -1.9, W - 0.4, -1.3, 0, 0.3);
}

/** aj_weaver: { rect, front, seed } — a pit loom in the shed, the warp laid out on pegs and skeins on a pole in the yard, an indigo vat. */
export function weaver(el, { bag, col }) {
  const F = frame(el.rect, el.front), { W, D } = F, t = 0.35, rand = rng(el.seed ?? 1);
  shed(F, bag, col, null, { mud: 'mud_plaster' });
  const lu = W * 0.5, v0 = 0.7, v1 = Math.min(D - t - 0.45, 3.6);
  // the loom: four posts, the cloth beam at the weaver's end and the warp beam at the far end, the warp in stripes, the cloth woven so far, two heddle shafts hung from the ceiling, the pit for the treadles
  B(F, bag, 'pottery_dark', lu - 0.45, 0.025, 1.05, lu + 0.45, 0.03, 1.8);
  for (const du of [-0.62, 0.62]) for (const v of [v0, v1]) { R(F, bag, 'timber', [lu + du, 0, v], [lu + du, 1.15, v], 0.05, 6); col.circle(...F.xz(lu + du, v), 0.07, 0, 1.15); }
  R(F, bag, 'timber', [lu - 0.7, 1.05, v0], [lu + 0.7, 1.05, v0], 0.04, 6); R(F, bag, 'timber', [lu - 0.7, 1.05, v1], [lu + 0.7, 1.05, v1], 0.045, 6);
  const cols = ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre'];
  for (let k = 0; k < 6; k++) B(F, bag, cols[k], lu - 0.6 + k * 0.2, 1.05, v0 + 0.55, lu - 0.42 + k * 0.2, 1.065, v1);
  B(F, bag, 'cloth_ochre', lu - 0.6, 1.05, v0, lu + 0.6, 1.075, v0 + 0.55); for (let k = 0; k < 4; k++) B(F, bag, 'cloth_indigo', lu - 0.6, 1.075, v0 + 0.08 + k * 0.12, lu + 0.6, 1.082, v0 + 0.12 + k * 0.12);
  for (const [v, h] of [[1.9, 1.5], [2.15, 1.35]]) { for (const du of [-0.5, 0.5]) R(F, bag, 'rope_fibre', [lu + du, 2.28, v], [lu + du, h, v], 0.012, 4); R(F, bag, 'timber', [lu - 0.58, h, v], [lu + 0.58, h, v], 0.03, 5); }
  R(F, bag, 'timber', [lu - 0.58, 2.3, 1.9], [lu - 0.58, 2.3, 2.15], 0.03, 4); R(F, bag, 'timber', [lu - 0.7, 2.28, 1.7], [lu + 0.7, 2.28, 1.7], 0.03, 5);
  B(F, bag, 'planks_grey', lu - 0.4, 0.14, 0.1, lu + 0.4, 0.2, 0.45); C(F, col, lu - 0.4, 0.1, lu + 0.4, 0.45, 0, 0.2);        // the weaver's seat at the cloth beam
  for (let k = 0; k < 5; k++) { const [x, z] = F.xz(0.65 + k * 0.5, D - t - 0.35); bag.add(k % 2 ? 'cloth_red' : 'cloth_white', lathe([[0.001, 0], [0.06, 0.01], [0.07, 0.1], [0.001, 0.12]], 6, null, x, 0.0, z)); }   // bobbins of thread in a row
  B(F, bag, 'planks_grey', W - t - 0.5, 0.6, D - t - 0.5, W - t - 0.04, 0.66, D - t - 0.04); for (let k = 0; k < 3; k++) { const [x, z] = F.xz(W - t - 0.3 - (k % 2) * 0.1, D - t - 0.28 - (k >> 1) * 0.1); bag.add('cloth_white', lathe([[0.001, 0], [0.1, 0.01], [0.11, 0.12], [0.001, 0.14]], 8, null, x, 0.66, z)); }
  // the yard: the warp stretched on pegs (a long line of fine threads), skeins dyed red, ochre and indigo on a pole, the indigo vat, a heap of cotton
  const pegs = []; for (let k = 0; k < 8; k++) pegs.push(0.4 + k * ((W - 0.8) / 7));
  for (const u of pegs) R(F, bag, 'timber', [u, 0, -2.5], [u, 0.45, -2.5], 0.025, 4);
  for (const v of [-2.5, -3.1]) for (const u of [pegs[0], pegs[7]]) R(F, bag, 'timber', [u, 0, v], [u, 0.5, v], 0.03, 5);
  B(F, bag, 'cloth_white', pegs[0], 0.33, -3.1, pegs[7], 0.345, -2.5); B(F, bag, 'cloth_white', pegs[0], 0.2, -3.1, pegs[7], 0.213, -2.5);
  { const pu0 = 0.2, pu1 = W - 0.3; for (const u of [pu0, pu1]) R(F, bag, 'timber', [u, 0, -1.9], [u, 1.9, -1.9], 0.04, 5); R(F, bag, 'bamboo_culm', [pu0, 1.85, -1.9], [pu1, 1.85, -1.9], 0.03, 5);
    for (let k = 0; k < 6; k++) B(F, bag, ['cloth_red', 'cloth_ochre', 'cloth_indigo'][k % 3], pu0 + 0.4 + k * ((pu1 - pu0 - 0.8) / 5), 1.2, -1.93, pu0 + 0.55 + k * ((pu1 - pu0 - 0.8) / 5), 1.85, -1.87); }
  L(F, bag, 'terracotta', [[0.001, 0], [0.34, 0.02], [0.46, 0.22], [0.42, 0.45], [0.36, 0.5]], W + 0.9, -1.2, 0, 12); L(F, bag, 'cloth_indigo', [[0.001, 0.46], [0.35, 0.46]], W + 0.9, -1.2, 0, 12); C(F, col, W + 0.4, -1.7, W + 1.4, -0.7, 0, 0.5);
  void rand;
}
export const CRAFT_ELEMENTS = { aj_smithy: smithy, aj_potter: potter, aj_oilpress: oilpress, aj_weaver: weaver };
