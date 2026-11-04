// The first hill of Constantinople about 562 (docs/settlements/constantinople.md §2–§4): Hagia
// Sophia (the full building of the previous design, src/buildings/hagia-sophia); round it, in the
// Roman manner of the city, the Augustaion with its porticoes, Hagia Eirene, the Baths of
// Zeuxippus, the Hippodrome, the Great Palace's courts and halls, the Forum of Constantine with
// its column on the Mese.

import { AUGUSTAION, EIRENE, ZEUXIPPUS, HIPPODROME, PALACE, MESE, FORUM, height } from './layout.js';
import sophiaPlan from '../../buildings/hagia-sophia/plan.js';

const E = [];
E.push({ t: 'porticus', rect: AUGUSTAION, h: 7, depth: 6 });
E.push({ t: 'column', at: [AUGUSTAION[0] + 50, AUGUSTAION[1] + 32], y: 0, h: 30, d: 2.4, mat: 'porphyry' });   // the column of Justinian
E.push({ t: 'thermae', rect: EIRENE, h: 26 });
E.push({ t: 'thermae', rect: ZEUXIPPUS, h: 20 });
E.push({ t: 'stadium', rect: HIPPODROME, h: 18, depth: 26, rows: 12, y: 0 });
// the Great Palace: courts with porticoes and halls on terraces stepping down toward the sea
for (const [r, kind] of [[[60, 140, 150, 220], 'porticus'], [[160, 150, 250, 230], 'thermae'], [[70, 235, 160, 325], 'thermae'], [[170, 240, 255, 325], 'porticus']]) {
  const y = height(r[2], r[3]);
  E.push({ t: 'block', rect: r, y0: y - 3, y1: y, mat: 'limestone', walk: true });
  E.push(kind === 'porticus' ? { t: 'porticus', rect: r, h: 8, depth: 6, y } : { t: 'thermae', rect: r, h: 18, y });
}
// the Forum of Constantine: a round porticoed square and its porphyry column
E.push({ t: 'column', at: FORUM.c, y: height(...FORUM.c), h: 32, d: 3, mat: 'porphyry' });
for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; E.push({ t: 'column', at: [FORUM.c[0] + Math.cos(a) * FORUM.r, FORUM.c[1] + Math.sin(a) * FORUM.r], y: 0, h: 8, d: 0.8, mat: 'marble' }); }
// the Mese's porticoes
for (let x = MESE.x0 + 40; x < MESE.x1; x += 4.5) for (const s of [-1, 1]) if (Math.hypot(x - FORUM.c[0], MESE.z + s * 9 - FORUM.c[1]) > FORUM.r + 4) E.push({ t: 'column', at: [x, MESE.z + s * (MESE.w / 2 + 1)], y: height(x, MESE.z), h: 6, d: 0.6, mat: 'marble' });

export const city = {
  id: 'constantinople-city',
  name: { en: 'The first hill', zh: '第一山丘' },
  era: { en: 'Constantinople, about 562', zh: '君士坦丁堡，约562年' },
  style: 'roman',
  origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [-150, 150], facing: 'e' },
  bounds: [-400, -160, 262, 362],
  elements: E,
  rooms: [],
};
export const sophia = { ...sophiaPlan, origin: [0, 0], base: 0, district: undefined, view: [-50, -51, 42, 38] };
export default sophia;
