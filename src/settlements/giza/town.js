// Round the pyramid (docs/settlements/giza.md §6): the cemeteries of mastabas west and east, the
// valley temple and the harbour with the king's ship, the boat pits, the Wall of the Crow and the
// workers' town south of it.

import { RADIUS, VALLEY, TOWN_Y, VALLEY_TEMPLE, HARBOUR, CROW_WALL, BOAT_PITS, SHIP, mastabas, town as townLots } from './layout.js';

const base = (id, elements, y = 0) => ({ id, style: 'oldkingdom', origin: [0, 0], base: y, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [200, -40], facing: 'w' } });

export async function town() {
  const plans = [];
  plans.push(base('giza-cemeteries', mastabas().map((m) => ({ t: 'mastaba', ...m }))));
  plans.push(base('giza-valley', [
    { t: 'ok_temple', rect: VALLEY_TEMPLE.map((v, i) => v), h: 8, court: [318, 40, 340, 64], pillars: 5, door: 'e', backDoor: true },
    { t: 'water_rect', rect: [HARBOUR[0] + 1, HARBOUR[1] + 1, HARBOUR[2], HARBOUR[3] - 1], y: -1.2 },
    { t: 'block', walk: true, rect: [HARBOUR[0] - 2, 46, HARBOUR[0] + 10, 58], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    // the quay along the temple's front, from the valley floor on either side to the landing
    { t: 'block', walk: true, rect: [HARBOUR[0] - 1, HARBOUR[1] - 1, HARBOUR[0] + 5, 46], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    { t: 'block', walk: true, rect: [HARBOUR[0] - 1, 58, HARBOUR[0] + 5, HARBOUR[3] + 1], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    { t: 'royal_ship', at: SHIP.at, y: -1.2, len: SHIP.len, ang: SHIP.ang },
  ], VALLEY));
  plans.push(base('giza-boat-pits', BOAT_PITS.map((p) => ({ t: 'boat_pit', ...p }))));
  plans.push(base('giza-wall', [{ t: 'crow_wall', ...CROW_WALL }], -2.5));
  const lots = townLots();
  for (let i = 0; i < lots.length; i += 80) plans.push(base(`giza-town-${i / 80}`, lots.slice(i, i + 80).map((l) => (l.kind === 'gallery' ? { t: 'gallery_hall', rect: l.rect } : l.kind === 'bakery' ? { t: 'bakery', rect: l.rect, seed: l.seed } : { t: 'mud_house', rect: l.rect, seed: l.seed })), TOWN_Y));
  return plans;
}
