// Round the pyramid (docs/settlements/giza.md §6): the cemeteries of mastabas west and east, the
// valley temple and the harbour with the king's ship, the boat pits, the Wall of the Crow and the
// workers' town south of it.

import { RADIUS, PYRAMID, VALLEY, TOWN_Y, VALLEY_TEMPLE, HARBOUR, CROW_WALL, BOAT_PITS, SHIP, mastabas, town as townLots } from './layout.js';
import { ground } from './ground.js';

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
  for (const l of townLots()) if (l.kind === 'bakery') {
    const [x0, z0, x1, z1] = l.rect, mx = (x0 + x1) / 2;
    if (rand() < 0.7) { const at = [x0 + 1.2 + rand() * (x1 - x0 - 2.4), z1 - 2.3]; fig(T, at, face(at, [at[0], at[1] + 1]), { dress: 'tunic', hair: 'short', pose: 'squat' }); }
    // a brewer kneeling at a vat, working the mash (§5c)
    if (rand() < 0.6) { const vx = rand() < 0.5 ? mx + 0.9 : x1 - 0.25 - 0.8; fig(T, [vx, z0 + 0.25 + 1.95], 0, { dress: 'wrap', top: 'bare', hair: 'short', pose: 'kneel' }); }
  }
  // the women grinding grain at the querns in the courts of the furnished houses
  for (const l of townLots()) if (l.kind === 'house' && l.seed % 3 === 0 && rand() < 0.35) {
    const [x0, z0, x1, z1] = l.rect, r2 = rng(l.seed || 1); r2(); const court = r2() < 0.7, split = court ? x0 + (x1 - x0) * (0.45 + r2() * 0.2) : x1;
    const qz = Math.min(z1 - 1.6, z0 + 0.225 + 1.9), qx = split + 0.225 + 0.45;
    if (court && qz > z0 + 0.225 + 0.65 + 0.9) fig(T, [qx, qz - 0.75], Math.PI, { dress: 'sheath', hair: 'long', pose: 'kneel', h: 1.52 });
  }
  return { C, T };
}

/** The harbour (docs/settlements/giza.md §5c): stone barges at the quay, papyrus skiffs, a block on its sledge hauled off
 *  the landing by a gang on the rope with its overseer, porters; cattle brought in for the town, with their herder. */
function harbourLife() {
  const rand = rng(2562), L = [], W = -1.2;
  const man = (at, y, rot, o) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  for (const [x, z, kind, len] of [[354.5, 24, 'barge', 12], [354.5, 90, 'barge', 11], [376, 26, 'reed', 6], [388, 84, 'reed', 5.5], [382, 90, 'reed', 6]]) L.push({ t: 'boat', kind, len, at: [x, z], y: W, rot: kind === 'reed' ? 0.3 : 0, seed: Math.round(x * 3 + z) });
  // the gang hauling the block west off the landing, two by two on the rope, the overseer with his staff
  for (let k = 0; k < 4; k++) for (const dz of [-0.45, 0.45]) man([343.8 - k * 1.25, 52 + dz + (k % 2) * 0.1], 0, Math.PI / 2, { pose: 'pull', carry: 'rope', len: 1.4 });
  man([345, 54.6], 0, Math.PI * 0.7, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7 });
  man([348.2, 31.6], 0, Math.PI, { pose: 'talk' }); man([346.6, 40], 0.02, -0.2, { carry: 'basket' }); man([347.2, 63], 0.02, 3.0, { carry: 'pot' });
  return L;
}
function cattle() {
  const rand = rng(2563), L = [];
  for (let k = 0; k < 7; k++) { const x = 262 + rand() * 18, z = 196 + rand() * 16; L.push({ t: 'animal', kind: 'ox', at: [x, z], y: ground.height(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), mat: ['hide_white', 'hide_brown', 'hide_black', 'hide_tan'][k % 4] }); }
  L.push({ t: 'figure', at: [258, 206], y: ground.height(258, 206), rot: -Math.PI / 2, seed: 77, dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'staff', pose: 'staff', len: 1.6 });
  return L;
}

const base = (id, elements, y = 0) => ({ id, style: 'oldkingdom', origin: [0, 0], base: y, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [200, -40], facing: 'w' } });

export async function town() {
  const plans = [];
  // the Great Pyramid's passages and chambers, open for the burial (docs/settlements/giza.md §4.6)
  plans.push(base('giza-pyramid-interior', [{ t: 'ok_pyramid_interior', c: PYRAMID.c, a: PYRAMID.a, h: PYRAMID.h }]));
  plans.push(base('giza-cemeteries', mastabas().map((m) => ({ t: 'mastaba', ...m }))));
  const P = people();
  plans.push({ ...base('giza-people', P.C), style: 'life' }, { ...base('giza-bakers', P.T, TOWN_Y), style: 'life' });
  plans.push(base('giza-valley', [
    { t: 'ok_temple', rect: VALLEY_TEMPLE.map((v, i) => v), h: 8, court: [318, 40, 340, 64], pillars: 5, door: 'e', backDoor: true },
    { t: 'water_rect', rect: [HARBOUR[0] - 1, HARBOUR[1] - 1, HARBOUR[2], HARBOUR[3] + 1], y: -1.2 },
    { t: 'block', walk: true, rect: [HARBOUR[0] - 2, 46, HARBOUR[0] + 10, 58], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    // the quay along the temple's front, from the valley floor on either side to the landing
    { t: 'block', walk: true, rect: [HARBOUR[0] - 1, HARBOUR[1] - 1, HARBOUR[0] + 5, 46], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    { t: 'block', walk: true, rect: [HARBOUR[0] - 1, 58, HARBOUR[0] + 5, HARBOUR[3] + 1], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    { t: 'royal_ship', at: SHIP.at, y: -1.2, len: SHIP.len, ang: SHIP.ang },
  ], VALLEY));
  plans.push({ ...base('giza-harbour-life', harbourLife(), VALLEY), style: 'life' }, { ...base('giza-cattle', cattle()), style: 'life' });
  plans.push(base('giza-hauling', [{ t: 'stone_sledge', at: [350, 52], y: 0.02, rot: Math.PI, w: 1.15, len: 1.7 }, { t: 'stone_sledge', at: [349.5, 30], y: 0.02, rot: Math.PI / 2, w: 1.0, len: 1.5 }], VALLEY));
  plans.push(base('giza-boat-pits', BOAT_PITS.map((p) => ({ t: 'boat_pit', ...p }))));
  plans.push(base('giza-wall', [{ t: 'crow_wall', ...CROW_WALL }], -2.5));
  const lots = townLots();
  for (let i = 0; i < lots.length; i += 80) plans.push(base(`giza-town-${i / 80}`, lots.slice(i, i + 80).map((l) => (l.kind === 'gallery' ? { t: 'gallery_hall', rect: l.rect } : l.kind === 'bakery' ? { t: 'bakery', rect: l.rect, seed: l.seed } : { t: 'mud_house', rect: l.rect, seed: l.seed, furnish: l.seed % 3 === 0 })), TOWN_Y));
  return plans;
}
