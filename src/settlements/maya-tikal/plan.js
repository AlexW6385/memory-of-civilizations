// The Great Plaza of Tikal, c. 750 (docs/settlements/maya-tikal.md §4): Temple I and Temple II face to face across the plastered
// plaza, the North Acropolis with its temples and its rows of stelae, the Central Acropolis with its vaulted palaces (the
// south range opened and furnished, the stepped palace of five levels), the small ball court. Buildings at their true sizes
// (the stairs of the temples are as steep as a walker can climb, 60°).

import { PLAZA, T1, T2, NA, NA_TEMPLE, NA_SMALL, CA, BALL } from './layout.js';
import { frame } from '../../styles/tikal/kit.js';

const E = [];
E.push({ t: 'lane', rect: PLAZA, y: 0.04, mat: 'lime_plaster' });
// Temple I (east, the stair on its west face): nine tiers, the shrine of three chambers, the roof comb
E.push({ t: 'k_pyramid', ...T1, shrine: { chambers: 3, len: 7, comb: 13 } });
// Temple II (west, the stair on its east face): three broad tiers, the shrine and its comb
E.push({ t: 'k_pyramid', ...T2, shrine: { chambers: 3, len: 8, comb: 12 } });
// the North Acropolis: the platform, its broad stair, the great temple in the middle, smaller temples with combs
E.push({ t: 'k_platform', rect: NA.rect, H: NA.H, stairs: [{ face: 's', at: 0, w: 30, run: 12 }] });
E.push({ t: 'k_pyramid', ...NA_TEMPLE, y0: NA.H, shrine: { chambers: 3, len: 6, comb: 7 } });
for (const [x, z, face] of NA_SMALL) E.push({ t: 'k_pyramid', c: [x, z], base: [7, 7], top: [4.8, 4.8], H: 8, tiers: 3, face, stairW: 3.5, y0: NA.H, shrine: { chambers: 1, len: 4, comb: 5 } });
// the Central Acropolis: the platform and its stair from the plaza, two ranges on the north terrace, the great south range
E.push({ t: 'k_platform', rect: CA.rect, H: CA.H, stairs: [{ face: 'n', at: -9, w: 24, run: 8.4 }] });
const Y = CA.H;
E.push({ t: 'k_range', c: [-30, 62], face: 's', y: Y, n: 6, comb: 2.5, seed: 1 });
E.push({ t: 'k_range', c: [22, 62], face: 's', y: Y, n: 6, comb: 2.5, seed: 2 });
export const SOUTH_RANGE = { c: [-8, 96], face: 'n', y: Y, n: 7, rows: 2, furn: true, seed: 5, comb: 3 };
E.push({ t: 'k_range', ...SOUTH_RANGE });
E.push({ t: 'k_range', c: [-50, 80], face: 'e', y: Y, n: 4, seed: 3 });
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
const rooms = [
  room('plaza', PLAZA, 0, 'open'),
  room('temple1-outer', t1c.R(2.3, 3.5, -2.5, 2.5), T1.H),
  room('temple1-inner', t1c.R(9.9, 10.9, -2.5, 2.5), T1.H),
  room('temple2-outer', t2c.R(2.3, 3.5, -2.5, 2.5), T2.H),
  room('palace-front', sr.R(1.5, 3.6, -1.5, 1.5), CA.H),
  room('palace-back', sr.R(5.4, 7.4, -1.5, 1.5), CA.H),
  room('stepped-palace', sp.R(1.5, 3.6, 1.8, 3.5), CA.H),
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
  bounds: [-80, -126, 135, 135],
  bakeBounds: [-70, -60, 100, 60],
  view: [-60, -60, 90, 60],
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};
export default plaza;
