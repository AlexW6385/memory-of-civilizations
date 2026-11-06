// The temenos of Ur under Shulgi, c. 2050 BC (docs/settlements/ur.md §2–§4): the ziggurat on its
// terrace (stages of 15, 7 and 5 m, the three stairways meeting at the gatehouse, the shrine), the
// terrace's walls, the Court of Nanna, the Giparu, the palace E-hursag, storehouses, the precinct
// wall; the harbour's quay and boats.

import { TEMENOS, TERRACE, COURT, GIPARU, PALACE, STORES, HARBOUR, RADIUS } from './layout.js';

const E = [];
const [tx0, tz0, tx1, tz1] = TERRACE.rect, ty = TERRACE.y;
E.push({ t: 'terrace', rect: TERRACE.rect, h: ty, batter: 0.6, gap: [-7, 7] });
E.push({ t: 'stairs', rect: [-7, COURT[3], 7, tz0 + 0.6], y0: 0, y1: ty, dir: 's', mat: 'brick_baked' });
E.push({ t: 'ziggurat', c: [0, 0], y: ty, stages: [{ w: 64, d: 46, h: 15, batter: 3 }, { w: 38, d: 28, h: 7, batter: 1.5 }, { w: 24, d: 18, h: 5, batter: 1 }], shrine: { w: 12, d: 9, h: 4 } });
// the terrace's enclosure (walls of rooms standing on it, back from its sloping face), the Court of Nanna with the
// Edublalmah, the gate tower, at its entrance, the precinct wall and its north gate
const w = (a, b, h, th, y) => E.push({ t: 'precinct_wall', a, b, h, th, y });
const [ex0, ez0, ex1, ez1] = [tx0 + 2.5, tz0 + 2.5, tx1 - 2.5, tz1 - 2.5];
w([ex0, ez0], [-9, ez0], 3.5, 2.5, ty); w([9, ez0], [ex1, ez0], 3.5, 2.5, ty); w([ex0, ez1], [ex1, ez1], 3.5, 2.5, ty); w([ex0, ez0], [ex0, ez1], 3.5, 2.5, ty); w([ex1, ez0], [ex1, ez1], 3.5, 2.5, ty);
E.push({ t: 'gate_tower', rect: [-8, -146, 8, -134], door: 'n', w: 3, h: 9, dh: 4.2 });
E.push({ t: 'gate_tower', rect: [-10, -176, 10, -164], door: 'n', w: 4, h: 10, dh: 5, mat: 'mudbrick' });
const [cx0, cz0, cx1, cz1] = COURT;
w([cx0, cz0], [-5, cz0], 5, 2.5); w([5, cz0], [cx1, cz0], 5, 2.5); w([cx0, cz0], [cx0, cz1], 5, 2.5); w([cx1, cz0], [cx1, cz1], 5, 2.5);
E.push({ t: 'courtyard_block', rect: GIPARU, h: 6, ring: 11, door: 'w' });
E.push({ t: 'courtyard_block', rect: PALACE, h: 7, ring: 12, door: 'w' });
E.push({ t: 'courtyard_block', rect: STORES, h: 5, ring: 9, door: 'e' });
const [px0, pz0, px1, pz1] = TEMENOS;
w([px0, pz0], [-7, pz0], 7, 4); w([7, pz0], [px1, pz0], 7, 4); w([px0, pz1], [px1, pz1], 7, 4); w([px0, pz0], [px0, pz1], 7, 4);
w([px1, pz0], [px1, -26], 7, 4); w([px1, -14], [px1, pz1], 7, 4);
// the harbour: the quay along its town side, water, reed boats
const [hx0, hz0, hx1, hz1] = HARBOUR.rect, hz = (x) => Math.sqrt(Math.max(0, (RADIUS - 26) ** 2 - x * x));
E.push({ t: 'water_rect', rect: [hx0 + 30, Math.max(hz0, -hz(hx0 + 30)), hx1, Math.min(hz1, hz(hx0 + 30))], y: HARBOUR.water });
E.push({ t: 'water_rect', rect: [hx0 + 6, Math.max(hz0, -hz(hx0 + 6)), hx0 + 30, Math.min(hz1, hz(hx0 + 6))], y: HARBOUR.water });
E.push({ t: 'block', walk: true, rect: [hx1 - 1.5, hz0 + 6, hx1 + 1.5, hz1 - 6], y0: HARBOUR.bed, y1: 0.6, mat: 'brick_baked' });
for (const [x, z, d] of [[-300, -90, 1], [-310, -30, -1], [-296, 20, 1], [-330, -60, -1], [-318, 45, 1]]) E.push({ t: 'reed_boat', at: [x, z], dir: [0, d], len: 8, y: HARBOUR.water });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('terrace', TERRACE.rect, ty, 'open'), room('court', COURT, 0, 'open')];
const walks = [[[0, -240], [0, -170], [0, -110], [0, -78], [0, -60], [0, -40]]];
walks[0].y0 = 0;

export const precinct = {
  id: 'ur-ziggurat',
  name: { en: 'The Ziggurat of Ur', zh: '乌尔大塔庙' },
  era: { en: 'Third Dynasty of Ur, c. 2050 BC', zh: '乌尔第三王朝，约公元前2050年' },
  style: 'sumerian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -110], facing: 's' },
  bounds: TEMENOS,
  bakeBounds: [-62, -72, 62, 50],
  view: [-32, -23, 32, 23],
  viewY: TERRACE.y,
  bakeTop: 36,
  elements: E,
  rooms,
  walks,
};
export default precinct;
