// Ginkaku-ji (Jishō-ji) about 1490 (docs/settlements/muromachi-kyoto.md §3): the Kannon-den over its pond, the Tōgu-dō
// with the Dōjinsai, the gate and the earthen walls, stone lanterns, the court of white gravel. The landmark.
import { GINKAKU, RADIUS, lots } from './layout.js';
import { dims } from '../../styles/muromachi/machiya.js';
import { upWindows, stairAt } from '../../styles/muromachi/upper.js';

const E = [];
const kx0 = GINKAKU.kannon[0] - 14;
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
// the pond's bank set with stones, a moss islet with a pine, a stone bridge to it from the south bank
E.push({ t: 'pond_stones', c: P.c, r: P.r, n: 22, y: -0.3, seed: 7, skip: [[205, 217]] });
E.push({ t: 'islet', at: [211, -2.2], r: 2.5, y: -1.6, top: 0.2, seed: 9 });
//E.push({ t: 'niwaki', at: [212, -2.8], y: 0.2, h: 4.2, seed: 33 });
E.push({ t: 'stone_bridge', x: 211, z0: 7.8, z1: 0.4, y: 0.16, w: 0.95 });
// the approach: a clipped camellia hedge each side of the way from the gate, a fence of split bamboo behind it [inferred: the hedge and fence of the present approach, set here at the brief's request]
for (const sx of [-1, 1]) { E.push({ t: 'ikegaki', a: [gx + sx * 2.15, z1 - 4], b: [gx + sx * 2.15, 64], h: 1.5, y: 0, w: 0.5, seed: 5 + sx }); E.push({ t: 'bamboo_fence', a: [gx + sx * 3.0, z1 - 4], b: [gx + sx * 3.0, 64], h: 1.9, y: 0 }); }
// the Kannon-den facing the pond, the Tōgu-dō facing it from the west
E.push({ t: 'kannon_den', at: GINKAKU.kannon, y: 0, facing: 's' });
E.push({ t: 'togudo', at: GINKAKU.togudo, y: 0, facing: 'e' });
// the court of gravel before the pavilion, with a path of stones to the Tōgu-dō
E.push({ t: 'lane', rect: [GINKAKU.kannon[0] - 14, GINKAKU.kannon[1] + 7.6, GINKAKU.kannon[0] + 14, GINKAKU.kannon[1] + 11], y: 0.02, mat: 'flagstone' });
for (const [x, z, s] of [[170, -16, 1], [232, -16, 1], [150, 38, 0.9], [244, 30, 0.9], [GINKAKU.togudo[0] + 9, GINKAKU.togudo[1] + 6, 0.8]]) E.push({ t: 'ishidoro', at: [x, z], y: 0, s });
for (const [x, z] of [[120, 50], [276, 60], [276, -60], [120, -60]]) E.push({ t: 'niwaki', at: [x, z], y: 0, h: 5.5, seed: Math.round(x + z) });

// the garden (docs §3): the sand platform Ginshadan and its cone Kogetsudai west of the pavilion's court, moss under the trees,
// stepping stones to the pavilion, pines and a maple on the bank. (The Ginshadan and Kogetsudai are Edo-period additions in the record;
// shown here at the brief's request as the garden's signature.)
E.push({ t: 'ginshadan', rect: [150, -31, 183, -15], y: 0, seed: 3, kogetsudai: [167, -23] });
E.push({ t: 'stepping_stones', a: [kx0 - 2, -12.8], b: [148, -12.8], y: 0, seed: 4 });
for (const [x, z, r, n] of [[165, -40, 11, 16], [232, -38, 12, 16], [214, -14, 5, 6], [186, -34, 6, 8], [250, -10, 9, 10], [150, 22, 8, 8], [250, 22, 8, 8], [200, 36, 14, 14]]) E.push({ t: 'moss_bed', at: [x, z], r, n, y: 0, seed: Math.round(x * 3 + z) });
for (const [x, z, h] of [[154, -33, 6.5], [176, -35, 6], [226, -33, 7], [246, -26, 6.5], [150, -10, 5.5], [252, 4, 6], [156, 14, 5.5], [244, 14, 5.5], [232, 14, 5]]) E.push({ t: 'niwaki', at: [x, z], y: 0, h, seed: Math.round(x * 5 + z) });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const [tx, tz] = GINKAKU.togudo;
const [kx, kz] = GINKAKU.kannon;
const rooms = [room('togudo', [tx - 3.5, tz - 3.5, tx + 3.5, tz + 3.5], 0.7, 'hall'), room('kannon-den', [kx - 4.9, kz - 3.9, kx + 4.9, kz + 3.7], 0.9, 'hall'), room('chounkaku', [kx - 3.0, kz - 1.95, kx + 3.0, kz + 1.95], 4.3, 'hall'), room('ginkaku', GINKAKU.rect, 0, 'open')];
const walks = [[[gx, z1 + 10], [gx, z1 - 6], [gx, 56], [P.c[0] - P.r[0] - 4.5, 56], [P.c[0] - P.r[0] - 4.2, 14], [tx + 7, tz + 4], [tx + 7, tz], [tx + 3.5, tz], [tx + 2.2, tz - 2.0], [tx, tz - 2.0]]];
walks[0].y0 = 0;
walks.push([[kx, kz + 14], [kx, kz + 9], [kx, kz + 6.6], [kx, kz + 4.6], [kx, kz + 2.5], [kx + 4.5, kz + 1.1], [kx + 2.0, kz + 1.1], [kx - 0.3, kz + 1.1], [kx - 1.6, kz + 1.0], [kx - 1.8, kz - 0.6]]);
walks[1].y0 = 0;

// the houses with an opened upper room (docs §11): from the street through the earth passage, up the ladder-stair, across the room to its window
// (house frame: front +z; the world point of a local [x, z] as the style's `local` makes it, mirrored houses included)
const TH = { s: 0, e: Math.PI / 2, n: Math.PI, w: -Math.PI / 2 };
for (const l of lots()) {
  if (!l.up) continue;
  const th = TH[l.facing], co = Math.round(Math.cos(th)), si = Math.round(Math.sin(th)), mir = ((l.seed >>> 4) & 1) === 1;
  const P = ([x, z]) => { if (mir) x = -x; return [l.at[0] + x * co + z * si, l.at[1] - x * si + z * co]; };
  const hw = l.w / 2, x1 = hw - 1.6, qm = Math.min(4.2, l.d * 0.4), S = stairAt(qm), xc = upWindows(l.w, x1).slice(-1)[0], xl = x1 - 0.7;
  void dims;
  const r = [[hw - 1.25, 3.5], [hw - 1.25, -1.0], [hw - 1.25, S.foot - 0.5], [xl, S.foot - 0.5], [xl, S.foot + 0.8], [xl, S.top + 0.6], [xl, -0.9], [xc, -0.9]].map(P);
  r.y0 = 0;
  walks.push(r);
}

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
