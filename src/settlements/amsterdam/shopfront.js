// The shop fronts of the Dam and its streets about 1670 (docs/settlements/amsterdam.md §10.1): an open canal house's ground-floor window turned to a shop
// in the way of the century — the lower shutter let down on its stays to make the counter, the goods on it and on the sill, more hung from a rail under a
// canvas awning, a painted board on a bracket, the keeper inside at the window. `am_shopfront` is registered into the dutch style from here (the builder
// of the house itself, src/styles/dutch/house.js, is untouched). Pure functions of the lot's own dice (profile(), as house.js draws them).
import '../../styles/dutch/index.js';
import { STYLES } from '../../core/build.js';
import { lathe } from '../../core/geom.js';
import { faceFrame, fbox, bar, slab4 } from '../../styles/dutch/facade.js';
import { profile } from '../../styles/dutch/upper.js';

import { TRADES } from './dice.js';
export { TRADES };
/** Awning cloth and the board's emblem colours by trade. */
const LOOK = { baker: ['cloth_ochre', 'hide_tan'], cheese: ['cloth_red', 'cloth_ochre'], draper: ['cloth_indigo', 'cloth_red'], grocer: ['cloth_green', 'hide_brown'], delft: ['cloth_white', 'paint_blue'], tobacco: ['hide_brown', 'cloth_ochre'] };
const BASE = 1.0, SILL = BASE + 0.45;

/** The window bay the shop takes, and the door's: { uw, ud, bw, ww } in the lot's front frame (u along the front), or null for a house with no window bay beside its door. */
export function shopBay(l) {
  const p = profile(l);
  if (p.warehouse) return null;
  const bw = p.w / p.bays, doorBay = p.left ? 0 : p.bays - 1, bay = p.bays === 3 ? 1 : (doorBay === 0 ? 1 : 0);
  return { uw: (bay + 0.5) * bw, ud: (doorBay + 0.5) * bw, bw, ww: Math.min(1.2, bw - 0.95), w: p.w };
}

