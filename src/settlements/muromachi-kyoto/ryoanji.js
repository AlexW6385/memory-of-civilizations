// Ryōan-ji about 1490 (docs/settlements/muromachi-kyoto.md §4): the hōjō with its veranda, the rock garden of fifteen stones in
// five groups on raked gravel inside its clay wall, the pond Kyōyōchi, the gate and the walls.
import { RYOAN } from './layout.js';

const E = [];
const [x0, z0, x1, z1] = RYOAN.rect, [gx, gz] = RYOAN.gate, [hx, hz] = RYOAN.hojo, P = RYOAN.pond;
const wall = (a, b) => E.push({ t: 'tsuijibei', a, b, y: 0, h: 2.2 });
wall([x0, z0], [x1, z0]); wall([x1, z0], [x1, z1]); wall([x0, z0], [x0, z1]); wall([x0, z1], [gx - 4.5, z1]); wall([gx + 4.5, z1], [x1, z1]);
E.push({ t: 'yakumon', at: [gx, gz], y: 0, yaw: 0, w: 3.0 });
E.push({ t: 'lane', rect: [gx - 1.4, hz + 7.4, gx + 1.4, gz], y: 0.02, mat: 'flagstone' });
E.push({ t: 'hojo', at: [hx, hz], y: 0, facing: 'n', W: 26, D: 12 });
E.push({ t: 'karesansui', rect: RYOAN.garden, y: 0, seed: 15 });
E.push({ t: 'pond_water', c: P.c, r: P.r, y: P.level, margin: 0.6 });
for (const [x, z, s] of [[-198, -108, 0.9], [-130, -120, 0.9], [-165, -160, 0.8]]) E.push({ t: 'ishidoro', at: [x, z], y: 0, s });
for (const [x, z] of [[-226, -110], [-104, -110], [-226, -150], [-104, -160]]) E.push({ t: 'niwaki', at: [x, z], y: 0, h: 6, seed: Math.round(x - z) });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('hojo', [hx - 13, hz - 6, hx + 13, hz + 6], 0.85, 'hall'), room('ryoanji', RYOAN.rect, 0, 'open')];
const walks = [[[gx, gz + 6], [gx, gz - 4], [gx, hz + 14], [hx - 19, hz + 14], [hx - 19, hz - 7.5], [hx - 14.6, hz - 7.5], [hx - 11, hz - 7.5], [hx - 4, hz - 7.5], [hx + 3.3 - 0.0, hz - 5], [hx + 3.3, hz - 1]]];
walks[0].y0 = 0;

export const ryoanji = {
  id: 'muromachi-ryoanji',
  name: { en: 'Ryōan-ji', zh: '龙安寺' },
  era: { en: 'Muromachi, c. 1490', zh: '室町时代，约1490年' },
  style: 'muromachi',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [gx, gz + 4], facing: 'n' },
  bounds: [x0 - 4, z0 - 4, x1 + 4, z1 + 4],
  bakeBounds: [x0, z0, x1, z1],
  view: [hx - 13, hz - 6, hx + 13, hz + 6],
  bakeTop: 10,
  elements: E,
  rooms,
  walks,
};
export default ryoanji;
