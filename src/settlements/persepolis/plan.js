// The terrace of Persepolis about 480 BC (docs/settlements/persepolis.md §2–§4): the platform and
// its parapet, the double-return stair, the Gate of All Nations with its winged bulls, the Apadana
// on its plinth (36 columns of 20 m and three porticoes, corner towers), the Hall of a Hundred
// Columns, the Tachara and the Hadish, the Treasury, the mudbrick wall along the mountain.

import { TERRACE, STAIR, COURT, mountain } from './layout.js';
import { people } from './people.js';
import { walkRoutes } from './walkroutes.js';

// the ways visitors walk on the terrace: the royal way from the stair's head to the Apadana's west stair, and the file from the
// Gate of All Nations along the Apadana's north stair (the carved figures there are modelled in full within 12 m of them)
const WALK = [[[-148, -60], [-80, -60]], [[-112, -132], [-91, -123], [-60, -123], [-44, -123]]];
const E = [], T = TERRACE.h, [tx0, tz0, tx1, tz1] = TERRACE.rect;
// the terrace and its parapet (open where the stair arrives)
// (and along the east edge, where the fortification wall stands on it)
E.push({ t: 'terrace', rect: TERRACE.rect, y0: -1, y1: T, gaps: [[tx0 - 2, STAIR.z - 12, tx0 + 2, STAIR.z + 12], [tx1 - 2, tz0 - 1, tx1 + 2, tz1 + 1]] });
// the double-return stair: two flights up the face either way from a landing, then turning back to the top
{
  const x0 = tx0 - 2 * STAIR.w - 2, z = STAIR.z, w = STAIR.w, half = T / 2, run = 46;
  for (const s of [-1, 1]) {
    const zA = z + s * 4, zB = zA + s * run;                                   // lower flight runs outward from the middle
    E.push({ t: 'stair', rect: [x0, Math.min(zA, zB), x0 + w, Math.max(zA, zB)], dir: s < 0 ? 'n' : 's', y0: 0, y1: half, riser: 0.1, base: 0, mat: 'limestone_persian' });
    const zl = zB + s * 8;
    E.push({ t: 'block', walk: true, rect: [x0, Math.min(zB, zl), tx0, Math.max(zB, zl)], y0: 0, y1: half, mat: 'limestone_persian' });
    E.push({ t: 'stair', rect: [x0 + w + 1, Math.min(zA, zB), tx0, Math.max(zA, zB)], dir: s < 0 ? 's' : 'n', y0: half, y1: T, riser: 0.1, base: half, mat: 'limestone_persian' });
    E.push({ t: 'block', rect: [x0 + w, Math.min(zA, zB), x0 + w + 1, Math.max(zA, zB)], y0: 0, y1: half + 1, mat: 'limestone_persian' });
  }
  E.push({ t: 'block', rect: [x0 + w, z - 4, tx0, z + 4], y0: 0, y1: T, mat: 'limestone_persian', walk: true });
}
// the paving of the court between the stair and the Apadana: slabs, and the stone drains that carried the rain off the terrace
E.push({ t: 'terrace_paving', rect: [-148, -140, -86, -20], y: T, drains: [[-148, -81.4, -86, -81.2], [-114, -140, -113.8, -20]] });
// the wear of the paving, the incense stands at the head of the royal way, the awnings over the scribes and over the grooms' horses
E.push({ t: 'court_wear', rect: [-148, -140, -86, -20], y: T, way: [-64.5, -55.5], seed: 480, dust: [[-145, -138, 6, 4], [-145, -142, 5, 5], [-88, -60, 3, 18], [-122, -122, 14, 3], [-108, -27, 16, 3]] });
for (const [x, z] of COURT.stands) E.push({ t: 'incense_stand', at: [x, z], y: T });
E.push({ t: 'parasol', at: [-110.3, -69.5], y: T, cloth: 'cloth_red' }, { t: 'parasol', at: [-110.1, -49.7], y: T, cloth: 'cloth_indigo' });
E.push({ t: 'court_awning', rect: [-104.5, -38, -95, -29.5], y: T, h: 2.9, cloth: 'cloth_white', trim: 'cloth_red' });
E.push({ t: 'court_awning', rect: [-119, -99, -98, -93.5], y: T, h: 2.9, cloth: 'cloth_ochre', trim: 'cloth_indigo' });
// the scribes of the court seated at their mats by the stair, tablets drying beside them (the Aramaic scribes: leather scrolls)
for (const [x, z, rot, scroll] of [[-100.5, -34.5, -Math.PI / 2, false], [-100.5, -32.5, -Math.PI / 2, true], [-107, -104, Math.PI / 2, true]]) E.push({ t: 'scribe_kit', at: [x, z], y: T, rot, scroll });
// the two bronze braziers either side of the royal way (the guards' night fires), lit: the court's light by night (docs/settlements/persepolis.md §23.2)
E.push({ t: 'furnish', y: T, items: [['brazier', -118, -67.2, 0, { light: true }], ['brazier', -118, -52.8, 0, { light: true }]] });
// the Gate of All Nations
E.push({ t: 'lamassu_gate', c: [-112, STAIR.z], s: 25, h: 17, y: T });
// the Apadana on its 2.6 m plinth: 6 × 6 columns in the hall, porticoes north, west and east
E.push({ t: 'hall', rect: [-60, -90, 0, -30], y: T, plinth: 2.6, h: 20, grid: [6, 6], porticoes: 'nwe', portDepth: 17, walls: 5, towers: 20, doors: 'nwe', dress: true,
  stairs: [{ face: 'w', W: 26, flight: 9, D: 6, wings: ['nobles', 'nobles'], c: -60, walk: WALK }] });   // the west porch's stair (the visitor's side) [inferred]
