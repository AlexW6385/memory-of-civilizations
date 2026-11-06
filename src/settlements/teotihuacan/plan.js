// Teotihuacan about 400 (docs/settlements/teotihuacan.md §2–§4): the Pyramid of the Sun at true size
// with its Adosada, the Pyramid of the Moon on its terrace and the plaza's platform temples, the avenue
// stepped into sunken plazas by talud-tablero platforms, the Ciudadela's banks with the Feathered Serpent Pyramid and its Adosada.

import { AVENUE, MOON, PLAZA, SUN, CIUD, KEEP_CLEAR, RADIUS, CROSS, STEP, BANK, LEVELS, QPP, JAGUARS } from './layout.js';

const E = [], LP = MOON.rise;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rand = rng(4000);
E.push({ t: 'tt_pyramid', c: SUN.c, w: SUN.w, d: SUN.d, tw: SUN.tw, td: SUN.td, h: SUN.h, levels: 5, tablero: 0, stair: 'w', stairW: 14, temple: { w: 16, d: 16, h: 5 } });
E.push({ t: 'tt_pyramid', c: [SUN.c[0] - SUN.w / 2 - 22, SUN.c[1]], w: 44, d: 70, tw: 32, td: 58, h: 12, levels: 2, tablero: 0.4, stair: 'w', stairW: 12, stairFoot: LEVELS[1] + 0.03 });
// the Moon and its front platform on the plaza's terrace
E.push({ t: 'tt_pyramid', c: MOON.c, y: LP, w: MOON.w, d: MOON.d, tw: MOON.tw, td: MOON.td, h: MOON.h, levels: 4, tablero: 0.3, stair: 's', stairW: 12, temple: { w: 14, d: 12, h: 4.5 } });
E.push({ t: 'tt_pyramid', c: [0, MOON.c[1] + MOON.d / 2 + 14], y: LP, w: 46, d: 30, tw: 36, td: 22, h: 10, levels: 3, tablero: 0.45, stair: 's', stairW: 10 });
// the Moon Plaza's platform temples round its sides, its central altar
const [qx0, qz0, qx1, qz1] = PLAZA;
for (const [x, z, f] of [[qx0, qz0 + 14, 'e'], [qx0, qz0 + 44, 'e'], [qx1, qz0 + 14, 'w'], [qx1, qz0 + 44, 'w'], [-34, qz1 - 12, 'n'], [34, qz1 - 12, 'n']]) E.push({ t: 'tt_pyramid', c: [x + (f === 'e' ? -8 : f === 'w' ? 8 : 0), z], y: LP, w: 20, d: 20, tw: 12, td: 12, h: 9, levels: 3, tablero: 0.45, stair: f, stairW: 6, talud: 'stucco_red', temple: { w: 7, d: 7, h: 3 } });
E.push({ t: 'tt_pyramid', c: [0, -226], y: LP, w: 12, d: 12, tw: 10, td: 10, h: 2.2, levels: 1, tablero: 0.55, stair: 's', stairW: 4, talud: 'stucco_red' });
E.push({ t: 'tt_floor', rect: [qx0, qz0, qx1, qz1], y: LP + 0.03, mat: 'stucco_pale' });
// "an original construction with internal divisions … four rectangular and diagonal bodies that formed what is
// known as the Teotihuacan Cross" (Wikipedia), and the Great Goddess — the colossal water goddess dug from the
// plaza's forecourt — on her base beside the central altar
E.push({ t: 'tt_cross_altar', c: [0, -209], y: LP + 0.03, s: 11 });
E.push({ t: 'tt_goddess', c: [11, -226], y: LP + 0.03 });

