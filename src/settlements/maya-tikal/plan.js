// The Great Plaza of Tikal, c. 750 (docs/settlements/maya-tikal.md §4): Temple I and Temple II face to face across the plastered
// plaza, the North Acropolis with its temples and its rows of stelae, the Central Acropolis with its vaulted palaces (the
// south range opened and furnished, the stepped palace of five levels), the small ball court. Buildings at their true sizes
// (the stairs of the temples are as steep as a walker can climb, 60°).

import { PLAZA, T1, T2, NA, NA_TEMPLE, NA_SMALL, CA, BALL } from './layout.js';
import { frame } from '../../styles/tikal/kit.js';

const E = [];
E.push({ t: 'lane', rect: PLAZA, y: 0.04, mat: 'lime_plaster' });
// the plaza's plaster after two centuries of rains: damp, moss in the joints, worn patches; the censers at the stelae
E.push({ t: 'k_stains', rect: [PLAZA[0] + 1, PLAZA[1] + 1, PLAZA[2] - 1, PLAZA[3] - 1], y: 0.05, n: 70, seed: 7 });
for (const [x, z] of [[-24, -34.6], [24, -34.6], [-31, -4], [31, 4], [-31, 4], [31, -4], [-6, 34.6], [6, 34.6]]) E.push({ t: 'k_brazier', at: [x, z], y: 0.04, rot: x });
// Temple I (east, the stair on its west face): nine tiers, the shrine of three chambers, the roof comb
E.push({ t: 'k_pyramid', ...T1, shrine: { chambers: 3, len: 7, comb: 13 } });
// Temple II (west, the stair on its east face): three broad tiers, the shrine and its comb
E.push({ t: 'k_pyramid', ...T2, masks: true, shrine: { chambers: 3, len: 8, comb: 12 } });
// the North Acropolis: the platform, its broad stair, the great temple in the middle, smaller temples with combs
E.push({ t: 'k_platform', rect: NA.rect, H: NA.H, stairs: [{ face: 's', at: 0, w: 30, run: 12 }] });
E.push({ t: 'k_pyramid', ...NA_TEMPLE, y0: NA.H, masks: true, shrine: { chambers: 3, len: 6, comb: 7 } });
for (const [x, z, face] of NA_SMALL) E.push({ t: 'k_pyramid', c: [x, z], base: [7, 7], top: [4.8, 4.8], H: 8, tiers: 3, face, stairW: 3.5, y0: NA.H, shrine: { chambers: 1, len: 4, comb: 5 } });
for (const sg of [-1, 1]) E.push({ t: 'k_mask', c: [sg * 17.5, NA.rect[3] + 0.05], face: 's', y: 0.3, s: 2.3 });     // the masks flanking the great stair
// the lower ranges on the North Acropolis' terrace, either side of the great temple: vaulted rooms with benches, one opening on each court
E.push({ t: 'k_range', c: [-24, -76], face: 'e', y: NA.H, n: 3, furn: true, seed: 21 });
E.push({ t: 'k_range', c: [24, -76], face: 'w', y: NA.H, n: 3, furn: true, seed: 22 });
for (const x of [-30, 30]) E.push({ t: 'k_brazier', at: [x, -48], y: NA.H, rot: x });
// the Central Acropolis: the platform and its stair from the plaza, two ranges on the north terrace, the great south range
E.push({ t: 'k_platform', rect: CA.rect, H: CA.H, stairs: [{ face: 'n', at: -9, w: 24, run: 8.4 }] });
const Y = CA.H;
E.push({ t: 'k_range', c: [-30, 62], face: 's', y: Y, n: 6, comb: 2.5, seed: 1, furn: true });
E.push({ t: 'k_range', c: [22, 62], face: 's', y: Y, n: 6, comb: 2.5, seed: 2, furn: true });
export const SOUTH_RANGE = { c: [-8, 96], face: 'n', y: Y, n: 7, rows: 2, furn: true, seed: 5, comb: 3 };
E.push({ t: 'k_range', ...SOUTH_RANGE });
E.push({ t: 'k_range', c: [-50, 80], face: 'e', y: Y, n: 4, seed: 3, furn: true });
// the second court behind the south range: two ranges facing it, its altar and cisterns
E.push({ t: 'k_range', c: [-34, 123], face: 'n', y: Y, n: 5, seed: 6, furn: true, comb: 2 });
E.push({ t: 'k_range', c: [14, 123], face: 'n', y: Y, n: 5, seed: 8, furn: true, comb: 2 });
// the first court: a low altar platform in its middle with censers, cisterns, the damp of the plaster
E.push({ t: 'block', rect: [-30, 76, -22, 84], y0: Y, y1: Y + 0.8, batter: [0.5, 0.5, 0.5, 0.5], mat: 'lime_plaster', collide: false, walk: true });
for (const [x, z] of [[-29, 77], [-23, 77], [-29, 83], [-23, 83]]) E.push({ t: 'k_brazier', at: [x, z], y: Y + 0.8, rot: x });
for (const [x, z] of [[-40, 68], [-14, 90], [-40, 92]]) E.push({ t: 'k_chultun', at: [x, z], y: Y, seed: x + z });
E.push({ t: 'k_stains', rect: [-46, 64, -6, 95], y: Y + 0.03, n: 26, seed: 3, skip: (x, z) => x > -31 && x < -21 && z > 75 && z < 85 });
for (const [x, z] of [[-30, 112], [-10, 112], [-30, 118], [10, 112]]) E.push({ t: 'k_brazier', at: [x, z], y: Y, rot: z });
for (const [x, z] of [[-20, 110], [-2, 114]]) E.push({ t: 'k_chultun', at: [x, z], y: Y, seed: x });
E.push({ t: 'k_stains', rect: [-50, 107, 30, 121], y: Y + 0.03, n: 24, seed: 5 });
// the market hall on the East Plaza: a long range of rooms opening west on the market
E.push({ t: 'k_range', c: [141, 43], face: 'w', y: 0, n: 8, seed: 41, furn: true });
// the stepped palace of five levels on the east side: each level's range opens west; each platform behind the one before
export const STEP_PALACE = [];
{
  let xr = 2;
  for (let k = 0; k < 5; k++) {
    const y = Y + 4 * k;
    STEP_PALACE.push({ c: [xr, 82], face: 'w', y, n: 4, furn: k === 0 || k === 2, seed: 10 + k });
    E.push({ t: 'k_range', ...STEP_PALACE[k] });
    if (k < 4) {
      const x0 = xr + 6.1;
      E.push({ t: 'k_platform', rect: [x0, 66, 40, 98], H: 4, y0: y, stairs: [{ face: 'w', at: k % 2 ? 96 : 68, w: 3, run: 6.4 }] });
      xr += 7.1;
    }
  }
}
// the small ball court between Temple I and the Central Acropolis
E.push({ t: 'k_ballcourt', alley: BALL.alley, mound: BALL.mound });
// stelae and their altars: before the North Acropolis, at the feet of the temples' stairs, at the Central Acropolis' stair
for (const x of [-44, -36, -28, -20, 20, 28, 36, 44]) E.push({ t: 'k_stela', at: [x, -37.5], face: 's', h: 3.0 + (x % 3 ? 0.4 : 0), seed: Math.abs(x) });
for (const x of [-14, 14]) E.push({ t: 'k_stela', at: [x, -37.5], face: 's', h: 3.4, seed: x + 40 });
for (const z of [-8, 8]) { E.push({ t: 'k_stela', at: [31.5, z], face: 'w', h: 3.34, seed: z + 60 }); E.push({ t: 'k_stela', at: [-31.5, z * 1.1], face: 'e', h: 3.34, seed: z + 70 }); }
for (const x of [-26, 8]) E.push({ t: 'k_stela', at: [x, 38], face: 'n', h: 3.0, seed: x + 90 });
for (const [x, z] of [[-10, -20], [10, -20], [-10, 20], [10, 20]]) E.push({ t: 'k_stela', at: [x, z], face: z < 0 ? 's' : 'n', h: 2.8, seed: x + z + 100 });

