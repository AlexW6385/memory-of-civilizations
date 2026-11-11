// The Royal Stables of Versailles (docs/settlements/versailles.md §1f): the Grande and Petite Écuries of Hardouin-Mansart
// (1679–82) facing the palace across the Place d'Armes on either side of the avenue de Paris — brick and stone ranges
// under slate round a court, a carriage gate under a pediment with galloping horses (Grande) or the coachman (Petite),
// stable doors in round-headed arches along the court, a riding school behind. Built on court_range (court.js).
//
// ecurie: { x, z (the plot's west edge and its middle), side: -1 (north, the Grande) | 1 (south, the Petite), y }

import { box, lathe } from '../../core/geom.js';
import { planarWall } from '../byzantine/index.js';
import { courtRange } from './court.js';

const ST = 'sandstone_dressed';
const LEN = 56, HALF = 24, H = 9.5, T = 10;

export function ecurie(el, ctx) {
  const { bag, col } = ctx, x = el.x, zc = el.z, y = el.y ?? 0, sd = el.side ?? 1;
  const R = (a, b, c, d) => [x + a, zc + Math.min(b, d), x + c, zc + Math.max(b, d)];
  const rg = (r, o) => courtRange({ rect: r, y, h: H, foot: y - 0.5, ...o }, ctx);
  // the front range along the Place, split by the carriage gate; the side ranges; the riding school's range at the back
  rg(R(0, -HALF, T, -2.5), { fronts: 'w', blind: 'nes' }); rg(R(0, 2.5, T, HALF), { fronts: 'w', blind: 'nes' });
  rg(R(T, -HALF, LEN, -HALF + T), { fronts: 'sn', blind: 'we' }); rg(R(T, HALF - T, LEN, HALF), { fronts: 'sn', blind: 'we' });
  rg(R(LEN - T, -HALF + T, LEN, HALF - T), { fronts: 'we', blind: 'sn' });
  // the gate: a block over a round arch, a pediment with its sculpture, a vault through
  const gz = zc, gx = x + T / 2;
  bag.add(ST, planarWall({ o: [gx, gz], u: [0, 1], th: T, u0: -2.5, u1: 2.5, y0: y - 0.5, y1: y + H, arches: [{ uc: 0, r: 2.1, spring: y + 3.4, sill: y }] }));
  col.rect([x, gz - 2.5, x + T, gz - 2.1], y - 0.5, y + H); col.rect([x, gz + 2.1, x + T, gz + 2.5], y - 0.5, y + H); col.rect([x, gz - 2.1, x + T, gz + 2.1], y + 5.5, y + H);
  bag.add(ST, box(x - 0.1, y + 7.0, gz - 3.2, x + 0.8, y + H + 0.6, gz + 3.2));
  for (let k = 0; k < 14; k++) { const w = 3.2 * (1 - k / 14); bag.add(ST, box(x - 0.1, y + H + 0.6 + k * 0.2, gz - w, x + 0.6, y + H + 0.8 + k * 0.2, gz + w)); }
  // the group in the tympanum: three horses galloping (the Grande), the coachman (the Petite)
  for (let k = -1; k <= 1; k++) { const g = lathe([[0.001, -0.8], [0.3, -0.6], [0.34, 0], [0.28, 0.5], [0.001, 0.7]], 8, null, 0, 0, 0); g.rotateZ(Math.PI / 2 - 0.4); g.rotateY(Math.PI / 2); g.translate(x + 0.4, y + H + 1.1, gz + k * 1.4); bag.add('stucco_cream', g); }
  bag.add(ST, box(x - 0.2, y - 0.5, gz - 2.9, x + 0.2, y + 3.2, gz - 2.5)); bag.add(ST, box(x - 0.2, y - 0.5, gz + 2.5, x + 0.2, y + 3.2, gz + 2.9));
  // the court: cobbles, stable doors in arches along the long ranges, mangers' hay, the riding school's gate of the back range
  const cr = [x + T, zc - HALF + T, x + LEN - T, zc + HALF - T];
  bag.add('flagstone', box(cr[0], y - 0.3, cr[1], cr[2], y + 0.04, cr[3])); col.floor(cr, y + 0.04);
  bag.add('flagstone', box(x, y - 0.3, gz - 2.1, x + T, y + 0.04, gz + 2.1)); col.floor([x, gz - 2.1, x + T, gz + 2.1], y + 0.04);
  bag.add('flagstone', box(x - 14, y - 0.3, zc - HALF, x, y + 0.04, zc + HALF)); col.floor([x - 14, zc - HALF, x, zc + HALF], y + 0.04);
  for (const [fz, dz] of [[zc - HALF + T, 1], [zc + HALF - T, -1]]) for (let u = x + T + 4; u < x + LEN - T - 3; u += 5.2) {
    const zf = fz;
    bag.add('wood_dark', box(u - 1.0, y + 0.04, zf - (dz > 0 ? 0.02 : -0.02) - 0.06 + (dz > 0 ? 0 : 0.06), u + 1.0, y + 3.2, zf + (dz > 0 ? 0.06 : 0) + (dz > 0 ? 0 : 0)));
    bag.add(ST, box(u - 1.2, y + 0.04, zf - (dz > 0 ? 0.0 : -0.0) - (dz > 0 ? 0 : 0.14), u - 1.0, y + 3.2, zf + (dz > 0 ? 0.14 : 0)));
    bag.add(ST, box(u + 1.0, y + 0.04, zf - (dz > 0 ? 0 : 0.14), u + 1.2, y + 3.2, zf + (dz > 0 ? 0.14 : 0)));
    bag.add(ST, box(u - 1.2, y + 3.2, zf - (dz > 0 ? 0 : 0.14), u + 1.2, y + 3.5, zf + (dz > 0 ? 0.14 : 0)));
    bag.add('thatch', box(u - 0.9, y + 0.04, zf + (dz > 0 ? 0.3 : -1.0), u + 0.9, y + 0.5, zf + (dz > 0 ? 1.0 : -0.3)));
  }
  // a stone trough along the court's middle, water in it; mounting blocks by the gate
  bag.add(ST, box(cr[0] + 6, y + 0.04, zc - 0.5, cr[2] - 8, y + 0.7, zc + 0.5)); col.rect([cr[0] + 6, zc - 0.5, cr[2] - 8, zc + 0.5], y, y + 0.7);
  void sd;
}