// ---- the Avenue of the Dead: a run of sunken plazas, each enclosed by talud-tablero platforms —
// one across the avenue at either end, climbed and descended by broad stairs, and one along each
// side carrying the platform temples, with stairs up to them — and an altar in the middle of most.
// Each plaza lies a little higher than the one south of it (LEVELS), the step taken in the platform
// between them: a taller flight up its south face than down its north one.
const AH = 2.4, SR = 3.6;                                                  // the platforms' height (over the higher plaza), the run of their stairs
const L0 = LEVELS[0];
// the platform at the Moon Plaza's edge: up from the avenue's highest plaza, down a little onto the terrace
E.push({ t: 'tt_wall', rect: STEP, y: L0, h: LP + 1.2 - L0, foot: L0 + 0.3 });
E.push({ t: 'tt_stair', rect: [-14, STEP[3], 14, STEP[3] + 5.6], y0: L0, y1: LP + 1.2, dir: 'n', mat: 'stucco_ochre' });
E.push({ t: 'tt_stair', rect: [-14, STEP[1] - 2.2, 14, STEP[1]], y0: LP, y1: LP + 1.2, dir: 's', mat: 'stucco_ochre' });
// the platforms across the avenue, out to the side platforms
CROSS.forEach((z, k) => {
  const ln = LEVELS[k], ls = LEVELS[k + 1], top = Math.max(ln, ls) + AH, lo = Math.min(ln, ls, 0) - 0.3;
  E.push({ t: 'tt_wall', rect: [-BANK, z, z + 6 > CIUD[1] && z < CIUD[3] ? CIUD[0] : BANK, z + 6], y: Math.max(ln, ls), h: AH, foot: Math.max(ln, ls) - lo });
  E.push({ t: 'tt_stair', rect: [-12, z - SR * (top - ln) / AH, 12, z], y0: ln, y1: top, dir: 's', mat: 'stucco_ochre' });
  E.push({ t: 'tt_stair', rect: [-12, z + 6, 12, z + 6 + SR * (top - ls) / AH], y0: ls, y1: top, dir: 'n', mat: 'stucco_ochre' });
});
// the plazas between them, south of the Moon Plaza's platform to the avenue's end
const ends = [STEP[3], ...CROSS.map((z) => [z, z + 6]).flat(), AVENUE[3]];
for (let i = 0; i < ends.length; i += 2) {
  const lv = LEVELS[i / 2], z0 = ends[i] + (i === 0 ? 5.6 : SR * (Math.max(lv, LEVELS[i / 2 - 1] ?? lv) + AH - lv) / AH), z1 = ends[i + 1] - SR;           // clear of the stairs
  E.push({ t: 'tt_floor', rect: [AVENUE[0], ends[i], AVENUE[2], ends[i + 1]], y: lv + 0.03, mat: 'stucco_pale' });
  // the floor re-laid in patches over the years, worn paler along the way up the middle
  for (let k = 0; k < (ends[i + 1] - ends[i]) / 14; k++) {
    const w = 4 + rand() * 10, d = 3 + rand() * 9, x = AVENUE[0] + 1 + rand() * (AVENUE[2] - AVENUE[0] - 2 - w), z = ends[i] + 1 + rand() * Math.max(0, ends[i + 1] - ends[i] - 2 - d);
    E.push({ t: 'tt_floor', rect: [x, z, x + w, z + d], y: lv + 0.045, mat: rand() < 0.6 ? 'plaster' : 'lime_plaster' });
  }
  // the side platforms, except where the Sun's and the Ciudadela's fronts open on the avenue
  for (const sd of [-1, 1]) {
    let runs = [[ends[i], ends[i + 1]]];
    for (const k of KEEP_CLEAR) if (sd > 0 && k[0] < BANK) runs = runs.flatMap(([a, b]) => (b <= k[1] || a >= k[3] ? [[a, b]] : [[a, Math.min(b, k[1])], [Math.max(a, k[3]), b]]).filter(([u, v]) => v - u > 12));
    for (const [a, b] of runs) {
      const zz0 = Math.max(a, -RADIUS), zz1 = Math.min(b, Math.sqrt((RADIUS - 30) ** 2 - BANK * BANK));
      if (zz1 - zz0 < 12) continue;
      E.push({ t: 'tt_wall', rect: sd < 0 ? [-BANK, zz0, AVENUE[0], zz1] : [AVENUE[2], zz0, BANK, zz1], y: lv, h: AH, foot: lv - Math.min(lv, 0) + 0.3 });
      // the platform temples on it, each with a stair up from the plaza
      const n = Math.max(1, Math.floor((zz1 - zz0 - 8) / 30));
      for (let j = 0; j < n; j++) {
        const z = zz0 + (zz1 - zz0) * (j + 0.5) / n, big = n > 2 && j === Math.floor(n / 2), xc = sd * (AVENUE[2] + 16);
        E.push({ t: 'tt_pyramid', c: [xc, z], y: lv + AH, w: big ? 22 : 18, d: big ? 24 : 18, tw: big ? 14 : 10, td: big ? 16 : 10, h: big ? 8 : 5.5, levels: big ? 3 : 2, tablero: 0.5, stair: sd < 0 ? 'e' : 'w', stairW: 5, talud: 'stucco_red', temple: { w: big ? 8 : 6, d: big ? 8 : 6, h: 3 } });
        E.push({ t: 'tt_stair', rect: sd < 0 ? [AVENUE[0], z - 2.5, AVENUE[0] + SR, z + 2.5] : [AVENUE[2] - SR, z - 2.5, AVENUE[2], z + 2.5], y0: lv, y1: lv + AH, dir: sd < 0 ? 'w' : 'e', mat: 'stucco_ochre' });
      }
    }
  }
  // the altar in the plaza's middle
  if (z1 - z0 > 60 && i !== 4) E.push({ t: 'tt_pyramid', c: [0, (z0 + z1) / 2], y: lv, w: 7, d: 7, tw: 5.6, td: 5.6, h: 1.5, levels: 1, tablero: 0.55, stair: 's', stairW: 2.4, talud: 'stucco_red' });
}
// the plaza of the arrival (between the Sun's and the Ciudadela's fronts): its altars, censers and people
E.push({ t: 'tt_plaza_altars', c: [0, 15], y: LEVELS[2], seed: 15 });
E.push({ t: 'tt_plaza_altars', c: [-9, 42], y: LEVELS[2], seed: 72, small: true });
// the broad stair from the avenue's highest plaza up to the Palace of Quetzalpapalotl's vestibule
E.push({ t: 'tt_stair', rect: [AVENUE[0], -186, AVENUE[0] + SR, -175], y0: L0, y1: L0 + AH, dir: 'w', mat: 'stucco_ochre' });
// the Palace of Quetzalpapalotl on the side platform's level, its vestibule opening east on to it; the Jaguars' patio south of it
E.push({ t: 'tt_wall', rect: QPP.rect, y: 0, h: QPP.y, foot: 0.3, discs: false });
E.push({ t: 'tt_palace', rect: QPP.rect, y: QPP.y + 0.03, seed: 450, land: L0 + AH + 0.03, stairHead: [AVENUE[0] - 1.2, L0 + AH + 0.03, -186.6, 1, 0] });
E.push({ t: 'tt_wall', rect: JAGUARS.rect, y: 0, h: JAGUARS.y, foot: 0.3, discs: false });
E.push({ t: 'tt_jaguars', rect: JAGUARS.rect, y: JAGUARS.y + 0.03, seed: 350 });
E.push({ t: 'tt_stair', rect: [JAGUARS.rect[2], -116, JAGUARS.rect[2] + 1.2, -112], y0: 0, y1: JAGUARS.y + 0.03, dir: 'w', mat: 'stucco_ochre' });

