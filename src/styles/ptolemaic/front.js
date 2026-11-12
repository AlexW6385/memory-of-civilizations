// The city's face to the harbour (docs/settlements/alexandria.md §12): the monumental gate at the harbour end of the street of the Soma
// (two battered towers of dressed stone with the cavetto cornice, a lintel with the winged disc, flagstaffs and pennants) and the long
// painted wall of the royal enclosure (pilasters, a band of relief, the cavetto cornice, a gateway) that stands behind the Museion's
// north colonnade. Both [inferred] in form from Ptolemaic temple gateways and Hellenistic palace walls. Registered into `ptolemaic`.

import { box, frustum, lathe, rod } from '../../core/geom.js';
import { rng, sack, amphora, awning, crate, lampBracket } from './dress.js';

function cavetto(bag, mat, [x0, z0, x1, z1], y, h = 0.7, out = 0.45) {
  for (let k = 0; k < 4; k++) { const f = k / 4, o = out * (1 - Math.cos(f * Math.PI / 2)); bag.add(mat, box(x0 - o - 0.02, y - h + f * h, z0 - o - 0.02, x1 + o + 0.02, y - h + (k + 1) / 4 * h, z1 + o + 0.02)); }
  bag.add(mat, box(x0 - 0.12, y - h - 0.35, z0 - 0.12, x1 + 0.12, y - h, z1 + 0.12));
}
/** harbour_gate: { c [x, z], y, face ('n' | 's'), gw (the passage, 12), tower (6), h (13) } — the passage open, the towers solid. */
function harbourGate(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 0, gw = el.gw ?? 12, tw = el.tower ?? 6, h = el.h ?? 13, td = 5;
  for (const s of [-1, 1]) {
    const u0 = s > 0 ? gw / 2 : -gw / 2 - tw, r = [cx + u0, cz - td / 2, cx + u0 + tw, cz + td / 2];
    bag.add('sandstone_dressed', frustum(r, y - 0.5, y + h, 0.5, 0.5, 0.5, 0.5)); col.rect(r, y - 0.5, y + h);
    cavetto(bag, 'sandstone', [r[0] + 0.5, r[1] + 0.5, r[2] - 0.5, r[3] - 0.5], y + h + 0.7, 0.7, 0.4);
    bag.add('egyptian_blue', box(r[0] + 0.3, y + h - 3.2, r[1] - 0.05, r[2] - 0.3, y + h - 2.4, r[1] + 0.05)); bag.add('egyptian_blue', box(r[0] + 0.3, y + h - 3.2, r[3] - 0.05, r[2] - 0.3, y + h - 2.4, r[3] + 0.05));
    for (const f of [0.28, 0.72]) {            // the flagstaff in its slot, the pennant out on the sea wind
      const px = r[0] + (r[2] - r[0]) * f, pz = r[1] + 0.05;
      bag.add('wood_dark', rod([px, y + 5, pz], [px, y + h + 9, pz], 0.1, 5));
      bag.add(f < 0.5 ? 'cloth_red' : 'cloth_white', box(px + 0.1, y + h + 6.5, pz - 0.03, px + 2.6, y + h + 8.8, pz + 0.03));
    }
    for (const dy of [3.0, 6.5]) bag.add('opening', box(r[0] + tw / 2 - 0.35, y + dy, r[1] - 0.04, r[0] + tw / 2 + 0.35, y + dy + 1.1, r[1] + 0.04));
  }
  const p = [cx - gw / 2 - 0.3, cz - td / 2 + 0.3, cx + gw / 2 + 0.3, cz + td / 2 - 0.3];
  bag.add('sandstone_dressed', box(p[0], y + 7.4, p[1], p[2], y + h, p[3]));
  cavetto(bag, 'sandstone', [p[0], p[1], p[2], p[3]], y + h + 0.7, 0.7, 0.4);
  for (const sd of [-1, 1]) {                                                         // the winged sun on the lintel, both faces
    const z = cz + sd * (td / 2 - 0.3 + 0.08), yy = y + 9.9;
    const d = lathe([[0.001, 0], [1.0, 0], [1.0, 0.12], [0.001, 0.12]], 14); d.rotateX(Math.PI / 2); d.translate(cx, yy, z); bag.add('gold', d);
    for (const w of [-1, 1]) for (let k = 0; k < 4; k++) bag.add(k % 2 ? 'egyptian_blue' : 'gold', box(cx + w * (1.2 + k * 0.1), yy - 0.15 - k * 0.2, z - 0.05, cx + w * (3.8 - k * 0.1 + 0.9), yy - 0.05 - k * 0.2, z + 0.05));
  }
  bag.add('egyptian_blue', box(p[0], y + 7.4, cz - td / 2 + 0.2, p[2], y + 8.0, cz - td / 2 + 0.4)); bag.add('egyptian_blue', box(p[0], y + 7.4, cz + td / 2 - 0.4, p[2], y + 8.0, cz + td / 2 - 0.2));
}
/**
 * wall_front: { x0, x1, z (the wall's outer face), face ('n': looking north over the quay), y, h, gate (x of a gateway or null) } — the
 * royal enclosure's long wall: a plinth, pilasters every 4.5 m, a band of painted relief, the cavetto cornice; a gateway with a lintel.
 */
