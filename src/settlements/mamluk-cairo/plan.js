// Sultan Hasan and the Citadel about 1363 (docs/settlements/mamluk-cairo.md §2–§4).
import { HASAN, CITADEL, ROAD, roadAt, height } from './layout.js';

const E = [];
// the court's four iwans, the qibla iwan (south here) the greatest; the way in from the portal: the domed vestibule,
// then the passage bent east through the north range to the court's corner
E.push({ t: 'madrasa_block', rect: HASAN.rect, h: 36, court: HASAN.court, portal: 'n',
  iwans: [{ rect: [-10, 56, 10, 72], open: 'n', W: 20, D: 16, ys: 14.5, qibla: true }, { rect: [-7, 15, 7, 24], open: 's', W: 14, D: 9, ys: 11 },
    { rect: [-24, 34, -17, 46], open: 'e', W: 12, D: 7, ys: 9.5 }, { rect: [17, 34, 24, 46], open: 'w', W: 12, D: 7, ys: 9.5 }],
  entry: [[-41.5, 6, -33.5, 14, 11.5], [-39, 14, -36, 18], [-39, 18, -14, 21], [-17, 21, -14, 24]] });
E.push({ t: 'madrasa_block', rect: HASAN.tomb, h: 30, portal: 's' });
E.push({ t: 'mamluk_dome', c: [(HASAN.tomb[0] + HASAN.tomb[2]) / 2, (HASAN.tomb[1] + HASAN.tomb[3]) / 2], r: 10.5, y: 30 });
for (const s of [-1, 1]) E.push({ t: 'mamluk_minaret', c: [s * 22, 92], h: 81, r: 3.2 });
// the Citadel: its curtain on the spur with round towers, the gate at the road's head (the north-west, Bab
// al-Mudarraj's side); the road up round the spur's western face, walled; the mosque of al-Nasir Muhammad
// (63 × 57 m round its court, the sanctuary on the qibla side) with its two minarets
const [cx, cz] = CITADEL.c, R = CITADEL.r - 8, T = CITADEL.top, n = 10, D2R = Math.PI / 180;
const vtx = (k) => [cx + Math.cos(k / n * Math.PI * 2) * R, cz + Math.sin(k / n * Math.PI * 2) * R];
const gateK = Math.floor(ROAD.a1 / 360 * n);
for (let k = 0; k < n; k++) {
  const a = vtx(k), b = vtx(k + 1), el = { t: 'citadel_wall', a, b, h: 12, th: 3, y: T };
  if (k === gateK) {
    // where the ray at the road's last angle crosses this side
    const dx = Math.cos(ROAD.a1 * D2R), dz = Math.sin(ROAD.a1 * D2R), ex = b[0] - a[0], ez = b[1] - a[1];
    el.gate = ((a[0] - cx) * dz - (a[1] - cz) * dx) / (ez * dx - ex * dz);
  }
  E.push(el);
}
// the road's walls: a parapet on the outer edge where it stands above the slope, a revetment on the inner edge where it is cut into it
for (let a = ROAD.a0 + 2; a < ROAD.a1 - 2; a += 4) {
  const seg = (dr) => [a, a + 4].map((aa) => { const [r, yy] = roadAt(Math.min(aa, ROAD.a1)); return [cx + Math.cos(aa * D2R) * (r + dr), cz + Math.sin(aa * D2R) * (r + dr), yy]; });
  const o = seg(ROAD.w + 0.3), i = seg(-ROAD.w - 0.3);
  const drop = Math.max(...o.map(([x, z, yy]) => yy - height(x, z))), cut = Math.max(...i.map(([x, z, yy]) => height(x, z) - yy));
  if (drop > -0.5) E.push({ t: 'road_wall', pts: o, th: 0.6, below: Math.min(9, Math.max(1, drop + 1)), above: 0.9 });
  if (cut > 0.4) E.push({ t: 'road_wall', pts: i, th: 0.8, below: 1, above: Math.min(8, cut + 0.4) });
}
E.push({ t: 'madrasa_block', rect: [cx - 31.5, cz - 28.5, cx + 31.5, cz + 28.5], h: 14, court: [cx - 17.9, cz - 18, cx + 17.9, cz + 5.3], portal: 'w', y: T });
E.push({ t: 'nasir_minaret', c: [cx - 28.8, cz - 8.5], h: 36, r: 2.2, kind: 'nw', y: T });
E.push({ t: 'nasir_minaret', c: [cx + 28.8, cz - 25.8], h: 42, r: 2.4, kind: 'ne', y: T });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('qibla iwan', [-10, 56, 10, 72], 0, 'hall'), room('court', HASAN.court, 0, 'open')];
const walks = [[[-37.5, -60], [-37.5, 2]]];
walks[0].y0 = 0;
export const hasan = {
  id: 'mamluk-cairo-hasan',
  name: { en: 'The Madrasa of Sultan Hasan', zh: '苏丹哈桑清真寺经学院' },
  era: { en: 'Mamluk Cairo, about 1363', zh: '马穆鲁克开罗，约1363年' },
  style: 'mamluk',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-37.5, -30], facing: 's' },
  bounds: [-80, -10, cx + R + 8, 110],
  view: [-78, 3, 78, 109],
  bakeTop: 90,
  elements: E,
  rooms,
  walks,
};
export default hasan;
