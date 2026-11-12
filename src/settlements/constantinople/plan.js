// The first hill of Constantinople about 562 (docs/settlements/constantinople.md §2–§4): Hagia
// Sophia (the full building of the previous design, src/buildings/hagia-sophia); round it, in the
// Roman manner of the city, the Augustaion with its porticoes, Hagia Eirene, the Baths of
// Zeuxippus, the Hippodrome, the Great Palace's courts and halls, the Forum of Constantine with
// its column on the Mese; the Senate house and the Chalke on the Augustaion; the Mese's porticoes.

import { AUGUSTAION, EIRENE, ZEUXIPPUS, HIPPODROME, PALACE, MESE, MILION, FORUM, SENATE, CHALKE, height } from './layout.js';
import sophiaPlan from '../../buildings/hagia-sophia/plan.js';

const E = [];
// the Augustaion: porticoes on its west and south sides (open at the corners and toward Hagia Sophia),
// the Senate house on its east side, the Chalke at its south-east corner (§4.4)
E.push({ t: 'stoa', a: [AUGUSTAION[0] + 6, AUGUSTAION[1] + 12], b: [AUGUSTAION[0] + 6, AUGUSTAION[3] - 15], side: 1, depth: 6, h: 7, d: 0.75, spacing: 3.9, back: true });
E.push({ t: 'stoa', a: [AUGUSTAION[0] + 16, AUGUSTAION[3] - 6], b: [AUGUSTAION[2] - 26, AUGUSTAION[3] - 6], side: 1, depth: 6, h: 7, d: 0.75, spacing: 3.9, back: true });
E.push({ t: 'senate', rect: SENATE, y: 0, porch: 12, h: 18 });
E.push({ t: 'chalke', c: CHALKE.c, y: 0 });
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
// the Forum of Constantine: the porphyry column with his statue in the middle; the ring of porticoes in
// two storeys; the two arches of Proconnesian marble where the Mese enters and leaves it (§4.6)
E.push({ t: 'honor_column', kind: 'constantine', at: FORUM.c, y: height(...FORUM.c), h: 30, d: 3.2 });
{
  const zM = MESE.path[3][1], dx = Math.sqrt(39.5 ** 2 - (zM - FORUM.c[1]) ** 2), half = 5.5 + 3.6;
  const ang = (x, z) => Math.atan2(z - FORUM.c[1], x - FORUM.c[0]) * 180 / Math.PI;
  const xe = FORUM.c[0] + dx, xw = FORUM.c[0] - dx, zs = zM + half, zn = zM - half, xz = (z) => Math.sqrt(39.5 ** 2 - (z - FORUM.c[1]) ** 2);
  const e0 = ang(FORUM.c[0] + xz(zn), zn) - 0.35, e1 = ang(FORUM.c[0] + xz(zs), zs) + 0.3;
  E.push({ t: 'forum_ring', c: FORUM.c, r: FORUM.r, depth: 6, y: height(...FORUM.c), gaps: [[e0, e1], [180 - e1, 180 - e0]] });
  E.push({ t: 'forum_arch', at: [xe, zM], u: [1, 0], w: 11, depth: 6, y: height(xe, zM) });
  E.push({ t: 'forum_arch', at: [xw, zM], u: [1, 0], w: 11, depth: 6, y: height(xw, zM), statues: true });
}
// the Mese's porticoes with the shops behind them (§4.5): open between the Milion and the Augustaion and
// at the corners; on the south of the first leg a shallow portico against the Baths of Zeuxippus, on the
// west of the second a portico backed by a wall along the Hippodrome
export const MESE_STOAS = [
  { a: [-112, 103], b: [-170, 103], side: 1, shops: 5 },
  { a: [-102, 117], b: [-170, 117], side: -1, depth: 2.4 },
  { a: [-173, 100], b: [-173, 50], side: 1, shops: 5 },
  { a: [-187, 100], b: [-187, 50], side: -1, back: true },
  { a: [-190, 33], b: [-296, 33], side: 1, shops: 5 },
  { a: [-190, 47], b: [-296, 47], side: -1, shops: 5 },
  // the forecourt south of Hagia Sophia (layout.js FORECOURT): a row of shops under a portico on either side, their doors on the court
  { a: [-54, 50], b: [-54, 92], side: 1, shops: 5 },
  { a: [42, 94], b: [42, 50], side: 1, shops: 5 },
];
for (const s of MESE_STOAS) E.push({ t: 'stoa', y: height(...s.a), depth: 5, h: 6, d: 0.62, spacing: 3.8, ...s });

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
