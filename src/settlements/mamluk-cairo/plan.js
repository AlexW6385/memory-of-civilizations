// Sultan Hasan and the Citadel about 1363 (docs/settlements/mamluk-cairo.md §2–§4).
import { HASAN, CITADEL } from './layout.js';

const E = [];
// the court's four iwans, the qibla iwan (south here) the greatest; the way in from the portal through the north range to the court's corner
E.push({ t: 'madrasa_block', rect: HASAN.rect, h: 36, court: HASAN.court, portal: 'n',
  iwans: [{ rect: [-10, 56, 10, 72], open: 'n', W: 20, D: 16, ys: 14.5, qibla: true }, { rect: [-7, 15, 7, 24], open: 's', W: 14, D: 9, ys: 11 },
    { rect: [-24, 34, -17, 46], open: 'e', W: 12, D: 7, ys: 9.5 }, { rect: [17, 34, 24, 46], open: 'w', W: 12, D: 7, ys: 9.5 }],
  entry: [[-39, 6, -36, 21], [-39, 18, -14, 21], [-17, 18, -14, 24]] });
E.push({ t: 'madrasa_block', rect: HASAN.tomb, h: 30, portal: 's' });
E.push({ t: 'mamluk_dome', c: [(HASAN.tomb[0] + HASAN.tomb[2]) / 2, (HASAN.tomb[1] + HASAN.tomb[3]) / 2], r: 10.5, y: 30 });
for (const s of [-1, 1]) E.push({ t: 'mamluk_minaret', c: [s * 22, 92], h: 81, r: 3.2 });
// the Citadel: its wall on the spur, the mosque of al-Nasir Muhammad inside
const [cx, cz] = CITADEL.c, R = CITADEL.r - 8, T = CITADEL.top, n = 10;
for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2; E.push({ t: 'citadel_wall', a: [cx + Math.cos(a0) * R, cz + Math.sin(a0) * R], b: [cx + Math.cos(a1) * R, cz + Math.sin(a1) * R], h: 12, th: 3, y: T }); }
E.push({ t: 'madrasa_block', rect: [cx - 30, cz - 32, cx + 30, cz + 32], h: 14, court: [cx - 18, cz - 18, cx + 18, cz + 18], portal: 'w', y: T });
for (const [mx, mz] of [[cx - 30, cz - 32], [cx + 30, cz - 32]]) E.push({ t: 'mamluk_minaret', c: [mx, mz], h: 40, r: 2.4, y: T });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('qibla iwan', [-10, 56, 10, 72], 0, 'hall'), room('court', HASAN.court, 0, 'open')];
const walks = [[[-37, -30], [-37, 2]]];
walks[0].y0 = 0;
export const hasan = {
  id: 'mamluk-cairo-hasan',
  name: { en: 'The Madrasa of Sultan Hasan', zh: '苏丹哈桑清真寺经学院' },
  era: { en: 'Mamluk Cairo, about 1363', zh: '马穆鲁克开罗，约1363年' },
  style: 'mamluk',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-37, -30], facing: 's' },
  bounds: [-80, -10, cx + R + 8, 110],
  view: [-78, 3, 78, 109],
  bakeTop: 90,
  elements: E,
  rooms,
  walks,
};
export default hasan;