// rooms: the three chambers of Temple I, the innermost of Temple II, the south range's rooms, the lowest room of the stepped palace
const room = (id, rect, y, kind = 'hall') => ({ id, rect, y, kind });
const t1c = frame('w', T1.c[0] - T1.top[0] + 1.8, T1.c[1]);
const t2c = frame('e', T2.c[0] + T2.top[0] - 1.8, T2.c[1]);
const sr = frame('n', ...SOUTH_RANGE.c);
const sp = frame('w', ...STEP_PALACE[0].c);
const mh = frame('w', 141, 43), nr1 = frame('e', -24, -76), nr2 = frame('w', 24, -76), cb1 = frame('n', -34, 123), cb2 = frame('n', 14, 123);
const rooms = [
  room('plaza', PLAZA, 0, 'open'),
  room('temple1-outer', t1c.R(2.3, 3.5, -2.5, 2.5), T1.H),
  room('temple1-inner', t1c.R(9.9, 10.9, -2.5, 2.5), T1.H),
  room('temple2-outer', t2c.R(2.3, 3.5, -2.5, 2.5), T2.H),
  room('palace-front', sr.R(1.5, 3.6, -1.5, 1.5), CA.H),
  room('palace-back', sr.R(5.4, 7.4, -1.5, 1.5), CA.H),
  room('stepped-palace', sp.R(1.5, 3.6, 1.8, 3.5), CA.H),
  room('market-hall', mh.R(1.5, 3.6, 1.5, 3.8), 0),
  room('terrace-west', nr1.R(1.5, 3.6, -1.3, 1.3), NA.H),
  room('terrace-east', nr2.R(1.5, 3.6, -1.3, 1.3), NA.H),
  room('court2-west', cb1.R(1.5, 3.6, -1.3, 1.3), CA.H),
  room('court2-east', cb2.R(1.5, 3.6, -1.3, 1.3), CA.H),
];
export const WALKS = [
  [[-18, 28], [20, 0], [34, 0], [44, 0], [52, 0], [54.5, 0], [58.3, 0], [62.1, 0], [65.5, 0]],
  [[-18, 28], [-20, 0], [-34, 0], [-42, 0], [-45, 0], [-49, 0], [-52.8, 0]],
  [[-9, 36], [-9, 44], [-9, 52], [-8, 70], [-8, 95], [-8, 98.4], [-8, 102.2]],
];
const walks = WALKS; for (const w of walks) w.y0 = 0;

export const plaza = {
  id: 'maya-tikal-plaza',
  name: { en: 'Tikal: the Great Plaza', zh: '蒂卡尔：大广场' },
  era: { en: 'Classic Maya, c. 750', zh: '古典玛雅，约750年' },
  style: 'tikal',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-18, 28], facing: 'n' },
  bounds: [-80, -126, 150, 135],
  bakeBounds: [-70, -60, 100, 60],
  view: [-60, -60, 90, 60],
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};
export default plaza;