// ---- the Ciudadela: four platforms round its plaza; fifteen temples on them — four on the west
// facing out over the avenue, where the one broad stair comes up, four on the north and the south
// and three on the east facing in (Met essay) — the Feathered Serpent Pyramid, its three open
// faces carrying the heads, its west front buried behind the Adosada
const [cx0, cz0, cx1, cz1] = CIUD, bw = 22, CH = 7;
for (const r of [[cx0, cz0, cx1, cz0 + bw], [cx0, cz1 - bw, cx1, cz1], [cx1 - bw, cz0 + bw, cx1, cz1 - bw], [cx0, cz0 + bw, cx0 + bw, cz1 - bw]]) E.push({ t: 'tt_wall', rect: r, h: CH });
const cm = (cz0 + cz1) / 2;
E.push({ t: 'tt_stair', rect: [AVENUE[2], cm - 14, cx0 + 0.3, cm + 14], y0: LEVELS[4], y1: CH, dir: 'e', mat: 'stucco_ochre' });
E.push({ t: 'tt_stair', rect: [cx0 + bw - 0.3, cm - 14, cx0 + bw + 9, cm + 14], y0: 0, y1: CH, dir: 'w', mat: 'stucco_ochre' });
const ct = (x, z, f) => E.push({ t: 'tt_pyramid', c: [x, z], y: CH, w: 16, d: 16, tw: 9, td: 9, h: 5, levels: 2, tablero: 0.5, stair: f, stairW: 5, talud: 'stucco_red', temple: { w: 6, d: 6, h: 2.6 } });
for (const z of [cz0 + 40, cz0 + 68, cz1 - 68, cz1 - 40]) ct(cx0 + bw / 2, z, 'w');
for (const x of [cx0 + 52, cx0 + 82, cx0 + 112, cx0 + 142]) { ct(x, cz0 + bw / 2, 's'); ct(x, cz1 - bw / 2, 'n'); }
for (const z of [cz0 + 48, cm, cz1 - 48]) ct(cx1 - bw / 2, z, 'w');
E.push({ t: 'tt_pyramid', c: [150, 260], w: 65, d: 65, tw: 36, td: 36, h: 20, levels: 6, tablero: 0.58, stair: 'w', stairW: 10, heads: 'nse', temple: { w: 14, d: 14, h: 4 } });
E.push({ t: 'tt_pyramid', c: [104, 260], w: 30, d: 46, tw: 22, td: 36, h: 9, levels: 3, tablero: 0.5, stair: 'w', stairW: 8 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('avenue', AVENUE, 0, 'open'), room('plaza', PLAZA, MOON.rise, 'open')];
const walks = [[[8, 300], [8, 100], [8, -80], [0, -160], [0, -205], [12, -232]]];
walks[0].y0 = 0;

export const city = {
  id: 'teotihuacan-centre',
  name: { en: 'The Pyramid of the Sun and the Avenue of the Dead', zh: '太阳金字塔与亡者大道' },
  era: { en: 'Teotihuacan, c. 400', zh: '特奥蒂瓦坎，约400年' },
  style: 'teotihuacano',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -80], facing: 'e' },
  bounds: [-90, -400, 300, 400],
  bakeBounds: [-80, -400, 300, 360],
  view: [62, -140, 200, -20],
  bakeTop: 72,
  elements: E,
  rooms,
  walks,
};
export default city;