function amShopfront(el, { bag, col }) {
  const F = faceFrame(el.rect, el.front), y = el.y ?? 0, B = shopBay(el);
  if (!B) return;
  const { uw, bw, ww } = B, kind = el.trade, [cloth, accent] = LOOK[kind] || LOOK.baker;
  const A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), P3 = (u, v, d) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const u0 = uw - ww / 2 - 0.07, u1 = uw + ww / 2 + 0.07, top = SILL + 0.07;
  // the counter: the lower shutter let down level with the sill, a lip along its edge, two iron stays up to the wall
  A('timber', u0, u1, SILL + 0.02, top, 0.1, 0.66);
  A('wood_dark', u0, u1, top, top + 0.045, 0.63, 0.66); for (const u of [u0, u1 - 0.03]) A('wood_dark', u, u + 0.03, top, top + 0.04, 0.1, 0.63);
  for (const u of [u0 + 0.03, u1 - 0.03]) bag.add('iron', bar(P3(u, top - 0.04, 0.6), P3(u, top + 0.66, 0.03), 0.025, 0.018));
  { const p = F.at(u0, 0.1), q = F.at(u1, 0.66); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y + SILL, y + top + 0.5); }
  const T = top + 0.045, at = (f, g) => [uw + (f - 0.5) * (ww + 0.1), 0.15 + g * 0.5];
  const disc = (m, f, g, r, h, v0 = T) => { const [u, d] = at(f, g), [x, z] = F.at(u, d); bag.add(m, lathe([[r, 0], [r, h], [r * 0.7, h + 0.02], [0.001, h + 0.02]], 8, null, x, y + v0, z)); };
  const ball = (m, f, g, r, v0 = T) => { const [u, d] = at(f, g), [x, z] = F.at(u, d); bag.add(m, lathe([[0.001, 0], [r * 0.8, r * 0.25], [r, r], [r * 0.8, r * 1.75], [0.001, r * 2]], 9, null, x, y + v0, z)); };
  const slabAt = (m, f, g, a, h, b, v0 = T) => { const [u, d] = at(f, g); A(m, u - a / 2, u + a / 2, v0, v0 + h, d - b / 2, d + b / 2); };
  // the goods on the counter, by trade
  if (kind === 'baker') {
    for (const [f, g, r] of [[0.15, 0.3, 0.13], [0.4, 0.2, 0.14], [0.65, 0.32, 0.13], [0.3, 0.7, 0.12], [0.58, 0.72, 0.13]]) { const [u, d] = at(f, g), [x, z] = F.at(u, d); bag.add('hide_tan', lathe([[0.001, 0], [r, 0.02], [r * 1.05, 0.07], [r * 0.7, 0.12], [0.001, 0.14]], 9, null, x, y + T, z)); }
    disc('wicker', 0.88, 0.5, 0.16, 0.12); ball('hide_tan', 0.88, 0.5, 0.06, T + 0.12);
  } else if (kind === 'cheese') {
    for (const [f, g] of [[0.15, 0.3], [0.38, 0.22], [0.6, 0.3], [0.27, 0.68], [0.5, 0.7]]) ball('cloth_red', f, g, 0.11);
    disc('cloth_ochre', 0.82, 0.55, 0.2, 0.1); disc('cloth_ochre', 0.82, 0.55, 0.2, 0.1, T + 0.1);
  } else if (kind === 'draper') {
    for (const [f, m, h] of [[0.2, 'cloth_indigo', 0.12], [0.2, 'cloth_red', 0.12], [0.2, 'cloth_grey', 0.12], [0.62, 'cloth_green', 0.12], [0.62, 'cloth_white', 0.12]]) slabAt(m, f, 0.55, 0.4, h, 0.3, T + (m === 'cloth_red' ? 0.12 : m === 'cloth_grey' ? 0.24 : m === 'cloth_white' ? 0.12 : 0));
  } else if (kind === 'grocer') {
    for (const f of [0.2, 0.6]) { disc('rope_fibre', f, 0.5, 0.2, 0.28); disc('hide_brown', f, 0.5, 0.15, 0.04, T + 0.3); }
    slabAt('iron', 0.9, 0.2, 0.12, 0.02, 0.12); ball('iron', 0.9, 0.2, 0.05, T + 0.02);
  } else if (kind === 'delft') {
    for (const f of [0.15, 0.4, 0.65]) { const [u, d] = at(f, 0.78); A('glaze_white', u - 0.12, u + 0.12, T + 0.02, T + 0.28, d - 0.012, d + 0.012); A('paint_blue', u - 0.08, u + 0.08, T + 0.1, T + 0.2, d + 0.012, d + 0.02); }
    disc('paint_blue', 0.2, 0.3, 0.09, 0.2); disc('glaze_white', 0.5, 0.3, 0.08, 0.17); disc('iron', 0.8, 0.3, 0.07, 0.2);
  } else {
    for (const f of [0.15, 0.3, 0.45]) { const [u, d] = at(f, 0.35); A('hide_brown', u - 0.05, u + 0.05, T, T + 0.1, d - 0.12, d + 0.12); }
    for (let k = 0; k < 6; k++) { const [u, d] = at(0.62 + k * 0.05, 0.6); A('glaze_white', u - 0.006, u + 0.006, T, T + 0.012, d - 0.1, d + 0.1); }
    disc('wood_dark', 0.85, 0.35, 0.08, 0.1);
  }
  // the awning: canvas sloping from over the lintel to a rail on two brackets, a valance; goods hanging from the rail
  const au0 = uw - ww / 2 - 0.4, au1 = uw + ww / 2 + 0.4, vh = 4.55, vr = 3.85, dr = 1.0;
  bag.add(cloth, slab4([P3(au0, vh, 0.04), P3(au1, vh, 0.04), P3(au1, vr, dr), P3(au0, vr, dr)], 0.022));
  A('wood_dark', au0, au1, vr - 0.06, vr + 0.02, dr - 0.02, dr + 0.04);
  for (const u of [au0 + 0.04, au1 - 0.04]) bag.add('iron', bar(P3(u, vh - 0.12, 0.04), P3(u, vr - 0.03, dr), 0.025, 0.02));
  const hang = (u, len, m, w = 0.06) => { A('rope_fibre', u - 0.006, u + 0.006, vr - 0.06 - 0.12, vr - 0.06, dr + 0.005, dr + 0.012); A(m, u - w, u + w, vr - 0.18 - len, vr - 0.18, dr - 0.04, dr + 0.04); };
  const hu = (k) => au0 + 0.25 + k * (au1 - au0 - 0.5) / 3;
  if (kind === 'baker') for (let k = 0; k < 4; k++) hang(hu(k), 0.1, 'wicker', 0.1);
  else if (kind === 'cheese') for (let k = 0; k < 4; k++) hang(hu(k), 0.22, 'cloth_ochre', 0.1);
  else if (kind === 'draper') for (let k = 0; k < 4; k++) hang(hu(k), 0.55 + 0.06 * (k & 1), ['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_green'][k], 0.14);
  else if (kind === 'grocer') for (let k = 0; k < 4; k++) hang(hu(k), k & 1 ? 0.3 : 0.2, k & 1 ? 'hide_brown' : 'cloth_ochre', 0.08);
  else if (kind === 'delft') for (let k = 0; k < 4; k++) hang(hu(k), 0.16, k & 1 ? 'paint_blue' : 'wood_dark', 0.1);
  else for (let k = 0; k < 4; k++) hang(hu(k), 0.4, 'hide_brown', 0.07);
  // the board on its bracket in the pier beyond the window (away from the door): the trade's emblem painted on it, readable along the street
  const pu = uw + (uw + bw / 2 < B.w - 0.4 && Math.abs(uw + bw / 2 - B.ud) > 0.9 ? bw / 2 : -bw / 2), bv = 4.95;
  if (Math.abs(pu - B.ud) > 0.9) {
    bag.add('iron', bar(P3(pu, bv, 0.0), P3(pu, bv, 0.95), 0.03, 0.03)); bag.add('iron', bar(P3(pu, bv - 0.5, 0.0), P3(pu, bv, 0.55), 0.025, 0.025));
    for (const dd of [0.35, 0.8]) A('iron', pu - 0.006, pu + 0.006, bv - 0.2, bv, dd - 0.006, dd + 0.006);
    A('wood_painted', pu - 0.025, pu + 0.025, bv - 0.62, bv - 0.2, 0.2, 0.95);
    const mid = 0.575, vm = bv - 0.41;
    // the emblem: a disc or a bar on each face (a thin box a hair proud)
    const E = (m, d0, d1, v0, v1) => { A(m, pu - 0.04, pu - 0.025, v0, v1, d0, d1); A(m, pu + 0.025, pu + 0.04, v0, v1, d0, d1); };
    E(accent, mid - 0.2, mid + 0.2, vm - 0.12, vm + 0.12); E(cloth, mid - 0.1, mid + 0.1, vm - 0.06, vm + 0.06);
  }
  // the keeper, inside at the window
}
STYLES.dutch.elements.am_shopfront = amShopfront;
export default amShopfront;