function wallFront(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, h = el.h ?? 8, z = el.z, x0 = el.x0, x1 = el.x1, sd = el.face === 's' ? 1 : -1, t = 0.6;
  const zi = sd < 0 ? z : z - t, zo = sd < 0 ? z + t : z;
  bag.add('plaster_white', box(x0, y, zi, x1, y + h, zo)); col.rect([x0, zi, x1, zo], y, y + h);
  bag.add('limestone', box(x0 - 0.1, y, zi - (sd < 0 ? 0.35 : 0), x1 + 0.1, y + 0.9, zo + (sd > 0 ? 0.35 : 0)));
  const n = Math.max(1, Math.round((x1 - x0) / 4.5));
  for (let k = 0; k <= n; k++) { const x = x0 + 0.3 + k * (x1 - x0 - 0.6) / n; bag.add('limestone', box(x - 0.35, y + 0.9, sd < 0 ? zi - 0.25 : zo - 0.0, x + 0.35, y + h - 0.6, sd < 0 ? zi + 0.0 : zo + 0.25)); }
  bag.add('paint_ochre', box(x0, y + h - 3.1, sd < 0 ? zi - 0.06 : zo, x1, y + h - 1.9, sd < 0 ? zi : zo + 0.06));
  for (let k = 0; k < n; k++) { const xa = x0 + 0.3 + k * (x1 - x0 - 0.6) / n + 0.6, xb = xa + (x1 - x0 - 0.6) / n - 1.2; bag.add('wall_red', box(xa, y + 2.0, sd < 0 ? zi - 0.05 : zo, xb, y + h - 3.5, sd < 0 ? zi : zo + 0.05)); bag.add('egyptian_blue', box(xa + 0.3, y + 2.4, sd < 0 ? zi - 0.07 : zo, xb - 0.3, y + 2.6, sd < 0 ? zi : zo + 0.07)); }
  const zc = sd < 0 ? zi : zo;
  cavetto(bag, 'sandstone', [x0, zc - 0.25, x1, zc + 0.25], y + h + 0.6, 0.6, 0.35);
  if (el.gate != null) {
    const gx = el.gate, a = [gx - 2.6, gx + 2.6];
    bag.add('granite_grey', box(a[0] - 0.5, y, zi - (sd < 0 ? 0.5 : 0), a[0], y + h - 0.2, zo + (sd > 0 ? 0.5 : 0))); bag.add('granite_grey', box(a[1], y, zi - (sd < 0 ? 0.5 : 0), a[1] + 0.5, y + h - 0.2, zo + (sd > 0 ? 0.5 : 0)));
    bag.add('opening', box(a[0], y, zi + 0.0, a[1], y + 5.4, zo)); bag.add('cedar', box(a[0], y, zc - 0.05, a[1], y + 5.2, zc + 0.05));
    bag.add('granite_grey', box(a[0] - 0.7, y + 5.4, zi - 0.4, a[1] + 0.7, y + 6.2, zo + 0.4));
    cavetto(bag, 'sandstone', [a[0] - 0.7, zc - 0.4, a[1] + 0.7, zc + 0.4], y + 6.9, 0.7, 0.45);
  }
}
/**
 * customs_post: { at [x, z], y, seed } — the harbour's tax post on the promenade (the telonion): four posts under a striped awning, the
 * clerk's table with the ledger and a pair of scales, a tally board with its red marks, sacks and sealed jars waiting to be assessed, a stool,
 * a lamp on its bracket, the tariff stele beside it. 5 × 3.4 m, axis-aligned. [inferred: the Ptolemaic harbour dues, Wikipedia "Ptolemaic Kingdom"]
 */
