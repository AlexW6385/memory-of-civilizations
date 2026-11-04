// Ahu Tongariki and Rano Raraku about 1500 (docs/settlements/rapa-nui.md §2–§4): the platform with
// fifteen moai facing inland, some with pukao; the plaza; the quarry's moai on the cone's slopes,
// half-cut and lying, or standing buried to the shoulders; the crater lake.

import { AHU, PLAZA, RARAKU, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const E = [], rand = rng(15);
E.push({ t: 'ahu', rect: AHU.rect, h: AHU.h, facing: 'n', ramp: 14 });
for (let i = 0; i < 15; i++) {
  const x = AHU.rect[0] + 3 + i * (AHU.rect[2] - AHU.rect[0] - 6) / 14, h = 5.6 + rand() * 2.8 + (i === 7 ? 1.4 : 0);
  E.push({ t: 'moai', at: [x, (AHU.rect[1] + AHU.rect[3]) / 2], y: AHU.h, h, facing: 'n', pukao: rand() < 0.45 });
}
E.push({ t: 'floor', rect: PLAZA, y: 0.12, th: 0.4, mat: 'pebbles', walk: true });
// the quarry: on the cone's south and east outer slopes, moai standing buried to the shoulders
const [rx, rz] = RARAKU.c;
for (let k = 0; k < 22; k++) {
  const a = Math.PI * (0.05 + 0.6 * rand()), d = RARAKU.r * (0.72 + 0.25 * rand()), x = rx + Math.cos(a) * d, z = rz + Math.sin(a) * d;
  const yaw = Math.atan2(-(x - rx), -(z - rz)) + Math.PI + (rand() - 0.5) * 0.6;
  E.push({ t: 'moai', at: [x, z], y: height(x, z), h: 6 + rand() * 4, facing: yaw, buried: 2.5 + rand() * 1.5 });
}
// moai half-cut, lying in the rock higher up, and one being moved toward the coast
for (let k = 0; k < 8; k++) {
  const a = Math.PI * (0.1 + 0.5 * rand()), d = RARAKU.r * (0.48 + 0.1 * rand()), x = rx + Math.cos(a) * d, z = rz + Math.sin(a) * d;
  E.push({ t: 'moai', at: [x, z], y: height(x, z) - 0.6, h: 7 + rand() * 6, facing: Math.atan2(x - rx, z - rz) + Math.PI, lie: true, tilt: 0.35 });
}
E.push({ t: 'moai', at: [-40, -10], y: height(-40, -10), h: 6.5, facing: 'n', lie: true });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('plaza', PLAZA, 0.12, 'open')];
const walks = [[[0, 20], [0, 60], [0, 84]]];
walks[0].y0 = height(0, 20);

export const tongariki = {
  id: 'rapa-nui-tongariki',
  name: { en: 'Ahu Tongariki and Rano Raraku', zh: '汤加里基石台与拉诺拉拉库' },
  era: { en: 'Rapa Nui, about 1500', zh: '拉帕努伊，约1500年' },
  style: 'rapanui',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 40], facing: 's' },
  bounds: [-220, -220, 60, 125],
  view: [-30, 70, 30, 106],
  bakeTop: 80,
  elements: E,
  rooms,
  walks,
};
export default tongariki;
