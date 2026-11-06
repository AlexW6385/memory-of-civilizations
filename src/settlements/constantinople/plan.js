// The first hill of Constantinople about 562 (docs/settlements/constantinople.md §2–§4): Hagia
// Sophia (the full building of the previous design, src/buildings/hagia-sophia); round it, in the
// Roman manner of the city, the Augustaion with its porticoes, Hagia Eirene, the Baths of
// Zeuxippus, the Hippodrome, the Great Palace's courts and halls, the Forum of Constantine with
// its column on the Mese.

import { AUGUSTAION, EIRENE, ZEUXIPPUS, HIPPODROME, PALACE, MESE, MILION, FORUM, height } from './layout.js';
import sophiaPlan from '../../buildings/hagia-sophia/plan.js';

const E = [];
E.push({ t: 'porticus', rect: AUGUSTAION, h: 7, depth: 6 });
// the column of Justinian on the Augustaion's west side, his horse facing east
E.push({ t: 'honor_column', kind: 'justinian', at: [AUGUSTAION[0] + 24, AUGUSTAION[1] + 32], y: 0, h: 34, d: 3.2 });
// Hagia Eirene: the domed basilica (57 × 32 m) with its atrium on the west
E.push({ t: 'domed_basilica', rect: [EIRENE[0] + 23, -138.5, EIRENE[2], -106.5], atrium: 23, y: 0 });
E.push({ t: 'thermae', rect: ZEUXIPPUS, h: 20 });
// the Hippodrome: the carceres at the north end by the Mese, the sphendone curving at the south
{
  const [x0, z0, x1, z1] = HIPPODROME, t = 26, ax0 = x0 + t, ax1 = x1 - t, cx = (ax0 + ax1) / 2;
  E.push({ t: 'stadium', rect: HIPPODROME, h: 18, depth: t, rows: 12, y: 0, curve: 's', gates: 12 });
  const sa = z0 + t + 46, sb = z1 - t - (ax1 - ax0) / 2 - 20, along = (d) => sa + d;
  E.push({ t: 'spina', a: [cx, sa], b: [cx, sb], y: 0, w: 5, skip: [16, 40, 80, 112, 132] });
  E.push({ t: 'obelisk', at: [cx, along(40)], y: 0 });
  E.push({ t: 'serpent_column', at: [cx, along(80)], y: 1.3 });
  for (const d of [16, 112, 132]) E.push({ t: 'charioteer_statue', at: [cx, along(d)], y: 1.3, rot: -Math.PI / 2 });
  E.push({ t: 'kathisma', rect: [ax1, along(52) - 12, x1 - 2, along(52) + 12], face: 'w', y: 0, h: 18 });
}
// the Great Palace: courts with porticoes and halls on terraces stepping down toward the sea
for (const [r, kind] of [[[60, 140, 150, 220], 'porticus'], [[160, 150, 250, 230], 'thermae'], [[70, 235, 160, 325], 'thermae'], [[170, 240, 255, 325], 'porticus']]) {
  const y = height(r[2], r[3]);
  E.push({ t: 'block', rect: r, y0: y - 3, y1: y, mat: 'limestone', walk: true });
  E.push(kind === 'porticus' ? { t: 'porticus', rect: r, h: 8, depth: 6, y } : { t: 'thermae', rect: r, h: 18, y });
}
// the Milion over the start of the Mese
E.push({ t: 'milion', at: MILION, y: height(...MILION), w: 11 });
// the Forum of Constantine: a round porticoed square and the porphyry column with his statue
E.push({ t: 'honor_column', kind: 'constantine', at: FORUM.c, y: height(...FORUM.c), h: 30, d: 3.2 });
for (let k = 0; k < 24; k++) {
  const a = k / 24 * Math.PI * 2, x = FORUM.c[0] + Math.cos(a) * FORUM.r, z = FORUM.c[1] + Math.sin(a) * FORUM.r;
  if (Math.abs(z - MESE.path[3][1]) < MESE.w / 2 + 1) continue;                  // the Mese passes through
  E.push({ t: 'column', at: [x, z], y: height(x, z), h: 8, d: 0.8, mat: 'marble' });
}
// the Mese's porticoes, both sides of each leg; open between the Milion and the Augustaion (the
// square, and the view to Hagia Sophia from the arrival), at the corners and in the forum
const P = MESE.path;
for (let i = 0; i < P.length - 1; i++) {
  const [ax, az] = P[i], [bx, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  for (let d = 4; d < L - 4; d += 4.5) for (const s of [-1, 1]) {
    const o = MESE.w / 2 + 1, x = ax + ux * d - uz * s * o, z = az + uz * d + ux * s * o;
    if (Math.hypot(x - FORUM.c[0], z - FORUM.c[1]) < FORUM.r + 4 || (i === 0 && x > MILION[0] - 12)) continue;   // open from the Milion to the Augustaion
    if (P.slice(1, -1).some(([px, pz]) => Math.hypot(x - px, z - pz) < 10) || Math.hypot(x - P[0][0], z - P[0][1]) < 6) continue;
    E.push({ t: 'column', at: [x, z], y: height(x, z), h: 6, d: 0.6, mat: 'marble' });
  }
}

export const city = {
  id: 'constantinople-city',
  name: { en: 'The first hill', zh: '第一山丘' },
  era: { en: 'Constantinople, about 562', zh: '君士坦丁堡，约562年' },
  style: 'roman',
  origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [-150, 110], facing: 'e' },
  bounds: [-400, -160, 262, 362],
  elements: E,
  rooms: [],
};
export const sophia = { ...sophiaPlan, origin: [0, 0], base: 0, district: undefined, view: [-50, -51, 42, 38] };
export default sophia;