function customsPost(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, rand = rng(el.seed ?? 5), x0 = x - 2.5, x1 = x + 2.5, z0 = z - 1.7, z1 = z + 1.7;
  for (const [px, pz] of [[x0 + 0.1, z0 + 0.1], [x1 - 0.1, z0 + 0.1], [x0 + 0.1, z1 - 0.1], [x1 - 0.1, z1 - 0.1]]) { bag.add('timber', box(px - 0.07, y, pz - 0.07, px + 0.07, y + 2.9, pz + 0.07)); col.circle(px, pz, 0.1, y, y + 2.9); }
  bag.add('timber', box(x0, y + 2.75, z0 + 0.05, x1, y + 2.9, z0 + 0.15)); bag.add('timber', box(x0, y + 2.75, z1 - 0.15, x1, y + 2.9, z1 - 0.05));
  awning(bag, [x0, z0 - 0.3, x - 0.01, z1 + 0.3], 'z0', y + 3.0, y + 2.7, 'cloth_red'); awning(bag, [x + 0.01, z0 - 0.3, x1, z1 + 0.3], 'z0', y + 3.0, y + 2.7, 'cloth_white');
  bag.add('wood_dark', box(x - 1.2, y + 0.72, z - 0.35, x + 1.2, y + 0.8, z + 0.35)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('wood_dark', box(x + sx * 1.1 - 0.04, y, z + sz * 0.28 - 0.04, x + sx * 1.1 + 0.04, y + 0.72, z + sz * 0.28 + 0.04));
  col.rect([x - 1.2, z - 0.35, x + 1.2, z + 0.35], y, y + 0.8);
  bag.add('ivory', box(x - 0.9, y + 0.8, z - 0.2, x - 0.3, y + 0.83, z + 0.2)); bag.add('linen', box(x - 0.85, y + 0.83, z - 0.15, x - 0.35, y + 0.85, z + 0.15));
  const bx = x + 0.6;                                                                    // the balance: a post, the beam, two pans on cords
  bag.add('bronze', rod([bx, y + 0.8, z], [bx, y + 1.35, z], 0.03, 5)); bag.add('bronze', rod([bx - 0.4, y + 1.35, z], [bx + 0.4, y + 1.35, z], 0.02, 5));
  for (const d of [-0.4, 0.4]) { bag.add('rope_fibre', rod([bx + d, y + 1.35, z], [bx + d, y + 0.95, z], 0.008, 3)); bag.add('bronze', lathe([[0.001, 0], [0.14, 0.03], [0.12, 0.06], [0.001, 0.04]], 8, null, bx + d, y + 0.9, z)); }
  bag.add('timber', box(x + 0.4, y, z + 0.9, x + 0.9, y + 0.42, z + 1.3)); col.circle(x + 0.65, z + 1.1, 0.3, y, y + 0.42);        // the stool
  bag.add('plaster_white', box(x1 - 0.55, y + 0.3, z0 - 0.02, x1 - 0.05, y + 1.9, z0 + 0.04)); bag.add('timber', box(x1 - 0.6, y, z0 - 0.04, x1 - 0.5, y + 2.0, z0 + 0.06));
  for (let k = 0; k < 6; k++) bag.add('cloth_red', box(x1 - 0.5, y + 0.45 + k * 0.22, z0 - 0.04, x1 - 0.1 - rand() * 0.15, y + 0.5 + k * 0.22, z0 - 0.02));
  for (let k = 0; k < 6; k++) sack(bag, x - 2.3 + (k % 3) * 0.5, y + Math.floor(k / 3) * 0.34, z1 - 0.55, rand() * 3, 'sacking');
  col.rect([x - 2.45, z1 - 0.85, x - 0.9, z1 - 0.25], y, y + 0.9);
  for (let k = 0; k < 4; k++) amphora(bag, x1 - 0.5 - k * 0.38, y, z1 - 0.5, { s: 1, seg: 6, mat: k % 2 ? 'terracotta' : 'stucco_siena' });
  crate(bag, col, x - 1.7, y, z0 + 0.5, 0.7, 0.5, 0.5);
  lampBracket(bag, x1 - 0.1, y + 2.4, z0 + 0.1, 0, -1);
  bag.add('limestone', box(x1 + 0.7, y, z - 0.3, x1 + 1.5, y + 0.3, z + 0.3)); bag.add('marble_smooth', box(x1 + 0.8, y + 0.3, z - 0.1, x1 + 1.4, y + 2.1, z + 0.1)); col.rect([x1 + 0.7, z - 0.3, x1 + 1.5, z + 0.3], y, y + 2.1);
}
/** quay_steps: { at [x, z] (the quay wall's water face), w, y (the paving), yw (the water) } — a flight of steps down the wall's face to the water: for boats' landings and the washers. */
function quaySteps(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, w = el.w ?? 3, y = el.y ?? 1.24, yw = el.yw ?? -2.5, n = 12, tread = 0.3, rise = (y - yw + 0.5) / n;
  for (let i = 0; i < n; i++) {
    const top = yw - 0.5 + rise * (i + 1), r = [x - w / 2, z - n * tread + i * tread, x + w / 2, z + 0.01];
    bag.add(i % 4 === 3 ? 'travertine' : 'limestone', box(r[0], yw - 2.2, r[1], r[2], top, r[3])); col.floor(r, top);
  }
  for (const sx of [-1, 1]) { bag.add('limestone', box(x + sx * (w / 2 + 0.2) - 0.2, yw - 2.2, z - n * tread, x + sx * (w / 2 + 0.2) + 0.2, y - 0.3, z)); }
  for (const sx of [-1, 1]) bag.add('granite_grey', lathe([[0.2, 0], [0.17, 0.4], [0.24, 0.46], [0.001, 0.48]], 8, null, x + sx * (w / 2 + 0.6), y, z + 1.4));
}
/** obelisk: { at [x, z], y, h (the shaft, 11) } — of red Aswan granite on a stepped plinth, the pyramidion gilded, Ptolemy II set one up at Alexandria (Pliny, NH 36.67). */
function obelisk(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 11, b0 = 0.8, b1 = 0.52;
  bag.add('limestone', box(x - 1.7, y, z - 1.7, x + 1.7, y + 0.5, z + 1.7)); bag.add('granite_grey', box(x - 1.3, y + 0.5, z - 1.3, x + 1.3, y + 1.3, z + 1.3)); col.rect([x - 1.7, z - 1.7, x + 1.7, z + 1.7], y, y + 1.3);
  bag.add('granite_red', frustum([x - b0, z - b0, x + b0, z + b0], y + 1.3, y + 1.3 + h, b0 - b1, b0 - b1, b0 - b1, b0 - b1));
  bag.add('gold', frustum([x - b1, z - b1, x + b1, z + b1], y + 1.3 + h, y + 1.3 + h + 1.0, b1, b1, b1, b1));
}
export const FRONT_EL = { obelisk, quay_steps: quaySteps, harbour_gate: harbourGate, wall_front: wallFront, customs_post: customsPost };