// (what stands inside the great rooms is built in near plans, `roomPlans()`: a visitor sees it only from within reach)
const R = { apadana: [], hundred: [], tachara: [], hadish: [] };
R.apadana.push({ t: 'audience', c: [-30, -40], y: T + 2.75, dir: [0, -1], aisle: 44 });
// the throne in the Hundred-Column Hall, at the south end of its middle aisle between two rows of columns (the aisle's 4.7 m, the dais 4.6 m)
const HY = T + 0.95;
R.hundred.push({ t: 'audience', c: [75, -67], y: HY, dir: [0, -1], aisle: 56, half: 2.3, depth: 2.2, burners: false });
for (const x of [73.1, 76.9]) R.hundred.push({ t: 'incense_stand', at: [x, -73.2], y: HY });
// lamp stands along the aisle, each beside a column's plinth
const HS = [];
for (const z of [-119.5, -105.5, -91.5]) for (const x of [72.95, 77.05]) HS.push(['stand', x, z, 0, { light: z === -91.5 }]);
R.hundred.push({ t: 'furnish', y: HY, items: HS });
// the Tachara's and the Hadish's rooms: couches facing across a low table on carpets, chests and lamps along the walls, braziers
const banquet = (x, z, _y, wide = 4.6) => [['carpet', x, z, 0, { l: wide, w: 3.4 }], ['couch', x - 1.1, z, Math.PI / 2, {}], ['couch', x + 1.15, z, -Math.PI / 2, { cloth: 'cloth_indigo', cloth2: 'cloth_red' }], ['table', x, z, Math.PI / 2, {}], ['stool', x - 1.1, z - 1.6, 0, {}], ['stool', x + 1.15, z + 1.6, 0, {}]];
R.tachara.push({ t: 'furnish', y: T + 3.15, items: [
  ...banquet(-58.5, 17.3), ...banquet(-49.5, 17.3),
  ['carpet', -54, 20, Math.PI / 2, { l: 13.2, w: 1.4, border: 'cloth_red', field: 'cloth_indigo' }],
  ['chest', -61.5, 22.4, Math.PI / 2], ['chest', -61.5, 23.8, Math.PI / 2, { l: 0.9 }], ['chest', -46.5, 22.4, Math.PI / 2], ['chest', -46.5, 23.8, Math.PI / 2, { l: 0.9 }],
  ['stand', -60.5, 21.6, 0, {}], ['stand', -47.5, 21.6, 0, {}], ['brazier', -58.5, 22.7, 0, { light: true }], ['brazier', -49.5, 22.7, 0, { light: true }],
] });
R.hadish.push({ t: 'furnish', y: T + 3.65, items: [
  ...[[-20, 81.67], [0, 81.67], [-20, 108.33], [0, 108.33]].flatMap(([x, z]) => banquet(x, z, 0, 5.6)),
  ['carpet', -10, 95, Math.PI / 2, { l: 39, w: 2, border: 'cloth_red', field: 'cloth_indigo' }],
  ['carpet', -20.5, 95, 0, { l: 18, w: 2, border: 'cloth_red', field: 'cloth_indigo' }], ['carpet', 0.5, 95, 0, { l: 18, w: 2, border: 'cloth_red', field: 'cloth_indigo' }],
  ['brazier', -12.1, 92.9, 0, { light: true }], ['brazier', -7.9, 92.9, 0], ['brazier', -12.1, 97.1, 0], ['brazier', -7.9, 97.1, 0, { light: true }],
  ['chest', -29.4, 88.3, Math.PI / 2, { l: 1.2 }], ['chest', -29.4, 101.7, Math.PI / 2, { l: 1.2 }], ['chest', 9.4, 88.3, Math.PI / 2, { l: 1.2 }], ['chest', 9.4, 101.7, Math.PI / 2, { l: 1.2 }],
  ['stand', -28.4, 91.2, 0, {}], ['stand', -28.4, 98.8, 0, {}], ['stand', 8.4, 91.2, 0, {}], ['stand', 8.4, 98.8, 0, {}],
] });
// its two stairways, north and east, with their reliefs: the nobles on the north, the delegations on the east stair's south wing
E.push({ t: 'apadana_stair', face: 'n', line: -110, span: [-67, 7], c: -30, W: 32, D: 7.5, y: T, h: 2.6, wings: ['nobles', 'nobles'], walk: WALK });
E.push({ t: 'apadana_stair', face: 'e', line: 20, span: [-97, -40], c: -68.5, W: 32, D: 7.5, y: T, h: 2.6, wings: ['nobles', 'tribute'], walk: WALK });
// the Hall of a Hundred Columns, 70 × 70 m, 10 × 10 columns, a portico north
// (its platform 0.8 m high, a flight of 10 cm steps before the portico and before each other door)
E.push({ t: 'hall', rect: [40, -130, 110, -60], y: T, plinth: 0.8, h: 13, grid: [10, 10], porticoes: 'n', portDepth: 14, walls: 3.5, doors: 'nesw', reliefs: true, bulls: true,
  interior: true, hangings: true, niches: 'esw', windows: { n: 6, e: 6, s: 6, w: 6 }, windowW: 1.5, windowH: 2.4, sill: 1.1,
  stairs: [{ face: 'n', kind: 'flight', W: 24 }, { face: 's', kind: 'flight', W: 8 }, { face: 'e', kind: 'flight', W: 8 }, { face: 'w', kind: 'flight', W: 8 }] });
