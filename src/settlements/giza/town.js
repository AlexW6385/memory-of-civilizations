// Round the pyramid (docs/settlements/giza.md §6): the cemeteries of mastabas west and east, the
// valley temple and the harbour with the king's ship, the boat pits, the Wall of the Crow and the
// workers' town south of it.

import { RADIUS, VALLEY, TOWN_Y, VALLEY_TEMPLE, HARBOUR, CROW_WALL, BOAT_PITS, SHIP, mastabas, town as townLots } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
/** The funerary priests at the chapels' doors, the offering bearers bringing bread and beer along the cemetery streets
 *  (docs/settlements/giza.md §4.4); the bakers at the hearths of the workers' town (§5). */
function people() {
  const rand = rng(2561), C = [], T = [];
  const fig = (L, at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hairMat: 'hair_dark', ...o });
  for (const m of mastabas()) {
    const dx = m.c[0] + m.a + 2.9, dz = m.c[1] + m.b - 2.6, r = rand();
    if (r < 0.22) fig(C, [dx + 0.9, dz + (rand() - 0.5) * 0.4], face([dx + 0.9, dz], [dx - 1, dz]), { dress: 'wrap', hair: 'shaven', over: 'sash', pose: 'stand' });
    else if (r < 0.4) {
      const z = m.c[1] + (rand() - 0.5) * m.b * 1.6, x = dx + 1.4 + rand() * 1.2, n = rand() < 0.5 ? -1 : 1, woman = rand() < 0.6;
      fig(C, [x, z], face([x, z], [x, z + n]), woman ? { dress: 'robe', hair: 'long', over: 'none', carry: 'basket' } : { dress: 'wrap', hair: 'short', over: 'none', carry: rand() < 0.5 ? 'basket' : 'pot' });
    }
  }
  for (const l of townLots()) if (l.kind === 'bakery' && rand() < 0.7) {
    const [x0, , x1, z1] = l.rect, at = [x0 + 1.2 + rand() * (x1 - x0 - 2.4), z1 - 2.3];
    fig(T, at, face(at, [at[0], at[1] + 1]), { dress: 'tunic', hair: 'short', pose: 'squat' });
  }
  return { C, T };
}

const base = (id, elements, y = 0) => ({ id, style: 'oldkingdom', origin: [0, 0], base: y, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [200, -40], facing: 'w' } });

export async function town() {
  const plans = [];
  plans.push(base('giza-cemeteries', mastabas().map((m) => ({ t: 'mastaba', ...m }))));
  const P = people();
  plans.push({ ...base('giza-people', P.C), style: 'life' }, { ...base('giza-bakers', P.T, TOWN_Y), style: 'life' });
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
