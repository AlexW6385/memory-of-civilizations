// The Haram al-Sharif and Jerusalem about 700 (docs/settlements/jerusalem.md §2–§4): the Dome of
// the Rock (the full building of the previous design, src/buildings/dome-of-the-rock) on its
// platform; the esplanade's retaining walls; the al-Aqsa mosque. (The city and the Holy Sepulchre: city.js.)

import { HARAM, AQSA, PALACES, HGATES, height } from './layout.js';
import domePlan from '../../buildings/dome-of-the-rock/plan.js';

const [hx0, hz0, hx1, hz1] = HARAM.rect, T = HARAM.top;
const E = [];
// the retaining walls of Herodian ashlars with four Umayyad courses above (§4b): the west wall open at the
// stair's head, the south wall with the Double and Triple Gates and the bridge from the palace, the east
// wall with the Golden Gate
{
  const low = (pts) => Math.min(...pts.map(([x, z]) => height(x, z)));
  const W = [
    { o: [hx0 - 3, hz1 + 3], u: [0, -1], L: hz1 - hz0 + 6, out: [-4, 0], gates: [{ kind: 'open', s0: hz1 + 3 - 6, s1: hz1 + 3 + 6 }] },
    { o: [hx1 + 3, hz0 - 3], u: [0, 1], L: hz1 - hz0 + 6, out: [4, 0], gates: [{ kind: 'facade', s0: HGATES.golden - hz0 + 3 - 12.2, s1: HGATES.golden - hz0 + 3 + 12.2 }, { kind: 'open', s0: HGATES.golden - hz0 + 3 - 12.2, s1: HGATES.golden - hz0 + 3 + 12.2 }] },
    { o: [hx0, hz0 - 3], u: [1, 0], L: hx1 - hx0, out: [0, -4], gates: [] },
    { o: [hx1, hz1 + 3], u: [-1, 0], L: hx1 - hx0, out: [0, 4], gates: [
      { kind: 'double', s0: hx1 - HGATES.double - 6.3, s1: hx1 - HGATES.double + 6.3, y: height(HGATES.double, hz1 + 6) },
      { kind: 'triple', s0: hx1 - HGATES.triple - 8.5, s1: hx1 - HGATES.triple + 8.5, y: height(HGATES.triple, hz1 + 6) },
      { kind: 'open', s0: hx1 - PALACES[0].bridge.x1, s1: hx1 - PALACES[0].bridge.x0 }] },
  ];
  W.forEach((w, i) => {
    const pts = []; for (let s = 0; s <= w.L; s += 10) pts.push([w.o[0] + w.u[0] * s + w.out[0], w.o[1] + w.u[1] * s + w.out[1]]);
    const g = low(pts);
    E.push({ t: 'herodian_wall', o: w.o, u: w.u, L: w.L, th: 3, y0: g - 2, g, top: T, gates: w.gates, seed: 20 + i });
  });
  E.push({ t: 'golden_gate', at: [hx1 + 3, HGATES.golden], u: [0, 1], g: height(hx1 + 8, HGATES.golden), top: T, w: 24.4, d: 14.5 });
}
// a gate and stair up from the city on the west
E.push({ t: 'stair', rect: [hx0 - 24, -6, hx0 - 3, 6], dir: 'e', y0: height(hx0 - 24, 0), y1: T, riser: 0.18, base: height(hx0 - 24, 0) - 0.5, mat: 'limestone' });
E.push({ t: 'hypostyle', rect: AQSA, y: T, aisles: 11, bay: 4.9 });

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
export const dome = { ...domePlan, origin: [0, -20], district: undefined, view: [-28, -48, 28, 8] };
export default dome;
