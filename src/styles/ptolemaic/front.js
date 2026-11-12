// The city's face to the harbour (docs/settlements/alexandria.md §12): the monumental gate at the harbour end of the street of the Soma
// (two battered towers of dressed stone with the cavetto cornice, a lintel with the winged disc, flagstaffs and pennants) and the long
// painted wall of the royal enclosure (pilasters, a band of relief, the cavetto cornice, a gateway) that stands behind the Museion's
// north colonnade. Both [inferred] in form from Ptolemaic temple gateways and Hellenistic palace walls. Registered into `ptolemaic`.

import { box, frustum, lathe, rod } from '../../core/geom.js';

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
export const FRONT_EL = { harbour_gate: harbourGate, wall_front: wallFront };
