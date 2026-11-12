// Ginkaku-ji (Jishō-ji) about 1490 (docs/settlements/muromachi-kyoto.md §3): the Kannon-den over its pond, the Tōgu-dō
// with the Dōjinsai, the gate and the earthen walls, stone lanterns, the court of white gravel. The landmark.
import { GINKAKU, RADIUS } from './layout.js';

const E = [];
const [x0, z0, x1, z1] = GINKAKU.rect, [gx, gz] = GINKAKU.gate, P = GINKAKU.pond;
// the walls: north, east, west, south with the gate's gap
const wall = (a, b) => E.push({ t: 'tsuijibei', a, b, y: 0, h: 2.4 });
wall([x0, z0], [x1, z0]); wall([x1, z0], [x1, z1]); wall([x0, z0], [x0, z1]); wall([x0, z1], [gx - 4.5, z1]); wall([gx + 4.5, z1], [x1, z1]);
E.push({ t: 'yakumon', at: [gx, gz], y: 0, yaw: 0, w: 3.2 });
// the path from the gate to the court, between the pond and the wall, and round the pond
E.push({ t: 'lane', rect: [gx - 1.6, P.c[1] + P.r[1] + 4, gx + 1.6, z1], y: 0.02, mat: 'flagstone' });
E.push({ t: 'lane', rect: [P.c[0] - P.r[0] - 4, P.c[1] + P.r[1] + 3, P.c[0] + P.r[0] + 4, P.c[1] + P.r[1] + 5.4], y: 0.02, mat: 'flagstone' });
E.push({ t: 'lane', rect: [P.c[0] - P.r[0] - 5.4, GINKAKU.kannon[1] + 8, P.c[0] - P.r[0] - 3, P.c[1] + P.r[1] + 5.4], y: 0.02, mat: 'flagstone' });
// the pond (the shores are dug by the ground), a stone bridge over its narrow west neck
E.push({ t: 'pond_water', c: P.c, r: P.r, y: P.level, margin: 0.6 });
// the Kannon-den facing the pond, the Tōgu-dō facing it from the west
E.push({ t: 'kannon_den', at: GINKAKU.kannon, y: 0, facing: 's' });
E.push({ t: 'togudo', at: GINKAKU.togudo, y: 0, facing: 'e' });
// the court of gravel before the pavilion, with a path of stones to the Tōgu-dō
E.push({ t: 'lane', rect: [GINKAKU.kannon[0] - 14, GINKAKU.kannon[1] + 7.6, GINKAKU.kannon[0] + 14, GINKAKU.kannon[1] + 11], y: 0.02, mat: 'flagstone' });
for (const [x, z, s] of [[170, -16, 1], [232, -16, 1], [150, 38, 0.9], [244, 30, 0.9], [GINKAKU.togudo[0] + 9, GINKAKU.togudo[1] + 6, 0.8]]) E.push({ t: 'ishidoro', at: [x, z], y: 0, s });
for (const [x, z] of [[120, 50], [276, 60], [276, -60], [120, -60]]) E.push({ t: 'niwaki', at: [x, z], y: 0, h: 5.5, seed: Math.round(x + z) });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const [tx, tz] = GINKAKU.togudo;
const [kx, kz] = GINKAKU.kannon;
const rooms = [room('togudo', [tx - 3.5, tz - 3.5, tx + 3.5, tz + 3.5], 0.7, 'hall'), room('kannon-den', [kx - 4.9, kz - 3.9, kx + 4.9, kz + 3.7], 0.9, 'hall'), room('chounkaku', [kx - 3.0, kz - 1.95, kx + 3.0, kz + 1.95], 4.3, 'hall'), room('ginkaku', GINKAKU.rect, 0, 'open')];
const walks = [[[gx, z1 + 10], [gx, z1 - 6], [gx, 56], [P.c[0] - P.r[0] - 4.5, 56], [P.c[0] - P.r[0] - 4.2, 14], [tx + 7, tz + 4], [tx + 7, tz], [tx + 3.5, tz], [tx + 2.2, tz - 2.0], [tx, tz - 2.0]]];
walks[0].y0 = 0;
walks.push([[kx, kz + 14], [kx, kz + 9], [kx, kz + 6.6], [kx, kz + 4.6], [kx, kz + 2.5], [kx - 4.4, kz - 1.3], [kx - 1.8, kz - 1.3], [kx - 0.3, kz - 1.3], [kx + 0.5, kz - 0.6], [kx + 1.5, kz + 0.4]]);
walks[1].y0 = 0;

export const ginkaku = {
  id: 'muromachi-ginkaku',
  name: { en: 'Ginkaku-ji (Jishō-ji)', zh: '银阁寺（慈照寺）' },
  era: { en: 'Muromachi, c. 1490', zh: '室町时代，约1490年' },
  style: 'muromachi',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [gx, z1 + 4], facing: 'n' },
  bounds: [x0 - 4, z0 - 4, x1 + 4, z1 + 4],
  bakeBounds: [x0, z0, x1, z1],
  view: [GINKAKU.kannon[0] - 7, GINKAKU.kannon[1] - 6, GINKAKU.kannon[0] + 7, GINKAKU.kannon[1] + 6],
  bakeTop: 18,
  elements: E,
  rooms,
  walks,
};
void RADIUS;
export default ginkaku;
