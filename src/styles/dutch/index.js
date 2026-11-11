// The Dutch Golden Age (17th c.; docs/settlements/amsterdam.md §4): narrow, tall canal houses of dark
// brick with white-trimmed windows and gables — stepped, neck and bell — and hoisting beams; the
// Town Hall on the Dam, classical in pale stone with its cupola; the Westerkerk's tower in stacked
// stages; brick bridges over the canals; ships.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';
import { canalHouse } from './house.js';
import { townHall, dutchChurch, westerTower } from './landmarks.js';
import { quayWall, canalBridge } from './canal.js';
import { waag, damPaving, fishBench, sledge } from './dam.js';
import { praam, ship } from './boats.js';
import { vocWarehouse } from './warehouse.js';

const B = 'brick', W = 'plaster_white';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** stacked_tower: a church tower in stacked stages { c, s, h, y } — brick base, stone stages narrowing, the crown. */
function stackedTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 9, h = el.h ?? 85, y = el.y ?? 0;
  bag.add(B, box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + h * 0.45, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h * 0.6);
  let yy = y + h * 0.45;
  for (const [r, hh] of [[s * 0.42, h * 0.14], [s * 0.36, h * 0.12], [s * 0.3, h * 0.1]]) { bag.add('sandstone_dressed', lathe([[r, 0], [r, hh], [r * 1.12, hh + 0.4]], 8, null, x, yy, z)); yy += hh + 0.4; }
  bag.add('lead', lathe([[s * 0.32, 0], [s * 0.2, h * 0.06], [0.4, h * 0.12], [0.001, h * 0.16]], 8, null, x, yy, z));
}
registerStyle('dutch', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, canal_house: canalHouse, town_hall: townHall, dutch_church: dutchChurch, wester_tower: westerTower, quay_wall: quayWall, canal_bridge: canalBridge, stacked_tower: stackedTower, ship, waag, dam_paving: damPaving, fish_bench: fishBench, sledge, praam, voc_warehouse: vocWarehouse },
  objects: {},
});