// the Tripylon, the Tachara (palace of Darius), the Hadish (palace of Xerxes)
E.push({ t: 'hall', rect: [5, -12, 25, 12], y: T, plinth: 1.2, h: 9, grid: [2, 2], walls: 2.5, doors: 'nesw', reliefs: true, scenes: { n: 'king', s: 'king', e: 'audience' }, stairs: [{ face: 'w', kind: 'flight', W: 5 }, { face: 's', kind: 'flight', W: 5 }] });
// the Tachara on its own platform: the hall of 3 × 4 columns about 15.5 m square, the portico of eight on the south;
// walls 1.7 m thick, every window a single stone frame 2.65 m high through them; the king leaving the palace with his
// parasol- and towel-bearers on the main doorways' jambs, the king and the lion on the side doors; the double stair
// up to the portico from the south court, servants carrying up food and kids on it, the inscription at its middle
E.push({ t: 'hall', rect: [-62, 12, -46, 28], y: T, plinth: 3, margin: 6, h: 8.5, grid: [4, 3], porticoes: 's', portDepth: 8, walls: 1.7, doors: 'nesw',
  reliefs: true, interior: true, scenes: { n: 'king', s: 'king' }, windows: { n: 2, s: 2, e: 2, w: 2 },
  stairs: [{ face: 's', W: 22, flight: 8, D: 6, wings: ['servants', 'servants'], climbers: 'bearer', centre: 'inscription' }] });
