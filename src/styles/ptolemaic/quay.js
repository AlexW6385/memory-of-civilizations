// The harbour front and the street furniture of Alexandria (docs/settlements/alexandria.md §12): goods piled on the quay (amphorae of
// wine and oil, sacks of Egyptian grain, bales, logs of cedar, ingots), the treadwheel crane, racks of nets and drying fish, the
// horreum (a warehouse of open bays), a fountain house, a shrine of Isis at a crossing, a stele, washing across the alleys.
// Registered into the `ptolemaic` style (index.js). All [inferred] in form from Hellenistic and Roman harbours.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { kit } from '../greek/quarter.js';
import { rng, pick, amphora, pithos, sack, basket, crate, ropeCoil, washLine, palm, fig } from './dress.js';

/** cargo_pile: { at [x, z], y, rot, kind ('amphorae' | 'sacks' | 'bales' | 'logs' | 'crates' | 'ingots'), n (rows), seed }. */
function cargoPile({ at: [x, z], y = 0, rot = 0, kind = 'sacks', n = 3, seed = 1 }, { bag, col }) {
  const rand = rng(seed), c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  if (kind === 'amphorae') {
    for (let layer = 0; layer < n; layer++) for (let k = 0; k < 5 - layer; k++) for (let j = 0; j < 2; j++) {
      const u = (k - (4 - layer) / 2) * 0.42, [px, pz] = P(u, (j - 0.5) * 0.7 + (layer % 2) * 0.1);
      amphora(bag, px, y + 0.2 + layer * 0.34, pz, { s: 1.0, tilt: -Math.PI / 2 + 0.03 * (rand() - 0.5), rot: rot + Math.PI / 2, seg: 6, mat: layer % 2 ? 'terracotta' : 'stucco_siena' });
    }
    for (const sx of [-1, 1]) bag.add('timber', box(P(sx * 1.2, -0.6)[0] - 0.04, y, P(sx * 1.2, -0.6)[1] - 0.04, P(sx * 1.2, 0.6)[0] + 0.04, y + 0.12, P(sx * 1.2, 0.6)[1] + 0.04));
    col.circle(x, z, 1.3, y, y + 1.4);
  } else if (kind === 'sacks') {
    for (let layer = 0; layer < n; layer++) for (let k = 0; k < 5 - layer; k++) for (let j = 0; j < 2; j++) { const [px, pz] = P((k - (4 - layer) / 2) * 0.55, (j - 0.5) * 0.45); sack(bag, px, y + layer * 0.34, pz, rot + (rand() - 0.5) * 0.5, pick(rand, ['sacking', 'sacking', 'linen'])); }
    col.circle(x, z, 1.4, y, y + 1.0);
  } else if (kind === 'bales') {
    for (let layer = 0; layer < Math.min(n, 3); layer++) for (let k = 0; k < 4 - layer; k++) { const [px, pz] = P((k - (3 - layer) / 2) * 1.0, 0); bag.add(pick(rand, ['cloth_ochre', 'linen', 'cloth_indigo', 'sacking']), box(-0.5, y + layer * 0.55, -0.35, 0.5, y + layer * 0.55 + 0.52, 0.35).rotateY(rot).translate(px, 0, pz)); bag.add('rope_fibre', box(-0.52, y + layer * 0.55 + 0.2, -0.37, 0.52, y + layer * 0.55 + 0.26, 0.37).rotateY(rot).translate(px, 0, pz)); }
    col.circle(x, z, 1.6, y, y + 1.5);
  } else if (kind === 'logs') {
    for (let layer = 0; layer < n; layer++) for (let k = 0; k < 5 - layer; k++) { const [px, pz] = P((k - (4 - layer) / 2) * 0.34, 0); const g = lathe([[0.16, 0], [0.15, 3.6], [0.001, 3.6]], 6); g.rotateX(Math.PI / 2).translate(0, 0, -1.8).rotateY(rot).translate(px, y + 0.17 + layer * 0.29, pz); bag.add('cedar', g); }
    col.circle(x, z, 2.0, y, y + 1.0);
  } else if (kind === 'ingots') {
    for (let layer = 0; layer < n; layer++) for (let k = 0; k < 4; k++) { const [px, pz] = P((k - 1.5) * 0.4, 0); bag.add(layer % 2 ? 'bronze' : 'lead', box(-0.18, y + layer * 0.12, -0.1, 0.18, y + layer * 0.12 + 0.11, 0.1).rotateY(rot).translate(px, 0, pz)); }
    col.circle(x, z, 0.9, y, y + 0.4);
  } else {
    for (let layer = 0; layer < n; layer++) for (let k = 0; k < 3; k++) { const [px, pz] = P((k - 1) * 0.8, 0); crate(bag, col, px, y + layer * 0.5, pz, 0.74, 0.48, 0.55); }
  }
}
/** crane: { at [x, z], y, rot } — the treadwheel crane (polyspaston): two posts, the jib out over the water, the great wheel the labourers walk in, the pulley and the rope with a slung amphora. The jib points along rot (0 = −z). */
function crane({ at: [x, z], y = 0, rot = 0 }, { bag, col }) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (u, v, h) => [x + u * c + v * s, y + h, z - u * s + v * c];
  const seg = (a, b, r, m = 'timber') => bag.add(m, rod(a, b, r, 5));
  for (const u of [-0.9, 0.9]) { seg(P(u, 1.2, 0), P(u * 0.5, -0.2, 6.2), 0.14); seg(P(u, -1.4, 0), P(u * 0.5, -0.2, 6.2), 0.14); }
  seg(P(0, -0.2, 6.0), P(0, -5.6, 7.4), 0.16, 'wood_dark');                       // the jib out over the water (toward −v... the rot's −z)
  seg(P(0, -0.2, 6.0), P(0, 1.8, 5.0), 0.12, 'wood_dark');
  const wheel = lathe([[1.6, -0.3], [1.7, -0.3], [1.7, 0.3], [1.6, 0.3]], 14); wheel.rotateZ(Math.PI / 2); wheel.rotateY(rot); const [wx, wy, wz] = P(0, 0.6, 1.8); wheel.translate(wx, wy, wz); bag.add('wood_dark', wheel);
  for (let a = 0; a < 6; a++) { const th = a * Math.PI / 3, g = rod([0, 0, 0], [0, Math.cos(th) * 1.6, Math.sin(th) * 1.6], 0.04, 4); g.rotateY(0); }
  seg(P(0, 0, 1.8), P(0, 1.2, 1.8), 0.1);
  const [ex, ey, ez] = P(0, -5.4, 7.3); bag.add('rope_fibre', rod([ex, ey, ez], [ex, ey - 3.6, ez], 0.025, 3));
  amphora(bag, ex, ey - 4.7, ez, { s: 1.0, seg: 6 });
  col.circle(...[P(0, 1.2, 0)[0], P(0, 1.2, 0)[2]], 0.3, y, y + 5); col.circle(P(0, -1.4, 0)[0], P(0, -1.4, 0)[2], 0.3, y, y + 5);
  ropeCoil(bag, P(1.6, 1.6, 0)[0], y, P(1.6, 1.6, 0)[2], 0.35);
}
/** net_rack: { at [x, z], y, rot, len } — two posts with a crossbar, nets hung to dry and a row of split fish. */
function netRack({ at: [x, z], y = 0, rot = 0, len = 3.2, seed = 1 }, { bag, col }) {
  const rand = rng(seed), c = Math.cos(rot), s = Math.sin(rot), P = (u) => [x + u * c, z - u * s];
  for (const u of [-len / 2, len / 2]) { const [px, pz] = P(u); bag.add('timber', box(px - 0.05, y, pz - 0.05, px + 0.05, y + 2.2, pz + 0.05)); col.circle(px, pz, 0.07, y, y + 2.2); }
  const [ax, az] = P(-len / 2), [bx, bz] = P(len / 2); bag.add('timber', rod([ax, y + 2.1, az], [bx, y + 2.1, bz], 0.035, 4));
  for (let k = 0; k < 3; k++) { const u0 = -len / 2 + 0.2 + k * (len - 0.4) / 3, [px, pz] = P(u0), [qx, qz] = P(u0 + (len - 0.4) / 3 - 0.1); bag.add('rope_fibre', box(Math.min(px, qx) - 0.02, y + 0.5 + rand() * 0.3, Math.min(pz, qz) - 0.02, Math.max(px, qx) + 0.02, y + 2.05, Math.max(pz, qz) + 0.02)); }
  for (let k = 0; k < 6; k++) { const [px, pz] = P(-len / 2 + 0.3 + k * 0.5); bag.add('steel_grey', box(px - 0.04, y + 1.5, pz - 0.015, px + 0.04, y + 1.85, pz + 0.015)); }
}
/** horreum: { rect, front, y, seed } — a warehouse of the quay: a long hall of open bays between square piers, a flat roof of beams and mud on stone, the back wall solid, the floor raised a step; inside, stacks of jars and sacks. */
function horreum(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, rand = rng(el.seed ?? 1), K = kit(ctx, el.rect, el.front ?? 's', y), { F, R } = K, { L, D } = F;
  const H = 4.6, wall = 'limestone', n = Math.max(3, Math.round(L / 3.6)), bw = (L - 0.8) / n;
  const LOFT = 3.4, HT = H + LOFT;
  // the grain loft over the bays: a plastered storey with a row of small windows, a painted band and the cavetto cornice, flat roof with a parapet
  const loft = (full) => {
    R(0, 0, L, D, H, HT, el.tint ?? 'plaster_white', false);
    R(-0.05, -0.05, L + 0.05, D + 0.05, H + 0.0, H + 0.45, 'limestone', false);
    R(-0.1, -0.1, L + 0.1, D + 0.1, HT - 0.9, HT - 0.55, 'egyptian_blue', false);
    for (let k = 0; k < 4; k++) R(-0.12 - 0.07 * k, -0.12 - 0.07 * k, L + 0.12 + 0.07 * k, D + 0.12 + 0.07 * k, HT - 0.55 + k * 0.14, HT - 0.55 + (k + 1) * 0.14, 'limestone', false);
    R(-0.1, -0.1, L + 0.1, 0.3, HT + 0.02, HT + 0.6, 'limestone', false);
    if (!full) return;
    for (let k = 0; k < n; k++) { const u = 0.4 + (k + 0.5) * bw; R(u - 0.45, -0.1, u + 0.45, 0.05, H + 0.9, H + 2.0, 'opening', false); R(u - 0.6, -0.12, u + 0.6, 0.0, H + 2.0, H + 2.2, 'limestone', false); R(u - 0.55, -0.2, u + 0.55, 0.0, H + 0.75, H + 0.9, 'limestone', false); }
    // the hoist: a beam out over the quay from the loft door with its pulley, rope and a sack on the hook
    const u = L / 2, [bx, bz] = F.P(u, 0.0), [ex, ez] = F.P(u, -1.9);
    R(u - 0.5, -0.1, u + 0.5, 0.05, H + 0.3, H + 2.2, 'wood_dark', false);
    bag.add('timber', rod([bx, y + H + 2.5, bz], [ex, y + H + 2.5, ez], 0.09, 5)); bag.add('timber', rod([bx, y + H + 0.9, bz], [ex, y + H + 2.45, ez], 0.06, 4));
    bag.add('rope_fibre', rod([ex, y + H + 2.45, ez], [ex, y + H + 0.9, ez], 0.02, 3)); sack(bag, ex, y + H + 0.45, ez, 0.3);
  };
  if (el.simple) { R(0, 0, L, D, -0.4, H, wall, false); loft(false); R(-0.1, -0.1, L + 0.1, D + 0.1, HT + 0.02, HT + 0.3, 'mud_plaster', false); return; }
  R(0, 0, L, D, -0.5, 0.25, 'limestone', false); col.floor(F.R(0.3, 0.3, L - 0.3, D - 0.3), y + 0.25);
  R(0, D - 0.7, L, D, 0.25, H, wall, true); R(0, 0, 0.7, D, 0.25, H, wall, true); R(L - 0.7, 0, L, D, 0.25, H, wall, true);
  for (let k = 1; k < n; k++) R(0.4 + k * bw - 0.35, 0.0, 0.4 + k * bw + 0.35, 0.7, 0.25, H, wall, true);
  R(0, 0, L, 0.7, 3.4, H, wall, false);
  for (let k = 0; k < n; k++) { R(0.4 + k * bw + 0.35, 0.05, 0.4 + (k + 1) * bw - 0.35, 0.15, 3.35, 3.4, 'limestone', false); }
  R(0.1, 0.1, L - 0.1, D - 0.1, H - 0.2, H, 'timber', false); loft(true); R(0, 0, L, D, HT + 0.6, HT + 0.7, 'mud_plaster', false);
  // the goods inside, in each bay
  for (let k = 0; k < n; k++) {
    const u = 0.4 + (k + 0.5) * bw, v = D - 1.7, t = (k + Math.floor(rand() * 3)) % 3;
    if (t === 0) for (let j = 0; j < 3; j++) { const [px, pz] = F.P(u - 0.8 + j * 0.8, v - 0.2); pithos(bag, col, px, y + 0.25, pz, 0.85); }
    else if (t === 1) for (let layer = 0; layer < 3; layer++) for (let j = 0; j < 4 - layer; j++) { const [px, pz] = F.P(u - 0.8 + layer * 0.3 + j * 0.55, v); sack(bag, px, y + 0.25 + layer * 0.34, pz, j); }
    else for (let j = 0; j < 4; j++) { const [px, pz] = F.P(u - 0.9 + j * 0.55, v); amphora(bag, px, y + 0.25, pz, { s: 1.0, seg: 6 }); }
    col.rect(F.R(u - 1.0, v - 0.7, u + 1.0, v + 0.6), y + 0.25, y + 1.2);
  }
  // the clerk's tally board at the entrance
  R(L / 2 - 0.5, -0.12, L / 2 + 0.5, -0.06, 2.1, 2.8, 'plaster_white', false);
}
/** nymphaeum: { c [x, z], y, rot } — a fountain: a basin of limestone with a back wall and lion-head spouts. */
function fountain({ c: [x, z], y = 0, rot = 0 }, { bag, col }) {
  const k = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * k + v * s, z - u * s + v * k];
  const B = (u0, v0, u1, v1, y0, y1, m) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + y1, Math.max(a[1], b[1]))); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y + y0, y + y1); };
  B(-1.6, -0.5, 1.6, 0.5, 0, 0.7, 'marble'); bag.add('water', box(x - 1.4, y + 0.66, z - 0.3, x + 1.4, y + 0.68, z + 0.3));
  B(-1.6, 0.5, 1.6, 0.8, 0, 2.6, 'marble'); B(-1.8, 0.4, 1.8, 0.9, 2.6, 2.95, 'marble_smooth'); B(-0.9, 0.62, -0.7, 0.8, 0.85, 1.0, 'bronze');
  for (const u of [-1.0, 0, 1.0]) { const [px, pz] = P(u, 0.4); bag.add('bronze', lathe([[0.001, 0], [0.09, 0.0], [0.12, 0.1], [0.06, 0.2], [0.001, 0.2]], 6, null, px, y + 1.2, pz)); }
}
/** shrine: { at [x, z], y, rot } — a street shrine of Isis: a small aedicula on a stone base, a cavetto cornice, a lamp burning before it. */
function shrine({ at: [x, z], y = 0, rot = 0 }, { bag, col, lights }) {
  const k = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * k + v * s, z - u * s + v * k];
  const B = (u0, v0, u1, v1, y0, y1, m) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + y1, Math.max(a[1], b[1]))); };
  B(-0.7, -0.5, 0.7, 0.5, 0, 0.5, 'limestone'); B(-0.5, -0.4, 0.5, 0.4, 0.5, 2.2, 'plaster_white'); B(-0.35, -0.42, 0.35, -0.3, 0.8, 1.9, 'opening');
  B(-0.65, -0.5, 0.65, 0.5, 2.2, 2.5, 'sandstone'); B(-0.55, -0.4, 0.55, 0.4, 2.5, 2.6, 'egyptian_blue'); B(-0.1, -0.35, 0.1, -0.2, 0.95, 1.5, 'bronze');
  const [ax, az] = P(0, -0.7); bag.add('limestone', lathe([[0.2, 0], [0.12, 0.5], [0.2, 0.6], [0.001, 0.6]], 6, null, ax, y, az)); bag.add('flame', lathe([[0.001, 0], [0.06, 0.01], [0.001, 0.2]], 5, null, ax, y + 0.6, az));
  const a = P(-0.7, -0.5), b = P(0.7, 0.5); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 2.6); void lights;
}
/** stele: { at, y, rot, h } — an inscribed stele on a base (decrees, dedications). */
function stele({ at: [x, z], y = 0, rot = 0, h = 2.0 }, { bag, col }) {
  bag.add('limestone', box(-0.4, y, -0.3, 0.4, y + 0.3, 0.3).rotateY(rot).translate(x, 0, z));
  const g = box(-0.3, 0.3, -0.1, 0.3, h, 0.1); g.rotateY(rot); bag.add('marble_smooth', g.translate(x, y, z)); col.circle(x, z, 0.45, y, y + h);
}
/** ptol_wash: { a [x, z], b [x, z], y, seed } — a line of washing across an alley between the upper windows. */
function wash({ a, b, y = 4.6, seed = 1 }, { bag }) { washLine(bag, a, b, y, rng(seed), 0.95); }
/** mooring: { at [x, z], y, rot } — mooring rings, a fisherman's basket and a coil of rope on the quay's edge. */
function mooring({ at: [x, z], y = 0, rot = 0, seed = 1 }, { bag, col }) {
  const rand = rng(seed); ropeCoil(bag, x, y, z, 0.3 + rand() * 0.1); basket(bag, x + Math.cos(rot) * 0.9, y, z - Math.sin(rot) * 0.9, 0.27, 0.3, 'steel_grey'); void col; void STYLES;
}
/** ptol_tree: { at, y, kind ('palm' | 'fig'), h, seed }. */
function tree({ at: [x, z], y = 0, kind = 'palm', h = 6, seed = 1 }, { bag, col }) { (kind === 'fig' ? fig : palm)(bag, col, x, y, z, h, seed); }
export const QUAY_EL = { cargo_pile: cargoPile, crane, net_rack: netRack, horreum, nymphaeum: fountain, shrine, stele, ptol_wash: wash, mooring, ptol_tree: tree };
