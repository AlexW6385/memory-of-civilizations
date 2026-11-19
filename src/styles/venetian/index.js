// Venetian architecture about 1500 (docs/settlements/venice.md §4): San Marco — a Greek cross under
// five domes on drums with tall lead-covered outer shells and lanterns, the west front of arches;
// the brick campanile with its belfry and green spire; the Doge's Palace — two storeys of white
// arcades carrying a wall of pink and white diamond-patterned stone; the long arcaded Procuratie;
// the two columns of the Piazzetta; canals, houses and bridges.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, rod } from '../../core/geom.js';
import '../qing/index.js';
import { dogesPalace } from './palace.js';
import { gondola, palo } from './boats.js';
import { pennone } from './masts.js';
import { clockTower, procuratieOld, columnStatue } from './piazza.js';
import { horse, limb } from '../greek/sculpture.js';
import { basilicaInterior, vestibule } from './interior.js';
import { rive, rialto } from './rive.js';
import { palazzo } from './palazzo.js';
import { ponte, pozzo, squero } from './ponte.js';
import { bellTower } from './campanile.js';
import { venFacade } from './facade.js';
import { westFront } from './front.js';
import { dome } from './domes.js';
import { flank } from './flank.js';
import { venRoom, venFront } from './rooms.js';
import { sculpt } from './works.js';
import { venHouse } from './house-up.js';
import { shopFit } from './shops.js';

const M = 'marble', B = 'brick', L = 'lead', I = 'limestone';
/** basilica: { c, s (arm length), w (arm width), h, y } — the Greek cross with its five domes, the west front. */
function basilica(el, { bag, col, lights }) {
  const [cx, cz] = el.c, S = el.s ?? 38, Wd = el.w ?? 22, H = el.h ?? 22, y = el.y ?? 0, IN = !!el.interior;
  if (!IN) for (const r of [[cx - S, cz - Wd / 2, cx + S, cz + Wd / 2], [cx - Wd / 2, cz - S * 0.8, cx + Wd / 2, cz + S * 0.8]]) { bag.add(B, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); col.floor(r, y + H); }
  else basilicaInterior(bag, col, lights, { cx, cz, y, S, Wd, H, DX: S * 0.62, DZ: S * 0.55 });
  // the narthex and the west front of five great arches with their gables
  const f = [cx - S - 10, cz - S * 0.85, cx - S, cz + S * 0.85];
  if (!IN) { bag.add(M, box(f[0], y - 0.5, f[1], f[2], y + H * 0.7, f[3])); col.rect(f, y, y + H * 0.7); }
  // the west front: five portals, two tiers of columns, the gold lunettes, the terrace with the horses, the upper register with its gables (front.js)
  const fz = (f[1] + f[3]) / 2, PWf = (f[3] - f[1]) / 5;
  if (IN) { vestibule(bag, col, f, fz, y, y + H * 0.7, 2.0, 4.8); }
  westFront(bag, col, { fx: f[0], z0: f[1], z1: f[3], y, H, noHorses: !!el.noHorses });
  // the sides dressed: the nave's long walls, the transepts' sides and ends, the east wall, the narthex's flanks (flank.js)
  if (IN) {
    const X = (u) => cx + u, Z = (w) => cz + w, h2 = Wd / 2, zt = S * 0.8, line = (a, b) => [a, b];
    for (const s of [-1, 1]) {
      const fN = s < 0 ? 'n' : 's';
      for (const [u0, u1] of [[-S, -h2], [h2, S]]) flank(bag, { f: fN, rect: [X(u0), Z(s * h2), X(u1), Z(s * h2)], y, H, seed: 0 });
      flank(bag, { f: fN, rect: [X(-h2), Z(s * zt), X(h2), Z(s * zt)], y, H, gable: true, seed: 1 });
      for (const t of [-1, 1]) flank(bag, { f: t < 0 ? 'w' : 'e', rect: [X(t * h2), Z(Math.min(s * h2, s * zt)), X(t * h2), Z(Math.max(s * h2, s * zt))], y, H, seed: 1 });
      flank(bag, { f: 'e', rect: [X(S), Z(Math.min(s * 6.5, s * h2)), X(S), Z(Math.max(s * 6.5, s * h2))], y, H, seed: 0 });
      flank(bag, { f: fN, rect: [f[0], s < 0 ? f[1] : f[3], f[2], s < 0 ? f[1] : f[3]], y, H: H * 0.7, seed: 2 });
    }
  }
  // the five domes: ribbed lead shells on windowed drums, the lanterns and crosses (domes.js)
  for (const [dx, dz, r] of [[0, 0, 7.5], [-S * 0.62, 0, 6.5], [S * 0.62, 0, 6.5], [0, -S * 0.55, 6.5], [0, S * 0.55, 6.5]]) dome(bag, { x: cx + dx, y: y + H, z: cz + dz, r });
}
registerStyle('venetian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, basilica, bell_tower: bellTower, doges_palace: dogesPalace, procuratie: procuratieOld, clock_tower: clockTower, column_statue: columnStatue, gondola, palo, pennone, rive, rialto, palazzo, ponte, pozzo, squero, ven_room: venRoom, ven_front: venFront, ven_facade: venFacade, sculpt, ven_house: venHouse, ven_shopfit: shopFit },
  objects: {},
});