// the Hadish on its higher platform: 36 columns, the portico of twelve on the north, windows all round (servants
// with vessels and goats on their inner faces), the king and his attendants on the jambs; two double stairs, up from
// the courts west and east
E.push({ t: 'hall', rect: [-30, 75, 10, 115], y: T, plinth: 3.5, h: 8, grid: [6, 6], porticoes: 'n', portDepth: 9, walls: 3, doors: 'nesw',
  reliefs: true, interior: true, scenes: { n: 'king', s: 'king' }, windows: { n: 4, s: 4, e: 4, w: 4 }, windowReliefs: true,
  stairs: [{ face: 'w', W: 28, flight: 10, wings: ['servants', 'servants'], climbers: 'bearer' }, { face: 'e', W: 28, flight: 10, wings: ['servants', 'servants'], climbers: 'bearer' }] });
// the Treasury: its two great halls of wooden columns, the court with the audience reliefs, the storerooms
E.push({ t: 'treasury', rect: [50, 60, 130, 200], y: T, h: 7, th: 3 });
// the fortification along the mountain side: square mudbrick towers linked by a wall 10 m thick on the terrace's
// east edge, and towered walls climbing the slope east from its corners (ISAC)
E.push({ t: 'fortification', x0: tx1 - 10, x1: tx1, z0: tz0 + 0.5, z1: tz1 - 0.5, y: T, h: 10, foot: 0, towers: { every: 38, size: 13, out: 2.5 },
  climbs: [{ z: tz0 + 3, x1: 232, from: 2.5 }, { z: tz1 - 3, x1: 232, from: 2.5 }], ground: mountain });

// the works yard south-west of the Tachara's platform, where the stone for the halls still building was dressed
E.push({ t: 'terrace_works', at: [-134, 18], y: T });
E.push({ t: 'court_awning', rect: [-103.5, 30, -98, 34.5], y: T, h: 2.8, cloth: 'cloth_ochre', trim: 'cloth_indigo' });

// the gear of the guards, ushers and bearers placed in town.js (headdresses, spears, quivers, vessels)
E.push(...people().gear);

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('terrace', TERRACE.rect, T, 'open'),
  room('apadana', [-60, -90, 0, -30], T + 2.75, 'hall'),
  room('hundred columns', [40, -130, 110, -60], T + 0.95, 'hall'),
  room('tachara', [-62, 12, -46, 28], T + 3.15, 'hall'),
  room('hadish', [-30, 75, 10, 115], T + 3.65, 'hall'),
  room('treasury', [53, 63, 127, 110], T + 0.06, 'hall'),
];
const walks = [[[-220, STAIR.z], [-162.5, STAIR.z], [-162.5, STAIR.z - 54], [-154, STAIR.z - 54], [-154, STAIR.z - 6], [-140, STAIR.z]]];
walks[0].y0 = 0;
// the visitor's walk into the opened houses (walk.js, walkroutes.js): the terrace's lodgings from the court, and the houses on the road below
for (const r of walkRoutes()) { const route = r.route.map((p) => [p[0], p[1]]); route.y0 = r.where === 'terrace' ? T : 0; walks.push(route); }
// the royal way from the arrival toward the Apadana's west stair
walks.push(Object.assign([[-122, -60], [-96, -60]], { y0: T }));

/** The furnished great rooms as near plans: [{ id, center, near, bounds, elements }] (shown within `near` m of `center`). */
export function roomPlans() {
  const at = { apadana: [[-30, -60], 78, [-62, -92, 2, -28]], hundred: [[75, -95], 85, [38, -132, 112, -58]], tachara: [[-54, 20], 48, [-64, 10, -44, 30]], hadish: [[-10, 95], 66, [-32, 73, 12, 117]] };
  return Object.entries(R).map(([k, elements]) => ({ id: `persepolis-rooms-${k}`, style: 'achaemenid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], center: at[k][0], near: at[k][1], bounds: at[k][2], entrance: { at: [-220, STAIR.z], facing: 'e' } }));
}

export const terrace = {
  id: 'persepolis-terrace',
  name: { en: 'The Terrace of Persepolis', zh: '波斯波利斯台地' },
  era: { en: 'Persia, about 480 BC', zh: '波斯，约公元前480年' },
  style: 'achaemenid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-220, STAIR.z], facing: 'e' },
  bounds: [tx0 - 24, tz0 - 2, tx1 + 2, tz1 + 2],
  view: [-80, -110, -10, -40],
  viewY: T,
  bakeTop: 40,
  elements: E,
  rooms,
  walks,
};
export default terrace;
