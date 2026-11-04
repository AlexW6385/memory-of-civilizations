// The Haram al-Sharif and Jerusalem about 700 (docs/settlements/jerusalem.md §2–§4): the Dome of
// the Rock (the full building of the previous design, src/buildings/dome-of-the-rock) on its
// platform; the esplanade's retaining walls; the al-Aqsa mosque; the Church of the Holy Sepulchre.

import { HARAM, AQSA, SEPULCHRE, height } from './layout.js';
import domePlan from '../../buildings/dome-of-the-rock/plan.js';

const [hx0, hz0, hx1, hz1] = HARAM.rect, T = HARAM.top;
const E = [];
// the retaining walls of great ashlars, from the valleys up to a parapet above the esplanade
for (const r of [[hx0 - 3, hz0 - 3, hx0, hz1 + 3], [hx1, hz0 - 3, hx1 + 3, hz1 + 3], [hx0, hz0 - 3, hx1, hz0], [hx0, hz1, hx1, hz1 + 3]]) {
  const low = Math.min(height(r[0] - 4, r[1] - 4), height(r[2] + 4, r[3] + 4), height(r[0] - 4, r[3] + 4), height(r[2] + 4, r[1] - 4));
  E.push({ t: 'block', rect: r, y0: low - 2, y1: T + 1.2, mat: 'limestone' });
}
// a gate and stair up from the city on the west
E.push({ t: 'stair', rect: [hx0 - 24, -6, hx0 - 3, 6], dir: 'e', y0: height(hx0 - 24, 0), y1: T, riser: 0.18, base: height(hx0 - 24, 0) - 0.5, mat: 'limestone' });
E.push({ t: 'hypostyle', rect: AQSA, h: 9, y: T, aisles: 7 });

export const haram = {
  id: 'jerusalem-haram',
  name: { en: 'The Haram al-Sharif', zh: '圣殿山' },
  era: { en: 'Umayyad Jerusalem, about 700', zh: '倭马亚耶路撒冷，约700年' },
  style: 'islamic',
  origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [hx0 - 30, 0], facing: 'e' },
  bounds: [hx0 - 26, hz0 - 4, hx1 + 4, hz1 + 4],
  elements: E,
  rooms: [],
};
// the Church of the Holy Sepulchre: the Anastasis rotunda and the basilica with its atrium
export const sepulchre = {
  id: 'jerusalem-sepulchre', style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [-320, -20], facing: 'n' }, bounds: [SEPULCHRE[0] - 2, SEPULCHRE[1] - 2, SEPULCHRE[2] + 2, SEPULCHRE[3] + 2], rooms: [],
  elements: [
    { t: 'thermae', rect: [SEPULCHRE[0], SEPULCHRE[1], SEPULCHRE[2], SEPULCHRE[1] + 50], h: 22, y: height(-320, -135) },
    { t: 'porticus', rect: [SEPULCHRE[0], SEPULCHRE[1] + 54, SEPULCHRE[2], SEPULCHRE[3]], h: 9, depth: 6, y: height(-320, -70) },
  ],
};
export const dome = { ...domePlan, origin: [0, -20], district: undefined, view: [-28, -48, 28, 8] };
export default dome;
