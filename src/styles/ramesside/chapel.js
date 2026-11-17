// The chapel of the camp (docs/settlements/abu-simbel.md §16): the villages of the royal works kept small chapels of Hathor and the local gods among the
// houses, a mudbrick room with benches along its walls and a shrine with a stela at the back, before it a walled forecourt where the workmen set up their
// own stelae and left offerings. { rect: [x0, z0, x1, z1] (the chapel at the west end, the forecourt east of it, the gate on the east wall at the centre), seed }.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { figure } from '../egyptian/objects.js';
import { rng } from './util.js';

export function campChapel(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 71), zc = (z0 + z1) / 2, th = 0.5, H = 3.0, FH = 1.5;
  const seg = (p, q, t, mat, h = H) => { const T = []; beamTris(T, [p[0], 0, p[1]], [q[0], 0, q[1]], t / 2, h); bag.add(mat, fromTriangles(T)); col.segment(p, q, t, 0, h); };
  // ── the chapel: x0..xc, a door in the east wall, whitewashed, the walls of mudbrick
  const xc = x0 + 6.2, cz0 = zc - 4.4, cz1 = zc + 4.4, dw = 1.1;
  seg([x0 - th / 2, cz0], [xc + th / 2, cz0], th, 'plaster_white'); seg([x0 - th / 2, cz1], [xc + th / 2, cz1], th, 'plaster_white');
  seg([x0, cz0 + th / 2], [x0, cz1 - th / 2], th, 'plaster_white');
  seg([xc, cz0 + th / 2], [xc, zc - dw / 2], th, 'plaster_white'); seg([xc, zc + dw / 2], [xc, cz1 - th / 2], th, 'plaster_white');
  bag.add('timber', box(xc - th / 2 - 0.02, 2.2, zc - dw / 2 - 0.2, xc + th / 2 + 0.02, 2.4, zc + dw / 2 + 0.2)); bag.add('plaster_white', box(xc - th / 2 + 0.01, 2.39, zc - dw / 2 - 0.02, xc + th / 2 - 0.01, H - 0.01, zc + dw / 2 + 0.02));
  bag.add('limestone_core', box(xc - th / 2 - 0.1, 0, zc - dw / 2, xc + th / 2 + 0.1, 0.08, zc + dw / 2));
  // a dado of red ochre round the foot and the door framed in blue
  bag.add('limewash_red', box(x0 - th / 2 - 0.012, 0, cz0 - th / 2, x0 - th / 2 - 0.002, 0.45, cz1 + th / 2));
  for (const s of [-1, 1]) bag.add('egyptian_blue', box(xc + th / 2 + 0.002, 0, zc + s * (dw / 2 + 0.09) - 0.09, xc + th / 2 + 0.014, 2.3, zc + s * (dw / 2 + 0.09) + 0.09));
  bag.add('egyptian_blue', box(xc + th / 2 + 0.002, 2.3, zc - dw / 2 - 0.18, xc + th / 2 + 0.014, 2.48, zc + dw / 2 + 0.18));
  // the roof of logs under mud with its parapet
  const rx0 = x0 - th / 2 - 0.25, rx1 = xc + th / 2 + 0.25, rz0 = cz0 - th / 2 - 0.25, rz1 = cz1 + th / 2 + 0.25;
  bag.add('timber', box(rx0, H, rz0, rx1, H + 0.12, rz1)); bag.add('mud_plaster', box(rx0, H + 0.12, rz0, rx1, H + 0.3, rz1)); col.floor([rx0, rz0, rx1, rz1], H + 0.3);
  for (const [a, b, c2, d] of [[rx0, rz0, rx1, rz0 + 0.2], [rx0, rz1 - 0.2, rx1, rz1], [rx0, rz0 + 0.2, rx0 + 0.2, rz1 - 0.2], [rx1 - 0.2, rz0 + 0.2, rx1, rz1 - 0.2]]) bag.add('mud_plaster', box(a, H + 0.3, b, c2, H + 0.52, d));
  { const logs = []; for (let z = cz0 + th / 2 + 0.12; z < cz1 - th / 2; z += 0.26) beamTris(logs, [x0 + th / 2, H - 0.12, z], [xc - th / 2, H - 0.12, z], 0.1, 0.12); bag.add('palm_trunk', fromTriangles(logs)); }
  // inside: benches along the long walls, the shrine at the back with the stela and the offering table, lamps
  const ix0 = x0 + th / 2, ix1 = xc - th / 2, iz0 = cz0 + th / 2, iz1 = cz1 - th / 2;
  for (const [a, b] of [[iz0, iz0 + 0.6], [iz1 - 0.6, iz1]]) { bag.add('mud_plaster', box(ix0 + 1.9, 0, a, ix1 - 0.2, 0.45, b)); col.rect([ix0 + 1.9, a, ix1 - 0.2, b], 0, 0.45); bag.add('reed_mat', box(ix0 + 2.0, 0.451, a + 0.05, ix1 - 0.3, 0.465, b - 0.05)); }
  bag.add('mud_plaster', box(ix0, 0, zc - 1.1, ix0 + 1.1, 0.6, zc + 1.1)); col.rect([ix0, zc - 1.1, ix0 + 1.1, zc + 1.1], 0, 0.6);     // the dais of the shrine
  bag.add('limestone_core', box(ix0 + 0.02, 0.6, zc - 0.55, ix0 + 0.2, 2.0, zc + 0.55)); bag.add('limestone_core', box(ix0 + 0.02, 2.0, zc - 0.65, ix0 + 0.3, 2.12, zc + 0.65));   // the stela and its cornice
  { const place = (u, v, w) => [ix0 + 0.2 + w, v, zc + u];
    figure(bag, 'egyptian_blue', 'offer', place, -0.22, 1.05, 0.6, 1, 0.03); figure(bag, 'limewash_red', 'seated', place, 0.22, 1.05, 0.6, -1, 0.03);
    for (let k = 0; k < 4; k++) bag.add('egyptian_blue', box(ix0 + 0.2, 0.7 + k * 0.08, zc - 0.45, ix0 + 0.23, 0.74 + k * 0.08, zc + 0.45)); }
  { const tx = ix0 + 1.9, tz = zc;
    bag.add('granite_black', lathe([[0.22, 0], [0.22, 0.06], [0.12, 0.1], [0.1, 0.7], [0.32, 0.76], [0.34, 0.8], [0.001, 0.8]], 14, null, tx, 0, tz)); col.circle(tx, tz, 0.35, 0, 0.8);
    for (const [u, v] of [[-0.12, 0.05], [0.1, -0.1], [0.05, 0.14]]) bag.add('limewash_yellow', lathe([[0.001, 0], [0.09, 0.01], [0.085, 0.05], [0.04, 0.08], [0.001, 0.085]], 9, null, tx + u, 0.8, tz + v));
    for (const k of [-1, 1]) { const lx = ix0 + 1.3, lz = zc + k * 0.85; bag.add('bronze', lathe([[0.2, 0], [0.18, 0.04], [0.05, 0.12], [0.035, 0.3], [0.035, 1.0], [0.07, 1.04], [0.16, 1.12], [0.14, 1.14]], 12, null, lx, 0, lz)); col.circle(lx, lz, 0.2, 0, 1.2); lights.push({ at: [lx, 1.22, lz], color: '#ffb46b', intensity: 3, distance: 8 }); } }
  // ── the forecourt: a low wall on three sides, the gate on the east wall, stelae of the workmen on their pedestals, benches, a basin, a shade
  const fx0 = xc + th / 2 + 0.01, fz0 = cz0 - 0.2 - 0.5, fz1 = cz1 + 0.2 + 0.5;
  seg([fx0 - 0.0, fz0], [x1 + th / 2, fz0], th, 'mudbrick', FH); seg([fx0, fz1], [x1 + th / 2, fz1], th, 'mudbrick', FH);
  seg([x1, fz0 + th / 2], [x1, zc - 0.9], th, 'mudbrick', FH); seg([x1, zc + 0.9], [x1, fz1 - th / 2], th, 'mudbrick', FH);
  for (const [a, b, c2, d] of [[fx0, fz0 - th / 2, x1 + th / 2, fz0 + th / 2], [fx0, fz1 - th / 2, x1 + th / 2, fz1 + th / 2]]) { bag.add('limestone_core', box(a, FH, b - 0.04, c2, FH + 0.08, d + 0.04)); }
  for (const [a, b, c2, d] of [[x1 - th / 2 - 0.04, fz0 + th / 2, x1 + th / 2 + 0.04, zc - 0.9], [x1 - th / 2 - 0.04, zc + 0.9, x1 + th / 2 + 0.04, fz1 - th / 2]]) bag.add('limestone_core', box(a, FH, b, c2, FH + 0.08, d));
  for (const s of [-1, 1]) { const gz = zc + s * 1.0; bag.add('mudbrick', box(x1 - 0.35, 0, gz - 0.25 + (s > 0 ? 0 : 0), x1 + 0.35, 2.3, gz + 0.25)); col.rect([x1 - 0.35, gz - 0.25, x1 + 0.35, gz + 0.25], 0, 2.3); bag.add('limewash_red', box(x1 - 0.37, 2.3, zc - 1.35, x1 + 0.37, 2.42, zc + 1.35)); }
  // the stelae of the faithful: small limestone slabs on pedestals along both walls, some painted, one fallen against its pedestal
  const nSt = 7;
  for (const [zw, s] of [[fz0 + th / 2 + 0.55, 1], [fz1 - th / 2 - 0.55, -1]]) for (let k = 0; k < nSt; k++) {
    const x = fx0 + 1.2 + k * ((x1 - fx0 - 3.2) / (nSt - 1)), hh = 0.55 + rand() * 0.45, w = 0.32 + rand() * 0.14;
    bag.add('limestone_core', box(x - 0.3, 0, zw - 0.25, x + 0.3, 0.22, zw + 0.25));
    bag.add('limestone_core', box(x - w / 2, 0.22, zw - 0.06, x + w / 2, 0.22 + hh, zw + 0.06));
    bag.add('limestone_core', lathe([[w / 2, 0], [w / 2, 0.01], [0.001, 0.12]], 8, null, x, 0.22 + hh, zw).scale(1, 1, 0.12 / (w / 2) * 0.5));
    if (rand() < 0.7) bag.add(rand() < 0.5 ? 'egyptian_blue' : 'limewash_red', box(x - w / 2 + 0.05, 0.22 + hh * 0.35, zw + s * 0.062, x + w / 2 - 0.05, 0.22 + hh * 0.85, zw + s * 0.066));
    col.rect([x - 0.3, zw - 0.25, x + 0.3, zw + 0.25], 0, 0.22 + hh);
    if (rand() < 0.5) bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.17, 0.12], [0.1, 0.22], [0.001, 0.23]], 8, null, x + 0.5, 0, zw + s * 0.3));
  }
  // the basin for the washing, in the middle, and a bench either side of the gate
  { const bx = fx0 + (x1 - fx0) * 0.38, bz = zc; bag.add('limestone_core', lathe([[0.8, 0], [0.8, 0.45], [0.66, 0.45], [0.66, 0.1], [0.001, 0.1]], 16, null, bx, 0, bz)); bag.add('pottery_dark', lathe([[0.65, 0.36], [0.001, 0.36]], 16, null, bx, 0, bz)); col.circle(bx, bz, 0.8, 0, 0.45); }
  for (const s of [-1, 1]) { const bz = zc + s * 2.4; bag.add('mud_plaster', box(x1 - 2.6, 0, bz - 0.25, x1 - 0.8, 0.42, bz + 0.25)); col.rect([x1 - 2.6, bz - 0.25, x1 - 0.8, bz + 0.25], 0, 0.42); }
  // a tamarisk in the forecourt's corner for shade
  bag.add('palm_trunk', lathe([[0.09, 0], [0.07, 1.8], [0.001, 2.0]], 7, null, x1 - 1.4, 0, fz1 - 1.5)); bag.add('thatch', lathe([[1.5, 1.7], [1.3, 2.1], [0.6, 2.6], [0.001, 2.7]], 9, null, x1 - 1.4, 0, fz1 - 1.5)); col.circle(x1 - 1.4, fz1 - 1.5, 0.12, 0, 2.0);
}
